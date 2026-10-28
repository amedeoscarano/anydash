# Recording format (schema 1)

A recording is one folder written by `scripts/record.mjs`:

```
<outdir>/
  meta.json        one JSON object, written last
  events.ndjson    one JSON object per line, user and page events
  network.ndjson   one JSON object per line, one finished (or failed, or unfinished) request
  video/*.webm     Playwright video, one file per tab
  trace.zip        Playwright trace (screenshots + DOM snapshots + network log)
```

Code against this file. Any change to a field bumps `meta.schema`.

## Clock

- `meta.startMs` is the epoch ms taken just before Chrome launched. Video recording starts with the first page, so video time 0 is within a few hundred ms after `startMs`.
- Every `t` (events) and `start`/`end` (network) is **ms since `meta.startMs`**, an integer.
- Page events are stamped in the page with `Date.now()`, node events (`navigation`, `script_step`, `native_dialog`) in node. Same machine clock, so they interleave correctly; lines in the file are in arrival order, so sort by `t` before analysis.
- Mutation-based events (`mutations`, `dialog_open`, `dialog_close`, `validation`) are emitted at the end of a 250 ms window, so they lag the change by up to 250 ms.

## Privacy guarantees

- No input value is ever written to the NDJSON files: text fields give `field` (label) and `length` only (password fields always `length: 0`); checkboxes and radios give `checked`; selects give `selectedIndex`.
- The `name` of a text field, select or contenteditable is its label (aria-label, aria-labelledby, `<label>`, placeholder, name attribute, id), never its content.
- Navigation URLs drop the user:password part and the values of query (and `#...?` fragment) params whose name matches `/token|key|secret|session|passw|pwd|email|auth|code|otp|sig|jwt|credential/i`; the name stays with an empty value (`?token=`).
- Network lines carry `host` and `path` only. The query string is dropped whole. No headers, no bodies.
- Native `alert`/`confirm`/`prompt` text is not logged (only its type), and the dialog is dismissed. `role=alert` text is not logged either (only counts, see `validation`).
- URLs quoted in `meta.error` are scrubbed the same way as navigation URLs.
- **`video/*.webm` and `trace.zip` are not masked**: they show the screen, typed values and request data. They never leave the machine; delete them after analysis.

## Shared shapes

`Target` (an element):

```json
{"tag": "button", "role": "button", "name": "Save", "selector": "form#settings > button.primary"}
```

- `tag`: lowercase tag name.
- `role`: explicit `role` attribute, else the implicit role for a, button, input, select, textarea, summary, option, dialog; else `null`.
- `name`: accessible-ish name, whitespace collapsed, max 80 chars. Fields use their label (see privacy).
- `selector`: CSS path of up to 4 levels, stopping at the first ancestor with an id; `:nth-of-type()` added when siblings share the tag. Good enough to group clicks, not guaranteed unique.

Every events line has `t` (int), `tab` (int, 0 = first tab, in order of opening) and `type` (string).

## events.ndjson

One example line per type.

### navigation
Main-frame navigation, including history API (SPA) route changes and back/forward. Written by node.
```json
{"t":13960,"tab":0,"type":"navigation","url":"http://127.0.0.1:3198/page2.html?token=&tab=2"}
```

### click
Any mouse click (capture phase). `target` is the element hit; `control` is the nearest interactive ancestor (button, link, checkbox, radio, switch, tab, menuitem*, option, combobox, textbox, searchbox, slider, spinbutton, treeitem, the control of a `<label>`, or a contenteditable), or `null` when the click landed on nothing interactive (a dead-click candidate). `x`, `y` are viewport CSS px. `button`: 0 left, 1 middle, 2 right.
```json
{"t":9513,"tab":0,"type":"click","x":58,"y":111,"button":0,"target":{"tag":"span","role":null,"name":"Package weight","selector":"body > span.plain"},"control":null}
```

### move
Pointer position, sampled at most every 100 ms. Viewport CSS px.
```json
{"t":2510,"tab":0,"type":"move","x":10,"y":8}
```

### scroll
Throttled to one line per 200 ms, plus a trailing line with the final position. `target` is `"window"` or the scrolled element's selector; `x`, `y` are scrollLeft/scrollTop in px.
```json
{"t":4782,"tab":0,"type":"scroll","target":"window","x":0,"y":640}
```

### focus / blur
Element gaining or losing focus (focusin/focusout).
```json
{"t":2866,"tab":0,"type":"focus","target":{"tag":"input","role":"textbox","name":"Email","selector":"input#em"}}
{"t":6146,"tab":0,"type":"blur","target":{"tag":"input","role":"textbox","name":"Email","selector":"input#em"}}
```

### input
Each `input` event on a text field, textarea or contenteditable. `length` is the value length after the event (a drop means deletion). `inputType` is the DOM InputEvent type (`insertText`, `deleteContentBackward`, `insertFromPaste`...) or `null`.
```json
{"t":2896,"tab":0,"type":"input","field":"Email","length":1,"inputType":"insertText","selector":"input#em"}
```

### change
Checkbox, radio or select change. Checkbox/radio carry `checked`; select carries `selectedIndex` instead.
```json
{"t":20114,"tab":0,"type":"change","field":"Archive fulfilled orders","checked":true,"selector":"input#archive"}
{"t":21877,"tab":0,"type":"change","field":"Weight unit","selectedIndex":1,"selector":"select#unit"}
```

### submit
A form submit event. `name` is the form's aria-label, name or id (may be `""`).
```json
{"t":24310,"tab":0,"type":"submit","name":"package-defaults","selector":"form#package-defaults"}
```

### key
keydown for Enter, Escape, Tab and Backspace only. `target` is the focused element or `null` (body).
```json
{"t":7697,"tab":0,"type":"key","key":"Backspace","shift":false,"target":{"tag":"input","role":"textbox","name":"Password","selector":"input#pw"}}
```

### mutations
DOM mutation heartbeat: number of MutationObserver records (childList, attributes, characterData, whole document) in one 250 ms window. Only windows with at least one mutation are written; **no line means no DOM change** in that window.
```json
{"t":1909,"tab":0,"type":"mutations","count":36}
```

### dialog_open / dialog_close
A visible `[role=dialog]`, `[role=alertdialog]` or `dialog[open]` appeared or went away (checked once per mutation window).
```json
{"t":11909,"tab":0,"type":"dialog_open","target":{"tag":"div","role":"dialog","name":"Confirm","selector":"div#dlg"}}
{"t":12909,"tab":0,"type":"dialog_close","target":{"tag":"div","role":"dialog","name":"Confirm","selector":"div#dlg"}}
```

### validation
Checked once per mutation window. Written when the number of visible `[aria-invalid=true]` elements or of visible, non-empty `[role=alert]` elements went up. `invalid` and `alerts` are the new counts; `fields` holds the labels of up to 5 invalid fields. The alert text is never logged.
```json
{"t":24730,"tab":0,"type":"validation","invalid":1,"alerts":0,"fields":["Default package weight"]}
```

### native_dialog
A native `alert`, `confirm`, `prompt` or `beforeunload` dialog. Written by node; the dialog is dismissed. No text.
```json
{"t":30502,"tab":0,"type":"native_dialog","dialogType":"confirm"}
```

### script_step
Only in `--script` mode: written just before step `i` of steps.json runs (after a fixed 700 ms think time). `action` is the step key. The step value is never logged.
```json
{"t":2418,"tab":0,"type":"script_step","i":0,"action":"fill"}
```

## network.ndjson

One line per request, written when it finishes or fails. Requests still pending when the recording stops are written at the end with `end`, `ms` and `status` set to `null`.

| Field | Type | Meaning |
|---|---|---|
| `id` | int | 1-based, in order of request start |
| `tab` | int | tab index (pending-at-stop lines use 0) |
| `start`, `end` | int, int or null | ms since `meta.startMs` |
| `ms` | int or null | `end - start` |
| `method` | string | HTTP method |
| `type` | string | Playwright resource type: document, fetch, xhr, script, stylesheet, image, font, ... |
| `status` | int or null | HTTP status; `null` when failed or unfinished |
| `failed` | bool | network error or abort |
| `host`, `path` | string | URL host (with port) and path; query and fragment dropped |

```json
{"id":2,"tab":0,"start":1704,"end":1740,"ms":36,"method":"GET","type":"fetch","status":200,"failed":false,"host":"127.0.0.1:3198","path":"/data.json"}
```

## meta.json

Written once, after Chrome closed (so its presence means the recording is complete).

```json
{
  "schema": 1,
  "version": "0.2.0",
  "mode": "script",
  "url": "http://127.0.0.1:3198/",
  "start": "2026-10-28T10:12:52.580Z",
  "startMs": 1793182372580,
  "end": "2026-10-28T10:13:10.598Z",
  "endMs": 1793182390598,
  "durationMs": 18018,
  "viewport": { "width": 1440, "height": 900 },
  "success": { "condition": "url:page2", "kind": "url", "matched": true, "t": 2286 },
  "stopReason": "success",
  "error": null,
  "video": ["video/page@<hash>.webm"],
  "trace": "trace.zip"
}
```

| Field | Values |
|---|---|
| `schema` | format version of this document (1) |
| `version` | recorder version |
| `mode` | `own-app` (human on an allowed host), `script` (`--script`), `readonly` (human on a third-party host) |
| `url` | start URL, scrubbed like navigation URLs |
| `viewport` | final viewport of the first tab, CSS px |
| `success` | `null` without `--success`; else `condition` as given, `kind` `url` or `selector`, `matched` bool, `t` ms of the match or `null` |
| `stopReason` | `enter` (human pressed Enter), `success`, `script-done`, `script-error`, `closed` (browser closed), `signal` (Ctrl-C), `left-allowed-hosts` |
| `error` | message for `script-error`, else `null` |
| `video` | relative paths of the webm files, sorted; empty after analysis deleted them |
| `trace` | `"trace.zip"` or `null` |
