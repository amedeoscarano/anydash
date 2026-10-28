# Brief: Acme Returns admin

Synthetic brief for evals. Acme is a placeholder name.

Acme Returns is a native app for one company's returns warehouse team. It runs on Mac at the desk and on iPad at the receiving dock. The company runs two warehouses of its own (North and South). Both belong to the same account.

## Users and roles

- Manager (Mac): everything, including return policy settings, refund limits and users.
- Inspector (iPad): receives parcels, inspects items, records the condition. Inspectors never get access to settings.

## Objects and jobs

- Returns: one queue of incoming returns (requested, in transit, received, inspected, refunded, rejected). Inspectors and managers work it all day.
- Inspection: per return, the condition of each item (as new, opened, damaged) and photos. Done by inspectors.
- Refund decision: approve or reject per return. Approving issues a refund to the customer's original payment and emails them. Cannot be undone.
- Restock: put inspected items back to stock in the chosen warehouse. Weekly review by managers.
- Return reasons: list of reasons shoppers can pick. Edited rarely.
- Return policy: return window in days, "Refund automatically when inspection is as new" (yes/no), restocking fee percentage. Saved together with a Save button.
- Carrier labels: a label provider integration that creates prepaid return labels. Connected once by a manager.

## Customer-facing outputs

- Emails to shoppers: return approved with the label, refund issued, return rejected.

## Wishes from the operations lead

1. "A dashboard home with six KPI tiles before people get to the returns."
2. "Checkboxes on every row of the returns list." No bulk action is named anywhere.
3. "Five tabs on the return detail: Summary, Items, Photos, Refund, History."
4. "Use toggles everywhere, they look nicer, also on the iPad policy form with Save."
5. "A Delete return button next to Approve refund."
