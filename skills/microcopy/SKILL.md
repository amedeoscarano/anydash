---
name: microcopy
description: Writes and reviews the short words of an admin dashboard - button labels, menu items, page titles, tabs, column headers, section names and link text - and keeps terminology consistent across the product. Produces a verb list, a glossary of canonical terms, and a label table with rule IDs. Use when naming buttons or menu items, when labels feel inconsistent ("Add new" here, "Create rule" there), when two words seem to mean the same thing, when choosing casing or spelling variant, or when /dash:build reaches the copy step. Use it before writing any button or nav label. Do not use it to decide whether a field needs help text or a tooltip (use help-text-policy), to pick the channel of a success or error message (use feedback-messaging), or for marketing copy, emails and long documentation.
---

# Microcopy

Name every action, destination and concept in an admin UI the same way everywhere. Buttons are verb + object. Menu destinations are nouns, commands are verbs. One verb per kind of action, one term per concept, one casing, one spelling variant. The output is a verb list, a glossary and a label table that other skills reuse.

## Input

- The object model and actions: from `dash-spec/inventory.md`, a brief, routes and components in a repo, or a screenshot.
- Existing labels if reviewing: a string catalog, component tree or page text.
- The chosen English variant, if set (default American English).

## Output

Three blocks:

1. **Verb list**: `Verb | Meaning | Use for`.
2. **Glossary**: `Term | Meaning | Synonyms not to use`.
3. **Label table**: `Location | Current | Proposed | Rule IDs`.

When run from /dash:build, write them as the `## Copy` section of `dash-spec/controls.md`. When asked directly, answer inline.

## Procedure

1. Pick one English variant for the whole product and note it at the top of the glossary (MCP-008). Third-party names (carrier services, integration names) keep their own spelling.
2. Build the verb list. Default: Add (put a simple or existing item into a list), Create (build a new configured object), Edit, Remove (take out of a list), Delete (destroy), plus Save, Cancel, Close, Export, Import, Apply. Add domain verbs the users already know (Print, Deploy, Rotate, Purge) instead of replacing them (MCP-006, low confidence).
3. Build the glossary. One term per concept, one concept per term. Use the same term, same number, in menu, page title, breadcrumb, buttons, notifications and shortcuts. Old names after a rename live only as search aliases (MCP-007, low).
4. Name navigation and menus. Items that open a page are nouns ("Orders", "Pickups"); items that act are verbs ("Log out"). Action-only overflow menus are all verbs (MCP-003).
5. Name buttons. Verb + object from the verb list and glossary: "Add product", "Create rule", "Print label" (MCP-001, medium). Bare verbs only for Save, Cancel, Close, Export, Import, and Edit or Apply inside a card or dialog that names its object.
6. Shorten. One to three words, no "a", "an", "the", "new", "now", "here", "please"; explanations go in helper text next to the button (MCP-004). Add a qualifier only when two buttons on one screen would collide ("Create custom rule", "Create rate limiting rule").
7. Repeated row and card actions: keep the visible label short and put the object in the accessible name ("Remove" with aria-label "Remove shipping method Standard") (MCP-005, low).
8. Dialog primary buttons repeat the action, never OK or Yes: "Delete rules" (FDB-007).
9. Case everything in sentence case: titles, tabs, column headers, buttons, menu items. Keep proper names and acronyms (API, DNS). Never store ALL CAPS strings; use CSS for an uppercase eyebrow (MCP-002).
10. Docs link text names its topic: "Learn more about rate rules", not a bare "Learn more" (HLP-010, low). Whether a link or description is needed at all is help-text-policy's call: see `references/frameworks/help-text-tree.md`.
11. Descriptions you touch must add a constraint, consequence or audience, never repeat the label (HLP-008, low; its check flags descriptions that only restate the label).
12. Fill the label table: every nonconforming label, its replacement and the rule IDs.

## Rules applied

- MCP-001 — Buttons are verb + object (medium).
- MCP-002 — Sentence case everywhere, no stored ALL CAPS.
- MCP-003 — Destinations are nouns, commands are verbs.
- MCP-004 — One to three words, no filler.
- MCP-005 — Repeated buttons name their object in the accessible name (low).
- MCP-006 — One verb per kind of action (low).
- MCP-007 — One term per concept, one concept per term (low).
- MCP-008 — One spelling variant.
- FDB-007 — Dialog primary button named after the action.
- HLP-008 — Descriptions do not restate the label (low).
- HLP-010 — Docs links name their topic (low).

Low-confidence rules are recommendations: report them as suggestions in reviews, not errors. Full text of MCP rules: `references/rules.md`. FDB and HLP rules live in the sibling skills feedback-messaging and help-text-policy; the gists above are enough to apply them here.

## Example

Shipping admin, returns rules page.

Good:

| Location | Current | Proposed | Rule IDs |
|---|---|---|---|
| Rules page primary button | "Add a new rule" | "Create rule" | MCP-001, MCP-004, MCP-006 |
| Sidebar | "Manage users" | "Users" | MCP-003 |
| Sidebar vs page title | "Quotes" / "Quote" | "Quotes" / "Quotes" | MCP-007 |
| Column header | "Expires On" | "Expires on" | MCP-002 |
| Settings help | "fulfilment" | "fulfillment" (American English) | MCP-008 |
| Row action, 12 rows | "Remove" x12 | "Remove", aria-label "Remove rule Free returns EU" | MCP-005 |
| Delete dialog | "OK" | "Delete rules" | FDB-007 |
| Integration card | "Run rules now" | "Run rules" | MCP-004 |

Bad:
- "Add new" on the rules page, "Create rule" on the document rules page, "Delete" used to unlink a team member (MCP-006).
- "Notifications" naming both the toast region and the email alerts settings tab (MCP-007).
- A hard-coded "ORDER MANAGEMENT" section label (MCP-002).
- User menu "Go to billing" next to "Profile" (MCP-003).

## Self-check

- [ ] Every button starts with a verb from the verb list; bare verbs are only on the allowed list.
- [ ] No button is longer than three words or contains filler words, unless it is a collision qualifier.
- [ ] Nav links are nouns; menu commands are verbs.
- [ ] Suggestion (MCP-006, low): each object noun pairs with one create verb across the product.
- [ ] Suggestion (MCP-007, low): menu label, page title and breadcrumb use the same term and number.
- [ ] All labels are sentence case in the source string; one spelling variant.
- [ ] Suggestion (MCP-005, low): repeated row actions have unique accessible names.
- [ ] Every cited ID is listed under Rules applied; MCP IDs also appear in `references/rules.md`.
