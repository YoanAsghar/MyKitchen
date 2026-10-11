# SPEC-002 · Multi-tenancy y roles

- **ID:** SPEC-002
- **Área:** Plataforma
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

El sistema aloja varios restaurantes sobre la misma base. Cada usuario debe ver y
tocar **solo** los datos de su restaurante, y no todos los usuarios tienen los
mismos permisos (un mozo no debería administrar cuentas). Confiar en ids enviados
por el cliente permitiría leer o modificar datos de otro local.

## 2. Objetivo

Garantizar el aislamiento total por restaurante y un modelo de roles sin escalada
de privilegios, tomando el scope siempre del claim de la cookie y nunca del
payload del cliente.

## 3. Alcance

**Incluye**
- Base `RestaurantScopedController` con `CurrentRestaurantId` y `CurrentUserId`
  resueltos desde los claims.
- Filtrado por `RestaurantId` en todo listado/lectura y estampado en todo
  create/update.
- Roles `admin` / `owner` / `user` y políticas `AdminOnly` / `ManagerOnly`.
- Normalización de roles para impedir escalada.
- Grupos de SignalR por restaurante (ver [realtime.md](./realtime.md)).

**No incluye (fuera de alcance)**
- UI para cambiar de restaurante / impersonar.
- Límite de cantidad de usuarios o planes por restaurante.
- Auditoría de acciones por usuario (más allá de `Expense.CreatedByUserId`).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Aislamiento de datos
- **Dado** dos restaurantes A y B con productos, mesas, órdenes, gastos y usuarios
- **Cuando** un usuario de A lista cualquiera de esos recursos
- **Entonces** solo recibe los de A; y si pide por id un recurso de B, recibe
  `404` (A) o `403` (Restaurant).

### HU-2 — Scope server-side, nunca del cliente
- **Dado** un usuario de A que envía `restaurantId` de B en el body
- **Cuando** crea/actualiza un recurso
- **Entonces** el recurso se estampa con el `restaurantId` de A (el valor enviado
  se ignora).

### HU-3 — Solo admin crea admins
- **Dado** un `owner` autenticado
- **Cuando** intenta `POST /User` con `role = "admin"`
- **Entonces** el rol resultante es `user` (no escala).

### HU-4 — Owner protegido
- **Dado** un `owner` y un `user` manager
- **Cuando** el `user` intenta editar/eliminar al `owner`
- **Entonces** recibe `403`/`Forbid`.

### HU-5 — La URL no cambia de tenant
- **Dado** un usuario cuyo restaurante es 5
- **Cuando** navega manualmente a `/kitchen/9/mesas`
- **Entonces** el layout lo redirige a `/kitchen/5/mesas`.

## 5. Contrato de API

Transversal. Cada controller scoped declara `[Authorize]` y hereda de
`RestaurantScopedController` (`backend/Controllers/RestaurantScopedController.cs`).

| Política | Requiere | Aplica a |
|---|---|---|
| `AdminOnly` | rol `admin` | `Restaurant` POST, `Maintenance/clear-database` |
| `ManagerOnly` | rol `admin` u `owner` | `User` POST/PUT/DELETE, `Restaurant` PUT/DELETE |
| `[Authorize]` | autenticado | resto de endpoints |

`CurrentRestaurantId` / `CurrentUserId` se leen de
`RestaurantClaims.Id` / `RestaurantClaims.UserId`; si faltan, valen `0`.

## 6. Modelo de datos

Todas las entidades operativas llevan `RestaurantId` (int, default 0):
`User`, `Table`, `Product`, `Order`, `OrderDetail`, `Expense`. `Restaurants.Id`
es la raíz del scope. No hay FK/navegación a `Restaurants` todavía (columna
plana, permite filas legacy con 0).

## 7. Eventos en tiempo real

Todas las emisiones del hub van a `RestaurantHub.GroupFor(CurrentRestaurantId)`
(`restaurant-{id}`), nunca a `Clients.All`. Ver [realtime.md](./realtime.md).

## 8. Reglas de negocio y casos borde

- Normalización de rol (en `CreateUser`/`EditUser`): `admin` solo lo otorga un
  `admin`; `owner` lo puede otorgar un `owner`/`admin`; cualquier otro valor cae a
  `user`.
- Managers no pueden editarse ni eliminarse a sí mismos (salvo un `admin`).
- `Restaurant` PUT/DELETE con `id != CurrentRestaurantId` → `403`.
- Un `OrderController` que referencia una mesa/producto ajeno → `404`/`400`
  antes de tocar la orden abierta de esa mesa.

## 9. UI / Flujo

- `frontend/src/app/RootClientLayout.tsx` compara el `{id}` de la URL con el
  `restaurantId` de sesión y hace `router.replace` si difieren.
- El `Navbar` muestra la pestaña Admin solo si `role === "admin" || "owner"`; los
  botones Agregar/Quitar mesa igual.

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `Products_AreIsolatedPerRestaurant` | `backend.Tests/RestaurantScopingTests.cs` | HU-1 |
| `TablesAndActiveOrders_AreIsolatedPerRestaurant` | idem | HU-1 |
| `Expenses_AndUsers_AreIsolatedPerRestaurant` | idem | HU-1 |
| `ProductFromOtherRestaurant_CannotBeOrderedOnOwnTable` | idem | HU-2 |
| `PaymentDoesNotClear_AnotherRestaurantsOpenOrder` | idem | HU-1 |
| Tests de escalada/rol (owner/staff) | `backend.Tests/UserControllerTests.cs` | HU-3, HU-4 |
| `UpdateRestaurant_OtherRestaurant_ReturnsForbidden` | `backend.Tests/RestaurantControllerTests.cs` | HU-1 |

## 11. Preguntas abiertas / Backlog

- [ ] FK real de `RestaurantId` → `Restaurants.Id` (hoy columna plana, sin
      integridad referencial).
- [ ] UI de cambio de restaurante / selección multi-local.
- [ ] Auditoría de acciones por usuario.
