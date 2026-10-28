---
name: nav-placement
description: Decides where every function of an admin dashboard lives - main sidebar, sub-area sub-nav, settings, the object's own page, top bar or persistent chrome, command palette, or setup checklist - and produces a placement table (function | home | rule IDs). Use when designing or restructuring the information architecture of an admin panel or back office, when adding a new page, setting, action, integration or tool and asking "where should this go?", when a sidebar has grown cluttered, when settings mix account and personal items, or when /dash:build reaches the IA step. Walks a placement decision tree and a settings taxonomy backed by rules observed in Shopify, DHL Express Commerce and Cloudflare. Do not use it for the visual behaviour of the sidebar (order, collapse, breakpoints and badges belong to sidebar-behavior), for top bar and profile menu contents (use global-chrome), for the internal layout of a settings page, or for marketing sites and consumer apps.
---

# Navigation placement

Gives each function of a dashboard one permanent home, chosen by scope, frequency, owner and risk. The output is a placement table that later skills (sidebar-behavior, settings-architecture, page templates) build on. One function, one home; the command palette and setup checklist only add a second path to it.

## Input

- A function inventory: objects, jobs, settings, actions and tools, each with how often it is used, who uses it (one person, admins, everyone) and its risk. From a brief, from `dash-spec/inventory.md`, or from a repo (routes, models, forms).
- Product shape: single product or several sub-products, installed apps or extensions, single or multiple accounts or stores, nested scopes (a site inside an account).

If frequency or owner is unknown, mark the row "assumed" and state the assumption.

## Output

When run from /dash:build: the placement section of `dash-spec/ia.md`. When asked directly: answer inline.

A Markdown table, one row per function:

| Function | Home | Rule IDs |
|---|---|---|
| Orders to fulfil | Sidebar, 2nd item | NAV-001, SET-001 |

Home is one of: Sidebar, Sub-nav of <area>, Settings > <group> > <page>, Object page <object> (section / tab / danger zone), Profile, Top bar / chrome, Command palette (in addition to <home>), Setup checklist (permanent home: <home>).
After the table, list any row that needed a tie-breaker with the reason. Asked directly, also list the settings groups with their grouping axis; from /dash:build, settings-architecture owns the groups and the axis.

## Procedure

1. List every function from the input as one row. Split compound items ("Shipping: rates, labels, pickups") into separate rows.
2. Walk `references/frameworks/placement-decision-tree.md` top to bottom for each row. Stop at the first yes:
   1. Acts on one object only: object page (SET-002). Section action in its section (DET-006); value editable in place (DET-009); overridable default shows inherited or customised (SET-011, low: a suggestion); destructive actions stand apart and are confirmed (SAV-006), in a danger zone at the end when the object has its own settings area (DET-012, low), otherwise in the header overflow menu (DET-012 exception); several independent areas become tabs (DET-007).
   2. Belongs to one sub-product, channel or installed app: that area's sub-nav, with its own Settings item last (SET-003). A single-product tool may keep all settings central instead (SET-003 exception). Installed apps get their own collapsible group (NAV-010, low); a nested child scope with many pages gets its own sidebar (NAV-009, low). An integration with no daily screens gets no nav group (INT-011).
   3. A person's own preference or credential: profile page via the user menu (SET-008, CHR-008).
   4. Account administration (plan, billing, users, roles, API keys, audit log): settings (SET-009).
   5. A daily object or job: sidebar, ordered by frequency (SET-001, NAV-001).
   6. Rarely changed, account-wide configuration: settings (SET-001, SET-004, SET-005).
   7. Needed from every page whatever the scope: top bar or persistent chrome (CHR-001, CHR-007, CHR-011, AI-001, CHR-009). Hand the detail to the global-chrome skill.
   8. A jump to a known page or object for repeat users: also index it in the command palette, never as its only home (CHR-002, CHR-003, CHR-005).
   9. A one-time setup step: setup checklist (HOM-005, ONB-003), plus a permanent home from steps 1-6 so it can be found after the checklist is retired (ONB-004, low confidence). Suggestion: if the platform already knows the value, provision it and skip the step (ONB-001, ONB-002, both low).
3. Apply the tie-breakers. Scope beats frequency: a daily per-object option stays on the object (SET-002). A log sits next to what produces it (DET-008, INT-006, FDB-004). A run-now or maintenance job sits on the same object page as its configuration, in its own card or tools tab, apart from the form and its Save bar (INT-009).
4. Check the urgent-toggle exception. An instant on/off control used during an incident (maintenance mode, emergency protection) may also sit on the object overview; its full configuration stays in settings (SET-001 exception).
5. Asked directly only (from /dash:build, settings-architecture does this): group the settings rows with `references/frameworks/settings-taxonomy.md`. Pick one grouping axis per level: business domain, workflow phase or product (SET-007). Add group headings past about 20 entries. Plan settings search when there are more than about 15 pages (SET-012).
6. Check the sidebar size. About ten or fewer top-level destinations: flat list. More: labeled groups (NAV-005, low confidence, a suggestion).
7. Run the criteria check from the decision tree: frequency, scope, who uses it, risk, findability on return. Fix any row where two criteria pull apart and record the winner and why.
8. Write the table. Every row cites at least one rule ID. Mark rows that rest only on low-confidence rules as "suggestion".

## Rules applied

- SET-001 — Daily work in the menu, rare account-wide configuration behind a separate settings entry.
- SET-002 — Configuration of one object lives on that object's page.
- SET-003 — Sub-product, channel and app settings inside that area, last item (medium).
- SET-004 — Settings is a mode with its own navigation, back link and URLs per page.
- SET-005 — Settings entry fixed at the sidebar bottom.
- SET-007 — One grouping axis per settings level; headings past about 20 entries.
- SET-008 — Personal preferences on a profile page, apart from account settings.
- SET-009 — Plan, billing, users, API keys and audit log behind settings or account admin.
- SET-011 — Overridable defaults show inherited or customised on the object (low).
- SET-012 — Search across settings when there are many pages.
- NAV-001 — Work areas first by frequency, account items last and separated.
- NAV-005 — Flat list up to about ten items, groups above that (low).
- NAV-009 — Child scope swaps the sidebar (low).
- NAV-010 — Extensions in their own collapsible group (low).
- INT-011 — Integration gets a nav group only if it brings daily screens.
- DET-007 — Tabs only for objects with several independent areas.
- DET-012 — Destructive object actions in a danger zone at the end (low).
- CHR-001 — Global search in the persistent chrome.
- CHR-002 — Cmd/Ctrl+K opens search everywhere.
- CHR-005 — Search index and shortcuts generated from the nav config (low).
- CHR-008 — One user menu for identity, preferences and logout.
- HOM-005 — Setup checklist grouped by goal, removed when done.
- ONB-004 — Retire setup prompts, keep a way to reopen them (low).

## Example

Shipping admin with Orders, Shipments, Pickups, Returns, a carrier integration, label format, users and billing.

Good:

| Function | Home | Rule IDs |
|---|---|---|
| Orders to ship | Sidebar, 2nd item after Home | NAV-001, SET-001 |
| Default label format | Settings > Shipping > Labels | SET-001, SET-007 |
| Carrier account (feeds rates only) | Settings > Connections > carrier detail page | INT-011, SET-002 |
| Cancel one shipment | Object page Shipment, header overflow menu, confirm dialog | SET-002, SAV-006 |
| Dark mode | Profile, via user menu | SET-008, CHR-008 |
| Users, Billing, API keys | Settings > Account | SET-009 |
| Connect first carrier | Setup checklist; permanent home Settings > Connections | HOM-005, ONB-004 |
| Jump to "Pickups" | Command palette, in addition to sidebar | CHR-002, CHR-005 |

Bad: "Label format" and "API keys" as top-level sidebar items between Orders and Returns (violates SET-001, SET-009). "Cancel shipment" as a Settings page with a shipment picker (violates SET-002). Dark mode next to currency in Settings > General (violates SET-008). "Connect carrier" reachable only from the checklist, gone once the checklist is done (goes against ONB-004, a low-confidence suggestion).

## Self-check

- [ ] Every function in the inventory has exactly one home row; the palette and checklist rows name the permanent home too.
- [ ] Every row cites at least one rule ID that exists in `references/rules.md` or the rule-library skill.
- [ ] No settings page needs an object picker; per-object options sit on the object (SET-002).
- [ ] No billing, users, API key or audit log item is a sidebar work item (SET-009).
- [ ] Personal preferences are on the profile, not in account settings (SET-008).
- [ ] Settings groups use one axis per level (SET-007).
- [ ] Rows that rest only on low-confidence rules are marked as suggestions.
- [ ] `applies_when` and `exceptions` were read for every cited rule (in `references/rules.md` or the rule-library skill).
