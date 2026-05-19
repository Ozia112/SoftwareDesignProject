# Bitácora de tareas - Diego Islas

---

## 24 – 30 de abril de 2026

Elaboración de diagramas de secuencia y de colaboración del sistema para modelar la interacción entre componentes, cubriendo los tres flujos principales del sistema con base en RF-COM-02 y RF-COM-07.

- El sistema carecía de representación visual del flujo de interacción entre componentes:  
  No existía ningún diagrama que mostrara el orden de mensajes entre la persona interesada, el agente conversacional, el sistema, la base de datos y el agente comercial durante los procesos principales del sistema. Esto dificultaba validar la coherencia entre los casos de uso y los requerimientos funcionales, y representaba el entregable pendiente del issue PSD-19 (#63).  
  **Decisiones:**
  - [X] [`diagrama_de_secuencia_1.svg`](</docs/diseño/modelos de diseño/diagrama_de_secuencia_1.svg>) — Se crea el diagrama de secuencia del proceso de captación de la persona interesada y calificación del cliente potencial (lead): modela la interacción inicial, presentación del aviso de privacidad (RF-COM-07), evaluación automática y actualización de etapa comercial (RF-COM-02). — **Creado:** 30 / 04 / 2026
  - [X] [`diagrama_secuencia_2.svg`](</docs/diseño/modelos de diseño/diagrama_secuencia_2.svg>) — Se crea el diagrama de secuencia del proceso de validación de cupo, reserva temporal y confirmación de inscripción: modela la verificación de disponibilidad, la reserva temporal y el bloqueo de vacante por confirmación del operador. — **Creado:** 30 / 04 / 2026
  - [X] [`diagrama_secuencia_3.svg`](</docs/diseño/modelos de diseño/diagrama_secuencia_3.svg>) — Se crea el diagrama de secuencia del proceso de gestión de excepciones, incluyendo lista de espera, cancelaciones y control de inscripciones extemporáneas: cubre los flujos alternos y de error del sistema de cupos. — **Creado:** 30 / 04 / 2026
  - [X] [`diagrama_de_colaboracion.svg`](</docs/diseño/modelos de diseño/diagrama_de_colaboracion.svg>) — Se crea el diagrama de colaboración con la interacción estructural entre los componentes del sistema. — **Creado:** 30 / 04 / 2026
  - [X] [`diagrama-secuencia.md`](/docs/diseño/comportamiento/secuencia/diagrama-secuencia.md) — Se crea el documento de referencia que describe los tres procesos modelados e incluye el enlace de acceso a los diagramas. — **Creado:** 30 / 04 / 2026

---

## 17 – 23 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 10 – 16 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 3 – 9 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 27 de marzo – 2 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 20 – 26 de marzo de 2026

Corrección de inconsistencias entre RF-COM-02, RF-COM-07 y el glosario del sistema (PSD-12), eliminación de un archivo duplicado y creación inicial de tres casos de uso del dominio COM con actualización de los CUs existentes (PSD-15).

- RF-COM-02 y RF-COM-07 presentaban contradicciones con el glosario y entre sí:  
  RF-COM-02 mezclaba la gestión de etapa comercial con la calificación en una sola sección sin separación clara. RF-COM-07 trataba el consentimiento como condición previa obligatoria de una forma que contradecía el glosario y la secuencia establecida en RF-EVT. Las definiciones de etapa comercial y calificación del glosario eran inconsistentes con el comportamiento descrito en ambos RFs.  
  **Decisiones:**
  - [X] [`RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md>) — Se separan los criterios de etapa comercial y calificación en secciones independientes; se alinea el comportamiento con RF-EVT, los casos de uso y los BPMNs; se elimina el archivo duplicado sin extensión `.md` que coexistía en la misma carpeta. — **Modificado:** 23 / 03 / 2026
  - [X] [`RF-COM-07 Informe de privacidad al usuario.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md>) — Se redefine el consentimiento como condición previa obligatoria alineada con el glosario; se eliminan contradicciones con RF-EVT y los casos de uso. — **Modificado:** 23 / 03 / 2026

- Los casos de uso del dominio COM estaban incompletos y los existentes tenían errores de nomenclatura:  
  CU-COM-003 existía con un typo en el nombre de archivo (`CU-CUM-003`) y referenciaba una función incorrecta. No existían CU-COM-004 ni CU-COM-005, dejando sin cobertura de caso de uso a RF-COM-07 (consentimiento) y RF-COM-02 (calificación). CU-COM-001 y CU-COM-002 tenían nombres en formato kebab-case inconsistente con el resto del proyecto. CU-EVT-001 y CU-EVT-002 requerían ajustes de alineación.  
  **Decisiones:**
  - [X] [`CU-COM-003 Gestion de bancos de contexto.md`](</docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md>) — Corregido nombre de archivo (eliminado typo `CU-CUM-003`); renombrado a título funcional correcto. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md`](</docs/diseño/casos de uso/COM/CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md>) — Creado para cubrir el flujo de presentación del aviso de privacidad y registro del consentimiento tácito del usuario, en cobertura de RF-COM-07. — **Creado:** 26 / 03 / 2026
  - [X] [`CU-COM-005 Calificación automática y gestión de etapa comercial.md`](</docs/diseño/casos de uso/COM/CU-COM-005 Calificación automática y gestión de etapa comercial.md>) — Creado para cubrir el flujo de calificación automática del lead y la gestión de su etapa comercial, en cobertura de RF-COM-02. — **Creado:** 26 / 03 / 2026
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Normalización de nombre de archivo desde formato kebab-case; ajuste de alineación con revisión canónica. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Normalización de nombre de archivo desde formato kebab-case; ajuste de alineación con revisión canónica. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Ajuste de alineación con revisión canónica. — **Modificado:** 26 / 03 / 2026
  - [X] [`CU-EVT-002 Gestión de cancelación.md`](</docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md>) — Ajuste de alineación con revisión canónica. — **Modificado:** 26 / 03 / 2026

---

## 13 – 19 de marzo de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 6 – 12 de marzo de 2026

Creación de RF-COM-02 y normalización de la ruta y nombre de archivo de RF-COM-07.

- El dominio COM carecía del requerimiento funcional de calificación automática y gestión de etapa comercial:  
  No existía ningún RF que especificara cómo el sistema debía calificar a un lead y actualizar su etapa comercial de forma automática a partir de su comportamiento en la conversación. Este requerimiento era necesario para dar sustento a los flujos de asignación a operador y verificación de cupo. RF-COM-02 fue creado inicialmente en una ruta incorrecta (`RF-EVT/RF-COM/`) y sin extensión `.md`, requiriendo múltiples correcciones de ubicación y nombre para quedar en la ruta canónica del dominio COM.  
  **Decisiones:**
  - [X] [`RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md>) — Creado para especificar la calificación automática del lead y la gestión de su etapa comercial; corregida la ruta desde `RF-EVT/RF-COM/` a `RF-COM/` y normalizado el nombre de archivo con extensión `.md`. — **Creado:** 08 / 03 / 2026
  - [X] [`RF-COM-07 Informe de privacidad al usuario.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md>) — Renombrado y movido a la ruta canónica del dominio COM junto con RF-COM-02 durante la consolidación de la PR. — **Modificado:** 09 / 03 / 2026

---

## 27 de febrero – 5 de marzo de 2026

Sin cambios en artefactos de diseño durante este periodo.
