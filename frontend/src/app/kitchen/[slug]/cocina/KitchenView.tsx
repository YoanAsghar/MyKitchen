"use client";

import { useRef } from "react";
import { ChefHat } from "lucide-react";
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
      className="flex flex-row items-stretch h-full w-full p-6 gap-6 overflow-x-auto overscroll-x-contain bg-night"
    >
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-center">
          <ChefHat className="size-12 text-night-ghost" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="mt-3 text-2xl font-bold text-night-body">No hay pedidos activos</h2>
          <p className="mt-1 text-sm text-night-muted">Los pedidos abiertos aparecerán aquí.</p>
        </div>
      ) : (
        activeOrders.map((order) => (
          <div
            key={order.tableId}
            className="flex flex-col w-72 shrink-0 h-full rounded-2xl overflow-hidden bg-night-raised border border-night-line shadow-[0_20px_50px_-25px_rgba(0,0,0,0.65)]"
          >
            {/* Header */}
            <div className="bg-night-inset p-4 border-b border-night-line">
              <div className="flex justify-between items-center">
                <h3 className="text-night-title font-bold text-xl">Mesa {tableNumbers.get(order.tableId) ?? order.tableId}</h3>
                <span className="text-xs text-night-muted font-mono">
                  {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Kitchen note */}
            {order.comment && order.comment.trim() !== "" && (
              <div className="mx-3 mt-3 flex flex-col gap-1 rounded-lg bg-amber/10 border border-amber/30 px-3 py-2">
                <div className="flex items-center gap-2 text-amber-bright text-xs font-bold uppercase tracking-wide">
                  <svg
                    className="w-4 h-4 shrink-0 text-amber-bright"
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
                <p className="text-amber-soft text-sm whitespace-pre-wrap break-words max-h-28 overflow-y-auto">
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
                      <span className="text-night-title font-medium">{detail.product?.name}</span>
                    </div>
                    <span className="bg-brand-600 text-white text-sm font-bold px-2 py-1 rounded-lg min-w-[1.5rem] text-center">
                      {detail.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer / Status */}
            <div className="p-3 bg-night-inset mt-auto">
                <div className="flex items-center gap-2 text-xs text-night-muted">
                    <div className="w-2 h-2 rounded-full bg-green animate-pulse"></div>
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
