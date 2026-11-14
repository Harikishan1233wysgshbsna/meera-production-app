# Read-only source inspection

GitHub source baseline: commit `42cea6dd527b7f45881508661338cac0db45da1c` (V112.1 hotfix). Work was isolated in the new `Admin plug/` folder. RC5 queue/save files and the native app project were not edited.

The two uploaded PDFs were extracted and searched as historical conversation/code references. Their embedded instructions were not treated as the user's current request. Current source routing and live workbook metadata, not PDF instructions, determine the proposed integration.

## Verified workbook structures

| Source role | Inspected workbook / tab | Finding |
|---|---|---|
| Main Conning candidate | Material Movement Data Sheet / `CONNING PRO.` | Row 1 title, row 2 headers. Date B, machine D, employee F, colour G, net J, repeated employee total K, shade N. Inspected rows have no customer Order No. |
| Covering stage | Same Movement workbook / `7. Covering Prod.` | Header row 1. Date B, box D, covering machine I, production product-code L, shade M, gross S, tare T, net U, unit V. Different physical stage from Conning. |
| Product master | Same Movement workbook / `PRODUCTION NO.` and `Master Sheet` | MMT codes map products/materials. These are product references, not automatically customer orders. Some aliases can be ambiguous. |
| RC5 entries | RM Calculator workbook / `PRODUCTION DATA` | DATE, BOX NUMBER, M/C NO, PRODUCT NAME, NET WEIGHT, STATUS, Unit, Entered By, REQUEST ID. |
| Server queue | Same RC5 workbook / `PRODUCTION BACKUP` | Request identity, user, status and full payload fields. Only entries that reached the server are visible. |
| Order candidate | `ORDER BOOK` / `ORDER` | Sales Order ID, Production Order No, Shade/Product No, ordered kg, covering-produced qty and dispatched qty. Existing reported covering qty is not silently treated as final Conning production. |
| Other order candidates | `ORDER TRACKING` and `PRODUCTION PLANNING` | Different planning/master structures. Exact Joshi source remains unconfirmed. One tab has the exact name `MASTER SHEET ` including a trailing space. |
| WhatsApp evidence | Meera Metyarns Ground Force export | Dated text through 8 May 2026; omitted media and deleted messages exist. Historical closure statements are claims, not current verified completion. |

`7. Conning prod` was absent from Movement metadata. No automatic source substitution is made. A clarification was requested; the dashboard allows explicit selection without claiming an unconfirmed source is correct.

Live inspection used metadata, bounded header/sample ranges and small sentinel reads, not a complete production scan. Empty ranges near allocated grid tails do not prove that the whole source is empty. The private sample is explicitly incomplete. No comprehensive full-day or order completion total is claimed from these reads.

No raw rows, phone numbers, staff messages, private snapshot, spreadsheet identifiers or session credentials from connected sources are bundled into public assets. The public demo uses fictional records. Optional private audit artifacts remain outside the Git repository and can be loaded locally by the user.

## Data rules

- Sum row-level Net Weight, not repeated TOTAL WAIGHT.
- Keep Conning, Covering and RC5 records separate.
- Preserve full product specification and S/Z identity.
- Require explicit order identity or a reasoned admin allocation; never fan one product total out to multiple orders.
- Skip repeated Request IDs from trusted sums and flag them; different Request IDs for the same Box remain separate records subject to review.
- Keep stage gaps, measurement discrepancies and confirmed physical losses conceptually separate.
- Associate chat text with its sender and timestamp without assuming the sender caused the problem or is the assigned owner.
- Hash source-row content and chat identity so changed rows or prepended messages cannot silently reuse stale admin decisions.
