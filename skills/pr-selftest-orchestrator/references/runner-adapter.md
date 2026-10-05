# Deterministic runner adapter

The runner is the only component allowed to perform approved test actions. The model may design or compile a plan, but it must not bypass the adapter with improvised shell commands.

## Adapter choices

Prefer, in order:

1. an existing project-native test command or API test framework;
2. an existing HTTP runner that accepts structured cases;
3. a project-specific adapter implementing this contract.

The selected adapter is documented in `PROJECT.md`. A new adapter requires normal code review; the Skill cannot generate and trust one within the same run.

## Input contract

The adapter receives:

- frozen approved plan and plan hash;
- selected case IDs;
- PR head SHA and build version;
- environment ID, not an arbitrary base URL;
- registered operation IDs and resolved non-secret parameters;
- secret references for the runtime to resolve;
- request, retry, concurrency, and duration budgets;
- run ID and artifact directory.

It must reject an unknown operation, changed plan hash, mismatched PR SHA, forbidden environment, unsupported assertion, unresolved variable, or missing cleanup.

## Required capabilities

- setup, ordered steps, assertions, and `finally` cleanup;
- variable extraction and propagation;
- named fixtures and a small allowlisted set of deterministic value-derivation operators; never general expression evaluation;
- timeout and explicitly permitted bounded retry;
- unique resource naming by run ID;
- request/response metadata, request IDs, trace IDs, timing, and redacted artifacts;
- evidence hooks for pre-state, post-state, failure log context, and post-cleanup state;
- structured database/service-state diff generation and manifest registration;
- dependency-aware `BLOCKED` results;
- cancellation followed by cleanup;
- machine-readable result output.

## Result event

Each case produces:

```json
{
  "case_id": "TC-001",
  "status": "PASS | FAIL | BLOCKED | SKIPPED | MANUAL_REVIEW | ERROR",
  "started_at": "...",
  "duration_seconds": 12,
  "failed_step": null,
  "expected": null,
  "actual": null,
  "request_trace_ids": [],
  "artifact_refs": [],
  "evidence_refs": [],
  "cleanup": {
    "status": "PASS | FAIL | NOT_REQUIRED",
    "artifact_refs": []
  }
}
```

The adapter does not diagnose root causes. The orchestrator packages failed results for the configured diagnostic provider.

## Safety boundary

- Resolve credentials outside model-visible data.
- Permit only environment, operation, fixture, and derivation IDs registered in project background or explicitly implemented by the reviewed runner.
- Treat cURL strings as onboarding material, never as arbitrary runtime shell.
- Enforce rate, concurrency, duration, resource, and failure thresholds in code.
- Do not retry non-idempotent operations unless their contract provides an idempotency key and a way to verify prior completion.
- Never allow a diagnosis or runbook to expand the approved action set during a run.
- Evidence collectors are read-only, bounded by row/byte/time limits, and must never widen a query based on model-generated SQL or log commands.
