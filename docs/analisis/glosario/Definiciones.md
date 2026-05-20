# Definiciones

## Actores del sistema

### Cliente potencial

Persona que interactúa con el sistema iniciando una conversación en un canal de comunicación con el bot. El cliente potencial es el sujeto principal del proceso comercial; su objetivo es obtener información sobre los eventos y eventualmente inscribirse en alguno de ellos. También referido como **Persona interesada** en los casos de uso.

### Operador humano

Persona interna que toma control de una conversación cuando el Bot no puede continuar gestionándola de forma automatizada. Recibe conversaciones escaladas desde el Bot, resuelve dudas que el sistema no puede atender, confirma pagos y cierra ventas. Puede devolver el control al Bot cuando la conversación vuelve a una etapa automatizable. Opera a través de la bandeja de atención humana del sistema.

### Operador administrativo del canal

Usuario con permisos para gestionar conversaciones a nivel de sistema. Interviene cuando el Bot no está disponible, decide si una conversación sin bot se envía directamente a un operador humano o se cierra. Gestiona casos de fallo técnico del sistema bot.

### Administrador del evento

Usuario que configura y mantiene actualizado el Banco de contexto de evento. Es responsable de registrar y modificar la información pública de un evento específico (fechas, horarios, cupos, costos, temario, instructores, modalidad y cualquier otro campo público). Es el único rol autorizado para modificar el Banco de contexto de evento según lo establecido en CU-COM-003.

## Proceso comercial

### Etapa comercial

Estado identificable dentro del proceso comercial que describe el nivel de avance de un cliente potencial hacia la inscripción en un Evento. Cada etapa se determina por criterios observables (acciones, información entregada o decisiones del cliente) y se conforma por:

#### Persona interesada (Lead)

Persona que muestra interés por un evento (por ejemplo, al hacer clic en un anuncio, visitar un enlace, pedir informes o enviar un mensaje). Esta etapa es el punto de entrada al embudo comercial, en esta la prioridad es recopilar información de contacto del usuario. Cuando se tenga la informacion minima requerida para continuar la comunicacion en el mismo o en otro canal estaria listo para avanzar a etapa MQL.
Nota: Todas las conversaciones iniciadas por un cliente potencial se consideran Leads. Al iniciar la conversación se les presentan los avisos legales; se infiere que los términos fueron aceptados de manera tácita cuando el cliente potencial envía su primer mensaje, de acuerdo a lo establecido en CU-COM-004.

#### MQL (Marketing Qualified Lead)

Lead que cumple señales de interés y cuenta con conocimiento básico de lo que busca. Se considera MQL cuando cumple el perfil objetivo y muestra señales de interés real mediante acciones medibles. Suele solicitar aclaraciones de dudas puntuales como horarios, precios, temarios específicos u otros eventos similares.

#### Prospecto

Persona que ha solicitado información sobre los métodos de pago y se encuentra en camino a cerrar la venta. En esta etapa se comparte el formato de pago, número de cuenta bancaria e instrucciones para la confirmación del pago.

Las personas que no logran alcanzar cupo en el evento y pasan a una lista de espera siguen siendo consideradas Prospecto mientras esperan una vacante. **Únicamente las personas en etapa Prospecto pueden ingresar a la lista de espera de un evento.**

A partir de esta etapa, el cliente potencial pasa a formar parte de la **cartera de clientes** del sistema y es candidato para recibir notificaciones de reactivación sobre reaperturas del mismo evento o apertura de eventos relacionados, gestionadas por CU-COM-006.

#### SQL (Sales Qualified Lead)

Persona que ya inició el proceso de pago y solo requiere la confirmación por parte de un operador humano. En esta etapa el cliente potencial ya está ocupando un lugar en el evento mediante una reserva temporal activa. La conversación es escalada obligatoriamente a un operador humano; el Bot no ofrece la opción de continuar de forma automatizada.

Al encontrarse en esta etapa, el cliente potencial ya forma parte de la **cartera de clientes** y es candidato para recibir notificaciones de reactivación gestionadas por CU-COM-006.

#### Cierre (Ganado / Perdido)

Resultado del proceso de venta:

- **Ganado:** existe evidencia de que el cliente pagó exitosamente y la inscripción queda confirmada de forma permanente en el sistema.
- **Perdido:** no se logra confirmar el pago o la persona decide no continuar con el proceso de inscripción. Puede ser por ghosting (ausencia de respuesta tras intentos de contacto) o por negativa explícita a continuar.

#### Alumno activo

Persona ya inscrita y con acceso habilitado al evento, tras confirmación de pago exitosa. Representa el Cierre Ganado del proceso comercial y forma parte de la **cartera de clientes**, por lo que es candidato para recibir notificaciones sobre reaperturas del mismo evento en ediciones futuras o sobre la apertura de eventos relacionados, gestionadas por CU-COM-006.

### Calificación

Valor numérico que el sistema bot asigna a cada persona interesada con base en su nivel de interés, medido a través del tiempo de respuesta y la cantidad de interacciones con el bot. Rango: 0–20.

La calificación se utiliza para:

1. Determinar el orden de prioridad en la bandeja de atención de operadores humanos para los Prospectos.
2. Determinar el orden de prioridad en la lista de espera de un evento que ha agotado su cupo.

La calificación es independiente de la etapa comercial. No determina ni influye en el avance de etapa; influye exclusivamente en la priorización operativa.

### Cartera de clientes

Registro de clientes potenciales que han alcanzado la etapa Prospecto o una etapa posterior (SQL, Cierre Ganado / Alumno activo). Es la base para el envío de notificaciones de reactivación comercial gestionadas por CU-COM-006. El consentimiento tácito registrado en CU-COM-004 habilita el uso de los datos de contacto para dichas notificaciones.

### Señales de transición de etapa

Señales observables generadas por el Bot durante la conversación que disparan la evaluación de CU-COM-005 para actualizar la etapa comercial del cliente potencial.

- `conversacion_iniciada`: se activa al iniciar una conversación con el bot.
- `datos_de_contacto_completados`: se activa al recopilar la información mínima de contacto (nombre, teléfono, correo opcional).
- `pregunta_de_inscripcion_detectada`: se activa al detectar que el cliente potencial hizo una pregunta relacionada con métodos de pago o proceso de inscripción.
- `confirmacion_de_pago_pendiente`: se activa al detectar que el cliente potencial hizo una pregunta o comentario que detona la necesidad de confirmación de pago por parte de un operador humano (por ejemplo, “ya hice el pago, ¿qué sigue?”).
- `evento_cambiado`: se activa al detectar que el cliente potencial solicitó información sobre un evento diferente al original después de haber alcanzado la etapa Prospecto. Produce una reducción de etapa a MQL.
- `exploit_reincidente`: señal de seguridad emitida por CU-COM-005 cuando el cliente potencial ha intentado manipular o abusar del sistema bot de forma reiterada. No es una señal de transición comercial; bloquea la conversación hasta intervención de un operador humano.

## Eventos

### Evento

Curso, diplomado o capacitación disponible para inscripción. Un evento incluye información como: nombre, descripción, fechas, horarios, cupo, precio(s), modalidad, tutor/maestro y participantes inscritos.

#### Cupos

Número máximo de participantes que pueden inscribirse al evento.

#### Reserva temporal

Bloqueo temporal de una vacante del evento durante el proceso de inscripción/pago para garantizar que el interesado **no pierda** su lugar mientras completa el proceso. La reserva tiene una duración limitada de tiempo y se libera automáticamente si no se confirma el pago dentro del plazo establecido.

#### Cancelación

Proceso mediante el cual un participante que completó el proceso de inscripción decide no participar en el evento.

#### Inscripción extemporanea

Proceso de inscripción que ocurre después de la fecha/hora de inicio del evento. Dependiendo de la política del negocio, el sistema bot puede permitir o bloquear estas inscripciones basándose en el avance del evento (porcentaje de sesiones completadas) y un umbral configurado.

#### Estados de un evento

Un evento tiene distintos estados dependiendo del momento en el que se consulte:

- **Próximo:** el evento aún no ha iniciado, está abierto el proceso de inscripción y quedan cupos disponibles.
- **Lleno:** el evento aún no ha iniciado, pero se han agotado los cupos disponibles. El proceso de inscripción se cierra y solo se permite registro en lista de espera para personas en etapa Prospecto.
- **En curso:** el evento ha iniciado, pero aún no ha finalizado. Dependiendo de la política de inscripción extemporánea, el proceso de inscripción puede seguir abierto o cerrarse definitivamente.
- **Finalizado:** el evento ha concluido, el proceso de inscripción se cierra definitivamente y se actualiza el estado de los participantes a Alumno activo.

## Lista de espera de un evento

Mecanismo para gestionar personas interesadas en inscribirse a un evento que ha agotado su cupo. **Solo las personas en etapa Prospecto pueden ingresar a la lista de espera.** La lista mantiene un orden basado en la calificación de los interesados y notifica por orden de prioridad cuando se libera una vacante. En caso de empate en calificación, se aplica orden FIFO cronológico como criterio de desempate.

## Sistemas y canales

### Bot / Sistema bot

Componente automatizado encargado de gestionar la comunicación y el avance de cada persona a través de las etapas comerciales. Toma decisiones según el contexto (acciones previas, respuestas, reglas del negocio) e invoca casos de uso especializados para llevar al usuario hacia el cierre.

### Canal de comunicación

Medio a través del cual el cliente potencial interactúa con el sistema bot. Puede ser un sitio web, una aplicación de mensajería (WhatsApp, Telegram, etc.) o cualquier otro medio digital que permita la comunicación en tiempo real entre el cliente potencial y el bot.

### Bandeja de atención humana

Espacio donde los operadores humanos gestionan las interacciones con los clientes potenciales que requieren atención personalizada. Permite a los operadores revisar, responder y dar seguimiento a los casos que no pueden ser completamente manejados por el sistema bot.

### Cola de espera de operadores

Mecanismo para gestionar la asignación de conversaciones a operadores humanos cuando el volumen de casos supera la capacidad de atención inmediata. La cola permite organizar las conversaciones pendientes de asignación y garantizar que cada cliente potencial reciba atención en el orden en que fue encolado.

### Banco de contexto

#### Banco de contexto general

Repositorio de conocimiento que puede consultar el sistema bot para obtener información relevante sobre el dominio. La información que puede consultar puede ser:

- Lista de eventos (filtrada por estado del evento)
- Horarios de atención
- Avisos legales y resumen de su contenido
- Información general del negocio

#### Banco de contexto de evento

Repositorio de conocimiento específico para la gestión de un evento específico, administrado por el Administrador del evento. Puede incluir información detallada sobre el evento, como:

- Nombre del evento
- Fechas de inicio y fin
- Horarios de sesiones
- Número de sesiones
- Modalidad (presencial, en línea, híbrida)
- Cupos disponibles
- Costos de inscripción
- Temario
- Nombres de los profesores/instructores
- Listas de espera
- Cualquier otro campo público configurado por el Administrador del evento

### Logs del sistema

Registro detallado de todas las acciones, decisiones y eventos que ocurren dentro del sistema bot. Los logs permiten monitorear el funcionamiento del sistema, identificar errores, analizar el comportamiento de los usuarios y generar reportes para la toma de decisiones.

## Marco legal y privacidad

### Aviso legal

Documento proporcionado por los administradores del dominio que establecen los terminos y condiciones de uso del sistema, asi como politicas de privacidad y tratamiento de datos personales. El aviso legal debe ser presentado a los clientes potenciales de forma facil de acceder segun lo establecido en leyes mexicanas respecto a la proteccion de datos personales. El contenido legal de los avisos es responsabilidad de los administradores del dominio, el sistema bot solo se encarga de mostrarlos y registrar el consentimiento tácito de los usuarios.

### Consentimiento tácito

Manifestación de aceptación por parte del cliente potencial a los términos y condiciones establecidos en los avisos legales, inferida a través de su interacción con el sistema bot. El consentimiento tácito se interpreta cuando el cliente potencial inicia una conversación o responde a los mensajes del bot después de haber sido presentado con los avisos legales.

## Seguridad del bot

### Exploit del Bot

Intento de manipulación del sistema bot por parte de un cliente potencial con el objetivo de generar gasto excesivo de tokens o provocar respuestas fuera del dominio del sistema. Los patrones detectables incluyen solicitudes off-topic, instrucciones de formato absurdo, consultas que requieren procesamiento computacional externo al dominio, e intentos de inyección de instrucciones al Bot para alterar su comportamiento. El sistema detecta y penaliza estos intentos; en caso de reincidencia emite la señal `exploit_reincidente` y bloquea la conversación.
