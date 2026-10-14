using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Tests;

public class CategoryControllerTests : IDisposable
{
    private readonly HttpClient _client;
    private readonly TestingWebAppFactory _factory;

    public CategoryControllerTests()
    {
        _factory = new TestingWebAppFactory();
        _client = _factory.CreateClient();
        // All Category endpoints require authorization; log in as the seeded admin.
        _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "admin", passwordHash = "admin123" }).GetAwaiter().GetResult();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<JsonElement> CreateCategoryAsync(string name)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Category", new { name });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    private async Task<JsonElement> CreateProductAsync(string name, double price, int? categoryId = null)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Product",
            new { name, price, categoryId, description = "test", image = "" });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    [Fact]
    public async Task GetCategories_EmptyDatabase_ReturnsEmptyList()
    {
        var response = await _client.GetAsync("/api/v1/Category");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.Empty(categories);
    }

    [Fact]
    public async Task CreateCategory_Valid_ReturnsOkWithName()
    {
        var category = await CreateCategoryAsync("Bebidas");

        Assert.Equal("Bebidas", category.GetProperty("name").GetString());
        Assert.True(category.GetProperty("id").GetInt32() > 0);

        var categories = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Category");
        Assert.Single(categories!);
    }

    [Fact]
    public async Task CreateCategory_EmptyName_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Category", new { name = "   " });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateCategory_DuplicateName_ReturnsConflict()
    {
        await CreateCategoryAsync("Postres");

        // Case-insensitive duplicate.
        var response = await _client.PostAsJsonAsync("/api/v1/Category", new { name = "postres" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EditCategory_RenamesIt()
    {
        var category = await CreateCategoryAsync("Bebidas");
        var id = category.GetProperty("id").GetInt32();

        var response = await _client.PutAsJsonAsync($"/api/v1/Category/{id}", new { name = "Tragos" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var categories = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Category");
        Assert.Equal("Tragos", categories![0].GetProperty("name").GetString());
    }

    [Fact]
    public async Task EditCategory_RenamingToExistingOther_ReturnsConflict()
    {
        await CreateCategoryAsync("Bebidas");
        var second = await CreateCategoryAsync("Postres");
        var secondId = second.GetProperty("id").GetInt32();

        var response = await _client.PutAsJsonAsync($"/api/v1/Category/{secondId}", new { name = "Bebidas" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task DeleteCategory_WithoutProducts_RemovesIt()
    {
        var category = await CreateCategoryAsync("Temporal");
        var id = category.GetProperty("id").GetInt32();

        var response = await _client.DeleteAsync($"/api/v1/Category/{id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Category");
        Assert.Empty(categories!);
    }

    [Fact]
    public async Task DeleteCategory_WithProducts_ReturnsConflict()
    {
        var category = await CreateCategoryAsync("Bebidas");
        var id = category.GetProperty("id").GetInt32();
        await CreateProductAsync("Coca", 3.5, id);

        var response = await _client.DeleteAsync($"/api/v1/Category/{id}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        // The category must survive the blocked delete.
        var categories = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Category");
        Assert.Single(categories!);
    }

    [Fact]
    public async Task CreateProduct_WithOwnCategory_ReturnsCategoryObject()
    {
        var category = await CreateCategoryAsync("Bebidas");
        var id = category.GetProperty("id").GetInt32();

        var product = await CreateProductAsync("Coca", 3.5, id);

        Assert.Equal(id, product.GetProperty("categoryId").GetInt32());
        Assert.Equal("Bebidas", product.GetProperty("category").GetProperty("name").GetString());
    }

    [Fact]
    public async Task CreateProduct_WithForeignCategory_ReturnsBadRequest()
    {
        // A category id that doesn't exist for this scope.
        var response = await _client.PostAsJsonAsync("/api/v1/Product",
            new { name = "Ghost", price = 1.0, categoryId = 999999, description = "", image = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Categories_AreIsolatedPerRestaurant()
    {
        var clientA = _factory.CreateClient();
        var clientB = _factory.CreateClient();

        await clientA.PostAsJsonAsync("/api/v1/Restaurant/register",
            new { name = "Cat A", password = "secret123", nombreDelEncargado = "A", email = "a@cat.com", phoneNumber = "1" });
        await clientB.PostAsJsonAsync("/api/v1/Restaurant/register",
            new { name = "Cat B", password = "secret123", nombreDelEncargado = "B", email = "b@cat.com", phoneNumber = "2" });

        var created = await clientA.PostAsJsonAsync("/api/v1/Category", new { name = "Solo A" });
        created.EnsureSuccessStatusCode();
        var categoryId = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();

        // B sees none of A's categories.
        var bCategories = await clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/Category");
        Assert.Empty(bCategories!);

        // B can't edit or delete A's category (foreign id → 404).
        var edit = await clientB.PutAsJsonAsync($"/api/v1/Category/{categoryId}", new { name = "Hijack" });
        Assert.Equal(HttpStatusCode.NotFound, edit.StatusCode);

        var delete = await clientB.DeleteAsync($"/api/v1/Category/{categoryId}");
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);

        clientA.Dispose();
        clientB.Dispose();
    }
}
