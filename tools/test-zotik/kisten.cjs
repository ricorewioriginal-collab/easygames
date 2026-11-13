// Kisten und Fässer überall zerschlagbar, Truhen geben auch Ausrüstung
//   node tools/test-zotik/kisten.cjs [bild]
const { chromium, ARGS, open, intro, shot, skip } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 10; for (let n = 2; n <= 7; n++) S.cd[n] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; }); await intro(p);
  const n1 = await p.evaluate(() => __zotik.BRK.length); ok('Lunaris: zerschlagbare Kisten', n1 >= 6, n1 + '');
  for (const n of [3, 6, 22]) { await p.evaluate(n => __zotik.switchWorld(n), n); await w(1500); await skip(p); const c = await p.evaluate(() => __zotik.BRK.length); ok('Welt ' + n + ': zerschlagbare Kisten', c >= 6, c + ''); }
  await p.evaluate(() => __zotik.switchWorld(3)); await w(2500); await skip(p);
  const r = await p.evaluate(() => { const Z = __zotik, b = Z.BRK.find(q => q.hp), S = Z.S(), s0 = S.shards + S.potions * 1000; Z.pl.x = b.q.x - 1.2; Z.pl.z = b.q.z; Z.pl.face = Math.PI / 2; Z.step(1 / 30, 2); Z.doHit(); return { hp: b.hp, got: S.shards + S.potions * 1000 > s0 || Object.keys(S.cinv || {}).length > 0 }; });
  ok('Kiste zerschlagen gibt Beute', r.hp === 0 && r.got, JSON.stringify(r));
  if (BILD) { await w(300); await shot(p, 'kiste'); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
