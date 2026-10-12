/* Browser-Test des Schlüsselreichs (Bunte Insel, js/schluessel.js).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/schluessel.mjs   (optional THREE=/pfad/zu/three.min.js; DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const r = await p.evaluate(async () => {
  const b = window.__bi, W = b.W, M = BI.SCHLUESSEL, K = b.schluessel, sp = W.spots, out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
  out.zone = BI.worldAt(M.entry.x, M.entry.z) === 'schluessel' && BI.zoneAt(M.x, M.z, {}) === 'schluessel';
  const br = M.bridge; out.bridge = [-.4, -.2, 0, .2, .4].every(k => !W.resolve(br.mx + M.ux * br.L * k, br.mz + M.uz * br.L * k, .4, {}).hit);
  out.apart = [BI.CITY, BI.DAMPF, BI.BAULAND, BI.FUSSBALL, BI.MAERCHEN].every(o => Math.hypot(o.x - M.x, o.z - M.z) > o.R + M.R + 6);
  out.spots = ['statue', 'uhrturm', 'glocke', 'sk_eis', 'sonne', 'simon', 'hafen', 'mobil', 'wald', 'wuschel', 'schmiede', 'turm', 'burg'].every(k => sp[k] && Math.hypot(sp[k].x - M.x, sp[k].z - M.z) < M.R - 4);
  const st = sp.statueTop; out.statueSolid = W.resolve(st.x, st.z, .4, {}).hit === true;
  const fo = b.town.folk.filter(f => f.p && Math.hypot(f.x - M.x, f.z - M.z) < M.R); out.folk = fo.length; out.names = new Set(fo.map(f => f.p.name)).size;
  out.folkIn = fo.every(f => Math.hypot(f.x - M.x, f.z - M.z) < M.R - 2 && !W.resolve(f.x, f.z, .3).hit && f.p.lines.length >= 1);
  out.veh = b.vehicles.filter(v => v.type === 'keymobil').length >= 2 && !!BI.VEH.keymobil;
  b.P.veh = null; b.P.y = 0; b.P.x = M.x - 14; b.P.z = M.z; await sl(300); const s = b.save.schluessel;
  /* keine Gegner mehr im Schlüsselreich, dafür Statuen der Schattenwächter am Tor */
  out.noEnemies = !K.dbg.E && !K.dbg.boss && sp.wacht.length === 2;
  const w0 = sp.wacht[0]; b.P.x = w0.x + 2.5; b.P.z = w0.z; await sl(300); let n0 = K.near(); out.wacht = !!n0 && n0.k === 'mwacht'; K.act(n0); out.wachtDone = s.wacht === 1;
  /* Laternen anzünden (Lichtzauber) */
  let li = -1; for (let i = 0; i < M.lamps.length && li < 0; i++) { b.P.x = M.lamps[i].x + 1.5; b.P.z = M.lamps[i].z; await sl(150); n0 = K.near(); if (n0 && n0.k === 'mzauber') li = i; } out.lampNear = li >= 0; const h0 = s.herz; K.dbg.zauber(); out.lamp = s.lit.length === 1 && s.herz === h0 + 1 && K.dbg.lampM.some(m => m.visible);
  /* Glühpilze → Schlüsselloch Wald */
  const gp = K.dbg.GPL; for (let i = 0; i < 8; i++) { b.P.x = gp[i].x; b.P.z = gp[i].z; await sl(120); } out.pilze = s.gp.every(Boolean) && !!s.keys.wald;
  /* Ringstraße: Sterne einsammeln (Fahrzeug-Position zählt) */
  const rs = K.dbg.RS; for (let i = 0; i < 12; i++) { b.P.x = rs[i].x; b.P.z = rs[i].z; await sl(300); } await sl(500); out.rund = s.rund === 1;
  /* Schlüssellöcher + Tor der Herzen (Fest statt Kampf) */
  for (const [id] of BI.SCHL_KEYS) K.dbg.unlock(id); out.fin = s.fin === 1 && Object.keys(s.keys).length === 5;
  b.P.x = M.at(-14, 27).x; b.P.z = M.at(-14, 27).z; await sl(300); const n = K.near(); out.portal = !!n && n.k === 'mportal'; K.act(n); out.torOffen = s.boss === 1;
  /* Auto: Straße vorhanden, Zufahrt für ein Auto frei */
  out.autos = b.vehicles.filter(v => (v.type === 'car' || v.type === 'taxi') && Math.hypot(v.x - M.x, v.z - M.z) < M.R).length >= 2;
  const car = b.vehicles.find(v => v.type === 'car' && Math.hypot(v.x - M.x, v.z - M.z) < M.R);
  const drive = (r0, pts) => { let bad = []; for (let k = 0; k < pts.length - 1; k++) { const [a0, b0] = pts[k], [a1, b1] = pts[k + 1], L = Math.hypot(a1 - a0, b1 - b0); for (let t = 0; t <= L; t += 1) { const p = M.at(a0 + (a1 - a0) * t / L, b0 + (b1 - b0) * t / L), q = W.resolve(p.x, p.z, r0, {}); if (Math.hypot(q.x - p.x, q.z - p.z) > .05) bad.push(Math.round(a0 + (a1 - a0) * t / L) + ',' + Math.round(b0 + (b1 - b0) * t / L)); } } return bad; };
  const ring = []; for (let k = 0; k <= 48; k++) ring.push([M.ring.a + Math.cos(k / 48 * 6.2832) * M.ring.r, M.ring.b + Math.sin(k / 48 * 6.2832) * M.ring.r]);
  out.roadBad = drive(1.45, ring).concat(...M.roadSegs.map(q => drive(1.45, [[q[0], q[1]], [q[2], q[3]]])));
  /* echte Probefahrt: vom Festland über die Brücke, Strandstraße, Ringstraße */
  { const c2 = new BI.Vehicle('car', 0, 0, 0), wp = [[-90, 0], [-46, 0], [-40, -20], [-14, -32], [18, 0], [-14, 32]].map(([a, bb]) => M.at(a, bb)), hd = Math.atan2(M.ux, M.uz); c2.setPose(M.ux * 150, M.uz * 150, hd); c2.v = 0; let wi = 0, vmax = 0, steps = 0; const inp = { thr: 1, steer: 0, turbo: false };
    for (; steps < 9000 && wi < wp.length; steps++) { const tg = wp[wi], dx = tg.x - c2.x, dz = tg.z - c2.z; if (Math.hypot(dx, dz) < 6) { wi++; continue; } let d = Math.atan2(dx, dz) - c2.h; d = Math.atan2(Math.sin(d), Math.cos(d)); inp.steer = -Math.max(-1, Math.min(1, d * 2.5)); inp.thr = Math.abs(d) > 1 ? .3 : 1; c2.step(1 / 60, inp, W, null); vmax = Math.max(vmax, c2.v); }
    out.drive = wi >= wp.length; out.vmax = Math.round(vmax); out.steps = steps; }
  out.onRoad = W.onRoad(M.at(M.ring.a + M.ring.r, M.ring.b).x, M.at(M.ring.a + M.ring.r, M.ring.b).z) && !W.onRoad(M.at(-30, 20).x, M.at(-30, 20).z);
  /* Laden */
  s.herz = 20; K.shop(); out.shopOpen = !document.getElementById('schlPanel').hidden; document.querySelectorAll('#schlBox button')[1].click(); out.buy = s.owned.includes(1) && s.blade === 1 && s.herz === 15; K.close(); out.shopClosed = document.getElementById('schlPanel').hidden;
  /* Aufgaben-Log, Arcade */
  const lg = K.log(); out.log = lg.rows.length === 10 && /von 10$/.test(lg.count);
  out.arcade = (sp.arcades || []).filter(a => /schluessel|licht|herz/i.test(a.kind) && Math.hypot(a.x - M.x, a.z - M.z) < M.R).length;
  out.dest = ['statue_s', 'strand_s', 'stadt_s', 'burg_s', 'wald_s', 'turm_s', 'hafen_s'].every(id => K.log().rows.some(r => r.dest === id));
  const calls = b.renderer.info.render.calls; b.P.x = M.entry.x; b.P.z = M.entry.z; await sl(1500); out.calls = b.renderer.info.render.calls; out.tris = b.renderer.info.render.triangles;
  return out;
});
if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
ok(r.zone && r.bridge && r.apart, 'Schlüsselreich: Zone/Musik, Brücke begehbar, überlappt keine Nachbarinsel');
ok(r.spots && r.statueSolid, 'Schlüsselreich: alle Bereiche auf der Insel, Statue ist fest');
ok(r.folk >= 28 && r.names === r.folk && r.folkIn, 'Schlüsselreich: ' + r.folk + ' verschiedene Figuren, frei stehend');
ok(r.veh, 'Schlüsselschwert-Mobil: 2 Stück am Hafen, Fahrzeugdaten vorhanden');
ok(r.noEnemies && r.wacht && r.wachtDone, 'Keine Gegner mehr – Schattenwächter-Statuen am Tor (begrüßen)'); ok(r.lampNear && r.lamp, 'Lichtzauber: Laterne anzünden (+Herz-Kristall)'); ok(r.pilze, 'Wald: 8 Glühpilze → Schlüsselloch'); ok(r.rund, 'Ringstraße: alle 12 Sterne → Runde geschafft');
ok(r.fin && r.portal && r.torOffen, 'Fünf Schlüssellöcher → Tor der Herzen öffnet sich (Feuerwerk statt Kampf)'); ok(r.drive, 'Probefahrt mit dem Auto: Brücke → Strand → Ringstraße (Höchstgeschwindigkeit ' + r.vmax + ', ' + r.steps + ' Schritte)'); ok(r.autos && r.roadBad.length === 0 && r.onRoad, 'Autos stehen am Eingang, Ringstraße + Zufahrten sind für Autos frei (' + r.roadBad.slice(0, 6).join(' ') + ')');
ok(r.shopOpen && r.buy && r.shopClosed, 'Wuschel-Laden: kaufen, wählen, schließen'); ok(r.log && r.dest && r.arcade >= 1 && r.tris < 700000, 'Aufgaben-Log (7 Zeilen, Ziele), Automat auf Insel (Zeichenaufrufe ' + r.calls + ', Dreiecke ' + r.tris + ')');
for (const e of errs) console.log('ERR', e); ok(!errs.length, 'keine Seitenfehler');
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
