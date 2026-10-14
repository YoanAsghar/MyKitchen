using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyKitchen.Models;
using MyKitchen.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using MyKitchen.Hubs;
using MyKitchen.Services;

namespace MyKitchen.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class TableController : RestaurantScopedController
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<RestaurantHub> _hubContext;

    public TableController(ApplicationDbContext context, IHubContext<RestaurantHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }
    //
    // GET FOR THE TABLES (own restaurant only, each with its open order)
    //
    [HttpGet]
    public async Task<ActionResult<List<TableResponseDto>>> GetTables()
    {
        var tables = await _context.Tables
            .Where(t => t.RestaurantId == CurrentRestaurantId)
            .AsNoTracking()
            .ToListAsync();

        // Attach each table's current OPEN order (if any) so every client
        // boots with the same "who has an active order" picture. Group defensively:
        // a race or pre-existing data could leave more than one OPEN order on a
        // table, and ToDictionary would otherwise throw (500). Keep the latest.
        var openOrders = await OrderProjection.Project(_context.Orders
            .Where(o => o.Status == OrderStatus.OPEN && o.TableId != null && o.RestaurantId == CurrentRestaurantId))
            .ToListAsync();

        var openByTable = openOrders
            .GroupBy(o => o.TableId!.Value)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(o => o.Id).First());

        var result = tables.Select(t => new TableResponseDto
        {
            Id = t.Id,
            TableNumber = t.TableNumber,
            Order = openByTable.TryGetValue(t.Id, out var order) ? order : null
        }).ToList();

        return Ok(result);
    }

    //
    // POST FOR THE TABLES (stamped with the caller's restaurant)
    //
    [HttpPost]
    public async Task<ActionResult> CreateTable(Table table)
    {
        if (table.TableNumber == null)
        {
            return BadRequest("Table number is required");
        }

        // The scope always follows the caller; never a client-sent id.
        table.RestaurantId = CurrentRestaurantId;
        _context.Tables.Add(table);
        await _context.SaveChangesAsync();

        // Tell every connected client of this restaurant that a new table
        // exists so all of them add it to their floor in real-time.
        await _hubContext.Clients.Group(RestaurantHub.GroupFor(CurrentRestaurantId))
            .SendAsync(HubEvents.TableCreated, table);

        return Ok(table);
    }

    //
    // DELETE FOR THE TABLES (own restaurant only)
    //
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteTable(int id)
    {
        var tableToDelete = await _context.Tables
            .FirstOrDefaultAsync(t => t.Id == id && t.RestaurantId == CurrentRestaurantId);
        if (tableToDelete == null)
        {
            return NotFound($"Table with id {id} doesn't exist");
        }

        _context.Tables.Remove(tableToDelete);

        // Removing a table must also clear its in-progress order(s) so no orphan
        // OPEN order lingers in /Order/active (and therefore in Cocina). Collapse
        // any strays: races/pre-existing data could leave more than one OPEN
        // order on a table, and leaving them behind would strand ghost orders.
        var openOrders = await _context.Orders
            .Where(o => o.TableId == id && o.Status == OrderStatus.OPEN && o.RestaurantId == CurrentRestaurantId)
            .ToListAsync();
        if (openOrders.Count > 0)
        {
            _context.Orders.RemoveRange(openOrders);
        }

        try
        {
            await _context.SaveChangesAsync();

            // Real-time table removal: every connected client of this
            // restaurant drops the table from its local list.
            await _hubContext.Clients.Group(RestaurantHub.GroupFor(CurrentRestaurantId))
                .SendAsync(HubEvents.TableDeleted, new { tableId = id });

            if (openOrders.Count > 0)
            {
                await _hubContext.Clients.Group(RestaurantHub.GroupFor(CurrentRestaurantId))
                    .SendAsync(HubEvents.OrderClosed, new { tableId = id });
            }
            return Ok(tableToDelete);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error deleting table {ex}");
        }
    }
}
