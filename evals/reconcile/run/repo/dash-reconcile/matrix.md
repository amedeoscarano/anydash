# API to UI matrix: Order

Source: `openapi.json` "Shipping admin API (synthetic)" version 0.3.0 (official, leads). Cross-check: `api-surface.json` (format anydash-api-surface/1, source har, captured from the local admin). Ownership: assumed theirs for every field except `priority` (ours). Repo: plain JS with JSDoc, `node --test`.

| # | Their field | Type | Source | Our field | Our type | UI control | Save model | Read transform | Write transform | Direction | Rule IDs |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `GET /api/orders/{id}` `id` | integer | openapi, seen | `id` | integer | read-only text | n/a | none | never sent | read | SET-010 |
| 2 | `number` | string | openapi, seen | `orderNumber` | string | read-only text | n/a | none | never sent | read | SET-010 |
| 3 | `customer` | string | openapi, seen | `customerName` | string | read-only text | n/a | none | never sent | read | SET-010 |
| 4 | `email` | string:email | openapi, seen | `customerEmail` | string:email | read-only text | n/a | none | never sent | read | SET-010 |
| 5 | `date` | string:date-time | openapi, seen | `placedAt` | Date | read-only text | n/a | `new Date(date)` | never sent | read | no rule yet (date) |
| 6 | `status` | string enum(5) | openapi (seen: string) | `status` | enum(4) | select | page save bar | unknown value kept as is | sent only when changed | two-way | CTL-005, SAV-001 |
| 7 | `total` | integer (cents) | openapi, seen | `totalAmount` | number (major units) | read-only money | n/a | `total / 100` | never sent | read | CTL-007, SET-010 |
| 8 | `note` | string, maxLength 500 | openapi | `note` | string | textarea, 500 limit shown | page save bar | none | sent only when changed | two-way | SAV-001, FDB-003 |
| 9 | `updatedAt` | string:date-time | openapi | (version) | string | not shown | n/a | kept for `If-Match` | sent as `If-Match` header | read | no rule yet (conflict policy) |
| 10 | `items[]`, `history[]`, `carrierReference`, `previousId`, `nextId` | see gaps.md | openapi, seen | none | | not shown | n/a | | | theirs only, not shown | |

Query parameters of `GET /api/orders`: `status` (enum 6, includes `all`), `q`, `sort` (asc, desc), `size` (25, 50), `page` (min 1): adapter options, built into the query string.
