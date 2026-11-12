// Unsichtbare Wände: prüft an jeder Kollisionsgrenze, ob dort auch etwas Sichtbares steht.
// 1) Gelände-Sperren (pBlocked): vom freien Feld waagrecht Richtung Sperre, kein Treffer in 1,3 m = unsichtbar
// 2) Kreis-Kollider (COL) und Häuser: von außen auf den Rand zu, Abstand Rand → sichtbare Fläche
// Aufruf: node tools/test-zotik/waende.cjs [welten, z. B. 1,2,13]  · Ausgabe: Gruppen unsichtbarer Stellen je Welt
const { chromium, ARGS, open, skip } = require('./lib.cjs');
(async () => { const b = await chromium.launch({ args: ARGS }); const p = await open(b); const ws = (process.argv[2] || '1,2,3,4,5,6,7,8,9,10,11,13,21,22,23,24,25,26,27').split(',').map(Number); let total = 0;
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.fl.naut = 1; S.fl.bridge = 1; S.lvl = 20; for (let k = 2; k <= 11; k++) S.cd[k] = { st: 7, fin: 1, bd: 1, arr: 1, e1: 1, e2: 1, k: 0, b: [0, 0, 0], ord: 0 }; });
  for (const n of ws) {
    await p.evaluate(n => { const Z = __zotik; if (Z.ch !== 1) Z.switchWorld(1); if (n !== 1) Z.switchWorld(n); }, n); await skip(p);
    const r = await p.evaluate(n => { const Z = __zotik, T = Z.T, st = .5, key = (i, j) => i * 4000 + j, seen = new Set(), W = Z.WLD;
      const s0 = (W && W.spawn ? W.spawn : [0, 18]).map(v => Math.round(v / st)), q = [s0]; seen.add(key(s0[0], s0[1]));
      while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, c = j + dj, k = key(a, c); if (seen.has(k) || Math.abs(a) > 300 || c > 200 || c < -520 || Z.pBlocked(a * st, c * st)) continue; seen.add(k); q.push([a, c]); } }
      // Sichtbare Dinge sammeln (keine Figuren, Partikel, Linien, fast unsichtbaren Flächen)
      const skipO = new Set(); for (const o of [Z.pl.root || Z.pl.g || Z.pl.o].filter(Boolean)) o.traverse(x => skipO.add(x)); for (const e of Z.E) if (e.g) e.g.traverse(x => skipO.add(x)); for (const c of Z.CMP || []) if (c.g) c.g.traverse(x => skipO.add(x));
      Z.scene.updateMatrixWorld(true);
      const objs = [], hw = new Set(Z.HOUSES.map(H => H.wm)); Z.scene.traverseVisible(o => { if (!(o.isMesh || o.isInstancedMesh) || o.isSprite || skipO.has(o)) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || (m.transparent && m.opacity < .25 && !hw.has(m))) return; objs.push(o); });
      for (const o of objs) { if (o.geometry) { o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox(); } if (o.isInstancedMesh) { o.boundingSphere = null; o.boundingBox = null; } }
      const sides = new Map(); for (const o of objs) for (const m of [].concat(o.material)) if (!sides.has(m)) { sides.set(m, m.side); m.side = T.DoubleSide; }
      const rc = new T.Raycaster(); rc.camera = Z.camera; const O = new T.Vector3(), D = new T.Vector3();
      // Kandidaten je Strahl über Hüllkugeln vorfiltern (sonst prüft jeder Strahl alle Dreiecke der großen Netze)
      const SP = objs.map(o => { if (o.isInstancedMesh || !o.geometry || !o.geometry.boundingSphere) return null; const c = o.geometry.boundingSphere.center.clone().applyMatrix4(o.matrixWorld), sc = o.matrixWorld.getMaxScaleOnAxis(); return [c.x, c.y, c.z, o.geometry.boundingSphere.radius * sc]; });
      const cand = (x, y, z, far) => objs.filter((o, i) => { const s = SP[i]; if (!s) return true; const d = Math.hypot(s[0] - x, s[1] - y, s[2] - z); return d < s[3] + far + .2; });
      const hit = (x, z, dx, dz, far) => { const g = Z.hgt(x, z), cs = cand(x, g + 1, z, far + 1); if (!cs.length) return false; for (const hh of [.45, 1.3]) { O.set(x, g + hh, z); D.set(dx, 0, dz).normalize(); rc.set(O, D); rc.far = far; if (rc.intersectObjects(cs, false).length) return true; } return false; };
      const dn = new T.Vector3(0, -1, 0), down = (x, z) => { const g = Z.hgt(x, z); O.set(x, g + 6, z); rc.set(O, dn); rc.far = 12; const h = rc.intersectObjects(cand(x, g + 2, z, 7), false); return h.length && h[0].point.y > g + .25; };
      // sichtbar: Wand/Hang (waagrechter Strahl trifft), Kante (Boden fällt ab), Wasser/Gegenstand von oben
      const vis = (x, z, dx, dz) => hit(x, z, dx, dz, 1.3) || Z.hgt(x + dx, z + dz) < Z.hgt(x, z) - .6 || down(x + dx * .75, z + dz * .75);
      const bad = [];
      // 1) Gelände-/Weltgrenzen
      let nb = 0; for (const k of seen) { const i = Math.floor((k + 2000) / 4000), j = k - i * 4000; if ((i + j) & 1) continue; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (seen.has(key(i + di, j + dj))) continue; const x = i * st, z = j * st; if (!Z.pBlocked(x + di * st, z + dj * st)) continue; nb++; if (!vis(x, z, di, dj)) bad.push(['grenze', x, z]); } }
      // 2) Kreis-Kollider und Häuser (nur wo man hinkommt)
      const near = (x, z) => seen.has(key(Math.round(x / st), Math.round(z / st)));
      for (const c of Z.COL) for (let a = 0; a < 8; a++) { const ca = Math.cos(a * Math.PI / 4), sa = Math.sin(a * Math.PI / 4), x = c.x + ca * (c.r + .7), z = c.z + sa * (c.r + .7); if (!near(x, z)) continue; if (!hit(x, z, -ca, -sa, 1.25)) { bad.push(['kollider r=' + c.r.toFixed(1), c.x, c.z]); break; } }
      if (0) for (const H of Z.HOUSES) for (const sg of H.segs) for (const [lx, lz, nx, nz] of [[sg.hx + .7, 0, -1, 0], [-sg.hx - .7, 0, 1, 0], [0, sg.hz + .7, 0, -1], [0, -sg.hz - .7, 0, 1]]) { const x = sg.wx + lx * H.c + lz * H.s, z = sg.wz - lx * H.s + lz * H.c, dx = nx * H.c + nz * H.s, dz = -nx * H.s + nz * H.c; if (!near(x, z)) continue; if (!hit(x, z, dx, dz, 1.25)) bad.push(['haus', x, z]); }
      for (const [m, sd] of sides) m.side = sd;
      // Gruppieren (4 m)
      const grp = []; for (const [t, x, z] of bad) { let g = grp.find(q => q.t === t && Math.hypot(q.x - x, q.z - z) < 4 + q.n * .5); if (!g) grp.push(g = { t, x, z, n: 0, x0: x, x1: x, z0: z, z1: z }); g.n++; g.x0 = Math.min(g.x0, x); g.x1 = Math.max(g.x1, x); g.z0 = Math.min(g.z0, z); g.z1 = Math.max(g.z1, z); }
      return { n, frei: seen.size, grenzen: nb, unsichtbar: bad.length, grp: grp.sort((a, b) => b.n - a.n).slice(0, 25).map(g => g.t + ' ×' + g.n + ' x' + g.x0.toFixed(0) + '..' + g.x1.toFixed(0) + ' z' + g.z0.toFixed(0) + '..' + g.z1.toFixed(0)) }; }, n);
    total += r.unsichtbar; console.log(`=== Welt ${n}: frei ${r.frei} · Grenzfelder ${r.grenzen} · unsichtbar ${r.unsichtbar}`); for (const g of r.grp) console.log('   ' + g);
  }
  console.log('Fehler: ' + ([...new Set(p.errs)].join(' | ') || 'keine') + ' · unsichtbare Stellen gesamt ' + total); await b.close(); })().catch(e => { console.log('ABBRUCH', e.message.slice(0, 600)); process.exit(1); });
