# SPEC-007 · Gestión de mesas

- **ID:** SPEC-007
- **Área:** Operación
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

El salón se organiza por mesas. Se necesitan verlas todas, saber cuáles están
ocupadas y agregar/quitar mesas físicas. El estado de ocupación nace de si la
mesa tiene una orden abierta.

## 2. Objetivo

Administrar el set de mesas del restaurante, mostrando en cada una su orden
abierta y sincronizando altas/bajas en tiempo real.

## 3. Alcance

**Incluye**
- Listar mesas con su orden `OPEN` embebida.
- Agregar mesa y quitarla.
- Numeración `Mesa N` por posición (ordenadas por `Id`).
- Sincronización de altas/bajas vía hub.

**No incluye (fuera de alcance)**
- Número/nombre de mesa editable (se crea con `tableNumber = 0` y se numera por
  posición).
- Mapa físico / drag-and-drop de ubicación.
- Estados intermedios (reservada, por limpiar).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Listar mesas
- **Dado** un restaurante con mesas
- **Cuando** se carga Mesas
- **Entonces** cada tarjeta muestra `Mesa N` (1-based) y, si tiene orden abierta,
  comensales y total; si no, "Inactiva".

### HU-2 — Agregar mesa
- **Dado** un admin/owner
- **Cuando** presiona "Agregar mesa"
- **Entonces** se crea (`POST /Table`, `tableNumber: 0`), aparece en su grilla y
  en la de todos los clientes vía `TableCreated`.

### HU-3 — Quitar mesa
- **Dado** una mesa seleccionada
- **Cuando** se presiona "Quitar mesa"
- **Entonces** se borra (`DELETE /Table/{id}`), se elimina también su orden abierta
  y todos los clientes la quitan vía `TableDeleted` (+ `OrderClosed` si tenía
  orden).

### HU-4 — Numeración consistente
- **Dado** que una base recién creada tiene ids altos
- **Cuando** se muestra la primera mesa
- **Entonces** dice `Mesa 1` (no el id de la base).

### HU-5 — Gating por rol
- **Dado** un usuario `user`
- **Cuando** entra a Mesas
- **Entonces** no ve los botones Agregar/Quitar mesa.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/Table` | `[Authorize]` | — | `[TableResponseDto]` (`{ id, tableNumber, order }`) | 401 |
| POST | `/api/v1/Table` | `[Authorize]` | `Table` (`{ tableNumber }`) | `Table` | 400 |
| DELETE | `/api/v1/Table/{id}` | `[Authorize]` | — | `Table` | 404 |

## 6. Modelo de datos

`Table` (`[Table("tables")]`): `Id` (PK), `TableNumber` (int?, puede ser null),
`RestaurantId` (int). No hay número único ni constraints de posición.

## 7. Eventos en tiempo real

| Evento | Cuándo | Payload |
|---|---|---|
| `TableCreated` | POST ok | `Table` |
| `TableDeleted` | DELETE ok | `{ tableId }` |
| `OrderClosed` | DELETE de mesa con orden | `{ tableId }` |

Ver [realtime.md](./realtime.md).

## 8. Reglas de negocio y casos borde

- `POST` sin `tableNumber` → `400` (pero el frontend siempre manda `0`, por eso
  el número "real" es la posición).
- `DELETE` por id explícito (no "la última"); si no existe → `404`.
- El `DELETE` limpia la orden `OPEN` de la mesa para no dejar huérfanos en
  `/Order/active`.
- `GetTables` agrupa las órdenes `OPEN` por mesa (`GroupBy` + la más reciente):
  si una carrera o datos preexistentes dejan dos `OPEN` en la misma mesa, no
  revienta (antes un `ToDictionary` lanzaba 500).
- La numeración se calcula en el frontend ordenando por `Id`
  (`OrdersContext.tableNumbers`); el id de la URL/DB nunca se usa como etiqueta.

## 9. UI / Flujo

- `frontend/src/app/kitchen/[id]/mesas/page.tsx`: deriva `tablesWithOrders`
  (merge de `tables` + `openOrders`), `selectedTable` y `selectedTableNumber`.
- `frontend/src/app/kitchen/[id]/mesas/TablesContent.tsx`: grilla + botones
  Agregar/Quitar (gated por `role`).
- `frontend/src/components/TableCards.tsx`: tarjeta con estado Activa/Inactiva,
  comensales y total.
- `frontend/src/app/OrdersContext.tsx`: `addTable`/`removeTable` (API + hub),
  `tables`, `tableNumbers`.

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `GetTables_EmptyDatabase_ReturnsEmptyList` | `backend.Tests/TableControllerTests.cs` | HU-1 |
| `GetTables_ReturnsPersistedTablesWithRealIds` | idem | HU-1 |
| `GetTables_IncludesTheOpenOrderPerTable` | idem | orden abierta por mesa |
| `GetTables_DuplicateOpenOrders_DoesNotThrow` | idem | caso borde (duplicados) |
| `CreateTable_ValidTableNumber_ReturnsOkAndPersists` | idem | HU-2 |
| `CreateTable_MissingTableNumber_ReturnsBadRequest` | idem | caso borde |
| `DeleteTable_ExistingId_RemovesOnlyThatTable` | idem | HU-3 |
| `DeleteTable_MissingId_ReturnsNotFound` | idem | caso borde |
| `TablesAndActiveOrders_AreIsolatedPerRestaurant` | `backend.Tests/RestaurantScopingTests.cs` | multi-tenant |

## 11. Preguntas abiertas / Backlog

- [ ] Permitir nombrar/numerar la mesa manualmente (hoy el `TableNumber` se
      ignora a favor de la posición).
- [ ] Mapa físico del salón (roadmap original).
- [ ] Reordenar mesas.

> **Relacionadas:** [order-composition.md](./order-composition.md),
> [order-payment.md](./order-payment.md), [realtime.md](./realtime.md).
