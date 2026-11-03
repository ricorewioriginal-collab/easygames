// Leuchtfeuer – Schauplätze in Warnholm (alles im Browser gebaut: Formen, Canvas-Texturen, Licht)
import { T, E, mat, box, cyl, ground, sign, lamp, bulb, makeSea, lighthouse, beamCone, cTex, rnd, tex } from './engine.js';
const PI = Math.PI;

// ------------------------------------------------------------ kleine Bausteine
function room(G, w, d, h, wall, floor, o = {}) {
  ground(w, d, floor, G);
  const ww = (W, x, z, ry) => { const g = new T.PlaneGeometry(W, h); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W / 3, uv.getY(i) * h / 3); const m = new T.Mesh(g, wall); m.position.set(x, h / 2, z); m.rotation.y = ry; m.receiveShadow = true; G.add(m); return m; };
  if (!o.noN) ww(w, 0, -d / 2, 0); if (!o.noS) ww(w, 0, d / 2, PI); if (!o.noW) ww(d, -w / 2, 0, PI / 2); if (!o.noE) ww(d, w / 2, 0, -PI / 2);
  if (o.ceil !== false) { const c = new T.Mesh(new T.PlaneGeometry(w, d), o.ceil || mat('#ece8e0', { roughness: 0.95 })); c.rotation.x = PI / 2; c.position.y = h; G.add(c); }
  // Fußleiste
  const sk = mat('#3a3430', { roughness: 0.6 });
  if (!o.noN) box(w, 0.1, 0.03, sk, 0, 0.05, -d / 2 + 0.015, G, false); if (!o.noW) box(0.03, 0.1, d, sk, -w / 2 + 0.015, 0.05, 0, G, false); if (!o.noE) box(0.03, 0.1, d, sk, w / 2 - 0.015, 0.05, 0, G, false);
}
// Fenster mit Aussicht (leuchtende Fläche) in einer Wand; side n/w/e
function windowAt(G, side, w, d, pos, y, ww, wh, view) {
  const g = new T.Group(); const frame = mat('#f4f2ee', { roughness: 0.5 });
  const v = new T.Mesh(new T.PlaneGeometry(ww, wh), new T.MeshBasicMaterial({ map: view, toneMapped: false, fog: false })); g.add(v);
  box(ww + 0.12, 0.08, 0.1, frame, 0, wh / 2, 0.02, g, false); box(ww + 0.12, 0.08, 0.1, frame, 0, -wh / 2, 0.02, g, false);
  box(0.08, wh, 0.1, frame, -ww / 2, 0, 0.02, g, false); box(0.08, wh, 0.1, frame, ww / 2, 0, 0.02, g, false); box(0.05, wh, 0.06, frame, 0, 0, 0.03, g, false); box(ww, 0.05, 0.06, frame, 0, wh * 0.15, 0.03, g, false);
  box(ww + 0.2, 0.05, 0.22, frame, 0, -wh / 2 - 0.04, 0.1, g);
  if (side === 'n') g.position.set(pos, y, -d / 2 + 0.02); else if (side === 'w') { g.position.set(-w / 2 + 0.02, y, pos); g.rotation.y = PI / 2; } else if (side === 'e') { g.position.set(w / 2 - 0.02, y, pos); g.rotation.y = -PI / 2; } else { g.position.set(pos, y, d / 2 - 0.02); g.rotation.y = PI; }
  G.add(g); return g;
}
const VIEW = {};
function view(kind) {
  if (VIEW[kind]) return VIEW[kind];
  const r = rnd(kind.length * 13);
  return (VIEW[kind] = cTex(512, 384, (g, w, h) => {
    const P = { day: ['#9cc7ec', '#e8f2fb', '#5d8db3'], golden: ['#f2a65e', '#ffe0b0', '#2f5f80'], night: ['#0b1430', '#2a3c6a', '#0d1a2e'], fog: ['#8e99a6', '#b6bec8', '#6f7a86'], storm: ['#1b2230', '#3a4658', '#1a2a38'], winter: ['#0c1430', '#33477a', '#1a2440'], grey: ['#a9b4be', '#d4d9de', '#5f7586'] }[kind] || ['#9cc7ec', '#e8f2fb', '#5d8db3'];
    const gr = g.createLinearGradient(0, 0, 0, h * 0.62); gr.addColorStop(0, P[0]); gr.addColorStop(1, P[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = P[2]; g.fillRect(0, h * 0.62, w, h);
    if (kind === 'night' || kind === 'winter') { for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.8})`; g.fillRect(r() * w, r() * h * 0.5, 1.5, 1.5); } }
    // Hafen: Häuserzeile, Masten, Lichter
    for (let x = 0; x < w; x += 34 + r() * 20) { const hh = 30 + r() * 50; g.fillStyle = kind === 'night' || kind === 'winter' || kind === 'storm' ? '#141a28' : '#58606a'; g.fillRect(x, h * 0.62 - hh, 30, hh); g.beginPath(); g.moveTo(x - 2, h * 0.62 - hh); g.lineTo(x + 15, h * 0.62 - hh - 14); g.lineTo(x + 32, h * 0.62 - hh); g.fill();
      if (kind !== 'day') for (let k = 0; k < 3; k++) if (r() < 0.6) { g.fillStyle = '#ffd98a'; g.fillRect(x + 5 + k * 8, h * 0.62 - hh + 10 + r() * (hh - 20), 5, 6); } }
    g.strokeStyle = 'rgba(30,30,40,.6)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const x = 40 + r() * (w - 80); g.beginPath(); g.moveTo(x, h * 0.62); g.lineTo(x, h * 0.3); g.stroke(); }
    if (kind === 'fog') { g.fillStyle = 'rgba(200,205,212,.55)'; g.fillRect(0, 0, w, h); }
    if (kind === 'storm' || kind === 'grey') { g.strokeStyle = 'rgba(200,210,230,.25)'; for (let i = 0; i < 120; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 20); g.stroke(); } }
  }));
}
let LEAF = null;
function leafMat() {
  if (LEAF) return LEAF;
  const t = cTex(512, 512, (g, w, h) => { g.fillStyle = '#3f6a32'; g.fillRect(0, 0, w, h); const r = rnd(77); for (let i = 0; i < 2600; i++) { const v = r(); g.fillStyle = `rgba(${50 + v * 70 | 0},${90 + v * 80 | 0},${30 + v * 30 | 0},.9)`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 5, 1.5 + r() * 3, r() * 3, 0, 7); g.fill(); } for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(10,30,10,.35)'; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 4, 0, 7); g.fill(); } }, [2, 2]);
  return (LEAF = new T.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 2, roughness: 0.85 }));
}
// Baumkrone aus weichen, unregelmäßigen Blattballen (glatt schattiert, keine Facetten)
function tree(G, x, z, s = 1, winter = false) {
  const t = new T.Group(), bark = mat('#5a4636', { roughness: 0.95 });
  const trunk = new T.Mesh(new T.CylinderGeometry(0.16 * s, 0.32 * s, 3.4 * s, 20, 6), bark); const tp = trunk.geometry.attributes.position; for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); tp.setX(i, tp.getX(i) + Math.sin(y * 1.3) * 0.06 * s); } trunk.geometry.computeVertexNormals(); trunk.position.y = 1.7 * s; trunk.castShadow = true; t.add(trunk);
  const r = rnd(Math.abs(x * 7 + z * 3) + 11);
  for (let i = 0; i < 5; i++) { const b = cyl(0.05 * s, 0.11 * s, 1.6 * s, bark, 0, 0, 0, t, 10); const a = i / 5 * Math.PI * 2; b.position.set(Math.cos(a) * 0.35 * s, 3.3 * s, Math.sin(a) * 0.35 * s); b.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7); }
  if (!winter) for (let i = 0; i < 7; i++) {
    const rad = (0.95 + r() * 0.6) * s, g = new T.SphereGeometry(rad, 32, 24), p = g.attributes.position, ph = r() * 6;
    for (let k = 0; k < p.count; k++) { const X = p.getX(k), Y = p.getY(k), Z = p.getZ(k), f = 1 + 0.13 * Math.sin(X * 3.1 + ph) * Math.sin(Y * 2.7 + ph) + 0.08 * Math.sin(Z * 5.3 + X * 2.1); p.setXYZ(k, X * f, Y * f * 0.85, Z * f); }
    g.computeVertexNormals(); const m = new T.Mesh(g, leafMat()); const a = i / 7 * Math.PI * 2;
    m.position.set(i ? Math.cos(a) * 1.0 * s : 0, (i ? 3.7 + r() * 0.9 : 4.6) * s, i ? Math.sin(a) * 1.0 * s : 0); m.castShadow = true; m.receiveShadow = true; t.add(m);
  }
  t.position.set(x, 0, z); G.add(t); return t;
}
// Häuser mit Fenstern (Fassadentextur)
const FAC = {};
function facade(c) {
  if (FAC[c]) return FAC[c];
  return (FAC[c] = new T.MeshStandardMaterial({ roughness: 0.85, map: cTex(256, 256, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); const r = rnd(c.length * 9); for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 2, 2); } for (let y = 0; y < 2; y++) for (let x = 0; x < 3; x++) { const X = 26 + x * 80, Y = 40 + y * 110; g.fillStyle = '#f4f2ee'; g.fillRect(X - 5, Y - 5, 46, 66); g.fillStyle = '#26303c'; g.fillRect(X, Y, 36, 56); g.fillStyle = '#f4f2ee'; g.fillRect(X + 16, Y, 4, 56); g.fillRect(X, Y + 22, 36, 4); } }, [1, 1]) }));
}
function house(G, x, z, w, h, d, c, ry = 0) {
  const g = new T.Group(); const b = box(w, h, d, facade(c), 0, h / 2, 0, g); const uv = b.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2 / 6.5 * (w > d ? 1 : 1), uv.getY(i) * 2 / h);
  const roof = new T.Mesh(new T.CylinderGeometry(0.01, 1, 1, 4, 1), mat('shingle', { rep: [3, 2] })); roof.rotation.y = Math.PI / 4; roof.scale.set(w * 0.78, 2.6, d * 0.78); roof.position.y = h + 1.3; roof.castShadow = true; g.add(roof);
  box(0.6, 1.4, 0.6, mat('#7a3a2a'), w * 0.25, h + 1.9, 0, g);
  g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); return g;
}
function bike(G, x, z, ry, color = '#c3262e') {
  const b = new T.Group(), metal = mat(color, { roughness: 0.35, metalness: 0.5 }), tire = mat('#1b1b1e', { roughness: 0.9 });
  for (const wx of [-0.52, 0.52]) { const w = new T.Mesh(new T.TorusGeometry(0.33, 0.03, 10, 32), tire); w.position.set(wx, 0.35, 0); w.castShadow = true; b.add(w); const hub = cyl(0.03, 0.03, 0.08, mat('#999', { metalness: 0.8, roughness: 0.3 }), wx, 0.35, 0, b, 8); hub.rotation.x = PI / 2; }
  const tube = (x1, y1, x2, y2) => { const l = Math.hypot(x2 - x1, y2 - y1), m = cyl(0.022, 0.022, l, metal, (x1 + x2) / 2, (y1 + y2) / 2, 0, b, 8); m.rotation.z = Math.atan2(x1 - x2, y2 - y1); };
  tube(-0.52, 0.35, -0.05, 0.38); tube(-0.05, 0.38, 0.38, 0.78); tube(-0.05, 0.38, -0.12, 0.82); tube(-0.12, 0.8, 0.36, 0.78); tube(-0.52, 0.35, -0.12, 0.8); tube(0.52, 0.35, 0.38, 0.85);
  box(0.24, 0.04, 0.08, mat('#151515'), -0.13, 0.86, 0, b); const bar = cyl(0.018, 0.018, 0.42, mat('#222'), 0.4, 0.9, 0, b, 8); bar.rotation.x = PI / 2;
  b.position.set(x, 0, z); b.rotation.y = ry; G.add(b); return b;
}
function bench(G, x, z, ry) { const g = new T.Group(), w = mat('wood', { roughness: 0.7, rep: [1, 0.3] }), m = mat('#2d3238', { metalness: 0.6, roughness: 0.4 }); for (let i = 0; i < 3; i++) box(1.8, 0.04, 0.12, w, 0, 0.45, -0.15 + i * 0.15, g); for (let i = 0; i < 2; i++) box(1.8, 0.12, 0.03, w, 0, 0.7 + i * 0.16, -0.27, g); for (const sx of [-0.75, 0.75]) { box(0.05, 0.45, 0.4, m, sx, 0.22, 0, g); box(0.05, 0.5, 0.05, m, sx, 0.7, -0.27, g); } g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); return g; }
function shelf(G, x, z, ry, w = 2, h = 2, fill = true) {
  const g = new T.Group(), wd = mat('wood', { rep: [1, 1], roughness: 0.7 });
  box(w, 0.04, 0.4, wd, 0, 0.02, 0, g); for (let i = 1; i <= 4; i++) box(w, 0.03, 0.4, wd, 0, i * h / 4, 0, g); box(0.04, h, 0.4, wd, -w / 2, h / 2, 0, g); box(0.04, h, 0.4, wd, w / 2, h / 2, 0, g);
  const r = rnd(x * 5 + z + 3); if (fill) for (let i = 0; i < 4; i++) { let px = -w / 2 + 0.08; while (px < w / 2 - 0.12) { const bw = 0.03 + r() * 0.05, bh = 0.2 + r() * 0.18; box(bw, bh, 0.24, mat(['#8e3b3b', '#2f5a7a', '#c9a24a', '#3d6b4a', '#6a4a8a', '#d9d2c2'][Math.floor(r() * 6)], { roughness: 0.7 }), px + bw / 2, i * h / 4 + 0.03 + bh / 2, 0, g, false); px += bw + 0.005; if (r() < 0.06) px += 0.25; } }
  g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); return g;
}
function table(G, x, z, w, d, h = 0.76, m = mat('wood', { rep: [2, 1], roughness: 0.55 }), ry = 0) { const g = new T.Group(); box(w, 0.05, d, m, 0, h, 0, g); const lm = mat('#2a2a2e', { metalness: 0.5, roughness: 0.4 }); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, h, 0.05, lm, sx * (w / 2 - 0.08), h / 2, sz * (d / 2 - 0.08), g); g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); return g; }
function chair(G, x, z, ry, c = '#3a5a8a') { const g = new T.Group(), m = mat(c, { roughness: 0.6 }), lm = mat('#2a2a2e', { metalness: 0.5, roughness: 0.4 }); box(0.42, 0.04, 0.42, m, 0, 0.46, 0, g); box(0.42, 0.4, 0.04, m, 0, 0.7, -0.2, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.03, 0.46, 0.03, lm, sx * 0.18, 0.23, sz * 0.18, g); g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); return g; }
function fishMesh(c = '#b8803e') { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new T.Vector2(Math.sin(t * PI) * 0.07 * (1 - t * 0.35), t * 0.5)); } const g = new T.LatheGeometry(pts, 14); g.scale(1, 1, 0.45); const m = new T.Mesh(g, mat(c, { roughness: 0.35, metalness: 0.15 })); m.castShadow = true; const tail = new T.Mesh(new T.ConeGeometry(0.06, 0.1, 3), m.material); tail.position.y = -0.03; tail.rotation.z = PI; tail.scale.z = 0.3; m.add(tail); return m; }
function stringLights(G, a, b, n, sag = 0.4, colors = ['#ffd27a']) {
  for (let i = 0; i <= n; i++) { const t = i / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t - Math.sin(t * PI) * sag, z = a[2] + (b[2] - a[2]) * t; bulb(colors[i % colors.length], 0.05, x, y, z, G, 4); }
  const curve = new T.CatmullRomCurve3([0, 0.25, 0.5, 0.75, 1].map(t => new T.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * PI) * sag, a[2] + (b[2] - a[2]) * t)));
  G.add(new T.Mesh(new T.TubeGeometry(curve, 20, 0.008, 4), mat('#222')));
}
export function posterTex(w = 1024, h = 1448) {   // Sturmnacht-Plakat: feine Linien (Finn) + wilde Wellen (Ben)
  return cTex(w, h, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0e1a3a'); gr.addColorStop(0.6, '#24406e'); gr.addColorStop(1, '#0e2440'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // Lichtkegel
    g.save(); g.globalCompositeOperation = 'lighter'; const lx = W * 0.52, ly = H * 0.3; const cg = g.createRadialGradient(lx, ly, 10, lx, ly, W * 0.9); cg.addColorStop(0, 'rgba(255,230,140,.9)'); cg.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = cg;
    g.beginPath(); g.moveTo(lx, ly); g.lineTo(-W * 0.2, ly - H * 0.22); g.lineTo(-W * 0.2, ly + H * 0.02); g.closePath(); g.fill(); g.beginPath(); g.moveTo(lx, ly); g.lineTo(W * 1.2, ly - H * 0.12); g.lineTo(W * 1.2, ly + H * 0.1); g.closePath(); g.fill(); g.restore();
    // Klippe
    g.fillStyle = '#1c2026'; g.beginPath(); g.moveTo(W * 0.25, H); g.lineTo(W * 0.32, H * 0.62); g.lineTo(W * 0.45, H * 0.56); g.lineTo(W * 0.62, H * 0.58); g.lineTo(W * 0.78, H * 0.7); g.lineTo(W * 0.9, H); g.fill();
    // Turm (feine Linien)
    const tx = W * 0.52, tb = H * 0.58, tt = H * 0.33, wb = W * 0.07, wt = W * 0.045;
    for (let i = 0; i < 6; i++) { const y0 = tb - (tb - tt) * i / 6, y1 = tb - (tb - tt) * (i + 1) / 6, a0 = wb + (wt - wb) * i / 6, a1 = wb + (wt - wb) * (i + 1) / 6; g.fillStyle = i % 2 ? '#f2eee6' : '#c4262c'; g.beginPath(); g.moveTo(tx - a0, y0); g.lineTo(tx + a0, y0); g.lineTo(tx + a1, y1); g.lineTo(tx - a1, y1); g.fill(); }
    g.strokeStyle = 'rgba(20,20,30,.8)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const y = tt + (tb - tt) * i / 40; g.moveTo(tx - wb * 0.95, y); g.lineTo(tx - wb * 0.7, y + 4); g.stroke(); }
    g.fillStyle = '#1d222a'; g.fillRect(tx - wt * 1.4, tt - 8, wt * 2.8, 10); g.fillStyle = '#ffe28a'; g.fillRect(tx - wt * 0.9, tt - 58, wt * 1.8, 50); g.fillStyle = '#c4262c'; g.beginPath(); g.moveTo(tx - wt * 1.1, tt - 58); g.lineTo(tx, tt - 100); g.lineTo(tx + wt * 1.1, tt - 58); g.fill();
    // Wellen (wild)
    const r = rnd(9); for (let k = 0; k < 9; k++) { const y = H * 0.66 + k * H * 0.04; g.strokeStyle = `rgba(${120 + r() * 100 | 0},${190 + r() * 60 | 0},255,${0.5 + r() * 0.5})`; g.lineWidth = 10 + r() * 14; g.lineCap = 'round'; g.beginPath(); for (let x = -40; x <= W + 40; x += 40) { const yy = y + Math.sin(x * 0.02 + k * 1.7) * 26 + (r() - 0.5) * 12; x < 0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
      g.fillStyle = 'rgba(240,250,255,.85)'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(r() * W, y - 12 + r() * 10, 4 + r() * 10, 0, PI * 2); g.fill(); } }
    g.fillStyle = '#ffeec2'; g.textAlign = 'center'; g.font = `700 ${W * 0.14}px Fredoka, system-ui, sans-serif`; g.save(); g.translate(W / 2, H * 0.12); g.rotate(-0.03); g.fillText('STURMNACHT', 0, 0); g.restore();
    g.font = `500 ${W * 0.035}px Fredoka, system-ui, sans-serif`; g.fillText('Herbstfest · 24. Oktober · Aula der Theodor-Storm-Schule', W / 2, H * 0.17);
  });
}

// ============================================================ Schauplätze
// Jeder gibt zurück: { spots:{id:[x,z,ry]}, hot:[{id,x,z,r,l,t,goal}], bounds:[x0,x1,z0,z1], camBox, solid, sky, weather, cam:{pos,look}, indoor, focus, tick }
export const SETS = {};

SETS.schule = (G, o) => {
  ground(90, 90, mat('asphalt', { rep: [1, 1], roughness: 0.92, bumpScale: 0.4 }), G);
  ground(8, 26, mat('cobble', { rep: [1, 3], roughness: 0.85 }), G, 0.005).position.set(0, 0.005, 3);
  // Backsteinbau
  const bw = 34, bh = 10.5, bd = 10, by = -16, brick = mat('brick', { rep: [6, 2], roughness: 0.88, bumpScale: 1 });
  box(bw, bh, bd, brick, 0, bh / 2, by - bd / 2 + 0.5, G);
  box(bw + 0.6, 0.5, bd + 0.6, mat('#3d3a3a'), 0, bh + 0.25, by - bd / 2 + 0.5, G);
  const glass = mat('#2a3a4a', { roughness: 0.08, metalness: 0.6 }), fr = mat('#efece6', { roughness: 0.5 });
  for (let fl = 0; fl < 3; fl++) for (let i = 0; i < 12; i++) { const x = -bw / 2 + 2 + i * 2.75; if (fl === 0 && Math.abs(x) < 2.5) continue; const y = 2 + fl * 3.1; box(1.6, 1.9, 0.08, glass, x, y, by + 0.56, G, false); box(1.75, 0.08, 0.14, fr, x, y - 1, by + 0.58, G, false); box(1.75, 0.08, 0.14, fr, x, y + 1, by + 0.58, G, false); box(0.08, 1.9, 0.12, fr, x, y, by + 0.6, G, false); }
  box(3.2, 3.2, 0.3, mat('#25303c', { roughness: 0.3, metalness: 0.5 }), 0, 1.6, by + 0.5, G); box(3.8, 0.25, 1.6, mat('#3c3a38'), 0, 3.4, by + 1.2, G);
  const nm = sign('THEODOR-STORM-SCHULE', 10, 0.9, { bg: '#e9e2d2', fg: '#273042' }); nm.position.set(0, 9.2, by + 0.57); G.add(nm);
  const mo = sign('Wer die Welle nicht reitet, geht unter.', 7, 0.55, { bg: '#d2c7b0', fg: '#4a3e30', weight: 500 }); mo.position.set(0, 4.2, by + 0.57); G.add(mo);
  // Linde, Bänke, Hecken
  tree(G, -12, -2, 1.25, o.winter); tree(G, 13, 6, 1.05, o.winter); bench(G, -12, 1.5, PI); bench(G, 8, -8, 0);
  for (let i = 0; i < 5; i++) box(2.6, 0.9, 0.9, mat('#3f6a36', { roughness: 0.95 }), -18 + i * 3, 0.45, -10, G);
  // Schwarzes Brett
  const sb = new T.Group(); box(2.4, 1.5, 0.12, mat('wood', { rep: [1, 1] }), 0, 1.6, 0, sb); box(2.2, 1.3, 0.04, mat('#a8774a', { roughness: 0.95 }), 0, 1.6, 0.07, sb);
  const r = rnd(4); for (let i = 0; i < 9; i++) { const p = new T.Mesh(new T.PlaneGeometry(0.42, 0.56), mat(['#ffffff', '#f6f0c8', '#dbe8f5'][i % 3], { roughness: 0.9 })); p.position.set(-0.8 + (i % 4) * 0.52 + r() * 0.08, 1.95 - Math.floor(i / 4) * 0.62 + r() * 0.05, 0.1); p.rotation.z = (r() - 0.5) * 0.12; sb.add(p); }
  const plan = sign('STURMNACHT\nGruppen', 0.6, 0.8, { bg: '#ffffff', fg: '#1d2a44', fs: 90 }); plan.position.set(0.75, 1.35, 0.11); sb.add(plan);
  for (const sx of [-1.1, 1.1]) box(0.1, 1.2, 0.1, mat('#3a3030'), sx, 0.6, 0, sb); sb.position.set(-6, 0, -8.9); G.add(sb);
  // Fahrradständer mit Bens rotem Rennrad
  for (let i = 0; i < 6; i++) { const a = cyl(0.03, 0.03, 0.8, mat('#9ea4aa', { metalness: 0.8, roughness: 0.3 }), 9 + i * 0.7, 0.4, -7, G, 8); }
  box(4.2, 0.04, 0.04, mat('#9ea4aa', { metalness: 0.8, roughness: 0.3 }), 10.75, 0.78, -7, G);
  bike(G, 9.3, -6.8, PI / 2, '#3a6aa0'); bike(G, 10.7, -6.8, PI / 2, '#2a2a2a'); if (o.ch === 4) bike(G, 12.8, -6.6, PI / 2, '#c3262e');
  // Häuser im Hintergrund
  for (let i = 0; i < 6; i++) house(G, -30 + i * 12, 30, 7, 6.5 + (i % 3) * 1.2, 6, ['#d9cbb4', '#c97a5a', '#e6e0d2', '#9db4c0'][i % 4], Math.PI);
  return { spots: { finn: [1, 9, PI / 2], lotte: [2.2, 9, -PI / 2], ben: [12.2, -5.6, -PI / 2] }, bounds: [-20, 20, -10.6, 20], solid: [{ x: -12, z: -2, r: 0.5 }, { x: 13, z: 6, r: 0.4 }, { x0: -7.3, x1: -4.7, z0: -9.1, z1: -8.7 }, { x0: 8.6, x1: 13.3, z0: -7.4, z1: -6.4 }, { x0: -13, x1: -11, z0: 1.2, z1: 1.8 }, { x0: 7, x1: 9, z0: -8.3, z1: -7.7 }],
    hot: [{ id: 'brett', x: -6, z: -7.9, r: 1.8, l: 'Schwarzes Brett' }, { id: 'rad', x: 11.5, z: -5.6, r: 2, l: 'Fahrradständer' }, { id: 'linde', x: -11.3, z: -0.8, r: 1.6, l: 'Linde ansehen', t: 'Die Linde im Schulhof. Im Juni bekommt sie endlich ihr Laub zurück.' }, { id: 'tuer', x: 0, z: -13.6, r: 2, l: 'Eingang', t: 'Wer die Welle nicht reitet, geht unter. Man kann es als Motto lesen. Oder als Drohung.' }],
    goalSpot: { brett: [-6, -7.4, PI], rad: [11.4, -5.4, PI / 2] },
    sky: o.ch === 4 ? 'grey' : 'day', weather: o.ch === 4 ? 'rain' : null, cam: o.ch === 4 ? { pos: [9.5, 1.7, -1.5], look: [12, 1.2, -6] } : { pos: [1.6, 1.75, 13.2], look: [1.6, 1.5, 7] } };
};

SETS.kunstraum = (G, o) => {
  const w = 12, d = 9, h = 3.8; room(G, w, d, h, mat('plaster', { rep: [2, 1] }), mat('planks', { rep: [2, 2], roughness: 0.6 }));
  for (let i = 0; i < 3; i++) windowAt(G, 'w', w, d, -2.8 + i * 2.8, 2, 2.2, 1.8, view('golden'));
  // goldene Lichtbahnen
  const shaft = new T.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.08, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
  for (let i = 0; i < 3; i++) { const s = new T.Mesh(new T.PlaneGeometry(2.2, 5), shaft); s.position.set(-4, 1.5, -2.8 + i * 2.8); s.rotation.set(0, PI / 2, -0.7); G.add(s); }
  const sl = new T.SpotLight('#ffcf8f', 60, 18, 0.55, 0.6, 1.2); sl.position.set(-7.5, 4.5, 0); sl.target.position.set(0, 0, 0); if (E.quality === 'hoch') { sl.castShadow = true; sl.shadow.mapSize.set(1024, 1024); sl.shadow.bias = -0.001; } G.add(sl, sl.target);
  lamp('#fff2dc', 6, 14, 2, 3.4, 0, G);
  table(G, -2.6, -0.6, 3.2, 1.6, 0.78); const papers = mat('#f6f2ea', { roughness: 0.9 }); for (let i = 0; i < 4; i++) { const p = new T.Mesh(new T.PlaneGeometry(0.5, 0.36), papers); p.rotation.x = -PI / 2; p.rotation.z = i * 0.3; p.position.set(-3.4 + i * 0.5, 0.81, -0.6 + (i % 2) * 0.2); G.add(p); }
  // Staffeleien
  for (let i = 0; i < 3; i++) { const e = new T.Group(), wd = mat('wood', { rep: [0.5, 1] }); const l1 = box(0.05, 1.9, 0.05, wd, -0.35, 0.95, 0, e); l1.rotation.z = 0.12; const l2 = box(0.05, 1.9, 0.05, wd, 0.35, 0.95, 0, e); l2.rotation.z = -0.12; box(0.8, 0.04, 0.12, wd, 0, 0.85, 0.05, e); const c = new T.Mesh(new T.PlaneGeometry(0.7, 0.9), mat(['#e9d7c0', '#c9e0e8', '#f2e2a8'][i], { roughness: 0.9 })); c.position.set(0, 1.35, 0.06); e.add(c); e.position.set(3 + i * 1.3, 0, -3); e.rotation.y = -0.3 + i * 0.2; G.add(e); }
  shelf(G, 4.5, -4.3, 0, 2.6, 2); shelf(G, 5.7, 1.5, -PI / 2, 2.4, 1.6);
  for (let i = 0; i < 6; i++) { const j = cyl(0.06, 0.06, 0.14, mat(['#d93a3a', '#3a7ad9', '#e8c23a', '#3ab36a', '#f08a3a', '#8a4ad9'][i], { roughness: 0.4 }), 3.6 + i * 0.2, 1.08, -4.3, G, 12); }
  // Plakatwand (Puzzle)
  const wall = new T.Group(); box(3.4, 2.5, 0.08, mat('#d8cfc0', { roughness: 0.95 }), 0, 1.7, 0, wall); wall.position.set(0, 0, -4.4); G.add(wall);
  const draft = sign('', 1.1, 1.5, { draw: (g, W, H) => { g.drawImage(posterTex(256, 362).image, 0, 0, W, H); } }); draft.position.set(-4.6, 1.8, -4.45); G.add(draft);
  for (let i = 0; i < 6; i++) chair(G, -3.6 + (i % 3) * 1, i < 3 ? -1.7 : 0.5, i < 3 ? 0 : PI, '#4a6a9a');
  return { indoor: true, spots: { finn: [-0.6, -2.3, PI * 0.1], ben: [0.6, -2.2, -PI * 0.1], tobi: [3.5, 3.9, PI] }, bounds: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.3], camBox: [-w / 2 + 0.4, w / 2 - 0.4, -d / 2 + 0.4, d / 2 - 0.3, h - 0.3],
    solid: [{ x0: -4.2, x1: -1, z0: -1.4, z1: 0.2 }], sky: 'indoor', cam: { pos: [0.3, 1.9, 1.8], look: [0, 1.4, -2.2] }, board: { x: 0, y: 1.7, z: -4.34 } };
};

SETS.raeucherei = (G, o) => {
  const w = 14, d = 10, h = 4.2; room(G, w, d, h, mat('brick', { rep: [3, 1.2], roughness: 0.9 }), mat('tiles', { rep: [3, 2], roughness: 0.35 }), { ceil: mat('wood', { rep: [3, 2] }) });
  for (let i = 0; i < 3; i++) box(0.2, 0.25, d, mat('#4a3426'), -4 + i * 4, h - 0.12, 0, G);
  for (let i = 0; i < 2; i++) windowAt(G, 'e', w, d, -2.5 + i * 3.4, 2.1, 1.8, 1.4, view(o.night ? 'night' : 'day'));
  // lange Edelstahlbank
  const st = mat('steel', { rep: [1, 1], roughness: 0.32, metalness: 0.85 }); box(5.2, 0.06, 1.0, st, -1, 0.92, -1.2, G); box(5.0, 0.8, 0.9, mat('#8e9398', { roughness: 0.4, metalness: 0.7 }), -1, 0.45, -1.2, G);
  // Räucherofen mit Glut
  const ov = new T.Group(); box(2.4, 2.8, 1.6, mat('#2a2826', { roughness: 0.6, metalness: 0.4 }), 0, 1.4, 0, ov); const door = box(1.4, 1.5, 0.05, mat('#151413', { metalness: 0.5, roughness: 0.4 }), 0, 1.3, 0.82, ov);
  const glow = new T.Mesh(new T.PlaneGeometry(1.1, 0.3), new T.MeshBasicMaterial({ color: '#ff7a2a' })); glow.position.set(0, 0.42, 0.86); ov.add(glow); cyl(0.2, 0.2, 2, mat('#3a3836', { metalness: 0.6, roughness: 0.4 }), 0.6, 3.6, -0.3, ov, 14);
  const ember = lamp('#ff8a3a', 8, 7, 0, 0.6, 1.3, ov); ov.position.set(4.5, 0, -4); G.add(ov);
  // Fische an Stangen
  for (let r = 0; r < 2; r++) { box(4, 0.04, 0.04, mat('#666', { metalness: 0.8 }), -1.5, 3.3, -3 - r * 0.8, G, false); for (let i = 0; i < 12; i++) { const f = fishMesh(i % 3 ? '#b8803e' : '#c69050'); f.position.set(-3.3 + i * 0.33, 2.75, -3 - r * 0.8); f.rotation.x = PI; G.add(f); } }
  shelf(G, -6.6, 0, PI / 2, 3, 2.1, false); for (let i = 0; i < 10; i++) box(0.3, 0.12, 0.22, mat(['#e6e1d6', '#cbbf9f'][i % 2]), -6.6, 0.6 + Math.floor(i / 5) * 0.53, -1.1 + (i % 5) * 0.5, G);
  const s = sign('ALBRECHT AM HAFEN\nseit 1974', 3, 0.9, { bg: '#1e3550', fg: '#f2e6c8' }); s.position.set(-1, 3.2, -4.97); G.add(s);
  lamp('#ffe6c4', 7, 12, -1, 3.8, 0, G, true); lamp('#ffe6c4', 4, 10, 3, 3.8, 2, G);
  // Theke vorn (Laden)
  const cnt = new T.Group(); box(5, 1.0, 0.7, mat('wood', { rep: [3, 1] }), 0, 0.5, 0, cnt); box(5.1, 0.06, 0.8, mat('#e9e4da', { roughness: 0.3 }), 0, 1.03, 0, cnt);
  const glassC = new T.Mesh(new T.BoxGeometry(3, 0.4, 0.6), new T.MeshPhysicalMaterial({ color: '#dfefff', transparent: true, opacity: 0.25, roughness: 0.05 })); glassC.position.set(-0.6, 1.26, 0); cnt.add(glassC);
  for (let i = 0; i < 8; i++) { const f = fishMesh(['#e8875a', '#c9c2c8', '#b58b4a'][i % 3]); f.rotation.z = PI / 2; f.position.set(-1.9 + i * 0.36, 1.12, 0); cnt.add(f); }
  cnt.position.set(0, 0, 2.2); G.add(cnt);
  return { indoor: true, spots: { finn: [0.4, 1.4, 0], ben: [-0.9, 1.3, 0], joerg: [3.4, -2.5, -PI * 0.75], pia: [-5.8, 3.6, PI * 0.6] }, bounds: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.3], camBox: [-w / 2 + 0.4, w / 2 - 0.4, -d / 2 + 0.4, d / 2 - 0.3, h - 0.3],
    solid: [{ x0: -3.6, x1: 1.6, z0: -1.7, z1: -0.7 }, { x0: 3.3, x1: 5.7, z0: -4.8, z1: -3.2 }, { x0: -2.5, x1: 2.5, z0: 1.85, z1: 2.55 }], sky: 'indoor', cam: { pos: [-3.6, 1.8, 3.9], look: [0.8, 1.3, -1.6] }, counter: { z: 2.2 },
    tick: (dt, t) => { ember.intensity = 7 + Math.sin(t * 9) * 1.2 + Math.sin(t * 23) * 0.8; } };
};

SETS.halle = (G, o) => {
  const w = 44, d = 26, h = 9; room(G, w, d, h, mat('wallBlue', { rep: [6, 2] }), mat('gym', { rep: [6, 4], roughness: 0.4, bumpScale: 0.2 }), { ceil: mat('#d8dde2', { roughness: 0.9 }) });
  // Spielfeldlinien
  const lines = cTex(1024, 512, (g, W, H) => { g.clearRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, H - 20); g.beginPath(); g.moveTo(W / 2, 10); g.lineTo(W / 2, H - 10); g.stroke(); g.strokeStyle = 'rgba(30,110,200,.9)'; for (const s of [0, 1]) { const x = s ? W - 10 : 10; g.beginPath(); g.ellipse(x, H / 2, W * 0.14, H * 0.38, 0, s ? PI / 2 : -PI / 2, s ? PI * 1.5 : PI / 2); g.stroke(); g.setLineDash([24, 18]); g.beginPath(); g.ellipse(x, H / 2, W * 0.21, H * 0.48, 0, s ? PI / 2 : -PI / 2, s ? PI * 1.5 : PI / 2); g.stroke(); g.setLineDash([]); } }, null);
  const lm = new T.Mesh(new T.PlaneGeometry(40, 20), new T.MeshStandardMaterial({ map: lines, transparent: true, roughness: 0.4 })); lm.rotation.x = -PI / 2; lm.position.set(0, 0.01, 2); G.add(lm);
  // Tore
  for (const s of [-1, 1]) { const g = new T.Group(), r = mat('#d63232', { roughness: 0.5 }), wt = mat('#f2f2f2', { roughness: 0.5 }); for (let i = 0; i < 6; i++) { box(0.08, 2 / 6, 0.08, i % 2 ? wt : r, 0, i * 2 / 6 + 1 / 6, -1.5, g); box(0.08, 2 / 6, 0.08, i % 2 ? wt : r, 0, i * 2 / 6 + 1 / 6, 1.5, g); } for (let i = 0; i < 9; i++) box(0.08, 0.08, 3 / 9, i % 2 ? wt : r, 0, 2, -1.5 + i * 3 / 9 + 1 / 6, g);
    const net = new T.Mesh(new T.BoxGeometry(1, 2, 3), new T.MeshStandardMaterial({ color: '#eeeeee', wireframe: true, transparent: true, opacity: 0.35 })); net.position.set(s * 0.5, 1, 0); g.add(net); g.position.set(s * 20, 0, 2); G.add(g); }
  // Tribüne
  const seatC = ['#1f5a3a', '#e8e8e8', '#1f5a3a', '#d8b23a'];
  for (let r = 0; r < 6; r++) { box(36, 0.45, 1.0, mat('concrete', { rep: [9, 1] }), 0, 0.22 + r * 0.45, -9.2 - r * 1.0, G); for (let i = 0; i < 40; i++) { const c = mat(seatC[(i + r) % 4], { roughness: 0.5 }); box(0.6, 0.12, 0.45, c, -17.4 + i * 0.9, 0.5 + r * 0.45, -9.2 - r * 1.0, G, false); box(0.6, 0.4, 0.06, c, -17.4 + i * 0.9, 0.7 + r * 0.45, -9.42 - r * 1.0, G, false); } }
  // Banner, Anzeigetafel
  const b1 = sign('TSS WARNHOLM', 8, 1.3, { bg: '#1f5a3a', fg: '#ffffff' }); b1.position.set(-10, 6.2, -12.95); G.add(b1);
  const b2 = sign('HOPP BEN', 3.4, 1, { bg: '#ffffff', fg: '#1f5a3a', draw: (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); } }); b2.position.set(3, 3.6, -9.6); b2.rotation.x = -0.15; G.add(b2); b2.visible = !!o.pia;
  const sc = sign('HALBZEIT\n14 : 12', 5, 2.4, { bg: '#121418', fg: '#ff4646', glow: 1.2 }); sc.position.set(10, 6.4, -12.95); G.add(sc);
  // Deckenlicht
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const p = new T.Mesh(new T.PlaneGeometry(3, 0.5), new T.MeshBasicMaterial({ color: '#ffffff' })); p.rotation.x = PI / 2; p.position.set(-16 + i * 8, h - 0.05, -4 + j * 10); G.add(p); }
  const top = new T.DirectionalLight('#ffffff', 1.6); top.position.set(4, 20, 8); if (E.quality === 'hoch') { top.castShadow = true; top.shadow.mapSize.set(1024, 1024); const c = top.shadow.camera; c.left = c.bottom = -22; c.right = c.top = 22; } G.add(top, top.target);
  lamp('#ffffff', 30, 40, 0, 8, 2, G);
  return { indoor: true, spots: { finn: [-2, 7, PI], lotte: [-3.2, 7.4, PI], pia: [-0.9, 7.6, PI], ben: [4, -1, 0.2], samira: [18.5, 2, -PI / 2] }, bounds: [-w / 2 + 0.5, w / 2 - 0.5, -9.0, d / 2 - 0.5], camBox: [-w / 2 + 1, w / 2 - 1, -8, d / 2 - 0.5, h - 0.5],
    hot: [{ id: 'tribuene', x: 2.5, z: -8.4, r: 1.8, l: 'Dritte Reihe' }, { id: 'tor', x: 18.5, z: 2, r: 2, l: 'Tor ansehen', t: 'Samiras Tor. „Es gibt Menschen, die stehen zwischen den Pfosten, damit andere frei spielen können.“' }],
    goalSpot: { tribuene: [2.5, -8.6, 0] }, sky: 'indoor', cam: { pos: [-2, 3.2, 12], look: [1, 1.5, 0] } };
};

SETS.zimmer = (G, o) => {
  const w = 5.2, d = 4.6, h = 2.7, night = o.night || o.fog; room(G, w, d, h, mat('wallWarm', { rep: [1, 1] }), mat('planks', { rep: [1, 1], roughness: 0.6 }), { ceil: mat('#efe6d8', { roughness: 0.95 }) });
  // Dachschräge mit Leuchtsternen (Aufkleber aus der Kindheit)
  const sl = new T.Mesh(new T.PlaneGeometry(w, 1.6), mat('#efe6d8', { roughness: 0.95 })); sl.position.set(0, h - 0.45, d / 2 - 0.55); sl.rotation.x = PI / 2 + 0.95; G.add(sl);
  const r = rnd(12); for (let i = 0; i < 22; i++) { const s2 = new T.Mesh(new T.CircleGeometry(0.045, 5), new T.MeshBasicMaterial({ color: night ? '#b6ffb0' : '#e8f2d8' })); s2.rotation.x = PI / 2; s2.position.set((r() - 0.5) * 4.6, h - 0.01, -1.8 + r() * 2.6); G.add(s2); }
  windowAt(G, 'n', w, d, 0.8, 1.6, 1.4, 1.2, view(o.fog ? 'fog' : night ? 'night' : 'day'));
  // Bett
  const bed = new T.Group(); box(2.1, 0.35, 1.1, mat('wood', { rep: [1, 0.5] }), 0, 0.2, 0, bed); box(2, 0.22, 1.02, mat('#f2efe8', { roughness: 0.95 }), 0, 0.48, 0, bed); box(1.3, 0.12, 1.06, mat('#2f5e86', { roughness: 0.95 }), 0.35, 0.62, 0, bed); box(0.45, 0.14, 0.7, mat('#ffffff', { roughness: 0.95 }), -0.72, 0.66, 0, bed); bed.position.set(-1.4, 0, 1.4); G.add(bed);
  // Schreibtisch, Skizzenbuch, Lampe
  table(G, 1.5, -1.85, 1.6, 0.7, 0.75); chair(G, 1.4, -1.2, PI, '#2f3a4a');
  const book = box(0.32, 0.03, 0.44, mat('#244a8a', { roughness: 0.7 }), 1.3, 0.8, -1.9, G); const pg = new T.Mesh(new T.PlaneGeometry(0.3, 0.42), mat('#faf6ee')); pg.rotation.x = -PI / 2; pg.position.set(1.66, 0.79, -1.85); G.add(pg);
  const lampM = cyl(0.02, 0.08, 0.4, mat('#222', { metalness: 0.6 }), 2.0, 0.97, -2.0, G, 10); bulb('#ffd9a0', 0.05, 2.0, 1.2, -1.95, G, 4);
  const desk = lamp('#ffcf8f', night ? 4 : 1.5, 6, 2.0, 1.25, -1.8, G, true);
  const ph = box(0.08, 0.01, 0.16, mat('#111'), 0.95, 0.785, -1.7, G); const scr = new T.Mesh(new T.PlaneGeometry(0.07, 0.14), new T.MeshBasicMaterial({ color: '#cfe4ff' })); scr.rotation.x = -PI / 2; scr.position.set(0.95, 0.792, -1.7); G.add(scr);
  shelf(G, 2.5, 0.8, -PI / 2, 1.4, 1.6);
  const p1 = sign('', 0.6, 0.85, { draw: (g, W, H) => g.drawImage(posterTex(256, 362).image, 0, 0, W, H) }); p1.position.set(-2.58, 1.6, -0.6); p1.rotation.y = PI / 2; G.add(p1);
  if (!night) lamp('#fff2dc', 3, 10, 0, 2.4, 0, G); else lamp('#7a8ab8', 0.8, 8, 0.8, 2, -1.8, G);
  return { indoor: true, spots: { finn: [1.1, -0.9, 0.5] }, bounds: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.3], camBox: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.2, h], solid: [{ x0: -2.5, x1: -0.3, z0: 0.8, z1: 2 }],
    sky: night ? 'indoorNight' : 'indoor', cam: { pos: [-0.9, 1.6, 1.5], look: [1.2, 1.2, -1.2] } };
};

SETS.aula = (G, o) => {
  const w = 26, d = 18, h = 7; room(G, w, d, h, mat('wallGreen', { rep: [4, 1.5] }), mat('planks', { rep: [4, 3], roughness: 0.55 }), { ceil: mat('#2a2a34', { roughness: 0.95 }) });
  box(14, 1, 5, mat('wood', { rep: [3, 1] }), 0, 0.5, -6.5, G); box(14.4, 6, 0.3, mat('#5a1830', { roughness: 0.9 }), 0, 4, -8.9, G);
  const p = sign('', 3.6, 5.1, { draw: (g, W, H) => g.drawImage(posterTex(512, 724).image, 0, 0, W, H) }); p.position.set(0, 4.1, -8.7); G.add(p);
  const spotP = new T.SpotLight('#fff0d0', 120, 20, 0.35, 0.5, 1); spotP.position.set(0, 6.5, -2); spotP.target = p; G.add(spotP);
  for (let i = -3; i <= 3; i++) stringLights(G, [-12.5, 6.4, -8 + (i + 3) * 2.6], [12.5, 6.4, -8 + (i + 3) * 2.6], 26, 0.7, ['#ffd27a', '#7ad0ff', '#ff8a7a']);
  // Papierwellen
  for (let i = 0; i < 10; i++) { const wv = new T.Mesh(new T.TorusGeometry(0.6, 0.05, 6, 24, PI), mat(['#2f7ad9', '#ffffff'][i % 2], { roughness: 0.9 })); wv.position.set(-11 + i * 2.4, 6.1, 8.6); G.add(wv); }
  for (let i = 0; i < 4; i++) { const wn = windowAt(G, i < 2 ? 'w' : 'e', w, d, -4 + (i % 2) * 6, 3, 2, 2.4, view('storm')); }
  table(G, 8, 3, 2, 0.8, 0.8, mat('#3a2a1e')); cyl(0.3, 0.3, 0.06, mat('#111', { roughness: 0.3 }), 8, 0.85, 3, G, 32);
  for (let i = 0; i < 4; i++) table(G, -8 + i * 0.1, -1 + i * 2.6, 1.6, 0.8, 1.05, mat('#e8e4dc'));
  lamp('#ffd9a0', 10, 22, -6, 5.5, 2, G); lamp('#a0c8ff', 6, 22, 6, 5.5, 2, G); const flash = lamp('#cfe0ff', 0, 40, -12, 3, -2, G);
  let next = 4;
  return { indoor: true, spots: { finn: [-1.2, 1, PI * 1.05], lotte: [-2.2, 1.4, PI * 0.85], ben: [3.5, 6.5, PI * 1.3], marlon: [-4.5, 7.5, PI * 0.8] }, bounds: [-w / 2 + 0.4, w / 2 - 0.4, -4, d / 2 - 0.4], camBox: [-w / 2 + 0.5, w / 2 - 0.5, -3.8, d / 2 - 0.3, h - 0.4],
    sky: 'indoorNight', cam: { pos: [1.5, 2.2, 6], look: [0, 2.6, -6] },
    tick: (dt, t) => { next -= dt; if (next < 0) { next = 5 + Math.random() * 6; flash.intensity = 60; } flash.intensity *= Math.pow(0.002, dt); } };
};

SETS.markt = (G, o) => {
  ground(80, 80, mat('snow', { rep: [1, 1], roughness: 0.9, bumpScale: 0.3 }), G);
  const stripes = cTex(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f4f0ea' : '#c42a2e'; g.fillRect(i * W / 8, 0, W / 8, H); } }, [1, 1]);
  const roofM = new T.MeshStandardMaterial({ map: stripes, roughness: 0.8 }), wood = mat('wood', { rep: [1, 1] });
  const booth = (x, z, ry, label, front) => {
    const b = new T.Group(); box(3.2, 2.6, 0.1, wood, 0, 1.3, -1.3, b); box(0.1, 2.6, 2.3, wood, -1.55, 1.3, -0.2, b); box(0.1, 2.6, 2.3, wood, 1.55, 1.3, -0.2, b); box(3.1, 0.05, 2.2, mat('planks', { rep: [1, 1] }), 0, 0.03, -0.2, b);
    for (let i = 0; i < 6; i++) { const f = fishMesh(i % 2 ? '#b8803e' : '#c69050'); f.rotation.x = PI; f.position.set(-1.1 + i * 0.44, 2.3, -1.15); b.add(f); } const r = new T.Mesh(new T.CylinderGeometry(0.01, 2.6, 1.1, 4, 1), roofM); r.rotation.y = PI / 4; r.scale.set(1.25, 1, 0.95); r.position.set(0, 3.15, -0.2); r.castShadow = true; b.add(r);
    box(3.2, 0.12, 0.3, mat('#f2f2f2', { roughness: 0.6 }), 0, 2.62, 1.0, b); // Schnee auf dem Dach-Rand
    box(3.0, 1.0, 0.5, mat('#6a3a22'), 0, 0.5, 1.0, b); box(3.1, 0.06, 0.6, mat('#d9cbb0'), 0, 1.03, 1.0, b);
    const s = sign(label, 2.2, 0.45, { bg: '#1b2c44', fg: '#ffe9b0', fs: 90, glow: 0.6 }); s.position.set(0, 2.3, 0.92); b.add(s);
    for (let i = 0; i < 7; i++) bulb('#ffcf6a', 0.045, -1.5 + i * 0.5, 2.5, 1.12, b, 5);
    if (front) lamp('#ffcf8f', 6, 7, 0, 2.2, 1.6, b);
    b.position.set(x, 0, z); b.rotation.y = ry; G.add(b); return b;
  };
  booth(0, -1, 0, 'ALBRECHT · FISCHBRÖTCHEN', true); booth(-6, -2, 0.35, 'Gebrannte Mandeln'); booth(6, -2, -0.35, 'Glühwein & Punsch'); booth(-10, 4, PI / 2.2, 'Kerzen'); booth(10, 4, -PI / 2.2, 'Holzspielzeug'); booth(-7, 11, PI * 0.8, 'Waffeln');
  // Tannenbaum
  const tr = new T.Group(); cyl(0.2, 0.3, 1.5, mat('#4a3426'), 0, 0.75, 0, tr, 10); for (let i = 0; i < 4; i++) { const c = new T.Mesh(new T.ConeGeometry(2.2 - i * 0.45, 2.2, 18), mat('#24563a', { roughness: 0.9 })); c.position.y = 2 + i * 1.3; c.rotation.z = (i % 2 - 0.5) * 0.06; c.castShadow = true; tr.add(c); }
  const rr = rnd(3); for (let i = 0; i < 60; i++) { const a = rr() * PI * 2, y = 1.6 + rr() * 5, rad = (2.2 - (y - 1.6) * 0.38) * 0.95; bulb(['#ffd27a', '#ff6a5a', '#7ad0ff'][i % 3], 0.06, Math.cos(a) * rad, y, Math.sin(a) * rad, tr, 4); }
  const star = new T.Mesh(new T.OctahedronGeometry(0.35), new T.MeshStandardMaterial({ color: '#ffe08a', emissive: '#ffd060', emissiveIntensity: 3 })); star.position.y = 7.3; tr.add(star); lamp('#ffd9a0', 6, 10, 0, 4, 0, tr);
  tr.position.set(0, 0, 8); tr.rotation.z = 0.04; G.add(tr);
  // Kutter mit Lichterketten am Kai
  const k = new T.Group(); const hull = new T.Mesh(new T.CylinderGeometry(1.6, 1.0, 7, 16, 1, false, 0, PI), mat('#1e3c5a', { roughness: 0.5 })); hull.rotation.set(0, 0, PI / 2); hull.rotation.x = PI / 2; hull.scale.set(1, 1, 0.6); k.add(hull); box(2, 1.4, 1.6, mat('#f2efe6'), 0.8, 0.9, 0, k); const mast = cyl(0.06, 0.06, 5, mat('#ddd'), -0.5, 2.6, 0, k, 8);
  for (let i = 0; i < 12; i++) bulb('#ffd27a', 0.05, -3.2 + i * 0.27, 0.6 + Math.sin(i / 11 * PI) * 4.4, 0, k, 5);
  k.position.set(16, 0.2, -12); k.rotation.y = 0.3; G.add(k);
  const sea = makeSea(200, 80, { color: '#0e2a40', amp: 0.12 }); sea.position.set(0, -0.8, -50); G.add(sea); box(80, 0.8, 1.2, mat('concrete', { rep: [20, 1] }), 0, -0.4, -10.5, G);
  stringLights(G, [-10, 4.5, -2], [10, 4.5, -2], 30, 0.8, ['#ffd27a']); stringLights(G, [-10, 4.5, 6], [10, 4.5, 6], 30, 0.8, ['#ffd27a', '#ff6a5a']);
  for (let i = 0; i < 4; i++) { const pl = cyl(0.06, 0.08, 4.6, mat('#2a2a2a', { metalness: 0.6 }), i < 2 ? -10 : 10, 2.3, i % 2 ? 6 : -2, G, 8); }
  return { spots: { finn: [0.4, -0.2, 0], joerg: [-0.8, -0.3, 0.2], ben: [3.5, 4.5, PI * 1.2], marlon: [-6, 9.5, PI * 0.8] }, bounds: [-14, 14, -9.8, 14], solid: [{ x0: -1.7, x1: 1.7, z0: -2.4, z1: -0.8 }, { x: 0, z: 8, r: 2.2 }],
    sky: 'winterNight', weather: 'snow', cam: { pos: [0.5, 2.0, 4.6], look: [0, 1.5, -0.5] }, counter: { z: 0.0 } };
};

// Kap Rotenhorn: Leuchtturm am Ursprung, Meer nach −Z, Dünenweg von +Z
SETS.kap = (G, o) => {
  const winter = o.winter !== false, gw = 160, gd = 120;
  const g = new T.PlaneGeometry(gw, gd, 120, 90); g.rotateX(-PI / 2); const p = g.attributes.position, r = rnd(21);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 40; const path = Math.exp(-Math.pow((x - Math.sin(z * 0.08) * 3) / 3.2, 2)); let y = (Math.sin(x * 0.11) * Math.cos(z * 0.09) * 1.6 + Math.sin(x * 0.27 + z * 0.19) * 0.6 + 1.2) * (1 - path * 0.92); if (z < 6) y *= Math.max(0, (z + 2) / 8); y = Math.max(0, y); p.setY(i, y); }
  g.computeVertexNormals(); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 20, uv.getY(i) * 15);
  const gm = new T.Mesh(g, mat(winter ? 'snow' : 'dune', { roughness: 0.9, bumpScale: 0.25 })); gm.position.z = 20 + gd / 2 - 60; gm.position.set(0, 0, 40); gm.receiveShadow = true; G.add(gm);
  ground(gw, 24, mat(winter ? 'snow' : 'sand', { rep: [1, 1], roughness: 0.9 }), G, 0.0).position.set(0, -0.02, -8);
  const sea = makeSea(500, 300, { color: '#173d57', amp: o.sea === 'storm' ? 0.9 : o.sea === 'rough' ? 0.55 : 0.3 }); sea.position.set(0, -0.6, -170); G.add(sea);
  const lh = lighthouse(16); G.add(lh);
  box(5, 2.4, 3.6, mat('#e9e4d8', { roughness: 0.9 }), 4.2, 1.2, 1.5, G); const roof = new T.Mesh(new T.ConeGeometry(3.4, 1.6, 4), mat('shingle', { rep: [2, 1] })); roof.rotation.y = PI / 4; roof.scale.set(1.05, 1, 0.75); roof.position.set(4.2, 3.2, 1.5); G.add(roof);
  // Felsen an der Küste
  const rock = mat('#4d4f52', { roughness: 0.95 }), rr = rnd(5);
  for (let i = 0; i < 26; i++) { const s = 0.6 + rr() * 2.2, m = new T.Mesh(new T.DodecahedronGeometry(s, 1), rock); m.position.set((rr() - 0.5) * 60, -0.3, -9 - rr() * 30 * (i % 3 ? 0.3 : 1)); m.scale.y = 0.6; m.rotation.set(rr(), rr(), rr()); m.castShadow = true; G.add(m); }
  // Dünengras (Halme)
  const blade = new T.ConeGeometry(0.03, 0.7, 3); blade.translate(0, 0.35, 0); const n = E.quality === 'spar' ? 900 : 2200; const im = new T.InstancedMesh(blade, mat(winter ? '#a99c74' : '#9aa060', { roughness: 0.9 }), n);
  const M = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(); for (let i = 0; i < n; i++) { const x = (rr() - 0.5) * 80, z = 6 + rr() * 60; if (Math.abs(x - Math.sin(z * 0.08) * 3) < 2.4) { i--; continue; } e.set((rr() - 0.5) * 0.5, rr() * 6, (rr() - 0.5) * 0.5); q.setFromEuler(e); M.compose(new T.Vector3(x, 0.2, z), q, new T.Vector3(1, 0.6 + rr(), 1)); im.setMatrixAt(i, M); }
  im.castShadow = false; G.add(im);
  // Zaunpfähle am Weg
  for (let i = 0; i < 18; i++) { const z = 6 + i * 3; cyl(0.05, 0.06, 1, mat('#5a4636'), Math.sin(z * 0.08) * 3 + 2.6, 0.5, z, G, 6); }
  const lightRig = new T.Group(); lightRig.position.y = lh.userData.top; G.add(lightRig);
  const cone = beamCone(70, 9, 0.2); lightRig.add(cone); cone.visible = !!o.beamOn;
  const beamL = new T.SpotLight('#ffe7a6', 0, 120, 0.12, 0.5, 1); beamL.position.set(0, 0, 0); const tgt = new T.Object3D(); tgt.position.set(0, -10, -60); lightRig.add(beamL, tgt); beamL.target = tgt;
  return { spots: { finn: [1.0, 36, PI], ben: [-0.4, 37, PI] }, bounds: [-22, 22, 2.6, 62], solid: [{ x: 0, z: 0, r: 2.2 }, { x0: 1.6, x1: 6.8, z0: -0.4, z1: 3.4 }],
    hot: [{ id: 'turm', x: 0, z: 3.4, r: 2.2, l: 'Leuchtturm Rotenhorn' }, { id: 'zaun', x: 3, z: 24, r: 1.5, l: 'Zaun ansehen', t: 'Schneezäune halten die Dünen fest. Damit der Wind nicht alles mitnimmt.' }],
    goalSpot: { turm: [0.5, 3.8, PI] }, sky: o.sky || 'snow', weather: winter ? 'snow' : null, cam: { pos: [6, 3, 44], look: [0, 4, 0] }, speed: 0.95, rig: lightRig, cone, beamL, sea, lh };
};

SETS.strand = (G, o) => {
  ground(160, 90, mat('sand', { rep: [1, 1], roughness: 0.95, bumpScale: 0.3 }), G).position.set(0, 0, 30);
  const sea = makeSea(400, 300, { color: '#24506a', amp: 0.18 }); sea.position.set(0, -0.35, -158); G.add(sea);
  // Dünen
  const r = rnd(8); for (let i = 0; i < 9; i++) { const d = new T.Mesh(new T.SphereGeometry(8 + r() * 6, 24, 12, 0, PI * 2, 0, PI / 2), mat('dune', { rep: [3, 2], roughness: 0.95 })); d.scale.y = 0.35; d.position.set(-50 + i * 13, -0.5, 30 + r() * 6); d.receiveShadow = true; G.add(d); }
  // Lagerfeuer
  const fire = new T.Group(); for (let i = 0; i < 6; i++) { const l = cyl(0.08, 0.1, 1.1, mat('#4a3424', { roughness: 0.95 }), 0, 0.15, 0, fire, 8); l.rotation.set(PI / 2 - 0.5, i * PI / 3, 0); l.position.set(Math.cos(i * PI / 3) * 0.2, 0.25, Math.sin(i * PI / 3) * 0.2); }
  for (let i = 0; i < 10; i++) { const s = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), mat('#6a6a68', { roughness: 0.9 })); s.position.set(Math.cos(i / 10 * PI * 2) * 0.75, 0.08, Math.sin(i / 10 * PI * 2) * 0.75); s.scale.y = 0.6; fire.add(s); }
  const fl = []; const fm = new T.MeshBasicMaterial({ color: '#ffb04a', transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 5; i++) { const c = new T.Mesh(new T.ConeGeometry(0.22 - i * 0.02, 0.9 - i * 0.08, 10, 1, true), fm); c.position.set((i - 2) * 0.08, 0.6, (i % 2) * 0.08); fire.add(c); fl.push(c); }
  const fireL = lamp('#ff9a4a', 16, 18, 0, 1.2, 0, fire, true); fire.position.set(0, 0, 5); G.add(fire);
  // Treibholztor, Kühlbox, Decken
  const dw = mat('#9a8670', { roughness: 0.95 }); cyl(0.08, 0.1, 2, dw, 6, 1, 1, G, 8); cyl(0.08, 0.1, 2, dw, 9, 1, 1, G, 8); const bar = cyl(0.07, 0.07, 3.1, dw, 7.5, 2, 1, G, 8); bar.rotation.z = PI / 2;
  box(0.7, 0.45, 0.45, mat('#2a7ad9', { roughness: 0.5 }), -2.5, 0.23, 6.5, G); box(0.72, 0.08, 0.47, mat('#ffffff'), -2.5, 0.48, 6.5, G);
  for (let i = 0; i < 3; i++) { const b = box(1.6, 0.02, 1.2, mat(['#c94a4a', '#3a6a9a', '#e8c24a'][i], { roughness: 0.95 }), Math.cos(i * 2.1) * 2.4, 0.01, 5 + Math.sin(i * 2.1) * 2.4, G); b.rotation.y = i; }
  box(0.5, 0.18, 0.5, mat('#e8dcc0'), 1.6, 0.1, 7.2, G);   // Kartoffelsalat
  // Leuchtturm Rotenhorn in der Ferne
  const lh = lighthouse(16); lh.position.set(-70, 0, -60); lh.scale.setScalar(1.3); G.add(lh);
  const rig = new T.Group(); rig.position.set(-70, lh.userData.top * 1.3, -60); G.add(rig); const cone = beamCone(120, 10, 0.16); rig.add(cone); cone.visible = !!o.beamOn;
  return { spots: { finn: [0.8, 7.4, PI * 0.9], ben: [1.9, 6.8, PI * 0.7], lotte: [-1.8, 6.6, PI * 1.25], samira: [7.3, 2.2, PI * 1.1], pia: [-0.8, 3.2, 0.2], tobi: [2.6, 8.8, PI * 0.95], mehmet: [-2.6, 4.2, PI * 1.6] }, bounds: [-30, 30, -5.5, 24], solid: [{ x: 0, z: 5, r: 0.9 }],
    hot: [{ id: 'wasser', x: 3, z: -4, r: 2.4, l: 'Ans Wasser' }, { id: 'feuer', x: 0, z: 6.2, r: 1.6, l: 'Am Feuer', t: 'Stockbrot, Marshmallows, eine Gitarre, die niemand spielen kann. Pia erzählt eine Gruselgeschichte über einen Leuchtturmwärter.' }],
    goalSpot: { wasser: [3, -3.6, PI * 1.15] }, sky: 'dusk', cam: { pos: [6, 2.2, 13], look: [0, 1.2, 4] }, rig, cone,
    tick: (dt, t) => { fl.forEach((c, i) => { c.scale.y = 0.8 + Math.sin(t * (9 + i * 2) + i) * 0.25; c.rotation.y = t * (1 + i * 0.3); }); fireL.intensity = 14 + Math.sin(t * 11) * 2 + Math.sin(t * 27) * 1.5; if (rig) rig.rotation.y = t * 0.9; } };
};

SETS.kueche = (G, o) => {
  const w = 12, d = 8, h = 2.7; room(G, w, d, h, mat('wallWarm', { rep: [2, 1] }), mat('tiles', { rep: [3, 2], roughness: 0.4, bumpScale: 0.3 }), { ceil: mat('#f2ece2') });
  // Trennwand zum Flur (rechts)
  box(0.15, h, 4.6, mat('plaster', { rep: [1, 1] }), 2.5, h / 2, -1.7, G);
  windowAt(G, 'n', w, d, -3.2, 1.6, 1.6, 1.2, view('golden'));
  // Küchenzeile + Herd
  box(4, 0.9, 0.62, mat('#e9e4da', { roughness: 0.5 }), -3.6, 0.45, -3.65, G); box(4.05, 0.05, 0.66, mat('wood', { rep: [2, 0.4], roughness: 0.4 }), -3.6, 0.92, -3.65, G);
  const herd = box(0.62, 0.92, 0.62, mat('#2a2a2e', { roughness: 0.4, metalness: 0.4 }), -1.25, 0.46, -3.65, G); for (let i = 0; i < 4; i++) cyl(0.09, 0.09, 0.01, mat('#111'), -1.4 + (i % 2) * 0.3, 0.93, -3.8 + Math.floor(i / 2) * 0.3, G, 16);
  const bowl = cyl(0.18, 0.12, 0.12, mat('#f2f2f2', { roughness: 0.3 }), -1.3, 0.99, -3.6, G, 20); cyl(0.17, 0.17, 0.02, mat('#e8d79a'), -1.3, 1.05, -3.6, G, 20);
  box(4, 0.7, 0.35, mat('#e9e4da', { roughness: 0.5 }), -3.6, 1.95, -3.8, G);
  // Esstisch
  table(G, -2.2, -0.4, 2, 1.1, 0.76); for (let i = 0; i < 4; i++) chair(G, -2.9 + (i % 2) * 1.4, i < 2 ? -1.15 : 0.35, i < 2 ? 0 : PI, '#7a5a3a');
  for (let i = 0; i < 4; i++) cyl(0.12, 0.1, 0.02, mat('#ffffff', { roughness: 0.3 }), -2.7 + (i % 2) * 1, 0.8, -0.65 + Math.floor(i / 2) * 0.5, G, 20);
  box(0.08, 0.01, 0.16, mat('#111'), -2.0, 0.795, -0.3, G);
  const pend = bulb('#ffd9a0', 0.12, -2.2, 1.95, -0.4, G, 3); cyl(0.005, 0.005, 0.75, mat('#222'), -2.2, 2.33, -0.4, G, 4); lamp('#ffcf8f', 6, 8, -2.2, 1.9, -0.4, G, true);
  shelf(G, -5.75, 1.6, PI / 2, 2.2, 2);
  // Flur: Spiegel, Badtür, Schreibecke mit Mappe
  const mir = new T.Mesh(new T.PlaneGeometry(0.7, 1.4), new T.MeshStandardMaterial({ color: '#cfd8e0', metalness: 1, roughness: 0.05 })); mir.position.set(5.95, 1.5, -1.6); mir.rotation.y = -PI / 2; G.add(mir); box(0.04, 1.5, 0.8, mat('#3a2a20'), 5.98, 1.5, -1.6, G, false);
  box(0.9, 2.05, 0.05, mat('#f2efe8', { roughness: 0.6 }), 4.2, 1.03, -3.97, G); cyl(0.03, 0.03, 0.12, mat('#bbb', { metalness: 0.9 }), 4.55, 1.0, -3.92, G, 8);
  const sg = sign('BAD', 0.3, 0.12, { bg: '#2f5a7a', fg: '#fff', fs: 70 }); sg.position.set(4.2, 1.75, -3.94); G.add(sg);
  table(G, 4.2, 2.8, 1.4, 0.6, 0.75); box(0.36, 0.04, 0.48, mat('#244a8a'), 4.1, 0.8, 2.8, G);
  lamp('#fff2dc', 4, 10, 4.2, 2.5, 0, G); lamp('#fff2dc', 3, 10, -3, 2.5, 2, G);
  return { indoor: true, spots: { pia: [0, 2.6, PI], finn: [-1.5, 0.8, PI] }, bounds: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.3], camBox: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.2, h - 0.15],
    solid: [{ x0: -5.6, x1: -0.9, z0: -4, z1: -3.3 }, { x0: -3.3, x1: -1.1, z0: -1, z1: 0.2 }, { x0: 2.4, x1: 2.6, z0: -4, z1: 0.6 }, { x0: 3.5, x1: 4.9, z0: 2.5, z1: 3.1 }, { x0: -6, x1: -5.4, z0: 0.5, z1: 2.7 }],
    hot: [{ id: 'tisch', x: -2.2, z: 0.6, r: 1.3 }, { id: 'herd', x: -1.3, z: -2.9, r: 1.2 }, { id: 'flur', x: 4.2, z: -3.2, r: 1.2 }, { id: 'spiegel', x: 5.3, z: -1.6, r: 1.2 }, { id: 'regal', x: -5.1, z: 1.6, r: 1.3 }, { id: 'mappe', x: 4.2, z: 2.1, r: 1.2 }],
    sky: 'indoor', cam: { pos: [1.5, 1.8, 3.2], look: [-1, 1.1, -1] } };
};

SETS.garage = (G, o) => {
  const w = 7, d = 7, h = 2.8; room(G, w, d, h, mat('concrete', { rep: [2, 1] }), mat('concrete', { rep: [2, 2], roughness: 0.85 }), { noS: true, ceil: mat('#9a9894') });
  const wb = new T.Group(); box(2.6, 0.08, 0.7, mat('wood', { rep: [2, 0.5] }), 0, 0.9, 0, wb); box(2.5, 0.85, 0.65, mat('#4a5560', { metalness: 0.4, roughness: 0.5 }), 0, 0.43, 0, wb); box(2.6, 1.0, 0.04, mat('#c8b48a', { roughness: 0.9 }), 0, 1.7, -0.33, wb);
  for (let i = 0; i < 9; i++) box(0.04, 0.2 + (i % 3) * 0.08, 0.02, mat('#888', { metalness: 0.8, roughness: 0.3 }), -1.1 + i * 0.27, 1.75, -0.3, wb);
  wb.position.set(-1.2, 0, -3.1); G.add(wb);
  const bk = bike(G, 1.6, -1.2, 0.4, '#d9d2c4'); bk.rotation.z = PI; bk.position.y = 1.15;
  box(1.2, 0.5, 0.5, mat('#c94a3a'), 2.6, 0.25, -3.1, G); shelf(G, 3.25, 0.8, -PI / 2, 2, 2.2);
  const tube = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.4, 8), new T.MeshBasicMaterial({ color: '#e8f4ff' })); tube.rotation.z = PI / 2; tube.position.set(0, h - 0.1, -1); G.add(tube);
  lamp('#dfeeff', 9, 12, 0, h - 0.3, -1, G, true);
  ground(30, 20, mat('asphalt', { rep: [1, 1] }), G, -0.01).position.set(0, -0.01, 12);
  return { indoor: true, spots: { ben: [0.5, 2.6, PI], marek: [-1.0, -2.3, PI * 0.15] }, bounds: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 + 1], camBox: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 + 2.5, h - 0.15],
    solid: [{ x0: -2.6, x1: 0.2, z0: -3.5, z1: -2.7 }, { x: 1.6, z: -1.2, r: 0.7 }, { x0: 2, x1: 3.5, z0: -3.5, z1: -2.8 }], hot: [{ id: 'werkbank', x: -0.6, z: -2.1, r: 1.3, l: 'Zu Papa' }], goalSpot: { werkbank: [-0.2, -1.6, PI * 1.1] },
    sky: 'indoorNight', bg: '#0b1020', cam: { pos: [2.7, 1.7, 4.4], look: [-0.5, 1.2, -1.5] } };
};

SETS.kabine = (G, o) => {
  const w = 10, d = 7, h = 3; room(G, w, d, h, mat('tiles', { rep: [3, 1], roughness: 0.4 }), mat('tiles', { rep: [3, 2], roughness: 0.35 }), { ceil: mat('#e6e6e6') });
  for (let i = 0; i < 12; i++) { const lk = new T.Group(); box(0.6, 2, 0.5, mat(i % 2 ? '#2f6a4a' : '#357a54', { roughness: 0.45, metalness: 0.3 }), 0, 1, 0, lk); for (let k = 0; k < 4; k++) box(0.3, 0.02, 0.01, mat('#1a3a28'), 0, 1.7 + k * 0.05, 0.26, lk, false); lk.position.set(-3.3 + i * 0.6, 0, -3.2); G.add(lk); }
  for (let i = 0; i < 2; i++) { box(4, 0.06, 0.4, mat('wood', { rep: [2, 0.3] }), -1.5 + i * 3, 0.45, -1.6 + i * 3.4, G); box(0.05, 0.45, 0.3, mat('#555'), -3.3 + i * 3, 0.22, -1.6 + i * 3.4, G); box(0.05, 0.45, 0.3, mat('#555'), 0.3 + i * 3, 0.22, -1.6 + i * 3.4, G); }
  for (let i = 0; i < 5; i++) { const sh = new T.Mesh(new T.PlaneGeometry(0.55, 0.7), mat('#1f5a3a', { roughness: 0.9, side: T.DoubleSide })); sh.position.set(-4.95, 1.6, -2 + i * 0.9); sh.rotation.y = PI / 2; G.add(sh); const nr = sign(String(4 + i * 3), 0.25, 0.25, { bg: '#1f5a3a', fg: '#fff', fs: 400 }); nr.position.set(-4.94, 1.6, -2 + i * 0.9); nr.rotation.y = PI / 2; G.add(nr); }
  const tf = sign('TSS WARNHOLM · HANDBALL', 4, 0.5, { bg: '#ffffff', fg: '#1f5a3a' }); tf.position.set(1.8, 2.5, -3.47); G.add(tf);
  for (let i = 0; i < 3; i++) { const p = new T.Mesh(new T.PlaneGeometry(2, 0.25), new T.MeshBasicMaterial({ color: '#ffffff' })); p.rotation.x = PI / 2; p.position.set(-3 + i * 3, h - 0.02, 0); G.add(p); }
  lamp('#f2f6ff', 8, 14, -2, h - 0.2, 0, G, true); lamp('#f2f6ff', 6, 14, 3, h - 0.2, 0, G);
  return { indoor: true, spots: { ben: [0.5, 0.2, 0], samira: [-1.8, -1.1, 0.4], mehmet: [2.2, -1.0, -0.4], jannik: [3.4, 0.6, -1.0], tobi: [-3.8, 2.2, 0.9] }, bounds: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.3], camBox: [-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.2, h - 0.15],
    sky: 'indoor', cam: { pos: [0.6, 1.8, 3.1], look: [0.4, 1.3, -1.5] } };
};
