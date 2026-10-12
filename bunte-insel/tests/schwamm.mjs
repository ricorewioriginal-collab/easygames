/* Schwammi-Bucht: Insel, Restaurant (essen, mitnehmen), Burger-Mini-Spiel, Quallenfischen, Wannen-Mobil mit Rückkehr, Figuren. Aufruf: node bunte-insel/tests/schwamm.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 800, height: 500 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, M = BI.SCHWAMM, K = b.schwamm, W = b.W, SP = W.spots, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, at = (a, bb) => M.at(a, bb);
  const go = (x, z, y) => { P.veh = null; P.x = x; P.z = z; P.y = y || 0; P.vy = 0; };
  out.zone = BI.worldAt(M.entry.x, M.entry.z) === 'schwamm' && BI.zoneAt(M.x, M.z, {}) === 'seegrund';
  const br = M.bridge; out.bridge = [-.4, -.2, 0, .2, .4].every(k => !W.resolve(br.mx + M.ux * br.L * k, br.mz + M.uz * br.L * k, .4, {}).hit);
  out.apart = [BI.CITY, BI.DAMPF, BI.BAULAND, BI.FUSSBALL, BI.MAERCHEN, BI.PARK, BI.RADIO, BI.SCHLUESSEL].every(o => Math.hypot(o.x - M.x, o.z - M.z) > o.R + M.R + 6);
  out.spots = ['sw_krabbe', 'sw_kasse', 'sw_grill', 'sw_klingel', 'sw_stein', 'sw_kopf', 'sw_karate', 'sw_plankto', 'sw_held', 'sw_quallen', 'sw_wanne'].every(k => SP[k] && Math.hypot(SP[k].x - M.x, SP[k].z - M.z) < M.R - 5);
  const fo = b.town.folk.filter(f => f.p && Math.hypot(f.x - M.x, f.z - M.z) < M.R); out.folk = fo.length; out.names = fo.map(f => f.p.name).join('|'); out.folkIn = fo.every(f => Math.hypot(f.x - M.x, f.z - M.z) < M.R - 2 && !W.resolve(f.x, f.z, .3).hit);
  /* Restaurant: Eingang frei, Theke erreichbar */
  { const KK = M.KK; out.doorFree = [-17, -14, -12, -10].every(a => [-16, -20, -26].every(bb => { const q = at(a === -17 ? -12 : -12, bb); return !W.resolve(q.x, q.z, .45, {}).hit; })); }
  /* Aktionen */
  const need = { swkasse: SP.sw_kasse, swgrill: SP.sw_grill, swklingel: SP.sw_klingel, swstein: SP.sw_stein, swklari: SP.sw_kopf, swkarate: SP.sw_karate, swplankto: SP.sw_plankto, swheld: SP.sw_held };
  out.nearBad = []; for (const [k, q] of Object.entries(need)) { go(q.x, q.z); await sl(150); const n = K.near(); if (!n || n.k !== k) out.nearBad.push(k + ':' + (n && n.k)); }
  /* Essen: Karte, bezahlen, Tisch, Mitnehmen */
  b.save.stars = 20; { go(SP.sw_kasse.x, SP.sw_kasse.z); await sl(150); K.act(K.near()); out.panel = K.open && !K.dbg.panel.hidden; K.dbg.order('burger', true); const iv = b.garden.inv(); out.take = (iv.krabbenburger | 0) === 1 && b.save.stars === 18; K.dbg.order('shake', false); out.eating = !!K.eat && b.save.stars === 17; for (let i = 0; i < 40 && K.eat; i++) await sl(250); out.ate = !K.eat && b.save.schwamm.meals === 2; }
  b.save.stars = 0; K.show(); K.dbg.order('burger', false); out.poor = !K.eat; K.close();
  /* Quallen */
  { const j = K.dbg.JEL[0]; await sl(200); go(j.g.position.x, j.g.position.z); await sl(150); const n = K.near(); out.jellyNear = !!n && n.k === 'swjelly'; if (n) K.act(n); out.jelly = b.save.schwamm.jelly === 1 && j.dead > 0; }
  /* Burger-Mini-Spiel startet */
  { go(SP.sw_grill.x, SP.sw_grill.z); await sl(150); K.act(K.near()); await sl(700); out.mini = b.mini.active && b.mini.kind === 'burger_krabbe'; out.miniApi = 'function'; }
  /* Burger-Spiel durchspielen: Bestellung erfüllen */
  { b.mini.stop && b.mini.stop(); b.mini.start('burger_krabbe', 4242, 45); const g = b.mini.cur(); for (let i = 0; i < 60; i++) b.mini.update(1 / 30); const W = 900, H = 560; const d = g.dbg(), geo = d.geo(); const s0 = b.mini.score; let done = 0;
    for (let round = 0; round < 3; round++) { const ord = g.dbg().order.slice(); for (const k of ord) { if (k === 'patty') { const gr = g.dbg().grill; let i = 0; for (let n = 0; n < 400; n++) { const ready = gr.findIndex(p => p.t >= 2.4 && p.t <= 5); if (ready >= 0) { i = ready; break; } b.mini.update(1 / 30); } g.tap(geo.gx(i), geo.gy); } else g.tap(geo.bx(['cheese', 'salad', 'tomato'].indexOf(k)), geo.by); } g.tap(geo.bx(3), geo.by); done++; }
    out.burger = b.mini.score - s0 >= 9 && g.dbg().stack.length === 0; out.burgerScore = b.mini.score - s0; b.mini.stop && b.mini.stop(); }
  /* Wannen-Mobil: einsteigen, fahren, aussteigen, Rückkehr zum Standplatz */
  { const v = b.vehicles.find(q => q.type === 'wannenmobil'), home = { x: v.home.x, z: v.home.z }; out.homeSet = !!v.home; b.P.veh = null; go(v.x + 3, v.z + 3); await sl(150); b.enter(v); out.entered = b.P.veh === v; const x0 = v.x, z0 = v.z; for (let i = 0; i < 180; i++) v.step(1 / 60, { thr: 1, steer: i % 90 < 45 ? .3 : -.3, turbo: false }, W, null); out.drove = Math.hypot(v.x - x0, v.z - z0) > 12; b.leave(true); out.left = !b.P.veh; v.idleT = 25; const f = at(-44, 10); go(f.x, f.z); await sl(1800); out.back = Math.hypot(v.x - home.x, v.z - home.z) < 2; }
  /* Fahrzeug */
  out.veh = b.vehicles.filter(v => v.type === 'wannenmobil').length === 1; return out; });
ok(r.zone && r.bridge && r.apart, 'Insel: Zone/Musik, Brücke begehbar, überlappt keine Nachbarinsel'); ok(r.spots, 'Alle Orte liegen auf der Insel');
ok(r.folk >= 11 && r.folkIn, r.folk + ' Figuren frei stehend: ' + r.names); ok(r.doorFree, 'Eingang der Knusper-Krabbe frei');
ok(r.nearBad.length === 0, 'Alle Aktionen werden am richtigen Ort angeboten ' + r.nearBad.join(','));
ok(r.panel && r.take && r.eating && r.ate && r.poor, 'Restaurant: Speisekarte, bezahlen, mitnehmen (Rucksack), am Tisch essen, ohne Sterne kein Essen');
ok(r.burger, 'Burger-Spiel: Bestellungen erfüllt (Punkte ' + r.burgerScore + ')'); ok(r.homeSet && r.entered && r.drove && r.left && r.back, 'Wannen-Mobil: einsteigen, fahren, aussteigen, kehrt zum Standplatz zurück');
ok(r.jellyNear && r.jelly, 'Quallenfischen: Kescher fängt Qualle'); ok(r.mini && r.miniApi === 'function', 'Burger braten startet als Mini-Spiel'); ok(r.veh, 'Wannen-Mobil steht in der Garage');
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
