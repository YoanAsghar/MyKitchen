import { config } from "../config";
import { Order, OrderStatus, PaymentMethod } from "../models/order";
import { orderDetail } from "../models/orderDetails";
import { Product } from "../models/product";

const API_URL = `${config.apiRoute}/api/v1/Order`

// Maps a raw API order (camelCase JSON) into a typed Order instance so the rest
// of the app can rely on real Date objects and typed enums everywhere.
export function toOrder(raw: any): Order {
  const order = new Order(raw.tableId ?? 0, raw.restaurantId ?? 0);
  order.id = raw.id ?? 0;
  order.totalPrice = raw.totalPrice ?? 0;
  order.orderDate = new Date(raw.orderDate);
  order.guests = raw.guests ?? 0;
  order.tip = raw.tip ?? 0;
  order.paymentMethod = (raw.paymentMethod as PaymentMethod) ?? PaymentMethod.CASH;
  order.status = (raw.status as OrderStatus) ?? OrderStatus.OPEN;
  order.orderDetail = (raw.orderDetail ?? []).map((detail: any) => {
    const product = detail.product
      ? new Product(
          detail.product.id,
          detail.product.name,
          detail.product.price,
          detail.product.category,
          detail.product.description,
          detail.product.image,
          detail.product.restaurantId ?? 0
        )
      : undefined;
    const typed = new orderDetail(
      detail.id,
      detail.productId,
      product as Product,
      detail.quantity,
      detail.restaurantId ?? 0,
      detail.orderId
    );
    return typed;
  });
  return order;
}

export const OrderServices = {
  getAll: async (dateQuery: string): Promise<Order[]> => {
    const response = await fetch(API_URL + `?date=${dateQuery}`, { credentials: "include" });
    if(!response.ok) throw new Error ("Error fetching orders")

    const data = await response.json();
    return Array.isArray(data) ? data.map(toOrder) : [];
  },

  // All current OPEN orders across tables — the snapshot that seeds the
  // global real-time state before the SignalR hub keeps it fresh.
  getActive: async (): Promise<Order[]> => {
    const response = await fetch(API_URL + "/active", { credentials: "include" });
    if(!response.ok) throw new Error ("Error fetching active orders");

    const data = await response.json();
    return Array.isArray(data) ? data.map(toOrder) : [];
  },

  // Upserts the OPEN order for the table. An empty cart clears it server-side.
  // Every connected client receives the broadcasted result via the hub.
  saveOpenOrder: async (order: Order): Promise<Order> => {
    const response = await fetch(`${API_URL}/table/${order.tableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({
        tableId: order.tableId,
        guests: order.guests,
        tip: order.tip,
        paymentMethod: order.paymentMethod,
        orderDetail: order.orderDetail.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity
        }))
      })
    });

    if(!response.ok) throw new Error("Error saving order");

    const data = await response.json();
    return toOrder(data);
  },

  createOrder: async(order: Order): Promise<Order> => {
    const orderPayload = {
      id: order.id,
      totalPrice: order.totalPrice,
      orderDate: order.orderDate,
      guests: order.guests,
      tip: order.tip,
      paymentMethod: order.paymentMethod,
      tableId: order.tableId,
      restaurantId: order.restaurantId,
      orderDetail: order.orderDetail.map(detail => ({
        id: detail.id || 0,
        orderId: detail.orderId || 0,
        productId: detail.productId,
        quantity: detail.quantity
      }))
    };
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify(orderPayload)
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if(!response.ok) {
      throw new Error(typeof data === 'string' ? data : (data.title || "Problem creating order"));
    }

    return toOrder(data);
  }
}