# Control selection: SwiftUI notes

Each note cites the rule it implements.

## Explicit save (a `Form` with a Save button)

- One boolean: on macOS `Toggle("Archive fulfilled orders", isOn: $draft.archive).toggleStyle(.checkbox)`. On iOS there is no checkbox style: show a summary row that pushes an editor with its own Save (SAV-003), or make the page instant with switches (CTL-002). CTL-001.
- Bind to a draft copy (`@State var draft = settings`), never to the saved model, so nothing persists before Save. CTL-001.
- Several of a set: one checkbox-style `Toggle` per option, bound into a `Set`. On iOS use a `List` with `.selection` in edit mode. CTL-003.
- One of 2 to 6 to compare: `Picker` with `.pickerStyle(.radioGroup)` on macOS, `.pickerStyle(.inline)` on iOS. Put a one-line `Text` description under each option label, and phrase the section header as a question. CTL-004.
- One of a closed list: `Picker` with `.pickerStyle(.menu)`. CTL-005.
- Long or user-data list: a `Picker` with `.pickerStyle(.navigationLink)` pushing a `List` with `.searchable`. CTL-006.
- Number with a unit:
  ```swift
  LabeledContent("Default weight") {
      TextField("Weight", value: $draft.weight, format: .number)
          .multilineTextAlignment(.trailing)
      Text("kg").foregroundStyle(.secondary)
  }
  ```
  Clamp in validation (0...70) and say the range in the section footer. Use `Stepper` when the step is fixed. CTL-007.
- Preset amounts: `Picker` whose option labels carry the unit ("4 hours"). CTL-007.
- Gating: `.disabled(!draft.inspectTraffic)` on the dependent `Section`, or wrap it in `if draft.inspectTraffic`. CTL-010.

## Instant apply (no Save in the view)

- `Toggle` with the default switch style, bound to the live model; persist in `.onChange(of:)`. On failure, revert the value and show an error with Retry. CTL-002, SAV-002.
- Risky toggle: `.confirmationDialog` before applying. CTL-002.
- macOS `Settings` scenes follow this model by platform convention: every control applies at once.

## Views, not settings

- Time range or layout: `Picker` with `.pickerStyle(.segmented)` bound to view `@State`, never to saved settings. CTL-008.

## Accessibility

- Give every `Toggle` and `Picker` a visible label string; use `.labelsHidden()` only when a `LabeledContent` already names it. Add `.accessibilityHint` with the description text. CTL-009.
