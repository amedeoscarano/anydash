---
name: polish
description: >-
  Fixes the visual layer of an admin dashboard, tokens first - it screenshots home, index, detail and settings pages at 1440/1024/768/390 px, runs the visual-audit skill (spacing scale, type scale, colour use, computed contrast, radius, borders and shadows, icons, disabled and focus styles, alignment), audits the token file and literal values in components, fixes the tokens, then the components that bypass them, and takes after screenshots to diff against the before set. Any fix that would touch information architecture or behaviour (moving a setting, changing a control type, save flow, navigation, states) is written down for /dash:review and not applied. Use when the user asks to polish, tidy, clean up or make consistent the look of a dashboard, fix contrast, or align it with its design tokens. Do not use it for a review without changes (use /dash:review or /dash:review-live), for redesigning pages or navigation (use /dash:build), or on a host where the code is not in the current repo.
disable-model-invocation: true
argument-hint: "[url|path]"
---

# Polish a dashboard

Make a dashboard look like one system without changing what it does. Measure first, fix the token set second, then bring the components that ignore the tokens back onto them. Before and after screenshots at four widths show what changed and catch what should not have.

## Input

`[url|path]`:
- A URL of the running app (localhost, 127.0.0.1, `*.localhost`, `*.test`, or a staging host the user named) plus the code in the current directory.
- Or a repo path. Start its dev script on a free localhost port (for example `npm run dev -- -p 3100`) in the background, and stop it at the end.
- A URL with no code here, or a third-party host: run the audit only (steps 1 to 4) and say that fixes need the code.

Token source, first found: `dash-spec/tokens.md`, then the theme in code (`app/globals.css` CSS variables, `tailwind.config.*`, the `@theme` block in Tailwind 4, a SwiftUI asset catalog).

## Output

- Code changes in the working tree, not committed: the token file first, then component files.
- `dash-review/polish/before/` and `dash-review/polish/after/`: screenshots per page and width, same file names.
- `dash-review/polish.md`:
  1. `## Tokens changed`: `token | before | after | rule`.
  2. `## Components changed`: `file:line | literal removed | token used | rule`.
  3. `## Screenshots`: `page @ width | before | after | changed | expected`. `expected` is yes when the change follows from a fix in this run.
  4. `## Remaining`: visual findings not fixed, each with a findings-format row and an Exit (`file as task`, `reject with rationale` or `verify with a test`).
  5. `## For /dash:review`: issues that need an IA or behaviour change, each with the rule ID and why polish did not touch it.

## Procedure

Specialist skills are siblings in this plugin: `/dash:<name>` in Claude Code, `dash-<name>` elsewhere. Read `../visual-audit/SKILL.md` and `../browser-adapter/SKILL.md` and follow them. If visual-audit is missing, apply the visual and layout rules in `references/rules.md` directly. If browser-adapter is missing, work from the code alone, skip screenshots, and say so in `polish.md`.

1. **Mode and driver.** Apply browser-adapter. Fixes need own-app mode and the code; otherwise stop after step 4.
2. **Before screenshots.** Run with browser-adapter (local script: `node ../browser-adapter/scripts/ownapp.mjs run <url> steps.json dash-review/polish/before`):
   ```json
   [{"goto": "/"}, {"responsive": "home"}, {"goto": "/orders"}, {"responsive": "orders"},
    {"goto": "/orders/1001"}, {"responsive": "order-detail"}, {"goto": "/settings/general"}, {"responsive": "settings-general"}]
   ```
   Use the app's real paths: one home, one index, one detail, one settings page, plus any page the user named.
3. **Visual audit.** Apply visual-audit on the same pages: computed styles, contrast from `node scripts/contrast.mjs` in the visual-audit folder, the Token audit table, findings rows.
4. **Token audit in code.** List the token set and every literal that bypasses it:
   - Tokens: `rg -n -- '--[a-z-]+:' app/globals.css` and the `theme` or `@theme` block.
   - Literal colours: `rg -n '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(' --glob '!**/globals.css' app components`
   - Tailwind arbitrary values: `rg -n '\b(p|px|py|m|mx|my|gap|space-[xy]|rounded|text|bg|border|shadow)-\[[^\]]+\]' app components`
   - Raw palette classes instead of semantic ones: `rg -n '\b(bg|text|border)-(red|blue|green|yellow|amber|gray|zinc|slate)-[0-9]{2,3}\b' app components`
   - Inline styles: `rg -n 'style=\{\{' app components`
   Match each literal to a visual-audit row or add one.
5. **Sort every row.** Three kinds:
   - Token fix: the token value is wrong or missing (muted text below 4.5:1, VIS-004; badge tones, VIS-003; more radii than the scale, VIS-007; no dark values, VIS-009).
   - Component fix: a component uses a literal or the wrong token (`p-[22px]` instead of the card padding, LAY-006; a second filled primary, VIS-002; a shadow on a bordered card, VIS-008; a coloured nav icon, VIS-005).
   - Not polish: anything that changes information architecture or behaviour. Examples: moving a setting or a menu item (NAV-001, SET-001), a switch in a Save form (CTL-002), the save bar or leave guard (SAV-001, SAV-005), a missing drawer below 768 px (NAV-006), focus order, empty or error states (STA-001, STA-004), copy changes (MCP-001). Write these under `## For /dash:review`; do not edit them. A focus ring colour or thickness is visual and may be fixed.
6. **Fix tokens first.** Edit the token file only. Keep names; change values, or add a missing semantic token (`--text-muted`, `--badge-warning-fg`). Give every new colour a dark value too (VIS-009). Check every new text pair with the contrast script before saving.
7. **Then components.** Replace each literal from step 4 with its token or semantic class. One cause, one change; do not restyle what no row names. Do not add dependencies or new components. Keep each component's markup and handlers unchanged; only classes and style values move.
8. **After screenshots and diff.** Run the step 2 steps again into `dash-review/polish/after`. Compare each pair: `cmp -s before/<f>.png after/<f>.png` sorts changed from unchanged. Open every changed pair and confirm the change matches a fix. A change on a page or region no fix touched is a regression: find the cause and revert it, or record it with a reason. Re-run the visual-audit checks for the fixed rows, including contrast, and record pass or fail.
9. **Report.** Write `dash-review/polish.md`. In chat: tokens changed, components changed, screenshot pairs changed, remaining rows, and the `## For /dash:review` list. Do not commit; leave the diff for the user.

## Rules applied

- LAY-001 — width set by page type.
- LAY-002 — full-width index tables, aligned edges.
- LAY-005 — titled sections, no card inside a card.
- LAY-006 — one 4 px spacing scale, constant density.
- LAY-008 — content owns the phone width.
- VIS-001 — neutral surfaces, colour spent on meaning.
- VIS-002 — one filled primary per view.
- VIS-003 — status as tinted badges at 4.5:1.
- VIS-004 — short type scale, muted helper text at 4.5:1.
- VIS-005 — outline icons in text colour.
- VIS-006 — disabled faded, in place.
- VIS-007 — radii from one scale, nested concentrically.
- VIS-008 — one border, no shadow on bordered cards.
- VIS-009 — light and dark from semantic tokens.

Full text: `references/rules.md`.

## Example

Good: `/dash:polish http://localhost:3100`. visual-audit reports helper text at `oklch(0.705 0.015 286.067)` on white, 2.63:1 (VIS-004), card paddings of 16, 20 and 24 px (LAY-006), and "Export" and "Create order" both filled (VIS-002). Tokens changed: `--muted-foreground 0.705 → 0.552` lightness, 4.83:1 after. Components changed: `components/order-card.tsx:12 p-[20px] → p-4`, `app/orders/page.tsx:31` Export to the outline variant. Screenshots: orders and settings changed at all four widths as expected; home unchanged. For /dash:review: "Email notifications" switch inside the Save form on Settings > Notifications (CTL-002), not changed.

Bad: polish turns the notifications switch into a checkbox and adds a save bar (behaviour, belongs to /dash:review); hard-codes `#6b7280` in twelve components instead of fixing the token; changes paddings on pages with no finding; no after screenshots, so a broken header at 390 px goes unseen; commits the result.

## Self-check

- [ ] Before and after screenshots exist for every page at 1440, 1024, 768 and 390 px, with the same names.
- [ ] Token fixes came before component fixes; no new literal values were added to components.
- [ ] Every new or changed colour pair passes its contrast threshold, checked with the script, in light and dark.
- [ ] Every changed screenshot pair is explained by a fix, or listed as a regression.
- [ ] No IA or behaviour change was applied; each one is under `## For /dash:review` with its rule ID.
- [ ] Nothing was committed; a dev server started by the command was stopped.
