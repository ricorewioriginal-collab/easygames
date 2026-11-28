/* Welche Sketchfab-Datei welche Figur wird (für scripts/people.mjs). arm = Winkel der Oberarme unter der Waagerechten im Modell,
   yaw = Drehung, bis das Gesicht nach vorne schaut. Herkunft und Lizenz: public/CREDITS.md */
const CIT = 'citizen_npc_pack_1_character_lowpoly_mobile.glb';
const cit = (n, id, g = 'm', extra = {}) => ({
  id, g, file: CIT, tris: 4000,
  pick: (node) => (node.getParentNode()?.getName() || '') === 'Citizen 00amza_' + String(n).padStart(3, '0'),
  headPart: (prim) => !/BODY/i.test(prim.getMaterial()?.getName() || ''), ...extra,
});
export const MODELS = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n) => cit(n, 'pc_c' + String(n).padStart(2, '0'), [2, 5, 7, 9, 13, 14].includes(n) ? 'f' : 'm')),
  { id: 'pc_gangster', g: 'm', file: 'gangster_rigged.glb', arm: 5, tris: 9000 },
  { id: 'pc_streetg', g: 'm', file: 'street_gangster__realistic_3d_character_model.glb', arm: 5, tris: 9000 },
  { id: 'pc_yakuza', g: 'm', file: 'yakuza.glb', arm: 78, yaw: -90, tris: 9000 },
  // Uniformen (28.11.2026): Polizei, Feuerwehr, Sanitäterin. Geriggte Quellen vorher statisch eingebacken (Ruhepose).
  { id: 'pc_police_m', g: 'm', file: 'police_m2.glb', tris: 9000 },
  { id: 'pc_police_f', g: 'f', file: 'police_f3.glb', tris: 9000 },
  { id: 'pc_fire_m', g: 'm', file: 'fire_b.glb', tris: 9000 },
  { id: 'pc_fire_f', g: 'f', file: 'fire_b.glb', tris: 9000, height: .97 },
  { id: 'pc_medic_f', g: 'f', file: 'doc_f2.glb', tris: 9000 },
  // nackte Körper unter der Kleidung (MakeHuman, CC0): erst `node scripts/mh-body.mjs <ordner>`, dann diesen Ordner angeben.
  ...['m1', 'm2', 'm3', 'm4', 'f1', 'f2', 'f3', 'f4'].map((n) => ({ id: 'mh_' + n, g: n[0], file: 'mh_' + n + '.glb', tris: 12000, headPart: () => false, normals: false, neckToHead: true, cut: .875 })),
];

/* ---------------- Rico (Cover-Figur): Basis Citizen 12 (kurz rasiert, Bart) ---------------- */
const V = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], scl: (a, k) => a.map((x) => x * k), dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm: (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); } };
/** Textur nach Körperstelle bemalen: jedes Dreieck im UV-Raum abtasten, fn(rgb, Lage, Kopfteil?) liefert neue Farbe oder null */
function paintBy(img, tris, fn) {
  const { w, h, px } = img, done = new Uint8Array(w * h);
  for (const t of tris) {
    const P = t.uv.map(([u, v]) => [u * w, v * h]);
    const x0 = Math.max(0, Math.floor(Math.min(P[0][0], P[1][0], P[2][0])) - 1), x1 = Math.min(w - 1, Math.ceil(Math.max(P[0][0], P[1][0], P[2][0])) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(P[0][1], P[1][1], P[2][1])) - 1), y1 = Math.min(h - 1, Math.ceil(Math.max(P[0][1], P[1][1], P[2][1])) + 1);
    const d = (P[1][1] - P[2][1]) * (P[0][0] - P[2][0]) + (P[2][0] - P[1][0]) * (P[0][1] - P[2][1]); if (Math.abs(d) < 1e-9) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * w + x; if (done[i]) continue;
      const a = ((P[1][1] - P[2][1]) * (x + .5 - P[2][0]) + (P[2][0] - P[1][0]) * (y + .5 - P[2][1])) / d, b = ((P[2][1] - P[0][1]) * (x + .5 - P[2][0]) + (P[0][0] - P[2][0]) * (y + .5 - P[2][1])) / d, c = 1 - a - b;
      const e = -1.5 / Math.max(8, Math.sqrt(Math.abs(d)));   // etwa 1,5 Pixel über den Rand (gegen Nähte)
      if (a < e || b < e || c < e) continue;
      const pos = [0, 1, 2].map((k) => t.p[0][k] * a + t.p[1][k] * b + t.p[2][k] * c);
      const nor = t.n ? V.norm([0, 1, 2].map((k) => t.n[0][k] * a + t.n[1][k] * b + t.n[2][k] * c)) : null;
      const o = fn([px[i * 4], px[i * 4 + 1], px[i * 4 + 2]], pos, t.head, nor);
      done[i] = 1;
      if (o) { px[i * 4] = o[0]; px[i * 4 + 1] = o[1]; px[i * 4 + 2] = o[2]; done[i] = 2; }
    }
  }
  // Nähte: ungemalte Pixel neben gemalten übernehmen deren Farbe (3 Runden)
  for (let r = 0; r < 3; r++) {
    const add = [];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x; if (done[i]) continue;
      for (const j of [i - 1, i + 1, i - w, i + w]) if (done[j] === 2) { add.push([i, j]); break; }
    }
    for (const [i, j] of add) { px[i * 4] = px[j * 4]; px[i * 4 + 1] = px[j * 4 + 1]; px[i * 4 + 2] = px[j * 4 + 2]; done[i] = 2; }
  }
  return img;
}
const lum = (c) => .3 * c[0] + .59 * c[1] + .11 * c[2];
function ricoPaint(img, { tris, joint }) {
  const arms = ['L', 'R'].map((s) => ({ s: s === 'L' ? 1 : -1, u: joint(`Bip01 ${s} UpperArm`), f: joint(`Bip01 ${s} Forearm`), h: joint(`Bip01 ${s} Hand`) }));
  const shoulderX = Math.abs(arms[0].u[0]) - .02, neckY = joint('Bip01 Neck')[1];
  /** Drei weiße Streifen außen am Ärmel (Schulter bis Bündchen) */
  const armAt0 = (p) => {
    const A = arms.find((a) => Math.sign(p[0]) === a.s); if (!A || Math.abs(p[0]) < shoulderX - .03) return null;
    let best = null;
    for (const [a, b] of [[A.u, A.f], [A.f, A.h]]) {
      const ab = V.sub(b, a), t = Math.max(0, Math.min(1, V.dot(V.sub(p, a), ab) / V.dot(ab, ab))), c = V.add(a, V.scl(ab, t)), dd = Math.hypot(...V.sub(p, c));
      if (!best || dd < best.dd) best = { dd, c, ax: V.norm(ab), t, seg: a === A.u ? 0 : 1, s: A.s };
    }
    if (best.dd > (best.seg ? .13 : .1) || (best.seg === 0 && best.t < .12 && best.dd > .06)) return null;   // Rumpfseite gehört nicht zum Ärmel
    return best;
  };
  /** Lage um den Ärmel aus der Flächennormale: 0 = genau außen-oben */
  const armAt = (p, n) => {
    const a = armAt0(p); if (!a || !n) return null;
    let o = V.norm(V.cross(a.ax, [0, 0, 1])); if (o[1] < 0) o = V.scl(o, -1);
    const z = V.norm(V.cross(o, a.ax));
    return { ...a, th: Math.atan2(V.dot(n, z), V.dot(n, o)) };
  };
  const stripe = (a) => { if (!a || (a.seg === 1 && a.t > .9)) return false; const k = Math.abs(a.th); return k < .13 || (k > .3 && k < .52); };
  return paintBy(img, tris, (c, p, head, n) => {
    if (head) { const sk = c[0] > c[2] + 22 && c[0] >= c[1] && lum(c) > 80; return !sk && p[1] < neckY - .01 ? [16, 16, 18] : null; }
    const mx = Math.max(...c), mn = Math.min(...c), L = lum(c);
    const skin = c[0] > c[2] + 22 && c[0] >= c[1] && L > 90 && mx - mn > 25;
    const a = p[1] > .9 ? armAt(p, n) : null;
    const sleeve = a && !(a.seg === 1 && a.t > .9);                    // lange Ärmel bis zum Handgelenk
    if ((skin && !sleeve) || p[1] < .1) return null;                   // Haut und Schuhe bleiben
    if (process.env.DBG && a) { const k = a.th; return k > -.15 && k < .15 ? [255, 0, 0] : k > .15 && k < 1.2 ? [0, 255, 0] : k < -.15 && k > -1.2 ? [0, 0, 255] : [255, 255, 0]; }
    if (stripe(a)) return [236, 236, 238];                             // Streifen auf der Jacke
    if (skin) return [20, 20, 22];
    const shade = Math.max(.55, Math.min(1.35, L / (c[2] > c[0] + 4 && L < 125 ? 62 : 200)));
    if (p[1] > .93) return [18, 18, 20].map((x) => Math.round(x * shade + 6 * (shade - 1)));   // Jacke und Shirt schwarz
    return [34, 34, 38].map((x) => Math.round(x * shade));                                     // Hose dunkel
  });
}
/** Kette, Ohrring mit Kreuz und Septum-Ring als eigene Teile an den Knochen */
function ricoExtras({ doc, mesh, buf, ji, pose, ref, T, mat }) {
  const J = (n) => { const w = pose.world[ref.idx.get(n)]; return [w[12], w[13], w[14]]; };
  const silver = mat('silber', [.92, .93, .95], .75, .3);
  const parts = [];
  const tube = (pts, r, closed, bone, seg = 6) => {
    const P = [], N = [], I = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], tng = V.norm(V.sub(closed || (i > 0 && i < n - 1) ? b : i === 0 ? pts[1] : pts[i], closed || (i > 0 && i < n - 1) ? a : i === 0 ? pts[0] : pts[i - 1]));
      let s = V.norm(V.cross(tng, [0, 1, 0])); if (!isFinite(s[0]) || Math.hypot(...V.cross(tng, [0, 1, 0])) < .1) s = V.norm(V.cross(tng, [1, 0, 0]));
      const u = V.cross(tng, s);
      for (let k = 0; k < seg; k++) { const an = k / seg * Math.PI * 2, nn = V.add(V.scl(s, Math.cos(an)), V.scl(u, Math.sin(an))); P.push(...V.add(pts[i], V.scl(nn, r))); N.push(...nn); }
    }
    const rows = closed ? n : n - 1;
    for (let i = 0; i < rows; i++) for (let k = 0; k < seg; k++) { const a = i * seg + k, b = i * seg + (k + 1) % seg, c = ((i + 1) % n) * seg + k, d = ((i + 1) % n) * seg + (k + 1) % seg; I.push(a, c, b, b, c, d); }
    parts.push({ P, N, I, bone });
  };
  const box = (c, sx, sy, sz, bone) => {
    const P = [], N = [], I = [];
    const F = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]];
    const S = [sx / 2, sy / 2, sz / 2];
    for (const [n, a, b] of F) {
      const base = P.length / 3;
      for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const p = [0, 1, 2].map((k) => c[k] + (n[k] + a[k] * i + b[k] * j) * S[k]); P.push(...p); N.push(...n); }
      I.push(base, base + 1, base + 2, base, base + 2, base + 3, base, base + 2, base + 1, base, base + 3, base + 2); // beidseitig
    }
    parts.push({ P, N, I, bone });
  };
  // Oberfläche: höchster Punkt in Blickrichtung (z) nahe (x, y)
  // nur Rumpf/Hals (keine Arme): |x| < 0,16
  const near = (x, y) => { let r = .02, got = []; while (!got.length && r < .12) { got = T.filter((p) => Math.abs(p[0]) < .16 && Math.abs(p[0] - x) < r && Math.abs(p[1] - y) < r); r *= 1.5; } return got; };
  const front = (x, y) => { const g = near(x, y); return g.length ? Math.max(...g.map((p) => p[2])) : J('Bip01 Neck')[2] + .08; };
  const back = (x, y) => { const g = near(x, y); return g.length ? Math.min(...g.map((p) => p[2])) : J('Bip01 Neck')[2] - .07; };
  // Kette: um den Hals, vorne auf die Brust hängend
  const neck = J('Bip01 Neck'), head = J('Bip01 Head');
  const y0 = neck[1] - .02, pts = [];
  let rx = 0; for (const p of T) if (Math.abs(p[1] - y0) < .012 && Math.abs(p[2] - neck[2]) < .07 && Math.abs(p[0]) < .12) rx = Math.max(rx, Math.abs(p[0]));
  rx = Math.max(.06, rx + .006);
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2, x = Math.sin(a) * rx, cf = Math.cos(a);
    const y = y0 - .12 * Math.max(0, cf) ** 2.2;
    const z = cf > 0 ? front(x, y) + .007 : back(x, y) - .006;
    pts.push([x, y, z]);
  }
  tube(pts, .0058, true, 'Bip01 Spine2', 6);
  // Ohrring mit Kreuz (rechtes Ohr, wie auf dem Cover) und Septum-Ring
  let ear = null, nose = null;
  for (const p of T) {
    if (p[1] > head[1] - .01 && p[1] < head[1] + .07 && Math.abs(p[2] - head[2] - .01) < .045 && (!ear || p[0] < ear[0])) ear = p;
    if (p[1] > head[1] + .03 && p[1] < head[1] + .1 && Math.abs(p[0] - head[0]) < .03 && (!nose || p[2] > nose[2])) nose = p;
  }
  if (ear) {
    const c = [ear[0] + .02, ear[1] - .028, ear[2] - .006], ring = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ring.push([c[0], c[1] + Math.cos(a) * .006, c[2] + Math.sin(a) * .006]); }
    tube(ring, .0012, true, 'Bip01 Head', 4);
    box([c[0], c[1] - .019, c[2]], .003, .024, .004, 'Bip01 Head');
    box([c[0], c[1] - .013, c[2]], .003, .004, .013, 'Bip01 Head');
  }
  if (nose) {
    const c = [nose[0], nose[1] - .014, nose[2] - .01], ring = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ring.push([c[0] + Math.sin(a) * .005, c[1] + Math.cos(a) * .005, c[2] + .002]); }
    tube(ring, .0011, true, 'Bip01 Head', 4);
  }
  for (const pt of parts) {
    const n = pt.P.length / 3, J0 = new Uint16Array(n * 4), W0 = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { J0[i * 4] = ji.get(pt.bone); W0[i * 4] = 1; }
    const acc = (type, arr) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buf);
    mesh.addPrimitive(doc.createPrimitive().setIndices(acc('SCALAR', new Uint32Array(pt.I))).setAttribute('POSITION', acc('VEC3', new Float32Array(pt.P))).setAttribute('NORMAL', acc('VEC3', new Float32Array(pt.N)))
      .setAttribute('JOINTS_0', acc('VEC4', J0)).setAttribute('WEIGHTS_0', acc('VEC4', W0)).setMaterial(silver));
  }
}
MODELS.push(cit(12, 'pc_rico', 'm', { paint: ricoPaint, extras: ricoExtras }));
