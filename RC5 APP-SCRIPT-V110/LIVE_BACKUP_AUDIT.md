# V110 LIVE source snapshot audit — 2026-11-14

Status: **Original source downloaded locally, not published here**.

The owner supplied `MEERA_LIVE_SOURCE_BACKUP.zip` from `clasp clone`, with 10 files listed below. The source archive was inspected, but source bytes have **not** been committed to this public GitHub repository.

**Security block:** `Production Data Sync.js` contains a hardcoded initial admin password and live spreadsheet/connection configuration. Do NOT publish the original ZIP, raw source, or this credential to this public repo. Keep the complete original only in a secure private location. Before using any sanitized source, verify removal of secrets in every file.

The snapshot is of the LIVE **editor head** at clone time, not a verified export of the immutable deployed Version 110. No live files or deployments were modified.

| File | Original bytes | SHA-256 of ZIP member |
|---|---:|---|
| `BulkRecovery.js` | 9822 | `7265ada027ce3e32cf8836b04283a1dfb9eac86295cf2ec0c8727588c95549f5` |
| `BulkRecoveryStatus.js` | 2945 | `641689c5b57437487e05da879cec333cfe30595fd6185758ff6bde73046e3a05` |
| `DashboardFix.js` | 872 | `67d9be0f243d84c5d0b127f71d785be82c94b17f5b753580bf00b66313b8cd47` |
| `MEERA_READ_ONLY_STATUS_AUDIT.js` | 3223 | `1e8a81856437e0535153b45041ed6a14678104705142aea3550e2f9c577acb89` |
| `Production Data Sync.js` | 183187 | `6342b6875517d54cbe27e2c9e3b2d1e1d3d391d1162fced09b21ae491ac5c490` |
| `RC6_ProductionProof.js` | 2615 | `30d75be596c31b3fb5c69c80690e0fe7235a153fec6d1cff4f8618bb3cbd2520` |
| `RC7_DirectSave.gs.js` | 6763 | `966e9c21e6b093fb5a2fba517f8c39c310b5b1388b75454a12ace6b236f6de1a` |
| `ServerAutoRecovery.js` | 3008 | `fff4b4907214f7eb9919e746679e41ad9f131688367d918daeb560069f575e5b` |
| `ServerRecoveryV2.js` | 2865 | `6e70efd4c200f6bb6abf9efee5b018885e3cb69927d34d1103c5b06ed510dc96` |
| `appsscript.json` | 204 | `468928af3d7ab2b62309df74de96ec5f1a25773d0798896e31583e05e39e1b32` |

Next step: secure private backup destination or carefully redacted public copies. Retain each original filename and compare deployed V110 against editor head before removing any LIVE .gs file.
