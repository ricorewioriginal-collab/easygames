// Weltkarte mit Monstern: Gegner an den Wegpfaden, Flossen auf dem Meer; mit der Nautilux berührt beginnt ein rundenbasierter Seekampf.
//   node tools/test-zotik/seekampf.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/see-*.jpg
const { chromium, ARGS, open, intro, shot, skip, opt } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 12; S.fl.naut = 1; for (let n = 2; n <= 7; n++) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  await p.evaluate(() => __zotik.switchWorld(15)); await w(1200); await skip(p);
  const land = await p.evaluate(() => { const Z = __zotik; return Z.E.filter(e => !e.dead).length; });
  ok('Gegner an den Wegpfaden', land >= 4, land + ' Gegner');
  const f = await p.evaluate(() => { const W = __zotik.W; return W.fins ? W.fins.length : -1; });
  ok('Flossen auf dem Meer', f >= 5, f + ' Flossen');
  const d = await p.evaluate(() => { const Z = __zotik, W = Z.W; const st = W.docks[0]; Z.pl.x = st.lx; Z.pl.z = st.lz; Z.step(1 / 30, 3); Z.interact(); Z.step(1 / 30, 5); return { naut: Z.naut.on, x: Z.pl.x, z: Z.pl.z }; });
  ok('Nautilux auf dem Meer', d.naut, JSON.stringify(d));
  await p.evaluate(() => { const Z = __zotik, fn = Z.W.fins[0]; fn.x = Z.pl.x + .5; fn.z = Z.pl.z + .5; Z.step(1 / 30, 2); });
  const on = await p.evaluate(() => !!__zotik.X.sea); ok('Flosse berührt: Seekampf beginnt', on);
  await w(3500); if (BILD) await shot(p, 'see-kampf');
  const xp0 = await p.evaluate(() => __zotik.S().xp + __zotik.S().lvl * 1e6);
  let menu = ''; for (let k = 0; k < 80; k++) { if (!(await p.evaluate(() => !!__zotik.X.sea))) break; const o = await opt(p, 'Angriff'); if (o === '') { await w(120); await opt(p, '('); } else if (!menu && o.includes('Abwehr')) menu = o; if (o === 'keine Auswahl') await p.evaluate(() => document.getElementById('dlg').click()); await w(700); }
  const fin = await p.evaluate(() => ({ sea: !!__zotik.X.sea, xp: __zotik.S().xp + __zotik.S().lvl * 1e6 }));
  ok('Kampf rundenweise ausgefochten und gewonnen', !fin.sea && fin.xp > xp0, JSON.stringify(fin));
  ok('Flosse nach dem Sieg fort', await p.evaluate(() => __zotik.W.fins[0].gone === 1));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
