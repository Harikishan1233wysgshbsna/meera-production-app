# RC5 LIVE — Function Conflict Audit & Deployment Checklist
Date: 2026-11-13

## Verified against the GitHub working-copy source
- Seven .gs source files parsed individually and together with JavaScript parser: PASS.
- 216 distinct top-level declared function names; no duplicate top-level names across these seven .gs files.
- Main `Production Data Sync.gs` owns `meeraV102UnitTodayEntries_` and route cases `bulkSyncOldEntries`, `bulkRecoveryStatus`.
- `DashboardFix.gs` owns only `testDashboardFix`; full prior dashboard is archived in `DashboardFix-LIVE-REFERENCE.txt`.
- `ServerRecoveryV2.gs` owns `meeraServerRecoveryV2Worker`.
- `ServerAutoRecovery.gs` installs a trigger by the same V2 worker name; previously observed LIVE trigger exists (one minute). DO NOT install another trigger.
- All verified files in this audit are GitHub sources only. No LIVE edit, deployment, trigger action, or end-to-end Sheets test has happened.

## Original LIVE Apps Script file updates to prepare (not yet executed)
1. `Production Data Sync.gs`: replace the current content with the RC5 working-copy content only AFTER assessing entire project source, save a rollback copy, and perform controlled tests.
2. `BulkRecovery.gs`: replace CURRENT LIVE implementation of `meeraBulkSyncOldEntries_` rather than adding a duplicate.
3. `ServerRecoveryV2.gs`: replace CURRENT LIVE `meeraServerRecoveryV2Worker`. Existing trigger name remains unchanged.
4. `DashboardFix.gs`: replace with RC5 companion (or remove original duplicate `meeraV102UnitTodayEntries_` definition).
5. `BulkRecoveryStatus.gs`: preserve the current LIVE function if identical to supplied V103.3 source; avoid adding a second copy.
6. `MEERA_READ_ONLY_STATUS.gs`: original read-only audit can remain as-is.
7. `ServerAutoRecovery.gs`: original LIVE installer can remain as-is; no new trigger installation.

## Test cases that MUST pass before LIVE deployment
- New box + new Request ID: exactly one Production row, backup CONFIRMED, normal status.
- Same box + different Request ID: second Production row with STATUS=DUPLICATE, backup CONFIRMED.
- Retry same Request ID: NO third Production row.
- Recovery of server-side PENDING backup: inserts at most one row, validates owner and machine, and marks duplicate boxes.
- Existing DUPLICATE row survives conning/doubler status updates.
- Admin-deleted Request ID does not auto-resurrect; review legacy tombstones with only box and no ID.
- Dashboard today view and user/unit authorization continue to function.
- Verify current deployed Web App /exec keeps working when editing the existing deployment to a NEW VERSION.

## Important unfinished checks
- Runtime tests with Google Apps Script SpreadsheetApp, triggers, and concurrent users have NOT been executed.
- Whole-column TextFinder may slow interactive saves as the dataset grows.
- Current project may contain other previously unknown or unshared scripts and functions; compare against LIVE editor before applying.
- Offline mobile queue belongs to HTML, not solely this backend.
- Deployed version differs from editor HEAD; saving code will not switch existing /exec deployment until updated.

## Safety
Do not paste source into backup project; use the original LIVE Apps Script only after backups and tests. Do not run meeraServerRecoveryV2Worker manually for testing against LIVE data. Do not install a second recovery trigger. Never paste archived reference .txt files as runnable .gs code.
