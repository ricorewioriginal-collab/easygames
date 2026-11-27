/* Neue Menschen für Pride City: Sketchfab-Modelle (CC BY, siehe public/CREDITS.md) bekommen das Rocketbox-Skelett „Bip01 …“,
   damit alle vorhandenen Animationen (Laufen, Tanzen, Sitzen …), Muskeln, Outfits, Umarmungen und der Sport-Körper weiter passen.
   Die Modelle kommen ohne Skelett. Dieses Skript
   1. legt das Skelett einer Rocketbox-Vorlage (gleiches Geschlecht) in das Modell: Gelenke werden an die Körperform angepasst
      (Schwerpunkte der Körperteile), Arme in die Haltung des Modells (A-, T-Pose oder hängend) gedreht,
   2. überträgt die Hautgewichte von der passend gestellten Vorlage (nächste Punkte, Finger → Hand, Gesicht → Kopf),
   3. teilt jede Figur in Körper (Material „<id>_body“) und Kopf („<id>_head“), wie es Actor.ts, outfit.ts und koerper.ts erwarten,
   4. verkleinert Geometrie (meshoptimizer) und Texturen (Farbe 1024 px JPEG, Normalen 512 px) und schreibt public/assets/rb/<id>.glb.
   Nur bei Bedarf ausführen (Ergebnis liegt im Repo):  node scripts/people.mjs <Ordner mit den Sketchfab-GLBs> [id]
   Vorlagen (Skelett und Hautgewichte): Male_Adult_01.glb und Female_Adult_01.glb aus `node scripts/rocketbox.mjs Adult_01`,
   Ordner per RB_TEMPLATES=<Ordner> angeben (sonst public/assets/rb).  */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { MODELS } from './people-models.mjs';

const OUT = new URL('../public/assets/rb/', import.meta.url);
const SRC = process.argv[2] || '.';
const ONLY = process.argv[3];

/* ---------------- Mathe (Spalten-Matrizen wie glTF) ---------------- */
const mul = (a, b) => { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; };
function inv(m) {
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  const d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  return [(a11 * b11 - a12 * b10 + a13 * b09) * d, (a02 * b10 - a01 * b11 - a03 * b09) * d, (a31 * b05 - a32 * b04 + a33 * b03) * d, (a22 * b04 - a21 * b05 - a23 * b03) * d,
    (a12 * b08 - a10 * b11 - a13 * b07) * d, (a00 * b11 - a02 * b08 + a03 * b07) * d, (a32 * b02 - a30 * b05 - a33 * b01) * d, (a20 * b05 - a22 * b02 + a23 * b01) * d,
    (a10 * b10 - a11 * b08 + a13 * b06) * d, (a01 * b08 - a00 * b10 - a03 * b06) * d, (a30 * b04 - a31 * b02 + a33 * b00) * d, (a21 * b02 - a20 * b04 - a23 * b00) * d,
    (a11 * b07 - a10 * b09 - a12 * b06) * d, (a00 * b09 - a01 * b07 + a02 * b06) * d, (a31 * b01 - a30 * b03 - a32 * b00) * d, (a20 * b03 - a21 * b01 + a22 * b00) * d];
}
const xf = (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
const xd = (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z];
function trs(t, q, s = [1, 1, 1]) {
  const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  return [(1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0, (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0, (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0, t[0], t[1], t[2], 1];
}
const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qinv = (q) => [-q[0], -q[1], -q[2], q[3]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], scl = (a, k) => a.map((x) => x * k);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function qFromTo(a, b) {
  a = norm(a); b = norm(b); const d = dot(a, b);
  if (d < -0.9999) { const ax = norm(Math.abs(a[0]) < .9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0])); return [...ax, 0]; }
  const c = cross(a, b); return norm([c[0], c[1], c[2], 1 + d]);
}
/** Rotationsanteil einer Matrix als Quaternion (ohne Skalierung) */
function mquat(m) {
  const sx = Math.hypot(m[0], m[1], m[2]), sy = Math.hypot(m[4], m[5], m[6]), sz = Math.hypot(m[8], m[9], m[10]);
  const r = [m[0] / sx, m[1] / sx, m[2] / sx, m[4] / sy, m[5] / sy, m[6] / sy, m[8] / sz, m[9] / sz, m[10] / sz];
  const tr = r[0] + r[4] + r[8]; let q;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [(r[5] - r[7]) / s, (r[6] - r[2]) / s, (r[1] - r[3]) / s, .25 * s]; }
  else if (r[0] > r[4] && r[0] > r[8]) { const s = Math.sqrt(1 + r[0] - r[4] - r[8]) * 2; q = [.25 * s, (r[1] + r[3]) / s, (r[6] + r[2]) / s, (r[5] - r[7]) / s]; }
  else if (r[4] > r[8]) { const s = Math.sqrt(1 + r[4] - r[0] - r[8]) * 2; q = [(r[1] + r[3]) / s, .25 * s, (r[5] + r[7]) / s, (r[6] - r[2]) / s]; }
  else { const s = Math.sqrt(1 + r[8] - r[0] - r[4]) * 2; q = [(r[6] + r[2]) / s, (r[5] + r[7]) / s, .25 * s, (r[1] - r[3]) / s]; }
  return norm(q);
}

/* ---------------- Vorlage (Rocketbox) ---------------- */
/** Knochen, deren Lage an die Körperform angepasst wird; Hauptkind = Richtung des Knochens */
const AIM = {
  'Bip01 L Clavicle': 'Bip01 L UpperArm', 'Bip01 L UpperArm': 'Bip01 L Forearm', 'Bip01 L Forearm': 'Bip01 L Hand',
  'Bip01 R Clavicle': 'Bip01 R UpperArm', 'Bip01 R UpperArm': 'Bip01 R Forearm', 'Bip01 R Forearm': 'Bip01 R Hand',
  'Bip01 L Thigh': 'Bip01 L Calf', 'Bip01 L Calf': 'Bip01 L Foot', 'Bip01 R Thigh': 'Bip01 R Calf', 'Bip01 R Calf': 'Bip01 R Foot',
};
/** Rumpf und Kopf werden nur verschoben, nicht gedreht: so bewegen sich Ausschnitt, Hals und Kragen wie bei der Vorlage */
const FIT = new Set([...Object.keys(AIM), ...Object.values(AIM), 'Bip01 Pelvis', 'Bip01 Spine', 'Bip01 Spine1', 'Bip01 Spine2', 'Bip01 Neck', 'Bip01 Head']);
/** Gewichte zusammenfassen: Finger → Hand, Gesicht → Kopf, Zehen → Fuß (die neuen Modelle haben keine Finger/Gesichtsgeometrie dafür) */
const collapse = (n) => {
  if (/Finger/.test(n)) return n.replace(/Finger\d+/, 'Hand');
  if (/Toe0/.test(n)) return n.replace('Toe0', 'Foot');
  if (/^Bip01 (L|R|M)(?![ ])/.test(n)) return 'Bip01 Head';
  return n;
};

function loadRef(doc) {
  const root = doc.getRoot(), skin = root.listSkins()[0], joints = skin.listJoints(), ibm = skin.getInverseBindMatrices().getArray();
  // Knotenbaum ab RootNode
  const nodes = []; const idx = new Map();
  const top = root.listScenes()[0].listChildren()[0]; // RootNode
  const walk = (n, parent) => { if (n.getMesh()) return; const i = nodes.length; idx.set(n.getName(), i); nodes.push({ name: n.getName(), parent, t: n.getTranslation(), q: n.getRotation(), s: n.getScale(), kids: [] }); if (parent >= 0) nodes[parent].kids.push(i); n.listChildren().forEach((c) => walk(c, i)); };
  top.listChildren().forEach((c) => walk(c, -1));
  const world = fk(nodes, nodes.map((n) => n.q), nodes.map((n) => n.t));
  // Vorlage-Haut (Körper + Kopf, ohne Haarsträhnen) in Ruhepose, Y oben
  const V = [], N = [], W = [];
  const mesh = root.listMeshes()[0];
  for (const p of mesh.listPrimitives()) {
    if (!/_(body|head)$/.test(p.getMaterial()?.getName() || '')) continue;
    const pos = p.getAttribute('POSITION'), nor = p.getAttribute('NORMAL'), jo = p.getAttribute('JOINTS_0'), we = p.getAttribute('WEIGHTS_0');
    const a = [], b = [], c = [], d = [];
    for (let v = 0; v < pos.getCount(); v++) {
      pos.getElement(v, a); nor.getElement(v, b); jo.getElement(v, c); we.getElement(v, d);
      const w = new Map(); let P = [0, 0, 0], Nn = [0, 0, 0];
      for (let k = 0; k < 4; k++) {
        if (d[k] <= 0) continue;
        const j = c[k], m = mul(world[idx.get(joints[j].getName())], Array.from(ibm.slice(j * 16, j * 16 + 16)));
        P = add(P, scl(xf(m, ...a), d[k])); Nn = add(Nn, scl(xd(m, ...b), d[k]));
        const name = collapse(joints[j].getName()); w.set(name, (w.get(name) || 0) + d[k]);
      }
      V.push(P); N.push(norm(Nn)); W.push(w);
    }
  }
  // Rest-Weltlage über die Bindung: Vertex in Ruhe = W_j * IBM_j * v  →  Bind-Welt der Vorlage
  const bindWorld = nodes.map((n, i) => world[i]);
  return { nodes, idx, world: bindWorld, V, N, W, joints: joints.map((j) => j.getName()), root };
}
function fk(nodes, q, t) {
  const w = new Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) { const l = trs(t[i], q[i], nodes[i].s); w[i] = nodes[i].parent >= 0 ? mul(w[nodes[i].parent], l) : l; }
  return w;
}
/** Vorlage-Haut in eine neue Stellung bringen (jeder Punkt folgt seinem Knochen starr: P_neu = Welt_neu * Welt_alt⁻¹ * P) */
function poseRef(ref, worldNew) {
  const delta = new Map();
  for (const [name, i] of ref.idx) delta.set(name, mul(worldNew[i], inv(ref.world[i])));
  const N = [];
  const V = ref.V.map((p, v) => { let o = [0, 0, 0], q = [0, 0, 0], s = 0; for (const [n, w] of ref.W[v]) { const d = delta.get(n); o = add(o, scl(xf(d, ...p), w)); q = add(q, scl(xd(d, ...ref.N[v]), w)); s += w; } N.push(norm(q)); return scl(o, 1 / (s || 1)); });
  return { V, N };
}

/* ---------------- Zielmodell ---------------- */
async function loadTarget(io, file, pick) {
  const doc = await io.read(file), root = doc.getRoot();
  const parts = [];
  root.listScenes()[0].traverse((n) => {
    const m = n.getMesh(); if (!m) return;
    if (pick && !pick(n)) return;
    const wm = n.getWorldMatrix();
    for (const p of m.listPrimitives()) parts.push({ node: n, prim: p, wm });
  });
  return { doc, parts };
}

/* Gewichte übertragen: je Zielpunkt die nächsten Vorlage-Punkte (gleiche Normalen-Richtung bevorzugt) */
function transfer(T, TN, RV, RN, RW, k = 6) {
  // Gitter für schnelle Suche
  const cell = .04, grid = new Map(), key = (x, y, z) => x + ',' + y + ',' + z;
  RV.forEach((p, i) => { const kk = key(Math.floor(p[0] / cell), Math.floor(p[1] / cell), Math.floor(p[2] / cell)); let g = grid.get(kk); if (!g) grid.set(kk, (g = [])); g.push(i); });
  const out = [];
  for (let v = 0; v < T.length; v++) {
    const p = T[v], cx = Math.floor(p[0] / cell), cy = Math.floor(p[1] / cell), cz = Math.floor(p[2] / cell);
    let best = [];
    for (let r = 1; r <= 12 && best.length < k; r += r < 3 ? 1 : 3) {
      best = [];
      for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) for (let z = cz - r; z <= cz + r; z++) {
        const g = grid.get(key(x, y, z)); if (!g) continue;
        for (const i of g) { const q = RV[i], d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2; const pen = dot(RN[i], TN[v]) < 0 ? 4 : 1; best.push([d * pen, i]); }
      }
    }
    best.sort((a, b) => a[0] - b[0]); best = best.slice(0, k);
    const w = new Map(); let s = 0;
    for (const [d, i] of best) { const f = 1 / (d + 1e-6); s += f; for (const [n, x] of RW[i]) w.set(n, (w.get(n) || 0) + x * f); }
    for (const [n, x] of w) w.set(n, x / s);
    out.push(w);
  }
  return out;
}
const centroids = (P, W) => {
  const c = new Map();
  P.forEach((p, v) => { for (const [n, w] of W[v]) { if (w < .5) continue; let e = c.get(n); if (!e) c.set(n, (e = [0, 0, 0, 0])); e[0] += p[0] * w; e[1] += p[1] * w; e[2] += p[2] * w; e[3] += w; } });
  return c;
};

/* ---------------- Rigging ---------------- */
function rig(ref, T, TN, opt) {
  const { nodes, idx } = ref;
  const ip = (n) => idx.get(n);
  // Zielpositionen der Gelenke (Welt), Start: Vorlage
  let want = ref.world.map((m) => [m[12], m[13], m[14]]);
  // Arme in die Haltung des Modells drehen (Winkel unter der Waagerechten)
  for (const side of ['L', 'R']) {
    const sh = want[ip(`Bip01 ${side} UpperArm`)], el = want[ip(`Bip01 ${side} Forearm`)];
    const cur = Math.atan2(-(el[1] - sh[1]), Math.abs(el[0] - sh[0])) * 180 / Math.PI;
    const d = (cur - opt.arm) * Math.PI / 180 * (side === 'L' ? 1 : -1), c = Math.cos(d), s = Math.sin(d);
    const sub2 = [];
    const coll = (i) => { sub2.push(i); nodes[i].kids.forEach(coll); };
    coll(ip(`Bip01 ${side} Forearm`));
    for (const i of sub2) { const r = sub(want[i], sh); want[i] = [sh[0] + r[0] * c - r[1] * s, sh[1] + r[0] * s + r[1] * c, sh[2] + r[2]]; }
  }
  const init = want.map((p) => p.slice());
  let pose = solve(ref, want);
  let W = null;
  const pelvisY = ref.world[ip('Bip01 Pelvis')][13];
  for (let it = 0; it < opt.iter; it++) {
    const { V: RV, N: RN } = poseRef(ref, pose.world);
    W = transfer(T, TN, RV, RN, ref.W);
    const ct = centroids(T, W), cr = centroids(RV, ref.W);
    want = pose.world.map((m) => [m[12], m[13], m[14]]);
    const moved = new Map();
    for (const n of FIT) {
      const a = ct.get(collapse(n)), b = cr.get(collapse(n)); if (!a || !b || a[3] < 3 || b[3] < 3) continue;
      const dlt = scl(sub(scl(a, 1 / a[3]).slice(0, 3), scl(b, 1 / b[3]).slice(0, 3)), opt.damp);
      if (/Spine|Pelvis|Neck|Head/.test(n)) dlt[0] = 0; // Mitte bleibt in der Mitte
      if (/Pelvis|Thigh/.test(n)) dlt[1] = 0;            // Hüfthöhe bleibt (Animationen setzen das Becken auf Vorlagenhöhe)
      if (/Neck|Head/.test(n)) continue;                  // Kopf: Haare verschieben den Schwerpunkt, Lage wie Vorlage
      moved.set(n, dlt);
    }
    // Gelenk zwischen zwei Teilen: Mittel aus beiden Verschiebungen (Eltern-Teil und eigenes Teil)
    for (const n of FIT) {
      const own = moved.get(n), par = nodes[ip(n)].parent >= 0 ? moved.get(nodes[nodes[ip(n)].parent].name) : null;
      const d = own && par ? scl(add(own, par), .5) : own || par; if (!d) continue;
      const i = ip(n);
      const shift = (j) => { want[j] = add(want[j], d); nodes[j].kids.forEach((k) => { if (!FIT.has(nodes[k].name)) shift(k); }); };
      shift(i);
    }
    // nie weit von der Vorlage weg (Schwerpunkte täuschen bei weiter Kleidung, langen Haaren und groben Netzen)
    for (let i = 0; i < want.length; i++) { const d = sub(want[i], init[i]), l = Math.hypot(...d), mx = opt.maxMove; if (l > mx) want[i] = add(init[i], scl(d, mx / l)); }
    // links/rechts gleich halten
    for (const n of FIT) if (/ L /.test(n)) { const r = n.replace(' L ', ' R '), a = want[ip(n)], b = want[ip(r)]; const x = (a[0] - b[0]) / 2, y = (a[1] + b[1]) / 2, z = (a[2] + b[2]) / 2; want[ip(n)] = [x, y, z]; want[ip(r)] = [-x, y, z]; }
    pose = solve(ref, want);
  }
  const fin = poseRef(ref, pose.world);
  W = transfer(T, TN, fin.V, fin.N, ref.W);
  // Rumpf-Punkte unterhalb der Schulter tragen keine Arm-Gewichte (sonst beulen hängende Arme die Brust aus):
  // Abstand zu Knochen-Strecken, geteilt durch die typische Dicke (Rumpf ~13 cm, Arm ~5,5 cm)
  const J = (n) => { const m = pose.world[ip(n)]; return [m[12], m[13], m[14]]; };
  const segD = (p, a, b) => { const ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1))); return Math.hypot(...sub(p, add(a, scl(ab, t)))); };
  const torso = [J('Bip01 Pelvis'), J('Bip01 Spine1'), J('Bip01 Spine2'), J('Bip01 Neck')];
  for (const side of ['L', 'R']) {
    const u = J(`Bip01 ${side} UpperArm`), f = J(`Bip01 ${side} Forearm`), h = J(`Bip01 ${side} Hand`), tip = add(h, scl(sub(h, f), .45));
    const armRe = new RegExp(`Bip01 ${side} (UpperArm|Forearm|Hand)`);
    T.forEach((p, v) => {
      const w = W[v]; let a = 0; for (const [n, x] of w) if (armRe.test(n)) a += x;
      if (a <= 0 || a >= .999 || (p[1] > u[1] - .04 && Math.abs(p[0]) > Math.abs(u[0]) * .75)) return;
      const dT = Math.min(segD(p, torso[0], torso[1]), segD(p, torso[1], torso[2]), segD(p, torso[2], torso[3])) / .13;
      const dA = Math.min(segD(p, u, f), segD(p, f, h), segD(p, h, tip)) / .055;
      if (dT < dA) { const o = new Map(); let s = 0; for (const [n, x] of w) if (!armRe.test(n)) { o.set(n, x); s += x; } if (s > .05) { for (const [n, x] of o) o.set(n, x / s); W[v] = o; } }
    });
  }
  // räumlich glätten (alle Teile zusammen): übereinanderliegende Lagen (Ausschnitt über Haut, Kragen über Hals) bewegen sich gleich
  for (let pass = 0; pass < 2; pass++) {
    const cell = .025, grid = new Map(), key = (x, y, z) => x + ',' + y + ',' + z;
    T.forEach((p, v) => { const k = key(Math.floor(p[0] / cell), Math.floor(p[1] / cell), Math.floor(p[2] / cell)); let g = grid.get(k); if (!g) grid.set(k, (g = [])); g.push(v); });
    const nw = T.map((p, v) => {
      const cx = Math.floor(p[0] / cell), cy = Math.floor(p[1] / cell), cz = Math.floor(p[2] / cell), w = new Map(); let s = 0;
      for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) {
        const g = grid.get(key(x, y, z)); if (!g) continue;
        for (const u of g) { const d = Math.hypot(...sub(T[u], p)); if (d > cell) continue; const f = 1 - d / cell * .7; s += f; for (const [n, x2] of W[u]) w.set(n, (w.get(n) || 0) + x2 * f); }
      }
      for (const [n, x2] of w) w.set(n, x2 / s);
      return w;
    });
    for (let v = 0; v < T.length; v++) W[v] = nw[v];
  }
  // gleiche Lage = gleiche Gewichte (UV-Nähte, Grenze Kopf/Körper): sonst reißt die Figur dort auf
  const groups = new Map();
  T.forEach((p, v) => { const k = p.map((x) => Math.round(x * 500)).join(','); let g = groups.get(k); if (!g) groups.set(k, (g = [])); g.push(v); });
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const w = new Map(); for (const v of g) for (const [n, x] of W[v]) w.set(n, (w.get(n) || 0) + x / g.length);
    for (const v of g) W[v] = new Map(w);
  }
  return { pose, W };
}
/** Stellung aus Wunschpositionen: Knochen auf ihr Hauptkind ausrichten, Kinder an ihre Wunschposition hängen */
function solve(ref, want) {
  const { nodes, idx } = ref, n = nodes.length;
  const wq = new Array(n), wt = new Array(n), world = new Array(n), local = new Array(n);
  for (let i = 0; i < n; i++) {
    const nd = nodes[i], par = nd.parent;
    const pw = par >= 0 ? world[par] : null;
    // Lage: frei (in Elternrahmen) für angepasste Gelenke, sonst Vorlage
    let t = nd.t;
    if (pw && (FIT.has(nd.name) || FIT.has(nodes[par].name))) t = xf(inv(pw), ...want[i]);
    else if (pw && !FIT.has(nd.name)) t = nd.t;
    let q = nd.q;
    let w = pw ? mul(pw, trs(t, q, nd.s)) : trs(t, q, nd.s);
    const aim = AIM[nd.name];
    if (aim) {
      const c = idx.get(aim), refLocalT = nodes[c].t;
      const dirNow = xd(w, ...refLocalT), dirWant = sub(want[c], [w[12], w[13], w[14]]);
      const rq = qFromTo(dirNow, dirWant);
      const pq = pw ? mquat(pw) : [0, 0, 0, 1];
      const wq0 = qmul(pq, q), wq1 = qmul(rq, wq0);
      q = norm(qmul(qinv(pq), wq1));
      w = pw ? mul(pw, trs(t, q, nd.s)) : trs(t, q, nd.s);
    }
    if (/^Bip01 (Head|L Foot|R Foot)$/.test(nd.name)) {
      const pq = mquat(pw), rw = mquat(ref.world[i]);
      q = norm(qmul(qinv(pq), rw));
      w = mul(pw, trs(t, q, nd.s));
    }
    world[i] = w; local[i] = { t, q };
  }
  return { world, local };
}

/* ---------------- Ausgabe ---------------- */
const imgCache = new Map();
function decode(img, mime) {
  if (mime === 'image/png') { const p = PNG.sync.read(Buffer.from(img)); return { w: p.width, h: p.height, px: p.data }; }
  const j = jpeg.decode(Buffer.from(img), { useTArray: true, formatAsRGBA: true }); return { w: j.width, h: j.height, px: Buffer.from(j.data) };
}
function shrink(img, size) {
  let { w, h, px } = img;
  while (w > size) {
    const nw = w >> 1, nh = h >> 1, o = Buffer.alloc(nw * nh * 4);
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) for (let c = 0; c < 4; c++) { const a = ((y * 2) * w + x * 2) * 4 + c, b2 = a + w * 4; o[(y * nw + x) * 4 + c] = (px[a] + px[a + 4] + px[b2] + px[b2 + 4] + 2) >> 2; }
    w = nw; h = nh; px = o;
  }
  return { w, h, px };
}
const hasAlpha = (img) => { for (let i = 3; i < img.px.length; i += 4) if (img.px[i] < 250) return true; return false; };

export async function build(io, m, refs) {
  const tgt = await loadTarget(io, SRC + '/' + m.file, m.pick);
  const ref = refs[m.ref || m.g], hRef = refs[m.g];
  // Punkte sammeln (Welt, Y oben), Ausrichtung: Gesicht nach +Z, links bei +X
  const yaw = (m.yaw || 0) * Math.PI / 180, cy = Math.cos(yaw), sy = Math.sin(yaw);
  const T = [], TN = [], parts = [];
  for (const { prim, wm } of tgt.parts) {
    const pos = prim.getAttribute('POSITION'), nor = prim.getAttribute('NORMAL'), uv = prim.getAttribute('TEXCOORD_0');
    const start = T.length, a = [], b = [];
    for (let v = 0; v < pos.getCount(); v++) {
      pos.getElement(v, a); const p = xf(wm, ...a); T.push([p[0] * cy + p[2] * sy, p[1], -p[0] * sy + p[2] * cy]);
      if (nor) { nor.getElement(v, b); const n = norm(xd(wm, ...b)); TN.push([n[0] * cy + n[2] * sy, n[1], -n[0] * sy + n[2] * cy]); } else TN.push([0, 1, 0]);
    }
    const ind = prim.getIndices() ? Array.from(prim.getIndices().getArray()) : [...Array(pos.getCount()).keys()];
    // Winding umkehren, falls die Weltmatrix spiegelt
    const det = wm[0] * (wm[5] * wm[10] - wm[6] * wm[9]) - wm[4] * (wm[1] * wm[10] - wm[2] * wm[9]) + wm[8] * (wm[1] * wm[6] - wm[2] * wm[5]);
    if (det < 0) for (let i = 0; i < ind.length; i += 3) { const t = ind[i + 1]; ind[i + 1] = ind[i + 2]; ind[i + 2] = t; }
    const uvs = []; if (uv) { const c = []; for (let v = 0; v < pos.getCount(); v++) { uv.getElement(v, c); uvs.push([c[0], c[1]]); } }
    parts.push({ prim, start, count: pos.getCount(), ind, uvs, mat: prim.getMaterial(), head: m.headPart ? m.headPart(prim) : null });
  }
  // auf Vorlagen-Größe: Füße auf 0, Mitte über dem Ursprung
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const p of T) for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); }
  let rmn = 1e9, rmx = -1e9; for (const p of hRef.V) { rmn = Math.min(rmn, p[1]); rmx = Math.max(rmx, p[1]); }
  const k = (rmx - rmn) / (mx[1] - mn[1]) * (m.height || 1);
  // Tiefe: Rumpfmitte (Hüfte bis Brust) wie bei der Vorlage
  const zmid = (P, lo, hi) => { let s = 0, c = 0; for (const p of P) if (p[1] > lo && p[1] < hi) { s += p[2]; c++; } return s / (c || 1); };
  for (const p of T) { p[0] = (p[0] - (mn[0] + mx[0]) / 2) * k; p[1] = (p[1] - mn[1]) * k; p[2] = p[2] * k; }
  const dz = zmid(ref.V, .95, 1.35) - zmid(T, .95, 1.35);
  for (const p of T) p[2] += dz;
  // kopflose Körper: Haltung wie die Vorlage (Hals über dem Kopf-Gelenk), sonst sitzt der Hals hinter den Köpfen der Figuren.
  // Oberkörper ab der Hüfte so neigen, dass die Halsmitte auf Kinnhöhe dort liegt, wo sie bei der Vorlage liegt.
  if (m.neckToHead) {
    const yN = ref.world[ref.idx.get('Bip01 Neck')][13], y0 = 1.15 * (rmx - rmn) / 1.8, near = (P, y) => Math.max(...P.filter((q) => Math.abs(q[0]) < .03 && Math.abs(q[1] - y) < .02).map((q) => q[2]));   // Kehle (Haare hinten stören nicht)
    const shift = near(ref.V, yN) - near(T, yN);
    for (const p of T) if (p[1] > y0) p[2] += shift * Math.min(1.2, (p[1] - y0) / (yN - y0));
    console.error(m.id, 'Neigung', shift.toFixed(3));
  }


  // Armhaltung: Winkel von der Schulter (Vorlage) zum äußersten Punkt (Hand) unter der Waagerechten
  let arm = m.arm;
  if (arm === undefined) {
    const sh = ref.world[ref.idx.get('Bip01 L UpperArm')]; let best = null;
    for (const p of T) if (p[0] > 0 && p[1] > .35 && (!best || p[0] > best[0])) best = p;
    arm = Math.atan2(sh[13] - best[1], best[0] - sh[12]) * 180 / Math.PI;
  }
  const { pose, W } = rig(ref, T, TN, { arm, iter: 4, damp: .8, maxMove: .035 });
  // eigenes Kopf-Mesh mit Hals und Dekolleté (Citizen-Figuren): unter dem Hals dieselben Gewichte wie die Kleidung darüber,
  // sonst schaut die Haut beim Bewegen an Schultern und Ausschnitt durch
  const neckY = pose.world[ref.idx.get('Bip01 Neck')][13];
  const bodyIdx = []; for (const p of parts) if (p.head === false) for (let v = 0; v < p.count; v++) bodyIdx.push(p.start + v);
  if (bodyIdx.length) for (const p of parts) if (p.head === true) for (let v = p.start; v < p.start + p.count; v++) {
    if (T[v][1] > neckY - .02) continue;
    let best = -1, bd = .06 * .06;
    for (const u of bodyIdx) { const d = (T[u][0] - T[v][0]) ** 2 + (T[u][1] - T[v][1]) ** 2 + (T[u][2] - T[v][2]) ** 2; if (d < bd) { bd = d; best = u; } }
    if (best >= 0) W[v] = new Map(W[best]);
  }

  // Hals der kopflosen Körper (MakeHuman): oberer Rand folgt ganz dem Kopf, damit er bei jeder Figur bis unters Kinn reicht
  if (m.neckToHead) {
    let top = -1e9; for (const p of T) top = Math.max(top, p[1]);
    top *= m.cut || 1;
    T.forEach((p, v) => {
      if (p[1] <= neckY) return;
      const k = Math.min(1, (p[1] - neckY) / Math.max(.01, top - neckY)) ** 1.5, w = new Map();
      for (const [n, x] of W[v]) w.set(n, x * (1 - k));
      w.set('Bip01 Head', (w.get('Bip01 Head') || 0) + k); W[v] = w;
    });
  }
  // Ausgabe-Dokument
  const doc = new Document(), root = doc.getRoot(), buf = doc.createBuffer();
  doc.createScene('Scene');
  const sceneN = root.listScenes()[0];
  const top = doc.createNode('RootNode'); sceneN.addChild(top);
  const nodes = ref.nodes.map((nd, i) => doc.createNode(nd.name).setTranslation(pose.local[i].t).setRotation(pose.local[i].q).setScale(nd.s));
  ref.nodes.forEach((nd, i) => { if (nd.parent >= 0) nodes[nd.parent].addChild(nodes[i]); else top.addChild(nodes[i]); });
  // Gelenkliste: alle Knochen, die Gewichte haben (wie Rocketbox: ohne Bip01 und Footsteps)
  const used = new Set(); W.forEach((w) => w.forEach((x, n) => { if (x > 0) used.add(n); }));
  const jointNames = ref.nodes.map((n) => n.name).filter((n) => n !== 'Bip01' && !/Footsteps/.test(n) && ref.joints.includes(n));
  const ji = new Map(jointNames.map((n, i) => [n, i]));
  // Bindung: neue Stellung, aber Knochen-Rotationen wie bei der Vorlage → Bind-Welt = Stellung mit gelöster Rotation
  const bindWorld = pose.world;
  const ibm = new Float32Array(jointNames.length * 16);
  jointNames.forEach((n, i) => ibm.set(inv(bindWorld[ref.idx.get(n)]), i * 16));
  const skin = doc.createSkin('skin').setSkeleton(nodes[ref.idx.get('Bip01')]).setInverseBindMatrices(doc.createAccessor().setType('MAT4').setArray(ibm).setBuffer(buf));
  jointNames.forEach((n) => skin.addJoint(nodes[ref.idx.get(n)]));

  // Texturen und Materialien
  const texOut = new Map();
  const texOf = (t, kind) => {
    if (!t) return null;
    const key = t; if (texOut.has(key) && texOut.get(key)[kind]) return texOut.get(key)[kind];
    let img = decode(t.getImage(), t.getMimeType());
    if (m.paint && kind === 'color') {
      // Dreiecke dieser Textur mit UV und Lage im Raum (Ruhepose): zum Bemalen nach Körperstelle
      const tris = [];
      for (const p of parts) if (p.mat?.getBaseColorTexture() === t && p.uvs.length) for (let i = 0; i < p.ind.length; i += 3) {
        const v = [p.ind[i], p.ind[i + 1], p.ind[i + 2]];
        tris.push({ uv: v.map((x) => p.uvs[x]), p: v.map((x) => T[p.start + x]), n: v.map((x) => TN[p.start + x]), head: p.head });
      }
      img = m.paint(img, { tris, joint: (n) => { const w = pose.world[ref.idx.get(n)]; return [w[12], w[13], w[14]]; } }) || img;
    }
    const alpha = kind === 'color' && t.listParents().some((p) => p.propertyType === 'Material' && p.getAlphaMode() !== 'OPAQUE') && hasAlpha(img);
    img = shrink(img, kind === 'color' ? 1024 : 512);
    let data, mime;
    if (alpha) { const p = new PNG({ width: img.w, height: img.h }); img.px.copy(p.data); data = PNG.sync.write(p); mime = 'image/png'; }
    else { data = jpeg.encode({ width: img.w, height: img.h, data: img.px }, kind === 'color' ? 84 : 88).data; mime = 'image/jpeg'; }
    const tex = doc.createTexture(m.id + '_' + kind + texOut.size).setImage(new Uint8Array(data)).setMimeType(mime);
    texOut.set(key, { ...(texOut.get(key) || {}), [kind]: tex, alpha });
    return tex;
  };
  const mats = new Map();
  const matFor = (src, part) => {
    const key = (src?.getName() || 'm') + '|' + part; if (mats.has(key)) return mats.get(key);
    const mt = doc.createMaterial(m.id + (mats.size >= 2 ? mats.size : '') + '_' + part).setMetallicFactor(0).setRoughnessFactor(part === 'head' ? .6 : .78).setDoubleSided(m.doubleSided ?? !!src?.getDoubleSided());
    if (src) {
      const c = texOf(src.getBaseColorTexture(), 'color'); if (c) mt.setBaseColorTexture(c);
      const f = src.getBaseColorFactor(); mt.setBaseColorFactor([Math.min(1, f[0]), Math.min(1, f[1]), Math.min(1, f[2]), 1]);
      if (src.getAlphaMode() !== 'OPAQUE' && texOut.get(src.getBaseColorTexture())?.alpha) mt.setAlphaMode('MASK').setAlphaCutoff(.5);
      const nt = m.normals !== false && src.getNormalTexture(); if (nt) mt.setNormalTexture(texOf(nt, 'normal'));
    }
    mats.set(key, mt); return mt;
  };

  // Primitive bauen: je Teil Körper und Kopf (Kopf = Punkte am Kopfknochen)
  await MeshoptSimplifier.ready;
  const mesh = doc.createMesh(m.id);
  const dominant = (w) => { let b = '', x = -1; for (const [n, v] of w) if (v > x) { x = v; b = n; } return b; };
  const totalTris = parts.reduce((s, p) => s + p.ind.length / 3, 0), ratio = Math.min(1, (m.tris || 9000) / totalTris);
  // kopflose Körper (MakeHuman): nach dem Einpassen alles über dem Hals weglassen (Rand bleibt im Hals des eigenen Kopfes)
  const cutY = m.cut ? m.cut * Math.max(...T.map((q) => q[1])) : Infinity;
  for (const p of parts) {
    const split = { body: [], head: [] };
    for (let i = 0; i < p.ind.length; i += 3) {
      const tri = [p.ind[i], p.ind[i + 1], p.ind[i + 2]];
      if (tri.every((v) => T[p.start + v][1] > cutY)) continue;
      let isHead;
      if (p.head !== null) isHead = p.head;
      else isHead = tri.every((v) => /Head/.test(dominant(W[p.start + v])));
      split[isHead ? 'head' : 'body'].push(...tri);
    }
    for (const part of ['body', 'head']) {
      let ind = Uint32Array.from(split[part]); if (!ind.length) continue;
      // Geometrie verkleinern
      if (ratio < .98) {
        const posArr = new Float32Array(p.count * 3); for (let v = 0; v < p.count; v++) posArr.set(T[p.start + v], v * 3);
        const target = Math.max(300, Math.floor(ind.length * ratio / 3) * 3);
        const [res] = MeshoptSimplifier.simplify(ind, posArr, 3, target, .02, ['LockBorder']);
        ind = res;
      }
      // Punkte neu nummerieren
      const map = new Map(), verts = [];
      const out = new Uint32Array(ind.length);
      for (let i = 0; i < ind.length; i++) { let v = map.get(ind[i]); if (v === undefined) { v = verts.length; map.set(ind[i], v); verts.push(ind[i]); } out[i] = v; }
      const nv = verts.length, P = new Float32Array(nv * 3), Nn = new Float32Array(nv * 3), UV = new Float32Array(nv * 2), J = new Uint16Array(nv * 4), Wt = new Float32Array(nv * 4);
      verts.forEach((v, i) => {
        const g = p.start + v; P.set(T[g], i * 3); Nn.set(TN[g], i * 3); if (p.uvs.length) UV.set(p.uvs[v], i * 2);
        let ws = [...W[g]].filter(([n]) => ji.has(n)).sort((a, b) => b[1] - a[1]).slice(0, 4);
        const s = ws.reduce((a, b) => a + b[1], 0) || 1;
        ws.forEach(([n, x], k) => { J[i * 4 + k] = ji.get(n); Wt[i * 4 + k] = x / s; });
      });
      const acc = (type, arr) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buf);
      const prim = doc.createPrimitive().setIndices(acc('SCALAR', out)).setAttribute('POSITION', acc('VEC3', P)).setAttribute('NORMAL', acc('VEC3', Nn))
        .setAttribute('JOINTS_0', acc('VEC4', J)).setAttribute('WEIGHTS_0', acc('VEC4', Wt)).setMaterial(matFor(p.mat, part));
      if (p.uvs.length) prim.setAttribute('TEXCOORD_0', acc('VEC2', UV));
      mesh.addPrimitive(prim);
    }
  }
  // Zubehör (z. B. Kette, Ohrring) an Knochen
  if (m.extras) m.extras({ doc, mesh, buf, ji, pose, ref, T, mat: (name, rgb, metal = 0, rough = .5) => doc.createMaterial(m.id + '_' + name).setBaseColorFactor([...rgb, 1]).setMetallicFactor(metal).setRoughnessFactor(rough) });
  const mn2 = doc.createNode(m.id).setMesh(mesh).setSkin(skin); top.addChild(mn2);
  const bin = await io.writeBinary(doc);
  writeFileSync(new URL(m.id + '.glb', OUT), bin);
  const tris = mesh.listPrimitives().reduce((s, p) => s + p.getIndices().getCount() / 3, 0);
  return { id: m.id, arm: Math.round(arm), kb: bin.byteLength >> 10, tris, pelvis: +pose.world[ref.idx.get('Bip01 Pelvis')][13].toFixed(3), height: +(Math.max(...T.map((p) => p[1]))).toFixed(3) };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const io = new NodeIO();
  const TPL = process.env.RB_TEMPLATES ? process.env.RB_TEMPLATES + '/' : new URL('Male_Adult_01.glb', OUT).pathname.replace('Male_Adult_01.glb', '');
  const refs = { m: loadRef(await io.read(TPL + 'Male_Adult_01.glb')), f: loadRef(await io.read(TPL + 'Female_Adult_01.glb')) };
  for (const m of MODELS) {
    if (ONLY && m.id !== ONLY) continue;
    if (!existsSync(SRC + '/' + m.file)) { console.log('fehlt', m.file); continue; }
    process.stdout.write(m.id + ' … ');
    console.log(JSON.stringify(await build(io, m, refs)));
  }
}
