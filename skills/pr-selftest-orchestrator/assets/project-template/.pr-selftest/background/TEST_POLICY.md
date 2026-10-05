# Self-test policy

Replace required values and keep this file under normal project review.

## Allowed scope

- Default environment: `TODO_REQUIRED`
- Allowed environment IDs: `TODO_REQUIRED`
- Allowed operation risk levels after case approval: `read, low-write`
- Risk levels requiring additional approval: `medium, high`
- Forbidden action classes: `production-write, arbitrary-shell, permission-change, cross-tenant-delete`

## Runtime budgets

- Maximum proposed cases: `20`
- Maximum selected cases: `TODO_REQUIRED`
- Maximum HTTP requests: `100`
- Maximum concurrency: `1`
- Maximum retry per step: `1`
- Maximum re-plans: `1`
- Maximum Miracle-Ops calls: `5`
- Maximum run duration: `30m`
- Stop after failed-case ratio: `TODO_REQUIRED`

## Data and cleanup

- Test resource naming prefix: `selftest-${run_id}`
- Only resources created by the current run may be deleted automatically: `true`
- Cleanup verification operation: `TODO_REQUIRED`
- Orphan-resource TTL/reaper: `TODO_REQUIRED`
- Evidence collection policy: `EVIDENCE.md`
- Require before/after/after-cleanup evidence for state-changing cases: `true`

## Runbook promotion

- Independent confirmations required: `2`
- Require deterministic replay or before/after evidence: `true`
- Allow low-risk automatic promotion: `false`
- Always require approval for oracle, permission, write, or cleanup changes: `true`
