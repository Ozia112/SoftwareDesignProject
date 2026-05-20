# Guia de depuracion de casos de uso

## Base de referencia

- **SWEBOK v4** separa `Software Requirements` de `Software Design`.
- **ISO/IEC/IEEE 29148:2018** ubica casos de uso, restricciones y requisitos dentro de analisis y especificacion de requerimientos.
- **ISO/IEC/IEEE 15289** permite separar los information items en varios documentos especializados.
- **IEEE 1016** define la descripcion de diseño de software para lo que ya expresa solucion.
- **ISO/IEC/IEEE 42010** ayuda a mover a diseño lo relativo a arquitectura y comportamiento interno.

## Regla principal

Un **caso de uso** es un artefacto de **analisis** cuando describe:

- un objetivo de un actor externo,
- interacciones visibles entre actor y sistema,
- precondiciones y resultados observables,
- reglas del negocio referenciadas, no implementadas.

Un documento deja de comportarse como caso de uso y pasa a ser **diseño** cuando describe principalmente:

- colaboracion entre componentes internos,
- señales, eventos tecnicos o banderas internas,
- algoritmos, tablas de transicion o formulas,
- escritura en repositorios, logs, colas, locks o timeouts,
- contratos internos o comportamiento de servicios del sistema.

## Como decidir si el documento sigue siendo CU

Pregunta de control:

1. Si el titulo puede leerse como una meta del actor, normalmente sigue siendo analisis.
2. Si el titulo describe un mecanismo interno del sistema, probablemente ya no es CU sino diseño o especificacion suplementaria.

Ejemplos:

- `Registrar en lista de espera` si es meta del actor: analisis.
- `Gestion de bancos de contexto` como servicio interno: diseño o artefacto mixto a dividir.
- `Gestion de etapa comercial y calificacion` si se define por señales internas y recalculo continuo: mixto; conviene dividir.

## Clasificacion recomendada de los CUs actuales

| Documento actual | Categoria recomendada | Decision         | Que depurar                                                                                                                                                            |
| ---------------- | --------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CU-COM-001`     | Analisis              | Mantener como CU | Sacar logs, cola de espera, bandera de escalamiento, mecanica de reasignacion tecnica.                                                                                 |
| `CU-COM-002`     | Analisis              | Mantener como CU | Sacar activaciones internas, reducciones de etapa, liberacion tecnica de cupo, estado `hold`, detalles de orquestacion.                                                |
| `CU-COM-003`     | Diseño o split        | Dividir          | En analisis dejar solo el concepto de fuente oficial de informacion; mover operaciones de lectura/escritura, paquetes, timestamps y operaciones de escritura a diseño. |
| `CU-COM-004`     | Analisis              | Mantener como CU | Sacar texto exacto del mensaje si no es juridicamente obligatorio, reintentos de registro, logs y recuperacion tecnica.                                                |
| `CU-COM-005`     | Mixto                 | Dividir          | En analisis dejar politica de etapa y calificacion; mover señales, tabla de transiciones, penalizaciones, exploit detection, floor/ceiling, logs y recalculo a diseño. |
| `CU-COM-006`     | Analisis              | Mantener como CU | Sacar señales internas, filtros tecnicos, escrituras de desuscripcion, anti-spam implementado, logs por destinatario.                                                  |
| `CU-EVT-001`     | Analisis              | Mantener como CU | Sacar consultas tecnicas, mecanismo de ranking y calculo exacto de posicion si se formaliza como algoritmo.                                                            |
| `CU-EVT-002`     | Analisis              | Mantener como CU | Sacar actualizacion tecnica de cupo, disparo tecnico de notificacion, logs y manejo tecnico de errores.                                                                |
| `CU-EVT-003`     | Mixto                 | Dividir          | En analisis dejar objetivo de inscripcion; mover reserva temporal, bloqueo definitivo, expiracion, sincronizacion de cupos y estados operativos a diseño.              |

## Que se queda en analisis y que se mueve a diseño

| Seccion del CU      | Se queda en analisis                          | Se mueve a diseño                                                                                    |
| ------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Objetivo            | Valor para actor y resultado esperado         | Objetivo tecnico del servicio o componente                                                           |
| Alcance             | Limites funcionales del proceso               | Limites de modulo, servicio o subsistema                                                             |
| Actores             | Persona, operador, sistema externo            | Bot, motor de reglas, cola, repositorio, servicio interno como actores principales                   |
| Disparador          | Evento de negocio observable                  | Señales internas, banderas, webhooks, cron, timeouts tecnicos                                        |
| Pre/Postcondiciones | Estado de negocio verificable                 | Estados internos de persistencia, locks, caches, logs                                                |
| Flujo principal     | Dialogo actor-sistema en caja negra           | Llamadas entre componentes, pasos de BD, algoritmo detallado, serializacion, compensaciones tecnicas |
| Alternos/Excepcion  | Variantes del proceso y resultados de negocio | Retries, rollback tecnico, logging, persistencia parcial, manejo de errores de infraestructura       |
| Reglas de negocio   | Solo referencia a IDs de catalogo             | Formula, tabla de decision tecnica, algoritmo, politicas de scheduler                                |
| Datos relevantes    | Entradas y salidas conceptuales               | Payloads, campos fisicos, columnas, estructuras JSON, tablas                                         |
| Observaciones       | Supuestos funcionales o de alcance            | Notas de implementacion, tuning, optimizaciones, deuda tecnica                                       |

## Documentos que conviene crear o consolidar

### En analisis

- `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md`
- `docs/analisis/reglas de negocio/EVT/catalogo-rn-evt.md`
- `docs/analisis/glosario/Definiciones.md`
- `docs/analisis/modelos del problema/estado/modelo-de-etapas-comerciales.md`
- `docs/analisis/modelos del problema/estado/modelo-de-estados-operativos-de-inscripcion.md`
- `docs/analisis/trazabilidad/matriz-cu-rf-rn.md`

### En diseño

- `docs/diseño/comportamiento/especificacion-servicio-bancos-de-contexto.md`
- `docs/diseño/comportamiento/especificacion-motor-etapa-comercial-y-calificacion.md`
- `docs/diseño/comportamiento/especificacion-gestion-de-cupos-e-inscripciones.md`
- `docs/diseño/arquitectura/contratos/contrato-operaciones-de-contexto.md`
- `docs/diseño/comportamiento/estado/tabla-de-transiciones-comerciales.md`
- `docs/diseño/comportamiento/estado/tabla-de-estados-operativos-de-cupo.md`

## Regla practica para crear documentos derivados

Crear un documento de diseño derivado cuando en un CU aparezca cualquiera de estos sintomas:

- nombres de señales internas como `evento_cambiado` o `exploit_reincidente`,
- formulas, puntuaciones, rangos o bonificaciones,
- estados tecnicos como `hold`, `temporal`, `bloqueado`, `reintento`,
- operaciones sobre BD, banco de contexto, cola, logs o timestamps,
- multiples componentes internos colaborando para cumplir un paso.

## Plantilla de depuracion por CU

1. Identificar el objetivo del actor.
2. Extraer todas las reglas normativas al catalogo de reglas.
3. Marcar cada paso del flujo como `observable por actor` o `interno de solucion`.
4. Conservar en el CU solo los pasos observables y el resultado funcional.
5. Mover lo interno a uno o mas artefactos de diseño.
6. Reemplazar la seccion de reglas por una lista de IDs.
7. Revisar que los actores principales sean externos al sistema.
8. Confirmar que el CU responda a “que logra el actor” y no a “como funciona el sistema”.

## Checklist de salida

- El CU ya no contiene texto completo de reglas de negocio.
- El CU no usa componentes internos como actor principal.
- El CU no contiene algoritmos, tablas de decision tecnica ni detalles de persistencia.
- Las reglas referenciadas existen en el catalogo correspondiente.
- Si hubo comportamiento interno complejo, existe un documento derivado en `docs/diseño/`.
