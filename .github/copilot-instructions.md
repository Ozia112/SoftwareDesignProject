# GitHub Copilot Instructions

This repository uses graph-first documentation retrieval.

Canonical graph source: `docs/soporte/mapa-nodos/nodos-docs.yaml`.
Generated graph directory: `.graph/`.

If `.graph/` is missing or stale, run:

```txt
python build-graph.py --pretty
```

Before exploring documentation:

1. Consult `.graph/search_index.json`
2. Resolve graph nodes
3. Traverse graph relations
4. Open only relevant files

Avoid recursive exploratory searches unless graph traversal fails.

Main graph files:

```txt
.graph/search_index.json
.graph/nodes.json
.graph/adjacency.json
.graph/reverse_adjacency.json
```
