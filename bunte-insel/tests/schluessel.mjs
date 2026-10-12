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
  /* Schwingen besiegt Dunkelwichtel */
  b.P.veh = null; b.P.y = 0; b.P.x = M.x - 14; b.P.z = M.z; await sl(300);
  const s = b.save.schluessel; const e = K.dbg.E[0]; e.on = true; e.g.visible = true; e.hp = 2; e.x = b.P.x + 1; e.z = b.P.z; e.cd = 99;
  const h0 = s.herz, k0 = s.kills; K.dbg.swing(); K.dbg.E[0].on && (await sl(450), K.dbg.swing()); await sl(100);
  out.kill = s.kills === k0 + 1 && s.herz > h0;
  /* Schlüsselloch + Tor + Boss */
  for (const [id] of BI.SCHL_KEYS) K.dbg.unlock(id); out.fin = s.fin === 1 && Object.keys(s.keys).length === 5;
  b.P.x = M.at(-14, 27).x; b.P.z = M.at(-14, 27).z; await sl(300); const n = K.near(); out.portal = !!n && n.k === 'mportal';
  K.act(n); out.bossOn = K.dbg.boss.on === true; await sl(450); K.dbg.boss.hp = 1; b.P.x = K.dbg.boss.x + 2; b.P.z = K.dbg.boss.z; K.dbg.swing(); out.bossDown = !K.dbg.boss.on && s.boss === 1;
  /* Laden */
  s.herz = 20; K.shop(); out.shopOpen = !document.getElementById('schlPanel').hidden; document.querySelectorAll('#schlBox button')[1].click(); out.buy = s.owned.includes(1) && s.blade === 1 && s.herz === 15; K.close(); out.shopClosed = document.getElementById('schlPanel').hidden;
  /* Aufgaben-Log, Arcade */
  const lg = K.log(); out.log = lg.rows.length === 7 && /^7 von 7$/.test(lg.count.replace(/^\d+ von 7$/, '7 von 7'));
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
ok(r.kill, 'Schwingen besiegt Dunkelwichtel → Herz-Kristalle'); ok(r.fin && r.portal && r.bossOn && r.bossDown, 'Fünf Schlüssellöcher → Tor der Herzen → Dunkelriese besiegt');
ok(r.shopOpen && r.buy && r.shopClosed, 'Wuschel-Laden: kaufen, wählen, schließen'); ok(r.log && r.dest && r.arcade >= 1 && r.tris < 170000, 'Aufgaben-Log (7 Zeilen, Ziele), Automat auf Insel (Zeichenaufrufe ' + r.calls + ', Dreiecke ' + r.tris + ')');
for (const e of errs) console.log('ERR', e); ok(!errs.length, 'keine Seitenfehler');
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
