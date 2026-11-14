
(function(){
 function ready(f){document.readyState!=="loading"?f():document.addEventListener("DOMContentLoaded",f)}
 ready(function(){
  var m=document.querySelector('.tab[data-view="material"]');
  if(m)m.textContent=m.textContent.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]\uFE0F?/gu,"").trim();
  var p=document.querySelector(".header-left p");
  if(p){var h=new Date().getHours(),g=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
   p.textContent=g+" 👋 • "+new Date().toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}
  var t=document.createElement("div");t.id="saveToast";t.textContent="✓ Saved successfully";document.body.appendChild(t);
  var fs=document.getElementById("formStatus"),last="";
  if(fs)new MutationObserver(function(){
   var txt=fs.textContent.trim();
   if(fs.classList.contains("ok")&&txt&&txt!==last){last=txt;t.textContent="✓ "+(txt.length>60?"Saved successfully":txt);t.classList.add("on");
    try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}
    setTimeout(function(){t.classList.remove("on");last=""},2200)}
  }).observe(fs,{attributes:true,childList:true,characterData:true,subtree:true});
  document.querySelectorAll(".tab").forEach(function(b){b.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})})});
 });
})();

;

(function(){document.addEventListener("DOMContentLoaded",function(){
 if(window.innerWidth<=760){[["grossWeight","Gross (kg)"],["tareWeight","Tare (auto)"],["netWeight","Net (auto)"]].forEach(function(x){var l=document.querySelector('label[for="'+x[0]+'"]');if(l)l.textContent=x[1]})}
 var ms0=document.getElementById("machineSearch");if(ms0&&window.innerWidth<=760)ms0.placeholder="Machine no.";
 var fs=document.getElementById("formStatus");if(!fs)return;var t;
 function chk(){clearTimeout(t);if(!fs.classList.contains("show"))return;
  var txt=fs.textContent||"";
  if(/Live Production Planning is unavailable/i.test(txt)){fs.classList.remove("show");return}
  var ms=(fs.classList.contains("ok")||fs.classList.contains("info"))?4500:7000;
  t=setTimeout(function(){fs.classList.remove("show")},ms)}
 new MutationObserver(chk).observe(fs,{attributes:true,attributeFilter:["class"],childList:true,characterData:true,subtree:true});
 fs.addEventListener("click",function(){fs.classList.remove("show")});
})})();

;

(function(){
const storageKey='meera_live_exec_url_v103';
const defaultLiveExec='https://unconfigured.invalid/exec';
function safeGet(){try{return localStorage.getItem(storageKey)||defaultLiveExec}catch(_){return defaultLiveExec}}
function safeSet(value){try{localStorage.setItem(storageKey,value);return true}catch(_){return false}}
function validUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='script.google.com'&&/^\/macros\/s\/[^/]+\/exec$/.test(u.pathname)}catch(e){return false}}
function setup(){const d=document.createElement('div');d.id='meeraLiveApiSetup';d.hidden=!!safeGet();
d.innerHTML='<div class="meera-setup-panel"><h2>MEERA LIVE Server Connection</h2><p>इस V102 HTML में TEST Server को हटा दिया गया है। LIVE Apps Script का सही <strong>/exec</strong> URL यहाँ एक बार डालें। TEST URL न डालें।</p><input id="meeraLiveExecInput" autocomplete="off" type="url" placeholder="https://script.google.com/macros/s/.../exec"><p id="meeraLiveExecError" class="meera-setup-error" aria-live="polite"></p><button id="meeraLiveExecSave" type="button">Connect LIVE Server</button></div>';
document.body.appendChild(d);
const b=document.createElement('button');b.id='meeraApiSettingsBtn';b.type='button';b.textContent='LIVE API ⚙';b.title='Change LIVE Web App URL';document.body.appendChild(b);
b.addEventListener('click',()=>{document.getElementById('meeraLiveExecInput').value=window.meeraActiveLiveExec||safeGet();d.hidden=false});
document.getElementById('meeraLiveExecSave').addEventListener('click',()=>{const u=document.getElementById('meeraLiveExecInput').value.trim();const err=document.getElementById('meeraLiveExecError');if(!validUrl(u)){err.textContent='सही Apps Script /exec URL दर्ज करें।';return;}safeSet(u);window.meeraActiveLiveExec=u; if(typeof window.meeraApplyLiveApi==='function'){window.meeraApplyLiveApi(u);d.hidden=true;} else {err.textContent='App setup is still loading. Reopen this page and try again.';}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();

;

(function(){
  function syncTab(){
    var tab=document.querySelector('.tab[data-view="dashboard"]');
    if(!tab)return;
    if(tab.classList.contains('active')&&window.innerWidth<=760){
      try{tab.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});}catch(e){}
    }
  }
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('.tabs .tab').forEach(function(tab){tab.addEventListener('click',function(){if(window.innerWidth<=760){try{tab.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});}catch(e){}};});});
    syncTab();
  });
})();

;

/* Prevent silent page reload / disappearing credentials when app startup has failed. */
(function(){
  document.addEventListener('submit',function(event){
    if(!event.target || event.target.id!=='loginForm')return;
    event.preventDefault();
    if(!window.__meeraLoginHandlerReady){
      var status=document.getElementById('loginStatus');
      if(status){status.textContent='App Login script failed to start. Check Browser Console (F12) and reload without clearing saved data.';status.className='status show err';}
    }
  },true);
})();

;

(function(){
  var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var isStandalone=window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
  var b=document.getElementById('iphoneInstallBanner');
  if(b&&isIOS&&!isStandalone)b.style.display='block';
})();

;

/* ---------------- Configuration ----------------
   Replace API with the /exec URL of the deployed shared Google Apps Script backend.
   Do not put a password or client secret in this HTML file.
------------------------------------------------- */
let API = "https://unconfigured.invalid/exec";
// Live Planning is served by the backend to avoid browser/CSP blocks on Google Sheets JSONP.
let WEB_APP_URL = API;
window.meeraApplyLiveApi = function(url){ API=url; WEB_APP_URL=url; };
const ENTRY_SHEET = "UNCONFIGURED_SHEET";
const ENTRY_GID = "1166271357";
const PLANNING_SHEET_ID = "UNCONFIGURED_SHEET";
const PLANNING_TAB = "Production Planning";
const PLANNING_GID = "1102952581";
const PLANNING_CACHE_KEY = "production_entry_planning_assignments_live_v2";
const PLANNING_FALLBACK_ASSIGNMENTS = {"1":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"2":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"3":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"4":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"5":["1110-110/1 NY (S)","1135-110/1 NY (Z)"],"6":["1110-110/1 NY (S)","1135-110/1 NY (Z)"],"7":["1150-110/1 NY (S)","1150-110/1 NY (Z)"],"8":["1150-110/1 NY (S)","1150-110/1 NY (Z)"],"9":["1150-110/1 NY (S)","1150-110/1 NY (Z)"],"10":["1030-110/1 NY (S)","1030-110/1 NY (Z)"],"11":["1030-110/1 NY (S)","1030-110/1 NY (Z)"],"12":["1030-110/1 NY (S)","1030-110/1 NY (Z)"],"13":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"14":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"15":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"16":["1080-110/1 NY (S)","1080-110/1 NY (Z)"],"17":["1150-110/1 NY (S)","1150-110/1 NY (Z)"],"18":["1025-110/1 NY (S)","1025-110/1 NY (Z)"],"19":["1065-110/1 NY (S)","1065-110/1 NY (Z)"],"20":["1065-110/1 NY (S)","1065-110/1 NY (Z)"],"21":["1025-110/1 NY (S)","1025-110/1 NY (Z)"],"22":["1005-110/1 NY (S)","1005-110/1 NY (Z)"],"23":["1005-110/1 NY (S)","1005-110/1 NY (Z)"],"24":["2251-230/1 P"],"25":["1650-150/2 MONO","2635-75/2 MONO"],"26":["5055-40/2 MONO P"],"27":["5055-40/2 MONO P"],"28":["5055-40/2 MONO P"],"29":["5055-40/2 MONO P"],"30":["5055-40/2 MONO P"],"31":["5055-40/2 MONO P"],"32":["2424-70/2 NYLON"],"33":["1575-185/1 P-S","1565-185/1 P-[Z]"],"34":["1565-185/1 P-[S]","1565-185/1 P-[Z]"],"35":["7025-135/1 NY [S]","7025-135/1 NY [Z]"],"36":["7025-135/1 NY [S]","7025-135/1 NY [Z]"],"37":["7030-135/1 NY [S]","7030-135/1 NY [Z]"],"38":["7030-135/1 NY [S]","7030-135/1 NY [Z]"],"39":["7011-135/1 NY [S]","7011-135/1 NY [Z]"],"40":["7011-135/1 NY [S]","7011-135/1 NY [Z]"],"41":["7005-135/1 NY [S]","7005-135/1 NY [Z]"],"42":["7015-135/1 NY [S]","7050-135/1 SP (Z)"],"43":["7150-135/1 NY [S]","7150-135/1 NY [Z]"],"44":["7005-135/1 NY [S]","7005-135/1 NY [Z]"],"45":["7011-135/1 NY [S]","7011-135/1 NY [Z]"],"46":["7011-135/1 NY [S]","7011-135/1 NY [Z]"],"47":["7041-135/1 NY [S]","7145-135/1 NY [Z]"],"48":["7041-135/1 NY [S]","7145-135/1 NY [Z]"],"49":["7035-135/1 NY [S]","7035-135/1 NY [Z]"],"50":["7035-135/1 NY [S]","7035-135/1 NY [Z]"],"51":["7035-135/1 NY [S]","7035-135/1 NY [Z]"],"52":["7035-135/1 NY [S]","7035-135/1 NY [Z]"],"53":["7032-135/1 NY [S]","7032-135/1 NY [Z]"],"54":["7070-135/1 SP (S)","7035-135/1 NY [Z]"],"55":["7070-135/1 SP (S)","7035-135/1 NY [Z]"],"56":["7070-135/1 SP (S)","7035-135/1 NY [Z]"],"57":["7070-135/1 SP (S)","7035-135/1 NY [Z]"],"58":["7040-135/1 NY [S]","7080-135/1 NY [Z]"],"59":["7040-135/1 NY [S]","7035-135/1 NY [Z]"],"60":["7080-135/1 NY [Z]","7040-135/1 NY [S]"],"61":["7100-135/1 NY [Z]","7040-135/1 NY [S]"],"62":["7035-135/1 NY [S]","7100-135/1 NY [Z]"],"63":["7035-135/1 NY [S]","7035-135/1 NY [Z]"],"64":["7070-135/1 SP (S)","7035-135/1 NY [Z]"],"65":["7070-135/1 SP (S)","7035-135/1 NY [Z]"],"66":["7025-135/1 NY [S]","7025-135/1 NY [Z]"],"67":["7025-135/1 NY [S]","7025-135/1 NY [Z]"],"68":["7025-135/1 NY [S]","7025-135/1 NY [Z]"],"69":["7025-135/1 NY [S]","7025-135/1 NY [Z]"],"70":["7070-135/1 SP (S)","7050-135/1 SP (Z)"],"71":["7070-135/1 SP (S)","7050-135/1 SP (Z)"],"72":["7070-135/1 SP (S)","7050-135/1 SP (Z)"],"73":["7070-135/1 SP (S)"],"74":["7070-135/1 SP (S)"],"75":["1820-180/1 NY [Z]","1820-180/1 NY [S]"],"76":["1820-180/1 NY [Z]","1820-180/1 NY [S]"],"77":["1820-180/1 NY [S]","1820-180/1 NY [Z]"],"78":["1810-180/1 NY [S]","1810-180/1 NY [Z]"],"79":["1810-180/1 NY [S]","1810-180/1 NY [Z]"],"80":["1810-180/1 NY [S]","1810-180/1 NY [Z]"],"81":["1910-190/1 NY [S]","1905-190/1 NY [Z]"],"82":["1811-180/1 NY [S]","1811-180/1 NY [Z]"],"83":["1840-180/1 NY (S)","1840-180/1 NY (Z)","2070-190/1 NY [S]","2070-190/1 NY [Z]"],"84":["1838-180/1 NY (Z)"],"85":["1836-180/1 NY (Z)","2080-190/1 NY [Z]"],"86":["1910-190/1 NY [S]","1905-190/1 NY [Z]"],"87":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"88":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"89":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"90":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"91":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"92":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"93":["1830-180/1 NY [S]","1830-180/1 NY [Z]"],"94":["17010-NY [S]","17010-NY [Z]","1802-180/1 NY (S)","1802-180/1 NY (Z)"],"95":["2155-215/1 P (S)","2155-215/1 P (Z)"],"96":["2155-215/1 P (S)","2155-215/1 P (Z)"],"97":["1811-180/1 NY [S]","1811-180/1 NY [Z]"],"98":["1811-180/1 NY [S]","1811-180/1 NY [Z]"],"99":["2155-215/1 P (S)","2155-215/1 P (Z)"],"100":["2151-215/1 P [S]","2151-215/1 P [Z]"],"101":["2115-225/1 P [S]","2115-225/1 P [Z]"],"102":["3552-240/1"],"103":["PURE COFFEE 375 DR"],"104":["PURE COFFEE 375 DR"],"105":["PURE COFFEE 375 DR"],"106":["2851-275/1 COTTON"],"107":["PURE COFFEE 375 DR"],"108":["ANTIQUE COFFEE"],"109":["B COCO","ANTIQUE COFFEE"],"110":["B COCO","1010-110/1 NY (Z)"],"111":["1811-180/1 NY [S]","1811-180/1 NY [Z]"]};
const MACHINE_MIN = 1;
const MACHINE_MAX = 111;
const ROLL_TYPES = ["A","B","C","D"];
const ROLL_OPTION_DEFINITIONS = {A:{value:"0.38",label:"A — 0.38 kg"},B:{value:"0.29",label:"B — 0.29 kg"},C:{value:"0.30",label:"C — 0.30 kg"},D:{value:"0.25",label:"D — 0.25 kg"}};
const SESSION_KEY = "production_entry_shared_session_v1";
const LOCAL_BACKUP_PREFIX = "production_entries_backup_v2_";
const MASTER_CACHE_KEY = "production_entry_master_cache_masterSheet_v3";
const ENTRIES_CACHE_KEY = "production_entry_entries_cache_v1";

let sessionToken = "";
let sessionVerified = false;
let pendingEntrySaves=0;
let currentUser = null;
let allowedMachines = [];
let masterData = [];
let planningAssignments = Object.create(null);
let planningLoaded = false;
let planningLoadError = "";
let entries = [];
let users = [];
let productListTimer = null;
let machineListTimer = null;

function $(id){return document.getElementById(id)}
function localISODate(){
  const d=new Date();
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function escapeHtml(value){
  const d=document.createElement("div"); d.textContent=value==null?"":String(value); return d.innerHTML;
}
function text(value){return value==null?"":String(value).trim()}
function num(value, fallback=0){const n=parseFloat(value);return Number.isFinite(n)?n:fallback}
function round3(value){return Math.round((num(value)+Number.EPSILON)*1000)/1000}
function formatNum(value){return round3(value).toFixed(3)}
function getBoxPrefix(){
  const selectedAdminPrefix=isAdmin()&&$("adminBoxPrefix")?$("adminBoxPrefix").value:"";
  return String(selectedAdminPrefix||(currentUser&&currentUser.boxPrefix)||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,3);
}
function boxDigits(value){return String(value==null?"":value).replace(/[^0-9]/g,"")}
function updateBoxPreview(){
  const prefix=getBoxPrefix(),digits=boxDigits($("box")&&$("box").value);
  if($("boxPrefixBadge"))$("boxPrefixBadge").textContent=prefix||"NO PREFIX";
  if($("boxPreview")){const u=unitForMachine($("machine")&&$("machine").value);$("boxPreview").textContent=digits?"Box: "+prefix+digits+(u?"  •  Unit "+u:""):"पहला Box Number लिखें (उदाहरण: "+prefix+"32340)";}
}
function allMachines(){return Array.from({length:MACHINE_MAX-MACHINE_MIN+1},(_,i)=>i+MACHINE_MIN)}
function normaliseMachines(value){
  if(Array.isArray(value)) return [...new Set(value.map(Number).filter(n=>Number.isInteger(n)&&n>=MACHINE_MIN&&n<=MACHINE_MAX))].sort((a,b)=>a-b);
  const out=[];
  String(value||"").split(/[,;\s]+/).forEach(part=>{
    if(!part)return;
    const range=part.match(/^(\d+)\s*-\s*(\d+)$/);
    if(range){let a=Number(range[1]),b=Number(range[2]);if(a>b)[a,b]=[b,a];for(let n=a;n<=b;n++)if(n>=MACHINE_MIN&&n<=MACHINE_MAX)out.push(n)}
    else {const n=Number(part);if(Number.isInteger(n)&&n>=MACHINE_MIN&&n<=MACHINE_MAX)out.push(n)}
  });
  return [...new Set(out)].sort((a,b)=>a-b);
}
function normaliseRollTypes(value){
  const raw=Array.isArray(value)?value:String(value||"").split(/[,;\s]+/);
  return [...new Set(raw.map(v=>String(v||"").trim().toUpperCase()).filter(v=>ROLL_TYPES.includes(v)))];
}
function machineDefaultRollTypes(machine){
  const n=Number(machine); if(!Number.isInteger(n)||n<MACHINE_MIN||n>MACHINE_MAX)return [];
  return n<=74?["A","B"]:["C","D"];
}
function unitForMachine(machine){
  const n=Number(machine); return Number.isInteger(n)&&n>=MACHINE_MIN&&n<=MACHINE_MAX?(n>=75?"2":"1"):"";
}
function effectiveRollTypes(machine=selectedMachineNumber()){
  if(isAdmin())return ROLL_TYPES.slice();
  const explicit=normaliseRollTypes(currentUser&&currentUser.rollTypes);
  if(explicit.length)return explicit;
  if(machine!=null)return machineDefaultRollTypes(machine);
  const inferred=[];
  allowedMachines.forEach(n=>machineDefaultRollTypes(n).forEach(code=>{if(!inferred.includes(code))inferred.push(code)}));
  return inferred;
}
function rollTypeCode(value){
  const raw=String(value==null?"":value).trim().toUpperCase();
  if(ROLL_TYPES.includes(raw))return raw;
  const n=Number(value); if(n===0.38)return "A";if(n===0.29)return "B";if(n===0.30)return "C";if(n===0.25)return "D";
  return "";
}
function syncRollTypeOptions(){
  // SAFETY: never auto-select A/B/C/D. After every machine selection the
  // operator MUST explicitly select the correct roll type for this box.
  const select=$("rollType"); if(!select)return;
  const machine=selectedMachineNumber();
  const allowed=machine==null?[]:effectiveRollTypes(machine);
  const placeholder=machine==null?"— Select Machine First —":"— Select Roll Type * —";
  select.innerHTML='<option value="" selected disabled>'+placeholder+'</option>'+
    allowed.map(code=>'<option value="'+ROLL_OPTION_DEFINITIONS[code].value+'" data-roll-code="'+code+'">'+ROLL_OPTION_DEFINITIONS[code].label+'</option>').join("");
  select.value="";
  select.disabled=!allowed.length;
  select.required=true;
  const hint=$("rollTypeHint");
  if(hint){
    if(machine==null)hint.textContent="Select a machine first. Roll Type is mandatory for EVERY box.";
    else if(!allowed.length)hint.textContent="No permitted roll type for this machine; ask admin.";
    else hint.textContent="Machine "+machine+" permits "+allowed.join(" / ")+". Select one manually for every entry.";
  }
  calcWeight();
}
function getBoxPrefixForUser(user){return String(user&&user.boxPrefix||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,3)}
function isAdmin(){return currentUser && String(currentUser.role).toLowerCase()==="admin"}
function showStatus(id,message,kind="info"){
  const el=$(id); if(!el)return;
  el.textContent=message; el.className="status show "+kind;
}
function hideStatus(id){const el=$(id);if(el){el.textContent="";el.className="status"}}
function setSessionConnectionState(verified,message){
  sessionVerified=!!verified;
  v9SetButton();
  if(sessionVerified)hideStatus("connectionBanner");
  else showStatus("connectionBanner",message||"Quick Open is in read-only mode while the server session is checked. Shared saves need a connection.","info");
}

/* -------- Existing sheet API helpers -------- */
function buildUrl(action,params={}){
  if (!API) throw new Error("LIVE API URL not configured. Tap LIVE API settings.");
  const q=new URLSearchParams({action,...params,_ts:String(Date.now())});
  return API+"?"+q.toString();
}
function parseMaybeJson(raw){
  const t=String(raw||"").trim();
  if(!t)throw new Error("Empty response");
  return JSON.parse(t);
}
const API_GET_TIMEOUT_MS = 45000;
function jsonp(url,timeoutMs=API_GET_TIMEOUT_MS){
  return new Promise((resolve,reject)=>{
    const name="__production_jsonp_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const script=document.createElement("script");script.async=true;script.referrerPolicy="no-referrer";
    const cleanup=()=>{delete window[name];script.remove()};
    const timer=setTimeout(()=>{cleanup();reject(new Error("Server is taking longer than usual. Check your connection and try again."))},timeoutMs);
    window[name]=(data)=>{clearTimeout(timer);cleanup();resolve(data)};
    script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("Could not connect to the server. Check your internet connection and retry."))};
    script.src=url+(url.includes("?")?"&":"?")+"callback="+encodeURIComponent(name);
    (document.head||document.body||document.documentElement).appendChild(script);
  });
}
async function apiGet(action,params={}){
  // Apps Script redirects cross-origin fetches; JSONP goes straight to the
  // deployed endpoint and avoids waiting for a CORS failure before retrying.
  return await jsonp(buildUrl(action,params));
}
async function apiPost(payload) {
  if (!API) throw new Error("LIVE API URL not configured. Tap LIVE API settings.");
  const body = JSON.stringify(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    // A no-cors response never proves the Apps Script request was saved.
    await fetch(API, {method:"POST", mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body, signal:controller.signal});
    return {ok:true,queued:true,transport:"fetch",verified:false};
  } catch (error) {
    throw new Error(error && error.name === "AbortError"
      ? "POST timed out. The request MAY already be saved; verify before retrying."
      : "POST connection failed. The request MAY already be saved; verify before retrying.");
  } finally {
    clearTimeout(timeout);
  }
}
async function sha256(value){
  if(!window.crypto || !crypto.subtle) throw new Error("Secure login requires HTTPS in the browser.");
  const bytes=new TextEncoder().encode(String(value));
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

/* -------- Shared server authentication -------- */
async function login(event){
  event.preventDefault();
  const username=$("loginUsername").value.trim().toLowerCase(),password=$("loginPassword").value;
  const button=$("loginButton");button.disabled=true;button.textContent="Checking…";hideStatus("loginStatus");
  try{
    const verifier=await sha256(username+":"+password);
    const timeSlot=Math.floor(Date.now()/30000);
    // One-request login removes the extra challenge round trip. The proof is
    // valid only for a short time and the password itself is never sent.
    let result=await apiGet("fastLogin",{username,proof:await sha256(verifier+":"+timeSlot),timeSlot});
    // The 30-second fast proof can fail when a PC clock is out of sync.
    // Retry via server-issued challenge once; this never skips credential checks.
    if(!result||!result.ok||!result.token){
      const challenge=await apiGet("challenge",{username});
      if(!challenge||!challenge.challengeId||!challenge.nonce){
        throw new Error("LIVE Backend Login Challenge route is unavailable. Existing Apps Script Web App needs a New Version deployment. "+String(challenge&&challenge.error||""));
      }
      result=await apiGet("login",{username,challengeId:challenge.challengeId,proof:await sha256(verifier+challenge.nonce)});
    }
    if(!result||!result.ok||!result.token)throw new Error(result&&result.error?result.error:"Invalid username or password.");
    await enterApp(result.token,result.user,true);$("loginPassword").value="";
  }catch(error){showStatus("loginStatus",error.message||"Login failed.","err")}
  finally{button.disabled=false;button.textContent="🔐 Login"}
}
function refreshQuickOpenButton(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}catch(e){}
  const row=$("quickOpenRow"),button=$("quickOpenButton");
  if(!row||!button)return;
  const available=!!(saved&&saved.token&&saved.user);
  row.classList.toggle("hidden",!available);
  if(available)button.textContent="⚡ Quick Open — "+(saved.user.name||saved.user.username||"Last account");
}
async function quickOpenSavedSession(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}catch(e){}
  if(!saved||!saved.token||!saved.user){showStatus("loginStatus","No saved session on this device. Sign in with ID and password while connected to the server.","err");return}
  const button=$("quickOpenButton");if(button){button.disabled=true;button.textContent="Opening saved session…"}
  await enterApp(saved.token,saved.user,false);
  if(button){button.disabled=false;button.textContent="⚡ Quick Open — "+(saved.user.name||saved.user.username||"Last account")}
  verifyQuickOpenSession(saved);
}
async function verifyQuickOpenSession(saved){
  try{
    const me=await apiGet("me",{token:saved.token});
    if(!me||!me.ok){showLogin();showStatus("loginStatus",me&&me.error||"This saved session expired. Sign in again while connected.","err");refreshQuickOpenButton();return}
    const user=me.user||saved.user||{};
    currentUser=user;currentUser.machines=normaliseMachines(currentUser.machines);currentUser.rollTypes=normaliseRollTypes(currentUser.rollTypes);currentUser.boxPrefix=getBoxPrefixForUser(currentUser);
    allowedMachines=isAdmin()?allMachines():currentUser.machines;
    /* Session remains in native secure storage. */
    $("userBadge").textContent=(currentUser.name||currentUser.username||"User")+" • "+(isAdmin()?"Admin":"User");
    $("adminTab").classList.toggle("hidden",!isAdmin());$("adminPrefixGroup").classList.toggle("hidden",!isAdmin());
    renderMachineResults($("machineSearch").value||"");setSessionConnectionState(true);reliableButton();
    loadEntries().finally(()=>{loadPlanningAssignments();loadMaster();if(isAdmin())loadUsers();});refreshQuickOpenButton();
    v9OnLogin().catch(()=>{});if(window.meeraMonitorStart)window.meeraMonitorStart();
  }catch(error){
    setSessionConnectionState(false,"Opened with your saved session. Server is unreachable, so this is read-only; shared entries can save after connection returns.");
  }
}
async function restoreSession(){
  const query=new URLSearchParams(location.search),sso=query.get("sso");
  if(sso){history.replaceState({},document.title,location.pathname+location.hash);try{const me=await apiGet("me",{token:sso});if(me&&me.ok){await enterApp(sso,me.user,true);return true}}catch(e){}}
  refreshQuickOpenButton();return false;
}
async function enterApp(token,user,verified=true){
  sessionToken=token;currentUser=user||{};currentUser.machines=normaliseMachines(currentUser.machines);currentUser.rollTypes=normaliseRollTypes(currentUser.rollTypes);currentUser.boxPrefix=getBoxPrefixForUser(currentUser);
  await window.RC5Native.saveSession(sessionToken,currentUser);
  allowedMachines=isAdmin()?allMachines():currentUser.machines;
  $("loginView").classList.add("hidden");$("appShell").classList.remove("hidden");
  $("userBadge").textContent=(currentUser.name||currentUser.username||"User")+" • "+(isAdmin()?"Admin":"User");
  $("adminTab").classList.toggle("hidden",!isAdmin());$("adminPrefixGroup").classList.toggle("hidden",!isAdmin());
  if(isAdmin())$("adminBoxPrefix").value="";
  planningAssignments=Object.create(null);planningLoaded=false;planningLoadError="";v12MasterOnline=false;v12MasterMode=false;v12SyncProductMode();
  renderMachineResults("");resetForm();showView("home");
  loadCachedData();
  if(verified){
    setSessionConnectionState(true);reliableButton();
    loadEntries().finally(()=>{loadPlanningAssignments();loadMaster();if(isAdmin())loadUsers();});
    v9OnLogin().catch(()=>{});if(window.meeraMonitorStart)window.meeraMonitorStart();
  }else{
    // Quick Open is read-only and must not treat device-local planning data as
    // authoritative. Wait for the shared server planning data.
    planningAssignments=Object.create(null);
    planningLoaded=false;
    planningLoadError="Waiting for live Production Planning from the shared server.";
    updateProductControl();
    setSessionConnectionState(false,"Quick Open: waiting for the shared server. Product selection is disabled until live planning is loaded.");
  }
}
function showLogin(){
  sessionToken="";sessionVerified=false;currentUser=null;allowedMachines=[];entries=[];localStorage.removeItem(SESSION_KEY);hideStatus("connectionBanner");
  $("appShell").classList.add("hidden");$("loginView").classList.remove("hidden");$("loginUsername").focus();refreshQuickOpenButton();
}
async function logout(){const token=sessionToken;try{if(token)await apiPost({action:"logout",token})}catch(e){}showLogin()}

/* -------- Searchable machine/product controls -------- */
function renderMachineResults(term=""){
  const box=$("machineList"); if(!box)return;
  const t=String(term||"").toLowerCase().trim();
  const matches=allowedMachines.filter(n=>!t||String(n).includes(t));
  box.innerHTML="";
  if(!matches.length){box.innerHTML='<div class="empty">No assigned machine matches this search.</div>';return}
  matches.forEach(n=>{
    const b=document.createElement("button"); b.type="button"; b.textContent="Machine "+n;
    b.addEventListener("mousedown",event=>event.preventDefault()); b.addEventListener("click",()=>selectMachine(n)); box.appendChild(b);
  });
}
function selectedMachineNumber(){
  const value=Number($("machine")&&$("machine").value);
  return Number.isInteger(value)&&allowedMachines.includes(value)?value:null;
}
function normaliseProductKey(value){return text(value).replace(/\s+/g," ").toLowerCase()}
function assignedProductNames(machine=selectedMachineNumber()){
  return machine==null?[]:(planningAssignments[String(machine)]||[]);
}
function isProductAssignedToMachine(productName,machine=selectedMachineNumber()){
  const key=normaliseProductKey(productName);
  return Boolean(key&&planningLoaded&&assignedProductNames(machine).some(name=>normaliseProductKey(name)===key));
}
function clearProductSelection(clearText=true){
  if($("prodSearch")){if(clearText)$("prodSearch").value="";$("selectedProduct").value="";$("yarnCode").value="";$("prodList").classList.remove("show");}
  updateProductControl();
}
function updateProductControl(){
  const input=$("prodSearch"),hint=$("productHint"),machine=selectedMachineNumber();
  if(!input)return;
  const masterReady=masterData.length>0;
  const enabled=Boolean(machine!=null&&(v12MasterMode?v12MasterOnline:planningLoaded));
  input.disabled=!enabled;
  if(!machine){
    input.placeholder="Select a machine first...";
    if(hint)hint.textContent="Select a machine first; only products assigned to that machine will be shown.";
  }else if(!v12MasterMode&&!planningLoaded){
    input.placeholder="Loading production planning...";
    if(hint)hint.textContent=planningLoadError||"Loading assignments from Production Planning...";
  }else if(!masterReady){
    input.placeholder="Product master unavailable";
    if(hint)hint.textContent="Product master is unavailable; product selection is disabled.";
  }else{
    input.placeholder=v12MasterMode?"Search verified Master Data (e.g. 1811)":"Type an assigned product...";
    if(hint)hint.textContent=v12MasterMode?"Select exact [S] or [Z] Master product. Planning remains unchanged.":"Only products assigned to the selected machine are shown."
  }
}
async function selectMachine(number){
  const n=Number(number); if(!allowedMachines.includes(n))return;
  $("machine").value=String(n); $("machineSearch").value="Machine "+n; $("machineList").classList.remove("show");
  const chosenUnit=unitForMachine(n);
  // Preserve manually started series within one unit. Switching units must
  // start a new manual series, never carry an A sequence into B (or vice versa).
  if(window.__lastUnit&&window.__lastUnit!==chosenUnit){
    $("box").value="";window.__boxManual=false;
    const note=document.getElementById("v12BoxStatus");
    if(note)note.textContent="Unit बदला गया: इस Unit का पहला Box Number खुद भरें।";
  }
  window.__lastUnit=chosenUnit;updateBoxPreview();
  v12MasterMode=false;clearProductSelection(true); syncRollTypeOptions();v12SyncProductMode();
  v12CheckServerBox(n).catch(()=>{});

  // SPEED OPTIMIZATION: keep the already-loaded shared planning data in memory.
  // This lets the assigned products appear immediately when the operator changes
  // machines. A live refresh runs in the background and updates the list when it
  // returns, so another device's stale localStorage is never used.
  const hasLivePlan=planningLoaded && Object.keys(planningAssignments||{}).length>0;
  updateProductControl();
  const hint=$("productHint");
  if(hasLivePlan){
    if(hint)hint.textContent="✓ Assigned products ready — checking for latest Production Planning…";
    renderProductResults("");
    $("prodList").classList.add("show");
    refreshAllPlanning(true).then(()=>{
      if(selectedMachineNumber()===n && planningLoaded){
        renderProductResults($("prodSearch").value||"");
        $("prodList").classList.add("show");
        if(hint)hint.textContent="✓ Live assigned products updated.";
      }
    });
    return;
  }

  planningLoaded=false;
  updateProductControl();
  if(hint)hint.textContent="Loading shared Production Planning…";
  await refreshAllPlanning(true);
  if(selectedMachineNumber()===n && planningLoaded){
    renderProductResults("");
    $("prodList").classList.add("show");
  }
}
function filterMachineResults(){
  const value=$("machineSearch").value; const raw=value.replace(/[^0-9]/g,"");
  const exact=raw&&allowedMachines.includes(Number(raw))&&(value===raw||value.toLowerCase()==="machine "+raw);
  if(exact)selectMachine(Number(raw));
  else if($("machine").value){
    $("machine").value="";
    clearProductSelection(true); syncRollTypeOptions();
  }
  renderMachineResults(value.replace(/machine/i,"")); $("machineList").classList.add("show");
}
function showMachineResults(){renderMachineResults($("machineSearch").value.replace(/machine/i,""));$("machineList").classList.add("show")}
function hideMachineResults(){machineListTimer=setTimeout(()=>$("machineList").classList.remove("show"),180)}

function uniqueProducts(){
  const seen=new Set(); return masterData.filter(p=>{const key=(normaliseProductKey(p.name)+"|"+normaliseProductKey(p.yarn));if(!p.name||seen.has(key))return false;seen.add(key);return true})
}
let v12MasterMode=false;
let v12MasterOnline=false;
function v12SyncProductMode(){
 const add=document.getElementById("v12AddProduct"),back=document.getElementById("v12BackPlanning"),info=document.getElementById("v12ProductStatus");
 if(add){add.disabled=!sessionVerified||!v12MasterOnline||selectedMachineNumber()==null;add.hidden=v12MasterMode}
 if(back)back.hidden=!v12MasterMode;
 if(info)info.textContent=v12MasterMode?"MASTER LOOKUP • Choose an exact product. Planning sheet will not be modified.":"PLANNING MODE • Choose assigned product, or use + Add Production from verified Master.";
}
function v12SetMasterMode(on){
 if(on&&(!sessionVerified||!v12MasterOnline||selectedMachineNumber()==null)){
   showStatus("formStatus","Connect online, load Master Data and select a machine before using Add Production.","err");return;
 }
 v12MasterMode=!!on;clearProductSelection(true);v12SyncProductMode();updateProductControl();renderProductResults("");$("prodList").classList.add("show");$("prodSearch").focus();
}
function v12IsMasterProduct(name){return v12MasterOnline&&uniqueProducts().some(p=>normaliseProductKey(p.name)===normaliseProductKey(name))}
function assignedMasterProducts(){
  const assigned=new Set(assignedProductNames().map(normaliseProductKey));
  return uniqueProducts().filter(p=>assigned.has(normaliseProductKey(p.name)));
}
function assignedProductList(){const masterMap=new Map(uniqueProducts().map(p=>[normaliseProductKey(p.name),p]));return assignedProductNames().filter(nm=>!/^\d+$/.test(String(nm||"").trim())).map(nm=>{const mp=masterMap.get(normaliseProductKey(nm));return{name:nm,yarn:mp?(mp.yarn||""):""}})}
function renderProductResults(term=""){
  const box=$("prodList"); if(!box)return;
  const machine=selectedMachineNumber();
  const t=String(term||"").toLowerCase().trim();
  box.innerHTML="";
  if(machine==null){box.innerHTML='<div class="empty">Select a machine first.</div>';return}
  if(!v12MasterMode&&!planningLoaded){box.innerHTML='<div class="empty">Production planning is still loading.</div>';return}
  const source=v12MasterMode?uniqueProducts():assignedProductList();
  const matches=source.filter(p=>!t||p.name.toLowerCase().includes(t)||(p.yarn||"").toLowerCase().includes(t));
  if(!matches.length){box.innerHTML='<div class="empty">No matching '+(v12MasterMode?'Master Data product':'assigned product')+'. Do not type an unknown product.</div>';return}
  matches.slice(0,30).forEach(p=>{
    const b=document.createElement("button"); b.type="button";
    b.textContent=p.name;
    // Keep the text input focused while a desktop mouse chooses a suggestion.
    b.addEventListener("mousedown",event=>event.preventDefault());
    b.addEventListener("click",()=>selectProduct(p)); box.appendChild(b);
  });
}
function selectProduct(product){
  const machine=selectedMachineNumber();
  if(machine==null||!(v12MasterMode?v12IsMasterProduct(product&&product.name):isProductAssignedToMachine(product&&product.name,machine))){
    showStatus("formStatus","That product is not assigned to the selected machine.","err");
    clearProductSelection(true); return;
  }
  $("prodSearch").value=product.name; $("selectedProduct").value=product.name; $("yarnCode").value=product.yarn||""; $("prodList").classList.remove("show"); calcWeight();
}
function filterProductResults(){
  const value=$("prodSearch").value;
  const exact=(v12MasterMode?uniqueProducts():assignedProductList()).find(p=>normaliseProductKey(p.name)===normaliseProductKey(value));
  if(exact)selectProduct(exact);
  else {$("selectedProduct").value="";$("yarnCode").value="";}
  renderProductResults(value); $("prodList").classList.add("show");
}
function showProductResults(){renderProductResults($("prodSearch").value);$("prodList").classList.add("show")}
function hideProductResults(){productListTimer=setTimeout(()=>$("prodList").classList.remove("show"),180)}

/* -------- Production Planning assignments -------- */
function gvizPlanningJsonp(selector){
  return new Promise((resolve,reject)=>{
    const name="__production_planning_jsonp_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const query={tq:"select A, B where A is not null and B is not null",tqx:"responseHandler:"+name};
    if(selector&&selector.gid)query.gid=PLANNING_GID;else query.sheet=PLANNING_TAB;
    const params=new URLSearchParams(query);
    const script=document.createElement("script"); script.async=true; script.referrerPolicy="no-referrer";
    const cleanup=()=>{delete window[name];script.remove()};
    const timer=setTimeout(()=>{cleanup();reject(new Error("request timed out"))},20000);
    window[name]=(data)=>{clearTimeout(timer);cleanup();resolve(data)};
    script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("network or browser security blocked the request"))};
    script.src="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(PLANNING_SHEET_ID)+"/gviz/tq?"+params.toString();
    (document.head||document.body||document.documentElement).appendChild(script);
  });
}
function planningCellValue(cell){return cell&&cell.v!==undefined?cell.v:(cell&&cell.f!==undefined?cell.f:"")}
function planningMachineNumber(value){
  const raw=text(value).replace(/^machine\s*/i,"").trim(),n=Number(raw);
  return Number.isInteger(n)&&n>=MACHINE_MIN&&n<=MACHINE_MAX?n:null;
}
function planningResponseError(response){
  const first=response&&Array.isArray(response.errors)?response.errors[0]:null;
  return text(first&&(first.detailed_message||first.message))||"Production Planning returned an invalid response";
}
function parsePlanningAssignments(response){
  if(!response||response.status!=="ok")throw new Error(planningResponseError(response));
  const parsed=Object.create(null);
  (response.table&&response.table.rows||[]).forEach(row=>{
    const cells=row&&row.c||[],machine=planningMachineNumber(planningCellValue(cells[0])),product=text(planningCellValue(cells[1]));
    if(machine==null||!product)return;
    const key=String(machine); parsed[key]||(parsed[key]=[]);
    if(!parsed[key].some(existing=>normaliseProductKey(existing)===normaliseProductKey(product)))parsed[key].push(product);
  });
  if(!Object.keys(parsed).length)throw new Error("no machine/product rows were found");
  return parsed;
}
function clonePlanningAssignments(source){
  const copy=Object.create(null); if(!source||typeof source!=="object")return copy;
  Object.keys(source).forEach(key=>{
    const machine=planningMachineNumber(key),items=source[key]; if(machine==null||!Array.isArray(items))return;
    items.forEach(product=>{const value=text(product);if(value){const k=String(machine);copy[k]||(copy[k]=[]);if(!copy[k].some(existing=>normaliseProductKey(existing)===normaliseProductKey(value)))copy[k].push(value)}});
  });
  return copy;
}
async function fetchPlanningAssignments(){
  let backendError=null;
  try{const all=await planningFromBackend();planningSource="backend";planningLastError="";return all.assign}
  catch(error){backendError=error}
  let lastError=null;
  for(const selector of [{gid:PLANNING_GID},{sheet:PLANNING_TAB}]){
    try{const v=parsePlanningAssignments(await gvizPlanningJsonp(selector));planningSource="gviz";planningLastError="";return v}
    catch(error){lastError=error}
  }
  planningLastError="backend: "+(backendError&&backendError.message||backendError||"failed")+" ; gviz: "+(lastError&&lastError.message||lastError||"failed");
  throw lastError||backendError||new Error("Production Planning could not be loaded");
}
async function loadPlanningAssignments(){
  planningLoaded=false;
  planningLoadError="";
  planningAssignments=Object.create(null);
  updateProductControl();
  try{
    // IMPORTANT: machine -> product assignments must come only from the
    // shared live Production Planning source. Do not use another phone's
    // localStorage cache or the old hard-coded fallback.
    const live=await fetchPlanningAssignments();
    planningAssignments=clonePlanningAssignments(live);
    if(!Object.keys(planningAssignments).length)throw new Error("Production Planning returned no valid machine/product assignments.");
    planningLoaded=true;
    planningLastFetch=Date.now();
    writeJsonCache(PLANNING_CACHE_KEY,planningAssignments); // optional cache only for diagnostics/offline state
    updateProductControl();
    if(selectedMachineNumber()!=null)renderProductResults($("prodSearch").value);
  }catch(error){
    planningAssignments=Object.create(null);
    planningLoaded=false;
    planningLoadError="Live Production Planning is unavailable. Product selection is disabled until the shared planning data loads.";
    updateProductControl();
    showStatus("formStatus",planningLoadError+" "+(error.message||""),"err");
  }
}

/* -------- Fast local cache (display only; the server remains authoritative) -------- */
function readJsonCache(key){try{const value=JSON.parse(localStorage.getItem(key)||"null");return value||null}catch(e){return null}}
function writeJsonCache(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
function loadCachedData(){
  const cachedMaster=readJsonCache(MASTER_CACHE_KEY);
  if(Array.isArray(cachedMaster)&&cachedMaster.length){masterData=cachedMaster;renderFilterOptions();renderMasterTable();updateProductControl()}
  const cachedEntries=readJsonCache(ENTRIES_CACHE_KEY);
  const cacheOwner=cachedEntries&&!Array.isArray(cachedEntries)?cachedEntries.user:null;
  const cacheRows=cachedEntries?(Array.isArray(cachedEntries)?cachedEntries:cachedEntries.rows):null;
  const me=currentUser&&currentUser.username||"";
  if(me&&Array.isArray(cacheRows)&&cacheRows.length&&cacheOwner===me&&cachedEntries.date===localISODate()){entries=cacheRows.map(normaliseEntry).filter(entryVisible);renderEntryTables()}
}

/* -------- Master data -------- */
function normaliseMaster(response){
  const raw=Array.isArray(response)?response:(response&&Array.isArray(response.data)?response.data:[]);
  return raw.map(p=>({
    name:text(p&&((p.name!==undefined?p.name:(p.product!==undefined?p.product:p[0])))),
    yarn:text(p&&((p.yarn!==undefined?p.yarn:p[1])))
  })).filter(p=>p.name);
}
async function loadMaster(){
  try{
    const result=await apiGet("master",{token:sessionToken});
    if(result&&result.ok===false)throw new Error(result.error||"Master could not be loaded");
    masterData=normaliseMaster(result);v12MasterOnline=masterData.length>0;v12SyncProductMode();writeJsonCache(MASTER_CACHE_KEY,masterData);renderFilterOptions();renderMasterTable();updateProductControl();
    if(selectedMachineNumber()!=null)renderProductResults($("prodSearch").value);
  }catch(error){
    masterData=[];v12MasterOnline=false;v12MasterMode=false;v12SyncProductMode(); renderFilterOptions();updateProductControl(); $("masterBody").innerHTML='<tr><td colspan="4" class="empty-state">Master could not be loaded. Check backend configuration.</td></tr>';
    showStatus("formStatus",error.message||"Master loading failed.","err");
  }
}
function renderFilterOptions(){
  const products=[...new Set(masterData.map(p=>p.name))].sort((a,b)=>a.localeCompare(b));
  const yarns=[...new Set(masterData.map(p=>p.yarn).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  $("productFilterOptions").innerHTML=products.map(v=>'<option value="'+escapeHtml(v)+'"></option>').join("");
  $("yarnFilterOptions").innerHTML=yarns.map(v=>'<option value="'+escapeHtml(v)+'"></option>').join("");
}
function renderMasterTable(){
  const term=$("masterSearch").value.toLowerCase().trim();
  const rows=masterData.filter(p=>!term||p.name.toLowerCase().includes(term)||p.yarn.toLowerCase().includes(term));
  $("masterBody").innerHTML=rows.length?rows.map(p=>'<tr><td>'+escapeHtml(p.name)+'</td><td>'+escapeHtml(p.yarn||"-")+'</td><td>Standard</td><td>As per roll</td></tr>').join(""):'<tr><td colspan="4" class="empty-state">No matching product.</td></tr>';
}

/* -------- Entries -------- */
function normaliseEntry(row,index){
  if(Array.isArray(row))row={date:row[0],box:row[1],machine:row[2],shift:row[3],product:row[4],yarn:row[5],rollType:row[6],rolls:row[7],gross:row[8],tare:row[9],net:row[10],status:row[12],user:row[13]};
  return {
    sr:row.sr||index+1,date:text(row.date),shift:text(row.shift),type:text(row.type||"Production"),product:text(row.product||row.productName),yarn:text(row.yarn||row.yarnCode),machine:text(row.machine),unit:text(row.unit||row.unitNo||unitForMachine(row.machine)),rollType:text(row.rollType),rolls:text(row.rolls||row.rollCount),rollW:row.rollW!==undefined?row.rollW:row.rollType,gross:row.gross!==undefined?row.gross:row.grossW,tare:row.tare!==undefined?row.tare:row.tapeW,net:row.net!==undefined?row.net:row.netW,box:text(row.box),status:text(row.status||row.productionStatus||"Status unavailable"),user:text(row.user||row.enteredBy)
  };
}
async function v1022LoadAdminHistory(){
  if(!isAdmin()) return;
  const btn=document.getElementById('v1022AdminHistory');
  if(btn){btn.disabled=true;btn.textContent='Loading history…';}
  try{
    const result=await apiGet('entries',{token:sessionToken});
    if(!result||!result.ok||!Array.isArray(result.rows))throw new Error(result&&result.error||'History response unavailable');
    entries=result.rows.map(normaliseEntry);renderEntryTables();
    if(btn)btn.textContent='📚 Reload Full History (Admin)';
  }catch(error){
    alert('Historical data is too large or unavailable. Daily dashboard is separate and remains available. '+(error.message||error));
    if(btn)btn.textContent='📚 Retry Full History (Admin)';
  }finally{if(btn)btn.disabled=false;}
}
/* RC5: count authenticated production DUPLICATE statuses, not local audit. */
async function rc5RefreshMyDuplicateBoxes(){
  const target=document.getElementById("rc5MyDuplicateBoxes");
  if(!target || !sessionToken)return;
  target.textContent="…";
  target.title="Checking LIVE Production status";
  try {
    const result=await apiGet("myDuplicateBoxesToday",{token:sessionToken});
    if(!result || !result.ok || typeof result.count!=="number")throw new Error(result&&result.error||"Count unavailable");
    target.textContent=(result.complete?"":"≥")+String(result.count);
    target.title=(result.complete?"":"At least ") + result.count + " duplicate boxes today for your account" + (result.boxes&&result.boxes.length ? " • "+result.boxes.join(", ") : "");
  }catch(e){
    target.textContent="—";
    target.title="Duplicate count unavailable: "+String(e&&e.message||e);
  }
}

async function loadEntries(){
  const note=document.getElementById("v102DashboardNote"), body=document.getElementById("v102UserRows");
  if(note) note.textContent="Loading today's confirmed production from LIVE server…";
  if(body) body.innerHTML='<tr><td colspan="6">Loading LIVE unit data…</td></tr>';
  rc5RefreshMyDuplicateBoxes();
  try{
    const result=await apiGet("unitTodayEntries",{token:sessionToken});
    if(!result||!result.ok)throw new Error(result&&result.error?result.error:"Dashboard API returned an error");
    if(!Array.isArray(result.rows)) throw new Error("Dashboard API returned no rows array. Check the deployed Backend version.");
    if(result.dashboardVersion!=="V102.4") throw new Error("Old dashboard server version: "+String(result.dashboardVersion||"unknown")+". Deploy V102.4 backend to this URL.");
    const freshEntries=result.rows.map(normaliseEntry);
    entries=freshEntries.filter(entryVisible);
    if(freshEntries.length)writeJsonCache(ENTRIES_CACHE_KEY,{user:(currentUser&&currentUser.username)||"",rows:freshEntries,date:localISODate()});
    v12TodayHistory();
    if(note)note.textContent="LIVE server connected • Today: "+localISODate()+" • Entries received: "+freshEntries.length+" • Unit-visible: "+entries.length;
  }catch(error){
    entries=[];renderEntryTables();
    ["sEntries","sRolls","sGross","sTare","sNet","v102TotalEntries","v102TotalNet","v102TotalRolls"].forEach(function(id){const el=document.getElementById(id);if(el)el.textContent="—";});
    const message="LIVE DASHBOARD ERROR: "+(error&&error.message||"Server unavailable")+". Data may exist in PRODUCTION DATA; zero is not confirmed.";
    $("entrySummary").textContent=message;
    if(note){note.textContent=message;note.style.color="#b91c1c";note.style.fontWeight="800"}
    if(body)body.innerHTML='<tr><td colspan="6" style="color:#b91c1c;font-weight:800">'+escapeHtml(message)+'</td></tr>';
  }
}

function entryVisible(e){if(isAdmin())return true;if(!allowedMachines||!allowedMachines.length)return false;return allowedMachines.some(m=>unitForMachine(m)===unitForMachine(e.machine))}
function filteredEntries(){
  const from=$("fFrom").value,to=$("fTo").value,prod=$("fProd").value.toLowerCase().trim(),yarn=$("fYarn").value.toLowerCase().trim(),search=$("fSearch").value.toLowerCase().trim();
  return entries.filter(e=>{
    if(!entryVisible(e))return false;
    if(from&&e.date<from)return false;if(to&&e.date>to)return false;
    if(prod&&!e.product.toLowerCase().includes(prod))return false;if(yarn&&!e.yarn.toLowerCase().includes(yarn))return false;
    if(search){const hay=Object.values(e).join(" ").toLowerCase();if(!hay.includes(search))return false}
    return true;
  });
}
function rowHtml(e,index){
  return '<tr><td>'+escapeHtml(e.sr||index+1)+'</td><td>'+escapeHtml(e.date)+'</td><td>'+escapeHtml(e.shift)+'</td><td>'+escapeHtml(e.type)+'</td><td>'+escapeHtml(e.product)+'</td><td>'+escapeHtml(e.yarn)+'</td><td>'+escapeHtml(e.machine)+'</td><td>'+escapeHtml(e.unit)+'</td><td>'+escapeHtml(e.rollType)+'</td><td>'+escapeHtml(e.rolls)+'</td><td>'+formatNum(e.rollW)+'</td><td>'+formatNum(e.gross)+'</td><td>'+formatNum(e.tare)+'</td><td>'+formatNum(e.net)+'</td><td>'+escapeHtml(e.box)+'</td><td>'+escapeHtml(e.status||"Status unavailable")+'</td><td>'+escapeHtml(e.user||"-")+'</td></tr>';
}
function renderEntryTables(){
  const visible=isAdmin()?filteredEntries():filteredEntries().filter(e=>String(e.date).slice(0,10)===localISODate());
  $("entryHistoryBody").innerHTML=visible.length?visible.map(rowHtml).join(""):'<tr><td colspan="17" class="empty-state">No matching entries.</td></tr>';
  $("tableBody").innerHTML=(isAdmin()?entries:entries.filter(e=>String(e.date).slice(0,10)===localISODate())).length?(isAdmin()?entries:entries.filter(e=>String(e.date).slice(0,10)===localISODate())).map(rowHtml).join(""):'<tr><td colspan="17" class="empty-state">No entries loaded.</td></tr>';
  $("entrySummary").textContent=visible.length+" of "+entries.length+" server entries shown. Machine access is checked when a new entry is saved.";
  // Daily dashboard: do not accidentally mix historical entries with today's total.
  // Only records returned by the authenticated server are counted; local queued records are separate.
  const today=localISODate();
  const dashboardEntries=entries.filter(e=>String(e.date).slice(0,10)===today);
  let rolls=0,gross=0,tare=0,net=0; dashboardEntries.forEach(e=>{rolls+=num(e.rolls);gross+=num(e.gross);tare+=num(e.tare);net+=num(e.net)});
  $("sEntries").textContent=dashboardEntries.length;$("sRolls").textContent=rolls;$("sGross").textContent=gross.toFixed(3);$("sTare").textContent=tare.toFixed(3);$("sNet").textContent=net.toFixed(3);v102RenderDailyDashboard();
}
function clearFilters(){["fFrom","fTo","fProd","fYarn","fSearch"].forEach(id=>$(id).value="");renderEntryTables()}
function v12TodayHistory(){
  if($("fFrom")&&!$("fFrom").value)$("fFrom").value=localISODate();
  if($("fTo")&&!$("fTo").value)$("fTo").value=localISODate();
  renderEntryTables();
}

function v102RenderDailyDashboard(){
  const board=document.getElementById("v102DailyBoard");if(!board)return;
  const today=localISODate();const selected=entries.filter(e=>String(e.date||"").slice(0,10)===today);
  const groups=new Map();let weight=0,rolls=0;
  selected.forEach(e=>{const u=String(e.user||"Unassigned").trim()||"Unassigned",unit=String(e.unit||unitForMachine(e.machine)),shift=String(e.shift||"-").toUpperCase();const k=u.toLowerCase()+"|"+unit+"|"+shift;
    const row=groups.get(k)||{user:u,unit,shift,count:0,net:0,rolls:0};row.count++;row.net+=num(e.net);row.rolls+=num(e.rolls);weight+=num(e.net);rolls+=num(e.rolls);groups.set(k,row)});
  document.getElementById("v102DayTitle").textContent=today+(isAdmin()?" • Admin all units":" • Assigned unit(s)");
  document.getElementById("v102TotalEntries").textContent=selected.length;
  document.getElementById("v102TotalNet").textContent=weight.toFixed(3);
  document.getElementById("v102TotalRolls").textContent=rolls;
  // V102.5: The five header KPI cards use exactly the same authenticated,
  // unit-filtered, current-day rows as Today's Unit Production below.
  // This runs after each successful render and does not call any other API.
  let grossToday=0, tareToday=0;
  selected.forEach(function(e){ grossToday+=num(e.gross); tareToday+=num(e.tare); });
  const topValues={
    sEntries:String(selected.length),
    sRolls:String(rolls),
    sGross:grossToday.toFixed(3),
    sTare:tareToday.toFixed(3),
    sNet:weight.toFixed(3)
  };
  Object.keys(topValues).forEach(function(id){
    const el=document.getElementById(id);
    if(el)el.textContent=topValues[id];
  });
  const body=document.getElementById("v102UserRows");
  const items=[...groups.values()].sort((a,b)=>Number(a.unit)-Number(b.unit)||a.user.localeCompare(b.user)||a.shift.localeCompare(b.shift));
  body.innerHTML=items.length?items.map(g=>"<tr><td>"+escapeHtml(g.user)+"</td><td>"+escapeHtml(g.unit)+"</td><td>"+escapeHtml(g.shift)+"</td><td>"+g.count+"</td><td>"+g.net.toFixed(3)+"</td><td>"+g.rolls+"</td></tr>").join(""):'<tr><td colspan="6">No confirmed production entries today for your unit.</td></tr>';
}
/* -------- Entry form -------- */
function calcWeight(){
  // Do not silently calculate with A / 0.38 kg before roll selection.
  const code=rollTypeCode($("rollType").value);
  if(!code){$("tareWeight").value="Select roll type";$("netWeight").value="Select roll type";return;}
  const rollW=Number($("rollType").value),count=num($("rollCount").value),gross=round3(num($("grossWeight").value));
  const tare=round3(count*rollW),net=round3(Math.max(0,gross-tare));
  $("tareWeight").value=tare.toFixed(3);$("netWeight").value=net.toFixed(3);
}
let v12BoxSource = "LOCAL SUGGESTION (not reserved)";
async function v12CheckServerBox(machine){
  const m=Number(machine),unit=m<=74?"1":"2";
  const note=document.getElementById("v12BoxStatus");
  if(note)note.textContent="Checking LIVE server for next Unit "+unit+" box…";
  try{
    const d=await apiGet("meeraNextBox",{token:sessionToken,unit});
    if(!d||!d.ok||!/^([AB])\d+$/.test(String(d.box||"")))throw Error(d&&d.error||"Server route not configured");
    if(String(d.unit)!==unit||String(d.box)[0]!== (unit==="1"?"A":"B"))throw Error("Unit mismatch");
    const exact=String(d.box);
    v12BoxSource="SERVER SUGGESTION (not reserved)";
    // Inform only: never overwrite the operator's manually started sequence.
    if(note)note.textContent="LIVE suggests "+exact+". आपने जो Box Series शुरू की है वह नहीं बदलेगी। दो Phones का Number टकरा सकता है; यह Server Reservation नहीं है.";
  }catch(e){
    v12BoxSource="LOCAL SUGGESTION (not reserved)";
    if(note)note.textContent="LIVE Box lookup अभी उपलब्ध नहीं। अपना पहला Box Number भरें; इसके बाद अगला नंबर +1 होगा। अलग Phones के बीच Duplicate जाँच सीमित है.";
  }
}
function getNextBox(unit){
  // Next box = last box in sequence + 1, separately for each unit (Unit 1 = machines 1-74, Unit 2 = 75-111).
  // A mistyped, far-too-large old box number (e.g. B214676 instead of B21467) is ignored.
  unit=String(unit||unitForMachine($("machine")&&$("machine").value)||window.__lastUnit||"");
  const prefix=getBoxPrefix(),nums=[];
  const consider=e=>{
    const rowUnit=String((e&&(e.unit||unitForMachine(e.machine)))||"");
    if(unit&&rowUnit&&rowUnit!==unit)return;
    const raw=String(e&&e.box!=null?e.box:"").trim();
    const m=raw.match(/^([A-Za-z0-9_-]*?)(\d+)$/);if(!m)return;
    if(m[1].toUpperCase()!==prefix)return;
    const n=parseInt(m[2],10);if(Number.isFinite(n))nums.push(n);
  };
  entries.forEach(consider);
  if(reliableLastConfirmed)consider(reliableLastConfirmed);
  if(typeof v9KnownBoxes!=="undefined")v9KnownBoxes.forEach(b=>consider({box:b,unit:unit}));
  try{const local=JSON.parse(localStorage.getItem(LOCAL_BACKUP_PREFIX+(currentUser&&currentUser.username||""))||"[]");local.forEach(consider)}catch(e){}
  const u=Array.from(new Set(nums)).sort((x,y)=>y-x);
  while(u.length>1&&u[0]-u[1]>1000)u.shift();
  return (u.length?u[0]:100)+1;
}

function resetForm(keepBox=false){
  if(!$("date"))return;
  const remembered=keepBox?boxDigits($("box").value):"";
  v12MasterMode=false;v12SyncProductMode();
  window.__boxManual=!!remembered;
  if(!keepBox)window.__lastUnit="";
  $("date").value=localISODate();applyAutoShift(true);
  $("box").value=remembered;
  $("machine").value="";$("machineSearch").value="";
  updateBoxPreview();clearProductSelection(true);syncRollTypeOptions();
  $("rollCount").value="";$("grossWeight").value="";
  $("tareWeight").value="Auto";$("netWeight").value="Auto";hideStatus("formStatus");
}
function saveLocalBackup(row){
  try{const key=LOCAL_BACKUP_PREFIX+(currentUser&&currentUser.username||"unknown");const arr=JSON.parse(localStorage.getItem(key)||"[]");arr.push(row);if(arr.length>300)arr.splice(0,arr.length-300);localStorage.setItem(key,JSON.stringify(arr))}catch(e){}
}
/* -----------------------------------------------------------------------
   MEERA PRODUCTION TEST V9 — Durable sequential operator queue
   Compatible with deployed V8 backend (saveEntry, checkSaveStatus).
   LOCAL queue order is NOT the same as a globally immutable server serial.
   Never claim a no-cors POST is verification.
------------------------------------------------------------------------ */
const V9_DB_NAME="meera_production_test_v9_queue";
const V9_DB_VERSION=2;
const V9_LEGACY_PREFIX="meera_test_pending_v1_";
const V9_FINAL_STATES=new Set(["SAVED","DUPLICATE","ON_SERVER"]);
const V9_RECHECK_MS=15000;
const V9_RETRY_GRACE_MS=90000;
const V9_MAX_POST_ATTEMPTS=3;
let reliableLastConfirmed=null;
let v9Db=null, v9StorageReady=false, v9LocalBusy=false, v9WorkerBusy=false;
let v9CorruptLegacy=false, v9Timer=null, v9KnownBoxes=new Set();
let v9TabId="v9-tab-"+Date.now()+"-"+Math.random().toString(36).slice(2);
let v9LastStatus="", v9LastCount=0;
function reliableId(){
  if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();
  if(window.crypto&&crypto.getRandomValues){
    const a=new Uint8Array(16);crypto.getRandomValues(a);
    return "test-"+Array.from(a,x=>x.toString(16).padStart(2,"0")).join("");
  }
  throw new Error("Secure Request ID generation not available. No data sent.");
}
function v9Owner(){return String(currentUser&&currentUser.username||"").trim().toLowerCase()}
function v9IsActive(e){return !V9_FINAL_STATES.has(e.state)}
function v9Open(){
  if(v9Db)return Promise.resolve(v9Db);
  return new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(new Error("IndexedDB unavailable on this browser"));return}
    const req=indexedDB.open(V9_DB_NAME,V9_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("entries")){
        const s=db.createObjectStore("entries",{keyPath:"requestId"});
        s.createIndex("owner","owner",{unique:false});
        s.createIndex("ownerBox","ownerBox",{unique:false});
      }
      // Version 2: permit separate Request IDs for the same Box while preserving all records.
      // The old unique ownerBox index blocked users even after manual administrator review.
      const entriesStore=req.transaction.objectStore("entries");
      if(entriesStore.indexNames.contains("ownerBox")){
        const idx=entriesStore.index("ownerBox");
        if(idx.unique){entriesStore.deleteIndex("ownerBox");entriesStore.createIndex("ownerBox","ownerBox",{unique:false});}
      }
      if(!db.objectStoreNames.contains("meta"))db.createObjectStore("meta");
    };
    req.onsuccess=()=>{v9Db=req.result;v9Db.onversionchange=()=>{v9Db.close();v9Db=null;v9StorageReady=false;v9SetButton()};resolve(v9Db)};
    req.onerror=()=>reject(req.error||new Error("IndexedDB failed"));
    req.onblocked=()=>reject(new Error("Close other tabs running an older queue version"));
  });
}
function v9Transaction(store,mode,job){
  return new Promise((resolve,reject)=>{
    if(!v9Db){reject(new Error("Local queue is not open"));return}
    let tx;
    try{tx=v9Db.transaction([store],mode,{durability:"strict"})}
    catch(e){try{tx=v9Db.transaction([store],mode)}catch(x){reject(x);return}}
    let value,done=false;
    tx.oncomplete=()=>{done=true;resolve(value)};
    tx.onerror=()=>{if(!done)reject(tx.error||new Error("IndexedDB transaction failed"))};
    tx.onabort=()=>{if(!done)reject(tx.error||new Error("IndexedDB transaction aborted"))};
    try{job(tx.objectStore(store),v=>{value=v})}catch(e){try{tx.abort()}catch(_){}reject(e)}
  });
}
function v9Insert(record){
  // Assign a durable LOCAL sequence in the SAME IndexedDB transaction as
  // the new entry. This is not the server's serial number.
  return new Promise((resolve,reject)=>{
    if(!v9Db){reject(new Error("Local backup database not available"));return}
    let tx;
    try{tx=v9Db.transaction(["entries","meta"],"readwrite",{durability:"strict"})}
    catch(e){tx=v9Db.transaction(["entries","meta"],"readwrite")}
    const seqKey="nextseq:"+record.owner,meta=tx.objectStore("meta");
    let seq=0;
    const g=meta.get(seqKey);
    g.onsuccess=()=>{
      seq=Math.max(0,Number(g.result)||0)+1;
      meta.put(seq,seqKey);
      record.localSeq=seq;
      tx.objectStore("entries").add(record);
    };
    tx.oncomplete=()=>resolve(seq);
    tx.onerror=()=>reject(tx.error||new Error("Durable queue write failed"));
    tx.onabort=()=>reject(tx.error||new Error("Queue write rolled back"));
  });
}
function v9Put(record){return v9Transaction("entries","readwrite",(s)=>{s.put(record)})}
function v9Get(id){return v9Transaction("entries","readonly",(s,set)=>{s.get(id).onsuccess=e=>set(e.target.result||null)})}
function v9GetAll(owner){return v9Transaction("entries","readonly",(s,set)=>{
  s.index("owner").getAll(owner).onsuccess=e=>set((e.target.result||[]).sort((a,b)=>(Number(a.localSeq)||0)-(Number(b.localSeq)||0)||a.requestId.localeCompare(b.requestId)));
})}
async function v9Change(id,patch){
  const old=await v9Get(id);if(!old)throw new Error("Queue entry disappeared; stop and check backup");
  const updated={...old,...patch,updatedAt:new Date().toISOString()};
  await v9Put(updated);return updated;
}
// Durable, transaction-based cross-tab worker lease. Same-ID server dedupe
// remains the final protection if a sleeping browser loses its lease.
async function v9Lease(renew=false,owner=v9Owner()){
  const key="worker:"+owner;let granted=false;
  await v9Transaction("meta","readwrite",(s)=>{
    const g=s.get(key);
    g.onsuccess=()=>{
      const cur=g.result,now=Date.now();
      if((!cur||cur.until<now||cur.owner===v9TabId)&&(!renew||cur&&cur.owner===v9TabId)){
        s.put({owner:v9TabId,until:now+120000},key);granted=true;
      }
    };
  });return granted;
}
async function v9Release(owner=v9Owner()){
  const key="worker:"+owner;
  try{await v9Transaction("meta","readwrite",s=>{
    const r=s.get(key);r.onsuccess=()=>{if(r.result&&r.result.owner===v9TabId)s.delete(key)};
  })}catch(e){}
}
function v9SetButton(){
  const b=$("saveButton");if(!b)return;
  const available=!!currentUser && sessionVerified && v9StorageReady && !v9LocalBusy && !v9CorruptLegacy;
  b.disabled=!available;
  b.textContent=v9LocalBusy?"⏳ Saving local backup…":available?"⚡ Queue Entry (FAST)":"⚡ Queue unavailable";
}
function reliableButton(){v9SetButton()}
function reliablePending(){return null} // Legacy UI replaced by the V9 queue.
function v9PrepareNextForm(previousBox){
  // Keep today's date and shift only. Never inherit machine/product/roll type:
  // operator must choose machine and roll type explicitly for EVERY box.
  const oldNumber=Number(boxDigits(previousBox));
  const next=Number.isSafeInteger(oldNumber)&&oldNumber>0?oldNumber+1:"";
  // The next number is based on the operator's last locally saved Box,
  // not a late server suggestion or unrelated phone's sequence.
  window.__boxManual=!!next;
  $("machine").value="";$("machineSearch").value="";
  $("machineList").classList.remove("show");
  clearProductSelection(true);
  syncRollTypeOptions(); // blank, disabled until a new machine is chosen
  $("rollCount").value="";
  $("grossWeight").value="";
  $("box").value=String(next);
  updateBoxPreview();
  calcWeight();
  $("machineSearch").focus();
}
// Resolved audit records are NEVER deleted. They disappear ONLY from
// the on-screen Local Order list: on visiting the panel (animated) OR
// 30 minutes after the server confirmed them, whichever occurs first.
const V9_RESOLVED_VISIBLE_MS=30*60*1000;
let v9QueuePanelVisible=false;
let v9ArchiveTimer=null;
const v9AnimatingIds=new Set();
function v9ResolvedAt(row){
  const t=Date.parse(row.verifiedAt||row.updatedAt||row.createdAt||"");
  return Number.isFinite(t)?t:Date.now();
}
function v9ShouldHideResolved(row,now=Date.now()){
  return V9_FINAL_STATES.has(row.state) &&
    (!!row.archivedAt || now-v9ResolvedAt(row)>=V9_RESOLVED_VISIBLE_MS);
}
function v9ScheduleArchiveRefresh(rows,now){
  if(v9ArchiveTimer){clearTimeout(v9ArchiveTimer);v9ArchiveTimer=null;}
  const delays=rows.filter(r=>V9_FINAL_STATES.has(r.state)&&!v9ShouldHideResolved(r,now))
    .map(r=>V9_RESOLVED_VISIBLE_MS-(now-v9ResolvedAt(r)))
    .filter(ms=>ms>0);
  if(delays.length)v9ArchiveTimer=setTimeout(()=>{
    v9ArchiveTimer=null;v9RefreshUi().catch(()=>{});
  },Math.min(...delays)+40);
}
function v9AnimateVisibleResolved(){
  const panel=$("v9QueuePanel");
  if(!v9QueuePanelVisible||!panel||panel.closest(".hidden"))return;
  const rows=Array.from($("v9QueueBody").querySelectorAll("tr[data-v9-resolved='1']"));
  let order=0;
  rows.forEach(el=>{
    const id=el.dataset.v9Id;
    if(!id||v9AnimatingIds.has(id))return;
    v9AnimatingIds.add(id);
    const wait=Math.min(order++,12)*130;
    const animation=["v9-fly-bird","v9-slide-sheet","v9-fly-up"][Math.floor(Math.random()*3)];
    const owner=v9Owner();
    setTimeout(()=>{
      if(!el.isConnected){v9AnimatingIds.delete(id);return;}
      el.classList.add("v9-resolved-row",animation);
      setTimeout(async()=>{
        try{
          if(owner===v9Owner()){
            const record=await v9Get(id);
            if(record&&record.owner===owner&&V9_FINAL_STATES.has(record.state)&&!record.archivedAt){
              await v9Change(id,{archivedAt:new Date().toISOString()});
            }
            await v9RefreshUi();
          }
        }catch(e){console.warn("Queue row hide delayed; audit retained",e)}
        finally{v9AnimatingIds.delete(id)}
      },1200);
    },wait);
  });
}
function v9ObserveQueuePanel(){
  const el=$("v9QueuePanel");if(!el)return;
  const update=(visible)=>{
    v9QueuePanelVisible=visible;
    if(visible){v9RefreshUi().then(v9AnimateVisibleResolved).catch(()=>{});}
  };
  if("IntersectionObserver" in window){
    const watcher=new IntersectionObserver(entries=>{
      update(entries.some(x=>x.target===el&&x.isIntersecting&&x.intersectionRatio>=.08));
    },{threshold:[0,.08,.25]});
    watcher.observe(el);
  }else{
    const check=()=>{
      const r=el.getBoundingClientRect();
      update(r.bottom>0&&r.top<innerHeight&&!el.closest(".hidden"));
    };
    window.addEventListener("scroll",check,{passive:true});
    window.addEventListener("resize",check);
    check();
  }
}
function v9StatusLabel(state){return ({QUEUED:"Queued locally",SENDING:"Sending (not verified)",PENDING:"Pending verification",CLOUD_RECEIVED:"Received in cloud — Production pending",SAVED:"Verified saved",DUPLICATE:"Duplicate rejected",ON_SERVER:"Already in PRODUCTION DATA",REVIEW_REQUIRED:"Admin review"})[state]||"Needs attention"}
function v9StatusClass(state){return state==="SAVED"?"ok":state==="DUPLICATE"||state==="REVIEW_REQUIRED"?"err":"info"}
async function v9RefreshUi(){
  if(!currentUser||!v9Db)return;
  const owner=v9Owner(),rows=await v9GetAll(owner);
  if(v9Owner()!==owner)return;
  v9KnownBoxes=new Set(rows.map(r=>r.box));
  const waiting=rows.filter(v9IsActive),verified=rows.filter(r=>r.state==="SAVED"||r.state==="ON_SERVER").length,rejected=rows.filter(r=>r.state==="DUPLICATE").length;
  v9LastCount=waiting.length;
  $("v9QueuedCount").textContent=waiting.length;
  $("v9SavedCount").textContent=verified;
  $("v9RejectedCount").textContent=rejected;
  const status=$("v9QueueSummary");
  status.textContent=waiting.some(r=>r.state==="REVIEW_REQUIRED")?
    "⚠ ADMIN REVIEW needed. Other distinct boxes can continue syncing; this box stays on hold.":
    waiting.length?"Local queue is safe on this browser profile. Server verification runs in the background; keep the browser open when possible.":
    "No unverified entries in this browser. The server is the authority for saved entries.";
  const now=Date.now();
  v9ScheduleArchiveRefresh(rows,now);
  // The local audit is permanent; only filter what is DISPLAYED here.
  // Show ALL unresolved records before resolved ones, so a full history
  // cannot push active or admin-review boxes out of the 35-row view.
  const unfinished=rows.filter(v9IsActive).reverse();
  const recentFinal=rows.filter(r=>V9_FINAL_STATES.has(r.state)&&!v9ShouldHideResolved(r,now)).reverse();
  // Every unresolved item stays visible; at most 60 recent resolved audit
  // items are displayed before their animation/30-minute cleanup.
  const visible=unfinished.concat(recentFinal.slice(0,60));
  $("v9QueueBody").innerHTML=visible.length?visible.map(row=>{
    const suffix=String(row.requestId).slice(-8),warning=row.lastError?'<div class="v9-error">'+escapeHtml(String(row.lastError).slice(0,130))+'</div>':"";
    const action=!V9_FINAL_STATES.has(row.state)?'<button type="button" class="v9-mini" data-v9-action="check" data-v9-id="'+escapeHtml(row.requestId)+'">Check only</button>':"";
    const resolved=V9_FINAL_STATES.has(row.state)?' data-v9-resolved="1" data-v9-id="'+escapeHtml(row.requestId)+'"':"";
    const style=v9AnimatingIds.has(row.requestId)?' class="v9-resolved-row"':"";
    return '<tr'+resolved+style+'><td>'+escapeHtml(row.box)+'</td><td>'+escapeHtml(v9StatusLabel(row.state))+warning+'</td><td>'+escapeHtml(row.createdAt.slice(11,19))+'</td><td><code>'+escapeHtml(suffix)+'</code></td><td>'+action+'</td></tr>';
  }).join(""):'<tr><td colspan="5" style="padding:14px;text-align:center;color:#64748b">No pending boxes. Verified boxes are safely kept in audit / Export Backup.</td></tr>';
  v9SetButton();
  if(v9QueuePanelVisible){v9AnimateVisibleResolved();}
}
async function v9MigrateLegacy(){
  const owner=v9Owner(),key=V9_LEGACY_PREFIX+owner,raw=localStorage.getItem(key);
  if(!raw)return;
  let old;
  try{old=JSON.parse(raw)}catch(e){v9CorruptLegacy=true;throw new Error("Old V4/V7 pending backup unreadable. Do NOT clear browser data.")}
  if(!old || !old.requestId || !old.box || !old.payload || !old.payload.machine){v9CorruptLegacy=true;throw new Error("Old pending record invalid. Contact admin before new entries.")}
  if(await v9Get(old.requestId))return;
  const clean={...old.payload};delete clean.token;
  const box=String(old.box).trim().toUpperCase();
  try{
    await v9Insert({requestId:old.requestId,owner,ownerBox:owner+"|"+box,box,payload:clean,
      createdAt:old.createdAt||new Date().toISOString(),state:"PENDING",attempts:1,
      lastPostedAt:Date.now(),nextCheckAt:0,updatedAt:new Date().toISOString(),lastError:"Migrated from old browser pending record. Old backup kept."});
  }catch(e){v9CorruptLegacy=true;throw new Error("Could not migrate old pending record. Do not clear browser data: "+e.message)}
}
async function v9OnLogin(){
  if(!currentUser)return;
  try{
    await v9Open();await v9MigrateLegacy();
    v9StorageReady=true;v9CorruptLegacy=false;
    await v9RefreshUi();v9Schedule(120);
    if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
  }catch(e){v9StorageReady=false;v9SetButton();showStatus("formStatus","V9 queue unavailable: "+(e.message||"Storage error")+". No new entry can be sent.","err")}
}
function v9Schedule(ms=15000){
  if(v9Timer)clearTimeout(v9Timer);
  v9Timer=setTimeout(()=>{v9Timer=null;v9Work().catch(e=>{v9LastStatus=e.message||"Queue worker error";v9Schedule(20000)})},ms);
}
async function v9CheckStatus(row){
  if(!currentUser||!sessionVerified)throw new Error("Log in online before verifying");
  const data=await jsonp(buildUrl("checkSaveStatus",{
    token:sessionToken,requestId:row.requestId,box:row.box,machine:String(row.payload.machine)
  }),16000);
  if(!data||data.ok!==true)throw new Error(data&&data.error||"Verification endpoint error");
  const state=String(data.status||"").trim().toUpperCase();
  if(state==="BACKUP_REPAIR_REQUIRED")return "REVIEW_REQUIRED";
  if(!["CONFIRMED","DUPLICATE_BOX","REVIEW_REQUIRED","PENDING","NOT_FOUND"].includes(state))throw new Error("Unexpected response: "+state);
  if(state==="CONFIRMED"||state==="DUPLICATE_BOX"||state==="PENDING"){
    if(String(data.requestId||"")!==row.requestId||String(data.box||"").toUpperCase()!==row.box)
      throw new Error("Confirmation identity mismatch; keep pending and ask admin");
  }
  // In the matching RC5 backend PENDING means this Request ID has an
  // authenticated server backup row, while Production is not yet confirmed.
  return state==="PENDING"?"CLOUD_RECEIVED":state;
}
// Read-only server reconciliation for an old or manually completed box.
// This endpoint performs an exact box lookup ONLY for an unresolved local item,
// not for every fresh save. Never infer success from a network response alone.
async function v9CheckServerBox(row){
  if(!currentUser||!sessionVerified)throw new Error("Online login required for server box reconciliation");
  const d=await jsonp(buildUrl("meeraQueueBoxStatus",{
    token:sessionToken,box:row.box,machine:String(row.payload.machine),requestId:row.requestId
  }),20000);
  if(!d||d.ok!==true)throw new Error(d&&d.error||"Server box verification failed");
  const status=String(d.status||"").trim().toUpperCase();
  if(!["NOT_FOUND","EXISTS_SAME_REQUEST","EXISTS_OTHER_REQUEST","REVIEW_REQUIRED"].includes(status))
    throw new Error("Unexpected server box status: "+status);
  if(status!=="NOT_FOUND" && String(d.box||"").toUpperCase()!==String(row.box||"").toUpperCase())
    throw new Error("Server box mismatch; preserve local entry");
  return status;
}
async function v9ResolveExistingBox(row){
  const state=await v9CheckServerBox(row);
  if(state==="EXISTS_OTHER_REQUEST"){
    await v9Change(row.requestId,{
      state:"ON_SERVER",verifiedAt:new Date().toISOString(),nextCheckAt:0,
      lastError:"Box already exists in PRODUCTION DATA (manual/other Request ID). No duplicate sent. Local payload retained in audit."
    });
    return true;
  }
  if(state==="EXISTS_SAME_REQUEST"){
    const check=await v9CheckStatus(row);
    if(check==="CONFIRMED")return await v9ApplyStatus(row,check);
    await v9Change(row.requestId,{
      state:"REVIEW_REQUIRED",nextCheckAt:0,
      lastError:"Production row exists for this Request ID but backup verification is incomplete ("+check+"). No automatic re-send."
    });
    return true;
  }
  if(state==="REVIEW_REQUIRED"){
    await v9Change(row.requestId,{
      state:"REVIEW_REQUIRED",nextCheckAt:0,
      lastError:"Multiple matching boxes found in PRODUCTION DATA. Admin must review; no automatic re-send."
    });
    return true;
  }
  return false;
}
async function v9ApplyStatus(row,status){
  if(status==="CLOUD_RECEIVED"){
    await v9Change(row.requestId,{state:"CLOUD_RECEIVED",cloudReceivedAt:row.cloudReceivedAt||new Date().toISOString(),
      nextCheckAt:Date.now()+V9_RECHECK_MS,lastError:"Server backup received. Production pending; full local copy retained."});
    return true;
  }
  if(status==="CONFIRMED"){
    // After verified server save, release the full mobile payload. Keep only
    // request-ID/box audit metadata; LIVE Production + Backup hold the entry.
    await v9Change(row.requestId,{state:"SAVED",verifiedAt:new Date().toISOString(),nextCheckAt:0,lastError:"",
      payload:{action:"saveEntry",requestId:row.requestId,box:row.box,machine:row.payload.machine,unit:row.payload.unit}});
    reliableLastConfirmed={box:row.box,unit:row.payload.unit,machine:row.payload.machine};
    const key=V9_LEGACY_PREFIX+row.owner;
    try{const old=JSON.parse(localStorage.getItem(key)||"null");if(old&&old.requestId===row.requestId)localStorage.removeItem(key)}catch(e){}
    return true;
  }
  if(status==="DUPLICATE_BOX"){
    // Server has not stored this Request ID. Never call this SAVED or purge its payload.
    await v9Change(row.requestId,{state:"REVIEW_REQUIRED",nextCheckAt:0,
      lastError:"Server rejected this Box as duplicate. Original payload PRESERVED. Apps Script must allow distinct Request IDs for review."});
    const key=V9_LEGACY_PREFIX+row.owner;
    try{const old=JSON.parse(localStorage.getItem(key)||"null");if(old&&old.requestId===row.requestId)localStorage.removeItem(key)}catch(e){}
    return true;
  }
  if(status==="REVIEW_REQUIRED"){
    // A request may briefly appear inconsistent while the POST is still
    // completing. Wait rather than prematurely marking an admin conflict.
    if(row.lastPostedAt && Date.now()-row.lastPostedAt<V9_RETRY_GRACE_MS){
      await v9Change(row.requestId,{state:"PENDING",nextCheckAt:Date.now()+V9_RECHECK_MS,lastError:"In-flight save may not be fully confirmed yet."});return false;
    }
    await v9Change(row.requestId,{state:"REVIEW_REQUIRED",nextCheckAt:0,lastError:"Server requires administrator review. No automatic retry."});return true;
  }
  await v9Change(row.requestId,{state:"PENDING",nextCheckAt:Date.now()+V9_RECHECK_MS,lastError:"Awaiting server confirmation ("+status+")"});
  return false;
}
async function v9PostOnce(row){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  // Token is joined at send-time, never stored in the durable queue.
  const payload={...row.payload,requestId:row.requestId,token:sessionToken};
  try{
    await fetch(API,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body:JSON.stringify(payload),signal:controller.signal});
  }catch(e){ /* transport uncertainty is not a save failure */ }
  finally{clearTimeout(timer)}
}
function v9ClaimFirstSend(row){
  // Claim once in the same database transaction across tabs and workers.
  // A short reservation lets a fresh save bypass older status checks while
  // keeping the normal worker from sending the same first attempt again.
  return v9Transaction("entries","readwrite",(store,set)=>{
    store.get(row.requestId).onsuccess=e=>{
      const current=e.target.result;
      if(!current||current.owner!==row.owner||!["QUEUED","PENDING"].includes(current.state)||current.attempts){set(null);return;}
      const claimed={...current,state:"SENDING",attempts:1,lastPostedAt:Date.now(),
        nextCheckAt:Date.now()+V9_RETRY_GRACE_MS,updatedAt:new Date().toISOString(),
        lastError:"Local copy verified. Upload started; cloud receipt not yet verified."};
      store.put(claimed);set(claimed);
    };
  });
}
async function v9StartImmediateHandoff(row){
  // Called only after the full local entry is committed and read back.
  // Use the existing deployed saveEntry endpoint; no undeployed cloud route.
  try{await v9Process(row);}
  catch(e){v9LastStatus="Local entry retained; cloud handoff will retry: "+String(e.message||e);}
  finally{
    v9Schedule(0);
    v9RefreshUi().catch(()=>{});
  }
}
async function v9Process(row){
  if(!sessionVerified||v9Owner()!==row.owner)return;
  try{
    // Request ID is the only idempotency key. Do not suppress a distinct
    // submission because the same Box was previously recorded.
    if(row.attempts>0){
      const status=await v9CheckStatus(row);
      if(await v9ApplyStatus(row,status))return;
      row=await v9Get(row.requestId);
      if(row.lastPostedAt && Date.now()-row.lastPostedAt<V9_RETRY_GRACE_MS)return;
      if(row.attempts>=V9_MAX_POST_ATTEMPTS){
        await v9Change(row.requestId,{state:"REVIEW_REQUIRED",lastError:"Retry limit reached; manual admin verification required.",nextCheckAt:0});return;
      }
    }
    if(!row.attempts){
      row=await v9ClaimFirstSend(row);
      if(!row)return; // Another tab or the immediate handoff already claimed it.
    }else{
      row=await v9Change(row.requestId,{state:"SENDING",attempts:(row.attempts||0)+1,
        lastPostedAt:Date.now(),nextCheckAt:Date.now()+V9_RETRY_GRACE_MS,lastError:"Transmission attempted. Save not yet confirmed."});
    }
    if(!sessionVerified||v9Owner()!==row.owner)return;
    await v9PostOnce(row);
    // Keep the device queue ordered. GET can complete after the POST has
    // reached the sheet, but we never infer success from the no-cors response.
    for(let attempt=0;attempt<2;attempt++){
      if(!sessionVerified||v9Owner()!==row.owner)break;
      await new Promise(resolve=>setTimeout(resolve,attempt===0?1000:1700));
      const status=await v9CheckStatus(row);
      if(await v9ApplyStatus(row,status))return;
      row=await v9Get(row.requestId);
    }
  }catch(e){
    await v9Change(row.requestId,{state:"PENDING",nextCheckAt:Date.now()+V9_RECHECK_MS,
      lastError:"Verification unavailable: "+String(e.message||e).slice(0,150)});
  }
}
async function v9Work(){
  if(v9WorkerBusy||!v9Db||!v9StorageReady||!sessionVerified||!currentUser)return;
  const owner=v9Owner();
  if(!await v9Lease()){v9Schedule(14000);return}
  v9WorkerBusy=true;
  const heartbeat=setInterval(()=>{if(v9Owner()===owner)v9Lease(true,owner).catch(()=>{})},25000);
  try{
    for(let i=0;i<30;i++){
      if(!sessionVerified||v9Owner()!==owner)break;
      const records=await v9GetAll(owner);
      const active=records.filter(v9IsActive);
      if(!active.length)break;
      // A REVIEW_REQUIRED/awaiting-check item is retained, not deleted.
      // Other distinct box numbers may continue; same box remains blocked.
      const first=active.find(r=>r.state!=="REVIEW_REQUIRED" && (r.nextCheckAt||0)<=Date.now());
      if(!first)break;
      await v9Process(first);
      await v9RefreshUi();
      // Continue with next eligible box; idempotency stays on server Request ID.
    }
  }finally{
    clearInterval(heartbeat);v9WorkerBusy=false;
    await v9Release(owner);await v9RefreshUi();v9Schedule(12000);
  }
}
async function v9CheckOnly(id){
  if(v9WorkerBusy){showStatus("formStatus","Queue is syncing. Wait a moment and check again.","info");return}
  if(!sessionVerified){showStatus("formStatus","Login online first. No request was sent.","err");return}
  const row=await v9Get(id);
  if(!row||row.owner!==v9Owner())return;
  if(!await v9Lease()){showStatus("formStatus","Another tab is syncing. Try Check Only in a moment.","info");return}
  v9WorkerBusy=true;
  try{
    if(await v9ResolveExistingBox(row)){
      await v9RefreshUi();
      showStatus("formStatus","✓ "+row.box+" already exists in PRODUCTION DATA. No duplicate sent; local audit kept.","ok");
      return;
    }
    const status=await v9CheckStatus(row);
    if(status==="NOT_FOUND" && !row.attempts){showStatus("formStatus","NOT SENT: "+row.box+" is still queued locally. No POST was sent by this check.","info")}
    await v9ApplyStatus(row,status);await v9RefreshUi();
    if(status==="CONFIRMED")showStatus("formStatus","✓ VERIFIED SAVED: "+row.box,"ok");
    else if(status==="DUPLICATE_BOX")showStatus("formStatus","DUPLICATE REJECTED: "+row.box+". Attempt kept in audit.","err");
    else showStatus("formStatus","Server reports "+status+" for "+row.box+". No POST was sent by this check.","info");
  }catch(e){showStatus("formStatus","Could not verify "+row.box+": "+e.message+". Local queue kept.","err")}
  finally{v9WorkerBusy=false;await v9Release();v9Schedule(10000)}
}
async function v9Export(){throw Error('Native backup export is not enabled in this starter. Full entries remain in SQLite.');}
async function v9Import(){throw Error('Legacy imports require explicit reviewed migration.');}
async function saveEntry(event){
  event.preventDefault();
  if(v9LocalBusy){
    showStatus("formStatus","Local backup write in progress. Please wait.","info");
    return;
  }
  if(!currentUser){showLogin();return}
  if(!sessionVerified){showStatus("formStatus","This session is offline/read-only. Reconnect before saving.","err");return}
  const machineText=$("machine").value||$("machineSearch").value.replace(/[^0-9]/g,"");const machine=Number(machineText);
  if(!allowedMachines.includes(machine)){showStatus("formStatus","Select one of your assigned machines before saving.","err");return}
  const selectedRollType=rollTypeCode($("rollType").value),allowedRollTypes=effectiveRollTypes(machine);
  const productText=$("prodSearch").value.trim(),selectedProduct=$("selectedProduct").value.trim();
  let productRecord=uniqueProducts().find(p=>normaliseProductKey(p.name)===normaliseProductKey(selectedProduct));
  if(!productRecord){productRecord={name:selectedProduct,yarn:$("yarnCode").value||""}}
  // Require the exact selected Product / variant before writing any local payload.
  // Free text, missing [S]/[Z] variant or a changed selection is not sufficient.
  const product=selectedProduct;
  const validSelected=Boolean(product.trim()) &&
    normaliseProductKey(productText)===normaliseProductKey(product) &&
    (v12MasterMode?v12IsMasterProduct(product):isProductAssignedToMachine(product,machine));
  if(!validSelected){
    showStatus("formStatus","PRODUCT / VARIANT REQUIRED: select the exact Product Name including [S] or [Z] from the list. Nothing was queued.","err");
    $("prodSearch").focus();return;
  }
  const digits=boxDigits($("box").value);
  if(!/^\d+$/.test(String($("box").value).trim())||!digits||!Number.isSafeInteger(Number(digits))||Number(digits)<1){
    showStatus("formStatus","पहली Entry का सही Box Number केवल अंकों में डालें (जैसे 32340)। अभी Entry Queue नहीं हुई।","err");
    $("box").focus();return;
  }
  const finalBox=getBoxPrefix()+digits;
  const rollW=round3(num($("rollType").value,.38)),rolls=num($("rollCount").value),gross=round3(num($("grossWeight").value)),tare=round3(rollW*rolls),net=round3(Math.max(0,gross-tare));
  // Safety gate before durable local queue: reject missing/implausible weights.
  // 100 kg is a conservative temporary per-box maximum; admin should confirm factory limit.
  if(!selectedRollType || !Number.isFinite(rollW) || rollW<=0 || !Number.isFinite(rolls) || rolls<=0){
    showStatus("formStatus","SELECT ROLL TYPE and enter a valid positive ROLL COUNT. No entry queued.","err");
    $("rollCount").focus();return;
  }
  if(!Number.isFinite(gross) || gross<=0 || gross>100 || gross<=tare){
    showStatus("formStatus","CHECK GROSS WEIGHT: enter a positive value above Tare and not above 100 kg per box. Example: 300 kg is NOT accepted. No entry queued.","err");
    $("grossWeight").focus();return;
  }

  const payload={action:"saveEntry",token:sessionToken,date:$("date").value,box:finalBox,machine:String(machine),unit:unitForMachine(machine),shift:$("shift").value,productName:product,productSource:v12MasterMode?"MASTER_ADD":"PLANNING",yarnCode:productRecord.yarn||"",rollTypeCode:selectedRollType,rollType:selectedRollType ? rollW.toFixed(3) : '',rollCount:$("rollCount").value,grossW:$("grossWeight").value,tapeW:$("tareWeight").value,netW:$("netWeight").value,timestamp:new Date().toISOString()};
  if (v9LocalBusy) return;
  const requestId = reliableId();
  payload.requestId = requestId;
  // NEVER persist a session token in IndexedDB or a portable backup.
  delete payload.token;
  const entry = {
    requestId, owner:v9Owner(), ownerBox:v9Owner()+"|"+finalBox,
    box:finalBox, payload, createdAt:new Date().toISOString(),
    state:"QUEUED", attempts:0, lastPostedAt:0, nextCheckAt:0,
    lastError:"", updatedAt:new Date().toISOString()
  };
  let localCommitted=false;
  v9LocalBusy=true; v9SetButton();
  try {
    if (!v9StorageReady) throw new Error("IndexedDB backup is not ready. No request sent.");
    // Stop box duplicates on the FORM before the payload enters local queue.
    // Same-unit cross-device uniqueness still requires a server-side atomic allocator.
    const oldRows=await v9GetAll(v9Owner());
    if(false && oldRows.some(r=>String(r.box||'').toUpperCase()===finalBox)){
      $("box").value=Math.max(Number(digits)+1,getNextBox(unitForMachine(machine)));
      updateBoxPreview();
      throw new Error("BOX ALREADY USED on this phone: "+finalBox+". Next automatic box selected; check details and tap Save again.");
    }
    if(false && entries.some(r=>String(r.box||r.boxNumber||'').toUpperCase()===finalBox)){
      $("box").value=Math.max(Number(digits)+1,getNextBox(unitForMachine(machine)));
      updateBoxPreview();
      throw new Error("BOX ALREADY EXISTS in loaded LIVE data: "+finalBox+". Next automatic box selected; check details and tap Save again.");
    }
    await v9Insert(entry); // Wait for the durable transaction to finish.
    const stored = await v9Get(requestId);
    if(!stored || stored.requestId!==requestId || stored.box!==finalBox)
      throw new Error("Local verification failed. The form has NOT been cleared.");
    localCommitted=true;
    // Start now, before form rendering and queue refresh, without waiting
    // for old pending entries. Failure never removes the local payload.
    void v9StartImmediateHandoff(stored);
    v9KnownBoxes.add(finalBox);
    v9PrepareNextForm(finalBox);
    showStatus("formStatus","✓ SAVED ON PHONE: "+finalBox+". Cloud upload started; receipt not yet verified. You can enter next box.","info");
    await v9RefreshUi();
    v9Schedule(50);
    // Optional admin inbox report is never on the critical path of local Save.
    // Disabled automatically until authenticated monitor backend is deployed.
    if(window.meeraMonitorQueueReport)window.meeraMonitorQueueReport(entry);
  } catch(error) {
    showStatus("formStatus",localCommitted?
      "SAVED ON PHONE: "+finalBox+". Display/update failed; do not enter this box again. Cloud verification will retry.":
      "NOT QUEUED — "+(error.message||"Storage failed")+". Keep these form details; do not re-enter blindly.","err");
  } finally {v9LocalBusy=false;v9SetButton();}
}
/* -------- Shared admin user management -------- */
function buildMachineChecklist(){
  const box=$("machineChecklist");box.innerHTML="";allMachines().forEach(n=>{const label=document.createElement("label");label.className="machine-chip";label.innerHTML='<input type="checkbox" value="'+n+'"><span>Machine '+n+'</span>';box.appendChild(label)})
}
function setMachineChecks(numbers){const set=new Set(normaliseMachines(numbers));$("machineChecklist").querySelectorAll("input").forEach(c=>c.checked=set.has(Number(c.value)))}
function readMachineChecks(){return [...$("machineChecklist").querySelectorAll("input:checked")].map(c=>Number(c.value)).sort((a,b)=>a-b)}
function setMachineRange(start,end){setMachineChecks(allMachines().filter(n=>n>=start&&n<=end))}
function setRollTypeChecks(types){
  const selected=new Set(normaliseRollTypes(types));
  $("rollTypesAuto").checked=!selected.size;
  $("rollTypePermissions").querySelectorAll(".roll-type-check").forEach(c=>{c.checked=selected.has(c.value)});
}
function readRollTypeChecks(){
  if($("rollTypesAuto").checked)return [];
  return [...$("rollTypePermissions").querySelectorAll(".roll-type-check:checked")].map(c=>c.value);
}
function formatUserRollTypes(user){
  const types=normaliseRollTypes(user&&user.rollTypes); return types.length?types.join(" & "):"Auto by machine";
}
function clearUserForm(){
  $("editingUsername").value="";$("userUsername").value="";$("userUsername").disabled=false;$("userName").value="";$("userPassword").value="";$("userMicrosoftEmail").value="";$("userRole").value="user";$("userBoxPrefix").value="";$("userActive").checked=true;setMachineChecks([]);setRollTypeChecks([]);hideStatus("adminStatus");
}
function editUser(username){
  const user=users.find(u=>u.username===username);if(!user)return;
  $("editingUsername").value=user.username;$("userUsername").value=user.username;$("userUsername").disabled=true;$("userName").value=user.name||"";$("userPassword").value="";$("userMicrosoftEmail").value=user.microsoftEmail||"";$("userRole").value=user.role||"user";$("userBoxPrefix").value=user.boxPrefix||"";$("userActive").checked=user.active!==false;setMachineChecks(user.machines);setRollTypeChecks(user.rollTypes);window.scrollTo({top:0,behavior:"smooth"});
}
async function saveUser(event){
  event.preventDefault();
  const username=$("userUsername").value.trim().toLowerCase(),editing=$("editingUsername").value.trim().toLowerCase(),password=$("userPassword").value;
  if(!username||!$("userName").value.trim()){showStatus("adminStatus","Username and display name are required.","err");return}
  if(!editing&&!password){showStatus("adminStatus","Enter a password for a new user.","err");return}
  const user={username,name:$("userName").value.trim(),role:$("userRole").value,boxPrefix:$("userBoxPrefix").value,rollTypes:readRollTypeChecks(),active:$("userActive").checked,machines:readMachineChecks(),microsoftEmail:$("userMicrosoftEmail").value.trim().toLowerCase()};
  try{
    if(password)user.passwordHash=await sha256(username+":"+password);
    await apiPost({action:"saveUser",token:sessionToken,user});clearUserForm();showStatus("adminStatus","User access saved in shared storage.","ok");setTimeout(loadUsers,1000);
  }catch(error){showStatus("adminStatus",error.message||"Could not save user.","err")}
}
async function loadUsers(){
  if(!isAdmin())return;
  try{const result=await apiGet("users",{token:sessionToken});if(!result||!result.ok)throw new Error(result&&result.error?result.error:"Users could not be loaded");users=result.users||[];renderUsers()}
  catch(error){$("usersBody").innerHTML='<tr><td colspan="8" class="empty-state">'+escapeHtml(error.message||"Users unavailable")+'</td></tr>'}
}
function renderUsers(){
  const body=$("usersBody");if(!users.length){body.innerHTML='<tr><td colspan="8" class="empty-state">No users created yet.</td></tr>';return}
  body.innerHTML="";users.forEach(u=>{const tr=document.createElement("tr");tr.innerHTML='<td>'+escapeHtml(u.username)+'</td><td>'+escapeHtml(u.name)+'</td><td>'+escapeHtml(u.role)+'</td><td>'+escapeHtml(u.boxPrefix||"-")+'</td><td>'+escapeHtml(formatUserRollTypes(u))+'</td><td>'+escapeHtml((u.machines||[]).join(", ")||"None")+'</td><td><span class="user-status '+(u.active!==false?"active":"inactive")+'">'+(u.active!==false?"Active":"Inactive")+'</span></td><td><button type="button" class="small-btn edit-user">Edit</button><button type="button" class="small-btn delete delete-user">Delete</button></td>';tr.querySelector(".edit-user").addEventListener("click",()=>editUser(u.username));tr.querySelector(".delete-user").addEventListener("click",()=>deleteUser(u.username));body.appendChild(tr)})
}
async function deleteUser(username){
  if(username===currentUser.username){showStatus("adminStatus","You cannot delete your own account.","err");return}
  if(!confirm("Delete user "+username+"?"))return;
  try{await apiPost({action:"deleteUser",token:sessionToken,username});showStatus("adminStatus","Delete request sent.","ok");setTimeout(loadUsers,1000)}catch(error){showStatus("adminStatus",error.message||"Delete failed.","err")}
}

function toggleHistory(){
  const content=$("entryHistoryContent"),button=$("historyToggle"),icon=$("historyToggleIcon");
  const opening=content.classList.contains("hidden");
  content.classList.toggle("hidden",!opening);button.setAttribute("aria-expanded",String(opening));icon.textContent=opening?"−":"＋";
}

/* -------- Views/export -------- */
function showView(name){
  if(name==="admin"&&!isAdmin())return;
  const historyBtn=document.getElementById("v1022AdminHistory");if(historyBtn)historyBtn.style.display=isAdmin()?"":"none";
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$("view-"+name).classList.remove("hidden");
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===name));
  if(name==="admin")loadUsers();
  if(name==="dashboard"&&typeof v9RefreshUi==="function")v9RefreshUi().catch(()=>{});
  window.scrollTo({top:0,behavior:"smooth"});
}
function csvCell(value){return '"'+String(value==null?"":value).replace(/"/g,'""')+'"'}
function exportCSV(){
  const head=["Sr","Date","Shift","Type","Product","Yarn","Machine","Unit","Roll Type","Rolls","Roll Wt","Gross","Tare","Net","Box","STATUS","User"];
  const lines=[head.map(csvCell).join(",")];(isAdmin()?entries:entries.filter(e=>String(e.date).slice(0,10)===localISODate())).forEach((e,i)=>lines.push([e.sr||i+1,e.date,e.shift,e.type,e.product,e.yarn,e.machine,e.unit,e.rollType,e.rolls,formatNum(e.rollW),formatNum(e.gross),formatNum(e.tare),formatNum(e.net),e.box,e.status,e.user].map(csvCell).join(",")));
  const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="production_data.csv";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

/* ===== MEERA V103.3 — Independent old-backup recovery, no normal queue mutation ===== */
const MEERA_RECOVERY_DB='meera_v1033_recovery_v1';
let meeraRecoveryBusy=false, meeraRecoveryDbPromise=null;
function meeraRecoveryDb(){
  if(meeraRecoveryDbPromise)return meeraRecoveryDbPromise;
  meeraRecoveryDbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(MEERA_RECOVERY_DB,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('entries'))req.result.createObjectStore('entries',{keyPath:'key'})};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||Error('Recovery storage unavailable'));
    req.onblocked=()=>reject(Error('Close other tabs and retry recovery storage'));
  }).catch(e=>{meeraRecoveryDbPromise=null;throw e});
  return meeraRecoveryDbPromise;
}
async function meeraRecoveryTx(mode,operation){
  const db=await meeraRecoveryDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('entries',mode),store=tx.objectStore('entries');
    let value;
    tx.oncomplete=()=>resolve(value);
    tx.onerror=()=>reject(tx.error||Error('Recovery storage failed'));
    tx.onabort=()=>reject(tx.error||Error('Recovery storage aborted'));
    try{operation(store,x=>{value=x})}catch(e){tx.abort();reject(e)}
  });
}
const meeraRecoveryAll=()=>meeraRecoveryTx('readonly',(s,set)=>{s.getAll().onsuccess=e=>set(e.target.result||[])});
const meeraRecoveryPut=row=>meeraRecoveryTx('readwrite',(s)=>s.put(row));
function meeraRecoverySay(msg){const el=document.getElementById('meeraRecoverStatus');if(el)el.textContent=msg}
function meeraRecoveryAssertLogin(){if(!currentUser||!sessionToken||!sessionVerified)throw Error('Log in ONLINE before recovery');if(!window.indexedDB)throw Error('IndexedDB is unavailable on this browser')}
function meeraRecoveryEntry(input){
  const p=input.payload||input;
  const owner=String(input.owner||p.owner||p.enteredBy||'').trim().toLowerCase();
  const box=String(input.box||p.box||'').trim().toUpperCase();
  const requestId=String(input.requestId||p.requestId||'').trim();
  if(!owner||owner!==v9Owner())throw Error('Backup belongs to a different user: '+owner);
  if(!box||!requestId||!p||!Number(p.machine||p.machineNo))throw Error('Backup entry missing Box, Request ID or machine');
  if(!/^[A-Za-z0-9_-]{8,100}$/.test(requestId))throw Error('Invalid Request ID in backup');
  if(p.requestId && String(p.requestId)!==requestId)throw Error('Backup Request ID mismatch');
  if(p.box && String(p.box).trim().toUpperCase()!==box)throw Error('Backup Box mismatch');
  const payload={...p};delete payload.token;
  return {key:owner+'|'+requestId,owner,box,requestId,state:String(input.state||'UNKNOWN'),payload,verification:'READY',lastError:'',createdAt:input.createdAt||new Date().toISOString()};
}
async function meeraRecoveryReadArchive(file){
  const raw=await file.text();let data;
  if(/\.html?$/i.test(file.name)){
    const match=raw.match(/<script id="meera-secure-payload" type="application\/json">([\s\S]*?)<\/script>/i);
    if(!match)throw Error('Not a recognized MEERA locked HTML backup');
    const pin=prompt('Enter backup PIN to import:');if(pin===null)return null;
    data=await v102DecryptArchive(JSON.parse(match[1]),pin);
  }else{
    data=JSON.parse(raw);
    if(data.format==='MEERA_LOCKED_BACKUP_V102'){
      const pin=prompt('Enter backup PIN to import:');if(pin===null)return null;
      data=await v102DecryptArchive(data,pin);
    }
  }
  if(!data||data.format!=='MEERA_V9_LOCAL_BACKUP'||!Array.isArray(data.entries)||data.entries.length>5000)throw Error('Unsupported backup format or excessive entries');
  if(String(data.owner||'').toLowerCase()!==v9Owner())throw Error('This backup belongs to another user; log into that account');
  return data.entries;
}
async function meeraRecoveryImport(file){
  meeraRecoveryAssertLogin();if(meeraRecoveryBusy)throw Error('Recovery is already running');
  const entries=await meeraRecoveryReadArchive(file);if(!entries)return;
  const validated=entries.map(meeraRecoveryEntry); // validate entire file first
  const old=await meeraRecoveryAll(),byKey=new Map(old.map(r=>[r.key,r]));
  let added=0;
  for(const item of validated){
    if(byKey.has(item.key))continue;
    await meeraRecoveryPut(item);byKey.set(item.key,item);added++;
  }
  meeraRecoverySay('Imported '+added+' NEW records / '+entries.length+' in this backup. Stored on this browser separately from normal queue. Press Sync All while online.');
}
async function meeraRecoveryCombineLocal(){
  const history=await v9GetAll(v9Owner()),existing=await meeraRecoveryAll();
  const keys=new Set(existing.map(r=>r.key));let count=0;
  for(const source of history){
    let row;
    try{row=meeraRecoveryEntry(source)}catch(e){continue} // corrupt legacy records stay untouched in original queue
    if(keys.has(row.key))continue;
    await meeraRecoveryPut(row);keys.add(row.key);count++;
  }
  return count;
}
async function meeraRecoveryStatus(ids){
  if(!ids.length)return [];
  // One authenticated JSONP GET for up to 25 Request IDs, not 25 individual GETs.
  const res=await apiGet('bulkRecoveryStatus',{token:sessionToken,ids:ids.join(',')});
  if(!res||!res.ok||!Array.isArray(res.results))throw Error(res&&res.error||'Bulk status API missing; Backend GET route must be deployed');
  return res.results;
}
async function meeraRecoveryVerifyBatch(batch,waitForPost=false){
  const found=new Map();
  for(let attempt=0;attempt<(waitForPost?2:1);attempt++){
    const statuses=await meeraRecoveryStatus(batch.map(r=>r.requestId));
    for(const item of statuses)found.set(String(item.requestId),item);
    if(batch.every(r=>{const v=found.get(r.requestId);return v&&v.status!=='NOT_FOUND'&&v.status!=='BACKUP_PENDING'}))break;
    if(waitForPost && attempt<1)await new Promise(resolve=>setTimeout(resolve,1200));
  }
  let confirmed=0,unverified=0;
  for(const row of batch){
    const result=found.get(row.requestId)||{status:'UNVERIFIED'};
    // Only verified same-owner, same-box Production AND CONFIRMED backup is fully recovered.
    const match=String(result.box||'').toUpperCase()===row.box;
    const verified=result.status==='CONFIRMED'&&match;
    const updated={...row,verification:verified?'CONFIRMED':String(result.status||'UNVERIFIED'),
      lastError:verified?'':(!match&&result.box?'Box mismatch: '+result.box:(result.error||'Not fully confirmed; do not erase backup')),
      checkedAt:new Date().toISOString()};
    await meeraRecoveryPut(updated);
    if(verified)confirmed++;else unverified++;
  }
  return {confirmed,unverified};
}
async function meeraRecoverySyncAll(){
  meeraRecoveryAssertLogin();
  if(meeraRecoveryBusy)throw Error('Recovery already running');
  meeraRecoveryBusy=true;
  const button=document.getElementById('meeraRecoverSync');if(button)button.disabled=true;
  try{
    const added=await meeraRecoveryCombineLocal();
    let all=(await meeraRecoveryAll()).filter(r=>r.owner===v9Owner());
    if(!all.length){meeraRecoverySay('No entries available. Import a backup from this phone first.');return}
    const pending=all.filter(r=>r.verification!=='CONFIRMED');
    let done=0,confirmed=all.length-pending.length,unverified=0;
    const started=performance.now();
    meeraRecoverySay('Found '+all.length+' entries; '+confirmed+' previously confirmed; '+pending.length+' to check. Added '+added+' records from this browser queue.');
    for(let index=0;index<pending.length;index+=25){
      const batch=pending.slice(index,index+25);
      // Check before POST to avoid resending recovered entries.
      const first=await meeraRecoveryVerifyBatch(batch);
      confirmed+=first.confirmed;
      const remaining=[];
      for(const r of batch){const x=(await meeraRecoveryTx('readonly',(s,set)=>{s.get(r.key).onsuccess=e=>set(e.target.result)}));if(x.verification==='NOT_FOUND')remaining.push(r)}
      if(remaining.length){
        meeraRecoverySay('Uploading batch '+(Math.floor(index/25)+1)+' of '+Math.ceil(pending.length/25)+' ('+remaining.length+' entries)…');
        // No blocking verification polls after upload. A no-cors POST is NOT a save confirmation.
        // Preserve each original payload and request ID in durable recovery storage.
        let transportError='';
        try{await apiPost({action:'bulkSyncOldEntries',token:sessionToken,entries:remaining.map(r=>({owner:r.owner,requestId:r.requestId,box:r.box,state:r.state,payload:r.payload}))})}
        catch(err){transportError=String(err&&err.message||err)}
        const sentAt=new Date().toISOString();
        for(const r of remaining){
          await meeraRecoveryPut({...r,verification:'AWAITING_CONFIRMATION',
            lastError:transportError||'Upload attempted; server confirmation will be checked on next Sync All. Keep original backup.',
            checkedAt:sentAt});
        }
        if(transportError)meeraRecoverySay('Upload uncertain: '+transportError+'. Original records retained for later verification.');
      }
      done+=batch.length;
      const seconds=Math.max(.001,(performance.now()-started)/1000);
      meeraRecoverySay('Checked '+done+'/'+pending.length+' pending records; confirmed now '+confirmed+'/'+all.length+'. Rate '+(done/seconds).toFixed(2)+' entries/sec checked (not a guaranteed save rate). Unconfirmed rows remain in recovery storage.');
    }
    const final=(await meeraRecoveryAll()).filter(r=>r.owner===v9Owner());
    const count=final.filter(r=>r.verification==='CONFIRMED').length;
    unverified=final.length-count;
    meeraRecoverySay('Recovery finished checking '+final.length+' entries. VERIFIED IN BOTH SHEETS: '+count+'. Needs review / unconfirmed: '+unverified+'. Do NOT erase the original backup. Export Recovery Report for the details.');
  }finally{meeraRecoveryBusy=false;if(button)button.disabled=false}
}
async function meeraRecoveryExportReport(){
  meeraRecoveryAssertLogin();
  const rows=(await meeraRecoveryAll()).filter(r=>r.owner===v9Owner());
  const header=['REQUEST ID','BOX NUMBER','ORIGINAL STATE','RECOVERY STATUS','ERROR','CHECKED AT'];
  const escapeCsv=x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"';
  const csv=[header,...rows.map(r=>[r.requestId,r.box,r.state,r.verification,r.lastError,r.checkedAt||''])].map(r=>r.map(escapeCsv).join(',')).join('\r\n');
  v102Download('MEERA_RECOVERY_REPORT_'+v9Owner()+'.csv',csv,'text/csv;charset=utf-8');
}
// Clears only the currently logged-in owner's browser records, NOT LIVE sheets.
// The operator must first export and preserve a separate backup.
async function meeraClearOldLocalData(chatConfirmedOwner=null){
  meeraRecoveryAssertLogin();
  if(v9WorkerBusy||v9LocalBusy||meeraRecoveryBusy)throw Error('Sync or entry save is running. Try again when it stops.');
  if(!v9Db||!v9StorageReady)throw Error('Local queue storage is not ready.');
  const owner=v9Owner();
  if(chatConfirmedOwner!==owner){
    if(!confirm('PERMANENT LOCAL CLEAR for '+owner+' on THIS browser only. Your old entries may still be missing from LIVE. Confirm you have exported the backup to a different device. Continue?'))return 'Clear cancelled. No local entries deleted.';
    const typed=prompt('To clear old browser records, type exactly: CLEAR '+owner);
    if(typed!=='CLEAR '+owner){meeraRecoverySay('Clear cancelled. No records deleted.');return 'Clear cancelled. No local entries deleted.';}
  }
  if(!await v9Lease(false,owner))throw Error('Another browser tab is syncing. Close other tabs first.');
  v9WorkerBusy=true;
  const btn=document.getElementById('v9ClearOldLocal');
  if(btn)btn.disabled=true;
  let queueDeleted=0,recoveryDeleted=0;
  try{
    if(v9Owner()!==owner)throw Error('User changed during clear; cancelled.');
    // Delete this user only; other users' entries are untouched.
    await v9Transaction('entries','readwrite',(store)=>{
      const req=store.index('owner').getAllKeys(owner);
      req.onsuccess=()=>{const keys=req.result||[];queueDeleted=keys.length;keys.forEach(k=>store.delete(k))};
    });
    const recovery=await meeraRecoveryAll();
    const own=recovery.filter(r=>r.owner===owner);
    await meeraRecoveryTx('readwrite',(store)=>{for(const r of own)store.delete(r.key)});
    recoveryDeleted=own.length;
    // This old localStorage payload otherwise gets migrated BACK into the queue on next login.
    localStorage.removeItem(V9_LEGACY_PREFIX+owner);
    await v9Transaction('meta','readwrite',(store)=>{store.delete('nextseq:'+owner)});
    v9KnownBoxes=new Set();
    await v9RefreshUi();
    const qLeft=(await v9GetAll(owner)).length;
    const rLeft=(await meeraRecoveryAll()).filter(r=>r.owner===owner).length;
    if(qLeft||rLeft)throw Error('Clear verification failed: '+qLeft+' queue and '+rLeft+' recovery entries remain. Retry after closing other tabs.');
    const message='✅ OLD LOCAL PAYLOAD CLEARED for '+owner+': '+queueDeleted+' queue records + '+recoveryDeleted+' recovery records removed. Remaining: 0. LIVE Sheet and saved off-phone backup unchanged. New entries can start.';
    meeraRecoverySay(message);
    showStatus('formStatus',message,'ok');
    return message;
  }finally{
    v9WorkerBusy=false;
    if(btn)btn.disabled=false;
    await v9Release(owner);
    v9Schedule(12000);
  }
}
/* ===== End separate recovery module ===== */

/* -------- Event wiring -------- */
document.addEventListener("DOMContentLoaded",async()=>{
  $("todayLabel")?.remove(); // kept harmless for older saved copies
  $("date").value=localISODate();applyAutoShift(true);buildMachineChecklist();
  document.getElementById("v1022AdminHistory")?.addEventListener("click",v1022LoadAdminHistory);
  document.getElementById("v1027OpenEntry")?.addEventListener("click",()=>showView("entry"));
  $("loginForm").addEventListener("submit",login);window.__meeraLoginHandlerReady=true;$("quickOpenButton").addEventListener("click",quickOpenSavedSession);$("historyToggle").addEventListener("click",toggleHistory);$("logoutButton").addEventListener("click",logout);
  $("entryForm").addEventListener("submit",saveEntry);v9SetButton();v9ObserveQueuePanel();
  $("v9SyncNow").addEventListener("click",()=>v9Schedule(20));
  $("v9Export").addEventListener("click",()=>v9Export().catch(e=>showStatus("formStatus",e.message,"err")));
  $("v9ClearOldLocal").addEventListener("click",()=>meeraClearOldLocalData().catch(e=>meeraRecoverySay('Clear not completed: '+e.message+'. Preserve your downloaded backup.')));
  $("v9ImportButton").addEventListener("click",()=>$("v9ImportFile").click());
  $("v9ImportFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{await v9Import(f)}catch(x){showStatus("formStatus",x.message,"err")}e.target.value=""});
  $("meeraRecoverImport").addEventListener("click",()=>$("meeraRecoverFile").click());
  $("meeraRecoverFile").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{await meeraRecoveryImport(f)}catch(x){meeraRecoverySay('Import failed: '+x.message)}});
  $("meeraRecoverSync").addEventListener("click",()=>meeraRecoverySyncAll().catch(e=>meeraRecoverySay('Sync stopped: '+e.message+'. Original backup remains safe.')));
  $("meeraRecoverExport").addEventListener("click",()=>meeraRecoveryExportReport().catch(e=>meeraRecoverySay('Report error: '+e.message)));

  $("v9QueueBody").addEventListener("click",e=>{const b=e.target.closest("button[data-v9-action='check']");if(b)v9CheckOnly(b.dataset.v9Id)});
  window.addEventListener("online",()=>v9Schedule(150));
  // Phone OS can suspend the browser. Resume when returning; upload while closed is NOT guaranteed.
  window.addEventListener("resume",()=>{if(currentUser&&sessionVerified)v9Schedule(100)});
  window.addEventListener("pageshow",()=>{if(currentUser&&sessionVerified){v9Schedule(100);v9RefreshUi().catch(()=>{});}});
  window.addEventListener("focus",()=>{if(currentUser&&sessionVerified)v9Schedule(150)});
  window.addEventListener("pagehide",()=>{ /* Pending IndexedDB records remain durable; JS cannot upload after page termination. */ });
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){v9Schedule(250);v9RefreshUi().catch(()=>{});}});
  $("v12CheckLocalBox").addEventListener("click",async()=>{
    const el=$("v12LocalBoxDiagnostic"),box=getBoxPrefix()+boxDigits($("box").value);
    if(!v9StorageReady){el.textContent="Local queue database is not ready; no data was changed.";return;}
    const rows=await v9GetAll(v9Owner());const match=rows.filter(r=>r.box===box);
    el.textContent=match.length?box+" found in LOCAL IndexedDB: "+match.map(r=>r.state+" / Request ID …"+String(r.requestId).slice(-8)).join("; ")+". This is local history, not a live Sheet lookup. Do not clear pending records.":box+" not in this browser's local queue. Server may still reject a duplicate; inspect the server response.";
  });
  $("v12AddProduct").addEventListener("click",()=>v12SetMasterMode(true));$("v12BackPlanning").addEventListener("click",()=>v12SetMasterMode(false));
  $("resetButton").addEventListener("click",()=>resetForm(true));$("box").addEventListener("input",()=>{window.__boxManual=!!boxDigits($("box").value);updateBoxPreview()});$("adminBoxPrefix").addEventListener("change",()=>{$("box").value="";window.__boxManual=false;updateBoxPreview();});$("rollType").addEventListener("change",calcWeight);$("rollCount").addEventListener("input",calcWeight);$("grossWeight").addEventListener("input",calcWeight);
  $("machineSearch").addEventListener("input",filterMachineResults);$("machineSearch").addEventListener("focus",showMachineResults);$("machineSearch").addEventListener("blur",hideMachineResults);
  $("prodSearch").addEventListener("input",filterProductResults);$("prodSearch").addEventListener("focus",showProductResults);$("prodSearch").addEventListener("blur",hideProductResults);
  ["fFrom","fTo","fProd","fYarn","fSearch"].forEach(id=>$(id).addEventListener("input",renderEntryTables));$("clearFiltersButton").addEventListener("click",clearFilters);
  $("masterSearch").addEventListener("input",renderMasterTable);$("refreshButton").addEventListener("click",loadEntries);$("exportButton").addEventListener("click",exportCSV);$("printButton").addEventListener("click",()=>window.print());
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>showView(tab.dataset.view)));
  $("selectMachines1to74").addEventListener("click",()=>setMachineRange(1,74));$("selectMachines75to111").addEventListener("click",()=>setMachineRange(75,111));$("selectAllMachines").addEventListener("click",()=>setMachineChecks(allMachines()));$("clearAllMachines").addEventListener("click",()=>setMachineChecks([]));$("userForm").addEventListener("submit",saveUser);$("cancelEditButton").addEventListener("click",clearUserForm);
  $("rollTypesAuto").addEventListener("change",()=>{if($("rollTypesAuto").checked)$("rollTypePermissions").querySelectorAll(".roll-type-check").forEach(c=>c.checked=false)});
  $("rollTypePermissions").querySelectorAll(".roll-type-check").forEach(c=>c.addEventListener("change",()=>{const any=$("rollTypePermissions").querySelectorAll(".roll-type-check:checked").length>0;$("rollTypesAuto").checked=!any}));
  await restoreSession();
});
/* -------- Material Issue tab (covering machines) -------- */
const MI_BACKEND="https://unconfigured.invalid/exec";
let miPlan=Object.create(null),miMetallics=[],miLoaded=false;
let miStock={};
function miNk(v){return String(v||"").trim().toLowerCase().replace(/\s+/g," ")}
function miStockOf(mat){const v=miStock[miNk(mat)];return v===undefined?null:v}
function miJsonpStock(){return new Promise((resolve,reject)=>{const name="__mi_stock_"+Date.now()+"_"+Math.random().toString(36).slice(2);const params=new URLSearchParams({action:"materialStock",callback:name});const script=document.createElement("script");const cleanup=()=>{delete window[name];script.remove()};const timer=setTimeout(()=>{cleanup();reject(new Error("timeout"))},8000);window[name]=d=>{clearTimeout(timer);cleanup();resolve(d)};script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("blocked"))};script.src=MI_BACKEND+"?"+params.toString();(document.head||document.body||document.documentElement).appendChild(script)})}
async function miLoadStock(){try{const d=await miJsonpStock();miStock={};((d&&d.rows)||[]).forEach(r=>{miStock[miNk(r.material)]=Number(r.stock)||0});miRenderStockList();miOnProduct()}catch(e){miStock={}}}
function miMachineMetallics(){const m=miSelectedMachine();if(m==null)return miMetallics;const set=[];(miPlan[String(m)]||[]).forEach(x=>{if(x.metallic&&set.indexOf(x.metallic)<0)set.push(x.metallic)});return set.length?set:miMetallics}
function miJsonp(){return new Promise((resolve,reject)=>{const name="__mi_plan_"+Date.now()+"_"+Math.random().toString(36).slice(2);const params=new URLSearchParams({tq:"select A, B, G where A is not null and B is not null",tqx:"responseHandler:"+name,gid:PLANNING_GID});const script=document.createElement("script");script.async=true;const cleanup=()=>{delete window[name];script.remove()};const timer=setTimeout(()=>{cleanup();reject(new Error("request timed out"))},20000);window[name]=d=>{clearTimeout(timer);cleanup();resolve(d)};script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("network or browser security blocked the request"))};script.src="https://docs.google.com/spreadsheets/d/"+encodeURIComponent(PLANNING_SHEET_ID)+"/gviz/tq?"+params.toString();(document.head||document.body||document.documentElement).appendChild(script)})}
async function loadMaterialPlan(){try{const all=await fetchMiPlanAll();miPlan=all.plan;miMetallics=all.metallics;miLoaded=true;miPopulateMachines();miRenderProducts()}catch(err){miShow("Could not load Production Planning: "+err.message,"err")}}
const MI_PLAN_CACHE_KEY="production_entry_planning_metallic_v1";
let planningFetching=false,planningLastFetch=0,planningSource="",planningLastError="",planningBackendPromise=null;
function parseMiPlan(data){const plan=Object.create(null),mets=[];((data&&data.table&&data.table.rows)||[]).forEach(row=>{const c=row.c||[];const m=planningMachineNumber(planningCellValue(c[0]));const prod=text(planningCellValue(c[1]));const met=text(planningCellValue(c[2]));if(m==null||!prod)return;const k=String(m);plan[k]=plan[k]||[];const ex=plan[k].find(x=>normaliseProductKey(x.product)===normaliseProductKey(prod));if(ex){if(met&&!ex.metallic)ex.metallic=met}else{plan[k].push({product:prod,metallic:met})}if(met&&mets.indexOf(met)<0)mets.push(met)});return{plan:plan,metallics:mets}}
async function planningFromBackend(){
  if(!planningBackendPromise){
    planningBackendPromise=jsonp(WEB_APP_URL+"?action=planningLive&token="+encodeURIComponent(sessionToken)).then(d=>{
      if(!d||!d.ok||!Array.isArray(d.rows))throw new Error((d&&d.error)||"planningLive unavailable");
      const assign=Object.create(null),plan=Object.create(null),mets=[];
      d.rows.forEach(row=>{
        const machine=planningMachineNumber(row.m),prod=text(row.p),met=text(row.g);
        if(machine==null||!prod)return;
        const key=String(machine);assign[key]||(assign[key]=[]);
        if(!assign[key].some(x=>normaliseProductKey(x)===normaliseProductKey(prod)))assign[key].push(prod);
        plan[key]||(plan[key]=[]);
        const existing=plan[key].find(x=>normaliseProductKey(x.product)===normaliseProductKey(prod));
        if(existing){if(met&&!existing.metallic)existing.metallic=met}else plan[key].push({product:prod,metallic:met});
        if(met&&mets.indexOf(met)<0)mets.push(met);
      });
      if(!Object.keys(assign).length)throw new Error("no machine/product rows were found");
      return{assign:assign,plan:plan,metallics:mets};
    }).finally(()=>{planningBackendPromise=null});
  }
  return planningBackendPromise;
}
async function fetchMiPlanAll(){
  try{return await planningFromBackend()}
  catch(backendError){const data=await miJsonp();if(!data||data.status!=="ok")throw backendError||new Error("invalid planning response");const pm=parseMiPlan(data);return{assign:null,plan:pm.plan,metallics:pm.metallics}}
}
async function refreshAllPlanning(force){
  const now=Date.now();
  if(planningFetching)return;
  if(!force&&now-planningLastFetch<45000)return;
  planningFetching=true;
  try{
    const pA=fetchPlanningAssignments().then(v=>({ok:true,v:v})).catch(error=>({ok:false,error:error}));
    const pB=fetchMiPlanAll().then(v=>({ok:true,v:{plan:v.plan,metallics:v.metallics}})).catch(error=>({ok:false,error:error}));
    const ra=await pA,rb=await pB;
    planningLastFetch=Date.now();

    // Machine -> product assignment must come from a LIVE shared source.
    // If the primary planning request fails but the second live planning
    // request succeeds, use its machine/product plan as the live assignment
    // source. Never use this phone's localStorage or a hard-coded fallback.
    if(ra.ok){
      const liveAssignments=clonePlanningAssignments(ra.v);
      if(!Object.keys(liveAssignments).length)throw new Error("Production Planning returned no valid machine/product assignments.");
      planningAssignments=liveAssignments;
      planningLoaded=true;
      planningLoadError="";
      planningSource="live";
    }else if(rb.ok && rb.v && rb.v.plan){
      const liveAssignments=Object.create(null);
      Object.keys(rb.v.plan).forEach(machine=>{
        const rows=Array.isArray(rb.v.plan[machine])?rb.v.plan[machine]:[];
        rows.forEach(row=>{
          const product=text(row&&row.product);
          if(!product)return;
          const key=String(machine);
          liveAssignments[key]||(liveAssignments[key]=[]);
          if(!liveAssignments[key].some(x=>normaliseProductKey(x)===normaliseProductKey(product)))liveAssignments[key].push(product);
        });
      });
      if(Object.keys(liveAssignments).length){
        planningAssignments=liveAssignments;
        planningLoaded=true;
        planningLoadError="";
        planningSource="live-plan";
      }else{
        planningAssignments=Object.create(null);
        planningLoaded=false;
        planningLoadError="Live Production Planning returned no machine/product assignments.";
      }
    }else{
      planningAssignments=Object.create(null);
      planningLoaded=false;
      planningSource="unavailable";
      const detail=(ra.error&&ra.error.message)||(rb.error&&rb.error.message)||"shared planning request failed";
      planningLoadError="Live Production Planning is unavailable. "+detail;
    }
    if(planningLoaded)writeJsonCache(PLANNING_CACHE_KEY,planningAssignments);

    // Material planning may still use its own cache because this is separate
    // from the machine -> product selector.
    if(rb.ok){
      miPlan=rb.v.plan;miMetallics=rb.v.metallics;miLoaded=true;
      writeJsonCache(MI_PLAN_CACHE_KEY,{plan:miPlan,metallics:miMetallics});
    }else{
      const mc=readJsonCache(MI_PLAN_CACHE_KEY);
      if(mc&&mc.plan){miPlan=mc.plan;miMetallics=mc.metallics||[];miLoaded=true}
    }

    updateProductControl();
    if(selectedMachineNumber()!=null){
      if(planningLoaded)renderProductResults($("prodSearch").value);
      else clearProductSelection(true);
    }
    miPopulateMachines();miRenderProducts();
    if($("miProduct")&&$("miProduct").value)miOnProduct();
    if(!planningLoaded && selectedMachineNumber()!=null){
      showStatus("formStatus",planningLoadError,"err");
    }
  }catch(e){
    planningAssignments=Object.create(null);
    planningLoaded=false;
    planningLoadError="Live Production Planning is unavailable. Product selection is disabled until the shared planning data loads.";
    updateProductControl();
    clearProductSelection(true);
  }finally{
    planningFetching=false;
    if(!planningLoaded)setTimeout(()=>refreshAllPlanning(true),10000);
  }
}
function planningFastStart(){
  // Do not preload machine/product assignments from this phone.
  // The shared Production Planning backend is authoritative.
  planningAssignments=Object.create(null);
  planningLoaded=false;
  planningLoadError="Loading live Production Planning…";
  const mc=readJsonCache(MI_PLAN_CACHE_KEY);
  if(mc&&mc.plan){miPlan=mc.plan;miMetallics=mc.metallics||[];miLoaded=true}
  updateProductControl();
  refreshAllPlanning(true);
}
function miPopulateMachines(){const sel=$("miMachine");if(!sel)return;const cur=sel.value;sel.innerHTML='<option value="">Select covering M/C…</option>'+(allowedMachines||[]).map(m=>'<option value="'+m+'">Machine '+m+'</option>').join("");if(cur)sel.value=cur}
function miSelectedMachine(){const v=Number($("miMachine")&&$("miMachine").value);return Number.isInteger(v)?v:null}
function miRenderProducts(){const m=miSelectedMachine(),sel=$("miProduct");if(!sel)return;const req=$("miRequired");if(req)req.textContent="—";sel.innerHTML='<option value="">Select product…</option>';if(m==null||!miPlan[String(m)])return;sel.innerHTML+=miPlan[String(m)].map((x,i)=>'<option value="'+i+'">'+x.product+(x.metallic?" — needs "+x.metallic:"")+'</option>').join("")}
function miSelectedEntry(){const m=miSelectedMachine();if(m==null)return null;const list=miPlan[String(m)]||[];const idx=Number($("miProduct").value);return Number.isInteger(idx)&&list[idx]?{machine:m,entry:list[idx]}:null}
function miOnProduct(){const e=miSelectedEntry();const req=$("miRequired");if(req){if(e&&e.entry.metallic){const st=miStockOf(e.entry.metallic);req.textContent=e.entry.metallic+"  —  Available stock: "+(st===null?"no stock record yet":st)}else req.textContent="(no metallic requirement listed in column G)"}const mi=$("miMaterial");if(mi)mi.value="";miShow("","ok")}
function miRenderMatSug(term){const box=$("miMatSug");if(!box)return;const t=String(term||"").toLowerCase().trim();const rows=miMachineMetallics().filter(x=>!t||x.toLowerCase().includes(t)).slice(0,8);if(!rows.length){box.style.display="none";box.innerHTML="";return}box.innerHTML=rows.map(x=>{const st=miStockOf(x);return '<div data-m="'+x.replace(/"/g,"&quot;")+'" style="padding:10px 12px;border-bottom:1px solid #e2e8f0;cursor:pointer;font-weight:700;font-size:14px">'+x.replace(/</g,"&lt;")+' <span style="color:'+(st!==null&&st<=0?"#b91c1b":"#047857")+';font-size:12px">— stock: '+(st===null?"no record":st)+'</span></div>'}).join("");box.style.display="block";box.querySelectorAll("[data-m]").forEach(el=>el.addEventListener("mousedown",ev=>{ev.preventDefault();$("miMaterial").value=el.getAttribute("data-m");box.style.display="none"}))}
function miShow(msg,kind){const el=$("miStatus");if(!el)return;if(!msg){el.style.display="none";el.textContent="";return}el.style.display="block";el.textContent=msg;el.style.background=kind==="err"?"#fee2e2":"#d1fae5";el.style.color=kind==="err"?"#991b1b":"#065f46"}
async function miSave(){const e=miSelectedEntry();if(!e){miShow("Select covering M/C and product first.","err");return}const material=$("miMaterial").value.trim();if(!material){miShow("Enter / select the material to issue.","err");return}const required=e.entry.metallic||"";const nk=v=>v.toLowerCase().replace(/\s+/g," ").trim();if(required&&nk(material)!==nk(required)){miShow("❌ Different material cannot be issued to M/C "+e.machine+". Required for "+e.entry.product+": "+required,"err");return}const qty=Number($("miQty").value);if(!isFinite(qty)||qty<=0){miShow("Enter a quantity above 0.","err");return}const avail=miStockOf(material);if(avail!==null&&qty>avail+0.001){miShow("❌ Not enough stock of "+material+". Available stock: "+avail,"err");return}const btn=$("miSaveBtn");btn.disabled=true;try{const res=await fetch(MI_BACKEND,{method:"POST",mode:"cors",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify({action:"saveMaterialIssue",machine:String(e.machine),product:e.entry.product,requiredMaterial:required,material:material,qty:qty,shift:$("miShift").value,remarks:$("miRemarks").value,user:(currentUser&&currentUser.username)||""})}).then(r=>r.json());if(!res||res.ok===false)throw new Error(res&&res.error||"save failed");miShow("✓ Issued "+qty+" of "+material+" to M/C "+e.machine+" ("+e.entry.product+")"+(res.remainingStock!==undefined?" — remaining stock: "+res.remainingStock:""),"ok");$("miMaterial").value="";$("miQty").value="";$("miRemarks").value="";miLoadList();miLoadStock()}catch(err){miShow("Could not save material issue: "+err.message,"err")}finally{btn.disabled=false}}
function miJsonpList(){return new Promise((resolve,reject)=>{const name="__mi_list_"+Date.now()+"_"+Math.random().toString(36).slice(2);const params=new URLSearchParams({action:"materialIssues",callback:name});const script=document.createElement("script");const cleanup=()=>{delete window[name];script.remove()};const timer=setTimeout(()=>{cleanup();reject(new Error("timeout"))},8000);window[name]=d=>{clearTimeout(timer);cleanup();resolve(d)};script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("blocked"))};script.src=MI_BACKEND+"?"+params.toString();(document.head||document.body||document.documentElement).appendChild(script)})}
async function miLoadList(){try{const d=await miJsonpList();const rowsAll=(d&&d.rows)||[];const m=miSelectedMachine();const rows=isAdmin()?rowsAll:rowsAll.filter(r=>allowedMachines.indexOf(Number(r.machine))>=0);const shown=(m!=null?rows.filter(r=>String(r.machine)===String(m)):rows).slice(0,30);$("miList").innerHTML=shown.length?'<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Date</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">M/C</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Product</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Required</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Issued Material</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Qty</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">By</th></tr></thead><tbody>'+shown.map(r=>'<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+(r.date||"")+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0"><b>'+(r.machine||"")+'</b></td><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+(r.product||"")+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+(r.requiredMaterial||"")+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0"><b>'+(r.material||"")+'</b></td><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+(r.qty||0)+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+(r.user||"")+'</td></tr>').join("")+'</tbody></table>':'<div class="empty">No material issues yet.</div>'}catch(e){const el=$("miList");if(el)el.innerHTML='<div class="empty">Material issue list unavailable.</div>'}}
$("miMachine").addEventListener("change",()=>{refreshAllPlanning(true);miRenderProducts();miLoadList()});
$("miProduct").addEventListener("change",miOnProduct);
$("miMaterial").addEventListener("input",()=>miRenderMatSug($("miMaterial").value));
$("miMaterial").addEventListener("focus",()=>miRenderMatSug($("miMaterial").value));
$("miMaterial").addEventListener("blur",()=>setTimeout(()=>{const b=$("miMatSug");if(b)b.style.display="none"},160));
$("miSaveBtn").addEventListener("click",miSave);
function miRenderStockSug(term){const box=$("miStockSug");if(!box)return;const tt=String(term||"").toLowerCase().trim();const rows=miMetallics.filter(x=>!tt||x.toLowerCase().includes(tt)).slice(0,8);if(!rows.length){box.style.display="none";box.innerHTML="";return}box.innerHTML=rows.map(x=>'<div data-m="'+x.replace(/"/g,"&quot;")+'" style="padding:10px 12px;border-bottom:1px solid #e2e8f0;cursor:pointer;font-weight:700;font-size:14px">'+x.replace(/</g,"&lt;")+'</div>').join("");box.style.display="block";box.querySelectorAll("[data-m]").forEach(el=>el.addEventListener("mousedown",ev=>{ev.preventDefault();$("miStockMat").value=el.getAttribute("data-m");box.style.display="none"}))}
function miRenderStockList(){const el=$("miStockList");if(!el)return;const keys=Object.keys(miStock).sort();el.innerHTML=keys.length?'<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Material</th><th style="text-align:left;padding:6px;border-bottom:2px solid #cbd5e1">Available Stock</th></tr></thead><tbody>'+keys.map(k=>'<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0;font-weight:700">'+k.replace(/</g,"&lt;")+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;font-weight:900;color:'+(miStock[k]<=0?"#b91c1b":"#047857")+'">'+miStock[k]+'</td></tr>').join("")+'</tbody></table>':'<div class="empty">No stock records yet — add stock below.</div>'}
async function miSaveStock(){const mat=$("miStockMat").value.trim();if(!mat){miStockShow("Enter the metallic material name.","err");return}const qty=Number($("miStockQty").value);if(!isFinite(qty)||qty<0){miStockShow("Enter a quantity of 0 or more.","err");return}const btn=$("miStockSaveBtn");btn.disabled=true;try{const res=await fetch(MI_BACKEND,{method:"POST",mode:"cors",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify({action:"setMaterialStock",material:mat,qty:qty,mode:$("miStockMode").value})}).then(r=>r.json());if(!res||res.ok===false)throw new Error(res&&res.error||"stock save failed");miStockShow("✓ Stock of "+res.material+" is now "+res.stock,"ok");$("miStockQty").value="";miLoadStock()}catch(e){miStockShow("Could not save stock: "+e.message,"err")}finally{btn.disabled=false}}
function miStockShow(msg,kind){const el=$("miStockStatus");if(!el)return;if(!msg){el.style.display="none";return}el.style.display="block";el.textContent=msg;el.style.background=kind==="err"?"#fee2e2":"#d1fae5";el.style.color=kind==="err"?"#991b1b":"#065f46"}
$("miStockMat").addEventListener("input",()=>miRenderStockSug($("miStockMat").value));
$("miStockMat").addEventListener("focus",()=>miRenderStockSug($("miStockMat").value));
$("miStockMat").addEventListener("blur",()=>setTimeout(()=>{const b=$("miStockSug");if(b)b.style.display="none"},160));
$("miStockSaveBtn").addEventListener("click",miSaveStock);
function miParseBulk(){const lines=($("miStockBulk").value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const rows=[];lines.forEach(line=>{const m=line.match(/^(.*?)[,\t]+([0-9]+(?:\.[0-9]+)?)\s*$/);if(m&&m[1].trim()){rows.push({material:m[1].trim(),qty:Number(m[2])})}});return rows}
async function miBulkSave(){const rows=miParseBulk();if(!rows.length){miStockShow("No valid lines. Each line must be: material name, quantity — e.g. JB GOLD 2872 B/S 50/303, 500","err");return}const btn=$("miBulkSaveBtn");btn.disabled=true;miStockShow("Uploading "+rows.length+" stock rows…","ok");try{const res=await fetch(MI_BACKEND,{method:"POST",mode:"cors",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify({action:"setMaterialStockBulk",rows:rows})}).then(r=>r.json());if(!res||res.ok===false)throw new Error(res&&res.error||"bulk upload failed");miStockShow("✓ Uploaded "+res.updated+" material stock row"+(res.updated===1?"":"s")+(res.skipped?" ("+res.skipped+" invalid line(s) skipped)":""), "ok");$("miStockBulk").value="";miLoadStock()}catch(e){miStockShow("Bulk upload failed: "+e.message,"err")}finally{btn.disabled=false}}
function miJsonpSeed(){return new Promise((resolve,reject)=>{const name="__mi_seed_"+Date.now()+"_"+Math.random().toString(36).slice(2);const params=new URLSearchParams({action:"seedMaterialStock",callback:name});const script=document.createElement("script");const cleanup=()=>{delete window[name];script.remove()};const timer=setTimeout(()=>{cleanup();reject(new Error("timeout"))},20000);window[name]=d=>{clearTimeout(timer);cleanup();resolve(d)};script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error("blocked"))};script.src=MI_BACKEND+"?"+params.toString();(document.head||document.body||document.documentElement).appendChild(script)})}
async function miSeed(){const btn=$("miSeedBtn");btn.disabled=true;miStockShow("Reading metallic list from Production Planning…","ok");try{const d=await miJsonpSeed();if(!d||d.ok===false)throw new Error(d&&d.error||"seed failed");miStockShow("✓ Metallic list ready: "+d.total+" metallic(s) from Production Planning, "+d.added+" new row(s) created with stock 0. Now paste quantities and press 💾 Upload all, or type them in the MATERIAL STOCK sheet tab.","ok");miLoadStock()}catch(e){miStockShow("Could not create list: "+e.message,"err")}finally{btn.disabled=false}}
$("miBulkSaveBtn").addEventListener("click",miBulkSave);
$("planRefreshBtn").addEventListener("click",()=>{const h=$("productHint");if(h)h.textContent="Refreshing Production Planning…";refreshAllPlanning(true).then(()=>{if(selectedMachineNumber()!=null)renderProductResults($("prodSearch").value);const h2=$("productHint");if(h2&&planningLoaded){h2.textContent=(planningSource==="backend"||planningSource==="gviz")?"Live assigned products refreshed.":"Live planning refresh failed: "+(planningLastError||"using saved assignments")}})});
$("miSeedBtn").addEventListener("click",miSeed);

/* ---- Automatic shift rule: 08:00-20:00 = DAY (same date), 20:00-08:00 = NIGHT (date = the day the night started) ---- */
function autoShiftNow(){const d=new Date();const iso=x=>{const z=new Date(x.getTime()-x.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};const h=d.getHours();if(h>=8&&h<20)return{date:iso(d),shift:"DAY"};const nd=new Date(d);if(h<8)nd.setDate(nd.getDate()-1);return{date:iso(nd),shift:"NIGHT"}}
let autoShiftLast={date:"",shift:""};
function applyAutoShift(force){const s=autoShiftNow();const de=$("date"),se=$("shift"),me=$("miShift");
if(de&&se){const untouched=!autoShiftLast.date||(de.value===autoShiftLast.date&&se.value===autoShiftLast.shift);if(force||untouched){de.value=s.date;se.value=s.shift;autoShiftLast={date:s.date,shift:s.shift}}}
if(me){const mu=!me.dataset.auto||me.value===me.dataset.auto;if(mu){me.value=s.shift;me.dataset.auto=s.shift}}}
setInterval(()=>applyAutoShift(false),30000);
// Keep machine/product assignments current while the app is open; refresh on return to the tab too.
setInterval(()=>{if(sessionToken&&document.visibilityState==="visible")refreshAllPlanning(false)},60000);
document.addEventListener("visibilitychange",()=>{if(sessionToken&&document.visibilityState==="visible")refreshAllPlanning(true)});
window.addEventListener("focus",()=>{if(sessionToken)refreshAllPlanning(true)});
$("miReloadBtn").addEventListener("click",()=>{miStockShow("Reloading stock from Google Sheet…","ok");miLoadStock().then(()=>miStockShow("✓ Stock reloaded from the MATERIAL STOCK sheet tab.","ok"))});

document.querySelectorAll(".tab").forEach(t=>{if(t.dataset.view==="material")t.addEventListener("click",()=>{applyAutoShift(false);refreshAllPlanning(true);miPopulateMachines();if(!miLoaded)loadMaterialPlan();miLoadList();miLoadStock()})});


;

(function(){
  'use strict';
  const THEME_KEY='meera_test_v10_theme',DEVICE_KEY='meera_test_v10_device',PHOTO_PREFIX='meera_test_v10_photo_';
  const $v=id=>document.getElementById(id);
  function storageGet(key,fallback){try{return localStorage.getItem(key)||fallback}catch(_){return fallback}}
  function storageSet(key,value){localStorage.setItem(key,value)}
  function deviceChoice(){return storageGet(DEVICE_KEY,window.matchMedia('(max-width:760px)').matches?'phone':'windows')}
  function applyDevice(device){if(device!=='phone'&&device!=='windows')return;document.documentElement.dataset.meeraDevice=device;
    try{storageSet(DEVICE_KEY,device)}catch(_){}
    document.querySelectorAll('input[name="v10LoginDevice"],input[name="v10SettingsDevice"]').forEach(el=>el.checked=el.value===device);
  }
  function applyTheme(theme){const t=theme==='dark'?'dark':'light';document.documentElement.dataset.meeraTheme=t;
    try{storageSet(THEME_KEY,t)}catch(_){}
    document.querySelectorAll('input[name="v10Theme"]').forEach(el=>el.checked=el.value===t);
  }
  function openSettings(){if(!$v('v10SettingsDrawer'))return;
    $v('v10SettingsDrawer').classList.remove('hidden');$v('v10SettingsScrim').classList.remove('hidden');
    $v('v10CloseSettings').focus();
  }
  function closeSettings(){$v('v10SettingsDrawer').classList.add('hidden');$v('v10SettingsScrim').classList.add('hidden')}
  function currentPhotoKey(){return PHOTO_PREFIX+String(currentUser&&currentUser.username||'').trim().toLowerCase()}
  function renderProfile(){if(!currentUser)return;
    const label=String(currentUser.name||currentUser.username||'Operator');
    $v('v10HomeName').textContent=label;
    $v('v10HomeRole').textContent=String(currentUser.role||'user').toLowerCase()==='admin'?'Administrator':'Operator';
    $v('v10HomeAdminLink').classList.toggle('hidden',!isAdmin());
    $v('v10HomeDate').textContent=new Intl.DateTimeFormat('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date());
    const fallback=$v('v10AvatarFallback');fallback.textContent=label.trim().slice(0,1).toUpperCase()||'👤';
    const img=$v('v10AvatarImage');const data=storageGet(currentPhotoKey(),'');
    if(data.startsWith('data:image/')){img.src=data;img.classList.remove('hidden');fallback.classList.add('hidden')}
    else{img.removeAttribute('src');img.classList.add('hidden');fallback.classList.remove('hidden')}
    $v('v10AvatarNote').textContent='Your photo stays on this device, in this browser.';
  }
  async function uploadPhoto(event){const file=event.target.files&&event.target.files[0];event.target.value='';if(!file||!currentUser)return;
    const note=$v('v10AvatarNote');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){note.textContent='Please choose a JPG, PNG or WebP photo.';return}
    if(file.size>8*1024*1024){note.textContent='Image too large. Choose a photo under 8 MB.';return}
    try{
      const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(new Error('Could not read photo'));r.onload=()=>resolve(r.result);r.readAsDataURL(file)});
      const photo=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Invalid photo'));im.src=data});
      const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo resizing unavailable');
      const size=Math.min(photo.naturalWidth,photo.naturalHeight),x=(photo.naturalWidth-size)/2,y=(photo.naturalHeight-size)/2;
      ctx.drawImage(photo,x,y,size,size,0,0,320,320);
      const compact=canvas.toDataURL('image/jpeg',.78);
      storageSet(currentPhotoKey(),compact);renderProfile();note.textContent='✓ Profile photo saved to this browser only.';
    }catch(err){note.textContent='Could not save photo locally: '+(err.message||'Storage unavailable')}
  }
  function openPage(dest){if(!currentUser)return;
    if(dest==='queue') {showView('dashboard');const el=$v('v9QueuePanel');if(el)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),90);return}
    if(dest==='admin'&&!isAdmin())return;
    showView(dest);
  }
  function machineSet(){return readMachineChecks()}
  function guessUnit(machines){const arr=normaliseMachines(machines);if(!arr.length)return '';
    if(arr.length===74&&arr.every((n,i)=>n===i+1))return '1';
    if(arr.length===37&&arr.every((n,i)=>n===i+75))return '2';
    if(arr.length===111&&arr.every((n,i)=>n===i+1))return 'both';
    return 'custom';
  }
  function updateMachineSummary(){const values=machineSet();const unit=$v('v10AdminUnit').value;
    const message=unit==='1'?'Unit 1: Machines 1–74':unit==='2'?'Unit 2: Machines 75–111':unit==='both'?'Both Units: Machines 1–111':unit==='custom'?'Custom machine selection':'Choose Unit 1 or Unit 2';
    $v('v10MachineSummary').textContent=message;
    $v('v10MachineSub').textContent=values.length+' machine'+(values.length===1?'':'s')+' selected. '+(unit==='custom'?'Open Advanced to review.':'No long checklist needed.');
    $v('v10AdvancedMachines').classList.toggle('hidden',unit!=='custom');
    $v('v10AdvancedMachines').open=unit==='custom';
  }
  function applyUnit(unit){const selected=String(unit||'');
    if(selected==='1'){setMachineRange(1,74);$v('userBoxPrefix').value='A';}
    else if(selected==='2'){setMachineRange(75,111);$v('userBoxPrefix').value='B';}
    else if(selected==='both'){setMachineChecks(allMachines());$v('userBoxPrefix').value='';}
    else if(!selected){setMachineChecks([]);$v('userBoxPrefix').value='';}
    updateMachineSummary();
  }
  function showAdminPanel(mode){if(!isAdmin())return;
    $v('v10AdminFormPanel').classList.toggle('hidden',mode!=='form');
    $v('v10AdminSearchPanel').classList.toggle('hidden',mode!=='search');
    if(mode==='search'){renderAdminCards();loadUsers();setTimeout(()=>$v('v10FindInput').focus(),100)}
    if(mode==='form'){setTimeout(()=>$v('userUsername').focus(),100)}
  }
  function newUser(){clearUserForm();$v('v10AdminFormHeading').textContent='Create New User';$v('v10AdminUnit').value='';applyUnit('');showAdminPanel('form')}
  function unitInfo(u){const unit=guessUnit(u.machines||[]);return unit==='1'?'Unit 1':unit==='2'?'Unit 2':unit==='both'?'Both Units':unit==='custom'?'Custom machines':'No machines'}
  function renderAdminCards(){const target=$v('v10UserCards');if(!target)return;
    const term=$v('v10FindInput').value.trim().toLowerCase();
    const filtered=users.filter(u=>[u.username,u.name,u.role,unitInfo(u)].some(x=>String(x||'').toLowerCase().includes(term)));
    target.replaceChildren();
    if(!filtered.length){const p=document.createElement('p');p.className='sub';p.textContent=users.length?'No users match your search.':'No users loaded yet.';target.appendChild(p);return}
    for(const u of filtered){
      const card=document.createElement('div');card.className='v10-user-card';
      const icon=document.createElement('div');icon.className='v10-user-initial';icon.textContent=String(u.name||u.username||'?').slice(0,1).toUpperCase();
      const info=document.createElement('div');info.className='v10-user-details';
      const h=document.createElement('h4');h.textContent=u.name||u.username;
      const meta=document.createElement('p');meta.textContent='@'+u.username;
      const tags=document.createElement('div');tags.className='v10-user-labels';
      for(const value of [String(u.role||'user').toUpperCase(),unitInfo(u),u.active===false?'Inactive':'Active']){const tag=document.createElement('span');tag.textContent=value;tags.appendChild(tag)}
      const acts=document.createElement('div');acts.className='v10-user-actions';
      const edit=document.createElement('button');edit.type='button';edit.textContent='✎ Edit';edit.addEventListener('click',()=>editUser(u.username));
      const del=document.createElement('button');del.type='button';del.className='v10-delete';del.textContent='Delete';del.addEventListener('click',()=>deleteUser(u.username));
      acts.append(edit,del);info.append(h,meta,tags,acts);card.append(icon,info);target.appendChild(card);
    }
  }
  function refreshAdminStats(){if(!isAdmin())return;
    $v('v10TotalUsers').textContent=users.length;
    $v('v10ActiveUsers').textContent=users.filter(u=>u.active!==false).length;
    $v('v10Unit1Users').textContent=users.filter(u=>u.role==='user'&&normaliseMachines(u.machines).some(n=>n<=74)).length;
    $v('v10Unit2Users').textContent=users.filter(u=>u.role==='user'&&normaliseMachines(u.machines).some(n=>n>=75)).length;
    $v('v10AdminPendingCount').textContent=$v('v9QueuedCount')?$v('v9QueuedCount').textContent:'—';
  }
  // Wrap existing UI render hooks rather than changing production/queue engine.
  const originalRenderUsers=renderUsers;
  renderUsers=function(){originalRenderUsers();refreshAdminStats();renderAdminCards()};
  const originalEditUser=editUser;
  editUser=function(username){showAdminPanel('form');originalEditUser(username);
    $v('v10AdminFormHeading').textContent='Edit User: '+username;
    $v('v10AdminUnit').value=guessUnit(machineSet());updateMachineSummary();
  };
  const originalClearUserForm=clearUserForm;
  clearUserForm=function(){originalClearUserForm();$v('v10AdminUnit').value='';updateMachineSummary();$v('v10AdminFormHeading').textContent='Create New User';};
  // Unlike a no-cors POST, a successful user list refresh can verify the saved user record.
  saveUser=async function(event){
    event.preventDefault();
    if(!isAdmin()||!sessionVerified){showStatus('adminStatus','Admin online login required.','err');return}
    const username=$v('userUsername').value.trim().toLowerCase(),editing=$v('editingUsername').value.trim().toLowerCase(),password=$v('userPassword').value;
    const role=$v('userRole').value,unit=$v('v10AdminUnit').value;
    if(!username||!$v('userName').value.trim()){showStatus('adminStatus','Enter Username and Display Name.','err');return}
    if(!editing&&!password){showStatus('adminStatus','Password required for a new user.','err');return}
    if(role==='user'&&unit!=='1'&&unit!=='2'&&unit!=='custom'){
      showStatus('adminStatus','Select Unit 1 or Unit 2 for an operator (or Advanced Custom).','err');return;
    }
    if(role==='user'&&unit==='custom'&&!readMachineChecks().length){showStatus('adminStatus','Custom operator requires at least one machine.','err');return}
    if(role==='user'&&(unit==='1'||unit==='2'))applyUnit(unit);
    if(role==='admin'&&!unit){showStatus('adminStatus','Choose both units or the intended admin machine access.','err');return}
    const data={username,name:$v('userName').value.trim(),role,boxPrefix:$v('userBoxPrefix').value,
      rollTypes:readRollTypeChecks(),active:$v('userActive').checked,machines:readMachineChecks(),microsoftEmail:$v('userMicrosoftEmail').value.trim().toLowerCase()};
    const button=$v('saveUserButton');button.disabled=true;button.textContent='Checking server…';
    try{
      if(password)data.passwordHash=await sha256(username+':'+password);
      await apiPost({action:'saveUser',token:sessionToken,user:data});
      showStatus('adminStatus','Save request sent. Waiting for the server to confirm the user record…','info');
      let confirmed=false, lastError='';
      for(let n=0;n<3;n++){
        await new Promise(r=>setTimeout(r,n===0?1400:1800));
        try{
          const response=await apiGet('users',{token:sessionToken});
          if(!response||!response.ok)throw new Error(response&&response.error||'User list unavailable');
          users=response.users||[];renderUsers();
          const serverUser=users.find(u=>String(u.username||'').toLowerCase()===username);
          if(serverUser && serverUser.name===data.name && String(serverUser.role||'')===data.role &&
            normaliseMachines(serverUser.machines).join(',')===data.machines.join(',') &&
            String(serverUser.boxPrefix||'')===String(data.boxPrefix||'') &&
            (serverUser.active!==false)===(data.active!==false) &&
            normaliseRollTypes(serverUser.rollTypes).join(',')===normaliseRollTypes(data.rollTypes).join(',')){
            confirmed=true;break;
          }
        }catch(err){lastError=err.message||'Network error'}
      }
      if(confirmed){originalClearUserForm();$v('v10AdminUnit').value='';updateMachineSummary();showStatus('adminStatus','✓ User record verified on TEST server. Password changes cannot be independently verified by this screen.','ok')}
      else showStatus('adminStatus','NOT VERIFIED YET. Request may have saved; do not submit again blindly. Use Find User / Refresh first. '+lastError,'err');
    }catch(err){showStatus('adminStatus','NOT VERIFIED: '+(err.message||'Network error')+'. Check Find User before retrying.','err')}
    finally{button.disabled=false;button.textContent='💾 Save User Access'}
  };
  const originalShowView=showView;
  showView=function(name){originalShowView(name);
    if(name==='home')renderProfile();
    if(name==='admin'){refreshAdminStats();showAdminPanel('none')}
    const stat=$v('statsArea');if(stat)stat.classList.remove('hidden');
    closeSettings();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    applyTheme(storageGet(THEME_KEY,'light'));applyDevice(deviceChoice());
    document.querySelectorAll('input[name="v10LoginDevice"]').forEach(el=>el.addEventListener('change',()=>applyDevice(el.value)));
    document.querySelectorAll('input[name="v10SettingsDevice"]').forEach(el=>el.addEventListener('change',()=>applyDevice(el.value)));
    document.querySelectorAll('input[name="v10Theme"]').forEach(el=>el.addEventListener('change',()=>applyTheme(el.value)));
    for(const id of ['v10HeaderSettings','v10HomeSettings'])$v(id).addEventListener('click',openSettings);
    $v('v10CloseSettings').addEventListener('click',closeSettings);$v('v10SettingsScrim').addEventListener('click',closeSettings);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings()});
    $v('v10AvatarInput').addEventListener('change',uploadPhoto);
    document.querySelectorAll('[data-v10-dest]').forEach(btn=>btn.addEventListener('click',()=>openPage(btn.dataset.v10Dest)));
    $v('v10AdminNew').addEventListener('click',newUser);
    $v('v10AdminFind').addEventListener('click',()=>showAdminPanel('search'));
    document.querySelectorAll('[data-v10-admin-back]').forEach(b=>b.addEventListener('click',()=>showAdminPanel('none')));
    $v('v10AdminRefresh').addEventListener('click',loadUsers);
    $v('v10AdminQueueOpen').addEventListener('click',()=>openPage('queue'));
    $v('v10AdminUnit').addEventListener('change',e=>applyUnit(e.target.value));
    $v('v10FindInput').addEventListener('input',renderAdminCards);
    $v('v10ClearFind').addEventListener('click',()=>{$v('v10FindInput').value='';renderAdminCards()});
    $v('userRole').addEventListener('change',()=>{
      if($v('userRole').value==='admin'&&!$v('v10AdminUnit').value){$v('v10AdminUnit').value='both';applyUnit('both')}
      else if($v('userRole').value==='user'&&$v('v10AdminUnit').value==='both'){$v('v10AdminUnit').value='';applyUnit('')}
    });
    $v('machineChecklist').addEventListener('change',updateMachineSummary);
    for(const id of ['selectMachines1to74','selectMachines75to111','selectAllMachines','clearAllMachines'])$v(id).addEventListener('click',()=>{$v('v10AdminUnit').value='custom';updateMachineSummary()});
    updateMachineSummary();
    if($v('loginView')&&!$v('loginView').classList.contains('hidden'))$v('loginUsername').focus();
  });
})();

;

async function meeraAdminRefresh(){
 const target=document.getElementById('meeraPendingRows');if(!target)return;
 if(typeof isAdmin!=='function'||!isAdmin()){target.textContent='Admin login required.';return}
 target.textContent='Loading verified server status…';
 try{
  const params={token:sessionToken,unit:document.getElementById('meeraUnitFilter').value,username:document.getElementById('meeraOperatorFilter').value.trim(),limit:200};
  const result=await apiGet('adminPendingSummary',params);
  if(!result||result.ok!==true)throw new Error(result?.error||'Server error');
  target.replaceChildren();
  const head=document.createElement('p');head.textContent=result.count+' unverified or review records (server and imported reports only).';target.appendChild(head);
  for(const r of result.items||[]){const d=document.createElement('div');d.style.cssText='padding:8px 0;border-bottom:1px solid #cbd5e1;font-size:12px;overflow-wrap:anywhere';d.textContent=['Unit '+(r.unit||'?'),r.username||'?','Box '+(r.box||'?'),r.status||'?','Source '+(r.source||'?'),'ID '+r.requestId].join(' | ');target.appendChild(d)}
 }catch(e){target.textContent='Could not load Pending Report: '+(e?.message||e)}
}
document.addEventListener('click',function(e){if(e.target?.closest?.('[data-view="admin"]'))setTimeout(meeraAdminRefresh,150)},true);

;

/* Operator form mirror: non-blocking and AUTHENTICATED Apps Script only.
   NEVER upload to GitHub, NEVER collect password/login/whole-screen data.
   POST no-cors is unverified; only authenticated admin read shows received records. */
(function(){
 'use strict';
 let ready=false, started=false, lastDraftAt=0, draftTimer=null, sending=false, cursor=0;
 let currentItems=[];
 const $m=id=>document.getElementById(id);
 const entryIds=new Set(['date','shift','machine','machineSearch','box','prodSearch','selectedProduct','rollType','rollCount','grossWeight','tareWeight','netWeight']);
 const clean=(v,n=200)=>String(v==null?'':v).slice(0,n);
 const online=()=>!!currentUser&&!!sessionToken&&!!sessionVerified;
 const admin=()=>online()&&typeof isAdmin==='function'&&isAdmin();
 function snapshot(){
  const x=id=>$m(id)?$m(id).value:'';
  const machine=x('machine')||clean(x('machineSearch')).replace(/[^0-9]/g,'');
  const box=(typeof getBoxPrefix==='function'?getBoxPrefix():'')+(typeof boxDigits==='function'?boxDigits(x('box')):x('box'));
  return {unit:typeof unitForMachine==='function'?unitForMachine(machine):'',
   machine:clean(machine,10),box:clean(box,30),date:clean(x('date'),20),shift:clean(x('shift'),20),
   product:clean(x('selectedProduct')||x('prodSearch')),yarn:clean(x('yarnCode')),rolls:clean(x('rollCount'),20),
   gross:clean(x('grossWeight'),30),tare:clean(x('tareWeight'),30),net:clean(x('netWeight'),30)};
 }
 function fromEntry(e){
  const p=e.payload||{};
  return {requestId:clean(e.requestId,100),stage:clean(e.state,30),
   box:clean(e.box,40),unit:clean(p.unit,5),machine:clean(p.machine,10),date:clean(p.date,20),
   shift:clean(p.shift,20),product:clean(p.productName),yarn:clean(p.yarnCode),
   rolls:clean(p.rollCount,20),gross:clean(p.grossW,30),tare:clean(p.tapeW,30),net:clean(p.netW,30),
   rollTypeCode:clean(p.rollTypeCode,10),rollType:clean(p.rollType,20),
   productSource:clean(p.productSource,30),timestamp:clean(p.timestamp,40)};
 }
 async function submit(items){
  if(!online()||!ready||!Array.isArray(items)||!items.length)return;
  // A monitoring failure MUST NOT block entry, queue sync or local save.
  try{await apiPost({action:'meeraMonitorPush',token:sessionToken,items:items.slice(0,12)});}catch(_){}
 }
 window.meeraMonitorQueueReport=function(entry){
  if(!ready||!online())return;
  submit([fromEntry(entry)]).catch(()=>{});
 };
 function scheduleDraft(){
  if(!ready||!online())return;
  clearTimeout(draftTimer);
  draftTimer=setTimeout(()=>{
   if(!ready||!online()||Date.now()-lastDraftAt<20000)return;
   lastDraftAt=Date.now();
   submit([{stage:'DRAFT',...snapshot()}]).catch(()=>{});
  },5500);
 }
 async function uploadLocalPending(){
  if(!ready||!online()||sending||typeof v9GetAll!=='function')return;
  sending=true;
  try{
   const owner=v9Owner(),rows=(await v9GetAll(owner)).filter(r=>!['SAVED','DUPLICATE','ON_SERVER'].includes(r.state));
   if(!rows.length){cursor=0;return}
   if(cursor>=rows.length)cursor=0;
   const slice=rows.slice(cursor,cursor+10).map(fromEntry);
   cursor+=slice.length;
   if(slice.length)await submit(slice);
  }catch(_){}finally{sending=false}
 }
 function statusLine(t){const e=$m('meeraMonitorHealth');if(e)e.textContent=t}
 function render(items){
  const t=$m('meeraMonitorRows');if(!t)return;t.replaceChildren();
  const filter=clean($m('meeraMonitorOperator')?.value).trim().toLowerCase();
  const state=clean($m('meeraMonitorStage')?.value).trim().toUpperCase();
  const filtered=items.filter(r=>(!filter||clean(r.username).toLowerCase().includes(filter))&&(!state||clean(r.stage).toUpperCase()===state));
  const summary=$m('meeraMonitorSummary');if(summary)summary.textContent=filtered.length+' phone-reported records shown (not necessarily Production-confirmed). Drafts are snapshots of the entry form only.';
  if(!filtered.length){const tr=t.insertRow();const td=tr.insertCell();td.colSpan=8;td.textContent='No matching server-received reports.';return}
  filtered.forEach(r=>{
   const tr=t.insertRow();
   [r.username,(r.unit||'?')+' / '+(r.machine||'?'),r.box,r.product,r.rolls,r.gross,r.stage,r.updatedAt].forEach(value=>{
    const td=tr.insertCell();td.textContent=clean(value,180);
   });
  });
 }
 async function refresh(){
  if(!admin()){statusLine('Only Admin can load remote operator reports.');return}
  const btn=$m('meeraMonitorRefresh');if(btn)btn.disabled=true;
  try{
   const res=await apiGet('meeraMonitorRead',{token:sessionToken,limit:300});
   if(!res||!res.ok||res.monitorVersion!=='M1'||!Array.isArray(res.items))throw Error(res&&res.error||'Monitor backend not deployed');
   currentItems=res.items;render(currentItems);statusLine('Connected • Server-received entry form reports. Phone-only unsent data cannot appear here.');
  }catch(e){statusLine('Monitor not active on LIVE Apps Script: '+clean(e&&e.message||e));}
  finally{if(btn)btn.disabled=false}
 }
 async function start(){
  if(!online())return;
  try{
   const res=await apiGet('meeraMonitorCapabilities',{token:sessionToken});
   ready=Boolean(res&&res.ok===true&&res.monitorVersion==='M1');
  }catch(_){ready=false}
  if(admin())statusLine(ready?'Server monitor available. Select Refresh to load reports.':'Backend MEERA_MONITOR_V1.gs is not installed/deployed yet. No remote phone drafts available.');
  if(ready)uploadLocalPending().catch(()=>{});
 }
 window.meeraMonitorStart=()=>start().catch(()=>{});
 if(!started){
  started=true;
  document.addEventListener('input',e=>{if(e.target&&entryIds.has(e.target.id))scheduleDraft()},true);
  document.addEventListener('change',e=>{if(e.target&&entryIds.has(e.target.id))scheduleDraft()},true);
  setInterval(()=>{if(ready&&online())uploadLocalPending().catch(()=>{});},45000);
  setInterval(()=>{if(admin()&&!$m('view-admin')?.classList.contains('hidden'))refresh().catch(()=>{});},25000);
  $m('meeraMonitorRefresh')?.addEventListener('click',()=>refresh().catch(()=>{}));
  $m('meeraMonitorOperator')?.addEventListener('input',()=>render(currentItems));
  $m('meeraMonitorStage')?.addEventListener('change',()=>render(currentItems));
  $m('meeraMonitorExport')?.addEventListener('click',()=>{
   if(!admin()||!currentItems.length)return;
   const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),source:'MEERA monitor — server received only',items:currentItems},null,2)],{type:'application/json'});
   const a=document.createElement('a'),url=URL.createObjectURL(blob);
   a.href=url;a.download='MEERA_ADMIN_MONITOR_VISIBLE_'+new Date().toISOString().slice(0,10)+'.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.addEventListener('click',e=>{
   if(e.target?.closest?.('[data-view="admin"]'))setTimeout(()=>refresh().catch(()=>{}),250);
  },true);
 }
})();

;

(function(){
  const link=document.getElementById('meeraAdminVideoStudio');
  if(!link)return;
  function authenticatedAdmin(){
    return !!(document.getElementById('appShell') &&
      !document.getElementById('appShell').classList.contains('hidden') &&
      typeof currentUser!=='undefined' && currentUser &&
      String(currentUser.role||'').trim().toLowerCase()==='admin' &&
      typeof sessionVerified!=='undefined' && sessionVerified);
  }
  function sync(){
    const allowed=authenticatedAdmin();
    link.hidden=!allowed;
    link.style.display=allowed?'':'none';
    if(!allowed){
      const ai=document.getElementById('meeraAiRoot');
      if(ai){ai.classList.add('hidden');const pane=document.getElementById('meeraAiChat');if(pane)pane.hidden=true;}
    }
  }
  link.addEventListener('click',function(e){
    if(!authenticatedAdmin()){e.preventDefault();sync();}
  });
  const shell=document.getElementById('appShell');
  const badge=document.getElementById('userBadge');
  if(shell)new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});
  if(badge)new MutationObserver(sync).observe(badge,{childList:true,characterData:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(sync,0)},true);
  sync();
})();
