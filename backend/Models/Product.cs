using System.ComponentModel.DataAnnotations.Schema;

namespace MyKitchen.Models
{
    [Table("products")]
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Price { get; set; }
        [ForeignKey("CategoryId")]
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Image { get; set; } = string.Empty;
        public int RestaurantId { get; set; }
    }
}
