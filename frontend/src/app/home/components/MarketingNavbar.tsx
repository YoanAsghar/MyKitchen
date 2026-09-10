"use client";

import { useState } from "react";
import { Menu, X, ChefHat } from "lucide-react";
import { GhostBtn, PrimaryBtn, marketingPath, type MarketingPage } from "./ui";
import { useRouter } from "next/navigation";

export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const navigate = (page: MarketingPage) => router.push(marketingPath(page));

  const goToLandingWithFeatures = () => {
    router.push(marketingPath("landing"));
    setTimeout(() => {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <button
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-900">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">
            Restaurant CRM
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <button
            onClick={() => navigate("landing")}
            className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
          >
            Inicio
          </button>
          <button
            onClick={goToLandingWithFeatures}
            className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
          >
            Funciones
          </button>
          <button
            onClick={() => navigate("pricing")}
            className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
          >
            Precios
          </button>
          <button
            onClick={() => navigate("contact")}
            className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
          >
            Contacto
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <GhostBtn onClick={() => navigate("login")} className="text-sm py-2 px-5">
            Iniciar sesión
          </GhostBtn>
          <PrimaryBtn onClick={() => navigate("registro")} className="text-sm py-2 px-5">
            Crear tu restaurante
          </PrimaryBtn>
        </div>

        <button
          className="md:hidden text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t border-black/5 px-6 py-5 flex flex-col gap-3"
          style={{ backgroundColor: "#ffffff" }}
        >
          {[
            { label: "Inicio", page: "landing" as MarketingPage },
            { label: "Funciones", page: "landing" as MarketingPage },
            { label: "Precios", page: "pricing" as MarketingPage },
            { label: "Contacto", page: "contact" as MarketingPage },
          ].map((l) => (
            <button
              key={l.label}
              onClick={() => {
                setMobileOpen(false);
                navigate(l.page);
              }}
              className="text-left py-2.5 text-gray-500 hover:text-gray-900 text-base font-medium border-b border-black/5 transition-colors cursor-pointer"
            >
              {l.label}
            </button>
          ))}
          <GhostBtn
            onClick={() => {
              setMobileOpen(false);
              navigate("login");
            }}
            className="w-full mt-1"
          >
            Iniciar sesión
          </GhostBtn>
          <PrimaryBtn
            onClick={() => {
              setMobileOpen(false);
              navigate("registro");
            }}
            className="w-full"
          >
            Crear tu restaurante
          </PrimaryBtn>
        </div>
      )}
    </nav>
  );
}