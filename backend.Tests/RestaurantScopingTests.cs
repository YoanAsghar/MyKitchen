using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Tests;

// Proves the restaurant scope from the cookie claim is enforced everywhere:
// a user can only read/stamp data belonging to their own restaurant, and
// foreign ids are never reachable (they surface as NotFound/empty, never data).
public class RestaurantScopingTests : IDisposable
{
    private readonly TestingWebAppFactory _factory;
    private readonly HttpClient _clientA;
    private readonly HttpClient _clientB;

    public RestaurantScopingTests()
    {
        _factory = new TestingWebAppFactory();
        // Two clients over one shared in-memory DB, each with its own cookie jar.
        _clientA = _factory.CreateClient();
        _clientB = _factory.CreateClient();
    }

    public void Dispose()
    {
        _clientA.Dispose();
        _clientB.Dispose();
        _factory.Dispose();
    }

    private async Task RegisterAsync(HttpClient client, string name, string email)
    {
        var response = await client.PostAsJsonAsync("/api/v1/Restaurant/register",
            new
            {
                name,
                password = "secret123",
                nombreDelEncargado = "Dueño",
                email,
                phoneNumber = "1155550000"
            });
        response.EnsureSuccessStatusCode();
    }

    private async Task<int> CurrentRestaurantIdAsync(HttpClient client)
    {
        var me = await client.GetFromJsonAsync<JsonElement>("/api/v1/User/me");
        return me.GetProperty("restaurantId").GetInt32();
    }

    private async Task<int> CreateProductAsync(HttpClient client, string name, double price)
    {
        var response = await client.PostAsJsonAsync("/api/v1/Product",
            new { name, price, description = "test", image = "" });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();
    }

    private async Task<int> CreateTableAsync(HttpClient client, int tableNumber)
    {
        var response = await client.PostAsJsonAsync("/api/v1/Table", new { tableNumber });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();
    }

    private async Task SaveOpenOrderAsync(HttpClient client, int tableId, int productId, int quantity = 1)
    {
        var response = await client.PutAsJsonAsync($"/api/v1/Order/table/{tableId}",
            new
            {
                tableId,
                guests = 2,
                tip = 0,
                paymentMethod = "CASH",
                orderDetail = new[] { new { productId, quantity } }
            });
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Products_AreIsolatedPerRestaurant()
    {
        await RegisterAsync(_clientA, "Resto Alpha", "alpha@test.com");
        await RegisterAsync(_clientB, "Resto Beta", "beta@test.com");
        var productIdA = await CreateProductAsync(_clientA, "Milanesa", 12.5);

        var adminIdA = await CurrentRestaurantIdAsync(_clientA);
        var adminIdB = await CurrentRestaurantIdAsync(_clientB);
        Assert.NotEqual(adminIdA, adminIdB);

        // B cannot see A's product.
        var productsB = await _clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/Product/search");
        Assert.Empty(productsB!);

        // B cannot edit or delete A's product.
        var edit = await _clientB.PutAsJsonAsync($"/api/v1/Product/{productIdA}",
            new { name = "Hacked", price = 1, description = "", image = "" });
        Assert.Equal(HttpStatusCode.NotFound, edit.StatusCode);

        var delete = await _clientB.DeleteAsync($"/api/v1/Product/{productIdA}");
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);

        // A still owns its product untouched.
        var productsA = await _clientA.GetFromJsonAsync<JsonElement[]>("/api/v1/Product/search");
        Assert.Single(productsA!);
        Assert.Equal("Milanesa", productsA[0].GetProperty("name").GetString());
    }

    [Fact]
    public async Task TablesAndActiveOrders_AreIsolatedPerRestaurant()
    {
        await RegisterAsync(_clientA, "Resto Gamma", "gamma@test.com");
        await RegisterAsync(_clientB, "Resto Delta", "delta@test.com");

        var tableIdA = await CreateTableAsync(_clientA, 1);
        var productA = await CreateProductAsync(_clientA, "Pasta", 10);
        await SaveOpenOrderAsync(_clientA, tableIdA, productA);

        // B sees no tables and no active orders.
        Assert.Empty((await _clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/Table"))!);
        Assert.Empty((await _clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/Order/active"))!);

        // B cannot press A's table (foreign table id) to place/clear an order.
        var press = await _clientB.PutAsJsonAsync($"/api/v1/Order/table/{tableIdA}",
            new
            {
                tableId = tableIdA,
                guests = 3,
                tip = 0,
                paymentMethod = "CASH",
                orderDetail = new[] { new { productId = productA, quantity = 2 } }
            });
        Assert.Equal(HttpStatusCode.NotFound, press.StatusCode);

        // B cannot delete A's table either.
        var delete = await _clientB.DeleteAsync($"/api/v1/Table/{tableIdA}");
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);

        // A's table still exists and still carries its open order.
        var tablesA = await _clientA.GetFromJsonAsync<JsonElement[]>("/api/v1/Table");
        Assert.Single(tablesA!);
        Assert.Equal(tableIdA, tablesA[0].GetProperty("id").GetInt32());
        Assert.True(tablesA[0].TryGetProperty("order", out _));
    }

    [Fact]
    public async Task ProductFromOtherRestaurant_CannotBeOrderedOnOwnTable()
    {
        await RegisterAsync(_clientA, "Resto Epsilon", "epsilon@test.com");
        await RegisterAsync(_clientB, "Resto Zeta", "zeta@test.com");

        var productB = await CreateProductAsync(_clientB, "Sushi", 15);
        var tableIdA = await CreateTableAsync(_clientA, 2);

        // A placing B's product on its own table is rejected as "doesn't exist".
        var response = await _clientA.PutAsJsonAsync($"/api/v1/Order/table/{tableIdA}",
            new
            {
                tableId = tableIdA,
                guests = 2,
                tip = 0,
                paymentMethod = "CASH",
                orderDetail = new[] { new { productId = productB, quantity = 1 } }
            });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PaymentDoesNotClear_AnotherRestaurantsOpenOrder()
    {
        await RegisterAsync(_clientA, "Resto Eta", "eta@test.com");
        await RegisterAsync(_clientB, "Resto Theta", "theta@test.com");

        var tableIdA = await CreateTableAsync(_clientA, 3);
        var productA = await CreateProductAsync(_clientA, "Café", 3);
        await SaveOpenOrderAsync(_clientA, tableIdA, productA);

        // B tries to pay for A's table — the foreign table must be rejected,
        // leaving A's OPEN order untouched.
        var pay = await _clientB.PostAsJsonAsync("/api/v1/Order", new
        {
            totalPrice = 3,
            orderDate = DateTime.UtcNow.ToString("o"),
            guests = 1,
            tip = 0,
            paymentMethod = "CASH",
            tableId = tableIdA,
            orderDetail = new[] { new { productId = productA, quantity = 1 } }
        });
        Assert.Equal(HttpStatusCode.NotFound, pay.StatusCode);

        // A's open order is still active; B's history is empty.
        var activeA = await _clientA.GetFromJsonAsync<JsonElement[]>("/api/v1/Order/active");
        Assert.Single(activeA!);
        Assert.Empty((await _clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/Order"))!);
    }

    [Fact]
    public async Task Expenses_AndUsers_AreIsolatedPerRestaurant()
    {
        await RegisterAsync(_clientA, "Resto Iota", "iota@test.com");
        await RegisterAsync(_clientB, "Resto Kappa", "kappa@test.com");

        // A registers a staff user + an expense.
        var staff = await _clientA.PostAsJsonAsync("/api/v1/User",
            new { userName = "cocinero-iota", passwordHash = "secret123", role = "user" });
        staff.EnsureSuccessStatusCode();

        var meA = await _clientA.GetFromJsonAsync<JsonElement>("/api/v1/User/me");
        var userIdA = meA.GetProperty("userId").GetInt32();
        Assert.True(userIdA > 0);

        // The author of the expense is stamped from the caller's userId claim
        // (the owner here). The client-sent createdByUserId=1 is ignored.
        var expense = await _clientA.PostAsJsonAsync("/api/v1/Expenses", new
        {
            name = "Luz",
            value = 123.45,
            expenseType = "BILLS",
            dateOfTheExpense = "2026-09-13T10:00:00Z",
            createdByUserId = 1
        });
        expense.EnsureSuccessStatusCode();

        // B cannot see A's users, and A sees only its own (the owner + cocinero).
        var usersB = await _clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/User");
        Assert.DoesNotContain(usersB, u => u.GetProperty("userName").GetString() == "cocinero-iota");
        Assert.All(usersB, u => Assert.Equal("kappa@test.com", u.GetProperty("userName").GetString()));

        var usersA = await _clientA.GetFromJsonAsync<JsonElement[]>("/api/v1/User");
        Assert.Contains(usersA, u => u.GetProperty("userName").GetString() == "cocinero-iota");
        Assert.DoesNotContain(usersA, u => u.GetProperty("userName").GetString() == "admin");
        Assert.DoesNotContain(usersA, u => u.GetProperty("userName").GetString() == "kappa@test.com");
        Assert.Equal(2, usersA.Length);

        // B cannot see A's expenses, and A can.
        var expensesB = await _clientB.GetFromJsonAsync<JsonElement[]>("/api/v1/Expenses?pageSize=50&page=1");
        Assert.Empty(expensesB!);

        var expensesA = await _clientA.GetFromJsonAsync<JsonElement[]>("/api/v1/Expenses?pageSize=50&page=1");
        var expenseA = Assert.Single(expensesA!);
        Assert.Equal("Luz", expenseA.GetProperty("name").GetString());
        // Author is the calling owner, stamped from the cookie claim.
        Assert.Equal(userIdA, expenseA.GetProperty("createdByUserId").GetInt32());
    }
}