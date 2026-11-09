# Visual audit recipes

Steps for the browser-adapter own-app driver (`node ../browser-adapter/scripts/ownapp.mjs run <base-url> <steps.json> <outdir>`). They only read: they also run in third-party-readonly mode through a browser MCP that can read computed styles. `styles` returns computed values for the first 20 matches of a selector, so split broad selectors per region. Replace selectors with the app's own from a first snapshot and screenshot. Keep the `wait` after each `goto` on pages that load data in the browser, or the styles describe the loading placeholder.

## 1. Screenshots at four breakpoints

```json
[
  {"goto": "/"},
  {"responsive": "home"},
  {"goto": "/orders"},
  {"responsive": "orders"},
  {"goto": "/orders/1001"},
  {"responsive": "order-detail"},
  {"goto": "/settings/general"},
  {"responsive": "settings-general"}
]
```

`responsive` writes a snapshot and a screenshot at 1440, 1024, 768 and 390 px. Look at every screenshot. Note misaligned edges (table versus toolbar versus page header, LAY-002), a settings column wider than about 1040 px at 1440 (LAY-001), cards inside cards (VIS-008), crowded or empty regions, clipped text at 390, or a 390 px screenshot wider than 390 px, which means the page scrolls sideways (LAY-008; see recipe 1 of live-rule-audit), and icons of mixed styles (VIS-005). Alignment and density come from screenshots: say so in Evidence ("from screenshot").

## 2. Computed styles per component kind

One run per page type (index, detail, settings). Example for a settings page:

```json
[
  {"goto": "/settings/general"},
  {"wait": 1000},
  {"styles": {"selector": "body", "props": ["background-color", "color", "font-family", "font-size"]}},
  {"styles": {"selector": "h1, h2, h3", "props": ["font-size", "font-weight", "line-height", "color"]}},
  {"styles": {"selector": "label", "props": ["font-size", "font-weight", "color"]}},
  {"styles": {"selector": "main p", "props": ["font-size", "color", "background-color"]}},
  {"styles": {"selector": "button", "props": ["font-size", "background-color", "color", "border-radius", "padding-top", "padding-left", "height", "opacity"]}},
  {"styles": {"selector": "input, select, textarea, [role=combobox]", "props": ["border-radius", "border-color", "height", "padding-left", "font-size"]}},
  {"styles": {"selector": "main section, main [class*=card]", "props": ["padding-top", "padding-left", "gap", "margin-bottom", "border-radius", "border-top-width", "border-color", "box-shadow", "background-color"]}},
  {"styles": {"selector": "nav a, nav svg, button svg", "props": ["color", "width", "height", "stroke-width"]}},
  {"styles": {"selector": "[class*=badge], [data-slot=badge]", "props": ["color", "background-color", "border-radius", "font-size"]}},
  {"styles": {"selector": "[disabled], [aria-disabled=true]", "props": ["opacity", "cursor", "color", "background-color"]}},
  {"screenshot": "settings-styles"}
]
```

For an index page add `table, th, td, tbody tr` with `font-size`, `padding-top`, `padding-left`, `height`, `color`. Compare against the token set (the repo's theme file, or `dash-spec/tokens.md`):

| Check | Assertion | Rule |
|---|---|---|
| Spacing | at least 95% of non-zero padding, margin and gap values are multiples of 4 px; sibling cards share one padding | LAY-006 |
| Type | labels, cells and buttons share one size (13 or 14 px); h1 larger than every h2; headings weight 600; helper text lighter than labels | VIS-004 |
| Colour | values with HSL saturation above 30% appear only on the logo, primary button, links, selected item, badges and banners | VIS-001 |
| Primary | at most one visible button with the accent background outside dialogs | VIS-002 |
| Badges | every badge has text and passes 4.5:1; one label, one tone across pages | VIS-003 |
| Icons | icon colour equals the parent text colour except the active item and status icons; one stroke width | VIS-005 |
| Disabled | disabled controls stay in place, opacity at least 0.4, same size as enabled | VIS-006 |
| Radius | every radius belongs to the token set; one value per component kind; nested radius smaller than its container | VIS-007 |
| Borders and shadow | cards with a border have `box-shadow: none` (a ring is fine); no card inside a card | VIS-008 |

Saturation: run the colour through `scripts/contrast.mjs` (it prints the sRGB hex of each colour) and read the hue and saturation from the hex.

## 3. Contrast from computed colours

For each text kind (body text, helper text, labels, table cells, links, badges, button labels, placeholder text, disabled labels) read the text colour and the background of the element and of its ancestors up to the first opaque one:

```json
[
  {"goto": "/orders"},
  {"wait": 1000},
  {"styles": {"selector": "main td, main th", "props": ["color", "background-color", "font-size", "font-weight"]}},
  {"styles": {"selector": "main tr, main table, main", "props": ["background-color"]}},
  {"styles": {"selector": "[class*=badge], [data-slot=badge]", "props": ["color", "background-color", "font-size"]}},
  {"styles": {"selector": "main p, main small, [class*=muted]", "props": ["color", "background-color", "font-size"]}},
  {"styles": {"selector": "body", "props": ["background-color"]}}
]
```

Compute the WCAG 2.x ratio from these values with the helper, never by eye:

```
node scripts/contrast.mjs "<color>" "<element background>" "<parent background>" ... "<body background>"
```

Pass the backgrounds from the nearest to the farthest; transparent layers are composited, and white is assumed under everything. The script reads `rgb()`, `rgba()`, `color(srgb ...)`, `oklch()` and `oklab()` as Chrome returns them, and fails on other formats rather than guess. Thresholds: 4.5:1 for normal text, 3:1 for text at least 24 px, or 18.66 px and bold, and for focus indicators and control borders.

Rules: VIS-003 for badges, VIS-004 for helper text, VIS-009 for every pair in dark mode. Other text pairs have no rule ID: report them as "no rule, WCAG 1.4.3". Contrast on text a user needs to finish a core task (button labels, field labels, errors) below 3:1 is a `blocker`.

Dark mode: emulate `prefers-color-scheme: dark` with a browser MCP, or, in own-app mode only, switch the app's own appearance setting and switch it back afterwards (in third-party-readonly mode that setting is a write: list dark mode under Not checked). Repeat the run, and check that `body` background has relative luminance below 0.2 and every pair passes (VIS-009).

## 4. Interaction states

- Focus: use the focus recipe of the live-rule-audit skill and check the outline or ring colour against its background at 3:1.
- Disabled: covered by the `[disabled]` styles above (VIS-006).
- Hover: needs a hover action. ownapp has none: run hover checks only with a browser MCP that can hover, else list hover under Not checked.
