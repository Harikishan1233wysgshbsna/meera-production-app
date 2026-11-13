/**
 * RC7 DIRECT PRODUCTION SAVE - Google Apps Script ADD-ON.
 * Do not remove PRODUCTION BACKUP or run a bulk replay.
 * Requires existing functions in Production Data Sync.gs (V109).
 * Idempotent on Request ID under one script lock.
 * This function intentionally does NOT write or read PRODUCTION BACKUP.
 */
function meeraRC7DirectSave_(body) {
  const user = requireSession_(body.token);
  const requestId = String(body.requestId || '').trim();
  const machine = Number(body.machine);
  const box = String(body.box || '').trim().toUpperCase();
  if (!/^[A-Za-z0-9-]{16,100}$/.test(requestId))
    throw new Error('Valid Request ID is required.');
  if (!validMachine_(machine)) throw new Error('Invalid machine.');
  if (String(user.role || '').toLowerCase() !== 'admin' &&
      (user.machines || []).map(Number).indexOf(machine) < 0)
    throw new Error('Machine not allowed.');
  if (!box) throw new Error('Box identity required.');
  const unit = unitForMachine_(machine);
  const product = String(body.productName || '').trim();
  const reviewReasons = [];
  if (!product) reviewReasons.push('Product missing');
  if (!new RegExp('^' + (machine <= 74 ? 'A' : 'B') + '[0-9]+$').test(box))
    reviewReasons.push('Box format or unit mismatch');
  const rollType = rollTypeCode_(body.rollTypeCode || body.rollType);
  if (!rollType || allowedRollTypesForUser_(user,machine).indexOf(rollType)<0)
    reviewReasons.push('Roll type missing/not permitted');
  const parseNumber = function(value) {
    const s = String(value==null ? '' : value).trim();
    return s !== '' && Number.isFinite(Number(s)) ? Number(s) : null;
  };
  const rolls=parseNumber(body.rollCount), gross=parseNumber(body.grossW),
        tare=parseNumber(body.tapeW), net=parseNumber(body.netW);
  if (rolls===null || !Number.isInteger(rolls) || rolls<=0) reviewReasons.push('Roll count invalid');
  if (gross===null || gross<=0) reviewReasons.push('Gross weight invalid');
  if (tare===null || tare<0) reviewReasons.push('Tare weight invalid');
  if (net===null || net<=0) reviewReasons.push('Net weight invalid');
  if (gross!==null && tare!==null && net!==null && Math.abs(gross-tare-net)>0.02)
    reviewReasons.push('Net weight mismatch');
  let monthName='';
  try { monthName=meeraMonthFromEntryDate_(body.date); }
  catch(e) { reviewReasons.push('Invalid date'); }
  const weights={rollW:parseNumber(body.rollType),rolls:rolls===null?'':rolls,
    gross:gross===null?'':gross,tare:tare===null?'':tare,net:net===null?'':net};

  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss=getSpreadsheet_();
    if (meeraFastTombstone_(ss,requestId,box))
      throw new Error('Record deleted by Admin. Do not retry automatically.');
    // The global search protects old identities even if written before RC7.
    const prod=meeraFastProductionIndex_(requestId,box,user,unit);
    const exact=prod.byId[requestId]||[];
    if (exact.length>1)
      return {ok:false,status:'REVIEW_REQUIRED',requestId:requestId,box:box,
        error:'Duplicate Request ID in Production. Admin review required.'};
    if (exact.length===1) {
      const rowNo=exact[0];
      const old=prod.sheet.getRange(rowNo,1,1,prod.width).getDisplayValues()[0];
      const machineIndex=findHeader_(prod.names,['m/c no','m/c','machine no','machine','mc no']);
      if (prod.boxOf[rowNo]!==box || machineIndex<0 ||
          Number(old[machineIndex])!==machine ||
          String(old[MEERA_COL_ENTERED_]||'').trim().toLowerCase()!==String(user.username||'').toLowerCase())
        return {ok:false,status:'REVIEW_REQUIRED',requestId:requestId,box:box,
          error:'Existing Request ID belongs to different owner, box or machine.'};
      return {ok:true,status:'CONFIRMED',source:'PRODUCTION_DATA',duplicate:true,
        requestId:requestId,box:box,row:rowNo};
    }
    // A separate Request ID for an existing Box remains a real submission.
    const duplicateBox=(prod.byBox[box]||[]).length>0;
    const status=duplicateBox?'DUPLICATE':
      (reviewReasons.length?'Needs Review':'Available for Conning');
    const row=meeraFixBuildRow_(prod,body,{requestId:requestId,box:box,
      machine:machine,unit:unit,product:product,monthName:monthName,weights:weights,
      user:user,reviewStatus:status});
    prod.sheet.appendRow(row);
    SpreadsheetApp.flush();
    // Verify actual appended identity, never infer success from appendRow alone.
    const rowNo=prod.sheet.getLastRow();
    const saved=prod.sheet.getRange(rowNo,1,1,prod.width).getDisplayValues()[0];
    if(String(saved[MEERA_COL_REQID_]||'').trim()!==requestId ||
       cleanBox_(saved[prod.boxIndex]).toUpperCase()!==box ||
       String(saved[MEERA_COL_ENTERED_]||'').trim().toLowerCase()!==String(user.username||'').toLowerCase())
      throw new Error('Production write unconfirmed. Keep same Request ID for retry.');
    meeraFixInvalidateCache_();
    return {ok:true,status:'CONFIRMED',source:'PRODUCTION_DATA',requestId:requestId,
      box:box,row:rowNo,productionStatus:status,duplicateBox:duplicateBox,
      reviewRequired:duplicateBox||reviewReasons.length>0,warnings:reviewReasons};
  } finally {lock.releaseLock();}
}

/** Exact Production-only status; no backup dependency or mutation. */
function meeraRC7DirectStatus_(p) {
  const user=requireSession_(p.token);
  const requestId=String(p.requestId||'').trim();
  const box=String(p.box||'').trim().toUpperCase();
  const machine=Number(p.machine);
  if(!/^[A-Za-z0-9-]{16,100}$/.test(requestId)||!box||!validMachine_(machine))
    throw new Error('Valid Request ID, Box and Machine required.');
  if(String(user.role||'').toLowerCase()!=='admin' &&
     (user.machines||[]).map(Number).indexOf(machine)<0)
    throw new Error('Machine not allowed.');
  const sheet=getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if(!sheet)throw new Error('Production sheet missing.');
  const end=sheet.getLastRow();
  if(end<2)return {ok:true,status:'NOT_FOUND',requestId:requestId,box:box};
  const hits=sheet.getRange(2,17,end-1,1).createTextFinder(requestId)
    .matchEntireCell(true).matchCase(true).findAll();
  if(!hits.length)return {ok:true,status:'NOT_FOUND',requestId:requestId,box:box};
  if(hits.length!==1)return {ok:true,status:'REVIEW_REQUIRED',requestId:requestId,box:box};
  const row=sheet.getRange(hits[0].getRow(),1,1,17).getDisplayValues()[0];
  if(String(row[1]||'').trim().toUpperCase()!==box ||
     Number(row[2])!==machine ||
     String(row[14]||'').trim().toLowerCase()!==String(user.username||'').toLowerCase())
    return {ok:true,status:'REVIEW_REQUIRED',requestId:requestId,box:box};
  return {ok:true,status:'CONFIRMED',source:'PRODUCTION_DATA',requestId:requestId,
    box:box,row:hits[0].getRow()};
}
