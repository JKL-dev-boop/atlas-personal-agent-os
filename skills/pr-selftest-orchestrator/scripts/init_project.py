#!/usr/bin/env python3
"""Initialize the per-repository .pr-selftest context without overwriting data."""

from __future__ import annotations

import argparse
import os
import shutil
import stat
from pathlib import Path


def is_link_like(path: Path) -> bool:
    if path.is_symlink():
        return True
    if hasattr(os.path, "isjunction") and os.path.isjunction(path):
        return True
    try:
        attributes = getattr(path.lstat(), "st_file_attributes", 0)
    except FileNotFoundError:
        return False
    return bool(attributes & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0))


def reject_link_components(path: Path, boundary: Path | None = None) -> None:
    current = path.absolute()
    boundary = boundary.absolute() if boundary else None
    while True:
        if is_link_like(current):
            raise ValueError(f"Refusing symlink, junction, or reparse path: {current}")
        if boundary is not None and current == boundary:
            return
        if current.parent == current:
            if boundary is not None:
                raise ValueError(f"Path is outside the project boundary: {path}")
            return
        current = current.parent


def copy_missing(template: Path, destination: Path) -> tuple[int, int]:
    created = 0
    skipped = 0
    for source in sorted(template.rglob("*")):
        if is_link_like(source):
            raise ValueError(f"Template contains a link-like entry: {source}")
        relative = source.relative_to(template)
        target = destination / relative
        reject_link_components(target.parent, destination)
        if source.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            reject_link_components(target, destination)
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        reject_link_components(target.parent, destination)
        if is_link_like(target):
            raise ValueError(f"Refusing link-like destination: {target}")
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

    requested_project = Path(args.project).expanduser().absolute()
    reject_link_components(requested_project)
    project = requested_project.resolve(strict=True)
    if not project.exists() or not project.is_dir():
        parser.error(f"Project directory does not exist: {project}")

    skill_root = Path(__file__).resolve().parent.parent
    template = skill_root / "assets" / "project-template" / ".pr-selftest"
    if not template.is_dir():
        raise SystemExit(f"Project template is missing: {template}")

    destination = project / ".pr-selftest"
    if is_link_like(destination):
        parser.error(f"Refusing link-like project context: {destination}")
    destination.mkdir(parents=True, exist_ok=True)
    reject_link_components(destination, project)
    try:
        created, skipped = copy_missing(template, destination)
    except ValueError as exc:
        parser.error(str(exc))

    print(f"Project context: {destination}")
    print(f"Created {created} file(s); preserved {skipped} existing file(s).")
    print("Next: fill background/*.md, update config.json, then run doctor.py.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
