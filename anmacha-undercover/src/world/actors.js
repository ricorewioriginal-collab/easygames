/* AnMaCha UNDERCOVER 3D – animierte Figuren (Funkhaus-Crew) aus Three.js-Grundkörpern.
   AMU.Actors.create(look, { quality }) → actor { root, setAnim, update, setLook, setGhost, setHighlight, setDown, dispose }
   Jedes Körperteil (Kopf, Rumpf, Ober-/Unterarm, Ober-/Unterschenkel …) wird pro Figur zu EINER Geometrie mit
   Vertexfarben zusammengefügt → wenige Draw-Calls, gemeinsame Materialien. Vorlagen-Geometrien und Materialien sind
   modulweit gecacht und werden nie pro Figur freigegeben; dispose() gibt nur die zusammengefügten Teile der Figur frei. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const T = root.THREE;
  const PI = Math.PI;

  // ---------- Qualitätsstufen & gecachte Vorlagen (nur CPU, werden nie gerendert) ----------
  const Q = { low: [8, 6, 6, 4, 10], mid: [12, 9, 10, 5, 14], high: [18, 13, 14, 6, 20] };
  const protoCache = {};
  function protos(q) {
    if (protoCache[q]) return protoCache[q];
    const [sw, sh, c, tr, tt] = Q[q];
    return (protoCache[q] = {
      sph: new T.SphereGeometry(1, sw, sh),
      hemi: new T.SphereGeometry(1, sw, Math.ceil(sh / 2), 0, PI * 2, 0, PI / 2),
      cyl: new T.CylinderGeometry(1, 1, 1, c),
      cylT: new T.CylinderGeometry(0.8, 1, 1, c),
      cone: new T.ConeGeometry(1, 1, c),
      box: new T.BoxGeometry(1, 1, 1),
      ring: new T.TorusGeometry(1, 0.12, tr, tt),
      ringT: new T.TorusGeometry(1, 0.32, tr, tt),
      arc: new T.TorusGeometry(1, 0.22, tr, Math.ceil(tt / 2), PI)
    });
  }

  // ---------- Materialien (gemeinsam, nach Schlüssel) ----------
  const mats = {};
  function mat(q, v) {   // v: 0 normal, 1 markiert, 2 Geist, 3 Geist+markiert
    const k = q + v;
    if (mats[k]) return mats[k];
    const m = q === 'low' ? new T.MeshLambertMaterial({ vertexColors: true }) : new T.MeshToonMaterial({ vertexColors: true });
    if (v & 1) m.emissive.set(0x6a4214);
    if (v & 2) { m.transparent = true; m.opacity = 0.55; m.emissive.set(v & 1 ? 0x5ab0d0 : 0x1d7fa8); }
    return (mats[k] = m);
  }
  function special(k) {
    if (mats[k]) return mats[k];
    let m;
    if (k === 'outline') {
      m = new T.MeshBasicMaterial({ color: 0xffc23d, side: T.BackSide });
      m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.022;'); };
      m.customProgramCacheKey = () => 'amu-outline';
    } else if (k === 'halo') {
      m = new T.MeshBasicMaterial({ color: 0x29d3ff, transparent: true, opacity: 0.09, blending: T.AdditiveBlending, depthWrite: false });
    } else {
      m = new T.MeshBasicMaterial({ color: 0xffd23f, side: T.DoubleSide });
    }
    return (mats[k] = m);
  }
  let starGeo = null;
  function star() {
    if (starGeo) return starGeo;
    const s = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.035 : 0.085, a = PI / 2 + i * PI / 5;
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return (starGeo = new T.ShapeGeometry(s));
  }

  // ---------- Zusammenfügen (eine Geometrie mit Vertexfarben je Körperteil) ----------
  const _m = new T.Matrix4(), _n = new T.Matrix3(), _p = new T.Vector3(), _s = new T.Vector3(), _v = new T.Vector3();
  const _q = new T.Quaternion(), _e = new T.Euler(), _c = new T.Color();
  function merge(parts) {
    let nv = 0, ni = 0;
    for (const p of parts) { nv += p.g.attributes.position.count; ni += p.g.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const p of parts) {
      _m.compose(_p.set(p.x, p.y, p.z), _q.setFromEuler(_e.set(p.rx, p.ry, p.rz)), _s.set(p.sx, p.sy, p.sz));
      _n.getNormalMatrix(_m); _c.set(p.c);
      const P = p.g.attributes.position, N = p.g.attributes.normal, n = P.count, I = p.g.index.array;
      for (let i = 0; i < n; i++) {
        const o = (vo + i) * 3;
        _v.fromBufferAttribute(P, i).applyMatrix4(_m); pos[o] = _v.x; pos[o + 1] = _v.y; pos[o + 2] = _v.z;
        _v.fromBufferAttribute(N, i).applyMatrix3(_n).normalize(); nor[o] = _v.x; nor[o + 1] = _v.y; nor[o + 2] = _v.z;
        col[o] = _c.r; col[o + 1] = _c.g; col[o + 2] = _c.b;
      }
      for (let k = 0; k < I.length; k++) idx[io++] = I[k] + vo;
      vo += n;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.BufferAttribute(nor, 3));
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    g.setIndex(new T.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    return g;
  }

  // ---------- Körperbau ----------
  // thigh/shin/foot: Beinlängen · tH/tW/tD: Rumpf · hr: Kopfradius · up/fo: Ober-/Unterarm · idle: Ruhe-Stil
  const BODY = {
    kurz:  { thigh: .25, shin: .23, foot: .06, legR: .085, hipX: .11, tH: .42, tW: .48, tD: .34, shape: 'jacket', neck: .04, head: 'sph', hr: .27, up: .2, fo: .19, armR: .068, hand: .075, idle: 'look' },
    gross: { thigh: .37, shin: .35, foot: .05, legR: .068, hipX: .09, tH: .52, tW: .38, tD: .25, shape: 'jacket', neck: .07, head: 'sph', hr: .2, hy: 1.12, up: .27, fo: .26, armR: .05, hand: .06, idle: 'sway' },
    rund:  { thigh: .2, shin: .19, foot: .06, legR: .095, hipX: .14, tH: .58, tW: .64, tD: .54, shape: 'round', neck: 0, head: 'sph', hr: .24, up: .19, fo: .18, armR: .072, hand: .08, idle: 'rock' },
    robo:  { thigh: .29, shin: .27, foot: .06, legR: .07, hipX: .12, tH: .46, tW: .52, tD: .34, shape: 'box', neck: .06, head: 'box', hr: .22, up: .23, fo: .22, armR: .058, hand: .075, idle: 'robot' },
    mikro: { thigh: .21, shin: .2, foot: .07, legR: .08, hipX: .1, tH: .38, tW: .4, tD: .32, shape: 'pear', neck: .05, head: 'mic', hr: .21, up: .18, fo: .17, armR: .06, hand: .07, idle: 'groove' },
    kid:   { thigh: .19, shin: .19, foot: .06, legR: .075, hipX: .09, tH: .36, tW: .4, tD: .28, shape: 'jacket', neck: .03, head: 'sph', hr: .31, up: .17, fo: .16, armR: .056, hand: .066, idle: 'bounce', phones: true },
    lang:  { thigh: .43, shin: .41, foot: .05, legR: .064, hipX: .09, tH: .4, tW: .37, tD: .25, shape: 'jacket', neck: .05, head: 'sph', hr: .21, up: .25, fo: .24, armR: .05, hand: .06, idle: 'tap' }
  };
  const PANTS = '#25304d', SHOE = '#1b2030', SOLE = '#eef2f7', DARK = '#141a2e', METAL = '#8e9bb0', GOLD = '#ffc93c';
  const LIGHT = { weiss: 1, gelb: 1, mint: 1, cyan: 1 };
  function shade(hex, f) {
    _c.set(hex); return '#' + _c.setRGB(Math.min(1, _c.r * f), Math.min(1, _c.g * f), Math.min(1, _c.b * f)).getHexString();
  }

  // Segmentbaum: [name, parent]; bei 'low' werden Kind-Segmente ins Elternteil gefügt (weniger Draw-Calls)
  const SEGS = [['hips', null], ['spine', 'hips'], ['head', 'spine'], ['eyes', 'head'], ['mouth', 'head'], ['armL', 'spine'], ['foreL', 'armL'],
    ['armR', 'spine'], ['foreR', 'armR'], ['legL', 'hips'], ['shinL', 'legL'], ['legR', 'hips'], ['shinR', 'legR'], ['tail', 'hips']];
  const LOW_MERGE = { foreL: 'armL', foreR: 'armR', shinL: 'legL', shinR: 'legR', eyes: 'head', mouth: 'head' };

  function build(look, q) {
    const CO = AMU.COSMETICS, L = CO.validLook(look), b = BODY[L.body], P = protos(q), low = q === 'low';
    const skin = CO.skins[L.skin], out = CO.colorHex(L.color), outD = shade(out, 0.72), hairC = L.hairColor;
    const stripe = LIGHT[L.color] ? '#1d2a4a' : '#f4f6fa', accent = L.color === 'cyan' ? '#ff9a2e' : '#29d3ff';
    const robo = b.head === 'box', mic = b.head === 'mic';
    const limbC = robo ? skin : out;
    const hipY = b.thigh + b.shin + b.foot, tH = b.tH, tW = b.tW, tD = b.tD;
    const parts = {}; SEGS.forEach(s => (parts[s[0]] = []));
    const add = (seg, g, c, x, y, z, sx, sy, sz, rx, ry, rz) =>
      parts[seg].push({ g: P[g], c, x, y, z, sx, sy: sy == null ? sx : sy, sz: sz == null ? sx : sz, rx: rx || 0, ry: ry || 0, rz: rz || 0 });

    // --- Rumpf: Form-Funktion f(y) = Anteil der halben Breite/Tiefe an Höhe y ---
    const sh = b.shape;
    const f = y => {
      if (sh === 'box') return 1;
      if (sh === 'round') return Math.sqrt(Math.max(0, 1 - Math.pow((y - tH / 2) / (tH / 2), 2)));
      if (sh === 'pear') return Math.sqrt(Math.max(0, 1 - Math.pow((y - tH * 0.45) / (tH * 0.56), 2)));
      return y <= tH * 0.76 ? 1 - 0.06 * (y / tH) : Math.sqrt(Math.max(0, 1 - Math.pow((y - tH * 0.76) / (tH * 0.26), 2))) * 0.955;
    };
    const fz = y => tD / 2 * f(y);
    // Hose/Becken
    add('hips', 'sph', robo ? shade(skin, 0.7) : PANTS, 0, 0.03, 0, tW * 0.46, 0.13, tD * 0.46);
    if (sh === 'jacket') {
      add('spine', 'cyl', out, 0, tH * 0.38 + 0.04, 0, tW / 2 * 0.955, tH * 0.76, tD / 2 * 0.955);
      add('spine', 'sph', out, 0, tH * 0.76, 0, tW / 2 * 0.955, tH * 0.26, tD / 2 * 0.955);
      add('spine', 'cyl', outD, 0, 0.06, 0, tW / 2 * 1.0, 0.07, tD / 2 * 1.0);       // Bund
      add('spine', 'ringT', outD, 0, tH * 0.98, -tD * 0.08, tW * 0.2, tW * 0.2, tW * 0.2 * 0.9, PI / 2); // Kapuzenkragen
    } else if (sh === 'round') {
      add('spine', 'sph', out, 0, tH / 2, 0, tW / 2, tH / 2, tD / 2);
      add('spine', 'cyl', outD, 0, tH * 0.12, 0, tW / 2 * f(tH * 0.12) * 1.02, 0.06, tD / 2 * f(tH * 0.12) * 1.02);
    } else if (sh === 'pear') {
      add('spine', 'sph', out, 0, tH * 0.45, 0, tW / 2, tH * 0.56, tD / 2);
      add('spine', 'ringT', outD, 0, tH * 0.98, 0, tW * 0.18, tW * 0.18, tW * 0.18, PI / 2);
    } else {   // Robo: Kasten-Overall mit Bildschirm
      add('spine', 'box', out, 0, tH / 2 + 0.02, 0, tW, tH, tD);
      add('spine', 'box', outD, 0, tH + 0.01, 0, tW * 0.8, 0.05, tD * 0.8);
      add('spine', 'box', DARK, 0, tH * 0.42, tD / 2 + 0.005, tW * 0.5, tH * 0.26, 0.02);
      for (let i = 0; i < 3; i++) add('spine', 'box', i === 1 ? '#ff9a2e' : '#29d3ff', -tW * 0.14 + i * tW * 0.14, tH * 0.38 + (i % 2) * 0.03, tD / 2 + 0.017, tW * 0.08, 0.03 + (i % 2) * 0.05, 0.01);
    }
    // Streifen über die Brust + Reißverschluss
    const yS = tH * (sh === 'round' ? 0.52 : 0.56), kS = sh === 'box' ? 1.01 : 1.03;
    if (sh === 'box') add('spine', 'box', stripe, 0, yS + 0.13, 0, tW * kS, 0.04, tD * kS);
    else add('spine', 'cyl', stripe, 0, yS, 0, tW / 2 * f(yS) * kS, 0.045, tD / 2 * f(yS) * kS);
    if (sh === 'jacket') add('spine', 'box', '#cfd6e2', 0, tH * 0.4, fz(tH * 0.4) + 0.004, 0.016, tH * 0.68, 0.012);
    // Funkhaus-Abzeichen (rund, mit Mini-Antenne)
    const yB = tH * (sh === 'box' ? 0.8 : 0.7), xB = tW * 0.22, zB = sh === 'box' ? tD / 2 + 0.01 : fz(yB) * Math.sqrt(Math.max(0.3, 1 - Math.pow(xB / (tW / 2 * f(yB)), 2))) + 0.004;
    add('spine', 'cyl', '#ff9a2e', xB, yB, zB, 0.042, 0.02, 0.042, PI / 2 - 0.15);
    add('spine', 'cyl', '#0b1630', xB, yB, zB + 0.009, 0.028, 0.012, 0.028, PI / 2 - 0.15);
    add('spine', 'sph', '#29d3ff', xB, yB, zB + 0.016, 0.012);
    add('spine', 'box', '#ff9a2e', xB + 0.012, yB + 0.05, zB, 0.008, 0.04, 0.008, 0, 0, -0.4);
    // Hals
    if (b.neck > 0) add('spine', 'cyl', robo ? DARK : skin, 0, tH + b.neck / 2, 0, robo ? 0.06 : 0.065, b.neck + 0.08, robo ? 0.06 : 0.065);
    // Accessoires am Hals
    if (L.hat === 'schal') {
      const yN = tH * 0.97, r = tW * 0.21;
      add('spine', 'ringT', '#ff9a2e', 0, yN, 0, r, r, r * 0.95, PI / 2);
      add('spine', 'box', '#ff9a2e', r * 0.55, yN - 0.12, fz(yN - 0.12) + 0.03, 0.07, 0.2, 0.025, 0.1, 0, 0.1);
      add('spine', 'box', '#29d3ff', r * 0.55 + 0.004, yN - 0.17, fz(yN - 0.12) + 0.045, 0.072, 0.025, 0.012, 0.1, 0, 0.1);
    } else if (L.hat === 'fliege') {
      const yN = tH * 0.9, z = fz(yN) + 0.02;
      add('spine', 'cone', '#e8413c', -0.045, yN, z, 0.035, 0.07, 0.02, 0, 0, -PI / 2);
      add('spine', 'cone', '#e8413c', 0.045, yN, z, 0.035, 0.07, 0.02, 0, 0, PI / 2);
      add('spine', 'sph', '#b02a28', 0, yN, z + 0.005, 0.022);
    }

    // --- Arme ---
    const shY = tH * (sh === 'round' ? 0.72 : sh === 'pear' ? 0.68 : 0.82), shX = tW / 2 * f(shY) + b.armR * 0.35;
    const ar = b.armR, hand = robo ? shade(skin, 0.85) : skin;
    for (const s of ['L', 'R']) {
      const A = 'arm' + s, F = 'fore' + s;
      add(A, 'sph', robo ? DARK : out, 0, 0, 0, ar * 1.3);
      add(A, 'cyl', limbC, 0, -b.up / 2, 0, ar * 1.08, b.up, ar * 1.08);
      add(F, 'sph', robo ? DARK : limbC, 0, 0, 0, ar * 1.05);
      add(F, 'cyl', limbC, 0, -b.fo / 2, 0, ar, b.fo, ar);
      add(F, 'cyl', robo ? DARK : (sh === 'jacket' ? stripe : outD), 0, -b.fo * 0.86, 0, ar * 1.12, 0.035, ar * 1.12);
      add(F, 'sph', hand, 0, -b.fo - b.hand * 0.55, 0.005, b.hand * 0.9, b.hand, b.hand * 0.75);
      add(F, 'sph', hand, (s === 'L' ? -1 : 1) * b.hand * 0.55, -b.fo - b.hand * 0.25, b.hand * 0.35, b.hand * 0.32);
    }
    // --- Beine ---
    const lr = b.legR, legC = robo ? skin : PANTS;
    for (const s of ['L', 'R']) {
      const A = 'leg' + s, F = 'shin' + s;
      add(A, 'sph', legC, 0, 0, 0, lr * 1.15);
      add(A, 'cyl', legC, 0, -b.thigh / 2, 0, lr * 1.08, b.thigh, lr * 1.08);
      add(F, 'sph', robo ? DARK : legC, 0, 0, 0, lr * 1.04);
      add(F, 'cylT', legC, 0, -b.shin / 2, 0, lr, b.shin, lr);
      const fy = -b.shin - b.foot;
      add(F, 'sph', SHOE, 0, fy + b.foot * 0.6, lr * 0.55, lr * 1.3, b.foot * 0.85 + 0.02, lr * 2.1);
      add(F, 'cyl', SOLE, 0, fy + 0.014, lr * 0.55, lr * 1.22, 0.028, lr * 2.0);
      add(F, 'sph', out, 0, fy + b.foot * 0.7, lr * 1.9, lr * 0.7, b.foot * 0.55, lr * 0.55);
    }
    // --- Geisterschweif (nur im Funkgeist-Zustand sichtbar) ---
    add('tail', 'cone', out, 0, -0.3, 0, tW * 0.36, 0.6, tD * 0.4, PI);
    add('tail', 'sph', out, 0, 0.02, 0, tW * 0.36, 0.1, tD * 0.4);
    add('tail', 'ring', '#29d3ff', 0, -0.2, 0, tW * 0.26, tW * 0.26, tD * 0.3, PI / 2);

    // --- Kopf ---
    const hr = b.hr;
    let H;
    if (robo) H = { hc: hr, top: hr * 2, hb: hr * 1.1, eyeX: hr * 0.42, eyeY: hr * 1.08, front: () => hr * 0.95 };
    else if (mic) H = { hc: hr * 1.25, top: hr * 3.25, hb: hr, eyeX: hr * 0.38, eyeY: hr * 1.38, front: x => Math.sqrt(Math.max(0, hr * hr - x * x)) };
    else {
      const hyr = hr * (b.hy || 1), hc = hr * 0.92;
      H = { hc, hyr, top: hc + hyr, hb: hr, eyeX: hr * 0.36, eyeY: hc + hr * 0.04, front: (x, y) => hr * Math.sqrt(Math.max(0, 1 - Math.pow(x / hr, 2) - Math.pow((y - hc) / hyr, 2))) };
    }
    const hc = H.hc, fr = H.front;
    if (robo) {
      add('head', 'box', skin, 0, hc, 0, hr * 2.2, hr * 2, hr * 1.9);
      add('head', 'box', shade(skin, 0.75), 0, hc + hr * 0.62, 0, hr * 2.26, hr * 0.12, hr * 1.96);
      add('head', 'box', DARK, 0, hc - hr * 0.42, hr * 0.96, hr * 0.9, hr * 0.28, 0.02);
      for (let i = 0; i < 4; i++) add('head', 'box', '#29d3ff', -hr * 0.3 + i * hr * 0.2, hc - hr * 0.42, hr * 0.975, hr * 0.08, hr * 0.14, 0.012);
      for (const s of [-1, 1]) add('head', 'cyl', '#ff9a2e', s * hr * 1.13, hc, 0, hr * 0.26, hr * 0.12, hr * 0.26, 0, 0, PI / 2);
      add('head', 'cyl', DARK, 0, H.top + 0.08, 0, 0.012, 0.16, 0.012);
      add('head', 'sph', '#ff9a2e', 0, H.top + 0.17, 0, 0.035);
    } else if (mic) {
      const cylH = hr * 1.25;
      add('head', 'sph', '#cfd6df', 0, hr, 0, hr);
      add('head', 'cyl', '#cfd6df', 0, hr + cylH / 2, 0, hr, cylH, hr);
      add('head', 'sph', '#9aa6b6', 0, hr + cylH, 0, hr * 0.99);
      add('head', 'cyl', out, 0, hr + cylH, 0, hr * 1.03, hr * 0.16, hr * 1.03);
      for (let i = 1; i <= 3; i++) {
        const a = i * 0.36, r = hr * Math.cos(a) * 1.01;
        add('head', 'ring', '#6f7b8c', 0, hr + cylH + hr * Math.sin(a), 0, r, r, r, PI / 2);
      }
      add('head', 'ring', '#6f7b8c', 0, hr + cylH, 0, hr * 0.03, hr * 1.01, hr * 1.01, 0, PI / 2, 0);
      add('head', 'cyl', DARK, 0, hr * 0.15, 0, hr * 0.4, hr * 0.3, hr * 0.4);
    } else {
      add('head', 'sph', skin, 0, hc, 0, hr, H.hyr, hr);
      for (const s of [-1, 1]) add('head', 'sph', skin, s * hr * 0.97, hc - hr * 0.02, -hr * 0.02, hr * 0.12, hr * 0.17, hr * 0.09);
      add('head', 'sph', shade(skin, 0.9), 0, hc - hr * 0.16, fr(0, hc - hr * 0.16) - hr * 0.02, hr * 0.1, hr * 0.08, hr * 0.08);
    }
    // Gesicht
    const ex = H.eyeX, ey = H.eyeY, fc = L.face;
    const ez = s => fr(s * ex, ey) - hr * 0.02;
    if (robo) {
      for (const s of [-1, 1]) {
        add(low ? 'head' : 'eyes', 'cyl', DARK, s * ex, low ? ey : 0, hr * 0.95, hr * 0.27, 0.02, hr * 0.27, PI / 2);
        add(low ? 'head' : 'eyes', 'cyl', '#5fe6ff', s * ex, low ? ey : 0, hr * 0.96, hr * 0.19, 0.022, hr * (fc === 'muede' || fc === 'cool' ? 0.1 : 0.19), PI / 2);
      }
    } else {
      const big = fc === 'neugierig' ? 1.18 : 1, lid = fc === 'cool' ? 0.45 : fc === 'muede' ? 0.6 : 0;
      for (const s of [-1, 1]) {
        const z = ez(s), x = s * ex;
        if (fc === 'frech' && s < 0) {   // Zwinkern
          add('eyes', 'arc', DARK, x, 0, z + hr * 0.04, hr * 0.12, hr * 0.12, hr * 0.12, 0, s * 0.25 * 0, 0);
          continue;
        }
        add('eyes', 'sph', DARK, x, 0, z, hr * 0.13 * big, hr * 0.17 * big, hr * 0.08);
        add('eyes', 'sph', '#ffffff', x + hr * 0.045, hr * 0.06, z + hr * 0.06, hr * 0.04);
        if (lid) add('eyes', 'sph', robo || mic ? '#b9c3cf' : skin, x, hr * 0.2 * (1 - lid) + hr * 0.07, z + hr * 0.02, hr * 0.16, hr * 0.13 * lid + hr * 0.04, hr * 0.09, -0.12 * s * 0);
      }
      // Augenbrauen
      const bc = mic ? '#56606e' : (L.hair === 'none' ? shade(skin, 0.55) : hairC);
      for (const s of [-1, 1]) {
        let by = ey + hr * 0.27, tilt = 0;
        if (fc === 'neugierig' && s > 0) by += hr * 0.08;
        if (fc === 'frech') tilt = s * 0.3;
        if (fc === 'muede') tilt = -s * 0.2;
        if (fc === 'cool') { by -= hr * 0.04; tilt = s * 0.12; }
        add('head', 'box', bc, s * ex, by, fr(s * ex, by) + hr * 0.01, hr * 0.24, hr * 0.06, hr * 0.06, -0.2, 0, tilt);
      }
      // Mund
      const my = ey - hr * (mic ? 0.42 : 0.4), mz = fr(0, my);
      if (fc === 'neugierig') add('head', 'ring', DARK, 0, my, mz - hr * 0.005, hr * 0.06, hr * 0.07, hr * 0.06);
      else if (fc === 'muede') add('head', 'box', DARK, 0, my, mz, hr * 0.16, hr * 0.035, hr * 0.04);
      else {
        const w = fc === 'frech' ? 0.2 : fc === 'cool' ? 0.11 : 0.15;
        add('head', 'arc', DARK, fc === 'cool' ? hr * 0.06 : 0, my + hr * w * 0.6, mz - hr * 0.02, hr * w, hr * w * 0.9, hr * 0.1, 0, 0, PI + (fc === 'cool' ? 0.25 : 0));
      }
      if (!low) add('mouth', 'sph', '#5a1e2a', 0, 0, mz + hr * 0.005, hr * 0.12, hr * 0.12, hr * 0.06);
      if (fc === 'froh' || fc === 'frech' || L.body === 'kid') for (const s of [-1, 1]) add('head', 'sph', '#ff8f9c', s * hr * 0.58, my + hr * 0.12, fr(s * hr * 0.58, my + hr * 0.12) - hr * 0.03, hr * 0.12, hr * 0.07, hr * 0.05);
      H.my = my; H.mz = mz;
    }
    // Haare (nur bei menschlichen Köpfen)
    if (!robo && !mic && L.hair !== 'none') {
      const hy = H.hyr, hcol = hairC, hd = shade(hairC, 0.85);
      const cap = () => add('head', 'sph', hcol, 0, hc + hr * 0.16, -hr * 0.1, hr * 1.07, hy * 1.0, hr * 1.06);
      const hh = L.hair, cover = L.hat === 'cap' || L.hat === 'beanie' || L.hat === 'zylinder';
      if (hh === 'irokese' && !cover) {
        for (let i = 0; i < 6; i++) {
          const a = -0.5 + i * 0.42, y = hc + Math.cos(a) * hy * 0.92, z = Math.sin(a) * hr * 0.92;
          add('head', 'cone', i % 2 ? hd : hcol, 0, y + hr * 0.12, z * 1.0, hr * 0.14, hr * 0.45, hr * 0.2, a * 0.9 + 0.2);
        }
      } else {
        cap();
        if (hh === 'pony') add('head', 'sph', hcol, hr * 0.12, hc + hy * 0.68, hr * 0.58, hr * 0.62, hr * 0.26, hr * 0.32, 0.25, 0, 0.3);
        if (hh === 'locken') {
          for (let i = 0; i < 11; i++) {
            const a = i * 2.39996, yy = 0.15 + (i / 11) * 0.85, rr = Math.sqrt(1 - yy * yy);
            const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
            if ((z > 0.55 && yy < 0.6) || (cover && yy > 0.45)) continue;
            add('head', 'sph', i % 2 ? hd : hcol, x * hr * 1.02, hc + hr * 0.16 + yy * hy * 0.98, z * hr * 1.0 - hr * 0.1, hr * 0.3);
          }
        }
        if (hh === 'zopf') {
          add('head', 'sph', hcol, 0, hc + hr * 0.25, -hr * 1.05, hr * 0.26);
          add('head', 'ring', accent, 0, hc + hr * 0.1, -hr * 1.12, hr * 0.13, hr * 0.13, hr * 0.13, PI / 2 - 0.3);
          add('head', 'sph', hcol, 0, hc - hr * 0.25, -hr * 1.15, hr * 0.2, hr * 0.32, hr * 0.2, -0.3);
          add('head', 'sph', hd, 0, hc - hr * 0.62, -hr * 1.08, hr * 0.13, hr * 0.2, hr * 0.13, -0.2);
        }
        if (hh === 'dutt' && !cover) {
          add('head', 'sph', hcol, 0, H.top + hr * 0.12, -hr * 0.22, hr * 0.36);
          add('head', 'ring', accent, 0, H.top - hr * 0.08, -hr * 0.18, hr * 0.22, hr * 0.22, hr * 0.22, PI / 2 - 0.25);
        }
        if (hh === 'lang') {
          add('head', 'sph', hcol, 0, hc - hr * 0.35, -hr * 0.42, hr * 1.02, hr * 1.05, hr * 0.62);
          for (const s of [-1, 1]) add('head', 'sph', hd, s * hr * 0.86, hc - hr * 0.42, -hr * 0.08, hr * 0.26, hr * 0.78, hr * 0.36, 0, 0, -s * 0.1);
        }
      }
    }
    // Kopfschmuck
    const hb = H.hb, top = H.top;
    const phones = () => {
      const yb = Math.max(hc, top - hb * 1.12);
      add('head', 'arc', '#2b3550', 0, yb, 0, hb * 1.13, hb * 1.13, hb * 0.6);
      for (const s of [-1, 1]) {
        add('head', 'cyl', '#2b3550', s * hb * 1.1, yb, 0, hb * 0.34, hb * 0.2, hb * 0.38, 0, 0, PI / 2);
        add('head', 'cyl', accent, s * hb * 1.21, yb, 0, hb * 0.24, hb * 0.04, hb * 0.27, 0, 0, PI / 2);
      }
    };
    const hat = L.hat;
    if (b.phones || hat === 'kopfhoerer') phones();
    if (hat === 'cap') {
      add('head', 'hemi', out, 0, top - hb * 0.6, -hb * 0.02, hb * 1.1, hb * 0.74, hb * 1.1);
      add('head', 'cyl', accent, 0, top - hb * 0.58, hb * 0.86, hb * 0.78, 0.022, hb * 0.6);
      add('head', 'sph', accent, 0, top + hb * 0.13, 0, hb * 0.1);
    } else if (hat === 'beanie') {
      add('head', 'hemi', '#ff9a2e', 0, top - hb * 0.66, -hb * 0.02, hb * 1.11, hb * 0.92, hb * 1.11);
      add('head', 'ringT', '#e07d16', 0, top - hb * 0.62, -hb * 0.02, hb * 1.0, hb * 1.0, hb * 1.0, PI / 2);
      add('head', 'sph', '#f4f6fa', 0, top + hb * 0.3, 0, hb * 0.24);
    } else if (hat === 'antenne') {
      for (const s of [-1, 1]) {
        add('head', 'cyl', DARK, s * hb * 0.25, top + 0.09, 0, 0.012, 0.22, 0.012, 0, 0, -s * 0.35);
        add('head', 'sph', '#29d3ff', s * hb * 0.25 + s * 0.04, top + 0.2, 0, 0.035);
      }
      add('head', 'hemi', DARK, 0, top - 0.01, 0, hb * 0.4, 0.05, hb * 0.3);
    } else if (hat === 'krone') {
      const r = hb * 0.55;
      add('head', 'cyl', GOLD, 0, top + 0.02, 0, r, 0.09, r);
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * PI * 2;
        add('head', 'cone', GOLD, Math.sin(a) * r * 0.85, top + 0.1, Math.cos(a) * r * 0.85, 0.035, 0.08, 0.035);
        add('head', 'sph', i % 2 ? '#e8413c' : '#29d3ff', Math.sin(a) * r * 1.0, top + 0.02, Math.cos(a) * r * 1.0, 0.018);
      }
    } else if (hat === 'mikrofonhut') {
      add('head', 'cyl', DARK, 0, top + 0.06, 0, 0.022, 0.14, 0.022);
      add('head', 'cyl', '#ff9a2e', 0, top + 0.01, 0, hb * 0.3, 0.03, hb * 0.3);
      add('head', 'sph', '#c8d0da', 0, top + 0.17, 0, 0.06, 0.075, 0.06);
      add('head', 'ring', '#ff9a2e', 0, top + 0.155, 0, 0.062, 0.062, 0.062, PI / 2);
    } else if (hat === 'zylinder') {
      add('head', 'cyl', '#1d1f2a', 0, top + hb * 0.3, 0, hb * 0.66, hb * 0.85, hb * 0.66);
      add('head', 'cyl', '#ff9a2e', 0, top + hb * 0.02, 0, hb * 0.67, hb * 0.16, hb * 0.67);
      add('head', 'cyl', '#1d1f2a', 0, top - hb * 0.1, 0, hb * 1.05, 0.02, hb * 1.05);
    } else if (hat === 'brille' || hat === 'sonnenbrille') {
      const z = Math.max(fr(ex, ey), fr(-ex, ey)) + hr * 0.08, sun = hat === 'sonnenbrille';
      for (const s of [-1, 1]) {
        if (sun) {
          add('eyes', 'sph', '#10131c', s * ex, low ? ey : 0, z, hr * 0.24, hr * 0.17, hr * 0.06);
          add('eyes', 'box', '#29d3ff', s * ex - hr * 0.06, (low ? ey : 0) + hr * 0.05, z + hr * 0.05, hr * 0.1, hr * 0.03, 0.005, 0, 0, 0.5);
        } else add('head', 'ring', '#2b3550', s * ex, ey, z, hr * 0.21);
        add('head', 'box', '#2b3550', s * hr * 0.75, ey + hr * 0.05, z * 0.5, hr * 0.04, hr * 0.04, z * 1.0);
      }
      add('head', 'box', '#2b3550', 0, ey + hr * 0.05, z, hr * 0.26, hr * 0.04, hr * 0.04);
    }
    return { L, b, parts, H, hipY, shY, shX, height: hipY + tH + b.neck + H.top + (robo ? 0.2 : 0) };
  }

  // ---------- Animation ----------
  // Kanäle der Pose (werden weich nachgeführt → keine Sprünge)
  const BY = 0, BP = 1, SX = 2, SY = 3, SZ = 4, HX = 5, HY = 6, HZ = 7, ALX = 8, ALZ = 9, FL = 10, ARX = 11, ARZ = 12, FR = 13,
    LLX = 14, KL = 15, LRX = 16, KR = 17, MO = 18, NCH = 19;
  const ANIMS = ['idle', 'walk', 'run', 'interact', 'alarm', 'win', 'sad', 'sit', 'talk'];

  function pose(o, a, t, b, ph, spd, ghost, down) {
    o.fill(0); o[ALZ] = o[ARZ] = 0.1; o[FL] = o[FR] = -0.12;
    const S = Math.sin;
    if (down) {
      o[ALZ] = o[ARZ] = 1.25; o[FL] = o[FR] = -0.4; o[LLX] = -0.15; o[KL] = 0.3; o[KR] = 0.1; o[HY] = 0.35; o[MO] = 0.25;
      return;
    }
    if (a === 'walk' || a === 'run') {
      const run = a === 'run', k = Math.min(1, spd / (run ? 2 : 0.8)), A = (run ? 0.85 : 0.5) * k, sn = S(ph), cs = Math.cos(ph);
      o[LLX] = -sn * A; o[LRX] = sn * A;
      o[KL] = Math.max(0, cs) * (run ? 1.4 : 0.75) * k + 0.05; o[KR] = Math.max(0, -cs) * (run ? 1.4 : 0.75) * k + 0.05;
      o[ALX] = sn * A * 0.9; o[ARX] = -sn * A * 0.9; o[FL] = o[FR] = run ? -1.3 : -0.35;
      o[BY] = (Math.abs(cs) - 0.6) * (run ? 0.07 : 0.035) * k; o[SX] = run ? 0.22 : 0.05; o[HX] = run ? -0.12 : 0;
      o[SY] = -sn * 0.08 * k; o[HY] = sn * 0.04 * k; o[ALZ] = o[ARZ] = 0.13;
      if (ghost) { o[ALX] *= 0.3; o[ARX] *= 0.3; o[ALZ] = o[ARZ] = 0.5; o[SX] = 0.15; }
      return;
    }
    switch (a) {
      case 'interact':
        o[ALX] = -1.15 + S(t * 7) * 0.12; o[ARX] = -1.15 - S(t * 7) * 0.12; o[FL] = o[FR] = -0.55; o[ALZ] = o[ARZ] = -0.05;
        o[HX] = 0.28; o[SX] = 0.1; o[BY] = S(t * 3.5) * 0.006; break;
      case 'alarm':
        o[ALZ] = o[ARZ] = 2.65 + S(t * 14) * 0.18; o[FL] = o[FR] = -0.25; o[BY] = Math.abs(S(t * 9)) * 0.05;
        o[HX] = -0.18; o[HY] = S(t * 6) * 0.25; o[MO] = 0.9; break;
      case 'win':
        o[ARZ] = 2.5 + S(t * 11) * 0.35; o[FR] = -0.2; o[ALX] = -2.3 + S(t * 6) * 0.3; o[FL] = -1.3; o[ALZ] = 0.2;
        o[BY] = Math.max(0, S(t * 6)) * 0.1; o[KL] = o[KR] = Math.max(0, -S(t * 6)) * 0.3; o[LLX] = o[LRX] = -o[KL] * 0.5;
        o[HX] = -0.2; o[MO] = 0.6; break;
      case 'sad':
        o[HX] = 0.5; o[SX] = 0.22; o[ALZ] = o[ARZ] = 0.03; o[ALX] = o[ARX] = 0.08; o[BY] = -0.015; o[HY] = S(t * 0.6) * 0.12; break;
      case 'sit':
        o[LLX] = o[LRX] = -1.5; o[KL] = o[KR] = 1.5; o[BY] = -b.thigh + 0.02; o[ALX] = o[ARX] = -0.55; o[FL] = o[FR] = -0.6;
        o[HY] = S(t * 0.5) * 0.3; o[HX] = S(t * 0.7) * 0.05; break;
      case 'talk':
        o[ARX] = -0.55 + S(t * 3) * 0.25; o[FR] = -1.0 + S(t * 4.1) * 0.35; o[ARZ] = 0.25; o[ALX] = -0.15 + S(t * 2.3) * 0.15; o[FL] = -0.5;
        o[HX] = S(t * 4) * 0.06; o[HY] = S(t * 1.3) * 0.15; o[SY] = S(t * 1.3) * 0.08;
        o[MO] = (0.5 + 0.5 * S(t * 15)) * (0.55 + 0.45 * S(t * 3.7)); break;
      default:  // idle – je Körperbau eigener Stil
        o[BY] = S(t * 2) * 0.006;
        switch (b.idle) {
          case 'look': o[HY] = S(t * 0.5) * 0.4 * Math.min(1, Math.abs(S(t * 0.25)) * 2); o[HX] = S(t * 0.7) * 0.05; break;
          case 'sway': o[SZ] = S(t * 0.9) * 0.05; o[HZ] = -S(t * 0.9) * 0.06; o[ALX] = S(t * 0.9) * 0.06; o[ARX] = -o[ALX]; break;
          case 'rock': o[SZ] = S(t * 1.6) * 0.07; o[BY] = Math.abs(S(t * 1.6)) * 0.015; o[ALZ] = o[ARZ] = 0.32; o[HZ] = -S(t * 1.6) * 0.05; break;
          case 'robot': o[HY] = Math.round(S(t * 0.6) * 2) / 2 * 0.45; o[BY] = S(t * 3) * 0.004; o[FL] = o[FR] = -0.5; break;
          case 'groove': o[SZ] = S(t * 2.6) * 0.08; o[HZ] = S(t * 2.6 + 1) * 0.12; o[BY] = Math.abs(S(t * 2.6)) * 0.02; o[ALZ] = o[ARZ] = 0.2; break;
          case 'bounce': {
            const k = (0.5 + 0.5 * S(t * 6.4)) * 0.22;
            o[LLX] = o[LRX] = -k * 0.6; o[KL] = o[KR] = k * 1.2; o[BY] = -k * 0.06; o[HX] = S(t * 6.4) * 0.08; break;
          }
          case 'tap': o[LRX] = -0.12; o[KR] = 0.15 + Math.max(0, S(t * 5)) * 0.18; o[SZ] = 0.04; o[HZ] = S(t * 2.5) * 0.06; break;
        }
        if (ghost) { o[ALZ] = o[ARZ] = 0.5 + S(t * 2) * 0.15; o[FL] = o[FR] = -0.3; o[SX] = 0.08; }
    }
  }

  // ---------- Figur ----------
  function create(look, opts) {
    const q = Q[opts && opts.quality] ? opts.quality : 'mid';
    const root = new T.Group(); root.name = 'amu-actor';
    const lay = new T.Group(); root.add(lay);
    const cur = new Float32Array(NCH), tgt = new Float32Array(NCH);
    const st = { anim: 'idle', t: Math.random() * 20, ph: 0, ghost: false, hi: false, down: false, d: 0, g: 0, blink: 1 + Math.random() * 3 };
    let R = null;

    function rebuild(lk) {
      if (R) { lay.remove(R.g.hips); R.geos.forEach(g => g.dispose()); }
      const B = build(lk, q), g = {}, geos = [], meshes = [];
      const { b, H } = B, tH = b.tH;
      const off = {
        hips: [0, B.hipY, 0], spine: [0, 0, 0], head: [0, tH + b.neck, 0], eyes: [0, H.eyeY, 0], mouth: [0, H.my || 0, 0],
        armL: [B.shX, B.shY, 0], armR: [-B.shX, B.shY, 0], foreL: [0, -b.up, 0], foreR: [0, -b.up, 0],
        legL: [b.hipX, 0, 0], legR: [-b.hipX, 0, 0], shinL: [0, -b.thigh, 0], shinR: [0, -b.thigh, 0], tail: [0, 0, 0]
      };
      // Teile von 'low'-Kindsegmenten ins Elternteil verschieben
      if (q === 'low') for (const [c, p] of Object.entries(LOW_MERGE)) {
        const o = off[c];
        for (const pt of B.parts[c]) { pt.x += o[0]; pt.y += o[1]; pt.z += o[2]; B.parts[p].push(pt); }
        B.parts[c] = [];
      }
      for (const [name, parent] of SEGS) {
        const grp = new T.Group(); grp.position.fromArray(off[name]); g[name] = grp;
        if (parent) g[parent].add(grp);
        if (B.parts[name].length) {
          const geo = merge(B.parts[name]), m = new T.Mesh(geo, mat(q, 0));
          m.castShadow = true; geos.push(geo); meshes.push(m); grp.add(m);
        }
      }
      g.tail.visible = false;
      lay.add(g.hips);
      const halo = new T.Mesh(protos(q).sph, special('halo'));
      halo.scale.set(b.tW * 0.8 + 0.12, B.height * 0.36, b.tW * 0.8 + 0.12); halo.position.y = tH * 0.55; halo.visible = false;
      g.spine.add(halo);
      R = { ...B, g, geos, meshes, halo, outlines: null, rest: { eyesY: g.eyes.position.y } };
      if (st.stars) st.stars.position.set(0, 0.5, R.height * 0.5 - (R.hipY + tH + b.neck + H.hc));
      applyMats(); applyGhostVis();
    }
    function applyMats() {
      const v = (st.hi ? 1 : 0) | (st.ghost ? 2 : 0);
      for (const m of R.meshes) { m.material = mat(q, v); m.castShadow = !st.ghost; }
      if (st.hi && !R.outlines) R.outlines = R.meshes.map(m => { const o = new T.Mesh(m.geometry, special('outline')); m.add(o); return o; });
      if (R.outlines) R.outlines.forEach(o => (o.visible = st.hi && !st.ghost));
    }
    function applyGhostVis() {
      const G = R.g; G.legL.visible = G.legR.visible = !st.ghost; G.tail.visible = st.ghost; R.halo.visible = st.ghost;
    }

    const actor = {
      root,
      get look() { return R.L; },
      get height() { return R.height; },
      get anim() { return st.anim; },
      setAnim(name) { st.anim = ANIMS.includes(name) ? name : 'idle'; },
      setLook(lk) { rebuild(lk); },
      setGhost(on) { on = !!on; if (on === st.ghost) return; st.ghost = on; if (on) actor.setDown(false); applyMats(); applyGhostVis(); },
      setHighlight(on) { on = !!on; if (on === st.hi) return; st.hi = on; applyMats(); },
      setDown(on) {
        st.down = !!on;
        if (st.down && !st.stars) {
          const s = st.stars = new T.Group();
          for (let i = 0; i < 4; i++) { const m = new T.Mesh(star(), special('star')); const a = i / 4 * PI * 2; m.position.set(Math.cos(a) * 0.22, (i % 2) * 0.05, Math.sin(a) * 0.22); s.add(m); }
          s.position.set(0, 0.5, R.height * 0.5 - (R.hipY + R.b.tH + R.b.neck + R.H.hc)); root.add(s);
        }
        if (st.stars) st.stars.visible = st.down;
      },
      update(dt, speed) {
        dt = Math.min(dt || 0, 0.1); speed = Math.max(0, speed || 0);
        st.t += dt;
        const b = R.b, G = R.g;
        let a = st.anim;
        if ((a === 'walk' || a === 'run') && speed > 0) a = speed > 2.2 ? 'run' : 'walk';
        if (a === 'walk' || a === 'run') st.ph += dt * PI * 2 * Math.max(0.3, speed) / (2 * (b.thigh + b.shin) * (a === 'run' ? 1.5 : 1.15));
        pose(tgt, a, st.t, b, st.ph, speed, st.ghost, st.down);
        const k = 1 - Math.exp(-dt * (a === 'walk' || a === 'run' ? 18 : 10));
        for (let i = 0; i < NCH; i++) cur[i] += (tgt[i] - cur[i]) * k;
        st.d += ((st.down ? 1 : 0) - st.d) * (1 - Math.exp(-dt * 7));
        st.g += ((st.ghost ? 1 : 0) - st.g) * (1 - Math.exp(-dt * 4));
        // Pose anwenden
        G.hips.position.y = R.hipY + cur[BY] + st.g * (0.22 + Math.sin(st.t * 2.2) * 0.06);
        G.hips.rotation.x = cur[BP];
        G.spine.rotation.set(cur[SX], cur[SY], cur[SZ]);
        G.head.rotation.set(cur[HX], cur[HY], cur[HZ]);
        G.armL.rotation.set(cur[ALX], 0, cur[ALZ]); G.foreL.rotation.x = cur[FL];
        G.armR.rotation.set(cur[ARX], 0, -cur[ARZ]); G.foreR.rotation.x = cur[FR];
        G.legL.rotation.set(cur[LLX], 0, st.d * 0.25); G.shinL.rotation.x = cur[KL];
        G.legR.rotation.set(cur[LRX], 0, -st.d * 0.25); G.shinR.rotation.x = cur[KR];
        G.tail.rotation.z = Math.sin(st.t * 3) * 0.15 * st.g;
        G.mouth.scale.y = Math.max(0.02, cur[MO]);
        // Hinlegen (ausgeknipst): auf den Rücken, mittig um den Ursprung
        lay.rotation.x = -PI / 2 * st.d; lay.position.set(0, st.d * R.b.tD * 0.5, st.d * R.height * 0.5);
        if (st.stars && st.down) st.stars.rotation.y += dt * 2.5;
        // Blinzeln
        st.blink -= dt;
        let ey = 1;
        if (st.d > 0.5) ey = 0.12;
        else if (st.blink < 0.12) { ey = 0.15; if (st.blink < 0) st.blink = 2 + Math.random() * 3.5; }
        G.eyes.scale.y = ey;
      },
      dispose() {
        if (root.parent) root.parent.remove(root);
        R.geos.forEach(g => g.dispose()); R.geos = [];
      }
    };
    rebuild(look);
    actor.update(0.016, 0);
    return actor;
  }

  AMU.Actors = { create, BODY, ANIMS };
})(typeof window !== 'undefined' ? window : globalThis);
