const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8091/mocap.html');for(let i=0;i<240;i++){if(await p.evaluate(()=>window.READY))break;await p.waitForTimeout(500);}
console.log(JSON.stringify(await p.evaluate(()=>window.INFO),null,0));
const s=await p.evaluate(()=>exportGlb());require('fs').writeFileSync('mocap_raw.glb',Buffer.from(s,'base64'));console.log('glb',Buffer.from(s,'base64').length);await b.close();})();
