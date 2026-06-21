# Claude Repository Instructions

Read `AGENTS.md` first. The sections `Repository Agent Search Policy`, `GitHub Metadata Policy`, `Claude Code Architecture Context`, and — within `Graph Query Strategy` — **`Lookup Discipline: Resolve Before You Search`** are mandatory for Claude Code.

Claude Code tends to reach for broad `Grep`/`Glob` more readily than other agents in this repo. Before any repo-wide search, run the `by_id` / `by_tag` / `by_service` / `by_tool_call` / `adjacency` / `reverse_adjacency` lookups from `Lookup Discipline` — most questions resolve in 1-2 lookups without opening or scanning files.

This repository uses graph-first retrieval and design-aligned implementation.

Canonical graph source: `docs/soporte/mapa-nodos/nodos-docs.yaml`.
Generated graph directory: `.graph/`.

If `.graph/` is missing or stale, run:

```txt
python build-graph.py --pretty
```

Before opening documentation files:

1. Consult `.graph/search_index.json`
2. Resolve relevant node IDs
3. Expand relations through adjacency graphs
4. Open only highly relevant artifacts

Before writing code:

1. Identify the target CU/RF/RN/DDR nodes.
2. Apply the central principle from `DDR-02`: "El bot emite señales. El sistema ejecuta operaciones de dominio."
3. Use the service to CU table in `AGENTS.md`.
4. Keep DTOs explicit under `dto/` by service/module.
5. Avoid God services, direct DB access from the Bot and domain decisions inside the Bot.

For GitHub issues, PRs and remote commit lookup, use `gh`.

Avoid broad repository scanning whenever possible.
