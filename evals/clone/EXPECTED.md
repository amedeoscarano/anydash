# /dash:clone expected result

- [ ] Asks to confirm legitimate access before any page is opened (the prompt already confirms it).
- [ ] Mode own-app (127.0.0.1); REA used if present, CDP endpoint `http://127.0.0.1:9334`, never `localhost`.
- [ ] `dash-clone/ia.md` lists the real pages: `/`, `/orders`, `/orders/{id}`, `/settings/general`, `/settings/branding`, `/settings/notifications`, `/settings/integrations`; nav tree with Home, Orders, Settings; settings has its own navigation.
- [ ] `dash-clone/features.md` has order list, order detail, export, settings sections and integrations, each with frequency, basis and evidence tag.
- [ ] `dash-clone/api-surface.json` lists `GET /api/orders` (query `page, q, size, sort, status`), `GET /api/orders/{id}` (200, 404, error shape), `GET /api/settings`, `/api/notifications`, `/api/integrations`, `/api/stats`, `/api/me`, with types only.
- [ ] `templates.md`, `data-model.md`, `flows.md`, `spec.md` exist; every Must and Should item names a design skill and an existing rule ID.
- [ ] Privacy: `grep -rEi 'acme|1001|@example|test customer|test admin' dash-clone/ --exclude-dir=raw` finds nothing.
- [ ] `dash-clone/raw/` is gitignored and offered for deletion; no HAR or screenshot outside it.
