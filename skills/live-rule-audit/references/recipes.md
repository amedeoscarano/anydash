# Live check recipes

Ready `steps.json` files for the browser-adapter own-app driver:

```
node ../browser-adapter/scripts/ownapp.mjs run <base-url> <steps.json> <outdir>
```

Each run is one browser session. Read `<outdir>/log.ndjson` (one line per step: `i`, `step`, `ok`, `result` or `error`, `ms`), the snapshot and screenshot files, and `<outdir>/console.ndjson`. A failed step is data, not a crash. Step numbers below count from 1 in the array; the logged `i` is that number minus 1 (`i = -1` is the opening navigation). Cite the logged `i` in the finding's Where column. Pages that load their data in the browser show a placeholder first: keep the `wait` after each `goto` before an `exists`, `snapshot` or `styles` step, or the step reads the loading state. ownapp dismisses native dialogs (`confirm`, `beforeunload`) and logs each one in `console.ndjson` with `kind: dialog`.

Every label below ("Store name", "Orders", "Email me when a shipment fails") is a placeholder from a shipping admin. Run the discovery recipe first and replace each name with the exact accessible name from the snapshot. Never guess a name: a click on a wrong name fails and wastes a run.

With a browser MCP instead of the script, browser-adapter maps each step to the tool's own calls (navigate, resize, click by ref, accessibility tree, screenshot, JavaScript for `styles`). The assertions stay the same.

## 0. Discovery

```json
[
  {"goto": "/"},
  {"snapshot": "home"},
  {"goto": "/orders"},
  {"snapshot": "orders"},
  {"goto": "/settings"},
  {"snapshot": "settings"}
]
```

From the snapshots, list: the sidebar links and their names, the collapse and menu buttons, every settings page, every form field with its current value (`textbox "Store name": Acme Store`), every switch and its state, the list search field. These names feed the other recipes and the findability inventory.

## 1. Sidebar at four breakpoints

Rules: NAV-003, NAV-004, NAV-006, CHR-012, LAY-008.

```json
[
  {"goto": "/orders"},
  {"styles": {"selector": "[aria-current=page]", "props": ["background-color"]}},
  {"responsive": "nav-orders"},
  {"viewport": "1440x900"},
  {"goto": "/orders/1001"},
  {"styles": {"selector": "[aria-current=page]", "props": ["background-color"]}},
  {"responsive": "nav-order-detail"},
  {"viewport": "1440x900"},
  {"goto": "/orders"},
  {"click": {"role": "button", "name": "Collapse sidebar"}},
  {"snapshot": "nav-1440-collapsed"},
  {"screenshot": "nav-1440-collapsed"},
  {"press": "Tab"},
  {"focused": true},
  {"screenshot": "nav-1440-rail-focus"},
  {"viewport": "390x844"},
  {"goto": "/settings/general"},
  {"exists": {"role": "navigation", "name": "Main"}},
  {"click": {"role": "button", "name": "Open menu"}},
  {"snapshot": "nav-390-drawer"},
  {"press": "Escape"},
  {"focused": true},
  {"styles": {"selector": "main, main table, main pre, main img", "props": ["width", "overflow-x"]}}
]
```

Assert:
- `responsive` snapshots at 1440 and 1024: the sidebar is present with every top-level item named. At 768: sidebar or icon rail with names. At 390: no visible sidebar (NAV-006).
- Steps 2 and 6: among the `[aria-current=page]` matches, exactly one per navigation is the Orders item, on the list and on the detail page (NAV-004). A closed drawer often renders the same links a second time, so two identical "Orders" matches are one item; a breadcrumb's `aria-current` belongs to the breadcrumb. The ARIA snapshot does not show `aria-current`, so read it from `styles`. A `responsive` step leaves the viewport at 390x844; steps 4 and 8 reset it.
- Collapsed at 1440: every item still in the snapshot with a non-empty name; the toggle's `[expanded]` flipped (NAV-003). The tooltip on hover needs a hover step: with ownapp, check the tooltip on keyboard focus only (step 15 screenshot, when step 14 is a rail item; else add Tab steps) and list the hover half under Not checked.
- At 390: `exists` on the main navigation reports `count: 0` or `visible: false` before the menu opens; the drawer snapshot holds the links plus search, help and user menu with names (CHR-012); after Escape, `focused` is the "Open menu" button (NAV-006).
- LAY-008: every 390 px screenshot from `responsive` is exactly 390 px wide. ownapp takes full-page screenshots, so a wider PNG (read the width from bytes 16 to 19 of the file, for example `node -e 'console.log(require("fs").readFileSync(process.argv[1]).readUInt32BE(16))' f.png`) means the page scrolls sideways; the PNG width is the `scrollWidth`. Overflow often depends on data (a long reference, an email), so also run `responsive` on a detail record with long values. With a browser MCP, assert `document.documentElement.scrollWidth <= innerWidth` directly. Step 23 adds the `main` width (at least 90% of 390 px).

## 2. Save bar dirty state and leave guard

Rules: SAV-001, SAV-004, SAV-005. Own-app mode only (it types into fields).

```json
[
  {"goto": "/settings/general"},
  {"wait": 1000},
  {"exists": {"role": "button", "name": "Save"}},
  {"fill": {"label": "Store name", "value": "Acme Store test"}},
  {"exists": {"role": "button", "name": "Save"}},
  {"exists": {"role": "button", "name": "Discard"}},
  {"styles": {"selector": "form div:has(> button)", "props": ["position", "top", "bottom"]}},
  {"fill": {"label": "Store name", "value": "Acme Store"}},
  {"exists": {"role": "button", "name": "Save"}},
  {"fill": {"label": "Store name", "value": "Acme Store test"}},
  {"fill": {"label": "Support email", "value": "support@example.com"}},
  {"click": {"role": "button", "name": "Discard"}},
  {"snapshot": "after-discard"},
  {"exists": {"role": "button", "name": "Save"}},
  {"fill": {"label": "Store name", "value": "Acme Store test"}},
  {"click": {"role": "link", "name": "Orders"}},
  {"wait": 1000},
  {"snapshot": "leave-dirty"},
  {"text": "h1"},
  {"goto": "/settings/general"},
  {"wait": 1000},
  {"click": {"role": "link", "name": "Orders"}},
  {"wait": 1000},
  {"text": "h1"}
]
```

Assert:
- Step 3: Save absent, or `disabled: true`. Steps 5 and 6: Save enabled and `visible: true`; Discard exists (SAV-001, SAV-004).
- Step 7: the match that holds Save has `position: sticky` or `fixed` (SAV-001). If nothing matches, change the selector to the save bar's container from the snapshot.
- Step 9: after restoring the original value, Save is disabled again (SAV-001).
- Steps 12 to 14: both fields show the saved values and Save is disabled (SAV-004).
- Steps 15 to 19, dirty form: a `dialog` or `alertdialog` appears in the snapshot, or the `h1` is still the settings page and the field still holds "Acme Store test". A native guard shows up as a `kind: dialog` line in `console.ndjson`; ownapp dismisses it, so the page stays. Say which kind it was in Evidence. A new `h1` ("Orders") with no dialog fails SAV-005.
- Steps 20 to 24, clean form: the `h1` is "Orders" with no dialog (SAV-005).

Use the original values from discovery. End every run with the data as it was.

## 3. Switch with a blocked request

Rules: SAV-002, CTL-002, FDB-008. Own-app mode only.

```json
[
  {"goto": "/settings/notifications"},
  {"wait": 1000},
  {"snapshot": "switch-before"},
  {"click": {"role": "switch", "name": "Email me when a shipment fails"}},
  {"wait": 1500},
  {"text": "[role=status], [role=alert], [aria-live]"},
  {"goto": "/settings/notifications"},
  {"wait": 1000},
  {"snapshot": "switch-after-reload"},
  {"block": "**/api/**"},
  {"click": {"role": "switch", "name": "Email me when a shipment fails"}},
  {"wait": 5000},
  {"snapshot": "switch-after-fail"},
  {"text": "[role=status], [role=alert], [aria-live]"},
  {"unblock": true},
  {"goto": "/settings/notifications"},
  {"wait": 1000},
  {"snapshot": "switch-server-state"},
  {"click": {"role": "switch", "name": "Email me when a shipment fails"}},
  {"wait": 1500},
  {"snapshot": "switch-restored"}
]
```

Assert:
- Step 6: a live region holds a success message within 5 s. Step 9: after reload the switch keeps the new `[checked]` state (SAV-002).
- Step 13: with the request blocked, the switch is back to its step 9 state and step 14 holds an error message, ideally with Retry (SAV-002). A switch that stays flipped is a `major` finding: the UI shows a state the server does not have. Static review cannot see this when the revert depends on the request outcome or on component state at run time; say so in Evidence.
- Step 18 shows the server state; step 21 matches step 3 again (original value restored).
- No Save button on the same section as the switch (CTL-002).

If step 18 differs from step 9, the block missed the request. Find the real write in `console.ndjson` or the code (a Server Action posts to the page URL, not `/api`), change the pattern, and run again. Block only after the page has loaded: a blocked page URL breaks the reload. Data fetched on the server (React Server Components, SSR) never passes the browser, so `block` cannot fail it; use the app's own failure switch if the test setup has one (a `?fail=1` query or a test header), else list the check under Not checked.

## 4. Toast and live regions

Rules: FDB-008, FDB-001, FDB-003, FDB-007, FDB-009 (low), SAV-006.

```json
[
  {"goto": "/orders"},
  {"text": "[role=status], [role=alert], [aria-live], section[aria-label]"},
  {"snapshot": "regions-at-load"},
  {"goto": "/settings/general"},
  {"wait": 1000},
  {"fill": {"label": "Store name", "value": "Acme Store test"}},
  {"click": {"role": "button", "name": "Save"}},
  {"wait": 800},
  {"snapshot": "after-save"},
  {"text": "[role=status], [aria-live]"},
  {"wait": 9500},
  {"snapshot": "after-save-10s"},
  {"fill": {"label": "Store name", "value": ""}},
  {"click": {"role": "button", "name": "Save"}},
  {"wait": 800},
  {"snapshot": "invalid-submit"},
  {"styles": {"selector": "[aria-invalid=true]", "props": ["border-color"]}},
  {"fill": {"label": "Store name", "value": "Acme Store"}},
  {"click": {"role": "button", "name": "Save"}},
  {"wait": 1500},
  {"goto": "/settings/general"},
  {"wait": 1000},
  {"click": {"role": "button", "name": "Delete store"}},
  {"snapshot": "delete-dialog"},
  {"press": "Escape"},
  {"snapshot": "delete-cancelled"}
]
```

Assert:
- Step 2: the toast region and an empty status region exist before any action (FDB-008). A region that is created only with its first message is a `major` finding that static review can miss when the toaster mounts lazily.
- Steps 9 and 10: success shows in the toast or status region, and no dialog opened (FDB-001, FDB-007).
- Step 12: a toast that carries Undo or Retry is still present after 10 s (FDB-009, low: `minor` at most).
- Steps 16 and 17: the empty required field matches `[aria-invalid=true]` and its message sits under the field, not only in a toast (FDB-003).
- Steps 18 to 20 put the original value back and wait for the save to finish. Step 24: one `alertdialog` or `dialog`, its body states the consequence, its confirm button names the action ("Delete store", not "OK"). Step 26: closed, no change (SAV-006, FDB-007). Never confirm a delete unless the user named the record as test data.

## 5. Keyboard focus order and visible focus

No rule ID covers focus order or the focus indicator. Report them as "no rule" with the reason "WCAG 2.4.3 focus order" or "WCAG 2.4.7 focus visible". Severity: `blocker` when a core task (main navigation, Save, the primary create action) cannot be reached or seen by keyboard; otherwise `minor`. NAV-006 and CHR-002 cover focus return after a drawer or search closes.

Generate the steps, since they repeat:

```
node -e 'const s=[{goto:"/settings/general"}];for(let i=1;i<=30;i++)s.push({press:"Tab"},{focused:true},{styles:{selector:":focus",props:["outline-style","outline-width","outline-color","box-shadow","background-color"]}});s.push({screenshot:"focus-last"});console.log(JSON.stringify(s,null,1))' > focus.json
```

Run it on a list page, a detail page and a settings page. Then a short run for search and Shift+Tab:

```json
[
  {"goto": "/orders"},
  {"press": "Tab"},
  {"focused": true},
  {"press": "Control+k"},
  {"focused": true},
  {"press": "Escape"},
  {"focused": true},
  {"press": "Shift+Tab"},
  {"focused": true}
]
```

Use `Meta+k` on macOS. Assert:
- The sequence of `focused` results follows the visual order: skip link if any, sidebar, top bar, then main content top to bottom, then the save bar. Focus never lands on `body` or on a hidden element mid-sequence.
- Every focused element has a non-empty name (CTL-009, low: `minor`).
- Visible focus: `focused` returns `outline` and `boxShadow`. The outline style is not `none` with `outline-width` of at least 1 px, or `box-shadow` is not `none`. For an outline, compute the ratio of `outline-color` against the background with the visual-audit contrast helper; below 3:1 is a weak indicator. When both are `none`, screenshot that step and look before you file it: some designs change the background instead.
- After Ctrl/Cmd+K a dialog opens with focus in a combobox or searchbox; after Escape focus is back on the element focused before (CHR-002).
- Shift+Tab from the first focusable element leaves the page (`focused: null`); that is not a fault. Shift+Tab from inside the page must land on the previous element in the forward sequence.

## 6. Contrast from computed colours

Owned by the visual-audit skill (its contrast recipe and helper script). Run it there; do not duplicate the check here.

## 7. Empty, no-match, not-found and error states

Rules: STA-001, STA-002, STA-004 (low), STA-006, IDX-011.

```json
[
  {"goto": "/orders"},
  {"wait": 1000},
  {"fill": {"label": "Search orders", "value": "zzzz-no-match"}},
  {"press": "Enter"},
  {"wait": 1000},
  {"snapshot": "orders-no-match"},
  {"goto": "/orders/999999"},
  {"wait": 1500},
  {"snapshot": "order-not-found"},
  {"goto": "/no-such-page"},
  {"snapshot": "route-not-found"},
  {"block": "**/api/orders**"},
  {"goto": "/orders"},
  {"wait": 3000},
  {"snapshot": "orders-blocked"},
  {"screenshot": "orders-blocked"},
  {"unblock": true},
  {"click": {"role": "button", "name": "Retry"}},
  {"wait": 2000},
  {"snapshot": "orders-retry"}
]
```

Assert:
- Step 6: a no-match message that names the search and offers to clear it, different from the empty-list state (IDX-011).
- Steps 9 and 11: the sidebar is still in the snapshot, the heading says the page or order is missing, and a link leads on (STA-006).
- Steps 15 and 16: the orders region says it failed and offers Retry; the sidebar and other regions render (STA-004, low: `minor` at most, even when the region shows a false "0 orders" or loads forever; say so in Evidence).
- Step 18: Retry recovers after unblocking.
- The same server-side caveat as recipe 3 applies to step 12.

Empty state (STA-001, STA-002) needs a list with zero items. Use a fresh test account, a test filter or scope the seed data leaves empty, or the app's reset script. Never delete records to make a list empty unless the user named them as disposable test data. If no empty list is reachable, list STA-001 under Not checked.

Loading placeholders (STA-003) need a slow network. ownapp has no throttle step: check them with a browser MCP that can throttle, or list STA-003 under Not checked.

## Composing other checks

For any other rule, read its `check_live` in `references/rules.md` and build steps from the same vocabulary: `goto`, `viewport`, `click`, `fill`, `check`, `press`, `wait`, `snapshot`, `screenshot`, `styles`, `focused`, `block`, `unblock`, `exists`, `text`, `responsive`. A check that needs a script (bounding boxes, `scrollWidth`, `elementFromPoint`) runs only with a browser MCP JavaScript tool; with ownapp, use a proxy and say so (the full-page screenshot width for `scrollWidth`, `styles` for sizes), or list it under Not checked.
