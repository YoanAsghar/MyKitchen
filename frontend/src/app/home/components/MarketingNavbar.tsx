"use client";

import { useState } from "react";
import { Menu, X, ChefHat } from "lucide-react";
import { PrimaryBtn, marketingPath, type MarketingPage } from "./ui";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "../../GlobalContext";
import { restaurantSlug } from "../../../restaurantSlug";

export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isAuthChecking, restaurantId, restaurantName } = useGlobalContext();

  const slug = restaurantSlug(restaurantName, restaurantId);

  const navigate = (page: MarketingPage) => router.push(marketingPath(page));
  const goToRestaurant = () => router.push(`/kitchen/${slug}/mesas`);
  const goToRegistro = () => router.push("/home/registro");
  const goToLogin = () => router.push("/auth/login");

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
        backgroundColor: "rgba(250,247,245,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(231,223,215,0.9)",
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
            MyKitchen
          </span>
        </button>


        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthChecking ? (
            <div className="w-[200px] h-10" />
          ) : isAuthenticated ? (
            <PrimaryBtn onClick={goToRestaurant} className="text-sm py-2 px-5">
              Ir a mi restaurante
            </PrimaryBtn>
          ) : (
            <>
              <button
                onClick={goToRegistro}
                className="text-gray-900 hover:bg-gray-100 transition-colors text-sm font-medium py-2 px-5 rounded-lg cursor-pointer"
              >
                Crea tu restaurante
              </button>
              <PrimaryBtn onClick={goToLogin} className="text-sm py-2 px-5">
                Acceder a tu restaurante
              </PrimaryBtn>
            </>
          )}
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
                if (l.label === "Funciones") {
                  goToLandingWithFeatures();
                } else {
                  navigate(l.page);
                }
              }}
              className="text-left py-2.5 text-gray-500 hover:text-gray-900 text-base font-medium border-b border-black/5 transition-colors cursor-pointer"
            >
              {l.label}
            </button>
          ))}
          {isAuthenticated ? (
            <PrimaryBtn
              onClick={() => {
                setMobileOpen(false);
                goToRestaurant();
              }}
              className="w-full mt-1"
            >
              Ir a mi restaurante
            </PrimaryBtn>
          ) : (
            <>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  goToRegistro();
                }}
                className="text-left py-2.5 text-gray-900 hover:text-gray-700 text-base font-medium transition-colors cursor-pointer"
              >
                Crea tu restaurante
              </button>
              <PrimaryBtn
                onClick={() => {
                  setMobileOpen(false);
                  goToLogin();
                }}
                className="w-full"
              >
                Acceder a tu restaurante
              </PrimaryBtn>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
