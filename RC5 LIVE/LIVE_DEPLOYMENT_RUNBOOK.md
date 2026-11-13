# MEERA RC5 LIVE — Deployment Runbook
Release preparation date: 2026-11-13
Status: PREPARED, NOT DEPLOYED. Google Apps Script runtime tests pending.

## Scope
LIVE Apps Script project:
https://script.google.com/u/0/home/projects/1ghEH5jZFptv8qzjzsCwb0bKNmKXY41Jx2O3iwx4vWFBMs9w5LZBw3Tb0/edit
LIVE production spreadsheet:
https://docs.google.com/spreadsheets/d/1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E/edit

## Deployment safety gates
- Confirm separate backup of LIVE Apps Script project and LIVE Sheet.
- Record the current deployed Web App deployment ID and version; preserve rollback instructions.
- Confirm `Production Data Sync.gs`, `BulkRecovery.gs`, `ServerRecoveryV2.gs` and `DashboardFix.gs` contents are complete and correspond to the actual LIVE project.
- Verify no unexamined source file has the same global function name.
- Current LIVE one-minute trigger previously observed: `meeraServerRecoveryV2Worker`. Do NOT create an additional trigger or run recovery manually.
- Work when no operator is actively saving and preserve outstanding local device queues; avoid losing unsynced entries.
- Store `INITIAL_ADMIN_PASSWORD` securely (never commit actual passwords, session tokens, or keys to a public GitHub repo).

## Files to update in ORIGINAL LIVE Apps Script editor (not backup)
1. `Production Data Sync.gs`: replace existing contents with full RC5 LIVE/Production Data Sync.gs, after saving a rollback copy. Do not create another Code.gs or paste both versions.
2. `BulkRecovery.gs`: replace existing `meeraBulkSyncOldEntries_` with full RC5 LIVE/BulkRecovery.gs.
3. `ServerRecoveryV2.gs`: replace existing V2 worker source with full RC5 LIVE/ServerRecoveryV2.gs; it retains the same function name as the existing trigger.
4. `DashboardFix.gs`: replace existing duplicate daily-dashboard implementation with small companion RC5 LIVE/DashboardFix.gs. The canonical daily-dashboard function remains in `Production Data Sync.gs`.
5. Leave `BulkRecoveryStatus.gs`, `MEERA_READ_ONLY_STATUS.gs`, `ServerAutoRecovery.gs` unchanged if the original LIVE contents match the provided copies.

Do not paste `.txt` historical reference files into Apps Script. Confirm all file names and check for syntax error in the Apps Script editor. Saving Apps Script editor code affects HEAD and scheduled triggers even BEFORE switching the web-app deployment; this is why manual editing is not risk-free.

## Recommended pre-deployment test in separate isolated spreadsheet/project
- New box, new ID -> exactly one PROD row and one backup intent CONFIRMED.
- Duplicate box, new ID -> second PROD row, column M DUPLICATE, separate backup CONFIRMED.
- Retry second ID -> no third PROD row.
- Existing ID with different box/owner/machine -> REVIEW_REQUIRED, no extra PROD row.
- Recover PENDING server backup -> at most one Production row, correct duplicate status.
- Bulk recovery: two distinct IDs for one box in same batch -> second marked DUPLICATE, re-run idempotent.
- Conning/doubler status update -> preexisting DUPLICATE status preserved.
- Dashboard today rows and user authorization stable.
- Measure median/p95 save latency under real volume; global TextFinder can be costly.
- Security checks: read-only audit cannot write; lower privilege cannot see or confirm another owner's ID.

## Deployment and smoke test (only after testing)
1. Prepare a low-activity window and verify local unsynced queues are safely backed up.
2. In ORIGINAL LIVE Apps Script, update the four file contents precisely and save.
3. Inspect Apps Script Executions for new trigger errors immediately; HEAD triggers may already run new code.
4. Open Deploy > Manage deployments > edit the existing Web App deployment > Version: New version > Deploy. Do NOT create a new deployment unless you explicitly intend to change /exec URL.
5. Verify /exec health with expected version, login, one carefully controlled production entry with real supervision, and status check with exact Request ID.
6. Verify PROD column Q ID, B Box, M Status, and BACKUP G CONFIRMED; check trigger logs.
7. Monitor saved counts/failed requests and duplicates. Never automatically bulk replay local queues until each Request ID is reconciled.

## Rollback
- If a save or runtime check fails, immediately halt new saves (coordinate with operators; preserve local queues).
- Restore old source files from the existing LIVE backup *into the original project*, then choose the previous Web App deployment version under Manage deployments.
- Verify trigger executions. Scheduled triggers run HEAD code, so rolling back the Web App alone does not restore trigger code.
- Reconcile all outstanding Request IDs against actual Production and Backup before reopening entry. Never replay blindly.

## Current gaps
- This is a source review, not runtime certification.
- Cannot read or modify user's live Apps Script editor or run live spreadsheet tests through current tools.
- The frontend queue and GitHub Pages HTML have NOT been modified by these server-side changes.
- Treat existing cross-file function-naming and source comparisons as verified only for GitHub files; ensure actual editor has no extras.
