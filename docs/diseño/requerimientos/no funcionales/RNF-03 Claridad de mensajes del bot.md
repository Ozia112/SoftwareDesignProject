# RNF-03 Claridad del mensaje del bot (Usabilidad)

## Descripción

Los mensajes del bot deben ser precisos, verificables y comprensibles para la Persona interesada, sin exponer identificadores ni tecnicismos internos.

## Métrica

- Los valores factuales (fechas, horarios, precios, cupos) deben coincidir exactamente con los registrados en la base de datos al momento de la consulta.
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

## Criterios de aceptación

- En consultas sobre un Evento, los valores entregados por el bot coinciden exactamente con los almacenados en la base de datos.
- En revisión de 10 flujos de prueba documentados, ningún mensaje contiene patrones de identificadores internos ni la estructura '¿Quieres [verbo] [objeto]?' en contextos informativos.
- En mensajes comunes, la longitud no supera 100 palabras y no hay errores ortográficos.
- Si se aplica, la medición de legibilidad alcanza el nivel B1 en el conjunto de pruebas.
