using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;
using MyKitchen.Models;
using System.Security.Claims;

namespace MyKitchen.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class RestaurantController : RestaurantScopedController
{
    private readonly ApplicationDbContext _context;

    public RestaurantController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Shared validation for the restaurant profile fields (name, the owner's
    // password, encargado, email). Returns the first error message, or null
    // when valid. The password credentials belong to the Owner user created at
    // signup — the restaurant row itself no longer carries credentials.
    private static string? ValidateProfile(string? name, string? password, string? email, string? encargado)
    {
        if (string.IsNullOrWhiteSpace(name)) return "El nombre del restaurante es obligatorio";
        if (name.Length > 100) return "El nombre del restaurante es demasiado largo";
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return "La contraseña debe tener al menos 8 caracteres";
        if (string.IsNullOrWhiteSpace(encargado)) return "El nombre del encargado es obligatorio";
        if (string.IsNullOrWhiteSpace(email) || !IsValidEmail(email)) return "Ingresá un email válido";
        return null;
    }

    private static bool IsValidEmail(string email) =>
        new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email);

    private static RestaurantResponseDto ToDto(Restaurants r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        NombreDelEncargado = r.NombreDelEncargado,
        Email = r.Email,
        PhoneNumber = r.PhoneNumber,
        CreationDate = r.CreationDate
    };

    //
    // GET /api/v1/Restaurant
    // The current user's own restaurant (driven entirely by the cookie claim).
    //
    [HttpGet]
    public async Task<ActionResult<RestaurantResponseDto>> GetMyRestaurant()
    {
        var restaurantId = CurrentRestaurantId;
        if (restaurantId <= 0)
            return NotFound(new { message = "No hay un restaurante asociado a esta cuenta" });

        var restaurant = await _context.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == restaurantId);
        if (restaurant == null)
            return NotFound(new { message = "Restaurante no encontrado" });

        return Ok(ToDto(restaurant));
    }

    //
    // POST /api/v1/Restaurant/register
    // Anonymous signup: creates the restaurant + its Owner user atomically and
    // signs the Owner in (sets the AuthorizationCookies session cookie). The
    // Owner's username is the restaurant email; the Owner is who logs in — the
    // restaurant row itself stores no password.
    //
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult> Register([FromBody] RegisterRestaurantRequest request)
    {
        var profileError = ValidateProfile(request.Name, request.Password, request.Email, request.NombreDelEncargado);
        if (profileError != null)
            return BadRequest(new { message = profileError });

        var nameTaken = await _context.Restaurants
            .AnyAsync(r => r.Name.ToLower() == request.Name.ToLower());
        if (nameTaken)
            return Conflict(new { message = "El nombre del restaurante ya está registrado" });

        var emailTaken = await _context.Users
            .AnyAsync(u => u.UserName.ToLower() == request.Email.ToLower());
        if (emailTaken)
            return Conflict(new { message = "El email ya está en uso" });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);
        var ownerUserName = request.Email.Trim().ToLower();
        var restaurant = new Restaurants
        {
            Name = request.Name.Trim(),
            NombreDelEncargado = request.NombreDelEncargado.Trim(),
            Email = ownerUserName,
            PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty
        };
        _context.Restaurants.Add(restaurant);

        var ownerUser = new User
        {
            UserName = ownerUserName,
            PasswordHash = passwordHash,
            Role = Roles.Owner,
            RestaurantId = 0 // stamped after the restaurant is saved to get its Id
        };
        _context.Users.Add(ownerUser);

        // Atomic: the DB-generated Id is only known after the first save, and
        // User.RestaurantId is a plain column (no navigation), so two saves
        // share one transaction.
        // Atomic on relational providers (the in-memory test provider has no
        // transactions; there it's acceptable to save without one).
        await using var tx = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync()
            : null;
        try
        {
            await _context.SaveChangesAsync();
            ownerUser.RestaurantId = restaurant.Id;
            await _context.SaveChangesAsync();
            if (tx != null) await tx.CommitAsync();
        }
        catch
        {
            if (tx != null) await tx.RollbackAsync();
            return StatusCode(500, new { message = "No se pudo crear el restaurante" });
        }

        // Auto-login the new Owner so signup starts a working session.
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, ownerUser.UserName),
            new Claim(ClaimTypes.Role, ownerUser.Role),
            new Claim(RestaurantClaims.Id, ownerUser.RestaurantId.ToString()),
            new Claim(RestaurantClaims.UserId, ownerUser.Id.ToString())
        };
        var identity = new ClaimsIdentity(claims, "cookie");
        await HttpContext.SignInAsync("cookie", new ClaimsPrincipal(identity));

        return Ok(new
        {
            userId = ownerUser.Id,
            userName = ownerUser.UserName,
            role = ownerUser.Role,
            restaurantId = ownerUser.RestaurantId,
            restaurant = ToDto(restaurant)
        });
    }

    //
    // POST /api/v1/Restaurant
    // Provision a restaurant + its Owner user directly (admin-only bootstrap;
    // the register flow above is what the /home/registro form calls).
    //
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<RestaurantResponseDto>> CreateRestaurant([FromBody] RegisterRestaurantRequest request)
    {
        var profileError = ValidateProfile(request.Name, request.Password, request.Email, request.NombreDelEncargado);
        if (profileError != null)
            return BadRequest(new { message = profileError });

        var nameTaken = await _context.Restaurants
            .AnyAsync(r => r.Name.ToLower() == request.Name.ToLower());
        if (nameTaken)
            return Conflict(new { message = "El nombre del restaurante ya está registrado" });

        var emailTaken = await _context.Users
            .AnyAsync(u => u.UserName.ToLower() == request.Email.ToLower());
        if (emailTaken)
            return Conflict(new { message = "El email ya está en uso" });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);
        var ownerUserName = request.Email.Trim().ToLower();
        var restaurant = new Restaurants
        {
            Name = request.Name.Trim(),
            NombreDelEncargado = request.NombreDelEncargado.Trim(),
            Email = ownerUserName,
            PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty
        };
        _context.Restaurants.Add(restaurant);

        var ownerUser = new User
        {
            UserName = ownerUserName,
            PasswordHash = passwordHash,
            Role = Roles.Owner,
            RestaurantId = 0
        };
        _context.Users.Add(ownerUser);

        await using var tx = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync()
            : null;
        try
        {
            await _context.SaveChangesAsync();
            ownerUser.RestaurantId = restaurant.Id;
            await _context.SaveChangesAsync();
            if (tx != null) await tx.CommitAsync();
        }
        catch
        {
            if (tx != null) await tx.RollbackAsync();
            return StatusCode(500, new { message = "No se pudo crear el restaurante" });
        }

        return Ok(ToDto(restaurant));
    }

    //
    // PUT /api/v1/Restaurant/{id}
    // Update restaurant profile fields. Only the restaurant's own owner, per
    // the cookie claim, may do this — even a global admin is refused (OwnerOnly)
    // and cross-restaurant edits are refused. Changing the owner password is
    // intentionally not part of this endpoint. When the restaurant email
    // changes, the primary Owner user's login username (which = email at
    // signup) is kept in sync so the owner can still log in.
    //
    [HttpPut("{id:int}")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<RestaurantResponseDto>> UpdateRestaurant(int id, [FromBody] UpdateRestaurantRequest updatedData)
    {
        if (id != CurrentRestaurantId)
            return Forbid();

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == id);
        if (restaurant == null)
            return NotFound(new { message = "Restaurante no encontrado" });

        if (string.IsNullOrWhiteSpace(updatedData.Name))
            return BadRequest(new { message = "El nombre del restaurante es obligatorio" });
        if (string.IsNullOrWhiteSpace(updatedData.NombreDelEncargado))
            return BadRequest(new { message = "El nombre del encargado es obligatorio" });
        if (string.IsNullOrWhiteSpace(updatedData.Email) || !IsValidEmail(updatedData.Email))
            return BadRequest(new { message = "Ingresá un email válido" });

        var newEmail = updatedData.Email.Trim().ToLower();

        restaurant.Name = updatedData.Name.Trim();
        restaurant.NombreDelEncargado = updatedData.NombreDelEncargado.Trim();
        restaurant.PhoneNumber = updatedData.PhoneNumber?.Trim() ?? string.Empty;

        // The restaurant email doubles as its primary Owner's login username, so
        // a change must follow through to that User (otherwise the owner would
        // keep logging in with the old email). The primary owner is the one whose
        // username matches the current restaurant email.
        if (!string.Equals(restaurant.Email, newEmail, StringComparison.OrdinalIgnoreCase))
        {
            var primaryOwner = await _context.Users
                .FirstOrDefaultAsync(u => u.RestaurantId == id
                    && u.Role == Roles.Owner
                    && u.UserName.ToLower() == restaurant.Email.ToLower());

            if (primaryOwner != null)
            {
                // Usernames are login keys and unique across the whole app, so
                // the new email must not belong to another user.
                var emailTaken = await _context.Users
                    .AnyAsync(u => u.Id != primaryOwner.Id && u.UserName.ToLower() == newEmail);
                if (emailTaken)
                    return Conflict(new { message = "El email ya está en uso" });

                primaryOwner.UserName = newEmail;
            }

            restaurant.Email = newEmail;
        }

        await _context.SaveChangesAsync();
        return Ok(ToDto(restaurant));
    }

    //
    // DELETE /api/v1/Restaurant/{id}
    // Removes the restaurant and ALL its data (users, tables, products,
    // orders, order details, expenses). Manager-only and claim-scoped.
    //
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "ManagerOnly")]
    public async Task<IActionResult> DeleteRestaurant(int id)
    {
        if (id != CurrentRestaurantId)
            return Forbid();

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == id);
        if (restaurant == null)
            return NotFound(new { message = "Restaurante no encontrado" });

        var orders = await _context.Orders
            .Include(o => o.OrderDetail)
            .Where(o => o.RestaurantId == id)
            .ToListAsync();
        var tables = await _context.Tables.Where(t => t.RestaurantId == id).ToListAsync();
        var products = await _context.Products.Where(p => p.RestaurantId == id).ToListAsync();
        var expenses = await _context.Expenses.Where(e => e.RestaurantId == id).ToListAsync();
        var users = await _context.Users.Where(u => u.RestaurantId == id).ToListAsync();

        await using var tx = _context.Database.IsRelational()
            ? await _context.Database.BeginTransactionAsync()
            : null;
        try
        {
            _context.OrdersDetails.RemoveRange(orders.SelectMany(o => o.OrderDetail));
            _context.Orders.RemoveRange(orders);
            _context.Tables.RemoveRange(tables);
            _context.Products.RemoveRange(products);
            _context.Expenses.RemoveRange(expenses);
            _context.Users.RemoveRange(users);
            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();
            if (tx != null) await tx.CommitAsync();
        }
        catch
        {
            if (tx != null) await tx.RollbackAsync();
            return StatusCode(500, new { message = "No se pudo eliminar el restaurante" });
        }

        return Ok(new { message = "Restaurante eliminado", deletedId = id });
    }
}