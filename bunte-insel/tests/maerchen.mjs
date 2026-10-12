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
    const b = window.__bi, W = b.W, M = BI.MAERCHEN, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), sp = W.spots;
    out.size = M.R >= 70 && M.R <= 85; out.zone = BI.worldAt(M.entry.x, M.entry.z) === 'maerchen' && BI.zoneAt(M.x, M.z, {}) === 'maerchen';
    const br = M.bridge; out.bridge = [-.4, -.2, 0, .2, .4].every(k => !W.resolve(br.mx + M.ux * br.L * k, br.mz + M.uz * br.L * k, .4, {}).hit);
    const far = W.resolve(M.x + M.R * 1.3 * M.uz * -1 + M.ux * 30, M.z + M.R * 1.3 * M.ux + M.uz * 30, .4, {}); out.edge = Math.hypot(far.x - M.x, far.z - M.z) <= M.R + .01;
    const others = [BI.CITY, BI.DAMPF, BI.BAULAND, BI.FUSSBALL]; out.apart = others.every(o => Math.hypot(o.x - M.x, o.z - M.z) > o.R + M.R + 6);
    out.spots = ['wunsch', 'schloss', 'keep', 'eis', 'fels', 'schiff', 'lagune', 'basar', 'dschungel', 'honig', 'spielzeug', 'grusel', 'strand', 'roboter'].every(k => sp[k] && Math.hypot(sp[k].x - M.x, sp[k].z - M.z) < M.R - 4);
    out.castle = W.resolve(sp.keep.x, sp.keep.z, .4, {}).hit === true;
    const fo = b.town.folk.filter(f => f.p && Math.hypot(f.x - M.x, f.z - M.z) < M.R); out.folk = fo.length; out.names = new Set(fo.map(f => f.p.name)).size;
    out.folkIn = fo.every(f => Math.hypot(f.x - M.x, f.z - M.z) < M.R - 3 && !W.resolve(f.x, f.z, .3).hit && f.p.lines.length >= 1);
    /* Höhen: Königsfels und Eisberg sind begehbar (Stufen), Schiff hat Deck und Laufplanke */
    const top = sp.felsTop; out.rockTop = Math.abs(W.groundY(top.x, top.z) - top.y) < .01 && top.y > 7;
    const f0 = M.at(-10, 34), f1 = M.at(-10, 48); let ok = true, last = 0; for (let k = 0; k <= 20; k++) { const x = f0.x + (f1.x - f0.x) * k / 20, z = f0.z + (f1.z - f0.z) * k / 20, h = W.groundY(x, z); if (W.resolve(x, z, .4, {}).hit || h < last - .001 || h - last > 1.0) ok = false; last = h; } out.climb = ok && last > 5;
    const ice = M.at(-10, -52); out.ice = W.groundY(ice.x, ice.z) > 5;
    const deck = sp.schiffDeck; out.deck = Math.abs(W.groundY(deck.x, deck.z) - 2.4) < .01 && !W.resolve(deck.x, deck.z, .4, {}).hit;
    let ramp = true, lastR = -1; for (let k = 0; k <= 12; k++) { const q = M.at(-44, -33 - 0 + (-8 + (k / 12) * 8 + 0) * -1 * -1 - 0); } const r0 = M.at(-44, -33.5), r1 = M.at(-44, -39); for (let k = 0; k <= 10; k++) { const x = r0.x + (r1.x - r0.x) * k / 10, z = r0.z + (r1.z - r0.z) * k / 10; if (W.resolve(x, z, .4, {}).hit) ramp = false; } out.ramp = ramp && W.groundY(r0.x, r0.z) < 1 && W.groundY(r1.x, r1.z) > 1.8;
    const hull = M.at(-44, -45.7); out.hull = W.resolve(hull.x, hull.z, .3, {}).hit === true;
    /* Wunschbrunnen: die ersten drei bringen ⭐ */
    const w = sp.wunsch; b.P.veh = null; b.P.y = 0; b.P.x = w.x + 5; b.P.z = w.z; await sl(200); const s0 = b.save.stars, n = b.placeNear(); out.wishLabel = !!n && n.src === 'maerchen'; for (let i = 0; i < 4; i++) b.placeAct(b.placeNear());
    out.stars = b.save.stars - s0 >= 3 && b.save.stars - s0 <= 5; out.wishes = b.save.maerchen.wishes === 4;
    out.arcade = (sp.arcades || []).some(a => a.kind === 'sterne_maerchen' && Math.hypot(a.x - M.x, a.z - M.z) < M.R - 6);
    out.log = !!b.maerchen.log().rows.length;
    const calls = b.renderer.info.render.calls; b.P.x = M.entry.x; b.P.z = M.entry.z; await sl(600); out.calls = b.renderer.info.render.calls;
    return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.size && r.apart && r.zone, 'Märchenland: Inselgröße (R≈78), Zone/Musik, überlappt keine Nachbarinsel'); ok(r.bridge && r.edge, 'Märchenland: Brücke begehbar, Inselrand hält');
  ok(r.spots && r.castle, 'Märchenland: alle 13 Themen-Bereiche auf der Insel, Schloss ist ein Hindernis'); ok(r.folk === 29 && r.names === 29 && r.folkIn, 'Märchenland: 29 verschiedene Figuren, frei stehend auf der Insel');
  ok(r.rockTop && r.climb && r.ice, 'Märchenland: Königsfels und Eisberg sind in Stufen begehbar (Höhe 8 m / 6 m)'); ok(r.deck && r.ramp && r.hull, 'Märchenland: Piratenschiff mit Deck (2,4 m), Laufplanke, Bordwand hält');
  ok(r.wishLabel && r.stars && r.wishes, 'Wunschbrunnen: Knopf erscheint, die ersten 3 Wünsche geben je ⭐'); ok(r.arcade && r.log && r.calls < 700, 'Sternschnuppen-Automat steht auf der Insel; Aufgaben-Log hat Einträge (Zeichenaufrufe ' + r.calls + ')');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
