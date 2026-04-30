# CU-EVT-002 Gestión de cancelación

## Metadatos

- ID: CU-EVT-002
- Dominio: EVT
- Nombre: Gestión de cancelación
- Estado: Borrador
- Versión: v0.3
- Fecha de creación: 2026-03-11
- Última actualización: 2026-04-29
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección por: Isaac Ortiz
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Permitir que un Usuario (operador) registre la cancelación de una inscripción confirmada antes del inicio del Evento, liberando la vacante, actualizando el estado y disparando procesos asociados como notificación a lista de espera.

## Alcance

Aplica al módulo de gestión de inscripciones y cupo de Eventos dentro del sistema.

## RF relacionados

- [RF-EVT-03]
- [RF-EVT-04]

## Actores

### Actor principal

- Usuario (operador del sistema)

### Actores secundarios

- Sistema
- [CU-COM-003 Gestión de bancos de contexto]: gestiona inscripciones, cupos y lista de espera
- Cliente potencial

## Disparador

El Usuario decide cancelar una inscripción de un Evento antes de su inicio.

## Precondiciones

- Existe una inscripción confirmada en el Evento
- El Evento no ha iniciado
- El Usuario tiene permisos para realizar la cancelación

## Postcondiciones

### En éxito

- La vacante se libera
- El cupo disponible se actualiza
- Se registra la cancelación (usuario, fecha, motivo opcional)
- Se actualiza la etapa comercial correspondiente
- Se dispara notificación a lista de espera si aplica

### En fallo

- No se realizan cambios en la inscripción
- Se registra el intento fallido en logs

## Flujo principal

1. El Usuario selecciona una inscripción confirmada
2. El Sistema valida que el Evento no ha iniciado
3. El Sistema permite ejecutar la cancelación
4. El Sistema cambia el estado de la inscripción a cancelada conforme a las causas excepcionales de liberación definidas en [RF-EVT-04]
5. El Sistema libera la vacante asociada
6. El Sistema actualiza el cupo disponible
7. El Sistema registra la cancelación (usuario, fecha, motivo)
8. El Sistema verifica si existe lista de espera
9. Si existe, el Sistema dispara notificación al siguiente elegible [RF-EVT-03]

## Flujos alternos

### A1. No existe lista de espera

1. En el paso 8, no hay lista de espera
2. El flujo finaliza sin notificaciones

### A2. Cancelación con motivo

1. El Usuario registra un motivo de cancelación
2. El Sistema lo almacena junto con el registro
3. El flujo continúa normalmente

## Flujos de excepción

### E1. Evento ya iniciado

1. El Sistema detecta que el Evento ya inició
2. Se bloquea la cancelación
3. Se notifica al Usuario
4. Se registra el intento en logs
5. El flujo finaliza

### E2. Inscripción inválida

1. La inscripción no existe o ya está cancelada
2. El Sistema rechaza la operación
3. Se registra el error
4. El flujo finaliza

### E3. Error en notificación

1. Ocurre un error al enviar notificación
2. El Sistema registra el incidente
3. La cancelación se mantiene válida
4. La notificación puede quedar pendiente

## Reglas de negocio / restricciones

- Solo se permiten cancelaciones antes del inicio del Evento
- La cancelación libera inmediatamente la vacante
- La actualización de cupo debe ser consistente (sin sobreventa)
- La notificación debe respetar reglas anti-spam

## Datos relevantes

### Entradas

- Identificador de inscripción
- Motivo de cancelación (opcional)

### Salidas

- Confirmación de cancelación
- Actualización de cupo
- Registro en historial

## Diagramas relacionados

- BPMN-EVT-002
- ../resources/cu-evt-002.png

## Observaciones

- Puede integrarse con políticas de reembolso (fuera de alcance)
- Puede integrarse con reservas automáticas futuras

## Trazabilidad

- RF: RF-EVT-04, RF-EVT-03
- DDR: DDR-01

[RF-EVT-03]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03%20Notificacion%20de%20usuarios%20ante%20una%20liberacion%20de%20cupo.md
[RF-EVT-04]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-04%20Bloqueo%20de%20vacantes%20despues%20de%20confirmacion%20de%20pago.md
[CU-COM-003 Gestión de bancos de contexto]: /docs/diseño/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
