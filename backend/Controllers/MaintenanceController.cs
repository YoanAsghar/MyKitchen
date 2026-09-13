using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;

namespace MyKitchen.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MaintenanceController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Destructive operation — restricted to admins.
    [HttpPost("clear-database")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ClearDatabase()
    {
        try
        {
            // Truncate all tables and reset identities
            // Order is important if not using CASCADE, but CASCADE is safer.
            await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"orderDetails\", \"orders\", \"products\", \"tables\" RESTART IDENTITY CASCADE;");
            return Ok(new { message = "Database cleared successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
