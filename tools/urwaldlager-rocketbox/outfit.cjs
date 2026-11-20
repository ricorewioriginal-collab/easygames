const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const jobs=JSON.parse(require('fs').readFileSync(process.argv[2]));
for(const [n,o] of jobs){const p=await b.newPage({viewport:{width:300,height:460}});p.on('pageerror',e=>console.log('ERR',n,e.message));
await p.goto('http://localhost:8091/outfit.html?n='+n+'&o='+encodeURIComponent(JSON.stringify(o)));for(let i=0;i<60;i++){if(await p.evaluate(()=>window.READY))break;await p.waitForTimeout(300);}
await p.screenshot({path:'thumbs2/'+n+'.png'});if(process.argv[3]){const s=await p.evaluate(()=>exportGlb());require('fs').writeFileSync('glb2/'+n+'.glb',Buffer.from(s,'base64'));}
console.log('ok',n,JSON.stringify(await p.evaluate(()=>window.BARE)));await p.close();}await b.close();})();
