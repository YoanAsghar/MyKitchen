"use client";

import { useState } from "react";
import { Check, MessageCircle, ArrowRight, Globe } from "lucide-react";
import { PrimaryBtn, GhostBtn, marketingPath } from "./ui";
import { MarketingNavbar } from "./MarketingNavbar";
import { MarketingFooter } from "./MarketingFooter";
import { useRouter } from "next/navigation";
import { colorPalette } from "../../../colorPallete";

const features = [
  "Hasta 50 mesas simultáneas",
  "Sincronización en tiempo real (SignalR)",
  "Módulo de cocina en vivo",
  "Carta digital con gestión de productos",
  "Historial completo de órdenes (sin límite)",
  "Efectivo · Tarjeta · Transferencia",
  "Usuarios ilimitados con roles diferenciados",
  "Panel de administración completo",
  "Soporte por WhatsApp y correo",
  "Actualizaciones automáticas incluidas",
  "Acceso desde cualquier dispositivo",
  "Exportación de reportes en PDF",
];

export default function PricingView() {
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const navigate = (page: "registro" | "contact") => router.push(marketingPath(page));

  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      <div className="pt-36 pb-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gray-400 uppercase tracking-[0.16em] font-semibold mb-4">
              Precios
            </p>
            <h1 className="font-bold text-gray-900 mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Simple y transparente
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Un solo plan con todo incluido. Sin comisiones por pedido. Sin límites ocultos.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>
              Mensual
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: annual ? colorPalette.Navy : "#e5e7eb",
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: annual ? "28px" : "4px" }}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${annual ? "text-gray-900" : "text-gray-400"}`}>
              Anual
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ color: colorPalette.Green, backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                -22%
              </span>
            </span>
          </div>

          <div className="rounded-2xl p-10 border border-gray-200 bg-white shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-3 bg-gray-100 text-gray-600 border border-gray-200">
                  PROFESIONAL · TODO INCLUIDO
                </div>
                <p className="text-gray-500 text-sm">
                  Ideal para restaurantes de cualquier tamaño
                </p>
              </div>
              <div className="shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-base">USD</span>
                  <span
                    className="text-gray-900 font-bold"
                    style={{ fontSize: "4.5rem", lineHeight: 1 }}
                  >
                    {annual ? "69" : "89"}
                  </span>
                  <span className="text-gray-500">/mes</span>
                </div>
                {annual && (
                  <p className="text-gray-500 text-sm mt-1">
                    Facturado anualmente ·{" "}
                    <span style={{ color: colorPalette.Green }} className="font-medium">Ahorrás USD {(89 - 69) * 12}/año</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {features.map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: colorPalette.Green }} />
                  </div>
                  <span className="text-gray-600 text-sm">{feat}</span>
                </div>
              ))}
            </div>

            <PrimaryBtn onClick={() => navigate("registro")} className="w-full text-base py-4">
              Empezar ahora · Sin tarjeta de crédito <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>

          <div className="rounded-2xl p-8 border border-gray-200 bg-gray-50 text-center">
            <Globe className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold text-xl mb-2">¿Necesitás algo más?</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Para cadenas de restaurantes, franquicias o integraciones personalizadas,
              contáctanos y armamos un plan a medida.
            </p>
            <GhostBtn onClick={() => navigate("contact")} className="mx-auto">
              <MessageCircle className="w-4 h-4" /> Contáctanos
            </GhostBtn>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}