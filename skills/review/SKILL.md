---
name: review
description: Reviews an existing admin dashboard against the whole rulebook without a browser. It reads code (routes, layouts, components, forms, nav config, tokens), a dash-spec/ folder or screenshots, walks every rule area, decides for each rule whether it applies, is not applicable or cannot be checked statically, runs each rule's static check, and asks the design skills of each area to judge the hits. Writes dash-review/findings.md with one findings table (severity, rule ID, path:line, evidence, recommendation, exit), a "Do not build" list and a "Not checked" list. Use when the user asks to review, audit or critique a dashboard, back office, admin panel, settings area or a dash-spec before or after building it. Do not use it to test a running app (use /dash:review-live), to fix visual polish (use /dash:polish), or to design from scratch (use /dash:build).
disable-model-invocation: true
argument-hint: "[path]"
---

# Review a dashboard

Run a static review of a dashboard: code, a spec or screenshots, no browser. The command walks all 18 rule areas in a fixed order, so nothing is reviewed by impression. Each rule ends as a finding, a pass, not applicable or not checked, and each finding closes with one of four exits. Behaviour that only shows in a running app goes to Not checked for /dash:review-live.

## Input

`[path]`, default the current directory. The command detects the kind:

- **Code**: a repo or app folder. Detect the stack from `package.json` (`next`, `react`, `@radix-ui/*`, `components/ui/` for shadcn) or `*.xcodeproj` / `Package.swift` with `import SwiftUI`.
- **Spec**: a folder with `dash-spec/index.md` (from /dash:build). Review the spec as the design of record.
- **Screenshots**: a folder or list of image files. Only screenshot-checkable rules run; visual-audit judges the visual and layout areas.
- Code plus spec, both present: review the code and note where it departs from the spec.

## Output

`dash-review/findings.md` beside the reviewed repo root, or `./dash-review/findings.md`. Overwrite an older file only after reading it; keep its row numbers for findings that still hold.

1. A header: target, input kind, stack, date, and one coverage line: `rules: <total> | findings: <n> | passed: <n> | not applicable: <n> | not checked: <n>`.
2. The findings table, sorted by severity (blocker, major, minor, note), then by area:

| # | Severity | Rule | Where | Evidence | Recommendation | Exit |
|---|---|---|---|---|---|---|

   - Severity: `blocker` (data loss, wrong commit, security, inaccessible core task), `major` (a high or medium rule clearly violated), `minor` (polish, low-confidence rule), `note`. A low-confidence rule alone is never above `minor`.
   - Rule: a rule ID, or "no rule" plus the reason. Where: `path:line`. Evidence: the code or spec line, verbatim.
   - Exit: exactly one of `fix now`, `file as task`, `reject with rationale`, `verify with a test`.
3. `## Do not build`: features and settings that add complexity without value, each with its reason and rule ID.
4. `## Not checked`: "Not checkable statically" (rule IDs, one reason each; these are the live-only checks for /dash:review-live) and "Not applicable" (rule IDs grouped by reason).

## Procedure

Specialist skills are siblings in this plugin: `/dash:<name>` in Claude Code, `dash-<name>` elsewhere. Invoke each one, or read its `SKILL.md` in the sibling folder (`../<name>/SKILL.md`) and follow its Procedure and Self-check in review mode: judge what exists, do not redesign it. If a sibling is missing, read its areas in `references/rules.md` and the matching file in `references/frameworks/`, and apply them directly.

1. **Map the target.** List routes and their `page`, `layout`, `loading`, `error` and `not-found` files; form components; nav config; toast and dialog calls; settings routes; tokens and global CSS. Use the locate table below (full set: the static-rule-audit skill). For a spec, read every file in `dash-spec/`. Write down which features exist: home, index pages, detail pages, settings, integrations, customer emails, AI assistant, onboarding.
2. **Inventory.** From the map, list objects and jobs with an estimated frequency and risk (none, reversible, billed, customer-facing, destructive). Mark guesses "assumed". The inventory decides what "daily work" and "rare configuration" mean for NAV-001 and SET-001, and which actions need SAV-006.
3. **Static pass.** Apply the static-rule-audit skill to the whole target. It walks every area in `references/rules.md`, decides applies, not applicable or not checkable for each rule, runs each "Check (static)" line, and returns rows, the Do not build list and the Not checked lists.
4. **Design judgement by area.** For each area with hits, apply the design skill that owns it to confirm or reject the rows and to write the recommendation in its terms:

   | Area | Skill |
   |---|---|
   | navigation | nav-placement, sidebar-behavior (`references/frameworks/placement-decision-tree.md`) |
   | settings | settings-architecture (`references/frameworks/settings-taxonomy.md`) |
   | controls | control-selection (`references/frameworks/control-selection-matrix.md`) |
   | save-model | save-model |
   | help-text | help-text-policy (`references/frameworks/help-text-tree.md`) |
   | layout | settings-architecture, visual-tokens (`references/frameworks/page-templates.md`) |
   | home | home-layout |
   | index | index-page |
   | detail | detail-page |
   | global-chrome | global-chrome (`references/frameworks/global-chrome-map.md`) |
   | ai-assistant | ai-assistant-ux (`references/frameworks/ai-interaction-model.md`) |
   | onboarding | onboarding-setup (`references/frameworks/dhl-simplicity.md`) |
   | integrations | integration-connect |
   | branding | customer-branding |
   | states | ui-states |
   | feedback | feedback-messaging |
   | microcopy | microcopy |
   | visual | visual-tokens |

   The design skill may add a finding the static pass missed (for example a setting placed in the menu, SET-001). It cites the rule ID and evidence like any other row.
5. **Screenshots, if given.** Apply the visual-audit skill to the screenshots for the visual and layout areas. Merge its rows. Without screenshots, skip it and list the visual rules it would have covered (contrast, alignment, density) under "Not checkable statically" when the code alone cannot decide them.
6. **Merge and grade.** Remove duplicates: one row per rule per cause. Read each rule's "Exceptions" before keeping a row. Cap low-confidence rules at `minor`. Pick the exit (static-rule-audit step 5 gives the criteria). A failed "Check (static)" line is a finding (an aside with a fixed width and no breakpoint fails LAY-008). An outcome only a running app can show (a failed request, focus order, the page at 390 px, computed contrast) stays in Not checked, never a guessed finding.
7. **Do not build.** Collect complexity without value found in the code or spec, with reasons: a bell without a stored feed (CHR-009), a settings overview of cards (SET-006), tabs on a detail with one main body (DET-007), row checkboxes with no bulk action (IDX-008), an AI entry when no assistant ships (AI-001), a setup wizard for values the platform knows (ONB-001, low: suggestion).
8. **Write and summarise.** Write `dash-review/findings.md`. In chat, give the coverage line, the blockers and majors (one line each), and the next step: fix the `fix now` rows, or run /dash:review-live for the Not checked list.

### Locate (quick recipes)

Next.js, React, shadcn/ui (ripgrep; `|` is alternation):

- Switches: `rg -n '<Switch\b|role="switch"'`
- Forms and Save: `rg -n '<form\b|useForm\(|type="submit"|isDirty|beforeunload'`
- Toasts: `rg -n 'toast(\.\w+)?\(|<Toaster\b|sonner'`
- Dialogs: `rg -n '<(Alert)?Dialog\b|<Sheet\b|confirm\('`
- Nav config: `rg -n '<Sidebar\b|SidebarMenu|navItems|aria-current'`
- Empty states: `rg -n '\.length === 0|No \w+ (yet|found)|EmptyState'`
- Routes: `rg --files -g 'app/**/{page,layout,loading,error,not-found}.{tsx,jsx,js}'`

SwiftUI:

- Toggles and pickers: `rg -n 'Toggle\(|Picker\(|\.pickerStyle\('`
- Forms and Save: `rg -n '\bForm\s*\{|Button\("Save|\.confirmationAction'`
- Alerts and dialogs: `rg -n '\.alert\(|\.confirmationDialog\(|\.sheet\('`
- Nav config: `rg -n 'NavigationSplitView|List\(selection:|\bSettings\s*\{'`
- Empty states: `rg -n 'ContentUnavailableView|\.isEmpty'`

## Rules applied

All rules in `references/rules.md`. The ones that most often decide a review:

- NAV-001 — work areas first, account last.
- SET-001 — daily work in the menu, rare configuration in settings.
- SET-009 — account administration lives in settings.
- CTL-001 — checkbox for a boolean saved with a form.
- CTL-002 — switch only for instant changes.
- SAV-001 — sticky save bar that wakes on change.
- SAV-005 — warn before leaving with unsaved changes.
- SAV-006 — destructive actions apart, consequence stated, confirmed.
- HLP-001 — visible description for non-obvious settings.
- HLP-002 — consequences in visible text, never only a tooltip.
- HOM-001 — home type follows the job.
- IDX-011 — two empty templates: no data versus no matches.
- DET-006 — add and edit inside each section.
- CHR-001 — global search always in the chrome.
- CHR-009 — bell only for a real alert feed.
- STA-001 — empty state names the content and one action.
- STA-003 — loading placeholders in place.
- FDB-001 — one feedback channel per kind of event.
- MCP-001 — buttons start with a verb and name the object.
- VIS-002 — one filled primary button per view.

Full text: `references/rules.md`. Frameworks: `references/frameworks/`.

## Example

Target: a Next.js shipping admin with Orders, Order detail, Settings (General, Notifications) and Integrations.

Good `dash-review/findings.md` excerpt:

`rules: 179 | findings: 9 | passed: 112 | not applicable: 31 | not checked: 27`

| # | Severity | Rule | Where | Evidence | Recommendation | Exit |
|---|---|---|---|---|---|---|
| 1 | blocker | SAV-006 | app/orders/[id]/page.tsx:57 | `<Button onClick={() => deleteOrder(id)}>Delete order</Button>` in the header, no dialog | Move "Delete order" to a last section with the critical variant and an AlertDialog that states the consequence. | fix now |
| 2 | major | CTL-002 | app/settings/notifications/page.tsx:42 | `<Switch name="trackingEmail" />` inside the same `<form>` as `<Button type="submit">Save</Button>` at :71 | Use a Checkbox saved by the form. | fix now |
| 3 | major | SET-009 | components/app-sidebar.tsx:18 | `{ title: "Billing", url: "/billing" }` between Orders and Integrations | Move Billing under /settings/billing. | file as task |
| 4 | minor | HLP-010 | app/integrations/page.tsx:31 | `<a href={docs}>Learn more</a>` | Name the topic: "Learn about carrier accounts". | fix now |

Not checked: "Not checkable statically: SAV-002 handler rollback on a failed request (the handler calls a shared client whose error path is decided at runtime), LAY-008 at 390 px (width set by a runtime container query). Not applicable: AI-001 to AI-011 (no assistant), BRD-001 to BRD-011 (no customer messages)."

Bad: a list of ten impressions ("navigation could be clearer") with no rule IDs, lines or exits. Only the controls area reviewed because the user mentioned a switch. "Order list breaks at 390 px" written as a finding from reading Tailwind classes, when only a live run can confirm it. No Not checked section, so the reader assumes 100 % coverage.

## Self-check

- [ ] All 18 areas were walked; the coverage line adds up to the rule count in `references/rules.md`.
- [ ] Every finding has a rule ID (or "no rule" plus reason), `path:line`, verbatim evidence and one of the four exits.
- [ ] No low-confidence rule is above `minor`; exceptions were read before keeping a row.
- [ ] Each area with hits was judged by its design skill, or by its rules directly when the skill is missing.
- [ ] visual-audit ran only on screenshots that were given.
- [ ] Runtime-only behaviour sits in Not checked, not in the table.
- [ ] `## Do not build` and `## Not checked` exist, each entry with a reason.
