# Entrega mensual 01: marzo 2026

## A) Resumen operativo

Marzo consolido la fase de Requerimientos y Diseño documental del proyecto. Las juntas del mes dejaron acuerdos que ya se reflejan en RF, casos de uso, BPMN, pipeline operativo y minutas, lo que mejoro la trazabilidad entre artefactos y dejo una base mas ordenada para la siguiente iteracion de verificacion.

| Tema | Lectura sencilla |
| --- | --- |
| Base del proyecto | Se consolido el cuerpo principal de requerimientos, casos de uso y diagramas que sostiene el siguiente ciclo. |
| Reuniones | Las juntas de marzo dejaron acuerdos formales que ya alimentan la documentacion del proyecto. |
| Flujo de trabajo | La secuencia semanal de minutas, transcripciones y entregables quedo mas estable. |
| Trazabilidad | Las transcripciones, los RF, los casos de uso y los diagramas ya se relacionan con mayor claridad. |
| Pendientes | Todavia hay que homogeneizar nombres, referencias cruzadas y algunos vinculos entre artefactos. |

### Lo mas visible del mes

- Se reforzaron los Requerimientos Funcionales y su relacion con los Casos de Uso.
- Se consolidaron las minutas, transcripciones y acuerdos de diseno.
- Se mantuvo el pipeline operativo como soporte de la documentacion semanal.
- Se avanzo en BPMN, en el glosario y en la consistencia terminologica.

## B) Participacion individual

Cada integrante aporto desde un frente distinto, pero complementario. La idea principal es esta: uno empujo mas el contenido funcional, otro ordeno el flujo y la trazabilidad, y otro ayudo a limpiar y aclarar documentos clave.

| Integrante | Enfoque principal | Aporte del mes | Lo que deja listo para abril |
| --- | --- | --- | --- |
| Maximiliano Carrillo Alvarado | Casos de uso y minutas | Sostuvo gran parte del contenido documental visible del mes. | Ampliar RF-EVT y seguir afinando los casos de uso. |
| Isaac Alejandro Ortiz Zaldivar | Flujo de trabajo y trazabilidad | Ordeno pipeline, entregas, decisiones y seguimiento de integracion. | Unir mejor las decisiones con BPMN y cerrar trazabilidad. |
| Diego Islas Merino | Requerimientos y normalizacion | Apoyo en RF-COM y BPMN con trabajo de orden y claridad. | Reforzar nomenclatura y balancear la carga del equipo. |

## C) Que toca para el siguiente mes

Abril debe servir para ordenar lo que ya existe, cerrar huecos y repartir mejor el trabajo. El plan sale de lo conversado en las juntas y transcripciones de marzo, no de ideas sueltas nuevas. No se trata de abrir muchas cosas nuevas, sino de dejar el proyecto mas facil de entender y mantener.

| Frente | Que se busca | Apoyo sugerido |
| --- | --- | --- |
| Trazabilidad | Unir RF, CU y BPMN en una lectura simple. | Isaac lidera la parte de enlace y verificacion. |
| Homologacion | Unificar nombres, rutas y formato de documentos. | Diego apoya la limpieza y el orden general. |
| RF-EVT | Completar lo que falta en el bloque de eventos. | Maximiliano empuja la expansion funcional. |
| Ritmo semanal | Seguir con minutas y transcripciones por junta. | Los tres mantienen la misma cadencia. |
| Cierre tecnico | Dejar develop listo para pasar a main. | Coordinacion compartida. |

### Reparto sugerido para abril

| Integrante | Foco de abril | Resultado esperado |
| --- | --- | --- |
| Maximiliano Carrillo Alvarado | RF-EVT y consolidacion de casos de uso | Mas detalle funcional y mejor cobertura de eventos. |
| Isaac Alejandro Ortiz Zaldivar | Trazabilidad y BPMN | Documentos mejor conectados y mas faciles de seguir. |
| Diego Islas Merino | Normalizacion documental y soporte de RF | Menos ruido en nombres, rutas y referencias. |

## D) Conclusiones

### ✅ Lo que quedo desbloqueado

- Se dejo una base documental suficiente para seguir sin rehacer el trabajo.
- Las transcripciones de marzo ya conectan mejor las decisiones con los documentos.
- El flujo semanal quedo mas claro y mas facil de repetir.
- El equipo ya tiene una ruta mas ordenada para repartir el trabajo de abril.

### 🚧 Lo que sigue en trabajo

- Cerrar la trazabilidad entre DDR-01 y BPMN.
- Homologar nombres, rutas y referencias.
- Completar la parte de eventos que aun esta incompleta.
- Llevar develop a un punto estable para el paso a main.

### 🧭 Lectura final

Marzo no solo produjo documentos: dejo el proyecto mejor armado para avanzar. Lo que se logro fue quitarle friccion al siguiente paso, porque ya hay una base comun, acuerdos de junta mas claros y una ruta de trabajo mas ordenada. Eso desbloquea abril como mes de cierre y orden, en lugar de volver a empezar.

### ⚡ Lo inmediato

1. Convertir los acuerdos de marzo en cambios concretos durante abril.
2. Repartir mejor las tareas para mantener una carga mas pareja.
3. Limpiar nombres, rutas y referencias para evitar confusiones.
4. Preparar el paso de develop a main cuando los documentos ya esten estables.

## E) Trazabilidad y auditoria (marzo)

Esta seccion deja la evidencia tecnica completa del mes. Aqui quedan los archivos tocados, la participacion por integrante, el backlog cerrado y la verificacion en PRs. Es la parte pensada para auditar el avance sin depender de la lectura narrativa.

### 1) Control de implementacion

#### Artefactos de requerimientos y diseno

| Estado | Archivo | Tipo | Lectura tecnica |
| --- | --- | --- | --- |
| 🆕 | [CU-COM-001](../../diseño/casos%20de%20uso/RF-COM/CU-COM-001-asignacion-de.conversaciones-de-un-bot-a-un-operador-humano.md) | Caso de uso | Ajusta el nombre del actor y deja el flujo bot-operador alineado con la redaccion actual. |
| ↩️ | Version anterior de CU-COM-001 | Reemplazo | La version previa queda sustituida por el archivo actual. |
| 🔄 | [CU-COM-002](../../diseño/casos%20de%20uso/RF-COM/CU-COM-002-flujo-de-la-conversacion-entre-el-lead-y-el-bot.md) | Caso de uso | Refina el flujo conversacional entre lead y bot. |
| 🆕 | [CU-COM-003](../../diseño/casos%20de%20uso/RF-COM/CU-COM-003-presentacion-de-eventos-disponibles.md) | Caso de uso | Incorpora la presentacion de eventos disponibles. |
| ↩️ | Version anterior de CU-CUM-003 | Reemplazo | Corrige la nomenclatura del artefacto previo. |
| 🔄 | [CU-Plantilla COM](../../diseño/casos%20de%20uso/CU-Plantilla.md) | Plantilla | Homogeneiza la estructura de los casos de uso COM. |
| 🔄 | [CU-EVT-001](../../diseño/casos%20de%20uso/RF-EVT/CU-EVT-001-registro-en-lista-de-espera.md) | Caso de uso | Ajusta el registro en lista de espera. |
| 🔄 | [CU-EVT-002](../../diseño/casos%20de%20uso/RF-EVT/CU-EVT-002-gestion-de-cancelacion.md) | Caso de uso | Ajusta la gestion de cancelacion. |
| 🆕 | [CU-EVT-003](../../diseño/casos%20de%20uso/RF-EVT/CU-EVT-003-sistema-de-inscripcion.md) | Caso de uso | Agrega el sistema de inscripcion. |
| 🔄 | [CU-Plantilla EVT](../../diseño/casos%20de%20uso/CU-Plantilla.md) | Plantilla | Normaliza la redaccion de los CU EVT. |
| 🆕 | [RF-COM-02](../../diseño/requerimientos/funcionales/RF-COM/RF-COM-02.%20Gestión%20de%20etapa%20comercial%20y%20calificación%20automática%20de%20leads.md) | Requerimiento | Corrige la version de gestion de etapa comercial y calificacion de leads. |
| ↩️ | Version anterior de RF-COM-02 | Reemplazo | Se reemplaza la version con nombre inconsistente. |
| 🔄 | [RF-COM-07](../../diseño/requerimientos/funcionales/RF-COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md) | Requerimiento | Ajusta la redaccion de privacidad y consistencia terminologica. |

#### Reuniones y seguimiento semanal

| Estado | Archivo | Tipo | Lectura tecnica |
| --- | --- | --- | --- |
| 🆕 | [rsm-12-03-revision-del-sprint-y-gestion-del-repo.md](../../meetings/resumenes/rsm-12-03-revision-del-sprint-y-gestion-del-repo.md) | Resumen | Deja evidencia de la revision de sprint y del repo. |
| 🆕 | [rsm-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md](../../meetings/resumenes/rsm-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md) | Resumen | Registra el ajuste de ritmo y la mejora del proceso. |
| 🆕 | [rsm-26-03-Refinamiento de RF, trazabilidad y adopción de BPMN.md](../../meetings/resumenes/rsm-26-03-Refinamiento%20de%20RF,%20trazabilidad%20y%20adopción%20de%20BPMN.md) | Resumen | Sintetiza el refinamiento final de RF y BPMN. |
| 🆕 | [trs-12-03-revision-de-sprint-y-gestion-del-repo.md](../../meetings/transcripciones/trs-12-03-revision-de-sprint-y-gestion-del-repo.md) | Transcripcion | Base verbal para el control del sprint y el repo. |
| 🆕 | [trs-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md](../../meetings/transcripciones/trs-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md) | Transcripcion | Base para el ajuste del proceso y la carga semanal. |
| 🆕 | [trs-26-03-Refinamiento de RF, trazabilidad y adopción de BPMN.md](../../meetings/transcripciones/trs-26-03-%20Refinamiento%20de%20RF,%20trazabilidad%20y%20adopción%20de%20BPMN.md) | Transcripcion | Base para trazabilidad, RF y BPMN. |
| 🔄 | [entrega semana 01.md](../semanales/entrega%20semana%2001.md) | Entrega semanal | Consolida la evidencia operativa de la primera semana. |
| 🔄 | [entrega semana 02.md](../semanales/entrega%20semana%2002.md) | Entrega semanal | Consolida la evidencia operativa de la segunda semana. |

#### Artefactos de soporte y continuidad

| Archivo | Rol en marzo |
| --- | --- |
| [pipeline-operativo.md](../../pipeline-operativo.md) | Define el flujo operativo semanal usado para coordinar entregables. |
| [DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md](../../diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md) | Registra el impacto de RF-COM-02 sobre los casos de uso. |
| [BPMNs.md](../../diseño/modelos%20de%20diseño/BPMNs.md) | Contiene el modelo de diagramación usado para el análisis del flujo. |
| [Definiciones.md](../../diseño/glosario/Definiciones.md) | Sirve como glosario de consistencia terminológica. |
| [entrega febrero.md](../mensuales/entrega%20febrero.md) | Referencia comparativa de avance mensual. |
| [entrega abril.md](../mensuales/entrega%20abril.md) | Punto de continuidad para el siguiente ciclo. |

### 2) Participacion en ingenieria

| Integrante | Requerimientos | Diseno | Glosario | Diagramacion |
| --- | --- | --- | --- | --- |
| Maximiliano Carrillo Alvarado | Bloques RF-COM y RF-EVT vinculados a los casos de uso; ver issues #2, #28, #32, #33, #41, #47 y #53. | Casos de uso COM y EVT: [CU-COM-001](../../diseño/casos%20de%20uso/RF-COM/CU-COM-001-asignacion-de.conversaciones-de-un-bot-a-un-operador-humano.md), [CU-COM-002](../../diseño/casos%20de%20uso/RF-COM/CU-COM-002-flujo-de-la-conversacion-entre-el-lead-y-el-bot.md), [CU-COM-003](../../diseño/casos%20de%20uso/RF-COM/CU-COM-003-presentacion-de-eventos-disponibles.md), [CU-EVT-001](../../diseño/casos%20de%20uso/RF-EVT/CU-EVT-001-registro-en-lista-de-espera.md), [CU-EVT-002](../../diseño/casos%20de%20uso/RF-EVT/CU-EVT-002-gestion-de-cancelacion.md), [CU-EVT-003](../../diseño/casos%20de%20uso/RF-EVT/CU-EVT-003-sistema-de-inscripcion.md). | Reviso consistencia terminologica en los CU y en la redaccion funcional. | Aporto alineacion entre CU y BPMN en la documentacion de eventos. |
| Isaac Alejandro Ortiz Zaldivar | RF-COM-02, RF-COM-07 y articulacion de requerimientos con flujo operativo; ver issues #22, #24, #25, #27, #30 y PRs de soporte. | [DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md](../../diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md), [BPMNs.md](../../diseño/modelos%20de%20diseño/BPMNs.md), [pipeline-operativo.md](../../pipeline-operativo.md). | [Definiciones.md](../../diseño/glosario/Definiciones.md) como base terminologica. | [BPMNs.md](../../diseño/modelos%20de%20diseño/BPMNs.md) y trazabilidad entre artefactos. |
| Diego Islas Merino | RF-COM-02 y RF-COM-07, ademas de soporte a la normalizacion de casos EVT; ver issues #3, #26 y #29. | Ajustes de soporte en casos de uso y validacion de consistencia documental. | Validacion puntual de consistencia terminologica en la documentacion de soporte. | Apoyo en BPMN y en el ajuste de diagramas para cerrar trazabilidad. |

### 3) Gestion de operatividad (Backlog)

#### Maximiliano Carrillo Alvarado

| Issue | Titulo | Fecha cierre | Lectura tecnica |
| --- | --- | --- | --- |
| [#2](https://github.com/Ozia112/SoftwareDesignProject/issues/2) | PSD-01-Documentar RFs COM del Bot (Listado, Detalle y Fechas) | 2026-03-05 | Cierre del bloque inicial de RF-COM del bot. |
| [#28](https://github.com/Ozia112/SoftwareDesignProject/issues/28) | PSD-10 Docs Redactar casos de uso de RF-COM-01 y RF-COM-03 a RF-COM-06 | 2026-03-12 | Consolidacion de casos de uso COM. |
| [#32](https://github.com/Ozia112/SoftwareDesignProject/issues/32) | PSD-08 Docs Redactar casos de uso de RF-EVT-01, RF-EVT-02, RF-EVT-04 y RF-EVT-06 | 2026-03-17 | Cierre del bloque principal EVT. |
| [#33](https://github.com/Ozia112/SoftwareDesignProject/issues/33) | PSD-09 Docs Redactar casos de uso de RF-EVT-03, RF-EVT-05 y RF-EVT-07 | 2026-03-12 | Completa el segundo bloque EVT. |
| [#41](https://github.com/Ozia112/SoftwareDesignProject/issues/41) | PSD-12 Docs Redactar casos de uso de RF-EVT-01, RF-EVT-02, RF-EVT-04 y RF-EVT-06 | 2026-03-26 | Ajuste posterior de casos EVT. |
| [#47](https://github.com/Ozia112/SoftwareDesignProject/issues/47) | PSD-13 Docs Redactar la segunda versión de los casos de uso RF-COM | 2026-03-26 | Reescritura de RF-COM con criterios mas consistentes. |
| [#53](https://github.com/Ozia112/SoftwareDesignProject/issues/53) | PSD-16 Fix Correcciones en los CU-EVT y correcciones menores en los CU-COM-(001-003) | 2026-03-26 | Cierre de correcciones finas en CU COM/EVT. |

#### Isaac Alejandro Ortiz Zaldivar

| Issue | Titulo | Fecha cierre | Lectura tecnica |
| --- | --- | --- | --- |
| [#4](https://github.com/Ozia112/SoftwareDesignProject/issues/4) | PSD-03-Orquestación y calificación de conversaciones | 2026-03-06 | Base de orquestacion y calificacion del flujo. |
| [#10](https://github.com/Ozia112/SoftwareDesignProject/issues/10) | Weekly Registro y síntesis de junta - Semana 01 (Semana del 05 de Marzo) | 2026-03-06 | Cierre del primer ciclo semanal. |
| [#22](https://github.com/Ozia112/SoftwareDesignProject/issues/22) | Docs Actualización del README y definición del Pipeline Operativo | 2026-03-06 | Consolidacion del flujo operativo. |
| [#24](https://github.com/Ozia112/SoftwareDesignProject/issues/24) | PSD-04 Docs Sustituir pipeline operativo por flujo con Sprint semanal, PSD y Weekly desacoplados | 2026-03-07 | Ajuste fino del proceso semanal. |
| [#25](https://github.com/Ozia112/SoftwareDesignProject/issues/25) | Sprint sp-01 2026-03-06 a 2026-03-12 - Consolidar RF core, casos de uso COM/EVT y BPMN inicial | 2026-03-17 | Cierre del sprint de base. |
| [#27](https://github.com/Ozia112/SoftwareDesignProject/issues/27) | PSD-06 Docs Analizar impacto de RF-COM-02 sobre RF COM y RF EVT | 2026-03-12 | Base para DDR y trazabilidad. |
| [#30](https://github.com/Ozia112/SoftwareDesignProject/issues/30) | PSD-11 Docs Modelar BPMN del flujo comercial principal y gestion de cupo | 2026-03-17 | Cierre del modelado BPMN principal. |

#### Diego Islas Merino

| Issue | Titulo | Fecha cierre | Lectura tecnica |
| --- | --- | --- | --- |
| [#3](https://github.com/Ozia112/SoftwareDesignProject/issues/3) | PSD-02-Consentimiento y privacidad | 2026-03-05 | Aporta al bloque de privacidad y consistencia documental. |
| [#26](https://github.com/Ozia112/SoftwareDesignProject/issues/26) | PSD-05 Docs Consolidar RF-COM-02 como requerimiento core del sistema | 2026-03-10 | Refuerza el requerimiento central del sistema. |
| [#29](https://github.com/Ozia112/SoftwareDesignProject/issues/29) | PSD-07 Docs Redactar casos de uso de RF-COM-02 y RF-COM-07 | 2026-03-12 | Cierre del bloque RF-COM sensible para el proyecto. |

#### Sin asignacion visible

| Issue | Titulo | Fecha cierre | Lectura tecnica |
| --- | --- | --- | --- |
| [#11](https://github.com/Ozia112/SoftwareDesignProject/issues/11) | Weekly Registro y síntesis de junta - Semana 02 (Semana del 12 de Marzo) | 2026-03-26 | Cierre semanal sin responsable visible en el issue. |
| [#46](https://github.com/Ozia112/SoftwareDesignProject/issues/46) | PSD-13 Docs Redactar la segunda versión de los casos de uso RF-CO | 2026-03-19 | Cierre documental sin asignacion visible. |

### 4) Fase de verificacion (QA)

| PR | Autor | Fecha merge | Revision visible | Resultado |
| --- | --- | --- | --- | --- |
| [#56](https://github.com/Ozia112/SoftwareDesignProject/pull/56) | diego-islas | 2026-03-27 | Aprobado por el owner | APPROVED |
| [#55](https://github.com/Ozia112/SoftwareDesignProject/pull/55) | Maximiliano Carrillo Alvarado | 2026-03-26 | Aprobado por el owner | APPROVED |
| [#51](https://github.com/Ozia112/SoftwareDesignProject/pull/51) | diego-islas | 2026-03-25 | Comentarios, cambios solicitados y aprobaciones posteriores | APPROVED |
| [#49](https://github.com/Ozia112/SoftwareDesignProject/pull/49) | Maximiliano Carrillo Alvarado | 2026-03-26 | Cambios solicitados y posterior aprobacion | APPROVED |
| [#48](https://github.com/Ozia112/SoftwareDesignProject/pull/48) | Maximiliano Carrillo Alvarado | 2026-03-26 | Cambios solicitados y posterior aprobacion | APPROVED |
| [#45](https://github.com/Ozia112/SoftwareDesignProject/pull/45) | Maximiliano Carrillo Alvarado | 2026-03-19 | Aprobado por el owner | APPROVED |
| [#44](https://github.com/Ozia112/SoftwareDesignProject/pull/44) | Isaac Alejandro Ortiz Zaldivar | 2026-03-17 | Sin revision visible | REVIEW_REQUIRED |
| [#43](https://github.com/Ozia112/SoftwareDesignProject/pull/43) | Isaac Alejandro Ortiz Zaldivar | 2026-03-17 | Sin revision visible | REVIEW_REQUIRED |
| [#39](https://github.com/Ozia112/SoftwareDesignProject/pull/39) | Isaac Alejandro Ortiz Zaldivar | 2026-03-13 | Aprobado por Maximiliano | APPROVED |
| [#38](https://github.com/Ozia112/SoftwareDesignProject/pull/38) | Maximiliano Carrillo Alvarado | 2026-03-12 | Comentario inicial y aprobacion final | APPROVED |
| [#37](https://github.com/Ozia112/SoftwareDesignProject/pull/37) | Isaac Alejandro Ortiz Zaldivar | 2026-03-12 | Sin revision visible | REVIEW_REQUIRED |
| [#36](https://github.com/Ozia112/SoftwareDesignProject/pull/36) | Isaac Alejandro Ortiz Zaldivar | 2026-03-09 | Sin revision visible | REVIEW_REQUIRED |
| [#35](https://github.com/Ozia112/SoftwareDesignProject/pull/35) | Maximiliano Carrillo Alvarado | 2026-03-12 | Comentarios del owner y aprobacion posterior | APPROVED |
| [#34](https://github.com/Ozia112/SoftwareDesignProject/pull/34) | diego-islas | 2026-03-09 | Changes requested | CHANGES_REQUESTED |
| [#31](https://github.com/Ozia112/SoftwareDesignProject/pull/31) | Isaac Alejandro Ortiz Zaldivar | 2026-03-06 | Aprobado por Maximiliano | APPROVED |
| [#23](https://github.com/Ozia112/SoftwareDesignProject/pull/23) | Isaac Alejandro Ortiz Zaldivar | 2026-03-06 | Sin revision visible | REVIEW_REQUIRED |
| [#21](https://github.com/Ozia112/SoftwareDesignProject/pull/21) | Isaac Alejandro Ortiz Zaldivar | 2026-03-06 | Sin revision visible | REVIEW_REQUIRED |
| [#9](https://github.com/Ozia112/SoftwareDesignProject/pull/9) | diego-islas | 2026-03-05 | Aprobado por el owner | APPROVED |
| [#7](https://github.com/Ozia112/SoftwareDesignProject/pull/7) | Maximiliano Carrillo Alvarado | 2026-03-05 | Aprobado por el owner | APPROVED |
| [#1](https://github.com/Ozia112/SoftwareDesignProject/pull/1) | Isaac Alejandro Ortiz Zaldivar | 2026-03-02 | Sin revision visible | REVIEW_REQUIRED |

### 5) Base de calculo y evidencia

| Fuente | Uso |
| --- | --- |
| `git log --numstat` | Medicion de cambios por archivo y por integrante. |
| `git log --name-status --diff-filter=A` | Identificacion de archivos creados con contenido. |
| `git diff --name-status main...develop -- docs/` | Inventario de artefactos de documentacion tocados en el ciclo. |
| `gh issue list` | Inventario del backlog cerrado y su asignacion. |
| `gh pr list` | Registro de PRs mergeados y del estado de revision. |
| `git rev-list --left-right --count main...develop` | Comparacion de ramas al cierre de marzo. |
| `generate-individual-activity-summary.ps1` | Consolidacion de la participacion por integrante. |
| Transcripciones y resumenes de reuniones | Contexto de decision para RF, CU, BPMN y flujo operativo. |

| Parte de la medicion | Peso tecnico | Que representa |
| --- | --- | --- |
| Ejecucion documental | 70% | Cambios hechos en la documentacion del proyecto. |
| Administracion del trabajo | 20% | Seguimiento de issues y entregas relacionadas. |
| Revision e integracion | 10% | Reviews, merges y apoyo de integracion. |

| Dato | Resultado |
| --- | --- |
| Archivos con contenido creados | 45 |
| Integrantes activos | 3 |
| Participacion de Maximiliano | 44.47% |
| Participacion de Isaac | 43.05% |
| Participacion de Diego | 12.49% |
| Lineas documentales trabajadas | 6294 |
| Lineas de docs | 4294 |
| Lineas de backlog | 1936 |
| Puntos de revision | 34.55 |

### Nota de lectura

Si alguien solo necesita entender el avance general, debe leer A a D. Si necesita justificar un numero, una distribucion o una decision, debe ir a esta seccion y a los artefactos de GitHub vinculados.
