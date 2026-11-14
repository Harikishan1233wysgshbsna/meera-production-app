# Verification record — 2026-11-14 UTC

## Executed locally

- `npm test`: 15 tests passed. Real adapter + selected actual RC5 helper functions run in a simulated Apps Script environment; immutable payload/digest, durable receipt read-back, replay/conflict, account/machine rejection, partial failure, strict Production identity, ticket binding/expiry, 200 entries and independent mock recovery are covered. SQLite restart/rollback and account+endpoint partition are tested with Node's actual SQLite engine. These do not certify Google's service or native schedulers.
- `CHROMIUM_PATH=/usr/bin/chromium npx playwright test`: 2 browser tests passed. One performs 200-entry mock UI save/sync/logout; another loads the sanitized real RC5 form, selects a valid machine/product/roll type, calls its actual Save handler, verifies persisted queue data and checks that no session token is in localStorage.
- `npm run build` and Capacitor sync succeeded; the adapted form is bundled with the custom native bridge.
- `node scripts/check.mjs` parses source/adapters and confirms no tracked RC5 LIVE files changed.
- `git apply --check --directory='RC5 LIVE' app/backend/integration.patch` succeeded against the inspected parent revision. Patch was not applied to LIVE.
- Android `:app:assembleDebug`, `:app:testDebugUnitTest`, and `:app:compileDebugAndroidTestJavaWithJavac` succeeded using full JDK 21, SDK 36 and build-tools 35.0.0. Four Java protocol tests passed (SHA-256, exact receipt identity, digest tamper, token rejection).
- Debug APK produced. Android device SQLite test compiles, but was NOT executed: no phone/emulator connected. No Play Store release/signing was performed.

Toolchain setup encountered missing SDK/full JDK, proxy and certificate configuration; these were resolved locally without weakening the app's HTTPS verification. Build-machine proxy settings and local SDK/JDK paths are not committed. Use your own standard Android Studio environment.

## Not verified / remaining

- iOS Swift/Xcode build, signing, simulator and physical-device testing: this environment is Linux without Xcode. Source and Xcode wiring are provided; no IPA is claimed. Validate native syntax/API compatibility on a Mac before relying on iOS.
- Android actual background execution, reboot, force-stop, battery restrictions, KeyStore behavior, SQLite storage failure and network changes on devices.
- iOS screen lock, OS termination/relaunch callbacks, force-quit, reboot, ticket expiry during deferred transfer, file protection and task metadata reconciliation on devices.
- Concurrent account-switch/logout during in-flight native transfers on both platforms. Implemented owner+endpoint partition, secure credential removal, epoch checking and iOS login revision guard require device verification.
- Native Apps Script redirect/JSON behavior against an isolated deployment, Google scopes, actual trigger executions, quota/performance and the real currently deployed LIVE source. No LIVE endpoint or Sheet was called by these tests.
- Complete non-Production RC5 UI features, camera integrations, Microsoft SSO and native backup import/export. Legacy fixed-PIN export and AI local-clear/admin diagnostic shortcuts are removed.
- App Store privacy declarations must be reviewed against the final deployed service and actual data handling. An app-only UserDefaults required-reason manifest is included; it is not an App Store review certification.

## Required isolated device matrix

For each OS: save offline → close/reopen → reconnect; 200 entries including one bad row; lose upload response; repeat same ID; different ID/same Box; expire token; revoke machine; logout then login as a second user; change test endpoint; kill process during commit/upload; restart device; lock screen; deny network/battery privileges. Verify exact Request IDs, owner and row counts in TEST BACKUP/Production and in the native queue. Confirm full payload retained on every unverified result. Inspect native logs without printing tokens or payloads.

Finally, confirm a cloud-received test entry completes via server trigger after closing the phone app, and confirm phone-only entries do not falsely become cloud-received while the phone is powered off.
