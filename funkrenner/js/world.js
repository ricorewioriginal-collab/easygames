/* Funkrenner – Welt: Modelle laden, Himmel/Licht, endlose Streckenstücke, Hindernis- und Münzmodelle.
   Die Welten selbst (Dschungel, Radiostudio, Fantasy) stehen in themes.js. */
(function (root) {
  'use strict';
  const SEG = 36, NSEG = 6, ROAD = 8.4;
  const rngf = s => { s = s >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  function create(THREE, scene, opt) {
    opt = opt || {};
    const base = opt.base || '', low = !!opt.low;
    const W = { THREE, scene, low, SEG, NSEG, ROAD, theme: null, variant: 0, segs: [], tpl: {}, mats: {}, geos: {}, anim: [], t: 0, beatPulse: 0, rngf };
    const root3 = new THREE.Group(); scene.add(root3); W.root = root3;
    const trackG = new THREE.Group(); root3.add(trackG); W.trackG = trackG;

    /* ---------- Hilfen: Materialien, Primitive ---------- */
    W.mat = (col, o) => {
      o = o || {}; const k = col + '|' + (o.e || 0) + '|' + (o.r == null ? .7 : o.r) + '|' + (o.m || 0) + '|' + (o.t ? 1 : 0) + '|' + (o.flat ? 1 : 0) + '|' + (o.map ? o.map.uuid : '');
      return W.mats[k] || (W.mats[k] = new THREE.MeshStandardMaterial({ color: col, roughness: o.r == null ? .7 : o.r, metalness: o.m || 0, emissive: o.e ? col : 0x000000, emissiveIntensity: o.e || 0, transparent: !!o.t, opacity: o.t || 1, flatShading: !!o.flat, map: o.map || null }));
    };
    W.basic = (col, o) => { o = o || {}; const k = 'b' + col + (o.t || 1) + (o.add ? 'a' : '') + (o.map ? o.map.uuid : '') + (o.side ? 's' : ''); return W.mats[k] || (W.mats[k] = new THREE.MeshBasicMaterial({ color: col, transparent: !!o.t || !!o.add, opacity: o.t || 1, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !o.add, map: o.map || null, side: o.side ? THREE.DoubleSide : THREE.FrontSide, fog: o.fog !== false })); };
    const gcache = (k, f) => W.geos[k] || (W.geos[k] = f());
    W.bx = (w, h, d, col, o, x, y, z, par) => { const m = new THREE.Mesh(gcache('b' + w + ',' + h + ',' + d, () => new THREE.BoxGeometry(w, h, d)), o && o.mat ? o.mat : W.mat(col, o)); m.position.set(x || 0, (y || 0) + h / 2, z || 0); if (par) par.add(m); return m; };
    W.cy = (rt, rb, h, col, o, x, y, z, par, seg) => { const m = new THREE.Mesh(gcache('c' + rt + ',' + rb + ',' + h + ',' + (seg || 12), () => new THREE.CylinderGeometry(rt, rb, h, seg || 12)), W.mat(col, o)); m.position.set(x || 0, (y || 0) + h / 2, z || 0); if (par) par.add(m); return m; };
    W.sp = (r, col, o, x, y, z, par, det) => { const m = new THREE.Mesh(gcache('s' + r + ',' + (det || 0), () => det != null ? new THREE.IcosahedronGeometry(r, det) : new THREE.SphereGeometry(r, 14, 10)), W.mat(col, o)); m.position.set(x || 0, y || 0, z || 0); if (par) par.add(m); return m; };
    /* Zeichenfläche: w×h in Zeichen-Einheiten, k = Auflösungsfaktor (scharfe Texturen, gleiche Zeichenbefehle) */
    W.canvas = (w, h, k) => { k = k || 1; const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const g = c.getContext('2d'); if (k !== 1) g.scale(k, k); return [c, g]; };
    W.hi = low ? 1 : 2; W.aniso = opt.aniso || 4;
    W.tex = (c, rep, ry) => { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep, ry == null ? rep : ry); t.anisotropy = W.aniso; return t; };
    W.halo = (() => { const [c, g] = W.canvas(64, 64, 2), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    W.glow = (col, s, x, y, z, par, a) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: W.halo, color: col, transparent: true, opacity: a == null ? .8 : a, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(s, s, 1); sp.position.set(x || 0, y || 0, z || 0); if (par) par.add(sp); return sp; };

    /* ---------- Modelle laden (KayKit, .glb) ---------- */
    W.load = (names, onp) => {
      const todo = names.filter(n => !(n in W.tpl)); let done = 0;
      if (!todo.length) { onp && onp(1); return Promise.resolve(); }
      return Promise.all(todo.map(n => new Promise(ok => {
        new THREE.GLTFLoader().load(base + 'models/env/' + n + '.glb', g => {
          const o = g.scene; o.traverse(m => { if (m.isMesh) { m.frustumCulled = true; if (m.material) m.material.roughness = Math.max(.6, m.material.roughness || 1); } });
          const b = new THREE.Box3().setFromObject(o), s = new THREE.Vector3(); b.getSize(s); const c = new THREE.Vector3(); b.getCenter(c);
          W.tpl[n] = { o, size: s, min: b.min, cx: c.x, cz: c.z };
          onp && onp(++done / todo.length); ok();
        }, undefined, () => { W.tpl[n] = null; onp && onp(++done / todo.length); ok(); });
      })));
    };
    /* Modell setzen: s = Skalierung, sonst passt es in die Box aus h (Höhe), w (Breite) und d (Tiefe) – die engste Vorgabe gewinnt.
       Boden bei y, Mitte bei x/z. g.userData.dim = tatsächliche Größe (vor Drehung). */
    W.put = (name, par, o) => {
      const t = W.tpl[name]; let g;
      if (!t) { g = new THREE.Group(); const h = o.h || 1; W.bx(.8 * (o.w || h * .6), h, .8 * (o.w || h * .6), 0x777777, null, 0, 0, 0, g); g.position.set(o.x || 0, o.y || 0, o.z || 0); par.add(g); return g; }
      const fit = [o.h && o.h / t.size.y, o.w && o.w / t.size.x, o.d && o.d / t.size.z].filter(v => v > 0 && isFinite(v));
      const s = o.s || (fit.length ? Math.min.apply(null, fit) : 1), inner = t.o.clone(true);
      inner.position.set(-t.cx * s, -t.min.y * s, -t.cz * s); inner.scale.setScalar(s);
      g = new THREE.Group(); g.add(inner); g.position.set(o.x || 0, o.y || 0, o.z || 0); g.rotation.y = o.ry || 0; if (o.sx) g.scale.x = o.sx; if (o.sz) g.scale.z = o.sz;
      g.userData.dim = { x: t.size.x * s, y: t.size.y * s, z: t.size.z * s };
      par.add(g); return g;
    };
    /* Modell bündig an eine Seitenwand stellen (Rückseite zur Wand bei |x| = wx, Front zur Strecke) */
    W.wallPut = (name, par, side, wx, o) => {
      const g = W.put(name, par, Object.assign({}, o, { x: 0, ry: side * Math.PI / 2 + Math.PI })), d = g.userData.dim;
      g.position.x = side * (wx - (d ? d.z / 2 : .5)); return g;
    };
    /* Umriss nur aus Flächen (ohne Leuchtsprites/Partikel) */
    const meshBox = (g, out) => {
      out.makeEmpty(); g.updateMatrixWorld(true); const b = new THREE.Box3();
      g.traverse(m => { if (m.isMesh && m.geometry) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); b.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); out.union(b); } });
      return out;
    };
    W.meshBox = meshBox;
    W.size = n => W.tpl[n] ? W.tpl[n].size : null;

    /* ---------- Himmel, Licht, Nebel ---------- */
    const sky = new THREE.Mesh(new THREE.SphereGeometry(420, 24, 16), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    { const n = sky.geometry.attributes.position.count; sky.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); }
    scene.add(sky); W.sky = sky;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x445544, 1), sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(-30, 50, 20); scene.add(hemi, sun); W.hemi = hemi; W.sun = sun;
    const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: W.halo, color: 0xffffff, transparent: true, depthWrite: false, fog: false })); disc.scale.set(120, 120, 1); disc.position.set(-90, 90, -260); scene.add(disc); W.disc = disc;
    const stars = (() => { const n = 500, p = new Float32Array(n * 3); const r = rngf(7); for (let i = 0; i < n; i++) { const a = r() * 6.283, e = Math.acos(r() * .9 + .08), d = 380; p[i * 3] = Math.sin(e) * Math.cos(a) * d; p[i * 3 + 1] = Math.cos(e) * d; p[i * 3 + 2] = Math.sin(e) * Math.sin(a) * d; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pt = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: .9 })); pt.visible = false; scene.add(pt); return pt; })();
    W.stars = stars;
    W.setSky = (top, mid, bot) => {
      const pos = sky.geometry.attributes.position, col = sky.geometry.attributes.color, a = new THREE.Color(top), b = new THREE.Color(mid), c = new THREE.Color(bot), t = new THREE.Color();
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 420; if (y > .12) t.copy(b).lerp(a, Math.min(1, (y - .12) / .6)); else t.copy(c).lerp(b, Math.max(0, (y + .15) / .27)); col.setXYZ(i, t.r, t.g, t.b); }
      col.needsUpdate = true;
    };

    /* ---------- Streckenstücke ---------- */
    W.segs = [];
    function buildSeg(seg, idx) {
      while (seg.g.children.length) seg.g.remove(seg.g.children[0]);
      seg.anim = []; seg.n = (seg.n || 0) + 1;
      const r = rngf((W.theme.seed || 1) * 977 + idx * 131 + (seg.n % 7)); seg.r = r;
      W.theme.segment(W, seg.g, r, idx, seg);
    }
    W.setTheme = (th, variant) => {
      W.theme = th; W.variant = variant || 0;
      W.anim.length = 0; W.mats_tex = null;
      while (trackG.children.length) trackG.remove(trackG.children[0]);
      W.segs = [];
      th.setup && th.setup(W, variant || 0);
      for (let i = 0; i < NSEG; i++) { const g = new THREE.Group(); g.position.z = -i * SEG + SEG; trackG.add(g); const seg = { g, idx: i - 1 }; W.segs.push(seg); buildSeg(seg, seg.idx); }
      W.nextIdx = NSEG - 1;
    };
    W.scroll = dz => {
      for (const s of W.segs) s.g.position.z += dz;
      for (const s of W.segs) if (s.g.position.z > SEG + 8) {
        const minz = Math.min.apply(null, W.segs.map(q => q.g.position.z));
        s.g.position.z = minz - SEG; buildSeg(s, ++W.nextIdx);
      }
    };
    W.update = (dt, t, pulse) => {
      W.t = t; W.beatPulse = pulse || 0;
      for (const a of W.anim) a(dt, t, pulse || 0);
      for (const s of W.segs) if (s.anim) for (const a of s.anim) a(dt, t, pulse || 0);
    };

    /* ---------- Münzen, Power-ups, Ziel ---------- */
    W.coin = () => {
      const g = new THREE.Group(), t = W.tpl.coin;
      if (t) {
        const s = 0.95 / Math.max(t.size.x, t.size.z), inner = t.o.clone(true); inner.scale.setScalar(s); inner.position.set(-t.cx * s, -t.min.y * s - t.size.y * s / 2, -t.cz * s);
        if (t.size.y < Math.min(t.size.x, t.size.z) * .6) inner.rotation.x = 0; g.add(inner);
        g.userData.flat = t.size.y < Math.min(t.size.x, t.size.z) * .6;
        if (g.userData.flat) { inner.rotation.x = Math.PI / 2; }
      } else { const m = W.cy(.45, .45, .1, 0xffc83a, { e: .3, m: .6, r: .3 }, 0, -.05, 0, g, 18); m.rotation.x = Math.PI / 2; }
      return g;
    };
    const iconTex = {};
    W.icon = (kind) => {
      if (iconTex[kind]) return iconTex[kind].clone();
      const E = { magnet: ['🧲', '#ff4d6a'], shield: ['🛡️', '#19f0ff'], dbl: ['2×', '#ffd84a'], turbo: ['🚀', '#ff8a2a'], heart: ['❤️', '#ff2e88'] }[kind] || ['?', '#fff'];
      const [c, g] = W.canvas(128, 128, 2);
      g.fillStyle = E[1]; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.fillStyle = 'rgba(10,14,30,.78)'; g.beginPath(); g.arc(64, 64, 49, 0, 7); g.fill();
      g.font = (kind === 'dbl' ? 'bold 52px' : '56px') + ' system-ui,"Segoe UI Emoji","Apple Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = kind === 'dbl' ? '#ffd84a' : '#fff'; g.fillText(E[0], 64, 68);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; iconTex[kind] = t; return t.clone();
    };
    W.power = kind => {
      const g = new THREE.Group(), spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: W.icon(kind), transparent: true, depthWrite: false }));
      spr.scale.set(1.5, 1.5, 1); g.add(spr);
      const col = { magnet: 0xff4d6a, shield: 0x19f0ff, dbl: 0xffd84a, turbo: 0xff8a2a, heart: 0xff2e88 }[kind] || 0xffffff; W.glow(col, 3, 0, 0, 0, g, .55); return g;
    };
    W.finish = () => {
      const g = new THREE.Group(), [c, x] = W.canvas(256, 64, 2);
      for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#fff' : '#111'; x.fillRect(i * 16, j * 16, 16, 16); }
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
      W.cy(.3, .3, 6, 0xffffff, { e: .3 }, -4.6, 0, 0, g); W.cy(.3, .3, 6, 0xffffff, { e: .3 }, 4.6, 0, 0, g);
      const ban = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.2, .3), new THREE.MeshBasicMaterial({ map: t })); ban.position.y = 6; g.add(ban);
      const [c2, x2] = W.canvas(512, 128, 2); x2.fillStyle = '#ff2e88'; x2.fillRect(0, 0, 512, 128); x2.fillStyle = '#fff'; x2.font = 'bold 84px system-ui,sans-serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.fillText('ZIEL', 256, 70);
      const t2 = new THREE.CanvasTexture(c2); t2.encoding = THREE.sRGBEncoding; const ban2 = new THREE.Mesh(new THREE.BoxGeometry(6, 1.6, .3), new THREE.MeshBasicMaterial({ map: t2 })); ban2.position.y = 4.9; g.add(ban2);
      W.glow(0xff2e88, 14, 0, 5, 0, g, .35);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROAD, 2), new THREE.MeshBasicMaterial({ map: (() => { const t3 = new THREE.CanvasTexture(c); t3.wrapS = t3.wrapT = THREE.RepeatWrapping; t3.repeat.set(2, 1); t3.encoding = THREE.sRGBEncoding; return t3; })() })); floor.rotation.x = -Math.PI / 2; floor.position.y = .03; g.add(floor);
      return g;
    };
    /* Obstacle-Modell über das Thema */
    /* Jedes Hindernis passt sauber in seine Trefferbox: nicht breiter als die Spur, nicht höher als nötig, mittig und auf dem Boden. */
    const obBox = new THREE.Box3(), obC = new THREE.Vector3();
    W.obstacle = o => {
      const g = W.theme.obstacle(W, o.kind, rngf(o.seed || 1), o), b = meshBox(g, obBox);
      if (b.isEmpty()) return g;
      const sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
      const mw = 2 * (o.hw || 1) + .2, mh = (o.y1 || 2.6) + (o.kind === 'high' ? .5 : .2), md = 2 * (o.hd || .5) + (o.kind === 'long' ? .3 : .8);
      const k = Math.min(1, mw / sx, mh / sy, md / sz);
      const inner = new THREE.Group(); while (g.children.length) inner.add(g.children[0]);
      b.getCenter(obC); inner.scale.setScalar(k); inner.position.set(-obC.x * k, -b.min.y * k, -obC.z * k); g.add(inner);
      return g;
    };

    W.dispose = () => { W.anim.length = 0; };
    return W;
  }
  root.FRWorld = { create, SEG, NSEG, ROAD };
})(window);
