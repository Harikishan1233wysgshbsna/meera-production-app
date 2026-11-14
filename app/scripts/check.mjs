import fs from 'node:fs';import vm from 'node:vm';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
for(const file of ['web/rc5-upstream.js','backend/CloudQueue.gs','backend/NativeApp.gs','tests/fixtures/rc5-save-functions.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const parent=path.dirname(root),live=path.join(parent,'RC5 LIVE');
if(fs.existsSync(live)){const result=spawnSync('git',['-C',parent,'diff','--name-only','--','RC5 LIVE'],{encoding:'utf8'});if(result.status===0&&result.stdout.trim())throw Error('Existing RC5 LIVE files were modified');console.log('Source syntax valid; original RC5 LIVE tracked files unchanged.');}else console.log('Source syntax valid; standalone package has no parent LIVE source to compare.');
