# SPEC-010 · Historial de órdenes

- **ID:** SPEC-010
- **Área:** Operación
- **Estado:** Implementado
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

Al cerrar el día (o consultar ventas) el restaurante necesita ver las órdenes
cobradas, filtrar por fecha y tener un total. Las órdenes abiertas no son
historial: van a Mesas/Cocina.

## 2. Objetivo

Listar las órdenes `PAID` de una fecha, con sus ítems, método de pago, mesa y
total, más un total general del día.

## 3. Alcance

**Incluye**
- Filtro por fecha (por defecto hoy, en UTC).
- Tabla con id, mesa (`Mesa N`), comensales, ítems, fecha/hora, pago y total.
- Total general de las órdenes listadas.

**No incluye (fuera de alcance)**
- Paginación (el backend soporte `?date=` pero no page/size para historial).
- Filtros por rango de fechas, método de pago, mesa o usuario.
- Exportación (CSV/PDF), cierre de caja / arqueo.
- Anulación o edición de órdenes pasadas.

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Ver el historial del día
- **Dado** un usuario autenticado
- **Cuando** entra a Ordenes
- **Entonces** ve las órdenes `PAID` de hoy con sus ítems y el total general.

### HU-2 — Filtrar por fecha
- **Dado** el selector de fecha
- **Cuando** elijo otro día
- **Entonces** la lista se recarga solo con las órdenes de ese día.

### HU-3 — Solo `PAID`
- **Dado** una orden `OPEN` en curso
- **Cuando** miro Ordenes
- **Entonces** no aparece (las abiertas viven en Mesas/Cocina).

### HU-4 — Numeración de mesa
- **Dado** una orden cuya mesa tiene id `19`
- **Cuando** se muestra
- **Entonces** dice `Mesa 1` (posición), consistente con el salón.

### HU-5 — Aislamiento
- **Dado** dos restaurantes
- **Cuando** uno consulta su historial
- **Entonces** solo ve sus órdenes.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/Order?date=yyyy-MM-dd` | `[Authorize]` | query opcional `date` | `[Order]` (`PAID` del día, con detalles/producto) | 401 |

Sin `date`, usa el día UTC actual. La proyección
(`backend/Services/OrderProjection.cs`) aplana `Order → OrderDetail → Product`.

## 6. Modelo de datos

`Order` (`Status = PAID`) + `OrderDetail`. Ver [order-payment.md](./order-payment.md).

## 7. Eventos en tiempo real

N/A (el historial se consulta por REST; no se actualiza en vivo ante un cobro
mientras está abierto).

## 8. Reglas de negocio y casos borde

- Rango del día: `[00:00 UTC, 24:00 UTC)` de la fecha pedida; `OrderDate` es UTC.
- Ordena por `Id` descendente (más reciente primero).
- El total general y la posición de mesa se calculan en el frontend.
- Si `GET` falla, la página queda vacía (`.then(setOrders)` sin `catch` visible).

## 9. UI / Flujo

- `frontend/src/app/kitchen/[id]/ordenes/page.tsx`: estado `orders` +
  `ordersDateQuery` (hoy por defecto), llama `OrderServices.getAll(date)`;
  `tableNumbers` viene de `OrdersContext`.
- `frontend/src/app/kitchen/[id]/ordenes/OrdersContent.tsx`: tabla, filtro
  `type="date"` y pie con "Total Órdenes" y "TOTAL GENERAL".

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `GetOrders_DefaultDate_ReturnsOnlyOrdersFromToday` | `backend.Tests/OrderControllerTests.cs` | HU-1, HU-3 |
| `GetOrders_WithSpecificDate_ReturnsOnlyThatDaysOrders` | idem | HU-2 |
| `GetOrders_IncludesOrderDetailsAndProducts` | idem | HU-1 |

## 11. Preguntas abiertas / Backlog

- [ ] Rango de fechas + paginación en el backend.
- [ ] Cierre de caja / arqueo diario.
- [ ] Exportar a CSV/PDF.
- [ ] Actualizar el historial en vivo si entra un cobro mientras la página está
      abierta.
- [ ] Manejo de error visible en la página (hoy silencioso).

> **Relacionadas:** [order-payment.md](./order-payment.md).
