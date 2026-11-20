// Echte Physik (Havok über Babylon): Trümmer zerschlagener Kisten fliegen in Schlagrichtung, landen auf dem Boden, lassen sich wegkicken und verschwinden wieder.
//   node tools/test-zotik/physik.cjs [bild]  – mit „bild“ Foto nach /tmp/zotik-test/physik-*.jpg
const { chromium, ARGS, open, intro, shot } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); let fail = 0;
  const ok = (n, c, i) => { if (!c) fail++; console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; for (let n = 2; n <= 10; n++) S.cd[n] = { fin: 1 }; }); await intro(p);
  const a = await p.evaluate(async () => { const Z = __zotik; Z.switchWorld(2); Z.step(1 / 30, 5); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    const k = Z.BRK.find(q => q.hp && !Z.pBlocked(q.q.x, q.q.z - 1.6)); if (!k) return null; const x = k.q.x, z = k.q.z; Z.pl.x = x; Z.pl.z = z - 1.6; Z.pl.y = Z.hgt(Z.pl.x, Z.pl.z); Z.pl.face = 0; Z.setCam(Math.PI + .5, .5, 7); Z.step(1 / 30, 3);
    const t0 = performance.now(); await Z.phyLoad(); const lade = Math.round(performance.now() - t0); const sh = Z.S().shards + Z.S().potions; const hit = Z.brkSmash(Z.pl.x, Z.pl.z, 0, 1); const P = Z.phy(); const n0 = P.count();
    let ms = 0; for (let i = 0; i < 12; i++) { Z.step(1 / 60, 1); ms += P.ms(); } const flug = P.pieces();
    return { x, z, lade, hit, n0, st: P.statics(), hoch: Math.max(...flug.map(q => q.y - Z.hgt(q.x, q.z))), ms: +(ms / 12).toFixed(2) }; });
  ok('Kiste gefunden und zerschlagen', !!a && a.hit, JSON.stringify(a)); if (!a) { await b.close(); process.exit(1); }
  ok('Trümmer entstehen (mindestens 5) mit Boden und Hindernissen', a.n0 >= 5 && a.st >= 1, `${a.n0} Teile, ${a.st} feste Körper, Havok geladen in ${a.lade} ms`);
  ok('Trümmer fliegen hoch', a.hoch > .5, a.hoch.toFixed(2) + ' m');
  if (BILD) await shot(p, 'physik-flug');
  const r = await p.evaluate(a => { const Z = __zotik, P = Z.phy(); Z.pl.x = a.x; Z.pl.z = a.z - 8; Z.step(1 / 60, 150); const L = P.pieces(); const dz = L.reduce((s, q) => s + q.z - a.z, 0) / L.length;
    return { n: L.length, dz: +dz.toFixed(2), tief: L.filter(q => q.y < Z.hgt(q.x, q.z) - .15).length, hoch: L.filter(q => q.y > Z.hgt(q.x, q.z) + .6).length, ruhig: L.filter(q => q.v < .6).length, weit: Math.max(...L.map(q => Math.hypot(q.x - a.x, q.z - a.z))) }; }, a);
  ok('Trümmer fliegen in Schlagrichtung', r.dz > .5, r.dz + ' m im Schnitt');
  ok('Trümmer liegen auf dem Boden (keins darunter, keins schwebt)', r.tief === 0 && r.hoch === 0, JSON.stringify(r));
  ok('Trümmer kommen zur Ruhe', r.ruhig >= r.n - 1, r.ruhig + '/' + r.n);
  if (BILD) await shot(p, 'physik-liegt');
  const k = await p.evaluate(() => { const Z = __zotik, P = Z.phy(); const L = P.pieces(); let qi = 0, best = -1; L.forEach((c, i) => { const f = Math.min(...Z.COL.map(o => Math.hypot(o.x - c.x, o.z - c.z) - o.r)); if (f > best && !Z.pBlocked(c.x, c.z - 1.2)) { best = f; qi = i; } }); const q = L[qi]; Z.pl.x = q.x; Z.pl.z = q.z - 1.2;   /* frei liegendes Teil wählen */ Z.pl.y = Z.hgt(Z.pl.x, Z.pl.z); Z.pl.face = 0; Z.setCam(Math.PI, .42, 7.6); Z.keys.KeyW = true; let vmax = 0, weg = 0;
    for (let i = 0; i < 40; i++) { Z.setCam(Math.PI, .42, 7.6); Z.step(1 / 60, 1); const c = P.pieces()[qi]; vmax = Math.max(vmax, c.v); weg = Math.hypot(c.x - q.x, c.z - q.z); } Z.keys.KeyW = false; return { vmax: +vmax.toFixed(2), weg: +weg.toFixed(2) }; });
  ok('Zotik kickt ein Trümmerteil weg', k.vmax > 1 && k.weg > .3, JSON.stringify(k));
  const e = await p.evaluate(() => { const Z = __zotik, P = Z.phy(); Z.step(1 / 30, 300); return { n: P.count(), st: P.statics() }; });
  ok('Trümmer verschwinden, Physik ruht wieder', e.n === 0 && e.st === 0, JSON.stringify(e));
  const w = await p.evaluate(() => { const Z = __zotik, P = Z.phy(); const k = Z.BRK.find(q => q.hp); Z.pl.x = k.q.x; Z.pl.z = k.q.z - 1.2; Z.brkSmash(Z.pl.x, Z.pl.z, 0, 1); const n = P.count(); Z.switchWorld(3); Z.step(1 / 30, 3); return { n, nach: P.count() }; });
  ok('Weltwechsel räumt Trümmer ab', w.n > 0 && w.nach === 0, JSON.stringify(w));
  // Kampf: Gegner zerfällt in Brocken, die vom Spieler wegfliegen; ein Schlag fegt liegende Trümmer weg
  const g = await p.evaluate(() => { const Z = __zotik, P = Z.phy(); Z.switchWorld(2); Z.step(1 / 30, 5); for (const e of Z.E) if (!e.dead) { e.dead = true; e.m.root.visible = false; }
    let x = 0, z = 14; for (let k = 0; k < 40 && Z.pBlocked(x, z + 3); k++) z += 1; Z.pl.x = x; Z.pl.z = z; Z.pl.y = Z.hgt(x, z); Z.pl.iframes = 99; const e = Z.spawnEnemy('x2', x, z + 3); const n0 = P.count(); Z.killE(e); const n1 = P.count(); Z.step(1 / 60, 150);
    const L = P.pieces(), dz = L.reduce((s, q) => s + q.z - (z + 3), 0) / L.length, tief = L.filter(q => q.y < Z.hgt(q.x, q.z) - .2).length;
    const q = L[0]; const k = P.blast(q.x - .5, q.y, q.z, 2.4, 5); Z.step(1 / 60, 6); const v = Math.max(...P.pieces().map(c => c.v)); return { n0, n1, dz: +dz.toFixed(2), tief, k, v: +v.toFixed(2) }; });
  ok('Gegner zerfällt in echte Brocken', g.n0 === 0 && g.n1 >= 4, g.n1 + ' Brocken');
  ok('Brocken fliegen vom Spieler weg und landen auf dem Boden', g.dz > .3 && g.tief === 0, JSON.stringify(g));
  ok('Druckwelle eines Schlags fegt Trümmer weg', g.k >= 1 && g.v > 1.5, g.k + ' Teile, bis ' + g.v + ' m/s');
  if (BILD) { await p.evaluate(() => { const Z = __zotik; const e = Z.spawnEnemy('x2', Z.pl.x, Z.pl.z + 3.5); Z.setCam(Math.PI + .6, .45, 7.5); Z.step(1 / 60, 20); Z.killE(e); Z.step(1 / 60, 14); }); await shot(p, 'physik-gegner'); }
  ok(`Physik-Rechenzeit je Bild mit Trümmern unter 3 ms`, a.ms < 3, a.ms + ' ms');
  ok('keine Seitenfehler', p.errs.length === 0, p.errs.join(' | ')); await b.close(); process.exit(fail ? 1 : 0); })();
