# Brief: Acme Invoicing admin

Synthetic brief for evals. Acme is a placeholder name.

Acme Invoicing is a SaaS tool for freelancers and small agencies. Each account is one business. There is no second workspace or store.

## Users and roles

- Owner: everything, including billing for the Acme subscription.
- Accountant: creates and sends invoices, records payments, exports to accounting. No billing, no user management.
- Viewer: reads invoices and reports only.

## Objects and jobs

- Invoices: create, send, record a payment, send a reminder, void. Owners and accountants work here every day. Sending emails the customer. Voiding cannot be undone.
- Customers: add and edit billing contacts. A few times a week.
- Products and services: price list used on invoice lines. Edited rarely.
- Recurring invoices: schedules that create and send invoices. Only on the Pro plan.
- Payments: a log of received payments. The payment provider matches each one to its invoice automatically; nobody works this list.
- Reports: revenue and overdue amounts by month.
- Late fees: per account, a yes/no option plus a percentage, saved with the other invoice defaults.
- Invoice defaults: currency, payment terms, numbering, footer note.

## Integrations

- A card payment provider, connected once by the owner. Customers pay from the invoice link.
- A CSV export for an accountant's bookkeeping tool.

## Customer-facing outputs

- Invoice emails (new, reminder, receipt) and the invoice PDF, with the business logo and colour.

## Billing and administration

- The Acme subscription is billed in the product. Plans: Free and Pro.
- Users and roles, API keys and an audit log.

## Wishes from the founder

1. "Put Billing and API keys in the main menu so people find them."
2. "A notification bell that shows 'Invoice saved' and 'Customer updated' confirmations."
3. "A five-step setup wizard at first login: company name, email, currency, time zone, logo." Company name and email are entered at signup. Currency and time zone are known from the browser locale.
4. "A Settings landing page with a card for every settings area."
5. "An AI assistant that chases overdue invoices by sending reminders on its own."
6. "Tabs on the customer page: Overview, Invoices, Notes."
