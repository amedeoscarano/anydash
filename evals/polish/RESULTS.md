# /dash:polish eval results

Four blind runs on `examples/flawed-dashboard`, scored against the rubrics in `prompts.md`. "With" loads `skills/polish/SKILL.md` and its siblings (visual-audit, browser-adapter). "Without" is the same model with no skill.

A rubric hit needs the rule ID (or a listed alternative) and the same place or value. The without runs use no catalogue IDs, so they get two scores: strict (IDs required, as the rubric says) and semantic (same place and value, ID ignored).

## Scores

| Prompt | Mode | Rubric score | Key differences |
|---|---|---|---|
| 1 Token audit, code only | with | **Pass.** Must-find 2/2. Should 9/9. Must-not 0. Structure 9/9. | Ran steps 1, 3 and 4 and stopped before step 6, as asked. Every ratio comes from `contrast.mjs`, and `color-mix()` is resolved per channel first (`#6b7079` light, `#9b9da1` dark). The Token audit table has all 10 rows. Findings carry rule IDs and an Exit, and are sorted into token fixes, component fixes and `/dash:review`. `app/icon.svg` and `dialog::backdrop` get `reject with rationale`. The VIS-002 trap on the General Save buttons is named and not flagged. No `/dash:review` items are listed (it says "none"). About 72 s, 10 tool calls. |
| 1 Token audit, code only | without | **Strict: fail.** Must-find 1/2 (item 1 has no VIS-009 ID). Should 1/9 (only item 9, which needs no rule). Structure 7/9: no rule IDs, and the ratios come from its own script, not `contrast.mjs`. **Semantic: would pass.** Must-find 2/2, should 9/9, must-not 0. | Same findings and the same numbers (its own WCAG script matches the reference values). It found the off-state switch thumb on the border track (1.24:1) and two `/dash:review` items (NAV-002 menu label, HLP-002 tooltip warning) that the with run did not list. About 62 s, 7 tool calls. |
| 2 Polish Settings | with | **Pass.** Must-find 3/3. Should 7/7. Must-not 0. Structure 7/7. | Token fix `--color-muted` 62% to 64% (4.36 to 4.67:1 on subtle), new `--color-switch-thumb` in all three blocks (dark `#f3f4f6`), one class change in `components/ui.js:44`. All five `polish.md` sections, in order, with the skill's columns. Before and after shots for 7 pages at 4 widths (56 PNGs); every changed pair is explained as expected. 10 `/dash:review` rows with IDs, none edited. Dark mode was checked from token values only, because `ownapp.mjs` cannot emulate it. It did not open the changed screenshot pairs; it judged them by pixel-diff boxes. About 225 s, 19 tool calls. |
| 2 Polish Settings | without | **Strict: fail.** Must-find 0/3 by ID (no VIS-004 or VIS-009 in the change rows; the review list has no IDs). Structure 4/7: no `## For /dash:review` heading, the Tokens and Screenshots tables use their own columns, the ratios come from its own script. **Semantic: would pass.** Must-find 3/3, should 7/7, must-not 0 (one borderline item, below). | Raised muted to 66% (4.98:1 on subtle) and explained why 64% leaves a thin margin. Captured dark mode live over CDP, which the with run could not. Added `block` to the General `field` class to fix the "Default package weight" label alignment. That is a layout change on a Settings form, backed by a finding, but it pre-empts the CTL-007 change to the same field. Found one item no rubric lists: the Branding save bar spans only the content column (`components/ui.js:63`). About 414 s, 17 tool calls. |

Overall: the with runs pass both prompts with no false positives. The without runs fail both under strict scoring. As in the other evals, the cause is format and IDs, not findings: on substance the baseline is as good, and on prompt 2 it checked dark mode better.

## What the skill added

- **Rule IDs and the shared format.** Every row has a rule ID, a severity and an Exit, and rows are sorted into token fix, component fix and not polish. The baseline used generic labels such as "Text contrast (WCAG 1.4.3)".
- **The five `polish.md` sections.** The with run used the exact headings and columns. The baseline invented its own and dropped the `## For /dash:review` heading.
- **One measuring tool.** All ratios come from `contrast.mjs`, so they can be reproduced. The baseline wrote a new script in each run.
- **Scope discipline.** The with run filed the package weight alignment (LAY-002) as a task and tied it to the CTL-007 review item, so it did not touch a field that `/dash:review` will change. The baseline edited it.
- **Explicit pass rows.** VIS-002, VIS-003, VIS-007, VIS-008, LAY-006 and the focus ring are all named as passes with evidence, which closes the rubric's false-positive traps.
- **Faster on prompt 2.** 225 s against 414 s, with a similar number of tool calls. The bundled `ownapp.mjs` `responsive` step saved the CDP workaround the baseline had to build.

## Where it did worse or was too verbose

- **Dark mode not rendered.** `ownapp.mjs` has no colour-scheme step, so the with run checked dark only from token values. The baseline rendered dark screenshots.
- **Changed pairs not opened.** Step 8 says to open every changed pair. The with run used pixel-diff boxes for all 28 pairs and said so.
- **Driver conflict.** browser-adapter picks gstack browse first. Polish step 2 names `ownapp.mjs`. The run had to choose and explain.
- **Arbitrary-value search too narrow.** The step 4 regex misses `w-`, `h-`, `min-h-` and `max-w-`. Both with runs ran an extra search to find the size values the rubric expects.
- **A pass reported as a Remaining row.** The prompt 2 with run put the focus ring pass in `## Remaining` with `reject with rationale`. A pass is not a remaining finding.
- **Out-of-scope screenshots.** Prompt 2 was scoped to Settings, but the default steps also captured home, orders and order detail: 56 PNGs where 32 cover the scope. The rubric allows it, but it doubles capture and diff work.
- **Fewer review items on prompt 1.** The with run sent nothing to `/dash:review`; the baseline listed NAV-002 and HLP-002. The prompt 1 rubric does not score this.

## Problems and decisions

1. **Polish step 2 and browser-adapter disagree on the driver.** **Fix now.** In `skills/polish/SKILL.md` step 2, replace "Run with browser-adapter (local script: `node ../browser-adapter/scripts/ownapp.mjs run <url> steps.json dash-review/polish/before`):" with "Run with the tool browser-adapter step 2 picks, and name it in `polish.md`. With the bundled script: `node ../browser-adapter/scripts/ownapp.mjs run <url> steps.json dash-review/polish/before`. If the picked tool cannot set the four widths, use the bundled script and say why:".
2. **The step 4 arbitrary-value search misses size utilities.** **Fix now.** In step 4, after the Tailwind arbitrary values line, add: "- Arbitrary sizes: `rg -n '\b(w|h|min-w|min-h|max-w|max-h|size)-\[[^\]]+\]' app components`. Sizes are not spacing: report them as a LAY-006 pass unless one sets padding or a gap."
3. **Changed screenshot pairs not opened.** **Fix now.** In step 8, replace "Open every changed pair and confirm the change matches a fix." with "Open every changed pair on the scoped pages and confirm the change matches a fix. Outside the scope, a pixel diff whose changed boxes all sit on text is enough when the only fix there is a global token; say so in `## Screenshots`."
4. **Passes written as Remaining rows.** **Fix now.** In Output item 4, after "`verify with a test`).", add: "Checks that pass are not rows. List them in one `Pass:` line under the table, each with its rule ID and ratio."
5. **Scoped runs capture pages outside the scope.** **Fix now.** In step 2, add: "When the user names a scope, capture the scoped pages plus one page outside it (home) to confirm the effect of global tokens."
6. **No dark-mode capture in `ownapp.mjs`.** **File as task.** Add a `{"colorScheme": "dark"}` step to `skills/browser-adapter/scripts/ownapp.mjs` (Playwright `page.emulateMedia`), cover it in `ownapp.test.mjs`, then add dark captures to polish step 2 and remove "dark mode without an in-app switch" from the browser-adapter `## Not checked` default. Needs script work and a test, so it is not a SKILL.md edit.
7. **64% leaves a thin margin (4.67:1).** **Reject with rationale.** It passes 4.5:1 from the script, the rubric accepts 64% or more, and the smallest change keeps muted text clearly lighter than `fg`. The baseline's 66% is also valid. Picking a margin is a design call, not a rule.
8. **Canceled badge 4.52 (reference) against 4.53 (runs).** **File as task** (eval file, not skill). `contrast.mjs` gives 4.52 for `rgb(107 112 121)` and 4.53 for the unrounded `rgb(107.44 111.78 121.08)`. In `prompts.md`, write the reference as "4.52 (4.53 from unrounded channels)" so a grader does not mark a correct run down.
9. **Branding save bar spans only the content column (baseline only).** **Verify with a test.** Open `after/settings-branding-1024.png` from the prompt 2 without run. If the bar is misaligned, add it to the example's answer key as a SAV-001 `/dash:review` item, because moving the bar is a save-flow change, not polish.
10. **The baseline's `block` change on the General field.** **Reject with rationale.** Baseline only. The skill already keeps it out: the with run filed LAY-002 as a task tied to CTL-007. No rubric change is needed.
11. **Eval harness: symlinked `node_modules` broke Turbopack, and `_eval/` was written inside the copy.** **File as task** (runner, not skill). `prompts.md` says the runner runs `npm ci` in the copy; it symlinked instead. Write run outputs outside the copy so the "no file changed" item stays clean.
12. **Strict ID scoring hides how close the baseline is.** **File as task.** Same as `evals/states/RESULTS.md` item 8: add a semantic column to the scoring in `prompts.md`.

## Closed

1. Driver in step 2: applied. `skills/polish/SKILL.md` step 2 sentence replaced as written.
2. Arbitrary sizes: applied. Step 4 has the `Arbitrary sizes` search after the Tailwind arbitrary values line.
3. Changed pairs: applied. Step 8 sentence replaced as written.
4. Passes not rows: applied. Output item 4 ends with the `Pass:` line rule.
5. Scoped capture: applied. Step 2 adds the scoped pages plus home.
- Items 6, 8 and 11 (file as task): added to `ROADMAP.md` under "From v0.1 evals". Item 12 duplicates `evals/states/RESULTS.md` item 8 and is filed once.
