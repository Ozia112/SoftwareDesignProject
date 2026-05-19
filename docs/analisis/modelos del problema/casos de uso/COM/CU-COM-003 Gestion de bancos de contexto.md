# CU-COM-003 Gestión de bancos de contexto

## Metadatos

- ID: CU-COM-003
- Dominio: COM
- Nombre: Gestión de bancos de contexto
- Estado: Borrador
- Versión: v0.4
- Fecha de creación: 2026-03-10
- Última actualización: 2026-04-28
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección por: Isaac Ortiz
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Proveer al Bot los paquetes de información que necesita del sistema para responder consultas durante la conversación, a través de dos tipos de banco de contexto: el Banco de contexto general y el Banco de contexto de evento; y ejecutar operaciones de actualización de disponibilidad sobre el Banco de contexto de evento cuando el proceso de venta lo requiera.

## Alcance

Aplica a cualquier interacción del Bot con el sistema que requiera leer o modificar información almacenada. Centraliza tanto las consultas de lectura como las operaciones de escritura de disponibilidad de cupo (reserva temporal, liberación y bloqueo definitivo), evitando que otros casos de uso definan su propia lógica de acceso a datos. Es invocado por CU-COM-002 y cualquier otro CU que mencione consulta a base de datos, banco de contexto o campo de contexto.

## Tipos de bancos de contexto

### Banco de contexto general

Repositorio de información general del negocio, no específica de un evento. Contiene:

- Horarios de atención
- Listado de nombres de todos los eventos registrados en el sistema
- Avisos legales y resumen de su contenido
- Información general del negocio

### Banco de contexto de evento

Repositorio de información pública y configurable de un Evento específico. Es administrado por los operadores del sistema y puede ser actualizado en cualquier momento. Contiene:

- Nombre del evento
- Fechas de inicio y fin
- Horarios de sesiones
- Número de sesiones
- Modalidad
- Cupos disponibles
- Costos de inscripción
- Temario
- Nombres de los profesores/instructores
- Cualquier otro campo público configurado por el administrador del evento

## RF relacionados

- [RF-COM-04]
- [RF-COM-05]
- [RF-COM-06]
- [RF-COM-07]
- [RF-EVT-01]
- [RF-EVT-02]
- [RF-EVT-04]
- [RF-EVT-05]
- [RF-EVT-06]

## Actores

### Actor principal

- Bot

### Actores secundarios

- Sistema
- Administrador del evento (configura el Banco de contexto de evento)

## Disparador

El Bot requiere información del sistema para responder a una consulta de la Persona interesada, o recibe una instrucción de escritura para actualizar los campos de disponibilidad de cupo de un Evento.

## Precondiciones

- Existe al menos un Bot activo y configurado.
- El Sistema tiene acceso a los bancos de contexto.
- El Banco de contexto general está configurado y disponible.
- Para consultas de evento: existe al menos un Evento registrado con información configurada.

## Postcondiciones

### En éxito

- El Bot recibe el paquete de información solicitado (completo o parcial según la consulta).
- La información queda disponible para ser utilizada en la respuesta a la Persona interesada.
- Los campos de disponibilidad del Banco de contexto de evento quedan actualizados cuando se ejecuta una operación de escritura.

### En fallo

- El Bot recibe una notificación de que la información solicitada no está disponible.
- La actualización del Banco de contexto de evento no se realiza y el estado previo se conserva.

## Flujo principal — Banco de contexto general

1. El Bot recibe una solicitud que requiere información general (horarios de atención, listado de eventos, avisos legales u otra información general del negocio). [RF-COM-04] [RF-COM-07]
2. El Bot envía la solicitud al Sistema especificando el tipo de información requerida.
3. El Sistema consulta el Banco de contexto general.
4. El Sistema devuelve el paquete de información correspondiente (completo o por partes según lo solicitado).
5. El Bot recibe el paquete y lo utiliza para continuar la conversación.

## Flujo principal — Banco de contexto de evento

1. El Bot recibe una solicitud que requiere información específica de un Evento (fechas, horarios, cupos, costos, temario, instructores, modalidad, etc.). [RF-COM-05] [RF-COM-06] [RF-EVT-01] [RF-EVT-05] [RF-EVT-06]
2. El Bot envía la solicitud al Sistema especificando el identificador del Evento y los campos requeridos.
3. El Sistema identifica el Evento y consulta su Banco de contexto de evento.
4. El Sistema devuelve el paquete de información del Evento (completo o por partes según lo solicitado).
5. El Bot recibe el paquete y lo utiliza para continuar la conversación.

## Flujo principal — Actualización de banco de contexto de evento

1. El Bot recibe una instrucción de escritura sobre el Banco de contexto de evento para modificar los campos de disponibilidad de cupo como parte del proceso de venta. [RF-EVT-02] [RF-EVT-04]
2. El Bot envía al Sistema la solicitud de actualización especificando: el identificador del Evento, el tipo de operación y el identificador de la Persona interesada.
3. El Sistema valida que el Evento existe y que la operación es consistente con el estado actual de cupos del Banco de contexto de evento. [RF-EVT-02]
4. El Sistema ejecuta la actualización correspondiente según el tipo de operación recibido:
   - `reserva_temporal`: decrementa los cupos disponibles en 1 y registra la reserva temporal asociada a la Persona interesada con un timestamp de expiración. [RF-EVT-02]
   - `liberacion_reserva`: incrementa los cupos disponibles en 1 y elimina el registro de reserva temporal de la Persona interesada. [RF-EVT-02]
   - `bloqueo_cupo`: convierte la reserva temporal en definitiva tras confirmación de pago y marca el cupo como ocupado de forma permanente. [RF-EVT-04]
   - `registro_desuscripcion`: registra la preferencia de desuscripción de la Persona interesada en el Banco de contexto general para evitar futuras notificaciones de reactivación. [CU-COM-006]
5. El Sistema registra la operación con timestamp en los logs del sistema. [RF-EVT-02] [RF-EVT-04]
6. El Sistema confirma al Bot que la operación se realizó correctamente.
7. El Bot adapta el flujo conversacional en función del resultado de la operación.

## Flujos alternos

### A1. Solicitud de paquete completo de un banco de contexto

1. El Bot solicita la totalidad de un banco de contexto sin especificar campos.
2. El Sistema devuelve el paquete completo sin filtrar.
3. El flujo continúa en el paso 5 del flujo correspondiente.

### A2. Solicitud de campos de ambos bancos en una misma consulta

1. El Bot requiere información del Banco de contexto general y del Banco de contexto de evento en una misma consulta.
2. El Sistema consulta ambos bancos de contexto de forma independiente.
3. El Sistema consolida los resultados y los devuelve en una sola respuesta.
4. El flujo continúa en el paso 5 del flujo correspondiente.

## Flujos de excepción

### E1. Información no encontrada en el Banco de contexto general

1. El Sistema no encuentra la información solicitada en el Banco de contexto general.
2. El Sistema notifica al Bot que la información no está disponible.
3. El Bot informa a la Persona interesada que la información no está disponible en este momento.

### E2. Información no encontrada en el Banco de contexto de evento

1. El Sistema no encuentra el Evento solicitado o los campos requeridos en el Banco de contexto de evento.
2. El Sistema notifica al Bot que la información del Evento no está disponible.
3. El Bot informa a la Persona interesada que no se encontró información del Evento.

### E3. Error de acceso al sistema

1. El Sistema no puede consultar ningún banco de contexto por fallo técnico.
2. El Sistema notifica al Bot del error.
3. El Bot informa a la Persona interesada que la información no está disponible temporalmente.
4. Se registra el error en los logs del sistema.

### E4. Error al actualizar el banco de contexto de evento

1. En el paso 4 del Flujo principal — Actualización de banco de contexto de evento, el Sistema no puede ejecutar la operación de escritura por fallo técnico o inconsistencia de datos.
2. El Sistema revierte cualquier cambio parcial para mantener la integridad del banco de contexto de evento.
3. El Sistema notifica al Bot del error indicando el tipo de operación fallida.
4. El Bot informa a la Persona interesada que la operación no pudo completarse e invita a intentarlo nuevamente.
5. Se registra el error en los logs del sistema con el identificador del Evento y el tipo de operación fallida.

## Reglas de negocio relacionadas

- `RN-COM-CONT-01`
- `RN-COM-CONT-02`
- `RN-COM-CONT-03`
- `RN-COM-CONT-04`
- `RN-COM-CONT-05`
- `RN-COM-CONT-06`

Referencia:

- `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md`

## Datos relevantes

### Entradas — Consulta de lectura

- Tipo de consulta: general o de evento
- Identificador del Evento (requerido solo para consultas al Banco de contexto de evento)
- Campos específicos solicitados (opcional; si no se indican, se devuelve el paquete completo)

### Entradas — Actualización de banco de contexto de evento

- Tipo de operación: `reserva_temporal`, `liberacion_reserva`, `bloqueo_cupo`, `registro_desuscripcion`
- Identificador del Evento
- Identificador de la Persona interesada

### Salidas

- Paquete de información del Banco de contexto general (completo o parcial)
- Paquete de información del Banco de contexto de evento (completo o parcial)
- Confirmación de operación de actualización ejecutada (éxito o error con tipo de fallo)

## Diagramas relacionados

- BPMN-COM-003

## Observaciones

- Este CU es invocado por CU-COM-002 y cualquier otro CU que requiera consulta a banco de contexto, base de datos o campo de contexto del sistema.

## Trazabilidad

- RF: RF-COM-04, RF-COM-05, RF-COM-06, RF-COM-07, RF-EVT-01, RF-EVT-02, RF-EVT-04, RF-EVT-05, RF-EVT-06
- BPMN: BPMN-COM-003
- DDR: DDR-01

[RF-COM-04]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-04%20El%20Bot%20debe%20mostrar%20el%20listado%20de%20eventos%20disponibles.md
[RF-COM-05]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-05%20El%20Bot%20debe%20proporcionar%20información%20detallada%20de%20cada%20evento.md
[RF-COM-06]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-06%20El%20Bot%20debe%20informar%20fechas%20de%20inicio%20y%20horarios%20disponibles.md
[RF-COM-07]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md

[RF-EVT-01]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-01%20Verificacion%20de%20disponibilidad%20de%20cupo.md
[RF-EVT-02]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-02%20Reservacion%20de%20vacante%20durante%20proceso%20de%20venta.md
[RF-EVT-04]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-04%20Bloqueo%20de%20vacantes%20despues%20de%20confirmacion%20de%20pago.md
[RF-EVT-05]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-05%20Gestion%20de%20inscripciones%20extemporaneas.md
[RF-EVT-06]: /docs/analisis/requerimientos/funcionales/EVT/RF-EVT-06%20Gestion%20de%20lista%20de%20espera.md

[CU-COM-006]: /docs/analisis/modelos%20del%20problema/casos%20de%20uso/COM/CU-COM-006%20Gestión%20de%20notificaciones%20de%20reactivación.md
