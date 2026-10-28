---
name: live-rule-audit
description: >-
  Runs the check_live test of every rule in the rulebook against a running admin dashboard, through the browser-adapter skill, and writes findings rows with [live] evidence plus a findability test of the settings. It drives the app with ready steps.json recipes - sidebar at 1440/1024/768/390, save bar dirty state and leave guard, instant switch with a blocked request, toast and status live regions, keyboard focus order and visible focus, empty, not-found and error states - and lists every rule it could not run. Use when a URL of a running dashboard is available and someone asks to test, QA or audit it in the browser, to verify behaviour that code review cannot see (failed requests, focus, layout at 390 px, live regions), or when /dash:review-live calls it. Do not use it without a running app (use static-rule-audit), on a production site in own-app mode, or for pure visual consistency (use visual-audit).
---

# Live rule audit

Check a running dashboard against the rulebook by acting in it. Each rule's `check_live` line says what to do and what to assert. This skill turns those lines into browser steps, runs them through browser-adapter, reads the results, and writes findings. Some faults exist only at run time: a switch that stays on after a failed request, a live region created too late, focus lost after a drawer closes. Static review cannot see them; this skill can.

## Input

- A base URL of the running app (`http://localhost:3100`).
- Optional: the static findings in `dash-review/findings.md`, to confirm or close them live.
- Optional: the settings inventory (`dash-spec/inventory.md`, `dash-spec/ia.md`) for the findability test.
- Test data the user named as disposable, if any check must create or delete.

## Output

- Rows in `dash-review/findings.md` (beside the reviewed repo root, or `./dash-review`), in the shared format:
  `| # | Severity | Rule | Where | Evidence | Recommendation | Exit |`
  Where = `url @ viewport, step i` (the `i` from `log.ndjson`). Evidence starts with `[live]` and quotes the failed assertion and the observed result. A finding that only a live run can see says why static review could not.
- `## Not checked`: every rule whose live check did not run, with the reason (no script step, needs hover or throttling, needs an empty account, read-only mode).
- Raw evidence under `dash-review/live/<recipe>/` (the `outdir` of each run): `log.ndjson`, `console.ndjson`, snapshots, screenshots.
- `dash-review/findability.md` when the findability test runs.

When called from /dash:review-live, return the rows to the command instead of writing the final file; the command merges them with the static rows.

## Procedure

1. **Pick the driver and mode.** Apply the browser-adapter skill (`../browser-adapter/SKILL.md`). It detects the tool in its order: gstack, Playwright MCP, Claude in Chrome, Chrome DevTools MCP, Cursor's browser, then `../browser-adapter/scripts/ownapp.mjs`. It also sets the mode: own-app only on localhost, 127.0.0.1, [::1], `*.localhost`, `*.test`, or a staging host the user named; third-party-readonly anywhere else. Never run own-app on production. If browser-adapter is missing, stop and say so: this skill does not drive a browser on its own.
2. **Discover.** Run recipe 0 of `references/recipes.md`. From the snapshots, write down page URLs, sidebar names, form fields with their current values, switches with their states, and the list search field. Every later step uses these exact names.
3. **Plan the checks.** Walk every rule in `references/rules.md`. For each, decide: covered by a recipe, composed from the step vocabulary, or not runnable (needs a script step, hover, throttling, an empty account, or a write in read-only mode). Rules whose `applies_when` does not match the app are not applicable; skip them and do not list them. Page types and their regions come from `references/frameworks/page-templates.md`.
4. **Run the recipes** in `references/recipes.md`, one session per recipe, each with its own outdir:
   - Sidebar at 1440, 1024, 768 and 390 px (NAV-003, NAV-004, NAV-006, CHR-012, LAY-008).
   - Save bar dirty state, Discard and leave guard (SAV-001, SAV-004, SAV-005).
   - Instant switch with a blocked request (SAV-002, CTL-002).
   - Toast and status live regions, field errors, destructive dialog (FDB-008, FDB-001, FDB-003, FDB-007, FDB-009, SAV-006).
   - Keyboard focus order and visible focus (no rule ID: WCAG 2.4.3 and 2.4.7; CTL-009, CHR-002).
   - Contrast from computed colours: apply the visual-audit skill's contrast recipe (VIS-003, VIS-004).
   - Empty, no-match, not-found and error states (STA-001, STA-004, STA-006, IDX-011).
   Then compose steps for the remaining runnable rules from their `check_live`. Restore every value you changed, in the same run.
5. **Read the results.** For each run, read `log.ndjson` line by line and compare each result with the recipe's assertions. Open a screenshot whenever an assertion depends on what is visible. Check `console.ndjson`: an uncaught error or a failed request during a check is part of the evidence.
6. **Write findings.** One row per failed assertion, grouped when one cause fails several steps.
   - Severity: `blocker` for data loss, a wrong commit, a security issue or a core task that cannot be done (by keyboard too); `major` for a high or medium rule clearly broken; `minor` for polish and for any low-confidence rule (CHR-012, CTL-009, FDB-009, STA-004 and every other rule marked low in `references/rules.md`: never above `minor` on their own); `note` for observations.
   - Rule: the rule ID, or "no rule" plus the reason (for focus: "no rule, WCAG 2.4.7").
   - Exit: exactly one of `fix now`, `file as task`, `reject with rationale`, `verify with a test`. Blockers are `fix now`. A live-only fault that a unit or end-to-end test can pin down gets `verify with a test` once fixed; say which test in Recommendation.
   - If a static finding exists for the same rule and place, add the live result to its Evidence instead of a new row.
7. **Findability test.** When an inventory exists or the caller asks, run `references/findability.md`: one fresh subagent per setting, no code access, labels only, clicks and time logged. Add its rows.
8. **Not checked.** List the IDs from step 3 that did not run, each with its reason. Include rules skipped because a recipe step failed on setup (wrong name, page missing).

## Rules applied

- NAV-003 — icons and a collapsible icon rail with names.
- NAV-004 — exactly one active item.
- NAV-006 — drawer below 768 px, Escape returns focus.
- CHR-002 — Cmd/Ctrl+K opens search, focus returns on Escape.
- CHR-012 — chrome keeps its names at narrow widths (low).
- LAY-008 — no horizontal scroll at phone width.
- SAV-001 — save bar wakes on change, sticky.
- SAV-002 — instant change confirms, reverts on failure.
- SAV-004 — Discard restores the saved state.
- SAV-005 — warn before leaving with unsaved changes.
- SAV-006 — destructive action confirms with its consequence.
- CTL-002 — no switch in a Save form.
- CTL-009 — every control has its own name (low).
- FDB-001 — one channel per kind of event.
- FDB-003 — field errors under the field.
- FDB-007 — modals only for decisions.
- FDB-008 — live regions exist before messages.
- STA-001 — empty state with one action.
- STA-003 — placeholders in place, no provisional zero.
- STA-004 — failed region says so, with Retry (low).
- STA-006 — not-found inside the shell.
- IDX-011 — no-match distinct from empty.
- VIS-003 — badge contrast at least 4.5:1.
- SET-012 — search across settings (findability).

Full text and every `check_live`: `references/rules.md`. Frameworks: `references/frameworks/`. Recipes: `references/recipes.md`. Findability: `references/findability.md`.

## Example

Good: on `http://localhost:3100/settings/notifications @ 1440x900`, recipe 3 blocks `**/api/**` and toggles "Email me when a shipment fails". The snapshot at recipe step 13 (logged `i` 12) still shows `[checked]` and no live region has text. Row: `3 | major | SAV-002 | http://localhost:3100/settings/notifications @ 1440x900, step 12 | [live] request blocked; switch stayed checked, no error in any live region. Static review saw a handler that calls the API and could not tell it never restores the value on rejection | Revert the switch in the catch branch and show an error toast with Retry | fix now`. Not checked lists `STA-003 (needs network throttling)` and `LAY-007 (needs elementFromPoint, no script step in ownapp)`.

Bad: the agent reads the code of the notifications page, decides the switch "looks fine", writes `SAV-002 passes` without running a step, and clicks "Delete store" on a staging host to see the dialog, then confirms it. No step index, no evidence file, no Not checked list (breaks the Output contract and own-app safety).

## Self-check

- [ ] browser-adapter chose the tool and the mode; own-app ran only on an allowed host.
- [ ] Every name in a step came from a discovery snapshot.
- [ ] Every row has `url @ viewport, step i`, `[live]` evidence and exactly one Exit.
- [ ] No low-confidence rule alone is above `minor`.
- [ ] Every value changed during the run was restored; nothing was deleted that the user did not name as test data.
- [ ] `## Not checked` lists every rule that did not run, with the reason.
- [ ] Live-only findings say why static review could not see them.
