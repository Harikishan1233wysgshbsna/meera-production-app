import {Bridge,enqueue,configuration} from './bridge.js';
import {counters} from './protocol.js';
import source from './rc5-upstream.js?raw';
const config=configuration();
if(!config.endpoint){location.replace('index.html');throw Error('Configure isolated TEST endpoint first');}
// Preload native APIs before any RC5 initialization. Never persist the session
// token into localStorage, portable archives, or the native SQLite records.
window.RC5Native={saveSession:async(token,user)=>{const saved=await Bridge.getSession();if(saved.token!==token||saved.owner!==String(user.username).toLowerCase())await Bridge.setSession({token,user});}};
localStorage.removeItem('production_entry_shared_session_v1');
const script=document.createElement('script');script.textContent=source;document.body.appendChild(script);
window.meeraApplyLiveApi(config.endpoint);
window.jsonp=async(url)=>{const u=new URL(url),body=Object.fromEntries(u.searchParams);delete body.callback;delete body._ts;const r=await Bridge.request({body});if(r.errorCode==='AUTH_REQUIRED'){await Bridge.clearSession();window.showLogin();}return r;};
window.apiGet=(action,params={})=>Bridge.request({body:{action,...params}});
window.apiPost=payload=>Bridge.request({body:payload});
const fetchOriginal=window.fetch.bind(window);
window.fetch=(input,options={})=>{const url=String(input?.url||input);if(url.includes('script.google.com/macros/')||url.includes('unconfigured.invalid/exec')){
 let body;try{body=JSON.parse(options.body||'{}');}catch{return Promise.reject(Error('Native API requires JSON body'));}
 return Bridge.request({body}).then(data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}}));
}return fetchOriginal(input,options);};
// Secure restoration is explicit and asynchronous; no token-bearing quick-open cache.
window.refreshQuickOpenButton=()=>{const b=document.getElementById('quickOpenButton');if(b)b.hidden=true;};
window.quickOpenSavedSession=async()=>{};window.resumeLogin=async()=>false;
const originalShowLogin=window.showLogin;
window.showLogin=()=>{void Bridge.clearSession();originalShowLogin();};
window.logout=async()=>{const token=window.sessionToken;await Bridge.clearSession();originalShowLogin();if(token)try{await Bridge.request({body:{action:'logout',token}});}catch{}};
const oldRead=window.readJsonCache,oldWrite=window.writeJsonCache;
let cacheScope='';
window.readJsonCache=key=>cacheScope?oldRead(cacheScope+key):null;
window.writeJsonCache=(key,value)=>{if(cacheScope)oldWrite(cacheScope+key,value);};
const oldEnter=window.enterApp;
window.enterApp=async(token,user,verified=true)=>{cacheScope='rc5-native:'+encodeURIComponent(config.endpoint)+':'+String(user.username).toLowerCase()+':';await oldEnter(token,user,verified);};
function legacy(row){const p=JSON.parse(row.payloadJson);return {...row,payload:p,box:p.box,ownerBox:row.owner+'|'+p.box,localSeq:0,nextCheckAt:0,lastError:row.error||'',state:row.state==='PRODUCTION_CONFIRMED'?'SAVED':row.state};}
window.v9Insert=row=>enqueue(row.payload);
window.v9GetAll=async()=> (await Bridge.list()).entries.map(legacy);
window.v9Get=async id=>(await window.v9GetAll()).find(r=>r.requestId===id)||null;
window.v9Put=async()=>{throw Error('Native queue state is controlled by the uploader');};
window.v9OnLogin=async()=>{window.v9Db={native:true};/* global lexical assignments happen in the bridge below */await Bridge.sync();};
// Classic RC5 declares queue state with let; bind adapter state in that same
// global lexical environment without copying the save form or calculations.
const bind=document.createElement('script');bind.textContent=`
 v9Db={native:true};v9StorageReady=true;
 v9OnLogin=async function(){v9Db={native:true};v9StorageReady=true;await window.RC5Native.refresh();};
 v9Process=async function(){};
 v9StartImmediateHandoff=async function(){await window.RC5Native.sync();};
 v9Work=async function(){await window.RC5Native.sync();};
 v9CheckOnly=async function(){await window.RC5Native.sync();};
 v9StatusLabel=function(state){return ({LOCAL_SAVED:'Saved on phone',UPLOADING:'Uploading — receipt unverified',CLOUD_RECEIVED:'Received in cloud — Production pending',SAVED:'Production confirmed',RETRY_PENDING:'Retry pending',REVIEW_REQUIRED:'Admin review'})[state]||state;};
 v9SetButton=function(){const b=document.getElementById('saveButton');if(b){b.disabled=v9LocalBusy||!v9StorageReady||!currentUser;b.textContent=v9LocalBusy?'Saving on phone…':'Save entry';}};
`;document.body.appendChild(bind);
const panel=document.createElement('aside');panel.style.cssText='position:sticky;top:0;z-index:100;background:#e6f5ff;padding:10px;color:#123;font:14px system-ui';panel.innerHTML='<a href="index.html">App settings</a> · <b>RC5 native queue</b> <span id="nativeCounters"></span>';document.body.prepend(panel);
async function refresh(){const {entries}=await Bridge.list();document.getElementById('nativeCounters').textContent=JSON.stringify(counters(entries));if(window.RC5Native.currentUser?.())await window.v9RefreshUi();}
window.RC5Native.refresh=refresh;window.RC5Native.sync=()=>Bridge.sync();
// Lexical currentUser/sessionToken are not window properties; use a getter.
const getters=document.createElement('script');getters.textContent='window.RC5Native.currentUser=()=>currentUser;window.RC5Native.token=()=>sessionToken;';document.body.appendChild(getters);
window.logout=async()=>{const token=window.RC5Native.token();await Bridge.clearSession();originalShowLogin();cacheScope='';if(token)try{await Bridge.request({body:{action:'logout',token}});}catch{}};
const originalPlanning=window.loadPlanningAssignments;
window.loadPlanningAssignments=async(...args)=>{await originalPlanning(...args);const user=window.RC5Native.currentUser();if(!user)return;const cached=window.readJsonCache('production_entry_planning_assignments_live_v2');if(cached){const restore=document.createElement('script');restore.textContent='if(!planningLoaded){planningAssignments='+JSON.stringify(cached).replace(/</g,'\\u003c')+';planningLoaded=true;planningLoadError="Offline cached planning; server permissions will be rechecked during upload.";updateProductControl();}';document.body.appendChild(restore);}};
const saved=await Bridge.getSession();if(saved.token&&saved.user&&saved.endpoint===config.endpoint){await window.enterApp(saved.token,saved.user,true);}
setInterval(()=>{if(window.RC5Native.currentUser()){Bridge.getSession().then(s=>{if(!s.owner)window.showLogin();}).catch(()=>{});refresh().catch(()=>{});Bridge.sync().catch(()=>{});}},5000);
window.addEventListener('online',()=>Bridge.sync().catch(()=>{}));
window.addEventListener('pageshow',()=>Bridge.sync().catch(()=>{}));
