# SPEC-009 · Cobro de orden (Procesar pago)

- **ID:** SPEC-009
- **Área:** Operación
- **Estado:** Implementado
- **Última actualización:** 2026-10-18

## 1. Contexto y problema

Terminado el servicio, la mesa se cobra y queda libre. El cobro debe archivar la
orden como historial, vaciar la mesa y liberarla para el próximo cliente en todas
las pantallas.

## 2. Objetivo

Cobrar la orden abierta de una mesa eligiendo método de pago, pasarla a `PAID`
(historial) y liberar la mesa, con broadcast a todos los clientes.

## 3. Alcance

**Incluye**
- Bloque "Métodos de pago" (Efectivo, Transferencia, Tarjeta).
- Botón **"Procesar pago"**.
- Botón **"Editar orden"** (vuelve a la composición).
- Paso a `PAID` + limpieza de la orden abierta + `OrderClosed`.

**No incluye (fuera de alcance)**
- Pagos parciales / dividir la cuenta.
- Vuelto/efectivo recibido, propina post-cobro.
- Integración con pasarelas / impresión de ticket.
- Anulación/reversión de un cobro.

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Procesar pago
- **Dado** una mesa con orden abierta
- **Cuando** elijo un método y presiono "Procesar pago"
- **Entonces** `POST /Order` persiste la orden como `PAID`, borra la `OPEN` de la
  mesa y todos los clientes reciben `OrderClosed`.

### HU-2 — Mesa libre tras cobrar
- **Dado** el cobro exitoso
- **Cuando** se actualiza el estado global
- **Entonces** la mesa pasa a "Inactiva" y desaparece de Cocina.

### HU-3 — Solo con orden creada
- **Dado** una mesa sin orden creada (solo borrador)
- **Cuando** miro la pestaña de lista
- **Entonces** el bloque de pago no aparece.

### HU-4 — Editar antes de pagar
- **Dado** una orden abierta
- **Cuando** presiono "Editar orden"
- **Entonces** el panel vuelve a la pestaña de agregar productos para seguir
  editando (y reenviar con "Crear orden").

### HU-5 — Orden inválida
- **Dado** una orden sin ítems, con cantidad/producto inválido o propina/guest
  negativos
- **Cuando** se intenta cobrar
- **Entonces** `400`.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| POST | `/api/v1/Order` | `[Authorize]` | `Order` (con `OrderDetail`) | `Order` (`PAID`) | 400, 404 |

El backend fuerza `Id = 0`, `Status = PAID`, `RestaurantId` del claim y estampa
los detalles. Valida que la mesa (si viene `tableId`) sea del restaurante antes de
limpiar. **Recalcula `TotalPrice` server-side** a partir de los precios reales en
BD (`Σ product.Price × quantity + tip`); el `totalPrice` que manda el cliente se
ignora. Tras guardar, elimina las órdenes `OPEN` de esa mesa y emite
`OrderClosed { tableId }`.

## 6. Modelo de datos

`Order` pasa de `OPEN` a `PAID`; la `OPEN` de la mesa se **elimina** (no queda
histórica). `PaymentMethod` enum `CASH | CARD | BANK_TRANS` (string en el wire).

## 7. Eventos en tiempo real

`OrderClosed { tableId }` (ver [realtime.md](./realtime.md)).

## 8. Reglas de negocio y casos borde

- `POST /Order` sin ítems → `400`; ítems con `productId <= 0` o `quantity <= 0`
  → `400`; `guests < 0` o `tip < 0` → `400`.
- Referencia a mesa de otro restaurante → `404` (y **no** se limpia la orden de
  esa mesa ajena — probado).
- El `Status` y el `RestaurantId` del payload se ignoran.
- El `TotalPrice` del payload se ignora: se recalcula con los precios de BD
  (`Σ precio × cantidad + propina`). Productos inexistentes/ajenos → `400`.
- El frontend **no** reenvía la orden pagada al hub; espera el `OrderClosed`.

## 9. UI / Flujo

- `frontend/src/app/kitchen/[slug]/mesas/TablePayment.tsx`: selector de método
  (`PaymentButton`) + "Procesar pago" (`OrderServices.createOrder`) + "Editar
  orden" (`onEditOrder` → vuelve a la pestaña de productos).
- Se monta dentro de `tableInformation.tsx`, en la pestaña "Pedidos actuales",
  **solo si `table.order` existe**.
- `OrderServices.createOrder` mapea a `Order` con `toOrder`; los botones usan
  `colorPalette.Navy` (`#22007c`).

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `CreateOrder_PaysAndClosesTheTablesOpenOrder` | `backend.Tests/OrderControllerTests.cs` | HU-1, HU-2 |
| `CreateOrder_EmptyOrderDetail_ReturnsBadRequest` | idem | HU-5 |
| `CreateOrder_InvalidQuantity_ReturnsBadRequest` | idem | HU-5 |
| `CreateOrder_Valid_ReturnsOkAndPersists` | idem | HU-1 |
| `CreateOrder_PaymentMethodIsSerializedAsString` | idem | enum en wire |
| `CreateOrder_IgnoresClientSentTotalPrice` | idem | total recalculado |
| `CreateOrder_UnknownProduct_ReturnsBadRequest` | idem | producto inválido |
| `PaymentDoesNotClear_AnotherRestaurantsOpenOrder` | `backend.Tests/RestaurantScopingTests.cs` | caso borde |

## 11. Preguntas abiertas / Backlog

- [ ] Dividir cuenta / pagos parciales.
- [ ] Reversión o reimpresión de una orden `PAID`.
- [ ] Métodos de pago configurables por restaurante.
- [ ] Propina sugerida / recargo por tarjeta.

> **Relacionadas:** [order-composition.md](./order-composition.md),
> [order-history.md](./order-history.md).
