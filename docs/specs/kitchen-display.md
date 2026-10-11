# SPEC-011 · Cocina (KDS en vivo)

- **ID:** SPEC-011
- **Área:** Operación
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

La cocina necesita ver, sin refrescar, todos los pedidos activos del salón a
medida que los mozos los confirman. Un pedido a medio armar no debe llegar.

## 2. Objetivo

Mostrar un tablero en vivo con todas las órdenes `OPEN` (con al menos un ítem),
identificando la mesa y los productos/cantidades, actualizado por el hub.

## 3. Alcance

**Incluye**
- Tarjetas por orden activa: `Mesa N`, hora, ítems × cantidad y estado
  "En preparación".
- Estado vacío cuando no hay pedidos.
- Actualización en vivo vía `OrderUpdated`/`OrderClosed`.

**No incluye (fuera de alcance)**
- Acciones de cocina (marcar listo, tiempos, prioridades, columnas tipo kanban).
- Alertas sonoras / impresión de comandas.
- Separar bebidas de comidas (todo va junto).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Ver pedidos activos
- **Dado** mesas con orden abierta
- **Cuando** la cocina tiene la pantalla abierta
- **Entonces** ve una tarjeta por orden con mesa, hora e ítems.

### HU-2 — Llegada instantánea
- **Dado** un mozo que presiona "Crear orden"
- **Cuando** el pedido se commitea
- **Entonces** la tarjeta aparece en cocina sin refrescar.

### HU-3 — Desaparece al cobrar
- **Dado** una orden pagada
- **Cuando** se emite `OrderClosed`
- **Entonces** la tarjeta se retira.

### HU-4 — Sin pedidos
- **Dado** que no hay órdenes activas
- **Cuando** se abre Cocina
- **Entonces** muestra "No hay pedidos activos".

### HU-5 — Borradores no aparecen
- **Dado** un borrador local sin commitear en Mesas
- **Cuando** miro Cocina
- **Entonces** no aparece (solo llega lo commiteado).

## 5. Contrato de API

Consume el estado global del hub (no hace fetch propio):

| Fuente | Datos |
|---|---|
| `GET /api/v1/Order/active` (snapshot) | órdenes `OPEN` |
| `OrderUpdated` / `OrderClosed` (hub) | altas/cambios/bajas en vivo |

## 6. Modelo de datos

`Order` (`OPEN`) + `OrderDetail`. Filtra `order.orderDetail.length > 0`.

## 7. Eventos en tiempo real

`OrderUpdated`, `OrderClosed` (ver [realtime.md](./realtime.md)).

## 8. Reglas de negocio y casos borde

- Filtra solo órdenes con ≥ 1 ítem.
- La numeración `Mesa N` sale de `OrdersContext.tableNumbers`, no del id.
- No hay acciones de cocina: el pedido solo cambia al editar/cobrar en Mesas.

## 9. UI / Flujo

- `frontend/src/app/kitchen/[id]/cocina/page.tsx`: `activeOrders = openOrders
  .filter(detail.length > 0)`; pasa `tableNumbers`.
- `frontend/src/app/kitchen/[id]/cocina/KitchenView.tsx`: grilla de tarjetas
  (`colorPalette.DeepTwilight`), hora, ítems y punto verde "En preparación".

## 10. Cobertura de tests

Sin tests de frontend. El camino backend (`Order/active`) está cubierto
indirectamente por `OrderControllerTests` (`SaveOpenOrder_..._ListedAsActiveNotHistory`).

## 11. Preguntas abiertas / Backlog

- [ ] Marcar ítems/pedidos como listos y separar por estación.
- [ ] Tiempos de preparación y prioridad.
- [ ] Impresión de comanda / alerta sonora.

> **Relacionadas:** [order-composition.md](./order-composition.md),
> [realtime.md](./realtime.md).
