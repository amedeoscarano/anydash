# Page templates seen

| Template | Example routes | Header | Main regions | List or form controls | Rebuild as | Rules |
|---|---|---|---|---|---|---|
| Home | `/` | title "Home" | stat links with counts | none | home | HOM-001 |
| Order index | `/orders` | title, Export | status tabs with counts, search, table, pagination | tablist, searchbox, sortable column, rows-per-page select | index page | IDX-001, IDX-004, IDX-008, IDX-010 |
| Order detail | `/orders/{id}` | breadcrumb, title names the order, previous/next | Items, History, Customer, Shipment | read-only tables and term lists | detail page | DET-001, DET-003, DET-005 |
| Settings page | `/settings/general`, `/settings/branding`, `/settings/notifications`, `/settings/integrations` | Back to home, settings nav, page title | sections with per-section Discard/Save, cards with switches, danger zone | text fields, combobox, switch, colour well | settings page | SET-004, SET-007, SAV-003, CTL-002 |
