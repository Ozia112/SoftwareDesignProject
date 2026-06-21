# Bitácora de tareas - Ortiz Isaac

---

## 5 – 11 de junio de 2026

Reestructuración del grafo documental para navegación por agentes (capacidades CAP-\*, facetas de servicios/tool calls, vocabulario de relaciones), script de cobertura documentación↔grafo conectado a CI, y primeras piezas de observabilidad en tiempo real para la demo (visualizador de grafo, GUI con polling agrupado por sesión, y stream SSE de eventos de conversación).

- El grafo documental (`docs/soporte/mapa-nodos/nodos-docs.yaml`) usaba relaciones genéricas (`traces_to`, `implements_future`) y carecía de una capa de capacidades que agrupara RF/CU/RN/DDR/diagramas/SRC por funcionalidad de negocio, obligando a los agentes a hacer múltiples búsquedas especulativas para resolver preguntas difusas ("reserva de cupo", "handoff"):  
  Se introdujo una taxonomía de tags (`area:*`, `domain:*`, `kind:*`, `capability:*`), aliases con sinónimos reales, siete nodos `CAP-*` bajo `DOM-CAPABILITIES` (`CAP-EVT-QUOTA`, `CAP-EVT-WAITLIST`, `CAP-EVT-CANCELLATION`, `CAP-COM-COMMERCIAL-STAGE`, `CAP-COM-CONTEXT-BANK`, `CAP-COM-HANDOFF`, `CAP-ORQ-TOOL-CALLS`), descomposición de los catálogos `RN-COM`/`RN-EVT` en reglas individuales con nodo propio, `AREA-DEMO`/`DEMO-EVT-CONT-01` como fixture, y `SUP-WORKFLOW-TEMPLATES` como `virtual-group`. `build-graph.py` agrega relaciones específicas (`satisfies`, `covers`, `applies_to`, `modeled_by`/`models`, `validated_by`, `exercises`, `planned_in`), los índices `by_service`/`by_tool_call`, y `SEARCH_STOPWORDS`.  
  **Decisiones:**
  - [X] [docs/soporte/mapa-nodos/nodos-docs.yaml](/docs/soporte/mapa-nodos/nodos-docs.yaml) — taxonomía de tags, aliases, nodos `CAP-*`, descomposición de RN-COM/RN-EVT en reglas individuales, `AREA-DEMO`/`DEMO-EVT-CONT-01`, `SUP-WORKFLOW-TEMPLATES` como virtual-group. — **Modificado:** 09 / 06 / 2026
  - [X] [build-graph.py](/build-graph.py) — relaciones `satisfies`/`covers`/`applies_to`/`modeled_by`/`validated_by`/`exercises`/`planned_in`, índices `by_service`/`by_tool_call`, `SEARCH_STOPWORDS`. — **Modificado:** 09 / 06 / 2026
  - [X] `.graph/{nodes,edges,adjacency,reverse_adjacency,search_index}.json` — regenerados a partir del nuevo `nodos-docs.yaml`. — **Regenerado:** 09 / 06 / 2026
  - **Commit relacionado:** `670411a` — feat(grafo): tags/aliases, capacidades CAP-* , vocabulario de relaciones y facetas de servicio
  - **Co-autoría:** Claude Sonnet 4.6.

- `AGENTS.md` y `docs/soporte/mapa-nodos/{README,relaciones-operativas}.md` seguían describiendo el esquema anterior (relaciones genéricas, sin CAP-*, sin facetas `by_service`/`by_tool_call`), por lo que el cambio del punto anterior no se aprovechaba en la práctica, y no existía forma de detectar documentación de `docs/analisis`/`docs/diseño` sin nodo dedicado:  
  **Decisiones:**
  - [X] [AGENTS.md](/AGENTS.md) — sección "Graph Query Strategy" reescrita con facetas (`terms`, `by_type`, `by_tag`, `by_status`, `by_path`, `by_service`, `by_tool_call`); nueva sección "Capability-First Navigation (CAP-*)"; tabla de relaciones con reversas; tabla de dominio con `AREA-DEMO`; nueva sección de cobertura documental. — **Modificado:** 09 / 06 / 2026
  - [X] [docs/soporte/mapa-nodos/README.md](</docs/soporte/mapa-nodos/README.md>) — taxonomía de tags, tabla de tipos de nodo (`capability`, `business-rule`), tabla de relaciones, flujo de uso en 7 pasos (CAP-* primero), convenciones de IDs actualizadas, sección de cobertura. — **Modificado:** 09 / 06 / 2026
  - [X] [docs/soporte/mapa-nodos/relaciones-operativas.md](</docs/soporte/mapa-nodos/relaciones-operativas.md>) — recorridos "Resolver una pregunta difusa o de negocio (CAP-* primero)" y "Resolver un servicio o tool call concreto"; recorridos COM/EVT actualizados a `satisfied_by`/`applies_to`/`governed_by`. — **Modificado:** 09 / 06 / 2026
  - [X] [scripts/check_doc_coverage.py](/scripts/check_doc_coverage.py) — nuevo: clasifica `docs/**/*.md` como mapeado / cubierto por carpeta / sin nodo; `--strict-core` falla si `docs/analisis/**` o `docs/diseño/**` carecen de nodo exacto. — **Creado:** 09 / 06 / 2026
  - [X] [.github/workflows/ci-docs.yml](/.github/workflows/ci-docs.yml) — agrega paso "Check documentation graph coverage" (`python scripts/check_doc_coverage.py --strict-core`) como bloqueante tras la verificación de staleness del grafo. — **Modificado:** 09 / 06 / 2026
  - **Commit relacionado:** `68879b6` — docs(grafo): realinear AGENTS.md y mapa-nodos al nuevo esquema, agregar chequeo de cobertura
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** la cobertura documentación↔grafo ahora es verificable automáticamente (48 documentos exactamente mapeados, 0 issues en `docs/analisis`/`docs/diseño`); `docs/soporte/**` (24 archivos) queda como informativo, sin bloquear CI. Sigue pendiente extender la validación a IDs mencionados dentro de los Markdown que no tengan nodo declarado, y crear nodos `SRC-*` reales por archivo cuando el código del orquestador se enlace al grafo.

- La demo carecía de una forma visual de explorar el grafo generado, y la GUI mezclaba estilos/scripts en un único `index.html`, sin agrupar conversaciones por sesión:  
  **Decisiones:**
  - [X] [visualize_repo_graph.py](/visualize_repo_graph.py) — nuevo: explorador interactivo de `.graph/` por consola para inspeccionar nodos y relaciones sin abrir los JSON manualmente. — **Creado:** 10 / 06 / 2026
  - [X] `demo/gui/{index.html,css/styles.css,js/*}` — polling y agrupación de sesiones, configuración separada y `nginx.conf` para servir la GUI estática. — **Modificado:** 10 / 06 / 2026
  - [X] `utils/Guion.md` y `docs/soporte/entregas/exposicion/guion_presentacion.md` — guion de trabajo y guion final para la exposición de la demo. — **Creado:** 10 / 06 / 2026
  - **Commit relacionado:** `81c65ab` — feat(demo,grafo,soporte): GUI demo con polling/sesiones, visualizador de grafo y guion de exposicion
  - **Co-autoría:** Claude Sonnet 4.6.

- El orquestador no exponía ningún canal en tiempo real: la GUI solo conocía el resultado de cada llamada HTTP a `/messages`, sin visibilidad de los tool calls, cambios de etapa o escalamientos que ocurren dentro del run loop del agente:  
  **Decisiones:**
  - [X] [src/conversation/conversation-events.service.ts](/src/conversation/conversation-events.service.ts) — nuevo `ConversationEventBusService`: un `Subject` de RxJS por conversación, con `getStream(convId)` (Observable) y `emit(convId, event)`; tipos de evento `tool_call`, `stage_change`, `escalation`, `bot_message`, `error`, `api_call`. — **Creado:** 10 / 06 / 2026
  - [X] [src/channels/webhook.controller.ts](/src/channels/webhook.controller.ts) — nuevo endpoint `@Sse('conversations/:convId/events')` que expone el stream; el handler de `/messages` emite `api_call` con el resultado del enrutamiento (etapa, score, tools ejecutadas). — **Modificado:** 10 / 06 / 2026
  - [X] [src/conversation/agent-runner.service.ts](/src/conversation/agent-runner.service.ts) — emite eventos `tool_call`, `stage_change`, `escalation`, `error` y `bot_message` durante el run loop. — **Modificado:** 10 / 06 / 2026
  - [X] [src/conversation/conversation.module.ts](/src/conversation/conversation.module.ts) — registra y exporta `ConversationEventBusService`. — **Modificado:** 10 / 06 / 2026
  - **Commit relacionado:** `02121fb` — feat(conversation): emitir eventos de conversacion via SSE
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** la GUI puede suscribirse a `/:tenantId/conversations/:convId/events` y recibir en vivo cada tool call, cambio de etapa, escalamiento, error y mensaje del bot, además del resumen de cada llamada al webhook. El bus de eventos vive en memoria del proceso (un `Map<string, Subject>` sin límite de tamaño ni expiración): no sobrevive a un reinicio/redeploy, no se replica entre réplicas del orquestador, y los `Subject` de conversaciones inactivas no se liberan (riesgo de fuga de memoria en una ejecución de larga duración). El endpoint SSE no tiene autenticación/autorización propia ni más aislamiento multi-tenant que el `convId`.

---

## 29 de mayo – 4 de junio de 2026

Refinamiento de la captura de datos del lead (señales granulares por dato en vez de un único evento agregado), endurecimiento del fallback de extracción de contacto, unificación del tratamiento de conversaciones en handoff, y modularización de la GUI/seed de la demo.

- `datos_de_contacto_completados` se emitía como una sola señal cuando el bot detectaba los tres datos (nombre, correo, teléfono) a la vez, lo que retrasaba la transición LEAD→MQL si el cliente los daba en mensajes separados, y `MessageRouterService` no tenía red de seguridad si el LLM olvidaba emitir el tool call:  
  **Decisiones:**
  - [X] [src/tools/handlers/emit-stage-signal.handler.ts](/src/tools/handlers/emit-stage-signal.handler.ts) — divide la señal agregada en `nombre_capturado` / `correo_capturado` / `numero_capturado`, emitidas en cuanto el bot detecta cada dato individualmente. — **Modificado:** 02 / 06 / 2026
  - [X] [src/conversation/message-router.service.ts](/src/conversation/message-router.service.ts) — fallback MQL: extrae email/teléfono del texto del usuario si el LLM omite el tool call; fuerza `pregunta_de_inscripcion_detectada` → `PROSPECTO` cuando los tres campos del lead ya están completos. — **Modificado:** 02 / 06 / 2026
  - [X] [src/commercial/commercial-stage.service.ts](/src/commercial/commercial-stage.service.ts) — ajustes de transición acordes a las señales granulares. — **Modificado:** 02 / 06 / 2026
  - **Commit relacionado:** `fd4ce20` — feat(mql,operator,demo): señales granulares por dato + conversaciones agrupadas + GUI modular
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** la calificación MQL avanza de forma incremental por cada dato capturado, y el sistema ya no depende exclusivamente de que el LLM emita un tool call para detectar intención de inscripción (hay un fallback textual). La extracción de email/teléfono por fallback es heurística (regex sobre el texto del usuario) y puede no cubrir formatos atípicos; el flag `isContextReview` evita que mensajes sintéticos de reactivación se persistan en Redis, pero todavía no hay pruebas automatizadas para estas rutas nuevas.

- Las conversaciones en `HANDOFF_PENDING` no se trataban igual que las que ya estaban `WITH_OPERATOR`, por lo que el operador podía perder visibilidad de mensajes del cliente mientras el handoff seguía pendiente; además `OperatorController` no ofrecía una vista agrupada por evento ni con prioridad:  
  **Decisiones:**
  - [X] [src/conversation/agent-runner.service.ts](/src/conversation/agent-runner.service.ts) — `HANDOFF_PENDING` se trata igual que `WITH_OPERATOR` para persistir mensajes del cliente en Redis; recuperación de respuesta vacía tras tool calls con un turno de seguimiento adicional. — **Modificado:** 02 / 06 / 2026
  - [X] [src/operator/operator.controller.ts](/src/operator/operator.controller.ts) — nuevo endpoint `GET conversations/all` agrupado por evento y con prioridad, inyectando `HandoffManager`, `AgentRunner` y `ConversationSessionStore`. — **Modificado:** 02 / 06 / 2026
  - [X] [src/conversation/session-store.service.ts](/src/conversation/session-store.service.ts) — TTL de sesión en Redis ampliado de 30 minutos a 24 horas para no perder contexto en pausas largas de demo. — **Modificado:** 02 / 06 / 2026
  - **Commit relacionado:** `fd4ce20` (mismo commit que el punto anterior)
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** el operador humano puede ver todas las conversaciones agrupadas por evento, con prioridad, incluyendo las que aún están en `HANDOFF_PENDING`. La extensión del TTL a 24h prioriza la continuidad de la demo sobre el uso de memoria de Redis (RNF-04 original especificaba 30 min); no hay todavía un mecanismo de limpieza diferenciado para sesiones de demo vs. producción.

- La GUI de demo (`index.html`) seguía siendo un archivo monolítico y el seed de eventos tenía los datos de los eventos hardcodeados en `seed.js`, dificultando agregar nuevos eventos de demo:  
  **Decisiones:**
  - [X] `demo/gui/{css/styles.css,js/*}` — estilos y scripts extraídos de `index.html` a `demo/gui/css/` y `demo/gui/js/` (`app.js`, `chat.js`, `config.js`, `operator.js`, `polling.js`, `sessions.js`, `ui.js`). — **Creado/Modificado:** 02 / 06 / 2026
  - [X] `demo/eventos/*.json` (`EVT-EXCEL-01.json`, `EVT-PBI-01.json`, `schema.evento.json`) — definiciones de eventos de demo en JSON, leídas por el seed en lugar de estar hardcodeadas. — **Creado:** 02 / 06 / 2026
  - [X] `demo/seed/seed.js` — refactor para leer `demo/eventos/*.json`. — **Modificado:** 02 / 06 / 2026
  - [X] `demo/docker-compose.yml` — Redis con persistencia AOF, volúmenes `redis_data`/`demo_logs` y mount de `demo/eventos`. — **Modificado:** 02 / 06 / 2026
  - **Commit relacionado:** `fd4ce20` (mismo commit)
  - **Co-autoría:** Claude Sonnet 4.6.

---

## 22 – 28 de mayo de 2026

Primer módulo de operador humano con escalación automática hacia/desde el bot, y exposición de información de depuración (`debugLog`, `handoffTriggered`) en la respuesta HTTP del webhook para diagnosticar el comportamiento del agente desde la demo.

- No existía ningún punto de entrada para que un operador humano gestionara el handoff bot→humano, y `AgentRunnerService` no escalaba automáticamente ante errores técnicos del LLM ni tras señales de pago detectadas por palabras clave; tampoco se refrescaba la lista de tools disponibles tras un cambio de etapa comercial:  
  **Decisiones:**
  - [X] `src/operator/{operator.controller.ts,operator.module.ts}` — nuevo `OperatorModule` con controlador de handoff (el operador toma/cierra conversaciones). — **Creado:** 28 / 05 / 2026
  - [X] [src/conversation/message-router.service.ts](/src/conversation/message-router.service.ts) — integra `HandoffManagerImpl`, fallback por palabras clave de pago, y scoring multi-etapa por turno. — **Modificado:** 28 / 05 / 2026
  - [X] [src/conversation/agent-runner.service.ts](/src/conversation/agent-runner.service.ts) — `debugLog` por tool call ejecutado, `escalateToHuman` ante error técnico del LLM, refresco de tools disponibles tras cambio de etapa. — **Modificado:** 28 / 05 / 2026
  - [X] [src/commercial/commercial-stage.service.ts](/src/commercial/commercial-stage.service.ts) — `skippedReason` en transiciones ignoradas; auto-`HANDOFF_PENDING` al alcanzar la etapa SQL. — **Modificado:** 28 / 05 / 2026
  - [X] [src/tools/handlers/emit-stage-signal.handler.ts](/src/tools/handlers/emit-stage-signal.handler.ts) — valida formato de correo electrónico; retorna error si la señal no es válida para la etapa actual. — **Modificado:** 28 / 05 / 2026
  - [X] [src/tools/tool-registry.service.ts](/src/tools/tool-registry.service.ts) — `reserve_quota` y `register_waiting_list` disponibles desde la etapa LEAD. — **Modificado:** 28 / 05 / 2026
  - [X] [src/channels/webhook.controller.ts](/src/channels/webhook.controller.ts) — expone `handoffTriggered` y `debugLog` en la respuesta HTTP de `/messages`. — **Modificado:** 28 / 05 / 2026
  - [X] [src/tenant/seed-events.controller.ts](/src/tenant/seed-events.controller.ts) — nuevo endpoint `POST /admin/reset-demo` para limpiar leads/sesiones/cupos en la demo. — **Creado:** 28 / 05 / 2026
  - [X] `demo/seed/seed.js` y `demo/gui/index.html` — system prompt refactorizado con reglas A-D más explícitas e IDs de eventos; badges de alerta y panel de operador en la GUI. — **Modificado:** 28 / 05 / 2026
  - [X] [.gitignore](/.gitignore) — corrige línea malformada (`.DS_Store` y `.claude/` separados) y excluye `demo/logs/`. — **Modificado:** 28 / 05 / 2026
  - **Commit relacionado:** `1ff344b` — feat(operator,handoff): módulo operador + escalación automática + debug log en respuesta HTTP
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** el sistema puede escalar una conversación a un operador humano automáticamente (por error técnico del LLM, por llegar a la etapa SQL, o por petición del bot), y un panel de operador en la GUI puede tomarla. La respuesta del webhook ahora incluye `debugLog`/`handoffTriggered`, útil para depurar la demo, pero esa información de depuración viaja en la misma respuesta HTTP que recibe el cliente final — aceptable para demo, no para producción multi-tenant donde expondría detalles internos del agente. `reserve_quota`/`register_waiting_list` ya están disponibles desde LEAD, antes de que el lead complete sus datos de contacto, lo que amplía la superficie de uso de cupos sin que exista todavía una limitación explícita de abuso por usuarios anónimos en esa etapa.

---

## 15 – 21 de mayo de 2026

Semana de implementación masiva: primera versión completa del orquestador NestJS (PSD-32 a PSD-37) sobre la base de DDR-02, reestructuración de la documentación a SWEBOK/IEEE con grafo documental para agentes, puesta en marcha de CI (código y documentación) y de un stack de demo dockerizado, seguidos de una ronda extensa de correcciones de arranque/DI/Docker/prompts que llevaron el sistema a un demo end-to-end funcional.

- Los diagramas de secuencia y colaboración no estaban alineados con los casos de uso vigentes (CU-COM-00x, CU-EVT-00x) y usaban nombres de archivo genéricos sin trazabilidad:  
  **Decisiones:**
  - [X] `docs/diseño/modelos de diseño/diagrama-secuencia.md` y nuevo `diagrama-colaboracion.md` — reescritos para alinear cada diagrama con su CU; se agregan 4 diagramas de secuencia (`sequence-diagram-01..04`) y 2 de colaboración (`collaboration-diagram-01..02`) en SVG, eliminando los SVG genéricos anteriores (`diagrama_de_colaboracion.svg`, `diagrama_de_secuencia_1..3.svg`). — **Modificado/Creado:** 19 / 05 / 2026
  - [X] [`CU-EVT-003 Gestión de cupos de eventos.md`](</docs/diseño/casos de uso/EVT/CU-EVT-003 Gestión de cupos de eventos.md>) — referencias actualizadas a los nuevos diagramas. — **Modificado:** 19 / 05 / 2026
  - **Commit relacionado:** `0451936` — fix(docs): Se corrigieron diagramas de colaboracion y secuencia para mejorar su alineacion con los casos de uso

- La documentación no seguía una separación clara entre análisis, diseño y soporte (SWEBOK v4 / IEEE), las reglas de negocio vivían embebidas dentro de los CU, y existían artefactos de soporte duplicados o en rutas inconsistentes (`docs/soporte/utils`, `docs/soporte/scripts`, plantillas de workflow):  
  **Decisiones:**
  - [X] `docs/analisis/`, `docs/diseño/`, `docs/soporte/` — reorganización integral por dominio SWEBOK/IEEE; reglas de negocio extraídas de los CU hacia su propia carpeta (`reglas de negocio/COM`, `reglas de negocio/EVT`); plantillas de workflow movidas a `docs/soporte/workflow/{issues_templates,operative_templates}`; `pipeline-operativo.md` movido a `docs/soporte/workflow/`. — **Modificado:** 19 / 05 / 2026
  - [X] `docs/soporte/utils/{estrategia de implementacion chat.md, notas.md, reestructuracion-analisis-diseno.md, ...desajuste de artefactos con implementacion.md}` — nuevos documentos de estrategia/notas de la reestructuración. — **Creado:** 19 / 05 / 2026
  - [X] `docs/analisis/guia-depuracion-de-casos-de-uso.md`, `docs/soporte/prompts/actividad-individual-reporte.prompt.md`, `docs/soporte/utils/notas.md`, `scripts/generate-individual-activity-summary.ps1` — eliminados/consolidados tras la reorganización (contenido fantasma o duplicado). — **Eliminado:** 19 / 05 / 2026
  - **Commits relacionados:** `92c1c3e` — feat(docs): refactor of docs folders and exclusion of bussiness rules form CUs to its own folder; `ab4b5eb` — Fine tunning of repository structure and documentation

- El repositorio no tenía ninguna capa de retrieval para agentes de código: cada tarea requería búsquedas amplias por `grep`/exploración manual, y no existía una guía de arquitectura de código para alinear la futura implementación de `src/` con DDR-02:  
  **Decisiones:**
  - [X] [AGENTS.md](/AGENTS.md), [CLAUDE.md](/CLAUDE.md), `CODEX.md` — política de búsqueda graph-first para agentes (orden obligatorio: `search_index.json` → `nodes.json` → `adjacency`/`reverse_adjacency` → documentos puntuales). — **Creado:** 20 / 05 / 2026
  - [X] [docs/soporte/mapa-nodos/nodos-docs.yaml](/docs/soporte/mapa-nodos/nodos-docs.yaml), [build-graph.py](/build-graph.py), [docs/soporte/mapa-nodos/README.md](</docs/soporte/mapa-nodos/README.md>), [docs/soporte/mapa-nodos/relaciones-operativas.md](</docs/soporte/mapa-nodos/relaciones-operativas.md>) — grafo documental inicial y su generador; `.graph/{nodes,edges,adjacency,reverse_adjacency,search_index}.json` generados por primera vez. — **Creado:** 20 / 05 / 2026
  - [X] [requirements.txt](/requirements.txt) — dependencia `PyYAML` para `build-graph.py`. — **Creado:** 20 / 05 / 2026
  - **Commit relacionado:** `9f3fdd6` — feat(docs): agregar grafo documental e instrucciones para agentes

- No existía un blueprint que tradujera DDR-02 a una estructura de carpetas/módulos concreta de NestJS antes de empezar a programar el orquestador, y DDR-02 / la estrategia de implementación tenían problemas de formato y claridad:  
  **Decisiones:**
  - [X] `docs/diseño/arquitectura/estructura-de-codigo.md` (nodo `ARCH-ESTRUCTURA-CODIGO`) — nuevo blueprint de la estructura de `src/` (módulos, servicios, DTOs) consistente con la tabla de servicios↔CU de DDR-02. — **Creado:** 20 / 05 / 2026
  - [X] `docs/diseño/decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md` — formato y legibilidad mejorados (encabezados, tablas). — **Modificado:** 20 / 05 / 2026
  - [X] `utils/estrategia de implementacion chat.md` — sección de diagnóstico de deudas documentales ajustada en formato y claridad. — **Modificado:** 20 / 05 / 2026
  - **Commits relacionados:** `1b682cf` — feat(docs): agregar blueprint de estructura de código; `8de8c41` — fix(docs): mejorar formato y legibilidad en decisiones arquitectónicas del orquestador; `a045c43` — fix(docs): ajustar formato y claridad en la sección de diagnóstico de deudas documentales

- El repositorio no tenía ningún pipeline de CI: ni para verificar que el código TypeScript compilara/pasara tests/lint, ni para validar la documentación Markdown:  
  **Decisiones:**
  - [X] [.github/workflows/ci-code.yml](/.github/workflows/ci-code.yml) — nuevo workflow de CI para el código TypeScript (lint, build, tests). — **Creado:** 20 / 05 / 2026
  - [X] [.github/workflows/ci-docs.yml](/.github/workflows/ci-docs.yml) — nuevo workflow de CI para documentación: regenera y verifica `.graph/`, corre `markdownlint`. — **Creado:** 20 / 05 / 2026
  - **Commit relacionado:** `2bb7986` — feat(ci): configure GitHub Actions workflows for TypeScript and Markdown documentation
  - **Capacidades y limitaciones (a esta fecha):** desde este commit cada PR/push valida automáticamente que `.graph/` esté sincronizado con `nodos-docs.yaml` y que el Markdown pase `markdownlint`; aún no existe ningún chequeo de cobertura documentación↔grafo (eso llegaría el 9 de junio).

- `markdownlint-cli2` fallaba sobre plantillas (`*Plantilla*.md`) y otros archivos Markdown de soporte que no siguen las convenciones de los documentos canónicos:  
  **Decisiones:**
  - [X] [.github/workflows/ci-docs.yml](/.github/workflows/ci-docs.yml) — exclusiones de `markdownlint-cli2` para plantillas y, en un segundo ajuste, para archivos Markdown adicionales de `docs/soporte/**`. — **Modificado:** 20 / 05 / 2026
  - **Commits relacionados:** `12766c6` — fix(ci): exclude specific Markdown template files from linting in CI workflow; `6bcb5c3` — fix(ci): exclude additional Markdown files from linting in CI workflow

- El proyecto no tenía configuración de formateo/lint compatible con `pnpm`/CI Ubuntu (line endings CRLF, ESLint sin flat config, `package-lock.json` de npm) ni una migración inicial de Prisma versionada:  
  **Decisiones:**
  - [X] [.gitattributes](/.gitattributes), [.prettierrc](/.prettierrc) — normalizan line endings a LF para `.ts`/`.json` y consistencia en CI Ubuntu. — **Creado/Modificado:** 20 / 05 / 2026
  - [X] [eslint.config.js](/eslint.config.js) — flat config de ESLint v9 + TypeScript. — **Creado:** 20 / 05 / 2026
  - [X] [package.json](/package.json) — script `format:check`; `package-lock.json` reemplazado por `pnpm-lock.yaml` (CI usa pnpm v10). — **Modificado:** 20 / 05 / 2026
  - [X] [.github/workflows/ci-code.yml](/.github/workflows/ci-code.yml) — paso de Jest corregido (`test:cov` en vez de `test -- --coverage`). — **Modificado:** 20 / 05 / 2026
  - [X] `prisma/migrations/20260520000000_init/` — primera migración SQL versionada del esquema Prisma. — **Creado:** 20 / 05 / 2026
  - [X] [.gitignore](/.gitignore) — agrega `.claude/`. — **Modificado:** 20 / 05 / 2026
  - **Commit relacionado:** `1ec169b` — fix(ci): compatibilidad pnpm, ESLint flat config, prettier LF y migración inicial

- El repositorio no tenía ningún código de aplicación: `src/` no existía. Toda la lógica de negocio descrita en CU-COM-00x/CU-EVT-00x y DDR-02 era solo documentación:  
  **Decisiones:**
  - [X] `package.json`, `tsconfig*.json`, `nest-cli.json`, [prisma/schema.prisma](/prisma/schema.prisma), [src/app.module.ts](/src/app.module.ts), [src/main.ts](/src/main.ts) — base del proyecto NestJS; esquema Prisma completo (`Lead`, `Conversation`, `Reservation`, `WaitingListEntry`, `StageHistory`, `AuditLog`, `Event`, `TenantConfig`, `TenantCredential`). (PSD-32) — **Creado:** 20 / 05 / 2026
  - [X] `src/tenant/{tenant-config.service.ts,tenant-credential.service.ts,tenant-context.middleware.ts,tenant-admin.controller.ts,prisma-system.service.ts}` — `TenantConfigService` (pool Prisma por tenant, caché Redis 5 min), `TenantCredentialService` (cifrado AES-256-GCM, rotación/revocación), `TenantContextMiddleware` (tenantId desde header/path). (PSD-33) — **Creado:** 20 / 05 / 2026
  - [X] [src/conversation/session-store.service.ts](/src/conversation/session-store.service.ts), [src/audit/audit-log.service.ts](/src/audit/audit-log.service.ts) — `ConversationSessionStore` (historial activo en Redis, TTL 30 min, RNF-04); `AuditLogService` (append-only, transaccional, transversal). (PSD-33) — **Creado:** 20 / 05 / 2026
  - [X] [src/commercial/commercial-stage.service.ts](/src/commercial/commercial-stage.service.ts), [src/commercial/scoring.service.ts](/src/commercial/scoring.service.ts), [src/commercial/consent.service.ts](/src/commercial/consent.service.ts) — `CommercialStageService` (máquina de estados LEAD→MQL→PROSPECTO→SQL→CIERRE), `ScoringService` (calificación 0-20, penalizaciones, detección de exploit reincidente), `ConsentService` (consentimiento tácito, CU-COM-004). (PSD-34) — **Creado:** 20 / 05 / 2026
  - [X] [src/context-bank/context-bank.service.ts](/src/context-bank/context-bank.service.ts), [src/events/quota.service.ts](/src/events/quota.service.ts), [src/events/waiting-list.service.ts](/src/events/waiting-list.service.ts), [src/events/cancellation.service.ts](/src/events/cancellation.service.ts) — `ContextBankService` (puerta única R/W, caché Redis, CU-COM-003), `QuotaService` (reserva atómica `SELECT FOR UPDATE`, idempotencia, CU-EVT-003), `WaitingListService` (orden score DESC + FIFO, Redis Sorted Set, CU-EVT-001), `CancellationService` (cancelación pre-inicio, libera cupo, CU-EVT-002). (PSD-34) — **Creado:** 20 / 05 / 2026
  - [X] `src/tools/handlers/*.ts` (8 handlers), [src/tools/tool-registry.service.ts](/src/tools/tool-registry.service.ts), [src/conversation/agent-runner.service.ts](/src/conversation/agent-runner.service.ts), [src/conversation/message-router.service.ts](/src/conversation/message-router.service.ts), [src/conversation/handoff-manager.service.ts](/src/conversation/handoff-manager.service.ts), [src/channels/webhook.controller.ts](/src/channels/webhook.controller.ts) — tool handlers con contrato DDR-02; `ToolRegistry` (filtrado de tools por etapa, OCP); `AgentRunner` (run loop del SDK de Anthropic con prompt caching, CU-COM-002); `MessageRouterService` (routing del webhook, creación de Lead/Conversation, CU-COM-001); `HandoffManagerImpl` (bot→operador, bloquea retorno en SQL); `WebhookController` (WhatsApp, Telegram, Web). (PSD-35) — **Creado:** 20 / 05 / 2026
  - [X] [src/notifications/reservation-expiry.processor.ts](/src/notifications/reservation-expiry.processor.ts), [src/notifications/notification.service.ts](/src/notifications/notification.service.ts), [src/notifications/outbound-notification.processor.ts](/src/notifications/outbound-notification.processor.ts) — `ReservationExpiryProcessor` (BullMQ, libera cupo al vencer TTL); `NotificationService` (N notificaciones por N vacantes, timeout 2h, retry 3x); `OutboundNotificationProcessor` (anti-spam 1/semana, valida consentimiento). (PSD-36) — **Creado:** 20 / 05 / 2026
  - [X] `src/observability/{metrics.service.ts,metrics.controller.ts,tracing.ts,observability.module.ts}`, [src/common/rate-limit.guard.ts](/src/common/rate-limit.guard.ts), [src/tenant/tenant-admin.controller.ts](/src/tenant/tenant-admin.controller.ts), [scripts/load-test.js](/scripts/load-test.js) — OpenTelemetry (OTLP HTTP), `MetricsService` (Prometheus: counters, gauges, histogramas P90/P99), `RateLimitGuard` (throttling por tenant con `Retry-After`), `TenantAdminController` (CRUD de config y credenciales cifradas), script de carga (50 usuarios concurrentes, RNF-02). (PSD-37) — **Creado:** 20 / 05 / 2026
  - **Commit relacionado:** `6f314b3` — feat(src): implementar orquestador NestJS completo (PSD-32 a PSD-37) — 66 archivos, +15134 líneas
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** al cierre de este commit el orquestador implementa de punta a punta el principio "el bot emite señales, el sistema ejecuta operaciones de dominio" de DDR-02: routing multi-canal/multi-tenant, máquina de etapas comerciales, scoring, banco de contexto, cupos/lista de espera/cancelación con consistencia atómica, 8 tool calls, handoff, notificaciones outbound y observabilidad básica (tracing, métricas, rate limiting). 16/16 tests unitarios pasan (`CommercialStage`, `Scoring`, `Quota`) y `npm run build` compila sin errores. Sin embargo, en este punto el sistema **nunca se había arrancado de extremo a extremo**: no existía `docker-compose` ni stack de demo todavía, por lo que persistían errores de arranque no detectados (DI, Prisma/pnpm, Redis, OpenTelemetry) que se descubrirían y corregirían en los días siguientes (ver más abajo). Tampoco existía aún ningún mecanismo en tiempo real (eso llegaría tres semanas después, el 10 de junio, con SSE).

- No existía ninguna forma de probar el orquestador de punta a punta (Postgres, Redis, seed de datos, canal de WhatsApp real, GUI) sin desplegar infraestructura externa:  
  **Decisiones:**
  - [X] `demo/{docker-compose.yml,Dockerfile,README.md,start.sh}` — stack aislado: PostgreSQL 16 + Redis 7 + orquestador + open-wa + nginx (GUI); un comando (`start.sh`) levanta todo; `README.md` documenta cómo eliminar `demo/` del repo sin afectar `src/`. — **Creado:** 20 / 05 / 2026
  - [X] `demo/seed/seed.js` — seed que inyecta el tenant "Academia Digital MX" y 3 eventos con horarios, precios, instructor, modalidad y cupos reales. — **Creado:** 20 / 05 / 2026
  - [X] `demo/open-wa-bridge/` — puente HTTP entre open-wa.org y el orquestador (escaneo de QR, WhatsApp real). — **Creado:** 20 / 05 / 2026
  - [X] `demo/gui/index.html` — landing de demo: vista cliente (chat en vivo), vista tenant (etapa comercial, métricas, configuración), panel de eventos con cupos, 7 escenarios predefinidos, terminal de logs y status bar (orquestador/Postgres/Redis/WhatsApp). — **Creado:** 20 / 05 / 2026
  - [X] [src/common/health.controller.ts](/src/common/health.controller.ts) — `GET /api/v1/health` para el healthcheck de Docker. — **Creado:** 20 / 05 / 2026
  - [X] [src/tenant/seed-events.controller.ts](/src/tenant/seed-events.controller.ts) — `POST /admin/seed-events` (solo demo). — **Creado:** 20 / 05 / 2026
  - **Commit relacionado:** `9e3a2d7` — feat(demo): stack de pruebas aislado — Docker, seed, open-wa bridge y GUI
  - **Co-autoría:** Claude Sonnet 4.6.

- El workflow de smoke test usaba `secrets: inherit` (válido solo en `workflow_call`, generaba el error "Cannot read properties of undefined (workflow_dispatch)"), la `CLAUDE_API_KEY` se manejaba de forma poco segura en `start.sh`, y el README de la demo tenía warnings de `markdownlint`:  
  **Decisiones:**
  - [X] `.github/workflows/ci-smoke.yml` — nuevo workflow manual (`workflow_dispatch`) que referencia `secrets.CLAUDE_API_KEY` directamente en cada step que lo necesita; [.github/workflows/ci-code.yml](/.github/workflows/ci-code.yml) deja de referenciarlo. — **Creado/Modificado:** 20 / 05 / 2026
  - [X] `demo/start.sh`, `demo/.env.demo.example` — primera versión: lee `CLAUDE_API_KEY` desde `demo/.env.demo` (gitignored) en vez de pasarla por argumento/env inline; `demo/.env.demo.example` como plantilla pública. — **Creado:** 20 / 05 / 2026
  - [X] `demo/start.sh` — segunda versión: usa `read -rs` para capturar la key sin eco ni historial y `unset` al salir; elimina el enfoque de archivo `.env.demo` (ningún archivo toca disco). — **Modificado:** 20 / 05 / 2026
  - [X] `demo/README.md` — bloque de código del prompt interactivo marcado como `text`; tabla con emojis (descuadraba columnas) reemplazada por tabla compacta. — **Modificado:** 20 / 05 / 2026
  - **Commits relacionados:** `cbdbd87` — fix(ci): mover smoke test a workflow manual con secret declarado correctamente; `0e30d67` — fix(demo): leer CLAUDE_API_KEY de demo/.env.demo en vez del comando; `52ae8d3` — fix(demo,ci): key por read -s interactivo y corregir ci-smoke.yml; `199e0de` — docs(demo): corregir warnings de markdownlint en README
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** la `CLAUDE_API_KEY` nunca se escribe a disco ni queda en el historial de shell; el smoke test es manual (Actions → Smoke Test → Run workflow) y requiere que alguien con permisos configure el secret `CLAUDE_API_KEY` en el repositorio. No hay todavía smoke test automático en cada push/PR.

- El primer intento de construir/arrancar el stack de demo falló en cascada por causas independientes relacionadas con pnpm, Prisma y el tamaño del contexto de build de Docker:  
  **Decisiones:**
  - [X] `.dockerignore` (raíz) — excluye `node_modules/`, `.git/`, `dist/`, `coverage/`, logs y `.env*`; el contexto de build pasa de ~578MB a ~5MB. `demo/start.sh` valida la key contra `api.anthropic.com/v1/models` antes de construir (200 = válida, 401 = inválida, 403 = sin permisos, sin red = avisa y continúa) y muestra el tamaño estimado del contexto. — **Creado/Modificado:** 21 / 05 / 2026
  - [X] `demo/Dockerfile` — el cliente de Prisma vive en el virtual store de pnpm (`.pnpm/...`), no en `node_modules/.prisma`; se ejecuta `prisma generate` directamente en la imagen de runtime con una URL dummy (`DATABASE_URL` real se inyecta en runtime vía env). — **Modificado:** 21 / 05 / 2026
  - [X] `demo/Dockerfile` — el `generate` del builder se había eliminado por error, pero `tsc` necesita los tipos generados (`PrismaClient`, `Stage`, `AuditActor`, etc.) para compilar (32 errores sin él); se restauran dos `generate` explícitos: uno en el builder (tipos para `tsc`) y otro en runtime (cliente para ejecución, virtual store distinto). — **Modificado:** 21 / 05 / 2026
  - [X] `demo/Dockerfile` — `prisma` (CLI) es devDependency y `pnpm install --prod` lo excluye, pero el `CMD` ejecuta `prisma migrate deploy` en runtime; se usa `--frozen-lockfile` sin `--prod` en el stage de runtime (es un contenedor de demo, el tamaño extra no justifica la complejidad). — **Modificado:** 21 / 05 / 2026
  - **Commits relacionados:** `0e39b3c` — fix(demo): dockerignore para reducir contexto de 578MB a ~5MB + validación de key antes del build; `2ea9741` — fix(demo): corregir Dockerfile — pnpm no usa node_modules/.prisma; `f05aed4` — fix(demo): restaurar prisma generate en builder stage; `dd7ddf9` — fix(demo): instalar todas las deps en runtime stage
  - **Co-autoría:** Claude Sonnet 4.6.

- Tras resolver el build, el contenedor del orquestador se colgaba después de "AppModule dependencies initialized" sin llegar a `app.listen()`, y NestJS fallaba por errores de inyección de dependencias en `ToolsModule`/`EventsModule`/`CommercialModule`:  
  **Decisiones:**
  - [X] [src/tenant/prisma-system.service.ts](/src/tenant/prisma-system.service.ts) — se elimina el `await this.$connect()` explícito en `onModuleInit`; con Prisma v6 la conexión es lazy y ese `$connect()` puede bloquearse indefinidamente — Prisma conecta en la primera query. — **Modificado:** 21 / 05 / 2026
  - [X] `createRedis()` factory (usada por `TenantConfigService`, `ConversationSessionStore`, `ContextBankService`, `WaitingListService`) — centraliza la configuración de Redis con `client.on('error')` → warn (no crash), `retryStrategy` con backoff y `maxRetriesPerRequest: 3` (sin handler de error, Node termina el proceso silenciosamente ante un fallo de conexión). — **Modificado:** 21 / 05 / 2026
  - [X] `src/tools/tools.module.ts` — agrega `AuditModule` (lo requiere `HandoffManagerImpl` vía `AuditLogService`). — **Modificado:** 21 / 05 / 2026
  - [X] `src/events/events.module.ts`, `src/commercial/commercial.module.ts` — agregan `AuditModule` (`QuotaService`/`WaitingListService`/`CancellationService` y `CommercialStageService`/`ScoringService`/`ConsentService` usan `AuditLogService`). — **Modificado:** 21 / 05 / 2026
  - [X] [src/main.ts](/src/main.ts) — OpenTelemetry solo se inicializa si `OTEL_ENABLED=true` (evita bloqueo cuando no hay colector). — **Modificado:** 21 / 05 / 2026
  - [X] `demo/docker-compose.yml`, `demo/start.sh` — `OTEL_ENABLED=false` por defecto, healthcheck con 15 reintentos, `open-wa` movido al profile `whatsapp` (no arranca por defecto), `start.sh` con timeout de 120s y volcado automático de logs si falla. — **Modificado:** 21 / 05 / 2026
  - **Commits relacionados:** `4255dec` — fix(startup): eliminar causas del cuelgue al arrancar; `9b32bb3` — fix(di,demo): corregir dependencias de DI y configuración Docker; `253f98c` — fix(di): agregar AuditModule a ToolsModule
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** el orquestador arranca de forma confiable dentro de Docker incluso sin colector OpenTelemetry y tolera caídas momentáneas de Redis (reintentos con backoff en vez de terminar el proceso). El stack completo (Postgres + Redis + orquestador + GUI) levanta con `bash demo/start.sh`, aunque WhatsApp real (open-wa) sigue siendo opt-in vía profile `whatsapp` y no se ejercita por defecto.

- En Windows, Git Bash convertía rutas POSIX (`/app/demo/seed/seed.js`) a rutas de Windows (`C:/Program Files/Git/...`) al pasarlas a `docker exec`, rompiendo el comando de seed:  
  **Decisiones:**
  - [X] `demo/start.sh` — antepone `MSYS_NO_PATHCONV=1` al `docker exec` que ejecuta el seed para desactivar la conversión de rutas de Git Bash. — **Modificado:** 21 / 05 / 2026
  - **Commit relacionado:** `359e735` — fix(demo): MSYS_NO_PATHCONV=1 para evitar conversion de rutas en Git Bash Windows
  - **Co-autoría:** Claude Sonnet 4.6.

- 'node' no estaba en el PATH de Git Bash en Windows, por lo que el seed no podía ejecutarse desde el host; además `CreateTenantDto` no marcaba `llmModel`/`systemPrompt` como opcionales y, con `forbidNonWhitelisted: true`, el `ValidationPipe` rechazaba la creación del tenant con 400 — error que el seed silenciaba, dejando el tenant sin crear y la inserción de credenciales fallando con 500 por violación de FK:  
  **Decisiones:**
  - [X] `demo/Dockerfile`, `demo/start.sh` — el seed se copia al contenedor y se ejecuta con `docker exec saas-demo-orchestrator node /app/demo/seed/seed.js`; `CLAUDE_API_KEY` se pasa con `-e` (nunca toca el filesystem del host). — **Modificado:** 21 / 05 / 2026
  - [X] `src/dto/tenant.dto.ts` (`CreateTenantDto`) — `llmModel` y `systemPrompt` decorados con `@IsString @IsOptional`. — **Modificado:** 21 / 05 / 2026
  - [X] `demo/seed/seed.js` — reemplaza el `.catch` silencioso por un `warning` que muestra el error real del backend. — **Modificado:** 21 / 05 / 2026
  - **Commits relacionados:** `f8c34cf` — fix(demo): ejecutar seed dentro del contenedor con docker exec; `33748c6` — fix(validation,seed): decorar campos opcionales del DTO y mostrar errores reales
  - **Co-autoría:** Claude Sonnet 4.6.

- El navegador bloqueaba los `fetch()` desde la GUI (`localhost:8080`) hacia el orquestador (`localhost:3000`) por política de mismo origen (CORS):  
  **Decisiones:**
  - [X] [src/main.ts](/src/main.ts) — `app.enableCors()` con orígenes configurables vía `CORS_ORIGINS`. — **Modificado:** 21 / 05 / 2026
  - [X] `demo/docker-compose.yml` — `CORS_ORIGINS` incluye `http://localhost:8080` y `127.0.0.1:8080`. — **Modificado:** 21 / 05 / 2026
  - **Commit relacionado:** `063c225` — fix(cors): habilitar CORS para que la GUI en :8080 alcance el orquestador en :3000
  - **Co-autoría:** Claude Sonnet 4.6.

- El system prompt del bot usaba Markdown (negritas/listas) que el canal web no renderiza, listaba eventos proactivamente, exponía IDs internos y tenía un tono inconsistente; además, al actualizar la configuración de un tenant, el prompt anterior seguía sirviéndose desde caché hasta 5 minutos:  
  **Decisiones:**
  - [X] `demo/seed/seed.js` (system prompt) — texto plano sin Markdown; primer mensaje con saludo + aviso de privacidad + pregunta abierta; no lista eventos salvo que el usuario los pida; no expone IDs internos; emojis al mínimo; tono natural y conciso. — **Modificado:** 21 / 05 / 2026
  - [X] [src/tenant/tenant-admin.controller.ts](/src/tenant/tenant-admin.controller.ts) (`createTenant`) — invalida la caché Redis tras el `upsert` para que el nuevo prompt surta efecto de inmediato, sin esperar el TTL de 5 minutos. — **Modificado:** 21 / 05 / 2026
  - **Commit relacionado:** `6f67ec8` — fix(prompt,cache): corregir comportamiento del bot y invalidar cache al actualizar tenant
  - **Co-autoría:** Claude Sonnet 4.6.

- El botón "Limpiar" de la GUI solo borraba el chat visual pero reutilizaba el mismo `channelId`, por lo que el backend encontraba la misma conversación en Redis y el bot recordaba el historial anterior:  
  **Decisiones:**
  - [X] `demo/gui/index.html` — `clearAll()` llama a `newChannel()`, que genera un `channelId` aleatorio nuevo; el orquestador trata la conversación como un lead/conversación nuevo con historial vacío. — **Modificado:** 21 / 05 / 2026
  - **Commit relacionado:** `43f80dc` — fix(demo/gui): nueva sesion genera nuevo channelId para limpiar contexto del bot
  - **Co-autoría:** Claude Sonnet 4.6.

- Sin timeout, `AgentRunner` podía colgarse indefinidamente cuando la API de Anthropic tardaba (reproducible al enviar un correo en el turno 4, con historial creciente):  
  **Decisiones:**
  - [X] [src/conversation/agent-runner.service.ts](/src/conversation/agent-runner.service.ts) — timeout de 30s en el cliente de Anthropic (antes ilimitado); `MAX_HISTORY_MESSAGES = 20` recorta el historial largo antes de enviarlo; `try/catch` por turno: el timeout devuelve un mensaje amigable al usuario en vez de colgar el proceso, los errores de billing se relanzan. — **Modificado:** 21 / 05 / 2026
  - **Commit relacionado:** `957858d` — fix(agent): timeout 30s + recorte de historial + error handling en run loop
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** el run loop ya no puede colgar el proceso indefinidamente. Sin embargo, el recorte a los últimos 20 mensajes es una poda dura por cantidad de mensajes (no por tokens ni por relevancia), por lo que conversaciones muy largas pueden perder contexto temprano relevante (p. ej. datos de contacto capturados al inicio) — esta limitación motivaría más adelante el banco de contexto persistido y las señales granulares por dato (29 mayo - 4 junio).

- El score del lead nunca subía, los campos `stage`/`score`/`toolCallsExecuted` no llegaban al cliente (la GUI los leía pero recibía `undefined`), los datos de contacto nunca se persistían en `Lead`, y el system prompt no indicaba al modelo cuándo ni con qué datos llamar `emit_stage_signal`:  
  **Decisiones:**
  - [X] [src/conversation/message-router.service.ts](/src/conversation/message-router.service.ts) — `RoutingResult` ahora incluye `stage`, `score`, `toolCallsExecuted`; mapea cambios de etapa a `ScoreEvent` (`LEAD→MQL = contact_data_provided` +3, `MQL→PROSPECTO = inscription_intent` +2, `PROSPECTO→SQL = payment_confirmed` +5); `AgentRunOutput` expone `previousStage` para detectar cambios. — **Modificado:** 21 / 05 / 2026
  - [X] [src/channels/webhook.controller.ts](/src/channels/webhook.controller.ts) — devuelve `stage`/`score`/`toolCallsExecuted` en la respuesta JSON de `/messages`. — **Modificado:** 21 / 05 / 2026
  - [X] [src/tools/handlers/emit-stage-signal.handler.ts](/src/tools/handlers/emit-stage-signal.handler.ts) — `EmitStageSignalInput` acepta `contactName`/`contactEmail`/`contactPhone`/`interestedEvent`; el handler persiste esos campos en `Lead.name`/`email`/`phone` antes de la transición; el esquema del tool call se actualiza para que el modelo sepa enviarlos. — **Modificado:** 21 / 05 / 2026
  - [X] `demo/seed/seed.js` (system prompt) — describe explícitamente cuándo llamar a `emit_stage_signal` y qué campos pasar según la señal. — **Modificado:** 21 / 05 / 2026
  - **Commit relacionado:** `ab84b88` — fix(arch): conectar tool calls con persistencia, score y respuesta HTTP
  - **Co-autoría:** Claude Sonnet 4.6.
  - **Capacidades y limitaciones (a esta fecha):** con este commit se cierra el ciclo end-to-end del demo: un mensaje del cliente puede disparar un tool call que persiste datos del lead, sube su score y avanza su etapa comercial, y la GUI puede mostrar `stage`/`score`/`toolCallsExecuted` (vía polling, todavía sin SSE). La limitación que persiste al cierre de esta semana es que `datos_de_contacto_completados` sigue siendo una señal agregada (los tres datos a la vez); su división en señales granulares por dato llegaría dos semanas después (29 mayo - 4 junio).

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
  - [X] [`BPMN-001.svg`](</docs/analisis/modelos del problema/bpmn/BPMN-001.svg>) — Restaurado y actualizado como diagrama visual del flujo de conversación entre Cliente potencial y Bot. — **Restaurado/Actualizado:** 14 / 05 / 2026
  - [X] [`BPMNs.md`](</docs/analisis/modelos del problema/bpmn/BPMNs.md>) — Actualización de referencias a Miro por link local al SVG; adición de descripción completa del flujo BPMN-001 basado en CU-COM-002; inclusión de todos los casos de uso relacionados (CU-COM-001, CU-COM-003, CU-COM-004, CU-COM-005, CU-EVT-001, CU-EVT-003); documentación de flujo principal, flujos alternativos y excepciones. — **Modificado:** 14 / 05 / 2026
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
  - [X] [`Definiciones.md`](/docs/analisis/glosario/Definiciones.md) — Se elimina contenido fantasma; se remueven las cuatro señales inexistentes; se normaliza "puntaje" a "calificación"; se corrige la definición de Reserva temporal; se redefine Exploit del bot; se agrega la definición de Cartera de clientes y la candidatura de notificaciones de reactivación. — **Modificado:** 29 / 04 / 2026

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
  - [X] [`Definiciones.md`](/docs/analisis/glosario/Definiciones.md) — Actualización de definiciones de calificación de lead y gestión de lista de espera para alinear con criterios correctos. — **Modificado:** 23 / 04 / 2026
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
  - [X] [`Definiciones.md`](/docs/analisis/glosario/Definiciones.md) — Actualizado con notas temporales para definir correctamente momentos y comportamientos confusos identificados durante el análisis. — **Modificado:** 11 / 03 / 2026

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
  - [X] [`Definiciones.md`](/docs/analisis/glosario/Definiciones.md) — Creado como glosario base del sistema con las definiciones iniciales del dominio. — **Creado:** 02 / 03 / 2026

- El dominio COM carecía del requerimiento de privacidad y aviso legal al usuario:  
  No existía ningún RF que especificara la obligación del sistema de informar al usuario sobre el aviso de privacidad y los términos y condiciones antes de recopilar datos.  
  **Decisiones:**
  - [X] [`RF-COM-07 Informe de privacidad al usuario.md`](</docs/diseño/requerimientos/funcionales/COM/RF-COM-07 Informe de privacidad al usuario.md>) — Creado para especificar la presentación del aviso de privacidad y TyCs al usuario al inicio de la conversación. — **Creado:** 05 / 03 / 2026
