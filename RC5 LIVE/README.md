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
