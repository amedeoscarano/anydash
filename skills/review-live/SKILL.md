---
name: review-live
description: >-
  Reviews a running admin dashboard against the whole rulebook - the static review of its code, then every check_live test in the browser through browser-adapter (save bar and leave guard, instant switch with a blocked request, live regions, focus order and visible focus, sidebar at 1440/1024/768/390, computed contrast, empty and error states), a visual audit, and a findability test where fresh subagents without code access must find each setting by its labels. Writes dash-review/findings.md with one table, a "Do not build" list and a "Not checked" list, plus dash-review/findability.md. Use when the user asks to review, QA or audit a dashboard that runs at a URL (localhost, a .test host or a named staging host), or asks whether users can find settings. Do not use it without a running app (use /dash:review), on a production host in own-app mode, or for visual fixes (use /dash:polish).
disable-model-invocation: true
argument-hint: "[url]"
context: fork
---

# Review a running dashboard

Run the full review: the static pass of /dash:review, then the live checks that only a running app can answer, then a findability test with users who have never seen the code. Everything ends in one findings table, where each row closes with one of four exits. The command runs in a forked context: it does the long work apart and returns a short summary.

## Input

`[url]`: the running app, for example `http://localhost:3100`. Without it, look for a running dev server (the `dev` script in `package.json` and its port) and ask the user to confirm the URL. Do not start a server on a port the user did not name.

- The code is the current directory when it holds the app. Without code (a third-party URL), the static pass is skipped and said so in the header.
- `dash-spec/` when present: the inventory and settings tree feed the findability test.
- Disposable test data the user named, for checks that create or delete.

## Output

`dash-review/findings.md` beside the reviewed repo root, or `./dash-review/findings.md`:

1. Header: URL, browser tool and mode, repo path or "no code", date, and the coverage line
   `rules: <total> | findings: <n> | passed: <n> | not applicable: <n> | not checked: <n> | live checks run: <n> | findability: <found>/<tested>`.
2. One table, sorted by severity, then area:

| # | Severity | Rule | Where | Evidence | Recommendation | Exit |
|---|---|---|---|---|---|---|

   - Severity: `blocker` (data loss, wrong commit, security, inaccessible core task), `major` (high or medium rule clearly violated), `minor` (polish, low-confidence rule), `note`. A low-confidence rule alone is never above `minor`.
   - Rule: rule ID, or "no rule" plus the reason. Where: `path:line` for static rows; `url @ viewport, step i` for live rows.
   - Evidence: the code line, or `[live]` and the failed assertion with the observed result. A live-only row says why static review could not see it.
   - Exit: exactly one of `fix now`, `file as task`, `reject with rationale`, `verify with a test`.
3. `## Do not build`: features and settings that add complexity without value, each with its reason and rule ID.
4. `## Not checked`: rule IDs that did not run, statically or live, each with the reason.

Also `dash-review/findability.md` (per-setting results) and the raw evidence under `dash-review/live/` and `dash-review/visual/`.

## Procedure

Specialist skills are siblings in this plugin: `/dash:<name>` in Claude Code, `dash-<name>` elsewhere. Read each one's `SKILL.md` in its folder (`../<name>/SKILL.md`) and follow its Procedure. browser-adapter is required for every live step; if it is missing, run only step 2 and list all live checks under Not checked. If another sibling is missing, apply its areas from `references/rules.md` directly.

1. **Target and mode.** Apply the browser-adapter skill: detect the browser tool in its order and set the mode from the host. Own-app on localhost, 127.0.0.1, [::1], `*.localhost`, `*.test` or a staging host the user named in chat; third-party-readonly elsewhere. Never own-app on production. State the tool and mode in the header.
2. **Static pass.** If the code is here, follow the review command (`../review/SKILL.md`) steps 1 to 7: map, inventory, static-rule-audit, design judgement by area, Do not build. Keep its rows and its "Not checkable statically" list. These are the first live targets.
3. **Discover live.** Run the discovery recipe of live-rule-audit: page URLs, sidebar names, fields with current values, switches with states. Match pages to routes from step 2.
4. **Live checks.** Apply the live-rule-audit skill. Order: first the rules in "Not checkable statically", then the live checks that confirm static `blocker` and `major` rows, then the rest of the applicable rules. Its recipes cover sidebar at four breakpoints (NAV-003, NAV-006, CHR-012), save bar and leave guard (SAV-001, SAV-005), switch with a blocked request (SAV-002), live regions (FDB-008), focus order and visible focus (WCAG, no rule ID), empty and error states (STA-001, STA-004, STA-006). In third-party-readonly mode, every check that types, saves, toggles or blocks is skipped and listed under Not checked.
5. **Visual audit.** Apply the visual-audit skill: screenshots at 1440, 1024, 768 and 390 px, computed styles, a contrast ratio for every text kind from `node scripts/contrast.mjs` in the visual-audit folder (VIS-003, VIS-004, VIS-009), the token audit table.
6. **Findability test.** Follow `../live-rule-audit/references/findability.md`:
   - Build the settings inventory from `dash-spec/`, else from the static map, else from the settings snapshots.
   - For each setting, write the task as a user goal without the exact label ("You want an email when a parcel could not be delivered. Find where to change that.").
   - Spawn one fresh subagent per setting (Task tool, or the host's equivalent). Give it only the goal, the start URL and the browser-adapter command. Tell it that it has no code access and must not read files; navigate by visible labels only; no typed URLs; no Save, Create or Delete.
   - It logs clicks, path, outcome (`found`, `wrong`, `gave_up`); you log wall-clock seconds. Own-app: up to 4 subagents at a time. Third-party: one at a time, one navigation per 5 to 10 seconds.
   - Score with the findability table: more than 3 clicks, search only, wrong or gave up become rows against the placement rule of that setting (for example SET-002, SET-003, SET-008), plus NAV-002 or SET-007 when several agents miss the same way.
7. **Merge.** One row per rule per cause.
   - A static row confirmed live: keep one row, add the `[live]` result to Evidence.
   - A static row about behaviour that the live check disproves (the `check_live` assertion passed): Exit `reject with rationale`, citing the live step.
   - A live-only row: say in Evidence why static review could not see it (the revert depends on the request outcome; the live region mounts late; focus is lost only after the drawer closes; contrast comes from computed variables).
   - Cap low-confidence rules at `minor`. Blockers get `fix now`. A live-only fault that a test can pin down gets `verify with a test` after the fix; name the test.
8. **Not checked.** Union of what remained from the static pass and what the live and visual steps could not run, each with its reason (needs throttling, hover, an empty account, a script step; read-only mode; no code).
9. **Write and return.** Write the files. Return to the main context only: the coverage line, each blocker and major in one line (`#, rule, where`), the findability score, the paths of the written files, and the next step (fix the `fix now` rows; run /dash:polish for visual rows).

## Rules applied

- NAV-003 — collapsible icon rail with names.
- NAV-004 — exactly one active item.
- NAV-006 — drawer below 768 px.
- NAV-002 — noun labels (findability misses).
- CHR-012 — chrome survives narrow widths (low).
- SET-001 — work in the menu, configuration in settings.
- SET-002 — per-object configuration on the object.
- SET-007 — one grouping axis per settings level.
- SET-012 — search across settings.
- SAV-001 — save bar wakes on change.
- SAV-002 — instant change confirms and reverts on failure.
- SAV-005 — warn before leaving with unsaved changes.
- SAV-006 — destructive actions confirm.
- FDB-001 — one channel per kind of event.
- FDB-008 — live regions exist before messages.
- STA-001 — empty state with one action.
- STA-004 — failed region with Retry (low).
- STA-006 — not-found inside the shell.
- LAY-008 — no horizontal scroll at phone width.
- VIS-003 — badge contrast.
- VIS-004 — muted helper text still at 4.5:1.

Full text: `references/rules.md`. Frameworks: `references/frameworks/`.

## Example

Good: `/dash:review-live http://localhost:3100` on a shipping admin. The static pass finds a switch handler in `app/settings/notifications/form.tsx:42` that calls the API and toasts on success. Live recipe 3 blocks `**/api/**` and the switch stays on with no error. One row: `4 | major | SAV-002 | http://localhost:3100/settings/notifications @ 1440x900, step 12 | [live] request blocked, switch stayed checked, no message in any live region; static review saw the API call but not that the rejection path never restores the value | Restore the previous value in the catch branch and show an error toast with Retry | fix now`. Findability: 9 of 11 settings found within 3 clicks; "Packing slip logo" took 7 clicks through Integrations and Notifications before Branding: `9 | major | SET-007 | http://localhost:3100 @ 1440x900, findability: packing-slip-logo | [live] path Settings > Integrations > Notifications > Branding, 7 clicks, 96 s, found | Group customer-facing documents under one axis, Branding | file as task`. Not checked: `STA-003 (no throttling in the local driver)`.

Bad: the command clicks through the app, writes "the settings feel hard to find" with no task, clicks or time; reuses one subagent for every findability task so it learns the menu; runs own-app checks against the production admin because the user owns it; keeps a static SAV-002 row as `fix now` after the live check passed.

## Self-check

- [ ] Tool and mode are stated; own-app ran only on an allowed host.
- [ ] The static pass ran (or the header says "no code"), and its "Not checkable statically" rules were run first.
- [ ] Every live row has `url @ viewport, step i`, `[live]` evidence, and says why static could not see it when live-only.
- [ ] Every findability task used a fresh subagent with no code access and the goal in user words; clicks, seconds and outcome are logged.
- [ ] Every contrast ratio came from the contrast script, not an estimate.
- [ ] Every row has exactly one Exit; no low-confidence rule alone is above `minor`.
- [ ] `## Do not build` and `## Not checked` exist; every changed test value was restored.
