# 03 - Servicios de dominio, notificaciones y observabilidad

## Máquina de estados comercial (`src/commercial/commercial-stage.service.ts`)

- El `CommercialStageService` implementa la progresión de un lead a través de cinco etapas: `LEAD → MQL → PROSPECTO → SQL → CIERRE`. La tabla de transiciones válidas está definida estáticamente en `TRANSITIONS` y es la única fuente de verdad sobre qué señales avanzan qué etapas.
- Cuando el bot emite una señal (por ejemplo `nombre_capturado` o `pregunta_de_inscripcion_detectada`), el servicio busca si existe una transición válida desde la etapa actual. Si no existe, devuelve `changed: false` y registra un aviso en el logger sin lanzar excepción, lo que permite que el flujo conversacional continúe.
- Cada transición válida se ejecuta dentro de una transacción Prisma que actualiza `Lead.currentStage` y crea un registro en `StageHistory` con el `transactionId` correspondiente. Si el destino es `SQL`, también actualiza la conversación a `HANDOFF_PENDING` para que el operador tome el caso.
- La única señal que permite retroceso es `evento_cambiado`: desde `SQL` regresa a `PROSPECTO`, lo que cubre el caso en que el lead cambia de evento antes del cierre.
- Toda transición queda auditada en `AuditLog` con `actor: SYSTEM` y `action: STAGE_TRANSITION`.

## Calificación continua (`src/commercial/scoring.service.ts`)

- El `ScoringService` mantiene un puntaje 0–20 por lead. Los eventos que modifican el score están definidos en el mapa `SCORE_RULES`: acciones positivas como `contact_data_provided` (+3) o `payment_confirmed` (+5) y acciones negativas como `spam_detected` (-4) o `exploit_attempt` (-5).
- La calificación es independiente de la etapa: el puntaje no provoca transiciones ni avances de etapa; solo influye en la priorización de la lista de espera.
- Los intentos de manipulación (`exploit_attempt`) se acumulan en un `Map` en memoria por `tenantId:leadId`. Al segundo intento se activa la bandera `exploitReincidente`, que el consumidor puede usar para bloquear la conversación.
- Cada actualización de score queda auditada con `action: SCORE_UPDATE` e incluye el delta, el score anterior y si se detectó exploit reincidente.

## Contexto del tenant y del evento (`src/context-bank/context-bank.service.ts`)

- El `ContextBankService` es el único punto de acceso de lectura y escritura de contexto (CU-COM-003). Ningún otro servicio lee directamente `TenantConfig.contextData` ni `Event.contextData`.
- Para el contexto general del tenant lee de Redis primero (clave `ctx:general:{tenantId}`, TTL de 5 minutos) y, si no hay caché, consulta `TenantConfig` en la base de datos del tenant. Lo mismo aplica para el contexto de evento con clave `ctx:event:{tenantId}:{eventId}`.
- Expone métodos de invalidación explícita (`invalidateEventContext`, `invalidateGeneralContext`) que se deben llamar cuando se actualizan los datos del evento o del tenant para forzar la recarga desde la base de datos en la siguiente consulta.

## Gestión de cupos (`src/events/quota.service.ts`)

- El `QuotaService` maneja tres operaciones sobre cupos: reserva temporal, liberación y bloqueo definitivo (CU-EVT-003).
- La reserva (`reserveQuota`) usa `SELECT ... FOR UPDATE` vía `$queryRaw` para leer `totalQuota`, `reservedQuota` y `confirmedQuota` de forma atómica. Si `totalQuota - reservedQuota - confirmedQuota <= 0` lanza `ConflictException`. De lo contrario, incrementa `reservedQuota` y crea una `Reservation` con estado `TEMPORARY` dentro de la misma transacción Prisma.
- Inmediatamente después de la reserva, encola un job `expire` en la cola BullMQ `reservation-expiry` con un delay de 30 minutos, 3 reintentos y backoff exponencial.
- La idempotencia se garantiza mediante `idempotencyKey`: si ya existe una reserva con esa clave en estado `TEMPORARY`, se devuelve la reserva existente sin tocar la base de datos.
- El bloqueo definitivo (`blockQuota`) convierte una reserva `TEMPORARY` en `CONFIRMED`, decrementa `reservedQuota` e incrementa `confirmedQuota` en la misma transacción, evitando cualquier ventana donde el cupo quede descontado dos veces.
- La liberación por expiración (`expireReservation`) es llamada por el `ReservationExpiryProcessor` y solo actúa si la reserva sigue en estado `TEMPORARY`; si ya fue confirmada o liberada, no hace nada.

## Lista de espera (`src/events/waiting-list.service.ts`)

- El `WaitingListService` gestiona el orden de espera para un evento cuando no hay cupo disponible (CU-EVT-001). Solo los leads en etapa `PROSPECTO` pueden unirse.
- El orden combina score descendente y fecha de ingreso ascendente (FIFO como desempate). En Redis se almacena como un `Sorted Set` donde el score del conjunto es `lead.score * 1e10 - joinedAt.getTime()`, lo que garantiza el orden correcto con una sola clave numérica.
- La posición de un lead se consulta vía `ZREVRANK` en Redis (O(log N)) y cae de regreso a la base de datos si el lead no está en el conjunto.
- Antes de notificar a los candidatos (`getNextEligible`), el servicio verifica en la base de datos que cada lead siga siendo `PROSPECTO` y que su entrada esté en estado `WAITING`, descartando a quienes hayan cambiado de estado desde que se unieron.

## Cancelación de inscripciones (`src/events/cancellation.service.ts`)

- El `CancellationService` cubre el caso en que un operador anula una inscripción antes de que inicie el evento (CU-EVT-002).
- Busca la reserva activa del lead en el evento (estado `TEMPORARY` o `CONFIRMED`) y dentro de una transacción la marca como `RELEASED` y decrementa el contador correcto: `reservedQuota` si era temporal o `confirmedQuota` si ya estaba confirmada.
- Registra en auditoría con `actor: OPERATOR` y `action: INSCRIPTION_CANCELLED`, incluyendo el `operatorId` y el estado previo de la reserva.
- No dispara notificaciones directamente: la liberación del cupo es responsabilidad del flujo que llama a este servicio (el operador o el job de expiración).

## Notificaciones y jobs asíncronos (`src/notifications/`)

- El `NotificationService` coordina el envío de notificaciones a la lista de espera cuando se liberan vacantes. Al recibir `notifyWaitlistBatch(vacanciesFreed)`, consulta los siguientes elegibles y, por cada uno, marca su entrada como `NOTIFIED` en la base de datos, establece un `expiresAt` de 2 horas para aceptar y encola un job en la cola BullMQ `notification` con 3 reintentos y delay fijo de 10 minutos entre reintentos.
- El `ReservationExpiryProcessor` (`src/notifications/reservation-expiry.processor.ts`) escucha la cola `reservation-expiry`. Al procesar un job, llama a `QuotaService.expireReservation` para marcar la reserva como expirada y liberar el cupo, luego consulta el siguiente elegible en la lista de espera y le envía notificación.
- El `OutboundNotificationProcessor` (`src/notifications/outbound-notification.processor.ts`) escucha la cola `outbound-notification` y aplica dos filtros antes de enviar: verifica que el lead tenga `consentAt` registrado (CU-COM-004) y que no haya recibido una notificación outbound en los últimos 7 días consultando `AuditLog`. Si ambas condiciones se cumplen, registra `action: OUTBOUND_NOTIFICATION_SENT` en auditoría.

## Auditoría (`src/audit/audit-log.service.ts`)

- El `AuditLogService` es el registro append-only transversal del sistema. Todos los servicios de dominio lo usan para documentar cada operación relevante.
- Los campos de cada entrada son: `tenantId`, `conversationId`, `transactionId`, `actor` (`SYSTEM` u `OPERATOR`), `action` (string que identifica el tipo de evento) y `payload` (JSON con detalles específicos de la acción).
- El método `record` captura cualquier error de escritura sin relanzarlo, de modo que un fallo en auditoría no bloquea el flujo principal. El error se emite al logger para diagnóstico.
- El método `recordBatch` permite auditar múltiples eventos en una sola operación `createMany`, útil para procesos masivos.
- Las acciones que escriben en auditoría son: `STAGE_TRANSITION`, `SCORE_UPDATE`, `QUOTA_RESERVED`, `QUOTA_RELEASED`, `QUOTA_BLOCKED`, `WAITLIST_REGISTERED`, `WAITLIST_NOTIFICATION_SENT`, `INSCRIPTION_CANCELLED`, `OUTBOUND_NOTIFICATION_SENT`.

## Observabilidad (`src/observability/`)

- `src/observability/tracing.ts` inicializa el SDK de OpenTelemetry y debe importarse antes de cualquier otro módulo (está registrado en `main.ts`). Configura un `SimpleSpanProcessor` que exporta trazas en formato OTLP-HTTP al endpoint definido en `OTEL_EXPORTER_OTLP_ENDPOINT` (por defecto `http://localhost:4318`). La instrumentación incluye `HttpInstrumentation` para rastrear peticiones HTTP automáticamente.
- El `MetricsService` (`src/observability/metrics.service.ts`) expone métricas Prometheus en un `Registry` propio. Las métricas definidas son:

| Nombre | Tipo | Qué mide |
| --- | --- | --- |
| `bot_conversations_started_total` | Counter | Conversaciones iniciadas por tenant |
| `bot_conversations_transferred_total` | Counter | Transfers a operador (con razón) |
| `bot_conversations_closed_total` | Counter | Conversaciones cerradas |
| `bot_exploit_detected_total` | Counter | Intentos de manipulación detectados |
| `quota_reservations_expired_total` | Counter | Reservas expiradas por tenant y evento |
| `bot_token_cost_total` | Counter | Tokens acumulados por tenant y modelo |
| `bot_conversations_active` | Gauge | Conversaciones activas concurrentes |
| `bot_message_latency_ms` | Histogram | Latencia end-to-end de mensaje |
| `bot_tool_call_latency_ms` | Histogram | Latencia por tool call |
| `bot_llm_latency_ms` | Histogram | Latencia de llamada al LLM |

- El `MetricsController` expone el endpoint `GET /metrics` en el formato que Prometheus espera para scraping.

## Cómo se relacionan estos módulos entre sí

- `CommercialStageService` y `ScoringService` reciben la instancia `PrismaClient` del tenant como parámetro en cada llamada; no tienen acceso directo a la base de datos ni la crean ellos mismos.
- `QuotaService` depende de `AuditLogService` y de la cola BullMQ `reservation-expiry`. El job que encola es procesado por `ReservationExpiryProcessor`, que a su vez invoca `QuotaService` y `NotificationService`, creando un ciclo asíncrono controlado por BullMQ.
- `WaitingListService` depende de `AuditLogService` y de Redis directamente (a través de `createRedis`). Es consumido por `NotificationService` para obtener los siguientes elegibles.
- `AuditLogService` no tiene dependencias de dominio; es el único servicio que todos los demás inyectan.
- `ContextBankService` es independiente de los demás servicios de dominio; solo depende de Redis y de la instancia `PrismaClient` del tenant.

## Riesgos y cosas a tener en cuenta

- El contador de exploits en `ScoringService` (`exploitCount: Map`) vive en memoria del proceso. Si la aplicación se reinicia o escala horizontalmente con múltiples instancias, el contador se pierde o se desincroniza entre instancias. Un lead reincidente podría no ser detectado si sus mensajes caen en distintos pods.
- El `SimpleSpanProcessor` en `tracing.ts` exporta spans de forma síncrona en cada operación. En producción con volumen alto se recomienda cambiar a `BatchSpanProcessor` para no bloquear el hilo principal con cada exportación.
- La auditoría silencia sus errores para no interrumpir el flujo. Esto es correcto para disponibilidad, pero significa que puede haber huecos en el registro sin que nadie se entere. Sería conveniente emitir una métrica o alerta cuando falle `record`.
- La lista de espera en Redis puede desincronizarse con la base de datos si un proceso falla entre el `upsert` en DB y el `zadd` en Redis. No hay mecanismo de reconciliación automática; sería necesario un job periódico que recomponga el Sorted Set desde la tabla `WaitingListEntry`.

## Recomendaciones prácticas

- Mover el contador de exploits reincidentes de la memoria del servicio a un `Sorted Set` o `Hash` en Redis con TTL, para que sea consistente en despliegues multi-instancia.
- Reemplazar `SimpleSpanProcessor` por `BatchSpanProcessor` en el inicializador de OpenTelemetry antes de llevar la aplicación a carga real.
- Agregar un job de reconciliación periódico que compare `WaitingListEntry` (DB) con el `Sorted Set` de Redis y corrija diferencias.
- Registrar una métrica de fallo de auditoría (`audit_record_failed_total`) para visibilizar en el dashboard de Prometheus cuando el registro append-only pierde entradas.

Fecha: 2026-06-22
