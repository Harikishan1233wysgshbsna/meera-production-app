# RC5 Mobile starter

Android + iOS Capacitor project with native SQLite queues and background upload implementations. RC5's existing validated form, login flow, machine/roll permissions and weight calculations are reused in a sanitized, app-only copy. **This is a starter for isolated testing, not a deployed or certified production app.**

Source inspected: `RC5 LIVE` in `Harikishan1233wysgshbsna/meera-production-app`, commit `aefb6cd00d63ef18eb049e843e77b0d77429affc`. See [provenance](docs/upstream.json) and [inspection notes](docs/INSPECTION.md). Deployed Apps Script and actual LIVE Sheet were not accessed or verified. Existing RC5 files are unchanged.

The connector cannot create GitHub repositories; this project uses the user-authorized fallback `app/` directory. No billing, paid service, deployment, signing account or store publication has been enabled.

## Run the browser preview

Requires Node 22+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the local URL, choose **Mock operator login**, **Add 200 test entries**, then **Sync mock queue**. Browser preview uses IndexedDB and an in-memory mock cloud; it does not represent native background execution. Mock credentials stay in memory and are not real accounts. Native mock mode can store local rows, but a configured isolated backend is required for native cloud upload.

## Build Android

Requires a full JDK 21 (including javac), Android Studio/SDK platform 36 and build-tools 35.0.0, and an Android device/emulator API 24+.

```sh
npm ci
npm run sync
npm run android
# Or, after setting ANDROID_HOME/local.properties:
cd android
./gradlew :app:assembleDebug :app:testDebugUnitTest
```

Debug APK output: `android/app/build/outputs/apk/debug/app-debug.apk`. Local test APK is not a signed store release. A debug signing key is generated locally; never commit it. Device-only SQLite integration test: `./gradlew connectedDebugAndroidTest` (dedicated test app/device data).

Android implementation: [plugin](android/app/src/main/java/com/meera/rc5/RC5QueuePlugin.java), [SQLite](android/app/src/main/java/com/meera/rc5/QueueDb.java), [WorkManager uploader](android/app/src/main/java/com/meera/rc5/SyncWorker.java), [Keystore vault](android/app/src/main/java/com/meera/rc5/SessionVault.java). Network-constrained unique work, a 15-minute recovery job, transactional leases, batches of 10 and per-row retry are implemented. Successful batches schedule fresh continuation work; network errors use exponential backoff. OS battery policy can delay all work. Device backup is disabled.

## Build iOS

Requires macOS, a Capacitor-8-compatible Xcode version, iOS 15+ SDK and signing configuration for device installation. See Capacitor's current platform requirements before choosing a toolchain.

```sh
npm ci
npm run sync
npm run ios
```

Open `ios/App/App.xcodeproj`, choose your team and simulator/device, and build. SPM resolves Capacitor. The custom plugin is registered by `RC5ViewController`; SQLite3, Security and CryptoKit are Apple system modules. [Native implementation](ios/App/App/RC5QueuePlugin.swift) and [AppDelegate callbacks](ios/App/App/AppDelegate.swift) are included. iOS compilation/signing and physical-device behavior are pending on macOS; no IPA is claimed.

An iOS background URLSession uploads protected files using short-lived, exact-batch-bound tickets instead of persisting login tokens in spool files. Credentials remain in Keychain. Up to three 10-entry transfers are prepared; callbacks and foreground reentry continue the queue. Ticket preparation and further task scheduling are subject to OS suspension. There is no promise that every locally saved row has been handed to iOS before the user closes the app. Force-quit cancels background transfers. Lost/expired tasks are reconciled from SQLite on reentry. No fake permanent JavaScript background timer is used.

## Connect an isolated backend

Follow [backend installation](docs/BACKEND_SETUP.md) and [Hindi setup](docs/SETUP_HI.md). The startup screen requires an explicitly configured TEST Apps Script HTTPS `/exec` URL and confirmation. No LIVE URL or spreadsheet identifier is packaged. The UI cannot prove an operator-provided URL is a test deployment; confirm its Sheet IDs manually.

New native APIs are not present in the deployed backend by default. Install the separate adapter and integration patch into TEST, initialize ticket signing, reuse one recovery trigger, and deploy TEST before configuring the app. Foreground requests use native HTTP, not JSONP. Normal username/password challenge login is preserved; Microsoft SSO, legacy encrypted import/export, and other device integrations need additional product work/device verification. The fixed-PIN backup feature is intentionally absent.

Queue status meanings, identity checks, account changes, limitations and deployment order are in [architecture](docs/ARCHITECTURE.md). Full payloads remain locally even after final confirmation in this starter; no automatic history pruning is implemented. Keep a backup/retention policy before production use.

## Verification

```sh
npm test
npx playwright install chromium
npx playwright test
# Use CHROMIUM_PATH=/path/to/chromium if already installed.
npm run build
```

[Verification record](docs/VERIFICATION.md) distinguishes executable tests, simulated backend results and unverified devices. Browser tests actually exercise the adapted RC5 Save handler and mock 200-entry UI. Native background scheduling/force-quit, Google permissions and live deployment require the documented isolated device matrix. Tests never call LIVE endpoints.

The two adaptation scripts recreate app-only source and an applicable backend diff from the pinned parent RC5 files. They fail on changed integration markers. The generated web source is committed, so building the ZIP/repository copy does not require the parent source. To regenerate after reviewed upstream changes: `node scripts/prepare-rc5.mjs <source-commit>` and `node scripts/prepare-backend-patch.mjs` from this folder.
