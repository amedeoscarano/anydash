# Placement decision tree: where a function lives

Research question 7. Use it when you add a function (a page, setting, action or tool) and must choose its home.
Homes: sidebar, sub-nav, settings, object page, top bar, command palette, setup checklist.
Each branch cites rule IDs from the rulebook (`references/rules.md`, or the rule-library skill). Do not restate them here. "[inferred]" marks a step that no portal shows directly.

## The tree (ask in order, stop at the first yes)

1. **Does it act on one object only** (one order, product, zone, integration)?
   Put it on the object page. SET-002.
   - Part of one section (add a line, edit an address): in that section. DET-006.
   - A value to read and change: show it, edit in place. DET-009.
   - It can override an account default: show inherited vs customised. SET-011.
   - Destructive or disruptive (delete, pause, rotate): danger zone at the end. DET-012, SAV-006, HLP-002.
   - Many independent areas (overview, logs, settings): object tabs. DET-007.
   - Integration config, log and maintenance tools: the integration detail page. INT-003, INT-006, INT-009.
2. **Does it belong to one sub-product, channel or installed app?**
   Put it in that sub-area's sub-nav, as its own "Settings" item at the end. SET-003, NAV-009, NAV-010.
   - The app only feeds data or identity, with no daily screens: no own nav group. INT-011.
   - Contradiction: DHL centralises all sub-area settings in one hub (2/3 support for SET-003).
3. **Is it a person's own preference or credential** (language, theme, timezone, shortcuts, own password)?
   Put it in the user menu and profile, not in account settings. SET-008, CHR-008, CHR-006.
4. **Is it account administration** (plan, billing, users, roles, API keys, audit log)?
   Put it in settings. SET-009, INT-010, SAV-008.
5. **Is it a daily object or job** (a list people work through)?
   Put it in the sidebar, ordered by frequency. SET-001, NAV-001, NAV-005, NAV-011.
6. **Is it rarely changed, account-wide configuration?**
   Put it in settings, reached from the fixed bottom entry. SET-001, SET-004, SET-005, SET-006, SET-007.
7. **Must it be reachable from every page, whatever the scope?**
   Put it in the top bar or persistent chrome: search CHR-001, scope switcher CHR-007, help CHR-011, assistant AI-001, alerts CHR-009.
8. **Is it a jump to a known page or object, used by repeat users?**
   Index it in the command palette, in addition to its home, never instead of it. CHR-002, CHR-003, CHR-005.
   - Running actions (not only navigation) from the palette: no rule yet. Only Cloudflare and Kumo docs show it; Shopify's palette role is inferred.
9. **Is it a one-time setup step for a new account?**
   Add it to the setup checklist. HOM-005, ONB-003.
   - The step must also have a permanent home from steps 1-6, so it can be found after the checklist retires. ONB-004. [inferred: no rule states "permanent home" explicitly]
   - Value the platform already knows: provision it, no step. ONB-001, ONB-002.

## Criteria check (run after the tree)

| Criterion | Pushes toward | Rules | Gap |
|---|---|---|---|
| Frequency of use | Daily: sidebar. Rare: settings. Repeat jumps: also palette. | SET-001, NAV-001, CHR-002 | none |
| Scope | One object: object page. Sub-area: sub-nav. Account: settings. Person: profile. | SET-002, SET-003, SET-009, SET-008 | none |
| Who uses it | Each person: profile. Admins: settings. | SET-008, SET-009, AI-011 | Role-based hiding of placements: no rule yet, no portal data on roles. |
| Risk and reversibility | Destructive: danger zone, confirm. Instant: switch plus toast. | DET-012, SAV-006, FDB-007, SAV-002, CTL-002 | Urgent risky toggles on a front overview page: no rule yet. Cloudflare shows them; Shopify keeps risky config in settings. Risk alone does not decide. |
| Findability on return | Current value visible. Settings searchable. Old names still match. | SET-010, SET-012, CHR-003, CHR-005, AI-005 | none |

## Tie-breakers

- Scope beats frequency. A daily per-object setting stays on the object page. SET-002. [inferred priority]
- A run-now job tied to one config (import now, run rules) sits next to that config. INT-009. DHL only, 1/3.
- A log goes next to the thing that produces the events. INT-006, DET-008, FDB-004.
- A recommendation goes next to the object it improves, not only on the home page. HOM-007.

## Open items

- DHL owner onboarding interview not answered yet. Step 9 (checklist) and the "who uses it" row may change.
- Settings hub vs decentralised sub-area settings is still 2/3. Confirm SET-003 with a product that has fewer than three sub-areas. [inferred]
