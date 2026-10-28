---
name: states
description: Generates and checks the non-happy states of every page in an admin dashboard - first-run empty, filtered no-match, loading, error, locked by plan or setting, permission denied and not found - plus the feedback channel for each event. On a spec or code that lacks them, it writes the state matrix in dash-spec/states.md and the matching code branches; on code or a spec that has them, it returns a findings table (page | state | status | rule IDs | fix). Use when asked to add, audit or fix empty states, skeletons, spinners, error boundaries, 404 pages, upgrade or locked states, or toast and banner usage across a dashboard. Do not use it for one page's happy-path layout (use the page skills), for the first-run setup flow (use /dash:onboard), or for colours of state blocks (use visual-tokens).
disable-model-invocation: true
argument-hint: "[path]"
---

# States

Make sure no page in the dashboard can show a blank area, a provisional zero or a dead click. The command walks every page and every independent region, decides or checks each state, and assigns one feedback channel to each event. It orchestrates the ui-states and feedback-messaging skills and adds a first-run pass per page.

## Input

- `[path]`: a spec folder (`dash-spec/`), a repo, or a single page file. No path means the current repo.
- From a spec: `dash-spec/pages.md` (page list and region keys), `dash-spec/inventory.md` (roles, plans, gated features), `dash-spec/onboarding.md` (feature templates).
- From code: every data-fetching component, every list, the router catch-all, every plan, entitlement and role check, every toast call.

## Output

Two modes, picked in step 1:

- **Generate** (states are missing): write `dash-spec/states.md` with one table per page, `Region | Container | Empty | No match | Loading | Error | Locked / denied | Rule IDs`, then a `## Feedback` section with the event inventory from feedback-messaging. On code, also add the missing branches.
- **Check** (states exist): return a findings table, one row per region and state.

`Page | State | Status | Rule IDs | Fix`

Status is `pass`, `fail`, `missing` or `n/a (reason)`. Sort rows by status: `missing`, then `fail`, then `pass`, then `n/a`. End with counts per status and the list of regions that had no branch at all.

## Procedure

Siblings: apply the ui-states skill and the feedback-messaging skill (`/dash:<name>` in Claude Code, `dash-<name>` elsewhere). If either is not installed, apply the STA and FDB rules in `references/rules.md` directly; the other IDs below are summarised in this file.

1. **Pick the mode.** Generate when no states section or no state branches exist. Check when they do. A repo with some branches gets Check, and every missing branch becomes a `missing` row with a fix. An explicit request for a mode wins. In Generate on a repo with some branches, record each existing branch as `present` and do not rewrite it.
2. **List regions.** Split each page into regions with the keys of `references/frameworks/page-templates.md` (home 1-5, index 1-5, detail 1-9). Every region that fetches its own data gets its own row.
3. **Empty.** One heading naming the content, one sentence, one primary create action, at most one link; row controls disabled, not removed (STA-001). Full block for a page, two lines for a nested region, except a primary work list (STA-002). Feature pages onboard with templates (ONB-007).
4. **No match.** Every filterable list says nothing matches and offers "Clear filters", never the first-run copy (IDX-011). Paginated lists: a page number past the last page (`total > 0`, zero rows) shows "This page has no results" and "Go to first page", never an empty table or a range such as "51-20 of 20" (IDX-007, IDX-011).
5. **Loading.** Placeholder in the exact slot, region marked `aria-busy="true"` or `role="status"`, numbers null until loaded, never 0 (STA-003). Home tiles load and retry alone (HOM-010, low). Live regions mounted once at the app root (FDB-008).
6. **Error.** The failed region says what could not be loaded and offers Retry for that region only; the rest stays usable (STA-004, low, suggestion). Session expired or service down: one page banner instead (STA-004 exceptions). Form submit failures stay as field errors (FDB-003).
7. **Locked.** Plan, entitlement or setting gates: visible, disabled, requirement in text, unlock action beside it; a locked tab keeps its nav entry (STA-005). The condition stays in place, not only in a toast (FDB-002).
8. **Permission denied.** STA-005 excludes roles. For a control denied by role, the control rules apply: say what permission is missing and what unlocks it next to the control (HLP-006), keep the reason in place (FDB-002), keep it faded but visible (VIS-006); an action no role path can ever reach may be omitted (VIS-006 exceptions). For a whole page or region denied by role, no rule exists: mark the row "no rule yet" and show the requirement in place of the content.
9. **Not found.** Catch-all route and unknown or out-of-scope ids render inside the shell with a way forward (STA-006).
10. **First run.** For each page, state what a brand-new account sees. Fail any page that shows a bare table, a blank area or "Showing 0-0 of 0" (STA-001).
11. **Feedback.** Run feedback-messaging: one channel per event (FDB-001), field errors under the field (FDB-003), background failures on the object and in a log (FDB-004), modals only for decisions (FDB-007), toasts with actions stay at least 10 seconds (FDB-009, low).
12. **Code checks** (Check mode, or after Generate). Search for these signals:
    - Next.js: missing `loading.tsx`, `error.tsx` or `not-found.tsx` per segment; `?? 0` or `|| 0` on fetched counts; lists that map rows with no zero-length branch; `{canEdit && <Button` hiding a gated action; `toast(` as the only report of a plan or permission block; no `<Toaster` in the root layout; range text computed from `page` with no clamp to the page count.
    - SwiftUI: lists without `ContentUnavailableView` or an `.overlay` for zero items; `.task` without a caught error state; counts defaulting to 0.
13. **Write the result.** Generate: `dash-spec/states.md` plus code branches. Check: the findings table. Label STA-004, HOM-010 and FDB-009 findings as suggestions: start the Fix cell with "Suggestion:" and keep Status to `pass`, `fail`, `missing` or `n/a (reason)`.

## Rules applied

- STA-001 — empty state names the content, one create action; row controls disabled.
- STA-002 — empty state sized to its container.
- STA-003 — loading placeholder in place, announced, no provisional zero.
- STA-004 — failed region says so and offers Retry (low).
- STA-005 — locked features visible with the requirement and unlock action.
- STA-006 — not-found inside the shell with a way forward.
- IDX-011 — no-match state distinct from the empty list.
- ONB-007 — feature empty states onboard with templates.
- HOM-010 — home blocks load and retry independently (low).
- HLP-006 — explain disabled and locked controls in place.
- VIS-006 — disabled looks faded but stays in place.
- FDB-001 — one channel per kind of event.
- FDB-002 — lasting conditions never only in a toast.
- FDB-003 — field errors under the field.
- FDB-004 — background failures on the object and in a log.
- FDB-007 — modals only for decisions that must come first.
- FDB-008 — live regions mounted at the app root.
- FDB-009 — toasts with actions stay reachable (low).

Full text: `references/rules.md` (STA and FDB areas). Framework: `references/frameworks/page-templates.md`.

## Example

Good (Check mode on an infra admin, Next.js):

| Page | State | Status | Rule IDs | Fix |
|---|---|---|---|---|
| API tokens | Empty | missing | STA-001, ONB-007 | Add zero branch: "Create your first API token", one line, "Create token", "Learn more about API tokens" |
| `/domains/[id]` | Not found | missing | STA-006 | Add `not-found.tsx` in the admin layout with "Back to domains" |
| Domains | Loading | fail | STA-003 | Tab counts use `count ?? 0`; keep null and render "…" with `aria-busy` |
| Firewall rules | Locked | fail | STA-005, FDB-002 | "Add rule" hidden on Free; show it disabled with "Needs the Pro plan" and "Upgrade plan" |
| Members | Denied | fail | HLP-006, VIS-006 | Show "Only owners can invite members" next to the disabled "Invite member" |
| Domains | No match | pass | IDX-011 | — |

Totals: 2 missing, 3 fail, 1 pass.

Bad: the command reports "states look fine" after reading one page. It counts a spinner over the whole admin as a loading state (breaks STA-003). It accepts a "No access" toast after clicking a hidden-for-Free action (breaks STA-005, FDB-002). It reuses "Create your first rule" when a filter returns nothing (breaks IDX-011).

## Self-check

- Every page and every fetching region has a row for each state it can reach.
- Every `missing` or `fail` row has a concrete fix with the exact copy or code change.
- Role-denied controls cite HLP-006 and VIS-006; only a whole page or region denied by role says "no rule yet".
- No count or KPI defaults to 0 before load in the generated code.
- The catch-all route renders inside the shell.
- Low-confidence findings (STA-004, HOM-010, FDB-009) are labelled as suggestions.
- In Generate mode, `dash-spec/states.md` has both the state tables and the `## Feedback` section.
- Every unlock or recovery action points to an existing route. If none exists, the action stays and the route is listed under Open items, not pointed at another page.
