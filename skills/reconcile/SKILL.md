---
name: reconcile
description: >-
  Reconciles an API with a dashboard repo. Takes an api-surface.json (value-free shapes captured by /dash:clone or api-surface-capture), an OpenAPI file or a GraphQL schema, plus the repo, and runs the api-ui-reconciliation skill to write dash-reconcile/matrix.md (their field, our field, UI control, save model, transforms, sync direction) and dash-reconcile/gaps.md (gaps both ways, type and enum conflicts, conflict policy). After the user approves, it writes a typed adapter, a mapper and their tests into the repo and runs them. Optionally builds a local mock server from a HAR with synthetic values. Use when the user wants to connect a dashboard to an external or backend API, check that forms and selects match the API, or turn a captured surface into working client code. Do not use it to capture the API (use /dash:clone or api-surface-capture), to design a whole dashboard (use /dash:build), or to review UI without an API (use /dash:review).
disable-model-invocation: true
argument-hint: "<api-surface.json|openapi|graphql> <repo>"
---

# Reconcile an API with a dashboard

Turn an API description and a repo into one agreed mapping and working, tested client code. The command orchestrates the api-ui-reconciliation skill, stops for approval between the mapping and the code, and never writes a captured value anywhere. Code lands in the repo only after the user says yes.

## Input

- First argument: one of
  - `api-surface.json` from /dash:clone or the api-surface-capture skill (shapes without values),
  - an OpenAPI 3 file (`.json`, `.yaml`) or a URL to the official one,
  - a GraphQL schema (`.graphql` SDL or introspection JSON).
- Second argument: the repo path. Default: the current directory.
- If the user has more than one source (official OpenAPI and a capture), take both: the official schema leads and the capture cross-checks it.

Ask before starting, in one message:
1. Is this API the user's own, or a third party's they have legitimate access to under its terms? If neither, stop.
2. Which objects or endpoints matter (all, or a list such as orders, shipments, settings).
3. Who owns each object: their system, ours, or both (decides sync direction).
Without an answer (a non-interactive run), cover every endpoint in the source, mark ownership "assumed: theirs", and list the questions under `## Not checked` in `gaps.md`.

## Output

In `dash-reconcile/` at the repo root:

| File | Content |
|---|---|
| `matrix.md` | Source and version, then one field table per object (columns from api-ui-reconciliation) |
| `gaps.md` | Theirs not in our UI, ours not in their API, type conflicts, enum conflicts, conflict policy, Not checked |
| `theirs-<object>.json`, `ours-<object>.json` | Flattened field rows (names and types only) used for the diff |
| `mock/` (optional) | A local mock server and its synthetic fixtures |

Every gap and conflict in `gaps.md` closes with exactly one of the four exits: `fix now`, `file as task`, `reject with rationale` or `verify with a test`.

In the repo, after approval: the adapter, the mapper, their types and their tests, in the repo's own layout. Add `dash-reconcile/mock/` to the repo only if the user wants it. Never write a HAR, a screenshot or a captured value to `dash-reconcile/` or the repo.

## Procedure

Specialist skills are siblings in this plugin: `/dash:<name>` in Claude Code, `dash-<name>` elsewhere. Invoke each one, or read its `SKILL.md` in the sibling folder (`../<name>/SKILL.md`) and follow its Procedure and Self-check. If a sibling is missing, apply the areas in `references/rules.md` and walk `references/frameworks/control-selection-matrix.md` directly.

1. **Check the input.** Detect the kind of the first argument: `openapi` or `swagger` key (Swagger 2 must be converted first), GraphQL SDL (`type Query`), introspection (`__schema`), or an `api-surface.json` from api-surface-capture. If the source is a URL, fetch only official schema or docs pages. If the input is a raw HAR, do not read its values: run api-surface-capture to reduce it to `api-surface.json` first (`node ../api-surface-capture/scripts/har-shapes.mjs <file.har> > api-surface.json`). If that sibling is missing, read only method, path and JSON keys and types from the HAR by hand. Ask the user to keep the HAR out of the repo.
2. **Map the repo.** List data models, forms and their controls, existing API clients, the test runner (`vitest`, `jest`, `node --test`) and the language (TypeScript, plain JS with JSDoc, Swift).
3. **Reconcile.** Apply the api-ui-reconciliation skill to the chosen objects. It flattens both sides with its `schema-fields.mjs` script, diffs them, picks a control per field with the control-selection skill (CTL-001 to CTL-008), a save model per section with the save-model skill (SAV-001, SAV-003, SAV-006), resolves enum conflicts, and states sync direction and the conflict policy.
4. **Integration pages, when the API is a third-party connection.** Apply the integration-connect skill to the mapping UI: an explicit field-mapping list with defaults and write-back as its own option (INT-008, low), a sync log on the integration page (INT-006), failures surfaced outside the log (INT-007), credentials masked (INT-010). Background failures stay on the object and in a log (FDB-004).
5. **Write `matrix.md` and `gaps.md`.** In chat, give the counts (fields matched, gaps each way, type and enum conflicts) and the blockers: fields our UI needs that the API lacks, and enum values our selects offer that the API rejects.
6. **Ask for approval.** Show the list of files the adapter step will create or change. Wait for a clear yes. Without one, stop here; the mapping is the deliverable.
7. **Write the adapter, mapper, types and tests** as api-ui-reconciliation step 10 describes, in the repo's layout and runner. Base URL and credentials come from config or environment variables; add the variable names to the repo's example env file, never real values. Fixtures are synthetic.
8. **Run the tests** with the repo's runner. Fix failures in the new code only. Report the command and the result.
9. **Optional local mock.** When the user asks to develop against a mock:
   - If your REA version offers an environment-build tool, you may use it to build the mock from the HAR. Check its tool list first; do not assume it exists.
   - Otherwise write `dash-reconcile/mock/server.mjs`: a `node:http` server bound to `127.0.0.1` that serves each endpoint in `api-surface.json` with the synthetic fixtures from step 7, and `501` for anything else. Point the adapter at it with the base URL variable.
   - The mock never replays captured responses.
10. **Summarise.** Files written, test result, open gaps, and the next step: build the mapped fields with /dash:build, or review the forms with /dash:review.

## Rules applied

- CTL-001 — checkbox for a boolean saved with a form.
- CTL-002 — switch only for instant changes.
- CTL-004 — radios for 2 to 6 options that need comparing.
- CTL-005 — select for a standard closed list.
- CTL-006 — searchable combobox for long or dynamic lists.
- CTL-007 — unit outside the value.
- SAV-001 — sticky save bar for fields committed together.
- SAV-003 — Save per independent section.
- SAV-006 — destructive actions apart, confirmed.
- SAV-008 — activity log with actor, old and new value.
- SET-010 — current value visible; secrets masked.
- INT-006 — sync log on the integration page.
- INT-007 — sync failures surface outside the log.
- INT-008 — explicit field mapping with defaults (low).
- INT-010 — credentials masked, rotation explained.
- FDB-003 — field errors under the field.
- FDB-004 — background failures stay on the object and in a log.

Full text: `references/rules.md`.

## Example

`/dash:reconcile dash-clone/api-surface.json ./admin` on an order admin.

**Good.** The user confirms the API is their own backend. `matrix.md` maps 23 order fields: `status` (`enumCount: 5`, labels taken from the official docs) becomes a select (CTL-005), `total_cents` a read-only money value, `notes` a textarea in the page save bar (SAV-001). `gaps.md` lists `priority`, which our form has and the API lacks, as a blocker. After the user says yes, the command writes `lib/api/orders.js`, `lib/api/orders-mapper.js` and `lib/api/orders.test.js`, runs `node --test`, and reports 9 passing tests.

**Bad.** The command writes the adapter straight away, copies three captured orders with real customer emails into the fixtures, and sends the whole object on every save. The status select keeps an option the API refuses (CTL-005), and a 422 shows as a toast instead of under the field (FDB-003).

## Self-check

- [ ] Legitimate access was confirmed, or the run stopped.
- [ ] `matrix.md` and `gaps.md` exist and name the source and its version.
- [ ] Every gap and conflict has one of the four exits.
- [ ] No adapter code was written before a clear yes.
- [ ] No HAR, screenshot or captured value is in `dash-reconcile/`, the fixtures or the tests.
- [ ] Credentials come from environment or config, never from code.
- [ ] Tests ran with the repo's runner; the command and result are reported.
