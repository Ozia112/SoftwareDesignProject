# RF-EVT-05. El Sistema bot debe gestionar cancelaciones antes del inicio del Evento

## Descripción

El Sistema bot debe permitir que un Usuario (operador) registre cancelaciones de inscripciones confirmadas **antes del inicio del Evento**, liberando la vacante, registrando auditoría y disparando el flujo de lista de espera/notificaciones si aplica.

## Historia de usuario

Como operador necesito registrar cancelaciones antes del inicio del Evento para liberar cupo y permitir que otra Persona interesada pueda ocupar la vacante.

## Criterios de aceptación

* Un Usuario puede registrar una cancelación asociada a una Persona inscrita y un Evento **antes de la fecha/hora de inicio**.
* El Sistema bot registra:
  * motivo (opcional), fecha/hora, usuario que canceló (si manual) y estado previo/posterior.
* Al cancelar una inscripción confirmada:
  * Se libera la vacante **de forma inmediata**.
  * Se actualiza la etapa comercial a un estado de cierre correspondiente (ej. “Cancelado”, “Cierre Perdido…”).
* Si existe lista de espera habilitada:
  * El Sistema bot dispara el proceso de notificación (RF-EVT-03) y/o reserva prioritaria si está configurado.
* La política de reembolso (total/parcial/no aplica) queda definida en un RF/BR separado o como configuración.
