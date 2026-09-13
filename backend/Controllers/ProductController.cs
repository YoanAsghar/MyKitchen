using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyKitchen.Models;
using MyKitchen.Data;

namespace MyKitchen.Controllers;

[Route("/api/v1/[controller]")]
[ApiController]
[Authorize]

public class ProductController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductController(ApplicationDbContext context)
    {
        _context = context;
    }
    //
    // GET FOR THE PRODUCTS
    //
    [HttpGet("search")]
    public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] string? search = null)
    {
        if (string.IsNullOrEmpty(search))
        {
            return Ok(await _context.Products.ToListAsync());
        }
        var productsFromDatabase = await _context.Products
          .Where(p => p.Name.ToLower().Contains(search.ToLower()))
          .OrderBy(p => p.Id)
          .ToListAsync();
        return Ok(productsFromDatabase);
    }
    //
    // POST FOR THE PRODUCTS
    //
    [HttpPost]
    public async Task<ActionResult<List<Product>>> CreateProduct(Product product)
    {
        if (product == null)
        {
            return BadRequest("Los datos del producto son requeridos");
        }
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(product);
    }
    //
    // PUT FOR THE PRODUCTS
    //
    [HttpPut("{id:int}")]
    public async Task<ActionResult<List<Product>>> EditProduct(int id, [FromBody] Product newProductData)
    {
        if (newProductData == null)
        {
            return BadRequest("Los datos del producto son requeridos");
        }
        var ProductToEdit = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

        if (ProductToEdit == null)
        {
            return NotFound($"No se encontro product con id {id}");
        }

        ProductToEdit.Name = newProductData.Name;
        ProductToEdit.Price = newProductData.Price;
        ProductToEdit.Description = newProductData.Description;
        ProductToEdit.Image = newProductData.Image;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(ProductToEdit);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"Error al actualizar el product {ex.Message}");
        }
    }
    //
    // DELETE FOR THE PRODUCTS
    //
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<List<Product>>> DeleteProduct(int id)
    {
        var ProductToDelete = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

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
