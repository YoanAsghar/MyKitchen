using RestaurantCRM.Models;

using Microsoft.EntityFrameworkCore;

namespace RestaurantCRM.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
          : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<OrderDetail> OrdersDetails { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Restaurants> Restaurants { get; set; }
    }
}
