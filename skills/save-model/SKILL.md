---
name: save-model
description: >-
  Decides how each change in an admin dashboard is committed and confirmed: instant apply with a toast, a sticky save bar with Discard and a leave guard, Save per section, an action button that runs at once, a destructive action with a confirm dialog, a long background job with a status line, an undo offer, or a change proposed by an AI assistant that waits for approval. Also picks the feedback channel for each outcome (toast, inline error, banner, modal, status text) and the audit-log entry. Outputs a table of change, save model, confirmation, feedback and rule IDs. Use when building or reviewing any form, settings page, bulk action, delete flow, import or sync, or assistant write action, and whenever someone asks "does this need a Save button?", "should this confirm?", or "what happens if it fails?". Run it from /dash:build after control-selection. Do not use it to pick the input control of a field (use control-selection) or to place settings in the navigation (use settings-architecture).
---

# Save model

Decide, for every change a user or the assistant can make, how it is committed, how it is confirmed, and how the outcome is reported. One page section uses one model. The control already promises a model (switch = now, checkbox = on Save); this skill makes the commit flow keep that promise, including failure, leave and undo.

## Input

- A page spec, a list of forms and actions, the controls table from control-selection, or a repo path.
- For each change, if known: which fields go together, whether it can be reversed, how long it runs, who else can change the same data.
- From a repo: read form submit handlers, server actions or API routes, delete and bulk endpoints, job queues.

## Output

Run from /dash:build: write the `## Save model` section of `dash-spec/controls.md` only. Its success and failure columns are the input from which feedback-messaging builds the `## Feedback` section of `dash-spec/states.md` in build step 6; do not write `states.md` here. Asked directly: answer inline. Format:

`change | save model | confirmation | success feedback | failure feedback | logged | rule IDs`

- `save model`: instant, page save bar, section Save, action button, destructive confirm, background job, AI proposal, read-only, view state (not saved). control-selection uses the same words for its `save model` column.
- `logged`: yes with old and new value, or no with the reason.

Mark undo rows "no rule yet" unless the product already has an undo pattern.

## Procedure

1. Group the fields and actions of each page into sections. Fields that only make sense together form one unit. Unrelated cards are separate units (SAV-003).
2. Pick one model per unit, walking step 1 of `references/frameworks/control-selection-matrix.md`:
   - Several fields committed together: sticky save bar with Save and Discard, disabled or hidden until the form is dirty (SAV-001, SAV-004).
   - Unrelated sections or a single field such as a name: Save per section, or a summary row that opens its own editor (SAV-003). Large forms go to a subpage, never a modal (FDB-007).
   - One independent on/off, safe without review: instant. Persist on toggle, toast on success, revert plus error with Retry on failure (SAV-002). No Save nearby (CTL-002).
   - Run-now, import, refresh, test: an action button that commits at once, with no Discard (SAV-004 exception).
   - Read-only tab (logs, history): suggested, no save controls at all (SAV-007; low confidence).
3. Guard explicit saves. Block navigation away from a dirty form and ask "Leave page with unsaved changes?" with "Leave page" and "Stay". Never prompt on a clean form or an instant page (SAV-005).
4. Destructive or disruptive actions (delete, disconnect, purge, cancel plan, bulk removal): a separate button away from Save, a line stating the consequence, and a dialog whose primary button names the action, e.g. "Delete 3 rules" (SAV-006, FDB-007). A risky instant toggle confirms too (CTL-002 exception). Removing an unsaved row inside a form is part of Discard and needs no dialog.
5. Long jobs. Suggested (SAV-009; low confidence): if a commit takes more than a few seconds, show a status line saying it runs in the background, that the user can leave, and where to see progress, instead of a blocking spinner. Required: if a background job fails later, record the error on the affected object with a count and as a log row (FDB-004).
6. Assistant changes. Stage any create, update or delete the assistant proposes in the normal form (the save bar wakes) or in an Approve / Decline card that shows what will change. Apply only on approval (SAV-011, AI-004).
7. Undo. No rule backs a general undo pattern: the matrix marks it "no rule yet" and no reference portal showed it. If you offer Undo in a toast, keep it reachable by keyboard and visible for at least 10 seconds, paused on hover and focus (FDB-009; low). The audit log is the observed substitute (SAV-008).
8. Feedback channel per outcome (FDB-001):
   - Outcome of the user's own action: toast ("Rule saved").
   - Invalid field: text under the field, field marked invalid, limits stated before typing (FDB-003).
   - Condition that persists (no permission, plan missing, integration broken): persistent text where it applies, never only a toast (FDB-002).
   - Decision needed first: modal; never a modal for "Saved", never a modal from a modal (FDB-007).
   - Progress and current state: status text.
   Mount toast and live regions once at the app root (FDB-008).
9. Log every shared setting change with time, actor, action, old and new value (SAV-008). Personal preferences may be left out.
10. Fill the output table. Cite the rule IDs per row.

## Rules applied

- SAV-001 — sticky save bar that wakes on change.
- SAV-002 — instant controls apply at once, toast, revert on failure.
- SAV-003 — save per section when sections are independent.
- SAV-004 — Discard restores the last saved state.
- SAV-005 — warn before leaving with unsaved changes.
- SAV-006 — destructive actions stand apart, state the consequence, confirm.
- SAV-007 — read-only views carry no save controls (low).
- SAV-008 — activity log with actor, old and new value.
- SAV-009 — long jobs run in the background and say so (low).
- SAV-011 — assistant changes go through the normal save path.
- FDB-001 — one feedback channel per kind of event.
- FDB-002 — lasting conditions never only in a toast.
- FDB-003 — field errors under the field.
- FDB-004 — background failures on the object and in a log.
- FDB-007 — modals only for decisions that must come first.
- FDB-008 — live regions mounted before messages arrive.
- FDB-009 — toasts with actions stay reachable (low).
- CTL-002 — switch only for instant changes.
- AI-004 — the assistant never applies a change without approval.

Full text of the SAV and FDB rules: `references/rules.md`. CTL and AI rules live in the rule-library skill. Implementation notes: `references/react.md` (shadcn/ui), `references/swiftui.md`.

## Example

Infra admin, page Settings > Integrations > Warehouse sync.

Good:

| change | save model | confirmation | success feedback | failure feedback | logged | rule IDs |
|---|---|---|---|---|---|---|
| Endpoint URL, sync interval, mapping (one card) | page save bar | leave guard when dirty | toast "Sync settings saved" | error under each invalid field | yes, old and new | SAV-001, SAV-004, SAV-005, FDB-003, SAV-008 |
| "Pause sync" switch (own card) | instant | none | toast "Sync paused" | switch reverts, error toast with Retry | yes | SAV-002, CTL-002 |
| Import now | action button | none | status "Importing 120 of 400. You can leave this page." | error on the integration with count, log row | yes | SAV-009, FDB-004 |
| Disconnect | destructive confirm | dialog "Disconnect warehouse? Stock will stop updating." with "Disconnect" and "Cancel" | toast "Warehouse disconnected" | error toast with Retry | yes | SAV-006, FDB-007 |
| Assistant: "set interval to 15 min" | AI proposal | interval field filled, save bar wakes | as page save bar | as page save bar | yes, actor "assistant, approved by <user>" | SAV-011, AI-004 |
| Logs tab | read-only | - | - | - | - | SAV-007 |
| Token expired | - | - | - | banner on the card with "Reconnect", on every visit | - | FDB-002 |

Bad: a Save bar under two switches (CTL-002). A red "Disconnect" next to Save in the same bar, confirmed by "Are you sure?" and "OK" (SAV-006). A modal "Settings saved" with an OK button (FDB-007). A toast "Invalid input" with no field marked (FDB-003). A modal spinner that blocks the page during a 3-minute import (SAV-009). The assistant writes the interval and replies "Done" (SAV-011). A log row "Settings updated" with no field or actor (SAV-008).

## Self-check

- [ ] Every section has exactly one save model; no switch under a Save (SAV-001, SAV-002, CTL-002).
- [ ] Every explicit Save has a Discard and a leave guard; clean forms never prompt (SAV-004, SAV-005).
- [ ] Every destructive action is apart from Save, states its consequence and confirms with a named button (SAV-006).
- [ ] Every instant change has a success toast and a revert-plus-Retry failure path (SAV-002).
- [ ] Background job failures land on the object with a count and in a log (FDB-004). Long jobs show a background status line where possible (SAV-009, low: a suggestion).
- [ ] No assistant write applies without approval (SAV-011, AI-004).
- [ ] Each outcome uses the channel FDB-001 assigns; lasting conditions are persistent (FDB-002).
- [ ] Undo rows say "no rule yet" unless the product already has undo.
