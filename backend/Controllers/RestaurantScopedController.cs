using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MyKitchen.Models;

namespace MyKitchen.Controllers;

// Base class for every tenant-scoped controller. The authenticated user's
// restaurant scope comes from the "restaurantId" claim in the auth cookie —
// never from a client-sent id. Subclasses filter every query and stamp every
// new row with CurrentRestaurantId so a user can only see/touch their own
// restaurant's data.
public abstract class RestaurantScopedController : ControllerBase
{
    // Resolves the scope from the claim. A missing/invalid claim resolves to 0,
    // matching legacy unscoped rows (e.g. the seeded bootstrap admin).
    protected int CurrentRestaurantId =>
        int.TryParse(User.FindFirstValue(RestaurantClaims.Id), out var id) ? id : 0;

    // The authenticated user's own id, from the userId claim. Missing/invalid
    // resolves to 0; never trust a client-sent user id.
    protected int CurrentUserId =>
        int.TryParse(User.FindFirstValue(RestaurantClaims.UserId), out var id) ? id : 0;
}