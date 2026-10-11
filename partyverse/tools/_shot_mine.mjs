/* Bildschirmfotos eines Minispiels im Labor (Playwright, Software-WebGL).
   Aufruf: node tools/lab-shot.mjs <minispiel-id> [bot-skill=0.8] [ausgabe-präfix=/tmp/lab] [port=5180] [touch=0]
   Voraussetzung: Entwicklungsserver läuft (npx vite --config vite.config.ts --port 5180) und Playwright liegt unter /tmp/claude-0/t/node_modules. */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [id, skill = '0.8', prefix = '/tmp/lab', port = '5180', touch = '0'] = process.argv.slice(2);
if (!id) { console.error('Minispiel-ID fehlt'); process.exit(2); }
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: process.env.VP ? { width: +process.env.VP.split('x')[0], height: +process.env.VP.split('x')[1] } : touch === '1' ? { width: 820, height: 390 } : { width: 1000, height: 600 }, hasTouch: touch === '1' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
await p.goto(`http://localhost:${port}/?lab=${id}&bot=${skill}&seed=5&touch=${touch}`);
await p.waitForFunction(() => window.__lab, null, { timeout: 30000 });
const t0 = Date.now(); let shots = 0;
const marks = [1800, 4000, 8000, 14000];
while (Date.now() - t0 < 70000) {
  let done=false; try { done = await p.evaluate(() => window.__lab.done); } catch { await p.waitForFunction(() => window.__lab, null, { timeout: 30000 }).catch(()=>{}); continue; }
  const el = Date.now() - t0;
  if (marks.length && el >= marks[0]) { marks.shift(); await p.screenshot({ path: `${prefix}-${id}-${++shots}.png` }); }
  if (done) break;
  await p.waitForTimeout(200);
}
await p.screenshot({ path: `${prefix}-${id}-end.png` });
await p.waitForFunction(() => window.__lab, null, { timeout: 30000 }).catch(()=>{});
let r; try { r = await p.evaluate(() => ({ done: window.__lab.done, score: window.__lab.score, errors: window.__lab.errors })); } catch { r = { done: false, retry: true }; }
console.log(JSON.stringify({ id, ...r, pageErrors: errs.filter((e) => !/GL Driver|GPU stall/.test(e)) }));
await browser.close();
