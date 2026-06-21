#!/usr/bin/env python3
"""Build a JSON graph index from the repository canonical YAML node map."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path
from typing import Any


RELATION_FIELDS = (
    "contains",
    "traces_to",
    "satisfies",
    "covers",
    "applies_to",
    "governed_by",
    "models",
    "modeled_by",
    "derives_from",
    "implements_future",
    "planned_in",
    "supports",
    "validated_by",
    "exercises",
    "references",
)

DEFAULT_YAML_PATH = "docs/soporte/mapa-nodos/nodos-docs.yaml"

REVERSE_RELATION_NAMES = {
    "contains": "contained_by",
    "traces_to": "traced_from",
    "satisfies": "satisfied_by",
    "covers": "covered_by",
    "applies_to": "has_rule",
    "governed_by": "governs",
    "models": "modeled_by",
    "modeled_by": "models",
    "derives_from": "derived_by",
    "implements_future": "implemented_by_future",
    "planned_in": "plans",
    "supports": "supported_by",
    "validated_by": "validates",
    "exercises": "exercised_by",
    "references": "referenced_by",
}

SEARCH_STOPWORDS = {
    "a",
    "anchor",
    "area",
    "artifact",
    "business",
    "capability",
    "code",
    "de",
    "del",
    "docs",
    "domain",
    "el",
    "en",
    "kind",
    "la",
    "las",
    "los",
    "md",
    "o",
    "para",
    "por",
    "png",
    "root",
    "rule",
    "status",
    "svg",
    "y",
}

CORE_NODE_FIELDS = {
    "id",
    "type",
    "title",
    "path",
    "status",
    "purpose",
    "tags",
    "aliases",
    "services",
    "tool_calls",
}

LIST_FIELDS = {"tags", "aliases", "services", "tool_calls"}


class GraphBuildError(Exception):
    """Expected build failure with a user-facing message."""


def warn(message: str) -> None:
    print(f"WARNING: {message}", file=sys.stderr)


def load_yaml(yaml_path: Path) -> dict[str, Any]:
    """Load a YAML file using PyYAML and return the parsed mapping."""
    if not yaml_path.exists():
        raise GraphBuildError(f"YAML file does not exist: {yaml_path}")

    try:
        import yaml
    except ModuleNotFoundError as exc:
        raise GraphBuildError(
            "PyYAML is required to read YAML. Install it with: python -m pip install PyYAML"
        ) from exc

    try:
        with yaml_path.open("r", encoding="utf-8") as handle:
            data = yaml.safe_load(handle)
    except yaml.YAMLError as exc:
        raise GraphBuildError(f"Malformed YAML in {yaml_path}: {exc}") from exc
    except OSError as exc:
        raise GraphBuildError(f"Could not read YAML file {yaml_path}: {exc}") from exc

    if not isinstance(data, dict):
        raise GraphBuildError(f"YAML root must be a mapping/object: {yaml_path}")

    return data


def validate_raw_graph(raw_graph: dict[str, Any]) -> None:
    """Validate required top-level graph keys."""
    if "schema" not in raw_graph:
        raise GraphBuildError("Missing required top-level key: schema")
    if "nodes" not in raw_graph:
        raise GraphBuildError("Missing required top-level key: nodes")
    if raw_graph["nodes"] is None:
        raise GraphBuildError("Top-level key 'nodes' must not be empty")
    if not isinstance(raw_graph["nodes"], list):
        raise GraphBuildError("Top-level key 'nodes' must be a list")


def ensure_list(value: Any) -> list[Any]:
    """Normalize scalar or list-like values to a list."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    return [value]


def normalize_string_list(value: Any) -> list[str]:
    """Return a clean list of unique string values preserving order."""
    items: list[str] = []
    seen: set[str] = set()
    for item in ensure_list(value):
        text = str(item).strip()
        if text and text not in seen:
            seen.add(text)
            items.append(text)
    return items


def normalize_nodes(raw_nodes: list[Any]) -> tuple[list[dict[str, Any]], set[str]]:
    """Create unique normalized nodes and return original node IDs."""
    normalized: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    duplicates: list[str] = []

    for index, raw_node in enumerate(raw_nodes, start=1):
        if not isinstance(raw_node, dict):
            raise GraphBuildError(f"Node #{index} must be a mapping/object")

        raw_id = raw_node.get("id")
        if raw_id is None or str(raw_id).strip() == "":
            raise GraphBuildError(f"Node #{index} is missing required field: id")

        node_id = str(raw_id).strip()
        if node_id in seen_ids:
            duplicates.append(node_id)
            continue
        seen_ids.add(node_id)

        if not raw_node.get("path"):
            warn(f"Node {node_id} has no path")
        if not raw_node.get("type"):
            warn(f"Node {node_id} has no type")

        node: dict[str, Any] = {
            "id": node_id,
            "type": raw_node.get("type"),
            "title": raw_node.get("title") or node_id,
            "path": raw_node.get("path"),
            "status": raw_node.get("status"),
            "purpose": raw_node.get("purpose"),
            "tags": normalize_string_list(raw_node.get("tags")),
            "aliases": normalize_string_list(raw_node.get("aliases")),
            "services": normalize_string_list(raw_node.get("services")),
            "tool_calls": normalize_string_list(raw_node.get("tool_calls")),
        }

        metadata = {
            key: value
            for key, value in raw_node.items()
            if key not in CORE_NODE_FIELDS and key not in RELATION_FIELDS
        }
        if metadata:
            node["metadata"] = metadata

        normalized.append(node)

    if duplicates:
        duplicate_list = ", ".join(sorted(set(duplicates)))
        raise GraphBuildError(f"Duplicate node ids found: {duplicate_list}")

    return normalized, seen_ids


def extract_edges(
    raw_nodes: list[dict[str, Any]],
    nodes: list[dict[str, Any]],
    known_ids: set[str],
) -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
    """Extract relation fields into unique edges and create placeholders."""
    edges: list[dict[str, str]] = []
    edge_keys: set[tuple[str, str, str]] = set()
    placeholders: list[dict[str, Any]] = []
    placeholder_ids: set[str] = set()

    for raw_node in raw_nodes:
        from_id = str(raw_node["id"]).strip()
        for relation_type in RELATION_FIELDS:
            for raw_target in ensure_list(raw_node.get(relation_type)):
                to_id = str(raw_target).strip()
                if not to_id:
                    continue

                if to_id not in known_ids and to_id not in placeholder_ids:
                    warn(
                        f"Relation {from_id} --{relation_type}--> {to_id} points to a missing node; "
                        "creating placeholder"
                    )
                    placeholder_ids.add(to_id)
                    placeholders.append(
                        {
                            "id": to_id,
                            "type": "external_or_missing",
                            "title": to_id,
                            "path": None,
                            "status": "unresolved",
                            "purpose": None,
                            "tags": [],
                            "aliases": [],
                            "services": [],
                            "tool_calls": [],
                        }
                    )

                edge_key = (from_id, to_id, relation_type)
                if edge_key in edge_keys:
                    continue
                edge_keys.add(edge_key)
                edges.append({"from": from_id, "to": to_id, "type": relation_type})

    nodes.extend(placeholders)
    return edges, placeholders


def sorted_unique(values: list[str]) -> list[str]:
    return sorted(set(values))


def build_adjacency(nodes: list[dict[str, Any]], edges: list[dict[str, str]]) -> dict[str, dict[str, list[str]]]:
    """Build outgoing adjacency grouped by relation type."""
    adjacency: dict[str, dict[str, list[str]]] = {node["id"]: {} for node in nodes}
    grouped: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))

    for edge in edges:
        grouped[edge["from"]][edge["type"]].append(edge["to"])

    for node_id, relations in grouped.items():
        adjacency[node_id] = {
            relation_type: sorted_unique(targets)
            for relation_type, targets in sorted(relations.items())
        }

    return adjacency


def build_reverse_adjacency(
    nodes: list[dict[str, Any]], edges: list[dict[str, str]]
) -> dict[str, dict[str, list[str]]]:
    """Build incoming adjacency using configured inverse relation names."""
    reverse: dict[str, dict[str, list[str]]] = {node["id"]: {} for node in nodes}
    grouped: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))

    for edge in edges:
        inverse_type = REVERSE_RELATION_NAMES[edge["type"]]
        grouped[edge["to"]][inverse_type].append(edge["from"])

    for node_id, relations in grouped.items():
        reverse[node_id] = {
            relation_type: sorted_unique(sources)
            for relation_type, sources in sorted(relations.items())
        }

    return reverse


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def tokenize(value: Any, *, filter_stopwords: bool = True) -> set[str]:
    """Tokenize text in lowercase without accents."""
    if value is None:
        return set()

    text = strip_accents(str(value).lower())
    tokens = {token for token in re.split(r"[^a-z0-9]+", text) if token}
    if not filter_stopwords:
        return tokens
    return {token for token in tokens if token not in SEARCH_STOPWORDS}


def searchable_tag_value(tag: str) -> str | None:
    """Return the meaningful portion of a faceted tag for text search."""
    if ":" not in tag:
        return None

    prefix, value = tag.split(":", 1)
    if prefix in {"capability", "domain", "quality"}:
        return value
    return None


def node_summary(node: dict[str, Any]) -> dict[str, Any]:
    """Small node object suitable for search results."""
    return {
        "id": node["id"],
        "type": node.get("type"),
        "title": node.get("title") or node["id"],
        "path": node.get("path"),
        "status": node.get("status"),
        "tags": node.get("tags", []),
        "aliases": node.get("aliases", []),
    }


def build_search_index(nodes: list[dict[str, Any]]) -> dict[str, Any]:
    """Build a lightweight term and facet index for graph lookup."""
    by_id = {node["id"]: node_summary(node) for node in nodes}
    terms: dict[str, set[str]] = defaultdict(set)
    by_type: dict[str, set[str]] = defaultdict(set)
    by_tag: dict[str, set[str]] = defaultdict(set)
    by_status: dict[str, set[str]] = defaultdict(set)
    by_path: dict[str, set[str]] = defaultdict(set)
    by_service: dict[str, set[str]] = defaultdict(set)
    by_tool_call: dict[str, set[str]] = defaultdict(set)

    for node in nodes:
        node_id = node["id"]
        text_values: list[Any] = [
            node_id,
            node.get("title"),
            node.get("status"),
        ]
        text_values.extend(
            value
            for value in (searchable_tag_value(tag) for tag in node.get("tags", []))
            if value
        )
        text_values.extend(node.get("aliases", []))
        text_values.extend(node.get("services", []))
        text_values.extend(node.get("tool_calls", []))

        for service in node.get("services", []):
            by_service[service].add(node_id)
        
        for tool_call in node.get("tool_calls", []):
            by_tool_call[tool_call].add(node_id)

        for value in text_values:
            for token in tokenize(value):
                terms[token].add(node_id)

        node_type = node.get("type")
        if node_type:
            by_type[str(node_type)].add(node_id)

        for tag in node.get("tags", []):
            by_tag[tag].add(node_id)

        status = node.get("status")
        if status:
            by_status[str(status)].add(node_id)

        path = node.get("path")
        if path:
            by_path[str(path)].add(node_id)

    return {
        "by_id": by_id,
        "terms": {term: sorted(ids) for term, ids in sorted(terms.items())},
        "by_type": {key: sorted(ids) for key, ids in sorted(by_type.items())},
        "by_tag": {key: sorted(ids) for key, ids in sorted(by_tag.items())},
        "by_status": {key: sorted(ids) for key, ids in sorted(by_status.items())},
        "by_path": {key: sorted(ids) for key, ids in sorted(by_path.items())},
        "by_service": {key: sorted(ids) for key, ids in sorted(by_service.items())},
        "by_tool_call": {key: sorted(ids) for key, ids in sorted(by_tool_call.items())}
    }


def write_json(path: Path, data: Any, pretty: bool) -> None:
    indent = 2 if pretty else None
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=indent)
        handle.write("\n")


def write_outputs(
    out_dir: Path,
    nodes: list[dict[str, Any]],
    edges: list[dict[str, str]],
    adjacency: dict[str, dict[str, list[str]]],
    reverse_adjacency: dict[str, dict[str, list[str]]],
    search_index: dict[str, Any],
    pretty: bool,
) -> None:
    """Write graph JSON files to the output directory."""
    out_dir.mkdir(parents=True, exist_ok=True)
    write_json(out_dir / "nodes.json", nodes, pretty)
    write_json(out_dir / "edges.json", edges, pretty)
    write_json(out_dir / "adjacency.json", adjacency, pretty)
    write_json(out_dir / "reverse_adjacency.json", reverse_adjacency, pretty)
    write_json(out_dir / "search_index.json", search_index, pretty)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build .graph JSON indexes from a canonical repository YAML graph."
    )
    parser.add_argument(
        "yaml_path",
        nargs="?",
        default=DEFAULT_YAML_PATH,
        help=f"Path to the canonical YAML graph. Defaults to {DEFAULT_YAML_PATH}.",
    )
    parser.add_argument(
        "--out",
        default=".graph",
        help="Output directory for generated JSON files. Defaults to .graph.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print generated JSON with indentation.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    yaml_path = Path(args.yaml_path)
    out_dir = Path(args.out)

    try:
        raw_graph = load_yaml(yaml_path)
        validate_raw_graph(raw_graph)

        raw_nodes = raw_graph["nodes"]
        nodes, known_ids = normalize_nodes(raw_nodes)
        original_node_count = len(raw_nodes)

        # normalize_nodes already validated all raw nodes are mappings.
        typed_raw_nodes = [node for node in raw_nodes if isinstance(node, dict)]
        edges, placeholders = extract_edges(typed_raw_nodes, nodes, known_ids)

        adjacency = build_adjacency(nodes, edges)
        reverse_adjacency = build_reverse_adjacency(nodes, edges)
        search_index = build_search_index(nodes)

        write_outputs(out_dir, nodes, edges, adjacency, reverse_adjacency, search_index, args.pretty)

        print("Graph build complete")
        print(f"- original nodes: {original_node_count}")
        print(f"- final nodes: {len(nodes)}")
        print(f"- placeholders created: {len(placeholders)}")
        print(f"- edges: {len(edges)}")
        print(f"- indexed terms: {len(search_index['terms'])}")
        print(f"- output: {out_dir.resolve()}")
        return 0

    except GraphBuildError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
