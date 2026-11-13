/**
 * MEERA SERVER AUTO-RECOVERY V1 — original LIVE source supplied by user.
 * NOTE: The installer targets meeraServerRecoveryV2Worker.
 * RC5 LIVE ServerRecoveryV2.gs owns that function; do not add a second trigger.
 */
var MEERA_AUTO_RECOVERY_HANDLER = 'meeraServerRecoveryV2Worker';
var MEERA_AUTO_RECOVERY_PROP = 'MEERA_SERVER_RECOVERY_LAST_RESULT_V1';

function meeraServerAutoRecoveryWorker() {
  // The underlying save engine takes its own lock. Do NOT hold the script
  // lock here; that could deadlock nested meeraSaveEntryWithUser_ calls.
  var begun = new Date();
  var record = { startedAt: begun.toISOString(), status: 'STARTED' };
  try {
    if (typeof meeraReconcileAllPending !== 'function')
      throw new Error('meeraReconcileAllPending is missing. No writes attempted.');
    var result = meeraReconcileAllPending({ maxRows: 20, budgetMs: 45000 });
    record.status = 'COMPLETED';
    record.result = {
      scanned: Number(result.scanned || 0),
      confirmed: Number(result.confirmed || 0),
      saved: Number(result.saved || 0),
      duplicate: Number(result.duplicate || 0),
      review: Number(result.review || 0),
      failed: Number(result.failed || 0),
      remaining: Number(result.remaining || 0),
      details: (result.details || []).slice(0, 10)
    };
    console.log('MEERA AUTO RECOVERY ' + JSON.stringify(record));
  } catch (e) {
    record.status = 'ERROR';
    record.error = String(e && e.message || e);
    console.error('MEERA AUTO RECOVERY ' + JSON.stringify(record));
    throw e;
  } finally {
    record.finishedAt = new Date().toISOString();
    try { PropertiesService.getScriptProperties().setProperty(MEERA_AUTO_RECOVERY_PROP, JSON.stringify(record)); }
    catch (ignored) {}
  }
}

function meeraInstallServerAutoRecovery() {
  // Avoid duplicate minute triggers running in parallel.
  var existing = ScriptApp.getProjectTriggers().filter(function(t) {
    return t.getHandlerFunction() === MEERA_AUTO_RECOVERY_HANDLER;
  });
  if (!existing.length) {
    ScriptApp.newTrigger(MEERA_AUTO_RECOVERY_HANDLER)
      .timeBased().everyMinutes(1).create();
  }
  return 'Auto Recovery trigger installed. Existing: ' + existing.length +
    '. Verify via Triggers / Executions. Phone-only records are NOT included.';
}

function meeraStopServerAutoRecovery() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === MEERA_AUTO_RECOVERY_HANDLER) ScriptApp.deleteTrigger(t);
  });
  return 'MEERA auto-recovery triggers removed.';
}

function meeraServerAutoRecoveryLastResult() {
  return PropertiesService.getScriptProperties().getProperty(MEERA_AUTO_RECOVERY_PROP) || 'Not run yet';
}
