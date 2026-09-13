using System.ComponentModel.DataAnnotations.Schema;

namespace MyKitchen.Models
{
    [Table("tables")]
    public class Table
    {
        public int Id { get; set; }
        public int? TableNumber { get; set; }
        public int RestaurantId { get; set; }
    }
}
