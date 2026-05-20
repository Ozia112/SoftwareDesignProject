# Codex Repository Instructions

Read `AGENTS.md` before performing repository exploration.

This repository prioritizes graph traversal over broad file scanning.

Canonical graph source: `docs/soporte/mapa-nodos/nodos-docs.yaml`.
Generated graph directory: `.graph/`.

If `.graph/` is missing or stale, run:

```txt
python build-graph.py --pretty
```

Preferred workflow:

1. `.graph/search_index.json`
2. `.graph/nodes.json`
3. `.graph/adjacency.json`
4. `.graph/reverse_adjacency.json`
5. targeted document reads

Use broad search only as fallback.
