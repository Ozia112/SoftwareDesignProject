# RNF-03 Claridad del mensaje del bot (Usabilidad)

## Descripción

Los mensajes del bot deben ser precisos, verificables y comprensibles para el Cliente potencial, sin exponer identificadores ni tecnicismos internos.

## Métrica

- Los valores factuales (fechas, horarios, precios, cupos) deben coincidir exactamente con los registrados en el banco de contexto de evento o general al momento de la consulta.
- No se exponen tecnicismos ni identificadores internos: IDs, nombres de tablas, estados del sistema (p. ej. `LEAD_HOT`), tokens o etiquetas internas.
- No usar preguntas de confirmación explícita en contextos informativos/comerciales; ofrecer opciones o preguntas abiertas en su lugar.
- Uso del español neutro; registro (`usted`/`tú`) según configuración.
- Ortografía correcta en todos los mensajes.
- Longitud máxima de mensajes comunes de máximo 100 palabras.

## Condiciones

- El Banco de contexto es la fuente de verdad para datos de eventos.
- Si un dato no existe o no está disponible, el bot lo indica explícitamente y no inventa valores.
- Definir una lista de términos/pro patrones prohibidos (regex) que identifiquen IDs y etiquetas internas; el sistema debe filtrar cualquier texto que coincida.
- Validación: revisión de 10 flujos de prueba documentados para verificar ausencia de confirmaciones explícitas en contextos informativos.
- Para el conteo de palabras, "mensajes comunes" excluyen listados de eventos, descripciones completas y textos legales (aviso de privacidad).

## Patrón de mensaje ante fallos de operación de dominio

- Descripción: cuando una operación de dominio falla, el bot debe responder con un patrón estandarizado que sea informativo, seguro y accionable para el usuario.
- Estructura del mensaje (plantilla mínima):
  - Encabezado breve y amable (p. ej. "No fue posible completar la acción").
  - Frase con motivo en lenguaje de usuario (sin tecnicismos ni trazas internas): p. ej. "No hay cupos disponibles para la fecha solicitada".
  - Código de error amigable opcional (p. ej. "ERR-RES-01") para correlación en soporte y logs (solo visible en texto si aplica).
  - Acciones recomendadas: lista de hasta 3 opciones; reintentar, suscribirse a lista de espera (en caso de ser prospecto) o contactar a un operador.
  - Si es recuperable, ofrecer opción de reintento automático y estimación de tiempo si procede.

- Reglas y métricas:
  - Nunca exponer excepciones, stack traces, IDs internos, tokens o nombres de tablas.
  - Incluir metadatos estructurados en la respuesta (no visibles al usuario) con campos: `error_code`, `retryable` (boolean), `severity` (info/warn/error), `trace_id`.
  - Tiempo máximo para presentar el mensaje de fallo al usuario: ≤ 2 s desde la detección del error.
  - Si la operación es reintento-able, el sistema debe permitir reintentos automáticos con backoff configurado y notificar al usuario del intento.

- Condiciones de validación:
  - Se construirán pruebas automáticas para los escenarios más frecuentes (reservas, transiciones de etapa, bloqueo por regla de negocio) que verifiquen:
  - El mensaje cumple la plantilla (encabezado + motivo + acciones recomendadas).
  - No hay exposición de identificadores internos ni errores técnicos.
  - La telemetría registra el `error_code` y `trace_id` para correlación con logs.

## Criterios de aceptación

- En consultas sobre un Evento, los valores entregados por el bot coinciden exactamente con los almacenados en banco de contexto de evento.
- En revisión de 10 flujos de prueba documentados, ningún mensaje contiene patrones de identificadores internos ni la estructura '¿Quieres [verbo] [objeto]?' en contextos informativos.
- En mensajes comunes, la longitud no supera 100 palabras y no hay errores ortográficos.
- Si se aplica, la medición de legibilidad alcanza el nivel B1 en el conjunto de pruebas.
- Cuando una operación de dominio retorna error (reservas, transiciones de etapa, consultas al banco de contexto), el bot utiliza una plantilla de indisponibilidad predefinida tomada del `banco de contexto general` y no inventa valores.
- Existe una lista versionada de plantillas de error en el `banco de contexto general`; las pruebas automatizadas verifican que en cada escenario de fallo se use la plantilla correspondiente en vez de generar contenido nuevo.
