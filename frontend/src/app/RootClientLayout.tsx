'use client';

import { useEffect, useMemo } from "react";
import LoadingOverlay from "../components/LoadingOverlay";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useGlobalContext } from "./GlobalContext";
import { restaurantSlug } from "../restaurantSlug";

// Pure auth/route guard. It renders {children} for every path and owns only
// what must apply app-wide: the session-restore gate, the login redirect, the
// slug-bounce (URL always mirrors the session's restaurant) and the admin
// manager gate. The chrome itself lives with the sections that need it:
// kitchen pages get it from kitchen/[slug]/layout.tsx, the admin dashboard
// from admin/[slug]/layout.tsx, and public pages render bare.
export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated,
    role,
    restaurantId,
    restaurantName,
    isLoading,
    isAuthChecking,
  } = useGlobalContext();

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Marketing pages (/home*), the auth section (/auth*) and the root "/" (which
  // now always shows the landing) are public: no auth redirect and no app
  // Navbar. Everything else requires an authenticated session.
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

  // While verifying the persisted session, show nothing to avoid a redirect flash
  // to /auth/login before /me resolves.
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-primary">
        <LoadingOverlay isVisible={true} message="Cargando..." />
      </div>
    );
  }

  // Non-managers never see the admin shell; hold on the loader while the
  // redirect above runs.
  if (isAdminPath && !isManager) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-primary">
        <LoadingOverlay isVisible={true} message="Cargando..." />
      </div>
    );
  }

  return <>{children}</>;
}
