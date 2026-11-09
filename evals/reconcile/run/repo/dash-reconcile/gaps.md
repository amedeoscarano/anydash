# Gaps: Order

Counts: 8 fields matched (3 by name, 5 by meaning), 5 theirs not in our UI, 1 ours not in their API, 1 type conflict, 1 enum conflict.

## Theirs, not in our UI

- `items[]` (sku, name, qty, price): add read-only on the detail page later; skipped in the mapper for now.
- `history[]` (at, by, text): add read-only as the activity list (SAV-008) later; skipped now.
- `carrierReference`: read-only, skip for now.
- `previousId`, `nextId`: navigation only, skip.
- `updatedAt`: not shown; used as the version for writes.

## Ours, not in their API

- `priority` (low, normal, high): **blocker** for write. Store locally or ask their team for a field; the mapper never sends it.

## Type conflicts

- `total` integer in minor units against our `totalAmount` number in major units: mapper divides by 100 on read; never written.
- `date` string:date-time against our `Date`: parsed on read.

## Enum conflicts

- `status`: theirs `pending, shipped, delivered, canceled, returned`; ours `pending, shipped, delivered, on_hold`.
  - `canceled`, `returned` missing in ours: add to the select. Until then the mapper keeps them as is and the UI shows them read-only.
  - `on_hold` is not in their API: remove it from the select (CTL-005). The mapper refuses to send it.
- Captured surface showed `status` as plain string on the detail endpoint (4 samples) and 5 counts on the list: consistent with the docs.

## Conflict policy

Their system owns every field except `priority`. We send only fields the user edited (`status`, `note`), with `If-Match: <updatedAt>`. On 409 the draft is kept and the remote value shown next to it. 422 field errors map under the field (FDB-003).

## Not checked

- Settings, notifications, integrations endpoints: not in the OpenAPI file; only seen in the capture.
- Questions for the user (non-interactive run): ownership of each object, which endpoints matter.
