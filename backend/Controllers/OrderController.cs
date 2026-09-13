using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyKitchen.Models;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;
using Microsoft.AspNetCore.SignalR;
using MyKitchen.Hubs;
using MyKitchen.Services;

namespace MyKitchen.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
[Authorize]
public class OrderController : RestaurantScopedController
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<RestaurantHub> _hubContext;

    public OrderController(ApplicationDbContext context, IHubContext<RestaurantHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    //
    // GET /api/v1/Order?date=yyyy-MM-dd
    // Completed (PAID) orders for a given day, enriched with items + products.
    // Drives the Ordenes history page. Open/in-progress orders are excluded.
    //
    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetOrders([FromQuery] DateOnly? date)
    {
        var filterDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var startDay = filterDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endDay = startDay.AddDays(1);

        var orders = await OrderProjection.Project(_context.Orders
                  .Where(o => o.Status == OrderStatus.PAID && o.RestaurantId == CurrentRestaurantId)
                  .Where(o => o.OrderDate >= startDay && o.OrderDate < endDay))
                  .OrderByDescending(o => o.Id)
                  .ToListAsync();

        return Ok(orders);
    }

    //
    // GET /api/v1/Order/active
    // All current (OPEN) orders across tables, enriched with items + products.
    // Seeds the global real-time state; the hub keeps it fresh afterwards.
    //
    [HttpGet("active")]
    public async Task<ActionResult<List<Order>>> GetActiveOrders()
    {
        var orders = await OrderProjection.Project(_context.Orders
                  .Where(o => o.Status == OrderStatus.OPEN && o.RestaurantId == CurrentRestaurantId))
                  .OrderBy(o => o.TableId)
                  .ToListAsync();

        return Ok(orders);
    }

    //
    // PUT /api/v1/Order/table/{tableId}
    // Upserts the OPEN order for a table. Empty payload clears it. Broadcasts
    // OrderUpdated/OrderClosed to the restaurant's clients so Mesas + Cocina sync.
    //
    [HttpPut("table/{tableId:int}")]
    public async Task<ActionResult<Order>> SaveOpenOrder(int tableId, [FromBody] SaveOpenOrderRequest request)
    {
        // The table must belong to the caller's restaurant; a foreign table is
        // neither pressable nor editable.
        var table = await _context.Tables
            .FirstOrDefaultAsync(t => t.Id == tableId && t.RestaurantId == CurrentRestaurantId);
        if (table == null)
        {
            return NotFound($"Table with id {tableId} doesn't exist");
        }

        var details = request.OrderDetail ?? new List<SaveOrderDetailRequest>();
        if (details.Any(d => d.ProductId <= 0 || d.Quantity <= 0))
        {
            return BadRequest("Order items must have a valid productId and a positive quantity");
        }

        if (details.Count == 0)
        {
            return await ClearOpenOrder(tableId);
        }

        var existingOrders = await _context.Orders
            .Include(o => o.OrderDetail)
            .Where(o => o.TableId == tableId && o.Status == OrderStatus.OPEN && o.RestaurantId == CurrentRestaurantId)
            .ToListAsync();
        var existing = existingOrders.FirstOrDefault();

        // Defensive: collapse any stray duplicates into a single OPEN order per
        // table (races/pre-existing data could have created more than one).
        foreach (var duplicate in existingOrders.Skip(1))
        {
            _context.Orders.Remove(duplicate);
        }

        var productIds = details.Select(d => d.ProductId).Distinct().ToList();
        // Products must belong to the caller's restaurant too, so a product
        // from another restaurant is rejected as "doesn't exist".
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id) && p.RestaurantId == CurrentRestaurantId)
            .AsNoTracking()
            .ToDictionaryAsync(p => p.Id);

        if (products.Count != productIds.Count)
        {
            return BadRequest("One or more products don't exist");
        }

        if (existing == null)
        {
            existing = new Order
            {
                TableId = tableId,
                RestaurantId = CurrentRestaurantId,
                Status = OrderStatus.OPEN,
                OrderDate = DateTime.UtcNow
            };
            _context.Orders.Add(existing);
        }

        existing.RestaurantId = CurrentRestaurantId;
        existing.Guests = request.Guests;
        existing.Tip = request.Tip;
        existing.PaymentMethod = request.PaymentMethod;
        existing.TotalPrice = details.Sum(d => (float)(products[d.ProductId].Price * d.Quantity)) + request.Tip;

        _context.OrdersDetails.RemoveRange(existing.OrderDetail);
        existing.OrderDetail = details.Select(d => new OrderDetail
        {
            ProductId = d.ProductId,
            Quantity = d.Quantity,
            RestaurantId = CurrentRestaurantId
        }).ToList();

        await _context.SaveChangesAsync();

        var enriched = await OrderProjection.Project(_context.Orders.Where(o => o.Id == existing.Id))
            .SingleOrDefaultAsync();

        await _hubContext.Clients.Group(RestaurantHub.GroupFor(CurrentRestaurantId))
            .SendAsync(HubEvents.OrderUpdated, enriched);

        return Ok(enriched);
    }

    //
    // POST /api/v1/Order
    // The waiter pays for a table: the order is persisted as PAID, the table's
    // OPEN order is cleared and the restaurant's clients are told it's now free.
    //
    [HttpPost]
    public async Task<ActionResult> CreateOrder(Order order)
    {
        if (order.OrderDetail == null || order.OrderDetail.Count == 0)
        {
            return BadRequest("At least one order item is required");
        }
        if (order.OrderDetail.Any(od => od.ProductId <= 0 || od.Quantity <= 0))
        {
            return BadRequest("Order items must have a valid productId and a positive quantity");
        }
        if (order.Guests < 0 || order.Tip < 0)
        {
            return BadRequest("Guests and tip cannot be negative");
        }

        order.Id = 0;
        order.Status = OrderStatus.PAID;

        // The caller's restaurant scope always wins; a client-sent RestaurantId
        // is never trusted. A referenced table must belong to this restaurant,
        // otherwise a foreign table's OPEN order could be paid/cleared.
        order.RestaurantId = CurrentRestaurantId;
        if (order.TableId is int orderTableId)
        {
            var table = await _context.Tables.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == orderTableId && t.RestaurantId == CurrentRestaurantId);
            if (table == null)
            {
                return NotFound($"Table with id {orderTableId} doesn't exist");
            }
        }
        foreach (var detail in order.OrderDetail)
        {
            detail.RestaurantId = CurrentRestaurantId;
        }

        _context.Orders.Add(order);

        if (order.TableId is int tableId)
        {
            var openOrders = await _context.Orders
                .Include(o => o.OrderDetail)
                .Where(o => o.TableId == tableId && o.Status == OrderStatus.OPEN && o.RestaurantId == CurrentRestaurantId)
                .ToListAsync();
            if (openOrders.Count > 0)
            {
                _context.Orders.RemoveRange(openOrders);
            }
        }

        await _context.SaveChangesAsync();

        if (order.TableId is int paidTableId)
        {
            await _hubContext.Clients.Group(RestaurantHub.GroupFor(CurrentRestaurantId))
                .SendAsync(HubEvents.OrderClosed, new { tableId = paidTableId });
        }

        return Ok(order);
    }

    private async Task<ActionResult<Order>> ClearOpenOrder(int tableId)
    {
        var openOrders = await _context.Orders
            .Include(o => o.OrderDetail)
            .Where(o => o.TableId == tableId && o.Status == OrderStatus.OPEN && o.RestaurantId == CurrentRestaurantId)
            .ToListAsync();

        if (openOrders.Count > 0)
        {
            _context.Orders.RemoveRange(openOrders);
            await _context.SaveChangesAsync();
        }

        await _hubContext.Clients.Group(RestaurantHub.GroupFor(CurrentRestaurantId))
            .SendAsync(HubEvents.OrderClosed, new { tableId });

        return Ok(new { tableId });
    }

}