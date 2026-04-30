# Entrega semanal 08: 2026-04-24 a 2026-04-30

## A) Resumen operativo

- Repositorio: Ozia112/SoftwareDesignProject
- Rango evaluado: 2026-04-24 00:00:00 a 2026-04-30 23:59:59

### 1) Archivos creados con contenido por integrante

| Integrante | Archivos creados con contenido | Areas documentales relacionadas |
| --- | ---: | --- |
| Isaac Alejandro Ortiz Zaldivar | 3 | Casos de uso COM, Bitacoras |
| Maximiliano Carrillo Alvarado | 2 | Modelos de diseño, Bitacoras |
| Diego Islas Merino | 6 | Modelos de diseño, Bitacoras |

### 2) Participacion por integrante

| Integrante | Participacion total | Lineas docs | Lineas backlog | Puntos revision |
| --- | ---: | ---: | ---: | ---: |
| Isaac Alejandro Ortiz Zaldivar | 71.25% | 1529 | 299 | 1.75 |
| Maximiliano Carrillo Alvarado | 25.23% | 307 | 217 | 3.5 |
| Diego Islas Merino | 3.52% | 15 | 60 | 0.5 |

### 3) Participacion por area documental

| Area documental | Lineas cambiadas | Lider del area |
| --- | ---: | --- |
| Casos de uso COM | 868 | Isaac Alejandro Ortiz Zaldivar |
| Requerimientos funcionales EVT | 169 | Isaac Alejandro Ortiz Zaldivar |
| Glosario | 185 | Isaac Alejandro Ortiz Zaldivar |
| Casos de uso EVT | 126 | Isaac Alejandro Ortiz Zaldivar |
| Requerimientos funcionales COM | 97 | Isaac Alejandro Ortiz Zaldivar |
| Utils / Análisis de contradicciones | 76 | Isaac Alejandro Ortiz Zaldivar |
| Requerimientos no funcionales (RNF) | 307 | Maximiliano Carrillo Alvarado |
| Modelos de diseño | 15 | Diego Islas Merino |
| Decisiones de diseño | 2 | Isaac Alejandro Ortiz Zaldivar |

### 4) Hallazgos operativos

- Mayor volumen de escritura documental: Isaac Alejandro Ortiz Zaldivar.
- Mayor participacion total del periodo: Isaac Alejandro Ortiz Zaldivar.
- Menor participacion total del periodo: Diego Islas Merino.
- Frente documental de mayor carga: Casos de uso COM (868 lineas).

## B) Trazabilidad extendida

### Metodologia de participacion

- Ponderacion usada para el porcentaje de participacion semanal para el rango 2026-04-24 a 2026-04-30:
  - 70% ejecucion documental: lineas modificadas en commits/diffs del periodo, excluyendo docs/entregas/*.
  - 20% administracion del backlog: lineas reales de texto en bodies de issues creados en el periodo + lineas de docs/entregas/*.
  - 10% revision/integracion: puntos reales de revision e integracion en PRs creados en el periodo (APPROVED = 1.0, CHANGES_REQUESTED = 0.75, COMMENTED = 0.25, merge = 0.5, asignacion del PR = 0.25).
- Regla de respaldo: toda cifra del resumen operativo proviene de evidencia listada en esta seccion.
- Nota metodologica: los archivos de `docs/entregas/bitacoras/*` y `docs/entregas/semanales/*` producidos durante el periodo se contabilizan íntegramente en la categoría de backlog/planeacion, no en ejecucion documental, para evitar sesgo por auto-reporte. Los archivos binarios (PNG, SVG) generan 1 linea de diff cada uno en git y se incluyen en documental de modelos de diseño.
- Regla de fecha de conteo documental por PR: los commits cuya fecha de creación queda fuera del rango de la semana pero que pertenecen a un PR mergeado dentro del rango se contabilizan en ejecucion documental de la semana en que se hizo el merge. Aplica a PR #61 (Maximiliano: commits 96a3d544 del 2026-04-16 y 93ad9c55 del 2026-04-23, mergeado el 2026-04-30).
- Corrección por eliminaciones externas: las lineas eliminadas correspondientes a archivos cuyo contenido fue creado por otro integrante en periodos anteriores no se contabilizan como contribución documental del autor del commit. En este periodo se excluyen: 142 lineas (eliminacion de CU-COM-003 Presentación de eventos disponibles, de Maximiliano), 120 lineas (eliminacion de CU-COM-004 Gestión de consentimiento de privacidad, de Maximiliano) y 21 lineas (eliminacion de RF-EVT-05, contenido preexistente). Total excluido: 283 lineas. Los archivos nuevos que reemplazaron a los eliminados (CU-COM-003 Gestion de bancos de contexto: 223 lineas; CU-COM-004 Presentacion de avisos legales: 122 lineas) sí cuentan como contribucion de Isaac ya que representan documentos nuevos de distinta naturaleza.

### Fuentes consideradas (issues y PRs)

- Issues incluidos en el corte: 65.
- PRs incluidos en el corte: 61 (merge-date), 66, 67, 68, 71.

### Archivos creados por integrante

- Diego Islas Merino:
  - **Modelos de diseño** docs/diseño/modelos de diseño/diagrama-secuencia.md
  - **Modelos de diseño** docs/diseño/modelos de diseño/diagrama_de_colaboracion.svg
  - **Modelos de diseño** docs/diseño/modelos de diseño/diagrama_de_secuencia_1.svg
  - **Modelos de diseño** docs/diseño/modelos de diseño/diagrama_secuencia_2.svg
  - **Modelos de diseño** docs/diseño/modelos de diseño/diagrama_secuencia_3.svg
  - **Bitacoras** docs/entregas/bitacoras/diego-islas.md
- Isaac Alejandro Ortiz Zaldivar:
  - **Casos de uso COM** docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md
  - **Casos de uso COM** docs/diseño/casos de uso/COM/CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md
  - **Casos de uso COM** docs/diseño/casos de uso/COM/CU-COM-006 Gestión de notificaciones de reactivación.md
- Maximiliano Carrillo Alvarado:
  - **Requerimientos no funcionales** docs/diseño/requerimientos/no funcionales/RNF-01 Interacción entre los actores del sistema y la base de datos.md (PR #61)
  - **Requerimientos no funcionales** docs/diseño/requerimientos/no funcionales/RNF-02 Rendimiento del bot.md (PR #61)
  - **Requerimientos no funcionales** docs/diseño/requerimientos/no funcionales/RNF-03 Claridad de mensajes del bot.md (PR #61)
  - **Requerimientos no funcionales** docs/diseño/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md (PR #61)
  - **Requerimientos no funcionales** docs/diseño/requerimientos/no funcionales/RNF-05 Disponibilidad del sistema.md (PR #61)
  - **Modelos de diseño** docs/diseño/modelos de diseño/Diagrama de casos de uso.png
  - **Bitacoras** docs/entregas/bitacoras/carrillo-maximiliano.md

### Evidencia documental por area y archivo

- Isaac Alejandro Ortiz Zaldivar:
  - Area: Casos de uso COM -> 868 lineas (1130 bruto − 262 eliminaciones externas: 142 de CU-COM-003 anterior + 120 de CU-COM-004 anterior)
    - docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md: 223 (creado)
    - docs/diseño/casos de uso/COM/CU-COM-003 Presentación de eventos disponibles.md: 142 (eliminado)
    - docs/diseño/casos de uso/COM/CU-COM-004 Gestión de consentimiento de privacidad.md: 120 (eliminado)
    - docs/diseño/casos de uso/COM/CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md: 122 (creado)
    - docs/diseño/casos de uso/COM/CU-COM-006 Gestión de notificaciones de reactivación.md: 173 (creado)
    - docs/diseño/casos de uso/COM/CU-COM-005 Calificación automática y gestión de etapa comercial.md: 152
    - docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre persona interesada y el bot.md: 111
    - docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md: 61
    - (metadatos/normalización commit 7ef00ea): CU-COM-001 +4, CU-COM-002 +8, CU-COM-003 +10, CU-COM-006 +1
  - Area: Requerimientos funcionales EVT -> 169 lineas (190 bruto − 21 eliminacion de RF-EVT-05)
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md: 52
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md: 34
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-02 Reservacion de vacante durante proceso de venta.md: 22
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de inscripciones extemporaneas.md: 22
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-05 Gestion de cancelacion inscripciones.md: 21 (eliminado)
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01 Verificacion de disponibilidad de cupo.md: 18
    - docs/diseño/requerimientos/funcionales/EVT/RF-EVT-07 Gestion de lista de espera.md: 17
    - renombrados (solo diff de nombre, 2 lineas c/u): RF-EVT-06->RF-EVT-05, RF-EVT-07->RF-EVT-06
  - Area: Requerimientos funcionales COM -> 97 lineas
    - docs/diseño/requerimientos/funcionales/COM/RF-COM-03 Captura y gestión de datos de la persona interesada desde conversaciones multicanal.md: 22
    - docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md: 19
    - docs/diseño/requerimientos/funcionales/COM/RF-COM-04 El Bot debe mostrar el listado de eventos disponibles.md: 16
    - docs/diseño/requerimientos/funcionales/COM/RF-COM-05 El Bot debe proporcionar información detallada de cada evento.md: 14
    - docs/diseño/requerimientos/funcionales/COM/RF-COM-06 El Bot debe informar fechas de inicio y horarios disponibles.md: 14
    - docs/diseño/requerimientos/funcionales/COM/RF-COM-01 Asignación de conversaciones de un canal de comunicación a Bot.md: 12
  - Area: Glosario -> 185 lineas
    - docs/diseño/glosario/Definiciones.md: 185
  - Area: Casos de uso EVT -> 126 lineas
    - docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md: 72
    - docs/diseño/casos de uso/EVT/CU-EVT-003 Sistema de inscripción.md: 20 (metadatos)
    - docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md: 20
    - (metadatos commit 7ef00ea): CU-EVT-001 +20, CU-EVT-003 +14
  - Area: Utils / Análisis de contradicciones -> 76 lineas
    - utils/contradicciones-cus.md: 76 (creado)
  - Area: Decisiones de diseño -> 2 lineas
    - docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md: 2
  - Backlog (docs/entregas/*): 299 lineas
    - docs/entregas/bitacoras/ortiz-isaac.md: 82 (commit 5a7d3ea) + 204 (commit 0e4e455 reescritura)
    - issue #65: 13 lineas

- Maximiliano Carrillo Alvarado:
  - Area: Requerimientos no funcionales (RNF) -> 307 lineas (299 de commits pre-semana mergeados via PR #61 + 8 de commits dentro del rango)
    - PR #61 commit 96a3d544 (2026-04-16): RNF-01 +36, RNF-02 +27, RNF-03 +29, RNF-04 +25, RNF-XX +19 → 136 lineas
    - PR #61 commit 93ad9c55 (2026-04-23): RNF-01 +21/-23, RNF-02 +15/-14, RNF-03 +16/-16, RNF-04 +22/-12, RNF-05 +24/-0 → 163 lineas
    - docs/diseño/requerimientos/no funcionales/RNF-03 Claridad de mensajes del bot.md: 6 (3 commits de actualización dentro del rango)
    - docs/diseño/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md: 2 (dentro del rango)
  - Backlog (docs/entregas/*): 217 lineas
    - docs/entregas/bitacoras/carrillo-maximiliano.md: 45 (creado en commit 730475d)
    - docs/entregas/semanales/entrega semana 08.md: 172 (creado en commit 730475d)

- Diego Islas Merino:
  - Area: Modelos de diseño -> 15 lineas
    - docs/diseño/modelos de diseño/diagrama-secuencia.md: 11 (creado)
    - docs/diseño/modelos de diseño/diagrama_de_colaboracion.svg: 1 (binario, nuevo archivo)
    - docs/diseño/modelos de diseño/diagrama_de_secuencia_1.svg: 1 (binario, nuevo archivo)
    - docs/diseño/modelos de diseño/diagrama_secuencia_2.svg: 1 (binario, nuevo archivo)
    - docs/diseño/modelos de diseño/diagrama_secuencia_3.svg: 1 (binario, nuevo archivo)
  - Backlog (docs/entregas/*): 60 lineas
    - docs/entregas/bitacoras/diego-islas.md: 60 (creado en commit 6620b1f)

### Desglose por integrante

### Isaac Alejandro Ortiz Zaldivar

Participacion ponderada exacta: 82.39%

Desglose relevante:

- Ejecucion documental: 1529 lineas netas en commits/diffs del periodo (excl. docs/entregas/*, excl. 283 lineas de eliminaciones externas). Bruto git: 1812 lineas; deduccion: −142 CU-COM-003 anterior (Maximiliano) + −120 CU-COM-004 anterior (Maximiliano) + −21 RF-EVT-05 (contenido preexistente).
- Backlog/planeacion: 299 lineas, con 286 lineas provenientes de docs/entregas/* (bitacoras propias y reescritura de las tres), y 1 issue creado (13 lineas).
- Revision/integracion: 1.75 puntos reales en PRs del periodo (PR #67: 1 APPROVED + 0.25 asignado + 0.5 merge).
- Señales complementarias: 1 aprobaciones, 0 solicitudes de cambio, 0 comentarios, 1 merges, 1 PRs asignados, 1 issues asignados.

### Maximiliano Carrillo Alvarado

Participacion ponderada exacta: 25.23%

Desglose relevante:

- Ejecucion documental: 307 lineas (excl. docs/entregas/*). 299 lineas de PR #61 (commits del 2026-04-16 y 2026-04-23 mergeados el 2026-04-30: creacion de RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-XX) + 8 lineas de actualizaciones dentro del rango (RNF-03 +6, RNF-04 +2).
- Backlog/planeacion: 217 lineas, con 217 lineas provenientes de docs/entregas/* (bitacora personal + entrega semana 08), y 0 issues creados.
- Revision/integracion: 3.5 puntos reales en PRs del periodo (PR #66, #67: 1 APPROVED, 1 CHANGES_REQUESTED, 5 comentarios, 1 merge).
- Señales complementarias: 1 aprobaciones, 1 solicitudes de cambio, 5 comentarios, 1 merges, 0 PRs asignados, 0 issues asignados.

### Diego Islas Merino

Participacion ponderada exacta: 3.52%

Desglose relevante:

- Ejecucion documental: 15 lineas modificadas en commits/diffs del periodo (excl. docs/entregas/*): 11 lineas en diagrama-secuencia.md + 4 archivos SVG nuevos (1 linea c/u en git diff).
- Backlog/planeacion: 60 lineas provenientes de docs/entregas/bitacoras/diego-islas.md (creado), y 0 issues creados.
- Revision/integracion: 0.5 puntos reales en PRs del periodo (PR #68, #71: 2 asignaciones).
- Señales complementarias: 0 aprobaciones, 0 solicitudes de cambio, 0 comentarios, 0 merges, 2 PRs asignados, 0 issues asignados.
