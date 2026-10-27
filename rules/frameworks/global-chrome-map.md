# Global chrome map (question 13)

Where search, notifications, help, AI, profile and the scope switcher live, as observed in three admin portals, and where to put them.
Sources: `dash-research/comparison.md` Q13 and Q20, portal summaries (verification notes win), public docs.
Marks: **obs** observed live, **doc** public docs, **inf** inferred, **abs** looked for, not found.
The DHL owner interview is not answered yet; nothing here relies on it.

## Two observed chrome models

- **Sidebar-only (Shopify):** no top bar. Search and scope at the sidebar top; alerts, profile, settings at the sidebar bottom; help inside the profile menu; AI as a floating composer bottom-centre. (obs)
- **Sidebar + banner (DHL, Cloudflare):** scope or nothing at the sidebar top, settings and (DHL) support at the sidebar bottom, the rest in a top-right banner cluster. (obs)

## Position map

| Item | Shopify | DHL | Cloudflare | Rule |
|---|---|---|---|---|
| Global search | Sidebar top, ⌘K, modal with scope chips (obs) | Banner top-right icon, order search only, no hotkey (obs) | Sidebar top, ⌘K or `/` (obs); leaves the chrome at ≤768 px (obs) | CHR-001, CHR-002, CHR-003, CHR-012 |
| Notifications | Alerts bell, sidebar bottom (obs) | No bell; toast region only (obs) | No bell; Alerts is a page; toast region (obs) | CHR-009 |
| Help / support | "Help Center" in the profile menu (obs); opens externally (inf) | Sidebar bottom: knowledge base, ticket (obs) | "Support" in the banner (obs) | CHR-011 |
| AI assistant | Floating composer + docked right panel (obs) | None (abs) | "Ask AI" in the banner, `t a` (obs); missing in the Zero Trust sub-product (obs) | AI-001, AI-002, AI-010 |
| Profile / logout | Profile menu, sidebar bottom (obs) | Account menu, banner top-right (obs) | "User menu", banner top-right (obs) | CHR-008, SET-008 |
| Scope switcher | Current store in profile menu (obs); sidebar switcher (doc); list not observable, single store (inf) | None, standalone account (abs) | Account switcher, sidebar top (obs); no zone switcher control, `s z` shortcut (doc) | CHR-007, NAV-009 |
| Settings entry | Sidebar bottom (obs) | Sidebar bottom + "Manage account" in menu (obs) | "Manage account" group, sidebar bottom (obs) | SET-005, SET-006 |
| Narrow width (390 px) | AI as floating button (obs); other chrome not checked (abs) | Chrome kept as named icon buttons (obs) | Ask AI and Support become unlabelled icons (obs) | CHR-012, NAV-006 |
| Shortcut layer | `?` map, `G x` chords (obs) | None for navigation (abs) | `?` map, chords, off switch in profile (obs) | CHR-004, CHR-005, CHR-006 |

## Agreement and conflict

- 3/3 agree: settings at the sidebar bottom (SET-005); profile and logout in one menu, position differs (CHR-008); some help entry in the chrome (CHR-011).
- 2/3 agree: search at the sidebar top with ⌘K (CHR-001, CHR-002); no bell without a real feed (CHR-009); AI visible on every page (AI-001).
- Conflicts: help sits in three different places; AI is bottom-centre vs top-right vs none; scope switcher is sidebar top (Cloudflare obs, Shopify doc) vs profile menu (Shopify obs).
- Shopify store switching is unverified (single-store account), so CHR-007 rests on 1 observation + 2 docs.

## Decision branches

1. Has a top bar? No: put profile, help and alerts at the sidebar bottom (CHR-008, CHR-011 exceptions). Yes: profile top-right, the rest per below.
2. More than one scope (account, store, workspace)? Yes: switcher in the sidebar header (CHR-007). No: show the scope name in the user menu (CHR-007 exception).
3. Nested scope (site inside account)? Switch from the scoped area header or a shortcut, and swap the sidebar (CHR-007 exception, NAV-009).
4. Persistent feed of items to act on? Yes: bell with unread count (CHR-009). No: toasts in one named live region only (CHR-009).
5. Ships an AI assistant? Yes: one labelled entry on every page and sub-product, shortcut, docked panel (AI-001, AI-002, AI-010). No: add nothing (AI-001 exception).
6. Has keyboard shortcuts? Yes: `?` map, generated from navigation, user off switch (CHR-004, CHR-005, CHR-006).
7. Below ~768 px? Keep every item as a named icon button or drawer entry (CHR-012, NAV-006).
8. Service status page exists? Link it from the help entry (CHR-011). No separate chrome item: no rule yet, because no portal showed status in the chrome.
9. Feedback ("Give feedback") entry: no rule yet; seen only in one Cloudflare sub-product sidebar (obs), 1/3, too thin.
10. Language or region switcher in the chrome: no rule yet; not observed in any portal's chrome (abs) and not in Q13 scope.

## Recommendation (inf: synthesis, not observed as one layout)

Default to the sidebar + top-right model, because two of three portals use it and it keeps account items apart from work items (NAV-001):

```
Sidebar top     scope switcher (CHR-007) > search ⌘K (CHR-001/002)
Sidebar body    work areas (NAV-001)
Sidebar bottom  settings (SET-005) > help/support (CHR-011)
Banner right    [Ask AI] (AI-001) > [bell, only with a feed] (CHR-009) > user menu (CHR-008)
Toasts          one named live region (CHR-009)
```

- Help at the sidebar bottom, not in the user menu: separate from AI (CHR-011) and visible without opening a menu (inf).
- Use the sidebar-only model when the product has no top bar for other reasons (CHR-008 exception); then AI goes in a floating composer (AI-001).
- Test both at 1440 px and 390 px with each item's accessible name checked (CHR-012).
