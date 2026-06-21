#!/usr/bin/env python3
"""Report documentation files that are not represented as graph nodes.

A markdown file under a "core" root (docs/analisis, docs/diseño) is expected
to have its own node with an exact `path:` match in the canonical graph
(docs/soporte/mapa-nodos/nodos-docs.yaml). Files outside the core roots are
reported for visibility but do not fail the check by default.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

DEFAULT_YAML_PATH = "docs/soporte/mapa-nodos/nodos-docs.yaml"
SCAN_ROOT = "docs"
CORE_ROOTS = ("docs/analisis", "docs/diseño")


class CoverageCheckError(Exception):
    """Expected check failure with a user-facing message."""


def load_yaml(yaml_path: Path) -> dict[str, Any]:
    if not yaml_path.exists():
        raise CoverageCheckError(f"YAML file does not exist: {yaml_path}")

    try:
        import yaml
    except ModuleNotFoundError as exc:
        raise CoverageCheckError(
            "PyYAML is required to read YAML. Install it with: python -m pip install PyYAML"
        ) from exc

    try:
        with yaml_path.open("r", encoding="utf-8") as handle:
            data = yaml.safe_load(handle)
    except yaml.YAMLError as exc:
        raise CoverageCheckError(f"Malformed YAML in {yaml_path}: {exc}") from exc

    if not isinstance(data, dict) or not isinstance(data.get("nodes"), list):
        raise CoverageCheckError(f"Unexpected graph YAML structure in {yaml_path}")

    return data


def collect_node_paths(raw_nodes: list[Any]) -> tuple[set[str], set[str]]:
    """Return (file_paths, dir_paths) declared by graph nodes."""
    file_paths: set[str] = set()
    dir_paths: set[str] = set()

    for raw_node in raw_nodes:
        if not isinstance(raw_node, dict):
            continue
        path = raw_node.get("path")
        if not path:
            continue
        normalized = Path(str(path)).as_posix()
        if Path(normalized).suffix:
            file_paths.add(normalized)
        else:
            dir_paths.add(normalized)

    return file_paths, dir_paths


def classify(doc_path: str, file_paths: set[str], dir_paths: set[str]) -> str:
    if doc_path in file_paths:
        return "mapped"
    if any(doc_path.startswith(d + "/") for d in dir_paths):
        return "dir-covered"
    return "unmapped"


def is_core(doc_path: str) -> bool:
    return any(doc_path.startswith(root + "/") for root in CORE_ROOTS)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check which documentation files are missing a dedicated graph node."
    )
    parser.add_argument(
        "--yaml-path",
        default=DEFAULT_YAML_PATH,
        help=f"Path to the canonical YAML graph. Defaults to {DEFAULT_YAML_PATH}.",
    )
    parser.add_argument(
        "--root",
        default=SCAN_ROOT,
        help=f"Root directory to scan for *.md files. Defaults to {SCAN_ROOT}.",
    )
    parser.add_argument(
        "--strict-core",
        action="store_true",
        help=(
            "Exit with status 1 if any file under a core root "
            f"({', '.join(CORE_ROOTS)}) lacks an exact-path node."
        ),
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")

    args = parse_args(argv)

    try:
        raw_graph = load_yaml(Path(args.yaml_path))
    except CoverageCheckError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    file_paths, dir_paths = collect_node_paths(raw_graph["nodes"])

    core_unmapped: list[str] = []
    core_dir_covered: list[str] = []
    other_unmapped: list[str] = []
    other_dir_covered: list[str] = []
    mapped_count = 0

    for md_path in sorted(Path(args.root).rglob("*.md")):
        doc_path = md_path.as_posix()
        status = classify(doc_path, file_paths, dir_paths)

        if status == "mapped":
            mapped_count += 1
            continue

        if is_core(doc_path):
            if status == "dir-covered":
                core_dir_covered.append(doc_path)
            else:
                core_unmapped.append(doc_path)
        else:
            if status == "dir-covered":
                other_dir_covered.append(doc_path)
            else:
                other_unmapped.append(doc_path)

    print(f"Doc graph coverage ({args.root})")
    print(f"- exact-mapped: {mapped_count}")
    print(f"- core roots: {', '.join(CORE_ROOTS)}")

    if core_unmapped or core_dir_covered:
        print("- core docs without a dedicated node:")
        for doc_path in core_unmapped:
            print(f"  - {doc_path} (unmapped)")
        for doc_path in core_dir_covered:
            print(f"  - {doc_path} (covered only by a parent directory node)")
    else:
        print("- core docs without a dedicated node: none")

    if other_unmapped or other_dir_covered:
        print("- other docs without a dedicated node (informational):")
        for doc_path in other_unmapped:
            print(f"  - {doc_path} (unmapped)")
        for doc_path in other_dir_covered:
            print(f"  - {doc_path} (covered only by a parent directory node)")

    if args.strict_core and (core_unmapped or core_dir_covered):
        print(
            "::error::Core documentation files are missing dedicated graph nodes. "
            f"Add entries to {args.yaml_path} and run 'python build-graph.py --pretty'.",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
