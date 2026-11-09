---
name: help-text-policy
description: Decides, field by field, whether an admin dashboard control gets a visible description, an info tooltip, a docs link, a banner or no help at all, and writes the help text itself. Produces a help plan (control, help form, text, rule IDs) for settings pages, object forms, tables and KPI cards. Use when designing or reviewing any settings page, form or data view, when someone asks "should this have a tooltip?", "what description goes under this switch?", "where do I explain this?", when a disabled control needs a reason, or when /dash:build reaches the help step. Use it before writing any helpText, description or tooltip prop. Do not use it for feedback after an action (toasts, field errors, confirm dialogs; use feedback-messaging), for button and label wording (use microcopy), or for marketing pages and long-form documentation.
---

# Help text policy

Decide which form each piece of explanation takes in an admin UI, then write it. One piece of help gets one primary form. Visible text carries anything a user needs to act correctly; tooltips only define terms; procedures go to steps or docs; obvious fields get nothing. The tree in `references/frameworks/help-text-tree.md` routes each case to the rule that governs it.

## Input

- A list of controls and data labels: from a spec (`dash-spec/controls.md`), a component tree, a screenshot, or a brief.
- For each control, if known: its label, what it changes, side effects, disabled states and why, format or length limits, and whether docs exist for the feature.
- The product audience (expert operators or non-expert users), if stated.

## Output

A Markdown table, one row per control or label:

| Page | Control / label | Help form | Text | Rule IDs |
|---|---|---|---|---|

Help form is one of: `visible description`, `visible warning`, `disabled reason`, `tooltip`, `steps / disclosure`, `docs link`, `banner`, `none`.
Plus one line per page naming its page-level docs link and its slot.

When run from /dash:build, write the table as the `## Help text` section of `dash-spec/controls.md`. When asked directly, answer inline.

## Procedure

1. List every control and label on the page: checkboxes, switches, radio groups, selects, number and text fields, destructive buttons, table column headers, KPI tiles (HLP-001 check). Skip feedback messages; route them with FDB-001.
2. Walk `references/frameworks/help-text-tree.md` for each item, top to bottom. Stop at the first "yes".
3. Status or required action (integration failing, security setup missing, plan limit hit): a banner with one message and one next-step button, dismissible unless required (HLP-007). Never a banner for a feature explanation.
4. Side effect, risk or irreversibility: write the consequence as visible text next to the control or action (HLP-002, SAV-006). A tooltip may repeat it, never hold it alone.
5. Disabled or locked control: write the reason and the unlock path in the same field group (HLP-006, STA-005). A Save disabled while pristine or saving needs nothing.
6. Procedure (more than two sentences, more than one step, formats, examples): numbered steps beside the form or a collapsed how-to for short ones; a docs link for long or shared ones (HLP-004).
7. Effect not obvious from the label: one visible line under the label (HLP-001). On wide settings pages, section descriptions go in the left annotation column (LAY-003).
8. Definition of a metric, column header or technical term in a dense view: info-icon tooltip or popover, under about 40 words, focusable trigger, no errors or requirements inside (HLP-003).
9. Format, length, unit or audience constraint ("shown to customers", "max 70 characters"): a short visible description (HLP-008 exception). Units go in a fixed prefix, suffix or the label, never inside the value; ranges are never only a placeholder (CTL-007).
10. Self-explanatory field (name, title, email, quantity): no help (HLP-008, low confidence: a suggestion; a non-expert product may describe every control).
11. Write the text. One sentence, starting with what the setting does or what happens. No "Enter the ...", no restating the label (HLP-008). Sentence case (MCP-002); suggested: one term per concept (MCP-007, low).
12. Place each description directly under its label in the same field group and wire it with `aria-describedby` (HLP-009; CTL-009, low).
13. Per index and settings page with a docs topic: one docs link in one fixed slot, the same on every page (HLP-005). Suggested link text names the topic: "Learn more about rate rules" (HLP-010, low). Control-level links only where the control has its own procedure or risk.

## Rules applied

- HLP-001 — One-line visible description under non-obvious settings.
- HLP-002 — Consequences in visible text, never tooltip-only.
- HLP-003 — Tooltips only for short definitions in dense views.
- HLP-004 — Procedures go to steps, disclosures or docs links.
- HLP-005 — One page-level docs link in a fixed slot (medium).
- HLP-006 — Disabled controls say why and what unlocks them (medium).
- HLP-007 — Banners only for status or required action.
- HLP-008 — No help on self-explanatory fields (low).
- HLP-009 — Help next to its control and announced.
- HLP-010 — Docs links name their topic (low).
- STA-005 — Locked features stay visible with requirement and unlock path (medium).
- SAV-006 — Destructive actions state the consequence.
- CTL-001 — Checkbox for a boolean in a Save form.
- CTL-007 — Units outside the value.
- CTL-010 — An on/off gates its dependent options.
- CTL-009 — Each control has its own accessible name and linked description (low).
- LAY-003 — Section descriptions in the left annotation column on wide pages (medium).
- MCP-002 — Sentence case.
- MCP-007 — One term per concept (low).
- FDB-001 — Feedback after an action is not help text.

Low-confidence rules are suggestions: report them as such in reviews, not as errors. Full text of help-text and microcopy rules: `references/rules.md`. CTL, FDB, LAY, SAV and STA rules live in the sibling skills that own them (control-selection, feedback-messaging, settings-architecture, save-model, ui-states); the gists above are enough to apply them here.

## Example

Shipping settings page, "Packing slips" section: one form with a page save bar, so its on/off options are checkboxes (CTL-001).

Good:

| Control / label | Help form | Text | Rule IDs |
|---|---|---|---|
| Checkbox "Print packing slip automatically" | visible description | "Prints a slip for each order as soon as its label is created." | HLP-001, HLP-009 |
| Checkbox "Show multiple orders per page" (disabled, under the first) | disabled reason | "Select "Print packing slip automatically" to enable this option." | HLP-006, CTL-010 |
| Button "Reset slip template" | visible warning | "Replaces your custom template with the default. This can't be undone." | HLP-002, SAV-006 |
| Text field "Return address name" | visible description | "Shown to customers on every slip. Max 40 characters." | HLP-008 |
| Text field "Template name" | none | | HLP-008 |
| Column header "Avg. pick time" | tooltip | "Median minutes from order import to label printed, last 30 days." | HLP-003 |
| Page footer | docs link | "Learn more about packing slips" | HLP-005, HLP-010 |

Bad:
- Checkbox "Print packing slip automatically" with its meaning only behind an info icon (HLP-001).
- "Reset slip template" warning in a hover tooltip (HLP-002).
- "Template name" with the description "Enter the template name." (HLP-008).
- A permanent blue banner "Use this page to configure packing slips." (HLP-007).
- A 6-step printer setup paragraph under one checkbox (HLP-004).
- "Learn more" links repeated in every card (HLP-005, HLP-010).

## Self-check

- [ ] Every non-obvious control has a visible one-line description (obvious fields without help is a low-confidence suggestion, HLP-008).
- [ ] No warning, requirement, error or disabled reason lives only in a tooltip.
- [ ] Every tooltip is a definition under about 40 words with a focusable trigger.
- [ ] No help block is longer than two sentences unless it is steps, a disclosure or a link.
- [ ] Every disabled control (except pristine Save) shows its reason and unlock path.
- [ ] Each page has at most one page-level docs link, in the same slot (topic in the link text is a suggestion, HLP-010).
- [ ] Every description is wired to its control with `aria-describedby`.
- [ ] Every cited ID is listed under Rules applied; HLP and MCP IDs also appear in `references/rules.md`.
