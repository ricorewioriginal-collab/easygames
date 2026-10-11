/* Urwaldlager – die begehbare 3D-Welt: Gelände, Camp, Pflanzen (instanziert), Wasser, Feuer, Tag/Nacht, Wetter,
   Kamera, Spielerbewegung, Kollision, Interaktionspunkte, Namensschilder und Minikarte */
(function (root) {
  'use strict';
  const E = root.UE, I = root.UIn, THREE = E.THREE, clamp = E.clamp, lerp = E.lerp;
  const V3 = THREE.Vector3, _v = new V3(), _v2 = new V3();
  // Orte im Camp (x = Osten, z = Süden)
  const SP = {
    fire: { x: 0, z: 0 }, wood: { x: 4.6, z: 3.6 }, barrel: { x: -4.6, z: 3.8 }, crate: { x: -2.6, z: 6.2 }, drum: { x: 7.4, z: -3.2 },
    hut: { x: -12.5, z: 3 }, gate: { x: 0, z: 31 }, stage: { x: -31, z: -6 }, pond: { x: 29, z: -4, r: 7.2 }, well: { x: 21.2, z: -3.4 },
    hammock: { x: 11, z: 7 }, tarpC: { x: 0, z: -10.8 }
  };
  const PATHS = [[0, 0, 0, 33], [0, 0, 22, -3.5], [0, 0, -27, -6], [0, 0, -12.5, 3], [0, -6, 0, -38], [22, -3.5, 26, 20]];
  const W = { SP, PATHS, colliders: [], interact: [], beds: [], seats: [], branches: [], fruit: [], ready: false, t: 0, weather: 'sun', rainK: 0, nightK: 0, focus: null };
  const R = E.rand(20240613);

  function distSeg(px, pz, x1, z1, x2, z2) { const dx = x2 - x1, dz = z2 - z1, l = dx * dx + dz * dz; let t = l ? ((px - x1) * dx + (pz - z1) * dz) / l : 0; t = clamp(t, 0, 1); return Math.hypot(px - (x1 + t * dx), pz - (z1 + t * dz)); }
  function pathDist(x, z) { let d = 1e9; for (const p of PATHS) d = Math.min(d, distSeg(x, z, p[0], p[1], p[2], p[3])); return d; }
  W.pathDist = pathDist;
  // Gelände: flaches Camp, Hügel außen, Senke für die Lagune
  W.heightAt = (x, z) => {
    const r = Math.hypot(x, z); let h = (E.noise2(x * .06, z * .06) - .5) * 3.2 + (E.noise2(x * .17 + 9, z * .17) - .5) * .8;
    h *= clamp((r - 14) / 18, 0, 1); h += clamp((r - 40) / 12, 0, 1) * 5;
    const pd = Math.hypot(x - SP.pond.x, z - SP.pond.z); if (pd < SP.pond.r + 3) h = lerp(-1.25, h, clamp((pd - SP.pond.r + 1.5) / 4.5, 0, 1));
    const sd = Math.hypot(x - SP.stage.x, z - SP.stage.z); if (sd < 12) h = lerp(0, h, clamp((sd - 8) / 4, 0, 1));
    const pdd = pathDist(x, z); if (pdd < 3) h *= clamp(pdd / 3, .3, 1);
    return h;
  };

  // ---------------- Aufbau ----------------
  W.build = function (castSize) {
    const S = W.scene = new THREE.Scene(); W.camera = new THREE.PerspectiveCamera(62, E.W / E.H, .1, E.q.far + 40); E.onResize.push(() => E.fitCamera(W.camera));
    S.fog = new THREE.Fog(0x9cc8b0, 20, E.q.far); S.background = new THREE.Color(0x9cc8b0);
    W.hemi = new THREE.HemisphereLight(0xdff5ff, 0x3a4a22, .75); S.add(W.hemi);
    W.sun = new THREE.DirectionalLight(0xfff0d0, .85); W.sun.position.set(20, 40, 10); S.add(W.sun); S.add(W.sun.target);
    setupShadows();
    W.fireLight = new THREE.PointLight(0xff9a3a, 0, 22, 1.6); W.fireLight.position.set(0, 1.4, 0); S.add(W.fireLight);
    buildGround(); buildCamp(castSize); buildPlants(); buildSky(); buildFx();
    W.ready = true;
  };
  function setupShadows() {
    const s = W.sun; s.castShadow = !!E.q.shadows;
    if (E.q.shadows) { s.shadow.mapSize.set(E.q.shadowSize, E.q.shadowSize); const c = s.shadow.camera; c.left = -24; c.right = 24; c.top = 24; c.bottom = -24; c.near = 1; c.far = 90; s.shadow.bias = -.0015; c.updateProjectionMatrix(); }
  }
  E.hooks.push(ev => { if (ev === 'quality' && W.ready) { setupShadows(); W.scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); W.camera.far = E.q.far + 40; W.scene.fog.far = E.q.far; W.camera.updateProjectionMatrix(); applyDensity(); W.npcShadows && W.npcShadows(E.q.shadows); } });

  function buildGround() {
    const N = E.q.level === 'low' ? 70 : 100, size = 220, g = new THREE.PlaneGeometry(size, size, N, N); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), grass = new THREE.Color('#4f8a35'), grass2 = new THREE.Color('#2f6a2a'), dirt = new THREE.Color('#8a6a44'), mud = new THREE.Color('#5a4a30'), sand = new THREE.Color('#b59a68');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = W.heightAt(x, z); p.setY(i, h);
      const n = E.noise2(x * .2, z * .2); c.copy(grass).lerp(grass2, n * .9);
      const r = Math.hypot(x, z), pd = pathDist(x, z), pond = Math.hypot(x - SP.pond.x, z - SP.pond.z);
      if (r < 9.5) c.lerp(dirt, clamp((9.5 - r) / 3, 0, .85));
      if (pd < 2) c.lerp(dirt, clamp((2 - pd) / 1.2, 0, .8));
      if (pond < SP.pond.r + 2.5) c.lerp(pond < SP.pond.r ? mud : sand, clamp((SP.pond.r + 2.5 - pond) / 2.5, 0, .9));
      if (Math.hypot(x - SP.stage.x, z - SP.stage.z) < 7) c.lerp(dirt, .5);
      c.multiplyScalar(.9 + E.noise2(x * 1.3, z * 1.3) * .2);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, E.vcMat); m.receiveShadow = true; W.scene.add(m); W.ground = m;
    // Lagune
    const wg = new THREE.CircleGeometry(SP.pond.r + .8, 40); wg.rotateX(-Math.PI / 2);
    const tex = E.canvasTex('water', 128, 128, (cx, w, h) => { cx.fillStyle = '#2d6f6a'; cx.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { cx.strokeStyle = `rgba(200,255,240,${.06 + Math.random() * .12})`; cx.lineWidth = 1 + Math.random() * 1.5; cx.beginPath(); const x = Math.random() * w, y = Math.random() * h, r = 6 + Math.random() * 16; cx.arc(x, y, r, Math.random() * 3, Math.random() * 3 + 1.5); cx.stroke(); } }, true);
    tex.repeat.set(3, 3); W.waterTex = tex;
    const wm = new THREE.Mesh(wg, new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: .88, color: 0xbfe8e0 })); wm.position.set(SP.pond.x, -.35, SP.pond.z); W.scene.add(wm); W.water = wm;
    W.colliders.push({ x: SP.pond.x, z: SP.pond.z, r: SP.pond.r - .6, water: true });
  }

  // Camp-Requisiten zu wenigen Meshes verschmolzen
  function buildCamp(n) {
    const M = E.mtx, G = E.geo, P = [], wood = '#7a5232', wood2 = '#94683e', dark = '#4a3220', rope = '#c8a26a';
    const add = (g, m, c, jit) => P.push({ g, m, c, jit });
    // Feuerstelle
    for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2; add(G.dodec, M(Math.cos(a) * 1.05, .12, Math.sin(a) * 1.05, a, a * 2, 0, .26, .2, .24), '#7d7a72', .3); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .3; add(G.cylLo, M(Math.cos(a) * .35, .14, Math.sin(a) * .35, 0, -a, Math.PI / 2 - .25, .09, .9, .09), dark); }
    add(G.cylLo, M(-.75, 1.05, 0, 0, 0, .25, .04, 2.2, .04), dark); add(G.cylLo, M(.75, 1.05, 0, 0, 0, -.25, .04, 2.2, .04), dark); add(G.cylLo, M(0, 1.98, 0, 0, 0, Math.PI / 2, .035, 1.4, .035), dark);
    add(G.cyl, M(0, 1.15, 0, 0, 0, 0, .32, .42, .32), '#2b2b2b'); add(G.cyl, M(0, 1.37, 0, 0, 0, 0, .3, .02, .3), '#e8dcc0');
    // Sitzbänke (Baumstämme) im Kreis
    const nb = 6; for (let i = 0; i < nb; i++) { const a = i / nb * Math.PI * 2 + Math.PI / nb, r = 3.5, x = Math.cos(a) * r, z = Math.sin(a) * r; add(G.cylLo, M(x, .26, z, 0, -a + Math.PI / 2, Math.PI / 2, .26, 1.9, .26), i % 2 ? wood : wood2, .15); W.colliders.push({ x, z, r: .55, seat: true });
      for (const o of [-.45, .45]) { const sx = x + Math.cos(a + Math.PI / 2) * o, sz = z + Math.sin(a + Math.PI / 2) * o; W.seats.push({ x: sx, z: sz, yaw: Math.atan2(-sx, -sz), used: null }); } }
    // Schlafplatz: Pritschen im Halbkreis unter einer Plane
    const bn = Math.max(6, n);
    for (let i = 0; i < bn; i++) {
      const a = Math.PI + .35 + i / (bn - 1) * (Math.PI - .7), r = 11.2, x = Math.cos(a) * r, z = Math.sin(a) * r * .55 - 7.5, yaw = Math.atan2(-x, -(z + 2)) ;
      const ca = Math.cos(yaw), sa = Math.sin(yaw), bx = (dx, dz) => [x + dx * ca + dz * sa, z - dx * sa + dz * ca];
      for (const [dx, dz] of [[-.45, -1], [.45, -1], [-.45, 1], [.45, 1]]) { const [px, pz] = bx(dx, dz); add(G.cylLo, M(px, .25, pz, 0, 0, 0, .05, .5, .05), dark); }
      add(G.box, M(x, .5, z, 0, yaw, 0, .95, .08, 2.1), ['#3f6e8c', '#8c3f5a', '#5a8c3f', '#8c7a3f'][i % 4], .1);
      const [hx, hz] = bx(0, -.85); add(G.box, M(hx, .6, hz, 0, yaw, 0, .55, .12, .32), '#e8e0d0');
      W.beds.push({ x, z, yaw, owner: null, i }); W.colliders.push({ x, z, r: .7, bed: true });
    }
    // Plane über den Betten + Pfosten
    const tarp = new THREE.Mesh(new THREE.BoxGeometry(26, .06, 9), E.mat('#2f6f8f')); tarp.position.set(0, 3.3, -9.6); tarp.rotation.x = .12; W.scene.add(tarp); W.tarp = tarp;
    for (const x of [-12.5, -4, 4, 12.5]) for (const z of [-13.6, -5.8]) { add(G.cylLo, M(x, 1.65, z, 0, 0, 0, .09, 3.4, .09), dark); W.colliders.push({ x, z, r: .25 }); }
    // Holzstapel-Rahmen, Wasserfass, Vorratskiste
    add(G.box, M(SP.wood.x, .05, SP.wood.z, 0, .4, 0, 1.8, .1, 1.1), dark); W.colliders.push({ x: SP.wood.x, z: SP.wood.z, r: .9 });
    add(G.cyl, M(SP.barrel.x, .55, SP.barrel.z, 0, 0, 0, .5, 1.1, .5), '#6a4426', .1); add(G.torus, M(SP.barrel.x, .3, SP.barrel.z, Math.PI / 2, 0, 0, .5, .5, .5), '#444'); add(G.torus, M(SP.barrel.x, .85, SP.barrel.z, Math.PI / 2, 0, 0, .5, .5, .5), '#444'); W.colliders.push({ x: SP.barrel.x, z: SP.barrel.z, r: .65 });
    add(G.cyl, M(SP.barrel.x + .9, .14, SP.barrel.z + .2, 0, 0, 0, .14, .26, .14), '#8a8f96');
    add(G.box, M(SP.crate.x, .4, SP.crate.z, 0, .2, 0, 1.3, .8, .9), '#9a7040', .12); add(G.box, M(SP.crate.x, .82, SP.crate.z, 0, .2, 0, 1.36, .08, .96), '#7a5030'); W.colliders.push({ x: SP.crate.x, z: SP.crate.z, r: .85 });
    // Buschtrommel (Ansagen der Show)
    add(G.cylLo, M(SP.drum.x, 1.1, SP.drum.z, 0, 0, 0, .12, 2.2, .12), dark); add(G.cyl, M(SP.drum.x, 2.35, SP.drum.z, 0, 0, 0, .45, .6, .45), '#a0522d'); add(G.cyl, M(SP.drum.x, 2.66, SP.drum.z, 0, 0, 0, .46, .03, .46), '#f0e0c0'); add(G.cyl, M(SP.drum.x, 2.04, SP.drum.z, 0, 0, 0, .46, .03, .46), '#f0e0c0');
    W.colliders.push({ x: SP.drum.x, z: SP.drum.z, r: .45 });
    // Plauderhöhle (Kamera-Hütte)
    const hx = SP.hut.x, hz = SP.hut.z; add(G.box, M(hx, 1.2, hz - 1.3, 0, 0, 0, 3, 2.4, .2), wood2, .2); add(G.box, M(hx - 1.4, 1.2, hz, 0, 0, 0, .2, 2.4, 2.8), wood, .2); add(G.box, M(hx + 1.4, 1.2, hz, 0, 0, 0, .2, 2.4, 2.8), wood, .2);
    add(G.cone, M(hx, 2.9, hz, 0, Math.PI / 4, 0, 2.6, 1.6, 2.6), '#c8a464', .2); add(G.box, M(hx, .5, hz - .6, 0, 0, 0, 1, 1, .6), '#7a3a8a');
    add(G.cylLo, M(hx + .7, 1.3, hz + 1.1, 0, 0, 0, .04, 1.4, .04), '#222'); add(G.box, M(hx + .7, 2.05, hz + 1.1, 0, 0, 0, .3, .22, .4), '#222'); add(G.sph, M(hx + .7, 2.05, hz + .88, 0, 0, 0, .07), '#ff3355');
    W.colliders.push({ x: hx, z: hz - .5, r: 1.6 });
    // Prüfungstor
    const gx = SP.gate.x, gz = SP.gate.z; for (const s of [-1, 1]) { add(G.cylLo, M(gx + s * 2.3, 2.2, gz, 0, 0, 0, .28, 4.4, .28), dark, .1); add(G.cone, M(gx + s * 2.3, 4.7, gz, 0, 0, 0, .35, .6, .35), '#f4a300'); W.colliders.push({ x: gx + s * 2.3, z: gz, r: .4 }); }
    add(G.box, M(gx, 4.25, gz, 0, 0, .03, 5.6, .5, .4), wood2, .15); for (let i = 0; i < 8; i++) add(G.cylLo, M(gx - 2 + i * .57, 3.6 + Math.sin(i) * .1, gz + .1, 0, 0, 0, .025, 1.1 + (i % 3) * .3, .025), '#3a8a3a');
    // Moderationsbereich: Bühne mit Steg, Pulten und Fackeln
    const sx = SP.stage.x, sz = SP.stage.z;
    add(G.cyl, M(sx, .3, sz, 0, 0, 0, 5.2, .6, 5.2), wood2, .15); add(G.cyl, M(sx, .62, sz, 0, 0, 0, 5.3, .06, 5.3), '#5a3a20');
    add(G.box, M(sx - 2.5, 1.7, sz - 3.6, 0, .5, 0, 4.2, 2.6, .25), '#1d3a2a'); add(G.box, M(sx - 2.5, 3.2, sz - 3.6, 0, .5, 0, 4.4, .4, .35), '#f4a300');
    for (const [dx, dz] of [[-1.2, -1.6], [1.4, -2.2]]) add(G.box, M(sx + dx, 1.15, sz + dz, 0, 0, 0, .8, 1.1, .5), '#ff8a3d', .1);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = sx + Math.cos(a) * 5.6, z = sz + Math.sin(a) * 5.6; add(G.cylLo, M(x, 1, z, 0, 0, 0, .07, 2, .07), dark); add(G.cone, M(x, 2.15, z, Math.PI, 0, 0, .14, .3, .14), '#5a3a20'); W.colliders.push({ x, z, r: .25 }); }
    for (let i = 0; i < 7; i++) add(G.box, M(sx + 6 + i * .9, .55, sz + 1.2, 0, 0, Math.sin(i) * .03, .85, .08, 1.6), i % 2 ? wood : wood2);
    // Bambuszaun um das Camp (dekorativ, mit Lücken an den Wegen)
    for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2, r = 16.5 + Math.sin(i * 1.7) * .3, x = Math.cos(a) * r, z = Math.sin(a) * r; if (pathDist(x, z) < 2.4) continue; add(G.cylLo, M(x, .7 + (i % 3) * .1, z, 0, 0, 0, .06, 1.4 + (i % 3) * .2, .06), '#a8b45a', .2); }
    // Wäscheleine zwischen zwei Pfosten
    add(G.cylLo, M(9.5, 1, -2, 0, 0, 0, .05, 2, .05), dark); add(G.cylLo, M(13.5, 1, 1, 0, 0, 0, .05, 2, .05), dark);
    // Hängematte (Ruheplatz)
    const ha = SP.hammock; add(G.cylLo, M(ha.x - 1.6, 1, ha.z, 0, 0, 0, .1, 2, .1), dark); add(G.cylLo, M(ha.x + 1.6, 1, ha.z, 0, 0, 0, .1, 2, .1), dark); add(G.sph, M(ha.x, .75, ha.z, 0, 0, 0, 1.5, .18, .45), '#e0a040', .2);
    W.colliders.push({ x: ha.x - 1.6, z: ha.z, r: .25 }, { x: ha.x + 1.6, z: ha.z, r: .25 });
    const camp = new THREE.Mesh(E.merge(P), E.vcMat); camp.castShadow = true; camp.receiveShadow = true; W.scene.add(camp); W.campMesh = camp;
    // Wäsche (bunt)
    const wash = []; for (let i = 0; i < 5; i++) wash.push({ g: G.box, m: M(10 + i * .75, 1.55, -1.6 + i * .55, 0, -.65, 0, .5, .55, .02), c: ['#ff5fa2', '#37d6e8', '#ffcf4a', '#9dff5c', '#ffffff'][i] });
    W.scene.add(new THREE.Mesh(E.merge(wash), E.vcMat));
    // Holzscheite im Stapel (Anzahl = Vorrat)
    W.logs = new THREE.InstancedMesh(E.geo.cylLo, E.mat('#7a4e2a'), 12); const dm = new THREE.Object3D();
    for (let i = 0; i < 12; i++) { const row = Math.floor(i / 4), k = i % 4; dm.position.set(SP.wood.x - .6 + k * .4 + (row % 2) * .2, .2 + row * .26, SP.wood.z); dm.rotation.set(Math.PI / 2, .4, 0); dm.scale.set(.12, 1.4, .12); dm.updateMatrix(); W.logs.setMatrixAt(i, dm.matrix); }
    W.logs.count = 0; W.scene.add(W.logs);
    // Wasserstand im Fass
    W.barrelWater = new THREE.Mesh(E.geo.cyl, E.mat('#3a8fc8')); W.barrelWater.scale.set(.46, .02, .46); W.barrelWater.position.set(SP.barrel.x, .1, SP.barrel.z); W.scene.add(W.barrelWater);
    // Schilder
    const sign = (txt, x, y, z, ry, w, col) => { const t = new THREE.CanvasTexture(signCanvas(txt, col)); t.encoding = THREE.sRGBEncoding; const m = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ map: t, transparent: true })); m.scale.set(w, w / 4, 1); m.position.set(x, y, z); m.rotation.y = ry; W.scene.add(m); return m; };
    sign('PRÜFUNGEN', gx, 4.25, gz - .22, Math.PI, 5, '#ffcf4a'); sign('URWALDLAGER', sx - 2.5, 3.2, sz - 3.4, .5, 4.2, '#ffcf4a'); sign('PLAUDERHÖHLE', hx, 2.7, hz + 1.42, 0, 2.6, '#ff9ae0'); sign('BUSCHTROMMEL', SP.drum.x, 1.35, SP.drum.z + .14, 0, 1.4, '#ffffff');
    // Moderatoren (Kiki & Boris) auf der Bühne
    W.hosts = E.HOST_LOOKS.map((L, i) => { const f = E.Figure(L); f.group.position.set(sx + (i ? 1.4 : -1.2), .66, sz + (i ? -1.6 : -1)); f.group.rotation.y = i ? .3 : -.3; W.scene.add(f.group); return f; });
  }
  function signCanvas(txt, col) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = 'rgba(40,24,10,.92)'; x.beginPath(); x.moveTo(8, 4); x.lineTo(248, 4); x.lineTo(252, 60); x.lineTo(4, 60); x.fill(); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; x.stroke(); x.fillStyle = col; x.font = '900 30px Trebuchet MS,Inter,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 34, 236); return c; }

  // Pflanzen: InstancedMesh je Teil, Dichte über Qualitätsstufe
  let plantSets = [];
  function buildPlants() {
    const pts = [], tries = 2600; const ok = (x, z, r) => { const d = Math.hypot(x, z); if (d < 17.5 || d > 98) return false; if (pathDist(x, z) < 2.6 + r * .3) return false; if (Math.hypot(x - SP.pond.x, z - SP.pond.z) < SP.pond.r + 2.5) return false; if (Math.hypot(x - SP.stage.x, z - SP.stage.z) < 9) return false; if (Math.hypot(x - SP.gate.x, z - SP.gate.z) < 6) return false; return true; };
    for (let i = 0; i < tries; i++) { const a = R() * Math.PI * 2, d = 17.5 + Math.pow(R(), .8) * 80, x = Math.cos(a) * d, z = Math.sin(a) * d; if (ok(x, z, 1)) pts.push([x, z, R()]); }
    const trees = [], palms = [], giants = [], bushes = [], ferns = [], rocks = [];
    pts.forEach(p => { const k = p[2]; if (k < .3) trees.push(p); else if (k < .5) palms.push(p); else if (k < .54) giants.push(p); else if (k < .78) bushes.push(p); else if (k < .93) ferns.push(p); else rocks.push(p); });
    // Bäume im Camp-Inneren am Rand (Schatten, Atmosphäre)
    for (let i = 0; i < 7; i++) { const a = R() * Math.PI * 2, d = 13 + R() * 3, x = Math.cos(a) * d, z = Math.sin(a) * d; if (pathDist(x, z) > 3 && Math.hypot(x - SP.hut.x, z - SP.hut.z) > 4 && z > -6) palms.push([x, z, .4]); }
    W.colliders.push(...trees.map(p => ({ x: p[0], z: p[1], r: .45 })), ...palms.map(p => ({ x: p[0], z: p[1], r: .35 })), ...giants.map(p => ({ x: p[0], z: p[1], r: 1.3 })), ...rocks.map(p => ({ x: p[0], z: p[1], r: .8 })));
    const dm = new THREE.Object3D(), col = new THREE.Color();
    const inst = (geo, mat, list, fn, shadow, sway) => {
      const m = new THREE.InstancedMesh(geo, mat, list.length); m.userData.full = list.length;
      list.forEach((p, i) => { fn(p, dm, col, i); dm.updateMatrix(); m.setMatrixAt(i, dm.matrix); m.setColorAt(i, col); });
      m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = !!shadow; m.receiveShadow = false; W.scene.add(m); plantSets.push(m); return m;
    };
    const white = (o) => { const mt = new THREE.MeshLambertMaterial(Object.assign({ color: 0xffffff }, o || {})); return mt; };
    const leafMat = swayMat(white()), trunkMat = white();
    const sh = (p, y) => p[1] * 1e-3 + y;
    inst(E.geo.cylLo, trunkMat, trees, (p, d, c) => { const h = 4 + p[2] * 10; d.position.set(p[0], W.heightAt(p[0], p[1]) + h / 2 - .2, p[1]); d.rotation.set(0, p[2] * 9, 0); d.scale.set(.32, h, .32); c.set('#5d4128').multiplyScalar(.8 + p[2] * .4); }, true);
    inst(E.geo.ico, leafMat, trees, (p, d, c) => { const h = 4 + p[2] * 10; d.position.set(p[0], W.heightAt(p[0], p[1]) + h + .6, p[1]); d.rotation.set(p[2] * 3, p[2] * 7, 0); const s = 2.2 + p[2] * 2.5; d.scale.set(s, s * .75, s); c.set(['#2f7d3a', '#3c8f45', '#25663a', '#4a9a3a'][Math.floor(p[2] * 40) % 4]); }, true);
    inst(E.geo.ico, leafMat, trees, (p, d, c) => { const h = 4 + p[2] * 10; d.position.set(p[0] + 1.1, W.heightAt(p[0], p[1]) + h - .5, p[1] + .6); d.rotation.set(0, p[2] * 5, p[2]); const s = 1.5 + p[2] * 1.6; d.scale.set(s, s * .7, s); c.set(['#3c8f45', '#2b7034', '#4e9e48'][Math.floor(p[2] * 30) % 3]); });
    // Palmen: leicht geneigter Stamm + Wedel
    const frond = frondGeo(); W.frond = frond;
    inst(E.geo.cylLo, trunkMat, palms, (p, d, c) => { const h = 5 + p[2] * 5; d.position.set(p[0], W.heightAt(p[0], p[1]) + h / 2, p[1]); d.rotation.set((p[2] - .5) * .25, 0, (p[2] - .45) * .3); d.scale.set(.2, h, .2); c.set('#8a6a44'); }, true);
    const fr = []; palms.forEach(p => { for (let k = 0; k < 7; k++) fr.push([p[0], p[1], p[2], k]); });
    inst(frond, swayMat(white({ side: THREE.DoubleSide })), fr, (p, d, c) => { const h = 5 + p[2] * 5, tx = p[0] + Math.sin((p[2] - .45) * .3) * -h * .5, tz = p[1] + Math.sin((p[2] - .5) * .25) * h * .5; d.position.set(tx, W.heightAt(p[0], p[1]) + h - .1, tz); d.rotation.set(0, p[3] / 7 * Math.PI * 2 + p[2] * 3, 0); const s = 1 + p[2] * .5; d.scale.set(s, s, s); c.set(['#3f9a3a', '#2f8a34', '#56a83e'][p[3] % 3]); }, true);
    // Urwaldriesen
    inst(E.geo.cyl, trunkMat, giants, (p, d, c) => { const h = 16 + p[2] * 8; d.position.set(p[0], W.heightAt(p[0], p[1]) + h / 2 - .5, p[1]); d.scale.set(1.1, h, 1.1); c.set('#6b5a44'); }, true);
    inst(E.geo.ico, leafMat, giants, (p, d, c) => { const h = 16 + p[2] * 8; d.position.set(p[0], W.heightAt(p[0], p[1]) + h + 1, p[1]); d.scale.set(7, 3.2, 7); d.rotation.set(0, p[2] * 6, 0); c.set('#2a6e34'); }, true);
    inst(E.geo.ico, leafMat, bushes, (p, d, c) => { const s = .8 + p[2] * 1.4; d.position.set(p[0], W.heightAt(p[0], p[1]) + s * .4, p[1]); d.rotation.set(p[2] * 4, p[2] * 9, 0); d.scale.set(s * 1.3, s * .8, s * 1.2); c.set(['#3a8a3a', '#2a7a40', '#5a9a2a', '#2f6a30'][Math.floor(p[2] * 77) % 4]); });
    inst(frond, swayMat(white({ side: THREE.DoubleSide })), ferns.flatMap(p => [0, 1, 2, 3, 4].map(k => [p[0], p[1], p[2], k])), (p, d, c) => { d.position.set(p[0], W.heightAt(p[0], p[1]) + .05, p[1]); d.rotation.set(-.5, p[3] / 5 * Math.PI * 2 + p[2] * 4, 0); d.scale.setScalar(.38 + p[2] * .2); c.set(['#4caf50', '#3d9a40', '#66bb4a'][p[3] % 3]); });
    inst(E.geo.dodec, trunkMat, rocks, (p, d, c) => { const s = .5 + p[2] * .9; d.position.set(p[0], W.heightAt(p[0], p[1]) + s * .3, p[1]); d.rotation.set(p[2] * 3, p[2] * 7, p[2]); d.scale.set(s * 1.3, s, s); c.set('#7d7a72').multiplyScalar(.8 + p[2] * .3); });
    // Grasbüschel & Blumen im Camp-Umfeld
    const tufts = []; for (let i = 0; i < 700; i++) { const a = R() * Math.PI * 2, d = 6 + R() * 40, x = Math.cos(a) * d, z = Math.sin(a) * d; if (pathDist(x, z) > 1.6 && Math.hypot(x - SP.pond.x, z - SP.pond.z) > SP.pond.r + .5 && Math.hypot(x, z) > 9) tufts.push([x, z, R()]); }
    inst(E.geo.cone, swayMat(white()), tufts, (p, d, c) => { d.position.set(p[0], W.heightAt(p[0], p[1]) + .15, p[1]); d.rotation.set((p[2] - .5) * .4, p[2] * 6, 0); d.scale.set(.12, .35 + p[2] * .35, .12); c.set(p[2] > .93 ? ['#ff5fa2', '#ffcf4a', '#ff7a3d', '#b07aff'][Math.floor(p[2] * 1000) % 4] : ['#5aa83a', '#4a9a32', '#6ab84a'][Math.floor(p[2] * 99) % 3]); });
    applyDensity();
    // Sammelstellen für Äste (Holz) und Fruchtbüsche
    const bp = []; for (let i = 0; i < 400 && bp.length < 14; i++) { const a = R() * Math.PI * 2, d = 19 + R() * 22, x = Math.cos(a) * d, z = Math.sin(a) * d; if (pathDist(x, z) > 1.5 && Math.hypot(x - SP.pond.x, z - SP.pond.z) > SP.pond.r + 3 && Math.hypot(x - SP.stage.x, z - SP.stage.z) > 9 && !W.colliders.some(c => Math.hypot(c.x - x, c.z - z) < c.r + 1.4) && !bp.some(b => Math.hypot(b.x - x, b.z - z) < 7)) bp.push({ x, z, have: true, t: 0 }); }
    W.branches = bp; W.branchMesh = new THREE.InstancedMesh(E.merge([{ g: E.geo.cylLo, m: E.mtx(0, .1, 0, 0, .3, Math.PI / 2, .09, 1.6, .09), c: '#7a4e2a' }, { g: E.geo.cylLo, m: E.mtx(.2, .16, .15, 0, -.4, Math.PI / 2, .07, 1.2, .07), c: '#8a5a32' }, { g: E.geo.cylLo, m: E.mtx(-.1, .22, -.1, 0, 1.2, Math.PI / 2, .06, 1, .06), c: '#6a4426' }]), E.vcMat, bp.length); W.scene.add(W.branchMesh);
    const fp = []; for (let i = 0; i < 300 && fp.length < 6; i++) { const a = R() * Math.PI * 2, d = 18 + R() * 20, x = Math.cos(a) * d, z = Math.sin(a) * d; if (pathDist(x, z) > 2 && Math.hypot(x - SP.pond.x, z - SP.pond.z) > SP.pond.r + 3 && !W.colliders.some(c => Math.hypot(c.x - x, c.z - z) < c.r + 1.6) && !bp.some(b => Math.hypot(b.x - x, b.z - z) < 4) && !fp.some(b => Math.hypot(b.x - x, b.z - z) < 8)) fp.push({ x, z, n: 3 }); }
    W.fruit = fp; fp.forEach(f => W.colliders.push({ x: f.x, z: f.z, r: .8 }));
    const fparts = []; fp.forEach(f => { const y = W.heightAt(f.x, f.z); fparts.push({ g: E.geo.ico, m: E.mtx(f.x, y + .8, f.z, 0, 0, 0, 1.1, .9, 1.1), c: '#2f7d3a', jit: .2 }); });
    W.scene.add(new THREE.Mesh(E.merge(fparts), E.vcMat));
    W.fruitMesh = new THREE.InstancedMesh(E.geo.sph, E.mat('#ff9a1f'), fp.length * 3); W.scene.add(W.fruitMesh); W.updateProps();
  }
  function applyDensity() { const d = E.q.density; plantSets.forEach(m => { m.count = Math.max(1, Math.floor(m.userData.full * (m.userData.full > 300 ? d : Math.min(1, d + .25)))); }); }
  // Palmwedel: gebogener Streifen
  function frondGeo() {
    const seg = 7, pos = [], idx = []; for (let i = 0; i <= seg; i++) { const t = i / seg, x = t * 3, y = Math.sin(t * 1.4) * .6 - t * t * 1.4, w = Math.sin(t * Math.PI) * .45 + .05; pos.push(x, y, -w, x, y + .05, w); if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  // Blätter wiegen sich im Wind (Vertex-Shader, sehr günstig)
  const swayUni = { uT: { value: 0 }, uW: { value: 1 } };
  function swayMat(mt) {
    mt.onBeforeCompile = sh => { sh.uniforms.uT = swayUni.uT; sh.uniforms.uW = swayUni.uW; sh.vertexShader = 'uniform float uT; uniform float uW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\n float ph = instanceMatrix[3].x * .37 + instanceMatrix[3].z * .23;\n#else\n float ph = 0.0;\n#endif\n transformed.x += sin(uT * 1.7 + ph) * .06 * uW * max(0.0, position.y + .3);\n transformed.z += cos(uT * 1.3 + ph) * .05 * uW * max(0.0, position.y + .3);'); };
    return mt;
  }
  function buildSky() {
    const n = 500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, e = .15 + R() * 1.3, r = 160; pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); W.scene.add(W.stars);
    W.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xfff8e0, fog: false, transparent: true, depthWrite: false })); W.moon.scale.set(22, 22, 1); W.scene.add(W.moon);
    W.sunSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xfff0b0, fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); W.sunSpr.scale.set(40, 40, 1); W.scene.add(W.sunSpr);
    const cl = []; for (let i = 0; i < 9; i++) { const a = R() * Math.PI * 2, r = 70 + R() * 50; for (let k = 0; k < 4; k++) cl.push({ g: E.geo.sph, m: E.mtx(Math.cos(a) * r + k * 5 - 8, 48 + R() * 12, Math.sin(a) * r + (k % 2) * 3, 0, 0, 0, 7 + R() * 5, 2.5 + R() * 1.5, 5 + R() * 3), c: '#ffffff' }); }
    W.clouds = new THREE.Mesh(E.merge(cl), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .85, fog: false, depthWrite: false })); W.scene.add(W.clouds);
  }
  function buildFx() {
    // Feuer: Flammenkegel (additiv) + Glut-Leuchten
    const fm = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    W.flames = []; const fg = new THREE.Group(); fg.position.set(0, .2, 0); W.scene.add(fg); W.fireGroup = fg;
    [[0, 0, '#ff6a1a', .9, .55, 1.4], [.18, .1, '#ffb43a', .85, .4, 1.1], [-.15, -.12, '#ffd86a', .9, .3, .9], [.05, -.2, '#ff8a2a', .8, .35, 1]].forEach(([x, z, c, o, r, h]) => { const m = new THREE.Mesh(E.geo.cone, fm(c, o)); m.position.set(x, h / 2, z); m.scale.set(r, h, r); m.userData.h = h; m.userData.r = r; fg.add(m); W.flames.push(m); });
    W.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xff8a2a, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false })); W.glow.scale.set(5, 5, 1); W.glow.position.set(0, 1, 0); W.scene.add(W.glow);
    // Fackeln (nur Leuchtpunkte)
    const torchPos = [[SP.gate.x - 2.3, 4.75, SP.gate.z], [SP.gate.x + 2.3, 4.75, SP.gate.z]]; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; torchPos.push([SP.stage.x + Math.cos(a) * 5.6, 2.35, SP.stage.z + Math.sin(a) * 5.6]); }
    W.torches = torchPos.map(p => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xffa040, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })); s.position.set(p[0], p[1], p[2]); s.scale.set(1.4, 1.8, 1); W.scene.add(s); return s; });
    // Regen
    const rn = E.q.rain, rp = new Float32Array(rn * 6); W.rainData = new Float32Array(rn * 3); for (let i = 0; i < rn; i++) { W.rainData[i * 3] = (R() - .5) * 40; W.rainData[i * 3 + 1] = R() * 20; W.rainData[i * 3 + 2] = (R() - .5) * 40; }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    W.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: .45 })); W.rain.frustumCulled = false; W.rain.visible = false; W.scene.add(W.rain);
    // Glühwürmchen
    const fn = 60, fpz = new Float32Array(fn * 3); W.ffData = []; for (let i = 0; i < fn; i++) { const a = R() * Math.PI * 2, d = 8 + R() * 22; W.ffData.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, y: .6 + R() * 2, p: R() * 6 }); }
    const ffg = new THREE.BufferGeometry(); ffg.setAttribute('position', new THREE.BufferAttribute(fpz, 3));
    W.ff = new THREE.Points(ffg, new THREE.PointsMaterial({ color: 0xd8ff7a, size: .22, map: E.glowTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); W.ff.frustumCulled = false; W.scene.add(W.ff);
    // Vögel am Tag
    W.birds = []; const bg = E.merge([{ g: E.geo.box, m: E.mtx(-.35, 0, 0, 0, 0, .3, .7, .04, .2), c: '#222' }, { g: E.geo.box, m: E.mtx(.35, 0, 0, 0, 0, -.3, .7, .04, .2), c: '#222' }]);
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(bg, E.vcMat); b.userData = { r: 20 + i * 8, h: 18 + i * 3, sp: .15 + i * .04, p: i * 1.7 }; W.scene.add(b); W.birds.push(b); }
    // Ziel-Ring (zeigt Interaktionsorte)
    W.ring = new THREE.Mesh(new THREE.RingGeometry(.55, .7, 24), new THREE.MeshBasicMaterial({ color: 0xffcf4a, transparent: true, opacity: .8, depthWrite: false })); W.ring.rotation.x = -Math.PI / 2; W.ring.visible = false; W.scene.add(W.ring);
  }
  W.updateProps = function (camp) {
    const dm = new THREE.Object3D();
    W.branches.forEach((b, i) => { dm.position.set(b.x, W.heightAt(b.x, b.z), b.z); dm.rotation.set(0, i * 1.3, 0); dm.scale.setScalar(b.have ? 1 : 0.0001); dm.updateMatrix(); W.branchMesh.setMatrixAt(i, dm.matrix); }); W.branchMesh.instanceMatrix.needsUpdate = true;
    let k = 0; W.fruit.forEach(f => { const y = W.heightAt(f.x, f.z); for (let j = 0; j < 3; j++) { dm.position.set(f.x + Math.cos(j * 2.1) * .8, y + .9 + (j % 2) * .3, f.z + Math.sin(j * 2.1) * .8); dm.rotation.set(0, 0, 0); dm.scale.setScalar(j < f.n ? .14 : 0.0001); dm.updateMatrix(); W.fruitMesh.setMatrixAt(k++, dm.matrix); } }); W.fruitMesh.instanceMatrix.needsUpdate = true;
    if (camp) { W.logs.count = clamp(Math.round(camp.wood), 0, 12); W.barrelWater.position.y = .08 + clamp(camp.water / 10, 0, 1) * .95; W.barrelWater.visible = camp.water > 0; }
  };

  // ---------------- Tag/Nacht & Wetter ----------------
  const C = (h) => new THREE.Color(h);
  const SKY = [[0, C('#0b1630'), C('#04080f')], [5, C('#1b2440'), C('#0a0f1c')], [6.2, C('#f0a070'), C('#704a50')], [8, C('#a8d8e8'), C('#88b8a0')], [12, C('#a0d4f0'), C('#a8d0b8')], [17, C('#b0d0e0'), C('#a0c0a8')], [19, C('#f08a50'), C('#704858')], [20.3, C('#3a2a58'), C('#1a1830')], [22, C('#0b1630'), C('#060a14')], [24, C('#0b1630'), C('#04080f')]];
  const skyC = new THREE.Color(), fogC = new THREE.Color();
  W.setTime = function (hours, weather, dt) {
    W.hours = hours; const h = ((hours % 24) + 24) % 24; let i = 0; while (i < SKY.length - 1 && SKY[i + 1][0] <= h) i++;
    const a = SKY[i], b = SKY[Math.min(i + 1, SKY.length - 1)], t = b[0] > a[0] ? (h - a[0]) / (b[0] - a[0]) : 0;
    skyC.copy(a[1]).lerp(b[1], t); fogC.copy(a[2]).lerp(b[2], t).lerp(skyC, .4);
    const day = clamp(Math.sin((h - 6) / 14 * Math.PI), 0, 1), night = 1 - clamp((day - .02) * 6, 0, 1); W.nightK = night; W.dayK = day;
    W.weather = weather || 'sun'; const target = weather === 'rain' ? 1 : weather === 'storm' ? 1.3 : weather === 'cloud' ? .35 : 0; W.rainK = lerp(W.rainK, target, Math.min(1, (dt || .1) * .5));
    const gray = clamp(W.rainK, 0, 1) * .65; skyC.lerp(C('#5a6a70').multiplyScalar(.4 + day * .6), gray); fogC.lerp(C('#4a5a5a').multiplyScalar(.4 + day * .6), gray);
    W.scene.background.copy(skyC); W.scene.fog.color.copy(fogC); W.scene.fog.near = 14 - gray * 8; W.scene.fog.far = E.q.far * (1 - gray * .45) * (1 - night * .25);
    const sunA = (h - 6) / 12 * Math.PI; W.sun.position.set(Math.cos(sunA) * 40, Math.max(4, Math.sin(sunA) * 50), 18);
    W.sun.intensity = (.15 + day * .85) * (1 - gray * .6) * (1 - night * .85); W.sun.color.setHSL(.09, .6, .55 + day * .35);
    W.hemi.intensity = .25 + day * .55 - gray * .1 + (W.flash || 0); W.hemi.color.copy(skyC).lerp(C('#ffffff'), .5); W.hemi.groundColor.set(night > .5 ? '#1a1a30' : '#3a4a22');
    W.stars.material.opacity = night * (1 - gray) * .9; const ma = (h + 12 - 6) / 12 * Math.PI; W.moon.position.set(Math.cos(ma) * -120, Math.max(10, Math.sin(ma) * 110), -60); W.moon.material.opacity = night * (1 - gray * .8);
    W.sunSpr.position.copy(W.sun.position).multiplyScalar(2.6); W.sunSpr.material.opacity = day * (1 - gray) * .7; W.clouds.material.color = W.clouds.material.color || new THREE.Color(); W.clouds.material.opacity = .5 + gray * .45;
    W.clouds.material.color.setScalar(.35 + day * .65);
    swayUni.uW.value = 1 + W.rainK * 1.8;
  };
  W.setFire = function (fuel) { W.fuel = fuel; };

  // ---------------- Kamera & Spieler ----------------
  const cam = { yaw: Math.PI, pitch: .38, dist: 6.4, tx: 0, ty: 0, tz: 0, cine: null, shake: 0 };
  W.cam = cam;
  const pl = W.player = { x: 0, z: 8, y: 0, yaw: Math.PI, speed: 0, state: 'free', fig: null, carry: null, busyT: 0, seat: null, runK: 0 };
  W.spawnPlayer = look => { if (pl.fig) { W.scene.remove(pl.fig.group); E.dispose(pl.fig.group); } pl.fig = E.Figure(look); pl.carry = null; pl.state = 'free'; W.scene.add(pl.fig.group); pl.fig.setShadows(E.q.shadows); };
  W.collide = (x, z, r, skipWater) => {
    for (let k = 0; k < 2; k++) for (const c of W.colliders) { if (skipWater && c.water) continue; const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = c.r + r; if (d < m && d > 1e-4) { x = c.x + dx / d * m; z = c.z + dz / d * m; } }
    const d = Math.hypot(x, z); if (d > 46) { x *= 46 / d; z *= 46 / d; } return [x, z];
  };
  W.updatePlayer = function (dt, ctrl) {
    if (!pl.fig) return; const mv = I.poll(), look = I.consumeLook(), wheel = I.consumeWheel();
    if (!cam.cine) { cam.yaw -= look.dx * .0042; cam.pitch = clamp(cam.pitch + look.dy * .003, -.1, 1.15); cam.dist = clamp(cam.dist + wheel * .6, 3.2, 12); }
    let pose = 'idle', sp = 0;
    if (pl.state === 'free' && ctrl !== false) {
      const run = (I.down('run') || I.joyFull) && !pl.carry && (W.energy == null || W.energy > 8), base = pl.carry ? 2.6 : run ? 5.6 : 3.3, tired = W.energy != null && W.energy < 15 ? .75 : 1;
      const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw); // Blickrichtung der Kamera (vom Spieler weg)
      let vx = (-fx * mv.y + fz * mv.x), vz = (-fz * mv.y - fx * mv.x); const m = Math.hypot(vx, vz);
      if (m > .05) { vx /= Math.max(1, m); vz /= Math.max(1, m); const s = base * tired * Math.min(1, m); let nx = pl.x + vx * s * dt, nz = pl.z + vz * s * dt;[nx, nz] = W.collide(nx, nz, .35); pl.x = nx; pl.z = nz; pl.yaw = E.angLerp(pl.yaw, Math.atan2(vx, vz), Math.min(1, dt * 10)); sp = s; pose = pl.carry === 'wood' ? 'carry' : run && s > 4 ? 'run' : 'walk'; pl.runK = run ? pl.runK + dt : 0; }
      pl.y = W.heightAt(pl.x, pl.z);
    } else if (pl.state === 'sit') pose = 'sit'; else if (pl.state === 'sleep') pose = 'sleep'; else if (pl.state === 'busy') pose = pl.busyPose || 'work'; else if (pl.state === 'talk') pose = 'talk'; else if (pl.state === 'cheer') pose = 'cheer'; else if (pl.state === 'sad') pose = 'sad';
    pl.speed = sp; pl.fig.anim(dt, pose, sp); pl.fig.group.position.set(pl.x, pl.y + (pl.state === 'sit' ? .02 : 0), pl.z); pl.fig.group.rotation.y = pl.yaw;
    if (pl.state === 'sleep') { pl.fig.group.position.y = pl.y + .25; }
  };
  W.updateCamera = function (dt) {
    const c = W.camera;
    if (cam.cine) { const k = Math.min(1, dt * (cam.cine.speed || 1.5)); c.position.lerp(_v.set(cam.cine.px, cam.cine.py, cam.cine.pz), k); _v2.set(cam.cine.lx, cam.cine.ly, cam.cine.lz); cam.look = cam.look || new V3(); cam.look.lerp(_v2, k); c.lookAt(cam.look); return; }
    const tx = pl.x, ty = pl.y + 1.5, tz = pl.z; cam.tx = lerp(cam.tx, tx, Math.min(1, dt * 10)); cam.ty = lerp(cam.ty, ty, Math.min(1, dt * 6)); cam.tz = lerp(cam.tz, tz, Math.min(1, dt * 10));
    const d = cam.dist * (pl.state === 'sleep' ? .8 : 1); let px = cam.tx + Math.sin(cam.yaw) * Math.cos(cam.pitch) * d, pz = cam.tz + Math.cos(cam.yaw) * Math.cos(cam.pitch) * d, py = cam.ty + Math.sin(cam.pitch) * d;
    const gh = W.heightAt(px, pz) + .45; if (py < gh) py = gh;
    if (pl.x < 13 && pl.x > -13 && pl.z < -5 && pl.z > -14 && py > 3.1) { py = Math.min(py, 3.05); } // unter der Plane bleiben
    c.position.set(px, py, pz); cam.look = cam.look || new V3(); cam.look.set(cam.tx, cam.ty, cam.tz); c.lookAt(cam.look);
    if (cam.shake > 0) { cam.shake -= dt; c.position.x += (Math.random() - .5) * cam.shake * .3; c.position.y += (Math.random() - .5) * cam.shake * .3; }
  };
  W.cine = (px, py, pz, lx, ly, lz, speed) => { cam.cine = { px, py, pz, lx, ly, lz, speed }; };
  W.endCine = () => { cam.cine = null; };
  W.snapCam = face => { if (face) cam.yaw = pl.yaw + Math.PI; cam.tx = pl.x; cam.ty = pl.y + 1.5; cam.tz = pl.z; };

  // ---------------- Interaktionen ----------------
  W.addInteract = o => { W.interact.push(o); return o; };
  W.nearest = function () {
    if (pl.state !== 'free') return null; let best = null, bd = 1e9; const fx = Math.sin(pl.yaw), fz = Math.cos(pl.yaw);
    for (const o of W.interact) {
      const p = typeof o.pos === 'function' ? o.pos() : o; if (!p) continue; const dx = p.x - pl.x, dz = p.z - pl.z, d = Math.hypot(dx, dz); if (d > (o.r || 2)) continue;
      const lbl = o.label(); if (!lbl) continue; const facing = d < .9 ? 1 : (dx * fx + dz * fz) / d; const score = d - facing * .8 - (o.prio || 0);
      if (score < bd) { bd = score; best = { o, lbl, p }; }
    }
    return best;
  };

  // ---------------- Bildschirm-Projektion, Schilder ----------------
  const _p = new V3();
  W.project = (x, y, z) => { _p.set(x, y, z).project(W.camera); return { x: (_p.x + 1) / 2 * E.W, y: (1 - _p.y) / 2 * E.H, vis: _p.z < 1 && _p.z > -1 }; };
  const lblBox = () => document.getElementById('labels'); const pool = []; let used = 0;
  W.labelsBegin = () => { used = 0; };
  W.label = (x, y, z, html, cls) => {
    const s = W.project(x, y, z); if (!s.vis || s.x < -50 || s.x > E.W + 50 || s.y < -20 || s.y > E.H + 40) return;
    let el = pool[used]; if (!el) { el = document.createElement('div'); el.className = 'lbl'; lblBox().appendChild(el); pool.push(el); }
    used++; if (el._h !== html) { el.innerHTML = html; el._h = html; } const c = 'lbl ' + (cls || ''); if (el.className !== c) el.className = c; el.style.transform = `translate(${s.x.toFixed(0)}px,${s.y.toFixed(0)}px) translate(-50%,-100%)`; el.hidden = false;
  };
  W.labelsEnd = () => { for (let i = used; i < pool.length; i++) if (!pool[i].hidden) pool[i].hidden = true; };
  W.clearLabels = () => { used = 0; W.labelsEnd(); };

  // ---------------- Minikarte ----------------
  let mmT = 0;
  W.drawMinimap = function (dt, npcs, goal, force) {
    mmT -= dt; if (mmT > 0 && !force) return; mmT = .25; const cv = document.getElementById('minimap'); if (!cv || cv.hidden) return; const c = cv.getContext('2d'), S = cv.width, sc = S / 2 / 30;
    c.clearRect(0, 0, S, S); c.save(); c.beginPath(); c.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2); c.clip(); c.fillStyle = '#1d4a28'; c.fillRect(0, 0, S, S);
    c.translate(S / 2, S / 2); c.rotate(cam.yaw - Math.PI); c.translate(-pl.x * sc, -pl.z * sc);
    c.fillStyle = '#7a6040'; c.beginPath(); c.arc(0, 0, 9.5 * sc, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#8a7050'; c.lineWidth = 3 * sc; PATHS.forEach(p => { c.beginPath(); c.moveTo(p[0] * sc, p[1] * sc); c.lineTo(p[2] * sc, p[3] * sc); c.stroke(); });
    c.fillStyle = '#2d6f8a'; c.beginPath(); c.arc(SP.pond.x * sc, SP.pond.z * sc, SP.pond.r * sc, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#c89a5a'; c.beginPath(); c.arc(SP.stage.x * sc, SP.stage.z * sc, 5 * sc, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2f6f8f'; c.fillRect(-13 * sc, -14 * sc, 26 * sc, 9 * sc);
    const dot = (x, z, col, r) => { c.fillStyle = col; c.beginPath(); c.arc(x * sc, z * sc, r, 0, Math.PI * 2); c.fill(); };
    dot(0, 0, '#ff8a2a', 4); dot(SP.wood.x, SP.wood.z, '#a0703a', 3); dot(SP.barrel.x, SP.barrel.z, '#4aa3d8', 3); dot(SP.drum.x, SP.drum.z, '#ffcf4a', 3); dot(SP.hut.x, SP.hut.z, '#ff9ae0', 3); dot(SP.gate.x, SP.gate.z, '#ff4a3a', 4);
    W.branches.forEach(b => { if (b.have) dot(b.x, b.z, '#d8a060', 2); });
    (npcs || []).forEach(n => dot(n.x, n.z, n.col || '#fff', 3));
    if (goal) { dot(goal.x, goal.z, '#ffcf4a', 5); }
    c.restore(); c.fillStyle = '#ffcf4a'; c.beginPath(); c.moveTo(S / 2, S / 2 - 7); c.lineTo(S / 2 + 5, S / 2 + 5); c.lineTo(S / 2 - 5, S / 2 + 5); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2); c.stroke();
  };

  // ---------------- Pro Bild ----------------
  let rainT = 0;
  W.update = function (dt) {
    W.t += dt; swayUni.uT.value = W.t;
    // Feuer
    const fuel = W.fuel == null ? 1 : W.fuel, on = fuel > .02, k = clamp(fuel, .15, 1);
    W.flames.forEach((m, i) => { m.visible = on; const f = .82 + Math.sin(W.t * (9 + i * 2.3) + i) * .1 + Math.sin(W.t * 23 + i * 5) * .06; m.scale.set(m.userData.r * k * (1.05 - f * .1), m.userData.h * k * f * (1 + W.rainK * -.2), m.userData.r * k); m.position.y = m.scale.y / 2; });
    W.glow.visible = on; W.glow.material.opacity = (.25 + W.nightK * .5) * k;
    W.fireLight.intensity = on ? (.4 + W.nightK * 2.2) * k * (.9 + Math.sin(W.t * 13) * .08 + Math.sin(W.t * 31) * .05) : 0;
    W.torches.forEach((s, i) => { s.material.opacity = .35 + W.nightK * .6 + Math.sin(W.t * 11 + i) * .08; });
    if (W.waterTex) { W.waterTex.offset.x = W.t * .01; W.waterTex.offset.y = Math.sin(W.t * .3) * .02; }
    // Regen um die Kamera
    const raining = W.rainK > .45; W.rain.visible = raining;
    if (raining) { const a = W.rain.geometry.attributes.position.array, d = W.rainData, n = d.length / 3, cx = W.camera.position.x, cz = W.camera.position.z, fall = 22 * dt; for (let i = 0; i < n; i++) { let y = d[i * 3 + 1] - fall; if (y < 0) { y += 20; d[i * 3] = (Math.random() - .5) * 40; d[i * 3 + 2] = (Math.random() - .5) * 40; } d[i * 3 + 1] = y; const x = cx + d[i * 3], z = cz + d[i * 3 + 2], yy = y + W.camera.position.y - 6; a[i * 6] = x; a[i * 6 + 1] = yy; a[i * 6 + 2] = z; a[i * 6 + 3] = x + .05; a[i * 6 + 4] = yy - .6; a[i * 6 + 5] = z; } W.rain.geometry.attributes.position.needsUpdate = true; W.rain.material.opacity = .25 + W.rainK * .2; }
    if (W.weather === 'storm') { rainT -= dt; if (rainT <= 0) { rainT = 6 + Math.random() * 10; W.flash = 1.4; W.onThunder && W.onThunder(); } }
    if (W.flash) { W.flash = Math.max(0, W.flash - dt * 4); }
    // Glühwürmchen
    W.ff.material.opacity = W.nightK * (1 - W.rainK) * .95; if (W.ff.material.opacity > .02) { const a = W.ff.geometry.attributes.position.array; W.ffData.forEach((f, i) => { a[i * 3] = f.x + Math.sin(W.t * .5 + f.p) * 1.5; a[i * 3 + 1] = f.y + Math.sin(W.t * 1.3 + f.p * 2) * .4; a[i * 3 + 2] = f.z + Math.cos(W.t * .4 + f.p) * 1.5; }); W.ff.geometry.attributes.position.needsUpdate = true; }
    W.birds.forEach(b => { const u = b.userData, a = W.t * u.sp + u.p; b.visible = W.dayK > .2 && W.rainK < .5; b.position.set(Math.cos(a) * u.r, u.h + Math.sin(a * 3) * 1.5, Math.sin(a) * u.r); b.rotation.y = -a; b.children; b.scale.y = 1 + Math.sin(W.t * 10 + u.p) * .5; });
    W.clouds.rotation.y = W.t * .004;
    W.hosts.forEach((h, i) => h.anim(dt, W.hostPose ? W.hostPose[i] : 'idle'));
    // Schattenkamera folgt dem Spieler
    if (E.q.shadows) { W.sun.target.position.set(pl.x, 0, pl.z); W.sun.position.add(_v.set(pl.x, 0, pl.z)); }
    // Ring auf Ziel
  };
  W.render = r => { r.render(W.scene, W.camera); };
  root.UWorld = W;
})(window);
