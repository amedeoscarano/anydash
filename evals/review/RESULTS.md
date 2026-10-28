# /dash:review and /dash:review-live on examples/flawed-dashboard

Blind runs, 2026-10-28. Each reviewer worked on a copy of the example without `EXPECTED_FINDINGS.md` or `README.md`, loaded the command's `SKILL.md` and followed it literally. A separate agent scored the findings against the answer key: a seed is a hit when a finding names its rule ID (or a listed alternative) and the same place or behaviour.

| Command | Seeds found | Target | Live-only seeds found |
|---|---|---|---|
| `/dash:review` | 13 / 15 | ≥ 12 | 0 / 2 (listed under Not checked, as designed) |
| `/dash:review-live` | 15 / 15 | ≥ 13 | 2 / 2 (LAY-008 at 390 px, VIS-004 contrast 4.36:1) |

Noise:

- `/dash:review`: 51 rows. About 10 were real unseeded issues, now listed in the answer key. About 5 were false positives: CTL-002 extended to instant switches, FDB-008 for alerts inserted at runtime, VIS-002 for two Save buttons that are never enabled together, and STA-004 for a missing `app/error.js` when the regions already have Retry.
- `/dash:review-live`: 36 rows. About 6 were real unseeded issues and 2 or 3 were false positives. One was CHR-002 for Escape clearing a search input, which is native browser behaviour.

Exits: the false positives are filed in `ROADMAP.md` to tighten `static-rule-audit` and `live-rule-audit`. The real unseeded issues are listed in the example's answer key.

# /dash:review on the blind prompts (with and without the skill)

Runs on 2026-10-28 against `prompts.md`, scored against `ANSWER_KEY.md`. "With" loaded `skills/review/SKILL.md` and followed it. "Without" got the same prompt and no file under `skills/` or `rules/`. A seed is a hit only when the finding names its rule ID (or a listed alternative) at the same place. Hits by substance (right place, right problem, no ID) are shown in brackets.

Caveat: the rubric was in the task text of all four runners, against step 1 of "How to run". Both "without" runs said so. Read their substance scores as an upper bound.

| Prompt | Mode | Rubric score | Key differences |
|---|---|---|---|
| 1 settings page | with | **Pass.** Structure 7 / 7, obvious 5 / 5, subtle 3 / 3, must-not 3 / 3. False positives: 0, or 1 if BRD-010 counts. | 12 rows (11 rule rows, 1 "no rule"). Coverage 15 + 23 + 97 + 44 = 179. CTL-010 and HLP-006 graded `major` as the key expects. Found 3 real unseeded issues: STA-003 (form shows provisional defaults before the fetch), STA-004 (no `.catch` on the load, low, `minor`) and `plan` not being a Next.js page prop (`:27`, `:133`). Put BRD-001, BRD-004, BRD-006 and most of NAV and CHR under Not checkable ("not in the target") instead of Not applicable. 141 s, 8 tool calls, 9.2 KB. |
| 1 settings page | without | **Fail.** Structure 3 / 7, obvious 0 / 5 (5 / 5), subtle 0 / 3 (3 / 3), must-not 3 / 3. | Same 8 problems at the same lines, with plain labels and no rule IDs. Coverage line is `checks: 24`, not the rule form. No FDB-008 in Not checked. No chat summary. CTL-010 and HLP-006 graded `minor`. One weak extra row: "Contact email not validated" on an `type="email"` input. FDB-003 split into two rows (`:54`, `:68`). 25 s, 2 tool calls, 5.8 KB. |
| 2 planted spec | with | **Pass.** Structure 7 / 7, must-find 7 / 7, bonus 2 / 2, must-not 3 / 3. False positives: 0 of the listed IDs. | Every seed with the expected ID and both cross-file cites. Bell and settings overview in Do not build with reasons. Next step fits a spec ("change the spec before approval"). Extra rows: DET-008 (no order history, high confidence, `major`), SAV-008 (no change log, `minor`), Team and Notifications not specified (`note`). The coverage line says `findings: 17` while the table has 12 rows. 154 s, 10 tool calls, 7.1 KB. |
| 2 planted spec | without | **Fail.** Structure 4 / 7, must-find 0 / 7 (7 / 7), bonus 2 / 2, must-not 3 / 3. | Found all 7 seeds and both bonus items by substance. No Rule column, no Exit column, no rule-form coverage line. Do not build has the bell and the settings overview. Raised Staff access to Settings as a finding (the "with" run listed it under Not checkable). 42 s, 4 tool calls, 3.6 KB. |

## What the skill added

- **Rule IDs, exits and a countable coverage line.** This is all of the pass/fail gap. Without the skill, a scorer cannot match findings to the key, and a reader cannot see what was skipped.
- **Severity calibrated by rule confidence.** CTL-010 and HLP-006 came out `major` with the skill and `minor` without it. Low-confidence rules (BRD-010, STA-004) were capped at `minor`, as the skill requires.
- **A full Not checked list.** The skill run named 44 (prompt 1) and 48 (prompt 2) rule IDs it could not decide, each with a reason. The baseline listed 5 areas.
- **More real issues.** Prompt 1: STA-003, STA-004 and the `plan` prop bug. Prompt 2: DET-008 and SAV-008. The baseline found none of these.
- **Not added on these fixtures:** detection. The baseline found every seed and both bonus items by substance. The fixtures do not tell a good reviewer apart from the skill. They test format and calibration.

## Where it did worse or was too verbose

- **Cost.** With the skill, each run took 3.7 to 5.6 times the wall clock and 2 to 4 times the tool calls, and wrote about twice the text. Most of the time went on reading all 179 rules and 4 to 8 sibling skills for a single file or a 9-file spec.
- **Ambiguous count.** In prompt 2, `findings: 17` counts rule IDs (main and "also" IDs), but the table has 12 rows. The run had to add a sentence to explain this.
- **Not applicable vs not in the target.** Prompt 1 put branding, nav and chrome under Not checkable because those parts of the product exist but are not in the given files. The rubric expects Not applicable. The skill does not define the difference, so the split depends on the run.
- **Spec silence.** In prompt 2, a page named in the menu but never defined became a finding (row 12). A missing detail of a defined page went to Not checked. The rule was right but is unwritten, so it can drift.
- **Unrequested section.** Prompt 1 added "Passed (for reference)" with 23 IDs. The skill's Output does not ask for it.

## Problems and exits

1. **Findings count is ambiguous.** Exit: **fix now.** In `skills/review/SKILL.md`, Output item 1, after the coverage line format, add: "`findings` counts distinct rule IDs cited in the table, both main and \"also\" IDs. \"no rule\" rows are not counted. When the table has a different number of rows, add `rows: <n>` after the coverage line."
2. **Not applicable vs not in the target.** Exit: **fix now.** In `skills/review/SKILL.md`, Output item 4, add: "Not applicable is for a feature the product does not have. A feature the product has whose files are not in the target (the shell, nav config, email templates) is Not checkable, with the reason \"not in the target\"." In `evals/review/prompts.md`, Prompt 1, Structure, change the Not applicable item to accept either list for nav, chrome and branding when the reason is given.
3. **Spec silence.** Exit: **fix now.** In `skills/review/SKILL.md`, Input, Spec bullet, add: "A page, menu item or setting that the spec names but never defines is a finding (\"no rule: not specified\", `file as task`). A missing detail of a defined page goes to Not checked with the reason \"not specified\"."
4. **Rubric visible to the runners.** Exit: **fix now** (eval harness, not the skill). The workflow script that starts each runner must send only the verbatim prompt and the fixture path, never the rubric or the seed lists. Re-run both "without" runs blind before quoting the baseline.
5. **Fixtures too easy to separate the skill from the baseline.** Exit: **file as task.** Add seeds that need the rulebook to be seen: a low-confidence rule tempting a `major`, an Exceptions clause that turns a hit into a pass (SET-006 with several scopes, LAY-003 under 800 px), and a 390 px or contrast issue that must go to Not checked.
6. **Unseeded real findings are not in the key.** Exit: **fix now** (answer key, not the skill). In `ANSWER_KEY.md`, add as valid, non-false-positive rows: prompt 1 STA-003 (`page.jsx:28-37`), STA-004 (`:33`), the `plan` page prop (`:27`, `:133`); prompt 2 DET-008 (`pages.md:7`), SAV-008. Add BRD-010 (`:118-151`) as allowed only at `minor`.
7. **Run cost on small targets.** Exit: **verify with a test.** Time a run that reads only the rule areas with a feature present (from step 1) and compare its seed hits and Not checked list with these runs. Change step 3 only if both stay equal.
8. **"Passed (for reference)" section.** Exit: **reject with rationale.** It is one paragraph and lets a re-run check coverage against the earlier one. Keep it optional and do not add it to the Output spec.
9. **BRD-010 in prompt 1 (digest in Customer notifications).** Exit: **reject with rationale.** It is a low-confidence rule graded `minor` with "suggestion", as the skill requires. The digest is a staff message in a customer list, so the finding is real.

## Closed

1. Findings count: applied. `skills/review/SKILL.md` Output item 1 defines `findings` and the `rows: <n>` addition.
2. Not applicable vs not in the target: applied. `skills/review/SKILL.md` Output item 4 adds the distinction; `evals/review/prompts.md` Prompt 1 Structure accepts either list for nav, chrome and branding when the reason is given.
3. Spec silence: applied. `skills/review/SKILL.md` Input, Spec bullet, adds the "not specified" rule.
4. Rubric visible to runners: not applied. The workflow script that starts the runners is not in this repo; the change belongs to that harness. The blind "without" re-runs are still owed.
6. Unseeded real findings: applied. `evals/review/ANSWER_KEY.md` has a "Valid unseeded findings" list under each prompt, with BRD-010 allowed only at `minor`.
- Item 5 (file as task): added to `ROADMAP.md` under "From v0.1 evals".

## Blind rerun (2026-10-28)

Prompt 1 only (settings page). Both runners got the verbatim prompt and the fixture, with no rubric and no answer key. This closes problem 4 above for prompt 1. "Strict" counts a hit only with the rule ID (or a listed alternative) at the same place, and applies every Structure item as written. "Semantic" counts the right problem at the right place, with or without an ID.

| Mode | Strict score | Semantic score | Notes |
|---|---|---|---|
| with | **Fail on one item.** Structure 6 / 7, obvious 5 / 5, subtle 3 / 3, must-not 3 / 3. | **Pass.** Obvious 5 / 5, subtle 3 / 3, 0 or 1 false positive. | 13 rows (12 rule rows, 1 "no rule"). Coverage `16 + 23 + 10 + 130 = 179`, and `findings: 16` matches the distinct IDs in the table; the new `rows: 13` line is present. The failed item: HOM, IDX, DET, AI, ONB and INT sit under Not checkable ("not in the target"), not under Not applicable as the rubric requires. This follows the Closed fix 2 to the skill. FDB-008 is in Not checked. All three unseeded issues in the key were found again (`plan` prop as a blocker, STA-003, STA-004 capped at `minor`), plus BRD-010 at `minor`. SAV-004 is graded `blocker` (key: `major`), with the data-loss path stated. Possible false positive: row 11, HLP-001 on Free shipping threshold (`:98`). That field has no description, so it is arguably valid. The currency half of row 11 repeats row 5. Every row exits `fix now`. |
| without | **Fail.** Structure 0 / 7, obvious 0 / 5, subtle 0 / 3, must-not 3 / 3. | **Fail.** Obvious 4 / 5, subtle 3 / 3, 0 false positives on the key's list. | Missed CTL-002 entirely: the auto-archive `<Switch>` in the Save form (`:106`) does not appear in any finding. Found SAV-006, SAV-004, HLP-002, FDB-003 (split over `:53-55` and `:68`), CTL-007, CTL-010, HLP-006 and the three unseeded issues by substance. File is `FINDINGS.md` at the root, not `dash-review/findings.md`. No date, stack, coverage line, table, rule IDs, exits, Do not build, or split Not checked list. CTL-010 and HLP-006 graded Medium. Extras not in the key: digest allowed with no contact email (`:72`, `:149`; plausible), no "Saving..." label (`:180`), `beforeunload` without `returnValue` (`:42`; weak), heading "Store" too short (`:62`; polish). |

### Conclusion

Blind, the skill adds detection as well as format. In the earlier, rubric-visible baseline run, all 8 seeds were found by substance. Without the rubric, the baseline missed CTL-002, an obvious seed. That is the pattern the rulebook names: a Switch reads as normal UI unless the reviewer knows the instant-apply versus Save-form rule. The format gap is unchanged. The baseline has no IDs, no exits and no countable coverage, so it fails strict scoring on structure alone. With the skill, severities follow rule confidence (CTL-010 and HLP-006 `major`, STA-004 and BRD-010 capped at `minor`), and the count fix from Closed item 1 holds (`findings` matches the IDs, plus a `rows:` line). The run fails strictly on only one item, and that item is a rubric that disagrees with the skill's own Not applicable rule.

### New problems and exits

1. **Rubric contradicts the skill on Not applicable.** The skill (Closed fix 2) sends "the product has it but the files are not in the target" to Not checkable. The Prompt 1 rubric still requires HOM, IDX, DET, AI, ONB and INT under Not applicable, and accepts either list only for nav, chrome and branding. The run also used Not checkable for areas whose existence is unknown (AI, INT, ONB: "whether ... not in the target"). Exit: **fix now** (rubric, not the skill). In `evals/review/prompts.md`, Prompt 1, Structure, accept either list for every area a single settings file cannot show, when a reason is given. Re-score this run after the change: it becomes a strict Pass.
2. **Same defect cited twice.** Row 11 (HLP-001) repeats the currency description that row 5 (HLP-002) already covers. Exit: **file as task.** Add to the static-audit guidance: a place already cited under one rule is cited under another rule as "also" in the same row, not as a new row.
3. **SAV-004 graded `blocker`, key says `major`.** Exit: **reject with rationale.** The rubric scores severity only for SAV-006. The skill defines `blocker` as data loss, and the run states the data-loss path (Discard clears the dirty flag, and the next Save writes defaults over real settings). In `ANSWER_KEY.md`, accept `blocker` or `major` for seed 6 when the next key edit happens.
4. **Baseline extras not in the key.** "Digest allowed with no contact email" (`:72`, `:149`) is plausible; `returnValue` (`:42`) is weak, because modern browsers prompt on `preventDefault()`. Exit: **verify with a test.** Run `/dash:review` blind once more. Add the digest-email item to the valid unseeded list only if the skill run finds it too, or if a rule covers it.
5. **Prompt 2 not re-run blind.** The prompt 2 baseline substance score (7 / 7) still comes from a rubric-visible run. Exit: **verify with a test.** Run the prompt 2 "without" baseline blind before quoting it.

Closed after the blind rerun: #1 applied to `prompts.md` (either list accepted for areas not in the target). #2 filed in ROADMAP.md. #4 and #5 stay "verify with a test".
