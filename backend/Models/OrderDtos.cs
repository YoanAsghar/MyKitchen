using MyKitchen.Models;

namespace MyKitchen.Models
{
    public class SaveOpenOrderRequest
    {
        public int? Id { get; set; }
        public int TableId { get; set; }
        public int Guests { get; set; }
        public int Tip { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CASH;
        public string? Comment { get; set; }
        public List<SaveOrderDetailRequest> OrderDetail { get; set; } = new();
    }

    public class SaveOrderDetailRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}