# Settings taxonomy

Answers research questions 4 (which panels always end in settings) and 9 (how settings sections are grouped).
Evidence: private research notes (`comparison.md`) Q4, Q9, H3, H8 (Shopify = S, DHL = D, Cloudflare = C).
Rules are cited by ID, not restated. "Inferred" marks a step not backed by observation in 2 or more portals.
DHL owner interview is not yet done; nothing here depends on it.

## 1. Gate: does it belong in settings at all?

1. Touched daily, or is a work object? Main menu, not settings: SET-001, NAV-001.
2. Belongs to one object? On that object's page: SET-002, DET-012.
3. Belongs to one sub-product, channel or app? That area's own Settings item: SET-003, INT-011.
4. Belongs to one person? Profile page, not settings: SET-008, CHR-008.
5. Otherwise it is account-wide: it goes in the settings area (SET-004, SET-005). Use the taxonomy below.

## 2. Areas that always end in settings (Q4)

| Area | Contents | Support | Rule |
|---|---|---|---|
| Plan and billing | Plan, invoices, payment method | S, C (D billed outside) | SET-009 |
| Users and roles | Members, roles, sub-accounts | S, C (D has child accounts only) | SET-009; sub-account overrides SET-011 |
| API and credentials | Account keys, tokens, webhook secrets | 3/3 placement, 0/3 masking | SET-009; masking INT-010 (a fix, not observed) |
| Audit log | Who changed what, old and new value | 3/3 exist, placement differs | SAV-008, SET-009 |
| Connections | Carriers, stores, apps, domains, data feeds | S, D (C per product) | INT-001, INT-011 |
| Account defaults | Units, currency, timezone, taxes, locations, packaging | 3/3 | SET-001, SET-010, SET-011; one page per domain: no rule yet (candidate Q4.5, covered only loosely by SET-007) |
| Customer-facing output | Brand, customer emails, tracking or portal pages | S, D (C absent) | BRD-001, BRD-005; see section 3 |
| Policies and legal | Store policies, privacy, accepted terms | S only (D accepted at provisioning, C none seen) | no rule yet: 1/3 support |

Contested placements:
- Own email and password: D puts them in settings; S and C use the profile. Follow SET-008.
- Audit log: S inside settings, C in account admin, D in a top-level Logs area. SET-009 allows settings or account admin.
- Customer notifications: no such panel in C, because C has no end-customer output. Add the area only when the product sends to end customers (inferred).

## 3. Grouping inside settings (Q9)

Top-level list:
- Pick one grouping axis per level and keep it: SET-007. All three portals do this (3/3); they disagree on the axis.
  - Business domain (S: Payments, Checkout, Shipping). Default for a single-product admin (inferred).
  - Lifecycle phase (D: Connect, Order management, Shipping, Post purchase). Fits a linear operational flow (inferred).
  - Product (C: per-product Settings leaves). Fits a multi-product platform; pairs with SET-003.
- Add group headings past about 20 entries: SET-007. Offer settings search: SET-012.
- Table of contents for long pages: no rule yet (C only, 1/3).
- Each setting appears once. C repeats settings across threat groups (1/3); no rule yet, because the evidence conflicts and only C does it.

Inside a settings page:
- Annotated sections, title and description left, controls right: LAY-003, LAY-005.
- Current value visible before editing: SET-010.
- Save per section when sections are independent: SAV-003; otherwise SAV-001.

## 4. Customer-facing area ("branding", H8 partial)

Group everything the end customer sees under one area that feeds every surface:

| Branch | Rule |
|---|---|
| Brand page: logo, favicon, colours, name, social | BRD-001, BRD-007, BRD-008 |
| Brand page lists the surfaces that use it | BRD-002 |
| Each surface links back to the brand page instead of duplicating fields | no rule yet: D only (1/3); BRD-001 implies it (inferred) |
| Customer emails, grouped by lifecycle stage | BRD-005 (S, D) |
| Customer messages kept apart from staff and webhook alerts | BRD-010 (S only) |
| Sender identity and domain authentication | BRD-006 |
| Template editing: preview, test send, optional blocks, reset | BRD-003, BRD-004, BRD-011, BRD-009 |
| Checkout, storefront theme, labels, packing slips | no rule yet: S and D both keep these outside the brand area, and no portal shows a better pattern |

Caveat: H8 is only partial. No portal keeps all customer output in one area, and preview is inconsistent (S yes, D only on the tracking page).
Treat the single brand source (BRD-001) as the target. Placing every surface inside the area is not an observed pattern.

## 5. Open gaps

- Policies and legal, one-page-per-domain defaults, table of contents, link-back from surfaces: candidate rules with 1/3 or loose support.
- C has about 70 unvisited settings leaves (`cloudflare/not-visited.md`). Its "absent" cells for branding and customer email may change.
