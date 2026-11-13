/**
 * MEERA RC5 — Server Recovery V2, unified with the verified main save engine.
 * This is a GitHub working copy, NOT deployed. The existing LIVE one-minute
 * trigger calls meeraServerRecoveryV2Worker by this exact name.
 *
 * Policy: same Request ID = no second row; different Request ID + same Box =
 * append a real entry, with Production STATUS DUPLICATE.
 *
 * No outer ScriptLock: meeraReconcileAllPending calls
 * meeraSaveEntryWithUser_ which takes its own lock. Never nest that lock.
 * Mobile-only offline entries are NOT accessible to server recovery.
 */
function meeraServerRecoveryV2Worker() {
  var started = new Date();
  var report = {
    startedAt: started.toISOString(), finishedAt: '',
    status: 'STARTED', scanned: 0, recovered: 0,
    alreadyInProduction: 0, duplicate: 0, review: 0, failed: 0,
    remaining: 0, details: []
  };
  try {
    if (typeof meeraReconcileAllPending !== 'function') {
      throw new Error('Verified reconciler is missing; no production writes attempted.');
    }
    var backup = meeraFixBackupSheet_();
    var last = backup.getLastRow();
    if (last < 2) {
      report.status = 'NO_PENDING';
    } else {
      // Cheap exit when the server backup queue is empty. No production scan.
      var statuses = backup.getRange(2, 7, last - 1, 1).getDisplayValues();
      var pending = statuses.filter(function(row) {
        return String(row[0] || '').trim().toUpperCase() === 'PENDING';
      }).length;
      report.remaining = pending;
      if (!pending) {
        report.status = 'NO_PENDING';
        console.log('MEERA RC5 RECOVERY: No pending entries. Production scan skipped.');
      } else {
        // All writes and duplicate decisions use ONE shared save/recovery policy.
        var result = meeraReconcileAllPending({ maxRows: 20, budgetMs: 45000 });
        report.status = 'COMPLETED';
        report.scanned = Number(result.scanned || 0);
        report.recovered = Number(result.saved || 0);
        report.alreadyInProduction = Number(result.confirmed || 0);
        report.duplicate = Number(result.duplicate || 0);
        report.review = Number(result.review || 0);
        report.failed = Number(result.failed || 0);
        report.remaining = Number(result.remaining || 0);
        report.details = (result.details || []).slice(0, 10);
        console.log('MEERA RC5 RECOVERY ' + JSON.stringify(report));
      }
    }
  } catch (err) {
    report.status = 'ERROR';
    report.failed++;
    report.error = String(err && err.message || err);
    console.error('MEERA RC5 RECOVERY ERROR ' + report.error);
    throw err;
  } finally {
    report.finishedAt = new Date().toISOString();
    try {
      PropertiesService.getScriptProperties().setProperty(
        'MEERA_SERVER_RECOVERY_LAST_RESULT_V2', JSON.stringify(report)
      );
    } catch (ignored) {}
  }
  return report;
}
