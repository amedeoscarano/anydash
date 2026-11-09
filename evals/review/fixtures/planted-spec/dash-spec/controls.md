# Controls

## Controls

| Page | Field | Control | Help text | Source |
|---|---|---|---|---|
| Settings > General | Store name | Text input, max 60 characters | none (self-explanatory) | brief |
| Settings > General | Contact email | Email input | none (self-explanatory) | brief |
| Settings > General | Store currency | Select (USD, EUR, GBP) | Tooltip on an info icon: "Changing the currency recalculates the totals of all open draft orders." No visible description. | brief |
| Settings > General | Archive orders after delivery | Switch | "Delivered orders leave the Open list after 7 days." | brief, assumed |
| Settings > General | Print packing slip with each label | Checkbox | "Adds a packing slip page to every label PDF." | brief, assumed |

## Save model

Settings > General has one form with a sticky save bar, Save and Discard, disabled until a change (SAV-001). Discard restores the last saved values (SAV-004). Leaving with unsaved changes asks first (SAV-005). All fields on the page, including "Archive orders after delivery", are committed by Save.

## Help text

Descriptions sit under their control and are linked with aria-describedby (HLP-009).

## Copy

Buttons are verb plus object, sentence case (MCP-001, MCP-002): `Connect carrier`, `Create label`, `Edit order`, `Delete order`.
