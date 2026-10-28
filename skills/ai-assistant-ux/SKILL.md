---
name: ai-assistant-ux
description: Designs the AI layer of an admin dashboard - where the assistant entry sits, how the panel opens, what page context it receives, suggested prompts, how proposed changes are previewed and approved, where inline AI belongs, and the data notice and off switch. Produces an assistant spec section or an inline answer with rule IDs. Use when adding an AI assistant, chat panel, copilot, "Ask AI" button, AI-generated text, AI rule builder or any AI action that could change data in a back office, settings area or admin panel; also use when reviewing an existing assistant for unsafe writes or missing context. Do not use it for model choice, prompt engineering, retrieval pipelines or consumer chat apps; it covers the admin UI around the assistant, not the model. If the product has no assistant, use it only to confirm that no AI entry or inline AI should be added.
---

# AI assistant UX

Decides how an admin dashboard exposes AI: one global assistant reachable from every page, plus inline AI only where users write or build. The core promise is that the assistant reads freely but never writes without an explicit approval that shows exactly what will change. Rules come from the Shopify and Cloudflare dashboards (DHL Express Commerce ships no assistant).

## Input

- A product brief or a repo path (app shell, layout component, forms).
- The inventory of objects and jobs, if `/dash:build` already produced `dash-spec/inventory.md`.
- Whether the product has a keyboard shortcut system and roles.

## Output

- From `/dash:build`: an "AI assistant" section appended to `dash-spec/pages.md`, and one row per decision in `dash-spec/decisions.md` (decision | rule IDs | alternative rejected | why).
- When asked directly: an inline answer with the same content.
- Content: a table `Element | Placement | Behavior | Rule IDs` covering entry, panel, context, prompts, answers, proposed changes, inline AI, permissions. Then a list of fields where inline AI is allowed and refused.

## Procedure

Walk `references/frameworks/ai-interaction-model.md` branch by branch. Full text of the AI rules is in `references/rules.md`. The SAV, CHR and STA rules cited here live in other areas: read them in the rule-library skill, or in the save-model, global-chrome and ui-states skills.

1. Does the product ship an assistant? If no, add no entry and no inline AI, record that in the decision log, and stop (AI-001 exceptions).
2. Entry point. Render one labelled trigger ("Ask AI") from the shared chrome, so every page has it, sub-product shells included. At phone width it may become an icon button that keeps its accessible name (AI-001). If the product has a shortcut system, suggest a toggle shortcut listed in the "?" map and inert while focus is in a text field (AI-010, low confidence; CHR-004).
3. Panel. On desktop and tablet, open a right-docked panel that narrows the page, with New conversation, Expand and Close. At phone width a full-screen sheet is acceptable (AI-002).
4. Context. Send the current route, scope and object with every request. Offer "@" tagging of a resource. If the object cannot be resolved, the assistant asks which one; it never guesses (AI-003).
5. Empty conversation. Show 3-5 suggested prompts drawn from the inventory's most frequent jobs. Optional when the entry is a large page-aware composer whose placeholder already invites a task (AI-009, low confidence).
6. Answers by question type:
   - "Where is X": path in words, a button that opens that exact page, and the scope it applies to; ask for the object first when the setting is per-object (AI-005).
   - Read or explain: run freely; show which sources and tools were used, reasoning behind a disclosure (AI-006, AI-004 exception).
   - Every answer: Copy, Good response, Bad response (AI-007, low confidence).
7. Proposed changes. Classify every AI action as read or write. For a write:
   - Target has a normal edit form: prefill it unsaved; the form's own save bar is the approval (SAV-011, SAV-001, SAV-004).
   - No form (instant setting, account config): a confirmation card with before and after values and Approve / Decline. Decline changes nothing (AI-004).
   - Destructive: state the consequence exactly as the manual action does (SAV-006).
   - After apply: record it in the activity log like a manual change (SAV-008).
8. Inline AI. Allow it only in free-text, rule, filter, segment or tag fields, with Accept / Dismiss per suggestion; output lands in the unsaved form (AI-008, SAV-011). Refuse it on name, price, quantity and other short identity or numeric fields (AI-008 exception).
9. Permissions and data. The assistant runs with the current user's role; it tells a user without access that they lack access. Suggested, not required: a one-line data notice under the composer and an "AI assistant" switch for admins in account settings (AI-011, low confidence).
10. Gaps. Failure states inside the panel, batch previews, "changed via assistant" attribution and undo from chat have no rule yet. Suggest treating a failed answer like a failed region with Retry (STA-004, low confidence, and only inferred to apply here) and mark the rest as open decisions in the log.

## Rules applied

- AI-001 — One labelled assistant entry in the global chrome of every page.
- AI-002 — Right-docked panel that reflows content; full-screen sheet on phones.
- AI-003 — Current page and object passed automatically; @-tag a resource; ask when unresolved.
- AI-004 — Reads run freely; every write needs explicit approval showing the change.
- AI-005 — "Where is X" answers end in a direct link and a scope note.
- AI-006 — Show sources and tools used; reasoning behind a disclosure.
- AI-007 — Copy and rate controls on every answer (low).
- AI-008 — Inline AI only in write/build fields, with Accept and Dismiss.
- AI-009 — 3-5 suggested prompts in an empty conversation (low).
- AI-010 — Keyboard shortcut listed in shortcut help (low).
- AI-011 — Data notice, role-limited answers, admin off switch (low).
- SAV-011 — Assistant changes go through the normal save path.
- SAV-001 — Sticky save bar that wakes on change.
- SAV-004 — Discard returns to the last saved state.
- SAV-006 — Destructive actions state the consequence and are confirmed.
- SAV-008 — Activity log records who changed what.
- CHR-004 — Shortcut map on "?".
- STA-004 — A failed region says so and offers Retry (low; inferred for the panel).

## Example

Good (shipping admin): every page has an "Ask AI" button in the top bar; on a 390 px screen it is an icon button named "Ask AI". On the Shipments list the user opens it and sees prompts "Create a return label", "Why did this shipment fail?", "Change my default carrier". They ask "Set the default package weight to 2 kg". The assistant opens Settings > Shipping defaults with the weight field prefilled to 2 kg and the save bar awake; nothing is stored until the user clicks Save, and the activity log then shows the change. AI-001, AI-009, AI-004, SAV-011, SAV-001, SAV-008.

Bad: the assistant is reachable only from Help > "Chat with AI" in the profile menu, opens as a centered modal that hides the shipment it is asked about, replies "Done, I changed your default carrier" after a question, and a sparkle icon sits on the price and SKU fields. Violates AI-001, AI-002, AI-004, AI-008.

## Self-check

- [ ] The assistant trigger is rendered by the shared shell, not by individual pages, and keeps an accessible name at phone width.
- [ ] Every AI write path ends in a prefilled form with Save or a card with Approve / Decline; no write path applies silently.
- [ ] Requests carry route, scope and object; an unresolved object leads to a question, not a guess.
- [ ] Inline AI appears only in free-text or builder fields and every suggestion has Accept and Dismiss.
- [ ] Low-confidence rules (AI-007, AI-009, AI-010, AI-011, STA-004) are marked as suggestions in the spec.
- [ ] Every AI rule ID cited exists in `references/rules.md` and every SAV, CHR or STA ID in the rule-library skill; open gaps are listed in the decision log.
