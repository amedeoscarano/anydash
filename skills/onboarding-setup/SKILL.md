---
name: onboarding-setup
description: Designs the first-run experience of an admin dashboard. It decides which values the platform provisions at signup, the shortest path to first value, whether new accounts get a setup checklist or a short wizard, how the main data source is connected, how each feature onboards in its own empty state, and when setup prompts are dismissed or retired. It produces the onboarding section of a dashboard spec (dash-spec/onboarding.md) or an inline answer. Use when designing or reviewing signup, first login, a getting-started checklist, a setup wizard, default values and prefill, "connect your store/account" flows, feature intro cards, or the home page a brand-new account sees. Use it before building any first-run screen. Do not use it for the visual design of empty, loading or error states (use ui-states), for marketing signup pages, for pricing or plan selection, or for in-app help text on settled settings pages.
---

# Onboarding setup

Decide how a new account gets from signup to its first real result with the fewest user steps. The platform fills what it already knows, the user answers only what only they know, the main data source connects in one authorise step, and every other preference waits in settings with a working default. The skill also decides what the landing page shows until setup is done, and when setup prompts go away.

## Input

- A product brief or a repo path. From a repo, read the signup and account-creation code, the post-login route, the models and the integration code.
- The inventory, when run from /dash:build: objects, jobs, roles, and which object counts as first value (first imported order, first connected domain, first printed label).
- Known signup data: country, plan, linked accounts, locale.

## Output

From /dash:build: write `dash-spec/onboarding.md` with these parts.

1. **First value**: one sentence naming the first real record the user should see, and the target number of user steps.
2. **Provisioning table**: `Value | Source (signup data, locale, plan, linked account) | Written at | Rule ID`. One row per default the system writes.
3. **Asked of the user**: `Field | Why it cannot be inferred | Step | Rule ID`.
4. **First-run flow**: numbered steps, each marked user or system, with the rule ID.
5. **Landing until setup is done**: checklist, wizard or straight to the queue, with goal-named tasks and progress.
6. **Feature onboarding**: one row per feature list page: `Page | Empty-state heading | Primary action | Templates | Rule IDs`.
7. **Prompts**: `Prompt | Optional or required | Dismissible | Retired when | Rule IDs`.
8. **Deferred to settings**: preferences left out of the first run: `Preference | Default | Settings location | Rule IDs`.

Asked directly: answer inline with the same tables, only the parts that apply.

## Procedure

1. Name first value. Pick the one record that proves the product works for this user. Everything below is judged by whether it blocks that record (ONB-002).
2. List every value the first run would ask for. For each, check if signup data, locale, plan or a linked account already gives it. Move those to the provisioning table and write them at account creation, including one default record (package, template, provider row) (ONB-001, low). Keep legal, financial and customer-facing values (tax id, return address, sender identity) as questions: the exceptions of ONB-001 forbid guessing them.
3. Cut the first-run path to the steps that block first value, typically confirm one address or identity and connect one data source. Every other preference gets a default and a pointer to settings on the completion screen (ONB-002, low). Add one confirm step only before the first irreversible or billed action. When first value needs both a source and a destination account (a store and a carrier), connect both in the first run in dependency order, test each one, and count each authorise as one step.
4. Design the data-source connection as one authorise action that returns to the product. Ask only the mapping questions that have more than one valid answer, put "Test connection" on the same screen, and turn automatic sync on by default (ONB-006, low; INT-004).
5. If adding the main object has several starting paths (connect, transfer, buy, create), open a page inside the normal shell with two to four choice cards, each with a one-line consequence (ONB-005, low). A single path needs no choice step.
6. Choose the landing page. Walk `references/frameworks/dhl-simplicity.md` section 1 to see a two-step path in practice.
   - A single-queue tool lands on its queue; if provisioning leaves the account working, skip the checklist (HOM-001, ONB-003 exceptions).
   - If provisioning covers everything except one or two inputs, use a short first-run wizard for those inputs instead of a checklist (HOM-005 exceptions).
   - Otherwise show a guided setup at first access: tasks named by the user's goal, each with "n of m complete" and one "Get started" link to the next unfinished step (ONB-003, HOM-005).
   - Once all tasks are done, remove the block and keep "Restart setup guide" in help or settings (ONB-004, low; HOM-005).
7. Onboard each feature in its own empty state: what it does, one primary start action, and templates or samples for common jobs. Keep the filtered-empty copy separate (ONB-007, IDX-011). A locked or paid feature shown as an empty upsell says it is locked (ONB-007 exceptions). Hand the visual weight and loading/error branches to the ui-states skill.
8. Classify every prompt on home and overviews. Optional prompts (feature intros, upsells, agent setup) are dismissible cards or pills, never blocking, and stay dismissed per user. Required work and security steps have no dismiss control (ONB-008, HOM-006, HLP-007).
9. Suggestion only: for a substantial redesign of an area existing users know, plan a one-time welcome dialog listing the few changes, one "Got it" close, and a replay "Tour" button (ONB-009, low). Never chain it into a blocking tour. Skip it for small changes and for a new account.
10. List deferred preferences with their defaults, so the settings skill can place them. Record each cut in the decision log with the rule ID and the rejected alternative (for example "nine-step wizard").
11. Label every low-confidence rule (ONB-001, ONB-002, ONB-004, ONB-005, ONB-006, ONB-009) as a suggestion in the spec. ONB-001, ONB-002 and ONB-006 rest on one portal; the owner interview in the framework file is still pending.

## Rules applied

- ONB-001 — write known defaults at account creation; ask only what only the user knows (low).
- ONB-002 — first run holds only the steps that block first value; tuning goes to settings (low).
- ONB-003 — guided setup at first access, tasks named by goal with progress and a start action (high).
- ONB-004 — retire setup prompts when done, keep a reopen entry (low).
- ONB-005 — multi-path setup starts inside the shell with 2-4 choice cards (low).
- ONB-006 — connect the data source in one authorise step, test on the spot, auto-sync on (low).
- ONB-007 — each feature onboards in its own empty state with templates (high).
- ONB-008 — optional prompts are dismissible and non-blocking, and stay dismissed (medium).
- ONB-009 — one-time welcome dialog for redesigned areas, replayable tour (low).
- HOM-001 — single-queue tools land on the queue, multi-area products on a home (high).
- HOM-005 — setup checklist grouped by goal with "N of M complete", removed when done (medium).
- HOM-006 — suggestions dismissible, required work not (high).
- IDX-011 — no-match state distinct from the empty list (high).
- INT-004 — test connection next to the credentials (medium).
- HLP-007 — banners only for status or required action (high).

Full text of ONB and HOM rules: `references/rules.md`. HLP, IDX and INT rules live in the rule-library skill. Framework: `references/frameworks/dhl-simplicity.md`.

## Example

Good (shipping admin): signup writes currency and units from the account country, connects the built-in carrier, seeds one "Standard box" package and turns order import on (ONB-001). The first screen asks to confirm the pickup address, then shows "Authorise store" with "Test connection" beside it; after return, one picker asks which warehouse to import from (ONB-002, ONB-006, INT-004). The user lands on "New orders" because the product is one queue (HOM-001). The Automation page is empty with "Start automating your workflow", "Add rule" and two quick-setup templates (ONB-007). A "Connect your accounting tool" card has a Dismiss button; "Verify sender address" does not (ONB-008, HOM-006).

Bad: a nine-step full-screen wizard asks for currency, timezone, unit system, package size, label format and email copy, all empty, before any order can be imported (breaks ONB-001, ONB-002). After authorising the store, a 15-field mapping form and an "Import now" button the user must remember (breaks ONB-006). A "Getting started 6 of 6" card still sits on the home months later (breaks ONB-004, HOM-005).

## Self-check

- First value is named, and every first-run step is justified as blocking it.
- No first-run field asks for a value the account already has; risky values (tax, return address, sender identity) are still asked.
- The connect step has one authorise action, a test action on the same screen and auto-sync on.
- The landing choice follows HOM-001; any checklist has goal names, "n of m" progress, one start link and a removal condition.
- Every feature list page has an empty-state row, separate from its filtered-empty copy.
- Every prompt is marked optional or required; only optional ones are dismissible.
- Low-confidence rules are labelled as suggestions.
