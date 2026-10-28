# /dash:onboard eval results

Four blind runs: each prompt in `prompts.md`, once with the anydash plugin ("with") and once without skills or rules ("without"). One judge scored every answer against the rubric. Each item is pass or fail.

Scoring notes:
- Prompt 1 has 30 must items and 4 should items. Prompt 2 has 16 must items (6 structure, 5 must-find, 4 correct non-findings, 1 labelling), plus 4 should-find items.
- Prompt 2 items that name a rule status (for example "HOM-001 `fail`", "cited as INT-004") count as pass only when the rule ID is cited. A content-only score is given alongside.
- No run hit a fail-on-sight item. No run started an app, signed up, edited app code or read `EXPECTED_FINDINGS.md`. A grep of all four `dash-spec/` folders found no email outside `example.com`. "Card ending 4242" and "EUR 6.40" in prompt 1 "with" are invented example values.

## Scores

| Prompt | Mode | Rubric score | Key differences |
|---|---|---|---|
| 1 (design from brief) | with | must 29/30, should 4/4 | All 8 onboarding-setup parts, the Connect and KLM tables with `Rule IDs`, decisions D1 rejects the wizard with ONB-001/ONB-002, and the `/dash:friction` v0.2 note. KLM rows and totals are correct (19.80 s to the first label, 10.55 s to the first order; wizard 167.35 s). One fail: the Feature onboarding, Prompts and Deferred tables have no per-row rule IDs. Those tables have no `Rule IDs` column in the onboarding-setup spec. 13.7k chars, 119 s, 5 tool calls. |
| 1 (design from brief) | without | must 21/30, should 3/4 | Design content is close to "with": same provisioning, connect step, Orders landing and confirm-before-billing; KLM correct (22.50 s). Structure fails: no rule IDs anywhere, `Notes` replaces `Rule IDs`, no Asked of the user or Deferred to settings parts, decisions without a rule ID. Content gaps: checklist has no single start link, no templates on Automation rules, failure warning does not name connection, impact and fix, no `/dash:friction` note, no INT-011 reasoning. 6.7k chars, about 90 s, 2 tool calls. |
| 2 (check flawed-dashboard) | with | must 15/16; must-find 5/5; should-find 4/4; false positives 0 (1 disputed) | Finds all 5 must-find issues with correct rule IDs and statuses, cites the 4 required files with line numbers, and marks ONB-004/008/009 and HOM-006 not applicable. Puts review issues out of scope. One fail: the "Home zeros before load" row has the status `handed off`, which the rubric does not allow. Disputed: INT-001 `fail`. Not in the rubric, but valid under the INT-001 rule text. About 2 min, 9 tool calls. |
| 2 (check flawed-dashboard) | without | must 7/16 strict (must-find 1/5 strict, 4/5 content); should-find 4/4 content; false positives 0 | Finds the same substance: no first-run code, Home landing, switch with no authorise or test, no detail page, copy contradicting the seeded `enabled: true`, shared empty branch. Every Rule IDs cell is `none`, so HOM-001, INT-004 and INT-003 cannot pass. Uses the statuses `n/a` and `fail (minor)`. The proposed onboarding is a flat list, not the 8 parts. Decisions have no rule IDs. A NAV-002-type naming issue ("Manage integrations" vs "Integrations") sits in the findings table, not out of scope. No `/dash:friction` note. 53 s, 5 tool calls. |

## What the skill added

- **Traceability.** Every design choice carries a rule ID, and decisions are recorded with the rule and the rejected alternative. The "without" runs reached most of the same design by common sense, but nothing ties it back to a rule.
- **Structure.** All 8 onboarding-setup parts, plus Connect and KLM tables with fixed columns, so two specs can be compared. Prompt 2 "with" also gives a full proposed onboarding after the findings.
- **Coverage the baseline missed:**
  - A failure warning that names the connection, the impact and the fix (INT-007).
  - A list row with linked account and actions (INT-001), and a detail page with tabs (INT-003).
  - Placement by what the integration adds (INT-011).
  - A checklist with "N of M complete", one start link and "Restart setup guide" (ONB-003, HOM-005, ONB-004).
  - Templates in empty states (ONB-007).
  - Explicit not-applicable reasoning for ONB-005 and ONB-009.
- **Honest measurement.** Both "with" runs say `/dash:friction` is not installed (v0.2) and that the number is a model estimate. Neither "without" run says this.
- **Scope discipline.** Prompt 2 "with" lists review findings (NAV-002, CTL-007, SAV-002, CHR-012) as out of scope. The baseline mixed a naming issue into its findings.

## Where the skill did worse or was too verbose

- **Status vocabulary.** Prompt 2 "with" used `handed off` as a status, which breaks the skill's own `pass | fail | missing` rule.
- **Inline labelling.** Both "with" runs rely on a legend at the top for low-confidence rules. ONB-006 still appears bare in the prompt 1 Connect and KLM tables and in prompt 2 first-run steps 3-4 and in the current-flow KLM row. Scored pass because of the legend, but only just.
- **Per-row rule IDs.** Prompt 1 "with" leaves three tables without per-row IDs. The cause is the onboarding-setup table spec, not the run.
- **Length and cost.** Prompt 1 "with" is about 2x the length of "without" (13.7k vs 6.7k chars) and about 1.3-2x the wall clock and tool calls. Most of the extra length is rubric-required parts and the per-row wizard KLM, a should item.
- **Wording.** In section 1 of prompt 1 "with", the line "The only step that is not a data entry is the confirm..." is loosely worded.
- **Skill example contradicts the procedure.** The SKILL.md Example ends with "The report suggests `/dash:friction` to time a real run", but `/dash:friction` is v0.2. Both runs followed step 10 correctly anyway.

## Problems and resolutions

1. **Status value outside `pass | fail | missing` (prompt 2 "with").** Fix now. In `skills/onboard/SKILL.md`, Output section, replace the last bullet with:
   > When checking an existing flow, a findings table first: `Step | Finding | Status | Rule IDs | Fix`. Status is only `pass`, `fail` or `missing`. A finding that belongs to another command (for example a loading state for `/dash:states`) is not a row. List it under the table in "Out of scope", with the command it goes to.

2. **Low-confidence rules labelled by legend, not inline.** Fix now. In `skills/onboard/SKILL.md`, Procedure preamble, replace "are low confidence: write them as suggestions." with:
   > are low confidence: write "(suggestion)" after the ID in every table cell and sentence where it appears, including KLM and Connect tables. A legend at the top does not replace this.

   In Self-check, replace "Low-confidence rules are labelled as suggestions." with:
   > Every occurrence of ONB-001, ONB-002, ONB-004, ONB-005, ONB-006, ONB-009, INT-005 and INT-008 is followed by "(suggestion)".

3. **Feature onboarding, Prompts and Deferred tables have no rule ID column.** Fix now. The change is in `skills/onboarding-setup/SKILL.md`, which onboard follows:
   - Part 6 becomes `Page | Empty-state heading | Primary action | Templates | Rule IDs`.
   - Part 7 becomes `Prompt | Optional or required | Dismissible | Retired when | Rule IDs`.
   - Part 8 becomes a table: `Preference | Default | Settings location | Rule IDs`.

   This makes the prompt 1 rule-ID item reachable.

4. **SKILL.md Example suggests `/dash:friction`, which v0.1 does not ship.** Fix now. In `skills/onboard/SKILL.md`, Example, replace "The report suggests `/dash:friction` to time a real run." with:
   > `/dash:friction` is not installed (v0.2), so the report says the 13.2 s is a model estimate only.

5. **INT-001 `fail` in prompt 2 "with" not expected by the rubric.** Reject with rationale. INT-001 in `rules.md` requires each row to show the linked account and settings or remove actions. The app's rows have only a name, a description and a switch, so the finding is correct and not a false positive. Optionally add it to prompt 2 should-find in `prompts.md`.

6. **Required setup block in prompt 1 "with" is not dismissible.** Reject with rationale. HOM-006 makes required work non-dismissible. The block is named by goal, shows progress, retires at M of M and keeps "Restart setup guide", so it meets ONB-003, HOM-005 and ONB-004. The HOM-001/ONB-003 exception applies only when no setup task remains, and here connect and the first label remain.

7. **"With" output is about 2x longer and slower.** Reject with rationale. The added length is the 8 rubric-required parts, the rule columns and the should-level wizard comparison. Cutting it would lose rubric items. Revisit if a later eval shows padding outside the required parts.

8. **The eval barely separates design quality: "without" reaches most of the content on both prompts.** File as task. Both fixtures spell out their problems: the brief names the nine-step wizard, and the app has obvious gaps. The rubric mostly rewards format and IDs. Add a fixture with less obvious traps and score content items apart from rule-ID items. Example traps: a value that looks inferable but is legal, two valid starting paths that need ONB-005 cards, and an existing-user redesign that needs ONB-009.

9. **Loose wording in prompt 1 "with", section 1.** Reject with rationale. It is a one-off phrasing in one run, not a skill instruction, and it costs no rubric item.

10. **Status and labelling fixes (1, 2) have no regression guard.** Verify with a test. After fixes 1-3 land, rerun prompt 2 "with" and prompt 1 "with". Then check:
    - Every Status cell matches `^(pass|fail|missing)$`.
    - No low-confidence ID appears without a following "(suggestion)".

    A grep over `dash-spec/onboarding.md` covers both checks.

## Closed

1. Status values: applied. `skills/onboard/SKILL.md` Output, last bullet replaced as written.
2. Inline "(suggestion)" labels: applied. Procedure preamble and Self-check in `skills/onboard/SKILL.md` replaced as written.
3. Rule ID columns: applied. `skills/onboarding-setup/SKILL.md` Output parts 6, 7 and 8 now carry `Rule IDs`; part 8 is a table.
4. `/dash:friction` in the Example: applied. `skills/onboard/SKILL.md` Example sentence replaced as written.
- Item 8 (file as task): added to `ROADMAP.md` under "From v0.1 evals".
