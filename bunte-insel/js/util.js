'use strict';
/* Bunte Insel – Grundlagen: Mathe, Zufall, Geometrie-Bündelung (Batch), Spielfigur, Partikel */
const BI = window.BI = {};
BI.TAU = Math.PI * 2;
BI.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
BI.lerp = (a, b, t) => a + (b - a) * t;
BI.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
BI.angDiff = (a, b) => { let d = (b - a) % BI.TAU; if (d > Math.PI) d -= BI.TAU; if (d < -Math.PI) d += BI.TAU; return d; };
BI.rng = function (seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
/* Speicher: 3 Spielstände im Browser (localStorage). Spielstand 1 nutzt die alten Namen (bunteInsel.save …), 2 und 3 eigene Namen. */
BI.store = {
  KEYS: ['save', 'build', 'photos', 'art'], slot: 1,
  key(k, s) { s = s || this.slot; return 'bunteInsel.' + (s === 1 ? '' : 's' + s + '.') + k; },
  get(k, d) { try { const v = localStorage.getItem(this.key(k)); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { if (this.frozen) return true; try { localStorage.setItem(this.key(k), JSON.stringify(v)); return true; } catch (e) { return false; /* ohne Speicher spielen */ } },
  meta() { try { return JSON.parse(localStorage.getItem('bunteInsel.meta')) || {}; } catch (e) { return {}; } },
  setMeta(m) { try { localStorage.setItem('bunteInsel.meta', JSON.stringify(m)); } catch (e) { } },
  /* Kurzinfo für die Spielstand-Karten */
  info(s) { try { const v = JSON.parse(localStorage.getItem(this.key('save', s))); if (!v || typeof v !== 'object') return { has: false }; return { has: true, stars: v.stars | 0, hero: v.hero || 'jannis', pn: v.pname || '', pet: v.pet || 'blitz', stk: Array.isArray(v.stk) ? v.stk.length : 0, ts: v.ts || 0 }; } catch (e) { return { has: false }; } },
  clear(s) { for (const k of this.KEYS) { try { localStorage.removeItem(this.key(k, s)); } catch (e) { } } },
  /* Sicherungsdatei: alles eines Spielstands als JSON */
  exportSlot(s) { const data = {}; for (const k of this.KEYS) { try { const v = localStorage.getItem(this.key(k, s)); if (v != null) data[k] = JSON.parse(v); } catch (e) { } } return { game: 'bunte-insel', v: 1, slot: s, saved: Date.now(), data }; },
  importSlot(s, o) {
    if (!o || o.game !== 'bunte-insel' || !o.data || typeof o.data.save !== 'object' || o.data.save === null) return false;
    this.clear(s); try { for (const k of this.KEYS) if (o.data[k] != null) localStorage.setItem(this.key(k, s), JSON.stringify(o.data[k])); } catch (e) { return false; } return true;
  }
};
(function () { let s = 0; try { s = parseInt(sessionStorage.getItem('bi_slot'), 10); } catch (e) { } if (!(s >= 1 && s <= 3)) s = (BI.store.meta().last | 0); BI.store.slot = s >= 1 && s <= 3 ? s : 1; })();

/* ---- Batch: viele einfache Körper zu EINEM Mesh bündeln (Vertexfarben, flache Schattierung) ---- */
(function () {
  const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _c = new THREE.Color();
  const _t = new Float32Array(9), cache = {};
  const nonIdx = g => (g.index ? g.toNonIndexed() : g).attributes.position.array;
  function prismBase() {
    const a = [-.5, 0, -.5], b = [.5, 0, -.5], c = [0, 1, -.5], d = [-.5, 0, .5], e = [.5, 0, .5], f = [0, 1, .5];
    return new Float32Array([].concat(a, c, b, d, e, f, a, d, f, a, f, c, b, c, f, b, f, e));
  }
  function base(key, make) { return cache[key] || (cache[key] = make()); }

  BI.Batch = class Batch {
    constructor() { this.p = []; this.n = []; this.c = []; }
    _push(src, px, py, pz, rx, ry, rz, sx, sy, sz, color, jit) {
      _m.compose(_v.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ')), _s.set(sx, sy, sz));
      const e = _m.elements; _c.set(color);
      let r = _c.r, g = _c.g, b = _c.b;
      if (jit) { const k = 1 + (Math.random() - .5) * jit; r *= k; g *= k; b *= k; }
      for (let i = 0; i < src.length; i += 9) {
        for (let k = 0; k < 3; k++) {
          const x = src[i + k * 3], y = src[i + k * 3 + 1], z = src[i + k * 3 + 2];
          _t[k * 3] = e[0] * x + e[4] * y + e[8] * z + e[12];
          _t[k * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
          _t[k * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        }
        const ux = _t[3] - _t[0], uy = _t[4] - _t[1], uz = _t[5] - _t[2], wx = _t[6] - _t[0], wy = _t[7] - _t[1], wz = _t[8] - _t[2];
        let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
        const l = Math.hypot(nx, ny, nz); if (l < 1e-9) continue;
        nx /= l; ny /= l; nz /= l;
        for (let k = 0; k < 3; k++) { this.p.push(_t[k * 3], _t[k * 3 + 1], _t[k * 3 + 2]); this.n.push(nx, ny, nz); this.c.push(r, g, b); }
      }
    }
    /* alle Körper stehen mit der Unterkante auf y (Kugel: y = Mitte) */
    box(x, y, z, w, h, d, color, ry = 0, rx = 0, rz = 0, jit = 0) {
      this._push(base('box', () => nonIdx(new THREE.BoxGeometry(1, 1, 1))), x, y + h / 2, z, rx, ry, rz, w, h, d, color, jit);
    }
    cyl(x, y, z, rt, rb, h, color, seg = 8, rx = 0, ry = 0, rz = 0, jit = 0) {
      const key = 'cyl' + seg + '|' + rt + '|' + rb;
      this._push(base(key, () => nonIdx(new THREE.CylinderGeometry(rt, rb, 1, seg))), x, y + h / 2, z, rx, ry, rz, 1, h, 1, color, jit);
    }
    cone(x, y, z, r, h, color, seg = 6, jit = 0) { this.cyl(x, y, z, 0, r, h, color, seg, 0, 0, 0, jit); }
    sph(x, y, z, r, color, detail = 1, sx = 1, sy = 1, sz = 1, jit = 0) {
      this._push(base('ico' + detail, () => nonIdx(new THREE.IcosahedronGeometry(1, detail))), x, y, z, 0, 0, 0, r * sx, r * sy, r * sz, color, jit);
    }
    /* Dachprisma: Breite w (x), Höhe h, Länge len (z); ry=π/2 dreht den First */
    prism(x, y, z, w, h, len, color, ry = 0, jit = 0) {
      this._push(base('prism', prismBase), x, y, z, 0, ry, 0, w, h, len, color, jit);
    }
    /* flache Dreiecke/Vierecke von oben (Straßen, Boden) */
    tri(ax, az, bx, bz, cx, cz, y, color) {
      _c.set(color);
      if ((bz - az) * (cx - ax) - (bx - ax) * (cz - az) < 0) { let t = bx; bx = cx; cx = t; t = bz; bz = cz; cz = t; }
      for (const [x, z] of [[ax, az], [bx, bz], [cx, cz]]) { this.p.push(x, y, z); this.n.push(0, 1, 0); this.c.push(_c.r, _c.g, _c.b); }
    }
    quad(ax, az, bx, bz, cx, cz, dx, dz, y, color) { this.tri(ax, az, bx, bz, cx, cz, y, color); this.tri(ax, az, cx, cz, dx, dz, y, color); }
    rect(x0, z0, x1, z1, y, color) { this.quad(x0, z0, x1, z0, x1, z1, x0, z1, y, color); }
    /* Rechteck mit beliebiger Drehung um (cx,cz); l entlang der Richtung ry */
    strip(cx, cz, w, l, ry, y, color) {
      const sx = Math.sin(ry), sz = Math.cos(ry), rx = -sz, rz = sx, hw = w / 2, hl = l / 2;
      this.quad(cx - sx * hl - rx * hw, cz - sz * hl - rz * hw, cx + sx * hl - rx * hw, cz + sz * hl - rz * hw,
        cx + sx * hl + rx * hw, cz + sz * hl + rz * hw, cx - sx * hl + rx * hw, cz - sz * hl + rz * hw, y, color);
    }
    ring(cx, cz, r0, r1, y, color, segs = 48, a0 = 0, a1 = BI.TAU) {
      for (let i = 0; i < segs; i++) {
        const t0 = a0 + (a1 - a0) * i / segs, t1 = a0 + (a1 - a0) * (i + 1) / segs, s0 = Math.sin(t0), c0 = Math.cos(t0), s1 = Math.sin(t1), c1 = Math.cos(t1);
        this.quad(cx + s0 * r0, cz + c0 * r0, cx + s0 * r1, cz + c0 * r1, cx + s1 * r1, cz + c1 * r1, cx + s1 * r0, cz + c1 * r0, y, color);
      }
    }
    disc(cx, cz, r, y, color, segs = 24) {
      for (let i = 0; i < segs; i++) {
        const t0 = BI.TAU * i / segs, t1 = BI.TAU * (i + 1) / segs;
        this.tri(cx, cz, cx + Math.sin(t0) * r, cz + Math.cos(t0) * r, cx + Math.sin(t1) * r, cz + Math.cos(t1) * r, y, color);
      }
    }
    get empty() { return !this.p.length; }
    mesh(mat) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.computeBoundingSphere();
      return new THREE.Mesh(g, mat || BI.mat());
    }
  };
  let shared = null;
  BI.mat = () => shared || (shared = new THREE.MeshLambertMaterial({ vertexColors: true }));
})();

/* ---- Spielfigur ---- */
BI.SHIRTS = [0xff5a5a, 0x3fa0ff, 0xffc933, 0x4cd07d, 0xb36bff, 0xff8fc8, 0xffffff, 0x23262d, 0xff8a1f, 0x7de0d0]; // die ersten 6 nutzen auch die Passanten
BI.SKINS = [0xffd2a8, 0xf3c9a0, 0xe0a979, 0xc68a5a, 0x8d5a3b, 0x5a3a28];
BI.HAIRS = [0x222222, 0x6b4423, 0xa14a2b, 0xd0642a, 0xd9a441, 0xf3d98a, 0xb36bff, 0x3fa0ff];
BI.STYLES = ['none', 'spiky', 'curly', 'long', 'pig', 'bun', 'ponytail', 'bob', 'mohawk', 'afro', 'braids'];
BI.STYLE_ICONS = ['🙂', '⚡', '🌀', '💇', '🎀', '🍥', '🐴', '🧒', '🦔', '☁️', '🪢'];
BI.EYES = [0x222233, 0x3b6fe0, 0x2e9e5b, 0x7a4a1e, 0x9b4de0];
BI.MOUTHS = ['none', 'smile', 'open', 'grin'];
BI.MOUTH_ICONS = ['😐', '🙂', '😮', '😁'];
BI.SHOES = [0x2a2a3a, 0xffffff, 0xe0382b, 0xffd23f, 0x3fa0ff, 0x4cd07d];
BI.SIZES = [.88, 1, 1.12];
BI.LOGOS = [null, 0xffffff, 0xffd23f, 0xff5a8a, 0x3fa0ff];
BI.PANTS = [0x3d4a7a, 0x23262d, 0x5a3d2b, 0x2d6a4f, 0x7a3d6a, 0xffffff];
BI.HATS = ['none', 'bear', 'cat', 'bunny', 'cap', 'crown', 'pirate', 'wizard', 'chef', 'party', 'cowboy', 'helmet'];
BI.HAT_ICONS = { none: '🙂', bear: '🐻', cat: '🐱', bunny: '🐰', cap: '🧢', crown: '👑', pirate: '🏴‍☠️', wizard: '🧙', chef: '🧑‍🍳', party: '🥳', cowboy: '🤠', helmet: '⛑️' };
/* Spielbare Helden (Jannis hat sein eigenes Aussehen); „custom“ = selbst gestalten */
BI.HEROES = [
  { id: 'jannis', name: 'Jannis', icon: '👦', o: { preset: 'jannis' } },
  { id: 'mia', name: 'Mia', icon: '👧', o: { shirt: 0xff6fae, pants: 0x7a5ce0, hair: 0x6b4423, skin: 0xffd2a8, style: 'pig', dress: true, logo: 0xffffff } },
  { id: 'leo', name: 'Leo', icon: '⚽', o: { shirt: 0x2fae5a, pants: 0xffffff, hair: 0xd0642a, skin: 0xf3c9a0, style: 'spiky', logo: 0xffd23f, shoe: 0xffd23f } },
  { id: 'luna', name: 'Fee Luna', icon: '🧚', o: { shirt: 0xb36bff, pants: 0xb36bff, hair: 0x222222, skin: 0x8d5a3b, style: 'long', dress: true, wings: true, hat: 'crown' } },
  { id: 'ben', name: 'Ritter Ben', icon: '🛡️', o: { shirt: 0x9aa5b8, pants: 0x5a3d2b, hair: 0xa14a2b, skin: 0xffd2a8, hat: 'helmet', cape: true } },
  { id: 'emma', name: 'Emma', icon: '🌻', o: { shirt: 0xffd23f, pants: 0x3d9aff, hair: 0xf3d98a, skin: 0xf3c9a0, style: 'curly', logo: 0xff6b6b } },
  { id: 'piet', name: 'Käpt\'n Piet', icon: '🏴‍☠️', o: { shirt: 0xe8453c, pants: 0x23262d, hair: 0x222222, skin: 0xe0a979, hat: 'pirate', patch: true } },
  { id: 'zoe', name: 'Astronautin Zoe', icon: '🚀', o: { shirt: 0xf4f4ff, pants: 0xf4f4ff, hair: 0x6b4423, skin: 0xe0a979, style: 'bun', hat: 'helmet', logo: 0xe0382b, pack: true } },
  { id: 'tom', name: 'Cowboy Tom', icon: '🤠', o: { shirt: 0x4da3ff, pants: 0x6b4423, hair: 0x6b4423, skin: 0xffd2a8, hat: 'cowboy', logo: 0xffd23f } },
  { id: 'max', name: 'Koch Max', icon: '🧑‍🍳', o: { shirt: 0xffffff, pants: 0x3d4a7a, hair: 0x222222, skin: 0x8d5a3b, hat: 'chef' } },
  { id: 'custom', name: 'Eigener Held', icon: '🎨', o: {} }
];
BI.heroById = id => BI.HEROES.find(h => h.id === id) || BI.HEROES[0];
/* Haustiere: Blitz (Polizeihund) + weitere, gleiche Bedienung (pose/trick/reset) */
BI.PETS = [
  { id: 'blitz', name: 'Blitz', icon: '🐕‍🦺' }, { id: 'bello', name: 'Bello', icon: '🐶' }, { id: 'mieze', name: 'Mieze', icon: '🐱' },
  { id: 'hoppel', name: 'Hoppel', icon: '🐰' }, { id: 'schnuffel', name: 'Schnuffel', icon: '🐷' }, { id: 'rexi', name: 'Rexi', icon: '🦖' }
];
BI.makePet = function (kind, name) {
  const def = BI.PETS.find(p => p.id === kind) || BI.PETS[0]; name = name || def.name;
  if (def.id === 'blitz') return BI.makeDog({ name });
  const K = {
    bello: { c: 0xd9a05b, c2: 0xffffff, ear: 'floppy', sn: .1, tail: 'up', sz: .95 },
    mieze: { c: 0x8d93a8, c2: 0xffffff, ear: 'point', sn: -.06, tail: 'long', sz: .8 },
    hoppel: { c: 0xffffff, c2: 0xffc2d4, ear: 'long', sn: -.06, tail: 'puff', sz: .78 },
    schnuffel: { c: 0xffa8c0, c2: 0xff6f9a, ear: 'fsmall', sn: .04, tail: 'curl', sz: .9 },
    rexi: { c: 0x4cd07d, c2: 0xffe27a, ear: 'none', sn: .16, tail: 'thick', sz: 1, spikes: true }
  }[def.id], mat = BI.mat(), C = K.c, C2 = K.c2, DK = 0x2a2a33;
  const root = new THREE.Group(), b = new BI.Batch(), inner = new THREE.Group(); root.add(inner);
  b.box(0, .42, 0, .44, .4, .95, C); b.box(0, .3, .02, .38, .2, .8, C2); b.box(0, .5, .52, .36, .42, .34, C);
  b.box(0, .8, .84, .34, .3, .3, C); b.box(0, .76, 1.03 + K.sn * .5, .22, .16, .2 + K.sn, C2); b.box(0, .85, 1.14 + K.sn, .09, .06, .05, def.id === 'schnuffel' ? 0xff3a7a : DK);
  b.box(-.09, .9, 1.0, .06, .07, .03, DK); b.box(.09, .9, 1.0, .06, .07, .03, DK);
  if (K.ear === 'floppy') { b.box(-.19, .86, .84, .08, .3, .14, 0x8a5a33, 0, 0, .15); b.box(.19, .86, .84, .08, .3, .14, 0x8a5a33, 0, 0, -.15); }
  else if (K.ear === 'fsmall') { b.box(-.15, 1.0, .8, .1, .12, .1, C2, 0, 0, .5); b.box(.15, 1.0, .8, .1, .12, .1, C2, 0, 0, -.5); }
  else if (K.ear === 'point') { b.cone(-.12, .95, .8, .07, .2, C, 4); b.cone(.12, .95, .8, .07, .2, C, 4); for (const sd of [-1, 1]) { b.box(sd * .12, .84, 1.12, .2, .01, .01, 0xffffff); b.box(sd * .12, .81, 1.12, .2, .01, .01, 0xffffff); } b.box(0, .6, -.05, .3, .1, .6, 0x5e6478); }
  else if (K.ear === 'long') { b.box(-.08, 1.15, .78, .07, .42, .05, C, 0, 0, .1); b.box(.08, 1.15, .78, .07, .42, .05, C, 0, 0, -.1); b.box(-.08, 1.15, .8, .035, .3, .03, C2, 0, 0, .1); b.box(.08, 1.15, .8, .035, .3, .03, C2, 0, 0, -.1); }
  if (K.spikes) { for (let i = 0; i < 5; i++) b.cone(0, .62, .35 - i * .22, .08 - i * .008, .2, 0xffb02e, 4); b.box(0, .82, 1.05, .2, .06, .06, 0xffffff); }
  inner.add(b.mesh(mat));
  function leg(x, z) { const g = new THREE.Group(), l = new BI.Batch(); l.box(0, -.36, 0, .13, .36, .13, C); l.box(0, -.4, .03, .15, .08, .19, C2); g.add(l.mesh(mat)); g.position.set(x, .38, z); inner.add(g); return g; }
  const fl = leg(-.15, .5), fr = leg(.15, .5), bl = leg(-.15, -.36), br = leg(.15, -.36);
  const tg = new THREE.Group(), t = new BI.Batch();
  if (K.tail === 'long') { t.box(0, .05, -.3, .08, .08, .6, C, 0, -.4); t.box(0, .3, -.62, .08, .3, .08, C); t.box(0, .5, -.64, .09, .09, .09, 0x5e6478); }
  else if (K.tail === 'puff') t.sph(0, .02, -.14, .17, C2, 1);
  else if (K.tail === 'curl') { t.sph(0, .05, -.1, .07, C2, 0); t.sph(0, .16, -.16, .07, C2, 0); t.sph(0, .2, -.06, .06, C2, 0); }
  else if (K.tail === 'thick') { t.box(0, 0, -.3, .2, .2, .6, C, 0, -.2); t.box(0, -.05, -.7, .1, .1, .3, C); }
  else { t.box(0, 0, -.2, .1, .1, .42, C, 0, -.5); t.box(0, .05, -.4, .07, .07, .16, C2, 0, -.5); }
  tg.add(t.mesh(mat)); tg.position.set(0, .62, -.46); inner.add(tg);
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 56; const cx = cv.getContext('2d'); cx.font = 'bold 36px Fredoka, system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 7; cx.strokeStyle = '#16335e'; cx.strokeText(name, 96, 30); cx.fillStyle = '#fff'; cx.fillText(name, 96, 30);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(1.1, .32, 1); sp.position.set(0, 1.6 + (K.ear === 'long' ? .2 : 0), .3); root.add(sp);
  root.scale.setScalar(K.sz);
  return {
    group: root,
    trick(nm, k) {
      const e = k < .15 ? k / .15 : k > .85 ? (1 - k) / .15 : 1, kk = Math.min(1, k); inner.rotation.set(0, 0, 0); inner.position.set(0, 0, 0);
      if (nm === 'sit' || nm === 'paw') { inner.rotation.x = -.55 * e; inner.position.y = -.2 * e; bl.rotation.x = br.rotation.x = -1.4 * e; fl.rotation.x = fr.rotation.x = 0; if (nm === 'paw') fl.rotation.x = -(1.2 + Math.sin(k * 28) * .35) * e; }
      else if (nm === 'roll') { inner.rotation.z = kk * BI.TAU; inner.position.y = .3 * Math.sin(kk * Math.PI); }
      else if (nm === 'beg') { inner.rotation.x = -1.1 * e; inner.position.y = .28 * e; fl.rotation.x = fr.rotation.x = -.9 * e; bl.rotation.x = br.rotation.x = 0; }
      else if (nm === 'flip') { inner.rotation.x = -kk * BI.TAU; inner.position.y = 1.1 * Math.sin(kk * Math.PI); }
    },
    reset() { inner.rotation.set(0, 0, 0); inner.position.set(0, 0, 0); },
    pose(phase, amp, wag) { const s = Math.sin(phase) * amp, hop = def.id === 'hoppel'; if (hop) { fl.rotation.x = fr.rotation.x = s; bl.rotation.x = br.rotation.x = s; inner.position.y = Math.abs(s) * .12; } else { fl.rotation.x = s; br.rotation.x = s; fr.rotation.x = -s; bl.rotation.x = -s; } tg.rotation.y = Math.sin(phase * (wag ? 3.2 : 1.4)) * (wag ? .7 : .25); }
  };
};
BI.makeChar = function (o) {
  o = o || {};
  const J = o.preset === 'jannis'; // Jannis: blonder Pilzkopf, dunkles Marvel-Shirt, braune Hose, Fernsteuerung
  if (J) o = Object.assign({ shirt: 0x1d2342, pants: 0x7a5230, skin: 0xffd6b3, hair: 0xf3d98a, hat: 'none', shoe: 0x1d2a44 }, o);
  const shirt = o.shirt != null ? o.shirt : 0xff5a5a, pants = o.pants != null ? o.pants : 0x3d4a7a, skin = o.skin != null ? o.skin : 0xffd2a8, hair = o.hair != null ? o.hair : 0x6b4423, hat = o.hat || 'none';
  const root = new THREE.Group(), body = new BI.Batch();
  body.box(0, .5, 0, .46, .22, .28, pants);
  body.box(0, .66, 0, .5, .5, .3, shirt);
  if (J) { // bunter Aufdruck wie beim Marvel-Shirt
    body.box(0, 1.05, .155, .38, .07, .02, 0xffffff); body.box(0, .93, .155, .22, .11, .02, 0x3fd18a); body.sph(0, .84, .16, .1, 0x9a5be0, 0, 1, 1, .12); body.sph(0, .84, .17, .045, 0xe8eaff, 0, 1, 1, .1); body.box(0, .73, .155, .28, .1, .02, 0xff5fa8);
  }
  body.sph(0, 1.42, 0, .27, skin, 1, 1, 1.05, 1);
  { const sk2 = new THREE.Color(skin).multiplyScalar(.86).getHex(), hc = new THREE.Color(hair).multiplyScalar(.8).getHex(), ey = o.eye != null ? o.eye : 0x3a2a1a;
    body.cyl(0, 1.1, 0, .085, .095, .12, skin, 8); // Hals
    for (const sd of [-1, 1]) { body.sph(sd * .27, 1.1, 0, .105, shirt, 1, 1, 1, 1); body.sph(sd * .262, 1.42, 0, .05, skin, 0, .55, 1, .9); } // Schultern + Ohren
    body.sph(0, 1.385, .262, .036, sk2, 0, 1, 1, 1); // Nase
    if (!J) for (const sd of [-1, 1]) { body.sph(sd * .09, 1.45, .232, .05, 0xffffff, 0, 1.2, 1, .55); body.sph(sd * .09, 1.45, .252, .033, ey, 0, 1, 1, .5); body.sph(sd * .09, 1.45, .262, .019, 0x111116, 0, 1, 1, .5); body.sph(sd * .1, 1.462, .27, .009, 0xffffff, 0, 1, 1, 1); }
    for (const sd of [-1, 1]) body.box(sd * .09, 1.515, .238, .1, .02, .025, hc, 0, 0, sd * -.12); // Augenbrauen
  }
  if (J) { for (const x of [-.09, .09]) { body.box(x, 1.44, .24, .09, .08, .04, 0xffffff); body.box(x + .035, 1.44, .26, .045, .07, .03, 0x4a5568); } body.box(.04, 1.29, .25, .12, .025, .03, 0xe58c8c); } // schelmischer Seitenblick
  body.box(-.15, 1.34, .23, .07, .05, .04, 0xff9aa8); body.box(.15, 1.34, .23, .07, .05, .04, 0xff9aa8);
  if (!J && (o.mouth === 'smile' || o.mouth == null)) { body.box(0, 1.3, .255, .1, .025, .03, 0xc2453d); body.box(-.06, 1.318, .255, .03, .03, .03, 0xc2453d); body.box(.06, 1.318, .255, .03, .03, .03, 0xc2453d); }
  else if (!J && o.mouth === 'open') { body.box(0, 1.29, .255, .09, .08, .03, 0x7a1f2b); body.box(0, 1.275, .262, .05, .025, .02, 0xff8fa0); }
  else if (!J && o.mouth === 'grin') { body.box(0, 1.3, .255, .17, .05, .03, 0xffffff); body.box(0, 1.325, .256, .19, .02, .03, 0x7a1f2b); }
  if (o.freckles) for (const [x, y] of [[-.12, 1.38], [-.18, 1.4], [.12, 1.38], [.18, 1.4]]) body.box(x, y, .262, .02, .02, .02, 0xa0603a);
  if (J) { body.sph(0, 1.57, -.04, .3, hair, 1, 1.02, .66, 1.05); body.box(0, 1.53, .2, .5, .14, .1, hair); body.box(-.27, 1.44, -.02, .07, .2, .36, hair); body.box(.27, 1.44, -.02, .07, .2, .36, hair); }
  else if (hat === 'none' || hat === 'crown') body.sph(0, 1.55, -.03, .27, hair, 1, 1, .62, 1.02);
  if (hat === 'bear') { body.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); body.sph(-.2, 1.68, 0, .1, 0x8a5a33, 1); body.sph(.2, 1.68, 0, .1, 0x8a5a33, 1); body.sph(-.2, 1.68, .04, .05, 0xffc9a0, 0); body.sph(.2, 1.68, .04, .05, 0xffc9a0, 0); }
  if (hat === 'cat') { body.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); body.cone(-.16, 1.62, 0, .1, .22, 0x555566, 4); body.cone(.16, 1.62, 0, .1, .22, 0x555566, 4); }
  if (hat === 'bunny') { body.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); body.box(-.11, 1.65, 0, .1, .42, .06, 0xffffff, 0, 0, .12); body.box(.11, 1.65, 0, .1, .42, .06, 0xffffff, 0, 0, -.12); body.box(-.11, 1.7, .03, .05, .3, .03, 0xffb0c8, 0, 0, .12); body.box(.11, 1.7, .03, .05, .3, .03, 0xffb0c8, 0, 0, -.12); }
  if (hat === 'cap') { body.sph(0, 1.55, -.02, .29, 0xe83c3c, 1, 1, .62, 1.02); body.box(0, 1.5, .27, .3, .04, .22, 0xe83c3c); }
  if (hat === 'crown') { body.box(0, 1.66, 0, .32, .1, .32, 0xffcf2e); for (let i = 0; i < 4; i++) body.cone(Math.cos(i * 1.5708) * .13, 1.74, Math.sin(i * 1.5708) * .13, .06, .14, 0xffcf2e, 4); }
  if (hat === 'pirate') { body.box(0, 1.66, 0, .5, .14, .38, 0x1b1b25); body.box(0, 1.6, 0, .72, .07, .5, 0x1b1b25); body.box(-.34, 1.66, 0, .07, .16, .46, 0x1b1b25); body.box(.34, 1.66, 0, .07, .16, .46, 0x1b1b25); body.box(0, 1.62, .25, .18, .13, .05, 0x1b1b25); body.box(0, 1.67, .285, .11, .09, .02, 0xffffff); body.box(-.025, 1.685, .297, .03, .03, .01, 0x111111); body.box(.025, 1.685, .297, .03, .03, .01, 0x111111); }
  if (hat === 'wizard') { body.cone(0, 1.6, 0, .3, .72, 0x6a3fd0, 8); body.box(0, 1.58, 0, .74, .04, .74, 0x5a2fc0); body.box(.1, 1.9, .2, .07, .07, .02, 0xffd23f, 0, 0, .8); body.box(-.12, 1.78, .22, .06, .06, .02, 0xffd23f, 0, 0, .8); }
  if (hat === 'chef') { body.cyl(0, 1.58, 0, .22, .22, .24, 0xffffff, 10); body.sph(0, 1.9, 0, .28, 0xffffff, 1, 1, .8, 1); }
  if (hat === 'party') { body.cone(0, 1.62, 0, .2, .56, 0xff5ab0, 8); body.box(0, 1.8, 0, .3, .05, .3, 0xffd23f, .5); body.sph(0, 2.2, 0, .07, 0xffd23f, 0); }
  if (hat === 'cowboy') { body.box(0, 1.6, 0, .86, .04, .76, 0xa8703a); body.cyl(0, 1.62, 0, .2, .2, .22, 0xb98650, 8); body.box(0, 1.66, 0, .43, .05, .43, 0x6b4423); body.box(-.4, 1.62, 0, .1, .06, .7, 0xa8703a, 0, 0, .4); body.box(.4, 1.62, 0, .1, .06, .7, 0xa8703a, 0, 0, -.4); }
  if (hat === 'helmet') { body.sph(0, 1.56, -.02, .33, 0xffd23f, 1, 1, .7, 1.05); body.box(0, 1.73, 0, .07, .04, .56, 0xffffff); body.box(0, 1.52, .3, .34, .05, .1, 0x1c3f9e); }
  { const st = o.style; // Frisuren
    if (st === 'pig') for (const sd of [-1, 1]) { body.sph(sd * .31, 1.42, -.03, .11, hair, 1); body.sph(sd * .33, 1.3, -.03, .09, hair, 1); body.box(sd * .27, 1.53, -.02, .06, .06, .06, 0xff5a5a); }
    else if (st === 'long') { body.box(0, 1.2, -.2, .54, .6, .12, hair); for (const sd of [-1, 1]) body.box(sd * .27, 1.28, -.05, .07, .5, .24, hair); }
    else if (st === 'spiky') for (let i = 0; i < 6; i++) { const a = i * 1.047; body.cone(Math.sin(a) * .17, 1.7, Math.cos(a) * .15 - .03, .08, .2, hair, 4); }
    else if (st === 'curly') for (let i = 0; i < 8; i++) { const a = i * .785; body.sph(Math.sin(a) * .26, 1.5 + (i % 2) * .06, Math.cos(a) * .24 - .03, .11, hair, 1); }
    else if (st === 'bun') { body.sph(0, 1.74, -.1, .13, hair, 1); body.box(0, 1.66, -.1, .1, .06, .1, 0xff5a5a); }
    else if (st === 'bob') { body.box(0, 1.46, -.04, .62, .3, .52, hair); body.box(0, 1.6, .06, .5, .1, .3, hair); }
    else if (st === 'mohawk') for (let i = 0; i < 5; i++) body.cone(0, 1.62 + (i % 2) * .02, .16 - i * .1, .07, .3 - Math.abs(i - 2) * .04, hair, 4);
    else if (st === 'afro') body.sph(0, 1.56, -.04, .4, hair, 1, 1, .9, 1);
    else if (st === 'braids') for (const sd of [-1, 1]) { body.box(sd * .28, 1.2, -.06, .08, .5, .08, hair); body.sph(sd * .28, .92, -.06, .06, 0xff5a5a, 0); }
    else if (st === 'ponytail') { body.box(0, 1.46, -.3, .1, .3, .1, hair, 0, .15); body.sph(0, 1.62, -.26, .06, 0xff5a5a, 0); }
  }
  if (o.dress) { body.box(0, .42, 0, .64, .26, .42, shirt); body.box(0, .3, 0, .7, .08, .46, pants); }
  if (o.overall) { body.box(0, .66, .156, .34, .36, .02, pants); for (const sd of [-1, 1]) body.box(sd * .13, .98, .156, .06, .26, .02, pants); body.sph(-.13, .86, .165, .035, 0xffd23f, 0); body.sph(.13, .86, .165, .035, 0xffd23f, 0); }
  if (o.stripe) for (let i = 0; i < 3; i++) body.box(0, .52 + i * .2, 0, .52, .07, .32, 0xffffff);
  if (o.logo != null) { body.box(0, .86, .156, .17, .17, .02, o.logo); body.box(0, .86, .16, .07, .07, .02, shirt); }
  if (o.patch) { body.box(-.09, 1.4, .275, .13, .13, .03, 0x111111); body.box(0, 1.47, .265, .58, .03, .02, 0x111111, 0, 0, .18); }
  if (o.cape) { body.box(0, .45, -.2, .54, .8, .05, 0xd8283a); body.box(0, 1.08, -.12, .42, .12, .2, 0xd8283a); body.sph(0, 1.08, .0, .05, 0xffd23f, 0); }
  if (o.wings) { for (const sd of [-1, 1]) { body.box(sd * .32, .85, -.22, .5, .55, .03, 0xbfe8ff, 0, 0, sd * .55); body.box(sd * .38, .55, -.22, .34, .34, .03, 0xffc8ee, 0, 0, sd * .5); } }
  if (o.glasses) { body.box(0, 1.4, .27, .17, .12, .03, 0x1b1b25); body.box(.0, 1.4, .27, .17, .12, .03, 0x1b1b25); body.box(-.1, 1.4, .27, .17, .12, .03, 0x1b1b25); body.box(.1, 1.4, .27, .17, .12, .03, 0x1b1b25); body.box(0, 1.46, .27, .08, .03, .03, 0x1b1b25); body.box(-.19, 1.46, .22, .03, .03, .1, 0x1b1b25); body.box(.19, 1.46, .22, .03, .03, .1, 0x1b1b25); }
  if (o.pack) { body.box(0, .52, -.23, .42, .55, .16, 0x3fa8e8); body.box(0, .98, -.23, .32, .12, .13, 0x2d80c0); body.box(-.15, .55, .155, .05, .5, .02, 0x2d80c0); body.box(.15, .55, .155, .05, .5, .02, 0x2d80c0); }
  if (o.teddy) { body.sph(-.34, 1.3, .03, .11, 0xc8a27a, 1); body.sph(-.34, 1.46, .03, .08, 0xc8a27a, 1); body.sph(-.4, 1.53, .03, .035, 0xc8a27a, 0); body.sph(-.28, 1.53, .03, .035, 0xc8a27a, 0); body.sph(-.34, 1.44, .1, .035, 0xe8d0b0, 0); }
  const mat = BI.mat(), bm = body.mesh(mat); bm.position.y = .1; root.add(bm); // Oberkörper etwas höher = längere Beine, natürlichere Proportionen
  function arm(sleeve, hand, x, y) { // Ärmel bis zum Ellbogen, dann Unterarm in Hautfarbe, runde Hand
    const g = new THREE.Group(), b = new BI.Batch(); b.cyl(0, -.25, 0, .082, .07, .25, sleeve, 8); b.sph(0, -.25, 0, .07, hand, 0); b.cyl(0, -.44, 0, .062, .052, .2, hand, 8); b.sph(0, -.47, .01, .072, hand, 0, 1, 1.1, 1);
    g.add(b.mesh(mat)); g.position.set(x, y, 0); root.add(g); return g;
  }
  function leg(pant, shoeC, x, y) { // Oberschenkel, Wade, Schuh mit Kappe
    const g = new THREE.Group(), b = new BI.Batch(); b.cyl(0, -.34, 0, .105, .088, .34, pant, 8); b.sph(0, -.34, 0, .088, pant, 0); b.cyl(0, -.58, 0, .088, .07, .26, pant, 8);
    b.box(0, -.62, .045, .17, .09, .3, shoeC); b.sph(0, -.6, .17, .087, shoeC, 0, 1, .75, 1.1); b.box(0, -.55, -.02, .15, .03, .12, 0xffffff);
    g.add(b.mesh(mat)); g.position.set(x, y, 0); root.add(g); return g;
  }
  const shoe = o.shoe != null ? o.shoe : 0x2a2a3a, legL = leg(pants, shoe, -.13, .62), legR = leg(pants, shoe, .13, .62);
  const armL = arm(shirt, skin, -.34, 1.22), armR = arm(shirt, skin, .34, 1.22);
  if (o.name) {
    const cv0 = document.createElement('canvas'); cv0.width = 256; cv0.height = 64; const cx0 = cv0.getContext('2d'); cx0.font = 'bold 40px Fredoka, system-ui, sans-serif'; cx0.textAlign = 'center'; cx0.textBaseline = 'middle'; cx0.lineWidth = 8; cx0.strokeStyle = '#16335e'; cx0.strokeText(o.name, 128, 34); cx0.fillStyle = '#fff'; cx0.fillText(o.name, 128, 34);
    const sp0 = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv0), transparent: true, depthWrite: false })); sp0.scale.set(1.5, .38, 1); sp0.position.y = 2.25; root.add(sp0);
  }
  let remoteMesh = null;
  if (J) { // Fernsteuerung mit Lenkrad und Antenne in der rechten Hand
    const rb = new BI.Batch(); rb.cyl(0, -.04, 0, .15, .15, .06, 0x23262d, 12, Math.PI / 2); rb.cyl(0, -.03, .02, .09, .09, .07, 0x3a3f4a, 10, Math.PI / 2); rb.box(.02, 0, 0, .025, .6, .025, 0xffffff, 0, 0, -.12); rb.box(.09, .58, 0, .035, .08, .035, 0xff5a3a, 0, 0, -.12);
    const rm = remoteMesh = rb.mesh(mat); rm.position.set(0, -.55, .13); armR.add(rm);
  }
  root.scale.setScalar(o.scale || .95);
  return {
    group: root, legL, legR, armL, armR, remote: remoteMesh,
    pose(phase, amp, wave) {
      const s = Math.sin(phase) * amp;
      legL.rotation.x = s; legR.rotation.x = -s; armL.rotation.x = -s * .9; armR.rotation.x = s * .9;
      armL.rotation.z = 0; armR.rotation.z = wave ? -2.6 + Math.sin(phase * 2) * .4 : 0;
    },
    /* Hauen: Arm schlägt nach vorn (k 0..1) */
    punch(k) { const w = Math.sin(Math.min(1, Math.max(0, k)) * Math.PI); armR.rotation.set(-1.75 * w, 0, -.15 * w); armL.rotation.set(.7 * w, 0, .2 * w); legL.rotation.x = .35 * w; legR.rotation.x = -.35 * w; },
    /* Tanzen: 3 Stile (Arme hoch, Disco, Hüpfer) */
    dance(t, style) {
      const s = Math.sin(t * 8), st = style % 3;
      if (st === 0) { armL.rotation.set(0, 0, 2.4 + s * .35); armR.rotation.set(0, 0, -2.4 - s * .35); legL.rotation.x = s * .55; legR.rotation.x = -s * .55; }
      else if (st === 1) { armR.rotation.set(0, 0, -2.6 + s * .25); armL.rotation.set(s * .7, 0, .15); legL.rotation.x = s * .7; legR.rotation.x = 0; }
      else { armL.rotation.set(-1.5 + s * .5, 0, 0); armR.rotation.set(-1.5 - s * .5, 0, 0); legL.rotation.x = Math.abs(s) * .5; legR.rotation.x = Math.abs(s) * .5; }
    },
    sit() { legL.rotation.x = legR.rotation.x = -1.35; armL.rotation.x = armR.rotation.x = -1.0; armR.rotation.z = 0; }
  };
};

/* ---- Pappnase: orangefarbener Ballon mit aufgemaltem Gesicht (Filzstift-Look) ---- */
BI.makePappnase = function () {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const c = cv.getContext('2d');
  const g = c.createRadialGradient(400, 150, 20, 512, 256, 420); g.addColorStop(0, '#ffb04a'); g.addColorStop(.6, '#f39a1e'); g.addColorStop(1, '#d97f0c'); c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
  c.translate(512, 262); c.strokeStyle = '#17121f'; c.fillStyle = '#17121f'; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 11;
  [[-118, -170, -104, -132], [-56, -180, -50, -140], [8, -184, 8, -146], [70, -176, 60, -140], [124, -162, 108, -128]].forEach(h => { c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo((h[0] + h[2]) / 2 - 10, (h[1] + h[3]) / 2, h[2], h[3]); c.stroke(); });
  const eye = (x, y, r, px, py) => { c.lineWidth = 11; c.beginPath(); c.arc(x, y, r, 0, BI.TAU); c.stroke(); c.beginPath(); c.ellipse(px, py, r * .42, r * .48, 0, 0, BI.TAU); c.fill(); };
  eye(-86, -42, 48, -78, -34); eye(72, -60, 50, 64, -48);
  c.lineWidth = 10; c.beginPath(); c.moveTo(20, 20); c.lineTo(0, 30); c.lineTo(-20, 62); c.lineTo(34, 68); c.stroke();
  c.lineWidth = 9; c.beginPath(); c.moveTo(-132, 92); c.quadraticCurveTo(-30, 168, 150, 100); c.stroke();
  c.lineWidth = 8; c.beginPath(); c.moveTo(-140, 86); c.lineTo(-124, 100); c.moveTo(150, 100); c.quadraticCurveTo(170, 90, 190, 96); c.stroke();
  [[40, 138, 70, 152], [70, 130, 100, 148], [100, 120, 128, 140], [10, 140, 36, 156]].forEach(h => { c.beginPath(); c.moveTo(h[0], h[1]); c.lineTo(h[2], h[3]); c.stroke(); });
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  const mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 90, specular: 0x886644 }), root = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.55, 28, 20), mat); ball.scale.set(1, 1.1, 1); ball.rotation.y = -Math.PI / 2; ball.position.y = .62; root.add(ball);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(.07, .13, 8), new THREE.MeshPhongMaterial({ color: 0xe88a14, shininess: 60 })); knot.rotation.x = Math.PI; knot.position.y = -.02; root.add(knot);
  return { group: root, ball };
};

/* ---- Blitz: Polizeihund-Helfer (eigener Entwurf, Schäferhund-Look mit blauer Mütze) ---- */
BI.makeDog = function (o) {
  o = o || {}; const root = new THREE.Group(), b = new BI.Batch(), TAN = 0xc9944f, BLK = 0x2a2a33, BLUE = 0x2d6be0, GOLD = 0xffd23f, mat = BI.mat();
  b.box(0, .42, 0, .44, .4, .95, TAN); b.box(0, .6, -.05, .46, .14, .6, BLK); b.box(0, .5, .52, .36, .42, .34, TAN); b.box(0, .5, .52, .42, .22, .36, BLUE); b.box(0, .52, .71, .1, .1, .03, GOLD);
  b.box(0, .8, .84, .32, .3, .3, TAN); b.box(0, .76, 1.04, .2, .15, .22, BLK); b.box(0, .84, 1.16, .09, .06, .05, 0x111111);
  b.box(-.15, .98, .78, .09, .24, .09, BLK, 0, 0, .25); b.box(.15, .98, .78, .09, .24, .09, BLK, 0, 0, -.25);
  b.box(-.08, .88, 1.0, .06, .06, .03, 0x111111); b.box(.08, .88, 1.0, .06, .06, .03, 0x111111);
  b.box(0, 1.08, .84, .36, .1, .36, BLUE); b.box(0, 1.17, .82, .24, .07, .24, BLUE); b.box(0, 1.07, 1.03, .32, .04, .13, 0x1c3f9e); b.box(0, 1.2, 1.0, .07, .06, .03, GOLD);
  const inner = new THREE.Group(); root.add(inner); inner.add(b.mesh(mat));
  function leg(x, z) { const g = new THREE.Group(), l = new BI.Batch(); l.box(0, -.36, 0, .13, .36, .13, TAN); l.box(0, -.4, .03, .15, .08, .19, BLK); g.add(l.mesh(mat)); g.position.set(x, .38, z); inner.add(g); return g; }
  const fl = leg(-.15, .5), fr = leg(.15, .5), bl = leg(-.15, -.36), br = leg(.15, -.36);
  const tg = new THREE.Group(), t = new BI.Batch(); t.box(0, 0, -.2, .1, .1, .42, TAN, 0, -.5); t.box(0, .05, -.4, .07, .07, .16, BLK, 0, -.5); tg.add(t.mesh(mat)); tg.position.set(0, .62, -.46); inner.add(tg);
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 56; const cx = cv.getContext('2d'); cx.font = 'bold 36px Fredoka, system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 7; cx.strokeStyle = '#16335e'; cx.strokeText(o.name || 'Blitz', 96, 30); cx.fillStyle = '#fff'; cx.fillText(o.name || 'Blitz', 96, 30);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(1.1, .32, 1); sp.position.set(0, 1.65, .3); root.add(sp);
  return {
    group: root,
    /* Tricks: sit, paw (Pfötchen), roll, beg (Männchen), flip (Salto); k = 0..1 */
    trick(name, k) {
      const e = k < .15 ? k / .15 : k > .85 ? (1 - k) / .15 : 1, kk = Math.min(1, k); inner.rotation.set(0, 0, 0); inner.position.set(0, 0, 0);
      if (name === 'sit' || name === 'paw') { inner.rotation.x = -.55 * e; inner.position.y = -.2 * e; bl.rotation.x = br.rotation.x = -1.4 * e; fl.rotation.x = fr.rotation.x = 0; if (name === 'paw') fl.rotation.x = -(1.2 + Math.sin(k * 28) * .35) * e; }
      else if (name === 'roll') { inner.rotation.z = kk * BI.TAU; inner.position.y = .3 * Math.sin(kk * Math.PI); }
      else if (name === 'beg') { inner.rotation.x = -1.1 * e; inner.position.y = .28 * e; fl.rotation.x = fr.rotation.x = -.9 * e; bl.rotation.x = br.rotation.x = 0; }
      else if (name === 'flip') { inner.rotation.x = -kk * BI.TAU; inner.position.y = 1.1 * Math.sin(kk * Math.PI); }
    },
    reset() { inner.rotation.set(0, 0, 0); inner.position.set(0, 0, 0); },
    pose(phase, amp, wag) { const s = Math.sin(phase) * amp; fl.rotation.x = s; br.rotation.x = s; fr.rotation.x = -s; bl.rotation.x = -s; tg.rotation.y = Math.sin(phase * (wag ? 3.2 : 1.4)) * (wag ? .7 : .25); } };
};

/* ---- Drachen mit bunter Schleife ---- */
BI.makeKite = function () {
  const b = new BI.Batch(), root = new THREE.Group(); b.box(0, 0, 0, .9, .9, .03, 0xff5a5a, 0, 0, .785); b.box(0, 0, .02, .42, .42, .03, 0xffd23f, 0, 0, .785); b.box(0, -.6, .02, .03, 1.2, .02, 0x6b4a2a); b.box(0, -.1, .02, 1.1, .03, .02, 0x6b4a2a);
  [0x4da3ff, 0x4cd07d, 0xff8fc8, 0xffd23f, 0xb36bff].forEach((c, i) => b.box(Math.sin(i * 1.3) * .12, -.8 - i * .22, .02, .16, .1, .02, c, 0, 0, i * .3));
  root.add(b.mesh(BI.mat())); return { group: root };
};

/* ---- Partikel (Staub, Konfetti, Funken, Wasser) – ein Draw-Call ---- */
BI.Fx = class Fx {
  constructor(scene, n = 480) {
    this.n = n; this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 4); this.siz = new Float32Array(n);
    this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.max = new Float32Array(n); this.grav = new Float32Array(n); this.i = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(this.col, 4)); g.setAttribute('aSize', new THREE.BufferAttribute(this.siz, 1));
    this.geo = g;
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uScale: { value: 400 } },
      vertexShader: 'attribute vec4 aCol; attribute float aSize; uniform float uScale; varying vec4 vC; void main(){ vC=aCol; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=aSize*uScale/max(-mv.z,.5); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'varying vec4 vC; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor=vec4(vC.rgb,vC.a*smoothstep(.5,.35,d)); }'
    });
    this.mat = m; this.pts = new THREE.Points(g, m); this.pts.frustumCulled = false; scene.add(this.pts);
    for (let k = 0; k < n; k++) this.pos[k * 3 + 1] = -999;
  }
  emit(x, y, z, vx, vy, vz, life, size, r, g, b, grav = 0, a = 1) {
    const k = this.i; this.i = (this.i + 1) % this.n;
    this.pos[k * 3] = x; this.pos[k * 3 + 1] = y; this.pos[k * 3 + 2] = z; this.vel[k * 3] = vx; this.vel[k * 3 + 1] = vy; this.vel[k * 3 + 2] = vz;
    this.life[k] = this.max[k] = life; this.siz[k] = size; this.grav[k] = grav; this.col[k * 4] = r; this.col[k * 4 + 1] = g; this.col[k * 4 + 2] = b; this.col[k * 4 + 3] = a;
  }
  burst(x, y, z, count, colors, speed = 5, life = 1, size = 20, grav = 9) {
    for (let i = 0; i < count; i++) {
      const c = colors[i % colors.length], a = Math.random() * BI.TAU, s = speed * (.4 + Math.random() * .6), up = Math.random() * speed;
      this.emit(x, y, z, Math.cos(a) * s, up, Math.sin(a) * s, life * (.6 + Math.random() * .6), size * (.7 + Math.random() * .6), c[0], c[1], c[2], grav);
    }
  }
  update(dt, h) {
    this.mat.uniforms.uScale.value = h * .0087; // Größe in 1/100 m
    for (let k = 0; k < this.n; k++) {
      if (this.life[k] <= 0) continue;
      this.life[k] -= dt;
      if (this.life[k] <= 0) { this.pos[k * 3 + 1] = -999; this.col[k * 4 + 3] = 0; continue; }
      this.vel[k * 3 + 1] -= this.grav[k] * dt;
      this.pos[k * 3] += this.vel[k * 3] * dt; this.pos[k * 3 + 1] += this.vel[k * 3 + 1] * dt; this.pos[k * 3 + 2] += this.vel[k * 3 + 2] * dt;
      if (this.pos[k * 3 + 1] < .05 && this.grav[k] > 0) { this.pos[k * 3 + 1] = .05; this.vel[k * 3 + 1] *= -.3; this.vel[k * 3] *= .7; this.vel[k * 3 + 2] *= .7; }
      this.col[k * 4 + 3] = Math.min(1, this.life[k] / this.max[k] * 2);
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.aCol.needsUpdate = true; this.geo.attributes.aSize.needsUpdate = true;
  }
};
BI.C = { // Farben für Partikel (r,g,b 0..1)
  gold: [1, .82, .2], white: [1, 1, 1], pink: [1, .45, .7], blue: [.35, .7, 1], water: [.5, .8, 1], green: [.4, .9, .5], red: [1, .35, .35], dust: [.85, .8, .7], purple: [.7, .45, 1], orange: [1, .6, .2]
};
