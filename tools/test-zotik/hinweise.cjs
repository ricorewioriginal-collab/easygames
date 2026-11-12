// Ruinen-Rätsel mit Hinweisen: Hinweistafel ist ansprechbar, jeder Hinweis markiert den nächsten Schritt, und nur den Markierungen folgen löst das Rätsel
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); Z.S().stage = 8; for (const e of Z.E) e.dead = true; }); await intro(p);
  const USE = { statues: 1, colors: 1 }, FOLLOW = { tones: 1, lights: 1, statues: 1, colors: 1, order: 1, dark: 1, sum: 1, pattern: 1 };
  for (let n = 1; n <= 10; n++) { const kind = await p.evaluate(n => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); for (const e of Z.E) e.dead = true; return ({1:'tones',2:'statues',3:'lights',4:'pairs',5:'orbs',6:'colors',7:'order',8:'dark',9:'sum',10:'pattern'})[n]; }, n); await w(400);
    const tab = await p.evaluate(() => { const Z = __zotik; const t = Z.INT.find(i => i.name === 'Hinweistafel'); if (!t) return null; Z.pl.x = t.x; Z.pl.z = t.z + 1; return [t.x, t.z]; }); if (!tab) { ok(`Welt ${n}`, false, 'keine Hinweistafel'); continue; }
    const pr = await p.waitForFunction(() => !document.getElementById('prompt').hidden && /Hinweis/.test(document.getElementById('prompt').textContent), null, { timeout: 5000 }).then(() => true, () => false);
    await p.evaluate(() => __zotik.interact()); await w(300);
    const first = await p.evaluate(() => { const r = __zotik.X.rpz; return { h: r.hint(), mk: r.mk }; });
    if (n === 3) await p.screenshot({ path: '/tmp/zotik-test/hinweis-' + n + '.png' });
    let steps = 0, err = '';
    const k = await p.evaluate(() => __zotik.X.rpz && Object.keys(__zotik.X.rpz));
    if (first.h && first.mk) for (; steps < 40; steps++) { const st = await p.evaluate(() => { const r = __zotik.X.rpz; if (r.solved) return null; r.hint(); return r.mk; }); if (!st) break; if (steps === 0 && !FOLLOW[kind]) break;
      if (FOLLOW[kind] && !USE[kind]) { await p.evaluate(q => { __zotik.pl.x = q[0]; __zotik.pl.z = q[1]; }, st); await w(160); await p.evaluate(() => { __zotik.pl.x += 30; }); await w(160); }
      else if (USE[kind]) { await p.evaluate(q => { const Z = __zotik; const t = Z.INT.filter(i => i.vis && i.vis() && i.name !== 'Hinweistafel').sort((a, b) => Math.hypot(a.x - q[0], a.z - q[1]) - Math.hypot(b.x - q[0], b.z - q[1]))[0]; t.talk(); }, st); await w(120); } else break; }
    const solved = await p.evaluate(() => __zotik.X.rpz.solved);
    ok(`Welt ${n} · ${kind}`, pr && !!first.h && !!first.mk && (!FOLLOW[kind] || solved), `Tafel ${pr ? 'ja' : 'nein'} · „${(first.h || '').slice(0, 60)}“ · ${FOLLOW[kind] ? (solved ? 'per Hinweisen gelöst in ' + steps : 'NICHT gelöst') : 'nur Markierung'}`); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
