'use client';
import { useMemo } from 'react';
import KitchenView from './KitchenView';
import { useOrdersContext } from '../../../OrdersContext';

export default function CocinaPage() {
  // Live global state of every current order, kept in sync by the SignalR hub.
  const { openOrders } = useOrdersContext();

  const activeOrders = useMemo(() => {
    return openOrders.filter((order) => order.orderDetail.length > 0);
  }, [openOrders]);

  return <KitchenView activeOrders={activeOrders} />;
}