# Contributing

Thanks for helping. The most useful contributions are new rules with evidence, better checks for existing rules, and fixes to false positives.

## Rules

`rules/source/*.yaml` is the single source of truth. One file per area. Never edit `rules/RULEBOOK.md` or a skill's `references/` by hand: they are generated. The full format is in [rules/README.md](rules/README.md).

```yaml
area: navigation
prefix: NAV
rules:
  - id: NAV-001                 # <PREFIX>-<3 digits>, unique, never reused
    title: Short noun phrase
    rule: One imperative sentence.
    why: The reason, in one or two sentences.
    source: observed            # documented | observed | inferred
    evidence:                   # one entry per reference portal, always all three
      - {portal: shopify, status: observed, page_type: settings_page}
      - {portal: dhl, status: absent, page_type: settings_page}
      - {portal: cloudflare, status: documented, page_type: other}
    confidence: high            # high = 3/3 or documented | medium = 2/3 | low = 1/3 or inferred
    applies_when: When the rule applies.
    exceptions: When it does not.
    do: Short good example.
    dont: Short bad example.
    check_static: How to verify on code, spec or screenshot.
    check_live: How to verify in a running browser.
```

## Evidence

- Every rule lists all three reference portals, each as `observed`, `documented` or `absent`.
- Set `confidence` from the evidence, not from opinion. See [docs/methodology.md](docs/methodology.md).
- `source: documented` needs a public design guide that states the rule. Link it in your pull request.
- A rule needs a usable `check_static` or `check_live`. A rule that cannot be checked is rewritten or dropped.
- In the pull request, describe what you saw and where (page type, not account). Do not attach screenshots of third-party portals.
- Never commit account ids, store names, emails, customer data, HAR files, traces or recordings.

## Skills

Each skill is a folder under `skills/` with a `SKILL.md`. The `name` in the frontmatter must match the folder. Keep the description under 1024 characters and `SKILL.md` under 500 lines. Link only to files that exist.

## Before you open a pull request

Run all three, in this order:

```
node scripts/build-references && node scripts/validate && npm test
```

All must pass.

## Planned: /dash:learn

`/dash:learn` is planned for v0.2. It will turn the study of a new reference portal into candidate rules in this format. Until then, add rules by hand.
