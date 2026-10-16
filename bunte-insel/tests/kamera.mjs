/* Kamera & Pride-Parade: Figur bleibt nach Fahrzeugfahrten sichtbar (Nahebene), Flug-Kamera bleibt über dem Meer auf Abstand,
   Ego-Sicht blendet störende Fahrzeugmodelle aus, Paradewagen in der Regenbogenwelt sind begehbar und fahren mit. Aufruf: node bunte-insel/tests/kamera.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE' })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
  /* 1. Nach einer Fahrt schneidet die Nahebene die Figur nicht mehr an */
  P.x = 0; P.z = 60; P.y = 0; b.callVeh('police'); await sl(300); const v = b.vehicles.find(q => q.type === 'police' && q.toy); P.x = v.x + 1; P.z = v.z; b.enter(v); await sl(800); out.nearIn = b.camera.near; b.leave(); await sl(800); out.nearOut = b.camera.near;
  /* 2. Flug über dem Meer: Kamera bleibt weit hinter dem Drachen (vorher sprang sie bis in das Modell) */
  b.save.owned.push('drake'); P.x = 0; P.z = 60; b.callVeh('drake'); await sl(300); const d = b.vehicles.find(q => q.type === 'drake'); d.x = 0; d.z = 280; P.x = d.x + 1; P.z = d.z; b.enter(d); d.y = 60; await sl(2500); out.flyDist = b.cam.dist; b.leave();
  /* 3. Ego-Sicht im Hubschrauber: Modell ausgeblendet, danach wieder sichtbar */
  P.x = 0; P.z = 60; P.y = 0; b.callVeh('heli'); await sl(300); const h = b.vehicles.find(q => q.type === 'heli'); P.x = h.x + 1; P.z = h.z; b.enter(h); await sl(300); b.toggleEgo(); await sl(400); out.egoHidden = !h.root.visible; b.toggleEgo(); await sl(400); out.egoBack = h.root.visible; b.leave(); await sl(300);
  /* 4. Pride-Parade: Wagen per Knopf betreten, Figur fährt mit; Anhänger ist begehbarer Boden */
  const R = BI.RAINBOW, rb = b.rainbow; P.x = R.x + 10.5; P.z = R.z; P.y = 0; await sl(400);
  let n = rb.near(); for (let i = 0; i < 40 && !(n && n.k === 'parade'); i++) { const wg = b.rainbow.wagons()[0]; P.x = wg.x + 3; P.z = wg.z; P.y = 0; await sl(60); n = rb.near(); }
  out.label = !!n && n.k === 'parade' && /Paradewagen/.test(n.label); rb.act(n); await sl(100);
  const x0 = P.x, z0 = P.z; out.onWagon = !!rb.wagon(); const t0 = b.t; for (let i = 0; i < 100 && b.t - t0 < 2.5; i++) await sl(100); out.carried = !!rb.wagon() && Math.hypot(P.x - x0, P.z - z0) > 2;
  const tr = b.rainbow.wagons().find(q => q.kind === 'trailer'); out.floor = Math.abs(rb.floorAt(tr.x, tr.z, 0) - .85) < .01;
  return out;
});
console.log(JSON.stringify(r));
ok(r.nearIn > .45 && Math.abs(r.nearOut - .45) < .01, 'Nahebene nach dem Aussteigen wieder klein (' + r.nearIn + ' → ' + r.nearOut + '): Figur wird nicht durchsichtig');
ok(r.flyDist > 12, 'Flug über dem Meer: Kamera bleibt auf Abstand (' + r.flyDist.toFixed(1) + ')');
ok(r.egoHidden && r.egoBack, 'Ego-Sicht im Hubschrauber blendet das Modell aus und danach wieder ein');
ok(r.label && r.onWagon && r.carried, 'Pride-Parade: Paradewagen betreten und mitfahren');
ok(r.floor, 'Pride-Parade: Anhänger ist begehbarer Boden');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
