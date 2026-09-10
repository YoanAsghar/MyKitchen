"use client";

import { MapPin, Phone, Mail, ChefHat } from "lucide-react";
import { marketingPath, type MarketingPage } from "./ui";
import { useRouter } from "next/navigation";
import { colorPalette } from "../../../colorPallete";

export function MarketingFooter() {
  const router = useRouter();
  const navigate = (page: MarketingPage) => router.push(marketingPath(page));

  return (
    <footer
      className="border-t mt-24"
      style={{ backgroundColor: colorPalette.NearBlack, borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">
                Restaurant CRM
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              La plataforma todo-en-uno para gestionar tu restaurante con sincronización en tiempo real entre cocina y salón.
            </p>
            <div className="flex flex-col gap-2 text-xs text-white/30">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-white/40" />
                San Martín 1240, Buenos Aires, Argentina
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white/40" />
                +54 11 5555-0000
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white/40" />
                hola@restaurantcrm.lat
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Producto</h4>
            <div className="flex flex-col gap-3">
              {["Funciones", "Precios", "Actualizaciones", "Estado del sistema"].map((l) => (
                <span
                  key={l}
                  className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">Empresa</h4>
            <div className="flex flex-col gap-3">
              {["Acerca de", "Blog", "Soporte", "Privacidad", "Términos"].map((l) => (
                <span
                  key={l}
                  className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p className="text-white/25 text-xs">
            © 2026 Restaurant CRM. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-white/25">
            {["Términos", "Privacidad", "Cookies"].map((l) => (
              <span key={l} className="hover:text-white cursor-pointer transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
