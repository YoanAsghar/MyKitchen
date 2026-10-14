# SPEC-012 · Carta / Productos (catálogo)

- **ID:** SPEC-012
- **Área:** Catálogo
- **Estado:** Implementado (backend + lectura + CRUD UI en Admin)
- **Última actualización:** 2026-10-11

## 1. Contexto y problema

Los productos son la base de la operación: se eligen al tomar pedidos, se muestran
en la carta y definen precios. Cada restaurante administra su propio catálogo.

## 2. Objetivo

Ofrecer CRUD de productos scoped por restaurante, búsqueda por nombre y una vista
de carta con filtro por categoría.

## 3. Alcance

**Incluye**
- CRUD de productos (nombre, precio, categoría, descripción, imagen).
- Categorías como entidad propia (`Category`, un-a-muchos); el producto referencia
  `categoryId` (ver [categories.md](./categories.md)).
- Búsqueda por nombre (`/Product/search?search=`).
- Vista de carta con filtro por categoría, buscador y toggle de imágenes.
- Selección de productos al componer una orden.

**No incluye (fuera de alcance)**
- Stock, disponibilidad/agotado, modificadores, combos.
- Imágenes subidas (hoy es una URL/base64 en el campo `Image`).
- Import/export de cartas.
- Auto-sync de la carta en tiempo real (se recarga al entrar).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Listar la carta
- **Dado** un restaurante con productos
- **Cuando** entra a Carta
- **Entonces** ve las tarjetas con categoría, nombre, precio y descripción.

### HU-2 — Filtrar por categoría
- **Dado** varias categorías
- **Cuando** elijo una
- **Entonces** solo se muestran sus productos ("Todas" los muestra todos).

### HU-3 — Buscar
- **Dado** el buscador
- **Cuando** escribo un término
- **Entonces** se filtra por nombre (case-insensitive).

### HU-4 — Crear/editar/borrar producto (API)
- **Dado** un usuario autenticado
- **Cuando** hace `POST`/`PUT`/`DELETE` en `/Product`
- **Entonces** el producto se crea/actualiza/borra en su restaurante; ajeno → `404`.

### HU-5 — Aislamiento
- **Dado** dos restaurantes
- **Cuando** uno lista productos
- **Entonces** no ve los del otro.

### HU-6 — CRUD desde el admin
- **Dado** un `owner`/`admin` en `/admin/{id}/productos`
- **Cuando** crea/edita/borra un producto (nombre, precio, categoría, descripción, imagen)
- **Entonces** se persiste vía `ProductServices` y la carta lo refleja al recargar;
  precio y nombre se validan en cliente.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/Product/search?search=` | `[Authorize]` | query opcional | `[Product]` | 401 |
| POST | `/api/v1/Product` | `[Authorize]` | `Product` | `Product` | 400 |
| PUT | `/api/v1/Product/{id}` | `[Authorize]` | `Product` | `Product` | 400, 404 |
| DELETE | `/api/v1/Product/{id}` | `[Authorize]` | — | `Product` | 404 |

Sin `search` devuelve todos del restaurante. `PUT` actualiza nombre, precio,
`categoryId`, descripción e imagen. Un `categoryId` ajeno o inexistente → `400`.

## 6. Modelo de datos

`Product` (`[Table("products")]`): `Id`, `Name`, `Price` (double),
`CategoryId` (`int?`, FK → `categories`), `Description` (string), `Image`
(string?), `RestaurantId`. En el wire viaja `categoryId` + `category`
(`{ id, name, restaurantId }` o `null`).

`Category` (`[Table("categories")]`): `Id`, `Name`, `RestaurantId` (ver
[categories.md](./categories.md)). El antiguo string `Category` fue **eliminado**.

## 7. Eventos en tiempo real

N/A (los productos no se sincronizan por hub; la carta se recarga al entrar).

## 8. Reglas de negocio y casos borde

- Todas las consultas filtran por `RestaurantId`; creates/updates lo estampan.
- `PUT` actualiza también `CategoryId`; un `categoryId` de otro restaurante → `400`.
- La carta solo muestra (no edita); `MenuContent` arma las pestañas desde la tabla
  de categorías (no desde los productos) y filtra por `CategoryId`.
- `Image` se muestra solo con el toggle "Mostrar imágenes" activo.

## 9. UI / Flujo

- `frontend/src/app/kitchen/[id]/carta/page.tsx`: carga `ProductServices.getAll()`
  y deriva `productCategories`.
- `frontend/src/app/kitchen/[id]/carta/MenuContent.tsx`: buscador, tabs de
  categoría, toggle de imágenes, grilla.
- `frontend/src/components/ProductCards.tsx`: tarjeta de producto.
- Selección en Mesas: `tableInformation.tsx` filtra `products` por nombre.
- `frontend/src/services/ProductServices.tsx`: `getAll`, `createProduct`,
  `editProduct`, `deleteProduct`.
- **Admin (CRUD):** `frontend/src/app/admin/[id]/productos/Productos.tsx` (listado
  con categoría/precio, modal crear/editar con `<select>` de categorías desde la
  tabla `categories` y campos opcionales). Ver [admin-panel.md](./admin-panel.md).

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `Products_AreIsolatedPerRestaurant` | `backend.Tests/RestaurantScopingTests.cs` | HU-5 |
| `ProductFromOtherRestaurant_CannotBeOrderedOnOwnTable` | idem | HU-4 |

*(No hay tests unitarios dedicados de `ProductController`; se cubre vía scoping.)*

## 11. Preguntas abiertas / Backlog

- [ ] Validar campos obligatorios y precio > 0 en el backend.
- [ ] Stock / disponibilidad y marcar agotado.
- [ ] Subida real de imágenes (storage) en vez de URL/base64.
- [ ] DTOs con validación en vez de bindear la entidad.
- [ ] Realtime (high/baja de producto → sincronizar carta).

> **Relacionadas:** [order-composition.md](./order-composition.md),
> [admin-panel.md](./admin-panel.md).
