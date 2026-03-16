# RF-COM-02: Gestión de etapa comercial y calificación automática de leads

## Descripción
docs/psd-05-consolidacion-rf-com-02

El sistema debe evaluar, clasificar y gestionar automáticamente a las personas interesadas durante su interacción con el agente conversacional y a lo largo del proceso comercial, asignando y manteniendo actualizada la etapa comercial correspondiente conforme a su avance dentro del proceso de captación, seguimiento y conversión.

El agente debe realizar la calificación automática de clientes potenciales durante la conversación en el chat, evaluando a las personas interesadas con base en criterios definidos como nivel de interés en el curso, capacidad presupuestaria, disponibilidad y nivel de urgencia. Esto permitirá priorizar la atención humana hacia aquellos casos con mayor probabilidad de inscripción y optimizar la gestión operativa del equipo de admisiones.

Con base en dicha evaluación y en los eventos comerciales registrados durante la interacción con el sistema, el sistema debe asignar y actualizar automáticamente la etapa del proceso comercial asociada a cada cliente potencial.

Nota: En la interfaz del sistema la etapa comercial puede mostrarse como una “etiqueta”; sin embargo, a nivel funcional corresponde a un estado del cliente potencial dentro del proceso comercial.

## Historia de Usuario

**Como** agente comercial o miembro del equipo de admisiones  
**Quiero** que el sistema evalúe automáticamente a las personas interesadas y actualice su etapa comercial durante la interacción con el agente conversacional  
**Para** priorizar la atención de los clientes potenciales con mayor probabilidad de inscripción y dar seguimiento adecuado dentro del proceso comercial

## Etapas del proceso comercial

El sistema debe gestionar las siguientes etapas comerciales asociadas a cada cliente potencial:

- **Lead (Persona interesada):** manifestó interés inicial en el curso o servicio.
- **MQL (Marketing Qualified Lead):** cliente potencial calificado por marketing.
- **Prospecto:** se ha iniciado contacto directo y se han atendido dudas iniciales.
- **SQL (Sales Qualified Lead):** cliente potencial listo para proceso de cierre o inscripción.
- **Cierre Ganado:** el cliente realizó el pago o confirmó su inscripción.
- **Cierre Perdido por declinación:** el cliente decidió no continuar con el proceso.
- **Cierre Perdido por falta de respuesta:** el cliente no respondió después de los intentos de contacto definidos.
- **Alumno activo:** el cliente quedó inscrito y participa en el servicio educativo.

## Criterios de Aceptación

### Gestión de etapa comercial

- [ ] Al crear un registro de cliente potencial, el sistema asigna automáticamente la etapa **Lead**
- [ ] La etapa comercial es visible en la lista de personas interesadas y en la ficha del cliente potencial
- [ ] El sistema mantiene un historial de cambios de etapa comercial
- [ ] El sistema permite el cambio manual de etapa únicamente a usuarios autorizados
- [ ] El cambio manual registra usuario, fecha, hora, etapa anterior y nueva etapa
- [ ] Un cliente potencial solo puede tener una etapa comercial activa a la vez

### Calificación automática de clientes potenciales

- [ ] El agente realiza preguntas estratégicas para identificar el nivel de interés
- [ ] El sistema ejecuta la calificación automática durante la conversación
- [ ] La clasificación utiliza criterios definidos: interés, presupuesto, disponibilidad y urgencia
- [ ] La clasificación se basa en reglas configuradas en el sistema
- [ ] El sistema asigna automáticamente una categoría de calificación al cliente potencial
- [ ] El cliente potencial recibe un nivel de prioridad: alto, medio o bajo
- [ ] El nivel de calificación queda registrado en la base de datos
- [ ] La calificación puede influir en la actualización de la etapa comercial
- [ ] El sistema notifica al equipo humano cuando se identifica un cliente potencial con prioridad alta