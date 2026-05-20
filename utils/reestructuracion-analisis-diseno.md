# Reestructuracion documental entre analisis y diseño

## Criterio de clasificacion

La separacion propuesta sigue esta regla practica:

- **Analisis**: artefactos que describen necesidades, alcance, reglas del negocio, requerimientos, casos de uso y modelos del problema o del proceso.
- **Diseño**: artefactos que describen la solucion de software, decisiones tecnicas, comportamiento entre componentes, estructura interna e implementacion conceptual.
- **Soporte**: artefactos de operacion del equipo, reuniones, prompts y workflow. No deben mezclarse con analisis ni con diseño.

## Base de referencia

- **SWEBOK v4.0** separa claramente `Software Requirements` de `Software Design`. Los requerimientos definen el problema; el diseño transforma esos requerimientos en especificaciones implementables.
- **ISO/IEC/IEEE 29148:2018** ubica requerimientos, atributos, especificacion, validacion y gestion de requisitos dentro de ingenieria de requerimientos.
- **IEEE 1016-2009** describe el contenido de una `Software Design Description (SDD)` y aplica a diseños de alto nivel y detallados. Aunque hoy aparece como `Inactive-Reserved`, sigue siendo una referencia util para distinguir documentacion de diseño.
- **ISO/IEC/IEEE 42010** sirve como apoyo para separar descripciones arquitectonicas de artefactos de analisis.

## Estructura recomendada

```text
docs/
  analisis/
    glosario/
    requerimientos/
      funcionales/
      no-funcionales/
    casos-de-uso/
      COM/
      EVT/
    modelos-del-problema/
      bpmn/
      casos-de-uso/
    reglas-de-negocio/
  diseño/
    decisiones/
    comportamiento/
      secuencia/
      colaboracion/
    arquitectura/
  soporte/
    meetings/
    workflow/
    prompts/
  entregas/
```

## Observaciones clave

- La carpeta actual `docs/diseño/requerimientos` deberia pasar completa a `docs/analisis/requerimientos`.
- La carpeta actual `docs/diseño/casos de uso` deberia pasar a `docs/analisis/casos-de-uso`.
- El glosario tambien pertenece a analisis.
- El diagrama de casos de uso y los BPMN pertenecen a analisis, no a diseño.
- Los diagramas de secuencia y colaboracion si pertenecen a diseño.
- El `DDR-01` pertenece a diseño porque registra una decision sobre la solucion documental y el modelado del sistema.
- `meetings`, `workflow` y `prompts` deben quedar fuera de la separacion analisis/diseño; conviene moverlos bajo `docs/soporte`.
- Varios casos de uso contienen detalles de solucion. Su lugar sigue siendo analisis, pero conviene depurarlos para quitar decisiones de implementacion y dejar esas decisiones en diseño.

## Tabla de clasificacion por artefacto

| Artefacto actual                                                                                                                              | Clasificacion propuesta | Destino sugerido                                   | Motivo                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `docs/diseño/glosario/Definiciones.md`                                                                                                        | Analisis                | `docs/analisis/glosario/`                          | Define vocabulario del dominio.                                               |
| `docs/diseño/casos de uso/CU-Plantilla.md`                                                                                                    | Analisis                | `docs/analisis/casos-de-uso/`                      | Es plantilla para especificacion de casos de uso.                             |
| `docs/diseño/casos de uso/COM/CU-COM-001 Asignación de conversaciones de un bot a un operador humano.md`                                      | Analisis                | `docs/analisis/casos-de-uso/COM/`                  | Caso de uso orientado a comportamiento esperado.                              |
| `docs/diseño/casos de uso/COM/CU-COM-002 Flujo de la conversación entre el Cliente potencial y el Bot.md`                                     | Analisis                | `docs/analisis/casos-de-uso/COM/`                  | Describe interaccion actor-sistema.                                           |
| `docs/diseño/casos de uso/COM/CU-COM-003 Gestion de bancos de contexto.md`                                                                    | Analisis                | `docs/analisis/casos-de-uso/COM/`                  | Por tipo de artefacto es caso de uso, aunque hoy mezcla detalles de solucion. |
| `docs/diseño/casos de uso/COM/CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito.md`                               | Analisis                | `docs/analisis/casos-de-uso/COM/`                  | Especifica objetivo, flujo y reglas del negocio.                              |
| `docs/diseño/casos de uso/COM/CU-COM-005 Calificación automática y gestión de etapa comercial.md`                                             | Analisis                | `docs/analisis/casos-de-uso/COM/`                  | Caso de uso derivado de requerimientos funcionales.                           |
| `docs/diseño/casos de uso/COM/CU-COM-006 Gestión de notificaciones de reactivación.md`                                                        | Analisis                | `docs/analisis/casos-de-uso/COM/`                  | Describe servicio esperado desde la perspectiva funcional.                    |
| `docs/diseño/casos de uso/EVT/CU-EVT-001 Registro en lista de espera.md`                                                                      | Analisis                | `docs/analisis/casos-de-uso/EVT/`                  | Caso de uso del dominio de eventos.                                           |
| `docs/diseño/casos de uso/EVT/CU-EVT-002 Gestión de cancelación.md`                                                                           | Analisis                | `docs/analisis/casos-de-uso/EVT/`                  | Define flujo funcional, no solucion tecnica.                                  |
| `docs/diseño/casos de uso/EVT/CU-EVT-003 Gestión de cupos de eventos.md`                                                                      | Analisis                | `docs/analisis/casos-de-uso/EVT/`                  | Modela comportamiento funcional esperado.                                     |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-01 Asignación de conversaciones de un canal de comunicación a Bot.md`                      | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-02 Gestión de etapa comercial y calificación automática de leads.md`                       | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional central del dominio comercial.                        |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-03 Captura y gestión de datos de la persona interesada desde conversaciones multicanal.md` | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-04 El Bot debe mostrar el listado de eventos disponibles.md`                               | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-05 El Bot debe proporcionar información detallada de cada evento.md`                       | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-06 El Bot debe informar fechas de inicio y horarios disponibles.md`                        | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md`                                                    | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional y regulatorio.                                        |
| `docs/diseño/requerimientos/funcionales/COM/RF-COM-08 Gestión de notificaciones de reactivación outbound.md`                                  | Analisis                | `docs/analisis/requerimientos/funcionales/COM/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/EVT/RF-EVT-01 Verificacion de disponibilidad de cupo.md`                                              | Analisis                | `docs/analisis/requerimientos/funcionales/EVT/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/EVT/RF-EVT-02 Reservacion de vacante durante proceso de venta.md`                                     | Analisis                | `docs/analisis/requerimientos/funcionales/EVT/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/EVT/RF-EVT-03 Notificacion de usuarios ante una liberacion de cupo.md`                                | Analisis                | `docs/analisis/requerimientos/funcionales/EVT/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/EVT/RF-EVT-04 Bloqueo de vacantes despues de confirmacion de pago.md`                                 | Analisis                | `docs/analisis/requerimientos/funcionales/EVT/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/EVT/RF-EVT-05 Gestion de inscripciones extemporaneas.md`                                              | Analisis                | `docs/analisis/requerimientos/funcionales/EVT/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/funcionales/EVT/RF-EVT-06 Gestion de lista de espera.md`                                                          | Analisis                | `docs/analisis/requerimientos/funcionales/EVT/`    | Requerimiento funcional.                                                      |
| `docs/diseño/requerimientos/no funcionales/RNF-01 Interacción entre los actores del sistema y la base de datos.md`                            | Analisis                | `docs/analisis/requerimientos/no-funcionales/`     | Requerimiento no funcional.                                                   |
| `docs/diseño/requerimientos/no funcionales/RNF-02 Rendimiento del bot.md`                                                                     | Analisis                | `docs/analisis/requerimientos/no-funcionales/`     | Requerimiento no funcional.                                                   |
| `docs/diseño/requerimientos/no funcionales/RNF-03 Claridad de mensajes del bot.md`                                                            | Analisis                | `docs/analisis/requerimientos/no-funcionales/`     | Requerimiento no funcional.                                                   |
| `docs/diseño/requerimientos/no funcionales/RNF-04 Continuidad de la conversación.md`                                                          | Analisis                | `docs/analisis/requerimientos/no-funcionales/`     | Requerimiento no funcional.                                                   |
| `docs/diseño/requerimientos/no funcionales/RNF-05 Disponibilidad del sistema.md`                                                              | Analisis                | `docs/analisis/requerimientos/no-funcionales/`     | Requerimiento no funcional.                                                   |
| `docs/diseño/requerimientos/no funcionales/RNF-XX Plantilla.md`                                                                               | Analisis                | `docs/analisis/requerimientos/no-funcionales/`     | Plantilla para especificar NFR.                                               |
| `docs/diseño/modelos de diseño/Diagrama de casos de uso.png`                                                                                  | Analisis                | `docs/analisis/modelos-del-problema/casos-de-uso/` | El modelo de casos de uso pertenece a ingenieria de requerimientos.           |
| `docs/diseño/modelos de diseño/BPMNs.md`                                                                                                      | Analisis                | `docs/analisis/modelos-del-problema/bpmn/`         | Documenta procesos del negocio y trazabilidad con casos de uso.               |
| `docs/diseño/modelos de diseño/BPMN-001.svg`                                                                                                  | Analisis                | `docs/analisis/modelos-del-problema/bpmn/`         | BPMN del proceso de negocio, no diseño interno del software.                  |
| `docs/diseño/modelos de diseño/diagrama-secuencia.md`                                                                                         | Diseño                  | `docs/diseño/comportamiento/secuencia/`            | Describe interacciones temporales entre elementos de la solucion.             |
| `docs/diseño/modelos de diseño/sequence-diagram-01-captacion-consentimiento-y-transicion-a-prospecto.svg`                                     | Diseño                  | `docs/diseño/comportamiento/secuencia/`            | Diagrama de secuencia.                                                        |
| `docs/diseño/modelos de diseño/sequence-diagram-02-inscripcion-reserva-temporal-sql-y-confirmacion.svg`                                       | Diseño                  | `docs/diseño/comportamiento/secuencia/`            | Diagrama de secuencia.                                                        |
| `docs/diseño/modelos de diseño/sequence-diagram-03-lista-de-espera-y-notificacion-por-liberacion-de-vacante.svg`                              | Diseño                  | `docs/diseño/comportamiento/secuencia/`            | Diagrama de secuencia.                                                        |
| `docs/diseño/modelos de diseño/sequence-diagram-04-cancelacion-pre-inicio-e-inscripcion-extemporanea.svg`                                     | Diseño                  | `docs/diseño/comportamiento/secuencia/`            | Diagrama de secuencia.                                                        |
| `docs/diseño/modelos de diseño/diagrama-colaboracion.md`                                                                                      | Diseño                  | `docs/diseño/comportamiento/colaboracion/`         | Describe colaboracion entre objetos o componentes de la solucion.             |
| `docs/diseño/modelos de diseño/collaboration-diagram-01-captacion-hasta-cierre-ganado.svg`                                                    | Diseño                  | `docs/diseño/comportamiento/colaboracion/`         | Diagrama de colaboracion.                                                     |
| `docs/diseño/modelos de diseño/collaboration-diagram-02-colaboracion-de-excepciones.svg`                                                      | Diseño                  | `docs/diseño/comportamiento/colaboracion/`         | Diagrama de colaboracion.                                                     |
| `docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md`                                                                   | Diseño                  | `docs/diseño/decisiones/`                          | Registro de decision de diseño y alineacion de la solucion documental.        |
| `docs/meetings/resumenes/rsm-05-03-alineacion-requerimientos-y-diagramas.md`                                                                  | Soporte                 | `docs/soporte/meetings/resumenes/`                 | Evidencia y contexto de trabajo, no artefacto base de analisis o diseño.      |
| `docs/meetings/resumenes/rsm-12-03-revision-del-sprint-y-gestion-del-repo.md`                                                                 | Soporte                 | `docs/soporte/meetings/resumenes/`                 | Gestion del equipo.                                                           |
| `docs/meetings/resumenes/rsm-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md`                                                     | Soporte                 | `docs/soporte/meetings/resumenes/`                 | Seguimiento de proceso.                                                       |
| `docs/meetings/resumenes/rsm-26-03-Refinamiento de RF, trazabilidad y adopción de BPMN.md`                                                    | Soporte                 | `docs/soporte/meetings/resumenes/`                 | Minuta de trabajo y decisiones de seguimiento.                                |
| `docs/meetings/transcripciones/trs-05-03-alineacion-requerimientos-y-diagramas.md`                                                            | Soporte                 | `docs/soporte/meetings/transcripciones/`           | Registro de reunion.                                                          |
| `docs/meetings/transcripciones/trs-12-03-revision-de-sprint-y-gestion-del-repo.md`                                                            | Soporte                 | `docs/soporte/meetings/transcripciones/`           | Registro de reunion.                                                          |
| `docs/meetings/transcripciones/trs-19-03-analisis-de-actividad-semanal-y-mejora-del-proceso.md`                                               | Soporte                 | `docs/soporte/meetings/transcripciones/`           | Registro de reunion.                                                          |
| `docs/meetings/transcripciones/trs-26-03- Refinamiento de RF, trazabilidad y adopción de BPMN.md`                                             | Soporte                 | `docs/soporte/meetings/transcripciones/`           | Registro de reunion.                                                          |
| `docs/workflow/pipeline-operativo.md`                                                                                                         | Soporte                 | `docs/soporte/workflow/`                           | Proceso de trabajo del equipo.                                                |
| `docs/workflow/issues_templates/milestone_template.md`                                                                                        | Soporte                 | `docs/soporte/workflow/issues_templates/`          | Plantilla operativa.                                                          |
| `docs/workflow/issues_templates/psd_template.md`                                                                                              | Soporte                 | `docs/soporte/workflow/issues_templates/`          | Plantilla operativa.                                                          |
| `docs/workflow/issues_templates/sprint_template.md`                                                                                           | Soporte                 | `docs/soporte/workflow/issues_templates/`          | Plantilla operativa.                                                          |
| `docs/workflow/issues_templates/weekly_template.md`                                                                                           | Soporte                 | `docs/soporte/workflow/issues_templates/`          | Plantilla operativa.                                                          |
| `docs/workflow/operative_templates/commit_message_guide.md`                                                                                   | Soporte                 | `docs/soporte/workflow/operative_templates/`       | Guia operativa del repositorio.                                               |
| `docs/workflow/operative_templates/guide_pull_request_template.md`                                                                            | Soporte                 | `docs/soporte/workflow/operative_templates/`       | Guia operativa del repositorio.                                               |
| `docs/prompts/actividad-individual-reporte.prompt.md`                                                                                         | Soporte                 | `docs/soporte/prompts/`                            | Prompt de apoyo para trabajo del equipo.                                      |
| `docs/prompts/reporte-mensual-avanzado.prompt.md`                                                                                             | Soporte                 | `docs/soporte/prompts/`                            | Prompt de apoyo para trabajo del equipo.                                      |

## Lectura ejecutiva

Si el objetivo es separar con claridad analisis y diseño, la correccion mas importante es esta:

1. Todo `RF`, `RNF`, `CU`, `glosario`, `BPMN` y `diagrama de casos de uso` debe salir de la carpeta `diseño`.
2. En `diseño` deberian quedar solo decisiones, arquitectura y diagramas de comportamiento de la solucion.
3. `meetings`, `workflow`, `prompts` y `entregas` deben vivir como documentacion de soporte, fuera de la division analisis/diseño.

## Actualizacion para mapa de nodos

Al construir el mapa inicial del repositorio se detectaron artefactos que no estaban cubiertos por la tabla original o que fueron agregados despues de la reestructuracion inicial.

| Artefacto actual                                                                                   | Clasificacion propuesta | Nodo sugerido                         | Motivo                                                                 |
| -------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `docs/analisis/reglas de negocio/README.md`                                                        | Analisis                | `DOM-RN-COM` / `DOM-RN-EVT`           | Define criterio y convencion para reglas de negocio.                   |
| `docs/analisis/reglas de negocio/RN-Plantilla.md`                                                  | Analisis                | `RN-PLANTILLA`                        | Plantilla para reglas de negocio.                                      |
| `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md`                                          | Analisis                | `RN-COM-CATALOG`                      | Catalogo normativo de reglas comerciales.                              |
| `docs/analisis/reglas de negocio/EVT/catalogo-rn-evt.md`                                          | Analisis                | `RN-EVT-CATALOG`                      | Catalogo normativo de reglas de eventos.                               |
| `docs/diseño/decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md`                     | Diseño                  | `DDR-02`                              | Decision arquitectonica que conecta documentacion con codigo futuro.    |
| `docs/soporte/entregas/**`                                                                         | Soporte                 | `SUP-ENTREGAS`                        | Evidencia de avance, reportes y bitacoras.                             |
| `utils/scripts/generate-individual-activity-summary.ps1`                                           | Soporte                 | `SUP-SCRIPT-ACTIVITY-SUMMARY`         | Automatizacion para reportes individuales.                             |
| `utils/scripts/generate-monthly-report-context.ps1`                                                | Soporte                 | `SUP-SCRIPT-MONTHLY-REPORT-CONTEXT`   | Automatizacion para contexto de reportes mensuales.                    |
| `utils/contradicciones-cus.md`                                                                     | Soporte                 | `SUP-UTILS-CONTRADICCIONES-CU`        | Analisis auxiliar para depuracion de casos de uso.                     |
| `utils/estrategia de implementacion chat.md`                                                       | Soporte                 | `SUP-UTILS-ESTRATEGIA-IMPLEMENTACION` | Insumo tecnico auxiliar usado por `DDR-02`.                            |
| `utils/guia-depuracion-de-casos-de-uso.md`                                                        | Soporte                 | `SUP-UTILS-GUIA-DEPURACION-CU`        | Guia operativa para mejorar casos de uso.                              |
| `utils/reporte de desajuste de arterfactos con implementacion.md`                                  | Soporte                 | `SUP-UTILS-DESAJUSTE-IMPLEMENTACION`  | Reporte auxiliar para alinear artefactos con implementacion.           |
| `docs/soporte/mapa-nodos/**`                                                                       | Soporte                 | `SUP-MAPA-NODOS`                      | Capa de navegacion para agentes de IA y futura trazabilidad con `src/`. |

El mapa vivo queda en `docs/soporte/mapa-nodos/` y debe actualizarse cada vez que se agregue un RF, RNF, CU, RN, DDR, diagrama relevante o modulo bajo `src/`.
