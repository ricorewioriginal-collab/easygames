// Kampfsystem einheitlich wählbar (Menü „⚔️ Kampf“): Auto (Welten Echtzeit, Weltkarte/Meer rundenbasiert), Echtzeit, Rundenbasiert
const { chromium, ARGS, open, intro, skip, opt } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: false, ctx: { viewport: { width: 960, height: 540 } } }); const w = ms => p.waitForTimeout(ms); let bad = 0;
  const ok = (n, c, i) => { if (!c) bad++; console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 12; S.fl.naut = 1; S.party = ['lyra']; for (let n = 2; n <= 4; n++) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  /* Menüknopf wechselt Auto → Echtzeit → Rundenbasiert und merkt es im Spielstand */
  const m = await p.evaluate(() => { const o = [], bt = document.getElementById('mCombat'); o.push(__zotik.combatMode()); bt.click(); o.push(__zotik.combatMode()); bt.click(); o.push(__zotik.combatMode() + '|' + bt.textContent + '|' + __zotik.S().combat); return o; });
  ok('Menüknopf schaltet um und speichert', m[0] === 'auto' && m[1] === 'real' && /^turn\|.*Rundenbasiert\|turn$/.test(m[2]), JSON.stringify(m));
  /* Echtzeit auf der Weltkarte: Symbolgegner wird zu echten Gegnern, kein Rundenkampf */
  await p.evaluate(() => { const Z = __zotik; Z.X.sea = false; Z.setCombat('real'); Z.switchWorld(15); }); await w(1200); await skip(p);
  const r2 = await p.evaluate(() => { const Z = __zotik, r = Z.W.roam[0], n0 = Z.E.filter(e => !e.dead).length; Z.pl.x = r.x + .8; Z.pl.z = r.z + .8; Z.pl.y = Z.W.h(Z.pl.x, Z.pl.z); Z.step(1 / 30, 3); return { sea: !!Z.X.sea, gone: !!r.gone, more: Z.E.filter(e => !e.dead).length > n0 }; });
  ok('Echtzeit auf der Weltkarte: echte Gegner statt Rundenkampf', !r2.sea && r2.gone && r2.more, JSON.stringify(r2));
  /* Echtzeit auf dem Meer: Flosse wird zu Seemonstern, die Nautilux darf angreifen */
  await skip(p); const r3 = await p.evaluate(() => { const Z = __zotik; Z.E.forEach(e => { if (!e.dead) Z.killE(e); }); Z.S().hp = 999; const f = Z.W.fins[0], st = Z.W.docks[0]; Z.pl.x = st.lx; Z.pl.z = st.lz; Z.step(1 / 30, 3); return 1; }); await w(900);
  await p.evaluate(() => { const Z = __zotik; }); await skip(p); await p.evaluate(() => { const Z = __zotik, st = Z.W.docks[0]; if (!Z.naut.on) { Z.mount(); Z.pl.x = st.x; Z.pl.z = st.z; } Z.step(1 / 30, 3); window.__dbg = [Z.naut.on, !document.getElementById('dlg').hidden, document.getElementById('dlg').textContent.slice(0,60), Z.pl.dead]; });
  const r4 = await p.evaluate(() => { const Z = __zotik, f = Z.W.fins[0]; f.x = Z.pl.x + .5; f.z = Z.pl.z + .5; Z.step(1 / 30, 2); Z.step(1 / 30, 2); const sea = Z.E.filter(e => e.sea && !e.dead).length; return { rb: !!Z.X.sea, gone: !!f.gone, sea, naut: Z.naut.on }; });
  ok('Echtzeit auf dem Meer: Seemonster statt Seekampf', !r4.rb && r4.gone && r4.sea >= 1 && r4.naut, JSON.stringify(r4));
  /* Rundenbasiert in einer Kapitelwelt: Berührung startet den Rundenkampf */
  await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); }); await w(1200); await skip(p);
  const r1 = await p.evaluate(() => { const Z = __zotik; Z.setCombat('turn'); const e = Z.spawnEnemy('wolf', Z.pl.x + 1.5, Z.pl.z + 1.5); e.st = 'chase'; for (let i = 0; i < 40; i++) Z.step(1 / 30, 1); return { sea: !!Z.X.sea, hud: !!document.querySelector('#rbh:not([hidden]) .rb-c'), lv: /Lv \d+/.test(document.querySelector('#rbh .rb-p')?.textContent || '') }; });
  ok('Rundenbasiert in der Kapitelwelt: Kampf beginnt', r1.sea && r1.hud); ok('Level der Gefährten in der Kampfanzeige', r1.lv);
  ok('keine Fehler', !p.errs.length, p.errs.join(' | '));
  console.log(bad ? 'FEHLER' : 'alles ok'); await b.close(); process.exit(bad ? 1 : 0); })();
