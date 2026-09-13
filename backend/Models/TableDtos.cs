namespace MyKitchen.Models
{
    public class TableResponseDto
    {
        public int Id { get; set; }
        public int? TableNumber { get; set; }
        public Order? Order { get; set; }
    }
}
