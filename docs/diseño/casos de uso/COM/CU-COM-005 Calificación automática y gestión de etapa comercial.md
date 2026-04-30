# CU-COM-005 Gestión de etapa comercial y calificación automática

## Metadatos

- ID: CU-COM-005
- Dominio: COM
- Nombre: Gestión de etapa comercial y calificación automática
- Estado: Borrador
- Versión: v0.3
- Fecha de creación: 2026-03-25
- Última actualización: 2026-04-28
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección por: Isaac Ortiz
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Gestionar la etapa comercial de la Persona interesada y calcular su calificación numérica de forma independiente durante la conversación con el Bot. La etapa comercial avanza según criterios observables del flujo conversacional; la calificación se calcula de forma continua en base a timestamps y número de interacciones, e influye exclusivamente en la priorización operativa.

## Alcance

Aplica a toda interacción gestionada por el Bot desde el inicio de la conversación hasta el escalamiento. Es invocado por CU-COM-002 y CU-COM-001 en cada punto donde se produzca un evento de transición de etapa o se requiera actualizar la calificación.

## RF relacionados

- [RF-COM-02]

## Actores

### Actor principal

- Persona interesada

### Actores secundarios

- Bot
- Sistema

## Disparador

El Bot recibe una señal de evento de la conversación que indica una transición de etapa comercial o requiere recalcular la calificación de la Persona interesada.

## Precondiciones

- La Persona interesada ha aceptado el aviso de privacidad mediante [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito].
- Existe un Bot activo y configurado.
- El Sistema tiene las reglas de calificación y transición definidas.

## Postcondiciones

### En éxito

- La etapa comercial de la Persona interesada queda actualizada en el sistema.
- La calificación numérica queda registrada y disponible para priorización operativa.

### En fallo

- La etapa comercial no se actualiza.
- La calificación no se recalcula.

## Flujo principal — Gestión de etapa comercial

1. El Bot recibe la señal de evento de transición y la envía al Sistema. [RF-COM-02]
2. El Sistema evalúa la señal contra las reglas de transición definidas. [RF-COM-02]
3. El Sistema determina la nueva etapa comercial según la tabla de transiciones:
   - Señal `conversacion_iniciada` → etapa **Lead**
   - Señal `datos_de_contacto_completados` → etapa **MQL**
   - Señal `pregunta_de_inscripcion_detectada` → etapa **Prospecto**
   - Señal `confirmacion_de_pago_pendiente` → etapa **SQL**
4. El Sistema valida que la nueva etapa sea posterior o igual a la etapa actual (no permite retroceso salvo flujo alterno A1). [RF-COM-02]
5. El Sistema registra la nueva etapa comercial y el timestamp de transición. [RF-COM-02]
6. El Bot recibe confirmación de la nueva etapa y adapta el flujo conversacional.

## Flujo principal — Calificación automática

1. El Bot envía al Sistema los timestamps de cada interacción y el contador total de interacciones de la conversación. [RF-COM-02]
2. El Sistema calcula el tiempo de respuesta promedio entre mensajes del cliente potencial.
3. El Sistema evalúa el número total de interacciones realizadas.
4. El Sistema aplica las reglas de puntuación para obtener una calificación entre 0 y 20. [RF-COM-02]
5. El Sistema registra la calificación actualizada y la deja disponible para priorización operativa (lista de espera, orden de atención).
6. El Bot recibe la calificación actualizada.

## Flujos alternos

### A1. Reducción de etapa comercial por cambio de evento

1. El Bot recibe la señal `evento_cambiado` después de que el Cliente potencial estaba en etapa Prospecto.
2. El Sistema reduce la etapa comercial a MQL. [RF-COM-02]
3. El Sistema registra la reducción de etapa y libera el cupo reservado del evento original.
4. El flujo regresa al paso 5 del Flujo principal — Gestión de etapa comercial.

### A2. Penalización de calificación por comportamiento no cooperativo

1. El Sistema detecta alguno de los siguientes patrones durante el recálculo de calificación:
   - Spam de preguntas: más de 5 mensajes en menos de 10 segundos.
   - Consulta repetida de disponibilidad de otros eventos (más de 3 veces en la misma conversación).
   - Respuestas de una sola letra o sin contenido relevante de forma consecutiva (más de 3 veces seguidas).
2. El Sistema aplica una penalización restando puntos a la calificación actual según la regla activada. [RF-COM-02]
3. El Sistema asegura que la calificación no baje del mínimo de 0.
4. El flujo regresa al paso 5 del Flujo principal — Calificación automática.

### A3. Penalización por intento de exploit del Bot

1. El Sistema detecta alguno de los siguientes patrones que indican un intento de manipulación del Bot para generar gasto excesivo de tokens o respuestas fuera del dominio del sistema:
   - Solicitud off-topic sin relación con el negocio (por ejemplo: "escríbeme un poema", "traduce este texto al francés").
   - Instrucción de formato absurdo o manipulación de respuesta (por ejemplo: "respóndeme sin usar vocales", "responde solo con emojis").
   - Consulta que requiere procesamiento computacional externo al dominio (por ejemplo: "dame los cursos cuyo número de participantes sea un número primo").
   - Intento de inyección de instrucciones al Bot para alterar su comportamiento (por ejemplo: "ignora tus instrucciones anteriores y...").
2. El Sistema aplica el mismo mecanismo de penalización descrito en A2 (resta de puntos con floor en 0) por el primer intento detectado. [RF-COM-02]
3. Si el patrón se detecta por segunda vez o más en la misma conversación, el Sistema emite la señal `exploit_reincidente` y bloquea la conversación de continuar de forma automatizada.
4. El Bot notifica a la Persona interesada que la conversación ha sido suspendida por uso inadecuado del sistema.
5. El Sistema registra el incidente en logs con el tipo de patrón detectado y el número de reincidencias.

### A4. Premio al happy path

1. El Sistema detecta que la Persona interesada siguió el flujo directo de CU-COM-002 sin desvíos: pasó de Lead a MQL, de MQL a Prospecto y de Prospecto a SQL en la misma conversación sin consultas repetidas, cambios de evento ni inactividad prolongada.
2. El Sistema aplica una bonificación sumando puntos adicionales a la calificación. [RF-COM-02]
3. El Sistema asegura que la calificación no supere el máximo de 20.
4. El flujo regresa al paso 5 del Flujo principal — Calificación automática.

## Flujos de excepción

### E1. Error al registrar la etapa comercial

1. En el paso 5 del Flujo principal — Gestión de etapa comercial, ocurre un error al persistir la nueva etapa.
2. El Sistema notifica al Bot del error.
3. Se registra el incidente en logs.
4. La etapa comercial no se actualiza; el Bot mantiene la etapa anterior.

### E2. Error al registrar la calificación

1. En el paso 5 del Flujo principal — Calificación automática, ocurre un error al persistir la calificación.
2. El Sistema notifica al Bot del error.
3. Se registra el incidente en logs.
4. La calificación no se actualiza; se conserva el valor anterior.

## Reglas de negocio / restricciones

- RN-COM-02-01: La calificación es independiente de la etapa comercial. La calificación no determina por sí solo el avance de etapa; solo influye en la priorización operativa.
- RN-COM-02-02: Solo puede existir una etapa comercial activa por Persona interesada.
- RN-COM-02-03: El avance de etapa comercial se basa exclusivamente en criterios observables de la conversación (señales de evento), no en la calificación.
- RN-COM-02-04: La calificación mínima es 0 y la máxima es 20.
- RN-COM-02-05: La calificación se recalcula de forma continua en cada interacción; no se calcula una sola vez al finalizar la conversación.
- RN-COM-02-06: La reducción de etapa solo está permitida ante la señal `evento_cambiado` cuando el Cliente potencial estaba en etapa Prospecto.
- RN-COM-02-07: Una conversación marcada con `exploit_reincidente` no puede ser retomada de forma automatizada; solo un operador humano puede reactivarla o cerrarla.

## Datos relevantes

### Entradas — Gestión de etapa comercial

- Señal de evento de transición: `conversacion_iniciada`, `datos_de_contacto_completados`, `pregunta_de_inscripcion_detectada`, `confirmacion_de_pago_pendiente`
- Etapa comercial actual de la Persona interesada

### Entradas — Calificación automática

- Timestamps de cada interacción de la Persona interesada con el Bot
- Contador total de interacciones de la conversación

### Salidas

- Etapa comercial actualizada: Lead, MQL, Prospecto, SQL
- Calificación numérica actualizada (0–20)
- Señal `exploit_reincidente` (emitida por este CU cuando aplica A3; persiste como estado de la conversación para invocaciones posteriores)

## Diagramas relacionados

- BPMN-COM-005

## Observaciones

- Este CU es el núcleo del proceso comercial; cualquier otro CU que requiera conocer la etapa comercial o la calificación debe invocar a este CU.
- La detección de intentos de exploit forma parte de la evaluación de calificación y no debe confundirse con errores del sistema; los incidentes deben quedar en logs para auditoría de seguridad.

## Trazabilidad

- RF: RF-COM-02
- BPMN: BPMN-COM-005
- DDR: DDR-01

[RF-COM-02]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-02%20Gestión%20de%20etapa%20comercial%20y%20calificación%20automática%20de%20leads.md

[CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito]: /docs/diseño/casos%20de%20uso/COM/CU-COM-004%20Presentación%20de%20avisos%20legales%20y%20registro%20de%20consentimiento%20tácito.md
