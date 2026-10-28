# Brief: Parcelpad (fictional shipping admin)

Synthetic brief for evaluating `/dash:onboard`. The product, the people and the data are invented.

## Product

Parcelpad is a web admin for small online shops that ship their own parcels. The daily job is one queue: new orders come in from the shop, staff buy and print a shipping label for each, and the order moves to Shipped.

- Users: the shop owner (sets the account up) and one or two warehouse staff (print labels).
- Feature pages: Orders (the queue), Shipments, Packages, Automation rules, Returns.
- Plans: Starter and Pro. Both include a built-in carrier with negotiated rates. Pro can add the shop's own carrier account.
- Labels are billed per label to the card given at signup.

## Signup form (already built, not in scope)

Email, password, shop URL, country, plan, card. The country gives currency, weight and dimension units, timezone and the default label size.

## Data source

Orders come from the shop platform through OAuth: the user clicks authorise, approves on the shop platform's page and returns. A shop can have several stock locations, and Parcelpad must know which location ships. After connecting, orders import every 10 minutes.

## Current first-run draft (to be replaced)

A full-screen wizard with nine steps before the user sees the app:

1. Business name
2. Currency
3. Timezone
4. Weight and dimension units
5. Default package (empty length, width, height and weight fields)
6. Label format (A4 or 4x6)
7. Sender name and return address
8. Connect shop, followed by a mapping form with 15 fields (order number, SKU, weight, phone and so on) and an "Import now" button
9. Notification emails

Customs data (tax or EORI number) is needed only for shipments outside the customs union.

## Goal

A new owner sees their own orders in Parcelpad and can buy a first label as quickly as possible, without mistakes in anything printed on a label.
