// Architecture and props. Every building is assembled from merged,
// vertex-coloured parts (few draw calls) and faces local +z (door side).
import { THREE } from './three.js';
import { Builder, matrix, roofGeometry, roofSolid, lumpy } from './geometry.js';
import { envMaterial, glowMaterial, waterMaterial } from './materials.js';
import { signTexture, emblemTexture } from './textures.js';

const C = (c) => new THREE.Color(c);
const shade = (c, f) => C(c).multiplyScalar(f).getHex();
const mix = (a, b, t) => C(a).lerp(C(b), t).getHex();

// Window glass material: glows warmly at night (emissive driven by daylight).
export const windowMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0xffc56b, emissiveIntensity: 0 });
windowMaterial.userData.shared = true;
export function setNightGlow(f) { windowMaterial.emissiveIntensity = f * 0.9; }

function finish(group, b, glass) {
  const mesh = new THREE.Mesh(b.build(), envMaterial({ scale: 0.7, strength: 0.32 }));
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
  if (glass && !glass.empty) { const gm = new THREE.Mesh(glass.build(), windowMaterial); group.add(gm); }
  return group;
}

function windowAt(b, glass, x, y, z, w, h, pal, { yaw = 0, shutters = true, box = true } = {}) {
  const frame = pal.trim, M = (dx, dy, dz) => { const v = new THREE.Vector3(dx, dy, dz).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); return [x + v.x, y + v.y, z + v.z]; };
  const put = (geo, color, dx, dy, dz, target = b) => { const [px, py, pz] = M(dx, dy, dz); target.add(geo, color, matrix(px, py, pz, 0, yaw, 0)); };
  put(new THREE.BoxGeometry(w + 0.24, h + 0.24, 0.12), frame, 0, 0, 0.02);
  put(new THREE.BoxGeometry(w, h, 0.08), 0x9ed0e8, 0, 0, 0.07, glass);
  put(new THREE.BoxGeometry(0.07, h, 0.06), frame, 0, 0, 0.13);
  put(new THREE.BoxGeometry(w, 0.07, 0.06), frame, 0, 0, 0.13);
  if (shutters) { put(new THREE.BoxGeometry(w * 0.45, h + 0.1, 0.06), pal.shutter || shade(pal.roof, 0.9), -w * 0.75, 0, 0.06); put(new THREE.BoxGeometry(w * 0.45, h + 0.1, 0.06), pal.shutter || shade(pal.roof, 0.9), w * 0.75, 0, 0.06); }
  if (box) { put(new THREE.BoxGeometry(w + 0.2, 0.22, 0.32), 0x7a5a3c, 0, -h / 2 - 0.2, 0.2); for (let i = 0; i < 4; i++) put(new THREE.SphereGeometry(0.11, 5, 4), [0xf47a8a, 0xffd25a, 0xffffff, 0xc58af0][i], -w / 2 + 0.15 + i * (w - 0.3) / 3, -h / 2 - 0.02, 0.24); }
}

function doorAt(b, x, z, pal, { w = 1.3, h = 2.2, color = 0x7a4f32, awning = true } = {}) {
  b.box(w + 0.3, h + 0.15, 0.2, pal.trim, x, h / 2 + 0.05, z + 0.02);
  b.box(w, h, 0.12, color, x, h / 2, z + 0.1);
  b.box(w * 0.92, 0.06, 0.04, shade(color, 0.8), x, h * 0.55, z + 0.17);
  b.sphere(0.06, 0xf2c46a, x + w * 0.35, h * 0.48, z + 0.2, 1, 1, 1, 6);
  b.box(w + 1, 0.18, 0.9, shade(pal.stone || 0xa8a29a, 1), x, 0.09, z + 0.55);
  if (awning) b.add(new THREE.BoxGeometry(w + 0.9, 0.12, 0.9), pal.roof, matrix(x, h + 0.45, z + 0.42, 0.35, 0, 0));
}

function lanternAt(b, glow, x, y, z) {
  b.box(0.08, 0.5, 0.08, 0x2f3a44, x, y + 0.25, z);
  b.box(0.26, 0.32, 0.26, 0x2f3a44, x, y - 0.05, z + 0.0);
  glow.box(0.2, 0.24, 0.2, 0xffd890, x, y - 0.05, z);
}

// ---------------------------------------------------------------------------
export function house(pal, style = 'timber', variant = 0, w = 8, d = 7) {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const wallH = style === 'adobe' ? 3.4 : 3.2;
  const wall = variant % 2 ? mix(pal.wall, 0xffffff, 0.25) : pal.wall;
  const roofC = variant % 3 === 2 ? shade(pal.roof, 0.82) : pal.roof;
  // foundation + walls
  b.box(w + 0.4, 1.4, d + 0.4, pal.stone || 0x9b958a, 0, -0.3, 0, 0, { jitter: 0.06 });
  if (style === 'stilts') for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(0.18, 0.2, 2.2, 0x5a4636, sx * (w / 2 - 0.3), -0.6, sz * (d / 2 - 0.3), 6);
  b.box(w, wallH, d, wall, 0, 0.4 + wallH / 2, 0, 0, { shade: 0.12 });
  if (style === 'timber') {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.28, wallH, 0.28, pal.trim, sx * (w / 2 - 0.05), 0.4 + wallH / 2, sz * (d / 2 - 0.05));
    b.box(w + 0.1, 0.22, 0.12, pal.trim, 0, 0.4 + wallH * 0.55, d / 2 + 0.03);
    b.box(w + 0.1, 0.22, 0.12, pal.trim, 0, 0.4 + wallH * 0.55, -d / 2 - 0.03);
    for (const sx of [-2.6, 2.6]) { b.add(new THREE.BoxGeometry(0.16, 1.5, 0.1), pal.trim, matrix(sx, 0.4 + wallH * 0.8, d / 2 + 0.05, 0, 0, sx > 0 ? 0.5 : -0.5)); }
  } else if (style === 'stone') {
    for (let i = 0; i < 14; i++) b.box(0.6 + (i % 3) * 0.2, 0.32, 0.08, shade(wall, 0.88), -w / 2 + 0.6 + (i * 1.13) % (w - 1), 0.8 + ((i * 7) % 5) * 0.55, d / 2 + 0.03);
  }
  // roof
  const roofH = style === 'adobe' ? 0 : style === 'snow' ? 3.2 : 2.6;
  if (style === 'adobe') {
    b.box(w + 0.3, 0.35, d + 0.3, shade(wall, 0.92), 0, 0.4 + wallH + 0.15, 0);
    for (let i = -2; i <= 2; i++) b.cyl(0.08, 0.08, 0.6, 0x7a5a3a, i * 1.4, 0.4 + wallH - 0.3, d / 2 + 0.25, 5);
  } else if (style === 'dome') {
    b.add(new THREE.SphereGeometry(Math.min(w, d) * 0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), roofC, matrix(0, 0.4 + wallH, 0, 0, 0, 0, w / Math.min(w, d), 0.8, d / Math.min(w, d)));
    b.sphere(0.25, pal.accent, 0, 0.4 + wallH + Math.min(w, d) * 0.45, 0, 1, 1, 1, 8);
  } else {
    const ry = Math.PI / 2;
    b.add(roofSolid(d, w, roofH * 0.96), wall, matrix(0, 0.4 + wallH, 0, 0, ry, 0));
    b.add(roofGeometry(d, w, roofH, 0.45), roofC, matrix(0, 0.4 + wallH - 0.05, 0, 0, ry, 0), { jitter: 0.05 });
    b.box(0.3, 0.25, w + 1, shade(roofC, 0.75), 0, 0.4 + wallH + roofH - 0.05, 0, ry);
    if (style === 'snow') b.add(roofGeometry(d, w, roofH, 0.5), 0xf4f8fb, matrix(0, 0.4 + wallH + 0.12, 0, 0, ry, 0, 1, 1, 0.98));
    b.box(0.7, 1.6, 0.7, pal.stone || 0x9b958a, w * 0.22, 0.4 + wallH + roofH * 0.7, -d * 0.18);
    b.box(0.9, 0.2, 0.9, shade(pal.stone || 0x9b958a, 0.8), w * 0.22, 0.4 + wallH + roofH * 0.7 + 0.85, -d * 0.18);
  }
  doorAt(b, 0, d / 2, pal);
  windowAt(b, glass, -w * 0.3, 2.2, d / 2, 1.1, 1.0, pal);
  windowAt(b, glass, w * 0.3, 2.2, d / 2, 1.1, 1.0, pal);
  windowAt(b, glass, -w / 2, 2.2, 0, 1.0, 0.9, pal, { yaw: -Math.PI / 2, box: false });
  windowAt(b, glass, w / 2, 2.2, 0, 1.0, 0.9, pal, { yaw: Math.PI / 2, box: false });
  windowAt(b, glass, 0, 2.2, -d / 2, 1.1, 0.9, pal, { yaw: Math.PI, box: false, shutters: false });
  lanternAt(b, glass, 1.15, 2.4, d / 2 + 0.25);
  return finish(g, b, glass);
}

// Heilzentrum: rounded front, large glass entrance, leaf-heart emblem.
export function healCenter(pal) {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const w = 12, d = 10, h = 4.6, red = 0xe0566e, cream = 0xfff4ea;
  b.box(w + 0.6, 1.4, d + 0.6, 0xc9c2b8, 0, -0.3, 0);
  b.box(w, h, d, cream, 0, 0.4 + h / 2, 0, 0, { shade: 0.1 });
  b.add(new THREE.CylinderGeometry(w / 2, w / 2, h, 24, 1, false, -Math.PI / 2, Math.PI), cream, matrix(0, 0.4 + h / 2, d / 2 - 0.01, 0, 0, 0, 1, 1, 0.35));
  b.box(w + 0.4, 0.5, d + 0.4, red, 0, 0.4 + h + 0.25, 0);
  b.add(new THREE.CylinderGeometry(w / 2 + 0.2, w / 2 + 0.2, 0.5, 24, 1, false, -Math.PI / 2, Math.PI), red, matrix(0, 0.4 + h + 0.25, d / 2, 0, 0, 0, 1, 1, 0.38));
  b.add(new THREE.SphereGeometry(3.4, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), red, matrix(0, 0.4 + h + 0.4, -0.5, 0, 0, 0, 1.4, 0.55, 1.1));
  b.box(w * 0.98, 0.3, 0.4, mix(red, 0xffffff, 0.3), 0, 0.4 + h * 0.62, d / 2 + 1.85);
  // glass entrance
  glass.box(3.6, 2.8, 0.1, 0xb8e4f4, 0, 1.8, d / 2 + 2.08);
  b.box(3.9, 0.18, 0.2, 0xffffff, 0, 3.25, d / 2 + 2.1); b.box(0.12, 2.8, 0.15, 0xffffff, 0, 1.8, d / 2 + 2.12);
  for (const sx of [-3.6, 3.6]) { glass.box(1.6, 1.4, 0.1, 0xb8e4f4, sx, 2.4, d / 2 + 1.55); b.box(1.8, 0.15, 0.25, 0xffffff, sx, 1.65, d / 2 + 1.6); }
  b.box(5, 0.2, 2.2, 0xd8d0c4, 0, 0.1, d / 2 + 3);
  for (const sx of [-2.6, 2.6]) { b.cyl(0.15, 0.15, 1, 0x8a8a8a, sx, 0.5, d / 2 + 3.4, 6); b.sphere(0.45, 0x4f9a5a, sx, 1.2, d / 2 + 3.4, 1, 1, 1, 7); }
  for (const sx of [-w / 2, w / 2]) windowAt(b, glass, sx, 2.6, 0, 1.4, 1.2, { ...pal, trim: 0xffffff }, { yaw: sx > 0 ? Math.PI / 2 : -Math.PI / 2, shutters: false, box: false });
  finish(g, b, glass);
  const em = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: emblemTexture('❤', '#ffffff', '#e0566e'), transparent: true }));
  em.position.set(0, 0.4 + h + 1.3, d / 2 + 0.5); g.add(em);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.15), new THREE.MeshBasicMaterial({ map: signTexture('Heilzentrum', { bg: '#d84f68' }) }));
  sign.position.set(0, 0.4 + h * 0.62 + 0.75, d / 2 + 2.08); g.add(sign);
  return g;
}

export function shop(pal) {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const w = 10, d = 8, h = 3.6, blue = 0x3f7fc4;
  b.box(w + 0.4, 1.4, d + 0.4, 0xa49e94, 0, -0.3, 0);
  b.box(w, h, d, mix(pal.wall, 0xf1ead8, 0.5), 0, 0.4 + h / 2, 0, 0, { shade: 0.1 });
  b.add(roofSolid(d, w, 2.2), mix(pal.wall, 0xf1ead8, 0.5), matrix(0, 0.4 + h, 0, 0, Math.PI / 2, 0));
  b.add(roofGeometry(d, w, 2.2, 0.45), blue, matrix(0, 0.4 + h - 0.05, 0, 0, Math.PI / 2, 0));
  // striped awning
  for (let i = 0; i < 8; i++) b.add(new THREE.BoxGeometry(w / 8, 0.08, 1.8), i % 2 ? 0xffffff : blue, matrix(-w / 2 + w / 16 + i * w / 8, 3.0, d / 2 + 0.85, 0.32, 0, 0));
  glass.box(2.6, 1.6, 0.08, 0xbfe6f5, -2.8, 1.9, d / 2 + 0.06); glass.box(2.6, 1.6, 0.08, 0xbfe6f5, 2.8, 1.9, d / 2 + 0.06);
  b.box(2.8, 0.15, 0.3, 0xffffff, -2.8, 1.05, d / 2 + 0.15); b.box(2.8, 0.15, 0.3, 0xffffff, 2.8, 1.05, d / 2 + 0.15);
  doorAt(b, 0, d / 2, pal, { color: 0x3f6a9a, awning: false });
  // crates and barrels outside
  b.box(0.8, 0.8, 0.8, 0x9a6a44, -4.2, 0.4, d / 2 + 1.4, 0.3); b.box(0.6, 0.6, 0.6, 0xa87a50, -4.0, 1.1, d / 2 + 1.4, 0.7);
  b.cyl(0.4, 0.4, 0.9, 0x7a5232, 4.3, 0.45, d / 2 + 1.3, 10);
  for (let i = 0; i < 6; i++) b.sphere(0.13, [0xff5a4a, 0xffc04a, 0x7fd06a][i % 3], 4.2 + (i % 3) * 0.12 - 0.12, 0.98, d / 2 + 1.2 + Math.floor(i / 3) * 0.2, 1, 1, 1, 6);
  finish(g, b, glass);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: signTexture('Laden', { bg: '#3f7fc4', icon: '◉' }) }));
  sign.position.set(0, 0.4 + h + 0.55, d / 2 + 0.25); g.add(sign);
  return g;
}

export function lab(pal, { dome = false } = {}) {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const w = 12, d = 9, h = 4.2;
  b.box(w + 0.4, 1.4, d + 0.4, 0xb4b0a8, 0, -0.3, 0);
  b.box(w, h, d, 0xf3f4f2, 0, 0.4 + h / 2, 0, 0, { shade: 0.08 });
  b.box(w + 0.3, 0.4, d + 0.3, 0x5d7f99, 0, 0.4 + h + 0.2, 0);
  for (let i = 0; i < 3; i++) b.add(new THREE.BoxGeometry(2.4, 0.08, 1.6), 0x2b3f63, matrix(-3 + i * 3, 0.4 + h + 0.75, -1, -0.35, 0, 0));
  b.cyl(0.06, 0.06, 2.6, 0x8a9aa8, 4.6, 0.4 + h + 1.5, -2.8, 6); b.sphere(0.35, 0xdfe6ea, 4.6, 0.4 + h + 2.8, -2.8, 1, 0.4, 1, 8);
  for (let i = -1; i <= 1; i++) { glass.box(2.4, 1.4, 0.08, 0xa6dcf0, i * 3.6, 2.6, d / 2 + 0.05); b.box(2.6, 0.12, 0.25, 0x5d7f99, i * 3.6, 1.85, d / 2 + 0.1); }
  doorAt(b, -3.2 + 3.2, d / 2, { ...pal, trim: 0x5d7f99 }, { color: 0x6f8fa6, awning: false });
  b.box(w + 0.1, 0.3, 0.2, 0x5d7f99, 0, 3.6, d / 2 + 0.05);
  finish(g, b, glass);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.95), new THREE.MeshBasicMaterial({ map: signTexture('Labor', { bg: '#4f6f8a', icon: '✦' }) }));
  sign.position.set(0, 3.9, d / 2 + 0.2); g.add(sign);
  void dome;
  return g;
}

// Glass dome greenhouse with the starter podium (Sonnenhain).
export function glassDome(r = 6.5) {
  const g = new THREE.Group(), b = new Builder();
  b.cyl(r + 0.3, r + 0.5, 0.5, 0xc9c4ba, 0, 0, 0, 32);
  // ribs
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.4) continue;
    for (let k = 0; k < 8; k++) {
      const t0 = k / 8 * Math.PI / 2, t1 = (k + 1) / 8 * Math.PI / 2;
      const p0 = [Math.sin(a) * Math.cos(t0) * r, Math.sin(t0) * r * 0.85, Math.cos(a) * Math.cos(t0) * r];
      const p1 = [Math.sin(a) * Math.cos(t1) * r, Math.sin(t1) * r * 0.85, Math.cos(a) * Math.cos(t1) * r];
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
      const geo = new THREE.CylinderGeometry(0.06, 0.06, len, 5);
      const mid = new THREE.Vector3((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2);
      const dir = new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      b.add(geo, 0xf2f5f0, new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1)));
    }
  }
  for (const k of [0.35, 0.7]) b.add(new THREE.TorusGeometry(r * Math.cos(k * Math.PI / 2), 0.05, 4, 40), 0xf2f5f0, matrix(0, Math.sin(k * Math.PI / 2) * r * 0.85, 0, Math.PI / 2, 0, 0));
  // entrance arch
  b.box(0.3, 3, 0.3, 0xf2f5f0, -1.6, 1.5, r - 0.3); b.box(0.3, 3, 0.3, 0xf2f5f0, 1.6, 1.5, r - 0.3); b.box(3.6, 0.3, 0.4, 0xf2f5f0, 0, 3.05, r - 0.3);
  // planters inside
  for (let i = 0; i < 6; i++) { const a = Math.PI + (i - 2.5) * 0.45; b.box(1.2, 0.5, 0.8, 0x8a6a4a, Math.sin(a) * (r - 1.3), 0.5, Math.cos(a) * (r - 1.3), a); b.sphere(0.55, [0x4f9a5a, 0x6fb35a, 0xf5a9c6][i % 3], Math.sin(a) * (r - 1.3), 1.0, Math.cos(a) * (r - 1.3), 1, 0.8, 1, 7); }
  const mesh = new THREE.Mesh(b.build(), envMaterial()); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh);
  const glassMesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 12, Math.PI / 2 + 0.42, Math.PI * 2 - 0.84, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.22, shininess: 120, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false }));
  glassMesh.scale.y = 0.85;
  g.add(glassMesh);
  return g;
}

export function podium() {
  const g = new THREE.Group(), b = new Builder();
  b.cyl(1.5, 1.7, 0.6, 0x7f9fb2, 0, 0.3, 0, 20);
  b.cyl(1.3, 1.4, 0.2, 0xf5cd77, 0, 0.7, 0, 20);
  for (let i = 0; i < 3; i++) b.cyl(0.25, 0.3, 0.3, 0xe6e2d8, (i - 1) * 0.8, 0.95, 0, 10);
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  return g;
}

// Arena: monumental hall with columns, element banners and a crest.
export function arena(pal, typeColor, emblem = '✦') {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const w = 20, d = 16, h = 7;
  b.box(w + 1.2, 1.6, d + 1.2, 0x8f8a82, 0, -0.2, 0);
  b.box(w, h, d, mix(pal.wall, 0xe8e2d4, 0.4), 0, 0.6 + h / 2, 0, 0, { shade: 0.15 });
  b.box(w + 0.6, 0.8, d + 0.6, pal.trim, 0, 0.6 + h + 0.4, 0);
  b.add(new THREE.CylinderGeometry(w * 0.38, w * 0.46, 2.2, 8), typeColor, matrix(0, 0.6 + h + 1.9, -1, 0, Math.PI / 8, 0), { shade: 0.2 });
  b.add(new THREE.ConeGeometry(w * 0.4, 3.2, 8), shade(typeColor, 0.8), matrix(0, 0.6 + h + 4.6, -1, 0, Math.PI / 8, 0));
  // portico
  b.box(w * 0.7, 0.6, 3.2, pal.trim, 0, 0.6 + h - 1.2, d / 2 + 1.6);
  b.add(roofGeometry(3.6, w * 0.72, 1.8, 0.2), typeColor, matrix(0, 0.6 + h - 0.9, d / 2 + 1.6, 0, Math.PI / 2, 0));
  for (let i = 0; i < 6; i++) { const x = -w * 0.32 + i * w * 0.128; b.cyl(0.35, 0.42, h - 1.4, 0xf3eee2, x, 0.6 + (h - 1.4) / 2, d / 2 + 2.8, 12); b.box(0.9, 0.3, 0.9, 0xe0d8c8, x, 0.6 + h - 1.5, d / 2 + 2.8); b.box(0.9, 0.3, 0.9, 0xe0d8c8, x, 0.75, d / 2 + 2.8); }
  for (let i = 0; i < 4; i++) b.box(w * 0.72 - i * 0.2, 0.25, 1.1, 0xd8d0c0, 0, 0.12 + i * 0.25 - 0.5, d / 2 + 4.2 - i * 0.5);
  // banners
  for (const sx of [-w / 2 + 1.4, w / 2 - 1.4]) { b.box(1.6, 4.2, 0.08, typeColor, sx, 0.6 + h * 0.55, d / 2 + 0.06); b.box(1.7, 0.2, 0.15, 0xf5cd77, sx, 0.6 + h * 0.55 + 2.1, d / 2 + 0.1); }
  b.box(3.2, 3.6, 0.15, 0x4a3426, 0, 1.8 + 0.6, d / 2 + 0.05);
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) glass.box(1.2, 1.8, 0.08, 0xaad6ea, sx * (w / 2 - 0.05), 3.4, -d / 2 + 3 + k * 4.5, Math.PI / 2);
  finish(g, b, glass);
  const crest = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), new THREE.MeshBasicMaterial({ map: emblemTexture(emblem, '#fff8e2', '#' + C(typeColor).getHexString()) }));
  crest.position.set(0, 0.6 + h - 0.2, d / 2 + 3.25); g.add(crest);
  return g;
}

export function pavilion(pal, typeColor) {
  const g = new THREE.Group(), b = new Builder();
  b.cyl(5.6, 6, 0.8, 0xd8d0c0, 0, 0.1, 0, 8);
  b.cyl(4.6, 4.6, 0.12, typeColor, 0, 0.56, 0, 8);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; if (i === 0 || i === 7) { } b.cyl(0.25, 0.3, 4.4, 0xf4efe4, Math.sin(a) * 4.8, 2.7, Math.cos(a) * 4.8, 10); }
  b.cyl(5.6, 5.4, 0.5, pal.trim, 0, 5.1, 0, 8);
  b.add(new THREE.ConeGeometry(6.4, 2.8, 8), typeColor, matrix(0, 6.7, 0, 0, Math.PI / 8, 0), { shade: 0.25 });
  b.sphere(0.5, 0xf5cd77, 0, 8.3, 0, 1, 1, 1, 10);
  for (let i = 0; i < 3; i++) b.box(3.2, 0.25, 0.8, 0xcfc6b4, 0, 0.12 - i * 0.25 + 0.3, 6 + i * 0.7);
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  return g;
}

export function station() {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const w = 14, d = 10, h = 5;
  b.box(w + 0.4, 1, d + 0.4, 0x4a4a52, 0, 0, 0);
  b.add(new THREE.CylinderGeometry(d / 2, d / 2, w, 16, 1, false, -Math.PI / 2, Math.PI), 0x6b6f7a, matrix(0, 0.5, 0, 0, 0, Math.PI / 2), { shade: 0.2 });
  for (let i = -3; i <= 3; i++) b.add(new THREE.TorusGeometry(d / 2 + 0.05, 0.08, 4, 16, Math.PI), 0x3a3d45, matrix(i * 2, 0.5, 0, 0, Math.PI / 2, 0));
  b.box(w * 0.98, 0.5, 0.2, 0x7d5a9e, 0, 2.2, d / 2 - 0.4); b.box(w * 0.98, 0.3, 0.2, 0xf0974f, 0, 1.7, d / 2 - 0.35);
  b.box(3.4, 3.2, 0.3, 0x2c2e34, 0, 1.6, d / 2 - 0.2);
  glass.box(2.8, 0.25, 0.1, 0xff6a3a, 0, 3.35, d / 2 - 0.05);
  for (let i = 0; i < 3; i++) b.cyl(0.5, 0.5, 2.4, 0x5a5d66, w / 2 + 1.2, 1.2, -2 + i * 2, 10);
  void h;
  finish(g, b, glass);
  return g;
}

export function leagueHall() {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  const w = 22, d = 18, h = 9;
  b.box(w + 2, 1.6, d + 2, 0xd9d4e6, 0, -0.2, 0);
  b.box(w, h, d, 0xf1eef8, 0, 0.6 + h / 2, 0, 0, { shade: 0.15 });
  for (let i = 0; i < 8; i++) { const x = -w / 2 + 1.4 + i * (w - 2.8) / 7; b.cyl(0.5, 0.55, h, 0xffffff, x, 0.6 + h / 2, d / 2 + 1.6, 14); }
  b.box(w + 1, 1, 4, 0xd8b04a, 0, 0.6 + h + 0.5, d / 2 + 1.2);
  b.add(roofGeometry(4.4, w + 1, 2.4, 0.2), 0x3c5fa8, matrix(0, 0.6 + h + 0.9, d / 2 + 1.2, 0, Math.PI / 2, 0));
  b.add(new THREE.SphereGeometry(6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x3c5fa8, matrix(0, 0.6 + h, -1.5));
  b.sphere(0.9, 0xffd27a, 0, 0.6 + h + 6.6, -1.5, 1, 1, 1, 12);
  for (let i = 0; i < 5; i++) b.box(w * 0.6, 0.3, 1.2, 0xe7e2f0, 0, 0.15 + i * 0.3 - 0.6, d / 2 + 5 - i * 0.55);
  b.box(4, 5, 0.2, 0x3a2f5a, 0, 3.1, d / 2 + 0.06);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI; glass.sphere(0.28, 0xffe9a8, Math.cos(a) * 3.2, 0.6 + h - 1.2 + Math.sin(a) * 0.5, d / 2 + 0.2, 1, 1, 1, 6); }
  finish(g, b, glass);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.3), new THREE.MeshBasicMaterial({ map: signTexture('Sternenliga', { bg: '#3a2f5a', icon: '★' }) }));
  sign.position.set(0, 0.6 + h + 0.5, d / 2 + 3.25); g.add(sign);
  return g;
}

export function gate(pal, label, open = true) {
  const g = new THREE.Group(), b = new Builder();
  for (const sx of [-1, 1]) {
    b.box(1.6, 6, 1.6, pal.stone || 0x9b958a, sx * 4, 3, 0, 0, { jitter: 0.05 });
    b.box(2, 0.5, 2, shade(pal.stone || 0x9b958a, 0.85), sx * 4, 6.2, 0);
    b.box(6, 3, 1.2, pal.stone || 0x9b958a, sx * 8, 1.5, 0, 0, { jitter: 0.05 });
  }
  b.box(9.6, 0.9, 1.4, pal.trim, 0, 6.6, 0);
  b.add(roofGeometry(1.8, 10.4, 1.2, 0.2), pal.roof, matrix(0, 7, 0, 0, Math.PI / 2, 0));
  if (!open) for (let i = -3; i <= 3; i++) b.box(0.18, 5.4, 0.18, 0x5a4636, i * 0.9, 2.7, 0);
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.1), new THREE.MeshBasicMaterial({ map: signTexture(label, { bg: '#2f4c66' }), side: THREE.DoubleSide }));
  sign.position.set(0, 5.5, 0.75); g.add(sign);
  g.userData.bars = !open;
  return g;
}

export function bridge(len, width, color = 0x8a6444) {
  const g = new THREE.Group(), b = new Builder();
  const n = Math.ceil(len / 0.6);
  for (let i = 0; i < n; i++) { const z = -len / 2 + i * len / n + len / n / 2; const arc = Math.sin((i + 0.5) / n * Math.PI) * 0.6; b.box(width, 0.16, len / n * 0.9, i % 2 ? color : shade(color, 1.1), 0, 0.35 + arc, z); }
  for (const sx of [-1, 1]) {
    for (let i = 0; i <= 6; i++) { const z = -len / 2 + i * len / 6, arc = Math.sin(i / 6 * Math.PI) * 0.6; b.box(0.16, 1.1, 0.16, shade(color, 0.8), sx * width / 2, 0.85 + arc, z); }
    for (let i = 0; i < 6; i++) { const z0 = -len / 2 + i * len / 6, z1 = z0 + len / 6; const a0 = Math.sin(i / 6 * Math.PI) * 0.6, a1 = Math.sin((i + 1) / 6 * Math.PI) * 0.6; const mid = (z0 + z1) / 2, ang = Math.atan2(a1 - a0, z1 - z0); b.add(new THREE.BoxGeometry(0.12, 0.12, Math.hypot(z1 - z0, a1 - a0)), shade(color, 0.9), matrix(sx * width / 2, 1.35 + (a0 + a1) / 2, mid, -ang, 0, 0)); }
  }
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  return g;
}

export function boardwalkSegment(len, width) {
  const b = new Builder();
  const n = Math.ceil(len / 0.5);
  for (let i = 0; i < n; i++) b.box(width, 0.12, 0.42, i % 2 ? 0x7a5f44 : 0x8a6c4e, 0, 0.25, -len / 2 + i * len / n);
  for (let i = 0; i <= 3; i++) for (const sx of [-1, 1]) b.cyl(0.1, 0.1, 1.6, 0x5a4636, sx * width / 2, -0.4, -len / 2 + i * len / 3, 5);
  return b.build();
}

export function fountain(pal) {
  const g = new THREE.Group(), b = new Builder();
  b.cyl(3.2, 3.4, 0.7, 0xc9c2b4, 0, 0.35, 0, 24);
  b.cyl(2.9, 2.9, 0.1, 0x6a94a8, 0, 0.62, 0, 24);
  b.cyl(0.5, 0.7, 1.6, 0xd8d0c0, 0, 1.4, 0, 12);
  b.cyl(1.3, 0.9, 0.35, 0xc9c2b4, 0, 2.25, 0, 16);
  b.sphere(0.45, pal.accent, 0, 2.8, 0, 1, 1, 1, 10);
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  const water = new THREE.Mesh(new THREE.CircleGeometry(2.85, 24), waterMaterial(0x5fb3d6, { opacity: 0.85 }));
  water.rotation.x = -Math.PI / 2; water.position.y = 0.66; g.add(water);
  return g;
}

export function bench() {
  const b = new Builder();
  for (let i = 0; i < 3; i++) b.box(1.8, 0.07, 0.16, 0x9a6a44, 0, 0.5, -0.18 + i * 0.18);
  for (let i = 0; i < 2; i++) b.box(1.8, 0.14, 0.05, 0x9a6a44, 0, 0.75 + i * 0.18, -0.32);
  for (const sx of [-0.8, 0.8]) b.box(0.08, 0.5, 0.5, 0x3a3f46, sx, 0.25, -0.05);
  return b.build();
}
export function streetLamp() {
  const b = new Builder(), glow = new Builder();
  b.cyl(0.08, 0.12, 3.4, 0x2f3a44, 0, 1.7, 0, 6);
  b.cyl(0.25, 0.3, 0.25, 0x2f3a44, 0, 0.12, 0, 8);
  b.add(new THREE.ConeGeometry(0.42, 0.35, 6), 0x2f3a44, matrix(0, 3.75, 0));
  glow.box(0.32, 0.4, 0.32, 0xfff0c0, 0, 3.4, 0);
  return { geo: b.build(), glow: glow.build() };
}
export function signpost(text) {
  const g = new THREE.Group(), b = new Builder();
  b.cyl(0.08, 0.1, 1.9, 0x6e4e36, 0, 0.95, 0, 6);
  b.box(1.9, 0.6, 0.12, 0x8a6444, 0, 1.6, 0);
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; g.add(m);
  const t = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.5), new THREE.MeshBasicMaterial({ map: signTexture(text, { bg: '#6b4a30', font: 40 }), side: THREE.DoubleSide }));
  t.position.set(0, 1.6, 0.07); g.add(t);
  return g;
}
export function fence(len, color = 0x9a7a54) {
  const b = new Builder();
  const n = Math.max(1, Math.round(len / 1.6));
  for (let i = 0; i <= n; i++) b.box(0.14, 1, 0.14, shade(color, 0.85), -len / 2 + i * len / n, 0.5, 0);
  b.box(len, 0.1, 0.06, color, 0, 0.75, 0); b.box(len, 0.1, 0.06, color, 0, 0.4, 0);
  return b.build();
}
export function chestModel(open = false) {
  const g = new THREE.Group(), b = new Builder();
  b.box(1.1, 0.6, 0.75, 0x8b5b35, 0, 0.3, 0, 0, { shade: 0.2 });
  b.box(1.16, 0.08, 0.8, 0xd9a650, 0, 0.12, 0); b.box(1.16, 0.08, 0.8, 0xd9a650, 0, 0.55, 0);
  const base = new THREE.Mesh(b.build(), envMaterial()); base.castShadow = true; g.add(base);
  const lb = new Builder();
  lb.add(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 10, 1, false, 0, Math.PI), 0x9a6a3e, matrix(0, 0, 0, 0, 0, Math.PI / 2));
  lb.box(0.14, 0.2, 0.06, 0xffd770, 0, 0.0, 0.4);
  const lid = new THREE.Mesh(lb.build(), envMaterial()); lid.position.set(0, 0.6, -0.0); lid.castShadow = true;
  const pivot = new THREE.Group(); pivot.position.set(0, 0.6, -0.37); lid.position.set(0, 0, 0.37); pivot.add(lid); g.add(pivot);
  pivot.rotation.x = open ? -1.9 : 0;
  g.userData.lid = pivot;
  return g;
}
export function ballModel(top = 0xe9523f, size = 0.35) {
  const g = new THREE.Group(), b = new Builder();
  b.add(new THREE.SphereGeometry(size, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), top, null);
  b.add(new THREE.SphereGeometry(size, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0xf6f4ee, null);
  b.add(new THREE.CylinderGeometry(size * 1.01, size * 1.01, size * 0.16, 16), 0x2a2f3a, null);
  b.add(new THREE.CylinderGeometry(size * 0.3, size * 0.3, size * 0.2, 12), 0xf6f4ee, matrix(0, 0, size * 0.95, Math.PI / 2, 0, 0));
  const m = new THREE.Mesh(b.build(), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 80 })); m.castShadow = true; g.add(m);
  return g;
}
export function sparkle(color = 0xfff2a0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: null, color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  return s;
}

// Balloon of the Schattengilde (violet/orange stripes, basket, Schnurrik flag).
export function guildBalloon() {
  const g = new THREE.Group(), b = new Builder();
  const env = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const seg = new THREE.SphereGeometry(4, 6, 14, i / 12 * Math.PI * 2, Math.PI * 2 / 12, 0, Math.PI * 0.72);
    b.add(seg, i % 2 ? 0x7d4fa3 : 0xf0974f, matrix(0, 9.5, 0, 0, 0, 0, 1, 1.18, 1));
  }
  b.add(new THREE.CylinderGeometry(2.6, 1.1, 2.2, 12, 1, true), 0x5e3a7c, matrix(0, 6.9, 0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.add(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 3), 0x5a4a3a, matrix(Math.cos(a) * 0.9, 4.5, Math.sin(a) * 0.9, Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12)); }
  b.box(2, 1.3, 2, 0x8a6440, 0, 2.6, 0, 0, { jitter: 0.1 });
  b.box(2.1, 0.15, 2.1, 0x5a3a28, 0, 3.3, 0);
  b.cyl(0.6, 0.4, 0.3, 0x3a3a3a, 0, 3.9, 0, 8);
  const m = new THREE.Mesh(b.build(), envMaterial({ detail: false, side: THREE.DoubleSide })); m.castShadow = true; env.add(m);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 8), glowMaterial(0xffa040, 0.85)); flame.position.y = 4.4; env.add(flame);
  env.userData.flame = flame;
  g.add(env); g.userData.balloon = env;
  return g;
}
export function tent(color = 0x7d4fa3) {
  const b = new Builder();
  b.add(new THREE.ConeGeometry(2.2, 2.6, 4), color, matrix(0, 1.3, 0, 0, Math.PI / 4, 0), { shade: 0.3 });
  b.add(new THREE.ConeGeometry(0.8, 1.2, 4, 1, true), 0x2a2232, matrix(0, 0.6, 1.05, 0, Math.PI / 4, 0));
  return b.build();
}
export function cage() {
  const b = new Builder();
  b.box(1.6, 0.12, 1.6, 0x3a3d45, 0, 0.06, 0); b.box(1.6, 0.12, 1.6, 0x3a3d45, 0, 1.5, 0);
  for (let i = 0; i < 6; i++) for (const s of [-0.78, 0.78]) { b.cyl(0.03, 0.03, 1.4, 0x8a8f99, -0.75 + i * 0.3, 0.78, s, 4); b.cyl(0.03, 0.03, 1.4, 0x8a8f99, s, 0.78, -0.75 + i * 0.3, 4); }
  return b.build();
}
export function captureDevice() {
  const g = new THREE.Group(), b = new Builder();
  b.cyl(0.5, 0.7, 0.6, 0x3a3d45, 0, 0.3, 0, 8);
  b.cyl(0.12, 0.12, 2.2, 0x5a5d66, 0, 1.7, 0, 6);
  b.add(new THREE.TorusGeometry(0.7, 0.08, 6, 20), 0x7d4fa3, matrix(0, 2.6, 0, Math.PI / 2, 0, 0));
  b.box(0.6, 0.4, 0.1, 0xf0974f, 0, 0.9, 0.5);
  const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; g.add(m);
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glowMaterial(0xff5a3a, 0.9)); light.position.y = 2.6; g.add(light);
  g.userData.light = light;
  return g;
}

// Landmarks per region kind. Returns a group; group.userData.animate(t) optional.
export function landmark(kind, pal) {
  const g = new THREE.Group(), b = new Builder(), glass = new Builder();
  let anim = null;
  const add = (mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  switch (kind) {
    case 'mill': {
      b.box(6, 5, 6, mix(pal.wall, 0xd8c8a8, 0.4), 0, 2.5, 0, 0, { shade: 0.2 });
      b.add(roofSolid(6, 6, 3), mix(pal.wall, 0xd8c8a8, 0.4), matrix(0, 5, 0));
      b.add(roofGeometry(6, 6, 3, 0.4), pal.roof, matrix(0, 4.95, 0));
      windowAt(b, glass, 0, 3, 3, 1.2, 1, pal);
      doorAt(b, -1.6, 3, pal, { awning: false });
      const wheel = new Builder();
      wheel.add(new THREE.TorusGeometry(2.6, 0.2, 6, 24), 0x6e4e36, null);
      for (let i = 0; i < 12; i++) wheel.add(new THREE.BoxGeometry(0.15, 5.2, 0.8), 0x7a5a3e, matrix(0, 0, 0, 0, 0, i / 12 * Math.PI));
      const w = add(new THREE.Mesh(wheel.build(), envMaterial()));
      w.rotation.y = Math.PI / 2; w.position.set(3.6, 2.6, 0);
      anim = (t) => { w.rotation.x = t * 0.6; };
      break;
    }
    case 'lighthouse': {
      for (let i = 0; i < 6; i++) b.cyl(1.9 - i * 0.18, 2.05 - i * 0.18, 2, i % 2 ? 0xd8483a : 0xf6f2ea, 0, 1 + i * 2, 0, 16);
      b.cyl(1.4, 1.4, 0.3, 0x2f3a44, 0, 12.2, 0, 16);
      glass.cyl(0.9, 0.9, 1.6, 0xfff2b0, 0, 13.1, 0, 12);
      b.add(new THREE.ConeGeometry(1.3, 1.4, 12), 0xd8483a, matrix(0, 14.6, 0));
      doorAt(b, 0, 1.9, pal, { awning: false });
      const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 18, 16, 1, true), glowMaterial(0xfff2b0, 0.18));
      beam.geometry.translate(0, -9, 0); beam.rotation.z = Math.PI / 2; const pivot = new THREE.Group(); pivot.position.y = 13.1; pivot.add(beam); g.add(pivot);
      anim = (t, night) => { pivot.rotation.y = t * 0.8; beam.visible = night > 0.3; };
      break;
    }
    case 'windmills': {
      const blades = [];
      for (let k = 0; k < 3; k++) {
        const x = (k - 1) * 9, z = (k % 2) * 4;
        b.cyl(0.25, 0.5, 10, 0xeef0f0, x, 5, z, 10);
        const bl = new Builder();
        for (let i = 0; i < 3; i++) bl.add(new THREE.BoxGeometry(0.4, 4.5, 0.08), 0xffffff, matrix(Math.sin(i * 2.09) * 2.2, Math.cos(i * 2.09) * 2.2, 0, 0, 0, -i * 2.09));
        bl.sphere(0.4, 0xd8dadc, 0, 0, 0, 1, 1, 1, 8);
        const m = add(new THREE.Mesh(bl.build(), envMaterial()));
        m.position.set(x, 10, z + 0.5); blades.push(m);
      }
      anim = (t) => blades.forEach((m, i) => { m.rotation.z = t * (1.1 + i * 0.2); });
      break;
    }
    case 'shrine': {
      b.box(5, 0.5, 5, 0xc9c2b4, 0, 0.25, 0);
      b.box(3, 2.4, 2.6, 0xf1e6d8, 0, 1.7, 0);
      b.add(roofGeometry(3.6, 3.8, 1.6, 0.5), 0xc4567a, matrix(0, 2.9, 0, 0, Math.PI / 2, 0));
      for (const sx of [-3.2, 3.2]) { b.box(0.6, 1.6, 0.6, 0xb8b0a0, sx, 0.8, 2.6); b.box(0.9, 0.5, 0.9, 0xb8b0a0, sx, 1.8, 2.6); glass.box(0.5, 0.4, 0.5, 0xffd890, sx, 1.75, 2.6); }
      for (const sx of [-1.8, 1.8]) b.box(0.3, 4.2, 0.3, 0xc4567a, sx, 2.1, 4.6);
      b.box(4.6, 0.35, 0.4, 0xc4567a, 0, 4.1, 4.6); b.box(4.0, 0.25, 0.3, 0xc4567a, 0, 3.5, 4.6);
      break;
    }
    case 'mushrooms': {
      for (let i = 0; i < 5; i++) { const a = i * 1.3, r = i ? 3.4 : 0, s = i ? 0.6 + (i % 2) * 0.3 : 1.4; b.cyl(0.4 * s, 0.6 * s, 3 * s, 0xf1e6cf, Math.cos(a) * r, 1.5 * s, Math.sin(a) * r, 10); b.add(new THREE.SphereGeometry(2.2 * s, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), [0xd8574a, 0x7a5ad8, 0xe8a03a][i % 3], matrix(Math.cos(a) * r, 2.9 * s, Math.sin(a) * r, 0, 0, 0, 1, 0.65, 1)); for (let k = 0; k < 5; k++) glass.sphere(0.16 * s, 0xfff7c8, Math.cos(a) * r + Math.cos(k * 1.3) * 1.4 * s, 3.8 * s, Math.sin(a) * r + Math.sin(k * 1.3) * 1.4 * s, 1, 0.5, 1, 6); }
      break;
    }
    case 'windtower': {
      b.cyl(1.4, 2.2, 14, 0xd6d8dc, 0, 7, 0, 8);
      b.box(4, 0.4, 4, 0x3d4a5c, 0, 14.2, 0);
      const vane = new Builder();
      for (let i = 0; i < 4; i++) vane.add(new THREE.BoxGeometry(0.3, 5, 1.2), 0xf0f2f4, matrix(Math.sin(i * Math.PI / 2) * 2.5, Math.cos(i * Math.PI / 2) * 2.5, 0, 0, 0.3, -i * Math.PI / 2));
      const v = add(new THREE.Mesh(vane.build(), envMaterial())); v.position.set(0, 15.5, 2.2);
      anim = (t) => { v.rotation.z = t * 2.2; };
      break;
    }
    case 'observatory': {
      b.cyl(4, 4.4, 5, 0xece6f5, 0, 2.5, 0, 20);
      b.add(new THREE.SphereGeometry(4.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x6a74a8, matrix(0, 5, 0));
      b.box(1.1, 4.6, 0.3, 0x2a2f4a, 0, 7.2, 3.2, 0);
      b.add(new THREE.CylinderGeometry(0.45, 0.6, 4, 10), 0x8a8fa8, matrix(0, 8.5, 1.8, -0.7, 0, 0));
      doorAt(b, 0, 4.1, pal, { awning: false });
      break;
    }
    case 'boardwalk': {
      for (let i = 0; i < 3; i++) { b.box(5, 2.8, 4, 0xb8b29a, i * 7 - 7, 2.6, 0); b.add(roofGeometry(4, 5, 1.8, 0.4), 0x4e5a52, matrix(i * 7 - 7, 4, 0, 0, Math.PI / 2, 0)); for (const sx of [-2.2, 2.2]) for (const sz of [-1.6, 1.6]) b.cyl(0.15, 0.15, 2.6, 0x5a4636, i * 7 - 7 + sx, 0, sz, 5); b.box(6.5, 0.15, 5.2, 0x7a5f44, i * 7 - 7, 1.2, 0); }
      break;
    }
    case 'frozenlake': {
      for (let i = 0; i < 4; i++) { const a = i * 1.6; b.add(lumpy(new THREE.IcosahedronGeometry(0.9, 1), 0.2, i), 0xdff4ff, matrix(Math.cos(a) * 4, 1, Math.sin(a) * 4, 0, 0, 0, 0.8, 1.4, 0.8)); }
      b.add(new THREE.OctahedronGeometry(1.4, 0), 0xbfe9ff, matrix(0, 2, 0, 0.2, 0.5, 0, 0.8, 1.8, 0.8));
      break;
    }
    case 'bigtree': {
      const t = new Builder();
      t.cyl(2.6, 4, 22, 0x6a4a32, 0, 11, 0, 14, { shade: 0.35 });
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; t.add(new THREE.CylinderGeometry(0.4, 1.3, 6, 7), 0x5a3e2a, matrix(Math.cos(a) * 3.6, 1.4, Math.sin(a) * 3.6, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9)); }
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; t.add(lumpy(new THREE.IcosahedronGeometry(5, 1), 0.18, i), i % 2 ? shade(pal.grass, 0.75) : shade(pal.grass, 0.9), matrix(Math.cos(a) * 6, 22 + (i % 2) * 3, Math.sin(a) * 6, 0, 0, 0, 1.2, 0.7, 1.2), { shade: 0.35 }); }
      t.add(lumpy(new THREE.IcosahedronGeometry(6, 1), 0.18, 9), shade(pal.grass, 0.85), matrix(0, 27, 0, 0, 0, 0, 1.2, 0.7, 1.2), { shade: 0.35 });
      for (let k = 0; k < 3; k++) { t.cyl(4.6, 4.6, 0.3, 0x8a6a48, 0, 6 + k * 5, 0, 16); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; t.cyl(0.06, 0.06, 1, 0x6e4e36, Math.cos(a) * 4.5, 6.6 + k * 5, Math.sin(a) * 4.5, 4); } }
      const m = add(new THREE.Mesh(t.build(), envMaterial()));
      void m;
      break;
    }
    case 'stormtowers': {
      const rods = [];
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.cyl(0.25, 0.4, 9, 0xb87333, Math.cos(a) * 5, 4.5, Math.sin(a) * 5, 8); b.sphere(0.5, 0xd89a5a, Math.cos(a) * 5, 9.2, Math.sin(a) * 5, 1, 1, 1, 8); }
      b.cyl(1.4, 1.8, 1.4, 0x6a5a4a, 0, 0.7, 0, 10);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(5, 0.08, 4, 40), glowMaterial(0xbfe6ff, 0.0)); arc.rotation.x = Math.PI / 2; arc.position.y = 9.2; g.add(arc); rods.push(arc);
      anim = (t) => { arc.material.opacity = Math.max(0, Math.sin(t * 7) * Math.sin(t * 1.3)) * 0.8; };
      break;
    }
    case 'crystalspires': {
      for (let i = 0; i < 7; i++) { const a = i * 0.9, r = i ? 3 + (i % 3) : 0; b.add(new THREE.ConeGeometry(1 + (i ? 0 : 0.8), 6 + (i ? (i % 3) * 2 : 8), 6), mix(pal.accent, 0xffffff, (i % 3) * 0.2), matrix(Math.cos(a) * r, 3 + (i ? 0 : 3), Math.sin(a) * r, Math.sin(a) * 0.2, a, Math.cos(a) * 0.2)); }
      const glow = new THREE.PointLight(pal.accent, 1.2, 18); glow.position.y = 4; g.add(glow);
      break;
    }
    case 'moonarch': {
      const arc = new THREE.TorusGeometry(5, 1.2, 8, 24, Math.PI);
      b.add(lumpy(arc, 0.08, 4), 0x8a90a8, matrix(0, 0, 0), { shade: 0.3 });
      b.add(new THREE.CylinderGeometry(1.4, 1.8, 2, 8), 0x7a8098, matrix(-5, 0.5, 0)); b.add(new THREE.CylinderGeometry(1.4, 1.8, 2, 8), 0x7a8098, matrix(5, 0.5, 0));
      glass.sphere(0.6, 0xe0e6ff, 0, 5.6, 0, 1, 1, 1, 10);
      break;
    }
    case 'suntemple': {
      for (let i = 0; i < 4; i++) b.box(12 - i * 2.6, 1.6, 12 - i * 2.6, mix(0xd8b07a, 0xf4dcb0, i * 0.2), 0, 0.8 + i * 1.6, 0, 0, { jitter: 0.04 });
      b.box(1.8, 6.4, 0.3, 0xb46a42, 0, 3.2, 6.1);
      for (let i = 0; i < 6; i++) b.box(3, 0.3, 0.8, 0xe6c896, 0, 0.15 + i * 0.6, 6.4 + 0 - i * 0.45);
      const disc = add(new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.35, 8, 24), new THREE.MeshLambertMaterial({ color: 0xffb83a, emissive: 0xff8a20, emissiveIntensity: 0.5 })));
      disc.position.set(0, 8.6, 0);
      anim = (t) => { disc.rotation.y = t * 0.5; };
      break;
    }
    case 'skybridge': {
      for (let i = 0; i < 3; i++) { const x = (i - 1) * 7, y = 1 + i; b.add(lumpy(new THREE.ConeGeometry(2.4, 4, 7), 0.15, i), 0xbfb6c8, matrix(x, y - 1.6, i * 2, Math.PI, 0, 0)); b.cyl(2.4, 2.4, 0.5, 0x8fcf8a, x, y + 0.6, i * 2, 7); }
      break;
    }
    case 'machine': {
      b.cyl(6, 6.5, 1, 0x3a3d45, 0, 0.5, 0, 24);
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; b.box(0.8, 6, 0.8, 0x5a5d66, Math.cos(a) * 5, 3.5, Math.sin(a) * 5); }
      const ring = add(new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.35, 8, 40), new THREE.MeshLambertMaterial({ color: 0x7d4fa3, emissive: 0x7d4fa3, emissiveIntensity: 0.6 })));
      ring.position.y = 6; const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), glowMaterial(0xfff0b0, 0.8)); core.position.y = 6; g.add(core);
      g.userData.core = core;
      anim = (t) => { ring.rotation.x = Math.PI / 2 + Math.sin(t) * 0.2; ring.rotation.z = t * 0.6; core.rotation.y = t; core.scale.setScalar(1 + Math.sin(t * 3) * 0.08); };
      break;
    }
    case 'volcano': {
      const glow = new THREE.Mesh(new THREE.CircleGeometry(6, 20), new THREE.MeshBasicMaterial({ color: 0xff6a2a })); glow.rotation.x = -Math.PI / 2; glow.position.y = 15.6; g.add(glow);
      const l = new THREE.PointLight(0xff6a2a, 2, 40); l.position.y = 18; g.add(l);
      break;
    }
    default: {
      b.box(2, 3, 2, 0xb8b0a0, 0, 1.5, 0);
    }
  }
  if (!b.empty) add(new THREE.Mesh(b.build(), envMaterial()));
  if (!glass.empty) g.add(new THREE.Mesh(glass.build(), windowMaterial));
  g.userData.animate = anim;
  return g;
}

export function shrineStone(color = 0xd8d0f0) {
  const b = new Builder();
  b.cyl(2.4, 2.6, 0.4, 0xb8b0a0, 0, 0.2, 0, 10);
  b.add(new THREE.OctahedronGeometry(0.9, 0), color, matrix(0, 2.2, 0, 0, 0, 0, 0.7, 1.6, 0.7));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; b.box(0.4, 1.6, 0.4, 0xa8a090, Math.cos(a) * 1.8, 1, Math.sin(a) * 1.8); }
  return b.build();
}
