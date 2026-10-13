/* Wunsch-Insel (Schlüsselwelt-Erweiterung): Brücke, Wunschfrüchte, Schlucht-Rätsel, Floß, Turm & Truhen, Einbruch der Dunkelheit, Schattenarena mit Umbra, Cheat, Log.
   Aufruf: THREE=... node bunte-insel/tests/wunsch.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 480 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const PRE = `
  const b = __bi, w = b.wunsch, T = BI.WUNSCH, Q = T.P, P = b.P, W = b.W, M = BI.SCHLUESSEL, D = w.dbg, out = (window.__o = window.__o || {}), sl = ms => new Promise(r => setTimeout(r, ms)), until = async (f, ms) => { for (let i = 0; i < (ms || 8000) / 100 && !f(); i++) await sl(100); return !!f(); };
  const tick = (n, dt) => { for (let i = 0; i < n; i++) w.update(dt || .05, performance.now() / 1000 + i * .05); }, until2 = async (f, ms) => { for (let i = 0; i < (ms || 8000) / 100 && !f(); i++) { tick(4); await sl(100); } return !!f(); };
const S = D.S, tp = (a, bb, y) => { const c = T.at(a, bb); P.veh = null; P.x = c.x; P.z = c.z; P.y = y || 0; }; b.save.stars = 0;`;
const r = {}; const sec = async (n, code) => { const t0 = Date.now(); const v = await Promise.race([p.evaluate('(async () => {' + PRE + code + '; return out; })()'), new Promise(res => setTimeout(() => res({ ['__timeout' + n]: 1 }), 75000))]); Object.assign(r, v); console.log('Abschnitt', n, Math.round((Date.now() - t0) / 1000) + ' s', v['__timeout' + n] ? 'ZEITÜBERSCHREITUNG' : ''); return !v['__timeout' + n]; };
if (!(await sec(1, `  /* 1. Insel + Brücke + Stege + Kletterwege */
  out.isle = W.isles.includes(T) && !!W.spots.wunsch && Math.hypot(T.x - M.x, T.z - M.z) > 150;
  let hit = 0; const A0 = M.at(M.R - 4, 0), n = 60; for (let i = 0; i <= n; i++) { const x = A0.x + (T.entry.x - A0.x) * i / n, z = A0.z + (T.entry.z - A0.z) * i / n; if (W.resolve(x, z, .4, {}).hit) hit++; } out.bridge = hit === 0;
  const walk = (a, bb) => { const c = T.at(a, bb), q = W.resolve(c.x, c.z, .4, {}); return Math.hypot(q.x - c.x, q.z - c.z) < .05; }; out.steg = walk(-70, -16) && walk(-8, 70) && walk(-8, 78); out.rock = !walk(0, 400);
  out.tower = Math.abs(W.groundY(...Object.values(T.at(36, 26)).filter((v, i) => i !== 1)) - 6.3) < .2; { const c = T.at(36, 26); out.tower = Math.abs(W.groundY(c.x, c.z) - 6.3) < .2; const d = T.at(51, 30); out.deck = Math.abs(W.groundY(d.x, d.z) - 2.7) < .2; }
  out.doors = BI.DOORS.some(d => d.isle === 'wunsch');`))) { console.log('FAIL Abschnitt 1 hängt'); fails++; }
if (!(await sec(2, `  /* 2. Besuch + Wunschfrüchte + Symbol */
  tp(-50, 0); out.visit = await until(() => S().visit === 1); const st0 = b.save.stars;
  for (let i = 0; i < 3; i++) { tp(...Q.fruits[i]); await until(() => S().fruit[i] === 1, 4000); } out.fruits = S().fruit.every(Boolean) && S().sym === 1 && D.fruits.every(o => !o.sp.visible); out.fruitStars = b.save.stars >= st0 + 2;
  tp(Q.symbol[0] - 4, Q.symbol[1]); const nr = w.near(); out.symNear = !!nr && nr.k === 'wsym'; w.act(nr); out.symSeen = S().talk.sym === 1;`))) { console.log('FAIL Abschnitt 2 hängt'); fails++; }
if (!(await sec(3, `  /* 3. Schlucht: falsch → Reset, richtig → Tor + Wunschschlüssel */
  tp(Q.crystal[0] - 1.5, Q.crystal[1]); const cn = w.near(); out.crystal = !!cn && cn.k === 'wcrystal'; D.pressGlyph(D.glyphM[0]); out.needLight = S().cave === 0; w.act(cn); out.light = S().light === 1;
  const posOf = sy => D.glyphM[D.PERM.indexOf(sy)]; D.pressGlyph(posOf(1)); out.wrong = S().cave === 0; D.pressGlyph(D.glyphM[D.PERM.indexOf(1)]);
  for (let sy = 0; sy < 5; sy++) D.pressGlyph(posOf(sy)); out.cave = S().cave === 1 && b.save.schluessel.owned.includes(5) && b.save.stk.includes('wunsch_hoehle'); out.blade = BI.SCHL_BLADES.length === 6;`))) { console.log('FAIL Abschnitt 3 hängt'); fails++; }
if (!(await sec(4, `  /* 4. Floß: 6 Teile, bauen, Fahrzeug, Probefahrt, Begrenzung */
  out.noRaft = (tp(...Q.raft), (w.act({ k: 'wraft' }), S().raft === 0)); for (let i = 0; i < 6; i++) { const [, a, bb] = Q.parts[i]; tp(a, bb, Math.max(0, W.groundY(T.at(a, bb).x, T.at(a, bb).z))); await until(() => S().parts[i] === 1, 4000); } out.parts = S().parts.every(Boolean);
  tp(...Q.raft); const rn = w.near(); out.raftNear = !!rn && rn.k === 'wraft'; w.act(rn); out.raft = S().raft === 1; out.raftV = await until(() => b.vehicles.some(v => v.type === 'floss'), 3000);
  const fv = b.vehicles.find(v => v.type === 'floss'); if (fv) { fv.x = T.x; fv.z = T.z; for (let i = 0; i < 20; i++) fv.step(.05, { steer: 0, thr: 1 }, W, b.fx); out.raftClamp = Math.hypot(fv.x - T.x, fv.z - T.z) >= T.R + 12 && [fv.x, fv.z].every(Number.isFinite); b.enter(fv); fv.x = w.dbg.buoy.x; fv.z = w.dbg.buoy.z; tick(3); out.trial = S().trial === 1 && b.save.stk.includes('wunsch_floss'); P.veh = null; }
  /* 5. Turm + Truhen + Sternscherben */
  tp(36 + 1.8, 26 - 1.4, 6.3); const sn = w.near(); out.scope = !!sn && sn.k === 'wscope'; w.act(sn); out.tower2 = S().tower === 1;
  for (let i = 0; i < 3; i++) { const c = D.chestM[i]; P.x = c.x + 1.2; P.z = c.z; P.y = [6.3, 3, 4][i]; const cn2 = w.near(); if (cn2 && cn2.k === 'wchest') w.act(cn2); } out.chests = S().chests.every(Boolean) && b.save.stk.includes('wunsch_truhen');
  for (let i = 0; i < 5; i++) { const [a, bb] = Q.stars[i], c = T.at(a, bb); P.x = c.x; P.z = c.z; P.y = W.groundY(c.x, c.z); await until(() => S().stars[i] === 1, 3000); } out.stars = S().stars.every(Boolean);`))) { console.log('FAIL Abschnitt 5 hängt'); fails++; }
if (!(await sec(6, `  /* 6. Dunkelheit: Hängematte → Kampf → Sieg; vorher Niederlage */
  tp(-8, -40); w.act({ k: 'wham' }); out.darkOn = await until2(() => D.cb.on && D.cb.mode === 'dark', 8000);
  tick(60); out.shadows = D.cb.en.length > 0; out.hud = !document.getElementById('wHud').hidden;
  D.hurt(5, P.x + 1, P.z); out.lost = D.cb.hp === 0 && D.cb.lost > 0; tick(60); out.lostEnd = !D.cb.on && S().dark === 0;
  await sl(3000); w.act({ k: 'wham' }); await until2(() => D.cb.on && D.cb.mode === 'dark', 8000); tick(20); const e0 = D.cb.en[0]; if (e0) { e0.x = P.x + Math.sin(P.h) * 1.4; e0.z = P.z + Math.cos(P.h) * 1.4; e0.st = 'rest'; e0.t = 5; const h0 = e0.hp; D.attack(); out.hit = e0.hp < h0 || e0.dead; } D.cb.t = .05; tick(4); out.darkEnd = S().dark === 2 && !D.cb.on && b.save.stk.includes('wunsch_dunkel');
  /* 7. Arena: Runden, Boss-Mechanik */
  tp(...Q.arena); const an = w.near(); out.arenaNear = !!an && an.k === 'warena'; w.act(an); out.arenaOn = D.cb.on && D.cb.mode === 'arena' && D.cb.en.length === 3;
  for (let r = 0; r < 3; r++) { await until2(() => D.cb.en.length > 0 && D.cb.round === r, 9000); for (const e of D.cb.en.slice()) D.kill(e); await until2(() => S().rounds >= r + 1, 5000); }
  out.rounds = S().rounds === 3; out.bossOn = await until2(() => !!D.cb.boss, 9000); const bs = D.cb.boss;
  if (bs) { const c = W.spots.wArenaC, pl = D.pillars()[0]; bs.shield = true; bs.st = 'rest'; const h0 = bs.hp; bs.x = c.x - 8; bs.z = c.z; P.x = c.x + 4; P.z = c.z; D.hitE(bs, 3, 1); out.shielded = bs.hp === h0;
    P.x = pl.x + (pl.x - c.x) * .55; P.z = pl.z + (pl.z - c.z) * .55; bs.x = c.x; bs.z = c.z; bs.st = 'aim'; bs.t = .05; bs.stun = 0; for (let i = 0; i < 80 && bs.st !== 'stun'; i++) { tick(1); P.x = pl.x + (pl.x - c.x) * .55; P.z = pl.z + (pl.z - c.z) * .55; D.cb.inv = 9; }
    out.stunned = bs.st === 'stun' && bs.shield === false; const h1 = bs.hp; D.hitE(bs, 3, 1); out.hurtBoss = bs.hp < h1;
    bs.hp = 1; bs.st = 'stun'; bs.stun = 5; D.hitE(bs, 3, 1); tick(4); out.bossDown = S().boss === 1 && !D.cb.on && b.save.stk.includes('wunsch_arena'); }
  /* Arena-Niederlage */
  D.begin('arena'); D.startRound(); D.hurt(9, P.x, P.z); tick(60); out.arenaLose = !D.cb.on;
  /* 8. Gespräche, Log, Cheat */
  tp(...Q.kira); const kn = w.near(); out.kira = !!kn && kn.k === 'wtalk' && w.stage() === 6; w.act(kn);
  out.log = w.log().rows.length === 13 && w.log().rows.every(r => r.ok); b.save.wunsch = null; const cr = b.cheats.redeem('WUNSCHSTERN'); out.cheat = cr.ok && S().boss === 1 && S().cave === 1;
  const I = b.istory, d = I.dbg.ST.find(x => x.key === 'SCHLUESSEL'); out.story = d.acts.length === 9;
`))) { console.log('FAIL Abschnitt 8 hängt'); fails++; }

console.log(JSON.stringify(r));
ok(r.isle && r.bridge && r.steg && r.rock, 'Wunsch-Insel hinter dem Schlüsselreich: Holzbrücke, Stege und Sandbank begehbar'); ok(r.tower && r.deck && r.doors, 'Aussichtsturm (Kletterstufen), Holzsteg-Abkürzung und Hütten-Tür');
ok(r.visit && r.fruits && r.fruitStars && r.symNear && r.symSeen, 'Besuch, 3 Wunschfrüchte, geheimes Symbol am großen Baum'); ok(r.crystal && r.needLight && r.light && r.wrong && r.cave && r.blade, 'Schlucht: Kristall weckt Zeichen, falsche Reihenfolge setzt zurück, richtige öffnet das Tor + Wunschschlüssel');
ok(r.noRaft && r.parts && r.raftNear && r.raft && r.raftV, 'Floß: 6 Teile gefunden, Bauplatz, Floß fertig und als Fahrzeug da'); ok(r.raftClamp && r.trial, 'Floß fährt auf dem Meer rund um die Insel, Probefahrt zur Boje'); ok(r.scope && r.tower2 && r.chests && r.stars, 'Fernrohr, 3 Truhen, 5 Sternscherben');
ok(r.darkOn && r.shadows && r.hud && r.lost && r.lostEnd, 'Einbruch der Dunkelheit: Schatten, Herzen, Niederlage ohne Verlust'); ok(r.hit && r.darkEnd, 'Dunkelheit überstanden → Portal/Arena erwacht'); ok(r.arenaNear && r.arenaOn && r.rounds, 'Schattenarena: Eingang, Runde 1–3');
ok(r.bossOn && r.shielded && r.stunned && r.hurtBoss && r.bossDown, 'Umbra: Panzer schützt, Pfeiler-Crash betäubt, dann Schaden, besiegt'); ok(r.arenaLose, 'Arena-Niederlage: rausgeworfen, nichts verloren'); ok(r.kira && r.log && r.cheat && r.story, 'Kira/Silvan-Hinweise, Aufgabenliste (13), Geheimcode WUNSCHSTERN, Geschichte mit 9 Akten');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | ')); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
