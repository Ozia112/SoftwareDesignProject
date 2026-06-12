# El problema de fondo

> Que otras alternativas hay a la estrategia de seed como set de instrucciones al bot para trabajar? es un poco caotico tener un set de reglas que no tienen un flujo claro de conversacion. ¿estrategias como n8n son alternativas validas o estan en otro campo de implementacion? dame una lista de alternativas serias y estandares en el mercado respecto a este tipo de sistemas

El sistema actual usa un **system prompt monolítico con reglas en lenguaje natural** como mecanismo de control de flujo. El LLM interpreta las reglas y decide qué tool call emitir. Los problemas:

- Las reglas se superponen o contradicen (REGLA B3 vs REGLA C)
- Sin garantía de orden de ejecución
- Difícil de versionar, probar o visualizar
- Cualquier cambio de negocio requiere reescribir el prompt y hacer deploy

## Las tres capas del problema

Antes de listar alternativas, hay que entender que el "sistema de instrucciones al bot" opera en **tres capas distintas**:

| Capa                       | Qué controla                                                       | Ejemplo actual                            |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| **Orquestación**           | Cuándo llamar al LLM, con qué contexto, qué hacer con el resultado | AgentRunnerService + MessageRouterService |
| **Diseño de conversación** | Qué flujo sigue el bot, qué información recolectar, en qué orden   | System prompt con REGLAS A-D              |
| **Lógica de dominio**      | Reglas de negocio independientes del LLM                           | `CommercialStageService`, `QuotaService`  |

La inestabilidad está en la **capa de diseño de conversación**. Las otras dos capas (tu proyecto) están bien diseñadas.

---

## n8n — ¿Es válido?

n8n opera principalmente en la **capa de orquestación e integración**, no en diseño de conversación. Es un ETL/workflow automation tool con nodos de IA:

### Sirve para

- Conectar el webhook del canal (WhatsApp/Telegram) → LLM → CRM → notificaciones
- Post-processing: cuando lead llega a SQL → crear ticket en Jira → enviar email al asesor
- Puede reemplazar `MessageRouterService` para flujos simples

### No sirve para

- Gestionar estado de conversación complejo (scores, quotas, etapas)
- Tool use sofisticado con validaciones de dominio
- Flujos con múltiples turnos de razonamiento del LLM

**Veredicto:** complementario, no sustituto. Viable si la lógica de dominio es básica.

## Alternativas serias por categoría

### Categoría 1 — Prompts condicionados por estado (menor cambio, mayor impacto inmediato)

En lugar de un system prompt único con todas las reglas, cada `Stage` tiene su propio prompt mínimo. `AgentRunnerService` inyecta el prompt correspondiente al estado actual.

```text
LEAD prompt:     "Saluda, muestra aviso de privacidad, pide nombre. Tool: nombre_capturado."
MQL prompt:      "Recolecta correo y teléfono. Tool: correo_capturado, numero_capturado."
PROSPECTO prompt:"Usuario quiere inscribirse. Tool: reserve_quota, pregunta_de_inscripcion."
SQL prompt:      "Pago recibido. Tool: confirmacion_de_pago_pendiente, request_human_handoff."
```

El bot nunca ve reglas que no aplican a su estado actual. Este patrón se llama **contextual prompting** o **state-scoped prompting**. El proyecto ya tiene la infraestructura para esto (`getSchemasForStage`).

### Categoría 2 — Few-shot examples en vez de reglas abstractas

Los LLMs siguen ejemplos mejor que reglas abstractas. En lugar de `REGLA B3 — OBLIGATORIO cuando ya tienes los tres datos`, se proveen 2-3 conversaciones de ejemplo completas. Es el estándar de prompting para producción en casos complejos.

Referencia: _Anthropic prompt library, OpenAI prompt engineering guide._

### Categoría 3 — LangGraph (sustituto del AgentRunner)

**LangGraph** (de LangChain) es el estándar emergente para flujos agenticos complejos con estado. Define el flujo como un **grafo de nodos y aristas** donde cada nodo es una función que puede llamar al LLM o ejecutar lógica.

```text
start → [nodo: recolectar nombre] → [nodo: recolectar email] → [nodo: recolectar teléfono]
      → [nodo: detectar intención] → [nodo: reservar cupo] → [nodo: confirmar pago] → end
```

**Lo que reemplaza:** `AgentRunnerService` completo. El flujo de conversación deja de estar en el prompt y pasa a ser código.

**Compatibilidad:** puede coexistir con tu `CommercialStageService`, `QuotaService` — los nodos del grafo llamarían tus servicios.

**Stack:** Python (nativo) o TypeScript (`@langchain/langgraph`).

## Recomendación directa para tu proyecto

Dado que ya tienes la arquitectura de dominio bien construida (stages, scoring, quotas), el mayor ROI está en:

**Corto plazo** — Prompts condicionados por estado (Categoría 1). Requiere refactorizar AgentRunnerService para inyectar el sub-prompt del estado actual. Sin dependencias externas, máximo control.

**Mediano plazo** — LangGraph para reemplazar el run loop manual del AgentRunner. El flujo de conversación se convierte en un grafo versionable, testeable y visualizable. Tu lógica de dominio permanece intacta como nodos del grafo.

**n8n** vale para automatizar lo que sucede después de que el lead llega a ciertos estados (notificar operador, actualizar CRM, enviar confirmación) pero no para la conversación en sí.

> En la categoria 3 LangGraph usar una estructura de datos de tipo arbol B en vez de un grafo de nodos de aristas basico no? esto crearia un flujo conversacional de desarrollo en ramificacion con la capacidad de adicionar condiciones y propiedades en cada nivel como sub prompts, tools que puede usar, instrucciones por etapa etc. A lo mejor con un pequeño gimmick de flujo hacia arriba cuando haya un cambio de evento que obligue el retroceso de etapa comercial.
> Esto es posible, factible o tiene sentido operacional?

## Sobre la estructura de datos

Lo que describes no es exactamente un árbol B. Un **árbol B** (B-tree) es una estructura balanceada de búsqueda optimizada para almacenamiento en disco — sus propiedades (nodos ordenados, altura logarítmica, split automático) no son las que necesita un flujo conversacional.

Lo que describes es un **árbol de estados jerárquico con aristas condicionales**, que tiene nombre propio en la industria:

## El concepto correcto: Hierarchical State Machine (HSM) / Statechart

Formulado por David Harel en 1987, estandarizado en UML. Es exactamente lo que describes:

```tree
ROOT
├── LEAD
│   └── (subEstado) esperando_nombre
│       └── (subEstado) nombre_capturado   ← tools: nombre_capturado
│
├── MQL
│   ├── (subEstado) esperando_correo       ← tools: correo_capturado
│   ├── (subEstado) esperando_telefono     ← tools: numero_capturado
│   └── (subEstado) datos_completos        ← tools: pregunta_de_inscripcion_detectada
│
├── PROSPECTO
│   ├── (subEstado) cupo_reservado         ← tools: confirmacion_de_pago_pendiente
│   └── (subEstado) en_lista_espera
│
└── SQL
    └── (subEstado) con_operador           ← ninguna tool del bot
```

Cada nodo tiene propiedades propias: sub-prompt, tools disponibles, guards (condiciones de entrada/salida), y transiciones tanto hacia adelante como **hacia atrás** (lo que describes como "gimmick de flujo hacia arriba").

El retroceso de etapa ya tiene nombre: **history state**. Cuando `evento_cambiado` llega en PROSPECTO, el árbol sube al nodo MQL y re-entra en el sub-estado `esperando_telefono` con el contexto preservado (nombre y correo ya capturados) pero reseteando el evento de interés y la reserva.

### ¿Es factible y tiene sentido operacional?

**Sí, completamente**. No es especulativo — es el patrón estándar en sistemas de diálogo de producción:

Ink / Yarn Spinner — usados en videojuegos narrativos (Disco Elysium, Night in the Woods). Exactamente un árbol con `knots` (nodos), `weaves` (sub-flujos), `diverts` (transiciones) y tags de metadata por nodo. El "árbol B" que describes ES lo que Ink llama un grafo de knots con etiquetas.

**XState** — librería TypeScript con adopción masiva (Stately, Sketch, Epic Games). Implementa exactamente HSM: estados anidados, guards, history states, context. Un `Actor` de XState podría reemplazar `AgentRunnerService` manteniendo toda tu lógica de dominio intacta.

**LangGraph** — su grafo de nodos ya soporta esto. Un nodo = un sub-estado. Las aristas condicionales = guards. El `StateChannel` = el contexto que fluye entre nodos. El retroceso = un edge que apunta hacia atrás.

## Cómo se vería en la arquitectura actual

El árbol sería un artefacto de configuración, no código:

```yaml
# conversation-tree.yaml
nodes:
  lead_root:
    stage: LEAD
    subPrompt: "Saluda. Aviso de privacidad. Pide solo el nombre."
    tools: [emit_stage_signal]
    allowedSignals: [conversacion_iniciada, nombre_capturado]
    transitions:
      - on: nombre_capturado
        goto: mql_collecting_email

  mql_collecting_email:
    stage: MQL
    subPrompt: "Ya tienes el nombre. Pide el correo electrónico."
    tools: [emit_stage_signal, get_general_context]
    allowedSignals: [correo_capturado]
    transitions:
      - on: correo_capturado
        goto: mql_collecting_phone

  mql_collecting_phone:
    stage: MQL
    subPrompt: "Ya tienes nombre y correo. Pide el teléfono."
    tools: [emit_stage_signal]
    allowedSignals: [numero_capturado]
    transitions:
      - on: numero_capturado
        goto: mql_complete

  mql_complete:
    stage: MQL
    subPrompt: >
      Tienes todos los datos. Si el usuario mencionó un curso en algún momento,
      avanza a inscripción. Si no, pregunta en cuál curso está interesado.
    tools: [emit_stage_signal, get_event_context, reserve_quota]
    allowedSignals: [pregunta_de_inscripcion_detectada]
    transitions:
      - on: pregunta_de_inscripcion_detectada
        goto: prospecto_cupo_reservado
      - on: evento_cambiado             # retroceso
        goto: mql_complete
        actions: [clear_event_context]

  prospecto_cupo_reservado:
    stage: PROSPECTO
    subPrompt: >
      El cupo está reservado. Proporciona datos de pago. Espera confirmación.
      Si el usuario cambia de curso, libera el cupo actual y regresa.
    tools: [emit_stage_signal, release_quota, reserve_quota, get_event_context]
    allowedSignals: [confirmacion_de_pago_pendiente, evento_cambiado]
    transitions:
      - on: confirmacion_de_pago_pendiente
        goto: sql_handoff
      - on: evento_cambiado             # retroceso con liberación de cupo
        goto: mql_complete
        actions: [release_quota, clear_reservation]

  sql_handoff:
    stage: SQL
    subPrompt: "El pago está pendiente de verificación. No responder más al LLM."
    tools: [request_human_handoff]
    allowedSignals: []
    transitions: []     # terminal — solo el operador avanza
```

El `AgentRunnerService` deja de tener lógica de flujo — solo hace:

Resolver el nodo actual por `(stage, subState)` del lead
Componer el prompt: `base_prompt + node.subPrompt + context_data`
Filtrar tools: `node.tools` en vez de `getSchemasForStage(stage)`
Post-turno: evaluar qué señal se emitió → leer `node.transitions` → moverse al siguiente nodo
Lo que se gana vs lo que se pierde

### Se gana

- El flujo de conversación es un artefacto declarativo, versionable en git, legible por producto y QA
- Un cambio de negocio (ej: pedir CURP antes del teléfono) es editar el YAML, no el código
- Testeable: puedes simular señales y verificar transiciones sin el LLM
- El sub-prompt por nodo elimina la ambigüedad de reglas superpuestas

### Se pierde

- Flexibilidad para conversaciones completamente abiertas (aunque el LLM dentro del nodo sigue siendo libre)
- Requiere diseñar explícitamente todos los caminos, incluyendo edge cases

**El tradeoff es favorable** para flujos de ventas/inscripción donde el proceso tiene estructura clara. Para asistentes de propósito general el grafo abierto tiene más sentido.

## Implementación sugerida para este proyecto

Dado que ya tienes `CommercialStageService` como la fuente de verdad de las transiciones macro, el árbol YAML sería un segundo nivel **dentro** de cada stage:

```text
CommercialStageService    ← macro: LEAD → MQL → PROSPECTO → SQL
ConversationTree (YAML)   ← micro: sub-estados dentro de cada stage
AgentRunnerService        ← ejecutor: resuelve nodo + construye prompt + ejecuta LLM
```

No reemplazas la máquina de estados existente — la complementas con granularidad intra-stage. Las transiciones del árbol que cruzan stages siguen pasando por `processSignal()`, preservando toda la auditoría y consistencia actual.
