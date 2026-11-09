---
name: visual-tokens
description: Defines the design tokens of an admin dashboard - spacing scale, type scale, semantic colour (light and dark), status tones, radius, borders and shadows, row density, icon sizes, disabled style and layout widths and breakpoints - and produces a token table (dash-spec/tokens.md) plus the token file for the stack, or an inline answer. Use when starting the visual layer of a back office, settings area or internal tool, when setting up Tailwind or CSS variables, when adding dark mode, when choosing button, badge or card styles, or when reviewing a UI for ad hoc colours, mixed paddings, too many font sizes or several filled primary buttons. Use it before writing component styles. Do not use it for brand assets shown to customers (tracking pages, emails, storefront previews), for chart and data visualisation palettes, for marketing sites, or for choosing which control or page template to use.
---

# Visual tokens

Turn the visual rules into a small, closed set of tokens so every page looks like one system: neutral surfaces, colour only where it means something, one spacing scale, a four-step type scale, a few radii, one border style, and light and dark from the same names. Components read tokens only; no literal values in component code.

## Input

- The spec so far (`dash-spec/pages.md`, `dash-spec/controls.md`) or a repo path. From a repo, read the Tailwind config, global CSS, theme files and the component library.
- Brand: logo and one accent colour if the product has one. Nothing else from the brand is needed.
- Stack: default Next.js + Tailwind + shadcn/ui (CSS variables in `globals.css`); SwiftUI uses asset-catalog colours and a spacing enum.

## Output

From /dash:build: write `dash-spec/tokens.md` with one table per scale.

`Token | Light value | Dark value | Used for | Rule ID`

Scales, in order: spacing, type, colour, status tones, radius, border and shadow, density, icon, disabled, layout widths and breakpoints. Then write the stack's token file (for shadcn/ui, the CSS variables block and the Tailwind theme extension).

Asked directly: answer inline with the tables that apply, or a list of findings with rule IDs when reviewing.

## Procedure

1. Spacing. One scale on a 4 px base: 4, 8, 12, 16, 24, 32 (add 48 for page gutters if needed). One card padding token for the whole product; pick one density level and keep it from the top to the bottom of every page (LAY-006).
2. Type. Four steps: page title (about 24 px, semibold), section title (about 16 px, semibold), body (13-14 px, shared by labels, controls and table data), secondary (13-14 px, muted colour). Heading weight 600; no bold body text. Only KPI figures may use a larger display size (VIS-004).
3. Colour. Define semantic tokens only: `surface`, `surface-subtle`, `text`, `text-muted`, `border`, `accent`, `accent-foreground`, `focus`. Surfaces and text are neutral. Saturated colour is reserved for the primary action, links, the current selection and status; brand colour stays in the logo and at most one chrome band (VIS-001). Check muted text against each surface at 4.5:1 (WCAG AA; no rule ID).
4. Status tones. A closed set: success (green), warning (yellow or orange), critical (red), info (blue), neutral (gray), each as a text colour on a light tint. The badge component accepts only these tones and requires a text label (VIS-003). Check every text/tint pair at 4.5:1 (WCAG AA; no rule ID).
5. Light and dark. VIS-009 applies to products used for long working sessions or by technical users; for others, dark mode is optional. Give every colour token a dark value, check every status pair again at 4.5:1, and expose "Appearance: System / Light / Dark" as a personal preference stored per user (VIS-009, SET-008). Customer-facing previews keep the customer's own colours.
6. Radius. Three or four tokens: control, card, pill (full). Nested elements use outer radius minus the padding between them. Full-width bars and table cells stay square (VIS-007).
7. Border and shadow. Cards and panels use one 1 px border or ring, never border plus shadow, and never a card inside a card. Sticky bars get a border on the edge facing content. Shadow tokens exist only for floating layers: menu, popover, dialog, toast (VIS-008, LAY-005).
8. Buttons. One filled accent variant, used at most once per view or dialog; every other action is outlined or plain. A destructive confirmation uses the critical tone as its primary (VIS-002).
9. Icons and disabled. One outline icon set, drawn in `currentColor`, with one or two size tokens; colour only for the active item or a status (VIS-005). Disabled is the control's own style at 0.4-0.6 opacity, same size and position, never hidden. Omit only an action no role or plan can ever grant (VIS-006 and its exceptions).
10. Density. Work-queue tables people process all day may offer "Row density: Compact / Comfortable" per user, from two row-height tokens; forms and settings keep one fixed density (VIS-010, low; LAY-006).
11. Layout. Settings and form column max width 640-1040 px, centred; index, log and home pages full width (LAY-001, LAY-002). Detail pages 2:1 main and side columns; objects made of several equal areas use tabs on one full-width column instead (LAY-004). Side panels dock and reflow from about 1024 px (LAY-007). Below about 768 px, one column and no page-level horizontal scroll (LAY-008). Settings sections use the annotated two-track grid only when the column is about 800 px or wider (LAY-003).
12. Write the token file. Then grep the components for literal hex, rgb, px radius and off-scale spacing; each hit becomes a token or a finding.

## Rules applied

- VIS-001 — neutral surfaces; colour only for primary action, links, selection and status (medium).
- VIS-002 — one filled primary button per view (high).
- VIS-003 — status as tinted text badges from a fixed tone mapping (medium).
- VIS-004 — four-step type scale, one body size, muted secondary text (high).
- VIS-005 — one outline icon set in text colour (medium).
- VIS-006 — disabled is faded but stays in place (high).
- VIS-007 — radii from one scale, nested concentrically (high).
- VIS-008 — one 1 px border, no card in card, shadows only on floating layers (medium).
- VIS-009 — semantic colour tokens; light and dark as a per-user preference (medium).
- VIS-010 — per-user row density on work-queue tables (low).
- LAY-001 — settings and forms in a capped centred column; lists full width (medium).
- LAY-002 — index tables span the full main area (high).
- LAY-003 — annotated settings sections on wide columns (medium).
- LAY-004 — two-column detail, about 2:1 (medium).
- LAY-005 — stack of titled sections, no nested cards (high).
- LAY-006 — one 4 px spacing scale, constant density (high).
- LAY-007 — side panels reflow content (medium).
- LAY-008 — content owns the phone width (medium).
- SET-008 — appearance is a personal preference, apart from account settings (medium).

Full text of VIS and LAY rules: `references/rules.md`. SET-008 lives in the rule-library skill.

## Example

Good (infra admin): `--surface: #ffffff`, `--surface-subtle: #f6f7f8`, `--text: #1a1d21`, `--text-muted: #5f6670` (5.4:1 or better on both surfaces), `--accent: #1f5fd1` used only by the "Add domain" button, links and the selected nav item (VIS-001, VIS-002). Badge tones success/warning/critical/info/neutral, "Active" dark green on pale green (VIS-003). Type 24/16/14/13 px, headings 600 (VIS-004). Radius 4 / 12 / 9999 px; cards 1 px border, no shadow; menus and dialogs carry the only shadow (VIS-007, VIS-008). Spacing 4-32 px, card padding 16 px everywhere (LAY-006). Dark values for every token, Appearance on the personal profile page (VIS-009, SET-008).

Bad: brand orange section headers and coloured icons on every menu item (breaks VIS-001, VIS-005); Import, Export and Add product all filled in the accent (breaks VIS-002); cards with border plus drop shadow holding another card (breaks VIS-008); paddings of 13 px and 22 px on one page and six font sizes (breaks LAY-006, VIS-004); `#fff` hard-coded in components so dark mode cannot work (breaks VIS-009).

## Self-check

- Every colour in component code is a semantic token; a dark value exists for each.
- Status tones are a closed set of five; every text/tint pair passes 4.5:1 in light and dark.
- Spacing values are multiples of 4 px; one card padding token.
- At most five font sizes; labels, controls and table data share one size.
- Radius comes from 3-4 tokens; shadows appear only on floating layers.
- No view has more than one filled accent button.
- Settings width is capped at 640-1040 px; index pages are full width; phone width has no page scroll.
- VIS-010 is labelled as a suggestion (low confidence).
