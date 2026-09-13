import { Order } from "./order";

export class Table {

  id: number;
  order?: Order;
  restaurantId: number;

  constructor(id: number, restaurantId: number,  order?: Order) {
    this.id = id;
    this.order = order;
    this.restaurantId = restaurantId;
  }
}
