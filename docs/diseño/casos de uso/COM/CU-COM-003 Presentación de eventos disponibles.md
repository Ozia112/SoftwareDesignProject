# CU-COM-003 Presentación de eventos disponibles

## Metadatos

- ID: CU-COM-003
- Dominio: COM
- Nombre: Presentación de eventos disponibles
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-10
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Permitir que la Persona interesada consulte el listado de eventos disponibles con información básica (nombre y descripción) para explorar opciones activas.

## Alcance

Aplica a la interacción entre la Persona interesada y el Bot para la consulta de eventos disponibles almacenados en el sistema.

## RF relacionados

- RF-COM-04
- RF-COM-05

## Actores

### Actor principal

- Persona interesada

### Actores secundarios

- Bot
- Sistema
- Base de datos
- Usuario (operador del sistema)

## Disparador

La Persona interesada solicita conocer otros eventos disponibles durante la conversación.

## Precondiciones

- Existe al menos un Bot activo y configurado
- Existen eventos registrados en el sistema
- Los eventos tienen estado activo
- La Persona interesada ya inició interacción con el Bot

## Postcondiciones

### En éxito

- La Persona interesada visualiza un listado de eventos disponibles
- El sistema mantiene el contexto de la conversación para futuras consultas

### En fallo

- La Persona interesada es informada de la imposibilidad de obtener la información

## Flujo principal

1. La Persona interesada solicita información sobre otros eventos
2. El Bot solicita al Sistema el listado de eventos disponibles [RF-COM-04]
3. El Sistema consulta la base de datos
4. El Sistema devuelve la lista de eventos con nombre y descripción
5. El Bot presenta el listado estructurado a la Persona interesada [RF-COM-04]
6. El Bot pregunta si desea conocer más detalles de algún evento [RF-COM-05]

## Flujos alternos

### A1. Solicitud de detalle de evento

1. En el paso 6, la Persona interesada solicita más información de un evento
2. El Bot solicita el detalle al Sistema [RF-COM-05]
3. El Sistema devuelve información detallada del evento
4. El Bot presenta la información
5. El flujo continúa en CU-COM-002

### A2. Filtrado de eventos

1. La Persona interesada solicita filtrar eventos por criterio (horario/modalidad)
2. El Bot envía el criterio al Sistema
3. El Sistema filtra los eventos [RF-COM-04]
4. El Sistema devuelve resultados filtrados
5. El Bot presenta el nuevo listado
6. Regresa al paso 6 del flujo principal

## Flujos de excepción

### E1. No hay eventos disponibles

1. El Sistema no encuentra eventos activos
2. El Bot informa que no hay eventos disponibles
3. El Bot ofrece opciones (esperar, dejar datos o intentar después). Si la Persona interesada desea dejar datos, se debe ejecutar `CU-COM-004` para solicitar consentimiento antes de capturar y persistir cualquier dato. Si la opción es entrar a lista de espera, se debe validar la etapa comercial requerida (ver `CU-EVT-001`).
4. El flujo finaliza

### E2. Error en base de datos

1. El Sistema no puede consultar la base de datos
2. El Sistema notifica al Bot
3. El Bot informa a la Persona interesada que la información no está disponible
4. El Bot ofrece intentar más tarde

## Reglas de negocio / restricciones

- Los eventos deben estar en estado activo para ser mostrados
- La información debe provenir del sistema (fuente única de verdad)
- El listado debe mostrar al menos nombre y descripción

## Datos relevantes

### Entradas

- Solicitud de eventos
- Criterios de filtrado (opcional)

### Salidas

- Lista de eventos disponibles
- Detalle de evento (opcional)

## Diagramas relacionados

- BPMN-COM-003
- ../resources/cu-com-003.png

## Observaciones

- La presentación puede variar según canal (chat, web, etc.)
- Puede integrarse con recomendación de eventos en futuras versiones

## Trazabilidad

- RF: RF-COM-04, RF-COM-05
- DDR: DDR-01

[RF-COM-04]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-04%20El%20Bot%20debe%20mostrar%20el%20listado%20de%20eventos%20disponibles.md
[RF-COM-05]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-05%20El%20Bot%20debe%20proporcionar%20información%20detallada%20de%20cada%20evento.md
