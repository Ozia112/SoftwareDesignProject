## Resumen de actividades individuales

Durante el desarrollo del proyecto, mi participación se centró en la construcción y consolidación de la capa de análisis y diseño del sistema, incluyendo la definición de requerimientos funcionales, la elaboración de diagramas UML y la estructuración de casos de uso.

---

### 1. Definición y formalización de requerimientos funcionales

Se trabajó en la estructuración de requerimientos clave del sistema:

* **RF-COM-07: Aviso de privacidad y consentimiento**

  * Definición del flujo de aceptación/rechazo del usuario.
  * Registro del consentimiento para cumplimiento normativo.
  * **Impacto:** establece el punto de entrada obligatorio del sistema.

* **RF-COM-02: Gestión de etapa comercial y calificación de leads**

  * Definición de etapas comerciales (Lead, MQL, Prospecto, SQL, etc.).
  * Implementación de criterios de calificación automática.
  * **Impacto:** permite priorizar clientes potenciales y optimizar el proceso comercial.

---

### 2. Elaboración de casos de uso

Se desarrollaron casos de uso asociados a los requerimientos principales del sistema, describiendo de manera estructurada la interacción entre los actores y el sistema.

* Se definieron actores como:

  * Persona interesada
  * Agente comercial
  * Sistema

* Se documentaron flujos principales y alternos, incluyendo:

  * Aceptación o rechazo del aviso de privacidad
  * Registro y calificación de leads
  * Validación de cupo y proceso de inscripción

* Se establecieron precondiciones, postcondiciones y escenarios de excepción.

* **Impacto:**

  * Traducen los requerimientos en comportamientos específicos del sistema.
  * Facilitan la comprensión funcional para desarrollo y validación.
  * Sirven como puente entre requerimientos y diagramas UML.

---

### 3. Desarrollo de diagramas de secuencia

Se diseñaron tres diagramas de secuencia para representar los flujos del sistema:

* Captación y calificación de leads

* Reserva de cupo y confirmación de inscripción

* Gestión de excepciones (lista de espera, cancelaciones)

* **Impacto:** permiten visualizar el orden de interacción entre los componentes y validar la lógica del sistema.

---

### 4. Elaboración del diagrama de colaboración

Se desarrolló un diagrama de colaboración que representa la interacción estructural entre:

* Usuario

* Chatbot

* Sistema backend

* Base de datos

* Agente comercial

* **Impacto:** proporciona una visión global del sistema y complementa los diagramas de secuencia.

---

### 5. Integración de lógica de eventos (RF-EVT)

Se incorporaron reglas relacionadas con la gestión de eventos:

* Validación de cupo disponible

* Reserva temporal de vacantes

* Confirmación de inscripción

* Gestión de lista de espera

* Cancelaciones

* **Impacto:** define reglas de negocio críticas para la operación del sistema.

---

### 6. Gestión del repositorio

Se realizaron actividades de integración y control de versiones:

* Resolución de conflictos en `.gitignore`

* Sincronización de ramas (`main` y `develop`)

* Organización de estructura de documentación

* **Impacto:** asegura la continuidad del trabajo colaborativo y estabilidad del proyecto.

---

### Síntesis del aporte

Las actividades realizadas permitieron:

* Definir el comportamiento del sistema de forma estructurada.
* Reducir ambigüedad en los procesos comerciales.
* Establecer una relación clara entre requerimientos, casos de uso y diagramas.
* Preparar una base sólida para la fase de implementación.

Mi contribución se centró en estructurar el sistema desde una perspectiva funcional y lógica, facilitando la comprensión y continuidad del desarrollo por parte del equipo.


## Conclusión

El trabajo realizado permitió consolidar los elementos clave del diseño del sistema, especialmente en la definición de requerimientos funcionales y en la representación de los flujos mediante diagramas. Esto contribuyó a transformar ideas generales en estructuras claras y bien definidas, reduciendo significativamente la ambigüedad del proyecto.

A nivel individual, el aporte realizado impacta directamente en la claridad, organización y viabilidad del sistema, facilitando el trabajo colaborativo y la continuidad del desarrollo en las siguientes etapas.