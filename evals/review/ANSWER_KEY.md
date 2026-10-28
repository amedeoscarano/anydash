# /dash:review eval: answer key

> **Reviewers under test must not read this file.** Runners copy only the fixture folder into a scratch directory. The scorer reads this file; the reviewer never does.

A seed is a **hit** when a finding names its rule ID (or a listed alternative) and the same place: the same file and a line within 3 of the listed one, or for the spec the same file and the same field, page or menu item.

## Prompt 1: `fixtures/settings-page`

File: `app/settings/store/page.jsx`. One settings form, committed by one Save in a sticky bar.

| # | Kind | Rule | Where | What is wrong | Alternatives that count | Expected severity |
|---|---|---|---|---|---|---|
| 1 | obvious | CTL-002 | `page.jsx:106` | `<Switch id="autoArchive">` sits inside the `<form>` (`:61`) that commits on `type="submit"` Save (`:180`). | CTL-001 | major |
| 2 | obvious | SAV-006 | `page.jsx:174` | "Delete store" sits in the save bar next to Save, calls `deleteStore()` on click with no dialog and no consequence text. | none | blocker |
| 3 | obvious | HLP-002 | `page.jsx:81` | The consequence of changing currency (recalculates open draft orders) is only in a `title` tooltip; no visible description. | HLP-003, HLP-001 | major |
| 4 | obvious | FDB-003 | `page.jsx:54` | Every save error becomes `toast.error("Invalid input")`; no error under the field, no `aria-invalid`, and the 60-character limit on Store name (`:68`) is not stated. | FDB-001 | major |
| 5 | obvious | CTL-007 | `page.jsx:99` (value at `:19`) | "Free shipping threshold" is `type="text"` with value `"$50.00"`: unit inside the value, no min, max or step. | none | major |
| 6 | subtle | SAV-004 | `page.jsx:177` | Discard calls `reset(DEFAULTS)`, which empties the form to defaults, not to the last saved values held in `saved` (`:28`). | none | major |
| 7 | subtle | CTL-010 | `page.jsx:154-160` | "Digest day" stays editable when "Email a weekly sales digest" is off. `digestEnabled` is watched at `:58` and never used. | none | major (CTL-010 is medium confidence) |
| 8 | subtle | HLP-006 | `page.jsx:133` | The SMS checkbox is `disabled={!plan.includesSms}` with no text saying why or how to unlock it. | STA-005 | major |

### Correct passes (flagging these is a false positive)

- SAV-001: the bar is `sticky bottom-0`, Save and Discard are disabled until `isDirty`.
- SAV-005: `useNavigationGuard(isDirty, ...)` and a `beforeunload` listener, both gated on `isDirty` (`:39-45`). Putting the guard's internals under Not checked is fine; a finding is not.
- HLP-001: the non-obvious checkboxes and the switch have visible descriptions wired with `aria-describedby`. Store name and Contact email are self-explanatory (HLP-008).
- CTL-001: the notification booleans are checkboxes in the Save form.
- MCP-001: Save and Discard are allowed bare verbs; "Delete store" is verb plus object.
- CTL-005: Currency and Digest day are selects over short closed lists.

### Expected Not checked or Not applicable

- Not applicable for a single settings file: HOM, IDX, DET, AI, ONB, INT, BRD, most of NAV and CHR.
- Not checkable statically (or not in the given files): FDB-008 (the root layout is not in the fixture), toast region, LAY-008 at 390 px, VIS-004 contrast, SAV-002 network behaviour.

### Valid unseeded findings (not false positives)

- STA-003, `page.jsx:28-37`: the form shows provisional defaults before `fetchStoreSettings()` resolves.
- STA-004, `page.jsx:33`: the load has no `.catch`, so a failed fetch shows nothing (low confidence: `minor`).
- `plan` page prop, `page.jsx:27`, `:133`: `plan` is not a Next.js page prop, so it is always undefined.
- BRD-010, `page.jsx:118-151`: the staff digest sits in the customer notifications list. Allowed only at `minor`.

Scoring: target 8 / 8, pass at 7 / 8 with all 5 obvious seeds found. At most 3 false positives.

## Prompt 2: `fixtures/planted-spec`

Folder: `dash-spec/`. The spec of a small order and shipping admin.

| # | Rule | Where | What is wrong | Alternatives that count | Expected severity |
|---|---|---|---|---|---|
| 1 | SET-001 | `ia.md:6` | "Carrier accounts" is the second item of the main menu, but `inventory.md:8` lists it as config, rare, Owner only. It belongs under Settings (or Integrations inside Settings). | NAV-001, INT-011 | major |
| 2 | SET-006 | `ia.md:15` | The Settings entry opens an overview page of cards instead of General with the settings list visible. One scope only, so the exception does not apply. | none | major (medium confidence); also expected in Do not build |
| 3 | CTL-002 | `controls.md:10` | "Archive orders after delivery" is a Switch, while `controls.md:15` says every field on the page is committed by Save. | CTL-001 | major |
| 4 | HLP-002 | `controls.md:9` | The currency consequence lives only in a tooltip, with no visible description. | HLP-003, HLP-001 | major |
| 5 | SAV-006 | `pages.md:15` | "Delete order" sits next to "Edit order" in the header, default style, deletes on click with no dialog; the inventory marks Orders as destructive. | none | blocker |
| 6 | IDX-011 | `states.md:6` | Orders has one empty template for no data and no match, with no clear-search action, although `pages.md` gives Orders a search toolbar. | none | major |
| 7 | CHR-009 | `ia.md:24` | A bell backed by the toast history, not by a stored feed; `inventory.md:13` says the product stores no notifications. | FDB-001 | major; also expected in Do not build |

Bonus (not required for a pass, never a false positive): `decisions.md:6-10` cite rules that contradict the decision (CTL-002 to justify a switch in a Save form, CHR-009 for a toast-history bell, HLP-003 for a consequence in a tooltip, NAV-001 for config in the menu). A good review says the decision log misapplies these rules. `index.md` Do not build is missing the bell and the settings overview.

### Correct passes (flagging these is a false positive)

- HOM-001: two queues, open-work home.
- STA-003, STA-004, STA-006: loading, error and not-found are specified per region.
- FDB-003, FDB-004, FDB-008: specified correctly in `states.md`.
- SAV-001, SAV-004, SAV-005: specified correctly in `controls.md`.
- ONB-001: no wizard; first value from the empty state.

### Expected Not checked

Every rule whose check needs code or a running app (contrast, 390 px layout, focus order, live regions in the DOM) goes to Not checked, with a reason, not to the table.

### Valid unseeded findings (not false positives)

- DET-008, `pages.md:7`: the order detail has no history of changes.
- SAV-008: no change log for settings.

Scoring: target 7 / 7, pass at 6 / 7 with SAV-006 and CTL-002 found. At most 3 false positives.
