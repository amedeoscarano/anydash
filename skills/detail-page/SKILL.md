---
name: detail-page
description: Designs the page for one object in an admin dashboard, covering the header (back link, title, status badges, previous/next, page actions and overflow), two-column body or tabs, key figures, section actions, in-place editing, identifiers with copy, the object's own history timeline, object-level settings and the danger zone. Use when designing, building or reviewing an order, product, customer, shipment, service, integration or any record page, when asked "what goes on the detail page", "tabs or one page", "where does delete go", or when /dash:build reaches the page-templates step. Do not use it for lists (use index-page), the landing page (use home-layout), create forms, or account-wide settings areas.
---

# Detail page

Designs the page that shows one object. It sets the header, chooses between a two-column page and tabs, places each action where its data lives, and puts the history and the destructive actions in fixed places. Patterns come from record and resource pages in three reference portals: Shopify, DHL Express Commerce and Cloudflare.

## Input

- The object: its name or public reference, internal ids, state dimensions, fields grouped into sections, related lists.
- Its jobs: read and fix one value, process a queue of records, monitor a long-lived resource, configure it.
- Its actions: whole-object, per-section, destructive.
- Or a repo path. Read the detail route, its model, its edit forms and any events or audit table.

## Output

- From /dash:build: one `## <Object> detail` section per object in `dash-spec/pages.md`. It holds the structure choice (two columns or tabs) with rule IDs and a region table `Region | Content | Actions | Rule IDs`.
- Asked directly: the same table inline plus a wireframe in the style of `references/frameworks/page-templates.md` section 3.

## Procedure

1. Classify the object. A record (order, product, customer) has one main body plus metadata. A long-lived resource (service, tunnel, integration) has several independent areas such as metrics, logs and settings.
2. Choose the structure (DET-007, LAY-004).
   - Record: one scrolling page, main column about 2/3, side column about 1/3 for status, summary, metadata.
   - Resource with several areas of similar weight: tabs, each a URL, overview first, at most 8 tabs.
3. Build the header.
   - Back link or breadcrumb to the parent list above the title (DET-001).
   - H1 is the name or public reference, never a UUID or "Edit record" (DET-003). Document title matches.
   - One text badge per independent state dimension next to the H1 (DET-004, VIS-003). Live-metric state may go in the figures strip instead.
   - Previous and Next when users process records in sequence, following the list's filter and sort, disabled at the ends (DET-002). Skip for long-lived resources.
   - At most one primary and three secondary page-wide actions; everything else in "More actions" (DET-005). Delete never stands next to the primary.
4. Add key figures for objects that accumulate activity (DET-011). Three to five labelled values, each with a definition on demand, first block under the header. Skip for transactional records; show their content first.
5. Lay out sections. Each section owns its add and edit actions in its own heading or toolbar (DET-006). The header keeps only whole-object actions.
6. Make fields read first, edit in place (DET-009). Value as text, an "Edit <field>" control, inline field, popover or side panel, saved by the page's save model. Structural edits (line items) may use a header "Edit" mode. Large forms open as a page.
7. Put identifiers and contact values in a details area of the side column with "Copy <field>" buttons and a success message (DET-010). Secrets copy only at creation or after an explicit reveal. Suggested (SET-011, low confidence): where the object overrides an account default, show inherited versus customised values.
8. Add the object's history (DET-008). Newest first, actor and time on each entry, scoped to this object. Place it at the end of the main column, as a "History" section, or as a tab on tabbed objects. The account-wide log (SAV-008) does not replace it.
9. Place object-level settings. Record: side-column cards or in-place edits. Resource: a Settings tab.
10. Place destructive actions. With a settings area: a last section "Danger zone", each action with one line stating the consequence (DET-012, low confidence). Without one: Archive and Delete in "More actions" (DET-005). Confirm each with a dialog whose button names the action (SAV-006).
11. Set phone behaviour: columns stack into one, the breadcrumb may collapse to a back arrow with the parent name (LAY-008, DET-001). Run the self-check.

## Rules applied

- DET-001 — Back link or breadcrumb to the parent list.
- DET-002 — Previous/next in list order for records processed in sequence.
- DET-003 — H1 is the human name or public reference.
- DET-004 — One status badge per state dimension beside the title.
- DET-005 — At most 1 primary and 3 secondary header actions, rest in "More actions".
- DET-006 — Section actions stay in their section.
- DET-007 — Tabs only for several independent areas; tabs are URLs.
- DET-008 — Object history on its page, newest first, actor and time.
- DET-009 — Read first, edit in place.
- DET-010 — Identifiers with a copy button.
- DET-011 — 3 to 5 key figures at the top of the overview.
- DET-012 — Danger zone last in object settings, consequence stated (low).
- LAY-004 — Two-column detail: main 2/3, side 1/3.
- LAY-008 — Phone width: stack columns.
- VIS-003 — Status as tinted text badges.
- SAV-006 — Destructive actions apart, consequence stated, confirmed by name.
- SAV-008 — Account-level activity log (complements DET-008).
- SET-011 — Show inherited versus customised values (low).

Full text: `references/rules.md` (detail area). Full text of the other cross-area IDs (LAY-008, VIS-003, SAV-008, SET-011) is in the rule-library skill. Wireframe: `references/frameworks/page-templates.md`.

## Example

Good (e-commerce admin, order record, two columns):

| Region | Content | Actions | Rule IDs |
|---|---|---|---|
| Header | "< Orders", H1 "#1042", badges "Paid" "Unfulfilled", Previous/Next order | "Fulfil items" primary, "Refund", "More actions" (Duplicate, Archive, Delete) | DET-001, DET-002, DET-003, DET-004, DET-005 |
| Main | "Unfulfilled (2)" items; "Customs details" | "Edit" in the customs section head | DET-006, LAY-004 |
| Side | Customer, shipping address, "Order ID 7c1e..." | "Copy email", "Copy ID", "Edit address" in place | DET-009, DET-010 |
| End of main | Timeline: "October 19 · Payment captured by system · 10:42" | — | DET-008 |

Good (infra admin, service resource): tabs "Overview", "Metrics", "Deployments", "Logs", "Settings" as URLs; overview opens with "Active replicas | Routes | Status | Uptime"; Settings ends with "Danger zone: Delete service — removes all deployments and routes" (DET-007, DET-011, DET-012).

Bad: H1 "3f2c9e1a-7b4d-..." and status only as a field halfway down the side column. Seven header buttons including a red "Delete" beside "Save". "Add variable" in the header, far from the variables list. A separate edit page to change one tag. History only in the global audit log. Breaks DET-003, DET-004, DET-005, DET-006, DET-009, DET-008.

## Self-check

- A back link or breadcrumb to the parent list sits above the H1 (DET-001).
- The H1 is a name or public reference, not an id (DET-003).
- The header has at most 4 visible action buttons, one primary, plus "More actions" (DET-005).
- Every add or edit control sits inside the section whose data it changes (DET-006).
- Tabs exist only for a resource with several independent areas, and each tab is a URL (DET-007).
- The object's own history is on the page, newest first, with actor and time (DET-008).
- Every destructive action is in the danger zone or the overflow, with consequence text and a named confirm (DET-012, SAV-006).
- Low-confidence DET-012 and SET-011 are framed as suggestions.
