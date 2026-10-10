'use strict';
/* Bunte Insel – Grundlagen: Mathe, Zufall, Geometrie-Bündelung (Batch), Spielfigur, Partikel */
const BI = window.BI = {};
BI.TAU = Math.PI * 2;
BI.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
BI.lerp = (a, b, t) => a + (b - a) * t;
BI.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
BI.angDiff = (a, b) => { let d = (b - a) % BI.TAU; if (d > Math.PI) d -= BI.TAU; if (d < -Math.PI) d += BI.TAU; return d; };
BI.rng = function (seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
BI.store = {
  get(k, d) { try { const v = localStorage.getItem('bunteInsel.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('bunteInsel.' + k, JSON.stringify(v)); } catch (e) { /* ohne Speicher spielen */ } }
};

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
BI.SHIRTS = [0xff5a5a, 0x3fa0ff, 0xffc933, 0x4cd07d, 0xb36bff, 0xff8fc8];
BI.HATS = ['none', 'bear', 'cat', 'bunny', 'cap', 'crown'];
BI.HAT_ICONS = { none: '🙂', bear: '🐻', cat: '🐱', bunny: '🐰', cap: '🧢', crown: '👑' };
BI.makeChar = function (o) {
  o = o || {};
  const shirt = o.shirt != null ? o.shirt : 0xff5a5a, pants = o.pants != null ? o.pants : 0x3d4a7a, skin = o.skin != null ? o.skin : 0xffd2a8, hair = o.hair != null ? o.hair : 0x6b4423, hat = o.hat || 'none';
  const root = new THREE.Group(), body = new BI.Batch();
  body.box(0, .5, 0, .46, .22, .28, pants);
  body.box(0, .66, 0, .5, .5, .3, shirt);
  body.sph(0, 1.42, 0, .27, skin, 1, 1, 1.05, 1);
  body.box(-.09, 1.44, .24, .06, .08, .04, 0x222233); body.box(.09, 1.44, .24, .06, .08, .04, 0x222233);
  body.box(-.15, 1.34, .23, .07, .05, .04, 0xff9aa8); body.box(.15, 1.34, .23, .07, .05, .04, 0xff9aa8);
  if (hat === 'none' || hat === 'crown') body.sph(0, 1.55, -.03, .27, hair, 1, 1, .62, 1.02);
  if (hat === 'bear') { body.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); body.sph(-.2, 1.68, 0, .1, 0x8a5a33, 1); body.sph(.2, 1.68, 0, .1, 0x8a5a33, 1); body.sph(-.2, 1.68, .04, .05, 0xffc9a0, 0); body.sph(.2, 1.68, .04, .05, 0xffc9a0, 0); }
  if (hat === 'cat') { body.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); body.cone(-.16, 1.62, 0, .1, .22, 0x555566, 4); body.cone(.16, 1.62, 0, .1, .22, 0x555566, 4); }
  if (hat === 'bunny') { body.sph(0, 1.55, -.03, .27, hair, 1, 1, .6, 1.02); body.box(-.11, 1.65, 0, .1, .42, .06, 0xffffff, 0, 0, .12); body.box(.11, 1.65, 0, .1, .42, .06, 0xffffff, 0, 0, -.12); body.box(-.11, 1.7, .03, .05, .3, .03, 0xffb0c8, 0, 0, .12); body.box(.11, 1.7, .03, .05, .3, .03, 0xffb0c8, 0, 0, -.12); }
  if (hat === 'cap') { body.sph(0, 1.55, -.02, .29, 0xe83c3c, 1, 1, .62, 1.02); body.box(0, 1.5, .27, .3, .04, .22, 0xe83c3c); }
  if (hat === 'crown') { body.box(0, 1.66, 0, .32, .1, .32, 0xffcf2e); for (let i = 0; i < 4; i++) body.cone(Math.cos(i * 1.5708) * .13, 1.74, Math.sin(i * 1.5708) * .13, .06, .14, 0xffcf2e, 4); }
  const mat = BI.mat(); root.add(body.mesh(mat));
  function limb(w, h, d, color, tip, x, y) {
    const g = new THREE.Group(), b = new BI.Batch(); b.box(0, -h, 0, w, h, d, color); b.box(0, -h - .06, 0, w * 1.05, .1, d * 1.15, tip);
    g.add(b.mesh(mat)); g.position.set(x, y, 0); root.add(g); return g;
  }
  const legL = limb(.18, .5, .2, pants, 0x2a2a3a, -.13, .52), legR = limb(.18, .5, .2, pants, 0x2a2a3a, .13, .52);
  const armL = limb(.13, .42, .14, shirt, skin, -.34, 1.12), armR = limb(.13, .42, .14, shirt, skin, .34, 1.12);
  root.scale.setScalar(.95);
  return {
    group: root, legL, legR, armL, armR,
    pose(phase, amp, wave) {
      const s = Math.sin(phase) * amp;
      legL.rotation.x = s; legR.rotation.x = -s; armL.rotation.x = -s * .9; armR.rotation.x = s * .9;
      armR.rotation.z = wave ? -2.6 + Math.sin(phase * 2) * .4 : 0;
    },
    sit() { legL.rotation.x = legR.rotation.x = -1.35; armL.rotation.x = armR.rotation.x = -1.0; armR.rotation.z = 0; }
  };
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
