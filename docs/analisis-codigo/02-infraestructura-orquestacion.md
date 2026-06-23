# Infraestructura Multi-Tenant y Orquestación del Bot

## 1. Inyección del TenantId

### 1.1 Extracción de la petición entrante

El `tenantId` se resuelve en dos capas:

**Capa 1 — Middleware** (`TenantContextMiddleware`):

```
HTTP Request
    ├─ Header: X-Tenant-Id: "tenant-123"  (preferido)
    │   O
    └─ Path param: /api/v1/tenant-123/...  (via :tenantId)
           │
           ▼
TenantContextMiddleware (req.tenantId = valor)
```

El middleware valida que el `tenantId` esté presente y lo adjunta a `req.tenantId`. Si falta, lanza `UnauthorizedException`. Se aplica a todas las rutas `api/v1/:tenantId/*` (webhooks de canales).

**Capa 2 — DTO de mensaje entrante**:

```typescript
// IncomingMessageDto contiene tenantId como campo propio
interface IncomingMessageDto {
  tenantId: string;
  channelType: 'WHATSAPP' | 'TELEGRAM' | 'WEB';
  channelId: string;
  messageId: string;
  text: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

### 1.2 Inyección hasta los servicios

```
req.tenantId
    │
    ├─► MessageRouterService.route(msg: IncomingMessageDto)
    │         │
    │         └─► msg.tenantId se pasa a todos los servicios
    │
    ├─► TenantConfigService.getTenantConfig(tenantId)
    │         │
    │         └─► Decrypt credentials y retorna TenantConfig
    │         └─► getPrismaClient(tenantId, dbUrl) → PrismaClient por tenant
    │
    ├─► ConversationSessionStore (Redis key: session:${tenantId}:${conversationId})
    │
    ├─► RateLimitGuard (key: tenant:${tenantId})
    │
    └─► ToolContext (todos los tool handlers reciben tenantId)
```

### 1.3 Pool de conexiones Prisma por tenant

```typescript
// TenantConfigService mantiene un Map privado
private readonly tenantPrismaPool = new Map<string, PrismaClient>();

getPrismaClient(tenantId: string, dbUrl: string): PrismaClient {
  if (!this.tenantPrismaPool.has(tenantId)) {
    const client = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    this.tenantPrismaPool.set(tenantId, client);
  }
  return this.tenantPrismaPool.get(tenantId)!;
}
```

Estrategia: **database-per-tenant**. Cada tenant tiene su propia base de datos. Las conexiones se crean lazily y persisten durante el ciclo de vida de la aplicación. En `onModuleDestroy` se desconectan todas.

---

## 2. Flujo completo mensaje → AgentRunner → tool calls → respuesta → canal

```
Canal (WhatsApp/Telegram/Web)
      │
      ▼
WebhookController
      │
      ├─ handleWhatsApp()  ──► parsing Meta WhatsApp Cloud API
      ├─ handleTelegram()  ──► parsing Telegram Bot API
      └─ handleWebMessage() ──► HTTP POST + SSE stream
              │
              ▼
MessageRouterService.route(IncomingMessageDto)
      │
      ├─► Deduplicación (messageId en Set in-memory)
      │
      ├─► TenantConfigService.getTenantConfig()
      │         └─► getPrismaClient(tenantId, dbUrl)
      │
      ├─► ConsentService.recordConsent()  (primer mensaje)
      │
      ├─► Lead: find/create por tenantId + channelId + channelType
      │
      ├─► Conversation: find/create (estados ACTIVE | HANDOFF_PENDING | WITH_OPERATOR)
      │
      ├─► [Si WITH_OPERATOR / HANDOFF_PENDING]
      │         │
      │         ├─► ConversationSessionStore.appendMessage()
      │         ├─► AuditLogService.record(MESSAGE_ROUTED_TO_OPERATOR)
      │         └─► return RoutingResult { routedTo: 'operator' }
      │
      ▼
AgentRunnerService.run(AgentRunInput)
      │
      ├─► ConversationSessionStore.getHistory()  ──► Redis
      │
      ├─► CommercialStageService.getStage()  ──► filtra herramientas disponibles
      │
      ├─► ToolRegistry.getSchemasForStage()
      │
      └─► LLM Loop (Anthropic, max 10 turnos)
              │
              ├─► [end_turn] ──► texto de respuesta
              │
              └─► [tool_use] ──► ToolRegistry.get(name).execute(ToolContext, input)
                                  │
                                  ├─► emit_stage_signal ──► CommercialStageService + ScoringService
                                  ├─► get_general_context ──► ContextBankService
                                  ├─► get_event_context ──► ContextBankService
                                  ├─► reserve_quota ──► QuotaService
                                  ├─► release_quota ──► QuotaService
                                  ├─► block_quota ──► QuotaService
                                  ├─► register_waiting_list ──► WaitingListService
                                  └─► request_human_handoff ──► HandoffManagerImpl
                              │
                              └─► ConversationSessionStore.setHistory() ──► Redis
                              └─► ConversationEventBusService.emit('bot_message') ──► SSE
      │
      ▼
[De vuelta en MessageRouterService]
      │
      ├─► ScoringService.applyEvent()  (transiciones de etapa)
      │
      ├─► CommercialStageService.processSignal()  (lógica de fallback)
      │
      ├─► [Si error de AgentRunner] HandoffManagerImpl.requestHandoff(fallo_tecnico)
      │
      ├─► [Si palabra clave de pago detectada] emit_stage_signal + handoff
      │
      ├─► [Si etapa SQL] mensaje de escalamiento obligatorio
      │
      ├─► AuditLogService.record(MESSAGE_PROCESSED)
      │
      └─► return RoutingResult
```

---

## 3. Los 8 Tool Handlers

### 3.1 Contexto compartido

```typescript
interface ToolContext {
  tenantId: string;
  leadId: string;
  conversationId: string;
  db: PrismaClient;
}
```

### 3.2 Formato de respuesta

```typescript
// Éxito
{ ok: true, data: T }

// Error
{
  ok: false,
  error: {
    code: 'VALIDATION_ERROR' | 'CONSENT_REQUIRED' | 'STAGE_PRECONDITION_FAILED' |
          'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMITED' | 'TEMPORARY_UNAVAILABLE' | 'INTERNAL_ERROR',
    message: string,
    retryable: boolean,
    details?: Record<string, unknown>
  }
}
```

---

### 3.3 `emit_stage_signal`

**Responsabilidad**: Emitir señales de transición de etapa comercial y persistir datos de contacto del lead.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `signal` | `string` | Sí | Una de: `conversacion_iniciada`, `nombre_capturado`, `correo_capturado`, `numero_capturado`, `pregunta_de_inscripcion_detectada`, `confirmacion_de_pago_pendiente`, `evento_cambiado` |
| `eventId` | `string` | Condicional | Requerido para señales dependientes de evento |
| `contactName` | `string` | Condicional | Requerido para `nombre_capturado` |
| `contactEmail` | `string` | Condicional | Requerido para `correo_capturado` (con formato válido) |
| `contactPhone` | `string` | Condicional | Requerido para `numero_capturado` |
| `interestedEvent` | `string` | No | Nombre del evento de interés |

**Salida**:

```typescript
{
  previousStage: CommercialStage;
  currentStage: CommercialStage;
  score?: number;
  nextAction?: string;  // Instrucción al LLM cuando datos de contacto completos
}
```

**Reglas**:
- Los datos de contacto se persisten en la tabla `lead` antes de procesar la señal.
- Cuando `numero_capturado` completa los 3 campos de contacto, el LLM recibe instrucción de emitir inmediatamente `pregunta_de_inscripcion_detectada` (REGLA B3).
- Las señales ignoradas por la etapa actual retornan `STAGE_PRECONDITION_FAILED`.

**Dependencias**: `CommercialStageService`, `ScoringService`

---

### 3.4 `get_general_context`

**Responsabilidad**: Leer el banco de contexto general de un tenant (catálogo, avisos legales, etc.).

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fields` | `string[]` | No | Campos específicos a recuperar. Si se omite, retorna todos. |

**Salida**:

```typescript
{
  context: Record<string, unknown>;
  updatedAt: string;  // ISO-8601
}
```

**Dependencias**: `ContextBankService`

---

### 3.5 `get_event_context`

**Responsabilidad**: Leer el banco de contexto para un evento específico.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `eventId` | `string` | Sí | ID del evento |
| `fields` | `string[]` | No | Campos específicos a recuperar |

**Salida**:

```typescript
{
  eventId: string;
  context: Record<string, unknown>;
  updatedAt: string;
}
```

**Dependencias**: `ContextBankService`

---

### 3.6 `reserve_quota`

**Responsabilidad**: Reservar un cupo temporal para un lead antes del pago.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `eventId` | `string` | Sí | ID del evento |
| `idempotencyKey` | `string` | Sí | Clave única para idempotencia |

**Salida**:

```typescript
{
  reservationId: string;
  expiresAt: string;
}
```

**Precondición**: La etapa comercial debe ser `PROSPECTO`. De lo contrario retorna `STAGE_PRECONDITION_FAILED`.

**Reglas**:
- La misma `idempotencyKey` produce el mismo resultado (dedupe).
- Si la reserva falla por conflicto, retorna `CONFLICT` (HTTP 409).

**Dependencias**: `QuotaService`, `CommercialStageService`

---

### 3.7 `release_quota`

**Responsabilidad**: Liberar una reserva temporal de cupo para un evento.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `eventId` | `string` | Sí | ID del evento |

**Salida**:

```typescript
{
  released: boolean;
}
```

**Dependencias**: `QuotaService`

---

### 3.8 `block_quota`

**Responsabilidad**: Bloquear/definitivamente confirmar un cupo después del pago.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `eventId` | `string` | Sí | ID del evento |
| `idempotencyKey` | `string` | Sí | Clave única para idempotencia |

**Salida**:

```typescript
{
  blocked: boolean;
}
```

**Precondición**: La etapa comercial debe ser `SQL`. De lo contrario retorna `STAGE_PRECONDITION_FAILED`.

**Dependencias**: `QuotaService`, `CommercialStageService`

---

### 3.9 `register_waiting_list`

**Responsabilidad**: Registrar a un lead en lista de espera cuando no hay cupo disponible.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `eventId` | `string` | Sí | ID del evento |
| `idempotencyKey` | `string` | Sí | Clave única para idempotencia |

**Salida**:

```typescript
{
  position: number;  // Posición en la lista de espera
}
```

**Precondición**: La etapa comercial debe ser `PROSPECTO` y no haber cupo disponible.

**Dependencias**: `WaitingListService`, `CommercialStageService`

---

### 3.10 `request_human_handoff`

**Responsabilidad**: Escalar la conversación a un operador humano.

**Entrada**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `reason` | `string` | Sí | Una de: `pago_pendiente`, `no_resuelto`, `peticion_del_usuario`, `politica`, `fallo_tecnico` |

**Salida**:

```typescript
{
  handoffId: string;
  queued: boolean;
}
```

**Dependencias**: `HandoffManager` (interfaz), `HandoffManagerImpl`

---

### 3.11 Disponibilidad de herramientas por etapa

| Etapa | Herramientas disponibles |
|-------|-------------------------|
| `LEAD` | `get_general_context`, `emit_stage_signal`, `request_human_handoff` |
| `MQL` | `get_general_context`, `get_event_context`, `emit_stage_signal`, `reserve_quota`, `register_waiting_list`, `request_human_handoff` |
| `PROSPECTO` | `get_general_context`, `get_event_context`, `emit_stage_signal`, `reserve_quota`, `release_quota`, `register_waiting_list`, `request_human_handoff` |
| `SQL` | `get_general_context`, `get_event_context`, `emit_stage_signal`, `block_quota`, `release_quota`, `request_human_handoff` |
| `CIERRE` | `get_general_context`, `request_human_handoff` |

---

## 4. Adaptadores de Canal

### 4.1 Arquitectura actual

Los tres adaptadores (`WhatsAppAdapter`, `TelegramAdapter`, `WebAdapter`) **no existen como clases separadas**. La lógica de canal está implementada directamente en `WebhookController`. La interfaz `IChatChannel` está definida pero no implementada.

### 4.2 WhatsApp — `handleWhatsApp()`

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `POST /:tenantId/webhook/whatsapp` |
| **API externa** | Meta WhatsApp Cloud API (webhook cloud-hosted) |
| **Autenticación** | Verificación GET con `WHATSAPP_VERIFY_TOKEN` (respuesta de challenge) |
| **Formato inbound** | Payload anidado Meta: `entry[0].changes[0].value.messages[0]` |
| **Parsing** | `from` (teléfono), `id` (messageId), `text.body`, `timestamp` |
| **Outbound** | No implementado — solo ack `{ status: 'ok' }` a Meta |

### 4.3 Telegram — `handleTelegram()`

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `POST /:tenantId/webhook/telegram` |
| **API externa** | Telegram Bot API vía webhook updates |
| **Autenticación** | Token del bot en URL; enrutamiento por `tenantId` en path |
| **Formato inbound** | Objeto estándar Telegram Update con campo `message` |
| **Parsing** | `message.message_id`, `message.from.id`, `message.text`, `message.date` |
| **Outbound** | No implementado |

### 4.4 Web — `handleWebMessage()`

| Aspecto | Detalle |
|---------|---------|
| **Endpoint envío** | `POST /:tenantId/messages` |
| **Endpoint SSE** | `GET /:tenantId/conversations/:convId/events` (stream) |
| **Autenticación** | Header `x-session-id` para sesión; `channelId` en body |
| **Formato inbound** | `{ channelId: string; text: string; messageId?: string }` |
| **Respuesta** | Objeto `RoutingResult` completo con `response`, `stage`, `score`, `leadId` |
| **SSE** | `ConversationEventBusService` (RxJS Subject) para eventos en tiempo real |

---

## 5. Operador Humano

### 5.1 Estados de conversación relevantes

| Estado | Significado |
|--------|-------------|
| `ACTIVE` | Bot atendiendo la conversación |
| `HANDOFF_PENDING` | Escalada, esperando que un operador la tome |
| `WITH_OPERATOR` | Un operador ha reclamado la conversación |
| `CLOSED` | Conversación cerrada (GANADO o PERDIDO) |

### 5.2 Algoritmo de priorización

```javascript
const STAGE_ORDER = { LEAD: 1, MQL: 2, PROSPECTO: 3, SQL: 4, CIERRE: 5 };

const sortConvs = (a, b) => {
  // 1. Conversaciones cerradas van al final de su grupo
  const cl = cerrada(a) - cerrada(b);
  if (cl !== 0) return cl;

  // 2. Conversaciones escaladas primero (HANDOFF_PENDING, WITH_OPERATOR = 1)
  const e = escalado(b) - escalado(a);
  if (e !== 0) return e;

  // 3. Etapa comercial mayor primero (SQL > PROSPECTO > MQL > LEAD)
  const s = (STAGE_ORDER[b.lead.currentStage] ?? 0) - (STAGE_ORDER[a.lead.currentStage] ?? 0);
  if (s !== 0) return s;

  // 4. Score mayor primero
  const sc = (b.lead.score ?? 0) - (a.lead.score ?? 0);
  if (sc !== 0) return sc;

  // 5. Más antigua primero (FIFO como desempate)
  return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
};
```

**Orden de prioridad (mayor a menor)**: Cerradas < Escaladas < Etapa (desc) < Score (desc) < FIFO

### 5.3 Asignación y devolución

- Un operador reclama una conversación en estado `HANDOFF_PENDING` enviándole un mensaje → transición a `WITH_OPERATOR` y se graba `assignedTo`.
- La devolución al bot (`returnToBot`) tiene una precondition: el lead **no** puede estar en etapa `SQL`. Si está en SQL, la devolución se bloquea y retorna `false`.

### 5.4 Lista de espera (separada de la cola de operadores)

Ordenada por: `score DESC`, luego `joinedAt ASC` (FIFO como desempate).

---

## 6. Componentes compartidos en `src/common/`

### 6.1 `RateLimitGuard`

Extiende `ThrottlerGuard` de NestJS. Usa `tenantId` como clave de rate limit (no IP) para aislamiento por tenant. La limitación se configura por plan a través de `TenantConfigService`.

### 6.2 `createRedis()`

Factory que crea clientes Redis con ioredis. Soporta:
- Configuración por variables de entorno (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`)
- Prefijo de key personalizable (para namespacing multi-tenant)
- Retry strategy con exponential backoff (max 3s)
- No crashea el proceso ante fallos de conexión

### 6.3 `HealthController`

Endpoint `GET /health` público (sin tenant). Retorna `{ "status": "ok", "ts": "<ISO>" }`. Usado por orquestadores (Kubernetes, load balancers).

---

## 7. Principios arquitectónicos aplicados

| Principio | Aplicación |
|-----------|------------|
| **SRP** | Cada servicio tiene una responsabilidad: MessageRouter routing, AgentRunner LLM loop, QuotaService cupos, etc. |
| **OCP** | Nuevas herramientas se agregan al `ToolRegistry` sin modificar lógica central |
| **ISP** | DTOs estrechos; un consumidor de quota no depende de NotificationService |
| **DIP** | El orquestador depende de interfaces (HandoffManager, ToolRegistry) y no de implementaciones concretas del LLM |
| **Principio central** | "El bot emite señales. El sistema ejecuta operaciones de dominio." El bot nunca accede a la base de datos ni ejecuta mutaciones directamente. |

---

## 8. Trazabilidad

| Clase | Caso de Uso | Responsabilidad |
|-------|-------------|-----------------|
| `MessageRouterService` | CU-COM-001 | Recibe webhook, crea conversación, resuelve tenant, asigna bot u operador |
| `AgentRunnerService` | CU-COM-002 | Ejecuta el loop LLM: mensaje → tool calls → respuesta |
| `HandoffManagerImpl` | CU-COM-001 | Gestiona transición bot↔operador y colas de atención humana |
| `ConversationSessionStore` | CU-COM-002 | Historial activo en Redis (TTL 24h) |
| `TenantConfigService` | CU-COM-001 | Resuelve configuración y credenciales por tenantId |
| `QuotaService` | CU-EVT-003 | Reserva, libera y bloquea cupos con atomicidad |
| `WaitingListService` | CU-EVT-001 | Registro y ordenamiento de lista de espera (score DESC, FIFO tiebreaker) |
| `ContextBankService` | CU-COM-003 | Puerta única de lectura/escritura a bancos de contexto |
| `CommercialStageService` | CU-COM-005 | Máquina de estados de etapa comercial y procesamiento de señales |
| `ScoringService` | CU-COM-005 | Recalcula score, detecta exploits |
| `ConsentService` | CU-COM-004 | Muestra avisos legales y registra consentimiento tácito |
| `AuditLogService` | CU-COM-001 | Log append-only con conversation_id y transaction_id |