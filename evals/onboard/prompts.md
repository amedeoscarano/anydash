# /dash:onboard eval prompts

Two prompts for `/dash:onboard` (`dash-onboard` outside Claude Code). Prompt 1 designs onboarding from a brief. Prompt 2 checks onboarding in an existing app.

How to run:

- Run each prompt blind, in a fresh session with the anydash plugin installed. The agent under test must not read this file.
- Prompt 1 uses `evals/onboard/fixtures/shipping-admin-brief.md`. Copy it into an empty working folder as `brief.md`.
- Prompt 2 uses a copy of `examples/flawed-dashboard`. The runner makes the copy in a temporary folder, without `EXPECTED_FINDINGS.md` and `README.md`. The copy is not stored in this repo.
- A separate agent scores each answer against the rubric. Each item is pass or fail. Must items decide the result; should items are reported as a score.
- v0.1 has no `/dash:friction`. A correct answer says that time to first value is a model estimate only.

---

## Prompt 1: design onboarding from a brief

### Prompt

```
/dash:onboard

Design the onboarding for the product in brief.md in this folder. It is a new product, so there are no existing users. Replace the nine-step wizard described in the brief. Write the spec files.
```

### Rubric

Files and structure (must):

- [ ] Writes `dash-spec/onboarding.md`.
- [ ] `onboarding.md` has all the onboarding-setup parts: First value, Provisioning table, Asked of the user, First-run flow, Landing until setup is done, Feature onboarding, Prompts, Deferred to settings.
- [ ] `onboarding.md` also has a Connect step table with columns `Integration | Placement | Auth | Mapping questions | Test | Sync default | Rule IDs`, and a Time to first value table with columns `Step | Who | KLM operators | Seconds | Rule IDs`.
- [ ] Writes or appends to `dash-spec/decisions.md`. At least one entry records the rejected nine-step wizard with ONB-002 (or ONB-001).
- [ ] Every design choice in the tables cites a rule ID. No rule ID is invented: every cited ID exists in `skills/onboard/references/rules.md` or the rule library.

First value and path (must):

- [ ] Names one first value: the first imported order in the Orders queue, or the first printed label. The choice is justified.
- [ ] The first run has at most 6 user steps, each marked user or system, and each justified as blocking first value (ONB-002).
- [ ] Puts one confirm step before the first billed label (ONB-002 exception), or states that buying the first label stays a separate, explicit action outside the first run.

Provisioning (must):

- [ ] The Provisioning table writes, at account creation: currency, weight and dimension units, timezone, label size (from country), the built-in carrier (from plan), one starter package record, and order import on (ONB-001).
- [ ] Business name or shop name comes from signup data or the connected shop, not from a typed field.
- [ ] Sender name and return address are still asked, not guessed (ONB-001 exception).
- [ ] The tax or EORI number is not asked in the first run. It is asked when a shipment outside the customs union first needs it, or deferred with a note. It is never guessed.

Connect step (must):

- [ ] One "Authorise" action that returns to Parcelpad (ONB-006).
- [ ] The only mapping question is the stock location (more than one valid answer). The 15-field mapping form is removed, and the remaining fields get defaults (INT-008).
- [ ] "Test connection" is on the same screen (INT-004).
- [ ] Automatic import is on by default, every 10 minutes. There is no manual "Import now" step in the first run (ONB-006).
- [ ] The shop gets a row in the integrations list and its own detail page (INT-001, INT-003), a status label (INT-005), and a sync failure raises a warning that names the connection, the impact and the fix (INT-007).

Landing, features and prompts (must):

- [ ] Lands on the Orders queue ("New orders" or equivalent), because Parcelpad is a single-queue tool (HOM-001). A KPI or chart home fails this item.
- [ ] If any setup checklist remains, its tasks are named by goal, show "N of M complete", have one start link, and are removed when done with "Restart setup guide" kept in help or settings (ONB-003, HOM-005, ONB-004). If there is no checklist, the answer says why (HOM-001 or HOM-005 exception).
- [ ] The Feature onboarding table has a row for Shipments, Packages, Automation rules and Returns. Each row has an empty-state heading, one primary action and templates or samples where they fit (ONB-007).
- [ ] The filtered-empty state is kept separate from the first-use empty state (IDX-011).
- [ ] Optional prompts are dismissible and stay dismissed. Required steps, for example "Add return address", have no dismiss control (ONB-008, HOM-006).
- [ ] No welcome dialog or tour, because there are no existing users. ONB-009 is skipped or marked not applicable.
- [ ] No path-choice cards, because there is one way to add orders. ONB-005 is not applied, or is marked not applicable.

Time to first value (must):

- [ ] The KLM table has a row for every user step of the proposed flow.
- [ ] It uses the stated operator times: K 0.2 s, P 1.1 s, B 0.1 s, H 0.4 s, M 1.35 s. A confirm or click step with a decision is M P 2B = 2.65 s. Every row is correct to within 0.05 s, and the user total equals the sum of the rows.
- [ ] System waits (the shop approval round trip, the first import at up to 10 minutes) are listed apart and not added to the user total.
- [ ] States the KLM limits: an expert with no errors, no reading time and no waiting; good for comparing flows, not for promising a time.
- [ ] Says that `/dash:friction` is not installed (v0.2) and that the number is a model estimate only. It does not claim to have measured a real run.

Rule labelling (must):

- [ ] ONB-001, ONB-002, ONB-004, ONB-005, ONB-006, ONB-009, INT-005 and INT-008 are written as suggestions wherever they are applied.

Should:

- [ ] Gives a KLM estimate for the nine-step wizard too and compares it with the proposed flow.
- [ ] The Deferred to settings list includes label format overrides, notification emails, own carrier account (Pro) and the import interval, each with its default.
- [ ] Says that the own carrier account (Pro) is not needed for first value and is left out of the first run.
- [ ] Places the shop integration by what it adds, orders data (INT-011).

Fail on sight:

- Asks the user to type currency, timezone or units in the first run.
- Signs up, enters credentials, or calls a real shop or carrier service.
- Writes real company names, account ids, store ids, people or email addresses other than `example.com`.

---

## Prompt 2: check onboarding on the flawed dashboard

### Prompt

```
/dash:onboard <path to the copy of flawed-dashboard>

Check the onboarding of this app for a brand-new account: what a new admin sees and does from first login until their first orders show up. Read the code only; do not start the app. Write the result into dash-spec/ inside that folder.
```

The runner replaces `<path to the copy of flawed-dashboard>` with the absolute path of the copy.

### Rubric

Files and structure (must):

- [ ] Writes `dash-spec/onboarding.md` inside the copy.
- [ ] Starts with a findings table with columns `Step | Finding | Status | Rule IDs | Fix`. Status is only `pass`, `fail` or `missing`.
- [ ] After the findings table, gives the proposed onboarding with the onboarding-setup parts, the Connect step table and the Time to first value table.
- [ ] Records at least one fix in `dash-spec/decisions.md` with its rule ID and the rejected alternative.
- [ ] Cites file paths for its findings: at least `app/page.js`, `app/orders/page.js`, `app/settings/integrations/page.js` and `lib/data.js`.
- [ ] Does not read `EXPECTED_FINDINGS.md` or `README.md`, if they are present.

Must-find issues:

1. [ ] **No first-run code.** The app has no signup, account-creation or first-run route. Values such as store name, timezone and package weight come from the in-memory seed in `lib/data.js`, not from provisioning at account creation. The answer marks the first-run flow and provisioning as `missing` or not checkable (ONB-001, ONB-002). It does not invent a signup form or wizard and then fail it.
2. [ ] **Landing is not the queue.** The default route `/` (`app/page.js`) is a Home page with two figure cards. Orders is the only nav area that holds waiting work, so a new admin should land on the Orders queue: HOM-001 `fail`.
3. [ ] **No authorise or test step.** The Orders empty state (`app/orders/page.js:91-95`) sends the user to `/settings/integrations`. There the store connection is only an on/off switch (`app/settings/integrations/page.js:14`): no authorise action and no "Test connection". Cited as INT-004 `fail` or `missing`, and ONB-006 as a suggestion.
4. [ ] **No integration detail page.** Integrations are cards with a switch only and no detail page each: INT-003 `fail` or `missing`.
5. [ ] **Time to first value.** A KLM table for the current flow (for example: Home, click Orders, click "Set up storefront sync", find and use the "Storefront sync" switch) and one for the proposed flow, with the stated operator times, correct arithmetic, the KLM limits, and the note that `/dash:friction` is not installed so the number is a model estimate only.

Should-find issues:

6. [ ] **Empty-state copy contradicts the default.** The empty state says "Turn on storefront sync to import them", but `lib/data.js:43` seeds Storefront sync as `enabled: true`. A new admin with no orders is sent to turn on something that is already on. The fix shows the sync status and last import instead (INT-005, ONB-007 or ONB-006).
7. [ ] **No connection status or failure surface.** Integrations show on or off only: no connected or error status and no last sync (INT-005, suggestion). A failed import raises no page warning (INT-007 `missing`).
8. [ ] **Shared empty branch.** The first-use empty state and the no-match search result share one branch, `data.total === 0` (IDX-011). Cited as IDX-011 or handed to `/dash:states`.
9. [ ] **Pass items stated as pass.** The Home figures are counted links to filtered lists (HOM-002 `pass`). The Orders empty state has one primary action (ONB-007 `pass`, or partial with a note about templates). Order import is on by default with an interval (the auto-sync part of ONB-006).

Correct non-findings (must):

- [ ] No onboarding prompts, checklist or banners exist. ONB-004, ONB-008 and HOM-006 are marked not applicable or `missing` with a fix. They are never `fail` for a prompt that does not exist.
- [ ] ONB-009 is not applicable (no redesign for existing users).
- [ ] The Home zeros shown before `/api/stats` answers (`app/page.js:15`) are handed to `/dash:states` or left out. They are not reported as an onboarding rule failure.
- [ ] Review findings outside onboarding (for example NAV-002 on "Manage integrations", CTL-007, SAV-002, CHR-012) are left out or listed as out of scope. They are not given ONB, HOM or INT rule IDs.

Rule labelling (must):

- [ ] ONB-001, ONB-002, ONB-004, ONB-005, ONB-006, ONB-009, INT-005 and INT-008 are written as suggestions.

Fail on sight:

- Starts the app, signs up, or enters credentials, against the prompt.
- Edits the app's code instead of writing `dash-spec/`.
- Writes real company names, account ids, store ids, people or email addresses other than `example.com`.

Score: must-find hits out of 5 (target 5 of 5) and should-find hits out of 4 (target 2 or more). Count false positives apart: any `fail` that names a screen, field or prompt not present in the code.
