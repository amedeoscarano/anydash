# Main flows

1. **Work the open orders** (daily)
   1. `/` : open "Open orders" stat link: `GET /api/stats`
   2. `/orders` : pick a status tab: `GET /api/orders?status&q&sort&size&page`
   3. `/orders/{id}` : open a row: `GET /api/orders/{id}`
   4. Previous/next order links: `GET /api/orders/{id}`
2. **Find an order** (daily)
   1. Any page: Search ⌘K, type a query: `GET /api/orders?q` (inferred from endpoint; not typed in this run)
   2. `/orders/{id}`: `GET /api/orders/{id}`
3. **Export orders** (weekly)
   1. `/orders`: Export link: `GET /api/orders/export` (not opened)
4. **Change store or shipping defaults** (rare)
   1. `/settings/general`: `GET /api/settings`
   2. Save a section: write endpoint inferred, not called (read-only run)
5. **Turn an integration on or off** (one-time)
   1. `/settings/integrations`: `GET /api/integrations`
   2. Switch: write endpoint inferred, not called
