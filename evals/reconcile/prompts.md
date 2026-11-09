# /dash:reconcile eval prompt

Fixtures: `fixtures/api-surface.json` (value-free surface captured by the clone eval), `fixtures/openapi.json` (synthetic official schema, version 0.3.0), `fixtures/repo/` (tiny plain-JS admin: JSDoc model, a form with status and priority selects, `node --test`).

## Setup

Copy `fixtures/` to a scratch folder. Run there.

## Prompt, verbatim

> /dash:reconcile openapi.json repo
> Also cross-check with api-surface.json. It is our own backend. Cover the order endpoints; their system owns orders, `priority` is ours. You may write the adapter, mapper and tests once matrix.md and gaps.md exist.

Expected: [EXPECTED.md](EXPECTED.md). Last run: [RESULTS.md](RESULTS.md); the reconciled repo is in `run/repo/`.
