---
name: friction-analysis
description: >-
  Analyses one session-recorder folder and finds where a workflow loses time. Splits the session into screens and steps (one goal action each), times every step, compares it with a Keystroke-Level Model baseline, and flags rage clicks, dead clicks, back-navigation, pointer wandering over the menu, field corrections, re-sent forms, scroll-and-reverse hunting, search used as a fallback, modals closed with no action, slow requests and long pauses. Ranks bottlenecks by delay, extracts one video frame per bottleneck with ffmpeg, links each to the rule it most likely breaks with an estimated saving, and compares a before and an after recording. Deterministic. Use when a recording exists and someone asks why a task is slow, where users get lost, or whether a redesign helped; /dash:friction calls it. Do not use it without a recording (use session-recorder first), to audit a static page against rules (live-rule-audit), or as proof of a rule violation without looking at the frame.
---

# Friction analysis

Turn a recording of one workflow into a ranked list of bottlenecks: which step took longer than it should, what the person did there, and which rule the screen most likely breaks. The script does the counting; the agent reads the frames and writes the advice the numbers cannot give.

## Input

- A recording folder from session-recorder: `events.ndjson`, `network.ndjson`, `meta.json` and optionally `video/*.webm` (format: the events.md reference of session-recorder, schema 1). No `meta.json` means the recording is incomplete; the script refuses it.
- Optional thresholds file that overrides some of `references/thresholds.json`.
- For a comparison: two folders, before and after.

## Output

- `<dir>/friction.json`: screens, steps (time, KLM operators, baseline, delay, wait, signals), top bottlenecks with suggestion and frame path, totals.
- `<dir>/friction.md`: summary table (step, screen, actual s, baseline s, delay s, KLM operators, signals), top bottlenecks with signals, frame and rule-linked suggestion, notes.
- `<dir>/frames/step-NN.png` with `--frames`: one frame per top bottleneck.
- `<dirB>/friction-compare.json` and `.md` with `--compare`: totals, signal counts and per-step times, A against B.

## Procedure

1. **Check the folder.** `meta.json` exists and `meta.schema` is 1. Read `stopReason`: `script-error` or `closed` early means the workflow may be unfinished; say so in the report.
2. **Run the analysis.**
   `node scripts/analyze.mjs <dir> --frames [--thresholds my-thresholds.json]`
   Node 20+, no dependencies. `--frames` needs ffmpeg (on PATH or in `FFMPEG`). Without ffmpeg or without the video the script still writes both files and says why the frames are missing.
3. **How it segments.** A new screen starts at each navigation, or at a DOM change of 150 or more mutations in one 250 ms window away from a navigation. A step ends at a goal action: a click with a reaction on a button, link, menu item or tab, or a form submit (a submit right after its button click is one action). Clicks on plain text, and repeats in a rage cluster, never end a step.
4. **How it times.** For each step, the KLM baseline counts only productive actions: click M+P+B, typing in a field H + n*K (n = final length), select option +P+B, Enter/Tab/Escape K (K 0.2, P 1.1, B 0.1, H 0.4, M 1.35 s). The click the browser fires at (0, 0) on the submit button when Enter is pressed in a form ends the step but adds no M+P+B. Delay = actual - baseline. Bottlenecks are the steps with the largest positive delay, top 5.
5. **The signals** (defaults in `references/thresholds.json`):

   | Signal | Detected when | Likely rules |
   |---|---|---|
   | `rage` | 3 clicks within 1 s and 30 px | STA-003, SAV-002 |
   | `dead` | click on nothing interactive, or on a button/link, with no mutation, navigation or dialog within 1 s | SET-010 (settings values only; elsewhere pick the rule from the frame) |
   | `back` | navigation to a URL left less than 30 s ago | NAV-002, MCP-007 |
   | `wander` | pointer path over the nav region (x <= 260 or y <= 64) 2.5 times the straight line, 400 px or more | NAV-002, NAV-005 |
   | `correction` | 3 deletions in one field less than 1.5 s apart, or coming back to a field already typed in | CTL-007, FDB-003 |
   | `validation` | an `aria-invalid` field or a `role=alert` appears within 2 s of a goal action; for recordings without `validation` events, the same form or button sent again after edits within 30 s | FDB-003 |
   | `search-scroll` | 1500 px of scroll one way, then 300 px back | SET-007 |
   | `search-fallback` | search field focused after 2 or more dead clicks or back-navigations in 60 s | SET-012, NAV-002 |
   | `modal-no-action` | dialog opened and closed with only Close/Cancel/Esc or outside clicks | FDB-007 |
   | `slow-network` | document/fetch/xhr over 1 s with no user action while it was pending | STA-003, SAV-009 |
   | `long-wait` | more than 3 s from a new screen to the first click, key, input or scroll | HLP-001, SET-007 |

   Each bottleneck's suggestion takes its two strongest signals (count times weight) and their rules. Full rule text: `references/rules.md`. NAV-005 and MCP-007 are low-confidence rules: offer them as suggestions, not findings.
6. **Read the frames.** Open each `frames/step-NN.png` as an image. Each frame is taken at the first occurrence of the step's strongest signal (the first one in its suggestion), not at the screen load before it. Confirm that the screen matches the signal (the label clicked, the menu opened) before you keep the rule link; change it if the frame shows another cause. Frames run up to a few hundred ms late, because the video starts slightly after `meta.startMs`.
7. **Calibrate once.** On the first real recording of an app, compare the signals with the video. If a signal misfires (a polling page hides dead clicks, the sidebar is wider than 260 px), write only the keys that need to change to a JSON file and pass `--thresholds`. Say in the report which values you changed.
8. **Compare before and after.**
   `node scripts/analyze.mjs --compare <before> <after>`
   Report the change in total delay and in each signal count. Steps are matched by label; a renamed button shows as removed and added.
9. **Clean up.** The frames show the real screen. Do not paste them into public issues. Offer to delete `video/`, `trace.zip` and `frames/` once the report is written.

## Rules applied

- NAV-002 — menu items are short nouns for the object or area.
- NAV-005 — group and nest the menu only when it is large (low).
- MCP-007 — one term per concept across menu, title and settings (low).
- SET-007 — one grouping axis per settings level, headings past about 20 entries.
- SET-010 — the current value is visible without opening an editor.
- SET-012 — search finds settings by name.
- CTL-007 — units outside the value, min, max and step enforced.
- FDB-003 — field errors under the field, limits stated before typing.
- FDB-007 — modals only for decisions that must come first.
- STA-003 — loading placeholders in place and announced.
- SAV-002 — instant controls apply at once and confirm.
- SAV-009 — long jobs run in the background and say so.
- HLP-001 — visible description for non-obvious settings.

## Example

Good: a shipping admin, task "change the default package weight". `friction.md` ranks step 2, `Click link "Default package weight"`, first: 10.50 s against a 6.70 s baseline (+3.80 s). Signals: two dead clicks on the "Package weight" text, a back-navigation to `/`, then search as a fallback. The frame shows the Shipping page with "Package weight" as plain text and no value. Suggestion: show the current value as the live control or as a summary row with the value (SET-010) and rename the menu item the user followed (NAV-002), saving up to 3.8 s. After the fix, `--compare` shows total delay 3.80 s to 0.00 s and dead clicks 2 to 0.

Bad: reporting "NAV-002 violated" from the `back` signal alone, without opening the frame, when the frame shows the user went back to copy an order number. Calling a step with a negative delay a bottleneck. Treating the estimated saving as a measured result instead of an upper bound.

## Self-check

- [ ] `friction.json` and `friction.md` exist and the top bottleneck matches what the video shows.
- [ ] Every rule ID in the report comes from a signal or from a frame you looked at.
- [ ] Savings are stated as "up to", taken from the step delay.
- [ ] Thresholds you changed are listed in the report.
- [ ] Missing frames (no ffmpeg, no video) are stated, not skipped silently.
- [ ] The user was offered deletion of `video/`, `trace.zip` and `frames/`.
