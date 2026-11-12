// Pixelpforte: bunter Würfelraum, Knopf → 16-Bit-Rollenspiel (Dorf, Kampf, Schiebeblöcke, Feuerschalen, Schlüssel, Boss, Farben zurück, Rückkehr)
//   node tools/test-zotik/pixel.cjs        Bilder mit SHOTS=1 nach <tmp>/zotik-test/
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: 1, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  const press = async (k, n = 1) => { for (let i = 0; i < n; i++) { await p.evaluate(k => { __zotik.PX().input[k] = 1; }, k); await w(70); await p.evaluate(k => { __zotik.PX().input[k] = 0; }, k); await w(70); } };
  const clear = async () => { for (let i = 0; i < 40; i++) { const busy = await p.evaluate(() => { const G = __zotik.PX().G; return !!(G.dlg || G.fade || G.menu); }); if (!busy) return; await press('a'); } };
  const step = async d => { await p.evaluate(d => { __zotik.PX().input[d] = 1; }, d); await p.waitForFunction(() => !!__zotik.PX().G.mv, null, { timeout: 3000 }).catch(() => {}); await p.evaluate(d => { __zotik.PX().input[d] = 0; }, d); await p.waitForFunction(() => !__zotik.PX().G.mv, null, { timeout: 3000 }).catch(() => {}); await w(40); };
  const face = async (d) => { await p.evaluate(d => { __zotik.PX().P().d = d; }, d); };
  const st = () => p.evaluate(() => { const X = __zotik.PX(), G = X.G, P = X.P(); return { map: G.name, x: G.pl.x, y: G.pl.y, fl: P.fl, it: P.it, lv: P.lv, xp: P.xp, g: P.g, hp: P.hp, dlg: !!G.dlg, B: !!X.B }; });
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.cd[2] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  /* 3D-Raum */
  const r0 = await p.evaluate(() => { const Z = __zotik; Z.switchWorld(14); return { pix: !!(Z.WLD && Z.WLD.pix), knopf: Z.INT.some(i => /Knopf/.test(i.name)) }; });
  ok('Pixelpforte: bunter Raum mit Knopf', r0.pix && r0.knopf, JSON.stringify(r0));
  if (process.env.SHOTS) { await p.evaluate(() => { const Z = __zotik; Z.pl.x = 0; Z.pl.z = 6; Z.pl.face = Math.PI; }); await w(1200); await shot(p, 'pix-raum'); }
  await p.evaluate(() => { const Z = __zotik; Z.pl.x = 0; Z.pl.z = -3; }); await p.waitForFunction(() => __zotik.mode === 'pix', null, { timeout: 6000 }).catch(() => {});
  ok('Knopf betreten → 16-Bit-Welt', await p.evaluate(() => __zotik.mode === 'pix' && !document.getElementById('pix').hidden && document.getElementById('hud').hidden));
  await w(700); if (process.env.SHOTS) await shot(p, 'pix-start'); await clear();
  /* Dorf: Wache, Merle, Laden, Gasthaus */
  await p.evaluate(() => __zotik.PX().load('dorf', 11, 14, 1)); await w(300); await clear();
  await step('u'); let s = await st(); ok('Wache sperrt den Weg ohne Auftrag', s.y === 14, JSON.stringify([s.x, s.y])); await clear();
  await p.evaluate(() => __zotik.PX().load('dorf', 11, 21, 0)); await w(250); await clear(); await face(0); await press('a'); await clear();
  s = await st(); ok('Merle gibt den Auftrag', s.fl.quest && s.it.kraut >= 5, JSON.stringify(s.it));
  await p.evaluate(() => { const X = __zotik.PX(); X.P().g = 100; X.load('dorf', 20, 19, 1); }); await w(250); await clear(); await face(1); await press('a'); for (let i = 0; i < 8 && !(await p.evaluate(() => !!__zotik.PX().G.menu)); i++) await press('a'); await press('a'); await w(150); await press('b'); await clear();
  s = await st(); ok('Laden: Heilkraut kaufen', s.g === 92, 'Münzen ' + s.g);
  /* Kampf auf dem Feld */
  await p.evaluate(() => __zotik.PX().load('dorf', 11, 10, 1)); await w(300); await clear();
  await p.evaluate(() => __zotik.PX().battle('glibber', null)); await w(900); if (process.env.SHOTS) { await press('a'); await w(200); await shot(p, 'pix-kampf'); }
  for (let i = 0; i < 80 && await p.evaluate(() => !!__zotik.PX().B); i++) await press('a');
  s = await st(); ok('Kampf gewonnen: Erfahrung und Münzen', !s.B && s.xp > 0, `xp ${s.xp}, lv ${s.lv}`); await clear();
  if (process.env.SHOTS) { await p.evaluate(() => __zotik.PX().load('dorf', 11, 16, 1)); await w(900); await clear(); await w(400); await shot(p, 'pix-dorf-grau'); }
  /* Turm 1: zwei Schiebeblöcke auf zwei Platten */
  await p.evaluate(() => { const X = __zotik.PX(); X.load('turm1', 4, 7, 1); X.G.foes.length = 0; }); await w(300); await clear();
  for (const d of ['u', 'u']) await step(d);   // Block (4,6) → (4,4)
  await p.evaluate(() => { const X = __zotik.PX(); X.G.pl.x = 5; X.G.pl.y = 4; X.G.pl.px = 80; X.G.pl.py = 64; }); await step('l');   // → (3,4)
  await p.evaluate(() => { const X = __zotik.PX(); X.G.pl.x = 11; X.G.pl.y = 7; X.G.pl.px = 176; X.G.pl.py = 112; }); for (const d of ['u', 'u']) await step(d);
  await p.evaluate(() => { const X = __zotik.PX(); X.G.pl.x = 10; X.G.pl.y = 4; X.G.pl.px = 160; X.G.pl.py = 64; }); await step('r');
  s = await st(); ok('Turm 1: Blöcke auf beiden Platten öffnen das Gitter', !!s.fl.t1, JSON.stringify(await p.evaluate(() => __zotik.PX().G.blocks.map(b => [b.x, b.y]))));
  if (process.env.SHOTS) { await clear(); await shot(p, 'pix-turm1'); } await clear();
  await p.evaluate(() => { const X = __zotik.PX(); X.load('turm1', 5, 10, 1); X.G.foes.length = 0; }); await w(250); await clear(); await face(1); await press('a'); await clear();
  s = await st(); ok('Truhe: Funkenstab', !!s.it.stab);
  /* Turm 2: Feuerschalen in der richtigen Reihenfolge, Schlüssel, Tür */
  const torch = async (x, y, d) => { await p.evaluate(([x, y]) => { const X = __zotik.PX(); X.load('turm2', x, y); X.G.foes.length = 0; }, [x, y]); await w(200); await clear(); await face(d); await press('a'); await clear(); };
  await torch(2, 9, 1); s = await st(); ok('Falsche Reihenfolge löscht die Flammen', !(s.fl.tq > 0));
  await torch(13, 9, 1); await torch(13, 10, 0); await torch(3, 11, 2); await torch(2, 9, 1);
  s = await st(); ok('Turm 2: vier Flammen öffnen das Gitter', !!s.fl.t2, 'tq ' + s.fl.tq);
  await p.evaluate(() => { const X = __zotik.PX(); X.load('turm2', 2, 5); X.G.foes.length = 0; }); await w(200); await clear(); await face(1); await press('a'); await clear();
  await p.evaluate(() => { const X = __zotik.PX(); X.load('turm2', 7, 3); X.G.foes.length = 0; }); await w(200); await clear(); await face(1); await press('a'); await clear();
  s = await st(); ok('Schlüssel öffnet die Tür', !!s.fl.door);
  await step('u'); await step('u'); await w(800); await clear(); s = await st(); ok('Treppe führt zur Turmspitze', s.map === 'turm3', s.map);
  /* Boss */
  await p.evaluate(() => { const P = __zotik.PX().P(); P.lv = 12; P.hp = { z: 999, l: 999 }; P.mp = { z: 99, l: 99 }; for (const id of ['z', 'l']) { const s = __zotik.PX().stat(id, 12); P.hp[id] = s.mhp; P.mp[id] = s.mmp; } __zotik.PX().load('turm3', 7, 4, 1); }); await w(300); await clear();
  await face(1); await press('a'); for (let i = 0; i < 4; i++) await press('a'); await w(1200);
  if (process.env.SHOTS) { await press('a'); await w(300); await shot(p, 'pix-boss'); }
  for (let i = 0; i < 200 && await p.evaluate(() => !!__zotik.PX().B); i++) await press('a');
  await clear(); s = await st(); ok('Grauwächter besiegt', !!s.fl.boss, `lv ${s.lv} hp ${JSON.stringify(s.hp)}`);
  await p.evaluate(() => __zotik.PX().load('turm3', 7, 6, 1)); await w(200); await clear(); await face(1); await press('a'); await press('a'); await press('a'); await w(1500); await clear(); await w(3200); await clear();
  s = await st(); ok('Farbstein: Kieselbach wieder bunt, Abenteuer geschafft', s.fl.stone && s.fl.done && s.map === 'dorf', JSON.stringify({ stone: s.fl.stone, done: s.fl.done, map: s.map }));
  if (process.env.SHOTS) { await w(2500); await shot(p, 'pix-dorf-bunt'); }
  /* Rückkehr */
  await p.evaluate(() => __zotik.PX().exit()); await w(400);
  const r9 = await p.evaluate(() => { const Z = __zotik; return { mode: Z.mode, hud: !document.getElementById('hud').hidden, done: !!Z.S().fl.pix_done, pix: document.getElementById('pix').hidden }; });
  ok('Rückkehr in die 3D-Welt mit Belohnung', r9.mode === 'play' && r9.hud && r9.done && r9.pix, JSON.stringify(r9));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
