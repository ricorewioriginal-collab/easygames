import { chromium } from 'playwright';
const base = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 })).newPage();
await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(base + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(async()=>{const b=__bi,sl=ms=>new Promise(r=>setTimeout(r,ms));const o={};for(const [n,x,z] of [['start',0,40],['stadt',0,-250],['park',285,20],['maerchen',-175,-275]]){b.P.veh=null;b.P.x=x;b.P.z=z;await sl(1500);const i=b.renderer.info;o[n]=[i.render.calls,i.render.triangles];}o.geoms=b.renderer.info.memory.geometries;o.tex=b.renderer.info.memory.textures;return o;})));
await browser.close();
