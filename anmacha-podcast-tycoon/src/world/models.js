/* AnMaCha Podcast Tycoon 3D – Modellbau für die 3D-Welt (Three.js r128, global THREE).
   • Builder: sammelt Grundformen (Quader, Zylinder, Kugel, Kegel, Dreieck) in EINER vertexfarbigen BufferGeometry (ohne Index).
   • objectGeo(id): Modell eines Objekt-Typs aus objects.js (opak + Leucht-Teile getrennt), zwischengespeichert.
   • figureSystem(): alle Figuren als InstancedMeshes (wenige Draw-Calls), mit Laufanimation (Beine/Arme schwingen).
   • figure(look): einzelne Figur als Group (für Szenen außerhalb der Stadt).
   • prop(): Requisiten aller Typen aus districts.js (plus Bushaltestelle, Job-Pult, Bau-Terminal, Pachtschild, Absperrung …).
   • Oberflächen: jede Ecke trägt eine Nummer aus M.SURF (Attribut "surf"); textures.js legt damit Holz, Fliesen, Ziegel,
     Asphalt, Gras … auf die Eckfarbe (ein Material, ein Draw-Call). b.surf('wood') setzt die Oberfläche für folgende Formen.
   • setDetail(0|1|2): Rundungs-Feinheit (low/mid/high) für Figuren, Bäume und runde Objektteile. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const M = PT.Models = {};
  const HALF_PI = Math.PI / 2;

  // ── Oberflächen (Nummer → [Kanal (0-3 Textur A, 4-7 Textur B), Wiederholung je Meter, Stärke, Rauheit]) ──
  // Kanäle: 0 Dielen, 1 Fliesen, 2 Ziegel, 3 Putz | 4 Asphalt, 5 Gras, 6 Teppich, 7 Kies (siehe textures.js)
  const SURF_LIST = [
    ['none', 3, 1, 0, 0.8], ['wood', 0, 0.5, 0.5, 0.55], ['parquet', 0, 1.1, 0.42, 0.42], ['tiles', 1, 0.5, 0.5, 0.3], ['concrete', 3, 0.22, 0.5, 0.85],
    ['carpet', 6, 1.5, 0.45, 1], ['plaster', 3, 0.35, 0.16, 0.92], ['brick', 2, 0.5, 0.55, 0.9], ['asphalt', 4, 0.2, 0.55, 0.9], ['paving', 1, 0.42, 0.42, 0.85],
    ['plaza', 1, 0.75, 0.32, 0.75], ['grass', 5, 0.12, 0.6, 1], ['gravel', 7, 0.5, 0.4, 1], ['leaves', 5, 0.6, 0.55, 0.9], ['bark', 0, 1.5, 0.45, 0.95],
    ['slab', 1, 0.2, 0.35, 0.85], ['fine', 3, 2, 0.1, 0.7], ['fabric', 6, 3, 0.25, 1], ['metal', 3, 1, 0.05, 0.35], ['glossy', 3, 1, 0, 0.3],
    ['woodfine', 0, 0.6, 0.25, 0.5], ['sand', 7, 0.35, 0.35, 1]
  ];
  const SURF = M.SURF = {}; SURF_LIST.forEach((e, i) => { SURF[e[0]] = i; });
  M.SURF_PARAMS = SURF_LIST.map(e => e.slice(1));
  // ── Feinheit: 0 = low, 1 = mid, 2 = high ──
  let DETAIL = 1;
  M.setDetail = function (lv) { lv = Math.max(0, Math.min(2, lv | 0)); if (lv !== DETAIL) { DETAIL = lv; Object.keys(objCache).forEach(k => { const o = objCache[k]; if (o.opaque) o.opaque.dispose(); if (o.glow) o.glow.dispose(); if (o.all) o.all.dispose(); delete objCache[k]; }); } return DETAIL; };
  M.detail = () => DETAIL;
  /** Segmentzahl für runde Teile je nach Feinheit (low bleibt wie bisher). */
  const segQ = n => DETAIL === 0 ? n : Math.round(n * (DETAIL === 2 ? 1.8 : 1.4));
  M.seg = segQ;

  // ── Farben ─────────────────────────────────────────────────
  const colCache = {};
  M.col = function (T, c) {
    if (c && c.isColor) return c;
    const k = c == null ? '#ffffff' : String(c);
    if (!colCache[k]) { try { colCache[k] = new T.Color(k); } catch (e) { colCache[k] = new T.Color('#ff00ff'); } }
    return colCache[k];
  };
  M.mix = function (T, a, b, t) { return M.col(T, a).clone().lerp(M.col(T, b), t); };
  M.shade = function (T, a, f) { const c = M.col(T, a).clone(); c.r *= f; c.g *= f; c.b *= f; return c; };

  // ── Grundformen (zwischengespeichert, ohne Index) ──────────
  const prim = {};
  function P(T, key, make) { if (!prim[key]) { const g = make(); prim[key] = g.index ? g.toNonIndexed() : g; if (g.index) g.dispose(); } return prim[key]; }
  M.prims = prim;
  M.clearCache = function () {
    Object.keys(prim).forEach(k => { const g = prim[k]; if (g && g.dispose) g.dispose(); else if (g) Object.keys(g).forEach(n => { if (g[n] && g[n].dispose) g[n].dispose(); }); delete prim[k]; });
    Object.keys(objCache).forEach(k => { const o = objCache[k]; if (o.opaque) o.opaque.dispose(); if (o.glow) o.glow.dispose(); if (o.all) o.all.dispose(); delete objCache[k]; });
    Object.keys(colCache).forEach(k => delete colCache[k]);
  };

  // ── Builder ────────────────────────────────────────────────
  function Builder(T) {
    this.T = T; this.p = []; this.n = []; this.c = []; this.s = []; this.sf = 0; this.m = null;
    this._m = new T.Matrix4(); this._nm = new T.Matrix3(); this._l = new T.Matrix4();
    this._q = new T.Quaternion(); this._e = new T.Euler(); this._v = new T.Vector3(); this._s = new T.Vector3();
  }
  M.Builder = Builder;
  M.builder = T => new Builder(T);
  /** Aktuelle Zusatz-Transformation (Weltlage eines Requisits): Verschiebung + Drehung um y. */
  Builder.prototype.at = function (x, y, z, ry) {
    if (x == null) { this.m = null; return this; }
    this.m = this.m || new this.T.Matrix4();
    this._q.setFromAxisAngle(this._v.set(0, 1, 0), ry || 0);
    this.m.compose(this._v.set(x, y || 0, z), this._q, this._s.set(1, 1, 1));
    return this;
  };
  Builder.prototype.setMatrix = function (m) { this.m = m ? (this.m || new this.T.Matrix4()).copy(m) : null; return this; };
  Builder.prototype.count = function () { return this.p.length / 3; };
  /** Oberfläche für alle folgenden Formen (Name aus M.SURF oder Nummer). */
  Builder.prototype.surf = function (k) { this.sf = typeof k === 'number' ? k : (SURF[k] || 0); return this; };
  /** Fügt eine (nicht indizierte) Geometrie mit lokaler Matrix und Farbe (oder deren Farbattribut) an. */
  Builder.prototype.add = function (geo, local, color) {
    const m = this._m;
    if (local) { if (this.m) m.multiplyMatrices(this.m, local); else m.copy(local); } else if (this.m) m.copy(this.m); else m.identity();
    this._nm.getNormalMatrix(m);
    const e = m.elements, ne = this._nm.elements;
    const Pa = geo.attributes.position.array, Na = geo.attributes.normal ? geo.attributes.normal.array : null, Ca = geo.attributes.color ? geo.attributes.color.array : null;
    const Sa = geo.attributes.surf ? geo.attributes.surf.array : null, sf = this.sf;
    const cnt = Pa.length / 3, p = this.p, n = this.n, c = this.c, sa = this.s;
    const cr = color ? color.r : 1, cg = color ? color.g : 1, cb = color ? color.b : 1;
    for (let i = 0; i < cnt; i++) {
      const i3 = i * 3, x = Pa[i3], y = Pa[i3 + 1], z = Pa[i3 + 2];
      p.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
      if (Na) {
        const nx = Na[i3], ny = Na[i3 + 1], nz = Na[i3 + 2];
        const ax = ne[0] * nx + ne[3] * ny + ne[6] * nz, ay = ne[1] * nx + ne[4] * ny + ne[7] * nz, az = ne[2] * nx + ne[5] * ny + ne[8] * nz;
        const l = Math.sqrt(ax * ax + ay * ay + az * az) || 1; n.push(ax / l, ay / l, az / l);
      } else n.push(0, 1, 0);
      if (Ca) c.push(Ca[i3] * cr, Ca[i3 + 1] * cg, Ca[i3 + 2] * cb); else c.push(cr, cg, cb);
      sa.push(Sa && Sa[i] ? Sa[i] : sf);
    }
    return this;
  };
  Builder.prototype._local = function (x, y, z, sx, sy, sz, rot) {
    const T = this.T;
    if (rot && (rot.rx || rot.ry || rot.rz)) this._q.setFromEuler(this._e.set(rot.rx || 0, rot.ry || 0, rot.rz || 0));
    else this._q.set(0, 0, 0, 1);
    return this._l.compose(this._v.set(x, y, z), this._q, this._s.set(sx || 1e-4, sy || 1e-4, sz || 1e-4));
  };
  Builder.prototype.box = function (x, y, z, sx, sy, sz, color, rot) {
    const T = this.T, g = P(T, 'box', () => new T.BoxGeometry(1, 1, 1));
    return this.add(g, this._local(x, y, z, sx, sy, sz, rot), M.col(T, color));
  };
  /** Zylinder: Mitte, Radius oben, Höhe, Radius unten (wie objects.js). */
  Builder.prototype.cyl = function (x, y, z, rt, h, rb, color, rot, seg) {
    const T = this.T; seg = seg || 10; if (rb == null) rb = rt;
    const base = Math.max(rt, rb, 1e-4), a = Math.round(rt / base * 50) / 50, b = Math.round(rb / base * 50) / 50;
    const g = P(T, 'cyl' + a + '_' + b + '_' + seg, () => new T.CylinderGeometry(a, b, 1, seg));
    return this.add(g, this._local(x, y, z, base, h, base, rot), M.col(T, color));
  };
  Builder.prototype.sphere = function (x, y, z, r, color, rot, seg, sy) {
    const T = this.T; seg = seg || 10;
    const g = P(T, 'sph' + seg, () => new T.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7))));
    return this.add(g, this._local(x, y, z, r, r * (sy || 1), r, rot), M.col(T, color));
  };
  Builder.prototype.cone = function (x, y, z, r, h, color, rot, seg) {
    const T = this.T; seg = seg || 10;
    const g = P(T, 'cone' + seg, () => new T.ConeGeometry(1, 1, seg));
    return this.add(g, this._local(x, y, z, r, h, r, rot), M.col(T, color));
  };
  Builder.prototype.ring = function (x, y, z, r0, r1, color, seg) {
    const T = this.T; seg = seg || 32; const k = (r0 / r1).toFixed(2);
    const g = P(T, 'ring' + k + '_' + seg, () => { const r = new T.RingGeometry(r0 / r1, 1, seg, 1); r.rotateX(-HALF_PI); return r; });
    return this.add(g, this._local(x, y, z, r1, 1, r1, null), M.col(T, color));
  };
  /** Waagerechte Fläche (nach oben zeigend). */
  Builder.prototype.flat = function (x, y, z, sx, sz, color) {
    const T = this.T, g = P(T, 'flat', () => { const p = new T.PlaneGeometry(1, 1); p.rotateX(-HALF_PI); return p; });
    return this.add(g, this._local(x, y, z, sx, 1, sz, null), M.col(T, color));
  };
  /** Dreieck (Punkte im lokalen Rahmen der aktuellen Lage). */
  Builder.prototype.tri = function (a, b, c, color) {
    const T = this.T, col = M.col(T, color), m = this.m;
    const v = [a, b, c].map(q => { const w = new T.Vector3(q[0], q[1], q[2]); if (m) w.applyMatrix4(m); return w; });
    const nrm = new T.Vector3().subVectors(v[1], v[0]).cross(new T.Vector3().subVectors(v[2], v[0])).normalize();
    v.forEach(w => { this.p.push(w.x, w.y, w.z); this.n.push(nrm.x, nrm.y, nrm.z); this.c.push(col.r, col.g, col.b); this.s.push(this.sf); });
    return this;
  };
  Builder.prototype.build = function () {
    if (!this.p.length) return null;
    const T = this.T, g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
    g.setAttribute('surf', new T.Float32BufferAttribute(this.s, 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  };

  // ── Objekt-Modelle aus objects.js ─────────────────────────
  const objCache = {};
  const surfCache = {};
  /** Oberfläche eines Objektteils nach seiner Farbe: Braun-/Holztöne → feine Maserung, sonst feine Körnung. */
  function partSurf(col) {
    const k = String(col); if (surfCache[k] != null) return surfCache[k];
    let r = 0, s = 0;
    const m = /^#?([0-9a-f]{6})$/i.exec(k);
    if (m) {
      const v = parseInt(m[1], 16), R = (v >> 16 & 255) / 255, G = (v >> 8 & 255) / 255, B = (v & 255) / 255;
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, d = mx - mn;
      s = d < 1e-6 ? 0 : d / (1 - Math.abs(2 * l - 1));
      let h = 0; if (d > 1e-6) { if (mx === R) h = ((G - B) / d + 6) % 6; else if (mx === G) h = (B - R) / d + 2; else h = (R - G) / d + 4; } h *= 60;
      r = (h >= 18 && h <= 45 && s > 0.22 && s < 0.75 && l > 0.18 && l < 0.72) ? SURF.woodfine : SURF.fine;
    } else r = SURF.fine;
    return (surfCache[k] = r);
  }
  function emitParts(b, gl, parts) {
    (parts || []).forEach(pt => {
      if (!pt || !pt.length) return;
      const s = pt[0], x = +pt[1] || 0, y = +pt[2] || 0, z = +pt[3] || 0, a = +pt[4] || 0, bb = +pt[5] || 0, c = +pt[6] || 0, col = pt[7] || '#999', o = pt[8] || null;
      const t = o && o.glow ? gl : b, sq = segQ(10);
      t.surf(partSurf(col));
      if (s === 'b') t.box(x, y, z, a, bb, c, col, o);
      else if (s === 'c') t.cyl(x, y, z, a, bb, c, col, o, sq);
      else if (s === 's') t.sphere(x, y, z, a, col, o, sq);
      else if (s === 'o') t.cone(x, y, z, a, bb, col, o, sq);
      t.surf(0);
    });
  }
  /** { opaque, glow, all, top } – Geometrien im Objekt-Rahmen (Mitte der Grundfläche, Vorderseite +z). top = Ablagehöhe. */
  M.objectGeo = function (T, id) {
    if (objCache[id]) return objCache[id];
    const D = PT.DATA || {}, d = D.objectById && D.objectById[id];
    const b = new Builder(T), gl = new Builder(T), all = new Builder(T);
    let top = 0.75;
    if (d && d.m && d.m.length) {
      emitParts(b, gl, d.m);
      emitParts(all, all, d.m);
      if (d.surface) { top = 0; d.m.forEach(pt => { if (pt[0] === 'b') top = Math.max(top, pt[2] + pt[5] / 2); }); }
    } else { b.box(0, 0.4, 0, 0.8, 0.8, 0.8, '#b0b0b0'); all.box(0, 0.4, 0, 0.8, 0.8, 0.8, '#b0b0b0'); }
    objCache[id] = { opaque: b.build(), glow: gl.build(), all: all.build(), top, def: d || null };
    return objCache[id];
  };

  // ── Figuren ────────────────────────────────────────────────
  // Stilisierte, glatt schattierte Menschen (~1,8 m, Kopf ≈ 1/6,5): Hüfte y = 0.92, Schulter y = 1.40, Kinn ≈ 1.55, Scheitel ≈ 1.80.
  // Körperteile sind eigene, glatte Formen (Drehkörper mit Spline-Profil, verformte Kugeln) mit gemittelten Normalen.
  const HAIR_STYLES = ['short', 'long', 'bob', 'curly', 'bun', 'ponytail', 'side', 'bald'];
  M.HAIR_STYLES = HAIR_STYLES;
  // Eigene Teile der Hauptfiguren (Marco: Seitenscheitel + Vollbart, Andrew: kurze, strukturierte Haare)
  const HERO_PARTS = ['hair_marco', 'beard_marco', 'hair_andrew'];
  const HIP_Y = 0.92, HIP_X = 0.08, SHO_Y = 1.4, SHO_X = 0.188, ARM_Z = 0.09, HEAD_DY = 0.022;
  const WARM = [0.97, 0.9, 0.85]; // Haut etwas wärmer (lineare Beleuchtung + Tonemapping hellen helle Töne auf)
  const skinCol = (T, c) => M.col(T, c).clone().multiply(new T.Color(WARM[0], WARM[1], WARM[2]));
  const bell = (v, c, w) => { const t = (v - c) / w; return Math.exp(-t * t); };
  const sstep = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  /** Glatte Normalen für nicht indizierte Geometrie: Flächennormalen je Eckposition mitteln (schließt auch Nahtkanten). */
  function smoothNormals(T, g) {
    const p = g.attributes.position.array, n = new Float32Array(p.length), acc = new Map(), keys = new Array(p.length / 3);
    const key = i => Math.round(p[i] * 2e4) + ',' + Math.round(p[i + 1] * 2e4) + ',' + Math.round(p[i + 2] * 2e4);
    for (let i = 0; i < p.length; i += 9) {
      const ax = p[i + 3] - p[i], ay = p[i + 4] - p[i + 1], az = p[i + 5] - p[i + 2], bx = p[i + 6] - p[i], by = p[i + 7] - p[i + 1], bz = p[i + 8] - p[i + 2];
      const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      for (let k = 0; k < 3; k++) { const j = i + k * 3, kk = keys[j / 3] = key(j); let a = acc.get(kk); if (!a) acc.set(kk, a = [0, 0, 0]); a[0] += nx; a[1] += ny; a[2] += nz; }
    }
    for (let v = 0; v < keys.length; v++) { const a = acc.get(keys[v]), l = Math.hypot(a[0], a[1], a[2]) || 1; n[v * 3] = a[0] / l; n[v * 3 + 1] = a[1] / l; n[v * 3 + 2] = a[2] / l; }
    g.setAttribute('normal', new T.BufferAttribute(n, 3));
    return g;
  }
  M.smoothNormals = smoothNormals;
  /** Geometrie ohne Index, Ecken mit fn(x, y, z) → [x, y, z] verformt, danach glatte Normalen. */
  function shaped(T, geo, fn) {
    const g = geo.index ? geo.toNonIndexed() : geo; if (g !== geo) geo.dispose();
    if (fn) { const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const r = fn(a.getX(i), a.getY(i), a.getZ(i)); a.setXYZ(i, r[0], r[1], r[2]); } }
    return smoothNormals(T, g);
  }
  /** Drehkörper aus einem Profil [[r, y], …] (unten → oben), mit Catmull-Rom geglättet. dk = Tiefe/Breite. */
  function lathe(T, prof, seg, pts, dk, fn) {
    const c = new T.SplineCurve(prof.map(q => new T.Vector2(Math.max(1e-4, q[0]), q[1])));
    const lg = new T.LatheGeometry(c.getPoints(pts), seg);
    lg.rotateY(Math.PI); // Naht nach hinten
    return shaped(T, lg, (x, y, z) => { const r = fn ? fn(x, y, z * (dk || 1)) : [x, y, z * (dk || 1)]; return r; });
  }
  /** Geometrien der Körperteile (weiß = wird mit der Instanzfarbe eingefärbt), je Feinheit zwischengespeichert. */
  function partGeos(T) {
    const ck = '__fig' + DETAIL;
    if (prim[ck]) return prim[ck];
    const LV = DETAIL, SEG = [8, 10, 14][LV], PTS = [6, 9, 13][LV], HS = [[14, 10], [22, 15], [30, 20]][LV], SM = [6, 8, 10][LV];
    const W = '#ffffff', S = f => M.shade(T, W, f), mk = f => { const b = new Builder(T); f(b); return b.build(); };
    const add = (b, geo, x, y, z, sx, sy, sz, c, rot) => b.add(geo, b._local(x, y, z, sx, sy, sz, rot), M.col(T, c));
    const sph = (seg, key) => P(T, 'fsph' + seg + (key || ''), () => shaped(T, new T.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.75)))));
    const ell = (b, x, y, z, rx, ry, rz, c, rot, seg) => add(b, sph(seg || SM), x, y, z, rx, ry, rz, c, rot);
    const ring = (b, y, h, r, dk, c, seg) => add(b, P(T, 'fring' + (seg || SEG), () => shaped(T, new T.CylinderGeometry(1, 1, 1, seg || SEG, 1, true))), 0, y, 0, r, h, r * dk, c);
    const curve = (b, pts, rad, c, seg) => { const cv = new T.CatmullRomCurve3(pts.map(q => new T.Vector3(q[0], q[1], q[2]))); const tg = new T.TubeGeometry(cv, seg || 10, rad, Math.max(5, SM - 2), false); const g = shaped(T, tg); b.add(g, null, M.col(T, c)); g.dispose(); };
    const g = {};

    // Bein (Drehpunkt Hüfte, y = 0): ein durchgehender Drehkörper mit Oberschenkel, Knie, Wade, Knöchel; Hosensaum
    g.leg = mk(b => {
      b.add(P(T, 'fleg' + LV, () => lathe(T, [[0.001, -0.9], [0.05, -0.895], [0.052, -0.86], [0.051, -0.78], [0.057, -0.66], [0.062, -0.58], [0.057, -0.49], [0.06, -0.43], [0.068, -0.3], [0.076, -0.16], [0.081, -0.05], [0.077, 0.03], [0.045, 0.075], [0.001, 0.08]], SEG, PTS + 2, 1,
        (x, y, z) => [x, y, z + (y > -0.55 && y < -0.38 ? 0.006 * bell(y, -0.46, 0.05) : 0) - (y > -0.75 && y < -0.5 ? 0.006 * bell(y, -0.62, 0.06) * (z < 0 ? -1 : 0) : 0)])), null, M.col(T, W));
      ring(b, -0.875, 0.03, 0.0535, 1, S(0.8));
    });
    // Schuh (Drehpunkt Hüfte): runde Sneaker-Form mit flacher, dunklerer Sohle und Schnürung
    g.shoe = mk(b => {
      const up = P(T, 'fshoe' + LV, () => shaped(T, new T.SphereGeometry(1, SEG, Math.round(SEG * 0.7)), (x, y, z) => {
        if (y < -0.25) y = -0.25 + (y + 0.25) * 0.2;
        const toe = z > 0 ? 1 - 0.25 * y * z : 1; return [x * toe * (z < -0.4 ? 0.95 : 1), y * (z > 0.3 ? 1 - 0.35 * (z - 0.3) : 1), z];
      }));
      add(b, up, 0, -0.872, 0.03, 0.056, 0.05, 0.125, W);
      add(b, P(T, 'fsole' + LV, () => shaped(T, new T.CylinderGeometry(1, 1, 1, SEG, 1, false))), 0, -0.908, 0.03, 0.06, 0.024, 0.13, S(0.5));
      if (LV > 1) for (let i = 0; i < 3; i++) ell(b, 0, -0.842 + i * 0.008, 0.075 - i * 0.022, 0.026, 0.004, 0.006, S(0.7), { rx: -0.6 }, 6);
    });
    // Oberkörper (Polo): Brustkorb mit ovalem Querschnitt, runde Schultern, Brust, Saum, Kragen mit Ecken, Knopfleiste
    const TORSO = [[0.001, 0.87], [0.16, 0.875], [0.163, 0.93], [0.157, 1.0], [0.161, 1.08], [0.176, 1.18], [0.186, 1.26], [0.186, 1.32], [0.176, 1.37], [0.14, 1.425], [0.09, 1.46], [0.066, 1.485], [0.001, 1.492]];
    const torsoFn = (x, y, z) => {
      if (z > 0) z *= 1 + 0.12 * bell(y, 1.25, 0.09) + 0.04 * bell(y, 1.02, 0.08); else z *= 0.94 - 0.03 * bell(y, 1.25, 0.12);
      x *= 1 + 0.1 * bell(y, 1.375, 0.045);
      return [x, y, z];
    };
    g.torso = mk(b => {
      b.add(P(T, 'ftorso' + LV, () => lathe(T, TORSO, SEG + 4, PTS + 4, 0.62, torsoFn)), null, M.col(T, W));
      add(b, P(T, 'fhem' + LV, () => shaped(T, new T.CylinderGeometry(1, 1.02, 1, SEG + 4, 1, true))), 0, 0.888, 0, 0.166, 0.03, 0.166 * 0.66, S(0.86));
      // Kragen: leicht aufgestellter Ring + zwei Spitzen auf der Brust
      add(b, P(T, 'fcollar' + LV, () => shaped(T, new T.CylinderGeometry(0.85, 1, 1, SEG, 1, true))), 0, 1.488, -0.006, 0.076, 0.045, 0.072, S(0.9));
      [-1, 1].forEach(sg => ell(b, sg * 0.036, 1.452, 0.074, 0.034, 0.012, 0.024, S(0.9), { rz: sg * 0.75, rx: -0.75, ry: sg * 0.25 }));
      ell(b, 0, 1.385, 0.113, 0.017, 0.058, 0.006, S(0.92), { rx: -0.15 });
      if (LV) [1.405, 1.36].forEach(y => ell(b, 0, y, 0.12, 0.0055, 0.0055, 0.003, S(0.6), null, 6));
    });
    // Hüfte/Gesäß (Hosenfarbe) mit Gürtel: schließt die Lücke zwischen Polo und Beinen
    g.hips = mk(b => {
      b.add(P(T, 'fhips' + LV, () => lathe(T, [[0.001, 0.8], [0.11, 0.808], [0.142, 0.85], [0.15, 0.9], [0.146, 0.95], [0.14, 0.99], [0.001, 1.0]], SEG + 4, PTS, 0.66)), null, M.col(T, W));
    });
    // Ärmel (Drehpunkt Schulter): Kurzarm, leicht ausgestellt, mit Bündchen
    g.sleeve = mk(b => {
      b.add(P(T, 'fslv' + LV, () => lathe(T, [[0.06, -0.2], [0.061, -0.17], [0.062, -0.1], [0.061, -0.03], [0.054, 0.012], [0.035, 0.036], [0.001, 0.045]], SEG, PTS, 1)), null, M.col(T, W));
      ring(b, -0.192, 0.022, 0.0625, 1, S(0.86));
    });
    // Arm in Hautfarbe (Drehpunkt Schulter): Oberarm, Ellbogen, angewinkelter Unterarm, Hand mit Daumen und Fingern
    const EA = 0.18, ec = Math.cos(EA), es = Math.sin(EA), EY = -0.3;
    const fa = d => [EY - d * ec, d * es];
    g.forearm = mk(b => {
      b.add(P(T, 'fuarm' + LV, () => lathe(T, [[0.001, EY - 0.02], [0.038, EY - 0.012], [0.042, EY + 0.04], [0.048, -0.16], [0.052, -0.06], [0.05, 0.0], [0.001, 0.03]], SEG, PTS, 1)), null, M.col(T, W));
      const lo = P(T, 'flarm' + LV, () => lathe(T, [[0.001, -0.27], [0.029, -0.262], [0.031, -0.24], [0.04, -0.12], [0.043, -0.05], [0.038, 0.0], [0.001, 0.02]], SEG, PTS, 0.9));
      add(b, lo, 0, EY, 0, 1, 1, 1, W, { rx: -EA });
      const hp = fa(0.3), hr = { rx: -EA - 0.08 };
      ell(b, 0, hp[0], hp[1], 0.021, 0.046, 0.04, S(0.97), hr);
      if (LV > 1) {
        for (let i = 0; i < 4; i++) { const zz = (i - 1.5) * 0.017, f = fa(0.352 - Math.abs(i - 1.3) * 0.006); ell(b, 0.001, f[0], f[1] + zz, 0.0105, 0.03, 0.0095, S(0.95), { rx: -EA - 0.25 }, 6); }
        const th = fa(0.3); ell(b, 0, th[0] - 0.005, th[1] + 0.044, 0.011, 0.026, 0.011, S(0.95), { rx: -0.6 });
      } else {
        const f = fa(0.345); ell(b, 0, f[0], f[1], 0.019, 0.03, 0.036, S(0.95), hr);
        const th = fa(0.3); ell(b, 0, th[0], th[1] + 0.042, 0.011, 0.024, 0.011, S(0.95), { rx: -0.6 });
      }
    });
    // Kopf: Hals, Schädel (verformte Kugel: schmalerer Kiefer, Kinn, Wangen, Hinterkopf), Nase, Ohren, Augenlider, Mund
    const HC = [0, 1.668, 0], HR = [0.102, 0.126, 0.112];
    const skullFn = (x, y, z) => {
      if (y < 0) { const t = -y; x *= 1 - 0.14 * t * t; if (z > 0) z *= 1 + 0.1 * t - 0.05 * t * t; else z *= 1 - 0.38 * t * t; }
      else { if (z < 0) z *= 1.05; x *= 1 - 0.04 * y * y; }
      x *= 1 + 0.035 * bell(y, -0.15, 0.2) * (z > 0 ? 1 : 0);
      if (z > 0.75 && y > 0.1) z *= 1 - 0.03 * y;
      return [x * 0.97, y, z];
    };
    const skull = P(T, 'fskull' + LV, () => shaped(T, new T.SphereGeometry(1, HS[0], HS[1]), skullFn));
    const EYE_Y = 1.676, EYE_X = 0.037, EYE_Z = 0.088, EYE_R = 0.0195;
    g.head = mk(b => {
      b.add(P(T, 'fneck' + LV, () => lathe(T, [[0.001, 1.43], [0.06, 1.435], [0.06, 1.5], [0.058, 1.56], [0.05, 1.6], [0.001, 1.61]], SEG, PTS, 0.95)), b._local(0, 0, -0.008, 1, 1, 1, null), M.col(T, S(0.93)));
      add(b, skull, HC[0], HC[1], HC[2], HR[0], HR[1], HR[2], W);
      // Nase: Rücken + runde Spitze + Nasenflügel
      ell(b, 0, 1.655, 0.11, 0.0135, 0.03, 0.018, S(0.97), { rx: 0.32 });
      ell(b, 0, 1.634, 0.118, 0.0125, 0.0115, 0.012, S(0.97));
      if (LV) [-1, 1].forEach(sg => ell(b, sg * 0.012, 1.631, 0.113, 0.009, 0.009, 0.009, S(0.93), null, 6));
      // Ohren: Muschel + dunklere Innenseite
      [-1, 1].forEach(sg => { ell(b, sg * 0.103, 1.66, -0.006, 0.013, 0.032, 0.022, S(0.95), { rz: sg * -0.12, ry: sg * 0.35 }); if (LV) ell(b, sg * 0.111, 1.66, -0.003, 0.005, 0.02, 0.012, S(0.78), { ry: sg * 0.35 }, 6); });
      // Augenlider (Hautfarbe, verdecken den oberen Augapfel) und Wangen
      const lid = P(T, 'flid' + LV, () => shaped(T, new T.SphereGeometry(1, SM + 2, 5, 0, Math.PI * 2, 0, Math.PI * 0.42)));
      [-1, 1].forEach(sg => { add(b, lid, sg * EYE_X, EYE_Y, EYE_Z, EYE_R * 1.1, EYE_R * 1.1, EYE_R * 1.1, S(0.96), { rx: 0.35 }); });
      // Mund: geschwungenes Lächeln + Unterlippe
      curve(b, [[-0.024, 1.6, 0.098], [-0.01, 1.594, 0.106], [0.01, 1.594, 0.106], [0.024, 1.6, 0.098]], 0.0032, '#9a4a46', 10);
      if (LV) ell(b, 0, 1.588, 0.103, 0.014, 0.0045, 0.006, '#e0a49a', null, 10);
    });
    // Augen (feste Farben): Augapfel, Iris, Pupille, Glanzpunkt
    g.eyes = mk(b => {
      [-1, 1].forEach(sg => {
        const x = sg * EYE_X;
        ell(b, x, EYE_Y, EYE_Z, EYE_R, EYE_R, EYE_R, '#f7f4ef', null, SM + 2);
        ell(b, x, EYE_Y - 0.002, EYE_Z + EYE_R * 0.8, 0.0108, 0.0115, 0.0045, LV ? '#5a3a22' : '#2e2018', null, SM);
        if (LV) ell(b, x, EYE_Y - 0.002, EYE_Z + EYE_R * 0.8 + 0.0025, 0.0058, 0.0062, 0.003, '#120c08', null, 6);
        if (LV) ell(b, x + 0.004, EYE_Y + 0.003, EYE_Z + EYE_R * 0.8 + 0.0045, 0.0022, 0.0022, 0.0012, '#ffffff', null, 4);
      });
    });
    // Frisuren (Haarfarbe). Augenbrauen gehören zur Frisur (Haarfarbe), als geschwungene Röhren.
    const brows = (b, k) => [-1, 1].forEach(sg => curve(b, [[sg * 0.018, 1.703, 0.104], [sg * 0.036, 1.708, 0.103], [sg * 0.056, 1.702, 0.094]], 0.0042 * (k || 1), W, 8));
    // Haarkappe: verformte Kugelkalotte über dem Schädel; front = Höhe des Haaransatzes vorne
    const capGeo = (key, th, tilt, vol, fn) => P(T, 'fcap' + key + LV, () => {
      const sg = new T.SphereGeometry(1, HS[0], Math.round(HS[1] * 0.8), 0, Math.PI * 2, 0, th); sg.rotateX(tilt);
      return shaped(T, sg, (x, y, z) => { let r = skullFn(x, y, z); r = [r[0] * 1.06, r[1] * 1.05 + (y > 0 ? vol * y * y : 0), r[2] * 1.06]; return fn ? fn(r[0], r[1], r[2], x, y, z) : r; });
    });
    const cap = (b, geo, c) => add(b, geo, HC[0], HC[1], HC[2], HR[0], HR[1], HR[2], c || W);
    const shortCap = () => capGeo('short', 1.62, -0.57, 0.1);
    g.hair_short = mk(b => {
      cap(b, shortCap()); brows(b);
      [-1, 1].forEach(sg => ell(b, sg * 0.096, 1.655, 0.03, 0.007, 0.024, 0.014, W, null, 8));
    });
    g.hair_long = mk(b => {
      cap(b, capGeo('long', 2.0, -0.55, 0.14)); brows(b);
      add(b, P(T, 'flongback' + LV, () => lathe(T, [[0.07, 1.42], [0.11, 1.47], [0.118, 1.56], [0.114, 1.64], [0.08, 1.71], [0.001, 1.74]], SEG + 4, PTS, 0.7)), 0, 0, -0.03, 1, 1, 1, W);
      [-1, 1].forEach(sg => ell(b, sg * 0.093, 1.57, 0.0, 0.03, 0.13, 0.065, W, { rz: sg * 0.06 }));
    });
    g.hair_bob = mk(b => {
      cap(b, capGeo('bob', 2.05, -0.5, 0.14)); brows(b);
      [-1, 1].forEach(sg => ell(b, sg * 0.094, 1.612, 0.0, 0.036, 0.085, 0.1, W));
      ell(b, 0, 1.6, -0.06, 0.112, 0.09, 0.075, W);
      ell(b, 0.02, 1.742, 0.08, 0.085, 0.026, 0.04, W, { rz: -0.15 });
    });
    g.hair_curly = mk(b => {
      cap(b, capGeo('curly', 1.8, -0.6, 0.12)); brows(b);
      for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, fr = Math.cos(a) > 0.6; ell(b, Math.sin(a) * 0.095, fr ? 1.755 : 1.725, Math.cos(a) * 0.1 - 0.012, 0.042, 0.042, 0.042, W); }
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.4; ell(b, Math.sin(a) * 0.05, 1.795, Math.cos(a) * 0.05 - 0.01, 0.048, 0.042, 0.048, W); }
      [-1, 0, 1].forEach(sg => ell(b, sg * 0.06, 1.64, -0.098, 0.045, 0.045, 0.04, W));
    });
    g.hair_bun = mk(b => { cap(b, capGeo('bun', 1.75, -0.55, 0.08)); brows(b); ell(b, 0, 1.79, -0.09, 0.055, 0.05, 0.055, W); add(b, P(T, 'ftor' + LV, () => shaped(T, new T.TorusGeometry(1, 0.3, 6, SEG))), 0, 1.765, -0.082, 0.04, 0.04, 0.04, S(0.8), { rx: 1.0 }); });
    g.hair_ponytail = mk(b => {
      cap(b, capGeo('pony', 1.75, -0.55, 0.08)); brows(b);
      ell(b, 0, 1.71, -0.122, 0.024, 0.024, 0.024, '#ff4d6d');
      curve(b, [[0, 1.71, -0.13], [0, 1.66, -0.18], [0, 1.56, -0.17], [0, 1.48, -0.14]], 0.032, W, 12);
    });
    g.hair_side = mk(b => { cap(b, capGeo('side', 1.7, -0.6, 0.12)); brows(b); ell(b, 0.03, 1.752, 0.07, 0.086, 0.03, 0.05, W, { rz: -0.35 }); });
    g.hair_bald = mk(b => {
      brows(b);
      add(b, P(T, 'fbald' + LV, () => { const sg = new T.SphereGeometry(1, HS[0], 10, Math.PI * 0.85, Math.PI * 1.3, Math.PI * 0.42, Math.PI * 0.2); return shaped(T, sg, (x, y, z) => { const r = skullFn(x, y, z); return [r[0] * 1.04, r[1] * 1.04, r[2] * 1.04]; }); }), HC[0], HC[1], HC[2], HR[0], HR[1], HR[2], W);
    });
    // Bart: Schale um Kiefer und Kinn, folgt der Kopfform; Mundöffnung und Schnurrbart
    const beardGeo = (key, top, thick, chin) => P(T, 'fbeard' + key + LV, () => {
      const sg = new T.SphereGeometry(1, Math.round(HS[0] * 1.5), Math.round(HS[1] * 1.3) + 4, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7), g0 = sg.toNonIndexed(); sg.dispose();
      const a = g0.attributes.position, out = [];
      const vert = (x, y, z) => {
        const side = Math.min(1, Math.abs(x) / (Math.abs(x) + Math.max(0, z) + 1e-3) * 1.1);
        const lim = top + (-0.02 - top) * side * side * side - (z < -0.25 ? 0.5 : 0);   // vorne tiefer, an den Seiten bis zu den Koteletten
        const mouth = z > 0.5 && Math.abs(x) < 0.32 - (y + 0.58) * (y + 0.58) * 4 && y < -0.47 && y > -0.69;
        const inB = y < lim && !mouth && z > -0.6;
        const r = skullFn(x, y, z), k = inB ? 1 + thick * sstep(lim, lim - 0.18, y) : 0.9;
        let yy = r[1]; if (inB && chin && y < -0.55 && z > 0) yy -= chin * (-0.55 - y) * z;
        return { p: [r[0] * k, yy * (inB ? 1 + thick * 0.3 : 0.9), r[2] * k], inB };
      };
      for (let i = 0; i < a.count; i += 3) {
        const v = [0, 1, 2].map(j => vert(a.getX(i + j), a.getY(i + j), a.getZ(i + j)));
        if (v.some(q => q.inB)) v.forEach(q => out.push(q.p[0], q.p[1], q.p[2]));
      }
      g0.dispose();
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(out, 3));
      return smoothNormals(T, g);
    });
    const stache = (b, k) => { curve(b, [[-0.034 * k, 1.598, 0.098], [-0.016, 1.611, 0.112], [0, 1.613, 0.115], [0.016, 1.611, 0.112], [0.034 * k, 1.598, 0.098]], 0.0085 * k, W, 12); };
    g.beard = mk(b => { add(b, beardGeo('n', -0.44, 0.07, 0), HC[0], HC[1], HC[2], HR[0], HR[1], HR[2], W); stache(b, 1); });
    g.glasses = mk(b => {
      const K = '#1d1f26', rg = P(T, 'ftorusg' + LV, () => shaped(T, new T.TorusGeometry(1, 0.13, 6, SEG + 4)));
      [-1, 1].forEach(sg => {
        add(b, rg, sg * 0.037, 1.676, 0.112, 0.026, 0.022, 0.026, K);
        curve(b, [[sg * 0.062, 1.68, 0.106], [sg * 0.1, 1.684, 0.06], [sg * 0.104, 1.672, -0.01]], 0.0028, K, 8);
      });
      curve(b, [[-0.012, 1.68, 0.115], [0, 1.684, 0.118], [0.012, 1.68, 0.115]], 0.003, K, 6);
    });
    g.cap = mk(b => {
      add(b, capGeo('capc', 1.5, -0.25, 0.06), HC[0], HC[1] + 0.008, HC[2], HR[0] * 1.04, HR[1] * 1.03, HR[2] * 1.04, W);
      ell(b, 0, 1.728, 0.13, 0.092, 0.009, 0.072, W, { rx: 0.12 });
      ell(b, 0, 1.815, -0.015, 0.013, 0.008, 0.013, S(0.7));
    });
    // AnMaCha-Logo auf der linken Brust: orangener Kreis mit dunklem Play-Dreieck (Farben fest)
    const bz = (() => { const y = 1.315, x = 0.072; let r = 0; const q = TORSO; for (let i = 1; i < q.length; i++) if (q[i][1] >= y) { const t = (y - q[i - 1][1]) / (q[i][1] - q[i - 1][1]); r = q[i - 1][0] + (q[i][0] - q[i - 1][0]) * t; break; } const zz = Math.sqrt(Math.max(0, r * r - x * x)) * 0.62; return torsoFn(x, y, zz)[2]; })();
    g.badge = mk(b => {
      b.at(0.072, 1.315, bz - 0.002, 0.42);
      add(b, P(T, 'fdisc' + LV, () => shaped(T, new T.CylinderGeometry(1, 1, 1, SEG + 6, 1, false))), 0, 0, 0.003, 0.03, 0.006, 0.03, '#ff8a1e', { rx: HALF_PI });
      b.tri([-0.009, 0.014, 0.0068], [-0.009, -0.014, 0.0068], [0.0155, 0, 0.0068], '#1d1f26');
      b.at(null);
    });
    g.mask = mk(b => {
      ell(b, 0, 1.678, -0.003, 0.108, 0.026, 0.122, '#1d1f26', null, SM + 6);
      ell(b, -0.037, 1.678, 0.112, 0.02, 0.014, 0.009, '#ffffff'); ell(b, 0.037, 1.678, 0.112, 0.02, 0.014, 0.009, '#ffffff');
      ell(b, 0, 1.706, -0.003, 0.109, 0.005, 0.123, '#c58bff', null, SM + 6);
    });
    // ── Hauptfiguren ──
    // Marco: kurze braune Haare mit Seitenscheitel und etwas Volumen vorne, voller brauner Bart mit Schnurrbart
    g.hair_marco = mk(b => {
      cap(b, capGeo('marco', 1.64, -0.57, 0.14, (x, y, z, ux, uy, uz) => [x + (uy > 0.2 ? 0.01 * uy : 0), y + (uz > 0.3 && uy > 0.2 ? 0.012 * uz : 0), z]));
      ell(b, 0.012, 1.772, 0.07, 0.075, 0.02, 0.045, W, { rz: -0.18, rx: -0.35 });
      curve(b, [[-0.03, 1.79, 0.07], [-0.03, 1.81, 0.0], [-0.03, 1.8, -0.06]], 0.0035, S(0.78), 8);
      [-1, 1].forEach(sg => ell(b, sg * 0.096, 1.65, 0.034, 0.008, 0.032, 0.016, W, null, 8));
      brows(b, 1.25);
    });
    g.beard_marco = mk(b => {
      add(b, beardGeo('m', -0.36, 0.13, 0.22), HC[0], HC[1], HC[2], HR[0], HR[1], HR[2], W);
      stache(b, 1.12);
      ell(b, 0, 1.578, 0.1, 0.016, 0.012, 0.01, S(0.85), null, 8);
    });
    // Andrew: kurze rotblonde Haare, oben strukturiert mit kleiner Tolle, an den Seiten kurz
    g.hair_andrew = mk(b => {
      cap(b, capGeo('andrew', 1.6, -0.6, 0.07, (x, y, z) => [x * (y < 1.7 - HC[1] ? 0.985 : 1), y, z]));
      const tufts = [[0, 1.784, 0.062, 0.06, 0.016, 0.04, -0.55], [-0.034, 1.79, 0.025, 0.05, 0.016, 0.05, -0.2], [0.034, 1.79, 0.025, 0.05, 0.016, 0.05, -0.2], [0, 1.796, -0.01, 0.055, 0.015, 0.055, 0.05], [0.014, 1.772, 0.088, 0.045, 0.014, 0.025, -1.0]];
      tufts.forEach(t => ell(b, t[0], t[1] - 0.008, t[2], t[3], t[4], t[5], W, { rx: t[6], rz: t[0] * 3 }));
      brows(b, 0.95);
    });
    // Weicher Bodenschatten (Kreis mit Alpha-Verlauf, falls die Textur da ist)
    g.shadow = (() => { const c = new T.CircleGeometry(0.46, 20); c.rotateX(-HALF_PI); const n = c.toNonIndexed(); c.dispose(); return n; })();
    prim[ck] = g;
    return g;
  }
  M.partGeos = partGeos;

  const DEF_LOOK = { skin: '#f0c8a8', hair: '#3b2a1e', shirt: '#4bb8ff', pants: '#2b2f3a', shoes: '#2b2522', hairStyle: 'short', build: 1 };
  function normLook(look) {
    const L = Object.assign({}, DEF_LOOK, look || {});
    if (HAIR_STYLES.indexOf(L.hairStyle) < 0) L.hairStyle = 'short';
    if (!L.shoes) L.shoes = DEF_LOOK.shoes;
    L.build = Math.max(0.8, Math.min(1.3, +L.build || 1));
    if (L.hero !== 'marco' && L.hero !== 'andrew') delete L.hero;
    return L;
  }
  M.normLook = normLook;
  /** Benötigte Zusatzteile einer Figur: Teilname → Farbe. */
  function optParts(L) {
    const hair = L.hero === 'marco' ? 'hair_marco' : L.hero === 'andrew' ? 'hair_andrew' : 'hair_' + L.hairStyle;
    const o = { [hair]: L.hair, glasses: L.glasses ? '#ffffff' : null, cap: L.cap, badge: L.badge ? '#ffffff' : null, mask: L.mask ? '#ffffff' : null };
    if (L.beard) o[L.hero === 'marco' ? 'beard_marco' : 'beard'] = L.beard;
    return o;
  }

  /** Pose einer Figur: Beinschwung, Armschwung, Wippen. phase in Radiant, amt 0..1 (Laufen), idle 0..1 (Stehen). */
  function pose(phase, amt, t) {
    const sw = Math.sin(phase) * 0.6 * amt;
    const bob = Math.abs(Math.cos(phase)) * 0.045 * amt + Math.sin(t * 2.1) * 0.008 * (1 - amt);
    const arm = Math.sin(t * 1.7) * 0.05 * (1 - amt);
    return { sw, bob, arm };
  }

  const LIMBS = ['leg', 'shoe', 'sleeve', 'forearm'], CORE = ['torso', 'hips', 'head', 'eyes', 'shadow'];
  const OPT = ['beard', 'glasses', 'cap', 'badge', 'mask'].concat(HAIR_STYLES.map(s => 'hair_' + s), HERO_PARTS);
  /** Figuren als InstancedMeshes. sys.add(look) → id; sys.set(id, x, y, z, ry, phase, walkAmt, visible); sys.update(time). */
  M.figureSystem = function (T, max, mats) {
    max = max || 40;
    const G = partGeos(T);
    const mat = mats && mats.body || new T.MeshLambertMaterial({ vertexColors: true });
    const shMat = mats && mats.shadow || new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });
    const group = new T.Group(); group.name = 'figures';
    const meshes = {};
    const white = new T.Color(1, 1, 1);
    const mk = (name, geo, cap, m) => { const im = new T.InstancedMesh(geo, m || mat, cap); for (let i = 0; i < cap; i++) im.setColorAt(i, white); im.count = 0; im.frustumCulled = false; im.name = 'fig_' + name; group.add(im); meshes[name] = im; return im; };
    LIMBS.forEach(k => mk(k, G[k], max * 2));
    CORE.forEach(k => mk(k, G[k], max, k === 'shadow' ? shMat : null));
    // Hauptfiguren-Teile gibt es nur wenige Male
    OPT.forEach(s => mk(s, G[s], HERO_PARTS.indexOf(s) >= 0 ? 4 : max));
    const opt = OPT;
    const slots = {}; opt.forEach(k => { slots[k] = { n: 0, free: [] }; });
    const figs = [];
    const zero = new T.Matrix4().makeScale(0, 0, 0);
    const tmpC = new T.Color();
    const m4 = new T.Matrix4(), root4 = new T.Matrix4(), part4 = new T.Matrix4(), rx4 = new T.Matrix4(), q = new T.Quaternion(), v = new T.Vector3(), s3 = new T.Vector3(), yAxis = new T.Vector3(0, 1, 0);
    function takeSlot(k) { const s = slots[k]; if (s.free.length) return s.free.pop(); if (s.n >= meshes[k].instanceMatrix.count) return -1; return s.n++; }
    function setCol(name, i, c) { meshes[name].setColorAt(i, c); }

    const sys = { group, meshes, figs, max };
    sys.add = function (look) {
      let i = figs.findIndex(f => f && f.free);
      if (i < 0) { if (figs.length >= max) return -1; i = figs.length; figs.push(null); }
      const L = normLook(look);
      const f = { i, look: L, x: 0, y: 0, z: 0, ry: 0, phase: 0, amt: 0, vis: true, opt: {}, free: false, t: i * 1.37 };
      const need = optParts(L);
      if (L.hero && Object.keys(need).some(k => need[k] && HERO_PARTS.indexOf(k) >= 0 && slots[k].n >= meshes[k].instanceMatrix.count && !slots[k].free.length)) { delete L.hero; Object.assign(need, optParts(L)); HERO_PARTS.forEach(k => { delete need[k]; }); }
      Object.keys(need).forEach(k => { if (need[k]) { const s = takeSlot(k); if (s < 0) return; f.opt[k] = s; setCol(k, s, M.col(T, need[k])); } });
      const shirt = M.col(T, L.shirt), skin = skinCol(T, L.skin), pants = M.col(T, L.pants), shoes = M.col(T, L.shoes);
      setCol('torso', i, shirt); setCol('hips', i, pants); setCol('head', i, skin); setCol('eyes', i, white);
      for (let sd = 0; sd < 2; sd++) { setCol('leg', i * 2 + sd, pants); setCol('shoe', i * 2 + sd, shoes); setCol('sleeve', i * 2 + sd, shirt); setCol('forearm', i * 2 + sd, skin); }
      setCol('shadow', i, tmpC.set(0, 0, 0));
      figs[i] = f;
      Object.keys(meshes).forEach(k => { if (meshes[k].instanceColor) meshes[k].instanceColor.needsUpdate = true; });
      return i;
    };
    sys.remove = function (i) {
      const f = figs[i]; if (!f || f.free) return;
      Object.keys(f.opt).forEach(k => { meshes[k].setMatrixAt(f.opt[k], zero); slots[k].free.push(f.opt[k]); });
      f.opt = {}; f.free = true; f.vis = false;
    };
    sys.get = i => figs[i];
    sys.set = function (i, x, y, z, ry, phase, amt, vis) {
      const f = figs[i]; if (!f) return;
      f.x = x; f.y = y; f.z = z; f.ry = ry; f.phase = phase; f.amt = amt; f.vis = vis !== false;
    };
    sys.update = function (time) {
      const n = figs.length;
      LIMBS.forEach(k => { meshes[k].count = n * 2; });
      CORE.forEach(k => { meshes[k].count = n; });
      opt.forEach(k => { meshes[k].count = slots[k].n; });
      for (let i = 0; i < n; i++) {
        const f = figs[i];
        if (!f || f.free || !f.vis) {
          CORE.forEach(k => meshes[k].setMatrixAt(i, zero));
          LIMBS.forEach(k => { meshes[k].setMatrixAt(i * 2, zero); meshes[k].setMatrixAt(i * 2 + 1, zero); });
          if (f) Object.keys(f.opt).forEach(k => meshes[k].setMatrixAt(f.opt[k], zero));
          continue;
        }
        const L = f.look, bw = L.build, p = pose(f.phase, f.amt, time + f.t);
        q.setFromAxisAngle(yAxis, f.ry);
        root4.compose(v.set(f.x, f.y + p.bob, f.z), q, s3.set(bw, 1, 1 + (bw - 1) * 0.6));
        meshes.torso.setMatrixAt(i, root4);
        meshes.hips.setMatrixAt(i, root4);
        // Kopf nicht mit der Statur verbreitern (nur leicht)
        m4.compose(v.set(f.x, f.y + p.bob - HEAD_DY, f.z), q, s3.set(1 + (bw - 1) * 0.25, 1, 1 + (bw - 1) * 0.2));
        meshes.head.setMatrixAt(i, m4);
        meshes.eyes.setMatrixAt(i, m4);
        Object.keys(f.opt).forEach(k => meshes[k].setMatrixAt(f.opt[k], k === 'badge' ? root4 : m4));
        // Schatten (nicht wippen, flach auf dem Boden)
        m4.compose(v.set(f.x, f.y + 0.02, f.z), q, s3.set(bw, 1, 1)); meshes.shadow.setMatrixAt(i, m4);
        for (let sd = 0; sd < 2; sd++) {
          const sg = sd ? 1 : -1;
          // Beine pendeln an der Hüfte, gegenläufig
          part4.makeTranslation(sg * HIP_X, HIP_Y, 0); rx4.makeRotationX(p.sw * sg); part4.multiply(rx4);
          m4.multiplyMatrices(root4, part4); meshes.leg.setMatrixAt(i * 2 + sd, m4); meshes.shoe.setMatrixAt(i * 2 + sd, m4);
          // Arme pendeln an der Schulter, gegen die Beine
          part4.makeTranslation(sg * SHO_X, SHO_Y, 0); rx4.makeRotationX(-p.sw * sg * 0.9 + p.arm); part4.multiply(rx4); rx4.makeRotationZ(sg * ARM_Z); part4.multiply(rx4);
          m4.multiplyMatrices(root4, part4); meshes.sleeve.setMatrixAt(i * 2 + sd, m4); meshes.forearm.setMatrixAt(i * 2 + sd, m4);
        }
      }
      Object.keys(meshes).forEach(k => { meshes[k].instanceMatrix.needsUpdate = true; });
    };
    sys.dispose = function () {
      Object.keys(meshes).forEach(k => { group.remove(meshes[k]); if (meshes[k].dispose) meshes[k].dispose(); });
      if (!(mats && mats.body)) mat.dispose();
      if (!(mats && mats.shadow)) shMat.dispose();
    };
    return sys;
  };

  /** Einzelne Figur als Group (eigene Materialien). M.animateFigure(g, phase, amt, time) bewegt Arme/Beine. */
  M.figure = function (T, look) {
    const G = partGeos(T), L = normLook(look), grp = new T.Group(); grp.name = 'figure';
    const mats = [];
    const mm = c => { const m = new T.MeshLambertMaterial({ vertexColors: true, color: M.col(T, c) }); mats.push(m); return m; };
    const shirt = mm(L.shirt), skin = mm(skinCol(T, L.skin)), pants = mm(L.pants), shoes = mm(L.shoes), white = mm('#ffffff');
    const body = new T.Group(); grp.add(body);
    const headG = new T.Group(); headG.position.y = -HEAD_DY;
    body.add(new T.Mesh(G.torso, shirt), new T.Mesh(G.hips, pants), headG); headG.add(new T.Mesh(G.head, skin), new T.Mesh(G.eyes, white));
    const need = optParts(L);
    Object.keys(need).forEach(k => { if (need[k] && G[k]) (k === 'badge' ? body : headG).add(new T.Mesh(G[k], need[k] === '#ffffff' ? white : mm(need[k]))); });
    grp.userData.limbs = [];
    for (let sd = 0; sd < 2; sd++) {
      const sg = sd ? 1 : -1;
      const leg = new T.Group(); leg.position.set(sg * HIP_X, HIP_Y, 0);
      leg.add(new T.Mesh(G.leg, pants), new T.Mesh(G.shoe, shoes)); body.add(leg);
      const arm = new T.Group(); arm.position.set(sg * SHO_X, SHO_Y, 0); arm.rotation.z = sg * ARM_Z;
      arm.add(new T.Mesh(G.sleeve, shirt), new T.Mesh(G.forearm, skin)); body.add(arm);
      grp.userData.limbs.push({ leg, arm, sg });
    }
    body.scale.set(L.build, 1, 1 + (L.build - 1) * 0.6);
    grp.userData.body = body; grp.userData.mats = mats;
    grp.userData.dispose = () => mats.forEach(m => m.dispose());
    return grp;
  };
  M.animateFigure = function (g, phase, amt, time) {
    const p = pose(phase || 0, amt || 0, time || 0), u = g.userData;
    if (!u || !u.limbs) return;
    u.body.position.y = p.bob;
    u.limbs.forEach(l => { l.leg.rotation.x = p.sw * l.sg; l.arm.rotation.x = -p.sw * l.sg * 0.9 + p.arm; });
  };

  // ── Bäume und Laternen (für InstancedMesh) ────────────────
  /** Kugel mit sanften Beulen (Laubkrone/Busch), glatt schattiert. */
  function lumpGeo(T, seg) {
    return P(T, 'lump' + seg, () => shaped(T, new T.SphereGeometry(1, seg, Math.round(seg * 0.75)), (x, y, z) => {
      const k = 1 + 0.08 * Math.sin(x * 5.1 + y * 2.3) * Math.cos(z * 4.7 - y * 1.7) + 0.05 * Math.sin(y * 7.3 + x * 3.1 + z * 2.2);
      return [x * k, y * k * (y < -0.3 ? 0.85 : 1), z * k];
    }));
  }
  M.lumpGeo = T => lumpGeo(T, [7, 10, 12][DETAIL]);
  M.treeGeo = function (T) {
    return P(T, '__tree' + DETAIL, () => {
      const b = new Builder(T), ls = [8, 10, 13][DETAIL], lump = lumpGeo(T, ls);
      b.surf('bark').cyl(0, 0.9, 0, 0.15, 1.8, 0.24, '#7a5236', null, segQ(7));
      if (DETAIL) { b.cyl(0.25, 1.75, 0.05, 0.05, 0.8, 0.08, '#7a5236', { rz: -0.7 }, 8); b.cyl(-0.22, 1.85, -0.1, 0.05, 0.7, 0.08, '#7a5236', { rz: 0.6, rx: 0.3 }, 8); }
      b.surf('leaves');
      const L = (x, y, z, r, c) => b.add(lump, b._local(x, y, z, r, r * 0.92, r, { ry: x * 3 + z }), M.col(T, c));
      L(0, 2.5, 0, 1.25, '#3f9a45'); L(0.45, 3.2, 0.15, 0.85, '#54b858'); L(-0.4, 3.0, -0.25, 0.8, '#3a8f40');
      if (DETAIL) L(0.1, 2.45, 0.7, 0.7, '#46a24b');
      if (DETAIL > 1) L(-0.55, 2.4, 0.35, 0.65, '#4aa84f');
      return b.build();
    });
  };
  M.lampGeo = function (T) {
    return P(T, '__lamp' + DETAIL, () => { const b = new Builder(T).surf('metal'); b.cyl(0, 0.12, 0, 0.18, 0.24, 0.22, '#2b2f3a', null, segQ(8)); b.cyl(0, 2.0, 0, 0.06, 4.0, 0.08, '#3a3f4d', null, segQ(6)); b.cyl(0.35, 3.98, 0, 0.04, 0.8, 0.04, '#3a3f4d', { rz: HALF_PI }, segQ(6)); b.cone(0.7, 3.88, 0, 0.3, 0.22, '#2b2f3a', null, segQ(8)); return b.build(); });
  };
  M.lampBulbGeo = function (T) {
    return P(T, '__bulb' + DETAIL, () => { const b = new Builder(T); b.sphere(0.7, 3.74, 0, 0.17, '#ffffff', null, 8); return b.build(); });
  };
  M.markerGeo = function (T) {
    return P(T, '__marker', () => { const b = new Builder(T); b.cone(0, -0.25, 0, 0.3, 0.5, '#ffffff', { rx: Math.PI }, 4); b.cone(0, 0.2, 0, 0.3, 0.4, '#ffffff', null, 4); return b.build(); });
  };

  // ── Requisiten ─────────────────────────────────────────────
  // ctx = { T, b: Builder (opak), g: Builder (leuchtend), glass: Builder, color: Bezirksfarbe, out: { solids: [], fences: [], signs: [], heights: [] }, gates: [[x,z], …] }
  // solids: { rot: [cx, cz, ry, hw, hd] } | { circle: [x, z, r] };  fences: [x0, x1, z]; signs: { key, spec, x, y, z, w, h, ry, both }
  function rotOf(a) { if (a == null) return 0; const n = +a; if (Number.isInteger(n) && n >= 0 && n <= 3) return -n * HALF_PI; return isFinite(n) ? n : 0; }
  M.rotOf = rotOf;
  function hashf(x, z, k) { let h = Math.imul((x * 73856093) ^ (z * 19349663) ^ (k || 0), 2654435761) >>> 0; return (h % 10000) / 10000; }
  const CAR_COLS = ['#ff4d6d', '#4bb8ff', '#ffd36b', '#4be08a', '#c58bff', '#ff8a1e', '#f2efe6'];

  function signQuad(ctx, key, spec, x, y, z, w, h, ry, both, opt) { opt = opt || {}; ctx.out.signs.push({ key, spec, x, y, z, w, h, ry: ry || 0, both: !!both, off: opt.off == null ? 0.07 : opt.off, tilt: opt.tilt || 0 }); }
  M.signQuad = signQuad;
  function solidRot(ctx, cx, cz, ry, hw, hd) { ctx.out.solids.push({ rot: [cx, cz, ry || 0, hw, hd] }); }
  function solidCircle(ctx, x, z, r) { ctx.out.solids.push({ circle: [x, z, r] }); }
  // lokalen Punkt (Requisit-Rahmen) in Welt umrechnen
  function wpt(x, z, ry, lx, lz) { const c = Math.cos(ry), s = Math.sin(ry); return [x + lx * c + lz * s, z - lx * s + lz * c]; }
  M.wpt = wpt;

  const PROPS = {};
  PROPS.road = (c, x, z, w, d) => {
    const b = c.b; b.at(null); w = +w || 6; d = +d || 6;
    b.surf('asphalt').box(x, 0.03, z, w, 0.06, d, '#53575f');
    b.surf('paving').box(x, 0.02, z, w + 1.2, 0.04, d + 1.2, '#c9c4b8').surf(0);
    if (w >= d) for (let t = -w / 2 + 1.5; t < w / 2 - 1; t += 4) b.box(x + t + 1, 0.065, z, 2, 0.01, 0.16, '#f2efe6');
    else for (let t = -d / 2 + 1.5; t < d / 2 - 1; t += 4) b.box(x, 0.065, z + t + 1, 0.16, 0.01, 2, '#f2efe6');
  };
  PROPS.bench = (c, x, z, r) => {
    const ry = rotOf(r), b = c.b; b.at(x, 0, z, ry);
    b.surf('woodfine'); for (let i = 0; i < 3; i++) b.box(0, 0.45, -0.17 + i * 0.17, 1.8, 0.07, 0.14, '#c9803a'); for (let i = 0; i < 2; i++) b.box(0, 0.68 + i * 0.18, -0.22, 1.8, 0.13, 0.05, '#c9803a', { rx: -0.12 });
    b.surf('metal').box(-0.75, 0.22, 0, 0.08, 0.45, 0.45, '#3a3f4d'); b.box(0.75, 0.22, 0, 0.08, 0.45, 0.45, '#3a3f4d').surf(0);
    b.at(null); solidRot(c, x, z, ry, 0.9, 0.3);
  };
  PROPS.sign = (c, x, z, text, ry) => {
    ry = ry || 0; const b = c.b; b.at(x, 0, z, ry);
    b.box(-1.4, 1.1, 0, 0.12, 2.2, 0.12, '#6b4f3a'); b.box(1.4, 1.1, 0, 0.12, 2.2, 0.12, '#6b4f3a');
    b.box(0, 1.9, 0, 3.1, 0.85, 0.1, '#fff4dc'); b.box(0, 2.36, 0, 3.2, 0.08, 0.14, '#ff8a1e');
    b.at(null);
    signQuad(c, 'sign:' + text, { text: String(text || ''), bg: '#fff4dc', fg: '#2b2f3a', border: '#ff8a1e' }, x, 1.9, z, 3.0, 0.75, ry, true);
    const a = wpt(x, z, ry, -1.4, 0), e = wpt(x, z, ry, 1.4, 0); solidCircle(c, a[0], a[1], 0.1); solidCircle(c, e[0], e[1], 0.1);
  };
  PROPS.mailbox = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.box(0, 0.5, 0, 0.1, 1.0, 0.1, '#3a3f4d'); b.box(0, 1.15, 0, 0.5, 0.45, 0.35, '#ffd36b'); b.box(0, 1.2, 0.18, 0.3, 0.04, 0.01, '#1d1f26');
    b.at(null); solidCircle(c, x, z, 0.2);
  };
  PROPS.kiosk = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.box(0, 1.3, 0, 3, 2.6, 3, '#ff7ad9'); b.box(0, 1.5, 1.51, 2.2, 0.9, 0.02, '#2b2f3a'); b.box(0, 1.05, 1.6, 2.4, 0.08, 0.3, '#fff4dc');
    for (let i = 0; i < 5; i++) b.box(-1.25 + i * 0.625, 2.2, 1.85, 0.62, 0.06, 0.8, i % 2 ? '#ffffff' : '#ff4d6d', { rx: 0.35 });
    b.box(0, 2.7, 0, 3.3, 0.2, 3.3, '#c0392b');
    b.at(null); solidRot(c, x, z, 0, 1.5, 1.5);
  };
  PROPS.poster = (c, x, z, text) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.cyl(0, 1.4, 0, 0.62, 2.8, 0.62, '#f2efe6', null, 14); b.cyl(0, 2.9, 0, 0.3, 0.3, 0.7, '#3e8a49', null, 14);
    b.cyl(0, 0.1, 0, 0.68, 0.2, 0.7, '#3e8a49', null, 14);
    b.cyl(0, 0.9, 0, 0.63, 0.5, 0.63, '#ff7ad9', null, 14); b.cyl(0, 2.35, 0, 0.63, 0.4, 0.63, '#6ef0ff', null, 14);
    b.at(null);
    signQuad(c, 'sign:' + text, { text: String(text || ''), bg: '#ffffff', fg: '#c0392b', border: '#ffb02e' }, x, 1.62, z + 0.6, 1.25, 0.32, 0, false);
    signQuad(c, 'sign:' + text, { text: String(text || ''), bg: '#ffffff', fg: '#c0392b', border: '#ffb02e' }, x, 1.62, z - 0.6, 1.25, 0.32, Math.PI, false);
    solidCircle(c, x, z, 0.65);
  };
  PROPS.antenna = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.box(0, 0.2, 0, 2.2, 0.4, 2.2, '#8a8f99');
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.box(sx * 0.45, 7, sz * 0.45, 0.12, 14, 0.12, '#ff4d6d', { rz: -sx * 0.05, rx: sz * 0.05 });
    for (let y = 1.5; y < 14; y += 2) b.box(0, y, 0, 1.0 - y * 0.03, 0.08, 1.0 - y * 0.03, '#f2efe6');
    b.cyl(0.4, 10, 0.3, 0.5, 0.15, 0.5, '#f2efe6', { rx: 1.2 }, 12);
    b.at(null); c.g.at(x, 0, z, 0); c.g.sphere(0, 14.3, 0, 0.25, '#ff2a2a'); c.g.at(null);
    solidRot(c, x, z, 0, 1.1, 1.1);
  };
  PROPS.car = (c, x, z, r) => {
    const ry = rotOf(r), b = c.b, col = CAR_COLS[Math.floor(hashf(x, z, 3) * CAR_COLS.length)];
    b.at(x, 0, z, ry);
    b.box(0, 0.6, 0, 3.8, 0.7, 1.8, col); b.box(-0.2, 1.2, 0, 2.2, 0.55, 1.62, '#2b3f5a'); b.box(-0.2, 1.5, 0, 2.1, 0.08, 1.6, col);
    for (const [wx, wz] of [[1.2, 0.85], [-1.2, 0.85], [1.2, -0.85], [-1.2, -0.85]]) b.cyl(wx, 0.35, wz, 0.35, 0.25, 0.35, '#1d1f26', { rx: HALF_PI }, 10);
    b.at(null); c.g.at(x, 0, z, ry); c.g.box(1.91, 0.7, 0.55, 0.04, 0.16, 0.3, '#fff8d0'); c.g.box(1.91, 0.7, -0.55, 0.04, 0.16, 0.3, '#fff8d0'); c.g.box(-1.91, 0.7, 0.6, 0.04, 0.14, 0.25, '#ff4d6d'); c.g.box(-1.91, 0.7, -0.6, 0.04, 0.14, 0.25, '#ff4d6d'); c.g.at(null);
    solidRot(c, x, z, ry, 1.9, 0.9);
  };
  PROPS.billboard = (c, x, z, text) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.box(-2.4, 2.4, 0, 0.25, 4.8, 0.25, '#3a3f4d'); b.box(2.4, 2.4, 0, 0.25, 4.8, 0.25, '#3a3f4d');
    b.box(0, 5.4, 0, 6.4, 1.8, 0.25, '#c58bff');
    b.at(null); c.g.at(x, 0, z, 0); c.g.box(-2, 6.4, 0.3, 0.3, 0.1, 0.3, '#fff8d0'); c.g.box(2, 6.4, 0.3, 0.3, 0.1, 0.3, '#fff8d0'); c.g.at(null);
    signQuad(c, 'bill:' + text, { text: String(text || ''), bg: '#241c3a', fg: '#ffd36b', border: '#ff7ad9' }, x, 5.4, z, 6.0, 1.5, 0, true, { off: 0.14 });
    const a = wpt(x, z, 0, -2.4, 0), e = wpt(x, z, 0, 2.4, 0); solidCircle(c, a[0], a[1], 0.2); solidCircle(c, e[0], e[1], 0.2);
  };
  PROPS.platform = (c, x, z, w, d) => {
    const b = c.b; b.at(null); w = +w || 10; d = +d || 4;
    b.surf('slab').box(x, 0.125, z, w, 0.25, d, '#d8d2c4').surf(0); b.box(x, 0.255, z + d / 2 - 0.3, w, 0.01, 0.25, '#ffd36b'); b.box(x, 0.255, z - d / 2 + 0.3, w, 0.01, 0.25, '#ffd36b');
    c.out.heights.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2, 0.25]);
  };
  PROPS.tracks = (c, x, z, len) => {
    const b = c.b; b.at(null); len = +len || 40;
    b.surf('gravel').box(x, 0.04, z, len, 0.08, 3.2, '#9a9080');
    b.surf('woodfine'); for (let t = -len / 2 + 0.4; t < len / 2; t += 1.0) b.box(x + t, 0.1, z, 0.28, 0.08, 2.4, '#7a5a3a');
    b.surf('metal').box(x, 0.18, z - 0.72, len, 0.1, 0.1, '#b8bcc6'); b.box(x, 0.18, z + 0.72, len, 0.1, 0.1, '#b8bcc6').surf(0);
  };
  PROPS.train = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    for (let i = -1; i <= 1; i++) {
      const cx = i * 8.1;
      b.box(cx, 1.95, 0, 7.8, 2.9, 2.9, '#ff4d6d'); b.box(cx, 1.6, 1.46, 7.8, 0.25, 0.02, '#ffffff'); b.box(cx, 1.6, -1.46, 7.8, 0.25, 0.02, '#ffffff');
      b.box(cx, 2.55, 0, 7.0, 0.8, 2.94, '#2b3f5a'); b.box(cx, 3.45, 0, 7.6, 0.12, 2.6, '#d8d2c4');
      for (const wx of [-2.8, 2.8]) for (const wz of [-1.0, 1.0]) b.cyl(cx + wx, 0.42, wz, 0.4, 0.25, 0.4, '#1d1f26', { rx: HALF_PI }, 10);
    }
    b.box(12.4, 1.95, 0, 1.2, 2.6, 2.7, '#ffb02e');
    b.at(null); c.g.at(x, 0, z, 0); c.g.box(13.02, 1.4, 0.8, 0.04, 0.25, 0.4, '#fff8d0'); c.g.box(13.02, 1.4, -0.8, 0.04, 0.25, 0.4, '#fff8d0'); c.g.at(null);
    solidRot(c, x, z, 0, 13, 1.5);
  };
  PROPS.clock = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.cyl(0, 1.5, 0, 0.07, 3, 0.09, '#3a3f4d', null, 6);
    b.cyl(0, 3.3, 0, 0.55, 0.16, 0.55, '#2b2f3a', { rx: HALF_PI }, 16); b.cyl(0, 3.3, 0, 0.5, 0.18, 0.5, '#ffffff', { rx: HALF_PI }, 16);
    for (const s of [1, -1]) { b.box(0, 3.42, s * 0.095, 0.05, 0.28, 0.01, '#1d1f26'); b.box(0.1, 3.3, s * 0.095, 0.22, 0.04, 0.01, '#1d1f26'); }
    b.at(null); solidCircle(c, x, z, 0.15);
  };
  PROPS.camper = (c, x, z, a) => {
    const ry = rotOf(a), b = c.b; b.at(x, 0, z, ry);
    b.box(0, 1.35, 0, 5, 2.1, 2.2, '#f2efe6'); b.box(0, 0.75, 0, 5.02, 0.3, 2.22, '#ffb02e'); b.box(2.2, 2.0, 0, 0.62, 0.7, 2.0, '#2b3f5a');
    b.box(-0.6, 1.75, 1.11, 1.6, 0.6, 0.02, '#2b3f5a'); b.box(-0.6, 1.75, -1.11, 1.6, 0.6, 0.02, '#2b3f5a'); b.box(0.5, 2.5, 0, 1.2, 0.2, 1.2, '#c0392b');
    for (const [wx, wz] of [[1.6, 1.05], [-1.6, 1.05], [1.6, -1.05], [-1.6, -1.05]]) b.cyl(wx, 0.4, wz, 0.4, 0.28, 0.4, '#1d1f26', { rx: HALF_PI }, 10);
    b.at(null); solidRot(c, x, z, ry, 2.5, 1.1);
  };
  PROPS.tent = (c, x, z, col) => {
    const b = c.b; b.at(x, 0, z, 0.3);
    b.cone(0, 0.95, 0, 1.75, 1.9, col || '#ffb02e', { ry: Math.PI / 4 }, 4);
    b.tri([-0.45, 0.02, 1.25], [0.45, 0.02, 1.25], [0, 1.05, 0.62], '#2b2f3a');
    b.at(null); solidRot(c, x, z, 0.3, 1.2, 1.2);
  };
  PROPS.campfire = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; b.sphere(Math.cos(a) * 0.7, 0.1, Math.sin(a) * 0.7, 0.17, '#8a8f99', null, 6); }
    b.cyl(0, 0.15, 0, 0.08, 1.1, 0.08, '#6b4f3a', { rz: HALF_PI, ry: 0.5 }, 6); b.cyl(0, 0.18, 0, 0.08, 1.1, 0.08, '#6b4f3a', { rz: HALF_PI, ry: -0.7 }, 6);
    b.at(null); c.g.at(x, 0, z, 0); c.g.cone(0, 0.55, 0, 0.38, 0.8, '#ff8a1e', null, 7); c.g.cone(0.05, 0.5, 0.05, 0.22, 0.6, '#ffd36b', null, 6); c.g.at(null);
    solidCircle(c, x, z, 0.8);
  };
  PROPS.track = (c, x, z, r) => {
    const b = c.b; b.at(null); r = (+r || 10) * 0.75;
    b.surf('sand').ring(x, 0.035, z, r - 1.6, r + 1.6, '#c9a26a', segQ(40)).surf(0);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rr = i % 2 ? r + 1.9 : r - 1.9; b.cone(x + Math.cos(a) * rr, 0.25, z + Math.sin(a) * rr, 0.18, 0.5, i % 4 < 2 ? '#ff8a1e' : '#ffffff', null, 8); }
  };
  PROPS.stage = (c, x, z) => {
    const b = c.b, col = c.color || '#ffd36b'; b.at(x, 0, z, 0);
    b.box(0, 0.6, 0, 20, 1.2, 9, '#2b2f3a'); b.box(0, 3.8, -4.4, 20, 7.6, 0.4, '#1d1f26');
    for (const px of [-10, 10]) for (const pz of [-4.4, 4.2]) b.box(px, 4.2, pz, 0.35, 8.4, 0.35, '#b8bcc6');
    b.box(0, 8.3, 4.2, 20.4, 0.4, 0.4, '#b8bcc6'); b.box(0, 8.3, -4.4, 20.4, 0.4, 0.4, '#b8bcc6');
    b.box(0, 8.6, 0, 21, 0.25, 9.6, col);
    for (const sx of [-1, 1]) { b.box(sx * 11.3, 1.5, 2, 1.6, 3, 1.4, '#1d1f26'); b.cyl(sx * 11.3, 2.2, 2.71, 0.45, 0.04, 0.45, '#555', { rx: HALF_PI }, 12); b.cyl(sx * 11.3, 0.9, 2.71, 0.35, 0.04, 0.35, '#555', { rx: HALF_PI }, 12); }
    b.at(null);
    c.g.at(x, 0, z, 0); c.g.box(0, 4.5, -4.15, 12, 5, 0.06, '#c58bff'); c.g.box(0, 1.22, 4.45, 20, 0.08, 0.1, '#ff7ad9');
    for (let i = -4; i <= 4; i += 2) c.g.cyl(i * 2, 7.9, 3.9, 0.25, 0.4, 0.15, i % 4 ? '#6ef0ff' : '#ffd36b', null, 8);
    c.g.at(null);
    signQuad(c, 'stage', { text: 'FESTIVAL DER ANMACHER', bg: '#1d1f26', fg: '#ffd36b', border: '#ff7ad9' }, x, 7.4, z + 4.4, 10, 1.4, 0, false);
    solidRot(c, x, z, 0, 12, 4.6);
  };
  PROPS.fence = (c, x, z, len) => {
    const b = c.b; b.at(null); len = +len || 10;
    const x0 = x - len / 2, x1 = x + len / 2, gaps = (c.gates || []).filter(g => Math.abs(g[1] - z) <= 2.5 && g[0] > x0 - 2 && g[0] < x1 + 2).map(g => [g[0] - 2.2, g[0] + 2.2]);
    const inGap = t => gaps.some(g => t > g[0] && t < g[1]);
    for (let t = x0; t <= x1 + 1e-6; t += 2) if (!inGap(t)) b.box(t, 0.6, z, 0.14, 1.2, 0.14, '#f2efe6');
    let s = x0;
    const seg = (a, e) => { if (e - a < 0.2) return; b.box((a + e) / 2, 0.85, z, e - a, 0.1, 0.06, '#ffffff'); b.box((a + e) / 2, 0.45, z, e - a, 0.1, 0.06, '#ffffff'); c.out.fences.push([a, e, z]); };
    gaps.sort((a, e) => a[0] - e[0]).forEach(g => { seg(s, Math.max(s, g[0])); s = Math.max(s, g[1]); });
    seg(s, x1);
  };
  PROPS.gate = (c, x, z) => {
    const b = c.b, col = c.color || '#ff8a1e'; b.at(x, 0, z, 0);
    b.box(-2.5, 2.1, 0, 0.6, 4.2, 0.6, '#f2efe6'); b.box(2.5, 2.1, 0, 0.6, 4.2, 0.6, '#f2efe6'); b.box(0, 4.2, 0, 5.8, 1.0, 0.35, col);
    b.at(null);
    const name = c.distName || 'WILLKOMMEN';
    signQuad(c, 'gate:' + name, { text: name, bg: col, fg: '#1d1f26', border: '#ffffff' }, x, 4.2, z, 5.4, 0.9, 0, true, { off: 0.19 });
    solidCircle(c, x - 2.5, z, 0.35); solidCircle(c, x + 2.5, z, 0.35);
  };
  PROPS.foodtruck = (c, x, z, r) => {
    const ry = rotOf(r), b = c.b, col = ['#4be08a', '#ff7ad9', '#ffd36b'][Math.floor(hashf(x, z, 5) * 3)];
    b.at(x, 0, z, ry);
    b.box(0, 1.5, 0, 5, 2.4, 2.4, col); b.box(1.9, 1.2, 0, 1.2, 1.8, 2.3, '#f2efe6'); b.box(-0.4, 1.7, 1.21, 2.8, 1.0, 0.02, '#2b2f3a');
    b.box(-0.4, 2.35, 1.6, 3.0, 0.08, 0.9, '#ff4d6d', { rx: 0.3 }); b.box(-0.4, 1.15, 1.35, 2.8, 0.08, 0.3, '#f2efe6');
    for (const [wx, wz] of [[1.6, 1.1], [-1.6, 1.1], [1.6, -1.1], [-1.6, -1.1]]) b.cyl(wx, 0.38, wz, 0.38, 0.26, 0.38, '#1d1f26', { rx: HALF_PI }, 10);
    b.at(null); c.g.at(x, 0, z, ry); c.g.box(-0.4, 2.95, 0, 2.2, 0.5, 0.15, '#fff2b0'); c.g.at(null);
    solidRot(c, x, z, ry, 2.5, 1.2);
  };
  PROPS.flag = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.cyl(0, 3, 0, 0.06, 6, 0.08, '#d8d2c4', null, 6); b.box(0.85, 5.4, 0, 1.6, 1.0, 0.04, c.color || '#ff8a1e', { ry: 0.15 }); b.sphere(0, 6.05, 0, 0.1, '#ffd36b');
    b.at(null); solidCircle(c, x, z, 0.15);
  };
  PROPS.speaker = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.box(0, 1.2, 0, 1.3, 2.4, 1.0, '#1d1f26');
    b.cyl(0, 1.7, 0.51, 0.42, 0.04, 0.42, '#4a4f5d', { rx: HALF_PI }, 12); b.cyl(0, 0.65, 0.51, 0.32, 0.04, 0.32, '#4a4f5d', { rx: HALF_PI }, 12);
    b.at(null); solidRot(c, x, z, 0, 0.65, 0.5);
  };
  PROPS.container = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.surf('metal').box(0, 1.3, 0, 6, 2.6, 2.4, '#c0392b');
    for (let t = -2.7; t <= 2.71; t += 0.6) { b.box(t, 1.3, 1.21, 0.12, 2.4, 0.04, '#a03028'); b.box(t, 1.3, -1.21, 0.12, 2.4, 0.04, '#a03028'); }
    b.surf(0); b.at(null); solidRot(c, x, z, 0, 3, 1.2);
  };
  PROPS.fountain = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.surf('concrete').cyl(0, 0.35, 0, 4.2, 0.7, 4.3, '#d8d2c4', null, segQ(28)); b.surf('glossy').cyl(0, 0.62, 0, 3.8, 0.1, 3.8, '#5bc0f0', null, segQ(28));
    b.surf('concrete').cyl(0, 1.3, 0, 0.45, 2.2, 0.6, '#f2efe6', null, segQ(12)); b.cyl(0, 2.45, 0, 1.5, 0.3, 1.1, '#d8d2c4', null, segQ(16));
    b.surf('glossy').cyl(0, 2.62, 0, 1.35, 0.06, 1.35, '#5bc0f0', null, segQ(16)).surf(0);
    b.at(null); c.g.at(x, 0, z, 0); c.g.sphere(0, 3.05, 0, 0.3, '#bff0ff', null, 8); c.g.cyl(0, 2.85, 0, 0.12, 0.6, 0.18, '#9fe8ff', null, 8); c.g.at(null);
    solidCircle(c, x, z, 4.2);
  };
  PROPS.radiotower = (c, x, z) => {
    const b = c.b; b.at(x, 0, z, 0);
    b.box(0, 0.4, 0, 4, 0.8, 4, '#8a8f99');
    for (let i = 0; i < 7; i++) { const y0 = 0.8 + i * 3.6, r0 = 1.5 - i * 0.18, r1 = 1.5 - (i + 1) * 0.18; b.cyl(0, y0 + 1.8, 0, r1, 3.6, r0, i % 2 ? '#ffffff' : '#ff4d6d', { ry: Math.PI / 4 }, 4); }
    b.cyl(0, 28.5, 0, 0.06, 3, 0.1, '#d8d2c4', null, 6);
    b.cyl(0.9, 18, 0, 0.7, 0.18, 0.7, '#f2efe6', { rz: HALF_PI }, 14); b.cyl(-0.9, 12, 0.2, 0.6, 0.18, 0.6, '#f2efe6', { rz: -HALF_PI }, 14);
    b.at(null); c.g.at(x, 0, z, 0); c.g.sphere(0, 30.1, 0, 0.35, '#ff2a2a', null, 8); c.g.sphere(0, 22, 0, 0.22, '#ff2a2a', null, 6); c.g.at(null);
    signQuad(c, 'tower', { text: 'FUNKTURM', sub: 'Radio AnMaCha', bg: '#ff4d6d', fg: '#ffffff', border: '#ffffff' }, x, 0.4, z + 2.02, 3.6, 0.7, 0, false);
    solidRot(c, x, z, 0, 2, 2);
  };
  // ── zusätzliche Requisiten der Welt ──
  PROPS.busstop = (c, x, z, ry) => {
    const b = c.b, col = c.color || '#4bb8ff'; ry = ry || 0; b.at(x, 0, z, ry);
    b.box(-1.5, 1.2, -0.6, 0.1, 2.4, 0.1, '#3a3f4d'); b.box(1.5, 1.2, -0.6, 0.1, 2.4, 0.1, '#3a3f4d'); b.box(-1.5, 1.2, 0.5, 0.1, 2.4, 0.1, '#3a3f4d'); b.box(1.5, 1.2, 0.5, 0.1, 2.4, 0.1, '#3a3f4d');
    b.box(0, 2.45, 0, 3.4, 0.14, 1.6, col); b.box(0, 1.3, -0.62, 3.0, 1.9, 0.05, '#bfe6ff');
    b.box(0, 0.45, -0.35, 2.4, 0.08, 0.45, '#d9893a'); b.box(-1.0, 0.22, -0.35, 0.08, 0.45, 0.4, '#3a3f4d'); b.box(1.0, 0.22, -0.35, 0.08, 0.45, 0.4, '#3a3f4d');
    b.box(2.2, 1.4, 0, 0.1, 2.8, 0.1, '#3a3f4d'); b.cyl(2.2, 2.95, 0, 0.42, 0.08, 0.42, '#ffd36b', { rx: HALF_PI }, 16);
    b.at(null);
    const sp = wpt(x, z, ry, 2.2, 0);
    signQuad(c, 'bus', { text: 'H', round: true, bg: '#ffd36b', fg: '#2a7a3a', border: '#2a7a3a' }, sp[0], 2.95, sp[1], 0.7, 0.7, ry, true);
    const tp = wpt(x, z, ry, 0, -0.58);
    signQuad(c, 'busplan', { text: 'SCHNELLREISE', sub: 'Bus in alle Bezirke', bg: '#2a7a3a', fg: '#ffffff', border: '#ffd36b' }, tp[0], 1.7, tp[1], 1.8, 0.45, ry, false);
    solidCircle(c, sp[0], sp[1], 0.1);
  };
  PROPS.jobboard = (c, x, z, ry) => {
    const b = c.b; ry = ry || 0; b.at(x, 0, z, ry);
    b.box(0, 0.55, 0, 0.12, 1.1, 0.12, '#3a3f4d'); b.box(0, 1.25, 0, 1.1, 0.7, 0.08, '#ff8a1e', { rx: -0.35 }); b.box(0, 0.04, 0, 0.6, 0.08, 0.6, '#3a3f4d');
    b.at(null);
    signQuad(c, 'job', { text: 'NEBENJOB', sub: 'Hier Geld verdienen', bg: '#ff8a1e', fg: '#ffffff', border: '#ffffff' }, x, 1.25, z, 1.0, 0.25, ry, true, { tilt: -0.35, off: 0.05 });
    solidCircle(c, x, z, 0.2);
  };
  PROPS.terminal = (c, x, z, ry) => {
    const b = c.b; ry = ry || 0; b.at(x, 0, z, ry);
    b.box(0, 0.7, 0, 0.7, 1.4, 0.5, '#2b2f3a'); b.box(0, 1.5, 0.05, 0.8, 0.5, 0.12, '#3a3f4d', { rx: -0.4 }); b.box(0, 0.05, 0, 0.9, 0.1, 0.7, '#ff8a1e');
    b.at(null); c.g.at(x, 0, z, ry); c.g.box(0, 1.52, 0.115, 0.66, 0.36, 0.02, '#4be08a', { rx: -0.4 }); c.g.at(null);
    const p = wpt(x, z, ry, 0, 0);
    signQuad(c, 'terminal', { text: 'BAUEN', sub: 'Bau-Terminal', bg: '#4be08a', fg: '#1d1f26', border: '#ffffff' }, p[0], 2.15, p[1], 1.2, 0.3, ry, true, { off: 0 });
    solidCircle(c, x, z, 0.3);
  };
  PROPS.leasesign = (c, x, z, ry) => {
    const b = c.b; ry = ry || 0; b.at(x, 0, z, ry);
    b.box(-1.1, 1.0, 0, 0.12, 2.0, 0.12, '#6b4f3a'); b.box(1.1, 1.0, 0, 0.12, 2.0, 0.12, '#6b4f3a'); b.box(0, 1.75, 0, 2.6, 1.0, 0.1, '#ffd36b');
    b.at(null);
    signQuad(c, 'lease', { text: 'ZU VERPACHTEN', sub: 'Grundstück frei – Bau-Terminal folgt', bg: '#ffd36b', fg: '#1d1f26', border: '#c0392b' }, x, 1.75, z, 2.5, 0.9, ry, true);
    const a = wpt(x, z, ry, -1.1, 0), e = wpt(x, z, ry, 1.1, 0); solidCircle(c, a[0], a[1], 0.1); solidCircle(c, e[0], e[1], 0.1);
  };
  PROPS.logosign = (c, x, z, ry) => {
    const b = c.b; ry = ry || 0; b.at(x, 0, z, ry);
    b.box(-1.5, 1.4, 0, 0.18, 2.8, 0.18, '#1d1f26'); b.box(1.5, 1.4, 0, 0.18, 2.8, 0.18, '#1d1f26'); b.box(0, 2.6, 0, 3.4, 1.0, 0.16, '#16171c');
    b.at(null);
    signQuad(c, 'logo', { logo: true, text: 'AnMaCha', bg: '#16171c', fg: '#ffffff' }, x, 2.6, z, 3.3, 0.88, ry, true, { off: 0.09 });
    const a = wpt(x, z, ry, -1.5, 0), e = wpt(x, z, ry, 1.5, 0); solidCircle(c, a[0], a[1], 0.1); solidCircle(c, e[0], e[1], 0.1);
  };
  /** Absorber-Barriere (rot-weiß) entlang einer Linie von (x0,z0) nach (x1,z1). */
  PROPS.barrier = (c, x0, z0, x1, z1) => {
    const b = c.b; b.at(null);
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.5)), ry = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      b.box(x, 0.85, z, L / n, 0.28, 0.08, i % 2 ? '#ffffff' : '#ff4d6d', { ry });
      if (i % 2 === 0) b.box(x, 0.5, z, 0.1, 1.0, 0.1, '#3a3f4d', { ry });
    }
  };
  PROPS.house = (c, x, z, w, d, h, col, roof, ry) => {
    const b = c.b; b.at(x, 0, z, ry || 0); c.glass.at(x, 0, z, ry || 0);
    const fs = hashf(x, z, 9) < 0.45 ? 'brick' : 'plaster';
    b.surf(fs).box(0, h / 2, 0, w, h, d, col); b.surf('concrete').box(0, h + 0.15, 0, w + 0.4, 0.3, d + 0.4, roof);
    b.box(0, 0.3, d / 2 + 0.03, w + 0.06, 0.6, 0.06, M.shade(T0(c), col, 0.7));
    for (let y = 1.6; y < h - 0.6; y += 2.6) for (let t = -w / 2 + 1.2; t < w / 2 - 0.6; t += 2.2) {
      c.glass.box(t, y, d / 2 + 0.02, 1.0, 1.1, 0.04, '#ffffff');
      if (DETAIL) b.box(t, y - 0.6, d / 2 + 0.06, 1.2, 0.08, 0.14, '#f2efe6');
    }
    b.surf(0); b.at(null); c.glass.at(null);
  };
  function T0(c) { return c.T; }
  M.PROPS = PROPS;
  /** Requisit bauen. Unbekannte Typen werden als kleine Kiste dargestellt (kein Absturz). */
  M.prop = function (ctx, type, x, z, a, b2, c2) {
    const f = PROPS[type];
    try {
      if (f) f(ctx, +x || 0, +z || 0, a, b2, c2);
      else { ctx.b.at(null); ctx.b.box(+x || 0, 0.4, +z || 0, 0.8, 0.8, 0.8, '#b0b0b0'); solidCircle(ctx, +x || 0, +z || 0, 0.4); }
    } catch (e) { if (root.console) console.warn('[PT.Models] Requisit', type, e); }
    ctx.b.at(null); ctx.g.at(null); if (ctx.glass) ctx.glass.at(null);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
