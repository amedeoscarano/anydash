# /dash:build eval results (v0.1)

Four runs: each prompt in [`prompts.md`](prompts.md), once with the skill (`with`: `skills/build/SKILL.md` plus the sibling skills it names) and once without it (`without`: the bare model, the brief only). Every run used `--plan` and was non-interactive.

Scoring method: one judge read each `dash-spec/` folder against its rubric. Rule IDs were checked by searching each expected file, and decisions were spot-read in the files the rubric names. A decision with no rule ID counts as half a hit (prompts.md, Scoring).

## Scores

| Prompt | Mode | Rubric score | Key differences |
|---|---|---|---|
| 1 Invoicing, `--plan` | with | **Pass.** Required 7/7. Must-find 18/18 (target 14). | Nine files. Every decision row cites rule IDs or "no rule yet" and names a rejected alternative. ONB-001/002 are labelled "suggestion". Ten open questions. "Do not build" has 12 rows with rule IDs. Products and services is in Settings. About 312 s, 17 tool calls, about 11,600 words. |
| 1 Invoicing, `--plan` | without | **Fail.** R3 (no rule IDs in "Do not build"), R5 (no rule IDs in decisions) and R6 (no "suggestion" labels) fail. Must-find 9/18: all 18 decisions are made, each at half credit. | Most product decisions match the `with` run: no bell, no wizard, Settings opens a page, assistant only drafts, two-column customer page, late fee checkbox, void confirmed, Pro item locked in place. Products and services sits in the main menu, but R4 counts it as config. Invoices has an outstanding/overdue summary strip. About 70 s, 2 tool calls, about 2,800 words. |
| 2 Returns, `--plan --stack swiftui` | with | **Pass.** Required 7/7. Must-find 17/17 (target 13), with two items flagged (below). | Nine files. Uses only SwiftUI terms: `NavigationSplitView`, `.searchable`, the `Settings` scene, `.confirmationDialog`, `ContentUnavailableView`, `.redacted(reason: .placeholder)`. Writes the background-upload copy (SAV-009, FDB-004). iPad booleans become summary rows (SAV-003). 14 open questions. About 400 s, 18 tool calls, about 13,400 words. |
| 2 Returns, `--plan --stack swiftui` | without | **Fail.** R1 (one `SPEC.md`, not nine files), R4 ("Do not build" has no reasons or rule IDs) and R6 (no rule IDs) fail. Must-find 8.5/17: 17 decisions, each at half credit. | The same core decisions in SwiftUI terms. It adds an offline queue at the dock, which the `with` run left as an open question. It has no feedback copy for background uploads, and its decisions log has no rule column. About 37 s, 2 tool calls, about 1,300 words. |

Flagged in 2/with:

- Must-find 2: no Reports item in the sidebar. The brief lists no Reports object. The spec logs reports as open question 12 ("a Reports area, never the landing page"). Scored as a hit.
- Must-find 10: Delete return is the last item in the header "More actions" menu, with `.confirmationDialog` and a stated consequence. There is no "danger zone", and the spec logs this as a DET-012 exception. It stands apart from Approve refund, so it is scored as a hit.

## What the skill added

1. **Traceability.** Every decision cites a rule ID, or "no rule yet" with an exception. A reviewer can check a decision against `rules/` instead of trusting it. This is the main gap in the scores: both `without` runs made nearly every expected decision, but cited no rule.
2. **Fixed structure.** It writes the nine-file `dash-spec/` layout with the inventory columns the rubric names. In prompt 2, the `without` run fell back to one file.
3. **Confidence labels.** Low-confidence onboarding rules are marked "suggestion". Without the skill, rules carry no confidence level.
4. **Some content changes:**
   - Config objects stay out of the main menu. Products and services goes to Settings; the `without` run put it in the menu.
   - States are a matrix per region, nested regions included, with exact copy.
   - Feedback is an event table. It covers background uploads and failures kept on the object (FDB-004).
   - iPad booleans become summary rows (SAV-003).
   - Help is in the chrome (CHR-011).
   - Open questions are fuller: 10 and 14 against 7 and 6.

## Where the skill did worse or was too verbose

- **Cost.** It took 4 to 11 times the wall time (312 s against 70 s; 400 s against 37 s). It made 17 to 18 tool calls, mostly reads of 18 sibling `SKILL.md` files.
- **Length.** The specs are about 4 to 10 times longer: about 11,600 and 13,400 words. `controls.md` and `pages.md` alone run 2,000 to 2,400 words each. That is a lot to read before the approval gate.
- **The rubric mostly measures the skill's own format.** Its Required items check file names, columns, rule-ID citations and labels. A bare model fails those by construction. On product decisions alone, the `without` runs made about 17 of 18 and about 16 of 17 of the right calls. The real gain on decisions is small: the placement of config objects, and the states and feedback detail.
- **One choice goes against the platform default.** On macOS, the 2/with Return policy uses an editor window with Save and checkbox toggles. Instant `Settings` panes are the macOS default. The spec logs the choice, and the rubric allows it.
- **The `with` runs make speculative assumptions.** For example, 1/with assumes the assistant ships on both plans, and assumes a late-fee range of 0.5 to 25 %. Both are marked assumed, but they add questions the brief never raised.

## Problems and dispositions

| # | Problem | Disposition |
|---|---|---|
| 1 | The runs were not blind. The runner prompts contained the rubric text, and each runner knew its mode. Every run said so. The `with` scores may be inflated. | **Verify with a test.** Rerun all four runs with only the prompt and the brief. Send each `dash-spec/` to a separate scoring agent that has not seen the run, as prompts.md step 5 says. Keep these results only until then. |
| 2 | The specs are too long for an approval gate (about 12,000 to 13,000 words). | **Fix now.** Add to `skills/build/SKILL.md`, in the step that writes `dash-spec/`: "Budget: `index.md` fits one screen (at most about 600 words). Every other file is tables first, with at most one sentence of prose per section. Cite a rule ID; never restate the rule's text. Target under 6,000 words for the whole folder. Put detail a reviewer does not need for approval into the table cells, not into paragraphs." |
| 3 | A run reads 18 sibling `SKILL.md` files, which costs time and tool calls. | **File as task.** Generate one condensed digest for `build`: the Procedure and Output sections of each sibling skill, plus the rule IDs and their confidence levels. Load it in one read. Compare the wall time and the score against this baseline. |
| 4 | The rubric measures format more than design quality. A bare model gets about half the must-find score with nearly the same decisions. | **File as task.** Add must-find items for decisions a bare model got wrong here: config objects such as Products kept out of the main menu (SET-001), no KPI strip above a queue (HOM-001), and background-work feedback (FDB-004). Also report a "decision-only" score, without the citation weighting, next to the rubric score. |
| 5 | Rubric 2, must-find 2 expects Reports in the sidebar, but the returns brief has no Reports object. | **Fix now (eval, not skill).** In `prompts.md` Rubric 2 item 2, change "Restock and Reports later" to "Restock later; Reports only if the brief or an open question adds it". No `SKILL.md` change. |
| 6 | Rubric 2, must-find 10 asks for a "danger zone at the end". The spec correctly puts Delete in a separate overflow menu, last, confirmed. | **Reject with rationale.** The rubric already says "stands apart" and accepts DET-012 as an alternative, and the spec logs the DET-012 exception. An overflow menu meets SAV-006. Optional rubric wording: "danger zone at the end, or last in a separate overflow menu". |
| 7 | The macOS Return policy uses an editor window with Save, not the instant `Settings` pane that macOS uses by default. | **Verify with a test.** Add a SwiftUI fixture where a macOS settings pane holds only booleans. Check that `build` picks instant `Toggle` panes there (CTL-002). If it picks Save again, add one line to the SwiftUI notes in `skills/build/SKILL.md`: "macOS `Settings` panes apply at once by default. Use an editor with Save only when the pane mixes values that must be checked together, and log why." |
| 8 | The `with` runs add assumptions the brief does not raise, such as assistant plan availability and the late-fee range. | **Reject with rationale.** Each one is marked "assumed" and listed as an open question, which is what Input step 3 requires. Asking is cheaper than guessing silently. Item 2's length budget will hold the list down. |
| 9 | STA-004 is cited only as "STA-004 exception" in `states.md`, without the "suggestion" label. | **Reject with rationale.** R6 asks for the label "where cited" as a rule applied. An exception note does not apply the rule. |

## Verdict

The skill passes both rubrics with full must-find scores. The bare model fails both on the Required items, but makes nearly the same product decisions. The skill's value in v0.1 is traceable, structured, reviewable specs. Its cost is 4 to 11 times the time and about 4 to 10 times the length. Fix item 2 before the release. Treat the scores as provisional until the blind rerun in item 1.

## Closed

- Item 2 (length budget): applied. `skills/build/SKILL.md`, Output section, after the file table: the budget paragraph as written in item 2.
- Item 5 (Reports in rubric 2): applied. `evals/build/prompts.md` Rubric 2 item 2 now reads "Restock later; Reports only if the brief or an open question adds it".
- Items 3 and 4 (file as task): added to `ROADMAP.md` under "From v0.1 evals".

## Blind rerun (2026-10-28)

Prompt 1 only (invoicing, `--plan`). Each runner saw only the prompt and the brief, not the rubric. A separate judge scored the files. Strict score: the rubric read literally (a decision without a rule ID is half a hit). Semantic score: the same items scored on substance, regardless of rule IDs.

| Mode | Strict score | Semantic score | Notes |
|---|---|---|---|
| with | **Fail.** Required 4/7 (R3, R4, R5 fail). Must-find 17.5/18. | Required 6/7 (R4 disputed). Must-find 18/18. | Nine files, no code. All 143 cited rule IDs exist in `rules/`. "Do not build" has 12 rows with rule IDs. ONB-001, ONB-002 and STA-004 are labelled "suggestion". Literal R3 fail: the open questions omit Customers frequency, the end customer and billing in product. The brief states all three, and `inventory.md` records them with "brief" as the source. R4 fail: Products and services is `work` and sits in the main menu. R5 fail: the last two rows of `decisions.md` are section-applicability notes with no rule ID and no rejected alternative. Must-find 12 is half: the Void confirm says "can't be undone" and "payment link stops working", but does not say the customer is notified. Must-find 8: notes are in the main column, not the side column. Payments is in the main menu too, as the 5th item. Size: about 9,800 words by `wc -w` (the runner reports about 7,200 without table pipes), above the 6,000 target. `index.md` is about 540 words. The runner skipped the rule-library self-check. |
| without | **Fail.** Required 2/7 (R1, R3, R4, R5, R6 fail). Must-find 5.5/18. Fail-on is probably triggered: late fees use a "yes/no toggle" in a form with one Save. | Must-find 12.5/18. | One `PLAN.md` file, about 1,450 words. It declines all six wishes, with an alternative for each. It hides controls from Viewers instead of fading them (misses 14, against VIS-006). No checkbox gating and no unit for the late fee (misses 10). No save bar (misses 11). Void is not set apart from the other actions (half on 12). No global search and no help entry (half on 17). No no-match state (half on 18). Some points beat the `with` run: Payments is kept out of the main menu ("nobody works this list"), money is stored as integer minor units, and the plan has a build order. It also asks whether a late fee applies on the due date or with the next reminder. The `with` run assumed a 1 to 90 days field instead. |

### What the skill adds when the runner cannot see the rubric

The blind run confirms the v0.1 result on substance. The `with` run makes every must-find decision, and its 143 rule citations are all real. The bare model makes about two thirds of them (12.5/18 semantic). It misses the control-level decisions: checkbox gating, units, the sticky save bar, faded controls with a reason for locked roles, and region states with no-match copy. It also likely uses a switch in a Save form. Those control and state details are what the skill adds, along with rule traceability and the nine-file structure.

Two v0.1 claims do not hold. First, the strict "Pass, Required 7/7" depended on seeing the rubric. Blind, the `with` run fails three Required items on literal wording, and none of the three is a wrong design decision. Second, "config objects stay out of the main menu (Products to Settings)" is not reproduced. The blind `with` run puts Products, and also Payments, in the main menu, as the bare model did. The length budget added after v0.1 kept `index.md` short. The folder as a whole is still over the 6,000-word target.

### New problems and dispositions

| # | Problem | Disposition |
|---|---|---|
| 10 | Rubric 1, R3 requires open questions for Customers frequency, the end customer and billing in product. The brief states all three, so a blind run correctly records them as sourced rather than assumed. | **Fix now (eval, not skill).** Change R3 to: "open questions list every assumed value that the brief does not state (at least the roles detail and Reports frequency); values the brief states are recorded in `inventory.md` with their source." Rescore R3 as a pass after that. |
| 11 | The blind `with` run makes Products and services `work` and puts it in the main menu. It also puts Payments there. This fails R4 and contradicts the "config out of the menu" gain claimed in v0.1. It is not yet clear whether this is run-to-run variance or an open SET-001/SET-002 tie. | **Verify with a test.** Run prompt 1 blind three more times with the skill. If Products is placed differently across runs, add a tie-breaker to the rule library (a separate task). If it is always `work`, decide whether R4 or the rule is wrong. Until then, mark the v0.1 "What the skill added" item 4 (Products) as unconfirmed. |
| 12 | `decisions.md` ends with section-applicability rows ("AI assistant section: not applicable"). They have no rule ID and no rejected alternative, so R5 fails on literal wording. | **File as task.** Move section applicability out of the decisions table into its own line in the `decisions.md` template. Until then, score R5 on decision rows only. |
| 13 | The folder is about 9,800 words by `wc -w` (about 7,200 without pipes). The 6,000-word budget applied after v0.1 still overshoots. `controls.md` and `pages.md` are the largest files. | **Verify with a test.** Add `wc -w dash-spec/*.md` to the scoring step and log it for each run. Change the budget only after three blind runs show it is always exceeded. |
| 14 | The runner skipped the rule-library self-check. | **Reject with rationale.** In this run every cited ID exists in `rules/`, and the low-confidence labels are present. Nothing went wrong. Revisit if a later run cites an unknown ID: problem 13's scoring step can also check IDs with `comm` against `rules/`. |
| 15 | Must-find 12 expects the Void confirm to say "the customer is notified". The brief never says that voiding emails the customer. The spec states the customer-facing consequence instead ("payment link stops working"). | **Reject with rationale.** The rubric asks for a fact the brief does not contain. Optional wording for the rubric: "states the customer-facing consequence and that it cannot be undone". |
| 16 | Must-find 8 expects notes in the side column. The spec puts them in the main column, with invoices, and has no tabs. | **Reject with rationale.** The decision being tested is "no tabs, one two-column record" (DET-007), and the spec makes it. Where the notes go is an example, not a rule. |

Closed after the blind rerun: #10 applied to `prompts.md` R3. #11, #13 stay "verify with a test"; #12 filed in ROADMAP.md.
