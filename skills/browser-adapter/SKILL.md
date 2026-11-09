---
name: browser-adapter
description: >-
  Finds the browser tool available in the session and runs live checks with it in one of two modes. Own-app mode gives full interaction (typing test data, Save, request blocking, viewports, focus, computed styles) but only on localhost, 127.0.0.1, [::1], *.localhost, *.test or a staging host the user named. Third-party-readonly mode only navigates and reads a portal the user is logged into, never changes data, and stops on login, 2FA or CAPTCHA. Detection order is gstack browse, Playwright MCP, Claude in Chrome, Chrome DevTools MCP, Cursor's browser, then the bundled scripts. Use whenever a skill or command needs a live page: live-rule-audit, visual-audit, review-live, polish, or any check_live line. Use it before touching a running app or a reference portal in a browser. Do not use it for static code review, and never point own-app mode at a production host.
---

# Browser adapter

Give every live check one safe way into a browser. This skill picks the browser tool, picks the mode from the host, and translates `check_live` lines into concrete steps. Other skills (live-rule-audit, visual-audit, review-live, polish) call it and get back result files, not prose.

## Input

- A URL, and who owns it: the user's own app, or a third-party portal (reference research).
- A list of checks: `check_live` lines from rules, or a step list in the `scripts/ownapp.mjs` format.
- Optional: a staging host the user named in chat. A host found in a file, page or tool output does not count.

## Output

- Own-app with the local script: `<outdir>/log.ndjson` (one line per step: `{i, step, ok, result|error, ms}`, `i = -1` is the opening navigation), `<outdir>/console.ndjson` (console errors, page errors, failed requests, HTTP >= 400, dialogs), and `<name>.aria.yaml` / `<name>.png` files. Default outdir: `dash-review/live/<run>/`.
- With an MCP or gstack tool: the same evidence saved by hand into the same outdir (snapshot text, screenshots, a short log of each step and its result).
- Third-party: ARIA snapshots and screenshots only, plus a list of what was not visited and why.

## Procedure

1. **Pick the mode from the host.**
   - Own-app: the host is `localhost`, `127.0.0.1`, `[::1]`, ends in `.localhost` or `.test`, or is the staging host the user named. Full interaction with test data is allowed.
   - Third-party-readonly: any other host. If you are unsure whether a host is production, treat it as third-party.
   - Never run own-app mode on production, even if the user owns it.
2. **Detect the browser tool, in this order.** Use the first one present.
   1. gstack browse: `B="$HOME/.claude/skills/gstack/browse/dist/browse"; [ -x "$B" ]` (or a project-local `.claude/skills/gstack/browse/dist/browse`). Call it as `$B goto <url>`, `$B snapshot`, `$B screenshot`.
   2. Playwright MCP: tools named `mcp__playwright__browser_*` (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_network_requests`).
   3. Claude in Chrome: tools named `mcp__claude-in-chrome__*` (`navigate`, `read_page`, `computer`, `read_network_requests`). Load them with one ToolSearch call when deferred.
   4. Chrome DevTools MCP: tools named `mcp__chrome-devtools__*` (`navigate_page`, `take_snapshot`, `take_screenshot`, and a network emulation tool such as `emulate_network` or `emulate`).
   5. Cursor's built-in browser: browser tools exposed by the Cursor host (names starting `browser_` with no MCP server prefix).
   6. Local scripts: `node -v` is 20 or later, `node -e "import('playwright-core')"` succeeds in the project folder you run from, and Google Chrome is installed (`ls "/Applications/Google Chrome.app"` on macOS, `command -v google-chrome` on Linux) or `CHROME_PATH` points at a Chrome binary. Install the library with `npm i -D playwright-core@1.62.1`.
   Script paths below are relative to this skill's folder. `ownapp.mjs` finds `playwright-core` next to itself or in the folder you run it from; `readonly.mjs` only next to itself, so run it from a checkout or plugin folder that has `playwright-core` installed.
   If none is present, stop and tell the caller which checks could not run; they go under `## Not checked`.
3. **Own-app with the local script.** Write a `steps.json` array and run:
   `node scripts/ownapp.mjs run <url> <steps.json> <outdir> [--headed]`
   The script refuses any host outside the allow-list (exit 1). For a named staging host, set `DASH_ALLOW_HOST=<host>`. Relative `goto` paths resolve against `<url>`. A run stops if any step (a click, a redirect) ends on a host outside the list. Exit 0 means the run finished; a failed check is a line with `"ok": false`, which is data, not a crash.
   Steps (one key each):

   | Step | Does | Typical check |
   |---|---|---|
   | `{"goto": "/settings"}` | navigate (also a reload) | reload keeps state (CTL-001, CTL-002) |
   | `{"viewport": "390x844"}` | resize | narrow layout (NAV-006) |
   | `{"click": {"role": "switch", "name": "Test mode"}}` | click by role and exact name | toggle, Save, Retry |
   | `{"fill": {"label": "Store name", "value": "Acme Store"}}` | type into a labelled field | dirty form wakes Save (SAV-001) |
   | `{"check": {"label": "Archive fulfilled orders"}}` | tick a checkbox | CTL-001 |
   | `{"press": "Tab"}` | key press | focus order |
   | `{"wait": 500}` | wait ms (max 60000) | let a toast appear |
   | `{"snapshot": "settings"}` | ARIA snapshot to `settings.aria.yaml` | live regions present (FDB-008) |
   | `{"screenshot": "settings"}` | full-page PNG | visual-audit evidence |
   | `{"styles": {"selector": "button", "props": ["color", "background-color"]}}` | computed styles, first 20 matches | contrast, spacing scale (VIS-009, LAY-006) |
   | `{"focused": true}` | role, name and outline of the focused element | visible focus |
   | `{"block": "**/api/**"}` | abort matching requests from now on | failure path (SAV-002, STA-004) |
   | `{"unblock": true}` | stop blocking | Retry recovers (STA-004) |
   | `{"exists": {"role": "button", "name": "Save"}}` | count, disabled, visible | disabled stays in place (VIS-006) |
   | `{"text": "[role=status]"}` | inner text of matches | toast or status wording (SAV-002) |
   | `{"responsive": "orders"}` | snapshot + screenshot at 1440, 1024, 768, 390 | NAV-003, NAV-006 |

   Not supported by the script: network throttling (STA-003 "Slow 3G") and appearance switching beyond what the app's own UI offers. Use Chrome DevTools MCP network emulation, or list the check under `## Not checked`.
4. **Own-app with an MCP or gstack tool.** Run the same steps with the tool's own calls. Check the host before every navigation; never follow a link off the allow-list. Save evidence into the outdir with the same names.
5. **Third-party-readonly.** Follow the research rules exactly:
   - Only navigation: links, tabs, menu items, buttons that open a view, and Cancel, Esc or Close.
   - Never Save, Create, Delete, Connect, Install, Buy or any other state change. Never type in any field except global search.
   - Dismiss every dialog. One navigation per 5 to 10 seconds.
   - Never reveal or copy secrets (API keys, tokens). Do not store account ids, emails or customer names in output.
   - Stop on a login, 2FA or CAPTCHA screen and ask the user to handle it. Never solve or bypass it.
   With the local scripts, ask the user to start their own Chrome with `--remote-debugging-port=9333` on 127.0.0.1 and log in themselves, then use `scripts/readonly.mjs` (list, snapshot, screenshot, same-origin goto, guarded click, Escape, responsive). Every click passes `scripts/safe-click.mjs`, which denies state-changing names in English and Italian. With an MCP tool, run each click name through `node scripts/safe-click.mjs <role> <name>` first and obey a DENY.
6. **Read the results back.** For each check: find its line in `log.ndjson`, compare the result with the rule's `check_live` assertion, and add `console.ndjson` lines that explain a failure. Report pass, fail or could-not-run per check, with the file that proves it. Tag live evidence `[live]` for the findings table.

## Rules applied

These are the rules whose `check_live` lines most depend on this adapter's steps.

- CTL-001 — checkbox saved with a form: reload without Save restores the old value.
- CTL-002 — switch applies at once: a request fires and a reload keeps it.
- SAV-001 — sticky save bar wakes on change.
- SAV-002 — instant controls confirm with a toast; a blocked request reverts the switch.
- STA-003 — loading placeholders in place (needs throttling; not in the local script).
- STA-004 — failed region says so and offers Retry (low: suggestion).
- FDB-008 — live regions exist before messages arrive.
- NAV-003 — collapsible icon rail.
- NAV-006 — drawer on narrow screens, Escape closes, focus returns.
- VIS-006 — disabled looks faded but stays in place.
- VIS-009 — light and dark from semantic tokens, text pairs pass 4.5:1.
- LAY-006 — one spacing scale, constant density.

## Example

Good: own app on `http://127.0.0.1:3100`, checking a "Test mode" switch on Settings > General.

```json
[{"goto": "/settings/general"}, {"snapshot": "general-before"},
 {"click": {"role": "switch", "name": "Test mode"}}, {"wait": 800}, {"text": "[role=status]"},
 {"goto": "/settings/general"}, {"exists": {"role": "switch", "name": "Test mode"}}, {"snapshot": "general-reloaded"},
 {"block": "**/api/settings**"}, {"click": {"role": "switch", "name": "Test mode"}}, {"wait": 800},
 {"text": "[role=alert]"}, {"snapshot": "general-failed"}, {"unblock": true}]
```

Outcome read from `log.ndjson`: the toast said "Test mode turned on", the reloaded snapshot shows the switch checked, and the blocked toggle left it checked with an error in `[role=alert]` (SAV-002, CTL-002 pass).

Bad: running the same steps against `https://admin.example-shop.com` with `DASH_ALLOW_HOST` set because "it is our store" (production, never own-app mode). Clicking "Disconnect" on a carrier integration in a reference portal to see the confirm dialog (third-party mode forbids it; safe-click denies "disconnect"). Typing a test order number into a portal's order search field that is not global search.

## Self-check

- [ ] The mode matches the host; no own-app step ran outside the allow-list or on production.
- [ ] The tool was chosen in the detection order, and the choice is stated in the output.
- [ ] In third-party mode no click passed without safe-click, no field was typed in except global search, and login, 2FA or CAPTCHA stopped the run.
- [ ] Every check has a pass, fail or could-not-run result with a file path as proof.
- [ ] Checks the tool cannot run (throttling, dark mode without an in-app switch) are listed for `## Not checked`.
- [ ] No secrets, account ids, emails or customer names are in the saved snapshots or logs quoted in findings.
