// Areale der Märchenwelten (Spiegelwald): Waldwände sperren, Plateaus über Rampen erreichbar, Brücken tragen über Schlucht und Abgrund
const { chromium, ARGS, open, intro, skip, flood } = require('./lib.cjs');
let ok = 0, n = 0; const chk = (c, m) => { n++; if (c) ok++; console.log((c ? 'ok   ' : 'FEHL ') + m); };
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const w = ms => p.waitForTimeout(ms);
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; }); await intro(p); await skip(p);
  await p.evaluate(() => __zotik.switchWorld(21)); await w(3000); for (let i = 0; i < 10; i++) { await skip(p); await w(250); }
  await flood(p);
  const r = await p.evaluate(() => { const Z = __zotik, W = Z.WLD, A = W.mw.areal, o = {};
    o.tiers = A.tiers.map(t => !!window.__near(t[0], t[1], 2.4)); o.top = A.tiers.map(t => +Z.hgt(t[0], t[1]).toFixed(2));
    o.wall = [[60, 10], [-90, -70], [0, -125]].map(([x, z]) => W.blocked(x, z)); o.cut = W.blocked(42, -93.8);
    const walk = (x0, z0, x1, z1, y) => { const pl = Z.pl; pl.x = x0; pl.z = z0; pl.y = y; pl.vy = 0; pl.air = false; Z.cam(Math.atan2(x0 - x1, z0 - z1), .35, 9); Z.keys.KeyW = true;
      for (let i = 0; i < 150 && Math.hypot(pl.x - x1, pl.z - z1) > 1; i++) { Z.cam(Math.atan2(pl.x - x1, pl.z - z1), .35, 9); Z.step(1 / 30, 1); } Z.keys.KeyW = false; for (let i = 0; i < 10; i++) Z.step(1 / 30, 1);
      return { d: +Math.hypot(pl.x - x1, pl.z - z1).toFixed(1), y: +pl.y.toFixed(2) }; };
    const [ax, az, bx, bz, by] = A.bridges[1], ux = (bx - ax), uz = (bz - az), L = Math.hypot(ux, uz);
    o.b1 = walk(ax - ux / L * 2, az - uz / L * 2, bx + ux / L * 2, bz + uz / L * 2, by);
    const [cx, cz, dx, dz] = A.bridges[0], vx = dx - cx, vz = dz - cz, M = Math.hypot(vx, vz);
    o.b0 = walk(cx - vx / M * 3, cz - vz / M * 3, dx + vx / M * 3, dz + vz / M * 3, Z.hgt(cx - vx / M * 3, cz - vz / M * 3));
    o.props = Z.scene.children.length; return o; });
  console.log(JSON.stringify(r));
  chk(r.tiers.every(Boolean), 'alle Plateaus zu Fuß über Rampen erreichbar');
  chk(r.top.every((y, i) => Math.abs(y - [3.4, 4, 5.5, 5.5][i]) < .05), 'Plateau-Oberkanten eben auf Sollhöhe');
  chk(r.wall.every(Boolean), 'Waldwände zwischen den Arealen sperren');
  chk(r.cut, 'Schlucht ist ein Abgrund (gesperrt)');
  chk(r.b1.d < 1.5 && Math.abs(r.b1.y - 5.5) < .3, 'Hängebrücke zwischen den Plateaus begehbar');
  chk(r.b0.d < 1.5, 'Brücke über die Splitterkluft begehbar');
  chk(!p.errs.length, 'keine Fehler auf der Seite' + (p.errs.length ? ': ' + p.errs[0] : ''));
  console.log(ok + '/' + n + ' bestanden'); await b.close(); process.exit(ok === n ? 0 : 1); })();
