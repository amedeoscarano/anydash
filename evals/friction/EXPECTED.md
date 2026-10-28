# /dash:friction eval: expected outcome

Task: "change the default package weight" in a copy of `examples/flawed-dashboard`. The setting lives in Settings > General > Shipping defaults > Default package weight.

## Fixture

Copy the app out of the repo. Do not record against the repo folder.

```
rsync -a --exclude node_modules --exclude .next --exclude EXPECTED_FINDINGS.md examples/flawed-dashboard/ <scratch>/app/
cd <scratch>/app && npm ci && npm run build && npx next start -p 3102 -H 127.0.0.1
```

Run the recorder from the repo root, so `playwright-core` resolves:

```
node skills/session-recorder/scripts/record.mjs http://127.0.0.1:3102/ <scratch>/rec-confusing --script evals/friction/steps-confusing.json --profile <scratch>/profile
node skills/session-recorder/scripts/record.mjs http://127.0.0.1:3102/ <scratch>/rec-direct --script evals/friction/steps-direct.json --profile <scratch>/profile
cd skills/friction-analysis
node scripts/analyze.mjs <scratch>/rec-confusing --frames
node scripts/analyze.mjs <scratch>/rec-direct --frames
node scripts/analyze.mjs --compare <scratch>/rec-confusing <scratch>/rec-direct
```

Record the confusing path first. The server keeps settings in memory, so the direct path types "4 kg" to make the form dirty again. Restart the server for a clean pair.

## Scripted paths

- `steps-confusing.json`: Home > Orders (wrong menu), 2.5 s pause, two clicks on the plain-text "Status" table header, back to Home, open search with `/`, type "general", pick "General settings", type "3 kg" in Default package weight, Enter.
- `steps-direct.json`: Home > Settings (redirects to General), type "4 kg" in Default package weight, Enter.

## The analysis must find

Confusing recording (`friction.json`):

1. `meta.stopReason` is `script-done`. `events.ndjson` holds `click` and `navigation` lines, and no typed value appears in it.
2. The steps end at the goal actions `Click link "Orders"`, `Click button "General settings"` and `Click button "Save"`. The clicks on "Status" end no step.
3. **Top bottleneck (rank 1) is the detour step, `Click button "General settings"`.** It has the largest positive delay, at least 5 s over its baseline.
4. That step carries all four detour signals: `dead` x2 ("Status", not interactive), `back` (to /), `search-fallback`, and `long-wait` on /orders.
5. The step's suggestion cites SET-010 and NAV-002 (the dead and back signals). Its frame is taken at the first dead click and shows the Orders list.
6. No other step has a positive delay.
7. The Enter that saves the form adds K, not M+P+B. The Save step's baseline is 1M 1P 1B 1H 5K (3.95 s).
8. Deterministic: a second run writes the same `friction.json` and `friction.md` bytes.

Report (`report.md`, written per `skills/friction/SKILL.md`):

9. The top bottleneck is step 2. The frame description names the Orders list and the "Status" header.
10. The report rejects SET-010 against the frame. The person clicked a table header, not a settings value. The report cites a settings-placement rule instead (SET-007, or NAV-002 with a reason). SET-012 is a valid second suggestion, because search does not index settings by name.
11. No estimated saving is above 8.55 s or above its step's delay, and overlapping savings are not added together. Every suggestion has exactly one exit.

Direct recording and `--compare`:

12. The direct path has 2 steps, no signals and no bottleneck.
13. `friction-compare.md` shows total delay going from the confusing value to 0, and `dead`, `back` and `search-fallback` going to 0.

## Never in the repo

`video/`, `trace.zip`, `frames/`, `events.ndjson` or `network.ndjson` from these runs. Only the two step files and this folder's Markdown are committed.
