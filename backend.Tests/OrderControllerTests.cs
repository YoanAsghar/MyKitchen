using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Tests;

public class OrderControllerTests : IDisposable
{
    private readonly HttpClient _client;
    private readonly TestingWebAppFactory _factory;

    public OrderControllerTests()
    {
        _factory = new TestingWebAppFactory();
        _client = _factory.CreateClient();
        // All Order/Product endpoints require authorization; log in as the seeded admin.
        _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "admin", passwordHash = "admin123" }).GetAwaiter().GetResult();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<JsonElement> CreateProductAsync(string name, double price, string category = "Drinks")
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Product",
            new { name, price, category, description = "test", image = "" });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    private async Task<JsonElement> CreateOrderAsync(
        string orderDateIso, int productId, string paymentMethod = "CASH",
        int guests = 2, int quantity = 1, double totalPrice = 12.5, int? tableIdParam = null)
    {
        var body = new
        {
            totalPrice,
            orderDate = orderDateIso,
            guests,
            tip = 0,
            PaymentMethod = paymentMethod,
            tableId = tableIdParam,
            orderDetail = new[]
            {
                new { id = 0, orderId = 0, productId, quantity }
            }
        };
        var response = await _client.PostAsJsonAsync("/api/v1/Order", body);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    private async Task<JsonElement> CreateTableAsync(int tableNumber)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Table", new { tableNumber });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    private async Task<HttpResponseMessage> SaveOpenOrderAsync(
        int tableId, int productId, int quantity, int guests = 4, int tip = 0)
    {
        var body = new
        {
            tableId,
            guests,
            tip,
            paymentMethod = "CASH",
            orderDetail = new[] { new { productId, quantity } }
        };
        return await _client.PutAsJsonAsync($"/api/v1/Order/table/{tableId}", body);
    }

    [Fact]
    public async Task SaveOpenOrder_CreatesOpenOrder_ListedAsActiveNotHistory()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();
        var product = await CreateProductAsync("Burger", 12.5);
        var pid = product.GetProperty("id").GetInt32();

        var response = await SaveOpenOrderAsync(tableId, pid, 2, guests: 4);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var active = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order/active");
        var activeOrder = Assert.Single(active!);

        Assert.Equal(tableId, activeOrder.GetProperty("tableId").GetInt32());
        Assert.Equal(4, activeOrder.GetProperty("guests").GetInt32());
        Assert.Equal(25.0, activeOrder.GetProperty("totalPrice").GetDouble());
        Assert.Equal("OPEN", activeOrder.GetProperty("status").GetString());

        var detail = activeOrder.GetProperty("orderDetail")[0];
        Assert.Equal(pid, detail.GetProperty("productId").GetInt32());
        Assert.Equal(2, detail.GetProperty("quantity").GetInt32());
        Assert.Equal("Burger", detail.GetProperty("product").GetProperty("name").GetString());

        // Open orders must NOT appear in the paid-history endpoint.
        var history = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order");
        Assert.Empty(history!);
    }

    [Fact]
    public async Task SaveOpenOrder_UpdatesExistingOpenOrder_NoDuplicates()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();
        var product = await CreateProductAsync("Pizza", 10);
        var pid = product.GetProperty("id").GetInt32();

        await SaveOpenOrderAsync(tableId, pid, 1, guests: 2);
        var response = await SaveOpenOrderAsync(tableId, pid, 3, guests: 5);
        response.EnsureSuccessStatusCode();

        var active = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order/active");
        var activeOrder = Assert.Single(active!);
        Assert.Equal(5, activeOrder.GetProperty("guests").GetInt32());
        Assert.Equal(3, activeOrder.GetProperty("orderDetail")[0].GetProperty("quantity").GetInt32());
    }

    [Fact]
    public async Task SaveOpenOrder_UnknownTable_ReturnsNotFound()
    {
        var response = await _client.PutAsJsonAsync("/api/v1/Order/table/999999", new
        {
            tableId = 999999,
            guests = 2,
            tip = 0,
            paymentMethod = "CASH",
            orderDetail = new[] { new { productId = 1, quantity = 1 } }
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task SaveOpenOrder_EmptyCart_ClearsOpenOrder()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();
        var product = await CreateProductAsync("Soda", 2);
        var pid = product.GetProperty("id").GetInt32();

        await SaveOpenOrderAsync(tableId, pid, 2);
        var clearResponse = await _client.PutAsJsonAsync($"/api/v1/Order/table/{tableId}",
            new { tableId, guests = 0, tip = 0, paymentMethod = "CASH", orderDetail = new object[] { } });

        Assert.Equal(HttpStatusCode.OK, clearResponse.StatusCode);

        var active = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order/active");
        Assert.Empty(active!);
    }

    [Fact]
    public async Task CreateOrder_PaysAndClosesTheTablesOpenOrder()
    {
        var table = await CreateTableAsync(1);
        var tableId = table.GetProperty("id").GetInt32();
        var product = await CreateProductAsync("Coffee", 3);
        var pid = product.GetProperty("id").GetInt32();

        await SaveOpenOrderAsync(tableId, pid, 1, guests: 3);
        await CreateOrderAsync(DateTime.UtcNow.ToString("o"), pid, guests: 3, tableIdParam: tableId);

        var active = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order/active");
        Assert.Empty(active!);

        var history = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order");
        Assert.Single(history!);
    }

    [Fact]
    public async Task CreateOrder_EmptyOrderDetail_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/Order", new
        {
            totalPrice = 0,
            orderDate = DateTime.UtcNow,
            guests = 1,
            tip = 0,
            paymentMethod = "CASH",
            orderDetail = new object[] { }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateOrder_InvalidQuantity_ReturnsBadRequest()
    {
        var product = await CreateProductAsync("Tomato", 1);
        var pid = product.GetProperty("id").GetInt32();

        var response = await _client.PostAsJsonAsync("/api/v1/Order", new
        {
            totalPrice = 1,
            orderDate = DateTime.UtcNow,
            guests = 1,
            tip = 0,
            paymentMethod = "CASH",
            orderDetail = new[] { new { id = 0, orderId = 0, productId = pid, quantity = 0 } }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateOrder_Valid_ReturnsOkAndPersists()
    {
        var product = await CreateProductAsync("Burger", 12.5);
        var created = await CreateOrderAsync(DateTime.UtcNow.ToString("o"), product.GetProperty("id").GetInt32());

        Assert.Equal(12.5, created.GetProperty("totalPrice").GetDouble());
        Assert.Equal(2, created.GetProperty("guests").GetInt32());

        var orders = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order");
        Assert.Single(orders!);
    }

    [Fact]
    public async Task CreateOrder_PaymentMethodIsSerializedAsString()
    {
        var product = await CreateProductAsync("Coffee", 3.0);
        var created = await CreateOrderAsync(DateTime.UtcNow.ToString("o"),
            product.GetProperty("id").GetInt32(), paymentMethod: "CARD");

        Assert.Equal("CARD", created.GetProperty("paymentMethod").GetString());
    }

    [Fact]
    public async Task GetOrders_DefaultDate_ReturnsOnlyOrdersFromToday()
    {
        var product = await CreateProductAsync("Pizza", 10);
        var pid = product.GetProperty("id").GetInt32();

        var today = DateTime.UtcNow;
        await CreateOrderAsync(today.ToString("o"), pid);
        await CreateOrderAsync(today.AddDays(1).ToString("o"), pid);

        var response = await _client.GetAsync("/api/v1/Order");
        var orders = await response.Content.ReadFromJsonAsync<JsonElement[]>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(orders!);
    }

    [Fact]
    public async Task GetOrders_WithSpecificDate_ReturnsOnlyThatDaysOrders()
    {
        var product = await CreateProductAsync("Salad", 8);
        var pid = product.GetProperty("id").GetInt32();

        var yesterday = DateTime.UtcNow.AddDays(-1);
        var today = DateTime.UtcNow;
        await CreateOrderAsync(yesterday.ToString("o"), pid);
        await CreateOrderAsync(today.ToString("o"), pid);

        var dateParam = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)).ToString("yyyy-MM-dd");
        var orders = await _client.GetFromJsonAsync<JsonElement[]>($"/api/v1/Order?date={dateParam}");

        Assert.Single(orders!);
    }

    [Fact]
    public async Task GetOrders_IncludesOrderDetailsAndProducts()
    {
        var product = await CreateProductAsync("Sushi", 15, category: "Food");
        var pid = product.GetProperty("id").GetInt32();
        await CreateOrderAsync(DateTime.UtcNow.ToString("o"), pid, quantity: 3);

        var orders = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Order");
        var order = orders![0];

        Assert.True(order.TryGetProperty("orderDetail", out var details),
            "Order response must include orderDetail and products");

        var detail = details[0];
        Assert.Equal(pid, detail.GetProperty("productId").GetInt32());
        Assert.Equal(3, detail.GetProperty("quantity").GetInt32());
        Assert.Equal("Sushi", detail.GetProperty("product").GetProperty("name").GetString());
        Assert.Equal("Food", detail.GetProperty("product").GetProperty("category").GetString());
    }
}
