---
name: api-ui-reconciliation
description: >-
  Maps a third-party or backend API onto our dashboard UI and data model, field by field. Reads the API from the best source available (official OpenAPI or GraphQL schema, then official docs, then a value-free api-surface.json captured by api-surface-capture), flattens it with its own script, and produces a field matrix (their field, our field, UI control from the type via the control-selection rules, transforms, sync direction), the gaps both ways, type and enum conflicts (our select options against their enum), a conflict policy, and a typed adapter plus mapper with tests on synthetic fixtures. Use when connecting a dashboard to an external API or a new backend, when building an integration's field mapping, or when a select's options drift from the API. Run it from /dash:reconcile. Do not use it to capture the API surface itself (use api-surface-capture), to map a site's pages (use site-feature-mapper), or to design the integration pages (use integration-connect).
---

# API and UI reconciliation

Make the API, our UI and our data model agree. Every field the API exposes ends in one of three places: shown and editable with a chosen control, shown read-only, or deliberately left out. Every field our UI shows has a source in the API or is marked as ours alone. Type and enum mismatches are found before code is written, not by a failing save in production. Values never enter the matrix: only names, types, formats and enum labels from official schemas.

## Input

- Their side, in this order of trust. Use the first one available and note the others as cross-checks:
  1. An official OpenAPI 3 file (JSON or YAML) or a GraphQL schema (SDL or introspection JSON).
  2. Official API docs pages (reference pages, changelogs). Write the fields you read into the same row format by hand.
  3. `api-surface.json` from the api-surface-capture skill (`/dash:api-surface-capture` or `dash-api-surface-capture`): endpoints and value-free shapes captured with REA or from a HAR. Captured shapes only show fields that appeared in the session; mark every row from this source `seen`, not `documented`.
- Our side: a repo path. Read data models (Prisma, Supabase migrations, Drizzle, zod schemas, JSDoc typedefs, SwiftData models), form components and their current controls, and any existing API client.
- Optional: which endpoints matter (for example `GET /orders/{id}`, `PATCH /settings`), and who owns each object (their system, ours, or both).

This skill does not call REA itself. If no schema, docs or `api-surface.json` exist, ask for one, or run api-surface-capture first. If that sibling is not installed, ask the user for a HAR exported from DevTools on their own session and read only the method, URL path and the JSON keys and types; never copy values.

## Output

Run from /dash:reconcile: write `dash-reconcile/matrix.md`, `dash-reconcile/gaps.md`, and the adapter files in the repo after the user approves. Asked directly: answer inline with the matrix and gaps.

`matrix.md`, one table per object (Order, Shipment, Settings...):

| # | Their field | Type | Source | Our field | Our type | UI control | Save model | Read transform | Write transform | Direction | Rule IDs |
|---|---|---|---|---|---|---|---|---|---|---|---|

- Their field: `op` plus path, for example `GET /orders/{id}` `items[].sku`.
- Type: `string:uuid`, `number`, `string enum(4)`, `boolean`, `array<string>`. Source: `openapi`, `graphql`, `docs`, `seen`.
- UI control: from the control-selection skill (`/dash:control-selection` or `dash-control-selection`), or `read-only text`, `masked`, `not shown`.
- Save model: page save bar, section Save, instant, action button, or `n/a` for read-only.
- Direction: `read` (theirs to ours), `write` (ours to theirs), `two-way`, `ours only`, `theirs only, not shown`.

`gaps.md`, four sections: `## Theirs, not in our UI` (with a decision: add, read-only, skip and why), `## Ours, not in their API` (stored locally, computed, or a blocker), `## Type conflicts`, `## Enum conflicts` (their labels, our options, what the mapper does with an unknown value). End with `## Conflict policy` and `## Not checked` (endpoints not covered by the source, fields only `seen` once). Each gap and conflict closes with one exit: `fix now`, `file as task`, `reject with rationale` or `verify with a test`.

Adapter, in the repo's language and layout (detect from `package.json`, `tsconfig.json`, `Package.swift`):
- `adapter`: one function per endpoint used. Base URL and credentials from config or environment, never in code. Returns parsed JSON or throws a typed error with the status.
- `mapper`: pure functions `toOurs(theirs)` and `toTheirs(ours, original)`. `toTheirs` returns only the changed writable fields.
- Types: TypeScript types, or JSDoc `@typedef` in plain JS, for both shapes.
- Tests with the repo's runner (`node:test` when none): synthetic fixtures built from the shapes with obviously fake values (`ord_test_1`, `test@example.test`), `fetch` mocked, no network.

## Procedure

1. **Pick the source.** Use the order in Input. Record the source and its date or version at the top of `matrix.md`. When docs and the captured surface disagree, docs win and the difference goes to `gaps.md` as a note.
2. **Flatten their side.** Run the bundled script from this skill's folder, one endpoint at a time:
   `node scripts/schema-fields.mjs flat <openapi.json|openapi.yaml|api-surface.json> --op "GET /orders/{id}" > dash-reconcile/theirs-<object>.json`
   It resolves local `$ref`, merges `allOf`, takes the first branch of `oneOf`/`anyOf` (marked `union`), collapses arrays to `[]`, and keeps formats and enum labels. It reads only types. GraphQL: write the same rows by hand from the type definitions (`String!` is `required`, enums keep their values). Swagger 2: convert to OpenAPI 3 first.
3. **Flatten our side.** From the models and forms, write `dash-reconcile/ours-<object>.json` in the same row format: `{ "path": "serviceLevel", "type": "string", "enum": ["standard", "express"] }`. Take enum options from the select or radio options in the form code, not only from the model.
4. **Diff.** `node scripts/schema-fields.mjs diff dash-reconcile/theirs-<object>.json dash-reconcile/ours-<object>.json`. It matches names across styles (`created_at` = `createdAt`) and lists matched fields, gaps both ways, type conflicts and enum conflicts. Then match the rest by meaning (`weight` in grams against `weightKg`) and record each manual match with its transform.
5. **Pick the control per field.** Apply the control-selection skill, or walk `references/frameworks/control-selection-matrix.md` directly:
   - Boolean saved with the form: checkbox (CTL-001). Boolean their API applies on its own `PATCH` with no other field: switch with instant save (CTL-002, SAV-002).
   - Enum of 2 to 6 values that change behaviour: radio group (CTL-004). Closed enum of about 4 to 20: select (CTL-005). Over 20, open, or ids of user data: searchable combobox (CTL-006). Array of an enum: checkbox group (CTL-003) or a multi-select combobox for long lists (CTL-006).
   - Number with a unit in the name or docs (`_kg`, `_cents`, `_ms`, `percent`): number field with a fixed unit, value converted in the mapper (CTL-007). Money in minor units is divided for display and multiplied back on write, with integers only.
   - Boolean that gates other fields (for example `cod_enabled` and `cod_amount`): keep them together (CTL-010).
   - Server-set fields (`id`, `created_at`, `updated_at`, computed totals): read-only text, never an input, current value visible (SET-010).
   - Secrets and tokens: masked with Copy and Reveal, never in the matrix values (INT-010; SET-010 exception).
   - Formats with no rule (dates, colours, rich text): write "no rule yet" and name the control you chose.
6. **Pick the save model per section.** Fields sent in one request body share one Save: page save bar (SAV-001) or one Save per independent section (SAV-003). A field their API writes through a separate endpoint is its own section or an instant control. A delete or disconnect endpoint is a destructive action apart from Save (SAV-006). A call that returns a job id is a background job with a status line (SAV-009, low).
7. **Resolve enum conflicts.** For each conflict decide:
   - Their value we lack: add it to our options, or map it to ours in `toOurs`. The mapper must keep any unknown value as is and the UI shows it read-only with its raw label. Never coerce it to a default; that loses data on the next save.
   - Our option they reject: remove it from the control, or map it in `toTheirs`. A select must never offer a value the API will refuse.
   - A count change moves the control: an enum that grows past 6 leaves the radio group (CTL-004 to CTL-005).
   - Captured surfaces may store only `enumCount`. Get the labels from docs before you build a closed control; until then use a combobox that accepts the raw value (CTL-006).
8. **Decide sync direction and the conflict policy.** Per field: who is the source of truth. Default policy (no rule yet in the rulebook, state it as a decision):
   - Their system owns the fields it creates; we read them.
   - We write only fields the user edited, never the whole object.
   - Before a write, send the version they give (`ETag` with `If-Match`, `updated_at`, `version`). On 409 or 412 keep the user's draft, show the current remote value next to it, and let the user choose. Never overwrite silently.
   - A write-back to their system is its own labelled option on the integration page (INT-008, low).
   - Background sync failures stay on the object with a count and in a log (FDB-004), and repeated failures surface outside the log (INT-007).
   - Every write from the integration is logged with the actor "integration", old and new value (SAV-008).
   - Per-object values that override an account default show inherited or customised (SET-011, low).
9. **Validation.** Copy their limits (`maxLength`, `minimum`, `pattern`, `required`) into our form and show them before typing; map their 422 field errors to the field (FDB-003).
10. **Write the adapter and mapper.** Follow the repo's layout. Types for both shapes from the flattened rows. Tests cover: `toOurs` on a full fixture; a fixture with optional fields missing; an unknown enum value kept as is; unit and money conversion both ways; `toTheirs` returning only changed writable fields; read-only fields never sent; the adapter building the right method, path and query, and raising a typed error on 4xx and 5xx. Fixtures use invented values only, never values from a capture.
11. **Run the tests** and report the command and its result. Do not commit unless the user asks.

## Rules applied

- CTL-001 — checkbox for a boolean saved with a form.
- CTL-002 — switch only for instant changes.
- CTL-003 — checkbox group for multi-select.
- CTL-004 — radios for 2 to 6 options that need comparing.
- CTL-005 — select for a standard closed list.
- CTL-006 — searchable combobox for long, dynamic or creatable lists.
- CTL-007 — unit outside the value, min, max and step enforced.
- CTL-010 — an on/off keeps its dependent options next to it.
- SAV-001 — sticky save bar for fields committed together.
- SAV-002 — instant controls apply at once and confirm.
- SAV-003 — Save per independent section.
- SAV-006 — destructive actions apart, confirmed.
- SAV-008 — activity log with actor, old and new value.
- SAV-009 — long jobs run in the background and say so (low).
- SET-010 — current value visible; secrets masked.
- SET-011 — inherited or customised marker (low).
- INT-007 — sync failures surface outside the log.
- INT-008 — explicit field mapping with defaults; write-back as its own option (low).
- INT-010 — credentials masked, rotation explained.
- FDB-003 — field errors under the field, limits stated first.
- FDB-004 — background failures stay on the object and in a log.

Full text: `references/rules.md`.

## Example

Shipping admin, carrier API `GET/PATCH /shipments/{id}`.

**Good.** `service_level` is `string enum(standard, express, economy)`; our select offered `standard, express, same_day`. The matrix row: their field `service_level`, our field `serviceLevel`, control radio group with the question "How fast should it ship?" (3 options that change price and speed, CTL-004), page save bar (SAV-001), direction two-way. `gaps.md` lists the enum conflict: `economy` added to our options, `same_day` removed since the API rejects it, and the mapper keeps any future unknown value read-only. `weight_grams` (integer) maps to `weightKg` with a "kg" suffix and step 0.01 (CTL-007), converted both ways in the mapper and tested. `tracking_url` is read-only text (SET-010). The `PATCH` sends only `service_level` when only that changed, with `If-Match`; a 412 keeps the draft and shows the remote value.

**Bad.** The form keeps its old select with `same_day`, so saves fail with a 422 shown as a toast "Something went wrong" instead of under the field (FDB-003). An unknown `economy` from the API renders as the first option, `standard`, and the next save overwrites the carrier's value. Weight is a free text field "1.2 kg" sent as a string (CTL-007). The whole object is sent back on every save, so a field changed by the carrier in the meantime is lost, and no log says the integration changed it (SAV-008).

## Self-check

- [ ] The source and its version are named, and every `seen` row is marked as such.
- [ ] Every field of the chosen endpoints is in the matrix: shown, read-only or not shown with a reason.
- [ ] Every enum conflict has a decision, and the mapper keeps unknown values.
- [ ] Every control cites a CTL rule or says "no rule yet".
- [ ] `toTheirs` sends only changed writable fields, with the version check.
- [ ] No captured value (names, emails, ids, amounts) appears in the matrix, gaps, fixtures or tests.
- [ ] Adapter tests ran and passed; the command and result are reported.
