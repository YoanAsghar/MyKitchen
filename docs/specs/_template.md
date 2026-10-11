# SPEC-XXX · <Nombre de la feature>

> Copiá este archivo a `docs/specs/<slug>.md` y completá cada sección.
> Borrá las notas entre `<!-- -->` al terminar.

- **ID:** SPEC-XXX
- **Área:** Plataforma | Cuenta | Operación | Catálogo | Marketing | Admin
- **Estado:** Implementado | En progreso | Borrador | Backlog
- **Dueño:** <quién>
- **Última actualización:** YYYY-MM-DD

## 1. Contexto y problema

<!-- Qué necesidad del negocio resuelve y por qué existe. 2-4 líneas. -->

## 2. Objetivo

<!-- Resultado esperado en una frase. Qué cambia para el usuario. -->

## 3. Alcance

**Incluye**
- ...

**No incluye (fuera de alcance)**
- ...

## 4. Historias de usuario y criterios de aceptación

<!-- Formato: Dado / Cuando / Entonces. Una por comportamiento verificable. -->

### HU-1 — <título>
- **Dado** <precondición>
- **Cuando** <acción>
- **Entonces** <resultado observable>

## 5. Contrato de API

| Método | Ruta | Auth | Request | Response | Errores |
|---|---|---|---|---|---|
| GET | `/api/v1/...` | `[Authorize]` | — | `...` | 401, 404 |

<!-- Detallar payloads relevantes con un ejemplo JSON si aporta. -->

## 6. Modelo de datos

<!-- Entidades/tablas, campos y relaciones que toca. Indicar migraciones necesarias. -->

## 7. Eventos en tiempo real

<!-- Eventos de SignalR emitidos/consumidos, payload y grupo destino. "N/A" si no aplica. -->

## 8. Reglas de negocio y casos borde

- ...

## 9. UI / Flujo

<!-- Archivos del frontend, ruta(s), estados y flujo principal. -->

## 10. Cobertura de tests

| Test | Archivo | Qué verifica |
|---|---|---|
| `NombreTest` | `backend.Tests/X.cs` | ... |

## 11. Preguntas abiertas / Backlog

- [ ] ...
