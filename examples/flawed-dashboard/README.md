# Flawed dashboard (test fixture)

A small admin dashboard for a fictional shipping store, "Acme Store". It contains **exactly 15 seeded violations** of rules in `rules/source/`. Use it to test the review skills (`/dash:review`, `/dash:review-live`, `/dash:polish`) and to measure their recall and false positives.

The answer key is [EXPECTED_FINDINGS.md](EXPECTED_FINDINGS.md). Do not give it to the reviewer under test.

## What is in it

- Next.js App Router, Tailwind CSS 4, plain JavaScript. No database and no secrets. All data is fake and in memory, and it resets when the server restarts.
- Pages: Home (key figures), Orders (index), Order detail, and Settings with General, Notifications, Branding and Integrations.
- Fake API in `app/api/*` route handlers: `stats`, `orders`, `orders/[id]`, `orders/export` (CSV), `settings`, `notifications`, `integrations`, `integrations/[id]`.
- Failure hook: `PATCH /api/integrations/<id>` returns 503 when the URL has `?fail=1` or the request has the header `x-fail: 1`. When the Integrations page is opened as `/settings/integrations?fail=1`, it adds the query to its requests. Blocking `**/api/**` in the browser works too.
- Some endpoints add a delay of 300 to 900 ms so that loading states can be observed.

## Run it

Requirements: Node 20.9 or later.

```
npm ci
npm run dev -- -p 3100
```

Open http://localhost:3100. To build a production bundle, run `npm run build && npm run start -- -p 3100`.

## Scoring a review

1. Run the reviewer on this folder (static) or on http://localhost:3100 (live).
2. Match each finding to a row in EXPECTED_FINDINGS.md by rule ID. Where a row names an alternative ID, that ID also counts.
3. Hits / 15 = recall. A static review is expected to miss rows 14 and 15 (live-only) and probably row 5, and to list those IDs under "Not checked" or in its coverage notes. A static hit on row 5 counts.
4. Findings that match no row and are not listed under "Not seeded" are false positives.
