# CU-EVT-001 Registro en lista de espera

## Metadatos

- ID: CU-EVT-001
- Dominio: EVT
- Nombre: Registro en lista de espera
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-11
- Última actualización: 2026-03-28
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección: Isaac Ortiz
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Permitir que la Persona interesada se registre en la lista de espera de un Evento cuando el cupo esté lleno, para ser considerada cuando se libere una vacante.

## Alcance

Aplica al proceso de registro en lista de espera gestionado por el Sistema cuando un Evento no tiene cupo disponible.

## RF relacionados

- [RF-COM-02]
- [RF-EVT-01]
- [RF-EVT-07]

## Actores

### Actor principal

- Cliente potencial en etapa Prospecto

### Actores secundarios

- Bot
- Sistema

## Disparador

El Cliente potencial intenta inscribirse a un Evento y el Sistema detecta que el cupo es 0.

## Precondiciones

- El Prospecto ha sido notificado que el evento está lleno y se le ha ofrecido la opción de registrarse en la lista de espera.
- El Prospecto acepta registrarse en la lista de espera.

## Postcondiciones

### En éxito

- El Prospecto queda registrado en la lista de espera
- Se mantiene un orden determinado por calificacion y FIFO para desempates en la lista de espera.
- No existen registros duplicados del mismo Cliente potencial en la lista de espera para el mismo Evento.

### En fallo

- No se registra al Prospecto en la lista de espera
- El sistema informa la causa

## Flujo principal

1. El Bot recibe la aceptación del Cliente potencial para registrarse en la lista de espera. [RF-EVT-07]
2. El Bot verifica la etapa comercial del Cliente potencial para confirmar que es Prospecto. [RF-COM-02]
3. Se activa [CU-COM-003 Gestión de bancos de contexto] para consultar el Banco de contexto de evento y validar que no exista un registro previo del mismo Cliente potencial en la lista de espera del Evento. [RF-EVT-07]
4. Se activa [CU-COM-003 Gestión de bancos de contexto] para consultar la lista de espera del Evento y comparar la calificación del Prospecto con los registros existentes para determinar su posición. [RF-EVT-07]
5. El Bot notifica al Prospecto su registro exitoso en la lista de espera y su posición actual. [RF-EVT-07]
6. El Bot le informa al Prospecto que será notificado si se libera un cupo. [RF-EVT-07]

## Flujos alternos

### A1. Registro duplicado

1. En el paso 3, [CU-COM-003 Gestión de bancos de contexto] detecta que el Cliente potencial ya está registrado en la lista de espera para el mismo Evento. [RF-EVT-07]
2. El Bot informa al Cliente potencial que ya está registrado y le comunica su posición actual en la lista de espera. [RF-EVT-07]
3. El flujo finaliza.

### A2. Registro sin etapa Prospecto

1. El Sistema detecta que el Cliente potencial no se encuentra en etapa comercial Prospecto. [RF-COM-02]
2. El Bot informa al Cliente potencial que no es elegible para registrarse en la lista de espera debido a su etapa comercial actual. [RF-COM-02]
3. El flujo finaliza.

## Flujos de excepción

### E1. Evento inexistente

1. El Sistema no encuentra el Evento
2. El Bot informa que no existe
3. El flujo finaliza

### E2. Evento no disponible

1. El Sistema detecta que el Evento está inactivo o finalizado
2. El Bot informa que no está disponible para registros en lista de espera o inscripcion directa
3. El flujo finaliza

### E3. Error en registro

1. Ocurre un error al registrar en la lista
2. El Sistema notifica al Bot
3. El Bot informa a la Persona interesada
4. El flujo finaliza

## Reglas de negocio / restricciones

- Una Persona interesada no puede registrarse más de una vez por Evento
- La lista de espera se ordena principalmente por calificación/puntaje, utilizando FIFO como criterio de desempate en caso de calificaciones iguales.
- El registro requiere datos mínimos de contacto

## Datos relevantes

### Entradas

- Solicitud de inscripción
- Datos de la Persona interesada

### Salidas

- Confirmación de registro en lista de espera
- Posición en la lista

## Diagramas relacionados

- BPMN-EVT-001
- ../resources/cu-evt-001.png

## Observaciones

- Puede integrarse con notificaciones automáticas (RF-EVT-03)
- Puede integrarse con reservas prioritarias futuras

## Trazabilidad

- RF: RF-COM-02, RF-EVT-07
- BPMN: BPMN-EVT-001

[CU-COM-003 Gestión de bancos de contexto]: /docs/diseño/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
[RF-COM-02]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-02%20Gestión%20de%20etapa%20comercial%20y%20calificación%20automática%20de%20leads.md
[RF-EVT-01]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01%20Verificacion%20de%20disponibilidad%20de%20cupo.md
[RF-EVT-07]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-07%20Gestion%20de%20lista%20de%20espera.md
