'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useGlobalContext } from "./GlobalContext";
import { Order } from "../models/order";
import { OrderServices, toOrder } from "../services/OrderServices";
import { signalRService } from "../services/SignalRService";
import { Table } from "../models/table";
import { TableServices } from "../services/TableServices";

// Global real-time state shared across all clients of a restaurant:
// - openOrders: every current (OPEN) order. Seeded from GET /api/v1/Order/active
//   on connect (snapshot); kept live via the hub (OrderUpdated upserts,
//   OrderClosed removes).
// - tables: the restaurant's tables. Seeded from GET /api/v1/Table; kept live
//   via TableCreated/TableDeleted broadcasts so adding/removing a table on one
//   client is reflected on every connected client (Mesas, Cocina, Ordenes).
// - syncOpenOrder/clearOpenOrder persist a local change so the backend
//   broadcasts it to every connected client (including this one, canonical).
interface OrdersContextType {
  openOrders: Order[];
  isLive: boolean;
  syncOpenOrder: (order: Order) => void;
  clearOpenOrder: (tableId: number) => void;
  tables: Table[];
  tableNumbers: Map<number, number>;
  addTable: () => Promise<void>;
  removeTable: (tableId: number) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useGlobalContext();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLive, setIsLive] = useState(false);

  // 1-based "Mesa N" position per table (tables ordered by id), kept consistent
  // with the floor numbering so Cocina/Ordenes label tables the same way.
  const tableNumbers = useMemo(() => {
    const map = new Map<number, number>();
    [...tables]
      .sort((a, b) => a.id - b.id)
      .forEach((t, i) => map.set(t.id, i + 1));
    return map;
  }, [tables]);

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

  const applyTableCreated = useCallback((raw: Table) => {
    setTables((prev) => {
      if (prev.some((t) => t.id === raw.id)) return prev;
      return [...prev, raw];
    });
  }, []);

  const applyTableDeleted = useCallback((payload: { tableId: number }) => {
    setTables((prev) => prev.filter((t) => t.id !== payload.tableId));
  }, []);

  // Create/delete through the API; the hub broadcast then applies the change on
  // every connected client (this one included) for a single source of truth.
  const addTable = useCallback(async () => {
    const created = await TableServices.createTable();
    setTables((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
  }, []);

  const removeTable = useCallback(async (tableId: number) => {
    await TableServices.deleteTable(tableId);
    setTables((prev) => prev.filter((t) => t.id !== tableId));
  }, []);

  const resync = useCallback(async () => {
    const [current, currentTables] = await Promise.all([
      OrderServices.getActive().catch(() => [] as Order[]),
      TableServices.getAll().catch(() => [] as Table[]),
    ]);
    setOpenOrders(current);
    setTables(currentTables);
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

  // Sent when the user commits a table's draft ("Crear orden"/"Editar orden").
  // The local state updates instantly; the PUT persists the order and the hub
  // broadcast keeps every client (this one included) on the canonical shape.
  const syncOpenOrder = useCallback((order: Order) => {
    upsertLocal(order);
    persist(order);
  }, [upsertLocal, persist]);

  const clearOpenOrder = useCallback((tableId: number) => {
    removeLocal(tableId);
    clearPersist(tableId);
  }, [removeLocal, clearPersist]);

  // On auth: load the snapshots, then open the hub connection and stay in sync.
  useEffect(() => {
    if (!isAuthenticated) {
      setOpenOrders([]);
      setTables([]);
      setIsLive(false);
      signalRService.disconnect();
      return;
    }

    let active = true;
    (async () => {
      try {
        const [current, currentTables] = await Promise.all([
          OrderServices.getActive().catch(() => [] as Order[]),
          TableServices.getAll().catch(() => [] as Table[]),
        ]);
        if (!active) return;
        setOpenOrders(current);
        setTables(currentTables);

        await signalRService.connect(
          (orderRaw) => { if (active) upsertLocal(toOrder(orderRaw)); },
          (payload) => { if (active) removeLocal(payload.tableId); },
          () => { if (active) resync(); },
          (tableRaw) => { if (active) applyTableCreated(tableRaw); },
          (payload) => { if (active) applyTableDeleted(payload); }
        );
        if (active) setIsLive(true);
      } catch (error) {
        console.error("Failed to start real-time sync:", error);
      }
    })();

    return () => { active = false; };
  }, [isAuthenticated, upsertLocal, removeLocal, resync, applyTableCreated, applyTableDeleted]);

  const value = useMemo(() => ({
    openOrders,
    isLive,
    syncOpenOrder,
    clearOpenOrder,
    tables,
    tableNumbers,
    addTable,
    removeTable,
  }), [openOrders, isLive, syncOpenOrder, clearOpenOrder, tables, tableNumbers, addTable, removeTable]);

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