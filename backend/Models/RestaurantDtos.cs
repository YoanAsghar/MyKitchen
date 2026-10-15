namespace MyKitchen.Models
{
    // Public signup payload: a brand-new restaurant + its Owner user. "Password"
    // is the Owner's raw password, BCrypt-hashed before persisting into the
    // User row — the restaurant itself stores no credentials.
    public class RegisterRestaurantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string NombreDelEncargado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    // Profile edit payload (Configuración). Unlike signup it carries no
    // password: credentials belong to the Owner user and are changed elsewhere
    // (PUT /User/{id}). Only the restaurant's own owner may send this.
    public class UpdateRestaurantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string NombreDelEncargado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    // Wire shape for a restaurant profile. Credentials live on the Owner user,
    // never on the restaurant row.
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