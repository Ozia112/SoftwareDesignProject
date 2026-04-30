# RF-COM-02 Gestión de etapa comercial y calificación automática de leads

## Descripción

El sistema debe evaluar, clasificar y gestionar automáticamente a las personas interesadas durante su interacción con el agente conversacional y a lo largo del proceso comercial, asignando y manteniendo actualizada la etapa comercial correspondiente conforme a su avance dentro del proceso de captación, seguimiento y conversión.

El bot debe realizar la calificación automática de las personas interesadas durante la conversación, asignando un puntaje numérico basado en el nivel de interés medido a través del tiempo de respuesta y la cantidad de interacción con el bot. Esto permite priorizar la atención a Prospectos con mayor probabilidad de avanzar a SQL y determinar el orden de prioridad en la lista de espera de eventos con cupo agotado.

Con base en dicha evaluación y en los eventos registrados durante la interacción, el sistema debe asignar y actualizar automáticamente la etapa del proceso comercial asociada a cada persona interesada.

Nota: En la interfaz del sistema la etapa comercial puede mostrarse como una etiqueta; sin embargo, a nivel funcional corresponde a un estado interno dentro del proceso comercial.

## Historia de Usuario

**Como** agente comercial o miembro del equipo de admisiones  
**Quiero** que el sistema evalúe automáticamente a las personas interesadas y actualice su etapa comercial durante la interacción con el bot  
**Para** priorizar la atención de las personas interesadas con mayor probabilidad de inscripción y dar seguimiento adecuado dentro del proceso comercial  

## Etapas del proceso comercial

El sistema debe gestionar las siguientes etapas comerciales asociadas a cada persona interesada, conforme a las definiciones establecidas en el glosario:

- **Lead (Persona interesada):** manifestó interés inicial en el evento o servicio.  
- **MQL (Marketing Qualified Lead):** persona interesada que cumple criterios de perfil y muestra interés relevante.  
- **Prospecto:** existe contacto directo y se han atendido dudas iniciales.  
- **SQL (Sales Qualified Lead):** persona interesada lista para proceso de cierre.  
- **Cierre Ganado:** realizó pago o confirmó inscripción.  
- **Cierre Perdido por declinación:** decidió no continuar con el proceso.  
- **Cierre Perdido por falta de respuesta:** no respondió tras intentos definidos de contacto.  
- **Alumno activo:** persona inscrita y participando en el evento.  

## Criterios de Aceptación

### Gestión de etapa comercial

- [ ] Al crear un registro de persona interesada, el sistema asigna automáticamente la etapa **Lead**  
- [ ] La etapa comercial es visible únicamente para usuarios internos del sistema  
- [ ] El sistema mantiene un historial de cambios de etapa comercial  
- [ ] El sistema permite el cambio manual de etapa únicamente a usuarios autorizados  
- [ ] El cambio manual registra usuario, fecha, hora, etapa anterior y nueva etapa  
- [ ] Una persona interesada solo puede tener una etapa comercial activa a la vez  

### Calificación automática de personas interesadas

- [ ] El bot realiza preguntas estratégicas para identificar el nivel de interés  
- [ ] El sistema ejecuta la calificación automática durante la conversación  
- [ ] La clasificación utiliza como criterio el nivel de interés del interesado, medido mediante el tiempo de respuesta y la cantidad de interacción con el bot  
- [ ] La clasificación se basa en reglas configuradas en el sistema  
- [ ] El sistema asigna automáticamente una calificación a la persona interesada  
- [ ] La persona interesada recibe un nivel de prioridad: alto, medio o bajo  
- [ ] El nivel de calificación queda registrado en la base de datos  
- [ ] La calificación puede influir en la priorización de atención y en la actualización de la etapa comercial  
- [ ] El sistema notifica al equipo humano cuando se identifica una persona interesada con prioridad alta
