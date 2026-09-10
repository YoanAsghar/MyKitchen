'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "../../../../models/table";
import { TableServices } from "../../../../services/TableServices";
import { Product } from "../../../../models/product";
import { ProductServices } from "../../../../services/ProductServices";
import TablesContent from "./TablesContent";
import TableInformation from "./tableInformation";
import { useGlobalContext } from "../../../GlobalContext";
import { useOrdersContext } from "../../../OrdersContext";

export default function MesasPage() {
  const { setIsLoading, isAuthenticated, role, isAuthChecking } = useGlobalContext();
  // The single real-time source of "who has a current order" — shared with Cocina
  // and every other connected client through the SignalR hub.
  const { openOrders, syncOpenOrder, clearOpenOrder } = useOrdersContext();

  // Table related status and functions
  const [tables, setTables] = useState<Table[]>([]);
  const [currentTableSelectedId, setCurrentTableSelectedId] = useState<number>(1);

  // Merge the global open orders onto each table for display; the hub keeps
  // openOrders fresh, so every client renders the same live picture.
  const tablesWithOrders = useMemo(() => {
    const orderByTable = new Map(openOrders.map((o) => [o.tableId, o]));
    return tables.map((t) => ({ ...t, order: orderByTable.get(t.id) }));
  }, [tables, openOrders]);

  // Derive the selected table from the tables array (memoized to prevent new object references)
  const selectedTable = useMemo(
    () => tablesWithOrders.find(t => t.id === currentTableSelectedId) || tablesWithOrders[0] || new Table(currentTableSelectedId),
    [tablesWithOrders, currentTableSelectedId]
  );

  // Retrieve all the created tables
  useEffect(() => {
    if (!isAuthenticated || isAuthChecking) return;
    TableServices.getAll()
      .then(setTables)
      .catch(console.error);
  }, [isAuthenticated, isAuthChecking]);

  const handleUpdateTable = useCallback((updatedTable: Table) => {
    // Keep the table identity; order state lives in the global context.
    setTables((prev) =>
      prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)),
    );
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
      await TableServices.createTable();
      const updatedTables = await TableServices.getAll();
      setTables(updatedTables);
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
      if (selected?.id) await TableServices.deleteTable(selected.id);
      const updatedTables = await TableServices.getAll();
      setTables(updatedTables);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  // Product states (needed for TableInformation)
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isAuthenticated || isAuthChecking) return;
    ProductServices.getAll()
      .then(setProducts)
      .catch(console.error);
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
        key={currentTableSelectedId}
        table={selectedTable}
        onUpdateTable={handleUpdateTable}
         setIsLoading={setIsLoading}
      />
    </div>
  );
}

