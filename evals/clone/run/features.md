# Feature inventory

| Feature | Object | Area | Where | Frequency | Basis | Evidence | Endpoint |
|---|---|---|---|---|---|---|---|
| Home figures (open orders, shipped in transit) | Order | index | `/` | daily | first sidebar item, counts link to the list | [rea] | `GET /api/stats` |
| Order list with status segments and counts | Order | index | `/orders` | daily | sidebar item, tabs with counts (IDX-004) | [rea] | `GET /api/orders` |
| Order search | Order | index | `/orders` | daily | search box in list toolbar (IDX-001) | [rea] | `GET /api/orders` (`q`) |
| Sort by date, rows per page, pagination | Order | index | `/orders` | daily | list toolbar and footer | [rea] | `GET /api/orders` (`sort`, `size`, `page`) |
| Order export | Order | index | `/api/orders/export` | weekly | list-level link (IDX-010) | [rea] | `GET /api/orders/export` (not called) |
| Order detail: items, history, customer, shipment | Order | detail | `/orders/{id}` | daily | reached from every row (DET-001) | [rea] | `GET /api/orders/{id}` |
| Previous / next order | Order | detail | `/orders/{id}` | daily | header links | [rea] | `GET /api/orders/{id}` (`previousId`, `nextId`) |
| Global search | Order | global-chrome | top bar | daily | button with ⌘K hint (CHR-001) | [rea] | `GET /api/orders` (`q`) |
| Help entry | none | global-chrome | sidebar | rare | persistent link (CHR-011) | [rea] | none |
| Account menu, appearance preference | User | global-chrome | top bar | rare | user menu (CHR-008) | [rea] | `GET /api/me` |
| Store details (name, time zone) | Account | settings | `/settings/general` | one-time | settings section (SET-001) | [rea] | `GET /api/settings` |
| Shipping defaults (package weight, signature) | Account | settings | `/settings/general` | rare | settings section | [rea] | `GET /api/settings` |
| Delete drafts | Draft | settings | `/settings/general` | rare | danger zone (DET-012) | [rea] | `GET /api/settings` (`drafts` count) |
| Notification types and channels | Notification | settings | `/settings/notifications` | rare | settings page, Edit per type | [rea] | `GET /api/notifications` |
| Branding for customer emails | Account | settings | `/settings/branding` | one-time | settings page | [rea] | `GET /api/settings` (`branding`) |
| Integrations on/off | Integration | settings | `/settings/integrations` | one-time | switches per integration | [rea] | `GET /api/integrations` |
