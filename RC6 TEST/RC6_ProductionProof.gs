/**
 * RC6 TEST - Production-only read proof.
 * IMPORTANT: This is an ADD-ON only, do not replace existing Code.gs.
 * 1. Add a new Apps Script file RC6_ProductionProof.gs and paste this function.
 * 2. In EXISTING routeGet_(p) switch, add:
 *
 *   case 'rc6ProductionProof':
 *     return meeraRC6ProductionProof_(p);
 *
 * 3. Deploy a NEW VERSION of the existing web-app deployment only AFTER
 *    checking there are no duplicate function definitions and after a backup.
 * This route reads PRODUCTION DATA, does not write, and does not require BACKUP.
 * It must never be called without session authorization.
 */

/**
 * RC6 read-only proof: does not wait for BACKUP CONFIRMED, does not repair it,
 * and never mutates PRODUCTION DATA. One exact Request ID lookup in col Q.
 * Return PRODUCTION_SAVED only for a unique, owner+machine+box matching row.
 */
function meeraRC6ProductionProof_(p) {
  const user=requireSession_(p.token);
  const id=String(p.requestId||'').trim();
  const box=String(p.box||'').trim().toUpperCase();
  const machine=Number(p.machine);
  if(!/^[A-Za-z0-9-]{16,100}$/.test(id) || !box || !validMachine_(machine))
    throw new Error('Valid Request ID, box and machine required.');
  if(String(user.role||'').toLowerCase()!=='admin' &&
     (user.machines||[]).map(Number).indexOf(machine)<0)
    throw new Error('Machine not assigned.');
  const sheet=getSpreadsheet_().getSheetByName(CONFIG.ENTRY_SHEET_NAME);
  if(!sheet)throw new Error('Production sheet missing.');
  const end=sheet.getLastRow();
  if(end<2)return {ok:true,status:'NOT_FOUND',requestId:id,box:box};
  // Search identity, NOT only Box: a second operator may have reused the Box.
  const matches=sheet.getRange(2,17,end-1,1).createTextFinder(id)
    .matchEntireCell(true).matchCase(true).findAll();
  if(matches.length===0)return {ok:true,status:'NOT_FOUND',requestId:id,box:box};
  if(matches.length!==1)return {ok:true,status:'REVIEW_REQUIRED',requestId:id,box:box};
  const rowNo=matches[0].getRow();
  const row=sheet.getRange(rowNo,1,1,17).getDisplayValues()[0];
  const storedBox=String(row[1]||'').trim().toUpperCase(); // column B
  const storedMachine=Number(row[2]); // column C
  const storedOwner=String(row[14]||'').trim().toLowerCase(); // column O
  if(String(row[16]||'').trim()!==id || storedBox!==box || storedMachine!==machine ||
     storedOwner!==String(user.username||'').trim().toLowerCase())
    return {ok:true,status:'REVIEW_REQUIRED',requestId:id,box:box};
  return {ok:true,status:'PRODUCTION_SAVED',requestId:id,box:box,
    machine:machine,row:rowNo,backupStatus:'NOT_VERIFIED'};
}

