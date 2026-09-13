import type { orderDetail } from "./orderDetails";

export enum PaymentMethod{
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANS = "BANK_TRANS"
}

export enum OrderStatus{
  OPEN = "OPEN",
  PAID = "PAID"
}

export class Order{
  public static OrderInstances: Order[] = [];

  id: number;
  totalPrice: number;
  orderDate: Date;
  guests: number;
  tip: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  tableId: number;
  orderDetail: orderDetail[];
  restaurantId: number;

  constructor(tableId: number, restaurantId: number){
    this.id = 0;
    this.tableId = tableId;
    this.orderDetail = [];
    this.totalPrice = 0;
    this.orderDate = new Date();
    this.guests = 0;
    this.tip = 0;
    this.paymentMethod = PaymentMethod.CASH;
    this.status = OrderStatus.OPEN;
    this.restaurantId = restaurantId;
  }

  public static getAllOrderInstances(){
    return this.OrderInstances;
  }
}

