const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1200,height:500}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('C',m.text())});
await p.goto('http://localhost:8091/conv.html?'+process.argv[2]);for(let i=0;i<120;i++){const r=await p.evaluate(()=>window.READY);if(r){console.log(JSON.stringify(r));break;}await p.waitForTimeout(500);}
const shots=JSON.parse(process.argv[4]);let i=0;for(const [n,t,y] of shots){await p.evaluate(([n,t,y])=>show(n,t,y),[n,t,y]);await p.screenshot({path:process.argv[3]+'_'+(i++)+'.png',clip:{x:300,y:0,width:600,height:500}});}
if(process.argv[5]){const s=await p.evaluate(()=>exportGlb());require('fs').writeFileSync(process.argv[5],Buffer.from(s,'base64'));console.log('glb',Buffer.from(s,'base64').length);}
await b.close();})();
