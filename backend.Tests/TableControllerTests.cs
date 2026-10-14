using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using MyKitchen.Data;
using MyKitchen.Models;

namespace backend.Tests;

public class TableControllerTests : IDisposable
{
    private readonly HttpClient _client;
    private readonly TestingWebAppFactory _factory;

    public TableControllerTests()
    {
        _factory = new TestingWebAppFactory();
        _client = _factory.CreateClient();
        // All Table endpoints require authorization; log in as the seeded admin.
        _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "admin", passwordHash = "admin123" }).GetAwaiter().GetResult();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<JsonElement> CreateTableAsync(int tableNumber)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Table", new { tableNumber });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    [Fact]
    public async Task GetTables_EmptyDatabase_ReturnsEmptyList()
    {
        var response = await _client.GetAsync("/api/v1/Table");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tables = await response.Content.ReadFromJsonAsync<JsonElement[]>();
        Assert.Empty(tables);
    }

    [Fact]
    public async Task GetTables_ReturnsPersistedTablesWithRealIds()
    {
        await CreateTableAsync(1);
        await CreateTableAsync(2);

        var response = await _client.GetAsync("/api/v1/Table");
        var tables = await response.Content.ReadFromJsonAsync<JsonElement[]>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, tables!.Length);

        // Ids must be the real DB-assigned ids (1-based, but crucially NOT a
        // frontend remap like index+1); each id must be unique and present.
        var ids = tables.Select(t => t.GetProperty("id").GetInt32()).Distinct();
        Assert.Equal(2, ids.Count());
        Assert.All(ids, id => Assert.True(id > 0));
    }

    [Fact]
    public async Task CreateTable_ValidTableNumber_ReturnsOkAndPersists()
    {
        var created = await CreateTableAsync(7);

        Assert.Equal(7, created.GetProperty("tableNumber").GetInt32());

        var tables = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Table");
        Assert.Single(tables!);
        Assert.Equal(7, tables[0].GetProperty("tableNumber").GetInt32());
    }

    [Fact]
    public async Task CreateTable_MissingTableNumber_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Table", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTable_ExistingId_RemovesOnlyThatTable()
    {
        var first = await CreateTableAsync(1);
        var second = await CreateTableAsync(2);
        var firstId = first.GetProperty("id").GetInt32();

        var response = await _client.DeleteAsync($"/api/v1/Table/{firstId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var tables = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Table");
        var remainingIds = tables!.Select(t => t.GetProperty("id").GetInt32()).ToArray();

        // Deleting by id must remove ONLY the targeted table, never a 'last' table.
        Assert.DoesNotContain(firstId, remainingIds);
        Assert.Contains(second.GetProperty("id").GetInt32(), remainingIds);
        Assert.Equal(1, remainingIds.Length);
    }

    [Fact]
    public async Task DeleteTable_MissingId_ReturnsNotFound()
    {
        var response = await _client.DeleteAsync("/api/v1/Table/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTable_MissingId_DoesNotDeleteAnything()
    {
        await CreateTableAsync(1);

        var response = await _client.DeleteAsync("/api/v1/Table/999999");

        var tables = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Table");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Single(tables!);
    }

    [Fact]
    public async Task DeleteTable_DuplicateOpenOrders_RemovesThemAll()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();

        // Two OPEN rows on the same table (race / pre-existing data). Deleting the
        // table must collapse ALL of them, not just the first, so no ghost order
        // is left stranded in /Order/active.
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Orders.Add(new Order { TableId = tableId, RestaurantId = 0, Status = OrderStatus.OPEN, OrderDate = DateTime.UtcNow, Guests = 1, TotalPrice = 5 });
            db.Orders.Add(new Order { TableId = tableId, RestaurantId = 0, Status = OrderStatus.OPEN, OrderDate = DateTime.UtcNow, Guests = 3, TotalPrice = 9 });
            db.SaveChanges();
        }

        var response = await _client.DeleteAsync($"/api/v1/Table/{tableId}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Assert.Empty(db.Orders.Where(o => o.TableId == tableId && o.Status == OrderStatus.OPEN));
        }
    }

    [Fact]
    public async Task GetTables_IncludesTheOpenOrderPerTable()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();

        var productResponse = await _client.PostAsJsonAsync("/api/v1/Product",
            new { name = "Pasta", price = 9.5, description = "test", image = "" });
        productResponse.EnsureSuccessStatusCode();
        var product = await productResponse.Content.ReadFromJsonAsync<JsonElement>();
        var pid = product.GetProperty("id").GetInt32();

        var orderResponse = await _client.PutAsJsonAsync($"/api/v1/Order/table/{tableId}", new
        {
            tableId,
            guests = 4,
            tip = 2,
            paymentMethod = "CASH",
            orderDetail = new[] { new { productId = pid, quantity = 2 } }
        });
        orderResponse.EnsureSuccessStatusCode();

        var response = await _client.GetAsync("/api/v1/Table");
        var tables = await response.Content.ReadFromJsonAsync<JsonElement[]>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(tables![0].TryGetProperty("order", out var order),
            "GetTables must include each table's open order");
        Assert.Equal(4, order.GetProperty("guests").GetInt32());
        Assert.Equal(21.0, order.GetProperty("totalPrice").GetDouble());
        Assert.Equal(2, order.GetProperty("orderDetail")[0].GetProperty("quantity").GetInt32());
    }

    [Fact]
    public async Task GetTables_DuplicateOpenOrders_DoesNotThrow()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();

        // Two OPEN rows on the same table (race / pre-existing data). GetTables
        // must not 500; it picks the latest order for the table.
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Orders.Add(new Order { TableId = tableId, Status = OrderStatus.OPEN, OrderDate = DateTime.UtcNow, Guests = 1, TotalPrice = 5 });
            db.Orders.Add(new Order { TableId = tableId, Status = OrderStatus.OPEN, OrderDate = DateTime.UtcNow, Guests = 3, TotalPrice = 9 });
            db.SaveChanges();
        }

        var response = await _client.GetAsync("/api/v1/Table");
        var tables = await response.Content.ReadFromJsonAsync<JsonElement[]>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(tables!);
        Assert.True(tables![0].TryGetProperty("order", out var order), "The table must still expose one open order");
        Assert.Equal(3, order.GetProperty("guests").GetInt32());
    }
}
