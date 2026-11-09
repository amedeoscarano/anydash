---
name: site-feature-mapper
description: >-
  Maps the information architecture and feature inventory of a web app the user has legitimate access to: sitemap, navigation tree, global chrome, page templates seen (index, detail, settings, home), settings map, and a feature list with a frequency guess per feature. Reads the page passively through REA (list_browser_targets, inspect_web_page, analyze_web_bundle, observe_web_session) or, when REA is missing, through browser-adapter ARIA snapshots. Writes dash-clone/ia.md and dash-clone/features.md with route templates and labels only, never data values. Use when /dash:clone runs, or when someone asks what a dashboard contains, how its menu and settings are organised, or which features a rebuild must cover. Do not use it to capture API endpoints and JSON shapes (use api-surface-capture), to judge a site against the rules (use review-live), on a site the user cannot log into themselves, or to bypass login, paywalls or rate limits.
---

# Site feature mapper

Turn a running web app into a map a rebuild can start from: where everything lives, which page templates exist, what each settings page holds, and which features matter most. The mapper only reads. It records structure (routes, labels, roles, templates), never the data shown on the pages.

## Input

- A start URL and who owns it: the user's own app (own-app mode) or a third-party portal (third-party-readonly mode). The mode comes from the host, as browser-adapter decides it.
- The user's confirmation that they have legitimate access to the site and that reading it is within its terms of use. /dash:clone asks for this first; when called directly, ask before the first request.
- A Chrome the user started with CDP on `127.0.0.1` (for REA or `readonly.mjs`), logged in by the user. Never log in for them.
- Optional: `dash-clone/api-surface.json` from api-surface-capture, to link features to endpoints.

## Output

`dash-clone/ia.md`:

1. `## Sitemap` — table: route template | page title pattern | template (home, index, detail, settings, form, wizard, other) | reached from | visited (yes, seen in bundle only, skipped + why).
   Route templates replace ids and slugs with `{id}` / `{slug}` (`/orders/{id}`), never a real value.
2. `## Navigation tree` — indented list of the sidebar or top menu as shown: group, item label, route, count badge present (yes/no), position (top, bottom, separated).
3. `## Global chrome` — one row per element: search, command palette shortcut, scope switcher, user menu items, notification bell, help entry, and where each sits.
4. `## Page templates` — one block per template seen: regions in order (header, toolbar, filters, table, tabs, sections, danger zone), header actions, and one route that shows it.
5. `## Settings map` — tree of settings groups and pages; per page the section headings and control types (switch, select, text field, radio, list of objects) with labels only.
6. `## Not visited` — routes found but not opened (bundle-only routes, state-changing flows, login walls) and the reason.

`dash-clone/features.md` — table: feature | object | area (navigation, settings, global-chrome, index, detail) | where (route template) | frequency guess (daily, weekly, rare, one-time) | basis for the guess | evidence (`[rea]`, `[aria]`, `[bundle]`, `[docs]`) | endpoint (from api-surface.json, if given).

## Procedure

1. **Confirm access and mode.** Ask the user to confirm legitimate access. Pick own-app or third-party-readonly with the browser-adapter rules. In third-party mode only navigation is allowed: no Save, Create, Delete, Connect, typing (except global search), and stop on login, 2FA or CAPTCHA.
2. **Pick the tool.**
   - REA present (the `rea` MCP server exposes `list_browser_targets`): ask the user to start Chrome with `--remote-debugging-port=<port>` on 127.0.0.1 and open the start URL. The CDP endpoint must be the literal `http://127.0.0.1:<port>`, never `localhost`.
   - REA missing: use browser-adapter. Own-app: `node scripts/ownapp.mjs run <url> <steps.json> <outdir>` with `goto` and `snapshot` steps. Third-party: `CDP_ENDPOINT=http://127.0.0.1:<port> node scripts/readonly.mjs list`, then `snapshot`, `goto` (same origin, rate limited) and guarded `click`. Paths are relative to the browser-adapter folder.
   - Neither: stop and say which outputs could not be produced.
3. **Find the target.** `list_browser_targets` with `cdp_endpoint` and `allowed_origins` set to the site's origin. Pick the `target_id` of the start page. (Fallback: `readonly.mjs list`.)
4. **Read the shell once.** `inspect_web_page` with `cdp_endpoint`, `target_id`, `allowed_origins` and `include_accessibility_text: true`. Leave `include_json_body_shapes`, `include_storage_keys` and `include_script_sources` off; API shapes belong to api-surface-capture. The accessibility tree is read at the end of the window; a full page load inside the window aborts the call (`target_changed`), so inspect after each navigation, not during it. A narrow or headless window can hide the sidebar behind a menu button: use a desktop-sized window (for example `--window-size=1440,900`). From the accessibility tree write the navigation tree and global chrome. Note badges on menu items (NAV-011), the account and settings entries and their position (NAV-001, SET-005), search and its shortcut hint (CHR-001, CHR-002), scope switcher (CHR-007), user menu (CHR-008), bell (CHR-009) and help entry (CHR-011).
5. **Find routes the menu hides.** `analyze_web_bundle` with `cdp_endpoint`, `target_id`, `allowed_origins`, `fetch_source_maps: false`. It parses the JavaScript without running it and returns route and endpoint candidates. Add each route to the sitemap as "seen in bundle only" until a visit confirms it. Do not visit routes whose names change state (`/delete`, `/new`, `/checkout`, `/disconnect`). If the call fails (it can close the REA connection on large development bundles), retry once, then write "bundle not analysed" at the top of `ia.md` and go on.
6. **Walk the pages.** Either let the user click through the menu while `observe_web_session` (`cdp_endpoint`, `target_id`, `observation_ms`, for example 120000) records the navigations, then run `inspect_web_page` on each page left open; or navigate yourself with the fallback tool (one navigation per 5 to 10 seconds in third-party mode). Visit one list page, one detail page and every settings page per object type; one instance per template is enough.
7. **Classify each page** with `references/frameworks/page-templates.md`. Index: toolbar, search, saved views, lifecycle segments, columns, sort, pagination, row actions, import/export (IDX-001, IDX-003, IDX-004, IDX-007, IDX-009, IDX-010). Detail: way back, title, status badges, header actions, tabs, history, danger zone (DET-001, DET-003, DET-004, DET-005, DET-007, DET-008, DET-012). Record what is there, not whether it is right.
8. **Map settings.** For each settings page write the group, the section headings and control types with labels. Note whether settings is a mode with its own navigation (SET-004), whether per-object options live on the object (SET-002), sub-area settings inside the sub-area (SET-003), personal preferences apart from account settings (SET-008) and where users, billing and API keys sit (SET-009). Use `references/frameworks/settings-taxonomy.md` to name the grouping axis per level (SET-007).
9. **Build the feature list.** One row per user-visible feature (an object list, a filter, an export, a setting group, a connection). Guess frequency from placement and signals: in the sidebar with a count badge suggests daily; in settings suggests rare; a setup checklist suggests one-time. Write the basis for every guess. Placement follows `references/frameworks/placement-decision-tree.md` (SET-001). If api-surface.json exists, fill the endpoint column by matching route templates.
10. **Strip values.** Before writing, replace ids, order numbers, names, emails, amounts and dates with their kind (`{id}`, `{name}`, `{amount}`). Page titles become patterns ("Order {id}"). Then grep the output for digits of 3 or more, `@` and any customer or company name seen on screen; fix every hit that is not a label.
11. **Write** `dash-clone/ia.md` and `dash-clone/features.md`. Do not save HAR files, screenshots or raw REA Evidence into `dash-clone/`; they may hold values.

## Rules applied

These rules name what to look for; the mapper records presence, review-live judges it.

- NAV-001 — Work areas first, account items last and separated.
- NAV-005 — Flat list up to about ten items, groups above (low).
- NAV-009 — Sidebar swaps for a child scope (low).
- NAV-011 — Counts only on work queues.
- SET-001 — Daily work in the menu, rare configuration in settings.
- SET-002 — Per-object configuration on the object.
- SET-003 — Sub-area settings inside the sub-area.
- SET-004 — Settings as a mode with its own navigation.
- SET-005 — Settings entry fixed at the sidebar bottom.
- SET-007 — One grouping axis per settings level.
- SET-008 — Personal preferences apart from account settings.
- SET-009 — Users, billing and API keys live in settings.
- CHR-001 — Global search always in the chrome.
- CHR-002 — Cmd/Ctrl+K opens search everywhere.
- CHR-007 — Scope switcher at the top of the sidebar.
- CHR-008 — One user menu for identity, preferences and logout.
- CHR-009 — Bell only for a real alert feed.
- CHR-011 — Persistent help and support entry.
- IDX-001 — One list toolbar above the table.
- IDX-004 — Lifecycle states as segments with counts.
- IDX-010 — Import and export as list-level actions.
- DET-001 — Way back to the parent list.
- DET-007 — Tabs only for objects with several independent areas.
- DET-012 — Danger zone at the end of object settings (low).

Full text: `references/rules.md`.

## Example

Own shipping admin on `http://127.0.0.1:3103`.

Good `features.md` rows:

| Feature | Object | Area | Where | Frequency | Basis | Evidence |
|---|---|---|---|---|---|---|
| Order list with status segments | Order | index | `/orders` | daily | sidebar item 2, count badge (NAV-011, IDX-004) | [rea] |
| Order detail with shipment history | Order | detail | `/orders/{id}` | daily | reached from every list row (DET-001, DET-008) | [rea] |
| Default label format | Account | settings | `/settings/shipping` | rare | settings page, select control (SET-001) | [aria] |
| Carrier connection | Integration | settings | `/settings/integrations` | one-time | settings group, Connect not clicked (SET-001) | [aria] |
| Bulk export | Order | index | `/orders/export` | weekly | bundle only, not visited (IDX-010) | [bundle] |

Bad: "Order #1001 for Acme Corp, 49.90 EUR" as a sitemap title (a data value, must be `Order {id}`). Clicking "Connect" on the carrier page to see the next step in a third-party portal (state change; safe-click denies it). Calling `inspect_web_page` with `include_json_body_shapes: true` and pasting bodies into features.md (shapes are api-surface-capture's job, values never). Using `http://localhost:9334` as the CDP endpoint (REA refuses it; use `127.0.0.1`).

## Self-check

- [ ] The user confirmed legitimate access before the first request; the mode matches the host.
- [ ] No login, 2FA, CAPTCHA, paywall or rate limit was bypassed; no state-changing click or field input happened in third-party mode.
- [ ] Every route is a template; grep of the output finds no ids, emails, names, amounts or dates.
- [ ] Every sitemap row says visited, bundle only or skipped with a reason.
- [ ] Every feature has a frequency guess with its basis and an evidence tag.
- [ ] The settings map lists control types and labels, never current values.
- [ ] No HAR, screenshot or raw Evidence file was written into `dash-clone/`.
- [ ] The tool used (REA or which browser-adapter path) is stated at the top of ia.md.
