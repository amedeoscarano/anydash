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
