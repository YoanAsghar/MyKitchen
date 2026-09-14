namespace MyKitchen.Models
{
    // Canonical role names. Stored as lowercase strings on the wire and in
    // claims; used by the authorization policies in Program.cs and the
    // frontend (role === "admin" || role === "owner" gates management UI).
    public static class Roles
    {
        // Global super-admin (bootstrap). Can manage any restaurant.
        public const string Admin = "admin";
        // Restaurant principal: owns the restaurant + its credentials; can
        // manage its users and profile. Created at signup (register).
        public const string Owner = "owner";
        // Regular staff: works the app but has no management rights.
        public const string User = "user";
    }

    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = Roles.User;
        public float Salary { get; set; }
        public DateOnly PaymentDate { get; set; }
        public int RestaurantId {get; set;}
    }
}
