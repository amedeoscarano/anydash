# Settings architecture: React notes

Stack: Next.js App Router, Tailwind, shadcn/ui. Each note cites the rule it implements.

## Routes

- One route per settings page: `app/(admin)/settings/[page]/page.tsx` or one folder per page (`settings/general`, `settings/carriers`). Never switch pages with client-only tabs. SET-004.
- `app/(admin)/settings/page.tsx` calls `redirect('/settings/general')`, so the entry lands on the first page. SET-006.
- `app/(admin)/settings/layout.tsx` renders the settings list next to `{children}`. SET-004.
- Per-object settings live under the object route: `products/[id]/page.tsx` section, or `services/[id]/settings/page.tsx` as a tab route. SET-002.
- Personal preferences live under `app/(admin)/profile/`, reached from the user menu. SET-008.

## Navigation

- Main sidebar: shadcn `Sidebar`. Put Settings in `SidebarFooter`, not `SidebarContent`, so it stays at the bottom on every page. SET-005.
- Settings list: a second `Sidebar` (or a `SidebarGroup` column) with `SidebarGroupLabel` headings once the list passes about 20 entries. First item "Back to main menu" as a `Link` to `/`. SET-004, SET-007.
- Mark the current page with `SidebarMenuButton isActive` from `usePathname()`.
- Search settings: a `Command` (`CommandInput`, `CommandList`, `CommandGroup` per settings group) over a static array of `{ title, href, group, keywords }`. Add the same array to the global command palette. SET-012.
- Phone width: `Sidebar` already renders as a `Sheet` on mobile; keep the settings list inside it. LAY-008.

## Page layout

```tsx
<div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">   {/* LAY-001 */}
  <h1 className="text-xl font-semibold">General</h1>
  <Card>                                                      {/* LAY-005: one topic */}
    <div className="grid gap-6 p-6 md:grid-cols-3">           {/* LAY-003 */}
      <div>
        <h2 className="font-medium">Units and currency</h2>
        <p className="text-sm text-muted-foreground">Used on new shipments and invoices.</p>
      </div>
      <div className="space-y-4 md:col-span-2">{/* controls */}</div>
    </div>
  </Card>
</div>
```

- `max-w-4xl` is 896 px, inside the 640 to 1040 px range. Index pages under settings that hold a wide table drop the cap. LAY-001.
- `md:grid-cols-3` stacks to one column below 768 px; use one column when the cap is below about 800 px. LAY-003, LAY-008.
- Never put a `Card` inside a `Card`. A `Table` inside a section is fine. LAY-005.
- Use Tailwind's default spacing (4 px base) only: `gap-2`, `gap-4`, `p-6`. No arbitrary `p-[13px]`. LAY-006.

## Current values

- Load the saved values in the server component and pass them as `defaultValues` to the form, so controls render the current state on first paint. SET-010.
- Summary rows: a `Link` row showing label, value and a chevron, e.g. "Local delivery · Off". SET-010.
- Secrets: render `••••1234` or a `Badge` "Set", never the value. SET-010.
- Inherited values on an object: a `Badge variant="secondary"` "Inherited from account default" with a link to the settings page. SET-011.
