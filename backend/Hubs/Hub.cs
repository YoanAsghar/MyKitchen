using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

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
    }

    [Authorize]
    public class RestaurantHub : Hub
    {
        // Broadcast triggers live in the controllers via IHubContext<RestaurantHub>;
        // client-callable methods (like this one) are available for direct pushes.
        public async Task SendOrderUpdated(object order)
        {
            await Clients.All.SendAsync(HubEvents.OrderUpdated, order);
        }
    }
}