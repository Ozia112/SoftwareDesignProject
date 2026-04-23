# Definiciones

## Evento

Curso, diplomado o capacitación disponible para inscripción. Un evento incluye información como: nombre, descripción, fechas, horarios, cupo, precio(s), modalidad, tutor/maestro y participantes inscritos.

### Cupos

Número maximo de participantes que pueden incribirse al evento.

### Reserva temporal

Bloqueo temporal de una vacante del evento durante el proceso de inscripción/pago para garantizar que el interesado pierda su lugar mientras completa el proceso. La reserva tiene una duracion limitada de tiempo y se libera automaticamente si no se confirma el pago dentro del plazo establecido.

### Cancelación

Proceso mediante el cual un participante que completo el proceso de inscripción decide no participar en el evento. La cancelación puede ser voluntaria (por decisión del participante) o involuntaria (por incumplimiento de políticas, falta de pago, etc.). Al cancelar, se libera la vacante y se actualiza el estado de los cupos del evento.

### Incripcion extemporanea

Proceso de inscripción que ocurre después de la fecha/hora de inicio del evento. Dependiendo de la política del negocio, el sistema bot puede permitir o bloquear estas inscripciones basándose en el avance del evento (porcentaje de sesiones completadas) y un umbral configurado.

## Lista de espera de un evento

Mecanismo para gestionar personas interesadas en inscribirse a un evento que ha agotado su cupo. **Solo las personas en etapa Prospecto pueden ingresar a la lista de espera.** La lista mantiene un orden basado en el puntaje de los interesados y permite notificar por orden de prioridad cuando se libere una vacante. En caso de empate en puntaje, se aplica orden FIFO cronológico como criterio de desempate.

## Etapas

Estado identificable dentro del proceso comercial que describe el nivel de avance de una Persona Interesada (cliente potencial) hacia la inscripción en un Evento.  
Cada etapa se determina por criterios observables (acciones, información entregada o decisiones del cliente).

Las etapas se conforman por:

### Persona interesada (Lead)

Persona que muestra interés por un evento (por ejemplo, al hacer clic en un anuncio, visitar un enlace, pedir informes o enviar un mensaje). Puede haber dejado o no datos de contacto. Es la primera etapa identificable del embudo. La prioridad en esta etapa es recopilar los datos de contacto de la persona: nombre, teléfono, edad y cualquier otro dato que permita continuar la comunicación.

### MQL (Marketing Qualified Lead)

Lead que cumple señales de interés y cuenta con conocimiento básico de lo que busca. Se considera MQL cuando cumple el perfil objetivo y muestra señales de interés real mediante acciones medibles. Suele solicitar aclaraciones de dudas puntuales como horarios, precios, temarios específicos u otros eventos similares.

Nota: Las personas interesadas que llegan a esta etapa obligatoriamente deben ser notificadas de las políticas de privacidad y consentimiento de datos (RF-COM-07) antes de ser atendidas por el bot o por un operador humano. El sistema debe registrar la aceptación o rechazo del aviso de privacidad para cada persona interesada.

### Prospecto

Persona que ha solicitado información sobre los métodos de pago y se encuentra en camino a cerrar la venta. En esta etapa se comparte el formato de pago, número de cuenta bancaria e instrucciones para la confirmación del pago.

Las personas que no logran alcanzar cupo en el evento y pasan a una lista de espera siguen siendo consideradas Prospecto mientras esperan una vacante. **Únicamente las personas en etapa Prospecto pueden ingresar a la lista de espera de un evento.**

### SQL (Sales Qualified Lead)

Persona que ya inició el proceso de pago y solo requiere la confirmación por parte de un operador humano. En esta etapa el cliente potencial ya está ocupando un lugar en el evento mediante una reserva temporal activa, por lo que no puede perder su lugar si la confirmación de pago resulta exitosa.

Si la confirmación falla o la persona decide no continuar, puede regresar a etapa Prospecto o avanzar directamente a Cierre Perdido (por ghosting o negativa explícita a continuar el proceso).

### Cierre (Ganado / Perdido)

Resultado del proceso de venta:

- **Ganado:** existe evidencia de que el cliente pagó exitosamente y entregó la documentación requerida para la inscripción formal al evento.
- **Perdido:** no se logra confirmar el pago o la persona decide no continuar con el proceso de inscripción. Puede ser por ghosting (ausencia de respuesta tras intentos de contacto) o por negativa explícita a continuar.

### Alumno activo

Persona ya inscrita y participando en el evento (o con acceso habilitado). En esta etapa se gestiona retención y satisfacción, se promueve recompra (otros cursos), referidos y renovaciones futuras.

## Bot / Sistema bot

Componente automatizado encargado de gestionar la comunicación y el avance de cada persona a través de las etapas comerciales. Puede tomar decisiones según el contexto (acciones previas, respuestas, reglas del negocio) y apoyarse en sub-bots especializados (captación, calificación, seguimiento, pagos, postventa) para llevar al usuario hacia el cierre.

## Banco de contexto

Repositorio de conocimiento e información estructurada que contiene los datos de los eventos, historial de interacciones, reglas de negocio y lineamientos. El bot utiliza este banco de contexto como fuente de consulta en tiempo real para comprender la intención del usuario y proporcionar respuestas precisas, informadas y coherentes durante el proceso de atención y venta.

## Usuario (operador del sistema bot)

Persona interna autorizada para administrar el sistema bot. Puede crear/modificar eventos (precios, horarios, cupo, tutor), revisar el estado de leads/prospectos, intervenir en conversaciones, ajustar mensajes del bot y gestionar casos manuales cuando el flujo automatizado no sea suficiente.

### Puntaje de interesados

Valor numérico cualitativo que el sistema bot asigna a cada persona interesada con base en su nivel de interés, medido a través del tiempo de respuesta y la cantidad de interacción con el bot.

El puntaje se utiliza para:

1. Determinar el orden de prioridad en la atención a Prospectos para avanzar a la etapa SQL.
2. Determinar el orden de prioridad en la lista de espera de un evento que ha agotado su cupo.

El puntaje es independiente de la etapa comercial. No determina por sí solo el avance de etapa, sino que influye exclusivamente en la priorización operativa.
