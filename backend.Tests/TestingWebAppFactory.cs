using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace backend.Tests;

public class TestingWebAppFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"MyKitchen_{Guid.NewGuid():N}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Use an in-memory EF provider (see Program.cs), unique per instance,
        // so tests don't touch PostgreSQL and don't share state.
        builder.UseSetting("UseInMemoryDatabase", "true");
        builder.UseSetting("InMemoryDatabaseName", _dbName);
    }
}
