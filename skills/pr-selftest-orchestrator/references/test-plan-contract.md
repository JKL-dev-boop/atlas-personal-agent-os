# Test-plan contract

The model produces a structured plan; the runner executes it. Prefer JSON for machine interchange and render a human table for approval.

## Plan shape

```json
{
  "schema_version": "1.0",
  "plan_id": "PR-123-r1",
  "pr": {
    "url": "https://example/pr/123",
    "base_sha": "...",
    "head_sha": "..."
  },
  "environment_id": "test-a",
  "assumptions": [],
  "gaps": [],
  "coverage": [
    {
      "source_id": "DIFF-api-create",
      "source_type": "pr_diff",
      "risk": "resource state transition changed",
      "case_ids": ["TC-001"]
    }
  ],
  "cases": [
    {
      "id": "TC-001",
      "title": "Create resource reaches READY",
      "source_refs": ["DIFF-api-create"],
      "kind": "happy_path",
      "priority": "P0",
      "risk_level": "low",
      "feasibility": "automatic",
      "recommended": true,
      "estimated_seconds": 60,
      "evidence_plan": {
        "request_response": "always",
        "log_profile": "service-default-on-failure",
        "db_snapshot_profiles": ["resource-by-id"],
        "capture_cleanup_state": true
      },
      "preconditions": ["test environment is healthy"],
      "setup": [
        {"operation": "create_fixture", "inputs": {"name": "selftest-${run_id}"}}
      ],
      "steps": [
        {
          "operation": "create_resource",
          "inputs": {"name": "selftest-${run_id}"},
          "extract": {"resource_id": "$.data.id"},
          "assertions": [
            {"type": "http_status", "equals": 201}
          ]
        },
        {
          "operation": "get_resource",
          "inputs": {"id": "${resource_id}"},
          "assertions": [
            {"type": "json_path", "path": "$.data.status", "equals": "READY"}
          ]
        }
      ],
      "cleanup": [
        {"operation": "delete_resource", "inputs": {"id": "${resource_id}"}}
      ],
      "on_failure": {"diagnose_with": "miracle-ops"}
    }
  ]
}
```

## Validity rules

- Every case ID is unique and stable within a plan revision.
- Every case has at least one traceable PR, acceptance-criterion, historical-defect, or verified-runbook source.
- Each operation exists in `API_CATALOG.md`; the model cannot invent endpoints or arbitrary shell commands.
- Each automated case has at least one deterministic oracle. HTTP 2xx alone is insufficient for a state-changing operation.
- Each automated case declares an evidence plan. State-changing cases capture a relevant before/after database or service-state snapshot and a structured diff when a registered snapshot profile exists.
- Evidence profiles exist in `EVIDENCE.md`; the model cannot invent log sources, database queries, or unrestricted collectors.
- Every state-changing setup or step has a registered cleanup action, or uses an explicit `{"mode":"none_required","reason":"..."}` declaration whose oracle independently verifies that no mutation occurred. Otherwise the plan marks the case infeasible and explains why.
- Variables are created before use. Response extraction paths and assertion types are supported by the runner.
- Dynamic test data uses only named fixtures or deterministic derivation operators supported by the runner. A model cannot introduce arbitrary expressions. If no supported generator can produce a safe value, ask the user or mark the case blocked.
- Timeouts, retries, concurrency, request count, and risk fit `TEST_POLICY.md`.
- `MANUAL_REVIEW` cases may be shown but not counted as automatically passed.
- Cases derived only from candidate runbooks must be labeled and default to unselected unless independently justified by the PR.
- High-risk cases require the additional approval specified by policy.

## Approval record

Store selection separately from the proposal:

```json
{
  "plan_id": "PR-123-r1",
  "plan_hash": "sha256:...",
  "pr_head_sha": "...",
  "environment_id": "test-a",
  "selected_case_ids": ["TC-001"],
  "approved_by": "user",
  "approved_at": "2026-09-27T12:00:00+08:00"
}
```

The runner rejects an approval whose hash, SHA, environment, or selected IDs no longer match.

## Deterministic derived values

Derived values are optional. They must use a small runner-owned operator set, for example `first_not_equal`, `boundary_minus_one`, or a named project fixture. The operator, inputs, and output are persisted in the approved plan. The runner rejects unknown operators rather than evaluating model-generated code.

```json
{
  "target_cpu": {
    "derive": {
      "operator": "first_not_equal",
      "candidates": [2, 3],
      "against": "${original_cpu}"
    }
  }
}
```
