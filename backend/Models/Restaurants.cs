
using System.ComponentModel.DataAnnotations.Schema;

namespace MyKitchen.Models
{
    [Table("restaurants")]
    public class Restaurants
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string NombreDelEncargado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        // Npgsql only accepts UTC for "timestamp with time zone".
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}
