// Meerkönigreich: Zotik schwimmt (Sprungtaste = Schwimmzug, langsames Sinken, Schwimmhaltung), Geschichte mit verstummten Gesängen
//   node tools/test-zotik/meer-schwimmen.cjs [bild]
const { chromium, ARGS, open, skip, shot } = require('./lib.cjs');
const BILD = process.argv[2] === 'bild';
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, { render: BILD, ctx: { viewport: { width: 960, height: 540 } } }); const res = [];
  const ok = (n, c, i) => { res.push(!!c); console.log(`${c ? 'ok  ' : 'FEHL'} ${n}${i ? ' · ' + i : ''}`); };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.lvl = 20; Z.X.noFlight = 1; Z.X.noDetour = 1; }); await skip(p);
  await p.evaluate(() => __zotik.switchWorld(23)); for (let k = 0; k < 30; k++) { await skip(p); await p.waitForTimeout(400); if (await p.evaluate(() => __zotik.ch === 23 && document.getElementById('dlg').hidden)) break; }
  ok('Meerkönigreich geladen', await p.evaluate(() => __zotik.ch === 23 && __zotik.WLD.mw && __zotik.WLD.mw.under));
  const r = await p.evaluate(() => { const Z = __zotik, pl = Z.pl, g = pl.y; for (const e of Z.E) e.dead = true; Z.jump(); let top = pl.y;
    for (let i = 0; i < 8; i++) { Z.step(1 / 30, 9); Z.jump(); top = Math.max(top, pl.y); } const tilt = Z.fox.body.rotation.x; let vmin = 0; for (let i = 0; i < 20; i++) { Z.step(1 / 30, 1); vmin = Math.min(vmin, pl.vy); }
    return { g, top: top - g, tilt, vmin, air: pl.air }; });
  ok('mehrere Schwimmzüge tragen Zotik nach oben', r.top > 4, JSON.stringify(r));
  ok('Schwimmhaltung (nach vorn geneigt)', r.tilt > .3);
  ok('langsames Sinken', r.vmin >= -2.7);
  await p.evaluate(() => __zotik.step(1 / 30, 200)); ok('landet wieder am Grund', await p.evaluate(() => !__zotik.pl.air));
  if (BILD) { await p.evaluate(() => { const Z = __zotik; Z.jump(); Z.step(1 / 30, 6); Z.jump(); Z.step(1 / 30, 6); Z.setCam(Z.pl.face + 2.2, .2, 6); }); await p.waitForTimeout(800); await shot(p, 'meer-schwimmen'); }
  ok('keine Fehler', !p.errs.length, [...new Set(p.errs)].join(' | ')); console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
