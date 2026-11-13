// Klettern: Zotik greift Kanten (Hausdach, Mauer), zieht sich hoch und läuft oben weiter – in Lunaris und in einer Märchenwelt
//   node tools/test-zotik/klettern.cjs [bild]  – mit „bild“ Fotos nach /tmp/zotik-test/klettern-*.jpg
const { chromium, ARGS, open, intro, shot, skip } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [], w = ms => p.waitForTimeout(ms);
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 10; }); await intro(p); await skip(p);
  // vor die Wand eines Bauwerks stellen, darauf zulaufen, springen und weiterdrücken
  const climb = (sel, hold) => p.evaluate(async ([sel, hold]) => { const Z = __zotik, pl = Z.pl, B = Z.CLB.filter(q => !q.rd && q.hx > 2.5 && q.hz > 2.5 && q.y - Z.hgt(q.x, q.z) > 1.4 && q.y - Z.hgt(q.x, q.z) < 4.6)[sel]; if (!B) return { err: 'kein Bau', n: Z.CLB.length };
    const dx = -B.s, dz = -B.c, ex = B.x + dx * (B.hz + 1.6), ez = B.z + dz * (B.hz + 1.6); pl.x = ex; pl.z = ez; pl.y = Z.hgt(ex, ez); pl.air = false; pl.vy = 0; pl.face = Math.atan2(-dx, -dz);
    const yaw = Math.atan2(dx, dz), y0 = pl.y, fr = ms => new Promise(r => setTimeout(r, ms)); let maxY = y0, hang = 0; Z.keys.KeyW = true;
    for (let i = 0; i < 90; i++) { Z.cam(yaw, .35, 9); if (i === 12) Z.jump(); Z.step(1 / 30, 1); if (hold && pl.clb && pl.clb.t > hold) return { held: 1 }; if (pl.clb) hang = 1; else if (hang) { Z.keys.KeyW = false; } maxY = Math.max(maxY, pl.y); if (i % 10 === 0) await fr(0); }
    Z.keys.KeyW = false; for (let i = 0; i < 20; i++) Z.step(1 / 30, 1);
    const lx = (pl.x - B.x) * B.c - (pl.z - B.z) * B.s, lz = (pl.x - B.x) * B.s + (pl.z - B.z) * B.c;
    return { maxY: +maxY.toFixed(2), d: +Math.hypot(pl.x - ex, pl.z - ez).toFixed(2), hang, y0: +y0.toFixed(2), y: +pl.y.toFixed(2), top: +B.y.toFixed(2), on: Math.abs(lx) < B.hx && Math.abs(lz) < B.hz, inH: !!(Z.HOUSES.find(H => H.in)) }; }, [sel, hold]);
  if (BILD) { await climb(1, .25); await shot(p, 'klettern-greifen'); await p.evaluate(() => { for (let i = 0; i < 4; i++) __zotik.step(1 / 30, 1); }); await shot(p, 'klettern-hochziehen'); await p.evaluate(() => { __zotik.keys.KeyW = false; for (let i = 0; i < 30; i++) __zotik.step(1 / 30, 1); }); }
  const a = await climb(0);
  ok('Lunaris: Zotik packt die Dachkante', a.hang === 1, JSON.stringify(a));
  ok('… zieht sich hoch und steht auf dem Dach', a.on && a.y > a.top - .2, JSON.stringify(a));
  ok('… Dach bleibt sichtbar (kein Hausinneres)', !a.inH);
  if (BILD) await shot(p, 'klettern-dach');
  // vom Dach herunterlaufen: fällt wieder auf den Boden
  const d = await p.evaluate(() => { const Z = __zotik, pl = Z.pl; Z.keys.KeyW = true; for (let i = 0; i < 120; i++) Z.step(1 / 30, 1); Z.keys.KeyW = false; for (let i = 0; i < 40; i++) Z.step(1 / 30, 1); return { y: +pl.y.toFixed(2), g: +Z.hgt(pl.x, pl.z).toFixed(2) }; });
  ok('über die Dachkante gelaufen: landet am Boden', Math.abs(d.y - d.g) < .4, JSON.stringify(d));
  // Märchenwelt
  await p.evaluate(() => __zotik.switchWorld(21)); await w(1500); await skip(p);
  const m = await climb(0);
  ok('Märchenwelt: Haus erklettert', m.hang === 1 && m.on && m.y > m.top - .2, JSON.stringify(m));
  if (BILD) await shot(p, 'klettern-maerchen');
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 300)); process.exit(1); });
