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
        // boots with the same "who has an active order" picture.
        var openOrders = await OrderProjection.Project(_context.Orders
            .Where(o => o.Status == OrderStatus.OPEN && o.TableId != null && o.RestaurantId == CurrentRestaurantId))
            .ToListAsync();

        var openByTable = openOrders.ToDictionary(o => o.TableId!.Value);

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

        // Removing a table must also clear its in-progress order so no orphan
        // OPEN order lingers in /Order/active (and therefore in Cocina).
        var openOrder = await _context.Orders
            .FirstOrDefaultAsync(o => o.TableId == id && o.Status == OrderStatus.OPEN && o.RestaurantId == CurrentRestaurantId);
        if (openOrder != null)
        {
            _context.Orders.Remove(openOrder);
        }

        try
        {
            await _context.SaveChangesAsync();
            if (openOrder != null)
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
