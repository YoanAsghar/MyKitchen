import { colorPalette } from "../../../../colorPallete"
import { Order } from "../../../../models/order";

interface KitchenViewProps {
  activeOrders: Order[];
}

const KitchenView = ({ activeOrders }: KitchenViewProps) => {
  return (
    <div className="flex flex-row flex-wrap h-full w-full p-6 gap-6 overflow-y-auto" style={{ backgroundColor: colorPalette.Charcoal }}>
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full h-full opacity-30">
          <img src="/kitchen.png" alt="Kitchen" className="w-32 h-32 mb-4 invert" />
          <h2 className="text-white text-2xl font-bold">No hay pedidos activos</h2>
        </div>
      ) : (
        activeOrders.map((order) => (
          <div 
            key={order.tableId} 
            className="flex flex-col w-72 rounded-2xl overflow-hidden shadow-xl"
            style={{ backgroundColor: colorPalette.DeepTwilight }}
          >
            {/* Header */}
            <div className="bg-black/40 p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-xl">Mesa {order.tableId}</h3>
                <span className="text-xs text-indigo-400 font-mono">
                  {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 p-4">
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
