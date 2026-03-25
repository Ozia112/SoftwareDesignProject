# DDR-01 Alineacion de RF-COM-02 como núcleo comercial y separación de estados comerciales vs operativos

## Metadatos

- ID: DDR-01
- Título: Alineación de RF-COM-02 como núcleo comercial y separación de estados comerciales vs operativos
- Estado: Propuesto
- Fecha: 2026-03-09
- Responsable: Equipo de diseño
- Issue relacionado: PSD-06
- PR relacionado: Pendiente

## Contexto

[RF-COM-02](DDR-01impacto-de-rf-com-02-en-los-casos-de-uso.md) fue definido como el requerimiento funcional central del sistema comercial del bot. El requerimiento intenta cubrir en un mismo artefacto: evolucion de etapas comerciales de la persona interesada dentro del embudo comercial, calificación automatica para priorizacion y efectos derivados sobre la atencion humana y operaciones de inscripción.

El analisis de la documentacion indica que en estos momentos varios RFs ya dependen de RF-COM-02, en especial:

- RF-EVT-01,
- RF-EVT-02,
- RF-EVT-04 y
- RF-EVT-07. Tambien existe una tension directa con
- RF-COM-07, porque el glosario ubica la exigencia de privacidad al llegar a MQL, mientras ese RF la exige al inicio de toda conversación.

Como antecedente de intención de diseño, la reunión resumida en [rsm-05-03-alineacion-requerimientos-y-diagramas](/docs/meetings/resumenes/rsm-05-03-alineacion-requerimientos-y-diagramas.md) y su transcripción en [trs-05-03-alineacion-requerimientos-y-diagramas](/docs/meetings/transcripciones/trs-05-03-alineacion-requerimientos-y-diagramas.md) confirman que RF-COM-02 fue convertido en el núcleo del sistema y hace falta un artefacto que ordene como se relacionan los demas RF alrededor de ese núcleo.

## Problema

El proyecto tiene una inconsistencia estructural en los RF actuales, estos no separan de forma estricta tres conceptos que deben modelarse por separado.

- La etapa comercial describe el avance observable de una persona interesada dentro del proceso comercial.
- La calificación describe una medicion automatica para priorizar atención y ordenar ciertos mecanismos operativos, como la lista de espera.
- El estado operativo describe la situacion de una vacante, una reserva o una inscrpcion dentro de un evento.

La mezcla de esos conceptos produce conflictos concretos.

- En RF-COM-02 se afirma que la calificacion puede influir en la actualizacion de la etapa comercial, lo caul contradice la regla de negocio que debe regir este analisis: la etapa comercial influye en la calificación, pero la calificación no modifica la etapa.
- En el gloasrio, Cierre aparece como una etapa con resultado Ganado o Perdido, mientras RF-COM-02 y RF-EVT-04 lo usan como si Cierre Ganado y Cierre Perdido fueran etapas independientes.
- En RF-COM-07 el consentimiento se pide al inicio del chat, pero el glosario vincula la oblicacion de privacidad a la llegada a MQL antes de atención por bot u operador humano.
- En RF-EVT-03 y RF-EVT-07 la lista de espera se ordena por FIFO por defecto, pero el glosario indica que la lsita de espera debe basarse en las calificaciones de los interesados.
- En RF-EVT-05 se propone actualizar la etapa comercial a Cancelado o Cierre Perdido tras una cancelación de inscripción, pero eso mezcla una cancelación operativa posterior al cierre con una etapa comercial previa a la conversión.
- En RF-COM-04, RF-COM-05 y RF-COM-06 se usan terminos de usuario genérico y se describen consultas informativas sin aclarar cómo esas acciones alimentan la medición comercial de RF-COM-02.

## Artefactos impactados

- RF-COM-02
- RF-COM-04
- RF-COM-05
- RF-COM-06
- RF-COM-07
- RF-EVT-01
- RF-EVT-02
- RF-EVT-03
- RF-EVT-04
- RF-EVT-05
- RF-EVT-06
- RF-EVT-07
- Casos de uso comerciale y de inccripción
- BPMN comercial y BPMN de incripción/cupo
- Matriz de trazabilidad

## Alternativas consideradas

### Alternativa 1

Mantener RF-COM-02 como está y ajustar solo redaccion menor en RF-EVT.

**Ventajas**:

- Requiere menos retrabajo inmediato.
- Mantiene intacta la estructura actual de la documentación.

**Desventajas**:

- Conserva ambiguedades entre etapa comercial, calificación y estado operativo.
- Puede dejar sin resolver la contradiccion entre glosario, RF-COM-02 y RF-COM-07.
- Permite que RF-EVT siga inventando estados comerciales no definidos por el dominio.

### Alternativa 2

Reescribir RF-COM-02 como requerimiento rector del proceso comercial, separar explicitamente calificación y estados operativos, alinear los RF-EVT y RF-COM dependientes.

**Ventajas**:

- Elimina la causa raiz de las inconsistencias.
- Mejora la trazabilidad y casos de uso sin mezclar ietidades.
- Reduce retrabajo futuro en RF, reglas de negocio y diagramas.

**Desventajas**:

- Exige revisión coordinada de varios RF en la misma iteración.
- Obliga a precisar una politica dependiente para la confirmacion de vacantes.
- Puede requerir ajuste del glosario en una nota puntual para quedar completamente consistente con la regla de negocio adoptada.

## Criterios de decisión

- Consistencia con RF
- Simplicidad de implementación documental
- Trazabilidad
- Impacto en BPMN
- Claridad para el equipo
- Riesgo de retrabajo

## Decisión tomada

Se recomienda adoptar la Alternativa 2. RF-COM-02 debe quedar como el requerimiento rectos del proceso comercial y debe redefinirse con una separacion estricta entre etapa comercial, calificación y estados operativos del evento o de la inscripción.

## Justificación

La decisión se justifica porque corrige el problema en la raíz. El núcleo del conflicto no está en los RF de eventos por separado, sino en que RF-COM-02 no define con suficiente precisión qué es una etapa, que es una calificación y qué pertenece al evento.

La validación terminologica por RF confirma este diagnostico.

- RF-COM-02 usa correctamente la idea de historial y unicidad de etapa activa, pero falla al afirmar que la calificación puede actualizar la etapa y al presentar Cierre Ganado o pérdidas especificas como si fueran etapas simples.
- RF-COM-04, RF-COM-05 y RF-COM-06 describen consultas sobre Evento y usan leguaje funcionalmente valido, pero deberian hablar de persona interesada en lugar de usuario genérico y aclarar que esas interacciones son insumos observables del proceso comercial, no etapas por si mismas.
- RF-COM-07 contradice la ubicacion normativa del consentimiento al exigirlo el inciio de toda conversacion. Esa redaccion puede impedir los flujos informativos iniciales de RF-COM-04 a RF-COM-06 y debe moverse al punto de identificación comercial real.
- RF-EVT-01 describe un proceso del Evento y de cupos, no una transición comercial. La validacón de cupo puede bloquear inscripcion o pago, pero no debe redefinir por si misma la etapa comercial.
- RF-EVT-02 regula una reserva temporal de vacante. Su dependencia con SQL es correcta como prerrequisito, pero la reserva pertenece al evento y no debe alterar la etapa por si sola.
- RF-EVT-03 identifica elegibilidad y notificación, pero su criterio FIFO entra en conflicto con el glosario. El criterio correcto es orden por calificación y desempate cronológico.
- RF-EVT-04 mezcal muy bien estados operativos de vacante, pero al llevar a Cierre Ganado como etiqueta simple continúa la confusión entre etapa y resultado de cierre.
- RF-EVT-05 describe una cancelción sobre inscripción confirmada, que es operativa. Por eso es incorrecto proponer Cancelado o Cierre Perdido como nuevas etapas comerciales automáticas.
- RF-EVT-06 tiene una mejor delimitación, regula la posibilidad de inscribirse en un evento en curso según avance. Su impacto con RF-COM02 es de compuerta operativa y no entre en cambios de etapa comercial.
- RF-EVT-07 queda en conflicto directo con el glosario al usar FIFO por defecto. Debe registrar etapa comercial actual como dato contextual, pero ordenar por calificación.

## Consecuencias

### Positivas

- El modelo documental separará correctamente Persona Interesada y Evento, en terminos de etapas comerciales, calificación y estados operativos.
- RF-COM-02 pasa a ser realmente el nucleo rector del sistema.
- Los RF-EVT quedan como restricciones u operaciones derivadas sobre cupo, reserva, inscripción y lista de espera.
- La trazabilidad hacia BPMN y casos de uso mejora de forma inmediata.
- Se evita introducir etapas comerciales no definicids cada que apaezca un caso operativo nuevo.

### Negativas / costos

- Se requiere retrabajo coordinado en varios documentos ya creados.
- Algunas historias de usuario deberán reescribirse para respetar la entidad dueña del proceso.
- Será necesario agregar uno o mas artefactos que definan de manera estricta politicas de confirmación y cancelación de vacantes.

### Riesgos

- Si no se corrige el glosario o no se alcara la nota sobre la relacion entre calificacion y etapa la ambieguedad volverá a aparecer mas adelante.
- Si RF-EVT-04 no ajusta su politica unica de confirmacion, el BPMN de incripción seguirá siendo inestable.
- Si RF-COM-07 no precisa el momento de consentimiento de manera justificada, la frontera entre exploracion informativa y atención comercial seguira siendo confusa e insegura.

## Acciones derivadas

- [ ] Actualizar RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md para separar etapa, resultado de cierre, calificación y prioridad.
- [ ] Ajustar Definiciones.md en la nota de calificación para que no contradiga la regla adoptada o, al menos, para que especifique que la influencia es sobre priorización operativa y no sobre transición directa de etapa.
- [ ] Corregir RF-COM-07 Informe de privacidad al usuario.md para ubicar el consentimiento en el punto correcto del proceso comercial.
- [ ] Ajustar RF-EVT-01 Verificacion de disponibilidad de cupo.md para dejar claro que el cupo bloquea inscripción o pago, no define etapa.
- [ ] Ajustar RF-EVT-02 Reservacion de vacante durante proceso de venta.md para separar prerequisito comercial de efecto operativo.
- [ ] Ajustar RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md para ordenar elegibles por calificación y desempate cronológico.
- [ ] Ajustar RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md para usar etapa Cierre con resultado Ganado y no una etapa inventada.
- [ ] Ajustar RF-EVT-05 Gestion de cancelacion inscripciones.md para modelar Cancelada como estado operativo de inscripción y no como etapa comercial.
- [ ] Ajustar RF-EVT-07 Gestion de lista de espera.md para que la lista se base en calificación y no en FIFO como criterio principal.
- [ ] Crear o ajustar casos de uso para captación, calificación, consulta de eventos, inscripción, reserva, confirmación, cancelación y lista de espera.
- [ ] Actualizar BPMN comercial y BPMN de inscripción/cupo con carriles separados para Persona interesada, Sistema bot, Operador y Evento.
- [ ] Actualizar la matriz de trazabilidad con separación explícita entre RF comerciales, RF operativos de evento y RF puente.
- [ ] Abrir un artefacto de regla de negocio o un DDR adicional para fijar la política única de confirmación de vacante en RF-EVT-04.

## Trazabilidad

- RF relacionados: RF-COM-02, RF-COM-04, RF-COM-05, RF-COM-06, RF-COM-07, RF-EVT-01, RF-EVT-02, RF-EVT-03, RF-EVT-04, RF-EVT-05, RF-EVT-06, RF-EVT-07
- CU relacionados: Captación de persona interesada, Consulta de eventos, Calificación automática, Gestión de privacidad y consentimiento, Reserva temporal de vacante, Confirmación de inscripción, Cancelación de inscripción, Gestión de lista de espera, Notificación por liberación de cupo
- BPMN relacionados: Flujo comercial principal, Flujo de inscripción y pago, Flujo de reserva y liberación de cupo, Flujo de lista de espera y notificación
- Issues relacionados: PSD-06
- DDR anterior o relacionado: No identificado

## Notas

La mayor ambigüedad residual está en una tensión normativa interna:

- el glosario actual contiene una nota que permite interpretar que la calificación influye en la actualización de la etapa, mientras la regla de negocio usada para este análisis establece lo contrario. Para que el modelo quede estable, esa tensión debe resolverse expresamente en la siguiente revisión documental.
