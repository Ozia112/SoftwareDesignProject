# RNF-02 Rendimiento del bot (Rendimiento)

## Descripción

El bot debe mantener conversaciones fluidas garantizando latencias y throughput definidos, incluso al acceder al Banco de contexto.

## Métrica

- P90 < 2 segundos; P99 < 5 segundos; Máximo < 10 segundos (medidos end-to-end en backend).
- Carga de referencia: soportar 50 conversaciones concurrentes activas con al menos 10 mensajes de historial cada una.
- Throughput mínimo objetivo: 600 mensajes por minuto (≈10 msg/s) sin degradar P90/P99 por debajo de los umbrales.
- En caso de indisponibilidad parcial (p. ej. DB), el sistema debe responder con un mensaje de indisponibilidad en <10 segundos.

## Condiciones

- El tiempo de respuesta se mide a nivel del sistema (backend): desde que el mensaje entra hasta que la respuesta se envía al canal.
- La medición incluye consulta al Banco de contexto y el tiempo de generación del mensaje.
- Se consideran únicamente respuestas automáticas del bot (no aplica cuando la conversación está asignada a un operador humano).
- Instrumentación: traces y timestamps que permitan calcular P90, P99 y throughput por ventana (p. ej. 1 hora).
- Degradación graceful: al alcanzar condiciones de saturación (umbral configurable; p. ej. 500 conversaciones simultáneas) el sistema debe rechazar nuevas solicitudes con un mensaje de espera/cola o un 429/503 bien documentado, en vez de caer.
- Las pruebas de carga deben ser reproducibles y ejecutar escenarios con 50 conversaciones concurrentes y datos representativos.

## Criterios de aceptación

- Telemetría disponible para calcular percentiles y throughput.
- En prueba de carga representativa (50 conversaciones concurrentes, 10 mensajes de historial), se cumplen P90/P99/Máximo.
- El sistema mantiene throughput ≥ 600 msg/min bajo la prueba sin degradar las métricas.
- En escenario de sobrecarga controlada, el sistema aplica políticas de rechazo/cola y mantiene disponibilidad para conversaciones aceptadas.
