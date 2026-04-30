# RF-EVT-06. El Sistema bot debe gestionar una lista de espera cuando el cupo se agote

## Descripción

Cuando el cupo de un Evento llega a 0, el sistema debe permitir registrar Clientes potenciales en una **lista de espera** con un orden basado en su puntaje (tiempo de respuesta y cantidad de interacción con el bot), utilizando FIFO cronológico como criterio de desempate. Al liberarse una vacante en el Evento, el sistema debe primero verificar que exista una lista de espera, si hay notificar segun [RF-EVT-03].

## Historia de usuario

**Como** Cliente potencial interesado en un Evento con cupo agotado,
**Quiero** poder registrarme en la lista de espera del Evento y ser notificado con prioridad basada en mi puntaje cuando se libere una vacante,
**Para** aumentar mis posibilidades de participar en el Evento si inicialmente no hay cupo disponible.

## Criterios de aceptación

* Cuando el cupo llega a **0**, El Sistema bot ofrece ingresar a lista de espera a los Clientes potenciales, si la lista está habilitada.
* Al ingresar, El Sistema bot registra como mínimo:
  * Evento, canal, fecha/hora, etapa comercial actual y datos de contacto disponibles.
* La lista mantiene un orden determinístico basado en el **puntaje** del interesado (tiempo de respuesta y cantidad de interacción con el bot). El orden FIFO cronológico se aplica únicamente como criterio de desempate entre interesados con el mismo puntaje.
* Al liberarse una vacante:
  * El Sistema bot verifica que exista una lista de espera para el Evento.
  * Si existe, selecciona al siguiente Cliente potencial elegible y envía notificación según [RF-EVT-03].
* El Sistema bot evita duplicados:
  * Un Cliente potencial no puede estar dos veces en la lista del mismo Evento.
* El Usuario (operador) puede consultar la lista de espera por Evento (al menos lectura).

[RF-EVT-03]: /docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03%20Notificacion%20de%20usuarios%20ante%20una%20liberacion%20de%20cupo.md
