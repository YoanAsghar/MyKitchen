# SPEC-008 · Composición de orden (borrador local en Mesas)

- **ID:** SPEC-008
- **Área:** Operación
- **Estado:** Implementado
- **Última actualización:** 2026-10-14

## 1. Contexto y problema

Tomar un pedido en la mesa implica probar, corregir y rearmar el carrito. Si cada
toque enviara al backend, la cocina vería pedidos a medio armar y habría decenas
de escrituras por segundo. Se necesita **componer en local** y **enviar una sola
vez** cuando el pedido está listo.

## 2. Objetivo

Componer una orden (productos, comensales, propina) de forma local en el panel de
la mesa y commitearla al backend con un único botón ("Crear orden"), que también
sirve para editar una orden abierta.

## 3. Alcance

**Incluye**
- Panel de mesa con dos pestañas: "Pedidos actuales" (lista) y "Agregar
  productos".
- Alta/baja de productos, comensales y propina **en borrador local**.
- Nota a nivel de orden (**"nota para la cocina"**, texto libre opcional, máx.
  500) en borrador local, persistida recién al commitear.
- Botón único **"Crear orden"** (púrpura) como punto de commit.
- Re-seed del borrador ante cambios remotos de la misma mesa.

**No incluye (fuera de alcance)**
- Enviar mientras se escribe (no hay autosave).
- Múltiples órdenes simultáneas por mesa (una sola `OPEN`).
- Notas/comentarios **por ítem**, modificadores, divisiones.

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Componer sin tocar el backend
- **Dado** una mesa seleccionada
- **Cuando** agrego/quitar productos o cambio la propina
- **Entonces** nada se envía; solo cambia el borrador local y el total mostrado.

### HU-2 — Commit con un botón
- **Dado** un borrador con al menos un producto
- **Cuando** presiono **"Crear orden"**
- **Entonces** se hace `PUT /Order/table/{tableId}` una vez, la orden se crea o
  actualiza como `OPEN` y todos los clientes la ven.

### HU-3 — Borrador vacío cancela
- **Dado** un borrador sin productos
- **Cuando** presiono "Crear orden"
- **Entonces** se limpia/cancela la orden abierta de esa mesa (`clearOpenOrder`).

### HU-4 — Editar una orden existente
- **Dado** una mesa con orden abierta
- **Cuando** presiono "Editar orden" (pestaña lista) y recompongo
- **Entonces** el panel vuelve a la pestaña de agregar productos y el nuevo envío
  se hace con "Crear orden" (misma etiqueta).

### HU-5 — Reflejar cambios remotos
- **Dado** la misma mesa abierta en otro dispositivo
- **Cuando** el otro dispositivo cambia el contenido
- **Entonces** este panel re-siembra su borrador (last-write-wins).

### HU-6 — Nota para la cocina (nivel orden)
- **Dado** una mesa seleccionada, **cuando** escribo en el textarea
  "Nota para la cocina", **entonces** solo cambia el borrador local (nada viaja
  al backend).
- **Dado** un borrador con al menos un producto y una nota, **cuando** presiono
  "Crear orden", **entonces** la nota se persiste en la `Order` `OPEN` y viaja en
  `OrderUpdated` (aparece en la tarjeta de Cocina).
- **Dado** una mesa con orden abierta con nota, **cuando** la reabro, **entonces**
  el textarea se re-siembra con la nota; si la borro y commiteo, queda vacía.
- **Dado** una orden pagada, **cuando** la miro en Ordenes/Historial, **entonces**
  la nota sigue visible.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| PUT | `/api/v1/Order/table/{tableId}` | `[Authorize]` | `SaveOpenOrderRequest` | `Order` (proyectada) | 400, 404 |

`SaveOpenOrderRequest`: `{ tableId, guests, tip, paymentMethod, comment?,
orderDetail: [{ productId, quantity }] }`. `orderDetail` vacío = limpiar (nota
incluida). `comment` es opcional; se hace **trim** y vacío = sin nota (`null`);
> 500 caracteres → `400`.

El backend calcula el total (`Σ price × qty + tip`) — nunca confía en el total del
cliente. Broadcast `OrderUpdated`.

## 6. Modelo de datos

`Order` (`Status = OPEN`) + `OrderDetail` (por producto). Ver [order-history.md](./order-history.md).
La nota es un campo `Comment` (`string?`) **de la orden** (no del ítem). El borrador
local es `orderDetail[]` + `comment` en `tableInformation.tsx` (no persistido hasta
el commit).

## 7. Eventos en tiempo real

- `OrderUpdated` al commitear (lo aplica `OrdersContext`).
- `OrderClosed` si el borrador queda vacío y se limpia la orden.

## 8. Reglas de negocio y casos borde

- **Un solo commit point:** `handleCreateOrder` en `tableInformation.tsx`. Se
  eliminó todo `syncWithParent` por keystroke.
- El borrador vive por selección: `key={currentTableSelectedId}` remonta el
  componente; cambiar de mesa sin commitear descarta el borrador.
- Re-seed por **contenido** (firma `guests + tip + comment + productId×qty`) vía
  `appliedKeyRef`, no por id de mesa, para que cambios remotos aparezcan.
- Productos inválidos (`productId <= 0` o `quantity <= 0`) → `400`; producto de
  otro restaurante → `400`; mesa ajena → `404`.
- Nota: opcional; trim; vacío/omitido = `null`; `> 500` → `400` (validado en el
  cliente con `maxLength={500}` y en el servidor).
- Si existieran varias `OPEN` para una mesa, el backend colapsa duplicados.

## 9. UI / Flujo

- `frontend/src/app/kitchen/[id]/mesas/tableInformation.tsx`:
  - Pestaña 1 "Pedidos actuales": tabla de ítems, total y (si hay orden) el
    bloque de pago (`TablePayment`).
  - Pestaña 2 "Agregar productos": buscador, lista de productos y botón
    **"Crear orden"** al pie.
  - Sobre el Total/commit hay un `textarea` **"Nota para la cocina"** (`maxLength`
    500). Es parte del borrador local: `buildOrderDraft()` copia `comment` a la
    `Order`.
  - `buildOrderDraft()` arma la `Order` local; `handleSaveOrder` la commitea.
- `frontend/src/app/OrdersContext.tsx`: `syncOpenOrder`/`clearOpenOrder`
  (persistencia inmediata, sin debounce, disparadas solo por el botón).

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `SaveOpenOrder_CreatesOpenOrder_ListedAsActiveNotHistory` | `backend.Tests/OrderControllerTests.cs` | HU-2 |
| `SaveOpenOrder_UpdatesExistingOpenOrder_NoDuplicates` | idem | HU-2 |
| `SaveOpenOrder_EmptyCart_ClearsOpenOrder` | idem | HU-3 |
| `SaveOpenOrder_PersistsAndRoundTripsComment_Trimmed` | idem | HU-6 |
| `SaveOpenOrder_WhitespaceOrOmittedComment_StaysEmpty` | idem | HU-6 |
| `SaveOpenOrder_CommentTooLong_ReturnsBadRequest` | idem | HU-6, caso borde |
| `CreateOrder_CommentSurvivesPayment` | idem | HU-6 |
| `CreateOrder_CommentTooLong_ReturnsBadRequest` | idem | caso borde |
| `SaveOpenOrder_UnknownTable_ReturnsNotFound` | idem | caso borde |
| `ProductFromOtherRestaurant_CannotBeOrderedOnOwnTable` | `backend.Tests/RestaurantScopingTests.cs` | caso borde |

## 11. Preguntas abiertas / Backlog

- [ ] Dirty-guard: no re-sembrar el borrador mientras se está editando (hoy
      last-write-wins).
- [ ] Notas **por ítem** / modificadores (sin cebolla, punto de cocción, etc.) —
      hoy la nota es a nivel de orden.
- [ ] Múltiples rondas/productos que no van a cocina (p. ej. bebidas directas).

> **Relacionadas:** [order-payment.md](./order-payment.md),
> [kitchen-display.md](./kitchen-display.md).
