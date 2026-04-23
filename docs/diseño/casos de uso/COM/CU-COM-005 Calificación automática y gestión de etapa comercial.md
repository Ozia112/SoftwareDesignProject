# CU-COM-005 Calificación automática de la Persona interesada

## Metadatos

- ID: CU-COM-005
- Dominio: COM
- Nombre: Calificación automática de la Persona interesada
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-25
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Evaluar automáticamente a la Persona interesada durante la interacción con el Bot, asignando una calificación y actualizando su etapa comercial conforme a su comportamiento y respuestas.

## Alcance

Aplica al proceso de interacción conversacional gestionado por el Bot, específicamente en la recopilación, evaluación y uso de información para calificación y gestión de etapas comerciales.

## RF relacionados

- RF-COM-02
- RF-COM-07

## Actores

### Actor principal

- Persona interesada

### Actores secundarios

- Bot
- Sistema

## Disparador

La Persona interesada interactúa con el Bot después de haber aceptado el aviso de privacidad.

## Precondiciones

- La Persona interesada ha aceptado el aviso de privacidad. [RF-COM-07]
- Existe un Bot activo y configurado.
- El sistema tiene reglas de calificación definidas.

## Postcondiciones

### En éxito

- La Persona interesada tiene una calificación asignada (alto, medio o bajo).
- Se registra la calificación en el sistema.
- Se asigna o actualiza la etapa comercial.
- La información queda disponible para priorización de atención.

### En fallo

- No se asigna calificación.
- La etapa comercial no se actualiza automáticamente.

## Flujo principal

1. La Persona interesada interactúa con el Bot.
2. El Bot evalúa señales de interés de la Persona interesada a través del tiempo de respuesta y la cantidad de interacción.
3. La Persona interesada responde a las preguntas.
4. El Sistema recopila y procesa la información obtenida.
5. El Sistema evalúa la información según reglas configuradas. [RF-COM-02]
6. El Sistema asigna una calificación (alto, medio o bajo).
7. El Sistema actualiza o asigna la etapa comercial correspondiente.
8. El Bot adapta la conversación con base en la calificación y etapa.

## Flujos alternos

### A1. Información incompleta

1. En el paso 3, la Persona interesada no proporciona información suficiente.
2. El Bot solicita información adicional.
3. El flujo regresa al paso 2.

### A2. Baja intención de inscripción

1. En el paso 6, el Sistema asigna calificación baja.
2. El Bot prioriza información general o seguimiento pasivo.
3. La etapa comercial puede mantenerse sin avanzar.

## Flujos de excepción

### E1. Error en evaluación

1. En el paso 5, ocurre un error al procesar la información.
2. El Sistema informa el error.
3. Se registra el incidente en logs.
4. No se actualiza la calificación ni la etapa.

## Reglas de negocio / restricciones

- RN-COM-02-01: La calificación es independiente de la etapa comercial.
- RN-COM-02-02: La calificación puede influir en la actualización de la etapa.
- RN-COM-02-03: Solo puede existir una etapa comercial activa por Persona interesada.
- RN-COM-02-04: La calificación debe basarse en el nivel de interés medido mediante el tiempo de respuesta y la cantidad de interacción de la Persona interesada con el bot.

## Datos relevantes

### Entradas

- Respuestas de la Persona interesada
- Datos de interacción

### Salidas

- Calificación (alto, medio, bajo)
- Etapa comercial actualizada

## Diagramas relacionados

- BPMN-COM-005

## Observaciones

- La calificación se ejecuta de forma continua durante la conversación.
- Este CU es núcleo del proceso comercial y afecta priorización operativa.

## Trazabilidad

- RF: RF-COM-02, RF-COM-07
- BPMN: BPMN-COM-005
- DDR: DDR-01

[RF-COM-02]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-02%20Gestión%20de%20etapa%20comercial%20y%20calificación%20automática%20de%20leads.md
[RF-COM-07]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md
