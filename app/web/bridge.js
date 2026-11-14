import {Capacitor,registerPlugin} from '@capacitor/core';
import {canonicalPayload,digest,transition} from './protocol.js';
const native=registerPlugin('RC5Queue');
let demoSession=null; // Browser demo credentials are memory-only.
const dbPromise=()=>new Promise((ok,no)=>{const r=indexedDB.open('rc5-app-demo',1);r.onupgradeneeded=()=>r.result.createObjectStore('queue',{keyPath:'requestId'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
async function store(fn){const db=await dbPromise();return new Promise((ok,no)=>{const tx=db.transaction('queue','readwrite');let value;fn(tx.objectStore('queue'),v=>value=v);tx.oncomplete=()=>{db.close();ok(value);};tx.onerror=()=>{db.close();no(tx.error);};tx.onabort=()=>no(tx.error);});}
const browser={
  async setSession({token,user}){if(token!=='mock-only'||user.username!=='demo')throw Error('Browser preview supports mock only; use native app for test deployment');demoSession={token,user,owner:user.username,endpoint:''};return demoSession;},
  async getSession(){return demoSession||{};},async clearSession(){demoSession=null;return {};},
  async configure(){throw Error('Native app required for configuring a backend');},
  async enqueue({payloadJson,digest:hash}){if(!demoSession)throw Error('Login required');const p=JSON.parse(payloadJson);const row={requestId:p.requestId,owner:demoSession.owner,endpoint:'',payloadJson,digest:hash,state:'LOCAL_SAVED',attempts:0,createdAt:new Date().toISOString()};return store((s,set)=>{const q=s.get(row.requestId);q.onsuccess=()=>{if(q.result&&(q.result.owner!==row.owner||q.result.payloadJson!==payloadJson)){q.transaction?.abort();throw Error('Identity conflict');}if(!q.result)s.add(row);set(q.result||row);};});},
  async list(){const owner=demoSession?.owner;if(!owner)return {entries:[]};return store((s,set)=>{s.getAll().onsuccess=e=>set({entries:e.target.result.filter(r=>r.owner===owner)});});},
  async sync(){if(!demoSession)throw Error('Login required');const owner=demoSession.owner;const rows=(await this.list()).entries;const {MockCloud}=await import('./mock-cloud.js');browser.cloud??=new MockCloud();for(let i=0;i<rows.length;i+=10){if(demoSession?.owner!==owner)return {};const response=await browser.cloud.batch(owner,rows.slice(i,i+10));for(const result of response.results){const row=rows.find(r=>r.requestId===result.requestId);if(row)await store((s)=>s.put(transition(row,result)));}}return {};},
  async request(){throw Error('RC5 form requires a configured native test backend. Use mock dashboard for browser preview.');}
};
export const Bridge=Capacitor.isNativePlatform()?native:browser;
export async function enqueue(payload){const payloadJson=canonicalPayload(payload);return Bridge.enqueue({payloadJson,digest:await digest(payloadJson)});}
export function configuration(){try{return JSON.parse(localStorage.getItem('rc5-app-config')||'{}');}catch{return {};}}
export async function configure(endpoint){const url=new URL(endpoint);if(url.protocol!=='https:'||url.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)||url.search||url.hash||url.username||url.password)throw Error('Use an isolated Apps Script HTTPS /exec URL');await Bridge.configure({endpoint:url.href});localStorage.setItem('rc5-app-config',JSON.stringify({endpoint:url.href}));}
