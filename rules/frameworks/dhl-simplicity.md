# Why the DHL shipping portal feels simple

Research question 18 (onboarding and integrations), applied to DHL Express Commerce, the portal the owner calls "fast and simple".
Evidence: private research notes (`dhl/summary.md`) (verification notes win), `comparison.md` Q1, Q2, Q9, Q12, Q18, `docs/dhl.md`.
Status: **obs** = seen in the account or its settings audit log; **doc** = public docs only; **[inferred]** = not shown directly.
Rules are cited by ID from `rules/source/*.yaml`, not restated.

> **OWNER INTERVIEW: PENDING.** The DHL onboarding interview is not answered. Nothing below draws on it.
> Every claim marked C1-C8 in section 6 must be confirmed or refuted by it before the matching rule's confidence is raised.

## 1. Onboarding: steps to first value

| # | Step | Who | Elapsed | Status | Rule |
|---|---|---|---|---|---|
| 1 | Provisioning: 14 settings written at account creation | system | ~2 s | obs (audit log) | ONB-001 |
| 2 | Complete the pickup address | user | +2.5 min | obs | ONB-002 |
| 3 | Authorise the store (4 numbered steps), pick fulfilment location | user | +3 min | obs | ONB-006, INT-004 |
| 4 | Orders import automatically (~every 20 min) | system | unknown | obs setting; first import time **not in evidence** | ONB-006 |
| 5 | Print a label from the New queue | user | unknown | [inferred] | ONB-002, HOM-001 |

- Setup was complete about 6 minutes after account creation (obs). "First value in ~6 minutes" is **[inferred]** (C1).
- An onboarding wizard exists only as a "Show Onboarding Wizard" flag in the audit log; docs describe a Getting started wizard (doc). Its screens and any resume-halfway behaviour were never seen (C2). ONB-003 is not backed by DHL observation.
- No setup checklist and no home page: the landing page is the New orders queue (obs). HOM-005 and ONB-004 have no DHL support; HOM-001 does.

## 2. Defaults: proven vs unproven

| Value | Status | Rule |
|---|---|---|
| Carriers preconnected (the account is the courier account) | obs | ONB-001 |
| Currency, seeded package, label print settings, 3 product codes, auto-import ON, "Printed" email ON, branded packing slip | obs (system writes in audit log) | ONB-001 |
| Timezone, units, item description, package size, label format | current values only; owner edited Options, package and print settings on day 1, so **unproven** (C3) | ONB-001 exceptions |
| Order arrives with preselected service + rate, package count, customs fields | obs current state; source (default vs owner rule) **unknown** (C4) | no rule yet: rate/service preselection per order not generalised from one portal |

## 3. Integration

- One Authorise, then auto-import on, then a "Test to ensure it works" button (obs, doc). ONB-006, INT-004.
- Mapping: import scope, tags, variant names, notes to delivery instructions, optional metafields; write-back on print or manifest (obs). INT-008. Whether these were defaults or owner saves is **unproven** (C5): "Required settings" were saved twice by the user.
- Health: no status badge; an Import logs tab beside the integration, a global Logs area and per-order import history (obs). INT-006, INT-007, FDB-004. Missing badge contradicts INT-005; failures not surfaced outside logs contradict INT-007.
- Integrations add no nav item; they stay in Settings > Connect (obs). INT-011.

## 4. Menu-to-job mapping

- 9 sidebar items, one per shipper job: find (Search), pack/scan (Workflows), hand over (Manifests, Pickups), price (Quotes), report (Reports), catalogue (Products), contacts (Address book) (obs). NAV-001, NAV-002, SET-001.
  "One item per recurring job, nothing else in the menu": no rule yet; NAV-001 orders areas but does not require a job-to-item test. Candidate, 1/3 portals.
- Order lifecycle (New, Printed, Shipped, Returned, Archived) is banner tabs with counters, not menu items (obs). IDX-004, NAV-011, HOM-002. Counts vanish at <=768 px, contradicting NAV-011 and HOM-009.
- No groups, badges or sub-items at 9 items (obs). NAV-005.
- Users can hide unused items, but only per browser (obs). NAV-012 (per-user storage not met).
- Each order row has its own Print button (obs). Contradicts IDX-009; kept as a known exception candidate for single-action queues [inferred].

## 5. Lifecycle-ordered settings

- 24 settings pages in 6 groups: General, Connect, Order management, Shipping, Post purchase, Account management (obs). The order follows the shipper's flow: who/where, sources, prepare, decide and ship, after delivery. SET-007 (workflow-phase axis), SET-004.
- Every page: annotated cards, visible helper text, sticky Save bar (obs). LAY-003, HLP-001, SAV-001.
- Post purchase groups brand, tracking and returns (obs), but return emails and returns-portal branding sit outside Brand hub. BRD-001 partly met.
- Automation starts empty with 4 Quick-setup templates (obs). ONB-007.
- That the phase order is what makes 24 pages scannable is **[inferred]** (C6).

## 6. Claims the owner interview must confirm or refute

| ID | Claim | Feeds |
|---|---|---|
| C1 | First labels were printed within minutes of signing up, with no outside help. | ONB-002 confidence |
| C2 | A wizard was (or was not) shown at first login; what it asked; whether it could be left and resumed. | ONB-003, ONB-004 |
| C3 | Timezone, units, item description, package size and label format were already right, not typed in. | ONB-001 |
| C4 | The service and rate on each new order were preselected without the owner writing a rule. | section 2 "no rule yet" |
| C5 | Store mapping (import scope, tags, notes) worked untouched; the two "Required settings" saves were confirmations, not fixes. | INT-008, ONB-006 |
| C6 | The owner finds settings by phase (Connect, Shipping, Post purchase), not by search or support. | SET-007 |
| C7 | "Simple" means the menu matches daily jobs; hidden items, if any, were hidden on purpose. | NAV-001, NAV-012, candidate in section 4 |
| C8 | Import errors were noticed only in logs (or not at all), so the missing status badge hurt. | INT-005, INT-007 |
