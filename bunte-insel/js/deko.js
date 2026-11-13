'use strict';
/* Bunte Insel – echte 3D-Modelle 🌳 (frei, CC0): Kenney Nature Kit (Bäume, Büsche, Blumen, Felsen, Stumpf, Stamm) und KayKit Dungeon Pack
   (Säulen, Fackel, Goldtruhe, Banner, Fässer, Kisten, Kerzen). Vorgebacken in models/deko.bin (≈ 156 KB, bunte-insel-src/bake-models.mjs) –
   kein GLTFLoader, keine Textur. Laden ist optional: ohne Datei (offline beim allerersten Start) bleiben die bisherigen Formen.
   Jedes Modell wird als Instanz-Gruppe je 120-m-Kachel gezeichnet (wenige Zeichenaufrufe, weit weg ausgeblendet über BI.DETAIL).
   Hauptinsel: die 190 Bäume werden zu echten Baum-Modellen (W.useTreeModels). Alle Inseln: Felsen, Büsche, Blumen, Stümpfe, Stämme.
   Rätsel-Insel: Säulen am Weg, verzierte Torsäulen mit Fackeln am Prüfungsturm, Fässer/Kisten an der Schmiede, Banner und Kerzen am Kapsel-Schrein.
   Taschi-Land: verzierte Säulen mit Bannern rund um das Portal. Lizenzen: models/LIZENZEN.md. Abschalten zum Vergleichen: ?deko=0 */
BI.Deko = (function () {
  const K = { ready: false, failed: false, M: {}, G: {}, list: [], cbs: [] }, URL = 'models/deko.bin';
  function parse(buf) {
    const dv = new DataView(buf); if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'BIM1') throw new Error('deko.bin ungültig');
    const jl = dv.getUint32(4, true), meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl))), base = 8 + jl + ((4 - ((8 + jl) % 4)) % 4);
    for (const [name, m] of Object.entries(meta.models)) {
      const qp = new Int16Array(buf, base + m.p, m.vc * 3), p = new Float32Array(m.vc * 3), span = [0, 1, 2].map(k => m.max[k] - m.min[k]), cx = (m.min[0] + m.max[0]) / 2, cz = (m.min[2] + m.max[2]) / 2;
      for (let k = 0; k < m.vc * 3; k += 3) { for (let a = 0; a < 3; a++) p[k + a] = ((qp[k + a] + 32768) / 65535) * span[a] + m.min[a]; p[k] -= cx; p[k + 1] -= m.min[1]; p[k + 2] -= cz; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(buf.slice(base + m.n, base + m.n + m.vc * 3)), 3, true));
      g.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(buf.slice(base + m.c, base + m.c + m.vc * 3)), 3, true));
      g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf.slice(base + m.i, base + m.i + m.ic * 2)), 1));
      K.G[name] = g; K.M[name] = { size: span };
    }
  }
  K.geo = n => K.G[n] || null;
  K.onReady = f => { if (K.ready) f(); else K.cbs.push(f); };
  K.load = function () {
    if (K.ready || K.loading || K.failed) return; if (typeof location !== 'undefined' && /[?&]deko=0/.test(location.search)) { K.failed = true; return; } K.loading = true;
    fetch(URL).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(b => { parse(b); K.ready = true; K.loading = false; for (const f of K.cbs.splice(0)) try { f(); } catch (e) { console.warn(e); } })
      .catch(() => { K.loading = false; K.failed = true; });
  };
  /* Platzieren (vor oder nach dem Laden): name, x, y, z, Größe s (Faktor), Drehung ry, Kollisionsradius cr (0 = keiner) */
  K.add = (name, x, y, z, s, ry, cr) => { K.list.push({ name, x, y, z, s, ry: ry || 0, cr: cr || 0 }); };
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler(), _b = new THREE.Box3();
  K.flush = function (scene, W) {
    const CELL = 120, by = new Map(); let n = 0;
    for (const it of K.list.splice(0)) { const g = K.G[it.name]; if (!g) continue; const key = it.name + '|' + Math.floor(it.x / CELL) + ',' + Math.floor(it.z / CELL); (by.get(key) || by.set(key, []).get(key)).push(it); if (it.cr && W) W.addCircle(it.x, it.z, it.cr, false, 3); }
    for (const [key, L] of by) {
      const src = K.G[key.split('|')[0]], g = new THREE.BufferGeometry(); for (const a in src.attributes) g.setAttribute(a, src.attributes[a]); g.setIndex(src.index);
      const m = new THREE.InstancedMesh(g, BI.mat(), L.length); _b.makeEmpty(); let rmax = 0;
      L.forEach((it, i) => { _m.compose(_p.set(it.x, it.y, it.z), _q.setFromEuler(_e.set(0, it.ry, 0)), _s.set(it.s, it.s, it.s)); m.setMatrixAt(i, _m); _b.expandByPoint(_p); const sz = K.M[key.split('|')[0]].size; rmax = Math.max(rmax, Math.max(sz[0], sz[1], sz[2]) * it.s); });
      g.boundingSphere = _b.getBoundingSphere(new THREE.Sphere()); g.boundingSphere.radius += rmax; m.userData.detail = 1; BI.DETAIL.push(m); scene.add(m); n++;
    }
    return n;
  };
  return K;
})();

/* Platzierungen für die Welten – nach dem Bau aller Inseln (W.free/W.onRoad kennen dann Häuser, Wege und Wasser) */
BI.buildDeko = function (c) {
  const { W, scene, eco } = c, D = BI.Deko, rn = BI.rng(4242), TAU = Math.PI * 2;
  D.load(); if (D.failed) return;
  const okAt = (x, z, r) => W.groundY(x, z) < .25 && !W.onRoad(x, z) && W.free(x, z, r) && !(W.lock && W.lock.some && W.lock.some(q => Math.hypot(q.x - x, q.z - z) < (q.r || 0) + 2));
  /* Streu-Deko je Insel: Felsen (mit Kollision), Büsche, Blumen, Stümpfe, Stämme */
  const ISL = [{ x: 0, z: 0, R: 150, min: 40, n: 70 }];
  for (const k of ['CITY', 'PARK', 'RAINBOW', 'PUPS', 'DAMPF', 'DRACHEN', 'BAULAND', 'FUSSBALL', 'MAERCHEN', 'SCHLUESSEL', 'SCHWAMM', 'RAETSEL', 'ZOTIK', 'RADIO', 'WUNSCH', 'TASCHI', 'HUEPF', 'PRISMA']) { const O = BI[k]; if (O && O.x != null && O.R) ISL.push({ x: O.x, z: O.z, R: O.R, min: 12, n: 16 }); }
  const KINDS = [['rock_large', 3.2, 1.3], ['rock_small', 3.4, 0], ['bush', 5.5, 0], ['bush_large', 6, 0], ['flower_red', 3.2, 0], ['flower_red', 3.2, 0], ['stump', 3.6, .5], ['log', 3.2, 0]];
  for (const O of ISL) {
    const want = Math.round(O.n * (eco ? .5 : 1)); let got = 0;
    for (let t = 0; t < want * 30 && got < want; t++) {
      const a = rn() * TAU, d = O.min + Math.sqrt(rn()) * (O.R * .86 - O.min), x = O.x + Math.sin(a) * d, z = O.z + Math.cos(a) * d, [nm, s, cr] = KINDS[(rn() * KINDS.length) | 0], k = .8 + rn() * .45;
      if (!okAt(x, z, 1.6)) continue; D.add(nm, x, W.groundY(x, z), z, s * k, rn() * TAU, cr * k); got++;
    }
  }
  /* Rätsel-Insel: Säulenweg, Torsäulen mit Fackeln am Prüfungsturm, Schmiede-Vorrat, Schrein-Schmuck */
  const M = BI.RAETSEL; if (M) {
    const L = M.at, ry = Math.atan2(M.ux, M.uz), out = ry + Math.PI;
    for (const a of [-66, -58, -30, -24, -8, -2]) for (const b of [-4.6, 4.6]) { const p = L(a, b); if (W.free(p.x, p.z, .9)) D.add('pillar', p.x, 0, p.z, .55, ry, .6); }
    for (const b of [-7, 7]) { const p = L(1.2, b); if (W.free(p.x, p.z, 1.2)) { D.add('pillar_decorated', p.x, 0, p.z, .8, out, 1); const q = L(.2, b); D.add('torch_mounted', q.x, 2.1, q.z, 1.1, out); } }
    { const p = L(-14, -32), q = L(-13.5, -39), r = L(-26, -31); if (okAt(p.x, p.z, 1)) D.add('barrel_large', p.x, 0, p.z, .6, 0, .7); if (okAt(q.x, q.z, 1.3)) D.add('crates_stacked', q.x, 0, q.z, .7, .4, 1); if (okAt(r.x, r.z, 1)) D.add('barrel_large', r.x, 0, r.z, .55, 1, .6); }
    { const A = -20, B = 34; for (let k = 0; k < 6; k++) { const g = k / 6 * TAU + .5 + TAU / 12, p = L(A + Math.sin(g) * 6.6, B + Math.cos(g) * 6.6); D.add('candle_triple', p.x, 0, p.z, 1.4, g); } }
    { const p = L(-44, -12.5), q = L(-44, 12.5); if (okAt(p.x, p.z, 1)) D.add('banner_patternB_blue', p.x, 0, p.z, .9, ry + Math.PI / 2); if (okAt(q.x, q.z, 1)) D.add('banner_patternA_red', q.x, 0, q.z, .9, ry - Math.PI / 2); }
  }
  /* Taschi-Land: verzierte Säulen mit Bannern rund um das Portal */
  const T = BI.TASCHI; if (T && W.spots.taschiportal) {
    const m = T.at(T.arena.a, T.arena.b), face = Math.atan2(T.entry.x - m.x, T.entry.z - m.z);
    for (const s of [-1, 1]) { const sx = Math.cos(face) * s, sz = -Math.sin(face) * s, x = m.x + sx * 7.5 + Math.sin(face) * 1.5, z = m.z + sz * 7.5 + Math.cos(face) * 1.5; D.add('pillar_decorated', x, 0, z, .95, face, 1.1); D.add(s < 0 ? 'banner_patternB_blue' : 'banner_patternA_red', x + Math.sin(face) * 1.0, 0, z + Math.cos(face) * 1.0, .85, face); }
  }
  D.onReady(() => { if (W.useTreeModels) W.useTreeModels(D); D.flush(scene, W); });
};
