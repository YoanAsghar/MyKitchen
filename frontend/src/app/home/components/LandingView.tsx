"use client";

import { useState } from "react";
import {
  Zap, ArrowRight, Table2, ChefHat, MenuSquare, ScrollText, CreditCard, RefreshCw, Star, Check,
} from "lucide-react";
import { PrimaryBtn, GhostBtn, marketingPath } from "./ui";
import { MarketingNavbar } from "./MarketingNavbar";
import { MarketingFooter } from "./MarketingFooter";
import { AppMockup } from "./AppMockup";
import { useRouter } from "next/navigation";
import { colorPalette } from "../../../colorPallete";

const features = [
  {
    icon: Table2,
    title: "Mesas en tiempo real",
    desc: "Visualizá el estado de cada mesa al instante, sin recargar ni refrescar la página.",
  },
  {
    icon: ChefHat,
    title: "Cocina en vivo",
    desc: "Los pedidos llegan a cocina de forma automática al ser tomados en el salón.",
  },
  {
    icon: MenuSquare,
    title: "Carta e inventario",
    desc: "Administrá tu menú digital y controlá tus productos desde un único panel.",
  },
  {
    icon: ScrollText,
    title: "Historial de órdenes",
    desc: "Consultá todas las órdenes del día, semana o mes con filtros avanzados.",
  },
  {
    icon: CreditCard,
    title: "Múltiples métodos de pago",
    desc: "Efectivo, tarjeta y transferencia bancaria desde la misma pantalla de cobro.",
  },
  {
    icon: RefreshCw,
    title: "Sincronización instantánea",
    desc: "Tecnología SignalR para actualizaciones en tiempo real entre todos los dispositivos.",
  },
];

const steps = [
  {
    num: "01",
    title: "Creá tu restaurante",
    desc: "Registrá tu local en menos de 2 minutos. Sin tarjeta de crédito requerida.",
  },
  {
    num: "02",
    title: "Invitá a tu equipo",
    desc: "Sumá mozos, cocineros y administradores con roles y permisos diferenciados.",
  },
  {
    num: "03",
    title: "Operá en vivo",
    desc: "Desde el primer turno, gestioná mesas, pedidos y cobros en tiempo real.",
  },
];

const testimonials = [
  {
    quote:
      "Desde que usamos RestaurantCRM los errores en pedidos bajaron a cero. La cocina siempre sabe qué preparar sin que nadie grite.",
    name: "Rodrigo Méndez",
    role: "Dueño · La Parrilla del Centro, Buenos Aires",
    initials: "RM",
  },
  {
    quote:
      "El cierre de caja ahora tarda 10 minutos. Antes éramos una hora revisando tickets en papel. Increíble.",
    name: "Ana García",
    role: "Administradora · Café El Sol, Medellín",
    initials: "AG",
  },
  {
    quote:
      "Nuestros mozos adoptaron el sistema en media hora. La interfaz es muy intuitiva y funciona perfecto en tablet.",
    name: "Carlos López",
    role: "Gerente · El Rincón Porteño, Montevideo",
    initials: "CL",
  },
];

const trustNames = [
  "La Trattoria",
  "El Mesón de María",
  "Sabores del Sur",
  "Cantina Central",
  "Bistro 21",
  "Fonda Tradicional",
  "El Asador",
];

const planFeatures = [
  "Hasta 50 mesas simultáneas",
  "Sincronización en tiempo real",
  "Módulo de cocina en vivo",
  "Carta digital con gestión",
  "Historial completo de órdenes",
  "Efectivo · Tarjeta · Transferencia",
  "Usuarios ilimitados con roles",
  "Soporte por WhatsApp",
  "Actualizaciones incluidas",
  "Acceso desde cualquier dispositivo",
];

export default function LandingView() {
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const navigate = (page: "pricing" | "contact" | "registro") => router.push(marketingPath(page));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <MarketingNavbar />

      {/* ── HERO (blanco) ── */}
      <section className="relative pt-36 pb-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600">
              <Zap className="w-3.5 h-3.5" />
              Nuevo · Sincronización en tiempo real con SignalR
            </div>
          </div>

          <h1
            className="text-center font-bold text-gray-900 leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Gestioná tu restaurante
            <br />
            con eficiencia real
          </h1>

          <p className="text-center text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mesas, cocina, carta y cobros sincronizados al instante. Una sola plataforma para
            que tu equipo trabaje en perfecta coordinación.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <PrimaryBtn onClick={() => navigate("registro")} className="text-base px-8 py-4">
              Crear tu restaurante <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
            <GhostBtn onClick={() => navigate("pricing")} className="text-base px-8 py-4">
              Ver precios
            </GhostBtn>
          </div>

          <div className="max-w-4xl mx-auto">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP (blanco) ── */}
      <section className="py-12 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-gray-400 uppercase tracking-[0.18em] mb-8 font-semibold">
            Restaurantes que ya operan con RestaurantCRM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustNames.map((name) => (
              <span
                key={name}
                className="text-gray-400 hover:text-gray-600 font-semibold text-sm transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (blanco) ── */}
      <section id="features" className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gray-400 uppercase tracking-[0.16em] font-semibold mb-3">
              Funcionalidades
            </p>
            <h2 className="font-bold text-gray-900 leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Todo lo que tu restaurante
              <br />
              necesita en un solo lugar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-200 bg-white group cursor-default transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gray-100 group-hover:bg-gray-200/40 transition-colors">
                  <f.icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (oscuro) ── */}
      <section className="py-28 px-6" style={{ backgroundColor: colorPalette.NearBlack }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-white/30 uppercase tracking-[0.16em] font-semibold mb-3">
              Proceso
            </p>
            <h2 className="font-bold text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Cómo funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div
              className="hidden md:block absolute top-11 left-1/6 right-1/6 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)",
              }}
            />
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 bg-white/[0.06] border border-white/[0.08]">
                  <span className="text-2xl font-bold text-white/40" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
                    {step.num}
                  </span>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER (blanco) ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-gray-400 uppercase tracking-[0.16em] font-semibold mb-3">
              Precios
            </p>
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Un plan, todo incluido
            </h2>
            <p className="text-gray-500 text-lg">
              Sin comisiones ocultas. Sin límites de pedidos. Sin sorpresas.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-10">
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
                style={{ color: colorPalette.Green, backgroundColor: "rgba(34,197,94,0.1)", border: `1px solid rgba(34,197,94,0.2)` }}
              >
                -22%
              </span>
            </span>
          </div>

          <div className="rounded-2xl p-8 border border-gray-200 bg-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7 pb-7 border-b border-gray-200">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-3 bg-gray-100 text-gray-600 border border-gray-200">
                  PROFESIONAL
                </span>
                <p className="text-gray-500 text-sm">Todo incluido · Sin límites de uso</p>
              </div>
              <div className="shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-sm">USD</span>
                  <span className="text-gray-900 font-bold" style={{ fontSize: "3.5rem", lineHeight: 1 }}>
                    {annual ? "69" : "89"}
                  </span>
                  <span className="text-gray-500 text-sm">/mes</span>
                </div>
                {annual && (
                  <p className="text-gray-500 text-xs mt-1">Facturado anualmente</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {planFeatures.map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: colorPalette.Green }} />
                  </div>
                  <span className="text-gray-600 text-sm">{feat}</span>
                </div>
              ))}
            </div>
            <PrimaryBtn onClick={() => navigate("registro")} className="w-full text-base py-4">
              Empezar ahora <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            ¿Necesitás algo más?{" "}
            <button
              onClick={() => navigate("contact")}
              className="text-gray-900 hover:underline underline-offset-2 cursor-pointer transition-colors"
            >
              Contáctanos
            </button>
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS (oscuro) ── */}
      <section className="py-28 px-6" style={{ backgroundColor: colorPalette.NearBlack }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-white/30 uppercase tracking-[0.16em] font-semibold mb-3">
              Testimonios
            </p>
            <h2 className="font-bold text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-white/30 text-white/30" />
                  ))}
                </div>
                <p className="text-white/35 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-white/[0.08]">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BAND (blanco) ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center rounded-3xl px-8 py-20 border border-gray-200 bg-gray-50">
          <h2 className="font-bold text-gray-900 mb-5" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.1 }}>
            Transformá la gestión
            <br />
            de tu restaurante hoy
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Empezá sin tarjeta de crédito. Configurá tu restaurante en menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryBtn onClick={() => navigate("registro")} className="text-base px-10 py-4">
              Crear tu restaurante <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
            <GhostBtn onClick={() => navigate("contact")} className="text-base px-10 py-4">
              Hablar con ventas
            </GhostBtn>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}