"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChefHat, Clock, CreditCard, MenuSquare, ScrollText, Sparkles, Table2, Users, Zap } from "lucide-react";
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
    desc: "Visualizá el estado de cada mesa al instante. Sin papel, sin confusiones entre turno.",
  },
  {
    icon: ChefHat,
    title: "Cocina organizada",
    desc: "Las comandas llegan claras y ordenadas a cocina para preparar más rápido.",
  },
  {
    icon: MenuSquare,
    title: "Carta digital",
    desc: "Mantené tu menú centralizado, con precios actualizados y sin reimpresiones.",
  },
  {
    icon: ScrollText,
    title: "Órdenes claras",
    desc: "Todo el detalle del pedido queda registrado, con cantidad, observaciones y seguimiento.",
  },
  {
    icon: CreditCard,
    title: "Cobro ágil",
    desc: "Efectivo, tarjeta o transferencia desde la misma pantalla. Menos esperas, cierre más rápido.",
  },
  {
    icon: Users,
    title: "Equipo con roles",
    desc: "Asigná permisos por puesto para mantener el control sin complicar al equipo.",
  },
];

const steps = [
  {
    num: "01",
    title: "Creá tu restaurante",
    desc: "Registralo en minutos. Sin tarjeta, sin configuraciones complejas.",
  },
  {
    num: "02",
    title: "Armá tu carta y mesas",
    desc: "Cargá productos, creá tus mesas y asigná roles al equipo.",
  },
  {
    num: "03",
    title: "Operá sin caos",
    desc: "Tomá pedidos, enviá a cocina y cobrá desde un solo lugar.",
  },
];

const benefits = [
  "Menos errores en comandas",
  "Mayor agilidad en el salón",
  "Cocina más ordenada",
  "Cierre de caja más rápido",
  "Todo sincronizado en tiempo real",
  "Fácil de usar desde el primer turno",
];

const testimonials = [
  {
    quote: "Con MyKitchen dejamos de gritar pedidos. Todo llega claro a cocina y el salón va mucho más ágil.",
    name: "Rodrigo Méndez",
    role: "Dueño · La Parrilla del Centro",
    initials: "RM",
  },
  {
    quote: "El cobro es mucho más rápido y el cierre ya no nos lleva una hora. Muy fácil para todo el equipo.",
    name: "Ana García",
    role: "Propietaria · Café El Sol",
    initials: "AG",
  },
  {
    quote: "Lo mejor es lo intuitivo. Los mozos lo aprendieron en media hora y desde el primer día funcionó perfecto.",
    name: "Carlos López",
    role: "Dueño · Taquería El Rincón",
    initials: "CL",
  },
];

const trustNames = ["La Trattoria", "El Mesón", "Sabores del Sur", "Cantina Central", "Bistro 21", "Fonda Tradicional", "El Asador"];

const faqs = [
  {
    q: "¿Necesito instalar algo para usarlo?",
    a: "No. Funciona desde el navegador en tablet, celular o PC. Solo abrís y empezás a operar.",
  },
  {
    q: "¿Es fácil de aprender para mi equipo?",
    a: "Sí. Está pensado para usarlo el primer día, sin formación larga ni curvas complicadas.",
  },
  {
    q: "¿Puedo usarlo en varias mesas al mismo tiempo?",
    a: "Sí. Todo está sincronizado en tiempo real entre salón, cocina y caja.",
  },
  {
    q: "¿Se puede empezar gratis?",
    a: "Sí. Podés crear tu restaurante y probarlo desde el primer turno.",
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        filter: visible ? "blur(0px)" : "blur(2px)",
        transition: `opacity 600ms ease, transform 600ms ease, filter 600ms ease`,
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}

export default function LandingView() {
  const router = useRouter();
  const navigate = (page: "pricing" | "contact" | "registro") => router.push(marketingPath(page));

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #ffffff 0%, #fffdfb 20%, #faf7f5 60%, #ffffff 100%)",
        fontFeatureSettings: '"ss01","ss02","cv01"',
      }}
    >
      <MarketingNavbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden" style={{ backgroundImage: "url('/hero-header.jpg')", backgroundSize: "cover", backgroundPosition: "center center", backgroundRepeat: "no-repeat" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.3) 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>

              <Reveal delay={80}>
                <h1
                  className="font-semibold text-[#1f1b16] leading-[1.05] tracking-tight mb-6"
                  style={{ fontSize: "clamp(2.8rem, 6vw, 5.6rem)", letterSpacing: "-0.02em" }}
                >
                  Ordena, cobra y cocina sin caos
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="text-lg md:text-xl text-[#6b635b] max-w-xl mb-8 leading-relaxed">
                  Digitaliza tu operación sin complicar al equipo. Mesas, cocina, carta y cobros sincronizados al instante para atender más rápido con menos errores.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-8">
                <button
                  onClick={() => navigate("registro")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d97757]/60 w-full sm:w-auto"
                  style={{ backgroundColor: colorPalette.Terracotta }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorPalette.TerracottaHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.Terracotta)}
                >
                  Empezar gratis <ArrowRight className="w-4 h-4" />
                </button>
                </div>
              </Reveal>

              <Reveal delay={260}>
                <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
                  <div className="flex items-center gap-2 text-[#2d2a26]">
                    <Check className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                    <span>Sin tarjeta de crédito</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2d2a26]">
                    <Check className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                    <span>Listo desde el primer turno</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2d2a26]">
                    <Check className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                    <span>Sincronización en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2d2a26]">
                    <Check className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                    <span>Fácil para todo el equipo</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={200}>
              <div className="relative w-full">
                <div className="absolute -inset-6 -z-10 rounded-[32px]" />
                <div className="relative rounded-3xl border border-[#e7dfd7] bg-white overflow-hidden shadow-[0_40px_80px_-60px_rgba(45,42,38,0.5)] w-full scale-110 lg:scale-115 origin-center">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7dfd7] bg-[#faf7f5]" >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorPalette.Gold }} />
                      <span className="text-sm text-[#6b635b]">Vista en tiempo real · Salón</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8b8178]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Sincronizado
                    </div>
                  </div>
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-6 border-r border-[#e7dfd7]">
                    <p className="text-sm text-[#8b8178] mb-4">Mesas activas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "01", guests: 4, status: "Ocupada" },
                        { id: "02", guests: 0, status: "Libre" },
                        { id: "03", guests: 2, status: "Ocupada" },
                        { id: "04", guests: 6, status: "Ocupada" },
                      ].map((t) => (
                          <div key={t.id} className="rounded-xl border border-[#e7dfd7] p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-[#1f1b16]">Mesa {t.id}</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${t.status === "Ocupada" ? "bg-emerald-500" : "bg-[#d6c9bf]"}`} />
                            </div>
                            <span className="text-xs text-[#8b8178]">{t.status === "Ocupada" ? `${t.guests} comensales` : "Disponible"}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-[#8b8178] mb-4">Pedido · Mesa 01</p>
                    <div className="flex flex-col gap-2 mb-4">
                      {[
                        { item: "Hamburguesa Clásica", qty: 1, price: "$750" },
                        { item: "Papas Bravas", qty: 1, price: "$420" },
                        { item: "Cerveza Artesanal", qty: 2, price: "$640" },
                      ].map((o) => (
                          <div key={o.item} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-[#8b8178]">{o.qty}x</span>
                              <span className="text-[#2d2a26]">{o.item}</span>
                            </div>
                            <span className="text-[#1f1b16]">{o.price}</span>
                          </div>
                        ))}
                    </div>
                    <div className="border-t border-[#e7dfd7] pt-3 flex items-center justify-between">
                      <span className="text-[#8b8178]">Total</span>
                      <span className="text-lg font-medium text-[#1f1b16]">$1.810</span>
                    </div>
                    <div className="mt-4 w-full rounded-lg py-2.5 text-center text-sm font-medium text-white" style={{ backgroundColor: colorPalette.Terracotta }}>
                      Enviar a cocina
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>


      </div>
    </section>

      {/* TRUST */}
      <section className="py-10 border-y border-[#e7dfd7] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-[#8b8178] mb-6">Usado por restaurantes de distintos formatos</p>
          <div className="flex flex-wrap items-center justify-center gap-7 md:gap-10">
            {trustNames.map((name) => (
              <span key={name} className="text-[#9a9188] text-sm font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA -> SOLUCION */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,119,87,0.05)_0%,_rgba(255,255,255,0)_70%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
            <Reveal>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Problema → Solución</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight mb-5">
                  Menos papel. Más control. Menor presión en turno.
                </h2>
                <p className="text-lg text-[#6b635b] leading-relaxed mb-8">
                  Comandas en papel se pierden, se malinterpretan y retrasan la cocina. MyKitchen unifica todo en un solo flujo para que el equipo se enfoque en atender, no en corregir errores.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {benefits.map((b, i) => (
                    <div key={b} className="flex items-center gap-2 text-[#2d2a26]">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPalette.Gold }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
              <Reveal delay={120}>
            <div className="relative">
              <div className="rounded-2xl border border-[#e7dfd7] bg-white p-6 md:p-8 shadow-[0_20px_60px_-40px_rgba(45,42,38,0.6)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(245,179,1,0.12)" }}>
                    <Zap className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                  </div>
                  <div>
                    <p className="text-[#1f1b16] font-medium">Flujo unificado</p>
                    <p className="text-sm text-[#8b8178]">Salón → Cocina → Caja</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-[#e7dfd7] px-4 py-3 bg-[#faf7f5]">
                    <div className="flex items-center gap-3">
                      <Table2 className="w-4 h-4 text-[#6b635b]" />
                      <span className="text-[#2d2a26]">Tomar pedido en mesa</span>
                    </div>
                    <span className="text-xs text-[#8b8178]">Instantáneo</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#e7dfd7] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ChefHat className="w-4 h-4 text-[#6b635b]" />
                      <span className="text-[#2d2a26]">Enviar a cocina</span>
                    </div>
                    <span className="text-xs text-[#8b8178]">Sin llamadas</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#e7dfd7] px-4 py-3 bg-[#faf7f5]">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-[#6b635b]" />
                      <span className="text-[#2d2a26]">Cobrar y cerrar</span>
                    </div>
                    <span className="text-xs text-[#8b8178]">Ágil</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-4 hidden md:flex items-center gap-2 rounded-full border border-[#e7dfd7] bg-white px-4 py-2 shadow-sm">
                <Clock className="w-4 h-4" style={{ color: colorPalette.Terracotta }} />
                <span className="text-sm text-[#2d2a26]">Menos tiempo por turno</span>
              </div>
            </div>
              </Reveal>
        </div>
              </section>

      {/* FUNCIONALIDADES */}
      <section id="features" className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(231,223,215,0.4)_0%,_rgba(255,255,255,0)_70%)] pointer-events-none" />
                  <div className="max-w-7xl mx-auto relative">
                    <Reveal>
                      <div className="text-center mb-14">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Funcionalidades clave</p>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight mb-4">
                          Todo lo esencial, sin lo innecesario
                        </h2>
                        <p className="text-lg text-[#6b635b] max-w-2xl mx-auto">
                          Enfocado a lo que realmente se usa en un turno: mesas, comandas, carta y cobros.
                        </p>
                      </div>
                    </Reveal>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((f, i) => (
                          <Reveal key={f.title} delay={i * 60}>
                            <div className="group h-full rounded-2xl border border-[#e7dfd7] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(217,119,87,0.25)]">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(217,119,87,0.1)" }}>
                                <f.icon className="w-4 h-4" style={{ color: colorPalette.Terracotta }} />
                              </div>
                              <h3 className="text-lg font-medium text-[#1f1b16] mb-2">{f.title}</h3>
                              <p className="text-[#6b635b] leading-relaxed">{f.desc}</p>
                            </div>
                          </Reveal>
                        ))}
          </div>
      </div>
      </section>

      {/* BENEFICIOS */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Beneficios</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight">
                  Más orden, menos estrés
                </h2>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {benefits.map((b, i) => (
                <Reveal key={b} delay={i * 40}>
                  <div className="flex items-center gap-3 rounded-xl border border-[#e7dfd7] bg-white px-5 py-4">
                    <Check className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                    <span className="text-[#2d2a26]">{b}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
            </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 px-6 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,179,1,0.08)_0%,_rgba(255,255,255,0)_70%)] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative">
                  <Reveal>
                    <div className="text-center mb-14">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Cómo funciona</p>
                      <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight mb-4">
                        Listo para operar en 3 pasos
                      </h2>
                      <p className="text-lg text-[#6b635b]">Rápido de configurar, natural de usar.</p>
                    </div>
                  </Reveal>
                    <div className="grid md:grid-cols-3 gap-4">
                      {steps.map((step, i) => (
                        <Reveal key={step.num} delay={i * 80}>
                          <div className="relative h-full rounded-2xl border border-[#e7dfd7] bg-white p-8 shadow-[0_20px_60px_-40px_rgba(45,42,38,0.5)]">
                            <span className="text-sm font-medium" style={{ color: colorPalette.Gold }}>{step.num}</span>
                            <h3 className="text-xl font-medium text-[#1f1b16] mt-3 mb-2">{step.title}</h3>
                            <p className="text-[#6b635b] leading-relaxed">{step.desc}</p>
                          </div>
                        </Reveal>
                      ))}
          </div>
      </div>
      </section>

      {/* TESTIMONIOS */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Testimonios</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight mb-4">
                  Lo que dicen quienes ya lo usan
                </h2>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 70}>
                  <figure className="h-full rounded-2xl border border-[#e7dfd7] bg-white p-7 flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPalette.Gold }} />
                      ))}
                    </div>
                    <blockquote className="text-[#2d2a26] leading-relaxed flex-1">“{t.quote}”</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: colorPalette.Terracotta }}>
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-[#1f1b16]">{t.name}</p>
                        <p className="text-sm text-[#8b8178]">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
            </section>

      {/* LOGOS CONFIANZA */}
      <section className="py-12 border-y border-[#e7dfd7]">
              <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-xs uppercase tracking-[0.22em] text-[#8b8178] mb-6">Confianza en distintos formatos gastronómicos</p>
                <div className="flex flex-wrap items-center justify-center gap-7 md:gap-10">
                  {trustNames.map((name) => (
                    <span key={name} className="text-[#9a9188] text-sm font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
                </section>

      {/* PRECIOS PREVIEW */}
      <section id="pricing" className="py-24 px-6 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(231,223,215,0.35)_0%,_rgba(255,255,255,0)_70%)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto relative">
                      <Reveal>
                        <div className="text-center mb-14">
                          <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Precios</p>
                          <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight mb-4">
                            Simple, directo, sin sorpresas
                          </h2>
                          <p className="text-lg text-[#6b635b]">Un plan pensado para restaurantes que quieren operar mejor desde hoy.</p>
                        </div>
                      </Reveal>
                        <Reveal delay={100}>
                      <div className="max-w-2xl mx-auto">
                        <div className="relative rounded-2xl border border-[#e7dfd7] bg-white overflow-hidden shadow-[0_30px_70px_-50px_rgba(45,42,38,0.5)]">
                          <div className="p-8 md:p-10">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                              <div>
                                <p className="text-sm text-[#8b8178] mb-2">Plan Restaurante</p>
                                <div className="flex items-end gap-2">
                                  <span className="text-5xl md:text-6xl font-semibold text-[#1f1b16] tracking-tight">$0</span>
                                  <span className="text-[#8b8178] mb-2">/mes</span>
                                </div>
                                <p className="text-[#6b635b] mt-2">Todo lo esencial para empezar.</p>
                              </div>
                              <button
                                onClick={() => navigate("registro")}
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d97757]/60"
                                style={{ backgroundColor: colorPalette.Terracotta }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorPalette.TerracottaHover)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.Terracotta)}
                              >
                                Empezar gratis <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {["Mesas en tiempo real", "Cocina en vivo", "Carta digital", "Múltiples métodos de pago", "Roles y permisos", "Sincronización en tiempo real", "Historial de órdenes", "Soporte por WhatsApp"].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-[#2d2a26]">
                                  <Check className="w-4 h-4" style={{ color: colorPalette.Gold }} />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-[#e7dfd7] px-8 md:px-10 py-4 text-center text-sm text-[#8b8178] bg-[#faf7f5]">
                            Sin tarjeta de crédito · Sin compromiso
                          </div>
                        </div>
                      </div>
                        </Reveal>
        </div>
                        </section>

      {/* FAQ */}
      <section className="py-24 px-6">
                          <div className="max-w-4xl mx-auto">
                            <Reveal>
                              <div className="text-center mb-12">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#8b8178] mb-4">Preguntas frecuentes</p>
                                <h2 className="text-3xl md:text-5xl font-semibold text-[#1f1b16] leading-tight tracking-tight">
                                  Resolvemos tus dudas
                                </h2>
                              </div>
                            </Reveal>
                            <div className="grid gap-3">
                              {faqs.map((faq, i) => (
                                <Reveal key={faq.q} delay={i * 50}>
                                  <details className="group rounded-xl border border-[#e7dfd7] bg-white p-6 open:shadow-[0_10px_40px_-30px_rgba(45,42,38,0.6)]">
                                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-[#1f1b16] font-medium">
                                      {faq.q}
                                      <span className="text-[#8b8178] transition-transform group-open:rotate-45">+</span>
                                    </summary>
                                    <p className="mt-3 text-[#6b635b] leading-relaxed">{faq.a}</p>
                                  </details>
                                </Reveal>
                              ))}
                            </div>
                          </div>
                            </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6">
                              <div className="max-w-7xl mx-auto">
                                <Reveal>
                                  <div className="relative overflow-hidden rounded-3xl border border-[#e7dfd7] bg-[#1f1b16] px-6 py-14 md:px-12 md:py-16 text-center">
                                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                                    <div className="relative">
                                      <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-4">Listo para empezar</p>
                                      <h2 className="text-3xl md:text-5xl font-semibold text-white leading-tight tracking-tight mb-4">
                                        Ordena, cobra y cocina sin caos
                                      </h2>
                                      <p className="text-lg text-white/70 max-w-2xl mx-auto mb-9">
                                        Digitaliza tu operación sin complicar al equipo. Empezá gratis desde hoy.
                                      </p>
                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => navigate("registro")}
                                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40"
                                          style={{ backgroundColor: colorPalette.Terracotta }}
                                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorPalette.TerracottaHover)}
                                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.Terracotta)}
                                        >
                                          Empezar gratis <ArrowRight className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </Reveal>
                              </div>
                                </section>

                                <MarketingFooter />
                                  </div>
  );
}
