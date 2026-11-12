// Stadt-Eigenheiten: Champion-Orte, Platz-Mittelstücke, Laternen, Deko und
// Wimpelketten je Stadt (Daten: data/towns.js). Alles aus zusammengeführten,
// vertex-gefärbten Teilen (wenige Draw-Calls), Vorderseite zeigt nach +z.
import { THREE } from './three.js';
import { Builder, matrix, roofGeometry, lumpy } from './geometry.js';
import { envMaterial, glowMaterial, waterMaterial } from './materials.js';
import { windowMaterial, pavilion } from './buildings.js';

const C = (c) => new THREE.Color(c);
const shade = (c, f) => C(c).multiplyScalar(f).getHex();

function pack(b, glow, extra = []) {
  const g = new THREE.Group();
  if (!b.empty) { const m = new THREE.Mesh(b.build(), envMaterial({ scale: 0.7, strength: 0.32 })); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  if (glow && !glow.empty) g.add(new THREE.Mesh(glow.build(), windowMaterial));
  for (const e of extra) g.add(e);
  return g;
}
const glowMesh = (geo, color, opacity = 0.85) => new THREE.Mesh(geo, glowMaterial(color, opacity));
const ring = (b, r, y, color, tube = 0.08, rx = Math.PI / 2, seg = 40) => b.add(new THREE.TorusGeometry(r, tube, 5, seg), color, matrix(0, y, 0, rx, 0, 0));
const crystal = (b, x, y, z, s, color, tilt = 0, yaw = 0) => b.add(new THREE.OctahedronGeometry(0.5, 0), color, matrix(x, y, z, tilt, yaw, tilt * 0.6, s * 0.55, s * 1.6, s * 0.55));
function fire(g, x, y, z, s = 1, anim) {
  const f = glowMesh(new THREE.ConeGeometry(0.32 * s, 0.9 * s, 7), 0xff8a2a, 0.9); f.position.set(x, y + 0.4 * s, z); g.add(f);
  const f2 = glowMesh(new THREE.ConeGeometry(0.18 * s, 0.6 * s, 6), 0xffe08a, 0.9); f2.position.set(x, y + 0.32 * s, z); g.add(f2);
  anim.push((t) => { const k = 1 + Math.sin(t * 11 + x * 3) * 0.12 + Math.sin(t * 17 + z) * 0.06; f.scale.set(1, k, 1); f2.scale.set(1, 2 - k, 1); });
}

// ---------------------------------------------------------------------------
// Champion-Orte (Grundfläche ~10×10, Mitte frei; der Champion steht bei z = -1,5)
export function venue(kind, pal, typeColor) {
  if (kind === 'pavilion' || !VENUES[kind]) return pavilion(pal, typeColor);
  const b = new Builder(), glow = new Builder(), extra = [], anim = [];
  const g = new THREE.Group();
  VENUES[kind]({ b, glow, extra, anim, g, pal, tc: typeColor });
  const out = pack(b, glow, extra);
  for (const c of g.children.slice()) out.add(c);
  if (anim.length) out.userData.animate = (t) => anim.forEach(f => f(t));
  return out;
}

const VENUES = {
  // Perlenhafen: Schiffsdeck mit Mast, Segel, Steuerrad und Rettungsringen
  pier({ b, glow, tc }) {
    for (let i = 0; i < 14; i++) b.box(11, 0.16, 0.7, i % 2 ? 0x8a6c4e : 0x9c7a56, 0, 0.42, -4.9 + i * 0.75);
    b.box(11.2, 0.4, 10.6, 0x5a4636, 0, 0.15, 0);
    for (const sx of [-1, 1]) {
      for (let k = 0; k < 5; k++) b.cyl(0.12, 0.14, 1.4, 0x6a4e36, sx * 5.4, 1, -4.6 + k * 2.3, 6);
      b.add(new THREE.CylinderGeometry(0.05, 0.05, 9.4, 5), 0xe8dcc0, matrix(sx * 5.4, 1.55, 0, Math.PI / 2, 0, 0));
      b.add(new THREE.TorusGeometry(0.42, 0.12, 6, 14), 0xff6a4a, matrix(sx * 5.5, 1.1, -1, 0, Math.PI / 2, 0));
    }
    for (let k = 0; k < 6; k++) b.cyl(0.12, 0.14, 1.4, 0x6a4e36, -5.4 + k * 2.16, 1, -5.3, 6);
    b.add(new THREE.CylinderGeometry(0.05, 0.05, 10.8, 5), 0xe8dcc0, matrix(0, 1.55, -5.3, 0, 0, Math.PI / 2));
    // Mast mit Rahe, Segel und Wimpel
    b.cyl(0.22, 0.3, 10, 0x7a5a3c, 0, 5.4, -4.4, 10);
    b.cyl(0.1, 0.1, 6, 0x6a4e36, 0, 8.4, -4.4, 6).add(new THREE.CylinderGeometry(0.1, 0.1, 6, 6), 0x6a4e36, matrix(0, 8.4, -4.4, 0, 0, Math.PI / 2));
    for (let i = 0; i < 5; i++) b.add(new THREE.BoxGeometry(5.6 - i * 0.3, 0.9, 0.06), i % 2 ? 0xffffff : tc, matrix(0, 8 - i * 0.9, -4.1 + Math.sin(i / 4 * Math.PI) * 0.5, 0.08, 0, 0));
    b.add(new THREE.ConeGeometry(0.4, 1.6, 3), 0xff8f7a, matrix(0.8, 10.2, -4.4, 0, 0, -Math.PI / 2, 1, 1, 0.15));
    // Steuerrad
    b.box(0.5, 1.2, 0.5, 0x6a4e36, -3, 1.1, -3.4);
    b.add(new THREE.TorusGeometry(0.6, 0.07, 6, 16), 0x9a6a44, matrix(-3, 1.9, -3.1));
    for (let k = 0; k < 8; k++) b.add(new THREE.BoxGeometry(0.06, 1.5, 0.06), 0x9a6a44, matrix(-3, 1.9, -3.1, 0, 0, k * Math.PI / 4));
    for (const [x, z] of [[4.2, -4], [3.4, -4.3]]) b.cyl(0.4, 0.4, 0.9, 0x7a5232, x, 0.95, z, 10);
    for (const sx of [-1, 1]) { b.cyl(0.06, 0.06, 2.2, 0x2f3a44, sx * 5.4, 2.2, 4.6, 6); glow.box(0.3, 0.36, 0.3, 0xffe0a0, sx * 5.4, 3.3, 4.6); }
  },
  // Voltheim: Stahlring mit vier Tesla-Spulen und knisternden Kugeln
  tesla({ b, extra, anim }) {
    b.cyl(5.6, 5.9, 0.7, 0x4a4f5a, 0, 0.05, 0, 24);
    b.cyl(4.9, 4.9, 0.08, 0x2c3038, 0, 0.44, 0, 24);
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; b.box(0.9, 0.06, 0.3, k % 2 ? 0xffe14d : 0x22252c, Math.sin(a) * 5.3, 0.42, Math.cos(a) * 5.3, a); }
    b.add(new THREE.CircleGeometry(1.4, 3), 0xffe14d, matrix(0, 0.49, 0, -Math.PI / 2, 0, 0.3));
    const orbs = [];
    for (const [x, z] of [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]]) {
      b.cyl(0.7, 0.9, 0.6, 0x3a3e46, x, 0.6, z, 10);
      b.cyl(0.25, 0.32, 4.6, 0xb86a3a, x, 3.1, z, 10);
      for (let i = 0; i < 7; i++) b.add(new THREE.TorusGeometry(0.42 - i * 0.02, 0.08, 5, 14), 0xd8894a, matrix(x, 1.4 + i * 0.5, z, Math.PI / 2, 0, 0));
      b.add(new THREE.TorusGeometry(0.85, 0.24, 8, 18), 0xc8ccd4, matrix(x, 5.5, z, Math.PI / 2, 0, 0));
      const o = glowMesh(new THREE.SphereGeometry(0.5, 12, 8), 0xbfe6ff, 0.9); o.position.set(x, 5.9, z); extra.push(o); orbs.push(o);
    }
    const arcs = [];
    for (const [ax, az, bx, bz] of [[-4.2, -4.2, 4.2, -4.2], [-4.2, -4.2, -4.2, 4.2], [4.2, -4.2, 4.2, 4.2]]) {
      const len = Math.hypot(bx - ax, bz - az), m = glowMesh(new THREE.BoxGeometry(0.08, 0.08, len), 0xd8f0ff, 0.7);
      m.position.set((ax + bx) / 2, 5.9, (az + bz) / 2); m.rotation.y = Math.atan2(bx - ax, bz - az); extra.push(m); arcs.push(m);
    }
    anim.push((t) => { orbs.forEach((o, i) => o.scale.setScalar(1 + Math.sin(t * 9 + i * 2) * 0.15)); arcs.forEach((a, i) => { a.visible = Math.sin(t * 5 + i * 2.1) > 0.2; a.position.y = 5.9 + Math.sin(t * 23 + i) * 0.2; }); });
  },
  // Blütenruh: Steinplateau, zwei Torii, Schreinaltar, Steinlaternen, Kirschbäume
  torii({ b, glow }) {
    b.box(10.4, 0.5, 10.4, 0xcfc6b4, 0, 0.1, 0);
    for (let i = 0; i < 5; i++) b.box(10, 0.04, 1.9, i % 2 ? 0xe2d8c6 : 0xd6ccb8, 0, 0.36, -4 + i * 2);
    for (const z of [4.6, 2.2]) {
      for (const sx of [-1, 1]) { b.cyl(0.26, 0.3, 4.2, 0xc8382c, sx * 2.8, 2.4, z, 10); b.cyl(0.36, 0.36, 0.4, 0x2a2222, sx * 2.8, 0.55, z, 10); }
      b.add(new THREE.BoxGeometry(7.6, 0.35, 0.5), 0x2a2222, matrix(0, 4.65, z, 0, 0, 0)); b.add(new THREE.BoxGeometry(7.2, 0.3, 0.42), 0xc8382c, matrix(0, 4.35, z));
      b.box(6.2, 0.22, 0.32, 0xc8382c, 0, 3.7, z); b.box(0.3, 0.6, 0.12, 0x2a2222, 0, 4.05, z + 0.16);
    }
    // Schreinaltar
    b.box(3.4, 0.5, 1.8, 0x8a7a68, 0, 0.6, -4.3); b.box(2.6, 1.6, 1.4, 0x6a3a2a, 0, 1.6, -4.3);
    b.add(roofGeometry(2.4, 3.6, 0.9, 0.35), 0x3a3a46, matrix(0, 2.4, -4.3, 0, Math.PI / 2, 0));
    b.box(0.8, 0.8, 0.1, 0xd8b04a, 0, 1.7, -3.55);
    for (const sx of [-1, 1]) {
      // Steinlaterne (Tōrō)
      b.cyl(0.35, 0.45, 0.3, 0x9a948a, sx * 4.2, 0.5, -2.6, 6); b.cyl(0.12, 0.14, 0.9, 0x9a948a, sx * 4.2, 1.1, -2.6, 6);
      b.box(0.7, 0.55, 0.7, 0xa8a296, sx * 4.2, 1.8, -2.6); glow.box(0.5, 0.36, 0.72, 0xffd890, sx * 4.2, 1.8, -2.6);
      b.add(new THREE.ConeGeometry(0.7, 0.45, 4), 0x8a847a, matrix(sx * 4.2, 2.3, -2.6, 0, Math.PI / 4, 0));
      // Kirschbaum
      b.cyl(0.22, 0.34, 3, 0x5a3a2c, sx * 4.4, 1.8, -4.6, 7);
      for (let i = 0; i < 4; i++) b.sphere(1 + (i % 2) * 0.3, [0xf7b3cc, 0xf5a0bd, 0xfccde0][i % 3], sx * 4.4 + Math.cos(i * 1.6) * 0.9, 3.6 + (i % 2) * 0.5, -4.6 + Math.sin(i * 1.6) * 0.8, 1, 0.8, 1, 8);
    }
  },
  // Waldsaum: Holzscheibe aus Baumringen, Halbkreis geschnitzter Totems, Feuerstelle
  totems({ b, g, anim, tc }) {
    b.cyl(5.4, 5.6, 0.5, 0x7a5a3c, 0, 0.1, 0, 28);
    for (let k = 1; k <= 4; k++) b.add(new THREE.TorusGeometry(k * 1.15, 0.05, 4, 36), 0x5e4430, matrix(0, 0.36, 0, Math.PI / 2, 0, 0));
    const faces = [0xd8664e, 0x4f9a5a, 0xf5cd77, 0x3d8bc1, tc];
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i - 2) * 0.62, x = Math.sin(a) * 4.6, z = Math.cos(a) * 4.6, h = 4 + (i === 2 ? 1.6 : (i % 2) * 0.6);
      b.cyl(0.42, 0.5, h, 0x8a6040, x, h / 2 + 0.3, z, 8);
      for (let s = 0; s < 3; s++) { const y = 1.2 + s * (h - 1) / 3; b.box(0.9, 0.7, 0.2, faces[(i + s) % 5], x - Math.sin(a) * 0.4, y, z - Math.cos(a) * 0.4, a); b.box(0.5, 0.12, 0.24, 0x2a2018, x - Math.sin(a) * 0.45, y + 0.12, z - Math.cos(a) * 0.45, a); }
      b.add(new THREE.BoxGeometry(2.2, 0.3, 0.5), faces[i % 5], matrix(x, h - 0.2, z, 0, a, 0));
      b.add(new THREE.ConeGeometry(0.35, 0.6, 4), 0xf5cd77, matrix(x, h + 0.55, z, 0, a, 0));
    }
    // Feuerstelle vorne rechts
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.sphere(0.3, 0x8d8f7a, 3.6 + Math.cos(a) * 0.8, 0.45, 3.2 + Math.sin(a) * 0.8, 1, 0.7, 1, 6); }
    for (let k = 0; k < 3; k++) b.add(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 5), 0x5a3a24, matrix(3.6, 0.5, 3.2, Math.PI / 2, k * 1.05, 0));
    fire(g, 3.6, 0.45, 3.2, 1.1, anim);
  },
  // Windwacht: Kreis aus Menhiren auf der Klippe, Windsäcke, flacher Opferstein
  menhirs({ b, anim, extra }) {
    b.cyl(5.8, 6.2, 0.4, 0x8d9086, 0, 0.05, 0, 20);
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * Math.PI * 2 + Math.PI / 10; if (Math.cos(a) > 0.75) continue;
      const x = Math.sin(a) * 5.1, z = Math.cos(a) * 5.1, h = 3.4 + ((k * 7) % 3) * 0.8;
      b.add(lumpy(new THREE.BoxGeometry(1.1, h, 0.8, 2, 3, 2), 0.12, k + 3), 0x8a8f96, matrix(x, h / 2 + 0.2, z, 0.04 * Math.sin(k), a, 0.05 * Math.cos(k)));
      b.add(new THREE.BoxGeometry(0.5, 0.5, 0.06), 0x9fd7ff, matrix(x - Math.sin(a) * 0.42, h * 0.6, z - Math.cos(a) * 0.42, 0, a, Math.PI / 4));
    }
    b.add(lumpy(new THREE.BoxGeometry(2.4, 0.6, 1.4, 2, 1, 2), 0.08, 9), 0x9a9c94, matrix(0, 0.5, -3.4));
    const socks = [];
    for (const sx of [-1, 1]) {
      b.cyl(0.08, 0.1, 6, 0x3d4a5c, sx * 4.6, 3.2, 3.6, 6);
      const s = new THREE.Group(); s.position.set(sx * 4.6, 6, 3.6);
      for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.32 - i * 0.05, 0.27 - i * 0.05, 0.6, 10, 1, true), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xffffff : 0xff6a3a, side: THREE.DoubleSide })); m.rotation.z = Math.PI / 2; m.position.x = 0.35 + i * 0.6; s.add(m); }
      extra.push(s); socks.push(s);
    }
    anim.push((t) => socks.forEach((s, i) => { s.rotation.y = Math.sin(t * 0.7 + i) * 0.6 + 0.4; s.rotation.z = -0.08 + Math.sin(t * 3 + i) * 0.06; }));
  },
  // Essenfeld: Obsidian-Achteck mit Lavarinne, Feuerschalen und Riesenamboss
  forge({ b, extra, g, anim }) {
    b.cyl(5.6, 6, 0.7, 0x2e2626, 0, 0.05, 0, 8);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.box(3.8, 0.1, 0.4, 0x4a3a36, Math.sin(a) * 2.3, 0.42, Math.cos(a) * 2.3, a); }
    const lava = glowMesh(new THREE.TorusGeometry(4.5, 0.22, 4, 8), 0xff6a2a, 0.9); lava.rotation.x = Math.PI / 2; lava.rotation.z = Math.PI / 8; lava.position.y = 0.44; extra.push(lava);
    anim.push((t) => { lava.material.opacity = 0.75 + Math.sin(t * 2) * 0.15; });
    for (const [x, z] of [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]]) {
      b.cyl(0.35, 0.55, 2, 0x3a2e2a, x, 1.2, z, 6);
      b.cyl(0.9, 0.4, 0.6, 0x5a4a44, x, 2.4, z, 8);
      fire(g, x, 2.5, z, 1.3, anim);
    }
    // Amboss mit Hammer
    b.box(1.4, 0.9, 1, 0x3a3434, 0, 0.9, -4.1); b.box(0.6, 0.7, 0.5, 0x2a2626, 0, 1.6, -4.1);
    b.box(2.4, 0.5, 0.9, 0x4a4446, 0, 2.15, -4.1); b.add(new THREE.ConeGeometry(0.45, 1.2, 4), 0x4a4446, matrix(1.7, 2.15, -4.1, 0, Math.PI / 4, -Math.PI / 2, 1, 1, 0.9));
    b.box(0.16, 1.4, 0.16, 0x6a4a32, -0.6, 2.9, -4.1, 0); b.box(0.7, 0.4, 0.4, 0x2a2626, -0.6, 3.6, -4.1);
  },
  // Lichtenau: Sternenmosaik und kreisendes Planetarium über dem Champion
  orrery({ b, glow, extra, anim }) {
    b.cyl(5.6, 5.9, 0.6, 0xe6e2f0, 0, 0.05, 0, 28);
    b.cyl(5.2, 5.2, 0.06, 0x47407a, 0, 0.38, 0, 28);
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; b.add(new THREE.BoxGeometry(0.5, 0.04, 4.4), 0xd7b25a, matrix(0, 0.42, 0, 0, a, 0)); }
    for (const [x, z] of [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]]) { b.cyl(0.3, 0.4, 3.4, 0xf1eef8, x, 2, z, 12); b.cyl(0.45, 0.45, 0.2, 0xd7b25a, x, 3.75, z, 12); glow.sphere(0.36, 0xfff0a0, x, 4.15, z, 1, 1, 1, 10); }
    const sys = new THREE.Group(); sys.position.set(0, 6.4, -1.5); extra.push(sys);
    const rb = new Builder();
    ring(rb, 3.2, 0, 0xd7b25a, 0.07); ring(rb, 2.4, 0, 0xd7b25a, 0.06, 0.4); ring(rb, 1.6, 0, 0xc8c2d8, 0.05, -0.5);
    const rings = new THREE.Mesh(rb.build(), envMaterial()); sys.add(rings);
    const sun = glowMesh(new THREE.SphereGeometry(0.6, 16, 10), 0xffe9a8, 0.95); sys.add(sun);
    const planets = [[3.2, 0x9ef0ff, 0.3], [2.4, 0xff9ec2, 0.24], [1.6, 0xfff0a0, 0.2]].map(([r, c, s]) => { const p = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 8), new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.5 })); sys.add(p); return [p, r]; });
    anim.push((t) => { rings.rotation.y = t * 0.15; planets.forEach(([p, r], i) => { const a = t * (0.5 + i * 0.3) + i * 2; p.position.set(Math.cos(a) * r, Math.sin(a * 0.7) * 0.4 * (i - 1), Math.sin(a) * r); }); sun.scale.setScalar(1 + Math.sin(t * 2) * 0.05); });
  },
  // Nebelsteg: Plattform auf Stelzen, Laternenbogen, Schilf und Nebelschwaden
  stiltdeck({ b, glow }) {
    for (let i = 0; i < 13; i++) b.box(10.6, 0.14, 0.76, i % 2 ? 0x6e5a44 : 0x7a6650, 0, 0.45, -4.8 + i * 0.8);
    for (const sx of [-1, 0, 1]) for (const sz of [-1, 0, 1]) b.cyl(0.18, 0.2, 1.6, 0x4a3a2c, sx * 5, -0.3, sz * 4.8, 6);
    // Laternenbogen vorn und zwei Laternenstangen hinten
    for (const sx of [-1, 1]) b.cyl(0.14, 0.16, 4.2, 0x3a3228, sx * 3, 2.5, 4.6, 6);
    b.add(new THREE.TorusGeometry(3, 0.12, 5, 20, Math.PI), 0x3a3228, matrix(0, 4.6, 4.6));
    for (let k = 0; k < 5; k++) { const a = (k + 0.5) / 5 * Math.PI, x = Math.cos(a) * 3, y = 4.6 + Math.sin(a) * 3; b.box(0.04, 0.4, 0.04, 0x2a2420, x, y - 0.25, 4.6); glow.sphere(0.24, 0x9be0c8, x, y - 0.6, 4.6, 1, 1.2, 1, 8); }
    for (const [x, z] of [[-4.2, -4.2], [4.2, -4.2]]) {
      b.cyl(0.12, 0.14, 4.6, 0x3a3228, x, 2.7, z, 6); b.box(1, 0.1, 0.1, 0x3a3228, x + Math.sign(-x) * 0.45, 4.9, z);
      b.box(0.5, 0.6, 0.5, 0x2a2420, x + Math.sign(-x) * 0.9, 4.4, z); glow.box(0.36, 0.44, 0.52, 0x9be0c8, x + Math.sign(-x) * 0.9, 4.4, z);
    }
    b.box(3.4, 1.2, 1.2, 0x5a4a38, 0, 1, -4.4); b.add(roofGeometry(1.8, 3.8, 1, 0.3), 0x4e5a52, matrix(0, 2.6, -4.4, 0, Math.PI / 2, 0)); for (const sx of [-1, 1]) b.cyl(0.08, 0.08, 1.2, 0x3a3228, sx * 1.5, 2, -4.4, 5);
    for (let k = 0; k < 18; k++) { const a = k * 2.4, r = 5.6 + (k % 3) * 0.3; b.add(new THREE.ConeGeometry(0.12, 1.6 + (k % 4) * 0.3, 4), 0x6a8a5a, matrix(Math.sin(a) * r, 0.7, Math.cos(a) * r, 0.1 * Math.sin(k), 0, 0.1 * Math.cos(k))); if (k % 3 === 0) b.add(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 5), 0x6a4a30, matrix(Math.sin(a) * r, 1.6, Math.cos(a) * r)); }
  },
  // Reifenstein: Eisplateau mit Kristallzacken im Halbkreis und hohem Eisthron
  icethrone({ b, extra, anim }) {
    b.cyl(5.6, 6, 0.6, 0x6f9ab8, 0, 0.05, 0, 10);
    b.cyl(5, 5, 0.06, 0x9cc8e2, 0, 0.36, 0, 10);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; b.add(new THREE.BoxGeometry(0.12, 0.03, 4.8), 0xd8eef8, matrix(0, 0.4, 0, 0, a, 0)); }
    b.add(new THREE.TorusGeometry(2.4, 0.08, 4, 10), 0xd8eef8, matrix(0, 0.4, 0, Math.PI / 2, 0, 0));
    const ib = new Builder();
    for (let k = 0; k < 11; k++) {
      const a = Math.PI / 2 + k / 10 * Math.PI, r = 5 + (k % 2) * 0.4, s = 1.3 + ((k * 5) % 4) * 0.35;
      crystal(ib, Math.sin(a) * r, s * 0.7, Math.cos(a) * r, s, k % 2 ? 0xbfe9ff : 0xe6f8ff, (k % 3 - 1) * 0.15, a);
    }
    // Thron
    ib.box(2.6, 0.8, 1.6, 0xd8eef8, 0, 0.7, -4); ib.box(2.6, 3.6, 0.5, 0xbfe9ff, 0, 2.3, -4.6);
    for (const sx of [-1, 1]) { ib.box(0.4, 1.3, 1.4, 0xd8eef8, sx * 1.2, 1.3, -4); crystal(ib, sx * 1.1, 4.6, -4.6, 1.2, 0xe6f8ff, sx * 0.25); }
    crystal(ib, 0, 5, -4.6, 1.6, 0xffffff);
    const ice = new THREE.Mesh(ib.build(), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 140, specular: 0xffffff, transparent: true, opacity: 0.88, emissive: 0x3a6a8a, emissiveIntensity: 0.25 }));
    ice.castShadow = true; extra.push(ice);
    const shine = glowMesh(new THREE.SphereGeometry(0.5, 12, 8), 0xbfe9ff, 0.6); shine.position.set(0, 5, -4.4); extra.push(shine);
    anim.push((t) => shine.scale.setScalar(1 + Math.sin(t * 1.7) * 0.25));
  },
  // Kronendorf: Plattform um einen mächtigen Stamm mit Laubdach und Seilgeländer
  treetop({ b, glow }) {
    b.cyl(5.6, 5.6, 0.3, 0x9a7048, 0, 0.35, 0, 24);
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; b.box(0.08, 0.32, 5.4, 0x7a5a3c, Math.sin(a) * 2.8, 0.36, Math.cos(a) * 2.8, a); }
    b.cyl(1.5, 2.2, 13, 0x6a4a32, 0, 6.5, -5.4, 12);
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; b.add(new THREE.CylinderGeometry(0.3, 0.6, 3.2, 6), 0x5e4230, matrix(Math.sin(a) * 2, 0.6, -5.4 + Math.cos(a) * 2, Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9)); }
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; b.sphere(2.6 + (i % 3) * 0.6, [0x5aa154, 0x4e8f48, 0x6fb35a][i % 3], Math.sin(a) * 4, 12 + (i % 2) * 1.4, -5.4 + Math.cos(a) * 3.4, 1, 0.7, 1, 9); }
    b.sphere(3.6, 0x5aa154, 0, 14.2, -5.4, 1, 0.75, 1, 10);
    for (let k = 0; k < 10; k++) { const a = Math.PI * 0.2 + k / 9 * Math.PI * 1.6; b.cyl(0.1, 0.12, 1.4, 0x6a4a32, Math.sin(a) * 5.3, 1.1, Math.cos(a) * 5.3, 6); }
    for (let k = 0; k < 9; k++) { const a0 = Math.PI * 0.2 + k / 9 * Math.PI * 1.6, a1 = Math.PI * 0.2 + (k + 1) / 9 * Math.PI * 1.6; const x0 = Math.sin(a0) * 5.3, z0 = Math.cos(a0) * 5.3, x1 = Math.sin(a1) * 5.3, z1 = Math.cos(a1) * 5.3; b.add(new THREE.CylinderGeometry(0.04, 0.04, Math.hypot(x1 - x0, z1 - z0), 4), 0xd8c49a, matrix((x0 + x1) / 2, 1.6, (z0 + z1) / 2, Math.PI / 2, Math.atan2(x1 - x0, z1 - z0), 0)); }
    for (let k = 0; k < 6; k++) { const a = Math.PI * 0.6 + k / 5 * Math.PI * 0.8, x = Math.sin(a) * 3.2, z = -5.4 + Math.cos(a) * 3.2; b.box(0.03, 3, 0.03, 0x6a5a40, x, 8.2, z); glow.sphere(0.22, 0xffe08a, x, 6.6, z, 1, 1.2, 1, 8); }
  },
  // Grollhagen: Sandstein-Rund mit Bögen, Fackeln und Bannern
  colosseum({ b, g, anim, tc }) {
    b.cyl(5.6, 5.8, 0.4, 0xd8bc8a, 0, 0.0, 0, 28);
    b.cyl(5.2, 5.2, 0.05, 0xe8d2a8, 0, 0.22, 0, 28);
    const segs = 14;
    for (let k = 0; k < segs; k++) {
      const a = (k + 0.5) / segs * Math.PI * 2; if (Math.cos(a) > 0.8) continue;
      const x = Math.sin(a) * 6, z = Math.cos(a) * 6, wdt = 2 * Math.PI * 6 / segs + 0.05;
      b.box(wdt, 0.9, 0.9, 0xc49a62, x, 0.45, z, a);
      if (k % 2) { b.box(wdt, 2.8, 0.9, 0xd2b07a, x, 2.3, z, a); b.box(wdt + 0.1, 0.3, 1.1, 0xb8885a, x, 3.85, z, a); }
      else { for (const s of [-1, 1]) b.box(0.4, 2.8, 0.9, 0xd2b07a, x + Math.cos(a) * s * (wdt / 2 - 0.2), 2.3, z - Math.sin(a) * s * (wdt / 2 - 0.2), a); b.add(new THREE.TorusGeometry(wdt / 2 - 0.4, 0.22, 4, 10, Math.PI), 0xd2b07a, matrix(x, 2.6, z, 0, a, 0)); b.box(wdt + 0.1, 0.5, 1.1, 0xb8885a, x, 3.8, z, a); }
      if (k % 3 === 0) b.box(0.9, 1.8, 0.06, tc, x - Math.sin(a) * 0.5, 2.4, z - Math.cos(a) * 0.5, a);
    }
    for (const [x, z] of [[-4.2, 4.2], [4.2, 4.2], [-3, -4.8], [3, -4.8]]) { b.cyl(0.12, 0.16, 2.4, 0x4a3524, x, 1.4, z, 6); b.cyl(0.3, 0.16, 0.35, 0x4a3524, x, 2.7, z, 7); fire(g, x, 2.75, z, 0.9, anim); }
  },
  // Glimmerstadt: Felsdais im Kranz leuchtender Riesenkristalle
  crystalcrown({ b, extra, anim }) {
    b.add(lumpy(new THREE.CylinderGeometry(5.6, 6.2, 0.8, 12, 1), 0.1, 4), 0x6d6a80, matrix(0, 0.05, 0));
    b.cyl(4.8, 4.8, 0.06, 0x8a88a0, 0, 0.46, 0, 12);
    const cb = new Builder();
    for (let k = 0; k < 9; k++) { const a = Math.PI / 2 + 0.15 + k / 8 * (Math.PI - 0.3), r = 5.1, s = 1.6 + ((k * 3) % 4) * 0.45; crystal(cb, Math.sin(a) * r, s * 0.75, Math.cos(a) * r, s, [0x9ef0ff, 0xc89aff, 0x7fd8ff][k % 3], (k % 3 - 1) * 0.2, a); }
    crystal(cb, 0, 3.4, -4.8, 3.6, 0xb8f4ff); crystal(cb, -1.5, 2.2, -4.4, 2.2, 0xc89aff, -0.35); crystal(cb, 1.5, 2.2, -4.4, 2.2, 0x9ef0ff, 0.35);
    const cm = new THREE.Mesh(cb.build(), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 120, specular: 0xffffff, emissive: 0x4a3a8a, emissiveIntensity: 0.45, transparent: true, opacity: 0.92 }));
    cm.castShadow = true; extra.push(cm);
    const aura = glowMesh(new THREE.SphereGeometry(1.4, 14, 10), 0x9ef0ff, 0.25); aura.position.set(0, 4, -4.6); extra.push(aura);
    anim.push((t) => { cm.material.emissiveIntensity = 0.35 + Math.sin(t * 1.3) * 0.15; aura.scale.setScalar(1 + Math.sin(t * 1.3) * 0.2); });
  },
  // Silberbucht: offener Mondtempel mit Säulenhalbkreis und leuchtender Sichel
  moontemple({ b, extra, anim }) {
    b.cyl(5.6, 5.9, 0.6, 0xe6e8f0, 0, 0.05, 0, 28);
    b.cyl(4.6, 4.6, 0.05, 0x2f5c9a, 0, 0.37, 0, 28);
    b.add(new THREE.RingGeometry(2.2, 2.7, 28), 0xc9cfe0, matrix(0, 0.4, 0, -Math.PI / 2, 0, 0));
    for (let k = 0; k < 7; k++) { const a = Math.PI / 2 + k / 6 * Math.PI, x = Math.sin(a) * 5, z = Math.cos(a) * 5; b.cyl(0.3, 0.36, 4.4, 0xf4f6fb, x, 2.6, z, 12); b.box(0.8, 0.25, 0.8, 0xc9cfe0, x, 4.9, z); }
    b.add(new THREE.TorusGeometry(5, 0.28, 6, 28, Math.PI), 0xe0e6ff, matrix(0, 5.1, 0, Math.PI / 2, 0, Math.PI));
    const moon = new THREE.Group(); moon.position.set(0, 7.6, -4.8); extra.push(moon);
    const s = new THREE.Shape(); s.absarc(0, 0, 1.6, Math.PI * 0.25, Math.PI * 1.75, false); s.absarc(0.7, 0, 1.25, Math.PI * 1.62, Math.PI * 0.38, true);
    const cres = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false }), new THREE.MeshLambertMaterial({ color: 0xf6f2d8, emissive: 0xe8e0a8, emissiveIntensity: 0.7 }));
    cres.rotation.z = 0.5; moon.add(cres);
    const halo = glowMesh(new THREE.CircleGeometry(2.6, 24), 0xc8d4ff, 0.25); halo.position.z = -0.1; moon.add(halo);
    b.box(0.5, 2.6, 0.5, 0xc9cfe0, 0, 6.2 - 2.6 / 2 - 0.1, -4.8);
    anim.push((t) => { moon.position.y = 7.6 + Math.sin(t * 0.8) * 0.2; halo.material.opacity = 0.2 + Math.sin(t * 1.4) * 0.08; });
  },
  // Sonnfeste: gestufte Sandsteinterrasse, Obelisk-Tor mit Sonnenscheibe, Banner
  ziggurat({ b, extra, anim, tc }) {
    b.box(11, 0.25, 11, 0xc89a6a, 0, 0.05, 0); b.box(9, 0.25, 9, 0xd8aa76, 0, 0.3, -0.3);
    for (let k = 0; k < 4; k++) b.box(2.4, 0.12, 0.5, 0xe0b886, 0, 0.12 + k * 0.08, 5 - k * 0.45);
    for (let i = -3; i <= 3; i++) b.box(0.9, 0.04, 0.9, i % 2 ? 0xb46a42 : 0xf4dcb0, i * 1.1, 0.44, -0.6);
    for (const sx of [-1, 1]) {
      b.box(1.1, 0.6, 1.1, 0xb46a42, sx * 2.6, 0.7, -4.4); b.add(new THREE.CylinderGeometry(0.3, 0.55, 6, 4), 0xe0b886, matrix(sx * 2.6, 4, -4.4, 0, Math.PI / 4, 0)); b.add(new THREE.ConeGeometry(0.42, 0.8, 4), 0xffb83a, matrix(sx * 2.6, 7.4, -4.4, 0, Math.PI / 4, 0));
      for (const z of [4.2, -1]) { b.cyl(0.08, 0.1, 4.4, 0x7a3a1e, sx * 4.4, 2.5, z, 6); b.box(0.06, 2, 1, sx > 0 ? tc : 0xd85a2a, sx * 4.4, 3.5, z + 0.55); }
    }
    b.box(5.8, 0.5, 0.6, 0xb46a42, 0, 6.6, -4.4);
    const sun = new THREE.Group(); sun.position.set(0, 5, -4.3); extra.push(sun);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.25, 28), new THREE.MeshLambertMaterial({ color: 0xffc84a, emissive: 0xff9a2a, emissiveIntensity: 0.6 })); disc.rotation.x = Math.PI / 2; sun.add(disc);
    const rays = new Builder(); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; rays.add(new THREE.ConeGeometry(0.22, 0.9, 4), 0xffb83a, matrix(Math.cos(a) * 1.9, Math.sin(a) * 1.9, 0, 0, 0, a - Math.PI / 2)); }
    const rm = new THREE.Mesh(rays.build(), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0xff8a2a, emissiveIntensity: 0.4 })); sun.add(rm);
    anim.push((t) => { rm.rotation.z = t * 0.3; });
  },
  // Wolkenhort: Marmorscheibe auf Wolken, geflügelte Wächter und schwebender Heiligenschein
  cloudaltar({ b, extra, anim }) {
    b.cyl(5.4, 5.6, 0.6, 0xffffff, 0, 0.05, 0, 28);
    b.cyl(4.8, 4.8, 0.05, 0xf2e6f0, 0, 0.37, 0, 28);
    b.add(new THREE.RingGeometry(3.6, 3.9, 28), 0xd8b04a, matrix(0, 0.41, 0, -Math.PI / 2, 0, 0));
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; if (Math.cos(a) > 0.85) continue; b.sphere(0.8 + (k % 3) * 0.25, 0xfaf6ff, Math.sin(a) * 5.7, 0.3, Math.cos(a) * 5.7, 1.3, 0.6, 1.1, 8); }
    for (const sx of [-1, 1]) {
      const x = sx * 3.6, z = -4.2;
      b.box(1.2, 1.2, 1.2, 0xe6e2f0, x, 0.9, z); b.box(1.4, 0.2, 1.4, 0xd8b04a, x, 1.6, z);
      b.add(new THREE.CylinderGeometry(0.35, 0.45, 2, 10), 0xffffff, matrix(x, 2.7, z));
      b.sphere(0.35, 0xffffff, x, 3.95, z, 1, 1, 1, 10);
      for (let f = 0; f < 5; f++) b.add(new THREE.BoxGeometry(0.22, 2.4 - f * 0.3, 0.08), f % 2 ? 0xffffff : 0xf2eaf8, matrix(x - sx * (0.4 + f * 0.35), 3.4 - f * 0.12, z - 0.2, 0, 0, sx * (0.5 + f * 0.18)));
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.14, 8, 40), new THREE.MeshLambertMaterial({ color: 0xffd27a, emissive: 0xffb83a, emissiveIntensity: 0.8 }));
    halo.position.set(0, 6.4, -1.5); halo.rotation.x = Math.PI / 2; extra.push(halo);
    const shine = glowMesh(new THREE.CylinderGeometry(2.1, 2.1, 5.6, 24, 1, true), 0xfff0c0, 0.12); shine.position.set(0, 3.5, -1.5); extra.push(shine);
    anim.push((t) => { halo.position.y = 6.4 + Math.sin(t) * 0.25; halo.rotation.z = t * 0.4; });
  }
};

// ---------------------------------------------------------------------------
// Platz-Mittelstück (passt in Radius 3,4 wie der alte Brunnen)
export function centrepiece(kind, pal, fountain) {
  const b = new Builder(), glow = new Builder(), extra = [], anim = [], g = new THREE.Group();
  const basin = (r, color = 0xc9c2b4, water = pal.water) => {
    b.cyl(r, r + 0.2, 0.7, color, 0, 0.35, 0, 24); b.cyl(r - 0.3, r - 0.3, 0.1, 0x6a94a8, 0, 0.62, 0, 24);
    const w = new THREE.Mesh(new THREE.CircleGeometry(r - 0.35, 24), waterMaterial(water, { opacity: 0.85 })); w.rotation.x = -Math.PI / 2; w.position.y = 0.66; extra.push(w);
  };
  const plinth = (r, h, color) => { b.cyl(r, r + 0.25, h, color, 0, h / 2, 0, 12); b.cyl(r + 0.4, r + 0.5, 0.25, shade(color, 0.85), 0, 0.12, 0, 12); };
  switch (kind) {
    case 'anchor': {
      basin(3.2, 0xe6dcc6);
      b.cyl(0.6, 0.8, 1.2, 0xd8d0c0, 0, 1.2, 0, 10);
      b.box(0.36, 3.6, 0.36, 0x3a4450, 0, 3.4, 0); b.add(new THREE.TorusGeometry(0.45, 0.12, 6, 14), 0x3a4450, matrix(0, 5.4, 0));
      b.box(2.2, 0.3, 0.3, 0x3a4450, 0, 4.6, 0);
      b.add(new THREE.TorusGeometry(1.3, 0.18, 6, 20, Math.PI), 0x3a4450, matrix(0, 2.4, 0, 0, 0, Math.PI));
      for (const sx of [-1, 1]) b.add(new THREE.ConeGeometry(0.3, 0.7, 4), 0x3a4450, matrix(sx * 1.3, 2.6, 0, 0, 0, sx * 0.5));
      b.add(new THREE.TorusGeometry(0.9, 0.16, 6, 20), 0xe8dcc0, matrix(0, 3.2, 0.25));
      break;
    }
    case 'coil': {
      plinth(1.6, 1, 0xb8b0a0);
      b.cyl(0.3, 0.45, 4.2, 0xb86a3a, 0, 3.1, 0, 10);
      for (let i = 0; i < 6; i++) b.add(new THREE.TorusGeometry(0.55, 0.1, 5, 14), 0xd8894a, matrix(0, 1.6 + i * 0.55, 0, Math.PI / 2, 0, 0));
      b.add(new THREE.TorusGeometry(0.9, 0.28, 8, 18), 0xc8ccd4, matrix(0, 5.2, 0, Math.PI / 2, 0, 0));
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4; b.box(0.3, 1.4, 0.3, 0x4b5b8f, Math.cos(a) * 2.2, 0.7, Math.sin(a) * 2.2); b.sphere(0.2, 0xffe14d, Math.cos(a) * 2.2, 1.5, Math.sin(a) * 2.2, 1, 1, 1, 8); }
      const o = glowMesh(new THREE.SphereGeometry(0.55, 14, 10), 0xffef8a, 0.9); o.position.y = 5.7; extra.push(o);
      anim.push((t) => o.scale.setScalar(1 + Math.sin(t * 7) * 0.12 + (Math.sin(t * 31) > 0.9 ? 0.25 : 0)));
      break;
    }
    case 'sakura': {
      b.cyl(3, 3.2, 0.6, 0xa8a296, 0, 0.3, 0, 20); b.cyl(2.7, 2.7, 0.1, 0x6f9a4a, 0, 0.6, 0, 20);
      b.add(new THREE.CylinderGeometry(0.35, 0.6, 3.2, 8), 0x5a3a2c, matrix(0, 2.1, 0, 0.08, 0, 0.05));
      for (const [x, z, a] of [[0.8, 0.3, 0.7], [-0.7, -0.4, -0.8], [0.1, -0.8, 0.6]]) b.add(new THREE.CylinderGeometry(0.15, 0.25, 2, 6), 0x5a3a2c, matrix(x * 0.6, 3.8, z * 0.6, z * a, 0, -x * a));
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.sphere(1.1 + (i % 3) * 0.25, [0xf7b3cc, 0xf5a0bd, 0xfccde0][i % 3], Math.cos(a) * 1.5, 4.6 + (i % 2) * 0.6, Math.sin(a) * 1.5, 1, 0.8, 1, 8); }
      b.sphere(1.5, 0xfccde0, 0, 5.6, 0, 1, 0.8, 1, 9);
      for (let i = 0; i < 14; i++) { const a = i * 2.3, r = 0.8 + (i % 4) * 0.5; b.add(new THREE.CircleGeometry(0.12, 5), 0xf7b3cc, matrix(Math.cos(a) * r, 0.67, Math.sin(a) * r, -Math.PI / 2, 0, a)); }
      break;
    }
    case 'stump': {
      b.add(lumpy(new THREE.CylinderGeometry(2.3, 2.9, 2.2, 14, 2), 0.12, 5), 0x7a5a3c, matrix(0, 1.1, 0));
      b.cyl(2.2, 2.2, 0.1, 0xc9a06a, 0, 2.22, 0, 14);
      for (let k = 1; k <= 3; k++) b.add(new THREE.TorusGeometry(k * 0.6, 0.04, 4, 24), 0x9a7048, matrix(0, 2.28, 0, Math.PI / 2, 0, 0));
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; b.add(new THREE.CylinderGeometry(0.25, 0.55, 2, 6), 0x6a4a32, matrix(Math.cos(a) * 2.7, 0.4, Math.sin(a) * 2.7, Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8)); }
      for (let k = 0; k < 5; k++) { const a = k * 1.3 + 0.4, x = Math.cos(a) * 1.5, z = Math.sin(a) * 1.5, s = 0.5 + (k % 2) * 0.3; b.cyl(0.1, 0.12, s, 0xf3e8d6, x, 2.3 + s / 2, z, 6); b.sphere(0.35 * s + 0.15, k % 2 ? 0xd8664e : 0xf5cd77, x, 2.3 + s, z, 1, 0.55, 1, 8); }
      for (let k = 0; k < 4; k++) glow.sphere(0.1, 0xd6f07a, Math.cos(k * 1.7) * 2.2, 1.4 + (k % 2) * 0.4, Math.sin(k * 1.7) * 2.2, 1, 1, 1, 5);
      break;
    }
    case 'vane': {
      plinth(1.8, 1.2, 0xa9adb0);
      b.cyl(0.14, 0.18, 6, 0x3d4a5c, 0, 4.2, 0, 8);
      for (let k = 0; k < 4; k++) b.add(new THREE.BoxGeometry(0.08, 0.08, 1.8), 0x3d4a5c, matrix(0, 6, 0, 0, k * Math.PI / 4, 0));
      const vane = new THREE.Group(); vane.position.y = 6.8; extra.push(vane);
      const vb = new Builder(); vb.box(2.6, 0.08, 0.08, 0x2f3a44, 0, 0, 0); vb.add(new THREE.ConeGeometry(0.25, 0.6, 4), 0xd8b04a, matrix(1.5, 0, 0, 0, 0, -Math.PI / 2)); vb.box(0.06, 0.8, 0.7, 0xd8b04a, -1.2, 0, 0);
      vane.add(new THREE.Mesh(vb.build(), envMaterial()));
      const rotor = new THREE.Group(); rotor.position.set(0, 3.2, 0.3); extra.push(rotor);
      const rb = new Builder(); for (let k = 0; k < 4; k++) rb.add(new THREE.BoxGeometry(0.4, 1.6, 0.05), k % 2 ? 0xffffff : 0x5c7da0, matrix(Math.cos(k * Math.PI / 2) * 0.8, Math.sin(k * Math.PI / 2) * 0.8, 0, 0, 0.3, k * Math.PI / 2));
      rotor.add(new THREE.Mesh(rb.build(), envMaterial()));
      anim.push((t) => { vane.rotation.y = Math.sin(t * 0.3) * 0.8; rotor.rotation.z = t * 2.4; });
      break;
    }
    case 'brazier': {
      for (let i = 0; i < 3; i++) b.cyl(2.8 - i * 0.6, 3 - i * 0.6, 0.35, i % 2 ? 0x4a3e3a : 0x5a4a44, 0, 0.18 + i * 0.35, 0, 8);
      b.cyl(0.4, 0.6, 1.4, 0x2e2626, 0, 1.6, 0, 8);
      b.cyl(1.6, 0.6, 0.9, 0x3a2e2a, 0, 2.7, 0, 10); b.add(new THREE.TorusGeometry(1.6, 0.12, 5, 20), 0x6a4a3a, matrix(0, 3.15, 0, Math.PI / 2, 0, 0));
      glow.cyl(1.4, 1.4, 0.1, 0xff6a2a, 0, 3.12, 0, 12);
      fire(g, 0, 3, 0, 2.6, anim); fire(g, 0.6, 3, 0.3, 1.4, anim); fire(g, -0.5, 3, -0.4, 1.5, anim);
      break;
    }
    case 'globe': {
      plinth(1.4, 1.6, 0xe6e2f0);
      b.cyl(0.18, 0.3, 1.2, 0xd7b25a, 0, 2.2, 0, 8);
      const sys = new THREE.Group(); sys.position.y = 4; extra.push(sys);
      const rb = new Builder(); ring(rb, 1.6, 0, 0xd7b25a, 0.07, 0); ring(rb, 1.6, 0, 0xd7b25a, 0.07); ring(rb, 1.6, 0, 0xc8c2d8, 0.05, Math.PI / 2 - 0.4);
      const rm = new THREE.Mesh(rb.build(), envMaterial()); sys.add(rm);
      const core = glowMesh(new THREE.SphereGeometry(0.55, 14, 10), 0xfff0a0, 0.9); sys.add(core);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; glow.sphere(0.12, 0xfff0a0, Math.cos(a) * 2.6, 0.5, Math.sin(a) * 2.6, 1, 1, 1, 6); }
      anim.push((t) => { rm.rotation.y = t * 0.4; rm.rotation.x = Math.sin(t * 0.3) * 0.3; });
      break;
    }
    case 'well': {
      b.cyl(1.7, 1.8, 1.2, 0x8a8672, 0, 0.6, 0, 14); b.add(new THREE.TorusGeometry(1.7, 0.18, 5, 18), 0x6c6f6a, matrix(0, 1.2, 0, Math.PI / 2, 0, 0));
      b.cyl(1.45, 1.45, 0.05, 0x2a3a36, 0, 1.0, 0, 14);
      for (const sx of [-1, 1]) b.box(0.25, 2.6, 0.25, 0x4a3a2c, sx * 1.6, 2.3, 0);
      b.add(roofGeometry(2.4, 4, 1.1, 0.3), 0x4e5a52, matrix(0, 3.5, 0, 0, Math.PI / 2, 0));
      b.add(new THREE.CylinderGeometry(0.15, 0.15, 3.2, 6), 0x6a4a32, matrix(0, 3, 0, 0, 0, Math.PI / 2));
      b.box(0.02, 1.2, 0.02, 0x8a7a5a, 0.3, 2.3, 0); b.cyl(0.25, 0.2, 0.35, 0x6a4a32, 0.3, 1.6, 0, 8);
      for (const sx of [-1, 1]) { b.box(0.3, 0.38, 0.3, 0x2a2420, sx * 1.6, 3.1, 0.3); glow.box(0.2, 0.28, 0.32, 0x9be0c8, sx * 1.6, 3.1, 0.3); }
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.add(new THREE.ConeGeometry(0.1, 1.2, 4), 0x6a8a5a, matrix(Math.cos(a) * 2.6, 0.6, Math.sin(a) * 2.6)); }
      break;
    }
    case 'icesculpt': {
      const ib = new Builder();
      ib.box(3, 0.8, 3, 0xd8eef8, 0, 0.4, 0);
      ib.add(new THREE.SphereGeometry(0.9, 10, 8), 0xe6f8ff, matrix(0, 2.2, 0, 0, 0, 0, 1, 1.3, 0.8));
      ib.add(new THREE.ConeGeometry(0.3, 0.9, 6), 0xe6f8ff, matrix(0, 3.6, 0.3, 0.6, 0, 0)); ib.sphere(0.5, 0xffffff, 0, 3.3, 0, 1, 1, 1, 8);
      for (const sx of [-1, 1]) for (let f = 0; f < 4; f++) ib.add(new THREE.BoxGeometry(0.2, 2 - f * 0.3, 0.6), 0xd0f0ff, matrix(sx * (0.8 + f * 0.3), 2.6 + f * 0.1, -0.1, 0, 0, sx * (0.7 + f * 0.2)));
      for (let k = 0; k < 6; k++) crystal(ib, Math.cos(k) * 1.2, 1, Math.sin(k) * 1.2, 0.7, 0xbfe9ff, 0.2);
      const m = new THREE.Mesh(ib.build(), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 140, specular: 0xffffff, transparent: true, opacity: 0.86, emissive: 0x3a6a8a, emissiveIntensity: 0.25 }));
      m.castShadow = true; extra.push(m);
      break;
    }
    case 'roots': {
      basin(2.6, 0x8a7a5a);
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; b.add(new THREE.CylinderGeometry(0.25, 0.6, 3.6, 6), 0x6a4a32, matrix(Math.cos(a) * 1.6, 1.4, Math.sin(a) * 1.6, Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55)); }
      b.cyl(0.4, 0.7, 2.4, 0x5e4230, 0, 3.2, 0, 8);
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; b.sphere(1 + (i % 2) * 0.3, [0x5aa154, 0x6fb35a, 0x4e8f48][i % 3], Math.cos(a) * 1, 4.6 + (i % 2) * 0.4, Math.sin(a) * 1, 1, 0.75, 1, 8); }
      for (let k = 0; k < 6; k++) glow.sphere(0.1, 0xd6f07a, Math.cos(k * 1.1) * 2, 2.2 + (k % 3) * 0.6, Math.sin(k * 1.1) * 2, 1, 1, 1, 5);
      break;
    }
    case 'thunderstone': {
      b.cyl(3, 3.2, 0.4, 0xb8885a, 0, 0.2, 0, 10);
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; b.sphere(0.4, 0x8f7a66, Math.cos(a) * 2.7, 0.5, Math.sin(a) * 2.7, 1, 0.7, 1, 6); }
      b.add(lumpy(new THREE.IcosahedronGeometry(1.6, 1), 0.22, 7), 0x6a5a50, matrix(0, 2.2, 0, 0.3, 0.4, 0, 1, 1.35, 0.9));
      const cracks = new Builder(); for (let k = 0; k < 5; k++) cracks.add(new THREE.BoxGeometry(0.1, 1.4, 0.1), 0xffe14d, matrix(Math.cos(k * 1.3) * 1.25, 2.1 + (k % 2) * 0.5, Math.sin(k * 1.3) * 1.05, 0, k * 1.3, (k % 2 ? 0.5 : -0.4)));
      const cm = new THREE.Mesh(cracks.build(), glowMaterial(0xffe14d, 0.9)); extra.push(cm);
      anim.push((t) => { cm.material.opacity = 0.5 + Math.max(0, Math.sin(t * 2.3)) * 0.5; });
      break;
    }
    case 'crystal': {
      b.add(lumpy(new THREE.CylinderGeometry(2.2, 2.9, 0.9, 10, 1), 0.12, 2), 0x6d6a80, matrix(0, 0.4, 0));
      const cb = new Builder();
      crystal(cb, 0, 2.8, 0, 3, 0x9ef0ff); crystal(cb, 0.9, 1.8, 0.4, 1.8, 0xc89aff, 0.4); crystal(cb, -0.9, 1.7, -0.3, 1.7, 0x7fd8ff, -0.4); crystal(cb, 0.2, 1.4, -1, 1.3, 0xc89aff, -0.3, 1);
      const cm = new THREE.Mesh(cb.build(), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 120, specular: 0xffffff, emissive: 0x4a3a8a, emissiveIntensity: 0.45, transparent: true, opacity: 0.92 }));
      cm.castShadow = true; extra.push(cm);
      anim.push((t) => { cm.material.emissiveIntensity = 0.35 + Math.sin(t * 1.6) * 0.15; });
      break;
    }
    case 'moonpool': {
      basin(3.2, 0xe6e8f0, 0x2f5c9a);
      b.cyl(0.4, 0.6, 2.4, 0xf4f6fb, 0, 1.6, 0, 10);
      const s = new THREE.Shape(); s.absarc(0, 0, 1.2, Math.PI * 0.25, Math.PI * 1.75, false); s.absarc(0.55, 0, 0.95, Math.PI * 1.62, Math.PI * 0.38, true);
      const cres = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false }), new THREE.MeshLambertMaterial({ color: 0xf6f2d8, emissive: 0xe8e0a8, emissiveIntensity: 0.7 }));
      cres.position.set(0, 3.9, -0.12); cres.rotation.z = 0.5; extra.push(cres);
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; glow.sphere(0.16, 0xe0e6ff, Math.cos(a) * 2.2, 0.75, Math.sin(a) * 2.2, 1, 0.4, 1, 8); }
      anim.push((t) => { cres.rotation.y = Math.sin(t * 0.5) * 0.4; });
      break;
    }
    case 'sundisc': {
      for (let i = 0; i < 3; i++) b.box(4.4 - i * 1.2, 0.4, 4.4 - i * 1.2, i % 2 ? 0xe0b886 : 0xc89a6a, 0, 0.2 + i * 0.4, 0);
      b.add(new THREE.CylinderGeometry(0.35, 0.65, 5, 4), 0xf4dcb0, matrix(0, 3.7, 0, 0, Math.PI / 4, 0));
      b.add(new THREE.ConeGeometry(0.5, 0.8, 4), 0xffb83a, matrix(0, 6.6, 0, 0, Math.PI / 4, 0));
      const disc = new THREE.Mesh(new THREE.TorusGeometry(1, 0.16, 8, 28), new THREE.MeshLambertMaterial({ color: 0xffc84a, emissive: 0xff9a2a, emissiveIntensity: 0.6 }));
      disc.position.y = 5; extra.push(disc);
      anim.push((t) => { disc.rotation.y = t * 0.6; });
      break;
    }
    case 'wings': {
      plinth(1.5, 1.6, 0xe6e2f0);
      b.box(1.3, 0.2, 1.3, 0xd8b04a, 0, 1.7, 0);
      b.cyl(0.35, 0.5, 2, 0xffffff, 0, 2.8, 0, 10); b.sphere(0.36, 0xffffff, 0, 4.1, 0, 1, 1, 1, 10);
      for (const sx of [-1, 1]) for (let f = 0; f < 6; f++) b.add(new THREE.BoxGeometry(0.24, 2.6 - f * 0.3, 0.08), f % 2 ? 0xffffff : 0xf2eaf8, matrix(sx * (0.4 + f * 0.3), 3.6 - f * 0.1, -0.15, 0, 0, -sx * (0.45 + f * 0.17)));
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20), new THREE.MeshLambertMaterial({ color: 0xffd27a, emissive: 0xffb83a, emissiveIntensity: 0.8 }));
      halo.position.y = 4.75; halo.rotation.x = Math.PI / 2; extra.push(halo);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.sphere(0.6, 0xfaf6ff, Math.cos(a) * 2.6, 0.35, Math.sin(a) * 2.6, 1.2, 0.6, 1.2, 7); }
      anim.push((t) => { halo.position.y = 4.75 + Math.sin(t * 1.4) * 0.08; });
      break;
    }
    default: return fountain(pal);
  }
  const out = pack(b, glow, extra);
  for (const c of g.children.slice()) out.add(c);
  if (anim.length) out.userData.animate = (t) => anim.forEach(f => f(t));
  return out;
}

// ---------------------------------------------------------------------------
// Laternen: { geo, glow } wie BLD.streetLamp()
export function townLamp(kind, iron) {
  if (kind === 'iron' || !kind) return iron();
  const b = new Builder(), glow = new Builder();
  if (kind === 'lantern') {
    b.cyl(0.1, 0.13, 3.2, 0x5a4030, 0, 1.6, 0, 6); b.box(0.9, 0.12, 0.12, 0x5a4030, 0.4, 3.1, 0);
    b.box(0.02, 0.3, 0.02, 0x2f2a24, 0.75, 2.9, 0); b.box(0.36, 0.06, 0.36, 0x2f2a24, 0.75, 2.75, 0); b.box(0.36, 0.06, 0.36, 0x2f2a24, 0.75, 2.25, 0);
    b.add(new THREE.ConeGeometry(0.3, 0.25, 4), 0x2f2a24, matrix(0.75, 2.88, 0, 0, Math.PI / 4, 0));
    glow.box(0.28, 0.44, 0.28, 0xffd890, 0.75, 2.5, 0);
  } else if (kind === 'paper') {
    b.cyl(0.08, 0.1, 2.6, 0x3a2a24, 0, 1.3, 0, 6); b.box(0.7, 0.08, 0.08, 0x3a2a24, 0, 2.55, 0);
    glow.add(new THREE.SphereGeometry(0.34, 10, 8), 0xff8a7a, matrix(0, 2.05, 0, 0, 0, 0, 1, 1.3, 1));
    b.cyl(0.2, 0.2, 0.08, 0x2a2222, 0, 2.5, 0, 8); b.cyl(0.2, 0.2, 0.08, 0x2a2222, 0, 1.6, 0, 8);
  } else if (kind === 'torch') {
    b.cyl(0.3, 0.4, 2.2, 0x6a5a50, 0, 1.1, 0, 6); b.cyl(0.55, 0.3, 0.45, 0x3a2e2a, 0, 2.4, 0, 8);
    glow.add(new THREE.ConeGeometry(0.4, 0.9, 7), 0xffa040, matrix(0, 2.95, 0)); glow.cyl(0.45, 0.45, 0.06, 0xff6a2a, 0, 2.62, 0, 8);
  } else if (kind === 'crystal') {
    b.cyl(0.1, 0.16, 2.8, 0xb8b4c8, 0, 1.4, 0, 6); b.cyl(0.3, 0.12, 0.3, 0xb8b4c8, 0, 2.9, 0, 6);
    glow.add(new THREE.OctahedronGeometry(0.32, 0), 0xbff4ff, matrix(0, 3.45, 0, 0, 0, 0, 0.8, 1.5, 0.8));
  } else if (kind === 'shell') {
    b.cyl(0.08, 0.12, 3, 0xf4f2ec, 0, 1.5, 0, 8); b.add(new THREE.TorusGeometry(0.35, 0.06, 5, 12, Math.PI), 0xf4f2ec, matrix(0.35, 3, 0));
    glow.sphere(0.26, 0xfff2d8, 0.7, 2.75, 0, 1, 1, 1, 10); b.add(new THREE.ConeGeometry(0.3, 0.2, 10), 0xc9cfe0, matrix(0.7, 3.05, 0));
  }
  return { geo: b.build(), glow: glow.build() };
}

// ---------------------------------------------------------------------------
// Deko in den Beeten rund um den Platz (Radius ≈ 1,1). Schreibt in Builder b/glow.
export function townDecor(kind, i, b, glow, x, y, z, a) {
  const v = i % 2, R = (dx, dz) => [x + Math.cos(-a) * dx - Math.sin(-a) * dz, z + Math.sin(-a) * dx + Math.cos(-a) * dz];
  const at = (dx, dz) => R(dx, dz);
  switch (kind) {
    case 'harbour': {
      if (v) { const [px, pz] = at(-0.4, 0); b.box(0.8, 0.8, 0.8, 0x9a6a44, px, y + 0.4, pz, a); b.box(0.6, 0.6, 0.6, 0xa87a50, px, y + 1.1, pz, a + 0.4); const [qx, qz] = at(0.6, 0.1); b.cyl(0.38, 0.38, 0.9, 0x7a5232, qx, y + 0.45, qz, 10); }
      else { const [px, pz] = at(0, 0); b.add(new THREE.TorusGeometry(0.5, 0.18, 6, 14), 0xd8c49a, matrix(px, y + 0.18, pz, Math.PI / 2, 0, 0)); b.add(new THREE.TorusGeometry(0.32, 0.16, 6, 12), 0xd8c49a, matrix(px, y + 0.42, pz, Math.PI / 2, 0, 0)); const [qx, qz] = at(0.9, 0); b.cyl(0.18, 0.22, 0.9, 0x3a4450, qx, y + 0.45, qz, 8); }
      return;
    }
    case 'tech': {
      const [px, pz] = at(0, 0);
      if (v) { b.box(1.2, 1.1, 0.7, 0x5a6270, px, y + 0.55, pz, a); b.box(1.22, 0.14, 0.72, 0xffe14d, px, y + 0.8, pz, a); glow.box(0.18, 0.18, 0.74, 0x9fffa0, px, y + 1, pz, a); }
      else { b.add(new THREE.CylinderGeometry(0.55, 0.55, 0.9, 12), 0x8a6a44, matrix(px, y + 0.55, pz, 0, a, Math.PI / 2)); b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.95, 12), 0x2f3a44, matrix(px, y + 0.55, pz, 0, a, Math.PI / 2)); }
      return;
    }
    case 'blossom': {
      const [px, pz] = at(0, 0);
      if (v) { b.cyl(0.3, 0.4, 0.3, 0x9a948a, px, y + 0.15, pz, 6); b.cyl(0.1, 0.12, 0.7, 0x9a948a, px, y + 0.6, pz, 6); b.box(0.55, 0.45, 0.55, 0xa8a296, px, y + 1.15, pz, a); glow.box(0.38, 0.3, 0.57, 0xffd890, px, y + 1.15, pz, a); b.add(new THREE.ConeGeometry(0.55, 0.4, 4), 0x8a847a, matrix(px, y + 1.55, pz, 0, a + Math.PI / 4, 0)); }
      else for (let k = 0; k < 3; k++) { const [qx, qz] = at((k - 1) * 0.55, (k % 2) * 0.2); b.sphere(0.5, [0xf7b3cc, 0xfccde0, 0xf5a0bd][k], qx, y + 0.45, qz, 1, 0.85, 1, 8); }
      return;
    }
    case 'forest': {
      if (v) for (let k = 0; k < 3; k++) { const [qx, qz] = at((k - 1) * 0.5, (k % 2) * 0.25), s = 0.6 + (k % 2) * 0.35; b.cyl(0.1, 0.13, s, 0xf3e8d6, qx, y + s / 2, qz, 6); b.sphere(0.32 * s + 0.12, k % 2 ? 0xd8664e : 0xc9a06a, qx, y + s, qz, 1, 0.55, 1, 8); }
      else for (let k = 0; k < 3; k++) { const [qx, qz] = at(0, (k - 1) * 0.3); b.add(new THREE.CylinderGeometry(0.17, 0.17, 1.6, 7), k % 2 ? 0x8a6040 : 0x7a5232, matrix(qx, y + 0.17 + (k === 1 ? 0.28 : 0), qz, 0, a, Math.PI / 2)); }
      return;
    }
    case 'wind': {
      const [px, pz] = at(0, 0);
      if (v) { b.cyl(0.06, 0.08, 1.8, 0x5a4636, px, y + 0.9, pz, 6); for (let k = 0; k < 4; k++) b.add(new THREE.BoxGeometry(0.16, 0.6, 0.03), k % 2 ? 0xffffff : 0x9fd7ff, matrix(px, y + 1.8, pz, 0, a, k * Math.PI / 2 + 0.3)); }
      else { b.add(new THREE.CylinderGeometry(0.5, 0.5, 1, 12), 0xd8c070, matrix(px, y + 0.5, pz, 0, a, Math.PI / 2)); for (const s of [-0.25, 0.25]) { const [qx, qz] = at(s, 0); b.add(new THREE.TorusGeometry(0.5, 0.03, 4, 14), 0x8a6a3a, matrix(qx, y + 0.5, qz, 0, a + Math.PI / 2, 0)); } }
      return;
    }
    case 'forge': {
      const [px, pz] = at(0, 0);
      if (v) { b.box(0.9, 0.5, 0.6, 0x3a3434, px, y + 0.25, pz, a); b.box(1.2, 0.3, 0.5, 0x4a4446, px, y + 0.65, pz, a); }
      else for (let k = 0; k < 5; k++) { const [qx, qz] = at(Math.cos(k * 1.3) * 0.4, Math.sin(k * 1.3) * 0.3); b.sphere(0.3, 0x2a2222, qx, y + 0.2 + (k === 0 ? 0.25 : 0), qz, 1, 0.8, 1, 6); glow.sphere(0.08, 0xff6a2a, qx, y + 0.42, qz, 1, 1, 1, 4); }
      return;
    }
    case 'stars': {
      const [px, pz] = at(0, 0);
      if (v) { for (const s of [-1, 1]) b.add(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4), 0x47407a, matrix(px + s * 0.25, y + 0.55, pz, 0, 0, s * 0.3)); b.add(new THREE.CylinderGeometry(0.12, 0.18, 1, 8), 0xd7b25a, matrix(px, y + 1.2, pz, 0, a, 0.9)); }
      else { b.box(1.6, 0.35, 0.9, 0x8a7a6a, px, y + 0.17, pz, a); for (let k = 0; k < 5; k++) { const [qx, qz] = at((k - 2) * 0.3, (k % 2) * 0.2 - 0.1); glow.sphere(0.1, 0xfff0a0, qx, y + 0.55, qz, 1, 1, 1, 5); b.cyl(0.02, 0.02, 0.25, 0x4f9a5a, qx, y + 0.4, qz, 3); } }
      return;
    }
    case 'swamp': {
      for (let k = 0; k < 6; k++) { const [qx, qz] = at((k - 2.5) * 0.25, (k % 2) * 0.25); const h = 1 + (k % 3) * 0.35; b.add(new THREE.ConeGeometry(0.07, h, 4), 0x6a8a5a, matrix(qx, y + h / 2, qz)); if (k % 2) b.cyl(0.06, 0.06, 0.3, 0x6a4a30, qx, y + h - 0.1, qz, 5); }
      if (v) { const [px, pz] = at(0.5, -0.3); b.cyl(0.04, 0.05, 1.5, 0x3a3228, px, y + 0.75, pz, 5); glow.sphere(0.13, 0x9be0c8, px, y + 1.6, pz, 1, 1.2, 1, 6); }
      return;
    }
    case 'snow': {
      const [px, pz] = at(0, 0);
      if (v) { b.sphere(0.5, 0xf4f8fb, px, y + 0.45, pz, 1, 1, 1, 10); b.sphere(0.36, 0xf4f8fb, px, y + 1.1, pz, 1, 1, 1, 10); b.sphere(0.25, 0xf4f8fb, px, y + 1.6, pz, 1, 1, 1, 10); const [nx, nz] = at(0, 0.25); b.add(new THREE.ConeGeometry(0.05, 0.25, 5), 0xff8a3a, matrix(nx, y + 1.6, nz, Math.PI / 2, -a, 0)); b.cyl(0.18, 0.2, 0.25, 0x3f5f80, px, y + 1.86, pz, 8); }
      else { b.box(0.8, 0.8, 0.8, 0xd8eef8, px, y + 0.4, pz, a); const [qx, qz] = at(0.55, 0.3); b.box(0.5, 0.5, 0.5, 0xc8e4f2, qx, y + 0.25, qz, a + 0.5); }
      return;
    }
    case 'market': {
      const [px, pz] = at(0, 0);
      if (v) { for (const s of [-1, 1]) { const [qx, qz] = at(s * 0.7, 0); b.cyl(0.05, 0.05, 1.8, 0x5a4030, qx, y + 0.9, qz, 5); } b.box(1.6, 0.5, 0.8, 0x8a6040, px, y + 0.5, pz, a); b.add(new THREE.BoxGeometry(1.8, 0.06, 1.1), 0xa8452f, matrix(px, y + 1.8, pz, 0.2, a, 0)); for (let k = 0; k < 4; k++) { const [qx, qz] = at((k - 1.5) * 0.35, 0); b.sphere(0.12, [0xffd24a, 0xd85a2a, 0x7fd06a][k % 3], qx, y + 0.82, qz, 1, 1, 1, 6); } }
      else for (let k = 0; k < 3; k++) { const [qx, qz] = at((k - 1) * 0.55, (k % 2) * 0.2); b.add(new THREE.SphereGeometry(0.32, 10, 8), [0xb8693a, 0xa8452f, 0xc98a52][k], matrix(qx, y + 0.35, qz, 0, 0, 0, 1, 1.3, 1)); b.cyl(0.14, 0.18, 0.2, 0x8a4a2a, qx, y + 0.78, qz, 8); }
      return;
    }
    case 'crystals': {
      for (let k = 0; k < 4; k++) { const [qx, qz] = at((k - 1.5) * 0.4, (k % 2) * 0.3 - 0.15); const s = 0.5 + ((k + v) % 3) * 0.25; glow.add(new THREE.OctahedronGeometry(0.5, 0), [0x9ef0ff, 0xc89aff][k % 2], matrix(qx, y + s * 0.6, qz, (k - 1.5) * 0.2, k, 0, s * 0.45, s * 1.4, s * 0.45)); }
      const [px, pz] = at(0, 0); b.add(lumpy(new THREE.IcosahedronGeometry(0.55, 0), 0.15, i), 0x6d6a80, matrix(px, y + 0.2, pz, 0, 0, 0, 1.6, 0.5, 1));
      return;
    }
    case 'desert': {
      const [px, pz] = at(0, 0);
      if (v) { b.cyl(0.4, 0.3, 0.45, 0xb8693a, px, y + 0.22, pz, 10); b.cyl(0.2, 0.22, 1.2, 0x5a8a4a, px, y + 1, pz, 8); for (const s of [-1, 1]) { const [qx, qz] = at(s * 0.32, 0); b.cyl(0.11, 0.12, 0.5, 0x5a8a4a, qx, y + 1.2, qz, 6); } }
      else for (let k = 0; k < 3; k++) { const [qx, qz] = at((k - 1) * 0.55, (k % 2) * 0.2); b.add(new THREE.SphereGeometry(0.34, 10, 8), [0xd8aa76, 0xc98a52, 0xe0b886][k], matrix(qx, y + 0.36, qz, 0, 0, 0, 1, 1.25, 1)); b.cyl(0.12, 0.16, 0.18, 0xb46a42, qx, y + 0.8, qz, 8); }
      return;
    }
    case 'sky': {
      const [px, pz] = at(0, 0);
      if (v) { b.cyl(0.25, 0.4, 0.8, 0xe6e2f0, px, y + 0.4, pz, 10); b.cyl(0.6, 0.3, 0.2, 0xffffff, px, y + 0.9, pz, 14); glow.cyl(0.5, 0.5, 0.04, 0x8fc8f0, px, y + 1.0, pz, 14); }
      else for (let k = 0; k < 4; k++) { const [qx, qz] = at((k - 1.5) * 0.4, (k % 2) * 0.2); b.sphere(0.4 + (k % 2) * 0.12, 0xfaf6ff, qx, y + 0.4 + (k % 2) * 0.1, qz, 1, 0.8, 1, 8); }
      return;
    }
    default: {
      b.box(2.2, 0.35, 1.2, 0x8a6a4a, x, y + 0.17, z, -a);
      for (let k = 0; k < 6; k++) b.sphere(0.18, [0xf47a8a, 0xffd25a, 0xffffff, 0xc58af0, 0xff9a5a][k % 5], x + Math.cos(-a) * (k - 2.5) * 0.33, y + 0.5, z + Math.sin(-a) * (k - 2.5) * 0.33, 1, 0.8, 1, 6);
    }
  }
}

// Wimpelkette zwischen zwei Punkten (durchhängend), dreieckige Fähnchen
export function bunting(b, colors, x0, y0, z0, x1, y1, z1, sag = 0.8) {
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(3, Math.round(len / 0.7)), yaw = Math.atan2(x1 - x0, z1 - z0);
  let px = x0, py = y0, pz = z0;
  for (let k = 1; k <= n; k++) {
    const t = k / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * sag;
    const mx = (px + x) / 2, my = (py + y) / 2, mz = (pz + z) / 2, seg = Math.hypot(x - px, y - py, z - pz);
    b.add(new THREE.CylinderGeometry(0.015, 0.015, seg, 3), 0x3a3228, matrix(mx, my, mz, Math.PI / 2 - Math.atan2(y - py, Math.hypot(x - px, z - pz)), yaw, 0));
    if (k < n) b.add(new THREE.ConeGeometry(0.2, 0.42, 3), colors[k % colors.length], matrix(x, y - 0.24, z, Math.PI, yaw + Math.PI / 2, 0, 1, 1, 0.12));
    px = x; py = y; pz = z;
  }
}
