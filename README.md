# RC5 LIVE — MEERA Production App

**Project display name:** RC5 LIVE  
**Production workbook:** [Meera Met Yarns: RM Calculator](https://docs.google.com/spreadsheets/d/1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E/edit)  
**GitHub repository:** `Harikishan1233wysgshbsna/meera-production-app`  
**Current Git branch:** `main`

> **SOURCE AUDIT — 13 November 2026:** This GitHub repository is **NOT** a complete, verified export of the LIVE Google Apps Script project. GitHub Pages HTML, LIVE Apps Script source, and the deployed Apps Script version are three different things. Do not treat this repository as a guaranteed LIVE server backup.

## Current GitHub files

| GitHub path | Actual role | Source provenance |
| --- | --- | --- |
| `index.html` | Production entry web interface | GitHub copy of MEERA HTML; connected to an Apps Script endpoint, but not proof of the full server source |
| `server/MEERA_MONITOR_V1.gs` | Optional admin monitor **add-on/template** | Created separately for GitHub; **NOT verified to be copied from a file in the LIVE Apps Script editor**; not automatically deployed |
| `server/ADMIN_MONITOR_SETUP.md` | Integration instructions for the monitor | GitHub documentation, not a LIVE `.gs` file |
| `studio/index.html` | Separate studio page | GitHub-only page |
| `studio/README.md` | Studio documentation | GitHub-only documentation |
| `video-studio.html` | Separate video studio | GitHub-only page |

## Apps Script file inventory reported in the LIVE editor screenshot

**Workbook:** `Meera Met Yarns: RM Calculator`

| LIVE Apps Script editor name | Exact corresponding source verified in this GitHub repo? |
| --- | --- |
| `appsscript.json` | **No** |
| `Production Data Sync.gs` | **No** |
| `MEERA_READ_ONLY_STAT...` (screenshot truncates the full name) | **No** |
| `DashboardFix.gs` | **No** |
| `BulkRecovery.gs` | **No** |
| `BulkRecoveryStatus.gs` | **No** |
| `ServerAutoRecovery.gs` | **No** |
| `ServerRecoveryV2.gs` | **No** |

**IMPORTANT:** “No” means no exact counterpart exists or is source-verified in the current GitHub tree. It **does not** mean the LIVE Apps Script file is missing, broken, or empty. GitHub cannot infer the contents of these editor files from the screenshot or from a Google Sheet's data.

### Naming policy

- Keep the original, exact Apps Script filename when its code is actually exported to GitHub; preserve spaces, capitalization, and the `.gs` extension.
- **Do not rename** `MEERA_MONITOR_V1.gs` to `Production Data Sync.gs`, `DashboardFix.gs`, etc.: those files are not verified to have the same code or purpose.
- Do not manufacture empty `.gs` placeholders and claim that the LIVE source has been backed up.
- The full name of `MEERA_READ_ONLY_STAT...` must come from the Apps Script editor itself; the screenshot alone cannot establish its suffix.
- `appsscript.json` is the Apps Script manifest; it should be imported as the actual manifest, not hand-invented.
- A connected Google Sheet can confirm data, but it cannot by itself establish the exact source of the Apps Script project's files.
- Before replacing any LIVE code, compare/export the complete bound script and test against a separate TEST copy. Do not deploy a GitHub change automatically to production.

## To complete RC5 LIVE source synchronization

Export the **actual bound Apps Script project** (all `.gs`, HTML and `appsscript.json`) via Apps Script/CLASP or upload the individual complete source files. After source is available, compare file contents with GitHub, preserve each original editor filename, put verified server files in `server/`, and document the deployment version. Keep GitHub HTML and LIVE saving logic unchanged until tested.

## Operational note

Changes to `main/index.html` may affect the GitHub Pages front end. Adding source files to GitHub **does not** change the running Google Apps Script project or deployment unless an explicit, verified deployment process is configured.
