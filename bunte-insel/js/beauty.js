'use strict';
/* Bunte Insel – Optik-Extras, die fast nichts kosten: weiche eingebrannte Schatten (1 Zeichenaufruf), glitzerndes Wasser, Sonne am Himmel,
   Wiesenflecken, Blumen & Grasbüschel (Instanzen), Büsche an Häusern, Vögel und Schmetterlinge. Im Sparmodus weniger davon. */
BI.createBeauty = function (G) {
  const { scene, camera, W, save, renderer } = G, K = {}, TAU = BI.TAU, rnd = BI.rng(2024), mat = BI.mat();
  /* Sparmodus oder reines Software-Rendering (kein Grafikchip): weniger Zierde */
  let soft = false; try { const gl = renderer.getContext(), ex = gl.getExtension('WEBGL_debug_renderer_info'); soft = !!ex && /swiftshader|llvmpipe|software/i.test(String(gl.getParameter(ex.UNMASKED_RENDERER_WEBGL))); } catch (e) { }
  const eco = !!save.eco || soft;
  const ok = (x, z, r) => Math.hypot(x, z) < 152 && W.free(x, z, r) && !W.onRoad(x, z) && Math.hypot(x - W.lake.x, z - W.lake.z) > W.lake.r + 3;

  /* ---------- weiche Schatten (Bäume + große Gebäude), eine Mesh, halbtransparent ---------- */
  const shMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .26, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  { const b = new BI.Batch(), C = 0x1c2a44, dx = -.83, dz = -.55;
    for (const T of W.trees) { const s = T.top / (T.kind === 'pine' ? 5 : 4), r = (T.kind === 'pine' ? 1.9 : 2.3) * s, L = T.top * .5; b.disc(T.x + dx * L, T.z + dz * L, r, .075, C, 10); }
    for (const q of W.boxes) { const w = q.x1 - q.x0, d = q.z1 - q.z0, h = Math.min(q.h || 6, 9); if (Math.min(w, d) < 3 || w * d < 16 || h < 3) continue; const L = h * .55; b.rect(q.x0 + dx * L, q.z0 + dz * L, q.x1 + dx * L, q.z1 + dz * L, .072, C); }
    const m = b.mesh(shMat); m.frustumCulled = false; m.renderOrder = 1; scene.add(m); }

  /* ---------- Wasser: zwei langsam laufende Wellen-Schichten ---------- */
  const waves = [];
  if (!soft) { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.clearRect(0, 0, 128, 128); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const y0 = 8 + i * 14, ph = i * 1.3; c.beginPath(); for (let x = 0; x <= 128; x += 6) c.lineTo(x, y0 + Math.sin(x / 128 * TAU * 2 + ph) * 3); c.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(46, 46);
    for (const [r, op, sp] of (eco ? [[300, .22, [.012, .006]]] : [[300, .24, [.012, .006]], [300, .16, [-.008, .01]]])) { const t2 = tex.clone(); t2.needsUpdate = true; t2.repeat.set(r / 6.5, r / 6.5); const m = new THREE.Mesh(new THREE.CircleGeometry(r, 36), new THREE.MeshBasicMaterial({ map: t2, transparent: true, opacity: op, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = -.3 + waves.length * .01; scene.add(m); waves.push({ m, sp }); } }

  /* ---------- Sonne am Himmel (Glühen) ---------- */
  const sunSp = soft ? { position: new THREE.Vector3(), material: { opacity: 0 }, visible: false } : (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'), g = c.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(.18, 'rgba(255,240,170,.9)'); g.addColorStop(.5, 'rgba(255,220,120,.25)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.scale.set(190, 190, 1); s.renderOrder = -1; scene.add(s); return s; })();
  const sunDir = new THREE.Vector3(60, 100, 40).normalize();

  /* ---------- Wiesenflecken (zwei zusätzliche Grüntöne) ---------- */
  if (!soft) { const b = new BI.Batch(), cols = [0x82c174, 0x9acf87, 0x77b869, 0x8cc77d, 0xa6d591];
    for (let i = 0, n = 0; i < 400 && n < (eco ? 40 : 95); i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * 150, x = Math.sin(a) * d, z = Math.cos(a) * d, r = 4 + rnd() * 10; if (![[0, 0], [r * .8, 0], [-r * .8, 0], [0, r * .8], [0, -r * .8]].every(([ox, oz]) => !W.onRoad(x + ox, z + oz) && Math.hypot(x + ox, z + oz) < 158 && Math.hypot(x + ox - W.lake.x, z + oz - W.lake.z) > W.lake.r + 2)) continue; b.disc(x, z, r, .026 + (n % 3) * .001, cols[n % cols.length], 14); n++; }
    const m = b.mesh(mat); m.frustumCulled = false; scene.add(m); }

  /* ---------- Blumen und Grasbüschel (Instanzen) ---------- */
  const flowerPos = [];
  if (!soft) { const stem = new BI.Batch(), head = new BI.Batch(), tuft = new BI.Batch();
    stem.cyl(0, 0, 0, .02, .02, .34, 0x3fa84e, 4); for (let petal = 0; petal < 5; petal++) { const a = petal / 5 * BI.TAU; head.sph(Math.sin(a) * .105, .38, Math.cos(a) * .105, .095, 0xffffff, 0, 1, .45, 1); } head.sph(0, .405, 0, .065, 0xffd23f, 0, 1, .6, 1);
    for (let k = 0; k < 3; k++) tuft.cone(Math.sin(k * 2.1) * .07, 0, Math.cos(k * 2.1) * .07, .09, .42 + k * .05, 0x5cc04a, 4);
    const NF = eco ? 120 : 330, NT = eco ? 200 : 520, mk = (b, n) => { const g = b.mesh(mat).geometry, im = new THREE.InstancedMesh(g, mat, n); im.frustumCulled = false; scene.add(im); return im; };
    const iS = mk(stem, NF), iH = mk(head, NF), iT = mk(tuft, NT), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
    const PAL = [0xff5a8a, 0xffd23f, 0xffffff, 0xb36bff, 0xff8a1f, 0x6ac0ff];
    let nf = 0, nt = 0;
    for (let tries = 0; tries < 4000 && (nf < NF || nt < NT); tries++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * 150, x = Math.sin(a) * d, z = Math.cos(a) * d; if (!ok(x, z, .5)) continue;
      if (nf < NF && rnd() < .34) { const c = PAL[(rnd() * PAL.length) | 0], k = 4 + ((rnd() * 5) | 0); flowerPos.push([x, z]);
        for (let j = 0; j < k && nf < NF; j++) { const fx = x + (rnd() - .5) * 2.6, fz = z + (rnd() - .5) * 2.6, s = .8 + rnd() * .7; if (!ok(fx, fz, .2)) continue; q.setFromAxisAngle(v.set(0, 1, 0), rnd() * TAU); m4.compose(v.set(fx, .02, fz), q, sc.set(s, s, s)); iS.setMatrixAt(nf, m4); iH.setMatrixAt(nf, m4); col.setHex(c).multiplyScalar(.9 + rnd() * .2); iH.setColorAt(nf, col); nf++; } }
      else if (nt < NT) { const k = 3 + ((rnd() * 4) | 0); for (let j = 0; j < k && nt < NT; j++) { const fx = x + (rnd() - .5) * 2.2, fz = z + (rnd() - .5) * 2.2, s = .8 + rnd() * .9; q.setFromAxisAngle(v.set(0, 1, 0), rnd() * TAU); m4.compose(v.set(fx, .02, fz), q, sc.set(s, s * (.8 + rnd() * .5), s)); iT.setMatrixAt(nt, m4); col.setScalar(.85 + rnd() * .3); iT.setColorAt(nt, col); nt++; } }
    }
    iS.count = iH.count = nf; iT.count = nt; }

  /* ---------- Büsche mit Blüten an den Häusern ---------- */
  { const b = new BI.Batch(), G1 = [0x3fa84e, 0x4cb85a, 0x2f9a3c], PAL = [0xff5a8a, 0xffd23f, 0xffffff, 0xff8a1f];
    for (const h of W.houses || []) for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { if (rnd() < .35) continue; const x = h.x + sx * (h.w / 2 + .9), z = h.z + sz * (h.d / 2 + .9); if (!ok(x, z, .8)) continue; const r = .55 + rnd() * .35; b.sph(x, r * .6, z, r, G1[(rnd() * 3) | 0], 1, 1, .8, 1);
      for (let k = 0; k < 5; k++) { const a = rnd() * TAU; b.sph(x + Math.sin(a) * r * .8, r * .6 + rnd() * r * .5, z + Math.cos(a) * r * .8, .09, PAL[(rnd() * 4) | 0], 0); } }
    const m = b.mesh(mat); m.frustumCulled = false; scene.add(m); }

  /* ---------- Vögel und Schmetterlinge ---------- */
  const birds = [], flies = [];
  if (!eco) {
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1.1, 0, -.2, 0, 0, .35, 0, 0, -.35, 0, 0, .35, 1.1, 0, -.2, 0, 0, -.35]), 3)); bg.computeVertexNormals();
    const bm = new THREE.MeshBasicMaterial({ color: 0x3a4256, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(bg, bm); m.frustumCulled = false; scene.add(m); birds.push({ m, a: rnd() * TAU, r: 30 + rnd() * 90, y: 42 + rnd() * 28, sp: .12 + rnd() * .1, ph: rnd() * 6 }); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, .22, .12, .1, .22, .12, -.1, 0, 0, 0, -.22, .12, .1, -.22, .12, -.1]), 3)); fg.computeVertexNormals();
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: [0xff8fc8, 0xffd23f, 0x6ac0ff, 0xffffff, 0xff8a1f][i % 5], side: THREE.DoubleSide })); m.frustumCulled = false; scene.add(m); flies.push({ m, ax: 0, az: 0, ph: rnd() * 6, on: false }); }
  }

  /* ---------- pro Bild ---------- */
  let anchorT = 0;
  K.update = function (dt, t, night, wx) {
    const day = (1 - night) * (1 - wx * .8);
    shMat.opacity = .26 * (1 - night * .8) * (1 - wx * .6);
    for (const w of waves) { const mp = w.m.material.map; mp.offset.x += w.sp[0] * dt; mp.offset.y += w.sp[1] * dt; w.m.material.opacity = (w.m.material.opacity > .2 ? .24 : .16) * (1 - night * .6); }
    sunSp.position.copy(camera.position).addScaledVector(sunDir, 640); sunSp.material.opacity = Math.max(0, day); sunSp.visible = day > .02;
    const px = camera.position.x, pz = camera.position.z;
    for (const b of birds) { b.a += b.sp * dt * .35; b.m.visible = day > .25; if (!b.m.visible) continue; b.m.position.set(Math.sin(b.a) * b.r, b.y + Math.sin(t * .4 + b.ph) * 2, Math.cos(b.a) * b.r); b.m.rotation.y = b.a + Math.PI; b.m.rotation.z = Math.sin(t * 7 + b.ph) * .5; b.m.scale.y = .6 + Math.abs(Math.sin(t * 7 + b.ph)) * .5; }
    if (flies.length && flowerPos.length) {
      anchorT -= dt;
      for (const f of flies) {
        f.m.visible = day > .35 && f.on;
        if (anchorT <= 0 && (!f.on || Math.hypot(f.ax - px, f.az - pz) > 55)) { let best = null, bd = 1e9; for (let k = 0; k < 6; k++) { const p = flowerPos[(Math.random() * flowerPos.length) | 0], d = Math.hypot(p[0] - px, p[1] - pz); if (d < bd) { bd = d; best = p; } } if (best && bd < 50) { f.ax = best[0]; f.az = best[1]; f.on = true; } else f.on = false; }
        if (!f.m.visible) continue; const k = t * 1.1 + f.ph; f.m.position.set(f.ax + Math.sin(k * 1.3) * 1.6, 1 + Math.sin(k * 2.1) * .3, f.az + Math.cos(k) * 1.6); f.m.rotation.y = k * 1.3 + 1.5; f.m.scale.set(1, .4 + Math.abs(Math.sin(t * 14 + f.ph)) * .9, 1);
      }
      if (anchorT <= 0) anchorT = 3;
    }
  };
  return K;
};

