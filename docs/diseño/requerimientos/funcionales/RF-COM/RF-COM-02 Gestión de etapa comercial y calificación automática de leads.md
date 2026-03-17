# RF-COM-02 Gestión de etapa comercial y calificación automática de leads

## Descripción

El sistema debe evaluar, clasificar y gestionar automáticamente a las personas interesadas durante su interacción con el agente conversacional y a lo largo del proceso comercial, asignando y manteniendo actualizada la etapa comercial correspondiente conforme a su avance dentro del proceso de captación, seguimiento y conversión.

El agente debe realizar la calificación automática de clientes potenciales durante la conversación en el chat, evaluando a las personas interesadas con base en criterios definidos como nivel de interés en el curso, capacidad presupuestaria, disponibilidad y nivel de urgencia, con la finalidad de priorizar la atención humana hacia aquellos casos con mayor probabilidad de inscripción y optimizar la gestión operativa del personal.

Con base en dicha evaluación y en los eventos comerciales registrados, el sistema debe asignar y actualizar automáticamente la etapa del proceso comercial asociada a cada cliente potencial.

Nota: En la interfaz puede mostrarse como una “etiqueta”; sin embargo, a nivel funcional corresponde a un estado o etapa comercial del cliente potencial.

Etapas del proceso comercial
Lead (Persona interesada): manifestó interés inicial.
MQL: cliente potencial calificado por marketing.
Prospecto: contacto directo iniciado y dudas atendidas.
SQL: cliente potencial calificado para cierre; se gestionan pagos o confirmaciones.
Cierre Ganado: realizó el pago y/o quedó inscrito formalmente.
Cierre Perdido por declinación: decidió no participar.
Cierre Perdido por falta de respuesta: no respondió tras los intentos definidos de contacto.
Alumno activo: inscrito y participando en el servicio educativo (fase de postventa y retención).

## Historia de Usuario

Como agente comercial o miembro del equipo de admisiones,quiero que el sistema evalúe automáticamente a las personas interesadas y actualice su etapa comercial durante la interacción con el agente conversacional,para priorizar la atención de los clientes potenciales con mayor probabilidad de inscripción y dar seguimiento adecuado dentro del proceso comercial.

## Criterios de Aceptación

Gestión de etapa comercial

- Al crear un registro de cliente potencial, el sistema asigna automáticamente la etapa Lead.
- La etapa comercial es visible en la lista de personas interesadas y en la ficha o detalle del cliente potencial.
- El sistema mantiene un historial de cambios de etapa comercial.
- El sistema permite el cambio manual de etapa únicamente a usuarios autorizados, registrando:usuario que realizó el cambio,fecha y hora,etapa anterior y nueva.
- Un cliente potencial solo puede tener una etapa comercial activa a la vez.
- Calificación automática de clientes potenciales
- El agente realiza preguntas estratégicas orientadas a identificar el nivel de interés de la persona interesada.
- El sistema ejecuta la calificación automática del cliente potencial durante la conversación utilizando criterios definidos (interés, presupuesto, disponibilidad y urgencia).
- La clasificación se basa en reglas previamente configuradas en el sistema.
- El sistema asigna automáticamente una categoría de calificación al cliente potencial.
- El cliente potencial recibe un nivel de prioridad (alto, medio o bajo), independiente de la etapa comercial asignada.
- El nivel de calificación queda registrado en la base de datos.
- La calificación automática puede influir en la priorización de atención y en la actualización de la etapa comercial.
- El sistema notifica al equipo humano cuando se identifica un cliente potencial con prioridad alta.
