/* Rundgang: besucht jedes Ziel des Wohin-Menüs, prüft Fehler, NaN-Positionen, Spieler unter der Welt, Zeichenaufrufe.
   Aufruf: THREE=... node bunte-insel/tests/rundgang.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 460 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join('|'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const res = await p.evaluate(async () => { const b = window.__bi, sl = ms => new Promise(r => setTimeout(r, ms)), bad = [];
  for (const d of b.DEST) { const e = errsLen(); try { const a = d.at(); b.P.veh = null; b.P.x = a.x; b.P.z = a.z; b.P.y = 0; } catch (x) { bad.push(d.id + ' at(): ' + x.message); continue; } await sl(350);
    const P = b.P, y = b.W.groundY(P.x, P.z); if (![P.x, P.y, P.z].every(Number.isFinite)) bad.push(d.id + ' NaN'); else if (P.y < y - 3 || P.y < -5) bad.push(d.id + ' unter Welt y=' + P.y.toFixed(1) + ' g=' + y.toFixed(1)); else if (b.W.resolve(P.x, P.z, .4, {}).hit && P.y < .5) bad.push(d.id + ' steckt in Wand'); if (b.renderer.info.render.calls > 900) bad.push(d.id + ' calls ' + b.renderer.info.render.calls); }
  function errsLen() { return 0; }
  return { n: b.DEST.length, bad }; });
console.log('Ziele:', res.n); res.bad.forEach(x => console.log('BAD ', x)); errs.slice(0, 15).forEach(x => console.log('ERR ', x));
await browser.close(); process.exit(res.bad.length || errs.length ? 1 : 0);
