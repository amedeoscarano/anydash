# anydash

Agent skills to design, review and test admin dashboards, using UI rules reverse-engineered from best-in-class admin panels.

## What it does and for whom

anydash is a set of agent skills for people who build admin dashboards, back offices and settings areas. It is for developers, designers and product people who work with a coding agent such as Claude Code, Codex, Cursor or Gemini CLI.

The skills apply one rulebook: 179 UI rules in 18 areas, plus 8 decision frameworks. Each rule has an ID, a confidence level, do and don't examples, and a check for code and a check for a running app. The rules come from a read-only study of three admin portals: Shopify Admin, DHL Express Commerce and Cloudflare Dashboard. See [Methodology and evidence](#methodology-and-evidence).

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

Output goes to `dash-spec/` (design) or `dash-review/` (review) in your project.

Planned for v0.2 (see [ROADMAP.md](ROADMAP.md)): `/dash:friction`, `/dash:clone`, `/dash:reconcile` and `/dash:learn`.

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

## Requirements

| Command | Needs |
|---|---|
| `/dash:build`, `/dash:states`, `/dash:onboard`, `/dash:review` | An agent that loads skills. Nothing else. |
| `/dash:review-live`, `/dash:polish` | A browser tool (see below). |
| v0.2 commands | REA and ffmpeg, only for `/dash:friction`, `/dash:clone`, `/dash:reconcile` and `/dash:learn`. Not needed for v0.1. |

The live commands use the first browser tool they find, in this order:

1. gstack browse
2. Playwright MCP
3. Claude in Chrome
4. Chrome DevTools MCP
5. Cursor's built-in browser
6. Local scripts: Node 20 or later, `playwright-core` 1.62.1 (`npm i -D playwright-core@1.62.1`) and Google Chrome.

If no browser tool is present, the live checks are listed as not checked.

## Install

Short version. Full steps, paths and sources per tool are in [docs/install.md](docs/install.md).

**Claude Code**

```
/plugin marketplace add amedeoscarano/anydash
/plugin install dash@anydash
```

**Codex, Cursor, Gemini CLI and other agents** (skills CLI)

```
npx skills add amedeoscarano/anydash
```

The skills CLI keeps the folder names (`review`, not `dash-review`). For the `dash-` prefix, use the install script:

```
git clone https://github.com/amedeoscarano/anydash && cd anydash
scripts/install.sh --dry-run
scripts/install.sh
```

It detects Claude Code, Codex, Cursor and Gemini CLI. **Xcode**, **claude.ai** and every flag: see [docs/install.md](docs/install.md).

## How to launch the commands

- **Claude Code:** type the command, for example `/dash:review ./my-admin`.
- **Codex:** `$dash-review ./my-admin`, or pick the skill from `/skills`.
- **Cursor:** type `/` in Agent chat and pick `dash-review`.
- **Gemini CLI:** ask, for example "use dash-review on ./my-admin". Gemini activates the skill after you confirm.
- **Any tool:** if you installed with the skills CLI, use the plain name (`review` instead of `dash-review`).

Details per tool: [docs/install.md](docs/install.md).

In Claude Code and Cursor the six commands run only when you call them. Codex and Gemini CLI do not support that setting, so there the agent may start a command on its own when a request matches.

## Security and privacy

- **Your own app:** full interaction (typing test data, Save, blocked requests) runs only on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test` or a staging host you name. Never on production.
- **Third-party sites:** read-only. Navigation only, no Save, Create, Delete, Connect or any other change, no typing except in global search. Every click name passes a denylist. Dialogs are dismissed. Login, 2FA and CAPTCHA stop the run and hand control to you.
- **Local only:** screenshots, snapshots and logs are written to `dash-review/` in your project. Recordings planned for v0.2 stay local too, with inputs masked.
- **No data leaves your machine** except what your agent tool itself sends to its model provider.

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Methodology and evidence

- How the rules were made: [docs/methodology.md](docs/methodology.md).
- The rulebook: [rules/RULEBOOK.md](rules/RULEBOOK.md). Source of truth: `rules/source/*.yaml`.
- The frameworks: [rules/frameworks/](rules/frameworks/).
- Blind test on a dashboard with 15 seeded violations ([evals/review/RESULTS.md](evals/review/RESULTS.md)): `/dash:review` found 13 of 15, `/dash:review-live` found 15 of 15.

Confidence matters. High means seen or documented in all three portals, or stated by a public design system. Low means one portal or inferred. The skills label low-confidence rules as suggestions.

## Contributing

New rules, fixes to rules and better checks are welcome. Each rule needs evidence. See [CONTRIBUTING.md](CONTRIBUTING.md).

`/dash:learn`, a command that turns a new reference portal into candidate rules, is planned for v0.2.

## Trademarks

Shopify, DHL, DHL Express Commerce and Cloudflare are trademarks of their respective owners. This project is not affiliated with, endorsed by or sponsored by them. The names are used only to say which portals were studied. The repository contains no screenshots or content of these portals.

## License

[MIT](LICENSE).

## In italiano

anydash è un insieme di skill per agenti che aiuta a progettare, revisionare e testare dashboard di amministrazione. Le skill applicano un rulebook di 179 regole, ricavate da uno studio in sola lettura di Shopify Admin, DHL Express Commerce e Cloudflare Dashboard. Ogni regola ha un ID, un livello di confidenza e un controllo verificabile.

In Claude Code installi con `/plugin marketplace add amedeoscarano/anydash` e `/plugin install dash@anydash`, poi lanci per esempio `/dash:review`. Negli altri strumenti usi `npx skills add amedeoscarano/anydash` oppure `scripts/install.sh`, che installa le skill come `dash-<nome>`. I test dal vivo sui siti di terzi sono solo in lettura e i file restano sul tuo computer. Progetto non affiliato ai proprietari dei marchi citati. Licenza MIT.
