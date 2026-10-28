# AI interaction model (question 14)

How an admin AI assistant is reached, what it knows, how it proposes changes, and where inline AI belongs.
Sources: private research notes (`comparison.md`) Q14, portal summaries and `ai-questions.md` (verification notes win), public docs.
Marks: **obs** observed live, **doc** public docs, **inf** inferred, **abs** looked for, not found.
The DHL owner interview is not answered yet; nothing here relies on it.

## Two layers (H11)

- **Global assistant:** one conversation panel reachable from every page (Shopify, Cloudflare obs; DHL ships none, abs).
- **Inline AI:** task-specific triggers inside fields and builders (Shopify description, categories, segments; Cloudflare WAF rule builder, obs).
- H11 confirmed 2/3. DHL's "smart" aids are rate shopping and rule templates, not AI (obs).

## Interaction map

| Step | Shopify | Cloudflare | Rule |
|---|---|---|---|
| Entry point | Home composer, floating composer on every page, mobile button (obs) | "Ask AI" in the banner, cards on Support and Zero Trust overview (obs); absent in the Zero Trust shell (obs) | AI-001 |
| Shortcut | None found (abs); shift+click opens fullscreen (doc) | `t a`, listed in `?` map (obs, doc) | AI-010, CHR-004, CHR-006 |
| Panel | Right, resizable, pushes content, Recents, fullscreen, close (obs) | Right, pushes content, expand (obs); history unverified | AI-002 |
| Page awareness | Names current page and its jobs (obs); "Target mode" for elements (doc) | Names current page; "@ to tag a resource" (obs); RBAC-limited (doc) | AI-003, AI-011 |
| Suggested prompts | None, blank "Where should we begin?" (obs) | 5 prompts (obs) | AI-009 |
| Navigation answers | Deep-link button to the setting (obs) | Path + scope note, asks which zone, then links (obs) | AI-005 |
| Tools / sources shown | "Checked help docs" step (obs) | Tool names, "See reasoning" disclosure (obs) | AI-006 |
| Per-message actions | Copy, rate (obs) | Not seen (abs) | AI-007 |
| Proposed change | Prefills the normal edit form; Save applies (obs as stated policy) | Confirmation card, decline = no change (obs as stated policy, not exercised) | AI-004, SAV-011 |
| Inline AI | Generate text, Accept all / Dismiss all, natural-language segment (obs) | "Create rule with Cloudy" (obs) | AI-008 |
| Data notice / off switch | abs | Privacy notice under composer; opt-in in Configurations (obs) | AI-011 |

## Agreement and conflict

- 2/3 agree (DHL absent everywhere): right push panel, page awareness, approval before any write, deep links, visible sources, inline AI only in write/build fields.
- Conflict, confirmation: form Save (Shopify) vs chat card (Cloudflare). Both satisfy AI-004 and SAV-011.
- Conflict, prompts: 5 (Cloudflare) vs none (Shopify); AI-009 is low confidence, 1/3.
- Conflict, entry prominence: persistent floating composer vs banner button. Both satisfy AI-001.
- Neither confirmation UI was exercised; the policy comes from the assistants' own answers.

## Decision branches

1. Product ships an assistant? No: add no entry and no inline AI (AI-001 exceptions). Yes: continue.
2. Entry: one labelled trigger in shared chrome on every page, sub-product shells included (AI-001). Has a shortcut system? Add a toggle shortcut, inert in text fields (AI-010, CHR-004).
3. Panel: desktop and tablet, docked right panel that reflows content, with expand and close (AI-002). Phone width: full-screen sheet allowed (AI-002 exception); Shopify keeps a floating button at 390 px (obs), sheet behaviour **inf**.
4. Context: send route, scope and object with every request; offer @-tag or element picker (AI-003). Context unresolved: ask which object, never guess (AI-003 exception).
5. Empty conversation: entry is a large page-aware composer? Prompts optional. Otherwise 3-5 task prompts (AI-009).
6. Question type:
   - "Where is X": path in words + in-app link + scope note; per-object setting, ask the object first (AI-005).
   - Read or explain: run freely, show sources and tools, reasoning behind a disclosure (AI-006, AI-004 exception).
   - Write: go to branch 7.
7. Proposed change. Target has a normal edit form? Prefill it unsaved; the save bar is the approval (SAV-011, SAV-001, SAV-004). No form (instant setting, account-level config)? Confirmation card with before/after and Approve / Decline (AI-004). Destructive? State the consequence as a manual action would (SAV-006); AI-specific wording: no rule yet, not observed.
8. After an applied AI change: record it in the activity log like a manual change (SAV-008, SAV-011 why). Attribution "changed via assistant": no rule yet, not observed. Undo from chat: no rule yet, not observed.
9. Several changes in one request (batch preview): no rule yet; neither assistant was asked for one.
10. Inline AI: free text, rule, filter, segment or tag field? Offer a trigger with Accept / Dismiss; output stays unsaved (AI-008, SAV-011). Short identity or numeric field? No inline AI (AI-008 exception).
11. Every answer: copy and feedback actions (AI-007, low confidence, 1/3).
12. Permissions and data: assistant runs with the user's role, shows a data notice, admins can disable it (AI-011, 1/3 obs + doc).

## Gaps (no rule yet)

- Assistant failure states (tool error, timeout, refusal) inside the panel: not exercised in either portal. STA-004 covers failed regions in general (**inf** that it applies).
- Conversation history and Recents: Shopify obs only; Cloudflare history unverified (1/3).
- Streaming and loading indication in the panel: not recorded in evidence.
