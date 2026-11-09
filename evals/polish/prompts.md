# /dash:polish eval prompts

Two blind runs of `/dash:polish` on `examples/flawed-dashboard`. The runner makes a fresh copy of the example for each prompt and deletes `EXPECTED_FINDINGS.md` and `README.md` from the copy. Copies are not stored in this folder. If the copy has no `node_modules`, the runner runs `npm ci` in it before the prompt.

The agent under test loads `skills/polish/SKILL.md` and follows it literally. It must not read this file, the example's answer key or anything under `evals/`. A separate scoring agent grades each answer, and the diff of the copy, against the rubric below.

This eval needs no fixtures. `evals/polish/fixtures/` is not used.

| Prompt | Mode | Scope | Edits allowed |
|---|---|---|---|
| 1 | Path, code only, token audit | whole app | no |
| 2 | Path, dev server on localhost | Settings pages | yes, not committed |

Scoring: a rubric item is a hit when the answer names the rule ID (or a listed alternative) and the same place or value. "Must find" items gate the run. "Should" items count toward the score. "Must not" items count as false positives.

Reference values, computed with `skills/visual-audit/scripts/contrast.mjs` (the script takes `rgb()`, `oklch()`, `oklab()` and `color()`, not hex):

- `--color-muted` = `color-mix(in srgb, var(--color-fg) 62%, var(--color-bg))` resolves to `#6b7079` in light: 4.98:1 on white, 4.36:1 on `--color-subtle` (`#eef0f3`), 4.52:1 on `--color-neutral-tint` (`#f3f4f6`).
- Dark muted resolves to `#9b9da1`: 7.06:1 on `#0b0f17`, 6.53:1 on `#111827`, 5.40:1 on `#1f2937`.
- A 64% mix reaches 4.67:1 on subtle, 65% reaches 4.83:1, 66% reaches 5.00:1.
- `--color-border` `#e5e7eb` on white: 1.24:1.
- Badges, light: pending 4.76, shipped 6.16, delivered 4.79, canceled 4.52. Dark: all at least 5.4.
- Accent `#2563eb` (focus ring) on white 5.17:1, on subtle 4.53:1.

---

## Prompt 1: token audit only, code only

Setup: copy of the example, no fixture.

> Run `/dash:polish` on this repo path (`.`). Token audit only: do not start the app, do not take screenshots and do not edit any file. Work from the code. Return the token audit table, the findings rows sorted into token fixes, component fixes and items for `/dash:review`, and what you could not check.

### Rubric

Structure:

- Says it ran code only: no dev server, no browser, no screenshots, and that it stops after the audit as asked (steps 1 to 4 of the skill, no fixes).
- Names the token source: the `@theme` block and the dark blocks in `app/globals.css` (no `dash-spec/tokens.md` exists).
- Runs the step 4 searches, or equivalents, over `app` and `components` (literal colours, Tailwind arbitrary values, raw palette classes, inline styles) and reports the result of each, including searches with no hits.
- A Token audit table with the columns `property | token set | values found | off-scale values (count) | where`, with rows for spacing, font size, font weight, text colour, surface colour, accent use, radius, border, shadow and icon size.
- Findings rows in the shared format `| # | Severity | Rule | Where | Evidence | Recommendation | Exit |`, one cause per row.
- Every row is sorted as token fix, component fix or not polish.
- Every contrast ratio comes from `contrast.mjs` output. `color-mix()` is resolved to an sRGB value first, not guessed.
- A `Not checked` list that names what needs a live run: computed backgrounds per element, hover, LAY-008 at 390 px, screenshot alignment.
- No file changed in the copy. No `dash-review/polish/` screenshots.

Must find:

1. **VIS-009, component fix, `components/ui.js:44`.** The switch thumb uses `bg-white`, the only literal colour class in `app` and `components`. It has no dark value. Recommendation: a semantic token with light and dark values (an existing one such as `bg-surface`, or a new `--color-switch-thumb` in all three token blocks).
2. **`--color-muted` resolved.** The answer resolves the `color-mix()` token to `#6b7079` (or the equivalent `rgb()`), and reports about 4.98:1 on white from the script. It does not call muted text a VIS-004 pass without saying which background it was checked on.

Should find (each a hit):

3. **VIS-004 on `bg-subtle`, token fix.** `app/settings/layout.js:16` puts Settings on `bg-subtle`. Muted text outside the cards (Section descriptions from `components/ui.js:54`, the intros at `app/settings/notifications/page.js:64` and `app/settings/integrations/page.js:49`, "Back to home" at `app/settings/layout.js:19`) is 4.36:1, below 4.5:1. Fix at token level. Also a hit if the answer flags muted-on-subtle as the open pair and lists it under `Not checked` because the computed background needs a live run.
4. **Dark set complete (VIS-009 pass).** Both dark blocks (`@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`) define every colour token. `--color-muted` follows through `color-mix()`; dark muted passes (6.5:1 or more on surfaces).
5. **VIS-003 pass.** All four status badges pass 4.5:1 in light and dark. A note that canceled (`text-muted` on `neutral-tint`, 4.52:1) has almost no margin is a plus.
6. **VIS-007 pass.** Radii are `rounded-md` (6 px, `--radius-md`), `rounded-lg` (8 px, `--radius-lg`) and `rounded-full` for the switch and the avatar.
7. **VIS-008 pass.** Shadows appear only on floating layers (`components/toast.js:32`, the tooltip, search dialog and account menu in `components/shell.js`) and the switch thumb. Cards set a border and no shadow.
8. **LAY-006 pass.** Spacing uses Tailwind's 4 px scale. The only arbitrary values are sizes (`w-[36rem]`, `max-w-[calc(100vw-2rem)]`, `min-h-[calc(100vh-3rem)]`), not spacing.
9. **Input border 1.24:1** (`--color-border` on white), cited as WCAG 1.4.11 with no rule. Token fix or `file as task`.
10. **VIS-005, text glyphs as icons** (`×` at `components/toast.js:39` and `components/shell.js:209`, and the other glyphs). Component fix or `file as task`.
11. **Focus ring pass.** `:focus-visible` is a 2 px accent outline, 5.17:1 on white and 4.53:1 on subtle, above 3:1.

Must not (false positives):

- VIS-008 for shadows on toasts, menus, dialogs or the tooltip.
- VIS-002 for the two section Save buttons on General. They are enabled only when their own section is dirty.
- LAY-006 for the arbitrary width and height values.
- VIS-009 `fail` because `--radius-*` or `--color-muted` has no dark value. Radii are not colours; muted is derived.
- A finding for `app/icon.svg` fills or the `dialog::backdrop` `rgb()` in the token file, unless the Exit is `reject with rationale`.
- A contrast ratio with no script output, or a ratio estimated from a guessed hex.
- LAY-008 or any screenshot-based check reported as `pass`.
- Any edited file, a started dev server, or screenshots taken.

Pass threshold: items 1 and 2 found, structure items all met, at least 5 of items 3-11, at most 1 must-not item.

---

## Prompt 2: polish the Settings pages

Setup: copy of the example, no fixture.

> Run `/dash:polish` on this repo path (`.`), scoped to the Settings pages: General, Notifications, Branding and Integrations under `/settings`. You may start the dev server on a free localhost port. Fix what polish should fix, write `dash-review/polish.md`, and report the token changes first, then the rest. Do not commit.

### Rubric

Structure:

- Starts the dev script on a free localhost port in the background and stops it at the end. If no browser tool is available, it says so, works from the code, skips screenshots, and writes that in `polish.md`.
- Before and after screenshots in `dash-review/polish/before/` and `dash-review/polish/after/` for the four Settings pages at 1440, 1024, 768 and 390 px, with the same file names. Extra home, orders and order-detail shots from the skill's default steps are fine.
- `dash-review/polish.md` has the five sections in order: `## Tokens changed`, `## Components changed`, `## Screenshots`, `## Remaining`, `## For /dash:review`, with the table columns the skill gives.
- Token fixes are made in `app/globals.css` before component fixes. Token names are kept.
- Every new or changed colour pair is checked with `contrast.mjs`, in light and dark, and the after ratio is recorded.
- The diff touches only `app/globals.css` and class values in components. No markup, handler, copy or behaviour change. No new dependency or component.
- Nothing committed. The chat answer lists tokens changed, components changed, changed screenshot pairs, remaining rows and the `/dash:review` list.

Must find:

1. **VIS-004, token fix.** Muted text on `bg-subtle` (`app/settings/layout.js:16`) measures 4.36:1: Section descriptions such as "How your store appears on packing slips and in emails to customers." on General, the page intros on Notifications and Integrations, and "Back to home". The fix is in `app/globals.css`: raise the foreground share of `--color-muted` (64% or more passes on subtle) or lighten `--color-subtle`. The `Tokens changed` row shows before, after and VIS-004, and the after ratio is at least 4.5:1 from the script. A darker class on single paragraphs, or a literal colour, is not a hit.
2. **VIS-009, component fix, `components/ui.js:44`.** The switch thumb `bg-white` is replaced by a semantic token. A new token has a value in the light block and in both dark blocks. One `Components changed` row with `file:line | literal removed | token used | rule`.
3. **`## For /dash:review`, not applied.** At least 4 of these Settings issues are listed with their rule IDs, and none is edited:
   - CTL-002: "Require signature on delivery" switch inside the Shipping defaults Save form (`app/settings/general/page.js:102`; CTL-001 also counts).
   - CTL-007: "Default package weight" is a text input holding `2 kg` (`app/settings/general/page.js:94`).
   - FDB-003: the Store name 422 error appears only in a toast (`app/settings/general/page.js:50`; FDB-001 also counts).
   - SAV-005: no leave guard on the dirty General and Branding forms.
   - MCP-008: "Brand colour" in an `en-US` UI (`app/settings/branding/page.js:42`).
   - NAV-002: the menu label "Manage integrations" against the h1 "Integrations" (`app/settings/layout.js:10`; MCP-003 also counts).

Should find (each a hit):

4. **Dark mode re-checked.** After the muted change, dark muted on bg, surface and neutral tint is checked with the script and passes. If `--color-subtle` changed instead, its dark values were reviewed too.
5. **Canceled badge re-checked.** `text-muted` on `neutral-tint` was 4.52:1 before. The answer records its after ratio and it is still at least 4.5:1.
6. **Screenshot diff explained.** Settings pages changed at all four widths, `expected` yes. Any captured home or orders page also changed because `--color-muted` is global; that is listed as expected from the token fix, not as a regression.
7. **Input border 1.24:1** (`--color-border` on white, WCAG 1.4.11, no rule) appears under `## Remaining` with an Exit, or is fixed at token level with a script check and its effect on every border noted.
8. **VIS-005 text glyphs** (`×` in the toast and drawer) under `## Remaining` with `file as task`.
9. **Focus ring** re-checked on subtle (4.53:1 or the new value) and recorded as a pass at 3:1.
10. **Other non-polish items** under `## For /dash:review`: SET-010 (notification channels hidden behind Edit), HLP-002 (the Delete drafts warning only in a `title` tooltip; HLP-003 or SAV-006 also count), SAV-002 (the stale `on` state in the integration card), or FDB-001 (save handlers with no `try`/`catch`). Each one counts once.

Must not (false positives):

- Any edit to a `/dash:review` item: the switch made a checkbox, a unit field, a new save bar, a `beforeunload` listener, "Brand color", the menu label, or toast-to-inline errors.
- A literal colour added to a component (`text-[#5d626c]`, `text-gray-600`, `style={{ color }}`), or a hex value in place of the `color-mix()` token.
- Restyling with no finding behind it: padding, radius, font size or layout changes on Settings cards.
- Shadows removed from toasts, menus or dialogs (VIS-008 exception).
- A change to the Save buttons for VIS-002.
- Tokens removed or renamed.
- A commit, or a dev server left running.
- A new dependency or component.

Pass threshold: items 1-3 all found, structure items all met, at least 4 of items 4-10, at most 1 must-not item.
