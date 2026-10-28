# Save model: React notes

Stack: Next.js App Router, Tailwind, shadcn/ui, `Form` with react-hook-form and zod, Sonner. Each note cites the rule it implements.

## App root

- Render `<Toaster />` (Sonner) once in `app/layout.tsx`, plus an empty `<div role="status" aria-live="polite" className="sr-only" />` for route and progress announcements. FDB-008.

## Page save bar

```tsx
const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: saved });
const { isDirty, isSubmitting } = form.formState;

<div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background p-4">
  <Button variant="outline" disabled={!isDirty} onClick={() => form.reset(saved)}>Discard</Button>
  <Button type="submit" disabled={!isDirty || isSubmitting}>Save</Button>
</div>
```

- Save and Discard are disabled while the form is clean. SAV-001, SAV-004.
- On success: `form.reset(newValues)` so the form is clean again, then `toast.success('Sync settings saved')`. FDB-001.
- Server validation errors: `form.setError('interval', { message: 'Enter a number from 5 to 60' })`; `FormMessage` shows it under the field. FDB-003.

## Leave guard

- While `isDirty`, add a `beforeunload` listener for tab close and reload. SAV-005.
- App Router has no route-change blocking API. Intercept in-app links in the shell (a context that wraps `Link` clicks and the sidebar) and open an `AlertDialog` "Leave page with unsaved changes?" with "Leave page" (destructive) and "Stay". Never prompt when the form is clean. SAV-005.

## Section Save

- One `useForm` per `Card`, each with its own Save and Discard in the `CardFooter`. SAV-003.
- Single field ("Account name"): show the value and a "Change name" button opening a `Dialog` with one input. Large forms go to a subpage route, not a `Dialog`. SAV-003, FDB-007.

## Instant

- `Switch` calling a server action; local state flips at once, reverts on error. SAV-002.
  ```ts
  setOn(next);
  const res = await setPaused(next);
  if (!res.ok) { setOn(!next); toast.error('Could not pause sync', { action: { label: 'Retry', onClick: () => toggle(next) } }); }
  else toast.success(next ? 'Sync paused' : 'Sync resumed');
  ```

## Destructive

- Separate `Button variant="destructive"` in a danger section at the end of the page, never in the save bar. SAV-006.
- `AlertDialog` with `AlertDialogTitle` "Disconnect warehouse?", `AlertDialogDescription` stating what stops, and `AlertDialogAction` labelled "Disconnect". No dialog opened from inside it. SAV-006, FDB-007.

## Background jobs

- The action enqueues the job and returns at once. Show status text in the card: "Importing 120 of 400. You can leave this page." Poll or subscribe (Supabase Realtime if present) for progress. SAV-009.
- On failure write the error to the object (badge "1 error") and a log row. FDB-004.

## Undo (no rule yet)

- If offered: `toast('Rule deleted', { action: { label: 'Undo', onClick }, duration: 10000 })`. Sonner pauses on hover and has a hotkey (`<Toaster hotkey={['altKey','KeyT']} />`); name it in the region label. FDB-009.

## Assistant proposals

- The assistant calls `form.setValue('interval', 15, { shouldDirty: true })`; the save bar wakes and the user saves. Or render a `Card` with the diff and "Approve" / "Decline". SAV-011, AI-004.

## Persistent conditions

- Expired token or missing plan: an `Alert` inside the affected card with the fix button, rendered on every visit, not a toast. FDB-002.
