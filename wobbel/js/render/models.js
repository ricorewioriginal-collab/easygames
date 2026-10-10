/* Wobbel – prozedurale Cartoon-Modelle (Three.js, Toon-Shading + Outline). */
const T = window.THREE;
const gradTex = (() => { const d = new Uint8Array([90, 170, 255]), t = new T.DataTexture(d, 3, 1, T.LuminanceFormat); t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
const mc = {}; export const toon = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mc[k] || (mc[k] = new T.MeshToonMaterial(Object.assign({ color: c, gradientMap: gradTex }, o || {}))); };
const OUT = new T.MeshBasicMaterial({ color: 0x1b2748, side: T.BackSide });
const gc = {}, geo = (k, f) => gc[k] || (gc[k] = f());
export const G = {
  sphere: () => geo('sph', () => new T.SphereGeometry(1, 20, 14)), box: () => geo('box', () => new T.BoxGeometry(1, 1, 1)), cyl: () => geo('cyl', () => new T.CylinderGeometry(1, 1, 1, 14)),
  cone: () => geo('cone', () => new T.ConeGeometry(1, 1, 8)), ico: () => geo('ico', () => new T.IcosahedronGeometry(1, 0)), oct: () => geo('oct', () => new T.OctahedronGeometry(1, 0)), torus: () => geo('tor', () => new T.TorusGeometry(1, 0.2, 8, 20))
};
export function mesh(g, mat, x, y, z, sx, sy, sz, parent) { const m = new T.Mesh(g, mat); m.position.set(x || 0, y || 0, z || 0); m.scale.set(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz); if (parent) parent.add(m); return m; }
export function outline(m, k = 1.07) { const o = new T.Mesh(m.geometry, OUT); o.scale.setScalar(k); m.add(o); return o; }
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
export const COLORS = ['#e0a458', '#ff5a6a', '#4cd964', '#4aa8ff'], COLOR_NAMES = ['Holz', 'Rot', 'Grün', 'Blau'];

// ---------------------------------------------------------------- Wobbel (Spielfigur)
export function makeBlob() {
  const g = new T.Group(), body = new T.Group(); g.add(body);
  const skin = toon('#ff6fb0'), dark = toon('#e0458f');
  const b = mesh(G.sphere(), skin, 0, 0.42, 0, 0.44, 0.4, 0.44, body); outline(b, 1.08);
  const feet = [];
  [-1, 1].forEach(s => { const f = mesh(G.sphere(), dark, s * 0.18, 0.07, 0.1, 0.14, 0.08, 0.2, body); feet.push(f); outline(f, 1.12); mesh(G.sphere(), toon('#ffd0e4'), s * 0.27, 0.36, 0.33, 0.07, 0.05, 0.03, body); });
  const eyes = [], pupils = [];
  [-1, 1].forEach(s => { const e = mesh(G.sphere(), toon('#ffffff'), s * 0.15, 0.55, 0.33, 0.13, 0.15, 0.1, body); outline(e, 1.1); const p = mesh(G.sphere(), toon('#1b2748'), s * 0.15, 0.55, 0.42, 0.065, 0.085, 0.04, body); mesh(G.sphere(), toon('#ffffff'), s * 0.15 + 0.02, 0.59, 0.455, 0.022, 0.022, 0.02, body); eyes.push(e); pupils.push(p); });
  const mouth = mesh(geo('smile', () => new T.TorusGeometry(1, 0.2, 6, 12, Math.PI)), toon('#1b2748'), 0, 0.42, 0.41, 0.07, 0.05, 0.05, body); mouth.rotation.z = Math.PI;
  const stem = mesh(G.cyl(), toon('#2fa84a'), 0, 0.84, 0, 0.018, 0.14, 0.018, body); stem.rotation.z = 0.2;
  const leaf1 = mesh(G.sphere(), toon('#7bf06a'), 0.07, 0.94, 0, 0.1, 0.04, 0.06, body), leaf2 = mesh(G.sphere(), toon('#52d655'), -0.05, 0.92, 0, 0.09, 0.035, 0.055, body); leaf1.rotation.z = 0.5; leaf2.rotation.z = -0.4;
  const shadow = new T.Mesh(geo('circ', () => new T.CircleGeometry(1, 20)), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; shadow.scale.set(0.42, 0.42, 1); g.add(shadow);
  return { g, body, eyes, pupils, shadow, leaves: [leaf1, leaf2], skinMesh: b, feet, sprout: [stem, leaf1, leaf2], hat: null };
}
// Aussehen (Farbe + Hut) – verändert die vorhandene Figur, baut nichts neu auf
export function applyLook(blob, look) {
  look = look || {}; const c = look.color || '#ff6fb0', d = new T.Color(c).offsetHSL(0, 0.02, -0.14).getStyle();
  blob.skinMesh.material = toon(c); blob.feet.forEach(f => { f.material = toon(d); });
  if (blob.hat) { blob.body.remove(blob.hat); blob.hat = null; }
  const h = look.hat ? makeHat(look.hat) : null; blob.sprout.forEach(o => { o.visible = !h; });
  if (h) { blob.body.add(h); blob.hat = h; }
}
function makeHat(id) {
  const g = new T.Group(); g.position.y = 0.76;
  if (id === 'crown') { const gold = toon('#ffd24a'); outline(mesh(G.cyl(), gold, 0, 0.06, 0, 0.2, 0.1, 0.2, g), 1.1); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; outline(mesh(G.cone(), gold, Math.cos(a) * 0.17, 0.2, Math.sin(a) * 0.17, 0.06, 0.16, 0.06, g), 1.12); } mesh(G.sphere(), toon('#ff5a6a'), 0, 0.07, 0.2, 0.04, 0.04, 0.03, g); }
  else if (id === 'top') { const k = toon('#2a2a3a'); outline(mesh(G.cyl(), k, 0, 0.02, 0, 0.3, 0.04, 0.3, g), 1.1); outline(mesh(G.cyl(), k, 0, 0.2, 0, 0.19, 0.34, 0.19, g), 1.07); mesh(G.cyl(), toon('#ff5a6a'), 0, 0.08, 0, 0.2, 0.07, 0.2, g); }
  else if (id === 'bow') { g.position.set(0.16, 0.7, 0.05); g.rotation.z = -0.5; const r = toon('#ff4f7a'); [-1, 1].forEach(s => { const w = mesh(G.cone(), r, s * 0.11, 0, 0, 0.1, 0.16, 0.06, g); w.rotation.z = -s * Math.PI / 2; outline(w, 1.1); }); outline(mesh(G.sphere(), toon('#d63a64'), 0, 0, 0, 0.06, 0.06, 0.06, g), 1.12); }
  else if (id === 'party') { const cn = mesh(G.cone(), toon('#4aa8ff'), 0, 0.2, 0, 0.17, 0.42, 0.17, g); outline(cn, 1.08); [0.08, 0.2].forEach((y, i) => mesh(G.cyl(), toon('#ffd24a'), 0, y, 0, 0.14 - i * 0.05, 0.04, 0.14 - i * 0.05, g)); mesh(G.sphere(), toon('#ff5a6a'), 0, 0.43, 0, 0.05, 0.05, 0.05, g); }
  else if (id === 'prop') { const b = toon('#ffd24a'); outline(mesh(G.cyl(), toon('#4aa8ff'), 0, 0.04, 0, 0.17, 0.08, 0.17, g), 1.1); mesh(G.cyl(), b, 0, 0.1, 0, 0.03, 0.08, 0.03, g); const bl = new T.Group(); bl.position.y = 0.15; g.add(bl); [0, Math.PI / 2].forEach(a => { const w = mesh(G.box(), toon('#ff5a6a'), 0, 0, 0, 0.5, 0.02, 0.09, bl); w.rotation.y = a; }); g.userData.spin = bl; }
  return g;
}

// ---------------------------------------------------------------- Kisten
function emblem(color, parent, y) {
  const m = toon('#ffffff'); let e;
  if (color === 1) e = mesh(G.sphere(), m, 0, y, 0, 0.11, 0.11, 0.11, parent); else if (color === 2) e = mesh(G.cone(), m, 0, y, 0, 0.13, 0.2, 0.13, parent); else e = mesh(G.box(), m, 0, y, 0, 0.16, 0.16, 0.16, parent); e.rotation.y = 0.5; return e;
}
export function makeCrate(color) {
  const g = new T.Group(), s = 0.82;
  if (!color) {
    const wood = toon('#e8b062'), dark = toon('#a8683a'), mid = toon('#c98a48');
    const b = mesh(G.box(), wood, 0, s / 2 + 0.02, 0, s, s, s, g); outline(b, 1.045);
    const e = 0.07, h = s + 0.01;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) => mesh(G.box(), dark, a * (s / 2), s / 2 + 0.02, c * (s / 2), e, h + 0.02, e, g));
    [-1, 1].forEach(y => { mesh(G.box(), dark, 0, s / 2 + 0.02 + y * (s / 2), s / 2, s, e, e, g); mesh(G.box(), dark, 0, s / 2 + 0.02 + y * (s / 2), -s / 2, s, e, e, g); mesh(G.box(), dark, s / 2, s / 2 + 0.02 + y * (s / 2), 0, e, e, s, g); mesh(G.box(), dark, -s / 2, s / 2 + 0.02 + y * (s / 2), 0, e, e, s, g); });
    [-0.2, 0.2].forEach(y => { mesh(G.box(), mid, 0, s / 2 + 0.02 + y, s / 2 + 0.005, s - 0.1, 0.06, 0.02, g); mesh(G.box(), mid, s / 2 + 0.005, s / 2 + 0.02 + y, 0, 0.02, 0.06, s - 0.1, g); });
  } else {
    const col = COLORS[color], light = new T.Color(col).offsetHSL(0, 0, 0.18).getStyle(), body = toon(col), rib = toon('#fff7e0');
    const b = mesh(G.box(), body, 0, s / 2 + 0.02, 0, s, s, s, g); outline(b, 1.045);
    mesh(G.box(), rib, 0, s / 2 + 0.02, 0, s + 0.02, s + 0.02, 0.16, g); mesh(G.box(), rib, 0, s / 2 + 0.02, 0, 0.16, s + 0.02, s + 0.02, g);
    mesh(G.box(), toon(light), 0, s + 0.03, 0, s * 0.78, 0.03, s * 0.78, g);
    emblem(color, g, s + 0.14);
  }
  const api = { g, color, setDone(v) { g.traverse(o => { if (o.material && o.material.emissive && o.material !== OUT) o.material.emissive.setHex(0x000000); }); g.userData.done = v; } };
  return api;
}

// ---------------------------------------------------------------- Zielfeld
export function makeTarget(kind) {
  const g = new T.Group(), col = kind === 1 ? '#fff2a8' : COLORS[kind - 1];
  const pad = mesh(G.cyl(), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 }), 0, 0.03, 0, 0.4, 0.04, 0.4, g);
  const ring = mesh(geo('ring', () => new T.TorusGeometry(1, 0.1, 6, 28)), new T.MeshBasicMaterial({ color: kind === 1 ? '#ffd24a' : col }), 0, 0.06, 0, 0.42, 0.42, 1, g); ring.rotation.x = Math.PI / 2;
  if (kind > 1) { const e = emblem(kind - 1, g, 0.1); e.material = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 }); e.scale.multiplyScalar(0.8); } else { const st = mesh(G.oct(), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }), 0, 0.09, 0, 0.1, 0.03, 0.1, g); st.rotation.y = 0.8; }
  g.userData.pad = pad; g.userData.ring = ring; g.userData.kind = kind; return g;
}

// ---------------------------------------------------------------- Wände je Welt
export function makeWall(style, x, y) {
  const g = new T.Group(), h = ((x * 73 + y * 151) % 97) / 97;
  if (style === 'bush') {
    const gr = ['#3fb04a', '#35a042', '#4cc455'], base = mesh(G.sphere(), toon(gr[0]), 0, 0.45, 0, 0.5, 0.45, 0.5, g); outline(base, 1.06);
    for (let i = 0; i < 3; i++) { const a = h * 6 + i * 2.1, s = mesh(G.sphere(), toon(gr[(i + 1) % 3]), Math.cos(a) * 0.24, 0.6 + i * 0.1, Math.sin(a) * 0.24, 0.3, 0.28, 0.3, g); outline(s, 1.07); }
    if (h > 0.45) mesh(G.sphere(), toon(h > 0.75 ? '#ff7aa8' : '#ffd24a'), Math.cos(h * 9) * 0.3, 0.85, Math.sin(h * 9) * 0.3, 0.07, 0.07, 0.07, g);
  } else if (style === 'rock') {
    const a = mesh(G.ico(), toon('#a09a92'), 0, 0.4, 0, 0.5, 0.42, 0.46, g); a.rotation.set(h, h * 5, 0); outline(a, 1.07); const b = mesh(G.ico(), toon('#8a847e'), 0.2, 0.28, 0.18, 0.28, 0.24, 0.26, g); b.rotation.y = h * 3; outline(b, 1.09);
    mesh(G.sphere(), toon('#6fbf5a'), -0.2, 0.62, 0.0, 0.14, 0.06, 0.14, g);
  } else if (style === 'ruin') {
    const c = ['#d9b97a', '#cba768', '#e2c68c'][Math.floor(h * 3) % 3], b = mesh(G.box(), toon(c), 0, 0.42, 0, 0.9, 0.84 - h * 0.18, 0.9, g); outline(b, 1.045);
    mesh(G.box(), toon('#a98a50'), 0, 0.2, 0.455, 0.9, 0.05, 0.02, g); mesh(G.box(), toon('#a98a50'), 0.455, 0.5, 0, 0.02, 0.05, 0.9, g); if (h > 0.5) mesh(G.sphere(), toon('#6fbf5a'), 0.2, 0.84 - h * 0.18, -0.15, 0.18, 0.05, 0.14, g);
  } else if (style === 'brick') {
    const pal = ['#ff7aa8', '#ffd24a', '#6ad8ff', '#9aef6a', '#c08aff'], c = pal[Math.floor(h * 5) % 5];
    const b = mesh(G.box(), toon(c), 0, 0.48, 0, 0.92, 0.96, 0.92, g); outline(b, 1.04); mesh(G.box(), toon(new T.Color(c).offsetHSL(0, 0, 0.14).getStyle()), 0, 0.97, 0, 0.8, 0.06, 0.8, g);
    mesh(G.box(), toon('#ffffff'), 0, 0.5, 0.465, 0.8, 0.07, 0.02, g); mesh(G.box(), toon('#ffffff'), 0.465, 0.3, 0, 0.02, 0.07, 0.8, g);
  } else if (style === 'ice') {
    const m = new T.MeshToonMaterial({ color: '#b8ecff', gradientMap: gradTex, transparent: true, opacity: 0.92 }), m2 = new T.MeshToonMaterial({ color: '#8ad6f8', gradientMap: gradTex, transparent: true, opacity: 0.92 });
    const c = mesh(G.cone(), m, 0, 0.55, 0, 0.36, 1.1, 0.36, g); c.geometry = geo('cone6', () => new T.ConeGeometry(1, 1, 6)); outline(c, 1.06); const c2 = mesh(geo('cone6', () => new T.ConeGeometry(1, 1, 6)), m2, 0.26, 0.3, 0.2, 0.22, 0.6, 0.22, g); outline(c2, 1.08); mesh(G.sphere(), toon('#ffffff'), -0.2, 0.12, -0.2, 0.2, 0.1, 0.2, g);
  } else {   // castle
    const st = toon('#a89ac8'), b = mesh(G.box(), st, 0, 0.5, 0, 0.94, 1.0, 0.94, g); outline(b, 1.04);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) => mesh(G.box(), toon('#8f80b4'), a * 0.34, 1.07, c * 0.34, 0.22, 0.16, 0.22, g)); mesh(G.box(), toon('#2a2250'), 0, 0.55, 0.475, 0.2, 0.34, 0.02, g); mesh(G.box(), toon('#2a2250'), 0.475, 0.55, 0, 0.02, 0.34, 0.2, g);
  }
  g.rotation.y = Math.floor(h * 4) * Math.PI / 2; return g;
}

// ---------------------------------------------------------------- Boden-Elemente
export function paintTexture(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = COLORS[color]; x.strokeStyle = '#ffffff'; x.lineWidth = 5; x.beginPath(); const n = 9;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = 36 + (i % 3 === 0 ? 20 : i % 2 ? 6 : 0) + (i * 37 % 11); x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.closePath(); x.fill(); [[26, 40, 9], [100, 30, 7], [104, 96, 8], [24, 100, 6]].forEach(p => { x.beginPath(); x.arc(p[0], p[1], p[2], 0, 7); x.fill(); }); x.globalAlpha = 0.35; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(52, 52, 14, 8, -0.6, 0, 7); x.fill();
  const t = new T.CanvasTexture(c); return t;
}
const ptex = {}; export function makePaint(color) { const m = new T.Mesh(geo('plane', () => new T.PlaneGeometry(0.92, 0.92)), new T.MeshBasicMaterial({ map: ptex[color] || (ptex[color] = paintTexture(color)), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6; m.position.y = 0.02; return m; }
export function makePlank() { const g = new T.Group(), w = toon('#c98a48'); for (let i = 0; i < 4; i++) { const p = mesh(G.box(), toon(i % 2 ? '#d89a58' : '#c98a48'), 0, -0.02, -0.36 + i * 0.24, 0.96, 0.1, 0.22, g); outline(p, 1.03); } return g; }
export function makeKey() { const g = new T.Group(), gold = toon('#ffd24a', { emissive: 0x6a4a00 }); const ring = mesh(geo('ring2', () => new T.TorusGeometry(1, 0.28, 8, 16)), gold, 0, 0.5, 0, 0.17, 0.17, 0.17, g); mesh(G.box(), gold, 0, 0.3, 0, 0.06, 0.34, 0.06, g); mesh(G.box(), gold, 0.07, 0.2, 0, 0.12, 0.05, 0.05, g); mesh(G.box(), gold, 0.07, 0.3, 0, 0.1, 0.05, 0.05, g); g.userData.ring = ring; return g; }
export function makeDoor() {
  const g = new T.Group(), wood = toon('#a8683a'), dark = toon('#7a4a28'), plankG = new T.Group(); g.add(plankG);
  for (let i = 0; i < 4; i++) { const p = mesh(G.box(), toon(i % 2 ? '#c4824a' : '#b87440'), -0.33 + i * 0.22, 0.45, 0, 0.21, 0.9, 0.12, plankG); outline(p, 1.05); }
  mesh(G.box(), dark, 0, 0.7, 0.07, 0.9, 0.08, 0.04, plankG); mesh(G.box(), dark, 0, 0.25, 0.07, 0.9, 0.08, 0.04, plankG); mesh(G.sphere(), toon('#ffd24a', { emissive: 0x6a4a00 }), 0, 0.5, 0.1, 0.1, 0.1, 0.06, plankG); mesh(G.box(), toon('#ffd24a'), 0, 0.42, 0.09, 0.04, 0.1, 0.03, plankG);
  [-0.45, 0.45].forEach(x => mesh(G.box(), wood, x, 0.55, 0, 0.1, 1.1, 0.16, g)); mesh(G.box(), wood, 0, 1.08, 0, 1.0, 0.12, 0.16, g); g.userData.planks = plankG; return g;
}
// ---------------------------------------------------------------- Dekoration außerhalb der Insel
export function makeDecor(kind) {
  const g = new T.Group();
  if (kind === 'tree') { mesh(G.cyl(), toon('#8a5a3a'), 0, 0.4, 0, 0.1, 0.8, 0.1, g); [0.9, 1.35, 1.75].forEach((y, i) => { const c = mesh(G.cone(), toon(i % 2 ? '#3fb04a' : '#35a042'), 0, y, 0, 0.5 - i * 0.1, 0.7, 0.5 - i * 0.1, g); outline(c, 1.06); }); }
  else if (kind === 'palm') { const t = mesh(G.cyl(), toon('#b8854a'), 0.1, 0.7, 0, 0.1, 1.4, 0.1, g); t.rotation.z = -0.15; for (let i = 0; i < 5; i++) { const a = i * 1.256, l = mesh(G.ico(), toon(i % 2 ? '#3fc060' : '#2fa84a'), 0.2 + Math.cos(a) * 0.35, 1.45, Math.sin(a) * 0.35, 0.4, 0.06, 0.14, g); l.rotation.y = -a; l.rotation.z = -0.3; outline(l, 1.08); } mesh(G.sphere(), toon('#7a4a2a'), 0.2, 1.35, 0.08, 0.08, 0.08, 0.08, g); }
  else if (kind === 'berg') { const c = mesh(geo('cone6', () => new T.ConeGeometry(1, 1, 6)), new T.MeshToonMaterial({ color: '#dff4ff', gradientMap: gradTex, transparent: true, opacity: 0.95 }), 0, 0.7, 0, 0.7, 1.4, 0.7, g); outline(c, 1.05); }
  else if (kind === 'paint') { const b = mesh(G.cyl(), toon('#ff5a6a'), 0, 0.3, 0, 0.35, 0.6, 0.35, g); outline(b, 1.06); mesh(G.cyl(), toon('#ffffff'), 0, 0.62, 0, 0.3, 0.05, 0.3, g); mesh(G.sphere(), toon('#4aa8ff'), 0.05, 0.68, 0, 0.18, 0.08, 0.18, g); }
  else { const t = mesh(G.cyl(), toon('#c4b4e8'), 0, 0.9, 0, 0.35, 1.8, 0.35, g); outline(t, 1.05); const r = mesh(G.cone(), toon('#ff6ac8'), 0, 2.2, 0, 0.48, 0.8, 0.48, g); outline(r, 1.06); }
  return g;
}

// Pfeilfeld (zeigt nach unten = +z; wird je nach Richtung gedreht) und brüchiger Boden
const ROT = [Math.PI, -Math.PI / 2, 0, Math.PI / 2];   // Richtung 0 hoch, 1 rechts, 2 runter, 3 links (Pfeil zeigt +z, rechts = +x)
export function makeArrow(dir) {
  const g = new T.Group(), m = new T.MeshBasicMaterial({ color: '#ff8a3d' }), d = new T.MeshBasicMaterial({ color: '#7a3a10' });
  const shaft = mesh(G.box(), m, 0, 0.03, -0.1, 0.2, 0.03, 0.36, g), head = mesh(G.cone(), m, 0, 0.03, 0.22, 0.3, 0.03, 0.26, g); head.rotation.x = Math.PI / 2; head.scale.set(0.3, 0.26, 0.03);
  const sh2 = mesh(G.box(), d, 0, 0.012, -0.1, 0.27, 0.01, 0.43, g); g.rotation.y = ROT[dir]; return g;
}
export function makeCrack() {
  const g = new T.Group(), d = new T.MeshBasicMaterial({ color: '#5a4020' });
  [[-0.3, -0.3, 0.1, 0.1, 0.7], [0.1, -0.1, 0.4, -0.35, 0.5], [-0.1, 0.2, 0.3, 0.42, 0.65], [0, 0, -0.35, 0.3, 0.4]].forEach(([x1, z1, x2, z2]) => { const len = Math.hypot(x2 - x1, z2 - z1), b = mesh(G.box(), d, (x1 + x2) / 2, 0.012, (z1 + z2) / 2, 0.05, 0.01, len, g); b.rotation.y = Math.atan2(x2 - x1, z2 - z1); });
  return g;
}
export function makeHole(color) { return mesh(G.box(), new T.MeshPhongMaterial({ color, emissive: new T.Color(color).multiplyScalar(0.35), shininess: 90 }), 0, 0.012, 0, 0.99, 0.05, 0.99); }
