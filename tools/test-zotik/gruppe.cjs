// Gefährten mit eigener Stufe, EP und Ausrüstung (Menü „Gruppe“)
//   node tools/test-zotik/gruppe.cjs [bild]
const { chromium, ARGS, open, intro, shot, skip } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 10; }); await intro(p);
  await p.evaluate(() => { const Z = __zotik; Z.joinParty('lyra'); Z.joinParty('nia'); }); await w(600); await skip(p);
  const a = await p.evaluate(() => { const S = __zotik.S(); return { lyra: S.cl.lyra.lv, nia: S.cl.nia.lv, gear: S.cl.lyra.g.w }; });
  ok('Gefährten starten mit eigener Stufe und Ausrüstung', a.lyra >= 8 && a.gear === 'g_w1', JSON.stringify(a));
  const hp0 = await p.evaluate(() => __zotik.CMP.find(q => q.id === 'lyra') && __zotik.S().cl.lyra.lv);
  await p.evaluate(() => __zotik.gainXp(9000)); await w(300);
  const b2 = await p.evaluate(() => { const S = __zotik.S(); return { lyra: S.cl.lyra.lv, zotik: S.lvl }; });
  ok('EP heben auch die Stufe der Gefährten', b2.lyra > hp0, JSON.stringify(b2));
  await p.evaluate(() => { __zotik.toggleMenu(true, 'party'); }); await w(400);
  const m = await p.evaluate(() => { const t = document.getElementById('menu').textContent; return { lyra: /Lyra · Stufe/.test(t), btn: document.querySelectorAll('[data-cg]').length }; });
  ok('Menü „Gruppe“ zeigt Stufe und Ausrüstungsfächer', m.lyra && m.btn >= 6, JSON.stringify(m));
  if (BILD) await shot(p, 'gruppe-menu');
  const c = await p.evaluate(() => { const S = __zotik.S(); S.cinv.g_a3 = 1; const before = S.cl.lyra.g.a; let n = 0; while (S.cl.lyra.g.a !== 'g_a3' && n++ < 6) document.querySelector('[data-cg="lyra:a"]').click(); return { before, after: S.cl.lyra.g.a }; });
  ok('Rüstung wechseln', c.after === 'g_a3', JSON.stringify(c));
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
