---
name: friction
description: >-
  Measures where one real workflow in a web dashboard loses time - records a person doing it with session-recorder, runs friction-analysis to split it into steps, compare each step with a KLM baseline and flag rage clicks, dead clicks, back-navigation, search used as a fallback, field corrections, validation errors, idle modals and slow requests - then reads the frames of the top bottlenecks and writes a report with rule-linked suggestions and the seconds each would save. Also compares a before and an after recording. Use when the user asks why a task takes so long, where users get lost, wants to time a workflow, or wants proof that a redesign made a task faster. Do not use it for a rule audit of a page (use /dash:review-live), without a human or a script to drive the workflow, on a production host in own-app mode, or to record anyone without their knowledge.
disable-model-invocation: true
argument-hint: "\"<workflow>\" [url] [--success <condition>]"
context: fork
---

# Find the friction in a workflow

Time one workflow as a person really does it, find the steps that cost the most time over a keystroke-level baseline, and link each one to the rule it most likely breaks. The command orchestrates two sibling skills: session-recorder captures the session, friction-analysis turns it into numbers. The command runs in a forked context and returns a short summary.

## Input

- `"<workflow>"`: the task in the user's words, one sentence ("change the default package weight").
- `[url]`: the start page. Without it, look for a running dev server (the `dev` script in `package.json` and its port) and ask the user to confirm. Do not start a server on a port the user did not name.
- `[--success <condition>]`: how the recorder knows the task is done, a CSS selector (`[role=status]`) or `url:<substring>`. Optional; without it the human presses Enter.
- `--compare <dirA> <dirB>`: before/after mode on two existing recordings. No new recording.
- `--script <steps.json>`: scripted mode for tests and evals (own-app only).

## Output

The recording folder, `<project>/recordings/<timestamp>/` by default (`<project>` = the user's project root, never the skill folder), which holds:

- `events.ndjson`, `network.ndjson`, `video/*.webm`, `trace.zip`, `meta.json` from session-recorder.
- `friction.json`, `friction.md` and `frames/*.png` from friction-analysis.
- `report.md`, written by this command:
  1. Header: workflow, URL, mode (own-app or read-only), date, total time, baseline time, total delay, success matched or not.
  2. The step table from `friction.md` (step, screen, actual s, baseline s, delay s, signals), unchanged.
  3. `## Top bottlenecks`: up to five, ranked by delay. For each: what the frame shows, the signals, and what the person was most likely looking for.
  4. `## Suggestions`, one table:

| # | Step | Rule | Change | Est. saved s | Exit |
|---|---|---|---|---|---|

   - Rule: a rule ID from `references/rules.md`, or "no rule" plus the reason.
   - Est. saved s: at most the delay of that step; never more than the step took.
   - Exit: exactly one of `fix now`, `file as task`, `reject with rationale`, `verify with a test`.
  5. `## Not measured`: signals that could not be computed and why (no video, no ffmpeg, read-only mode skipped typing).

In compare mode, `report.md` holds the before/after table from `analyze.mjs --compare` and one line per suggestion saying whether its step got faster.

## Procedure

Siblings are `/dash:<name>` in Claude Code and `dash-<name>` elsewhere; read each one's `SKILL.md` (`../session-recorder/SKILL.md`, `../friction-analysis/SKILL.md`). Run their scripts by absolute path from the user's project root, and pass absolute folder paths, so recordings never land inside the plugin folder. If session-recorder is missing, or Node 20+, `playwright-core` 1.62.1 or Google Chrome is missing, say which and stop: there is no fallback recorder. If friction-analysis is missing, stop after the recording and hand over the folder.

1. **Host and mode.** Own-app mode only on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test`, or the staging host in `DASH_ALLOW_HOST` that the user named in chat. Never own-app on production. Any other host: read-only mode (`--readonly`); `--script` is refused there. If unsure whether a host is production, treat it as third-party.
2. **Explain to the human.** Say, before anything opens:
   - A Chrome window opens with a separate recorder profile, not their normal one; they may need to log in once.
   - They do the workflow as they normally would, without hurrying and without narrating.
   - They press Enter in the terminal when done (or it stops when the success condition matches).
   - Typed values are masked in the logs, but the video and trace show the screen; everything stays on this machine.
   - Read-only mode: repeat the read-only rules the recorder prints (navigate only; never Save, Create, Delete, Connect, Install or Buy; type only in global search).
   Wait for the human to say they are ready.
3. **Record.** First make sure `recordings/` is in the project's `.gitignore`; if not, ask to add it. Then, from the project root:
   `node <session-recorder>/scripts/record.mjs <url> <project>/recordings/<timestamp> [--success "<condition>"] [--readonly] [--script steps.json]`
   Then check `meta.json`: it exists, `stopReason` is expected, `events.ndjson` has `click` and `navigation` lines. A `script-error` stop or an empty log ends the command with that reason.
4. **Analyse.**
   `node <friction-analysis>/scripts/analyze.mjs <outdir> --frames`
   It writes `friction.json`, `friction.md` and one frame per top-5 bottleneck in `frames/`. Without ffmpeg it still writes the JSON and Markdown; list the frames under Not measured. Thresholds are the defaults in `../friction-analysis/references/thresholds.json`; on the first real recording of an app, say they are uncalibrated.
5. **Read the frames.** Open each `frames/*.png` as an image. Name what is on screen at the bottleneck: which menu is open, which label was clicked, what the search box holds. Check the frame against the signals; when they disagree, trust the events and say so.
6. **Link to rules.** For each bottleneck pick the one rule it most likely breaks, from the signal and the frame:
   - Wrong menu, back-navigation, pointer wandering over the nav: NAV-002 (the menu item is not a noun for the object or area inside), SET-007 (mixed grouping), SET-002 or SET-003 (setting lives far from its object).
   - Dead clicks on a settings value: SET-010 (the value is not shown as the live control or as a summary row). On a field label: CTL-009 (the control does not take its name from that label). Anywhere else (a table header, a heading): pick the rule from the frame, or "no rule".
   - Search used as a fallback: the placement rule the person missed (NAV-002, SET-007); add SET-012 when the search did not find the setting by its name.
   - Long scroll then reverse: SET-007 on a settings page; NAV-005 when the scroll was in a long menu.
   - Field corrections and validation errors: CTL-007 (unit inside the value), HLP-001 (non-obvious effect), FDB-003 (error not under the field).
   - Rage clicks, or no feedback after a commit: STA-003 (no progress shown in place), SAV-002 (an instant control with no confirming toast), FDB-001.
   - Modal opened and closed with no action: FDB-007.
   - Slow request on the critical path: SAV-009 when the job is long; otherwise "no rule" (performance).
   - Long wait before the first action on a screen: NAV-002, MCP-007 (a term the person did not recognise), HLP-001.
   Read the rule in `references/rules.md` before citing it; respect its exceptions and confidence. Low-confidence rules are suggestions.
7. **Estimate savings.** Saved seconds = the step's delay minus what the fixed step would still cost over baseline (0 when the fix removes the detour). Round to 0.5 s. Never sum overlapping savings twice.
8. **Write `report.md`.** Close every suggestion with one exit. Detours with a clear rule get `fix now` or `file as task`; a suggestion the frame does not support gets `reject with rationale`; a fix that a scripted re-recording can confirm gets `verify with a test` (name the steps file).
9. **Clean up.** Offer to delete `video/`, `trace.zip` and `frames/`: they hold unmasked screen content. Keep the folder out of git (`recordings/` in `.gitignore`). Nothing is uploaded; never attach a recording to an issue or a chat. Never paste a frame with customer data into a public issue.
10. **Compare mode.** `node <friction-analysis>/scripts/analyze.mjs --compare <dirA> <dirB>`. Report total time before and after, per-step delay change, and signals that disappeared. One recording each side is an anecdote: say so, and suggest scripted re-recordings for a stable number.
11. **Return.** To the main context only: total time, baseline, delay, the top bottleneck in one line (`step, delay s, rule`), the path of `report.md`, and the deletion offer.

## Rules applied

- NAV-002 — menu items are short nouns for the object or area.
- NAV-005 — group and nest only when the menu is large.
- SET-002 — per-object configuration on the object.
- SET-003 — sub-area settings inside the sub-area.
- SET-007 — one grouping axis per settings level.
- SET-010 — current value visible without opening an editor.
- SET-012 — search across settings.
- CTL-007 — units outside the value.
- CTL-009 — every control has its own accessible name.
- HLP-001 — visible description for non-obvious settings.
- FDB-001 — one channel per kind of event.
- FDB-003 — field errors under the field.
- FDB-007 — modals only for decisions that must come first.
- SAV-002 — instant controls apply at once and confirm.
- STA-003 — loading placeholders in place and announced.
- SAV-009 — long jobs run in the background and say so.
- MCP-007 — one term per concept.

Full text: `references/rules.md`.

## Example

Good: `/dash:friction "change the default package weight" http://127.0.0.1:3100/ --success "url:/settings/packages?saved"`. The human opens Shipping, finds no weight, clicks the "Default weight: 1.2 kg" text twice on the Packages summary, goes back, and types "weight" in search. Total 48 s against a 9 s baseline. Top bottleneck: step 3, 21 s delay, signals `dead-click x2, back-nav, search-fallback`; the frame shows the value as plain text with no Edit button. Suggestion: `1 | 3 | SET-010 | Show the weight as an editable field with a "kg" suffix on Settings > Packages | 18 | fix now`, and `2 | 2 | NAV-002 | Rename "Shipping" in settings to "Shipping rates" and add "Packages" beside it | 6 | file as task`. The user deletes `video/` after reading.

Bad: recording the production admin in own-app mode because "it is our store"; starting the recorder before telling the human; a suggestion with no rule and no step; "save 30 s" on a step that took 12 s; committing `recordings/` with the video.

## Self-check

- [ ] Own-app mode ran only on an allowed host; read-only mode repeated the read-only rules.
- [ ] The human was told what is recorded and how to stop before Chrome opened.
- [ ] `meta.json` has the expected `stopReason`; `friction.json` and `friction.md` exist.
- [ ] Every frame was read as an image, or listed under Not measured.
- [ ] Every suggestion cites a step and a rule ID (or "no rule" with a reason) and has exactly one exit.
- [ ] No estimated saving exceeds its step's delay.
- [ ] The user was offered deletion of `video/`, `trace.zip` and `frames/`; `recordings/` is gitignored.
