# RF-EVT-07. El Sistema bot debe gestionar una lista de espera cuando el cupo se agote

## Descripción

Cuando el cupo de un Evento llega a 0, El Sistema bot debe permitir registrar Personas interesadas en una **lista de espera** con orden determinístico (FIFO por defecto). Al liberarse una vacante, El Sistema bot notifica al siguiente elegible y opcionalmente crea una reserva prioritaria.

## Historia de usuario

Como Persona interesada necesito poder registrarme en una lista de espera para tener prioridad cuando se libere una vacante del Evento.

## Criterios de aceptación

* Cuando el cupo llega a **0**, El Sistema bot ofrece ingresar a lista de espera si está habilitada.
* Al ingresar, El Sistema bot registra como mínimo:
  * Evento, canal, fecha/hora, etapa comercial actual y datos de contacto disponibles.
* La lista mantiene un orden determinístico:
  * FIFO cronológico (por defecto) o prioridad (si se integra con reglas adicionales).
* Al liberarse una vacante:
  * El Sistema bot selecciona al siguiente elegible.
  * Envía notificación (RF-EVT-03).
  * Opcional: crea una reserva temporal prioritaria con tiempo configurable.
* El Sistema bot evita duplicados:
  * Una Persona interesada no puede estar dos veces en la lista del mismo Evento.
* El Usuario (operador) puede consultar la lista de espera por Evento (al menos lectura).
