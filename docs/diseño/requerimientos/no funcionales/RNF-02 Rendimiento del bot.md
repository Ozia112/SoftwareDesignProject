# RNF-02 Rendimiento del bot (Rendimiento)

## Descripción

El bot debe mantener conversaciones fluidas garantizando latencias y throughput definidos, incluso al acceder al Banco de contexto.

## Métrica

- P90 < 2 segundos; P99 < 5 segundos; Máximo < 10 segundos (medidos end-to-end en backend).
- Carga de referencia: soportar 50 conversaciones concurrentes activas con al menos 10 mensajes de historial cada una.
- Throughput mínimo objetivo: 600 mensajes por minuto (≈10 msg/s) sin degradar P90/P99 por debajo de los umbrales.
 En caso de indisponibilidad parcial (p. ej. DB), el sistema debe responder con un mensaje de indisponibilidad en <10 segundos.
 SLA de transición bot↔operador (CU-COM-001):
  - Time-to-assign (TTA): tiempo desde que el Sistema recibe la señal de escalamiento/transferencia hasta que el operador recibe la conversación en su bandeja y el contexto mínimo requerido: P90 ≤ 3 s; P99 ≤ 10 s; Máx ≤ 20 s.
  - Time-to-resume-bot (TTRB): tiempo desde que el operador libera la conversación hasta que el bot puede reanudar la interacción: P90 ≤ 3 s; P99 ≤ 10 s; Máx ≤ 20 s.
  - Latencia de notificación al usuario sobre la transferencia: ≤ 3 s (mensaje indicativo de que la conversación está siendo transferida).
  - Completitud del contexto: el histórico mínimo configurable (p. ej. últimos 20 mensajes y metadatos relevantes) debe estar disponible para el operador al 100 % en la transferencia.
  - Ventana de aceptación del operador: tiempo máximo para que un operador acepte la asignación antes de aplicar políticas de reencolamiento o escalado: 60 s.

## Condiciones

- El tiempo de respuesta se mide a nivel del sistema (backend): desde que el mensaje entra hasta que la respuesta se envía al canal.
- La medición incluye consulta al Banco de contexto y el tiempo de generación del mensaje.
- Se consideran únicamente respuestas automáticas del bot (no aplica cuando la conversación está asignada a un operador humano).
- Instrumentación: traces y timestamps que permitan calcular P90, P99 y throughput por ventana (p. ej. 1 hora).
- Degradación graceful: al alcanzar condiciones de saturación (umbral configurable; p. ej. 500 conversaciones simultáneas) el sistema debe rechazar nuevas solicitudes con un mensaje de espera/cola o un 429/503 bien documentado, en vez de caer.
- Las pruebas de carga deben ser reproducibles y ejecutar escenarios con 50 conversaciones concurrentes y datos representativos.
- Para las transiciones bot↔operador:
  - Las mediciones de TTA/TTRB deben ser end-to-end e incluir latencias de conectores y UI de operador; los tiempos se registran por trace-id asociado a la conversación.
  - Durante la transferencia el bot debe dejar de generar respuestas automáticas en menos de 1s tras iniciar la transferencia para evitar errores cuando el bot y el operador actuen sobre la misma conversación simultaneamente.
  - El orquestador debe propagar el contexto y datos al operador en una única operación atómica visible en los logs.
  - Si la aceptación del operador excede la ventana de 60s, se debe aplicar la política configurada (reintento, re-asignación, fallback a cola o mensaje al usuario) y documentar el evento en telemetría.
  - Las pruebas de integración deben incluir escenarios de asignación concurrente (p. ej. 10–50 asignaciones simultáneas) para validar TTA/TTRB bajo carga.

## Criterios de aceptación

- Telemetría disponible para calcular percentiles y throughput.
- En prueba de carga representativa (50 conversaciones concurrentes, 10 mensajes de historial), se cumplen P90/P99/Máximo.
- El sistema mantiene throughput ≥ 600 msg/min bajo la prueba sin degradar las métricas.
- En escenario de sobrecarga controlada, el sistema aplica políticas de rechazo/cola y mantiene disponibilidad para conversaciones aceptadas.
