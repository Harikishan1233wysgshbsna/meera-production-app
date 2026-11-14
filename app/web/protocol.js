export const STATES=['LOCAL_SAVED','UPLOADING','CLOUD_RECEIVED','PRODUCTION_CONFIRMED','RETRY_PENDING','REVIEW_REQUIRED'];
export const FIELDS=['action','date','machine','rollTypeCode','rollType','productName','productSource','yarnCode','box','shift','rollCount','grossW','tapeW','netW','requestId'];
export function canonicalPayload(input){
  const p={};for(const k of [...FIELDS].sort())if(input[k]!=null)p[k]=String(input[k]);
  p.action='saveEntry';p.requestId=String(input.requestId||'');p.box=String(input.box||'').trim().toUpperCase();p.machine=String(Number(input.machine));
  if(!/^[A-Za-z0-9-]{16,100}$/.test(p.requestId)||!p.box||!Number.isInteger(Number(p.machine))||Number(p.machine)<1||Number(p.machine)>111)throw Error('Invalid entry identity');
  for(const k of ['date','productName','rollCount','grossW','tapeW','netW'])if(!(k in p))throw Error('Incomplete entry');
  const sorted={};for(const k of Object.keys(p).sort())sorted[k]=p[k];return JSON.stringify(sorted);
}
export async function digest(text){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function receiptMatches(row,result){const p=JSON.parse(row.payloadJson);return result&&result.requestId===row.requestId&&result.owner===row.owner&&result.box===p.box&&String(result.machine)===p.machine&&result.digest===row.digest;}
export function transition(row,result){
  if(!receiptMatches(row,result))throw Error('Receipt identity/digest mismatch');
  if(!['CLOUD_RECEIVED','PRODUCTION_CONFIRMED','REVIEW_REQUIRED','RETRY_PENDING'].includes(result.state))throw Error('Unknown receipt state');
  return {...row,state:result.state,cloudReceivedAt:result.state==='CLOUD_RECEIVED'||result.state==='PRODUCTION_CONFIRMED'?(row.cloudReceivedAt||new Date().toISOString()):row.cloudReceivedAt,error:result.errorCode||''};
}
export function counters(rows){return {localSaved:rows.length,cloudReceived:rows.filter(r=>r.cloudReceivedAt).length,productionConfirmed:rows.filter(r=>r.state==='PRODUCTION_CONFIRMED').length,uploadRemaining:rows.filter(r=>!r.cloudReceivedAt&&r.state!=='REVIEW_REQUIRED').length,review:rows.filter(r=>r.state==='REVIEW_REQUIRED').length};}
