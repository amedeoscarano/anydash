---
name: ui-pattern-mining
description: >-
  Extracts candidate UI rules from one admin portal with the research method that built this rulebook - research questions, one record per visited page, triangulation with the portal's public docs, confidence from how many portals support a rule - and writes a rule diff, never an edit to rules/source. Produces dash-learn/proposed-rules.yaml (rule blocks in the rules/source YAML format, each marked add or modify, with per-portal evidence) and dash-learn/evidence.md (page records, per-rule evidence and what was not visited). Works read-only on a portal the user has legitimate access to, through REA or the browser-adapter skill. Use when the user wants to learn from a new portal (Stripe, Linear, Vercel...), test whether existing rules hold elsewhere, or raise or lower a rule's confidence with new evidence. Do not use it to review the user's own dashboard (use /dash:review), to clone a site's features (use /dash:clone), or on a site the user cannot lawfully access.
---

# UI pattern mining

Turn one portal into evidence for the rulebook. The method is the one in `docs/methodology.md` of this repo: fixed research questions, a record per page, a second pass over public docs, and confidence counted from portals, never from impressions. The output is a proposal that a maintainer reviews in a pull request. This skill never edits `rules/source/`.

## Input

- A portal URL and the user's statement that they have legitimate access to it (their own account, within its terms of use).
- Optional: the rule areas to focus on (default: all 18 areas in `references/rules.md`).
- Optional: a page cap (default 40 pages; stop early after 5 pages in a row with no new pattern).

## Output

All files in `dash-learn/` in the user's working folder. Never commit snapshots or screenshots.

1. `dash-learn/proposed-rules.yaml`:

```yaml
portal: newportal            # short lowercase name, not a reference portal
date: 2026-10-28
areas:                       # one block per area, each in the rules/source/<area>.yaml format
  - area: navigation
    prefix: NAV
    rules:
      - id: NAV-<next>       # add: above the highest id ever used in the area
        change: add          # add | modify (modify keeps the existing id)
        title: ...           # then every field of the rule format: rule, why, source,
        # evidence (shopify, dhl, cloudflare, once each), confidence, applies_when,
        # exceptions, do, dont, check_static, check_live
        new_evidence:
          - {portal: newportal, status: observed, page_type: global, record: rec-007}
```

   A `modify` entry repeats the whole rule with the changed fields and lists them in `diff: [confidence, exceptions]`.
2. `dash-learn/evidence.md`: the research questions answered for this portal; a page record table (`record | route | page_type | nav_location | what was seen`); one section per proposed rule with the records that support it, the public doc pages read (title and URL), and the confidence argument; `## Not visited` with a reason per page; `## Contradicts` for existing rules the portal goes against.
3. Snapshots under `dash-learn/raw/`. Add it to `.gitignore` first; offer to delete it at the end.

## Procedure

1. **Access and mode.** Confirm in chat that the user has legitimate access and that the site's terms allow it. Pick the mode with the browser-adapter skill: own-app on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test` or a staging host the user named in chat; third-party-readonly anywhere else. In read-only mode: navigation only, every click through safe-click, no typing except global search, stop on login, 2FA or CAPTCHA, one navigation every 5 to 10 seconds. Never bypass auth, paywalls or rate limits.
2. **Pick the capture tool.**
   - REA (an MCP server named `rea`; the prefix depends on the client): `list_browser_targets` on a CDP endpoint that is the literal `http://127.0.0.1:<port>` (never `localhost`), then `inspect_web_page` with `cdp_endpoint`, `target_id`, `include_accessibility_text: true`. It is passive: no JS evaluation, no clicks. Navigate by hand or with browser-adapter, then inspect again. `observe_web_session` can record navigations while the user operates the page.
   - Without REA: browser-adapter only. Read-only: `readonly.mjs snapshot` and `goto` from that skill's scripts folder, against a Chrome the user started with `--remote-debugging-port=9333` on 127.0.0.1. Own-app: `ownapp.mjs` steps with `snapshot`.
3. **Ask the research questions.** Use the ten groups in `docs/methodology.md` section 3 (navigation, settings, controls, help text, page structure, global chrome, AI, behaviour, language, onboarding and integrations). Read the control type from the ARIA role, never by touching it. Behaviour that only a state change can show (does this switch save at once?) stays unanswered in read-only mode; write "not testable read-only".
4. **Write a page record per visit.** Fields as in methodology section 4: `record` id, `route` with ids replaced by `:id`, `page_type`, `nav_location`, `depth_from_home`, `header`, `controls` (role, label, help form), `save_model` with evidence or "unknown", `global_chrome`. Shapes and labels only: no customer names, emails, order numbers, amounts, account or store ids. On pages with personal data, record structure (columns, filters, actions) from the snapshot, not values.
5. **Compare with the rulebook.** For each area, read the rules in `references/rules.md`. For each rule, mark this portal `observed` (seen in a record), `documented` (public docs only) or `absent` (looked for, not there or contradicted). Not looked for is not absent: leave it out.
6. **Triangulate with public docs.** Without a browser, read the portal's public design system and help centre. A doc page that states a pattern makes it `documented`. Cite title and URL in `evidence.md`.
7. **Draft candidate rules.** A pattern seen in records and not in the rulebook becomes an `add`. New evidence for an existing rule becomes a `modify` only when it changes something: confidence, `applies_when`, `exceptions`, or a check. Count support as in `docs/methodology.md` section 6:
   - Keep the three reference portals in `evidence` exactly as the rulebook has them for a `modify`. For an `add`, check the reference portals' public docs only: `documented` if a doc states it, otherwise `absent`, and say "not verified live" in `evidence.md`.
   - The new portal goes in `new_evidence`, never in `evidence`; the validator accepts only the three reference portals there.
   - `confidence` must not exceed what `evidence` supports: high = 3 of 3 or `source: documented`, medium = 2 of 3, low otherwise. Argue in `evidence.md` what it would be counting the new portal (portals supporting / portals studied).
   - Every candidate needs a usable `check_static` or `check_live`; drop it otherwise.
   Write each rule in the house style: one imperative sentence, sentence case, no portal names in `rule`, `do` or `dont`.
8. **Validate.** From a checkout of this repo: `node skills/ui-pattern-mining/scripts/check-proposal.mjs dash-learn/proposed-rules.yaml .` It checks each area block with the same function as `node scripts/validate` (`checkRuleFile`), that `add` ids are above the highest ever used, that `modify` ids exist, that `new_evidence` names the new portal, and scans for private data patterns. Fix every error.
9. **Return.** The number of adds and modifies per area, rules the portal contradicts, pages not visited, and the deletion offer for `dash-learn/raw/`.

## Rules applied

The skill reads every rule; these shape its method most:

- NAV-001 — work areas first, account last (the first thing to check on any sidebar).
- SET-001 — work in the menu, rare configuration in settings (methodology hypothesis H1).
- SET-002 — per-object configuration on the object (H2).
- CTL-001 — checkbox for a boolean saved with a form (H5, often "not testable read-only").
- CTL-002 — switch only for instant changes (H5).
- HLP-001 — visible description for non-obvious settings (H7).
- HOM-001 — home type follows the job (the rule that replaced a refuted hypothesis).
- CHR-001 — global search always in the chrome (the only field read-only mode may type in).
- CHR-009 — bell only for a real alert feed.

Full text: `references/rules.md`.

## Example

Good: on a billing portal the user is logged into, 31 pages recorded. The settings index groups by product while each settings page groups by task, and its public design guide says "group settings by what the user wants to do". Proposal: `modify SET-007` with `diff: [exceptions]`, evidence unchanged, `new_evidence: [{portal: billingportal, status: documented, page_type: settings_index, record: rec-012}]`, and `evidence.md` quoting the doc title and URL. A sidebar "Pinned" group of saved list views, seen on 3 records and absent from the rulebook, becomes `add NAV-<next>` with `confidence: low` and a note that it would be 1 of 4 portals.

Bad: editing `rules/source/navigation.yaml` directly. Clicking "Archive" on a customer to see whether a dialog appears. Raising IDX-003 to high because "every modern app has saved views" with no record. Writing a customer's company name into a page record because it was the page title. Listing the new portal under `evidence`, which fails validation.

## Self-check

- [ ] The user confirmed legitimate access; read-only rules held on every third-party page.
- [ ] Every page record holds shapes and labels only, no customer or account data.
- [ ] Each proposed rule cites records or doc pages in `evidence.md`; not looked for is never written as `absent`.
- [ ] No confidence exceeds its evidence; the new portal sits only in `new_evidence`.
- [ ] `check-proposal.mjs` printed `proposal: ok`.
- [ ] `rules/source/` is untouched, and `dash-learn/raw/` is not committed.
