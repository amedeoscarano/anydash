# Settings architecture: SwiftUI notes

Each note cites the rule it implements.

## macOS

- Account settings go in a `Settings` scene, opened by the standard Settings menu item and Cmd-comma. That is the fixed entry. SET-005.
- Inside the scene, use a `NavigationSplitView` with a sidebar `List` of settings pages, not a `TabView`, once there are more than about 5 pages. SET-004.
- Group the sidebar with `Section("Connect") { ... }` headings on one axis once the list passes about 20 entries. SET-007.
- Open on the first, most used page: set the initial selection to `.general`. SET-006.
- Add `.searchable(text:)` on the sidebar list and filter pages by title and keywords. SET-012.
- Store the selection in `@SceneStorage` so the window reopens on the last page.

## iOS and iPadOS

- Settings is a `NavigationStack` destination reached from the bottom of the main sidebar or from the account tab, never a peer of work tabs. SET-001, SET-005.
- Each page is a `NavigationLink(value:)` with a `navigationDestination`, so it can be deep linked. SET-004.
- On iPad, `NavigationSplitView` shows the settings list beside the page; on iPhone it collapses to a stack. LAY-008.

## Scope

- Per-object settings: a `Section` on the object's detail view, or a "Settings" tab in its `TabView`. SET-002.
- Personal preferences (appearance, language, shortcuts): a Profile view from the account menu, stored per user on the server, with `@AppStorage` only as a local cache. Account-wide values come from the server. SET-008.
- Plan, users, API keys, audit log: pages in the settings list under an "Account" section. SET-009.

## Page layout

- Use `Form { Section { ... } header: { Text("Units") } footer: { Text("Used on new shipments.") } }`. Each `Section` is one topic. Do not nest `GroupBox` inside a `Section`. LAY-005.
- On macOS add `.formStyle(.grouped)` and `.frame(maxWidth: 720)` so the form does not stretch on a wide window. LAY-001.
- Show the current value in the control itself (`Picker` shows "kg") or as `LabeledContent("Local delivery", value: "Off")` in a row that pushes an editor. SET-010.
- Secrets: `LabeledContent("API token", value: "••••1234")`. SET-010.
- Inherited values: a secondary `Text("Inherited from account default")` under the value. SET-011.
