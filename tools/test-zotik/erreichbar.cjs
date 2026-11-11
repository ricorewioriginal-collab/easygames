// Erreichbarkeit aller Auftrags- und Etappen-Punkte je Welt (Flutfüllung ab Dorf, zu Fuß)
const { chromium, ARGS, open } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const from = +process.argv[2] || 2, to = +process.argv[3] || 10;
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 20; for (const c of ['lyra', 'nia', 'rovan']) Z.joinParty(c); });
  for (let n = from; n <= to; n++) for (const [tag, cd] of [['Auftrag', { st: 2, k: 0, m: 0, mc: 0 }], ['Etappe1', { st: 2, k: 99, m: 1 }], ['Etappe2', { st: 5, k: 99, m: 1, e1: 1 }]]) {
    const r = await p.evaluate(([n, cd]) => { const Z = __zotik, S = Z.S(); for (let k = 2; k < n; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; S.cd[n] = Object.assign({ b: [0, 0, 0], ord: 0, arr: 1, bd: 0 }, cd);
      if (Z.ch !== 1) Z.switchWorld(1); Z.switchWorld(n); const d = document.getElementById('dlg'); for (let k = 0; k < 30 && !d.hidden; k++) { d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); Z.step(1 / 30, 2); }
      const st = 1, key = (i, j) => i * 1000 + j, seen = new Set(), q = [[0, 9]]; seen.add(key(0, 9)); Z.pl.x = 0; Z.pl.z = 9;
      while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, c = j + dj, k = key(a, c); if (seen.has(k) || a < -128 || a > 128 || c > 74 || c < -232 || Z.pBlocked(a * st, c * st)) continue; seen.add(k); q.push([a, c]); } }
      const reach = (x, z, r) => { const i = Math.round(x), j = Math.round(z); for (let a = -r; a <= r; a++) for (let c = -r; c <= r; c++) if (Math.hypot(a, c) <= r && seen.has(key(i + a, j + c))) return true; return false; };
      const bad = [], pts = []; const C = Z.CHP[n], a = Z.EPX().cur;
      for (const it of Z.INT) if (it.vis && (it.pr === C.bkp || it.pr === 'Verteidigung starten')) pts.push([it.name, it.x, it.z, 2]);
      for (const np of Z.NPC) if (/^lost/.test(np.id)) pts.push(['Vermisste ' + np.name, np.x, np.z, 3]);
      if (a) { for (const q2 of a.parts) pts.push([a.d.part || a.d.items[q2.i], q2.x, q2.z, a.d.k === 'sky' ? 99 : 2]); if (a.run) a.run.wp.forEach((w, i) => pts.push(['Wegpunkt ' + i, w[0], w[1], 2])); if (a.esc) for (let z = a.esc.sz; z > a.esc.gz; z -= 4) pts.push(['Begleitweg z=' + z, Z.W.path(z) + 3, z, 6]); }
      for (const [nm, x, z, r] of pts) if (r < 90 && !reach(x, z, r)) bad.push(nm + ' (' + x.toFixed(0) + ',' + z.toFixed(0) + ')');
      return (a ? a.d.k : cd.m === 0 ? 'Auftrag' : 'KEINE ETAPPE') + ' · ' + pts.length + ' Punkte · ' + (bad.length ? 'NICHT ERREICHBAR: ' + bad.join(', ') : 'alle erreichbar') + ' · frei ' + seen.size; }, [n, cd]);
    console.log(`K${n} ${tag}: ${r}`); }
  console.log('Fehler: ' + ([...new Set(p.errs)].join(' | ') || 'keine')); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 400)); process.exit(1); });
