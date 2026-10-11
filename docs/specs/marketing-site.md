# SPEC-014 · Sitio de marketing público

- **ID:** SPEC-014
- **Área:** Marketing
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

El producto necesita una cara pública que explique qué es, muestre precios,
permita contactar y dé de alta un restaurante, sin requerir sesión.

## 2. Objetivo

Ofrecer las páginas públicas de presentación y registro, separadas del área de
negocio, con estética propia y navegación consistente.

## 3. Alcance

**Incluye**
- `/home` (landing con hero, features, pasos, precios, testimonios y CTA).
- `/home/pricing` (plan único con toggle mensual/anual).
- `/home/contact` (tarjetas de contacto).
- `/home/registro` (alta real de restaurante).
- Primitivos compartidos: `PrimaryBtn`, `GhostBtn`, `FieldInput`, `marketingPath`.
- `MarketingNavbar`, `MarketingFooter`, `AppMockup`.

**No incluye (fuera de alcance)**
- CMS / edición de contenido.
- Blog, docs, changelog.
- Pasarela de pago real (el plan es informativo).
- SEO avanzado / i18n.

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Landing pública
- **Dado** un visitante
- **Cuando** entra a `/home`
- **Entonces** ve el sitio sin redirect de auth ni `Navbar` de la app.

### HU-2 — Navegación de marketing
- **Dado** el navbar de marketing
- **Cuando** elijo Inicio/Precios/Contacto
- **Entonces** navega a `/home`, `/home/pricing`, `/home/contact`; "Iniciar
  sesión" va a `/auth/login` y "Crear tu restaurante" a `/home/registro`.

### HU-3 — Precios
- **Dado** `/home/pricing`
- **Cuando** cambio el toggle mensual/anual
- **Entonces** el precio del plan cambia (USD 89/mes · 69 anual, informativo).

### HU-4 — Contacto
- **Dado** `/home/contact`
- **Cuando** uso los botones de contacto
- **Entonces** se abren mailto/WhatsApp (datos placeholder, editables).

### HU-5 — Registro real
- **Dado** el formulario de `/home/registro`
- **Cuando** envío datos válidos
- **Entonces** se crea el restaurante (ver
  [restaurant-onboarding.md](./restaurant-onboarding.md)), se inicia sesión y se
  redirige a `/kitchen/{id}/mesas`.

### HU-6 — Navbar con sesión
- **Dado** un usuario logueado navegando el marketing
- **Cuando** mira el `MarketingNavbar`
- **Entonces** ve **"Ir a mi restaurante"** (→ `/kitchen/{restaurantId}/mesas`) en
  lugar de Iniciar sesión/Crear cuenta; y si es `owner`/`admin`, además
  **"Gestionar mi restaurante"** (→ `/admin/{restaurantId}`). Mientras se restaura
  la sesión se muestra un placeholder (sin flash de CTAs logueados).

### HU-7 — Raíz sin auto-redirección
- **Dado** un usuario logueado
- **Cuando** entra a `/`
- **Entonces** siempre llega a `/home` (ver
  [navigation-layout.md](./navigation-layout.md)); no se lo mete al local por
  fuerza — elige desde el navbar.

## 5. Contrato de API

El resto de las páginas es estático. `/home/registro` consume
`POST /api/v1/Restaurant/register` (ver SPEC-005).

## 6. Modelo de datos

N/A (el registro usa `RegisterRestaurantRequest`).

## 7. Eventos en tiempo real

N/A.

## 8. Reglas de negocio y casos borde

- **Estética actual: tema claro** (`bg-white`, grises, botones `#22007c`,
  `FieldInput` con foco verde). Nota: `AGENTS.md` y
  `docs/landing-site-figma-brief.md` describen un tema oscuro (`#030014`/`#0a0a0f`
  + acento verde) que **no** coincide con el código actual. El código es la
  fuente de verdad; el brief quedó como referencia histórica.
- `marketingPath()` centraliza las rutas; `MarketingPage` tipa las vistas.
- El registro valida en cliente (nombre, encargado, email regex, contraseña ≥ 8,
  confirmación) y muestra error/success; el backend re-valida.

## 9. UI / Flujo

- `frontend/src/app/home/page.tsx` → `LandingView`; `pricing/`, `contact/`,
  `registro/` montan sus vistas.
- Componentes en `frontend/src/app/home/components/`: `ui.tsx` (primitivos +
  `marketingPath`), `MarketingNavbar`, `MarketingFooter`, `AppMockup`,
  `LandingView`, `PricingView`, `ContactView`, `RegistroView`.
- `MarketingNavbar` consume `useGlobalContext` para alternar CTAs según sesión
  (`isAuthenticated`, `role`, `restaurantId`, `isAuthChecking`); mismo criterio en
  el menú móvil.
- `/`, `/home*` y `/auth*` son públicas en `RootClientLayout` (ver
  [navigation-layout.md](./navigation-layout.md)).

## 10. Cobertura de tests

Sin tests de frontend. La parte con lógica (register) está cubierta en
`backend.Tests/RestaurantControllerTests.cs`.

## 11. Preguntas abiertas / Backlog

- [ ] Decidir la estética definitiva (hoy el código es claro; el brief pedía
      oscuro) y alinear `AGENTS.md`, este spec y el brief.
- [ ] Datos de contacto reales (hoy placeholders).
- [ ] Página de login de marketing vs. `/auth/login` (hoy una sola).
- [ ] SEO/OpenGraph, sitemap.

> **Relacionadas:** [restaurant-onboarding.md](./restaurant-onboarding.md),
> [auth.md](./auth.md), [navigation-layout.md](./navigation-layout.md).
