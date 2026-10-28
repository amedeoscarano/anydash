# /dash:review and /dash:review-live on examples/flawed-dashboard

Blind runs, 2026-10-28. Each reviewer worked on a copy of the example without `EXPECTED_FINDINGS.md` or `README.md`, loaded the command's `SKILL.md` and followed it literally. A separate agent scored the findings against the answer key: a seed is a hit when a finding names its rule ID (or a listed alternative) and the same place or behaviour.

| Command | Seeds found | Target | Live-only seeds found |
|---|---|---|---|
| `/dash:review` | 13 / 15 | ≥ 12 | 0 / 2 (listed under Not checked, as designed) |
| `/dash:review-live` | 15 / 15 | ≥ 13 | 2 / 2 (LAY-008 at 390 px, VIS-004 contrast 4.36:1) |

Noise:

- `/dash:review`: 51 rows. About 10 were real unseeded issues, now listed in the answer key. About 5 were false positives: CTL-002 extended to instant switches, FDB-008 for alerts inserted at runtime, VIS-002 for two Save buttons that are never enabled together, and STA-004 for a missing `app/error.js` when the regions already have Retry.
- `/dash:review-live`: 36 rows. About 6 were real unseeded issues and 2 or 3 were false positives. One was CHR-002 for Escape clearing a search input, which is native browser behaviour.

Exits: the false positives are filed in `ROADMAP.md` to tighten `static-rule-audit` and `live-rule-audit`. The real unseeded issues are listed in the example's answer key.
