// Areale der Welten (Märchenwelten mit `areal`): Plateaus über Rampen erreichbar und eben, Brücken tragen, Schluchten sind Abgrund,
// alle Truhen zu Fuß erreichbar, Waldwände sperren. Aufruf: node areale.cjs [weltnummern …]
const { chromium, ARGS, open, intro, skip, flood } = require('./lib.cjs');
let ok = 0, n = 0; const chk = (c, m) => { n++; if (c) ok++; console.log((c ? 'ok   ' : 'FEHL ') + m); };
const only = process.argv.slice(2).map(Number);
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const w = ms => p.waitForTimeout(ms);
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; }); await intro(p); await skip(p);
  const L = await p.evaluate(() => __zotik.MWX().WORLDS.filter(w => w.areal).map(w => w.n));
  for (const wn of L) { if (only.length && !only.includes(wn)) continue;
    await p.evaluate(n => __zotik.switchWorld(n), wn); await w(2500); for (let i = 0; i < 10; i++) { await skip(p); await w(200); }
    await flood(p);
    const r = await p.evaluate(() => { const Z = __zotik, W = Z.WLD, A = W.mw.areal, o = { name: W.mw.name };
      o.tiers = A.tiers.map(t => !!window.__near(t[0], t[1], 2.4)); o.flat = A.tiers.every(t => Math.abs(Z.hgt(t[0], t[1]) - t[3]) < .05);
      o.chests = (W.mw.chests || []).filter(([x, z]) => !window.__near(x, z, 2.4)).map(q => q.join('/'));
      o.cuts = (A.cuts || []).every(c => W.blocked((c[0] + c[2]) / 2, (c[1] + c[3]) / 2));
      let wall = 0; for (let i = 0; i < 400; i++) { const x = -100 + (i % 20) * 10, z = 10 - (i / 20 | 0) * 7; if (W.blocked(x, z)) wall++; } o.wall = wall;
      const walk = (x0, z0, x1, z1, y) => { const pl = Z.pl; pl.x = x0; pl.z = z0; pl.y = y; pl.vy = 0; pl.air = false; Z.keys.KeyW = true;
        for (let i = 0, n = 160 + 8 * Math.hypot(x1 - x0, z1 - z0); i < n && Math.hypot(pl.x - x1, pl.z - z1) > 1; i++) { Z.cam(Math.atan2(pl.x - x1, pl.z - z1), .35, 9); Z.step(1 / 30, 1); } Z.keys.KeyW = false; for (let i = 0; i < 10; i++) Z.step(1 / 30, 1);
        return Math.hypot(pl.x - x1, pl.z - z1) < 1.5; };
      o.bridges = (A.bridges || []).map(([ax, az, bx, bz, by, wk]) => { const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, e = wk ? -.6 : 2.5, sx = ax - ux * e, sz = az - uz * e; return walk(sx, sz, bx + ux * e, bz + uz * e, Math.max(by, Z.hgt(sx, sz))); });   // Wehrgang (wk): nur auf der Mauerkrone
      o.piers = (A.piers || []).map(([ax, az, bx, bz, by]) => { const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, sx = ax - ux * 2.5, sz = az - uz * 2.5; return walk(sx, sz, bx - ux * .6, bz - uz * .6, Math.max(by, Z.hgt(sx, sz))) && Math.abs(Z.pl.y - by) < .1; });   // Steg: bis ans Ende, oben bleiben
      return o; }); console.log(JSON.stringify(r.bridges));
    chk(r.tiers.every(Boolean), `${r.name}: alle ${r.tiers.length} Plateaus über Rampen erreichbar`);
    chk(r.flat, `${r.name}: Plateau-Oberkanten eben auf Sollhöhe`);
    chk(!r.chests.length, `${r.name}: alle Truhen zu Fuß erreichbar` + (r.chests.length ? ' – NICHT: ' + r.chests.join(', ') : ''));
    chk(r.cuts, `${r.name}: Schluchten sind Abgrund (gesperrt)`);
    chk(r.wall > 80, `${r.name}: Waldwände zwischen den Arealen (${r.wall}/400 Stichproben gesperrt)`);
    chk(r.bridges.every(Boolean), `${r.name}: alle ${r.bridges.length} Brücken begehbar`);
    if (r.piers.length) chk(r.piers.every(Boolean), `${r.name}: alle ${r.piers.length} Stege begehbar bis zum Ende`); }
  chk(!p.errs.length, 'keine Fehler auf der Seite' + (p.errs.length ? ': ' + p.errs[0] : ''));
  console.log(ok + '/' + n + ' bestanden'); await b.close(); process.exit(ok === n ? 0 : 1); })();
