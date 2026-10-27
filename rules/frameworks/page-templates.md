# Page templates (research Q5, Q11, Q12, Q19)
Nine templates. Wireframes are mine, drawn from patterns that recur across the three reference portals. Numbers in a frame are keys to the line below it. `[inf]` = inferred, not observed. Shell for all: sidebar NAV-*, chrome CHR-*, AI panel LAY-007.
Width: forms/settings use a centred column (LAY-001); index, log and home use full width (LAY-001, LAY-002). Spacing: LAY-006. Phone: LAY-008, HOM-009.
## 1. Home (multi-area product)  HOM-001: a single-queue tool lands on its index (3) instead
```
| Heading + [ search or ask ............ ] (1)              |
| [Fulfill 3 >] [Review 2 >]                 (2)            |
| KPI | KPI | KPI | KPI     [Last 30 days v] [+ metric] (3) |
| Setup: 2 of 5 [Get started] (4)  | Recent / starred (5)   |
```
1 HOM-011  2 HOM-002, NAV-011  3 HOM-003, HOM-004  4 HOM-005, ONB-003, ONB-004; dismiss HOM-006, ONB-008  5 HOM-008. Loading per block HOM-010.
Recommendations: HOM-007 puts them on the object they change, so the home has no recommendations block.
## 2. Index (list)
```
| Title  [docs]            [Export] [Import] [Create X] (1) |
| All | Open 12 | Done | ... (2)                            |
| [View v] [Search orders, SKU...] [Filter] [Columns] (3)   |
| [] Name ^   Status   Date        ...  (4)                 |
| 1-50 of 812   [<] [>]   Rows [50 v]  (5)                  |
```
1 VIS-002, MCP-001, IDX-010, HLP-005  2 IDX-004  3 IDX-001, IDX-002, IDX-003, IDX-005  4 IDX-006, IDX-008, IDX-009, VIS-003, VIS-010  5 IDX-007. Empty: STA-001, IDX-011.
Primary button on each row (one portal prints per row): no rule yet. It is seen in 1 of 3 portals and conflicts with public guidance.
## 3. Detail (object)
```
| < Orders (1)                                   [<][>] (2) |
| #1042  [Paid] [Unfulfilled] (3)  [Edit] [More v] [Fulfil] (4) |
| KPI | KPI | KPI (5)                                        |
| Main ~2/3: sections, actions in section head (6) | Side ~1/3: status, ids [copy] (7) |
| History, newest first (8)                                  |
| Danger zone (9)                                            |
```
1 DET-001  2 DET-002  3 DET-003, DET-004, VIS-003  4 DET-005  5 DET-011  6 LAY-004, DET-006, DET-009  7 DET-010, SET-011  8 DET-008, SAV-008  9 DET-012, SAV-006.
Several equal areas (overview, metrics, logs, settings): use tabs (DET-007) and not the two columns. Portals split on this point.
## 4. Form (create or edit page)
```
| < Parent   New X                                       |
|   [ Section card: fields ] (1)                         |
|   [ Section card: fields ]                             |
| ===== sticky: Unsaved changes  [Discard] [Save] (2) == |
```
1 LAY-001, LAY-005, FDB-003, CTL-*, HLP-001  2 SAV-001, SAV-004, SAV-005.
Polaris splits a form into cards above 5 inputs. This is a doc only, not a rule: no portal evidence for that threshold.
## 5. Settings index  SET-004, SET-006: no card overview page; entry lands on the first page
```
| < Back to app (1) | [Search settings] (2)                |
| Group             | first, most-used settings page (3)   |
|   Page  Page      |                                      |
```
1 SET-004, SET-005  2 SET-012  3 SET-006, SET-007; scope SET-001, SET-009, SET-008 (personal prefs go elsewhere).
## 6. Settings page
```
| Title + one-line description          [docs] (1)          |
| Section title    |  [x] Option A                           |
| Description (2)  |  Unit field [ 30 ] days (3)             |
| Section title    |  Summary row: value      [Edit >] (4)   |
| ===== sticky save bar (5) =====                            |
```
1 HLP-005  2 LAY-003, LAY-005, HLP-001, HLP-002  3 CTL-001, CTL-007, CTL-010  4 SET-010, SAV-003  5 SAV-001; instant toggles SAV-002, CTL-002.
Contradiction: one portal uses a single column with no left annotation. LAY-003 applies only on wide pages.
## 7. Wizard (first-run setup)  [inf] layout
```
| Normal shell. Set up X                                 |
| [Path A: consequence] [Path B] [Path C] (1)            |
| Step 2 of 3 [inf] (2): only what the platform cannot know (3) |
| [Authorise source] -> mapping -> [Test] (4)            |
```
1 ONB-005  2 no rule yet: no portal showed a step indicator (the DHL wizard was not observed)  3 ONB-001, ONB-002  4 ONB-006, INT-004.
Resume halfway: no rule yet. Absent in all 3 portals, and the DHL owner interview is still pending.
## 8. Integration (detail page)
```
| < Integrations  Name  [Connected] (1)  [More v] (2)    |
| Settings | Mapping | Tools | Logs (3)                    |
| Credentials ****  [Reveal][Copy][Rotate] [Test] (4)      |
| Reads/writes: [x] orders [x] write back tracking (5)    |
| Tools card: [Import now] [Clear cache] (6)              |
```
1 INT-003, INT-005, DET-001  2 INT-012  3 DET-007 [inf]: tab names come from one portal  4 INT-010, INT-004  5 INT-008  6 INT-009. Logs INT-006, INT-007. List: INT-001, INT-002. Placement: INT-011.
## 9. Branding (brand page and customer templates)
```
| Brand: used by tracking page, emails (1)               |
| Logo [thumb] PNG/SVG 512px [Replace][Remove] (2)        |
| Primary (buttons) [swatch] [#1A1A1A] (3)  [Reset] (4)   |
| Template editor | rendered preview [inf] (5)  [Send test] (6) |
```
1 BRD-001, BRD-002  2 BRD-008  3 BRD-007  4 BRD-009  5 BRD-003, BRD-011; [inf] a side-by-side preview  6 BRD-004. Message lists: BRD-005, BRD-010. Sender: BRD-006.
