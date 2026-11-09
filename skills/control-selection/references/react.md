# Control selection: React notes

Stack: Next.js App Router, Tailwind, shadcn/ui, `Form` with react-hook-form and zod. Each note cites the rule it implements.

## Explicit save (inside `<Form>`)

- One boolean: `Checkbox` inside `FormField` / `FormItem`, with `FormLabel` and `FormDescription`. Never `Switch` here. CTL-001, CTL-002.
- Several of a set: one `FormField` with an array value; render a `Checkbox` per option and toggle membership in the array. CTL-003.
- One of 2 to 6 to compare: `RadioGroup` + `RadioGroupItem`, each with a `Label` and a muted one-line description. Group title as a question in `FormLabel`; add a `Badge` "Recommended" to one option. CTL-004.
- One of a closed list: `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`). CTL-005.
- Long, user-data or creatable list: the shadcn Combobox pattern, `Popover` + `Command` (`CommandInput`, `CommandList`, `CommandEmpty`, `CommandItem`). For creatable lists add a "Create <query>" `CommandItem` when nothing matches. CTL-006.
- Multi-value creatable list: same `Command`, chosen values rendered as `Badge` chips with a remove button. CTL-006.
- Number with a unit:
  ```tsx
  <div className="relative">
    <Input type="number" inputMode="decimal" min={0} max={70} step={0.01} className="pr-10" {...field} />
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">kg</span>
  </div>
  ```
  Validate with `z.coerce.number().min(0).max(70)`; state the range in `FormDescription`, not in the placeholder. CTL-007.
- Preset amounts: `Select` with items "1 hour", "4 hours", "1 day". CTL-007.
- User-chosen unit: `Input type="number"` next to a narrow `Select` of units. CTL-007.
- Gating: `const on = form.watch('inspectTraffic')`; pass `disabled={!on}` to the sub-options, or render them only when `on`. CTL-010.

## Instant apply (no `<Form>`, no Save)

- `Switch` with `checked` and `onCheckedChange` that calls a server action. Show `toast.success('Development mode on')` with Sonner; on error revert the state and `toast.error('Could not update', { action: { label: 'Retry', onClick } })`. CTL-002, SAV-002.
- Use `useOptimistic` or local state for the flip, and revert on failure. SAV-002.
- Risky toggle: open an `AlertDialog` before calling the action. CTL-002.

## Views, not settings

- Time range or layout: `ToggleGroup type="single"` (or `Tabs`) bound to a URL search param, never to a form field. CTL-008.

## Accessibility

- `FormLabel` and `FormControl` wire `id`, `aria-describedby` and `aria-invalid` for you. For a `Switch` outside a form, pair it with `<Label htmlFor>` and `aria-describedby` on the description. CTL-009.
- Each `RadioGroupItem` and `Checkbox` needs its own `Label`; no unnamed items. CTL-009.
