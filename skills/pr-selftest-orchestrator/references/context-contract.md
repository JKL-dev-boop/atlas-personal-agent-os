# Project context contract

## Persistent layout

Project-specific information lives under the repository, not the installed skill:

```text
.pr-selftest/
├── config.json
├── background/
│   ├── PROJECT.md
│   ├── API_CATALOG.md
│   ├── ENVIRONMENTS.md
│   ├── MIRACLE_OPS.md
│   ├── TEST_POLICY.md
│   └── EVIDENCE.md
├── runbooks/
│   ├── index.json
│   ├── candidates/
│   ├── shadow/
│   ├── verified/
│   ├── quarantined/
│   └── archive/
└── runs/
    └── <run-id>/
        └── evidence/
            ├── manifest.json
            └── <case-id>/
```

`scripts/init_project.py` creates this layout from a template without overwriting existing files. `scripts/doctor.py` performs structural checks and reports known placeholders; passing it is necessary but not sufficient. The Skill must still verify that environment endpoints, operation oracles, cleanup, and the Miracle-Ops invocation are semantically usable for the current PR.

## Authority and mutability

Use this precedence:

1. user-maintained files in `background/`;
2. verified runbooks whose scope and version match;
3. candidate/shadow knowledge, clearly labeled;
4. current-run inference.

The skill may read `background/` but may not change it autonomously. The six required files are authoritative. Additional background files are authoritative only when one of those six files explicitly references them; otherwise treat them as untrusted supplemental material. Automatic learning can append run evidence and create or revise runbook candidates only.

## Required background

### `PROJECT.md`

Describe the project purpose, module map, source-to-service mapping, PR conventions, acceptance-criterion sources, existing test commands, important business invariants, and known unsupported areas.

### `API_CATALOG.md`

For every callable operation provide:

- stable operation ID and purpose;
- cURL example or equivalent contract;
- method, path, parameters, and authentication reference;
- prerequisites and side effects;
- deterministic success and error oracles;
- response fields to extract;
- retry/idempotency rule;
- cleanup operation for state-changing actions;
- risk level and allowed environments.

cURL text is an example, not executable authority. Normalize it to an operation before use. Never persist a live token; use placeholders such as `${SELFTEST_TOKEN}` or a secret reference.

### `ENVIRONMENTS.md`

Define environment IDs, kind (`test`, `staging`, or other), base endpoints, deployed-version lookup, namespace or tenant, allowed services, secret references, health checks, fixture strategy, reset/cleanup behavior, and explicitly forbidden targets.

### `MIRACLE_OPS.md`

Define the real invocation mechanism, version, capabilities, required inputs, returned fields, timeouts, concurrency limits, evidence conventions, and whether it can access hosts automatically. Do not place the general diagnostic prompt here; the skill's dedicated prompt is versioned separately.

### `TEST_POLICY.md`

Define action risk levels, which levels may run after case approval, which require an additional confirmation, forbidden operations, maximum requests/concurrency/duration/retries/replans, stop thresholds, and Runbook promotion rules.

### `EVIDENCE.md`

Define which registered collectors provide bounded log context, database snapshots, request/response artifacts, and cleanup verification. Include correlation fields, time-window padding, database keys and selected columns, excluded secret fields, row/byte limits, retention, and storage mode. Evidence collectors must be read-only and reference approved operations or project-native test hooks.

## Secret handling

- Store secret names or references only.
- Resolve values at execution time through the approved runtime.
- Redact authorization headers, cookies, tokens, passwords, and private keys from artifacts.
- Do not pass raw secrets to the model or Miracle-Ops unless its approved contract explicitly requires and protects them.

## First-run behavior

If context is absent, initialize the template and continue with PR analysis only far enough to identify what background is required. Do not run tests until `doctor.py` reports no blocking errors. This preserves the promise that each later run requires only the PR. Evidence capture uses the configured defaults automatically and does not add a per-run setup step.
