# Report contract

Write a structured `results.json` first, then render Markdown and HTML from it. The HTML renderer accepts this shape:

```json
{
  "run_id": "run-20260927-001",
  "pr": {
    "title": "Add resource quota validation",
    "url": "https://example/pr/123",
    "head_sha": "abcdef1"
  },
  "environment": "test-a",
  "started_at": "2026-09-27T10:00:00+08:00",
  "duration_seconds": 132,
  "recommendation": {
    "status": "PASS | BLOCK | REVIEW",
    "summary": "..."
  },
  "summary": {
    "passed": 4,
    "failed": 1,
    "blocked": 0,
    "skipped": 1,
    "manual_review": 0,
    "cleanup": "PASS"
  },
  "coverage": [
    {
      "source": "PR diff: quota validation",
      "risk": "invalid limit may be accepted",
      "case_id": "TC-002",
      "assertion": "invalid limit returns QUOTA_INVALID",
      "status": "PASS"
    }
  ],
  "cases": [
    {
      "id": "TC-002",
      "title": "Reject an invalid quota",
      "status": "PASS",
      "source": "PR diff",
      "duration_seconds": 4,
      "assertions": ["HTTP 400", "code=QUOTA_INVALID"],
      "details": "...",
      "evidence_refs": ["EV-TC-002-RESPONSE", "EV-TC-002-DB-DIFF"],
      "diagnosis": null
    }
  ],
  "evidence": [
    {
      "id": "EV-TC-002-DB-DIFF",
      "case_id": "TC-002",
      "type": "db_diff",
      "source": "quota-state",
      "summary": "No persisted state changed after rejection",
      "path": "evidence/TC-002/db/diff/state.json",
      "sha256": "...",
      "captured_at": "2026-09-27T10:00:04Z",
      "metadata": {"added": 0, "removed": 0, "changed": 0}
    }
  ],
  "learning": [
    {
      "id": "rb-quota-invalid",
      "title": "Invalid quota validation path",
      "status": "candidate",
      "confidence": "low",
      "scope": "quota-service 3.2.x"
    }
  ],
  "artifacts": [
    {"label": "Approved plan", "path": "approved-plan.json"}
  ]
}
```

## Visual hierarchy

The report should show, in order:

1. recommendation and cleanup state;
2. summary cards for pass/fail/blocked/skipped/duration;
3. traceability matrix: PR change or criterion -> risk -> case -> oracle -> result -> diagnosis/runbook;
4. filterable case results with collapsible details;
5. evidence index with case, type, source, summary, integrity hash, and local file link;
6. diagnostic-provider evidence and confidence for failures;
7. new or updated runbook candidates;
8. artifact and audit links.

Status must be expressed with text and icon, not color alone. The single-file HTML must not require a server or external CDN and should support print/PDF output.
