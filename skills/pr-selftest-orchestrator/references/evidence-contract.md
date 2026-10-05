# Evidence capture contract

Evidence makes each test result independently reviewable. Collection is automatic after one-time project configuration and must not add repeated user steps.

## Storage layout

```text
.pr-selftest/runs/<run-id>/evidence/
├── manifest.json
└── <case-id>/
    ├── requests/
    ├── logs/
    ├── db/
    │   ├── before/
    │   ├── after/
    │   ├── diff/
    │   └── cleanup/
    └── diagnostics/
```

Every evidence item records an ID, case ID, type, source, capture time, content path, byte size, SHA-256 hash, correlation IDs, and source-specific metadata. Finalized items are immutable; a recapture creates a new item.

## Capture sequence

For each approved case:

1. Create the run/case evidence directory and manifest entry.
2. Capture the registered database or service-state baseline using stable keys and selected columns.
3. Record the exact approved request metadata, redacted request body, response, request ID, trace ID, and timing.
4. Capture the post-action state and compute a deterministic before/after diff.
5. On failure, collect bounded log context using correlation IDs and a configured time window. Store both the raw bounded excerpt and a smaller human-readable excerpt.
6. Pass only relevant evidence references to the configured diagnostic provider; retain its raw and normalized output.
7. Execute cleanup, capture the cleanup state, and verify restoration against the baseline or cleanup oracle.
8. Finalize the manifest and expose links in the report.

## Log evidence

Log profiles are declared in `EVIDENCE.md` and include:

- registered collector operation or existing project hook;
- service/container/pod/host scope;
- request/trace correlation fields;
- capture mode (`on_failure` or `always`);
- start/end padding, such as 30 seconds before and after the case;
- maximum lines and bytes;
- file format, usually JSONL or text;
- secret-field filtering policy.

Do not capture an unrestricted log stream. Preserve source identity, instance, service version, timezone, and time window so the excerpt can be interpreted later.

## Database and state evidence

Snapshot profiles declare reviewed read-only query or API operation IDs. They include stable key fields, selected business columns, ordering, maximum rows, and excluded fields. Never let the model generate arbitrary SQL.

Store:

- `before`: relevant rows or service state before the action;
- `after`: the same key scope after the action;
- `diff`: added, removed, and changed values using stable JSON paths;
- `cleanup`: final state after restoration.

Database evidence should be narrow enough to review. A full database dump is not permitted. If a case claims no mutation, the post-state comparison is its evidence.

## Manifest shape

```json
{
  "schema_version": "1.0",
  "run_id": "run-...",
  "finalized": false,
  "evidence": [
    {
      "id": "ev-...",
      "case_id": "TC-001",
      "type": "db_diff",
      "source": "resource-by-id",
      "captured_at": "...",
      "path": "evidence/TC-001/db/diff/ev-....json",
      "size_bytes": 512,
      "sha256": "...",
      "correlation_ids": ["req-..."],
      "metadata": {
        "key_fields": ["id"],
        "row_count_before": 1,
        "row_count_after": 1
      }
    }
  ]
}
```

## Simplicity rules

- The user selects test cases, not individual evidence files.
- Use project defaults automatically and show a short evidence summary in the plan.
- Ask only if evidence collection would be unsafe, unavailable, or materially expensive.
- A single report links all evidence; users do not need to browse directories manually.
- If an evidence source is unavailable, continue only when policy permits and label the affected assertion `EVIDENCE_INCOMPLETE`.

## Integrity and retention

- Compute SHA-256 when adding each file and again before finalization.
- Do not overwrite finalized evidence.
- Use the retention and size limits from `EVIDENCE.md`.
- The bundled helper enforces a 5 MiB file limit, 25 MiB run limit, a `.pr-selftest/runs/<run-id>` path boundary, and rejects link-like destinations. Project policy may be stricter but not looser without a reviewed code change.
- Default filtering may preserve full business values inside an approved internal environment, but credentials, tokens, passwords, private keys, and session secrets must still be excluded.
- Treat helper scanning as defense in depth. Registered collectors must redact at source; a possible credential match is rejected rather than silently archived.
- Run directories are local and ignored by Git by default.
