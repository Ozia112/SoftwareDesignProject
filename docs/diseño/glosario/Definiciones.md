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

Mecanismo para gestionar personas interesadas en inscribirse a un evento que ha agotado su cupo. La lista de espera mantiene un orden basado en las calificaciones de los interesados explicado mas adelante y permite notificar por orden de potencial de inscripción a evento cuando se libere una vacante.

## Etapas

Estado identificable dentro del proceso comercial que describe el nivel de avance de una Persona Interesada (cliente potencial) hacia la inscripción en un Evento.  
Cada etapa se determina por criterios observables (acciones, información entregada o decisiones del cliente).

Las etapas se conforman por:

### Persona interesada (Lead)

Persona que muestra interés por un evento (por ejemplo, al hacer clic en un anuncio, visitar un enlace, pedir informes o enviar un mensaje). Puede haber dejado o no datos de contacto. Es la primera etapa identificable del embudo.

### MQL (Marketing Qualified Lead)

Lead calificado por marketing (Sistema o promotor). Se considera MQL cuando cumple el perfil objetivo y muestra señales de interés real mediante acciones medibles (por ejemplo: llenar un formulario, solicitar horarios, descargar temario, preguntar precio, registrarse a una clase muestra).
Nota: Las personas interesadas que llegan a esta etapa obligatoriamente deben ser nofiticadas de las politicas de privacidad y consentimiento de datos (RF-COM-07) antes de ser atendidas por el bot o por un operador humano. El sistema debe registrar la aceptación o rechazo del aviso de privacidad para cada persona interesada.

### Prospecto

Cliente potencial con el que ya existe contacto directo y conversación inicial. En esta etapa se atienden dudas frecuentes, se valida disponibilidad, objetivos, modalidad deseada y se orienta al evento más adecuado.

### SQL (Sales Qualified Lead)

Prospecto calificado por ventas. En esta etapa ya es apto para una conversación de cierre, se presenta oferta concreta (precio, promociones/becas si aplican), métodos de pago, plazos, requisitos de inscripción y se busca confirmación.

### Cierre (Ganado / Perdido)

Resultado del proceso de venta:

- **Ganado:** realizó pago y/o quedó inscrito formalmente.
- **Perdido:** no compra o no se inscribe (por precio, tiempo, falta de interés, no era el curso adecuado o ausencia de respuesta / “ghosting”).

### Alumno activo

Persona ya inscrita y participando en el evento (o con acceso habilitado). En esta etapa se gestiona retención y satisfacción, se promueve recompra (otros cursos), referidos y renovaciones futuras.

## Bot / Sistema bot

Componente automatizado encargado de gestionar la comunicación y el avance de cada persona a través de las etapas comerciales. Puede tomar decisiones según el contexto (acciones previas, respuestas, reglas del negocio) y apoyarse en sub-bots especializados (captación, calificación, seguimiento, pagos, postventa) para llevar al usuario hacia el cierre.

## Banco de contexto

Repositorio de conocimiento e información estructurada que contiene los datos de los eventos, historial de interacciones, reglas de negocio y lineamientos. El bot utiliza este banco de contexto como fuente de consulta en tiempo real para comprender la intención del usuario y proporcionar respuestas precisas, informadas y coherentes durante el proceso de atención y venta.

## Usuario (operador del sistema bot)

Persona interna autorizada para administrar el sistema bot. Puede crear/modificar eventos (precios, horarios, cupo, tutor), revisar el estado de leads/prospectos, intervenir en conversaciones, ajustar mensajes del bot y gestionar casos manuales cuando el flujo automatizado no sea suficiente.

### Calificación de interesados

Proceso mediante el cual el sistema bot evalua a las personas interesadas durante su interacción, asignándoles un puntuaje basado en criterios como rapidez de respuesta, nivel de interés, capacidad presupuestaria, disponibilidad y urgencia.

Nota: La calificación de interesados es independiente de la etapa comercial asignada, pero puede influir en la priorización de atención y en la actualización de la etapa comercial.
