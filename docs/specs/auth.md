# SPEC-001 · Autenticación y sesión

- **ID:** SPEC-001
- **Área:** Plataforma
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

MyKitchen es multi-restaurante: cada cuenta opera sobre su propio local. Se
necesita una forma de identificar al usuario, saber a qué restaurante pertenece y
mantener la sesión entre recargas, sin exponer credenciales en el cliente.

## 2. Objetivo

Autenticar usuarios con usuario/contraseña y mantener una sesión server-side
basada en cookie que transporte el restaurante y el rol del usuario, para que
todo el backend pueda autorizar y scopear sin confiar en ids del cliente.

## 3. Alcance

**Incluye**
- Login con usuario (email) y contraseña, case-insensitive en el usuario.
- Cookie de sesión `AuthorizationCookies` (HttpOnly, 30 min, SameSite=Lax).
- Claims: `Name`, `Role`, `restaurantId`, `userId`.
- Restauración de sesión (`/me`) y cierre (`/logout`).
- Redirect de rutas privadas a `/auth/login` y gating por rol en el layout.

**No incluye (fuera de alcance)**
- Recuperación de contraseña (el botón "¿Olvidaste tu contraseña?" es decorativo).
- Refresh tokens / expiración deslizante configurable.
- MFA, OAuth, SSO.
- Cambio de contraseña self-service (solo vía `PUT /User/{id}` de un manager).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Iniciar sesión
- **Dado** un usuario registrado con `UserName` = email y una contraseña válida
- **Cuando** envía `POST /api/v1/User/login`
- **Entonces** el backend verifica con BCrypt, firma la cookie y responde
  `{ userName, role, restaurantId }`.

### HU-2 — Login case-insensitive
- **Dado** un usuario `owner@x.com`
- **Cuando** alguien envía `OWNER@X.com` con la contraseña correcta
- **Entonces** el login es exitoso.

### HU-3 — Sesión persiste tras recargar
- **Dado** una sesión activa (cookie válida)
- **Cuando** el frontend arranca y llama `GET /api/v1/User/me`
- **Entonces** recibe `{ userId, userName, role, restaurantId }` y restaura el
  estado sin pedir login.

### HU-4 — Cambio de email del restaurante sigue el login del owner
- **Dado** un owner cuyo `UserName` es el email del restaurante
- **Cuando** un manager cambia `Restaurant.Email`
- **Entonces** el `UserName` del owner se actualiza (o `409` si ese email ya es
  de otro usuario) — ver [restaurant-onboarding.md](./restaurant-onboarding.md).

### HU-5 — Cerrar sesión
- **Dado** una sesión activa
- **Cuando** se llama `POST /api/v1/User/logout`
- **Entonces** el backend limpia la cookie y `GET /User/me` vuelve a fallar.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| POST | `/api/v1/User/login` | Anónimo | `{ userName, passwordHash }`¹ | `{ userName, role, restaurantId }` | 401 |
| GET | `/api/v1/User/me` | `[Authorize]` | — | `{ userId, userName, role, restaurantId }` | 401 |
| POST | `/api/v1/User/logout` | `[Authorize]` | — | `{ message }` | 401 |

¹ El campo se llama `passwordHash` en el wire (reutiliza el modelo `User`), pero
el valor es la contraseña en texto plano que se verifica con BCrypt.

Los claims se agregan al firmar la cookie:
`ClaimTypes.Name = UserName`, `ClaimTypes.Role = Role`,
`RestaurantClaims.Id = restaurantId`, `RestaurantClaims.UserId = User.Id`.

## 6. Modelo de datos

`Users` (`backend/Models/User.cs`):

| Campo | Tipo | Notas |
|---|---|---|
| `Id` | int | PK |
| `UserName` | string | único global (es el email); login case-insensitive |
| `PasswordHash` | string | BCrypt, workFactor 12 |
| `Role` | string | `admin` \| `owner` \| `user` |
| `Salary` | float | nómina (sin UI) |
| `PaymentDate` | DateOnly | nómina (sin UI) |
| `RestaurantId` | int | scope |

Sin migración pendiente.

## 7. Eventos en tiempo real

N/A.

## 8. Reglas de negocio y casos borde

- La cookie se llama `AuthorizationCookies`; `SecurePolicy = SameAsRequest` en
  Development (permite HTTP local/test) y `Always` en producción.
- SameSite por defecto = **Lax**: la página y la API deben ser del mismo host
  (cualquier puerto). De ahí que el frontend derive `apiRoute` de
  `window.location.hostname` (`frontend/src/config.tsx`).
- Un `userName` nulo/vacío en login → `401` (no explota con `ToLower()`).
- `[Authorize]` responde `401`/`403` (sin redirect HTML) vía
  `OnRedirectToLogin`/`OnRedirectToAccessDenied`.

## 9. UI / Flujo

- `frontend/src/app/auth/login/Login.tsx` → `handleLoginButton` llama
  `UserServices.logIn`, setea el `GlobalContext` y el layout redirige.
- `frontend/src/app/GlobalContext.tsx` → restaura con `getMe()` al montar
  (`isAuthChecking` evita el flash de redirect a login).
- `frontend/src/app/RootClientLayout.tsx` → redirige a `/auth/login` si no hay
  sesión y la ruta no es pública (`/home*`, `/auth*`).

**Gap conocido:** la respuesta de `login` no incluye `userId` (solo `/me` lo
devuelve) y `AuthSession` del frontend no tipa `userId`. No afecta hoy porque no
se consume en el cliente.

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `Login_IsCaseInsensitive_OnUsername` | `backend.Tests/RestaurantControllerTests.cs` | HU-2 |
| `Register_ThenLogin_MeReturnsRestaurantId` | `backend.Tests/RestaurantControllerTests.cs` | HU-3 / scope |
| Tests de auth (401 anónimo, `/me`, logout) | `backend.Tests/UserControllerTests.cs` | HU-1, HU-3, HU-5 |

## 11. Preguntas abiertas / Backlog

- [ ] Recuperación de contraseña real (hoy es un botón sin acción).
- [ ] Incluir `userId` en la respuesta de login (paridad con `/me`) y tiparlo en
      `AuthSession`.
- [ ] Política de expiración/sliding configurable.
