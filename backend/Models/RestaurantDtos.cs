namespace MyKitchen.Models
{
    // Public signup payload: a brand-new restaurant + its first admin user.
    // "Password" is the raw password; it is BCrypt-hashed before persisting
    // into Restaurants.PasswordHash and reused as the admin user's hash.
    public class RegisterRestaurantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string NombreDelEncargado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    // Wire shape for a restaurant that never exposes its PasswordHash.
    public class RestaurantResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string NombreDelEncargado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
    }
}