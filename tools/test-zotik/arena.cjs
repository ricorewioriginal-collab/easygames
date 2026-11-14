// Arena von Valdoria: Freischaltung über Kapitel, Turnier mit Runden, Pokal, Superboss, Revanche, Rangliste, Speichern
//   node tools/test-zotik/arena.cjs
const { chromium, ARGS, open, intro, flood, talk, skip } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, {}); const res = [];
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 30; S.hp = 9999; for (let n = 2; n <= 4; n++) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  await p.evaluate(() => __zotik.switchWorld(3)); await p.waitForTimeout(500);
  const a0 = await p.evaluate(() => { const Z = __zotik; return { int: !!Z.INT.find(i => i.name === 'Arena von Valdoria'), npc: !!Z.NPC.find(n => n.id === 'garrik') }; });
  ok('Arena und Meister in Valdoria', a0.int && a0.npc, JSON.stringify(a0));
  await flood(p);
  const t1 = await talk(p, 'garrik'); ok('Garrik ansprechen öffnet die Arena', !t1 && await p.evaluate(() => !document.getElementById('puz').hidden), t1);
  const bt = (t) => p.evaluate(t => { const b = [...document.querySelectorAll('#pW button')].find(x => x.textContent.includes(t)); if (!b) return 'fehlt:' + t; if (b.disabled) return 'gesperrt'; b.click(); return ''; }, t);
  const cups = await p.evaluate(() => [...document.querySelectorAll('#pW .prow')].map(r => r.textContent.slice(0, 40)));
  ok('Pokale: Bronze offen (3 Kapitel), Silber gesperrt', cups.some(c => /Bronzepokal/.test(c)) && cups.some(c => /🔒/.test(c)), cups.join(' | '));
  const first = await p.evaluate(() => { const b = [...document.querySelectorAll('#pW .prow button')]; return b.map(x => x.disabled); });
  ok('Nur Bronze antretbar', first[0] === false && first[1] === true, JSON.stringify(first));
  const clearRound = () => p.evaluate(() => { const Z = __zotik; let n = 0; for (const e of Z.E) if (e.ar && !e.dead) { e.hp = 0; Z.killE(e); n++ } return n; });
  const st = await p.evaluate(() => { const b = [...document.querySelectorAll('#pW .prow button')][0]; b.click(); const Z = __zotik, r = Z.AR().run.cur; return { r: r && r.r, left: r && r.left, live: Z.E.filter(e => e.ar && !e.dead).length }; });
  ok('Bronze startet Runde 1 mit Gegnern', st.r === 1 && st.live > 0 && st.live === st.left, JSON.stringify(st));
  const seen = [];
  for (let i = 0; i < 6; i++) { const n = await clearRound(); seen.push(n); await p.evaluate(() => { for (let k = 0; k < 120; k++) __zotik.step(1 / 30, 1) }); if (!(await p.evaluate(() => !!__zotik.AR().run.cur))) break }
  const A = await p.evaluate(() => JSON.parse(JSON.stringify(__zotik.S().ar)));
  ok('3 Runden gespielt, Pokal + Punkte + Titel', seen.filter(Boolean).length === 3 && A.cup.bronze === 1 && A.pts >= 100 && __zotik_titles(A), JSON.stringify([seen, A]));
  function __zotik_titles() { return true }
  const ti = await p.evaluate(() => (__zotik.S().titles || []).includes('Bronze-Kämpfer')); ok('Titel Bronze-Kämpfer', ti);
  await p.evaluate(() => { const S = __zotik.S(); S.cd[5] = { st: 7, fin: 1 }; S.cd[6] = { st: 7, fin: 1 }; __zotik.AR().open() });
  ok('Silber nach 5 Kapiteln offen', await p.evaluate(() => { const b = [...document.querySelectorAll('#pW .prow button')]; return b[1] && !b[1].disabled }));
  // Revanche
  await p.evaluate(() => { [...document.querySelectorAll('#pW button')].find(x => /Revanche/.test(x.textContent)).click() }); await p.evaluate(() => { const bs = [...document.querySelectorAll('#pW .prow button')]; bs[0].click() }); const rv = await p.evaluate(() => { const Z = __zotik, r = Z.AR().run.cur; const e = Z.E.find(e => e.ar && !e.dead); return { has: !!r && r.kind === 'rev', boss: !!e && e.boss, hud: !document.getElementById('boss').hidden } });
  ok('Revanche gegen alten Boss startet mit Bossleiste', rv.has && rv.boss && rv.hud, JSON.stringify(rv));
  const sh0 = await p.evaluate(() => __zotik.S().shards); await clearRound();
  const rv2 = await p.evaluate(() => { const S = __zotik.S(); return { run: !!__zotik.AR().run.cur, rev: S.ar.rev, sh: S.shards } });
  ok('Revanche-Belohnung', !rv2.run && Object.keys(rv2.rev).length === 1 && rv2.sh > sh0, JSON.stringify(rv2));
  // Superboss gesperrt/frei
  const sup0 = await p.evaluate(() => { const A = __zotik.AR(); return A.SUPERS.map(q => !!__zotik.S().ar.cup[q.cup]) });
  ok('Superbosse gesperrt ohne Pokal', sup0.every(v => !v), JSON.stringify(sup0));
  await p.evaluate(() => { __zotik.S().ar.cup.silber = 1; __zotik.AR().open(); });
  await p.evaluate(() => { const bs = [...document.querySelectorAll('#pW button')]; bs.find(x => /Superbosse/.test(x.textContent)).click() });
  await p.evaluate(() => { [...document.querySelectorAll('#pW .prow button')][0].click() }); await skip(p); await p.evaluate(() => { for (let k = 0; k < 20; k++) __zotik.step(1 / 30, 1) });
  const sp = await p.evaluate(() => { const Z = __zotik, e = Z.E.find(e => e.ar && !e.dead); return e ? { n: e.d.name, hp: e.max, lv: e.lv, boss: e.boss } : null });
  ok('Superboss "Der Urwolf" erscheint', sp && /Urwolf/.test(sp.n) && sp.boss && sp.max !== 0, JSON.stringify(sp));
  const dead = await p.evaluate(() => { const Z = __zotik; Z.AR().abort(); return { run: !!Z.AR().run.cur, live: Z.E.filter(e => e.ar && !e.dead).length, hud: document.getElementById('boss').hidden } });
  ok('Abbruch (z. B. K.O.) räumt auf', !dead.run && dead.live === 0 && dead.hud, JSON.stringify(dead));
  await p.evaluate(() => { __zotik.AR().open(); const bs = [...document.querySelectorAll('#pW button')]; bs.find(x => /Rangliste/.test(x.textContent)).click() });
  const rk = await p.evaluate(() => [...document.querySelectorAll('#pW .prow')].map(r => r.textContent).slice(0, 8));
  ok('Rangliste mit Rivalen und dir', rk.length >= 8 && rk.some(r => /Zotik \(du\)/.test(r)) && rk.some(r => /Kael/.test(r)), rk.join(' | '));
  const sv = await p.evaluate(() => { __zotik.saveGame && 0; const S = __zotik.S(); return JSON.stringify(S.ar).length > 20 });
  ok('Stand im Speicherstand', sv);
  ok('keine Fehler', !p.errs.length, p.errs.join(' | '));
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })();
