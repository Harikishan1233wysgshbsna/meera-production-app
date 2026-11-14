import {Bridge,enqueue,configure,configuration} from './bridge.js';
import {counters} from './protocol.js';
const $=id=>document.getElementById(id);let busy=false;
async function status(message=''){const {entries}=await Bridge.list();$('status').textContent=message+'\n'+JSON.stringify(counters(entries),null,2)+'\n'+entries.slice(-5).map(r=>r.requestId.slice(-8)+' '+r.state).join('\n');}
function action(id,fn){$(id).onclick=async()=>{if(busy)return;busy=true;try{await fn();await status();}catch(e){await status(e.message);}finally{busy=false;}};}
$('endpoint').value=configuration().endpoint||'';
action('configure',async()=>{if(!$('testOnly').checked)throw Error('Confirm isolated TEST deployment');await Bridge.clearSession();await configure($('endpoint').value.trim());});
action('form',async()=>{if(!configuration().endpoint)throw Error('Configure an isolated test endpoint first');location.href='rc5.html';});
action('login',()=>Bridge.setSession({token:'mock-only',user:{username:'demo',name:'Demo',role:'user',machines:[1]}}));
action('add',async()=>{for(let i=0;i<200;i++)await enqueue({requestId:crypto.randomUUID(),box:'A'+(10000+Date.now()%100000+i),machine:'1',date:new Date().toISOString().slice(0,10),productName:'TEST YARN',rollCount:'1',grossW:'2',tapeW:'0.3',netW:'1.7',rollType:'0.3',rollTypeCode:'C',shift:'DAY'});});
action('sync',async()=>{await Bridge.sync();if(!configuration().endpoint){const {Bridge:b}=await import('./bridge.js');b.cloud?.work();await b.sync();}});
action('logout',()=>Bridge.clearSession());
setInterval(()=>{if(!busy)status().catch(()=>{});},3000);status().catch(e=>$('status').textContent=e.message);
