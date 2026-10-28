---
name: home-layout
description: Decides whether an admin dashboard gets a home page at all and, if it does, composes it block by block (entry search, counted open-work links, KPI strip, setup checklist, recent and starred objects) with loading and phone behaviour. Use when designing, building or reviewing the landing page after sign-in of an admin panel, back office, merchant or infrastructure console, when asked "what goes on the home", "should we have a dashboard page", or when /dash:build reaches the page-templates step. It may answer "no home" when a single-queue tool lands on its work list instead. Do not use it for list pages (use index-page), single-object pages (use detail-page), marketing landing pages, or chart styling.
---

# Home layout

Decides the landing page after sign-in. First it decides whether a home should exist. A tool with one stream of work lands on that queue. A product with several work areas gets an overview home. Then it picks the blocks, their order, and how each block loads and reflows. The blocks come from patterns seen in three reference portals: Shopify, DHL Express Commerce and Cloudflare.

## Input

- A product brief or inventory: objects, jobs, how often users do each job, roles.
- Or a repo path. Read the router for the post-login route and the nav for top-level areas.
- Optional: the metrics the product produces and the setup steps a new account needs.

## Output

- From /dash:build: a `## Home` section in `dash-spec/pages.md`. It has the landing decision (home or queue) with rule IDs, then a block table: `# | Block | Content | Data source | Loading | Phone | Rule IDs`.
- Asked directly: the same decision and table inline, plus a short wireframe in the style of `references/frameworks/page-templates.md` section 1.
- Decisions that reject an alternative go to `dash-spec/decisions.md` when run from /dash:build.

## Procedure

1. Decide the landing type (HOM-001). Count the queues. A queue is a stream of work the main role processes every day, such as new orders to ship. Pending items that hang off that stream (returns to review, shipment exceptions) are state tabs or counts on it (IDX-004), not separate queues. Weekly or rare areas (pickups, reports) are not queues.
   - Exactly one queue: no home. Land on that queue's index page and hand it to the index-page skill (if it is not installed, apply the IDX rules from the rule-library skill). Note that its state tabs carry the counts (IDX-004). Stop here.
   - Several work areas, or a console users manage rather than process: build a home. Continue.
2. Put the entry point first (HOM-011). Use a short action heading (at most about 10 words, not the product name). Put one search or ask field right below it. No banner or chart between them.
3. Add open work if the product has user-owned queues (HOM-002). One short label with a count per kind of pending work. Each links to the list filtered to exactly those items. The count and the list use the same query. Counts only for actionable work (NAV-011). Skip this block for pure monitoring or configuration consoles.
4. Add a KPI strip if the product produces measurable outcomes (HOM-003). Use 4 to 6 tiles: value, change against the previous period, direction. One shared time-range control. A metric with no data reads "No data" with no delta. If more metrics exist than fit, add "Add metric" and a per-tile options menu, saved per user on the server (HOM-004). If one metric set fits every user, ship a fixed strip.
5. Add a setup checklist for accounts not set up yet (HOM-005). Group tasks by goal. Show "N of M complete" and one "Get started" link per group. Remove the block when all tasks are done.
6. Suggested (HOM-008, low confidence): if users own many long-lived objects, consider recent and starred objects. About 5 rows each, objects only, a heading link to the full list. Skip for queue-like work.
7. Mark every card as task or suggestion (HOM-006, ONB-008). Suggestions and promotions get a dismiss control that persists. Task and required-action cards get none; at most a snooze that returns.
8. Prefer no recommendations block (HOM-007, low confidence, a suggestion): place each recommendation on the object it changes. Account-wide insights may appear as a dismissible feed under HOM-006.
9. Suggested loading per block (HOM-010, low confidence): render the frame at once. Each counter and tile fetches on its own, shows a placeholder ("…" or skeleton, never 0), and retries on its own.
10. Set phone and tablet behaviour (HOM-009). Tiles stack or scroll. No breakpoint hides a count or a KPI value. Sparklines may hide. Use full width (LAY-001, LAY-008).
11. Fill the block table and run the self-check.

## Rules applied

- HOM-001 — Overview home for multi-area products; single-queue tools land on the queue.
- HOM-002 — Pending work as counted links to the exactly filtered list.
- HOM-003 — 4 to 6 KPI tiles, delta, one time range, explicit "No data".
- HOM-004 — Users add, remove, swap metrics; saved per user server-side.
- HOM-005 — Setup checklist grouped by goal with N of M; removed when done.
- HOM-006 — Suggestions dismissible; required work never.
- HOM-007 — Recommendations next to the object they change (low).
- HOM-008 — Short recent and starred object lists (low).
- HOM-009 — Counts and KPI values survive narrow screens.
- HOM-010 — Frame first, each block loads and retries alone (low).
- HOM-011 — Short action heading plus one search or ask field first.
- NAV-011 — Numeric counts only for actionable queues.
- ONB-008 — Optional onboarding prompts dismissible and non-blocking.
- IDX-004 — Queue landing: lifecycle tabs with counts.
- LAY-001 — Home and index use full content width.
- LAY-008 — Phone width: stack columns, content owns the width.

Full text: `references/rules.md` (home area). Full text of the cross-area IDs (IDX, LAY, NAV, ONB) is in the rule-library skill. Wireframe: `references/frameworks/page-templates.md`.

## Example

Good (multi-area e-commerce admin):

| # | Block | Content | Rule IDs |
|---|---|---|---|
| 1 | Entry | H1 "Let's get to work." + "Search orders, products, customers" | HOM-011 |
| 2 | Open work | "Fulfil orders 12" to `/orders?status=open&fulfilment=unfulfilled`; "Review returns 3" | HOM-002, NAV-011 |
| 3 | KPIs | "Last 30 days": Sessions, Orders, Revenue, Conversion; "Add metric" | HOM-003, HOM-004 |
| 4 | Setup | "Start selling · 2 of 4 complete · Get started"; gone at 4 of 4 | HOM-005 |
| 5 | Suggestion | "Try the shipping assistant" pill with "Don't show this again" | HOM-006 |

Each tile loads alone and shows "…" until ready (HOM-010). At 390 px the tiles stack with values kept (HOM-009).

Good (shipping label tool, one queue): no home. Sign-in lands on "New orders" with tabs "New 12 · Printed · Shipped · Returned" (HOM-001, IDX-004).

Bad: a label tool opens on a chart page with ten charts, each with its own date picker. A blank tile shows "0" with a green arrow. "Payments failing" has a close icon. At 768 px "Fulfil orders" loses its count. Breaks HOM-001, HOM-003, HOM-006, HOM-009.

## Self-check

- The landing decision cites HOM-001 and names the queue count it is based on.
- If there is a home, the first block after the H1 is the entry field (HOM-011).
- Every count links to a list filtered by the same query (HOM-002).
- KPI tiles are 4 to 6, share one range, and have a "No data" branch (HOM-003).
- No task card is dismissible; every suggestion card is (HOM-006).
- No loading counter or tile shows 0 as a placeholder (HOM-003 "No data" branch; per-block loading from HOM-010 is a suggestion).
- No count or value is hidden at 768 or 390 px (HOM-009).
- Low-confidence rules (HOM-007, HOM-008, HOM-010) are framed as suggestions, not requirements.
