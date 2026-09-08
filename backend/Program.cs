using RestaurantCRM.Hubs;
using RestaurantCRM.Data;
using RestaurantCRM.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

var myAllowedSpecifiedOrigins = "_myAllowedSpecifiedOrigins";
// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowedSpecifiedOrigins,
        policy =>
        {
            var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                          ?? new[] { "http://localhost:5173", "https://localhost:3000" };
            policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });


builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        // Match the MVC serializer so hub payloads ship enums as strings too
        // (e.g. OrderStatus "OPEN"/"PAID"), keeping frontend models identical
        // whether the data came from a REST call or the real-time hub.
        options.PayloadSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });


builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (builder.Configuration.GetValue<bool>("UseInMemoryDatabase"))
        options.UseInMemoryDatabase(builder.Configuration["InMemoryDatabaseName"] ?? "RestaurantCrm");
    else
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddAuthentication("cookie")
  .AddCookie("cookie", options =>
  {
      options.Cookie.Name = "AuthorizationCookies";
      options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
      options.Cookie.HttpOnly = true;
      // Require HTTPS in production; allow plain HTTP in development so local
      // dev (http://localhost:3000) and the HTTP test host can carry the cookie.
      options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
          ? CookieSecurePolicy.SameAsRequest
          : CookieSecurePolicy.Always;

      options.Events = new CookieAuthenticationEvents
      {
          OnRedirectToLogin = context =>
          {
              context.Response.StatusCode = 401;
              return Task.CompletedTask;
          },
          OnRedirectToAccessDenied = context =>
          {
              context.Response.StatusCode = 403;
              return Task.CompletedTask;
          }
      };
  });

// Role-based authorization policies. Controllers/actions opt in via
// [Authorize] (any authenticated user) or [Authorize(Policy = AdminOnly)].
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAuthenticatedUser().RequireRole(Roles.Admin));
    options.AddPolicy("Authenticated", policy =>
        policy.RequireAuthenticatedUser());
});

var app = builder.Build();

// Seed a default admin on first run so there is always a privileged account.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (!db.Users.Any(u => u.Role == Roles.Admin))
    {
        db.Users.Add(new User
        {
            UserName = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123", workFactor: 12),
            Role = Roles.Admin
        });
        await db.SaveChangesAsync();
    }
}

app.UseHttpsRedirection();

app.UseRouting();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(myAllowedSpecifiedOrigins);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<RestaurantHub>("/hub");

app.Run();

public partial class Program { }
