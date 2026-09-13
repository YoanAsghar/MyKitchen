
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;
using MyKitchen.Models;

namespace MyKitchen.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ExpensesControllers : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public ExpensesControllers(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Expense[]>>> GetExpenses([FromQuery] int pageSize, [FromQuery] int page)
    {
        try
        {
            var orders = await _context.Expenses
              .Include(e => e.CreatedByUser)
              .OrderByDescending(o => o.Id)
              .Skip((page - 1) * pageSize)
              .Take(pageSize)
              .OrderBy(o => o.Id)
              .ToListAsync();
            return Ok(orders);
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

