---
name: sidebar-behavior
description: Specifies how an admin dashboard sidebar behaves - item order, groups, sub-items, labels, icons, active state, collapse to an icon rail, behaviour at 1440, 1024, 768 and 390 px, scope switcher slot, badges, personalisation and extension slots for installed apps - and writes a sidebar spec with rule IDs, plus React (shadcn/ui Sidebar) or SwiftUI (NavigationSplitView) notes. Use when building or reviewing a dashboard sidebar or left navigation, when the menu feels cluttered or users get lost, when adding a mobile drawer, collapse toggle, badge counts, nested items or an "Apps" group, or when /dash:build reaches the IA step after nav-placement. Do not use it to decide which functions belong in the sidebar at all (use nav-placement first), for the top bar, search, profile or help menu (use global-chrome), or for settings sub-navigation content (use settings-architecture).
---

# Sidebar behavior

Turns the sidebar rows of a placement table into a concrete sidebar: order, grouping, labels, states and responsive behaviour. It does not decide what goes in the sidebar; nav-placement does that.

## Input

- The placement table from nav-placement (or `dash-spec/ia.md`): every row whose home is Sidebar, Sub-nav or Settings entry, with frequency.
- Product facts: number of scopes per user (accounts, stores, workspaces), nested child scopes, installable apps or extensions, work queues with pending counts.
- Stack: React (default) or SwiftUI.

## Output

When run from /dash:build: the sidebar section of `dash-spec/ia.md`. When asked directly: answer inline.

1. Item table: `Order | Label | Icon | Group | Sub-items | Badge | Rule IDs`.
2. Behaviour table: `Width | Sidebar form | Toggle | Rule IDs` for 1440, 1024, 768 and 390 px.
3. A short list of states: active, collapsed, child scope, extension group, personalisation.

For code, follow `references/react.md` or `references/swiftui.md`.

## Procedure

1. Order the top-level items. Home or the main work queue first, then work areas by daily frequency, then a separator and the bottom block: Settings, then account items (NAV-001, SET-005). Keep billing, users and API keys out of the work list (SET-009).
2. Label each item with a short noun in sentence case that matches the target page H1 (NAV-002). No verbs ("Create shipment" is a button, not a destination).
3. Decide structure. About ten or fewer destinations: one flat list. More: labeled groups; sub-items only inside a disclosure under their parent (NAV-005, low confidence, a suggestion). Nest deeper only for products with dozens of services; then label every group and keep a search over all pages (NAV-005 exception).
4. Give every top-level item an icon from one set (NAV-003). Bottom-block utility links may be text-only while expanded, but need an icon if they stay in the rail.
5. Define the active state. Filled highlight on the item plus `aria-current="page"`; parent stays expanded when the active page is a sub-item; detail pages highlight their object's list item (NAV-004).
6. Define collapse. A toggle named "Collapse navigation" / "Expand navigation" with `aria-expanded`; the rail keeps every item's icon, with the label as tooltip and accessible name (NAV-003).
7. Set the breakpoints:
   - 1440 px: expanded sidebar, user can collapse to the rail (NAV-003).
   - 1024 px: expanded by default, collapsible (NAV-003).
   - 768 px: icon rail is acceptable (NAV-006 applies_when); badges stay visible (NAV-011).
   - 390 px: no sidebar; one "Menu" button opens a drawer with focus trap, Escape to close, focus back to the button; content gets the full width (NAV-006, LAY-008). Settings, scope switcher and badges stay reachable in the drawer (SET-005, NAV-011; CHR-012, low).
8. Place the scope switcher. If a user can belong to more than one account, store or workspace, the current scope name sits in the sidebar header as a button that opens a searchable list with a create action (CHR-007). Single scope: show the name in the user menu instead. Nested child scope with many feature pages: swap the sidebar for the child's menu, headed by the child name and a back link to the parent list (NAV-009, low).
9. Add badges. Numbers only for actionable queues, with an accessible name that says what is counted ("Orders, 3 to fulfil"); text pills for New or Beta; counts never hidden at narrow widths (NAV-011).
10. Add the extension slot when apps or plugins can add pages. A labeled, collapsible "Apps" group below the core items; an open app shows its sub-items under its own entry, its Settings last (SET-003); suggestion: users can pin and unpin (NAV-010, low). Data-only integrations add no item (INT-011).
11. Add personalisation only when one role uses a fraction of the menu. Pin, hide or recents, stored per user, not per browser; Home and Settings cannot be hidden or moved (NAV-012).
12. When settings span several pages, entering Settings shows its own navigation with a labeled back link to the main menu, and each page has its own URL (SET-004).

## Rules applied

- NAV-001 — Work areas first by frequency, account items last and separated.
- NAV-002 — Noun labels in sentence case, matching the page H1.
- NAV-003 — Icons on every top-level item, collapsible icon rail with tooltips.
- NAV-004 — Filled active state, aria-current, parent expanded.
- NAV-005 — Flat up to about ten items, groups above that (low).
- NAV-006 — Drawer below about 768 px; rail acceptable from 768 to 1024 px (medium).
- NAV-009 — Child scope swaps the sidebar, with a back link (low).
- NAV-010 — Extensions in a labeled collapsible group with pin and unpin (low).
- NAV-011 — Numeric badges only for work queues, visible at every width (medium).
- NAV-012 — Per-user pin, hide and recents; Home and Settings fixed (medium).
- SET-004 — Settings has its own navigation, back link and URLs.
- SET-005 — Settings entry fixed at the sidebar bottom.
- SET-009 — Account administration stays out of the work list.
- CHR-007 — Scope switcher in the sidebar header, searchable (medium).
- CHR-012 — Nothing dropped at narrow widths; names kept (low).
- LAY-008 — Content owns the phone width.

## Example

Shipping admin, one account per user, 8 destinations.

Good:

| Order | Label | Icon | Group | Badge | Rule IDs |
|---|---|---|---|---|---|
| 1 | Home | house | - | - | NAV-001 |
| 2 | Orders | inbox | - | "12" = 12 to ship | NAV-001, NAV-011 |
| 3 | Shipments | truck | - | - | NAV-002 |
| 4 | Pickups | calendar | - | - | NAV-002 |
| 5 | Returns | rotate | - | "Beta" pill | NAV-011 |
| 6 | Reports | chart | - | - | NAV-001 |
| - | separator | | | | NAV-001 |
| 7 | Settings | gear | bottom block | - | SET-005 |

At 390 px a "Menu" button opens a drawer that still shows the "12" badge and Settings (NAV-006, NAV-011).

Bad: "Create shipment" and "API keys" as items 2 and 3 (NAV-002, SET-009); groups and a three-level tree for 8 items (NAV-005); at 768 px the badge is hidden by a CSS rule (NAV-011); the collapsed rail shows unlabeled icons with no tooltip (NAV-003).

## Self-check

- [ ] First item is Home or the main work queue; Settings and account items are last, after a separator.
- [ ] Every label is a sentence-case noun that matches its page H1.
- [ ] Exactly one item has `aria-current="page"` on list, detail and sub-item pages.
- [ ] Collapse toggle has `aria-expanded`; every rail icon has an accessible name and tooltip.
- [ ] At 390 px the sidebar is a drawer, no horizontal scroll, badges and Settings still reachable.
- [ ] Numeric badges count only actionable items and say what they count.
- [ ] Scope switcher present only when users have more than one scope.
- [ ] Low-confidence rules (NAV-005, NAV-009, NAV-010, CHR-012) are labelled as suggestions.
