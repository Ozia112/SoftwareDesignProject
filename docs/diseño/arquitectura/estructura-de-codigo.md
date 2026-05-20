# Estructura de codigo, stack tecnologico y justificacion

## Metadatos

- ID: ARCH-ESTRUCTURA-CODIGO
- Titulo: Estructura de codigo, stack tecnologico y justificacion
- Estado: Propuesto
- Ubicacion: `docs/diseño/arquitectura/estructura-de-codigo.md`
- Referencias:
  - [DDR-02 decisiones arquitectonicas del orquestador](../decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md)
  - [Estrategia de implementacion v2.0](/utils/estrategia%20de%20implementacion%20chat.md)

---

## Proposito

Este documento es el blueprint oficial para crear la estructura inicial del proyecto de codigo. Define carpetas, bounded contexts, convenciones, stack tecnologico, esquema Prisma base y comandos de ejecucion.

El principio rector sigue siendo:

```txt
El bot emite señales. El sistema ejecuta operaciones de dominio.
```

---

## Estructura replicable del repositorio

```txt
.
|-- src/
|   |-- app.module.ts
|   |-- main.ts
|   |-- audit/
|   |-- channels/
|   |-- commercial/
|   |-- context-bank/
|   |-- conversation/
|   |-- events/
|   |-- notifications/
|   |-- tenant/
|   `-- tool-calls/
|-- prisma/
|   |-- schema.prisma
|   |-- migrations/
|   `-- seed.ts
|-- docs/
|   |-- analisis/
|   |-- diseño/
|   `-- soporte/
|-- utils/
|   |-- scripts/
|   `-- fixtures/
|-- test/
|-- .github/
|   `-- workflows/
|       |-- ci.yml
|       `-- docs-graph.yml
|-- package.json
|-- pnpm-lock.yaml
|-- tsconfig.json
`-- README.md
```

### Razon de ser de cada carpeta

| Carpeta              | Razon                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/`               | Codigo fuente del orquestador SaaS. Contiene modulos NestJS por bounded context y contratos de tool calls. |
| `src/conversation/`  | Recepcion de mensajes, run loop del agente, handoff humano y estado efimero de conversacion.               |
| `src/commercial/`    | Etapa comercial, calificacion automatica y consentimiento comercial cuando aplique al flujo.               |
| `src/context-bank/`  | Puerta unica de lectura/escritura controlada a bancos de contexto general y de evento.                     |
| `src/events/`        | Operaciones de cupo, reserva, bloqueo, lista de espera y cancelacion pre-inicio.                           |
| `src/notifications/` | Notificaciones outbound, notificaciones por liberacion de cupo y jobs BullMQ.                              |
| `src/tenant/`        | Resolucion de tenant, credenciales, configuracion, conexiones PostgreSQL y modelo multi-tenant.            |
| `src/tool-calls/`    | DTOs, envelopes y handlers de herramientas que el bot puede invocar.                                       |
| `src/channels/`      | Adaptadores de canal como WhatsApp, Telegram o web chat.                                                   |
| `src/audit/`         | Registro append-only de acciones con `conversationId` y `transactionId`.                                   |
| `prisma/`            | Contrato de persistencia instalable en la base PostgreSQL del tenant.                                      |
| `docs/`              | Fuente de verdad de analisis, diseño, decisiones y soporte operativo.                                      |
| `utils/`             | Scripts auxiliares no productivos, fixtures locales y herramientas de mantenimiento.                       |
| `test/`              | Pruebas e2e, integracion y utilidades de testing.                                                          |
| `.github/workflows/` | CI/CD, validacion de docs, cobertura y regeneracion/verificacion del grafo documental.                     |

---

## Modulos NestJS por bounded context

Cada modulo tiene un limite explicito y deriva de DDR-02. Los servicios no deben cruzar responsabilidades mediante imports directos a implementaciones concretas; deben depender de interfaces o puertos.

| Modulo                | Servicios principales                                                        | CU rector                          | Ejemplos de archivos                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ConversationModule`  | `MessageRouter`, `AgentRunner`, `HandoffManager`, `ConversationSessionStore` | CU-COM-001, CU-COM-002             | `conversation/message-router.service.ts`, `conversation/agent-runner.service.ts`, `conversation/dto/inbound-message.dto.ts` |
| `CommercialModule`    | `CommercialStageService`, `ScoringService`, `ConsentService`                 | CU-COM-004, CU-COM-005             | `commercial/commercial-stage.service.ts`, `commercial/stage-policy.ts`, `commercial/dto/stage-signal.dto.ts`                |
| `ContextBankModule`   | `ContextBankService`                                                         | CU-COM-003                         | `context-bank/context-bank.service.ts`, `context-bank/ports/context-reader.port.ts`                                         |
| `EventsModule`        | `QuotaService`, `WaitingListService`, `CancellationService`                  | CU-EVT-001, CU-EVT-002, CU-EVT-003 | `events/quota.service.ts`, `events/waiting-list.service.ts`, `events/dto/reserve-quota.dto.ts`                              |
| `NotificationsModule` | `NotificationService`, jobs de BullMQ                                        | CU-COM-006, RF-EVT-03              | `notifications/notification.service.ts`, `notifications/jobs/reservation-expiry.processor.ts`                               |
| `TenantModule`        | `TenantConfigService`, resolucion de credenciales                            | CU-COM-001, RNF-01                 | `tenant/tenant-config.service.ts`, `tenant/tenant-context.middleware.ts`                                                    |
| `ToolCallsModule`     | `ToolRegistry`, handlers `IToolHandler`                                      | DDR-02                             | `tool-calls/tool-registry.service.ts`, `tool-calls/handlers/reserve-quota.handler.ts`                                       |
| `ChannelsModule`      | Adaptadores `IChatChannel`                                                   | CU-COM-001                         | `channels/whatsapp.adapter.ts`, `channels/telegram.adapter.ts`, `channels/web-chat.adapter.ts`                              |
| `AuditModule`         | `AuditLogService`                                                            | CU-COM-001                         | `audit/audit-log.service.ts`, `audit/dto/audit-entry.dto.ts`                                                                |

### Regla de dependencia entre modulos

```txt
channels -> conversation -> tool-calls -> servicios de dominio
tenant   -> todos los modulos por contexto inyectado
audit    -> usado por tool-calls y servicios con efectos
```

El bot no importa servicios de dominio ni repositorios. El bot solo produce mensajes y tool calls. El sistema valida precondiciones, tenant, consentimiento, etapa e idempotencia antes de ejecutar operaciones.

---

## Contratos de archivos por modulo

Una carpeta de modulo debe poder leerse con esta forma base:

```txt
src/events/
|-- dto/
|   |-- reserve-quota.input.ts
|   `-- reserve-quota.output.ts
|-- ports/
|   |-- quota-repository.port.ts
|   `-- waiting-list-repository.port.ts
|-- repositories/
|   `-- prisma-quota.repository.ts
|-- quota.service.ts
|-- waiting-list.service.ts
|-- cancellation.service.ts
|-- events.module.ts
`-- index.ts
```

Aplicar el mismo patron a los modulos con variaciones razonables:

- `dto/`: entradas y salidas explicitas para limites de servicio y tool calls.
- `ports/`: interfaces que el dominio consume.
- `repositories/`: adaptadores Prisma o persistencia concreta.
- `*.service.ts`: reglas de dominio y casos de uso internos.
- `*.module.ts`: wiring NestJS.
- `index.ts`: exportaciones publicas estrechas del modulo.

---

## Prisma schema inicial

El sistema no aloja la base de datos de negocio del tenant. El tenant provee PostgreSQL y credenciales; el sistema instala y versiona este esquema con Prisma.

```prisma
enum CommercialStage {
  LEAD
  MQL
  PROSPECTO
  SQL
  CIERRE
}

enum ConversationStatus {
  ACTIVE
  HANDED_OFF
  CLOSED
}

enum ReservationStatus {
  TEMPORARY
  CONFIRMED
  RELEASED
  EXPIRED
}

model Lead {
  id             String       @id @default(cuid())
  tenantId       String
  channelId      String
  name           String?
  phone          String?
  email          String?
  currentStage   CommercialStage @default(LEAD)
  score          Int          @default(0)
  consentAt      DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  conversations  Conversation[]
  reservations   Reservation[]
  waitingEntries WaitingListEntry[]
  stageHistory   StageHistory[]

  @@index([tenantId, channelId])
}

model Event {
  id              String       @id @default(cuid())
  tenantId        String
  name            String
  startsAt        DateTime
  capacity        Int
  availableQuota  Int
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  reservations    Reservation[]
  waitingEntries  WaitingListEntry[]

  @@index([tenantId, startsAt])
}

model Conversation {
  id          String             @id @default(cuid())
  tenantId    String
  leadId      String
  status      ConversationStatus @default(ACTIVE)
  assignedTo  String?
  createdAt   DateTime           @default(now())
  closedAt    DateTime?
  lead        Lead               @relation(fields: [leadId], references: [id])
  auditLogs   AuditLog[]

  @@index([tenantId, status])
}

model Reservation {
  id             String            @id @default(cuid())
  tenantId       String
  leadId         String
  eventId        String
  status         ReservationStatus @default(TEMPORARY)
  idempotencyKey String            @unique
  expiresAt      DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  lead           Lead              @relation(fields: [leadId], references: [id])
  event          Event             @relation(fields: [eventId], references: [id])

  @@index([tenantId, eventId, status])
}

model WaitingListEntry {
  id        String   @id @default(cuid())
  tenantId  String
  leadId    String
  eventId   String
  score     Int
  joinedAt  DateTime @default(now())
  notified  Boolean  @default(false)
  lead      Lead     @relation(fields: [leadId], references: [id])
  event     Event    @relation(fields: [eventId], references: [id])

  @@index([tenantId, eventId, score, joinedAt])
}

model StageHistory {
  id              String          @id @default(cuid())
  tenantId        String
  leadId          String
  previousStage   CommercialStage?
  currentStage    CommercialStage
  signal          String
  transactionId   String
  createdAt       DateTime        @default(now())
  lead            Lead            @relation(fields: [leadId], references: [id])

  @@index([tenantId, leadId, createdAt])
}

model AuditLog {
  id             String       @id @default(cuid())
  tenantId       String
  conversationId String
  transactionId  String
  actor          String
  action         String
  payload        Json?
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])

  @@index([tenantId, conversationId, createdAt])
  @@index([tenantId, transactionId])
}
```

Las migraciones viven en `prisma/migrations/` y deben ejecutarse contra la base del tenant durante instalacion o upgrade. `prisma/seed.ts` solo debe cargar datos de desarrollo o fixtures de prueba, nunca datos reales de un tenant.

---

## Stack tecnologico

### TypeScript + Node.js 20+

TypeScript permite que DTOs, tool calls y servicios compartan contratos estaticos. Esto reduce drift entre el contrato que ve el bot y la operacion que ejecuta el sistema. Node.js 20+ es suficiente para el run loop asincrono del agente, webhooks de canales, jobs y adaptadores HTTP sin introducir otra plataforma.

Alternativa descartada: Python con FastAPI. Es viable para agentes, pero este proyecto necesita fronteras de modulo, DI y convenciones empresariales fuertes desde el inicio. NestJS da mas estructura para mantener SOLID en un equipo pequeño sin construir un framework interno.

### NestJS

NestJS se adopta porque su modelo de modulos, providers, guards, pipes y DI encaja con bounded contexts documentados en DDR-02. Permite que `ConversationModule`, `CommercialModule`, `EventsModule` y `TenantModule` tengan limites visibles y testeables.

Alternativa descartada: Fastify puro o Express. Reducen overhead inicial, pero empujan al equipo a decidir manualmente estructura, inyeccion de dependencias y validacion. El costo de esa libertad aparece cuando crecen tool calls, canales y reglas de dominio.

### Prisma + PostgreSQL del tenant

Prisma se adopta porque el schema versionado puede ser contrato instalable para la base PostgreSQL que provee cada tenant. PostgreSQL aporta transacciones, indices, bloqueo y consistencia fuerte para reservas, inscripciones y auditoria.

Alternativas descartadas: MongoDB y DB alojada por el SaaS. MongoDB no es la mejor primera opcion para cupos e idempotencia con consistencia transaccional. Alojar todas las bases en el SaaS aumentaria costo operativo, superficie regulatoria y responsabilidad sobre PII.

### Redis + BullMQ

Redis se usa para sesion efimera de conversacion, idempotencia de tool calls y estructuras de baja latencia como prioridades temporales. BullMQ se usa para expiracion de reservas, reintentos de notificacion y jobs outbound.

Alternativa descartada: cron simple y reconstruccion de estado desde PostgreSQL en cada turno. Esa opcion es mas facil al principio, pero sube latencia, costo de tokens y riesgo de duplicar operaciones bajo reintentos.

### LLM SDK y canales

El proveedor LLM debe encapsularse detras de un puerto del `AgentRunner`. DDR-02 menciona Anthropic SDK como opcion inicial por tool use; la implementacion debe permitir que el tenant configure proveedor, modelo y API key sin cambiar el dominio.

Los canales se integran por adaptadores `IChatChannel`. WhatsApp, Telegram y web chat no deben filtrar detalles hacia servicios de dominio; solo transforman payloads externos a mensajes internos y respuestas internas a envios del canal.

---

## Decision de monorepo

El proyecto se mantiene como monorepo porque la implementacion debe leer y respetar RF, CU, RN, DDR y grafos documentales en el mismo cambio. Esto reduce divergencia entre documentacion y codigo, permite PRs con trazabilidad completa y hace que los agentes de IA puedan inspeccionar contexto documental y codigo sin cambiar de repositorio.

El costo del monorepo es que se requiere disciplina de carpetas, ownership y CI. Por eso `.github/workflows/` debe validar tanto pruebas de codigo como enlaces, formato y grafo documental.

---

## Comandos de ejecucion

Usar `pnpm` como gestor del repositorio.

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm run start:dev
pnpm test -- --coverage
```

Para entornos tenant, `DATABASE_URL` debe apuntar a la base PostgreSQL del tenant de desarrollo o a una base temporal de CI.

Variables minimas esperadas:

```txt
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
TENANT_CONFIG_SECRET=...
DEFAULT_LLM_PROVIDER=anthropic
```

---

## Convenciones de codigo

| Elemento                         | Convencion                                    |
| -------------------------------- | --------------------------------------------- |
| Clases, servicios e interfaces   | `PascalCase`                                  |
| Metodos, variables y propiedades | `camelCase`                                   |
| Constantes exportadas            | `UPPER_CASE`                                  |
| DTOs de entrada                  | `NombreOperacionInput` o `NombreOperacionDto` |
| DTOs de salida                   | `NombreOperacionOutput`                       |
| Puertos                          | `NombreRepositoryPort`, `NombreClientPort`    |
| Handlers de tool call            | `NombreToolHandler`                           |
| Tests unitarios                  | `*.spec.ts` junto al archivo probado          |
| Tests e2e                        | `test/*.e2e-spec.ts`                          |

Los resultados de tool calls deben usar envelopes tipados:

```ts
export type ToolCallOk<T> = { ok: true; data: T };
export type ToolCallErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    details?: Record<string, unknown>;
  };
};
export type ToolCallResult<T> = ToolCallOk<T> | ToolCallErr;
```

---

## Referencias a reglas de negocio y documentos fuente

El codigo no debe duplicar reglas sin enlazar su fuente documental. Para cualquier cambio de dominio, revisar primero:

| Tema                              | Fuente                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Etapa comercial y scoring         | `docs/analisis/modelos del problema/casos de uso/COM/CU-COM-005 Calificación automática y gestión de etapa comercial.md` |
| Reglas COM                        | `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md`                                                                 |
| Reglas EVT                        | `docs/analisis/reglas de negocio/EVT/catalogo-rn-evt.md`                                                                 |
| Cupos, reservas y lista de espera | `docs/analisis/modelos del problema/casos de uso/EVT/`                                                                   |
| Arquitectura del orquestador      | `docs/diseño/decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md`                                            |
| Grafo documental                  | `docs/soporte/mapa-nodos/nodos-docs.yaml`                                                                                |
