/* Kontext-Knöpfe zu Fuß: A = wichtigste Aktion, X = „Baum hauen“ (nur am Baum) sonst 2. Aktion, Y = 3. Aktion (Gespräch mit Figuren erreichbar!). Ohne Aktion: kein Knopf (kein Hallo/Hauen/Aktion). Aufruf: node bunte-insel/tests/buttons.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 800, height: 400 }, hasTouch: true, isMobile: true })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, W = b.W, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, lab = id => document.getElementById(id).innerText.replace(/\s+/g, ' ').trim();
  P.veh = null; P.x = 0; P.z = 60; P.y = 0; await sl(300); out.idleHidden = ['bAct', 'bAux', 'bHorn'].every(id => document.getElementById(id).hidden);
  /* Baum: nur dann „Baum hauen“ auf X */ { const T = W.trees.find(t => b.W.groundY(t.x + 1.4, t.z) < 1); if (T) { P.x = T.x + 1.4; P.z = T.z; P.y = 0; await sl(400); out.tree = /Baum hauen/.test(lab('bAux')) && !document.getElementById('bAux').hidden; P.x = 0; P.z = 60; await sl(300); out.treeGone = document.getElementById('bAux').hidden; } else out.tree = out.treeGone = true; }
  /* Stelle mit zwei Aktionen suchen: neben einem Auto UND einem Ort/Laden */
  let found = null; const spots = [...b.vehicles.filter(v => !v.ai).map(v => [v.x + 2.5, v.z]), ...Object.values(W.spots).filter(s => s && s.x != null).map(s => [s.x, s.z])];
  for (const [x, z] of spots) { P.veh = null; P.x = x; P.z = z; P.y = W.groundY(x, z); const L = b.footNow(); const LL = L.filter(Boolean); if (LL.length >= 2 && L[0] && L[1] && L[1].nm !== 'Baum hauen') { found = [x, z, L[0].nm, L[1].nm]; break; } }
  out.found = found;
  if (found) { P.x = found[0]; P.z = found[1]; await sl(400); out.a = lab('bAct'); out.x = lab('bAux'); out.same = out.a.includes(found[2]) && out.x.includes(found[3]); document.getElementById('bAux').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await sl(400); out.xRan = !!(b.innen.inside); }
  return out;
});
console.log(JSON.stringify(r));
ok(r.idleHidden, 'Ohne Aktion in der Nähe: Aktion-, Hauen- und Hallo-Knopf sind weg'); ok(r.tree && r.treeGone, '„Baum hauen“ erscheint nur direkt am Baum'); if (r.found) ok(r.same, 'Zwei Aktionen: A = ' + r.found[2] + ', X = ' + r.found[3] + ' (Beschriftung passt)'); if (r.found) ok(r.xRan, 'X führt die zweite Aktion aus (Gebäude betreten)'); else console.log('INFO keine Stelle mit zwei Aktionen gefunden');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 2).join('|'));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
