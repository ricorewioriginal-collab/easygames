// Park aufbauen: Boden (mit Pool-Aussparungen), Elemente, Deko, Sammelobjekte, Licht.
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { Level, buildMeshes, orient } from './level.js';
import { pbr, texConcrete, texWood, texGraffiti, texStripes, lin } from './gfx.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function texWindows(scene, seed, lit, neon) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = neon ? '#0b0c18' : '#3d4148'; g.fillRect(0, 0, 256, 512);
  for (let y = 8; y < 512; y += 22) for (let x = 8; x < 256; x += 20) {
    const on = lit && r() < 0.35;
    g.fillStyle = on ? (neon ? ['#ff6af0', '#6af0ff', '#ffd06a'][(r() * 3) | 0] : '#ffd99a') : (neon ? '#141628' : `rgba(150,180,210,${0.35 + r() * 0.3})`);
    g.fillRect(x, y, 12, 14);
  }
  const t = new DynamicTexture('win' + seed, c, scene, true); t.update(); return t;
}
function texTiles(scene, base, line) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), r = rng(5);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = (r() * 20 - 10) | 0; g.fillStyle = `rgba(${128 + v},${128 + v},${140 + v},.12)`; g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); }
  g.strokeStyle = line; g.lineWidth = 3; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
  const t = new DynamicTexture('tiles' + base, c, scene, true); t.update(); return t;
}
function texLetter(scene, ch, col) {
  const t = new DynamicTexture('let' + ch, { width: 256, height: 256 }, scene, true); const g = t.getContext();
  g.clearRect(0, 0, 256, 256); g.font = '900 200px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 18; g.strokeStyle = '#111'; g.strokeText(ch, 128, 140); g.fillStyle = col; g.fillText(ch, 128, 140); t.hasAlpha = true; t.update(); return t;
}

export function buildWorld(game, park) {
  const { scene, shadow } = game;
  const pal = park.palette, night = !!park.neon;
  // Deko im Spielfeld bekommt eine Kollision
  const def = Object.assign({}, park, { elements: park.elements.slice() });
  const [bx0, bz0, bx1, bz1] = park.bounds;
  const inside = d => d.x > bx0 && d.x < bx1 && d.z > bz0 && d.z < bz1;
  for (const d of park.deco) if (d.x != null && inside(d) && /lamp|tree|palm|neonLamp/.test(d.t)) def.elements.push({ t: 'cyl', x: d.x, z: d.z, r: d.t === 'tree' || d.t === 'palm' ? 0.35 : 0.2, h: 4, mat: 'metalDark', invisible: true });
  const level = new Level(def);

  // ---------------- Materialien
  const conc = texConcrete(scene, '#9c9a94', 7, 1), concDark = texConcrete(scene, '#77767a', 9, 1);
  const M = {};
  M.concrete = pbr(scene, 'concrete', { tex: conc, rough: 0.92 });
  M.ledge = pbr(scene, 'ledge', { tex: texConcrete(scene, '#b7b4ac', 12, 1), rough: 0.7 });
  M.ramp = pbr(scene, 'ramp', { tex: texConcrete(scene, pal.ramp, 21, 1), rough: 0.55, clear: night ? 0.4 : 0 });
  M.rampSide = pbr(scene, 'rampSide', { tex: texWood(scene, 4), color: night ? '#5a5f7a' : '#ffffff', rough: 0.8 });
  M.deck = pbr(scene, 'deckM', { tex: texWood(scene, 8), color: pal.deck === '#2a2c38' ? '#6a6f8a' : '#ffffff', rough: 0.75 });
  M.metal = pbr(scene, 'metalM', { color: '#c8cdd4', metal: 1, rough: 0.28 });
  M.metalDark = pbr(scene, 'metalDark', { color: '#40444c', metal: 0.8, rough: 0.45 });
  M.metalBox = pbr(scene, 'metalBox', { tex: texStripes(scene, '#8f969e', '#7f868e'), metal: 0.7, rough: 0.4 });
  M.pool = pbr(scene, 'pool', { tex: night ? texTiles(scene, '#2a3c6a', '#3cf0ff') : texTiles(scene, '#7fb7d6', '#e8f4fa'), rough: 0.35, clear: 0.5 });
  M.graffiti = pbr(scene, 'graffiti', { tex: texGraffiti(scene, 4, ['#59626b', '#ff5a3c', '#2ec4ff', '#ffd43a', '#ff4f8b', '#2ecc71']), rough: 0.85 });
  M.neonWall = pbr(scene, 'neonWall', { tex: texGraffiti(scene, 19, ['#14162a', '#ff3cf0', '#3cf0ff', '#7c4dff', '#ffd43a']), rough: 0.7, emissive: '#ffffff', emI: 0.18 });
  M.neonWall.emissiveTexture = M.neonWall.albedoTexture;
  M.wall = M.graffiti; M.wallTop = night ? pbr(scene, 'wallTopN', { color: '#ff3cf0', emissive: '#ff3cf0', emI: 2.2 }) : pbr(scene, 'wallTop', { color: '#8d8b86', rough: 0.9 });
  M.parapet = pbr(scene, 'parapet', { tex: texConcrete(scene, '#c07a5c', 31, 1), rough: 0.9 });
  M.container = pbr(scene, 'container', { tex: texStripes(scene, '#c2402e', '#a83526'), rough: 0.55, metal: 0.4 });
  M.container2 = pbr(scene, 'container2', { tex: texStripes(scene, '#2a6fb5', '#215a94'), rough: 0.55, metal: 0.4 });
  M.planter = pbr(scene, 'planter', { tex: concDark, rough: 0.9 });
  M.roofHigh = pbr(scene, 'roofHigh', { tex: texTiles(scene, '#8a8d94', '#6f7278'), rough: 0.85 });
  M.glass = pbr(scene, 'glass', { color: '#9fd4ff', metal: 0.1, rough: 0.05, alpha: 0.55 });
  M.tank = pbr(scene, 'tank', { tex: texWood(scene, 12), rough: 0.8 });
  M.brick = pbr(scene, 'brick', { tex: texStripes(scene, '#9a4a36', '#8a3e2d'), rough: 0.9 });
  M.tilesHigh = pbr(scene, 'tilesHigh', { tex: texTiles(scene, '#4a4e66', '#ff3cf0'), rough: 0.6 });
  M.neonRail = pbr(scene, 'neonRail', { color: '#3cf0ff', emissive: '#3cf0ff', emI: 2.4, metal: 0.2, rough: 0.3 });
  for (const k in M) { const t = M[k].albedoTexture; if (t && t.uScale === 1) { t.uScale = t.vScale = 1; } }

  // ---------------- Elemente
  const meshes = buildMeshes(level, scene, M);
  for (const m of meshes) if (shadow && !/lvl_(wall|graffiti|neonWall|parapet)/.test(m.name)) shadow.addShadowCaster(m);
  for (const e of level.els) if (e.invisible) { /* nur Kollision für Deko */ }
  // unsichtbare Deko-Kollisionen: Meshes ausblenden
  scene.meshes.filter(m => m.name === 'cyl').forEach(m => { const e = level.els.find(el => el.t === 'cyl' && Math.abs(el.x - m.position.x) < 0.01 && Math.abs(el.z - m.position.z) < 0.01); if (e && e.invisible) m.setEnabled(false); });

  // ---------------- Boden mit Aussparungen für Pools
  const gTex = park.ground === 'tiles' ? texTiles(scene, park.groundC, '#2a2c3a') : park.ground === 'roof' ? texTiles(scene, park.groundC, '#6a6c72') : texConcrete(scene, park.groundC, 3, 1);
  const gMat = pbr(scene, 'groundM', { tex: gTex, rough: park.ground === 'tiles' ? 0.45 : 0.9, clear: night ? 0.35 : 0 });
  gTex.uScale = gTex.vScale = 1;
  const ground = groundMesh(scene, level, park.bounds, park.ground === 'concrete' ? 4 : 2);
  ground.material = gMat; ground.receiveShadows = true; ground.freezeWorldMatrix();
  // Außenboden
  const outer = MeshBuilder.CreateGround('outer', { width: 420, height: 420 }, scene);
  outer.position.y = -0.05; const oMat = pbr(scene, 'outerM', { tex: texConcrete(scene, night ? '#22232c' : '#6f6e6a', 13, 1), rough: 0.95 }); oMat.albedoTexture.uScale = oMat.albedoTexture.vScale = 60; outer.material = oMat; outer.receiveShadows = true;
  // innerhalb der Grenzen verdeckt der Spielboden; Außenboden liegt darunter (keine Überschneidung mit Pools, weil tiefer als 0 nur dort sichtbar wo kein Pool)
  outer.setEnabled(true);
  // Pool-Inneres verdecken wir nicht – der Außenboden bei y=-0.05 würde durch Pools schneiden: Loch durch Ausschnitt vermeiden
  if (level.bowls.length) { outer.dispose(); outerRing(scene, park.bounds, oMat); }

  // ---------------- Deko
  const deco = new TransformNode('deco', scene);
  const r = rng(park.music * 7 + 3);
  const lights = [];
  for (const d of park.deco) {
    switch (d.t) {
      case 'city': {
        const mats = [0, 1, 2].map(i => { const m = pbr(scene, 'bld' + i, { tex: texWindows(scene, d.seed + i, !!d.lit, !!d.neon), rough: 0.6, metal: 0.1 }); if (d.lit) { m.emissiveTexture = m.albedoTexture; m.emissiveColor = Color3.White(); m.emissiveIntensity = d.neon ? 0.9 : 0.35; } return m; });
        const parts = [[], [], []];
        for (let i = 0; i < d.n; i++) {
          const a = (i / d.n) * Math.PI * 2 + r() * 0.2, R = d.r + r() * 40, w = 10 + r() * 16, h = d.hMin + r() * (d.hMax - d.hMin);
          const b = MeshBuilder.CreateBox('bld', { width: w, depth: 10 + r() * 14, height: h }, scene);
          b.position.set(Math.cos(a) * R, h / 2 - 0.05, Math.sin(a) * R); b.rotation.y = -a + Math.PI / 2;
          const uv = b.getVerticesData('uv'); for (let k = 0; k < uv.length; k += 2) { uv[k] *= w / 12; uv[k + 1] *= h / 20; } b.setVerticesData('uv', uv);
          parts[i % 3].push(b);
        }
        parts.forEach((p, i) => { if (!p.length) return; const m = Mesh.MergeMeshes(p, true, true); m.material = mats[i]; m.parent = deco; m.freezeWorldMatrix(); });
        break;
      }
      case 'lamp': case 'neonLamp': {
        const pole = MeshBuilder.CreateCylinder('pole', { diameter: 0.14, height: 5.5, tessellation: 10 }, scene); pole.position.set(d.x, 2.75, d.z); pole.material = M.metalDark; pole.parent = deco;
        const head = MeshBuilder.CreateBox('lhead', { width: 0.9, height: 0.15, depth: 0.35 }, scene); head.position.set(d.x, 5.5, d.z); head.parent = deco;
        const col = d.t === 'neonLamp' ? (lights.length % 2 ? '#3cf0ff' : '#ff3cf0') : '#ffe2b0';
        head.material = pbr(scene, 'lampM' + col, { color: col, emissive: col, emI: night ? 3 : 1.2 });
        if (shadow) shadow.addShadowCaster(pole);
        if (night && lights.length < 4) { const L = new PointLight('pl', new Vector3(d.x, 5.2, d.z), scene); L.diffuse = lin(col); L.intensity = 60; L.range = 26; lights.push(L); }
        break;
      }
      case 'tree': case 'palm': {
        const trunk = MeshBuilder.CreateCylinder('trunk', { diameterTop: 0.25, diameterBottom: 0.45, height: d.t === 'palm' ? 6 : 3.5, tessellation: 10 }, scene);
        trunk.position.set(d.x, d.t === 'palm' ? 3 : 1.75, d.z); trunk.material = pbr(scene, 'bark', { color: '#5b4330', rough: 0.95 }); trunk.parent = deco;
        const leafM = pbr(scene, 'leaf' + d.t, { color: d.t === 'palm' ? '#1f6b3a' : '#3f7a34', rough: 0.85 });
        if (d.t === 'tree') { for (let k = 0; k < 3; k++) { const s = MeshBuilder.CreateSphere('leaf', { diameter: 3 - k * 0.5, segments: 8 }, scene); s.position.set(d.x + (r() - 0.5), 4 + k * 0.9, d.z + (r() - 0.5)); s.material = leafM; s.parent = deco; if (shadow) shadow.addShadowCaster(s); } }
        else for (let k = 0; k < 7; k++) { const l = MeshBuilder.CreateBox('frond', { width: 0.5, height: 0.06, depth: 3 }, scene); l.position.set(d.x, 6, d.z); l.rotation.set(0.45, (k / 7) * Math.PI * 2, 0); l.setPivotPoint(new Vector3(0, 0, -1.5)); l.material = leafM; l.parent = deco; if (shadow) shadow.addShadowCaster(l); }
        if (shadow) shadow.addShadowCaster(trunk);
        break;
      }
      case 'crane': {
        const m = pbr(scene, 'craneM', { color: '#f2b233', rough: 0.6, metal: 0.3 });
        for (const [w, h, dd, x, y, z] of [[2, 34, 2, 0, 17, 0], [30, 2, 2, 8, 34, 0], [1, 1, 8, -6, 35, 0], [4, 4, 4, 0, 30, 0]]) { const b = MeshBuilder.CreateBox('crane', { width: w, height: h, depth: dd }, scene); b.position.set(d.x + x, y, d.z + z); b.material = m; b.parent = deco; }
        break;
      }
      case 'ship': {
        const hull = MeshBuilder.CreateBox('ship', { width: 90, height: 12, depth: 18 }, scene); hull.position.set(d.x, 4, d.z); hull.material = pbr(scene, 'shipM', { color: '#24334a', rough: 0.7 }); hull.parent = deco;
        for (let k = 0; k < 8; k++) { const c = MeshBuilder.CreateBox('cont', { width: 10, height: 4, depth: 5 }, scene); c.position.set(d.x - 35 + k * 10, 12, d.z + (k % 2 ? 3 : -3)); c.material = k % 2 ? M.container : M.container2; c.parent = deco; }
        break;
      }
      case 'billboard': {
        const t = texGraffiti(scene, 77 + park.music, night ? ['#0b0c18', '#ff3cf0', '#3cf0ff', '#ffd43a'] : ['#f4efe6', '#ff5a3c', '#2ec4ff', '#111111']);
        const bb = MeshBuilder.CreatePlane('bb', { width: 24, height: 9, sideOrientation: Mesh.DOUBLESIDE }, scene); bb.position.set(d.x, 14, d.z); bb.rotation.y = Math.PI;
        const m = pbr(scene, 'bbM', { tex: t, rough: 0.6 }); m.emissiveTexture = t; m.emissiveColor = Color3.White(); m.emissiveIntensity = night ? 1.2 : 0.25; bb.material = m; bb.parent = deco;
        for (const sx of [-8, 8]) { const p = MeshBuilder.CreateCylinder('bbp', { diameter: 0.5, height: 10 }, scene); p.position.set(d.x + sx, 5, d.z + 0.5); p.material = M.metalDark; p.parent = deco; }
        break;
      }
      case 'antenna': {
        for (const [h, ox] of [[14, 0], [9, 2], [11, -1.5]]) { const a = MeshBuilder.CreateCylinder('ant', { diameter: 0.15, height: h }, scene); a.position.set(d.x + ox, h / 2, d.z); a.material = M.metalDark; a.parent = deco; }
        break;
      }
    }
  }
  deco.getChildMeshes().forEach(m => { m.isPickable = false; m.freezeWorldMatrix(); });

  // ---------------- Sammelobjekte
  const items = [];
  const word = 'PULSE', cols = ['#ff5a3c', '#ffd43a', '#2ec4ff', '#2ecc71', '#ff4f8b'];
  park.letters.forEach((p, i) => {
    const node = new TransformNode('letter' + i, scene); node.position.set(...p);
    const pl = MeshBuilder.CreatePlane('lt', { size: 1.1, sideOrientation: Mesh.DOUBLESIDE }, scene); pl.parent = node; pl.billboardMode = Mesh.BILLBOARDMODE_Y;
    const m = new StandardMaterial('ltm' + i, scene); m.diffuseTexture = texLetter(scene, word[i], cols[i]); m.diffuseTexture.hasAlpha = true; m.useAlphaFromDiffuseTexture = true; m.emissiveColor = new Color3(0.9, 0.9, 0.9); m.disableLighting = true; m.backFaceCulling = false; pl.material = m;
    const ring = MeshBuilder.CreateTorus('ring', { diameter: 1.5, thickness: 0.07, tessellation: 32 }, scene); ring.parent = node; ring.rotation.x = Math.PI / 2;
    ring.material = pbr(scene, 'ringM' + i, { color: cols[i], emissive: cols[i], emI: 2 });
    items.push({ kind: 'letter', i, ch: word[i], node, pos: new Vector3(...p), got: false });
  });
  if (park.tape) {
    const node = new TransformNode('tape', scene); node.position.set(...park.tape);
    const b = MeshBuilder.CreateBox('tapeB', { width: 0.6, height: 0.38, depth: 0.1 }, scene); b.parent = node;
    const t = new DynamicTexture('tapeT', { width: 128, height: 80 }, scene, true); const g = t.getContext();
    g.fillStyle = '#1b1c22'; g.fillRect(0, 0, 128, 80); g.fillStyle = '#ffd43a'; g.fillRect(8, 8, 112, 30); g.fillStyle = '#111'; g.font = '900 18px system-ui'; g.fillText('MIXTAPE', 22, 30);
    g.fillStyle = '#ddd'; for (const x of [40, 88]) { g.beginPath(); g.arc(x, 56, 11, 0, 7); g.fill(); } t.update();
    const m = pbr(scene, 'tapeM', { tex: t, rough: 0.4 }); m.emissiveTexture = t; m.emissiveColor = Color3.White(); m.emissiveIntensity = 0.6; b.material = m;
    const glow = MeshBuilder.CreateTorus('tglow', { diameter: 1.1, thickness: 0.05, tessellation: 24 }, scene); glow.parent = node; glow.rotation.x = Math.PI / 2; glow.material = pbr(scene, 'tglowM', { color: '#ffd43a', emissive: '#ffd43a', emI: 2.5 });
    items.push({ kind: 'tape', node, pos: new Vector3(...park.tape), got: false });
  }
  return { level, items, meshes, lights };
}

function groundMesh(scene, level, bounds, tile) {
  const [x0, z0, x1, z1] = bounds, step = 1;
  const nx = Math.round((x1 - x0) / step), nz = Math.round((z1 - z0) / step);
  const P = [], I = [], UV = [], N = [];
  const bowls = level.bowls;
  const vid = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    let x = x0 + i * step, z = z0 + j * step, inside = false;
    for (const b of bowls) { const dx = x - b.x, dz = z - b.z, d = Math.hypot(dx, dz); if (d < b.R) { inside = true; if (d > 0.001) { x = b.x + dx / d * b.R; z = b.z + dz / d * b.R; } } }
    vid.push(inside); P.push(x, 0, z); N.push(0, 1, 0); UV.push(x / tile, z / tile);
  }
  const W = nx + 1;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * W + i, b = a + 1, c = a + W, d = c + 1;
    // Dreiecke, deren Ecken alle auf dem Poolrand liegen, würden den Pool verdecken → weglassen
    if (!(vid[a] && vid[c] && vid[b])) I.push(a, c, b);
    if (!(vid[b] && vid[c] && vid[d])) I.push(b, c, d);
  }
  orient(P, I, N);
  const m = new Mesh('ground', scene), vd = new VertexData(); vd.positions = P; vd.indices = I; vd.normals = N; vd.uvs = UV; vd.applyToMesh(m);
  return m;
}
function outerRing(scene, bounds, mat) {
  const [x0, z0, x1, z1] = bounds, E = 220, y = -0.05;
  const parts = [[x0 - E, z0 - E, x1 + E, z0 - 1], [x0 - E, z1 + 1, x1 + E, z1 + E], [x0 - E, z0 - 1, x0 - 1, z1 + 1], [x1 + 1, z0 - 1, x1 + E, z1 + 1]];
  const ms = parts.map(([a, b, c, d]) => { const g = MeshBuilder.CreateGround('og', { width: c - a, height: d - b }, scene); g.position.set((a + c) / 2, y, (b + d) / 2); return g; });
  const m = Mesh.MergeMeshes(ms, true, true); m.material = mat; m.receiveShadows = true; return m;
}
