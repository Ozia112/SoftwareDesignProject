# Diagramas de Secuencia

Los diagramas de secuencia modelan las interacciones entre los actores del sistema a lo largo del tiempo, mostrando el orden en que ocurren los mensajes dentro de cada proceso. Se organizan en cuatro diagramas que cubren el ciclo completo del proceso comercial:

1. **Captación, consentimiento y transición a Prospecto** — cubre el inicio de la conversación, el registro del consentimiento tácito, la recopilación de datos de contacto y la transición de etapa desde Lead hasta Prospecto, incluyendo la verificación de cupo previa a la inscripción.
2. **Inscripción, reserva temporal, SQL y confirmación** — modela la reserva temporal de vacante, el control de vencimiento por temporizador, el escalamiento a operador humano en etapa SQL y los flujos de confirmación o rechazo de pago.
3. **Lista de espera y notificación por liberación de vacante** — describe el registro en lista de espera para eventos sin cupo disponible, el proceso de liberación de vacante y la notificación al siguiente Prospecto elegible.
4. **Cancelación pre-inicio e inscripción extemporánea** — cubre la cancelación de una inscripción confirmada antes del inicio del evento y la validación del avance del evento para permitir o bloquear inscripciones tardías.

En todos los diagramas se distingue entre `vacante` (lugar individual dentro del evento) y `cupo` (capacidad total del evento), de acuerdo con las definiciones establecidas en el glosario del sistema.

## 1. Captación, consentimiento y transición a Prospecto

- Diagrama:

![diagrama de secuencia 1](sequence-diagram-01-captacion-consentimiento-y-transicion-a-prospecto.svg)

- Codigo:

```plantuml
@startuml
title Captacion, consentimiento y transicion a Prospecto (clases/modulos reales)
autonumber
hide footbox

actor "Cliente potencial" as Cliente
participant "Canal de comunicación\n(WhatsAppAdapter)\nvida: app" as Canal
participant "MessageRouter\n(ConversationModule)\nvida: app" as Router
participant "ConsentService\n(CommercialModule)\nvida: app" as Consent
participant "ConversationSessionStore\n(ConversationModule)\nvida: app" as Session
database "Redis\nTTL sesion: 30 min (RNF-04)\nvida: infra" as Redis
participant "AgentRunner\n(ConversationModule)\nvida: app" as Runner
participant "LLM Client\n(SDK)\nvida: por turno" as LLM
participant "ToolRegistry\n(ToolCallsModule)\nvida: app" as Tools
participant "ContextBankService\n(ContextBankModule)\nvida: app" as Context
participant "CommercialStageService\n(CommercialModule)\nvida: app" as Stage
participant "ScoringService\n(CommercialModule)\nvida: app" as Score
participant "AuditLogService\n(AuditModule)\nvida: app" as Audit
database "PostgreSQL\n(DB operativa)\nvida: durable" as DB

note over Router,DB
Tiempo de vida (resumen):
- Servicios (Router/Runner/Tools/*Service): singleton del proceso (NestJS)
- Sesion conversacional: Redis con TTL 30 min
- Registros (lead, etapa, auditoria): DB durable
end note

Cliente -> Canal: Enviar mensaje inicial
Canal -> Router: webhook(inbound_message)

Router -> Session: load(conversation_id)
Session -> Redis: GET session:{conversation_id}
Redis --> Session: session (si existe)
Session --> Router: session

Router -> Consent: ensure_consent(conversation_id)
Consent -> Context: get_general_context([avisos_legal, tyc])
Context -> DB: SELECT avisos/tyc
DB --> Context: avisos/tyc
Context --> Consent: avisos/tyc
Consent -> DB: INSERT consentimiento
Consent -> Audit: append(consent_recorded)
Audit -> DB: INSERT audit_log

Router -> Runner: run_turn(inbound_message, session)
activate Runner
Runner -> LLM: prompt + session + politicas
activate LLM

LLM --> Runner: tool_call emit_stage_signal(conversacion_iniciada)
Runner -> Tools: dispatch(emit_stage_signal)
Tools -> Stage: apply_signal(conversacion_iniciada)
Stage -> DB: UPDATE etapa=LEAD
Stage -> Score: recalc_score(conversation_id)
Score -> DB: UPDATE score
Stage --> Tools: ok(etapa, score)
Tools --> Runner: ok
Runner -> LLM: tool_result(ok)

LLM --> Runner: tool_call get_event_context(event_id)
Runner -> Tools: dispatch(get_event_context)
Tools -> Context: get_event_context(event_id)
Context -> DB: SELECT evento + cupo_disponible
DB --> Context: evento + cupo
Context --> Tools: ok(evento, cupo)
Tools --> Runner: ok
Runner -> LLM: tool_result(evento, cupo)

alt cupo_disponible > 0
  LLM --> Runner: respuesta: "Hay cupo disponible..."
else cupo_disponible = 0
  LLM --> Runner: respuesta: "Evento lleno... lista de espera"
end

Runner -> Session: save(conversation_id, session')
Session -> Redis: SET session:{conversation_id} TTL=30min
Runner -> Canal: send_message(respuesta)
deactivate LLM
deactivate Runner

note right of Tools
El bot no llama servicios directo.
Solo produce tool calls; el orquestador valida
consentimiento, etapa e idempotencia.
end note

note right of Router
Alineado con:
CU-COM-004, CU-COM-005,
RF-COM-02, RF-COM-03,
RF-COM-07 y RF-EVT-01.
end note
@enduml
```

## 2. Inscripción, reserva temporal, SQL y confirmación

- Diagrama:

![diagrama de secuencia 2](sequence-diagram-02-inscripcion-reserva-temporal-sql-y-confirmacion.svg)

- Codigo:

```plantuml
@startuml
title Inscripcion, reserva temporal, SQL y confirmacion (Redis + BullMQ + DB)
autonumber
hide footbox
  
actor "Cliente potencial" as Cliente
participant "Canal de comunicación\n(WhatsAppAdapter)\nvida: app" as Canal
participant "MessageRouter\n(ConversationModule)\nvida: app" as Router
participant "ConversationSessionStore\n(ConversationModule)\nvida: app" as Session
database "Redis\n- sesion TTL 30 min\n- BullMQ backend\nvida: infra" as Redis
participant "AgentRunner\n(ConversationModule)\nvida: app" as Runner
participant "LLM Client\n(SDK)\nvida: por turno" as LLM
participant "ToolRegistry\n(ToolCallsModule)\nvida: app" as Tools
participant "QuotaService\n(EventsModule)\nvida: app" as Quota
participant "CommercialStageService\n(CommercialModule)\nvida: app" as Stage
participant "HandoffManager\n(ConversationModule)\nvida: app" as Handoff
participant "NotificationService\n(NotificationsModule)\nvida: app" as Notify
participant "BullMQ\n(queue + delayed jobs)\nvida: infra" as Queue
participant "AuditLogService\n(AuditModule)\nvida: app" as Audit
database "PostgreSQL\n(DB operativa)\nvida: durable" as DB
actor "Operador humano" as Operador

note over Quota,Queue
Tiempo de vida (resumen):
- Reserva temporal: vive hasta expires_at o confirmacion
- Job BullMQ (expiracion): vive hasta ejecutarse (en Redis)
- Datos confirmados/auditoria: durable en DB
end note

Cliente -> Canal: Solicitar inscripcion al evento
Canal -> Router: webhook(inbound_message)
Router -> Session: load(conversation_id)
Session -> Redis: GET session:{conversation_id}
Redis --> Session: session
Session --> Router: session
Router -> Runner: run_turn(inbound_message, session)
activate Runner
Runner -> LLM: prompt + session
activate LLM

LLM --> Runner: tool_call emit_stage_signal(pregunta_de_inscripcion_detectada, event_id)
Runner -> Tools: dispatch(emit_stage_signal)
Tools -> Stage: apply_signal(pregunta_de_inscripcion_detectada)
Stage -> DB: UPDATE etapa=PROSPECTO
Stage --> Tools: ok(etapa=PROSPECTO)
Tools --> Runner: ok
Runner -> LLM: tool_result(ok)

LLM --> Runner: tool_call reserve_quota(event_id, idempotency_key)
Runner -> Tools: dispatch(reserve_quota)
Tools -> Quota: reserve_quota(event_id, idempotency_key)
Quota -> Redis: DEDUPE idempotencyKey (SETNX)
Quota -> DB: TX: lock + reservar vacante
Quota -> Audit: append(reservation_created)
Audit -> DB: INSERT audit_log
Quota -> Queue: add_delayed_job(reservation_expiry, delay=time_reserva)
Queue -> Redis: ZADD/SET job (delayed)
Quota --> Tools: ok(reservation_id, expires_at)
Tools --> Runner: ok
Runner -> LLM: tool_result(ok)
LLM --> Runner: respuesta: instrucciones + tiempo limite

Runner -> Session: save(conversation_id, session')
Session -> Redis: SET session:{conversation_id} TTL=30min
Runner -> Canal: send_message(respuesta)
deactivate LLM
deactivate Runner

== Confirmacion de pago (si aplica) ==

Cliente -> Canal: "Ya hice el pago" + comprobante
Canal -> Router: webhook(inbound_message)
Router -> Session: load(conversation_id)
Session -> Redis: GET session:{conversation_id}
Redis --> Session: session
Session --> Router: session
Router -> Runner: run_turn(inbound_message, session)
activate Runner
Runner -> LLM: prompt + session
activate LLM
LLM --> Runner: tool_call emit_stage_signal(confirmacion_de_pago_pendiente)
Runner -> Tools: dispatch(emit_stage_signal)
Tools -> Stage: apply_signal(confirmacion_de_pago_pendiente)
Stage -> DB: UPDATE etapa=SQL
Stage --> Tools: ok(etapa=SQL)
Tools --> Runner: ok

LLM --> Runner: tool_call request_human_handoff(reason=pago_pendiente)
Runner -> Tools: dispatch(request_human_handoff)
Tools -> Handoff: enqueue(conversation_id)
Handoff -> Queue: add_job(human_handoff)
Queue -> Redis: PUSH job

LLM --> Runner: respuesta: "Te conecto con un operador"
Runner -> Session: save(conversation_id, session')
Session -> Redis: SET session:{conversation_id} TTL=30min
Runner -> Canal: send_message(respuesta)
deactivate LLM
deactivate Runner

Operador -> Handoff: tomar conversacion
note right of Operador
El pago se valida por operador humano (CU-COM-001).
El bloqueo definitivo ocurre solo tras esa validacion (RF-EVT-04).
end note
Operador -> Quota: confirmar_pago_y_bloquear(reservation_id)
Quota -> DB: TX: confirmar vacante + inscripcion
Quota -> Queue: remove_delayed_job(reservation_expiry)
Queue -> Redis: DEL job
Quota -> Audit: append(inscripcion_confirmada)
Audit -> DB: INSERT audit_log

== Expiracion automatica (si no confirma) ==

Queue -> Quota: process_job(reservation_expiry)
Quota -> DB: TX: liberar reserva
Quota -> Notify: disparar_notificacion_lista_espera(event_id)
Notify -> Queue: add_job(notify_next_eligible, event_id)
Queue -> Redis: PUSH job
Quota -> Audit: append(reservation_expired)
Audit -> DB: INSERT audit_log

note right of Tools
Las tool calls son el unico canal entre Bot (LLM)
y operaciones de dominio: Quota/Stage/Handoff/Notify.
end note

note right of Router
Alineado con:
CU-COM-001, CU-COM-005, CU-EVT-003,
RF-EVT-01, RF-EVT-02, RF-EVT-03 y RF-EVT-04.
end note
@enduml
```

## 3. Lista de espera y notificación por liberación de vacante

- Diagrama:

![diagrama de secuencia 3](sequence-diagram-03-lista-de-espera-y-notificacion-por-liberacion-de-vacante.svg)

- Codigo:

```plantuml
@startuml
title Lista de espera y notificacion por liberacion de vacante (servicios reales)
autonumber
hide footbox

actor "Prospecto" as Prospecto
participant "Canal de comunicación\n(WhatsAppAdapter)\nvida: app" as Canal
participant "MessageRouter\n(ConversationModule)\nvida: app" as Router
participant "ConversationSessionStore\n(ConversationModule)\nvida: app" as Session
database "Redis\n- sesion TTL 30 min\n- BullMQ backend\nvida: infra" as Redis
participant "AgentRunner\n(ConversationModule)\nvida: app" as Runner
participant "LLM Client\n(SDK)\nvida: por turno" as LLM
participant "ToolRegistry\n(ToolCallsModule)\nvida: app" as Tools
participant "WaitingListService\n(EventsModule)\nvida: app" as Waiting
participant "ScoringService\n(CommercialModule)\nvida: app" as Score
participant "NotificationService\n(NotificationsModule)\nvida: app" as Notify
participant "BullMQ\n(queue + delayed jobs)\nvida: infra" as Queue
participant "AuditLogService\n(AuditModule)\nvida: app" as Audit
database "PostgreSQL\n(DB operativa)\nvida: durable" as DB

note over Waiting,Queue
Tiempo de vida (resumen):
- Entrada en lista de espera: durable (DB) hasta atenderse o cancelarse
- Job BullMQ (notificacion): vive hasta ejecutarse (en Redis)
end note

Prospecto -> Canal: Intentar inscribirse (evento lleno)
Canal -> Router: webhook(inbound_message)
Router -> Session: load(conversation_id)
Session -> Redis: GET session:{conversation_id}
Redis --> Session: session
Session --> Router: session
Router -> Runner: run_turn(inbound_message, session)
activate Runner
Runner -> LLM: prompt + session
activate LLM

LLM --> Runner: respuesta: "Evento lleno, ¿te registro en lista de espera?"
Runner -> Canal: send_message(pregunta)

Runner -> Session: save(conversation_id, session')
Session -> Redis: SET session:{conversation_id} TTL=30min
deactivate LLM
deactivate Runner

Prospecto -> Canal: Aceptar registro
Canal -> Router: webhook(inbound_message)
Router -> Session: load(conversation_id)
Session -> Redis: GET session:{conversation_id}
Redis --> Session: session
Session --> Router: session
Router -> Runner: run_turn(inbound_message, session)
activate Runner
Runner -> LLM: prompt + session
activate LLM

LLM --> Runner: tool_call register_waiting_list(event_id, idempotency_key)
Runner -> Tools: dispatch(register_waiting_list)
Tools -> Score: get_score(conversation_id)
Score -> DB: SELECT score
Tools -> Waiting: register(event_id, conversation_id, score)
Waiting -> DB: INSERT waiting_list_entry (unique)
Waiting -> Audit: append(waiting_list_registered)
Audit -> DB: INSERT audit_log
Waiting --> Tools: ok(position)
Tools --> Runner: ok
Runner -> LLM: tool_result(ok)
LLM --> Runner: respuesta: "Listo, quedaste en la posicion N"
Runner -> Canal: send_message(respuesta)

Runner -> Session: save(conversation_id, session')
Session -> Redis: SET session:{conversation_id} TTL=30min
deactivate LLM
deactivate Runner

== Liberacion de vacante (evento de dominio) ==

Notify -> Queue: add_job(notify_next_eligible, event_id)
Queue -> Redis: PUSH job

Queue -> Notify: process_job(notify_next_eligible)
Notify -> Waiting: select_next(event_id)
Waiting -> DB: SELECT siguiente elegible
Notify -> Canal: send_message("Hay una vacante disponible")

note right of Tools
El bot solicita alta con tool call.
El sistema valida etapa/idempotencia.
end note

note right of Waiting
Alineado con:
CU-EVT-001, CU-EVT-002,
RF-EVT-03 y RF-EVT-06.

Solo Prospecto puede entrar a lista de espera.
end note
@enduml
```

## 4. Cancelación pre-inicio e inscripción extemporánea

- Diagrama:

![diagrama de secuencia 4](sequence-diagram-04-cancelacion-pre-inicio-e-inscripcion-extemporanea.svg)

- Codigo:

```plantuml
@startuml
title Cancelacion pre-inicio e inscripcion extemporanea (servicios reales)
autonumber
hide footbox

actor "Operador humano" as Operador
actor "Cliente potencial" as Cliente
participant "Canal WhatsApp\n(WhatsAppAdapter)\nvida: app" as Canal
participant "MessageRouter\n(ConversationModule)\nvida: app" as Router
participant "ConversationSessionStore\n(ConversationModule)\nvida: app" as Session
participant "AgentRunner\n(ConversationModule)\nvida: app" as Runner
participant "LLM Client\n(SDK)\nvida: por turno" as LLM
participant "ToolRegistry\n(ToolCallsModule)\nvida: app" as Tools
participant "CancellationService\n(EventsModule)\nvida: app" as Cancel
participant "ContextBankService\n(ContextBankModule)\nvida: app" as Context
participant "NotificationService\n(NotificationsModule)\nvida: app" as Notify
participant "BullMQ\n(queue + delayed jobs)\nvida: infra" as Queue
database "Redis\nBullMQ backend\nvida: infra" as Redis
participant "AuditLogService\n(AuditModule)\nvida: app" as Audit
database "PostgreSQL\n(DB operativa)\nvida: durable" as DB

group Cancelacion pre-inicio
  Operador -> Cancel: solicitar_cancelacion(inscripcion_id)
  Cancel -> DB: SELECT evento + fecha_inicio

  alt Evento no iniciado
    Cancel -> DB: TX: marcar cancelada + liberar vacante + actualizar cupo
    Cancel -> Audit: append(cancelacion_completada)
    Audit -> DB: INSERT audit_log
    Cancel -> Notify: disparar_notificacion_lista_espera(event_id)
    Notify -> Queue: add_job(notify_next_eligible, event_id)
    Queue -> Redis: PUSH job
    Cancel --> Operador: Cancelacion completada
  else Evento ya iniciado
    Cancel --> Operador: Rechazar cancelacion (CU-EVT-002)
  end
end

== Inscripcion extemporanea ==

Cliente -> Canal: Solicitar inscripcion tardia
Canal -> Router: webhook(inbound_message)
Router -> Session: load(conversation_id)
Session -> Redis: GET session:{conversation_id}
Redis --> Session: session
Router -> Runner: run_turn(inbound_message, session)
activate Runner
Runner -> LLM: prompt + session
activate LLM

LLM --> Runner: tool_call get_event_context(event_id)
Runner -> Tools: dispatch(get_event_context)
Tools -> Context: get_event_context(event_id)
Context -> DB: SELECT sesiones_realizadas, sesiones_totales, umbral
DB --> Context: progreso + umbral
Context --> Tools: ok(progreso)
Tools --> Runner: ok
Runner -> LLM: tool_result(progreso)

alt Avance <= umbral permitido
  LLM --> Runner: respuesta: permitir flujo extemporaneo
else Avance > umbral permitido
  LLM --> Runner: respuesta: bloquear (RF-EVT-05)
end

Runner -> Session: save(conversation_id, session')
Session -> Redis: SET session:{conversation_id} TTL=30min
Runner -> Canal: send_message(respuesta)
deactivate LLM
deactivate Runner

note right of Cancel
Alineado con:
CU-EVT-002, CU-EVT-003,
RF-EVT-04 y RF-EVT-05.
end note
@enduml
```
