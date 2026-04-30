# CU-COM-006 Gestión de notificaciones de reactivación

## Metadatos

- ID: CU-COM-006
- Dominio: COM
- Nombre: Gestión de notificaciones de reactivación
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-04-29
- Última actualización: 2026-04-29
- Responsable: Isaac Ortiz
- Última corrección por: Isaac Ortiz
- Issue relacionado: pendiente
- PR relacionado: pendiente

## Objetivo

Notificar de forma proactiva a los clientes potenciales registrados en la cartera de clientes (Prospectos, SQLs y Alumnos activos) cuando se abra una nueva edición de un evento de su interés o se publique un evento relacionado, con el fin de reactivar su proceso comercial.

## Alcance

Aplica a toda comunicación outbound iniciada por el sistema bot hacia clientes potenciales que han alcanzado al menos la etapa Prospecto. Cubre dos disparadores de notificación (reapertura de evento y publicación de evento relacionado) y un disparador de desuscripción (solicitud explícita de un cliente potencial para dejar de recibir notificaciones de este tipo). No modifica etapas comerciales ni calificaciones; la única escritura permitida es el registro de la preferencia de desuscripción en el Banco de contexto general.

## RF relacionados

- (pendiente de definición de RF específico para notificaciones outbound de reactivación)

## Actores

### Actor principal

- Bot: ejecuta el envío de notificaciones outbound.

### Actores secundarios

- Sistema
- Operador administrativo del canal: autoriza y configura los eventos de reapertura o publicación que disparan este CU.

## Disparador

El Sistema detecta uno de los siguientes eventos:

- `evento_reabierto`: se registra una nueva edición o reapertura de un evento que ya existía en el sistema.
- `evento_relacionado_publicado`: se publica un nuevo evento cuya categoría, temática o instructor coincide con eventos previos de interés del cliente potencial.
- `desuscripcion_solicitada`: un cliente potencial envía una respuesta al canal de comunicación solicitando explícitamente no recibir más notificaciones de reactivación.

## Precondiciones

- El Sistema tiene registros de clientes potenciales en etapa Prospecto, SQL o Cierre Ganado (Alumno activo) vinculados al evento de referencia.
- El consentimiento tácito de cada destinatario potencial está registrado en el sistema, conforme a [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito].
- Existe al menos un Bot activo y configurado.
- La información del nuevo evento o reapertura está disponible en el Banco de contexto de evento gestionado por [CU-COM-003 Gestión de bancos de contexto].

## Postcondiciones

### En éxito

- Los clientes potenciales elegibles reciben una notificación outbound a través del canal de comunicación registrado.
- El Sistema registra el envío de cada notificación con timestamp y destinatario en los logs.
- Los destinatarios que responden a la notificación inician un nuevo flujo conversacional invocando CU-COM-002.
- Cuando el disparador es `desuscripcion_solicitada`: la preferencia de desuscripción queda registrada en el Banco de contexto general y el cliente potencial recibe confirmación. No recibirá futuras notificaciones de este CU.

### En fallo

- La notificación no se envía a uno o más destinatarios.
- El Sistema registra el fallo con el identificador del destinatario y el motivo del error en los logs.
- Los demás destinatarios elegibles no se ven afectados por el fallo de un destinatario individual.

## Flujo principal — Notificación por reapertura de evento

1. El Sistema detecta la señal `evento_reabierto` para un evento registrado.
2. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener desde el Banco de contexto general la lista de clientes potenciales en etapa Prospecto, SQL o Alumno activo vinculados al evento de referencia.
3. El Sistema filtra la lista para incluir únicamente destinatarios con consentimiento tácito registrado conforme a [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito].
4. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener la información general del nuevo evento desde el Banco de contexto de evento (nombre, fechas tentativas, descripción breve).
5. El Bot envía a cada destinatario elegible una notificación con el mensaje de reapertura, incluyendo nombre del evento, fechas tentativas y una invitación para iniciar una nueva conversación.
6. El Sistema registra el envío de cada notificación en los logs con timestamp y destinatario.

## Flujo principal — Notificación por evento relacionado

1. El Sistema detecta la señal `evento_relacionado_publicado` para un nuevo evento registrado en el sistema.
2. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener desde el Banco de contexto general la lista de clientes potenciales en etapa Prospecto, SQL o Alumno activo cuyos registros de interés coincidan con la categoría, temática o instructor del nuevo evento.
3. El Sistema filtra la lista para incluir únicamente destinatarios con consentimiento tácito registrado conforme a [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito].
4. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener la información general del nuevo evento desde el Banco de contexto de evento (nombre, fechas, descripción breve).
5. El Bot envía a cada destinatario elegible una notificación con el mensaje de nuevo evento, incluyendo nombre, fechas, descripción breve y una invitación para iniciar una nueva conversación.
6. El Sistema registra el envío de cada notificación en los logs con timestamp y destinatario.

## Flujo principal — Gestión de solicitud de desuscripción

1. El Sistema detecta la señal `desuscripcion_solicitada` asociada a un cliente potencial identificado.
2. El Sistema verifica en el Banco de contexto general, a través de [CU-COM-003 Gestión de bancos de contexto], que el cliente potencial pertenece a la cartera (etapa Prospecto, SQL o Alumno activo).
3. Se activa [CU-COM-003 Gestión de bancos de contexto] con una instrucción de escritura para registrar la preferencia de desuscripción del cliente potencial en el Banco de contexto general.
4. El Bot envía al cliente potencial un mensaje de confirmación indicando que su solicitud fue procesada y que no recibirá más notificaciones de reactivación.
5. El Sistema registra la operación en los logs con el identificador del cliente potencial, el timestamp y el origen de la solicitud.

## Flujos alternos

### A1. Destinatario sin canal de comunicación activo

1. En el paso 2 de cualquier flujo principal, el Sistema detecta que un destinatario de la lista no tiene un canal de comunicación activo o registrado.
2. El Sistema omite a ese destinatario y continúa con el siguiente.
3. El Sistema registra la omisión en los logs indicando el motivo.

### A2. Destinatario ya notificado recientemente

1. En el paso 3 de cualquier flujo principal de notificación, el Sistema detecta que un destinatario ya recibió una notificación del mismo evento dentro del periodo anti-spam configurado.
2. El Sistema omite a ese destinatario y continúa con el siguiente.
3. El Sistema registra la omisión en los logs.

### A3. Destinatario ya desuscrito

1. En el paso 3 de cualquier flujo principal de notificación, el Sistema detecta que un destinatario tiene registrada la preferencia de desuscripción en el Banco de contexto general.
2. El Sistema omite a ese destinatario y continúa con el siguiente.
3. El Sistema registra la omisión en los logs indicando que el destinatario optó por no recibir notificaciones.

## Flujos de excepción

### E1. Error al consultar la cartera de clientes

1. En el paso 2 de cualquier flujo principal, [CU-COM-003 Gestión de bancos de contexto] no puede devolver la lista de destinatarios por fallo técnico.
2. El Sistema notifica al Operador administrativo del canal del fallo.
3. Se registra el error en los logs con el identificador del evento disparador y el tipo de señal.
4. El flujo se detiene sin enviar notificaciones.

### E2. Error al enviar notificación a un destinatario

1. El Bot no puede entregar la notificación a un destinatario específico por fallo del canal de comunicación.
2. El Sistema registra el fallo con el identificador del destinatario y el motivo.
3. El flujo continúa con el siguiente destinatario de la lista.

## Reglas de negocio / restricciones

- RN-COM-06-01: Solo pueden recibir notificaciones los clientes potenciales en etapa Prospecto, SQL o Cierre Ganado (Alumno activo) con consentimiento tácito registrado.
- RN-COM-06-02: No se permite enviar más de una notificación del mismo evento a un mismo destinatario dentro del periodo anti-spam configurado por el Operador administrativo del canal.
- RN-COM-06-03: El envío de notificaciones no inicia automáticamente un nuevo flujo comercial; solo coloca el mensaje en el canal del destinatario. El nuevo flujo comienza únicamente si el destinatario responde, invocando CU-COM-002.
- RN-COM-06-04: Este CU no modifica etapas comerciales ni calificaciones. La única operación de escritura permitida es el registro o eliminación de la preferencia de desuscripción en el Banco de contexto general.
- RN-COM-06-05: Los criterios para determinar si un evento es "relacionado" (categoría, temática, instructor) son configurables por el Operador administrativo del canal y deben estar definidos antes de activar el CU.
- RN-COM-06-06: Un cliente potencial desuscrito no recibirá notificaciones de reactivación mientras su preferencia de desuscripción esté activa. La preferencia puede ser revertida únicamente por el Operador administrativo del canal o por el propio cliente potencial a través de una nueva solicitud explícita en el canal de comunicación.

## Datos relevantes

### Entradas

- Señal de disparo: `evento_reabierto`, `evento_relacionado_publicado` o `desuscripcion_solicitada`
- Identificador del evento de referencia o del nuevo evento publicado (flujos de notificación)
- Identificador del cliente potencial solicitante (flujo de desuscripción)
- Lista de clientes potenciales elegibles (obtenida de [CU-COM-003 Gestión de bancos de contexto])
- Información del nuevo evento o reapertura (obtenida de [CU-COM-003 Gestión de bancos de contexto])

### Salidas

- Notificaciones outbound enviadas a destinatarios elegibles
- Mensaje de confirmación de desuscripción enviado al cliente potencial solicitante
- Preferencia de desuscripción registrada en el Banco de contexto general (escritura vía [CU-COM-003 Gestión de bancos de contexto])
- Registro de envíos, omisiones y desuscripciones en logs del sistema

## Diagramas relacionados

- BPMN-COM-006

## Observaciones

- Este CU no ejecuta ningún paso del flujo conversacional activo; solo activa el canal de comunicación del destinatario. El flujo comercial se reanuda únicamente si el destinatario responde, momento en que se invoca CU-COM-002 desde el inicio.
- El periodo anti-spam y los criterios de "evento relacionado" son parámetros configurables por el Operador administrativo del canal.
- Requiere la definición de un RF específico para notificaciones outbound de reactivación que aún no existe en el catálogo de RFs del dominio COM.

## Trazabilidad

- RF: pendiente de definición de RF específico
- BPMN: BPMN-COM-006

[CU-COM-003 Gestión de bancos de contexto]: /docs/diseño/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
[CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito]: /docs/diseño/casos%20de%20uso/COM/CU-COM-004%20Presentaci%C3%B3n%20de%20avisos%20legales%20y%20registro%20de%20consentimiento%20t%C3%A1cito.md
