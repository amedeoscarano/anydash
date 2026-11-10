# anydash

Agent skills to design, review and test admin dashboards, using UI rules reverse-engineered from best-in-class admin panels.

## What it does and for whom

anydash is a set of agent skills for people who build admin dashboards, back offices and settings areas. It is for developers, designers and product people who work with a coding agent such as Claude Code, Codex, Cursor or Gemini CLI.

The skills apply one rulebook: 183 UI rules in 18 areas, plus 8 decision frameworks. Each rule has an ID, a confidence level, do and don't examples, and a check for code and a check for a running app. The rules come from a read-only study of four production admin dashboards from different domains. Three reference portals cover all areas. A fourth adds evidence for navigation and the global chrome around it (sidebar, top bar, settings entry). See [Methodology and evidence](#methodology-and-evidence).

With anydash your agent can:

- design a new dashboard from a brief, with a spec and a decision log;
- add the missing empty, loading, error and locked states;
- design or check the onboarding;
- review existing code against every rule;
- test a running app in the browser;
- fix the visual layer, tokens first.

Every finding and every decision cites a rule ID, so you can see why.

## Commands

The marketplace is `anydash` and the plugin is `dash`. In Claude Code the commands are `/dash:<name>`. In other tools the skills are named `dash-<name>` when you install them with `scripts/install.sh`, or keep the plain folder name (`review`, `build`) when you install them with the skills CLI.

| Command | What it does | Example |
|---|---|---|
| `/dash:build` | Designs and builds a dashboard from a brief or a repo. Writes `dash-spec/`, waits for your approval, then builds. | `/dash:build "shipping admin for a small store; one owner, one packer" --plan` |
| `/dash:states` | Writes or checks the empty, no-match, loading, error, locked, denied and not-found states of every page. | `/dash:states dash-spec/` |
| `/dash:onboard` | Designs or checks the path from signup to first value and estimates time to first value. | `/dash:onboard ./my-admin` |
| `/dash:review` | Static review of code, a spec or screenshots against the whole rulebook. No browser. | `/dash:review ./my-admin` |
| `/dash:review-live` | Static review, then live checks in a browser, then a findability test of the settings. | `/dash:review-live http://localhost:3100` |
| `/dash:polish` | Screenshots key pages at four widths, audits the visual layer and fixes tokens first. | `/dash:polish http://localhost:3100` |
| `/dash:friction` | Records one person doing one workflow, then finds the steps that lose time against a KLM baseline. | `/dash:friction "create a product" http://localhost:3100` |
| `/dash:clone` | Maps a web dashboard you can access, read-only, and turns it into a rebuild spec. | `/dash:clone https://admin.example.com` |
| `/dash:reconcile` | Maps an API (api-surface.json, OpenAPI or GraphQL) onto your dashboard repo, field by field. | `/dash:reconcile openapi.yaml ./my-admin` |
| `/dash:learn` | Applies the rulebook's research method to a new admin portal and proposes rule changes with evidence. | `/dash:learn https://admin.example.com` |

Output goes to a `dash-*` folder in your project, for example `dash-spec/` (design) or `dash-review/` (review).

## Skills

The commands call these skills. Your agent can also use each one on its own.

**Design**

| Skill | Job |
|---|---|
| `rule-library` | The rulebook and the frameworks. Reference for every other skill. |
| `nav-placement` | Where each function lives: sidebar, sub-nav, settings, object page, top bar, palette or checklist. |
| `settings-architecture` | What goes into settings, how it is grouped, and the layout of each settings page. |
| `sidebar-behavior` | Sidebar order, groups, active state, collapse and behaviour at 1440, 1024, 768 and 390 px. |
| `global-chrome` | Search, command palette, notifications, help, AI entry, profile and scope switcher. |
| `home-layout` | Whether the dashboard needs a home page, and what goes on it. |
| `index-page` | List and table pages: toolbar, tabs with counts, filters, bulk actions, pagination. |
| `detail-page` | The page for one object: header, actions, sections, history. |
| `control-selection` | Checkbox, switch, radio, segmented control, select, combobox or number field. |
| `save-model` | Instant apply, sticky save bar, save per section, confirm dialog, undo. |
| `help-text-policy` | Visible description, tooltip, docs link, banner or no help, field by field. |
| `microcopy` | Button labels, menu items, titles and a glossary of terms. |
| `feedback-messaging` | Toast, inline error, banner, modal or status text for every event. |
| `ui-states` | The state matrix of every page and region. |
| `onboarding-setup` | First run: defaults, shortest path to first value, checklist or short wizard. |
| `integration-connect` | Integration list, connect flow, test connection, sync logs, masked credentials. |
| `customer-branding` | The area that controls what end customers see, with a live preview. |
| `ai-assistant-ux` | Where the assistant sits, what context it gets, and how it asks before it writes. |
| `visual-tokens` | Spacing, type, colour, radius, density and breakpoints as tokens. |

**Analysis**

| Skill | Job |
|---|---|
| `static-rule-audit` | Runs the static check of every rule on code, a spec or screenshots. |
| `live-rule-audit` | Runs the live check of every rule in a browser. |
| `visual-audit` | Finds visual inconsistencies from screenshots and computed styles, including real contrast. |
| `browser-adapter` | Finds the browser tool in the session and runs live checks in own-app or read-only mode. |
| `session-recorder` | Records one workflow: clicks, scrolls, masked typing, navigations, network timing, plus video and trace, kept local. |
| `friction-analysis` | Splits a recording into steps, times them against a KLM baseline and ranks the bottlenecks. |
| `site-feature-mapper` | Maps the sitemap, navigation, page templates, settings and feature list of a web app, read-only. |
| `api-surface-capture` | Captures the endpoints and JSON shapes behind a web app, types only, never values. |
| `api-ui-reconciliation` | Maps an API onto the dashboard UI and data model, field by field. |
| `ui-pattern-mining` | Extracts candidate UI rules from one admin portal and writes a rule diff with evidence. |

## Requirements

| Command | Needs |
|---|---|
| `/dash:build`, `/dash:states`, `/dash:onboard`, `/dash:review` | An agent that loads skills. Nothing else. |
| `/dash:review-live`, `/dash:polish` | A browser tool (see below). |
| `/dash:friction` | Node 20 or later, `playwright-core` 1.62.1 and Google Chrome to record. ffmpeg for bottleneck frames (optional). |
| `/dash:clone`, `/dash:learn` | REA, or a browser tool as the fallback. |
| `/dash:reconcile` | An agent that loads skills, plus Node 20 or later. |

The live commands use the first browser tool they find, in this order:

1. gstack browse
2. Playwright MCP
3. Claude in Chrome
4. Chrome DevTools MCP
5. Cursor's built-in browser
6. Local scripts: Node 20 or later, `playwright-core` 1.62.1 (`npm i -D playwright-core@1.62.1`) and Google Chrome.

If no browser tool is present, the live checks are listed as not checked.

## Install

One repo, one `skills/` folder, a native manifest per agent. Full steps, what each agent does not support, and sources: [docs/install.md](docs/install.md).

| Agent | Install | Invoke |
|---|---|---|
| Claude Code | `/plugin marketplace add amedeoscarano/anydash`, then `/plugin install dash@anydash` | `/dash:review` |
| Codex (CLI, app) | `codex plugin marketplace add amedeoscarano/anydash`, then `codex plugin add dash@anydash` | Pick the skill from `/skills`, or type `@` in the app |
| Cursor | Customize > From GitHub Repository > `https://github.com/amedeoscarano/anydash` | `/` in Agent chat, pick `review` |
| Gemini CLI | `gemini extensions install https://github.com/amedeoscarano/anydash` | Ask; Gemini activates the skill after you confirm |
| GitHub Copilot (CLI, VS Code) | `copilot plugin marketplace add amedeoscarano/anydash`, then `copilot plugin install dash@anydash` | `/review` |
| Devin, Factory Droid, Amp | See [docs/install.md](docs/install.md#other-agents) | |
| Any other agent | `npx skills add amedeoscarano/anydash` | Depends on the agent |

Without a plugin, the install script copies the skills as `dash-<name>` into every agent it detects (Claude Code, Codex, Gemini CLI; Cursor and Copilot only when no agent whose folder they already read is found):

```
git clone https://github.com/amedeoscarano/anydash && cd anydash
scripts/install.sh --dry-run
scripts/install.sh
```

Skills installed by the script are named `dash-<name>`: for example `$dash-review` in Codex or `/dash-review` in Cursor.

**Xcode**, **claude.ai**, the Codex IDE extension and every flag: see [docs/install.md](docs/install.md). Listing in each agent's directory: [docs/publishing.md](docs/publishing.md).

In Claude Code, Codex, Cursor and VS Code the ten commands run only when you call them. Gemini CLI does not support that setting, so there the agent may start a command on its own when a request matches.

## Security and privacy

- **Your own app:** full interaction (typing test data, Save, blocked requests) runs only on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test` or a staging host you name. Never on production.
- **Third-party sites:** read-only. Navigation only, no Save, Create, Delete, Connect or any other change, no typing except in global search. Every click name passes a denylist. Dialogs are dismissed. Login, 2FA and CAPTCHA stop the run and hand control to you.
- **Local only:** screenshots, snapshots and logs are written to `dash-review/` in your project. Recordings from `/dash:friction` stay local too, with inputs masked.
- **No data leaves your machine** except what your agent tool itself sends to its model provider.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Methodology and evidence

- How the rules were made: [docs/methodology.md](docs/methodology.md).
- The rulebook: [rules/RULEBOOK.md](rules/RULEBOOK.md). Source of truth: `rules/source/*.yaml`.
- The frameworks: [rules/frameworks/](rules/frameworks/).
- Blind test on a dashboard with 15 seeded violations ([evals/review/RESULTS.md](evals/review/RESULTS.md)): `/dash:review` found 13 of 15, `/dash:review-live` found 15 of 15.

Confidence matters. High means supported by three portals, or stated by a public design system. Medium means two portals. Low means one portal, or an inferred rule (always rated low). The skills label low-confidence rules as suggestions.

## Contributing

New rules, fixes to rules and better checks are welcome. Each rule needs evidence. See [CONTRIBUTING.md](CONTRIBUTING.md).

`/dash:learn` turns a new reference portal into candidate rules for a pull request.

## Independence

The rules are independent observations of public, logged-in admin UIs. No vendor endorses, sponsors or is affiliated with this project. The reference portals are not named. The repository contains no screenshots or content of these portals.

## License

[MIT](LICENSE).

## In italiano

anydash è un insieme di skill per agenti che aiuta a progettare, revisionare e testare dashboard di amministrazione. Le skill applicano un rulebook di 183 regole, ricavate da uno studio in sola lettura di quattro portali di riferimento. Le regole di navigazione e della struttura globale (sidebar, barra in alto, accesso alle impostazioni) usano anche il quarto portale. Ogni regola ha un ID, un livello di confidenza e un controllo verificabile.

Il repository contiene un plugin nativo per Claude Code, Codex, Cursor, Gemini CLI e GitHub Copilot. In Claude Code installi con `/plugin marketplace add amedeoscarano/anydash` e `/plugin install dash@anydash`, poi lanci per esempio `/dash:review`. In Codex usi `codex plugin marketplace add amedeoscarano/anydash` e `codex plugin add dash@anydash`, in Gemini CLI `gemini extensions install https://github.com/amedeoscarano/anydash`, in GitHub Copilot `copilot plugin marketplace add amedeoscarano/anydash` e `copilot plugin install dash@anydash`, in Cursor importi il repository da GitHub. Negli altri strumenti usi `npx skills add amedeoscarano/anydash` oppure `scripts/install.sh`, che installa le skill come `dash-<nome>`. I test dal vivo sui siti di terzi sono solo in lettura e i file restano sul tuo computer. Nessun fornitore approva o sponsorizza il progetto. Licenza MIT.
