#!/usr/bin/env python3
"""Store bounded test evidence and maintain an integrity manifest."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TYPE_FOLDERS = {
    "request_response": ("requests",),
    "log_context": ("logs",),
    "db_before": ("db", "before"),
    "db_after": ("db", "after"),
    "db_diff": ("db", "diff"),
    "db_cleanup": ("db", "cleanup"),
    "miracle_ops": ("miracle-ops",),
    "other": ("other",),
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def safe_segment(value: str, label: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip(".-")
    if not cleaned or cleaned in {".", ".."}:
        raise ValueError(f"Invalid {label}: {value!r}")
    return cleaned


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def ensure_under(path: Path, root: Path) -> Path:
    resolved = path.resolve()
    try:
        resolved.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"Path escapes the run directory: {resolved}") from exc
    return resolved


def manifest_path(run_dir: Path) -> Path:
    return run_dir / "evidence" / "manifest.json"


def load_manifest(run_dir: Path) -> dict[str, Any]:
    path = manifest_path(run_dir)
    if not path.exists():
        return {
            "schema_version": "1.0",
            "run_id": run_dir.name,
            "created_at": utc_now(),
            "finalized": False,
            "evidence": [],
        }
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("evidence"), list):
        raise ValueError(f"Invalid evidence manifest: {path}")
    return data


def ensure_mutable(run_dir: Path) -> None:
    if load_manifest(run_dir).get("finalized"):
        raise ValueError("Evidence manifest is finalized and cannot be changed")


def save_manifest(run_dir: Path, manifest: dict[str, Any]) -> None:
    path = manifest_path(run_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temp_name = tempfile.mkstemp(prefix="manifest-", suffix=".json", dir=path.parent)
    try:
        with os.fdopen(handle, "w", encoding="utf-8", newline="\n") as temp:
            json.dump(manifest, temp, ensure_ascii=False, indent=2)
            temp.write("\n")
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)


def parse_metadata(raw: str | None) -> dict[str, Any]:
    if raw is None:
        return {}
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError("--metadata-json must be a JSON object")
    return value


def new_evidence_id(case_id: str, evidence_type: str) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    return f"EV-{safe_segment(case_id, 'case ID')}-{evidence_type}-{stamp}-{uuid.uuid4().hex[:8]}"


def register_file(
    run_dir: Path,
    case_id: str,
    evidence_type: str,
    source: str,
    stored_path: Path,
    correlation_ids: list[str],
    metadata: dict[str, Any],
) -> dict[str, Any]:
    manifest = load_manifest(run_dir)
    if manifest.get("finalized"):
        raise ValueError("Evidence manifest is finalized and cannot be changed")
    stored_path = ensure_under(stored_path, run_dir)
    relative = stored_path.relative_to(run_dir).as_posix()
    item = {
        "id": new_evidence_id(case_id, evidence_type),
        "case_id": case_id,
        "type": evidence_type,
        "source": source,
        "path": relative,
        "captured_at": utc_now(),
        "size_bytes": stored_path.stat().st_size,
        "sha256": sha256_file(stored_path),
        "correlation_ids": correlation_ids,
        "metadata": metadata,
    }
    manifest["evidence"].append(item)
    manifest["updated_at"] = utc_now()
    save_manifest(run_dir, manifest)
    return item


def destination_for(run_dir: Path, case_id: str, evidence_type: str, filename: str) -> Path:
    folder = run_dir / "evidence" / safe_segment(case_id, "case ID")
    for segment in TYPE_FOLDERS[evidence_type]:
        folder /= segment
    folder.mkdir(parents=True, exist_ok=True)
    clean_name = safe_segment(filename, "file name")
    candidate = folder / clean_name
    if not candidate.exists():
        return candidate
    return folder / f"{candidate.stem}-{uuid.uuid4().hex[:8]}{candidate.suffix}"


def command_add(args: argparse.Namespace) -> int:
    run_dir = Path(args.run_dir).expanduser().resolve()
    source_file = Path(args.file).expanduser().resolve()
    if not source_file.is_file():
        raise ValueError(f"Evidence file does not exist: {source_file}")
    run_dir.mkdir(parents=True, exist_ok=True)
    ensure_mutable(run_dir)
    destination = destination_for(run_dir, args.case_id, args.type, source_file.name)
    shutil.copy2(source_file, destination)
    item = register_file(
        run_dir,
        args.case_id,
        args.type,
        args.source,
        destination,
        args.correlation_id or [],
        parse_metadata(args.metadata_json),
    )
    print(json.dumps(item, ensure_ascii=False))
    return 0


def json_diff(before: Any, after: Any, path: str = "$") -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = {"added": [], "removed": [], "changed": []}
    if isinstance(before, dict) and isinstance(after, dict):
        for key in sorted(before.keys() - after.keys()):
            result["removed"].append({"path": f"{path}.{key}", "before": before[key]})
        for key in sorted(after.keys() - before.keys()):
            result["added"].append({"path": f"{path}.{key}", "after": after[key]})
        for key in sorted(before.keys() & after.keys()):
            child = json_diff(before[key], after[key], f"{path}.{key}")
            for category in result:
                result[category].extend(child[category])
    elif isinstance(before, list) and isinstance(after, list):
        common = min(len(before), len(after))
        for index in range(common):
            child = json_diff(before[index], after[index], f"{path}[{index}]")
            for category in result:
                result[category].extend(child[category])
        for index in range(common, len(before)):
            result["removed"].append({"path": f"{path}[{index}]", "before": before[index]})
        for index in range(common, len(after)):
            result["added"].append({"path": f"{path}[{index}]", "after": after[index]})
    elif before != after:
        result["changed"].append({"path": path, "before": before, "after": after})
    return result


def command_diff_json(args: argparse.Namespace) -> int:
    run_dir = Path(args.run_dir).expanduser().resolve()
    ensure_mutable(run_dir)
    before_path = Path(args.before).expanduser().resolve()
    after_path = Path(args.after).expanduser().resolve()
    before = json.loads(before_path.read_text(encoding="utf-8"))
    after = json.loads(after_path.read_text(encoding="utf-8"))
    changes = json_diff(before, after)
    payload = {
        "schema_version": "1.0",
        "source": args.source,
        "before_file": before_path.name,
        "after_file": after_path.name,
        "summary": {category: len(items) for category, items in changes.items()},
        "changes": changes,
    }
    destination = destination_for(run_dir, args.case_id, "db_diff", f"{safe_segment(args.source, 'source')}-diff.json")
    destination.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    item = register_file(
        run_dir,
        args.case_id,
        "db_diff",
        args.source,
        destination,
        args.correlation_id or [],
        payload["summary"],
    )
    print(json.dumps(item, ensure_ascii=False))
    return 0


def command_finalize(args: argparse.Namespace) -> int:
    run_dir = Path(args.run_dir).expanduser().resolve()
    manifest = load_manifest(run_dir)
    if manifest.get("finalized"):
        print(f"Already finalized: {manifest_path(run_dir)}")
        return 0
    errors: list[str] = []
    for item in manifest["evidence"]:
        path = ensure_under(run_dir / item["path"], run_dir)
        if not path.is_file():
            errors.append(f"missing: {item['path']}")
            continue
        actual = sha256_file(path)
        if actual != item.get("sha256"):
            errors.append(f"hash mismatch: {item['path']}")
    if errors:
        raise ValueError("Cannot finalize evidence manifest; " + "; ".join(errors))
    manifest["finalized"] = True
    manifest["finalized_at"] = utc_now()
    save_manifest(run_dir, manifest)
    print(f"Finalized {len(manifest['evidence'])} evidence item(s): {manifest_path(run_dir)}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Store and verify PR self-test evidence.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    add = subparsers.add_parser("add", help="Copy one evidence file into a run and index it.")
    add.add_argument("--run-dir", required=True)
    add.add_argument("--case-id", required=True)
    add.add_argument("--type", required=True, choices=sorted(TYPE_FOLDERS))
    add.add_argument("--source", required=True)
    add.add_argument("--file", required=True)
    add.add_argument("--correlation-id", action="append")
    add.add_argument("--metadata-json")
    add.set_defaults(handler=command_add)

    diff = subparsers.add_parser("diff-json", help="Generate and index a structured JSON state diff.")
    diff.add_argument("--run-dir", required=True)
    diff.add_argument("--case-id", required=True)
    diff.add_argument("--source", required=True)
    diff.add_argument("--before", required=True)
    diff.add_argument("--after", required=True)
    diff.add_argument("--correlation-id", action="append")
    diff.set_defaults(handler=command_diff_json)

    finalize = subparsers.add_parser("finalize", help="Verify hashes and lock the manifest.")
    finalize.add_argument("--run-dir", required=True)
    finalize.set_defaults(handler=command_finalize)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.handler(args)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        parser.error(str(exc))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
