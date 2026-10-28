---
name: api-surface-capture
description: >-
  Captures the API surface behind a web app the user has legitimate access to: endpoints (method, path template with ids as {id}, query parameter names, status codes) and request and response JSON shapes with types only, never values. Reads live traffic passively through REA (list_browser_targets, inspect_web_page with include_json_body_shapes, analyze_web_bundle for endpoint candidates) or, when REA is missing, a HAR the user exports from Chrome DevTools, reduced by scripts/har-shapes.mjs. Writes api-surface.json (dash-clone/api-surface.json under /dash:clone). Use when /dash:clone or /dash:reconcile runs, or when someone asks which endpoints a dashboard calls, what an object looks like on the wire, or which fields a rebuild or integration must map. Do not use it to map pages and menus (use site-feature-mapper), to map fields onto your own UI (use api-ui-reconciliation), to replay or fuzz requests, on an account the user cannot log into themselves, or to bypass login, paywalls or rate limits.
---

# API surface capture

Turn the traffic of a running web app into a list of endpoints and value-free JSON shapes. The result tells a rebuild which objects exist, which fields they carry and what type each field has. It never holds a value: no names, emails, ids, amounts, tokens, cookies or headers. The api-ui-reconciliation skill reads it next.

## Input

- The start URL and who owns it: the user's own app (local or a staging host they named), or a third-party portal they are logged into.
- One of:
  - A Chrome started with `--remote-debugging-port=<port>` on `127.0.0.1` and a page open in it (REA route).
  - A HAR file the user exported from DevTools (fallback route).
- Optional: the origin of the API when it differs from the page origin (`https://api.example.com`).

## Output

`api-surface.json` (under /dash:clone: `dash-clone/api-surface.json`). Format `anydash-api-surface/1`:

```json
{
  "format": "anydash-api-surface/1",
  "source": "har",
  "entries": 15,
  "skipped": { "nonApi": 2, "otherOrigin": 1, "badUrl": 0 },
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/orders/{id}",
      "calls": 3,
      "query": ["expand"],
      "status": [200, 404],
      "request": null,
      "response": { "contentType": ["application/json"], "shape": {
        "id": "integer", "status": "string:enum(4)", "created_at": "string:date-time",
        "customer": { "email": "string:email", "name": "string" },
        "lines": [{ "sku": "string", "qty": "integer", "price": "number" }],
        "note?": "string" } },
      "error": { "error": "string" }
    }
  ]
}
```

Shape notation:

- Leaf types: `string`, `integer`, `number`, `boolean`, `null`, joined with `|` (`string|null`).
- String formats: `string:uuid`, `string:email`, `string:date`, `string:date-time`, `string:url`.
- `string:enum(<n>)`: 2 to 7 distinct short values that repeat. Only the count is stored. With `--enum-labels`, lowercase label tokens (`paid`, `in_transit`) are stored as `string:enum(in_transit,paid)`; any other value keeps the count.
- Arrays collapse to one element shape: `[{...}]`. A key that is missing in some samples ends in `?`.
- An object keyed by ids, emails, dates or keys with dots, dashes or spaces becomes a map: `{ "{key}": <shape> }`. Query names of that kind are written as `{key}`.
- `error`: the body shape of responses with status 400 or higher, kept apart from `response`.
- `operation`: the GraphQL `operationName`, which the developer chose, so it is kept.
- Not written: hosts and origins (they can name a tenant), headers, cookies, query values, bodies, timings.

## Procedure

1. **Confirm access.** Ask the user to confirm they have legitimate access to the site and that capture stays within its terms of use. Third-party portals follow the read-only rules of the browser-adapter skill: navigate only, never Save, Create, Delete, Connect or Buy, one navigation per 5 to 10 seconds, stop on login, 2FA or CAPTCHA and hand over to the user. Never bypass auth, paywalls or rate limits. Skip pages that show API keys or secrets.
2. **Pick the route.** Check whether the REA MCP server ("rea") is connected: its tools are named `list_browser_targets`, `inspect_web_page` and so on, with a client-specific prefix. If it is, use step 3. If not, use step 4. Tell the user which route you took.
3. **REA route (passive, no JS evaluation, no clicks).**
   1. The user starts Chrome with a separate profile: `--user-data-dir=<temp dir> --remote-debugging-port=9333`, opens the app and logs in themselves. The CDP endpoint must be the literal `http://127.0.0.1:9333`, never `localhost`.
   2. `list_browser_targets` with that endpoint; pick the page target of the app.
   3. For each page the user opens (index, detail, settings sections): `inspect_web_page` with `cdp_endpoint`, `target_id`, `include_json_body_shapes: true`, `allowed_origins` set to the app and API origins, and `observation_ms` long enough for the page's requests (2000 to 5000). Do not set `include_script_sources`, `include_storage_keys` or `include_console_text`: they are not needed here.
      - The tool only sees requests that fire inside its observation window; requests from an earlier page load are not available. A full page load inside the window aborts the call (`target_changed`). So start the call first, then have the user click an in-app link to the next page during the window (a client-side route change keeps the target), and inspect once per page.
      - REA's shapes carry JSON types only (`string`, `number`, `array`), no formats or enum counts, and its request URLs contain real ids and query values. When formats matter (`string:email`, `string:date-time`), use the HAR route as well and keep REA as the cross-check.
   4. Optional: `analyze_web_bundle` on the app's JS bundle lists route and endpoint candidates without running code. Add candidates that no page called as endpoints with `"calls": 0` and `"response": null`.
   5. Optional: `observe_web_session` while the user clicks through a flow, to catch calls that only fire on interaction.
   6. Write `api-surface.json` by hand with `"source": "rea"`, using the same format and rules as the script: ids in paths become `{id}`, query names only, types only, formats and enum counts as above. Never copy a value from REA's evidence into the file.
4. **HAR route (fallback).**
   1. The user opens DevTools, Network tab, ticks "Preserve log", clicks through the pages and flows, then uses "Export HAR (sanitized)". The file stays on their machine and out of git (`*.har` is in this repo's `.gitignore`; add it to theirs).
   2. Run from this skill's folder:
      `node scripts/har-shapes.mjs <file.har> [--origin <api origin>] [--enum-labels] > api-surface.json`
      It keeps fetch, XHR and JSON entries of one origin (default: the first page's origin), decodes base64 bodies, reads JSON and form-encoded request bodies, and writes only the shapes. Under /dash:clone write to `dash-clone/api-surface.json`.
   3. REA can also read a HAR offline (`inspect_web_network_capture` with an absolute `capture_path` and `format: "har"`), but it returns body values. Prefer the script; if you use REA here, never write its raw output to a file.
5. **Review before saving.** Read every `path`. A plain-word last segment or object key that varies fewer than 8 times stays literal (`/api/settings/general` is right; `/api/stores/acme` is a value): replace it with `{id}` or `{key}` by hand. Grep the output for the account name, the user's email domain and a known order or customer number: each must be absent. Check `skipped.otherOrigin`: a high count means the API lives on another origin, so rerun with `--origin`.
6. **Hand over.** Pass the file to api-ui-reconciliation (via /dash:reconcile). After capture, offer to delete the HAR.

The rule areas do not cover this skill: it gathers evidence and makes no design decision, so it cites no rule IDs.

## Example

Good: the user runs their shipping admin on `http://127.0.0.1:3100`, exports `orders.har` after opening Orders, one order and Settings > Packages, and runs `node scripts/har-shapes.mjs orders.har > dash-clone/api-surface.json`. The file lists `GET /api/orders` with query `["page", "status"]`, `GET /api/orders/{id}` with `customer.email: "string:email"` and `status: "string:enum(4)"`, and `PUT /api/settings/packages` with the request shape `{ "default_weight": "number", "unit": "string:enum(2)" }`. A grep for the store name finds nothing.

Bad: the agent pastes a response body into `api-surface.json` "as an example", keeps `/api/customers/jane@example.com` as a path, writes the `Authorization` header to show the auth scheme, and clicks "Sync now" on a third-party portal to trigger more requests. Each of these writes a value or changes data.

## Self-check

- [ ] The user confirmed legitimate access; third-party capture followed the browser-adapter read-only rules.
- [ ] The REA endpoint was `127.0.0.1`, or the HAR route ran because REA was missing.
- [ ] Every path is a template; no id, email, slug or tenant name remains.
- [ ] No value in the file: grep for the account name, an email and an order number came back empty.
- [ ] No headers, cookies, tokens or query values in the file.
- [ ] The HAR is outside git, and the user was offered its deletion.
