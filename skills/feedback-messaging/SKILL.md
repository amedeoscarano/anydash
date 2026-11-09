---
name: feedback-messaging
description: Picks the right feedback channel for every event an admin dashboard reports - toast, inline field error, banner, modal or in-place status text - and writes the message. Produces an event inventory (event, channel, message, action, rule IDs) covering success, validation, failed requests, background job failures, blocked states, destructive confirms and progress. Use when deciding how to tell users that something saved, failed, is running or is blocked, when a toast or modal "feels wrong", when designing imports, syncs or delete flows, or when /dash:build reaches the states step. Use it before adding any toast, alert, dialog or live region. Do not use it for help text that explains a control before any action (use help-text-policy), for empty, loading and not-found page states as layouts (use ui-states), or for button wording (use microcopy).
---

# Feedback messaging

Map each event to one feedback channel by what the event is, not by taste. Toast for the outcome of the user's own action. Inline error for an invalid field. Banner for an ongoing status or required action. Modal for a decision that must come first. Status text for progress and current state. Background failures persist on the object and in a log. Anything still true after the moment passes stays on the page.

## Input

- The objects, actions and background jobs: from `dash-spec/inventory.md`, a brief, or the repo (form handlers, mutations, jobs, webhooks).
- For each action: can it fail, is it destructive or irreversible, does it run in the background, can it be undone.
- Existing toasts, alerts and dialogs if reviewing.

## Output

An event inventory, one row per event:

| Event | Trigger | Channel | Message | Action | Rule IDs |
|---|---|---|---|---|---|

Channel is one of: `toast`, `field error`, `banner`, `modal`, `status text`, `in-place text` (persistent text at the affected place, step 3), `object error count + log`.
Plus a short "Shell" note: the live regions mounted at the app root.

When run from /dash:build, write it as the `## Feedback` section of `dash-spec/states.md`. When asked directly, answer inline.

## Procedure

1. Build the event inventory. For each object and job, list: success, field invalid, request failed, background failure, blocked state (plan, permission, missing setup), destructive confirm, in progress (FDB-001 check).
2. Assign one channel per event with FDB-001:
   - Outcome of the user's own action: **toast** ("Rule saved"). Instant controls confirm with a toast and revert on failure with Retry (SAV-002).
   - Invalid input: **field error** under the field (step 4).
   - Ongoing status or required action: **banner** with one message and one next-step button (HLP-007).
   - Decision before the action proceeds: **modal** (step 5).
   - Progress and current state: **status text** in place ("Importing 120 of 400").
3. Lasting conditions: if the next attempt would fail for the same reason (locked feature, missing role or plan, broken integration, required setup), put persistent text at the affected place. A toast may announce it once, never alone (FDB-002, STA-005).
4. Field errors: text directly under the field, field marked `aria-invalid`, error linked by `aria-describedby`. State length, format and range limits as helper text before typing. Cross-field errors go next to the group, plus a linked summary at the top of a long form (FDB-003).
5. Modals: only for destructive or irreversible actions, choices that change what happens next, or a short input needed to finish. State the consequence; name the primary button after the action ("Delete rules"), never OK or Yes. Never open a modal from a modal, never a modal for success, never a large form in a modal (FDB-007, SAV-006).
6. Background jobs (import, publish, webhook, scheduled task): on failure, show an error count on the affected object and write a log row with time, outcome and reason. If the failure blocks the whole integration, add a banner with the fix (FDB-004, INT-007).
7. Region load failures: replace the region with what failed plus Retry, keep the rest usable (STA-004, low confidence).
8. Shell: mount one named toast region and one empty `role=status` region (and `role=alert` if used) at the app root on load; announce async content through them (FDB-008).
9. Suggested (FDB-009 is low confidence): toasts with Undo, Retry or View stay at least 10 seconds, timer paused on hover and focus, region reachable by a shortcut named in its label, for example "Notifications alt+T". Undo itself has no rule: mark an Undo row "no rule yet (FDB-009 for timing)" unless the product already has undo, and never offer Undo after a confirm that says it can't be undone.
10. Write messages: object + past-tense outcome for success ("3 rules deleted"); for errors, what failed and what to do ("Enter a number from 1 to 30"). Use sentence case (MCP-002) and, as a suggestion, the glossary terms (MCP-007, low). Notification bell only if there is a real alert feed (CHR-009).

## Rules applied

- FDB-001 — One channel per kind of event.
- FDB-002 — Lasting conditions never live only in a toast.
- FDB-003 — Field errors under the field; limits stated up front.
- FDB-004 — Background failures persist on the object and in a log.
- FDB-007 — Modals only for decisions that must come first.
- FDB-008 — Live regions mounted before messages arrive.
- FDB-009 — Actionable toasts stay reachable, 10 s minimum (low).
- SAV-002 — Instant controls confirm with a toast, revert on failure.
- SAV-006 — Destructive actions state the consequence and confirm.
- HLP-007 — Banners only for status or required action.
- STA-004 — Failed region says so and offers Retry (low).
- STA-005 — Locked features show requirement and unlock path (medium).
- INT-007 — Sync failures surface outside the log (medium).
- CHR-009 — Toasts for action feedback; bell only for a real alert feed.
- MCP-002 — Sentence case.
- MCP-007 — One term per concept (low).

Low-confidence rules are suggestions: report them as such in reviews, not as errors. Full text of FDB rules: `references/rules.md`. CHR, HLP, INT, MCP, SAV and STA rules live in the sibling skills that own them (global-chrome, help-text-policy, integration-connect, microcopy, save-model, ui-states); the gists above are enough to apply them here.

## Example

Shipping admin, order import and rules.

Good:

| Event | Trigger | Channel | Message | Action | Rule IDs |
|---|---|---|---|---|---|
| Rule form saved | user clicks Save | toast | "Rule saved" | | FDB-001 |
| Weight field empty on Save | user clicks Save | field error | "Enter a weight in kg" under the field | | FDB-003 |
| "Days to import" = 45 | user clicks Save | field error | "Enter a number from 1 to 30" (helper "Between 1 and 30" shown before) | | FDB-003 |
| Delete 3 rules | user clicks "Delete" with 3 rows selected | modal | "Delete 3 shipping rules? This can't be undone." | "Delete rules", "Cancel" | FDB-007, SAV-006 |
| Rules deleted | user confirms the modal | toast | "3 rules deleted" | | FDB-001 |
| Order import running | user clicks "Import now" | status text | "Importing 120 of 400" | | FDB-001 |
| Scheduled import failed on 2 orders | scheduled job | object error count + log | Orders list "2 import errors"; log row "10:20, 0 imported, Error: order has no line items" | "View log" | FDB-004 |
| Store token expired | store API rejects the token | banner on integrations page | "Store connection expired. Orders are not importing." | "Reconnect store" | FDB-002, INT-007 |
| Label printing locked by plan | page opens on a plan without labels | in-place text | "Label printing needs the Pro plan." | "Upgrade plan" | FDB-002, STA-005 |

Bad:
- Modal "Settings saved successfully" with OK (FDB-007).
- Toast "Weight is required" after Save, field not marked (FDB-003).
- Toast "No access" when the page opens, controls look normal (FDB-002).
- Banner "Saving..." (FDB-001).
- Toast "Import failed" to whoever is online, no log row (FDB-004).
- A toast library that creates its live region when the first toast fires (FDB-008).

## Self-check

- [ ] Every event in the inventory maps to exactly one channel.
- [ ] No success handler opens a modal; no field validator emits a toast.
- [ ] Every blocked or locked state has persistent in-place text, not only a toast.
- [ ] Every field with a limit states it before typing; errors render under the field with `aria-invalid`.
- [ ] Every modal is a decision, names its primary button after the action, and opens no second modal.
- [ ] Every background job has a persisted failure record and an error count on the object.
- [ ] Toast and status live regions exist in the root layout before any message.
- [ ] Every cited ID is listed under Rules applied; FDB IDs also appear in `references/rules.md`.
