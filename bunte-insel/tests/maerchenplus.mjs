/* Märchenland-Extras: Karussell, Schwanenboot, Eisrutsche, Schloss-Show, Umzug, Stempelheft, Willi, Popcorn, Mausohren. Aufruf: node bunte-insel/tests/maerchenplus.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 450 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, M = BI.MAERCHEN, K = b.mplus, W = b.W, PL = M.plus, SP = W.spots, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
  const go = (x, z, y) => { P.veh = null; P.x = x; P.z = z; P.y = y || 0; P.vy = 0; };
  const at = (a, bb) => M.at(a, bb);
  /* Orte frei begehbar (nicht in Hindernissen) */
  out.free = ['dock', 'show', 'parade', 'popcorn', 'ears', 'willi'].filter(k => { const q = SP['mp_' + k]; const rr = W.resolve(q.x + 2.6, q.z, .45, {}); return false; });
  out.blocked = []; for (const [nm, a, bb] of [['karussell-rand', PL.carousel.a - 7.6, PL.carousel.b], ['dock', PL.dock.a, PL.dock.b], ['show', PL.show.a + 2.4, PL.show.b], ['parade', PL.parade.a + 2.4, PL.parade.b], ['popcorn', PL.popcorn.a + 3.2, PL.popcorn.b], ['ears', PL.ears.a + 3.2, PL.ears.b], ['willi', PL.willi.a, PL.willi.b + 2]]) { const q = at(a, bb), rr = W.resolve(q.x, q.z, .45, {}); if (Math.hypot(rr.x - q.x, rr.z - q.z) > .05) out.blocked.push(nm); }
  /* Aktionen erkennbar */
  const need = { mcar: [PL.carousel.a - 7, PL.carousel.b], mboat: [PL.dock.a, PL.dock.b], mshow: [PL.show.a + 2.2, PL.show.b], mpar: [PL.parade.a + 2.2, PL.parade.b], mpop: [PL.popcorn.a + 3, PL.popcorn.b], mear: [PL.ears.a + 3, PL.ears.b], mwilli: [PL.willi.a, PL.willi.b + 2] };
  out.nearBad = []; for (const [k, [a, bb]] of Object.entries(need)) { const q = at(a, bb); go(q.x, q.z); await sl(150); const n = K.near(); if (!n || n.k !== k) out.nearBad.push(k + ':' + (n && n.k)); }
  /* Karussell */
  { const q = at(PL.carousel.a - 7, PL.carousel.b); go(q.x, q.z); await sl(150); K.act(K.near()); out.carBusy = K.busy(); await sl(600); const c = at(PL.carousel.a, PL.carousel.b); out.carNear = Math.hypot(P.x - c.x, P.z - c.z) < 4.5; K.dbg.endRide(); out.carEnd = !K.busy(); }
  /* Boot */
  { const q = at(PL.dock.a, PL.dock.b); go(q.x, q.z); await sl(150); K.act(K.near()); out.boatBusy = K.busy(); await sl(500); K.dbg.endRide(); out.boatEnd = !K.busy(); }
  /* Eisrutsche vom Gipfel */
  { const q = SP.mp_ice; go(q.x + 2, q.z, W.groundY(q.x + 2, q.z)); await sl(200); out.iceTop = P.y; const n = K.near(); out.iceNear = !!n && n.k === 'mice'; if (n) K.act(n); out.iceBusy = K.busy(); for (let i = 0; i < 60 && K.busy(); i++) await sl(250); out.iceEnd = !K.busy() && P.y < 1.2; out.iceY = P.y; }
  /* Show + Umzug */
  { const q = at(PL.show.a + 2.2, PL.show.b); go(q.x, q.z); await sl(150); K.act(K.near()); await sl(1500); out.show = !!K.dbg.show && K.dbg.show.n >= 1; }
  { const q = at(PL.parade.a + 2.2, PL.parade.b); go(q.x, q.z); await sl(150); K.act(K.near()); await sl(300); out.par = !!K.dbg.par; if (K.dbg.par) { K.dbg.par.t = 30; await sl(400); const lead = -62 + 30 * 2.0; const f = at(lead - 7, 0); go(f.x + 2, f.z); K.dbg.par.joinT = 7.9; await sl(800); out.parJoin = K.dbg.par && K.dbg.par.got; } }
  /* Stempelheft */
  { for (const [id] of K.dbg.STAMPS) { const q = SP[id]; go(q.x, q.z, W.groundY(q.x, q.z)); await sl(130); } out.stamps = b.save.mplus.st.length; out.stampSticker = (b.save.stk || []).includes('stempel'); }
  /* Willi, Popcorn, Mausohren */
  { let q = at(PL.willi.a, PL.willi.b + 2); go(q.x, q.z); await sl(150); K.act(K.near()); out.willi = !!b.save.mplus.once.willi;
    q = at(PL.popcorn.a + 3, PL.popcorn.b); go(q.x, q.z); await sl(150); K.act(K.near()); out.pop = !!b.save.mplus.once.pop;
    q = at(PL.ears.a + 3, PL.ears.b); go(q.x, q.z); await sl(150); K.act(K.near()); await sl(300); out.ears = !!b.save.mplus.ear && (b.save.stk || []).includes('mausohren'); }
  /* Basar: Gassen breit genug – alle Figuren vom Hauptweg aus erreichbar (Spieler-Kreis 0,45 m) */
  { const free = (a, bb) => { const q = at(a, bb), r = W.resolve(q.x, q.z, .45, {}); return Math.hypot(r.x - q.x, r.z - q.z) < .02; }; const S = .5, key = (i, j) => i + ',' + j, seen = new Set(), q = [[0, 0]]; seen.add(key(0, 0)); while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (ni < -150 || ni > 90 || nj < -130 || nj > 60 || seen.has(key(ni, nj)) || !free(ni * S, nj * S)) continue; seen.add(key(ni, nj)); q.push([ni, nj]); } }
    out.basar = {}; for (const f of b.town.folk) { if (!f.p || !['Teppich-Tom', 'Prinzessin Jasra', 'Wunschgeist Dschinni', 'Taxifahrer Theo'].includes(f.p.name)) continue; const l = M.loc(f.x, f.z); let ok2 = false; for (let da = -3; da <= 3 && !ok2; da++) for (let db = -3; db <= 3; db++) if (seen.has(key(Math.round(l.a / S) + da, Math.round(l.b / S) + db))) { ok2 = true; break; } out.basar[f.p.name] = ok2; } }
  /* Märchen-Taxi: steht am Eingang, fährt die Hauptstraße entlang */
  { const v = b.vehicles.find(q => q.type === 'taxi' && Math.hypot(q.x - M.x, q.z - M.z) < M.R); out.taxi = !!v; if (v) { out.taxiHome = !!v.home; const x0 = v.x, z0 = v.z; v.setPose(v.x, v.z, Math.atan2(M.ux, M.uz)); for (let i = 0; i < 240; i++) v.step(1 / 60, { thr: 1, steer: 0, turbo: false }, W, null); out.taxiDrive = Math.hypot(v.x - x0, v.z - z0) > 30 && W.onRoad(x0, z0) && v.v > 5; v.setPose(x0, z0, v.h); v.v = 0; } }
  const lg = K.log(); out.log = lg.rows.length === 9; out.logOk = lg.rows.filter(r => r.ok).length;
  return out; });
ok(r.blocked.length === 0, 'Alle Stationen sind frei erreichbar ' + r.blocked.join(','));
ok(r.nearBad.length === 0, 'Alle Aktionen werden am richtigen Ort angeboten ' + r.nearBad.join(','));
ok(r.carBusy && r.carNear && r.carEnd, 'Karussell: Fahrt startet, Spieler kreist, Ende'); ok(r.boatBusy && r.boatEnd, 'Schwanenboot-Fahrt'); ok(r.iceTop > 4.5 && r.iceNear && r.iceBusy && r.iceEnd, 'Eisrutsche vom Gipfel (Höhe ' + (r.iceTop || 0).toFixed(1) + ', unten ' + (r.iceY || 0).toFixed(1) + ')');
ok(r.show, 'Schloss-Show läuft'); ok(r.par && r.parJoin, 'Umzug startet, Mitlaufen wird belohnt'); ok(r.stamps === 10 && r.stampSticker, 'Stempelheft: 10 Stempel (' + r.stamps + ') + Sticker'); ok(r.willi && r.pop && r.ears, 'Willi umarmen, Popcorn, Mausohren'); ok(Object.keys(r.basar).length === 4 && Object.values(r.basar).every(Boolean), 'Basar: Teppich-Tom, Jasra, Dschinni und Taxifahrer Theo sind zu Fuß erreichbar ' + JSON.stringify(r.basar)); ok(r.taxi && r.taxiHome && r.taxiDrive, 'Märchen-Taxi steht am Eingang, kehrt heim und fährt auf der Hauptstraße');
ok(r.log && r.logOk >= 8, 'Aufgabenliste: 9 Zeilen, erledigt ' + r.logOk);
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
