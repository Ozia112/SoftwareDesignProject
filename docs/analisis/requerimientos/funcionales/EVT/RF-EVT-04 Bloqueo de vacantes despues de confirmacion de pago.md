# RF-EVT-04. El Sistema bot debe bloquear definitivamente la vacante cuando se confirme la inscripción

## Descripción

El Sistema modifica el estado de una vacante a **Confirmada** solo cuando el operador humano logra confirmar correctamente la inscripcion de un Cliente potencial en etapa **SQL**. Sin embargo una vacante **Confirmada** puede ser liberada por causas excepcionales como:

- Confirmacion explicita de ausencia al Evento por parte del Cliente potencial
- En extemporaneo, cuando el Evento ya ha iniciado y el Cliente potencial no se presenta a una cantidad configurable de dias del evento.
- Si el Cliente potencial solicita un reembolso después de la confirmación, lo que implica cancelar su inscripción y liberar la vacante.

## Historia de usuario

**Como** Operador humano encargado de gestionar inscripciones a Eventos,
**Quiero** que el Sistema bot bloquee definitivamente la vacante de un Evento solo cuando logre confirmar correctamente la incripcion de un Cliente potencial en etapa SQL, y que permita liberar la vacante en casos excepcionales como ausencia confirmada, extemporaneo o solicitud de reembolso,
**Para** garantizar que las vacantes queden ocupadas únicamente cuando el proceso de inscripción haya sido confirmado correctamente por un operador humano en etapa **SQL**, y para mantener la disponibilidad real de vacantes mediante su liberación en casos excepcionales como ausencia confirmada, extemporáneo o solicitud de reembolso.

## Criterios de aceptación

- [ ] El estado de una vacante pasa a **Confirmada** únicamente cuando el operador humano confirma correctamente la inscripción de un Cliente potencial en etapa **SQL**.
- [ ] Al pasar a **Confirmada**:
  - El cupo del Evento se decrementa de forma **permanente**.
  - El Sistema registra auditoría de la confirmación (timestamp, operador y referencia al Cliente potencial).
- [ ] Una vacante **Confirmada** puede liberarse exclusivamente por las siguientes causas excepcionales:
  - **Ausencia confirmada**: el Cliente potencial confirma explícitamente que no asistirá al Evento.
  - **Extemporáneo**: el Evento ya ha iniciado y el Cliente potencial no se presenta durante una cantidad de días configurable por el administrador.
  - **Reembolso**: el Cliente potencial solicita un reembolso después de la confirmación, lo que implica cancelar su inscripción y liberar la vacante.
- [ ] Al liberarse una vacante **Confirmada** por causa excepcional:
  - El cupo disponible del Evento se **incrementa**.
  - El Sistema registra el motivo de liberación, el timestamp y la referencia al Cliente potencial en el historial del Evento y del Cliente potencial.
