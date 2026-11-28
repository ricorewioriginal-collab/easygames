// Echte Natur (models/ph, nat.js): Modelle geladen, in Lunaris, Kapitel- und Märchenwelten gesetzt, Nah-/Fernansicht schaltet, Welten räumen auf
//   node tools/test-zotik/natur.cjs
const { chromium, ARGS, open, intro, skip } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b, {}); const res = [];
  const ok = (name, pass, info) => { res.push(pass); console.log(`${pass ? 'ok  ' : 'FEHL'} ${name}${info ? ' · ' + info : ''}`); };
  await p.evaluate(() => { __zotik.startDbg(); }); await intro(p);
  const st = () => p.evaluate(async () => { const Z = __zotik; await Z.NAT.load(); for (let i = 0; i < 20; i++) Z.step(1 / 30, 1); return Z.NAT.stat(); });
  const need = await p.evaluate(async () => { const Z = __zotik, M = await Z.NAT.load(), miss = []; for (const n in Z.WZ) for (const q of Z.WZ[n]) if (q[2] === 'ph' && !M[q[0]]) miss.push(q[0]);
    for (const k of ['laub1', 'laub2', 'laub3', 'laub4', 'laub5', 'tanne1', 'tanne2', 'kahl1', 'kahl2', 'totbaum3', 'koecher1', 'koecher2', 'strauchbaum', 'busch1', 'busch2', 'busch4', 'farn1', 'tropen2', 'fels1', 'fels2', 'fels3', 'fels4', 'moosfels1', 'moosfels2', 'moosfels3', 'moosfels4', 'wuestenfels1', 'wuestenfels2', 'mondfels1', 'mondfels2']) if (!M[k]) miss.push(k);
    return { miss, far: ['laub1', 'laub2', 'laub4', 'tanne1'].every(k => M[k].far) && !!M._far, n: Object.keys(M).length, tris: Math.max(...Object.values(M).filter(a => a.parts).map(a => a.parts.reduce((s, q) => s + (q.geo.index ? q.geo.index.count : q.geo.attributes.position.count) / 3, 0))) }; });
  ok('Alle verwendeten Modelle sind in der Datei, Bäume haben eine Fernansicht', !need.miss.length && need.far, JSON.stringify(need));
  ok('Kein Modell über 1500 Dreiecke (Handy)', need.tris <= 1500, 'größtes: ' + need.tris);
  const l = await st(); ok('Lunaris: Bäume und Felsen gesetzt, wenige Zeichenaufrufe', l.items > 300 && l.near > 0 && l.far > l.near && l.draws <= 40, JSON.stringify(l));
  const lod = await p.evaluate(async () => { const Z = __zotik; Z.pl.x = 60; Z.pl.z = -150; Z.pl.y = Z.hgt(60, -150); Z.snapCam(); for (let i = 0; i < 30; i++) Z.step(1 / 30, 1); const a = Z.NAT.stat(); Z.pl.x = 0; Z.pl.z = 18; Z.pl.y = Z.hgt(0, 18); Z.snapCam(); for (let i = 0; i < 30; i++) Z.step(1 / 30, 1); return { wald: a, dorf: Z.NAT.stat() }; });
  ok('Nahansicht nur um die Kamera, Rest als Fernansicht', lod.wald.near > lod.dorf.near && lod.wald.far < lod.dorf.far && lod.wald.near + lod.wald.far <= lod.wald.items, JSON.stringify(lod));
  for (const n of [2, 4, 6, 21, 23]) { await p.evaluate(n => __zotik.switchWorld(n), n); await p.waitForTimeout(400); await skip(p); const s = await st(); ok(`Welt ${n}: echte Natur gesetzt`, s.items > 20 && s.near > 0 && s.draws <= 70, JSON.stringify(s)); }
  await p.evaluate(() => __zotik.switchWorld(1)); await p.waitForTimeout(300); await skip(p);
  const back = await p.evaluate(async () => { const Z = __zotik; for (let i = 0; i < 400; i++) Z.step(1 / 30, 1); return Z.NAT.stat(); });
  ok('Zurück in Lunaris: nur Lunaris-Natur, wieder sichtbar', back.items === l.items && back.groups === l.groups, JSON.stringify(back));
  ok('keine Fehler', !p.errs.length, p.errs.join(' | '));
  console.log(`${res.filter(Boolean).length}/${res.length} bestanden`); await b.close(); process.exit(res.every(Boolean) ? 0 : 1); })();
