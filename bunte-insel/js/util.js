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
BI.SHIRTS = [0xff5a5a, 0x3fa0ff, 0xffc933, 0x4cd07d, 0xb36bff, 0xff8fc8, 0xffffff, 0x23262d, 0xff8a1f, 0x7de0d0, 0x16335e, 0x8a5a33, 0xc2453d, 0x9aa5b8, 0xf1d98a, 0x2dc4c4]; // die ersten 6 nutzen auch die Passanten
BI.SKINS = [0xffd2a8, 0xf3c9a0, 0xe0a979, 0xc68a5a, 0x8d5a3b, 0x5a3a28, 0xffe4d1, 0xe8b48a, 0x6f4430, 0x8fd18a, 0x8ec5ff, 0xd9a8ff, 0xffb3c9]; // die letzten vier sind Fantasie-Hautfarben
BI.HAIRS = [0x222222, 0x6b4423, 0xa14a2b, 0xd0642a, 0xd9a441, 0xf3d98a, 0xb36bff, 0x3fa0ff, 0xffffff, 0x9aa0a8, 0xe0382b, 0xff8fc8, 0x4cd07d, 0x2dc4c4, 0x16335e, 0x8a5a33, 0xffd23f, 0x6a3fd0];
BI.STYLES = ['none', 'spiky', 'curly', 'long', 'pig', 'bun', 'ponytail', 'bob', 'mohawk', 'afro', 'braids', 'short', 'side', 'dreads', 'topknot', 'twinbuns', 'fringe', 'wavy', 'shaggy', 'pixie', 'curtain', 'mullet', 'bald'];
BI.STYLE_ICONS = ['🙂', '⚡', '🌀', '💇', '🎀', '🍥', '🐴', '🧒', '🦔', '☁️', '🪢', '✂️', '💈', '🧶', '🍙', '🐼', '🪮', '🌊', '🦁', '🧚', '🎭', '🎸', '🥚'];
BI.EYES = [0x222233, 0x3b6fe0, 0x2e9e5b, 0x7a4a1e, 0x9b4de0, 0x9aa0a8, 0xff8a1f, 0xe0382b, 0x2dc4c4, 0xff8fc8];
BI.MOUTHS = ['none', 'smile', 'open', 'grin', 'pout', 'tongue', 'flat', 'sad'];
BI.MOUTH_ICONS = ['😶', '🙂', '😮', '😁', '😗', '😛', '😐', '🙁'];
/* Sims-artige Auswahllisten (Studio): jeder Eintrag [Symbol, Name] */
BI.CUO = {
  build: [['🧍', 'Schlank'], ['🙂', 'Normal'], ['💪', 'Kräftig'], ['🫃', 'Rund']], hgt: [['🐣', 'Winzig'], ['🧒', 'Klein'], ['🙂', 'Mittel'], ['🧑', 'Groß'], ['🦒', 'Riesig']], age: [['👶', 'Kind'], ['🧒', 'Teenie'], ['🧑', 'Erwachsen'], ['👴', 'Senior']],
  face: [['🔵', 'Rund'], ['🥚', 'Oval'], ['⬜', 'Eckig'], ['💗', 'Zart']], nose: [['·', 'Klein'], ['🔵', 'Rund'], ['🔺', 'Spitz'], ['🐽', 'Groß']], brow: [['🚫', 'Keine'], ['➖', 'Normal'], ['🟰', 'Dick'], ['😠', 'Streng']], eyeS: [['👁️', 'Rund'], ['🤩', 'Groß'], ['😑', 'Schmal'], ['😪', 'Müde'], ['✨', 'Glitzer']],
  lip: [0xc2453d, 0xe0382b, 0xff5a8a, 0xb36bff, 0x7a2a3a], beard: [['🚫', 'Kein'], ['🧔', 'Stoppeln'], ['🥸', 'Schnurrbart'], ['🧐', 'Zwirbel'], ['🐐', 'Ziegenbart'], ['🧔‍♂️', 'Vollbart'], ['🎅', 'Langer Bart'], ['🧑‍🦲', 'Koteletten'], ['📍', 'Fliege']], beardc: [null, 0x222222, 0x6b4423, 0xa14a2b, 0xf3d98a, 0xcccccc],
  ctype: [['👕', 'T-Shirt'], ['🧥', 'Kapuzenpulli'], ['🧶', 'Rollkragen'], ['🧥', 'Jacke'], ['👔', 'Anzug'], ['🦺', 'Weste']], sleeve: [['👕', 'Kurz'], ['🧥', 'Lang'], ['🎽', 'Ärmellos']], bot: [['👖', 'Hose'], ['🩳', 'Shorts'], ['👗', 'Rock'], ['👘', 'Langer Rock']], shoeT: [['👟', 'Turnschuhe'], ['🥾', 'Stiefel'], ['🩴', 'Sandalen'], ['🦶', 'Barfuß']],
  glassT: [['🚫', 'Keine'], ['👓', 'Rund'], ['🕶️', 'Sonnenbrille'], ['🤓', 'Streber'], ['💖', 'Herz']], glassC: [0x1b1b25, 0xe0382b, 0x3fa0ff, 0xff5a8a, 0xffd23f], ear: [['🚫', 'Keine'], ['⚪', 'Stecker'], ['⭕', 'Creolen'], ['🌸', 'Blume']], neck: [0, 0xffd23f, 0xff5a8a, 0x3fa0ff, 0xffffff], band: [0, 0xe0382b, 0xffd23f, 0x3fa0ff, 0xff5a8a, 0x23262d], clip: [0, 0xff5a8a, 0xffd23f, 0x3fa0ff], mask: [0, 0x23262d, 0xe0382b, 0x3fa0ff]
};
BI.HGT = [.84, .92, 1, 1.08, 1.16];
BI.AGEV = [{ s: .68, h: 1.28 }, { s: .9, h: 1.1 }, { s: 1, h: 1 }, { s: .95, h: .98 }];
BI.SHOES = [0x2a2a3a, 0xffffff, 0xe0382b, 0xffd23f, 0x3fa0ff, 0x4cd07d];
BI.SIZES = [.88, 1, 1.12];
BI.LOGOS = [null, 0xffffff, 0xffd23f, 0xff5a8a, 0x3fa0ff];
BI.PANTS = [0x3d4a7a, 0x23262d, 0x5a3d2b, 0x2d6a4f, 0x7a3d6a, 0xffffff, 0x16335e, 0x9aa5b8, 0xe0382b, 0xffd23f, 0x6a3fd0, 0xf1d98a];
BI.HATS = ['none', 'bear', 'cat', 'bunny', 'cap', 'crown', 'pirate', 'wizard', 'chef', 'party', 'cowboy', 'helmet', 'viking', 'tophat', 'flowers', 'headphones', 'santa', 'ninja'];
BI.HAT_ICONS = { none: '🙂', bear: '🐻', cat: '🐱', bunny: '🐰', cap: '🧢', crown: '👑', pirate: '🏴‍☠️', wizard: '🧙', chef: '🧑‍🍳', party: '🥳', cowboy: '🤠', helmet: '⛑️', viking: '🪓', tophat: '🎩', flowers: '🌸', headphones: '🎧', santa: '🎅', ninja: '🥷' };
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
  { id: 'oma', name: 'Oma Gerda', icon: '👵', o: { shirt: 0xc2453d, pants: 0x7a3d6a, hair: 0xcccccc, skin: 0xffe4d1, style: 'bun', dress: true, wrink: 1, glassT: 1, necklace: 0xffffff, hsc: .98, scale: .92, shoe: 0x5a3d2b } },
  { id: 'opa', name: 'Opa Otto', icon: '👴', o: { shirt: 0x8a5a33, pants: 0x3d4a7a, hair: 0xe8e8e8, skin: 0xf3c9a0, style: 'bald', beard: 5, beardc: 0xe8e8e8, ctype: 2, glassT: 3, wrink: 1, hsc: .98, scale: .94 } },
  { id: 'kai', name: 'Ninja Kai', icon: '🥷', o: { shirt: 0x23262d, pants: 0x23262d, hair: 0x222222, skin: 0xe0a979, hat: 'ninja', mask: 0xe0382b, sleeve: 1, shoeT: 1, shoe: 0x23262d } },
  { id: 'lilly', name: 'Prinzessin Lilly', icon: '👸', o: { shirt: 0xff8fc8, pants: 0xff8fc8, hair: 0xd9a441, skin: 0xffd2a8, style: 'wavy', dress: true, hat: 'crown', earring: 2, necklace: 0xffffff, eyeS: 1, lip: 0xff5a8a } },
  { id: 'supermax', name: 'Supermax', icon: '🦸', o: { shirt: 0x3fa0ff, pants: 0xe0382b, hair: 0x222222, skin: 0xf3c9a0, style: 'short', cape: true, mask: 0x23262d, build: 2, logo: 0xffd23f, shoeT: 1, shoe: 0xe0382b } },
  { id: 'rex', name: 'Rockstar Rex', icon: '🎸', o: { shirt: 0x23262d, pants: 0x23262d, hair: 0xe0382b, skin: 0xf3c9a0, style: 'mohawk', ctype: 3, glassT: 2, earring: 1, brow: 3, shoeT: 1, shoe: 0x23262d, sleeve: 2 } },
  { id: 'merlin', name: 'Zauberer Merlin', icon: '🧙‍♂️', o: { shirt: 0x6a3fd0, pants: 0x6a3fd0, hair: 0xe8e8e8, skin: 0xffd2a8, hat: 'wizard', beard: 6, beardc: 0xe8e8e8, ctype: 1, wrink: 1, glassT: 1, sleeve: 1, hsc: .98 } },
  { id: 'olaf', name: 'Wikinger Olaf', icon: '🪓', o: { shirt: 0x8a5a33, pants: 0x5a3d2b, hair: 0xd0642a, skin: 0xffd2a8, hat: 'viking', beard: 5, beardc: 0xd0642a, build: 2, shoeT: 1, shoe: 0x5a3d2b, brow: 2 } },
  { id: 'bea', name: 'Bäckerin Bea', icon: '🥐', o: { shirt: 0xffffff, pants: 0xf1d98a, hair: 0x6b4423, skin: 0xf3c9a0, hat: 'chef', overall: true, blush: true, earring: 1, mouth: 'grin' } },
  { id: 'pippo', name: 'Clown Pippo', icon: '🤡', o: { shirt: 0xff5a5a, pants: 0xffd23f, hair: 0xff8a1f, skin: 0xffe4d1, style: 'curly', hat: 'party', nose: 1, mouth: 'grin', eyeS: 1, lip: 0xe0382b, stripe: true, build: 2, shoe: 0xe0382b, bot: 1 } },
  { id: 'custom', name: 'Eigener Held', icon: '🎨', o: {} }
];
BI.heroById = id => BI.HEROES.find(h => h.id === id) || BI.HEROES[0];
/* Studio-Daten (cu) → makeChar-Optionen. Alles optional; ungültige Werte fallen auf Standard zurück (auch bei Daten von Mitspielern). */
BI.cuOpts = function (cu) {
  cu = cu || {}; const C = BI.CUO, n = (v, max, d) => { v = v | 0; return v >= 0 && v < max ? v : d; }, col = (arr, i) => arr[n(i, arr.length, 0)] || 0, o = {};
  const age = n(cu.age, 4, 2), A = BI.AGEV[age], hg = cu.hgt != null ? BI.HGT[n(cu.hgt, 5, 2)] : (BI.SIZES[cu.size == null ? 1 : n(cu.size, 3, 1)] || 1);
  o.scale = hg * A.s; if (A.h !== 1) o.hsc = A.h; if (age === 3) o.wrink = 1;
  if (cu.build != null) o.build = n(cu.build, 4, 1); if (cu.face) o.face = n(cu.face, 4, 0); if (cu.nose) o.nose = n(cu.nose, 4, 0); if (cu.brow != null) o.brow = n(cu.brow, 4, 1); if (cu.eyeS) o.eyeS = n(cu.eyeS, 5, 0);
  if (cu.lip) o.lip = col(C.lip, cu.lip); if (cu.blush === 0) o.blush = false; if (cu.scar) o.scar = 1;
  if (cu.beard) { o.beard = n(cu.beard, 9, 0); const bc = col(C.beardc, cu.beardc); if (bc) o.beardc = bc; }
  if (cu.hair2) o.hair2 = BI.HAIRS[n(cu.hair2, BI.HAIRS.length, 0)];
  if (cu.ctype) o.ctype = n(cu.ctype, 6, 0); if (cu.sleeve) o.sleeve = n(cu.sleeve, 3, 0); if (cu.bot) o.bot = n(cu.bot, 4, 0); if (cu.shoeT) o.shoeT = n(cu.shoeT, 4, 0);
  if (cu.glassT) { o.glassT = n(cu.glassT, 5, 0); o.glassC = col(C.glassC, cu.glassC); } if (cu.ear) o.earring = n(cu.ear, 4, 0); if (cu.neck) o.necklace = col(C.neck, cu.neck) || undefined;
  if (cu.watch) o.watch = 1; if (cu.band) o.headband = col(C.band, cu.band) || undefined; if (cu.clip) o.clip = col(C.clip, cu.clip) || undefined; if (cu.mask) o.mask = col(C.mask, cu.mask) || undefined;
  return o;
};
/* Zufalls-Figur (Würfel-Knopf im Studio) */
BI.randomCu = function () {
  const r = n => (Math.random() * n) | 0, C = BI.CUO, one = (p, a) => Math.random() < p ? a : 0;
  return { skin: r(BI.SKINS.length > 9 ? 9 : BI.SKINS.length), hair: r(BI.HAIRS.length), style: r(BI.STYLES.length), eye: r(BI.EYES.length), mouth: 1 + r(7), pants: r(BI.PANTS.length), shoe: r(BI.SHOES.length), top: 0, build: r(4), hgt: 1 + r(3), age: Math.random() < .5 ? 2 : 1 + r(3), face: r(4), nose: r(4), brow: 1 + r(3), eyeS: r(5), lip: r(5), fr: r(2), beard: Math.random() < .25 ? 1 + r(8) : 0, beardc: r(6), ctype: r(6), sleeve: r(3), bot: r(4), shoeT: r(4), glassT: one(.3, 1 + r(4)), glassC: r(5), ear: r(4), neck: one(.25, 1 + r(4)), band: one(.15, 1 + r(5)), mask: one(.08, 1 + r(3)), watch: one(.2, 1), hair2: one(.25, 1 + r(17)), acc: {} };
};
/* Vorlage (Held) → Studio-Daten: so startet man wie bei den Sims mit einer Vorlage und ändert nur, was man will */
BI.presetToCu = function (po) {
  po = po || {}; const near = (arr, c) => { if (c == null) return 0; let b = 0, bd = 1e12; arr.forEach((v, i) => { const d = ((v >> 16) - (c >> 16)) ** 2 + (((v >> 8) & 255) - ((c >> 8) & 255)) ** 2 + ((v & 255) - (c & 255)) ** 2; if (d < bd) { bd = d; b = i; } }); return b; }, C = BI.CUO;
  const cu = { skin: near(BI.SKINS, po.skin), hair: near(BI.HAIRS, po.hair), style: Math.max(0, BI.STYLES.indexOf(po.style || 'none')), eye: 0, mouth: 1, pants: near(BI.PANTS, po.pants), shoe: near(BI.SHOES, po.shoe != null ? po.shoe : 0x2a2a3a), top: po.dress ? 1 : po.overall ? 2 : 0, stripe: po.stripe ? 1 : 0, logo: po.logo ? near(BI.LOGOS.filter(x => x), po.logo) + 1 : 0, acc: {} };
  for (const k of ['glasses', 'pack', 'cape', 'wings', 'teddy', 'patch']) if (po[k]) cu.acc[k] = true;
  for (const k of ['build', 'face', 'nose', 'brow', 'eyeS', 'beard', 'ctype', 'sleeve', 'bot', 'shoeT', 'glassT']) if (po[k] != null) cu[k] = po[k]; if (po.earring) cu.ear = po.earring; if (po.wrink) cu.age = 3; if (po.beardc != null) cu.beardc = Math.max(0, C.beardc.findIndex(c => c === po.beardc)); if (po.lip != null) cu.lip = Math.max(0, C.lip.indexOf(po.lip));
  if (po.mask) cu.mask = Math.max(0, C.mask.indexOf(po.mask)); if (po.necklace) cu.neck = Math.max(0, C.neck.indexOf(po.necklace)); if (po.mouth) cu.mouth = Math.max(0, BI.MOUTHS.indexOf(po.mouth)); if (po.scale) cu.hgt = po.scale < .9 ? 1 : po.scale > 1.05 ? 3 : 2;
  return { cu, shirt: near(BI.SHIRTS, po.shirt != null ? po.shirt : 0xff5a5a), hat: Math.max(0, BI.HATS.indexOf(po.hat || 'none')) };
};
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
  const root = new THREE.Group(), body = new BI.CharacterBatch();
  body.profile(0,.5,0,[[0,0],[.21,0],[.225,.035],[.225,.2],[.20,.22],[0,.22]],.62,pants);
  body.profile(0,.66,0,[[0,0],[.238,0],[.25,.035],[.245,.16],[.245,.37],[.228,.47],[.15,.50],[0,.50]],.66,shirt);
  if (J) { // bunter Aufdruck wie beim Marvel-Shirt
    body.box(0, 1.05, .155, .38, .07, .02, 0xffffff); body.box(0, .93, .155, .22, .11, .02, 0x3fd18a); body.sph(0, .84, .16, .1, 0x9a5be0, 0, 1, 1, .12); body.sph(0, .84, .17, .045, 0xe8eaff, 0, 1, 1, .1); body.box(0, .73, .155, .28, .1, .02, 0xff5fa8);
  }
  body.arc(0,1.17,.15,.105,.055,.015,new THREE.Color(shirt).multiplyScalar(.72).getHex(),Math.PI,BI.TAU,10);
  body.profile(0,.665,0,[[.242,0],[.247,.02]],.66,new THREE.Color(shirt).multiplyScalar(.86).getHex());
  if(!J&&!o.overall&&!o.logo) { body.box(-.135,.95,.159,.115,.105,.018,new THREE.Color(shirt).lerp(new THREE.Color(0xffffff),.17).getHex()); body.box(-.135,1.025,.174,.115,.012,.012,0xfff1cf); }
  const BLD = [[.86, .9], [1, 1], [1.14, 1.1], [1.3, 1.3]][o.build != null ? Math.max(0, Math.min(3, o.build | 0)) : 1], hd = new BI.CharacterBatch();
  const FS = [[1, 1.05, 1], [.93, 1.14, .97], [1.06, .98, 1.02], [.98, 1.08, 1]][(o.face | 0) & 3];
  hd.sph(0, 1.42, 0, .285, skin, 1, FS[0], FS[1], FS[2]);
  if (((o.face | 0) & 3) === 2) hd.sph(0, 1.325, .008, .20, skin, 1, 1.12, .65, 1.1); // eckiger Kiefer
  const mz = (o.beard | 0) >= 5 ? .285 : .255, dz = mz - .255, lip = o.lip != null ? o.lip : 0xc2453d;
  { const sk2 = new THREE.Color(skin).multiplyScalar(.86).getHex(), hc = new THREE.Color(hair).multiplyScalar(.8).getHex(), ey = o.eye != null ? o.eye : 0x3a2a1a, bc = o.beardc != null ? o.beardc : hair;
    body.cyl(0, 1.1, 0, .085, .095, .12, skin, 8); // Hals
    for (const sd of [-1, 1]) { body.sph(sd * .27, 1.1, 0, .105, shirt, 1, 1, 1, 1); hd.sph(sd * .262, 1.42, 0, .05, skin, 0, .55, 1, .9); } // Schultern + Ohren
    BI.characterFace(hd, o, skin, hair, FS, J);
    const bd = o.beard | 0; // Bart
    if (bd === 1) hd.box(0, 1.28, .245, .27, .13, .03, new THREE.Color(skin).lerp(new THREE.Color(bc), .35).getHex());
    else if (bd >= 2 && bd <= 4 || bd === 7) { hd.box(0, 1.338, .268, .2, .04, .03, bc); if (bd === 3) for (const sd of [-1, 1]) hd.box(sd * .12, 1.355, .268, .07, .03, .03, bc, 0, 0, sd * .6); if (bd === 4) hd.box(0, 1.25, .262, .08, .1, .04, bc); }
    if (bd === 5 || bd === 6) { hd.sph(0,1.25,.10,.235,bc,1,1,.72,.84); for (const sd of [-1, 1]) hd.sph(sd*.232,1.33,.08,.06,bc,0,.65,1.4,1.3); hd.box(0, 1.35, .278, .22, .045, .03, bc); if (bd === 6) { hd.cone(0, .98, .17, .22, .34, bc, 6, 0); } }
    if (bd === 7) for (const sd of [-1, 1]) hd.box(sd * .24, 1.34, .14, .05, .16, .14, bc);
    if (bd === 8) hd.box(0, 1.268, .266, .04, .04, .03, bc);
    const gt = o.glassT | 0, gc = o.glassC != null ? o.glassC : 0x1b1b25; // Brillen-Typen
    if (gt === 1) { for (const sd of [-1,1]) { hd.arc(sd*.105,1.458,.321,.067,.066,.009,gc,0,BI.TAU,16);hd.box(sd*.185,1.45,.23,.015,.014,.17,gc); }hd.arc(0,1.461,.319,.038,.012,.007,gc,0,Math.PI,6); }
    else if (gt === 2) { for (const sd of [-1, 1]) hd.box(sd * .095, 1.45, .308, .15, .1, .03, gc); hd.box(0, 1.46, .308, .06, .02, .03, gc); for (const sd of [-1, 1]) hd.box(sd * .19, 1.46, .22, .03, .03, .1, gc); }
    else if (gt === 3) { for (const sd of [-1, 1]) { hd.box(sd * .095, 1.5, .308, .16, .025, .025, gc); hd.box(sd * .095, 1.4, .308, .16, .025, .025, gc); hd.box(sd * .095 - .08, 1.45, .308, .025, .1, .025, gc); hd.box(sd * .095 + .08, 1.45, .308, .025, .1, .025, gc); } hd.box(0, 1.46, .308, .06, .025, .025, gc); }
    else if (gt === 4) for (const sd of [-1, 1]) { hd.box(sd * .095, 1.46, .308, .15, .05, .03, 0xff5a8a); hd.box(sd * .095, 1.42, .308, .1, .05, .03, 0xff5a8a); hd.box(sd * .095, 1.485, .308, .06, .04, .03, 0xff5a8a); }
    if (o.mask) { for (const sd of [-1,1]) hd.arc(sd*.105,1.458,.311,.067,.068,.015,o.mask,0,BI.TAU,12); hd.box(0,1.45,.31,.065,.025,.018,o.mask); }
    const er = o.earring | 0; if (er) for (const sd of [-1, 1]) { if (er === 1) hd.sph(sd * .308, 1.36, 0, .03, 0xffd23f, 0); else if (er === 2) for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; hd.sph(sd * .277, 1.33 + Math.cos(a) * .05, Math.sin(a) * .05, .014, 0xffd23f, 0); } else hd.sph(sd * .308, 1.35, 0, .05, 0xff5a8a, 0, .6, 1, 1); }
    if (o.headband) { hd.box(0, 1.55, 0, .6, .06, .56, o.headband); }
    if (o.clip) hd.box(.2, 1.6, .12, .12, .04, .04, o.clip, 0, 0, .4);
  }
  BI.characterHair(hd, o, hair, J);
  if (hat === 'bear') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); hd.sph(-.2, 1.68, 0, .1, 0x8a5a33, 1); hd.sph(.2, 1.68, 0, .1, 0x8a5a33, 1); hd.sph(-.2, 1.68, .04, .05, 0xffc9a0, 0); hd.sph(.2, 1.68, .04, .05, 0xffc9a0, 0); }
  if (hat === 'cat') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); hd.cone(-.16, 1.62, 0, .1, .22, 0x555566, 4); hd.cone(.16, 1.62, 0, .1, .22, 0x555566, 4); }
  if (hat === 'bunny') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); hd.box(-.11, 1.65, 0, .1, .42, .06, 0xffffff, 0, 0, .12); hd.box(.11, 1.65, 0, .1, .42, .06, 0xffffff, 0, 0, -.12); hd.box(-.11, 1.7, .03, .05, .3, .03, 0xffb0c8, 0, 0, .12); hd.box(.11, 1.7, .03, .05, .3, .03, 0xffb0c8, 0, 0, -.12); }
  if (hat === 'cap') { hd.sph(0, 1.55, -.02, .29, 0xe83c3c, 1, 1, .62, 1.02); hd.box(0, 1.5, .27, .3, .04, .22, 0xe83c3c); }
  if (hat === 'crown') { hd.box(0, 1.66, 0, .32, .1, .32, 0xffcf2e); for (let i = 0; i < 4; i++) hd.cone(Math.cos(i * 1.5708) * .13, 1.74, Math.sin(i * 1.5708) * .13, .06, .14, 0xffcf2e, 4); }
  if (hat === 'pirate') { hd.box(0, 1.66, 0, .5, .14, .38, 0x1b1b25); hd.box(0, 1.6, 0, .72, .07, .5, 0x1b1b25); hd.box(-.34, 1.66, 0, .07, .16, .46, 0x1b1b25); hd.box(.34, 1.66, 0, .07, .16, .46, 0x1b1b25); hd.box(0, 1.62, .25, .18, .13, .05, 0x1b1b25); hd.box(0, 1.67, .285, .11, .09, .02, 0xffffff); hd.box(-.025, 1.685, .297, .03, .03, .01, 0x111111); hd.box(.025, 1.685, .297, .03, .03, .01, 0x111111); }
  if (hat === 'wizard') { hd.cone(0, 1.6, 0, .3, .72, 0x6a3fd0, 8); hd.box(0, 1.58, 0, .74, .04, .74, 0x5a2fc0); hd.box(.1, 1.9, .2, .07, .07, .02, 0xffd23f, 0, 0, .8); hd.box(-.12, 1.78, .22, .06, .06, .02, 0xffd23f, 0, 0, .8); }
  if (hat === 'chef') { hd.cyl(0, 1.58, 0, .22, .22, .24, 0xffffff, 10); hd.sph(0, 1.9, 0, .28, 0xffffff, 1, 1, .8, 1); }
  if (hat === 'party') { hd.cone(0, 1.62, 0, .2, .56, 0xff5ab0, 8); hd.box(0, 1.8, 0, .3, .05, .3, 0xffd23f, .5); hd.sph(0, 2.2, 0, .07, 0xffd23f, 0); }
  if (hat === 'cowboy') { hd.box(0, 1.6, 0, .86, .04, .76, 0xa8703a); hd.cyl(0, 1.62, 0, .2, .2, .22, 0xb98650, 8); hd.box(0, 1.66, 0, .43, .05, .43, 0x6b4423); hd.box(-.4, 1.62, 0, .1, .06, .7, 0xa8703a, 0, 0, .4); hd.box(.4, 1.62, 0, .1, .06, .7, 0xa8703a, 0, 0, -.4); }
  if (hat === 'helmet') { hd.sph(0, 1.56, -.02, .33, 0xffd23f, 1, 1, .7, 1.05); hd.box(0, 1.73, 0, .07, .04, .56, 0xffffff); hd.box(0, 1.52, .3, .34, .05, .1, 0x1c3f9e); }
  if (hat === 'viking') { hd.sph(0, 1.55, -.02, .31, 0xa8a8b4, 1, 1, .7, 1.05); for (const sd of [-1, 1]) { hd.cone(sd * .3, 1.62, 0, .07, .3, 0xf4e6c8, 5, 0, 0, sd * -.5); } hd.box(0, 1.5, .3, .3, .05, .08, 0x7a7a86); }
  if (hat === 'tophat') { hd.cyl(0, 1.58, 0, .34, .34, .05, 0x1b1b25, 12); hd.cyl(0, 1.62, 0, .22, .22, .4, 0x1b1b25, 12); hd.cyl(0, 1.68, 0, .225, .225, .07, 0xc2453d, 12); }
  if (hat === 'flowers') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .62, 1.02); for (let i = 0; i < 7; i++) { const a = i * .9; hd.sph(Math.sin(a) * .26, 1.62, Math.cos(a) * .24 - .03, .07, [0xff5a8a, 0xffd23f, 0xffffff][i % 3], 0); } }
  if (hat === 'headphones') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .62, 1.02); hd.box(0, 1.7, 0, .56, .05, .07, 0x2b2f3a); for (const sd of [-1, 1]) hd.cyl(sd * .29, 1.34, 0, .12, .12, .1, 0xe0382b, 10, 0, 0, Math.PI / 2); }
  if (hat === 'santa') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .62, 1.02); hd.cone(-.02, 1.6, -.02, .27, .55, 0xe0382b, 8, 0, 0, .25); hd.cyl(0, 1.56, -.01, .3, .3, .1, 0xffffff, 12); hd.sph(.12, 2.05, -.06, .08, 0xffffff, 0); }
  if (hat === 'ninja') { hd.sph(0, 1.55, -.03, .27, hair, 1, 1, .62, 1.02); hd.box(0, 1.5, 0, .58, .09, .54, 0x23262d); hd.box(0, 1.5, -.3, .1, .3, .08, 0x23262d, 0, 0, .3); }
  { const ct = o.ctype | 0, shd = new THREE.Color(shirt).multiplyScalar(.8).getHex(), bot = o.bot | 0; // Kleidungs-Details
    if (ct === 1) { body.sph(0, 1.12, -.15, .2, shd, 1, 1.3, .8, .8); body.box(0, .6, .158, .3, .12, .02, shd); body.box(-.05, .93, .16, .02, .12, .02, 0xffffff); body.box(.05, .93, .16, .02, .12, .02, 0xffffff); }
    else if (ct === 2) { body.cyl(0, 1.06, 0, .15, .16, .16, shd, 10); }
    else if (ct === 3) { body.box(0, .66, .158, .03, .5, .02, 0x8a8f9a); for (const sd of [-1, 1]) { body.box(sd * .1, 1.04, .15, .12, .08, .05, shd, 0, 0, sd * .5); } body.box(0, .52, .158, .5, .04, .02, shd); }
    else if (ct === 4) { body.box(0, .9, .156, .18, .3, .02, 0xffffff); body.box(0, .86, .163, .06, .3, .02, 0xe0382b); for (const sd of [-1, 1]) body.box(sd * .15, .95, .158, .14, .26, .02, shd, 0, 0, sd * .12); }
    else if (ct === 5) { body.box(0, .66, .158, .34, .46, .02, shd); }
    if (!o.dress && bot === 2) body.profile(0,.3,0,[[0,0],[.35,0],[.35,.03],[.24,.3],[0,.3]],.7,pants);
    else if (!o.dress && bot === 3) body.profile(0,.14,0,[[0,0],[.38,0],[.38,.035],[.24,.48],[0,.48]],.7,pants);
    if (o.necklace) { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; body.sph(Math.sin(a) * .13, 1.04, Math.cos(a) * .12, .022, o.necklace, 0); } body.sph(0, .98, .13, .045, 0xffd23f, 0); } }
  if (o.dress) { body.profile(0,.32,0,[[0,0],[.345,0],[.345,.035],[.235,.37],[0,.37]],.72,shirt);body.profile(0,.32,0,[[.347,0],[.347,.028]],.72,pants); }
  if (o.overall) { body.box(0, .66, .156, .34, .36, .02, pants); for (const sd of [-1, 1]) body.box(sd * .13, .98, .156, .06, .26, .02, pants); body.sph(-.13, .86, .165, .035, 0xffd23f, 0); body.sph(.13, .86, .165, .035, 0xffd23f, 0); }
  if (o.stripe) for (let i = 0; i < 3; i++) body.box(0, .52 + i * .2, 0, .52, .07, .32, 0xffffff);
  if (o.logo != null) { body.box(0, .86, .156, .17, .17, .02, o.logo); body.box(0, .86, .16, .07, .07, .02, shirt); }
  if (o.patch) { hd.box(-.09, 1.4, .308, .13, .13, .03, 0x111111); hd.box(0, 1.47, .265, .58, .03, .02, 0x111111, 0, 0, .18); }
  if (o.cape) { body.box(0, .45, -.2, .54, .8, .05, 0xd8283a); body.box(0, 1.08, -.12, .42, .12, .2, 0xd8283a); body.sph(0, 1.08, .0, .05, 0xffd23f, 0); }
  if (o.wings) { for (const sd of [-1, 1]) { body.box(sd * .32, .85, -.22, .5, .55, .03, 0xbfe8ff, 0, 0, sd * .55); body.box(sd * .38, .55, -.22, .34, .34, .03, 0xffc8ee, 0, 0, sd * .5); } }
  if (o.glasses) { hd.box(0, 1.4, .308, .17, .12, .03, 0x1b1b25); hd.box(.0, 1.4, .308, .17, .12, .03, 0x1b1b25); hd.box(-.1, 1.4, .308, .17, .12, .03, 0x1b1b25); hd.box(.1, 1.4, .308, .17, .12, .03, 0x1b1b25); hd.box(0, 1.46, .27, .08, .03, .03, 0x1b1b25); hd.box(-.19, 1.46, .22, .03, .03, .1, 0x1b1b25); hd.box(.19, 1.46, .22, .03, .03, .1, 0x1b1b25); }
  if (o.scarf) { body.box(0, 1.1, 0, .54, .13, .34, 0xe0382b); body.box(.18, .75, .17, .12, .4, .05, 0xe0382b); body.box(.18, .85, .17, .12, .05, .05, 0xffffff); }
  if (o.bowtie) { body.box(-.07, 1.11, .17, .1, .08, .04, 0xe0382b, 0, 0, .2); body.box(.07, 1.11, .17, .1, .08, .04, 0xe0382b, 0, 0, -.2); body.sph(0, 1.11, .18, .035, 0x8a1a1a, 0); }
  if (o.medal) { body.box(0, 1.1, .16, .05, .35, .02, 0x3fa0ff, 0, 0, .1); body.cyl(.04, .85, .17, .08, .08, .03, 0xffd23f, 10, Math.PI / 2); }
  if (o.pack) { body.box(0, .52, -.23, .42, .55, .16, 0x3fa8e8); body.box(0, .98, -.23, .32, .12, .13, 0x2d80c0); body.box(-.15, .55, .155, .05, .5, .02, 0x2d80c0); body.box(.15, .55, .155, .05, .5, .02, 0x2d80c0); }
  if (o.teddy) { body.sph(-.34, 1.3, .03, .11, 0xc8a27a, 1); body.sph(-.34, 1.46, .03, .08, 0xc8a27a, 1); body.sph(-.4, 1.53, .03, .035, 0xc8a27a, 0); body.sph(-.28, 1.53, .03, .035, 0xc8a27a, 0); body.sph(-.34, 1.44, .1, .035, 0xe8d0b0, 0); }
  const hsc = o.hsc && o.hsc !== 1 ? o.hsc : 1, sepHead = hsc !== 1 || BLD[0] !== 1 || BLD[1] !== 1, lx = 1 + (BLD[0] - 1) * .9;
  if (!sepHead) for (const k of ['p', 'n', 'c']) { const a = hd[k], b = body[k]; for (let i = 0; i < a.length; i++) b.push(a[i]); }
  const mat = BI.mat(), bm = body.mesh(mat); bm.position.y = .1; bm.scale.set(BLD[0], 1, BLD[1]); root.add(bm);
  if (sepHead) { const hg = new THREE.Group(), hm = hd.mesh(mat); hg.position.set(0, 1.3, 0); hm.position.set(0, -1.2, 0); hg.scale.setScalar(hsc); hg.add(hm); root.add(hg); }
  function arm(sleeve, hand, x, y) { // Ärmel bis zum Ellbogen (lang = ganzer Arm, ohne = Haut), Unterarm in Hautfarbe, runde Hand
    const sl = o.sleeve | 0, g = new THREE.Group(), b = new BI.CharacterBatch(); b.cyl(0, -.25, 0, .082, .07, .25, sl === 2 ? hand : sleeve, 6); b.sph(0, -.25, 0, .07, sl === 1 ? sleeve : hand, 0); b.cyl(0, -.44, 0, .062, .052, .2, sl === 1 ? sleeve : hand, 6); b.sph(0, -.47, .01, .072, hand, 1, .95, 1.1, .9); b.sph(x<0?.051:-.051,-.445,.036,.027,hand,0,.8,1.1,1);
    if (o.watch && x < 0) { b.box(0, -.4, 0, .13, .055, .13, 0x23262d); b.box(0, -.4, .068, .07, .045, .012, 0xffd23f); }
    g.add(b.mesh(mat)); g.position.set(x * BLD[0], y, 0); g.scale.set(lx, 1, lx); root.add(g); return g;
  }
  function leg(pant, shoeC, x, y) { // Oberschenkel, Wade, Schuh (Turnschuh / Stiefel / Sandale / barfuß)
    const bt = o.bot | 0, st = o.shoeT | 0, lc = bt >= 2 ? skin : pant, lo = bt === 1 || bt >= 2 ? skin : pant, g = new THREE.Group(), b = new BI.CharacterBatch();
    b.cyl(0, -.34, 0, .105, .088, .34, lc, 6); b.sph(0, -.34, 0, .088, lo, 0); b.cyl(0, -.58, 0, .088, .07, .26, lo, 6);
    if (st === 2 || st === 3) { b.box(0, -.62, .045, .17, .06, .3, skin); b.sph(0, -.6, .17, .087, skin, 0, 1, .6, 1.1); if (st === 2) { b.box(0, -.56, .08, .18, .03, .05, shoeC); b.box(0, -.56, -.02, .18, .03, .05, shoeC); } }
    else { b.box(0, -.62, .045, .17, .09, .3, shoeC); b.sph(0, -.6, .17, .087, shoeC, 0, 1, .75, 1.1); b.box(0,-.615,.047,.176,.032,.31,0xfff6e5); b.box(0, -.55, -.02, .15, .03, .12, 0xffffff); for(const zz of [.05,.095])b.box(0,-.54,zz,.105,.009,.012,0xfff6e5); if (st === 1) b.cyl(0, -.52, 0, .098, .098, .2, shoeC, 6); }
    g.add(b.mesh(mat)); g.position.set(x * BLD[0], y, 0); g.scale.set(lx, 1, lx); root.add(g); return g;
  }
  const shoe = o.shoe != null ? o.shoe : 0x2a2a3a, legL = leg(pants, shoe, -.13, .62), legR = leg(pants, shoe, .13, .62);
  const armL = arm(shirt, skin, -.34, 1.22), armR = arm(shirt, skin, .34, 1.22);
  if (o.name) {
    const cv0 = document.createElement('canvas'); cv0.width = 512; cv0.height = 128; const cx0 = cv0.getContext('2d'); cx0.scale(2,2); cx0.font = 'bold 40px Fredoka, system-ui, sans-serif'; cx0.textAlign = 'center'; cx0.textBaseline = 'middle'; cx0.lineWidth = 8; cx0.strokeStyle = '#16335e'; cx0.strokeText(o.name, 128, 34); cx0.fillStyle = '#fff'; cx0.fillText(o.name, 128, 34);
    const sp0 = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv0), transparent: true, depthWrite: false })); sp0.scale.set(1.5, .38, 1); sp0.position.y = 2.25; root.add(sp0);
  }
  let remoteMesh = null;
  if (J) { // Fernsteuerung mit Lenkrad und Antenne in der rechten Hand
    const rb = new BI.CharacterBatch(); rb.cyl(0, -.04, 0, .15, .15, .06, 0x23262d, 12, Math.PI / 2); rb.cyl(0, -.03, .02, .09, .09, .07, 0x3a3f4a, 10, Math.PI / 2); rb.box(.02, 0, 0, .025, .6, .025, 0xffffff, 0, 0, -.12); rb.box(.09, .58, 0, .035, .08, .035, 0xff5a3a, 0, 0, -.12);
    const rm = remoteMesh = rb.mesh(mat); rm.position.set(0, -.55, .13); armR.add(rm);
  }
  root.scale.setScalar(o.scale || .95);
  return {
    group: root, legL, legR, armL, armR, remote: remoteMesh,
    dispose() { root.traverse(m => { if(m.geometry)m.geometry.dispose(); if(m.isSprite){if(m.material.map)m.material.map.dispose();m.material.dispose();} }); if(root.parent)root.parent.remove(root); },
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

