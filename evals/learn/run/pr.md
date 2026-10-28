# rules: evidence from localship

| Change | Id | Area | Title | Confidence | Supporting records |
|---|---|---|---|---|---|
| modify (exceptions) | HOM-002 | home | Open work as counted links to filtered lists | medium | rec-001 |
| add | SET-013 | settings | Account maintenance in a danger zone at the end of settings | low | rec-004 |

## Contradicted rules

- SET-005: settings entry not separated at the sidebar bottom (rec-001).

## Validator output

```
$ node skills/ui-pattern-mining/scripts/check-proposal.mjs dash-learn/proposed-rules.yaml .
proposal: ok
$ node scripts/validate
rules: 179 (medium 71, low 41, high 67)
validate: ok
```

Raw records and snapshots stay private; only abstract rules are proposed.
