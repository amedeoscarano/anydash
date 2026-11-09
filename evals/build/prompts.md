# /dash:build eval prompts

Two blind runs of `/dash:build` with `--plan`. Each run checks that the command writes a complete `dash-spec/`, cites rule IDs, rejects the traps planted in the brief, and stops before code.

The briefs live in [`fixtures/`](fixtures/). They are synthetic: "Acme" is a placeholder and no real business, person or account appears. This eval uses no copy of `examples/flawed-dashboard`.

## How to run

1. Make a new empty working directory per prompt. Do not copy this file or the `fixtures/` folder into it.
2. Load the plugin (`/dash:build` in Claude Code, `dash-build` elsewhere).
3. Send the prompt below, with the brief file's full text pasted where it says so.
4. The run is non-interactive. Do not answer the assumed-values question. The command must keep the values marked "assumed", list them as open questions, and continue (Input, step 3 of `skills/build/SKILL.md`).
5. Give the `dash-spec/` folder, and nothing from this file, to a separate scoring agent with the rubric.

Scoring: a "must-find" item is a hit when the spec makes the expected decision in the right file and cites the rule ID (or a listed alternative). A decision with no rule ID is half a hit. Each Required item is pass or fail; one fail fails the run.

---

## Prompt 1: SaaS invoicing admin, `--plan`

```text
/dash:build --plan

<paste the full text of evals/build/fixtures/invoicing-brief.md>
```

### Rubric 1

**Required (pass or fail)**

- R1. `dash-spec/` holds `index.md`, `inventory.md`, `ia.md`, `pages.md`, `controls.md`, `states.md`, `onboarding.md`, `tokens.md`, `decisions.md`. A missing file passes only if `decisions.md` says why it does not apply.
- R2. No code: no `app/`, `components/`, `package.json` or any `.tsx`/`.ts`/`.js` file. `tokens.md` holds token tables only (a CSS block as a spec snippet is allowed).
- R3. `index.md` has approval status `pending`, an open questions list with every assumed value the brief does not state (at least the roles detail and Reports frequency; values the brief states are recorded in `inventory.md` with their source), and a "Do not build" list where each entry has a reason and a rule ID.
- R4. `inventory.md` uses the columns `Object or job | Kind (work or config) | Frequency | Roles | Plan / gate | Risk | Source`. Every object from the brief has a row. Invoices are daily, work, Owner and Accountant. Invoice defaults, late fees, products and billing are config. Recurring invoices show `Pro` in Plan / gate (STA-005). Void lists destructive and customer-facing. Send lists customer-facing.
- R5. Every row in `decisions.md` has rule IDs or "no rule yet", and a rejected alternative.
- R6. Low-confidence rules (at least ONB-001, ONB-002, STA-004 where cited) are labelled "suggestion".
- R7. No private data: names are Acme or example.com only.

**Must-find (target: 14 of 18)**

| # | Expected decision | Where | Rule IDs (alternatives) |
|---|---|---|---|
| 1 | Billing, users and roles, API keys and audit log live in Settings, not the main menu. Wish 1 is rejected and logged. | `ia.md`, `decisions.md` | SET-009 (SET-001) |
| 2 | Menu holds work areas by frequency: Invoices first, account items last; Settings is a fixed entry at the sidebar bottom. | `ia.md` | NAV-001, SET-005 |
| 3 | No notification bell. "Invoice saved" and "Customer updated" are toasts. Bell is on the "Do not build" list. | `index.md`, `states.md` `## Feedback` | CHR-009 (FDB-001) |
| 4 | No five-step setup wizard. Company name and email come from signup; currency and time zone are provisioned from the locale and editable later. Wizard is on "Do not build". | `onboarding.md`, `index.md` | ONB-001, ONB-002 (both suggestion) |
| 5 | First value is sending the first invoice; connecting the payment provider and the logo are later steps or empty-state prompts, not blockers. | `onboarding.md` | ONB-002, ONB-007 (ONB-006) |
| 6 | No Settings overview page of cards. The Settings entry opens the first settings page. | `ia.md`, `index.md` | SET-006 (SET-004) |
| 7 | The assistant never sends a reminder on its own. It drafts and the user approves through the normal save path, or autonomous sending is on "Do not build". | `pages.md`, `decisions.md` | AI-004 (SAV-011) |
| 8 | Customer detail does not use Overview/Invoices/Notes tabs. It is a two-column record with invoices as a section and notes in the side column. Tabs are on "Do not build" or rejected in `decisions.md`. | `pages.md`, `decisions.md` | DET-007 (LAY-004) |
| 9 | Landing page is the Invoices queue with lifecycle tabs and counts (for example Draft, Sent, Overdue, Paid). No KPI home, because Payments and Reports are not queues. | `pages.md` `## Home` | HOM-001, IDX-004 |
| 10 | Late fee is a checkbox in the Invoice defaults Save form; it gates the percentage field; the unit sits outside the value. | `controls.md` | CTL-001, CTL-010, CTL-007 |
| 11 | Invoice defaults use a sticky save bar that wakes on change. | `controls.md` `## Save model` | SAV-001 (SAV-005) |
| 12 | Void invoice stands apart from Send and Record payment, states that the customer is notified and that it cannot be undone, and is confirmed. | `controls.md`, `pages.md` | SAV-006 (DET-012, HLP-002) |
| 13 | Recurring invoices stay visible on Free, locked, with "Pro plan" and an upgrade path in place. | `states.md` | STA-005 (HLP-006) |
| 14 | Viewer sees edit controls faded with the reason in place, not hidden. | `ia.md` or `controls.md` | VIS-006, HLP-006 |
| 15 | Payment provider: placed by what it adds (in Settings, Integrations or on Payments), one list of connections, a detail page with status. | `ia.md`, `pages.md` | INT-011, INT-001, INT-003 (INT-005) |
| 16 | Invoice emails and PDF share one brand source, with a rendered preview and a test send; emails listed by stage (new, reminder, receipt). | `pages.md` | BRD-001, BRD-003 (BRD-004, BRD-005) |
| 17 | Single account: no scope switcher; the business name sits in the user menu. Global search and a help entry in the chrome. | `ia.md` | CHR-007 exception, CHR-001, CHR-008 (CHR-011) |
| 18 | Every list region has empty, loading, error and no-match states; the empty Invoices list says why and offers "Create invoice". | `states.md` | STA-001, STA-003, IDX-011 (STA-004 suggestion) |

**Fail on**

- Any code file written (breaks R2 and step 10).
- Billing or API keys in the main menu.
- An assistant that sends emails without approval.
- A switch (`Switch`) for late fees inside a form with Save (CTL-002).

---

## Prompt 2: warehouse returns admin, `--plan --stack swiftui`

```text
/dash:build --plan --stack swiftui

<paste the full text of evals/build/fixtures/returns-brief.md>
```

### Rubric 2

**Required (pass or fail)**

- R1. Same nine files as Rubric 1, R1.
- R2. No code: no `.swift`, `.xcodeproj`, `Package.swift` or any web code. `tokens.md` holds token tables only.
- R3. The spec uses SwiftUI terms only: `NavigationSplitView`, `Form`, the macOS `Settings` scene, `.searchable`, `.confirmationDialog`, `ContentUnavailableView`, `.redacted(reason: .placeholder)`. It names no Next.js, Tailwind or shadcn parts (`Sheet`, `Sonner`, `app/` routes, `loading.tsx`).
- R4. `index.md` has approval status `pending`, open questions with the assumed values (at least: whether North and South are one account or separate scopes, frequency of Restock, whether managers also use the iPad), and a "Do not build" list with reasons and rule IDs.
- R5. `inventory.md` has every object from the brief. Returns are daily work for Inspector and Manager. Refund decision lists billed, customer-facing and destructive (cannot be undone). Return policy and Return reasons are config, Manager only.
- R6. Every row in `decisions.md` has rule IDs or "no rule yet", and a rejected alternative.
- R7. No private data: names are Acme, North, South or example.com only.

**Must-find (target: 13 of 17)**

| # | Expected decision | Where | Rule IDs (alternatives) |
|---|---|---|---|
| 1 | No KPI home. One daily queue, so the app lands on the Returns list with state segments and counts (requested, in transit, received, inspected, refunded, rejected). Wish 1 is rejected and logged. | `pages.md` `## Home`, `decisions.md` | HOM-001, IDX-004 |
| 2 | Sidebar in `NavigationSplitView` ordered by frequency: Returns first, Restock later; Reports only if the brief or an open question adds it; global search with `.searchable`. | `ia.md` | NAV-001, CHR-001 |
| 3 | No row checkboxes on Returns, because no bulk action exists. On "Do not build". | `pages.md`, `index.md` | IDX-008 |
| 4 | Return detail does not get five tabs. One two-column record: items and inspection in the main column, refund and status in the side, history on the page. Tabs on "Do not build" or rejected. | `pages.md`, `decisions.md` | DET-007, LAY-004 (DET-008) |
| 5 | Settings is hidden entirely from the Inspector (no menu item, no scene), logged as "no rule yet" under the VIS-006 exceptions. | `ia.md`, `decisions.md` | VIS-006 exception, "no rule yet" |
| 6 | Manager preferences live in the macOS `Settings` scene: a `TabView` of `Form` panes (5 or fewer) or a sidebar list beyond. | `ia.md`, `pages.md` | SET-004 |
| 7 | Return policy booleans: never a `Toggle` in a form with Save. Either the pane applies at once with `Toggle` (CTL-002), or a sheet with Save uses `.toggleStyle(.checkbox)` on macOS (CTL-001). Wish 4 is rejected and logged. | `controls.md`, `decisions.md` | CTL-001, CTL-002 |
| 8 | On iPad, a boolean saved with a form becomes a summary row that pushes an editor with its own Save, or the page is instant. Or the spec notes that iPad users (Inspectors) never reach the policy form. | `controls.md` | SAV-003 (CTL-002) |
| 9 | Return window and restocking fee: number fields with units ("days", "%") outside the value and a range. | `controls.md` | CTL-007 |
| 10 | "Delete return" does not sit next to "Approve refund". It stands apart (danger zone at the end), states the consequence and uses `.confirmationDialog`. Wish 5 is rejected and logged. | `pages.md`, `controls.md` | SAV-006 (DET-012) |
| 11 | "Approve refund" states the amount and that the shopper is refunded and emailed, before the user confirms. | `controls.md` or `pages.md` | HLP-002, SAV-006 (MCP-001) |
| 12 | Auto-refund setting has a visible description of its consequence (money leaves without a manager). | `controls.md` `## Help text` | HLP-001, HLP-002 |
| 13 | North and South are the company's own warehouses in one account: no account switcher. Warehouse is a filter or a nested scope shown by name. Logged as an assumed value. | `ia.md`, `decisions.md` | CHR-007 (exception) |
| 14 | Carrier label provider: one connect step by a manager, then automatic; status and failures visible outside a log. | `pages.md`, `onboarding.md` | ONB-006, INT-011 (INT-005, INT-007) |
| 15 | Shopper emails share one brand source with a preview, listed by stage (approved with label, refund issued, rejected). | `pages.md` | BRD-001, BRD-005 (BRD-003) |
| 16 | States per region with SwiftUI parts: `ContentUnavailableView` for empty and not-found, `.redacted(reason: .placeholder)` for loading, an error with Retry. Empty Returns queue says why. | `states.md` | STA-001, STA-003, STA-006 (STA-004 suggestion) |
| 17 | Inspection photos upload and refunds run in the background and say so; failures stay on the return. | `states.md` `## Feedback` | SAV-009, FDB-004 |

**Fail on**

- Any Swift or web code written.
- Next.js, Tailwind or shadcn parts named in the spec.
- A `Toggle` inside a form that also has a Save button.
- A KPI dashboard as the landing page.
