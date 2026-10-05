#!/usr/bin/env python3
"""Validate the minimum project context required by the Skill."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


REQUIRED_BACKGROUND = (
    "PROJECT.md",
    "API_CATALOG.md",
    "ENVIRONMENTS.md",
    "MIRACLE_OPS.md",
    "TEST_POLICY.md",
    "EVIDENCE.md",
)


def emit(level: str, message: str) -> None:
    print(f"[{level}] {message}")


def load_json(path: Path, label: str, errors: list[str]) -> object | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"Missing {label}: {path}")
    except json.JSONDecodeError as exc:
        errors.append(f"Invalid JSON in {label} at line {exc.lineno}: {path}")
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Check .pr-selftest configuration health.")
    parser.add_argument("--project", default=".", help="Repository root.")
    args = parser.parse_args()

    project = Path(args.project).expanduser().resolve()
    root = project / ".pr-selftest"
    errors: list[str] = []
    warnings: list[str] = []

    if not root.is_dir():
        emit("ERROR", f"Missing project context: {root}")
        emit("INFO", "Run init_project.py before using the Skill.")
        return 1

    config = load_json(root / "config.json", "config", errors)
    if isinstance(config, dict):
        if config.get("default_environment") in (None, "", "TODO_REQUIRED"):
            errors.append("config.json has no configured default_environment")
        else:
            emit("OK", f"Default environment: {config['default_environment']}")

    background = root / "background"
    combined_text: list[tuple[Path, str]] = []
    for name in REQUIRED_BACKGROUND:
        path = background / name
        if not path.is_file():
            errors.append(f"Missing required background file: {path}")
            continue
        text = path.read_text(encoding="utf-8")
        combined_text.append((path, text))
        required_count = text.count("TODO_REQUIRED")
        if required_count:
            errors.append(f"{name} contains {required_count} required placeholder(s)")
        elif len(text.strip()) < 80:
            warnings.append(f"{name} is unusually short")
        else:
            emit("OK", f"Loaded {name}")

    index = load_json(root / "runbooks" / "index.json", "runbook index", errors)
    if isinstance(index, dict):
        emit("OK", "Runbook index is valid JSON")

    required_dirs = (
        "candidates",
        "shadow",
        "verified",
        "quarantined",
        "archive",
    )
    for name in required_dirs:
        path = root / "runbooks" / name
        if not path.is_dir():
            errors.append(f"Missing runbook directory: {path}")

    # Warn without printing the possible secret value.
    live_bearer = re.compile(r"Bearer\s+(?!\$\{|<|TODO_)[^\s'\"]+", re.IGNORECASE)
    for path, text in combined_text:
        for line_number, line in enumerate(text.splitlines(), start=1):
            if live_bearer.search(line):
                warnings.append(
                    f"Possible literal bearer token in {path.name}:{line_number}; use a secret reference"
                )

    evidence_path = background / "EVIDENCE.md"
    if evidence_path.is_file():
        evidence_text = evidence_path.read_text(encoding="utf-8").lower()
        if "log profile" not in evidence_text:
            errors.append("EVIDENCE.md has no log profile")
        if "state snapshot" not in evidence_text:
            errors.append("EVIDENCE.md has no state snapshot profile")
        if "maximum rows" not in evidence_text:
            errors.append("EVIDENCE.md has no database/API snapshot row bound")

    for warning in warnings:
        emit("WARN", warning)
    for error in errors:
        emit("ERROR", error)

    if errors:
        emit("SUMMARY", f"Not ready: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1

    emit("SUMMARY", f"Ready: 0 errors, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
