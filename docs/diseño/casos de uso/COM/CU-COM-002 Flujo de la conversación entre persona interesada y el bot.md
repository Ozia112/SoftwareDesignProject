# CU-COM-002 Flujo de la conversación entre la Persona interesada y el Bot

## Metadatos

- ID: CU-COM-002
- Dominio: COM
- Nombre: Flujo de la conversación entre la Persona interesada y el Bot
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-08
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Describir el flujo de interacción entre la Persona interesada y el Bot, desde el inicio de la conversación hasta el punto de escalamiento a un operador humano o abandono.

## Alcance

Aplica al módulo de conversación del sistema bot, incluyendo consulta de eventos, validación de disponibilidad, entrega de información y transición a atención por operador humano.

## RF relacionados

- RF-COM-04
- RF-COM-05
- RF-COM-06
- RF-COM-07
- RF-EVT-01

## Actores

### Actor principal

- Persona interesada: inicia la conversación y solicita información.

### Actores secundarios

- Bot: gestiona la conversación y responde consultas.
- Sistema: procesa solicitudes y consulta datos.
- Base de datos: almacena información de eventos.

## Disparador

La Persona interesada inicia una conversación con el Bot y realiza una consulta sobre un evento.

## Precondiciones

- Existe al menos un Bot configurado y disponible.
- Existe al menos un Evento registrado en el sistema.
- El Evento se encuentra vigente.
- El sistema tiene acceso a la base de datos.

## Postcondiciones

### En éxito

- La Persona interesada recibe información del Evento.
- El Bot puede escalar la conversación a un operador humano.
- La interacción queda registrada en el sistema.

### En fallo

- No se puede obtener información del Evento.
- La conversación se detiene o continúa sin avance hacia inscripción.

## Flujo principal

1. La Persona interesada inicia la conversación con el Bot.
2. El Bot identifica la intención de consulta sobre un Evento.
3. El Sistema valida la disponibilidad del Evento. [RF-EVT-01]
4. El Bot presenta información general del Evento. [RF-COM-05]
5. La Persona interesada solicita fechas y horarios.
6. El Bot consulta y muestra fechas y horarios disponibles. [RF-COM-06]
7. La Persona interesada muestra interés en inscribirse.
8. El Bot muestra aviso de privacidad y solicita consentimiento. [RF-COM-07]
9. Si acepta, el Bot solicita datos básicos (nombre, teléfono, correo opcional).
10. El Sistema registra la información de la Persona interesada.
11. El Bot informa que será transferido a un operador humano.
12. El Sistema coloca la conversación en cola de espera.
13. El Sistema registra la interacción.

## Flujos alternos

### A1. La Persona interesada solicita otros eventos

1. En el paso 4 o 6, la Persona interesada solicita otras opciones.
2. El Bot muestra lista de eventos disponibles. [RF-COM-04]
3. El flujo regresa al paso 4.

### A2. La Persona interesada desea inscribirse directamente

1. En el paso 2, la Persona interesada indica intención directa de inscripción.
2. El Sistema valida disponibilidad. [RF-EVT-01]
3. Si hay cupo, el flujo continúa en el paso 8.
4. Si no hay cupo, se activa flujo de excepción E1.

## Flujos de excepción

### E1. Evento sin disponibilidad

1. En el paso 3, el Sistema detecta que no hay cupo. [RF-EVT-01]
2. El Bot informa que el Evento está lleno.
3. El Bot ofrece registro en lista de espera para el Evento original. [RF-EVT-07]
4. Si la Persona interesada acepta, se activa el flujo de CU-EVT-001. [RF-EVT-07]
5. El Bot también ofrece alternativas (otros eventos). [RF-COM-04]

### E2. Error al obtener información

1. En el paso 4 o 6, el Sistema no puede consultar datos.
2. El Bot informa indisponibilidad temporal.
3. Se registra el error en logs.

### E3. No aceptación de privacidad

1. En el paso 8, la Persona interesada rechaza el aviso.
2. El Bot informa que no puede continuar sin consentimiento.
3. El flujo se detiene.

## Reglas de negocio / restricciones

- RN-COM-04: El Bot debe mostrar eventos disponibles desde la base de datos.
- RN-COM-05: El Bot debe proporcionar información detallada del Evento.
- RN-COM-07: No se puede continuar sin consentimiento de privacidad.
- RN-EVT-01: No se puede avanzar si no hay cupo disponible.

## Datos relevantes

### Entradas

- Consulta de la Persona interesada
- Evento seleccionado

### Salidas

- Información del Evento
- Estado de la conversación

## Diagramas relacionados

- BPMN-COM-002

## Observaciones

- El flujo puede variar dependiendo del nivel de interés.
- La calificación de la Persona interesada ocurre en paralelo (RF-COM-02).

## Trazabilidad

- RF: RF-COM-04, RF-COM-05, RF-COM-06, RF-COM-07, RF-EVT-01
- BPMN: BPMN-COM-002
- DDR: DDR-01

[RF-COM-04]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-04%20El%20Bot%20debe%20mostrar%20el%20listado%20de%20eventos%20disponibles.md
[RF-COM-05]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-05%20El%20Bot%20debe%20proporcionar%20información%20detallada%20de%20cada%20evento.md
[RF-COM-06]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-06%20El%20Bot%20debe%20informar%20fechas%20de%20inicio%20y%20horarios%20disponibles.md
[RF-COM-07]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md
[RF-EVT-01]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01%20Verificacion%20de%20disponibilidad%20de%20cupo.md
[RF-EVT-07]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-07%20Gestion%20de%20lista%20de%20espera.md
