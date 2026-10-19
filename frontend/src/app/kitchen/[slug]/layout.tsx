"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "../../../components/Navbar";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { BodyTabs } from "../../../models/BodyTabs";
import { useGlobalContext } from "../../GlobalContext";
import { restaurantSlug } from "../../../restaurantSlug";

// App chrome for every kitchen route (/kitchen/{slug}/...), the same way
// admin/[slug]/layout.tsx owns the admin chrome. RootClientLayout stays a pure
// auth/route guard and just renders {children}; the Navbar, the h-screen
// wrapper and the loading overlay live here, so they only mount for the
// pages they actually belong to.
export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { username, role, restaurantId, restaurantName, isLoading, logout } =
    useGlobalContext();

  const router = useRouter();
  const pathname = usePathname();

  // Exact third segment (/kitchen/{slug}/{tab}) — never a substring match:
  // a slug like "mesas-bonitas" or "cocina-central" must not hijack the tab.
  // Note split("/") yields a leading "", so [0]="" [1]="kitchen" [2]=slug [3]=tab.
  const getTabFromPathname = (path: string): BodyTabs => {
    const tab = path.split("/")[3];
    if (tab === "cocina") return BodyTabs.cocina;
    if (tab === "ordenes") return BodyTabs.ordenes;
    if (tab === "carta") return BodyTabs.carta;
    return BodyTabs.mesas;
  };

  const currentTab = getTabFromPathname(pathname || "");

  // The session's own restaurant slug — the single source of truth for the
  // {slug} URL segment. Data is always scoped by the cookie claim, so this
  // only keeps navigation (and the address bar) on the caller's own restaurant.
  const sessionSlug = useMemo(
    () => restaurantSlug(restaurantName, restaurantId),
    [restaurantName, restaurantId]
  );

  const handleTabChange = (tab: BodyTabs) => {
    if (tab === BodyTabs.admin) {
      router.push(`/admin/${sessionSlug}`);
      return;
    }
    router.push(`/kitchen/${sessionSlug}/${tab}`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Navbar
        username={username}
        setTabChange={handleTabChange}
        currentTab={currentTab}
        role={role}
        onLogout={logout}
      />

      <section className="flex-1 overflow-hidden">
        <main className="w-full h-full flex flex-row relative">
          {children}
        </main>
      </section>

      {isLoading && (
        <LoadingOverlay isVisible={true} message="Cargando..." />
      )}
    </div>
  );
}
