/* Krawallvögel 3D – Modelle, Materialien, Kulissen und Partikel (Three.js r128, geteilte Geometrien). */
(function () {
'use strict';
const THREE = window.THREE, K = window.KVLevels;
const G = {}, M = {}, TEX = {};
const lam = (color, o) => new THREE.MeshLambertMaterial(Object.assign({ color }, o || {}));

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 2; return t;
}
function rnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
function cracks(c, w, h, stage, seed) {
  if (!stage) return;
  const r = rnd(seed + stage * 97);
  c.strokeStyle = 'rgba(20,10,5,.75)'; c.lineWidth = 2.2;
  for (let n = 0; n < stage * 3; n++) {
    let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 5; k++) { x += (r() - 0.5) * w * 0.35; y += (r() - 0.5) * h * 0.35; c.lineTo(x, y); }
    c.stroke();
  }
}
function blockTextures() {
  const S = 128;
  ['wood', 'stone', 'glass'].forEach(m => {
    TEX[m] = [0, 1, 2].map(stage => canvasTex(S, S, (c, w, h) => {
      const r = rnd(m.length * 1000 + 7);
      if (m === 'wood') {
        c.fillStyle = '#c98b4c'; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 26; i++) { c.strokeStyle = 'rgba(110,60,20,' + (0.15 + r() * 0.25) + ')'; c.lineWidth = 1 + r() * 2; const y = r() * h; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 8, w * 0.6, y + (r() - 0.5) * 8, w, y + (r() - 0.5) * 6); c.stroke(); }
        c.strokeStyle = '#7a4a1e'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
      } else if (m === 'stone') {
        c.fillStyle = '#9ea3ab'; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 180; i++) { const g = 120 + r() * 60 | 0; c.fillStyle = 'rgba(' + g + ',' + g + ',' + (g + 8) + ',.5)'; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 7, 0, 7); c.fill(); }
        c.strokeStyle = '#5d6168'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
      } else {
        const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e8fbff'); g.addColorStop(0.5, '#9fdcf5'); g.addColorStop(1, '#d4f4ff');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 7; c.strokeRect(4, 4, w - 8, h - 8);
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(w * 0.2, h * 0.75); c.lineTo(w * 0.45, h * 0.25); c.stroke();
      }
      cracks(c, w, h, stage, m.length * 31);
    }));
  });
  TEX.tnt = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = '#c8261c'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a120c'; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 14, w, 14);
    c.fillStyle = '#ffd94a'; c.font = 'bold 46px Fredoka, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TNT', w / 2, h / 2 + 2);
  });
}
function initMaterials() {
  blockTextures();
  M.block = {
    wood:TEX.wood.map(t => lam(0xffffff, { map:t })),
    stone:TEX.stone.map(t => lam(0xffffff, { map:t })),
    glass:TEX.glass.map(t => lam(0xffffff, { map:t, transparent:true, opacity:0.78, emissive:0x204050 }))
  };
  M.tnt = lam(0xffffff, { map:TEX.tnt });
  M.crate = M.block.wood[0];
  M.gold = lam(0xffc83a, { emissive:0x6a4a00 });
  M.pig = [lam(0x7fcf3c), lam(0x8ab83a), lam(0x8e9a3a)];
  M.snout = lam(0x9fe35d); M.dark = lam(0x1b1b1b); M.white = lam(0xffffff); M.helmet = lam(0x8b919c); M.beard = lam(0x5a3818);
  M.crownGold = lam(0xffcf3a, { emissive:0x553300 }); M.beak = lam(0xf6a71a); M.fuse = lam(0x6b5a40); M.spark = lam(0xffd04a, { emissive:0xff8a00 });
  M.slingWood = lam(0x8a5528); M.band = lam(0x3b2414); M.trail = new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.85 });
  M.aim = new THREE.MeshBasicMaterial({ color:0xffffff });
  M.flash = new THREE.MeshBasicMaterial({ color:0xffb340, transparent:true, opacity:0.8, depthWrite:false });
  M.smoke = new THREE.MeshLambertMaterial({ color:0xffffff, transparent:true, opacity:0.75, depthWrite:false });
  M.debris = new THREE.MeshLambertMaterial({ color:0xffffff });
  M.jewel = lam(0xe0303a, { emissive:0x400000 }); M.eagleBody = lam(0x6b3f1e); M.eagleHead = lam(0xf4f1e8);
  M.logo = []; M.logoGold = [];
}
function initGeometry() {
  G.box = new THREE.BoxGeometry(1, 1, 1);
  G.sphere = new THREE.SphereGeometry(1, 22, 16);
  G.sphereLo = new THREE.SphereGeometry(1, 8, 6);
  G.halfSphere = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  G.cylZ = new THREE.CylinderGeometry(1, 1, 1, 22).rotateX(Math.PI / 2);
  G.cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
  G.cone = new THREE.ConeGeometry(1, 1, 12);
  G.coneX = new THREE.ConeGeometry(1, 1, 10).rotateZ(-Math.PI / 2);
  G.tri = new Map();
}
function triGeometry(pts, depth) {
  const key = pts.map(p => p.join(',')).join(';');
  if (!G.tri.has(key)) {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => sh.lineTo(p[0], p[1])); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled:false }); g.translate(0, 0, -depth / 2);
    // UVs der Extrusion sind in Metern – auf 0..1 bringen, damit die Holz-/Steintextur passt
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.5 + 0.5, uv.getY(i) * 0.5 + 0.5);
    G.tri.set(key, g);
  }
  return G.tri.get(key);
}
function logoMaterial(tex, gold) {
  const list = gold ? M.logoGold : M.logo;
  if (!list[tex.id]) list[tex.id] = lam(0xffffff, { map:tex, emissive:gold ? 0x332200 : 0x000000 });
  return list[tex.id];
}

// ---------- Blöcke ----------
function makeBlock(ent, logoTex) {
  const d = ent.def; let mesh;
  if (d.m === 'logo' || d.m === 'gold') {
    const face = logoMaterial(logoTex(d.logo), d.m === 'gold'), side = d.m === 'gold' ? M.gold : M.crate;
    mesh = new THREE.Mesh(G.box, [side, side, side, side, face, side]);
    mesh.scale.set(d.w, d.h, d.w);
  } else {
    const mat = d.m === 'tnt' ? M.tnt : M.block[d.m][0];
    if (d.t === 'circle') { mesh = new THREE.Mesh(G.cylZ, mat); mesh.scale.set(d.r, d.r, 0.9); }
    else if (d.t === 'tri') mesh = new THREE.Mesh(triGeometry(d.pts, 1), mat);
    else { mesh = new THREE.Mesh(G.box, mat); mesh.scale.set(d.w, d.h, d.m === 'tnt' ? d.w : 1); }
  }
  mesh.userData.stage = 0;
  return mesh;
}
function setBlockStage(ent, mesh) {
  if (!M.block[ent.m]) return;
  const f = ent.hp / ent.maxHp, st = f > 0.66 ? 0 : f > 0.33 ? 1 : 2;
  if (mesh.userData.stage !== st) { mesh.userData.stage = st; mesh.material = M.block[ent.m][st]; }
}

// ---------- Schweine (Einheitsradius 1, Gruppe wird skaliert) ----------
function part(geo, mat, x, y, z, sx, sy, sz, parent) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz); parent.add(m); return m;
}
function makePig(kind) {
  const g = new THREE.Group(), r = K.PIGS[kind].r;
  const body = part(G.sphere, M.pig[0], 0, 0, 0, 1, 0.94, 0.92, g);
  part(G.cylZ, M.snout, -0.22, -0.08, 0.86, 0.36, 0.3, 0.28, g);
  part(G.sphereLo, M.dark, -0.33, -0.08, 1.0, 0.07, 0.09, 0.05, g); part(G.sphereLo, M.dark, -0.11, -0.08, 1.0, 0.07, 0.09, 0.05, g);
  const eyes = [], pupils = [];
  [[-0.62, 0.3, 0.66], [0.12, 0.34, 0.84]].forEach(p => {
    eyes.push(part(G.sphere, M.white, p[0], p[1], p[2], 0.21, 0.24, 0.16, g));
    pupils.push(part(G.sphereLo, M.dark, p[0] - 0.06, p[1] - 0.02, p[2] + 0.13, 0.09, 0.1, 0.06, g));
  });
  part(G.sphereLo, M.snout, -0.55, 0.86, 0.25, 0.2, 0.17, 0.12, g); part(G.sphereLo, M.snout, 0.45, 0.88, 0.2, 0.2, 0.17, 0.12, g);
  if (kind === 'helmet') { part(G.halfSphere, M.helmet, 0, 0.12, 0, 1.08, 1.0, 1.04, g); part(G.box, M.helmet, 0, 0.12, 0, 2.2, 0.08, 2.1, g); }
  if (kind === 'beard') { part(G.box, M.beard, -0.22, -0.4, 0.88, 0.85, 0.16, 0.18, g); part(G.box, M.beard, -0.25, 0.58, 0.82, 0.7, 0.1, 0.1, g).rotation.z = 0.15; }
  if (kind === 'king') {
    part(G.cyl, M.crownGold, 0, 1.12, 0, 0.52, 0.42, 0.52, g);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; part(G.cone, M.crownGold, Math.cos(a) * 0.42, 1.48, Math.sin(a) * 0.42, 0.11, 0.3, 0.11, g); }
    part(G.sphereLo, M.jewel, 0, 1.2, 0.5, 0.1, 0.1, 0.06, g);
  }
  g.scale.setScalar(r);
  g.userData = { body, eyes, pupils, stage:0, blink:Math.random() * 4 };
  return g;
}
function setPigStage(ent, g, t) {
  const f = ent.hp / ent.maxHp, st = f > 0.66 ? 0 : f > 0.33 ? 1 : 2, u = g.userData;
  if (u.stage !== st) { u.stage = st; u.body.material = M.pig[st]; }
  const blink = ((t + u.blink) % 4) < 0.12 || st === 2 ? 0.25 : 1;
  u.eyes.forEach(e => { e.scale.y = 0.24 * blink; }); u.pupils.forEach(p => { p.visible = blink > 0.5; });
}

// ---------- Vögel ----------
function makeBird(type) {
  const T = K.BIRDS[type], g = new THREE.Group();
  if (!M['bird_' + type]) M['bird_' + type] = [lam(T.color), lam(T.belly)];
  const col = M['bird_' + type][0], belly = M['bird_' + type][1];
  const sy = type === 'white' ? 1.15 : 1;
  part(G.sphere, col, 0, 0, 0, 1, sy, 0.95, g);
  part(G.sphere, belly, 0.1, -0.38 * sy, 0.5, 0.72, 0.55, 0.5, g);
  [[0.32, 0.28, 0.78], [0.72, 0.24, 0.5]].forEach(p => {
    part(G.sphere, M.white, p[0], p[1] * sy, p[2], 0.25, 0.27, 0.18, g);
    part(G.sphereLo, M.dark, p[0] + 0.1, p[1] * sy, p[2] + 0.14, 0.1, 0.11, 0.07, g);
  });
  const brow = type === 'big' ? 0.16 : 0.1;
  part(G.box, M.dark, 0.3, 0.55 * sy, 0.82, 0.46, brow, 0.12, g).rotation.z = -0.35;
  part(G.box, M.dark, 0.74, 0.5 * sy, 0.55, 0.4, brow, 0.12, g).rotation.z = -0.5;
  const beak = type === 'green' ? 0.42 : 0.28;
  part(G.coneX, M.beak, 0.98, -0.02, 0.32, 0.55 + beak, beak, beak, g);
  [-0.15, 0, 0.15].forEach((z, i) => { part(G.box, M.dark, -1.0, 0.1 - i * 0.12, z, 0.38, 0.12, 0.12, g).rotation.z = 0.3 - i * 0.3; });
  [0, 1].forEach(i => { part(G.box, col, -0.1 + i * 0.22, 1.02 * sy, 0, 0.12, 0.42, 0.12, g).rotation.z = 0.4 - i * 0.5; });
  if (type === 'black') { part(G.cyl, M.fuse, 0, 1.12, 0, 0.1, 0.35, 0.1, g); part(G.sphereLo, M.spark, 0, 1.34, 0, 0.12, 0.12, 0.12, g); }
  if (type === 'yellow') part(G.cone, col, -0.05, 0.95, 0, 0.55, 0.7, 0.55, g);
  g.scale.setScalar(T.r);
  return g;
}
function makeEgg() { const g = new THREE.Group(); part(G.sphere, M.white, 0, 0, 0, 1, 1.25, 1, g); g.scale.setScalar(0.32); return g; }
function makeEagle() {
  const g = new THREE.Group();
  part(G.sphere, M.eagleBody, 0, 0, 0, 1.2, 0.8, 0.8, g);
  part(G.sphere, M.eagleHead, -1.05, 0.35, 0, 0.5, 0.48, 0.48, g);
  part(G.coneX, M.beak, -1.55, 0.25, 0, -0.5, 0.18, 0.18, g);
  part(G.sphereLo, M.dark, -1.25, 0.5, 0.35, 0.08, 0.08, 0.05, g);
  const wings = [part(G.box, M.eagleBody, 0.1, 0.3, 0.8, 1.4, 0.1, 1.6, g), part(G.box, M.eagleBody, 0.1, 0.3, -0.8, 1.4, 0.1, 1.6, g)];
  g.userData.wings = wings; g.scale.setScalar(3.3);
  return g;
}

// ---------- Schleuder ----------
function makeSling() {
  // Y-Gabel in der Bildebene: linker Arm hinter dem Vogel, rechter Arm davor
  const g = new THREE.Group();
  part(G.cyl, M.slingWood, 0, 1.05, 0, 0.22, 2.1, 0.22, g).castShadow = true;
  const arm = (x, z, rot) => { const p = part(G.cyl, M.slingWood, x, 2.55, z, 0.17, 1.15, 0.17, g); p.rotation.z = rot; p.castShadow = true; return p; };
  arm(-0.22, -0.32, 0.36); arm(0.22, 0.32, -0.36);
  part(G.box, M.band, -0.47, 3.0, -0.32, 0.26, 0.32, 0.26, g); part(G.box, M.band, 0.47, 3.0, 0.32, 0.26, 0.32, 0.26, g);
  const tips = [new THREE.Vector3(-0.47, 3.08, -0.32), new THREE.Vector3(0.47, 3.08, 0.32)];
  const bands = tips.map(() => { const b = new THREE.Mesh(G.cyl, M.band); g.add(b); return b; });
  const pouch = part(G.box, M.band, 0, 3.1, 0, 0.3, 0.55, 0.8, g);
  g.userData = { tips, bands, pouch };
  return g;
}
const tmpV = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
function setBand(mesh, a, b, thick) {
  tmpV.subVectors(b, a); const len = tmpV.length();
  mesh.position.copy(a).addScaledVector(tmpV, 0.5);
  mesh.scale.set(thick, Math.max(0.01, len), thick);
  if (len > 1e-4) mesh.quaternion.setFromUnitVectors(up, tmpV.normalize());
}
function updateSling(g, bx, by, br) {
  const u = g.userData, back = new THREE.Vector3(bx - br * 0.9, by, 0);
  setBand(u.bands[0], u.tips[0], new THREE.Vector3(back.x, back.y, -0.25), 0.09);
  setBand(u.bands[1], u.tips[1], new THREE.Vector3(back.x, back.y, 0.25), 0.09);
  u.pouch.position.set(back.x, back.y, 0);
}

// ---------- Kulisse (Materialien je Level, werden beim Levelwechsel freigegeben) ----------
let SCN = [];
const smat = (c, o) => { const m = lam(c, o); SCN.push(m); return m; };
function skyTexture(top, bottom) {
  const a = new THREE.Color(top), b = new THREE.Color(bottom);
  return canvasTex(4, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#' + a.getHexString()); g.addColorStop(1, '#' + b.getHexString()); c.fillStyle = g; c.fillRect(0, 0, w, h); });
}
function buildScenery(level, root, logoTex, quality) {
  SCN = root.userData.mats = [];
  const W = K.WORLDS[level.world], r = rnd(level.id * 7 + 3), width = level.width;
  const add = (geo, mat, x, y, z, sx, sy, sz) => part(geo, mat, x, y, z, sx, sy, sz, root);
  // Boden
  const ground = add(G.box, smat(W.ground), width / 2, -2.2, -20, width + 220, 4, 52);
  ground.receiveShadow = true;
  add(G.box, smat(W.grass), width / 2, -0.12, 1.2, width + 220, 0.24, 5.6).receiveShadow = true;
  // Gelände/Hügel aus der Physik
  level.terrain.forEach(t => {
    const sh = new THREE.Shape(); sh.moveTo(t.pts[0][0], t.pts[0][1]); t.pts.slice(1).forEach(p => sh.lineTo(p[0], p[1])); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth:t.ledge ? 1.6 : 4.2, bevelEnabled:false }); geo.translate(0, 0, t.ledge ? -0.8 : -2.4);
    const m = new THREE.Mesh(geo, t.ledge ? M.block.stone[0] : smat(W.hill)); m.receiveShadow = true; m.castShadow = true; root.add(m);
    if (!t.ledge) { const top = t.pts[2], tl = t.pts[3]; add(G.box, smat(W.grass), (top[0] + tl[0]) / 2, top[1] - 0.06, -0.3, top[0] - tl[0] + 0.1, 0.14, 4.25); }
    m.userData.dispose = geo;
  });
  // Ferne Hügel
  const farMat = smat(W.far), hillMat = smat(W.hill);
  for (let i = 0; i < 9; i++) {
    const x = -40 + i * (width + 80) / 8 + r() * 10, s = 18 + r() * 22;
    add(G.sphereLo, i % 2 ? farMat : hillMat, x, -s * 0.45, -70 - r() * 40, s * 1.6, s, s * 0.6);
  }
  // Themen-Deko (mittlere Ebene)
  const n = quality === 'low' ? 5 : 10, theme = W.theme;
  for (let i = 0; i < n; i++) {
    const x = -25 + i * (width + 45) / n + r() * 4, z = -10 - r() * 18;
    decor(theme, add, x, z, r);
  }
  // Werbetafeln mit Senderlogos
  [[-9, W.logo], [width * 0.55, 1 + Math.floor(r() * 16)], [width + 8, W.logo]].forEach(([x, logo], i) => {
    const z = -7 - i * 1.5;
    add(G.cyl, M.slingWood, x - 1.4, 2.2, z, 0.14, 4.4, 0.14); add(G.cyl, M.slingWood, x + 1.4, 2.2, z, 0.14, 4.4, 0.14);
    add(G.box, M.dark, x, 4.6, z - 0.06, 3.7, 3.7, 0.1);
    const face = new THREE.Mesh(G.box, smat(0xffffff, { map:logoTex(logo), emissive:0x111111 })); face.position.set(x, 4.6, z); face.scale.set(3.4, 3.4, 0.12); root.add(face);
  });
  // Licht und Himmel
  return { sky:skyTexture(W.sky[0], W.sky[1]), fog:new THREE.Color(W.sky[1]) };
}
function decor(theme, add, x, z, r) {
  const s = 0.8 + r() * 0.7;
  if (theme === 'beach' || theme === 'desert') {
    if (theme === 'desert' && r() < 0.5) { const c = smat(0x4f9a3a); add(G.cyl, c, x, 1.5 * s, z, 0.45 * s, 3 * s, 0.45 * s); add(G.cyl, c, x + 0.7 * s, 1.9 * s, z, 0.25 * s, 1.2 * s, 0.25 * s); return; }
    const trunk = smat(0x9a6a3a), leaf = smat(theme === 'beach' ? 0x2f9a3a : 0x6a8a3a);
    add(G.cyl, trunk, x, 2.5 * s, z, 0.22 * s, 5 * s, 0.22 * s);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = add(G.box, leaf, x + Math.cos(a) * 1.1 * s, 5 * s, z + Math.sin(a) * 1.1 * s, 2.4 * s, 0.12, 0.6 * s); l.rotation.y = -a; l.rotation.z = -0.35; }
  } else if (theme === 'city') {
    const h = 8 + r() * 16, b = add(G.box, smat(0x2a2d55), x, h / 2, z - 6, 5 + r() * 3, h, 4);
    for (let i = 0; i < 4; i++) add(G.box, smat(0xffe08a, { emissive:0x8a6a10 }), x - 1.5 + (i % 2) * 3, 2 + r() * (h - 3), z - 3.9, 0.7, 0.9, 0.05);
    b.castShadow = false;
  } else if (theme === 'alps' || theme === 'winter') {
    const g = smat(theme === 'winter' ? 0x2e6a4a : 0x2f7a3a), snow = smat(0xffffff);
    add(G.cyl, smat(0x6a4a2a), x, 0.8 * s, z, 0.25 * s, 1.6 * s, 0.25 * s);
    add(G.cone, g, x, 3 * s, z, 1.6 * s, 3.2 * s, 1.6 * s); add(G.cone, theme === 'winter' ? snow : g, x, 4.6 * s, z, 1.1 * s, 2 * s, 1.1 * s);
  } else if (theme === 'clouds') {
    const c = smat(0xffffff);
    for (let i = 0; i < 4; i++) add(G.sphereLo, c, x + i * 1.2 * s, 6 + r() * 6 + (i % 2) * 0.6, z, 1.4 * s, 1 * s, 1 * s);
  } else if (theme === 'club' || theme === 'arcade') {
    const neon = [0xff3fd1, 0x35f2ff, 0xfff04a, 0x7a5cff][Math.floor(r() * 4)];
    add(G.cyl, smat(neon, { emissive:neon }), x, 5, z, 0.18, 10, 0.18);
    if (theme === 'club' && r() < 0.4) add(G.sphere, smat(0xdddddd, { emissive:0x444444 }), x, 10.5, z, 1, 1, 1);
    if (theme === 'arcade') add(G.box, smat(neon, { emissive:neon }), x + 1.2, 1 + r() * 4, z, 1, 1, 1);
  } else if (theme === 'volcano') {
    if (r() < 0.3) { add(G.cone, smat(0x4a2a22), x, 7, z - 10, 9, 14, 9); add(G.sphereLo, smat(0xff5a1f, { emissive:0xff3a00 }), x, 13.6, z - 10, 2.2, 0.8, 2.2); }
    else add(G.box, smat(0x5a3a30), x, 1.2 * s, z, 2 * s, 2.4 * s, 2 * s).rotation.y = r();
  } else if (theme === 'castle') {
    const st = smat(0x8a8a7a); const h = 6 + r() * 6;
    add(G.box, st, x, h / 2, z - 4, 4, h, 4);
    for (let i = 0; i < 3; i++) add(G.box, st, x - 1.4 + i * 1.4, h + 0.5, z - 4, 0.8, 1, 4);
    if (r() < 0.5) add(G.box, smat(0xe0303a), x, h + 2.2, z - 4, 1.2, 0.8, 0.05);
  }
}

// ---------- Partikel (instanziert, ein Draw-Call je Sorte, feste Plätze im Ringpuffer) ----------
function Particles(scene, count, geo, mat) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
  const color = new THREE.Color(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < count; i++) { mesh.setColorAt(i, color.setHex(0xffffff)); mesh.setMatrixAt(i, zero); }
  scene.add(mesh);
  const P = Array.from({ length:count }, () => ({ life:0 }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  let next = 0, active = 0;
  return {
    mesh,
    emit(x, y, z, vx, vy, vz, size, hex, life, grav, grow) {
      const i = next; next = (next + 1) % count;
      Object.assign(P[i], { x, y, z, vx, vy, vz, size, life, max:life, grav, grow:grow || 0, rx:Math.random() * 6, ry:Math.random() * 6, spin:(Math.random() - 0.5) * 12 });
      mesh.setColorAt(i, color.setHex(hex)); mesh.instanceColor.needsUpdate = true;
      active++;
    },
    update(dt) {
      if (!active) return;
      let alive = 0, top = 0;
      for (let i = 0; i < count; i++) {
        const p = P[i]; if (p.life <= 0) continue;
        p.life -= dt;
        if (p.life <= 0) { mesh.setMatrixAt(i, zero); continue; }
        p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rx += p.spin * dt; p.ry += p.spin * 0.7 * dt;
        if (p.grav > 0 && p.y < 0.05) { p.y = 0.05; p.vy *= -0.3; p.vx *= 0.6; }
        const k = p.life / p.max, s = p.grow ? p.size * (1 + (1 - k) * p.grow) * Math.min(1, k * 3) : p.size * Math.min(1, k * 2.5);
        pos.set(p.x, p.y, p.z); q.setFromEuler(e.set(p.rx, p.ry, 0)); sc.set(s, s, s);
        mesh.setMatrixAt(i, m4.compose(pos, q, sc));
        alive++; top = i + 1;
      }
      active = alive; mesh.count = top; mesh.instanceMatrix.needsUpdate = true;
    },
    clear() { P.forEach((p, i) => { p.life = 0; mesh.setMatrixAt(i, zero); }); active = 0; mesh.count = 0; mesh.instanceMatrix.needsUpdate = true; }
  };
}

// Kleines Porträtbild eines Modells (für Menüs), einmalig über ein Render-Target
function portrait(renderer, obj, size) {
  size = size || 128;
  const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0x666677, 0.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(2, 3, 4); scene.add(dl);
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  obj.position.sub(c); scene.add(obj);
  const r = Math.max(s.x, s.y) * 0.62, cam = new THREE.OrthographicCamera(-r, r, r, -r, 0.1, 50); cam.position.set(0.6, 0.4, 10); cam.lookAt(0, 0, 0);
  const rt = new THREE.WebGLRenderTarget(size, size), px = new Uint8Array(size * size * 4);
  const old = renderer.getClearAlpha(); renderer.setClearAlpha(0);
  renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam); renderer.readRenderTargetPixels(rt, 0, 0, size, size, px); renderer.setRenderTarget(null);
  renderer.setClearAlpha(old); rt.dispose();
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c2 = cv.getContext('2d'), img = c2.createImageData(size, size);
  for (let y = 0; y < size; y++) img.data.set(px.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
  c2.putImageData(img, 0, 0);
  return cv.toDataURL();
}

function init() { initGeometry(); initMaterials(); }
window.KVModels = { init, G, M, makeBlock, setBlockStage, makePig, setPigStage, makeBird, makeEgg, makeEagle, makeSling, updateSling, buildScenery, Particles, portrait, part };
})();
