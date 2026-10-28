---
name: index-page
description: Designs list and table pages of an admin dashboard, covering header actions (create, import, export), lifecycle state tabs with counts, the single toolbar (saved views, search, filters, column picker), sortable columns, row selection and bulk actions, row overflow menus, pagination, and the no-match versus first-use empty states. Use when designing, building or reviewing any orders, products, customers, users, records or resources list, when asked "what columns", "how should filtering or saved views work", "where do bulk actions or export go", or when /dash:build reaches the page-templates step. Do not use it for the landing page (use home-layout), a single record's page (use detail-page), settings forms, or chart and log visualisation styling.
---

# Index page

Designs the page that lists one type of record. It fixes the order of the page: header, state tabs, one toolbar, table, footer. It decides which list features the record type needs and which it does not. Patterns come from list pages in three reference portals: Shopify, DHL Express Commerce and Cloudflare.

## Input

- The record type: its attributes, its lifecycle states (if any), how many records a user has.
- The jobs done on the list: find one record, work a queue, act on many, move data in or out.
- Or a repo path. Read the list route, its query (search fields, filters, sort, paging) and its actions.

## Output

- From /dash:build: one `## <Record> list` section per list in `dash-spec/pages.md`. It holds a feature table `Feature | Decision | Detail | Rule IDs`, the default columns, and the hidden columns.
- Asked directly: the same table inline plus a wireframe in the style of `references/frameworks/page-templates.md` section 2.
- Features left out ("no checkbox column: no bulk action") go in the table with the reason, not silently dropped.

## Procedure

1. Set width (LAY-002). The table, header and toolbar span the full content width and share the same edges.
2. Fill the page header. Title, one primary create action with a verb and object ("Add record", MCP-001). Import and Export sit left of it as secondary actions when users move records in bulk (IDX-010). A large export may run as a job; the list then links to it.
3. Decide state tabs (IDX-004). Use them when records move through about 3 to 7 workflow states that users act on in order. Each tab is a URL. Count only the states that need action. Counts load from a separate request with a placeholder and never block the table. For resources with only a health status, use a status filter or column instead.
4. Build one toolbar directly above the table (IDX-001). Order: view selector, search, "Filters", column picker. Skip the toolbar for a short fixed list under about 10 rows.
   - Search label names the matched fields: "Search by name or SKU", "Search by name prefix" (IDX-002).
   - Saved views for lists filtered the same way every day (IDX-003). Presets first ("All", then states), then user views. "Save" and "Reset view" stay disabled until a filter, sort or column changes. A view stores filters, sort and columns.
   - Column picker when the record has more than about 7 to 8 attributes (IDX-005). Default subset defined in one place. Lock the row-identifying column and offer "Reset to default" (seen in one portal: recommended).
5. Define columns. Identifier first, status as a tinted text badge (VIS-003). Sortable headers only on columns with a natural order (dates, amounts, names, counts, statuses). Each is a button "Sort by <column>" with aria-sort and a visible arrow on the active one (IDX-006).
6. Decide row selection (IDX-008). Add a checkbox column only if at least one bulk action exists. Header label states its scope: "Select all 50 on page", then "Select all 412 matching" as a second step. Disable a bulk action that only fits a compatible subset, with a visible reason.
7. Put row actions in the last column as an overflow menu or icon buttons with accessible names (IDX-009). Destructive item last. No primary buttons in rows. Exception: a queue whose job is one repeated action per row may show that one button.
8. Add pagination for any list that can exceed one page (IDX-007). Default 20 to 50 rows. Footer: "Showing 51-100 of 412", Previous, Next, rows per page. Live log streams may use load-more with a loaded count.
9. Define two empty templates. First use: heading, one sentence, one create action (STA-001). No match: "No orders match these filters." with "Clear filters", toolbar still visible (IDX-011).
10. List what you leave out and why, then run the self-check.

## Rules applied

- IDX-001 — One toolbar above the table: views, search, filters, columns.
- IDX-002 — Search label names the fields it matches.
- IDX-003 — View selector with presets and saved views; Save/Reset only when changed.
- IDX-004 — Lifecycle states as URL tabs with counts for actionable states.
- IDX-005 — Default column subset plus a column picker.
- IDX-006 — Sortable headers as buttons with aria-sort and an arrow.
- IDX-007 — Pagination with range, total, Previous/Next, page size.
- IDX-008 — Checkbox column only when a bulk action exists.
- IDX-009 — Row actions in a trailing overflow menu; no primary buttons in rows.
- IDX-010 — Import and Export as secondary list-level actions.
- IDX-011 — No-match state distinct from first-use empty state.
- STA-001 — First-use empty state: what appears here, why, one create action.
- LAY-002 — Full-width table aligned with header and toolbar.
- VIS-003 — Status as tinted text badges with fixed hue meanings.
- MCP-001 — Buttons start with a verb and name the object.

Full text: `references/rules.md` (index area). Full text of the cross-area IDs (LAY, MCP, STA, VIS) is in the rule-library skill. Wireframe: `references/frameworks/page-templates.md`.

## Example

Good (shipping admin, Orders list):

| Feature | Decision | Rule IDs |
|---|---|---|
| Header | "Orders", Export, "Import orders", primary "Create order" | IDX-010, MCP-001 |
| Tabs | "New 12 · Printed 4 · Shipped · Returned · Archived", each `?tab=` | IDX-004 |
| Toolbar | "All orders" view menu, "Search by order number or recipient", Filters, Columns | IDX-001, IDX-002, IDX-003, IDX-005 |
| Columns | Order, Recipient, Destination, Carrier, Status badge, "Order date ↓" | IDX-006, VIS-003 |
| Selection | "Select all 50 on page"; bulk "Print labels", "Archive" | IDX-008 |
| Row | "..." menu: Edit, Duplicate, Archive, Delete (last, critical) | IDX-009 |
| Footer | "Showing 1-50 of 812", Previous, Next, "Rows per page: 50" | IDX-007 |
| No match | "No orders match these filters." + "Clear filters" | IDX-011 |

Good (infra admin, API tokens list, 6 rows): no tabs, no views, no column picker, no checkboxes; only a "..." row menu (IDX-001 exception, IDX-008, IDX-009).

Bad: search in the header, filters in a side panel, views below the table. All 24 columns shown with horizontal scroll. Edit, Duplicate and Delete as filled buttons in every row. Checkboxes on a read-only report list. A status filter returns nothing and the page says "Create your first order". Breaks IDX-001, IDX-005, IDX-009, IDX-008, IDX-011.

## Self-check

- Search, filters and views share one toolbar directly above the table (IDX-001).
- The search label names fields that match the backend query (IDX-002).
- State tabs exist only for a workflow lifecycle, and each tab is a URL (IDX-004).
- Every checkbox column has a bulk action; every list with no bulk action has no checkboxes (IDX-008).
- No row holds a primary button, except the single queue action allowed by IDX-009.
- Pagination shows range and total, or the list cannot exceed one page (IDX-007).
- Two empty templates exist, and the no-match one offers "Clear filters" (IDX-011, STA-001).
- Each omitted feature is listed with its reason.
