# Security policy

## Report a vulnerability

Report it privately through GitHub security advisories: open the repository on GitHub, go to **Security**, then **Report a vulnerability**. Do not open a public issue.

Please include what you found, how to reproduce it and which version you used. You will get an answer as soon as possible.

## Supported versions

Only the latest release gets fixes.

## How the skills protect you and others

**Third-party sites are read-only.** When a skill opens a site that is not your own app, it may only navigate: links, tabs, menu items, buttons that open a view, and Cancel, Escape or Close. It never clicks Save, Create, Delete, Connect, Install, Buy or any other state change. Every click name passes a denylist in English and Italian (`skills/browser-adapter/scripts/safe-click.mjs`). It never types, except in global search. It dismisses every dialog and waits at least 5 seconds between navigations. It never reveals or copies secrets. On a login, 2FA or CAPTCHA screen it stops and asks you to act.

**Full interaction only on your own app.** Typing test data, Save and blocked requests run only on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`, `*.test` or a staging host you name. The local script refuses any other host. Never point own-app mode at production.

**Recordings stay local.** Screenshots, accessibility snapshots and logs are written to `dash-review/` in your project. Session recordings planned for v0.2 will also stay local, with inputs masked. Nothing is uploaded by these skills.

**No data leaves your machine** except what your agent tool itself sends to its model provider. Check that tool's own privacy terms.

**The repository holds no portal data.** It contains abstract rules and original wireframes only: no screenshots, account ids or customer data from the studied portals.
