# Sidebar in React (Next.js App Router + Tailwind + shadcn/ui)

Use the shadcn/ui `Sidebar` component family. Keep the nav config in one file (`lib/nav.ts`) so the sidebar, the search index and the shortcut map read the same labels (CHR-005).

## Structure

- `app/(dashboard)/layout.tsx` wraps pages in `SidebarProvider` + `Sidebar` + `SidebarInset`. Every dashboard route uses this layout, so Settings and the bottom block render on every page (SET-005).
- `Sidebar collapsible="icon"` gives the icon rail (NAV-003). Put a `SidebarTrigger` in the header with `aria-label` "Collapse navigation" / "Expand navigation"; it renders `aria-expanded` from `useSidebar().open`. Add `SidebarRail` for drag-to-toggle.
- `SidebarHeader`: the scope switcher, only when the user has more than one scope (CHR-007). Build it as `DropdownMenu` or `Popover` + `Command` (CommandInput "Search for an account", CommandList, a "Create account" CommandItem).
- `SidebarContent`: one `SidebarGroup` for core work items; more groups with `SidebarGroupLabel` only past about ten destinations (NAV-005).
- `SidebarFooter`: separator, then Settings, then account items (NAV-001, SET-005).

## Items

- `SidebarMenuButton asChild isActive={match} tooltip={label}` wrapping `next/link`. `tooltip` gives the rail its label on hover and focus (NAV-003). Set `aria-current={match ? "page" : undefined}` on the link (NAV-004).
- Compute `match` with `usePathname()` and a prefix test, so `/orders/123` highlights Orders (NAV-004).
- Sub-items: `Collapsible` (shadcn) around `SidebarMenuSub` / `SidebarMenuSubButton`; open by default when a child route is active (NAV-004, NAV-005).
- Icons: one outline set (lucide-react), passed from the nav config.
- Labels: sentence-case nouns from the config, never verbs (NAV-002).

## Badges

- `SidebarMenuBadge` with the count from a queue query, e.g. orders where status = unfulfilled (NAV-011).
- Give the link an accessible name that includes what is counted: `aria-label="Orders, 3 to fulfil"`.
- shadcn hides `SidebarMenuBadge` in icon mode (`group-data-[collapsible=icon]:hidden`). Override it so the count stays visible in the rail, e.g. as a dot plus the count in the tooltip (NAV-011).
- Lifecycle labels use `Badge variant="secondary"` with text ("Beta"), not a number.

## Breakpoints

- shadcn switches to a `Sheet` drawer below 768 px (`useIsMobile`). That matches NAV-006 at 390 px: the Sheet traps focus, closes on Escape and returns focus to the trigger. Give the mobile trigger the visible or accessible label "Menu".
- 768 to 1023 px: start collapsed to the rail. Read the width on mount and pass `defaultOpen={false}`, or set `open` from a `matchMedia("(min-width: 1024px)")` listener (NAV-006).
- 1024 px and up: `defaultOpen` from the `sidebar_state` cookie, expanded when unset (NAV-003).
- The main column uses `min-w-0` so tables do not push the page into horizontal scroll (LAY-008).

## Child scope swap

For a child scope with many pages (NAV-009), render a second nav config in `app/(dashboard)/sites/[siteId]/layout.tsx`. First item: a link "Back to Sites"; then the child name in `SidebarHeader`.

## Extensions

Render installed apps from a separate registry in their own `Collapsible` `SidebarGroup` labeled "Apps", after the core group (NAV-010). Each app's Settings is the last item under its entry (SET-003). Pin and unpin via `SidebarMenuAction` with a `DropdownMenu`.

## Personalisation

Store pinned and hidden items through a user-preferences API (Supabase table `user_preferences` when the repo uses Supabase), not localStorage (NAV-012). Exclude Home and Settings from hide and reorder. The collapse state may stay in the cookie; it is a device preference, not part of NAV-012.
