# Evidence: localship (dry run on the local admin at 127.0.0.1:3103, treated as a new portal)

Mode: own-app (127.0.0.1). Tool: REA `inspect_web_page` with `include_accessibility_text: true` on CDP `http://127.0.0.1:9334`, page by page. Records hold structure and labels only.

## Research questions (methodology section 3)

- Navigation: flat sidebar of three items (Home, Orders, Settings); Settings is not separated at the bottom.
- Settings: settings is a mode with its own navigation and "Back to home" (SET-004 observed); grouped by topic (General, Notifications, Branding, Integrations).
- Controls: switch for integrations, switch for "Require signature" inside a form with Save, text fields, combobox for time zone, colour well. Whether the switches save at once: not testable read-only.
- Help text: not recorded.
- Page structure: index with status tabs and counts; detail with breadcrumb and previous/next.
- Global chrome: search button with ⌘K hint, help link, account menu; no bell.
- AI: none seen. Behaviour: not testable read-only. Language: sentence case labels. Onboarding: none seen. Integrations: listed in settings with on/off switches.

## Page records

| Record | Route | Page type | Nav location | What was seen |
|---|---|---|---|---|
| rec-001 | `/` | home | sidebar 1 | two figure links (open orders, shipped in transit) with counts |
| rec-002 | `/orders` | index | sidebar 2 | status tabs with counts, search, sortable date column, rows per page, Previous/Next |
| rec-003 | `/orders/:id` | detail | from list row | breadcrumb, title names the order, previous/next order, Items, History, Customer, Shipment |
| rec-004 | `/settings/general` | settings_page | sidebar 3, settings nav | Store details and Shipping defaults each with Discard/Save; Danger zone last with Delete drafts |
| rec-005 | `/settings/branding` | settings_page | settings nav | Customer emails section, colour well, text field, Discard/Save |
| rec-006 | `/settings/notifications` | settings_page | settings nav | one card per notification type with Edit |
| rec-007 | `/settings/integrations` | settings_page | settings nav ("Manage integrations") | one card per integration with a switch |

## HOM-002 (modify: exceptions)

Supported by rec-001: the home shows the two queues as figure tiles, each linking to the orders list. The existing exceptions do not cover a home with only figure tiles. Reference evidence unchanged (2 of 3, medium). Counting localship: 3 of 4 portals studied.

Public docs: none (local app has no public docs).

## SET-013 (add: account maintenance in a danger zone)

Supported by rec-004. Reference portals: not verified live; their public docs were not read in this dry run, so all three are `absent`, source `inferred`, confidence low. Counting localship: 1 of 4.

## Not visited

- Account menu items, notification edit dialogs: need a click; REA is passive.
- `/api/orders/export`: a download, not a page.

## Contradicts

- SET-005 (settings entry fixed at the sidebar bottom): Settings sits in the flat list right after Orders (rec-001). Not proposed as a change: one portal.
