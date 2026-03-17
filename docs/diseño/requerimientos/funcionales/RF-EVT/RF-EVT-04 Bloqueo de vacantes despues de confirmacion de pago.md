# RF-EVT-04. El Sistema bot debe bloquear definitivamente la vacante cuando se confirme la inscripción

## Descripción

El Sistema bot debe definir el momento exacto en que una vacante pasa de **Reservada** a **Confirmada**, aplicando una política de negocio única (A/B/C). Al confirmarse, se descuenta el cupo permanente, se audita el evento y se actualiza la etapa comercial.

## Historia de usuario

Como operador necesito que El Sistema bot confirme una vacante solo cuando se cumpla la política definida para evitar sobreventa y asegurar consistencia en el cupo.

## Criterios de aceptación

* El Sistema bot registra explícitamente el estado de vacante:
  * **Disponible / Reservada / Confirmada / Liberada**.
* Existe una única transición válida hacia **Confirmada**, definida por la política activa:
  * A: al generar pago, o
  * B: al confirmar pago, o
  * C: al confirmar pago + validar documentos.
* Al pasar a Confirmada:
  * Se decrementa el cupo **permanente**.
  * Se registra auditoría (evento de confirmación + referencia a pago/documentos si aplica).
* La Persona interesada cambia a etapa **Cierre Ganado**.
* Posteriormente cambia a **Alumno activo** cuando inicie el Evento.
* Si dos Personas intentan confirmar la misma vacante, el resultado debe ser:
  * **1 confirmación** y **1 rechazo**.
