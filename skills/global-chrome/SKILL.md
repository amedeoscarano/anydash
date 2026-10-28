---
name: global-chrome
description: Decides the persistent chrome of an admin dashboard - top bar and sidebar header/footer slots for global search and the Cmd/Ctrl+K palette, notifications bell versus toasts, help and support entry, AI assistant entry, user/profile menu with logout, account or store switcher, keyboard shortcut map - and produces a chrome map with positions, contents and rule IDs at 1440 and 390 px. Use when building or reviewing the app shell, header, top bar, profile or account menu, search box, notification bell, help menu or "Ask AI" button, when deciding whether a bell is needed, or when /dash:build reaches the chrome step. Do not use it to decide what goes in the sidebar body (use nav-placement and sidebar-behavior), for the assistant's conversation behaviour once opened (use ai-assistant-ux), or for toast wording and timing (use feedback-messaging).
---

# Global chrome

Defines the controls that appear on every page, outside the page content: search, scope switcher, notifications, help and support, AI entry and the user menu. Each item gets one fixed position, a label, its contents and its narrow-width form.

## Input

- Product facts: number of scopes per user (accounts, stores, workspaces) and nested scopes; searchable objects; whether there is a persistent feed of items to act on; whether an AI assistant ships; whether keyboard shortcuts exist; docs, support and status page URLs.
- The placement table from nav-placement (rows with home "Top bar / chrome").
- Stack: React (default) or SwiftUI.

## Output

When run from /dash:build: the chrome section of `dash-spec/ia.md`. When asked directly: answer inline.

Table `Item | Position | Label / accessible name | Contents | 390 px form | Rule IDs`, then the ASCII layout of the shell (sidebar top, body, bottom, banner right), then a "Not included" list with the reason for each item left out (for example "No bell: no persistent feed, CHR-009").

## Procedure

Walk the decision branches in `references/frameworks/global-chrome-map.md` in order.

1. Pick the shell model. Default: sidebar plus a top-right banner cluster (two of three reference portals). Use sidebar-only when the product has no top bar for other reasons; then profile, help and alerts go at the sidebar bottom (CHR-008, CHR-011 exceptions).
2. Search. One search entry in the shared shell, same place on every page, including settings and detail pages (CHR-001). Default slot: sidebar top. Cmd+K / Ctrl+K opens it everywhere, with the hint on the trigger; "/" also opens it outside text fields (CHR-002). On open, show recents and scope chips, group results by type with a parent label, key hints in the footer, and a no-results message (CHR-003). When settings span more than about 15 pages or several scopes, the index includes settings pages (SET-012). If only one record type is searchable, say so in the placeholder (CHR-001 exception).
3. Scope switcher. More than one account, store or workspace per user: the current scope name as a button in the sidebar header, opening a searchable list with the current one selected and a create action (CHR-007). Single scope: show the name inside the user menu. Nested scope: switch from the scoped area header or a shortcut, and, as a suggestion, swap the sidebar (CHR-007 exception; NAV-009, low).
4. Notifications. Persistent feed of time-sensitive items to act on (failed jobs, payment disruptions): a bell with an unread count backed by a stored feed. No such feed: no bell. Outcomes of the user's own actions always go to toasts in one named live region mounted at the app root (CHR-009, FDB-008). Alert rules and delivery settings are a settings page, not chrome.
5. Help and support. One entry on every page, offering docs, contact or ticket, and service status when it exists; separate from the AI entry; external links open in a new tab and say so (CHR-011). Default slot: sidebar bottom under Settings. Inside the user menu only if that menu is always visible.
6. AI assistant. Only if the product ships one: one labelled entry ("Ask AI") in the chrome of every page and every sub-product shell, never only inside a menu (AI-001). It opens a right-docked panel that reflows content (AI-002, LAY-007). Give it a shortcut listed in the "?" map when shortcuts exist (AI-010, low). No assistant: add nothing.
7. User menu. One menu reachable from every page: signed-in identity, scope name when single-scope, links to profile preferences (theme, language, shortcuts), links to account pages, Log out last (CHR-008). Position: top right with a banner, sidebar bottom without one. Personal preferences open the profile page, not account settings (SET-008).
8. Keyboard shortcuts, only if the product has them: "?" opens a grouped map; two-key sequences with one intent per first letter, "g" for go to (CHR-004). Generate labels, targets and the search index from the nav config; keep old names as search aliases after a rename (CHR-005, low). A profile switch turns off single-key shortcuts (CHR-006, low).
9. Narrow widths. At 390 px every chrome item stays, as an icon button with an accessible name or as a drawer entry; ⌘K hints and label text may hide, controls may not (NAV-006; CHR-012, low: a suggestion). The assistant may open as a full-screen sheet (AI-002 exception).
10. Write the "Not included" list. No feedback entry, language switcher or status item in the chrome: the map has no rule for them.

## Rules applied

- CHR-001 — One global search entry, same place on every page.
- CHR-002 — Cmd/Ctrl+K and "/" open search everywhere (medium).
- CHR-003 — Search opens with recents and scopes, grouped results, key hints (medium).
- CHR-004 — "?" shortcut map, consistent two-key prefixes (medium).
- CHR-005 — Shortcuts and search index generated from the nav config (low).
- CHR-006 — Personal switch for single-key shortcuts (low).
- CHR-007 — Scope switcher in the sidebar header, searchable (medium).
- CHR-008 — One user menu: identity, preferences, Log out last.
- CHR-009 — Bell only for a real feed; toasts for action outcomes.
- CHR-011 — One help and support entry on every page, separate from AI.
- CHR-012 — Chrome items survive narrow widths with names (low).
- AI-001 — One labelled assistant entry on every page, when an assistant ships (medium).
- AI-002 — Assistant opens as a right-docked panel that reflows content (medium).
- AI-010 — Assistant shortcut listed in the shortcut help (low).
- SET-008 — Personal preferences on the profile, not in account settings.
- SET-012 — Search finds settings pages.
- FDB-008 — Toast and live regions mounted once at the app root.
- NAV-009 — Nested scope swaps the sidebar (low).

## Example

Shipping admin: users can manage two stores, an order event feed exists, no AI assistant, shortcuts planned.

Good:

| Item | Position | Label | Contents | 390 px | Rule IDs |
|---|---|---|---|---|---|
| Store switcher | Sidebar header | "Switch store", shows current name | Search, list, "Add store" | Drawer header | CHR-007, CHR-012 |
| Search | Sidebar top | "Search... ⌘K" | Recents, scopes Orders, Shipments, Settings | Icon button "Search" | CHR-001, CHR-002, CHR-003 |
| Alerts | Banner right | "Alerts, 2 unread" | Failed label jobs, carrier outages | Icon button | CHR-009 |
| Support | Sidebar bottom | "Support" | Help center, Submit a ticket, System status | Drawer entry | CHR-011 |
| User menu | Banner right | User's name | Signed in as, Profile, Keyboard shortcuts, Log out | Icon button | CHR-008, SET-008 |

Not included: AI entry (no assistant shipped, AI-001 exception).

Bad: a bell that lists only "Settings saved" history (CHR-009); Log out inside Settings > Account and theme toggle in the footer (CHR-008); search only on the Orders page (CHR-001); at 390 px Support disappears and the search icon has no accessible name (CHR-012); help reachable only by asking the AI chat (CHR-011).

## Self-check

- [ ] Search, help and the user menu are rendered by the shared shell on every route, settings included.
- [ ] A bell exists only if a stored feed backs it; toasts use one named live region.
- [ ] The scope switcher appears only for users with more than one scope; otherwise the scope name is in the user menu.
- [ ] Log out is the last item of the only user menu; no second logout control exists.
- [ ] The AI entry exists only if an assistant ships, and is separate from help.
- [ ] At 390 px every chrome item is present with a non-empty accessible name.
- [ ] Every row cites rule IDs; low-confidence rules are marked as suggestions.
