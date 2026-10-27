# Help text decision tree (question 10)

Which help form a piece of explanation gets: visible text, tooltip, docs link, banner, or nothing.
Rules live in `rules/source/*.yaml`; this page only routes to them. Evidence: 3 reference portals
(cross-portal comparison, Q10; hypothesis H7 confirmed for visible essentials and docs links,
partial for tooltips). "(inferred)" marks routing not backed by an observed or documented rule.

## Before you start

- One piece of help, one primary form. A tooltip may repeat visible text, never replace it (HLP-002).
- Any help that stays: next to its control and wired with `aria-describedby` (HLP-009, CTL-009).
- Feedback after an action is not help text: route it with FDB-001 (toast, field error, banner, modal).

## The tree

Ask in order; stop at the first "yes".

1. **Is it a status or a required action** (blocking failure, missing security setup, plan limit hit)?
   - Required, blocks work: **banner**, one message, one next-step button, no dismiss (HLP-007, FDB-002).
   - Ongoing but optional: **dismissible banner** (HLP-007, ONB-008).
   - Background job failure: banner only once it blocks work; the rest goes to a log (INT-007, FDB-004).
   - Only an outcome of the user's own action: **toast**, not a banner (SAV-002, CHR-009).
2. **Does the control cause a side effect, risk or irreversible change?**
   **Visible text** next to the control or action, never tooltip-only (HLP-002, SAV-006).
3. **Is the control disabled or locked?**
   **Visible reason + unlock path** in the same field group (HLP-006, STA-005, VIS-006).
   Exception: Save disabled while pristine or saving needs nothing (HLP-006).
4. **Is it a validation error?** **Field error under the field** (FDB-003), never a tooltip or toast.
5. **Is it a procedure** (more than two sentences, more than one step, formats, examples)?
   - Short and tied to this form: **numbered steps beside the form or a collapsed how-to** (HLP-004).
   - Long or shared across pages: **docs link** (HLP-004), topic named in the link (HLP-010).
6. **Is the effect of the control not obvious from its label?**
   **One-line visible description** under the label (HLP-001); on wide settings pages the section
   description goes in the left annotation column (LAY-003).
7. **Is it a definition of a metric, column header, KPI or technical term in a dense data view?**
   **Info-icon tooltip or popover**, under ~40 words, focusable trigger (HLP-003).
   Products that already describe every control visibly may skip tooltips (HLP-003 exception).
8. **Is it an icon-only control** (collapsed rail, chrome at narrow widths)?
   **Tooltip + accessible name** carrying the label (NAV-003, CHR-012).
9. **Does the field have a format, length or visibility constraint** ("shown to customers", "max 70")?
   **Short visible description** (HLP-008 exception); ranges and units never only in a placeholder (CTL-007).
10. **Is the label self-explanatory** (name, title, email, quantity)? **Nothing** (HLP-008).

Page level, independent of the tree:
- Index and settings pages with a docs topic: **one docs link per page, same slot everywhere** (HLP-005, HLP-010).
- Empty feature or list: explanation + one action + optional "Learn more" in the empty state (STA-001, ONB-007).
- Redesigned area or new feature: one-time replayable tour, not a permanent banner (ONB-009, HLP-007 dont).

## Quick matrix

| Content | Visible text | Tooltip | Docs link | Banner | Nothing |
|---|---|---|---|---|---|
| What a non-obvious setting does | yes HLP-001 | repeat only | no | no HLP-007 | no |
| Consequence / irreversibility | yes HLP-002, SAV-006 | never alone HLP-002 | optional | no | no |
| Why disabled / locked | yes HLP-006, STA-005 | never alone HLP-006 | no | no | only pristine Save |
| Metric / column definition | no (clutter) | yes HLP-003 | no | no | no |
| Multi-step procedure | steps / disclosure HLP-004 | no HLP-003 | yes HLP-004 | no | no |
| Status / required action | no | no | optional in banner | yes HLP-007 | no |
| Field error | under field FDB-003 | no | no | no | no |
| Self-explanatory field | no | no | no | no | yes HLP-008 |

## Gaps: no rule yet

- **Tooltip on touch screens.** HLP-003 checks keyboard and hover only; no portal evidence for tap
  behaviour was captured. Default (inferred): tap opens the popover, tap outside closes it.
- **Docs link position** (header pill, footer or one card): HLP-005 says "pick one", because the
  three portals disagree. A house decision is still open.
- **Help inside placeholders** in general: only CTL-007 (ranges) and IDX-002 (search) cover it.
  Default (inferred): placeholders hold examples, never instructions.
- **Inline "Learn more" after a single description.** HLP-005 allows control-level links only for
  a control's own procedure or risk; no evidence on how often is too often (Shopify coverage 12/33).
- **Audience.** HLP-008 exception lets non-expert products describe every control; when a product
  counts as non-expert is undefined. DHL onboarding interview is not answered yet, so not decided here.
- **Tension.** VIS-006 `do` allows "a tooltip or nearby text" for a disabled Save; HLP-006 forbids
  tooltip-only reasons for other controls. Read VIS-006 as Save-only (inferred).
