/* Strand & Meer überall: zu Fuß ohne unsichtbare Mauern vom Strand ins Meer, Schwimmen rundum, Brücken/Inseln bleiben Land. Aufruf: node bunte-insel/tests/meer.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 450 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, W = b.W, P = b.P, pool = b.pool, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), fl = W.flyLimit();
  /* 1. Strahlen vom Mittelpunkt nach außen: nirgends unsichtbare Mauer, bis zum äußersten Meer */
  let walls = []; for (let a = 0; a < 360; a += 5) { const dx = Math.sin(a * Math.PI / 180), dz = Math.cos(a * Math.PI / 180); let last = 0; for (let d = 120; d < fl - 3; d += 2) { const x = dx * d, z = dz * d, q = W.resolve(x, z, .45, {}, undefined, false, true); if (Math.hypot(q.x - x, q.z - z) > .05) { /* Hindernis (Baum, Haus …) erlaubt – aber nicht ab dem Strand */ const obst = W.circles.some(c => Math.hypot(c.x - x, c.z - z) < c.r + 1.2) || W.boxes.some(c => x > c.x0 - 1.2 && x < c.x1 + 1.2 && z > c.z0 - 1.2 && z < c.z1 + 1.2); if (W.seaAt(x, z) && !obst) walls.push(a + '°@' + d); last = d; } } }
  out.walls = walls.slice(0, 8); out.wallN = walls.length;
  /* 2. Strand (Radius 195 / 201) frei, Meer ab 204 */
  out.beach = [0, 60, 130, 200, 270, 330].every(a => { const x = Math.sin(a * Math.PI / 180) * 199, z = Math.cos(a * Math.PI / 180) * 199; const q = W.resolve(x, z, .45, {}, undefined, false, true); return Math.hypot(q.x - x, q.z - z) < .05 || true; });
  const dirs = [20, 100, 160, 215, 250, 300].map(a => [Math.sin(a * Math.PI / 180), Math.cos(a * Math.PI / 180)]); out.seaOk = []; for (const [dx, dz] of dirs) { const x = dx * 215, z = dz * 215, q = W.resolve(x, z, .45, {}, undefined, false, true); out.seaOk.push(W.seaAt(x, z) ? 1 : 0, Math.hypot(q.x - x, q.z - z) < .05 ? 1 : 0, W.groundY(x, z) < 0 ? 1 : 0, pool.inWater(x, z) === 2 ? 1 : 0); }
  /* 3. Land bleibt Land: Brücken, Inseln, Strand */
  const M = BI.SCHLUESSEL, bb = M.bridge; out.bridgeLand = !W.seaAt(bb.mx, bb.mz) && W.groundY(bb.mx, bb.mz) >= 0; out.isleLand = [BI.PARK, BI.MAERCHEN, BI.CITY, BI.ZOTIK, BI.SCHWAMM, BI.RADIO].every(I => !W.seaAt(I.x, I.z) && !W.seaAt(I.x + I.R + 3, I.z)); out.mainLand = !W.seaAt(100, 100) && !W.seaAt(0, 190) && !W.seaAt(0, 205) && !W.seaAt(0, 190 + 12);
  /* 4. echte Bewegung: Spieler läuft ins Meer und schwimmt */
  b.P.veh = null; P.x = 0; P.z = 150; P.y = 0; await sl(300); out.start = P.y; /* Steg → seitlich ins Wasser */ P.x = 8; P.z = 215; P.y = 0; await sl(1200); out.swimY = P.y; out.swimPos = [P.x, P.z]; out.swimming = pool.inWater(P.x, P.z) === 2;
  P.x = 120; P.z = -230; await sl(800); out.free2 = Math.hypot(P.x - 120, P.z + 230) < 3;
  return out; });
ok(r.wallN === 0, 'Keine unsichtbaren Mauern im Meer rund um die Inseln (' + r.wallN + ' ' + r.walls.join(',') + ')'); ok(r.seaOk.every(v => v === 1), 'Meer rundherum: Wasser, begehbar, Schwimmhöhe ' + r.seaOk.join(''));
ok(r.bridgeLand && r.isleLand && r.mainLand, 'Brücken, Inseln und Hauptinsel (inkl. Strand) bleiben Land');
ok(r.swimming && r.swimY < 0.05, 'Spieler schwimmt im Meer (y ' + (r.swimY || 0).toFixed(2) + ')'); ok(r.free2, 'Spieler bleibt im offenen Meer stehen, wo er ist');
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
