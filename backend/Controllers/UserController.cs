using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;
using MyKitchen.Models;
using System.Security.Claims;
using BCrypt.Net;

namespace MyKitchen.Controllers
{

    [ApiController]
    [Route("api/v1/[controller]")]
    public class UserController : RestaurantScopedController
    {
        private readonly ApplicationDbContext _context;
        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        //
        // GET FOR THE USERS (any authenticated user, own restaurant only)
        //
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<User>>> GetUsers()
        {
            var users = await _context.Users
              .Where(u => u.RestaurantId == CurrentRestaurantId)
              .OrderBy(u => u.Id)
              .Select(u => new
              {
                  u.Id,
                  u.UserName,
                  u.Role
              })
              .ToListAsync();

            return Ok(users);
        }

        //
        // POST FOR THE USERS CREATION (manager only: restaurant owner or admin)
        //
        [HttpPost]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<ActionResult<User>> CreateUser([FromBody] User newUser)
        {

            //Verify that all data is correct
            if (string.IsNullOrWhiteSpace(newUser.UserName) || string.IsNullOrWhiteSpace(newUser.PasswordHash))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            // Verify if user exists
            var UserExists = await _context.Users.AnyAsync(u => u.UserName.ToLower() == newUser.UserName.ToLower());

            if (UserExists)
            {
                return Conflict(new { message = "Username already exists" });
            }

            // Roles are normalized within the caller's own capability: only a
            // global admin can mint an admin; an owner can create owners/staff;
            // anything else falls back to the base user role. This prevents
            // privilege escalation from within a restaurant.
            var callerRole = User.FindFirstValue(ClaimTypes.Role) ?? Roles.User;
            if (string.Equals(newUser.Role, Roles.Admin, StringComparison.OrdinalIgnoreCase))
                newUser.Role = callerRole == Roles.Admin ? Roles.Admin : Roles.User;
            else
                newUser.Role = string.Equals(newUser.Role, Roles.Owner, StringComparison.OrdinalIgnoreCase)
                    ? Roles.Owner
                    : Roles.User;
            // Users belong to the caller's restaurant, never to a client-sent id.
            newUser.RestaurantId = CurrentRestaurantId;
            newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newUser.PasswordHash, workFactor: 12);

            try
            {
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                newUser.PasswordHash = "";
                return Ok(newUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        //
        // POST FOR THE LOGIN
        //
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login([FromBody] User request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.UserName);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.PasswordHash, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials");
            }

            var claims = new List<Claim>{
              new Claim(ClaimTypes.Name, user.UserName),
              new Claim(ClaimTypes.Role, user.Role),
              new Claim(RestaurantClaims.Id, user.RestaurantId.ToString()),
              new Claim(RestaurantClaims.UserId, user.Id.ToString())
            };

            var identity = new ClaimsIdentity(claims, "cookie");
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync("cookie", principal);

            return Ok(new { user.UserName, user.Role, user.RestaurantId });
        }

        //
        // GET FOR THE CURRENT SESSION USER (restores auth state from the cookie)
        //
        [HttpGet("me")]
        [Authorize]
        public ActionResult<object> Me()
        {
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "";
            var role = User.FindFirstValue(ClaimTypes.Role) ?? Roles.User;
            var restaurantId = int.TryParse(User.FindFirstValue(RestaurantClaims.Id), out var id) ? id : 0;
            var userId = int.TryParse(User.FindFirstValue(RestaurantClaims.UserId), out var uid) ? uid : 0;
            return Ok(new { userId, userName, role, restaurantId });
        }

        //
        // POST FOR THE LOGOUT (terminates the server-side session / clears cookie)
        //
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("cookie");
            return Ok(new { message = "Logged out" });
        }

        //
        // Editing user (manager only)
        //
        [HttpPut("{id:int}")]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<ActionResult<User>> EditUser(int id, User editerUserData)
        {
            var UserToEdit = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.RestaurantId == CurrentRestaurantId);
            if (UserToEdit == null)
            {
                return NotFound($"User with id {id} not found");
            }

            // Only a global admin may modify an owner's account (prevents an
            // owner team from demoting/locking out its own restaurant owner).
            var callerRole = User.FindFirstValue(ClaimTypes.Role) ?? Roles.User;
            if (UserToEdit.Role == Roles.Owner && callerRole != Roles.Admin)
                return Forbid();
            // Managers can't edit themselves; an admin still can.
            if (UserToEdit.Id == CurrentUserId && callerRole != Roles.Admin)
                return Forbid();

            UserToEdit.PaymentDate = editerUserData.PaymentDate;
            UserToEdit.Salary = editerUserData.Salary;
            // Roles are normalized within the caller's own capability, never
            // escalating (see CreateUser).
            if (string.Equals(editerUserData.Role, Roles.Admin, StringComparison.OrdinalIgnoreCase))
                UserToEdit.Role = callerRole == Roles.Admin ? Roles.Admin : Roles.User;
            else
                UserToEdit.Role = string.Equals(editerUserData.Role, Roles.Owner, StringComparison.OrdinalIgnoreCase)
                    ? Roles.Owner
                    : Roles.User;
            // Only re-hash when a new (non-empty) password was sent; an empty
            // value must leave the existing hash untouched instead of wiping it
            // or storing a plaintext that would never verify.
            if (!string.IsNullOrWhiteSpace(editerUserData.PasswordHash))
                UserToEdit.PasswordHash = BCrypt.Net.BCrypt.HashPassword(editerUserData.PasswordHash, workFactor: 12);
            // The scope always follows the caller; never a client-sent id.
            UserToEdit.RestaurantId = CurrentRestaurantId;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(UserToEdit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //
        // Deleting users (manager only)
        //
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "ManagerOnly")]
        public async Task<ActionResult<User>> DeleteUser(int id)
        {
            var userToDelete = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.RestaurantId == CurrentRestaurantId);
            if (userToDelete == null)
            {
                return NotFound($"User with id {id} doesn't exist");
            }

            // Owners can't be deleted by non-admins, and nobody can delete
            // their own account from here.
            var callerRole = User.FindFirstValue(ClaimTypes.Role) ?? Roles.User;
            if (userToDelete.Role == Roles.Owner && callerRole != Roles.Admin)
                return Forbid();
            if (userToDelete.Id == CurrentUserId)
                return BadRequest(new { message = "No podés eliminar tu propio usuario" });

            try
            {
                _context.Users.Remove(userToDelete);
                await _context.SaveChangesAsync();
                return Ok(userToDelete);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

}
