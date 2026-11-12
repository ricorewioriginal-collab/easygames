// Mehr Welt in den Kapitelwelten: Zerschlagbares, Truhen-Jagd (12), Sprungblüten mit Splitterringen, Bewohner-Aufträge, Fest nach dem Boss
//   node tools/test-zotik/weltplus.cjs
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, {}); const res = [];
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.cd[2] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  const st = () => p.evaluate(() => { const Z = __zotik, W = Z.WP().W; return W ? { br: W.br.length, pads: W.pads.length, rings: W.rings.length, items: W.items.length, x: Z.chests.filter(c => /^3x/.test(c.id)).length, npc: Z.NPC.filter(n => /^wp3/.test(n.id)).length } : null; });
  await p.evaluate(() => __zotik.switchWorld(3)); await p.waitForTimeout(400);
  const s = await st(); ok('Valdoria: Kisten, Truhen, Sprungblüten, Bewohner', s && s.br >= 10 && s.x >= 6 && s.pads >= 2 && s.npc === 2, JSON.stringify(s));
  const sm = await p.evaluate(() => { const Z = __zotik, W = Z.WP().W, b = W.br[0], S = Z.S(), a = S.shards; Z.pl.x = b.x; Z.pl.z = b.z + 1.5; Z.WP().smash(Z.pl.x, Z.pl.z, 0, -1); return { gain: S.shards - a, gone: !b.m.visible }; });
  ok('Kiste zerschlagen gibt Splitter', sm.gain > 0 && sm.gone, JSON.stringify(sm));
  const bo = await p.evaluate(() => { const Z = __zotik, W = Z.WP().W, q = W.pads[0]; Z.pl.x = q.x; Z.pl.z = q.z; Z.pl.y = q.y; Z.pl.vy = 0; Z.step(1 / 30, 2); return Z.pl.vy; });
  ok('Sprungblüte schleudert nach oben', bo > 5, 'vy ' + bo.toFixed(1));
  const rg = await p.evaluate(() => { const Z = __zotik, W = Z.WP().W, r = W.rings[0], a = Z.S().shards; Z.pl.x = r.x; Z.pl.z = r.z; Z.pl.y = r.y - 1; Z.pl.vy = 0; Z.WP().frame ? 0 : 0; Z.step(1 / 30, 1); return { gain: Z.S().shards - a, gone: !r.m.visible }; });
  ok('Splitterring in der Luft einsammeln', rg.gone && rg.gain > 0, JSON.stringify(rg));
  const q = await p.evaluate(() => { const Z = __zotik, n = Z.NPC.find(o => o.id === 'wp30'), o = []; o.push(n.mark()); n.talk(); const d = document.getElementById('dlg'), O = document.getElementById('dOpts'); for (let k = 0; k < 40 && (O.hidden || !O.children.length); k++) { d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); Z.step(1 / 30, 3); } const bs = [...document.querySelectorAll('#dOpts button')]; const go = bs.find(x => /suche/.test(x.textContent)); return { mark: o[0], opt: !!go, click: go && (go.click(), true) }; });
  await p.evaluate(async () => { for (let i = 0; i < 30 && !document.getElementById('dlg').hidden; i++) { document.getElementById('dlg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); __zotik.step(1 / 30, 2); await new Promise(r => setTimeout(r, 30)); } });
  const it = await p.evaluate(() => { const Z = __zotik, W = Z.WP().W, o = W.items.find(x => x.i === 0); if (!o) return null; const vis = o.m.visible; Z.pl.x = o.x; Z.pl.z = o.z; Z.pl.y = Z.hgt(o.x, o.z); Z.step(1 / 30, 1); return { vis, got: !!Z.S().wp[3].g0 }; });
  ok('Auftrag annehmen und Gegenstand finden', q.mark && q.opt && it && it.vis && it.got, JSON.stringify([q, it]));
  await p.evaluate(async () => { for (let i = 0; i < 30 && !document.getElementById('dlg').hidden; i++) { document.getElementById('dlg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); __zotik.step(1 / 30, 2); await new Promise(r => setTimeout(r, 30)); } });
  const rw = await p.evaluate(() => { const Z = __zotik, a = Z.S().shards; Z.NPC.find(o => o.id === 'wp30').talk(); return { gain: Z.S().shards - a, q: Z.S().wp[3].q[0] }; });
  ok('Zurückbringen gibt Belohnung', rw.q === 2 && rw.gain > 0, JSON.stringify(rw));
  const fe = await p.evaluate(() => { const Z = __zotik; Z.WP().bossDone(3, Z.WLD.path, Z.hgt); return { fest: !!Z.WP().W.fest, menu: /Truhen/.test(Z.WP().menu(3)) }; });
  ok('Fest nach dem Boss und Truhen im Auftragsmenü', fe.fest && fe.menu, JSON.stringify(fe));
  const rd = await p.evaluate(async () => { const Z = __zotik, n = Z.NPC.find(o => o.id === 'wpr3'); if (!n) return 'kein Gastgeber'; Z.RIDE().open(3); const o = { mode: Z.mode }; document.getElementById('rdGo').click(); const R = Z.RIDE().R; R.t = 1.2; for (let i = 0; i < 40; i++) Z.RIDE().frame(1 / 30); o.end = !R.run; o.sc = R.best; o.box = !document.getElementById('rdBox').hidden; const a = Z.S().shards; document.getElementById('rdQ').click(); o.back = Z.mode; o.rec = (Z.S().ride || {})[3] !== undefined; return o; });
  ok('Weltrennen in Valdoria (Kanalrennen) starten, fahren, beenden', rd.mode === 'ride' && rd.end && rd.box && rd.back === 'play' && rd.rec, JSON.stringify(rd));
  let all = true; for (const n of [2, 4, 5, 6, 7, 8, 9, 10]) { await p.evaluate(n => __zotik.switchWorld(n), n); const w = await p.evaluate(n => { const W = __zotik.WP().W; return W && W.n === n && W.br.length >= 8; }, n); if (!w) { all = false; console.log('  Welt', n, 'fehlt'); } }
  ok('Alle Kapitelwelten 2–10 haben die Bausteine', all);
  ok('keine Fehler', !p.errs.length, p.errs.join(' | '));
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })();
