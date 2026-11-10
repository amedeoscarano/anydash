# Install

anydash ships one plugin, `dash`, from the marketplace `anydash` (GitHub `amedeoscarano/anydash`). It holds 39 skills in `skills/`. Ten of them are commands you call by name: `build`, `states`, `onboard`, `review`, `review-live`, `polish`, `friction`, `clone`, `reconcile` and `learn`. The others are specialist skills the commands use, and the agent can also pick them on its own.

The same `skills/` folder serves every agent. The repo root carries one manifest per platform, side by side:

| File | Read by |
| --- | --- |
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Claude Code. Also read by Codex (legacy-compatible catalog), GitHub Copilot, Devin and Factory Droid |
| `.agents/plugins/marketplace.json` | OpenAI Codex: the native catalog, pointing at this repo by Git URL |
| `.codex-plugin/plugin.json` | OpenAI Codex (CLI and app) and the OpenAI plugin directory |
| `skills/<command>/agents/openai.yaml` | Codex: the ten commands run only when you call them |
| `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json` | Cursor |
| `gemini-extension.json` | Gemini CLI |

`scripts/validate` checks that all manifests share the name `dash`, the version and the description of `.claude-plugin/plugin.json`, and that every path they reference exists.

Names differ by install method:

- Plugin install: Claude Code and Devin show `/dash:<name>`. The other tools show the skill name, for example `build` (Codex may add the plugin namespace; not verified).
- `scripts/install.sh`: `dash-<name>`, for example `dash-build`.
- skills CLI: the plain folder name, for example `build`.

## Claude Code

In a Claude Code session:

```text
/plugin marketplace add amedeoscarano/anydash
/plugin install dash@anydash
```

`/plugin install` opens the plugin details. Choose a scope (user, project or local). If the summary says `Run /reload-plugins to apply`, run it. Then type `/` and pick a `dash:` entry, for example `/dash:build`.

From a shell: `claude plugin marketplace add amedeoscarano/anydash`, then `claude plugin install dash@anydash`. Third-party marketplaces do not auto-update by default. Update with `claude plugin update dash@anydash`.

Supports every frontmatter key the skills use (`disable-model-invocation`, `user-invocable`, `argument-hint`, `context`).

## OpenAI Codex

Codex CLI, from a terminal:

```bash
codex plugin marketplace add amedeoscarano/anydash
codex plugin add dash@anydash
```

Or run `codex`, type `/plugins` and pick `dash` under the `anydash` marketplace. Start a new session after installing.

- Invoke: pick the skill from `/skills`, or type `@` in the ChatGPT and Codex desktop app. Codex treats the plugin name as the namespace; whether you type `$build` or `$dash:build` is not verified.
- The ten commands carry `agents/openai.yaml` with `policy.allow_implicit_invocation: false`, so Codex runs them only when you call them. The specialist skills can start on their own.
- Manage: `codex plugin list`, `codex plugin remove dash@anydash`, `codex plugin marketplace upgrade anydash`, `codex plugin marketplace remove anydash`.
- Pin a release tag: `codex plugin marketplace add amedeoscarano/anydash --ref v0.2.0` (use the newest tag on GitHub).
- Workspace admins in the ChatGPT app can import the repo under Admin > Plugins > Add > Import marketplace.

Not supported: the Codex IDE extension does not load plugins. There, install the loose skills into `~/.agents/skills` with the skills CLI or `scripts/install.sh --tool codex`. Codex reads only `name` and `description` from the frontmatter.

## Cursor

In Cursor, open Customize, choose "From GitHub Repository" and paste:

```text
https://github.com/amedeoscarano/anydash
```

Install the `dash` plugin and pick project or user scope. Cursor reads `.cursor-plugin/marketplace.json` and `.cursor-plugin/plugin.json` and loads every skill in `skills/`.

- Invoke: type `/` in Agent chat and pick the skill, for example `build`. Option+Enter (Mac) or Alt+Enter (Windows) runs it as a session-wide Custom Mode.
- Cursor honours `disable-model-invocation`, so the ten commands run only when you call them.
- Teams and Enterprise: Dashboard > Plugins & MCPs > Add Marketplace > Import from Repo.
- Local test: copy the repo to `~/.cursor/plugins/local/dash`, then run "Developer: Reload Window".

Not supported: Cursor does not document `user-invocable`, `argument-hint` or `context`. On Enterprise plans an admin may have turned off local plugin imports.

## Gemini CLI

```bash
gemini extensions install https://github.com/amedeoscarano/anydash
```

Restart the CLI. `/extensions list` shows `dash`. Update with `gemini extensions update dash`, remove with `gemini extensions uninstall dash`. Pin a release tag with `--ref v0.2.0` (use the newest tag on GitHub).

- Invoke: ask for the task, or name the skill ("use the review skill on ./my-admin"). The model calls `activate_skill` and you confirm. `/skills list` shows what loaded.
- Not supported: there is no slash command per skill, and Gemini CLI reads only `name` and `description` (other keys are ignored). So the agent may start `build` or `review` on its own when a request matches.
- Google moved individual users from Gemini CLI to Antigravity CLI (`agy`) on 2026-06-18. Gemini CLI still serves paid API-key and Code Assist Standard or Enterprise users. Antigravity users: install the Claude Code plugin first, then run `agy plugin import claude`, or install the loose skills into `~/.gemini/skills` with `scripts/install.sh --tool gemini`.

## GitHub Copilot

Copilot CLI:

```bash
copilot plugin marketplace add amedeoscarano/anydash
copilot plugin install dash@anydash
```

`copilot plugin install amedeoscarano/anydash` also works, but Copilot CLI 1.0.108 marks direct repo installs as deprecated: only `plugin@marketplace` installs will stay supported. In a session, check with `/plugin list` and `/skills list`. Update with `copilot plugin update dash`.

VS Code: open the Agent Customizations editor, choose Plugins > + and enter `https://github.com/amedeoscarano/anydash`, or run "Chat: Install Plugin from Source". It needs the `chat.plugins.enabled` setting.

Copilot reads the existing `.claude-plugin/` manifests. No separate file is needed.

- Invoke: type `/build`, `/review` and so on. Plugin skills have no `dash:` prefix in Copilot, so a short name can collide with another skill.
- VS Code honours all four Claude Code keys. Copilot CLI does not document them.
- Loose skills: `gh skill install amedeoscarano/anydash --all` (needs a GitHub CLI that has the `skill` command), or `scripts/install.sh --tool copilot`.

## Other agents

| Agent | Install | Invoke |
| --- | --- | --- |
| Devin CLI and Devin Desktop (formerly Windsurf) | `devin plugins install amedeoscarano/anydash` (reads `.claude-plugin/`; sign in first) | `/dash:build` |
| Factory Droid | `droid plugin marketplace add amedeoscarano/anydash`, then `droid plugin install dash@anydash --scope user` | `/build` |
| Amp | `amp skill add https://github.com/amedeoscarano/anydash` | The model loads the skill on demand |
| OpenCode | skills CLI or `scripts/install.sh --tool codex` (OpenCode reads `~/.agents/skills` and `~/.claude/skills`) | `@dash-build` |
| Cline | `npx skills add amedeoscarano/anydash -a claude-code` in the project (writes `.claude/skills`, which Cline reads), or copy the skill folders into `.cline/skills/` | `/build` |
| Kiro, Goose | Not packaged yet. See "Not added on purpose" below | |

Not verified for anydash: the Devin, Factory, Amp, OpenCode and Cline commands come from their docs and were not run against this repo.

## Any agent: the skills CLI

The open `skills` CLI copies or links the skills into each agent's skills folder:

```bash
npx skills add amedeoscarano/anydash --list            # list the skills, install nothing
npx skills add amedeoscarano/anydash -g -a codex       # all skills, user level, Codex only
npx skills add amedeoscarano/anydash -g -a cursor -s build -s review
```

| Flag | Meaning |
| --- | --- |
| `-g`, `--global` | Install to the user folder instead of the current project |
| `-a`, `--agent <agents...>` | Target agents, for example `claude-code`, `codex`, `cursor`, `gemini-cli` |
| `-s`, `--skill <skills...>` | Install only these skills (`'*'` for all) |
| `-l`, `--list` | List the skills in the source, install nothing |
| `--copy` | Copy instead of symlinking |
| `-y`, `--yes` | Skip prompts |

The skills CLI keeps each folder name as it is in the repo (`build`, not `dash-build`) and does not rewrite or strip frontmatter.

## Any agent: scripts/install.sh

Clone the repo, then run the script. It installs each skill as `dash-<name>` into the user-level skills folder of every tool it detects.

```bash
git clone https://github.com/amedeoscarano/anydash && cd anydash
scripts/install.sh --dry-run          # print what it would do
scripts/install.sh                    # copy into every detected tool
scripts/install.sh --tool codex       # one tool only (repeatable)
scripts/install.sh --link             # symlink resources, so a git pull updates them
scripts/install.sh --uninstall        # remove what it installed
```

What it does:

- Detects a tool when its command is on `PATH` or its config folder exists: `claude` (`~/.claude`), `codex` (`~/.codex`), `cursor` (`~/.cursor`), `gemini` (`~/.gemini`), `copilot` (`~/.copilot`).
- Writes to `~/.claude/skills` (Claude Code), `~/.agents/skills` (Codex, also read by Gemini CLI, OpenCode, Amp, Devin, Factory, Goose and Copilot), `~/.cursor/skills` (Cursor), `~/.gemini/skills` (Gemini CLI and Antigravity) and `~/.copilot/skills` (Copilot).
- Renames each skill to `dash-<name>`. It rewrites the `name:` field to match the folder, and rewrites sibling links `../<name>/SKILL.md` to `../dash-<name>/SKILL.md`.
- Removes Claude Code-only frontmatter keys where the target does not document them: `disable-model-invocation`, `user-invocable`, `argument-hint`, `context`. Codex and Gemini CLI get none of the four. Cursor keeps `disable-model-invocation`. Claude Code and Copilot keep all four.
- Copies `agents/openai.yaml`, so Codex still runs the ten commands only when you call them.
- In `--link` mode it symlinks `references/`, `scripts/` and `agents/` to the repo, but still writes `SKILL.md` as a file, because the `name:` field must be rewritten. Run the script again after a pull that changes a `SKILL.md`.
- Puts a `.anydash` marker in every folder it writes. It never overwrites or removes a `dash-*` folder without that marker, and it touches nothing else.
- Skips Cursor during auto-detection when Claude Code or Codex is also installed, because Cursor already reads `~/.claude/skills` and `~/.agents/skills`. Skips Copilot and Gemini CLI when Codex is installed, because both read `~/.agents/skills`. Pass `--tool cursor`, `--tool copilot` or `--tool gemini` to install there anyway. `--uninstall` always covers every detected tool.

## Where each tool reads loose skills

| Tool | User folder | Project folder | Invoke |
| --- | --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` | `/dash-build` |
| Codex (CLI, IDE extension, app) | `~/.agents/skills/`, admin `/etc/codex/skills/` | `.agents/skills/` (each folder from the working directory up to the repo root) | `$dash-build`, or pick it from `/skills` |
| Cursor | `~/.cursor/skills/`, `~/.agents/skills/` | `.cursor/skills/`, `.agents/skills/` | Type `/` in Agent chat and pick `dash-build` |
| Gemini CLI | `~/.gemini/skills/`, `~/.agents/skills/` | `.gemini/skills/`, `.agents/skills/` | The model calls `activate_skill` when a task matches; you confirm |
| GitHub Copilot | `~/.copilot/skills/`, `~/.agents/skills/` (VS Code also `~/.claude/skills/`) | `.github/skills/`, `.claude/skills/`, `.agents/skills/` | `/dash-build` |

Cursor also reads `.claude/skills/`, `.codex/skills/`, `~/.claude/skills/` and `~/.codex/skills/` for compatibility. In Gemini CLI, `.agents/skills/` takes precedence over `.gemini/skills/` in the same tier. Every tool also picks a skill on its own when its description matches the request, unless the skill turns that off in a way the tool reads (`disable-model-invocation` in Claude Code, Cursor, VS Code Copilot, OpenCode and Factory; `agents/openai.yaml` in Codex).

## Not added on purpose

- **Root `plugin.json` (Agent Plugins 1.0, read by Kiro, Goose and Copilot).** That spec says a client must skip any skill whose frontmatter has keys outside the Agent Skills spec. Eleven anydash skills use Claude Code keys, so Kiro and Goose could drop them, and Copilot would switch from the `.claude-plugin/` manifest to the stricter one. Revisit when the Claude Code keys can move into `metadata`.
- **Gemini CLI command wrappers (`commands/dash/*.toml`).** A wrapper that only tells the model to activate a skill is not a documented pattern.
- **`GEMINI.md`.** Nothing needs to load into every Gemini session.
- **`.antigravity-plugin/` and `.devin-plugin/`.** Both tools import or read the Claude Code plugin.

## Xcode 26.3 and later

Xcode 26.3 added built-in agents (Claude Agent and Codex) inside Xcode. Apple documents that their configuration files live in agent-specific subfolders of `~/Library/Developer/Xcode/CodingAssistant/`, used only by Xcode:

- `~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig`
- `~/Library/Developer/Xcode/CodingAssistant/codex`

Apple says that these files can set a default model, add MCP servers and add your own skills, and that they affect the agents only when launched in Xcode. Apple does not document the exact skills subfolder or file layout inside these folders. Xcode also has an Intelligence > Plug-ins setting with Add Plug-in (for example Add from URL), but Apple does not document which plugin format it accepts. `scripts/install.sh` does not write to these folders.

What Apple documents, and what we recommend: run Claude Code or Codex in a terminal next to Xcode and connect it to Xcode's MCP server.

1. In Xcode, choose Xcode > Settings > Intelligence. Under Model Context Protocol, turn on "Allow external agents to use Xcode tools".
2. Connect the agent:

   ```bash
   claude mcp add --transport stdio xcode -- xcrun mcpbridge   # Claude Code
   codex mcp add xcode -- xcrun mcpbridge                      # Codex
   ```

3. Check with `claude mcp list` or `codex mcp list`.
4. Open the project in Xcode, then prompt the agent in the terminal. Install anydash in that agent as above, and use `/dash:build --stack swiftui` (Claude Code) or `$build --stack swiftui` (Codex plugin).

## claude.ai and the Skills API

Custom skills on claude.ai (uploaded as a zip in Settings) and on the Claude API (`/v1/skills`) are separate from Claude Code and do not sync. The documented frontmatter there is `name` and `description` (plus `dependencies` on claude.ai). A reported upload error lists the accepted keys as `name`, `description`, `license`, `allowed-tools`, `compatibility` and `metadata`, and rejects any other key. So the Claude Code-only keys in this repo (`disable-model-invocation`, `user-invocable`, `argument-hint`, `context`) make an upload fail. Remove them before uploading: `scripts/install.sh --tool codex` writes a copy without them to `~/.agents/skills/dash-<name>/`, which you can zip. Delete the `.anydash` marker and the `agents/` folder from the zip.

## Sources

Accessed 2026-11-09 unless noted.

- Claude Code, install plugins and add marketplaces: https://code.claude.com/docs/en/discover-plugins (2026-10-28)
- Claude Code, skills: https://code.claude.com/docs/en/skills (2026-10-28)
- Codex, package a plugin: https://developers.openai.com/plugins/build/plugins
- Codex, build plugins and marketplaces: https://developers.openai.com/codex/plugins/build.md
- Codex, plugin CLI commands: https://learn.chatgpt.com/docs/developer-commands?surface=cli
- Codex, plugins: https://learn.chatgpt.com/docs/plugins
- Codex, skills and `agents/openai.yaml`: https://learn.chatgpt.com/docs/build-skills
- Cursor, plugins: https://cursor.com/docs/plugins
- Cursor, plugin reference: https://cursor.com/docs/reference/plugins
- Cursor, skills: https://cursor.com/docs/skills
- Gemini CLI, extension reference: https://geminicli.com/docs/extensions/reference/
- Gemini CLI, skills: https://geminicli.com/docs/cli/skills/
- Gemini CLI to Antigravity CLI transition: https://developers.googleblog.com/en/an-important-update-transitioning-gemini-cli-to-antigravity-cli/
- GitHub Copilot CLI, plugin reference: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- GitHub Copilot, plugin and marketplace reference: https://docs.github.com/en/copilot/reference/plugin-and-marketplace-reference
- VS Code, agent plugins: https://code.visualstudio.com/docs/copilot/customization/agent-plugins
- VS Code, agent skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- GitHub CLI, `gh skill install`: https://cli.github.com/manual/gh_skill_install
- Devin, plugins: https://docs.devin.ai/cli/extensibility/plugins/overview
- Factory, plugins: https://docs.factory.com/harness/plugins
- Amp, skills: https://ampcode.com/docs/markdown/customize/skills
- OpenCode, skills: https://opencode.ai/docs/skills/
- Cline, skills: https://docs.cline.bot/customization/skills
- Agent Plugins specification: https://github.com/agentplugins/agent-plugins-spec
- skills CLI, commands: https://github.com/vercel-labs/skills/blob/main/docs/commands.md (2026-10-28)
- Agent Skills overview (claude.ai, API): https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview (2026-10-28)
- Reported claude.ai upload error on `disable-model-invocation` (issue report, not official docs): https://claudeissues.com/issue/24826-claude-desktop-skill-upload-rejects-disable-model-invocation-frontmatter-key (2026-10-28)
- Apple, giving external agents access to Xcode: https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode (2026-10-28)

## Not verified

- The Codex, Cursor, Gemini CLI and Copilot installs were checked against their docs, not run against this repo. `claude plugin validate .` passes.
- Whether `codex plugin marketplace add` reads `.agents/plugins/marketplace.json` from this repo as documented. Its `url` source points at the repo itself, as the Codex docs recommend for a plugin at the repo root; `.claude-plugin/marketplace.json` is the documented legacy fallback.
- Whether Codex or Cursor reject unknown frontmatter keys. Gemini CLI ignores them (source code).
- How Codex names plugin skills when you type them (`$build` or `$dash:build`).
- The current claude.ai upload allowlist. The key list above comes from an issue report from February 2026.
- Whether Codex still reads `~/.codex/skills`. Its current docs name only `~/.agents/skills`.

anydash rules are independent observations of public, logged-in admin UIs. No vendor endorses, sponsors or is affiliated with this project.
