# SPEC-013 · Gastos (Expenses)

- **ID:** SPEC-013
- **Área:** Catálogo
- **Estado:** Implementado (backend) · UI pendiente
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

El negocio quiere registrar gastos operativos (cuentas, compras, sueldos,
servicios) y quién los cargó, para tener trazabilidad del egreso por restaurante.

## 2. Objetivo

Registrar y listar gastos scoped por restaurante, con tipo, valor, fecha y autor
estampado desde la sesión.

## 3. Alcance

**Incluye**
- Listado paginado de gastos (con el usuario autor embebido).
- Alta de gasto con tipo (`BILLS`, `GROCERIES`, `SALARY`, `SERVICES`).
- Autor (`CreatedByUserId`) tomado del claim, no del cliente.

**No incluye (fuera de alcance)**
- UI (no hay pantalla; el servicio frontend ni existe).
- Edición/borrado de gastos.
- Reportes/analítica de gastos, adjuntos, categorías custom.
- Vínculo con `Salary`/`PaymentDate` de usuarios.

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Registrar gasto
- **Dado** un usuario autenticado
- **Cuando** hace `POST /Expenses` con nombre/valor/tipo/fecha
- **Entonces** el gasto se guarda con su `restaurantId` y su autor real.

### HU-2 — Autor no falsificable
- **Dado** un usuario que envía `createdByUserId` de otro
- **Cuando** se crea el gasto
- **Entonces** el autor guardado es el del claim (el enviado se ignora).

### HU-3 — Listar paginado
- **Dado** gastos en la base
- **Cuando** se pide `GET /Expenses?page=&pageSize=`
- **Entonces** recibe una página ordenada por id con el autor incluido.

### HU-4 — Aislamiento
- **Dado** dos restaurantes
- **Cuando** uno lista gastos
- **Entonces** no ve los del otro.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/Expenses?page=&pageSize=` | `[Authorize]` | query | `[Expense]` (con `CreatedByUser`) | 401 |
| POST | `/api/v1/Expenses` | `[Authorize]` | `Expense` | `Expense` | 400 |

> Nota histórica: la clase se llamaba `ExpensesControllers` (plural), lo que
> rompía la ruta (`/api/v1/ExpensesControllers`). Hoy es `ExpensesController` y
> la ruta es `/api/v1/Expenses`.

## 6. Modelo de datos

`Expense`:

| Campo | Tipo | Notas |
|---|---|---|
| `Id` | int PK | |
| `Name` | string | |
| `Value` | decimal | |
| `ExpenseType` | enum | `BILLS \| GROCERIES \| SALARY \| SERVICES` |
| `DateOfTheExpense` | DateTime | |
| `CreatedByUserId` | int | FK → `Users.Id`, estampado del claim |
| `CreatedByUser` | User? | navegación |
| `RestaurantId` | int | scope |

## 7. Eventos en tiempo real

N/A.

## 8. Reglas de negocio y casos borde

- `GET` sin `pageSize`/`page` válidos: bindean a `0` → `Skip`/`Take(0)` devuelven
  vacío (no hay defaults). A endurecer.
- El `catch` re-lanza (`throw ex`) en ambos endpoints — pierde el stack trace
  (warning `CA2200`). Mejorable.
- `POST` con body nulo → `400`.

## 9. UI / Flujo

- `frontend/src/models/expense.tsx` existe, pero **no hay servicio ni pantalla**
  que consuma `/Expenses`. Es backend-only por ahora.

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `Expenses_AndUsers_AreIsolatedPerRestaurant` | `backend.Tests/RestaurantScopingTests.cs` | HU-3, HU-4, autor estampado |

## 11. Preguntas abiertas / Backlog

- [ ] Servicio frontend + pantalla de gastos (listado + alta).
- [ ] Defaults de paginación y validación; no re-lanzar con `throw ex`.
- [ ] Editar/borrar gastos y reportes.
