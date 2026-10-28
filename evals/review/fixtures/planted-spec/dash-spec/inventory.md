# Inventory

| Object or job | Kind (work or config) | Frequency | Roles | Plan / gate | Risk (one or more) | Source (brief or file path) |
|---|---|---|---|---|---|---|
| Orders | work | daily | Owner, Staff | none | customer-facing, destructive (delete) | brief |
| Shipments and labels | work | daily | Owner, Staff | none | billed, customer-facing | brief |
| Customers | work | weekly | Owner, Staff | none | reversible | brief |
| Carrier accounts | config | rare (set up once, edited a few times a year) | Owner | none | billed | brief |
| Store details and currency | config | rare | Owner | none | customer-facing | brief |
| Order defaults (auto-archive, packing slip) | config | rare | Owner | none | reversible | brief, assumed |
| Team members | config | rare | Owner | none | reversible | brief, assumed |

No alert feed: the product stores no notifications. Outcomes of the user's own actions are reported as toasts.
