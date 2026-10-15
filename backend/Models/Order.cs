using System.ComponentModel.DataAnnotations.Schema;

namespace MyKitchen.Models
{
    public enum PaymentMethod
    {
        CASH,
        CARD,
        BANK_TRANS
    }

    // OPEN: an in-progress order currently placed on a table (drives Mesas + Cocina).
    // PAID: a completed, charged order (drives the Ordenes history page).
    public enum OrderStatus
    {
        OPEN,
        PAID
    }

    [Table("orders")]
    public class Order
    {
        public int Id { get; set; }
        public float TotalPrice { get; set; }
        // Npgsql only accepts UTC for "timestamp with time zone".
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public int Guests { get; set; }
        public int Tip { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CASH;
        public OrderStatus Status { get; set; } = OrderStatus.PAID;
        // Free-text "nota para la cocina" at the order level (optional, max 500).
        public string? Comment { get; set; }
        [ForeignKey("TableId")]
        public int? TableId { get; set; }
        public ICollection<OrderDetail> OrderDetail { get; set; } = new List<OrderDetail>();
        public int RestaurantId { get; set; }
    }
}
