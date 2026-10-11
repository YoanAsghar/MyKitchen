# SPEC-006 · Gestión de usuarios / staff

- **ID:** SPEC-006
- **Área:** Cuenta
- **Estado:** Implementado (backend + UI de gestión en Admin)
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

Un restaurante suma personal (mozos, cocineros) que también operan la app pero no
deberían administrar cuentas. Se necesita crear, listar, editar y eliminar
usuarios del propio restaurante, con roles y sin permitir escalada de privilegios.

## 2. Objetivo

Dar a owners/admins el control de los usuarios de su restaurante, con
normalización de roles y protecciones sobre las cuentas "sensibles" (owner, uno
mismo).

## 3. Alcance

**Incluye**
- Listar usuarios del restaurante (sin exponer hashes).
- Crear/editar/eliminar usuarios (manager).
- Normalización de rol anti-escalada.
- Protección del owner y de la propia cuenta.

**No incluye (fuera de alcance)**
- Turnos, permisos granulares por acción.
- Nómina (`Salary`/`PaymentDate` se persisten pero no hay flujo/UI).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Listar staff
- **Dado** un usuario autenticado
- **Cuando** pide `GET /User`
- **Entonces** recibe `[{ id, userName, role }]` de su restaurante (sin `passwordHash`).

### HU-2 — Crear staff
- **Dado** un manager
- **Cuando** crea `{ userName, passwordHash }` (contraseña en claro)
- **Entonces** el usuario se persiste con la contraseña hasheada, rol normalizado
  y el `restaurantId` del llamador; el hash no se devuelve.

### HU-3 — Sin escalada
- **Dado** un `owner`
- **Cuando** crea un usuario con `role = "admin"`
- **Entonces** el rol resultante es `user`.

### HU-4 — Editar sin romper el login
- **Dado** un usuario gestionado
- **Cuando** un manager lo edita con `passwordHash` vacío
- **Entonces** el hash existente se conserva (no se sobreescribe ni se guarda
  texto plano); con contraseña nueva, se re-hashea.

### HU-5 — Protecciones
- **Dado** un manager no-admin
- **Cuando** intenta editar/eliminar al owner, o editar/eliminar su propia cuenta
- **Entonces** recibe `403`/`400`.

### HU-6 — Restricciones de rol
- **Dado** un `user` (no manager)
- **Cuando** intenta crear/editar/eliminar usuarios
- **Entonces** recibe `403`.

### HU-7 — Gestión desde el admin
- **Dado** un `owner`/`admin` en `/admin/{id}/empleados`
- **Cuando** lista, crea, edita (con/sin nueva contraseña) o elimina empleados y asigna rol
- **Entonces** la UI refleja el rol del llamador (selector `user`/`owner`, y `admin`
  solo si es admin global) y se respetan las normalizaciones/protecciones del backend.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/User` | `[Authorize]` | — | `[{ id, userName, role }]` | 401 |
| POST | `/api/v1/User` | `ManagerOnly` | `User` | `User` (hash vacío) | 400, 401, 403, 409 |
| PUT | `/api/v1/User/{id}` | `ManagerOnly` | `User` | `User` | 401, 403, 404 |
| DELETE | `/api/v1/User/{id}` | `ManagerOnly` | — | `User` | 400, 401, 403, 404 |

En create/update el campo de contraseña se llama `passwordHash` en el wire pero
el valor es la contraseña en claro.

## 6. Modelo de datos

`Users` — ver [auth.md](./auth.md). Scoped por `RestaurantId`.

## 7. Eventos en tiempo real

N/A.

## 8. Reglas de negocio y casos borde

- Duplicado de username (case-insensitive, global) en create → `409`.
- Normalización de rol (create y edit): `admin` solo por `admin`; `owner` por
  `owner`/`admin`; resto → `user`.
- En edit: owner solo editable por `admin`; nadie (salvo `admin`) edita su propia
  cuenta; el scope se re-estampa desde el claim.
- En delete: owner solo borrable por `admin`; no se puede borrar la propia cuenta
  (`400`, mensaje "No podés eliminar tu propio usuario").
- `Salary`/`PaymentDate` se copian del payload (sin validación de rango).

## 9. UI / Flujo

- `frontend/src/services/UserServices.tsx`: `getAll`, `createUser`, `editUser`,
  `deleteUser` (todos con `credentials: "include"`).
- **Pantalla:** `frontend/src/app/admin/[id]/empleados/Empleados.tsx` (lista con
  avatar, badge de rol, editar/eliminar; modal crear/editar con selector de rol
  según el llamador; contraseña vacía en editar conserva la actual).
- Acceso por `owner`/`admin` (gating visual + `ManagerOnly` backend).

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `GetUsers_ReturnsUnhashedUsers` | `backend.Tests/UserControllerTests.cs` | HU-1 |
| Auth (401 anónimo create/get/delete) | idem | HU-6 |
| Creación de owner por admin / staff → 403 / downgrade de `admin` | idem | HU-3, HU-6 |
| Edición/eliminación protegida | idem | HU-5 |

*(Los nombres exactos varían; ver el archivo para la lista completa.)*

## 11. Preguntas abiertas / Backlog

- [ ] Ocultar eliminar/editar sobre la propia cuenta en la UI de Empleados.
- [ ] UI de nómina (`Salary`, `PaymentDate`).
- [ ] Validación de contraseña mínima también en create/edit de User (hoy solo el
      registro de restaurante valida longitud).
- [ ] `userId` en login para saber "quién soy" sin llamar a `/me`.
