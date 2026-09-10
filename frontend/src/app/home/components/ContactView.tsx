"use client";

import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { PrimaryBtn } from "./ui";
import { MarketingNavbar } from "./MarketingNavbar";
import { MarketingFooter } from "./MarketingFooter";

const contacts = [
  {
    icon: Mail,
    label: "Correo electrónico",
    value: "hola@restaurantcrm.lat",
    note: "[ Dirección de correo — editar antes de publicar ]",
    action: "Escríbenos",
    href: "mailto:hola@restaurantcrm.lat",
    isExternal: false,
  },
  {
    icon: MessageCircle,
    label: "Teléfono / WhatsApp",
    value: "+54 11 5555-0000",
    note: "[ Número de teléfono — editar antes de publicar ]",
    action: "WhatsApp",
    href: "https://wa.me/5491155550000",
    isExternal: true,
  },
  {
    icon: MapPin,
    label: "Dirección",
    value: "San Martín 1240, CABA Buenos Aires, Argentina",
    note: "[ Dirección física — editar antes de publicar ]",
    action: null,
    href: null,
    isExternal: false,
  },
];

export default function ContactView() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      <div className="pt-36 pb-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gray-400 uppercase tracking-[0.16em] font-semibold mb-4">
              Contacto
            </p>
            <h1 className="font-bold text-gray-900 mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Hablemos
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              ¿Tenés dudas o querés una demo en vivo? Estamos disponibles para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {contacts.map((c) => (
              <div
                key={c.label}
                className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-gray-100">
                  <c.icon className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-2">
                  {c.label}
                </p>
                <p className="text-gray-900 font-semibold text-base mb-2 leading-snug">
                  {c.value}
                </p>
                <p className="text-gray-400 text-xs mb-6 leading-relaxed">{c.note}</p>
                {c.action && c.href && (
                  <a
                    href={c.href}
                    target={c.isExternal ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="mt-auto"
                  >
                    <PrimaryBtn className="w-full text-sm py-3">
                      {c.action}
                    </PrimaryBtn>
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8 border border-gray-200 bg-gray-50 text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">Horario de atención</h3>
            <p className="text-gray-500 text-sm">Lunes a viernes · 9:00 a 18:00 (GMT-3)</p>
            <p className="text-gray-400 text-xs mt-1">
              [ Horario — editar antes de publicar ]
            </p>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}