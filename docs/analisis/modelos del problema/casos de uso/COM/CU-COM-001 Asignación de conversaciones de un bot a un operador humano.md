# CU-COM-001 Asignación de bot a un operador humano

## Metadatos

- ID: CU-COM-001
- Dominio: COM
- Nombre: Asignación de conversaciones de un canal de comunicación a Bot
- Estado: Borrador
- Versión: v0.5
- Fecha de creación: 2026-03-08
- Última actualización: 2026-05-05
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección por: Isaac Ortiz
- Issue relacionado: PSD-08, PSD-13
- PR relacionado: #XX

## Objetivo

Orquestar la asignación automática de conversaciones entre canales de comunicación, el Bot automatizado y operadores humanos, garantizando una atención rápida, organizada y escalable. El sistema gestiona todas las transiciones: asignación inicial del canal al Bot, escalamiento del Bot al operador humano cuando sea necesario, y devolución del operador humano al Bot cuando aplique.

## Alcance

Cubre el ciclo completo de control conversacional del sistema:

1. Asignación inicial del canal entrante al Bot automatizado.
2. Escalamiento del Bot al operador humano cuando el Bot no pueda continuar (Lead, MQL, Prospecto sin resolución o SQL por confirmación de pago).
3. Devolución del operador humano al Bot cuando la conversación regresa a una etapa automatizable.
4. Gestión de colas de espera cuando no hay operadores disponibles.
5. Registro de auditoría completo de todas las transiciones.

## RF relacionados

- [RF-COM-01]
- [RF-COM-05]

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

### En éxito

- La conversación queda asignada a un operador humano.
- La interacción con la persona interesada continúa sin interrupciones hasta el cambio de bot a operador humano.
- Todas las acciones de asignación quedan registradas en los logs del sistema.
- La persona interesada tiene una conversación fluida donde se resuelven sus dudas hasta donde el bot puede ayudar y, cuando este llega a su límite, el sistema escala correctamente la conversación a un operador humano para continuar la atención o terminar la venta del evento.

### En fallo

- Cuando la conversación debe escalarse a un operador humano pero el bot o el sistema no activan o no completan dicha transición (no se levanta la bandera o falla la asignación), provocando que la conversación se interrumpa sin ser atendida por un operador humano.

## Flujo principal — Lead

1. El Bot no logra comprender la información proporcionada por el Lead o el Lead hace una pregunta que no puede resolverse con la información disponible en los bancos de contexto consultados en [CU-COM-003 Gestión de bancos de contexto]. [RF-COM-05]
2. El Bot ofrece la opción de escalar a un operador humano para continuar la conversación. [RF-COM-01]
3. Si el Lead acepta, el bot levanta una bandera de escalamiento a operador humano. [RF-COM-01]
4. El sistema asigna la conversación a la bandeja de atención humana. [RF-COM-01]

## Flujo principal — MQL

1. El Bot no logra comprender la duda del MQL o el MQL hace una pregunta que no puede resolverse con la información disponible en los bancos de contexto consultados en [CU-COM-003 Gestión de bancos de contexto]. [RF-COM-05]
2. El Bot ofrece la opción de escalar a un operador humano para continuar la conversación. [RF-COM-01]
3. Si el MQL acepta, el bot levanta una bandera de escalamiento a operador humano. [RF-COM-01]
4. El sistema asigna la conversación a la bandeja de atención humana. [RF-COM-01]

## Flujo principal — Prospecto

1. El Bot no logra comprender la duda del Prospecto o el Prospecto hace una pregunta que no puede resolverse con la información disponible en los bancos de contexto consultados en [CU-COM-003 Gestión de bancos de contexto]. [RF-COM-05]
2. El Bot ofrece la opción de escalar a un operador humano para continuar la conversación. [RF-COM-01]
3. Si el Prospecto acepta, el bot levanta una bandera de escalamiento a operador humano. [RF-COM-01]
4. El sistema asigna la conversación a la bandeja de atención humana. [RF-COM-01]

## Flujo principal — SQL

1. El Bot determina automáticamente que la verificación de pago solo puede ser realizada por un operador humano. [RF-COM-01]
2. El bot levanta una bandera de escalamiento a operador humano. [RF-COM-01]
3. El sistema asigna la conversación a la bandeja de atención humana. [RF-COM-01]

## Flujos alternos

### A1. El Lead decide no escalar a un operador humano

1. El Bot detecta que la conversación requiere intervención humana.
2. El Bot le notifica al Lead que esa pregunta va a necesitar intervención humana y le pregunta si quiere continuar.
3. El Lead decide continuar la conversación con el bot.
4. El bot regresa al paso 1 de cualquier flujo principal.

Nota: Este flujo solo aplica a clientes potenciales con las etapas: Lead, MQL y Prospecto. Para SQL el bot no ofrece la opción de continuar la conversación.

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

## Reglas de negocio relacionadas

- `RN-COM-ESC-01`
- `RN-COM-ESC-02`
- `RN-COM-ESC-03`

Referencia:

- `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md`

## Datos relevantes

### Entradas

- Conversación activa iniciada por la persona interesada.
- Estado de disponibilidad de operadores humanos.
- Señal de escalamiento generada por el bot o el sistema.

### Salidas

- Conversación asignada a operador humano o mantenida en cola de espera.
- Confirmación de transición bot-operador.
- Registro de auditoría de la asignación o del error.

## Diagramas relacionados

- BPMN-COM-001

## Observaciones

- El flujo considera retorno de control al bot cuando la conversación vuelve a una etapa automatizable.
- La continuidad de atención depende de la disponibilidad operativa de operadores humanos.

## Trazabilidad

- RF: RF-COM-01, RF-COM-05
- BPMN: BPMN-COM-001
- DDR: DDR-01

[RF-COM-01]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-01%20Asignación%20de%20conversaciones%20de%20un%20canal%20de%20comunicación%20a%20Bot.md
[RF-COM-05]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-05%20El%20Bot%20debe%20proporcionar%20información%20detallada%20de%20cada%20evento.md
[CU-COM-003 Gestión de bancos de contexto]: /docs/analisis/modelos%20del%20problema/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
