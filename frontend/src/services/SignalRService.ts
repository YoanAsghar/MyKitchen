import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { config } from "../config";

// Mirror of backend/Hubs/Hub.cs -> HubEvents. Keep both in sync.
export const HubEvents = {
  OrderUpdated: "OrderUpdated",
  OrderClosed: "OrderClosed",
  TableCreated: "TableCreated",
  TableDeleted: "TableDeleted",
} as const;

type OrderUpdatedHandler = (order: any) => void;
type OrderClosedHandler = (payload: { tableId: number }) => void;
type TableCreatedHandler = (table: any) => void;
type TableDeletedHandler = (payload: { tableId: number }) => void;

/**
 * Thin wrapper around the SignalR hub connection. Owns the connection lifecycle
 * (connect/disconnect + automatic reconnect). The OrdersContext registers the
 * event handlers and re-syncs the snapshot after a reconnect.
 */
class SignalRService {
  private connection: HubConnection | null = null;

  async connect(
    onOrderUpdated: OrderUpdatedHandler,
    onOrderClosed: OrderClosedHandler,
    onReconnected: () => void,
    onTableCreated: TableCreatedHandler,
    onTableDeleted: TableDeletedHandler
  ): Promise<void> {
    if (this.connection) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${config.apiRoute}/hub`, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on(HubEvents.OrderUpdated, onOrderUpdated);
    connection.on(HubEvents.OrderClosed, onOrderClosed);
    connection.on(HubEvents.TableCreated, onTableCreated);
    connection.on(HubEvents.TableDeleted, onTableDeleted);
    connection.onreconnected(onReconnected);

    this.connection = connection;
    await connection.start();
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    const connection = this.connection;
    this.connection = null;
    connection.off(HubEvents.OrderUpdated);
    connection.off(HubEvents.OrderClosed);
    connection.off(HubEvents.TableCreated);
    connection.off(HubEvents.TableDeleted);
    await connection.stop().catch(() => {});
  }
}

export const signalRService = new SignalRService();