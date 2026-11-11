// Lufia-Gefühl: Prolog in der Zukunft, Gefährten (Bindung, Lagerfeuer-Gespräche, persönliches Kapitel, Lebensentscheidung, Teamangriff),
// Vier Gesichter des Risses (unbesiegbarer Kampf gegen Vexa endet mit Szene, echter Kampf in Astralis), Seelenbegleiter,
// Echogrotte mit 99 Ebenen, Echo-Relikten und Tagesgrotte, Opfer-Ende.
//   node tools/test-zotik/gefaehrten.cjs
const { chromium, ARGS, open, flood, skip, talk, opt, intro, shot } = require('./lib.cjs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ARGS }); const p = await open(b); const w = ms => p.waitForTimeout(ms);
  const dlgText = () => p.evaluate(() => document.getElementById('dlg').hidden ? '' : document.getElementById('dlg').textContent);
  let log = ''; const calm = async () => { for (let k = 0; k < 40 && await p.evaluate(() => !document.getElementById('dlg').hidden && document.getElementById('dOpts').hidden); k++) { await w(150); log += await dlgText(); await skip(p); await w(300); } };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); for (const a of Z.ARTS) S.fl['art_' + a.id] = 1; });
  // Prolog in der Zukunft vor dem Traum
  let seen = ''; for (let k = 0; k < 12 && !/Generationen/.test(seen); k++) { await w(500); seen += await dlgText(); }
  ok(/Generationen/.test(seen), 'Prolog spielt in der Zukunft (vor dem Traum)');
  await intro(p); await calm();
  ok(!!(await p.evaluate(() => __zotik.CUT.ENDING_SACRIFICE && __zotik.CUT.LUN_FUTURE)), 'Opfer-Ende „Allein hinübergehen“ und Prolog sind als Szenen da');

  // Gefährten aufnehmen, Kapitel 1–3 fertig
  await p.evaluate(() => { const Z = __zotik, S = Z.S(); S.stage = 8; S.lvl = 30; S.party = ['lyra', 'nia', 'rovan']; for (let k = 2; k <= 3; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; });
  // Bindung wächst durch Kämpfe
  const b0 = await p.evaluate(() => __zotik.LF().bond('nia'));
  await p.evaluate(() => { const L = __zotik.LF(); for (let i = 0; i < 4; i++) L.kill({ d: { boss: true } }); });
  ok(await p.evaluate(() => __zotik.LF().bond('nia')) === b0 + 12, 'Bindung wächst im Kampf (Boss +3 je Gefährte)');
  // Lagerfeuer im Lager-Reiter
  await p.evaluate(() => __zotik.toggleMenu(true, 'camp')); await w(300);
  const btn = await p.evaluate(() => document.getElementById('mcont').textContent);
  ok(/Sternbilder/.test(btn) && await p.evaluate(() => !!document.querySelector('[data-lfc]')), 'Camp-Reiter zeigt wartende Gespräche und „Zum Camp“');
  await p.evaluate(() => document.querySelector('[data-lfc]').click()); await w(2500); await calm();
  ok(await p.evaluate(() => __zotik.WLD && __zotik.WLD.camp), 'Knopf reist ins Camp');
  await flood(p); let r0 = await talk(p, 'Lyra'); await w(2400);
  ok(!r0 && await p.evaluate(() => __zotik.LF().st().tk.lyra === 1), 'Gespräch direkt am Feuer bei Lyra (Sternbilder) ' + (r0 || ''));
  await calm();
  // zweites Gespräch schaltet das persönliche Kapitel frei (nach Kapitel 3)
  for (const id of ['lyra', 'nia', 'nia']) { await p.evaluate(id => __zotik.LF().fireTalk(id), id); await w(500); await calm(); }
  let L = await p.evaluate(() => { const l = __zotik.LF().st(); return { tk: l.tk, pq: l.pq, b: l.b }; });
  ok(L.tk.lyra === 2 && L.pq.lyra === 1 && L.pq.nia === 1, 'Gespräche zählen, persönliche Kapitel freigeschaltet: ' + JSON.stringify(L));

  // Solmera: Korrod erscheint, Nias Kapitel (Keshs Bogen) und Seelenlicht „Licht“
  await p.evaluate(() => { const S = __zotik.S(); S.cd[4] = { st: 7, fin: 0, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; __zotik.switchWorld(4); }); await w(1500); await calm();
  for (let k = 0; k < 10 && !/Korrod/.test(log); k++) { await w(600); log += await dlgText(); await calm(); }
  ok(/Korrod/.test(log), 'Solmera: Korrod, das Gesicht des Zerfalls, tritt auf'); await calm();
  await flood(p);
  let r = await talk(p, 'Keshs Bogen'); ok(r === '' || r === undefined, 'Keshs Bogen ansprechbar ' + (r || '')); await calm();
  const foe = await p.evaluate(() => { const e = __zotik.E.find(e => !e.dead && e.d.name === 'Sandwächter des Bogens'); return e ? e.hp : 0; });
  ok(foe > 0, 'Kapitel-Gegner erscheint (' + foe + ' LP)');
  await p.evaluate(() => { const Z = __zotik; for (const e of Z.E) if (!e.dead && e.d.name === 'Sandwächter des Bogens') Z.killE(e); }); await w(1500);
  log = ''; await w(1000); await calm();
  ok(/Nia|Erzähler/.test(log) && await p.evaluate(() => __zotik.LF().st().pq.nia === 2), 'Nias Kapitel abgeschlossen (Bogen, Bindung +20)');
  r = await talk(p, 'Seelenlicht'); await w(400); await calm();
  ok(await p.evaluate(() => __zotik.LF().st().so.includes('licht')), 'Seelenlicht gefunden: Seele „Licht“');
  // Seelenbegleiter-Menü: Seele annehmen ändert Stufen-Namen
  await p.evaluate(() => __zotik.toggleMenu(true, 'felli')); await w(300);
  await p.evaluate(() => document.querySelector('[data-lfs="licht"]').click()); await w(900);
  const fh = await p.evaluate(() => document.getElementById('mcont').textContent);
  ok(/Schimmerling|Strahling|Glanzfell|Sonnengeist|Morgenwächter/.test(fh) && /aktiv/.test(fh) && /2\/7/.test(fh), 'Felli nimmt die Licht-Seele an (Stufennamen, 2/7 Seelen)');
  ok(await p.evaluate(() => { const L = __zotik.LF(); return L.soulEl() === 'light' && L.fav('shards'); }), 'Licht-Seele: Lichtschaden, Lieblingsessen Splitter');
  await shot(p, 'seelen');
  await p.evaluate(() => __zotik.toggleMenu(false));
  // Teamangriff mit Bindung stärker
  await p.evaluate(() => { const Z = __zotik; Z.S().tg = 100; Z.teamAttack('nia'); }); await w(200);
  ok(await p.evaluate(() => __zotik.X.tmul > 1.2 && __zotik.X.tmulT > 0), 'Teamangriff wird durch Bindung stärker (×' + (await p.evaluate(() => __zotik.X.tmul.toFixed(2))) + ')');

  // Elaris: Vexa – nicht zu gewinnen, endet mit Szene statt Game Over
  await p.evaluate(() => { const Z = __zotik; Z.S().hp = Z.maxHp(); Z.S().cd[2].fin = 0; Z.switchWorld(2); }); await w(1500); await calm();
  log = ''; for (let k = 0; k < 10 && !/Vexa/.test(log); k++) { await w(600); log += await dlgText(); if (/Vexa|\?\?\?/.test(log)) { await calm(); break; } await calm(); }
  if (process.env.DBG) console.log('LOG', log.slice(-300)); ok(await p.evaluate(() => __zotik.LF().st().fa.v === 1), 'Elaris: Vexa stellt sich vor'); await w(300);
  const vx = await p.evaluate(() => { const e = __zotik.E.find(e => !e.dead && e.unwin); return e ? e.hp : 0; });
  ok(vx > 1e5, 'Vexa ist im Kampf unverwundbar stark');
  await shot(p, 'vexa');
  await p.evaluate(() => { const Z = __zotik; Z.S().hp = 20; Z.pl.iframes = 0; Z.pl.hurtCd = 0; Z.hurtP(15, 0, 0); }); log = ''; await w(1500); await calm();
  ok(/zu klein/.test(log) && await p.evaluate(() => { const Z = __zotik; return !Z.pl.dead && Z.S().hp > 20 && !Z.E.some(e => !e.dead && e.unwin); }), 'Niederlage gegen Vexa endet mit Szene, kein Game Over');

  // Astralis: echter Kampf gegen Vexa und Korrod
  await p.evaluate(() => { const S = __zotik.S(); S.cd[2].fin = 1; for (let k = 4; k <= 8; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; __zotik.switchWorld(9); }); await w(1500); await calm(); await w(2000); await calm();
  await flood(p); r = await talk(p, 'Riss der Gesichter'); await w(400); await calm();
  const two = await p.evaluate(() => __zotik.E.filter(e => !e.dead && /^(Vexa|Korrod)$/.test(e.d.name)).length);
  ok(two === 2, 'Astralis: Vexa und Korrod kämpfen echt (' + two + ')');
  await p.evaluate(() => { const Z = __zotik; for (const e of Z.E) if (!e.dead && /^(Vexa|Korrod)$/.test(e.d.name)) Z.killE(e); }); await w(1500); await calm();
  ok(await p.evaluate(() => __zotik.LF().st().fa.f9 === 1), 'Gesichter in Astralis besiegt');

  // Lebensentscheidung mit Lyra
  await p.evaluate(() => { const l = __zotik.LF().st(); l.b.lyra = 45; l.tk.lyra = 3; __zotik.toggleMenu(true, 'camp'); }); await w(300);
  ok(await p.evaluate(() => /Sternenhimmel/.test(document.getElementById('mcont').textContent)), 'Camp-Reiter kündigt die Lebensentscheidung an');
  await p.evaluate(() => { __zotik.toggleMenu(false); __zotik.LF().fireTalk('lyra'); }); await w(400);
  for (let k = 0; k < 10 && (await opt(p, 'Versprechen')); k++) { await skip(p); await w(300); }
  await calm();
  ok(await p.evaluate(() => __zotik.LF().st().vow === 'bund' && __zotik.LF().bondMul('lyra', 1) > 1.3), 'Versprechen gegeben: Lyras Teamangriff dauerhaft stärker');

  // Echogrotte: 99 Ebenen, Tagesgrotte, Relikte
  await p.evaluate(() => { __zotik.switchWorld(1); }); await w(1500); await calm();
  await p.evaluate(() => __zotik.caveEnter(true)); await w(2500); await calm();
  const cv = await p.evaluate(() => { const Z = __zotik, S = Z.S(); return { d: S.cave.run && S.cave.run.daily, seed: S.cave.seed === Z.LF().daySeed(), zn: Z.WLD && Z.WLD.zn.cave[1] }; });
  ok(cv.d === await p.evaluate(() => __zotik.LF().today()) && cv.seed && /von 99/.test(cv.zn), 'Tagesgrotte: fester Tageswert, 99 Ebenen (' + cv.zn + ')');
  await p.evaluate(() => { __zotik.LF().relic(10); __zotik.LF().relic(10); __zotik.S().cave.f = 7; __zotik.caveExit(false); }); await w(1500); await calm();
  const rl = await p.evaluate(() => { const l = __zotik.LF().st(); return { rel: l.rel.length, dc: l.dc[0] }; });
  ok(rl.rel === 1 && rl.dc && rl.dc.f === 6, 'Echo-Relikt gesammelt (1/9), Tageslauf gespeichert: ' + JSON.stringify(rl));
  ok(!p.errs.length, 'keine Fehler auf der Seite ' + p.errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? fails + ' Fehler' : 'Alles gut.'); process.exit(fails ? 1 : 0);
})();
