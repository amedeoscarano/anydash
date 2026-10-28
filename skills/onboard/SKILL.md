---
name: onboard
description: Designs or checks the onboarding of an admin dashboard - the steps from signup to first value, the defaults and prefill written at account creation, the setup checklist or short wizard, how the main data source connects, and when setup prompts retire - and estimates time to first value with a Keystroke-Level Model count. It writes dash-spec/onboarding.md, or a findings table when checking an existing flow. Use when asked to design, audit, shorten or fix signup, first login, a getting-started checklist, a setup wizard, "connect your store/account" flows or the page a new account lands on. Do not use it for empty, loading or error states across all pages (use /dash:states), for marketing signup pages, or for pricing and plan selection.
disable-model-invocation: true
argument-hint: "[path|url]"
---

# Onboard

Get a new account from signup to its first real result with the fewest user operations. The command names first value, moves every known value into provisioning, cuts the first run to the steps that block first value, designs the connect step and the landing page, and puts a number on the result: an estimated time to first value. It orchestrates the onboarding-setup and integration-connect skills.

## Input

- `[path]`: a spec (`dash-spec/`) or a repo. From a repo, read signup and account-creation code, the post-login route, seed or default values, integration clients and the home or queue page.
- `[url]`: a running product. Walk the first run in a browser on a test account the user provides. Never sign up or enter credentials on the user's behalf without their go-ahead, and never with real customer data.
- No argument: the current repo, or a brief the user gives in chat.

## Output

`dash-spec/onboarding.md` with the parts defined by onboarding-setup (first value, provisioning table, asked of the user, first-run flow, landing, feature onboarding, prompts, deferred to settings), plus:

- **Connect step**: `Integration | Placement | Auth | Mapping questions | Test | Sync default | Rule IDs`.
- **Time to first value**: `Step | Who | KLM operators | Seconds | Rule IDs`, with the user total, the known system waits listed apart, and the assumptions.
- When checking an existing flow, a findings table first: `Step | Finding | Status | Rule IDs | Fix`. Status is only `pass`, `fail` or `missing`. A finding that belongs to another command (for example a loading state for `/dash:states`) is not a row. List it under the table in "Out of scope", with the command it goes to.

## Procedure

Siblings: apply the onboarding-setup and integration-connect skills (`/dash:<name>` in Claude Code, `dash-<name>` elsewhere). If either is not installed, apply the ONB, HOM and INT rules in `references/rules.md` directly. ONB-001, ONB-002, ONB-004, ONB-005, ONB-006, ONB-009, INT-005 and INT-008 are low confidence: write "(suggestion)" after the ID in every table cell and sentence where it appears, including KLM and Connect tables. A legend at the top does not replace this.

1. **Name first value.** The one record that proves the product works: first imported order, first connected domain, first printed label (ONB-002).
2. **Map the current or proposed flow.** List every screen and field from signup to first value. Mark each step user or system. For a URL, record what was asked, what was prefilled and where the user landed.
3. **Provision what is known.** Every value that signup data, locale, plan or a linked account gives is written at account creation, including one starter record (ONB-001). Keep legal, financial and customer-facing values (tax id, return address, sender identity) as questions (ONB-001 exceptions).
4. **Cut the path.** Keep only steps that block first value; every other preference gets a default and moves to settings (ONB-002). Add one confirm step before the first billed or customer-facing action (ONB-002 exceptions). Several starting paths open inside the shell as two to four choice cards (ONB-005).
5. **Connect the data source.** Run integration-connect. One authorise action that returns to the product, only the mapping questions with more than one valid answer, "Test connection" on the same screen, automatic sync on (ONB-006, INT-004, INT-008). Place the integration by what it adds (INT-011); it gets a row in the integrations list and its own detail page (INT-001, INT-003). After setup, each connection shows a status label (INT-005) and a failure raises a page warning that names the connection, impact and fix (INT-007).
6. **Choose the landing.** Walk `references/frameworks/dhl-simplicity.md` section 1 for a two-step path in practice. A single-queue tool lands on its queue (HOM-001). Otherwise a guided setup grouped by goal, "N of M complete", one "Get started" per group (ONB-003, HOM-005). Pending work shows as counted links (HOM-002). Use region 4 of the home template in `references/frameworks/page-templates.md`.
7. **Feature empty states.** Each feature page onboards in its empty state with one start action and templates (ONB-007). Hand loading and error branches to `/dash:states`.
8. **Prompts.** Optional prompts are dismissible and stay dismissed; required and security steps are not (ONB-008, HOM-006). Retire setup prompts when done and keep "Restart setup guide" in help or settings (ONB-004). A redesign for existing users gets one welcome dialog with a replayable tour (ONB-009).
9. **Estimate time to first value with KLM.** Count operators for each user step of the proposed flow, and of the current flow when checking:
   - K = 0.2 s per keystroke, P = 1.1 s to point at a target, B = 0.1 s per button press or release (a click is P + 2B), H = 0.4 s to move hands between mouse and keyboard, M = 1.35 s of mental preparation before each decision or new field.
   - A prefilled field the user only confirms costs M + P + 2B. A typed field costs M + P + 2B + H + n·K + H for n characters.
   - Sum the user seconds. List system waits (import interval, email delivery) apart, with their known or unknown duration.
   - State the limits: KLM models an expert with no errors, no reading time and no waiting. Use it to compare flows, not to promise a minute count.
10. **Measure, when possible.** If the friction command is installed (v0.2), suggest `/dash:friction` to measure the flow on a real run and compare it with the KLM estimate. If it is not installed, say the number is a model estimate only.
11. **Write the result.** Write `dash-spec/onboarding.md`. Record each cut and each landing choice in `dash-spec/decisions.md` with the rule ID and the rejected alternative (for example "nine-step wizard").

## Rules applied

- ONB-001 — provision known defaults before the first screen (low).
- ONB-002 — shortest path to first value, tuning later (low).
- ONB-003 — guided setup at first access, framed by goal (high).
- ONB-004 — retire setup prompts once done, keep a reopen entry (low).
- ONB-005 — multi-path setup inside the shell with 2-4 cards (low).
- ONB-006 — connect in one authorise step, sync automatically (low).
- ONB-007 — each feature onboards in its own empty state (high).
- ONB-008 — optional prompts dismissible and non-blocking (medium).
- ONB-009 — one-time welcome dialog for redesigned areas (low).
- HOM-001 — single-queue tools land on the queue (high).
- HOM-002 — pending work as counted links (medium).
- HOM-005 — setup checklist by goal with progress, removed when done (medium).
- HOM-006 — suggestions dismissible, required work not (high).
- INT-001 — one list of connected integrations (high).
- INT-003 — each integration has its own detail page (high).
- INT-004 — test the connection on the spot (medium).
- INT-005 — visible status per connection (low).
- INT-007 — sync failures surface outside the log (medium).
- INT-008 — field mapping as an explicit list with defaults (low).
- INT-011 — integration placement follows what it adds (high).

Full text: `references/rules.md`. Frameworks: `references/frameworks/dhl-simplicity.md`, `references/frameworks/page-templates.md`.

## Example

Good (shipping admin): signup writes currency, units, the built-in carrier, one "Standard box" package and auto-import on (ONB-001). The first run is five user steps (ONB-002, ONB-006, INT-004; ONB-001, ONB-002 and ONB-006 are suggestions):

| Step | Who | KLM operators | Seconds | Rule IDs |
|---|---|---|---|---|
| Confirm prefilled pickup address | user | M P 2B | 2.65 | ONB-001, ONB-002 |
| Click "Authorise store" | user | M P 2B | 2.65 | ONB-006 |
| Approve on the store's page | user | M P 2B | 2.65 | ONB-006 |
| Pick warehouse from a select | user | M P 2B P 2B | 3.95 | ONB-006, INT-008 |
| Click "Test connection" | user | P 2B | 1.30 | INT-004 |
| First orders import | system | wait, interval in settings | not counted | ONB-006 |

User total: 13.2 s of operator time. The account lands on the "New orders" queue (HOM-001). The Automation page shows "Add rule" and two templates (ONB-007). `/dash:friction` is not installed (v0.2), so the report says the 13.2 s is a model estimate only.

Bad: a nine-step wizard asks for currency, timezone, units, package size, label format and sender name, all empty (breaks ONB-001, ONB-002). Six typed fields of about 10 characters cost 6 × (M + P + 2B + H + 10K + H) = 32.7 s, plus nine "Next" clicks at 2.65 s = 23.85 s: about 57 s before the store connect even starts. The connect step is followed by a 15-field mapping form and a manual "Import now" (breaks ONB-006, INT-008). "Getting started 6 of 6" stays on the home for months (breaks ONB-004, HOM-005).

## Self-check

- First value is named and every user step is justified as blocking it.
- No step asks for a value the account already has; tax, return address and sender identity are still asked.
- The connect step has one authorise action, a test on the same screen and auto-sync on.
- The KLM table covers every user step, uses the stated operator times, and lists system waits apart.
- The KLM limits are stated, and `/dash:friction` is suggested only if it is installed.
- Every optional prompt is dismissible; no required step is.
- Every occurrence of ONB-001, ONB-002, ONB-004, ONB-005, ONB-006, ONB-009, INT-005 and INT-008 is followed by "(suggestion)".
