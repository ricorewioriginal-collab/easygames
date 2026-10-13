/* Hüpfland 🍄: Brücke, Röhren-Reise, Sternblöcke (Kopfstoß zu Fuß und auf Dino Tupfi), Münzen, Dino-Sprung, Kart-Rennen (3 Runden, Kontrollpunkte, Platz),
   Burg-Mutprobe gegen Brocko, Hüpf-Abenteuer (2D-Level mit Röhren + Sternblöcken), Story-Modus, Cheat, Aufgabenliste.
   Aufruf: THREE=... node bunte-insel/tests/huepf.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 700, height: 480 } })).newPage(); const errs = []; let fails = 0;
p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const PRE = `const b = __bi, h = b.huepf, H = BI.HUEPF, D = h.dbg, P = b.P, W = b.W, out = (window.__o = window.__o || {}), sl = ms => new Promise(r => setTimeout(r, ms)), S = () => b.save.huepf || {},
  until = async (f, ms) => { for (let i = 0; i < (ms || 8000) / 50 && !f(); i++) await sl(50); return !!f(); }, tp = (dx, dz, y) => { if (P.veh) b.leave(); const c = H.at(dx, dz); P.x = c.x; P.z = c.z; P.y = y || 0; P.vy = 0; };`;
const sec = async (n, code) => { const v = await Promise.race([p.evaluate('(async () => {' + PRE + code + '; return out; })()'), new Promise(res => setTimeout(() => res({ ['__timeout' + n]: 1 }), 120000))]); return v; };
let r;
/* 1. Insel, Brücke, Besuch */
r = await sec(1, `out.isle = W.isles.includes(H) && !!W.spots.huepf;
  let hit = 0; const A0 = { x: H.ux * 172, z: H.uz * 172 }, n = 80; for (let i = 0; i <= n; i++) { const x = A0.x + (H.entry.x - A0.x) * i / n, z = A0.z + (H.entry.z - A0.z) * i / n; if (W.resolve(x, z, .4, {}).hit) hit++; } out.bridge = hit === 0;
  out.far = [BI.FUSSBALL, BI.RAINBOW, BI.RAETSEL, BI.SCHLUESSEL].every(I => Math.hypot(I.x - H.x, I.z - H.z) > I.R + H.R + 40);
  tp(60, -16); out.visit = await until(() => S().visit === 1); out.zone = BI.zoneAt(P.x, P.z, {}) === 'huepf'; out.story = BI.STORY_ISLES.some(q => q.key === 'HUEPF' && q.req.length === 3);`);
ok(r.isle && r.bridge && r.far, 'Insel mit Brücke (frei begehbar), weit genug von den Nachbarinseln');
ok(r.visit && r.zone, 'Besuch zählt, eigene Musik-Zone');
ok(r.story, 'Story-Modus kennt das Hüpfland (3 Aufgaben)');
/* 2. Röhre */
r = await sec(2, `const q = D.pipes[0], t = D.pipes[q.to]; tp(q.x - H.x + 2.2, q.z - H.z); await sl(150); const nn = h.near(); out.near = !!nn && nn.k === 'hpipe';
  h.act(nn); out.moved = Math.hypot(P.x - t.x, P.z - t.z) < 4.5; out.pipes = S().pipes >= 1; out.stk = b.save.stk.includes('huepf_roehre'); await sl(1400); out.flower = t.up > .5;`);
ok(r.near && r.moved && r.pipes && r.stk, 'Röhre: „In die Röhre!“ bringt dich zur Partner-Röhre (Sticker)');
ok(r.flower, 'Kicher-Blume schaut aus der Röhre, wenn man daneben steht');
/* 3. Sternblock: Kopfstoß beim echten Sprung */
r = await sec(3, `const bl = D.blocks.find(x => !S().blocks || !S().blocks.includes(x.i)); tp(bl.x - H.x, bl.z - H.z); await sl(300); const st0 = b.save.stars, n0 = (S().blocks || []).length; P.vy = 7; P.coy = 0;
  out.hit = await until(() => (S().blocks || []).length > n0, 3000); out.star = b.save.stars > st0; out.down = P.vy <= 0 || P.y < 1.4;`);
ok(r.hit && r.star, 'Sternblock: Springen unter dem Block stößt ihn an (+⭐)');
/* 4. Dino Tupfi: einsteigen, Sprung, Block vom Dino */
r = await sec(4, `const v = b.vehicles.find(x => x.type === 'dino'); out.dino = !!v && !!v.rig; tp(v.x - H.x + 1.5, v.z - H.z); await sl(100); b.enter(v); await sl(400); out.ride = P.veh === v && S().dino === 1 && b.save.stk.includes('huepf_dino');
  out.hop = v.hop(); await sl(250); out.air = v.hopY > .5; await until(() => v.hopY === 0, 3000);
  const bl = D.blocks.find(x => !S().blocks.includes(x.i)); v.setPose(bl.x, bl.z, 0); await sl(300); const n0 = S().blocks.length; v.hop(); out.dblock = await until(() => S().blocks.length > n0, 3000); b.leave(); await sl(200);`);
ok(r.dino && r.ride, 'Dino Tupfi: reiten (Sticker)');
ok(r.hop && r.air, 'Dino-Sprung (Hupe) hebt Tupfi in die Luft');
ok(r.dblock, 'Vom Dino aus lässt sich ein Sternblock anstoßen');
/* 5. Alle Sternblöcke + Münzen */
r = await sec(5, `const n = H.blocks.length; for (const bl of D.blocks) if (!S().blocks.includes(bl.i)) D.hitBlock(bl); out.all = S().blocks.length === n && b.save.stk.includes('huepf_bloecke');
  const c = D.coins[0], c0 = S().coins; tp(c.x - H.x, c.z - H.z); out.coin = await until(() => S().coins > c0, 3000);`);
ok(r.all, 'Alle 12 Sternblöcke → Sticker „Blockstoßer“');
ok(r.coin, 'Münzen einsammeln');
/* 6. Kart-Rennen: durchs Start-Tor fahren, 3 Runden, Platz */
r = await sec(6, `const v = b.vehicles.find(x => x.type === 'kart'); tp(v.x - H.x + 1.5, v.z - H.z); await sl(100); b.enter(v); await sl(200);
  const g = D.posAt(D.TR.len - 2, 0); v.setPose(g.x, g.z, g.h); v.v = 8; await sl(60); out.started = await until(() => !!h.race, 2000); out.count = h.race && h.race.phase === 'count';
  await until(() => h.race && h.race.phase === 'run', 6000); out.run = !!h.race && h.race.phase === 'run';
  /* Abkürzung über den Rasen zählt nicht: direkt zur Linie zurückspringen ohne Kontrollpunkte */
  { const R = h.race, l0 = R.lap; const a = D.posAt(30, 0); v.setPose(a.x, a.z, a.h); await sl(80); const z = D.posAt(D.TR.len - 3, 0); v.setPose(z.x, z.z, z.h); await sl(80); const s0 = D.posAt(2, 0); v.setPose(s0.x, s0.z, s0.h); await sl(80); out.noCut = h.race.lap === l0; }
  let s = 0; const L = D.TR.len; const t0 = performance.now(); let last = t0;
  while (h.race && !h.race.done && performance.now() - t0 < 60000) { const now = performance.now(), dt = Math.min(.1, (now - last) / 1000); last = now; s += 26 * dt; const q = D.posAt(s, -1); v.setPose(q.x, q.z, q.h); v.v = 20; await sl(16); }
  out.done = !!h.race && h.race.done; out.place = h.race ? h.race.place : 0; out.races = S().races; out.win = S().wins >= 1; out.stk = b.save.stk.includes('huepf_kart') && b.save.stk.includes('huepf_pokal');
  out.botsMoved = D.bots.every(x => x.lap >= 1); await sl(4500); out.cleared = !h.race; b.leave();`);
ok(r.started && r.count && r.run, 'Kart-Rennen startet beim Durchfahren des Start-Tors (Ampel-Countdown)');
ok(r.noCut, 'Abkürzen ohne Kontrollpunkte zählt keine Runde');
ok(r.done && r.races >= 1 && r.stk && r.botsMoved, 'Rennen über 3 Runden mit 3 Gegnern beendet (Platz ' + r.place + ', Sticker)');
ok(r.cleared, 'Nach dem Ziel wird das Rennen aufgeräumt');
/* 7. Burg-Mutprobe */
r = await sec(7, `const C = W.spots.huepfCastle; P.veh = null; P.x = C.x1 - 3; P.z = C.z; P.y = 0; await sl(200); const nn = h.near(); out.near = !!nn && nn.k === 'hboss'; h.act(nn); out.on = D.B.on; await sl(1800); out.rocks = D.rocks.length > 0;
  for (let i = 0; i < 3; i++) { const bt = D.btns[D.B.step]; if (!bt) break; P.x = bt.x; P.z = bt.z; P.y = 0; for (const rk of D.rocks) rk.x = 999; await until(() => D.B.step > i || !D.B.on, 2000); }
  out.win = !D.B.on && S().boss === 1 && b.save.stk.includes('huepf_brocko');`);
ok(r.near && r.on && r.rocks, 'Burg: Mutprobe startet, Brocko lässt Kiesel rollen');
ok(r.win, 'Drei Kitzel-Knöpfe → Brocko lacht, Sonnenstern zurück (Sticker)');
/* 8. Hüpf-Abenteuer am Automaten */
r = await sec(8, `const a = (W.spots.arcades || []).find(x => x.kind === 'jump_huepf'); out.arcade = !!a && Math.hypot(a.x - H.x, a.z - H.z) < H.R;
  b.startGame('jump_huepf', true); await sl(400); const g = b.mini.cur && b.mini.cur(); out.mini = b.mini.active && b.mini.kind === 'jump_huepf'; const d = g && g.dbg && g.dbg(); out.pipes = !!d && d.lv.pipes.length > 0; out.blocks = !!d && d.lv.blocks.length > 0;
  if (d) { d.p.x = d.lv.goalX + .2; d.p.y = d.lv.cols[Math.floor(d.lv.goalX)]; } out.lvl = await until(() => S().level === 1, 4000); out.stk = b.save.stk.includes('huepf_level');
  await until(() => !b.mini.active, 8000); if (b.mini.active) b.mini.stop();`);
ok(r.arcade, 'Automat „Hüpf-Abenteuer“ steht auf der Insel');
ok(r.mini && r.pipes && r.blocks, 'Hüpf-Abenteuer startet – mit Röhren und Sternblöcken im Level');
ok(r.lvl && r.stk, 'Level geschafft → Sticker „Hüpf-Profi“');
/* 9. Aufgabenliste, Inselgeschichte, Cheat */
r = await sec(9, `const L = h.log(); out.rows = L.rows.length; out.allOk = L.rows.every(q => q.ok); out.story = BI.INSELSTORY.some(q => q.key === 'HUEPF'); out.code = BI.CHEATS.some(q => q.code === 'HUEPFHELD');
  out.vehMenu = b.vehicleList().some(q => q.type === 'kart') && b.vehicleList().some(q => q.type === 'dino'); out.dest = b.DEST.some(d => d.id === 'huepf');`);
ok(r.rows === 8 && r.allOk, 'Aufgabenliste: 8 Aufgaben, alle geschafft');
ok(r.story && r.code && r.vehMenu && r.dest, 'Inselgeschichte, Geheimcode HUEPFHELD, Fahrzeug-Menü und „Wohin?“');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
