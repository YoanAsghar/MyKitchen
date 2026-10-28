import React from "react";
import { Order } from "../../../../models/order";
import { Calendar, Filter, Users, CreditCard } from "lucide-react";

interface ordersContentProps {
  orders: Order[];
  setOrdersDateQuery: (date: string) => void;
  orderDatesQuery: string;
  tableNumbers: Map<number, number>;
}

export const OrdersContent = ({ orders, setOrdersDateQuery, orderDatesQuery, tableNumbers }: ordersContentProps) => {
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setOrdersDateQuery(e.target.value);
  }
  const totalGeneral = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  const getPaymentLabel = (method: string) => {
    if (method === "CASH") return "Efectivo";
    if (method === "CARD") return "Tarjeta";
    if (method === "BANK_TRANS") return "Transferencia";
    return method;
  };

  return (
    <div className="h-full w-full overflow-auto bg-night">
      <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">

        <div className="rounded-2xl overflow-hidden border border-night-line bg-night-raised mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-night-line bg-night-inset">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-night-muted" />
              <p className="text-night-muted text-sm font-semibold">Filtros</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-night-muted" />
                <input
                  onChange={handleDateChange}
                  className="border border-night-line rounded-lg px-3 py-2 text-sm text-night-title bg-white/[0.04] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-colors"
                  type="date"
                  value={orderDatesQuery}
                />
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-night-muted" />
                <select
                  disabled
                  className="border border-night-line rounded-lg px-3 py-2 text-sm text-night-muted bg-white/[0.04] cursor-not-allowed opacity-60"
                >
                  <option>Tipo de venta</option>
                  <option>En local</option>
                  <option>Domicilio</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-night-muted" />
                <select
                  disabled
                  className="border border-night-line rounded-lg px-3 py-2 text-sm text-night-muted bg-white/[0.04] cursor-not-allowed opacity-60"
                >
                  <option>Método de pago</option>
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                  <option>Transferencia</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  disabled
                  className="border border-night-line rounded-lg px-3 py-2 text-sm text-night-muted bg-white/[0.04] cursor-not-allowed opacity-60"
                >
                  <option>Comensales</option>
                  <option>1-2</option>
                  <option>3-4</option>
                  <option>5+</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-night-line bg-night-inset">
                  <th className="text-left py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    ID Orden
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    Mesa
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    Comensales
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    Items
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    Fecha/Hora
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    Pago
                  </th>
                  <th className="text-right py-3 px-4 sm:px-6 font-semibold text-xs sm:text-sm text-night-muted uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-night-muted text-sm">
                      No hay órdenes para esta fecha
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const fecha = new Date(order.orderDate);
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-night-line-soft hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="py-4 px-4 sm:px-6 font-mono text-sm text-night-title">
                          #{order.id}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-sm text-night-title">
                          Mesa {tableNumbers.get(order.tableId) ?? order.tableId}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-sm text-night-title">
                          {order.guests}
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <div className="space-y-1 max-w-xs">
                            {order.orderDetail &&
                              order.orderDetail.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="text-xs text-night-body">
                                  <span className="font-medium">{item.quantity}x</span> {item.product?.name}
                                </div>
                              ))}
                            {order.orderDetail && order.orderDetail.length > 3 && (
                              <div className="text-xs text-night-muted">+{order.orderDetail.length - 3} más</div>
                            )}
                            {(!order.orderDetail || order.orderDetail.length === 0) && (
                              <div className="text-xs italic text-night-muted">Sin items</div>
                            )}
                            {order.comment && order.comment.trim() !== "" && (
                              <div className="mt-2 text-xs italic text-amber-soft bg-amber/10 px-2 py-1 rounded-md border border-amber/30 break-words">
                                Nota: {order.comment}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <div className="text-sm text-night-title">{fecha.toLocaleDateString()}</div>
                            <div className="text-xs text-night-muted">{fecha.toLocaleTimeString()}</div>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green/10 text-green-400 border border-green/20">
                            {getPaymentLabel(order.paymentMethod)}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right font-semibold text-base text-night-title">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {orders.length > 0 && (
                <tfoot>
                  <tr className="border-t border-night-line bg-night-inset">
                    <td colSpan={6} className="py-4 px-4 sm:px-6 text-sm font-semibold text-night-muted text-right">
                      Total Órdenes: {orders.length}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right font-bold text-lg text-night-title">
                      ${totalGeneral.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
