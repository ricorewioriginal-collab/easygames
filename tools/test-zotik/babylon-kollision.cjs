// Babylon-Kollisionswelt (Phase 1): Vergleich mit dem vorhandenen pushOut an Zufallspunkten in Welt 2 und Welt 5.
//   node tools/test-zotik/babylon-kollision.cjs
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); let fail = 0;
  const ok = (n, c, i) => { if (!c) fail++; console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  for (const w of [2, 5]) {
    const r = await p.evaluate(async w => { const Z = __zotik; Z.switchWorld(w); Z.step(1 / 30, 5); const t0 = performance.now(), bw = await Z.bw(), tLoad = performance.now() - t0;
      let n = 0, agree = 0, moved = 0, tMs = 0; const R = .5;
      for (let i = 0; i < 400; i++) { const c = Z.COL[(i * 7) % Math.max(1, Z.COL.length)]; if (!c) break; const a = i * 2.399, d = c.r + R * .5 + (i % 3) * .1, o1 = { x: c.x + Math.cos(a) * d, z: c.z + Math.sin(a) * d }, o2 = { ...o1 };
        Z.pushOut(o1, R); bw.focus(o2.x, o2.z); const t = performance.now(); bw.resolve(o2, R); tMs += performance.now() - t; n++; if (Math.hypot(o1.x - o2.x, o1.z - o2.z) < .5) agree++; if (Math.hypot(o1.x - (c.x + Math.cos(a) * d), o1.z - (c.z + Math.sin(a) * d)) > .01) moved++; }
      const proxies = bw.count(); bw.dispose(); return { n, agree, moved, proxies, tLoad: Math.round(tLoad), ms: +(tMs / Math.max(1, n)).toFixed(2), col: Z.COL.length }; }, w);
    ok(`Welt ${w}: Babylon schiebt wie pushOut (≤ 0,5 m Abweichung)`, r.n > 20 && r.agree / r.n > .85, JSON.stringify(r)); }
  ok('keine Seitenfehler', p.errs.length === 0, p.errs.join(' | ')); await b.close(); process.exit(fail ? 1 : 0); })();
