using MyKitchen.Models;

namespace MyKitchen.Services
{
    // Shared projection used by OrderController + TableController: flattens
    // Order -> OrderDetail -> Product into a clean wire shape (no EF cycles,
    // no need for the client to make follow-up calls to resolve products).
    public static class OrderProjection
    {
        public static IQueryable<Order> Project(IQueryable<Order> source)
        {
            return source.Select(o => new Order
            {
                Id = o.Id,
                TotalPrice = o.TotalPrice,
                OrderDate = o.OrderDate,
                Guests = o.Guests,
                Tip = o.Tip,
                PaymentMethod = o.PaymentMethod,
                Status = o.Status,
                TableId = o.TableId,
                OrderDetail = o.OrderDetail.Select(od => new OrderDetail
                {
                    Id = od.Id,
                    OrderId = od.OrderId,
                    ProductId = od.ProductId,
                    Product = new Product
                    {
                        Id = od.Product!.Id,
                        Name = od.Product.Name,
                        Price = od.Product.Price,
                        CategoryId = od.Product.CategoryId,
                        Description = od.Product.Description,
                        Image = null
                    },
                    Quantity = od.Quantity
                }).ToList()
            });
        }
    }
}