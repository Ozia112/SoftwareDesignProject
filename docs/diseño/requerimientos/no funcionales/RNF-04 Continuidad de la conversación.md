# RNF-04 Continuidad de la conversación (Confiabilidad)

## Descripción

El sistema debe mantener el contexto y el estado de una conversación activa para que la Persona interesada pueda continuar la interacción sin repetir información; debe manejar pausas cortas, fallos transitorios y escalamientos preservando el historial.

## Métrica

- El contexto mínimo (Evento seleccionado, intención, etapa comercial, consentimiento y datos capturados) se conserva durante la conversación activa y por al menos 30 minutos de inactividad.
- Reanudaciones dentro de esa ventana: ≥ 90% de conversaciones continúan sin solicitar nuevamente datos ya capturados.
- 100% de los escalamientos (bot→operador, operador→bot) conservan historial y estado.
- Capacidad de recuperar estados tras una caída ≤ 5 minutos.
- Interrupciones < 2 minutos se consideran temporales; > 2 minutos activan flujo de indisponibilidad.

## Condiciones

- Existe un identificador único por conversación; el estado se persiste en el backend (no solo en memoria).
- La continuidad respeta controles de acceso (RNF-01); los resúmenes no exponen datos personales sin autorización.
- Pasados 30 minutos de inactividad, el sistema notifica al usuario que el contexto expiró y reinicia el flujo desde la selección de Evento, sin eliminar los datos capturados del lead (retención conforme a la política de privacidad RF-COM-07).
- Retención del historial: configurada por tenant conforme a RF-COM-07; por defecto se recomienda retención máxima de 90 días tras cierre (ajustable por requisitos legales).

## Criterios de aceptación

- Pruebas de reanudación demuestran ≥ 90% sin re-solicitar datos en ventana de 30 minutos.
- En escalamiento, el operador visualiza el historial y la conversación continúa sin repetir información.
- Pruebas de recuperación demuestran restauración < 5 minutos tras una caída controlada.
- Para fallos < 2 minutos el sistema muestra mensaje de indisponibilidad y no pierde contexto; para fallos > 2 minutos el comportamiento sigue la política de indisponibilidad definida.

## Explicación simple (versión no técnica)

- Qué se guarda: se almacena lo básico de la conversación (un identificador, el evento seleccionado, los datos que el usuario proporcionó y el historial de mensajes relevantes).
- Para qué sirve: para que, si el usuario vuelve o la conversación pasa a un operador humano, nadie tenga que pedirle de nuevo la misma información.
- Qué pasa si pasa mucho tiempo: si pasan más de 30 minutos de inactividad, el sistema avisa que el contexto expiró y pide empezar de nuevo, pero los datos del lead se conservan según la política de privacidad.
- Qué ocurre si hay un problema técnico: si el fallo es breve, el sistema intenta recuperar y seguir; si dura más, informa al usuario y aplica la política de indisponibilidad.
- Privacidad y control: solo personal o sistemas autorizados pueden ver los datos; las solicitudes de eliminación de datos se atienden según lo acordado en el aviso de privacidad.
