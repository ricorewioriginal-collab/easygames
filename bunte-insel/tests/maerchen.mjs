/* Browser-Test des Märchenlands (Bunte Insel, js/maerchen.js).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/maerchen.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
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

/* ---------- Märchenland ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, W = b.W, M = BI.MAERCHEN, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
    out.size = M.R >= 55 && M.R <= 70; out.zone = BI.worldAt(M.entry.x, M.entry.z) === 'maerchen' && BI.zoneAt(M.x, M.z, {}) === 'maerchen';
    const br = M.bridge; out.bridge = [-.4, -.2, 0, .2, .4].every(k => !W.resolve(br.mx + M.ux * br.L * k, br.mz + M.uz * br.L * k, .4, {}).hit);
    const far = W.resolve(M.x + M.R * 1.3 * M.uz * -1 + M.ux * 30, M.z + M.R * 1.3 * M.ux + M.uz * 30, .4, {}); out.edge = Math.hypot(far.x - M.x, far.z - M.z) <= M.R + .01;
    const others = [BI.CITY, BI.DAMPF, BI.BAULAND, BI.FUSSBALL]; out.apart = others.every(o => Math.hypot(o.x - M.x, o.z - M.z) > o.R + M.R + 8);
    const sp = W.spots; out.spots = ['wunsch', 'schloss', 'eis', 'fels', 'schiff', 'lagune', 'basar', 'dschungel'].every(k => sp[k] && Math.hypot(sp[k].x - M.x, sp[k].z - M.z) < M.R - 4);
    const c = M.at(28, 0); out.castle = W.resolve(c.x, c.z, .4, {}).hit === true;
    const names = b.town.folk.filter(f => f.p && Math.hypot(f.x - M.x, f.z - M.z) < M.R).map(f => f.p.name); out.folk = names.length;
    out.folkIn = b.town.folk.filter(f => f.p && /Lilia|Frida|Kralle|Bruno/.test(f.p.name)).every(f => Math.hypot(f.x - M.x, f.z - M.z) < M.R - 3 && !W.resolve(f.x, f.z, .3, {}).hit);
    /* Wunschbrunnen: die ersten drei bringen ⭐ */
    const w = sp.wunsch; b.P.veh = null; b.P.y = 0; b.P.x = w.x + 4; b.P.z = w.z; await sl(200); const s0 = b.save.stars, n = b.placeNear(); out.wishLabel = !!n && n.src === 'maerchen'; for (let i = 0; i < 4; i++) b.placeAct(b.placeNear());
    out.stars = b.save.stars - s0 >= 3 && b.save.stars - s0 <= 5; out.wishes = b.save.maerchen.wishes === 4;
    out.arcade = (sp.arcades || []).some(a => a.kind === 'sterne_maerchen' && Math.hypot(a.x - M.x, a.z - M.z) < M.R - 6);
    out.log = !!b.maerchen.log().rows.length; return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.size && r.apart && r.zone, 'Märchenland: Inselgröße, Zone/Musik, überlappt keine Nachbarinsel'); ok(r.bridge && r.edge, 'Märchenland: Brücke begehbar, Inselrand hält');
  ok(r.spots && r.castle, 'Märchenland: alle Orte auf der Insel, Schloss ist ein Hindernis'); ok(r.folk === 8 && r.folkIn, 'Märchenland: 8 Figuren, frei stehend auf der Insel');
  ok(r.wishLabel && r.stars && r.wishes, 'Wunschbrunnen: Knopf erscheint, die ersten 3 Wünsche geben je ⭐'); ok(r.arcade && r.log, 'Sternschnuppen-Automat steht auf der Insel; Aufgaben-Log hat Einträge');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
