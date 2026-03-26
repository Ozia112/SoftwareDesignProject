# CU-COM-002 Flujo de la conversación entre el Lead y el bot

## Metadatos

- ID: CU-COM-002
- Dominio: COM
- Nombre: Flujo de la conversación entre el Lead y el bot
- Estado: Borrador
- Versión: v0.3
- Fecha de creación: 2026-03-08
- Última actualización: 2026-03-26
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-08, PSD-13
- PR relacionado: #XX

## Objetivo

Describir cómo el bot debería actuar en la conversación con la persona interesada.

## Alcance

- Este caso de uso cubre la interacción básica de la persona interesada con el bot para consultar eventos, validación de disponibilidad, fechas y horarios, además de la captura de datos de la persona interesada con consentimiento explícito.

## RF relacionados

- RF-COM-04
- RF-COM-05
- RF-COM-06
- RF-COM-07
- RF-EVT-01

## Actores

### Actor principal

- Persona interesada encargada de hacer preguntas al bot.

### Actores secundarios

- Bot encargado de contestar las preguntas de la persona interesada.
- Base de datos

## Disparador

Después de que la persona interesada inicia la conversación y hace una pregunta al bot que puede contestar.

## Precondiciones

- Debe existir al menos un Bot automatizado configurado y disponible en el sistema.
- Debe existir información acerca del evento del que la persona interesada está preguntando.
- Debe estar vigente el evento.

## Postcondiciones

- El bot debe notificar al sistema para enviar la conversación al agente administrativo.

### En éxito

- La persona interesada debe continuar en la conversación con el bot hasta que el bot llegue al punto donde no pueda continuar sin un operador humano.

### En fallo

- La persona interesada cierra la conversación por falta de interés o respuesta del bot.

## Flujo principal

1. El Lead entra a la conversación desde un anuncio y le hace una pregunta al bot.

2. El bot debe verificar la disponibilidad del evento de interés del Lead. [RF-EVT-01]

3. El bot debe proporcionar la información del evento en cuestión. [RF-COM-05]

4. El Lead solicita información sobre horarios y fechas del evento.

5. El bot consulta la información del evento y proporciona las fechas y horarios disponibles al Lead. [RF-COM-06]

6. El MQL está interesado en el evento y quiere inscribirse.

7. El bot debe mandar una notificación de privacidad al MQL con dos botones que muestren "Acepto" y "Rechazo" para posteriormente pedirle su nombre, su número y, opcionalmente, su correo electrónico. [RF-COM-07]

8. Una vez obtenida la información del MQL, el bot debe notificar al MQL acerca de que va a ser redirigido con un operador humano y si desea continuar.

9. El bot notifica al sistema para colocar al MQL en una cola de espera para ser atendido por un operador humano.

10. El sistema registra la solicitud y mantiene la conversación en espera hasta que un agente esté disponible.

## Flujos alternos

### A1. El Lead no está interesado en el evento actual

1. Una vez obtenida la información o los horarios del evento que le causó el interés, el Lead pregunta si no hay otros eventos.
2. El bot debe proporcionar una lista con otros eventos disponibles [RF-COM-04]
3. Regresar al paso donde se consulta el evento.

### A2. El MQL ya está interesado en inscribirse y está informado previamente de las fechas

1. El MQL le dice al bot nada más iniciar la conversación que quiere inscribirse.
2. El bot le debe confirmar la disponibilidad del evento.
3. El bot le debe preguntar al MQL si sabe los horarios del evento.
4. Si el MQL confirma el bot regresa al paso 7 del flujo original, caso contrario regresa al paso 5.

## Flujos de excepción

### E1. El evento no está disponible

1. El bot verifica la disponibilidad del evento. [RF-EVT-01]
2. El bot detecta que no está disponible.
3. El bot informa al Lead de la no disponibilidad del evento original y le pregunta si desea registrarse en una lista de espera para ese evento, en caso de que se libere un lugar. [RF-EVT-07]
4. Si el Lead acepta, el bot inicia el flujo de registro en la lista de espera para el evento original. [RF-EVT-07]
5. Adicionalmente, el bot muestra al Lead la lista de otros eventos disponibles. [RF-COM-04]
6. Se continúa el flujo de eventos de A1.

### E2. Error al obtener información del evento

1. El bot solicita la información del evento.
2. El sistema no puede obtener la información.
3. El bot notifica al Lead que la información no se encuentra disponible temporalmente y le pide que lo intente más tarde.
4. Se registra el error en los logs

### E3. El MQL no proporciona sus datos

1. El MQL se niega a proporcionar su información personal.
2. El bot notifica que no es posible continuar el proceso de inscripción sin sus datos.
3. El bot informa al MQL que puede ser atendido por un operador humano para resolver dudas o explorar alternativas de inscripción sin que sus datos hayan sido registrados aún.
4. El bot notifica al sistema para enviar la conversación a un agente administrativo y colocarla en la cola de espera para ser atendida por un operador humano.
5. El sistema registra la solicitud y la conversación permanece en espera de la intervención de un operador humano.
