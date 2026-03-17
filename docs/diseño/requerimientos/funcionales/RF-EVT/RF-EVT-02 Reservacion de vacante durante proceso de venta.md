# RF-EVT-02. El Sistema bot debe reservar temporalmente una vacante durante el proceso de venta

## Descripción

Cuando una Persona interesada en etapa **SQL** confirma intención de inscripción, El Sistema bot debe poder **reservar temporalmente** una vacante del Evento por un tiempo configurable. Si no se confirma el pago dentro del tiempo, la vacante se libera automáticamente y queda registro del hecho.

## Historia de usuario

Como Persona interesada necesito que El Sistema bot reserve temporalmente una vacante durante el pago para no perder mi lugar mientras completo la inscripción.

## Criterios de aceptación

* La reserva se activa al:
  * Confirmar intención de pago, o
  * Generar enlace de pago.
* La reserva tiene una duración **configurable** y puede configurarse **por Evento**.
* Mientras la reserva está activa:
  * El cupo visible del Evento se **reduce**.
  * Otros interesados **no pueden tomar** esa vacante.
* Si el tiempo expira sin pago confirmado:
  * La vacante se **libera automáticamente**.
  * El Sistema bot registra el evento en historial (Evento, timestamp, causa).
