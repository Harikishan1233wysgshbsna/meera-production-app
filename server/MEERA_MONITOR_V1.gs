/*
MEERA_MONITOR_V1.gs  |  OPTIONAL ADD-ON — NOT DEPLOYED AUTOMATICALLY
===================================================================
Place this file in the SAME bound LIVE Apps Script project.
This module reports production-entry form/queue snapshots to ADMIN_ENTRY_MONITOR.
It DOES NOT copy the full phone screen, login passwords or other applications.
Only entries received by this Apps Script can appear in the admin dashboard.

REQUIRED: wire these three action routes into your EXISTING doGet/doPost routers.
Do NOT replace or delete existing routes:

  GET:
  case 'meeraMonitorCapabilities': return meeraMonitorCapabilities_(p);
  case 'meeraMonitorRead':         return meeraMonitorRead_(p);

  POST:
  case 'meeraMonitorPush':         return meeraMonitorPush_(body);

Important: This example's auth adapter uses requireSession_(request.token).
Check your live requireSession_ signature before deployment. NEVER bypass authentication.
Server-side role 'admin' is required for read. The client-side role alone is NOT security.

This is a separate sidecar monitor. Real "admin first, then Production" ordering
requires the existing saveEntry backend to write PRODUCTION BACKUP first.
A browser POST cannot guarantee server ordering or delivery after phone shutdown.
===================================================================
*/

const MEERA_MONITOR_SSID_ = '1yIUv0HnXysigxZ9R45cTQWk-46NW2PyaFmeaX7VSh8E';
const MEERA_MONITOR_TAB_ = 'ADMIN_ENTRY_MONITOR';
const MEERA_MONITOR_VERSION_ = 'M1';
const MEERA_MONITOR_HEADERS_ = [
 'KEY','USERNAME','UNIT','BOX','MACHINE','DATE','SHIFT','PRODUCT','YARN',
 'ROLLS','GROSS','TARE','NET','PHONE_REPORTED_STAGE','UPDATED_AT',
 'REQUEST_ID','REPORT_JSON'
];

/*
IMPORTANT AUTH ADAPTER:
If your live requireSession_ takes an object rather than a token, replace ONLY
the call below with the exact established server authentication function.
It MUST validate the token against the server's real sessions, not browser input.
*/
function meeraMonitorIdentity_(request, needAdmin) {
  const supplied = String(request && request.token || '').trim();
  if (!supplied) throw new Error('Login required');
  // FAIL-CLOSED if your current auth interface differs — never trust username/role in POST.
  const auth = requireSession_(supplied);
  const user = auth && auth.user ? auth.user : auth;
  const username = String(user && (user.username || user.userName || user.login) || '').trim().toLowerCase();
  const role = String(user && user.role || '').trim().toLowerCase();
  if (!username) throw new Error('Authenticated username unavailable: verify the requireSession_ adapter');
  if (needAdmin && role !== 'admin') throw new Error('Admin permission required');
  return {username,role};
}
function meeraMonitorCapabilities_(p) {
  const u=meeraMonitorIdentity_(p,false);
  return {ok:true,monitorVersion:MEERA_MONITOR_VERSION_,canSend:true,username:u.username};
}
function meeraMonitorText_(value,maxLen) {
  let x=String(value==null?'':value).trim().slice(0,maxLen||250);
  // Avoid spreadsheet formula execution from operator input.
  if (/^[=+\-@\t\r]/.test(x)) x="'"+x;
  return x;
}
function meeraMonitorSheet_() {
  const ss=SpreadsheetApp.openById(MEERA_MONITOR_SSID_);
  let sheet=ss.getSheetByName(MEERA_MONITOR_TAB_);
  if (!sheet) {
    sheet=ss.insertSheet(MEERA_MONITOR_TAB_);
    sheet.getRange(1,1,1,MEERA_MONITOR_HEADERS_.length).setValues([MEERA_MONITOR_HEADERS_]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
function meeraMonitorPrepare_(item,username) {
  if (!item || typeof item!=='object') return null;
  const stage=meeraMonitorText_(item.stage||'QUEUED',40).toUpperCase();
  if (!['DRAFT','QUEUED','PENDING','SENDING','SAVED','REVIEW_REQUIRED','AWAITING_CONFIRMATION','ON_SERVER'].includes(stage)) return null;
  const req=meeraMonitorText_(item.requestId,120);
  if (stage!=='DRAFT' && !req) return null;
  const key=(stage==='DRAFT'?'DRAFT|'+username:'REQUEST|'+req);
  const record={
    username,
    requestId:req,
    stage,
    unit:meeraMonitorText_(item.unit,5),
    box:meeraMonitorText_(item.box,32),
    machine:meeraMonitorText_(item.machine,16),
    date:meeraMonitorText_(item.date,32),
    shift:meeraMonitorText_(item.shift,20),
    product:meeraMonitorText_(item.product,220),
    yarn:meeraMonitorText_(item.yarn,140),
    rolls:meeraMonitorText_(item.rolls,20),
    gross:meeraMonitorText_(item.gross,25),
    tare:meeraMonitorText_(item.tare,25),
    net:meeraMonitorText_(item.net,25)
  };
  const now=new Date().toISOString();
  return [key,record.username,record.unit,record.box,record.machine,
    record.date,record.shift,record.product,record.yarn,record.rolls,
    record.gross,record.tare,record.net,record.stage,now,record.requestId,
    JSON.stringify(record)];
}
function meeraMonitorPush_(body) {
  const identity=meeraMonitorIdentity_(body,false);
  const raw=Array.isArray(body&&body.items)?body.items:[];
  if (!raw.length || raw.length>12) throw new Error('Expected 1 to 12 entry reports');
  const rows=raw.map(x=>meeraMonitorPrepare_(x,identity.username)).filter(Boolean);
  if (!rows.length) return {ok:false,error:'No valid production entry reports'};
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(6000)) throw new Error('Monitor busy: phone will report again');
  try {
    const sheet=meeraMonitorSheet_();
    const last=sheet.getLastRow(), keys=last>1?sheet.getRange(2,1,last-1,1).getValues().flat():[];
    const positions=new Map();
    keys.forEach((k,i)=>{if(k)positions.set(String(k),i+2)});
    const pending=[];
    for (const row of rows) {
      const existing=positions.get(row[0]);
      if (existing) sheet.getRange(existing,1,1,MEERA_MONITOR_HEADERS_.length).setValues([row]);
      else {
        pending.push(row);
        positions.set(row[0],last+pending.length);
      }
    }
    if (pending.length) sheet.getRange(last+1,1,pending.length,MEERA_MONITOR_HEADERS_.length).setValues(pending);
    SpreadsheetApp.flush();
    return {ok:true,monitorVersion:MEERA_MONITOR_VERSION_,received:rows.length};
  } finally {lock.releaseLock()}
}
function meeraMonitorRead_(p) {
  meeraMonitorIdentity_(p,true);
  const sheet=meeraMonitorSheet_();
  const last=sheet.getLastRow();
  if (last<=1) return {ok:true,monitorVersion:MEERA_MONITOR_VERSION_,items:[]};
  const count=Math.min(Math.max(Number(p&&p.limit)||200,1),Math.min(last-1,500));
  // Latest 500 sheet rows; this monitor is not a full-history archive.
  const values=sheet.getRange(Math.max(2,last-count+1),1,count,MEERA_MONITOR_HEADERS_.length).getValues();
  const items=values.map(r=>({
    username:String(r[1]||''),unit:String(r[2]||''),box:String(r[3]||''),
    machine:String(r[4]||''),date:String(r[5]||''),shift:String(r[6]||''),
    product:String(r[7]||''),yarn:String(r[8]||''),
    rolls:String(r[9]||''),gross:String(r[10]||''),tare:String(r[11]||''),
    net:String(r[12]||''),stage:String(r[13]||''),updatedAt:String(r[14]||''),
    requestId:String(r[15]||'')
  })).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return {ok:true,monitorVersion:MEERA_MONITOR_VERSION_,items,totalRecords:last-1};
}
