namespace MyKitchen.Models;

// Name of the claim that carries the authenticated user's restaurant scope in
// the auth cookie. Single source of truth for controllers and the SignalR hub;
// a restaurant id sent by a client is never trusted for authorization.
public static class RestaurantClaims
{
    public const string Id = "restaurantId";

    // Name of the claim that carries the authenticated user's own User.Id in
    // the auth cookie. Used to stamp authoring columns (e.g. Expense.CreatedByUserId)
    // from the server instead of trusting a client-sent id.
    public const string UserId = "userId";
}