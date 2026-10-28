---
name: static-rule-audit
description: Audits admin dashboard code, a dash-spec/ folder or screenshots against the "Check (static)" line of every rule in the rulebook, without running the app. It walks all rule areas, decides for each rule whether it applies, is not applicable or cannot be checked statically, runs the check with grep and file reads, and writes findings rows (severity, rule ID, path:line, evidence, recommendation, exit) plus a "Not checked" list so coverage is explicit. Use when asked to audit, lint, check or review a dashboard, settings page, form or spec against the rules, when /dash:review or /dash:review-live runs its static pass, or when someone asks "which rules does this break?". Do not use it to run checks in a live browser (use live-rule-audit), to judge visual consistency from screenshots and computed styles (use visual-audit), or to design something new (use /dash:build or the specialist design skills).
---

# Static rule audit

Check a dashboard against every rule's static check and report what breaks, with evidence. The audit is systematic: every rule gets a decision, so the reader can see what was checked, what does not apply and what needs a live run. A rule never fails on taste alone; it fails on its own check.

## Input

- A repo path (default: the current directory). Read routes, layouts, components, forms, nav config, string catalogs, CSS and tokens.
- Or a spec folder `dash-spec/` written by /dash:build.
- Or screenshots (PNG, JPG). Only checks that name a screenshot or a visible result can run on them; the rest go to Not checked.
- Optional: a list of areas or rule IDs to limit the audit. Without it, audit all areas.

## Output

`dash-review/findings.md` beside the reviewed repo root (or `./dash-review/findings.md`). When called by a command (/dash:review, /dash:review-live), return the rows, the Do not build list and the Not checked lists to the command instead; the command writes the file.

One table:

| # | Severity | Rule | Where | Evidence | Recommendation | Exit |
|---|---|---|---|---|---|---|

- Severity: `blocker` (data loss, wrong commit, security, inaccessible core task), `major` (a high or medium rule clearly violated), `minor` (polish, or a low-confidence rule), `note`. A low-confidence rule alone is never above `minor`.
- Rule: one rule ID, or "no rule" plus the reason.
- Where: `path:line` for code and specs, the file name plus region for a screenshot.
- Evidence: the line of code or spec text, verbatim and short.
- Recommendation: the change, in one sentence, with the target control or pattern.
- Exit: exactly one of `fix now`, `file as task`, `reject with rationale`, `verify with a test`.

Then `## Do not build`: features and settings that add complexity without value, each with its reason and rule ID. Then `## Not checked`, with two lists: "Not checkable statically" (rule IDs, one-line reason each, for example "needs a failed request at runtime") and "Not applicable" (rule IDs grouped by reason, for example "no AI assistant ships: AI-001 to AI-011").

## Procedure

1. **Map the target.** For code, list routes, layouts, form components, nav config, toasts, dialogs and tokens with `references/grep-recipes.md` (Next.js/React/shadcn and SwiftUI recipes). For a spec, read `dash-spec/index.md` and its files. Note the stack, the save models in use and which product features exist (assistant, integrations, customer emails, home, settings).
2. **Load the rules.** Open `references/rules.md`. It lists every rule by area with its confidence, "Applies when", "Exceptions" and "Check (static)". Work area by area, in the order the file lists them. Do not skip an area.
3. **Decide each rule.** For every rule ID, pick one:
   - **Applies**: the "Applies when" text matches the target. Go to step 4.
   - **Not applicable**: the target lacks what the rule is about, for example no assistant (AI rules), no integrations (INT rules), nothing sent to end customers (BRD rules), no home page (HOM rules). Write the reason once per group.
   - **Not checkable statically**: the check needs runtime behaviour, real data, computed styles or a running layout, or the input type cannot show it (a screenshot cannot show an audit log write, SAV-008), or the code it needs is not in the target (a backend in another repo). Record it with the reason; live-rule-audit runs it later.
4. **Run the check.** Do exactly what the "Check (static)" line says. Use the grep recipes to find candidates, then open each file and read the code around the hit. Check the rule's "Exceptions" before calling a failure. Typical checks:
   - Switch inside a form with Save (CTL-002); boolean in a Save form not a checkbox (CTL-001).
   - Save bar tied to the dirty flag, Discard resets to server values, leave guard (SAV-001, SAV-004, SAV-005).
   - Destructive action apart, critical variant, confirmed (SAV-006, INT-012).
   - One toast region and one status region at the root (FDB-008); no dialog or modal opened from a success handler (FDB-001, FDB-007).
   - Empty, loading and not-found branches per list and async region (STA-001, STA-003, STA-006).
   - Nav order and labels from the nav config (NAV-001, NAV-002), settings link last (SET-005), admin routes under settings (SET-009).
   - Visible descriptions and disabled reasons (HLP-001, HLP-006); button verbs and sentence case (MCP-001, MCP-002).
   - Colour and spacing tokens only (VIS-009, LAY-006); one primary per view (VIS-002).
   For frameworks, walk the matching file in `references/frameworks/` (for example `references/frameworks/control-selection-matrix.md` for controls).
5. **Write a row per failure.** One row per rule per place. If one cause breaks the same rule in many places, write one row and list the places in Where. Set severity by impact, then cap low-confidence rules at `minor`. Choose the exit:
   - `fix now`: a clear, local change (swap a Switch for a Checkbox).
   - `file as task`: a structural change (move billing under settings).
   - `verify with a test`: static evidence is suggestive but behaviour decides it (a leave guard exists but may not fire).
   - `reject with rationale`: the rule's exception covers it; say which exception.
6. **Do not build.** While reading, collect complexity without value: a bell without a stored feed (CHR-009), row checkboxes with no bulk action (IDX-008), a column picker on a five-column table (IDX-005), a settings overview of cards (SET-006). Write each with its reason.
7. **Coverage.** Every rule ID in `references/rules.md` must appear in exactly one place: a findings row, a pass (not written), Not applicable or Not checkable. Count them: passes = total - findings rules - not applicable - not checkable. Write the counts in one line above the table.

## Rules applied

All rules in `references/rules.md` are in scope. The ones most often found by a static pass:

- CTL-001 — checkbox for a boolean saved with a form.
- CTL-002 — switch only for instant changes, never in a Save form.
- SAV-001 — sticky save bar that wakes on change.
- SAV-005 — warn before leaving with unsaved changes.
- SAV-006 — destructive actions apart, consequence stated, confirmed.
- NAV-001 — work areas first, account last.
- NAV-002 — noun labels in sentence case.
- SET-005 — fixed settings entry at the sidebar bottom.
- SET-009 — account administration lives in settings.
- HLP-001 — visible description for non-obvious settings.
- HLP-006 — explain disabled controls in place.
- STA-001 — empty state names the content and one action.
- STA-003 — loading placeholders in place.
- FDB-001 — one feedback channel per kind of event.
- FDB-008 — live regions mounted once at the root.
- IDX-011 — two empty templates: no data versus no matches.
- MCP-001 — buttons start with a verb and name the object.
- VIS-002 — one filled primary button per view.
- VIS-009 — colour tokens only, light and dark.
- LAY-006 — one 4 px spacing scale.

Full text: `references/rules.md`. Frameworks: `references/frameworks/`. Search patterns: `references/grep-recipes.md`.

## Example

Target: a Next.js shipping admin, `app/settings/notifications/page.tsx`.

Good row:

| # | Severity | Rule | Where | Evidence | Recommendation | Exit |
|---|---|---|---|---|---|---|
| 3 | major | CTL-002 | app/settings/notifications/page.tsx:42 | `<Switch id="tracking-email" />` inside `<form onSubmit={save}>` with `<Button type="submit">Save</Button>` at :88 | Replace the Switch with a Checkbox saved by the form, or move it to its own card that saves on toggle with a toast. | fix now |

Not checked: "Not checkable statically: SAV-008 (audit records are written by an API service that is not in this repo); VIS-003 (badge colours come from CSS variables set at runtime by the theme provider, so the contrast pairs need computed styles). Not applicable: AI-001 to AI-011 (no assistant ships)."

Bad: "Settings page feels cluttered, consider simplifying" (no rule ID, no line, no evidence, no exit). A row for SAV-005 saying "no leave guard" without having grepped for `beforeunload` or a router guard. Rating HOM-008 (low confidence) as `major`. Silently skipping the BRD area because the app "probably" sends no emails.

## Self-check

- [ ] Every area in `references/rules.md` was walked; every rule ID is a finding, a pass, Not applicable or Not checkable.
- [ ] Every finding cites one existing rule ID (or "no rule" plus reason), a `path:line` and verbatim evidence.
- [ ] Every finding has exactly one of the four exits.
- [ ] No low-confidence rule is above `minor`.
- [ ] Exceptions were read before each failure; covered cases are `reject with rationale` or omitted.
- [ ] Not checked lists rule IDs with reasons, so the reader knows the coverage.
- [ ] Do not build entries each have a reason.
