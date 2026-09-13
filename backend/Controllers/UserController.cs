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
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }


        //
        // GET FOR THE USERS (any authenticated user)
        //
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<User>>> GetUsers()
        {
            var users = await _context.Users
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
        // POST FOR THE USERS CREATION (admin only)
        //
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
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

            // An admin may assign a role; anyone else gets the default user role.
            // Roles are normalized to lowercase canonical names.
            newUser.Role = string.Equals(newUser.Role, Roles.Admin, StringComparison.OrdinalIgnoreCase)
                ? Roles.Admin
                : Roles.User;
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
              new Claim(ClaimTypes.Role, user.Role)
            };

            var identity = new ClaimsIdentity(claims, "cookie");
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync("cookie", principal);

            return Ok(new { user.UserName, user.Role });
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
            return Ok(new { userName, role });
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
        // Editing user (admin only)
        //
        [HttpPut("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<User>> EditUser(int id, User editerUserData)
        {
            var UserToEdit = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (UserToEdit == null)
            {
                return BadRequest($"User with id {id} not found");
            }

            UserToEdit.PaymentDate = editerUserData.PaymentDate;
            // Roles are normalized to canonical names, preventing privilege escalation.
            UserToEdit.Role = string.Equals(editerUserData.Role, Roles.Admin, StringComparison.OrdinalIgnoreCase)
                ? Roles.Admin
                : Roles.User;
            UserToEdit.Salary = editerUserData.Salary;
            UserToEdit.PasswordHash = editerUserData.PasswordHash;

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
        // Deleting users (admin only)
        //
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<User>> DeleteUser(int id)
        {
            var userToDelete = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (userToDelete == null)
            {
                return NotFound($"User with id {id} doesn't exist");
            }

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
