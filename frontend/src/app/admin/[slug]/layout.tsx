"use client";

import {
  BarChart3,
  ChefHat,
  History,
  House,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Settings,
  Tags,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalContext } from "../../GlobalContext";
import { restaurantSlug } from "../../../restaurantSlug";

const iconClassName = "w-4 h-4";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { username, role, restaurantId, restaurantName, logout } = useGlobalContext();
  const router = useRouter();
  const pathname = usePathname();

  // Same slug rule as the kitchen routes, so "Ir a mi restaurante" and every
  // sidebar href point at this restaurant's own /admin/{slug} section.
  const adminSlug = restaurantSlug(restaurantName, restaurantId);
  const restaurantPath = `/kitchen/${adminSlug}/mesas`;

  const sections: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; activeWhen: string }[] = [
    { href: `/admin/${adminSlug}`, label: "Panel", icon: LayoutDashboard, activeWhen: "" },
    { href: `/admin/${adminSlug}/empleados`, label: "Empleados", icon: Users, activeWhen: "empleados" },
    { href: `/admin/${adminSlug}/productos`, label: "Productos", icon: UtensilsCrossed, activeWhen: "productos" },
    { href: `/admin/${adminSlug}/mesas`, label: "Mesas", icon: LayoutGrid, activeWhen: "mesas" },
    { href: `/admin/${adminSlug}/historial`, label: "Historial / Ventas", icon: History, activeWhen: "historial" },
    { href: `/admin/${adminSlug}/gastos`, label: "Gastos", icon: Wallet, activeWhen: "gastos" },
    { href: `/admin/${adminSlug}/reportes`, label: "Reportes / Métricas", icon: BarChart3, activeWhen: "reportes" },
    { href: `/admin/${adminSlug}/categorias`, label: "Categorías", icon: Tags, activeWhen: "categorias" },
    { href: `/admin/${adminSlug}/configuracion`, label: "Configuración", icon: Settings, activeWhen: "configuracion" },
  ];

  const isActive = (section: (typeof sections)[number]) => {
    if (section.activeWhen === "") return pathname === section.href;
    return pathname.includes(section.activeWhen);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/home");
  };

  const renderNavItems = () =>
    sections.map((section) => {
      const Icon = section.icon;
      const active = isActive(section);
      return (
        <button
          key={section.href}
          onClick={() => router.push(section.href)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            active
              ? "bg-white/[0.06] text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon className={`${iconClassName} ${active ? "text-brand-500" : ""}`} />
          {section.label}
        </button>
      );
    });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-500">
            <ChefHat className="w-5 h-5 text-[#0a0a0f]" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">MyKitchen</p>
            <p className="text-xs text-white/40">Panel de administración</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {renderNavItems()}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
          <button
            onClick={() => router.push(restaurantPath)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <House className={iconClassName} />
            Ir a mi restaurante
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut className={iconClassName} />
            Cerrar sesión
          </button>
          <p className="text-[11px] text-white/30 px-2 pt-2 truncate">
            {username.toUpperCase()} · {role}
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar (mobile) */}
        <header className="md:hidden flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-500">
              <ChefHat className="w-4 h-4 text-[#0a0a0f]" />
            </div>
            <p className="font-bold text-sm">Admin</p>
          </div>
          <select
            value={pathname}
            onChange={(e) => router.push(e.target.value)}
            className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white px-2 py-2 focus:outline-none"
          >
            {sections.map((section) => (
              <option key={section.href} value={section.href} className="bg-[#0a0a0f]">
                {section.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => router.push(restaurantPath)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Ir a mi restaurante"
            >
              <House className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-canvas text-ink">{children}</main>
      </div>
    </div>
  );
}