---
name: integration-connect
description: Designs how an admin dashboard connects to and manages external systems - the integrations list, the add-from-catalog flow, each integration's detail page, test connection, status labels, field mapping and write-back, sync logs and failure banners, run-now tools, masked credentials and the disconnect dialog. Produces an integrations spec section or an inline answer with rule IDs. Use when a product links to store platforms, carriers, marketplaces, identity providers, webhooks, file transfer, ERPs or any API connection, or when reviewing an existing integrations or connections page. Do not use it for the backend sync engine, OAuth implementation details or API design; it covers the admin UI for connecting and running integrations. Do not use it for a product with no external connections.
---

# Integration connect

Decides how users connect, check, tune and remove integrations. One list holds every connection; each connection has its own page with settings, mapping, logs and tools; failures surface outside the log; disconnect is secondary and explicit. Rules come from the Shopify, DHL Express Commerce and Cloudflare dashboards.

## Input

- A brief or a repo path listing the external systems the product talks to.
- For each: what it adds (own daily screens, or data/identity only), what data moves in which direction, how it authenticates, whether it runs on a schedule.
- `dash-spec/inventory.md` and `dash-spec/ia.md` when run from `/dash:build`.

## Output

- From `/dash:build`: an "Integrations" section in `dash-spec/pages.md`, nav placement in `dash-spec/ia.md`, and decision rows in `dash-spec/decisions.md`.
- When asked directly: an inline answer with the same content.
- Content: a table `Integration | Placement | Auth | Mapping | Sync | Status | Rule IDs`, then the skeletons of the list page, catalog, and detail page tabs.

## Procedure

Full text of the INT rules is in `references/rules.md`. FDB-004 and SAV-006 live in other areas: read them in the rule-library skill, or in the feedback-messaging and save-model skills.

1. Inventory the connections. If there are none, stop. For each, record what it adds and how it syncs.
2. Placement. A connection with its own day-to-day screens gets its own nav group with a "Settings" item. A connection that only feeds data or identity lives under Settings > Connections or under the product area it serves. Either way the settings list links to it (INT-011).
3. List page. One page lists every connection as a row: name, linked account, status, actions Settings and Remove (INT-001). Suggested: a status label per row and a status filter when the list can grow (INT-005, low confidence).
4. Add flow. "Add integration" opens a catalog of providers; each tile opens a form only for that provider. A marketplace catalog may link out if it says so and returns the user to the list (INT-002).
5. Detail page. One page per connection with breadcrumb and tabs such as Settings / Field mapping / Logs / Tools. Options shared by all integrations may stay on the list page (INT-003).
6. Credentials. Put "Test connection" beside Save, available right after authorization; show pass or fail with the cause and keep the form (INT-004). Suggested: mask keys and secrets with Copy and Reveal, and put Rotate next to a sentence that says what breaks (INT-010, low confidence). Skip Test connection when the other platform installs and authorizes with no editable credentials (INT-004 exception).
7. Mapping. Suggested: show what is read and written as labeled checkboxes and selects with defaults, with write-back to the other system as its own labeled option. Skip for login-only providers (INT-008, low confidence).
8. Sync visibility. Logs tab with time, duration, items, run type and error for recent runs, plus "View all logs" (INT-006). Record background failures as a persistent error with a count on the affected object, and as a log row with time and outcome (FDB-004). On repeated failure or incompatibility, show a page-level warning naming the connection, impact and fix, and offer status alerts (INT-007).
9. Tools. Import now, Refresh, Clear cache act at once from their own cards or Tools tab, never as a checkbox that runs on Save (INT-009).
10. Disconnect. A secondary row or overflow action. The dialog names the connection, says what stops and what data stays, and its primary button reads "Disconnect". Keep an Uninstalled list. Bulk deletion of imported data is a separate action with its own dialog (INT-012, SAV-006).

## Rules applied

- INT-001 — One list of connected integrations with name, linked account, actions.
- INT-002 — Add starts from a provider catalog; one form per provider.
- INT-003 — Each integration has its own detail page.
- INT-004 — Test connection beside credentials, result names the cause (medium).
- INT-005 — Status label per connection, status filter (low).
- INT-006 — Sync log on the integration's page (medium).
- INT-007 — Failures surface as a page warning and alerts (medium).
- INT-008 — Explicit field mapping with defaults; write-back is its own option (low).
- INT-009 — Run-now and maintenance actions act immediately, apart from Save (medium).
- INT-010 — Credentials masked; rotation explains what breaks (low).
- INT-011 — Own nav group only when it brings its own daily screens.
- INT-012 — Disconnect is secondary, confirmed and recorded.
- FDB-004 — Background failures stay on the object and in a log.
- SAV-006 — Destructive actions state the consequence and are confirmed.

## Example

Good (shipping admin): Settings > Connections > Integrations lists "Shopify store - shop-demo.example - Healthy - Settings / Remove" and "WooCommerce - Needs attention". "Add integration" opens a grid of store platforms. The Shopify page has tabs Settings / Field mapping / Logs / Tools. Field mapping shows "Import order tags" [x] and a separate "Send tracking numbers back to the store" [x] with "Sent when a label is created." The WooCommerce page shows a banner: "WooCommerce connection failed 5 times: API key rejected. Orders are not importing. Update the key." Remove opens "Remove WooCommerce store? Orders will stop importing. Imported orders stay in your account." INT-001, INT-002, INT-003, INT-005, INT-007, INT-008, INT-012.

Bad: the order-import connector is a top-level menu item; its options sit on a global settings page behind a "Choose integration" dropdown; the API key is printed in plain text; "Import all orders now" is a checkbox that runs on Save; a primary "Disconnect" button removes it on one click. Violates INT-011, INT-003, INT-010, INT-009, INT-012.

## Self-check

- [ ] One page lists every connection; no connection is reachable only from scattered settings.
- [ ] Each connection with more than one option has its own detail page with logs.
- [ ] Every editable credential has Test connection; masking (INT-010) is marked as a suggestion.
- [ ] A failing connection shows a status label and a page warning, not only a log row.
- [ ] Disconnect is secondary, names what stops and what stays, and imported-data deletion is a separate action.
- [ ] Low-confidence rules (INT-005, INT-008, INT-010) are marked as suggestions in the spec.
