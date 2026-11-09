# Save model: SwiftUI notes

Each note cites the rule it implements.

## Page or section save

- Edit a draft: `@State private var draft: SyncSettings` copied from the saved value. Compute `isDirty = draft != saved`. SAV-001.
- Toolbar: `ToolbarItem(placement: .confirmationAction) { Button("Save") { save() }.disabled(!isDirty) }` and `ToolbarItem(placement: .cancellationAction) { Button("Discard") { draft = saved }.disabled(!isDirty) }`. SAV-001, SAV-004.
- Independent sections: give each `Section` its own draft and Save button in its footer, or push a subview with its own toolbar Save. SAV-003.
- Field errors: a red `Text` under the field in the same `Section`, plus `.accessibilityValue("Invalid")`. State the range in the section footer before typing. FDB-003.

## Leave guard

- In a pushed editor: `.navigationBarBackButtonHidden(isDirty)` with a custom back button that shows `.confirmationDialog("Leave page with unsaved changes?")` with "Leave page" (`role: .destructive`) and "Stay". SAV-005.
- In a sheet: `.interactiveDismissDisabled(isDirty)` and the same dialog on Cancel. SAV-005.

## Instant

- `Toggle` bound to the live model; persist in `.onChange(of:)`. On failure set it back and show an error with Retry. SAV-002.
- macOS `Settings` scenes apply every control at once by convention; do not add a Save button there. CTL-002.

## Destructive

- A separate `Button("Disconnect", role: .destructive)` in its own last `Section`, never in the toolbar next to Save. SAV-006.
- `.confirmationDialog("Disconnect warehouse?", isPresented:)` with a message stating what stops, and `Button("Disconnect", role: .destructive)`. On macOS use `.alert` with the same buttons. SAV-006, FDB-007.

## Background jobs

- Start the job in a `Task`, keep its state in an `@Observable` store outside the view so leaving the view does not cancel it. Show `ProgressView(value:)` with "Importing 120 of 400. You can leave this page." SAV-009.
- On failure store the error on the object and add a log entry. FDB-004.

## Feedback

- Success: a short toast-style overlay that auto-dismisses (not a banner, which FDB-001 keeps for ongoing status); announce it with `AccessibilityNotification.Announcement("Sync settings saved").post()`. FDB-001, FDB-008.
- Lasting conditions: a persistent `Label` with a fix button inside the affected `Section`. FDB-002.
- Undo (no rule yet): if offered, use `UndoManager` from the environment so Cmd-Z works; keep any on-screen Undo visible at least 10 seconds. FDB-009.

## Assistant proposals

- Write the proposed value into `draft`, so the Save button enables, or show an Approve / Decline card. Never write to the saved model. SAV-011, AI-004.
