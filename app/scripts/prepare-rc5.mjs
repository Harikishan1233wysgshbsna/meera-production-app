/** Reproducible adaptation of a pinned upstream snapshot; never mutates LIVE. */
import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
const upstream=new URL('../../RC5 LIVE/index.html',import.meta.url);let html=fs.readFileSync(upstream,'utf8');
const hash=crypto.createHash('sha256').update(html).digest('hex');
function replaceOnce(a,b){if(!html.includes(a))throw Error('Upstream integration point changed: '+a.slice(0,80));html=html.replace(a,b);}
// Remove fixed backup PIN/export implementation rather than carrying a secret
// into the new app. Import/export needs an explicit native product design.
const from=html.indexOf('/* MEERA V102 locked backup.'),to=html.indexOf('async function saveEntry(event){',from);
if(from<0||to<0)throw Error('Backup integration markers changed');
html=html.slice(0,from)+`async function v9Export(){throw Error('Native backup export is not enabled in this starter. Full entries remain in SQLite.');}\nasync function v9Import(){throw Error('Legacy imports require explicit reviewed migration.');}\n`+html.slice(to);
// Offline restoration comes from Keychain/Keystore, not a plaintext browser token.
html=html.replaceAll('localStorage.setItem(SESSION_KEY,JSON.stringify({token:sessionToken,user:currentUser}));','await window.RC5Native.saveSession(sessionToken,currentUser);');
html=html.replaceAll('localStorage.setItem(SESSION_KEY,JSON.stringify({token:saved.token,user:currentUser}));','/* Session remains in native secure storage. */');
// Keep the validated RC5 form; all local queue operations route to native SQLite.
replaceOnce('if(entries.some(r=>String(r.box||r.boxNumber||\'\').toUpperCase()===finalBox)){','if(false && entries.some(r=>String(r.box||r.boxNumber||\'\').toUpperCase()===finalBox)){');
// Preserve duplicate policy on the server; warn rather than suppress distinct IDs.
replaceOnce('if(oldRows.some(r=>String(r.box||\'\').toUpperCase()===finalBox)){','if(false && oldRows.some(r=>String(r.box||\'\').toUpperCase()===finalBox)){');
// Scope offline planning/master caches to a native account+endpoint at runtime.
// Full endpoints and Google Sheet IDs are stripped from this vendored copy.
html=html.replace(/https?:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/(?:exec|dev)/g,'https://unconfigured.invalid/exec');
html=html.replace(/\b1[A-Za-z0-9_-]{30,}\b/g,'UNCONFIGURED_SHEET');
// Inline scripts marked module by Vite would run after listeners unexpectedly.
// Preserve their classic-script evaluation in a separate sanitized JS asset.
const scripts=[];html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(full,attrs,code)=>{if(/\bsrc\s*=/.test(attrs))return '';new vm.Script(code);if(!code.includes('async function localReply')&&!code.includes("username:'saurabh'"))scripts.push(code);return '';});
// Native bridge preload blocks original initialization until the adapter exists.
html=html.replace('</body>','<script type="module" src="/rc5-bootstrap.js"></script></body>');
fs.writeFileSync(new URL('../web/rc5.html',import.meta.url),html);
fs.writeFileSync(new URL('../web/rc5-upstream.js',import.meta.url),scripts.join('\n;\n'));
fs.writeFileSync(new URL('../docs/upstream.json',import.meta.url),JSON.stringify({repository:'Harikishan1233wysgshbsna/meera-production-app',path:'RC5 LIVE/index.html',commit:process.argv[2]||'aefb6cd00d63ef18eb049e843e77b0d77429affc',sha256:hash,changes:['native secure session hook','native SQLite queue adapter','removed fixed-PIN export, AI local-clear helper and admin diagnostic shortcut; disabled legacy import','removed production endpoints and spreadsheet IDs','distinct Request IDs follow backend duplicate policy']},null,2)+'\n');
