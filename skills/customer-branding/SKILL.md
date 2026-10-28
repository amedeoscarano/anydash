---
name: customer-branding
description: Designs the one area of an admin dashboard that controls everything the end customer sees - brand assets (logo, colours, name, social links), customer emails and SMS, tracking or status pages, returns portals, labels, packing slips and invoices - with a live rendered preview, send test, reset to default and sender domain status. Produces a branding spec section or an inline answer with rule IDs. Use when a product sends emails, hosts a tracking page or portal, prints documents for end customers, or when reviewing brand, notification-template or customer-email settings. Do not use it for the admin UI's own theme or visual tokens (use visual-tokens), for staff or account alerts, or for marketing email campaigns.
---

# Customer branding

Decides how merchants control what their own customers see. Brand assets live in one place and every customer surface reads from them. Each template has a rendered preview with sample data, a test send where it is a message, and a visible default. Rules come from the Shopify, DHL Express Commerce and Cloudflare dashboards.

## Input

- A brief or a repo path listing the customer-facing outputs: emails, SMS, tracking or status page, returns portal, labels, packing slips, invoices, hosted error pages.
- Which messages are sent automatically and what triggers each.
- Whether email goes from the merchant's own domain.
- `dash-spec/inventory.md` and `dash-spec/ia.md` when run from `/dash:build`.

## Output

- From `/dash:build`: a "Customer branding" section in `dash-spec/pages.md`, its place in `dash-spec/ia.md`, and decision rows in `dash-spec/decisions.md`.
- When asked directly: an inline answer with the same content.
- Content: a table `Surface | Reads from Brand | Editor | Preview | Test | Default | Rule IDs`, then skeletons of the Brand page, the customer messages list and one template editor.

## Procedure

Full rule text is in `references/rules.md`.

1. List every customer surface. If there is only one hosted page, keep its look inside that page's editor and skip the Brand page (BRD-001 exception). With several stores or sending identities, make one Brand page per store, pick the store in each editor, and prefill logo and name from the store connection when it provides them (no rule yet).
2. Brand page. Put logo, favicon, colours, store name and social links on one page. Every surface reads from it; editors show "Logo and colours come from Brand" with a link instead of their own upload (BRD-001). Under the title, say where the assets are used and where a surface renders them differently (BRD-002).
3. Colours (suggestion). Name each by role, pair a swatch with an editable hex field, say where the role is used (BRD-007, low confidence). A single accent colour may skip the role name.
4. Images (suggestion). Show the current thumbnail, accepted formats, recommended size, Replace and Remove (BRD-008, low confidence).
5. Defaults (suggestion). Give each value and template "Reset to default", and say what the customer sees when a value is empty or a feature is off. Free-text fields with no default (slogan, social links) get only Remove (BRD-009, low confidence).
6. Customer messages list. Group messages by journey stage (order, delivery, returns). Each row: name, trigger in one line, on/off state (BRD-005). With only one or two messages, show cards without groups. Suggested: keep the list apart from staff alerts and webhooks (BRD-010, low confidence).
7. Template editor. Give it a rendered preview with a realistic sample order, reachable in one click; a side-by-side preview is one way (BRD-003). Suggested for form-based editors: optional blocks (notice, promotion, footer) behind an "Enable" checkbox, with "Fields left blank are not shown" (BRD-011, low confidence).
8. Send test. Next to every email or SMS template, "Send test" sends the current unsaved content to an address the merchant chooses. A message the product cannot send outside a live event says so instead (BRD-004).
9. Sender (suggestion). Show sender name and address, the sending domain's authentication status, the records to fix it, and the fallback sender until fixed. If the product always sends from its own domain, show only display name and reply-to (BRD-006, low confidence).
10. Documents and tracking page. Labels, packing slips and invoices get the same preview rule; a sample PDF is acceptable when an inline render is not possible (BRD-003 exception).

## Rules applied

- BRD-001 — One brand source for every customer surface (medium).
- BRD-002 — Say where brand assets appear (medium).
- BRD-003 — Rendered preview with sample data, one click from the editor (medium).
- BRD-004 — Send test with unsaved content (medium).
- BRD-005 — Customer messages grouped by lifecycle stage, trigger and state per row (medium).
- BRD-006 — Sender identity with domain status, records and fallback (low).
- BRD-007 — Colour fields with role, swatch and hex (low).
- BRD-008 — Uploads show thumbnail, formats and size (low).
- BRD-009 — Reset to default and visible fallback (low).
- BRD-010 — Customer messages apart from staff alerts (low).
- BRD-011 — Optional blocks behind an Enable checkbox (low).

## Example

Good (shipping admin): Settings > Brand reads "Used on: shipping emails, tracking page, returns portal, packing slips." It holds "Primary - buttons and headings [swatch] [#1A3A5F] [Reset]" and "Logo - SVG or PNG, at least 512x512 px [thumbnail] [Replace] [Remove]". Settings > Notifications links to "Customer notifications" and "Staff notifications" separately. Customer notifications groups "Delivery: Shipped - sent when a label is created [on]". Its editor shows the form left and a preview with sample order #1042 right, a "Send test" button, and "Promotion block [ ] Enable". BRD-001, BRD-002, BRD-007, BRD-008, BRD-010, BRD-005, BRD-003, BRD-004, BRD-011.

Bad: the returns portal tab has its own logo upload and accent colour; the email editor can only be checked by sending a real email; "Order confirmation" sits between "New order alert" and "Webhook failed" in one alphabetical list; colours are "Colour 1" and "Colour 2" swatches with no hex field. Violates BRD-001, BRD-003, BRD-010, BRD-005, BRD-007.

## Self-check

- [ ] Logo and colours are edited in exactly one place, and every surface says it reads from there.
- [ ] Every editable customer template has a rendered preview with sample data, one click away.
- [ ] Every email or SMS template has Send test using unsaved content.
- [ ] Customer messages are listed by journey stage, apart from staff alerts and webhooks.
- [ ] Every brand value shows what the customer sees when it is empty, and can be reset.
- [ ] Low-confidence rules (BRD-006 to BRD-011) are marked as suggestions in the spec.
