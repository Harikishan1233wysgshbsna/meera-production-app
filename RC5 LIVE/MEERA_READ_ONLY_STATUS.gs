/** MEERA READ-ONLY STATUS AUDIT — run meeraAuditBackupNov05() from editor.
 * NO production writes. No sessions needed. Checks both backup and production.
 * Review manually; NEVER bulk replay entries based solely on backup PENDING.
 */
function meeraAuditBackupNov05() {
  const ss = SpreadsheetApp.openById('1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E');
  const prod = ss.getSheetByName('PRODUCTION DATA');
  const backup = ss.getSheetByName('PRODUCTION BACKUP');
  if (!prod || !backup) throw Error('Production or Backup sheet not found');
  const pLast=prod.getLastRow(), bLast=backup.getLastRow();
  const prodRows=pLast>1?prod.getRange(2,2,pLast-1,16).getDisplayValues():[];
  // Production B..Q = array indexes B:0, Q:15
  const backupRows=bLast>1?backup.getRange(2,1,bLast-1,7).getDisplayValues():[];
  const pBox=new Map(), pId=new Map(), bBox=new Map(), bId=new Map();
  function add(map,key,val) { key=String(key||'').trim().toUpperCase(); if (!key)return;
    if (!map.has(key)) map.set(key,[]); map.get(key).push(val); }
  prodRows.forEach((r,i)=>{add(pBox,r[0],i+2);add(pId,r[15],i+2);});
  backupRows.forEach((r,i)=>{add(bBox,r[2],{row:i+2,status:r[6],user:r[5]});add(bId,r[0],{row:i+2,status:r[6],user:r[5]});});
  const vivek = [{"id": "7e505689-d863-4862-b51d-01fbc1a99f87", "box": "A30739"}, {"id": "348f1951-773e-4ab7-a1ac-265232d9564d", "box": "A30741"}, {"id": "ae4994ec-5deb-4486-a161-0439b5546480", "box": "A30742"}, {"id": "96c81fac-6f4e-4d14-801f-3e48beb33931", "box": "A30743"}, {"id": "45286c70-815f-4391-b0c3-ab95d659fb95", "box": "A30744"}, {"id": "e888a7de-0cc1-4482-a111-892ab8a5a9df", "box": "A31011"}, {"id": "de2198a7-bcf9-47c5-a2d6-f9794ae497c5", "box": "A31012"}, {"id": "5668975a-71ae-40f7-9b0c-fdad734c44a6", "box": "A31013"}, {"id": "83d8e46c-1a0d-4347-b0c8-2604ba3f44e9", "box": "A31014"}, {"id": "b5516ba2-86b3-4952-b8d1-a327304af904", "box": "A31015"}, {"id": "66e14093-b4b7-4cc5-8669-adbea84e7117", "box": "A31016"}, {"id": "14e1d340-2860-40a2-b597-dec56169e213", "box": "A31466"}, {"id": "785d7bcd-0051-4d48-b811-e07dc70ba69c", "box": "A31467"}, {"id": "3bec4e71-021e-4353-ab3e-41247663754a", "box": "A31671"}];
  const boxes=["B26476","B26477","B26478","B26479","B26480","B26481","B26482","B26483","B26484","B26485","B26486","B26487","B26488","B26489","B26490"];
  const output = [];
  vivek.forEach(x=>{
    const rows=pBox.get(x.box)||[];const ids=pId.get(x.id.toUpperCase())||[];
    const bk=bId.get(x.id.toUpperCase())||[];
    output.push({owner:'vivek',box:x.box,liveBoxRows:rows,liveRequestRows:ids,backup:bk,
      verdict:rows.length===1&&ids.length===1&&rows[0]===ids[0]?'MATCHED_LIVE':
       (rows.length||ids.length)?'REVIEW_CONFLICT':'NOT_FOUND_LIVE_REVIEW_ONLY'});
  });
  boxes.forEach(box=>{
    const rows=pBox.get(box)||[],bk=bBox.get(box)||[];
    output.push({owner:'sushil',box,liveBoxRows:rows,backup:bk,
      verdict:rows.length===1?'PRESENT_LIVE_CHECK_REQUEST_ID':rows.length>1?'DUPLICATE_LIVE_REVIEW':
       bk.length===1&&String(bk[0].status).toUpperCase()==='PENDING'?'PENDING_BACKUP_NOT_IN_LIVE_REVIEW':'REVIEW'});
  });
  console.log(JSON.stringify({productionRows:pLast-1,backupRows:bLast-1,entries:output},null,2));
  return output;
}
