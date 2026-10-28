# /dash:states eval prompts

Two blind runs of `/dash:states` on `examples/flawed-dashboard`. The runner makes a fresh copy of the example for each prompt and deletes `EXPECTED_FINDINGS.md` and `README.md` from the copy. Copies are not stored in this folder.

The agent under test loads `skills/states/SKILL.md` and follows it literally. It must not read this file, the example's answer key or anything under `evals/`. A separate scoring agent grades each answer against the rubric below.

Fixtures live in `evals/states/fixtures/`. They are small and synthetic.

| Prompt | Mode | Scope | Fixture |
|---|---|---|---|
| 1 | Check | `app/orders/page.js`, `app/orders/[id]/page.js`, `app/not-found.js` | none |
| 2 | Generate | `app/settings/**` | `fixtures/dash-spec/inventory.md` copied to `dash-spec/inventory.md` |

Scoring: a rubric item is a hit when the answer names the rule ID (or a listed alternative) and the same place or behaviour. "Must find" items gate the run. "Should" items count toward the score. "Must not" items count as false positives.

---

## Prompt 1: check the states of the Orders pages

Setup: copy of the example, no fixture.

> Run `/dash:states` on this repo, limited to the Orders pages: the order list at `/orders` (`app/orders/page.js`) and the order detail at `/orders/[id]` (`app/orders/[id]/page.js`), plus the not-found page an unknown order id leads to. The states already exist in code, so check them. Return the findings table and the totals. Do not edit any file.

### Rubric

Structure:

- Picks Check mode and says so (branches for loading, error and not-found already exist).
- One findings table with the columns `Page | State | Status | Rule IDs | Fix`.
- Status values only from `pass`, `fail`, `missing`, `n/a (reason)`. Every `n/a` has a reason.
- Rows sorted `missing`, then `fail`, then `pass`.
- Ends with counts per status and the list of regions that had no branch at all.
- Rows cover both pages and, for each, the states Empty, No match (list only), Loading, Error, Locked / denied and Not found (detail and catch-all).
- Every `missing` or `fail` row has a concrete fix with exact copy or a code change.
- No files changed.

Must find:

1. **IDX-011, fail, `app/orders/page.js:91-93`.** The list has one zero branch, `data.total === 0`. A search (`/orders?q=zzz`) or a status tab with no orders shows the first-run copy "No orders yet" and "Set up storefront sync", with no way back. Fix: a separate no-match branch when `q` or `status` is set, for example "No orders match these filters" with a "Clear filters" action that removes `q` and `status`.

Should find (each a hit):

2. **Orders list, Empty: pass (STA-001).** First run shows a heading naming the content, one sentence and one primary action. Status tabs and search stay visible. No "Showing 0-0 of 0" or bare table. Also a hit if the answer flags that the first-run branch is reached by filters as well, citing IDX-011 again.
3. **Orders list, Loading: pass (STA-003).** `Loading` has `role="status"`, tab counts show "…" until data arrives, and there is no provisional 0. A `fail` that only notes the placeholder is two bars rather than table-height skeleton rows is acceptable, labelled minor.
4. **Orders list and order detail, Error: pass (STA-004).** `LoadError` names what failed and offers Retry for that region; the header, tabs and breadcrumb stay usable. Labelled as a suggestion (low confidence).
5. **Order detail, Not found: pass (STA-006).** A 404 from `/api/orders/[id]` calls `notFound()`, which renders `app/not-found.js` inside the shell (root layout wraps `Shell`) with "Go to orders".
6. **Catch-all, Not found: pass (STA-006).** Same `app/not-found.js` for unknown routes.
7. **Locked / denied: n/a** on both pages, with the reason that the app has no plan, entitlement or role gates.
8. **Feedback: pass (FDB-008).** Loaded counts and orders are announced through the one live region mounted in `ToastProvider` at the root.
9. **Order detail, breadcrumb Loading: pass (STA-003).** The current crumb shows "…" until the order loads.

Must not (false positives):

- STA-004 `fail` or `missing` for a missing `app/error.js` or `app/orders/error.js` when each region already has its own Retry.
- STA-005 or HLP-006 findings on these pages (no gates exist).
- Empty-state findings for the Items or History cards on the detail page. An order always has items and history; `n/a (reason)` is correct.
- Reporting the home page STA-003 seed or any Settings seed as an Orders finding. Out of scope, score as neutral if listed under a separate "Outside scope" note.
- "States look fine" after reading only one of the two pages.

Pass threshold: item 1 found, structure items all met, at least 6 of items 2-9, at most 1 must-not row.

---

## Prompt 2: generate the missing states spec for Settings

Setup: copy of the example. Copy `evals/states/fixtures/dash-spec/inventory.md` to `dash-spec/inventory.md` in the copy.

> Run `/dash:states` for the Settings area of this repo (`app/settings/**`: General, Notifications, Branding, Integrations). There is no states spec yet. Generate it: write `dash-spec/states.md` with the state matrix for every Settings page and the Feedback section, using the roles and plans in `dash-spec/inventory.md`. Then add the missing state branches to the Settings code. Report what you wrote and changed.

### Rubric

Structure:

- Writes `dash-spec/states.md`. Says that some branches already exist and that it generates the spec anyway, as asked; existing branches are recorded, not rewritten.
- One table per Settings page (General, Notifications, Branding, Integrations) with the columns `Region | Container | Empty | No match | Loading | Error | Locked / denied | Rule IDs`.
- Every cell holds exact copy and one action, or `n/a` with a reason (for example "No match: n/a, no search or filter on this page").
- One row for the app-wide not-found page and one for the app-wide blocking failure (session expired, service down: one page banner, STA-004 exception).
- A `## Feedback` section listing each event (save, save failed, field invalid, toggle, toggle failed, delete drafts) with one channel each (FDB-001).
- STA-004 rows labelled as suggestions.
- Code changes are limited to `app/settings/**` and shared components they need. The report lists each changed file.

Must find:

1. **Empty branch, Notifications and Integrations lists (STA-001, STA-002).** `items.map` renders with no zero-length branch, so an empty response shows a blank bordered box. The spec gives each list an empty cell, sized to its container, and the code adds the branch. For Integrations, `n/a` is also a hit if the reason says the catalogue is fixed by the app and cannot be empty; the code then needs no branch.
2. **Plan lock, Brand colour (STA-005, FDB-002).** On Free the Brand colour control stays visible and disabled, the text says it needs the Pro plan, and an "Upgrade plan" action sits next to it. Never a toast after the click.
3. **Role-denied control, Integrations switches for Staff (HLP-006, VIS-006, FDB-002).** Switches stay visible, faded and disabled, with text such as "Only owners can turn integrations on or off" next to them. Not cited as STA-005.
4. **Role-denied page, Branding for Staff without the permission: "no rule yet".** The content is replaced by the requirement ("Ask an owner for the Branding permission" or similar). The settings menu entry stays, since an Owner can grant the permission.
5. **Field error, Store name (FDB-003).** `app/settings/general/page.js:50` reports the 422 "Store name is required" only in a toast. The Feedback section puts it under the field with `aria-invalid`, and the code moves it there. Also a hit if cited as FDB-001.

Should find (each a hit):

6. **Loading and Error rows record the existing branches as present** on all four pages (`Loading` with `role="status"`, `LoadError` with Retry), STA-003 and STA-004, without adding duplicate code.
7. **Save failure with no response (FDB-001 or FDB-004).** The General and Notifications save handlers have no `try`/`catch`; a network error leaves "Saving…" with no message. The Feedback section gives this event a channel and the code adds the catch.
8. **Lasting condition kept in place (FDB-002).** The Integrations toggle failure is reported in a toast with Retry, and the switch shows its real state. Citing the stale card state (`useState(item.enabled)` at `app/settings/integrations/page.js:7`) as SAV-002 is also a hit.
9. **Toast duration (FDB-009, low, suggestion).** Toasts with a Retry action stay until dismissed; a hit if the answer checks `components/toast.js` and records it as pass.
10. **Delete drafts confirmation (FDB-007).** The modal is used for a decision that must come first; recorded as the right channel.
11. **Draft order count, Empty: pass.** With 0 drafts, "0 draft orders" shows and "Delete drafts" is disabled, not removed (STA-001, VIS-006). The count is set together with the form, so it is not a provisional zero.

Must not (false positives):

- STA-003 `fail` for `useState(0)` on `drafts`. The section renders only after the settings load.
- A No match state on any Settings page. None has search or filters.
- STA-005 cited for a role-denied control or page.
- The Branding menu entry removed for Staff.
- New `app/settings/error.js` or `loading.js` files that duplicate the region branches already there.
- Any real-looking store, account or person data in the spec copy. `example.com` addresses and "Acme Store" are fine.

Pass threshold: items 1-5 all found, structure items all met, at least 4 of items 6-11, at most 1 must-not item.
