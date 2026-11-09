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

Store pinned and hidden items through a user-preferences API (a `user_preferences` table in the repo's database), not localStorage (NAV-012). Exclude Home and Settings from hide and reorder. The collapse state may stay in the cookie; it is a device preference, not part of NAV-012.

## Two-level layout: category rail plus section menu

Use it only when NAV-013 applies (about ten or more categories, most with three or more pages); otherwise keep the single shadcn `Sidebar` above. The shadcn `Sidebar` is one column, so build the rail and the section menu as two plain components and keep `Sheet` for phones.

Nav config in `lib/nav.ts`, one entry per category; `sections` is empty for single-page categories (NAV-013 exception). `panel` picks the second column by the category's job (NAV-015).

```ts
export type NavCategory = {
  id: string; label: string; href: string; icon: LucideIcon; shortcut?: string;
  panel: "menu" | "objects" | "filters";
  sections: { group: string; items: { label: string; href: string }[] }[];
};
export const activeCategory = (path: string) =>
  categories.find((c) => path === c.href || path.startsWith(c.href + "/"));
```

`app/(admin)/layout.tsx` is a client shell (or a server layout that renders one): the active category comes from `usePathname()`, so a deep link or a reload shows the right rail item and menu (NAV-004).

```tsx
"use client";
export function AdminShell({ children, mode }: { children: React.ReactNode; mode: SidebarMode }) {
  const category = activeCategory(usePathname());
  const railWidth = mode === "expanded" ? "md:pl-[200px]" : "md:pl-12";
  return (
    <div className={`min-h-dvh ${railWidth}`}>
      <CategoryRail active={category?.id} mode={mode} />
      <div className="flex min-w-0">
        {category && category.sections.length > 0 && (
          <SectionMenu category={category} className="hidden md:flex w-64 shrink-0 border-r" />
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
```

### CategoryRail (NAV-013, NAV-014)

- `<nav aria-label="Main">` fixed at the left, `hidden md:flex`, 48 px wide (`w-12`). Each item is a `next/link` with the icon, `aria-current="page"` when it is the active category, and an accessible name equal to the label (NAV-003, NAV-004).
- Hover and focus expansion: the inner panel is `absolute inset-y-0 left-0 z-40 w-12` and widens to `w-[200px]` on `group-hover` and `group-focus-within`, with a shadow. Only the overlay changes width; the layout column keeps `pl-12`, so the content never moves (NAV-014 check_static). Labels use `sr-only` until expanded, then show.
- Tooltip with shortcut: shadcn `Tooltip` with `side="right"`, content "Data browser  G then D", shown in collapsed mode only, because the expanded rail already shows the label (NAV-014).
- Sidebar mode: a `DropdownMenu` at the rail bottom labeled "Sidebar mode" with a `DropdownMenuRadioGroup`: Expanded, Collapsed, Expand on hover. Expanded sets `md:pl-[200px]` on the layout and keeps labels visible; Collapsed turns hover expansion off; Expand on hover is the overlay above.
- Store the mode per user (NAV-014): a server action writes `user_preferences.sidebar_mode` (a table in the repo's database) and the server layout reads it, so the first paint has the right width with no flash. A cookie copy is fine as a cache, never as the source.
- Touch: `@media (hover: none)` skips hover expansion; tablets use Expanded or the drawer (NAV-014 exceptions, NAV-006).

### SectionMenu (NAV-013, NAV-015)

- One slot, one width token (`w-64`), always at the same x for every category (NAV-015).
- `panel === "menu"`: a `<nav aria-label={category.label}>` with an `<h2>` category title, then each group as a small uppercase label and a list of links; the current page gets `aria-current="page"` and the filled highlight (NAV-004).
- `panel === "objects"`: an `Input` "Search tables" above a list of the user's objects, filtered on the client; a `Select` for the schema or folder when there is one (NAV-015).
- `panel === "filters"`: time range, type checkboxes with counts and level filters; the values live in the URL search params so a filtered log view can be shared.
- Full-width editors may hide the column only with a toggle in the same place that brings it back (NAV-015 exceptions).

### Phone drawer (NAV-006, NAV-016)

- Below 768 px both columns are hidden; a header button "Menu" opens a shadcn `Sheet side="left"` (focus trap, Escape, focus back to the trigger, NAV-006).
- The Sheet's view state starts at the active category: `useState<"category" | "all">(category ? "category" : "all")`, reset each time the Sheet opens. The category view shows a back button "< Database" (`aria-label="All categories"`) then the same `SectionMenu` content; the all view lists the rail categories (NAV-016).
- On the home page, which has no category, the Sheet opens on the category list (NAV-016 exceptions).
- Close the Sheet on route change (`useEffect` on the pathname) so a tap on a link both navigates and closes.
