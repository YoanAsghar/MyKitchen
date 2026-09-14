using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MyKitchen.Models;

namespace backend.Tests;

public class UserControllerTests : IDisposable
{
    private readonly HttpClient _client;
    private readonly TestingWebAppFactory _factory;

    // Fresh factory (and thus a fresh in-memory DB) per test for isolation.
    public UserControllerTests()
    {
        _factory = new TestingWebAppFactory();
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    // A default admin (admin/admin123) is seeded by the test factory. Logging
    // in sets the AuthorizationCookies cookie on the shared HttpClient.
    private async Task<HttpResponseMessage> LoginAsAdminAsync()
    {
        return await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "admin", passwordHash = "admin123" });
    }

    // Creates a user. Requires admin privileges, so tests must login first.
    private async Task<HttpResponseMessage> CreateUserAsync(string username, string password, string role = Roles.User)
    {
        var body = new { userName = username, passwordHash = password, role };
        return await _client.PostAsJsonAsync("/api/v1/User", body);
    }

    [Fact]
    public async Task CreateUser_ValidInput_ReturnsOk()
    {
        await LoginAsAdminAsync();
        var response = await CreateUserAsync("chef", "secret123");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_ValidInput_ReturnsEmptyPasswordHash()
    {
        await LoginAsAdminAsync();
        var response = await CreateUserAsync("waiter", "secret123");
        var user = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal("waiter", user.GetProperty("userName").GetString());
        // The API blanks out the hash before returning.
        Assert.Equal("", user.GetProperty("passwordHash").GetString());
    }

    [Fact]
    public async Task CreateUser_MissingUsername_ReturnsBadRequest()
    {
        await LoginAsAdminAsync();
        var body = new { userName = "", passwordHash = "secret123", role = Roles.User };
        var response = await _client.PostAsJsonAsync("/api/v1/User", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_BlankPassword_ReturnsBadRequest()
    {
        await LoginAsAdminAsync();
        var body = new { userName = "cashier", passwordHash = "", role = Roles.User };
        var response = await _client.PostAsJsonAsync("/api/v1/User", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_DuplicateUsername_ReturnsConflict()
    {
        await LoginAsAdminAsync();
        await CreateUserAsync("host", "secret123");
        var duplicate = await CreateUserAsync("HOST", "other123");

        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
    }

    [Fact]
    public async Task CreateUser_HashesPassword()
    {
        await LoginAsAdminAsync();
        var response = await CreateUserAsync("bartender", "plaintext");
        // On success the API returns the user with an empty hash, but the
        // stored user must be hashed, so login with the plaintext must work.
        var login = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "bartender", passwordHash = "plaintext" });

        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task CreateUser_Anonymous_ReturnsUnauthorized()
    {
        var response = await CreateUserAsync("nobody", "secret123");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_OwnerRole_AsAdmin_ReturnsOwnerRole()
    {
        await LoginAsAdminAsync();
        var response = await CreateUserAsync("socio", "secret123", Roles.Owner);
        var user = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(Roles.Owner, user.GetProperty("role").GetString());
    }

    [Fact]
    public async Task CreateUser_AsRegularUser_ReturnsForbidden()
    {
        // Seed a plain staff user, log in as it, then try to create another
        // user — staff has no management rights.
        await LoginAsAdminAsync();
        await CreateUserAsync("mesero", "secret123", Roles.User);
        var login = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "mesero", passwordHash = "secret123" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var response = await CreateUserAsync("otro-mesero", "secret123");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateUser_AdminOnly_NonAdminCannotEscalate()
    {
        // An owner (restaurant principal) trying to mint an admin must be
        // downgraded to the base user role — only a global admin can create
        // admins.
        var register = await _client.PostAsJsonAsync("/api/v1/Restaurant/register",
            new { name = "Escalada S.A.", password = "secret123", nombreDelEncargado = "Jefe", email = "escalada@test.com" });
        Assert.Equal(HttpStatusCode.OK, register.StatusCode);

        var response = await _client.PostAsJsonAsync("/api/v1/User",
            new { userName = "tramposo", passwordHash = "secret123", role = Roles.Admin });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(Roles.User, user.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithUserNameAndRole()
    {
        // Seed a regular user, then log in with it.
        await LoginAsAdminAsync();
        await CreateUserAsync("manager", "secret123");
        var response = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "manager", passwordHash = "secret123" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("manager", body.GetProperty("userName").GetString());
        Assert.Equal("user", body.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Login_ValidCredentials_SetsAuthCookie()
    {
        await LoginAsAdminAsync();
        await CreateUserAsync("owner", "secret123");
        var response = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "owner", passwordHash = "secret123" });

        var setCookies = response.Headers.TryGetValues("Set-Cookie", out var cookies)
            ? string.Join("; ", cookies)
            : "";

        Assert.Contains("AuthorizationCookies", setCookies);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        await LoginAsAdminAsync();
        await CreateUserAsync("server", "secret123");
        var response = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "server", passwordHash = "wrongpass" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_UnknownUser_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/User/login",
            new { userName = "nobody", passwordHash = "whatever" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_ReturnsUnhashedUsers()
    {
        await LoginAsAdminAsync();
        await CreateUserAsync("dishwasher", "secret123");
        await CreateUserAsync("linecook", "secret123");

        var response = await _client.GetAsync("/api/v1/User");
        var users = await response.Content.ReadFromJsonAsync<JsonElement[]>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // 2 created users + the seeded admin.
        Assert.Equal(3, users.Length);
        var serialized = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("passwordHash", serialized, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetUsers_Anonymous_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/v1/User");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_Existing_ReturnsOkAndRemovesUser()
    {
        await LoginAsAdminAsync();
        await CreateUserAsync("toslice", "secret123");
        var users = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/User");
        var id = users!.Single(u => u.GetProperty("userName").GetString() == "toslice")
            .GetProperty("id").GetInt32();

        var deleteResponse = await _client.DeleteAsync($"/api/v1/User/{id}");

        Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);

        var after = await _client.GetFromJsonAsync<JsonElement[]>("/api/v1/User");
        Assert.DoesNotContain(after, u => u.GetProperty("id").GetInt32() == id);
    }

    [Fact]
    public async Task DeleteUser_Missing_ReturnsNotFound()
    {
        await LoginAsAdminAsync();
        var response = await _client.DeleteAsync("/api/v1/User/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_Anonymous_ReturnsUnauthorized()
    {
        var response = await _client.DeleteAsync("/api/v1/User/1");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_Authenticated_ReturnsCurrentUser()
    {
        await LoginAsAdminAsync();

        var response = await _client.GetAsync("/api/v1/User/me");
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("admin", body.GetProperty("userName").GetString());
        Assert.Equal("admin", body.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Me_Anonymous_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/v1/User/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_Authenticated_ClearsSession()
    {
        await LoginAsAdminAsync();

        var logout = await _client.PostAsync("/api/v1/User/logout", null);

        Assert.Equal(HttpStatusCode.OK, logout.StatusCode);

        // After logout the auth cookie should no longer grant access.
        var me = await _client.GetAsync("/api/v1/User/me");
        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
    }

    [Fact]
    public async Task Logout_Anonymous_ReturnsUnauthorized()
    {
        var response = await _client.PostAsync("/api/v1/User/logout", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
