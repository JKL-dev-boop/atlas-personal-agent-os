#!/usr/bin/env python3
"""Publish the reviewed upstream Skill ZIP without changing its bytes."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import stat
import zipfile
from pathlib import Path, PurePosixPath


SKILL_SLUG = "pr-selftest-orchestrator"
PACKAGE_VERSION = "2026-10-05-r2"
EXPECTED_ARCHIVE_SHA256 = (
    "0796bdf734cb33be41f93b7c6f045b28673dab2f6ebfd948d6824f95e5002e4a"
)
SOURCE_ARTIFACT_COMPLETED_AT = "2026-10-05T09:27:17Z"
PUBLISHED_AT = "2026-10-05T11:09:24Z"
MAX_FILE_BYTES = 5 * 1024 * 1024
MAX_PACKAGE_BYTES = 25 * 1024 * 1024

PUBLIC_FILES = (
    "SKILL.md",
    "QUICKSTART.md",
    "agents/openai.yaml",
    "assets/icon.svg",
    "assets/report-preview.html",
    "assets/report-template.html",
    "assets/sample-results.json",
    "assets/project-template/.pr-selftest/.gitignore",
    "assets/project-template/.pr-selftest/config.json",
    "assets/project-template/.pr-selftest/background/API_CATALOG.md",
    "assets/project-template/.pr-selftest/background/ENVIRONMENTS.md",
    "assets/project-template/.pr-selftest/background/EVIDENCE.md",
    "assets/project-template/.pr-selftest/background/MIRACLE_OPS.md",
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
    "references/evidence-contract.md",
    "references/learning-lifecycle.md",
    "references/miracle-ops-prompt.md",
    "references/report-contract.md",
    "references/runner-adapter.md",
    "references/test-plan-contract.md",
    "references/workflow.md",
    "scripts/doctor.py",
    "scripts/evidence_store.py",
    "scripts/init_project.py",
    "scripts/install.ps1",
    "scripts/install.sh",
    "scripts/render_report.py",
)

ALLOWED_DIRECTORY_ENTRIES = ("assets/project-template/",)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_relative_path(name: str) -> None:
    if not name or "\x00" in name or "\\" in name or name.startswith("/"):
        raise ValueError(f"Unsafe archive entry: {name!r}")
    relative = PurePosixPath(name)
    if relative.is_absolute() or any(part in {"", ".", ".."} for part in relative.parts):
        raise ValueError(f"Unsafe archive entry: {name!r}")
    for part in relative.parts:
        if ":" in part or part.endswith((".", " ")):
            raise ValueError(f"Unsafe archive entry: {name!r}")


def source_inventory(skill_root: Path) -> tuple[list[dict[str, object]], int]:
    skill_root = skill_root.resolve(strict=True)
    if skill_root.name != SKILL_SLUG:
        raise ValueError(f"Expected source directory named {SKILL_SLUG}: {skill_root}")

    actual = {
        path.relative_to(skill_root).as_posix()
        for path in skill_root.rglob("*")
        if path.is_file()
    }
    expected = set(PUBLIC_FILES)
    if actual != expected:
        missing = sorted(expected - actual)
        extra = sorted(actual - expected)
        raise ValueError(f"Source inventory mismatch; missing={missing}, extra={extra}")

    files: list[dict[str, object]] = []
    total_bytes = 0
    for relative_text in PUBLIC_FILES:
        source = skill_root.joinpath(*PurePosixPath(relative_text).parts)
        if source.is_symlink() or not source.is_file():
            raise ValueError(f"Missing or link-like public file: {relative_text}")
        payload = source.read_bytes()
        if len(payload) > MAX_FILE_BYTES:
            raise ValueError(f"Public file exceeds {MAX_FILE_BYTES} bytes: {relative_text}")
        total_bytes += len(payload)
        files.append(
            {
                "path": relative_text,
                "sizeBytes": len(payload),
                "sha256": sha256_bytes(payload),
            }
        )
    if total_bytes > MAX_PACKAGE_BYTES:
        raise ValueError(f"Expanded package exceeds {MAX_PACKAGE_BYTES} bytes")
    return files, total_bytes


def validate_upstream_archive(archive_path: Path, skill_root: Path) -> tuple[int, int]:
    actual_hash = sha256_file(archive_path)
    if actual_hash != EXPECTED_ARCHIVE_SHA256:
        raise ValueError(
            f"Upstream archive hash mismatch: expected {EXPECTED_ARCHIVE_SHA256}, got {actual_hash}"
        )

    expected_files = {f"{SKILL_SLUG}/{path}" for path in PUBLIC_FILES}
    expected_directories = {
        f"{SKILL_SLUG}/{path}" for path in ALLOWED_DIRECTORY_ENTRIES
    }
    with zipfile.ZipFile(archive_path, "r") as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        if len(names) != len(set(names)) or len(names) != len({name.casefold() for name in names}):
            raise ValueError("Archive contains duplicate or case-colliding entries")
        for entry in entries:
            validate_relative_path(entry.filename.rstrip("/"))
            unix_mode = entry.external_attr >> 16
            if unix_mode and stat.S_ISLNK(unix_mode):
                raise ValueError(f"Archive contains a symbolic link: {entry.filename}")

        file_names = {entry.filename for entry in entries if not entry.is_dir()}
        directory_names = {entry.filename for entry in entries if entry.is_dir()}
        if file_names != expected_files or directory_names != expected_directories:
            missing = sorted((expected_files | expected_directories) - set(names))
            extra = sorted(set(names) - (expected_files | expected_directories))
            raise ValueError(f"Archive inventory mismatch; missing={missing}, extra={extra}")

        expanded_bytes = 0
        for relative_text in PUBLIC_FILES:
            archive_name = f"{SKILL_SLUG}/{relative_text}"
            payload = archive.read(archive_name)
            expanded_bytes += len(payload)
            source_payload = skill_root.joinpath(*PurePosixPath(relative_text).parts).read_bytes()
            if payload != source_payload:
                raise ValueError(f"Archive/source mismatch: {relative_text}")
            if len(payload) > MAX_FILE_BYTES:
                raise ValueError(f"Archive member exceeds {MAX_FILE_BYTES} bytes: {archive_name}")
        if expanded_bytes > MAX_PACKAGE_BYTES:
            raise ValueError(f"Expanded archive exceeds {MAX_PACKAGE_BYTES} bytes")
        return len(entries), expanded_bytes


def publish_exact_package(skill_root: Path, archive_path: Path, output: Path) -> dict[str, object]:
    skill_root = skill_root.resolve(strict=True)
    archive_path = archive_path.resolve(strict=True)
    files, source_bytes = source_inventory(skill_root)
    entry_count, expanded_bytes = validate_upstream_archive(archive_path, skill_root)
    if source_bytes != expanded_bytes:
        raise ValueError("Source/archive expanded byte counts differ")

    output.parent.mkdir(parents=True, exist_ok=True)
    if archive_path != output.resolve():
        shutil.copyfile(archive_path, output)
    if sha256_file(output) != EXPECTED_ARCHIVE_SHA256:
        raise ValueError("Published archive bytes changed during copy")

    sidecar = {
        "schemaVersion": 1,
        "skillSlug": SKILL_SLUG,
        "packageVersion": PACKAGE_VERSION,
        "generatedAt": PUBLISHED_AT,
        "source": (
            "https://github.com/JKL-dev-boop/atlas-personal-agent-os/"
            "tree/master/skills/pr-selftest-orchestrator"
        ),
        "provenance": {
            "conversationTitle": "小分析师",
            "artifactCompletedAt": SOURCE_ARTIFACT_COMPLETED_AT,
            "archiveBytesPreserved": True,
        },
        "licenseStatus": "not-declared",
        "fileCount": len(files),
        "directoryEntryCount": len(ALLOWED_DIRECTORY_ENTRIES),
        "unpackedBytes": expanded_bytes,
        "files": files,
        "archive": {
            "fileName": output.name,
            "sha256": EXPECTED_ARCHIVE_SHA256,
            "sizeBytes": output.stat().st_size,
            "entryCount": entry_count,
        },
    }
    manifest_output = output.with_suffix(".manifest.json")
    manifest_output.write_text(
        json.dumps(sidecar, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {
        "output": str(output.resolve()),
        "manifest": str(manifest_output.resolve()),
        "sha256": EXPECTED_ARCHIVE_SHA256,
        "sizeBytes": output.stat().st_size,
        "entryCount": entry_count,
        "fileCount": len(files),
        "unpackedBytes": expanded_bytes,
        "archiveBytesPreserved": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = publish_exact_package(args.source, args.archive, args.output)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
