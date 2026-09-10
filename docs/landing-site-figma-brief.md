# Landing Site — Figma Brief & Design Reference

> **Product:** Restaurant CRM · **Working name during prototyping:** MyKitchen
> **Source:** `FigmaDesigns/` (exported Figma prototype) — design of record for the landing site.
> **Date:** 2026-09-09

## Purpose

This brief documents the Figma-generated design decisions for the **public marketing site**
(landing, pricing, contact, registro) and serves as the contract for the frontend port in
`frontend/src/app/home/`.

## Decisions locked with the owner

| Decision | Value |
|---|---|
| Marketing site | Multi-page, **Spanish** (Rioplatense), under `frontend/src/app/home/` |
| Routes | `/home` · `/home/pricing` · `/home/contact` · `/home/registro` |
| Auth | `/auth/login` (moved from `/login`; future `/auth/*` pages land here) |
| Root `/` | redirect → `/home` (logged out) / `/kitchen/1/mesas` (logged in) |
| Login | `/auth/login`, styled to match Figma LoginView |
| Pricing | **single flat plan** "Profesional" · USD 89/mes (USD 69 annual) · monthly/annual toggle |
| Contact | placeholder details (email/phone/address) + mailto/WhatsApp — marked editable |
| Brand | "RestaurantCRM", ChefHat logo mark, no external assets (pure SVG/lucide) |
| Visual kit | dark `#030014`, purple `#22007c`, gradient `#D6C7FF→#AB8BFF`, Bebas Neue watermarks, glass cards, glow orbs |
| Register | visual form only for now; backend wiring (`POST /api/v1/Restaurant/register`) pending |
| App | kitchen-scoped under `/kitchen/{id}/` → `/kitchen/{id}/mesas` · `.../cocina` · `.../carta` · `.../ordenes` · `.../admin` (id = restaurant id, currently `1`) |

## Figma prompt (as submitted)

> Build a high-fidelity, dark-themed SaaS marketing + onboarding prototype for "Restaurant CRM"
> — a restaurant management platform with real-time table & kitchen order sync (SignalR). UI
> language: SPANISH (Latin America). Style: premium dark SaaS, violet-purple accents, subtle
> glassmorphism, soft glowing orbs, rounded glass cards, bold modern type.
>
> **Brand/visual language**
> - Backgrounds: deep near-black navy `#030014`; cards on `#0f0d23` with white/5–10% fill, 1px
>   white/10 borders, backdrop-blur, rounded 1.5–2rem, soft purple glow shadows.
> - Accents: primary violet `#22007c`, hover `#2a0096`; gradient text `#D6C7FF → #AB8BFF`.
> - Palette: `#02010a`, `#04052e`, `#140152`, `#22007c`, `#121212`, `#f4f4f8`, `#a8b5db`,
>   `#9ca4ab`, success green `#22c55e`.
> - Large radial purple-glow orbs behind hero/key sections; generous whitespace; glass cards.
> - Typography: DM Sans for UI/copy; Bebas Neue for oversized display/watermark words.
> - Buttons: primary = filled `#22007c` with glow; ghost = transparent + white/10 border;
>   pill/rounded-2xl; hover/active states.
>
> **Frames** (desktop 1440 + mobile 390 for Landing & Registro)
> 1. Landing — marketing navbar (logo, Inicio/Funciones/Precios/Contacto, Iniciar sesión +
>    Crear tu restaurante), hero with badge + headline + 2 CTAs + app mockup in a glass
>    browser frame, trust strip, 6 feature cards, "Cómo funciona" 3 steps, single-plan pricing
>    teaser with monthly/annual toggle, testimonials, final CTA band, footer.
> 2. Precios — hero, toggle, one "PROFESIONAL · TODO INCLUIDO" plan card (feature checklist),
>    custom/contact block.
> 3. Contacto — 3 contact cards (Correo, WhatsApp, Dirección) + mailto/WhatsApp + horario.
> 4. Registro — centered glass card: Nombre del restaurante, Usuario admin, Contraseña,
>    Confirmar contraseña + "Crear tu restaurante".
> 5. Iniciar sesión — centered card: Usuario, Contraseña, ¿Olvidaste tu contraseña?,
>    "Acceder al Sistema".
> 6. App shell (reference) — top navbar tabs (Mesas/Cocina/Carta/Órdenes/Admin), mesas grid +
>    table sidebar.

## Porting contract (frontend)

- Shared primitives live in `frontend/src/app/home/components/ui.tsx` and must be reused,
  never re-inlined: `GlowOrb`, `GradientText`, `PrimaryBtn`, `GhostBtn`, `FieldInput`,
  `marketingPath()`, `MarketingPage`.
- `MarketingNavbar`, `MarketingFooter`, `AppMockup` in `frontend/src/app/home/components/`.
- Views (`LandingView`, `PricingView`, `ContactView`, `RegistroView`) are page-mounted and
  use `useRouter` for navigation via `marketingPath`.
- Keep the Figma look ("faithful port"); adjust only for React/Next routing realities.