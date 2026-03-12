# CU-003 Presentación de eventos disponibles

## Metadatos

- ID: CU-003
- Dominio: COM
- Nombre: Presentación de eventos disponibles
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-03-10
- Última actualización: 2026-03-10
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

Cuando el lead pide opciones, el bot lista eventos activos con nombre y breve descripción

## Alcance

Indicar el límite del sistema o subsistema al que aplica este caso de uso.

## RF relacionados

- RF-COM-004
- RF-COM-005

## Actores

- Lead quien estará pidiendo el listado y charlando con el bot

### Actor principal

- Bot quien proporcionará la lista de los eventos al lead desde la base de datos
- Administrador quien pondrá la información de los eventos

### Actores secundarios

- Base de datos
- Administrador

## Disparador

El lead esta interesado en otros eventos distintos por el que inicio la conversación

## Precondiciones

- Debe existir al menos un Bot automatizado configurado y disponible en el sistema
- Debe existir información acerca del evento del que el lead esta preguntando
- Debe estar vigente los eventos listados
- El administrador debe haber actualizado los eventos disponibles

## Postcondiciones

- no sé que poner en este caso

### En éxito

- El lead obtiene una lista con los nombres de los eventos disponibles

### En fallo

- El bot es incapaz de contestar

## Flujo principal

1. El lead le pide al bot información acerca de otros eventos

2. El bot debe avisarle al sistema para que este le proporcione la información desde la base de datos del listado de eventos [RF-COM-04]

3. El sistema debe acceder a la base de datos y regresarle la lista de eventos disponibles al bot junto a la descripción de los eventos

4. El bot debe proporcionar al lead el listado de eventos junto a una breve descripción de cada uno [RF-COM-04]

5. El bot pregunta al lead si desea conocer más a detalle sobre los eventos listados [RF-COM-05]

## Flujos alternos

### A1. El lead solicita detalle de un evento del listado

1. En el paso 5 del flujo principal, el lead indica que desea más información de un evento específico
2. El bot solicita al sistema el detalle del evento seleccionado al sistema[RF-COM-05]
3. El sistema devuelve información detallada (duración, modalidad, precio, requisitos y certificación) [RF-COM-05]
4. El bot presenta la información al lead
5. El flujo continúa en el CU-COM-002

### A2. El lead pide filtrar eventos por horario o modalidad

1. Después del paso 4, el lead pide ver solo eventos en cierto horario/modalidad
2. El bot envía el criterio de filtro al sistema
3. El sistema devuelve únicamente los eventos que cumplen el criterio [RF-COM-04]
4. El bot muestra el nuevo listado filtrado
5. El flujo regresa al paso 5 del flujo principal

## Flujos de excepción

### E1. No hay eventos disponibles

1. En el paso 3 del flujo principal, el sistema consulta la base de datos y no encuentra eventos activos [RF-COM-04]
2. El bot informa al lead que actualmente no hay eventos disponibles
3. El bot ofrece opciones: dejar datos de contacto para avisarle en el futuro o volver a consultar más tarde
4. El flujo finaliza

### E2. No esta funcionando la base de datos

1. Cuando el sistema trata de acceder a la base de datos en el paso 3 y la base se encuentra caida o en mantenimiento
2. El sistema debe notificar al bot que la base de datos no se encuentra disponible
3. El bot debe decirle al lead "Por el momento la información no esta disponible" y darle la opción de dejar datos de contacto para avisarle en el futuro o volver a consultar más tarde

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

- RF: RF-COM-002, RF-EVT-001
- BPMN: BPMN-CUPO-001
- DDR: DDR-01
- Evidencia académica / entrega: enlace si aplica
