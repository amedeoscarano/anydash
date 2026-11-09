# Sidebar in SwiftUI (NavigationSplitView)

Keep one `enum Destination: Hashable, CaseIterable` with label, SF Symbol and group. The sidebar, the search index and keyboard commands read from it (CHR-005).

## Structure

- `NavigationSplitView(columnVisibility: $visibility) { sidebar } detail: { ... }`. The system gives the collapse toggle with an accessible name on macOS and iPad (NAV-003).
- Sidebar: `List(selection: $selection)` with `.listStyle(.sidebar)`. Selection binding gives the filled active highlight and the selected accessibility trait (NAV-004).
- Core work items first, ordered by frequency, then a `Section` for Settings and account items at the end (NAV-001, SET-005). On macOS, account-wide settings can also live in the `Settings` scene (Cmd+,), but keep the sidebar entry for a multi-page settings area.
- Groups: `Section("Build") { ... }` only past about ten destinations (NAV-005). Sub-items: `DisclosureGroup` or `OutlineGroup`, expanded when a child is selected (NAV-004, NAV-005).

## Items

- `Label("Orders", systemImage: "tray")` for every row; one symbol style (NAV-003). Labels are sentence-case nouns that match the `.navigationTitle` of the destination (NAV-002).
- Detail pages pushed inside a destination keep that destination selected (NAV-004).

## Badges

- `.badge(count)` on the row, only for actionable queues (NAV-011). Add `.accessibilityLabel("Orders, \(count) to fulfil")`.
- Lifecycle pills: `.badge(Text("Beta"))`.
- `.badge` stays visible in compact layouts; check the sidebar sheet on iPhone (NAV-011).

## Breakpoints

- iPhone (390 pt): `NavigationSplitView` collapses to a stack; the sidebar becomes the root list, content gets full width (NAV-006, LAY-008). Badges and Settings stay in that list.
- iPad portrait (768 pt): use `.navigationSplitViewStyle(.balanced)` or let the system overlay the sidebar; icons and names stay (NAV-006, CHR-012).
- macOS and iPad landscape (1024 pt and wider): sidebar visible, user can hide it.
- macOS has no icon rail; a hidden sidebar is the collapsed state. Keep every destination reachable from a `CommandMenu` with keyboard shortcuts so nothing depends on the visible list.

## Scope switcher

When the user has more than one account (CHR-007): a `Menu` or `Picker` at the top of the sidebar (`.safeAreaInset(edge: .top)`) showing the current account name, opening a searchable sheet (`.searchable`) with a "Create account" button.

## Child scope swap

For a child scope with many pages (NAV-009), replace the sidebar `List` contents with the child's destinations, headed by a "Back to Sites" button and the child name.

## Extensions

Installed apps go in their own `Section("Apps")` after the core items, collapsible on macOS (NAV-010). Each app's settings row is its last sub-item (SET-003).

## Personalisation

Store pinned and hidden items per user on the server, not only in `@AppStorage`, so they follow the user to another device (NAV-012). Home and Settings cannot be hidden.

## Two-level layout: three-column NavigationSplitView

Use it only when NAV-013 applies (about ten or more categories, most with three or more pages). Map the two levels onto the three columns: sidebar = categories, content = section menu, detail = page.

```swift
@State private var category: Category? = .database
@State private var page: Page?
@State private var visibility: NavigationSplitViewVisibility = .all
@State private var compactColumn: NavigationSplitViewColumn = .content  // iPhone: open at the category (NAV-016)

NavigationSplitView(columnVisibility: $visibility, preferredCompactColumn: $compactColumn) {
    List(Category.allCases, selection: $category) { c in
        Label(c.label, systemImage: c.symbol)            // NAV-003
    }
    .navigationTitle("Project")
} content: {
    if let category { SectionMenu(category: category, selection: $page) }  // NAV-013, NAV-015
} detail: {
    if let page { page.view } else { ContentUnavailableView("Select a page", systemImage: "sidebar.left") }
}
.onChange(of: category) { page = category?.defaultPage }  // never keep a page from another category
```

- Sidebar column: categories only, one `Label` each; the selection binding gives the active highlight (NAV-004). Settings sits in its own `Section` at the end (SET-005).
- Content column: `SectionMenu` switches on the category's job (NAV-015). Configuration: `List(selection:)` with a `Section("Management")` per group. Editors: a list of the user's objects with `.searchable` on this column. Logs: a `Form` of filters (time range `Picker`, type `Toggle`s with counts).
- One width for the content column in every category: `.navigationSplitViewColumnWidth(256)` (NAV-015). Single-page categories have no section menu (NAV-013 exception). A three-column split view cannot hide only its content column (`.doubleColumn` hides the sidebar instead), so for those categories render a two-column `NavigationSplitView(columnVisibility:preferredCompactColumn:) { categories } detail: { page }`, chosen by an `if` on the category.
- macOS and iPad: the system collapses the sidebar column; there is no hover overlay, so NAV-014 does not apply as such. Keep every category in a `CommandMenu` with keyboard shortcuts, the counterpart of the rail tooltip shortcut. Store the column visibility the user chooses per user (NAV-014 sidebar mode).
- iPhone (compact): the split view collapses to a stack. Push into the current category on launch and on return, so the first screen is the category's page list with a back button "Project" to all categories (NAV-016). Set `compactColumn` (iOS 17+) to `.content` when a category is selected and to `.sidebar` on the home screen, which has no category (NAV-016 exceptions).
