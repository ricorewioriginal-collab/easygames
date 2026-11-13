// Schwimmen und Tauchen in den Seen der Kapitelwelten (zu Fuß hinein, abtauchen, auftauchen, Luft)
//   node tools/test-zotik/see-schwimmen.cjs [bild]
const { chromium, ARGS, open, intro, shot, skip } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 10; for (let n = 2; n <= 7; n++) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  await p.evaluate(() => __zotik.switchWorld(3)); await w(2500); await skip(p);
  const a = await p.evaluate(() => { const Z = __zotik, L = Z.NZ().cur && Z.NZ().cur.lake; if (!L) return null; Z.pl.x = L.x + L.r * .3; Z.pl.z = L.z; Z.pl.y = L.wl; Z.step(1 / 30, 20); return { wat: Z.pl.wat, y: +Z.pl.y.toFixed(2), wl: L.wl, bot: +Z.W.h(Z.pl.x, Z.pl.z).toFixed(2) }; });
  ok('Im See: Zotik schwimmt an der Oberfläche', a && a.wat && Math.abs(a.y - (a.wl - 1.05)) < .2 && a.bot < a.y - 3, JSON.stringify(a));
  if (BILD) { await w(600); await shot(p, 'see-oben'); }
  const d = await p.evaluate(() => { const Z = __zotik; const y0 = Z.pl.y; for (let i = 0; i < 4; i++) { Z.dodge(); Z.step(1 / 30, 10); } return { dv: Z.pl.dv, dy: +(y0 - Z.pl.y).toFixed(2), br: +Z.pl.br.toFixed(1) }; });
  ok('Abtauchen: unter Wasser, Luft nimmt ab', d.dv && d.dy > 1.5 && d.br < 12, JSON.stringify(d));
  if (BILD) { await w(300); await shot(p, 'see-tauchen'); }
  const u = await p.evaluate(() => { const Z = __zotik; for (let i = 0; i < 6; i++) { Z.jump(); Z.step(1 / 30, 10); } Z.step(1 / 30, 30); return { dv: Z.pl.dv, wat: Z.pl.wat }; });
  ok('Auftauchen', !u.dv && u.wat, JSON.stringify(u));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
