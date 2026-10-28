# PROGRESS

Resume point for any new session. Read `MISSION.md` (local only, gitignored) first.

## Current phase
Phase 5, M2 done (2026-10-28). GATE 2 OK (keep CTL-002 and SAV-002 at high). GATE 3 OK (v0.1 after M3; M4 and M5 in v0.2).
M1 a43ac5b, M2 d268135; main and m1-foundations, m2-design pushed to private repo github.com/amedeoscarano/anydash.
M2: 18 design skills + build, states, onboard. Per-group critic review, cross-skill consistency review, /dash:build --plan dry run; 36 issues closed or filed in ROADMAP.md.
Verified: `claude plugin validate .` passes; `npx skills add . --list` finds 22 skills; validate ok; 17 tests pass; gitleaks clean.

### History
Phase 2 running (2026-10-27). GATE 1 passed: owner logged in, verified by title/URL on all 3 tabs. ffmpeg + gitleaks install approved.
Workflow `dash-portal-explore` (run wf_4ed64365-889): per portal explore → completeness critic → gap fill → PII + evidence verify. Resume with its scriptPath + resumeFromRunId if interrupted.
DHL onboarding interview (6.5) sent to owner early; answers pending.
Phase 2 done: wf_4ed64365-889 → shopify 89 pages, dhl 70, cloudflare 103 (over the 80 cap), each with summary, sitemap, settings-map, not-visited, verification notes. AI questions: Sidekick 3, Cloudflare Ask AI 3, DHL has no assistant (`~/dash-research/*/ai-questions.md`).
Incidents: (1) SA-Cloudflare ran a shared scratchpad helper overwritten by SA-Shopify → 4 GET-only page loads on the Shopify tab to non-existent paths, no clicks or typing; lesson: per-agent helpers bound to one target. (2) SA-Cloudflare fill agent wrote summary.md with a Bash heredoc after a harness guard blocked the Write: breach of the "hook denial is final" rule, reported to owner.
Phase 3 running on branch m1-foundations: wf_2041dd65-eaa (comparison.md → rules/source/*.yaml per area → skeptic verify → 8 frameworks → critic → ~/dash-research/gate2-draft.md).

## Phase 0 results (2026-10-27)

| Tool | Status | Action |
|---|---|---|
| gstack /browse | 1.91.173 (niki profile), 1.91.270 (main). `connect` launches its own Chromium; no attach to an external CDP endpoint. `--tab-id N` / `BROWSE_TAB` pin a tab per command. Headed mode defaults to dialog dismiss. | Not used to drive portals (see D1). |
| REA | rea-agents 6.7.0, MCP `rea` registered, skill `reverse-engineer-anything` present. Browser docs: skill `references/runtime-observation.md` (no `docs/browser-observation.md` in the npm package). | Use `list_browser_targets` on 127.0.0.1:9333. |
| gh | logged in as amedeoscarano, scopes repo, workflow | none |
| Node | v24.22.1, npm 11.19.1 | none |
| Playwright | no global package; Chromium 1234 in cache; playwright 1.62.1 bundled with gstack | pin playwright in repo scripts when needed |
| ffmpeg | 9.0.2 installed 2026-10-27 (brew) | none |
| gitleaks | 8.30.1 installed 2026-10-27 (brew) | none |
| skill-creator | present (claude-plugins-official) | use in Phase 6 |
| Claude Code | 2.1.209 | none |

## Decisions
- D1 2026-10-27: browser = Google Chrome with dedicated profile `~/dash-research/chrome-profile`, CDP on 127.0.0.1:9333 only. gstack cannot attach to it, so portal actions go through a local Playwright `connectOverCDP` driver guarded by `bin/safe-click`; REA observes the same targets passively.
- D2 2026-10-27: `MISSION.md` is gitignored because it holds private account IDs.

## Browser targets (REA `list_browser_targets`, 127.0.0.1:9333)
Tab ids are kept in the private research notes (they change with each browser session).
