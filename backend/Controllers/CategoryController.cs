using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Data;
using MyKitchen.Models;

namespace MyKitchen.Controllers;

[Route("/api/v1/[controller]")]
[ApiController]
[Authorize]
public class CategoryController : RestaurantScopedController
{
    private readonly ApplicationDbContext _context;

    public CategoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    //
    // GET FOR THE CATEGORIES (own restaurant only)
    //
    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.RestaurantId == CurrentRestaurantId)
            .OrderBy(c => c.Name)
            .AsNoTracking()
            .ToListAsync();

        return Ok(categories);
    }

    //
    // POST FOR THE CATEGORIES (stamped with the caller's restaurant)
    //
    [HttpPost]
    [Authorize(Policy = "ManagerOnly")]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        if (category == null || string.IsNullOrWhiteSpace(category.Name))
        {
            return BadRequest("El nombre de la categoría es obligatorio");
        }

        var name = category.Name.Trim();

        // Names must be unique per restaurant (case-insensitive) so the carta
        // tabs and the product picker never show two identical categories.
        var duplicate = await _context.Categories.AnyAsync(c =>
            c.RestaurantId == CurrentRestaurantId && c.Name.ToLower() == name.ToLower());
        if (duplicate)
        {
            return Conflict($"Ya existe una categoría llamada \"{name}\"");
        }

        // The scope always follows the caller; never a client-sent id.
        category.Id = 0;
        category.Name = name;
        category.RestaurantId = CurrentRestaurantId;
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    //
    // PUT FOR THE CATEGORIES (own restaurant only)
    //
    [HttpPut("{id:int}")]
    [Authorize(Policy = "ManagerOnly")]
    public async Task<ActionResult<Category>> EditCategory(int id, [FromBody] Category newCategoryData)
    {
        if (newCategoryData == null || string.IsNullOrWhiteSpace(newCategoryData.Name))
        {
            return BadRequest("El nombre de la categoría es obligatorio");
        }

        var categoryToEdit = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == CurrentRestaurantId);
        if (categoryToEdit == null)
        {
            return NotFound($"No se encontró categoría con id {id}");
        }

        var name = newCategoryData.Name.Trim();

        var duplicate = await _context.Categories.AnyAsync(c =>
            c.RestaurantId == CurrentRestaurantId && c.Id != id && c.Name.ToLower() == name.ToLower());
        if (duplicate)
        {
            return Conflict($"Ya existe una categoría llamada \"{name}\"");
        }

        categoryToEdit.Name = name;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(categoryToEdit);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"Error al actualizar la categoría {ex.Message}");
        }
    }

    //
    // DELETE FOR THE CATEGORIES (own restaurant only, blocked while in use)
    //
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "ManagerOnly")]
    public async Task<ActionResult<Category>> DeleteCategory(int id)
    {
        var categoryToDelete = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == CurrentRestaurantId);
        if (categoryToDelete == null)
        {
            return NotFound($"No se encontró categoría con id {id}");
        }

        // Refuse to delete a category still referenced by products so no product
        // is silently left dangling/uncategorized.
        var inUse = await _context.Products.AnyAsync(p =>
            p.CategoryId == id && p.RestaurantId == CurrentRestaurantId);
        if (inUse)
        {
            return Conflict("No se puede eliminar: hay productos usando esta categoría");
        }

        _context.Categories.Remove(categoryToDelete);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(categoryToDelete);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"Error al eliminar la categoría {ex.Message}");
        }
    }
}
