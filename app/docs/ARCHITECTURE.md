# Queue and cloud contract

```mermaid
sequenceDiagram
    participant UI as RC5 form
    participant Q as Native SQLite
    participant OS as Android WorkManager / iOS URLSession
    participant API as Apps Script adapter
    participant B as Sheet BACKUP
    participant W as Existing recovery worker
    participant P as Sheet PRODUCTION
    UI->>Q: Commit full canonical payload + Request ID + digest
    Q-->>UI: Durable local success
    UI->>OS: Schedule upload
    OS->>API: Authenticated batch, max 10
    API->>B: Store token-free full payload, read back and compare
    API-->>OS: Per-entry CLOUD_RECEIVED + identity + digest
    OS->>Q: Persist receipt; retain full payload
    W->>B: Read pending entries
    W->>P: Save through shared writer, same-ID idempotency
    OS->>API: Retry/poll same immutable payload
    API->>P: Verify exact owner/machine/box/Request ID
    API-->>OS: PRODUCTION_CONFIRMED
    OS->>Q: Persist final status
```

SQLite rows contain immutable Request ID, owner, endpoint, full payloadJson and SHA-256 digest, plus mutable state, attempts, retry time and transfer lease. Endpoint partitioning prevents old test entries being sent to a new server. Reusing an ID with different owner, endpoint or input rejects locally and on the server. A payload digest verifies matching input, not user authentication; sessions/tickets enforce authentication.

Statuses: LOCAL_SAVED → UPLOADING → CLOUD_RECEIVED → PRODUCTION_CONFIRMED. Transient network/protocol failures yield RETRY_PENDING with complete payload retained. Permission/identity/deletion conflicts yield REVIEW_REQUIRED. Receipt state, ID, owner, box, machine and digest must match; HTTP 200 alone, missing results or an opaque response cannot advance a row. Missing/failed rows retry individually. Counts are for the active account+endpoint only; cloudReceived is historical receipt, while productionConfirmed is final verification.

Session tokens live in Android Keystore-encrypted preferences or iOS Keychain (AfterFirstUnlockThisDeviceOnly). They may exist in process memory during foreground login/API calls. They never enter queue payloads, code, export files or logs. Native setSession validates metadata through nativeMe. Logout clears credentials; old owners' queues remain but cannot upload with another user's token. A generation/epoch rejects callbacks after account changes. Background transfers already received by the server before logout can still finish under the original account; logout does not undo a received entry.

Android can obtain credentials from its vault after app process restart, claims at most 10 entries transactionally, reads real JSON receipts and uses network constraints. SQLite leases recover interrupted workers. Work survives app exit/reboot subject to Android policies and eventual connectivity; force-stop/battery restrictions can defer execution until reopening. Periodic work is recovery, not a promise of 15-minute precision.

iOS obtains an expiring upload-only HMAC ticket with the exact owner, IDs and payload digests. The protected, backup-excluded upload file contains that ticket and rows, not login credentials. Background URLSession maintains submitted transfers independent of WebView suspension. Task metadata and file paths are durable SQLite records. Callbacks validate the original session epoch and apply receipts transactionally; interrupted preparations/tasks become retries on resume. Only three transfers are prepared at once, and scheduling further batches may wait for OS time or foreground reentry. Session validation and ticket preparation do not have perpetual background execution privileges. Force-quit/power-off stops phone work.

Once the full payload is durably in BACKUP, the existing server trigger can finish Production while the phone is off. No client can upload phone-only data while powered off. If 200 entries are local but only 130 are cloud-received, the remaining 70 still depend on the phone. App counts make this explicit.

The backend integration diff also parks permanently inactive/deleted/unauthorized recovery rows as REVIEW_REQUIRED and skips those rows on later passes, so they do not monopolize every recovery batch. Admin review can correct the issue and deliberately reset a row to PENDING; never bulk-reset deleted entries. Transient failures remain retryable.

No data is automatically purged in this starter, including final-confirmed payloads. Native SQLite is protected by platform app sandbox/device protection, not SQLCipher. Device loss, uninstall or storage failure still requires an operational backup policy. No production sync SLA is claimed for Apps Script quotas or scheduler timing.
