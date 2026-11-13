/**
 * MEERA V103.3 Batch status endpoint. READ ONLY. Do not run manually.
 * In existing routeGet_(p) switch(action) add:
 * case 'bulkRecoveryStatus': return meeraBulkRecoveryStatus_(p);
 *
 * Authenticated server-verified status for up to 25 request IDs in ONE GET.
 * Never acknowledges another user's rows. CONFIRMED requires exact matching
 * request ID, box and owner in BOTH PRODUCTION DATA and PRODUCTION BACKUP.
 */
function meeraBulkRecoveryStatus_(p) {
  var user = requireSession_(p.token);
  var admin = String(user.role || '').toLowerCase() === 'admin';
  var owner = String(user.username || '').trim().toLowerCase();
  var ids = String(p.ids || '').split(',').map(function(x){return x.trim()}).filter(Boolean);
  if (!ids.length || ids.length > 25 || ids.some(function(id){return !/^[A-Za-z0-9_-]{8,100}$/.test(id)})) {
    throw new Error('Provide 1-25 valid Request IDs.');
  }
  var ss = getSpreadsheet_();
  var production = ss.getSheetByName('PRODUCTION DATA');
  var backup = meeraFixBackupSheet_();
  if (!production) throw new Error('PRODUCTION DATA unavailable.');
  var wanted = {};
  ids.forEach(function(id){wanted[id] = true});
  var prod = {}, copies = {};
  var last = production.getLastRow();
  if (last > 1) {
    var rows = production.getRange(2, 1, last-1, 17).getDisplayValues();
    rows.forEach(function(r,idx){
      var id = String(r[16] || '').trim();
      if (wanted[id]) (prod[id] = prod[id] || []).push({box:String(r[1] || '').trim().toUpperCase(),owner:String(r[14] || '').trim().toLowerCase(),row:idx+2});
    });
  }
  last = backup.getLastRow();
  if (last > 1) {
    var brows = backup.getRange(2, 1, last-1, 7).getDisplayValues();
    brows.forEach(function(r,idx){
      var id = String(r[0] || '').trim();
      if (wanted[id]) (copies[id] = copies[id] || []).push({box:String(r[2] || '').trim().toUpperCase(),owner:String(r[5] || '').trim().toLowerCase(),status:String(r[6] || '').trim().toUpperCase(),row:idx+2});
    });
  }
  return {ok:true,action:'bulkRecoveryStatus',results:ids.map(function(id){
    var pr=prod[id]||[], br=copies[id]||[];
    // Never expose another operator's box/entry through this status endpoint.
    if (!admin && (pr.some(function(r){return r.owner!==owner}) || br.some(function(r){return r.owner!==owner}))) {
      return {requestId:id,status:'ACCESS_DENIED'};
    }
    if (pr.length>1 || br.length>1) return {requestId:id,status:'DUPLICATE_REQUEST'};
    if (pr.length && br.length && (pr[0].box!==br[0].box || pr[0].owner!==br[0].owner)) {
      return {requestId:id,status:'CONFLICT'};
    }
    if (pr.length && br.length && br[0].status==='CONFIRMED') {
      return {requestId:id,box:pr[0].box,status:'CONFIRMED',row:pr[0].row};
    }
    if (pr.length) return {requestId:id,box:pr[0].box,status:'PRODUCTION_ONLY'};
    if (br.length) return {requestId:id,box:br[0].box,status:'BACKUP_PENDING'};
    return {requestId:id,status:'NOT_FOUND'};
  })};
}
