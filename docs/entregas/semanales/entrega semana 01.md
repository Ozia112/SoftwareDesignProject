# Entrega semanal 01

## Sprint evaluado

- Sprint: `[Sprint] sp-01 2026-03-06 a 2026-03-12 - Consolidar RF core, casos de uso COM/EVT y BPMN inicial (Issue #25)`
- Periodo de corte: 2026-03-06 a 2026-03-12
- Fuente de verificacion: estado de sub-issues (PSD-04 a PSD-11), PRs mergeados, archivos en `docs/`, y hallazgos de `DDR-01impacto-de-rf-com-02-en-los-casos-de-uso.md`.

## Actividades realizadas por integrante

### Metodologia de participacion

- Ponderacion usada para el porcentaje de participacion semanal:
  - 70% ejecucion documental: proporcion de lineas modificadas en commits del 2026-03-06 al 2026-03-12 sobre artefactos del Sprint (lineas agregadas + eliminadas en `docs/` y entregables relacionados).
  - 20% administracion del backlog: lineas reales de texto en los cuerpos de issues creados para el Sprint (`#24`, `#25`, `#26`, `#27`, `#28`, `#29`, `#30`, `#32`, `#33`), obtenidas con GitHub CLI.
  - 10% revision/integracion: puntos reales de revision e integracion obtenidos con GitHub CLI sobre PRs del periodo (`#31`, `#34`, `#35`, `#37`, `#38`), ponderando `APPROVED = 1.0`, `CHANGES_REQUESTED = 0.75`, `COMMENTED = 0.25`, `merge = 0.5` y `asignacion del PR = 0.25`.

- Resultado de trabajo documental puro por lineas cambiadas:
  - Isaac Alejandro Ortiz Zaldivar: 2002 lineas.
  - Maximiliano Carrillo Alvarado: 1201 lineas.
  - Diego Islas Merino: 120 lineas.

- Resultado de backlog/planeacion por lineas reales de issues:
  - Isaac Alejandro Ortiz Zaldivar: 340 lineas.
  - Maximiliano Carrillo Alvarado: 0 lineas.
  - Diego Islas Merino: 0 lineas.

- Resultado de revision/integracion por evidencia real en PRs:
  - Isaac Alejandro Ortiz Zaldivar: 6.25 puntos.
  - Maximiliano Carrillo Alvarado: 1.75 puntos.
  - Diego Islas Merino: 0.75 puntos.

- Resultado ponderado total de participacion semanal:
  - Isaac Alejandro Ortiz Zaldivar: 69.32%
  - Maximiliano Carrillo Alvarado: 27.30%
  - Diego Islas Merino: 3.38%

- Lectura del resultado:
  - Quien mas trabajo en escritura documental y cambios totales del periodo: Isaac Alejandro Ortiz Zaldivar.
  - Quien mas participacion total tuvo en el Sprint, considerando ejecucion + backlog + integracion: Isaac Alejandro Ortiz Zaldivar.
  - Quien menos participacion tuvo en el periodo medido: Diego Islas Merino.

### Isaac Alejandro Ortiz Zaldivar (Ozia112)

- Lidero el ajuste operativo del repositorio y trazabilidad semanal.
- Trabajo en el analisis de impacto de RF-COM-02 sobre RF COM/RF EVT (DDR-01).
- Redacto el Sprint y los sub-issues PSD de la semana, concentrando la administracion del backlog.
- Integro el artefacto BPMN en `develop` mediante PR #39, aunque el issue #30 sigue abierto administrativamente.

Participacion ponderada exacta: 69.32%

Desglose relevante:

- Ejecucion documental: 2002 lineas modificadas en commits/diffs del periodo.
- Backlog/planeacion: 340 lineas reales en cuerpos de issues del Sprint, todas creadas por su cuenta.
- Revision/integracion: 6.25 puntos reales en PRs del periodo, sustentados por comentarios, aprobaciones, merges y asignaciones detectadas por GitHub CLI.

Issues principales:

- #24 PSD-04 (CERRADO)
- #27 PSD-06 (CERRADO)
- #30 PSD-11 (ABIERTO, pero con entregable ya integrado en `develop`)

PRs relacionados detectados:

- PR #31 (mergeado, cierra #24)
- PR #37 (mergeado, cierra #27)
- PR #39 (mergeado, asociado a BPMNs y con `Closes #30` en el cuerpo del PR)

### Diego Islas Merino (diego-islas8)

- Consolido documentos base del RF core y privacidad en PR documental.
- Apoyo en consolidacion de RF-COM-02 y RF-COM-07.

Participacion ponderada exacta: 3.38%

Desglose relevante:

- Ejecucion documental: 120 lineas modificadas en commits/diffs del periodo.
- Backlog/planeacion: no se detectaron issues del Sprint creados por su cuenta.
- Revision/integracion: 0.75 puntos reales en PRs del periodo, derivados de 1 solicitud de cambios y del merge de su propio PR.

Issues principales:

- #26 PSD-05 (CERRADO)
- #29 PSD-07 (CERRADO)

PRs relacionados detectados:

- PR #34 (mergeado): crea/actualiza RF-COM-02 y RF-COM-07.
- Nota: no se encontro traza explicita `Closes #26` o `Closes #29` en el cuerpo del PR.

### Maximiliano Carrillo Alvarado (MaximilianoCarrilloAlvarado)

- Redacto casos de uso iniciales COM y EVT.
- Aporto RF-COM-01 y RF-COM-03.
- Dejo en borrador parte importante de los casos comprometidos.

Participacion ponderada exacta: 27.30%

Desglose relevante:

- Ejecucion documental: 1201 lineas modificadas en commits/diffs del periodo.
- Backlog/planeacion: no se detectaron issues del Sprint creados por su cuenta.
- Revision/integracion: 1.75 puntos reales en PRs del periodo, sustentados por 1 aprobacion, 1 merge y 1 asignacion de PR.

Issues principales:

- #28 PSD-10 (CERRADO)
- #33 PSD-09 (CERRADO)
- #32 PSD-08 (ABIERTO)

PRs relacionados detectados:

- PR #35 (mergeado): casos COM iniciales y RF-COM-01/03.
- PR #38 (mergeado): casos EVT iniciales.
- Nota: no se encontro traza explicita `Closes #28` o `Closes #33` en los cuerpos de PR.

## Issues trabajados y PRs relacionados (corte de cumplimiento)

### PSD-04 (Issue #24) - CERRADO

- Entregable esperado: actualizar `docs/pipeline-operativo.md` con Sprint/PSD/Weekly desacoplados.
- Verificacion: CUMPLIDO.
- Evidencia: `docs/pipeline-operativo.md` actualizado de forma amplia (Pipeline Operativo v2).
- PR relacionado: #31 (mergeado, cierre explicito de issue).

### PSD-05 (Issue #26) - CERRADO

- Entregable esperado: consolidar RF-COM-02 como core.
- Verificacion: PARCIAL.
- Evidencia: existe `RF-COM-02 ...md` con definicion central y criterios.
- Observacion de calidad: persiste contradiccion reportada en DDR (la calificacion aun "puede influir" en actualizacion de etapa).
- PR relacionado: #34 (mergeado, sin traza explicita de cierre de issue).

### PSD-06 (Issue #27) - CERRADO

- Entregable esperado: matriz de impacto RF-COM-02 vs RF COM / RF EVT.
- Verificacion: PARCIAL.
- Evidencia: se creo `docs/diseño/decisiones/DDR-01impacto-de-rf-com-02-en-los-casos-de-uso.md` y se actualizo glosario.
- Observacion de calidad: no se encontro matriz en formato estructurado (tabla de dependencia/tipo/severidad/decision) como pide el issue; se entrego analisis narrativo (DDR), util pero incompleto respecto al formato solicitado.
- PR relacionado: #37 (mergeado, cierra #27).

### PSD-07 (Issue #29) - CERRADO

- Entregable esperado: casos de uso de RF-COM-02 y RF-COM-07.
- Verificacion: NO CUMPLIDO.
- Evidencia: en `docs/diseño/casos de uso/RF-COM/` no existen CU dedicados a RF-COM-02 ni RF-COM-07.
- PR relacionado: no se encontro uno con trazabilidad explicita al alcance del issue.

### PSD-08 (Issue #32) - ABIERTO

- Entregable esperado: CUs RF-EVT-01, RF-EVT-02, RF-EVT-04, RF-EVT-06.
- Verificacion: NO CUMPLIDO AL CORTE.
- Evidencia: solo existen `CU-EVT-001-registro-en-lista-de-espera.md` y `CU-EVT-002-gestion-de-cancelacion.md`; no corresponden al paquete comprometido del issue.
- PR relacionado: no identificado como mergeado para este alcance.

### PSD-09 (Issue #33) - CERRADO

- Entregable esperado: CUs RF-EVT-03, RF-EVT-05 y RF-EVT-07.
- Verificacion: PARCIAL/INCONSISTENTE.
- Evidencia: se crearon 2 CUs EVT, pero no hay correspondencia 1:1 con el alcance (faltan artefactos nominales de EVT-03/05/07 y metadatos siguen con placeholders).
- PR relacionado: #38 (mergeado).

### PSD-10 (Issue #28) - CERRADO

- Entregable esperado: CUs de RF-COM-01 y RF-COM-03 a RF-COM-06 con formato homogeneo y completo.
- Verificacion: PARCIAL/INCONSISTENTE.
- Evidencia: existen 3 CUs COM, pero faltan CUs para cubrir todo el alcance solicitado (no se completan los 5 requeridos) y varios documentos quedaron en estado borrador con campos sin resolver (`PSD-XX`, `#XX`, `RN-XX`, etc.).
- PR relacionado: #35 (mergeado).

### PSD-11 (Issue #30) - ABIERTO

- Entregable esperado: BPMN comercial + BPMN gestion de cupo.
- Verificacion: PARCIALMENTE CUMPLIDO.
- Evidencia: existe `docs/diseño/modelos de diseño/BPMNs.md` ya integrado en `develop`, con descripcion de 3 procesos y enlace a diagramas en Miro.
- Observacion de calidad: el artefacto ya esta en la rama de integracion, pero el issue sigue abierto y el contenido local depende de un enlace externo para ver el detalle grafico.
- PR relacionado: #39 (mergeado, con `Closes #30` en el cuerpo).

## Avance del milestone (issue padre #25)

### Resultado cuantitativo

- Sub-issues cerrados: 6 de 8 (75%).
- Sub-issues abiertos: 2 de 8 (25%) -> #32 y #30.
- Sub-issues con entregable efectivamente integrado en `develop`: 7 de 8 (87.5%).

### Resultado cualitativo

- Avance operativo (pipeline y estructura de trabajo): ALTO.
- Avance de analisis (DDR y alineacion conceptual): MEDIO.
- Avance de artefactos finales comprometidos (CUs completos + BPMN integrado): MEDIO.

### Estado de criterios de cierre del Sprint #25

- Pipeline operativo nuevo integrado: SI.
- RF-COM-02 consolidado como core: PARCIAL.
- Matriz de impacto RF core vs COM/EVT: PARCIAL (se entrego DDR, no matriz formal).
- CUs RF-COM-02 y RF-COM-07 terminados: NO.
- CUs RF-EVT-01/02/04/06 terminados: NO.
- CUs RF-EVT-03/05/07 terminados: PARCIAL.
- CUs RF-COM-01 y RF-COM-03..06 terminados: PARCIAL.
- BPMN inicial comercial y cupo terminado: PARCIAL (integrado en `develop`, pero con issue abierto y dependencia de enlace externo).
- Estado del Project refleja resultado real: PARCIAL (hay issues cerrados con entregables incompletos).
- Reporte semanal listo para junta privada: SI (este documento).

## Que se trabajo y que no

### Que se trabajo

- Reorganizacion del pipeline de trabajo y trazabilidad semanal.
- Definicion documental del analisis de impacto (DDR-01).
- Redaccion inicial de varios CUs COM y EVT.
- Integracion inicial de BPMN con enlace a artefactos visuales.

### Que no se trabajo o no se termino

- Cierre completo de CUs comprometidos por PSD-07, PSD-08, PSD-09 y PSD-10.
- Cierre administrativo del issue PSD-11 y consolidacion local del detalle grafico del BPMN.
- Matriz formal de impacto con estructura pedida por PSD-06.
- Correccion total de contradicciones detectadas por DDR en RF-COM-02, RF-COM-07, RF-EVT-03, RF-EVT-05 y RF-EVT-07.

## Que se hizo bien

- Se mantuvo disciplina de trabajo por issues/ramas/PR.
- Se formalizo el pipeline operativo y el concepto de Sprint semanal.
- Se documento explicitamente el problema de consistencia mediante DDR.
- Se distribuyo trabajo entre los 3 integrantes y hubo evidencia de colaboracion real en PRs mergeados.

## Que se hizo mal

- Se cerraron issues con entregables aun en estado borrador o parcialmente incompletos.
- Trazabilidad issue-PR debil en varios PRs (sin `Closes #...` y sin checklist completado).
- Inconsistencia entre lo solicitado por issue y los archivos realmente entregados (especialmente en CUs EVT/COM).
- Calidad documental irregular: placeholders sin resolver, errores de nomenclatura (ej. CU-CUM/CU-COM, IDs), vacios en postcondiciones y reglas de negocio.
- Dependencia de enlaces externos para BPMN sin consolidacion local suficiente.

## Bloqueos y arrastre

### Bloqueos vigentes

- PSD-08 (#32) abierto: paquete de CUs EVT principal no terminado.
- PSD-11 (#30) abierto: el archivo BPMN ya esta integrado, pero el issue no refleja ese cierre y el entregable sigue dependiendo de enlace externo.
- Cierre de Sprint condicionado por artefactos no concluidos y por consistencia documental pendiente.

### Arrastre tecnico-documental desde DDR-01

Pendientes explicitamente arrastrados (no resueltos al corte o resueltos parcialmente):

- Separar formalmente etapa comercial vs calificacion vs estado operativo en RF-COM-02.
- Reubicar el momento de consentimiento de RF-COM-07 para evitar contradiccion con glosario/MQL.
- Corregir RF-EVT-03 y RF-EVT-07 para priorizar por calificacion (no FIFO por defecto).
- Ajustar RF-EVT-05 para evitar mezclar cancelacion operativa con etapas comerciales.
- Afinar RF-EVT-04 con politica unica de confirmacion y semantica de cierre consistente.
- Crear matriz de trazabilidad explicita por capas (RF comerciales, RF operativos, RF puente).
- Consolidar BPMN con carriles y transiciones coherentes con RF/CU corregidos.

### Arrastre adicional detectado en documentos revisados

- Casos de uso en estado Borrador con campos placeholders (`PSD-XX`, `#XX`, `RN-XX`, datos de entrada/salida genericos).
- Cobertura incompleta de CUs comprometidos por issue (faltantes de archivos y/o correspondencia de alcance).
- Inconsistencias de nomenclatura y calidad editorial (IDs, ortografia, congruencia entre titulo y contenido).
- Falta de correspondencia entre issue cerrado y evidencia suficiente de cumplimiento integral.

## Conclusiones y acciones a futuro

1. El Sprint tuvo buen avance de estructura y direccion (pipeline + DDR), pero no alcanzo cierre funcional/documental completo de artefactos clave.
2. El estado "cerrado" de varios sub-issues no refleja plenamente la completitud del entregable; se requiere recalibrar criterio de cierre a evidencia verificable.
3. El principal riesgo para la siguiente junta es presentar CUs y BPMN sin consistencia total con el DDR.

Acciones recomendadas para el siguiente ciclo:

1. Reabrir o crear PSD de remediacion para cubrir CUs faltantes por RF exacto (con checklist verificable por archivo).
2. Integrar formalmente el paquete BPMN a `develop` y dejar respaldo local del modelado, no solo enlace externo.
3. Emitir una matriz de impacto/trazabilidad en formato tabular para cerrar el pendiente metodologico de PSD-06.
4. Aplicar una pasada de calidad editorial y de consistencia semantica en RF/CU (nomenclatura, placeholders, reglas de negocio, trazabilidad).
5. Exigir en cada PR la trazabilidad minima (`Closes #issue`, checklist real y rutas exactas) para evitar cierres ambiguos.
