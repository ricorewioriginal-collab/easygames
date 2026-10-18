/* AnMaCha UNDERCOVER 3D – Baukasten für die Welt-Darstellung (gemeinsam für Karten- und Lounge-Szene).
   AMU.WorldKit: Qualitätsstufen, Vorlagen-Geometrien, Zusammenfüger (viele Grundkörper → EINE Geometrie mit Vertexfarben),
   gemeinsame Materialien, kleine Canvas-Texturen (Fliesen, Verlauf, Namensschilder, Raumnamen), Sicht-Abdunkelung.
   Vorlagen und Materialien sind modulweit gecacht und werden nie pro Karte freigegeben. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const T = root.THREE;
  const PI = Math.PI;

  // ---------- Qualität ----------
  const QUAL = {
    low: { seg: 7, pr: 1, shadows: false, aa: false },
    mid: { seg: 10, pr: 1.5, shadows: false, aa: true },
    high: { seg: 14, pr: 2, shadows: true, aa: true }
  };
  const qOf = q => (QUAL[q] ? q : 'mid');

  // ---------- Vorlagen (nur CPU) ----------
  const protoCache = {};
  function protos(q) {
    q = qOf(q);
    if (protoCache[q]) return protoCache[q];
    const s = QUAL[q].seg;
    return (protoCache[q] = {
      box: new T.BoxGeometry(1, 1, 1),
      cyl: new T.CylinderGeometry(0.5, 0.5, 1, s),
      cyl6: new T.CylinderGeometry(0.5, 0.5, 1, 6),
      cone: new T.ConeGeometry(0.5, 1, s),
      cone4: new T.ConeGeometry(0.5, 1, 4),
      sph: new T.SphereGeometry(0.5, s, Math.max(4, s - 3)),
      hemi: new T.SphereGeometry(0.5, s, Math.max(3, (s >> 1)), 0, PI * 2, 0, PI / 2),
      ico: new T.IcosahedronGeometry(0.5, 0),
      ring: new T.TorusGeometry(0.5, 0.04, 4, s * 2),
      disc: new T.CylinderGeometry(0.5, 0.5, 0.02, s * 2)
    });
  }

  // ---------- Zusammenfüger ----------
  const _m = new T.Matrix4(), _n = new T.Matrix3(), _p = new T.Vector3(), _s = new T.Vector3(), _v = new T.Vector3();
  const _q = new T.Quaternion(), _e = new T.Euler(0, 0, 0, 'YXZ'), _c = new T.Color();

  /** Sammelt Teile; at(x, z, ry) setzt den Bezugsrahmen (Drehung um Y), add(...) arbeitet in lokalen Koordinaten.
      grad: Abdunklung nach unten (0..1) – billige Umgebungsverdeckung. tag: Vertexbereich merken (für spätere Umfärbung). */
  function builder(q) {
    const P = protos(q), parts = [];
    let ox = 0, oz = 0, ory = 0, cs = 1, sn = 0;
    const b = {
      parts,
      at(x, z, ry) { ox = x; oz = z; ory = ry || 0; cs = Math.cos(ory); sn = Math.sin(ory); return b; },
      add(g, col, x, y, z, sx, sy, sz, rx, ry, rz, grad, tag) {
        _c.set(col);
        parts.push({
          g: typeof g === 'string' ? P[g] : g, r: _c.r, g2: _c.g, b: _c.b,
          x: ox + x * cs + z * sn, y, z: oz - x * sn + z * cs,
          sx, sy: sy == null ? sx : sy, sz: sz == null ? sx : sz, rx: rx || 0, ry: (ry || 0) + ory, rz: rz || 0, grad: grad || 0, tag
        });
        return b;
      },
      get count() { return parts.length; },
      build() { return merge(parts); }
    };
    return b;
  }
  function merge(parts) {
    if (!parts.length) return null;
    let nv = 0, ni = 0;
    for (const p of parts) { const c = p.g.attributes.position.count; nv += c; ni += p.g.index ? p.g.index.count : c; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    const tags = {};
    let vo = 0, io = 0;
    for (const p of parts) {
      _m.compose(_p.set(p.x, p.y, p.z), _q.setFromEuler(_e.set(p.rx, p.ry, p.rz, 'YXZ')), _s.set(p.sx, p.sy, p.sz));
      _n.getNormalMatrix(_m);
      const Pa = p.g.attributes.position, Na = p.g.attributes.normal, n = Pa.count, I = p.g.index ? p.g.index.array : null;
      if (!p.g.boundingBox) p.g.computeBoundingBox();
      const y0 = p.g.boundingBox.min.y, yh = (p.g.boundingBox.max.y - y0) || 1;
      for (let i = 0; i < n; i++) {
        const o = (vo + i) * 3;
        _v.fromBufferAttribute(Pa, i);
        const f = p.grad ? 1 - p.grad * (1 - (_v.y - y0) / yh) : 1;
        _v.applyMatrix4(_m); pos[o] = _v.x; pos[o + 1] = _v.y; pos[o + 2] = _v.z;
        _v.fromBufferAttribute(Na, i).applyMatrix3(_n).normalize(); nor[o] = _v.x; nor[o + 1] = _v.y; nor[o + 2] = _v.z;
        col[o] = p.r * f; col[o + 1] = p.g2 * f; col[o + 2] = p.b * f;
      }
      if (p.tag != null) { const t = tags[p.tag] || (tags[p.tag] = []); t.push(vo, n); }
      if (I) for (let k = 0; k < I.length; k++) idx[io++] = I[k] + vo;
      else for (let k = 0; k < n; k++) idx[io++] = k + vo;
      vo += n;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.BufferAttribute(nor, 3));
    g.setAttribute('color', new T.BufferAttribute(col, 3));
    g.setIndex(new T.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    g.userData.tags = tags;
    return g;
  }
  /** Färbt alle Vertices eines Tags (aus builder.add) neu. */
  function recolor(geo, tag, hex) {
    const t = geo && geo.userData.tags[tag]; if (!t) return;
    _c.set(hex);
    const a = geo.attributes.color.array;
    for (let i = 0; i < t.length; i += 2) for (let v = t[i], e = t[i] + t[i + 1]; v < e; v++) { a[v * 3] = _c.r; a[v * 3 + 1] = _c.g; a[v * 3 + 2] = _c.b; }
    geo.attributes.color.needsUpdate = true;
  }

  // ---------- Farben ----------
  function shade(hex, f) { _c.set(hex); return '#' + _c.setRGB(Math.min(1, _c.r * f), Math.min(1, _c.g * f), Math.min(1, _c.b * f)).getHexString(); }
  function mix(a, b, t) { _c.set(a); const c2 = new T.Color(b); return '#' + _c.lerp(c2, t).getHexString(); }

  // ---------- Materialien (gemeinsam) ----------
  const M = {};
  function mats() {
    if (M.solid) return M;
    M.solid = new T.MeshLambertMaterial({ vertexColors: true });
    M.glow = new T.MeshBasicMaterial({ vertexColors: true });
    M.floor = new T.MeshLambertMaterial({ vertexColors: true, map: tileTex() });
    M.ground = new T.MeshLambertMaterial({ color: 0xffffff });
    M.door = new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x111111 });
    M.label = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.55 });
    M.ring = new T.MeshBasicMaterial({ transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
    M.icon = new T.MeshBasicMaterial({ transparent: true, opacity: 0.95, depthTest: false, depthWrite: false });
    M.blob = new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false, map: radialTex() });
    M.pool = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, map: radialTex(), color: 0xffffff });
    M.field = new T.MeshBasicMaterial({ transparent: true, opacity: 0.45, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending });
    M.water = new T.MeshLambertMaterial({ color: 0x2a8fc0, transparent: true, opacity: 0.8, emissive: 0x0a3050 });
    return M;
  }

  // ---------- Texturen ----------
  const TX = {};
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tileTex() {
    if (TX.tile) return TX.tile;
    const c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#d9dde6'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64);
    g.fillStyle = '#f2f4f8'; g.fillRect(2, 62, 62, 2); g.fillRect(62, 2, 2, 60);
    const t = TX.tile = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
    return t;
  }
  function radialTex() {
    if (TX.radial) return TX.radial;
    const c = canvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (TX.radial = new T.CanvasTexture(c));
  }
  const FONT = '"Fredoka", "Trebuchet MS", system-ui, sans-serif';
  /** Namensschild (Canvas → Sprite). Liefert { sprite, tex, mat }. */
  function nameTag(text, colorHex, sym) {
    const s = (sym ? sym + ' ' : '') + String(text || '?').slice(0, 18);
    const c = canvas(256, 64), g = c.getContext('2d');
    g.font = '600 30px ' + FONT;
    const w = Math.min(248, Math.ceil(g.measureText(s).width) + 28);
    const x0 = (256 - w) / 2;
    g.fillStyle = 'rgba(10,14,32,0.78)'; roundRect(g, x0, 10, w, 44, 20); g.fill();
    g.lineWidth = 4; g.strokeStyle = colorHex || '#ffffff'; roundRect(g, x0 + 2, 12, w - 4, 40, 18); g.stroke();
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 128, 33, 236);
    const tex = new T.CanvasTexture(c); tex.minFilter = T.LinearFilter; tex.generateMipmaps = false;
    const mat = new T.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true });
    const sp = new T.Sprite(mat); sp.scale.set(1.6, 0.4, 1); sp.renderOrder = 20;
    return { sprite: sp, tex, mat };
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  /** Atlas mit Texten (z. B. Raumnamen) – eine Textur, ein Draw-Call. Liefert { tex, uv: [[u0,v0,u1,v1,aspect]] }. */
  function textAtlas(lines, color) {
    const rows = Math.max(1, lines.length), rh = 64, c = canvas(1024, Math.min(2048, T.MathUtils.ceilPowerOfTwo(rows * rh))), g = c.getContext('2d');
    g.font = '700 44px ' + FONT; g.textBaseline = 'middle'; g.fillStyle = color || '#ffffff';
    const uv = [];
    lines.forEach((s, i) => {
      const w = Math.min(1016, Math.ceil(g.measureText(s).width) + 8);
      g.fillText(s, 4, i * rh + rh / 2, 1012);
      uv.push([0, 1 - (i + 1) * rh / c.height, w / c.width, 1 - i * rh / c.height, w / rh]);
    });
    const tex = new T.CanvasTexture(c); tex.anisotropy = 4;
    return { tex, uv };
  }
  /** Rückseite einer Rollenkarte (Lounge). */
  function cardTex(accent) {
    const c = canvas(64, 96), g = c.getContext('2d');
    g.fillStyle = '#141a33'; g.fillRect(0, 0, 64, 96);
    g.strokeStyle = accent || '#ff9a2e'; g.lineWidth = 4; g.strokeRect(5, 5, 54, 86);
    g.fillStyle = accent || '#ff9a2e'; g.font = '700 34px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 32, 50);
    return new T.CanvasTexture(c);
  }
  /** Schild mit Leuchtschrift (z. B. ON AIR). */
  function signTex(text, fg, bg) {
    const c = canvas(256, 64), g = c.getContext('2d');
    g.fillStyle = bg || '#2a0a10'; g.fillRect(0, 0, 256, 64);
    g.font = '700 40px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = fg; g.shadowBlur = 12; g.fillStyle = fg || '#ff4050'; g.fillText(text, 128, 34);
    return new T.CanvasTexture(c);
  }

  // ---------- Sichtkreis: abgedunkelt außerhalb des Radius (auf den Boden projiziert, ohne Nachbearbeitung) ----------
  function visionMesh() {
    const mat = new T.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false,
      uniforms: { uC: { value: new T.Vector2() }, uR: { value: 6 }, uA: { value: 0.86 }, uCol: { value: new T.Color(0x02040c) } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform vec2 uC; uniform float uR; uniform float uA; uniform vec3 uCol; varying vec3 vW;' +
        'void main(){ vec3 d = vW - cameraPosition; float t = cameraPosition.y / max(0.001, cameraPosition.y - vW.y);' +
        ' vec2 g = cameraPosition.xz + d.xz * t; float r = length(g - uC);' +
        ' float a = smoothstep(uR * 0.78, uR * 1.06, r) * uA; gl_FragColor = vec4(uCol, a); }'
    });
    const geo = new T.PlaneGeometry(1, 1); geo.rotateX(-PI / 2);
    const m = new T.Mesh(geo, mat); m.renderOrder = 8; m.frustumCulled = false; m.scale.set(400, 1, 400);
    return m;
  }

  /** Kleiner deterministischer Zufall (für Deko-Platzierung). */
  function rand(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }

  AMU.WorldKit = { QUAL, qOf, protos, builder, merge, recolor, shade, mix, mats, tileTex, radialTex, nameTag, textAtlas, cardTex, signTex, visionMesh, rand, hash, FONT };
})(typeof window !== 'undefined' ? window : globalThis);
