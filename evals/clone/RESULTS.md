# /dash:clone results (2026-10-28, test agent)

Run outputs: `run/` (copied from `dash-clone/`, raw evidence left out).

| Check | Result |
|---|---|
| Access, mode | pass: own-app, CDP `http://127.0.0.1:9334` |
| REA | used: `list_browser_targets`, `inspect_web_page` (accessibility text and JSON body shapes) on 7 pages |
| `analyze_web_bundle` | fail: REA closed the connection twice on the Next.js dev bundle; recorded as "not analysed" |
| Pages in `ia.md` | pass: home, orders, order detail, 4 settings pages incl. integrations, export marked not visited |
| API routes | pass: 7 `GET /api/*` endpoints with value-free shapes (HAR route through `har-shapes.mjs`, REA cross-check matched the same 6 endpoints the UI calls) |
| Rule IDs in spec | pass: all exist in `rules/source` |
| Privacy grep (`acme`, `1001`, example emails, customer names) | pass: no hits |
| Ports and profile cleaned up | pass |

## How it actually ran

- `inspect_web_page` only sees requests fired inside its window. A reload inside the window fails with `target_changed`. Working method: start the call, then a client-side link click to the next page during the window. The test agent did the click through CDP `Runtime.evaluate` (stands in for the user clicking, own app only).
- REA body shapes carry no formats or enum counts, and its URLs carry ids and query values. So `api-surface.json` came from the HAR route (`har-shapes.mjs` on a HAR built from GET calls to the local app), with REA as cross-check.
- Headless Chrome with the default window hid the sidebar; `--window-size=1440,900` fixed it.
- Write endpoints (PUT/PATCH) were not called: read-only run. They are listed as open questions in `spec.md`.

## Skill fixes made

- `skills/api-surface-capture/SKILL.md`: REA window behaviour (`target_changed`, click during window) and the format gap of REA shapes.
- `skills/site-feature-mapper/SKILL.md`: inspect after navigation, desktop window size, retry-once-then-note for `analyze_web_bundle`.
- `skills/clone/SKILL.md`: routes as `{id}` (was `:id`, inconsistent with site-feature-mapper), bundle failure note, REA window and formats note in step 5.

## Review changes after the run (not re-run)

- `skills/clone/SKILL.md`: `## Open questions` items now close with one of the four exits. The `spec.md` in `run/` predates this and has none.
- `skills/clone/SKILL.md` example: enum notation corrected to `"string:enum(4)"`.
- `skills/api-surface-capture/scripts/har-shapes.mjs`: object keys and query names with dots, dashes or spaces are collapsed to `{key}`, and short slug segments with letters and digits (`acme-q3`) become `{id}`. Re-running the script on this run's HAR gives the same endpoints as `run/api-surface.json`.
