/* Browser-Test: Rechenlast pro Bild (Dreiecke) an vier Orten. Die große Welt ist in Kacheln zerlegt, damit Handys nur zeichnen, was im Bild ist.
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/leistung.mjs   (optional THREE=/pfad/zu/three.min.js; DEBUG=1) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage(); const errs = []; let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(2000);
const r = await p.evaluate(async () => { const b = window.__bi, sl = ms => new Promise(r => setTimeout(r, ms)), o = {}; const M = BI.MAERCHEN;
  for (const [n, x, z] of [['start', 0, 40], ['stadt', 0, -250], ['park', 285, 20], ['maerchen', M.x, M.z]]) { b.P.veh = null; b.P.x = x; b.P.z = z; await sl(1500); o[n] = [b.renderer.info.render.calls, b.renderer.info.render.triangles]; }
  const cul = []; b.scene.traverse(m => { if (m.isMesh && m.geometry && m.geometry.attributes.position && !m.isInstancedMesh && m.frustumCulled) cul.push(1); }); o.culled = cul.length; return o; });
if (process.env.DEBUG) console.log(JSON.stringify(r));
ok(r.start[1] < 480000, 'Start: ' + r.start[1] + ' Dreiecke (vorher ~620 000)'); ok(r.stadt[1] < 300000, 'Stadt: ' + r.stadt[1] + ' (vorher ~680 000)');
ok(r.park[1] < 150000, 'Freizeitpark: ' + r.park[1] + ' (vorher ~600 000)'); ok(r.maerchen[1] < 170000, 'Märchenland: ' + r.maerchen[1] + ' (vorher ~560 000)');
ok(r.start[0] < 520, 'Zeichenaufrufe am Start: ' + r.start[0]); ok(r.culled > 100, 'Welt in Kacheln mit Sichtkegel-Test: ' + r.culled + ' Teil-Meshes');
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 4).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
