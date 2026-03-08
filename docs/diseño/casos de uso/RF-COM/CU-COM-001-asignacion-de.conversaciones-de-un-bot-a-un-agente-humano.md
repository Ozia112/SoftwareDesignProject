# CU-COM-01. Asignación de conversaciones de un bot a un agente humano

## Metadatos

- ID: CU-COM-001
- Dominio: COM
- Nombre: Asignación de conversaciones de un canal de comunicación a Bot
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-03-08
- Última actualización: 2026-03-08
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

Permitir que el sistema automaticamente vincule al canal de comunicación entrante un Bot automatizado, con el fin de garantizar una atención rápida, organizada y escalable a los usuarios.

## Alcance

Indicar el límite del sistema o subsistema al que aplica este caso de uso.

## RF relacionados

- RF-COM-01
- RF-COM-05

## Actores

### Actor principal

- Lead usuario externo que inicia la conversación.

### Actores secundarios

- Administrador del canal: Usuario con permisos para gestionar conversaciones.
- Bot automatizado: Sistema que gestiona automáticamente la conversación con el usuario.
- Agente humano: Usuario que puede tomar control de la conversación cuando el bot lo determine.

## Disparador

Cuando un Lead decide entrar a una conversación de un evento de su interes desde un anuncio o decide mandar un mensaje directo.

## Precondiciones

- El agente humano y el administrador deben estar autenticados en el sistema con su determinado rol (administrador o supervisor).
- Debe existir al menos una conversación activa en el canal de comunicación.
- Debe existir al menos un Bot automatizado configurado y disponible en el sistema.
- El sistema de registro de logs debe estar activo.

## Postcondiciones

- La conversación queda asignada a un agente humano.
- La interacción con el lead continúa sin interrupciones hasta el cambio de bot a agente humano.
- Todas las acciones de asignación quedan registradas en los logs del sistema.

### En éxito

- El lead debe tener una conversación fluida donde se resuelvan sus dudas hasta donde el bot pueda ayudar para cambiar a un agente humano que termine la venta del evento.

### En fallo

- El bot es incapaz de contestar las preguntas del lead y por esto se cierre la conversación sin contactar a un agente humano.

## Flujo principal

1. El sistema debe continuar una conversación automaticamente através de un bot cuando el lead inicie la conversación. [RF-COM-01]

2. El Bot automatizado comienza a interactuar con el usuario.

3. El bot empieza a describir el evento al lead. [RF-COM-05]

4. El bot llega al punto donde no puede continuar la conversación.

5. El sistema mueve la conversación a una cola de espera que puede ver el administrador.

6. El administrador selecciona una conversación en espera.

7. El sistema muestra la opción de asignar la conversación a un agente humano.

8. El administrador selecciona el agente humano disponible.

9. La conversación pasa a manos del agente humano disponible. [RF-COM-01]

10. El sistema registra la asignación en el log del sistema.

## Flujos alternos

### A1. El lead decide no escalar a un agente humano

1. El Bot detecta que la conversación requiere intervención humana.

2. El Bot le notifica al lead que esa pregunta va a necesitar intervención humana y le pregunta si quiere continuar.

3. El lead decide continuar la conversación con el bot.

4. El bot regresa al paso 3.

## Flujos de excepción

### E1. No existen agentes humanos disponibles

1. El sistena manda un mensaje indicando que no hay agentes humanos disponibles.

2. La conversación se mantiene en una cola de espera hasta que se desocupen los agentes.

3. El sistema registra que envio la notificación a la conversación en logs.

### E2. No esta en funcionamiento el bot

1. El lead inicia la conversación pero no hay bot que conteste.

2. El sistema intenta asignar al bot automatizado, si no lo consigue notifica al administrador.

3. El administrador debe decidir si enviarlo directamente con un agente humano o cerrar la conversación.

### E3. Error en la asignación

1. Ocurre un fallo al asignar la conversación a un agente humano.

2. El sistema muestra un mensaje de error al administrador.

3. Se registra en los logs el intento fallido de asignación.

4. La conversación permanece en la cola de espera.

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

- RF: RF-COM-001, RF-EVT-005
- BPMN: BPMN-CUPO-001
- DDR: DDR-01
- Evidencia académica / entrega: enlace si aplica
