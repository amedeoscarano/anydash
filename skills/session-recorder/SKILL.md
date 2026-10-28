---
name: session-recorder
description: >-
  Records one person doing one workflow in a web dashboard - clicks with their target, sampled pointer moves, scrolls, focus, masked typing (field label and length, never the value), key presses, navigations, a DOM-mutation heartbeat, dialogs, validation errors, network timing - plus a video and a Playwright trace, all on the local machine. Runs on the user's own app (localhost, 127.0.0.1, *.localhost, *.test, or a staging host they named) in Chrome with a dedicated profile; a third-party portal only in read-only mode. Has a scripted mode for repeatable test recordings. Use when someone wants to watch how long a task really takes, find where users get lost, or capture a before/after session for friction-analysis; /dash:friction calls it. Do not use it to audit rules on a static page (live-rule-audit), to drive checks without a human (browser-adapter), on a production host, or to record anyone without their knowledge.
---

# Session recorder

Capture what a person does while they complete one workflow, in a form a script can analyse. The output is a folder of NDJSON logs, a video and a trace. The friction-analysis skill reads it; the exact format is in `references/events.md`.

## Input

- The start URL and who owns it: the user's own app, or a third-party portal (read-only).
- The workflow in one sentence ("change the default package weight") and, if known, how success looks: a CSS selector that appears (`[role=status]`) or a URL fragment (`url:/settings/saved`).
- For a scripted run: a `steps.json` in the browser-adapter `ownapp.mjs` step format.

## Output

`<outdir>/` (default `./recordings/<timestamp>/`, relative to where you run it: run from the user's project root, never from the skill folder):

- `events.ndjson`: one user or page event per line.
- `network.ndjson`: one request per line, timing and status, no query, no bodies.
- `video/*.webm`: screen video, one file per tab.
- `trace.zip`: Playwright trace with screenshots and DOM snapshots (open with `npx playwright show-trace`).
- `meta.json`: start, end, url, viewport, success, stop reason, version.

Field-by-field schema and one example line per event type: `references/events.md`.

## Procedure

1. **Check the host.** Own-app mode accepts `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test`, or the one host in `DASH_ALLOW_HOST` (a staging host the user named in chat, never production). Anything else needs `--readonly`. If you are unsure whether a host is production, treat it as third-party.
2. **Check the tools.** Node 20+, `playwright-core` 1.62.1 importable from this skill folder or the folder you run from (`npm i -D playwright-core@1.62.1`), and Google Chrome installed (or `CHROME_PATH`). If any is missing, say which and stop.
3. **Tell the human what will happen.** A Chrome window opens with a separate recorder profile (default `~/.dash/recorder-profile`, never their normal profile, so they may need to log in to their app once). They do the workflow as they normally would, then press Enter in the terminal. Typed values are masked in the logs, but the video and trace show the screen.
4. **Start the recording.**
   `node scripts/record.mjs <url> [outdir] [--success "<css selector>|url:<substring>"] [--profile <dir>]`
   It stops on Enter, when the success condition matches, when the browser is closed, on Ctrl-C, or (own-app mode) when the page leaves the allowed hosts.
5. **Third-party portal.** Add `--readonly`. The script prints the read-only rules; repeat them to the human: only navigate (links, tabs, menus, buttons that open a view, Cancel, Esc, Close); never Save, Create, Delete, Connect, Install or Buy; type only in global search; stay away from pages that show API keys. `--script` is refused in this mode.
6. **Scripted mode** (tests, evals, before/after on a fixture app):
   `node scripts/record.mjs http://127.0.0.1:3198/ /tmp/rec --script steps.json`
   Steps: `goto`, `click` (role + exact name), `fill` (label + value, typed key by key), `check`, `press`, `wait`, `viewport`, as in ownapp.mjs, plus two recorder-only steps: `{"clickText": "Package weight"}` clicks any element by exact text (for dead clicks on labels) and `{"back": true}` goes back in history. Fixed delays make timing human-scale and repeatable: 700 ms before each step, 90 ms per typed key, a 12-step pointer path to each target. A failing step ends the recording with `stopReason: "script-error"` and exit 1.
7. **Check the result.** `meta.json` exists (it is written last), `stopReason` is what you expected, and `events.ndjson` has `click` and `navigation` lines. If the success condition was given, read `meta.success.matched`.
8. **Hand over and clean up.** Pass the folder to friction-analysis. Keep recordings out of git (`recordings/` is in this repo's `.gitignore`; add it to the user's). `--keep-video` is the default; after analysis, offer to delete `video/` and `trace.zip`, which hold unmasked screen content.

## What is never recorded

- Input values. Text fields log label and length (password fields not even the length); checkboxes `checked`; selects `selectedIndex`.
- Query values of params named like token, key, secret, session, password, email, auth, code, otp or sig (navigation URLs and URLs in error messages), and every query string (network).
- Request or response bodies and headers, native dialog text, alert text (validation errors are logged as counts and field labels).
- Anything outside the machine: nothing is uploaded.

## Example

Good: the user's shipping admin runs on `http://127.0.0.1:3100`. Task: "change the default package weight".

```
node scripts/record.mjs http://127.0.0.1:3100/ recordings/weight-before --success "url:/settings/packages?saved"
```

The human opens Settings, misses Packages, clicks the "Default weight" text twice, goes back, uses search. `events.ndjson` shows two `click` lines with `"control": null` and no `mutations` line after them, then a `navigation` back to a URL seen before. friction-analysis turns that into the top bottleneck.

Bad: recording `https://admin.example-shop.com` with `DASH_ALLOW_HOST` because "it is our store" (production). Pointing `--profile` at `~/Library/Application Support/Google/Chrome` (refused: it holds the user's real cookies and passwords). Committing `recordings/` or pasting a frame with a customer address into a public issue.

## Self-check

- [ ] The host is on the allow-list, or `--readonly` was used and the human heard the read-only rules.
- [ ] The human knew a recording was running and how to stop it.
- [ ] `meta.json` exists and `stopReason` is expected; `events.ndjson` and `network.ndjson` are non-empty.
- [ ] `grep` for a value you typed finds nothing in the `.ndjson` files and `meta.json`.
- [ ] The recording folder is outside git, and the user was offered deletion of `video/` and `trace.zip` after analysis.
