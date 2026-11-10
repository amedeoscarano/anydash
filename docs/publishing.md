# Publishing

For the repo owner. Every step below needs the owner's own account, and nothing here has been submitted. Users can already install from GitHub on every platform (see [install.md](install.md)). A listing only makes anydash easier to find.

## Before any submission

1. Run the checks:

   ```bash
   node scripts/build-references && node scripts/validate && npm test && claude plugin validate --strict .
   ```

2. Push a release tag that matches the manifest version. Several directories ask for an immutable ref, and Gemini CLI detects updates by tag:

   ```bash
   git tag v0.2.1 && git push origin v0.2.1
   gh release create v0.2.1 --title "anydash 0.2.1" --notes-file <(sed -n '/^## 0.2.1/,/^## 0.2.0/p' CHANGELOG.md | sed '$d')
   ```

3. Update the GitHub description and topics. The `gemini-cli-extension` topic is what lists the repo in the Gemini CLI gallery:

   ```bash
   gh repo edit amedeoscarano/anydash \
     --description "Agent skills to design, review and test admin dashboards. Plugin for Claude Code, Codex, Cursor, Gemini CLI and GitHub Copilot; skills for any agent." \
     --homepage "https://github.com/amedeoscarano/anydash#install" \
     --add-topic gemini-cli-extension --add-topic github-copilot --add-topic agent-plugins
   ```

   The repo already has the topics `claude-code`, `codex`, `cursor` and `agent-skills`. Keep `metadata.description` in the three marketplace files in line with the new description if you change it.

## Claude Code

Users can already add the marketplace from GitHub (`/plugin marketplace add amedeoscarano/anydash`). To be listed as well:

- **Anthropic's directory** (claude.ai, Cowork and Claude Code through account sync). Needs a paid claude.ai plan. Run `claude plugin validate --strict .`, work through the pre-submission checklist (https://claude.com/docs/plugins/pre-submission-checklist), then submit from the developer portal at https://claude.ai/directory/manage, following https://claude.com/docs/plugins/submit. Some components load only in Claude Code; check https://claude.com/docs/plugins/platform-support. The claude.ai skill upload is reported to reject the Claude Code-only frontmatter keys (see [install.md](install.md#claudeai-and-the-skills-api)); expect the portal to flag them.
- **Community marketplace** `claude-community` (`anthropics/claude-plugins-community`) lists third-party plugins their authors submitted to Anthropic. The official marketplace `claude-plugins-official` takes no portal submissions.

Source: https://code.claude.com/docs/en/plugins/publish.md and https://code.claude.com/docs/en/plugins/anthropic-marketplaces.md.

## OpenAI plugin directory (ChatGPT and Codex)

One public directory serves ChatGPT and Codex. Listed plugins appear in the directory and under `/plugins`.

Account:

1. Sign in at https://platform.openai.com/plugins with the owner's OpenAI account. Organization owners can submit. Other members need the "Apps Management Write" role.
2. To publish under your name or the company name, complete individual or business verification in the organization settings.

Package:

3. Build the ZIP from the release tag:

   ```bash
   git archive --format=zip --prefix=anydash/ -o anydash-0.2.1.zip v0.2.1
   ```

4. In the portal choose Create plugin, then **Skills only**, and upload the ZIP. The portal reads `.codex-plugin/plugin.json` (listing fields, logo, prompts) and `skills/`.

Automated checks to expect:

- `name` and `description` in every `SKILL.md`. OpenAI states no description limit; `scripts/validate` caps them at 1,024 characters. Two are over 1,000 (`save-model` 1,003, `api-surface-capture` 1,006).
- Listing limits OpenAI states: `shortDescription` at most 30 characters, `longDescription` at most 4,000, at most 3 default prompts of 128 characters, a square logo of at least 48 px (PNG, JPEG, WebP or SVG). `scripts/validate` checks the text limits.
- Listing fields: `displayName`, `shortDescription`, `longDescription`, `developerName`, `category`, `logo`, `composerIcon`, `capabilities`. All are in `.codex-plugin/plugin.json`; the logo is `assets/logo.svg`.
- No hooks, no `.app.json`, no secrets. anydash has none.

Review:

5. OpenAI asks for provider-neutral wording. Twelve `SKILL.md` files mention Claude (for example `browser-adapter`, `build`, `review`, `polish`). Decide before submitting whether to reword them; the reviewer may ask.
6. Submit for review and accept the policy attestations. Only one review per plugin can be active. Feedback comes by email; reply to appeal a rejection. No review time is published.
7. After approval, open the version and click Publish plugin. For an update, upload a new ZIP.

A skills-only plugin needs no MCP test cases, demo video, domain verification or policy URLs.

## Cursor Marketplace

The listing is curated and manually reviewed. Cursor says it works directly with plugin authors it trusts, so a listing is not guaranteed.

1. Sign in to Cursor with the owner's account and open https://cursor.com/marketplace/publish.
2. Submit the public repo link `https://github.com/amedeoscarano/anydash`. The official template README (https://github.com/cursor/plugin-template) also names a contact channel for submissions.
3. Requirements, all met: open source (MIT), `.cursor-plugin/plugin.json` with a lowercase name, `.cursor-plugin/marketplace.json` with the same plugin name, relative paths only, a committed logo, a README with usage, no binaries.
4. Optional check before submitting: download `scripts/validate-template.mjs` from the template repo into a folder outside this repo, read it, then run `node /path/to/validate-template.mjs` from the repo root.
5. Every update is reviewed again; listed plugins do not follow the repo automatically. You must answer reported security or stability issues, or the plugin can be delisted.

## Gemini CLI extension gallery

No form. The gallery at https://geminicli.com/extensions crawls public GitHub repos daily.

1. Add the topic `gemini-cli-extension` (command in "Before any submission").
2. `gemini-extension.json` is at the repo root. Optional local check: `gemini extensions link .` from a clone, then `/extensions list`. The docs say the extension name should match its folder name, so clone into a folder named `dash` for this check.
3. The listing appears if the extension passes the gallery's validation; the criteria are not published.

Gemini CLI now mainly serves paid API-key and Code Assist users. For Antigravity CLI's official marketplace, Google takes partners through an intake form, and it requires `agy plugin validate --strict` with zero warnings and an Antigravity `plugin.json`. anydash does not ship that manifest yet.

## GitHub Copilot: awesome-copilot

`github/awesome-copilot` is the default marketplace in Copilot CLI, VS Code and the Copilot app. Third-party plugins are listed as external plugins through an issue form, not a pull request.

1. Push the tag `v0.2.1` (see above) and note its full 40-character commit SHA: `git rev-parse v0.2.1^{commit}`.
2. With the owner's GitHub account, open https://github.com/github/awesome-copilot/issues/new/choose and pick the external plugin form.
3. Fill in: plugin name `dash`; a short description; repo `amedeoscarano/anydash`; plugin path empty (root); ref `v0.2.1` and the SHA; version `0.2.1`; license `MIT`; author `amedeoscarano`; keywords `admin, dashboard, ui, ux, design-review, skills`.
4. Automated gates run (manifest, lint, install smoke test, version and SHA consistency). A maintainer then approves or rejects. Listings are reviewed again after six months.
   Warning: the lint step (`vally lint`) checks the Agent Skills spec. Eleven skills use Claude Code-only frontmatter keys and may fail it. Run it locally first if you can, and decide whether to move those keys before submitting.

Do not edit `plugins/external.json` in that repo yourself; the contributing guide asks for the issue form.

## No public directory

- **Devin (formerly Windsurf), Amp, OpenCode, Cline, Goose:** no public plugin or skills directory to submit to. Users install from GitHub.
- **Factory Droid:** the official marketplace does not accept outside submissions. Users add this repo as a marketplace.
- **Kiro:** the Powers registry lists launch partners only, with no public form.
- **skills.sh:** `npx skills add amedeoscarano/anydash` already works for any public repo.
