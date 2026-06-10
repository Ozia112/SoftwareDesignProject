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

## Graph Node ID Policy

Graph node IDs MUST represent stable repository artifacts, domains, decisions, requirements, use cases, or future source anchors.

Do not use temporary GitHub issue IDs, sprint ticket IDs, or task IDs as graph node IDs when the ticket only tracks the work needed to create or update an artifact. Those IDs become obsolete when the issue closes and pollute long-lived retrieval.

Use a stable artifact-oriented ID instead, for example:

- `ARCH-ESTRUCTURA-CODIGO` for `docs/diseño/arquitectura/estructura-de-codigo.md`
- `DDR-*` for design decisions
- `CU-*`, `RF-*`, `RNF-*`, `RN-*` for analysis artifacts
- `SEQ-*`, `COLLAB-*` for design diagrams
- `SRC-ORQ-*` for future source anchors

Issue IDs such as `PSD-29` may be mentioned in PR descriptions, commit messages, changelog notes, or short document provenance when useful, but they SHOULD NOT be canonical graph IDs unless the issue itself creates a durable repository artifact whose stable identifier is intentionally the same as the issue.

When adding documentation created from an issue:

1. Choose the final artifact path first.
2. Choose a stable node ID based on the artifact role and location.
3. Add graph aliases for searchable concepts, not for transient ticket bookkeeping.
4. Link the issue in the PR or commit instead of making it part of the graph identity.

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

- `terms`: free-text lookup over IDs, titles, statuses, alias text, faceted tag values (`capability:*`, `domain:*`, `quality:*`), `services`, and `tool_calls`
- `by_type`: nodes grouped by node type (`capability`, `business-rule`, `use-case`, etc.)
- `by_tag`: nodes grouped by full tag (`area:soporte`, `kind:capability`, `capability:quota`, ...)
- `by_status`, `by_path`: nodes grouped by status or declared path
- `by_service`: NestJS service name to owning `SRC-ORQ-*` node (e.g. `QuotaService` -> `SRC-ORQ-EVENTS`)
- `by_tool_call`: tool call name to owning `SRC-ORQ-*` node (e.g. `release_quota` -> `SRC-ORQ-EVENTS`)

Examples:

- "waitlist" -> matches `CAP-EVT-WAITLIST`, `CU-EVT-001`, `RF-EVT-03`, `RF-EVT-06`, `RN-EVT-LE-*`, `SEQ-03`, `SRC-ORQ-EVENTS`
- "quota reservation" -> `CAP-EVT-QUOTA`
- "commercial flow" -> `CAP-COM-COMMERCIAL-STAGE`
- "handoff" -> `CAP-COM-HANDOFF`
- "QuotaService" via `by_service` -> `SRC-ORQ-EVENTS`
- "release_quota" via `by_tool_call` -> `SRC-ORQ-EVENTS`

---

### Capability-First Navigation (CAP-*)

For fuzzy or business-shaped questions ("reserva de cupo", "lead scoring", "context bank"), resolve a `CAP-*` node under `DOM-CAPABILITIES` first instead of guessing a `RF-*`/`CU-*`/`RN-*` ID directly. Each `CAP-*` node consolidates one capability via:

- `covers`: the `CU-*`/`RF-*` it groups
- `governed_by`: the `RN-*`/`DDR-*` constraints
- `modeled_by`: the `SEQ-*`/`COLLAB-*` diagrams
- `planned_in`: the `SRC-ORQ-*` future anchors
- `validated_by`: demo fixtures (e.g. `DEMO-EVT-CONT-01`)

Available capabilities: `CAP-EVT-QUOTA`, `CAP-EVT-WAITLIST`, `CAP-EVT-CANCELLATION`, `CAP-COM-COMMERCIAL-STAGE`, `CAP-COM-CONTEXT-BANK`, `CAP-COM-HANDOFF`, `CAP-ORQ-TOOL-CALLS`.

This turns one fuzzy query into one node lookup plus one adjacency expansion, instead of several speculative searches across RF/CU/RN/DDR.

---

### Node Expansion

Use:

```txt
adjacency.json
reverse_adjacency.json
```

to expand relations. The canonical definition of each relation lives in the `relation_vocabulary` block at the top of `docs/soporte/mapa-nodos/nodos-docs.yaml`. Pick the relation that matches the task instead of expanding everything:

| Relation | Use when you need... | Reverse |
| --- | --- | --- |
| `contains` | child nodes of an area/domain | `contained_by` |
| `satisfies` | which `RF-*` a `CU-*` fulfills | `satisfied_by` |
| `covers` | the RF/CU a `CAP-*` consolidates | `covered_by` |
| `applies_to` | which `CU-*`/`CAP-*`/anchors a business rule constrains | `has_rule` |
| `governed_by` | the rules/decisions that constrain a node | `governs` |
| `models` / `modeled_by` | the diagram for a use case/capability, or what a diagram represents | `modeled_by` / `models` |
| `derives_from` | the primary source a document derives from | `derived_by` |
| `planned_in` | the future `SRC-ORQ-*` module/service that will implement this | `plans` |
| `implements_future` | legacy alias for `planned_in`/`derives_from` (prefer those) | `implemented_by_future` |
| `validated_by` / `exercises` | demo fixtures that exercise a capability, or what a fixture exercises | `validates` / `exercised_by` |
| `supports` | supporting/auxiliary docs (READMEs, templates) | `supported_by` |
| `references` | loose contextual relation | `referenced_by` |
| `traces_to` | generic trace; prefer a more specific relation above when one exists | `traced_from` |

Expand relations without opening files.

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

| Area            | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| AREA-ANALISIS   | Requirements, business rules, use cases, CAP-* index |
| AREA-DISENO     | Architecture, behavior, orchestration                |
| AREA-SOPORTE    | Workflow, prompts, scripts, utilities                |
| AREA-SRC-FUTURO | Future implementation anchors                        |
| AREA-DEMO       | Demo data and fixtures (DEMO-EVT-CONT-01)            |

---

## Documentation Coverage Check

Run the following before adding or moving documentation under `docs/analisis` or `docs/diseño`:

```txt
python scripts/check_doc_coverage.py --strict-core
```

This reports markdown files that lack a dedicated node (`path:` exact match) in `nodos-docs.yaml`. Files under `docs/analisis/**` and `docs/diseño/**` MUST have their own node; `ci-docs.yml` enforces this. Files elsewhere (e.g. `docs/soporte/**`) are reported informationally and do not fail CI.

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
| Estrategia v2.0 | `utils/estrategia de implementacion chat.md` |

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
