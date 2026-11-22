/* Körper in 3D (Daten in figur.ts): Muskeln über die Dicke der Knochen (Oberarme, Brust, Oberschenkel), Tattoos und
   Bart als hauchdünne Haut-Schicht, Piercings als kleine Metallringe. Tattoo, Bart und Schmuck sind eigene Meshes aus
   den Dreiecken der Figur selbst, mit denselben Knochen-Gewichten: Sie folgen jeder Animation, ohne dass eine Textur
   der Figur umgemalt wird (die teilen sich viele Figuren). Tattoos sitzen auf dem eng anliegenden Körper (koerper.ts),
   sind also bei Oberkörperfrei, Badesachen, Unterwäsche und Harness zu sehen. */
import { Mesh, VertexData, VertexBuffer, PBRMaterial, DynamicTexture, Vector3, Color3, CreateTorus, CreateSphere, type Scene, type TransformNode, type Material } from '../engine/bjs';
import { fullIndices } from './lod';
import { BEARD_COLORS, type Fig } from './figur';

/* ---------- Muskeln ---------- */
const base = new WeakMap<TransformNode, Vector3>();
/** Dicke statt Länge: die Knochen der Rocketbox-Figuren zeigen entlang x, also y und z skalieren.
    Hände, Füße und der Hals bekommen den Kehrwert, damit Kopf, Hände und Füße normal groß bleiben. */
const MUS: Array<[RegExp, number]> = [[/ (L|R) UpperArm$/, .3], [/ (L|R) Thigh$/, .16], [/ Spine2$/, .13]];
const KEEP: Array<[RegExp, RegExp]> = [[/ (L|R) Hand$/, / (L|R) UpperArm$/], [/ (L|R) Foot$/, / (L|R) Thigh$/], [/ Neck$/, / Spine2$/]];
export function muscles(bones: Map<string, TransformNode>, m: number) {
  const f = Math.max(0, Math.min(1, (m - .2) / .8));
  const k = new Map<string, number>();
  for (const [name, n] of bones) {
    let b = base.get(n); if (!b) { b = n.scaling.clone(); base.set(n, b); }
    const hit = MUS.find(([re]) => re.test(name)), s = hit ? 1 + hit[1] * f : 1;
    k.set(name, s);
    n.scaling.set(b.x, b.y * s, b.z * s);
  }
  for (const [name, n] of bones) {
    const keep = KEEP.find(([re]) => re.test(name)); if (!keep) continue;
    const side = name.match(/ (L|R) /)?.[1], parent = [...k.keys()].find((x) => keep[1].test(x) && (!side || x.includes(` ${side} `)));
    const s = parent ? k.get(parent) || 1 : 1, b = base.get(n)!;
    n.scaling.set(b.x, b.y / s, b.z / s);
  }
}

/* ---------- Geometrie der Figur lesen ---------- */
interface Geo { m: Mesh; pos: ArrayLike<number>; nrm: ArrayLike<number>; idx: ArrayLike<number>; mi: ArrayLike<number>; mw: ArrayLike<number>; bone: (v: number) => string; n: number }
function geo(m: Mesh): Geo | null {
  const pos = m.getVerticesData(VertexBuffer.PositionKind), nrm = m.getVerticesData(VertexBuffer.NormalKind), idx = fullIndices(m);
  const mi = m.getVerticesData(VertexBuffer.MatricesIndicesKind), mw = m.getVerticesData(VertexBuffer.MatricesWeightsKind), sk = m.skeleton;
  if (!pos || !nrm || !idx || !mi || !mw || !sk) return null;
  const names: string[] = []; sk.bones.forEach((b) => { names[b.getIndex()] = b.name; });
  const bone = (v: number) => { let best = 0, bw = -1; for (let k = 0; k < 4; k++) if (mw[v * 4 + k] > bw) { bw = mw[v * 4 + k]; best = mi[v * 4 + k]; } return names[best] || ''; };
  return { m, pos, nrm, idx, mi, mw, bone, n: pos.length / 3 };
}
const P = (g: Geo, v: number) => new Vector3(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]);
const N = (g: Geo, v: number) => new Vector3(g.nrm[v * 3], g.nrm[v * 3 + 1], g.nrm[v * 3 + 2]);
function centroid(g: Geo, re: RegExp) { const c = new Vector3(); let k = 0; for (let v = 0; v < g.n; v++) if (re.test(g.bone(v))) { c.addInPlace(P(g, v)); k++; } return k ? c.scaleInPlace(1 / k) : null; }
/** Achsen im Bindungsraum: oben (längste Ausdehnung), vorne (Zehen zeigen nach vorn), links */
function axes(g: Geo) {
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < g.pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], g.pos[i + k]); hi[k] = Math.max(hi[k], g.pos[i + k]); }
  const ext = [0, 1, 2].map((k) => hi[k] - lo[k]), ax = [0, 1, 2].sort((a, b) => ext[b] - ext[a]);
  const unit = (k: number, s = 1) => new Vector3(k === 0 ? s : 0, k === 1 ? s : 0, k === 2 ? s : 0);
  const up = unit(ax[0]);
  // oben ist dort, wo der Kopf ist (Kopf-Knochen über dem Becken)
  const head = centroid(g, /Neck|Head/), pel = centroid(g, /Pelvis|Thigh/);
  if (head && pel && Vector3.Dot(head.subtract(pel), up) < 0) up.scaleInPlace(-1);
  const toe = centroid(g, /Toe/), foot = centroid(g, /Foot/), eye = centroid(g, /Eye/);
  let front = unit(ax[2]);
  if (toe && foot && Math.abs(Vector3.Dot(toe.subtract(foot), front)) > 1e-4) { if (Vector3.Dot(toe.subtract(foot), front) < 0) front.scaleInPlace(-1); }
  else if (eye && head) { if (Vector3.Dot(eye.subtract(head), front) < 0) front.scaleInPlace(-1); }
  const lc = centroid(g, / L (UpperArm|Clavicle|Thigh)/);
  let left = unit(ax[1]); if (lc && Vector3.Dot(lc, left) < 0) left = left.scale(-1);
  front = front.normalize();
  return { up, front, left, lo, hi };
}

/* ---------- Haut-Schicht (Tattoo, Bart) ---------- */
interface Layer { c: Vector3; n: Vector3; t: Vector3; b: Vector3; w: number; h: number; re: RegExp; minDot?: number; depth?: number; keep?: (p: Vector3, v: number) => boolean }
function layer(scene: Scene, g: Geo, L: Layer, mat: Material, push: number, name: string): Mesh | null {
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], mi: number[] = [], mw: number[] = [], ind: number[] = [];
  const map = new Map<number, number>(), ok = new Map<number, [number, number] | null>();
  const test = (v: number) => {
    if (ok.has(v)) return ok.get(v)!;
    let r: [number, number] | null = null;
    if (L.re.test(g.bone(v))) {
      const p = P(g, v), d = p.subtract(L.c), u = Vector3.Dot(d, L.t) / L.w + .5, w = Vector3.Dot(d, L.b) / L.h + .5;
      if (u > -.02 && u < 1.02 && w > -.02 && w < 1.02 && Vector3.Dot(N(g, v), L.n) > (L.minDot ?? .2) && Vector3.Dot(d, L.n) > -(L.depth ?? .06) && (!L.keep || L.keep(p, v))) r = [u, w];
    }
    ok.set(v, r); return r;
  };
  for (let i = 0; i < g.idx.length; i += 3) {
    const a = g.idx[i], b = g.idx[i + 1], c = g.idx[i + 2], ta = test(a), tb = test(b), tc = test(c);
    if (!ta || !tb || !tc) continue;
    for (const [v, t] of [[a, ta], [b, tb], [c, tc]] as Array<[number, [number, number]]>) {
      let j = map.get(v);
      if (j === undefined) {
        j = pos.length / 3; map.set(v, j);
        const nn = N(g, v);
        pos.push(g.pos[v * 3] + nn.x * push, g.pos[v * 3 + 1] + nn.y * push, g.pos[v * 3 + 2] + nn.z * push);
        nrm.push(nn.x, nn.y, nn.z); uv.push(t[0], t[1]);
        for (let k = 0; k < 4; k++) { mi.push(g.mi[v * 4 + k]); mw.push(g.mw[v * 4 + k]); }
      }
      ind.push(j);
    }
  }
  if (!ind.length) return null;
  const m = new Mesh(name, scene), vd = new VertexData();
  vd.positions = pos; vd.normals = nrm; vd.uvs = uv; vd.indices = ind; vd.applyToMesh(m, false);
  m.setVerticesData(VertexBuffer.MatricesIndicesKind, mi, false, 4); m.setVerticesData(VertexBuffer.MatricesWeightsKind, mw, false, 4);
  return attach(m, g.m, mat);
}
function attach(m: Mesh, src: Mesh, mat: Material) {
  m.skeleton = src.skeleton; m.numBoneInfluencers = Math.min(4, src.numBoneInfluencers || 4);
  m.parent = src.parent; m.position.copyFrom(src.position); m.scaling.copyFrom(src.scaling);
  if (src.rotationQuaternion) m.rotationQuaternion = src.rotationQuaternion.clone(); else m.rotation.copyFrom(src.rotation);
  m.material = mat; m.isPickable = false; m.receiveShadows = true; m.alwaysSelectAsActiveMesh = true;
  m.layerMask = src.layerMask;
  return m;
}
function inkMat(scene: Scene, name: string, draw: (x: CanvasRenderingContext2D, s: number) => void, size = 256, rough = .75) {
  const t = new DynamicTexture(name, { width: size, height: size }, scene, true);
  const x = t.getContext() as CanvasRenderingContext2D; x.clearRect(0, 0, size, size); draw(x, size); t.hasAlpha = true; t.update();
  const m = new PBRMaterial(name, scene);
  m.albedoTexture = t; m.useAlphaFromAlbedoTexture = true; m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  m.metallic = 0; m.roughness = rough; m.zOffset = -2;
  // die Dreiecke kommen aus dem glTF (andere Wicklung als Babylon-eigene Meshes): beidseitig, sonst nur von innen sichtbar
  m.backFaceCulling = false;
  m.onDisposeObservable.addOnce(() => t.dispose());
  return m;
}

/* ---------- Tattoo-Motive (Leinwand, transparent) ---------- */
const INK = 'rgba(20,24,48,.88)', RB = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'];
const DRAW: Record<string, (x: CanvasRenderingContext2D, s: number) => void> = {
  winkel: (x, s) => { x.beginPath(); x.moveTo(s * .18, s * .22); x.lineTo(s * .82, s * .22); x.lineTo(s * .5, s * .8); x.closePath(); x.fillStyle = '#f2609c'; x.fill(); x.lineWidth = s * .035; x.strokeStyle = INK; x.stroke(); },
  herz: (x, s) => {
    const heart = () => { x.beginPath(); x.moveTo(s * .5, s * .82); x.bezierCurveTo(s * .08, s * .55, s * .12, s * .16, s * .5, s * .32); x.bezierCurveTo(s * .88, s * .16, s * .92, s * .55, s * .5, s * .82); x.closePath(); };
    x.save(); heart(); x.clip(); RB.forEach((c, i) => { x.fillStyle = c; x.globalAlpha = .82; x.fillRect(0, s * (.2 + i * .105), s, s * .11); }); x.restore();
    heart(); x.lineWidth = s * .035; x.strokeStyle = INK; x.stroke();
  },
  anker: (x, s) => {
    x.strokeStyle = INK; x.lineWidth = s * .06; x.lineCap = 'round';
    x.beginPath(); x.arc(s * .5, s * .17, s * .07, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.moveTo(s * .5, s * .24); x.lineTo(s * .5, s * .82); x.moveTo(s * .3, s * .36); x.lineTo(s * .7, s * .36); x.stroke();
    x.beginPath(); x.arc(s * .5, s * .58, s * .26, Math.PI * .15, Math.PI * .85); x.stroke();
    x.fillStyle = '#d8263b'; x.beginPath(); x.moveTo(s * .08, s * .62); x.lineTo(s * .92, s * .62); x.lineTo(s * .86, s * .72); x.lineTo(s * .92, s * .82); x.lineTo(s * .08, s * .82); x.lineTo(s * .14, s * .72); x.closePath(); x.globalAlpha = .85; x.fill(); x.globalAlpha = 1;
    x.fillStyle = '#fff'; x.font = `bold ${s * .075}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RAINBOW CITY', s * .5, s * .725);
  },
  pride: (x, s) => {
    x.fillStyle = INK; x.font = `italic bold ${s * .34}px "Brush Script MT", "Segoe Script", cursive`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Pride', s * .5, s * .45);
    RB.forEach((c, i) => { x.fillStyle = c; x.globalAlpha = .8; x.fillRect(s * (.12 + i * .127), s * .7, s * .127, s * .05); }); x.globalAlpha = 1;
  },
  fluegel: (x, s) => {
    for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
      x.save(); x.translate(s * .5 + side * s * .04, s * .3); x.rotate(side * (.35 + i * .2));
      x.beginPath(); x.ellipse(side * s * .22, 0, s * .23, s * .045, 0, 0, Math.PI * 2);
      x.fillStyle = RB[i]; x.globalAlpha = .72; x.fill(); x.globalAlpha = 1; x.lineWidth = s * .012; x.strokeStyle = INK; x.stroke(); x.restore();
    }
  },
};
/** Wo das Motiv sitzt: Knochen, Mitte, Blickrichtung, Größe (Meter) */
type Place = (g: Geo, a: ReturnType<typeof axes>) => Layer | null;
function onTorso(fr: number, side: number, back: boolean, w: number, h: number, re = /Spine|Clavicle|Neck|Pelvis/): Place {
  return (g, a) => {
    let lo = 1e9, hi = -1e9; for (let v = 0; v < g.n; v++) if (/Spine/.test(g.bone(v))) { const u = Vector3.Dot(P(g, v), a.up); lo = Math.min(lo, u); hi = Math.max(hi, u); }
    if (hi <= lo) return null;
    const n = back ? a.front.scale(-1) : a.front.clone(), y = lo + (hi - lo) * fr;
    // Hautpunkt auf dieser Höhe und Seite, am weitesten in Blickrichtung
    let best: Vector3 | null = null, bd = -1e9;
    for (let v = 0; v < g.n; v++) {
      if (!re.test(g.bone(v))) continue;
      const p = P(g, v); if (Math.abs(Vector3.Dot(p, a.up) - y) > .03 || Math.abs(Vector3.Dot(p, a.left) - side) > .03) continue;
      const d = Vector3.Dot(p, n); if (d > bd) { bd = d; best = p; }
    }
    if (!best) return null;
    const b = a.up.clone(), t = Vector3.Cross(b, n);
    return { c: best, n, t, b, w, h, re, minDot: .15, depth: .07 };
  };
}
function onLimb(upper: RegExp, lower: RegExp, along: number, face: 'out' | 'front', w: number, h: number, text = false): Place {
  return (g, a) => {
    const c0 = centroid(g, upper), c1 = centroid(g, lower); if (!c0 || !c1) return null;
    const d = c1.subtract(c0).normalize(), side = Vector3.Dot(c0, a.left) > 0 ? 1 : -1;
    const n0 = face === 'out' ? a.left.scale(side) : a.front.clone(), n = n0.subtract(d.scale(Vector3.Dot(n0, d))).normalize();
    const mid = c0.add(c1.subtract(c0).scale(along - .5));
    let best: Vector3 | null = null, bd = -1e9;
    for (let v = 0; v < g.n; v++) {
      if (!upper.test(g.bone(v)) && !lower.test(g.bone(v))) continue;
      const p = P(g, v); if (Math.abs(Vector3.Dot(p.subtract(mid), d)) > .025) continue;
      const q = Vector3.Dot(p, n); if (q > bd) { bd = q; best = p; }
    }
    if (!best) return null;
    // Bild: oben zeigt zur Schulter; Schriftzug läuft entlang des Arms
    const t = text ? d.clone() : Vector3.Cross(d.scale(-1), n), b = text ? Vector3.Cross(n, t) : d.scale(-1);
    return { c: best, n, t, b, w, h, re: new RegExp(`${upper.source}|${lower.source}`), minDot: .25, depth: .05 };
  };
}
const PLACES: Record<string, Place> = {
  winkel: onTorso(.98, 0, true, .07, .07, /Neck|Spine2|Head/),
  herz: onTorso(.72, .085, false, .1, .1),
  fluegel: onTorso(.68, 0, true, .38, .3, /Spine|Clavicle/),
  anker: onLimb(/ L UpperArm/, / L Forearm/, .3, 'out', .1, .1),
  pride: onLimb(/ R Forearm/, / R Hand/, -.15, 'front', .17, .07, true),
};

/* ---------- Bart ---------- */
function beardMat(scene: Scene, style: string, color: number) {
  const c = `${(color >> 16) & 255},${(color >> 8) & 255},${color & 255}`;
  return inkMat(scene, 'bart_' + style, (x, s) => {
    const dens = style === 'voll' ? 5200 : style === 'kinn' ? 3400 : 2600, len = style === 'voll' ? 5 : style === 'kinn' ? 3.5 : 1.6;
    if (style !== 'stoppel') { x.fillStyle = `rgba(${c},${style === 'voll' ? .82 : .6})`; x.fillRect(0, 0, s, s); }
    let h = 12345;
    const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822519) + 374761393) >>> 0) / 4294967296;
    x.lineWidth = 1.1; x.lineCap = 'round';
    for (let i = 0; i < dens; i++) {
      const px = rnd() * s, py = rnd() * s, a = rnd() * .5 + .35;
      x.strokeStyle = `rgba(${c},${style === 'stoppel' ? a * .75 : a})`;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - .5) * len, py + len * (.6 + rnd() * .6)); x.stroke();
    }
    // weicher Rand nach oben (Wangen) statt harter Kante
    x.globalCompositeOperation = 'destination-out';
    const top = x.createLinearGradient(0, 0, 0, s * .35); top.addColorStop(0, 'rgba(0,0,0,1)'); top.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = top; x.fillRect(0, 0, s, s * .35);
    x.globalCompositeOperation = 'source-over';
  }, 256, .95);
}
interface HeadInfo { g: Geo; a: ReturnType<typeof axes>; lo: number; hi: number; mid: number; sMid: number; dExt: number; sExt: number; front: Vector3; t: (p: Vector3) => number }
function headInfo(m: Mesh): HeadInfo | null {
  const g = geo(m); if (!g) return null;
  const a0 = axes(g), isHead = (v: number) => !/Neck|Spine|Clavicle|Arm|Pelvis/.test(g.bone(v));
  // Ein Kopf ist fast so breit wie tief: vorne nicht nach Ausdehnung raten, sondern nach den Augen (die Mitte der Augen liegt vorn, nicht seitlich)
  const eye0 = centroid(g, /Eye/), hc = centroid(g, / Head$/);
  const a = { ...a0 };
  if (eye0 && hc) { const d = eye0.subtract(hc); if (Math.abs(Vector3.Dot(d, a0.left)) > Math.abs(Vector3.Dot(d, a0.front))) { a.front = a0.left.clone(); a.left = a0.front.clone(); } }
  let lo = 1e9, hi = -1e9, dlo = 1e9, dhi = -1e9, slo = 1e9, shi = -1e9;
  for (let v = 0; v < g.n; v++) { if (!isHead(v)) continue; const p = P(g, v), u = Vector3.Dot(p, a.up), d = Vector3.Dot(p, a.front), s = Vector3.Dot(p, a.left); lo = Math.min(lo, u); hi = Math.max(hi, u); dlo = Math.min(dlo, d); dhi = Math.max(dhi, d); slo = Math.min(slo, s); shi = Math.max(shi, s); }
  if (hi <= lo) return null;
  // vorne = wo die Augen sind
  const eye = centroid(g, /Eye/), front = a.front.clone();
  let mid = (dlo + dhi) / 2;
  if (eye && Vector3.Dot(eye, front) < mid) { front.scaleInPlace(-1); mid = -mid; }
  const lc = centroid(g, /( L |Left|LEye|L_)/);
  if (lc && hc && Vector3.Dot(lc.subtract(hc), a.left) < 0) a.left = a.left.scale(-1);
  return { g, a: { ...a, front }, lo, hi, mid, sMid: eye ? Vector3.Dot(eye, a.left) : (slo + shi) / 2, dExt: dhi - dlo, sExt: shi - slo, front, t: (p) => (Vector3.Dot(p, a.up) - lo) / (hi - lo) };
}
function beard(scene: Scene, h: HeadInfo, style: string, color: number) {
  const { g, a, sMid } = h;
  const chin = style === 'kinn';
  const lowT = chin ? .3 : .42;
  const c = a.up.scale(h.lo + (h.hi - h.lo) * lowT / 2).add(h.front.scale(h.mid + h.dExt * .5)).add(a.left.scale(sMid));
  const n = h.front.clone(), b = a.up.clone(), t = Vector3.Cross(b, n);
  const L: Layer = {
    c, n, t, b, w: chin ? h.sExt * .45 : h.sExt * 1.1, h: (h.hi - h.lo) * lowT, re: /./, minDot: chin ? .25 : -.35, depth: h.dExt * (chin ? .4 : .75),
    keep: (p, v) => !/Lip|Tongue|Eye|Blink|Nub/.test(g.bone(v)) && h.t(p) < lowT && Vector3.Dot(p, h.front) > h.mid - h.dExt * (chin ? 0 : .12),
  };
  return layer(scene, g, L, beardMat(scene, style, color), style === 'voll' ? .004 : style === 'kinn' ? .003 : .0012, 'bart');
}

/* ---------- Piercings ---------- */
function jewel(scene: Scene, h: HeadInfo, ids: string[]) {
  const { g, a } = h, sk = g.m.skeleton!;
  const hb = sk.bones.findIndex((b) => / Head$/.test(b.name)); if (hb < 0) return null;
  const pick = (f: (p: Vector3, v: number) => number | null) => { let best: Vector3 | null = null, bd = -1e9; for (let v = 0; v < g.n; v++) { if (/Neck|Spine|Clavicle|Arm|Pelvis/.test(g.bone(v))) continue; const p = P(g, v), q = f(p, v); if (q !== null && q > bd) { bd = q; best = p; } } return best; };
  const side = (p: Vector3) => Vector3.Dot(p, a.left) - h.sMid, fr = (p: Vector3) => Vector3.Dot(p, h.front);
  const parts: Array<{ at: Vector3; axis: Vector3; ring: boolean; r: number }> = [];
  for (const id of ids) {
    if (id === 'ohrL' || id === 'ohrR') {
      const sg = id === 'ohrL' ? 1 : -1;
      const p = pick((q) => { const t = h.t(q); return t > .38 && t < .5 ? side(q) * sg : null; });
      if (p) parts.push({ at: p.add(a.up.scale(-.012)).add(a.left.scale(sg * .002)), axis: a.left, ring: true, r: .007 });
    } else if (id === 'nase') {
      const p = pick((q) => { const t = h.t(q); return t > .45 && t < .62 && Math.abs(side(q)) < .02 ? fr(q) : null; });
      if (p) parts.push({ at: p.add(a.up.scale(-.012)).add(a.left.scale(.008)), axis: a.left, ring: true, r: .005 });
    } else if (id === 'braue') {
      const p = pick((q) => { const t = h.t(q); return t > .6 && t < .72 && side(q) < -.022 && side(q) > -.05 ? fr(q) : null; });
      if (p) { parts.push({ at: p.add(a.up.scale(.008)).add(h.front.scale(.002)), axis: a.up, ring: false, r: .0022 }); parts.push({ at: p.add(a.up.scale(-.006)).add(h.front.scale(.002)), axis: a.up, ring: false, r: .0022 }); }
    } else if (id === 'lippe') {
      const p = pick((q, v) => (/BottomLip/.test(g.bone(v)) && Math.abs(side(q)) < .012 ? fr(q) - h.t(q) : null)) || pick((q) => { const t = h.t(q); return t > .28 && t < .38 && Math.abs(side(q)) < .012 ? fr(q) : null; });
      if (p) parts.push({ at: p.add(a.up.scale(-.006)), axis: a.left, ring: true, r: .0045 });
    }
  }
  if (!parts.length) return null;
  const pos: number[] = [], nrm: number[] = [], ind: number[] = [];
  for (const pr of parts) {
    const src = pr.ring ? CreateTorus('t', { diameter: pr.r * 2, thickness: pr.r * .32, tessellation: 14 }, scene) : CreateSphere('s', { diameter: pr.r * 2, segments: 6 }, scene);
    const sp = src.getVerticesData(VertexBuffer.PositionKind)!, sn = src.getVerticesData(VertexBuffer.NormalKind)!, si = src.getIndices()!;
    src.dispose();
    // Ring-Achse (lokal y) auf axis drehen
    const y = pr.axis.normalize(), x0 = Math.abs(y.y) < .9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0), x = Vector3.Cross(x0, y).normalize(), z = Vector3.Cross(x, y);
    const o = pos.length / 3;
    for (let i = 0; i < sp.length; i += 3) {
      const v = x.scale(sp[i]).add(y.scale(sp[i + 1])).add(z.scale(sp[i + 2])).add(pr.at), w = x.scale(sn[i]).add(y.scale(sn[i + 1])).add(z.scale(sn[i + 2]));
      pos.push(v.x, v.y, v.z); nrm.push(w.x, w.y, w.z);
    }
    for (const i of si) ind.push(o + i);
  }
  const m = new Mesh('piercing', scene), vd = new VertexData(), nv = pos.length / 3;
  vd.positions = pos; vd.normals = nrm; vd.indices = ind; vd.applyToMesh(m, false);
  const mi = new Array(nv * 4).fill(0), mw = new Array(nv * 4).fill(0);
  for (let i = 0; i < nv; i++) { mi[i * 4] = hb; mw[i * 4] = 1; }
  m.setVerticesData(VertexBuffer.MatricesIndicesKind, mi, false, 4); m.setVerticesData(VertexBuffer.MatricesWeightsKind, mw, false, 4);
  const mat = new PBRMaterial('silber', scene); mat.albedoColor = new Color3(.92, .9, .86); mat.metallic = 1; mat.roughness = .22;
  return attach(m, g.m, mat);
}

/** Alles anlegen (vorherige Teile vorher wegräumen): bodies = sichtbare Körper mit Haut, head = Kopf der Figur */
export function figMeshes(scene: Scene, bodies: Mesh[], head: Mesh | null, f: Fig): Mesh[] {
  const out: Mesh[] = [];
  const tat = f.tat || [];
  if (tat.length) for (const body of bodies) {
    const g = geo(body); if (!g) continue;
    const a = axes(g);
    for (const id of tat) {
      const pl = PLACES[id]?.(g, a), draw = DRAW[id]; if (!pl || !draw) continue;
      const m = layer(scene, g, pl, inkMat(scene, 'tattoo_' + id, draw), .0025, 'tattoo_' + id);
      if (m) out.push(m);
    }
  }
  if (head && (f.beard || f.pier?.length)) {
    const h = headInfo(head);
    if (h) {
      if (f.beard) { const [style, col] = f.beard.split(':'); const c = BEARD_COLORS.find((x) => x.id === col)?.c ?? BEARD_COLORS[0].c; const m = beard(scene, h, style, c); if (m) out.push(m); }
      if (f.pier?.length) { const m = jewel(scene, h, f.pier); if (m) out.push(m); }
    }
  }
  return out;
}
export function dropFig(list: Mesh[]) { for (const m of list) { const mat = m.material; m.dispose(); mat?.dispose(true, true); } }
