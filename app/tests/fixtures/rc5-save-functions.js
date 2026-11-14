// Exact selected RC5 helper functions from source commit aefb6cd; no LIVE config.
function meeraFixEnsureBackupRow_(backup, index, body, requestId, box, machine, unit, user, status) {
  const existing = index.byId[requestId] || [];
  if (existing.length > 1) throw new Error('Duplicate backup identity. Admin review required.');
  if (existing.length === 1) {
    const rowNo = existing[0];
    const old = backup.getRange(rowNo, 1, 1, 6).getDisplayValues()[0];
    if (cleanBox_(old[2]).toUpperCase() !== box || Number(old[3]) !== machine ||
        String(old[5] || '').trim().toLowerCase() !== String(user.username).trim().toLowerCase()) {
      throw new Error('Request ID belongs to a different entry.');
    }
    return rowNo;
  }
  // Distinct Request IDs are permitted for the same Box. A BOX must never
  // suppress a real request or prevent its PENDING backup intent being saved.
  const payload = Object.assign({}, body);
  delete payload.token;
  backup.appendRow([requestId, body.date || '', box, machine, unit, user.username,
    status, JSON.stringify(payload), new Date(), status === 'CONFIRMED' ? new Date() : '']);
  SpreadsheetApp.flush();
  const newRow = backup.getLastRow();
  if (String(backup.getRange(newRow,1).getDisplayValue()).trim() !== requestId)
    throw new Error('BACKUP_WRITE_FAILED: Request ID not found on new row.');
  index.byId[requestId] = [newRow];
  index.rowOf[requestId] = newRow;
  index.statusOf[newRow] = status;
  index.byBox[box] = (index.byBox[box] || []).concat([newRow]);
  return newRow;
}


function meeraMinimalBackupPayload_(body) {
  var keys=['action','date','machine','rollTypeCode','rollType','productName',
    'productSource','yarnCode','box','shift','rollCount','grossW','tapeW','netW','requestId'];
  var out={action:'saveEntry'};
  keys.forEach(function(k){if(k!=='action' && body[k] !== undefined && body[k] !== null) out[k]=body[k];});
  return out;
}
