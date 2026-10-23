"use client";

import { useRef } from "react";
import { colorPalette } from "../../../../colorPallete"
import { Order } from "../../../../models/order";

interface KitchenViewProps {
  activeOrders: Order[];
  tableNumbers: Map<number, number>;
}

const KitchenView = ({ activeOrders, tableNumbers }: KitchenViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // A plain mouse wheel only emits deltaY; translate it into horizontal scroll
  // so the order row can be browsed without shift/trackpad gestures. If the
  // pointer is over a product list that can still scroll vertically, let it.
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    if (event.deltaX === 0) {
      const list = (event.target as HTMLElement).closest<HTMLElement>("[data-scroll-y]");
      if (list && list.scrollHeight > list.clientHeight) {
        const canScrollUp = event.deltaY < 0 && list.scrollTop > 0;
        const canScrollDown =
          event.deltaY > 0 &&
          list.scrollTop + list.clientHeight < list.scrollHeight - 1;
        if (canScrollUp || canScrollDown) return;
      }
    }

    container.scrollLeft += event.deltaX !== 0 ? event.deltaX : event.deltaY;
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="flex flex-row items-stretch h-full w-full p-6 gap-6 overflow-x-auto overscroll-x-contain"
      style={{ backgroundColor: colorPalette.Charcoal }}
    >
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full h-full opacity-30">
          <img src="/kitchen.png" alt="Kitchen" className="w-32 h-32 mb-4 invert" />
          <h2 className="text-white text-2xl font-bold">No hay pedidos activos</h2>
        </div>
      ) : (
        activeOrders.map((order) => (
          <div 
            key={order.tableId} 
            className="flex flex-col w-72 shrink-0 h-full rounded-2xl overflow-hidden shadow-xl"
            style={{ backgroundColor: colorPalette.DeepTwilight }}
          >
            {/* Header */}
            <div className="bg-black/40 p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-xl">Mesa {tableNumbers.get(order.tableId) ?? order.tableId}</h3>
                <span className="text-xs text-indigo-400 font-mono">
                  {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Kitchen note */}
            {order.comment && order.comment.trim() !== "" && (
              <div className="mx-3 mt-3 flex flex-col gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wide">
                  <svg
                    className="w-4 h-4 shrink-0 text-amber-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Nota para cocina
                </div>
                <p className="text-amber-100 text-sm whitespace-pre-wrap break-words max-h-28 overflow-y-auto">
                  {order.comment}
                </p>
              </div>
            )}

            {/* Product List */}
            <div data-scroll-y className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-3">
                {order.orderDetail.map((detail, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{detail.product?.name}</span>
                    </div>
                    <span className="bg-indigo-600 text-white text-sm font-bold px-2 py-1 rounded-lg min-w-[1.5rem] text-center">
                      {detail.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer / Status */}
            <div className="p-3 bg-black/20 mt-auto">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>En preparación</span>
                </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default KitchenView
