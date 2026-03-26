# CU-COM-001 Asignación de conversaciones de un Bot a un agente humano

## Metadatos

- ID: CU-COM-001
- Dominio: COM
- Nombre: Asignación de conversaciones de un Bot a un agente humano
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-08
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-15
- PR relacionado: #522

## Objetivo

Permitir que el sistema asigne automáticamente una conversación entrante a un Bot automatizado y, cuando sea necesario, escalarla a un agente humano para garantizar atención continua y efectiva.

## Alcance

Aplica al módulo de gestión de conversaciones del sistema bot, incluyendo asignación automática, escalamiento y registro de interacción.

## RF relacionados

- RF-COM-01
- RF-COM-05

## Actores

### Actor principal

- Persona interesada (Lead): inicia la conversación a través de un canal de comunicación.

### Actores secundarios

- Bot automatizado: gestiona la interacción inicial.
- Usuario (operador del sistema bot): administra y asigna conversaciones.
- Agente humano: toma control de la conversación cuando es necesario.
- Sistema: gestiona la lógica de asignación y registro.

## Disparador

La persona interesada inicia una conversación desde un canal de comunicación (ej. mensaje directo o anuncio).

## Precondiciones

- Existe al menos un Bot automatizado configurado.
- Existe al menos un Usuario (operador) autenticado en el sistema.
- El sistema de registro de logs está activo.
- Existe un canal de comunicación habilitado.

## Postcondiciones

### En éxito

- La conversación es atendida inicialmente por el Bot y, si aplica, asignada a un agente humano.
- La asignación queda registrada en logs.
- La interacción continúa sin pérdida de contexto.

### En fallo

- La conversación no puede ser asignada correctamente.
- Se registra el error en logs y se mantiene en cola de espera.

## Flujo principal

1. La Persona interesada inicia una conversación en un canal.
2. El Sistema asigna automáticamente la conversación a un Bot. [RF-COM-01]
3. El Bot inicia la interacción con la Persona interesada.
4. El Bot proporciona información inicial del evento. [RF-COM-05]
5. El Bot detecta que la conversación requiere intervención humana.
6. El Sistema coloca la conversación en una cola de espera.
7. El Usuario (operador) visualiza la conversación pendiente.
8. El Usuario asigna la conversación a un agente humano disponible.
9. El Sistema transfiere la conversación al agente humano. [RF-COM-01]
10. El Sistema registra la asignación en logs.

## Flujos alternos


1. En el paso 5, el Bot pregunta si desea continuar con atención humana.
2. La Persona interesada decide continuar con el Bot.
3. El flujo regresa al paso 4.

## Flujos de excepción


### E1. No hay agentes humanos disponibles

1. En el paso 8, no hay agentes disponibles.
2. El Sistema notifica al usuario.
3. La conversación permanece en cola.
4. Se registra el evento en logs.

### E2. El Bot no está disponible

1. En el paso 2, el Sistema no puede asignar un Bot.
2. El Sistema notifica al Usuario (operador).
3. El Usuario decide asignar directamente a un agente humano o cerrar la conversación.

### E3. Error en la asignación

1. Ocurre un error en el paso 9.
2. El Sistema muestra error al Usuario.
3. Se registra en logs.
4. La conversación permanece en cola.

## Reglas de negocio / restricciones

- RN-COM-01: Toda conversación debe ser atendida inicialmente por un Bot si está disponible.
- RN-COM-02: La asignación a agente humano debe quedar registrada en logs.
- RN-COM-03: Solo Usuarios autorizados pueden asignar conversaciones.

## Datos relevantes

### Entradas

- Mensaje inicial de la Persona interesada
- Canal de comunicación

### Salidas

- Conversación asignada (Bot o agente humano)
- Registro en logs

## Diagramas relacionados

- BPMN-COM-001

## Observaciones

- El Bot puede usar el banco de contexto para responder.
- El escalamiento depende de reglas configuradas.

## Trazabilidad

- RF: RF-COM-01, RF-COM-05
- BPMN: BPMN-COM-001
- DDR: DDR-01
