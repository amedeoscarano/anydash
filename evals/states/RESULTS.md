# /dash:states eval results

Four blind runs on `examples/flawed-dashboard`, scored against the rubrics in `prompts.md`. "With" loads `skills/states/SKILL.md` and its siblings. "Without" is the same model with no skill.

A rubric hit needs the rule ID (or a listed alternative) and the same place or behaviour. The without runs use no catalogue IDs, so they get two scores: strict (IDs required, as the rubric says) and semantic (same place and behaviour, ID ignored).

## Scores

| Prompt | Mode | Rubric score | Key differences |
|---|---|---|---|
| 1 Check Orders | with | **Pass.** Must-find 1/1. Should 8/8. Must-not 0. Structure 7/8: `n/a` rows are mixed in with `pass` rows, and two statuses read `pass (suggestion)`, which is outside the allowed set. | Correct catalogue IDs on every row. STA-004 labelled as a suggestion. Totals match the rows (1 fail, 8 pass, 5 n/a). It says it did not check a `page` value past the range, so it missed the out-of-range page bug. 6 tool calls, about 45 s. |
| 1 Check Orders | without | **Strict: fail** (no rule IDs, so 0 hits). **Semantic: would pass.** Must-find 1/1 (reported as `missing`, not `fail`). Should 7/8: item 4 is not labelled as a suggestion. Must-not 0. Structure 5/8: no IDs, the sort breaks (a `pass` row after the `n/a` rows), and the totals say 12 pass where the table has 11. | Found a real bug the rubric does not list: `?page=99` with `total > 0` renders an empty table and the range "2451–120 of 120" (`app/orders/page.js:55-56`). Also found a stale `missing` flag (`[id]/page.js:37-39`), which is minor and hidden by `notFound()`. One wrong label: the prev/next stepper is cited under EMPTY-FIRST-RUN. 3 tool calls, 1-2 min. |
| 2 Generate Settings | with | **Pass.** Must-find 5/5. Should 6/6. Must-not 0. Structure 6/7: it edited `lib/data.js` (the demo user gets role, plan and permissions). That file is outside `app/settings/**` and is not a shared component, but the gates need a source. | Says the repo would get Check under step 1 and generates as asked. Cites "no rule yet" for the Branding page and says "not STA-005" for the Integrations switches. The gates show in the running demo because the data has them. "Upgrade plan" points to `/settings/plan`, which does not exist; the report lists this as an open item. `states.md` is 11.8k chars. 19 tool calls, about 3 min. |
| 2 Generate Settings | without | **Strict: fail** (the table uses `Notes` in place of `Rule IDs`, and no IDs appear anywhere). **Semantic: would pass.** Must-find 5/5 on behaviour, but item 4 never says "no rule yet". Should 5/6 confirmed (item 10, the Delete drafts modal, is cut off in the truncated output). Must-not 0. | Same fixes in code, plus a `useAccess()` hook in `app/settings/use-access.js`. When `/api/me` has no role or plan it defaults to Owner on Pro, so the lock and denial states never show in the demo, and an unknown role fails open. "Upgrade plan" links to `/settings/general` (a wrong target, marked with a shortcut comment). 8 tool calls, about 95 s. |

Overall: the with runs pass both prompts. The without runs fail both under strict scoring, and the cause is format and IDs, not findings. On behaviour alone the without runs are almost as good, and on prompt 1 the baseline found one real defect that the skill run skipped.

## What the skill added

- **Rule IDs and the catalogue vocabulary.** Every row cites the right IDs. It keeps STA-005 (plan) apart from HLP-006 and VIS-006 (role), and uses "no rule yet" for a page denied by role. The baseline invented labels and once used the wrong one.
- **Contract format.** It uses the exact column sets, puts `n/a` with a reason in every cell that needs one, and ends with totals and the list of regions with no branch.
- **Confidence labels.** STA-004 and FDB-009 are labelled as suggestions. The baseline treated the prompt 1 errors as plain passes.
- **Mode reasoning.** On prompt 2 it says why the repo would normally get Check and that it generates as asked.
- **Demo data for the gates.** The with run wired role and plan into `lib/data.js`, so the lock and denial branches render. The baseline's code is correct, but its gates never show and they fail open.

## Where it did worse or was too verbose

- **Checklist tunnel (prompt 1).** The skill run found nothing past its step list. It noted that "a `page` value beyond the range was not checked" and moved on. The baseline found the out-of-range page bug because nothing narrowed its search. Step 4 covers filters but not pagination past the last page.
- **Cost (prompt 2).** About 2x the wall clock and tool calls (3 min and 19 calls against 95 s and 8 calls). The spec is long: Locked cells hold the copy plus the reasoning and up to four rule IDs.
- **Status values.** `pass (suggestion)` is not in the allowed set. The skill says to label suggestions but not where the label goes.
- **Sort order.** The skill does not say where `n/a` rows go, so both runs mixed them in with `pass` rows.
- **Dead unlock action.** Both prompt 2 runs added an "Upgrade plan" link to a route that does not exist. That is a dead click, which the skill exists to prevent. The with run at least listed it as an open item.

## Problems and decisions

1. **No step for pagination past the last page.** **Fix now.** In `skills/states/SKILL.md` step 4, after the IDX-011 sentence, add: "Paginated lists: a page number past the last page (`total > 0`, zero rows) shows "This page has no results" and "Go to first page", never an empty table or a range such as "51-20 of 20" (IDX-007, IDX-011)." In step 12, Next.js signals, add: "range text computed from `page` with no clamp to the page count".
2. **Suggestion label inside the status value.** **Fix now.** Step 13: replace "Label STA-004, HOM-010 and FDB-009 findings as suggestions." with "Label STA-004, HOM-010 and FDB-009 findings as suggestions: start the Fix cell with "Suggestion:" and keep Status to `pass`, `fail`, `missing` or `n/a (reason)`."
3. **`n/a` sort position not specified.** **Fix now.** In Output, change "Sort rows by status: `missing`, then `fail`, then `pass`." to "Sort rows by status: `missing`, then `fail`, then `pass`, then `n/a`."
4. **Explicit Generate request against the step 1 rule.** **Fix now.** Step 1: add "An explicit request for a mode wins. In Generate on a repo with some branches, record each existing branch as `present` and do not rewrite it." This makes the with run's behaviour the rule instead of a judgement call, and it should cut the explanation it wrote.
5. **Unlock actions that point to a route that does not exist.** **Fix now.** Self-check: add "Every unlock or recovery action points to an existing route. If none exists, the action stays and the route is listed under Open items, not pointed at another page."
6. **Verbose spec cells and 2x cost.** **File as task.** Measure the `states.md` length and tool calls across all prompts before cutting. A candidate change is "a cell holds copy and one action; reasons go in a note under the table". Do not cut on one run.
7. **`lib/data.js` edit outside the allowed scope.** **File as task** (change the rubric, not the skill). Gates need a source of role and plan. Change the prompt 2 structure item to allow "the demo data source the gates read", and require the report to list it, which the with run did.
8. **Strict ID scoring hides how close the baseline is.** **File as task.** Add a semantic column to the scoring in `prompts.md`. Without it, the with/without gap measures format compliance, not findings.
9. **Gates that fail open when role or plan is unknown (baseline only).** **Reject with rationale.** The with run did not do this, so the skill already prevents it. Server-side enforcement of the gates is out of scope for a UI states command, and both runs listed it as not done.
10. **Stale `missing` flag in the order detail (baseline only).** **Reject with rationale.** `notFound()` replaces the page, so users never see it. It is a code-hygiene point, not a state finding, and a rubric item for it would reward noise.
11. **No run built or rendered the new branches.** **Verify with a test.** Run prompt 2 in a copy with `node_modules` installed, run `next build`, and render `/settings/branding` and `/settings/integrations` as Staff on Free and as Owner on Pro. Check that the lock text, the denial text and the empty lists render, and that the Branding menu entry stays.

## Closed

1. Pagination past the last page: applied. `skills/states/SKILL.md` step 4 and the step 12 Next.js signals.
2. Suggestion label: applied. Step 13 sentence replaced as written.
3. `n/a` sort position: applied. Output sort order ends with `n/a`.
4. Explicit mode request: applied. Step 1 adds the rule.
5. Unlock routes: applied. Self-check adds the route line.
- Items 6, 7 and 8 (file as task): added to `ROADMAP.md` under "From v0.1 evals".
