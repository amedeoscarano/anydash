# Rebuild spec: shipping admin

Input for `/dash:build`. Our design replaces theirs; this says what to build.

## Must

| Feature | Why this bucket | Design skill | Rule IDs |
|---|---|---|---|
| Order list with status segments, search, sort, pagination | core object, daily | index-page | IDX-001, IDX-004, NAV-001 |
| Order detail (items, history, customer, shipment, neighbours) | core object, daily | detail-page | DET-001, DET-003, DET-005 |
| Home with work-queue figures | daily entry point | nav-placement | HOM-001, NAV-001 |
| Global search | daily, every page | global-chrome | CHR-001 |

## Should

| Feature | Why this bucket | Design skill | Rule IDs |
|---|---|---|---|
| Order export | weekly, list-level action | index-page | IDX-010 |
| Notification types and channels | admin configuration | settings-architecture | SET-001, SET-004 |
| Shipping defaults | admin configuration used by every order | settings-architecture, control-selection, save-model | SET-007, CTL-007, SAV-003 |

## Could

| Feature | Why this bucket | Design skill | Rule IDs |
|---|---|---|---|
| Store details, branding | one-time setup | settings-architecture, save-model | SET-001, SAV-003 |
| Integrations on/off | one-time, instant change | integration-connect, control-selection | CTL-002 |
| Appearance preference in user menu | personal preference | global-chrome | SET-008, CHR-008 |
| Delete drafts | rare, destructive | save-model | SAV-006, DET-012 |

## Won't

| Feature | Why | Design skill | Rule IDs |
|---|---|---|---|
| Row checkboxes without bulk actions | none seen; keep it that way | index-page | IDX-008 |
| Notification bell | no alert feed exists | global-chrome | CHR-009 |

## Open questions

- Write endpoints for settings, notifications and integrations were not called (read-only run). Confirm methods and bodies from the backend team or an OpenAPI file.
- Is `status` a closed list on the backend? The UI shows four states.
- Account menu items were not opened.

## Not visited

- `/api/orders/export` (download), account menu, notification edit dialogs, bundle-only routes (`analyze_web_bundle` failed).
