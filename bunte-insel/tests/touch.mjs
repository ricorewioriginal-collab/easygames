/* Touch-Steuerung: schwebender Stick in der linken Hälfte, Wisch-Modus (überall), Tippen = dorthin gehen, zweiter Finger = Kamera. Aufruf: THREE=... node bunte-insel/tests/touch.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 800, height: 400 }, hasTouch: true, isMobile: true })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(700);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, z = document.getElementById('zone');
  const ev = (t, id, x, y) => z.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: id === 1 }));
  P.veh = null; P.x = 0; P.z = 60; P.y = 0; await sl(300);
  /* 1. Stick links irgendwo (nicht am Ring): läuft */
  ev('pointerdown', 1, 200, 220); ev('pointermove', 1, 280, 220); await sl(100); out.stick = Math.abs(b.inp.sx) > .5; out.float = document.getElementById('joy').classList.contains('on'); ev('pointerup', 1, 280, 220); await sl(100); out.stickEnd = b.inp.sx === 0 && b.inp.sy === 0;
  /* 2. Rechts wischen = Kamera */
  const y0 = b.cam.yaw; ev('pointerdown', 2, 600, 200); ev('pointermove', 2, 680, 200); ev('pointerup', 2, 680, 200); out.cam = b.cam.yaw !== y0;
  /* 3. Wisch-Modus: rechts auflegen = Stick; zweiter Finger = Kamera */
  b.save.steer = 'swipe'; ev('pointerdown', 3, 600, 200); ev('pointermove', 3, 680, 200); await sl(100); out.swipe = Math.abs(b.inp.sx) > .5; const y1 = b.cam.yaw; ev('pointerdown', 4, 500, 150); ev('pointermove', 4, 560, 150); out.second = b.cam.yaw !== y1 && Math.abs(b.inp.sx) > .5; ev('pointerup', 4, 560, 150); ev('pointerup', 3, 680, 200); b.save.steer = 'stick'; await sl(100);
  /* 4. Tippen = dorthin gehen */
  P.x = 0; P.z = 60; b.cam.yaw = 0; await sl(200); const x0 = P.x, z0 = P.z; ev('pointerdown', 5, 600, 330); ev('pointerup', 5, 600, 330); await sl(2500); out.go = Math.hypot(P.x - x0, P.z - z0) > 1.5;
  /* 5. Umschalter */
  const btn = document.getElementById('bSteer'); btn.click(); out.toggle = b.save.steer === 'swipe' && /Wischen/.test(document.getElementById('steerTxt').textContent); btn.click(); out.toggleBack = b.save.steer === 'stick';
  return out;
});
console.log(JSON.stringify(r));
ok(r.stick && r.float && r.stickEnd, 'Schwebender Stick: links irgendwo auflegen und ziehen = laufen, loslassen = Stopp'); ok(r.cam, 'Rechts wischen dreht die Kamera'); ok(r.swipe && r.second, 'Wisch-Modus: überall auflegen = Stick, zweiter Finger = Kamera');
ok(r.go, 'Kurz tippen: Held läuft zum angetippten Punkt'); ok(r.toggle && r.toggleBack, 'Umschalter Stick ⇄ Wischen (Einstellungen)'); ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 2).join('|'));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
