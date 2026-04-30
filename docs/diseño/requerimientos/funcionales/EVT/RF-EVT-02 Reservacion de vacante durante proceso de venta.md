# RF-EVT-02. El Sistema bot debe reservar temporalmente una vacante durante el proceso de venta

## Descripción

Cuando un Cliente potencial en etapa **MQL** en transición a **Prospecto** manifiesta intención de inscripción y hay cupo disponible, el Sistema debe reservar temporalmente una vacante del Evento para esa Cliente potencial. El tiempo de la vacante reservada debe poder ser configurado por el administrador del sistema, y puede variar por Evento, este tiempo de tolerancia se almacena en el banco de contexto. Si el Cliente potencial no puede confirmar su inscripción por un operador humano en la etapa **SQL** dentro del tiempo de reserva, la vacante se libera automáticamente para que otros interesados puedan tomarla, y el sistema registra el evento en el historial del Cliente potencial y del Evento.

## Historia de usuario

**Como** Cliente potencial que ha mostrado interés en inscribirse a un Evento y se encuentra en etapa MQL,
**Quiero** que el sistema reserve temporalmente una vacante del Evento para mí durante el proceso de inscripción con una ventana de tiempo explícita,
**Para** asegurar que puedo completar mi inscripción sin perder la oportunidad debido a la disponibilidad de cupo, y para tener claridad sobre el tiempo que tengo para confirmar mi inscripción.

## Criterios de aceptación

* [ ] La reserva se activa cuando:
  * El Cliente potencial en etapa **MQL** manifiesta intención de inscripción, **y**
  * Existe al menos una vacante disponible en el Evento.
* [ ] La reserva tiene una duración **configurable por el administrador del sistema** y puede variar **por Evento**; este tiempo de tolerancia se almacena en el **banco de contexto**.
* [ ] Mientras la reserva está activa:
  * El cupo visible del Evento se **reduce**.
  * Otros interesados **no pueden tomar** esa vacante.
* [ ] Si el Cliente potencial no confirma su inscripción a través de un operador humano en la etapa **SQL** dentro del tiempo de reserva:
  * La vacante se **libera automáticamente** para que otros interesados puedan tomarla.
  * El Sistema registra el evento en el historial del **Cliente potencial** y del **Evento** (timestamp y causa).
