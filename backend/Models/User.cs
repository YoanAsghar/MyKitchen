namespace MyKitchen.Models
{
    // Canonical role names. Stored as lowercase strings on the wire and in
    // claims; used by the authorization policies in Program.cs and the
    // frontend (role === "admin").
    public static class Roles
    {
        public const string Admin = "admin";
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
