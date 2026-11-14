export function stableHash(value){let hash=14695981039346656037n;for(const char of String(value)){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}return hash.toString(16);}
export const num=v=>{if(typeof v==='number')return Number.isFinite(v)?v:null;const s=String(v??'').replace(/,/g,'').trim();if(!s||/^#/.test(s)||!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:\s*kg)?$/i.test(s))return null;const n=Number(s.replace(/\s*kg$/i,''));return Number.isFinite(n)?n:null;};
export const text=v=>String(v??'').trim();
export const head=v=>text(v).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function dateKey(value){
 if(value instanceof Date)return Number.isNaN(+value)?'':value.toISOString().slice(0,10);
 if(typeof value==='number')return new Date(Math.round((value-25569)*86400000)).toISOString().slice(0,10);
 const s=text(value);let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[ T])/),y,d,mo;if(m){[,y,mo,d]=m;}else{m=s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})(?:$|[ ,])/);if(!m)return '';[,d,mo,y]=m;if(y.length===2)y='20'+y;}
 const key=`${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`,dt=new Date(key+'T00:00:00Z');return !Number.isNaN(+dt)&&dt.toISOString().slice(0,10)===key?key:'';
}
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function product(value){
 const label=text(value).toUpperCase().replace(/\s+/g,' '),twist=label.match(/(?:\[|\(|-|\s)([SZ])(?:\]|\))?\s*$/)?.[1]||'';
 const key=label.replace(/[\[\]()]/g,'').replace(/-([SZ])$/,' $1').replace(/\s+/g,' ').trim();return {label,key,shade:label.match(/^\d+/)?.[0]||label,twist};
}
const aliases={date:['date','productiondate','entrydate'],box:['boxnumber','boxno','box'],machine:['mcno','machineno','conningmachineno','coveringmachineno','machine'],employee:['employee','enteredby','user','operator','employeename'],employeeCode:['empcode','employeecode','employeeno'],product:['productname','shadeproductno','shadename','shade','colourcode','product'],net:['netweight','netw','productionnetweight'],gross:['productiongrossweight','grossweight','grossw'],tare:['tareweight','tapew','tarew'],order:['productionorderno','productionorderid','orderno','orderid','salesorderid'],required:['orderedqtykg','orderrequiredkg','requiredkg','orderedqty','orderqty','quantitykg'],due:['duedate','deliverydate','requiredby'],status:['status','orderstatus'],request:['requestid'],unit:['unit','unitno'],shift:['shift'],payload:['payload'],dispatch:['dispatchqtykg','dispatchkg'],reported:['producedqtytillcovering','producedqty','totalproduction'],productionCode:['productionno','productionnumber'],mappingAlias:['alias','sourceproduct','materialalias'],client:['clientname','partyname','customer']};
export function headerRow(rows,type){let best=-1,score=-1;rows.slice(0,8).forEach((row,i)=>{const hs=row.map(head),v=(type==='orders'?['order','required','product']:type==='mapping'?['product','productionCode']:['date','net','product','box']).reduce((n,k)=>n+(aliases[k].some(x=>hs.includes(x))?1:0),0);if(v>score){best=i;score=v;}});if(score<1)throw Error('Headers not recognized; select the correct sheet / mapping.');return best;}
export function normalizeSource(source){
 const rows=source.rows||[],hi=source.headerIndex??headerRow(rows,source.type),headers=rows[hi]||[],hs=headers.map(head),column={};
 for(const[k,names]of Object.entries(aliases))column[k]=names.map(n=>hs.indexOf(n)).find(i=>i>=0)??-1;
 if(source.type==='covering'){const idx=hs.indexOf('coveringmachineno');if(idx>=0)column.machine=idx;}
 if(source.type==='conning'){const idx=hs.indexOf('shade');if(idx>=0)column.product=idx;}
 Object.assign(column,source.columns||{});
 const get=(row,k)=>column[k]>=0?row[column[k]]:null;
 return rows.slice(hi+1).flatMap((row,index)=>{
  if(!row.some(v=>text(v)))return [];
  const rowNumber=source.rowNumbers?.[index]??((source.startRow||1)+hi+index+1),id=`${source.id||source.title||source.type}:${source.tab||''}:${rowNumber}:${stableHash(JSON.stringify(row))}`;
  let rawProduct=get(row,'product'),usedColourFallback=false;if(source.type==='conning'&&!text(rawProduct)){rawProduct=row[hs.indexOf('colourcode')];usedColourFallback=true;}
  const p=product(rawProduct),record={id,rowNumber,sourceId:source.id||'',sourceTitle:source.title||source.type,sourceTab:source.tab||'',sourceType:source.type,date:dateKey(get(row,'date')),rawDate:text(get(row,'date')),product:p.label,productKey:p.key,shade:p.shade,twist:p.twist,box:text(get(row,'box')).toUpperCase(),machine:text(get(row,'machine')),employee:text(get(row,'employee')),employeeCode:text(get(row,'employeeCode')),netKg:num(get(row,'net')),grossKg:num(get(row,'gross')),tareKg:num(get(row,'tare')),orderId:text(get(row,'order')).toUpperCase(),requestId:text(get(row,'request')),unit:text(get(row,'unit')),shift:text(get(row,'shift')),status:text(get(row,'status')),productionCode:text(get(row,'productionCode')),mappingAlias:text(get(row,'mappingAlias')),client:text(get(row,'client')),completeSource:source.complete===true,issues:[]};
  if(usedColourFallback)record.issues.push('Colour Code used; final product/shade mapping needs review');
  if(source.type==='backup'){
   try{const payload=JSON.parse(text(get(row,'payload'))||'{}');const pp=product(payload.productName);record.netKg=num(payload.netW);record.product=pp.label;record.productKey=pp.key;record.shade=pp.shade;record.twist=pp.twist;record.date=record.date||dateKey(payload.date);}catch{record.issues.push('Unreadable backup payload');}
  }
  if(source.type==='orders'){record.requiredKg=num(get(row,'required'));record.dispatchKg=num(get(row,'dispatch'));record.reportedProducedKg=num(get(row,'reported'));record.due=dateKey(get(row,'due'));record.confirmedSource=source.orderSourceConfirmed===true;if(!record.orderId)record.issues.push('Order number missing');if(record.requiredKg===null)record.issues.push('Required kg missing');record.orderKey=`${record.orderId}|${record.productKey}`;}
  if(['conning','covering','production'].includes(source.type)){
   if(!record.date)record.issues.push('Invalid / missing date');if(record.netKg===null||record.netKg<0)record.issues.push('Invalid net weight');
   if(record.grossKg!==null&&record.tareKg!==null&&record.netKg!==null&&Math.abs(record.grossKg-record.tareKg-record.netKg)>0.021)record.issues.push('Gross − tare differs from net');
   if(!record.productKey)record.issues.push('Product mapping missing');
  }
  return [record];
 });
}
export function parseWhatsApp(raw){
 const items=[];let current=null;for(const line of String(raw).replace(/^\uFEFF/,'').split(/\r?\n/)){
  const match=line.match(/^\[?(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]?\s*(?:-|–)?\s*([^:]+):\s*(.*)$/i);
  if(match){if(current)items.push(current);current={date:dateKey(match[1]),time:match[2],sender:match[3].replace(/[\u2066-\u2069]/g,'').trim(),text:match[4],line:items.length+1};}
  else if(current)current.text+='\n'+line;
 }if(current)items.push(current);
 const occurrences=new Map();return items.filter(m=>m.date).map((m,i)=>{const raw=m.text.trim(),media=/<Media omitted>|omitted|message was deleted|संदेश हटा/i.test(raw),claim=/clear ho (?:gaya|gya)|clear kar diya|sahi ho (?:gaya|gya)|repair(?:ed| complete)|completed|resolved|ठीक हो|साफ कर दिया/i.test(raw),signal=/problem|kharab|pending|nahi|nahin|नहीं|खराब|gap|loss|loose|variation|weight|wajan|वजन|helper|mix|complaint|hole|hol |slob|slub|order|report|clear|साफ|अंतर/i.test(raw);const signature=stableHash(`${m.date}|${m.time}|${m.sender}|${raw}`),occurrence=occurrences.get(signature)||0;occurrences.set(signature,occurrence+1);return {...m,id:`wa:${m.date}:${signature}:${occurrence}`,text:raw,media,closureClaim:claim,signal,category:/weight|wajan|वजन|variation/i.test(raw)?'Weight / measurement':/helper|absent|हेल्पर/i.test(raw)?'Staffing':/mix|quality|kharab|slob|slub|खराब|hole/i.test(raw)?'Quality':/order|report/i.test(raw)?'Order / reporting':'Operations',state:claim?'CLOSURE_CLAIM':'UNREVIEWED'};});
}
export function matchesQuery(row,q){if(!q)return true;const value=q.trim(),short=value.match(/^(\d{4,6})[\s-]*([SZ])$/i);if(short)return row.shade===short[1]&&row.twist===short[2].toUpperCase();const hay=`${row.product} ${row.box} ${row.orderId} ${row.requestId} ${row.employee}`.toLowerCase();return value.toLowerCase().split(/\s+/).every(t=>hay.includes(t));}
const sum=rows=>rows.reduce((n,r)=>n+(r.netKg??0),0);
const normalizedCache=new WeakMap();
function normalizedRows(source){const old=normalizedCache.get(source),signature=JSON.stringify([source.complete,source.headerIndex,source.startRow,source.columns,source.orderSourceConfirmed]),rows=source.rows||[];let data;if(old&&old.rows===rows&&old.length===rows.length&&old.signature===signature)data=old.data;else{data=normalizeSource(source);normalizedCache.set(source,{rows,length:rows.length,signature,data});}return data.map(r=>({...r,issues:[...r.issues]}));}
export function analyze(dataset,{from='',to='',q='',employee='',mainStage='conning',targetKg=null,asOf=today(),annotations={}}={}){
 const sources=dataset.sources||[],all=sources.flatMap(normalizedRows),errors=[];const seen=new Map(),duplicateIds=new Set();
 for(const row of all.filter(r=>['conning','covering','production'].includes(r.sourceType))){if(row.requestId){const key=row.sourceType+'|'+row.requestId;if(seen.has(key)){duplicateIds.add(row.id);duplicateIds.add(seen.get(key).id);}else seen.set(key,row);}}
 for(const row of all)if(duplicateIds.has(row.id))row.issues.push('Repeated Request ID — excluded from trusted totals');
 const mappingIndex=new Map();for(const m of all.filter(r=>r.sourceType==='mapping'&&r.productKey)){for(const key of [m.productionCode,m.mappingAlias].filter(Boolean)){const normalized=product(key).key;if(!mappingIndex.has(normalized))mappingIndex.set(normalized,new Map());mappingIndex.get(normalized).set(m.productKey,m);}}
 for(const r of all.filter(r=>['conning','covering','production'].includes(r.sourceType))){const options=mappingIndex.get(product(r.productionCode||r.product).key);if(options?.size===1){const m=[...options.values()][0];r.originalProduct=r.product;r.product=m.product;r.productKey=m.productKey;r.shade=m.shade;r.twist=m.twist;r.productMappedFrom='Explicit master alias';}else if(options?.size>1)r.issues.push('Ambiguous product alias — mapping withheld');}
 const match=row=>(!from||row.date>=from)&&(!to||row.date<=to)&&matchesQuery(row,q)&&(!employee||row.employee===employee);
 const records=all.filter(r=>['conning','covering','production'].includes(r.sourceType)&&match(r));
 const valid=records.filter(r=>r.netKg!==null&&r.netKg>=0&&r.date&&!duplicateIds.has(r.id)),main=valid.filter(r=>r.sourceType===mainStage),covering=valid.filter(r=>r.sourceType==='covering');
 const orders=all.filter(r=>r.sourceType==='orders'),orderKeys=new Map();for(const o of orders){if(orderKeys.has(o.orderKey)){o.issues.push('Duplicate order line — not automatically merged');orderKeys.get(o.orderKey).issues.push('Duplicate order line — not automatically merged');}else orderKeys.set(o.orderKey,o);}
 const lifecycleMain=all.filter(r=>r.sourceType===mainStage&&r.netKg!==null&&r.netKg>=0&&r.date&&!duplicateIds.has(r.id));
 const byOrder=new Map();for(const o of orders){if(!byOrder.has(o.orderKey))byOrder.set(o.orderKey,[]);byOrder.get(o.orderKey).push(o);}
 const allocation={};for(const r of lifecycleMain){const manual=annotations[r.id]?.orderKey;let options=r.orderId?(byOrder.get(`${r.orderId}|${r.productKey}`)||[]):[];if(manual)options=(byOrder.get(manual)||[]).filter(o=>o.productKey===r.productKey);if(options.length===1&&options[0].confirmedSource&&!options[0].issues.length){allocation[r.id]={order:options[0],manual:!!manual};}else if(r.orderId)r.issues.push('Order identity is missing, ambiguous or unconfirmed');}
 const mainComplete=sources.some(s=>s.type===mainStage)&&sources.filter(s=>s.type===mainStage).every(s=>s.complete===true),orderComplete=sources.some(s=>s.type==='orders')&&sources.filter(s=>s.type==='orders').every(s=>s.complete===true&&s.orderSourceConfirmed===true);
 const orderSums=new Map();for(const r of lifecycleMain){const o=allocation[r.id]?.order;if(o){if(!orderSums.has(o))orderSums.set(o,{kg:0,count:0});orderSums.get(o).kg+=r.netKg;orderSums.get(o).count++;}}
 const orderReport=orders.map(o=>{const progress=orderSums.get(o)||{kg:0,count:0},producedKg=progress.kg,remaining=o.requiredKg===null?null:Math.max(0,o.requiredKg-producedKg),complete=mainComplete&&orderComplete&&sources.filter(s=>s.type===mainStage).every(s=>!s.filterFrom&&!s.filterTo)&&!!o.requiredKg&&!o.issues.length&&remaining===0;return {...o,producedKg,remainingKg:remaining,completion:o.requiredKg>0?Math.min(100,producedKg/o.requiredKg*100):null,complete,overdue:!!o.due&&o.due<asOf&&(remaining===null||remaining>0),verifiedRows:progress.count,statusLabel:complete?'Complete':!o.confirmedSource?'Source unconfirmed':!mainComplete?'Partial source':remaining===0?'Verify totals':'Pending'};});
 const groups=new Map();for(const r of main){const key=r.productKey||'(unmapped)';if(!groups.has(key))groups.set(key,{key,product:r.product||'Unmapped product',shade:r.shade,twist:r.twist,netKg:0,rows:0,linkedKg:0});const g=groups.get(key);g.netKg+=r.netKg;g.rows++;if(allocation[r.id])g.linkedKg+=r.netKg;}
 const days=new Map();for(const r of main){if(!days.has(r.date))days.set(r.date,{date:r.date,actualKg:0,shifts:{},targetKg:num(targetKg)});const d=days.get(r.date);d.actualKg+=r.netKg;d.shifts[r.shift||'Unspecified']=(d.shifts[r.shift||'Unspecified']||0)+r.netKg;}
 const candles=[...days.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({...d,lowKg:Math.min(...Object.values(d.shifts)),highKg:Math.max(...Object.values(d.shifts))}));
 const people=new Map();for(const r of main){const k=r.employee||'Name not provided';if(!people.has(k))people.set(k,{name:k,netKg:0,entries:0,issues:0});const p=people.get(k);p.netKg+=r.netKg;p.entries++;p.issues+=r.issues.length;}
 const pending=all.filter(r=>r.sourceType==='backup'&&!['CONFIRMED','SAVED'].includes(r.status.toUpperCase())).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
 for(const r of records)for(const issue of r.issues)errors.push({id:r.id,kind:'Record check',message:issue,record:r});
 const unlinked=main.filter(r=>!allocation[r.id]);
 const whatsapp=parseWhatsApp(dataset.whatsapp?.text||'').filter(m=>(!from||m.date>=from)&&(!to||m.date<=to)&&(!q||`${m.sender} ${m.text}`.toLowerCase().includes(q.toLowerCase()))).map(m=>({...m,...(annotations[m.id]||{})}));
 return {all,records,main,orders:orderReport,pending,errors,unlinked,allocation,products:[...groups.values()].sort((a,b)=>b.netKg-a.netKg),people:[...people.values()].sort((a,b)=>b.netKg-a.netKg),candles,whatsapp,mainComplete,orderComplete,totals:{mainKg:sum(main),coveringKg:sum(covering),stageGapKg:sum(covering)-sum(main),orderRequiredKg:orders.filter(o=>!o.issues.length).reduce((n,o)=>n+(o.requiredKg??0),0),linkedKg:sum(main.filter(r=>allocation[r.id])),pendingCount:pending.length,unlinkedCount:unlinked.length},mainStage};
}
export function csv(rows,columns){const cell=v=>{const s=typeof v==='number'?String(v):String(v??'');const safe=typeof v==='string'&&/^[=+\-@\t\r]/.test(s)?"'"+s:s;return '"'+safe.replace(/"/g,'""')+'"';};return '\uFEFF'+[columns.map(c=>c.label),...rows.map(r=>columns.map(c=>typeof c.value==='function'?c.value(r):r[c.key]))].map(row=>row.map(cell).join(',')).join('\r\n');}
