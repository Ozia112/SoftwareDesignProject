# 02 - Infraestructura multi-tenant y orquestación del bot

## Resolución de tenant (`src/tenant/`)

- El `TenantConfigService` es la única puerta de entrada para resolver configuración de un tenant. Dado un `tenantId`, consulta primero Redis con la clave `tenant:config:{tenantId}` (TTL 300s). Si no hay caché, lee la tabla `tenantConfig` de la base de datos del sistema, desencripta las credenciales sensibles con `TenantCredentialService` y arma el objeto `TenantConfig` (`llmModel`, `systemPrompt`, `planType`, `maxRequestsMin`, credenciales desencriptadas).
- Mantiene un `Map<tenantId, PrismaClient>` en memoria con un cliente Prisma por tenant. La primera llamada a `getPrismaClient(tenantId, dbUrl)` crea el cliente y lo guarda; las llamadas siguientes devuelven el mismo cliente, evitando abrir conexiones redundantes. En `onModuleDestroy` cierra todas las conexiones activas.
- `PrismaSystemService` es el único cliente Prisma que apunta a la base de datos del sistema (donde viven `tenantConfig`, `tenantCredential` y `tenant`). Implementa `OnModuleDestroy` para desconexión ordenada.
- `TenantCredentialService` cifra y descifra credenciales con AES-256-GCM usando la clave maestra `ENCRYPTION_MASTER_KEY`. Los tipos de credencial soportados son `llm_api_key`, `db_url`, `whatsapp_token` y `telegram_token`. `revokeAll(tenantId)` marca como inactivas todas las credenciales del tenant; `getDecrypted` retorna `null` si la credencial no existe o está inactiva.
- `TenantContextMiddleware` extrae el `tenantId` de la cabecera `X-Tenant-Id` o, en su defecto, del path param `:tenantId`, y lo adjunta a `req.tenantId`. Si ninguno está presente, lanza `UnauthorizedException`. Está registrado en `ConversationModule` para las rutas `api/v1/:tenantId/*`.

## Pool de conexiones Prisma por tenant

- La estrategia es **database-per-tenant**: cada tenant tiene su propia base de datos y sus credenciales se almacenan cifradas en la base de datos del sistema. El `PrismaClient` por tenant se crea con la URL desencriptada en tiempo de resolución.
- El `tenantPrismaPool` se inicializa de forma perezosa. No hay eviction policy explícita: las conexiones viven durante todo el ciclo de vida de la aplicación y se cierran en `onModuleDestroy`. Esto es suficiente para un número acotado de tenants, pero requerirá una política de eviction si el número crece.
- El `tenantId` fluye desde la cabecera HTTP hasta el `PrismaClient` de la siguiente forma: `req.tenantId` (middleware) → `IncomingMessageDto.tenantId` (DTO) → `TenantConfigService.getTenantConfig(tenantId)` → `getPrismaClient(tenantId, dbUrl)`. Ningún servicio accede a la base de datos del tenant sin pasar por el `PrismaClient` resuelto.

## Componentes compartidos (`src/common/`)

- `RateLimitGuard` extiende `ThrottlerGuard` de NestJS. En `getTracker` retorna `tenant:${tenantId}` (tomado de `req.tenantId`, `req.params.tenantId` o `req.headers['x-tenant-id']` en ese orden) en lugar de la IP, de modo que el límite se aplica por tenant y no por origen. Devuelve 429 con cabecera `Retry-After`. La configuración del límite por plan se obtiene desde `TenantConfigService`.
- `createRedis(prefix?)` es la factory de clientes Redis. Usa ioredis con `lazyConnect: false`, retry con backoff exponencial (máx 3s) y manejadores de error que no crashean el proceso. Acepta un `keyPrefix` opcional que se antepone a todas las claves, útil para namespacing por ambiente.
- `HealthController` expone `GET /health` (público, sin tenant) y retorna `{ status: 'ok', ts }`. Lo usan Kubernetes y los balanceadores para readiness/liveness.

## Capa de conversación (`src/conversation/`)

### `MessageRouterService`

- Es el único punto de entrada para mensajes de cualquier canal. Su método `route(msg: IncomingMessageDto)` ejecuta la siguiente secuencia: deduplica por `messageId` (Set en memoria), resuelve `TenantConfig` y `PrismaClient` del tenant, busca o crea el `Lead` por `tenantId + channelId + channelType`, busca o crea la `Conversation` activa, registra consentimiento en el primer mensaje y, si la conversación ya está en estado `WITH_OPERATOR` o `HANDOFF_PENDING`, persiste el mensaje en Redis y retorna con `routedTo: 'operator'`.
- Si la conversación sigue siendo del bot, llama a `AgentRunnerService.run`. Si el runner lanza una excepción, atrapa el error, dispara `HandoffManager.requestHandoff` con `reason: 'fallo_tecnico'` y registra la auditoría del fallo. Esto garantiza que ningún error del agente deja al usuario sin respuesta.
- Después del run, aplica los eventos de scoring correspondientes a cada transición de etapa, ejecuta la lógica de fallback de `CommercialStageService.processSignal` y, si la etapa final es `SQL`, fuerza un mensaje de escalamiento al humano.

### `AgentRunnerService`

- Ejecuta el ciclo del LLM (CU-COM-002) con un máximo de 10 turnos. En cada turno: carga el historial desde `ConversationSessionStore.getHistory` (Redis, TTL 24h), obtiene la etapa actual desde `CommercialStageService.getStage`, filtra las herramientas disponibles por etapa con `ToolRegistry.getSchemasForStage`, recorta el historial a las últimas 20 entradas para evitar exceder el límite de tokens, y llama a `client.messages.create` del SDK de Anthropic.
- En `end_turn` extrae la respuesta de texto. Si la respuesta queda vacía tras tool calls, emite un prompt de recuperación para forzar un mensaje legible al usuario.
- En `tool_use` itera los bloques, despacha cada `tool_use` a `ToolRegistry.get(name).execute(toolContext, input)`, recoge los resultados, los empuja como un mensaje de rol `user` con bloques `tool_result`, refresca etapa y tools, y vuelve a llamar al LLM.
- Maneja errores específicos: timeout 408 retorna mensaje amigable; errores de crédito o auth 401 activan `escalateToHuman = true`. Al final persiste el historial con `setHistory` y emite un evento `bot_message` al `ConversationEventBusService` para los suscriptores SSE.
- Emite además eventos `tool_call`, `stage_change`, `escalation` y `error` con payloads estructurados, de modo que el frontend puede renderizar la conversación en tiempo real sin hacer polling.

### `ConversationSessionStore`

- Maneja el historial activo de cada conversación en Redis con la clave `session:{tenantId}:{conversationId}` y TTL de 86400 segundos (24h), alineado con RNF-04.
- `getHistory` retorna el array de mensajes; si el JSON está corrupto, retorna `[]` en lugar de lanzar excepción. `appendMessage` lee el historial, agrega el nuevo mensaje y reescribe con TTL renovado. `setHistory` reemplaza el array completo. `deleteSession` se usa al cerrar la conversación. `refreshTTL` renueva el TTL sin modificar contenido.
- Los mensajes del operador se almacenan con `role: 'assistant'` y `sender: 'operator'` para mantener el contrato del LLM intacto al renderizar el historial en prompts futuros.

### `HandoffManagerImpl`

- `requestHandoff(db, tenantId, leadId, conversationId, reason)` genera un `handoffId`, actualiza la conversación a `ConvStatus.HANDOFF_PENDING` y registra el evento `HANDOFF_REQUESTED` en `AuditLog`. Retorna `{ handoffId, queued: true }`.
- `returnToBot(db, tenantId, conversationId, operatorId)` aplica la guarda A2 de CU-COM-001: si el lead está en etapa `SQL`, rechaza la devolución y retorna `false`. En caso contrario, vuelve la conversación a `ACTIVE`, limpia `assignedTo` y registra `HANDOFF_RETURNED_TO_BOT`.

### `ConversationEventBusService`

- Bus de eventos en memoria basado en `Subject` de RxJS. `getStream(convId)` retorna un `Observable` que se suscribe al subject de la conversación; si no existe, lo crea. `emit(convId, event)` empuja un `MessageEvent` con tipo y datos a todos los suscriptores. Soporta múltiples pestañas de frontend conectadas a la misma conversación.
- Los tipos de evento soportados son `tool_call`, `stage_change`, `escalation`, `bot_message`, `error` y `api_call`. No hay persistencia: si no hay suscriptores en el momento de emitir, el evento se pierde.

## Tool handlers del agente (`src/tools/`)

- Los 8 tool handlers comparten un `ToolContext` con `tenantId`, `leadId`, `conversationId` y `db` (el `PrismaClient` del tenant resuelto por el router). El `tenantId` nunca viaja en la entrada de la tool: lo provee el orquestador por conversación. Esto cumple el principio de multi-tenant explícito definido en DDR-02.
- Todas las tools devuelven un `ToolCallResult<T>` con sobre `{ ok: true, data }` en éxito o `{ ok: false, error: { code, message, retryable, details } }` en error. Los códigos válidos son `VALIDATION_ERROR`, `CONSENT_REQUIRED`, `STAGE_PRECONDITION_FAILED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `TEMPORARY_UNAVAILABLE` e `INTERNAL_ERROR`.

### `emit_stage_signal`

- Recibe una señal de transición comercial y persiste los datos de contacto en la tabla `lead` antes de procesarla. Las señales aceptadas son `conversacion_iniciada`, `nombre_capturado`, `correo_capturado`, `numero_capturado`, `pregunta_de_inscripcion_detectada`, `confirmacion_de_pago_pendiente` y `evento_cambiado`. Las señales que dependen de evento (`pregunta_de_inscripcion_detectada`, `evento_cambiado`) requieren `eventId`.
- Para `nombre_capturado`, `correo_capturado` y `numero_capturado` exige los campos de contacto correspondientes (validación de formato de email con regex). Si la señal es ignorada por la etapa actual, retorna `STAGE_PRECONDITION_FAILED`. La regla B3 hace que cuando `numero_capturado` completa los tres campos, se devuelva un `nextAction` que indica al LLM emitir `pregunta_de_inscripcion_detectada` en el siguiente turno.
- Depende de `CommercialStageService` y `ScoringService`. Tras procesar la señal, recalcula el score y emite un evento `stage_change` al bus.

### `get_general_context`

- Lee el banco de contexto general del tenant a través de `ContextBankService`. Acepta un parámetro opcional `fields: string[]` para proyectar solo los campos solicitados; si se omite, retorna todo el contexto. Retorna `{ context, updatedAt }` con la fecha de última actualización.

### `get_event_context`

- Lee el banco de contexto de un evento específico. Requiere `eventId` (retorna `VALIDATION_ERROR` si falta) y acepta `fields` opcional. Retorna `{ eventId, context, updatedAt }`. Si el evento no existe, retorna `NOT_FOUND`.

### `reserve_quota`

- Reserva un cupo temporal para un evento. Requiere `eventId` y `idempotencyKey`. La precondición de etapa es `PROSPECTO`: en cualquier otra etapa retorna `STAGE_PRECONDITION_FAILED`. La idempotencia la garantiza `QuotaService` mediante la clave: si ya existe una reserva con esa clave en estado `TEMPORARY`, devuelve la existente. Si la reserva falla por conflicto de cupo, retorna `CONFLICT`. Retorna `{ reservationId, expiresAt }`.

### `release_quota`

- Libera una reserva temporal. Solo requiere `eventId`. No tiene precondición de etapa: se puede liberar desde `PROSPECTO` o `SQL`. Retorna `{ released: boolean }`.

### `block_quota`

- Convierte una reserva temporal en cupo confirmado (post-pago). Requiere `eventId` e `idempotencyKey`. La precondición de etapa es `SQL`: en cualquier otra retorna `STAGE_PRECONDITION_FAILED`. Retorna `{ blocked: boolean }`.

### `register_waiting_list`

- Inscribe al lead en la lista de espera del evento. Requiere `eventId` e `idempotencyKey`. Precondición: etapa `PROSPECTO` y sin cupo disponible. Retorna `{ position }` con la posición ordinal del lead en la lista.

### `request_human_handoff`

- Solicita escalamiento a operador. Requiere `reason` con uno de los valores: `pago_pendiente`, `no_resuelto`, `peticion_del_usuario`, `politica` o `fallo_tecnico`. Despacha a `HandoffManager.requestHandoff` y retorna `{ handoffId, queued: true }`.

### Disponibilidad de herramientas por etapa

| Etapa | Tools disponibles |
| --- | --- |
| `LEAD` | `get_general_context`, `emit_stage_signal`, `request_human_handoff` |
| `MQL` | `get_general_context`, `get_event_context`, `emit_stage_signal`, `reserve_quota`, `register_waiting_list`, `request_human_handoff` |
| `PROSPECTO` | `get_general_context`, `get_event_context`, `emit_stage_signal`, `reserve_quota`, `release_quota`, `register_waiting_list`, `request_human_handoff` |
| `SQL` | `get_general_context`, `get_event_context`, `emit_stage_signal`, `block_quota`, `release_quota`, `request_human_handoff` |
| `CIERRE` | `get_general_context`, `request_human_handoff` |

## Adaptadores de canal (`src/channels/`)

- Los tres adaptadores (`WhatsAppAdapter`, `TelegramAdapter`, `WebAdapter`) **no existen como clases separadas**: la lógica de parsing de cada canal vive directamente en `WebhookController`. La interfaz `IChatChannel` está definida pero no se implementa ni se inyecta en ningún módulo. Esto es deuda técnica pendiente de refactor.

### `WebhookController` — `handleWhatsApp`

- Expone `POST /:tenantId/webhook/whatsapp`. La verificación inicial (GET) responde al challenge de Meta usando `WHATSAPP_VERIFY_TOKEN`. El payload inbound sigue el formato anidado estándar de Meta: `entry[0].changes[0].value.messages[0]`, del que se extraen `from` (teléfono del remitente), `id` (messageId), `text.body` y `timestamp`. Se mapea a `IncomingMessageDto` con `channelType: 'WHATSAPP'` y metadata con `wabaId` y perfil del contacto.
- El outbound (enviar mensajes) no está implementado: el método solo responde con `{ status: 'ok' }` para confirmar la recepción. Mensajes no textuales retornan `{ status: 'ignored' }` y se descartan.

### `WebhookController` — `handleTelegram`

- Expone `POST /:tenantId/webhook/telegram`. El inbound es un objeto `Update` de la Telegram Bot API; se extraen `message.message_id`, `message.from.id`, `message.text` y `message.date`. Se mapea a `IncomingMessageDto` con `channelType: 'TELEGRAM'` y metadata con `chatId` y `username`.
- El outbound tampoco está implementado. Mensajes sin texto se ignoran.

### `WebhookController` — `handleWebMessage`

- Expone `POST /:tenantId/messages` para envío de mensajes desde el widget web y `GET /:tenantId/conversations/:convId/events` como stream SSE. El inbound espera `{ channelId, text, messageId? }`; si falta `messageId` se genera como `web-${Date.now()}`. La autenticación se basa en la cabecera `x-session-id` (sin auth real todavía).
- La respuesta HTTP retorna el `RoutingResult` completo: `conversationId`, `routedTo`, `response`, `stage`, `score`, `toolCallsExecuted`, `leadId` y `handoffTriggered`. El stream SSE se nutre del `ConversationEventBusService` para mostrar tool calls, cambios de etapa y mensajes del bot en tiempo real.

## Operador humano (`src/operator/`)

- Las conversaciones se identifican por estado (`ACTIVE`, `HANDOFF_PENDING`, `WITH_OPERATOR`, `CLOSED`). El endpoint `GET /:tenantId/operator/conversations/all` retorna todas las conversaciones agrupadas por evento, con priorización aplicada. `GET /:tenantId/operator/conversations` filtra solo las escaladas.
- La agrupación por evento resuelve primero la reserva del lead (TEMPORARY o CONFIRMED), luego la entrada en lista de espera y, como último recurso, hace matching por palabras clave contra el historial Redis y los `etiquetas` del contexto del evento.
- El algoritmo de ordenamiento (`sortConvs` en `operator.controller.ts`) aplica los siguientes criterios en cascada:

| Prioridad | Criterio | Dirección |
| --- | --- | --- |
| 1 | Conversaciones cerradas (CIERRE) | Al final de su grupo |
| 2 | Estado escalado (`HANDOFF_PENDING`, `WITH_OPERATOR`) | Primero |
| 3 | Etapa comercial (`LEAD=1` ... `CIERRE=5`) | Mayor primero |
| 4 | `lead.score` | Mayor primero |
| 5 | `updatedAt` | Más antiguo primero (FIFO) |

- La asignación se realiza cuando un operador envía el primer mensaje a una conversación en `HANDOFF_PENDING`: el estado pasa a `WITH_OPERATOR` y se graba `assignedTo`. La lista de espera tiene un endpoint separado (`GET /:tenantId/operator/events/:eventId/waitlist`) ordenado por `score DESC` y `joinedAt ASC`.
- El cierre (`POST /:tenantId/operator/conversations/:convId/close`) acepta `GANADO` o `PERDIDO`. Si es `GANADO`, la reserva temporal se confirma, se incrementan los contadores `confirmedQuota` y la etapa se mueve a `CIERRE` con `cierreResult` registrado.

## Flujo end-to-end del mensaje

```txt
Canal (WhatsApp/Telegram/Web)
  └─ WebhookController.parse → IncomingMessageDto
      └─ MessageRouterService.route
          ├─ TenantConfigService.getTenantConfig(tenantId)
          ├─ TenantConfigService.getPrismaClient(tenantId, dbUrl)
          ├─ Lead/Conversation: find or create
          ├─ ConsentService.recordConsent (primer mensaje)
          ├─ [WITH_OPERATOR|HANDOFF_PENDING]
          │     └─ SessionStore.appendMessage + audit + return
          └─ AgentRunnerService.run
              ├─ SessionStore.getHistory (Redis)
              ├─ CommercialStageService.getStage
              ├─ ToolRegistry.getSchemasForStage
              └─ LLM loop (max 10 turnos)
                  ├─ [end_turn]    → texto de respuesta
                  └─ [tool_use]    → ToolRegistry.execute
                      ├─ emit_stage_signal  → CommercialStage + Scoring
                      ├─ get_*_context      → ContextBank
                      ├─ reserve_quota      → QuotaService
                      ├─ release_quota      → QuotaService
                      ├─ block_quota        → QuotaService
                      ├─ register_waiting_list → WaitingListService
                      └─ request_human_handoff → HandoffManager
                  └─ SessionStore.setHistory (Redis) + EventBus.emit('bot_message')
          └─ ScoringService.applyEvent
          └─ CommercialStageService.processSignal (fallback)
          └─ [error] HandoffManager.requestHandoff('fallo_tecnico')
          └─ [SQL]  Mensaje de escalamiento forzado
          └─ AuditLogService.record('MESSAGE_PROCESSED')
          └─ return RoutingResult
```

## Cómo se relacionan estos módulos entre sí

- `MessageRouterService` es el único servicio que recibe mensajes externos; todos los demás servicios son llamados por él o por `AgentRunnerService` a través de tool calls.
- `TenantConfigService` y `ConversationSessionStore` son transversales: cualquier servicio de dominio puede necesitarlos para resolver un cliente Prisma o leer el historial.
- `HandoffManager` se inyecta en `MessageRouterService` (para errores técnicos) y en el tool handler `request_human_handoff` (para escalamientos solicitados). La interfaz es la misma en ambos casos.
- `ConversationEventBusService` solo lo consume `AgentRunnerService` (productor) y el `WebhookController` (consumidor SSE).
- El `ToolRegistry` es el punto único de despacho de tool calls: oculta la lista de handlers al LLM y aplica la política de qué tools están disponibles por etapa.

## Trazabilidad con casos de uso

| Clase / Servicio | CU | Responsabilidad |
| --- | --- | --- |
| `MessageRouterService` | CU-COM-001 | Recibe webhook, crea conversación, resuelve tenant, asigna bot u operador |
| `AgentRunnerService` | CU-COM-002 | Ejecuta el ciclo LLM: mensaje → tool calls → respuesta |
| `ConversationSessionStore` | CU-COM-002 | Historial activo en Redis con TTL 24h |
| `HandoffManagerImpl` | CU-COM-001 | Gestiona transición bot↔operador y colas de atención humana |
| `TenantConfigService` | CU-COM-001 | Resuelve configuración y credenciales por tenant |
| `CommercialStageService` | CU-COM-005 | Máquina de estados de etapa comercial |
| `ScoringService` | CU-COM-005 | Recalcula score 0-20, detecta exploits |
| `ContextBankService` | CU-COM-003 | Lectura/escritura de bancos de contexto (general y evento) |
| `QuotaService` | CU-EVT-003 | Reserva, liberación y bloqueo de cupos |
| `WaitingListService` | CU-EVT-001 | Registro y ordenamiento de lista de espera (score DESC, FIFO) |
| `ConsentService` | CU-COM-004 | Avisos legales y registro de consentimiento tácito |
| `AuditLogService` | CU-COM-001 | Log append-only con `conversationId` y `transactionId` |
