/* Rätsel-Insel der Uralten: Prüfungsturm (Truhen, Block, Kristall, Bombe, Haken), Kapselmonster, Schmiede, Uralte Höhle, Titan Kron. Aufruf: node bunte-insel/tests/raetsel.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 800, height: 500 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const r = await p.evaluate(async () => {
  const b = __bi, M = BI.RAETSEL, T = M.T, K = b.raetsel, W = b.W, SP = W.spots, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), at = (a, bb) => M.at(a, bb), D = K.dbg, S = D.S;
  const go = (a, bb, y) => { const q = at(a, bb); P.veh = null; P.x = q.x; P.z = q.z; P.y = y || 0; P.vy = 0; };
  const act = async (a, bb, want) => { go(a, bb); await sl(160); const n = K.near(); if (!n || (want && n.k !== want)) return n && n.k || 'none'; K.act(n); return 'ok'; };
  const until = async (f, ms) => { for (let i = 0; i < (ms || 8000) / 150 && !f(); i++) await sl(150); return f(); };
  const free = (a, bb, r) => { const q = at(a, bb), x = W.resolve(q.x, q.z, r || .45, {}); return Math.hypot(x.x - q.x, x.z - q.z) < .03; };
  out.zone = BI.worldAt(M.entry.x, M.entry.z) === 'raetsel' && BI.zoneAt(M.x, M.z, {}) === 'raetsel';
  const br = M.bridge; out.bridge = [-.4, -.2, 0, .2, .4].every(k => !W.resolve(br.mx + M.ux * br.L * k, br.mz + M.uz * br.L * k, .4, {}).hit);
  { const base=M.skyBase; b.P.x=base.x; b.P.z=base.z; b.P.y=.1; const up=K.near(); out.skyLift=!!up&&up.k==='rzsky'&&up.up; if(out.skyLift)K.act(up); await sl(120); out.skyLanding=b.P.y>70&&W.groundY(M.skyDeck.x,M.skyDeck.z,b.P.y)===72&&W.groundY(M.skyDeck.x,M.skyDeck.z,0)<1; const down=K.near(); if(down&&down.k==='rzsky'&&!down.up)K.act(down); await sl(120); out.skyReturn=b.P.y<1; }
  out.apart = [BI.CITY, BI.DAMPF, BI.BAULAND, BI.FUSSBALL, BI.MAERCHEN, BI.PARK, BI.RADIO, BI.SCHLUESSEL, BI.SCHWAMM, BI.ZOTIK, BI.PUPS, BI.DRACHEN].every(o => Math.hypot(o.x - M.x, o.z - M.z) > o.R + M.R + 6);
  const fo = b.town.folk.filter(f => f.p && Math.hypot(f.x - M.x, f.z - M.z) < M.R); out.folk = fo.length; out.folkIn = fo.every(f => Math.hypot(f.x - M.x, f.z - M.z) < M.R - 2 && !W.resolve(f.x, f.z, .3).hit);
  /* Dorf und Turm-Eingang erreichbar (Weg vom Eingang zur Turmtür, zum Schrein, zur Schmiede) */
  { const S0 = .6, key = (i, j) => i + ',' + j, seen = new Set(), q = [[Math.round(-72 / S0), 0]]; seen.add(key(q[0][0], 0)); while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (Math.abs(ni * S0) > 80 || Math.abs(nj * S0) > 80 || seen.has(key(ni, nj)) || !free(ni * S0, nj * S0)) continue; seen.add(key(ni, nj)); q.push([ni, nj]); } }
    const reach = (a, bb) => { for (let da = -3; da <= 3; da++) for (let db = -3; db <= 3; db++) if (seen.has(key(Math.round(a / S0) + da, Math.round(bb / S0) + db))) return true; return false; }; out.walkBad = [['turm', T.a0 - 2, 0], ['schrein', -20, 38.5], ['schmiede', -20, -30], ['hoehle', -40, 47], ['statue', -44, 6], ['v1', -66, -28], ['v2', -52, 40], ['v3', -8, -44], ['v4', 22, 42], ['v5', 60, -38]].filter(([n, a, bb]) => !reach(a, bb)).map(x => x[0]); out.walk = out.walkBad.length === 0; }
  /* 1. Truhe mit Bomben */
  out.c1 = await act(10, -8.4, 'rzchest') === 'ok' && !!S().tools.bomb;
  /* 2. Tor A zu, Block schieben */
  out.gateAShut = !free(T.r1 + .5, 0, .45);
  const push = async (da, db) => { const q = { a: D.blk.a - da * 1.9, b: D.blk.b - db * 1.9 }; go(q.a, q.b); await sl(120); const n = K.near(); if (!n || n.k !== 'rzblock') return false; K.act(n); await sl(100); await until(() => !D.blk.tw, 6000); return true; };
  { let okp = true; for (let i = 0; i < 6; i++) okp = (await push(0, 1)) && okp; for (let i = 0; i < 2; i++) okp = (await push(1, 0)) && okp; out.push = okp; await until(() => S().puz.block); out.blockSolved = !!S().puz.block; out.gateAOpen = free(T.r1 + .5, 0, .45); }
  out.c2 = await act(30, -9.4, 'rzchest') === 'ok' && !!S().tools.bow;
  /* 3. Kristall: Pool sperrt, Pfeil öffnet Brücke + Tor B */
  out.poolShut = !free(T.pool[0] + 2.2, 0, .45) && !free(T.r2 + .5, 0, .45);
  out.shoot = await act(36, 0, 'rzcrystal') === 'ok'; await until(() => S().puz.crystal); out.crystal = !!S().puz.crystal && free(T.pool[0] + 2.2, 0, .45) && free(T.r2 + .5, 0, .45);
  /* 4. Bombe an der rissigen Wand */
  out.wallShut = !free(T.wall[0], T.b0 + .5, .45); out.bombPlace = await act(T.wall[0], T.b0 + 3, 'rzwall') === 'ok'; await until(() => S().puz.wall, 12000); out.wallOpen = !!S().puz.wall && free(T.wall[0], T.b0 + .5, .45);
  out.c3 = await act(T.alcove[0], T.alcove[1] + 1.6, 'rzchest') === 'ok' && !!S().tools.hook;
  /* 5. Enterhaken über den Abgrund */
  out.pitShut = !free((T.pit[0] + T.pit[1]) / 2, 0, .45); out.hook = await act(T.postN[0] - 1.6, 0, 'rzhook') === 'ok'; for (let i = 0; i < 20 && K.busy(); i++) await sl(200); { const lp = M.loc(P.x, P.z); out.crossed = lp.a > T.pit[1]; }
  out.c4 = await act(63.4, 0, 'rzchest') === 'ok' && !!S().puz.tower && (b.save.stk || []).includes('turm_s');
  /* 6. Kapselmonster: Ei wählen, füttern, Stufe 5 */
  { go(-20, 38.5); await sl(150); const n = K.near(); out.capNear = !!n && n.k === 'rzcap'; K.act(n); out.panel = K.open === 'cap' && !D.panel.hidden; D.panel.querySelectorAll('button')[0].click(); out.egg = !!S().cap && S().cap.el === 'feuer' && !!(b.save.stk || []).includes('kapsel'); K.close();
    const iv = b.garden.inv(); iv.apple = 40; for (let i = 0; i < 30; i++) D.feed('apple'); out.stage5 = D.stageOf(S().cap.xp) === 5 && (b.save.stk || []).includes('kapsel5'); await sl(300); out.capVisible = D.capG.visible && D.capG.children.length === 1; }
  /* 7. Schmiede */
  { b.save.stars = 40; D.forge(1); D.forge(2); out.sword = S().sword === 2 && K.swordMul() > 1.3 && (b.save.stk || []).includes('schmied'); out.starsLeft = b.save.stars >= 40 - 9 && b.save.stars <= 40 - 9 + 3; }
  /* 8. Kapselmonster hilft im Verbotenen Wald */
  { const FO = SP.forest; P.veh = null; P.x = FO.x; P.z = FO.z; P.y = 0; await sl(900); const cb = b.combat; const e = cb.dbg.spawn('blob', FO.x + 2, FO.z + 2, { home: true }); await sl(300); e.cool = 99; const hp0 = e.hp; await sl(5200); out.helper = e.hp < hp0 || e.dead; cb.dbg.enemies.slice().forEach(q => { q.dead = true; }); }
  /* 9. Titan Kron */
  { const cb = b.combat, FO = SP.forest, e = cb.dbg.spawn('titan', FO.x + 3, FO.z + 3, { home: true }); out.titanName = e.T.n; cb.dbg.damage(e, 99999, 1, 0); await sl(100); out.titan = (b.save.stk || []).includes('titan'); }
  /* 10. Uralte Höhle */
  { go(-40, 47); await sl(200); const n = K.near(); out.hoehleNear = !!n && n.k === 'rzhoehle'; if (n) K.act(n); await sl(300); { const I = b.innen; if (I.inside) { const st = I.inside.items.find(i => i.type === 'stairs'); P.x = st.x; P.z = st.z; await sl(150); I.act(I.near()); } } await sl(800); out.hoehle = b.mini.active && b.mini.kind === 'hoehle_raetsel'; if (out.hoehle) { const g = b.mini.cur(), d = g.dbg(); let s0 = b.mini.score; for (let f = 0; f < 3; f++) { const t = g.dbg().tiles; let st = null; t.forEach((row, y) => row.forEach((k, x) => { if (k === 's') st = [x, y]; })); if (!st) break; let h = g.dbg().hero, guard = 0; while ((h[0] !== st[0] || h[1] !== st[1]) && guard++ < 20) { g.dbg().tapTile(st[0], st[1]); h = g.dbg().hero; if (g.dbg().hearts <= 0) break; } } out.cave = g.dbg().floor >= 2 && b.mini.score > s0; b.mini.stop && b.mini.stop(); } }
  out.log = K.log().rows.length === 12; return out; });
if (process.env.DEBUG) console.log(JSON.stringify(r));
ok(r.zone && r.bridge && r.apart, 'Insel: Zone/Musik, Brücke begehbar, überlappt keine Nachbarinsel'); ok(r.skyLift&&r.skyLanding&&r.skyReturn,'Lichtlift erreichbar, Festungsplattform begehbar, Rückweg funktioniert'); ok(r.folk >= 12 && r.folkIn, r.folk + ' Figuren frei stehend'); ok(r.walk, 'Alle Orte vom Eingang zu Fuß erreichbar ' + (r.walkBad || []).join(','));
ok(r.c1 && r.gateAShut, 'Vorhalle: Truhe mit Bomben, Tor A zu'); ok(r.push && r.blockSolved && r.gateAOpen, 'Block-Rätsel: Block schieben → Platte → Tor A öffnet'); ok(r.c2, 'Bogen-Truhe');
ok(r.poolShut && r.shoot && r.crystal, 'Kristall-Rätsel: Pool sperrt, Pfeil → Brücke + Tor B'); ok(r.wallShut && r.bombPlace && r.wallOpen && r.c3, 'Bomben-Rätsel: rissige Wand sprengen → Enterhaken-Truhe');
ok(r.pitShut && r.hook && r.crossed && r.c4, 'Haken-Rätsel: über den Abgrund, Schatz + Sticker');
ok(r.capNear && r.panel && r.egg && r.stage5 && r.capVisible, 'Kapselmonster: Ei wählen, füttern bis Stufe 5, folgt dir'); ok(r.sword && r.starsLeft, 'Schmiede: Schwert verbessern');
ok(r.helper, 'Kapselmonster hilft im Verbotenen Wald'); ok(r.titan, 'Titan Kron (' + r.titanName + ') besiegt → Sticker'); ok(r.hoehleNear && r.hoehle && r.cave, 'Uralte Höhle: Mini-Spiel, Stockwerke wechseln'); ok(r.log, 'Aufgabenliste: 12 Zeilen');
ok(errs.length === 0, 'Keine Seitenfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'ALLES OK'); process.exit(fails ? 1 : 0);
