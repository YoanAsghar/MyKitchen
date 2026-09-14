using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MyKitchen.Data;
using MyKitchen.Models;

namespace backend.Tests;

public class TestingWebAppFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"MyKitchen_{Guid.NewGuid():N}";

    public TestingWebAppFactory()
    {
        // Program.cs no longer seeds a default admin (that was a hardcoded
        // admin/admin123 bootstrap). Seed one here, test-only, so admin-scoped
        // tests can log in. RestaurantId stays 0 = "no restaurant scope".
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        if (!db.Users.Any(u => u.UserName == "admin"))
        {
            db.Users.Add(new User
            {
                UserName = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123", workFactor: 12),
                Role = Roles.Admin
            });
            db.SaveChanges();
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Use an in-memory EF provider (see Program.cs), unique per instance,
        // so tests don't touch PostgreSQL and don't share state.
        builder.UseSetting("UseInMemoryDatabase", "true");
        builder.UseSetting("InMemoryDatabaseName", _dbName);
    }
}
