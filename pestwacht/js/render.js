/* Pestwacht · 3D-Darstellung mit Three.js r128: Zuflucht (prozedurale Gebäude, Mauer, Wellen, Bewohner, Tag/Nacht, Partikel),
 * Weltkarte (Sechsecke, Nebel, Gebiete, Orte, Märsche) und Schlachtfeld. Eine Zeichenoperation je Gebäude (zusammengeführte Geometrie),
 * Instanzen für Feinde, Bewohner, Geschosse und Kartenfelder. Qualität passt sich der Bildrate an. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const R = PW.R = { ok: false, mode: 'city' };
  let T, renderer, scene, cam, hemi, sun, groups = {}, W = 1, H = 1, pr = 1, quality = 'auto', fpsAcc = 0, fpsN = 0, slowFor = 0, fastFor = 0;
  const rigs = {
    city: { tx: 15, tz: 17, dist: 27, yaw: 0, pitch: 0.86, min: 9, max: 70 },
    world: { tx: 0, tz: 0, dist: 26, yaw: 0, pitch: 1.05, min: 8, max: 60 },
    battle: { tx: 4, tz: 0, dist: 26, yaw: 0, pitch: 0.7, min: 6, max: 80 }
  };
  R.rigs = rigs;

  // ---------- Grundformen und Materialien ----------
  const G = {}, MAT = {}, col = {};
  const C = {
    wood: '#8a6a44', dwood: '#5e4630', stone: '#8e8a80', dstone: '#66625a', plaster: '#d8ccb0', roof: '#8a3f2a', slate: '#4c4c56', thatch: '#b89a5a',
    green: '#5a7a3a', dgreen: '#3f5a2a', cloth: '#e3dccb', gold: '#e0aa45', water: '#3f6f9a', iron: '#50555c', fire: '#ff8a2a', glow: '#ffcf6a', dirt: '#6a5638',
    field: '#7a6a3a', crop: '#9aa040', herbc: '#6fa04a', red: '#9a3a2a', blue: '#4a6aa0', black: '#222226', sick: '#8aa84a'
  };
  function color(c) { return col[c] || (col[c] = new T.Color(c)); }
  function basicGeos() {
    const box = new T.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0); G.box = box;
    const cyl = new T.CylinderGeometry(0.5, 0.5, 1, 10); cyl.translate(0, 0.5, 0); G.cyl = cyl;
    const cyl6 = new T.CylinderGeometry(0.5, 0.5, 1, 6); cyl6.translate(0, 0.5, 0); G.cyl6 = cyl6;
    const cone = new T.ConeGeometry(0.5, 1, 8); cone.translate(0, 0.5, 0); G.cone = cone;
    const pyr = new T.ConeGeometry(0.7071, 1, 4); pyr.rotateY(Math.PI / 4); pyr.translate(0, 0.5, 0); G.pyr = pyr;
    const sph = new T.SphereGeometry(0.5, 8, 6); sph.translate(0, 0.5, 0); G.sph = sph;
    const frus = new T.CylinderGeometry(0.35, 0.5, 1, 8); frus.translate(0, 0.5, 0); G.frus = frus;
    const pr = new T.BufferGeometry();
    const v = [-.5, 0, -.5, -.5, 0, .5, -.5, 1, 0, .5, 0, -.5, .5, 1, 0, .5, 0, .5,
      -.5, 0, .5, .5, 0, .5, .5, 1, 0, -.5, 0, .5, .5, 1, 0, -.5, 1, 0,
      -.5, 0, -.5, -.5, 1, 0, .5, 1, 0, -.5, 0, -.5, .5, 1, 0, .5, 0, -.5];
    pr.setAttribute('position', new T.Float32BufferAttribute(v, 3)); pr.computeVertexNormals(); G.prism = pr;
  }
  // Teile zu einer Geometrie mit Vertexfarben zusammenführen
  const _m = () => new T.Matrix4(), _q = () => new T.Quaternion();
  function merge(parts) {
    if (!parts.length) return null;
    let n = 0; const list = [];
    const m = _m(), q = _q(), e = new T.Euler(), s = new T.Vector3(), pv = new T.Vector3();
    for (const p of parts) {
      const base = G[p.s]; const g = base.index ? base.toNonIndexed() : base.clone();
      e.set(p.rx || 0, p.ry || 0, p.rz || 0); q.setFromEuler(e); s.set(p.sx, p.sy, p.sz); pv.set(p.x, p.y, p.z);
      m.compose(pv, q, s); g.applyMatrix4(m);
      list.push([g, color(p.c)]); n += g.attributes.position.count;
    }
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const [g, c] of list) {
      const cnt = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      for (let i = 0; i < cnt; i++) { cl[(o + i) * 3] = c.r; cl[(o + i) * 3 + 1] = c.g; cl[(o + i) * 3 + 2] = c.b; }
      o += cnt; g.dispose();
    }
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(cl, 3));
    out.computeBoundingSphere();
    return out;
  }
  function mats() {
    MAT.v = new T.MeshLambertMaterial({ vertexColors: true });
    MAT.ghost = new T.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
    MAT.build = new T.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.75 });
    MAT.glow = new T.MeshBasicMaterial({ vertexColors: true });
    MAT.ok = new T.MeshBasicMaterial({ color: 0x5ad06a, transparent: true, opacity: 0.35, depthWrite: false });
    MAT.bad = new T.MeshBasicMaterial({ color: 0xe0503a, transparent: true, opacity: 0.4, depthWrite: false });
    MAT.sel = new T.LineBasicMaterial({ color: 0xffd36a });
    MAT.inst = new T.MeshLambertMaterial({ vertexColors: true });
    MAT.white = new T.MeshLambertMaterial({ color: 0xffffff });
    MAT.lane = new T.MeshBasicMaterial({ color: 0xc0503a, transparent: true, opacity: 0.35, depthWrite: false });
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,214,140,0.9)'); gr.addColorStop(0.35, 'rgba(255,170,80,0.35)'); gr.addColorStop(1, 'rgba(255,150,60,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
    MAT.halo = new T.SpriteMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.4 });
  }
  R.merge = merge;

  // ---------- Gebäudeentwürfe (Teile in lokalen Koordinaten, Grundfläche w×d, Boden y=0) ----------
  function design(t, w, d, lv, rot) {
    const P = [], hm = 1 + 0.1 * Math.max(0, lv - 1);
    const add = (s, x, y, z, sx, sy, sz, c, ry, glow) => { P.push({ s, x, y, z, sx, sy, sz, c, ry: ry || 0, glow: !!glow }); };
    const house = (x, z, sx, sz, hgt, wall, roof, ry, win) => {
      add('box', x, 0, z, sx, hgt, sz, wall, ry); add('prism', x, hgt, z, sx * 1.08, Math.min(sx, sz) * 0.55, sz * 1.12, roof, ry);
      if (win !== false) { const ox = Math.sin(ry || 0), oz = Math.cos(ry || 0); add('box', x + ox * (sz / 2 + 0.01), hgt * 0.45, z + oz * (sz / 2 + 0.01), 0.18, 0.22, 0.04, C.glow, ry, true); }
    };
    const flag = (x, z, h, c) => { add('cyl', x, 0, z, 0.05, h, 0.05, C.dwood); add('box', x + 0.22, h - 0.32, z, 0.42, 0.26, 0.03, c); };
    const fence = (sx, sz) => { add('box', 0, 0, -sz / 2, sx, 0.25, 0.05, C.wood); add('box', 0, 0, sz / 2, sx, 0.25, 0.05, C.wood); add('box', -sx / 2, 0, 0, 0.05, 0.25, sz, C.wood); add('box', sx / 2, 0, 0, 0.05, 0.25, sz, C.wood); };
    const ground = c => add('box', 0, 0, 0, w * 0.96, 0.06, d * 0.96, c || C.dirt);
    const tree = (x, z, s) => { add('cyl', x, 0, z, 0.1 * s, 0.4 * s, 0.1 * s, C.dwood); add('cone', x, 0.3 * s, z, 0.6 * s, 0.9 * s, 0.6 * s, C.dgreen); };
    switch (t) {
      case 'hq': {
        ground(C.dstone); add('box', 0, 0.06, 0, 2.6, 1.1 * hm, 2.4, C.stone); add('box', 0, 1.1 * hm, 0, 2.2, 0.9 * hm, 1.8, C.plaster);
        add('prism', 0, 2 * hm, 0, 2.3, 0.9, 1.9, C.slate);
        add('box', 0.9, 0.06, 0.9, 0.7, 3 * hm, 0.7, C.stone); add('pyr', 0.9, 3 * hm, 0.9, 0.85, 1.1, 0.85, C.slate);
        add('box', 0, 0.4, 1.21, 0.5, 0.7, 0.04, C.dwood); [-0.7, 0, 0.7].forEach(x => add('box', x, 1.5 * hm, 0.91, 0.2, 0.3, 0.04, C.glow, 0, true));
        flag(0.9, 0.9 - 0.0001, 3 * hm + 1.6, C.gold);
        if (lv >= 5) { add('box', -0.95, 0.06, -0.85, 0.6, 2.4 * hm, 0.6, C.stone); add('pyr', -0.95, 2.4 * hm + 0.06, -0.85, 0.75, 0.9, 0.75, C.slate); }
        break;
      }
      case 'haus': ground(C.dirt); house(0, 0, 1.5, 1.3, 0.9 * hm, C.plaster, lv >= 4 ? C.slate : lv >= 2 ? C.roof : C.thatch, 0); if (lv >= 3) add('box', 0.45, 0.9 * hm + 0.2, -0.2, 0.18, 0.6, 0.18, C.dstone); break;
      case 'brunnen': add('cyl', 0, 0, 0, 0.8, 0.35, 0.8, C.stone); add('cyl', 0, 0.3, 0, 0.62, 0.04, 0.62, C.water); add('box', -0.32, 0.3, 0, 0.06, 0.7, 0.06, C.dwood); add('box', 0.32, 0.3, 0, 0.06, 0.7, 0.06, C.dwood); add('prism', 0, 1, 0, 0.85, 0.3, 0.6, C.roof, Math.PI / 2); break;
      case 'farm': {
        ground(C.field); for (let k = 0; k < 5; k++) add('box', -0.5 + k * 0.35, 0.06, 0.25, 0.18, 0.18 + 0.03 * lv, 1.9, C.crop);
        house(0.95, -0.85, 1, 0.8, 0.75 * hm, C.wood, C.thatch, 0); fence(2.9, 2.9); break;
      }
      case 'kraeuter': ground(C.dirt); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) add('sph', -0.55 + i * 0.55, 0.04, -0.55 + j * 0.55, 0.36, 0.3, 0.36, j % 2 ? C.herbc : C.green); fence(1.9, 1.9); break;
      case 'apotheke': ground(C.dstone); house(0, 0, 1.5, 1.3, 1.1 * hm, C.stone, C.slate, 0); add('cyl', 0.5, 1.1 * hm, -0.3, 0.22, 0.9, 0.22, C.dstone); add('sph', -0.55, 0.06, 0.75, 0.22, 0.25, 0.22, '#6ad07a', 0, true); break;
      case 'heilstube': ground(C.dirt); house(0, 0, 1.6, 1.3, 1 * hm, C.cloth, C.roof, 0); flag(0.75, 0.6, 1.6, '#5aa05a'); break;
      case 'lazarett': ground(C.dstone); house(0, -0.2, 2.6, 1.1, 1.1 * hm, C.cloth, C.slate, 0); add('pyr', -0.8, 0.06, 0.6, 0.8, 0.7, 0.6, C.cloth); add('pyr', 0.1, 0.06, 0.65, 0.8, 0.7, 0.6, C.cloth); flag(1.15, 0.7, 1.8, '#5aa05a'); break;
      case 'quarantaene': ground(C.dirt); add('pyr', -0.3, 0.06, -0.2, 1.1, 0.95, 1.1, '#c8c0a0'); for (let k = 0; k < 6; k++) add('box', -0.9 + k * 0.36, 0, 0.88, 0.18, 0.28, 0.06, k % 2 ? C.black : '#d8b030'); flag(0.75, -0.75, 1.5, '#d8b030'); break;
      case 'saege': ground(C.dirt); add('box', 0, 0, -0.3, 1.6, 0.9 * hm, 0.9, C.wood); add('prism', 0, 0.9 * hm, -0.3, 1.7, 0.4, 1.0, C.thatch); for (let k = 0; k < 3; k++) add('cyl', -0.4, 0.06 + k * 0.18, 0.55, 0.16, 1.2, 0.16, '#a07a50', 0); P.slice(-3).forEach(p => { p.rz = Math.PI / 2; p.x = 0.6; }); break;
      case 'steinbruch': ground('#5a5650'); add('box', -0.4, 0, -0.3, 0.8, 0.6, 0.7, C.dstone, 0.3); add('box', 0.35, 0, 0.1, 0.7, 0.45, 0.6, C.stone, -0.4); add('box', 0, 0, 0.6, 0.4, 0.3, 0.3, C.stone); add('box', 0.6, 0, -0.6, 0.06, 1.2, 0.06, C.dwood); break;
      case 'mine': ground('#4a4640'); add('sph', 0, -0.3, -0.2, 1.8, 1.4, 1.5, '#5a554e'); add('box', 0, 0, 0.45, 0.6, 0.6, 0.3, C.black); add('box', 0, 0.6, 0.6, 0.8, 0.12, 0.12, C.dwood); add('box', 0.6, 0, 0.7, 0.35, 0.25, 0.25, C.iron); break;
      case 'lager': ground(C.dirt); house(0, -0.1, 1.7, 1.4, 1.1 * hm, C.wood, C.roof, 0, false); add('box', -0.6, 0, 0.75, 0.3, 0.3, 0.3, '#a07a50'); add('box', -0.25, 0, 0.8, 0.28, 0.28, 0.28, '#a07a50'); break;
      case 'markt': { ground(C.dstone); const aw = ['#b8393a', '#d6a637', '#5a7fc9', '#4fb38a']; for (let k = 0; k < 4; k++) { const x = -1 + (k % 2) * 2 * 0.95 + (k > 1 ? 0.3 : 0), z = k < 2 ? -0.35 : 0.45; add('box', x * 0.7, 0, z, 0.7, 0.45, 0.45, C.wood); add('prism', x * 0.7, 0.75, z, 0.8, 0.25, 0.6, aw[k]); add('box', x * 0.7 - 0.3, 0, z + 0.2, 0.04, 0.75, 0.04, C.dwood); } break; }
      case 'akademie': ground(C.dstone); add('box', 0, 0.06, 0, 2.4, 1.3 * hm, 2, C.plaster); add('cyl', 0, 1.3 * hm, 0, 1.3, 0.4, 1.3, C.stone); add('sph', 0, 1.5 * hm, 0, 1.2, 1, 1.2, C.blue); [-0.8, -0.27, 0.27, 0.8].forEach(x => add('cyl', x, 0.06, 1.05, 0.16, 1.2 * hm, 0.16, C.cloth)); add('box', 0, 0.6, 1.01, 0.3, 0.3, 0.04, C.glow, 0, true); break;
      case 'schmiede': ground(C.dstone); house(-0.2, -0.2, 1.3, 1.2, 0.9 * hm, C.stone, C.slate, 0); add('cyl', 0.55, 0, -0.55, 0.3, 1.9 * hm, 0.3, C.dstone); add('box', 0.5, 0, 0.6, 0.4, 0.3, 0.25, C.iron); add('sph', 0.15, 0.05, 0.6, 0.2, 0.15, 0.2, C.fire, 0, true); break;
      case 'kaserne': ground(C.dirt); house(0, -0.25, 2.6, 1.1, 1 * hm, C.wood, C.roof, 0); flag(-1.2, 0.65, 2.2, C.red); flag(1.2, 0.65, 2.2, C.red); break;
      case 'schiessplatz': ground(C.dirt); house(0, -1, 1.6, 0.8, 0.8 * hm, C.wood, C.thatch, 0, false); [-0.5, 0.5].forEach(x => { add('cyl', x, 0.5, 1.1, 0.6, 0.08, 0.6, '#d8c890'); P[P.length - 1].rx = Math.PI / 2; add('box', x, 0, 1.12, 0.06, 0.5, 0.06, C.dwood); }); break;
      case 'stall': ground(C.thatch); house(0, -0.35, 2.4, 1, 0.9 * hm, C.dwood, C.thatch, 0); fence(2.8, 1.9); add('box', 0.6, 0, 0.5, 0.6, 0.35, 0.18, '#6a4a30'); add('box', 0.85, 0.3, 0.5, 0.2, 0.22, 0.14, '#6a4a30'); break;
      case 'heldengilde': ground(C.dstone); house(0, -0.2, 2.6, 1.2, 1.3 * hm, C.stone, C.roof, 0); add('box', -1, 0.06, 0.5, 0.5, 2.2 * hm, 0.5, C.stone); add('pyr', -1, 2.2 * hm + 0.06, 0.5, 0.6, 0.8, 0.6, C.roof); flag(1.1, 0.7, 2.4, C.gold); break;
      case 'turm_pfeil': { const h = 2.2 + 0.18 * lv; [-.3, .3].forEach(x => [-.3, .3].forEach(z => add('box', x, 0, z, 0.1, h, 0.1, C.wood))); add('box', 0, h, 0, 0.95, 0.12, 0.95, C.dwood); add('box', 0, h + 0.12, 0, 0.9, 0.3, 0.9, C.wood); add('pyr', 0, h + 0.55, 0, 1, 0.6, 1, lv >= 5 ? C.slate : C.thatch); break; }
      case 'turm_balliste': { const h = 2 + 0.15 * lv; add('cyl', 0, 0, 0, 0.95, h, 0.95, C.stone); add('cyl', 0, h, 0, 1.05, 0.25, 1.05, C.dstone); add('box', 0, h + 0.25, 0, 0.7, 0.12, 0.14, C.dwood); add('box', 0, h + 0.25, 0, 0.12, 0.12, 0.8, C.dwood); break; }
      case 'turm_feuer': { const h = 1.4 + 0.12 * lv; add('cyl', 0, 0, 0, 0.8, h, 0.8, C.dstone); add('cyl', 0, h, 0, 0.95, 0.3, 0.95, C.iron); add('cone', 0, h + 0.25, 0, 0.6, 0.6, 0.6, C.fire, 0, true); break; }
      case 'turm_rauch': { const h = 1.8 + 0.12 * lv; add('cyl6', 0, 0, 0, 0.85, h, 0.85, C.stone); add('cyl', 0, h, 0, 0.5, 0.5, 0.5, C.iron); add('sph', 0, h + 0.4, 0, 0.6, 0.5, 0.6, '#9ac06a', 0, true); break; }
      case 'kundschafter': ground(C.dirt); { const h = 3 + 0.25 * lv; add('box', 0, 0, 0, 0.5, h, 0.5, C.wood); add('box', 0, h, 0, 1, 0.12, 1, C.dwood); add('pyr', 0, h + 0.4, 0, 1, 0.5, 1, C.thatch); flag(0.45, 0.45, h + 1.2, C.blue); } break;
      case 'diplomatie': ground(C.dstone); add('box', 0, 0.06, -0.1, 2.5, 1.2 * hm, 1.4, C.cloth); add('prism', 0, 1.26 * hm, -0.1, 2.6, 0.7, 1.5, '#4a7aa8'); [-0.9, -0.3, 0.3, 0.9].forEach(x => add('cyl', x, 0.06, 0.7, 0.14, 1.1 * hm, 0.14, C.plaster)); flag(1.15, 0.75, 2.2, '#f1e8d4'); break;
      case 'handel': ground(C.thatch); add('pyr', -0.2, 0.06, -0.2, 1.4, 1.1, 1.4, '#c8a060'); add('box', 0.6, 0.06, 0.55, 0.35, 0.35, 0.35, '#a07a50'); add('box', 0.25, 0.06, 0.65, 0.3, 0.3, 0.3, '#8a6a44'); break;
      case 'kommando': ground(C.dirt); add('pyr', 0, 0.06, -0.15, 1.5, 1.2, 1.3, '#8a7a5a'); flag(0.65, 0.6, 2.4 + 0.1 * lv, C.red); add('box', -0.55, 0.06, 0.6, 0.6, 0.35, 0.4, C.wood); break;
      case 'gedenk': ground(C.dstone); add('box', 0, 0.06, 0, 1.2, 0.25, 0.8, C.stone); add('box', 0, 0.3, -0.1, 0.5, 1.2, 0.2, C.dstone); [-0.4, -0.15, 0.15, 0.4].forEach(x => { add('cyl', x, 0.3, 0.25, 0.06, 0.18, 0.06, C.cloth); add('sph', x, 0.48, 0.25, 0.06, 0.08, 0.06, C.glow, 0, true); }); tree(-0.7, -0.6, 0.8); break;
      case 'weg': add('box', 0, 0, 0, 1, 0.04, 1, '#7a7268'); break;
      case 'laterne': add('cyl', 0, 0, 0, 0.08, 1.3, 0.08, C.iron); add('box', 0, 1.3, 0, 0.22, 0.26, 0.22, C.glow, 0, true); add('pyr', 0, 1.56, 0, 0.3, 0.15, 0.3, C.iron); break;
      case 'garten': add('box', 0, 0, 0, 0.95, 0.05, 0.95, '#4a6a32'); tree(0, 0, 1.1); add('sph', 0.32, 0.05, 0.3, 0.15, 0.15, 0.15, '#d870a0'); add('sph', -0.3, 0.05, 0.32, 0.15, 0.15, 0.15, '#e0d060'); break;
      case 'statue': add('box', 0, 0, 0, 0.7, 0.4, 0.7, C.stone); add('cyl', 0, 0.4, 0, 0.3, 0.8, 0.3, '#a8a49a'); add('sph', 0, 1.15, 0, 0.26, 0.28, 0.26, '#a8a49a'); add('box', 0.18, 0.5, 0, 0.06, 1.1, 0.06, '#a8a49a'); break;
      default: add('box', 0, 0, 0, w * 0.8, 1, d * 0.8, C.plaster);
    }
    // Stufenschmuck: Fundament ab 3, goldene Fahne ab 6
    if (PW.BLD[t] && PW.BLD[t].max > 1 && !PW.BLD[t].tower && t !== 'hq') {
      if (lv >= 6) flag(w / 2 - 0.2, -d / 2 + 0.2, 1.8 + 0.1 * lv, C.gold);
    }
    // Drehung um 90°: Teile tauschen x/z
    if (rot) P.forEach(p => { const x = p.x; p.x = p.z; p.z = -x; p.ry = (p.ry || 0) + Math.PI / 2; });
    return P;
  }
  const geoCache = {};
  function bldGeo(t, lv, rot, w, d) {
    const key = t + ':' + Math.min(lv, 10) + ':' + (rot ? 1 : 0);
    if (geoCache[key]) return geoCache[key];
    const P = design(t, w, d, Math.max(1, lv), rot);
    return (geoCache[key] = { g: merge(P.filter(p => !p.glow)), glow: merge(P.filter(p => p.glow)) });
  }
  R.bldGeo = bldGeo;

  // ---------- Initialisierung ----------
  R.init = function (container, q) {
    T = root.THREE; if (!T) return false;
    quality = q || 'auto';
    try {
      renderer = new T.WebGLRenderer({ antialias: quality === 'hoch' || (quality === 'auto' && (root.devicePixelRatio || 1) < 2), powerPreference: 'high-performance' });
    } catch (e) { return false; }
    pr = Math.min(root.devicePixelRatio || 1, quality === 'niedrig' ? 1 : 2);
    renderer.setPixelRatio(pr);
    renderer.shadowMap.enabled = quality === 'hoch'; renderer.shadowMap.type = T.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('tabindex', '0');
    scene = new T.Scene(); scene.background = new T.Color('#1a1712'); scene.fog = new T.Fog('#1a1712', 60, 140);
    cam = new T.PerspectiveCamera(45, 1, 0.5, 400);
    hemi = new T.HemisphereLight(0xc4ccd0, 0x342c20, 0.75); scene.add(hemi);
    sun = new T.DirectionalLight(0xfff0d0, 0.9); sun.position.set(20, 40, 10); scene.add(sun); scene.add(sun.target);
    if (renderer.shadowMap.enabled) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.far = 120; }
    basicGeos(); mats();
    ['city', 'world', 'battle'].forEach(k => { groups[k] = new T.Group(); groups[k].visible = k === 'city'; scene.add(groups[k]); });
    initParticles();
    R.ok = true; R.resize();
    return true;
  };
  R.canvas = () => renderer && renderer.domElement;
  R.resize = function () {
    if (!renderer) return;
    const el = renderer.domElement.parentNode; W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
    renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
  };
  R.setQuality = function (q) { quality = q; pr = Math.min(root.devicePixelRatio || 1, q === 'niedrig' ? 1 : 2); if (renderer) { renderer.setPixelRatio(pr); R.resize(); } };
  R.setMode = function (m) {
    R.mode = m; Object.keys(groups).forEach(k => { groups[k].visible = k === m; });
    clearParticles();
  };
  function placeCam() {
    const r = rigs[R.mode];
    r.dist = PW.clamp(r.dist, r.min, r.max); r.pitch = PW.clamp(r.pitch, 0.45, 1.45);
    const cp = Math.cos(r.pitch), sp = Math.sin(r.pitch);
    cam.position.set(r.tx + Math.sin(r.yaw) * cp * r.dist, sp * r.dist, r.tz + Math.cos(r.yaw) * cp * r.dist);
    cam.lookAt(r.tx, 0, r.tz);
    sun.position.set(r.tx + 18, 40, r.tz + 8); sun.target.position.set(r.tx, 0, r.tz);
  }
  // Kamera bewegen (Bildschirm-Richtung → Boden)
  R.pan = function (dx, dy) {
    R.userCam = performance.now();
    const r = rigs[R.mode], k = r.dist / 600;
    const cx = Math.cos(r.yaw), sx = Math.sin(r.yaw);
    r.tx -= (dx * cx + dy * sx) * k; r.tz -= (-dx * sx + dy * cx) * k;
    clampTarget();
  };
  R.rotate = function (da, dp) { const r = rigs[R.mode]; r.yaw += da; if (dp) r.pitch += dp; };
  R.zoom = function (f) { const r = rigs[R.mode]; r.dist *= f; r.dist = PW.clamp(r.dist, r.min, r.max); };
  R.focus = function (x, z, dist) { const r = rigs[R.mode]; r.tx = x; r.tz = z; if (dist) r.dist = dist; clampTarget(); };
  function clampTarget() {
    const r = rigs[R.mode];
    if (R.mode === 'city') { r.tx = PW.clamp(r.tx, -10, 40); r.tz = PW.clamp(r.tz, -6, 44); }
    else if (R.mode === 'world' && R._wb) { r.tx = PW.clamp(r.tx, -2, R._wb[0] + 2); r.tz = PW.clamp(r.tz, -2, R._wb[1] + 2); }
    else if (R.mode === 'battle') { r.tx = PW.clamp(r.tx, -30, 30); r.tz = PW.clamp(r.tz, -25, 25); }
  }

  // Strahl vom Bildschirm auf den Boden
  const ray = () => R._ray || (R._ray = new T.Raycaster());
  function ndc(cx, cy) { const rc = renderer.domElement.getBoundingClientRect(); return new T.Vector2((cx - rc.left) / rc.width * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1); }
  R.ground = function (cx, cy, y) {
    const rc = ray(); rc.setFromCamera(ndc(cx, cy), cam);
    const pl = new T.Plane(new T.Vector3(0, 1, 0), -(y || 0)), out = new T.Vector3();
    return rc.ray.intersectPlane(pl, out) ? { x: out.x, z: out.z } : null;
  };
  R.pickTile = function (cx, cy) {
    if (!world.hex) return -1;
    const rc = ray(); rc.setFromCamera(ndc(cx, cy), cam);
    const hit = rc.intersectObject(world.hex, false)[0];
    return hit && hit.instanceId != null ? hit.instanceId : -1;
  };
  R.project = function (x, y, z) { const v = new T.Vector3(x, y, z).project(cam); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, vis: v.z < 1 }; };

  // ---------- Partikel ----------
  const PN = 500; let pts = null, pPos, pCol, parts = [];
  function initParticles() {
    const g = new T.BufferGeometry(); pPos = new Float32Array(PN * 3); pCol = new Float32Array(PN * 3);
    for (let i = 0; i < PN; i++) pPos[i * 3 + 1] = -999;
    g.setAttribute('position', new T.BufferAttribute(pPos, 3)); g.setAttribute('color', new T.BufferAttribute(pCol, 3));
    pts = new T.Points(g, new T.PointsMaterial({ size: 0.55, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }));
    pts.frustumCulled = false; scene.add(pts);
    for (let i = 0; i < PN; i++) parts.push({ life: 0 });
  }
  let pNext = 0;
  function emit(x, y, z, c, n, spread, up, life) {
    if (R.low && n > 2) n = Math.ceil(n / 2);
    const cc = color(c);
    for (let k = 0; k < n; k++) {
      const p = parts[pNext]; pNext = (pNext + 1) % PN;
      p.x = x + (Math.random() - 0.5) * spread; p.y = y; p.z = z + (Math.random() - 0.5) * spread;
      p.vx = (Math.random() - 0.5) * spread; p.vy = up * (0.6 + Math.random() * 0.6); p.vz = (Math.random() - 0.5) * spread;
      p.life = p.max = life * (0.7 + Math.random() * 0.6); p.r = cc.r; p.g = cc.g; p.b = cc.b;
    }
  }
  R.emit = emit;
  function clearParticles() { parts.forEach(p => { p.life = 0; }); }
  function stepParticles(dt) {
    for (let i = 0; i < PN; i++) {
      const p = parts[i];
      if (p.life <= 0) { pPos[i * 3 + 1] = -999; continue; }
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy *= 0.98;
      const a = Math.max(0, p.life / p.max);
      pPos[i * 3] = p.x; pPos[i * 3 + 1] = p.y; pPos[i * 3 + 2] = p.z;
      pCol[i * 3] = p.r * a + 0.1 * (1 - a); pCol[i * 3 + 1] = p.g * a + 0.1 * (1 - a); pCol[i * 3 + 2] = p.b * a + 0.1 * (1 - a);
    }
    pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.color.needsUpdate = true;
  }

  // ---------- Zuflucht ----------
  const city = { meshes: new Map(), built: false };
  function inst(geo, max, mat) {
    const m = new T.InstancedMesh(geo, mat || MAT.inst, max); m.frustumCulled = false;
    const w = new T.Color(1, 1, 1); for (let i = 0; i < max; i++) m.setColorAt(i, w);   // vor count = 0 (setColorAt reserviert count×3)
    m.count = 0;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage);
    return m;
  }
  // ---------- Figuren (Low-Poly mit Gliedern) ----------
  // Jede Figur besteht aus zwei Teilen: „B“ (feste Farben) und „Tm“ (weiß, wird je Instanz eingefärbt: Wappenfarbe, Kleidung, Heldenfarbe).
  // Blickrichtung +z, Füße bei y = 0, Größe eines Menschen ≈ 1,05.
  const SKIN = '#d9b48f', IRON = '#8c939c', DIRON = '#5c636c', LEATH = '#6a4a30', DLEATH = '#3e2c1e', WOODC = '#7a5a36';
  function pt(L, s, x, y, z, sx, sy, sz, c, rx, ry, rz) { L.push({ s, x, y, z, sx, sy, sz, c, rx: rx || 0, ry: ry || 0, rz: rz || 0 }); }
  // Arm von der Schulter aus: a = Neigung nach vorn (0 = hängt, PI/2 = waagrecht nach vorn), sp = seitliches Abspreizen
  function arm(L, side, sy, a, sp, c, hand, len) {
    len = len || 0.3; const rx = Math.PI - a, rz = -side * (sp == null ? 0.12 : sp);
    pt(L, 'box', 0.205 * side, sy, 0, 0.085, len, 0.09, c, rx, 0, rz);
    // Hand am Armende (Richtung: Drehung von −y um x mit a)
    const hx = 0.205 * side - Math.sin(rz) * len, hy = sy - Math.cos(a) * Math.cos(rz) * len, hz = Math.sin(a) * Math.cos(rz) * len;
    pt(L, 'sph', hx, hy - 0.05, hz, 0.09, 0.09, 0.09, hand || SKIN);
    return [hx, hy, hz];
  }
  // Grundkörper; o: pants, boots, torso, torsoTeam, tabard, belt, skin, hunch, sit, armL, armR, sleeve
  function human(B, Tm, o) {
    o = o || {}; const y0 = o.sit ? 0.55 : 0, skin = o.skin || SKIN, hunch = o.hunch || 0;
    if (!o.sit && !o.robe) {
      for (const k of [-1, 1]) {
        pt(B, 'box', 0.08 * k, 0.07, 0, 0.11, 0.36, 0.13, o.pants || '#4a4034');
        pt(B, 'box', 0.08 * k, 0, 0.025, 0.125, 0.09, 0.19, o.boots || '#2e2620');
      }
    } else if (o.robe) {
      pt(o.robeTeam ? Tm : B, 'frus', 0, 0, 0, 0.42, 0.46, 0.38, o.robe);
    } else {
      // sitzend: Oberschenkel nach vorn, Unterschenkel hängen seitlich am Pferd
      for (const k of [-1, 1]) { pt(B, 'box', 0.17 * k, y0 + 0.02, -0.02, 0.1, 0.11, 0.3, o.pants || '#4a4034'); pt(B, 'box', 0.2 * k, y0 - 0.3, 0.1, 0.1, 0.34, 0.11, o.boots || '#2e2620'); }
    }
    const ty = o.sit ? y0 + 0.1 : y0 + 0.42;
    // Rumpf, darüber Wappenrock (sichtbar vorn und hinten)
    pt(B, 'box', 0, ty, 0, 0.32, 0.34, 0.2, o.torso || '#5a4a3a', hunch);
    if (o.tabard !== false) pt(Tm, 'box', 0, ty - 0.04, hunch * 0.15, 0.25, 0.36, 0.215, '#ffffff', hunch);
    pt(B, 'box', 0, ty + 0.01, hunch * 0.02, 0.335, 0.055, 0.225, o.belt || DLEATH, hunch);
    const sy = ty + 0.32, hz = hunch * 0.3;
    // Schultern
    if (o.pauldron) for (const k of [-1, 1]) pt(o.pauldronTeam ? Tm : B, 'sph', 0.19 * k, sy - 0.08, hz * 0.6, 0.17, 0.13, 0.17, o.pauldron);
    // Hals und Kopf
    pt(B, 'cyl', 0, sy - 0.01, hz, 0.09, 0.05, 0.09, skin);
    pt(B, 'sph', 0, sy + 0.02, hz + 0.01, 0.22, 0.23, 0.22, skin);
    const H = [0, sy + 0.02, hz + 0.01];   // Kopfunterkante
    const sl = o.sleeve || o.torso || '#5a4a3a';
    const r = arm(B, 1, sy - 0.02, o.armR != null ? o.armR : 0.25, o.spR, sl, o.handR);
    const l = arm(B, -1, sy - 0.02, o.armL != null ? o.armL : 0.25, o.spL, sl, o.handL);
    return { head: H, r, l, ty, sy };
  }
  // Kopfbedeckungen
  function helmKettle(L, H, c) { pt(L, 'sph', H[0], H[1] + 0.1, H[2], 0.25, 0.2, 0.25, c || IRON); pt(L, 'cyl', H[0], H[1] + 0.13, H[2], 0.38, 0.025, 0.38, c || IRON); }
  function helmFull(L, H, c) { pt(L, 'cyl', H[0], H[1] + 0.01, H[2], 0.245, 0.2, 0.245, c || IRON); pt(L, 'sph', H[0], H[1] + 0.11, H[2], 0.245, 0.2, 0.245, c || IRON); pt(L, 'box', H[0], H[1] + 0.1, H[2] + 0.115, 0.17, 0.025, 0.02, '#1c1c20'); }
  function hood(L, H, c) { pt(L, 'sph', H[0], H[1] - 0.005, H[2] - 0.01, 0.26, 0.27, 0.26, c); pt(L, 'cone', H[0], H[1] + 0.15, H[2] - 0.03, 0.2, 0.18, 0.2, c, -0.35); }
  function brim(L, H, c, w) { pt(L, 'cyl', H[0], H[1] + 0.14, H[2], w || 0.46, 0.025, w || 0.46, c); pt(L, 'cyl', H[0], H[1] + 0.15, H[2], 0.2, 0.13, 0.2, c); }
  function plume(L, H, c) { pt(L, 'cone', H[0], H[1] + 0.22, H[2] - 0.04, 0.06, 0.2, 0.12, c, -0.5); }

  function unitModel(kind) {
    const B = [], Tm = [];
    switch (kind) {
      case 'civ': { const h = human(B, Tm, { torso: '#cfc6b0', pants: '#5a4a38', armR: 0.15, armL: 0.15, sleeve: '#cfc6b0' }); pt(B, 'sph', h.head[0], h.head[1] + 0.13, h.head[2] - 0.01, 0.23, 0.12, 0.23, '#6a4a2a'); break; }
      case 'spear': {
        const h = human(B, Tm, { torso: '#5c5a58', pants: '#4a4238', pauldron: IRON, armR: 0.55, armL: 0.9 });
        helmKettle(B, h.head);
        pt(B, 'cyl', h.r[0] + 0.02, -0.05, h.r[2] - 0.12, 0.035, 1.75, 0.035, WOODC, 0.12);
        pt(B, 'cone', h.r[0] + 0.02, 1.68, h.r[2] + 0.09, 0.07, 0.2, 0.07, IRON, 0.12);
        pt(Tm, 'box', h.l[0] - 0.06, h.l[1] - 0.24, h.l[2] + 0.04, 0.05, 0.42, 0.32, '#ffffff', 0, 0.6, 0);      // Schild
        pt(B, 'sph', h.l[0] - 0.09, h.l[1] - 0.06, h.l[2] + 0.04, 0.06, 0.08, 0.08, DIRON);
        break;
      }
      case 'bow': {
        const h = human(B, Tm, { torso: '#6a5a40', pants: '#4a4034', armR: 1.25, armL: 1.45, spR: 0.35, spL: -0.15 });
        hood(Tm, h.head, '#ffffff');
        const cy = h.sy - 0.1;
        pt(B, 'box', 0.03, cy, 0.08, 0.06, 0.06, 0.46, WOODC);                       // Schaft
        pt(B, 'box', 0.03, cy - 0.015, 0.31, 0.46, 0.035, 0.05, DLEATH, 0, 0, 0);    // Bogen
        pt(B, 'box', 0.03, cy + 0.03, 0.2, 0.02, 0.02, 0.2, '#d8d0b0');              // Bolzen
        pt(B, 'cyl', -0.1, h.ty + 0.05, -0.13, 0.1, 0.32, 0.1, LEATH, -0.25);          // Köcher
        for (let k = 0; k < 3; k++) pt(B, 'box', -0.13 + k * 0.03, h.ty + 0.36, -0.2, 0.015, 0.1, 0.015, '#e0d8c0', -0.25);
        break;
      }
      case 'medic': {
        const h = human(B, Tm, { robe: '#2a2a2e', torso: '#2a2a2e', tabard: false, sleeve: '#2a2a2e', armR: 0.5, armL: 0.35, handR: '#3a3a3e', handL: '#3a3a3e' });
        brim(B, h.head, '#1e1e22', 0.5);
        pt(B, 'cone', h.head[0], h.head[1] + 0.07, h.head[2] + 0.08, 0.08, 0.26, 0.08, '#e8e0cc', Math.PI / 2 + 0.25);   // Schnabelmaske
        pt(B, 'sph', h.head[0] + 0.05, h.head[1] + 0.1, h.head[2] + 0.1, 0.05, 0.05, 0.03, '#a0c0d0'); pt(B, 'sph', h.head[0] - 0.05, h.head[1] + 0.1, h.head[2] + 0.1, 0.05, 0.05, 0.03, '#a0c0d0');
        pt(Tm, 'box', 0, h.ty + 0.12, 0.0, 0.34, 0.06, 0.225, '#ffffff', 0, 0, 0.6);   // Schärpe
        pt(B, 'cyl', h.r[0] + 0.02, -0.02, h.r[2], 0.035, 1.2, 0.035, WOODC);          // Stab
        pt(B, 'box', h.l[0] - 0.02, h.l[1] - 0.28, h.l[2] + 0.02, 0.16, 0.15, 0.1, LEATH);  // Tasche
        pt(B, 'box', h.l[0] - 0.02, h.l[1] - 0.22, h.l[2] + 0.075, 0.08, 0.025, 0.01, '#e0e0e0'); pt(B, 'box', h.l[0] - 0.02, h.l[1] - 0.25, h.l[2] + 0.075, 0.025, 0.08, 0.01, '#e0e0e0');
        break;
      }
      case 'hunter': {
        const h = human(B, Tm, { torso: '#3a3230', pants: '#2e2a28', pauldron: DLEATH, armR: 0.8, armL: 0.8, spR: 0.3, spL: 0.3 });
        brim(B, h.head, '#2a2420', 0.42);
        pt(B, 'box', h.head[0], h.head[1] + 0.04, h.head[2] + 0.08, 0.2, 0.08, 0.08, '#4a4440');        // Tuch vor dem Mund
        pt(Tm, 'box', 0, 0.35, -0.13, 0.34, 0.6, 0.03, '#ffffff', 0.12);                                 // Umhang
        for (const hd of [h.r, h.l]) { pt(B, 'box', hd[0], hd[1] - 0.06, hd[2] + 0.05, 0.03, 0.04, 0.42, '#c8ccd2', -0.2); pt(B, 'box', hd[0], hd[1] - 0.06, hd[2] + 0.02, 0.1, 0.03, 0.03, DIRON); }
        pt(B, 'sph', -0.14, h.ty + 0.02, 0.1, 0.07, 0.07, 0.07, '#8aa04a');     // Räucherkugel am Gürtel
        break;
      }
      case 'rider': {
        // Pferd
        const hc = '#6a4a32', hd = '#3e2a1e';
        pt(B, 'box', 0, 0.5, -0.02, 0.34, 0.36, 0.86, hc);
        pt(B, 'sph', 0, 0.48, 0.32, 0.36, 0.4, 0.34, hc); pt(B, 'sph', 0, 0.5, -0.36, 0.36, 0.38, 0.32, hc);
        for (const x of [-0.12, 0.12]) for (const z of [-0.34, 0.3]) { pt(B, 'box', x, 0.08, z, 0.09, 0.46, 0.1, hc); pt(B, 'box', x, 0, z + 0.01, 0.1, 0.09, 0.12, hd); }
        pt(B, 'box', 0, 0.68, 0.36, 0.17, 0.44, 0.2, hc, 0.55);
        pt(B, 'box', 0, 1.02, 0.56, 0.15, 0.15, 0.36, hc, 0.35);
        pt(B, 'box', 0, 0.98, 0.42, 0.04, 0.12, 0.3, hd, 0.55);      // Mähne
        for (const k of [-1, 1]) pt(B, 'cone', 0.05 * k, 1.13, 0.47, 0.04, 0.09, 0.04, hc);
        pt(B, 'box', 0, 0.45, -0.46, 0.06, 0.38, 0.07, hd, -0.4);   // Schweif
        pt(Tm, 'box', 0, 0.62, -0.02, 0.4, 0.26, 0.5, '#ffffff');   // Schabracke
        pt(B, 'box', 0, 0.86, -0.05, 0.28, 0.06, 0.3, LEATH);       // Sattel
        // Reiter
        const B2 = [], T2 = [];
        const h = human(B2, T2, { sit: true, torso: '#5c5a58', pants: '#4a4238', boots: '#2e2620', pauldron: IRON, armR: 1.25, armL: 0.7 });
        B2.forEach(p => { p.y += 0.36; p.z -= 0.06; B.push(p); }); T2.forEach(p => { p.y += 0.36; p.z -= 0.06; Tm.push(p); });
        const H = [h.head[0], h.head[1] + 0.36, h.head[2] - 0.06];
        helmFull(B, H); plume(Tm, H, '#ffffff');
        pt(B, 'cyl', h.r[0] + 0.02, h.r[1] + 0.31, h.r[2] - 0.66, 0.04, 1.7, 0.04, WOODC, Math.PI / 2 - 0.12);   // Lanze
        pt(B, 'cone', h.r[0] + 0.02, h.r[1] + 0.51, h.r[2] + 1.03, 0.07, 0.18, 0.07, IRON, Math.PI / 2 - 0.12);
        break;
      }
      case 'ram': {
        for (const x of [-0.42, 0.52]) for (const z of [-0.5, 0.5]) pt(B, 'cyl', x, 0.22, z, 0.44, 0.1, 0.44, DLEATH, 0, 0, Math.PI / 2);
        pt(B, 'box', 0, 0.2, 0, 0.82, 0.08, 1.4, WOODC);
        for (const x of [-0.36, 0.36]) for (const z of [-0.6, 0.6]) pt(B, 'box', x, 0.24, z, 0.08, 0.72, 0.08, WOODC);
        pt(Tm, 'prism', 0, 0.92, 0, 1.5, 0.46, 0.98, '#ffffff', 0, Math.PI / 2, 0);   // Häute-Dach
        pt(B, 'cyl', 0, 0.52, -0.75, 0.24, 1.65, 0.24, '#6a4a2a', Math.PI / 2);        // Stamm
        for (const z of [-0.4, 0.3]) pt(B, 'cyl', 0, 0.52, z, 0.27, 0.06, 0.27, DIRON, Math.PI / 2);
        pt(B, 'box', 0, 0.38, 0.88, 0.3, 0.28, 0.24, DIRON); pt(B, 'cone', 0, 0.52, 1.1, 0.22, 0.16, 0.22, DIRON, Math.PI / 2);   // Eisenkopf
        pt(B, 'box', 0, 0.75, 0.3, 0.03, 0.18, 0.03, DLEATH); pt(B, 'box', 0, 0.75, -0.3, 0.03, 0.18, 0.03, DLEATH);
        break;
      }
      case 'hero': {
        const h = human(B, Tm, { torso: '#b8bec6', pants: '#7a8088', boots: '#4a4e56', sleeve: '#a8aeb6', pauldron: '#d8b860', armR: 1.9, armL: 0.95, spR: 0.25, handR: '#a8aeb6', handL: '#a8aeb6' });
        helmFull(B, h.head, '#c8ccd2');
        pt(B, 'cyl', h.head[0], h.head[1] + 0.2, h.head[2], 0.26, 0.05, 0.26, '#e0aa45');            // Kronreif
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; pt(B, 'cone', h.head[0] + Math.cos(a) * 0.11, h.head[1] + 0.24, h.head[2] + Math.sin(a) * 0.11, 0.04, 0.07, 0.04, '#e0aa45'); }
        pt(Tm, 'box', 0, 0.12, -0.14, 0.36, 0.72, 0.03, '#ffffff', 0.14);                              // Umhang
        pt(B, 'box', h.r[0], h.r[1] + 0.02, h.r[2] + 0.02, 0.05, 0.62, 0.025, '#e8ecf0', -0.35);       // Schwert erhoben
        pt(B, 'box', h.r[0], h.r[1] - 0.02, h.r[2] + 0.0, 0.16, 0.035, 0.05, '#e0aa45', -0.35);
        pt(Tm, 'cyl', h.l[0] - 0.07, h.l[1] - 0.22, h.l[2] + 0.05, 0.36, 0.05, 0.36, '#ffffff', 0, 0.6, Math.PI / 2);   // Rundschild
        pt(B, 'sph', h.l[0] - 0.12, h.l[1] - 0.04, h.l[2] + 0.05, 0.08, 0.09, 0.09, '#e0aa45');
        break;
      }
    }
    return { b: merge(B), t: Tm.length ? merge(Tm) : null };
  }
  function enemyGeo(type) {
    const P = [], add = (s, x, y, z, sx, sy, sz, c, rx, ry, rz) => pt(P, s, x, y, z, sx, sy, sz, c, rx, ry, rz);
    switch (type) {
      case 'ratte': {
        const f = '#4a3c30', d = '#3a2e24';
        add('sph', 0, 0.04, -0.05, 0.36, 0.28, 0.6, f);
        add('cone', 0, 0.14, 0.18, 0.22, 0.32, 0.2, '#5a4a3a', Math.PI / 2 - 0.15);
        add('sph', 0, 0.12, 0.5, 0.05, 0.05, 0.05, '#d08a8a');
        for (const k of [-1, 1]) { add('sph', 0.08 * k, 0.28, 0.24, 0.1, 0.12, 0.04, '#c88a80'); add('sph', 0.07 * k, 0.21, 0.36, 0.04, 0.04, 0.04, '#e03020'); add('box', 0.12 * k, 0, 0.12, 0.05, 0.08, 0.07, d); add('box', 0.12 * k, 0, -0.2, 0.05, 0.08, 0.07, d); }
        add('box', 0, 0.08, -0.36, 0.035, 0.035, 0.3, '#9a7a6a', 0.25); add('box', 0, 0.02, -0.62, 0.025, 0.025, 0.28, '#9a7a6a', -0.2);
        break;
      }
      case 'gaenger': {
        const B = [], Tm = [];
        const h = human(B, Tm, { torso: '#4f5a44', pants: '#3e4436', boots: '#2a2a22', skin: '#a8b48a', hunch: 0.45, armR: 1.35, armL: 1.2, spR: 0.1, spL: 0.05, sleeve: '#4f5a44', belt: '#3a3a2e', tabard: false });
        B.forEach(p => P.push(p));
        add('box', 0, h.ty + 0.05, 0.03, 0.34, 0.1, 0.23, '#5e6650', 0.45);   // Lumpen
        add('sph', 0.07, h.head[1] + 0.06, h.head[2] + 0.1, 0.06, 0.06, 0.04, '#e8f070'); add('sph', -0.07, h.head[1] + 0.06, h.head[2] + 0.1, 0.06, 0.06, 0.04, '#e8f070');
        add('sph', 0.12, h.ty + 0.22, 0.14, 0.07, 0.07, 0.05, '#8aa040'); add('sph', -0.1, h.ty + 0.1, 0.13, 0.06, 0.06, 0.05, '#9ab048');
        break;
      }
      case 'bandit': {
        const B = [], Tm = [];
        const h = human(B, Tm, { torso: '#6a3a2a', pants: '#3e3428', pauldron: DLEATH, armR: 0.9, armL: 0.6, tabard: false, sleeve: '#5a3424' });
        B.forEach(p => P.push(p));
        hood(P, h.head, '#3a2a20');
        add('box', h.head[0], h.head[1] + 0.04, h.head[2] + 0.09, 0.2, 0.08, 0.06, '#2a201a');
        add('cyl', h.r[0], h.r[1] - 0.35, h.r[2] + 0.02, 0.04, 0.7, 0.04, WOODC, 0.5);                  // Axt
        add('box', h.r[0], h.r[1] + 0.2, h.r[2] + 0.36, 0.03, 0.18, 0.16, '#a8aeb6', 0.5);
        add('cyl', h.l[0] - 0.06, h.l[1] - 0.2, h.l[2] + 0.04, 0.32, 0.05, 0.32, WOODC, 0, 0.6, Math.PI / 2);   // Holzschild
        break;
      }
      case 'bestie': {
        const f = '#3f4a30', d = '#2f3a24';
        add('sph', 0, 0.35, -0.1, 1.1, 0.85, 1.5, f);
        add('sph', 0, 0.7, 0.2, 0.9, 0.7, 0.8, '#47523a');
        add('sph', 0, 0.55, 0.75, 0.55, 0.5, 0.55, '#4f5a3a');
        add('box', 0, 0.42, 0.98, 0.3, 0.22, 0.2, '#5a6448');
        for (const k of [-1, 1]) {
          add('cone', 0.16 * k, 0.48, 1.05, 0.08, 0.32, 0.08, '#e0d8b8', 0.9, 0, -0.25 * k);
          add('sph', 0.17 * k, 0.72, 0.95, 0.08, 0.08, 0.06, '#ff6020');
          add('cyl', 0.38 * k, 0, 0.42, 0.24, 0.45, 0.24, d); add('cyl', 0.38 * k, 0, -0.5, 0.24, 0.45, 0.24, d);
          add('box', 0.38 * k, 0, 0.5, 0.26, 0.06, 0.18, '#1e2418'); add('box', 0.38 * k, 0, -0.42, 0.26, 0.06, 0.18, '#1e2418');
        }
        for (let k = 0; k < 5; k++) add('cone', 0, 0.95 - k * 0.04, 0.35 - k * 0.25, 0.14, 0.28, 0.14, '#2a3020', -0.3);
        add('sph', 0.35, 0.6, -0.1, 0.18, 0.18, 0.14, '#8aa040'); add('sph', -0.3, 0.45, -0.45, 0.14, 0.14, 0.12, '#9ab048');
        break;
      }
      case 'kraehe': {
        add('sph', 0, 0, 0, 0.26, 0.24, 0.48, '#1e1e24');
        add('sph', 0, 0.1, 0.24, 0.2, 0.2, 0.2, '#25252c');
        add('cone', 0, 0.13, 0.32, 0.07, 0.18, 0.07, '#c0a040', Math.PI / 2);
        add('sph', 0.06, 0.18, 0.3, 0.035, 0.035, 0.03, '#ff4020'); add('sph', -0.06, 0.18, 0.3, 0.035, 0.035, 0.03, '#ff4020');
        add('box', 0.32, 0.1, 0, 0.6, 0.03, 0.3, '#2a2a33', 0, 0, 0.3); add('box', -0.32, 0.1, 0, 0.6, 0.03, 0.3, '#2a2a33', 0, 0, -0.3);
        add('box', 0.62, 0.2, -0.04, 0.3, 0.025, 0.24, '#1a1a20', 0, 0.2, 0.15); add('box', -0.62, 0.2, -0.04, 0.3, 0.025, 0.24, '#1a1a20', 0, -0.2, -0.15);
        add('box', 0, 0.06, -0.32, 0.22, 0.025, 0.22, '#1a1a20', -0.15);
        break;
      }
      case 'schwarmfuerst': {
        add('box', 0, 0, 0, 2.2, 0.35, 1.9, '#4a3a2a');
        for (const x of [-1.15, 1.15]) add('cyl', x, 0.2, -1.3, 0.12, 2.6, 0.12, '#5e4630', Math.PI / 2, 0, 0);
        add('sph', 0, 0.3, 0, 1.8, 1.2, 1.8, '#3a2f28');
        add('sph', 0, 1.1, 0.55, 1.0, 0.85, 1.0, '#4a3c30');
        add('cone', 0, 1.45, 1.05, 0.4, 0.55, 0.4, '#5a4a3a', Math.PI / 2 - 0.2);
        for (const k of [-1, 1]) { add('sph', 0.32 * k, 1.85, 0.75, 0.3, 0.34, 0.1, '#c88a80'); add('sph', 0.2 * k, 1.62, 1.12, 0.1, 0.1, 0.08, '#ff3020'); }
        add('cyl', 0, 1.9, 0.5, 0.6, 0.18, 0.6, '#e0aa45');
        for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; add('cone', Math.cos(a) * 0.26, 2.05, 0.5 + Math.sin(a) * 0.26, 0.1, 0.2, 0.1, '#e0aa45'); }
        for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; add('sph', Math.cos(a) * 1.0, 0.25, Math.sin(a) * 0.9, 0.36, 0.28, 0.5, '#4a3c30'); add('box', Math.cos(a) * 1.35, 0.25, Math.sin(a) * 1.2, 0.04, 0.04, 0.5, '#9a7a6a', 0, -a, 0); }
        break;
      }
      case 'faeulnismutter': {
        add('sph', 0, 0, 0, 2, 1.9, 2, '#4f6a3a');
        add('sph', 0, 1.0, 0.1, 1.5, 1.3, 1.4, '#5a7444');
        add('sph', 0, 1.9, 0.35, 0.75, 0.7, 0.75, '#6a7a4a');
        add('sph', 0.15, 2.22, 0.68, 0.12, 0.12, 0.08, '#e8f070'); add('sph', -0.15, 2.22, 0.68, 0.12, 0.12, 0.08, '#e8f070');
        add('sph', 0, 2.0, 0.66, 0.3, 0.12, 0.1, '#2a3020');
        const pus = [[0.8, 0.9, 0.5], [-0.75, 0.6, 0.55], [0.6, 0.3, -0.7], [-0.5, 1.3, -0.4], [0.2, 0.4, 0.95], [-0.9, 0.2, -0.2], [0.95, 0.5, -0.1]];
        pus.forEach(p => add('sph', p[0], p[1], p[2], 0.42, 0.42, 0.42, '#8aa84a'));
        for (const k of [-1, 1]) { add('cyl', 0.9 * k, 1.2, 0.3, 0.3, 1.2, 0.3, '#4a6236', 2.2, 0, -0.5 * k); add('sph', 1.3 * k, 0.55, 1.0, 0.36, 0.3, 0.36, '#4a6236'); }
        break;
      }
      case 'hauptmann': {
        const B = [], Tm = [];
        const h = human(B, Tm, { torso: '#555a66', pants: '#40444e', boots: '#2a2c32', pauldron: '#6a707a', sleeve: '#4a4e58', armR: 1.15, armL: 0.6, handR: '#4a4e58', handL: '#4a4e58', tabard: false, belt: '#7a3a2a' });
        B.forEach(p => P.push(p));
        helmFull(P, h.head, '#6a707a');
        for (const k of [-1, 1]) add('cone', 0.13 * k, h.head[1] + 0.16, h.head[2], 0.06, 0.24, 0.06, '#d8d0b0', 0, 0, -0.7 * k);
        add('box', 0, 0.12, -0.13, 0.4, 0.74, 0.03, '#7a2a24', 0.14);                                 // roter Umhang
        add('box', h.r[0], h.r[1] - 0.02, h.r[2] + 0.06, 0.06, 0.04, 0.9, '#b8bec6', -0.55);           // Zweihänder
        add('box', h.r[0], h.r[1] - 0.04, h.r[2] + 0.02, 0.22, 0.04, 0.05, DIRON, -0.55);
        add('box', h.l[0] - 0.08, h.l[1] - 0.3, h.l[2] + 0.05, 0.06, 0.5, 0.36, '#3a3e46');
        add('box', h.l[0] - 0.115, h.l[1] - 0.18, h.l[2] + 0.05, 0.01, 0.2, 0.06, '#b8393a'); add('box', h.l[0] - 0.115, h.l[1] - 0.12, h.l[2] + 0.05, 0.01, 0.06, 0.2, '#b8393a');
        P.forEach(p => { p.x *= 2.2; p.y *= 2.2; p.z *= 2.2; p.sx *= 2.2; p.sy *= 2.2; p.sz *= 2.2; });
        break;
      }
    }
    return merge(P);
  }
  // Instanz-Paar: feste Farben + einfärbbarer Teil
  function pair(kind, max, g) {
    const m = unitModel(kind), o = { b: inst(m.b, max), t: m.t ? inst(m.t, max) : null, n: 0, max };
    g.add(o.b); if (o.t) g.add(o.t); return o;
  }
  function pairSet(o, m4, c) { if (o.n >= o.max) return; o.b.setMatrixAt(o.n, m4); if (o.t) { o.t.setMatrixAt(o.n, m4); o.t.setColorAt(o.n, c); } o.n++; }
  function pairEnd(o) {
    o.b.count = o.n; o.b.instanceMatrix.needsUpdate = true;
    if (o.t) { o.t.count = o.n; o.t.instanceMatrix.needsUpdate = true; if (o.t.instanceColor) o.t.instanceColor.needsUpdate = true; }
    o.n = 0;
  }
  const TEAM = ['#3f73c8', '#b8392e'], CIVC = ['#8a6a44', '#6a7a4a', '#9a8a6a', '#7a4a3a', '#5a6a8a', '#a08a50'];
  const LANE_N = 4;
  // Wertrauschen für Bodenfarben (deterministisch, ohne Bibliothek)
  function hash2(x, y) { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); }
  function vnoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function noisePlane(w, d, sw, sd, colorAt) {
    const g = new T.PlaneGeometry(w, d, sw, sd); g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position, arr = new Float32Array(pos.count * 3), c = new T.Color();
    for (let i = 0; i < pos.count; i++) { colorAt(pos.getX(i), pos.getZ(i), c); arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new T.BufferAttribute(arr, 3));
    const m = new T.Mesh(g, MAT.v); m.receiveShadow = true; return m;
  }
  // Kleinkram auf freien Feldern (Fässer, Kisten, Heu, Säcke, Gras, Pfützen) – neu, wenn sich die Bebauung ändert
  function rebuildClutter(S) {
    const occ = new Set();
    S.city.b.forEach(b => { for (let x = b.x; x < b.x + (b.w || 1); x++) for (let y = b.y; y < b.y + (b.h || 1); y++) occ.add(x + ',' + y); });
    const P = [], add = (s, x, y, z, sx, sy, sz, c, rx, ry, rz) => P.push({ s, x, y, z, sx, sy, sz, c, rx: rx || 0, ry: ry || 0, rz: rz || 0 });
    for (let x = PW.City.MIN; x <= PW.City.MAX; x++) for (let y = PW.City.MIN; y <= PW.City.MAX; y++) {
      if (occ.has(x + ',' + y) || (x >= 13 && x <= 16 && y >= 15)) continue;
      const h = hash2(x * 3.1, y * 1.7); if (h > 0.12) continue;
      const k = hash2(x + 0.5, y + 9.5), cx = x + 0.3 + hash2(x, y + 3) * 0.4, cz = y + 0.3 + hash2(x + 7, y) * 0.4, ry = k * 6;
      if (k < 0.18) { add('cyl', cx, 0, cz, 0.3, 0.42, 0.3, '#6a4a2c'); add('cyl', cx, 0.1, cz, 0.31, 0.03, 0.31, '#2e2a26'); add('cyl', cx, 0.32, cz, 0.31, 0.03, 0.31, '#2e2a26'); if (k < 0.08) add('cyl', cx + 0.33, 0, cz + 0.1, 0.28, 0.4, 0.28, '#5e4228'); }
      else if (k < 0.34) { add('box', cx, 0, cz, 0.4, 0.34, 0.4, '#7a5e3c', 0, ry); if (k < 0.26) add('box', cx + 0.05, 0.34, cz, 0.3, 0.26, 0.3, '#8a6a44', 0, ry + 0.4); }
      else if (k < 0.46) add('cyl', cx, 0.2, cz, 0.42, 0.5, 0.42, '#a8904c', 0, ry, Math.PI / 2);
      else if (k < 0.58) { add('sph', cx, 0, cz, 0.3, 0.34, 0.26, '#9a8c70', 0, ry); add('sph', cx + 0.22, 0, cz + 0.1, 0.26, 0.3, 0.24, '#8a7c62', 0, ry); }
      else if (k < 0.74) for (let j = 0; j < 4; j++) add('cone', cx + (hash2(x, j) - 0.5) * 0.5, 0, cz + (hash2(j, y) - 0.5) * 0.5, 0.1, 0.26 + 0.12 * hash2(j, x), 0.1, j % 2 ? '#4a5a2a' : '#5a6230');
      else if (k < 0.86) add('cyl', cx, 0.006, cz, 0.7, 0.01, 0.5, '#2a3034', 0, ry);
      else { for (let j = 0; j < 3; j++) add('cyl', cx, 0.08 + j * 0.13, cz, 0.12, 0.6, 0.12, '#6a4e32', 0, ry, Math.PI / 2); add('box', cx, 0, cz, 0.5, 0.04, 0.2, '#3a2e22', 0, ry); }
    }
    if (city.clutter) { groups.city.remove(city.clutter); city.clutter.geometry.dispose(); }
    city.clutter = P.length ? new T.Mesh(merge(P), MAT.v) : null; if (city.clutter) groups.city.add(city.clutter);
  }
  function buildCity() {
    const g = groups.city;
    // Boden: Umland, Innenhof, Torstraße
    const base = new T.Color(), mud = new T.Color('#2e2a1e');
    const outer = noisePlane(130, 130, R.low ? 40 : 80, R.low ? 40 : 80, (x, z, c) => {
      const n = vnoise(x * 0.18, z * 0.18), m = vnoise(x * 0.05 + 7, z * 0.05 + 3);
      c.set(m > 0.62 ? '#3a3a28' : '#363824').offsetHSL(0.02 * (n - 0.5), 0, (n - 0.5) * 0.08);
      if (m < 0.25) c.lerp(mud, 0.45);
    });
    outer.position.set(15, -0.02, 15); g.add(outer);
    const inner = noisePlane(25.6, 25.6, 64, 64, (x, z, c) => {
      const n = vnoise(x * 0.9 + 40, z * 0.9 + 40), p = vnoise(x * 0.25 + 9, z * 0.25 + 1), edge = Math.max(Math.abs(x), Math.abs(z)) / 12.8;
      c.set('#5a4e34').offsetHSL(0, -0.04 * n, (n - 0.5) * 0.1 - 0.08 * edge * edge);
      if (p < 0.18) c.lerp(mud, 0.55);                     // Schlammpfützen
    });
    inner.position.set(15, 0, 15); g.add(inner);
    const street = noisePlane(2.2, 12.6, 9, 50, (x, z, c) => {
      const row = Math.floor(z * 2.6), cx = Math.floor(x * 2.6 + (row % 2) * 0.5), h = hash2(cx, row);
      c.set('#6a655c').offsetHSL(0, 0, (h - 0.5) * 0.12 - ((x * 2.6 + (row % 2) * 0.5) % 1 < 0.12 || (z * 2.6) % 1 < 0.12 ? 0.08 : 0));
    });
    street.position.set(15, 0.012, 21.2); g.add(street);
    // Laternen entlang der Torstraße und am Ratshaus (leuchten nachts)
    city.lamps = [];
    const lp0 = [], lg0 = [];
    [[13.7, 18], [16.3, 21], [13.7, 24], [16.3, 26.6], [12.6, 15.6], [17.4, 15.6], [5, 5], [25, 5], [5, 25], [25, 25]].forEach(([x, z]) => {
      lp0.push({ s: 'cyl', x, y: 0, z, sx: 0.08, sy: 1.6, sz: 0.08, c: '#2a2620' }, { s: 'box', x, y: 1.55, z: z + 0.12, sx: 0.06, sy: 0.06, sz: 0.3, c: '#2a2620' }, { s: 'pyr', x, y: 1.72, z: z + 0.26, sx: 0.24, sy: 0.12, sz: 0.24, c: '#1e1c18' });
      lg0.push({ s: 'box', x, y: 1.5, z: z + 0.26, sx: 0.16, sy: 0.22, sz: 0.16, c: '#ffc860' });
      const h = new T.Sprite(MAT.halo); h.position.set(x, 1.6, z + 0.26); h.scale.set(2.4, 2.4, 1); g.add(h); city.lamps.push(h);
    });
    g.add(new T.Mesh(merge(lp0), MAT.v)); g.add(new T.Mesh(merge(lg0), MAT.glow));
    // Laufwege der Wellen als Trampelpfade, Bäume und Felsen im Umland
    const lp = [];
    PW.Waves.LANES.forEach(l => { for (let k = 0; k < l.pts.length - 1; k++) { const a = l.pts[k], b = l.pts[k + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz); lp.push({ s: 'box', x: (a[0] + b[0]) / 2, y: -0.01, z: (a[1] + b[1]) / 2, sx: 1.6, sy: 0.02, sz: len + 1.2, c: '#5a4a32', ry: Math.atan2(dx, dz) }); } });
    g.add(new T.Mesh(merge(lp), MAT.v));
    const deco = [], rnd = PW.makeRng('umland');
    const nearLane = (x, z) => PW.Waves.LANES.some(l => l.pts.some((p, k) => { if (k === 0) return false; const a = l.pts[k - 1], dx = p[0] - a[0], dz = p[1] - a[1], L = dx * dx + dz * dz, t = PW.clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (L || 1), 0, 1); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz) < 2.6; }));
    for (let k = 0; k < (R.low ? 90 : 170); k++) {
      const x = -30 + rnd() * 90, z = -30 + rnd() * 90;
      if (x > 0 && x < 30 && z > 0 && z < 30.5) continue; if (nearLane(x, z)) continue;
      const s = 0.8 + rnd() * 1.1;
      if (rnd() < 0.8) { deco.push({ s: 'cyl', x, y: 0, z, sx: 0.2 * s, sy: 0.7 * s, sz: 0.2 * s, c: C.dwood }); deco.push({ s: 'cone', x, y: 0.5 * s, z, sx: 1.2 * s, sy: 1.9 * s, sz: 1.2 * s, c: rnd() < 0.5 ? '#2f4a26' : '#3a5a2a' }); }
      else deco.push({ s: 'sph', x, y: -0.2, z, sx: 1.2 * s, sy: 0.8 * s, sz: s, c: '#5a564e' });
    }
    g.add(new T.Mesh(merge(deco), MAT.v));
    // Mauerring (Höhe nach Stufe, wird neu gebaut)
    city.wallG = new T.Group(); g.add(city.wallG); city.wallLv = -1;
    // Tor
    city.gate = new T.Group(); g.add(city.gate);
    const door = merge([{ s: 'box', x: 0, y: 0, z: 0, sx: 0.95, sy: 2, sz: 0.2, c: '#5a3a22' }, { s: 'box', x: 0, y: 0.5, z: 0.11, sx: 0.95, sy: 0.12, sz: 0.04, c: C.iron }, { s: 'box', x: 0, y: 1.4, z: 0.11, sx: 0.95, sy: 0.12, sz: 0.04, c: C.iron }]);
    city.doorL = new T.Mesh(door, MAT.v); city.doorL.position.set(14.5, 0, 27.6); city.gate.add(city.doorL);
    city.doorR = new T.Mesh(door, MAT.v); city.doorR.position.set(15.5, 0, 27.6); city.gate.add(city.doorR);
    // Instanzen: Bewohner, Soldaten, Feinde, Geschosse
    city.walkG = pair('civ', 48, g);
    city.solG = pair('spear', 40, g);
    city.heroG = pair('hero', 12, g);
    city.patG = pair('civ', 8, g);
    city.docG = pair('medic', 2, g);
    city.rat = inst(merge([{ s: 'sph', x: 0, y: 0.06, z: 0, sx: 0.16, sy: 0.12, sz: 0.3, c: '#3a3430' }, { s: 'sph', x: 0, y: 0.08, z: 0.15, sx: 0.1, sy: 0.09, sz: 0.13, c: '#433b36' },
      { s: 'sph', x: 0.04, y: 0.13, z: 0.15, sx: 0.04, sy: 0.05, sz: 0.02, c: '#8a6a66' }, { s: 'sph', x: -0.04, y: 0.13, z: 0.15, sx: 0.04, sy: 0.05, sz: 0.02, c: '#8a6a66' },
      { s: 'box', x: 0, y: 0.04, z: -0.27, sx: 0.025, sy: 0.02, sz: 0.28, c: '#6a5856' }]), 48); g.add(city.rat);
    city.rats = []; city.clutterKey = ''; city.clutter = null;
    city.en = {}; Object.keys(PW.ENEMIES).forEach(k => { city.en[k] = inst(enemyGeo(k), 260); g.add(city.en[k]); });
    city.boss = {}; Object.keys(PW.BOSSES).forEach(k => { const m = new T.Mesh(enemyGeo(k), MAT.v); m.visible = false; city.boss[k] = m; g.add(m); });
    const pg = new T.BoxGeometry(0.12, 0.12, 0.7); city.proj = inst(pg, 300, new T.MeshBasicMaterial({ color: 0xffffff })); g.add(city.proj);
    // Wellenpfade (nur bei Warnung/Angriff sichtbar)
    city.lanes = []; PW.Waves.LANES.forEach(l => { const P = []; for (let k = 0; k < l.pts.length - 1; k++) { const a = l.pts[k], b = l.pts[k + 1], dx = b[0] - a[0], dz = b[1] - a[1]; P.push({ s: 'box', x: (a[0] + b[0]) / 2, y: 0.02, z: (a[1] + b[1]) / 2, sx: 0.5, sy: 0.02, sz: Math.hypot(dx, dz), c: '#ffffff', ry: Math.atan2(dx, dz) }); } const m = new T.Mesh(merge(P), MAT.lane); m.visible = false; g.add(m); city.lanes.push(m); });
    // Bauraster, Auswahl, Geistbild
    city.grid = new T.GridHelper(24, 24, 0xe0aa45, 0x8a7a5a); city.grid.position.set(15, 0.03, 15); city.grid.material.transparent = true; city.grid.material.opacity = 0.35; city.grid.visible = false; g.add(city.grid);
    city.sel = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), MAT.sel); city.sel.visible = false; g.add(city.sel);
    city.range = new T.Mesh(new T.RingGeometry(0.96, 1, 48), new T.MeshBasicMaterial({ color: 0xe0aa45, transparent: true, opacity: 0.6, side: T.DoubleSide, depthWrite: false })); city.range.rotation.x = -Math.PI / 2; city.range.visible = false; g.add(city.range);
    city.ghostBox = new T.Mesh(G.box, MAT.ok); city.ghostBox.visible = false; g.add(city.ghostBox);
    city.ghost = new T.Mesh(G.box, MAT.ghost); city.ghost.visible = false; g.add(city.ghost);
    // Straßen als Instanzen
    city.roads = inst(merge([{ s: 'box', x: 0, y: 0, z: 0, sx: 1, sy: 0.04, sz: 1, c: '#625d55' }, { s: 'box', x: -0.25, y: 0.04, z: -0.2, sx: 0.4, sy: 0.012, sz: 0.36, c: '#6e6960' }, { s: 'box', x: 0.22, y: 0.04, z: 0.24, sx: 0.42, sy: 0.012, sz: 0.34, c: '#57534c' }]), 300); g.add(city.roads);
    city.built = true;
    city.walkers = [];
  }
  function buildWall(lv) {
    const g = city.wallG; while (g.children.length) { const c = g.children.pop(); c.geometry.dispose(); }
    const h = 1.6 + 0.18 * lv, P = [], st = lv >= 4 ? C.stone : lv >= 2 ? '#7a766c' : C.wood, a = 2.3, b = 27.7;
    const seg = (x1, z1, x2, z2) => { const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz); P.push({ s: 'box', x: (x1 + x2) / 2, y: 0, z: (z1 + z2) / 2, sx: 0.7, sy: h, sz: len, c: st, ry: Math.atan2(dx, dz) });
      const n = Math.floor(len / 1.1); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; P.push({ s: 'box', x: x1 + dx * t, y: h, z: z1 + dz * t, sx: 0.75, sy: 0.3, sz: 0.45, c: st, ry: Math.atan2(dx, dz) }); } };
    seg(a, a, b, a); seg(a, a, a, b); seg(b, a, b, b); seg(a, b, 13.8, b); seg(16.2, b, b, b);
    [[a, a], [b, a], [a, b], [b, b], [13.6, b], [16.4, b]].forEach(([x, z], k) => { P.push({ s: k > 3 ? 'box' : 'cyl', x, y: 0, z, sx: 1.3, sy: h + 0.9, sz: 1.3, c: st }); P.push({ s: 'pyr', x, y: h + 0.9, z, sx: 1.5, sy: 0.9, sz: 1.5, c: C.slate }); });
    const m = new T.Mesh(merge(P), MAT.v); m.castShadow = renderer.shadowMap.enabled; g.add(m);
    city.wallLv = lv;
  }
  function bldKey(b) { return b.t + ':' + b.lv + ':' + b.x + ':' + b.y + ':' + b.rot + ':' + (b.st === 'bau' ? 'b' : b.st === 'upg' ? 'u' : '') ; }
  function makeBld(b) {
    const D = PW.BLD[b.t], gg = bldGeo(b.t, Math.max(1, b.lv), b.rot, D.w, D.h), grp = new T.Group();
    const body = new T.Mesh(gg.g, b.st === 'bau' ? MAT.build : MAT.v); body.castShadow = renderer.shadowMap.enabled; grp.add(body);
    if (gg.glow && b.st !== 'bau') grp.add(new T.Mesh(gg.glow, MAT.glow));
    if (b.st === 'bau' || b.st === 'upg') {   // Gerüst
      const w = b.w, d = b.h, h = 1.6, P = [];
      [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(([x, z]) => P.push({ s: 'box', x: x * 0.95, y: 0, z: z * 0.95, sx: 0.07, sy: h, sz: 0.07, c: '#c8a060' }));
      P.push({ s: 'box', x: 0, y: h * 0.55, z: d / 2 * 0.95, sx: w * 0.95, sy: 0.05, sz: 0.07, c: '#c8a060' }); P.push({ s: 'box', x: 0, y: h * 0.55, z: -d / 2 * 0.95, sx: w * 0.95, sy: 0.05, sz: 0.07, c: '#c8a060' });
      const sc = new T.Mesh(merge(P), MAT.v); grp.add(sc); grp.userData.scaffold = sc;
    }
    grp.userData.body = body;
    grp.position.set(b.x + b.w / 2, 0, b.y + b.h / 2);
    return grp;
  }
  function syncCity(S, ui, dt) {
    if (!city.built) buildCity();
    const wl = PW.City.lv(S, 'mauer'); if (wl !== city.wallLv) buildWall(Math.max(1, wl));
    const seen = new Set(); let roads = 0; const m4 = _m();
    // Weg-Zellen + Torstraße gesammelt als Instanzen
    for (const b of S.city.b) {
      if (!b.w) continue;
      if (b.t === 'weg') { if (roads < 300) { m4.makeTranslation(b.x + 0.5, 0, b.y + 0.5); city.roads.setMatrixAt(roads++, m4); } continue; }
      seen.add(b.id);
      const key = bldKey(b); let e = city.meshes.get(b.id);
      if (!e || e.key !== key) { if (e) groups.city.remove(e.obj); e = { key, obj: makeBld(b) }; city.meshes.set(b.id, e); groups.city.add(e.obj); }
      const body = e.obj.userData.body;
      if (b.st === 'bau') { const f = b.tot ? 1 - b.rem / b.tot : 1; body.scale.y = 0.15 + 0.85 * f; }
      else body.scale.y = 1;
      // Rauch bei Schäden, Kaminrauch, Feuer, Seuche
      if (b.lv > 0 && Math.random() < dt * 2) {
        const cx = b.x + b.w / 2, cz = b.y + b.h / 2, hp = b.hp / PW.City.maxHp(b);
        if (hp < 0.5) emit(cx, 1, cz, hp < 0.25 ? '#ff7a2a' : '#555', 2, 0.6, 1.2, 2);
        else if ((b.t === 'schmiede' || b.t === 'apotheke' || b.t === 'haus') && Math.random() < 0.3) emit(cx + 0.4, 1.8, cz - 0.3, '#8a8478', 1, 0.2, 0.8, 2.4);
        else if (b.t === 'turm_feuer') emit(cx, 2.4, cz, '#ff9a3a', 1, 0.3, 1.5, 0.8);
        else if (b.t === 'turm_rauch') emit(cx, 2.6, cz, '#9ac06a', 1, 0.5, 0.6, 2.5);
      }
    }
    for (const [id, e] of city.meshes) if (!seen.has(id)) { groups.city.remove(e.obj); city.meshes.delete(id); }
    city.roads.count = roads; city.roads.instanceMatrix.needsUpdate = true;
    // Tor
    const gm = PW.City.gateMax(S), gf = gm ? S.city.gate / gm : 0;
    city.doorL.visible = city.doorR.visible = gf > 0;
    const open = S.waves.active ? 0 : 1.1;
    city.doorL.rotation.y = open; city.doorR.rotation.y = -open; city.doorL.position.x = 14 + 0.5 * Math.cos(open); city.doorR.position.x = 16 - 0.5 * Math.cos(open);
    city.doorL.position.z = city.doorR.position.z = 27.6 + 0.5 * Math.sin(open);
    // Seuche: grüner Dunst über der Stadt
    const tot = PW.Econ.popTotal(S.pop), sick = tot ? (S.pop.i + S.pop.t) / tot : 0;
    if (sick > 0.08 && Math.random() < dt * sick * 12) emit(5 + Math.random() * 20, 0.4, 5 + Math.random() * 20, C.sick, 1, 2, 0.4, 3);
    city._ck = (city._ck || 0) - dt;
    if (city._ck <= 0) { city._ck = 0.5; const key = S.city.b.map(b => b.x + ',' + b.y + ',' + b.w + ',' + b.h).join('|'); if (key !== city.clutterKey) { city.clutterKey = key; rebuildClutter(S); } }
    syncWalkers(S, dt, sick);
    syncPatients(S);
    syncRats(S, dt, sick);
    syncWave(S, dt);
    syncCityUi(S, ui);
  }
  function syncWalkers(S, dt, sick) {
    const m4 = _m(), q = _q(), sc = new T.Vector3(0.75, 0.75, 0.75), pv = new T.Vector3(), up = new T.Vector3(0, 1, 0);
    const a = S.waves.active, bs = S.city.b.filter(b => b.lv > 0 && b.w > 1);
    const want = a || !bs.length ? 0 : Math.min(R.low ? 20 : 48, Math.ceil(PW.Econ.workforce(S.pop) / 3));
    while (city.walkers.length < want) { const b = bs[Math.floor(Math.random() * bs.length)]; city.walkers.push({ x: b.x + b.w / 2, z: b.y + b.h + 0.3, tx: 0, tz: 0, w: 0, sick: Math.random() < sick }); }
    city.walkers.length = Math.min(city.walkers.length, want);
    city.walkers.forEach((w, i) => {
      if (w.w <= 0) { const b = bs[Math.floor(Math.random() * bs.length)]; w.tx = b.x + b.w / 2 + (Math.random() - 0.5); w.tz = b.y + b.h + 0.35; w.w = 1; }
      const dx = w.tx - w.x, dz = w.tz - w.z, d = Math.hypot(dx, dz), sp = (w.sick ? 0.6 : 1.2) * dt;
      if (d < 0.2) { w.w -= dt * 0.5; } else { w.x += dx / d * sp; w.z += dz / d * sp; q.setFromAxisAngle(up, Math.atan2(dx, dz)); }
      pv.set(w.x, Math.abs(Math.sin(performance.now() / 160 + i)) * 0.06, w.z); m4.compose(pv, q, sc);
      pairSet(city.walkG, m4, color(w.sick ? C.sick : CIVC[i % CIVC.length]));
    });
    pairEnd(city.walkG);
    // Garnison am Tor (bei Angriff) bzw. auf dem Exerzierplatz
    const gar = PW.Waves.garrison(S), n = Math.min(40, Math.ceil(PW.UNIT_IDS.reduce((s, k) => s + (gar[k] || 0), 0) / 2));
    for (let i = 0; i < n; i++) { const row = Math.floor(i / 10), colx = i % 10; pv.set(12.5 + colx * 0.55, 0, (a ? 25.4 : 24.2) - row * 0.6); q.setFromAxisAngle(up, 0); m4.compose(pv, q, sc); pairSet(city.solG, m4, color(TEAM[0])); }
    pairEnd(city.solG);
    const hs = PW.Heroes.list(S).filter(h => PW.Heroes.available(S, h)).slice(0, 12);
    sc.set(0.95, 0.95, 0.95); hs.forEach((h, i) => { pv.set(13 + i * 0.8, 0, a ? 26.4 : 16.4); q.setFromAxisAngle(up, 0); m4.compose(pv, q, sc); pairSet(city.heroG, m4, color(PW.HERO[h].col)); });
    pairEnd(city.heroG);
  }
  // Wartende Patienten vor der Heilstube, dazu ein Pestarzt, der zwischen ihnen umhergeht
  function syncPatients(S) {
    const m4 = _m(), q = _q(), sc = new T.Vector3(0.72, 0.72, 0.72), pv = new T.Vector3(), up = new T.Vector3(0, 1, 0);
    const hs = S.city.b.find(b => b.t === 'heilstube' && b.lv > 0 && b.w), W = S.ward;
    if (hs && W && W.list.length && !S.waves.active) {
      const list = W.list.filter(c => c.st !== 'behandlung').slice(0, 8), z0 = hs.y + hs.h + 0.45;
      list.forEach((c, i) => {
        pv.set(hs.x + 0.35 + (i % 4) * 0.45, Math.abs(Math.sin(performance.now() / 700 + i)) * 0.015, z0 + Math.floor(i / 4) * 0.5); q.setFromAxisAngle(up, Math.PI);
        m4.compose(pv, q, sc); pairSet(city.patG, m4, color(c.st === 'gesund' ? '#7ac06a' : c.vip != null ? '#c8a040' : c.hp < 35 ? '#a8a070' : '#8a9a6a'));
      });
      const t = performance.now() / 4000, px = hs.x + 0.4 + (Math.sin(t) * 0.5 + 0.5) * Math.max(0.5, Math.min(4, list.length) * 0.45 - 0.3);
      pv.set(px, 0, z0 + 0.75); q.setFromAxisAngle(up, Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2); sc.set(0.8, 0.8, 0.8); m4.compose(pv, q, sc); pairSet(city.docG, m4, color('#3a3a40'));
    }
    pairEnd(city.patG); pairEnd(city.docG);
  }
  // Ratten huschen umher – mehr bei viel Seuche und nachts
  function syncRats(S, dt, sick) {
    const plague = PW.clamp(sick * 2.5 + (S._regionPlague || 0) * 0.6, 0, 1), want = S.waves.active ? 0 : Math.round((R.low ? 0.5 : 1) * (3 + 32 * plague) * (R.night ? 1.4 : 1));
    const rs = city.rats, m4 = _m(), q = _q(), sc = new T.Vector3(1, 1, 1), pv = new T.Vector3(), up = new T.Vector3(0, 1, 0);
    const spot = () => Math.random() < 0.5 ? [2.6 + Math.random() * 24.8, Math.random() < 0.5 ? 2.6 : 27.3] : [Math.random() < 0.5 ? 2.6 : 27.4, 2.6 + Math.random() * 24.8];
    const inside = () => [3 + Math.random() * 24, 3 + Math.random() * 24];
    while (rs.length < Math.min(48, want)) { const [x, z] = spot(); rs.push({ x, z, tx: x, tz: z, wait: Math.random() * 2, a: 0 }); }
    rs.length = Math.min(rs.length, want);
    rs.forEach((r, i) => {
      if (r.wait > 0) { r.wait -= dt; }
      else {
        const dx = r.tx - r.x, dz = r.tz - r.z, d = Math.hypot(dx, dz);
        if (d < 0.15) { r.wait = 0.3 + Math.random() * 2.5; [r.tx, r.tz] = Math.random() < 0.6 ? spot() : inside(); }
        else { const s = Math.min(d, 2.6 * dt); r.x += dx / d * s; r.z += dz / d * s; r.a = Math.atan2(dx, dz); }
      }
      pv.set(r.x, 0, r.z); q.setFromAxisAngle(up, r.a); m4.compose(pv, q, sc); city.rat.setMatrixAt(i, m4);
    });
    city.rat.count = rs.length; city.rat.instanceMatrix.needsUpdate = true;
  }
  const lastPos = new Map(); let fxSeen = 0;
  function syncWave(S, dt) {
    const a = S.waves.active, m4 = _m(), q = _q(), sc = new T.Vector3(), pv = new T.Vector3(), up = new T.Vector3(0, 1, 0);
    const cnt = {}; Object.keys(city.en).forEach(k => { cnt[k] = 0; }); Object.keys(city.boss).forEach(k => { city.boss[k].visible = false; });
    const warn = !a && S.waves.warned;
    city.lanes.forEach((m, k) => { m.visible = !!(a ? a.lanes.indexOf(k) >= 0 : warn); });
    if (a) {
      for (const e of a.en) {
        if (e.hp <= 0) continue;
        let lp = lastPos.get(e.id); if (!lp) { lp = [e.x, e.y, Math.atan2(15 - e.x, 28 - e.y)]; lastPos.set(e.id, lp); }
        if (Math.hypot(e.x - lp[0], e.y - lp[1]) > 0.02) { lp[2] = Math.atan2(e.x - lp[0], e.y - lp[1]); lp[0] = e.x; lp[1] = e.y; }
        const yaw = lp[2];
        q.setFromAxisAngle(up, yaw);
        if (e.boss) { const m = city.boss[e.type]; if (!m) continue; m.visible = true; const s = PW.BOSSES[e.type].size / 2; m.scale.set(s, s, s); m.position.set(e.x, 0, e.y); m.quaternion.copy(q); continue; }
        const im = city.en[e.type]; if (!im || cnt[e.type] >= 260) continue;
        const s = PW.ENEMIES[e.type].size * 1.25 * (e.stun > 0 ? 0.9 : 1);
        pv.set(e.x, e.fly ? 3 + Math.sin(performance.now() / 200 + e.id) * 0.3 : Math.abs(Math.sin(performance.now() / 120 + e.id)) * 0.08, e.y); sc.set(s, s, s);
        m4.compose(pv, q, sc); im.setMatrixAt(cnt[e.type]++, m4);
      }
      // Geschosse
      let np = 0;
      for (const p of a.proj) {
        if (np >= 300) break;
        const e = a.en.find(x => x.id === p.eid); const tx = e ? e.x : p.x, tz = e ? e.y : p.y;
        q.setFromAxisAngle(up, Math.atan2(tx - p.x, tz - p.y));
        const k = p.kind; sc.set(k === 'bolzen' ? 2 : k === 'feuer' ? 3 : 1, k === 'bolzen' ? 2 : k === 'feuer' ? 3 : 1, k === 'feuer' ? 0.5 : 1);
        pv.set(p.x, 1.2 + Math.min(1.5, Math.hypot(tx - p.x, tz - p.y) * 0.15), p.y); m4.compose(pv, q, sc);
        city.proj.setMatrixAt(np, m4); city.proj.setColorAt(np, color(k === 'feuer' ? '#ff8a2a' : k === 'bolzen' ? '#3a3026' : '#c8a070')); np++;
      }
      city.proj.count = np; city.proj.instanceMatrix.needsUpdate = true; if (city.proj.instanceColor) city.proj.instanceColor.needsUpdate = true;
      // Effekte aus der Simulation (einmal je Eintrag)
      a.fx.forEach(f => {
        if (f._r) return; f._r = 1; fxSeen++;
        if (f.k === 'tod') { emit(f.x, 0.5, f.y, f.boss ? '#e0aa45' : '#6a5a3a', f.boss ? 30 : 4, 0.8, 1.2, 0.9); if (R.onSfx) R.onSfx(f.boss ? 'sieg' : 'tod'); }
        else if (f.k === 'treffer') { emit(f.x, 0.8, f.y, f.kind === 'feuer' ? '#ff8a2a' : '#d8c8a0', f.kind === 'feuer' ? 5 : 2, 0.5, 1, 0.5); if (R.onSfx) R.onSfx(f.kind === 'feuer' ? 'feuer' : 'treffer'); }
        else if (f.k === 'tor') { emit(f.x, 1, f.y + 0.5, '#a08060', 3, 0.8, 1, 0.6); R.shake = 0.25; if (R.onSfx) R.onSfx('tor'); }
        else if (f.k === 'hq' || f.k === 'biss') emit(f.x, 1, f.y, '#c04a3a', 3, 0.6, 1, 0.6);
        else if (f.k === 'skill') emit(f.x, 0.5, f.y, '#ffd36a', 24, 3, 2, 1);
      });
      a.fx.length = 0;
    } else { city.proj.count = 0; if (lastPos.size) lastPos.clear(); }
    Object.keys(city.en).forEach(k => { city.en[k].count = cnt[k]; city.en[k].instanceMatrix.needsUpdate = true; });
  }
  function syncCityUi(S, ui) {
    city.grid.visible = !!(ui.place);
    // Auswahl
    const b = ui.sel && PW.City.get(S, ui.sel);
    if (b && b.w) { city.sel.visible = true; city.sel.position.set(b.x + b.w / 2, 1, b.y + b.h / 2); city.sel.scale.set(b.w + 0.1, 2, b.h + 0.1); }
    else if (b && b.t === 'mauer') { city.sel.visible = true; city.sel.position.set(15, 1.2, 27.7); city.sel.scale.set(3, 2.6, 1); }
    else city.sel.visible = false;
    const tw = b && PW.BLD[b.t].tower;
    if (tw && b.lv > 0) { const st = PW.Waves.towerStats(S, b); city.range.visible = true; city.range.position.set(b.x + 0.5, 0.05, b.y + 0.5); city.range.scale.set(st.range, st.range, 1); }
    else city.range.visible = false;
    // Platzieren / Versetzen
    const p = ui.place;
    if (p && p.x != null) {
      const D = PW.BLD[p.type], [w, h] = PW.City.dims(p.type, p.rot), ok = PW.City.canPlace(S, p.type, p.x, p.y, p.rot, p.moveUid).ok && (p.moveUid || !PW.City.canBuild(S, p.type));
      city.ghostBox.visible = true; city.ghostBox.material = ok ? MAT.ok : MAT.bad; city.ghostBox.position.set(p.x + w / 2, 0, p.y + h / 2); city.ghostBox.scale.set(w, 0.08, h);
      const gg = bldGeo(p.type, 1, p.rot, D.w, D.h); city.ghost.geometry = gg.g; city.ghost.visible = true; city.ghost.position.set(p.x + w / 2, 0.02, p.y + h / 2);
      if (D.tower) { const st = PW.Waves.towerStats(S, { t: p.type, lv: 1 }); city.range.visible = true; city.range.position.set(p.x + 0.5, 0.05, p.y + 0.5); city.range.scale.set(st.range, st.range, 1); }
    } else { city.ghostBox.visible = false; city.ghost.visible = false; }
  }

  // ---------- Weltkarte ----------
  const world = { hex: null, key: '', sites: [], caps: new Map(), marches: new Map(), deco: null };
  const HEXH = { ebene: 0.35, wald: 0.45, sumpf: 0.25, gebirge: 0.95, ruinen: 0.4 };
  R.hexTop = (S, i) => (R.explored(S, i) ? HEXH[S.world.tiles[i].b] : 0.15) + 0.0;
  R.explored = (S, i) => PW.World.explored(S, i);
  R.tilePos = (S, i) => { const p = PW.World.pos(S.world, i, 1); return [p[0], p[1]]; };
  function emojiTex(txt, size, bg) {
    const key = txt + '|' + (bg || '');
    if (world.tex && world.tex[key]) return world.tex[key];
    world.tex = world.tex || {};
    const c = root.document.createElement('canvas'); c.width = c.height = size || 64; const x = c.getContext('2d');
    if (bg) { x.fillStyle = bg; x.beginPath(); x.arc(c.width / 2, c.height / 2, c.width / 2 - 2, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3; x.stroke(); }
    x.font = Math.round(c.width * 0.62) + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, c.width / 2, c.height / 2 + 2);
    const t = new T.CanvasTexture(c); world.tex[key] = t; return t;
  }
  function textTex(txt, colr) {
    const c = root.document.createElement('canvas'); c.width = 256; c.height = 48; const x = c.getContext('2d');
    x.font = 'bold 26px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 5; x.strokeStyle = 'rgba(0,0,0,.85)'; x.strokeText(txt, 128, 25); x.fillStyle = colr || '#f1e8d4'; x.fillText(txt, 128, 25);
    return new T.CanvasTexture(c);
  }
  function buildWorld(S) {
    const g = groups.world; while (g.children.length) g.remove(g.children[0]);
    world.sites = []; world.caps.clear(); world.marches.clear();
    const n = S.world.tiles.length;
    const hg = new T.CylinderGeometry(0.97, 0.97, 1, 6); hg.translate(0, 0.5, 0);
    world.hex = new T.InstancedMesh(hg, new T.MeshLambertMaterial({ color: 0xffffff }), n);
    const w0 = new T.Color(1, 1, 1); for (let i = 0; i < n; i++) world.hex.setColorAt(i, w0);
    g.add(world.hex);
    const sea = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshLambertMaterial({ color: '#15130f' })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.05; g.add(sea);
    const mx = PW.World.pos(S.world, n - 1, 1); R._wb = [mx[0] + 1, mx[1] + 1];
    // Deko-Instanzen
    world.tree = inst(merge([{ s: 'cyl', x: 0, y: 0, z: 0, sx: 0.08, sy: 0.25, sz: 0.08, c: C.dwood }, { s: 'cone', x: 0, y: 0.18, z: 0, sx: 0.42, sy: 0.6, sz: 0.42, c: '#2f4a26' }]), n * 3); g.add(world.tree);
    world.peak = inst(merge([{ s: 'cone', x: 0, y: 0, z: 0, sx: 0.9, sy: 0.9, sz: 0.9, c: '#8a8680' }, { s: 'cone', x: 0, y: 0.62, z: 0, sx: 0.36, sy: 0.3, sz: 0.36, c: '#e8e4dc' }]), n * 2); g.add(world.peak);
    world.ruin = inst(merge([{ s: 'box', x: -0.15, y: 0, z: 0, sx: 0.18, sy: 0.4, sz: 0.18, c: '#7a6a5f' }, { s: 'box', x: 0.15, y: 0, z: 0.1, sx: 0.3, sy: 0.18, sz: 0.12, c: '#6a5a50' }]), n * 2); g.add(world.ruin);
    world.water = inst(merge([{ s: 'cyl6', x: 0, y: 0, z: 0, sx: 0.9, sy: 0.03, sz: 0.9, c: '#3f6f9a' }]), n); g.add(world.water);
    world.ownR = inst(new T.RingGeometry(0.78, 0.93, 6, 1, Math.PI / 2).rotateX(-Math.PI / 2), n, new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide })); g.add(world.ownR);
    // Orte
    S.world.sites.forEach((s, k) => {
      if (s.type === 'capital') return;
      const sp = new T.Sprite(new T.SpriteMaterial({ map: emojiTex(PW.SITES[s.type].icon, 64, 'rgba(20,16,10,.75)'), depthWrite: false }));
      const p = PW.World.pos(S.world, s.tile, 1); sp.position.set(p[0], 1.35, p[1]); sp.scale.set(0.95, 0.95, 1); g.add(sp); world.sites[k] = sp;
    });
    // Hauptstädte
    const castle = merge([{ s: 'box', x: 0, y: 0, z: 0, sx: 1.1, sy: 0.55, sz: 1.1, c: C.stone }, { s: 'box', x: 0, y: 0.55, z: 0, sx: 0.6, sy: 0.55, sz: 0.6, c: C.stone }, { s: 'pyr', x: 0, y: 1.1, z: 0, sx: 0.7, sy: 0.45, sz: 0.7, c: C.slate },
      { s: 'cyl', x: -0.5, y: 0, z: -0.5, sx: 0.3, sy: 0.85, sz: 0.3, c: C.dstone }, { s: 'cyl', x: 0.5, y: 0, z: -0.5, sx: 0.3, sy: 0.85, sz: 0.3, c: C.dstone }, { s: 'cyl', x: -0.5, y: 0, z: 0.5, sx: 0.3, sy: 0.85, sz: 0.3, c: C.dstone }, { s: 'cyl', x: 0.5, y: 0, z: 0.5, sx: 0.3, sy: 0.85, sz: 0.3, c: C.dstone }, { s: 'cyl', x: 0, y: 1.1, z: 0, sx: 0.04, sy: 0.9, sz: 0.04, c: C.dwood }]);
    world.flagGeo = merge([{ s: 'box', x: 0.2, y: 1.7, z: 0, sx: 0.4, sy: 0.25, sz: 0.03, c: '#ffffff' }]);
    S.world.caps.forEach(ci => {
      const grp = new T.Group(), p = PW.World.pos(S.world, ci, 1);
      grp.add(new T.Mesh(castle, MAT.v));
      const fl = new T.Mesh(world.flagGeo, new T.MeshLambertMaterial({ color: 0xffffff })); grp.add(fl); grp.userData.flag = fl;
      const lab = new T.Sprite(new T.SpriteMaterial({ map: textTex(''), depthWrite: false, depthTest: false })); lab.position.set(0, 2.5, 0); lab.scale.set(4, 0.75, 1); grp.add(lab); grp.userData.lab = lab;
      grp.position.set(p[0], HEXH.ebene, p[1]); g.add(grp); world.caps.set(ci, grp);
    });
    world.selR = new T.Mesh(new T.RingGeometry(0.8, 1.02, 6, 1, Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffd36a, side: T.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false })); world.selR.rotation.x = -Math.PI / 2; world.selR.visible = false; g.add(world.selR);
    world.markR = new T.Mesh(new T.RingGeometry(0.6, 1.05, 6, 1, Math.PI / 2), new T.MeshBasicMaterial({ color: 0xe0aa45, side: T.DoubleSide, transparent: true, opacity: 0.6, depthWrite: false })); world.markR.rotation.x = -Math.PI / 2; world.markR.visible = false; g.add(world.markR);
    world.pathG = new T.Group(); g.add(world.pathG);
    world.built = S.world; world.key = '';
  }
  function ownerCol(S, o) { if (o === 'P') return '#e0aa45'; const f = PW.FAC[o]; return f ? f.col : '#888'; }
  function syncWorldTiles(S) {
    const n = S.world.tiles.length, m4 = _m(), q = _q(), sc = new T.Vector3(), pv = new T.Vector3(), up = new T.Vector3(0, 1, 0), c = new T.Color(), pc = color('#7a9a3a'), fogc = color('#24201a');
    let nt = 0, np = 0, nr = 0, nw = 0, no = 0;
    const rnd = PW.makeRng('deko:' + S.seed);
    for (let i = 0; i < n; i++) {
      const t = S.world.tiles[i], ex = PW.World.explored(S, i), p = PW.World.pos(S.world, i, 1), h = ex ? HEXH[t.b] : 0.15;
      pv.set(p[0], 0, p[1]); sc.set(1, h, 1); q.identity(); m4.compose(pv, q, sc); world.hex.setMatrixAt(i, m4);
      if (!ex) { c.copy(fogc); c.offsetHSL(0, 0, (rnd() - 0.5) * 0.02); }
      else {
        c.set(PW.BIOMES[t.b].col);
        if (t.pl > 0.12) c.lerp(pc, Math.min(0.6, t.pl * 0.8));
        if (t.road) c.offsetHSL(0, -0.05, 0.05);
        if (t.own) c.lerp(color(ownerCol(S, t.own)), 0.22);
      }
      world.hex.setColorAt(i, c);
      if (!ex) { rnd(); rnd(); continue; }
      const r1 = rnd(), r2 = rnd();
      if (t.site < 0 || S.world.sites[t.site].type !== 'capital') {
        if (t.b === 'wald') for (let k = 0; k < 3; k++) { const a = r1 * 6 + k * 2.1, d = 0.35 + 0.15 * k; pv.set(p[0] + Math.cos(a) * d, h, p[1] + Math.sin(a) * d); sc.set(1, 1, 1); m4.compose(pv, q, sc); world.tree.setMatrixAt(nt++, m4); }
        if (t.b === 'gebirge') for (let k = 0; k < 2; k++) { pv.set(p[0] + (k ? 0.3 : -0.25), h, p[1] + (k ? 0.2 : -0.15) + r2 * 0.1); const s = k ? 0.7 : 1; sc.set(s, s, s); m4.compose(pv, q, sc); world.peak.setMatrixAt(np++, m4); }
        if (t.b === 'ruinen') for (let k = 0; k < 2; k++) { pv.set(p[0] + (k ? 0.35 : -0.3), h, p[1] + (k ? -0.25 : 0.3)); q.setFromAxisAngle(up, r1 * 3 + k); sc.set(1, 1, 1); m4.compose(pv, q, sc); world.ruin.setMatrixAt(nr++, m4); q.identity(); }
      }
      if (t.riv) { pv.set(p[0], h + 0.005, p[1]); sc.set(0.8, 1, 0.8); m4.compose(pv, q, sc); world.water.setMatrixAt(nw++, m4); }
      if (t.own) { pv.set(p[0], h + 0.02, p[1]); sc.set(1, 1, 1); m4.compose(pv, q, sc); world.ownR.setMatrixAt(no, m4); world.ownR.setColorAt(no++, color(ownerCol(S, t.own))); }
    }
    world.hex.instanceMatrix.needsUpdate = true; world.hex.instanceColor.needsUpdate = true;
    world.tree.count = nt; world.peak.count = np; world.ruin.count = nr; world.water.count = nw; world.ownR.count = no;
    [world.tree, world.peak, world.ruin, world.water, world.ownR].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    // Orte
    S.world.sites.forEach((s, k) => {
      const sp = world.sites[k]; if (!sp) return;
      const ex = PW.World.explored(S, s.tile); sp.visible = ex;
      if (ex) { const ic = s.story ? '✴️' : PW.SITES[s.type].icon; if (sp.userData.ic !== ic) { sp.material.map = emojiTex(ic, 64, 'rgba(20,16,10,.75)'); sp.material.needsUpdate = true; sp.userData.ic = ic; } sp.material.opacity = s.cleared && s.type !== 'village' && s.type !== 'trade' ? 0.45 : 1; sp.position.y = HEXH[S.world.tiles[s.tile].b] + 0.9; }
    });
    world.caps.forEach((grp, ci) => {
      const t = S.world.tiles[ci], ex = PW.World.explored(S, ci); grp.visible = ex;
      if (!ex) return;
      const o = t.own, name = o === 'P' ? (S.cfg.playerName || 'Deine Zuflucht') : o ? (PW.FAC[o] ? PW.FAC[o].name : o) : 'Verlassene Stadt';
      grp.userData.flag.material.color.set(o ? ownerCol(S, o) : '#666');
      if (grp.userData.name !== name) { grp.userData.lab.material.map = textTex(name, o ? ownerCol(S, o) : '#aaa'); grp.userData.lab.material.needsUpdate = true; grp.userData.name = name; }
    });
  }
  function marchMesh(S, a) {
    const grp = new T.Group();
    const body = new T.Mesh(world.mGeo || (world.mGeo = merge([{ s: 'cyl', x: -0.12, y: 0, z: 0, sx: 0.16, sy: 0.3, sz: 0.16, c: '#5a5a62' }, { s: 'cyl', x: 0.12, y: 0, z: 0.1, sx: 0.16, sy: 0.3, sz: 0.16, c: '#5a5a62' }, { s: 'cyl', x: 0.02, y: 0, z: -0.15, sx: 0.16, sy: 0.3, sz: 0.16, c: '#5a5a62' }, { s: 'cyl', x: 0, y: 0, z: 0, sx: 0.03, sy: 0.8, sz: 0.03, c: C.dwood }])), MAT.v);
    const fl = new T.Mesh(world.mfGeo || (world.mfGeo = merge([{ s: 'box', x: 0.13, y: 0.6, z: 0, sx: 0.26, sy: 0.18, sz: 0.02, c: '#ffffff' }])), new T.MeshLambertMaterial({ color: ownerCol(S, a.owner) }));
    grp.add(body); grp.add(fl);
    if (a.mission === 'trade') { const cart = new T.Mesh(world.cGeo || (world.cGeo = merge([{ s: 'box', x: 0, y: 0.05, z: 0.25, sx: 0.3, sy: 0.18, sz: 0.25, c: '#a07a50' }])), MAT.v); grp.add(cart); }
    grp.scale.set(1.3, 1.3, 1.3);
    return grp;
  }
  function marchPos(S, a) {
    const path = a.state === 'back' ? a.back : a.path; if (!path || !path.length) return null;
    const i0 = path[Math.min(a.seg, path.length - 1)], i1 = path[Math.min(a.seg + 1, path.length - 1)];
    const p0 = PW.World.pos(S.world, i0, 1), p1 = PW.World.pos(S.world, i1, 1), f = a.work > 0 ? 0 : PW.clamp(a.prog, 0, 1);
    return [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f, Math.atan2(p1[0] - p0[0], p1[1] - p0[1]), i0];
  }
  function syncWorld(S, ui, dt) {
    if (world.built !== S.world) buildWorld(S);
    const key = S.fog.length + ':' + S.fog.split('1').length + ':' + R._ownKey(S);
    if (key !== world.key) { world.key = key; syncWorldTiles(S); }
    // Märsche (eigene immer, fremde nur in erkundeten Feldern)
    const seen = new Set();
    S.marches.forEach(a => {
      const p = marchPos(S, a); if (!p) return;
      const vis = a.owner === 'P' || PW.World.explored(S, p[3]); if (!vis) return;
      seen.add(a.id);
      let m = world.marches.get(a.id); if (!m) { m = marchMesh(S, a); world.marches.set(a.id, m); groups.world.add(m); }
      m.position.set(p[0], HEXH[S.world.tiles[p[3]].b] + 0.02, p[1]); m.rotation.y = p[2];
    });
    for (const [id, m] of world.marches) if (!seen.has(id)) { groups.world.remove(m); world.marches.delete(id); }
    // Weg der ausgewählten / eigenen Expeditionen
    if ((world._pt = (world._pt || 0) + dt) > 0.5) {
      world._pt = 0; const pg = world.pathG; while (pg.children.length) { const c = pg.children.pop(); c.geometry.dispose(); }
      const P = [];
      S.marches.forEach(a => { if (a.owner !== 'P') return; const path = a.state === 'back' ? a.back : a.path; for (let k = Math.max(0, a.seg); k < path.length; k++) { const p = PW.World.pos(S.world, path[k], 1); P.push({ s: 'cyl', x: p[0], y: HEXH[S.world.tiles[path[k]].b] + 0.01, z: p[1], sx: 0.16, sy: 0.04, sz: 0.16, c: a.state === 'back' ? '#8ab3c9' : '#ffd36a' }); } });
      if (ui.plan && ui.plan.length) ui.plan.forEach(i => { const p = PW.World.pos(S.world, i, 1); P.push({ s: 'cyl', x: p[0], y: HEXH[S.world.tiles[i].b] + 0.01, z: p[1], sx: 0.2, sy: 0.05, sz: 0.2, c: '#ffffff' }); });
      if (P.length) pg.add(new T.Mesh(merge(P), MAT.glow));
    }
    // Auswahl und Missionsziel
    if (ui.tile >= 0 && ui.tile != null) { const p = PW.World.pos(S.world, ui.tile, 1); world.selR.visible = true; world.selR.position.set(p[0], R.hexTop(S, ui.tile) + 0.03, p[1]); }
    else world.selR.visible = false;
    const mt = S.campaign && S.campaign.markTile;
    if (mt != null) { const p = PW.World.pos(S.world, mt, 1); world.markR.visible = true; world.markR.position.set(p[0], R.hexTop(S, mt) + 0.04, p[1]); const s = 1 + 0.12 * Math.sin(performance.now() / 250); world.markR.scale.set(s, s, 1); }
    else world.markR.visible = false;
  }
  R._ownKey = function (S) { let h = 0; const t = S.world.tiles; for (let i = 0; i < t.length; i++) { const o = t[i].own; h = (h * 31 + (o ? o.charCodeAt(0) + o.length : 0) + (t[i].pl > 0.12 ? 7 : 0) + (t[i].site >= 0 && S.world.sites[t[i].site].cleared ? 3 : 0)) | 0; } return h; };
  R.worldInvalidate = () => { world.key = ''; };
  R.focusTile = function (S, i, dist) { const p = PW.World.pos(S.world, i, 1); const prev = R.mode; R.mode = 'world'; R.focus(p[0], p[1], dist); R.mode = prev; };

  // ---------- Schlachtfeld ----------
  const bat = { built: false, b: null };
  function buildBattle() {
    const g = groups.battle;
    const pg = new T.PlaneGeometry(130, 100, 52, 40); pg.rotateX(-Math.PI / 2);
    pg.setAttribute('color', new T.BufferAttribute(new Float32Array(pg.attributes.position.count * 3), 3));
    bat.ground = new T.Mesh(pg, MAT.v); g.add(bat.ground); bat.decor = null;
    bat.u = {}; ['spear', 'bow', 'rider', 'medic', 'ram', 'hunter'].forEach(k => { bat.u[k] = pair(k, k === 'ram' ? 40 : 240, g); });
    bat.u.hero = pair('hero', 16, g);
    bat.m = {}; Object.keys(PW.ENEMIES).concat(Object.keys(PW.BOSSES)).forEach(k => { const cap = PW.BOSSES[k] ? 4 : 200; bat.m[k] = inst(enemyGeo(k), cap); bat.m[k].n = 0; bat.m[k].count0 = cap; g.add(bat.m[k]); });
    const wp = [{ s: 'box', x: 0, y: 0, z: 0, sx: 1.15, sy: 0.25, sz: 5, c: C.dstone }, { s: 'box', x: 0, y: 0, z: 0, sx: 1, sy: 1, sz: 5, c: C.stone }, { s: 'box', x: 0, y: 0.35, z: 0, sx: 1.02, sy: 0.04, sz: 5, c: C.dstone }];
    for (let k = 0; k < 4; k++) wp.push({ s: 'box', x: 0, y: 1, z: -1.9 + k * 1.25, sx: 1, sy: 0.25, sz: 0.6, c: C.stone });
    bat.wall = inst(merge(wp), 12); g.add(bat.wall);
    bat.tower = inst(bldGeo('turm_pfeil', 3, 0, 1, 1).g, 4); g.add(bat.tower);
    bat.built = true;
  }
  const TERR = { ebene: '#7a7048', wald: '#4a6236', sumpf: '#4a5238', gebirge: '#6e6a64', ruinen: '#6a5e52' };
  // Boden mit Farbrauschen und Gelände-Deko (Bäume, Felsen, Schilf, Mauerreste) außerhalb der Kampfzone
  function battleField(terr) {
    const rnd = PW.makeRng('feld-' + terr), base = new T.Color(TERR[terr] || TERR.ebene), c = new T.Color();
    const pos = bat.ground.geometry.attributes.position, cl = bat.ground.geometry.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), n = Math.sin(x * 0.21) * Math.cos(z * 0.17) * 0.06 + (rnd() - 0.5) * 0.07;
      c.copy(base).offsetHSL(0, 0, n); cl.setXYZ(i, c.r, c.g, c.b);
    }
    cl.needsUpdate = true;
    if (bat.decor) { groups.battle.remove(bat.decor); bat.decor.geometry.dispose(); }
    const P = [], add = (s, x, y, z, sx, sy, sz, col, ry) => P.push({ s, x, y, z, sx, sy, sz, c: col, ry: ry || 0 });
    const N = R.low ? 140 : 260;
    for (let k = 0; k < N; k++) {
      const x = -60 + rnd() * 120, z = -46 + rnd() * 92, inside = Math.abs(x) < 30 && Math.abs(z) < 20;
      if (inside && rnd() < 0.85) continue;
      const s = 0.7 + rnd() * 0.9, r = rnd();
      if (inside || r < 0.25) { // Grasbüschel und kleine Steine
        if (rnd() < 0.7) for (let j = 0; j < 3; j++) add('cone', x + (rnd() - 0.5) * 0.4, 0, z + (rnd() - 0.5) * 0.4, 0.12, 0.35 * s, 0.12, terr === 'sumpf' ? '#6a7a40' : '#5a6a32');
        else add('sph', x, -0.1, z, 0.5 * s, 0.3 * s, 0.4 * s, '#7a766c', rnd() * 3);
        continue;
      }
      if (terr === 'wald' || (terr === 'ebene' && r < 0.45) || (terr === 'sumpf' && r < 0.4)) {
        add('cyl', x, 0, z, 0.3 * s, 1.2 * s, 0.3 * s, '#5e4630');
        add('cone', x, 0.8 * s, z, 1.8 * s, 2.2 * s, 1.8 * s, rnd() < 0.5 ? '#2f4a26' : '#3a5a2a'); add('cone', x, 2.0 * s, z, 1.3 * s, 1.6 * s, 1.3 * s, '#355228');
      } else if (terr === 'gebirge' || r < 0.6) {
        add('sph', x, -0.3, z, 2.2 * s, 1.6 * s, 1.8 * s, '#76726a', rnd() * 3); add('sph', x + 0.8 * s, -0.2, z + 0.4, 1.2 * s, 1.1 * s, 1.1 * s, '#86827a', rnd() * 3);
      } else if (terr === 'sumpf') {
        add('cyl', x, 0.01, z, 3 * s, 0.02, 2.2 * s, '#3a4a42'); for (let j = 0; j < 5; j++) add('cyl', x + (rnd() - 0.5) * 2, 0, z + (rnd() - 0.5) * 2, 0.05, 1 * s, 0.05, '#7a7a40');
      } else if (terr === 'ruinen') {
        add('box', x, 0, z, 2.6 * s, (0.6 + rnd() * 1.4) * s, 0.5, '#8a857a', rnd() * 3); add('box', x + 1, 0, z + 0.6, 0.6, 0.4, 0.6, '#77736a', rnd() * 3);
      } else {
        for (let j = 0; j < 4; j++) add('sph', x + (rnd() - 0.5) * 1.2, -0.1, z + (rnd() - 0.5) * 1.2, 0.9 * s, 0.7 * s, 0.9 * s, '#4a6a30');
      }
    }
    bat.decor = new T.Mesh(merge(P), MAT.v); groups.battle.add(bat.decor);
  }
  function syncBattle(S, ui, dt) {
    if (!bat.built) buildBattle();
    const b = ui.bview; if (!b) return;
    if (bat.b !== b) { bat.b = b; battleField(b.terrain || 'ebene'); }
    // Kamera folgt dem Kampfgeschehen, solange der Spieler sie nicht selbst bewegt
    if (!(R.userCam && performance.now() - R.userCam < 4000)) {
      let sx = 0, sz = 0, n = 0; b.sq.forEach(q => { if (q.n > 0) { sx += q.x; sz += q.y; n++; } });
      if (n) { const r = rigs.battle, k = Math.min(1, dt * 1.5); r.tx += (sx / n - r.tx) * k; r.tz += (sz / n - r.tz) * k; }
    }
    const m4 = _m(), q = _q(), sc = new T.Vector3(1, 1, 1), pv = new T.Vector3(), up = new T.Vector3(0, 1, 0);
    const now = performance.now();
    b.sq.forEach((sq, i) => {
      if (sq.n <= 0) return;
      const side = sq.s, face = side === 0 ? Math.PI / 2 : -Math.PI / 2;
      const mv = sq._lx == null ? 0 : Math.hypot(sq.x - sq._lx, sq.y - sq._ly) / Math.max(0.001, dt); sq._lx = sq.x; sq._ly = sq.y;
      const walking = mv > 0.15;
      if (sq.kind === 'mon') {
        const im = bat.m[sq.type]; if (!im) return;
        const per = sq.boss ? 1 : Math.min(10, sq.n0), show = Math.max(1, Math.min(per, Math.ceil(sq.n / Math.max(1, sq.n0) * per)));
        const s = sq.boss ? (PW.BOSSES[sq.type] ? PW.BOSSES[sq.type].size / 2 : 1) * 0.9 : (PW.ENEMIES[sq.type] ? Math.min(1.05, PW.ENEMIES[sq.type].size * 1.5) : 1), gap = sq.boss ? 0 : Math.max(0.7, s * 0.9);
        for (let k = 0; k < show; k++) {
          const cx = (k % 4) - 1.5, cz = Math.floor(k / 4) - 1, ph = now / 140 + k * 1.7 + i;
          const fly = PW.ENEMIES[sq.type] && PW.ENEMIES[sq.type].fly;
          pv.set(sq.x + cx * gap + Math.sin(ph * 0.3) * 0.08, fly ? 1.6 + Math.sin(ph * 0.5) * 0.25 : (walking ? Math.abs(Math.sin(ph)) * 0.07 : 0), sq.y + cz * gap);
          q.setFromAxisAngle(up, face + Math.sin(ph * 0.21) * 0.15); sc.set(s, s, s); m4.compose(pv, q, sc);
          if (im.n < im.count0) im.setMatrixAt(im.n++, m4);
        }
        if (ui.battleFocus === i && Math.random() < dt * 6) emit(sq.x, 2.5, sq.y, '#ff5040', 1, 0.3, 0.5, 0.6);
        return;
      }
      const key = sq.kind === 'hero' ? 'hero' : sq.type, P = bat.u[key]; if (!P) return;
      const per = key === 'hero' ? 1 : key === 'ram' ? 2 : key === 'rider' ? 6 : 12;
      const show = Math.max(1, Math.min(per, sq.n, Math.ceil(sq.n / Math.max(1, sq.n0) * per)));
      const gap = key === 'rider' ? 1.0 : key === 'ram' ? 1.7 : 0.62, cols = key === 'rider' ? 3 : key === 'ram' ? 2 : 4;
      const s = key === 'hero' ? 1.35 : key === 'ram' ? 1.1 : 1, mine = side === (ui.battleMine || 0);
      const tc = color(key === 'hero' && sq.heroId && PW.HERO[sq.heroId] ? PW.HERO[sq.heroId].col : TEAM[mine ? 0 : 1]);
      const rows = Math.ceil(show / cols);
      for (let k = 0; k < show; k++) {
        // Reihen hintereinander in Laufrichtung (x), Glieder nebeneinander (z)
        const r = Math.floor(k / cols), c = k % cols, ph = now / 130 + k * 2.1 + i * 0.7;
        const fx = (r - (rows - 1) / 2) * gap * (side === 0 ? -1 : 1), fz = (c - (cols - 1) / 2) * gap + (r % 2 ? gap * 0.25 : 0);
        pv.set(sq.x + fx, walking ? Math.abs(Math.sin(ph)) * (key === 'rider' ? 0.1 : 0.05) : 0, sq.y + fz);
        q.setFromAxisAngle(up, face + (walking ? Math.sin(ph * 0.5) * 0.06 : Math.sin(ph * 0.13) * 0.1)); sc.set(s, s, s); m4.compose(pv, q, sc);
        pairSet(P, m4, tc);
      }
      if (ui.battleFocus === i && Math.random() < dt * 6) emit(sq.x, 2.5, sq.y, '#ff5040', 1, 0.3, 0.5, 0.6);
    });
    Object.keys(bat.u).forEach(k => pairEnd(bat.u[k]));
    Object.keys(bat.m).forEach(k => { const im = bat.m[k]; im.count = im.n; im.n = 0; im.instanceMatrix.needsUpdate = true; });
    // Mauer
    let nw = 0;
    if (b.wallMax > 0 && b.wall > 0) { const f = Math.max(0.15, b.wall / b.wallMax); for (let k = 0; k < 9; k++) { pv.set(11, 0, -20 + k * 5); q.identity(); sc.set(1.2, 2.4 * f, 1); m4.compose(pv, q, sc); bat.wall.setMatrixAt(nw++, m4); } }
    bat.wall.count = nw; bat.wall.instanceMatrix.needsUpdate = true;
    let nt = 0; if (b.towers > 0) [-12, 12].forEach(z => { pv.set(14, 0, z); q.identity(); sc.set(1.4, 1.4, 1.4); m4.compose(pv, q, sc); bat.tower.setMatrixAt(nt++, m4); });
    bat.tower.count = nt; bat.tower.instanceMatrix.needsUpdate = true;
    // Kampfeffekte
    b.fx.forEach(f => {
      const A = f.a >= 0 ? b.sq[f.a] : null, B = f.b >= 0 ? b.sq[f.b] : null;
      if (f.k === 'heal' && B) emit(B.x, 1.2, B.y, '#7ad07a', 1, 0.6, 0.8, 0.6);
      else if (f.k === 'ranged' && B && Math.random() < 0.5) emit(B.x, 1, B.y, '#d8c8a0', 1, 0.8, 0.5, 0.4);
      else if (f.k === 'melee' && B && Math.random() < 0.3) emit(B.x, 0.8, B.y, '#c04a3a', 1, 0.8, 0.6, 0.4);
      else if (f.k === 'wall') emit(11, 1.5, A ? A.y : 0, '#a08060', 1, 1, 0.8, 0.6);
      else if (f.k === 'tower' && B) emit(B.x, 1, B.y, '#ffb050', 2, 0.6, 0.8, 0.5);
    });
  }
  R.pickSquad = function (cx, cy) {
    const b = bat.b; if (!b) return -1; const g = R.ground(cx, cy); if (!g) return -1;
    let best = -1, bd = 6; b.sq.forEach((q, i) => { if (q.n > 0) { const d = Math.hypot(q.x - g.x, q.y - g.z); if (d < bd) { bd = d; best = i; } } }); return best;
  };

  // ---------- Bild ----------
  let dayF = 1;
  R.frame = function (S, ui, dt) {
    if (!R.ok) return;
    if (S) {
      if (R.mode === 'city') syncCity(S, ui, dt);
      else if (R.mode === 'world') syncWorld(S, ui, dt);
      else if (R.mode === 'battle') syncBattle(S, ui, dt);
      // Tag und Nacht (nur in der Zuflucht)
      const f = (S.time % PW.DAY) / PW.DAY, sunH = Math.sin(f * Math.PI * 2 - Math.PI / 2) * -1;   // 0 = Mitternacht
      const day = R.mode === 'city' ? PW.clamp(0.5 + sunH * 0.8, 0.18, 1) : 1;
      dayF += (day - dayF) * Math.min(1, dt * 2);
      const lm = R.mode === 'city' ? 1 : 0.72;
      hemi.intensity = (0.35 + 0.5 * dayF) * lm; sun.intensity = (0.15 + 0.85 * dayF) * lm;
      sun.color.setRGB(1, 0.85 + 0.12 * dayF, 0.7 + 0.25 * dayF);
      const bg = scene.background;
      if (R.mode === 'city') { bg.setRGB(0.05 + 0.2 * dayF, 0.06 + 0.22 * dayF, 0.07 + 0.2 * dayF); scene.fog.near = 26; scene.fog.far = 82; }
      else { bg.setRGB(0.05 + 0.08 * dayF, 0.05 + 0.08 * dayF, 0.06 + 0.07 * dayF); scene.fog.near = 60; scene.fog.far = 140; }
      scene.fog.color.copy(bg);
      MAT.glow.color.setScalar(0.55 + 0.6 * (1 - dayF));
      MAT.halo.opacity = 0.12 + 0.75 * (1 - dayF);
      R.night = dayF < 0.45;
    }
    stepParticles(dt);
    placeCam();
    if (R.shake > 0) { R.shake -= dt; cam.position.x += (Math.random() - 0.5) * R.shake; cam.position.y += (Math.random() - 0.5) * R.shake; }
    renderer.render(scene, cam);
    adapt(dt);
  };
  // Bildrate beobachten und Auflösung anpassen (nur bei Qualität „auto“)
  function adapt(dt) {
    if (quality !== 'auto' || dt <= 0 || dt > 0.5) return;
    fpsAcc += dt; fpsN++;
    if (fpsAcc < 1) return;
    const ms = fpsAcc / fpsN * 1000; fpsAcc = 0; fpsN = 0;
    if (ms > 30) { slowFor++; fastFor = 0; } else if (ms < 18) { fastFor++; slowFor = 0; } else { slowFor = fastFor = 0; }
    if (slowFor >= 3 && pr > 0.7) { pr = Math.max(0.7, pr - 0.25); renderer.setPixelRatio(pr); R.resize(); slowFor = 0; R.low = pr < 1; }
    else if (fastFor >= 6 && pr < Math.min(root.devicePixelRatio || 1, 2)) { pr = Math.min(Math.min(root.devicePixelRatio || 1, 2), pr + 0.25); renderer.setPixelRatio(pr); R.resize(); fastFor = 0; R.low = pr < 1; }
  }
  R.stats = () => ({ pr, calls: renderer ? renderer.info.render.calls : 0, tris: renderer ? renderer.info.render.triangles : 0 });

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
