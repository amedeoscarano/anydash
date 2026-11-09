# /dash:reconcile expected result

- [ ] `repo/dash-reconcile/matrix.md` names the source (`openapi.json` 0.3.0) and maps number, customer, email, date, status, total, note to our fields.
- [ ] `gaps.md`: `priority` ours only (blocker for write); `items`, `history`, `carrierReference`, neighbour ids theirs only; `total` cents vs `totalAmount` major units; enum conflict on `status` (`canceled`, `returned` missing in ours; `on_hold` rejected by theirs).
- [ ] `theirs-order.json` and `ours-order.json` flattened rows exist; `schema-fields.mjs flat` on `api-surface.json` returns field rows (not `contentType` / `shape.*`).
- [ ] Adapter, mapper and tests in `repo/lib/api/`; base URL from `ORDERS_API_BASE_URL`, added to `.env.example`.
- [ ] Tests cover full fixture, missing optionals, unknown enum kept, money conversion, only changed writable fields sent, method/path/query, typed error on 4xx and 5xx.
- [ ] `npm test` in `repo/` passes. No captured value in fixtures or tests.
