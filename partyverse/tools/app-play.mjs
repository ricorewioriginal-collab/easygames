/* Spielt eine komplette Partie automatisch durch (Mensch = einfacher Klick-Roboter) und macht Fotos bei Minispiel und Finale.
   Aufruf: node tools/app-play.mjs <prefix> [layout-id] [viewport=1000x600] [mode=bots|hotseat] */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [prefix = '/tmp/play', layout = 'prismara-02', vp = '1000x600', mode = 'bots'] = process.argv.slice(2);
const [W, H] = vp.split('x').map(Number);
const b = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: W < 700 });
const errs = [];
p.on('pageerror', (e) => { errs.push('PAGE ' + e.message); console.log('PAGEERROR', e.message, String(e.stack || '').split('\n').slice(0, 4).join(' | ')); });
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
await p.goto('http://localhost:5180/');
await p.waitForSelector('.menu', { timeout: 40000 });
await p.evaluate((l) => window.__app.store.update((d) => { d.lastSetup.layoutId = l; d.lastSetup.rounds = 1; }), layout);
await p.evaluate((m) => window.__app.go('setup', { mode: m }), mode);
await p.waitForSelector('.lgrid');
await p.click('text=Spiel starten');
await p.waitForSelector('.hud', { timeout: 30000 });
const shots = new Set();
const t0 = Date.now();
let stage = '';
while (Date.now() - t0 < 600000) {
  let st = 'wait';
  try { st = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const clickAny = (sel) => { const e = q(sel); if (e && !e.disabled) { e.click(); return true; } return false; };
    if (q('.finale')) return 'finale';
    if (q('.mgflow .count')) return 'count';
    if (q('.mg-hud')) return 'playing';
    if (q('.cover .btn.hot')) { const c = q('.cover .panel h2')?.textContent ?? ''; clickAny('.cover .btn.hot'); return 'cover:' + c; }
    if (q('.dialog')) { const bs = [...document.querySelectorAll('.dialog .btn:not(:disabled)')]; if (bs.length) bs[0].click(); return 'dialog'; }
    if (q('.actions .roll')) { q('.actions .roll').click(); return 'roll'; }
    const g = document.querySelector('.actions .btn.good'); if (g) { g.click(); return 'branch'; }
    return 'wait';
  }); } catch { await p.waitForTimeout(1000); continue; }
  if (st !== stage) { stage = st; console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', st); }
  const key = st.split(':')[0];
  if ((key === 'playing' || key === 'cover' || key === 'finale' || key === 'dialog') && !shots.has(key)) { shots.add(key); await p.waitForTimeout(key === 'finale' ? 6000 : 1500); await p.screenshot({ path: `${prefix}-${key}.png` }); }
  if (st === 'finale') { await p.waitForTimeout(3000); await p.screenshot({ path: `${prefix}-finale2.png` }); break; }
  await p.waitForTimeout(350);
}
console.log(JSON.stringify({ errs: errs.filter((e) => !/GL Driver|GPU stall|swiftshader/i.test(e)) }, null, 1));
await b.close();
