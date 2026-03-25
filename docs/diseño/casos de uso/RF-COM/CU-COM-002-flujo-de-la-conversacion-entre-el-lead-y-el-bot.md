# CU-CUM-002 Flujo de la conversación entre el lead y el bot

## Metadatos

- ID: CU-CUM-002
- Dominio: COM
- Nombre: Flujo de la conversación entre el lead y el bot
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-03-08
- Última actualización: 2026-03-08
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

Describrir como el bot debería actuar en la conversación con el lead.

## Alcance

Indicar el límite del sistema o subsistema al que aplica este caso de uso.

## RF relacionados

- RF-COM-04
- RF-COM-05
- RF-COM-06
- RF-COM-07
- RF-EVT-01

## Actores

### Actor principal

- lead encargado de hacerle preguntas al bot.

### Actores secundarios

- Bot encargado de contestar las preguntas del lead.
- Base de datos

## Disparador

Después de que el lead inicia la conversación y hace una pregunta al bot que puede contestar.

## Precondiciones

- Debe existir al menos un Bot automatizado configurado y disponible en el sistema.
- Debe existir información acerca del evento del que el lead esta preguntando.
- Debe estar vigente el evento.

## Postcondiciones

- El bot debe notificar al sistema para enviar la conversación al administrador.

### En éxito

- El lead debe continuar en la conversación con el bot hasta que el bot llegue al punto donde no pueda continuar sin un agente humano.

### En fallo

- El lead cierra la conversación por falta de interés o respuesta del bot.

## Flujo principal

1. El lead entra a la conversación desde un anuncio y le hace una pregunta al bot.

2. El bot debe verificar la disponibilidad del evento de interés del lead. [RF-EVT-01]

3. El bot debe proporcionar la información del evento en cuestión. [RF-COM-05]

4. El lead solicita información sobre horarios y fechas del evento.

5. El bot consulta la información del evento y proporciona las fechas y horarios disponibles al lead. [RF-COM-06]

6. El usuario esta interesado en el evento y quiere inscribirse.

7. El bot debe mandar una notificación de privacidad al usuario para posteriormente pedirle su nombre, su número y opcionalmente su correo electronico.

8. Una vez obtenido la información del lead el bot debe notificar al lead acerca de que va a ser redirigido con un agente humano y si desea continuar.

9. El bot notifica al sistema para colocar al lead en una cola de espera para ser atendido por un agente humano.

10. El sistema registra la solicitud y mantiene la conversación en espera hasta que un agente esté disponible.

## Flujos alternos

### A1. El lead no esta interesado en el evento actual

1. Una vez obtenida la información o los horarios del evento que le causo el interes el lead pregunta si no hay otros eventos.
2. El bot debe proporcionar una lista con otros eventos disponibles [RF-COM-04]
3. Regresar al paso donde se consulta el evento.

### A2. El lead ya esta interesado a inscribirse y esta informado previamente de las fechas

1. El lead le dice al bot nada más iniciar la conversación que quiere inscribirse.
2. El bot le debe confirmar la disponibilidad del evento.
3. El bot le debe preguntar al lead si sabe los horarios del evento.
4. Si el lead confirma el bot regresa al paso 7 del flujo original, caso contrario regresa al paso 5.

## Flujos de excepción

### E1. El evento no esta disponible

1. El bot verifica la disponibilidad del evento. [RF-EVT-01]
2. El bot detecta que no esta disponible.
3. Se informa al lead de la no disponibilidad del evento y se le muestra la lista de los eventos disponibles. [RF-COM-04]
4. Se continua el flujo de eventos de A1.

### E2. Error al obtener información del evento

1. El bot solicita la información del evento.
2. El sistema no puede obtener la información.
3. El bot notifica al lead que la información no sé encuentra disponible temporalmente y le pide que lo intente más tarde.
4. Se registra el error en los logs

### E3. El lead no proporciona sus datos

1. El lead se niega a proporcionar su información personal.
2. El bot notifica que no es posible continuar su inscripción sin sus datos.
3. La conversación permanece activa sin la posibilidad de inscripción.

## Reglas de negocio / restricciones

- RN-XX: Regla aplicable
- Restricción de tiempo, cupo, privacidad, etc.

## Datos relevantes

### Entradas

- Dato 1
- Dato 2

### Salidas

- Resultado 1
- Resultado 2

## Diagramas relacionados

- BPMN-XXX-001
- ../resources/cu-xxx-nnn-01.png

## Observaciones

- Supuestos
- Dudas abiertas
- Notas para revisión

## Trazabilidad

- RF: RF-COM-002, RF-EVT-001
- BPMN: BPMN-CUPO-001
- DDR: DDR-01
- Evidencia académica / entrega: enlace si aplica
