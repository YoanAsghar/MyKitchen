'use client';

import { useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";
import { BodyTabs } from "../models/BodyTabs";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useGlobalContext } from "./GlobalContext";
import { restaurantSlug } from "../restaurantSlug";

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated,
    username,
    role,
    restaurantId,
    restaurantName,
    isLoading,
    isAuthChecking,
    logout,
  } = useGlobalContext();
  
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Marketing pages (/home*), the auth section (/auth*) and the root "/" (which
  // now always shows the landing) are public: no auth redirect and no app Navbar.
  // Everything else requires an authenticated session.
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/home");

  // The admin dashboard (/admin/[slug]) is a fully standalone section: it still
  // requires a session but renders its own chrome (sidebar/topbar in its layout),
  // without the app Navbar. Only managers (admin/owner) may view it — the same
  // gate the backend enforces via the ManagerOnly policy, so a staff `user`
  // can't open the shell by typing the URL.
  const isAdminPath = pathname.startsWith("/admin");
  const isManager = role === "admin" || role === "owner";

  useEffect(() => {
    // Redirect to login if not authenticated and not already on a public page.
    // Wait for the session-restore (/me) check to finish first so a valid cookie
    // doesn't get bounced to /auth/login on refresh.
    if (!isAuthChecking && !isLoading && !isAuthenticated && !isPublicPath) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, pathname, isLoading, isAuthChecking, isPublicPath, router]);

  const getTabFromPathname = (path: string): BodyTabs => {
    // Exact third segment (/kitchen/{slug}/{tab}) — never a substring match:
    // a slug like "mesas-bonitas" or "cocina-central" must not hijack the tab.
    const tab = path.split("/")[2];
    if (tab === "cocina") return BodyTabs.cocina;
    if (tab === "ordenes") return BodyTabs.ordenes;
    if (tab === "carta") return BodyTabs.carta;
    if (tab === "admin") return BodyTabs.admin;
    return BodyTabs.mesas;
  };

  const currentTab = getTabFromPathname(pathname || "");

  // The session's own restaurant slug — the single source of truth for the
  // {slug} URL segment (kitchen + admin). The backend scopes every API call to
  // the cookie's restaurantId claim, so the URL can never switch tenants; it
  // only mirrors the session's restaurant name.
  const sessionSlug = useMemo(
    () => restaurantSlug(restaurantName, restaurantId),
    [restaurantName, restaurantId]
  );

  // The {slug} currently in the URL (from /kitchen/[slug]/... or
  // /admin/[slug]/...), falling back to the session slug when not on such a
  // route. Never used to fetch data — only to detect a stale/foreign URL.
  const urlSlug = typeof params?.slug === "string" ? params.slug : sessionSlug;

  useEffect(() => {
    const onKitchenRoute = /^\/kitchen\/[^/]+/.test(pathname ?? "");
    const onAdminRoute = /^\/admin\/[^/]+/.test(pathname ?? "");
    // Keep the URL honest: a manually edited /kitchen/<otroSlug>/... or
    // /admin/<otroSlug>/... (including legacy id URLs like /kitchen/1/mesas)
    // can't show another restaurant's data (the backend serves only the
    // session's scope), so bounce back to the caller's own restaurant slug.
    if (!isAuthChecking && isAuthenticated && (onKitchenRoute || onAdminRoute) && urlSlug !== sessionSlug) {
      router.replace(
        onAdminRoute
          ? `/admin/${sessionSlug}`
          : `/kitchen/${sessionSlug}/mesas`
      );
    }
  }, [isAuthChecking, isAuthenticated, pathname, urlSlug, sessionSlug, router]);

  // Managers only: bounce a staff `user` off the admin section back to their
  // kitchen (the backend would 403 the data calls anyway).
  useEffect(() => {
    if (!isAuthChecking && isAuthenticated && isAdminPath && !isManager) {
      router.replace(`/kitchen/${sessionSlug}/mesas`);
    }
  }, [isAuthChecking, isAuthenticated, isAdminPath, isManager, sessionSlug, router]);

  const handleTabChange = (tab: BodyTabs) => {
    if (tab === BodyTabs.admin) {
      router.push(`/admin/${sessionSlug}`);
      return;
    }
    router.push(`/kitchen/${sessionSlug}/${tab}`);
  };

  // While verifying the persisted session, show nothing to avoid a redirect flash
  // to /auth/login before /me resolves.
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-primary">
        <LoadingOverlay isVisible={true} message="Cargando..." />
      </div>
    );
  }

  // Public pages (marketing site + login) render without the app chrome so they
  // can scroll normally and use their own marketing navbar/footer.
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Standalone admin dashboard: no app Navbar, no app chrome. Non-managers
  // never see the shell; hold on the loader while the redirect above runs.
  if (isAdminPath) {
    if (!isManager) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-primary">
          <LoadingOverlay isVisible={true} message="Cargando..." />
        </div>
      );
    }
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {isAuthenticated && (
        <Navbar
          username={username}
          setTabChange={handleTabChange}
          currentTab={currentTab}
          role={role}
          onLogout={logout}
        />
      )}

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
