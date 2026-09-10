# AGENTS.md

Restaurant CRM: `backend/` (.NET API) + `frontend/` (Next.js). Local-only app, no CI.

## Run the app
- Backend: `cd backend && dotnet ef database update && dotnet run` (PostgreSQL, listens on `http://localhost:3000`). Run from `backend/` (appsettings.json is resolved there).
- Frontend: `cd frontend && npm install && npm run dev` → `http://localhost:5173` (port is hardcoded via `next dev -p 5173 --webpack`).

## Gotchas
- The READMEs (`README.md`, `frontend/README.md`) are **stale**: they describe Vite + React. The real frontend is **Next.js 16 App Router** (`src/app/`), React 19, Tailwind v4 (`@tailwindcss/postcss` via `postcss.config.mjs`). Trust the code, not the docs.
- Frontend API base is `NEXT_PUBLIC_API_ROUTE`; services call `${apiRoute}/api/v1/<Resource>`. **`src/config.tsx` now derives `apiRoute` at runtime from `window.location.hostname:3000`** (override via `NEXT_PUBLIC_API_ROUTE`). This keeps the backend same-site with whatever host the browser uses (localhost or LAN IP) so auth cookies flow — never hardcode a specific IP in `.env.local`.
- Backend CORS allows the origins in `appsettings.json` -> `Cors:AllowedOrigins` (local + LAN frontends) with `AllowCredentials`. Auth is cookie-based (`AuthorizationCookies`); frontend fetches must pass `credentials: "include"` (see `src/services/UserServices.tsx`).**Cookies are `SameSite=Lax`, so the page and API must be same-site (same hostname; any port) or the cookie is never sent** — the runtime `apiRoute` derivation above is what keeps them aligned.
- No `[Authorize]` attributes on controllers despite the cookie auth being wired; login just creates a session cookie.
- Entities are PascalCase on the wire (e.g. `PaymentMethod`, `tableId`); `ProductController`/`OrderController` etc. focus backend logic. DB connection string is committed in `backend/appsettings.json`.
- Real-time sync is wired end-to-end: backend `RestaurantHub` (`Hubs/Hub.cs`, `MapHub<RestaurantHub>("/hub")`, `[Authorize]`) broadcasts `OrderUpdated`/`OrderClosed`; event names are centralized in `HubEvents` (backend) and mirrored in `frontend/src/services/SignalRService.ts` — keep them in sync. The **global order state lives in `frontend/src/app/OrdersContext.tsx`** (provider wraps the app inside `GlobalProvider`); Mesas + Cocina consume it, so never reintroduce per-page order state.
- Orders now have a `Status` (`OPEN` = in-progress, drives Mesas + Cocina; `PAID` = history, drives Ordenes). `GET /api/v1/Order` returns only `PAID`; `GET /api/v1/Order/active` returns all `OPEN`; `PUT /api/v1/Order/table/{tableId}` upserts a table's open order (empty cart clears it) and broadcasts via the hub; `POST /api/v1/Order` is the payment flow (marks `PAID`, clears the table's open order, broadcasts `OrderClosed`). `TableController.GetTables` attaches each table's open order.
- SignalR's JSON protocol is configured separately from MVC (`AddSignalR().AddJsonProtocol(...)` includes `JsonStringEnumConverter`) so hub payloads serialize enums as strings like the REST API.
- Backend is `.NET 10` (`net10.0`), EF Core 10. Schema changes require EF migrations (`dotnet ef migrations add ...` + `dotnet ef database update`).

## Project direction
- This is becoming a **professional SaaS** for restaurant management, not a local toy. Treat it as a product: correctness, efficiency, and future-proofing matter.
- Goal is high-quality work throughout — refactor inefficient/short-sighted code and keep adding features. Raise issues proactively; don't just patch symptoms.

## Workflow (one task per agent session)
- One focused task per session. The user runs a new agent for each feature/task.
- **Before changing code**, explain the plan clearly and concisely; no filler words.
- Keep a running list of **things to fix**, **missing features**, and **things to finish**. Track and update it as work progresses.
- Document every change well, and **update AGENTS.md after every feature**.
- When a feature is finished: push to GitHub on a **new branch** (create one per feature/task).
- **Update the README** with each feature.

## TODO / tracking list
- (Maintained here — update after each task.)

**Things to fix:**
- Endpoints accept raw entities with no DTOs/validation; request/response models exist only for the open-order flow (`Models/OrderDtos.cs`, `Models/TableDtos.cs`). Most other endpoints still bind raw models (`ProductController`, `ExpensesController`, `MaintenanceController`).
- Auth: seeded default admin credentials (`admin`/`admin123`) are hardcoded in `Program.cs` seeding — must be changed/rotated for production, and there's no role-management UI yet (admin role only assignable via API/DB).
- Backend ships `Microsoft.OpenApi` 2.4.1 (transitive via Swashbuckle) with a known high-severity vulnerability (`NU1903`) — bump Swashbuckle or suppress/patch.
- XUnit analyzer warnings in `backend.Tests` (blocking `.Result` in `UserControllerTests` ctor → await).

**Done (this session):**
- **Real-time order sync (SignalR) across all clients.** Backend: Orders have `Status` (`OPEN`/`PAID`); `GET /Order/active`, `PUT /Order/table/{tableId}` upsert/clear a table's open order (server-authoritative totals; empty cart clears; broadcasts `OrderUpdated`), `GET /Order` history is now `PAID`-only, `POST /Order` = payment flow (marks `PAID`, clears the open order, broadcasts `OrderClosed`); `RestaurantHub` is `[Authorize]` with `HubEvents` names and `AddJsonProtocol` string enums; `TableController.GetTables` returns each table's open order and `DeleteTable` also removes its open order. Frontend: global order state in `OrdersContext.tsx` (snapshot from `/active` + live hub events with auto-reconnect), `SignalRService.ts`, `OrderServices.getActive/saveOpenOrder`, Mesas table cards + Cocina all read the shared state; `tableInformation` persists edits via `syncOpenOrder` (optimistic + debounced) and payment no longer re-pushes the paid order. Migration `AddOrderStatus` backfills existing rows to `PAID`. Verified live end-to-end against Postgres + hub (connect → PUT → OrderUpdated <-> OrderClosed). Tests extended 32 → 40.
- `TableController.DeleteTable` now routes by explicit id (`/api/v1/Table/{id}`), returns `NotFound` if missing — no longer deletes the "last" table.
- `TableController.CreateTable` validates `tableNumber` is present → `BadRequest` when missing.
- `TableServices` frontend: `getAll` keeps real db ids (removed `index + 1` remap); `createTable`/`deleteTable` take params; `deleteTable` hits `DELETE /{id}`; all calls pass `credentials: "include"`.
- **Full auth enforced.** Backend cookie auth is now matched by `[Authorize]` on every controller; `[Authorize(Policy = "AdminOnly")]` gates user management (`UserController` create/edit/delete) and `MaintenanceController.ClearDatabase`. Login is `[AllowAnonymous]`. Added `GET /api/v1/User/me` (session restore) and `POST /api/v1/User/logout` (clears the auth cookie). `Roles` constants (`admin`/`user`) in `Models/User.cs`; `EditUser`/`CreateUser` normalize roles to prevent privilege escalation.
- Seeded admin on startup (`Program.cs`): creates an `admin`/`admin123` account (BCrypt) if no admin exists.
- Fixed cookie `SecurePolicy` bug: was `Always` (HTTP-only). Now `SameAsRequest` in dev (allows local `http://localhost:3000` + HTTP test host), `Always` in production. Without this, login cookies were never sent back over plain HTTP.
- Cleaned duplicated `UseHttpsRedirection()` calls in `Program.cs`.
- Frontend: `GlobalContext` now restores the session on load via `/me` (no more logout-on-refresh); `logout()` calls the backend logout. `Navbar` logout uses the context `logout`. Login shows validation/credential errors (was a silent catch). `UserServices`: added `getMe`/`logOut`, fixed `deleteUser` → `DELETE /{id}` and `editUser` → `PUT /{id}`.
- Frontend: **all** API services now pass `credentials: "include"` — `UserServices`, `TableServices`, plus `ProductServices` and `OrderServices` which were missing it and 401'd against the now `[Authorize]`-protected controllers (caught in the browser: "Error fetching products").
- Tests extended to 32: UserControllerTests cover auth (401 when anonymous for get/create/delete/me/logout, `/me` returns current user, post-logout session cleared). Table/Order tests authenticate as the seeded admin.
- **Fixed cross-site auth-cookie rejection.** `.env.local` hardcoded `NEXT_PUBLIC_API_ROUTE="http://192.168.1.67:3000"`, so any page loaded from a different host (`localhost:5173` etc.) called that IP — a cross-SITE request on which the `SameSite=Lax` `AuthorizationCookies` cookie is never sent, 401'ing every API call ("Cookie AuthorizationCookies rejected", "Error fetching products/tables/orders"). Fix: removed the hardcoded override so `config.tsx` derives `http://<window.location.hostname>:3000` at runtime (page + API always same host → same-site, ports don't matter for SameSite). Also guarded `config.tsx`'s `NEXT_PUBLIC_API_ROUTE` read (`string | undefined`). Works for `localhost:5173` → `localhost:3000` and any machine loading `<server-ip>:5173` → `<server-ip>:3000` (backend CORS already allows the frontend origins). Restart the Next dev server after pulling this since `.env.local` is read at startup.

**Missing features:**
- Cross-client editing of the *same table simultaneously*: `tableInformation`'s local draft only re-seeds on `table.id` change, so a selected table ignores remote updates to the same table until reselected. Consider a dirty/conflict strategy in Part 2/3.

**Things to finish:**
- Refresh stale `README.md` + `frontend/README.md` (describe Vite; real app is Next.js App Router).
- Backend test coverage: only `UserController`, `TableController`, `OrderController` are tested. Add tests for `ProductController`, `ExpensesController`, `MaintenanceController`.
- Fix frontend warning-level xUnit issues in tests (blocking `.Result` calls → await).
- Build out the admin tab (role/user management UI) now that `UserController` create/edit/delete are admin-only; current UI has no screens wired to `UserServices.editUser`/`deleteUser`.
- Replace hardcoded seeded admin password with an env/secret for production.

## Style / conventions
- Frontend UI depends on `src/colorPalette.tsx` and `src/config.tsx`; models live in `src/models/*`, API calls in `src/services/*`.
- Backend follows `api/v1/[controller]` routing with `EntityController.cs` per model.
- Mockups in `mockups/` are the UI reference.

## Checks
- Frontend typecheck: `npx tsc --noEmit` (strict). `npm run lint` runs `next lint` (deprecated in Next 16); no `eslint.config.*` exists in frontend, so treat it as unconfigured.
- Backend tests: `cd backend.Tests && dotnet test` (xUnit integration tests via `TestingWebAppFactory`/in-memory EF; covers `User`, `Table`, `Order` controllers). Add a test per controller as new ones are created.
- Frontend has no test suite; verification is build/typecheck + manual API calls via Swagger (backend dev: `/swagger`).
