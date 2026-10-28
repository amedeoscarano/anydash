# /dash:reconcile results (2026-10-28, test agent)

| Check | Result |
|---|---|
| Source and version in `matrix.md` | pass |
| Diff (`schema-fields.mjs diff`) | 3 matched by name, 5 more by meaning, 1 ours only (`priority`), 1 enum conflict (`status`), type conflict `total` |
| Adapter, mapper, tests | `lib/api/orders.js`, `orders-mapper.js`, `orders.test.js` |
| `npm test` (`node --test`) in `run/repo` | pass: 8 of 8 |
| Values from the capture in fixtures | none (fixtures use `ord_test_7`, `test@example.test`) |

Approval: the prompt gives the go-ahead for the adapter step, so step 6 did not stop.
Not done: the optional mock (step 9) was not asked for.

## Skill fix made

- `skills/api-ui-reconciliation/scripts/schema-fields.mjs`: `flat` on a real `har-shapes.mjs` file returned wrong rows (`contentType[]`, `shape.customer`, enums as format `enum(2)`, `?` kept in names). The reader now unwraps `{contentType, shape}`, reads `string:enum(n)` as `enumCount` and `string:enum(a,b)` as `enum`, and strips `?` into `optional: true`. New test in `schema-fields.test.mjs`.

## Review changes after the run (not re-run)

- `skills/reconcile/SKILL.md` and `skills/api-ui-reconciliation/SKILL.md`: every gap and conflict in `gaps.md` now closes with one of the four exits (`fix now`, `file as task`, `reject with rationale`, `verify with a test`). The `gaps.md` in `run/` predates this and has none.
