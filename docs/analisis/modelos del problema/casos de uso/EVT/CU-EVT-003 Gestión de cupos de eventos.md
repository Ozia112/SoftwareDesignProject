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
- Liberación de cupo bloqueado por causas excepcionales conforme a RF-EVT-04: ausencia confirmada, inscripción extemporánea, solicitud de reembolso (disparado por operador humano o CU-EVT-002).
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

- Operador humano, quien estará en contacto constantemente con el Prospecto ayudandole a inscribirse

### Actores secundarios

- Banco de contexto (gestiona datos de eventos, inscripciones y lista de espera)
- Persona interesada

## Disparador

Un operador humano quiere inscribir a un Prospecto interesado a un evento en especifico

## Precondiciones

- El Prospecto ya ha proporcionado sus datos personales
- Ya ha pasado por el proceso automatizado
- El Prospecto es conciente de la información del evento

## Postcondiciones

### En éxito

- El Prospecto queda inscrito en el banco de contexto.
- El operador humano inscribe al Prospecto al evento y el sistema se encarga de que la inscripción sea permanente.

### En fallo

- El sistema no puede inscribir al Prospecto y, por ende, no queda registrado en el banco de contexto.
- Si había una inscripción temporal, el sistema debe eliminarla del banco de contexto y notificar a la lista de espera si hay al menos un cliente potencial en la lista. [CU-EVT-002]

## Flujo principal

1. El operador humano inicia la inscripción del Prospecto
2. El sistema debe verificar que el evento este disponible [RF-EVT-01]
3. El sistema reserva la vacante [RF-EVT-02]
4. El operador humano agrega la información personal del Prospecto al banco de contexto
5. El sistema debe bloquear la vacante temporalmente [RF-EVT-02]
6. El sistema notifica al operador humano que la inscripción ha sido exitosa
7. El operador humano le informa al Prospecto que se ha quedado registrado y espera la confirmación de su pago en un periodo de tiempo

## Flujos alternos

### A1. El Prospecto no paga a tiempo

1. El sistema detecta que el Prospecto no ha hecho el pago correspondiente (información dada por el operador humano)
2. El sistema debe verificar la inscripción temporal [RF-EVT-02]
3. El sistema debe quitar la información del Prospecto en el evento del banco de contexto y aumentar en 1 el cupo del evento
4. El sistema debe notificar a la lista de espera [RF-EVT-03]
5. El flujo termina

### A2. El Prospecto paga a tiempo

1. El sistema detecta que el Prospecto ha hecho el pago correspondiente
2. El sistema debe verificar la inscripción temporal
3. El sistema debe volver permanente la inscripción [RF-EVT-04]
4. El flujo acaba

### A3. El evento ya ha iniciado

1. El sistema verifica la disponibilidad del evento [RF-EVT-01]
2. Al evento ya ha avanzado más de lo permitido para las inscripciones
3. El sistema debe bloquear las inscripciones del evento en cuestión [RF-EVT-05]
4. El sistema debe cancelar las inscripciones temporales [RF-EVT-04]
5. El sistema libera las inscripciones temporales
6. El flujo termina

### A4. Abandono o cambio de evento

1. El sistema detecta que el Cliente potencial abandona la conversación o cambia de evento (disparado por CU-COM-002)
2. El sistema debe verificar la inscripción temporal [RF-EVT-02]
3. El sistema debe quitar la información del Prospecto en el evento del banco de contexto y aumentar en 1 el cupo del evento
4. El sistema debe notificar a la lista de espera [RF-EVT-03]
5. El flujo termina

## Flujos de excepción

### E1. El evento está lleno

1. En el paso 2, si el evento está lleno
2. El sistema o el operador humano validan la inscripción y detienen/rechazan el proceso por falta de cupo
3. El operador humano debe preguntarle al Prospecto si desea que lo pongan en la lista de espera
4. Si el Prospecto acepta se le agrega [RF-EVT-06], caso contrario no se le agrega
5. El flujo termina

### E2. Falla la inscripción/registro de datos

1. En el paso 4 cuando el operador humano trata de agregar la información esta falla
2. El sistema debe notificar al operador humano y borrar los datos que se hayan podido registrar para liberar la vacante
3. El sistema debe permitir al operador humano reintentar la inscripción
4. El sistema regresa al paso 1 si el agente lo vuelve a intentar, caso contrario el flujo acaba

### E3. Liberación por causas excepcionales

1. El operador humano o el sistema detecta una causa excepcional (ausencia confirmada, inscripción extemporánea, solicitud de reembolso) conforme a RF-EVT-04
2. El sistema verifica la inscripción bloqueada
3. El sistema libera el cupo bloqueado y actualiza el estado del evento
4. El sistema notifica a la lista de espera si aplica [RF-EVT-03]
5. El flujo termina

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

- El operador humano guía el proceso mientras el sistema aplica validaciones de cupo y temporalidad.
- El caso contempla transición entre inscripción temporal y permanente según confirmación de pago.

## Trazabilidad

- RF: RF-EVT-01, RF-EVT-02, RF-EVT-03, RF-EVT-04, RF-EVT-05, RF-EVT-06
- CU: CU-EVT-002

[CU-EVT-002]: /docs/analisis/modelos%20del%20problema/casos%20de%20uso/EVT/CU-EVT-002%20Gestión%20de%20cancelación.md
[RF-EVT-01]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-01%20Verificacion%20de%20disponibilidad%20de%20cupo.md
[RF-EVT-02]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-02%20Reservacion%20de%20vacante%20durante%20proceso%20de%20venta.md
[RF-EVT-03]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-03%20Notificacion%20de%20usuarios%20ante%20una%20liberacion%20de%20cupo.md
[RF-EVT-04]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-04%20Bloqueo%20de%20vacantes%20despues%20de%20confirmacion%20de%20pago.md
[RF-EVT-05]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-05%20Gestion%20de%20inscripciones%20extemporaneas.md
[RF-EVT-06]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-06%20Gestion%20de%20lista%20de%20espera.md
