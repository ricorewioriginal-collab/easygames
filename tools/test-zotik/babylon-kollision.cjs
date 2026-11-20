// Babylon-Kollisionswelt: läuft allein (ohne pushOut) gegen Rundhindernisse und darf nicht eindringen; im Spiel darf Zotik nicht durch Hindernisse laufen.
//   node tools/test-zotik/babylon-kollision.cjs
const { chromium, ARGS, open, intro } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); let fail = 0;
  const ok = (n, c, i) => { if (!c) fail++; console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  for (const w of [2, 5]) {
    const r = await p.evaluate(async w => { const Z = __zotik; Z.switchWorld(w); Z.step(1 / 30, 5); const bw = await Z.bw(); const R = .5;
      let n = 0, halt = 0, frei = 0, tief = 0, tMs = 0, calls = 0;
      for (let i = 0; i < 120; i++) { const c = Z.COL[(i * 7) % Math.max(1, Z.COL.length)]; if (!c || c.t != null) continue; const a = i * 2.399, d0 = c.r + R + 2, o = { x: c.x + Math.cos(a) * d0, z: c.z + Math.sin(a) * d0 }, ux = -Math.cos(a), uz = -Math.sin(a);
        /* nur Hindernisse, die frei stehen (kein Nachbar im Anlauf) */ if (Z.COL.some(q => q !== c && Math.hypot(q.x - c.x, q.z - c.z) < q.r + c.r + 4)) continue;
        bw.focus(o.x, o.z, true); const t = performance.now(); let mn = 99; for (let k = 0; k < 40; k++) { bw.move(o, ux * .1, uz * .1, R); calls++; mn = Math.min(mn, Math.hypot(o.x - c.x, o.z - c.z)); } tMs += performance.now() - t;
        n++; if (mn < c.r + R - .2) tief++; else if (mn < c.r + R + .3) halt++;   /* halt = bis an den Rand gekommen, nie hinein */
        const f = { x: c.x + Math.cos(a) * d0, z: c.z + Math.sin(a) * d0 }; bw.move(f, -ux * .5, -uz * .5, R); if (Math.abs(Math.hypot(f.x - c.x, f.z - c.z) - d0 - .5) < .01) frei++; }
      bw.dispose(); return { n, halt, tief, frei, ms: +(tMs / Math.max(1, calls)).toFixed(3) }; }, w);
    ok(`Welt ${w}: Babylon hält vor dem Hindernis an`, r.n >= 5 && r.halt >= r.n - 1 && r.tief === 0, JSON.stringify(r));
    ok(`Welt ${w}: freier Weg bleibt frei (höchstens 1 durch Wand/Block daneben)`, r.frei >= r.n - 1, r.frei + '/' + r.n); }
  // im Spiel: Zotik läuft gegen ein frei stehendes Hindernis und bleibt draußen
  const g = await p.evaluate(() => { const Z = __zotik; Z.switchWorld(2); Z.step(1 / 30, 5); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    const c = Z.COL.find(c => c.t == null && c.r > .5 && !Z.COL.some(q => q !== c && Math.hypot(q.x - c.x, q.z - c.z) < q.r + c.r + 4) && !Z.pBlocked(c.x, c.z - c.r - 2.5) && !Z.pBlocked(c.x, c.z)); if (!c) return null;
    Z.pl.x = c.x + .15; Z.pl.z = c.z - c.r - 2.5; Z.pl.y = Z.hgt(Z.pl.x, Z.pl.z); Z.pl.face = 0; Z.setCam(Math.PI, .42, 7.6); const z0 = Z.pl.z; let min = 99; Z.bst.bjs = Z.bst.alt = 0; Z.keys.KeyW = true;
    for (let k = 0; k < 90; k++) { Z.step(1 / 30, 1); min = Math.min(min, Math.hypot(Z.pl.x - c.x, Z.pl.z - c.z)); } Z.keys.KeyW = false; return { r: c.r, min: +min.toFixed(2), lief: +(Z.pl.z - z0).toFixed(2), vorbei: Z.pl.z > c.z, bjs: Z.bst.bjs, alt: Z.bst.alt }; });
  ok('Spiel: Zotik läuft nicht durch das Hindernis', !!g && g.min > g.r + .5 - .12 && g.lief > 1, JSON.stringify(g));
  ok('Spiel: Zotik gleitet am Hindernis vorbei', !!g && g.vorbei, g && String(g.vorbei));
  ok('Spiel: Schritte laufen über Babylon (über 80 %)', !!g && g.bjs > 20 && g.bjs / (g.bjs + g.alt) > .8, g && g.bjs + ' Babylon / ' + g.alt + ' alt');
  // fast mittig gegen das Hindernis: Zotik muss so zügig herumgleiten wie früher (altes Verfahren: 40–47 Bilder)
  const gl = await p.evaluate(() => { const Z = __zotik, out = []; const cs = Z.COL.filter(c => c.t == null && c.r > .5 && !Z.COL.some(q => q !== c && Math.hypot(q.x - c.x, q.z - c.z) < q.r + c.r + 4) && !Z.pBlocked(c.x, c.z - c.r - 2.5) && !Z.pBlocked(c.x, c.z) && !Z.pBlocked(c.x, c.z + c.r + 3)).slice(0, 4);
    for (const c of cs) { Z.pl.x = c.x + .02; Z.pl.z = c.z - c.r - 2.5; Z.pl.y = Z.hgt(Z.pl.x, Z.pl.z); Z.pl.face = 0; Z.keys.KeyW = true; let k = 0; for (; k < 240 && Z.pl.z < c.z + c.r + .6; k++) { Z.setCam(Math.PI, .42, 7.6); Z.step(1 / 30, 1); } Z.keys.KeyW = false; Z.step(1 / 30, 3); out.push(k); } return out; });
  ok('Spiel: gleitet zügig um Hindernisse (höchstens 52 Bilder)', gl.length > 0 && Math.max(...gl) <= 52, gl.join(' '));
  ok('keine Seitenfehler', p.errs.length === 0, p.errs.join(' | ')); await b.close(); process.exit(fail ? 1 : 0); })();
