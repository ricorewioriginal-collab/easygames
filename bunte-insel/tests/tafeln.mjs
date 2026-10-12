/* Browser-Test der Bild-Tafeln (Bunte Insel, js/tafeln.js).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/tafeln.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const dbg = r => { if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); };
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);

/* ---------- Bild-Tafeln ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tafeln, W = b.W, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), L = T.list(); out.n = L.length;
    out.ids = new Set(L.map(t => t.id)).size === L.length;
    out.free = L.every(t => isFinite(t.x + t.z)) && L.every(t => Math.hypot(t.x, t.z) < 700);
    out.fussball = L.some(t => t.id === 'fussball' && Math.hypot(t.x - BI.FUSSBALL.entry.x, t.z - BI.FUSSBALL.entry.z) < 8);
    out.park = L.some(t => t.id === 'park');
    const said = []; BI.audio.speak = txt => said.push(txt);
    const t = L[0]; P.veh = null; P.y = 0; P.x = t.x + 2; P.z = t.z; await sl(100);
    const n = b.placeNear(); out.label = !!n && n.src === 'tafel'; b.placeAct(n); out.spoke = said.length >= 1 && said[0].length > 5;
    P.x = t.x + 200; P.z = t.z; for (let i = 0; i < 30 && t.m.visible; i++) await sl(200); out.dist = Math.hypot(P.x - t.x, P.z - t.z); out.vis = t.m.visible; out.hidden = t.m.visible === (out.dist < 140);
    out.text = L.every(t => BI.TAFELN[t.id][1].split(' ').length <= 3);
    return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.n >= 20 && r.ids && r.free, 'Tafeln stehen an den Welten (' + r.n + ' Stück, jede nur einmal)'); ok(r.fussball && r.park, 'Tafeln bei Fußball-Arena und Freizeitpark');
  ok(r.label && r.spoke, 'Hauptknopf „Vorlesen“ liest den Text vor'); ok(r.hidden, 'Weit entfernte Tafeln sind unsichtbar (sparsam)'); ok(r.text, 'Höchstens drei Wörter pro Tafel');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
