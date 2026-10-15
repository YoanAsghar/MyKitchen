# SPEC-015 · Panel de administración

- **ID:** SPEC-015
- **Área:** Admin
- **Estado:** En progreso (estructura standalone + Empleados/Productos/Categorías/Configuración implementados; resto de secciones en `ComingSoon`)
- **Última actualización:** 2026-10-14

## 1. Contexto y problema

La administración del restaurante (usuarios, catálogo, gastos, perfil) estaba
dispersa o sin pantalla: el `AdminPanel` original era un `<div>` vacío y las
mútaciones de `User`/`Product` existían solo en la API. Se necesita un lugar único,
independiente de la operación de salón, donde `owner`/`admin` gestionen el local.

## 2. Objetivo

Tener un panel de administración **standalone** en `/admin/{id}` (sin el `Navbar`
ni el chrome de la app) con secciones por área de gestión, arrancando con
**Empleados** y **Productos** con CRUD completo y rol `owner`/`admin`.

## 3. Alcance

**Incluye**
- Sección propia: `/admin/{id}`, con `layout.tsx` dedicado (sidebar + topbar
  móvil, logout, "Ir a mi restaurante"), fuera de `RootClientLayout`'s app chrome.
- Sidebar con sub-rutas: Panel, Empleados, Productos, Mesas, Historial/Ventas,
  Gastos, Reportes/Métricas, Categorías, Configuración.
- **Empleados**: listar, crear, editar (contraseña opcional) y eliminar usuarios,
  con asignación de rol (`user`/`owner`, más `admin` solo para admin global).
- **Productos**: listar, crear, editar y eliminar productos (nombre, precio,
  categoría, descripción, imagen) eligiendo la categoría desde un `<select>`.
- **Categorías**: listar, crear, editar y eliminar categorías (ver
  [categories.md](./categories.md)).
- **Configuración**: formulario con el perfil del restaurante (nombre, encargado,
  email, teléfono) editable por el `owner` (ver
  [restaurant-onboarding.md](./restaurant-onboarding.md)).
- Acceso por rol: gating `owner`/`admin` en el sidebar (los endpoints ya son
  manager-only en backend); la edición de Configuración es **solo `owner`**.

**No incluye (fuera de alcance, en backlog)**
- Mesas, Historial/Ventas, Gastos y Reportes/Métricas (hoy `ComingSoon`).
- Panel de super-admin cross-restaurant / multi-local.
- Facturación del SaaS / planes.

## 4. Historias de usuario y criterios de aceptación

### HU-1 — Acceso standalone sin navbar de la app
- **Dado** un usuario con sesión
- **Cuando** entra a `/admin/{id}`
- **Entonces** ve el panel con su propia sidebar/topbar (sin el `Navbar` de la app)
  y el sidebar marca como activa la sección de la URL.

### HU-2 — Acceso por rol
- **Dado** un usuario `user` (staff)
- **Cuando** intenta entrar a `/admin/{id}`
- **Entonces** aunque cargue la ruta, las APIs de mutación responden `403` (gating
  visual en sidebar + protección backend).

### HU-3 — Raíz con sesión: no redirige al local automáticamente
- **Dado** un usuario logueado
- **Cuando** entra a `/`
- **Entonces** siempre ve el landing `/home`, y desde el `MarketingNavbar` puede
  elegir "Ir a mi restaurante" (→ `/kitchen/{id}/mesas`) o, si es `owner`/`admin`,
  "Gestionar mi restaurante" (→ `/admin/{id}`).

### HU-4 — CRUD de empleados
- **Dado** un `owner`/`admin` en /admin/{id}/empleados
- **Cuando** crea, edita (con/sin nueva contraseña) o elimina un empleado y asigna rol
- **Entonces** se refleja vía `UserServices` respetando la normalización de rol y
  las protecciones del backend (owner no borrable por no-admin, sin auto-eliminación).

### HU-5 — CRUD de productos
- **Dado** un `owner`/`admin` en /admin/{id}/productos
- **Cuando** crea, edita o borra un producto
- **Entonces** el catálogo se actualiza (y la carta lo refleja al recargar).

### HU-5b — CRUD de categorías
- **Dado** un `owner`/`admin` en /admin/{id}/categorias
- **Cuando** crea, edita o borra una categoría
- **Entonces** se persiste vía `CategoryServices`; un duplicado o una categoría en
  uso devuelven `409` y se muestran al usuario.

### HU-5c — Configuración del restaurante
- **Dado** un `owner` en /admin/{id}/configuracion
- **Cuando** edita nombre, encargado, email o teléfono y guarda
- **Entonces** se persiste vía `RestaurantServices.update` (y, si cambia el email,
  también el login del owner); `409` en email en uso se muestra al usuario.
- **Y** si el rol no es `owner`, los campos se ven en modo lectura y no hay botón
  de guardar (el backend responde `403` con la política `OwnerOnly`).

### HU-6 — Navbar de la app
- **Dado** el `Navbar` de la app en una página de salón
- **Cuando** soy `owner`/`admin`
- **Entonces** veo **Admin** a la izquierda del botón de cerrar sesión, que lleva a
  `/admin/{restaurantId}`.

## 5. Contrato de API

Se reutilizan los endpoints existentes:

| Recurso | Endpoints |
|---|---|
| Usuarios | `GET/POST/PUT/DELETE /api/v1/User` (mutaciones `ManagerOnly`) |
| Productos | `GET/POST/PUT/DELETE /api/v1/Product` |
| Categorías | `GET/POST/PUT/DELETE /api/v1/Category` (mutaciones `ManagerOnly`) |
| Restaurante | `GET/PUT /api/v1/Restaurant` (perfil; PUT `OwnerOnly`, ver [restaurant-onboarding.md](./restaurant-onboarding.md)) |

Detalles en [staff-management.md](./staff-management.md) y [catalog.md](./catalog.md).

## 6. Modelo de datos

Sin cambios.

## 7. Eventos en tiempo real

N/A por ahora. Posible mejora futura: emitir high/baja de producto para sincronizar
la carta en vivo.

## 8. Reglas de negocio y casos borde

- **Rol:** la sidebar habilita "Gestionar mi restaurante"/Admin solo a
  `owner`/`admin`; al crear un empleado, el selector de rol ofrece `user`/`owner`
  y `admin` únicamente si el llamador es `admin` global (el backend re-normaliza).
- **Editar empleado con contraseña vacía** conserva el hash (regla de `EditUser`).
- **Eliminar** usa confirmación del navegador; backend protege owner/self.
- **Producto con precio inválido** no se envía (validación cliente: numérico ≥ 0);
  nombre obligatorio.
- **Categoría con nombre duplicado** (case-insensitive) o **en uso** (tiene
  productos) devuelve `409` y la UI lo muestra.
- `DELETE /User` del propio usuario → `400` backend; la UI lo permite pero el
  backend lo rechaza (mejora: ocultar el botón en el propio registro).

## 9. UI / Flujo

- Ruta y layout: `frontend/src/app/admin/[id]/layout.tsx` (sidebar con `usePathname`
  como activo; móvil usa topbar con `<select>` de secciones + botones restaurante/logout).
- Páginas:
  - `/admin/{id}` → `page.tsx` → `AdminPanel.tsx` (placeholder "Panel").
  - `/admin/{id}/empleados` → `Empleados.tsx` (CRUD + roles, `UserServices`).
  - `/admin/{id}/productos` → `Productos.tsx` (CRUD, `ProductServices`).
  - `/admin/{id}/categorias` → `Categorias.tsx` (CRUD, `CategoryServices`).
  - `/admin/{id}/configuracion` → `Configuracion.tsx` (perfil del restaurante,
    `RestaurantServices`; edición sólo `owner`, resto en modo lectura).
  - `/admin/{id}/{mesas,historial,gastos,reportes}` →
    `ComingSoon` (`admin/components/ComingSoon.tsx`).
- `RootClientLayout`: `/admin*` es standalone (requiere sesión, sin app chrome) y
  rebota `/admin/<otroId>` a `/admin/{restaurantIdSesión}`; el tab Admin del
  `Navbar` apunta a `/admin/{restaurantId}`. Además hace **guard de rol**: sólo
  `admin`/`owner` pueden renderizar el shell; un `user` (staff) es redirigido a
  `/kitchen/{restaurantId}/mesas` (mismo gate que el `ManagerOnly` del backend).
- `MarketingNavbar`: con sesión muestra "Ir a mi restaurante" y (si `owner`/`admin`)
  "Gestionar mi restaurante" → `/admin/{restaurantId}`.

## 10. Cobertura de tests

UI sin tests (no hay suite). Backend ya cubre las APIs utilizadas:
`UserControllerTests`, `RestaurantScopingTests` (productos), `RestaurantControllerTests`.
Verificación frontend por `npx tsc --noEmit`.

## 11. Preguntas abiertas / Backlog

- [ ] Construir secciones restantes: Mesas, Historial/Ventas, Gastos, Reportes/Métricas.
- [ ] Definir el **Panel** (resumen con métricas del local).
- [ ] Gate visual: ocultar eliminar/editar sobre la propia cuenta en Empleados.
- [x] Guard de ruta por rol en el layout admin (sólo `admin`/`owner`; staff → `/kitchen/{id}/mesas`).
- [ ] Subida real de imágenes de productos.

> **Relacionadas:** [staff-management.md](./staff-management.md),
> [catalog.md](./catalog.md), [restaurant-onboarding.md](./restaurant-onboarding.md),
> [navigation-layout.md](./navigation-layout.md), [marketing-site.md](./marketing-site.md).