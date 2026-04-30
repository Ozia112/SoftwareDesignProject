# Bitácora de tareas - Carrillo Maximiliano

---

## 24 – 30 de abril de 2026

Correcciones finales a requerimientos no funcionales previamente creados en colaboración con Isaac Ortiz, y creación del diagrama de casos de uso de los módulos COM y EVT.

- Los RNF-03 y RNF-04 tenían contenido que requería ajuste tras la revisión conjunta:  
  Ambos requerimientos no funcionales presentaban redacción o criterios que debían alinearse con el modelo del sistema acordado. Las correcciones se realizaron en co-autoría con Isaac Alejandro Ortiz Zaldivar.  
  **Decisiones:**
  - [X] [`RNF-03 Claridad de mensajes del bot.md`](</docs/diseño/requerimientos/no funcionales/RNF-03 Claridad de mensajes del bot.md>) — Corrección de contenido en colaboración con Isaac Ortiz. — **Modificado:** 30 / 04 / 2026
  - [X] [`RNF-04 Continuidad de la conversación.md`](</docs/diseño/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md>) — Corrección de contenido en colaboración con Isaac Ortiz. — **Modificado:** 30 / 04 / 2026

- El sistema no contaba con un diagrama de casos de uso que consolidara visualmente los actores y sus relaciones con los CUs de ambos módulos:  
  No existía ningún artefacto visual que representara la estructura de casos de uso de los módulos COM y EVT de forma integrada, mostrando actores (Cliente potencial, Operador humano, Operador administrativo, Bot) y las relaciones `<<include>>` y `<<extend>>` entre los CUs. Su ausencia dificultaba validar la cobertura funcional del modelo de casos de uso.  
  **Decisiones:**
  - [X] [`Diagrama de casos de uso.png`](</docs/diseño/modelos de diseño/Diagrama de casos de uso.png>) — Se crea el diagrama de casos de uso integrado de los módulos COM y EVT, con los cuatro actores del sistema y las relaciones de inclusión y extensión entre los nueve CUs (CU-COM-001 a 006, CU-EVT-001 a 003). — **Creado:** 30 / 04 / 2026

---

## 17 – 23 de abril de 2026

Ampliación de los RNF existentes con contenido real y creación del RNF de disponibilidad del sistema.

- Los RNF-01 a 04 se habían creado como esqueletos sin contenido suficiente, y faltaba el RNF de disponibilidad:  
  Los primeros cuatro requerimientos no funcionales fueron creados en la semana anterior sin información completa. En esta semana se les agregó el contenido necesario y se creó el RNF-05 que cubre la disponibilidad operativa del sistema.  
  **Decisiones:**
  - [X] [`RNF-01 Interacción entre los actores del sistema y la base de datos.md`](</docs/diseño/requerimientos/no funcionales/RNF-01 Interacción entre los actores del sistema y la base de datos.md>) — Ampliado con contenido real. — **Modificado:** 23 / 04 / 2026
  - [X] [`RNF-02 Rendimiento del bot.md`](</docs/diseño/requerimientos/no funcionales/RNF-02 Rendimiento del bot.md>) — Ampliado con contenido real. — **Modificado:** 23 / 04 / 2026
  - [X] [`RNF-03 Claridad de mensajes del bot.md`](</docs/diseño/requerimientos/no funcionales/RNF-03 Claridad de mensajes del bot.md>) — Ampliado con contenido real. — **Modificado:** 23 / 04 / 2026
  - [X] [`RNF-04 Continuidad de la conversación.md`](</docs/diseño/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md>) — Ampliado con contenido real. — **Modificado:** 23 / 04 / 2026
  - [X] [`RNF-05 Disponibilidad del sistema.md`](</docs/diseño/requerimientos/no funcionales/RNF-05 Disponibilidad del sistema.md>) — Creado para cubrir el requerimiento de disponibilidad operativa del sistema. — **Creado:** 23 / 04 / 2026

---

## 10 – 16 de abril de 2026

Creación de los primeros cuatro requerimientos no funcionales del sistema.

- El sistema no contaba con ningún requerimiento no funcional documentado:  
  No existía ningún artefacto que definiera restricciones de calidad, rendimiento o comportamiento del sistema fuera de los flujos funcionales. Se crearon los primeros cuatro RNF como base del modelo no funcional.  
  **Decisiones:**
  - [X] [`RNF-01 Interacción entre los actores del sistema y la base de datos.md`](</docs/diseño/requerimientos/no funcionales/RNF-01 Interacción entre los actores del sistema y la base de datos.md>) — Creado para documentar las restricciones de interacción entre actores y la base de datos. — **Creado:** 16 / 04 / 2026
  - [X] [`RNF-02 Rendimiento del bot.md`](</docs/diseño/requerimientos/no funcionales/RNF-02 Rendimiento del bot.md>) — Creado para definir los tiempos de respuesta y rendimiento esperado del agente conversacional. — **Creado:** 16 / 04 / 2026
  - [X] [`RNF-03 Claridad de mensajes del bot.md`](</docs/diseño/requerimientos/no funcionales/RNF-03 Claridad de mensajes del bot.md>) — Creado para establecer los criterios de claridad y comprensibilidad en los mensajes del bot. — **Creado:** 16 / 04 / 2026
  - [X] [`RNF-04 Continuidad de la conversación.md`](</docs/diseño/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md>) — Creado para definir los requisitos de persistencia y continuidad del contexto conversacional. — **Creado:** 16 / 04 / 2026

---

## 3 – 9 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 27 de marzo – 2 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 20 – 26 de marzo de 2026

Corrección de terminología y flujos en los casos de uso de los dominios COM y EVT tras revisión de pull requests.

- Los CUs del dominio EVT usaban terminología inconsistente con el glosario y los actores estaban mal nombrados:  
  Los tres casos de uso EVT utilizaban "Lead" como etapa genérica en lugar de las etapas comerciales correctas (MQL, Prospecto), referenciaban "agente humano" en vez de "operador humano", y usaban "Base de datos" donde debía decir "Banco de contexto". Además contenían información redundante y carecían de la sección de alcance.  
  **Decisiones:**
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Corrección de etapas, actores y terminología; eliminación de información redundante; adición del alcance. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-EVT-002 Gestión de cancelación.md`](</docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md>) — Corrección de etapas, actores y terminología; eliminación de información redundante; adición del alcance. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-EVT-003 Sistema de inscripción.md`](</docs/diseño/casos de uso/EVT/CU-EVT-003 Sistema de inscripción.md>) — Corrección de etapas, actores y terminología; eliminación de información redundante; adición del alcance. — **Modificado:** 26 / 03 / 2026

- El flujo de excepción E1 de CU-EVT-003 era incorrecto:  
  El flujo de excepción E1 asignaba únicamente al sistema la responsabilidad de verificar el cupo, sin contemplar al operador humano, y etiquetaba incorrectamente al actor como "Prospecto" cuando debía ser "MQL" en ese punto del flujo.  
  **Decisiones:**
  - [X] [`CU-EVT-003 Sistema de inscripción.md`](</docs/diseño/casos de uso/EVT/CU-EVT-003 Sistema de inscripción.md>) — Se corrigió el flujo E1 para que tanto el sistema como el operador humano puedan verificar el cupo; se cambió la etiqueta del actor de Prospecto a MQL. — **Modificado:** 26 / 03 / 2026

- Los CUs del dominio COM requerían correcciones según la revisión del pull request:  
  CU-COM-001, CU-COM-002 y CU-COM-003 presentaban observaciones pendientes de la revisión formal del PR que debían resolverse antes de integrar la rama.  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Correcciones según observaciones de revisión del PR. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Correcciones según observaciones de revisión del PR. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-COM-003 Gestion de bancos de contexto.md`](</docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md>) — Correcciones según observaciones de revisión del PR. — **Modificado:** 26 / 03 / 2026

---

## 13 – 19 de marzo de 2026

Creación del caso de uso de sistema de inscripción y corrección de inconsistencias en los CUs del dominio COM.

- El dominio EVT no tenía caso de uso para el proceso de inscripción:  
  CU-EVT-003 era el único caso de uso del dominio EVT sin redactar. Su ausencia dejaba sin modelar el flujo central de inscripción a eventos.  
  **Decisiones:**
  - [X] [`CU-EVT-003 Sistema de inscripción.md`](</docs/diseño/casos de uso/EVT/CU-EVT-003 Sistema de inscripción.md>) — Creado con el flujo principal de inscripción y estado inicial de borrador. — **Creado:** 17 / 03 / 2026

- Los CUs del dominio COM tenían faltas de ortografía, nomenclatura inconsistente y título incorrecto en CU-COM-003:  
  CU-COM-001, CU-COM-002 y CU-COM-003 presentaban faltas de ortografía, uso inconsistente de "Lead"/"lead", información no relevante, y el archivo de CU-COM-003 tenía el prefijo erróneo "CU-CUM" en su nombre. Además faltaba referenciar los issues relacionados (#08 y #13).  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Corrección ortográfica, estandarización de "Lead", eliminación de información no relevante, adición de issue relacionado. — **Modificado:** 19 / 03 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Corrección ortográfica, estandarización de "Lead", eliminación de información no relevante, adición de issue relacionado. — **Modificado:** 19 / 03 / 2026
  - [X] [`CU-COM-003 Gestion de bancos de contexto.md`](</docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md>) — Corrección ortográfica, corrección del prefijo del nombre de archivo de "CU-CUM" a "CU-COM", estandarización de "Lead". — **Modificado:** 19 / 03 / 2026

---

## 6 – 12 de marzo de 2026

Creación de requerimientos funcionales del dominio COM (RF-COM-04 a 06) y casos de uso de los dominios COM y EVT.

- El dominio COM carecía de RF que modelaran las capacidades de información de eventos del bot:  
  No existían requerimientos que especificaran qué información sobre eventos debía proporcionar el bot (listado, detalle, fechas y horarios). Estos RF son base para los casos de uso del dominio COM.  
  **Decisiones:**
  - [X] [`RF-COM-04 El Bot debe mostrar el listado de eventos disponibles.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-04 El Bot debe mostrar el listado de eventos disponibles.md>) — Creado para especificar la obligación del bot de mostrar los eventos disponibles al usuario. — **Creado:** 05 / 03 / 2026
  - [X] [`RF-COM-05 El Bot debe proporcionar información detallada de cada evento.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-05 El Bot debe proporcionar información detallada de cada evento.md>) — Creado para especificar que el bot debe entregar información completa de cada evento consultado. — **Creado:** 05 / 03 / 2026
  - [X] [`RF-COM-06 El Bot debe informar fechas de inicio y horarios disponibles.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-06 El Bot debe informar fechas de inicio y horarios disponibles.md>) — Creado para especificar que el bot debe comunicar fechas y horarios de cada evento. — **Creado:** 05 / 03 / 2026

- No existían casos de uso que modelaran los flujos de los dominios COM y EVT:  
  Los RF del dominio COM y EVT estaban redactados pero no tenían casos de uso asociados que modelaran los flujos de interacción. Se crearon los primeros borradores de CU-COM-001, CU-COM-002, CU-COM-003 (presentación de eventos), CU-EVT-001 y CU-EVT-002.  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Creado como primer borrador del flujo de asignación de conversaciones. — **Creado:** 08 / 03 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Creado como primer borrador del flujo principal de conversación. — **Creado:** 08 / 03 / 2026
  - [X] [`CU-COM-003 Gestion de bancos de contexto.md`](</docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md>) — Creado como primer borrador del caso de uso de presentación de eventos disponibles. — **Creado:** 11 / 03 / 2026
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Creado para modelar el flujo de registro en lista de espera (RF-EVT-01, 03, 05, 07). — **Creado:** 12 / 03 / 2026
  - [X] [`CU-EVT-002 Gestión de cancelación.md`](</docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md>) — Creado para modelar el flujo de gestión de cancelación de inscripciones. — **Creado:** 12 / 03 / 2026

---

## 27 de febrero – 5 de marzo de 2026

Creación de los requerimientos funcionales del dominio EVT y apoyo inicial en el glosario del sistema.

- El sistema no contaba con ningún requerimiento funcional del dominio EVT ni con glosario base:  
  Era necesario establecer la base documental del dominio EVT con todos sus RF para poder construir los casos de uso y el modelo de diseño. Se crearon los 7 RF del dominio EVT y se contribuyó al glosario de definiciones del sistema.  
  **Decisiones:**
  - [X] [`RF-EVT-01 Verificacion de disponibilidad de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01 Verificacion de disponibilidad de cupo.md>) — Creado para especificar la verificación de disponibilidad de cupos en eventos. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-02 Reservacion de vacante durante proceso de venta.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-02 Reservacion de vacante durante proceso de venta.md>) — Creado para especificar la reserva temporal de vacantes durante el proceso comercial. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md>) — Creado para especificar el mecanismo de notificación al liberar un cupo. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md>) — Creado para especificar el bloqueo de vacantes tras confirmación de pago. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-06 Gestion de inscripciones extemporaneas.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de inscripciones extemporaneas.md>) — Creado para especificar el control de inscripciones fuera de plazo. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-07 Gestion de lista de espera.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-07 Gestion de lista de espera.md>) — Creado para especificar la gestión de la lista de espera de cupos. — **Creado:** 02 / 03 / 2026
  - [X] [`Definiciones.md`](</docs/diseño/glosario/Definiciones.md>) — Apoyo en la creación del glosario base del sistema. — **Creado:** 02 / 03 / 2026
