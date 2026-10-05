#!/usr/bin/env python3
"""Store bounded test evidence and maintain an integrity manifest."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import stat
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
    "diagnostics": ("diagnostics",),
    "other": ("other",),
}

MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024
MAX_RUN_EVIDENCE_BYTES = 25 * 1024 * 1024
MAX_DIFF_CHANGES = 2_000
SENSITIVE_KEY = re.compile(
    r"(?:authorization|cookie|set-cookie|password|passwd|secret|token|credential|api[_-]?key|private[_-]?key)",
    re.IGNORECASE,
)
SENSITIVE_BYTES = (
    re.compile(br"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(br"Authorization\s*:\s*Bearer\s+(?!\$\{|<|TODO_)[^\s'\"]+", re.IGNORECASE),
    re.compile(
        br"(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9_./+=-]{12,}",
        re.IGNORECASE,
    ),
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def safe_segment(value: str, label: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip(".-")
    if not cleaned or cleaned in {".", ".."}:
        raise ValueError(f"Invalid {label}: {value!r}")
    return cleaned


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
                raise ValueError(f"Path is outside the run boundary: {path}")
            return
        current = current.parent


def validate_run_dir(raw: str) -> Path:
    requested = Path(raw).expanduser().absolute()
    if requested.parent.name != "runs" or requested.parent.parent.name != ".pr-selftest":
        raise ValueError("--run-dir must be <project>/.pr-selftest/runs/<run-id>")
    if requested.name != safe_segment(requested.name, "run ID"):
        raise ValueError(f"Invalid run directory name: {requested.name!r}")
    reject_link_components(requested.parent)
    if not requested.parent.is_dir():
        raise ValueError(f"Initialized runs directory does not exist: {requested.parent}")
    if is_link_like(requested):
        raise ValueError(f"Refusing link-like run directory: {requested}")
    return requested.parent.resolve(strict=True) / requested.name


def validate_input_file(raw: str, label: str) -> Path:
    requested = Path(raw).expanduser().absolute()
    reject_link_components(requested)
    path = requested.resolve(strict=True)
    if not path.is_file():
        raise ValueError(f"{label} does not exist: {path}")
    if path.stat().st_size > MAX_EVIDENCE_FILE_BYTES:
        raise ValueError(f"{label} exceeds {MAX_EVIDENCE_FILE_BYTES} bytes: {path}")
    return path


def reject_embedded_secrets(path: Path) -> None:
    payload = path.read_bytes()
    for pattern in SENSITIVE_BYTES:
        if pattern.search(payload):
            raise ValueError(f"Possible credential material in {path.name}; redact it before capture")


def redact_sensitive(value: Any, key: str = "") -> Any:
    if key and SENSITIVE_KEY.search(key):
        return "<redacted>"
    if isinstance(value, dict):
        return {item_key: redact_sensitive(item_value, str(item_key)) for item_key, item_value in value.items()}
    if isinstance(value, list):
        return [redact_sensitive(item) for item in value]
    if isinstance(value, str):
        value = re.sub(
            r"Bearer\s+(?!\$\{|<|TODO_)[^\s'\"]+",
            "Bearer <redacted>",
            value,
            flags=re.IGNORECASE,
        )
    return value


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def ensure_under(path: Path, root: Path) -> Path:
    reject_link_components(path.parent, root)
    if is_link_like(path):
        raise ValueError(f"Refusing link-like evidence path: {path}")
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
    if is_link_like(path):
        raise ValueError(f"Refusing link-like evidence manifest: {path}")
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
    ensure_under(path, run_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    reject_link_components(path.parent, run_dir)
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
    return redact_sensitive(value)


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
    current_size = sum(int(existing.get("size_bytes", 0)) for existing in manifest["evidence"])
    if current_size + stored_path.stat().st_size > MAX_RUN_EVIDENCE_BYTES:
        raise ValueError(f"Run evidence would exceed {MAX_RUN_EVIDENCE_BYTES} bytes")
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
        "metadata": redact_sensitive(metadata),
    }
    manifest["evidence"].append(item)
    manifest["updated_at"] = utc_now()
    save_manifest(run_dir, manifest)
    return item


def destination_for(run_dir: Path, case_id: str, evidence_type: str, filename: str) -> Path:
    folder = run_dir / "evidence" / safe_segment(case_id, "case ID")
    for segment in TYPE_FOLDERS[evidence_type]:
        folder /= segment
    ensure_under(folder, run_dir)
    folder.mkdir(parents=True, exist_ok=True)
    reject_link_components(folder, run_dir)
    clean_name = safe_segment(filename, "file name")
    candidate = folder / clean_name
    ensure_under(candidate, run_dir)
    if not candidate.exists():
        return candidate
    return folder / f"{candidate.stem}-{uuid.uuid4().hex[:8]}{candidate.suffix}"


def command_add(args: argparse.Namespace) -> int:
    run_dir = validate_run_dir(args.run_dir)
    source_file = validate_input_file(args.file, "Evidence file")
    reject_embedded_secrets(source_file)
    run_dir.mkdir(parents=True, exist_ok=True)
    reject_link_components(run_dir, run_dir.parent)
    ensure_mutable(run_dir)
    manifest = load_manifest(run_dir)
    current_size = sum(int(item.get("size_bytes", 0)) for item in manifest["evidence"])
    if current_size + source_file.stat().st_size > MAX_RUN_EVIDENCE_BYTES:
        raise ValueError(f"Run evidence would exceed {MAX_RUN_EVIDENCE_BYTES} bytes")
    destination = destination_for(run_dir, args.case_id, args.type, source_file.name)
    handle, temp_name = tempfile.mkstemp(prefix="evidence-", suffix=".tmp", dir=destination.parent)
    os.close(handle)
    try:
        shutil.copy2(source_file, temp_name)
        os.replace(temp_name, destination)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)
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
    run_dir = validate_run_dir(args.run_dir)
    run_dir.mkdir(parents=True, exist_ok=True)
    reject_link_components(run_dir, run_dir.parent)
    ensure_mutable(run_dir)
    before_path = validate_input_file(args.before, "Before JSON")
    after_path = validate_input_file(args.after, "After JSON")
    reject_embedded_secrets(before_path)
    reject_embedded_secrets(after_path)
    before = redact_sensitive(json.loads(before_path.read_text(encoding="utf-8")))
    after = redact_sensitive(json.loads(after_path.read_text(encoding="utf-8")))
    changes = json_diff(before, after)
    change_count = sum(len(items) for items in changes.values())
    if change_count > MAX_DIFF_CHANGES:
        raise ValueError(f"Diff contains {change_count} changes; limit is {MAX_DIFF_CHANGES}")
    payload = {
        "schema_version": "1.0",
        "source": args.source,
        "before_file": before_path.name,
        "after_file": after_path.name,
        "summary": {category: len(items) for category, items in changes.items()},
        "changes": changes,
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    rendered_size = len(rendered.encode("utf-8"))
    if rendered_size > MAX_EVIDENCE_FILE_BYTES:
        raise ValueError(f"Rendered diff exceeds {MAX_EVIDENCE_FILE_BYTES} bytes")
    manifest = load_manifest(run_dir)
    current_size = sum(int(item.get("size_bytes", 0)) for item in manifest["evidence"])
    if current_size + rendered_size > MAX_RUN_EVIDENCE_BYTES:
        raise ValueError(f"Run evidence would exceed {MAX_RUN_EVIDENCE_BYTES} bytes")
    destination = destination_for(run_dir, args.case_id, "db_diff", f"{safe_segment(args.source, 'source')}-diff.json")
    destination.write_text(rendered, encoding="utf-8")
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
    run_dir = validate_run_dir(args.run_dir)
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
