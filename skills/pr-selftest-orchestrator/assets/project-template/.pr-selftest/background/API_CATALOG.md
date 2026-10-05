# API catalog

Register every operation the self-test runner may call. Raw cURL is an example; the operation ID, oracle, side effects, and cleanup relationship are the authority.

Never place a live credential here. Use environment-variable or secret-store references.

## Operation template

### `TODO_REQUIRED_OPERATION_ID`

- Purpose: `TODO_REQUIRED`
- Method and path: `TODO_REQUIRED`
- Allowed environments: `TODO_REQUIRED`
- Risk: `read | low-write | medium | high`
- Authentication reference: `${TODO_REQUIRED_SECRET_NAME}`
- Preconditions: `TODO_REQUIRED`
- Side effects: `TODO_REQUIRED`
- Idempotency/retry rule: `TODO_REQUIRED`
- Extracted fields: `TODO_REQUIRED`
- Success oracle: `TODO_REQUIRED`
- Expected error oracles: `TODO_REQUIRED`
- Cleanup operation ID: `TODO_REQUIRED_OR_NONE`

```bash
curl --request TODO_REQUIRED \
  --url '${BASE_URL}/TODO_REQUIRED' \
  --header 'Authorization: Bearer ${TODO_REQUIRED_SECRET_NAME}'
```

## Operation relationships

| Operation ID | Depends on | Produces | Cleanup | Notes |
|---|---|---|---|---|
| `TODO_REQUIRED` | `TODO_REQUIRED` | `TODO_REQUIRED` | `TODO_REQUIRED` | `TODO_REQUIRED` |

