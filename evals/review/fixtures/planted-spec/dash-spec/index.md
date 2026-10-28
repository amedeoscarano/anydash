# Parcel desk admin: spec

Synthetic spec for the /dash:review eval. A small order and shipping admin for one online store. One account, one brand, no billing in the product, no AI assistant.

Approval status: pending

## Files

- [inventory.md](inventory.md)
- [ia.md](ia.md)
- [pages.md](pages.md)
- [controls.md](controls.md)
- [states.md](states.md)
- [onboarding.md](onboarding.md)
- [tokens.md](tokens.md)
- [decisions.md](decisions.md)

## Open questions

- Roles are assumed: Owner and Staff. Staff cannot open Settings.

## Do not build

- A column picker on the five-column Orders table (IDX-005).
- Row checkboxes on Customers, which has no bulk action (IDX-008).
- An AI entry in the chrome; no assistant ships (AI-001).
