# MyKitchen — Especificaciones (spec-driven development)

Este directorio es la **fuente de verdad funcional** del proyecto: cada feature
tiene un spec que describe qué hace, para qué, su contrato de API, sus reglas de
negocio y sus criterios de aceptación.

El código es la implementación; el spec es la intención. Cuando discrepen, gana
el spec (y se corrige el código) o se actualiza el spec — nunca se dejan
desincronizados.

## Flujo de trabajo (spec-first)

1. **Antes de programar** una feature nueva o un cambio de comportamiento, se
   escribe/actualiza su spec en `docs/specs/`.
2. El spec define los **criterios de aceptación** (Dado/Cuando/Entonces) que se
   traducen en tests del backend (`backend.Tests/`).
3. Se implementa el código.
4. Se verifica: `dotnet test`, `npx tsc --noEmit`.
5. Se actualiza el estado del spec y `AGENTS.md` si cambió la arquitectura.

Para features existentes, los specs de abajo describen el **estado actual real**
(no lo deseado). Los pendientes se anotan en la sección *Preguntas abiertas /
Backlog* de cada spec.

## Índice de specs

### Plataforma (transversal)
| ID | Feature | Estado | Spec |
|---|---|---|---|
| SPEC-001 | Autenticación y sesión (registro, login, logout, cookie) | Implementado | [auth.md](./auth.md) |
| SPEC-002 | Multi-tenancy y roles (aislamiento por restaurante) | Implementado | [multi-tenancy.md](./multi-tenancy.md) |
| SPEC-003 | Sincronización en tiempo real (SignalR) | Implementado | [realtime.md](./realtime.md) |
| SPEC-004 | Navegación, layout y contextos globales | Implementado | [navigation-layout.md](./navigation-layout.md) |

### Cuenta y onboarding
| ID | Feature | Estado | Spec |
|---|---|---|---|
| SPEC-005 | Registro y perfil de restaurante | Implementado | [restaurant-onboarding.md](./restaurant-onboarding.md) |
| SPEC-006 | Gestión de usuarios / staff | Implementado (backend + UI Admin) | [staff-management.md](./staff-management.md) |

### Operación (salón / cocina)
| ID | Feature | Estado | Spec |
|---|---|---|---|
| SPEC-007 | Gestión de mesas | Implementado | [tables.md](./tables.md) |
| SPEC-008 | Composición de orden (borrador local en Mesas) | Implementado | [order-composition.md](./order-composition.md) |
| SPEC-009 | Cobro de orden (Procesar pago) | Implementado | [order-payment.md](./order-payment.md) |
| SPEC-010 | Historial de órdenes | Implementado | [order-history.md](./order-history.md) |
| SPEC-011 | Cocina (KDS en vivo) | Implementado | [kitchen-display.md](./kitchen-display.md) |

### Catálogo y otros
| ID | Feature | Estado | Spec |
|---|---|---|---|
| SPEC-012 | Carta / Productos (catálogo) | Implementado (backend + CRUD UI Admin) | [catalog.md](./catalog.md) |
| SPEC-013 | Gastos (Expenses) | Implementado (backend) · UI pendiente | [expenses.md](./expenses.md) |
| SPEC-014 | Sitio de marketing público | Implementado | [marketing-site.md](./marketing-site.md) |
| SPEC-015 | Panel de administración | En progreso (estructura standalone + Empleados/Productos/Categorías) | [admin-panel.md](./admin-panel.md) |
| SPEC-016 | Categorías de productos (entidad propia) | Implementado (backend + UI Admin + carta) | [categories.md](./categories.md) |

## Plantilla

Usar [`_template.md`](./_template.md) para cualquier spec nuevo.

## Convenciones

- **Idioma:** español (Rioplatense) para descripciones y criterios; nombres de
  código/endpoints/entidades se mantienen tal cual están en el código.
- **Un archivo por feature.** Si una feature crece demasiado, se parte en `-parte`
  o en specs separados con IDs propios.
- **Estado:** `Implementado` = el código refleja el spec; `En progreso` = parcial;
  `Borrador` = acordado pero sin código; `Backlog` = idea.
- Los endpoints usan el prefijo `/api/v1/<Controller>` y los enums viajan como
  string en el wire (`JsonStringEnumConverter`).
