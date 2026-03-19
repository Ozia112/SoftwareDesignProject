# CU-COM-003 Presentación de eventos disponibles

## Metadatos

- ID: CU-COM-003
- Dominio: COM
- Nombre: Presentación de eventos disponibles
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-10
- Última actualización: 2026-03-19
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-08, PSD-13
- PR relacionado: #XX

## Objetivo

Cuando el Lead pide opciones, el bot lista eventos activos con nombre y breve descripción.

## Alcance

- En este caso de uso se cubre la presentación del listado de eventos activos al Lead; incluye nombre y una breve descripción.
- Incluye la interacción del sistema con la base de datos y filtro básico por horarios/modalidad.

## RF relacionados

- RF-COM-04
- RF-COM-05

## Actores

### Actor principal

- Lead quien será quien inicie los eventos.
- Administrador quien pondrá la información de los eventos.

### Actores secundarios

- Base de datos
- Bot quien proporcionará la lista de los eventos al Lead desde la base de datos.

## Disparador

El Lead está interesado en otros eventos distintos por el que inició la conversación.

## Precondiciones

- Debe existir al menos un Bot automatizado configurado y disponible en el sistema
- Debe existir información acerca del evento del que el Lead está preguntando.
- Deben estar vigentes los eventos listados.
- El administrador debe haber actualizado los eventos disponibles

## Postcondiciones

- El sistema devuelve al Bot un listado con eventos activos y el bot le enseña ese listado al Lead.
- Se registra en logs la consulta de eventos.

### En éxito

- El Lead obtiene una lista con los nombres de los eventos disponibles
- El Lead puede seleccionar un evento para continuar con otro flujo para obtener información más detallada.

### En fallo

- El bot es incapaz de contestar.
- El Lead es informado de que no hay eventos disponibles.
- La conversación permanece activa con la opción de continuar con otro flujo o finalizarla.

## Flujo principal

1. El Lead le pide al bot información acerca de otros eventos.

2. El bot debe avisarle al sistema para que este le proporcione la información desde la base de datos del listado de eventos [RF-COM-04]

3. El sistema debe acceder a la base de datos y regresarle la lista de eventos disponibles al bot junto a la descripción de los eventos

4. El bot debe proporcionar al Lead el listado de eventos junto a una breve descripción de cada uno [RF-COM-04].

5. El bot pregunta al Lead si desea conocer más a detalle sobre los eventos listados [RF-COM-05].

## Flujos alternos

### A1. El Lead solicita detalle de un evento del listado

1. En el paso 5 del flujo principal, el Lead indica que desea más información de un evento específico.
2. El bot solicita al sistema el detalle del evento seleccionado [RF-COM-05].
3. El sistema devuelve información detallada (duración, modalidad, precio, requisitos y certificación) [RF-COM-05]
4. El bot presenta la información al Lead.
5. El flujo continúa en el CU-COM-002

### A2. El Lead pide filtrar eventos por horario o modalidad

1. Después del paso 4, el Lead pide ver solo eventos en cierto horario/modalidad.
2. El bot envía el criterio de filtro al sistema
3. El sistema devuelve únicamente los eventos que cumplen el criterio [RF-COM-04]
4. El bot muestra el nuevo listado filtrado
5. El flujo regresa al paso 5 del flujo principal

## Flujos de excepción

### E1. No hay eventos disponibles

1. En el paso 3 del flujo principal, el sistema consulta la base de datos y no encuentra eventos activos [RF-COM-04]
2. El bot informa al Lead que actualmente no hay eventos disponibles.
3. El bot ofrece opciones: dejar datos de contacto para avisarle en el futuro o volver a consultar más tarde
4. El flujo finaliza

### E2. No está funcionando la base de datos

1. Cuando el sistema trata de acceder a la base de datos en el paso 3 y la base se encuentra caída o en mantenimiento.
2. El sistema debe notificar al bot que la base de datos no se encuentra disponible
3. El bot debe decirle al Lead "Por el momento la información no está disponible" y darle la opción de dejar datos de contacto para avisarle en el futuro o volver a consultar más tarde.
