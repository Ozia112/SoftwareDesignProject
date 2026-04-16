# RNF-04 Continuidad de la conversación (Confiabilidad)

## Descripción

El sistema debe mantener el contexto y el estado de una conversación activa para que la Persona interesada pueda continuar la interacción sin tener que repetir información, incluso si hay pausas cortas, errores de consulta o escalamiento a un operador humano

## Métrica

- El contexto mínimo (Evento seleccionado, intención, etapa comercial, consentimiento y datos capturados durante la conversación) se conserva durante toda la conversación activa y por al menos 30 minutos de inactividad
- En reanudaciones dentro de esa ventana, al menos el 90% de las conversaciones continúan sin solicitar nuevamente el Evento seleccionado ni los datos ya capturados en la misma conversación
- El 100% de los escalamientos bot a operador humano y operador humano a bot conservan el historial de mensajes y el previo de la conversación

## Condiciones

- Debe existir un identificador único por conversación y el estado debe persistirse en el backend (no solo en memoria)
- La continuidad debe respetar el control de acceso por roles (RNF-01), el bot solo accede al estado necesario para continuar el flujo y no expone datos personales en mensajes de resumen
- Se entiende por “conversación activa” una conversación vigente asignada a un Bot u operador humano, asociada a un canal y registrada por el sistema
- El historial y el estado forman parte del **Banco de contexto** utilizado por el bot para responder de forma coherente

## Criterios de aceptación

- Si la Persona interesada hace una pregunta de seguimiento (“¿y el precio?”, “¿y los horarios?”) después de seleccionar un Evento, el bot responde usando el mismo Evento sin solicitar nuevamente el nombre del Evento
- Si la conversación se escala a un operador humano, el operador visualiza el historial y el estado (Evento seleccionado, punto del flujo y datos capturados) y la Persona interesada no necesita repetir esa información para continuar
- Si la conversación vuelve del operador humano al bot, el bot retoma el flujo a partir del último estado registrado
- Ante una falla temporal (por ejemplo, error de consulta) el bot informa la situación sin reiniciar el flujo ni perder el contexto de la conversación
