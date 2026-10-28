# Inventory (eval fixture)

Synthetic fixture for `evals/states/prompts.md`, prompt 2. Copy it to `dash-spec/inventory.md` in the run folder. It adds plan and role gates that the example code does not have, so the states spec has locked and denied cells to fill.

## Roles

| Role | Settings access |
|---|---|
| Owner | Everything. Grants the Branding permission to Staff. |
| Staff | Opens General, Notifications and Integrations. Can read Integrations but cannot switch them. Cannot open Branding unless an Owner grants the Branding permission. |

## Plans

| Plan | Gated features |
|---|---|
| Free | Brand colour in Branding is not available. |
| Pro | All features. |

## Settings pages

| Page | Route | Data source | Objects |
|---|---|---|---|
| General | `/settings/general` | `GET /api/settings` | store settings, draft order count |
| Notifications | `/settings/notifications` | `GET /api/notifications` | notification templates (list) |
| Branding | `/settings/branding` | `GET /api/settings` | brand colour, email footer |
| Integrations | `/settings/integrations` | `GET /api/integrations` | integrations (list) |
