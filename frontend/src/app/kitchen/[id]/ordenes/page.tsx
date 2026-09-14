'use client';
import { useState, useEffect } from 'react';
import { OrdersContent } from './OrdersContent';
import { OrderServices } from '../../../../services/OrderServices';
import { useGlobalContext } from '../../../GlobalContext';
import { useOrdersContext } from '../../../OrdersContext';
import { Order } from '../../../../models/order';

export default function OrdenesPage() {
  const { isAuthenticated } = useGlobalContext();
  // 1-based "Mesa N" numbering shared with the floor view, kept live by the hub.
  const { tableNumbers } = useOrdersContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersDateQuery, setOrdersDateQuery] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    OrderServices.getAll(ordersDateQuery).then(setOrders);
  }, [isAuthenticated, ordersDateQuery]);

  return (
    <OrdersContent
      orders={orders}
      setOrdersDateQuery={setOrdersDateQuery}
      orderDatesQuery={ordersDateQuery}
      tableNumbers={tableNumbers}
    />
  );
}
