/** RC5 native adapter. Add as a separate file in an ISOLATED TEST project first.
 * Requires existing RC5 Production Data Sync.gs, cloud.gs and recovery worker.
 * Does not replace doPost, install triggers, or modify LIVE by itself.
 */
function rc5NativeRoute_(body) {
  try {
    switch (String(body.action || '')) {
      case 'nativeMe': return {ok:true,user:publicUser_(rc5NativeAuth_(body.token))};
      case 'nativeRpc': {
        var request=body.request || {}, action=String(request.action||'');
        if (['fastLogin','challenge','login'].indexOf(action)<0) rc5NativeAuth_(request.token);
        if (/^native/.test(action) || action==='saveEntry') throw new Error('Use native queue for Production saves.');

        // Existing route functions continue enforcing their original permissions.
        // Explicit read route selection prevents retrying a mutation as GET.
        var mutations=['saveUser','deleteUser','saveTracking','updateTracking','deleteTracking','logout','saveMaterialIssue','setMaterialStock','setMaterialStockBulk','saveMaterialIssueBatch','saveDoublerIssue','createDoublerOutput','createConningOutput','saveQrBatch'];
        if (mutations.indexOf(action)>=0) return routePost_(request);
        return routeGet_(request);
      }
      case 'nativeAuthorize': return rc5NativeAuthorize_(body);
      case 'nativeBatch': return rc5NativeBatch_(body);
      default: return {ok:false,errorCode:'UNKNOWN_ACTION'};
    }
  } catch (err) {
    return {ok:false,errorCode:err.rc5Code || 'RETRY_PENDING',message:safeError_(err)};
  }
}
function rc5NativeAuth_(token) {
  try { return requireSession_(token); }
  catch (err) { var failure=new Error('Sign in again to resume this account queue.');failure.rc5Code='AUTH_REQUIRED';throw failure; }
}
function rc5NativeOwner_(user) { return String(user.username||'').trim().toLowerCase(); }
function rc5NativeHash_(raw) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,raw,Utilities.Charset.UTF_8).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join(''); }
function rc5NativeCanonical_(input) {
  var data=meeraMinimalBackupPayload_(input), sorted={};
  Object.keys(data).sort().forEach(function(k){sorted[k]=String(data[k]);});
  return JSON.stringify(sorted);
}
function rc5NativeEntries_(body) {
  if (body.protocol !== undefined && Number(body.protocol)!==1) throw new Error('Unsupported protocol.');
  if (!Array.isArray(body.entries)||body.entries.length<1||body.entries.length>10) throw new Error('Batch must contain 1–10 entries.');
  var seen={};body.entries.forEach(function(entry){if(!entry||typeof entry.payloadJson!=='string'||entry.payloadJson.length>45000)throw new Error('Invalid entry envelope.');var p=JSON.parse(entry.payloadJson);if(!/^[A-Za-z0-9-]{16,100}$/.test(String(p.requestId))||entry.requestId!==p.requestId||seen[p.requestId])throw new Error('Invalid or repeated Request ID.');seen[p.requestId]=true;});return body.entries;
}
function rc5NativeSecret_() {
  var secret=PropertiesService.getScriptProperties().getProperty('RC5_NATIVE_TICKET_SECRET');
  if(!secret)throw new Error('Run rc5NativeInitializeTickets in the TEST project first.');return secret;
}
function rc5NativeInitializeTickets() {
  // Run manually as owner; deliberately does not create any recovery trigger.
  var lock=LockService.getScriptLock();lock.waitLock(30000);try{var props=PropertiesService.getScriptProperties();if(!props.getProperty('RC5_NATIVE_TICKET_SECRET'))props.setProperty('RC5_NATIVE_TICKET_SECRET',Utilities.getUuid()+Utilities.getUuid());return {ok:true,message:'Ticket secret ready; reuse existing recovery trigger.'};}finally{lock.releaseLock();}
}
function rc5NativeSign_(text) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(text,rc5NativeSecret_())); }
function rc5NativeAuthorize_(body) {
  var user=rc5NativeAuth_(body.token),owner=rc5NativeOwner_(user),entries=rc5NativeEntries_(body);
  if (body.owner!==owner)throw new Error('Account identity mismatch.');
  // Short-lived upload-only ticket, tied to these exact immutable entries.
  var claims={owner:owner,expires:Date.now()+2*60*60*1000,entries:entries.map(function(e){return [e.requestId,e.digest];})};
  var text=Utilities.base64EncodeWebSafe(JSON.stringify(claims),Utilities.Charset.UTF_8);
  return {ok:true,ticket:text+'.'+rc5NativeSign_(text),expires:claims.expires};
}
function rc5NativeTicketUser_(body,entries) {
  var parts=String(body.ticket||'').split('.');if(parts.length!==2||rc5NativeSign_(parts[0])!==parts[1])throw new Error('Upload ticket invalid.');
  var claims=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if(claims.expires<Date.now()||claims.owner!==body.owner||JSON.stringify(claims.entries)!==JSON.stringify(entries.map(function(e){return [e.requestId,e.digest];})))throw new Error('Upload ticket expired or entries changed.');
  var user=findUser_(claims.owner);if(!user||!user.active){var err=new Error('Account inactive.');err.rc5Code='AUTH_REQUIRED';throw err;}return user;
}
function rc5NativeBatch_(body) {
  var entries=rc5NativeEntries_(body),user=body.ticket?rc5NativeTicketUser_(body,entries):rc5NativeAuth_(body.token),owner=rc5NativeOwner_(user);
  if(body.owner!==owner)throw new Error('Account identity mismatch.');
  meeraRequireCloudWorker_();var started=Date.now();
  var results=entries.map(function(entry){
    var p=JSON.parse(entry.payloadJson),result={requestId:p.requestId,owner:owner,box:p.box,machine:String(p.machine),digest:entry.digest,state:'RETRY_PENDING'};
    if(Date.now()-started>25000){result.errorCode='BUDGET_RETRY';return result;}
    try {
      if(rc5NativeHash_(entry.payloadJson)!==entry.digest||rc5NativeCanonical_(p)!==entry.payloadJson){result.state='REVIEW_REQUIRED';result.errorCode='DIGEST_MISMATCH';return result;}
      var machine=Number(p.machine);if(!validMachine_(machine)||String(user.role).toLowerCase()!=='admin'&&(user.machines||[]).map(Number).indexOf(machine)<0){result.state='REVIEW_REQUIRED';result.errorCode='MACHINE_DENIED';return result;}
      ['date','box','productName','rollCount','grossW','tapeW','netW'].forEach(function(k){if(!Object.prototype.hasOwnProperty.call(p,k))throw new Error('Missing field '+k);});
      if(!p.box||String(p.box)!==String(p.box).trim().toUpperCase())throw new Error('Invalid box identity.');
      var lock=LockService.getScriptLock();lock.waitLock(10000);
      try{
        var ss=getSpreadsheet_();if(meeraFastTombstone_(ss,p.requestId,p.box)){result.state='REVIEW_REQUIRED';result.errorCode='ADMIN_DELETED';return result;}
        var unit=unitForMachine_(machine),backup=meeraFixBackupSheet_(),index=meeraFastBackupIndex_(backup,p.requestId,p.box,user,unit);
        var row=meeraFixEnsureBackupRow_(backup,index,p,p.requestId,p.box,machine,unit,user,'PENDING');
        var saved=meeraVerifyCloudPayload_(backup,row,p,user);
        // Compare all original recovery fields; don't infer receipt from row ID.
        if(rc5NativeCanonical_(saved)!==entry.payloadJson)throw new Error('Existing Request ID contains different input.');
        if(String(backup.getRange(row,7).getDisplayValue()).trim().toUpperCase()==='REVIEW_REQUIRED'){result.state='REVIEW_REQUIRED';result.errorCode='SERVER_REVIEW_REQUIRED';return result;}
        result.state='CLOUD_RECEIVED';
      }finally{lock.releaseLock();}
      // Outside the write lock: existing verifier may repair backup flags.
      result.state=rc5NativeProductionState_(p,user);

    }catch(err){
      if(result.state==='CLOUD_RECEIVED'){
        // A ticket has no session token; a separate strict Production verifier
        // safely determines final status without weakening the normal endpoint.
        try{var state=rc5NativeProductionState_(p,user);result.state=state;}catch(ignored){result.state='CLOUD_RECEIVED';}
      }else{result.state=/different|identity|contains|mismatch/i.test(String(err.message))?'REVIEW_REQUIRED':'RETRY_PENDING';result.errorCode=result.state==='REVIEW_REQUIRED'?'IDENTITY_CONFLICT':'RETRY_REQUIRED';}
    }
    return result;
  });
  return {ok:true,protocol:1,results:results};
}
function rc5NativeProductionState_(payload,user) {
  var prod=meeraFastProductionIndex_(payload.requestId,payload.box,user,unitForMachine_(Number(payload.machine))),rows=prod.byId[payload.requestId]||[];
  if(!rows.length)return 'CLOUD_RECEIVED';if(rows.length!==1)return 'REVIEW_REQUIRED';
  var row=prod.sheet.getRange(rows[0],1,1,prod.width).getDisplayValues()[0],machineIndex=findHeader_(prod.names,['m/c no','m/c','machine no','machine','mc no']);
  if(prod.boxOf[rows[0]]!==payload.box||machineIndex<0||Number(row[machineIndex])!==Number(payload.machine)||String(row[MEERA_COL_ENTERED_]||'').trim().toLowerCase()!==rc5NativeOwner_(user))return 'REVIEW_REQUIRED';
  return 'PRODUCTION_CONFIRMED';
}
