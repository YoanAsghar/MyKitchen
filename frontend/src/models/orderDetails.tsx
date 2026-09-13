import type { Product } from "./product";

export class orderDetail {
  id?: number;
  productId: number;
  product?: Product;
  quantity: number;
  restaurantId: number;
  orderId?: number;

  constructor(id:number, productId: number, product: Product, quantity: number, restaurantId: number, orderId?: number){
    this.id = id;
    this.productId = productId;
    this.product = product;
    this.quantity = quantity;
    this.restaurantId = restaurantId;
    this.orderId = orderId || 0;
  }
}
