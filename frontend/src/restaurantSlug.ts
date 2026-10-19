// Single source of truth for the {slug} segment of /kitchen/{slug}/... and
// /admin/{slug}/... URLs: the restaurant name rendered URL-safe (lowercase,
// accent-free, hyphen-separated). The slug is purely cosmetic — data is always
// scoped by the session cookie, never by the URL — so every builder (login,
// register, navbar CTAs, tab navigation, scope check) must go through this
// helper to stay consistent and bounce mismatches instead of leaking a foreign
// scope. Falls back to `r-{id}` when the name yields no usable slug (empty or
// non-Latin names), keeping URLs stable across sessions.
export function restaurantSlug(
  name: string | null | undefined,
  restaurantId: number
): string {
  const slug = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `r-${restaurantId || 0}`;
}
