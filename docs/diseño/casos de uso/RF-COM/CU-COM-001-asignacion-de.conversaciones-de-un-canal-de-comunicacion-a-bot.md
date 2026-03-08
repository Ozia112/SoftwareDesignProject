# RF-COM-01. Asignación de conversaciones de un canal de comunicación a Bot

## Objetivo

Permitir que el sistema automaticamente vincule al canal de comunicación entrante un Bot automatizado, con el fin de garantizar una atención rápida, organizada y escalable a los usuarios.

## Actores

Administrador del canal: Usuario con permisos para gestionar conversaciones.

Bot automatizado: Sistema que gestiona automáticamente la conversación con el usuario.

Agente humano: Usuario que puede tomar control de la conversación cuando el bot lo determine.

## Precondiciones

El usuario debe estar autenticado en el sistema con rol de administrador o supervisor.

Debe existir al menos una conversación activa en el canal de comunicación.

Debe existir al menos un Bot automatizado configurado y disponible en el sistema.

El sistema de registro de logs debe estar activo.

## Flujo principal

El sistema debe iniciar una conversación automaticamente cuando el lead inicie la conversación.

El administrador o supervisor accede al módulo de gestión de conversaciones.

El Bot automatizado comienza a interactuar con el usuario.

El bot llega al punto donde no puede continuar la conversación.

El sistema muestra la lista de conversaciones activas del canal.

La conversación pasa a la lista automaticamente por el sistema.

El administrador o supervisor selecciona una conversación.

El sistema muestra la opción de asignar la conversación a un agente humano.

El administrador o supervisor selecciona el agente humano disponible.

El sistema registra la asignación en el log del sistema.

## Flujos alternos

### A1. Asignación posterior a agente humano

Durante la interacción, el Bot detecta que la conversación requiere intervención humana.

El Bot asigna la conversación a un agente humano disponible.

El sistema envía una notificación al administrador.

El administrador pasa la conversación a un agente humano para que acepte la conversación y continúe la atención.

El sistema registra el cambio de asignación en los logs.

## Postcondiciones

La conversación queda asignada a un Bot automatizado o a un agente humano.

La interacción con el usuario continúa sin interrupciones.

Todas las acciones de asignación quedan registradas en los logs del sistema.

## Excepciones

### E1. No existen agentes humanos disponibles

El administrador manda un mensaje indicando que no hay agentes humanos disponibles.

El administrador puede enviar la conversación a una cola de espera hasta que se desocupen los agentes.

El sistema registra el evento en logs.

### E2. Error en la asignación

Si ocurre un fallo al asignar la conversación a un, el sistema muestra un mensaje de error.

La conversación permanece sin cambios hasta que se intente nuevamente la asignación.
