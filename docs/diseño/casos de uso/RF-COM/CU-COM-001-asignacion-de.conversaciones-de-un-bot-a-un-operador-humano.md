# CU-COM-01. Asignación de conversaciones de un bot a un operador humano

## Metadatos

- ID: CU-COM-001
- Dominio: COM
- Nombre: Asignación de conversaciones de un canal de comunicación a Bot
- Estado: Borrador
- Versión: v0.3
- Fecha de creación: 2026-03-08
- Última actualización: 2026-03-26
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-08, PSD-13
- PR relacionado: #XX

## Objetivo

Permitir que el sistema automáticamente vincule al canal de comunicación entrante un Bot automatizado, con el fin de garantizar una atención rápida, organizada y escalable a los usuarios.

## Alcance

- Este caso de uso cubre el escenario en que una persona interesada inicia una conversación en un canal de comunicación hasta la asignación de dicha conversación a un operador humano cuando el bot no pueda continuar.
- Incluye cola de espera, selección de operador humano disponible y registro de logs

## RF relacionados

- RF-COM-01
- RF-COM-05

## Actores

### Actor principal

- Persona interesada que inicia la conversación en el canal de comunicación.

### Actores secundarios

- Operador administrativo del canal: Usuario con permisos para gestionar conversaciones.
- Bot automatizado: Sistema que gestiona automáticamente la conversación con el usuario.
- Operador humano: Usuario que puede tomar control de la conversación cuando el bot lo determine.

## Disparador

Cuando una persona interesada decide entrar a una conversación de un evento de su interés desde un anuncio o decide mandar un mensaje directo.

## Precondiciones

- El operador humano y el operador administrativo deben estar autenticados en el sistema con su determinado rol (administrador o supervisor).
- Debe existir al menos una conversación activa en el canal de comunicación.
- Debe existir al menos un Bot automatizado configurado y disponible en el sistema.
- El sistema de registro de logs debe estar activo.

## Postcondiciones

- La conversación queda asignada a un operador humano.
- La interacción con la persona interesada continúa sin interrupciones hasta el cambio de bot a operador humano.
- Todas las acciones de asignación quedan registradas en los logs del sistema.

### En éxito

- La persona interesada debe tener una conversación fluida donde se resuelvan sus dudas hasta donde el bot pueda ayudar y, cuando este llegue a su límite, el sistema debe escalar correctamente la conversación a un operador humano para que continúe la atención o termine la venta del evento.

### En fallo

- Cuando la conversación debe escalarse a un operador humano pero el bot o el sistema no activan o no completan dicha transición (no se levanta la bandera o falla la asignación), provocando que la conversación se interrumpa sin ser atendida por un operador humano.

## Flujo principal

1. El sistema debe continuar una conversación automáticamente a través de un bot cuando el Lead inicie la conversación. [RF-COM-01]

2. El Bot automatizado comienza a interactuar con el usuario.

3. El bot empieza a describir el evento al Lead. [RF-COM-05]

4. El bot llega al punto donde no puede continuar la conversación.

5. El sistema mueve la conversación a una cola de espera que puede ver el operador administrativo.

6. El operador administrativo selecciona una conversación en espera.

7. El sistema muestra la opción de asignar la conversación a un operador humano.

8. El operador administrativo selecciona el operador humano disponible.

9. La conversación pasa a manos del operador humano disponible. [RF-COM-01]

10. El sistema registra la asignación en el log del sistema.

## Flujos alternos

### A1. El Lead decide no escalar a un operador humano

1. El Bot detecta que la conversación requiere intervención humana.

2. El Bot le notifica al Lead que esa pregunta va a necesitar intervención humana y le pregunta si quiere continuar.

3. El Lead decide continuar la conversación con el bot.

4. El bot regresa al paso 3.

### A2. Devolución de la conversación al bot

1. Después de que la conversación pasó a manos de un operador humano, el operador resuelve una duda puntual del Lead y detecta que el resto del flujo puede continuar de forma automatizada (por ejemplo, llenado de formularios o avance en etapas comerciales tempranas).
2. El operador humano selecciona en el sistema la opción de devolver la conversación al bot.
3. El sistema valida que la conversación no se encuentre en una etapa de confirmación de pago o cierre de venta; si está en dicha etapa, rechaza la devolución y mantiene el control en el operador humano.
4. Si la validación es exitosa, el sistema reasigna la conversación al bot automatizado y registra el cambio en los logs.
5. El bot retoma la conversación con el Lead a partir del flujo automatizado correspondiente.

## Flujos de excepción

### E1. No existen operadores humanos disponibles

1. El sistema manda un mensaje indicando que no hay operadores humanos disponibles.

2. La conversación se mantiene en una cola de espera hasta que se desocupen los operadores humanos.

3. El sistema registra que envió la notificación a la conversación en logs.

### E2. No está en funcionamiento el bot

1. El Lead inicia la conversación pero no hay bot que conteste.

2. El sistema intenta asignar al bot automatizado, si no lo consigue notifica al operador administrativo.

3. El operador administrativo debe decidir si enviarlo directamente con un operador humano o cerrar la conversación.

### E3. Error en la asignación

1. Ocurre un fallo al asignar la conversación a un operador humano.

2. El sistema muestra un mensaje de error al operador administrativo.

3. Se registra en los logs el intento fallido de asignación.

4. La conversación permanece en la cola de espera.
