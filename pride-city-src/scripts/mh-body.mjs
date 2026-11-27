/* Realistische nackte Körper aus MakeHuman (CC0, makehumancommunity/makehuman, data/3dobjs/base.obj + targets).
   Sie liegen nur unter der Kleidung der Figuren (koerper.ts): Kopf, Gesicht, Haare und Kleidung bleiben die der Figur.
   Dieses Skript formt den Grundkörper mit den Makro-Zielen (Geschlecht, Muskeln, Gewicht, Proportionen, Brust), schneidet
   malt eine Haut-Textur (Poren, Flecken, Schattierung in Falten, Brustwarzen, Nabel) –
   alles aus der Lage im Raum, deshalb ohne Nähte. Ergebnis: <out>/mh_*.glb ohne Skelett, das riggt danach scripts/people.mjs.
     MH_DATA=<makehuman/data> node scripts/mh-body.mjs <out>
   Die Daten: git clone --filter=blob:none --sparse https://github.com/makehumancommunity/makehuman, dann
   git sparse-checkout set makehuman/data/3dobjs makehuman/data/targets/macrodetails makehuman/data/targets/breast */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import jpeg from 'jpeg-js';

const DATA = process.env.MH_DATA || '/tmp/claude-0/mh/src/makehuman/data';
const OUT = process.argv[2] || '/tmp/claude-0/mhsrc';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

/** Körperformen: Muskeln/Gewicht/Brust 0…1 wie in MakeHuman (0,5 = Durchschnitt) */
export const BODIES = [
  { id: 'mh_m1', g: 'm', muscle: .45, weight: .25, prop: .6 },        // schlank
  { id: 'mh_m2', g: 'm', muscle: .58, weight: .52, prop: .5 },       // normal
  { id: 'mh_m3', g: 'm', muscle: 1, weight: .5, prop: .9 },       // sportlich
  { id: 'mh_m4', g: 'm', muscle: .5, weight: 1, prop: .3 },       // kräftig, Bauch
  { id: 'mh_f1', g: 'f', muscle: .45, weight: .36, cup: .32, firm: .6, prop: .6 },   // schlank, kleine Brust
  { id: 'mh_f2', g: 'f', muscle: .5, weight: .5, cup: .55, firm: .5, prop: .5 },     // normal
  { id: 'mh_f3', g: 'f', muscle: .45, weight: .85, cup: .9, firm: .35, prop: .4 },  // kurvig, große Brust
  { id: 'mh_f4', g: 'f', muscle: .78, weight: .44, cup: .42, firm: .7, prop: .8 },   // sportlich
];

/* ---------- Grundkörper ---------- */
function loadBase() {
  const lines = readFileSync(DATA + '/3dobjs/base.obj', 'utf8').split('\n');
  const V = [], VT = [], F = []; let grp = '';
  for (const l of lines) {
    if (l.startsWith('v ')) { const p = l.split(/\s+/); V.push([+p[1], +p[2], +p[3]]); }
    else if (l.startsWith('vt ')) { const p = l.split(/\s+/); VT.push([+p[1], 1 - +p[2]]); }
    else if (l.startsWith('g ')) grp = l.slice(2).trim();
    else if (l.startsWith('f ') && grp === 'body') F.push(l.trim().split(/\s+/).slice(1).map((s) => { const [a, b] = s.split('/'); return [+a - 1, +b - 1]; }));
  }
  return { V, VT, F };
}
const targetCache = new Map();
function target(rel) {
  if (targetCache.has(rel)) return targetCache.get(rel);
  const f = DATA + '/targets/' + rel; let t = null;
  if (existsSync(f)) { t = []; for (const l of readFileSync(f, 'utf8').split('\n')) { if (!l || l[0] === '#') continue; const p = l.trim().split(/\s+/); if (p.length === 4) t.push([+p[0], +p[1], +p[2], +p[3]]); } }
  targetCache.set(rel, t); return t;
}
/** MakeHuman-Mischung: Wert 0…1 → Gewichte für min/average/max */
const tri3 = (v, lo, mid, hi) => (v < .5 ? [[lo, 1 - v * 2], [mid, v * 2]] : [[mid, 1 - (v - .5) * 2], [hi, (v - .5) * 2]]).filter(([, w]) => w > 1e-4);
function shape(base, b) {
  const P = base.V.map((p) => p.slice());
  const add = (rel, w) => { const t = target(rel); if (!t || w <= 0) return; for (const [i, x, y, z] of t) { P[i][0] += x * w; P[i][1] += y * w; P[i][2] += z * w; } };
  const gender = b.g === 'm' ? [['male', 1]] : [['female', 1]];
  const mus = tri3(b.muscle, 'minmuscle', 'averagemuscle', 'maxmuscle'), wt = tri3(b.weight, 'minweight', 'averageweight', 'maxweight');
  for (const [g, gw] of gender) for (const [m, mw] of mus) for (const [w, ww] of wt) {
    add(`macrodetails/universal-${g}-young-${m}-${w}.target`, gw * mw * ww);
    // Proportionen: 0,5 neutral, darüber „ideal“, darunter „ungewöhnlich“
    if (b.prop > .5) add(`macrodetails/proportions/${g}-young-${m}-${w}-idealproportions.target`, gw * mw * ww * (b.prop - .5) * 2);
    else if (b.prop < .5) add(`macrodetails/proportions/${g}-young-${m}-${w}-uncommonproportions.target`, gw * mw * ww * (.5 - b.prop) * 2);
    if (g === 'female') for (const [c, cw] of tri3(b.cup, 'mincup', 'averagecup', 'maxcup')) for (const [f, fw] of tri3(b.firm, 'minfirmness', 'averagefirmness', 'maxfirmness'))
      add(`breast/female-young-${m}-${w}-${c}-${f}.target`, gw * mw * ww * cw * fw);
  }
  // Herkunft gemischt wie im MakeHuman-Standard (ein Drittel je Gruppe), Farbe kommt später von der Figur
  for (const r of ['african', 'asian', 'caucasian']) add(`macrodetails/${r}-${gender[0][0]}-young.target`, 1 / 3);
  return P;
}

/* ---------- Hilfen ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
/** 3D-Wertrauschen (glatt), gibt -1…1 */
const hash3 = (x, y, z) => { let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xffff) / 32767.5 - 1; };
function noise(p, f) {
  const x = p[0] * f, y = p[1] * f, z = p[2] * f, xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = x - xi, v = y - yi, w = z - zi;
  const s = (t) => t * t * (3 - 2 * t), su = s(u), sv = s(v), sw = s(w);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), su), l(c(0, 1, 0), c(1, 1, 0), su), sv), l(l(c(0, 0, 1), c(1, 0, 1), su), l(c(0, 1, 1), c(1, 1, 1), su), sv), sw);
}

/* ---------- Körper bauen ---------- */
function make(base, b) {
  const P0 = shape(base, b);
  // Meter (MakeHuman: Dezimeter), Füße auf 0
  let lo = 1e9, hi = -1e9; for (const p of P0) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
  const used = new Set(); for (const f of base.F) for (const [v] of f) used.add(v);
  lo = 1e9; hi = -1e9; for (const v of used) { lo = Math.min(lo, P0[v][1]); hi = Math.max(hi, P0[v][1]); }
  const H = (hi - lo) * .1;
  const P = P0.map((p) => [p[0] * .1, (p[1] - lo) * .1, p[2] * .1]);
  const T = (v) => P[v][1] / H;
  // Kopf bleibt hier dran: das Skelett wird am ganzen Körper eingepasst, scripts/people.mjs schneidet ihn danach ab (cut)
  const faces = base.F;
  // Vertex-Normalen und Nachbarn (Lage-Vertices, UV-unabhängig)
  const N = P.map(() => [0, 0, 0]), nb = new Map();
  for (const f of faces) {
    const vs = f.map(([v]) => v);
    for (let k = 1; k + 1 < vs.length; k++) { const n = cross(sub(P[vs[k]], P[vs[0]]), sub(P[vs[k + 1]], P[vs[0]])); for (const v of [vs[0], vs[k], vs[k + 1]]) for (let i = 0; i < 3; i++) N[v][i] += n[i]; }
    vs.forEach((v, k) => { let s = nb.get(v); if (!s) nb.set(v, (s = new Set())); s.add(vs[(k + 1) % vs.length]); s.add(vs[(k + vs.length - 1) % vs.length]); });
  }
  for (let v = 0; v < N.length; v++) N[v] = norm(N[v]);
  // Falten/Mulden: Krümmung (Mittel der Nachbarn liegt vor der Fläche = Mulde), in zwei Größen geglättet
  let cav = new Float32Array(P.length);
  for (const [v, s] of nb) { let m = [0, 0, 0], e = 0; for (const u of s) { for (let i = 0; i < 3; i++) m[i] += P[u][i] / s.size; e += Math.hypot(...sub(P[u], P[v])) / s.size; } cav[v] = ((m[0] - P[v][0]) * N[v][0] + (m[1] - P[v][1]) * N[v][1] + (m[2] - P[v][2]) * N[v][2]) / (e || 1); }
  const smooth = (a, it) => { for (let r = 0; r < it; r++) { const o = new Float32Array(a.length); for (const [v, s] of nb) { let t = a[v]; for (const u of s) t += a[u]; o[v] = t / (s.size + 1); } a = o; } return a; };
  const cavS = smooth(cav, 3), cavL = smooth(cav, 24);
  // Brustwarzen: vorderster Punkt je Seite auf Brusthöhe; Nabel: tiefste Mulde vorne am Bauch
  const tips = [];
  for (const sd of [-1, 1]) {
    let best = -1, bz = -1e9;
    for (const v of used) { const t = T(v), s = P[v][0] / H * sd; if (t > .68 && t < .765 && s > .035 && s < .12 && P[v][2] > bz) { bz = P[v][2]; best = v; } }
    if (best >= 0) tips.push(P[best]);
  }
  let navel = null, nc = -1e9;
  for (const v of used) { const t = T(v); if (t > .55 && t < .64 && Math.abs(P[v][0]) < .015 * H && N[v][2] > .3 && cavS[v] > nc) { nc = cavS[v]; navel = P[v]; } }

  // GLB-Vertices: je (Lage, UV) ein Punkt
  const key = new Map(), pos = [], nor = [], uv = [], src = [], ind = [];
  const vid = (v, t) => { const k = v * 100000 + t; let i = key.get(k); if (i === undefined) { i = pos.length / 3; key.set(k, i); pos.push(...P[v]); nor.push(...N[v]); uv.push(...base.VT[t]); src.push(v); } return i; };
  for (const f of faces) { const ids = f.map(([v, t]) => vid(v, t)); for (let k = 1; k + 1 < ids.length; k++) ind.push(ids[0], ids[k + 1], ids[k]); }
  // Windung prüfen: Normale aus dem Dreieck soll zur Vertex-Normale zeigen
  let agree = 0; for (let i = 0; i < ind.length; i += 3) { const a = ind[i] * 3, bb = ind[i + 1] * 3, c = ind[i + 2] * 3; const n = cross(sub(pos.slice(bb, bb + 3), pos.slice(a, a + 3)), sub(pos.slice(c, c + 3), pos.slice(a, a + 3))); agree += Math.sign(n[0] * nor[a] + n[1] * nor[a + 1] + n[2] * nor[a + 2]); }
  if (agree < 0) for (let i = 0; i < ind.length; i += 3) { const t = ind[i + 1]; ind[i + 1] = ind[i + 2]; ind[i + 2] = t; }

  // Haut-Textur
  const W = 1024, img = new Uint8Array(W * W * 4), done = new Uint8Array(W * W);
  const SK = [206, 160, 136];   // mittlerer Hautton (wird im Spiel auf die Haut der Figur umgefärbt)
  const female = b.g === 'f', rA = female ? .019 : .0125, rN = female ? .0055 : .0035;
  const skinAt = (p, n, cs, cl) => {
    let k = 1 + noise(p, 9) * .035 + noise(p, 40) * .02 + noise(p, 160) * .018;
    k -= Math.max(0, cs) * .55 + Math.max(0, cl) * 1.1;          // Falten und Mulden dunkler
    k += Math.max(0, -cs) * .12;                                   // Kanten (Knöchel, Schlüsselbein) etwas heller
    // Schatten unter dem Kinn: oben am Hals dunkler, so geht der Hals weich in die Kiefer-Schatten der Köpfe über
    const tn = p[1] / H; if (tn > .835) k *= 1 - .38 * Math.min(1, (tn - .835) / .04) * (n[2] > -.2 ? 1 : .5);
    let r = SK[0] * k, g = SK[1] * k, bl = SK[2] * k;
    // Durchblutung: Wangen fehlen, aber Knie, Ellbogen, Hände und Füße etwas röter
    const red = Math.max(0, noise(p, 3.5)) * .06 + (p[1] < .12 || p[1] / H > .78 ? .03 : 0);
    r *= 1 + red; g *= 1 - red * .4; bl *= 1 - red * .3;
    // Brustwarzenhof und Brustwarze
    for (const t of tips) {
      const d = Math.hypot(p[0] - t[0], p[1] - t[1], (p[2] - t[2]) * .6);
      if (d < rA * 1.25) {
        const m = d < rA ? 1 : (rA * 1.25 - d) / (rA * .25), q = d < rN ? 1 : 0;
        const ar = [.74, .58, .58], np = [.62, .45, .46], c = q ? np : ar;
        const grain = 1 + noise(p, 400) * .05;
        r = r * (1 - m) + r * c[0] * grain * m; g = g * (1 - m) + g * c[1] * grain * m; bl = bl * (1 - m) + bl * c[2] * grain * m;
      }
    }
    if (navel) { const d = Math.hypot(p[0] - navel[0], p[1] - navel[1], p[2] - navel[2]); if (d < .011) { const m = 1 - d / .011; r *= 1 - .35 * m; g *= 1 - .4 * m; bl *= 1 - .4 * m; } }
    return [r, g, bl];
  };
  const cl = (x) => Math.max(0, Math.min(255, Math.round(x)));
  for (let i = 0; i < ind.length; i += 3) {
    const v = [ind[i], ind[i + 1], ind[i + 2]];
    const U = v.map((x) => [uv[x * 2] * W, uv[x * 2 + 1] * W]), Q = v.map((x) => pos.slice(x * 3, x * 3 + 3)), M = v.map((x) => nor.slice(x * 3, x * 3 + 3));
    const CS = v.map((x) => cavS[src[x]]), CL = v.map((x) => cavL[src[x]]);
    const d = (U[1][1] - U[2][1]) * (U[0][0] - U[2][0]) + (U[2][0] - U[1][0]) * (U[0][1] - U[2][1]); if (Math.abs(d) < 1e-9) continue;
    const x0 = Math.max(0, Math.floor(Math.min(U[0][0], U[1][0], U[2][0])) - 1), x1 = Math.min(W - 1, Math.ceil(Math.max(U[0][0], U[1][0], U[2][0])) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(U[0][1], U[1][1], U[2][1])) - 1), y1 = Math.min(W - 1, Math.ceil(Math.max(U[0][1], U[1][1], U[2][1])) + 1);
    const e = -1.5 / Math.max(8, Math.sqrt(Math.abs(d)));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const o = y * W + x; if (done[o]) continue;
      const a = ((U[1][1] - U[2][1]) * (x + .5 - U[2][0]) + (U[2][0] - U[1][0]) * (y + .5 - U[2][1])) / d, bb = ((U[2][1] - U[0][1]) * (x + .5 - U[2][0]) + (U[0][0] - U[2][0]) * (y + .5 - U[2][1])) / d, c = 1 - a - bb;
      if (a < e || bb < e || c < e) continue;
      const p = [0, 1, 2].map((k) => Q[0][k] * a + Q[1][k] * bb + Q[2][k] * c), n = norm([0, 1, 2].map((k) => M[0][k] * a + M[1][k] * bb + M[2][k] * c));
      const col = skinAt(p, n, CS[0] * a + CS[1] * bb + CS[2] * c, CL[0] * a + CL[1] * bb + CL[2] * c);
      img[o * 4] = cl(col[0]); img[o * 4 + 1] = cl(col[1]); img[o * 4 + 2] = cl(col[2]); img[o * 4 + 3] = 255; done[o] = 1;
    }
  }
  // Ränder der UV-Inseln auffüllen (gegen dunkle Nähte bei Mipmaps)
  for (let r = 0; r < 6; r++) {
    const add = [];
    for (let o = 0; o < W * W; o++) if (!done[o]) { const x = o % W, y = (o - x) / W; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < W && done[yy * W + xx]) { add.push([o, yy * W + xx]); break; } } }
    for (const [o, j] of add) { img.copyWithin(o * 4, j * 4, j * 4 + 4); done[o] = 1; }
  }
  for (let o = 0; o < W * W; o++) if (!done[o]) { img[o * 4] = SK[0]; img[o * 4 + 1] = SK[1]; img[o * 4 + 2] = SK[2]; img[o * 4 + 3] = 255; }
  return { pos, nor, uv, ind, img, W, H };
}

async function write(io, b, r) {
  const doc = new Document(), buf = doc.createBuffer();
  const tex = doc.createTexture(b.id + '_skin').setImage(new Uint8Array(jpeg.encode({ width: r.W, height: r.W, data: r.img }, 88).data)).setMimeType('image/jpeg');
  const mat = doc.createMaterial('mh_body').setBaseColorTexture(tex).setMetallicFactor(0).setRoughnessFactor(.62);
  const acc = (type, arr) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buf);
  const prim = doc.createPrimitive().setIndices(acc('SCALAR', Uint32Array.from(r.ind))).setAttribute('POSITION', acc('VEC3', Float32Array.from(r.pos)))
    .setAttribute('NORMAL', acc('VEC3', Float32Array.from(r.nor))).setAttribute('TEXCOORD_0', acc('VEC2', Float32Array.from(r.uv))).setMaterial(mat);
  const mesh = doc.createMesh(b.id).addPrimitive(prim);
  const node = doc.createNode(b.id).setMesh(mesh);
  doc.createScene('Scene').addChild(node);
  writeFileSync(OUT + '/' + b.id + '.glb', await io.writeBinary(doc));
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const io = new NodeIO(), base = loadBase();
  for (const b of BODIES) { const r = make(base, b); await write(io, b, r); console.log(b.id, 'Höhe', r.H.toFixed(3), 'Dreiecke', r.ind.length / 3); }
}
