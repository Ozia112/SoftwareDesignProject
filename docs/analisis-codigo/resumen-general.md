# Resumen general — Análisis de código (rama `claude-develop`)

## Propósito

Este documento sintetiza el análisis de código de la rama `claude-develop`, dividido en tres sub-issues (PSD-42, PSD-43, PSD-44) que cubren en conjunto los directorios `src/` y `prisma/`. No repite el detalle de cada módulo — para eso están los documentos `01`, `02` y `03` — sino que describe cómo se compone la arquitectura general, cómo se relacionan las capas entre sí y dónde el código real coincide o se desvía del blueprint documentado en [`ARCH-ESTRUCTURA-CODIGO`](../diseño/arquitectura/estructura-de-codigo.md).

El alcance, los criterios de aceptación y la división del trabajo están definidos en el issue padre PSD-41 (#108) y sus tres sub-issues PSD-42 (#109), PSD-43 (#110) y PSD-44 (#111).

## Documentos fuente

| Documento | Cubre | Sub-issue |
| --- | --- | --- |
| [01-configuracion-prisma-demo.md](01-configuracion-prisma-demo.md) | Arranque de NestJS (`main.ts`, `app.module.ts`), schema de Prisma, migraciones, DTOs y la carpeta `demo/` | PSD-42 (#109) |
| [02-infraestructura-orquestacion.md](02-infraestructura-orquestacion.md) | Multi-tenant (`src/tenant/`), capa de conversación, los 8 tool handlers, adaptadores de canal y operador humano | PSD-43 (#110) |
| [03-servicios-dominio-notificaciones.md](03-servicios-dominio-notificaciones.md) | Etapa comercial, scoring, banco de contexto, cupos, lista de espera, cancelación, notificaciones, auditoría y observabilidad | PSD-44 (#111) |

## Arquitectura general

El sistema es un orquestador SaaS multi-tenant construido en NestJS sobre el principio rector de `DDR-02`:

```txt
El bot emite señales. El sistema ejecuta operaciones de dominio.
```

En la práctica esto se traduce en tres capas que se llaman en cascada y que corresponden 1 a 1 con los tres sub-documentos:

```txt
Capa 1 — Base (doc 01)
  main.ts / app.module.ts / prisma/schema.prisma / demo/
        │
        ▼
Capa 2 — Infraestructura y orquestación (doc 02)
  tenant/ → conversation/ (MessageRouter, AgentRunner) → tools/ → channels/ → operator/
        │
        ▼
Capa 3 — Servicios de dominio, notificaciones y observabilidad (doc 03)
  commercial/ · context-bank/ · events/ · notifications/ · audit/ · observability/
```

- **Capa 1 (base):** `src/main.ts` levanta la aplicación (Swagger, CORS, validación global) y `src/app.module.ts` registra todos los módulos de dominio más la integración con Redis/Bull. `prisma/schema.prisma` define el contrato de persistencia (`Lead`, `Conversation`, `Reservation`, `WaitingListEntry`, `Event`, `StageHistory`, `AuditLog`, `TenantConfig`, `TenantCredential`) que las capas 2 y 3 consumen. `demo/` es el único consumidor externo que ejercita el sistema de punta a punta sin pasar por un canal real.
- **Capa 2 (infraestructura y orquestación):** resuelve **quién** habla (tenant, canal, lead) y **cómo** se procesa el turno conversacional. `MessageRouterService` es la única puerta de entrada de mensajes; delega en `AgentRunnerService`, que ejecuta el ciclo del LLM y despacha tool calls a través del `ToolRegistry`.
- **Capa 3 (dominio):** resuelve **qué pasa con el lead y el evento** cuando una tool call se ejecuta — transición de etapa, score, cupos, lista de espera, notificaciones — y deja constancia en auditoría y observabilidad.

Ninguna capa accede a la capa anterior en sentido inverso: los servicios de dominio (capa 3) no conocen detalles de canal ni de transporte (capa 2), y la capa 2 no conoce el formato de persistencia más allá del `PrismaClient` que la capa 1 expone por tenant.

## Relación entre módulos (vista consolidada)

| Módulo / Servicio | Ruta principal | Capa | CU | Detalle |
| --- | --- | --- | --- | --- |
| Bootstrap NestJS | `src/main.ts`, `src/app.module.ts` | 1 | — | [01](01-configuracion-prisma-demo.md#cómo-arranca-la-aplicación) |
| Schema Prisma | `prisma/schema.prisma`, `prisma/migrations/` | 1 | — | [01](01-configuracion-prisma-demo.md#qué-migraciones-hay) |
| Demo | `demo/seed/`, `demo/open-wa-bridge/`, `demo/gui/` | 1 | — | [01](01-configuracion-prisma-demo.md#qué-hace-la-carpeta-demo-flujos-principales) |
| `TenantConfigService` | `src/tenant/` | 2 | CU-COM-001 | [02](02-infraestructura-orquestacion.md#resolución-de-tenant-srctenant) |
| `MessageRouterService` | `src/conversation/` | 2 | CU-COM-001 | [02](02-infraestructura-orquestacion.md#messagerouterservice) |
| `AgentRunnerService` | `src/conversation/` | 2 | CU-COM-002 | [02](02-infraestructura-orquestacion.md#agentrunnerservice) |
| `ConversationSessionStore` | `src/conversation/` | 2 | CU-COM-002 | [02](02-infraestructura-orquestacion.md#conversationsessionstore) |
| `HandoffManagerImpl` | `src/conversation/` | 2 | CU-COM-001 | [02](02-infraestructura-orquestacion.md#handoffmanagerimpl) |
| 8 tool handlers | `src/tools/` | 2 | CU-COM-003/005, CU-EVT-001/003 | [02](02-infraestructura-orquestacion.md#tool-handlers-del-agente-srctools) |
| `WebhookController` (canales) | `src/channels/` | 2 | CU-COM-001 | [02](02-infraestructura-orquestacion.md#adaptadores-de-canal-srcchannels) |
| Operador humano | `src/operator/` | 2 | CU-COM-001 | [02](02-infraestructura-orquestacion.md#operador-humano-srcoperator) |
| `CommercialStageService` | `src/commercial/` | 3 | CU-COM-005 | [03](03-servicios-dominio-notificaciones.md#máquina-de-estados-comercial-srccommercialcommercial-stageservicets) |
| `ScoringService` | `src/commercial/` | 3 | CU-COM-005 | [03](03-servicios-dominio-notificaciones.md#calificación-continua-srccommercialscoringservicets) |
| `ContextBankService` | `src/context-bank/` | 3 | CU-COM-003 | [03](03-servicios-dominio-notificaciones.md#contexto-del-tenant-y-del-evento-srccontext-bankcontext-bankservicets) |
| `QuotaService` | `src/events/` | 3 | CU-EVT-003 | [03](03-servicios-dominio-notificaciones.md#gestión-de-cupos-srceventsquotaservicets) |
| `WaitingListService` | `src/events/` | 3 | CU-EVT-001 | [03](03-servicios-dominio-notificaciones.md#lista-de-espera-srceventswaiting-listservicets) |
| `CancellationService` | `src/events/` | 3 | CU-EVT-002 | [03](03-servicios-dominio-notificaciones.md#cancelación-de-inscripciones-srceventscancellationservicets) |
| `NotificationService` + jobs BullMQ | `src/notifications/` | 3 | CU-COM-006 | [03](03-servicios-dominio-notificaciones.md#notificaciones-y-jobs-asíncronos-srcnotifications) |
| `AuditLogService` | `src/audit/` | 3 | CU-COM-001 | [03](03-servicios-dominio-notificaciones.md#auditoría-srcauditaudit-logservicets) |
| Observabilidad (OTel + Prometheus) | `src/observability/` | 3 | — | [03](03-servicios-dominio-notificaciones.md#observabilidad-srcobservability) |

## Flujo end-to-end (capas 2 y 3 combinadas)

El recorrido completo de un mensaje, documentado en detalle en [02](02-infraestructura-orquestacion.md#flujo-end-to-end-del-mensaje) y [03](03-servicios-dominio-notificaciones.md#cómo-se-relacionan-estos-módulos-entre-sí), es:

1. Un canal (`WhatsApp`/`Telegram`/`Web`) entra por `WebhookController` y se normaliza a `IncomingMessageDto`.
2. `MessageRouterService` resuelve tenant y `PrismaClient` (capa 1→2), encuentra o crea `Lead`/`Conversation`, y decide si el turno lo atiende el bot o un operador humano.
3. Si lo atiende el bot, `AgentRunnerService` ejecuta el ciclo LLM y despacha tool calls (`src/tools/`) que llaman a los servicios de dominio de la capa 3: `CommercialStageService`, `ScoringService`, `ContextBankService`, `QuotaService`, `WaitingListService`, `HandoffManager`.
4. Cada operación de dominio relevante queda en `AuditLogService` (capa 3) y, si afecta cupos, puede encolar jobs BullMQ (`reservation-expiry`, `notification`) que retroalimentan a `NotificationService`.
5. La observabilidad (OpenTelemetry + Prometheus) instrumenta este recorrido de forma transversal, sin que ningún servicio de dominio dependa de ella directamente.

## Contraste con el blueprint arquitectónico (`ARCH-ESTRUCTURA-CODIGO`)

El blueprint en [`docs/diseño/arquitectura/estructura-de-codigo.md`](../diseño/arquitectura/estructura-de-codigo.md) (estado "Propuesto") definió la estructura objetivo antes de implementar. El análisis de `claude-develop` confirma que las capas y bounded contexts se respetaron, con estas diferencias puntuales detectadas en los sub-documentos:

| Punto del blueprint | Estado en `claude-develop` | Fuente |
| --- | --- | --- |
| Carpeta `src/tool-calls/` con DTOs y handlers `IToolHandler` | Implementada como `src/tools/` con 8 handlers concretos y un `ToolRegistry` | [02](02-infraestructura-orquestacion.md#tool-handlers-del-agente-srctools) |
| Adaptadores `IChatChannel` (`whatsapp.adapter.ts`, `telegram.adapter.ts`, `web-chat.adapter.ts`) | La interfaz `IChatChannel` existe pero no se implementa; el parseo de los tres canales vive directamente en `WebhookController`. Marcado como deuda técnica pendiente de refactor | [02](02-infraestructura-orquestacion.md#adaptadores-de-canal-srcchannels) |
| `database-per-tenant` vía Prisma versionado por el sistema | Confirmado: `TenantConfigService` mantiene un pool de `PrismaClient` por tenant, sin eviction policy explícita | [02](02-infraestructura-orquestacion.md#pool-de-conexiones-prisma-por-tenant) |
| Envelope tipado `ToolCallResult<T>` | Confirmado en los 8 tool handlers, con códigos de error estandarizados (`VALIDATION_ERROR`, `STAGE_PRECONDITION_FAILED`, etc.) | [02](02-infraestructura-orquestacion.md#tool-handlers-del-agente-srctools) |

## Riesgos transversales

Consolidando lo identificado en los tres documentos:

- **Configuración de demo dispersa:** la GUI y el bridge de WhatsApp usan valores codificados que pueden desincronizarse del backend ([01](01-configuracion-prisma-demo.md#riesgos-y-cosas-a-tener-en-cuenta)).
- **Adaptadores de canal no extraídos:** la lógica de `WhatsApp`/`Telegram`/`Web` vive en el controlador en lugar de en clases `IChatChannel` independientes, lo que dificulta agregar canales nuevos sin tocar el controlador ([02](02-infraestructura-orquestacion.md#adaptadores-de-canal-srcchannels)).
- **Estado en memoria de un solo proceso:** el contador de `exploitReincidente` en `ScoringService` vive en memoria del proceso y no sobrevive reinicios ni escala horizontalmente ([03](03-servicios-dominio-notificaciones.md#riesgos-y-cosas-a-tener-en-cuenta)).
- **Exportación de trazas síncrona:** `SimpleSpanProcessor` en `src/observability/tracing.ts` exporta cada span de forma síncrona, lo cual no escala a producción con volumen alto ([03](03-servicios-dominio-notificaciones.md#riesgos-y-cosas-a-tener-en-cuenta)).
- **Auditoría silenciosa:** `AuditLogService.record` traga errores de escritura para no bloquear el flujo principal, pero eso puede dejar huecos no detectados en el registro append-only ([03](03-servicios-dominio-notificaciones.md#riesgos-y-cosas-a-tener-en-cuenta)).
- **Desincronización Redis/DB en lista de espera:** no hay reconciliación automática entre el `Sorted Set` de Redis y la tabla `WaitingListEntry` ([03](03-servicios-dominio-notificaciones.md#riesgos-y-cosas-a-tener-en-cuenta)).

## Estado de los sub-issues

| Issue | Título | Estado | Entregable |
| --- | --- | --- | --- |
| #109 (PSD-42) | Análisis: Configuración base, Prisma y Demo | Cerrado | `docs/analisis-codigo/01-configuracion-prisma-demo.md` |
| #110 (PSD-43) | Análisis: Infraestructura multi-tenant y orquestación del bot | Cerrado | `docs/analisis-codigo/02-infraestructura-orquestacion.md` |
| #111 (PSD-44) | Análisis: Servicios de dominio, notificaciones y observabilidad | Cerrado | `docs/analisis-codigo/03-servicios-dominio-notificaciones.md` |

Con los tres entregables cerrados y este resumen general publicado, se cumplen los criterios de aceptación del issue padre PSD-41 (#108).

Fecha: 2026-06-25
