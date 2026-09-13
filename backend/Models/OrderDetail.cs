using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MyKitchen.Models
{
    [Table("orderDetails")]
    public class OrderDetail
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        [ForeignKey("ProductId")]
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        [Required]
        public int Quantity { get; set; }
        public int RestaurantId { get; set; }
    }
}
