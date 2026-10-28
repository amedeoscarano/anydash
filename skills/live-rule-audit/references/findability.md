# Findability test

Measures whether a person who has never seen the code can find each setting by reading the interface. One fresh subagent per setting, with no code access, navigates by visible labels only and logs clicks, time and outcome.

Own-app mode only for full runs (it may type into global search). In third-party-readonly mode the subagent may only click links, tabs and view-opening buttons through `../browser-adapter/scripts/readonly.mjs`, never type, and keeps one navigation per 5 to 10 seconds.

## 1. Inventory of settings

The orchestrator (not the subagent) builds the list. Take the first source that exists:
1. `dash-spec/inventory.md` and the settings tree in `dash-spec/ia.md`.
2. The static review: settings routes and their form fields in the code.
3. The discovery snapshots of every settings page and every object page with a settings section.

One row per setting: `setting id | label in the UI | expected location (URL + section) | placement rule`. The placement rule is the rule that decided the home, for example SET-002 for a per-object setting, SET-003 for a sub-area setting, SET-008 for a personal preference, SET-009 for account administration. Use "no rule" when none applies. Cap the run at 30 settings; choose daily and risky ones first, and list the rest under Not checked.

## 2. Task wording

Write each task as a user goal, never with the exact label or the menu path. Bad: "Find 'Shipment failure emails' under Settings > Notifications". Good: "You want an email when a parcel could not be delivered. Find where to change that."

## 3. Subagent prompt

Spawn a new subagent per task (Task tool, or the host's equivalent). Do not reuse one agent across tasks: it would remember the menu. Give it only this:

```
You are testing an admin dashboard as a new user. You cannot read any code or files of the app.
Goal: <task wording>
Start URL: <base url>
Tool: run `node <path>/ownapp.mjs run <base url> <steps.json> <outdir>` (own-app), or the readonly.mjs commands snapshot, click and key (third-party), or the browser tool named here.
Each run starts fresh. Replay your path so far, then add one action and a {"snapshot": "s"}.
Allowed steps: {"goto": "<start path>"} once at the start, {"click": {"role", "name"}} on links,
tabs, menu items and buttons that open a view, {"press": "Escape"}, {"fill"} only in the global
search field, {"snapshot"}. Never type URLs other than the start path. Never click Save, Create,
Delete or any button that changes data. Close any dialog with Escape.
Use only names you saw in the latest snapshot.
If you reach a login, 2FA or CAPTCHA page, stop: answer "gave_up" with note "login".
Never copy keys, tokens or personal data into your answer.
Stop when you see the control that changes the goal, or after 10 clicks, or after 5 minutes.
Answer in one JSON line:
{"outcome": "found|wrong|gave_up", "path": ["Settings", "Notifications"], "clicks": 2,
 "searched": false, "seconds": 41, "final_label": "<label you stopped at>", "note": "<where you hesitated>"}
```

Record wall-clock time yourself from spawn to answer; trust it over the agent's own `seconds`.

## 4. Scoring

Compare `final_label` and the last URL in the agent's log with the expected location.

| Result | Severity | Exit |
|---|---|---|
| found in 3 clicks or fewer, no search | pass, no row | - |
| found in 4 to 6 clicks, or only through search | `minor` | `file as task` |
| found in more than 6 clicks | `major` when the placement rule is high or medium, else `minor` | `file as task` |
| wrong control, or gave up | `major` when the placement rule is high or medium, else `minor` | `fix now` if the setting is daily or risky, else `file as task` |

A setting that two or more agents miss in the same way (same wrong area) points to a label or grouping problem: cite NAV-002 or SET-007 as well as the placement rule. A setting found only through search when the product has no settings search is SET-012 evidence.

## 5. Output

`dash-review/findability.md`:

`setting | task wording | expected location | path taken | clicks | seconds | outcome | rule`

Then one findings row per non-pass result in `dash-review/findings.md`. Where = `<base url> @ 1440x900, findability: <setting id>`. Evidence = `[live] path taken, clicks, seconds, outcome`. Static review cannot see findability: it needs a reader who does not know the code.
