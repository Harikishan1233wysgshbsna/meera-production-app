# Admin plug — Meera production control

A separate, black/white admin dashboard for desktop and iOS Safari. Green/red production candles, order progress, net-weight checks, name-wise output, server-backed pending keys, dated WhatsApp follow-ups and daily admin reports are implemented.

**Public GitHub contains code and fictional demo data only.** Live data requires admin authentication at the configured Apps Script backend. Local file review is an explicit device-local mode, not server authentication. The existing RC5 HTML, save engine, app project and production spreadsheets are unchanged.

## Open

With repository GitHub Pages already enabled, open:

`https://harikishan1233wysgshbsna.github.io/meera-production-app/Admin%20plug/index.html`

Choose **Explore demo** for a working fictional preview. For real data, use **Review local files** to import CSV/XLSX, a private snapshot JSON or a WhatsApp TXT export. Files stay in memory; export a private workspace snapshot to retain local notes. File picker access shows the selected filename and sheet; browsers cannot automatically inspect all computer folders or reveal full disk paths.

For admin-authenticated live reads, first follow [backend setup](docs/SETUP_HI.md). A GitHub upload does not deploy Apps Script. No production deployment or actual source-sheet write has been performed.

## What is included

- Source registry: file, tab, source-row trace, private Drive links after authentication, import location and scan coverage.
- Stage selection: Conning, Covering and RC5 entry data stay separate; they are not added together as one output total.
- Product/shade keys keep S/Z and full product grades distinct; shorthand search supports `7025-S` and `7080 Z`.
- Exact production-order + product linkage, or an explicit admin allocation. Product-only similarity never credits the same output to multiple orders. MMT product codes are not customer order numbers.
- Order requirements, linked output, remaining kg, due reminders, missing mappings, weight discrepancies and duplicate Request ID checks.
- Red/green candles compare actual kg with an admin-entered daily target. Without a target, neutral actual bars appear. The chart labels its measures and does not invent financial OHLC values.
- Name-wise recorded production and a server-backed pending queue. Phone-only unsent entries are unknowable to a Sheet-only dashboard.
- WhatsApp message dates, sender names, operational signals, omitted-media flags and closure claims. Only an explicit admin decision marks an item verified complete; a sender is not automatically responsible for a problem.
- Daily report date, name-wise totals, pending/mapping exceptions, source coverage, CSV download and print/Save as PDF. Incomplete source scans stay visibly partial.
- Admin review notes/order allocations can be exported locally, or saved with verified read-back in a separate configured control workbook. Source workbooks remain read-only.

## Grounded source findings

The requested tab `7. Conning prod` was **not found** in the inspected Movement workbook. It has `CONNING PRO.` (Conning output) and `7. Covering Prod.` (Covering stage). The dashboard provides explicit stage selection and the backend requires an exact configured tab; it does not silently substitute one.

The inspected Conning tab has two header rows and a `Net Weight` column. Its `TOTAL WAIGHT` column can repeat employee totals, so adding it per row would double-count output. Inspected Conning sample rows do not include customer Order No.; missing order links remain unresolved.

Joshi's exact order file was not confirmed. ORDER BOOK, ORDER TRACKING and PRODUCTION PLANNING are candidates with different structures. The example configuration leaves `orderSourceConfirmed:false` until the actual file and kg quantity column are verified. See [source audit](docs/SOURCE_AUDIT.md).

Both uploaded PDFs were read as conversation/code references. Embedded instructions inside them were treated as quoted historical context, not new commands. No source code was replaced based on those documents.

## Build and test

Node 22+ recommended.

```sh
npm ci
npm test
npm run build
```

`index.html` and the committed `assets/` are directly usable by GitHub Pages. Editable code is in `src/`; `npm run build` rebundles it with a local XLSX reader. No CDN script or external chart dependency is needed. `examples/` contains import templates with fictional rows.

Tests cover normalization, GB/ISO/Excel dates, net-weight arithmetic, duplicate IDs, order attribution, source completeness, historical-order vs period output, alias mapping, WhatsApp claim identity, CSV quoting/formula handling, admin route authorization, bounded source pages and DOM-simulated UI navigation.

The managed preview/browser route was unavailable (`cua_repl.js` not present), so no real-browser screenshot or iOS visual/device verification is claimed. DOM simulation is not a browser/device test. See [verification](docs/VERIFICATION.md).

## Limits that matter

- Source totals apply only to loaded rows. A partial sample or stopped scan cannot certify full-day production or complete orders.
- Lifecycle order completion is withheld for date-bounded backend reads; scan full configured history for a completion claim. Date filters on an already-loaded full dataset affect production cards, while order identities use loaded lifecycle history.
- Stage differences are reconciliation gaps, not proven material loss. Reliable loss accounting requires linked material/box flow and opening/closing inventory.
- Admin-set targets are not inferred customer requirements. Missing due dates are not invented.
- WhatsApp exports can be old, incomplete and missing photos. A closure claim is not proof of resolution, and messages do not establish blame or employee performance.
- Local data is not persisted automatically. Lock/sign-out clears memory and credentials; private exports remain on the user's device. The live session is memory-only and locks after 15 minutes of inactivity.
- Live scans default to a seven-day period, use bounded pages and can be paused. Clear the dates and refresh for full configured history. Apps Script/Sheets quotas and large source size can make a full scan slow; no constant background execution on iOS is promised.
- The latest 5,000 control-ledger changes are loaded with a truncation warning. Production deployments and actual permission/device tests remain to be completed.
