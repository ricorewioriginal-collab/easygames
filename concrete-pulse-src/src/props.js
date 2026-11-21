// Mehr Leben am Parkrand: Zaun mit Bannern, Bänke, Mülleimer, Pylonen, Kartons, Tribüne mit Publikum, Lichterketten.
// Alles außerhalb der Fahrfläche (keine Kollision), pro Material zusammengefasst – kostet kaum Leistung.
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math';
import { pbr } from './gfx.js';
import { BRAND } from './brand.js';

function chainTex(scene) {
  const t = new DynamicTexture('chain', 128, scene, true), g = t.getContext();
  g.clearRect(0, 0, 128, 128); g.strokeStyle = 'rgba(200,205,212,.9)'; g.lineWidth = 3;
  for (let i = -128; i < 256; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); }
  t.update(); t.hasAlpha = true; return t;
}
function bannerTex(scene, text, c1, c2, i) {
  const t = new DynamicTexture('ban' + i, { width: 512, height: 128 }, scene, true), g = t.getContext();
  const gr = g.createLinearGradient(0, 0, 512, 0); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(0, 0, 512, 128);
  g.fillStyle = 'rgba(255,255,255,.12)'; for (let x = -128; x < 512; x += 28) { g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 14, 128); g.lineTo(x + 78, 0); g.lineTo(x + 64, 0); g.fill(); }
  g.save(); g.translate(256, 70); g.transform(1, 0, -0.18, 1, 0, 0);
  g.font = '900 64px "SL Display", "Arial Black", sans-serif'; const fs = Math.min(64, 64 * 440 / g.measureText(text).width) | 0;
  g.font = `900 ${fs}px "SL Display", "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeText(text, 0, 0); g.fillStyle = '#fff'; g.fillText(text, 0, 0); g.restore();
  t.update(); return t;
}

export function buildProps(scene, park, level, shadow, parent, rnd) {
  const [x0, z0, x1, z1] = park.bounds, night = !!park.neon;
  const out = 3.2;                                     // Abstand der Ausstattung zum Rand der Fahrfläche
  const groups = {};                                   // Material → Meshes (werden zusammengefasst)
  const mats = {
    metal: pbr(scene, 'pMetal', { color: '#9aa1aa', metal: 0.9, rough: 0.35 }),
    dark: pbr(scene, 'pDark', { color: '#2a2e36', metal: 0.5, rough: 0.5 }),
    wood: pbr(scene, 'pWood', { color: '#a8743f', rough: 0.8 }),
    green: pbr(scene, 'pGreen', { color: '#2f7d4a', rough: 0.9 }),
    orange: pbr(scene, 'pOrange', { color: '#ff6a1a', rough: 0.6, emissive: night ? '#ff6a1a' : null, emI: 0.3 }),
    white: pbr(scene, 'pWhite', { color: '#f2f2f2', rough: 0.6 }),
    card: pbr(scene, 'pCard', { color: '#b88a55', rough: 0.95 }),
    seat: pbr(scene, 'pSeat', { color: night ? '#7c4dff' : '#2ec4ff', rough: 0.6 }),
    seat2: pbr(scene, 'pSeat2', { color: '#ff4f8b', rough: 0.6 }),
    conc: pbr(scene, 'pConc', { color: night ? '#3a3b46' : '#a5a39d', rough: 0.95 }),
    bulb: pbr(scene, 'pBulb', { color: '#ffe7a0', emissive: '#ffd27a', emI: night ? 3 : 0.6 })
  };
  const crowd = ['#ff5a3c', '#ffd43a', '#2ec4ff', '#2ecc71', '#7c4dff', '#ff4f8b', '#f2f2f2', '#1c1e26', '#c9926a', '#5c3a26'].map((c, i) => pbr(scene, 'pCrowd' + i, { color: c, rough: 0.8 }));
  const put = (m, mat) => { (groups[mat] || (groups[mat] = [])).push(m); return m; };
  const box = (w, h, d, x, y, z, mat, ry = 0) => { const m = MeshBuilder.CreateBox('p', { width: w, height: h, depth: d }, scene); m.position.set(x, y + h / 2, z); m.rotation.y = ry; return put(m, mat); };
  const cyl = (dt, db, h, x, y, z, mat, tess = 10) => { const m = MeshBuilder.CreateCylinder('p', { diameterTop: dt, diameterBottom: db, height: h, tessellation: tess }, scene); m.position.set(x, y + h / 2, z); return put(m, mat); };
  const gy = () => 0;                                  // außerhalb der Fahrfläche liegt der Boden auf Höhe 0

  // Seiten der Fahrfläche: [Startpunkt, Richtung, Länge, Normale nach außen]
  const sides = [
    { ax: x0, az: z0 - out, dx: 1, dz: 0, len: x1 - x0, ry: 0 },
    { ax: x1, az: z1 + out, dx: -1, dz: 0, len: x1 - x0, ry: Math.PI },
    { ax: x0 - out, az: z1, dx: 0, dz: -1, len: z1 - z0, ry: Math.PI / 2 },
    { ax: x1 + out, az: z0, dx: 0, dz: 1, len: z1 - z0, ry: -Math.PI / 2 }
  ];
  const fenceMat = pbr(scene, 'pFence', { tex: chainTex(scene), metal: 0.6, rough: 0.4 });
  fenceMat.albedoTexture.hasAlpha = true; fenceMat.useAlphaFromAlbedoTexture = true; fenceMat.transparencyMode = 1; fenceMat.alphaCutOff = 0.4; fenceMat.backFaceCulling = false;
  const banners = [BRAND.name.toUpperCase(), 'STYLE', 'FLOW', park.name.toUpperCase(), 'GRIND', 'AIR', 'LINE', 'LEGENDS'];
  const bc = [['#ff5a3c', '#b44dff'], ['#ffd43a', '#ff5a3c'], ['#2ec4ff', '#3a3fd8'], ['#2ecc71', '#127a62'], ['#ff4f8b', '#7c4dff']];
  const banMats = banners.map((t, i) => { const m = pbr(scene, 'pBan' + i, { tex: bannerTex(scene, t, ...bc[i % bc.length], i), rough: 0.7 }); m.emissiveTexture = m.albedoTexture; m.emissiveColor = Color3.White(); m.emissiveIntensity = night ? 0.7 : 0.12; m.backFaceCulling = false; return m; });
  let bi = 0;
  // Höhe der Randmauer (wallRing) – Zaun sitzt oben drauf, Banner hängen innen an der Mauer
  const wallH = Math.max(0, ...park.elements.filter(e => e.t === 'wall' && e.top === 'wallTop' && (e.w > 20 || e.d > 20)).map(e => e.h));
  sides.forEach((S, si) => {
    const nX = si === 2 ? -1 : si === 3 ? 1 : 0, nZ = si === 0 ? -1 : si === 1 ? 1 : 0;   // Normale nach außen
    const fo = wallH > 0 ? 0.5 - out : 2.4;             // Zaunlinie: Mitte der Mauer (bzw. außen, wenn keine Mauer)
    const fy = wallH;                                   // Zaun steht auf der Mauer
    for (let t = 0; t <= S.len; t += 4) {
      const fx = S.ax + S.dx * t + nX * fo, fz = S.az + S.dz * t + nZ * fo;
      cyl(0.08, 0.08, 1.9, fx, fy, fz, 'metal', 6);
      if (t + 4 <= S.len) {
        const nx = fx + S.dx * 2, nz = fz + S.dz * 2;
        const pl = MeshBuilder.CreatePlane('fence', { width: 4, height: 1.7 }, scene); pl.position.set(nx, fy + 1.0, nz); pl.rotation.y = S.ry; pl.material = fenceMat; pl.parent = parent; pl.isPickable = false;
        box(4, 0.06, 0.06, nx, fy + 1.85, nz, 'metal', S.ry);
        if ((t / 4) % 3 === 1) {
          // Banner: innen an der Mauer (hohe Mauer) oder am Zaun (niedrige Brüstung)
          const onWall = wallH >= 1.6, edge = onWall ? (0.5 + 0.03) : 0.06;
          const ban = MeshBuilder.CreatePlane('ban', { width: 3.6, height: 0.9 }, scene);
          ban.position.set(nx - nX * edge, onWall ? Math.min(wallH * 0.55, 1.9) : fy + 0.95, nz - nZ * edge); ban.rotation.y = S.ry;
          ban.material = banMats[bi++ % banMats.length]; ban.parent = parent; ban.isPickable = false;
        }
        if (night) for (let k = 0; k < 4; k++) { const s = MeshBuilder.CreateSphere('p', { diameter: 0.12, segments: 4 }, scene); const u = k / 4; s.position.set(fx + S.dx * (u * 4), fy + 1.8 - Math.sin(u * Math.PI) * 0.25, fz + S.dz * (u * 4)); put(s, 'bulb'); }
      }
    }
    if (wallH >= 2) return;                             // hinter hohen Mauern sieht man keine Ausstattung
    // Ausstattung entlang der Seite (zwischen Fahrfläche und Zaun)
    for (let t = 3 + rnd() * 4; t < S.len - 2; t += 5 + rnd() * 6) {
      const x = S.ax + S.dx * t, z = S.az + S.dz * t, y = gy(x, z); if (y == null) continue;
      const k = rnd(), ry = S.ry;
      if (k < 0.24) { // Bank
        const ox = Math.cos(ry), oz = -Math.sin(ry);
        box(1.8, 0.08, 0.45, x, y + 0.42, z, 'wood', ry); box(1.8, 0.4, 0.06, x - Math.sin(ry) * 0.2, y + 0.5, z - Math.cos(ry) * 0.2, 'wood', ry);
        for (const s of [-0.75, 0.75]) box(0.08, 0.42, 0.45, x + ox * s, y, z + oz * s, 'dark', ry);
      } else if (k < 0.4) { cyl(0.55, 0.5, 0.95, x, y, z, 'dark', 12); cyl(0.6, 0.6, 0.06, x, y + 0.95, z, 'metal', 12); }   // Mülleimer
      else if (k < 0.56) { for (let c = 0; c < 3; c++) { const cx = x + (rnd() - 0.5) * 1.6, cz = z + (rnd() - 0.5) * 1.2; cyl(0.04, 0.34, 0.55, cx, y + 0.03, cz, 'orange', 12); box(0.4, 0.03, 0.4, cx, y, cz, 'dark'); cyl(0.2, 0.26, 0.08, cx, y + 0.25, cz, 'white', 12); } } // Pylonen
      else if (k < 0.7) { for (let c = 0; c < 2 + (rnd() * 3 | 0); c++) box(0.5 + rnd() * 0.4, 0.35 + rnd() * 0.3, 0.45 + rnd() * 0.3, x + (rnd() - 0.5) * 1.4, y + (c > 2 ? 0.5 : 0), z + (rnd() - 0.5) * 1, 'card', rnd() * 3); } // Kartons
      else if (k < 0.84) { box(1.6, 0.7, 0.9, x, y, z, 'conc', ry); const b = MeshBuilder.CreateSphere('p', { diameter: 1.3, segments: 6 }, scene); b.scaling.set(1.1, 0.7, 0.6); b.position.set(x, y + 1.05, z); put(b, 'green'); } // Pflanzkübel
      else { box(2, 0.9, 0.12, x, y + 0.1, z, 'white', ry); for (const s of [-0.9, 0.9]) box(0.1, 0.1, 0.5, x + Math.cos(ry) * s, y, z - Math.sin(ry) * s, 'dark', ry); } // Absperrung
    }
  });
  // Tribüne mit Publikum an der längeren Seite (außen hinter dem Zaun)
  const long = (x1 - x0) >= (z1 - z0);
  const L = Math.min(30, (long ? x1 - x0 : z1 - z0) * 0.55), cx = long ? (x0 + x1) / 2 : x1 + 2.2, cz = long ? z1 + 2.2 : (z0 + z1) / 2;
  const by = gy(cx, cz);
  if (by != null) {
    const ry = long ? Math.PI : -Math.PI / 2;
    for (let row = 0; row < 5; row++) {
      const d = row * 0.9, h = wallH + 0.3 + 0.5 * row;
      const px = long ? cx : cx + d, pz = long ? cz + d : cz;
      box(long ? L : 0.9, h, long ? 0.9 : L, px, by, pz, 'conc');
      box(long ? L : 0.5, 0.08, long ? 0.5 : L, px, by + h, pz, row % 2 ? 'seat2' : 'seat');
      for (let s = -L / 2 + 0.6; s < L / 2 - 0.4; s += 0.75) {
        if (rnd() < 0.3) continue;
        const sx = long ? cx + s : px, sz = long ? pz : cz + s;
        const body = MeshBuilder.CreateCapsule('p', { radius: 0.2, height: 0.75, tessellation: 6, subdivisions: 1 }, scene); body.position.set(sx, by + h + 0.45, sz); put(body, 'c' + (rnd() * 8 | 0));
        const head = MeshBuilder.CreateSphere('p', { diameter: 0.26, segments: 5 }, scene); head.position.set(sx, by + h + 0.95, sz); put(head, 'c' + (8 + (rnd() * 2 | 0)));
      }
    }
    void ry;
  }
  // zusammenfassen
  for (const k in groups) {
    const list = groups[k]; if (!list.length) continue;
    const m = Mesh.MergeMeshes(list, true, true, undefined, false, false); if (!m) continue;
    m.material = k[0] === 'c' && /^c\d/.test(k) ? crowd[+k.slice(1)] : mats[k]; m.parent = parent; m.isPickable = false; m.receiveShadows = true;
    if (shadow && k !== 'bulb') shadow.addShadowCaster(m);
    m.freezeWorldMatrix();
  }
}
