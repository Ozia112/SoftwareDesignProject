# Bitácora de tareas - Ortiz Isaac

---

## 8 – 14 de mayo de 2026

Ajuste de campos de casos de uso, restauración y actualización de diagrama BPMN, y consolidación de documentación de diseño.

- Ajuste de campos específicos en casos de uso para alinearse a los nuevos procesos de gestión de cupos:  
  Fue necesario actualizar CU-COM-001 y CU-COM-002 para reflejar correctamente los flujos de asignación de conversaciones y presentación del Cliente potencial al Bot. Se agregó CU-EVT-003 para consolidar la gestión de cupos de eventos como responsabilidad centralizada.  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Actualización de campos y flujos para alinearse a procesos vigentes. — **Modificado:** 12 / 05 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre el Cliente potencial y el Bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre el Cliente potencial y el Bot.md>) — Ajuste de campos específicos para reflejar flujos actualizados. — **Modificado:** 12 / 05 / 2026
  - [X] [`CU-EVT-003 Gestión de cupos de eventos.md`](</docs/diseño/casos de uso/EVT/CU-EVT-003 Gestión de cupos de eventos.md>) — Creado para centralizar la gestión de cupos de eventos. — **Creado:** 12 / 05 / 2026
  - **Commit relacionado:** `002dfbe` — feat(docs): update CU-COM-001 and CU-COM-002; add CU-EVT-003 for event capacity management (PSD-23, issue #73)

- Restauración y actualización de diagrama BPMN con referencias locales y contenido mejorado:  
  El archivo BPMNs.md tenía una referencia externa a Miro en lugar de vincular el diagrama SVG local. Se restauró y actualizó el diagrama BPMN-001.svg como visualización del flujo de conversación. Faltaba descripción clara del flujo BPMN-001 y sus relaciones con los casos de uso actualizados.  
  **Decisiones:**
  - [X] [`BPMN-001.svg`](</docs/diseño/modelos de diseño/BPMN-001.svg>) — Restaurado y actualizado como diagrama visual del flujo de conversación entre Cliente potencial y Bot. — **Restaurado/Actualizado:** 14 / 05 / 2026
  - [X] [`BPMNs.md`](</docs/diseño/modelos de diseño/BPMNs.md>) — Actualización de referencias a Miro por link local al SVG; adición de descripción completa del flujo BPMN-001 basado en CU-COM-002; inclusión de todos los casos de uso relacionados (CU-COM-001, CU-COM-003, CU-COM-004, CU-COM-005, CU-EVT-001, CU-EVT-003); documentación de flujo principal, flujos alternativos y excepciones. — **Modificado:** 14 / 05 / 2026
  - **Commit relacionado:** `60b0df5` — (docs): Actualizacion de BPMNs.md para reflejar el estado actual de los BPMNs y sus flujos descritos (PSD-22, issue #72)

---

## 1 – 7 de mayo de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 24 – 30 de abril de 2026

Corrección integral de contradicciones documentales, alineación del glosario, renombramiento y ampliación de CU-COM-003, corrección de trazabilidad en múltiples CUs y RFs de los dominios COM y EVT, eliminación de RF-EVT-05 por redundancia, creación de CU-COM-006 y normalización de metadatos tras el cambio.

- CU-COM-003 tenía nombre y función mal definidos:  
  El archivo se llamaba "Presentación de eventos disponibles" sin reflejar que su responsabilidad real es la gestión de bancos de contexto. Carecía del flujo de escritura para reserva temporal, liberación y bloqueo de cupos requerido por RF-EVT-02 y RF-EVT-04, y los CUs que dependían de esas operaciones no tenían a dónde delegar.  
  **Decisiones:**
  - [X] [`CU-COM-003 Gestion de bancos de contexto.md`](</docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md>) — Renombrado y reescrito: se actualiza el nombre, se agrega el flujo de actualización del banco de contexto de evento (reserva temporal, liberación y bloqueo de cupo), la excepción E4 con rollback, la regla RN-COM-03-06 y se separan entradas/salidas en secciones de lectura y escritura. — **Modificado:** 29 / 04 / 2026
  - [X] `CU-COM-003 Presentación de eventos disponibles.md` — Eliminado al ser renombrado al archivo correcto. — **Eliminado:** 29 / 04 / 2026

- El glosario contenía información fantasma, señales inexistentes y terminología inconsistente:  
  Definiciones.md incluía contenido no respaldado por ningún CU, cuatro señales de transición que no existían en ningún flujo, y usaba "puntaje" donde el sistema normalizado usa "calificación".  
  **Decisiones:**
  - [X] [`Definiciones.md`](</docs/diseño/glosario/Definiciones.md>) — Se elimina contenido fantasma; se remueven las cuatro señales inexistentes; se normaliza "puntaje" a "calificación"; se corrige la definición de Reserva temporal; se redefine Exploit del bot; se agrega la definición de Cartera de clientes y la candidatura de notificaciones de reactivación. — **Modificado:** 29 / 04 / 2026

- Errores de referencias, trazabilidad y flujos en los CUs del dominio COM:  
  CU-COM-001 no tenía los 4 flujos diferenciados por etapa comercial. CU-COM-002 no delegaba reserva/liberación de cupo a CU-COM-003 ni invocaba CU-COM-001 en el escalamiento. CU-COM-004 tenía nombre de archivo incorrecto en sus referencias. CU-COM-005 repetía pasos en A3 y tenía señales en la sección incorrecta.  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Se reorganizan 4 flujos independientes por etapa comercial (Lead, MQL, Prospecto, SQL); se añade nota de escalamiento automático en SQL. — **Modificado:** 29 / 04 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Paso 12 delega reserva a CU-COM-003; paso A1-4 delega liberación a CU-COM-003; paso 15 invoca CU-COM-001; se añade RF-COM-02 en RF relacionados. — **Modificado:** 29 / 04 / 2026
  - [X] [`CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md`](</docs/diseño/casos de uso/COM/CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md>) — Renombrado desde "Gestión de consentimiento de privacidad"; referencias a RF-COM-07 convertidas al formato de enlace. — **Modificado:** 29 / 04 / 2026
  - [X] `CU-COM-004 Gestión de consentimiento de privacidad.md` — Eliminado al ser renombrado al archivo correcto. — **Eliminado:** 29 / 04 / 2026
  - [X] [`CU-COM-005 Calificación automática y gestión de etapa comercial.md`](</docs/diseño/casos de uso/COM/CU-COM-005 Calificación automática y gestión de etapa comercial.md>) — Se consolidan pasos de A3; se mueve `exploit_reincidente` a Salidas; se elimina postcondición redundante. — **Modificado:** 29 / 04 / 2026

- Errores en CU-EVT-001 y pendientes de sesión anterior:  
  El criterio de orden de la lista de espera no coincidía con el glosario, faltaba el flujo alterno para clientes sin etapa Prospecto, y los RF relacionados no usaban formato de enlace.  
  **Decisiones:**
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Se corrige criterio de orden (calificación primaria, FIFO como desempate); se añade flujo alterno A2; se añade RF-COM-02 en RF relacionados; se convierten RF al formato de enlace. — **Modificado:** 29 / 04 / 2026

- Ausencia de mecanismo de notificación proactiva y desuscripción para la cartera de clientes:  
  No existía ningún caso de uso que cubriera la reactivación de clientes potenciales mediante notificaciones outbound ni un mecanismo de desuscripción, representando un vacío funcional en la gestión de la cartera.  
  **Decisiones:**
  - [X] [`CU-COM-006 Gestión de notificaciones de reactivación.md`](</docs/diseño/casos de uso/COM/CU-COM-006 Gestión de notificaciones de reactivación.md>) — Creado con tres flujos principales (reapertura de evento, evento relacionado, desuscripción), flujos alternos, excepciones y 6 reglas de negocio que cubren elegibilidad, anti-spam y restricción de escrituras. — **Creado:** 29 / 04 / 2026

- Etapas comerciales incorrectas y triggers mal definidos en RFs del dominio EVT:  
  RF-EVT-01 no acotaba los momentos del proceso comercial en que se valida el cupo. RF-EVT-02 establecía la reserva en etapa SQL cuando ocurre al transicionar de MQL a Prospecto. RF-EVT-04 tenía tres políticas alternativas ambiguas sin indicar cuál aplicaba.  
  **Decisiones:**
  - [X] [`RF-EVT-01 Verificacion de disponibilidad de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01 Verificacion de disponibilidad de cupo.md>) — Se acota la validación a dos momentos explícitos: consulta inicial del evento y transición a Prospecto. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-EVT-02 Reservacion de vacante durante proceso de venta.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-02 Reservacion de vacante durante proceso de venta.md>) — Se corrige la etapa de activación de SQL a MQL; se precisa confirmación por operador en SQL; se especifica tiempo de tolerancia configurable. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md>) — Se eliminan las tres políticas A/B/C; se establece una única regla de confirmación por operador en SQL; se definen tres causas excepcionales de liberación. — **Modificado:** 29 / 04 / 2026

- Criterio de ordenamiento inconsistente en lista de espera y notificaciones:  
  RF-EVT-03 y RF-EVT-07 usaban FIFO como criterio principal, inconsistente con la política del glosario y CU-EVT-001 que define calificación como criterio primario y FIFO solo como desempate.  
  **Decisiones:**
  - [X] [`RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md>) — Se sustituye FIFO por calificación+FIFO; se añade regla N notificaciones por N vacantes y seguimiento de respuesta. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-EVT-07 Gestion de lista de espera.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de lista de espera.md>) — Se reemplaza FIFO por calificación como criterio primario; se añade verificación de existencia de lista de espera; se elimina "reserva temporal prioritaria" sin respaldo. — **Modificado:** 29 / 04 / 2026

- RF-EVT-05 redundante tras absorción por RF-EVT-04 y RF-EVT-03:  
  Los escenarios de cancelación de inscripciones confirmadas y liberación de vacante quedaron completamente cubiertos por RF-EVT-04 (causas excepcionales de liberación) y RF-EVT-03 (notificación tras liberación), sin pérdida de cobertura funcional.  
  **Decisiones:**
  - [X] `RF-EVT-05 Gestion de cancelacion inscripciones.md` — Eliminado por redundancia; su cobertura queda absorbida por RF-EVT-04 y RF-EVT-03. — **Eliminado:** 29 / 04 / 2026
  - [X] [`CU-EVT-002 Gestión de cancelación.md`](</docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md>) — Se sustituye referencia a RF-EVT-05 por RF-EVT-04; se reemplaza actor "Banco de contexto" por invocación a CU-COM-003; se normaliza "Persona interesada" a "Cliente potencial". — **Modificado:** 29 / 04 / 2026

- RF-EVT-06 con cobertura de bloqueos incompleta al superar umbral extemporáneo:  
  RF-EVT-06 solo bloqueaba nuevas inscripciones al superar el umbral, sin mencionar que el mismo umbral debe bloquear cancelaciones extemporáneas y solicitudes de reembolso.  
  **Decisiones:**
  - [X] [`RF-EVT-06 Gestion de inscripciones extemporaneas.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-05 Gestion de inscripciones extemporaneas.md>) — Se añade bloqueo de cancelaciones y reembolsos al superar el umbral; se precisan los clientes elegibles de lista de espera. — **Modificado:** 29 / 04 / 2026

- Criterios de calificación incorrectos en RF-COM-02 y modelo de consentimiento incorrecto en RF-COM-07:  
  RF-COM-02 evaluaba cuatro criterios (interés, presupuesto, disponibilidad, urgencia) cuando el sistema solo mide nivel de interés. RF-COM-07 requería consentimiento explícito con botones, inconsistente con el modelo tácito adoptado en CU-COM-004.  
  **Decisiones:**
  - [X] [`RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md>) — Se sustituyen los cuatro criterios por el único correcto (nivel de interés por tiempo de respuesta e interacción); se precisa uso de la calificación para prioridad en lista de espera. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-COM-07 Informe de privacidad al usuario.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md>) — Se reemplaza el modelo de consentimiento explícito por consentimiento tácito; se elimina criterio de bloqueo por rechazo; se actualiza la historia de usuario. — **Modificado:** 29 / 04 / 2026

- Inconsistencia de formato estructural en RFs del dominio COM:  
  RF-COM-01, 03, 04, 05 y 06 usaban texto plano o negrita para secciones que debían ser encabezados `##`, y los criterios de aceptación no usaban el formato `[ ]`.  
  **Decisiones:**
  - [X] [`RF-COM-01 Asignación de conversaciones de un canal de comunicación a Bot.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-01 Asignación de conversaciones de un canal de comunicación a Bot.md>) — Normalización de encabezados y criterios de aceptación al formato `[ ]`. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-COM-03 Captura y gestión de datos de la persona interesada desde conversaciones multicanal.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-03 Captura y gestión de datos de la persona interesada desde conversaciones multicanal.md>) — Normalización de encabezados y criterios de aceptación al formato `[ ]`. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-COM-04 El Bot debe mostrar el listado de eventos disponibles.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-04 El Bot debe mostrar el listado de eventos disponibles.md>) — Normalización de encabezados y criterios de aceptación al formato `[ ]`. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-COM-05 El Bot debe proporcionar información detallada de cada evento.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-05 El Bot debe proporcionar información detallada de cada evento.md>) — Normalización de encabezados y criterios de aceptación al formato `[ ]`. — **Modificado:** 29 / 04 / 2026
  - [X] [`RF-COM-06 El Bot debe informar fechas de inicio y horarios disponibles.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-06 El Bot debe informar fechas de inicio y horarios disponibles.md>) — Normalización de encabezados y criterios de aceptación al formato `[ ]`. — **Modificado:** 29 / 04 / 2026

- Metadatos desactualizados y normalización de IDs de RFs en CUs tras eliminación de RF-EVT-05:  
  Tras la eliminación de RF-EVT-05, los IDs de los RFs posteriores quedaron desalineados en los metadatos de varios CUs. Adicionalmente, las referencias de issue y PR en CU-COM-006 no estaban en el formato correcto.  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Corrección de metadatos y normalización de IDs. — **Modificado:** 30 / 04 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Corrección de metadatos y normalización de IDs. — **Modificado:** 30 / 04 / 2026
  - [X] [`CU-COM-003 Gestion de bancos de contexto.md`](</docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md>) — Corrección de metadatos y normalización de IDs. — **Modificado:** 30 / 04 / 2026
  - [X] [`CU-COM-006 Gestión de notificaciones de reactivación.md`](</docs/diseño/casos de uso/COM/CU-COM-006 Gestión de notificaciones de reactivación.md>) — Corrección de referencias a issue y PR al formato correcto. — **Modificado:** 30 / 04 / 2026
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Corrección de metadatos y normalización de IDs. — **Modificado:** 30 / 04 / 2026
  - [X] [`CU-EVT-003 Sistema de inscripción.md`](</docs/diseño/casos de uso/EVT/CU-EVT-003 Sistema de inscripción.md>) — Corrección de metadatos y normalización de IDs. — **Modificado:** 30 / 04 / 2026

---

## 17 – 23 de abril de 2026

Corrección de escenarios de uso, definiciones del glosario y alineación de criterios de calificación y ordenamiento en artefactos del dominio COM y EVT.

- CU-COM-005, CU-EVT-001, RF-COM-02, RF-EVT-03 y RF-EVT-07 tenían criterios y escenarios desalineados entre sí:  
  Los escenarios de uso de calificación de lead y gestión de lista de espera presentaban inconsistencias entre el glosario, los casos de uso y los requerimientos funcionales en cuanto al criterio de calificación y el criterio de ordenamiento de la lista de espera.  
  **Decisiones:**
  - [X] [`CU-COM-005 Calificación automática y gestión de etapa comercial.md`](</docs/diseño/casos de uso/COM/CU-COM-005 Calificación automática y gestión de etapa comercial.md>) — Actualización de escenarios de uso conforme al modelo de calificación corregido. — **Modificado:** 23 / 04 / 2026
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Actualización de escenarios de uso conforme al criterio de ordenamiento (calificación primaria, FIFO desempate). — **Modificado:** 23 / 04 / 2026
  - [X] [`Definiciones.md`](</docs/diseño/glosario/Definiciones.md>) — Actualización de definiciones de calificación de lead y gestión de lista de espera para alinear con criterios correctos. — **Modificado:** 23 / 04 / 2026
  - [X] [`RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md>) — Ajuste preliminar de criterios de calificación. — **Modificado:** 23 / 04 / 2026
  - [X] [`RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md>) — Ajuste del criterio de ordenamiento para notificaciones. — **Modificado:** 23 / 04 / 2026
  - [X] [`RF-EVT-07 Gestion de lista de espera.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de lista de espera.md>) — Ajuste del criterio de ordenamiento de la lista de espera. — **Modificado:** 23 / 04 / 2026

---

## 10 – 16 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 3 – 9 de abril de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 27 de marzo – 2 de abril de 2026

Reorganización de casos de uso y requerimientos funcionales por dominio, alineación de trazabilidad de inscripción y corrección de nombres de archivo.

- Los CUs y RFs no estaban organizados por dominio y tenían rutas y nombres inconsistentes:  
  Los casos de uso de COM y EVT estaban mezclados en carpetas por RF en lugar de por dominio. Los nombres de archivo de CU-COM-001 tenían un error tipográfico. La plantilla de CU estaba duplicada en varias carpetas.  
  **Decisiones:**
  - [X] [`CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`](</docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md>) — Corrección del nombre de archivo (eliminación del espacio faltante entre "CU-COM-001" y el título). — **Modificado:** 29 / 03 / 2026
  - [X] [`CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md`](</docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md>) — Alineación con comentarios canónicos de revisión. — **Modificado:** 29 / 03 / 2026
  - [X] [`CU-EVT-001 Registro en lista de espera.md`](</docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md>) — Alineación con comentarios canónicos de revisión. — **Modificado:** 29 / 03 / 2026
  - [X] [`CU-EVT-002 Gestión de cancelación.md`](</docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md>) — Alineación con comentarios canónicos de revisión. — **Modificado:** 29 / 03 / 2026
  - [X] [`CU-Plantilla.md`](</docs/diseño/casos de uso/CU-Plantilla.md>) — Plantilla consolidada en la carpeta raíz de CU; eliminadas las copias duplicadas en subcarpetas. — **Modificado:** 29 / 03 / 2026
  - [X] [`DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md`](</docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md>) — Corrección del nombre del archivo (eliminación de error tipográfico en el prefijo). — **Modificado:** 29 / 03 / 2026

  Todos los CUs y RFs de los dominios COM y EVT fueron reorganizados a sus rutas por dominio (`casos de uso/COM/`, `casos de uso/EVT/`, `requerimientos/funcionales/COM/`, `requerimientos/funcionales/EVT/`) y se alineó la trazabilidad de inscripción entre ellos. — **Modificados:** 29 / 03 / 2026

---

## 20 – 26 de marzo de 2026

Sin cambios en artefactos de diseño durante este periodo.

---

## 13 – 19 de marzo de 2026

Reestructuración de rutas de los requerimientos funcionales para separar funcionales de no funcionales.

- Los RFs estaban en una ruta plana que no permitía agregar requerimientos no funcionales de forma ordenada:  
  Todos los requerimientos funcionales estaban en `requerimientos funcionales/RF-COM/` y `requerimientos funcionales/RF-EVT/` sin separación por tipo. Se reestructuró la ruta para anticipar la incorporación de RNFs.  
  **Decisiones:**
  - [X] Todos los RFs del dominio COM (`RF-COM-01` a `RF-COM-07`) y del dominio EVT (`RF-EVT-01` a `RF-EVT-07`) — Movidos a la nueva ruta `requerimientos/funcionales/COM/` y `requerimientos/funcionales/EVT/` respectivamente. — **Modificados:** 17 / 03 / 2026

---

## 6 – 12 de marzo de 2026

Creación del DDR de análisis de impacto de RF-COM-02 y actualización del glosario con notas de comportamiento.

- No existía análisis documentado del impacto de RF-COM-02 sobre el resto del sistema:  
  RF-COM-02 define la calificación automática y la gestión de etapa comercial, pero su impacto sobre los demás RFs y CUs del dominio COM y EVT no estaba analizado ni documentado, generando ambigüedades en los flujos dependientes.  
  **Decisiones:**
  - [X] [`DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md`](</docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md>) — Creado con el análisis de impacto de RF-COM-02 sobre sus dependencias en los dominios COM y EVT. — **Creado:** 11 / 03 / 2026
  - [X] [`Definiciones.md`](</docs/diseño/glosario/Definiciones.md>) — Actualizado con notas temporales para definir correctamente momentos y comportamientos confusos identificados durante el análisis. — **Modificado:** 11 / 03 / 2026

---

## 27 de febrero – 5 de marzo de 2026

Creación de los requerimientos funcionales del dominio EVT, el glosario base del sistema y RF-COM-07.

- El sistema no contaba con requerimientos funcionales del dominio EVT ni con glosario base:  
  Era necesario establecer la base documental del dominio EVT para poder construir los casos de uso y el modelo de diseño. Se crearon los 7 RF del dominio EVT junto con el glosario inicial de definiciones del sistema.  
  **Decisiones:**
  - [X] [`RF-EVT-01 Verificacion de disponibilidad de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01 Verificacion de disponibilidad de cupo.md>) — Creado para especificar la verificación de disponibilidad de cupos. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-02 Reservacion de vacante durante proceso de venta.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-02 Reservacion de vacante durante proceso de venta.md>) — Creado para especificar la reserva temporal de vacantes durante el proceso comercial. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md>) — Creado para especificar el mecanismo de notificación al liberar un cupo. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md>) — Creado para especificar el bloqueo de vacantes tras confirmación de pago. — **Creado:** 02 / 03 / 2026
  - [X] `RF-EVT-05 Gestion de cancelacion inscripciones.md` — Creado para especificar la gestión de cancelación de inscripciones (posteriormente eliminado por redundancia en abril). — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-06 Gestion de inscripciones extemporaneas.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-05 Gestion de inscripciones extemporaneas.md>) — Creado para especificar el control de inscripciones fuera de plazo. — **Creado:** 02 / 03 / 2026
  - [X] [`RF-EVT-07 Gestion de lista de espera.md`](</docs/diseño/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de lista de espera.md>) — Creado para especificar la gestión de la lista de espera de cupos. — **Creado:** 02 / 03 / 2026
  - [X] [`Definiciones.md`](</docs/diseño/glosario/Definiciones.md>) — Creado como glosario base del sistema con las definiciones iniciales del dominio. — **Creado:** 02 / 03 / 2026

- El dominio COM carecía del requerimiento de privacidad y aviso legal al usuario:  
  No existía ningún RF que especificara la obligación del sistema de informar al usuario sobre el aviso de privacidad y los términos y condiciones antes de recopilar datos.  
  **Decisiones:**
  - [X] [`RF-COM-07 Informe de privacidad al usuario.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md>) — Creado para especificar la presentación del aviso de privacidad y TyCs al usuario al inicio de la conversación. — **Creado:** 05 / 03 / 2026
