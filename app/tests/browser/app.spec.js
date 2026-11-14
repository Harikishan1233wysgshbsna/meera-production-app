import {test,expect} from '@playwright/test';
test('mock dashboard: 200 local commits, cloud receipts and final server states',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.click('#login');await page.click('#add');await expect(page.locator('#status')).toContainText('"localSaved": 200',{timeout:20000});await page.click('#sync');await expect(page.locator('#status')).toContainText('"productionConfirmed": 200',{timeout:20000});await page.click('#logout');await expect(page.locator('#status')).toContainText('"localSaved": 0');expect(errors).toEqual([]);
});
test('sanitized RC5 form loads and keeps original validated form wired to durable queue',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('rc5-app-config',JSON.stringify({endpoint:'https://script.google.com/macros/s/TEST_ONLY/exec'})));
 await page.goto('/rc5.html');await expect(page.locator('aside').first()).toContainText('RC5 native queue');
 await page.evaluate(async()=>{
   const {Bridge}=await import('/bridge.js');Bridge.request=async()=>({ok:true,rows:[],data:[]});
   window.loadEntries=async()=>{};window.loadMaster=async()=>{};window.loadPlanningAssignments=async()=>{};
   await window.enterApp('mock-only',{username:'demo',name:'Demo',role:'user',active:true,machines:[1],rollTypes:['C'],boxPrefix:'A'},true);
   const s=document.createElement('script');s.textContent=`planningAssignments={'1':['TEST YARN [S]']};planningLoaded=true;masterData=[{name:'TEST YARN [S]',yarn:'Y'}];document.getElementById('machine').value='1';document.getElementById('machineSearch').value='1';syncRollTypeOptions();document.getElementById('prodSearch').value='TEST YARN [S]';document.getElementById('selectedProduct').value='TEST YARN [S]';document.getElementById('rollType').value='0.30';document.getElementById('rollCount').value='1';document.getElementById('grossWeight').value='2';document.getElementById('tareWeight').value='0.300';document.getElementById('netWeight').value='1.700';document.getElementById('box').value='12345';`;
   document.body.appendChild(s);
   await window.saveEntry({preventDefault(){}});
 });
 await expect(page.locator('#formStatus')).toContainText('SAVED ON PHONE');
 await expect.poll(()=>page.evaluate(async()=>(await (await import('/bridge.js')).Bridge.list()).entries.length)).toBe(1);
 const credentials=await page.evaluate(()=>localStorage.getItem('production_entry_shared_session_v1'));expect(credentials).toBeNull();expect(errors).toEqual([]);
});
