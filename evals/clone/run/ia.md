# IA map: local shipping admin (own app, 127.0.0.1:3103)

Tool: REA (`list_browser_targets`, `inspect_web_page` with accessibility text) on Chrome CDP `http://127.0.0.1:9334`. `analyze_web_bundle` failed (REA connection closed, twice) on the Next.js dev bundle, so no bundle-only routes are listed. Values are replaced by their kind.

## Sitemap

| Route template | Title pattern | Template | Reached from | Visited |
|---|---|---|---|---|
| `/` | Home · {store} | home | sidebar item 1 | yes |
| `/orders` | Orders · {store} | index | sidebar item 2, home tiles | yes |
| `/orders/{id}` | Order {number} · {store} | detail | order list row link | yes |
| `/settings` | redirects to `/settings/general` | settings | sidebar item 3 | yes |
| `/settings/general` | General settings · {store} | settings | settings nav | yes |
| `/settings/branding` | Branding · {store} | settings | settings nav | yes |
| `/settings/notifications` | Notifications · {store} | settings | settings nav | yes |
| `/settings/integrations` | Integrations · {store} | settings | settings nav ("Manage integrations") | yes |
| `/api/orders/export` | file download | other | "Export" link on the order list | skipped: download, not a page |

## Navigation tree

- Main (sidebar, collapsible)
  - Home: `/`, no badge, top
  - Orders: `/orders`, no badge, top
  - Settings: `/settings`, no badge, in the same flat list (not separated at the bottom)
- Settings (own navigation, replaces the main sidebar)
  - Back to home
  - General: `/settings/general`
  - Notifications: `/settings/notifications`
  - Branding: `/settings/branding`
  - Manage integrations: `/settings/integrations` (link styled apart from the others)
- Order detail: breadcrumb (Orders), Previous order / Next order links

## Global chrome

| Element | Where |
|---|---|
| Search with shortcut hint (button "Search ⌘K") | top bar, every page |
| Help (opens in new tab) | sidebar |
| Account menu (button) | top bar, right; items not opened |
| Collapse sidebar / Open menu | sidebar top / narrow viewport |
| Notifications live region | page level (toasts), no bell seen |
| Scope switcher | none seen |

## Page templates

- **home** (`/`): heading, two stat links (open orders, shipped in transit) with counts.
- **index** (`/orders`): heading, Export link, status tablist with counts (All, Pending, Shipped, Delivered, Canceled), search box, table (Order, Customer, Date sortable, Status, Total), rows-per-page select (25, 50), Previous/Next pagination. No row checkboxes.
- **detail** (`/orders/{id}`): breadcrumb, title names the order, previous/next links, sections Items (table Product, SKU, Quantity, Price), History, Customer (Name, Email), Shipment (Order ID, Label).
- **settings** (`/settings/*`): own nav with Back to home, page heading, sections, per-section Discard/Save.

## Settings map

- General
  - Store details: Store name (text field), Time zone (combobox); Discard, Save
  - Shipping defaults: Default package weight (text field, unit inside the value), Require signature on delivery (switch); Discard, Save
  - Danger zone: Delete drafts (button)
- Notifications: one card per notification type (Order shipped, Delivery exception, Daily summary), each with an Edit button; channels email and SMS (from the API shape)
- Branding
  - Customer emails: Brand colour (colour well), Email footer (text field); Discard, Save
- Integrations: one card per integration (Storefront sync, Label printer, Carrier rates), each with an instant switch

## Not visited

- `/api/orders/export`: download link, not opened.
- Account menu items: opening it needs a click; REA is passive.
- Notification edit dialogs: opening needs a click.
- Bundle-only routes: `analyze_web_bundle` failed, so none are known.
