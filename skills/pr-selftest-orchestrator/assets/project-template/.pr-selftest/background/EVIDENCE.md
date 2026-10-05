# Evidence capture policy

Configure this file once for the project. During normal runs, evidence collection is automatic after the user selects test cases.

## Default behavior

- Capture mode: `automatic`
- Capture request and response for every selected case: `true`
- Capture logs: `on_failure`
- Capture registered state snapshots: `before, after, after_cleanup`
- Generate structured before/after diff: `true`
- Store evidence locally under `.pr-selftest/runs/<run-id>/evidence/`: `true`
- Manifest integrity algorithm: `sha256`
- Retention: `14d`

## Log profile

- Profile ID: `default-service-log`
- Collector operation from `API_CATALOG.md`: `TODO_REQUIRED`
- Correlation fields: `request_id, trace_id, resource_id`
- Time window before/after case: `30s / 30s`
- Maximum lines per case: `2000`
- Maximum bytes per case: `10MB`
- Include levels: `ERROR, WARN, INFO`
- Exclude fields: `authorization, cookie, set-cookie, access_token, refresh_token`

The collector must use a correlation ID or a bounded time window. Never save an unrestricted service log stream.

## State snapshot profiles

Define at least one read-only profile for data changed by the tested API. Prefer a registered internal API operation; use a read-only database query only when needed.

### Profile: `TODO_REQUIRED`

- Source type: `api | database`
- Registered read operation or query ID: `TODO_REQUIRED`
- Stable key fields: `TODO_REQUIRED`
- Selected fields/columns: `TODO_REQUIRED`
- Excluded fields/columns: `password, secret, token, credential`
- Maximum rows: `100`
- Order by stable key: `TODO_REQUIRED`
- Capture phases: `before, after, after_cleanup`

Add more profiles by copying the block above. Do not place connection strings, passwords, tokens, or arbitrary SQL in this file; reference approved operations and secret aliases.

## Size and cleanup limits

- Maximum evidence per case: `25MB`
- Maximum evidence per run: `200MB`
- If a limit is reached: stop collecting that evidence type, record truncation in the manifest, and continue only if the test oracle remains valid.
- Evidence cleanup follows local retention policy and must never delete project source or files outside `.pr-selftest/runs/`.

