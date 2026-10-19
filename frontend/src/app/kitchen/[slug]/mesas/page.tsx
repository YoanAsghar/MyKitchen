'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "../../../../models/table";
import { Product } from "../../../../models/product";
import { Category } from "../../../../models/category";
import { ProductServices } from "../../../../services/ProductServices";
import { CategoryServices } from "../../../../services/CategoryServices";
import TablesContent from "./TablesContent";
import TableInformation from "./tableInformation";
import { useGlobalContext } from "../../../GlobalContext";
import { useOrdersContext } from "../../../OrdersContext";

export default function MesasPage() {
  const { setIsLoading, isAuthenticated, role, isAuthChecking } = useGlobalContext();
  // The single real-time source of tables and current orders — shared with
  // Cocina/Ordenes and every other connected client through the SignalR hub
  // (creating/deleting a table or an order syncs across all of them).
  const { openOrders, syncOpenOrder, clearOpenOrder, tables, addTable, removeTable } = useOrdersContext();

  // Table related status and functions
  const [currentTableSelectedId, setCurrentTableSelectedId] = useState<number>(1);

  // Merge the global open orders onto each table for display; the hub keeps
  // openOrders fresh, so every client renders the same live picture. Tables are
  // ordered by id so "Mesa N" maps to their 1-based position everywhere.
  const tablesWithOrders = useMemo(() => {
    const orderByTable = new Map(openOrders.map((o) => [o.tableId, o]));
    return tables
      .slice()
      .sort((a, b) => a.id - b.id)
      .map((t) => ({ ...t, order: orderByTable.get(t.id) }));
  }, [tables, openOrders]);

  // Derive the selected table from the tables array (memoized to prevent new object references)
  const selectedTable = useMemo(
    () => tablesWithOrders.find(t => t.id === currentTableSelectedId) || tablesWithOrders[0] || new Table(currentTableSelectedId, 0),
    [tablesWithOrders, currentTableSelectedId]
  );

  // 1-based position of the selected table within the (id-sorted) list.
  const selectedTableNumber = Math.max(
    1,
    tablesWithOrders.findIndex((t) => t.id === selectedTable.id) + 1
  );

  const handleUpdateTable = useCallback((updatedTable: Table) => {
    // Table identity lives in the global tables state; order state lives in the
    // global context (openOrders), so a table edit only syncs its order.
    if (updatedTable.order) {
      syncOpenOrder(updatedTable.order);
    } else {
      clearOpenOrder(updatedTable.id);
    }
  }, [syncOpenOrder, clearOpenOrder]);

  const handleSelectTable = useCallback((table: Table) => {
    setCurrentTableSelectedId(table.id);
  }, []);

  const handleAddTable = async () => {
    setIsLoading(true);
    try {
      // The hub broadcast (TableCreated) adds the table on every client.
      await addTable();
    } catch (error) {
      console.error("Error adding table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTable = async () => {
    setIsLoading(true);
    try {
      const selected = tables.find(t => t.id === currentTableSelectedId) ?? tables[0];
      if (selected?.id) await removeTable(selected.id);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  // Product and category states (needed for TableInformation)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isAuthenticated || isAuthChecking) return;
    ProductServices.getAll()
      .then(setProducts)
      .catch(console.error);
    CategoryServices.getAll()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [isAuthenticated, isAuthChecking]);

  return (
    <div className="tab-content-wrapper flex flex-row w-full h-full">
      <TablesContent
        selectedTable={selectedTable}
        tables={tablesWithOrders}
        onSelect={setCurrentTableSelectedId}
        onAddTable={handleAddTable}
        onRemoveTable={handleRemoveTable}
        role={role}
        setSelectedTable={handleSelectTable}
      />
      <TableInformation
        products={products}
        categories={categories}
        key={currentTableSelectedId}
        table={selectedTable}
        tableNumber={selectedTableNumber}
        onUpdateTable={handleUpdateTable}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

