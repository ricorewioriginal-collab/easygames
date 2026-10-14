/* Prozedurale Figuren (Spieler und Bewohner): runde, freundliche Formen, Vertexfarben, wenige Meshes je Figur.
   Animation über Gelenk-Gruppen: Gehen, Rennen, Springen, Schwimmen, Gleiten, Sitzen, Winken, Tanzen, Jubeln, Schlafen, Schwertschlag. */
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { clamp, damp } from '../core/math.ts';
import { type Appearance, CLOTH_COLORS, EYE_COLORS, HAIR_COLORS, SKIN } from './appearance.ts';

export type Pose = 'idle' | 'walk' | 'swim' | 'air' | 'glide' | 'sit' | 'drive' | 'sleep' | 'climb';
export type Emote = 'wave' | 'dance' | 'cheer' | 'bow' | 'clap' | 'think' | 'point' | 'laugh' | 'attack' | 'spin' | 'block' | 'cast' | 'pet' | 'talk' | 'dig' | 'fish';

interface Dims { head: number; torso: number; leg: number; arm: number; width: number; scale: number }
function dims(a: Appearance): Dims {
  const base = [{ head: 0.27, torso: 0.42, leg: 0.48, arm: 0.44 }, { head: 0.25, torso: 0.5, leg: 0.66, arm: 0.54 }, { head: 0.24, torso: 0.57, leg: 0.76, arm: 0.6 }][a.age];
  return { ...base, width: [0.88, 1, 1.18][a.build], scale: 0.92 + a.height * 0.04 };
}

const shade = (c: number, f: number): number => {
  const r = Math.min(255, Math.round(((c >> 16) & 255) * f)), g = Math.min(255, Math.round(((c >> 8) & 255) * f)), b = Math.min(255, Math.round((c & 255) * f));
  return (r << 16) | (g << 8) | b;
};

/* ---------- Kopf ---------- */
function buildHead(b: GeoBuilder, a: Appearance, R: number): void {
  const skin = SKIN[a.skin], hair = HAIR_COLORS[a.hairColor];
  const fx = [1, 1.06, 0.95][a.face], fy = [1, 0.94, 1.06][a.face];
  b.ball(0, 0, 0, R, skin, { sx: fx, sy: fy });
  // Ohren
  b.sph(-R * 0.98 * fx, -R * 0.05, 0, R * 0.2, shade(skin, 0.95), { sz: 0.6 });
  b.sph(R * 0.98 * fx, -R * 0.05, 0, R * 0.2, shade(skin, 0.95), { sz: 0.6 });
  // Augen: Weiß, Iris, Glanz
  const ey = R * 0.08, ex = R * 0.36, ez = R * 0.86;
  for (const s of [-1, 1]) {
    b.sph(s * ex, ey, ez, R * 0.2, 0xffffff, { sz: 0.5 });
    b.sph(s * ex, ey - R * 0.01, ez + R * 0.07, R * 0.13, EYE_COLORS[a.eyes], { sz: 0.45 });
    b.sph(s * ex, ey - R * 0.01, ez + R * 0.12, R * 0.07, 0x1a1a22, { sz: 0.4 });
    b.sph(s * ex + R * 0.05, ey + R * 0.06, ez + R * 0.15, R * 0.035, 0xffffff, { detail: 0 });
    // Augenbrauen
    const by = ey + R * (a.brows === 0 ? 0.3 : a.brows === 1 ? 0.33 : 0.36);
    b.box(s * ex, by, ez + R * 0.05, R * 0.3, R * 0.06, R * 0.08, shade(hair, 0.8), { rz: s * (a.brows === 2 ? -0.25 : 0.12) });
  }
  // Nase
  b.sph(0, -R * 0.12, R * 0.98, R * 0.1, shade(skin, 0.92), { detail: 0 });
  // Mund: Lächeln aus kleinen Kugeln
  const mc = 0xb84a4a, mz = R * 0.9, my = -R * 0.4;
  if (a.mouth === 1) b.sph(0, my, mz, R * 0.12, 0x7a2a2a, { sy: 0.7, sz: 0.4 });
  else if (a.mouth === 3) { b.box(0, my, mz, R * 0.34, R * 0.05, R * 0.06, mc); }
  else {
    const w = a.mouth === 2 ? 0.34 : 0.26;
    for (let i = -2; i <= 2; i++) { const t = i / 2; b.sph(t * R * w, my + t * t * R * 0.08, mz - Math.abs(t) * R * 0.04, R * 0.045, mc, { detail: 0 }); }
  }
  if (a.cheeks) for (const s of [-1, 1]) b.sph(s * R * 0.58, -R * 0.22, R * 0.74, R * 0.13, 0xff9a9a, { sz: 0.3, detail: 0 });
  if (a.freckles) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) b.sph(s * R * (0.42 + i * 0.07), -R * (0.08 + (i % 2) * 0.05), R * 0.9, R * 0.022, 0xa0622e, { detail: 0 });
  // Bart
  const beard = shade(hair, 0.9);
  if (a.beard === 'schnurr') b.sph(0, -R * 0.27, R * 0.95, R * 0.17, beard, { sy: 0.35, sz: 0.4 });
  else if (a.beard === 'kinn') b.sph(0, -R * 0.72, R * 0.62, R * 0.18, beard, { sy: 0.7 });
  else if (a.beard === 'voll') { b.sph(0, -R * 0.55, R * 0.45, R * 0.62, beard, { sy: 0.7, sz: 0.75 }); b.sph(0, -R * 0.27, R * 0.95, R * 0.17, beard, { sy: 0.35, sz: 0.4 }); }
  else if (a.beard === 'stoppel') b.ball(0, -R * 0.35, R * 0.18, R * 0.86, shade(skin, 0.82), { sy: 0.62 });
  buildHair(b, a, R, hair, fx);
  buildHat(b, a, R);
  // Brille
  if (a.glasses !== 'none') {
    const gc = a.glasses === 'sonne' ? 0x111111 : a.glasses === 'herz' ? 0xff4f8a : a.glasses === 'stern' ? 0xffc83d : 0x333333;
    for (const s of [-1, 1]) {
      b.torus(s * ex, ey, ez + R * 0.18, R * 0.2, R * 0.035, gc);
      if (a.glasses === 'sonne' || a.glasses === 'herz') b.sph(s * ex, ey, ez + R * 0.18, R * 0.18, gc, { sz: 0.15 });
    }
    b.box(0, ey, ez + R * 0.18, R * 0.3, R * 0.04, R * 0.04, gc);
  }
}

function buildHair(b: GeoBuilder, a: Appearance, R: number, c: number, fx: number): void {
  const d = shade(c, 0.88);
  const cap = (sy = 0.78, y = 0.26, back = -0.06) => b.ball(0, R * y, R * back, R * 1.07, c, { sx: fx * 1.02, sy, sz: 1.05 });
  switch (a.hair) {
    case 'glatze': return;
    case 'pilz':
      b.ball(0, R * 0.2, -R * 0.05, R * 1.13, c, { sx: fx * 1.04, sy: 0.88, sz: 1.08 });
      b.box(0, R * 0.36, R * 0.8, R * 1.7, R * 0.32, R * 0.4, d);
      for (const s of [-1, 1]) b.box(s * R * 0.95, -R * 0.25, 0, R * 0.25, R * 0.7, R * 1.2, c);
      break;
    case 'kurz': cap(0.7, 0.3); break;
    case 'seite': cap(0.72, 0.3); b.sph(R * 0.45, R * 0.72, R * 0.45, R * 0.42, d, { sy: 0.45 }); break;
    case 'strubbel':
      cap(0.72, 0.3);
      for (let i = 0; i < 9; i++) { const a2 = (i / 9) * Math.PI * 2; b.cone(Math.cos(a2) * R * 0.45, R * 0.75, Math.sin(a2) * R * 0.45 - R * 0.1, R * 0.2, R * 0.5, i % 2 ? c : d, 5, { rx: Math.sin(a2) * 0.6, rz: -Math.cos(a2) * 0.6 }); }
      break;
    case 'zopf':
      cap(0.75, 0.28);
      b.sph(0, R * 0.25, -R * 1.05, R * 0.22, d);
      b.cone(0, -R * 1.1, -R * 1.15, R * 0.24, R * 1.25, c, 7, { rx: 3.0 });
      break;
    case 'zoepfe':
      cap(0.75, 0.28);
      for (const s of [-1, 1]) { b.sph(s * R * 0.95, -R * 0.1, -R * 0.3, R * 0.24, d); b.cyl(s * R * 1.0, -R * 1.25, -R * 0.35, R * 0.15, R * 0.2, R * 1.1, c, 7); b.sph(s * R * 1.0, -R * 1.3, -R * 0.35, R * 0.13, 0xff6fb5); }
      break;
    case 'lang':
      cap(0.8, 0.25);
      b.box(0, -R * 1.4, -R * 0.55, R * 1.9, R * 1.9, R * 0.55, c);
      for (const s of [-1, 1]) b.box(s * R * 0.9, -R * 1.1, -R * 0.05, R * 0.3, R * 1.4, R * 0.9, c);
      break;
    case 'bob':
      cap(0.82, 0.22);
      for (const s of [-1, 1]) b.box(s * R * 0.92, -R * 0.55, -R * 0.1, R * 0.32, R * 0.95, R * 1.4, c);
      b.box(0, -R * 0.55, -R * 0.75, R * 1.9, R * 0.95, R * 0.4, c);
      b.box(0, R * 0.45, R * 0.82, R * 1.4, R * 0.25, R * 0.3, d);
      break;
    case 'locken':
      for (let i = 0; i < 22; i++) { const t = i / 22, a2 = t * Math.PI * 2 * 3.3, y = 0.95 - t * 1.2; const r = Math.sqrt(Math.max(0, 1 - y * y)) * 1.0 + 0.1; if (Math.sin(a2) > 0.55 && y < 0.5) continue; b.sph(Math.cos(a2) * r * R, y * R, Math.sin(a2) * r * R - R * 0.05, R * 0.33, i % 3 ? c : d); }
      break;
    case 'dutt': cap(0.76, 0.28); b.sph(0, R * 1.05, -R * 0.25, R * 0.4, d); break;
    case 'afro': b.ball(0, R * 0.42, -R * 0.2, R * 1.45, c, { sy: 0.92 }); break;
    case 'irokese': b.box(0, R * 0.55, -R * 0.15, R * 0.28, R * 0.85, R * 1.8, c, { rx: 0.1 }); break;
    case 'stachel':
      cap(0.7, 0.3);
      for (let i = 0; i < 7; i++) { const a2 = -0.9 + i * 0.3; b.cone(Math.sin(a2) * R * 0.6, R * 0.55, -R * 0.2 + Math.cos(a2) * R * 0.1, R * 0.28, R * 1.2, i % 2 ? c : d, 5, { rz: -Math.sin(a2) * 0.9, rx: -0.4 }); }
      break;
  }
}

function buildHat(b: GeoBuilder, a: Appearance, R: number): void {
  const c = CLOTH_COLORS[a.hatColor], d = shade(c, 0.8);
  const top = R * 0.85;
  switch (a.hat) {
    case 'cap': b.ball(0, R * 0.3, 0, R * 1.1, c, { sy: 0.62 }); b.box(0, R * 0.45, R * 1.0, R * 1.3, R * 0.08, R * 0.8, d); break;
    case 'muetze': b.ball(0, R * 0.32, -R * 0.03, R * 1.12, c, { sy: 0.78 }); b.cyl(0, R * 0.05, 0, R * 1.14, R * 1.14, R * 0.25, d, 14); b.sph(0, R * 1.2, 0, R * 0.25, 0xffffff); break;
    case 'krone': b.cyl(0, top, 0, R * 0.7, R * 0.7, R * 0.35, 0xffc83d, 10); for (let i = 0; i < 5; i++) { const a2 = (i / 5) * Math.PI * 2; b.cone(Math.cos(a2) * R * 0.62, top + R * 0.33, Math.sin(a2) * R * 0.62, R * 0.12, R * 0.3, 0xffc83d, 5); b.sph(Math.cos(a2) * R * 0.7, top + R * 0.18, Math.sin(a2) * R * 0.7, R * 0.07, [0xe8453c, 0x3f8cff, 0x4cd07d][i % 3]); } break;
    case 'zauberhut': b.cyl(0, top - R * 0.1, 0, R * 1.3, R * 1.3, R * 0.06, d, 16); b.cone(0, top - R * 0.06, 0, R * 0.75, R * 1.9, c, 12, { rx: -0.15 }); b.sph(R * 0.2, top + R * 0.8, R * 0.4, R * 0.12, 0xffe14a); break;
    case 'piratenhut': b.box(0, top - R * 0.15, 0, R * 2.3, R * 0.5, R * 1.1, 0x2d2f3a); b.ball(0, top + R * 0.1, 0, R * 0.8, 0x2d2f3a, { sy: 0.7 }); b.sph(0, top + R * 0.15, R * 0.55, R * 0.16, 0xffffff); break;
    case 'hasenohren': for (const s of [-1, 1]) { b.sph(s * R * 0.42, top + R * 0.75, 0, R * 0.23, 0xffffff, { sy: 3 }); b.sph(s * R * 0.42, top + R * 0.75, R * 0.08, R * 0.14, 0xffb3d1, { sy: 2.6, sz: 0.5 }); } break;
    case 'katzenohren': for (const s of [-1, 1]) { b.cone(s * R * 0.55, top, 0, R * 0.3, R * 0.5, c, 4, { rz: -s * 0.25 }); } break;
    case 'helm': b.ball(0, R * 0.35, 0, R * 1.14, c, { sy: 0.75 }); for (let i = -1; i <= 1; i++) b.box(i * R * 0.35, R * 0.95, 0, R * 0.12, R * 0.12, R * 1.5, d); break;
    case 'cowboy': b.cyl(0, top - R * 0.1, 0, R * 1.55, R * 1.55, R * 0.08, 0x8a5a33, 16); b.cyl(0, top - R * 0.05, 0, R * 0.75, R * 0.85, R * 0.65, 0x9a6a3a, 12); b.cyl(0, top + R * 0.02, 0, R * 0.87, R * 0.87, R * 0.12, 0x5a3a1a, 12); break;
    case 'stirnband': b.cyl(0, R * 0.35, 0, R * 1.05, R * 1.05, R * 0.2, c, 16); b.box(0, R * 0.42, -R * 1.15, R * 0.2, R * 0.12, R * 0.6, c, { rx: 0.6 }); break;
    case 'drachenhelm': b.ball(0, R * 0.4, 0, R * 1.12, 0x3fae46, { sy: 0.75 }); for (const s of [-1, 1]) b.cone(s * R * 0.6, top + R * 0.05, -R * 0.1, R * 0.15, R * 0.6, 0xfff1c0, 6, { rz: -s * 0.5, rx: -0.4 }); for (let i = 0; i < 4; i++) b.cone(0, top + R * 0.1 - i * R * 0.3, -R * 0.4 - i * R * 0.2, R * 0.12, R * 0.35, 0xff8a1f, 4, { rx: -0.6 - i * 0.3 }); break;
    case 'blume': for (let i = 0; i < 9; i++) { const a2 = (i / 9) * Math.PI * 2; b.sph(Math.cos(a2) * R * 0.95, R * 0.45, Math.sin(a2) * R * 0.95, R * 0.17, [0xff6fb5, 0xfff07a, 0xffffff][i % 3]); } break;
  }
}

/* ---------- Körper ---------- */
function torsoProfile(D: Dims, dress: boolean): THREE.Vector2[] {
  const w = D.width, T = D.torso;
  const pts = [[0.001, 0], [0.18 * w, 0.0], [0.2 * w, T * 0.25], [0.19 * w, T * 0.5], [0.21 * w, T * 0.8], [0.17 * w, T * 0.97], [0.07, T * 1.04], [0.001, T * 1.05]];
  if (dress) { pts[1] = [0.34 * w, -0.24]; pts[0] = [0.001, -0.24]; }
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
}
const latheCache = new Map<string, THREE.BufferGeometry>();
function lathe(D: Dims, dress: boolean): THREE.BufferGeometry {
  const key = D.torso + '|' + D.width + '|' + dress;
  let g = latheCache.get(key);
  if (!g) { g = new THREE.LatheGeometry(torsoProfile(D, dress), 16).toNonIndexed(); g.computeVertexNormals(); latheCache.set(key, g); }
  return g;
}

function buildTorso(b: GeoBuilder, a: Appearance, D: Dims): void {
  const top = CLOTH_COLORS[a.topColor], skin = SKIN[a.skin];
  const dress = a.top === 'kleid';
  const m = new THREE.Matrix4();
  b.addGeo(lathe(D, dress), m.identity(), top);
  const T = D.torso, w = D.width;
  // Hals
  b.cyl(0, T * 0.98, 0, 0.065, 0.075, 0.12, skin, 8);
  if (a.top === 'hoodie') { b.torus(0, T * 0.98, -0.03, 0.15 * w, 0.05, shade(top, 0.85), { rx: Math.PI / 2 + 0.2 }); b.box(0, T * 0.2, 0.19 * w, 0.2, 0.12, 0.04, shade(top, 0.85)); }
  if (a.top === 'jacke' || a.top === 'uniform') { b.box(0, 0.02, 0.18 * w, 0.03, T * 0.95, 0.03, shade(top, 0.7)); for (let i = 0; i < 3; i++) b.sph(0.05, T * (0.25 + i * 0.22), 0.205 * w, 0.018, 0xffd23f, { detail: 0 }); }
  if (a.top === 'uniform') { b.sph(-0.1 * w, T * 0.72, 0.19 * w, 0.05, 0xffd23f, { sz: 0.3 }); }
  if (a.top === 'latz') { b.box(0, T * 0.12, 0.185 * w, 0.24 * w, T * 0.55, 0.03, CLOTH_COLORS[a.bottomColor]); for (const s of [-1, 1]) b.box(s * 0.09 * w, T * 0.6, 0.16 * w, 0.04, T * 0.4, 0.05, CLOTH_COLORS[a.bottomColor]); }
  if (a.top === 'robe') { b.cone(0, -0.42, 0, 0.36 * w, 0.75, shade(top, 0.9), 14); for (let i = 0; i < 6; i++) b.sph(Math.cos(i) * 0.2, T * (0.2 + (i % 3) * 0.2), 0.19 * w, 0.02, 0xfff07a, { detail: 0 }); }
  if (a.top === 'ruestung') { b.ball(0, T * 0.6, 0.02, 0.23 * w, 0x9aa7b8, { sy: 1.25, sz: 0.95 }); b.sph(0, T * 0.62, 0.22 * w, 0.06, 0x4cd07d); }
  // Muster
  const pc = a.pattern === 'blitz' ? 0xffd23f : a.pattern === 'herz' ? 0xff4f8a : a.pattern === 'stern' ? 0xfff07a : 0xffffff;
  const cz = 0.2 * w + 0.005, cy = T * 0.58;
  switch (a.pattern) {
    case 'streifen': for (let i = 0; i < 3; i++) b.cyl(0, T * (0.22 + i * 0.22), 0, 0.207 * w, 0.207 * w, 0.06, shade(top, 1.35), 16); break;
    case 'regenbogen': [0xe8453c, 0xff8a1f, 0xffd23f, 0x4cd07d, 0x3f8cff, 0xb36bff].forEach((c, i) => b.cyl(0, T * (0.15 + i * 0.1), 0, 0.208 * w, 0.208 * w, T * 0.1, c, 16)); break;
    case 'stern': for (let i = 0; i < 5; i++) b.box(0, cy, cz, 0.04, 0.16, 0.02, pc, { rz: (i / 5) * Math.PI }); break;
    case 'herz': b.sph(-0.035, cy + 0.02, cz, 0.045, pc, { sz: 0.3 }); b.sph(0.035, cy + 0.02, cz, 0.045, pc, { sz: 0.3 }); b.cone(0, cy - 0.07, cz, 0.065, 0.08, pc, 4, { rz: Math.PI }); break;
    case 'blitz': b.box(0.02, cy + 0.04, cz, 0.05, 0.12, 0.02, pc, { rz: -0.5 }); b.box(-0.02, cy - 0.05, cz, 0.05, 0.12, 0.02, pc, { rz: -0.5 }); b.box(0, cy, cz, 0.09, 0.03, 0.02, pc); break;
  }
  // Zubehör am Rücken
  const ac = CLOTH_COLORS[a.accColor];
  if (a.acc === 'rucksack') { b.rbox(0, T * 0.25, -0.24 * w, 0.32 * w, 0.4, 0.18, ac); b.rbox(0, T * 0.3, -0.34 * w, 0.24 * w, 0.18, 0.06, shade(ac, 0.8)); }
  if (a.acc === 'schal') { b.torus(0, T * 0.94, 0, 0.13 * w, 0.06, ac, { rx: Math.PI / 2 }); b.box(0.06, T * 0.55, 0.17 * w, 0.08, 0.3, 0.04, ac, { rz: 0.1 }); }
  if (a.acc === 'fuchs') { b.sph(0, 0.02, -0.25 * w, 0.12, 0xff8a1f, { sy: 0.8, sz: 2.4, rx: 0.6 }); b.sph(0, -0.18, -0.48 * w, 0.09, 0xffffff, { sz: 1.2, rx: 0.6 }); }
}

function buildArm(b: GeoBuilder, a: Appearance, D: Dims): void {
  const top = CLOTH_COLORS[a.topColor], skin = SKIN[a.skin];
  const L = D.arm, sleeve = a.top === 'tshirt' || a.top === 'kleid' || a.top === 'latz' ? 0.42 : 0.88;
  const r = 0.055 * D.width;
  b.sph(0, 0, 0, r * 1.3, a.top === 'latz' ? skin : top);
  b.cyl(0, -L * sleeve, 0, r * 1.15, r * 1.05, L * sleeve, a.top === 'latz' ? skin : top, 8);
  b.cyl(0, -L * 0.95, 0, r * 0.95, r * 0.95, L * (0.95 - sleeve), skin, 8);
  b.sph(0, -L, 0, r * 1.25, skin, { sy: 1.1 });
  if (a.top === 'ruestung') b.sph(0, 0, 0, r * 1.8, 0x9aa7b8, { sy: 0.8 });
}
function buildLeg(b: GeoBuilder, a: Appearance, D: Dims): void {
  const bc = CLOTH_COLORS[a.bottomColor], skin = SKIN[a.skin], sc = CLOTH_COLORS[a.shoeColor];
  const L = D.leg, r = 0.075 * D.width;
  const pantsLen = a.bottom === 'hose' && a.top !== 'kleid' ? 0.88 : a.bottom === 'shorts' ? 0.42 : 0.2;
  const legC = a.top === 'kleid' || a.bottom === 'rock' ? skin : bc;
  b.cyl(0, -L * pantsLen, 0, r, r * 1.05, L * pantsLen, legC === skin && pantsLen < 0.3 ? skin : bc, 8);
  b.cyl(0, -L * 0.9, 0, r * 0.85, r * 0.9, L * (0.9 - pantsLen) + 0.001, skin, 8);
  if (a.shoes === 'stiefel') b.cyl(0, -L * 0.98, 0, r * 1.05, r * 1.05, L * 0.4, sc, 8);
  const soleY = -L - 0.02;
  if (a.shoes === 'sandale') { b.rbox(0, soleY, 0.04, r * 2.2, 0.04, r * 3.6, 0x8a5a33); b.box(0, soleY + 0.04, 0.05, r * 2.2, 0.03, 0.03, sc); b.sph(0, soleY + 0.06, 0.06, r * 0.95, skin, { sz: 1.6 }); }
  else { b.rbox(0, soleY, 0.04, r * 2.4, 0.13, r * 3.8, sc); b.rbox(0, soleY, 0.04, r * 2.5, 0.04, r * 3.9, 0xffffff); }
  if (a.bottom === 'rock' && a.top !== 'kleid') { /* Rock hängt am Rumpf, siehe unten */ }
}

export interface AvatarParts { root: THREE.Group; body: THREE.Group; torso: THREE.Group; head: THREE.Group; armL: THREE.Group; armR: THREE.Group; legL: THREE.Group; legR: THREE.Group; hand: THREE.Group; back: THREE.Group }

/** Eine animierte Figur. */
export class Avatar {
  readonly root = new THREE.Group();
  private body = new THREE.Group();
  private hips = new THREE.Group();
  private torso = new THREE.Group();
  readonly head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  readonly handR = new THREE.Group();
  private back = new THREE.Group();
  private lids: THREE.Mesh | null = null;
  private meshes: THREE.Mesh[] = [];
  private D!: Dims;
  height = 1.4;
  private phase = 0;
  private blinkT = 2;
  private emoteT = 0;
  private emote: Emote | null = null;
  private emoteDur = 0;
  pose: Pose = 'idle';
  speed = 0;
  vy = 0;
  private lean = 0;
  private t = 0;
  private wingL: THREE.Mesh | null = null;
  private wingR: THREE.Mesh | null = null;
  private cape: THREE.Mesh | null = null;
  constructor(public look: Appearance, private shadow = true) {
    this.root.add(this.body);
    this.body.add(this.hips);
    this.build(look);
  }
  build(a: Appearance): void {
    for (const m of this.meshes) { m.parent?.remove(m); m.geometry.dispose(); }
    this.meshes = [];
    this.look = a;
    const D = (this.D = dims(a));
    const mat = mats().vc;
    const add = (parent: THREE.Object3D, b: GeoBuilder) => { const m = b.mesh(mat, this.shadow); m.castShadow = this.shadow; parent.add(m); this.meshes.push(m); return m; };
    this.hips.position.set(0, D.leg + 0.02, 0);
    this.hips.add(this.torso, this.legL, this.legR);
    this.torso.add(this.head, this.armL, this.armR, this.back);
    // Rumpf
    const tb = new GeoBuilder(); buildTorso(tb, a, D);
    if (a.bottom === 'rock' && a.top !== 'kleid') tb.cone(0, -0.22, 0, 0.3 * D.width, 0.36, CLOTH_COLORS[a.bottomColor], 14);
    // Hüfte/Hose oben
    if (a.top !== 'kleid' && a.top !== 'robe') tb.ball(0, 0.0, 0, 0.19 * D.width, a.top === 'latz' ? CLOTH_COLORS[a.bottomColor] : CLOTH_COLORS[a.bottomColor], { sy: 0.7 });
    add(this.torso, tb);
    // Kopf
    const R = D.head;
    this.head.position.set(0, D.torso + 0.08 + R * 0.9, 0);
    const hb = new GeoBuilder(); buildHead(hb, a, R); add(this.head, hb);
    // Augenlider zum Blinzeln
    const lb = new GeoBuilder();
    for (const s of [-1, 1]) lb.sph(s * R * 0.36, R * 0.08, R * 0.9, R * 0.21, SKIN[a.skin], { sz: 0.55 });
    this.lids = add(this.head, lb); this.lids.visible = false; this.lids.castShadow = false;
    // Arme
    for (const [g, s] of [[this.armL, -1], [this.armR, 1]] as const) {
      g.position.set(s * 0.23 * D.width, D.torso * 0.86, 0);
      const ab = new GeoBuilder(); buildArm(ab, a, D); add(g, ab);
    }
    this.handR.position.set(0, -D.arm, 0.02);
    this.armR.add(this.handR);
    for (const [g, s] of [[this.legL, -1], [this.legR, 1]] as const) {
      g.position.set(s * 0.1 * D.width, 0, 0);
      const lb2 = new GeoBuilder(); buildLeg(lb2, a, D); add(g, lb2);
    }
    // Rücken: Umhang/Flügel
    this.back.position.set(0, D.torso * 0.9, -0.17 * D.width);
    this.wingL = this.wingR = this.cape = null;
    const ac = CLOTH_COLORS[a.accColor];
    if (a.acc === 'umhang') {
      const cb = new GeoBuilder(); cb.box(0, -D.torso - D.leg * 0.6, -0.03, 0.46 * D.width, D.torso + D.leg * 0.6, 0.03, ac); cb.box(0, -0.03, 0, 0.3 * D.width, 0.05, 0.08, shade(ac, 0.7));
      this.cape = add(this.back, cb);
    }
    if (a.acc === 'fluegel' || a.acc === 'drachenfluegel') {
      const dragon = a.acc === 'drachenfluegel';
      for (const s of [-1, 1]) {
        const wb = new GeoBuilder();
        if (dragon) { wb.box(s * 0.32, -0.3, 0, 0.62, 0.5, 0.03, 0x3fae46, { rz: s * 0.2 }); wb.cone(s * 0.62, -0.05, 0, 0.04, 0.2, 0xfff1c0, 4); }
        else { wb.sph(s * 0.25, -0.05, 0, 0.26, 0xbfe9ff, { sy: 1.3, sz: 0.12 }); wb.sph(s * 0.2, -0.38, 0, 0.17, 0xffd1f0, { sy: 1.1, sz: 0.12 }); }
        const w = add(this.back, wb);
        if (s < 0) this.wingL = w; else this.wingR = w;
      }
    }
    this.height = (D.leg + 0.08 + D.torso + 0.08 + R * 1.9) * D.scale;
    this.body.scale.setScalar(D.scale);
  }
  setLook(a: Appearance): void { this.build(a); }
  play(e: Emote, dur = 1.6): void { this.emote = e; this.emoteT = 0; this.emoteDur = dur; }
  stopEmote(): void { this.emote = null; }
  get emoting(): Emote | null { return this.emote; }
  /** Pro Bild aufrufen. speed in m/s (Boden), vy vertikal. */
  update(dt: number): void {
    this.t += dt;
    const D = this.D;
    const s = this.speed, run = clamp((s - 3.2) / 3, 0, 1);
    if (this.pose === 'walk' || this.pose === 'swim') this.phase += dt * (s * 2.3 + 1.2) / Math.max(0.6, D.leg * 1.6);
    const ph = this.phase, sw = Math.sin(ph), cw = Math.cos(ph);
    // Standardwerte
    let hipY = 0, bodyRx = 0, legLx = 0, legRx = 0, armLx = 0, armRx = 0, armLz = 0.08, armRz = -0.08, headRx = 0, headRy = 0, torsoRy = 0, torsoRx = 0, bodyRz = 0;
    let legLz = 0, legRz = 0;
    switch (this.pose) {
      case 'idle': {
        const br = Math.sin(this.t * 2.1);
        hipY = br * 0.006; armLz = 0.1 + br * 0.02; armRz = -0.1 - br * 0.02; headRx = br * 0.02;
        break;
      }
      case 'walk': {
        const amp = clamp(s / 3, 0.2, 1) * (0.55 + run * 0.35);
        legLx = sw * amp; legRx = -sw * amp; armLx = -sw * amp * 0.85; armRx = sw * amp * 0.85;
        hipY = Math.abs(cw) * 0.05 * amp; torsoRy = sw * 0.08 * amp; bodyRx = run * 0.18;
        armLz = 0.12; armRz = -0.12;
        if (run > 0.3) { armLx -= 0.3 * run; armRx -= 0.3 * run; }
        break;
      }
      case 'air': {
        const up = this.vy > 0;
        legLx = up ? -0.7 : -0.2; legRx = up ? 0.25 : 0.1; armLx = -0.4; armRx = -0.4; armLz = 0.6; armRz = -0.6; bodyRx = 0.08;
        break;
      }
      case 'glide': { armLz = 1.45; armRz = -1.45; legLx = 0.25; legRx = 0.15; bodyRx = 0.55; headRx = -0.45; break; }
      case 'swim': {
        bodyRx = 1.15; headRx = -0.95; hipY = -0.25;
        armLx = -1.6 + Math.sin(ph) * 1.4; armRx = -1.6 + Math.sin(ph + Math.PI) * 1.4; armLz = 0.3; armRz = -0.3;
        legLx = Math.sin(ph * 2) * 0.35; legRx = -Math.sin(ph * 2) * 0.35;
        break;
      }
      case 'sit': case 'drive': {
        legLx = -1.45; legRx = -1.45; hipY = -0.02; armLx = this.pose === 'drive' ? -1.0 : -0.3; armRx = this.pose === 'drive' ? -1.0 : -0.3; armLz = 0.2; armRz = -0.2;
        break;
      }
      case 'sleep': { bodyRz = 1.45; hipY = -D.leg * 0.4; armLz = 0.3; armRz = -0.3; headRx = 0.2; break; }
      case 'climb': { armLx = -2.6 + sw * 0.4; armRx = -2.6 - sw * 0.4; legLx = -0.6 + sw * 0.4; legRx = -0.6 - sw * 0.4; break; }
    }
    // Emotes überlagern
    if (this.emote) {
      this.emoteT += dt;
      const e = this.emote, k = this.emoteT, tt = Math.sin(k * 10);
      switch (e) {
        case 'wave': armRx = -2.9; armRz = -0.3 + tt * 0.35; headRy = 0.15; break;
        case 'cheer': armLx = -2.9; armRx = -2.9; armLz = 0.4; armRz = -0.4; hipY += Math.abs(Math.sin(k * 8)) * 0.15; break;
        case 'dance': hipY += Math.abs(Math.sin(k * 8)) * 0.06; torsoRy = Math.sin(k * 4) * 0.5; armLx = -1.4 + Math.sin(k * 8) * 0.8; armRx = -1.4 - Math.sin(k * 8) * 0.8; armLz = 0.7; armRz = -0.7; legLx = Math.sin(k * 8) * 0.3; legRx = -Math.sin(k * 8) * 0.3; headRy = Math.sin(k * 4) * 0.3; break;
        case 'bow': torsoRx = Math.min(0.9, k * 3) * (k < this.emoteDur - 0.4 ? 1 : 0.4); armLx = 0.3; armRx = 0.3; break;
        case 'clap': armLx = -1.3; armRx = -1.3; armLz = 0.25 + Math.abs(tt) * 0.4 - 0.4; armRz = -armLz; break;
        case 'think': armRx = -2.0; armRz = 0.9; headRx = 0.1; headRy = 0.3; break;
        case 'point': armRx = -1.55; armRz = -0.1; break;
        case 'laugh': torsoRx = -0.15 + Math.sin(k * 18) * 0.05; headRx = -0.25; armLx = 0.1; armRx = 0.1; break;
        case 'attack': { const p = clamp(k / 0.35, 0, 1); armRx = -2.6 + p * 3.4; armRz = -0.3; torsoRy = 0.5 - p * 1.0; break; }
        case 'spin': torsoRy = k * 18; armLz = 1.3; armRz = -1.3; break;
        case 'block': armLx = -1.4; armRx = -1.4; armLz = -0.3; armRz = 0.3; torsoRx = 0.15; break;
        case 'cast': armLx = -1.6; armRx = -1.6; armLz = 0.2; armRz = -0.2; hipY += 0.05; break;
        case 'pet': torsoRx = 0.6; armRx = -0.9 + tt * 0.2; break;
        case 'talk': armRx = -0.6 + Math.sin(k * 5) * 0.25; armRz = -0.4; headRx = Math.sin(k * 6) * 0.05; break;
        case 'dig': torsoRx = 0.5 + Math.sin(k * 9) * 0.2; armLx = -0.8 + Math.sin(k * 9) * 0.6; armRx = -0.8 + Math.sin(k * 9) * 0.6; break;
        case 'fish': armLx = -1.0; armRx = -1.2 + (k < 0.4 ? -1.2 * (1 - k / 0.4) : 0); break;
      }
      if (this.emoteT > this.emoteDur && this.emoteDur > 0) this.emote = null;
    }
    // Weich übergehen
    const k = 14;
    this.legL.rotation.x = damp(this.legL.rotation.x, legLx, k, dt);
    this.legR.rotation.x = damp(this.legR.rotation.x, legRx, k, dt);
    this.legL.rotation.z = damp(this.legL.rotation.z, legLz, k, dt);
    this.legR.rotation.z = damp(this.legR.rotation.z, legRz, k, dt);
    this.armL.rotation.x = damp(this.armL.rotation.x, armLx, k, dt);
    this.armR.rotation.x = damp(this.armR.rotation.x, armRx, k, dt);
    this.armL.rotation.z = damp(this.armL.rotation.z, armLz, k, dt);
    this.armR.rotation.z = damp(this.armR.rotation.z, armRz, k, dt);
    this.head.rotation.x = damp(this.head.rotation.x, headRx, 8, dt);
    this.head.rotation.y = damp(this.head.rotation.y, headRy, 8, dt);
    this.torso.rotation.y = this.emote === 'spin' ? torsoRy : damp(this.torso.rotation.y, torsoRy, 10, dt);
    this.torso.rotation.x = damp(this.torso.rotation.x, torsoRx, 10, dt);
    this.lean = damp(this.lean, bodyRx, 6, dt);
    this.body.rotation.x = this.lean;
    this.body.rotation.z = damp(this.body.rotation.z, bodyRz, 5, dt);
    this.hips.position.y = damp(this.hips.position.y, D.leg + 0.02 + hipY, 16, dt);
    // Umhang flattert, Flügel schlagen
    if (this.cape) this.cape.rotation.x = -clamp(s * 0.08, 0, 0.7) - Math.sin(this.t * 6) * 0.04 * clamp(s, 0, 1);
    if (this.wingL && this.wingR) {
      const flap = this.pose === 'glide' ? 0.15 + Math.sin(this.t * 3) * 0.1 : this.pose === 'air' ? Math.sin(this.t * 18) * 0.5 : Math.sin(this.t * 2) * 0.12;
      this.wingL.rotation.y = 0.35 + flap; this.wingR.rotation.y = -0.35 - flap;
    }
    // Blinzeln
    this.blinkT -= dt;
    if (this.lids) {
      if (this.pose === 'sleep') this.lids.visible = true;
      else if (this.blinkT < 0) { this.lids.visible = true; if (this.blinkT < -0.12) { this.lids.visible = false; this.blinkT = 2 + Math.random() * 3.5; } }
    }
  }
  /** Sichtbarkeit/Detail für entfernte Figuren. */
  setDetail(near: boolean): void {
    for (const m of this.meshes) m.castShadow = near && this.shadow;
  }
  dispose(): void {
    for (const m of this.meshes) m.geometry.dispose();
    this.meshes = [];
    this.root.parent?.remove(this.root);
  }
}
