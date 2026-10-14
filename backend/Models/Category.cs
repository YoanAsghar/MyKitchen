using System.ComponentModel.DataAnnotations.Schema;

namespace MyKitchen.Models
{
    [Table("categories")]
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int RestaurantId { get; set; }
    }
}
