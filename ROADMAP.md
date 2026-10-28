# Roadmap

Open work filed from reviews. Each line says where it came from.

## v0.2

- `/dash:friction` with `session-recorder` and `friction-analysis` (M4). `/dash:onboard` then measures time to first value on a real run instead of a KLM estimate.
- `/dash:clone`, `/dash:reconcile`, `/dash:learn` with `site-feature-mapper`, `api-surface-capture`, `api-ui-reconciliation`, `ui-pattern-mining` (M5).

## Rulebook gaps

- Permission denied by role: no rule yet in any studied portal (a gap in all three). `ui-states` and `/dash:build` log it as "no rule yet". Source: M2 review.
- Resuming a half-finished onboarding: no rule yet (a gap in all three). Source: Phase 2 comparison.
- HOM-001 `check_static` counts areas literally; it should count queues as `home-layout` defines them. Source: M2 dry run.
- Brand settings per store when one account runs several stores: `customer-branding` handles it as "no rule yet". Source: M2 dry run.
- DHL simplicity framework: fold in the owner interview (5 questions) when answered.

## Skill candidates

- A form-page specialist (create and edit flows). `/dash:build` covers them with the Form template and `save-model` for now. Source: M2 dry run.
- `/dash:compare`: the same task on our dashboard and on a reference portal.
- `/dash:copy`: microcopy and terminology audit.
- `/dash:a11y`: WCAG 2.2 AA audit.

## Review precision (from the first blind runs, see evals/review/RESULTS.md)

- `static-rule-audit`: do not extend CTL-002 to instant switches; treat a Save that stays disabled while clean as inactive for VIS-002; check FDB-008 only for regions present at load; accept per-region Retry for STA-004.
- `live-rule-audit`: ignore native browser behaviour (Escape clears `type=search`) for CHR-002.
- flawed-dashboard: fix the known unseeded issues listed in its answer key, or seed them as extra rows.

## From v0.1 evals

- `/dash:build`: one condensed digest of sibling Procedure and Output sections plus rule IDs and confidence, loaded in one read; compare time and score to the v0.1 baseline. Source: evals/build/RESULTS.md item 3.
- `/dash:build` eval: add must-find items for SET-001 (config out of the menu), HOM-001 (no KPI strip above a queue) and FDB-004, and report a decision-only score. Source: evals/build/RESULTS.md item 4.
- `/dash:onboard` eval: a fixture with less obvious traps (inferable-looking legal value, two starting paths for ONB-005, a redesign for ONB-009); score content apart from rule IDs. Source: evals/onboard/RESULTS.md item 8.
- `browser-adapter`: `{"colorScheme": "dark"}` step in `ownapp.mjs` with a test, then dark captures in polish step 2 and drop the dark-mode Not checked default. Source: evals/polish/RESULTS.md item 6.
- `/dash:polish` eval: write the canceled badge reference as "4.52 (4.53 from unrounded channels)" in `prompts.md`. Source: evals/polish/RESULTS.md item 8.
- Eval runner: run `npm ci` in the copy instead of symlinking `node_modules`, and write run outputs outside the copy. Source: evals/polish/RESULTS.md item 11.
- `/dash:review` eval: seeds that need the rulebook (low-confidence rule tempting `major`, Exceptions turning a hit into a pass, a 390 px or contrast issue for Not checked). Source: evals/review/RESULTS.md item 5.
- `/dash:states`: measure `states.md` length and tool calls across all prompts before cutting cell verbosity. Source: evals/states/RESULTS.md item 6.
- `/dash:states` eval: allow "the demo data source the gates read" in prompt 2 structure and require the report to list it. Source: evals/states/RESULTS.md item 7.
- All evals: add a semantic column to the scoring in each `prompts.md`, beside strict ID scoring. Source: evals/states/RESULTS.md item 8, evals/polish/RESULTS.md item 12.
- `/dash:build`: move section-applicability notes out of the `decisions.md` table into one line of their own (blind eval #12).
- `static-rule-audit`: cite one defect once; a second rule goes in the same row as "also" (blind eval #2).
- Evals: three more blind `/dash:build` runs to settle Products placement and the spec word budget; blind baseline for `/dash:review` prompt 2.

## From M4 (friction)

- `friction-analysis`: dead clicks off a settings page still map to SET-010 first; pick the rule from the clicked element's role and page type. The `/dash:friction` report corrects it after reading the frame. Source: evals/friction/RESULTS.md.
- Calibrate `references/thresholds.json` on the first human recording (all timing so far comes from scripted delays).
- The recorder's host allow-list is a copy of `ownapp.mjs`; keep the two in sync or share a module once skills can import siblings.

## From M5 (research)

- REA `analyze_web_bundle` closed the connection twice on the example app; `site-feature-mapper` notes it and goes on. Retest with the next REA version.
- `har-shapes.mjs`: a final path segment that varies fewer than 8 times stays literal; the skill asks for a manual `{id}` pass.
- Re-run the clone, reconcile and learn evals after the critic's changes.
