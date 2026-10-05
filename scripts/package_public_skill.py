#!/usr/bin/env python3
"""Build the reviewed, deterministic public ZIP for an ATLAS Skill."""

from __future__ import annotations

import argparse
import hashlib
import json
import stat
import zipfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath


SKILL_SLUG = "pr-selftest-orchestrator"
PACKAGE_VERSION = "2026-10-05"
FIXED_TIMESTAMP = (2026, 10, 5, 10, 34, 0)
MAX_FILE_BYTES = 5 * 1024 * 1024
MAX_PACKAGE_BYTES = 25 * 1024 * 1024

PUBLIC_FILES = (
    "SKILL.md",
    "QUICKSTART.md",
    "LICENSE_STATUS.md",
    "agents/openai.yaml",
    "assets/icon.svg",
    "assets/report-template.html",
    "assets/project-template/.pr-selftest/.gitignore",
    "assets/project-template/.pr-selftest/config.json",
    "assets/project-template/.pr-selftest/background/API_CATALOG.md",
    "assets/project-template/.pr-selftest/background/DIAGNOSTICS.md",
    "assets/project-template/.pr-selftest/background/ENVIRONMENTS.md",
    "assets/project-template/.pr-selftest/background/EVIDENCE.md",
    "assets/project-template/.pr-selftest/background/PROJECT.md",
    "assets/project-template/.pr-selftest/background/TEST_POLICY.md",
    "assets/project-template/.pr-selftest/runbooks/index.json",
    "assets/project-template/.pr-selftest/runbooks/archive/.gitkeep",
    "assets/project-template/.pr-selftest/runbooks/candidates/.gitkeep",
    "assets/project-template/.pr-selftest/runbooks/quarantined/.gitkeep",
    "assets/project-template/.pr-selftest/runbooks/shadow/.gitkeep",
    "assets/project-template/.pr-selftest/runbooks/verified/.gitkeep",
    "assets/project-template/.pr-selftest/runs/.gitkeep",
    "references/context-contract.md",
    "references/diagnostic-provider-prompt.md",
    "references/evidence-contract.md",
    "references/learning-lifecycle.md",
    "references/report-contract.md",
    "references/runner-adapter.md",
    "references/test-plan-contract.md",
    "references/workflow.md",
    "scripts/doctor.py",
    "scripts/evidence_store.py",
    "scripts/init_project.py",
    "scripts/render_report.py",
)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def zip_info(name: str) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(name, FIXED_TIMESTAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 3
    info.external_attr = (stat.S_IFREG | 0o644) << 16
    return info


def build_package(skill_root: Path, output: Path) -> dict[str, object]:
    skill_root = skill_root.resolve(strict=True)
    if skill_root.name != SKILL_SLUG:
        raise ValueError(f"Expected source directory named {SKILL_SLUG}: {skill_root}")

    files: list[dict[str, object]] = []
    payloads: list[tuple[str, bytes]] = []
    total_bytes = 0
    for relative_text in PUBLIC_FILES:
        relative = PurePosixPath(relative_text)
        source = skill_root.joinpath(*relative.parts)
        if source.is_symlink() or not source.is_file():
            raise ValueError(f"Missing or link-like public file: {relative_text}")
        payload = source.read_bytes()
        if len(payload) > MAX_FILE_BYTES:
            raise ValueError(f"Public file exceeds {MAX_FILE_BYTES} bytes: {relative_text}")
        total_bytes += len(payload)
        payloads.append((relative_text, payload))
        files.append({"path": relative_text, "sizeBytes": len(payload), "sha256": sha256_bytes(payload)})

    if total_bytes > MAX_PACKAGE_BYTES:
        raise ValueError(f"Expanded package exceeds {MAX_PACKAGE_BYTES} bytes")

    manifest = {
        "schemaVersion": 1,
        "skillSlug": SKILL_SLUG,
        "packageVersion": PACKAGE_VERSION,
        "generatedAt": datetime(2026, 10, 5, 10, 34, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z"),
        "source": "https://github.com/JKL-dev-boop/atlas-personal-agent-os/tree/master/skills/pr-selftest-orchestrator",
        "licenseStatus": "personal-or-authorized-internal-evaluation",
        "fileCount": len(files),
        "unpackedBytes": total_bytes,
        "files": files,
    }
    manifest_payload = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")

    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative_text, payload in payloads:
            archive.writestr(zip_info(f"{SKILL_SLUG}/{relative_text}"), payload)
        archive.writestr(zip_info(f"{SKILL_SLUG}/PACKAGE_MANIFEST.json"), manifest_payload)

    result = {
        "output": str(output.resolve()),
        "sha256": sha256_file(output),
        "sizeBytes": output.stat().st_size,
        "entryCount": len(PUBLIC_FILES) + 1,
        "unpackedBytes": total_bytes + len(manifest_payload),
    }
    sidecar = {
        **manifest,
        "archive": {
            "fileName": output.name,
            "sha256": result["sha256"],
            "sizeBytes": result["sizeBytes"],
            "entryCount": result["entryCount"],
        },
    }
    manifest_output = output.with_suffix(".manifest.json")
    manifest_output.write_text(
        json.dumps(sidecar, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    result["manifest"] = str(manifest_output.resolve())
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = build_package(args.source, args.output)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
