# Methodology

How the rules in this repository were made, and how much to trust each one.

## 1. What was studied

Four production admin dashboards from different domains. They are called reference portals A, B, C and D. Evidence keys are `portal_a`, `portal_b`, `portal_c` and `portal_d`. Each was chosen because it is good at something different:

- **Reference portal A:** a large, mature admin with a public design system.
- **Reference portal B:** a task-first portal with a very short path from signup to first value. Why it feels simple is analysed in [`rules/frameworks/task-first-simplicity.md`](../rules/frameworks/task-first-simplicity.md).
- **Reference portal C:** many products under one account, with nested scope levels.

Reference portal D was studied later for navigation and the global chrome around it (sidebar, top bar, settings entry). See section 6a.

The portals are not named. The rules are independent observations of public, logged-in admin UIs. No vendor endorses this project.

## 2. How the portals were explored

The study was strictly read-only, on real accounts.

- A dedicated Chrome profile, separate from any personal profile. The remote debugging port stayed on 127.0.0.1.
- Dialogs were set to dismiss before any navigation.
- Allowed clicks: navigation items, tabs, links, buttons that open a view or panel, and Cancel, Escape or Close.
- Forbidden clicks: any element whose accessible name means a change or a cost (Save, Create, Delete, Connect, Install, Publish, Buy and similar, in English and Italian). A denylist checked every click.
- No toggle, checkbox, radio, select or text field was touched, except global search. The control type came from the ARIA role in the accessibility snapshot.
- No secret was revealed. No anti-bot protection was bypassed. One navigation every 5 to 10 seconds per tab.
- Lists with personal data were studied for structure only (columns, filters, actions). On those pages accessibility snapshots were preferred to screenshots.
- Each portal's AI assistant got at most three informational questions, never a request to act.
- When in doubt, the element was not clicked and was logged as "not explored for safety".

Coverage: every menu item and sub-item, the settings index and each settings page, the home, at least three object types (list and detail), integrations, branding, help, AI assistant, profile menu, notifications and search. The cap was 80 pages per portal, with an early stop after 5 pages in a row without a new pattern. Pages recorded: portal A 89, portal B 70, portal C 103. Pages not visited were logged with a reason.

## 3. Research questions

Twenty questions guided every page visit. They group into:

1. **Navigation:** what is in the sidebar, how it moves (sub-items, active state, collapse, behaviour at 1440, 1024, 768 and 390 px, scope switching, app slots).
2. **Settings:** what goes to settings instead of the menu, which panels always end there, how sections are grouped, how to choose between settings and the working view.
3. **Controls:** checkbox, switch, radio, segmented control, select, searchable combobox, field with a unit.
4. **Help text:** visible text, info tooltip, "Learn more" link, or nothing.
5. **Page structure:** header, title, status badges, primary and secondary actions, overflow, cards, tables, filters, saved views, breadcrumbs; home composition; layout and density.
6. **Global chrome:** support, AI assistant, profile, notifications, global search, account or store switcher, keyboard shortcuts and command palette.
7. **AI interaction:** entry points, panel type, page awareness, suggested prompts, proposed actions and confirmation, inline AI.
8. **Behaviour:** save model (instant with toast, save bar, per section, destructive confirm, undo) and states (empty, loading, error, permission denied, first run).
9. **Language:** nouns or verbs in menus, capitalisation, button verbs, term consistency.
10. **Onboarding and integrations:** steps to first value, defaults, data taken from the integration, checklists, resuming halfway.

## 4. Page records

Each visited page got one JSON record. Fields:

- `portal`, `route` (with ids replaced by `:id`), `page_type`, `nav_location`, `depth_from_home`, `breadcrumb`, `layout`;
- `header` (title, badges, primary action, secondary actions, overflow);
- `components`, and `controls` with ARIA role, label, help form and group;
- `save_model` with its evidence, `global_chrome` with positions, `ai_entry_points`;
- `hypotheses` touched, `evidence_files`, `notes`.

Each portal also got a sitemap with depth and a settings map. A cross-portal matrix answered each research question for each portal.

## 5. Triangulation with public docs

A separate pass, with no browser, collected 63 public documentation pages: the public design system guidelines of portal A (navigation, settings, forms, choice lists, help text, save bar) and the help centres of the three portals.

Every candidate rule was compared with these docs. Each rule states its strongest source, in this order:

- `documented`: a public design guide states the rule;
- `observed`: seen live in at least one portal;
- `inferred`: follows from what was seen, but no portal shows it directly.

For each portal a rule also records `observed`, `documented` or `absent` (looked for, not there or contradicted).

## 6. Confidence

- **high:** supported (observed or documented) in three portals, or stated by a public design system (with at least one portal showing it, or the guide being that portal's own).
- **medium:** two portals.
- **low:** one portal, or inferred (the validator caps inferred rules at low).

The three core portals are listed in every rule. The optional fourth portal (section 6a) is listed only where it was studied, and counts like a core portal. `scripts/validate` enforces these levels as a ceiling.

The skills present low-confidence rules as suggestions, not as defects.

Current counts, from `node scripts/validate`:

| Confidence | Rules |
|---|---|
| high | 67 |
| medium | 72 |
| low | 44 |
| **total** | **183** |

The rules then went into 8 frameworks in `rules/frameworks/`. Each framework cites rule IDs and does not restate them.

## 6a. A fourth portal: reference portal D

On 2026-11-09 reference portal D was studied read-only, for navigation and the global chrome around it, under the same rules as section 2: no change, no form field, no secret revealed.

What was captured: the two-level menu (a narrow icon rail of categories that expands over the page on hover, beside an always visible menu of the current category's pages under group labels), how that second column changes by category job (page menu, searchable object list, log filters), the per-user sidebar mode, the drawer at 390 px, the scope switcher in the top-bar breadcrumb, search and its shortcut, the help entry and the settings area. Only structure was recorded; no project id, organization name or screenshot is kept in this repository.

How its evidence counts: it is an optional portal. It appears as a fourth `evidence` entry only in rules it bears on. Four new rules come from it: NAV-013 to NAV-016. Fourteen existing rules gained a `portal_d` entry (thirteen supporting, one absent for NAV-002). It counts like any portal toward the confidence ceiling, but no existing confidence was raised by it; a raise needs a separate review. Three of the new rules rest on portal D alone and are low confidence, so the skills present them as suggestions.

## 7. Hypotheses

Eleven hypotheses guided the research. They were tested, not assumed. The rules come from the evidence, not from the hypotheses.

| # | Hypothesis | Result |
|---|---|---|
| H1 | Frequent work lives in the menu; rarely touched configuration lives in settings. | Confirmed 3/3 (SET-001). |
| H2 | Configuration of a single object lives on its page, not in global settings. | Confirmed 3/3 (SET-002). |
| H3 | Settings have their own navigation and a fixed entry. | Partial 2/3. Portal C spreads settings per product, with no global hub. |
| H4 | With several scopes, the sidebar changes with scope and the switcher sits at the top. | Partial. The sidebar swaps by scope only in portal C. Not testable in portal B. |
| H5 | Switches apply at once; checkboxes sit in forms with explicit Save. | Partial. The checkbox half holds 2/3. The switch half is documented by portal A's design system; portal C also shows a switch inside a Save form. |
| H6 | Radio for 2-5 exclusive options; select or combobox for long lists. | Partial. Long lists hold 3/3. Portal B uses 6-option radio groups, so CTL-004 allows 2-6. |
| H7 | Essentials in visible text, definitions in tooltips, procedures in docs links. | Confirmed for visible text and docs links (3/3). Tooltip half partial: Portal B almost never uses tooltips. |
| H8 | Everything the end customer sees lives in one area with a preview. | Partial. A brand area exists in 2/3, but no portal keeps all customer output there. Portal C unverified. |
| H9 | The home combines a setup checklist, counted tasks and KPIs. | Refuted as a general pattern. Portal B has no home; portal C has no checklist. Replaced by HOM-001: the home type follows the job. |
| H10 | Search at the top; notifications, help, AI and profile top-right. | Refuted as stated. Placement differs in each portal. The chrome rules are placement-agnostic. |
| H11 | AI on two levels: a global panel and inline actions in fields. | Confirmed where AI exists (2/3). Portal B ships no assistant. |

New hypotheses that gained rule support during the study: an on/off control gates its dependent options (CTL-010); plan-locked features stay visible (STA-005); layered logs for integrations (INT-006, FDB-004); a settings audit trail can stand in for undo (SAV-008).

## 8. Testing the rules in use

The review commands were tested blind on `examples/flawed-dashboard`, a small dashboard with 15 seeded violations. `/dash:review` found 13 of 15 and `/dash:review-live` found 15 of 15. Details, noise and false positives: [evals/review/RESULTS.md](../evals/review/RESULTS.md).

## 9. What is not published

The raw research stays private: page records, snapshots, screenshots, sitemaps, the cross-portal matrix and the portal summaries. They contain account details and personal data from live accounts. This repository holds only the abstract rules, the frameworks and original wireframes. Where a framework cites "private research notes", those notes are not available.

## 10. Limits

- Three portals, plus a fourth for navigation and the global chrome, is a small sample. Treat medium and low rules as starting points.
- Some behaviour could not be tested read-only, for example whether a switch saves at once. Those rules rest on documentation or inference and say so.
- Parts of the account and billing areas sat behind paywalls or permissions and were not visited.
- Known gaps are listed in [ROADMAP.md](../ROADMAP.md).
