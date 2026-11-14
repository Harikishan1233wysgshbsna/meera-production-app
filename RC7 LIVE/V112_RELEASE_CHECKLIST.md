# RC7 V112 release gate — DO NOT DEPLOY UNTIL VERIFIED

Date: 2026-11-14. This is a **candidate branch**, not LIVE. LIVE Web App remains deployed @111 until explicit rollout.

## Observed behavior
- A205 was reported saved to PRODUCTION DATA. Its HTML queue previously showed NOT_FOUND, so a sheet row **by Box alone** is not proof of an exact Request ID confirmation.
- Browser local queues and existing unresolved entries must be preserved. Do not clear IndexedDB, force requeue old IDs, or manually replay backups.

## Desired behavior
- Keep exact Request ID as a **global idempotency key**, even if entry date changes.
- Authenticate users; protect confirmation of another operator's entry.
- Verify existing production entry by **Request ID Q + Box B**, without requiring Machine comparison for confirmation.
- Compare Box duplicates **only within the same production date**; a *different* Request ID for the same date/Box appends a row with Production STATUS DUPLICATE.
- Do not block different Request IDs at the HTML local queue based on Box alone.
- New saves go directly to PRODUCTION DATA; PRODUCTION BACKUP remains intact for historical recovery.
- Confirm only when actual row identity matches; never convert NOT_FOUND to CONFIRMED by Box alone.

## Before release — mandatory
1. Download BOTH candidate files from this branch, not the `main` branch:
   - `RC7 LIVE/Production Data Sync.gs` -> local clasp staging `Production Data Sync.js`.
   - `index.html` -> HTML staging, then publish frontend only after backend testing.
2. Run `node --check "Production Data Sync.js"` and extract the HTML JavaScript for syntax checking or test in the browser console.
3. Verify the staging folder points at the intended Apps Script ID and contains only `Production Data Sync.js` + `appsscript.json` (plus untracked `.clasp.json`).
4. Review duplicate-date matching with Google Sheet's real date storage (Date objects vs text), especially across months/timezones; verify machine and owner authorization requirements.
5. Confirm A205's *exact* Q Request ID matches the local queue ID. Do not assume Box equality.
6. Run controlled read-only Request ID verification and save/retry/duplicate/date test cases before accepting the system.
7. Operators stopped; recovery trigger deliberately disabled. No auto-replay of old backup rows.
8. Save a new Apps Script immutable version only after successful checks; update the **existing** deployment ID to preserve HTML endpoint, then separately deploy HTML.
9. Verify end-to-end: new real entry -> Q/B matching -> HTML SAVED -> no stranded pending; same request retry -> 1 row; same-day same Box with different ID -> separate DUPLICATE row; next-day same Box -> not marked duplicate.
10. Re-enable one appropriate recovery trigger only after reviewing existing pending history and its write behavior.

### Safety / rollback
Private original V110 source backup exists separately. V111 remains a prior immutable Apps Script version. Updating source HEAD or HTML separately can create mismatched behavior. Never erase unresolved operator queue records.
