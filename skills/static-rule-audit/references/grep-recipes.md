# Grep recipes

Search patterns that find the code each rule's static check needs. Run them from the repo root. They use ripgrep (`rg`); with plain grep, use `grep -rnE '<pattern>' --include='*.tsx' --include='*.jsx' --include='*.js' .`. Exclude `node_modules`, `.next`, `dist`, `build`, `DerivedData`.

Patterns use `|` for alternation, as rg expects. A hit is a place to read, not a finding. Open the file and judge it against the rule text.

## Next.js App Router, React, shadcn/ui, Tailwind

Map the app first:

```sh
rg --files -g 'app/**/{page,layout,loading,error,not-found}.{tsx,jsx,js}'   # routes and their state files
rg --files -g '**/components/ui/*.{tsx,jsx,js}'                                # installed shadcn components
```

- Switches: `rg -n '<Switch\b|role="switch"'` (CTL-001, CTL-002, SAV-002)
- Checkboxes: `rg -n '<Checkbox\b|type="checkbox"'` (CTL-001, CTL-003, IDX-008)
- Radios, selects, comboboxes: `rg -n '<RadioGroup\b|<Select\b|<select\b|<Command\b|role="combobox"'` (CTL-004, CTL-005, CTL-006)
- Number fields: `rg -n 'type="number"|inputMode="(decimal|numeric)"'` (CTL-007)
- Segmented controls: `rg -n '<ToggleGroup\b|<Tabs\b|aria-pressed'` (CTL-008, DET-007)
- Forms: `rg -n '<form\b|<Form\b|useForm\(|onSubmit='` (CTL-001, LAY-005, SAV-001)
- Save and submit buttons: `rg -n 'type="submit"|>\s*(Save|Submit|Update|Apply)\b'` (CTL-002, SAV-001, SAV-003)
- Dirty flag and leave guard: `rg -n 'isDirty|beforeunload|onBeforeUnload|reset\('` (SAV-001, SAV-004, SAV-005)
- Toasts: `rg -n 'toast(\.\w+)?\(|<Toaster\b|sonner|useToast'` (FDB-001, FDB-008, SAV-002)
- Dialogs: `rg -n '<(Alert)?Dialog\b|<Sheet\b|confirm\('` (FDB-007, SAV-006, HLP-002)
- Destructive actions: `rg -n 'variant="destructive"|(Delete|Remove|Disconnect|Uninstall)\b'` (SAV-006, INT-012, DET-012)
- Primary buttons: `rg -n '<Button\b(?![^>]*variant=)'` (needs `rg -P`), `rg -n 'variant="default"'` (VIS-002, IDX-009, DET-005)
- Tooltips and help text: `rg -n '<Tooltip|<Popover|<FormDescription|aria-describedby|helpText'` (HLP-001, HLP-003, HLP-009)
- Docs links: `rg -n 'Learn more|>\s*here\s*<|href="https?://[^"]*docs'` (HLP-005, HLP-010)
- Nav config: `rg -n '<Sidebar\b|SidebarMenu|navItems|navigation\s*=|const nav'` (NAV-001 to NAV-006, SET-005)
- Active state: `rg -n 'aria-current|usePathname|isActive'` (NAV-004)
- Chrome: `rg -n 'CommandDialog|metaKey|ctrlKey|key === "k"|DropdownMenu.*(Account|User)|Bell'` (CHR-001, CHR-002, CHR-008, CHR-009)
- Empty states: `rg -n '\.length === 0|length < 1|!\w+\.length|No \w+ (yet|found)|EmptyState'` (STA-001, IDX-011, ONB-007)
- Loading and errors: `rg -n '<Skeleton|isLoading|isPending|<Suspense|role="status"|error\.(tsx|jsx|js)'` (STA-003, STA-004, HOM-010)
- Not found: `rg -n 'notFound\(\)|not-found'` (STA-006)
- Disabled and gated: `rg -n 'disabled=\{|aria-disabled|\b(plan|tier|entitlement)s?\b|isPro|\bcan[A-Z]\w*\('` (HLP-006, STA-005, VIS-006)
- Tables and pagination: `rg -n '<Table\b|<DataTable|aria-sort|Previous|Next'` (IDX-005 to IDX-009, LAY-002)
- Layout widths: `rg -n 'max-w-|maxWidth|grid-cols-'` (LAY-001 to LAY-004, LAY-008)
- Raw colours: `rg -n '#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(bg|text|border)-\[#' -g '!**/globals.css' -g '!**/tailwind.config.*'` (VIS-001, VIS-009). Display text such as "Order #1001" also matches; skip hits that are display text, not colours.
- Raw spacing and radius: `rg -n '\b(p|m|gap|space-[xy])[trblxy]?-\[|rounded-\[|border-radius:'` (LAY-006, VIS-007)
- Settings routes: `rg --files -g 'app/**/settings/**/page.{tsx,jsx,js}'`, `rg -n 'billing|api-?keys|audit|members'` (SET-004, SET-006, SET-009)
- Button and label strings: `rg -no '>\s*[A-Z][^<{]{1,40}<' -g '*.{tsx,jsx,js}'` (MCP-001, MCP-002, MCP-004, NAV-002)
- AI assistant: `rg -n 'assistant|copilot|useChat|tool_call|tools:'` (AI-001 to AI-004, SAV-011)

## SwiftUI

```sh
rg --files -g '*.swift' | rg -v 'Tests|Preview'
```

- Toggles: `rg -n 'Toggle\(|\.toggleStyle\('` (CTL-001, CTL-002)
- Pickers: `rg -n 'Picker\(|\.pickerStyle\((\.segmented|\.radioGroup|\.menu)'` (CTL-004, CTL-005, CTL-008)
- Number fields: `rg -n 'TextField\([^)]*value:|\.keyboardType\(\.decimalPad|Stepper\('` (CTL-007)
- Forms: `rg -n '\bForm\s*\{|Section\(|Section\s*\{'` (LAY-005, SAV-003)
- Save buttons: `rg -n 'Button\("(Save|Done|Apply)|\.confirmationAction|ToolbarItem'` (SAV-001, CTL-002)
- Unsaved changes: `rg -n 'interactiveDismissDisabled|hasChanges|isDirty'` (SAV-005)
- Dialogs and alerts: `rg -n '\.alert\(|\.confirmationDialog\(|\.sheet\('` (FDB-007, SAV-006)
- Destructive actions: `rg -n 'role: \.destructive'` (SAV-006, INT-012)
- Toast-like banners: `rg -n 'overlay\(.*(Toast|Banner)|AccessibilityNotification|UIAccessibility\.post'` (FDB-001, FDB-008)
- Nav config: `rg -n 'NavigationSplitView|NavigationStack|List\(selection:|TabView'` (NAV-001, NAV-004, SET-004)
- Settings scene: `rg -n '\bSettings\s*\{'` (SET-004, SET-008)
- Search and chrome: `rg -n '\.searchable\(|\.keyboardShortcut\(|\.commands\s*\{'` (CHR-001, CHR-002, CHR-004)
- Empty and not found: `rg -n 'ContentUnavailableView|\.isEmpty'` (STA-001, STA-006, ONB-007)
- Loading and errors: `rg -n 'ProgressView|\.redacted\(|\.task\s*\{|catch\s*\{'` (STA-003, STA-004)
- Disabled controls: `rg -n '\.disabled\('` (HLP-006, STA-005)
- Help text: `rg -n '\.help\(|\.footer|Text\(.*\)\s*\.font\(\.caption'` (HLP-001, HLP-003)
- Raw colours and sizes: `rg -n 'Color\(red:|Color\(#|\.font\(\.system\(size:|\.padding\([0-9]'` (VIS-004, VIS-009, LAY-006)

## Spec folders (dash-spec/)

Read `dash-spec/index.md` first, then the file for the area: `ia.md` (navigation, settings, chrome), `pages.md` (home, index, detail, integrations, branding, AI), `controls.md` (controls, save model, help text, copy), `states.md` (states, feedback), `onboarding.md`, `tokens.md` (visual, layout), `inventory.md` (objects, frequency, risk) and `decisions.md` (rejected alternatives, often the evidence for an exception). `Where` is `dash-spec/<file>.md:<line>`. Find a row with `rg -n '<field or page name>' dash-spec/`.
