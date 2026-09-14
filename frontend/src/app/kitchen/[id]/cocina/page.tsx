'use client';
import { useMemo } from 'react';
import KitchenView from './KitchenView';
import { useOrdersContext } from '../../../OrdersContext';

export default function CocinaPage() {
  // Live global state of every current order and the tables' "Mesa N"
  // numbering, kept in sync by the SignalR hub (orders + table add/delete).
  const { openOrders, tableNumbers } = useOrdersContext();

  const activeOrders = useMemo(() => {
    return openOrders.filter((order) => order.orderDetail.length > 0);
  }, [openOrders]);

  return <KitchenView activeOrders={activeOrders} tableNumbers={tableNumbers} />;
}