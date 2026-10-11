# SPEC-005 · Registro y perfil de restaurante

- **ID:** SPEC-005
- **Área:** Cuenta
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

Un restaurante nuevo debe poder darse de alta sin intervención manual y quedar
operativo de inmediato. El restaurante no guarda credenciales propias: quien
opera es un usuario **owner** que se crea junto con el local.

## 2. Objetivo

Permitir el alta self-service de un restaurante (perfil + owner + sesión) y la
edición posterior de su perfil, manteniendo el login del owner consistente con
el email del restaurante.

## 3. Alcance

**Incluye**
- Registro público (`POST /Restaurant/register`): crea `Restaurants` + `User`
  owner (username = email) en una transacción, y auto-loguea.
- Alta por admin (`POST /Restaurant`, `AdminOnly`).
- Consulta del propio restaurante (`GET /Restaurant`).
- Edición (`PUT /Restaurant/{id}`) y borrado en cascada (`DELETE /Restaurant/{id}`).
- Sincronización del username del owner al cambiar el email.

**No incluye (fuera de alcance)**
- Cambio de contraseña del owner desde el perfil (se hace vía `PUT /User/{id}`).
- Verificación de email / onboarding wizard.
- Logo, dirección, horarios, moneda (el perfil solo tiene nombre, encargado,
  email, teléfono).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Alta self-service
- **Dado** un visitante con nombre, encargado, email, teléfono y contraseña
  válidos (≥ 8)
- **Cuando** envía el formulario de `/home/registro`
- **Entonces** se crea el restaurante + owner, se inicia sesión y se redirige a
  `/kitchen/{restaurantId}/mesas`.

### HU-2 — Nombre/email únicos
- **Dado** un restaurante o email ya registrado
- **Cuando** se intenta registrar de nuevo
- **Entonces** `409 Conflict`.

### HU-3 — Validaciones de perfil
- **Dado** un registro sin nombre, sin encargado, con email inválido o
  contraseña corta
- **Cuando** se envía
- **Entonces** `400` con el primer error.

### HU-4 — Editar mi restaurante
- **Dado** un owner de su restaurante
- **Cuando** hace `PUT /Restaurant/{id}` con su propio id
- **Entonces** el perfil se actualiza; con id ajeno → `403`.

### HU-5 — El email nuevo sigue el login
- **Dado** un owner cuyo login es el email actual
- **Cuando** el email cambia
- **Entonces** su `UserName` se actualiza y puede loguearse con el nuevo email;
  `409` si ese email ya lo usa otro usuario.

### HU-6 — Borrado en cascada
- **Dado** un restaurante con datos
- **Cuando** un manager hace `DELETE /Restaurant/{id}`
- **Entonces** se borran usuarios, mesas, productos, órdenes (+ detalles) y
  gastos en una transacción.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| POST | `/api/v1/Restaurant/register` | Anónimo | `RegisterRestaurantRequest` | `{ userId, userName, role, restaurantId, restaurant }` | 400, 409 |
| POST | `/api/v1/Restaurant` | `AdminOnly` | `RegisterRestaurantRequest` | `RestaurantResponseDto` | 400, 409 |
| GET | `/api/v1/Restaurant` | `[Authorize]` | — | `RestaurantResponseDto` | 404 |
| PUT | `/api/v1/Restaurant/{id}` | `ManagerOnly` | `RegisterRestaurantRequest` | `RestaurantResponseDto` | 400, 403, 404, 409 |
| DELETE | `/api/v1/Restaurant/{id}` | `ManagerOnly` | — | `{ message, deletedId }` | 403, 404 |

Payload de registro (`frontend/src/services/RestaurantServices.tsx`):
`{ name, password, nombreDelEncargado, email, phoneNumber }`. `password` es la
contraseña del owner (se hashea, no se guarda en `Restaurants`).

## 6. Modelo de datos

`Restaurants` (`[Table("restaurants")]`):

| Campo | Tipo |
|---|---|
| `Id` | int PK |
| `Name` | string (único) |
| `NombreDelEncargado` | string |
| `Email` | string (único vía `Users.UserName`) |
| `PhoneNumber` | string |
| `CreationDate` | DateTime UTC |

No guarda credenciales. El owner es un `User` con `Role = owner`,
`UserName = email`.

## 7. Eventos en tiempo real

N/A.

## 8. Reglas de negocio y casos borde

- Validación compartida (`ValidateProfile`): nombre obligatorio (≤ 100),
  contraseña ≥ 8, encargado obligatorio, email válido.
- Transacción solo si `Database.IsRelational()` (el proveedor in-memory de tests
  no soporta transacciones; ahí se guarda en dos pasos).
- Cambio de email: se busca al owner "primario" (`Role=owner` y
  `UserName == restaurant.Email`); si no existe (p. ej. borrado por un admin) se
  actualiza el email sin tocar usuarios.
- `UserName` es clave de login **global**: el email nuevo no puede pertenecer a
  ningún otro usuario.

## 9. UI / Flujo

- `frontend/src/app/home/components/RegistroView.tsx` → `handleSubmit` valida en
  cliente y llama `RestaurantServices.register`; setea el contexto, muestra
  "Restaurante creado correctamente" y redirige en 1.5 s.
- `frontend/src/services/RestaurantServices.tsx`: `register`, `getMy`, `update`,
  `remove`. `readError` extrae `{ message }`.
- **Sin UI de edición de perfil** (existe `update` pero ninguna pantalla lo usa).

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `Register_ValidInput_ReturnsOkWithRestaurantAndSetsCookie` | `backend.Tests/RestaurantControllerTests.cs` | HU-1 |
| `Register_AutoLogsIn_MeReturnsRestaurantId` | idem | HU-1 |
| `Register_DuplicateName_ReturnsConflict` / `..._DuplicateEmail_...` | idem | HU-2 |
| `Register_MissingName` / `InvalidEmail` / `ShortPassword` | idem | HU-3 |
| `GetRestaurant_Authenticated_ReturnsOwnRestaurant` / `Anonymous_401` | idem | HU-4 |
| `UpdateRestaurant_Own_ReturnsUpdated` | idem | HU-4 |
| `UpdateRestaurant_ChangingEmail_AlsoUpdatesOwnerLogin` | idem | HU-5 |
| `UpdateRestaurant_NewEmailConflictingWithAnotherUser_ReturnsConflict` | idem | HU-5 |
| `UpdateRestaurant_OtherRestaurant_ReturnsForbidden` | idem | HU-4 |
| `DeleteRestaurant_Own_CascadesData` / `Anonymous_401` | idem | HU-6 |

## 11. Preguntas abiertas / Backlog

- [ ] Pantalla de perfil de restaurante (editar nombre/encargado/teléfono/email)
      usando `RestaurantServices.update`.
- [ ] Campos de perfil ampliados (dirección, logo, moneda, horarios).
- [ ] Onboarding post-registro (crear primeras mesas/carta).
