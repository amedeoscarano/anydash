---
name: ui-states
description: Specifies the non-happy states of every page and region in an admin dashboard - first-run empty, filtered no-match, loading, failed to load, locked by plan or setting, permission denied and not found - and produces a state matrix per page (dash-spec/states.md) or an inline answer. Use when designing, building or reviewing what a list, table, card, tab, KPI tile or detail page shows before data arrives, when it has no items, when a request fails, when the user's plan or role cannot use it, or when the URL is wrong. Use it whenever a component fetches data or a page can be empty, and before writing skeletons, spinners, empty-state copy or error boundaries. Do not use it for success and error messages after a user action such as save toasts and field validation (use feedback-messaging), for the first-run setup flow itself (use onboarding-setup), or for colour and spacing of the state blocks (use visual-tokens).
---

# UI states

Give every page and every independent region a defined branch for each state it can reach, so users can always tell "nothing here yet", "nothing matches", "still loading", "failed", "not for you" and "does not exist" apart. A blank area is never an acceptable state.

## Input

- The page list from the spec (`dash-spec/pages.md`) or a repo path. From a repo, find every data-fetching component, every list, the router catch-all and every plan, entitlement or role check.
- The inventory: objects, roles, plans, and which features are gated.
- Onboarding decisions from the onboarding-setup skill, when present (feature templates for empty states).

## Output

From /dash:build: write `dash-spec/states.md` with one table per page.

`Region | Container (page or nested) | Empty | No match | Loading | Error | Locked / denied | Rule IDs`

Each cell holds the exact copy and the one action, or "n/a" with a reason. Below the tables, add one row for the app-wide not-found page and one for the app-wide blocking failure (session expired, service down).

Asked directly: answer inline with the same table for the pages in question.

## Procedure

1. Split each page into independent regions: the main list, each tab panel, each card, each KPI tile, each side panel. Every region that fetches its own data gets its own row. Use the region keys of `references/frameworks/page-templates.md` (home 1-5, index 1-5, detail 1-9).
2. Empty (nothing created yet). Write a heading naming what will appear, one sentence on what it is for, and exactly one primary create action, plus at most one "Learn more" link. Keep row controls (sort, view tabs, bulk actions) disabled, not removed (STA-001). For a feature page, add the templates from onboarding (ONB-007).
3. Size the empty state to its container. A whole empty page gets the full block. A nested table, tab panel or card gets at most two lines, no illustration and at most one inline action. A primary work list stays full even inside tabs (STA-002).
4. No match (search or filter returned nothing). Say nothing matches and offer "Clear filters". Never reuse the first-run copy (IDX-011).
5. Loading. Put a placeholder in the exact slot of the content: "…" for counters, skeleton rows of the final height for tables, "Loading..." for metric links. Mark the region `role="status"` or `aria-busy="true"`. Keep numbers null until they arrive, never a provisional 0 (STA-003). Suggestion: home tiles load and retry one by one (HOM-010, low). A route change may use one thin top bar; Save and Delete show progress on their own button (STA-003 exceptions). Mount live regions once at the app root (FDB-008).
6. Error. Replace only the failed region with "<Content> could not be loaded." and a Retry that refetches that region alone. Wrap each region in its own error boundary. The rest of the page stays usable (STA-004, low). Use one page-level banner instead when all work is blocked (session expired, service down) (STA-004 exceptions, HLP-007). Form submit failures go to feedback-messaging, not here.
7. Locked by plan, entitlement or another setting. Keep the control or tab visible and disabled, name the requirement in visible text, and put the unlock action next to it ("Upgrade plan", or a link to the blocking setting). A whole locked tab keeps its nav entry and replaces its content with the requirement and the action (STA-005). Never let a gated action fail only after the click. The condition stays in place, not only in a toast (FDB-002).
8. Permission denied by role. STA-005 excludes roles. For a control denied by role, the control rules apply: explain next to the disabled control what permission is missing and who grants it (HLP-006), keep that text in place (FDB-002), keep it faded but in position (VIS-006). Omit an action only when no role or plan path can ever lead to it (VIS-006 exceptions). For a whole page or region denied by role, no rule exists: show the requirement in place of the content and mark the row "no rule yet" in the decision log. A whole area the role can never be granted is hidden from its menu at the IA step (build step 2), so it needs no denied state.
9. Not found. A catch-all route and a missing or out-of-scope object id render inside the normal shell with a heading "There's no page at this address" and a way forward: search, the area overview or the parent list. A stale link to a deleted object may say it was deleted and link to its list (STA-006).
10. First-run per page. For each page, write what a brand-new account sees: usually the empty state of step 2, or the locked state of step 7. Check that no first-run page renders a bare table, a blank area or "Showing 0-0 of 0".
11. Fill every cell. A cell is "n/a" only with a reason (for example "static page, no fetch").

## Rules applied

- STA-001 — empty state names the content and offers one create action; row controls disabled, not removed (high).
- STA-002 — full block for an empty page, two-line message for a nested region (medium).
- STA-003 — loading placeholder in place, announced as status, no provisional zero (high).
- STA-004 — failed region says what failed and offers Retry; rest of page usable (low).
- STA-005 — locked features visible, requirement in text, unlock action beside it (medium).
- STA-006 — not-found page inside the shell with a way forward (medium).
- IDX-011 — no-match state distinct from the empty list (high).
- ONB-007 — feature empty states onboard with templates (high).
- HOM-010 — home blocks load and retry independently (low).
- HLP-006 — explain disabled and locked controls in place (medium).
- HLP-007 — banners only for status or required action (high).
- FDB-002 — lasting conditions stay in place, not only in a toast (high).
- FDB-008 — live regions mounted at the app root (high).
- VIS-006 — disabled looks faded but stays in place (high).

Full text of STA rules: `references/rules.md`. IDX, ONB, HOM, HLP, FDB and VIS rules live in the rule-library skill. Framework: `references/frameworks/page-templates.md`.

## Example

Good (shipping admin, Shipments index):

| Region | Container | Empty | No match | Loading | Error | Locked / denied |
|---|---|---|---|---|---|---|
| Shipments table | page | "Create your first shipment", one line, "Create shipment" (STA-001) | "No shipments match these filters", "Clear filters" (IDX-011) | 10 skeleton rows, tab counts "…", `aria-busy` (STA-003) | "Shipments could not be loaded." + Retry; sidebar and toolbar stay usable (STA-004) | n/a |
| Returns tab | nested | "No returns yet." one line (STA-002) | same as table | skeleton rows | inline message + Retry | Plan-locked: "Returns needs the Pro plan" + "Upgrade plan" (STA-005) |

Unknown `/shipments/99999`: shell visible, "There's no page at this address", link "Back to shipments" (STA-006).

Bad: the table shows column headers and "Showing 0-0 of 0" on first use (breaks STA-001); tab counters read "Printed 0" and jump to 12 (breaks STA-003); a failed request leaves the main area blank (breaks STA-004); the Returns tab is hidden for lower plans, or clicking "Create return" opens "No access" after the click (breaks STA-005).

## Self-check

- Every fetching region has distinct empty, no-match (if filterable), loading and error branches.
- Every empty state has exactly one primary action and is sized to its container.
- No counter or KPI shows 0 before its value loads; loading regions are announced.
- Every error branch retries only its own region.
- Every plan- or setting-gated control is visible, explained and paired with an unlock action.
- Role-denied controls cite HLP-006, FDB-002 and VIS-006; only a whole page or region denied by role says "no rule yet".
- The catch-all route renders inside the shell with a way forward.
- STA-004 and HOM-010 are labelled as suggestions (low confidence).
