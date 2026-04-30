# RF-EVT-03. El Sistema bot puede notificar cuando una vacante reservada es liberada

## Descripción

Cuando una vacante reservada temporal o confirmada es liberada (por expiración o cancelación excepcional), el sistema debe poder notificar a Clientes potenciales elegibles en etapa Prospecto, siguiendo los criterios:

- Puntaje más alto del Cliente potencial.
- En caso de empate, se utiliza el criterio FIFO (primero en llegar, primero en ser notificado).

El numero de notificados debe ser igual al numero de vacantes liberadas, el sistema no debe enviar mas de N notificaciones por N vacantes liberadas, registrar si hay respuesta del cliente potencial a la notificación, en caso negativo proseguir con el siguiente cliente potencial elegible en la lista.

## Historia de usuario

**Como** Cliente potencial en etapa **Prospecto** inscrito en la lista de espera de un Evento,
**Quiero** recibir una notificación cuando se libere una vacante, siendo priorizado según mi puntaje y, en caso de empate, por orden de llegada (FIFO),
**Para** poder intentar inscribirme en cuanto haya disponibilidad sin tener que monitorear el Evento manualmente.

## Criterios de aceptación

- [ ] Cuando una vacante reservada se libera (por expiración o cancelación), El Sistema bot registra el evento de liberación con:
  - Evento, fecha/hora, causa y Cliente potencial afectado (si aplica).
- [ ] El Sistema bot identifica automáticamente a Clientes potenciales elegibles:
  - En etapa **Prospecto** e inscritos en la lista de espera del Evento.
- [ ] La notificación se envía por:
  - El mismo canal donde se originó el interés, o
  - El canal preferido si existe.
- [ ] Si existen múltiples Clientes potenciales elegibles, El Sistema bot aplica un orden determinístico:
  - Por puntaje del interesado (tiempo de respuesta y cantidad de interacción con el bot), con FIFO cronológico como criterio de desempate.
- [ ] El Sistema bot controla el volumen de notificaciones:
  - El número de notificaciones enviadas por liberación es igual al número de vacantes liberadas (**N notificaciones por N vacantes**).
- [ ] El Sistema bot registra si el Cliente potencial notificado responde a la notificación:
  - Si no hay respuesta, el Sistema prosigue con el siguiente Cliente potencial elegible en la lista.
- [ ] Toda notificación enviada queda registrada con IDs correlacionables (liberación ↔ 0..N notificaciones).
