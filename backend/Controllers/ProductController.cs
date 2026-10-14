using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Models;
using MyKitchen.Data;

namespace MyKitchen.Controllers;

[Route("/api/v1/[controller]")]
[ApiController]
[Authorize]

public class ProductController : RestaurantScopedController
{
    private readonly ApplicationDbContext _context;

    public ProductController(ApplicationDbContext context)
    {
        _context = context;
    }

    // A product may reference a category of the caller's restaurant only. A
    // foreign/inexistent id is rejected so a product can never point across tenants.
    private async Task<bool> CategoryExistsForCaller(int categoryId)
    {
        return await _context.Categories
            .AnyAsync(c => c.Id == categoryId && c.RestaurantId == CurrentRestaurantId);
    }

    //
    // GET FOR THE PRODUCTS (own restaurant only)
    //
    [HttpGet("search")]
    public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] string? search = null)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.RestaurantId == CurrentRestaurantId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query
                .Where(p => p.Name.ToLower().Contains(search.ToLower()))
                .OrderBy(p => p.Id);
        }

        var products = await query.AsNoTracking().ToListAsync();
        return Ok(products);
    }
    //
    // POST FOR THE PRODUCTS (stamped with the caller's restaurant)
    //
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        if (product == null)
        {
            return BadRequest("Los datos del producto son requeridos");
        }

        if (product.CategoryId is int categoryId && !await CategoryExistsForCaller(categoryId))
        {
            return BadRequest("La categoría no existe");
        }

        // The scope always follows the caller; never a client-sent id. Clear the
        // navigation so a client-sent category object can't be inserted as a new row.
        product.Id = 0;
        product.RestaurantId = CurrentRestaurantId;
        product.Category = null;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var created = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstAsync(p => p.Id == product.Id);

        return Ok(created);
    }
    //
    // PUT FOR THE PRODUCTS (own restaurant only)
    //
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> EditProduct(int id, [FromBody] Product newProductData)
    {
        if (newProductData == null)
        {
            return BadRequest("Los datos del producto son requeridos");
        }
        var ProductToEdit = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == CurrentRestaurantId);

        if (ProductToEdit == null)
        {
            return NotFound($"No se encontro product con id {id}");
        }

        if (newProductData.CategoryId is int categoryId && !await CategoryExistsForCaller(categoryId))
        {
            return BadRequest("La categoría no existe");
        }

        ProductToEdit.Name = newProductData.Name;
        ProductToEdit.Price = newProductData.Price;
        ProductToEdit.Description = newProductData.Description;
        ProductToEdit.Image = newProductData.Image;
        ProductToEdit.CategoryId = newProductData.CategoryId;
        // The scope always follows the caller; never a client-sent id.
        ProductToEdit.RestaurantId = CurrentRestaurantId;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"Error al actualizar el product {ex.Message}");
        }

        var updated = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstAsync(p => p.Id == ProductToEdit.Id);

        return Ok(updated);
    }
    //
    // DELETE FOR THE PRODUCTS (own restaurant only)
    //
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<Product>> DeleteProduct(int id)
    {
        var ProductToDelete = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == CurrentRestaurantId);

        if (ProductToDelete == null)
        {
            return NotFound($"No se encontro producto con id ${id}");
        }

        _context.Products.Remove(ProductToDelete);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(ProductToDelete);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"Error para eliminar el product ${ex.Message}");
        }
    }
}
