import React, { useEffect, useState, type ReactEventHandler } from "react";
import { Order } from "../../../../models/order";
import { OrderServices } from "../../../../services/OrderServices";

const colorPalette = {
  DeepTwilight: "#140152",
  Navy: "#22007c",
  Charcoal: "#121212",
  White: "#f4f4f8"
};

interface ordersContentProps {
  orders: Order[];
  setOrdersDateQuery: (date: string) => void;
  orderDatesQuery: string;
}

export const OrdersContent = ({orders, setOrdersDateQuery, orderDatesQuery} : ordersContentProps) => {

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>){
    setOrdersDateQuery(e.target.value);
  }
  const totalGeneral = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div
      className="h-full w-full overflow-auto"
      style={{ backgroundColor: colorPalette.DeepTwilight }}
    >
      <div className="p-4 pt-1">
        <div
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: colorPalette.Charcoal }}
        >
          <div className="py-4 flex flex-row items-center w-full p-8" style={{backgroundColor: colorPalette.DeepTwilight}}>

            <p className="border-0 text-white font-bold text-xl uppercase tracking-widest mr-5">Filtrar por fecha: </p>
            <input onChange={handleDateChange} className="border-0 cursor-pointer text-white bg-[#121212] p-5 rounded-xl font-bold text-xl uppercase tracking-widest" type="date" value={orderDatesQuery} />

          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: colorPalette.Navy,
                    borderColor: colorPalette.DeepTwilight,
                  }}
                >
                  <th
                    className="text-left py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    ID Orden
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    Mesa
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    Comensales
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    Items
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    Fecha/Hora
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    Pago
                  </th>
                  <th
                    className="text-right py-4 px-6 font-semibold text-sm"
                    style={{ color: colorPalette.White }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const fecha = new Date(order.orderDate);
                  return (
                    <tr
                      key={order.id}
                      className="border-b hover:bg-opacity-50 transition-colors"
                      style={{ borderColor: `${colorPalette.Navy}60` }}
                    >
                      {/* ID */}
                      <td
                        className="py-5 px-6 font-mono text-sm font-semibold"
                        style={{ color: colorPalette.White }}
                      >
                        {order.id}
                      </td>

                      {/* Mesa */}
                      <td
                        className="py-5 px-6 text-sm font-medium"
                        style={{ color: colorPalette.White }}
                      >
                        {order.tableId}
                      </td>

                      {/* Comensales */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm"
                            style={{ color: colorPalette.White }}
                          >
                            {order.guests}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-5 px-6">
                        <div className="space-y-1 max-w-xs">
                          {order.orderDetail &&
                            order.orderDetail.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-xs"
                                style={{
                                  color: colorPalette.White,
                                  opacity: 0.85,
                                }}
                              >
                                {item.quantity}x {item.product?.name}
                              </div>
                            ))}
                          {(!order.orderDetail ||
                            order.orderDetail.length === 0) && (
                            <div
                              className="text-xs italic opacity-50"
                              style={{ color: colorPalette.White }}
                            >
                              Sin items
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Fecha/Hora */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div>
                            <div
                              className="text-xs"
                              style={{ color: colorPalette.White }}
                            >
                              {fecha.toLocaleDateString()}
                            </div>
                            <div
                              className="text-xs opacity-60"
                              style={{ color: colorPalette.White }}
                            >
                              {fecha.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Método de Pago */}
                      <td
                        className="py-5 px-6 text-sm"
                        style={{ color: colorPalette.White }}
                      >
                        {order.paymentMethod}
                      </td>

                      {/* Total */}
                      <td
                        className="py-5 px-6 text-right font-bold text-base"
                        style={{ color: colorPalette.White }}
                      >
                        ${order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr
                  className="border-t-2"
                  style={{
                    backgroundColor: colorPalette.Navy,
                    borderColor: colorPalette.DeepTwilight,
                  }}
                >
                  <td
                    colSpan={6}
                    className="py-4 px-6 text-base font-bold text-right text-xl"
                    style={{ color: colorPalette.White }}
                  >
                      Total Órdenes:  {orders.length}
                  </td>
                  <td
                    className="py-4 px-6 text-right font-bold text-xl"
                    style={{ color: colorPalette.White }}
                  >
                    TOTAL GENERAL: ${totalGeneral.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
