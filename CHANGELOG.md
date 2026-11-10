# Changelog

All notable changes to this project are listed here. Versions follow [Semantic Versioning](https://semver.org/).

## 0.2.1 - 2026-11-09

### Packaging for other agents

- Native manifests next to `.claude-plugin/`, all pointing at the same `skills/` folder: `.codex-plugin/plugin.json` (Codex and the OpenAI plugin directory), `.cursor-plugin/plugin.json` and `.cursor-plugin/marketplace.json` (Cursor), `gemini-extension.json` (Gemini CLI), `.agents/plugins/marketplace.json` (native Codex catalog, Git URL source with the required `policy` and `category`). GitHub Copilot, Devin and Factory Droid read the existing `.claude-plugin/` files.
- `skills/<command>/agents/openai.yaml` for the ten commands: Codex runs them only when called, like `disable-model-invocation` elsewhere.
- `assets/logo.svg`, used by the Codex and Cursor listings.
- `.claude-plugin/plugin.json` gains `author.url`, `homepage` and `repository`. The marketplace description moved to `metadata.description`, with `metadata.version`.

### Validator

- `scripts/validate` checks every manifest: valid JSON, name `dash`, the version and description of `.claude-plugin/plugin.json`, every `./` path present, Codex listing limits. It also checks that `disable-model-invocation` and `agents/openai.yaml` agree.

### Install

- `scripts/install.sh --tool copilot` writes to `~/.copilot/skills` and keeps all frontmatter keys. Auto-detection skips Copilot and Gemini CLI when Codex is present, because both read `~/.agents/skills`. `--uninstall` still covers every detected tool.
- README: the four 0.2.0 commands and six analysis skills are listed; the "planned for v0.2" lines are gone.
- `docs/install.md` rewritten per agent: native install from GitHub first, then the skills CLI and the script, how to invoke, what is not supported. New `docs/publishing.md` with the submission steps for each directory.
- Install tested in sandboxed homes: Codex CLI 0.167.0 (`codex plugin marketplace add` + `codex plugin add dash@anydash`), Gemini CLI 0.67.0 (`gemini extensions install`) and Copilot CLI 1.0.108 (`copilot plugin marketplace add` + `copilot plugin install dash@anydash`) each load all 39 skills. Cursor is checked against its docs only.

## 0.2.0 - 2026-11-09

- M4: `/dash:friction` with `session-recorder` (headed Playwright recording, masked event log, video and trace kept local) and `friction-analysis` (11 friction signals, KLM baseline, bottleneck ranking, ffmpeg frames, before/after compare). Eval: the seeded detour in the example ranks as the top bottleneck.
- M5: `/dash:clone`, `/dash:reconcile`, `/dash:learn` with `site-feature-mapper`, `api-surface-capture` (`har-shapes.mjs`: endpoint shapes without values), `api-ui-reconciliation` and `ui-pattern-mining`. Uses REA when present, with a fallback. Evals on the local example.
- Anonymous rulebook: reference portals are now `portal_a` to `portal_d` in evidence. No published file names a studied product; vendor-specific labels in examples became generic ones.
- Owner interview folded in: 16 rules amended (landing page by product need, profile as an avatar menu, a notifications entry, a bottom utility block, status views on the work list, settings grouped by purpose, options with a title and a one-line result, dependent choices kept together). No confidence changed. The simplicity framework is now `task-first-simplicity.md`.

## 0.1.1 - 2026-11-09

### Rulebook

- Navigation study: a read-only study of a fourth reference portal (portal D), for navigation and the global chrome around it. Method and scope in `docs/methodology.md`.
- New rules NAV-013 to NAV-016: category rail plus a persistent section menu (medium), rail labels on hover without moving the page (low), a second column that fits the category's job (low), and a phone drawer that opens at the current category (low). 183 rules: 67 high, 72 medium, 44 low.
- 14 existing rules gained portal D evidence: NAV-001 to NAV-006, NAV-011, CHR-001, CHR-002, CHR-007, CHR-011, SET-003, SET-004 and SET-005. No confidence was raised.
- Confidence now counts supporting portals: high = 3 or documented guidance, medium = 2, low otherwise.

### Validator

- Optional fourth portal: `scripts/validate` accepts `portal_d` as an optional evidence entry, at most once per rule. The three core portals are still required in every rule.

### Docs and skills

- `global-chrome` and the global chrome map accept a top-bar breadcrumb switcher for a nested scope, under the CHR-007 exception.
- The placement decision tree and the global chrome map cite NAV-013 where the sidebar structure is decided.

## 0.1.0 - 2026-10-28

First public release. It covers milestones M1 to M3.

### Rulebook (M1)

- 179 rules in 18 areas: 67 high, 71 medium and 41 low confidence. Source of truth: `rules/source/*.yaml`.
- 8 decision frameworks in `rules/frameworks/`: placement decision tree, control selection matrix, help text tree, settings taxonomy, page templates, global chrome map, AI interaction model, simplicity analysis.
- `rules/RULEBOOK.md` and each skill's `references/` generated by `scripts/build-references`.
- `scripts/validate` checks the rule files and lints every skill.
- Skill `rule-library`. Plugin and marketplace manifests.

### Design (M2)

- Commands `/dash:build`, `/dash:states` and `/dash:onboard`.
- Skills `nav-placement`, `settings-architecture`, `sidebar-behavior`, `global-chrome`, `home-layout`, `index-page`, `detail-page`, `control-selection`, `save-model`, `help-text-policy`, `microcopy`, `feedback-messaging`, `ui-states`, `onboarding-setup`, `integration-connect`, `customer-branding`, `ai-assistant-ux` and `visual-tokens`.

### Review (M3)

- Commands `/dash:review`, `/dash:review-live` and `/dash:polish`.
- Skills `static-rule-audit`, `live-rule-audit`, `visual-audit` and `browser-adapter`.
- `browser-adapter` supports gstack, Playwright MCP, Claude in Chrome, Chrome DevTools MCP, Cursor's browser and local `playwright-core` scripts, in own-app and third-party read-only modes.
- `examples/flawed-dashboard`: a small Next.js dashboard with 15 seeded violations and an answer key.
- Blind eval: `/dash:review` 13/15, `/dash:review-live` 15/15 (`evals/review/RESULTS.md`).

### Known limits

- `/dash:friction`, `/dash:clone`, `/dash:reconcile` and `/dash:learn` are not in this release. They are planned for v0.2.
- `/dash:onboard` gives a model estimate (KLM) of time to first value, not a measured one.
- False positives seen in the blind eval: CTL-002 on instant switches, VIS-002 on Save buttons that are never enabled together, FDB-008 on regions added at runtime, STA-004 when regions already have Retry, and CHR-002 on native browser behaviour. Filed in `ROADMAP.md`.
- No rule yet for "permission denied by role" or for resuming a half-finished onboarding. None of the three portals showed one.
- Some rules rest on documentation or inference, not on a live test. For example, instant apply for switches is documented but was not tested live. Low-confidence rules are labelled as suggestions.
- Parts of the simplicity framework are inferred and not yet confirmed first-hand.
- The local browser scripts do not throttle the network. Use Chrome DevTools MCP for that check, or it is listed as not checked.
