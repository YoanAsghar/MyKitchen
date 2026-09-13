'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useGlobalContext } from "./GlobalContext";
import { Order } from "../models/order";
import { OrderServices, toOrder } from "../services/OrderServices";
import { signalRService } from "../services/SignalRService";

// Global state of every current (OPEN) order, shared across all clients.
// - Seeded from GET /api/v1/Order/active on connect (snapshot).
// - Kept live via the SignalR hub: OrderUpdated upserts, OrderClosed removes.
// - syncOpenOrder/clearOpenOrder persist a local change so the backend
//   broadcasts it to every connected client (including this one, canonical).
interface OrdersContextType {
  openOrders: Order[];
  isLive: boolean;
  syncOpenOrder: (order: Order) => void;
  clearOpenOrder: (tableId: number) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Coalesce keystroke-level draft changes into a single PUT per table.
const DEBOUNCE_MS = 500;

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useGlobalContext();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [isLive, setIsLive] = useState(false);
  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const upsertLocal = useCallback((order: Order) => {
    setOpenOrders((prev) => {
      const index = prev.findIndex((o) => o.tableId === order.tableId);
      if (index === -1) return [...prev, order];
      const next = [...prev];
      next[index] = order;
      return next;
    });
  }, []);

  const removeLocal = useCallback((tableId: number) => {
    setOpenOrders((prev) => prev.filter((o) => o.tableId !== tableId));
  }, []);

  const resync = useCallback(async () => {
    try {
      const current = await OrderServices.getActive();
      setOpenOrders(current);
    } catch (error) {
      console.error("Failed to re-sync active orders:", error);
    }
  }, []);

  const scheduleDebounced = useCallback((key: number, fn: () => void) => {
    const timers = debounceTimers.current;
    const existing = timers.get(key);
    if (existing) clearTimeout(existing);
    timers.set(key, setTimeout(() => {
      timers.delete(key);
      fn();
    }, DEBOUNCE_MS));
  }, []);

  const persist = useCallback(async (order: Order) => {
    try {
      const saved = await OrderServices.saveOpenOrder(order);
      upsertLocal(saved);
    } catch (error) {
      console.error("Error syncing open order:", error);
    }
  }, [upsertLocal]);

  const clearPersist = useCallback(async (tableId: number) => {
    try {
      // An empty cart tells the server to delete the open order and broadcast.
      await OrderServices.saveOpenOrder(new Order(tableId, 0));
      removeLocal(tableId);
    } catch (error) {
      console.error("Error clearing open order:", error);
    }
  }, [removeLocal]);

  // Optimistic update so the originator's UI is instant; the debounced PUT
  // persists, then the hub broadcast keeps every client (including this one)
  // on the canonical server shape.
  const syncOpenOrder = useCallback((order: Order) => {
    upsertLocal(order);
    scheduleDebounced(order.tableId, () => persist(order));
  }, [upsertLocal, scheduleDebounced, persist]);

  const clearOpenOrder = useCallback((tableId: number) => {
    removeLocal(tableId);
    scheduleDebounced(tableId, () => clearPersist(tableId));
  }, [removeLocal, scheduleDebounced, clearPersist]);

  // On auth: load the snapshot, then open the hub connection and stay in sync.
  useEffect(() => {
    if (!isAuthenticated) {
      debounceTimers.current.forEach((timer) => clearTimeout(timer));
      debounceTimers.current.clear();
      setOpenOrders([]);
      setIsLive(false);
      signalRService.disconnect();
      return;
    }

    let active = true;
    (async () => {
      try {
        const current = await OrderServices.getActive();
        if (!active) return;
        setOpenOrders(current);

        await signalRService.connect(
          (orderRaw) => { if (active) upsertLocal(toOrder(orderRaw)); },
          (payload) => { if (active) removeLocal(payload.tableId); },
          () => { if (active) resync(); }
        );
        if (active) setIsLive(true);
      } catch (error) {
        console.error("Failed to start real-time order sync:", error);
      }
    })();

    return () => { active = false; };
  }, [isAuthenticated, upsertLocal, removeLocal, resync]);

  const value = useMemo(() => ({
    openOrders,
    isLive,
    syncOpenOrder,
    clearOpenOrder,
  }), [openOrders, isLive, syncOpenOrder, clearOpenOrder]);

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrdersContext must be used within an OrdersProvider");
  }
  return context;
}