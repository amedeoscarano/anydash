---
name: learn
description: >-
  Applies this rulebook's research method to a new admin portal (Stripe, Linear, Vercel or any portal the user has legitimate access to) and proposes rule changes with evidence for a pull request to the anydash repo. Runs the ui-pattern-mining skill read-only through REA or browser-adapter, then writes dash-learn/proposed-rules.yaml (adds and modifies in the rules/source YAML format), dash-learn/evidence.md and a draft PR description, and validates the proposal. Use when the user says "learn from <portal>", wants to grow or challenge the rulebook, or wants to know whether the rules hold on another product. Do not use it to review or test the user's own dashboard (use /dash:review or /dash:review-live), to copy a site's features (use /dash:clone), or on a site the user cannot lawfully access.
disable-model-invocation: true
argument-hint: "<url>"
context: fork
---

# Learn from a portal

Study one more portal the way the three reference portals were studied, and turn what it shows into a reviewable rule proposal. The command orchestrates the ui-pattern-mining skill, checks its output with the repo's own validator, and drafts the pull request text. It runs in a forked context and returns a short summary. It never edits `rules/source/` and never opens a PR by itself.

## Input

- `<url>`: the portal's start page, on an account the user has legitimate access to.
- Optional, in the user's words: areas to focus on, a page cap, or a hypothesis to test ("do settings group by task here?").

## Output

In `dash-learn/` in the user's working folder:

- `proposed-rules.yaml` and `evidence.md` from ui-pattern-mining (format in that skill).
- `pr.md`: a draft PR description. Title `rules: evidence from <portal>`, then a table `change | id | area | title | confidence | supporting records`, a "Contradicted rules" list (each closed with one exit: `fix now` in this PR, `file as task`, `reject with rationale` or `verify with a test`), the validator output, and the line "Raw records and snapshots stay private; only abstract rules are proposed."
- `dash-learn/raw/`: snapshots, gitignored, offered for deletion at the end.

## Procedure

The sibling skill is `/dash:ui-pattern-mining` in Claude Code and `dash-ui-pattern-mining` elsewhere; read `../ui-pattern-mining/SKILL.md` and follow its Procedure and Self-check. The sibling browser-adapter (`../browser-adapter/SKILL.md`) gives the browser in either mode. If ui-pattern-mining is missing, stop: the method and the proposal checker live there. If browser-adapter is missing and REA is missing too, stop and say which tool to install.

1. **Confirm access.** Ask the user to confirm, in chat, that they have legitimate access to `<url>` and that its terms of use allow reading it. Without a yes, stop. Never bypass a login, paywall, rate limit or bot check; on a login, 2FA or CAPTCHA screen, ask the user to handle it.
2. **Pick the mode.** Own-app only on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test` or a staging host the user named in chat. Any other host is third-party-readonly: navigation only, safe-click on every click, no typing except global search, one navigation every 5 to 10 seconds.
3. **Prepare the browser.**
   - With REA (MCP server `rea`): ask the user to start Chrome with a separate profile and `--remote-debugging-port=<port>` bound to 127.0.0.1, and to log in themselves. Call `list_browser_targets` with the literal `http://127.0.0.1:<port>`, never `localhost`. Inspect each page with `inspect_web_page` (`cdp_endpoint`, `target_id`, `include_accessibility_text: true`); it is passive.
   - Without REA: a Chrome started the same way on port 9333 (browser-adapter's default), driven by browser-adapter's `readonly.mjs` (`list`, `goto`, `snapshot`, guarded `click`).
   Make sure `dash-learn/raw/` is in `.gitignore` before the first snapshot.
4. **Mine.** Run ui-pattern-mining on the portal: research questions, page records, comparison with every area in `references/rules.md`, public-doc triangulation, candidate rules. Respect the page cap and the early stop.
5. **Validate.** From a checkout of the anydash repo (ask for its path if the working folder is not one):
   `node skills/ui-pattern-mining/scripts/check-proposal.mjs <abs path>/dash-learn/proposed-rules.yaml .`
   then `node scripts/validate` to confirm the repo itself is still clean. Fix the proposal until the checker prints `proposal: ok`. Paste both outputs into `pr.md`.
6. **Privacy pass.** Read `proposed-rules.yaml`, `evidence.md` and `pr.md` once more for customer names, emails, ids, amounts, store or account names. Remove any. The repo publishes only abstract rules (`docs/methodology.md` section 9).
7. **Write `pr.md`** and stop. Tell the user how to open the PR themselves: copy each block into `rules/source/<area>.yaml` (drop the `change`, `diff` and `new_evidence` keys, or keep `new_evidence` in the PR text), run `node scripts/build-references && node scripts/validate && npm test`, and attach `evidence.md` to the PR body, not the raw folder.
8. **Return.** To the main context only: portal, pages recorded, adds and modifies per area, contradicted rules, checker result, the path of `pr.md`, and the offer to delete `dash-learn/raw/`.

## Rules applied

The mining touches every area; these rules come up first because the method's hypotheses were built on them:

- NAV-001 — work areas first, account last.
- NAV-002 — noun labels in sentence case.
- SET-001 — work in the menu, rare configuration in settings.
- SET-004 — settings as a mode with its own navigation.
- CTL-002 — switch only for instant changes (usually not testable read-only).
- SAV-001 — sticky save bar that wakes on change.
- HOM-001 — home type follows the job.
- CHR-001 — global search always in the chrome.

Full text: `references/rules.md`.

## Example

Good: `/dash:learn https://dashboard.example-billing.test/` on the user's own staging copy. The user confirms access. REA lists the target on `http://127.0.0.1:9334`; 28 pages are recorded. The proposal holds `modify SET-004` (new exception for single-product apps, `diff: [exceptions]`) and `add IDX-<next>` (row density toggle, low). The checker prints `proposal: ok`; `pr.md` lists both with their records, and the user opens the PR.

Bad: running on a portal the user only saw in a demo video, with no account. Typing a test customer into a create form to see the save model. Pasting order numbers from a list page into `evidence.md`. Committing `dash-learn/raw/`. Opening the PR without running the checker.

## Self-check

- [ ] The user confirmed legitimate access before any page was opened.
- [ ] Every third-party click passed safe-click; nothing was saved, created or deleted.
- [ ] ui-pattern-mining's Self-check passed.
- [ ] `check-proposal.mjs` printed `proposal: ok` and `node scripts/validate` passed.
- [ ] No customer, account or store data in any output file.
- [ ] `dash-learn/raw/` is gitignored and the deletion offer was made.
