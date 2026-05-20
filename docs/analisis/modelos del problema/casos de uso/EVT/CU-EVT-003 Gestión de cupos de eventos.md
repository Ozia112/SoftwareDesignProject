# CU-EVT-003 Gestión de cupos de eventos

## Metadatos

- ID: CU-EVT-003
- Dominio: EVT
- Nombre: Gestión de cupos de eventos
- Estado: Borrador
- Versión: v0.3
- Fecha de creación: 2026-03-16
- Última actualización: 2026-05-05
- Responsable: Maximiliano Carrillo Alvarado
- Última correción por: Isaac Ortiz
- Issue relacionado: PSD-12
- PR relacionado: #XX

## Objetivo

Gestionar el estado de cupos durante el ciclo de inscripción de Cliente potencial en etapa Prospecto o SQL, asegurando la reserva temporal, bloqueo permanente tras confirmación de pago, y liberación de cupo en casos de no pago, abandono, cambio de evento o causas excepcionales.

## Alcance

Gestión centralizada de estados de cupo durante el ciclo de inscripción. Aplica a:

- Reserva temporal de cupo cuando un Cliente potencial en etapa Prospecto manifiesta intención de inscribirse (disparado por CU-COM-002).
- Bloqueo definitivo de cupo cuando un Cliente potencial en etapa SQL confirma el pago (disparado por operador humano vía CU-COM-001).
- Liberación de cupo temporal cuando: no se confirma el pago en tiempo, el Cliente potencial abandona la conversación, o cambia de evento (disparado por CU-COM-002 o por vencimiento temporal).
- Liberación de cupo bloqueado por causas excepcionales conforme a RF-EVT-04: ausencia confirmada, inscripción extemporánea, solicitud de reembolso (disparado por [CU-EVT-002]).
- Validaciones de disponibilidad de cupo para proteger contra sobreventa.

## RF relacionados

- RF-EVT-01
- RF-EVT-02
- RF-EVT-03
- RF-EVT-04
- RF-EVT-05
- RF-EVT-06

## Actores

### Actor principal

- Sistema (Orquestador), responsable de ejecutar operaciones de cupo de forma segura y atómica.

### Actores secundarios

- Bot (emite señales y solicita operaciones desde CU-COM-002)
- Operador humano (valida pago y solicita bloqueo definitivo en SQL vía CU-COM-001)
- Banco de contexto (gestiona datos de eventos, reservas e inscripciones)
- Cliente potencial

## Disparador

El Orquestador recibe una solicitud de operación de cupo derivada del flujo comercial:

- **Reserva temporal**: CU-COM-002 invoca este CU cuando, tras ejecutar CU-COM-005, la etapa queda en **Prospecto** y se requiere proteger el cupo.
- **Bloqueo definitivo**: un Operador humano valida el pago en etapa **SQL** y CU-COM-001 invoca este CU para bloquear definitivamente.
- **Liberación**: CU-COM-002 (abandono/cambio de evento), vencimiento de la reserva temporal o [CU-EVT-002] (causas excepcionales) solicitan liberar.

## Precondiciones

- Existe un Evento vigente en el banco de contexto.
- La conversación ya alcanzó la etapa comercial requerida por la operación:
- **Prospecto** para reservar/liberar una reserva temporal.
- **SQL** para bloquear definitivamente tras validación de pago.
- El Cliente potencial ya interactuó con el Bot y proporcionó los datos mínimos de contacto en CU-COM-002.

## Postcondiciones

### En éxito

- Si se solicitó **reserva temporal**, queda registrada una reserva asociada al Cliente potencial y al Evento con un TTL.
- Si se solicitó **bloqueo definitivo**, el cupo queda bloqueado de forma permanente y la inscripción queda confirmada.
- Si se solicitó **liberación**, el cupo vuelve a estar disponible y, cuando aplica, se activa la notificación a lista de espera.

### En fallo

- El Sistema no puede ejecutar la operación solicitada (por ejemplo, evento lleno, conflicto por concurrencia o precondición de etapa no satisfecha).
- No se altera el estado del cupo.

## Flujo principal

1. CU-COM-002 solicita al Sistema reservar un cupo temporal para el Evento al confirmar que la etapa comercial quedó en **Prospecto** (vía CU-COM-005).
2. El Sistema verifica disponibilidad de cupo para el Evento. [RF-EVT-01]
3. El Sistema crea una **reserva temporal** del cupo asociada al Cliente potencial y al Evento (bloqueo atómico y con TTL). [RF-EVT-02]
4. El Sistema confirma a CU-COM-002 que la reserva temporal fue creada.
5. El flujo termina.

## Flujos alternos

### A1. El Prospecto no paga a tiempo

1. El Sistema detecta el vencimiento de la reserva temporal (TTL).
2. El Sistema verifica la reserva temporal activa. [RF-EVT-02]
3. El Sistema libera la reserva y actualiza el cupo del Evento. [RF-EVT-02]
4. El Sistema notifica a la lista de espera cuando aplica. [RF-EVT-03]
5. El flujo termina.

### A2. El Prospecto paga a tiempo

1. Un Operador humano valida el pago del Cliente potencial ya en etapa **SQL** (CU-COM-001).
2. CU-COM-001 solicita al Sistema bloquear definitivamente el cupo asociado a la reserva temporal.
3. El Sistema verifica la reserva temporal y realiza el **bloqueo definitivo** del cupo/inscripción. [RF-EVT-04]
4. El flujo termina.

### A3. El evento ya ha iniciado

1. El sistema verifica la disponibilidad del evento [RF-EVT-01]
2. Al evento ya ha avanzado más de lo permitido para las inscripciones
3. El sistema debe bloquear las inscripciones del evento en cuestión [RF-EVT-05]
4. El sistema debe cancelar las inscripciones temporales [RF-EVT-04]
5. El sistema libera las inscripciones temporales
6. El flujo termina.

### A4. Abandono o cambio de evento

1. CU-COM-002 solicita liberar la reserva temporal cuando el Cliente potencial abandona la conversación o cambia de Evento.
2. El Sistema verifica la reserva temporal activa. [RF-EVT-02]
3. El Sistema libera la reserva y actualiza el cupo del Evento. [RF-EVT-02]
4. El Sistema notifica a la lista de espera cuando aplica. [RF-EVT-03]
5. El flujo termina.

## Flujos de excepción

### E1. El evento está lleno

1. En el paso 2, si el evento está lleno
2. El Sistema rechaza la reserva temporal por falta de cupo.
3. CU-COM-002 puede invocar el registro en lista de espera cuando el Cliente potencial esté en etapa Prospecto. [RF-EVT-06]
4. El flujo termina.

### E2. Falla la inscripción/registro de datos

1. Ocurre un error al crear/liberar/bloquear una reserva por falla de persistencia o conflicto de concurrencia.
2. El Sistema revierte cualquier cambio parcial (si aplica) y no altera el cupo final.
3. El Sistema notifica el error al flujo invocador.
4. El flujo termina.

### E3. Liberación por causas excepcionales

1. [CU-EVT-002] solicita liberar un cupo bloqueado por una causa excepcional (ausencia confirmada, inscripción extemporánea, solicitud de reembolso) conforme a RF-EVT-04.
2. El Sistema verifica la inscripción/cupo bloqueado.
3. El Sistema libera el cupo bloqueado y actualiza el estado del Evento.
4. El Sistema notifica a la lista de espera si aplica. [RF-EVT-03]
5. El flujo termina.

## Reglas de negocio relacionadas

- `RN-EVT-CUPO-01`
- `RN-EVT-CUPO-02`
- `RN-EVT-CUPO-03`
- `RN-EVT-CUPO-04`

Referencia:

- `docs/analisis/reglas de negocio/EVT/catalogo-rn-evt.md`

## Datos relevantes

### Entradas

- Datos personales del Prospecto.
- Evento objetivo de inscripción.
- Confirmación o ausencia de pago dentro del periodo definido.

### Salidas

- Estado de inscripción (temporal, confirmada, cancelada).
- Actualización de cupo del evento.
- Notificación a lista de espera cuando aplique.

## Diagramas relacionados

- BPMN-EVT-003

## Observaciones

- La **reserva temporal** se ejecuta automáticamente por el Sistema al llegar a etapa Prospecto (CU-COM-002 + CU-COM-005).
- El **bloqueo definitivo** ocurre únicamente tras validación de pago por un Operador humano en SQL.

## Trazabilidad

- RF: RF-EVT-01, RF-EVT-02, RF-EVT-03, RF-EVT-04, RF-EVT-05, RF-EVT-06
- CU: [CU-EVT-002]

[CU-EVT-002]: /docs/analisis/modelos%20del%20problema/casos%20de%20uso/EVT/CU-EVT-002%20Gestión%20de%20cancelación.md
[RF-EVT-01]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-01%20Verificacion%20de%20disponibilidad%20de%20cupo.md
[RF-EVT-02]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-02%20Reservacion%20de%20vacante%20durante%20proceso%20de%20venta.md
[RF-EVT-03]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-03%20Notificacion%20de%20usuarios%20ante%20una%20liberacion%20de%20cupo.md
[RF-EVT-04]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-04%20Bloqueo%20de%20vacantes%20despues%20de%20confirmacion%20de%20pago.md
[RF-EVT-05]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-05%20Gestion%20de%20inscripciones%20extemporaneas.md
[RF-EVT-06]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-06%20Gestion%20de%20lista%20de%20espera.md
