# RNF-03 Claridad del mensaje del bot (Usabilidad)

## Descripción

Los mensajes del bot deben estar respaldados por información de la base de datos y deben tener sentido

## Métrica

- La información proporcionada del bot es la misma o similar a la que esta en la base de datos
- Información como horarios, precios o fechas deben ser iguales a las de la base de datos
- La información proporcionada a la conversación activa no debe llevar tecnicismos
- El bot no debe hacer preguntas de confirmación explicitas ("¿Quieres inscribirte a X curso?")
- La longitud máxima para los mensajes comunes (no se incluye lista de eventos o descripción de un evento) debe ser no mayor a 100 palabras

## Condiciones

- La base de datos (Banco de contexto) es la fuente de verdad para información de eventos (fechas, horarios, cupo, precios, modalidad, etc.)
- Cuando un dato no exista o no esté disponible, el bot debe indicarlo explícitamente y no inventar valores
- La restricción de “sin tecnicismos” aplica a mensajes hacia la Persona interesada, términos internos del sistema (IDs, estados técnicos, nombres de tablas, etc.) no deben mostrarse
- La restricción de “sin confirmación explícita” aplica a mensajes informativos/comerciales exceptuando flujos que por requerimiento funcional requieran confirmación explícita (por ejemplo, consentimiento de privacidad en RF-COM-07 o confirmaciones de pago/inscripción si aplican)
- Para el conteo de palabras, “mensajes comunes” se excluyen: listados de eventos, descripciones completas de un evento y el texto de aviso de privacidad

## Criterios de aceptación

- Para consultas sobre un Evento, los valores entregados por el bot (fechas, horarios, precios) coinciden con los registrados en la base de datos para ese Evento
- Si la Persona interesada solicita un dato no registrado, el bot responde indicando que la información no está disponible y no genera información falsa
- En mensajes comunes, el bot no utiliza tecnicismos ni expone etiquetas internas del sistema
- En flujos informativos, el bot evita preguntas cerradas de confirmación para acciones (inscribirse, pagar) y en su lugar formula preguntas abiertas u ofrece opciones
- En mensajes comunes, la longitud de cada mensaje no supera 100 palabras
