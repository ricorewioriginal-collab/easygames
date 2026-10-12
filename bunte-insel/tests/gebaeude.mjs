/* Browser-Test: öffentliche Gebäude sind begehbar (Hauptinsel, Stadt, Fellretter-Insel, Scheune, Kino).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/gebaeude.mjs   (optional THREE=/pfad/zu/three.min.js; DEBUG=1) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 560 } })).newPage();
let fails = 0; const errs = []; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const r = await p.evaluate(async () => {
  const b = window.__bi, W = b.W, sl = ms => new Promise(r => setTimeout(r, ms)), out = [];
  const civ = W.interiors.filter(q => q.kind === 'civic'); b.P.veh = null;
  for (const q of civ) {
    const front = q.s > 0 ? q.z1 + .4 : q.z0 - .4, o = { name: q.sign.text, n: 0 };
    /* Tür: von außen über die Schwelle bis in die Mitte ohne Hindernis */
    let walk = true; const zs = [front + q.s * 2, front, front - q.s * 1.2]; for (const z of zs) if (W.resolve(q.cx, z, .4, {}).hit) walk = false; o.door = walk;
    o.wall = W.resolve(q.x0 + .1 - .4, q.cz, .4, {}).hit === true || W.resolve(q.x0 - .3, q.cz, .4, {}).hit === true;
    b.P.x = q.cx; b.P.z = q.cz + q.s * 1; b.P.y = 0; await sl(350); o.inside = b.town.inside() === q && q.roof.visible === false;
    b.P.x = q.cx; b.P.z = front + q.s * 6; await sl(350); o.roofBack = q.roof.visible === true;
    o.npc = !!q.resNpc && q.resNpc.p.lines.length >= 2; o.npcIn = !!q.resNpc && q.resNpc.x > q.x0 && q.resNpc.x < q.x1 && q.resNpc.z > q.z0 && q.resNpc.z < q.z1 && !W.resolve(q.resNpc.x, q.resNpc.z, .3, {}).hit;
    out.push(o);
  }
  return out;
});
if (process.env.DEBUG) console.log(JSON.stringify(r));
ok(r.length === 20, r.length + ' öffentliche Gebäude (Hauptinsel, Stadt, Fellretter-Insel) sind begehbar: ' + r.map(o => o.name).join(', '));
for (const o of r) ok(o.door && o.wall && o.inside && o.roofBack && o.npc && o.npcIn, o.name + ': Tür frei, Wand hält, Dach verschwindet drinnen, Figur steht drinnen');
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
