---
name: clone
description: >-
  Reverse-engineers, read-only, a web dashboard the user has legitimate access to and turns it into a rebuild spec - feature inventory, IA map, page templates seen, a data model inferred from value-free JSON shapes, main user flows, an API surface file and a MoSCoW rebuild spec linked to the dash design skills, ready as input for /dash:build. Orchestrates site-feature-mapper (IA and features) and api-surface-capture (endpoints and shapes without values) through REA or browser-adapter, and writes everything to dash-clone/. Asks the user to confirm legitimate access first. Use when the user wants to rebuild, replace, migrate off or match an existing admin or back office ("clone this dashboard", "what does this portal do, so we can build our own"). Do not use it to copy branding, text or code, on a site the user cannot lawfully access, to review the user's own dashboard against the rules (use /dash:review), or to mine design rules (use /dash:learn).
disable-model-invocation: true
argument-hint: "<url>"
context: fork
---

# Clone a dashboard into a rebuild spec

Read an existing dashboard the way a careful analyst would, and write down what it does, how it is organised and what data it moves, so the team can rebuild it on their own design. Nothing is copied: no code, no copy text, no branding, no data values. The command runs in a forked context and returns a short summary.

## Input

- `<url>`: the dashboard's start page, on an account the user has legitimate access to.
- Optional: a HAR the user exported from DevTools (Network panel, "Save all as HAR") while doing the main flows, when REA is not available.
- Optional, in the user's words: the areas that matter most, and a page cap (default 60 pages; stop early after 5 pages in a row with no new feature).

## Output

`dash-clone/` in the user's working folder:

| File | Content |
|---|---|
| `ia.md` | Sitemap with depth, nav tree, settings map (site-feature-mapper). |
| `features.md` | Feature inventory with frequency guess (site-feature-mapper). |
| `templates.md` | Page templates seen: `template | example routes | header | main regions | list or form controls`, each mapped to home, index, detail, settings page or wizard. |
| `api-surface.json` | Endpoints and value-free JSON shapes (api-surface-capture). |
| `data-model.md` | Objects, fields with types, relations and lifecycle states, inferred from `api-surface.json` and the UI. One table per object: `field | type | seen in | notes`. |
| `flows.md` | Main user flows as numbered steps: route, action, endpoint called. |
| `spec.md` | MoSCoW rebuild spec: `## Must`, `## Should`, `## Could`, `## Won't`, each item `feature | why this bucket | design skill | rule IDs`, plus `## Open questions` (each closed with one exit: `fix now`, `file as task`, `reject with rationale` or `verify with a test`) and `## Not visited`. Written as a brief that /dash:build accepts. |

`dash-clone/raw/` holds snapshots and any HAR. Add it to `.gitignore` before the first capture; never commit it.

## Procedure

Siblings are `/dash:<name>` in Claude Code and `dash-<name>` elsewhere; read `../site-feature-mapper/SKILL.md`, `../api-surface-capture/SKILL.md` and `../browser-adapter/SKILL.md` and follow their Procedure and Self-check. If site-feature-mapper is missing, build `ia.md` and `features.md` yourself from ARIA snapshots: walk every menu item and sub-item, the settings index and each settings page, one list and one detail per object. If api-surface-capture is missing, write endpoints by method and path template only and say that shapes were not captured.

1. **Confirm access.** Ask the user to confirm, in chat, that they have legitimate access to `<url>`, that its terms of use allow this, and what the rebuild is for. Without a yes, stop. Never bypass a login, paywall, rate limit or bot check; on login, 2FA or CAPTCHA, ask the user to handle it.
2. **Pick the mode.** Own-app on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test` or a staging host the user named in chat. Anything else is third-party-readonly: navigation only, safe-click on every click, no typing except global search, one navigation every 5 to 10 seconds, never Save, Create, Delete, Connect, Install or Buy.
3. **Prepare the browser.**
   - With REA (MCP server `rea`): the user starts Chrome with a temporary profile and `--remote-debugging-port=<port>` on 127.0.0.1, then logs in. Call `list_browser_targets` with the literal `http://127.0.0.1:<port>` (never `localhost`).
   - Without REA: browser-adapter in the matching mode (`readonly.mjs` on port 9333, or `ownapp.mjs` steps for an own app).
4. **Map the IA and features.** Apply site-feature-mapper. With REA, on each page call `inspect_web_page` with `cdp_endpoint`, `target_id`, `include_accessibility_text: true`; it is passive (no JS, no clicks). Once, on the main page, call `analyze_web_bundle` (it parses but never executes JS) for route and endpoint candidates that the menus do not show; mark those routes "from bundle, not visited". Record routes with ids replaced by `{id}`, as in site-feature-mapper. If `analyze_web_bundle` fails, retry once, then note "bundle not analysed" in `ia.md` and continue.
5. **Capture the API surface.** Apply api-surface-capture:
   - REA: `inspect_web_page` with `include_json_body_shapes: true` on each page with data; shapes only. It sees only requests fired during its window, so start it, then have the user click an in-app link to the page. REA shapes carry no formats (`string:email`); when the data model needs them, also run the HAR route.
   - HAR fallback: run its `har-shapes.mjs` on the HAR (`node <api-surface-capture>/scripts/har-shapes.mjs dash-clone/raw/session.har > dash-clone/api-surface.json`). Never read HAR bodies into the chat or into any output.
   Keep the HAR in `dash-clone/raw/` and offer to delete it at the end.
6. **Templates.** Group visited pages by layout into `templates.md`. Name the template and the rule IDs it should follow in the rebuild: index pages IDX-001 (one toolbar), IDX-004 (status segments), IDX-008 (row selection only with bulk actions); detail pages DET-001 (way back), DET-003 (title names the object), DET-005 (few header actions); settings SET-004 (settings as a mode), SET-007 (one grouping axis).
7. **Data model.** From `api-surface.json`, one table per object: field names and types only (`string:email`, `string:date`, enum count). Relations come from `{id}` fields and nested shapes. Lifecycle states come from enum candidates and status badges seen in the UI (labels only when they are product terms, never user data).
8. **Flows.** Pick the 3 to 6 jobs the inventory marks most frequent. For each, list the steps a user takes (route, control, endpoint). In read-only mode, a flow that ends in a save stops at the last safe step; write the rest as "inferred from endpoint".
9. **MoSCoW spec.** Sort every feature:
   - Must: the core objects and their frequent jobs (NAV-001, SET-001).
   - Should: configuration used weekly or by admins.
   - Could: rare settings and conveniences.
   - Won't: features with no use in the inventory, and complexity without value (a bell with no alert feed, CHR-009; row checkboxes with no bulk action, IDX-008).
   Link each item to the dash skill that will design it (nav-placement, settings-architecture, index-page, detail-page, control-selection, save-model, global-chrome, integration-connect). Our design replaces theirs: `spec.md` says what to build, never "copy their layout".
10. **Privacy pass.** Grep every file in `dash-clone/` (not `raw/`) for names, emails, phone numbers, order or account numbers and amounts seen on screen; remove any. Shapes, routes and product terms only.
11. **Return.** To the main context only: pages visited, features by bucket, endpoints captured, objects in the data model, the path of `spec.md`, the next step (`/dash:build dash-clone/spec.md`, or `/dash:reconcile dash-clone/api-surface.json <repo>`), and the offer to delete `dash-clone/raw/`.

## Rules applied

- NAV-001 — work areas first, account last; decides Must versus Could.
- NAV-002 — noun labels; menu names in `ia.md` become object names.
- SET-001 — work in the menu, rare configuration in settings.
- SET-002 — per-object configuration on the object.
- SET-004 — settings as a mode with its own navigation.
- SET-007 — one grouping axis per settings level.
- IDX-001 — one list toolbar above the table.
- IDX-004 — lifecycle states as segments with counts.
- IDX-008 — row selection only where bulk actions exist.
- DET-001 — way back to the parent list.
- DET-003 — title names the object.
- DET-005 — few header actions, the rest in overflow.
- CHR-001 — global search always in the chrome.
- CHR-009 — bell only for a real alert feed.

Full text: `references/rules.md`.

## Example

Good: `/dash:clone http://127.0.0.1:3103/` on a copy of the team's own shipping admin. The user confirms. REA lists one target; 14 pages are inspected. `ia.md` shows Orders, Order detail, Settings (General, Notifications, Shipping) and Integrations. `api-surface.json` holds `GET /api/orders`, `GET /api/orders/{id}`, `PATCH /api/settings`, with `customerEmail: "string:email"` and `status: "string:enum(4)"`. `spec.md` puts Orders and Order detail under Must (index-page, detail-page; IDX-001, DET-003), Notifications under Should, and a bell with no feed under Won't (CHR-009). A grep for customer names and order numbers in `dash-clone/` finds nothing.

Bad: cloning a competitor's portal through a trial account whose terms forbid it. Saving a settings form to see the request body. Pasting a response with real customer emails into `data-model.md`. Copying their CSS, icons or help text into the spec. Committing the HAR.

## Self-check

- [ ] The user confirmed legitimate access and purpose before any page opened.
- [ ] Read-only rules held on every third-party page; no state changed.
- [ ] `api-surface.json` and `data-model.md` hold types and counts, no values.
- [ ] Every page in `ia.md` is either visited or listed under Not visited with a reason.
- [ ] Every Must and Should item names a design skill and at least one rule ID.
- [ ] No names, emails, ids or amounts from the site appear outside `dash-clone/raw/`; `raw/` is gitignored and offered for deletion.
