---
name: settings-architecture
description: Designs the settings tree of an admin dashboard and the layout of each settings page. Decides what goes into settings at all (versus the main menu, the object page, a sub-area or the personal profile), how settings are grouped and navigated, where the settings entry sits, and how a settings page is laid out (width, annotated sections, current values, save scope). Produces a settings tree table and a page-layout spec. Use when adding or reorganising settings, when a settings list grows past a handful of pages, when someone asks "where should this setting go?", or when reviewing a settings area that feels cluttered or hard to find things in. Run it from /dash:build for the IA step. Do not use it to pick the control for one field (use control-selection), to decide how a change is committed (use save-model), or for main-menu order of work objects (use nav-placement).
---

# Settings architecture

Decide which configuration belongs in settings, how the settings area is structured and navigated, and how each settings page is laid out. The goal is a settings area people rarely need, find things in fast, and can scan without opening editors. Work objects stay out of it; per-object options stay on the object.

## Input

- A product brief, an inventory (objects, jobs, frequency, roles, risk), or a repo path.
- From a repo: read routes, settings pages, forms and models to list every existing setting with its scope.
- Optional: the current settings list to reorganise.

## Output

Run from /dash:build: take nav-placement's placement table as given, and write the settings part of `dash-spec/ia.md` with only the rows whose home is Settings, plus the page layouts. Asked directly: answer inline. Either way, two parts.

1. Settings tree, a Markdown table:
   `setting or page | scope (object, sub-area, person, account) | home | group | rule IDs`
   Asked directly, rows that do not belong in settings stay in the table with their real home (object page, profile, main menu). From /dash:build, nav-placement owns those rows; do not repeat them.
2. Settings page layout, one block per page:
   `URL | width | sections (title, one-line description) | save scope per section (page save bar, section Save, or instant) | current-value display`

Add a "Do not build" line for any setting with no real user need: in `dash-spec/index.md` from /dash:build, inline when asked directly.

## Procedure

1. List every candidate setting and give it a scope: one object, one sub-area, one person, or the whole account. From /dash:build, start from nav-placement's rows whose home is Settings and skip step 2; if a row looks misplaced, raise it as an open question instead of moving it.
2. Walk the gate in `references/frameworks/settings-taxonomy.md` section 1 for each row, stopping at the first yes:
   - Daily work object or job: main menu, not settings (SET-001).
   - Belongs to one object: that object's page, as a section or Settings tab (SET-002).
   - Belongs to one sub-product, channel or app: that area's own Settings item, last in its group (SET-003; medium confidence, a single-product tool may centralise instead).
   - Belongs to one person: profile page (SET-008).
   - Otherwise account-wide: settings.
   For anything that is not a setting (an action, a tool, a log), use `references/frameworks/placement-decision-tree.md`.
3. Put plan and billing, users and roles, API keys and the audit log in settings or a separated account-admin block (SET-009). Skip billing when billing happens outside the product.
4. For account defaults that objects can override, note on the object page "Inherited" vs "Customised" and where the default lives (SET-011; low confidence, a suggestion).
5. Group the settings list on one axis per level: business domain for commerce, workflow phase for operational tools, product for multi-product platforms (SET-007). Use the area table in the taxonomy, section 2, as a checklist of groups. Add group headings past about 20 entries.
6. Navigation:
   - Settings entry fixed at the sidebar bottom, separated from work items (SET-005).
   - Entering settings shows its own list beside or instead of the main menu, with "Back to main menu"; every page has its own URL (SET-004).
   - The entry lands on the first, most used page with the list visible, not on a grid of tiles (SET-006).
   - Past about 15 pages, add "Search settings" or index settings in global search (SET-012).
7. Lay out each page:
   - Centred column, max width about 640 to 1040 px; wide tables may widen (LAY-001).
   - A vertical stack of titled sections, one topic each, no nested cards (LAY-005).
   - Column of 800 px or more: title and description left, controls right; narrower: description above controls (LAY-003).
   - Every setting shows its current value as the live control or a summary row; secrets show masked or "Set" (SET-010).
   - One spacing scale, constant density (LAY-006). At phone width, stack to one column and collapse the settings list behind a menu button (LAY-008).
8. Mark the save scope per section: one page form with a sticky bar (SAV-001), a Save per independent section (SAV-003), or instant, with switches and no Save (SAV-002, CTL-002). A section of independent on/off settings, and every pane of a macOS `Settings` scene, is instant. Hand the detail to the save-model skill and the field controls to control-selection. If those siblings are not installed, apply SAV-001 to SAV-005 and CTL-001 to CTL-007 from the rule-library skill directly.
9. Check that each setting appears in exactly one place. Record every placement choice with its rule IDs in the decision log.

## Rules applied

- SET-001 — daily work in the menu, rare account config in settings.
- SET-002 — per-object configuration on the object page.
- SET-003 — sub-area settings as the last item of that sub-area's nav group (medium).
- SET-004 — settings as a mode with its own list, back link and URLs.
- SET-005 — settings entry fixed at the sidebar bottom.
- SET-006 — entry opens the first settings page, not a tile grid.
- SET-007 — one grouping axis per level, headings past about 20 entries.
- SET-008 — personal preferences on the profile page.
- SET-009 — billing, users, API keys, audit log in settings or account admin.
- SET-010 — current value visible without opening an editor.
- SET-011 — inherited vs customised shown on the object (low).
- SET-012 — search across settings past about 15 pages.
- LAY-001 — capped centred column for settings and forms.
- LAY-003 — annotated sections: description left, controls right.
- LAY-005 — stack of titled sections, no nested cards.
- LAY-006 — one 4 px spacing scale, constant density.
- LAY-008 — one column at phone width.
- SAV-001 — sticky save bar for one form per page.
- SAV-002 — instant controls apply at once and confirm with a toast.
- SAV-003 — save per section when sections are independent.
- CTL-002 — switch only for instant changes.

Full text, exceptions and checks: `references/rules.md`; rules from other areas (SAV) are in the rule-library skill. Implementation notes: `references/react.md` (Next.js + shadcn/ui), `references/swiftui.md`.

## Example

Shipping admin with orders, shipments, carriers, a returns app and three users.

Good:

| setting or page | scope | home | group | rule IDs |
|---|---|---|---|---|
| Shipments queue | work | Main menu | - | SET-001 |
| Package weight of one product | object | Product page, "Shipping" section | - | SET-002 |
| Default weight unit, currency | account | /settings/general | General | SET-001, SET-010 |
| Carrier accounts | account | /settings/carriers | Connect | SET-007 |
| Return reasons | sub-area | Returns group > "Returns settings" (last item) | - | SET-003 |
| Dark mode, own password | person | Profile menu > Profile | - | SET-008 |
| Users, API tokens, Audit log | account | /settings/users, /settings/api, /settings/audit-log | Account | SET-009 |

/settings/general: column max 960 px; sections "Store details" and "Units and currency", each with title and one-line description left and controls right; the "Weight unit" select reads "kg" before any edit. Clicking Settings in the sidebar bottom opens this page with the full list on the left (SET-004, SET-005, SET-006, LAY-001, LAY-003, SET-010).

Bad: a top-level menu item "Label format" next to "Orders" (breaks SET-001). Settings opens a grid of 18 tiles (SET-006). A "Products" settings page with a product dropdown to edit one product's options (SET-002). Dark mode on the same page as the account currency (SET-008). A three-field form stretched to 1800 px with labels far left and controls far right (LAY-001). A row "Shipping rates — Edit" with no hint of the current value (SET-010).

## Self-check

- [ ] Every row has a scope and a home, and no work queue sits in settings (SET-001).
- [ ] No per-object or personal setting is left in account settings (SET-002, SET-008).
- [ ] One grouping axis per level; headings added if the list passes about 20 entries (SET-007).
- [ ] Settings entry at the sidebar bottom; every settings page has a URL and a back link (SET-004, SET-005).
- [ ] Each page states width, sections and a save scope per section (page save bar, section Save or instant); no nested cards (LAY-001, LAY-005, SAV-001, SAV-002, SAV-003).
- [ ] Every setting shows its current value; secrets are masked (SET-010).
- [ ] Every rule ID cited exists in `references/rules.md` or the rule library.
