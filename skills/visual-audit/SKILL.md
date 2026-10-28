---
name: visual-audit
description: >-
  Finds visual inconsistencies in an admin dashboard from screenshots and computed styles - spacing off the scale, too many font sizes, colour spent on decoration, text contrast below WCAG (computed from the real colours, including oklch and transparent layers), misaligned edges, uneven density, stray radii and shadows, mixed icon styles, missing or weak hover, focus and disabled states - and writes findings rows tied to the visual and layout rules plus a token audit table. Use when someone asks why a dashboard "looks off", wants a visual or design QA, a contrast check, a design-token audit, or before and after a polish pass; /dash:polish and /dash:review-live call it. Do not use it for behaviour (save flow, focus order, error handling: use live-rule-audit), for information architecture, or to design tokens from scratch (use visual-tokens).
---

# Visual audit

Measure what the browser renders and compare it with one closed token set. Screenshots show alignment, density and hierarchy; computed styles give the exact values for spacing, type, colour, radius, shadow and contrast. Every finding names a value, the token it should be, and the rule it breaks.

## Input

- A running app URL, driven through the browser-adapter skill. Read-only steps: works in own-app and third-party-readonly mode.
- Or screenshots only: then spacing, type and colour values are estimates, and contrast is not computed (list it under Not checked).
- Optional: the token source (Tailwind theme, `globals.css`, `dash-spec/tokens.md`). Without one, infer the intended set from the most frequent values.

## Output

- Rows in `dash-review/findings.md` (beside the reviewed repo root, or `./dash-review`), in the shared format:
  `| # | Severity | Rule | Where | Evidence | Recommendation | Exit |`
  Where = `url @ viewport, step i` and the selector. Evidence = `[live]` plus the measured value against the expected token ("padding-top 22px on `main section:nth(2)`; card token 16px"), or "from screenshot" for alignment and density.
- `## Token audit` under the findings: `property | token set | values found | off-scale values (count) | where`. One row per property kind: spacing, font size, font weight, text colour, surface colour, accent use, radius, border, shadow, icon size.
- `## Not checked`: hover without a hover-capable tool, contrast without computed styles, dark mode without a switch.
- Evidence files under `dash-review/visual/`.

When called by /dash:polish or /dash:review-live, return the rows and the token table to the command.

## Procedure

1. **Driver.** Apply the browser-adapter skill (`../browser-adapter/SKILL.md`) to pick the tool and the mode. All steps here only read.
2. **Screenshots.** Run recipe 1 of `references/recipes.md`: home, an index, a detail and a settings page at 1440, 1024, 768 and 390 px. Look at each image. Note edges that do not line up (LAY-002), a settings column wider than about 1040 px at 1440 (LAY-001), cards inside cards (VIS-008), mixed icon styles (VIS-005), content clipped or scrolling sideways at 390 px, seen as a 390 px screenshot wider than 390 px (LAY-008), and density that changes from one region to the next (LAY-006).
3. **Computed styles.** Run recipe 2 once per page type. Fill the Token audit table: for each property kind, the token set and every value found. Then apply the table in the recipe:
   - Spacing on a 4 px scale, one card padding (LAY-006).
   - One text size for labels, cells and buttons; h1 above h2; weight 600 headings; muted helper text (VIS-004).
   - Saturated colour only for meaning: primary, links, selection, status (VIS-001); one filled primary per view (VIS-002).
   - Status as tinted text badges with one tone per label (VIS-003).
   - Outline icons in text colour (VIS-005).
   - Disabled faded, in place, same size (VIS-006).
   - Radius from the token set, nested concentrically (VIS-007).
   - One border, no shadow on bordered cards, no card in a card (VIS-008).
   - Light and dark from semantic tokens, no literal colours in components (VIS-009).
4. **Contrast.** Run recipe 3. For every text kind, pass the text colour and the backgrounds up to the first opaque ancestor to `scripts/contrast.mjs`. Compute every ratio with the script; never estimate from a screenshot. Badges (VIS-003), helper text (VIS-004), dark mode (VIS-009); other pairs "no rule, WCAG 1.4.3". Repeat in dark mode when the app has one.
5. **States.** Focus ring colour against its background at 3:1, from the live-rule-audit focus recipe. Disabled from step 3. Hover only with a tool that can hover; else list it under Not checked.
6. **Write findings.** Group values that share one cause into one row: one row "card padding 16/20/24 px across Settings", not one per card.
   - Severity: `blocker` only for text of a core task below 3:1 or controls that cannot be seen; `major` for a high or medium rule clearly broken (several filled primaries, VIS-002; spacing off scale across pages, LAY-006); `minor` for single off-scale values, low-confidence rules and polish; `note` for taste.
   - Recommendation names the design token to use, for example `--radius-card` (12px), or a new `--text-muted` token at 4.5:1.
   - Exit: `fix now` for blockers and token-level fixes; `file as task` for component rewrites; `reject with rationale` for intended exceptions (a brand chart palette); `verify with a test` for contrast pairs that a test can assert.
7. **Not checked.** List rule IDs whose check did not run and why.

## Rules applied

- LAY-001 — width set by page type.
- LAY-002 — full-width index tables aligned with the toolbar.
- LAY-003 — annotated settings sections.
- LAY-005 — titled sections, no nested cards.
- LAY-006 — one 4 px spacing scale, constant density.
- LAY-008 — content owns the phone width.
- VIS-001 — neutral surfaces, colour for meaning.
- VIS-002 — one filled primary per view.
- VIS-003 — status as tinted badges, 4.5:1.
- VIS-004 — short type scale, muted helper text at 4.5:1.
- VIS-005 — one outline icon set in text colour.
- VIS-006 — disabled faded, in place.
- VIS-007 — radii from one scale, concentric.
- VIS-008 — flat surfaces, one border.
- VIS-009 — light and dark from semantic tokens.
- VIS-010 — row density per user on work queues (low).

Full text: `references/rules.md`. Recipes: `references/recipes.md`. Contrast helper: `scripts/contrast.mjs`.

## Example

Good: on `http://localhost:3100/orders @ 1440x900`, recipe 3 reads the "Pending" badge as `color: oklch(0.795 0.184 86.047)` on `background-color: oklch(0.987 0.026 102.212)`. `node scripts/contrast.mjs "oklch(0.795 0.184 86.047)" "oklch(0.987 0.026 102.212)"` prints `"ratio":1.85`. Row: `2 | major | VIS-003 | http://localhost:3100/orders @ 1440x900, step 4, [data-slot=badge] | [live] "Pending" badge 1.85:1 (yellow-500 on yellow-50), computed | Use the warning badge token: dark amber text on pale amber, at least 4.5:1 | fix now`. The Token audit shows radius values 4, 6, 8, 12 px against a set of 6 and 12, with 4 and 8 in two components.

Bad: "the colours feel a bit low contrast" with no ratio; one row per card for the same padding drift; a recommendation to "make it pop" with no token; a contrast ratio guessed from a JPEG screenshot (no computed values, no rule ID).

## Self-check

- [ ] Every page type was captured at 1440, 1024, 768 and 390 px.
- [ ] Every contrast ratio came from `scripts/contrast.mjs` on computed colours, with all background layers.
- [ ] The Token audit table covers spacing, type, colour, radius, border, shadow and icon size.
- [ ] Every row names the measured value and the target token, or says "from screenshot".
- [ ] One cause, one row.
- [ ] No low-confidence rule alone is above `minor`.
- [ ] `## Not checked` lists hover, dark mode or contrast when they did not run.
