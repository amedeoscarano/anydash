---
name: control-selection
description: >-
  Picks the right input control for every field of an admin dashboard form or settings page: checkbox, switch, radio group, segmented control, select, searchable combobox, multi-select with tags, or number field with a unit. Decides the save model of the page first, then the value shape, then the option count, and outputs a table of field, control, save model and rule IDs. Use whenever building or reviewing a form, settings page, filter bar or create/edit dialog, when someone asks "switch or checkbox?", "radio or dropdown?", "how do I show the unit?", or when a page mixes switches with a Save button. Run it from /dash:build for the controls step. Do not use it to decide where a setting lives (use settings-architecture), to design the full commit flow, confirmations and toasts (use save-model), or for chart and data-visualisation styling.
---

# Control selection

Choose one control per field so that the control tells the user how the value behaves. A switch means "applies now". A checkbox means "applies on Save". A segmented control changes the view, never saved data. The choice follows a fixed order: save model, value shape, option count.

## Input

- A list of fields, a form, a settings page spec, a screenshot or a repo path.
- For each field, if known: what it stores, how many options, whether options come from user data, the unit, whether it applies at once or on Save.
- From a repo: read form components and schemas (zod, model types) to list fields and current controls.

## Output

Run from /dash:build: write the `## Controls` section of `dash-spec/controls.md` only, and add a `source` column after `field`: the repo file path, or "brief, assumed". Asked directly: answer inline. Format:

`field | value shape | options | control | save model | rule IDs`

- `control`: checkbox, checkbox group, switch, radio group, select, searchable combobox, multi-select combobox with tags, number field + unit suffix, number field + unit select, segmented control (view only).
- `save model`: a value from the save-model skill's list. Fields use page save bar, section Save, instant, action button or view state (not saved); save-model adds the values for actions and jobs.

Below the table list each existing control that must change, with old control, new control and rule ID. Mark rows that rest on a gap in the matrix as "no rule yet".

## Procedure

1. Decide the save model of each page or section first. Walk step 1 of `references/frameworks/control-selection-matrix.md`:
   - Several fields committed together: page save bar (SAV-001).
   - Unrelated sections: Save per section (SAV-003).
   - One independent on/off that is safe without review: instant (SAV-002).
   Never put an instant control (switch) inside a form with a Save button (CTL-002). For the full commit flow, apply the save-model skill. If it is not installed, use the `save-model` rules in `references/rules.md`.
2. For each field, find the value shape and pick the control from step 2 of the matrix:
   - One boolean, explicit save: checkbox (CTL-001).
   - One boolean, instant: switch (CTL-002). A risky instant toggle still confirms (CTL-002 exception).
   - Boolean that gates sub-options: keep them next to it, disabled or hidden while off (CTL-010).
   - Several of a visible set: checkbox group, never switches or radios (CTL-003).
   - Several of a long or open set: multi-select combobox with removable tags (CTL-006).
   - Exactly one of about 2 to 6 that need comparing: radio group, question title, one-line outcome per option, recommended option marked (CTL-004).
   - Exactly one of about 4 to 20 self-explanatory values: select (CTL-005).
   - More than about 20, from user data, or creatable: searchable combobox (CTL-006).
   - Number with a unit: number field, unit as fixed prefix or suffix, min, max and step (CTL-007).
   - Few preset amounts (retention, cache time): select with the unit in each option (CTL-007 exception).
   - User picks the unit: number field plus unit select (CTL-007 exception).
   - How the page shows data (time range, grid or list): segmented control, not saved (CTL-008).
3. Apply the tie-breaks in step 3 of the matrix. Two or three plain values in tight space may be a select (CTL-004 exception). A list that grows with user data is a combobox from the start (CTL-006).
4. A segmented control for a saved setting is never allowed. Replace it with radios or a select (CTL-008).
5. Add a visible one-line description when the effect is not obvious from the label (HLP-001). Explain a disabled control in place: why, and what unlocks it (HLP-006). Suggested, not required: give each control a unique accessible name from its visible label and link its description (CTL-009; low confidence).
6. Fill the output table. Cite every rule used per row. Write "no rule yet" for gaps the matrix marks, for example an instant select or an instant radio group.

## Rules applied

- CTL-001 — checkbox for a boolean saved with a form.
- CTL-002 — switch only for instant changes; never in a Save form.
- CTL-003 — checkbox group for multi-select.
- CTL-004 — radios for 2 to 6 options that need comparing.
- CTL-005 — select for a standard closed list.
- CTL-006 — searchable combobox for long, dynamic or creatable lists.
- CTL-007 — unit outside the value, min, max, step enforced.
- CTL-008 — segmented control for views, never for saved settings.
- CTL-009 — every control has its own accessible name (low).
- CTL-010 — on/off gates its dependent options.
- SAV-001 — sticky save bar for multi-field forms.
- SAV-002 — instant controls apply at once and confirm with a toast.
- SAV-003 — save per independent section.
- SAV-006 — destructive actions stand apart and confirm.
- HLP-001 — visible description for non-obvious settings.
- HLP-006 — explain disabled controls in place.

Full text of the CTL and SAV rules: `references/rules.md`. HLP rules live in the rule-library skill. Implementation notes: `references/react.md` (shadcn/ui), `references/swiftui.md`.

## Example

Shipping settings page "Labels and packages": one form with a page save bar, plus a separate "Test mode" card that applies at once. The last row is on the Shipments overview page.

Good:

| field | value shape | options | control | save model | rule IDs |
|---|---|---|---|---|---|
| Automatically archive fulfilled orders | boolean | 2 | checkbox + one-line description | page save bar | CTL-001, SAV-001 |
| Send tracking email at | several of a set | Shipped, Out for delivery, Delivered | checkbox group | page save bar | CTL-003 |
| How should packages be chosen? | one of, needs comparing | Single package by weight, Best fit by dimensions | radio group, "Best fit" marked Recommended | page save bar | CTL-004 |
| Label format | one of, standard | PDF A4, PDF 4x6, ZPL 4x6, PNG | select | page save bar | CTL-005 |
| Default origin warehouse | one of, user data | 34 locations | searchable combobox | page save bar | CTL-006 |
| Default package weight | number + unit | - | number field, suffix "kg", min 0, step 0.01 | page save bar | CTL-007 |
| Test mode (separate card, no Save) | boolean | 2 | switch, toast on change | instant | CTL-002, SAV-002 |
| Shipments overview chart range | view | 24 h, 7 d, 30 d | segmented control | view state | CTL-008 |

Bad: two switches "Archive orders" and "Insurance" above a Save button (CTL-002). Default currency as a segmented control "EUR | USD | GBP" (CTL-008). A text field holding "0.5 kg" (CTL-007). A plain dropdown of 300 product types with no filter (CTL-006). A dropdown hiding three packing strategies whose differences live only in the docs (CTL-004). "Ports" options still editable while "Inspect traffic" is off (CTL-010).

## Self-check

- [ ] Each page or section has one save model, decided before any control (SAV-001, SAV-002, SAV-003).
- [ ] No switch sits in a form with a Save button; every switch applies at once (CTL-002).
- [ ] No segmented control stores a setting (CTL-008).
- [ ] Every numeric field with a unit shows the unit outside the value and has min, max, step (CTL-007).
- [ ] Lists that grow with user data or pass about 20 options are searchable (CTL-006).
- [ ] Every control whose effect is not obvious has a visible description; disabled controls say why (HLP-001, HLP-006). Accessible names checked where possible (CTL-009, low: a suggestion).
- [ ] Gaps are marked "no rule yet", not filled with an invented rule.
