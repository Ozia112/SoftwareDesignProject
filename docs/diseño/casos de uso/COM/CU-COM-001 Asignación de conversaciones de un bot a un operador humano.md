# CU-COM-001 Asignación de conversaciones de un bot a un operador humano

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
 - Este caso de uso cubre el escenario en que una persona interesada inicia una conversación en un canal de comunicación hasta la asignación de dicha conversación a un operador humano cuando el bot no pueda continuar o cuando la etapa comercial de la persona lo requiera (por ejemplo, Prospecto o SQL).
 - Incluye cola de espera, selección de operador humano disponible, registro de logs y la persistencia de datos de contacto cuando la Persona pasa de Lead a MQL.

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
 - El sistema puede registrar y persistir datos de contacto en la base de datos y actualizar la etapa comercial a MQL cuando la Persona interesada entregue datos y otorgue consentimiento (ver CU-COM-004).

## Postcondiciones

### En éxito

- La conversación queda asignada a un operador humano.
- La interacción con la persona interesada continúa sin interrupciones hasta el cambio de bot a operador humano.
- Todas las acciones de asignación quedan registradas en los logs del sistema.
- La persona interesada tiene una conversación fluida donde se resuelven sus dudas hasta donde el bot puede ayudar y, cuando este llega a su límite, el sistema escala correctamente la conversación a un operador humano para continuar la atención o terminar la venta del evento.

### En fallo

- Cuando la conversación debe escalarse a un operador humano pero el bot o el sistema no activan o no completan dicha transición (no se levanta la bandera o falla la asignación), provocando que la conversación se interrumpa sin ser atendida por un operador humano.

## Flujo principal
1. El sistema inicia la conversación automáticamente a través de un Bot cuando la Persona interesada (Lead) inicia la interacción. [RF-COM-01]
2. El Bot automatizado comienza a interactuar con la Persona interesada.
3. Si la Persona interesada demuestra interés en seguimiento o inscripción, el Bot puede necesitar capturar datos básicos de contacto. Antes de capturar cualquier dato, se debe ejecutar el flujo de `CU-COM-004` (Gestión de consentimiento de privacidad). Si la Persona acepta, el Sistema persiste los datos en la base de datos y, cuando corresponda, actualiza la etapa comercial a MQL.
4. El Bot describe el evento según corresponda. [RF-COM-05]
5. El Bot detecta que ha llegado al límite de sus capacidades para resolver la consulta, o que la naturaleza de la interacción (por ejemplo, gestión de pagos o negociación) requiere intervención humana.
6. El Sistema valida la etapa comercial de la Persona interesada: si la etapa es `Prospecto` o `SQL`, o si el bot determina que la intervención humana es necesaria independientemente de la etapa, se procede al escalamiento; en caso contrario, se ofrecen alternativas automatizadas o seguimiento asincrónico.
7. Si procede el escalamiento, el Sistema mueve la conversación a una cola de espera visible por los operadores humanos y administrativos.
8. Un operador administrativo selecciona una conversación en espera.
9. El sistema muestra la opción de asignar la conversación a un operador humano y el operador selecciona al disponible.
10. La conversación pasa a manos del operador humano seleccionado. [RF-COM-01]
11. El sistema registra la asignación en los logs y conserva la trazabilidad de la actualización de etapa y de los datos persistidos cuando aplique.

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

## Reglas de negocio / restricciones

- La conversación debe permanecer en estado trazable durante toda transición bot-operador.
- Solo operadores humanos disponibles pueden recibir conversaciones escaladas.
- Toda asignación o reasignación debe quedar registrada en logs del sistema.
 - El escalamiento a operador humano debe estar anclado a la etapa comercial y a la naturaleza de la interacción: Prospecto y SQL requieren intervención humana preferente.
 - El sistema debe persistir en la base de datos los datos de contacto cuando la Persona pase de Lead a MQL tras otorgar consentimiento (CU-COM-004).

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

[RF-COM-01]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-01%20Asignación%20de%20conversaciones%20de%20un%20canal%20de%20comunicación%20a%20Bot.md
[RF-COM-05]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-05%20El%20Bot%20debe%20proporcionar%20información%20detallada%20de%20cada%20evento.md
