# RC5 LIVE — Production App Working Copy

This is a **separate working copy** inside the existing GitHub repository. The folder is named **RC5 LIVE** (with a space), while the original repository name and GitHub Pages root are left unchanged.

## Files

| File | Source | Status |
| --- | --- | --- |
| `Production Data Sync.gs` | Uploaded `Pasted text(20261113-052306).txt` (user-provided Apps Script source, 13 Nov 2026) | **V101 LIVE-CONFIGURED CANDIDATE — not verified against the currently deployed Apps Script source and not deployed** |
| `index.html` | Copied from the repository root `index.html` on 13 Nov 2026 | Exact HTML working snapshot; its existing configured backend link is **not disconnected** |

## Source / deployment warnings

- The Apps Script file is **not certified as a current LIVE export**. Its header expressly says `NOT VERIFIED OR DEPLOYED`.
- This single source contains much more than Production Entry, including login/session, users, conning/tracking and recovery logic. Do not paste it over your live Apps Script without examining other existing `.gs` files for duplicate global functions and conflicts.
- The HTML still uses the same configured Apps Script endpoint as the original HTML. **Opening this separate copy and saving real entries could still write to the LIVE Sheet.** It is **not an isolated TEST environment**.
- A GitHub commit does not deploy Google Apps Script. This folder changes neither the current running Apps Script source nor the LIVE Google Sheet.
- This repository is **PUBLIC**. Do not add credentials, session tokens, password hashes, private keys, personal data or secrets. Prefer a private repository for complete server code and keep the deployed source under separate access controls.
- Keep changes confined to this folder until they pass review and testing.

## Linked Google Sheet

[Meera Met Yarns: RM Calculator](https://docs.google.com/spreadsheets/d/1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E/edit)

## Next step

Compare the uploaded `Production Data Sync.gs` against the **actual current** LIVE editor file, then stage changes in a test Apps Script project before any deployment.


## RC5 duplicate-box save policy (2026-11-13)

**GitHub working copy only; NOT installed in LIVE Apps Script / Web App.**

Updated files in this folder:

- `Production Data Sync.gs`: distinct Request IDs for the same Box are accepted; newly saved repeated Box gets **PRODUCTION DATA column M (STATUS) = DUPLICATE**. A replay of an existing Request ID is verified, not appended twice. Existing DUPLICATE status is preserved by the status sync helper.
- `BulkRecovery.gs`: same Box may be recovered with a new Request ID and is marked DUPLICATE; repeated Request ID is not appended, and old admin-deleted requests are not automatically resurrected. Source was based on the earlier provided V103.2 bulk recovery, and **must be compared to the current LIVE BulkRecovery.gs** before replacing.
- `ServerRecoveryV2.gs`: preserves the existing worker name `meeraServerRecoveryV2Worker`, and now delegates pending recovery to the shared `meeraReconcileAllPending` save engine. This avoids separate conflicting writes. The existing LIVE one-minute trigger can keep the same handler name after a successful code deployment.

**Do not paste these files into the Apps Script backup project.** Make changes only in the original bound LIVE project after making both script and spreadsheet backups. For each file, replace the matching function definition, do not add a second copy of a function. Check `BulkRecovery.gs`, `ServerRecoveryV2.gs`, `DashboardFix.gs` and other .gs files for duplicate global definitions before saving. Main script syntax was checked, but Google Apps Script / production end-to-end tests have NOT been run.

Suggested controlled verification: simulate one new Box, a second Request ID for that Box (expect second row STATUS DUPLICATE), repeat that same ID (expect no additional row), and run one recovery with a server-side PENDING backup entry. Compare the exact Request IDs and row counts in Production and Backup. Check an existing DUPLICATE row remains DUPLICATE after any Conning-status refresh.

**Important:** A Code change in Apps Script is not the same as changing the deployed production web app version. Update the existing Web App Deployment version once verification succeeds. No new trigger is needed: one `meeraServerRecoveryV2Worker` trigger was previously observed active. Avoid installing a second reconcile trigger. The frontend offline queue is separate and unaffected.
