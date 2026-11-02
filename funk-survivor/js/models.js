/* Funk-Survivor – Modelle und Texturen: alles wird beim Start im Browser erzeugt (glatte Flächen, keine Dateien).
 * Geometrie: Parametrische Flächen mit geteilten Eckpunkten und berechneten Normalen (weiche Verläufe statt Kanten);
 * pro Teil Farbe (Eckpunktfarbe) und „Leuchten“ (aGlow: 0 Körper, 1 leuchtend in Gegnerfarbe, 2 weißglühend). */
(function (root) {
  'use strict';
  const T = root.THREE, TAU = Math.PI * 2;

  // Detailgrad: Gegner in Massen bekommen weniger Segmente (Q.v < 1), Bosse und Einzelstücke mehr
  const Q = { v: 1 }, sg = n => Math.max(6, Math.round(n * Q.v));

  /* ---------- Parametrische Fläche ---------- */
  function param(ws, hs, f, wrapU, wrapV) {
    const nu = wrapU ? ws : ws + 1, nv = wrapV ? hs : hs + 1, pos = new Float32Array(nu * nv * 3), idx = [];
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const p = f(i / ws, j / hs); const o = (j * nu + i) * 3; pos[o] = p[0]; pos[o + 1] = p[1]; pos[o + 2] = p[2]; }
    for (let j = 0; j < hs; j++) for (let i = 0; i < ws; i++) {
      const i1 = wrapU ? (i + 1) % ws : i + 1, j1 = wrapV ? (j + 1) % hs : j + 1;
      const a = j * nu + i, b = j * nu + i1, c = j1 * nu + i1, d = j1 * nu + i;
      idx.push(a, d, b, b, d, c);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const n3 = (x, y, z) => Math.sin(x * 3.1 + y * 2.3 + 1.3) * Math.sin(y * 2.7 + z * 3.7 + .4) * Math.sin(z * 3.3 + x * 2.9 + 2.1);
  // Weiche Kugel/Ellipsoid, optional mit Unebenheiten (amp) und Formfunktion
  function blob(rx, ry, rz, o) {
    o = o || {}; const amp = o.amp || 0, fq = o.fq || 1.4, ws = sg(o.ws || 64), hs = sg(o.hs || 40), sh = o.shape;
    return param(ws, hs, (u, v) => {
      const th = u * TAU, ph = v * Math.PI, dx = Math.sin(ph) * Math.cos(th), dy = Math.cos(ph), dz = Math.sin(ph) * Math.sin(th);
      let r = 1 + amp * n3(dx * fq, dy * fq, dz * fq); if (sh) r *= sh(dx, dy, dz);
      return [dx * rx * r, dy * ry * r, dz * rz * r];
    }, true, false);
  }
  function torus(R, r, ws, hs) { ws = sg(ws || 64); hs = Math.max(5, sg(hs || 16)); return param(ws, hs, (u, v) => { const a = u * TAU, b = v * TAU; return [(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a)]; }, true, true); }
  // Rotationskörper aus Profil (r(v), y(v)), v 0…1
  function lathe(profile, ws, hs) { ws = sg(ws || 48); hs = sg(hs || 24); return param(ws, hs, (u, v) => { const p = profile(v), a = u * TAU; return [p[0] * Math.cos(a), p[1], p[0] * Math.sin(a)]; }, true, false); }
  function spike(R, H, ws) { return lathe(v => [R * Math.pow(1 - v, 1.15) * Math.min(1, Math.sqrt(v * 9)), v * H], ws || 28, 14); }
  // abgerundeter Quader (w,h,d = Gesamtmaße)
  function rbox(w, h, d, rad, seg) {
    const s = Math.max(3, Math.round((seg || 6) * Math.sqrt(Q.v))), g = new T.BoxGeometry(w, h, d, s, s, s), p = g.attributes.position, hx = w / 2 - rad, hy = h / 2 - rad, hz = d / 2 - rad, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const c = new T.Vector3(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); const dlt = v.clone().sub(c); if (dlt.lengthSq() > 1e-9) dlt.setLength(rad); p.setXYZ(i, c.x + dlt.x, c.y + dlt.y, c.z + dlt.z); }
    g.deleteAttribute('uv'); return weld(g);
  }
  // Doppelte Eckpunkte verschmelzen, damit die Normalen weich werden
  function weld(g) {
    g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, map = new Map(), pos = [], idx = [];
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4); let j = map.get(k); if (j === undefined) { j = pos.length / 3; map.set(k, j); pos.push(p.getX(i), p.getY(i), p.getZ(i)); } idx.push(j); }
    const o = new T.BufferGeometry(); o.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); o.setIndex(idx); o.computeVertexNormals(); return o;
  }

  /* ---------- Teile zusammenfügen ---------- */
  class Builder {
    constructor() { this.pos = []; this.nor = []; this.col = []; this.glow = []; this.idx = []; this.n = 0; }
    add(g, o) {
      o = o || {}; const m = new T.Matrix4(); if (o.p || o.r || o.s) m.compose(new T.Vector3().fromArray(o.p || [0, 0, 0]), new T.Quaternion().setFromEuler(new T.Euler(...(o.r || [0, 0, 0]))), new T.Vector3().fromArray(o.s || [1, 1, 1]));
      const nm = new T.Matrix3().getNormalMatrix(m), P = g.attributes.position, N = g.attributes.normal, v = new T.Vector3(), c = o.c == null ? 1 : o.c, col = Array.isArray(c) ? c : [c, c, c], gl = o.g || 0;
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m); this.pos.push(v.x, v.y, v.z);
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); this.nor.push(v.x, v.y, v.z); this.col.push(col[0], col[1], col[2]); this.glow.push(gl);
      }
      const ix = g.index.array; for (let i = 0; i < ix.length; i++) this.idx.push(ix[i] + this.n); this.n += P.count; return this;
    }
    build() {
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(this.nor, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(this.col, 3)); g.setAttribute('aGlow', new T.Float32BufferAttribute(this.glow, 1)); g.setIndex(this.n > 65000 ? new T.Uint32BufferAttribute(this.idx, 1) : new T.Uint16BufferAttribute(this.idx, 1));
      g.computeBoundingSphere(); return g;
    }
  }
  const B = () => new Builder();
  const D = .2;   // Körperfarbe (dunkel, wird mit der Gegnerfarbe getönt)

  /* ---------- Gegner (Fuß bei y = 0, Blick nach +Z, Größe passend zum Trefferradius) ---------- */
  const CREATURES = {
    rausch() {   // glänzender Störklumpen mit leuchtendem Band und weißen Augen
      const b = B();
      b.add(blob(.5, .52, .5, { amp: .07, fq: 1.8 }), { p: [0, .52, 0], c: D });
      b.add(torus(.5, .035, 72, 14), { p: [0, .5, 0], r: [.12, 0, 0], c: 1, g: 1 });
      b.add(torus(.43, .028, 72, 12), { p: [0, .78, 0], r: [-.2, 0, 0], c: 1, g: 1 });
      for (const s of [-1, 1]) b.add(blob(.1, .12, .08, { ws: 32, hs: 20 }), { p: [s * .17, .66, .42], c: 1, g: 2 });
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5; b.add(spike(.07, .26, 20), { p: [Math.cos(a) * .2, .95, Math.sin(a) * .2], r: [Math.sin(a) * .5, 0, -Math.cos(a) * .5], c: D * 1.5, g: 0 }); }
      return b.build();
    },
    knack() {    // kleiner, stacheliger Funkball
      const b = B();
      b.add(blob(.28, .28, .28, { amp: .05, ws: 48, hs: 30 }), { p: [0, .36, 0], c: D });
      b.add(blob(.2, .2, .2, { ws: 32, hs: 20 }), { p: [0, .36, 0], c: 1, g: 1 });
      for (let i = 0; i < 12; i++) { const y = 1 - (i + .5) / 6, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.399963; const d = [Math.cos(a) * r, y, Math.sin(a) * r]; const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(...d)); const e = new T.Euler().setFromQuaternion(q); b.add(spike(.075, .3, 18), { p: [d[0] * .27, .36 + d[1] * .27, d[2] * .27], r: [e.x, e.y, e.z], c: D * 2 }); }
      for (const s of [-1, 1]) b.add(blob(.06, .07, .05, { ws: 24, hs: 14 }), { p: [s * .1, .42, .25], c: 1, g: 2 });
      return b.build();
    },
    brumm() {    // schwerer Panzerklotz mit Lautsprecher-Brust
      const b = B();
      b.add(rbox(1.5, 1.35, 1.25, .38, 10), { p: [0, .95, 0], c: D });
      b.add(rbox(1.0, .55, .9, .22, 8), { p: [0, 1.75, .1], c: D * 1.2 });
      b.add(torus(.36, .05, 64, 14), { p: [0, 1.0, .64], r: [Math.PI / 2, 0, 0], c: 1, g: 1 });
      b.add(blob(.28, .12, .28, { ws: 40, hs: 20 }), { p: [0, 1.0, .64], r: [Math.PI / 2, 0, 0], c: D * .6 });
      b.add(blob(.12, .12, .12, { ws: 24, hs: 14 }), { p: [0, 1.0, .72], c: 1, g: 1 });
      for (const s of [-1, 1]) { b.add(blob(.2, .08, .1, { ws: 28, hs: 14 }), { p: [s * .26, 1.82, .5], c: 1, g: 2 }); b.add(rbox(.5, .9, .5, .18, 8), { p: [s * .95, .5, .1], c: D * 1.3 }); b.add(torus(.2, .03, 40, 10), { p: [s * .95, .12, .1], r: [Math.PI / 2, 0, 0], c: 1, g: 1 }); }
      return b.build();
    },
    schrei() {   // Tropfenform mit aufgerissenem Leuchtmund und Antennen
      const b = B();
      b.add(blob(.5, .75, .5, { amp: .05, shape: (x, y) => y > 0 ? 1 : 1 + y * .25 }), { p: [0, .75, 0], c: D });
      b.add(torus(.2, .06, 48, 16), { p: [0, .62, .38], r: [.2, 0, 0], c: D * 1.4 });
      b.add(blob(.17, .2, .06, { ws: 32, hs: 18 }), { p: [0, .62, .38], c: 1, g: 2 });
      for (const s of [-1, 1]) { b.add(blob(.08, .09, .06, { ws: 24, hs: 14 }), { p: [s * .2, .98, .36], c: 1, g: 2 }); b.add(spike(.025, .55, 14), { p: [s * .22, 1.3, 0], r: [0, 0, -s * .45], c: D * 2 }); b.add(blob(.06, .06, .06, { ws: 16, hs: 10 }), { p: [s * .22 + s * .26, 1.82, 0], c: 1, g: 1 }); }
      return b.build();
    },
    splitt() {   // sich teilende Zelle: zwei Kugeln mit leuchtender Naht
      const b = B();
      b.add(blob(.52, .5, .5, { amp: .05 }), { p: [-.28, .55, 0], c: D });
      b.add(blob(.52, .5, .5, { amp: .05, fq: 2.1 }), { p: [.28, .55, .02], c: D });
      b.add(blob(.3, .38, .3, { ws: 40, hs: 24 }), { p: [0, .56, 0], c: 1, g: 1 });
      for (const s of [-1, 1]) b.add(blob(.09, .1, .07, { ws: 24, hs: 14 }), { p: [s * .3, .68, .44], c: 1, g: 2 });
      return b.build();
    },
    blitz() {    // schlanker Sturmläufer mit Blitzstreifen
      const b = B();
      b.add(blob(.38, .38, .75, { amp: .03, shape: (x, y, z) => z > 0 ? 1 : 1 - Math.pow(-z, 2) * .55 }), { p: [0, .55, 0], c: D });
      b.add(torus(.32, .028, 56, 12), { p: [0, .56, .15], r: [0, Math.PI / 2, 0], c: 1, g: 1 });
      b.add(torus(.27, .024, 56, 12), { p: [0, .56, -.2], r: [0, Math.PI / 2, 0], c: 1, g: 1 });
      b.add(spike(.1, .6, 20), { p: [0, .62, -.55], r: [-Math.PI / 2 - .3, 0, 0], c: D * 1.8 });
      for (const s of [-1, 1]) { b.add(blob(.07, .08, .05, { ws: 24, hs: 14 }), { p: [s * .17, .66, .56], c: 1, g: 2 }); b.add(spike(.06, .45, 16), { p: [s * .34, .62, .05], r: [0, 0, -s * 1.15], c: D * 1.8 }); }
      return b.build();
    },
    boss1() {    // Der Dröhner: gepanzertes Bassungetüm
      const b = B();
      b.add(blob(2.1, 1.7, 2.0, { amp: .05, shape: (x, y) => y < 0 ? .9 : 1 }), { p: [0, 1.9, 0], c: D * .9 });
      b.add(rbox(3.2, .7, 2.6, .3, 10), { p: [0, 2.9, -.1], c: D * 1.1 });
      for (const s of [-1, 1]) { b.add(spike(.34, 2.1, 28), { p: [s * 1.5, 3.1, .3], r: [0, 0, -s * .8], c: D * 2 }); b.add(blob(.34, .2, .1, { ws: 32, hs: 16 }), { p: [s * .75, 2.35, 1.85], c: 1, g: 2 }); b.add(rbox(.9, 1.6, .9, .3, 8), { p: [s * 1.85, .8, .1], c: D * 1.4 }); }
      b.add(torus(.95, .12, 80, 20), { p: [0, 1.55, 1.7], r: [Math.PI / 2 - .15, 0, 0], c: 1, g: 1 });
      b.add(blob(.8, .22, .8, { ws: 48, hs: 20 }), { p: [0, 1.55, 1.7], r: [Math.PI / 2 - .15, 0, 0], c: D * .5 });
      b.add(blob(.34, .34, .3, { ws: 32, hs: 20 }), { p: [0, 1.55, 1.9], c: 1, g: 1 });
      b.add(torus(2.0, .07, 96, 12), { p: [0, 2.05, 0], r: [.1, 0, 0], c: 1, g: 1 });
      return b.build();
    },
    boss2() {    // Feedback-Queen: schwebende Diva mit Heiligenschein
      const b = B();
      b.add(lathe(v => [.5 + Math.pow(v, 1.7) * 1.35, 3.1 - v * 2.9], 64, 28), { p: [0, .9, 0], c: D });
      b.add(blob(.62, .7, .6, { amp: .03 }), { p: [0, 3.7, 0], c: D * 1.3 });
      b.add(torus(1.0, .06, 96, 14), { p: [0, 4.9, 0], r: [.25, 0, 0], c: 1, g: 1 });
      b.add(torus(1.55, .045, 96, 12), { p: [0, 4.9, 0], r: [-.4, 0, .3], c: 1, g: 1 });
      b.add(torus(1.7, .09, 96, 14), { p: [0, 1.3, 0], c: 1, g: 1 });
      for (const s of [-1, 1]) { b.add(blob(.12, .14, .08, { ws: 24, hs: 14 }), { p: [s * .25, 3.8, .52], c: 1, g: 2 }); b.add(spike(.14, 1.9, 22), { p: [s * .8, 3.9, 0], r: [0, 0, -s * 1.1], c: D * 2 }); b.add(blob(.2, .2, .2, { ws: 24, hs: 14 }), { p: [s * 1.95, 5.15, 0], c: 1, g: 1 }); }
      b.add(blob(.2, .34, .5, { ws: 32, hs: 18 }), { p: [0, 3.4, .35], c: D * 3 });
      return b.build();
    },
    boss3() {    // Der Große Störsender: Funkturm-Koloss
      const b = B();
      b.add(lathe(v => [2.4 - v * 1.5 + Math.sin(v * 18) * .05, v * 3.6], 72, 40), { p: [0, 0, 0], c: D });
      b.add(rbox(2.6, 1.7, 2.6, .5, 12), { p: [0, 4.4, 0], c: D * 1.2 });
      for (const y of [1.2, 2.3, 3.4]) b.add(torus(2.1 - y * .27, .1, 96, 14), { p: [0, y, 0], c: 1, g: 1 });
      for (const s of [-1, 1]) { b.add(lathe(v => [1.2 * Math.sqrt(v), -v * .6], 56, 20), { p: [s * 2.0, 5.1, 0], r: [0, 0, s * .6], c: D * 1.5 }); b.add(spike(.05, 1.7, 14), { p: [s * 2.3, 5.4, 0], r: [0, 0, -s * .5], c: D * 2 }); }
      b.add(spike(.14, 4.4, 22), { p: [0, 5.2, 0], c: D * 2 }); b.add(blob(.34, .34, .34, { ws: 32, hs: 20 }), { p: [0, 9.4, 0], c: 1, g: 1 });
      b.add(blob(.8, .5, .3, { ws: 40, hs: 20 }), { p: [0, 4.6, 1.3], c: 1, g: 2 });
      b.add(torus(3.0, .12, 128, 14), { p: [0, 2.6, 0], r: [.2, 0, .1], c: 1, g: 1 });
      return b.build();
    }
  };

  /* ---------- Kleinteile ---------- */
  function gemGeo() { const g = new T.OctahedronGeometry(.3, 0); g.scale(.8, 1.25, .8); return weld(g); }
  function crystalGeo() { return gemGeo(); }
  function coinGeo() { const b = B(); b.add(param(40, 4, (u, v) => { const a = u * TAU; return [Math.cos(a) * .3, (v - .5) * .07, Math.sin(a) * .3]; }, true, false), {}); b.add(torus(.27, .03, 40, 8), { p: [0, .035, 0], r: [0, 0, 0] }); b.add(torus(.27, .03, 40, 8), { p: [0, -.035, 0] }); return b.build(); }
  function heartGeo() {
    const s = new T.Shape(); s.moveTo(0, -.5); s.bezierCurveTo(-.15, -.3, -.55, -.1, -.55, .2); s.bezierCurveTo(-.55, .5, -.2, .6, 0, .35); s.bezierCurveTo(.2, .6, .55, .5, .55, .2); s.bezierCurveTo(.55, -.1, .15, -.3, 0, -.5);
    const g = new T.ExtrudeGeometry(s, { depth: .22, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 8, curveSegments: 28 }); g.translate(0, 0, -.11); g.scale(.7, .7, .7); return g;
  }
  function chestGeo() {
    const b = B(); b.add(rbox(1.3, .7, .85, .1, 6), { p: [0, .35, 0], c: [.5, .3, .12] });
    b.add(param(32, 12, (u, v) => { const a = v * Math.PI; return [(u - .5) * 1.3, Math.sin(a) * .42, Math.cos(a) * .42]; }, false, false), { p: [0, .7, 0], c: [.55, .32, .12] });
    for (const x of [-.45, .45]) b.add(rbox(.12, .85, .92, .04, 4), { p: [x, .45, 0], c: [.9, .75, .3] });
    b.add(rbox(.22, .26, .1, .04, 4), { p: [0, .6, .46], c: 1, g: 1 }); return b.build();
  }
  function bombGeo() { const b = B(); b.add(blob(.4, .4, .4, { ws: 40, hs: 24 }), { p: [0, .4, 0], c: .08 }); b.add(torus(.14, .03, 24, 8), { p: [0, .84, 0], r: [Math.PI / 2, 0, 0], c: .5 }); b.add(blob(.07, .07, .07, { ws: 16, hs: 10 }), { p: [.1, .98, 0], c: 1, g: 2 }); b.add(torus(.4, .03, 48, 8), { p: [0, .4, 0], r: [.3, 0, 0], c: 1, g: 1 }); return b.build(); }
  function magnetGeo() {
    const b = B(); b.add(param(40, 14, (u, v) => { const a = u * Math.PI, c = v * TAU; const R = .42, r = .12; return [-(R + r * Math.cos(c)) * Math.cos(a), (R + r * Math.cos(c)) * Math.sin(a) + .15, r * Math.sin(c)]; }, false, true), { p: [0, .35, 0], c: [.9, .1, .12] });
    for (const s of [-1, 1]) { b.add(rbox(.26, .34, .26, .06, 4), { p: [s * .42, .38, 0], c: [.85, .88, .95] }); }
    return b.build();
  }
  function discGeo() { return param(64, 2, (u, v) => { const a = u * TAU; return [Math.cos(a) * .5, (v - .5) * .04, Math.sin(a) * .5]; }, true, false); }

  /* ---------- Texturen ---------- */
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rnd(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }
  // Bodenplatten: Farbe, Rauheit, Normalen, Leuchtlinien (4 × 4 Platten je Kachel)
  function floorTextures(size, anisotropy) {
    const S = size, tile = S / 4, R = rnd(7), out = {};
    const A = canvas(S, S), a = A.getContext('2d'), H = canvas(S, S), hc = H.getContext('2d'), RG = canvas(S, S), rg = RG.getContext('2d'), E = canvas(S, S), e = E.getContext('2d');
    a.fillStyle = '#2a3140'; a.fillRect(0, 0, S, S); hc.fillStyle = '#888'; hc.fillRect(0, 0, S, S); rg.fillStyle = '#999'; rg.fillRect(0, 0, S, S); e.fillStyle = '#000'; e.fillRect(0, 0, S, S);
    for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) {
      const x = tx * tile, y = ty * tile, v = 58 + R() * 26;
      a.fillStyle = `rgb(${v},${v + 4},${v + 14})`; a.fillRect(x + 3, y + 3, tile - 6, tile - 6);
      const gr = a.createLinearGradient(x, y, x + tile, y + tile); gr.addColorStop(0, 'rgba(255,255,255,.07)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); a.fillStyle = gr; a.fillRect(x + 3, y + 3, tile - 6, tile - 6);
      hc.fillStyle = '#9a9a9a'; hc.fillRect(x + 4, y + 4, tile - 8, tile - 8);
      const rv = 70 + R() * 70; rg.fillStyle = `rgb(${rv},${rv},${rv})`; rg.fillRect(x + 3, y + 3, tile - 6, tile - 6);
      for (const [cx, cy] of [[14, 14], [tile - 14, 14], [14, tile - 14], [tile - 14, tile - 14]]) { a.fillStyle = '#4b5468'; a.beginPath(); a.arc(x + cx, y + cy, 4, 0, TAU); a.fill(); hc.fillStyle = '#ddd'; hc.beginPath(); hc.arc(x + cx, y + cy, 4, 0, TAU); hc.fill(); }
      if (R() < .35) { a.strokeStyle = 'rgba(0,0,0,.25)'; a.lineWidth = 2; a.strokeRect(x + tile * .2, y + tile * .2, tile * .6, tile * .6); hc.strokeStyle = '#777'; hc.lineWidth = 3; hc.strokeRect(x + tile * .2, y + tile * .2, tile * .6, tile * .6); }
    }
    // Kratzer und Körnung
    for (let i = 0; i < S * 1.2; i++) { const x = R() * S, y = R() * S, l = 6 + R() * 28, an = R() * TAU; a.strokeStyle = `rgba(${R() < .5 ? '255,255,255' : '0,0,0'},${.03 + R() * .05})`; a.lineWidth = 1; a.beginPath(); a.moveTo(x, y); a.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); a.stroke(); hc.strokeStyle = `rgba(${R() < .5 ? '60,60,60' : '200,200,200'},.25)`; hc.stroke(); }
    for (let i = 0; i < S * 5; i++) { const g = R() * 255 | 0; a.fillStyle = `rgba(${g},${g},${g},.05)`; a.fillRect(R() * S, R() * S, 2, 2); }
    // Leuchtlinien in den Fugen (jede zweite)
    e.fillStyle = '#fff'; for (let i = 0; i < 4; i += 2) { e.fillRect(i * tile - 2, 0, 4, S); e.fillRect(0, i * tile - 2, S, 4); }
    e.fillRect(S - 2, 0, 2, S); e.fillRect(0, S - 2, S, 2);
    // Normalen aus Höhenbild
    const hd = hc.getImageData(0, 0, S, S).data, N = canvas(S, S), n = N.getContext('2d'), nd = n.createImageData(S, S), hv = (x, y) => hd[(((y + S) % S) * S + ((x + S) % S)) * 4] / 255;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = (hv(x + 1, y) - hv(x - 1, y)) * 3.2, dy = (hv(x, y + 1) - hv(x, y - 1)) * 3.2, l = Math.hypot(dx, dy, 1), o = (y * S + x) * 4; nd.data[o] = (-dx / l * .5 + .5) * 255; nd.data[o + 1] = (dy / l * .5 + .5) * 255; nd.data[o + 2] = (1 / l * .5 + .5) * 255; nd.data[o + 3] = 255; }
    n.putImageData(nd, 0, 0);
    const mk = (c, srgb) => { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = anisotropy; if (srgb) t.encoding = T.sRGBEncoding; t.needsUpdate = true; return t; };
    out.map = mk(A, true); out.rough = mk(RG, false); out.normal = mk(N, false); out.emis = mk(E, true); return out;
  }
  // Schallplatte: Rillen und Etikett
  function vinylTexture() {
    const c = canvas(512, 512), g = c.getContext('2d'); g.fillStyle = '#0a0a0e'; g.fillRect(0, 0, 512, 512);
    for (let r = 70; r < 250; r += 2.2) { g.strokeStyle = `rgba(255,255,255,${.03 + (r % 7) * .008})`; g.lineWidth = 1; g.beginPath(); g.arc(256, 256, r, 0, TAU); g.stroke(); }
    const sh = g.createConicGradient ? g.createConicGradient(0, 256, 256) : null; if (sh) { sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.12, 'rgba(255,255,255,.22)'); sh.addColorStop(.25, 'rgba(255,255,255,0)'); sh.addColorStop(.62, 'rgba(255,255,255,0)'); sh.addColorStop(.75, 'rgba(255,255,255,.2)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.beginPath(); g.arc(256, 256, 248, 0, TAU); g.fill(); }
    g.fillStyle = '#ff2d95'; g.beginPath(); g.arc(256, 256, 62, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(256, 256, 8, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.font = '800 22px system-ui'; g.textAlign = 'center'; g.fillText('FUNK', 256, 246); g.fillText('FLUT', 256, 290);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  function glowTexture(inner) {
    const c = canvas(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(inner || .25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }
  function ringTexture() {
    const c = canvas(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.6, 'rgba(255,255,255,0)'); gr.addColorStop(.86, 'rgba(255,255,255,.9)'); gr.addColorStop(.93, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }
  function stripeTexture() {   // Warnstreifen für Sturmangriff
    const c = canvas(64, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,60,60,.0)'); gr.addColorStop(.12, 'rgba(255,60,60,.5)'); gr.addColorStop(1, 'rgba(255,60,60,.2)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    g.fillStyle = 'rgba(255,255,255,.25)'; for (let y = -64; y < 256; y += 48) { g.beginPath(); g.moveTo(0, y + 64); g.lineTo(64, y); g.lineTo(64, y + 20); g.lineTo(0, y + 84); g.fill(); }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; return t;
  }

  const QUAL = { rausch: .4, knack: .42, brumm: .5, schrei: .5, splitt: .45, blitz: .5, boss1: .75, boss2: .75, boss3: .75 };
  function creature(kind, mobile) { Q.v = (QUAL[kind] || 1) * (mobile ? .8 : 1); const g = CREATURES[kind](); Q.v = 1; return g; }
  root.FSModels = { creature, param, blob, torus, lathe, spike, rbox, weld, Builder, CREATURES, gemGeo, crystalGeo, coinGeo, heartGeo, chestGeo, bombGeo, magnetGeo, discGeo, floorTextures, vinylTexture, glowTexture, ringTexture, stripeTexture };
})(typeof window !== 'undefined' ? window : globalThis);
