---
name: rule-library
description: Reference rulebook for admin dashboard UI (179 rules with IDs, confidence, do/don't examples and static and live checks) plus decision frameworks for where a function lives, which control to use, how changes are saved, when to show help text, settings structure, page templates, global chrome and AI assistant UX. Use it whenever designing, building, reviewing or testing an admin panel, back office, settings page, sidebar, form, table or dashboard, and whenever another dash skill asks for a rule by ID (NAV-001, CTL-002, SAV-006 ...). Load it before deciding control types, save behaviour, navigation placement or settings layout. Do not use it for marketing sites, landing pages, consumer mobile apps or data visualisation styling; it covers the admin UI around the data, not chart design.
user-invocable: false
---

# Rule library

The shared knowledge base of the `dash` skills. Rules were reverse-engineered from three production admin panels (an e-commerce admin, a shipping portal, a cloud infrastructure dashboard) and checked against their public design guidance. Every other dash skill cites these IDs.

## What is here

| File | Content |
|---|---|
| `references/rules.md` | All rules, grouped by area, with an index table. Generated; never edit by hand. |
| `references/frameworks/placement-decision-tree.md` | Where a function lives: sidebar, sub-nav, settings, object page, top bar, palette, checklist. |
| `references/frameworks/control-selection-matrix.md` | Save model first, then value shape, then option count gives the control. |
| `references/frameworks/help-text-tree.md` | Visible help, tooltip, link, or nothing. |
| `references/frameworks/settings-taxonomy.md` | The groups every settings area ends up with. |
| `references/frameworks/page-templates.md` | Home, index, detail, settings page skeletons. |
| `references/frameworks/global-chrome-map.md` | Top bar, search, scope switcher, profile, help, notifications. |
| `references/frameworks/ai-interaction-model.md` | Assistant entry points, context, read vs write, confirmations. |
| `references/frameworks/dhl-simplicity.md` | Why a small, task-first portal feels simple; use for onboarding and scope cuts. |

## Rule format

Each rule has: `id`, title, the rule in one sentence, why, `source` (documented, observed, inferred), per-portal evidence, `confidence`, applies when, exceptions, do, don't, `check_static`, `check_live`.

Areas and ID prefixes:

| Prefix | Area | Prefix | Area |
|---|---|---|---|
| NAV | navigation | AI | ai-assistant |
| SET | settings | ONB | onboarding |
| CTL | controls | INT | integrations |
| SAV | save-model | BRD | branding |
| HLP | help-text | STA | states |
| LAY | layout | FDB | feedback |
| HOM | home | MCP | microcopy |
| IDX | index | VIS | visual |
| DET | detail | CHR | global-chrome |

## Confidence

- **high**: seen in all three reference portals, or stated explicitly by a public design system and seen in at least one portal. Apply by default; deviating needs a written reason.
- **medium**: seen in two of three. Apply unless the product has a clear reason not to.
- **low**: one portal, or inferred. Treat as a suggestion; never report a low rule as an error on its own.

## How to use it

1. Find the area of the decision (the prefix table above). Open `references/rules.md` and read the index rows for that area.
2. Read the full entry of each candidate rule. Check `applies_when` and `exceptions` before applying it; a rule that does not apply is not a violation.
3. When two rules seem to conflict, the one whose `applies_when` is narrower wins. If still unclear, the framework file for that area decides.
4. Cite the ID in every decision or finding: `SAV-001: sticky save bar, disabled until the form is dirty`.
5. For a review, use `check_static` on code, specs and screenshots; use `check_live` only in a running app.
6. For a placement or control question, walk the matching framework top to bottom and stop at the first branch that matches.

## Example

Good: "Use a checkbox for 'Send tracking email' inside the settings form, because the page has a save bar (CTL-002, SAV-001)."
Bad: "Use a toggle, toggles look modern." No rule ID, and CTL-002 forbids switches inside Save forms.

## Self-check

- Every recommendation names at least one rule ID that exists in `references/rules.md`.
- `applies_when` and `exceptions` were read for each cited rule.
- Low-confidence rules are labelled as suggestions.
