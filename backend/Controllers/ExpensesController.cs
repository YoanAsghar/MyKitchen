
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;
using MyKitchen.Models;

namespace MyKitchen.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ExpensesController : RestaurantScopedController
{
    private readonly ApplicationDbContext _context;
    public ExpensesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Expense[]>>> GetExpenses([FromQuery] int pageSize, [FromQuery] int page)
    {
        try
        {
            var expenses = await _context.Expenses
              .Where(e => e.RestaurantId == CurrentRestaurantId)
              .Include(e => e.CreatedByUser)
              .OrderByDescending(o => o.Id)
              .Skip((page - 1) * pageSize)
              .Take(pageSize)
              .OrderBy(o => o.Id)
              .ToListAsync();
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    [HttpPost]
    public async Task<ActionResult<Expense>> CreateNewExpense([FromBody] Expense NewExpense)
    {
        try
        {
            if (NewExpense == null)
            {
                return BadRequest("La data del gasto es requerida");
            }
            // The scope always follows the caller; never a client-sent id.
            NewExpense.RestaurantId = CurrentRestaurantId;
            // Author is stamped from the auth cookie claim, never from the
            // client payload (a user could otherwise attribute expenses to
            // another staff member).
            NewExpense.CreatedByUserId = CurrentUserId;
            _context.Expenses.Add(NewExpense);
            await _context.SaveChangesAsync();

            return NewExpense;
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
}

