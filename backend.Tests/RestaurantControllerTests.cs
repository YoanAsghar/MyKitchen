using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MyKitchen.Models;

namespace backend.Tests;

public class RestaurantControllerTests : IDisposable
{
    private readonly HttpClient _client;
    private readonly TestingWebAppFactory _factory;

    public RestaurantControllerTests()
    {
        _factory = new TestingWebAppFactory();
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    // Registers a fresh restaurant + admin and auto-login sets the session
    // cookie on the shared HttpClient for subsequent calls. The admin
    // username is the email (per the register design).
    private async Task<HttpResponseMessage> RegisterAsync(string restaurantName = "La Parrilla",
        string email = "owner@laparrilla.com", string password = "secret123",
        string encargado = "Juan Pérez", string phoneNumber = "1155551234")
    {
        return await _client.PostAsJsonAsync("/api/v1/Restaurant/register",
            new
            {
                name = restaurantName,
                password,
                nombreDelEncargado = encargado,
                email,
                phoneNumber
            });
    }

    private async Task<int> GetCurrentRestaurantIdAsync()
    {
        var me = await _client.GetFromJsonAsync<JsonElement>("/api/v1/User/me");
        return me.GetProperty("restaurantId").GetInt32();
    }

    [Fact]
    public async Task Register_ValidInput_ReturnsOkWithRestaurantAndSetsCookie()
    {
        var response = await RegisterAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.True(body.GetProperty("restaurantId").GetInt32() > 0);
        Assert.Equal("La Parrilla", body.GetProperty("restaurant").GetProperty("name").GetString());
        // Never expose the password hash on the wire.
        Assert.False(body.GetProperty("restaurant").TryGetProperty("passwordHash", out _));

        var setCookies = response.Headers.TryGetValues("Set-Cookie", out var cookies)
            ? string.Join("; ", cookies)
            : "";
        Assert.Contains("AuthorizationCookies", setCookies);
    }

    [Fact]
    public async Task Register_AutoLogsIn_MeReturnsRestaurantId()
    {
        await RegisterAsync();

        var me = await _client.GetFromJsonAsync<JsonElement>("/api/v1/User/me");

        Assert.Equal("owner@laparrilla.com", me.GetProperty("userName").GetString());
        // Signup creates an Owner (the restaurant's principal), not an admin.
        Assert.Equal(Roles.Owner, me.GetProperty("role").GetString());
        Assert.True(me.GetProperty("restaurantId").GetInt32() > 0);
        // The userId claim must round-trip so the server can stamp authors.
        Assert.True(me.GetProperty("userId").GetInt32() > 0);
    }

    [Fact]
    public async Task Register_ThenLogin_MeReturnsRestaurantId()
    {
        await RegisterAsync();
        var restaurantId = await GetCurrentRestaurantIdAsync();

        // Log out, then log back in with the raw credentials (email as
        // username). The login cookie must carry the same restaurant scope.
        await _client.PostAsync("/api/v1/User/logout", null);
        var login = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "owner@laparrilla.com", passwordHash = "secret123" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var me = await _client.GetFromJsonAsync<JsonElement>("/api/v1/User/me");
        Assert.Equal(restaurantId, me.GetProperty("restaurantId").GetInt32());
    }

    [Fact]
    public async Task Register_DuplicateName_ReturnsConflict()
    {
        await RegisterAsync("El Rincón");

        var duplicate = await RegisterAsync("el RINCÓN", "otro@mail.com");

        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        await RegisterAsync("Primera", "admin@resto.com");

        var duplicate = await RegisterAsync("Segunda", "ADMIN@resto.com");

        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task Register_MissingName_ReturnsBadRequest()
    {
        var missing = await RegisterAsync("", "ownerx@mail.com");

        Assert.Equal(HttpStatusCode.BadRequest, missing.StatusCode);
    }

    [Fact]
    public async Task Register_InvalidEmail_ReturnsBadRequest()
    {
        var invalid = await RegisterAsync("La Picada", "no-es-un-email");

        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    [Fact]
    public async Task Register_ShortPassword_ReturnsBadRequest()
    {
        var shortPw = await RegisterAsync("La Picada", "ownerx@mail.com", "abc");

        Assert.Equal(HttpStatusCode.BadRequest, shortPw.StatusCode);
    }

    [Fact]
    public async Task GetRestaurant_Authenticated_ReturnsOwnRestaurant()
    {
        await RegisterAsync("Casa Tita", "te@casa-tita.com", "secret123", "Juana Giménez", "1166677766");

        var restaurant = await _client.GetFromJsonAsync<JsonElement>("/api/v1/Restaurant");

        Assert.Equal("Casa Tita", restaurant.GetProperty("name").GetString());
        Assert.Equal("Juana Giménez", restaurant.GetProperty("nombreDelEncargado").GetString());
        Assert.Equal("te@casa-tita.com", restaurant.GetProperty("email").GetString());
        Assert.Equal("1166677766", restaurant.GetProperty("phoneNumber").GetString());
        Assert.False(restaurant.TryGetProperty("passwordHash", out _));
    }

    [Fact]
    public async Task GetRestaurant_Anonymous_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/v1/Restaurant");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRestaurant_Own_ReturnsUpdated()
    {
        await RegisterAsync();
        var restaurantId = await GetCurrentRestaurantIdAsync();

        var response = await _client.PutAsJsonAsync($"/api/v1/Restaurant/{restaurantId}",
            new
            {
                name = "La Parrilla Renovada",
                password = "secret123",
                nombreDelEncargado = "Nuevo Encargado",
                email = "owner@laparrilla.com",
                phoneNumber = "1100000000"
            });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("La Parrilla Renovada", updated.GetProperty("name").GetString());
        Assert.Equal("Nuevo Encargado", updated.GetProperty("nombreDelEncargado").GetString());
    }

    [Fact]
    public async Task UpdateRestaurant_OtherRestaurant_ReturnsForbidden()
    {
        await RegisterAsync();
        var ownId = await GetCurrentRestaurantIdAsync();

        // A different (even non-existent) id must never be editable.
        var response = await _client.PutAsJsonAsync($"/api/v1/Restaurant/{ownId + 10}",
            new { name = "Otra cosa" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteRestaurant_Own_CascadesData()
    {
        await RegisterAsync("La Cascada");
        var restaurantId = await GetCurrentRestaurantIdAsync();

        // Seed data owned by this restaurant.
        await _client.PostAsJsonAsync("/api/v1/User",
            new { userName = "cocinero", passwordHash = "secret123", role = Roles.User });
        await _client.PostAsJsonAsync("/api/v1/Product",
            new
            {
                name = "Milanesa",
                price = 12.5,
                category = "Plato",
                description = "Con papas",
                restaurantId
            });

        var delete = await _client.DeleteAsync($"/api/v1/Restaurant/{restaurantId}");
        Assert.Equal(HttpStatusCode.OK, delete.StatusCode);

        // The restaurant's data is gone.
        var users = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/User");
        Assert.DoesNotContain(users, u => u.GetProperty("userName").GetString() == "cocinero");
        Assert.DoesNotContain(users, u => u.GetProperty("userName").GetString() == "owner@laparrilla.com");

        var products = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/Product/search");
        Assert.DoesNotContain(products, p => p.GetProperty("name").GetString() == "Milanesa");

        var restaurant = await _client.GetAsync("/api/v1/Restaurant");
        Assert.Equal(HttpStatusCode.NotFound, restaurant.StatusCode);
    }

    [Fact]
    public async Task DeleteRestaurant_Anonymous_ReturnsUnauthorized()
    {
        var response = await _client.DeleteAsync("/api/v1/Restaurant/1");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}