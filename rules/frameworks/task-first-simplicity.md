# Why a task-first portal feels simple

Research question 18 (onboarding and integrations), applied to reference portal B, a small task-first portal that its daily user calls "fast and simple".
Evidence: private research notes for portal B (verification notes win), the cross-portal comparison (Q1, Q2, Q9, Q12, Q18), and one owner interview.
Status: **obs** = seen in the account or its settings audit log; **doc** = public docs only; **[inferred]** = not shown directly; **owner** = said by the owner in the interview.
Rules are cited by ID from the rulebook (`references/rules.md`, or the rule-library skill), not restated.

> **Owner interview: answered.** One daily admin user of portal B answered 6 questions and 3 GATE 2 questions.
> The interview is one person's opinion. It never raises a rule's confidence and never counts as a portal. Confidence stays capped by portal evidence.

## 1. Onboarding: steps to first value

| # | Step | Who | Elapsed | Status | Rule |
|---|---|---|---|---|---|
| 1 | Provisioning: 14 settings written at account creation | system | ~2 s | obs (audit log) | ONB-001 |
| 2 | Complete the pickup address | user | +2.5 min | obs | ONB-002 |
| 3 | Authorise the upstream system (a few numbered steps), pick the source location | user | +3 min | obs | ONB-006, INT-004 |
| 4 | Orders import automatically on a schedule | system | unknown | obs setting; first import time **not in evidence** | ONB-006 |
| 5 | Print a label from the New queue | user | unknown | [inferred] | ONB-002, HOM-001 |

- Setup was complete about 6 minutes after account creation (obs). "First value in about 6 minutes" stays **[inferred]**: the interview did not time it.
- An onboarding wizard exists only as a flag in the audit log; docs describe a getting-started wizard (doc). Its screens were never seen and the owner did not mention it. ONB-003 has no portal B observation.
- No setup checklist and no home page: it lands on the New orders queue (obs). The owner calls this a product choice, not a rule (owner). HOM-005 and ONB-004 have no portal B support.

## 2. Defaults: proven vs unproven

| Value | Status | Rule |
|---|---|---|
| Main service connection preconnected at account creation | obs | ONB-001 |
| Currency, seeded package, label print settings, 3 product codes, auto-import ON, status email ON, branded packing slip | obs (system writes in audit log) | ONB-001 |
| Timezone, units, item description, package size, label format | current values only; the owner edited options, package and print settings on day 1, so **unproven** | ONB-001 exceptions |
| Order arrives with a preselected service and rate, package count, customs fields | obs current state; source (default or owner rule) **unknown** | no rule: per-order preselection is seen in one portal only |

## 3. Integration

- One authorise step, then auto-import on, then a test button (obs, doc). ONB-006, INT-004.
- Mapping: import scope, tags, variant names, notes to delivery instructions, optional custom fields; write-back on print or manifest (obs). INT-008. Defaults versus owner saves stay **unproven**.
- Health: no status badge; an import log tab beside the integration, a global Logs area and per-order import history (obs). INT-006, INT-007, FDB-004. The missing badge contradicts INT-005.
- Integrations add no menu item; they stay in the connections settings group (obs). INT-011.
- Customer messages are imported from the upstream system; the owner edits none, except an occasional own invoice upload for non-EU shipments (minor) (owner). BRD-001, BRD-005 exceptions.

## 4. Menu-to-job mapping

- 9 sidebar items, one per daily job: find, pack and scan, hand over, price, report, catalogue, contacts (obs). NAV-001, NAV-002, SET-001.
- The owner confirms it: each daily job is an explicit, short entry and needs no search; one word is often enough (owner). NAV-002 sets nouns for menus, MCP-004 sets 1 to 3 words, verb first, for buttons.
- Order lifecycle states (New, Printed and later states) are tabs with counters at the top of the list, not menu items (obs, owner). IDX-004, NAV-011, HOM-002. Counts vanish at 768 px or less, against NAV-011 and HOM-009.
- No groups, badges or sub-items at 9 items (obs). NAV-005.
- Bottom-left block: logs, settings and support (obs, owner). SET-005, SET-009, CHR-011.
- Top right: a user menu whose trigger shows the email, plus search (obs). The owner suggests a person icon instead of the email, and wonders if a notifications entry is missing (owner, tentative). CHR-008, CHR-009.
- Users can hide unused items, but only per browser (obs). The owner does not use it (owner). NAV-012.
- Each order row has its own Print button (obs). Against IDX-009; kept as an exception candidate for single-action queues [inferred].

## 5. Purpose-grouped settings

- About two dozen settings pages in a few groups, ordered by the flow of work, from general basics to account (obs). SET-007, SET-004.
- The owner reads the groups by purpose: the group name says why you go there and what you find (owner). SET-007.
- Every page: annotated cards, visible helper text, sticky Save bar (obs). LAY-003, HLP-001, SAV-001.
- Choices are listed in full, radio for one and checkbox for several, each with a title that names the action and one short line on what happens (obs, owner). CTL-003, CTL-004, HLP-001.
- Automation starts empty with 4 quick-setup templates (obs). ONB-007.

## 6. What the owner interview confirmed, refuted or left open

| Claim | Result |
|---|---|
| C1 First labels within minutes, no outside help | **Open.** Not timed. The owner found everything on the first try. |
| C2 Wizard at first login, and resume behaviour | **Open.** Not mentioned. |
| C3 Regional defaults already right | **Open.** Not asked directly. |
| C4 Service and rate preselected without an owner rule | **Open.** |
| C5 Store mapping worked untouched | **Open.** The owner looked for nothing and missed nothing. |
| C6 Settings found by purpose group, not by search | **Confirmed** (owner). |
| C7 "Simple" means the menu matches daily jobs | **Confirmed** (owner). Hiding items is not used: one store, one admin. |
| C8 Import errors seen only in logs | **Open.** The owner reads logs from the bottom block but reported no failure. |
| Home page is needed | **Not a rule.** The owner says a home or a queue landing depends on the product (owner). |

## 7. What the owner interview adds

- **One glance, one word.** Little text on screen. Every frequent job is an explicit, short menu entry or button; one word is often enough. NAV-001, NAV-002, MCP-004.
- **Status views on top of the work list.** Quick status views sit at the top of the work list (obs, owner). IDX-004.
- **Fixed utility corner.** Logs, settings and support at the bottom left. SET-005, CHR-011.
- **Top bar.** The owner suggests a person icon instead of the email, and wonders if a notifications entry is missing (owner, tentative). CHR-008, CHR-009.
- **Choice cards.** All options visible, each with an action title and a one-line result. CTL-003, CTL-004.
- **Keep dependent choices together.** The only hesitation: setting duty and tax terms meant going back and forth in the order configuration. Dependent choices belong in one place (owner), with their effect shown [inferred]. CTL-010.
- **Scope of the setup.** One admin, one store, no edited customer messages. Role screens, scope switchers, menu customisation and message editors can wait in such setups. CHR-007, NAV-012, BRD-001, BRD-005.
