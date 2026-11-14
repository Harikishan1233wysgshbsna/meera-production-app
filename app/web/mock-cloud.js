import {digest,canonicalPayload} from './protocol.js';
export class MockCloud{
  queue=new Map();production=new Map();active=new Set(['demo','alice','bob']);machines={demo:[1],alice:[1],bob:[2]};
  async batch(owner,entries){if(!this.active.has(owner))return {ok:false,errorCode:'AUTH_REQUIRED'};
    return {ok:true,results:await Promise.all(entries.map(async row=>{const p=JSON.parse(row.payloadJson);const result={requestId:p.requestId,owner,box:p.box,machine:p.machine,digest:row.digest};
      if(await digest(row.payloadJson)!==row.digest||canonicalPayload(p)!==row.payloadJson)return {...result,state:'REVIEW_REQUIRED',errorCode:'DIGEST_MISMATCH'};
      if(!this.machines[owner]?.includes(Number(p.machine)))return {...result,state:'REVIEW_REQUIRED',errorCode:'MACHINE_DENIED'};
      const old=this.queue.get(p.requestId);if(old&&(old.owner!==owner||old.payloadJson!==row.payloadJson))return {...result,state:'REVIEW_REQUIRED',errorCode:'IDENTITY_CONFLICT'};
      this.queue.set(p.requestId,{...row,owner});return {...result,state:this.production.has(p.requestId)?'PRODUCTION_CONFIRMED':'CLOUD_RECEIVED'};
    }))};
  }
  work(){for(const [id,row]of this.queue){if(!this.active.has(row.owner))continue;const p=JSON.parse(row.payloadJson);if(!this.machines[row.owner]?.includes(Number(p.machine)))continue;if(!this.production.has(id))this.production.set(id,{...row,productionStatus:[...this.production.values()].some(r=>JSON.parse(r.payloadJson).box===p.box)?'DUPLICATE':'Available for Conning'});}}
}
