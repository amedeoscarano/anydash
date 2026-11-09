# States

| Page | Empty | Loading | Error | Not found |
|---|---|---|---|---|
| Home | Each count shows 0 with its link | Skeleton per block, announced (STA-003) | Per block, with Retry (STA-004) | n/a |
| Orders | One empty template for the table: "No orders yet. Orders appear here when your storefront syncs." with the button `Connect storefront`. Shown whenever the table has no rows. | Skeleton rows (STA-003) | Region error with Retry | n/a |
| Order detail | n/a | Skeleton sections | Region error with Retry | Not-found page inside the shell, link back to Orders (STA-006) |
| Shipments | "No shipments yet. Create a label from an order." with `Go to orders` | Skeleton rows | Region error with Retry | n/a |
| Customers | "No customers yet. Customers are added with their first order." | Skeleton rows | Region error with Retry | n/a |

## Feedback

- Save outcomes: toast on success; field errors under the field with aria-invalid (FDB-003).
- Label failures stay on the shipment as a status and in the activity log (FDB-004).
- One toast region and one status live region mounted at the root (FDB-008).
