/**
 * MEERA RC5 — old-entry bulk recovery. Distinct request IDs with the same Box are saved as DUPLICATE.
 * Paste as the ONLY definition of meeraBulkSyncOldEntries_ in BulkRecovery.gs.
 * Requires routePost_: case 'bulkSyncOldEntries': return meeraBulkSyncOldEntries_(body);
 * Requires existing getSpreadsheet_, requireSession_, CONFIG.ENTRY_SHEET_NAME.
 * LIVE use: back up spreadsheet and test with one entry before deploying to staff.
 */
function meeraBulkSyncOldEntries_(body) {
  var user = requireSession_(body.token);
  var entries = body.entries;
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('No recovery entries received.');
  if (entries.length > 25) throw new Error('Maximum 25 entries per request.');

  var isAdmin = String(user.role || '').toLowerCase() === 'admin';
  var login = String(user.username || '').trim().toLowerCase();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSpreadsheet_();
    var prod = ss.getSheetByName(CONFIG.ENTRY_SHEET_NAME || 'PRODUCTION DATA');
    if (!prod) throw new Error('LIVE PRODUCTION DATA sheet not found.');
    var backup = meeraFixBackupSheet_(); // validates the original 10 backup headers

    var headers = prod.getRange(1, 1, 1, Math.max(17, prod.getLastColumn())).getDisplayValues()[0];
    var required = [[0,'DATE'],[1,'BOX NUMBER'],[2,'M/C NO'],[12,'STATUS'],[13,'UNIT'],[14,'Entered By'],[15,'Month'],[16,'REQUEST ID']];
    required.forEach(function(item) {
      if (String(headers[item[0]] || '').trim().toUpperCase() !== item[1].toUpperCase())
        throw new Error('STOP: PRODUCTION DATA column ' + (item[0]+1) + ' is not ' + item[1]);
    });
    // Read once under lock; include all historic records, not just FAST-15.
    var pRows = prod.getLastRow() > 1 ? prod.getRange(2, 1, prod.getLastRow()-1, 17).getDisplayValues() : [];
    var bRows = backup.getLastRow() > 1 ? backup.getRange(2, 1, backup.getLastRow()-1, 10).getDisplayValues() : [];
    var pIds = {}, bIds = {}, pBoxes = {};
    pRows.forEach(function(r,i) {
      var id = String(r[16] || '').trim();
      var existingBox=String(r[1] || '').trim().toUpperCase();
      if(existingBox) pBoxes[existingBox] = (pBoxes[existingBox] || 0) + 1;
      if (id) (pIds[id] = pIds[id] || []).push({row:i+2,box:existingBox,machine:Number(r[2]),owner:String(r[14] || '').trim().toLowerCase()});
    });
    bRows.forEach(function(r,i) {
      var id = String(r[0] || '').trim();
      if (id) (bIds[id] = bIds[id] || []).push({row:i+2,box:String(r[2] || '').trim().toUpperCase(),machine:Number(r[3]),owner:String(r[5] || '').trim().toLowerCase()});
    });

    var results = [];
    for (var n = 0; n < entries.length; n++) {
      var item = entries[n] || {};
      var p = item.payload || item;
      var box = String(item.box || p.box || '').trim().toUpperCase();
      var requestId = String(item.requestId || p.requestId || '').trim();
      var owner = String(item.owner || p.enteredBy || p.owner || user.username || '').trim();
      var machine = Number(p.machine || p.machineNo);
      var bRowNo = 0;
      try {
        if (!box) throw new Error('Missing Box Number — manual review needed.');
        if (!Number.isInteger(machine) || machine < 1 || machine > 111)
          throw new Error('Missing/invalid Machine — manual review needed.');
        if (!isAdmin) {
          if (owner.toLowerCase() !== login) throw new Error('Owner does not match logged-in user.');
          if ((user.machines || []).map(Number).indexOf(machine) < 0) throw new Error('Machine permission denied.');
        }
        // Stable identifier for entries without a request ID. Never use a new random ID on retries.
        if (!requestId) {
          var signature = JSON.stringify([owner.toLowerCase(), p.date || '', box, machine, p.shift || '', p.productName || '', p.yarnCode || '', p.rollType || '', p.rollCount || '', p.grossW || '', p.tapeW || '', p.netW || '', p.timestamp || '']);
          var dig = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, signature);
          requestId = 'REC-' + dig.map(function(x) { return ('0'+(x&255).toString(16)).slice(-2); }).join('').slice(0,40);
        }
        if (!/^[A-Za-z0-9_-]{8,100}$/.test(requestId)) throw new Error('Invalid Request ID; manual review needed.');
        var matchedProduction = pIds[requestId] || [];
        var matchedBackup = bIds[requestId] || [];
        if (matchedProduction.length > 1 || matchedBackup.length > 1) throw new Error('Same Request ID appears multiple times; admin review required.');
        if (matchedProduction.length && (matchedProduction[0].box !== box || matchedProduction[0].machine !== machine || matchedProduction[0].owner !== owner.toLowerCase())) throw new Error('Existing Request ID belongs to a different production identity.');
        if (matchedBackup.length && (matchedBackup[0].box !== box || matchedBackup[0].machine !== machine || matchedBackup[0].owner !== owner.toLowerCase())) throw new Error('Existing Request ID belongs to a different backup identity.');
        if (!isAdmin && matchedProduction.length && matchedProduction[0].owner !== login) throw new Error('Existing Production Request ID belongs to another user.');
        if (!isAdmin && matchedBackup.length && matchedBackup[0].owner !== login) throw new Error('Existing Backup Request ID belongs to another user.');

        if (typeof meeraIsTombstoned_ === 'function' && meeraIsTombstoned_(ss, 'PRODUCTION DATA', requestId, box)) throw new Error('Previously admin-deleted request; manual review required.');

        if (matchedProduction.length) {
          results.push({box:box,requestId:requestId,status:'ALREADY_EXISTS',rowNumber:matchedProduction[0].row});
          continue;
        }

        var unit = machine <= 74 ? 1 : 2;
        var date = String(p.date || '').trim();
        var dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        var monthName = dateMatch && +dateMatch[2] >= 1 && +dateMatch[2] <= 12 ? months[+dateMatch[2]-1] : '';
        var num = function(v){ return v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? '' : Number(v); };
        var txt = function(v){ var s=String(v==null?'':v); return /^[=+@]/.test(s) ? "'"+s : s; };
        var original = Object.assign({}, p);
        delete original.token;
        original.recoveryOriginalState = String(item.state || item.status || 'UNKNOWN');
        original.recoverySource = 'MEERA_BULK_RECOVERY_V103_2';
        original.recoveryRequestId = requestId;
        original.requestId = requestId;
        original.box = box;
        original.machine = machine;
        // Same Request ID in backup: reuse its row, never create another pending intent.
        if (matchedBackup.length) {
          bRowNo = matchedBackup[0].row;
        } else {
          backup.appendRow([requestId,date,box,machine,unit,owner,'PENDING',JSON.stringify(original),new Date(),'']);
          SpreadsheetApp.flush();
          // Verify by searching the unique ID under lock (avoid assuming getLastRow is ours).
          var bFind = backup.getRange(2,1,Math.max(1,backup.getLastRow()-1),1)
            .createTextFinder(requestId).matchEntireCell(true).findAll();
          if (bFind.length !== 1) throw new Error('Backup write could not be verified. Do not retry blindly.');
          bRowNo = bFind[0].getRow();
          bIds[requestId] = [{row:bRowNo,box:box,owner:owner.toLowerCase()}];
        }

        // Only append once per Request ID. An existing Box is allowed,
        // but each newly appended row must say DUPLICATE in Production STATUS.
        // 17 columns exactly match the LIVE PRODUCTION DATA schema.
        var duplicateBox = Boolean(pBoxes[box]);
        var productionRow = [
          txt(date),txt(box),machine,txt(p.shift),txt(p.productName),txt(p.yarnCode),
          num(p.rollType),num(p.rollCount),num(p.grossW),num(p.tapeW),num(p.netW),
          txt(p.timestamp || ''),duplicateBox ? 'DUPLICATE' : 'Needs Review',unit,txt(owner),monthName,txt(requestId)
        ];
        prod.appendRow(productionRow);
        SpreadsheetApp.flush();
        var pFind = prod.getRange(2,17,Math.max(1,prod.getLastRow()-1),1)
          .createTextFinder(requestId).matchEntireCell(true).findAll();
        if (pFind.length !== 1) throw new Error('Production write not uniquely verified; inspect LIVE before retry.');
        var pRowNo = pFind[0].getRow();
        var actualBox = String(prod.getRange(pRowNo,2).getDisplayValue()).trim().toUpperCase();
        if (actualBox !== box) throw new Error('Production Box verification mismatch.');
        pIds[requestId] = [{row:pRowNo,box:box,machine:machine,owner:owner.toLowerCase()}];
        pBoxes[box] = (pBoxes[box] || 0) + 1;
        backup.getRange(bRowNo,7).setValue('CONFIRMED');
        backup.getRange(bRowNo,10).setValue(new Date());
        results.push({box:box,requestId:requestId,status:'RECOVERED',productionStatus:duplicateBox ? 'DUPLICATE' : 'Needs Review',rowNumber:pRowNo});
      } catch(err) {
        results.push({box:box,requestId:requestId,status:'FAILED',error:String(err.message || err)});
      }
    }
    SpreadsheetApp.flush();
    try { meeraFixInvalidateCache_(); } catch(ignore) {}
    return {
      ok: true,
      action:'bulkSyncOldEntries',
      received:entries.length,
      recovered:results.filter(function(x){return x.status==='RECOVERED';}).length,
      alreadyExists:results.filter(function(x){return x.status==='ALREADY_EXISTS';}).length,
      failed:results.filter(function(x){return x.status==='FAILED';}).length,
      results:results
    };
  } finally {
    lock.releaseLock();
  }
}