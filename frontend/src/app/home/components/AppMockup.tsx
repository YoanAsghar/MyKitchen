import { ChefHat, Wifi } from "lucide-react";
import { colorPalette } from "../../../colorPallete";

export function AppMockup() {
  const tables = [
    { id: "01", occupied: true, guests: 4, total: "$2.400" },
    { id: "02", occupied: false, guests: 0, total: "" },
    { id: "03", occupied: true, guests: 2, total: "$1.880" },
    { id: "04", occupied: false, guests: 0, total: "" },
    { id: "05", occupied: true, guests: 6, total: "$3.820" },
    { id: "06", occupied: true, guests: 3, total: "$1.640" },
  ];
  const orders = [
    { item: "Hamburguesa Clásica", qty: 1, price: "$750" },
    { item: "Pizza Margarita", qty: 1, price: "$890" },
    { item: "Agua mineral", qty: 2, price: "$240" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 w-full"
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10"
        style={{ backgroundColor: "#121212" }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-[10px] text-white/25 font-mono">
          app.restaurantcrm.lat/kitchen/1/mesas
        </div>
        <Wifi className="w-3 h-3 opacity-70" style={{ color: colorPalette.Green }} />
      </div>
      {/* App top nav */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b border-white/8"
        style={{ backgroundColor: colorPalette.NearBlack }}
      >
        <div className="flex items-center gap-1.5 mr-auto">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center bg-white/10">
            <ChefHat className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-[11px] font-bold">RestaurantCRM</span>
        </div>
        {["Mesas", "Cocina", "Carta", "Órdenes", "Admin"].map((tab, i) => (
          <span
            key={tab}
            className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
            style={{
              backgroundColor: i === 0 ? "rgba(255,255,255,0.1)" : "transparent",
              color: i === 0 ? "white" : "rgba(255,255,255,0.35)",
            }}
          >
            {tab}
          </span>
        ))}
        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white font-bold ml-2">
          A
        </div>
      </div>
      {/* App body */}
      <div className="flex" style={{ height: 280, backgroundColor: colorPalette.NearBlack }}>
        {/* Sidebar 35% */}
        <div
          className="border-r border-white/8 p-3 flex flex-col gap-2"
          style={{ width: "35%" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white font-semibold">Mesa 03</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: colorPalette.Green, backgroundColor: "rgba(34,197,94,0.1)" }}>
              2 comensales
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {orders.map((o) => (
              <div
                key={o.item}
                className="flex items-center gap-1.5 text-[10px] rounded-lg px-2 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-white/50 flex-1 truncate">{o.item}</span>
                <span className="text-white/25 w-4 text-center">{o.qty}</span>
                <span className="text-white/70 font-semibold">{o.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-2 border-t border-white/8">
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span>Subtotal</span>
              <span className="text-white/70">$1.880</span>
            </div>
            <div className="flex justify-between text-[10px] text-white/30 mb-2">
              <span>Propina 10%</span>
              <span className="text-white/70">$188</span>
            </div>
            <div className="w-full py-1.5 rounded-xl text-[10px] font-bold text-white text-center" style={{ backgroundColor: colorPalette.Navy }}>
              Cobrar $2.068
            </div>
          </div>
        </div>
        {/* Table grid 65% */}
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">
              Estado de las mesas
            </span>
            <div className="flex gap-1">
              <div className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: colorPalette.Green, backgroundColor: "rgba(34,197,94,0.1)" }}>
                4 ocupadas
              </div>
              <div className="text-[9px] px-2 py-0.5 rounded-full text-white/30 bg-white/5">
                2 libres
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {tables.map((t) => (
              <div
                key={t.id}
                className="rounded-xl p-2 flex flex-col gap-1 cursor-pointer transition-all"
                style={{
                  backgroundColor: t.occupied ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${t.occupied ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">#{t.id}</span>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: t.occupied ? colorPalette.Green : "rgba(255,255,255,0.2)" }}
                  />
                </div>
                {t.occupied ? (
                  <>
                    <span className="text-[9px] text-white/35">{t.guests} comensales</span>
                    <span className="text-[10px] font-semibold text-white/70">{t.total}</span>
                  </>
                ) : (
                  <span className="text-[9px] text-white/20">Disponible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
