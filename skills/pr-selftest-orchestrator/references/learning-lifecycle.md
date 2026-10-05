# Runbook learning lifecycle

Self-evolution means evidence-backed domain learning. It never means self-editing the Skill, prompts, runner, permissions, policies, API catalog, environment allowlists, or test oracles.

## States

```text
observed -> candidate -> shadow -> verified -> archived
                    \-> quarantined
verified -> quarantined or archived when contradicted, stale, or out of scope
```

- `candidate`: created automatically from one supported observation. It may be shown but cannot drive automatic pass/fail decisions.
- `shadow`: replayed or evaluated alongside the active path without controlling execution.
- `verified`: usable only inside its declared project/component/environment/version scope.
- `quarantined`: excluded from retrieval after contradiction, suspected pollution, or missing provenance.
- `archive`: retained for audit but not used in new plans.

## Required runbook fields

```json
{
  "schema_version": "1.0",
  "id": "rb-resource-create-timeout",
  "title": "Resource creation remains pending",
  "status": "candidate",
  "version": "1.0.0",
  "parent_version": null,
  "scope": {
    "project": "project-a",
    "components": ["scheduler"],
    "environments": ["test"],
    "service_versions": [">=3.2.0 <3.4.0"],
    "file_patterns": ["service/scheduler/**"],
    "api_operations": ["create_resource", "get_resource"]
  },
  "triggers": {
    "symptoms": ["status remains CREATING"],
    "fingerprints": ["sha256:..."],
    "required_conditions": [],
    "excluded_conditions": []
  },
  "diagnostic_steps": [],
  "expected_evidence": [],
  "root_cause": "...",
  "regression_cases": ["TC-001"],
  "provenance": {
    "run_ids": ["run-..."],
    "pr_shas": ["..."],
    "miracle_ops_run_ids": ["..."]
  },
  "verification": {
    "independent_runs": 1,
    "successful_replays": 0,
    "contradictions": 0,
    "last_verified_at": null
  },
  "confidence": {
    "tier": "low",
    "reasons": ["single observation"]
  },
  "governance": {
    "requires_human_approval": true,
    "expires_at": null,
    "rollback_to": null
  }
}
```

## Candidate creation

Create a candidate only when:

- a selected case produced preserved evidence;
- the failure classification is not merely environment noise or missing information;
- Miracle-Ops returned traceable evidence, or a deterministic before/after assertion confirmed the root cause;
- the candidate has a narrow scope and version range;
- proposed diagnostic actions reference registered operations.

Do not use model prose as evidence. Failed, cancelled, incomplete, or cleanup-unsafe runs cannot directly produce trusted knowledge.

## Deduplication and conflict handling

Compute a fingerprint from normalized project, component, version range, trigger, action sequence, and expected evidence.

- Exact match: append independent provenance rather than creating a duplicate.
- Equivalent root cause and compatible scope: propose a new immutable version with combined evidence.
- Same trigger but conflicting root cause or action: quarantine both variants for review; never overwrite.
- Different environment or version scope: retain distinct variants.

## Promotion

Promotion thresholds are read from project policy. A safe default is:

- at least two independent PR/run confirmations;
- deterministic replay or fix-before/fix-after evidence;
- no unexplained contradiction;
- complete provenance;
- either explicit user approval or a configured low-risk auto-promotion rule.

Any knowledge that changes an oracle, adds write/cleanup behavior, widens environment scope, or changes permissions always requires human approval.

## Versioning and rollback

Runbook versions are immutable. Create a new version for every behavioral change. Keep active and fallback pointers in `runbooks/index.json`. On regression or contradiction, move the active pointer to the fallback and quarantine the failing version; do not delete evidence.

