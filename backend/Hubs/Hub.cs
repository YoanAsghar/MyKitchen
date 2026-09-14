using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MyKitchen.Models;

namespace MyKitchen.Hubs
{
    // Central registry of real-time event names so backend controllers and the
    // frontend (src/services/SignalRService.ts) stay in sync.
    public static class HubEvents
    {
        // Payload: the full open Order (OrderDetail + Product included).
        public const string OrderUpdated = "OrderUpdated";

        // Payload: { tableId: int }. The table's open order was paid/cleared.
        public const string OrderClosed = "OrderClosed";

        // Payload: the created Table (id, tableNumber, restaurantId). A table
        // was added for the restaurant; every connected client adds it.
        public const string TableCreated = "TableCreated";

        // Payload: { tableId: int }. The table was deleted; every connected
        // client removes it from its local list.
        public const string TableDeleted = "TableDeleted";
    }

    [Authorize]
    public class RestaurantHub : Hub
    {
        // Controllers broadcast to the group for the caller's restaurant so
        // real-time data never leaks across tenants.
        public static string GroupFor(int restaurantId) => $"restaurant-{restaurantId}";

        // Join the authenticated user's restaurant group on connect. The cookie
        // claim is the single source of truth for the scope.
        public override async Task OnConnectedAsync()
        {
            var restaurantId = Context.User?.FindFirstValue(RestaurantClaims.Id);
            if (!string.IsNullOrEmpty(restaurantId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, GroupFor(int.Parse(restaurantId)));
            }
            await base.OnConnectedAsync();
        }

        // Broadcast triggers live in the controllers via IHubContext<RestaurantHub>;
        // client-callable methods (like this one) are available for direct pushes.
        public async Task SendOrderUpdated(object order)
        {
            await Clients.All.SendAsync(HubEvents.OrderUpdated, order);
        }
    }
}