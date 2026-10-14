# SPEC-016 · Categorías de productos

- **ID:** SPEC-016
- **Área:** Catálogo
- **Estado:** Implementado (backend + UI Admin + carta)
- **Última actualización:** 2026-10-13

## 1. Contexto y problema

La categoría de un producto era un **string libre** dentro de `Product`
(`Category`). Eso impedía administrarlas como entidad: no había forma de
crearlas, editarlas ni borrarlas, y la carta derivaba las pestañas de los
valores existentes. Se necesita una entidad `Category` propia, administrable y
ligada al restaurante, a la que los productos referencien.

## 2. Objetivo

Reemplazar el string `Product.Category` por una tabla `categories`
(una-a-muchos con productos), con CRUD scoped por restaurante y una pestaña
"Categorías" en el panel de administración; el alta/edición de productos elige
la categoría desde esa tabla.

## 3. Alcance

**Incluye**
- Entidad `Category` (`Id`, `Name`, `RestaurantId`).
- `Product.CategoryId` (nullable) → FK a `categories` (un producto puede quedar
  sin categoría).
- CRUD de categorías vía `/api/v1/Category`, scoped por restaurante.
- Pestaña **Categorías** en `/admin/{id}/categorias` (listar/crear/editar/borrar).
- El formulario de producto usa un `<select>` con las categorías del restaurante.
- Carta: pestañas derivadas de la tabla de categorías; filtrado por `CategoryId`.

**No incluye (fuera de alcance)**
- Disponibilidad/agotado por categoría, color/ícono, orden manual de categorías.
- Backfill de categorías: el string viejo se **descarta** (los productos existentes
  quedan sin categoría y el admin las recrea). Ver §6.
- Realtime (categorías/productos no se sincronizan por hub; se recargan al entrar).
- DTOs con validación (se sigue bindeando la entidad, como el resto del catálogo).

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Listar categorías (API)
- **Dado** un usuario autenticado
- **Cuando** hace `GET /api/v1/Category`
- **Entonces** recibe las categorías de su restaurante (orden por nombre).

### HU-2 — Crear categoría
- **Dado** un `owner`/`admin`
- **Cuando** crea una categoría con un nombre no vacío y único en su restaurante
- **Entonces** se persiste con su `RestaurantId`; un nombre duplicado → `409`;
  nombre vacío → `400`.

### HU-3 — Editar categoría
- **Dado** una categoría propia
- **Cuando** la renombra a un nombre libre
- **Entonces** se actualiza; si el nombre choca con otra de su restaurante → `409`;
  categoría ajena o inexistente → `404`.

### HU-4 — Borrar categoría
- **Dado** una categoría propia
- **Cuando** la borra
- **Entonces** si **tiene productos** → `409` (bloqueado); si no tiene → se elimina.

### HU-5 — Producto con categoría
- **Dado** una categoría propia
- **Cuando** crea/edita un producto con ese `categoryId`
- **Entonces** el producto queda vinculado; un `categoryId` ajeno/inexistente → `400`.
  `PUT` también actualiza la categoría (antes la ignoraba).

### HU-6 — Aislamiento por restaurante
- **Dado** dos restaurantes
- **Cuando** uno lista/edita/borra categorías
- **Entonces** no ve ni afecta las del otro; ids ajenos → `404`.

### HU-7 — Carta
- **Dado** categorías cargadas
- **Cuando** entro a la carta
- **Entonces** las pestañas salen de la tabla de categorías y filtran por
  `CategoryId` ("Todas" muestra todos).

### HU-8 — CRUD desde el admin
- **Dado** un `owner`/`admin` en `/admin/{id}/categorias`
- **Cuando** crea/edita/borra una categoría
- **Entonces** se persiste vía `CategoryServices`; los errores `409` (duplicado /
  en uso) se muestran al usuario.

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/Category` | `[Authorize]` | — | `[Category]` | 401 |
| POST | `/api/v1/Category` | `ManagerOnly` | `Category` | `Category` | 400, 409 |
| PUT | `/api/v1/Category/{id}` | `ManagerOnly` | `Category` | `Category` | 400, 404, 409 |
| DELETE | `/api/v1/Category/{id}` | `ManagerOnly` | — | `Category` | 404, 409 |

`Product` en el wire ahora expone `categoryId` y `category` (objeto
`{ id, name, restaurantId }` o `null`) en lugar del string `category`.

## 6. Modelo de datos

`Category` (`[Table("categories")]`): `Id`, `Name` (string), `RestaurantId` (int).

`Product` (`[Table("products")]`): se **elimina** `Category` (string) y se agrega
`CategoryId` (`int?`) + navegación `Category?`. Relación una-a-muchos
(`Category` → `Product`); nullable, así que borrar la columna no rompe filas.

Migración `AddCategoriesTable`: crea `categories`, agrega `products.CategoryId`
(nullable, FK), elimina `products.Category`. **Descarta** las categorías viejas
(decisión de producto): los productos quedan sin categoría hasta que el admin las
recree y reasigne.

## 7. Eventos en tiempo real

N/A.

## 8. Reglas de negocio y casos borde

- `Name` se guarda con `Trim`; unicidad **case-insensitive** por restaurante.
- Los ids del cliente nunca se confían: `RestaurantId` se estampa del claim; un
  `categoryId` de producto se valida contra el restaurante del caller.
- Borrar una categoría en uso devuelve `409` y no toca los productos.
- Las escrituras (`POST`/`PUT`/`DELETE`) están gated por `ManagerOnly`; la lectura
  queda abierta a cualquier autenticado (la carta la necesita).

## 9. UI / Flujo

- `frontend/src/models/category.tsx`, `frontend/src/services/CategoryServices.tsx`.
- `frontend/src/app/admin/[id]/categorias/Categorias.tsx` (+ `page.tsx`): CRUD con
  modal; muestra errores `409`.
- `frontend/src/app/admin/[id]/productos/Productos.tsx`: `<select>` de categorías.
- `frontend/src/app/kitchen/[id]/carta/page.tsx` + `MenuContent.tsx`: cargan
  categorías y arman las pestañas; filtran por `categoryId`.
- `frontend/src/components/ProductCards.tsx`: muestra `product.category?.name`.

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `GetCategories_ReturnsOwnCategories` | `backend.Tests/CategoryControllerTests.cs` | HU-1 |
| `CreateCategory_Valid_ReturnsOk` | idem | HU-2 |
| `CreateCategory_DuplicateName_ReturnsConflict` | idem | HU-2 |
| `CreateCategory_EmptyName_ReturnsBadRequest` | idem | HU-2 |
| `EditCategory_RenamesAndRejectsDuplicate` | idem | HU-3 |
| `DeleteCategory_WithProducts_ReturnsConflict` | idem | HU-4 |
| `DeleteCategory_WithoutProducts_RemovesIt` | idem | HU-4 |
| `Categories_AreIsolatedPerRestaurant` | idem | HU-6 |
| `CreateProduct_WithForeignCategory_ReturnsBadRequest` | idem | HU-5 |

## 11. Preguntas abiertas / Backlog

- [ ] Orden manual / posición de categorías.
- [ ] Disponibilidad y agotado por categoría.
- [ ] Realtime (alta/baja de categorías → sincronizar carta).
- [ ] DTOs con validación.

> **Relacionadas:** [catalog.md](./catalog.md), [admin-panel.md](./admin-panel.md),
> [order-composition.md](./order-composition.md).
