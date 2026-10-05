# Workflow and interaction contract

## State machine

```text
RESOLVE_PR
  -> LOAD_CONTEXT
  -> ANALYZE_IMPACT
  -> CHECK_GAPS
       -> ASK_USER -> CHECK_GAPS          when a blocking gap exists
  -> DRAFT_PLAN
  -> VALIDATE_PLAN
  -> PRESENT_PLAN
       -> REVISE -> VALIDATE_PLAN         when the user requests changes
       -> STOP                            when the user declines
       -> FREEZE_APPROVED_PLAN            when case IDs are selected
  -> PREPARE
  -> EXECUTE
       -> DIAGNOSE                        on failure
  -> CLEANUP                              always
  -> REPORT
  -> DISTILL_LEARNING
  -> END
```

Persist each transition as one JSON object per line in `runs/<run-id>/events.jsonl`. Include timestamp, prior state, next state, actor, reason, PR head SHA, and plan hash.

## Minimal-input behavior

The normal per-run input is only a PR URL or number. If none is supplied, try the current checked-out branch. Automatically gather:

- PR title, body, linked requirement or issue, base/head SHA, author, and labels;
- changed files, diff, changed public interfaces, configuration, and existing tests;
- project context and applicable verified runbooks;
- target environment when there is exactly one allowed default.

Do not ask for information that can be read safely from those sources. If a missing detail does not prevent useful case design, show the case as `blocked`, `manual`, or based on an explicit assumption and let the user resolve it while reviewing the plan. Ask before drafting only when the answer materially changes the scenario, oracle, or safety boundary. Good blocking questions include:

- Which of several permitted test environments should be used?
- What is the expected behavior when neither the PR nor project context defines an oracle?
- Which registered cleanup action applies to a state-changing API?
- Is a required feature flag or fixture available?

Ask no more than three questions at once. For each, give a recommended default and explain its effect. Non-blocking uncertainty belongs in the plan's `assumptions` section. When safe, combine clarification and case selection into one user interaction rather than creating repeated pauses.

## Test-plan approval

Always present the proposed cases before execution. Use a compact table:

| Pick | ID | Scenario | Source | Main oracle | Evidence | Impact | Risk | Time | Recommendation | Feasibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommended | TC-001 | Create resource | PR acceptance criterion | status becomes READY | API + DB diff + failure logs | creates one disposable resource | low | 1m | core path | automatic |

Then offer these controls:

- `运行推荐项`
- `运行全部可自动执行项`
- `仅运行 TC-001, TC-004`
- `排除 TC-003`
- `修改 TC-002: ...`
- `停止`

Treat any modification as a new plan revision. Recalculate the plan hash and show the changed rows. An approved plan freezes:

- PR head SHA;
- environment ID and version;
- selected case IDs and exact steps;
- test oracles;
- setup and cleanup actions;
- execution budgets;
- plan hash.

Approval expires if any frozen field changes. Never infer approval from silence.

## Execution and progress

Use registered operations, not arbitrary generated shell. Evidence collection is automatic for approved cases: capture the configured before state, execute, capture after state, compute diffs, and store bounded logs on failure or when policy requests always-on context. Emit concise progress rather than raw logs:

```text
环境预检          PASS
证据基线          CAPTURED
执行 3/8          TC-003 FAIL
日志与状态差异    CAPTURED
Miracle-Ops 诊断  RUNNING
环境清理          PASS
清理后状态        VERIFIED
报告生成          PASS
```

Persist detailed evidence under the run directory and index it in `evidence/manifest.json`. A failed setup blocks dependent cases; it is not automatically a product defect. Distinguish `PASS`, `FAIL`, `BLOCKED`, `SKIPPED`, `MANUAL_REVIEW`, and `ERROR`.

Retry only faults declared retryable by the API background or policy. A retry of the same run is not independent evidence for runbook promotion.

## Failure handling

On failure:

1. Preserve the original oracle; never edit it to match the observed result.
2. Build the diagnostic packet defined in `miracle-ops-prompt.md`.
3. Invoke the configured Miracle-Ops capability.
4. Normalize its result and link evidence to the failed step.
5. Classify the failure.
6. Allow at most one re-plan when the failure is `TEST_DEFECT`, and present the revised case for approval before rerunning.
7. Continue independent approved cases unless the policy's failure threshold or environment health requires a stop.
8. Always enter cleanup.

## Completion

The run is complete only when results, cleanup status, report artifacts, and learning disposition have been recorded. A report must explicitly state when diagnosis is incomplete or cleanup failed.
