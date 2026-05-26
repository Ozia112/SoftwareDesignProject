# Diagramas de Secuencia — MVP (EVT)

Este archivo contiene los **diagramas de secuencia del MVP** descrito en el guion de presentación (`docs/soporte/presentacion/presentacion-diseno-mvp.md`).

## Alcance del MVP

Incluye:

- Canal: Canal de comunicación.
- Captación inicial y registro de consentimiento.
- Verificar cupo y comunicarlo (**RF-EVT-01**).
- Solicitar inscripción con reserva temporal y expiración (flujo simplificado).
- Escalamiento a operador humano para validar pago (flujo simplificado).
- Si `cupo = 0`: informar “evento lleno” y ofrecer lista de espera (**RF-EVT-06**).
- Registro en lista de espera y notificación ante liberación de cupo (**RF-EVT-03**).

Nota (MVP): los participantes se nombran **de forma genérica** a propósito (Cliente/Canal de comunicación/Bot/Sistema/DB). Los nombres de módulos/microservicios pertenecen al diagrama completo.

Principio de diseño (DDR-02): **El bot expresa intención; el sistema ejecuta operaciones**.

---

## MVP-01. Captación, consentimiento y verificación de cupo (RF-EVT-01)

- Objetivo: iniciar conversación, registrar consentimiento y responder cupo del evento.


```plantuml
@startuml
title MVP-01 Captación + consentimiento + cupo (RF-EVT-01)
autonumber
hide footbox

actor "Cliente" as Cliente
participant "Canal de comunicación\nvida: externo" as Canal
participant "Bot" as Bot
participant "Sistema\nvida: app" as Sistema
database "Sesión conversacional (Redis)\nTTL 30 min\nvida: infra" as Session
database "Base de datos (Consentimiento/Eventos)\nvida: durable" as DB

note over Canal,DB
Tiempo de vida (MVP):
- Turno conversacional: por mensaje (ms–s)
- Sesión conversacional: vive hasta inactividad (TTL)
- Registros (consentimiento/eventos): durable
end note

Cliente -> Canal: Enviar mensaje inicial
Canal -> Bot: Entrega mensaje
activate Bot

Bot -> Sistema: Iniciar conversación (conversation_id)
activate Sistema
Sistema -> Session: load(conversation_id)
Session --> Sistema: session (si existe)

Sistema -> DB: Registrar/validar consentimiento
DB --> Sistema: ok

Sistema -> DB: Consultar evento + cupo
DB --> Sistema: cupo
Sistema --> Bot: cupo + texto sugerido

alt cupo > 0
  Bot -> Canal: "Sí hay cupo (N disponibles)"
else cupo = 0
  Bot -> Canal: "Evento lleno; ¿quieres lista de espera?"
end

Bot -> Sistema: Persistir estado conversacional
Sistema -> Session: save(conversation_id, session')
Sistema -> Session: SET TTL=30min

deactivate Sistema
deactivate Bot

Canal --> Cliente: Respuesta

note right of Sistema
Ancla: RF-EVT-01.
Principio (DDR-02): el bot expresa intención; el sistema ejecuta.
end note
@enduml
```

---

## MVP-02. Inscripción con reserva temporal y validación humana (RF-EVT-02, RF-EVT-04)

- Objetivo: reservar temporalmente una vacante, escalar validación de pago a operador y confirmar o expirar.


```plantuml
@startuml
title MVP-02 Inscripción + reserva temporal + operador
autonumber
hide footbox

actor "Cliente" as Cliente
actor "Operador humano" as Operador
participant "Canal de comunicación\nvida: externo" as Canal
participant "Bot" as Bot
participant "Sistema\nvida: app" as Sistema
database "Cache (idempotencia/sesión)\nvida: infra" as Cache
participant "Cola/Temporizador (expiración)\nvida: infra" as Timer
database "Base de datos (Reservas/Inscripciones)\nvida: durable" as DB
participant "Notificaciones\nvida: app" as Notify

note over Canal,DB
Tiempo de vida (MVP):
- Reserva temporal: vive hasta expires_at o confirmación
- Expiración: job/temporizador vive hasta ejecutarse
- Inscripción confirmada: durable
end note

Cliente -> Canal: Solicitar inscripción al evento X
Canal -> Bot: Entrega mensaje
activate Bot

Bot -> Sistema: Solicitar reserva temporal (evento X)
activate Sistema
Sistema -> Cache: Validar idempotencia (idempotency_key)
Cache --> Sistema: ok
Sistema -> DB: TX reservar vacante + expires_at
DB --> Sistema: reservation_id + expires_at
Sistema -> Timer: Programar expiración(reservation_id, expires_at)
Timer --> Sistema: ok
Sistema --> Bot: ok + expires_at
Bot -> Canal: "Reserva creada. Tienes hasta HH:MM para confirmar."

deactivate Sistema
deactivate Bot

== Confirmación de pago (por operador humano) ==

Cliente -> Canal: "Ya hice el pago" + comprobante
Canal -> Bot: Entrega mensaje
activate Bot

Bot -> Sistema: Solicitar handoff a operador (pago pendiente)
activate Sistema
Sistema -> Operador: Asignar conversación / validar pago
Operador -> Sistema: Confirmar pago y bloquear(reservation_id)
Sistema -> DB: TX confirmar inscripción + bloquear vacante
DB --> Sistema: ok
Sistema -> Timer: Cancelar expiración(reservation_id)
Timer --> Sistema: ok
Sistema --> Bot: confirmación
Bot -> Canal: "Pago validado. Inscripción confirmada."

deactivate Sistema
deactivate Bot

== Expiración automática (si no confirma) ==

Timer -> Sistema: Ejecutar expiración(reservation_id)
activate Sistema
Sistema -> DB: Liberar reserva
DB --> Sistema: ok
Sistema -> Notify: Disparar notificación a lista de espera (evento X)
Notify -> Canal: "Hay una vacante disponible"
deactivate Sistema

note right of Sistema
Anclas: RF-EVT-02 (reserva), RF-EVT-04 (bloqueo post-pago).
El pago se valida por operador humano.
end note
@enduml
```

---

## MVP-03. Lista de espera y notificación por liberación de cupo (RF-EVT-06, RF-EVT-03)

- Objetivo: registrar al cliente en lista de espera y notificar al siguiente elegible cuando se libera una vacante.


```plantuml
@startuml
title MVP-03 Lista de espera + notificación por liberación de cupo
autonumber
hide footbox

actor "Cliente" as Cliente
participant "Canal de comunicación\nvida: externo" as Canal
participant "Bot" as Bot
participant "Sistema\nvida: app" as Sistema
database "Base de datos (Lista de espera)\nvida: durable" as DB
participant "Notificaciones\nvida: app" as Notify

note over Canal,DB
Tiempo de vida (MVP):
- Registro en lista de espera: durable
- Notificación: se dispara cuando se detecta liberación de vacante
end note

Cliente -> Canal: Intentar inscribirse (evento lleno)
Canal -> Bot: Entrega mensaje
activate Bot

Bot -> Sistema: Consultar cupo (evento X)
activate Sistema
Sistema -> DB: Consultar cupo
DB --> Sistema: cupo = 0
Sistema --> Bot: cupo = 0
Bot -> Canal: "Evento lleno; ¿te registro en lista de espera?"

deactivate Sistema
deactivate Bot

Cliente -> Canal: "Sí, regístrame"
Canal -> Bot: Entrega mensaje
activate Bot

Bot -> Sistema: Solicitar alta en lista de espera (evento X)
activate Sistema
Sistema -> DB: Registrar/validar no duplicado
DB --> Sistema: posición N
Sistema --> Bot: alta ok + posición
Bot -> Canal: "Listo. Quedaste en la posición N."

deactivate Sistema
deactivate Bot

== Liberación de vacante (evento de dominio) ==

Sistema -> DB: Detectar liberación de vacante (evento X)
DB --> Sistema: ok
Sistema -> DB: Seleccionar siguiente elegible
DB --> Sistema: cliente_siguiente
Sistema -> Notify: Enviar aviso al siguiente
Notify -> Canal: "Hay una vacante disponible"

note right of Sistema
Anclas: RF-EVT-06 (lista de espera), RF-EVT-03 (notificación por liberación).
end note
@enduml
```

---

## Artefactos relacionados del MVP (excepto Casos de Uso)

Este apartado apunta a los artefactos ya existentes que respaldan el MVP, **sin incluir** documentos de Casos de Uso.

- Presentación (guion): `docs/soporte/presentacion/presentacion-diseno-mvp.md`
- Presentación (.pptx): `docs/soporte/presentacion/presentacion-diseno-mvp.pptx`

- Decisiones:
  - DDR-01: `docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md`
  - DDR-02: `docs/diseño/decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md`

- RNF (drivers):
  - RNF-02 Rendimiento: `docs/analisis/requerimientos/no funcionales/RNF-02 Rendimiento del bot.md`
  - RNF-04 Continuidad: `docs/analisis/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md`

- RF ancla del MVP:
  - RF-EVT-01: `docs/analisis/requerimientos/funcionales/EVT/RF-EVT-01 Verificacion de disponibilidad de cupo.md`
  - RF-EVT-02: `docs/analisis/requerimientos/funcionales/EVT/RF-EVT-02 Reservacion de vacante durante proceso de venta.md`
  - RF-EVT-03: `docs/analisis/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md`
  - RF-EVT-04: `docs/analisis/requerimientos/funcionales/EVT/RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md`
  - RF-EVT-06: `docs/analisis/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de lista de espera.md`

- Arquitectura y blueprint de código:
  - `docs/diseño/arquitectura/estructura-de-codigo.md`
  - Estrategia v2.0: `utils/estrategia de implementacion chat.md`

- Diagramas de diseño (complementarios):
  - Colaboración: `docs/diseño/comportamiento/colaboracion/diagrama-colaboracion.md`
  - Secuencia (completo): `docs/diseño/comportamiento/secuencia/diagrama-secuencia.md`
