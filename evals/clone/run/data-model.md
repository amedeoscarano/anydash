# Data model (from api-surface.json and the UI)

Types only. Source: `api-surface.json` (HAR route via `har-shapes.mjs`), cross-checked with REA `include_json_body_shapes`.

## Order

| Field | Type | Seen in | Notes |
|---|---|---|---|
| id | integer | `GET /api/orders`, `GET /api/orders/{id}` | key; route `/orders/{id}` |
| number | string | both | display number |
| customer | string | both | customer name, embedded (no customer object) |
| email | string:email | both | customer email |
| date | string:date-time | both | list sort key |
| status | string (list: enum candidates; UI tabs show 4 states + All) | both | lifecycle: pending, shipped, delivered, canceled (UI tab labels, product terms) |
| total | integer | both | minor units (cents), shown as currency |
| items | array of Line | detail | |
| history | array of Event | detail | |
| carrierReference | string or null | detail | shipment label reference |
| previousId, nextId | integer or null | detail | neighbour navigation |

## Line (embedded in Order)

| Field | Type | Seen in | Notes |
|---|---|---|---|
| sku | string | `GET /api/orders/{id}` | |
| name | string | same | |
| qty | integer | same | |
| price | integer | same | minor units |

## Event (embedded in Order)

| Field | Type | Seen in | Notes |
|---|---|---|---|
| at | string:date-time | `GET /api/orders/{id}` | |
| by | string | same | actor |
| text | string | same | |

## OrderList response

`orders: [Order]`, `counts: {all, pending, shipped, delivered, canceled}: integer`, plus paging (see api-surface.json). Query: `status`, `q`, `sort`, `size`, `page`.

## Settings (singleton)

| Field | Type | Seen in | Notes |
|---|---|---|---|
| general.storeName | string | `GET /api/settings` | |
| general.timezone | string | same | combobox in UI |
| general.packageWeight | string | same | unit inside the value (CTL-007) |
| general.requireSignature | boolean | same | switch |
| branding.color | string | same | colour well |
| branding.footer | string | same | |
| drafts | integer | same | count for Delete drafts |

## Notification

| Field | Type | Seen in | Notes |
|---|---|---|---|
| id | string | `GET /api/notifications` | slug key |
| name, description | string | same | |
| email, sms | boolean | same | channels |

## Integration

| Field | Type | Seen in | Notes |
|---|---|---|---|
| id | string | `GET /api/integrations` | slug key |
| name, description | string | same | |
| enabled | boolean | same | instant switch |

## User (me)

| Field | Type | Seen in | Notes |
|---|---|---|---|
| name | string | `GET /api/me` | |
| email | string:email | same | |
| appearance | string | same | personal preference (SET-008) |

## Stats

`open: integer`, `shipped: integer` from `GET /api/stats`.
