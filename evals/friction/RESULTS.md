# /dash:friction eval: results

Run on 2026-10-28 against a scratch copy of `examples/flawed-dashboard`, served by `next start` on 127.0.0.1:3102. The runs used Chrome through `playwright-core` 1.62.1 (headed, dedicated profile) and ffmpeg from Homebrew. Both paths are scripted, so the timing comes from the recorder's fixed delays, not from a human. Expected outcome: `EXPECTED.md`.

## Verdict

**Pass.** The detour step is the top bottleneck, with 8.55 s of the recording's 8.55 s total delay, and its frame shows the Orders list where the person went the wrong way. After two analyser fixes (listed below), all 13 checks in `EXPECTED.md` pass. Before the fixes, checks 5 and 7 failed.

## Scores

| Recording | Steps | Actual s | Baseline s | Delay s | Signals |
|---|---|---|---|---|---|
| confusing | 3 | 18.89 | 13.40 | 8.55 | back 1, dead 2, long-wait 2, search-fallback 1, slow-network 1 |
| direct | 2 | 3.41 | 6.50 | 0 | none |

Compare (`--compare confusing direct`): delay 8.55 s to 0 s, actual 18.89 s to 3.41 s. `back`, `dead`, `long-wait`, `search-fallback` and `slow-network` all go to 0. The Save step is the same on both sides (2.23 s against 2.21 s).

## Steps and bottlenecks (confusing recording)

| Rank | # | Step | Screen | Actual s | Baseline s | Delay s | Signals | Rules (analyser) |
|---|---|---|---|---|---|---|---|---|
| 1 | 2 | Click button "General settings" | / | 15.45 | 6.90 | **8.55** | long-wait x2, dead x2, back, search-fallback | SET-010, NAV-002, MCP-007 |
| - | 1 | Click link "Orders" | / | 1.21 | 2.55 | -1.34 | slow-network | - |
| - | 3 | Click button "Save" | /settings/general | 2.23 | 3.95 | -1.72 | - | - |

Only one step ran over its baseline, so the top-5 list has one entry. Steps 1 and 3 beat the KLM baseline because a script clicks faster than a person.

## The report (written per `skills/friction/SKILL.md`)

- Frame `frames/step-02.png` at 7.59 s shows the Orders list with the "Status" header. The header is plain text, and nothing on the screen mentions shipping or weight.
- Suggestions:
  1. SET-007: move Shipping defaults out of "General", 8.5 s, `file as task`.
  2. SET-012: search does not index settings by name, so "weight" returns nothing. This saving overlaps suggestion 1. Exit: `verify with a test`.
  3. SET-010: `reject with rationale`. The frame shows a table header, not a settings value.
  4. `/api/stats` at 1.0 s: no rule (performance), `reject with rationale`.
- One finding beyond the analyser: the scripted search had to type "general" because "weight" finds nothing. That gap is the evidence for SET-012.

## Fixed in the skills during the test

1. **The Enter-key submit was counted as a pointing action** (`skills/friction-analysis/scripts/analyze.mjs`). When Enter is pressed in a form field, the browser fires a click at (0, 0) on the submit button. The analyser counted that click as M+P+B on top of the Enter key's K, which added 2.55 s to the Save step's baseline (6.50 s, now 3.95 s). The analyser now skips a (0, 0) click within `submitMergeMs` of an Enter. Test: `fixtures/enter-submit.ndjson`.
2. **The frame was taken at the step's first signal, not its strongest** (same file). The first signal was the long-wait at the Orders page load (3.31 s), which shows the page before anything happened. The frame now uses the first occurrence of the suggestion's top signal, here the first dead click (7.59 s). Test: "frame time" in `analyze.test.mjs`.
3. The friction-analysis `SKILL.md` steps 4 and 6 now describe both behaviours.

The recorder and the `/dash:friction` command needed no change.

## Not done

- No human recording. Thresholds stay uncalibrated, and only scripted timing was measured.
- No re-recording with "weight" typed in search. With today's app it returns "No results", so that path cannot be scripted to success.
- The analyser still puts SET-010 first for dead clicks on a non-settings page. The report rejects it after reading the frame, as the skill intends. A context-aware rule choice is not built.
