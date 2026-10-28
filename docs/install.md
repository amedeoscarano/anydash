# Install

anydash ships one plugin, `dash`, from the marketplace `anydash` (GitHub `amedeoscarano/anydash`). v0.1 contains the commands `build`, `states`, `onboard`, `review`, `review-live` and `polish`, plus the specialist skills in `skills/`. `friction`, `clone`, `reconcile` and `learn` arrive in v0.2 (see `ROADMAP.md`).

Commands are named `/dash:<name>` in the Claude Code plugin, and `dash-<name>` when installed with `scripts/install.sh`. The skills CLI keeps the plain folder name (`build`).

## Claude Code (recommended)

In a Claude Code session:

```text
/plugin marketplace add amedeoscarano/anydash
/plugin install dash@anydash
```

`/plugin install` opens the plugin details. Choose a scope (user, project or local). If the summary says `Run /reload-plugins to apply`, run it. Then type `/` and look for the `dash:` entries, for example:

```text
/dash:build
```

From a shell, without a session: `claude plugin marketplace add amedeoscarano/anydash`, then `claude plugin install dash@anydash`. Third-party marketplaces do not auto-update by default. Update with `claude plugin update dash@anydash`.

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

The skills CLI keeps each folder name as it is in the repo (`build`, not `dash-build`) and does not rewrite or strip frontmatter. If you want the `dash-` prefix and the frontmatter cleanup described below, use `scripts/install.sh`.

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

- Detects a tool when its command is on `PATH` or its config folder exists: `claude` (`~/.claude`), `codex` (`~/.codex`), `cursor` (`~/.cursor`), `gemini` (`~/.gemini`).
- Writes to `~/.claude/skills` (Claude Code), `~/.agents/skills` (Codex), `~/.cursor/skills` (Cursor) and `~/.gemini/skills` (Gemini CLI).
- Renames each skill to `dash-<name>`. It rewrites the `name:` field to match the folder, and rewrites sibling links `../<name>/SKILL.md` to `../dash-<name>/SKILL.md`.
- Removes Claude Code-only frontmatter keys where the target does not document them: `disable-model-invocation`, `user-invocable`, `argument-hint`, `context`. Codex and Gemini CLI get none of the four. Cursor keeps `disable-model-invocation`, which Cursor documents. Claude Code keeps all four.
- In `--link` mode it symlinks `references/` and `scripts/` to the repo, but still writes `SKILL.md` as a file, because the `name:` field must be rewritten. Run the script again after a pull that changes a `SKILL.md`.
- Puts a `.anydash` marker in every folder it writes. It never overwrites or removes a `dash-*` folder without that marker, and it touches nothing else.
- Skips Cursor during auto-detection when Claude Code or Codex is also installed, because Cursor already reads `~/.claude/skills` and `~/.agents/skills` and would list each skill twice. Pass `--tool cursor` to install there anyway.

Note: Codex and Gemini CLI do not document `disable-model-invocation`, so in those tools the agent may start `dash-build` or `dash-review` on its own when a request matches. Name the skill explicitly if you want control.

## Where each tool reads skills and how to invoke them

| Tool | User folder | Project folder | Invoke |
| --- | --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` | `/dash:build` (plugin) or `/dash-build` (loose skill) |
| Codex (CLI, IDE extension) | `~/.agents/skills/` | `.agents/skills/` (each folder from the working directory up to the repo root) | `$dash-build`, or pick it from `/skills` |
| Cursor | `~/.cursor/skills/`, `~/.agents/skills/` | `.cursor/skills/`, `.agents/skills/` | Type `/` in Agent chat and pick `dash-build` |
| Gemini CLI | `~/.gemini/skills/`, `~/.agents/skills/` | `.gemini/skills/`, `.agents/skills/` | The model calls `activate_skill` when a task matches; you confirm. `/skills list` shows what loaded |

Cursor also reads `.claude/skills/`, `.codex/skills/`, `~/.claude/skills/` and `~/.codex/skills/` for compatibility. In Gemini CLI, `.agents/skills/` takes precedence over `.gemini/skills/` in the same tier. All tools also pick a skill on their own when its description matches the request, unless the skill turns that off.

### Cursor plugins

Cursor has a plugin marketplace (Cursor Marketplace, manually reviewed) and team marketplaces imported from a GitHub repo on Teams and Enterprise plans. A Cursor plugin needs `.cursor-plugin/plugin.json` (or `.cursor-plugin/marketplace.json` for several plugins). anydash v0.1 ships only the Claude Code manifest in `.claude-plugin/`, so it is not a Cursor plugin. Install the skills with one of the methods above.

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
4. Open the project in Xcode, then prompt the agent in the terminal. Install anydash in that agent as above, and use `/dash:build --stack swiftui` (Claude Code) or `$dash-build --stack swiftui` (Codex).

## claude.ai and the Skills API

Custom skills on claude.ai (uploaded as a zip in Settings) and on the Claude API (`/v1/skills`) are separate from Claude Code and do not sync. The documented frontmatter there is `name` and `description` (plus `dependencies` on claude.ai). A reported upload error lists the accepted keys as `name`, `description`, `license`, `allowed-tools`, `compatibility` and `metadata`, and rejects any other key. So the Claude Code-only keys in this repo (`disable-model-invocation`, `user-invocable`, `argument-hint`, `context`) make an upload fail. Remove them before uploading: `scripts/install.sh --tool codex` writes a copy without them to `~/.agents/skills/dash-<name>/`, which you can zip. Delete the `.anydash` marker from the zip.

## Sources

All accessed 2026-10-28.

- Claude Code, install plugins and add marketplaces: https://code.claude.com/docs/en/discover-plugins
- Claude Code, skills (folders, frontmatter, plugin namespacing): https://code.claude.com/docs/en/skills
- Agent Skills overview (claude.ai, API, Claude Code; name and description limits): https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Skills API guide (frontmatter requirements on upload): https://platform.claude.com/docs/en/build-with-claude/skills-guide
- claude.ai, creating custom skills: https://support.claude.com/en/articles/12512198-creating-custom-skills
- Reported claude.ai / Claude Desktop upload error on `disable-model-invocation` (issue report, not official docs): https://claudeissues.com/issue/24826-claude-desktop-skill-upload-rejects-disable-model-invocation-frontmatter-key
- skills CLI, commands: https://github.com/vercel-labs/skills/blob/main/docs/commands.md
- skills CLI, agents and folders: https://github.com/vercel-labs/skills/blob/main/docs/agents.md
- Codex, skills (redirected from https://developers.openai.com/codex/skills): https://learn.chatgpt.com/docs/build-skills
- Cursor, skills: https://cursor.com/docs/context/skills
- Cursor, plugins and marketplace: https://cursor.com/docs/plugins
- Gemini CLI, skills: https://geminicli.com/docs/cli/skills/
- Gemini CLI, creating skills: https://geminicli.com/docs/cli/creating-skills.md
- Apple, giving external agents access to Xcode: https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode
- Apple, extending and customizing agents: https://developer.apple.com/documentation/xcode/extending-and-customizing-agents

## Not verified

- Whether Codex, Cursor or Gemini CLI reject unknown frontmatter keys. Their docs list the keys they read but say nothing about others. The script removes the Claude Code-only keys to be safe.
- The current claude.ai upload allowlist. The key list above comes from an issue report from February 2026, not from Anthropic's docs.
- The skills subfolder layout inside Xcode's `CodingAssistant` folders, and the plugin format Xcode's Add Plug-in accepts. Third-party posts name a `skills` subfolder under `ClaudeAgentConfig`. We have not tested it.
- Whether Codex still reads `~/.codex/skills`. Its current docs name only `~/.agents/skills`.

Shopify, DHL Express Commerce and Cloudflare are trademarks of their owners. anydash studied their admin portals read-only and is not affiliated with or endorsed by them.
