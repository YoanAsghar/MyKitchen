# MyKitchen Design System

**Status:** proposed source of truth for the app-wide palette migration.
**Reference:** the current `/home` (marketing) palette, with accessibility corrections for interactive text.
**Scope:** all product surfaces — marketing, auth, kitchen (Mesas, Cocina, Carta, Órdenes) and admin.
**Decision logged:** hybrid surfaces — **light pages, dark chrome**; **Cocina keeps a dedicated dark high-contrast treatment**; **green becomes a secondary accent**, not the primary action color.

---

## 1. Design principles

1. **Warm, not cold.** The product is food/restaurant software. Surfaces use warm whites and warm near-blacks, never blue-grey or pure black.
2. **One brand accent.** Terracotta is the only action/brand accent. Green and gold are supporting accents with specific jobs. Purple, violet and indigo are retired.
3. **Light for work, dark for chrome and the kitchen.** Pages/cards are cream/white; the kitchen navbar, admin sidebar and Cocina screen are near-black. This mirrors the home page’s light sections plus its near-black app preview and footer.
4. **Quiet surfaces, precise states.** Most of the UI is neutral. Color is reserved for actions, selection, status and destructive intent.
5. **Accessible by construction.** Warmer mid-tones have lower contrast than the old purple/zinc palette. Use the contrast-safe tokens defined below for text.

---

## 2. Palette at a glance

| Role | Token | Hex | Use |
|---|---|---|---|
| Brand / decorative accent | `brand-500` | `#d97757` | Icons, dots, category chips, large display text, dark-surface accents |
| Brand action | `brand-600` | `#c2410c` | Primary buttons (white text), links, small accent text on light |
| Brand pressed | `brand-700` | `#9a3412` | Button hover/active, accent text on tinted surfaces |
| Brand tint | `brand-subtle` | `#fbeee9` | Selected rows, active chips, soft callouts |
| Brand border | `brand-line` | `#f0c9b9` | Borders on brand-tinted surfaces |
| Highlight | `gold` | `#f5b301` | Stars, checkmarks, small decorative dots, premium/owner marks |
| Highlight tint | `gold-subtle` | `#fef7e0` | Gold callouts |
| Success / secondary accent | `green-500` | `#22c55e` | Occupied/online/ready dots, admin logo mark, active admin icon |
| Success text | `green-700` | `#15803d` | Success text on light surfaces |
| Success tint | `green-subtle` | `#e9f9ef` | Paid/success badges |
| Warning | `amber-700` | `#b45309` | Warning text on light |
| Warning tint | `amber-subtle` | `#fffbeb` | Kitchen notes, warning banners |
| Danger | `red-600` | `#dc2626` | Destructive text/icons, errors |
| Danger strong | `red-700` | `#b91c1c` | Destructive text on tinted backgrounds |
| Danger tint | `red-subtle` | `#fef2f2` | Error banners, destructive hover surfaces |

**Three accent hues maximum per screen:** terracotta + green + gold. Red appears only for errors/destructive actions.

---

## 3. Light theme (pages, cards, auth, marketing)

### 3.1 Surfaces

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#faf7f5` | App page background, content area behind cards |
| `canvas-deep` | `#f5f0ea` | Inset regions, table headers, empty-state wells |
| `canvas-sand` | `#ece4da` | Deeper warm background for large light work areas (Mesas grid) |
| `surface` | `#ffffff` | Cards, modals, panels, inputs |
| `surface-warm` | `#fffdfb` | Soft page gradient stop, hovered white cards |
| `line` | `#e7dfd7` | Default border/divider |
| `line-soft` | `#efe8e1` | Subtle internal dividers |
| `line-strong` | `#d6c9bf` | Hover border, emphasized outline, neutral status dot |

Page gradient recipe (marketing/auth, optional for app pages):

```css
background: linear-gradient(to bottom, #ffffff 0%, #fffdfb 20%, #faf7f5 60%, #ffffff 100%);
```

### 3.2 Text

| Token | Hex | Contrast on white | Use |
|---|---|---|---|
| `ink` | `#1f1b16` | 17.2:1 | Titles, headings, selected labels |
| `body` | `#2d2a26` | 13.8:1 | Default body text |
| `muted` | `#6b635b` | 5.9:1 | Secondary copy, descriptions, table metadata |
| `subtle` | `#7a7168` | 4.8:1 | Minimum for small essential labels/placeholders |
| `faint` | `#9a9188` | 3.8:1 | Large/decorative text only — never essential small copy |
| `disabled` | `#9a9188` | — | Disabled text, paired with 45% opacity |
| `on-brand` | `#ffffff` | 5.2:1 on `brand-600` | Text on primary buttons |
| `on-brand-soft` | `#1f1b16` | 5.5:1 on `brand-500` | Text on decorative terracotta fills |

**Rule:** `brand-500` and `gold` are **not** safe small-text colors on white. Use `brand-600` / `brand-700` for accent text and `amber-700` for gold-family text.

---

## 4. Dark theme (app chrome, admin sidebar, Cocina)

### 4.1 Surfaces

| Token | Value | Use |
|---|---|---|
| `night` | `#0a0a0f` | Kitchen navbar, admin sidebar, Cocina page, dark sections |
| `night-raised` | `#101014` | Cards, modals, dropdowns on dark |
| `night-chrome` | `#121212` | Browser chrome, secondary dark bar |
| `night-warm` | `#1f1b16` | Warm dark feature/CTA panel (home final CTA) |
| `night-inset` | `rgba(0,0,0,0.20)` | Footers, table headers, recessed areas |
| `night-surface` | `rgba(255,255,255,0.02)` | Default dark card fill |
| `night-hover` | `rgba(255,255,255,0.04)` | Hover, input fill |
| `night-active` | `rgba(255,255,255,0.06)` | Selected nav item, active row |
| `night-line` | `rgba(255,255,255,0.10)` | Default border |
| `night-line-soft` | `rgba(255,255,255,0.06)` | Dividers |
| `night-line-strong` | `rgba(255,255,255,0.15)` | Hover border, emphasized outline |
| `night-overlay` | `rgba(0,0,0,0.60)` | Modal scrim |

Do not use `#000000`, `zinc`, `slate`, `neutral` or blue-grey tints. The dark family is deliberately slightly warm-violet-free neutral: `#0a0a0f`.

### 4.2 Text on dark

| Token | Value | Use |
|---|---|---|
| `night-title` | `#ffffff` | Titles, primary values |
| `night-body` | `rgba(255,255,255,0.80)` | Default body copy |
| `night-secondary` | `rgba(255,255,255,0.70)` | Nav labels, secondary actions |
| `night-muted` | `rgba(255,255,255,0.60)` | Minimum for small essential labels/copy |
| `night-faint` | `rgba(255,255,255,0.40)` | Large/decorative only |
| `night-ghost` | `rgba(255,255,255,0.30)` | Hints, disabled supporting labels |
| `night-disabled` | `rgba(255,255,255,0.20)` | Disabled text |

**Rule:** essential small text on dark must be **≥ white/50**; target `white/60` or higher. White/30–/40 is for large text or non-essential metadata only.

---

## 5. Semantic states

States must use the same shape in light and dark scopes.

| State | Light | Dark |
|---|---|---|
| Neutral | `bg #faf7f5`, `text #6b635b`, `border #e7dfd7` | `bg white/[0.04]`, `text white/60`, `border white/10` |
| Brand / selected | `bg #fbeee9`, `text #9a3412`, `border #f0c9b9` | `bg #d97757/10`, `text #d97757`, `border #d97757/30` |
| Success / paid / occupied | `bg #e9f9ef`, `text #15803d`, `border #22c55e/20`; dot `#22c55e` | `bg #22c55e/10`, `text #4ade80`, `border #22c55e/20`; dot `#22c55e` |
| Warning / kitchen note | `bg #fffbeb`, `text #b45309`, `border #fde68a` | `bg #f59e0b/10`, `text #fbbf24`, `border #f59e0b/30` |
| Danger / error | `bg #fef2f2`, `text #b91c1c`, `border #fecaca` | `bg #ef4444/10`, `text #f87171`, `border #ef4444/20` |
| Disabled | `bg #f5f0ea`, `text #9a9188`, 45% opacity | `bg white/[0.03]`, `text white/30`, 45% opacity |

Status dots are always 6px or 8px circles. Never use color alone for an essential state: pair with a label, icon, or text weight.

### Role badges

| Role | Light recipe |
|---|---|
| `admin` | brand tint + `#9a3412` text + brand border |
| `owner` | gold tint + `#b45309` text + gold border |
| `user` / staff | neutral recipe |

---

## 6. Component recipes

### 6.1 Buttons

| Variant | Background | Text | Border | Hover | Active |
|---|---|---|---|---|---|
| Primary | `#c2410c` | `#ffffff` | none | `#9a3412` | `#7c2d12` |
| Primary on dark | `#c2410c` | `#ffffff` | none | `#9a3412` | `#7c2d12` |
| Secondary (light) | `#ffffff` | `#2d2a26` | `#e7dfd7` | `#faf7f5`, border `#d6c9bf` | `#f5f0ea` |
| Secondary (dark) | transparent | `#ffffff` | `white/15` | `white/10` | `white/[0.06]` |
| Ghost (light) | transparent | `#6b635b` | none | `#f5f0ea`, text `#1f1b16` | `#efe8e1` |
| Ghost (dark) | transparent | `white/60` | none | `white/[0.06]`, text white | `white/10` |
| Destructive (light) | `#fef2f2` | `#b91c1c` | `#fecaca` | `#fee2e2` | `#fecaca` |
| Destructive (dark) | `#ef4444/10` | `#f87171` | `#ef4444/20` | `#ef4444/15` | `#ef4444/20` |
| Disabled | `#f5f0ea` | `#9a9188` | `#e7dfd7` | unchanged | unchanged |

- Primary button text is **white on `brand-600`**, not white on `brand-500`.
- Dark-text-on-terracotta is allowed only for decorative fills (`brand-500`), never for the primary action button.
- Buttons are 36–44px tall, radius 8–10px, font weight 600, `transition: 150ms–200ms`.
- Focus ring: 2px `#c2410c` on light, 2px `#d97757` on dark, 2px offset.

### 6.2 Inputs

Light:

- Background `#ffffff` or `#faf7f5` for marketing forms; border `#e7dfd7`; radius 10–12px; text `#1f1b16`; placeholder `#7a7168`.
- Focus: border `#c2410c`, ring `rgba(194,65,12,0.20)`.
- Error: border `#dc2626`, ring `rgba(220,38,38,0.15)`, helper text `#b91c1c`.

Dark:

- Background `white/[0.04]`; border `white/10`; text white; placeholder `white/40`.
- Focus: border `#d97757`, ring `rgba(217,119,87,0.20)`.

Never use green as a focus color. Green communicates success, not focus.

### 6.3 Cards and panels

Light:

- Background `#ffffff`, border `#e7dfd7`, radius 12–16px.
- Shadow: `0 1px 2px rgba(31,27,22,0.04)`, hover `0 20px 60px -30px rgba(194,65,12,0.25)`.
- Hover lift: `translateY(-2px)` maximum.

Dark:

- Background `#101014` or `white/[0.02]`, border `white/10`, radius 12–16px.
- Shadow: `0 20px 50px -25px rgba(0,0,0,0.65)`.
- Hover: border `white/15`, background `white/[0.04]`. No lift on dense operational cards.

### 6.4 Tables / table cards

| State | Surface | Border | Dot | Text |
|---|---|---|---|---|
| Free | `#ffffff` | `#e7dfd7` | `#d6c9bf` | `#2d2a26`; “Disponible” in `#7a7168` |
| Occupied | `#ffffff` | `#d6c9bf` | `#22c55e` | `#1f1b16`; guests/amount in `#6b635b` |
| Selected | `#fbeee9` | `#c2410c` 2px ring | same as state | `#1f1b16` |
| Paid / closed | `#e9f9ef` | `#22c55e/20` | `#22c55e` | `#15803d` for status text |

Numeric values (totals, prices) use `ink`/`night-title`, not green or terracotta.

### 6.5 Navigation chrome

**Kitchen navbar (dark, horizontal):**

- Background `#0a0a0f`, bottom border `white/10`, height 60px.
- Logo/wordmark white; default tabs `white/60`; hover white + `white/[0.06]`.
- Active tab: text white, background `white/[0.06]`, 2px terracotta indicator (`#d97757`) on the bottom or leading edge.
- Admin/logout actions `white/70`, hover white on `white/10`. Do not use `invert` filters on dark chrome; use white/appropriate icon assets or Lucide icons.

**Admin sidebar (dark, vertical):**

- Background `#0a0a0f`, right border `white/10`.
- Logo tile: `#22c55e` background with `#0a0a0f` icon (green is the secondary brand accent).
- Section label: `white/60`; active item background `white/[0.06]`, text white, icon `#22c55e`.
- Inactive item `white/60`, hover `white/[0.06]` + white.
- Footer account text `white/40` only if ≥12px and non-essential; otherwise `white/50`.

**Admin content / kitchen pages:** light scope. White cards on `#faf7f5`. Dark sidebar/navbar is the only dark chrome on these screens.

### 6.6 Modals and overlays

- Light pages: scrim `rgba(31,27,22,0.45)`, modal `#ffffff`, border `#e7dfd7`, title `#1f1b16`, body `#6b635b`.
- Dark surfaces: scrim `rgba(0,0,0,0.60)`, modal `#101014`, border `white/10`, title white, body `white/60`.
- Never mix a dark modal into a light page without the dark-scope tokens applied to the modal container.

---

## 7. Screen-by-screen application

| Screen | Page background | Chrome | Cards/panels | Primary action |
|---|---|---|---|---|
| Marketing `/home*` | warm gradient / `#faf7f5` | warm translucent navbar | white + `#e7dfd7` | `#c2410c` |
| Auth `/auth/*` | warm gradient | none | white card | `#c2410c` |
| Kitchen navbar | — | `#0a0a0f` | — | — |
| Mesas | `#faf7f5` grid | dark navbar | white table cards; white composition panel | `#c2410c` |
| Cocina | `#0a0a0f` | dark navbar | `#101014` cards, `white/10` borders | terracotta badges |
| Carta | `#faf7f5` | dark navbar | white product cards; cream toolbar | `#c2410c` |
| Órdenes | `#faf7f5` | dark navbar | white order table, cream header/footer | `#c2410c` |
| Admin | `#faf7f5` content | `#0a0a0f` sidebar | white cards/modals | `#c2410c` |

### 7.1 Mesas

- Table grid: `#faf7f5`; cards white; no dark composition panel. Dark is chrome only.
- Composition panel: white surface, `#e7dfd7` internal borders, cream toolbar/header.
- Category accordion header: `brand-subtle` + `brand-700` text when open; white/neutral when closed.
- Product rows: white with `#e7dfd7` border; hover `#faf7f5`.
- Quantity/add control: `#c2410c` fill, white icon.
- Tip input: white, focus `#c2410c`.
- Total bar: white or `#faf7f5`, top border `#e7dfd7`, total in `#1f1b16`.
- Commit button (“Crear orden” / “Actualizar orden”): primary terracotta `#c2410c`, white text.
- Comment textarea: white, border `#e7dfd7`, focus `#c2410c`; the note is a normal note, not a warning, until shown in Cocina (where it becomes amber).

### 7.2 Cocina

- Page `#0a0a0f`; order cards `#101014` with `white/10` borders.
- Table title white; timestamp `white/60` (not indigo).
- Quantity badge: `#c2410c` with white text, or `#d97757` with `#1f1b16` text. Pick one per screen.
- Kitchen comment: `rgba(245,158,11,0.10)` background, `rgba(245,158,11,0.30)` border, `#fbbf24` label, `#fef3c7` body.
- Ready/live indicator: `#4ade80` dot with text `#4ade80` or white/60.
- Empty state: icon `white/30`, title white/80, helper white/50.

### 7.3 Carta

- Page `#faf7f5`; toolbar/header white with bottom border `#e7dfd7`.
- Search input: `#faf7f5` or white, border `#e7dfd7`, focus `#c2410c`.
- Category pills: default white + `#e7dfd7` text `#6b635b`; active `brand-subtle` + `brand-700` + `brand-line`.
- Product cards: white, border `#e7dfd7`, title `#1f1b16`, price `#6b635b`, category chip `brand-subtle`/`brand-700`.
- Toggle on: `#c2410c`; off: `#d6c9bf`.

### 7.4 Órdenes

- Page `#faf7f5`; table container white with border `#e7dfd7`.
- Filter/header row: `#faf7f5` or `#f5f0ea`; labels `#6b635b`.
- Row borders `#efe8e1`; hover `#faf7f5`; text `#2d2a26`; order id `#6b635b` monospace.
- Kitchen note: amber-subtle background, `#b45309` text (light scope).
- Paid status: green-subtle badge, `#15803d`.
- Totals: `#1f1b16`, bold; footer separator `#e7dfd7`.

### 7.5 Admin

- Content `#faf7f5`; cards white; modals white; page titles `#1f1b16`; descriptions `#6b635b`.
- Primary buttons (`Nuevo empleado`, `Nuevo producto`, save): `#c2410c` white text. **Not green.**
- Active sidebar icon/logo: green `#22c55e`; green is a supporting accent here.
- Destructive icons: `#dc2626` on light, `#f87171` on dark; destructive hover `red-subtle` / `red/10`.
- Inputs focus `#c2410c`; no green focus borders.
- Role badges follow the role table above.
- Empty states: `#6b635b`, with an optional icon at `#9a9188`.

### 7.6 Auth

- Warm gradient page, no app navbar.
- Logo tile `#1f1b16` with white icon on light pages (same as marketing navbar).
- White card, `#e7dfd7` border, `#1f1b16` title, `#6b635b` subtitle.
- Primary submit button `#c2410c`, white text, hover `#9a3412`. **No purple.**
- Links/underlines `#c2410c`; hover `#9a3412`.
- Error banner: red-subtle / red-700 / red-line.

---

## 8. Data visualization palette

For future charts in Reportes/Métricas:

| Order | Light | Dark |
|---|---|---|
| 1 | `#c2410c` | `#d97757` |
| 2 | `#16a34a` | `#4ade80` |
| 3 | `#f5b301` | `#fbbf24` |
| 4 | `#1f1b16` | `#ffffff` |
| 5 | `#8b8178` | `rgba(255,255,255,0.50)` |
| 6 | `#d6c9bf` | `rgba(255,255,255,0.25)` |

- Grid lines: `#efe8e1` light / `white/[0.06]` dark.
- Axis labels: `#6b635b` light / `white/60` dark.
- No blue/purple series.

---

## 9. Typography, radius, spacing, motion

**Type:** DM Sans everywhere. Remove Bebas Neue and the `fancy-text`/`text-gradient` utilities; they are legacy. Weights: 400 body, 500 emphasis, 600 buttons/labels, 700 headings.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Display / hero | `clamp(2.8rem, 6vw, 5.6rem)` | 600 | `-0.02em` |
| Page title | 28–36px | 700 | `-0.01em` |
| Section title | 24–32px | 600 | `-0.01em` |
| Card title | 18–20px | 600 | normal |
| Body | 14–16px | 400 | normal |
| Metadata | 12–13px | 400/500 | normal |
| Eyebrow / label | 10–11px | 600 | `0.18em–0.22em`, uppercase |

**Radius:** 8px controls, 10–12px inputs, 12–16px cards, 16–24px feature panels, 999px pills.

**Spacing:** 4px base; use 8/12/16/24/32/48/64/96. Page padding 16–24px mobile, 24–32px desktop; card padding 16–24px; admin/table rows 12–16px vertical.

**Motion:** 150–200ms for hover/press, 300ms for toggles, 500–600ms for page reveals. Respect `prefers-reduced-motion`; no motion is required to understand a state.

**Shadows:** warm-tinted on light (`rgba(31,27,22,…)` / `rgba(45,42,38,…)`), neutral black on dark. Never use purple/colored glow orbs.

---

## 10. Implementation tokens

The palette should be defined once as CSS variables and mirrored in `frontend/src/colorPallete.tsx`. Components must consume semantic tokens, not raw hex values.

Recommended semantic layer:

```css
@theme {
  /* Brand */
  --color-brand-500: #d97757;
  --color-brand-600: #c2410c;
  --color-brand-700: #9a3412;
  --color-brand-subtle: #fbeee9;
  --color-brand-line: #f0c9b9;

  /* Support accents */
  --color-gold: #f5b301;
  --color-gold-subtle: #fef7e0;
  --color-green: #22c55e;
  --color-green-strong: #16a34a;
  --color-green-text: #15803d;
  --color-green-subtle: #e9f9ef;
  --color-amber: #f59e0b;
  --color-amber-text: #b45309;
  --color-amber-subtle: #fffbeb;
  --color-red: #dc2626;
  --color-red-strong: #b91c1c;
  --color-red-subtle: #fef2f2;
  --color-red-line: #fecaca;

  /* Light surfaces */
  --color-canvas: #faf7f5;
  --color-canvas-deep: #f5f0ea;
  --color-canvas-sand: #ece4da;
  --color-surface: #ffffff;
  --color-surface-warm: #fffdfb;
  --color-line: #e7dfd7;
  --color-line-soft: #efe8e1;
  --color-line-strong: #d6c9bf;
  --color-ink: #1f1b16;
  --color-body: #2d2a26;
  --color-muted: #6b635b;
  --color-subtle: #7a7168;
  --color-faint: #9a9188;

  /* Dark surfaces */
  --color-night: #0a0a0f;
  --color-night-raised: #101014;
  --color-night-chrome: #121212;
  --color-night-warm: #1f1b16;

  /* Semantic aliases */
  --color-app-bg: var(--color-canvas);
  --color-app-surface: var(--color-surface);
  --color-app-text: var(--color-ink);
  --color-app-muted: var(--color-muted);
  --color-app-border: var(--color-line);
  --color-action: var(--color-brand-600);
  --color-action-hover: var(--color-brand-700);
  --color-focus: var(--color-brand-600);
}

.theme-dark {
  --color-app-bg: #0a0a0f;
  --color-app-surface: #101014;
  --color-app-text: #ffffff;
  --color-app-muted: rgba(255, 255, 255, 0.60);
  --color-app-border: rgba(255, 255, 255, 0.10);
  --color-action: #c2410c;
  --color-action-hover: #9a3412;
  --color-focus: #d97757;
}
```

Apply `.theme-dark` to the kitchen navbar, admin sidebar/topbar, Cocina screen, and dark feature panels. Everything else uses the default light scope. This makes “light pages, dark chrome” a structural rule rather than a per-component decision.

**File ownership after implementation:**
- `frontend/src/colorPallete.tsx` — named export of the raw + semantic tokens (single TS source).
- `frontend/src/index.css` — `@theme` definitions, `.theme-dark` overrides, body defaults, remove legacy Bebas/`fancy-text`/`text-gradient`.
- Components — semantic classes (`bg-canvas`, `text-ink`, `border-line`, `bg-brand-subtle`, etc.) or token imports. No new inline hex values.

---

## 11. Migration map (current → target)

| Current | Where | Replace with |
|---|---|---|
| `#22007c` Navy | kitchen navbar, category headers, login button | `brand-600` for actions; `brand-500` for decorative fills; `night` for chrome |
| `#140152` Deep Twilight | panels, cards, table headers | `#101014` on dark; `#ffffff` / `#faf7f5` on light |
| `#04052e` Prussian Blue | page backgrounds | `#0a0a0f` (dark) or `#faf7f5` (light) |
| `#030014` primary bg | body/main | `#faf7f5` light / `#0a0a0f` dark |
| `#121212` Charcoal | Mesas/Cocina background | `#0a0a0f` (Cocina) or `#faf7f5` (Mesas) |
| `#f4f4f8` White | text | `#1f1b16` on light / `#ffffff` on dark |
| `#22c55e` | admin buttons/active states | secondary accent + success only; primary buttons become `#c2410c` |
| `#16a34a` | green hover | `green-strong`; never a primary action |
| `#fbbf24` / amber-* | kitchen notes | keep amber warning recipe; align to `#fbbf24` on dark / `#b45309` on light |
| `indigo-600` | Cocina quantity badge, selected table outline | `brand-600` badge / `brand-600` selection ring |
| `indigo-400` | Cocina timestamp | `white/60` |
| `purple-500` | focus rings | `brand-600` light / `brand-500` dark |
| `#1b1b1c` | ProductCards | `#ffffff` (light Carta) or `#101014` (dark context) |
| `#e5e7eb` | pricing toggle off | `#d6c9bf` |
| `#2a0096` | login hover | `#9a3412` |
| `gray-900/700/600/500/400` | auth/marketing text | `ink` / `body` / `muted` / `subtle` / `faint` |
| `gray-50/100/200/300` | auth/marketing surfaces/borders | `canvas` / `canvas-deep` / `line` / `line-strong` |
| `red-400/500/600`, `red-50/200` | admin/home errors | `red-600` / `red-700` / `red-subtle` / `red-line` |
| `white/8`, `white/15` | dark borders | standardize to `white/10`, `white/15` |
| `invert` icon filters | kitchen navbar | white icon assets or Lucide icons; no filter tricks |

---

## 12. Known inconsistencies to fix in `/home`

The home page is the reference, but these should be corrected during the migration so the rest of the app can copy a clean system:

1. **Login button is still purple** (`#22007c`, hover `#2a0096`). Change to `brand-600` / `brand-700`.
2. **Pricing toggle uses `Navy`** for its “on” state. Change to `brand-600`.
3. **`FieldInput` focus ring is green** (`rgba(34,197,94,0.6)`). Focus is terracotta; green is not a focus color.
4. **Primary buttons are white on `#d97757`** (3.1:1). Change the button fill to `brand-600` or the label to `ink`. The design system uses `brand-600` + white.
5. **Gold is used for small text** (step numbers, pricing checks). Gold is decorative; use `brand-600` or `amber-700` for text, keep gold for icons/dots.
6. **Tailwind `gray-*` and warm hex values are mixed.** Normalize auth/marketing to the warm token set.
7. **`#8b8178` is used for essential small labels** (3.8:1). Use `#7a7168` (`subtle`) for essential labels; keep `#9a9188` for decorative/large text.
8. **`#e5e7eb` toggle track** is a cold grey. Use `#d6c9bf`.
9. **Pricing view still uses `bg-gray-*`, `border-gray-*`, `text-gray-*` extensively.** Convert to warm tokens.
10. **`FigmaDesigns/` and the old purple palette are retired.** Do not copy them into new work.

---

## 13. Anti-patterns

- No purple, violet, indigo or magenta anywhere in product UI.
- No pure black (`#000000`) page backgrounds; use `#0a0a0f`.
- No white text on `brand-500` at normal sizes.
- No gold text on white.
- No green primary buttons.
- No green focus rings.
- No cold grey (`gray-*`, `zinc-*`, `slate-*`) in new work.
- No gradients other than the subtle warm page wash and a light warm radial accent; no glow orbs, no gradient text.
- No color-only status. Always pair a dot with a label/icon.
- No dark cards inside light pages unless the card is intentionally a dark feature panel and uses the dark token scope.
- No raw hex values in components after the migration; add a token instead.

---

## 14. Accessibility checklist

- Body/primary text meets 4.5:1 against its actual surface.
- Large text (≥24px regular or ≥18.66px bold) may use 3:1 (`brand-500`, `faint`).
- Focus is always visible and uses the terracotta focus token.
- Disabled controls use opacity + a disabled token, not low-contrast brand color.
- Error text is paired with an icon or prefix, not color alone.
- Status pills include text; dots are redundant reinforcement.
- Placeholders use `#7a7168` (light) / `white/40` (dark) and are never the only label.
- Test the palette in both light and dark scopes, at 100% zoom, on a low-quality kitchen display.

---

## 15. Acceptance criteria for the migration

1. No legacy purple/indigo/blue-grey values remain in `frontend/src/app` or `frontend/src/components`.
2. Kitchen navbar and admin sidebar are `#0a0a0f`; their content pages are `#faf7f5`.
3. Mesas, Carta, Órdenes and all admin pages use white cards on the warm canvas.
4. Cocina remains dark (`#0a0a0f` / `#101014`) with amber notes and terracotta quantity badges.
5. Primary buttons are `#c2410c` with white text everywhere; green is never a primary action.
6. Focus rings are terracotta in both scopes; green is not used for focus.
7. Every essential text pair passes 4.5:1; `brand-500`, gold and `faint` are not used for essential small text.
8. `npx tsc --noEmit` and `npm run build` pass after the migration.
9. The home page itself follows the same tokens (see §12 corrections).
10. This document is updated if any token or surface rule changes.
