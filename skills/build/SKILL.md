---
name: build
description: Designs and builds a complete admin dashboard from a product brief or an existing repo. It runs the full pipeline - inventory of objects, jobs, frequency, roles and risk; information architecture; page templates; controls, save model and help text; global chrome and AI assistant; onboarding and UI states; integrations and branding; visual tokens - and writes a reviewed spec in dash-spec/ with a decision log and a "Do not build" list, then asks for approval before writing code. Default stack is Next.js App Router with Tailwind and shadcn/ui (Supabase when the repo uses it); --stack swiftui targets NavigationSplitView, Form and the macOS Settings scene. Use when the user asks to design, plan, scaffold, rebuild or restructure a whole admin panel, back office, console or settings area. Do not use it for one question about a single control, page or state; call the matching specialist skill instead. Do not use it for marketing sites or consumer apps.
disable-model-invocation: true
argument-hint: "[brief|repo] [--plan] [--stack next|swiftui]"
---

# Build a dashboard

Turn a brief or a repo into an admin dashboard that follows the rulebook. The command orchestrates the specialist skills in a fixed order, writes one spec in `dash-spec/`, records every decision with its rule IDs, and stops for approval before any code. Each step feeds the next: the inventory decides the menu, the menu decides the pages, the pages decide the controls and states.

## Input

- A brief in text: product, users and roles, main objects, daily jobs, plans, integrations, customer-facing outputs.
- Or a repo path. Build the inventory from the code: routes or screens, data models and migrations, forms and their fields, role and plan checks, integration clients, email templates. Detect Supabase (`supabase/`, `@supabase/` imports) and the existing UI kit.
- `--plan`: stop after the spec is approved (step 10). Write no code.
- `--stack next` (default): Next.js App Router, Tailwind, shadcn/ui. `--stack swiftui`: SwiftUI on macOS and iPadOS.

Questions to the user, in this order:
1. Draft `inventory.md` (step 1), marking every value the brief or repo does not give as "assumed".
2. Send one message that lists every assumed value: roles, frequency and risk of the main objects, and also anything that decides scope (one account, or several stores or workspaces that are the company's own connections versus customer scopes, CHR-007), who the end customer is and what they receive (one brand or one per store), and whether billing happens in the product (SET-009).
3. Wait for the answer before step 2. With `--plan` the wait still applies. If no answer is possible (a non-interactive run), keep the values marked "assumed", list them under open questions in `index.md`, and continue.

## Output

`dash-spec/`, one file per part. Base path: the repo root when given a repo, otherwise `./dash-spec` in the current working directory.

| File | Content | Written by |
|---|---|---|
| `index.md` | Summary, links to the other files, open questions, "Do not build" list (also from settings-architecture), approval status (`pending` or `approved`) | this command |
| `inventory.md` | `Object or job | Kind (work or config) | Frequency | Roles | Plan / gate | Risk (one or more) | Source (brief or file path)` | this command |
| `ia.md` | Placement table, menu, settings tree (Settings rows only), chrome, integration and branding placement | nav-placement, sidebar-behavior, settings-architecture, global-chrome, integration-connect, customer-branding |
| `pages.md` | Template per page, with region keys; AI, integrations, branding sections | home-layout, index-page, detail-page, ai-assistant-ux, integration-connect, customer-branding |
| `controls.md` | `## Controls` (every field, with its source), `## Save model`, `## Help text`, `## Copy` | control-selection, save-model, help-text-policy, microcopy (one section each) |
| `states.md` | State matrix per page, then `## Feedback` | ui-states (matrix), feedback-messaging (`## Feedback`, built from the `## Save model` outcomes) |
| `onboarding.md` | First value, provisioning, first-run flow | onboarding-setup |
| `tokens.md` | Spacing, type, colour, radius, density tokens | visual-tokens |
| `decisions.md` | `Decision | Rule IDs | Alternative rejected | Why` | every step |

Budget: `index.md` fits one screen (at most about 600 words). Every other file is tables first, with at most one sentence of prose per section. Cite a rule ID; never restate the rule's text. Target under 6,000 words for the whole folder. Put detail a reviewer does not need for approval into the table cells, not into paragraphs.

After approval, without `--plan`: the code, then a short build report listing files written and any rule not met.

## Procedure

Specialist skills are siblings in this plugin: `/dash:<name>` in Claude Code, `dash-<name>` elsewhere. For each sibling, invoke it, or read its `SKILL.md` in the sibling folder (`../<name>/SKILL.md`), and follow its Procedure and its Output for the /dash:build case, so every file keeps the sibling's format. Only when that `SKILL.md` is missing, read its rule areas in `references/rules.md` and the matching framework in `references/frameworks/`, and apply them directly. Label every low-confidence rule as a suggestion in the spec.

1. **Inventory.** List objects and jobs. For each: how often it is used (daily, weekly, rare), which roles touch it, and the risk of a wrong action (none, reversible, billed, customer-facing, destructive; list every one that applies). Mark day-to-day work versus account configuration in the Kind column (SET-001), and any plan or permission gate in Plan / gate (STA-005). Write `inventory.md`.
2. **Information architecture.** Apply nav-placement with `references/frameworks/placement-decision-tree.md`: daily work in the menu ordered by frequency, account items last (NAV-001, SET-001), per-object configuration on the object (SET-002), administration in settings (SET-009). Its placement table is the single source of homes. Apply sidebar-behavior (NAV-003, NAV-004, NAV-006). Then apply settings-architecture with `references/frameworks/settings-taxonomy.md` to the rows whose home is Settings only: groups, axis and page layouts (SET-004, SET-006, SET-007). If the inventory has external connections, apply integration-connect for their placement (INT-011); if the product sends anything to end customers, place customer-branding's settings. Write `ia.md`.
   Roles: hide a whole area (its menu item and pages) from a role that can never be granted access to it, for example Settings for a packer role with no settings permission (VIS-006 exceptions; log it as "no rule yet"). Keep visible but faded, with the reason in place, any control the user could be granted (VIS-006, HLP-006).
3. **Page templates.** Pick a template per page from `references/frameworks/page-templates.md`. Apply home-layout: a single-queue tool lands on its queue, a multi-area product gets a home (HOM-001); count queues as home-layout step 1 defines them. Apply index-page and detail-page: full-width tables (LAY-002), two columns for records, tabs only for objects with several equal areas (LAY-004, DET-007). Create and edit flows use template 4 (Form) with save-model: a full page, not a modal, for large forms (FDB-007), and the price shown before a billed submit. Apply integration-connect (INT-001, INT-003) and customer-branding (BRD-001, BRD-003) to their pages, when relevant. Write `pages.md`.
4. **Controls, save, help, words.** For each form and settings page from step 3, list its fields first: from the repo, or inferred from the brief and marked "brief, assumed" in the `source` column. Then apply control-selection with `references/frameworks/control-selection-matrix.md`: checkbox in a Save form, switch only for instant changes (CTL-001, CTL-002). Apply save-model: sticky save bar, separate destructive actions (SAV-001, SAV-006). Apply help-text-policy with `references/frameworks/help-text-tree.md`: visible description for non-obvious settings, consequences never only in a tooltip (HLP-001, HLP-002). Apply microcopy: verb plus object on buttons, sentence case (MCP-001, MCP-002). Write `controls.md`.
5. **Chrome, AI, support.** Apply global-chrome with `references/frameworks/global-chrome-map.md`: search, user menu, help entry (CHR-001, CHR-008, CHR-011); no bell without a real feed (CHR-009). If the product ships an assistant, apply ai-assistant-ux with `references/frameworks/ai-interaction-model.md`: no write without approval (AI-004). Add to `ia.md` and `pages.md`.
6. **Onboarding and states.** Apply onboarding-setup with `references/frameworks/dhl-simplicity.md`: the first run holds only steps that block first value (ONB-002, low: suggestion), each feature onboards in its empty state (ONB-007). Apply ui-states and feedback-messaging: empty, loading, locked, not found per region (STA-001, STA-003, STA-005, STA-006), error with Retry per region (STA-004, low: suggestion); one channel per event (FDB-001). Write `onboarding.md` and `states.md`. The `/dash:states` and `/dash:onboard` commands run a superset of these steps alone (a Check mode, a connect-step table and a time-to-first-value estimate).
7. **Integrations and branding check.** Steps 2 and 3 placed and designed them, so steps 4 and 6 already cover their fields and states. If the inventory has no external connections, or the product sends nothing to end customers, write "not applicable" with the reason in `decisions.md`.
8. **Visual tokens.** Apply visual-tokens: neutral surfaces, one filled primary per view, semantic tokens for light and dark (VIS-001, VIS-002, VIS-009), one spacing scale (LAY-006). Write `tokens.md`. With `--plan` or from a brief, write the token tables only (a CSS block may appear in `tokens.md` as a spec snippet) and skip the component grep.
9. **Decision log and "Do not build".** Every choice with more than one option gets a row in `decisions.md`. Where no rule applies, write "no rule yet" in the Rule IDs column. In `index.md`, list features and settings that add complexity without value, each with its reason and rule ID. Typical entries: a notification bell with no alert feed (CHR-009); a settings overview page of cards (SET-006); a multi-step setup wizard for values the platform knows (ONB-001, ONB-002, both low: suggestion); tabs on a record detail with one main body (DET-007); row checkboxes with no bulk action (IDX-008); a column picker on a five-column table (IDX-005); a metric picker when every user needs the same metrics (HOM-004); an AI entry when no assistant ships (AI-001).
10. **Ask for approval.** Show the user the `index.md` summary, the menu, the page list and the "Do not build" list. Ask them to approve or change the spec. Do not write code before a clear yes. If the user asks for changes, re-run the affected steps and ask again. Set approval status in `index.md` to `approved`, or `pending` when no answer is possible. With `--plan`, stop here.
11. **Code.** Build the shell first (sidebar, chrome, live regions at the root, FDB-008), then pages in inventory order, then states. For each page, run the "Check (static)" line of every rule that page cites in `references/rules.md`. List unmet rules in the build report instead of hiding them.

### Stack notes

Next.js App Router + Tailwind + shadcn/ui:
- Shell: shadcn `Sidebar` with collapsible icon rail, `Sheet` drawer below 768 px (NAV-003, NAV-006). `Command` dialog on Cmd/Ctrl+K (CHR-002). User menu in `DropdownMenu` (CHR-008).
- One route per settings page under `app/(admin)/settings/` (SET-004). Root `layout.tsx` mounts the `Sonner` `Toaster` and the status live region (FDB-008).
- Forms: `Form` with react-hook-form, `Checkbox`, `RadioGroup`, `Select`, `Command` combobox (CTL-001, CTL-004, CTL-005, CTL-006). Sticky save bar reads `formState.isDirty` (SAV-001). `Switch` only where the change saves on toggle (CTL-002). `AlertDialog` for destructive actions (SAV-006).
- States: `loading.tsx` and `Skeleton` in place (STA-003), `error.tsx` per segment with Retry (STA-004, low: suggestion), `not-found.tsx` inside the admin layout (STA-006).
- Supabase, when present: read roles and plan from the session and enforce them with row-level security; the UI states only explain (STA-005, HLP-006).

SwiftUI:
- `NavigationSplitView` with sidebar list ordered by frequency (NAV-001); `.searchable` on the root for global search (CHR-001).
- macOS: a `Settings` scene for preferences: a `TabView` of `Form` panes up to about 5 panes, a `NavigationSplitView` with a sidebar list beyond (SET-004). Controls there apply at once, so `Toggle` is correct (CTL-002); a sheet with explicit Save uses checkbox-style toggles (`.toggleStyle(.checkbox)`, macOS only) (CTL-001).
- iPadOS has no checkbox style: for a boolean saved with a form, show a summary row that pushes an editor with its own Save (SAV-003), or make the page instant with `Toggle` (CTL-002). Never a `Toggle` in a form with Save.
- `.confirmationDialog` for destructive actions (SAV-006). `ContentUnavailableView` for empty and not-found (STA-001, STA-006). `.redacted(reason: .placeholder)` while loading (STA-003).

## Rules applied

- NAV-001 — menu holds work areas by frequency, account last.
- SET-001 — daily work in the menu, rare configuration in settings.
- SET-002 — per-object configuration on the object.
- SET-004 — settings as a mode with its own navigation and URLs.
- SET-009 — billing, users, keys and audit log live in settings.
- HOM-001 — home type follows the job.
- LAY-002 — index tables span the full width.
- LAY-004 — two-column record detail.
- DET-007 — tabs only for several equal areas.
- CTL-001 — checkbox for a boolean in a Save form.
- CTL-002 — switch only for instant changes.
- SAV-001 — sticky save bar that wakes on change.
- SAV-006 — destructive actions apart, consequence stated, confirmed.
- HLP-001 — visible description for non-obvious settings.
- HLP-002 — consequences in visible text, never only a tooltip.
- MCP-001 — buttons start with a verb and name the object.
- CHR-001 — global search always in the chrome.
- CHR-009 — bell only for a real alert feed.
- AI-004 — AI never writes without approval.
- ONB-002 — shortest path to first value (low, suggestion).
- ONB-007 — each feature onboards in its empty state.
- STA-001 — empty state names the content and one action.
- STA-003 — loading placeholders in place, no provisional zero.
- FDB-001 — one feedback channel per kind of event.
- VIS-002 — one filled primary button per view.

Full text: `references/rules.md`. Frameworks: `references/frameworks/`.

## Example

Good (brief: "shipping admin for a small store; one owner, one packer; orders arrive from the store"): the inventory marks Orders as daily for both roles, Packages weekly, Billing rare and owner-only. The menu is Orders, Packages, Pickups, Reports, then Settings at the bottom (NAV-001, SET-005). Packages and Pickups are weekly, and returns to review are a state tab with its count on Orders, so there is one daily queue. The tool lands on the Orders queue with lifecycle tabs and counts, not a home (HOM-001, IDX-004). The packing slip toggle is a checkbox in the Labels settings form with a sticky save bar (CTL-001, SAV-001). "Delete package" sits in a danger zone with an `AlertDialog` (SAV-006). `decisions.md` has the row "Land on Orders queue | HOM-001 | Overview home | One queue, one daily job". "Do not build" lists a notification bell (CHR-009) and a setup wizard asking for currency and units (ONB-001, low: suggestion). The command shows the spec and waits for approval.

Bad: the command scaffolds 14 routes straight from the brief without a spec or approval. Billing and API keys sit in the main menu next to Orders (breaks SET-009). Every settings page mixes switches with a Save button (breaks CTL-002). Tables have no empty or loading branch (breaks STA-001, STA-003). No decision log exists, so nobody can tell why the home has KPI tiles for a one-queue tool (breaks HOM-001).

## Self-check

- `inventory.md` gives frequency, roles and risk for every object and job.
- Every file in the Output table exists, or `decisions.md` says why it does not apply.
- Every row in `decisions.md` has rule IDs or "no rule yet", and a rejected alternative.
- The "Do not build" list exists and each entry has a reason.
- Low-confidence rules are labelled as suggestions in the spec.
- The user approved the spec before any code was written; with `--plan`, no code was written.
- The built shell mounts live regions at the root and every page has its state branches.
