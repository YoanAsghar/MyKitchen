
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantCRM.Models
{
    [Table("restaurants")]
    public class Restaurants
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Adress { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.Now;
    }
}
