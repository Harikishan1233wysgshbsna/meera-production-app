# Source inspection

Read the real repository copies of RC5 LIVE/index.html, Production Data Sync.gs, cloud.gs, cloud summary.md, ServerRecoveryV2.gs, ServerAutoRecovery.gs and RC5 README, and followed their session, permission, cache, queue, writer, duplicate and recovery helpers. No AGENTS.md was found in the source tree.

- HTML validates selected product/variant, machine, roll type/count, gross/tare/net, then commits and reads back IndexedDB before upload. A first-send claim prevents duplicate first sends across tabs. It uses opaque no-cors POST and subsequent authenticated status polling; the transport response is not proof of saving.
- Backend saveEntry_ authenticates, then meeraSaveEntryWithUser_ verifies machine/identity. It takes ScriptLock, checks deleted records, exact Request ID and Box matches, writes full recovery fields as PENDING to PRODUCTION BACKUP, appends PRODUCTION DATA, reads back Request ID/Box, then marks backup CONFIRMED. Same Request ID is replayed, while different Request IDs with the same Box are real rows marked DUPLICATE.
- Main router does not expose the separate cloud.gs or native routes automatically. Adding an isolated source file does not install/deploy it.
- Existing recovery uses current owner activity/permissions and the same writer; it cannot reach phone-only records. The V2 worker has a 20-row/45-second budget. The default main reconcile installer is a separate five-minute path. Do not install both.
- Header comments and README explicitly state that the GitHub backend is a working candidate, not a verified export of deployed LIVE code.

# App-only changes

Capacitor was chosen because the real RC5 form and validation can be reused, while local custom plugins provide SQLite and native background transfers. Full UI/calculation code is preserved in a sanitized generated JS asset; native adapters replace session persistence, network calls and queue transport. Distinct Request IDs are not suppressed by the old phone-side same-Box gate, so the documented server DUPLICATE policy can apply.

Fixed-PIN backup/export code, the AI local-clear helper and the hardcoded admin diagnostic shortcut are removed, plaintext local session writes are replaced by native secure storage hooks, original Apps Script URLs and Google spreadsheet IDs are stripped. Other business UI is reused but is not fully certified: Microsoft SSO and legacy export/import are explicitly unsupported in the starter. Direct sheet read fallbacks carry no LIVE IDs and cannot be relied on; use the configured backend.

Cached planning/master data is scoped to account and endpoint. Offline saves can use a previously authenticated native session and that account's cached planning. These are provisional local records; the backend always checks current permissions. A first-ever offline login or missing planning data cannot invent assignments.
