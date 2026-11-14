# Verification

- Node model/API/DOM-simulation tests: 23 passed.
- Static production build: succeeded; local bundle includes the XLSX reader and SVG charts with no CDN dependency.
- Backend source parses as JavaScript. Integration patch checks against the inspected GitHub baseline; it has not been applied to or deployed in LIVE Apps Script.
- Tests include exact header handling, Net Weight vs repeated totals, S/Z separation, duplicate-ID exclusion, order ambiguity, explicit/full-source completion, period-vs-lifecycle quantities, master alias resolution, stable chat/row identities, omitted media, formula-safe CSV and server authorization before reads.
- API simulation checks exact-tab failure, bounded page cursors/source row numbers and refusal to write annotations into a production/order workbook.
- DOM simulation checks entry gate, fictional demo, navigation, production check module and daily report controls. It is not real-browser or device verification.

The managed environment required `cua_repl.js` for browser QA, but that route was unavailable. No alternative preview server/browser automation was started. Visual layout, actual iOS Safari/desktop rendering, print pagination, real XLSX import files and physical-device downloads still need manual review.

Live Apps Script deployment, admin scopes/session lifecycle, Google redirect/JSONP behavior, full-source scan performance/quotas, annotations write/read-back and actual private-control-sheet initialization remain unverified. The exact Joshi order workbook and the requested main tab need confirmation. No source Sheet write or external notification was performed.

Before rollout: authenticate admin and non-admin separately; load a small isolated source, then a complete source; pause/resume scanning; verify unmatched orders remain unresolved; compare manual totals; test changed rows, missing dates, negative weights, duplicate IDs and same-box/different-ID records; import a real WhatsApp export with missing media; verify a closure claim requires admin review; print a date-bounded daily report on iOS and PC; confirm logout/idle-lock clears in-memory data.
