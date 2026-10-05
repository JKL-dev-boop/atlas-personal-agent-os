# Diagnostic provider integration

This file describes how to make a real diagnostic call. The dedicated invocation prompt remains in the installed Skill at `references/diagnostic-provider-prompt.md`.

## Capability

- Installed Skill/tool/MCP/CLI/API name: `TODO_REQUIRED`
- Version: `TODO_REQUIRED`
- Invocation mechanism: `skill | CLI | MCP | HTTP API | other`
- Exact invocation reference or command template: `TODO_REQUIRED`
- Can access hosts automatically: `TODO_REQUIRED`
- Supported environments/services: `TODO_REQUIRED`
- Timeout seconds: `TODO_REQUIRED`
- Maximum concurrent calls: `TODO_REQUIRED`

## Required input

List exact field names and formats expected by the diagnostic provider.

- Environment/service/instance: `TODO_REQUIRED`
- Time window: `TODO_REQUIRED`
- Request/trace IDs: `TODO_REQUIRED`
- Symptom, expected, actual: `TODO_REQUIRED`
- Artifact references: `TODO_REQUIRED`

## Returned output

Map the provider output into these concepts:

- Run ID: `TODO_REQUIRED`
- Classification: `TODO_REQUIRED`
- Root cause(s): `TODO_REQUIRED`
- Evidence and source locations: `TODO_REQUIRED`
- Confidence: `TODO_REQUIRED`
- Related Runbook references: `TODO_REQUIRED`
- Recommended next checks: `TODO_REQUIRED`

## Boundaries

- Read-only diagnostic abilities: `TODO_REQUIRED`
- Mutating abilities that must not be called by this Skill: `TODO_REQUIRED`
- Known limitations or unsupported failure classes: `TODO_REQUIRED`
