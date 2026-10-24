/* Brainrot Parkour – eigene Brainrot-Figuren (Mischwesen aus Tier und Gegenstand), prozedural in Three.js r128.
 * Für den typischen glänzenden KI-Render-Look: glatte Drehkörper, PBR-Materialien mit Klarlack, Umgebungsspiegelung
 * (siehe BRWorld.env), Canvas-Texturen mit Relief (Holz, Kruste, Leder, Waffel, Haut) und große realistische Augen.
 * BRChars.build(id) → { group, rig } ; BRChars.animate(rig, t, move, air) bewegt Beine, Flügel, Tentakel. Ursprung = Füße, Höhe ≈ 1,7. */
(function () {
  'use strict';
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI;
  const texC = {};
  /* ---------- Texturen ---------- */
  function cvs(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
  function tex(key, w, h, draw, rep) { if (texC[key]) return texC[key]; const t = new T.CanvasTexture(cvs(w, h, draw)); t.encoding = T.sRGBEncoding; t.anisotropy = 4; t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return texC[key] = t; }
  function bump(key, w, h, draw, rep) { if (texC[key]) return texC[key]; const t = new T.CanvasTexture(cvs(w, h, draw)); t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return texC[key] = t; }
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const speck = (x, w, h, n, col, rmin, rmax) => { x.fillStyle = col; for (let i = 0; i < n; i++) { x.beginPath(); x.arc(rnd() * w, rnd() * h, rmin + rnd() * (rmax - rmin), 0, 7); x.fill(); } };
  const noiseB = (key, n, r0, r1, base) => bump(key, 256, 256, (x, w, h) => { x.fillStyle = base || '#808080'; x.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { const v = (rnd() * 255) | 0; x.fillStyle = `rgba(${v},${v},${v},.5)`; x.beginPath(); x.arc(rnd() * w, rnd() * h, r0 + rnd() * (r1 - r0), 0, 7); x.fill(); } });
  /* ---------- Materialien ---------- */
  const M = {
    gloss: (c, o) => new T.MeshPhysicalMaterial(Object.assign({ color: c, roughness: .32, metalness: 0, clearcoat: 1, clearcoatRoughness: .12 }, o || {})),
    satin: (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .55, metalness: 0 }, o || {})),
    metal: (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .22, metalness: 1 }, o || {})),
  };
  const mesh = (g, m, cast) => { const o = new T.Mesh(g, m); o.castShadow = cast !== false; o.receiveShadow = true; return o; };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const lathe = (pts, seg) => new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), seg || 40);
  const sph = (r, ws, hs) => new T.SphereGeometry(r, ws || 32, hs || 24);
  const cyl = (r0, r1, h, s) => new T.CylinderGeometry(r0, r1, h, s || 20);
  function roundRect(w, h, r) { const s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  const extrude = (shape, depth, bev) => { const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 24 }); g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g; };
  // Röhre, die zum Ende hin dünner wird (Tentakel, Hälse, Nudeln)
  function taperTube(path, r, seg, rad, taper) {
    const g = new T.TubeGeometry(path, seg, r, rad || 10, false), p = g.attributes.position, per = (rad || 10) + 1;
    for (let i = 0; i < p.count; i++) { const j = Math.floor(i / per), t = j / seg, c = path.getPointAt(t), f = taper(t); p.setXYZ(i, c.x + (p.getX(i) - c.x) * f, c.y + (p.getY(i) - c.y) * f, c.z + (p.getZ(i) - c.z) * f); }
    g.computeVertexNormals(); return g;
  }
  const curve = pts => new T.CatmullRomCurve3(pts.map(p => V(p[0], p[1], p[2])));

  /* ---------- Augen (realistisch, glänzend) ---------- */
  function eyeTex(iris) {
    return tex('eye' + iris, 512, 256, (x, w, h) => {
      x.fillStyle = '#f6f3ee'; x.fillRect(0, 0, w, h);
      const g0 = x.createRadialGradient(128, 128, 60, 128, 128, 140); g0.addColorStop(0, 'rgba(255,255,255,0)'); g0.addColorStop(1, 'rgba(210,150,150,.35)'); x.fillStyle = g0; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = 'rgba(200,60,60,.25)'; x.lineWidth = 1; for (let i = 0; i < 14; i++) { x.beginPath(); let a = rnd() * 7, px = 128 + Math.cos(a) * 120, py = 128 + Math.sin(a) * 110; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (128 - px) * .2 + (rnd() - .5) * 14; py += (128 - py) * .2 + (rnd() - .5) * 14; x.lineTo(px, py); } x.stroke(); }
      const g = x.createRadialGradient(128, 128, 8, 128, 128, 46); g.addColorStop(0, '#000'); g.addColorStop(.3, iris); g.addColorStop(.85, iris); g.addColorStop(1, '#111'); x.fillStyle = g; x.beginPath(); x.arc(128, 128, 46, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 40; i++) { const a = i / 40 * 7; x.beginPath(); x.moveTo(128 + Math.cos(a) * 18, 128 + Math.sin(a) * 18); x.lineTo(128 + Math.cos(a) * 42, 128 + Math.sin(a) * 42); x.stroke(); }
      x.fillStyle = '#050505'; x.beginPath(); x.arc(128, 128, 17, 0, 7); x.fill();
    });
  }
  function eye(r, iris, lid) {
    const g = new T.Group();
    const s = mesh(sph(r, 32, 24), new T.MeshPhysicalMaterial({ map: eyeTex(iris || '#5a8a3a'), roughness: .1, clearcoat: 1, clearcoatRoughness: .03 }), false);
    g.add(s);   // Iris liegt bei u=.25 der Textur → zeigt nach +z
    if (lid) { const l = mesh(new T.SphereGeometry(r * 1.08, 32, 16, 0, PI * 2, 0, PI * .42), M.satin(lid)); l.rotation.x = -.25; g.add(l); }
    return g;
  }
  const eyes = (parent, r, x, y, z, iris, lid, spread) => { const L = eye(r, iris, lid), R = eye(r, iris, lid); at(L, -x, y, z); at(R, x, y, z); L.rotation.y = -(spread || .18); R.rotation.y = spread || .18; parent.add(L, R); return [L, R]; };
  const mouth = (parent, w, y, z, col) => { const m = mesh(new T.TorusGeometry(w, w * .14, 8, 24, PI * .8), M.satin(col || '#3a1010')); m.rotation.z = PI * 1.1; at(m, 0, y, z); parent.add(m); return m; };

  /* ---------- Turnschuhe & Beine (typischer Brainrot-Look) ---------- */
  function sneaker(col, stripe) {
    const g = new T.Group();
    const sole = mesh(extrude(roundRect(.2, .42, .09), .05, .025), M.satin('#f4f4f2', { roughness: .7 })); sole.rotation.x = PI / 2; at(sole, 0, .035, .06); g.add(sole);
    const up = mesh(new T.SphereGeometry(.13, 28, 16, 0, PI * 2, 0, PI / 2), M.satin(col, { roughness: .5 })); up.scale.set(.85, .95, 1.75); at(up, 0, .06, .05); g.add(up);
    const st = mesh(new T.TorusGeometry(.1, .016, 8, 20, PI * .9), M.satin(stripe)); st.rotation.y = PI / 2; st.scale.set(1, .6, 1.4); at(st, .105, .1, .05); g.add(st); const st2 = st.clone(); st2.position.x = -.105; g.add(st2);
    const col2 = mesh(cyl(.08, .095, .08), M.satin('#ffffff')); at(col2, 0, .17, -.02); g.add(col2);
    for (let i = 0; i < 3; i++) { const l = mesh(new T.BoxGeometry(.11, .012, .02), M.satin('#ffffff')); at(l, 0, .17 - i * .02, .1 + i * .045); l.rotation.x = -.5; g.add(l); }
    return g;
  }
  function leg(len, skin, shoeCol, stripe, thick) {
    const pivot = new T.Group(), t = thick || .085;
    const thigh = mesh(lathe([[0, 0], [t * 1.25, .04], [t * 1.3, len * .25], [t, len * .5], [t * .9, len * .52], [0, len * .53]], 20), M.satin(skin, { roughness: .6 }));
    thigh.rotation.x = PI; pivot.add(thigh);
    const knee = new T.Group(); knee.position.y = -len * .5; pivot.add(knee);
    const shin = mesh(lathe([[0, 0], [t * .95, .02], [t * 1.05, len * .18], [t * .7, len * .46], [0, len * .5]], 20), M.satin(skin, { roughness: .6 })); shin.rotation.x = PI; knee.add(shin);
    const sh = sneaker(shoeCol, stripe); sh.position.y = -len * .5 - .02; knee.add(sh);
    return { pivot, knee };
  }

  /* ---------- Die Figuren ---------- */
  const B = {};
  // 1 Pinguino Spaghettino – Pinguin mit Gabel-Schnabel und Spaghetti-Frisur samt Fleischbällchen
  B.pinguino = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const body = mesh(lathe([[0, 0], [.32, .04], [.47, .3], [.5, .55], [.44, .85], [.34, 1.08], [.3, 1.2], [.31, 1.36], [.24, 1.52], [.1, 1.6], [0, 1.61]]), M.gloss('#08090d', { roughness: .45, clearcoat: .5, envMapIntensity: .35 })); body.scale.set(.88, 1, .9); at(body, 0, .12, 0); g.add(body);
    const belly = mesh(sph(.5), M.gloss('#f4f1ea', { roughness: .45 })); belly.scale.set(.74, 1.02, .62); at(belly, 0, .62, .2); g.add(belly);
    const face = mesh(sph(.24), M.gloss('#f4f1ea', { roughness: .45 })); face.scale.set(1, .9, .6); at(face, 0, 1.38, .16); g.add(face);
    eyes(g, .085, .1, 1.42, .3, '#3a6aa0', null, .22);
    const fork = new T.Group(); at(fork, 0, 1.3, .32); g.add(fork); const fm = M.metal('#d6d9de');
    const handle = mesh(cyl(.025, .035, .28), fm); handle.rotation.x = PI / 2; at(handle, 0, 0, .1); fork.add(handle);
    const neck = mesh(new T.BoxGeometry(.13, .02, .06), fm); at(neck, 0, 0, .27); fork.add(neck);
    for (let i = 0; i < 4; i++) { const p = mesh(cyl(.009, .012, .2, 8), fm); p.rotation.x = PI / 2; at(p, -.048 + i * .032, 0, .39); fork.add(p); }
    // Spaghetti-Nest
    const pasta = M.gloss('#f0c35c', { roughness: .4, clearcoat: .6 }); seed = 11;
    for (let i = 0; i < 16; i++) { const pts = [], a0 = rnd() * 7, rr = .14 + rnd() * .14; for (let k = 0; k <= 12; k++) { const a = a0 + k * .7, h = 1.6 + Math.sin(k * .9 + i) * .05 + rnd() * .05; pts.push([Math.cos(a) * rr * (1 + .2 * Math.sin(k)), h + k * .006, Math.sin(a) * rr * (1 + .2 * Math.cos(k))]); } g.add(mesh(new T.TubeGeometry(curve(pts), 60, .018, 6), pasta)); }
    for (let i = 0; i < 4; i++) { const a = rnd() * 7, pts = [[Math.cos(a) * .2, 1.62, Math.sin(a) * .2], [Math.cos(a) * .32, 1.45, Math.sin(a) * .32], [Math.cos(a) * .36, 1.25 - rnd() * .2, Math.sin(a) * .36]]; g.add(mesh(new T.TubeGeometry(curve(pts), 20, .017, 6), pasta)); }
    const sauce = mesh(sph(.16), M.gloss('#b81e10', { roughness: .15 })); sauce.scale.set(1.25, .35, 1.25); at(sauce, 0, 1.7, 0); g.add(sauce);
    const ball = mesh(sph(.12), M.satin('#6a3a22', { roughness: .85, bumpMap: noiseB('meat', 900, 1, 4), bumpScale: .02 })); at(ball, 0, 1.78, 0); g.add(ball);
    for (const s of [-1, 1]) { const w = new T.Group(); at(w, s * .45, 1, 0); const f = mesh(sph(.22), M.gloss('#111318')); f.scale.set(.18, 1.2, .55); at(f, s * .04, -.24, 0); w.add(f); w.rotation.z = s * .25; g.add(w); rig.wings.push({ o: w, s, amp: .5, base: s * .25 }); }
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .17, .12, .05); const f = mesh(sph(.13), M.satin('#f08a1c', { roughness: .5 })); f.scale.set(.9, .3, 1.5); at(f, 0, -.07, .08); p.add(f); g.add(p); rig.legs.push({ o: p, s, amp: .5 }); }
    return { group: g, rig };
  };
  // 2 Toastini Volantini – Toastscheibe mit Taubenflügeln, Butterstück und Taubenfüßen
  B.toastini = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const sh = new T.Shape(); sh.moveTo(-.42, 0); sh.lineTo(.42, 0); sh.lineTo(.44, .7); sh.bezierCurveTo(.62, .8, .62, 1.18, .3, 1.2); sh.bezierCurveTo(.12, 1.32, -.12, 1.32, -.3, 1.2); sh.bezierCurveTo(-.62, 1.18, -.62, .8, -.44, .7); sh.closePath();
    const crumb = tex('crumb', 256, 256, (x, w, h) => { const gr = x.createRadialGradient(128, 128, 30, 128, 128, 170); gr.addColorStop(0, '#f2d79a'); gr.addColorStop(.7, '#d9a85a'); gr.addColorStop(1, '#8a4e1c'); x.fillStyle = gr; x.fillRect(0, 0, w, h); seed = 3; speck(x, w, h, 500, 'rgba(160,100,40,.35)', .6, 2.6); speck(x, w, h, 200, 'rgba(255,240,200,.4)', .5, 1.6); }, [1.15, .85]);
    crumb.offset.set(.5, .05);
    const crumbB = noiseB('crumbB', 1400, .6, 2.4, '#909090');
    const geo = new T.ExtrudeGeometry(sh, { depth: .2, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 6, curveSegments: 32 }); geo.translate(0, 0, -.1); geo.computeVertexNormals();
    const toast = mesh(geo, [M.satin('#ffffff', { map: crumb, roughness: .85, bumpMap: crumbB, bumpScale: .012 }), M.satin('#7a3f12', { roughness: .7, bumpMap: crumbB, bumpScale: .02 })]); at(toast, 0, .45, 0); g.add(toast);
    const butter = mesh(extrude(roundRect(.3, .3, .04), .07, .03), M.gloss('#ffe27a', { roughness: .2 })); butter.rotation.x = PI / 2; at(butter, .05, 1.79, 0); butter.rotation.z = .3; g.add(butter);
    eyes(g, .095, .14, 1.15, .17, '#7a4a1a', '#c98a3a', .1);
    mouth(g, .09, .9, .16);
    const feather = M.satin('#dfe4ea', { roughness: .6, bumpMap: noiseB('feath2', 1200, .4, 1.6), bumpScale: .01 }), fd = M.satin('#8a96a4', { roughness: .6 });
    for (const s of [-1, 1]) { const w = new T.Group(); at(w, s * .48, 1.05, -.05); for (let i = 0; i < 6; i++) { const f = mesh(sph(.2, 18, 12), i > 3 ? fd : feather); f.scale.set(.95 - i * .06, .3, .07); at(f, s * (.18 + i * .07), .06 - i * .05, -i * .015); f.rotation.z = s * (-.15 - i * .12); w.add(f); } g.add(w); rig.wings.push({ o: w, s, amp: .9, base: 0, axis: 'z', fast: true }); }
    const skin = M.satin('#d77a76', { roughness: .55 });
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .18, .47, 0); const l = mesh(cyl(.028, .022, .4), skin); at(l, 0, -.2, 0); p.add(l); for (const a of [-.5, 0, .5]) { const toe = mesh(cyl(.018, .01, .14, 8), skin); toe.rotation.x = PI / 2; toe.rotation.y = a; at(toe, Math.sin(a) * .05, -.4, Math.cos(a) * .06); p.add(toe); } g.add(p); rig.legs.push({ o: p, s, amp: .6 }); }
    return { group: g, rig };
  };
  // 3 Lampadino Giraffino – Giraffe mit Glühbirnen-Kopf
  B.lampadino = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const spots = tex('giraffe', 256, 256, (x, w, h) => { x.fillStyle = '#f3d9a4'; x.fillRect(0, 0, w, h); seed = 5; for (let i = 0; i < 22; i++) { const cx = rnd() * w, cy = rnd() * h, r = 16 + rnd() * 16; x.fillStyle = '#b4652a'; x.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 7, rr = r * (.7 + rnd() * .4); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); } }, [2, 2]);
    const fur = M.satin('#ffffff', { map: spots, roughness: .75, bumpMap: noiseB('fur', 2500, .4, 1.2), bumpScale: .006 });
    const body = mesh(sph(.42), fur); body.scale.set(.75, .6, 1.05); at(body, 0, .78, -.05); g.add(body);
    const neck = mesh(lathe([[.13, 0], [.12, .3], [.09, .62], [0, .66]], 24), fur); neck.rotation.x = .25; at(neck, 0, .9, .18); g.add(neck);
    const hd = new T.Group(); at(hd, 0, 1.52, .36); g.add(hd);
    const base = mesh(lathe([[.07, 0], [.085, .02], [.075, .04], [.085, .06], [.075, .08], [.085, .1], [.1, .14]], 32), M.metal('#cfc6a8', { roughness: .3 })); hd.add(base);
    const glass = mesh(lathe([[.1, .14], [.13, .2], [.22, .32], [.25, .42], [.22, .54], [.12, .61], [0, .63]], 48), new T.MeshPhysicalMaterial({ color: '#fff8e8', roughness: .03, metalness: 0, transparent: true, opacity: .3, clearcoat: 1, depthWrite: false }), false); hd.add(glass);
    const fil = mesh(new T.TubeGeometry(curve([[-.06, .2, 0], [-.05, .34, 0], [-.03, .38, .02], [-.01, .34, -.02], [.01, .38, .02], [.03, .34, -.02], [.05, .38, 0], [.06, .2, 0]]), 60, .008, 6), new T.MeshBasicMaterial({ color: '#ffd27a' }), false); hd.add(fil);
    const glow = mesh(sph(.16), new T.MeshBasicMaterial({ color: '#ffcf6a', transparent: true, opacity: .22, depthWrite: false }), false); at(glow, 0, .37, 0); hd.add(glow);
    eyes(hd, .07, .09, .43, .2, '#3a2a1a', null, .2);
    for (const s of [-1, 1]) { const o = mesh(cyl(.012, .02, .12, 8), M.satin('#7a4a1a')); at(o, s * .08, .64, -.04); o.rotation.z = -s * .3; hd.add(o); const k = mesh(sph(.025), M.satin('#3a2210')); at(k, s * .1, .7, -.04); hd.add(k); }
    for (const [x, z] of [[-.16, .25], [.16, .25], [-.16, -.32], [.16, -.32]]) { const p = new T.Group(); at(p, x, .62, z); const l = mesh(cyl(.06, .045, .6), fur); at(l, 0, -.3, 0); p.add(l); const hoof = mesh(cyl(.05, .058, .06), M.gloss('#2a1a10')); at(hoof, 0, -.6, 0); p.add(hoof); g.add(p); rig.legs.push({ o: p, s: x * z > 0 ? 1 : -1, amp: .45 }); }
    const tail = mesh(new T.TubeGeometry(curve([[0, .85, -.48], [0, .7, -.56], [0, .55, -.58]]), 12, .018, 6), fur); g.add(tail);
    rig.glow = glow;
    return { group: g, rig };
  };
  // 5 Scarpone Lumacone – Schnecke mit Wanderstiefel als Haus
  B.scarpone = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const slime = M.gloss('#cdb98a', { roughness: .18, clearcoat: 1, bumpMap: noiseB('slime', 500, 2, 6), bumpScale: .01 });
    const path = curve([[0, .1, -.6], [0, .14, -.2], [0, .2, .25], [0, .5, .52], [0, .92, .6]]);
    g.add(mesh(taperTube(path, .26, 40, 20, t => t < .7 ? .7 + t * .45 : 1.02 - (t - .7) * .6), slime));
    const tipHead = mesh(sph(.22), slime); at(tipHead, 0, .95, .6); g.add(tipHead);
    const foot = mesh(sph(.4), slime); foot.scale.set(.75, .2, 1.8); at(foot, 0, .08, -.05); g.add(foot);
    for (const s of [-1, 1]) { const st = new T.Group(); at(st, s * .08, 1.08, .6); const stalk = mesh(new T.TubeGeometry(curve([[0, 0, 0], [s * .05, .2, .03], [s * .1, .38, .02]]), 12, .028, 8), slime); st.add(stalk); const e = eye(.08, '#4a3a2a'); at(e, s * .1, .44, .04); st.add(e); g.add(st); rig.wig.push({ o: st, ph: s, amp: .15, axis: 'z' }); }
    mouth(g, .07, .88, .8);
    // Stiefel
    const leather = tex('leather', 256, 256, (x, w, h) => { x.fillStyle = '#7a4a26'; x.fillRect(0, 0, w, h); seed = 9; speck(x, w, h, 1800, 'rgba(40,20,10,.18)', .3, 1.5); speck(x, w, h, 400, 'rgba(200,140,90,.15)', .5, 2); });
    const lb = noiseB('leatherB', 2600, .3, 1.4);
    const lm = M.satin('#ffffff', { map: leather, roughness: .55, bumpMap: lb, bumpScale: .01 }), rub = M.satin('#1d1b1a', { roughness: .8 }), pad = M.satin('#c84a2a', { roughness: .7 });
    const boot = new T.Group(); at(boot, 0, .32, -.25); boot.rotation.x = -.15; g.add(boot);
    const prof = new T.Shape(); prof.moveTo(-.35, 0); prof.lineTo(.42, 0); prof.bezierCurveTo(.62, 0, .64, .22, .45, .28); prof.lineTo(.12, .36); prof.lineTo(.1, 1.0); prof.lineTo(-.32, 1.0); prof.lineTo(-.36, .3); prof.closePath();
    const up = new T.ExtrudeGeometry(prof, { depth: .34, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 5, curveSegments: 20 }); up.translate(0, 0, -.17); up.computeVertexNormals();
    const upper = mesh(up, lm); upper.rotation.y = -PI / 2; at(upper, 0, .06, 0); boot.add(upper);
    const sole = mesh(extrude(roundRect(.5, 1.12, .2), .08, .03), rub); sole.rotation.x = PI / 2; at(sole, 0, .02, .04); boot.add(sole);
    const collar = mesh(new T.TorusGeometry(.2, .06, 10, 24), pad); collar.rotation.x = PI / 2; collar.scale.set(1.15, 1, 1); at(collar, 0, 1.08, -.1); boot.add(collar);
    const lace = M.satin('#f2e6c8');
    for (let i = 0; i < 5; i++) { const y = .42 + i * .13, z = .2 - i * .005; for (const s of [-1, 1]) { const l = mesh(cyl(.012, .012, .3, 6), lace); l.rotation.z = PI / 2 + s * .35; at(l, 0, y, z + .02); l.rotation.y = 0; boot.add(l); } for (const s of [-1, 1]) { const ey = mesh(new T.TorusGeometry(.02, .007, 6, 12), M.metal('#b8a070')); at(ey, s * .12, y, z); boot.add(ey); } }
    return { group: g, rig };
  };
  // 6 Pizzarana Saltarella – Frosch mit Pizzastück als Rücken
  B.pizzarana = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const frogTex = tex('frog', 256, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3e9a3a'); gr.addColorStop(1, '#8fd05a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); seed = 13; speck(x, w, h, 40, 'rgba(20,60,20,.5)', 4, 12); });
    const skin = M.gloss('#ffffff', { map: frogTex, roughness: .25, clearcoat: 1 }), belly = M.gloss('#e8f2c8', { roughness: .3 });
    const body = mesh(sph(.45), skin); body.scale.set(1, .72, 1.15); at(body, 0, .52, 0); g.add(body);
    const bl = mesh(sph(.42), belly); bl.scale.set(.85, .55, 1); at(bl, 0, .45, .1); g.add(bl);
    const head = mesh(sph(.38), skin); head.scale.set(1.2, .7, 1); at(head, 0, .82, .32); g.add(head);
    for (const s of [-1, 1]) { const bump2 = mesh(sph(.15), skin); at(bump2, s * .2, 1.0, .38); g.add(bump2); }
    eyes(g, .12, .2, 1.03, .44, '#c8a020', null, .35);
    const m = mesh(new T.TorusGeometry(.26, .018, 8, 32, PI * .7), M.satin('#2a3a1a')); m.rotation.z = PI * 1.15; m.rotation.x = .3; at(m, 0, .78, .55); g.add(m);
    // Pizzastück auf dem Rücken
    const piz = tex('pizza', 512, 512, (x, w, h) => { x.fillStyle = '#e8b04a'; x.fillRect(0, 0, w, h); seed = 17; speck(x, w, h, 70, 'rgba(250,215,120,.9)', 10, 26); speck(x, w, h, 50, 'rgba(200,60,20,.55)', 6, 18); speck(x, w, h, 30, 'rgba(60,120,40,.8)', 3, 7); });
    const tri = new T.Shape(); tri.moveTo(0, .55); tri.lineTo(-.42, -.45); tri.quadraticCurveTo(0, -.6, .42, -.45); tri.closePath();
    const slice = mesh(new T.ExtrudeGeometry(tri, { depth: .05, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3, curveSegments: 24 }), [M.gloss('#ffffff', { map: piz, roughness: .35, clearcoat: .5 }), M.satin('#c88a3a', { roughness: .8 })]);
    piz.repeat.set(1, 1); piz.offset.set(.5, .5);
    const sl = new T.Group(); sl.add(slice); sl.rotation.x = -PI / 2 + .28; const slo = new T.Group(); slo.add(sl); slo.rotation.y = PI; slo.scale.setScalar(1.15); at(slo, 0, .98, -.12); g.add(slo);
    const crust = mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(V(-.42, -.45, .03), V(0, -.62, .03), V(.42, -.45, .03)), 24, .055, 10), M.satin('#b8742a', { roughness: .7, bumpMap: noiseB('crust', 800, 1, 3), bumpScale: .01 })); sl.add(crust);
    for (const [px, py] of [[0, .2], [-.18, -.15], [.16, -.2], [0, -.35]]) { const pep = mesh(cyl(.08, .08, .02, 24), M.gloss('#a0201a', { roughness: .4, bumpMap: noiseB('pep', 300, 1, 3), bumpScale: .01 })); pep.rotation.x = PI / 2; at(pep, px, py, .08); sl.add(pep); }
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .32, .38, -.25); const th = mesh(sph(.16), skin); th.scale.set(.7, .7, 1.4); at(th, s * .05, -.05, .05); p.add(th); const ft = mesh(sph(.13), skin); ft.scale.set(1.2, .25, 1.5); at(ft, s * .08, -.33, .22); p.add(ft); g.add(p); rig.legs.push({ o: p, s, amp: .35, hop: true }); }
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .26, .3, .38); const a = mesh(cyl(.05, .04, .3), skin); at(a, 0, -.12, 0); p.add(a); const ft = mesh(sph(.08), skin); ft.scale.set(1.3, .3, 1.3); at(ft, 0, -.28, .05); p.add(ft); g.add(p); rig.legs.push({ o: p, s: -s, amp: .35 }); }
    return { group: g, rig };
  };
  // 7 Fenicottero Ombrellone – Flamingo, dessen Körper ein Strandschirm ist (mit Turnschuhen)
  B.fenicottero = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const stripes = tex('umb', 512, 64, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#ff5a8a'; x.fillRect(i * w / 16, 0, w / 16, h); } }, [1, 1]);
    const can = mesh(lathe([[0, .38], [.2, .36], [.45, .28], [.66, .14], [.72, .08], [.7, .06], [0, .06]], 16), M.satin('#ffffff', { map: stripes, roughness: .55, side: T.DoubleSide })); at(can, 0, .78, 0); g.add(can);
    const tip = mesh(sph(.05), M.gloss('#ffffff')); at(tip, 0, 1.17, 0); g.add(tip);
    const pole = mesh(cyl(.025, .025, .4), M.metal('#e6e6e6')); at(pole, 0, .74, 0); g.add(pole);
    const pink = M.satin('#ff8aa8', { roughness: .6, bumpMap: noiseB('feath', 1500, .5, 2), bumpScale: .01 });
    const body = mesh(sph(.24), pink); body.scale.set(1, .8, 1.25); at(body, 0, .66, 0); g.add(body);
    const neckPath = curve([[0, 1.08, .05], [0, 1.25, .22], [0, 1.38, .08], [0, 1.55, .0], [0, 1.68, .12]]);
    g.add(mesh(taperTube(neckPath, .07, 30, 12, t => 1 - t * .25), pink));
    const hd = mesh(sph(.12), pink); hd.scale.set(.9, .95, 1.1); at(hd, 0, 1.72, .14); g.add(hd);
    const beak = mesh(lathe([[0, 0], [.05, .02], [.045, .12], [.02, .2], [0, .22]], 16), M.gloss('#f2f0e8')); beak.rotation.x = PI / 2 + .6; at(beak, 0, 1.72, .22); g.add(beak);
    const bt = mesh(cyl(.02, .035, .07, 12), M.gloss('#111')); bt.rotation.x = PI / 2 + .6; at(bt, 0, 1.6, .37); g.add(bt);
    eyes(g, .045, .075, 1.76, .18, '#e8b020', null, .5);
    const legPink = '#ff9ab4';
    for (const s of [-1, 1]) { const L = leg(.64, legPink, '#ffffff', '#ff5a8a', .035); at(L.pivot, s * .1, .62, 0); g.add(L.pivot); rig.legs.push({ o: L.pivot, s, amp: .55, knee: L.knee }); }
    return { group: g, rig };
  };
  // 8 Gelatone Tartarugone – Schildkröte mit Waffel-Panzer und Eiskugeln
  B.gelatone = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const waf = tex('waffle', 256, 256, (x, w, h) => { x.fillStyle = '#d99a4a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a8662a'; x.lineWidth = 7; for (let i = -w; i < w * 2; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); } }, [3, 2]);
    const wafB = bump('waffleB', 256, 256, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#000'; x.lineWidth = 8; for (let i = -w; i < w * 2; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); } }, [3, 2]);
    const scale = tex('scales', 256, 256, (x, w, h) => { x.fillStyle = '#7a9a4a'; x.fillRect(0, 0, w, h); seed = 31; for (let yy = 0; yy < h; yy += 14) for (let xx = (yy / 14 % 2) * 7; xx < w; xx += 14) { x.fillStyle = `rgba(${60 + rnd() * 40},${90 + rnd() * 40},40,.9)`; x.beginPath(); x.arc(xx, yy, 6, 0, 7); x.fill(); } }, [2, 2]);
    const skin = M.satin('#ffffff', { map: scale, roughness: .6, bumpMap: noiseB('scaleB', 1600, 1, 3), bumpScale: .01 });
    const shell = mesh(new T.SphereGeometry(.55, 40, 20, 0, PI * 2, 0, PI / 2), M.satin('#ffffff', { map: waf, roughness: .7, bumpMap: wafB, bumpScale: .025 })); shell.scale.set(1, .75, 1.15); at(shell, 0, .38, -.05); g.add(shell);
    const rim = mesh(new T.TorusGeometry(.55, .05, 10, 40), M.satin('#c08038', { roughness: .7 })); rim.rotation.x = PI / 2; rim.scale.set(1, 1.15, 1); at(rim, 0, .38, -.05); g.add(rim);
    const scoops = [['#bfe08a', 0, .82, -.05, .26], ['#ff9ab0', -.2, .72, -.18, .22], ['#f6efe0', .2, .72, -.15, .22]];
    for (const [c, x, y, z, r] of scoops) { const s = mesh(sph(r, 32, 24), M.satin(c, { roughness: .55, bumpMap: noiseB('gel' + c, 900, 1, 4), bumpScale: .02 })); s.scale.set(1, .85, 1); at(s, x, y, z); g.add(s); const drip = mesh(sph(r * .55), M.gloss(c, { roughness: .2 })); drip.scale.set(1.6, .4, 1.6); at(drip, x, y - r * .7, z); g.add(drip); }
    seed = 41; const chip = M.satin('#3a2010'); for (let i = 0; i < 14; i++) { const a = rnd() * 7, b = rnd() * 1.2; const c = mesh(new T.BoxGeometry(.03, .015, .02), chip, false); at(c, .2 + Math.cos(a) * Math.sin(b) * .22, .72 + Math.cos(b) * .19, -.15 + Math.sin(a) * Math.sin(b) * .22); c.rotation.set(rnd() * 3, rnd() * 3, 0); g.add(c); }
    const cherry = mesh(sph(.08), M.gloss('#c8102a', { roughness: .1 })); at(cherry, 0, 1.12, -.05); g.add(cherry);
    const stem = mesh(new T.TubeGeometry(curve([[0, 1.18, -.05], [.03, 1.28, -.04], [.08, 1.34, -.06]]), 10, .01, 6), M.satin('#3a5a1a')); g.add(stem);
    const wafer = mesh(new T.BoxGeometry(.06, .4, .12), M.satin('#e8c27a', { map: waf, roughness: .7 })); wafer.rotation.z = .4; at(wafer, -.15, 1.0, .02); g.add(wafer);
    const neck = mesh(cyl(.13, .15, .3), skin); neck.rotation.x = 1.1; at(neck, 0, .42, .55); g.add(neck);
    const head = mesh(sph(.22), skin); head.scale.set(1, .9, 1.15); at(head, 0, .55, .72); g.add(head);
    eyes(g, .085, .12, .66, .84, '#2a2010', '#6a8a3a', .3);
    mouth(g, .08, .48, .92);
    for (const [x, z, s] of [[-.4, .35, 1], [.4, .35, -1], [-.4, -.42, -1], [.4, -.42, 1]]) { const p = new T.Group(); at(p, x, .3, z); const l = mesh(sph(.13), skin); l.scale.set(1, 1.6, 1.1); at(l, 0, -.12, 0); p.add(l); g.add(p); rig.legs.push({ o: p, s, amp: .4 }); }
    return { group: g, rig };
  };

  /* ---------- Zubehör ---------- */
  function furTex(key, base, dark, light, rep) {
    return tex(key, 256, 256, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); seed = key.length * 7; x.lineWidth = 1.2;
      for (let i = 0; i < 2600; i++) { const px = rnd() * w, py = rnd() * h, a = 1.4 + (rnd() - .5) * .6, l = 4 + rnd() * 7; x.strokeStyle = rnd() < .5 ? dark : light; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } }, rep || [2, 2]);
  }
  const furB = () => bump('furB', 256, 256, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); seed = 77; x.lineWidth = 1.4; for (let i = 0; i < 3000; i++) { const px = rnd() * w, py = rnd() * h, v = (rnd() * 255) | 0; x.strokeStyle = `rgb(${v},${v},${v})`; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - .5) * 3, py + 6); x.stroke(); } }, [3, 3]);
  const fur = (key, base, dark, light, o) => M.satin('#ffffff', Object.assign({ map: furTex(key, base, dark, light), roughness: .85, bumpMap: furB(), bumpScale: .02 }, o || {}));
  function shades(w, col, frame) {
    const g = new T.Group(), lens = M.gloss(col || '#0a0a0c', { roughness: .05, metalness: .3, clearcoat: 1, clearcoatRoughness: 0 }), fr = M.gloss(frame || '#111');
    for (const s of [-1, 1]) { const l = mesh(extrude(roundRect(w * .44, w * .3, w * .1), .015, .008), lens); at(l, s * w * .26, 0, 0); g.add(l); const r = mesh(new T.TorusGeometry(w * .2, .012, 6, 24), fr); r.scale.set(1.15, .78, 1); at(r, s * w * .26, 0, .005); g.add(r); }
    const br = mesh(new T.BoxGeometry(w * .14, .02, .02), fr); at(br, 0, w * .05, 0); g.add(br);
    for (const s of [-1, 1]) { const t = mesh(new T.BoxGeometry(.018, .02, w * .5), fr); at(t, s * w * .48, w * .04, -w * .25); g.add(t); }
    return g;
  }
  function flame(len) { const g = new T.Group(); const o = mesh(new T.ConeGeometry(.07, len, 16, 1, true), new T.MeshBasicMaterial({ color: '#ff7a1a', transparent: true, opacity: .85, depthWrite: false }), false); o.rotation.x = PI; at(o, 0, -len / 2, 0); g.add(o); const i = mesh(new T.ConeGeometry(.04, len * .6, 12, 1, true), new T.MeshBasicMaterial({ color: '#fff2a0', depthWrite: false, transparent: true }), false); i.rotation.x = PI; at(i, 0, -len * .3, 0); g.add(i); return g; }
  function jet(r, len) { const g = new T.Group(), m = M.metal('#b8bcc4', { roughness: .3 }); const b = mesh(lathe([[r * .8, 0], [r, len * .2], [r, len * .8], [r * .7, len], [0, len]], 24), m); g.add(b); const ring = mesh(new T.TorusGeometry(r * .92, r * .12, 8, 24), M.metal('#5a5e66')); ring.rotation.x = PI / 2; at(ring, 0, len * .5, 0); g.add(ring); const f = flame(len * 1.1); g.add(f); g.userData.flame = f; return g; }
  function chain(r, n) { const g = new T.Group(), m = M.metal('#ffcb3a', { roughness: .18 }); for (let i = 0; i < n; i++) { const a = PI * .15 + i / (n - 1) * PI * .7, l = mesh(new T.TorusGeometry(.028, .009, 6, 12), m); at(l, Math.cos(a) * r, -Math.sin(a) * r * .9, 0); l.rotation.y = i % 2 ? PI / 2 : 0; l.rotation.z = a; g.add(l); } return g; }

  // 9 Pinguino Turbo – Pinguin mit Fliegerkappe, Brille und Düsentriebwerken an den Flügeln
  B.pturbo = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [], flames: [] };
    const black = M.gloss('#0c1220', { roughness: .4, clearcoat: .6, envMapIntensity: .5, bumpMap: noiseB('pfeath', 2200, .4, 1.2), bumpScale: .004 });
    const body = mesh(lathe([[0, 0], [.3, .05], [.44, .35], [.45, .62], [.38, .9], [.36, 1.1], [.33, 1.35], [.22, 1.52], [0, 1.58]]), black); at(body, 0, .1, 0); g.add(body);
    const belly = mesh(sph(.45), M.satin('#f7f4ee', { roughness: .7, bumpMap: noiseB('pfeath', 2200, .4, 1.2), bumpScale: .006 })); belly.scale.set(.78, 1.05, .72); at(belly, 0, .62, .2); g.add(belly);
    const face = mesh(sph(.27), M.satin('#f7f4ee', { roughness: .7 })); face.scale.set(1.05, .9, .7); at(face, 0, 1.3, .14); g.add(face);
    eyes(g, .12, .11, 1.36, .3, '#1a3a6a', null, .2);
    const beak = mesh(lathe([[0, 0], [.09, .02], [.07, .1], [0, .2]], 20), M.gloss('#ff9a1a', { roughness: .3 })); beak.rotation.x = PI / 2; beak.scale.set(1.3, 1, .7); at(beak, 0, 1.2, .36); g.add(beak);
    const cap = mesh(new T.SphereGeometry(.36, 32, 16, 0, PI * 2, 0, PI * .55), M.satin('#6a4024', { roughness: .55, bumpMap: noiseB('leatherB2', 2000, .3, 1.2), bumpScale: .008 })); at(cap, 0, 1.38, 0); g.add(cap);
    for (const s of [-1, 1]) { const flap = mesh(sph(.12), M.satin('#6a4024')); flap.scale.set(.4, 1, .8); at(flap, s * .33, 1.3, 0); g.add(flap); }
    const gog = new T.Group(); at(gog, 0, 1.56, .2); gog.rotation.x = -.5; g.add(gog);
    for (const s of [-1, 1]) { const rim = mesh(cyl(.1, .1, .07, 24), M.metal('#9a9aa2')); rim.rotation.x = PI / 2; at(rim, s * .12, 0, 0); gog.add(rim); const gl = mesh(sph(.085, 24, 12), M.gloss('#7ac8ff', { roughness: .02, transparent: true, opacity: .65 })); gl.scale.set(1, 1, .4); at(gl, s * .12, 0, .04); gog.add(gl); }
    const strap = mesh(new T.TorusGeometry(.33, .025, 6, 32), M.satin('#3a2a1a')); strap.rotation.x = PI / 2 - .5; at(strap, 0, 1.52, 0); g.add(strap);
    for (const s of [-1, 1]) { const w = new T.Group(); at(w, s * .42, .95, 0); const f = mesh(sph(.22), black); f.scale.set(.18, 1.15, .55); at(f, s * .03, -.22, 0); w.add(f); const j = jet(.11, .42); j.rotation.x = .2; at(j, s * .12, -.3, -.05); w.add(j); rig.flames.push(j.userData.flame); w.rotation.z = s * .35; g.add(w); rig.wings.push({ o: w, s, amp: .25, base: s * .35 }); }
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .17, .1, .05); const f = mesh(sph(.13), M.satin('#ff9a1a')); f.scale.set(.95, .3, 1.5); at(f, 0, -.05, .08); p.add(f); g.add(p); rig.legs.push({ o: p, s, amp: .5 }); }
    return { group: g, rig };
  };
  // 10 Llama Jetpacko – Regenbogen-Lama mit Horn, Streifen-Brille und Raketenrucksack
  B.llama = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [], flames: [] };
    const rb = tex('rainbow', 256, 256, (x, w, h) => { const c = ['#ff4a7a', '#ff9a3a', '#ffe14a', '#5ae07a', '#4ab0ff', '#9a6aff']; for (let i = 0; i < 6; i++) { x.fillStyle = c[i]; x.fillRect(0, i * h / 6, w, h / 6 + 1); } seed = 51; x.lineWidth = 2; for (let i = 0; i < 3000; i++) { const px = rnd() * w, py = rnd() * h; x.strokeStyle = rnd() < .5 ? 'rgba(255,255,255,.35)' : 'rgba(80,0,80,.18)'; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 3, py + 4, px + (rnd() - .5) * 6, py + 8); x.stroke(); } }, [1, 1.4]);
    const wool = M.satin('#ffffff', { map: rb, roughness: .9, bumpMap: noiseB('wool', 1800, 2, 6), bumpScale: .035 });
    const body = mesh(sph(.4, 40, 30), wool); body.scale.set(.8, .75, 1.15); at(body, 0, .82, -.05); g.add(body);
    const neck = mesh(lathe([[.16, 0], [.15, .3], [.12, .6], [0, .64]], 28), wool); neck.rotation.x = .15; at(neck, 0, .95, .26); g.add(neck);
    const head = mesh(sph(.17), wool); head.scale.set(.9, .85, 1.3); at(head, 0, 1.6, .38); g.add(head);
    const snout = mesh(sph(.11), M.satin('#f2e6ee', { roughness: .8 })); snout.scale.set(.9, .75, 1); at(snout, 0, 1.54, .58); g.add(snout);
    for (const s of [-1, 1]) { const ear = mesh(new T.ConeGeometry(.05, .2, 12), wool); at(ear, s * .1, 1.78, .32); ear.rotation.z = -s * .25; g.add(ear); }
    const horn = mesh(lathe([[.05, 0], [.04, .08], [.03, .16], [.02, .24], [0, .32]], 16), M.gloss('#fff3c8', { roughness: .15, bumpMap: bump('spiral', 64, 64, (x, w, h) => { for (let i = 0; i < h; i += 8) { x.fillStyle = (i / 8) % 2 ? '#fff' : '#000'; x.fillRect(0, i, w, 8); } }, [1, 1]), bumpScale: .02 })); horn.rotation.x = .35; at(horn, 0, 1.76, .44); g.add(horn);
    const sh = new T.Group(); at(sh, 0, 1.64, .53); g.add(sh);
    for (const s of [-1, 1]) { const fr = mesh(extrude(roundRect(.13, .08, .02), .012, .006), M.gloss('#d86aff')); at(fr, s * .075, 0, 0); sh.add(fr); for (let i = 0; i < 4; i++) { const bar = mesh(new T.BoxGeometry(.13, .008, .02), M.gloss('#f2f2ff')); at(bar, s * .075, -.028 + i * .019, .015); sh.add(bar); } }
    const pack = new T.Group(); at(pack, 0, 1.0, -.38); g.add(pack);
    const tank = M.gloss('#d84a3a', { roughness: .25 }), steel = M.metal('#b8bcc4');
    for (const s of [-1, 1]) { const t2 = mesh(cyl(.09, .09, .38, 24), tank); at(t2, s * .1, 0, 0); pack.add(t2); const capT = mesh(sph(.09, 20, 12), tank); at(capT, s * .1, .19, 0); pack.add(capT); const noz = mesh(cyl(.05, .08, .1, 20), steel); at(noz, s * .1, -.24, 0); pack.add(noz); const f = flame(.45); at(f, s * .1, -.28, 0); pack.add(f); rig.flames.push(f); }
    const strap = mesh(new T.TorusGeometry(.32, .03, 6, 32), M.satin('#2a2a2a')); strap.rotation.y = PI / 2; strap.scale.set(1, 1, .8); at(strap, 0, .95, -.05); g.add(strap);
    for (const [x, z] of [[-.15, .22], [.15, .22], [-.15, -.3], [.15, -.3]]) { const p = new T.Group(); at(p, x, .62, z); const l = mesh(cyl(.065, .05, .58), wool); at(l, 0, -.29, 0); p.add(l); const hoof = mesh(cyl(.05, .06, .06), M.gloss('#3a2a3a')); at(hoof, 0, -.6, 0); p.add(hoof); g.add(p); rig.legs.push({ o: p, s: x * z > 0 ? 1 : -1, amp: .45 }); }
    eyes(g, .045, .09, 1.66, .44, '#2a1a3a', null, .6);
    return { group: g, rig };
  };
  // 11 Raccoonini – Waschbär-Rapper mit Mütze, Kapuzenjacke und Goldkette
  B.raccoon = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const furG = fur('rac', '#8a8a90', 'rgba(40,40,46,.55)', 'rgba(230,230,235,.5)');
    const hoodie = M.satin('#17171c', { roughness: .85, bumpMap: noiseB('knitH', 2600, .4, 1.2), bumpScale: .008 });
    const torso = mesh(lathe([[0, 0], [.34, .02], [.38, .25], [.36, .5], [.3, .66], [.18, .72], [0, .73]], 32), hoodie); at(torso, 0, .62, 0); g.add(torso);
    const hood = mesh(new T.TorusGeometry(.22, .07, 10, 24), hoodie); hood.rotation.x = PI / 2; at(hood, 0, 1.3, -.04); g.add(hood);
    g.add(at(chain(.2, 13), 0, 1.28, .2));
    const pend = mesh(cyl(.06, .06, .02, 6), M.metal('#ffcb3a', { roughness: .15 })); pend.rotation.x = PI / 2; at(pend, 0, 1.06, .3); g.add(pend);
    const mask = tex('racmask', 256, 128, (x, w, h) => { x.fillStyle = '#9a9aa0'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2f2f4'; x.beginPath(); x.ellipse(64, 80, 34, 40, 0, 0, 7); x.fill(); x.fillStyle = '#1a1a1e'; x.beginPath(); x.ellipse(64, 66, 54, 20, 0, 0, 7); x.fill(); seed = 61; x.lineWidth = 1; for (let i = 0; i < 1500; i++) { const px = rnd() * w, py = rnd() * h; x.strokeStyle = rnd() < .5 ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.2)'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 1, py + 4); x.stroke(); } });
    const head = mesh(sph(.3, 40, 30), M.satin('#ffffff', { map: mask, roughness: .85, bumpMap: furB(), bumpScale: .015 })); head.rotation.y = -PI / 2 + .02; head.scale.set(1.05, .92, 1); at(head, 0, 1.55, .04); g.add(head);
    const snout = mesh(sph(.12), M.satin('#eeeef0', { roughness: .85 })); snout.scale.set(1, .8, 1.2); at(snout, 0, 1.47, .3); g.add(snout);
    const nose = mesh(sph(.045), M.gloss('#111')); nose.scale.set(1.3, .9, 1); at(nose, 0, 1.51, .43); g.add(nose);
    eyes(g, .07, .11, 1.6, .25, '#3a2414', null, .3);
    for (const s of [-1, 1]) { const ear = mesh(sph(.08), furG); ear.scale.set(1, 1.1, .4); at(ear, s * .2, 1.82, -.02); g.add(ear); }
    const beanie = mesh(new T.SphereGeometry(.31, 32, 16, 0, PI * 2, 0, PI * .5), M.satin('#121216', { roughness: .95, bumpMap: bump('knit', 64, 64, (x, w, h) => { x.fillStyle = '#888'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = '#fff'; x.fillRect(i, 0, 4, h); } }, [12, 4]), bumpScale: .02 })); beanie.scale.set(1.05, .9, 1.05); at(beanie, 0, 1.66, 0); beanie.rotation.x = -.15; g.add(beanie);
    const cuff = mesh(new T.TorusGeometry(.3, .045, 8, 32), M.satin('#121216', { roughness: .95 })); cuff.rotation.x = PI / 2 - .15; at(cuff, 0, 1.68, .0); g.add(cuff);
    for (const s of [-1, 1]) { const a = new T.Group(); at(a, s * .38, 1.2, 0); const sl = mesh(cyl(.09, .075, .42, 16), hoodie); at(sl, 0, -.2, 0); a.add(sl); const hand = mesh(sph(.075), M.satin('#2a2a2e')); at(hand, 0, -.44, .02); a.add(hand); a.rotation.z = s * .18; g.add(a); rig.wings.push({ o: a, s, amp: .2, base: s * .18 }); }
    const tail = new T.Group(); at(tail, 0, .75, -.3); g.add(tail);
    const tt = tex('ringtail', 64, 256, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#2a2a2e' : '#9a9aa2'; x.fillRect(0, i * h / 8, w, h / 8); } });
    tail.add(mesh(taperTube(curve([[0, 0, 0], [0, -.1, -.25], [0, .05, -.5], [0, .3, -.6]]), .1, 30, 14, t => 1 - Math.abs(t - .45) * .8), M.satin('#ffffff', { map: tt, roughness: .9, bumpMap: furB(), bumpScale: .02 })));
    rig.wig.push({ o: tail, ph: 0, amp: .25, axis: 'z' });
    const jeans = '#2a3a5a';
    for (const s of [-1, 1]) { const L = leg(.62, jeans, '#141414', '#e8e8e8', .1); at(L.pivot, s * .15, .64, 0); g.add(L.pivot); rig.legs.push({ o: L.pivot, s, amp: .55, knee: L.knee }); }
    return { group: g, rig };
  };
  // 12 Polpo Cappuccino – Oktopus mit Cappuccino-Tassen-Kopf und Latte-Art
  B.polpo = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const cer = M.gloss('#c98a52', { roughness: .25, clearcoat: 1 });
    const cupG = new T.Group(); at(cupG, 0, .62, 0); g.add(cupG);
    const cup = mesh(lathe([[0, 0], [.22, 0], [.3, .05], [.42, .4], [.5, .78], [.48, .8], [0, .8]], 48), cer); cupG.add(cup);
    const art = tex('latte', 256, 256, (x, w, h) => { const gr = x.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, '#f6e8d6'); gr.addColorStop(.75, '#d4a070'); gr.addColorStop(1, '#8a5428'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fbf3e6'; for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(128, 160 - i * 26, 60 - i * 10, 26 - i * 3, 0, 0, PI); x.fill(); x.fillStyle = i % 2 ? '#fbf3e6' : '#c89060'; } x.strokeStyle = '#fbf3e6'; x.lineWidth = 6; x.beginPath(); x.moveTo(128, 200); x.lineTo(128, 60); x.stroke(); });
    const foam = mesh(new T.CircleGeometry(.48, 48), M.satin('#ffffff', { map: art, roughness: .6 }), false); foam.rotation.x = -PI / 2; at(foam, 0, .78, 0); cupG.add(foam);
    const handle = mesh(new T.TorusGeometry(.14, .045, 12, 24, PI * 1.3), cer); handle.rotation.z = -PI * .65; at(handle, .48, .48, 0); cupG.add(handle);
    eyes(cupG, .11, .13, .48, .38, '#3a1a08', null, .3);
    for (const s of [-1, 1]) { const brow = mesh(new T.BoxGeometry(.16, .035, .03), M.satin('#3a2010')); at(brow, s * .14, .64, .44); brow.rotation.z = s * .35; cupG.add(brow); }
    const m = mesh(new T.TorusGeometry(.07, .015, 8, 20, PI), M.satin('#3a1a0a')); at(m, 0, .3, .43); cupG.add(m);
    const sauc = mesh(lathe([[0, 0], [.48, 0], [.6, .05], [.58, .06], [0, .03]], 48), M.gloss('#f4ece2')); at(sauc, 0, .58, 0); g.add(sauc);
    const skin = M.gloss('#d47a3a', { roughness: .35, clearcoat: .8, bumpMap: noiseB('octo2', 700, 1, 3), bumpScale: .008 }), suck = M.satin('#f2c8a0');
    seed = 23;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * PI * 2 + .2, dx = Math.cos(a), dz = Math.sin(a), w = new T.Group(); at(w, dx * .22, .62, dz * .22); g.add(w);
      const pts = [[0, 0, 0], [dx * .2, -.25, dz * .2], [dx * .38, -.52, dz * .38], [dx * .56, -.6, dz * .56], [dx * .7 + dz * .1, -.5 + rnd() * .12, dz * .7 - dx * .1]];
      const path = curve(pts); w.add(mesh(taperTube(path, .1, 40, 12, t => 1 - t * .82), skin));
      for (let k = 1; k < 6; k++) { const p = path.getPointAt(k / 7); const s = mesh(cyl(.024 * (1 - k * .1), .024 * (1 - k * .1), .015, 12), suck, false); at(s, p.x, p.y - .07 * (1 - k * .12), p.z); w.add(s); }
      rig.wig.push({ o: w, ph: i * .8, amp: .18 });
    }
    rig.steam = []; for (let i = 0; i < 3; i++) { const s = mesh(sph(.06), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .4, depthWrite: false }), false); g.add(s); rig.steam.push(s); } rig.steamAt = [0, 1.45, 0];
    return { group: g, rig };
  };
  // 13 Hippo Ballerina – Nilpferd im rosa Tutu mit Krönchen
  B.hippo = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const skin = M.gloss('#8a7a90', { roughness: .45, clearcoat: .4, bumpMap: noiseB('hippo', 1500, .5, 2.5), bumpScale: .008 }), pinkS = M.satin('#e8a0b0', { roughness: .6 });
    const body = mesh(sph(.42, 40, 30), skin); body.scale.set(1, 1.12, .95); at(body, 0, .86, 0); g.add(body);
    const head = mesh(sph(.3, 40, 30), skin); head.scale.set(1.05, .9, 1.05); at(head, 0, 1.48, .06); g.add(head);
    const muzzle = mesh(sph(.24, 40, 30), skin); muzzle.scale.set(1.25, .8, 1); at(muzzle, 0, 1.36, .28); g.add(muzzle);
    for (const s of [-1, 1]) { const n = mesh(sph(.035), M.satin('#3a2a3a')); at(n, s * .09, 1.45, .5); g.add(n); const ear = mesh(sph(.07), pinkS); ear.scale.set(.8, 1, .5); at(ear, s * .2, 1.72, 0); g.add(ear); const ch = mesh(sph(.07), M.satin('#f0a0b8', { transparent: true, opacity: .5 })); ch.scale.set(1, .6, .4); at(ch, s * .25, 1.38, .3); g.add(ch); }
    eyes(g, .07, .12, 1.6, .26, '#3a2a1a', '#7a6a80', .25);
    const tiara = new T.Group(); at(tiara, 0, 1.75, .05); g.add(tiara); const gold = M.metal('#ffd24a', { roughness: .15 });
    tiara.add(mesh(new T.TorusGeometry(.13, .012, 6, 24, PI), gold)); for (let i = 0; i < 5; i++) { const a = .3 + i / 4 * (PI - .6); const sp = mesh(new T.ConeGeometry(.018, .07 + (i === 2 ? .04 : 0), 8), gold); at(sp, Math.cos(a) * .13, Math.sin(a) * .13 + .03, 0); tiara.add(sp); } const gem = mesh(sph(.025), M.gloss('#ff4aa0', { roughness: 0 })); at(gem, 0, .19, .01); tiara.add(gem); tiara.rotation.x = -.3;
    const tulle = new T.MeshPhysicalMaterial({ color: '#ff8ab8', roughness: .7, transparent: true, opacity: .82, side: T.DoubleSide });
    for (let k = 0; k < 4; k++) { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * PI * 2; pts.push(new T.Vector2(.42 + k * .07 + Math.sin(a * 16 + k) * .03, 0)); } const sk = mesh(new T.CylinderGeometry(.36, .62 + k * .08, .12, 64, 1, true), tulle); const p = sk.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); if (y < 0) { const a = Math.atan2(z, x); p.setY(i, y + Math.sin(a * 14 + k * 2) * .035); } } sk.geometry.computeVertexNormals(); at(sk, 0, .8 - k * .03, 0); g.add(sk); }
    const bod = mesh(cyl(.4, .43, .3, 40), M.satin('#ff7aaa', { roughness: .5 })); at(bod, 0, .98, 0); g.add(bod);
    for (const s of [-1, 1]) { const a = new T.Group(); at(a, s * .4, 1.12, 0); const ar = mesh(cyl(.09, .07, .42, 16), skin); at(ar, 0, .2, 0); a.add(ar); const h = mesh(sph(.08), skin); at(h, 0, .44, 0); a.add(h); a.rotation.z = -s * .6; g.add(a); rig.wings.push({ o: a, s, amp: .35, base: -s * .6 }); }
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .16, .55, 0); const l = mesh(cyl(.1, .085, .45, 16), skin); at(l, 0, -.22, 0); p.add(l); const sh = mesh(sph(.1), M.gloss('#ff9ac0', { roughness: .3 })); sh.scale.set(.9, .5, 1.4); at(sh, 0, -.47, .05); p.add(sh); const rib = mesh(new T.TorusGeometry(.09, .01, 6, 16), M.satin('#ff9ac0')); rib.rotation.x = PI / 2; at(rib, 0, -.35, 0); p.add(rib); g.add(p); rig.legs.push({ o: p, s, amp: .45 }); }
    return { group: g, rig };
  };
  // 14 Scheletro Cowboy – Skelett mit Cowboyhut auf einem Esel
  B.cowboy = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const bone = M.satin('#efe6d2', { roughness: .55, bumpMap: noiseB('bone', 900, .5, 2), bumpScale: .006 });
    const donkey = fur('donkey', '#8a8070', 'rgba(60,50,40,.5)', 'rgba(220,210,190,.4)');
    const body = mesh(sph(.4, 40, 30), donkey); body.scale.set(.75, .65, 1.25); at(body, 0, .72, -.05); g.add(body);
    const neck = mesh(cyl(.13, .16, .45, 20), donkey); neck.rotation.x = .7; at(neck, 0, .98, .38); g.add(neck);
    const dh = mesh(sph(.16), donkey); dh.scale.set(.85, .9, 1.5); dh.rotation.x = .5; at(dh, 0, 1.13, .58); g.add(dh);
    const muz = mesh(sph(.11), M.satin('#d8d0c4', { roughness: .8 })); muz.scale.set(.9, .8, 1); at(muz, 0, 1.02, .74); g.add(muz);
    for (const s of [-1, 1]) { const ear = mesh(lathe([[0, 0], [.05, .05], [.045, .2], [0, .28]], 14), donkey); ear.rotation.z = -s * .35; ear.rotation.x = -.3; at(ear, s * .08, 1.24, .5); g.add(ear); }
    eyes(g, .045, .12, 1.18, .62, '#2a1a10', '#6a5a4a', .7);
    const mane = mesh(new T.BoxGeometry(.05, .16, .4), M.satin('#3a2a1a', { roughness: 1 })); mane.rotation.x = .7; at(mane, 0, 1.12, .32); g.add(mane);
    for (const [x, z] of [[-.15, .28], [.15, .28], [-.15, -.35], [.15, -.35]]) { const p = new T.Group(); at(p, x, .52, z); const l = mesh(cyl(.06, .045, .48), donkey); at(l, 0, -.24, 0); p.add(l); const hf = mesh(cyl(.045, .055, .05), M.gloss('#1a1410')); at(hf, 0, -.5, 0); p.add(hf); g.add(p); rig.legs.push({ o: p, s: x * z > 0 ? 1 : -1, amp: .4 }); }
    const saddle = mesh(new T.SphereGeometry(.3, 24, 12, 0, PI * 2, 0, PI * .3), M.satin('#7a3a1a', { roughness: .5 })); saddle.scale.set(.9, 1, 1.1); at(saddle, 0, .83, -.08); g.add(saddle);
    // Skelett-Reiter
    const rider = new T.Group(); at(rider, 0, .98, -.1); g.add(rider);
    const spine = mesh(cyl(.025, .025, .5, 8), bone); at(spine, 0, .3, 0); rider.add(spine);
    for (let i = 0; i < 5; i++) { const rib = mesh(new T.TorusGeometry(.13 - i * .012, .016, 6, 20), bone); rib.rotation.x = PI / 2; rib.scale.set(1, .75, 1); at(rib, 0, .48 - i * .07, .03); rider.add(rib); }
    const pelvis = mesh(new T.TorusGeometry(.1, .03, 8, 16), bone); pelvis.rotation.x = PI / 2; at(pelvis, 0, .05, 0); rider.add(pelvis);
    const skull = mesh(sph(.15, 32, 24), bone); skull.scale.set(.95, 1, 1.05); at(skull, 0, .72, .02); rider.add(skull);
    const jaw = mesh(sph(.1), bone); jaw.scale.set(1, .55, 1); at(jaw, 0, .6, .07); rider.add(jaw);
    const dark = M.satin('#141010');
    for (const s of [-1, 1]) { const so = mesh(sph(.045), dark); so.scale.set(1, 1.1, .5); at(so, s * .055, .73, .14); rider.add(so); const gl = mesh(sph(.012), new T.MeshBasicMaterial({ color: '#ff5a2a' })); at(gl, s * .055, .73, .16); rider.add(gl); }
    const nose = mesh(new T.ConeGeometry(.02, .04, 3), dark); nose.rotation.x = PI; at(nose, 0, .67, .16); rider.add(nose);
    for (let i = 0; i < 6; i++) { const tooth = mesh(new T.BoxGeometry(.016, .022, .01), M.satin('#fffaf0')); at(tooth, -.04 + i * .016, .615, .155); rider.add(tooth); }
    const hat = new T.Group(); at(hat, 0, .85, 0); hat.rotation.x = -.1; rider.add(hat); const felt = M.satin('#6a4424', { roughness: .8, bumpMap: noiseB('felt', 1200, .3, 1), bumpScale: .004 });
    const brim = mesh(lathe([[0, 0], [.3, -.01], [.34, .05], [.32, .04], [0, .01]], 40), felt); brim.scale.set(1, 1, .85); hat.add(brim);
    const crown = mesh(lathe([[.14, 0], [.15, .12], [.12, .18], [0, .16]], 32), felt); hat.add(crown); const band = mesh(cyl(.15, .15, .03, 32, 1, true), M.satin('#2a1a10')); at(band, 0, .03, 0); hat.add(band);
    const scarf = mesh(new T.ConeGeometry(.16, .16, 3), M.satin('#c82a2a', { roughness: .8 })); scarf.rotation.x = PI; scarf.rotation.y = PI / 3; at(scarf, 0, .5, .08); rider.add(scarf);
    for (const s of [-1, 1]) { const a = new T.Group(); at(a, s * .14, .5, 0); const up = mesh(cyl(.02, .02, .26, 6), bone); at(up, 0, -.12, .05); up.rotation.x = -.4; a.add(up); const lo = mesh(cyl(.018, .018, .24, 6), bone); lo.rotation.x = -1.3; at(lo, 0, -.25, .2); a.add(lo); g.add(a); rider.add(a); rig.wings.push({ o: a, s, amp: .15, base: 0 }); const lg = mesh(cyl(.022, .02, .4, 6), bone); lg.rotation.z = s * .5; at(lg, s * .18, -.12, 0); rider.add(lg); }
    return { group: g, rig };
  };

  // Hühnerbein (für Espressino)
  function chickenLeg(len) {
    const pivot = new T.Group(), sk = M.satin('#f2a41a', { roughness: .5, bumpMap: noiseB('scaly', 1400, .5, 1.5), bumpScale: .008 });
    const fl = mesh(sph(.13), M.satin('#fff8ee', { roughness: .9, bumpMap: noiseB('feath3', 1500, .5, 2), bumpScale: .02 })); fl.scale.set(1, 1.2, 1); at(fl, 0, -.05, 0); pivot.add(fl);
    const sh = mesh(cyl(.035, .03, len), sk); at(sh, 0, -len / 2 - .08, 0); pivot.add(sh);
    for (const a of [-.55, 0, .55]) { const toe = mesh(cyl(.022, .012, .2, 8), sk); toe.rotation.x = PI / 2; toe.rotation.y = a; at(toe, Math.sin(a) * .08, -len - .08, Math.cos(a) * .09); pivot.add(toe); }
    const back = mesh(cyl(.02, .01, .1, 8), sk); back.rotation.x = -PI / 2.4; at(back, 0, -len - .06, -.06); pivot.add(back);
    return pivot;
  }
  // 15 Espressino Gallinone – Espressomaschine auf Hühnerbeinen mit Hahnenkamm
  B.espressino = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const red = M.gloss('#c8141e', { roughness: .22 }), chrome = M.metal('#e2e5ea', { roughness: .15 }), dark = M.gloss('#1a1a1e', { roughness: .4 });
    const body = mesh(extrude(roundRect(.9, .78, .12), .7, .06), red); at(body, 0, 1.08, 0); g.add(body);
    const top = mesh(extrude(roundRect(.94, .7, .05), .08, .03), chrome); top.rotation.x = PI / 2; at(top, 0, 1.5, 0); g.add(top);
    const panel = mesh(extrude(roundRect(.7, .34, .05), .02, .01), chrome); at(panel, 0, 1.24, .37); g.add(panel);
    eyes(g, .1, .14, 1.26, .41, '#2a1a0a', null, .15);
    const grp = mesh(cyl(.1, .12, .1, 24), chrome); at(grp, 0, .86, .3); g.add(grp);
    const pf = mesh(cyl(.09, .07, .08, 24), chrome); at(pf, 0, .78, .32); g.add(pf);
    const hdl = mesh(cyl(.035, .045, .42, 12), dark); hdl.rotation.z = PI / 2; hdl.rotation.y = -.5; at(hdl, .22, .78, .44); g.add(hdl);
    const tray = mesh(extrude(roundRect(.86, .3, .04), .05, .02), chrome); tray.rotation.x = PI / 2; at(tray, 0, .66, .3); g.add(tray);
    const cup = mesh(lathe([[0, 0], [.07, 0], [.09, .1], [.08, .11], [0, .11]], 24), M.gloss('#ffffff')); at(cup, 0, .68, .32); g.add(cup);
    const wand = mesh(new T.TubeGeometry(curve([[.42, 1.3, .2], [.5, 1.1, .25], [.5, .85, .3]]), 16, .018, 8), chrome); g.add(wand);
    const comb = new T.Group(); at(comb, 0, 1.56, 0); g.add(comb);
    for (let i = 0; i < 4; i++) { const c = mesh(sph(.09), M.gloss('#ff2a2a', { roughness: .3 })); c.scale.set(.5, 1, 1); at(c, 0, .04 + Math.sin(i / 3 * PI) * .06, -.18 + i * .12); comb.add(c); }
    const wat = mesh(sph(.07), M.gloss('#ff2a2a')); wat.scale.set(.6, 1.2, .6); at(wat, 0, 1.0, .4); g.add(wat);
    const beak = mesh(new T.ConeGeometry(.06, .16, 16), M.gloss('#ffb020')); beak.rotation.x = PI / 2; at(beak, 0, 1.12, .46); g.add(beak);
    for (const s of [-1, 1]) { const p = chickenLeg(.46); at(p, s * .2, .66, 0); g.add(p); rig.legs.push({ o: p, s, amp: .6 }); }
    rig.steam = []; for (let i = 0; i < 3; i++) { const s = mesh(sph(.06), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .4, depthWrite: false }), false); g.add(s); rig.steam.push(s); } rig.steamAt = [0, .82, .32];
    return { group: g, rig };
  };
  // 16 Cactopudel Skatini – Pudel aus Kaktus mit Blüte, Sonnenbrille und Skateboard
  B.cactopudel = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const cact = tex('cactus', 128, 128, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2a8a3a'); gr.addColorStop(.5, '#4ab84a'); gr.addColorStop(1, '#2a8a3a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(20,70,30,.5)'; for (let i = 0; i < w; i += 16) x.fillRect(i, 0, 3, h); }, [4, 2]);
    const cm = M.satin('#ffffff', { map: cact, roughness: .5, bumpMap: noiseB('cactB', 500, 1, 3), bumpScale: .01 }), spine = M.satin('#fff6d8');
    const pom = (r, x, y, z, sc) => { const m = mesh(sph(r, 28, 20), cm); if (sc) m.scale.set(sc[0], sc[1], sc[2]); at(m, x, y, z); g.add(m); seed = (x * 100 + y * 77 + 3) | 0 || 5; for (let i = 0; i < 18; i++) { const a = rnd() * 7, b = rnd() * PI, d = V(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)), sp = mesh(new T.ConeGeometry(.008, .07, 4), spine, false); sp.position.set(x + d.x * r * (sc ? sc[0] : 1), y + d.y * r * (sc ? sc[1] : 1), z + d.z * r * (sc ? sc[2] : 1)); sp.quaternion.setFromUnitVectors(V(0, 1, 0), d); g.add(sp); } return m; };
    pom(.3, 0, .95, -.1, [1, .9, 1.3]); pom(.24, 0, 1.38, .28); pom(.18, 0, 1.62, .25); pom(.16, 0, 1.05, -.55);
    const snout = mesh(sph(.12), cm); snout.scale.set(.8, .7, 1.3); at(snout, 0, 1.33, .5); g.add(snout); const nose = mesh(sph(.04), M.gloss('#1a1a1a')); at(nose, 0, 1.35, .64); g.add(nose);
    for (const s of [-1, 1]) { const ear = mesh(sph(.12, 20, 14), cm); ear.scale.set(.6, 1.3, .7); at(ear, s * .24, 1.3, .2); g.add(ear); }
    const fl = new T.Group(); at(fl, .08, 1.8, .22); g.add(fl); for (let i = 0; i < 6; i++) { const pt = mesh(sph(.07, 14, 10), M.satin('#ff5aa8', { roughness: .5 })); pt.scale.set(.5, .2, 1); const a = i / 6 * PI * 2; at(pt, Math.cos(a) * .07, 0, Math.sin(a) * .07); pt.rotation.y = -a; fl.add(pt); } const ctr = mesh(sph(.04), M.satin('#ffd23a')); fl.add(ctr);
    const sh = shades(.42, '#101018', '#ff3a9a'); at(sh, 0, 1.46, .5); g.add(sh);
    const board = new T.Group(); at(board, 0, .12, -.05); g.add(board);
    const deck = mesh(extrude(roundRect(.36, 1.2, .17), .04, .015), M.satin('#ffffff', { map: tex('deck', 64, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff3a9a'); gr.addColorStop(.5, '#ffd23a'); gr.addColorStop(1, '#3ad0ff'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, [1, 1]), roughness: .5 })); deck.rotation.x = PI / 2; board.add(deck);
    for (const [x, z] of [[-.13, .4], [.13, .4], [-.13, -.4], [.13, -.4]]) { const wh = mesh(cyl(.05, .05, .05, 16), M.gloss('#ffffff')); wh.rotation.z = PI / 2; at(wh, x, -.07, z); board.add(wh); }
    for (const [x, z] of [[-.14, .2], [.14, .2], [-.14, -.32], [.14, -.32]]) { const p = new T.Group(); at(p, x, .62, z); const l = mesh(cyl(.06, .05, .42), cm); at(l, 0, -.21, 0); p.add(l); const paw = mesh(sph(.08), cm); at(paw, 0, -.44, .02); p.add(paw); g.add(p); rig.legs.push({ o: p, s: x * z > 0 ? 1 : -1, amp: .25 }); }
    rig.board = board;
    return { group: g, rig };
  };
  // 17 Lasagnone Aviatore – fliegende Lasagne mit Pilotenmütze, Brille, Schal und Propeller
  B.lasagnone = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const block = new T.Group(); at(block, 0, .5, 0); g.add(block);
    const pasta = M.satin('#f2c66a', { roughness: .55, bumpMap: noiseB('pastaB', 700, 1, 3), bumpScale: .01 }), sauce = M.gloss('#b8261a', { roughness: .3 }), bech = M.satin('#fff2dc', { roughness: .7 });
    for (let i = 0; i < 4; i++) { const y = i * .24; const p = mesh(extrude(roundRect(.9, .7, .05), .06, .02), pasta); p.rotation.x = PI / 2; at(p, 0, y + .06, 0); block.add(p); const s = mesh(extrude(roundRect(.86, .66, .05), .1, .02), i % 2 ? bech : sauce); s.rotation.x = PI / 2; at(s, 0, y + .16, 0); block.add(s); for (let k = 0; k < 6; k++) { const wv = mesh(sph(.06, 10, 8), pasta); wv.scale.set(1.2, .5, .6); at(wv, -.38 + k * .15, y + .06, .36); block.add(wv); } }
    const cheese = mesh(extrude(roundRect(.92, .72, .08), .08, .04), M.satin('#ffcf5a', { roughness: .45, bumpMap: noiseB('melt', 400, 3, 9), bumpScale: .03 })); cheese.rotation.x = PI / 2; at(cheese, 0, 1.02, 0); block.add(cheese);
    const basil = mesh(sph(.08, 12, 8), M.satin('#2a8a2a')); basil.scale.set(1.3, .2, .8); at(basil, .2, 1.08, .1); block.add(basil);
    eyes(block, .1, .17, .6, .38, '#3a2410', null, .12);
    const m = mesh(new T.TorusGeometry(.09, .016, 8, 20, PI * .8), M.satin('#3a0a0a')); m.rotation.z = PI * 1.1; at(m, 0, .4, .38); block.add(m);
    const cap = mesh(new T.SphereGeometry(.32, 28, 14, 0, PI * 2, 0, PI * .5), M.satin('#6a4024', { roughness: .55, bumpMap: noiseB('leatherB2', 2000, .3, 1.2), bumpScale: .008 })); cap.scale.set(1.25, .6, 1); at(cap, 0, 1.1, -.02); block.add(cap);
    const gog = new T.Group(); at(gog, 0, 1.2, .26); gog.rotation.x = -.35; block.add(gog);
    for (const s of [-1, 1]) { const rim = mesh(cyl(.09, .09, .06, 24), M.metal('#9a9aa2')); rim.rotation.x = PI / 2; at(rim, s * .12, 0, 0); gog.add(rim); const gl = mesh(sph(.075, 24, 12), M.gloss('#ffb84a', { roughness: .02, transparent: true, opacity: .7 })); gl.scale.set(1, 1, .4); at(gl, s * .12, 0, .035); gog.add(gl); }
    const scarf = mesh(new T.TubeGeometry(curve([[-.4, .3, .3], [0, .25, .42], [.4, .3, .3], [.45, .25, -.1], [.6, .2, -.5]]), 30, .045, 8), M.satin('#ffffff', { roughness: .8 })); block.add(scarf);
    const prop = new T.Group(); at(prop, 0, 1.3, -.02); block.add(prop); const hub = mesh(cyl(.03, .03, .12, 10), M.metal('#d0d4da')); at(hub, 0, -.04, 0); prop.add(hub);
    for (const s of [-1, 1]) { const bl = mesh(new T.BoxGeometry(.5, .015, .07), M.gloss('#3a3a44')); at(bl, s * .25, .03, 0); prop.add(bl); }
    for (const s of [-1, 1]) { const w = new T.Group(); at(w, s * .48, .55, -.05); const wg = mesh(extrude(roundRect(.5, .18, .07), .03, .015), M.gloss('#3ab0ff')); wg.rotation.x = PI / 2; at(wg, s * .25, 0, 0); w.add(wg); block.add(w); rig.wings.push({ o: w, s, amp: .25, base: 0 }); }
    for (const s of [-1, 1]) { const p = new T.Group(); at(p, s * .2, .5, 0); const l = mesh(cyl(.05, .045, .36), M.satin('#f2c66a')); at(l, 0, -.18, 0); p.add(l); const boot = mesh(sph(.09), M.gloss('#2a1a10')); boot.scale.set(1, .6, 1.5); at(boot, 0, -.4, .05); p.add(boot); g.add(p); rig.legs.push({ o: p, s, amp: .5 }); }
    rig.prop = prop; rig.hover = block;
    return { group: g, rig };
  };
  // 18 Formaggino Topolone – Maus, deren Körper ein Käse-Keil ist
  B.formaggino = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const ch = tex('cheese', 256, 256, (x, w, h) => { x.fillStyle = '#ffc83a'; x.fillRect(0, 0, w, h); seed = 71; for (let i = 0; i < 26; i++) { const cx = rnd() * w, cy = rnd() * h, r = 6 + rnd() * 16, gr = x.createRadialGradient(cx - r * .3, cy - r * .3, 1, cx, cy, r); gr.addColorStop(0, '#c8901a'); gr.addColorStop(1, '#e8a82a'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } });
    const chB = bump('cheeseB', 256, 256, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); seed = 71; for (let i = 0; i < 26; i++) { const cx = rnd() * w, cy = rnd() * h, r = 6 + rnd() * 16; x.fillStyle = '#000'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } });
    const wedge = new T.Shape(); wedge.moveTo(-.45, 0); wedge.lineTo(.45, 0); wedge.lineTo(.45, .55); wedge.lineTo(-.45, 1.05); wedge.closePath();
    const wg = new T.ExtrudeGeometry(wedge, { depth: .7, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 4 }); wg.translate(0, 0, -.35); wg.computeVertexNormals();
    const body = mesh(wg, M.satin('#ffffff', { map: ch, roughness: .45, bumpMap: chB, bumpScale: .04 })); body.rotation.y = -PI / 2; at(body, 0, .42, 0); g.add(body);
    const fur = M.satin('#9a96a0', { roughness: .8, bumpMap: noiseB('mouseF', 2200, .4, 1.2), bumpScale: .01 }), pink = M.satin('#ffa0b4', { roughness: .6 });
    const head = mesh(sph(.24, 32, 24), fur); head.scale.set(1, .92, 1.15); at(head, 0, 1.22, .42); g.add(head);
    const snout = mesh(new T.ConeGeometry(.15, .3, 24), fur); snout.rotation.x = PI / 2; at(snout, 0, 1.16, .7); g.add(snout); const nose = mesh(sph(.045), pink); at(nose, 0, 1.16, .85); g.add(nose);
    for (const s of [-1, 1]) { const ear = mesh(cyl(.2, .2, .03, 32), fur); ear.rotation.x = PI / 2; at(ear, s * .22, 1.44, .34); g.add(ear); const inner = mesh(cyl(.14, .14, .03, 32), pink); inner.rotation.x = PI / 2; at(inner, s * .22, 1.44, .36); g.add(inner); for (let k = 0; k < 3; k++) { const wh = mesh(cyl(.004, .004, .32, 4), M.satin('#2a2a2a')); wh.rotation.z = PI / 2 + (k - 1) * .2; at(wh, s * .2, 1.16 + (k - 1) * .03, .72); g.add(wh); } }
    eyes(g, .07, .1, 1.28, .62, '#1a1a1a', null, .2);
    const tail = mesh(taperTube(curve([[0, .5, -.4], [0, .35, -.7], [0, .6, -.95], [0, .9, -.9]]), .035, 30, 8, t => 1 - t * .7), pink); g.add(tail); rig.wig.push({ o: tail, ph: 0, amp: .1, axis: 'z' });
    for (const s of [-1, 1]) { const a = new T.Group(); at(a, s * .48, .9, .1); const ar = mesh(cyl(.04, .035, .3, 10), fur); at(ar, 0, -.14, 0); a.add(ar); a.rotation.z = s * .5; g.add(a); rig.wings.push({ o: a, s, amp: .3, base: s * .5 }); }
    for (const s of [-1, 1]) { const L = leg(.42, '#9a96a0', '#ff3a3a', '#ffffff', .055); at(L.pivot, s * .18, .44, 0); g.add(L.pivot); rig.legs.push({ o: L.pivot, s, amp: .55, knee: L.knee }); }
    return { group: g, rig };
  };
  // 19 Lavatrice Bulldoggo – Waschmaschine mit Bulldoggen-Kopf, Bullauge voller Schaum und Stachelhalsband
  B.lavatrice = () => {
    const g = new T.Group(), rig = { legs: [], wings: [], wig: [] };
    const white = M.gloss('#f2f2f4', { roughness: .25 }), chrome = M.metal('#d8dce2', { roughness: .18 });
    const body = mesh(extrude(roundRect(.86, .9, .1), .8, .06), white); at(body, 0, .82, 0); g.add(body);
    const ring = mesh(new T.TorusGeometry(.26, .05, 16, 40), chrome); at(ring, 0, .78, .5); g.add(ring);
    const water = mesh(new T.CircleGeometry(.25, 40), M.gloss('#3a9aff', { map: tex('suds', 128, 128, (x, w, h) => { x.fillStyle = '#2a7ae8'; x.fillRect(0, 0, w, h); seed = 81; for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(rnd() * w, rnd() * h * .6, 4 + rnd() * 10, 0, 7); x.fill(); } }, [1, 1]), roughness: .05 })); at(water, 0, .78, .49); g.add(water); rig.drum = water;
    const glass = mesh(sph(.25, 32, 16), M.gloss('#cfeaff', { roughness: 0, transparent: true, opacity: .25 })); glass.scale.set(1, 1, .3); at(glass, 0, .78, .5); g.add(glass);
    const knob = mesh(cyl(.06, .06, .05, 24), chrome); knob.rotation.x = PI / 2; at(knob, .28, 1.15, .5); g.add(knob);
    for (let i = 0; i < 3; i++) { const b = mesh(cyl(.02, .02, .03, 12), M.gloss(['#3ae07a', '#ffd23a', '#ff3a3a'][i])); b.rotation.x = PI / 2; at(b, -.3 + i * .08, 1.15, .5); g.add(b); }
    const tan = M.satin('#c89a6a', { roughness: .7, bumpMap: noiseB('dogF', 1600, .4, 1.4), bumpScale: .01 }), lightTan = M.satin('#eed8b8', { roughness: .7 });
    const head = mesh(sph(.34, 36, 28), tan); head.scale.set(1.15, .85, 1); at(head, 0, 1.6, .2); g.add(head);
    const muz = mesh(sph(.22, 32, 24), lightTan); muz.scale.set(1.4, .75, .9); at(muz, 0, 1.48, .45); g.add(muz);
    for (const s of [-1, 1]) { const jowl = mesh(sph(.13), lightTan); jowl.scale.set(1, .9, .8); at(jowl, s * .16, 1.42, .47); g.add(jowl); const ear = mesh(sph(.1), M.satin('#7a5232')); ear.scale.set(1.2, .5, .9); at(ear, s * .32, 1.83, .13); ear.rotation.z = s * .5; g.add(ear); }
    const nose = mesh(sph(.07), M.gloss('#1a1a1a')); nose.scale.set(1.4, .8, 1); at(nose, 0, 1.58, .6); g.add(nose);
    for (const s of [-1, 1]) { const tooth = mesh(new T.ConeGeometry(.025, .08, 8), M.gloss('#ffffff')); at(tooth, s * .1, 1.42, .6); g.add(tooth); }
    eyes(g, .07, .15, 1.72, .45, '#3a2010', '#a87a4a', .25);
    const collar = mesh(new T.TorusGeometry(.34, .05, 10, 32), M.satin('#1a1a1e')); collar.rotation.x = PI / 2; at(collar, 0, 1.28, 0); g.add(collar);
    for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2, sp = mesh(new T.ConeGeometry(.025, .07, 8), chrome); sp.position.set(Math.cos(a) * .39, 1.28, Math.sin(a) * .39); sp.rotation.z = -PI / 2; sp.rotation.y = -a; g.add(sp); }
    for (const [x, z] of [[-.3, .25], [.3, .25], [-.3, -.25], [.3, -.25]]) { const p = new T.Group(); at(p, x, .4, z); const l = mesh(cyl(.09, .08, .32), tan); at(l, 0, -.16, 0); p.add(l); const paw = mesh(sph(.1), lightTan); paw.scale.set(1, .55, 1.2); at(paw, 0, -.36, .03); p.add(paw); g.add(p); rig.legs.push({ o: p, s: x * z > 0 ? 1 : -1, amp: .35 }); }
    return { group: g, rig };
  };

  const LIST = [
    { id: 'pinguino', name: 'Pinguino Spaghettino', color: '#f0c35c', pitch: 1.25, say: ['Pinguino Spaghettino, scivolino sul cammino!', 'Forchettina, forchettona, la polpetta è la padrona!', 'Spaghettino, spaghettone, salto sopra il cornicione!', 'Pingu pingu, forchettone, ghiaccio nel minestrone!', 'Spaghetti sulla testa, oggi è sempre festa!'] },
    { id: 'toastini', name: 'Toastini Volantini', color: '#d9a85a', pitch: 1.4, say: ['Toastini Volantini, burro burro nei giardini!', 'Croccantino, croccantone, volo sopra il pentolone!', 'Briciolina! Briciolona! Il tostapane mi perdona!', 'Tostato, tostatissimo, volo velocissimo!', 'Burro sul cervello, che volo bello!'] },
    { id: 'lampadino', name: 'Lampadino Giraffino', color: '#ffd27a', pitch: .9, say: ['Lampadino Giraffino, accendino il collino!', 'Click clack, luce sul tetto, il giraffone è perfetto!', 'Lampadona, lampadella, ogni salto è una stella!', 'Lampadina accesa, giraffa sorpresa!', 'Watt watt watt, il collo fa crack!'] },
    { id: 'scarpone', name: 'Scarpone Lumacone', color: '#7a4a26', pitch: .7, say: ['Scarpone Lumacone, piano piano campione!', 'Lacci lacci, bava bava, la mia casa è una ciabatta!', 'Lumacone, scarponcino, arrivo sempre per ultimino!', 'Bava bava, scarpa brava, piano piano si arriva!', 'Stivalone, lumacone, il più lento del cantone!'] },
    { id: 'pizzarana', name: 'Pizzarana Saltarella', color: '#e8b04a', pitch: 1.15, say: ['Pizzarana Saltarella, mozzarella in padella!', 'Cra cra cra, margherita, salto salto tutta la vita!', 'Peperoncino, ranocchiona, ogni pizza è una corona!', 'Pizza rana, pizza rana, salto fino a Viareggio!', 'Margherita, quattro salti, cra cra cra!'] },
    { id: 'fenicottero', name: 'Fenicottero Ombrellone', color: '#ff8aa8', pitch: 1.05, say: ['Fenicottero Ombrellone, ombra rosa sul pallone!', 'Spiaggina, spiaggiona, una zampa è la padrona!', 'Ombrellino, ombrellone, ballo sopra il cornicione!', 'Rosa rosa, ombra ombrosa, la spiaggia è favolosa!', 'Una zampa, due zampette, salto sulle bancarelle!'] },
    { id: 'gelatone', name: 'Gelatone Tartarugone', color: '#bfe08a', pitch: .85, say: ['Gelatone Tartarugone, tre palline nel cialdone!', 'Pistacchio, fragola, stracciatella, la tartaruga è la più bella!', 'Lento lento, cono cono, ma il gelato è sempre buono!', 'Cono cono, sono buono, tre palline in un trono!', 'Lento lento, gelato contento!'] },
    { id: 'pturbo', name: 'Pinguino Turbo', color: '#4ab0ff', pitch: 1.3, say: ['Pinguino Turbo, vrooom vrooom, sopra il ghiaccio faccio boom!', 'Occhialoni, motorino, volo più veloce del vicino!', 'Turbo turbo, pinguinello, sono il re del cielo bello!', 'Turbo pingu, motore a gelato, decollo spericolato!', 'Fiuuu boom, pinguino in orbita!'] },
    { id: 'llama', name: 'Llama Jetpacko', color: '#d86aff', pitch: 1.2, say: ['Llama Jetpacko, arcobaleno nel sacco!', 'Fiuuuu! Corno, razzo, lana colorata, che volata!', 'Lamalama, jetpackino, sputo stelle sul cammino!', 'Lama lama, razzo in pigiama!', 'Arcobaleno nel motore, che sapore!'] },
    { id: 'raccoon', name: 'Raccoonini', color: '#9a9aa0', pitch: .95, say: ['Raccoonini, yo yo yo, la catena d’oro ce l’ho!', 'Spazzatura, rima dura, salto senza paura!', 'Berretto nero, coda a strisce, il mio flow non finisce!', 'Yo yo raccoonini, rubo tutti i panini!', 'Catena d’oro, rima di tesoro!'] },
    { id: 'polpo', name: 'Polpo Cappuccino', color: '#d47a3a', pitch: .8, say: ['Polpo Cappuccino, otto braccia e un biscottino!', 'Schiuma, schiuma, tentacolone, sono arrabbiato ma buono!', 'Blu blu blu, che bollore, il cappuccino è il mio amore!', 'Polpo arrabbiato, cappuccino ghiacciato!', 'Otto braccia, una schiuma, che confusione nella spuma!'] },
    { id: 'hippo', name: 'Hippo Ballerina', color: '#ff7aaa', pitch: 1.35, say: ['Hippo Ballerina, piroetta in cucina!', 'Tutù rosa, coroncina, sono la regina della piscina!', 'Plié, plié, ippopotamo, salto come un lampadario!', 'Ippopotamo ballerino, gira gira il tutù rosino!', 'Pesante ma elegante, ballo come un elefante!'] },
    { id: 'cowboy', name: 'Scheletro Cowboy', color: '#c82a2a', pitch: .75, say: ['Scheletro Cowboy, ossa ossa, asinello nella fossa!', 'Ihaa! Cappellone, cavallino, anzi no, è un asinino!', 'Clic clac, ginocchia secche, corro sopra le bistecche!', 'Ossa ossa, che scossa, l’asinello fa la mossa!', 'Yee-haw scheletrino, galoppo nel mulino!'] },
    { id: 'espressino', name: 'Espressino Gallinone', color: '#c8141e', pitch: .9, say: ['Espressino Gallinone! Coccodè, coccodè, il caffè è per me!', 'Pssshhh! Crema crema, gallina estrema!', 'Ristretto, ristrettone, uovo nel bollitore!', 'Gallina caffeina, sveglia la mattina!', 'Chicchirichì espresso, salto adesso!'] },
    { id: 'cactopudel', name: 'Cactopudel Skatini', color: '#4ab84a', pitch: 1.1, say: ['Cactopudel Skatini, spine spine nei giardini!', 'Ollie, ollie, cagnolone, punge tutto il marciapiede!', 'Bau bau, ahia ahia, skateboard nella prateria!', 'Pudel spinoso, skate pericoloso!', 'Kickflip nel deserto, cane esperto!'] },
    { id: 'lasagnone', name: 'Lasagnone Aviatore', color: '#f2c66a', pitch: .75, say: ['Lasagnone Aviatore, besciamella nel motore!', 'Brrrrm! Strato su strato, volo sopra il gelato!', 'Decollo, ragù, sempre più su, sempre più su!', 'Pilota di pasta, il cielo mi basta!', 'Mayday mayday, besciamella ovunque!'] },
    { id: 'formaggino', name: 'Formaggino Topolone', color: '#ffc83a', pitch: 1.3, say: ['Formaggino Topolone, buchi buchi nel groviera!', 'Squit squit, parmigiano, corro corro piano piano!', 'Topolino, formaggione, la trappola non funziona!', 'Groviera volante, topo elegante!', 'Formaggio a pois, chi corre più di noi?'] },
    { id: 'lavatrice', name: 'Lavatrice Bulldoggo', color: '#3a9aff', pitch: .65, say: ['Lavatrice Bulldoggo, centrifuga e grrr grrr!', 'Bau, bolle, bau, sapone, lavo pure il campione!', 'Giri giri, mille giri, calzini nei ricordi!', 'Grrr centrifuga, il calzino fugge!', 'Bulldog bagnato, salto profumato!'] },
  ];
  // Farben sind als sRGB angegeben; r128 rechnet linear → einmal umrechnen (sonst wirkt alles blass)
  function build(id) { const r = (B[id] || B.pinguino)(); r.group.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.userData.lin) return; m.userData.lin = 1; if (m.color) m.color.convertSRGBToLinear(); }); }); return r; }
  function animate(rig, t, move, air) {
    const sw = Math.sin(t * 11) * Math.min(1, move);
    for (const l of rig.legs) { l.o.rotation.x = air ? (l.hop ? -.6 : -.35 * l.s) : sw * l.s * l.amp; if (l.knee) l.knee.rotation.x = air ? .7 : Math.max(0, -sw * l.s) * .9; }
    for (const w of rig.wings) { const f = w.fast ? 16 : 7, a = (air ? 1 : .25 + move * .4) * w.amp * Math.sin(t * f); if (w.axis === 'z') w.o.rotation.z = w.s * a; else w.o.rotation.z = w.base + w.s * a * .6; }
    for (const w of rig.wig) { if (w.axis === 'z') w.o.rotation.z = Math.sin(t * 3 + w.ph) * w.amp; else { w.o.rotation.x = Math.sin(t * 4 + w.ph) * w.amp * (1 + move); w.o.rotation.z = Math.cos(t * 3.4 + w.ph) * w.amp * .6; } }
    if (rig.flames) rig.flames.forEach((f, i) => { const k = (air ? 1.2 : .55) + Math.sin(t * 40 + i * 2) * .15; f.scale.set(1, k, 1); });
    if (rig.prop) rig.prop.rotation.y += .5; if (rig.hover) rig.hover.position.y = .5 + Math.sin(t * 3) * .04 + (air ? .08 : 0);
    if (rig.drum && rig.drum.material.map) rig.drum.material.map.rotation = t * (2 + move * 6), rig.drum.material.map.center.set(.5, .5);
    if (rig.board) rig.board.rotation.z = air ? Math.sin(t * 8) * .3 : 0;
    if (rig.glow) rig.glow.material.opacity = .18 + Math.sin(t * 9) * .05;
    if (rig.steam) rig.steam.forEach((s, i) => { const k = (t * .6 + i / 3) % 1, b = rig.steamAt || [.42, 1.62, 0]; s.position.set(b[0] + Math.sin(k * 6 + i) * .08, b[1] + k * .5, b[2] + Math.cos(k * 5 + i) * .06); s.scale.setScalar(.6 + k * 1.4); s.material.opacity = .45 * (1 - k); });
  }
  window.BRChars = { LIST, build, animate, byId: id => LIST.find(c => c.id === id) || LIST[0] };
})();
