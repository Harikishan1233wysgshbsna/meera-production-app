/** RC5 optional cloud queue. Working copy; NOT installed or deployed.
 * Uses the existing PRODUCTION BACKUP and recovery engine. No new database.
 * Web app must execute as the owner who installs the recovery trigger.
 * Add explicit enqueueEntry / cloudSaveStatus router cases per cloud summary.md.
 * Does not replace doGet, doPost, the existing writer, or the HTML automatically.
 */
function meeraCloudEnqueue_(body) {
  const user = requireSession_(body.token);
  const machine = Number(body.machine);
  if (!validMachine_(machine)) throw new Error('Valid machine required.');
  if (String(user.role).toLowerCase() !== 'admin' && (user.machines || []).map(Number).indexOf(machine) < 0) {
    throw new Error('Machine not allowed for this user.');
  }
  const requestId = String(body.requestId || '').trim();
  const box = String(body.box || '').trim().toUpperCase();
  if (!/^[A-Za-z0-9-]{16,100}$/.test(requestId) || !box) throw new Error('Valid Request ID and Box required.');
  const payload = meeraMinimalBackupPayload_(Object.assign({},body,{requestId:requestId,box:box}));
  const required = ['date','productName','rollCount','grossW','tapeW','netW'];
  if (required.some(function(k){return !Object.prototype.hasOwnProperty.call(payload,k);})) {
    throw new Error('Incomplete entry payload. Keep the local copy.');
  }
  if (JSON.stringify(payload).length > 45000) throw new Error('Entry payload too large.');
  meeraRequireCloudWorker_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = getSpreadsheet_();
    if (meeraFastTombstone_(ss,requestId,box)) throw new Error('Record deleted by Admin. Request review.');
    const unit = unitForMachine_(machine);
    const queue = meeraFixBackupSheet_();
    const index = meeraFastBackupIndex_(queue,requestId,box,user,unit);
    const row = meeraFixEnsureBackupRow_(queue,index,payload,requestId,box,machine,unit,user,'PENDING');
    meeraVerifyCloudPayload_(queue,row,payload,user);
    return {ok:true,status:'CLOUD_RECEIVED',requestId:requestId,box:box,
      message:'Entry stored in cloud. Production completion is not yet verified.'};
  } finally { lock.releaseLock(); }
}

function meeraCloudStatus_(params) {
  // Reuse existing authentication, owner checks, and Production verification.
  const result = checkSaveStatus_(params);
  if (result.ok !== true || result.status !== 'PENDING') return result;
  const user = requireSession_(params.token);
  const machine = Number(params.machine);
  if (!validMachine_(machine)) throw new Error('Valid machine required.');
  const queue = meeraFixBackupSheet_();
  const index = meeraFastBackupIndex_(queue,result.requestId,result.box,user,unitForMachine_(machine));
  const found = index.byId[result.requestId] || [];
  if (found.length !== 1) throw new Error('Cloud receipt identity requires review.');
  // Even an admin must request their own receipt here. Existing status routes
  // remain available for administration of other operators' records.
  const saved = meeraVerifyCloudPayload_(queue,found[0],null,user);
  if (String(saved.requestId) !== String(params.requestId) ||
      String(saved.box).trim().toUpperCase() !== String(params.box || '').trim().toUpperCase() ||
      Number(saved.machine) !== machine) throw new Error('Cloud receipt identity mismatch.');
  result.status = 'CLOUD_RECEIVED';
  return result;
}

function meeraCloudWorkerTriggers_() {
  return ScriptApp.getProjectTriggers().filter(function(t) {
    const name = t.getHandlerFunction();
    return (name === 'meeraServerRecoveryV2Worker' && typeof meeraServerRecoveryV2Worker === 'function') ||
      (name === 'meeraReconcileTrigger_' && typeof meeraReconcileTrigger_ === 'function');
  });
}

function meeraRequireCloudWorker_() {
  if (!meeraCloudWorkerTriggers_().length) {
    throw new Error('Cloud queue is not installed. Owner must run meeraInstallCloudQueue first. Entry remains on phone.');
  }
}

function meeraInstallCloudQueue() {
  // Run manually as the same account used to execute the Web App.
  // Reuse an existing recovery trigger; never install another alongside it.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    meeraFixBackupSheet_();
    let triggers = meeraCloudWorkerTriggers_();
    if (!triggers.length) {
      if (typeof meeraServerRecoveryV2Worker !== 'function') {
        throw new Error('Install the matching ServerRecoveryV2.gs before enabling cloud queue.');
      }
      ScriptApp.newTrigger('meeraServerRecoveryV2Worker').timeBased().everyMinutes(1).create();
      triggers = meeraCloudWorkerTriggers_();
    }
    const result = {ok:true, recoveryTriggers:triggers.map(function(t){return t.getHandlerFunction();}),
      note:'Trigger exists; inspect Executions to verify successful runs. Quotas and scheduling delays still apply.'};
    console.log(JSON.stringify(result));
    return result;
  } finally { lock.releaseLock(); }
}

function meeraVerifyCloudPayload_(sheet, rowNumber, expected, user) {
  // Read after write: a no-cors transport response is never a receipt.
  const row = sheet.getRange(rowNumber, 1, 1, 10).getDisplayValues()[0];
  let payload;
  try { payload = JSON.parse(row[7]); }
  catch (err) { throw new Error('Cloud payload is unreadable. Keep the local copy.'); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Cloud payload is invalid. Keep the local copy.');
  }
  const required = ['requestId','box','machine','date','productName','rollCount','grossW','tapeW','netW'];
  if (required.some(function(k){return !Object.prototype.hasOwnProperty.call(payload,k);}) ||
      String(payload.requestId) !== String(row[0]).trim() ||
      String(payload.box).trim().toUpperCase() !== cleanBox_(row[2]).toUpperCase() ||
      Number(payload.machine) !== Number(row[3]) ||
      String(row[5]).trim().toLowerCase() !== String(user.username).trim().toLowerCase()) {
    throw new Error('Cloud payload identity or fields mismatch. Keep the local copy and request review.');
  }
  if (expected) {
    const saved = meeraMinimalBackupPayload_(payload);
    const keys = Object.keys(expected).sort();
    if (keys.length !== Object.keys(saved).length || keys.some(function(k) {
      return JSON.stringify(saved[k]) !== JSON.stringify(expected[k]);
    })) throw new Error('Request ID already contains different input. Original cloud payload preserved.');
  }
  return payload;
}
