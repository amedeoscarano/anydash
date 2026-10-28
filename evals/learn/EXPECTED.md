# /dash:learn expected result

- [ ] `dash-learn/proposed-rules.yaml` with `portal: localship`, `date`, `areas: [{area, prefix, rules}]`; each rule has `change` and `new_evidence` naming `localship`.
- [ ] `node skills/ui-pattern-mining/scripts/check-proposal.mjs dash-learn/proposed-rules.yaml .` prints `proposal: ok`.
- [ ] Each area block, written to a temp file and passed to `checkRuleFile` from `scripts/lib/rules.mjs`, returns 0 errors, with and without the `change`, `diff`, `new_evidence` keys.
- [ ] `add` ids are above the highest id in the area; `modify` ids exist.
- [ ] `evidence.md` has page records with route templates and no values; `pr.md` holds the table, contradicted rules and both validator outputs.
- [ ] `rules/source/` is unchanged; no PR is opened.
