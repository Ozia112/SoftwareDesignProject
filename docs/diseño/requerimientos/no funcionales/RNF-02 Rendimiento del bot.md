# RNF-02 Rendimiento del bot (Rendimiento)

## Descripción

El bot debe ser capaz de mantener una conversación, para ello debe ser capaz de responder al cliente con fluidez aunque tenga que acceder a la base de datos por información

## Métrica

- Al menos, el 90% de las respuestas del bot deben tomar menos de 2 segundos
- El 99% de las respuestas deben ser antes de los 5 segundos
- Las respuestas del bot no deben sobrepasar los 10 segundos de espera

## Condiciones

- El tiempo de respuesta se mide a nivel del sistema (backend): desde que el mensaje entra al sistema hasta que la respuesta del bot se envía al canal
- La medición incluye el tiempo de consulta al **Banco de contexto** (base de datos e historial) y el tiempo de generación del mensaje
- Se consideran únicamente respuestas automáticas del bot (no aplica cuando la conversación ya fue asignada a un operador humano)
- Si una operación no puede completarse (por ejemplo, base de datos indisponible), el sistema debe responder con un mensaje de indisponibilidad antes de 10 segundos y registrar el evento en logs

## Criterios de aceptación

- Existe instrumentación (logs/telemetría) que registra la latencia por respuesta y permite calcular percentiles (P90, P99) y el máximo.
- En una prueba con carga representativa (concurrencia y datos similares a producción), se cumple:
  - P90 < 2 segundos
  - P99 < 5 segundos
  - Máximo < 10 segundos
- En caso de error de consulta al Banco de contexto, el bot responde dentro de 10 segundos con un mensaje claro de indisponibilidad temporal y no deja la conversación sin respuesta.
