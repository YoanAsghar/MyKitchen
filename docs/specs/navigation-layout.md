# SPEC-004 · Navegación, layout y contextos globales

- **ID:** SPEC-004
- **Área:** Plataforma
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

La app mezcla un sitio público (marketing + login) con un área de negocio por
restaurante. Hay que decidir en cada carga si mostrar la app o el sitio público,
qué pestaña está activa, y compartir el estado de sesión y de órdenes sin
duplicarlo por página.

## 2. Objetivo

Definir el enrutado, el layout (chrome vs. público) y los dos contextos globales
(`GlobalContext` y `OrdersContext`) que sostienen la app.

## 3. Alcance

**Incluye**
- Rutas públicas (`/`, `/home*`, `/auth*`) vs. privadas (`/kitchen/{id}/*`) y
  standalone (`/admin/{id}`).
- Redirecciones: `/` → siempre `/home`; privada sin sesión → `/auth/login`;
  `/kitchen/<otroId>` → `/kitchen/{sesión}/mesas`; `/admin/<otroId>` →
  `/admin/{sesión}`.
- Layout con `Navbar` y overlay de carga (app) / sin app chrome (admin).
- `GlobalProvider` (sesión) y `OrdersProvider` (tiempo real) envolviendo la app.

**No incluye (fuera de alcance)**
- Internacionalización.
- Theming conmutable (los estilos son fijos por pantalla).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Público vs. privado
- **Dado** una ruta `/`, `/home*` o `/auth*`
- **Cuando** se renderiza
- **Entonces** no hay redirect de auth ni `Navbar`, y la página scrollea normal.

### HU-2 — Ruta privada sin sesión
- **Dado** un visitante sin cookie
- **Cuando** entra a `/kitchen/1/mesas`
- **Entonces** es redirigido a `/auth/login` (tras resolver el chequeo de sesión).

### HU-3 — Raíz siempre al landing
- **Dado** cualquier usuario (logueado o no)
- **Cuando** entra a `/`
- **Entonces** siempre va a `/home` (el landing); si está logueado, la decisión de
  entrar al local la toma él desde el `MarketingNavbar` (ver
  [marketing-site.md](./marketing-site.md)) — nunca es automática.

### HU-4 — Pestaña activa desde la URL
- **Dado** la ruta `/kitchen/3/ordenes`
- **Cuando** se pinta el `Navbar`
- **Entonces** la pestaña Ordenes aparece seleccionada y las demás navegan con
  `handleTabChange` preservando el `{id}`.

### HU-5 — Estado único de órdenes
- **Dado** una orden abierta
- **Cuando** navego entre Mesas, Cocina y Ordenes
- **Entonces** todas leen el mismo `OrdersContext` (no hay estado por página).

### HU-6 — Admin standalone
- **Dado** una ruta `/admin/{id}`
- **Cuando** se renderiza un usuario con sesión
- **Entonces** no se pinta el `Navbar` ni el chrome de la app (el layout propio del
  admin provee sidebar/topbar/logout) y un `/admin/<otroId>` rebota a
  `/admin/{restaurantIdSesión}`.

## 5. Contrato de API

N/A.

## 6. Modelo de datos

- `BodyTabs` (`frontend/src/models/BodyTabs.tsx`): `mesas`, `cocina`, `ordenes`,
  `carta`, `domicilios`, `admin`. (`domicilios` no tiene página todavía.)

## 7. Eventos en tiempo real

N/A (los consume `OrdersContext`, ver [realtime.md](./realtime.md)).

## 8. Reglas de negocio y casos borde

- `isPublicPath = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/home")`.
- `isAdminPath = pathname.startsWith("/admin")` → render sin app chrome (pero con
  sesión obligatoria).
- La redirección a login espera a que `isAuthChecking` termine para no patear a
  login en un refresh con cookie válida.
- Mientras `isAuthChecking`, el layout no renderiza children (evita el flash).
- `kitchenId` sale de `useParams` y cae al `restaurantId` de sesión si no aplica.
- `handleTabChange` manda `admin` a `/admin/{restaurantId}` (fuera de `/kitchen`).

## 9. UI / Flujo

- `frontend/src/app/layout.tsx` monta `GlobalProvider` → `OrdersProvider` →
  `RootClientLayout` → children.
- `frontend/src/app/RootClientLayout.tsx`: redirects, `isPublicPath`/`isAdminPath`,
  `getTabFromPathname`, `handleTabChange`, gating del `Navbar`.
- `frontend/src/components/Navbar.tsx`: logo, tabs, **Admin** (a la izquierda de
  logout, para `owner`/`admin`), usuario y logout. Acento púrpura `#22007c`
  (`colorPalette.Navy`).
- `frontend/src/app/admin/[id]/layout.tsx`: chrome standalone del admin (ver
  [admin-panel.md](./admin-panel.md)).
- `frontend/src/components/LoadingOverlay.tsx`: overlay cuando `isLoading`.

**Discrepancia a resolver:** `AGENTS.md` describe el marketing como oscuro
(`#0a0a0f` + acento verde `#22c55e`), pero el código actual
(`LandingView`, `Login`, `RegistroView`) usa tema **claro** (`bg-white`, grises,
botones `#22007c`). El código es la fuente de verdad; ver
[marketing-site.md](./marketing-site.md).

## 10. Cobertura de tests

Sin tests de frontend (no hay suite). Verificación por `npx tsc --noEmit` y
manual.

## 11. Preguntas abiertas / Backlog

- [ ] Alinear la estética de `AGENTS.md` con la real o rehacer el marketing a
      oscuro (decisión pendiente).
- [ ] Página/estado para `domicilios` (delivery) o quitarla del enum.
- [ ] Rediseñar el `Navbar` si se rethemea la app.
