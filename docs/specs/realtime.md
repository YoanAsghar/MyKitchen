# SPEC-003 · Sincronización en tiempo real (SignalR)

- **ID:** SPEC-003
- **Área:** Plataforma
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

Un restaurante tiene varias pantallas abiertas a la vez (salón, cocina, caja,
otros dispositivos). Si dependieran de polling o de refrescar, la cocina vería
pedidos tarde y dos mozos verían estados distintos de la misma mesa.

## 2. Objetivo

Propagar los cambios de órdenes y mesas a todos los clientes conectados del
mismo restaurante, al instante, con un estado global consistente.

## 3. Alcance

**Incluye**
- Hub `RestaurantHub` en `/hub`, autenticado por cookie, con grupos por
  restaurante.
- Eventos: `OrderUpdated`, `OrderClosed`, `TableCreated`, `TableDeleted`.
- Snapshot inicial (`Order/active` + `Table`) al conectar y **resync** al
  reconectar.
- Reconexión automática del cliente.

**No incluye (fuera de alcance)**
- Resolución de conflictos cuando dos clientes editan la misma mesa (hoy
  last-write-wins).
- Backplane distribuido (Redis) — hoy es un solo proceso.
- Presencia / "quién está mirando qué".

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Un pedido creado aparece en cocina al instante
- **Dado** un cliente en Mesas y otro en Cocina
- **Cuando** el primero comete una orden (`PUT /Order/table/{id}`)
- **Entonces** el segundo recibe `OrderUpdated` con la orden completa y la
  muestra sin refrescar.

### HU-2 — Un pago libera la mesa en todos lados
- **Dado** una mesa con orden abierta
- **Cuando** se procesa el pago (`POST /Order`)
- **Entonces** todos los clientes reciben `OrderClosed { tableId }` y retiran la
  orden.

### HU-3 — Alta/baja de mesa en vivo
- **Dado** dos clientes conectados
- **Cuando** uno agrega o elimina una mesa
- **Entonces** el otro recibe `TableCreated`/`TableDeleted` y actualiza su lista.

### HU-4 — No hay fuga entre restaurantes
- **Dado** dos restaurantes con clientes conectados
- **Cuando** A emite un evento
- **Entonces** el cliente de B no lo recibe.

### HU-5 — Resync tras reconectar
- **Dado** un cliente que perdió la conexión
- **Cuando** SignalR reconecta
- **Entonces** el cliente vuelve a pedir el snapshot (`active` + tablas) y queda
  consistente.

## 5. Contrato de API

No es REST: es el protocolo del hub.

| Evento | Dirección | Payload | Grupo |
|---|---|---|---|
| `OrderUpdated` | server → client | `Order` completo (con `OrderDetail.Product`) | `restaurant-{id}` |
| `OrderClosed` | server → client | `{ tableId }` | `restaurant-{id}` |
| `TableCreated` | server → client | `Table` (`{ id, tableNumber, restaurantId }`) | `restaurant-{id}` |
| `TableDeleted` | server → client | `{ tableId }` | `restaurant-{id}` |

Conexión: `HubConnectionBuilder().withUrl(`${apiRoute}/hub`, { withCredentials: true }).withAutomaticReconnect()`.

`OnConnectedAsync` agrega la conexión al grupo leyendo `restaurantId` del claim.
El JSON del hub usa `JsonStringEnumConverter` (igual que MVC) para que los enums
viajen como string.

## 6. Modelo de datos

N/A (transporta `Order` y `Table`).

## 7. Eventos en tiempo real

Este spec **es** el de realtime. Fuente de los nombres:
`backend/Hubs/Hub.cs` (`HubEvents`) y su espejo
`frontend/src/services/SignalRService.ts` (`HubEvents`) — **deben mantenerse
sincronizados**.

## 8. Reglas de negocio y casos borde

- El hub está `[Authorize]`; sin cookie válida la conexión falla.
- Los emisores son los controllers vía `IHubContext<RestaurantHub>`, no llamadas
  de cliente. El hub **no expone métodos invocables por el cliente** (un método
  público permitiría a cualquier usuario autenticado falsificar eventos a otros
  tenants).
- El cliente aplica optimismo local en la acción propia, y el broadcast
  posterior es la fuente canónica (puede sobreescribir el estado local).
- Si falla el resync (`getActive`/`getAll`), el contexto cae a `[]` sin romper.

## 9. UI / Flujo

- `frontend/src/app/OrdersContext.tsx`: `OrdersProvider` dueño de `openOrders`,
  `tables`, `tableNumbers`, `isLive`, `syncOpenOrder`, `clearOpenOrder`,
  `addTable`, `removeTable`. Se suscribe al hub al autenticar y lo cierra al
  desloguear.
- `frontend/src/services/SignalRService.ts`: wrapper de ciclo de vida
  (`connect`/`disconnect`).
- Consumidores: Mesas, Cocina y Ordenes leen el mismo contexto (nunca estado
  local de órdenes por página).

## 10. Cobertura de tests

- Cubierto indirectamente por `OrderControllerTests`/`TableControllerTests`
  (los endpoints que emiten los eventos). **No hay test automatizado del hub /
  de la entrega de eventos a clientes.**

## 11. Preguntas abiertas / Backlog

- [ ] Estrategia de conflicto para edición simultánea de la misma mesa
      (dirty-guard / versionado), hoy last-write-wins.
- [ ] Test de integración del hub (entrega por grupo).
- [ ] Backplane para escalar a múltiples instancias.
