import fs from 'node:fs';import {spawnSync} from 'node:child_process';import os from 'node:os';import path from 'node:path';
const source=fs.readFileSync(new URL('../../RC5 LIVE/Production Data Sync.gs',import.meta.url),'utf8');let patched=source;
const route="function routePost_(body) {\n  const action = String(body.action || '').trim();";
if(!patched.includes(route))throw Error('Route integration marker changed');
patched=patched.replace(route,route+"\n  if (['nativeMe','nativeRpc','nativeAuthorize','nativeBatch'].indexOf(action)>=0) return rc5NativeRoute_(body);");
// A permanent permission/deletion/review problem must not consume every worker
// batch forever. This change belongs only in the isolated TEST integration.
const marker="    const requestId = String(values[i][0]||'').trim();\n    if (!requestId) continue;";
if(!patched.includes(marker))throw Error('Recovery integration marker changed');
patched=patched.replace(marker,"    if (status === 'REVIEW_REQUIRED') continue;\n"+marker);
patched=patched.replace("summary.review++; summary.details.push({ requestId, box, result:'TOMBSTONED' }); continue;","backup.getRange(i+2,7).setValue('REVIEW_REQUIRED');\n        summary.review++; summary.details.push({ requestId, box, result:'TOMBSTONED' }); continue;");
patched=patched.replace("summary.review++; summary.details.push({ requestId, box, result:'OWNER_INACTIVE' }); continue;","backup.getRange(i+2,7).setValue('REVIEW_REQUIRED');\n        summary.review++; summary.details.push({ requestId, box, result:'OWNER_INACTIVE' }); continue;");
const ownerMarker="      // The save engine takes its own lock, so none is held here.";
patched=patched.replace(ownerMarker,"      if (String(owner.role).toLowerCase() !== 'admin' && (owner.machines||[]).map(Number).indexOf(Number(data.machine))<0) {\n        backup.getRange(i+2,7).setValue('REVIEW_REQUIRED');\n        summary.review++; summary.details.push({requestId,box,result:'MACHINE_DENIED'}); continue;\n      }\n"+ownerMarker);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rc5-patch-'));try{const a=path.join(dir,'before.gs'),b=path.join(dir,'after.gs');fs.writeFileSync(a,source);fs.writeFileSync(b,patched);const result=spawnSync('diff',['-u','--label','a/Production Data Sync.gs','--label','b/Production Data Sync.gs',a,b],{encoding:'utf8'});if(result.status>1)throw Error(result.stderr);fs.writeFileSync(new URL('../backend/integration.patch',import.meta.url),result.stdout);}finally{fs.rmSync(dir,{recursive:true});}
