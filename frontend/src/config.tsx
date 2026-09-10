// Optional build-time override (Next.js inlines this at build; `undefined` when unset).
const apiRouteOverride: string | undefined = process.env.NEXT_PUBLIC_API_ROUTE;

export const config = {
  // Default: the page's own hostname on the backend port. Keeping page + API on
  // the SAME host (localhost or LAN IP) makes every request same-site, which is
  // required for the SameSite=Lax "AuthorizationCookies" cookie to be sent on
  // fetch(). Ports don't matter for SameSite — only the hostname does.
  apiRoute:
    apiRouteOverride ||
    (typeof window !== "undefined"
      ? `http://${window.location.hostname}:3000`
      : "http://localhost:3000"),
}