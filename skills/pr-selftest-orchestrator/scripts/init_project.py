#!/usr/bin/env python3
"""Initialize the per-repository .pr-selftest context without overwriting data."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def copy_missing(template: Path, destination: Path) -> tuple[int, int]:
    created = 0
    skipped = 0
    for source in sorted(template.rglob("*")):
        relative = source.relative_to(template)
        target = destination / relative
        if source.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            skipped += 1
            continue
        shutil.copy2(source, target)
        created += 1
    return created, skipped


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create missing .pr-selftest project context files safely."
    )
    parser.add_argument(
        "--project",
        default=".",
        help="Repository root. Defaults to the current directory.",
    )
    args = parser.parse_args()

    project = Path(args.project).expanduser().resolve()
    if not project.exists() or not project.is_dir():
        parser.error(f"Project directory does not exist: {project}")

    skill_root = Path(__file__).resolve().parent.parent
    template = skill_root / "assets" / "project-template" / ".pr-selftest"
    if not template.is_dir():
        raise SystemExit(f"Project template is missing: {template}")

    destination = project / ".pr-selftest"
    destination.mkdir(parents=True, exist_ok=True)
    created, skipped = copy_missing(template, destination)

    print(f"Project context: {destination}")
    print(f"Created {created} file(s); preserved {skipped} existing file(s).")
    print("Next: fill background/*.md, update config.json, then run doctor.py.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

