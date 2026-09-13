using System.ComponentModel.DataAnnotations.Schema;
using MyKitchen.Models;

namespace MyKitchen.Models
{
    public enum ExpenseTypes
    {
        BILLS,
        GROCERIES,
        SALARY,
        SERVICES
    }
    public class Expense
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Value { get; set; }
        public ExpenseTypes ExpenseType { get; set; }
        public DateTime DateOfTheExpense { get; set; }
        public int CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User? CreatedByUser { get; set; }

        public int RestaurantId {get; set;}
    }
}
