# CU-COM-002 Flujo de la conversación entre la Persona interesada y el Bot

## Metadatos

- ID: CU-COM-002
- Dominio: COM
- Nombre: Flujo de la conversación entre la Persona interesada y el Bot
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-08
- Última actualización: 2026-04-28
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección por: Isaac Ortiz
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Describir el flujo de interacción entre el Cliente potencial y el Bot, desde el inicio de la conversación hasta el punto de escalamiento a un operador humano o abandono.

## Alcance

Aplica al módulo de conversación del sistema bot, incluyendo consulta de eventos, validación de disponibilidad, entrega de información y transición a atención por operador humano.

## RF relacionados

- [RF-COM-02]
- [RF-COM-04]
- [RF-COM-05]
- [RF-COM-06]
- [RF-COM-07]
- [RF-EVT-01]

## Actores

### Actor principal

- Cliente potencial: inicia la conversación para obtener información sobre eventos y potencialmente inscribirse.

### Actores secundarios

- Bot: gestiona la conversación y responde consultas.
- Sistema: procesa solicitudes y consulta datos.

## Disparador

El Cliente potencial inicia una conversación con el Bot y realiza una consulta sobre un evento.

## Precondiciones

- Existe al menos un Bot configurado y disponible.
- Existe al menos un Evento registrado en el sistema.
- El Evento se encuentra vigente.
- Los bancos de contexto están configurados y disponibles en el sistema.

## Postcondiciones

### En éxito

- La Cliente potencial recibe información del Evento.
- El Bot puede escalar la conversación a un operador humano.
- La interacción queda registrada en el sistema.

### En fallo

- No se puede obtener información del Evento.
- La conversación se detiene o continúa sin avance hacia inscripción.

## Flujo principal

1. El Cliente potencial inicia la conversación con el Bot y se activa el [CU-COM-005 Gestión de etapa comercial].
2. Al iniciar una conversación se activa el [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito].
3. El Bot recopila información básica de contacto (nombre, teléfono, correo opcional) y se activa el [CU-COM-005 Gestión de etapa comercial].
4. El Bot identifica la intención de consulta sobre un Evento específico.
5. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener información del Evento (disponibilidad, horarios, fechas y temarios) y enviarla al Bot.
6. El Bot presenta información general del Evento. [RF-COM-05]
7. El Cliente potencial solicita fechas y horarios.
8. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener fechas y horarios del Evento y el Bot los presenta. [RF-COM-06]
9. El Cliente potencial muestra interés en inscribirse con preguntas clave como métodos de pago y procesos de inscripción.
10. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener la disponibilidad de cupo del Evento. [RF-EVT-01]
11. Haya o no haya cupo, se activa el [CU-COM-005 Gestión de etapa comercial].
12. Si hay cupo reserva uno temporal para el Cliente potencial y activa [CU-COM-003 Gestión de bancos de contexto]. [RF-EVT-02]
13. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener información de métodos de pago y proceso de inscripción, y el Bot la presenta al Cliente potencial. [RF-COM-04]
14. El Bot detecta que el cliente potencial ha enviado mensajes que detonan la necesidad de confirmación de pago por parte de un operador humano por lo tanto se activa el [CU-COM-005 Gestión de etapa comercial].
15. El Bot informa que será transferido a un operador humano y se activa el flujo de [CU-COM-001 Asignación de conversaciones de un bot a un operador humano].

## Flujos alternos

### A1. El Cliente potencial elige otro evento

1. Desde el paso 5 hasta el paso 13, el Cliente potencial solicita otras opciones de eventos disponibles.
2. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener el listado de eventos disponibles y el Bot lo presenta. [RF-COM-04]
3. El Cliente potencial selecciona un evento diferente al original.
4. Si el Cliente potencial está en la etapa comercial Prospecto, el Bot quita el cupo reservado para el evento original, activa [CU-COM-003 Gestión de bancos de contexto] y regresa al paso 5.

### A2. El Cliente potencial desea inscribirse directamente

1. En el paso 5, el Cliente potencial indica intención directa de inscripción.
2. Se activa [CU-COM-003 Gestión de bancos de contexto] para validar disponibilidad de cupo del Evento. [RF-EVT-01]
3. Si hay cupo, el flujo continúa en el paso 11.
4. Si no hay cupo, se activa flujo de excepción E1.

## Flujos de excepción

### E1. Evento sin disponibilidad y Cliente potencial no es Prospecto

1. En el paso 5, [CU-COM-003 Gestión de bancos de contexto] devuelve que no hay cupo disponible en el Evento. [RF-EVT-01]
2. El Bot informa que el Evento está lleno.
3. El Bot ofrece alternativas (otros eventos). [RF-COM-04]
4. Si el Cliente potencial muestra interés en otro evento, se regresa al paso 5.
5. Si el Cliente potencial no muestra interés en otros eventos, el Bot finaliza la conversación.

### E1.2 Evento sin disponibilidad y Cliente potencial es Prospecto

1. En el paso 10, [CU-COM-003 Gestión de bancos de contexto] devuelve que no hay cupo disponible en el Evento. [RF-EVT-01]
2. El Bot informa que el Evento está lleno.
3. El Bot ofrece registro en lista de espera para el Evento original. [RF-EVT-07]
4. Si el Prospecto acepta, se activa el flujo de [CU-EVT-001]. [RF-EVT-07]
5. Si el Prospecto no acepta, el Bot ofrece alternativas (otros eventos). [RF-COM-04]
6. Si el Prospecto muestra interés en otro evento, se regresa al paso 5 y su etapa comercial se reduce a MQL. [RF-COM-02]
7. Si el Prospecto no muestra interés en otros eventos y no acepta la lista de espera, el Bot finaliza la conversación.

### E2. Error al obtener información

1. En cualquier paso donde se activa [CU-COM-003 Gestión de bancos de contexto], el Sistema no puede consultar los bancos de contexto.
2. El Bot informa indisponibilidad temporal.
3. Se registra el error en logs.

### E3. No aceptación de privacidad

1. En el paso 2, la Persona interesada no continua la conversación después de recibir el aviso de privacidad y términos y condiciones. [RF-COM-07]
2. El Bot detecta falta de respuesta y deja la conversación en "hold".
3. El flujo se detiene.

## Reglas de negocio / restricciones

- RN-COM-01: Si el Cliente potencial no continúa la conversación después de los avisos el bot no puede recopilar ni procesar datos personales.
- RN-COM-02: El Bot debe mostrar eventos disponibles desde la base de datos.
- RN-COM-03: El Bot debe proporcionar información detallada del Evento como fecha, hora, lugar y descripción desde el banco de contexto del Evento.
- RN-COM-04: El cliente potencial solo puede inscribirse a un evento a la vez, si desea cambiar de evento debe liberar el cupo reservado del evento original.

## Datos relevantes

### Entradas

- Consulta de la Persona interesada
- Evento seleccionado

### Salidas

- Información del Evento
- Estado de la conversación

## Diagramas relacionados

- BPMN-COM-002

## Observaciones

- El flujo puede variar dependiendo del nivel de interés.
- La calificación de la Persona interesada ocurre en paralelo (RF-COM-02).

## Trazabilidad

- RF: RF-COM-02, RF-COM-04, RF-COM-05, RF-COM-06, RF-COM-07, RF-EVT-01, RF-EVT-02
- BPMN: BPMN-COM-002
- DDR: DDR-01

[RF-COM-02]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-02%20Gestión%20de%20etapa%20comercial%20y%20calificación%20automática%20de%20leads.md
[RF-COM-04]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-04%20El%20Bot%20debe%20mostrar%20el%20listado%20de%20eventos%20disponibles.md
[RF-COM-05]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-05%20El%20Bot%20debe%20proporcionar%20información%20detallada%20de%20cada%20evento.md
[RF-COM-06]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-06%20El%20Bot%20debe%20informar%20fechas%20de%20inicio%20y%20horarios%20disponibles.md
[RF-COM-07]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md
[RF-EVT-01]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01%20Verificacion%20de%20disponibilidad%20de%20cupo.md
[RF-EVT-02]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-02%20Reservacion%20de%20vacante%20durante%20proceso%20de%20venta.md
[RF-EVT-07]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-07%20Gestion%20de%20lista%20de%20espera.md
[CU-COM-001 Asignación de conversaciones de un bot a un operador humano]: /docs/diseño/casos%20de%20uso/COM/CU-COM-001%20Asignación%20de%20conversaciones%20de%20un%20bot%20a%20un%20operador%20humano.md
[CU-COM-003 Gestión de bancos de contexto]: /docs/diseño/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
[CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito]: /docs/diseño/casos%20de%20uso/COM/CU-COM-004%20Presentación%20de%20avisos%20legales%20y%20registro%20de%20consentimiento%20tácito.md
[CU-COM-005 Gestión de etapa comercial]: /docs/diseño/casos%20de%20uso/COM/CU-COM-005%20Calificación%20automática%20y%20gestión%20de%20etapa%20comercial.md
[CU-EVT-001]: /docs/diseño/casos%20de%20uso/EVT/CU-EVT-001%20Registro%20en%20lista%20de%20espera.md
