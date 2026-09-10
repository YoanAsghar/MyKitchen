'use client';

import { useEffect } from "react";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";
import { BodyTabs } from "../models/BodyTabs";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useGlobalContext } from "./GlobalContext";

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated,
    username,
    role,
    isLoading,
    isAuthChecking,
    logout,
  } = useGlobalContext();
  
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Marketing pages (/home*) and the auth section (/auth*) are public: no auth
  // redirect and no app Navbar. Everything else requires an authenticated session.
  const isPublicPath = pathname.startsWith("/auth") || pathname.startsWith("/home");

  useEffect(() => {
    // Redirect to login if not authenticated and not already on a public page.
    // Wait for the session-restore (/me) check to finish first so a valid cookie
    // doesn't get bounced to /auth/login on refresh.
    if (!isAuthChecking && !isLoading && !isAuthenticated && !isPublicPath) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, pathname, isLoading, isAuthChecking, isPublicPath, router]);

  const getTabFromPathname = (path: string): BodyTabs => {
    if (path.includes("mesas")) return BodyTabs.mesas;
    if (path.includes("cocina")) return BodyTabs.cocina;
    if (path.includes("ordenes")) return BodyTabs.ordenes;
    if (path.includes("carta")) return BodyTabs.carta;
    if (path.includes("admin")) return BodyTabs.admin;
    return BodyTabs.mesas;
  };

  const currentTab = getTabFromPathname(pathname || "");

  // The restaurant id for the current kitchen scope, from /kitchen/[id]/...
  // Falls back to the first restaurant until multi-restaurant scoping is wired.
  const kitchenId = typeof params?.id === "string" ? params.id : "1";

  const handleTabChange = (tab: BodyTabs) => {
    router.push(`/kitchen/${kitchenId}/${tab}`);
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
