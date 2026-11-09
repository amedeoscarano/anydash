# /dash:review eval prompts

Two blind prompts for `/dash:review` (`dash-review` outside Claude Code). Each one has a fixture, a prompt and a rubric. The answer key is [ANSWER_KEY.md](ANSWER_KEY.md). The run on `examples/flawed-dashboard` is scored separately in [RESULTS.md](RESULTS.md).

## How to run

1. Copy the fixture folder into a fresh scratch directory. Copy only the fixture: never `evals/`, `ANSWER_KEY.md` or this file.
2. Start a new session in that directory with the anydash plugin installed. Paste the prompt verbatim.
3. Give the resulting `dash-review/findings.md` and the chat summary to a separate scoring agent, together with the rubric below and `ANSWER_KEY.md`.

The fixtures are small and synthetic. They are not meant to build or run.

## Prompt 1: a React settings page

Fixture: `fixtures/settings-page/` (one Next.js settings page, `app/settings/store/page.jsx`, and a `package.json` for stack detection).

Prompt, verbatim:

> Run /dash:review on this folder. It is one settings page from a Next.js admin built with shadcn/ui and react-hook-form. The rest of the app is not included. Review what is here and write the findings file.

### Rubric

A good answer must contain all of the following.

**Structure**

- [ ] `dash-review/findings.md` exists, with a header naming the target, the input kind (code), the stack (Next.js, React, shadcn/ui, react-hook-form) and the date.
- [ ] One coverage line in the form `rules: <total> | findings: <n> | passed: <n> | not applicable: <n> | not checked: <n>`, and the parts add up to the total.
- [ ] One findings table with the columns `# | Severity | Rule | Where | Evidence | Recommendation | Exit`, sorted by severity, then area.
- [ ] Every row has a rule ID (or "no rule" with a reason), a `path:line` in `app/settings/store/page.jsx`, verbatim code as evidence, and exactly one exit: `fix now`, `file as task`, `reject with rationale` or `verify with a test`.
- [ ] `## Do not build` exists (it may say there is nothing to list).
- [ ] `## Not checked` exists, split into "Not checkable statically" and "Not applicable", each with reasons. The areas that a single settings file cannot show (home, index, detail, AI assistant, onboarding, integrations, branding) go in either list (Not applicable, or Not checkable with "not in the target") when the reason is given. Root-level checks such as FDB-008 sit in Not checked, not in the table.
- [ ] The chat summary gives the coverage line, one line per blocker and major, and the next step.

**Must find: obvious (all 5 required)**

- [ ] CTL-002 (or CTL-001): the `<Switch id="autoArchive">` inside the Save form, `page.jsx:106`.
- [ ] SAV-006, severity `blocker`: "Delete store" in the save bar, no dialog, no consequence, `page.jsx:174`.
- [ ] HLP-002 (or HLP-003, HLP-001): the currency consequence only in a `title` tooltip, `page.jsx:81`.
- [ ] FDB-003 (or FDB-001): save errors only as `toast.error("Invalid input")`, no field error or `aria-invalid`, `page.jsx:54`.
- [ ] CTL-007: "Free shipping threshold" as `type="text"` with `"$50.00"` in the value and no min, max or step, `page.jsx:99`.

**Must find: subtle (2 of 3 required, 3 of 3 is the target)**

- [ ] SAV-004: Discard calls `reset(DEFAULTS)` instead of restoring the last saved values, `page.jsx:177`.
- [ ] CTL-010: "Digest day" stays editable while the digest checkbox is off, `page.jsx:154-160`.
- [ ] HLP-006: the SMS checkbox is disabled by plan with no reason or unlock path shown, `page.jsx:133`.

**Must not**

- [ ] No more than 3 false positives. Flagging SAV-001, SAV-005, HLP-001 on described fields, or CTL-001 on the notification checkboxes counts as a false positive.
- [ ] No low-confidence rule above `minor`.
- [ ] No finding about 390 px layout, contrast or network behaviour written as fact from reading the code; those belong in Not checked.

Pass: all structure items, 5 / 5 obvious, at least 2 / 3 subtle, and the "Must not" items hold.

## Prompt 2: a dash-spec folder with planted mistakes

Fixture: `fixtures/planted-spec/` (a `dash-spec/` folder as written by `/dash:build`, approval pending, no code).

Prompt, verbatim:

> Run /dash:review on this folder. It holds the dash-spec for a small order and shipping admin. No code has been written yet. Review the spec before we approve it.

### Rubric

A good answer must contain all of the following.

**Structure**

- [ ] `dash-review/findings.md` exists, with a header that names the input kind as a spec (`dash-spec/index.md` found) and says no code was reviewed.
- [ ] The coverage line is present and adds up.
- [ ] The same findings table as Prompt 1. `Where` points to a spec file and line (for example `dash-spec/ia.md:6`), and the evidence quotes the spec text verbatim.
- [ ] Findings that span files cite both places, for example the menu line in `ia.md` and the inventory row in `inventory.md`.
- [ ] `## Do not build` lists at least the notification bell (CHR-009) and the settings overview of cards (SET-006), each with its reason.
- [ ] `## Not checked` exists. Rules that need code or a running app (contrast, 390 px layout, focus order, live regions in the DOM) are listed there with a reason, not in the table.
- [ ] The chat summary gives the coverage line, the blockers and majors, and a next step that fits a spec under review (change the spec before approval, not "fix the code").

**Must find (6 of 7 required, SAV-006 and CTL-002 among them; 7 of 7 is the target)**

- [ ] SET-001 (or NAV-001, INT-011): "Carrier accounts" in the main menu at `ia.md:6`, while `inventory.md:8` marks it as rare config.
- [ ] SET-006: the Settings entry opens an overview of cards, `ia.md:15`.
- [ ] CTL-002 (or CTL-001): "Archive orders after delivery" as a Switch, `controls.md:10`, in a page committed by Save, `controls.md:15`.
- [ ] HLP-002 (or HLP-003, HLP-001): the currency consequence only in a tooltip, `controls.md:9`.
- [ ] SAV-006, severity `blocker`: "Delete order" next to "Edit order", default style, no dialog, `pages.md:15`.
- [ ] IDX-011: one empty template for no data and no match on a searchable Orders list, `states.md:6`.
- [ ] CHR-009: a bell backed by toast history while `inventory.md:13` says nothing is stored, `ia.md:24`.

**Bonus (scored, not required)**

- [ ] Says that `decisions.md` cites rules that contradict its own decisions (CTL-002, CHR-009, HLP-003, NAV-001 at `decisions.md:6-10`).
- [ ] Says that the Do not build list in `index.md` misses the bell and the settings overview.

**Must not**

- [ ] No more than 3 false positives. Flagging HOM-001, STA-003, STA-004, STA-006, FDB-003, FDB-004, FDB-008, SAV-001, SAV-004, SAV-005 or ONB-001 counts as a false positive: the spec covers them.
- [ ] No finding that claims to have read code or run the app.
- [ ] No low-confidence rule above `minor`.

Pass: all structure items, the "Must find" threshold, and the "Must not" items hold.
