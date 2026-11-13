# RC5 cloud queue — summary and installation

Status: source added to GitHub only. NOT installed in Google Apps Script,
NOT deployed, and NOT active on users' phones. Existing HTML and backend files
are unchanged by this addition. There are no account IDs or deployment URLs in
these new files. No paid cloud service is required; Google account quotas apply.

## Kaise kaam karega

Phone par full entry IndexedDB mein save hoti hai. HTML full payload aur current
session token ko enqueueEntry par bhejega. cloud.gs login/machine permission
check karta hai, token hata kar existing PRODUCTION BACKUP mein PENDING entry
likhta hai, phir payload read karke verify karta hai. Same Request ID ka retry
doosri backup row nahi banata; changed input ke saath same ID reject hoti hai.

Authenticated cloudSaveStatus se CLOUD_RECEIVED milne ke baad hi phone par
Received in cloud dikhana hai. Opaque no-cors POST response receipt nahi hai.
Uske baad phone off ho tab bhi existing scheduled server worker Production
save finish kar sakta hai. Phone ka full payload CONFIRMED hone tak rakhna hai.
Upload se pehle phone off ho toh app reopen aur reconnect karna padega.

The worker reuses current operator permissions, Request ID duplicate protection,
and the existing Production save engine. An inactive account or changed machine
permission may require admin review. Receipt is not a guarantee of completion;
quotas, execution errors and scheduling delays can postpone processing.

## Backend integration (manual, after test comparison)

Back up the live Sheet/script. Compare current deployed code with the GitHub
RC5 candidate. Use an isolated test project/Sheet and test HTML endpoint first.
Do not add duplicate global functions. cloud.gs depends on existing RC5 helpers:
requireSession_, validMachine_, unitForMachine_, meeraMinimalBackupPayload_,
meeraFastTombstone_, meeraFixBackupSheet_, meeraFastBackupIndex_,
meeraFixEnsureBackupRow_, checkSaveStatus_, getSpreadsheet_, and cleanBox_.
Use the matching ServerRecoveryV2.gs and normal save/reconciliation engine.

1. Create an Apps Script file named cloud and paste cloud.gs into it.
2. In the existing routePost_ switch add:

```javascript
case 'enqueueEntry':
  return meeraCloudEnqueue_(body);
```

3. In the existing routeGet_ switch add (its parameter is named p):

```javascript
case 'cloudSaveStatus':
  return meeraCloudStatus_(p);
```

4. Run meeraInstallCloudQueue manually as the account that executes the Web App.
   Authorize permissions. It reuses an existing recognized recovery trigger,
   or creates a one-minute meeraServerRecoveryV2Worker trigger when none exists.
   Check Triggers and Executions. Do not run additional trigger installers.
5. Deploy a new version of the existing Web App, executing as its owner. Keep
   application login/session checks. A GitHub upload does not deploy this code.

## HTML integration (manual; deploy backend first)

In v9PostOnce, override action at send-time; keep stored payload.action=saveEntry:

```javascript
const payload={...row.payload,action:'enqueueEntry',requestId:row.requestId,token:sessionToken};
```

In v9CheckStatus, call cloudSaveStatus instead of checkSaveStatus. Add
CLOUD_RECEIVED to the accepted status list and to the identity checks that
compare response Request ID and Box with the local row. Continue treating
CONFIRMED as final Production success and preserving existing error handling.

At the start of v9ApplyStatus add:

```javascript
if(status==='CLOUD_RECEIVED'){
  await v9Change(row.requestId,{
    state:'CLOUD_RECEIVED',cloudReceivedAt:new Date().toISOString(),
    nextCheckAt:Date.now()+V9_RECHECK_MS,
    lastError:'Received in cloud. Production processing continues independently.'
  });
  return true;
}
```

Add CLOUD_RECEIVED:'Received in cloud — Production pending' to v9StatusLabel.
Do NOT add it to V9_FINAL_STATES; the existing worker must continue polling.
Do NOT clear row.payload on receipt. Existing CONFIRMED handling may release it
after Production verification. The updated HTML must then be published and
opened/refreshed by users; downloaded old HTML needs replacement.

## Checks before live use

- Wrong session/machine rejects; no payload is stored for unauthorized users.
- Verify full payload exists in BACKUP and contains no session token.
- Lost POST response must recover by authenticated status polling.
- Close phone only after cloud receipt; inspect server Executions, one Production
  row and CONFIRMED backup. Reopen and verify final local status.
- Replay same Request ID: no extra row. Changed payload: original preserved.
- Different Request IDs for one Box follow the existing duplicate review policy.
- Missing trigger rejects enqueue; offline phone retains its local entry.
- Test account suspension, quotas and errors; inspect pending records for review.

Local simulated tests check queue logic; Google deployment, trigger permissions,
concurrent operator load and phone shutdown behavior still require isolated
end-to-end verification. This file is an installation guide, not proof that the
live installation has happened.
