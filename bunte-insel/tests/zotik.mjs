/* Browser-Test der Zotik-Welt (Lunaris, Dorf am Mondblick) nach dem aktuellen Zotik-Spiel: Orte, Türen, Figuren, Quest „Der erste Riss“ von Anfang bis Ende.
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/zotik.mjs   (DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 }, locale: 'de-DE' });
let fails = 0; const errs = [];
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = window.__bi, Z = BI.ZOTIK, z = b.zotik, P = b.P, W = b.W, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), until = async (f, ms) => { for (let i = 0; i < (ms || 20000) / 150 && !f(); i++) await sl(150); return !!f(); };
  const go = (x, zz) => { P.veh = null; P.x = x; P.z = zz; P.y = 0; P.vy = 0; };
  const s = () => b.save.zotik;
  /* Orte und Türen */
  out.places = [Z.smith, Z.werk, Z.turm, Z.mondtor, Z.riss, Z.camp, Z.statue, Z.zportal].every(o => o && Math.hypot(o.x - Z.x, o.z - Z.z) < Z.R - 2) && Z.houses.length === 3 && Z.stones.length === 3 && Z.sky.length >= 3;
  out.doors = BI.DOORS.filter(d => d.isle === 'zotik').map(d => d.name);
  out.houseColl = Z.houses.every(h => W.resolve(h.x, h.z, .4, {}).hit === true);
  out.walkPaths = [[0, -60], [0, -20], [0, 20], [0, 70], [-40, 0]].every(([u, v]) => !W.resolve(Z.x + u * Z.S, Z.z + v * Z.S, .4, {}).hit);
  go(Z.x, Z.z - 20); await until(() => z.inside, 8000); out.inside = z.inside;
  await until(() => Z.weltReady, 20000); out.welt = !!Z.weltReady;
  /* Figuren nach Master-Sheet */
  const mira = BI.heroById('mira').o, lyra = BI.heroById('lyra').o, nia = BI.heroById('nia').o; out.looks = mira.hair === 0x4a86f0 && lyra.hair === 0xff9ad0 && nia.hair === 0x6ac05a;
  out.npcs = z.dbg.NPC.map(n => n.id).join(',');
  /* Quest */
  const npc = id => z.dbg.NPC.find(n => n.id === id), talk = async id => { const n = npc(id); go(n.x + 1.2, n.z + 1.2); await sl(200); const q = z.near(); if (!q || q.id !== id) return false; z.act(q); return true; };
  out.gateClosed = (() => { const g = Z.gates[0]; go(g.x, g.z + 1); const q = z.near(); return q && q.k === 'zgate'; })();
  out.t0 = await talk('mira'); out.st1 = await until(() => s().st === 1);
  for (let i = 0; i < 3; i++) { const h = z.dbg.HERB[i]; go(h.x, h.z); await until(() => s().herbs > i, 15000); } out.st2 = await until(() => s().st === 2, 5000);
  await talk('mira'); out.st3 = await until(() => s().st === 3);
  for (let i = 0; i < 5; i++) { const R = z.dbg.RIFT[i]; for (let k = 0; k < 60 && !((s().rb || 0) & (1 << i)); k++) { go(R.g.position.x, R.g.position.z); await sl(120); } } out.st4 = await until(() => s().st === 4, 5000);
  await talk('prof'); out.st5 = await until(() => s().st === 5);
  /* Mondsteine: so oft drehen, bis alle Vollmond zeigen */
  for (let i = 0; i < 3; i++) { const q0 = Z.stones[i]; go(q0.x + 1.6, q0.z); await sl(150); for (let k = 0; k < 6 && s().moon[i] !== 3; k++) { const q = z.near(); if (q && q.k === 'zstone') z.act(q); } } out.st6 = await until(() => s().st === 6, 4000);
  /* Mondwolf: Elementar-Kampf wird gestartet; Sieg setzt fought */
  go(Z.riss.x, Z.riss.z - 6); await sl(200); { const q = z.near(); out.wolfNear = q && q.k === 'zriss'; if (out.wolfNear) z.act(q); } await sl(600); out.game = !!(b.mini && b.mini.active); if (b.mini && b.mini.active) document.getElementById('mgExit').click(); await sl(800); go(Z.riss.x, Z.riss.z - 10);
  s().fought = 1; out.st7 = await until(() => s().st === 7, 8000);
  await talk('mira'); out.st8 = await until(() => s().st === 8, 15000); out.q4 = s().q === 4;
  out.log = z.log().rows.slice(0, 7).every(r => r.ok);
  /* Jedes Weltentor führt in seine eigene Welt (Tore stehen dicht nebeneinander) */
  out.gates = Z.gates.every(g => { go(g.x, g.z + 1); const q = z.near(); return q && q.k === 'zgate' && q.i === g.i; });
  /* Alter Spielstand (q = 4) gilt als geschafft */
  b.save.zotik = { q: 4, shards: [], pts: 0, paid: 0, fought: 1, visit: 1, gates: 1, ship: 0, felli: 0, talk: {} }; out.old = z.log().rows[6].ok === true;
  return out;
});
if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
ok(r.places && r.houseColl && r.walkPaths, 'Lunaris: Orte auf der Insel, Häuser fest, Wege frei');
ok(r.doors.length >= 4 && r.doors.some(n => /Wirtshaus/.test(n)) && r.doors.includes('Mondturm'), 'Lunaris: Türen (Wirtshaus, Läden, Mondturm): ' + r.doors.join(', '));
ok(r.inside && r.welt, 'Lunaris: freie Modelle (welt.bin) werden in der Nähe geladen');
ok(r.looks && /mira/.test(r.npcs) && /prof/.test(r.npcs) && /lyra/.test(r.npcs) && /boro/.test(r.npcs), 'Figuren nach den Master-Sheets: ' + r.npcs);
ok(r.gateClosed, 'Weltentore sind vor der Quest ansprechbar (schlafen noch)');
ok(r.t0 && r.st1 && r.st2 && r.st3, 'Quest: Mira → 3 Mondkräuter → zurück zu Mira');
ok(r.st4 && r.st5 && r.st6, 'Quest: 5 Riftlinge beruhigt → Professorium → Mondtor auf Vollmond');
ok(r.wolfNear && r.game && r.st7 && r.st8 && r.q4 && r.log, 'Quest: Mondwolf beruhigt → Bericht an Mira, Aufgaben-Log vollständig');
ok(r.gates, 'Jedes der 6 Weltentore führt in seine eigene Welt');
ok(r.old, 'Alter Spielstand (Quest geschafft) bleibt geschafft');
ok(!errs.length, 'keine Fehler auf der Seite ' + errs.slice(0, 3).join(' | '));
await browser.close(); process.exit(fails ? 1 : 0);
