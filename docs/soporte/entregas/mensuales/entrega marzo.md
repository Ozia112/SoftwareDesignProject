# Entrega mensual 01: marzo 2026

## A) Resumen operativo

Marzo consolidó la fase de Requerimientos y Diseño documental del proyecto. Durante el mes se cerró la base funcional de COM y EVT, se estabilizó el pipeline operativo, y se dejó trazabilidad visible entre RF, casos de uso, BPMN, glosario, decisiones y reuniones.

| Tema              | Lectura sencilla                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Base del proyecto | Se cerró el bloque principal de requerimientos y casos de uso que sostiene la siguiente iteración. |
| Reuniones         | Las juntas del mes quedaron traducidas en transcripciones, resúmenes y acuerdos accionables.       |
| Flujo de trabajo  | Sprint, Weekly y PSD quedaron desacoplados y el flujo Issue → Rama → PR quedó visible.             |
| Trazabilidad      | RF, CU, BPMN, DDR-01 y el glosario ya se leen como un mismo bloque documental.                     |
| Continuidad       | Abril arranca con ajustes finos y verificación, no con reconstrucción de base.                     |

### Lo mas visible del mes

- Se consolidó RF-COM-02 como referencia funcional del bloque comercial.
- Se cerró la homologación de los casos de uso COM y EVT que sostenían la trazabilidad.
- Se mantuvo el pipeline operativo como soporte del flujo semanal del repositorio.
- Se reforzó BPMN junto con el glosario y la consistencia terminológica de los artefactos.

## B) Participacion individual

Cada integrante aportó desde un frente distinto, pero complementario. La lectura general es esta: uno empujó el contenido funcional, otro ordenó el flujo y la trazabilidad, y otro ayudó a limpiar y homogeneizar documentos clave.

| Integrante                     | Enfoque principal               | Aporte del mes                                                      | Lo que deja listo para abril                                                         |
| ------------------------------ | ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Maximiliano Carrillo Alvarado  | Casos de uso y minutas          | Sostuvo la mayor parte de la redacción documental visible del mes.  | Mantener la continuidad de CU y el ajuste fino de los artefactos que sigan abiertos. |
| Isaac Alejandro Ortiz Zaldivar | Flujo de trabajo y trazabilidad | Ordenó pipeline, entregas, decisiones y seguimiento de integración. | Sostener la trazabilidad y la coordinación del siguiente corte semanal.              |
| Diego Islas Merino             | Requerimientos y normalización  | Apoyó en RF-COM, RF-EVT y BPMN con trabajo de orden y claridad.     | Mantener la limpieza de nombres, rutas y referencias documentales.                   |

### Graficas

<div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; align-items:flex-start;">
 <img src="assets/marzo/grafica de pastel de participacion porcentual individual.png" alt="Grafica de pastel de participacion porcentual individual" style="width:23%; min-width:180px;" />
 <img src="assets/marzo/grafica de pastel lineas totales.png" alt="Grafica de pastel lineas totales" style="width:23%; min-width:180px;" />
 <img src="assets/marzo/grafica de pastel lineas docs.png" alt="Grafica de pastel lineas docs" style="width:23%; min-width:180px;" />
 <img src="assets/marzo/grafica de pastel lineas backlog.png" alt="Grafica de pastel lineas backlog" style="width:23%; min-width:180px;" />
</div>

## C) Que toca para el siguiente mes

Con la base de requerimientos funcionales (RF) y casos de uso verificada, el trabajo de abril cambia el enfoque hacia las especificaciones técnicas del sistema. Se tomaron decisiones para reducir el alcance hacia requerimientos no funcionales (RNF) clave, permitiendo una transición más estable hacia la arquitectura y el diseño técnico.

### Frentes de trabajo

| Frente de trabajo | Objetivo | Liderazgo / Apoyo sugerido |
| --- | --- | --- |
| **Requerimientos No Funcionales** | Especificar RNF prioritarios enfocados en seguridad de transmisión, almacenamiento, control de acceso y trazabilidad, evaluando esfuerzo e impacto. | Diego Islas Merino |
| **Descomposición técnica** | Traducir los casos de uso documentados y RF homologados a características o componentes técnicos verificables para el desarrollo. | Maximiliano Carrillo Alvarado |
| **Diseño y trazabilidad base** | Alinear la arquitectura inicial con las reglas de negocio, y mantener los diagramas BPMN consistentes conforme se descubre complejidad técnica. | Isaac Alejandro Ortiz Zaldivar |

### Fases de ejecución (Abril)

| Fase | Fechas sugeridas | Artefactos asociados | Resultado esperado |
| --- | --- | --- | --- |
| **Fase 1: Enfoque preliminar RNF** | Semana 1 | Especificación base de RNF | Definición de atributos de calidad limitados a seguridad, acceso y trazabilidad. |
| **Fase 2: Refinamiento técnico** | Semanas 2-3 | RNF documentados, Glosario actualizado | Documentos con nivel de esfuerzo priorizado y criterios de verificación. |
| **Fase 3: Despliegue arquitectónico** | Semana 4 | Modelos de diseño iniciales | Visualización o traducción técnica de los flujos de COM y EVT consolidados. |
| **Fase 4: Cierre operacional** | Cierre de mes | Base conectada RF-RNF | Una base técnica preparada para implementar componentes aislados sin replanificar. |

## D) Conclusiones

### ✅ Lo que quedo desbloqueado

- La base principal de **Requerimientos Funcionales (RF)** (bloques COM y EVT) quedó documentada, estable y verificada contra los casos de uso.
- Se consolidaron los principales flujos de interacción a través de **modelos BPMN** consistentes.
- Se estableció una trazabilidad clara entre decisiones del equipo (DDR), glosario y alcance del proyecto.
- El proyecto alcanzó la madurez funcional necesaria para iniciar la definición técnica sin tener que reescribir funciones base.

### 🚧 Lo que sigue en trabajo

- Especificar y priorizar rigurosamente los **Requerimientos No Funcionales (RNF)** (ej. seguridad, acceso y trazabilidad) para no saturar el alcance.
- Traducir la lógica de la capa funcional a modelos de diseño arquitectónico viables.
- Descomponer los casos de uso aprobados en componentes técnicos que guíen la fase de implementación.
- Controlar que la terminología técnica de la arquitectura se mantenga alineada al glosario de negocio.

### Lectura final

El proyecto cerró exitosamente la etapa de descubrimiento de negocio y homologación funcional. El mayor logro del mes es que el equipo ya no necesita debatir "qué" debe hacer el sistema, logrando desbloquear por completo la discusión técnica sobre "cómo" se va a construir de manera segura y trazable.

### Lo inmediato

⚡ Iniciar la redacción preliminar de los RNF enfocados a seguridad, almacenamiento de datos y control de accesos.
⚡ Trasladar los flujos operacionales (BPMN) evaluados hacia bocetos de arquitectura técnica.
⚡ Definir el nivel de esfuerzo para el desarrollo de los bloques funcionales iniciales.

### Proyección operativa

| Mes | Enfoque principal | Estado esperado |
| --- | --- | --- |
| **Abril** | Especificación de Requerimientos No Funcionales (RNF) y arquitectura | Atributos de calidad (seguridad, acceso) formalizados y base de diseño lista |
| **Mayo** | Descomposición técnica, reglas de negocio detalladas e inicialización de código | Componentes principales desarrollados y verificados contra casos de uso |
| **Junio** | Verificación técnica final, consolidación de seguridad y empaquetado | Release candidato con todo el alcance funcional y de diseño validado |

### 6) Desglose por integrante

Las cifras siguientes separan el reparto de marzo por tipo de carga para que la lectura individual sea más clara y no dependa de una sola métrica agregada.

#### Líneas totales del mes

Distribución estimada con base en la participación global del mes.

| Integrante                     | Líneas totales |
| ------------------------------ | -------------- |
| Maximiliano Carrillo Alvarado  | 2799           |
| Isaac Alejandro Ortiz Zaldivar | 2709           |
| Diego Islas Merino             | 786            |

#### Líneas solo de docs

Distribución estimada de la carga documental del mes.

| Integrante                     | Líneas de docs |
| ------------------------------ | -------------- |
| Maximiliano Carrillo Alvarado  | 1909           |
| Isaac Alejandro Ortiz Zaldivar | 1849           |
| Diego Islas Merino             | 536            |

#### Líneas de backlog

Distribución estimada de la carga de backlog y seguimiento operativo.

| Integrante                     | Líneas de backlog |
| ------------------------------ | ----------------- |
| Maximiliano Carrillo Alvarado  | 861               |
| Isaac Alejandro Ortiz Zaldivar | 833               |
| Diego Islas Merino             | 242               |

#### Revisiones del mes

Conteo de PRs mergeados o revisados por integrante durante marzo.

| Integrante                     | Revisiones                                                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maximiliano Carrillo Alvarado  | 7                                                                                                                                                     |
| Isaac Alejandro Ortiz Zaldivar | 10                                                                                                                                                    |
| Diego Islas Merino             | 5                                                                                                                                                     |
| 🔄                              | [CU-Plantilla EVT](../../../dise%C3%B1o/casos%20de%20uso/CU-Plantilla.md)                                                                                     | Plantilla     | Normaliza la redaccion de los CU EVT.                                     |
| 🆕                              | [RF-COM-02](../../../dise%C3%B1o/requerimientos/funcionales/COM/RF-COM-02%20Gesti%C3%B3n%20de%20etapa%20comercial%20y%20calificaci%C3%B3n%20autom%C3%A1tica%20de%20leads.md) | Requerimiento | Corrige la version de gestion de etapa comercial y calificacion de leads. |
| ↩️                              | Version anterior de RF-COM-02                                                                                                                         | Reemplazo     | Se reemplaza la version con nombre inconsistente.                         |
| 🔄                              | [RF-COM-07](../../../dise%C3%B1o/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md)                                      | Requerimiento | Ajusta la redaccion de privacidad y consistencia terminologica.           |

#### Reuniones y seguimiento semanal

| Estado | Archivo                                                                                                                                                                              | Tipo            | Lectura tecnica                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ------------------------------------------------------ |
| 🆕      | [rsm-12-03-revision-del-sprint-y-gestion-del-repo.md](../../meetings/resumenes/rsm-12-03-revision-del-sprint-y-gestion-del-repo.md)                                                  | Resumen         | Deja evidencia de la revision de sprint y del repo.    |
| 🆕      | [rsm-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md](../../meetings/resumenes/rsm-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md)                          | Resumen         | Registra el ajuste de ritmo y la mejora del proceso.   |
| 🆕      | [rsm-26-03-Refinamiento de RF, trazabilidad y adopción de BPMN.md](../../meetings/resumenes/rsm-26-03-Refinamiento%20de%20RF,%20trazabilidad%20y%20adopci%C3%B3n%20de%20BPMN.md)          | Resumen         | Sintetiza el refinamiento final de RF y BPMN.          |
| 🆕      | [trs-12-03-revision-de-sprint-y-gestion-del-repo.md](../../meetings/transcripciones/trs-12-03-revision-de-sprint-y-gestion-del-repo.md)                                              | Transcripcion   | Base verbal para el control del sprint y el repo.      |
| 🆕      | [trs-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md](../../meetings/transcripciones/trs-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md)                    | Transcripcion   | Base para el ajuste del proceso y la carga semanal.    |
| 🆕      | [trs-26-03-Refinamiento de RF, trazabilidad y adopción de BPMN.md](../../meetings/transcripciones/trs-26-03-%20Refinamiento%20de%20RF,%20trazabilidad%20y%20adopci%C3%B3n%20de%20BPMN.md) | Transcripcion   | Base para trazabilidad, RF y BPMN.                     |
| 🔄      | [entrega semana 01.md](./../semanales/entrega%20semana%2001.md)                                                                                                                        | Entrega semanal | Consolida la evidencia operativa de la primera semana. |
| 🔄      | [entrega semana 02.md](./../semanales/entrega%20semana%2002.md)                                                                                                                        | Entrega semanal | Consolida la evidencia operativa de la segunda semana. |

#### Artefactos de soporte y continuidad

| Archivo                                                                                                                          | Rol en marzo                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [pipeline-operativo.md](../../../workflow/pipeline-operativo.md)                                                                    | Define el flujo operativo semanal usado para coordinar entregables.  |
| [DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md](../../../dise%C3%B1o/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md) | Registra el impacto de RF-COM-02 sobre los casos de uso.             |
| [BPMNs.md](../../../analisis/modelos%20del%20problema/bpmn/BPMNs.md)                                                                          | Contiene el modelo de diagramación usado para el análisis del flujo. |
| [Definiciones.md](../../../analisis/glosario/Definiciones.md)                                                                         | Sirve como glosario de consistencia terminológica.                   |
| [entrega febrero.md](./entrega%20febrero.md)                                                                          | Referencia comparativa de avance mensual.                            |
| [entrega semana 03.md](./../semanales/entrega%20semana%2003.md)                                                                    | Cierra la evidencia semanal real antes de abrir abril.               |

### 2) Participacion en ingenieria

| Integrante                     | Requerimientos                                                                                                                  | Diseno                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Glosario                                                                          | Diagramacion                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Maximiliano Carrillo Alvarado  | Bloques RF-COM y RF-EVT vinculados a los casos de uso; ver issues #2, #28, #32, #33, #41, #47 y #53.                            | Casos de uso COM y EVT: [CU-COM-001](../../../dise%C3%B1o/casos%20de%20uso/COM/CU-COM-001%20Asignaci%C3%B3n%20de%20conversaciones%20de%20un%20bot%20a%20un%20operador%20humano.md), [CU-COM-002](../../../dise%C3%B1o/casos%20de%20uso/COM/CU-COM-002%20Flujo%20de%20la%20conversaci%C3%B3n%20entre%20persona%20interesada%20y%20el%20bot.md), [CU-COM-003](../../../dise%C3%B1o/casos%20de%20uso/COM/CU-COM-003%20Presentaci%C3%B3n%20de%20eventos%20disponibles.md), [CU-EVT-001](../../../dise%C3%B1o/casos%20de%20uso/EVT/CU-EVT-001%20Registro%20en%20lista%20de%20espera.md), [CU-EVT-002](../../../dise%C3%B1o/casos%20de%20uso/EVT/CU-EVT-002%20Gesti%C3%B3n%20de%20cancelaci%C3%B3n.md), [CU-EVT-003](../../../dise%C3%B1o/casos%20de%20uso/EVT/CU-EVT-003%20Sistema%20de%20inscripci%C3%B3n.md). | Reviso consistencia terminologica en los CU y en la redaccion funcional.          | Aporto alineacion entre CU y BPMN en la documentacion de eventos.                        |
| Isaac Alejandro Ortiz Zaldivar | RF-COM-02, RF-COM-07 y articulacion de requerimientos con flujo operativo; ver issues #22, #24, #25, #27, #30 y PRs de soporte. | [DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md](../../../dise%C3%B1o/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md), [BPMNs.md](../../../analisis/modelos%20del%20problema/bpmn/BPMNs.md), [pipeline-operativo.md](../../../workflow/pipeline-operativo.md).                                                                                                                                                                                                                                                                                                                                                                                  | [Definiciones.md](../../../analisis/glosario/Definiciones.md) como base terminologica. | [BPMNs.md](../../../analisis/modelos%20del%20problema/bpmn/BPMNs.md) y trazabilidad entre artefactos. |
| Diego Islas Merino             | RF-COM-02 y RF-COM-07, ademas de soporte a la normalizacion de casos EVT; ver issues #3, #26 y #29.                             | Ajustes de soporte en casos de uso y validacion de consistencia documental.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Validacion puntual de consistencia terminologica en la documentacion de soporte.  | Apoyo en BPMN y en el ajuste de diagramas para cerrar trazabilidad.                      |

### 3) Gestion de operatividad (Backlog)

#### Maximiliano Carrillo Alvarado

| Issue                                                             | Titulo                                                                               | Fecha cierre | Lectura tecnica                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------- |
| [#2](https://github.com/Ozia112/SoftwareDesignProject/issues/2)   | PSD-01-Documentar RFs COM del Bot (Listado, Detalle y Fechas)                        | 2026-03-05   | Cierre del bloque inicial de RF-COM del bot.          |
| [#28](https://github.com/Ozia112/SoftwareDesignProject/issues/28) | PSD-10 Docs Redactar casos de uso de RF-COM-01 y RF-COM-03 a RF-COM-06               | 2026-03-12   | Consolidacion de casos de uso COM.                    |
| [#32](https://github.com/Ozia112/SoftwareDesignProject/issues/32) | PSD-08 Docs Redactar casos de uso de RF-EVT-01, RF-EVT-02, RF-EVT-04 y RF-EVT-06     | 2026-03-17   | Cierre del bloque principal EVT.                      |
| [#33](https://github.com/Ozia112/SoftwareDesignProject/issues/33) | PSD-09 Docs Redactar casos de uso de RF-EVT-03, RF-EVT-05 y RF-EVT-07                | 2026-03-12   | Completa el segundo bloque EVT.                       |
| [#41](https://github.com/Ozia112/SoftwareDesignProject/issues/41) | PSD-12 Docs Redactar casos de uso de RF-EVT-01, RF-EVT-02, RF-EVT-04 y RF-EVT-06     | 2026-03-26   | Ajuste posterior de casos EVT.                        |
| [#47](https://github.com/Ozia112/SoftwareDesignProject/issues/47) | PSD-13 Docs Redactar la segunda versión de los casos de uso RF-COM                   | 2026-03-26   | Reescritura de RF-COM con criterios mas consistentes. |
| [#53](https://github.com/Ozia112/SoftwareDesignProject/issues/53) | PSD-16 Fix Correcciones en los CU-EVT y correcciones menores en los CU-COM-(001-003) | 2026-03-26   | Cierre de correcciones finas en CU COM/EVT.           |

#### Isaac Alejandro Ortiz Zaldivar

| Issue                                                             | Titulo                                                                                           | Fecha cierre | Lectura tecnica                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------- |
| [#4](https://github.com/Ozia112/SoftwareDesignProject/issues/4)   | PSD-03-Orquestación y calificación de conversaciones                                             | 2026-03-06   | Base de orquestacion y calificacion del flujo.                               |
| [#10](https://github.com/Ozia112/SoftwareDesignProject/issues/10) | Weekly Registro y síntesis de junta - Semana 01 (Semana del 05 de Marzo)                         | 2026-03-06   | Cierre del primer ciclo semanal.                                             |
| [#22](https://github.com/Ozia112/SoftwareDesignProject/issues/22) | Docs Actualización del README y definición del Pipeline Operativo                                | 2026-03-06   | Consolidacion del flujo operativo.                                           |
| [#24](https://github.com/Ozia112/SoftwareDesignProject/issues/24) | PSD-04 Docs Sustituir pipeline operativo por flujo con Sprint semanal, PSD y Weekly desacoplados | 2026-03-07   | Ajuste fino del proceso semanal.                                             |
| [#25](https://github.com/Ozia112/SoftwareDesignProject/issues/25) | Sprint sp-01 2026-03-06 a 2026-03-12 - Consolidar RF core, casos de uso COM/EVT y BPMN inicial   | 2026-03-17   | Cierre del sprint de base.                                                   |
| [#27](https://github.com/Ozia112/SoftwareDesignProject/issues/27) | PSD-06 Docs Analizar impacto de RF-COM-02 sobre RF COM y RF EVT                                  | 2026-03-12   | Base para DDR y trazabilidad.                                                |
| [#30](https://github.com/Ozia112/SoftwareDesignProject/issues/30) | PSD-11 Docs Modelar BPMN del flujo comercial principal y gestion de cupo                         | 2026-03-17   | Cierre del modelado BPMN principal.                                          |
| [#57](https://github.com/Ozia112/SoftwareDesignProject/issues/57) | [Sprint] sp-02 2026-03-13 a 2026-03-19 - Refinar CU y seguimiento semanal                        | 2026-03-29   | Cierre administrativo del sprint semanal y consolidacion del corte de marzo. |

#### Diego Islas Merino

| Issue                                                             | Titulo                                                                   | Fecha cierre | Lectura tecnica                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------ | -------------------------------------------------------------- |
| [#3](https://github.com/Ozia112/SoftwareDesignProject/issues/3)   | PSD-02-Consentimiento y privacidad                                       | 2026-03-05   | Aporta al bloque de privacidad y consistencia documental.      |
| [#26](https://github.com/Ozia112/SoftwareDesignProject/issues/26) | PSD-05 Docs Consolidar RF-COM-02 como requerimiento core del sistema     | 2026-03-10   | Refuerza el requerimiento central del sistema.                 |
| [#29](https://github.com/Ozia112/SoftwareDesignProject/issues/29) | PSD-07 Docs Redactar casos de uso de RF-COM-02 y RF-COM-07               | 2026-03-12   | Cierre del bloque RF-COM sensible para el proyecto.            |
| [#50](https://github.com/Ozia112/SoftwareDesignProject/issues/50) | PSD-14 [Docs] Normalizar RF-COM-02 y RF-COM-07 con glosario y DDR-01     | 2026-03-29   | Homogeneiza el bloque comercial con el glosario y la decision. |
| [#52](https://github.com/Ozia112/SoftwareDesignProject/issues/52) | PSD-15 [Docs] Completar y homologar casos de uso COM y EVT comprometidos | 2026-03-29   | Cierra la homologacion final COM/EVT del corte de marzo.       |

#### Sin asignacion visible

| Issue                                                             | Titulo                                                                   | Fecha cierre | Lectura tecnica                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------ | --------------------------------------------------- |
| [#11](https://github.com/Ozia112/SoftwareDesignProject/issues/11) | Weekly Registro y síntesis de junta - Semana 02 (Semana del 12 de Marzo) | 2026-03-26   | Cierre semanal sin responsable visible en el issue. |
| [#46](https://github.com/Ozia112/SoftwareDesignProject/issues/46) | PSD-13 Docs Redactar la segunda versión de los casos de uso RF-CO        | 2026-03-19   | Cierre documental sin asignacion visible.           |

### 4) Fase de verificacion (QA)

| PR                                                              | Autor                          | Fecha merge | Revision visible                                            | Resultado         |
| --------------------------------------------------------------- | ------------------------------ | ----------- | ----------------------------------------------------------- | ----------------- |
| [#59](https://github.com/Ozia112/SoftwareDesignProject/pull/59) | Isaac Alejandro Ortiz Zaldivar | 2026-03-29  | REVIEW_REQUIRED                                             | Merged            |
| [#54](https://github.com/Ozia112/SoftwareDesignProject/pull/54) | diego-islas                    | 2026-03-29  | REVIEW_REQUIRED                                             | Merged            |
| [#56](https://github.com/Ozia112/SoftwareDesignProject/pull/56) | diego-islas                    | 2026-03-27  | Aprobado por el owner                                       | APPROVED          |
| [#55](https://github.com/Ozia112/SoftwareDesignProject/pull/55) | Maximiliano Carrillo Alvarado  | 2026-03-26  | Aprobado por el owner                                       | APPROVED          |
| [#51](https://github.com/Ozia112/SoftwareDesignProject/pull/51) | diego-islas                    | 2026-03-25  | Comentarios, cambios solicitados y aprobaciones posteriores | APPROVED          |
| [#49](https://github.com/Ozia112/SoftwareDesignProject/pull/49) | Maximiliano Carrillo Alvarado  | 2026-03-26  | Cambios solicitados y posterior aprobacion                  | APPROVED          |
| [#48](https://github.com/Ozia112/SoftwareDesignProject/pull/48) | Maximiliano Carrillo Alvarado  | 2026-03-26  | Cambios solicitados y posterior aprobacion                  | APPROVED          |
| [#45](https://github.com/Ozia112/SoftwareDesignProject/pull/45) | Maximiliano Carrillo Alvarado  | 2026-03-19  | Aprobado por el owner                                       | APPROVED          |
| [#44](https://github.com/Ozia112/SoftwareDesignProject/pull/44) | Isaac Alejandro Ortiz Zaldivar | 2026-03-17  | Sin revision visible                                        | REVIEW_REQUIRED   |
| [#43](https://github.com/Ozia112/SoftwareDesignProject/pull/43) | Isaac Alejandro Ortiz Zaldivar | 2026-03-17  | Sin revision visible                                        | REVIEW_REQUIRED   |
| [#39](https://github.com/Ozia112/SoftwareDesignProject/pull/39) | Isaac Alejandro Ortiz Zaldivar | 2026-03-13  | Aprobado por Maximiliano                                    | APPROVED          |
| [#38](https://github.com/Ozia112/SoftwareDesignProject/pull/38) | Maximiliano Carrillo Alvarado  | 2026-03-12  | Comentario inicial y aprobacion final                       | APPROVED          |
| [#37](https://github.com/Ozia112/SoftwareDesignProject/pull/37) | Isaac Alejandro Ortiz Zaldivar | 2026-03-12  | Sin revision visible                                        | REVIEW_REQUIRED   |
| [#36](https://github.com/Ozia112/SoftwareDesignProject/pull/36) | Isaac Alejandro Ortiz Zaldivar | 2026-03-09  | Sin revision visible                                        | REVIEW_REQUIRED   |
| [#35](https://github.com/Ozia112/SoftwareDesignProject/pull/35) | Maximiliano Carrillo Alvarado  | 2026-03-12  | Comentarios del owner y aprobacion posterior                | APPROVED          |
| [#34](https://github.com/Ozia112/SoftwareDesignProject/pull/34) | diego-islas                    | 2026-03-09  | Changes requested                                           | CHANGES_REQUESTED |
| [#31](https://github.com/Ozia112/SoftwareDesignProject/pull/31) | Isaac Alejandro Ortiz Zaldivar | 2026-03-06  | Aprobado por Maximiliano                                    | APPROVED          |
| [#23](https://github.com/Ozia112/SoftwareDesignProject/pull/23) | Isaac Alejandro Ortiz Zaldivar | 2026-03-06  | Sin revision visible                                        | REVIEW_REQUIRED   |
| [#21](https://github.com/Ozia112/SoftwareDesignProject/pull/21) | Isaac Alejandro Ortiz Zaldivar | 2026-03-06  | Sin revision visible                                        | REVIEW_REQUIRED   |
| [#9](https://github.com/Ozia112/SoftwareDesignProject/pull/9)   | diego-islas                    | 2026-03-05  | Aprobado por el owner                                       | APPROVED          |
| [#7](https://github.com/Ozia112/SoftwareDesignProject/pull/7)   | Maximiliano Carrillo Alvarado  | 2026-03-05  | Aprobado por el owner                                       | APPROVED          |
| [#1](https://github.com/Ozia112/SoftwareDesignProject/pull/1)   | Isaac Alejandro Ortiz Zaldivar | 2026-03-02  | Sin revision visible                                        | REVIEW_REQUIRED   |

### 5) Base de calculo y evidencia

| Fuente                                                            | Uso                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `gh api repos/Ozia112/SoftwareDesignProject/milestones?state=all` | Lectura del estado de milestones y del corte de marzo.         |
| `git log --numstat`                                               | Medicion de cambios por archivo y por integrante.              |
| `git log --name-status --diff-filter=A`                           | Identificacion de archivos creados con contenido.              |
| `git diff --name-status main...develop -- docs/`                  | Inventario de artefactos de documentacion tocados en el ciclo. |
| `gh issue list`                                                   | Inventario del backlog cerrado y su asignacion.                |
| `gh pr list`                                                      | Registro de PRs mergeados y del estado de revision.            |
| `git rev-list --left-right --count main...develop`                | Comparacion de ramas al cierre de marzo.                       |
| `generate-individual-activity-summary.ps1`                        | Consolidacion de la participacion por integrante.              |
| Transcripciones y resumenes de reuniones                          | Contexto de decision para RF, CU, BPMN y flujo operativo.      |

#### Criterios de peso tecnico

| Parte de la medicion       | Peso tecnico | Que representa                                   |
| -------------------------- | ------------ | ------------------------------------------------ |
| Ejecucion documental       | 70%          | Cambios hechos en la documentacion del proyecto. |
| Administracion del trabajo | 20%          | Seguimiento de issues y entregas relacionadas.   |
| Revision e integracion     | 10%          | Reviews, merges y apoyo de integracion.          |

### 6) Desglose por integrante

Las cifras siguientes separan el reparto de marzo por tipo de carga para que la lectura individual sea más clara y no dependa de una sola métrica agregada.

#### Líneas totales del mes

Distribución estimada con base en la participación global del mes.

| Integrante                     | Líneas totales |
| ------------------------------ | -------------- |
| Maximiliano Carrillo Alvarado  | 2799           |
| Isaac Alejandro Ortiz Zaldivar | 2709           |
| Diego Islas Merino             | 786            |

#### Líneas solo de docs

Distribución estimada de la carga documental del mes.

| Integrante                     | Líneas de docs |
| ------------------------------ | -------------- |
| Maximiliano Carrillo Alvarado  | 1909           |
| Isaac Alejandro Ortiz Zaldivar | 1849           |
| Diego Islas Merino             | 536            |

#### Líneas de backlog

Distribución estimada de la carga de backlog y seguimiento operativo.

| Integrante                     | Líneas de backlog |
| ------------------------------ | ----------------- |
| Maximiliano Carrillo Alvarado  | 861               |
| Isaac Alejandro Ortiz Zaldivar | 833               |
| Diego Islas Merino             | 242               |

#### Revisiones del mes

Conteo de PRs mergeados o revisados por integrante durante marzo.

| Integrante                     | Revisiones |
| ------------------------------ | ---------- |
| Maximiliano Carrillo Alvarado  | 7          |
| Isaac Alejandro Ortiz Zaldivar | 10         |
| Diego Islas Merino             | 5          |

### Nota de lectura

Si alguien solo necesita entender el avance general, debe leer A a D. Si necesita justificar un numero, una distribucion o una decision, debe ir a esta seccion y a los artefactos de GitHub vinculados.

[Sprint]: #
[Docs]: #
