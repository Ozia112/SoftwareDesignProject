# Repository Agent Search Policy

This repository uses a graph-first retrieval architecture for AI agents.

Agents MUST consult the repository graph before performing broad repository exploration.

---

## Repository Graph

Generated files:

```txt
.graph/
  nodes.json
  edges.json
  adjacency.json
  reverse_adjacency.json
  search_index.json
```

Source of truth:

```txt
docs/soporte/mapa-nodos/nodos-docs.yaml
```

Graph generator:

```txt
build-graph.py
```

Python dependency:

```txt
python -m pip install -r requirements.txt
```

Default regeneration command:

```txt
python build-graph.py --pretty
```

Regenerate and commit `.graph/` whenever the YAML source changes so agents can use the graph before broad exploration.

---

## Mandatory Search Order

Before using grep, glob, recursive search, or broad document scanning, agents MUST follow this order:

1. `.graph/search_index.json`
2. `.graph/nodes.json`
3. `.graph/adjacency.json`
4. `.graph/reverse_adjacency.json`
5. Open only the most relevant documents
6. Use broad repository search only as last resort

If `.graph/` is missing or stale, regenerate it with `python build-graph.py --pretty` before broad repository exploration.

---

## Graph Query Strategy

### Initial Resolution

Use `search_index.json` to resolve:

- IDs
- titles
- tags
- aliases
- paths
- node types
- statuses

Examples:

- "waitlist"
- "quota reservation"
- "commercial flow"
- "handoff"
- "tool calls"

---

### Node Expansion

Use:

```txt
adjacency.json
reverse_adjacency.json
```

to expand:

- traces_to
- governed_by
- derives_from
- implements_future
- supports
- references
- contains

without opening files.

---

## File Opening Policy

Do NOT open large amounts of documentation blindly.

Only open documentation files after:

1. Identifying relevant node IDs
2. Expanding graph relations
3. Reducing candidate artifacts

---

## Repository Domain Model

Main repository areas:

| Area            | Purpose                                 |
| --------------- | --------------------------------------- |
| AREA-ANALISIS   | Requirements, business rules, use cases |
| AREA-DISENO     | Architecture, behavior, orchestration   |
| AREA-SOPORTE    | Workflow, prompts, scripts, utilities   |
| AREA-SRC-FUTURO | Future implementation anchors           |

---

## GitHub Metadata Policy

For repository metadata hosted on GitHub, agents MUST use `gh` instead of web browsing or manual URL guessing.

Use `gh` for:

- Issues: `gh issue view <number> --repo Ozia112/SoftwareDesignProject`
- Issue search/listing: `gh issue list --repo Ozia112/SoftwareDesignProject --search "<query>"`
- Pull requests: `gh pr view <number> --repo Ozia112/SoftwareDesignProject`
- PR search/listing: `gh pr list --repo Ozia112/SoftwareDesignProject --search "<query>"`
- Remote commit search: `gh search commits "<query>" --repo Ozia112/SoftwareDesignProject`

Use local `git` only for local working tree state, local diffs, local history, and commit content already present in the clone.

---

## Claude Code Architecture Context

Claude Code and other coding agents MUST align implementation with the documented design. If in doubt, read the corresponding CU before editing code.

### Key Documentation Paths

| Need | Path |
| ---- | ---- |
| Graph source | `docs/soporte/mapa-nodos/nodos-docs.yaml` |
| Graph usage guide | `docs/soporte/mapa-nodos/README.md` |
| Graph workflows | `docs/soporte/mapa-nodos/relaciones-operativas.md` |
| Glosario | `docs/analisis/glosario/Definiciones.md` |
| RF COM | `docs/analisis/requerimientos/funcionales/COM/` |
| RF EVT | `docs/analisis/requerimientos/funcionales/EVT/` |
| RNF | `docs/analisis/requerimientos/no funcionales/` |
| CU COM | `docs/analisis/modelos del problema/casos de uso/COM/` |
| CU EVT | `docs/analisis/modelos del problema/casos de uso/EVT/` |
| Reglas COM | `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md` |
| Reglas EVT | `docs/analisis/reglas de negocio/EVT/catalogo-rn-evt.md` |
| DDR-01 | `docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md` |
| DDR-02 | `docs/diseño/decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md` |
| Estrategia v2.0 | `docs/soporte/utils/estrategia de implementacion chat.md` |

### Central Principle

The architectural principle is:

```txt
Bot emits signals. The system executes domain operations.
```

Local Spanish source:

```txt
El bot emite señales. El sistema ejecuta operaciones de dominio.
```

Implications:

- The Bot does not access the database.
- The Bot does not execute commercial transitions or operational mutations directly.
- The Bot emits signals and requests operations through tool calls.
- The orchestrator validates stage, consent, idempotency and tenant context before executing domain services.

### Service to CU Map

This table is derived from `DDR-02` and is the fast lookup for implementation ownership.

| Service | CU | Responsibility |
| ------- | -- | -------------- |
| `MessageRouter` | `CU-COM-001` | Receives channel webhook, creates conversation, resolves tenant, assigns bot or operator. |
| `AgentRunner` | `CU-COM-002` | Runs the LLM loop: message to tool calls to response. |
| `HandoffManager` | `CU-COM-001` | Manages bot to human handoff and human support queues. |
| `ConsentService` | `CU-COM-004` | Shows legal notices and records consent. |
| `CommercialStageService` | `CU-COM-005` | Owns commercial stage state machine and stage signals. |
| `ScoringService` | `CU-COM-005` | Recalculates score, detects abuse/exploits and feeds prioritization. |
| `ContextBankService` | `CU-COM-003` | Controls reads/writes to general and event context banks. |
| `QuotaService` | `CU-EVT-003` | Reserves, releases and permanently blocks quota with atomic consistency. |
| `WaitingListService` | `CU-EVT-001` | Registers and orders waitlist entries by score, FIFO only as tiebreaker. |
| `CancellationService` | `CU-EVT-002` | Handles valid pre-start cancellations and quota release. |
| `NotificationService` | `CU-COM-006` | Sends outbound reactivation notifications while respecting anti-spam rules. |
| `AuditLogService` | `CU-COM-001` | Writes append-only audit records with conversation and transaction IDs. |
| `TenantConfigService` | `CU-COM-001` | Resolves tenant configuration and credentials before any flow executes. |
| `ConversationSessionStore` | `CU-COM-002` | Stores active conversation state in Redis and checkpoints to DB on close. |

### SOLID Applied to This Project

- SRP: each service owns one domain responsibility; do not mix conversation routing, scoring, quota and notifications in one class.
- OCP: add new tool calls, channels or event policies through new handlers/strategies instead of editing central conditionals everywhere.
- LSP: implementations of service interfaces must preserve documented CU preconditions and error semantics.
- ISP: keep DTOs and service interfaces narrow; a quota consumer should not depend on notification or tenant methods it does not use.
- DIP: orchestration depends on interfaces/ports for persistence, queues, LLM and channel adapters, not concrete SDKs or database clients.

### Antipatterns to Avoid

- God services that combine bot loop, persistence, quota, scoring and notification logic.
- Putting domain decisions in the Bot instead of the orchestrator.
- Direct database access from Bot or LLM tool definitions.
- Updating commercial stage from EVT operational services.
- Treating score as a stage transition trigger.
- Duplicating business rules inside code without linking the RN/CU source.
- Creating DTOs inline inside services when they should be explicit contracts.

### TypeScript and DTO Conventions

- Classes and interfaces: `PascalCase`.
- Methods, variables and properties: `camelCase`.
- Constants and enum-like literals exported as constants: `UPPER_CASE`.
- DTOs live under `dto/` by service or module.
- Use explicit input/output DTOs for tool calls and service boundaries.
- Tool call results should use typed success/error envelopes consistent with `DDR-02`.

### Testing Rule

Before merge, run:

```txt
pnpm test -- --coverage
```

Use `pnpm` for Node package scripts and dependency management. Do not use `npm` for this repository unless the user explicitly asks for it.

If the codebase does not yet contain a Node/NestJS test setup, state that clearly in the PR and verify the documentation graph instead.

---

## Preferred Navigation

### Requirements

Start from:

```txt
RF-*
RNF-*
RN-*
```

### Use Cases

Start from:

```txt
CU-*
```

### Design Decisions

Start from:

```txt
DDR-*
```

### Sequence / Collaboration

Start from:

```txt
SEQ-*
COLLAB-*
```

### Future Code Anchors

Start from:

```txt
SRC-ORQ-*
```

---

## Future Source Code Policy

When `src/` becomes populated:

1. Link source files to graph nodes
2. Maintain traceability:
   - requirement → use case → design → source
3. Avoid semantic drift between implementation and documentation

---

## Agent Behavior Constraints

Agents SHOULD:

- minimize exploratory tool calls
- minimize broad text scanning
- prioritize graph traversal
- use repository traceability
- preserve architectural consistency

Agents SHOULD NOT:

- scan the repository recursively without graph consultation
- infer undocumented architecture
- bypass graph relationships
- ignore traceability links

---

## Expected Workflow

Typical workflow:

```txt
search_index.json
    ↓
nodes.json
    ↓
adjacency expansion
    ↓
targeted document reads
    ↓
implementation or reasoning
```
