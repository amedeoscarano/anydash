# Methodology

How the rules in this repository were made, and how much to trust each one.

## 1. What was studied

Three admin portals, chosen because each is good at something different:

- **Shopify Admin:** a large, mature admin with a public design system (Polaris).
- **DHL Express Commerce:** a shipping portal with a very short path from signup to first label. Why it feels simple is analysed in `rules/frameworks/dhl-simplicity.md`.
- **Cloudflare Dashboard:** many products under one account, with scope levels (account, zone).

Shopify, DHL, DHL Express Commerce and Cloudflare are trademarks of their respective owners. This project is not affiliated with them.

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

Coverage: every menu item and sub-item, the settings index and each settings page, the home, at least three object types (list and detail), integrations, branding, help, AI assistant, profile menu, notifications and search. The cap was 80 pages per portal, with an early stop after 5 pages in a row without a new pattern. Pages recorded: Shopify 89, DHL 70, Cloudflare 103. Pages not visited were logged with a reason.

## 3. Research questions

Twenty questions guided every page visit. They group into:

1. **Navigation:** what is in the sidebar, how it moves (sub-items, active state, collapse, behaviour at 1440, 1024, 768 and 390 px, scope switching, app slots).
2. **Settings:** what goes to settings instead of the menu, which panels always end there, how sections are grouped, how to choose between settings and the working view.
3. **Controls:** checkbox, switch, radio, segmented control, select, searchable combobox, field with a unit.
4. **Help text:** visible text, info tooltip, "Learn more" link, or nothing.
5. **Page structure:** header, title, status badges, primary and secondary actions, overflow, cards, tables, filters, saved views, breadcrumbs; home composition; layout and density.
6. **Global chrome:** support, AI assistant, profile, notifications, global search, account or store switcher, keyboard shortcuts and command palette.
7. **AI interaction:** entry points, panel type, page awareness, suggested prompts, proposed actions and confirmation, inline AI.
8. **Behaviour:** save model (instant with toast, contextual save bar, per section, destructive confirm, undo) and states (empty, loading, error, permission denied, first run).
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

A separate pass, with no browser, collected 63 public documentation pages: Shopify's Polaris guidelines (navigation, settings, forms, choice lists, help text, contextual save bar) and the help centres of the three portals.

Every candidate rule was compared with these docs. Each rule states its strongest source, in this order:

- `documented`: a public design guide states the rule;
- `observed`: seen live in at least one portal;
- `inferred`: follows from what was seen, but no portal shows it directly.

For each portal a rule also records `observed`, `documented` or `absent` (looked for, not there or contradicted).

## 6. Confidence

- **high:** seen or documented in all three portals, or stated by a public design system (with at least one portal showing it, or the guide being that portal's own).
- **medium:** two of three portals.
- **low:** one portal, or inferred.

The skills present low-confidence rules as suggestions, not as defects.

Current counts, from `node scripts/validate`:

| Confidence | Rules |
|---|---|
| high | 67 |
| medium | 71 |
| low | 41 |
| **total** | **179** |

The rules then went into 8 frameworks in `rules/frameworks/`. Each framework cites rule IDs and does not restate them.

## 7. Hypotheses

Eleven hypotheses guided the research. They were tested, not assumed. The rules come from the evidence, not from the hypotheses.

| # | Hypothesis | Result |
|---|---|---|
| H1 | Frequent work lives in the menu; rarely touched configuration lives in settings. | Confirmed 3/3 (SET-001). |
| H2 | Configuration of a single object lives on its page, not in global settings. | Confirmed 3/3 (SET-002). |
| H3 | Settings have their own navigation and a fixed entry. | Partial 2/3. Cloudflare spreads settings per product, with no global hub. |
| H4 | With several scopes, the sidebar changes with scope and the switcher sits at the top. | Partial. The sidebar swaps by scope only in Cloudflare. Not testable in DHL. |
| H5 | Switches apply at once; checkboxes sit in forms with explicit Save. | Partial. The checkbox half holds 2/3. The switch half is documented by Polaris; Cloudflare also shows a switch inside a Save form. |
| H6 | Radio for 2-5 exclusive options; select or combobox for long lists. | Partial. Long lists hold 3/3. DHL uses 6-option radio groups, so CTL-004 allows 2-6. |
| H7 | Essentials in visible text, definitions in tooltips, procedures in docs links. | Confirmed for visible text and docs links (3/3). Tooltip half partial: DHL almost never uses tooltips. |
| H8 | Everything the end customer sees lives in one area with a preview. | Partial. A brand area exists in 2/3, but no portal keeps all customer output there. Cloudflare unverified. |
| H9 | The home combines a setup checklist, counted tasks and KPIs. | Refuted as a general pattern. DHL has no home; Cloudflare has no checklist. Replaced by HOM-001: the home type follows the job. |
| H10 | Search at the top; notifications, help, AI and profile top-right. | Refuted as stated. Placement differs in each portal. The chrome rules are placement-agnostic. |
| H11 | AI on two levels: a global panel and inline actions in fields. | Confirmed where AI exists (2/3). DHL ships no assistant. |

New hypotheses that gained rule support during the study: an on/off control gates its dependent options (CTL-010); plan-locked features stay visible (STA-005); layered logs for integrations (INT-006, FDB-004); a settings audit trail can stand in for undo (SAV-008).

## 8. Testing the rules in use

The review commands were tested blind on `examples/flawed-dashboard`, a small dashboard with 15 seeded violations. `/dash:review` found 13 of 15 and `/dash:review-live` found 15 of 15. Details, noise and false positives: [evals/review/RESULTS.md](../evals/review/RESULTS.md).

## 9. What is not published

The raw research stays private: page records, snapshots, screenshots, sitemaps, the cross-portal matrix and the portal summaries. They contain account details and personal data from live accounts. This repository holds only the abstract rules, the frameworks and original wireframes. Where a framework cites "private research notes", those notes are not available.

## 10. Limits

- Three portals is a small sample. Treat medium and low rules as starting points.
- Some behaviour could not be tested read-only, for example whether a switch saves at once. Those rules rest on documentation or inference and say so.
- Parts of the account and billing areas sat behind paywalls or permissions and were not visited.
- Known gaps are listed in [ROADMAP.md](../ROADMAP.md).
