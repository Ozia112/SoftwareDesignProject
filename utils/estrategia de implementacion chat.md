# Estrategia de implementación — versión actualizada

> **Versión:** 2.0 · **Fecha:** 2026-05-12
> Esta sección reemplaza al chat de estrategia anterior en cuanto a decisiones vigentes.
> El historial del chat original se conserva al final del documento.

---

## 1. Diagnóstico de deudas documentales (pre-implementación obligatorio)

Antes de escribir una sola línea de código, los siguientes PSDs deben cerrarse porque definen contratos que el código tiene que implementar literalmente. Si el código se escribe contra documentación contradicha, habrá retrabajo.

| PSD    | Severidad | Qué cambia                                                                   | Impacto en código                                          |
| ------ | --------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| PSD-23 | Alta      | CU-COM-001 alcance de orquestación; CU-COM-002 terminología; CU-EVT-003 flujo de cupos | Define quién llama a QuotaService y cuándo                |
| PSD-24 | Alta      | RF-COM-01 y RF-EVT-01: el Sistema (no el bot) ejecuta asignaciones y verificaciones | Define el contrato `emit_stage_signal` vs. ejecutar directo |
| PSD-26 | Media     | RF-COM-02 calificación≠etapa; RF-EVT-02 momento de reserva (Prospecto, no MQL); RF-COM-08 nuevo | Define el disparador de `reserve_quota`                   |
| PSD-25 | Media     | Terminología RF-COM-03/04/05/06; CU-EVT-001 actor y verificador de etapa     | Impacta los mensajes del bot y los criterios de las tool calls |
| PSD-27 | Baja      | SLA de transición bot↔operador; patrón de mensaje de error de dominio; health-check | Impacta configuración de RNF verificables en CI            |

**Acción requerida:** abrir los PSDs 23–27 como Issues en GitHub y completarlos en el primer sprint antes del sprint de código.

---

## 2. Principio arquitectónico central

> **El bot emite señales. El sistema ejecuta operaciones de dominio.**

Este principio resuelve la raíz de las contradicciones documentadas en DDR-01, PSD-23 y PSD-24. Toda decisión de diseño debe validarse contra esta regla:

```
Bot:     conversacion_iniciada  →  Sistema: actualiza etapa a Lead
Bot:     datos_completados      →  Sistema: actualiza etapa a MQL
Bot:     pregunta_inscripcion   →  Sistema: actualiza etapa a Prospecto + reserve_quota
Bot:     pago_pendiente         →  Sistema: actualiza etapa a SQL + handoff a operador
Bot:     exploit_reincidente    →  Sistema: bloquea conversación
```

El bot **nunca** escribe en base de datos, **nunca** ejecuta transiciones comerciales por sí mismo, y **nunca** tiene credenciales de persistencia. Solo invoca tool calls que el orquestador procesa.

---

## 3. Mapa de servicios → casos de uso

Cada servicio tiene una responsabilidad directamente derivada de los CU documentados.

| Servicio                   | CU que implementa                      | Responsabilidad                                                                 |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| `MessageRouter`            | CU-COM-001 (asignación inicial)        | Recibe webhook del canal, crea conversación, asigna bot o enruta al operador    |
| `AgentRunner`              | CU-COM-002 (flujo conversación)        | Ejecuta el run loop del LLM: turno de mensaje → tool calls → respuesta al canal |
| `HandoffManager`           | CU-COM-001 (escalamiento y devolución) | Gestiona la transición bot→operador y operador→bot, mantiene cola priorizada    |
| `ConsentService`           | CU-COM-004                             | Registra consentimiento tácito al primer mensaje; bloquea datos antes de eso    |
| `CommercialStageService`   | CU-COM-005 (gestión de etapa)          | Máquina de estados Lead→MQL→Prospecto→SQL→Cierre; acepta señales del bot        |
| `ScoringService`           | CU-COM-005 (calificación automática)   | Calcula puntuación 0–20 en cada interacción; detecta exploits; aplica penalizaciones |
| `ContextBankService`       | CU-COM-003                             | Única puerta de acceso a lectura y escritura de bancos de contexto              |
| `QuotaService`             | CU-EVT-003                             | Reserva temporal, liberación, bloqueo definitivo de cupos con bloqueo atómico   |
| `WaitingListService`       | CU-EVT-001 + RF-EVT-06                 | Alta en lista de espera; orden por calificación, FIFO como desempate            |
| `NotificationService`      | RF-EVT-03 + CU-COM-006                 | N notificaciones por N vacantes; timeout y reintentos; notificaciones outbound  |
| `CancellationService`      | CU-EVT-002                             | Cancelación pre-inicio; libera cupo; notifica lista de espera                   |
| `AuditLogService`          | Transversal                            | Append-only con `conversation_id` + `transaction_id`; soporte de LFPDPPP       |
| `TenantConfigService`      | Multi-tenant                           | Resuelve credenciales cifradas del tenant (DB, LLM key, canal key) por `tenantId` |
| `ConversationSessionStore` | RNF-04                                 | Historial activo en Redis (TTL 30 min); checkpoint a DB al cerrar conversación  |

---

## 4. Tool calls del bot (contratos entre AgentRunner y los servicios)

Estas son las únicas operaciones que el bot puede invocar. Cada tool call es manejada por el orquestador; el bot nunca accede directo a los servicios de dominio.

```typescript
// Lectura de bancos de contexto (CU-COM-003)
get_general_context(fields?: string[])
get_event_context(event_id: string, fields?: string[])

// Señales de transición comercial (CU-COM-005) — el Sistema ejecuta la transición
emit_stage_signal(signal: 'conversacion_iniciada' | 'datos_de_contacto_completados' |
  'pregunta_de_inscripcion_detectada' | 'confirmacion_de_pago_pendiente' |
  'evento_cambiado')

// Gestión de cupos (CU-EVT-003) — solo cuando el Sistema ha confirmado la etapa Prospecto
reserve_quota(event_id: string)           // idempotency_key requerida
release_quota(event_id: string)           // libera reserva activa de la conversación
block_quota(event_id: string)             // bloqueo definitivo post-pago, solo SQL confirmado

// Lista de espera (CU-EVT-001)
register_waiting_list(event_id: string)   // solo Prospecto sin cupo disponible

// Escalamiento (CU-COM-001)
request_human_handoff(reason: string)     // bot emite señal; Sistema ejecuta asignación

// Privacidad (CU-COM-004)
check_consent_status()                    // retorna si el consentimiento está registrado
```

**Regla de idempotencia:** `reserve_quota`, `block_quota` y `register_waiting_list` aceptan un `idempotency_key` generado por el bot. El orquestador deduplica en la capa de persistencia antes de ejecutar la operación. Esto previene doble-reserva si el LLM reintenta la tool call tras un timeout de red.

---

## 5. Stack tecnológico recomendado

### Lenguaje: TypeScript (Node.js 20+)

**Por qué:** El SDK oficial de Anthropic (`@anthropic-ai/sdk`) es TypeScript-first con types completos para tool use. El modelo de async/await es natural para el run loop del agente. Un solo lenguaje para todo el backend elimina fricción de equipo.

**Alternativa descartada:** Python — viable con el SDK de Anthropic, pero NestJS (ver abajo) da más estructura SOLID out-of-the-box que FastAPI para este nivel de complejidad de servicios.

### Framework: NestJS

**Por qué:** Tiene DI container nativo que hace SOLID obligatorio por diseño. Los módulos se mapean 1:1 con los bounded contexts (ComercialModule, EventModule, ConversationModule, TenantModule). Incluye decoradores para validación, Swagger, guards de auth y pipes — todo lo que se necesita para una API SaaS multi-tenant sin librerías extra.

**Alternativa si se prefiere algo más ligero:** Fastify + Inversify (DI manual).

```bash
# Estructura de módulos NestJS sugerida
src/
  app.module.ts
  tenant/            # TenantConfigModule, TenantConfigService
  conversation/      # MessageRouter, AgentRunner, HandoffManager, ConversationSessionStore
  commercial/        # CommercialStageService, ScoringService, ConsentService
  context-bank/      # ContextBankService
  events/            # QuotaService, WaitingListService, CancellationService
  notifications/     # NotificationService (BullMQ jobs)
  audit/             # AuditLogService
  tools/             # Tool handlers (IToolHandler) — uno por tool call
  channels/          # Adaptadores de canal (IChatChannel): WhatsApp, Telegram, Web
```

### ORM y migraciones: Prisma

**Por qué:** TypeScript-first, migraciones versionadas con rollback (resuelve la debilidad de "ausencia de contrato de migración" identificada en el análisis anterior), soporte para URL de conexión dinámica por tenant, y schema como contrato instalable en la DB del tenant.

```prisma
// prisma/schema.prisma (instalable en DB del tenant)
model Lead {
  id              String   @id @default(cuid())
  tenantId        String
  channelId       String
  name            String?
  phone           String?
  email           String?
  currentStage    Stage    @default(LEAD)
  score           Int      @default(0)
  consentAt       DateTime?
  createdAt       DateTime @default(now())
  conversations   Conversation[]
  reservations    Reservation[]
  waitingEntries  WaitingListEntry[]
  stageHistory    StageHistory[]
}

model Conversation {
  id          String   @id @default(cuid())
  leadId      String
  tenantId    String
  status      ConvStatus
  assignedTo  String?  // operatorId o null (bot)
  createdAt   DateTime @default(now())
  closedAt    DateTime?
  lead        Lead     @relation(fields: [leadId], references: [id])
  auditLogs   AuditLog[]
}

model Reservation {
  id              String   @id @default(cuid())
  leadId          String
  eventId         String
  tenantId        String
  status          ReservationStatus  // TEMPORARY | CONFIRMED | RELEASED
  idempotencyKey  String   @unique
  expiresAt       DateTime?
  createdAt       DateTime @default(now())
  lead            Lead     @relation(fields: [leadId], references: [id])
}

model WaitingListEntry {
  id        String   @id @default(cuid())
  leadId    String
  eventId   String
  tenantId  String
  score     Int
  joinedAt  DateTime @default(now())
  notified  Boolean  @default(false)
  lead      Lead     @relation(fields: [leadId], references: [id])
  @@index([eventId, score, joinedAt])  // orden: score DESC, joinedAt ASC
}

model AuditLog {
  id              String   @id @default(cuid())
  tenantId        String
  conversationId  String
  transactionId   String
  actor           String   // BOT | SYSTEM | OPERATOR | ADMIN
  action          String
  payload         Json?
  createdAt       DateTime @default(now())
  conversation    Conversation @relation(fields: [conversationId], references: [id])
}
```

### Cache y colas: Redis + BullMQ

**Redis para:**
- `ConversationSessionStore`: historial activo de la conversación con TTL de 30 min (RNF-04). Evita reconstruir el historial completo desde DB en cada turno del bot.
- `WaitingListStore`: Sorted Set por `eventId` con score = calificación del lead (replica en memoria el índice de DB para consultas de prioridad de baja latencia).
- `IdempotencyStore`: deduplicación de tool calls con TTL de 24 h.

**BullMQ para:**
- `ReservationExpiryQueue`: job por reserva temporal con delay = TTL de la reserva. Libera cupo y notifica lista de espera al vencer.
- `NotificationQueue`: envío de N notificaciones por N vacantes liberadas, con retries y backoff exponencial.
- `OutboundNotificationQueue`: notificaciones de reactivación de CU-COM-006.

### LLM: Anthropic SDK (`@anthropic-ai/sdk`)

**Por qué:** El sistema está diseñado con el patrón de tool use de Anthropic como contrato. El tenant provee su propia API key; el sistema inyecta la key del tenant al instanciar el cliente Anthropic.

**Optimización de costos:** activar prompt caching en el system prompt del bot y en el banco de contexto general. El banco de contexto de evento se cachea por conversación (mismo contenido en múltiples turnos). Esto reduce el costo de tokens entre un 60–80% en conversaciones largas.

```typescript
// AgentRunner — run loop simplificado
const client = new Anthropic({ apiKey: tenant.llmApiKey });

const response = await client.messages.create({
  model: tenant.llmModel,          // el tenant elige su modelo
  system: buildSystemPrompt(),      // cacheado con cache_control: ephemeral
  messages: sessionHistory,         // de ConversationSessionStore (Redis)
  tools: toolRegistry.getSchemas(), // herramientas disponibles según etapa
  max_tokens: 1024,
});

// Si hay tool_use, procesar tool calls y continuar el loop
```

**Modelos soportados por el tenant:**
- `claude-haiku-4-5-20251001` — bot de producción (rápido, barato, suficiente para tool use)
- `claude-sonnet-4-6` — cuando se necesita mayor razonamiento en casos complejos
- El tenant configura su modelo en `TenantConfig`; el sistema no asume un modelo fijo.

### APIs de canales (IChatChannel)

```typescript
interface IChatChannel {
  tenantId: string;
  channelType: 'whatsapp' | 'telegram' | 'web';
  sendMessage(conversationId: string, text: string): Promise<void>;
  getWebhookHandler(): RequestHandler;  // Fastify/Express route handler
}
```

**WhatsApp:** Meta Business API (Cloud API). El tenant registra su propia WABA y phone number ID. El sistema recibe webhooks en `POST /api/v1/{tenantId}/webhook/whatsapp`.

**Telegram:** Telegram Bot API. Webhook en `POST /api/v1/{tenantId}/webhook/telegram`. El tenant provee su bot token.

**Web chat:** WebSocket o SSE sobre `GET /api/v1/{tenantId}/chat/stream`. El tenant embebe el widget en su sitio.

### Auth y seguridad

- **API del tenant:** JWT con `tenantId` en el payload. El `TenantContextMiddleware` inyecta el contexto en cada request.
- **Credenciales del tenant:** almacenadas cifradas en base de datos del sistema (no del tenant) con rotación explícita. El `TenantConfigService` resuelve las credenciales y las inyecta dinámicamente; nunca viajan en el payload de ninguna API.
- **RBAC:** Roles Bot, OperadorHumano, OperadorAdministrativo, AdminEvento, según RNF-01.

### Observabilidad: OpenTelemetry

Tracing distribuido por conversación: cada turno del bot, cada tool call, cada transición de etapa y cada operación de cupo genera un span. Esto permite calcular:
- Latencia P90/P99 por paso del flujo (RNF-02)
- Costo por conversación en tokens
- Tasa de handoff a humano
- Tasa de expiración de reservas

---

## 6. Plan de implementación revisado

### Fase 0: Normalización documental (1 semana, pre-código)

Cerrar PSDs 23, 24, 26 antes de comenzar. Son los que definen los contratos de código más críticos. PSD-25 y PSD-27 pueden cerrarse en paralelo durante la Fase 1.

**Entregable:** documentación sin contradicciones en los puntos de disparo de reserva, autoridad del bot vs. sistema, y trazabilidad de CU-EVT-003.

### Fase 1: Infraestructura base (2 semanas)

1. Inicializar proyecto NestJS + TypeScript
2. Configurar Prisma con el schema completo; script de migración instalable en DB del tenant
3. Configurar Redis + BullMQ
4. `TenantConfigModule`: resolución de tenantId, carga de credenciales cifradas, pool de conexiones PostgreSQL por tenant (PgBouncer o connection pool aislado por `tenantId`)
5. `ConversationSessionStore`: Redis store con TTL 30 min, serialización del historial de mensajes
6. `AuditLogService`: append-only, transaccional con cada operación de dominio
7. CI: lint, tests unitarios, migraciones en pipeline

**Entregable:** `POST /api/v1/{tenantId}/messages` recibe un mensaje, lo persiste y devuelve 200. Sin lógica de negocio aún.

### Fase 2: Servicios de dominio (2–3 semanas)

8. `ConsentService` (CU-COM-004): consent gate al primer mensaje
9. `CommercialStageService` (CU-COM-005): máquina de estados con las 4 señales de transición + reducción por `evento_cambiado`
10. `ScoringService` (CU-COM-005): cálculo continuo 0–20, penalizaciones, detección de exploits, señal `exploit_reincidente`
11. `ContextBankService` (CU-COM-003): lectura de bancos general y de evento; operaciones de escritura (`reserva_temporal`, `liberacion_reserva`, `bloqueo_cupo`, `registro_desuscripcion`)
12. `QuotaService` (CU-EVT-003): bloqueo atómico con `SELECT ... FOR UPDATE` o transacción con bloqueo optimista; idempotencia por `idempotency_key`
13. `WaitingListService` (CU-EVT-001 + RF-EVT-06): alta, consulta priorizada, verificación antes de notificar

**Entregable:** flujo principal de CU-COM-002 completo sin el bot (simulado con tool calls manuales).

### Fase 3: Orquestación del bot (2 semanas)

14. `ToolRegistry`: registro de `IToolHandler` por nombre de tool call; DI con NestJS
15. Implementar los 8 tool handlers del contrato definido en §4
16. `AgentRunner` (CU-COM-002): run loop con Anthropic SDK, integración con `ConversationSessionStore`, límite de turnos por conversación configurable
17. `MessageRouter` (CU-COM-001): webhook handlers por canal, routing a bot o bandeja humana
18. `HandoffManager` (CU-COM-001): escalamiento bot→operador, cola priorizada por score + SLA, devolución operador→bot
19. Adaptadores de canal: `WhatsAppAdapter`, `TelegramAdapter`

**Entregable:** conversación end-to-end completa (CU-COM-002 + CU-COM-001) en un canal real.

### Fase 4: Automatización operativa (1–2 semanas)

20. `ReservationExpiryJob`: BullMQ delayed job por reserva; libera cupo y encola notificación a lista de espera
21. `NotificationService` (RF-EVT-03): N notificaciones por N vacantes, timeout por notificación, reintento con backoff
22. `OutboundNotificationJob` (CU-COM-006): notificaciones de reactivación a cartera de clientes con consentimiento registrado
23. `CancellationService` (CU-EVT-002): cancelación pre-inicio por operador, liberación de cupo bloqueado por causas excepcionales

**Entregable:** reservas expiran automáticamente; lista de espera recibe notificaciones ordenadas por score.

### Fase 5: Observabilidad y hardening (1 semana)

24. OpenTelemetry: spans por turno de bot, tool call, transición de etapa, operación de cupo
25. Dashboard operativo: latencia P90, tasa de handoff, tasa de expiración de reservas, costo por conversación en tokens
26. `TenantCredentialService`: rotación de API keys sin downtime, revocación al cancelar tenant
27. Rate limiting por tenant (429 con retry-after)
28. Pruebas de carga: 50 conversaciones concurrentes, 10 mensajes de historial (RNF-02)

---

## 7. Cómo empezar a escribir código — primeros pasos concretos

### Paso 1: Crear el proyecto base

```bash
npx @nestjs/cli new saas-bot-orchestrator
cd saas-bot-orchestrator
npm install @nestjs/config @nestjs/swagger
npm install @anthropic-ai/sdk
npm install @prisma/client prisma
npm install ioredis bullmq @nestjs/bull
npm install -D @types/ioredis
npx prisma init
```

### Paso 2: Escribir el Prisma schema del tenant

Crear `prisma/schema.prisma` con los modelos del §5 (Lead, Conversation, Reservation, WaitingListEntry, AuditLog más Event, StageHistory, Inscription). Ejecutar `npx prisma migrate dev --name init` contra una base de datos PostgreSQL de desarrollo. Este archivo `.sql` generado es el script de instalación que el tenant ejecutará.

### Paso 3: Implementar TenantConfigModule primero

Este módulo es el primer bloque porque todos los demás dependen de él. Implementa la resolución de `tenantId` desde el header `X-Tenant-Id` del webhook y la carga de la URL de conexión PostgreSQL del tenant.

```typescript
@Injectable()
export class TenantConfigService {
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // Lee de tabla interna `tenant_configs` (DB del sistema, no del tenant)
    // Descifra credenciales con KMS o variable de entorno maestra
    // Cachea en Redis con TTL de 5 min para no ir a DB en cada request
  }

  getPrismaClient(tenantId: string): PrismaClient {
    // Pool de clientes Prisma por tenantId
    // Crea uno nuevo si no existe, reutiliza si ya existe
  }
}
```

### Paso 4: Implementar CommercialStageService con tests unitarios

Este es el servicio más crítico porque define las transiciones del glosario. Escribirlo primero con tests unitarios que cubran las 4 señales + `evento_cambiado` + que calificación nunca modifica etapa.

```typescript
// commercial/commercial-stage.service.ts
@Injectable()
export class CommercialStageService {
  async processSignal(
    tenantId: string,
    leadId: string,
    signal: StageSignal,
  ): Promise<StageTransitionResult> {
    const current = await this.getStage(tenantId, leadId);
    const next = this.stageTransitions[current]?.[signal];
    if (!next || next === current) return { changed: false, stage: current };
    await this.persistStage(tenantId, leadId, next);
    await this.auditLog.record(tenantId, { actor: 'SYSTEM', action: 'STAGE_TRANSITION', payload: { from: current, to: next, signal } });
    return { changed: true, stage: next };
  }
}
```

### Paso 5: Implementar el primer tool handler y AgentRunner

`EmitStageSIgnalHandler` es el tool handler más simple y demuestra el patrón completo:

```typescript
// tools/emit-stage-signal.handler.ts
@Injectable()
export class EmitStageSignalHandler implements IToolHandler {
  name = 'emit_stage_signal';

  async execute(params: { signal: StageSignal }, context: ToolContext) {
    const result = await this.stageService.processSignal(
      context.tenantId,
      context.leadId,
      params.signal,
    );
    return { success: true, newStage: result.stage };
  }
}
```

Una vez que este handler funciona, implementar `AgentRunner` con el run loop de Anthropic usando tool use. El primer test de integración debe ser: el bot recibe "Hola, me interesa el curso de contabilidad" y el sistema emite `conversacion_iniciada` → etapa Lead.

---

## 8. Verificación de alineación servicios → CU (checklist)

Usar esta tabla al implementar cada servicio para validar que cubre lo que el CU requiere:

| CU         | Servicio(s)                                    | Verificación clave                                                           |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| CU-COM-001 | MessageRouter + HandoffManager                 | Flujo A2 (devolución al bot) rechaza si está en etapa SQL                    |
| CU-COM-002 | AgentRunner + todos los tool handlers          | Flujo A1 (cambio de evento) libera cupo original antes de reservar el nuevo  |
| CU-COM-003 | ContextBankService                             | RN-COM-03-06 permite escritura desde CU-COM-002 **y** CU-EVT-003             |
| CU-COM-004 | ConsentService                                 | Bot no captura datos personales hasta que `check_consent_status` = true      |
| CU-COM-005 | CommercialStageService + ScoringService        | Calificación no modifica etapa; señal `exploit_reincidente` bloquea la conversación |
| CU-COM-006 | NotificationService + OutboundNotificationJob  | Requiere RF-COM-08 (creado en PSD-26) antes de implementar                   |
| CU-EVT-001 | WaitingListService                             | Solo acepta leads en etapa Prospecto; orden por score + FIFO                 |
| CU-EVT-002 | CancellationService                            | No referencia RF-EVT-04 para cancelaciones pre-inicio (corregir en PSD-26)   |
| CU-EVT-003 | QuotaService                                   | Flujo principal dispara reserva automáticamente al transicionar a Prospecto (no cuando el operador lo inicia manualmente) |

---

## 9. Resumen de decisiones técnicas

| Decisión                    | Elección                  | Alternativa considerada         |
| --------------------------- | ------------------------- | ------------------------------- |
| Lenguaje                    | TypeScript (Node.js 20+)  | Python                          |
| Framework backend           | NestJS                    | Fastify + Inversify             |
| ORM + migraciones           | Prisma                    | Drizzle + migraciones manuales  |
| Base de datos               | PostgreSQL del tenant     | MySQL (menor soporte de FOR UPDATE en Prisma) |
| Cache + colas               | Redis + BullMQ            | RabbitMQ                        |
| LLM                         | Anthropic (`@anthropic-ai/sdk`) | OpenAI (depende del tenant) |
| Observabilidad              | OpenTelemetry + Grafana   | Datadog (costo)                 |
| Auth multi-tenant           | JWT + TenantContextMiddleware | API Keys por tenant           |

---

# Chat de estrategia de implementación (historial)

User: Ayudame a crear una estrategia de implementación para el proyecto basado en la documentacion presentada, dame soluciones posibles problemas de factibilidad, estrategias que mejoren o eficienticen los costes operativos, computacionales y que mejoren la escalabilidad del proyecto.

GitHub Copilot: Optimizing tool selection... Voy a revisar rápidamente la documentación clave del repositorio para proponerte una estrategia de implementación aterrizada al contexto real del proyecto, incluyendo factibilidad, costos operativos/computacionales y escalabilidad. Ahora extraigo los artefactos más relevantes (README, requerimientos, casos de uso y workflow).Voy a cargar primero las instrucciones obligatorias del entorno y luego leeré los documentos troncales del proyecto para construir una estrategia viable y accionable.

Estrategia recomendada para este proyecto, basada en la documentación revisada en pipeline-operativo.md, Definiciones.md, DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md y contradicciones-cus.md:

**Objetivo Estratégico**
Implementar un sistema bot-comercial robusto donde:

1. La etapa comercial, la calificación y el estado operativo de cupo estén completamente separados.
2. El flujo bot a operador humano sea controlado por reglas observables.
3. El costo por conversación y por inscripción baje sin perder trazabilidad ni cumplimiento legal.

**Diagnóstico de Factibilidad (Problemas y Solución):**

1. Riesgo: Ambigüedad funcional entre documentos (COM-02, COM-07, EVT-07 y CUs).
Solución: Definir un único contrato de dominio en un documento de reglas ejecutables.  
    Qué incluir:
    - Máquina de estados comerciales.
    - Modelo de puntaje independiente.
    - Modelo operativo de vacante/reserva/inscripción.
    Resultado esperado: menos retrabajo y menos decisiones ad hoc por parte del equipo.

2. Riesgo: Inconsistencia en disparadores de privacidad y consentimiento.
    Solución: Diseñar un punto único de validación de consentimiento en la entrada de conversación y reutilizar ese estado en todos los CUs.

3. Riesgo: Lista de espera y notificaciones pueden generar sobrecosto operativo.  
    Solución: Política determinística obligatoria:
    - Orden por puntaje.
    - FIFO solo como desempate.
    - N notificaciones por N vacantes, con timeout y reintentos controlados.

4. Riesgo: Escalamiento masivo a operador humano en picos.
    Solución:
    - Umbrales de handoff por tipo de intención y por riesgo.
    - Bandeja priorizada por puntaje y SLA.
    - Plantillas de respuesta para acelerar cierre.

**Estrategia de Implementación por Fases:**

1. Fase 1. Normalización de reglas (1-2 semanas)
   - Congelar cambios funcionales nuevos.
   - Publicar un documento rector de reglas de negocio y transiciones.
   - Validar trazabilidad RF ↔ CU ↔ BPMN ↔ glosario.
Entregable: baseline funcional sin contradicciones.

2. Fase 2. Núcleo transaccional (2-3 semanas)
   - Implementar servicios de dominio separados:
     - Servicio de etapa comercial.
     - Servicio de calificación.
     - Servicio de cupo/reserva/lista de espera.
   - Agregar auditoría de eventos de negocio.
Entregable: flujo principal estable y auditable.

3. Fase 3. Automatización operativa (2 semanas)
   - Motor de notificaciones con colas y reintentos.
   - Scheduler para expiración de reservas.
   - Tablero de monitoreo de SLA.
Entregable: operación escalable sin intervención manual excesiva.

4. Fase 4. Optimización y escalado (continuo)
   - Afinar scoring y reglas con datos reales.
   - Introducir cache en lectura de eventos.
   - Ajustar partición por evento/canal para carga alta.

**Estrategias para Reducir Costos:**

1. Coste operativo
   - Definir catálogo de intents frecuentes y respuestas precompuestas.
   - Usar handoff solo en casos de alto valor o alto riesgo.
   - Reducir retrabajo documental con una matriz única de trazabilidad viva.

2. Coste computacional
   - Cachear catálogos de eventos y contexto de lectura intensiva.
   - Aplicar procesamiento asíncrono para notificaciones y expiraciones.
   - Evitar recalcular scoring completo en cada mensaje: usar actualización incremental.

3. Coste de mantenimiento
   - Contratos API estables entre módulos COM y EVT.
   - Versionado de reglas de negocio.
   - Pruebas de regresión sobre reglas de transición y prioridad.

**Arquitectura de Escalabilidad Recomendada:**

1. Separar en tres bounded contexts:
   - Comercial (etapa y scoring).
   - Operación de eventos (cupo/reserva/inscripción/lista).
   - Conversación (orquestación de canal y handoff).

2. Procesamiento orientado a eventos
   - Eventos clave: conversación iniciada, datos completados, intención de inscripción, reserva creada/expirada, vacante liberada, notificación enviada/respuesta.

3. Persistencia y concurrencia
    - Bloqueo optimista o transacciones para evitar sobreinscripción.
    - Idempotencia en notificaciones y cambios de estado.
    - Trazabilidad completa para auditoría legal y operativa.

**Métricas Clave (para controlar factibilidad y escalado):**

   1. Tiempo medio de respuesta bot.
   2. Tasa de handoff a humano.
   3. Tasa de conversión Lead a SQL.
   4. Tasa de expiración de reservas.
   5. Costo por conversación y costo por inscripción.
   6. Porcentaje de vacantes recuperadas vía lista de espera.
   7. Incidentes por contradicción de reglas (debe tender a 0).

**Plan 30-60-90 días:**

1. 30 días
   - Resolver contradicciones críticas.
   - Cerrar contrato único de reglas.
   - Probar flujo principal con casos límite.

2. 60 días
   - Activar notificaciones automáticas y expiración de reservas.
   - Integrar dashboard operativo.
   - Medir KPIs base.

3. 90 días
   - Optimizar scoring y handoff por datos reales.
   - Escalar por canal/evento.
   - Definir política de mejora continua mensual.

Si quieres, en el siguiente paso te puedo entregar una propuesta de backlog priorizado listo para crear Issues tipo PSD, Sprint y Weekly según su pipeline actual.

User: Quiero que me ayudes a diseñar la intercomunicacion del sistema con los principios SOLID, el sistema principalmente debe ser diseñado con mentalidad de API como saas para ser conectado a un servicio de interfaz hosteado para poder ser vendido a distintos negocios con las mismas necesidades. Habria que considerar la creacion de distintos serivicios con responsabilidades separadas, el orquestador que administre la recepcion de mensajes de chat, se los envie al bot y que el bot solicite informacion autorizada de la base de datos. La idea es que el sistema central sea el tool que pueda usar el agente de IA para poder trabajar en el entorno del sistema. conexion seria:
chat -pregunta del cliente-> sistema -manda la pregunta al bot-> bot -solicita informacion al banco de contexto-> sistema -sistema hace el query-> base de datos -base de datos recopila y manda info-> sistema -se la manda al bot-> bot -le manda la respuesta al sistema para ponerlo en el chatt-> sistema -envia respuesta-> chat

GitHub Copilot: Voy a revisar la estructura de diseño existente antes de redactar el documento de arquitectura.  

Documento creado en arquitectura-del-sistema.md. Estos son los puntos clave del diseño:

---

**Flujo de comunicación implementado:**

El flujo exacto que describiste queda mapeado así:

```diagram
Chat → Orchestrator → BotAgent → [Tool Call] → Orchestrator → ContextBankService → DB
                                                            ← datos ←
               ← respuesta ← BotAgent ← datos ←
Chat ← Orchestrator ← respuesta
```

El **Orchestrator** es el único que toca la base de datos. El bot nunca tiene credenciales de persistencia — solo invoca *tool calls* autorizadas.

---

**SOLID aplicado:**

- **SRP**: 10 servicios con responsabilidad única cada uno (etapa comercial, scoring, cuotas, lista de espera, notificaciones, consentimiento, logs, etc.)
- **OCP**: nuevos canales de chat → implementar `IChatChannel`; nuevas tool calls → registrar `IToolHandler` — sin tocar el orquestador.
- **LSP**: adaptadores de canal (WhatsApp, Telegram, web) son intercambiables.
- **ISP**: `IReadContextBank` (bot, solo lectura) separada de `IWriteContextBank` (solo admins).
- **DIP**: todos los servicios de alto nivel dependen de interfaces inyectadas, nunca de implementaciones concretas.

---

**Multi-tenant SaaS:**

Cada negocio cliente solo necesita:

1. Webhook de entrada `POST /api/v1/{tenantId}/messages`.
2. Configurar su banco de contexto (eventos, aviso legal, system prompt del bot).
3. Conectar su canal (ninguna lógica de negocio vive en el frontend).

El núcleo (scoring, staging, lista de espera, notificaciones) es compartido y reutilizable por todos los tenants.

Made changes.

User: Otra coas es que el sistema debe poder utilizar la base de datos del tenant por lo que debe ser con una aarquitectura concreta como sql o postgresql, es decir el sistema solo provee logica de orquestacion chat-bot-DB pero el proveer de credenciales de llm, api de canales de comunicacion y almacenamiento son responsabilidad del tenant

Tengo el documento completo. Voy a hacer las tres modificaciones necesarias en paralelo: (1) ajustar la visión general para dejar claro que el sistema es solo orquestación, (2) reescribir la sección multi-tenant para separar responsabilidades del tenant vs. el sistema, y (3) agregar una sección nueva de modelo de despliegue con la arquitectura concreta de base de datos.

Documento actualizado en arquitectura-del-sistema.md. Los tres cambios centrales son:

---

**1. Separación clara de responsabilidades:**

El sistema SaaS provee únicamente la lógica de orquestación. El tenant provee sus propios:

| Recurso                                  | Responsable |
| ---------------------------------------- | ----------- |
| LLM API Key + modelo                     | Tenant      |
| Canal API Key (WhatsApp, Telegram, etc.) | Tenant      |
| Instancia PostgreSQL                     | Tenant      |
| Frontend de chat                         | Tenant      |

---

**2. Base de datos: PostgreSQL del tenant con esquema estándar:**

El sistema instala su esquema sobre la DB del tenant, pero **nunca la aloja**. El `TenantConfigService` resuelve la cadena de conexión por `tenantId` desde un almacén seguro (Vault, env vars, Secrets Manager) — nunca viaja en el payload de ninguna API. Las tablas definidas son: `leads`, `events`, `reservations`, `inscriptions`, `waiting_list`, `conversations`, `stage_history`, `audit_log`.

---

**3. Diagrama de capas corregido:**

El diagrama ahora distingue visualmente con `╔══╗` los recursos propiedad del tenant (DB, LLM key, Canal key, Chat frontend) de los servicios `┌──┐` que provee el sistema SaaS, y muestra explícitamente que las queries al PostgreSQL van vía `TenantConfigService` con la cadena de conexión inyectada.

Made changes.

User: Esta estrategia tiene sentido tecnico, operativo, de costes y funcional? que errores o debilidades detectas respecto al estandar en el mercado? dificultades de implmentarlo? ventajas?

GitHub Copilot: Read [](file:///g%3A/Mi%20unidad/Repositorios/SoftwareDesignProject/docs/dise%C3%B1o/modelos%20de%20dise%C3%B1o/arquitectura-del-sistema.md#1-1), lines 1 to 80

Tengo suficiente contexto del documento completo de sesiones anteriores. Este es un análisis crítico completo:

---

## Análisis Técnico, Operativo, de Costes y Funcional

---

### Lo que está bien resuelto

**Técnico:**

- La separación de responsabilidades es correcta y alineada con SOLID. Tener `CommercialStageService` y `ScoringService` separados es la decisión correcta dado que el DDR-01 ya identificó esa mezcla como el error central del diseño.
- El patrón Tool Call para que el bot acceda a datos es el estándar actual del mercado (igual que lo hace OpenAI Function Calling, Anthropic Tool Use, LangChain Tools). Eliminar credenciales de DB del bot es una decisión de seguridad sólida.
- PostgreSQL como capa de datos del tenant es pragmático: es el motor relacional más adoptado en SaaS B2B, tiene soporte masivo en todas las nubes (RDS, Supabase, Neon, Railway) y las transacciones con bloqueo optimista que defines para `QuotaService` son exactamente lo correcto para prevenir sobreinscripción.

**Operativo:**

- El modelo "el tenant trae sus credenciales" reduce dramáticamente la responsabilidad regulatoria del SaaS: el sistema no almacena datos de personas interesadas, no maneja PII directamente, y puede argumentar que es un procesador de datos, no controlador.
- El `AuditLogService` como tabla inmutable en la DB del tenant es la posición correcta para cumplimiento legal mexicano (LFPDPPP) y facilita auditorías del propio tenant.

**Funcional:**

- El flujo chat → orquestador → bot → tool call → orquestador → DB → orquestador → bot → chat es coherente con cómo funcionan hoy los sistemas de agentes en producción (ej. Intercom Fin, Zendesk AI, Chatwoot + LLM).

---

### Debilidades y Errores detectados vs. Estándar de Mercado

**1. El Orchestrator está sobredimensionado (violación práctica de SRP):**

El documento asigna al `OrchestratorService`: enrutamiento de mensajes, validación de tool calls, resolución de tenant, gestión de handoff, publicación de respuestas al canal y coordinación de consentimiento. En la práctica esto lo convierte en un God Service. El estándar de mercado (LangChain, Botpress, Chatwoot) separa esto en al menos tres componentes:

- `MessageRouter` — enrutamiento puro de entrada/salida por canal.
- `AgentRunner` — ciclo de ejecución del agente (run loop, tool dispatch).
- `HandoffManager` — lógica de escalamiento humano.

Si no se separa, cualquier cambio en el canal afecta el ciclo del agente y viceversa.

**2. No hay manejo de estado de conversación en sesión (stateless incompleto):**

El documento dice que los servicios son stateless y que el estado vive en DB. Pero en el ciclo bot → tool call → tool response → respuesta final, el LLM necesita el historial de mensajes de la conversación en memoria (el "context window"). Si cada llamada va a DB a reconstruir el historial completo, la latencia se dispara y el costo de tokens también (se re-envía historial completo en cada turno). El estándar es tener una capa de **sesión efímera** (Redis, in-memory con TTL) para el historial activo, y persistir a DB solo al cerrar la conversación o en checkpoints.

**3. El esquema PostgreSQL es un monolito relacional en un dominio de alta concurrencia:**

La tabla `waiting_list` ordenada por score con FIFO como desempate, combinada con `reservations` con TTL automático, son dos patrones que bajo carga concurrente generan contención de locks en PostgreSQL puro. El estándar para listas de espera priorizadas en producción usa una estructura de datos dedicada: una **priority queue en Redis (Sorted Sets)** con la DB como respaldo persistente. Operar esto solo en PostgreSQL es viable a escala pequeña pero se convierte en cuello de botella al crecer.

**4. Ausencia de un contrato de migración de esquema:**

El documento define el esquema SQL pero no menciona cómo se despliega en la DB del tenant ni cómo se actualiza cuando el sistema evoluciona. El estándar es tener un sistema de migraciones versionadas (Flyway, Liquibase, o migraciones propias) que el tenant ejecuta al instalar o actualizar. Sin esto, la operación multi-tenant se vuelve inmanejable desde la primera actualización de esquema.

**5. No hay definición del contrato de idempotencia en tool calls:**

Si el bot genera una tool call `reserveQuota` y la red falla antes de recibir la respuesta, ¿el bot la reintentará? ¿el orquestador ejecutará la reserva dos veces? El documento menciona idempotencia como estrategia de escalabilidad pero no define cómo se implementa (ej. `idempotency_key` en cada tool call, deduplication en el orquestador). Esto es crítico especialmente en `reserveQuota`, `confirmReservation` e `registerWaitingList`.

**6. El modelo de credenciales del tenant carece de rotación y revocación:**

Se menciona que las credenciales se almacenan cifradas, pero no se define el ciclo de vida: ¿cómo rota el tenant su LLM API key sin downtime? ¿cómo se revoca el acceso si un tenant cancela? En producción esto requiere un `TenantCredentialService` con versionado de credenciales y actualización en caliente, lo cual no está documentado.

**7. Ausencia de observabilidad:**

No hay mención de tracing distribuido ni métricas operativas del ciclo bot. El estándar actual en SaaS de agentes incluye: trazas del ciclo agente (cuántos turnos, cuántas tool calls por conversación), latencia por paso del flujo, costo por conversación en tokens. Sin esto no es posible detectar cuándo un tenant está generando consumo anómalo ni optimizar el scoring incremental mencionado en la estrategia.

---

### Dificultades de Implementación

| Dificultad                                                                                                    | Impacto | Mitigación                                                               |
| ------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| El run loop del bot (múltiples tool calls por turno) es asíncrono y difícil de depurar                        | Alto    | Implementar tracing de herramienta por herramienta desde el inicio       |
| La expiración automática de reservas requiere un scheduler confiable con manejo de fallos                     | Alto    | Usar un job queue (BullMQ, Celery, pg_cron) en lugar de un cron simple   |
| Gestionar conexiones PostgreSQL por tenant de forma segura sin pool compartido                                | Medio   | Connection pooling por tenant con PgBouncer o pool de conexiones aislado |
| El esquema multi-tenant en DB del tenant requiere que el tenant otorgue permisos correctos                    | Medio   | Script de setup validado con checklist de permisos mínimos requeridos    |
| La detección de exploits del bot (patrones de manipulación) tiene alta tasa de falsos positivos en producción | Medio   | Reglas conservadoras al inicio, configurables por tenant                 |

---

### Ventajas Competitivas del Modelo

1. **Costo marginal casi cero para el SaaS** — al no alojar DB ni LLM, el sistema no paga por el uso de tokens ni por almacenamiento de datos de los tenants. El costo de escalar lo absorbe el tenant, no el proveedor del SaaS.

2. **Cumplimiento regulatorio simplificado** — el tenant es dueño de sus datos. El SaaS puede operar como procesador de datos bajo contrato de encargo, evitando ser controlador de datos bajo LFPDPPP o GDPR. Eso reduce el costo legal y de compliance significativamente.

3. **Portabilidad total** — el tenant puede migrar su DB, cambiar de LLM o cambiar de canal sin que el sistema central cambie. Esto es un argumento de venta fuerte frente a soluciones cerradas como Manychat o Respond.io.

4. **Extensibilidad sin retrabajo** — el patrón Tool Call + `IToolHandler` permite agregar nuevas capacidades al bot (cobros, calendarios, CRMs) registrando un handler nuevo, sin modificar el orquestador ni el agente. Esto reduce el costo de desarrollo de funcionalidades adicionales.

5. **Alineación con el mercado actual de agentes** — el modelo Tool Call como contrato entre el LLM y el sistema es exactamente el patrón que OpenAI, Anthropic y Google han estandarizado. Cualquier desarrollador familiarizado con LLM APIs puede entender e integrar el sistema sin curva de aprendizaje nueva.

---

### Recomendación de prioridad para resolver antes de implementar

1. Definir separación del `OrchestratorService` en al menos `MessageRouter` + `AgentRunner`.
2. Definir la capa de sesión efímera para el historial de conversación activa.
3. Especificar el mecanismo de idempotencia para tool calls de escritura.
4. Documentar el sistema de migraciones de esquema.

Los puntos 2 y 3 son los que con mayor probabilidad generarán bugs en producción si no se resuelven en diseño.
