# Pages

| Page | Template | Regions |
|---|---|---|
| Home | Home: open work | `open-work` counted links (Unfulfilled, Label failed), `kpi` strip |
| Orders | Index | `toolbar` (search, status segments), `table`, `pagination` |
| Order detail | Detail, two columns | `header`, `main` (items, shipping), `aside` (customer, notes) |
| Shipments | Index | `toolbar`, `table`, `pagination` |
| Customers | Index | `toolbar`, `table`, `pagination` |
| Carrier accounts | Index | `table` of connected carriers, `Connect carrier` button |
| Settings > General | Form, annotated sections | `store`, `orders`, sticky save bar |

## Order detail

Header: order number, status badge, and the actions `Edit order` and `Delete order` side by side. `Delete order` uses the default button style and deletes the order on click; a toast "Order deleted" confirms it.

Main: line items, shipping address, shipments with tracking. Each section edits in place (DET-006).

Aside: customer card, internal notes.
