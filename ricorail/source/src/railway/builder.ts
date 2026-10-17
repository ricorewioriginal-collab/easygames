// Netzbaukasten: erzeugt aus einer Mittellinie mit Bahnhöfen ein vollständiges Gleisnetz
// (zwei- oder eingleisig, Blocksignale, Einfahr-/Ausfahrsignale, Überholgleise, Gleiswechsel, Abzweige, Rangiergleise).
import { NETWORK_SCHEMA, type CargoType, type NetworkDef, type SignalKind, type StationDef, type ThemeDef, type TrackDef } from './schema';

export type V3 = [number, number, number];

export interface YardSpec { n: number; len: number; side: 'L' | 'R'; name: string; industries?: { name: string; cargo: CargoType[]; action: 'load' | 'unload' | 'both'; track: number }[] }
export interface StationSpec {
  name: string;
  /** Index des Kontrollpunkts in ctrl */
  at: number;
  /** 2 = Außenbahnsteige an den Hauptgleisen, 4 = zusätzlich Überholgleise mit Mittelbahnsteigen */
  pt?: 2 | 4;
  len?: number;
  kind?: StationDef['kind'];
  pax?: number;
  yard?: YardSpec;
  junction?: { side: 'L' | 'R'; at: 'entry' | 'exit'; name: string };
  /** Bahnsteig auch bei Durchfahrt (z. B. Haltepunkt ohne Weichen) */
  halt?: boolean;
}
export interface LineSpec {
  id: string; name: string;
  ctrl: V3[];               // x, z, Höhe
  stations: StationSpec[];
  double: boolean;
  vmax: number | [number, number, number][]; // km/h oder Bereiche [s0,s1,v]
  elec: boolean;
  tunnels?: [number, number][];
  bridges?: [number, number][];
  rack?: [number, number][];
  block?: number;
  km0?: number;
  /** Anschluss an freie Gleisenden eines vorhandenen Abzweigs bzw. an das Ende einer zweigleisigen Linie (eingleisig: Zusammenführung per Weiche) */
  from?: { g1: string; g2?: string };
  /** Zusätzliche Kurvenglättung (Iterationen) */
  smooth?: number;
  maxGrade?: number;        // ‰
  crossings?: number[];     // Bahnübergänge bei s (m)
  slow?: [number, number, number][]; // Langsamfahrstellen
  /** Ring: Linie endet wieder an ihrem Anfang */
  ring?: boolean;
  /** Einfahrsignal am Anfang (bei Anschluss an Abzweig) */
  entrySignal?: string;
  /** Kein Prellbock an Linienende (offenes Ende für Anschluss) */
  openEnd?: boolean;
  openStart?: boolean;
  /** Kilometrierung umkehren */
}

export interface LineResult {
  len: number;
  stations: { name: string; id: string; s: number; junction?: { g1: string; g2?: string; pos: V3; dir: [number, number] } }[];
  start: { g1: string; g2?: string }; end: { g1: string; g2?: string };
  /** Mittellinie (für Landschaft/Karte) */
  center: Float64Array;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Zentripetale Catmull-Rom-Kurve durch die Kontrollpunkte, gleichmäßig abgetastet */
export function spline(ctrl: V3[], step = 20, smoothIter = 4): { pts: V3[]; sAt: number[]; cs: number[] } {
  const P = ctrl;
  const raw: V3[] = []; const ctrlIdx: number[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.ceil(d / (step / 2)));
    const tj = (a: V3, b: V3) => Math.pow(Math.max(1e-6, Math.hypot(b[0] - a[0], b[1] - a[1])), 0.5);
    const t0 = 0, t1 = t0 + tj(p0, p1), t2 = t1 + tj(p1, p2), t3 = t2 + tj(p2, p3);
    ctrlIdx.push(raw.length);
    for (let k = 0; k < n; k++) {
      const t = t1 + ((t2 - t1) * k) / n;
      const L = (a: V3, b: V3, ta: number, tb: number): V3 => {
        if (tb - ta < 1e-9) return [...a] as V3;
        const u = (t - ta) / (tb - ta);
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
      };
      const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
      const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
      raw.push(L(B1, B2, t1, t2));
    }
  }
  ctrlIdx.push(raw.length); raw.push([...P[P.length - 1]] as V3);
  // Glätten (Kontrollpunkte mit Bahnhöfen bleiben fest)
  const fixed = new Set(ctrlIdx);
  for (let it = 0; it < smoothIter; it++) {
    for (let i = 1; i < raw.length - 1; i++) {
      if (fixed.has(i)) continue;
      raw[i][0] = raw[i][0] * 0.5 + (raw[i - 1][0] + raw[i + 1][0]) * 0.25;
      raw[i][1] = raw[i][1] * 0.5 + (raw[i - 1][1] + raw[i + 1][1]) * 0.25;
    }
  }
  // gleichmäßig neu abtasten
  const cs = [0];
  for (let i = 1; i < raw.length; i++) cs.push(cs[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = cs[cs.length - 1];
  const n = Math.max(2, Math.round(total / step));
  const pts: V3[] = []; const outCs: number[] = [];
  let j = 0;
  for (let k = 0; k <= n; k++) {
    const s = (total * k) / n;
    while (j < cs.length - 2 && cs[j + 1] < s) j++;
    const f = (s - cs[j]) / Math.max(1e-9, cs[j + 1] - cs[j]);
    pts.push([raw[j][0] + (raw[j + 1][0] - raw[j][0]) * f, raw[j][1] + (raw[j + 1][1] - raw[j][1]) * f, raw[j][2] + (raw[j + 1][2] - raw[j][2]) * f]);
    outCs.push(s);
  }
  return { pts, sAt: ctrlIdx.map((i) => cs[i]), cs: outCs };
}

class Center {
  readonly pts: V3[]; readonly cs: number[]; readonly len: number; heights: number[];
  constructor(pts: V3[], cs: number[], heights: number[]) { this.pts = pts; this.cs = cs; this.len = cs[cs.length - 1]; this.heights = heights; }
  idx(s: number) { let lo = 0, hi = this.cs.length - 2; s = clamp(s, 0, this.len); while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.cs[m] <= s) lo = m; else hi = m - 1; } return lo; }
  at(s: number): { x: number; z: number; y: number; tx: number; tz: number } {
    const i = this.idx(s), a = this.pts[i], b = this.pts[i + 1];
    const l = Math.max(1e-9, this.cs[i + 1] - this.cs[i]), f = clamp((s - this.cs[i]) / l, 0, 1);
    const tx = (b[0] - a[0]) / l, tz = (b[1] - a[1]) / l;
    const y = this.heights[i] + (this.heights[i + 1] - this.heights[i]) * f;
    return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, y, tx, tz };
  }
  /** Punkt mit seitlichem Versatz (positiv = rechts in Linienrichtung) */
  off(s: number, o: number): V3 { const p = this.at(s); return [p.x - p.tz * o, p.y, p.z + p.tx * o]; }
}

export class NetBuilder {
  readonly def: NetworkDef;
  private n = 0;
  constructor(id: string, name: string, world: NetworkDef['world'], theme: ThemeDef, source?: string) {
    this.def = { schema: NETWORK_SCHEMA, id, name, world, theme, nodes: [], tracks: [], switches: [], signals: [], stations: [], industries: [], crossings: [], speeds: [], scenery: [], source };
  }
  uid(p: string) { return `${p}${(this.n++).toString(36)}`; }
  node(p: V3, id?: string): string { const nid = id ?? this.uid('n'); this.def.nodes.push({ id: nid, x: p[0], y: p[1], z: p[2] }); return nid; }
  nodePos(id: string): V3 { const n = this.def.nodes.find((x) => x.id === id)!; return [n.x, n.y, n.z]; }
  track(a: string, b: string, pts: V3[], o: Partial<TrackDef> & { vmax: number }): string {
    const id = o.id ?? this.uid('t');
    const flat: number[] = [];
    for (const p of pts) flat.push(Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100, Math.round(p[2] * 100) / 100);
    this.def.tracks.push({ ...o, id, a, b, pts: flat });
    return id;
  }
  sw(node: string, trunk: string, legs: string[], vDiv = 60): string { const id = this.uid('W'); this.def.switches.push({ id, node, trunk, legs, state: 0, vDiv }); return id; }
  signal(track: string, dir: 1 | -1, kind: SignalKind, name?: string, off?: number): string {
    let id = name ? `${name}` : this.uid('S');
    if (this.def.signals.some((x) => x.id === id)) { let k = 2; while (this.def.signals.some((x) => x.id === `${id}~${k}`)) k++; id = `${id}~${k}`; } this.def.signals.push({ id, track, dir, kind, name, off }); return id; }

  /** Baut eine Linie */
  line(spec: LineSpec): LineResult {
    let merge: { m: string; ca: string; cb: string } | undefined;
    const sp = spline(spec.ctrl, 20, spec.smooth ?? 6);
    // Höhenprofil: Kontrollpunkthöhen, glatt interpoliert, Steigung begrenzt
    const sAt = sp.sAt;
    const h = sp.cs.map((s) => {
      let i = 0; while (i < sAt.length - 2 && sAt[i + 1] < s) i++;
      const f = clamp((s - sAt[i]) / Math.max(1, sAt[i + 1] - sAt[i]), 0, 1);
      return spec.ctrl[i][2] + (spec.ctrl[i + 1][2] - spec.ctrl[i][2]) * smoothstep(f);
    });
    const C = new Center(sp.pts.map((p) => [p[0], p[1], p[2]] as V3), sp.cs, h);
    // Bahnhöfe flach legen
    const stS = spec.stations.map((st) => sAt[st.at]);
    spec.stations.forEach((st, k) => {
      const s0 = stS[k] - (st.len ?? 220) / 2 - 250, s1 = stS[k] + (st.len ?? 220) / 2 + 250;
      const i0 = C.idx(s0), i1 = C.idx(s1) + 1, hc = C.at(stS[k]).y;
      for (let i = i0; i <= i1 && i < h.length; i++) {
        const s = C.cs[i]; const w = s < stS[k] ? smoothstep(clamp((s - s0) / 250, 0, 1)) : smoothstep(clamp((s1 - s) / 250, 0, 1));
        h[i] = h[i] * (1 - w) + hc * w;
      }
    });
    const maxG = (spec.maxGrade ?? 25) / 1000;
    for (let it = 0; it < 3; it++) {
      for (let i = 1; i < h.length; i++) { const ds = C.cs[i] - C.cs[i - 1]; h[i] = clamp(h[i], h[i - 1] - maxG * ds, h[i - 1] + maxG * ds); }
      for (let i = h.length - 2; i >= 0; i--) { const ds = C.cs[i + 1] - C.cs[i]; h[i] = clamp(h[i], h[i + 1] - maxG * ds, h[i + 1] + maxG * ds); }
    }
    const len = C.len;
    const vAt = (s: number) => typeof spec.vmax === 'number' ? spec.vmax : (spec.vmax.find((r) => s >= r[0] && s < r[1])?.[2] ?? spec.vmax[spec.vmax.length - 1][2]);
    const inR = (rs: [number, number][] | undefined, a: number, b: number) => !!rs?.some((r) => a < r[1] && b > r[0] && (Math.min(b, r[1]) - Math.max(a, r[0])) > (b - a) * 0.5);
    const OFF = spec.double ? 2.25 : 0;
    // Eingleisige Fortsetzung einer zweigleisigen Strecke: beide Gleise per Weiche zusammenführen
    if (!spec.double && spec.from?.g2) {
      const m = this.node(C.off(0, 0));
      const A = this.nodePos(spec.from.g1), B = this.nodePos(spec.from.g2), M = this.nodePos(m);
      const mk = (P: V3) => { const pts: V3[] = []; for (let k = 0; k <= 6; k++) { const f = smoothstep(k / 6); pts.push([P[0] + (M[0] - P[0]) * (k / 6), P[1] + (M[1] - P[1]) * f, P[2] + (M[2] - P[2]) * (k / 6)]); } return pts; };
      const ca = this.track(spec.from.g1, m, mk(A), { vmax: 80, elec: spec.elec, single: `${spec.id}:0` });
      const cb = this.track(spec.from.g2, m, mk(B), { vmax: 60, elec: spec.elec, single: `${spec.id}:0` });
      merge = { m, ca, cb };
      spec = { ...spec, from: { g1: m } };
    }
    const LOOP = spec.double ? 2.25 + 10 : 6.5; // Überholgleis (Mittelbahnsteig 7,5 m breit)
    const km0 = spec.km0 ?? 0;
    const blockLen = spec.block ?? 3000;
    const sw = 120; // Länge Weichenverbindung
    // Schnittpunkte je Gleis sammeln
    interface Cut { s: number; kind: 'sig' | 'sw' | 'end'; sig?: { dir: 1 | -1; kind: SignalKind; name: string }[]; tag?: string }
    const tracksSpec = spec.double ? (['g1', 'g2'] as const) : (['g1'] as const);
    const cuts: Record<string, Cut[]> = { g1: [], g2: [] };
    const result: LineResult = { len, stations: [], start: { g1: '' }, end: { g1: '' }, center: new Float64Array(C.pts.flatMap((p, i) => [p[0], h[i], p[1]])) };
    const stInfo: { s0: number; s1: number; spec: StationSpec; s: number; id: string; term: 'start' | 'end' | null }[] = [];
    spec.stations.forEach((st, k) => {
      const L = st.len ?? 220, s = stS[k];
      const term = k === 0 && Math.abs(s) < 1 && !spec.from && !spec.openStart ? 'start' : k === spec.stations.length - 1 && Math.abs(s - len) < 1 && !spec.ring && !spec.openEnd ? 'end' : null;
      let s0 = s - L / 2, s1 = s + L / 2;
      if (term === 'start') { s0 = 40; s1 = 40 + L; }
      if (term === 'end') { s1 = len - 40; s0 = s1 - L; }
      stInfo.push({ s0, s1, spec: st, s: (s0 + s1) / 2, id: `${spec.id}_${k}`, term });
    });
    const abbr = (name: string) => name.replace(/[^A-Za-zÄÖÜäöü]/g, '').slice(0, 3).toUpperCase();
    // Signale je Bahnhof: Einfahrsignale vor den Weichen, Ausfahrsignale am Bahnsteigende
    const extOf = (st: { spec: StationSpec }) => (!spec.double ? 140 : (st.spec.pt ?? 2) === 4 ? 140 : 0);
    for (const st of stInfo) {
      if (st.spec.halt) continue;
      const a = abbr(st.spec.name), ext = extOf(st);
      const eIn = st.s0 - ext - (spec.double ? sw : 0) - 60 - (st.term === 'end' && spec.double ? sw + 30 : 0);
      const eOut = st.s1 + ext + (spec.double ? sw : 0) + 60 + (st.term === 'start' && spec.double ? sw + 30 : 0);
      const pIn = st.s0 - (ext || 15), pOut = st.s1 + (ext || 15);
      if (st.term !== 'start') cuts.g1.push({ s: eIn, kind: 'sig', sig: [{ dir: 1, kind: 'main', name: `${a}-A` }] });
      if (st.term !== 'end') (spec.double ? cuts.g2 : cuts.g1).push({ s: eOut, kind: 'sig', sig: [{ dir: -1, kind: 'main', name: `${a}-F` }] });
      if (spec.double) {
        if (st.term !== 'end') cuts.g1.push({ s: pOut, kind: 'sig', sig: [{ dir: 1, kind: 'main', name: `${a}-N1` }] });
        if (st.term !== 'start') cuts.g2.push({ s: pIn, kind: 'sig', sig: [{ dir: -1, kind: 'main', name: `${a}-P2` }] });
        if (st.term === 'end') cuts.g1.push({ s: pIn, kind: 'sig', sig: [{ dir: -1, kind: 'main', name: `${a}-P1` }] });
        if (st.term === 'start') cuts.g2.push({ s: pOut, kind: 'sig', sig: [{ dir: 1, kind: 'main', name: `${a}-N2` }] });
      } else {
        // eingleisig: Ausfahrsignale stehen an den Weichenanfängen des Kreuzungsbahnhofs (Schnitte der Überholgleise)
        if (st.term !== 'end') cuts.g1.push({ s: pOut, kind: 'sig', sig: [{ dir: 1, kind: 'main', name: `${a}-N1` }] });
        if (st.term !== 'start') cuts.g1.push({ s: pIn, kind: 'sig', sig: [{ dir: -1, kind: 'main', name: `${a}-P1` }] });
      }
    }
    // Blocksignale auf freier Strecke
    for (let k = 0; k + 1 < stInfo.length; k++) {
      const a = stInfo[k].s1 + sw + 400, b = stInfo[k + 1].s0 - sw - 400;
      const nb = Math.floor((b - a) / blockLen);
      for (let i = 1; i <= nb; i++) {
        const s = a + ((b - a) * i) / (nb + 1);
        const nm = `Bk${Math.round((km0 * 1000 + s) / 100)}`;
        if (spec.double) { cuts.g1.push({ s, kind: 'sig', sig: [{ dir: 1, kind: 'block', name: `${nm}a` }] }); cuts.g2.push({ s: s + 30, kind: 'sig', sig: [{ dir: -1, kind: 'block', name: `${nm}b` }] }); }
        else cuts.g1.push({ s, kind: 'sig', sig: [{ dir: 1, kind: 'block', name: `${nm}a` }, { dir: -1, kind: 'block', name: `${nm}b` }] });
      }
    }
    // Weichenpunkte: Überholgleise, Gleiswechsel, Abzweige, Gleisenden
    interface Loop { st: number; side: 'L' | 'R'; base: 'g1' | 'g2'; sA: number; sB: number; plat: boolean; stubA?: boolean; stubB?: boolean }
    const loops: Loop[] = []; const xovers: { s: number; from: 'g1' | 'g2' }[] = [];
    const juncs: { st: number; side: 'L' | 'R'; s: number; base: 'g1' | 'g2' }[] = [];
    stInfo.forEach((st, k) => {
      if (st.spec.halt) return;
      const pt = st.spec.pt ?? 2;
      const ext = extOf(st);
      const stubA = st.term === 'start', stubB = st.term === 'end';
      if (pt === 4 || !spec.double) {
        if (spec.double) {
          loops.push({ st: k, side: 'R', base: 'g1', sA: stubA ? st.s0 : st.s0 - ext, sB: stubB ? st.s1 : st.s1 + ext, plat: true, stubA, stubB });
          loops.push({ st: k, side: 'L', base: 'g2', sA: stubA ? st.s0 : st.s0 - ext, sB: stubB ? st.s1 : st.s1 + ext, plat: true, stubA, stubB });
        } else loops.push({ st: k, side: 'L', base: 'g1', sA: stubA ? st.s0 : st.s0 - ext, sB: stubB ? st.s1 : st.s1 + ext, plat: true, stubA, stubB });
      }
      if (spec.double) {
        if (st.term !== 'start') xovers.push({ s: st.s0 - ext - sw - 30, from: 'g1' });
        if (st.term !== 'end') xovers.push({ s: st.s1 + ext + 30, from: 'g2' });
        if (st.term === 'end') xovers.push({ s: st.s0 - ext - 2 * sw - 50, from: 'g2' });
        if (st.term === 'start') xovers.push({ s: st.s1 + ext + sw + 50, from: 'g1' });
      }
      const j = st.spec.junction;
      if (j) {
        if (spec.double && j.side !== 'R') throw new Error(`${spec.name}: Abzweige an zweigleisigen Strecken nur rechts (Gleis 1)`);
        if (j.at === 'entry' && spec.double) throw new Error(`${spec.name}: Abzweig zweigleisig nur an der Ausfahrt`);
        const s = j.at === 'exit' ? st.s1 + ext + (spec.double ? sw + 90 : 120) : st.s0 - ext - 120;
        juncs.push({ st: k, side: j.side, s, base: 'g1' });
      }
    });
    for (const l of loops) { if (!l.stubA) cuts[l.base].push({ s: l.sA, kind: 'sw', tag: 'loopA' }); if (!l.stubB) cuts[l.base].push({ s: l.sB, kind: 'sw', tag: 'loopB' }); }
    for (const x of xovers) { const to = x.from === 'g1' ? 'g2' : 'g1'; cuts[x.from].push({ s: x.s, kind: 'sw', tag: 'xA' }); cuts[to].push({ s: x.s + sw, kind: 'sw', tag: 'xB' }); }
    for (const j of juncs) cuts[j.base].push({ s: j.s, kind: 'sw', tag: 'jn' });
    // Bahnübergänge erzeugen keine Schnitte
    // Gleise bauen
    const nodesAt: Record<string, Map<number, string>> = { g1: new Map(), g2: new Map() };
    const segs: Record<string, { id: string; s0: number; s1: number; a: string; b: string }[]> = { g1: [], g2: [] };
    for (const g of tracksSpec) {
      const o = g === 'g1' ? OFF : -OFF;
      const list = cuts[g].filter((c) => c.s > 5 && c.s < len - 5).sort((x, y) => x.s - y.s);
      // Doppelte Positionen zusammenfassen
      const pos: number[] = [];
      for (const c of list.filter((x) => x.kind === 'sw')) { if (pos.some((p) => Math.abs(p - c.s) < 8)) throw new Error(`${spec.name}: Weichen zu dicht (${Math.round(c.s)} m)`); pos.push(c.s); }
      for (const c of list.filter((x) => x.kind !== 'sw')) { const near = pos.find((p) => Math.abs(p - c.s) < 8); if (near !== undefined) c.s = near; else pos.push(c.s); }
      pos.sort((x, y) => x - y); pos.unshift(0); pos.push(len);
      const startNode = g === 'g1' ? spec.from?.g1 : spec.from?.g2;
      for (let i = 0; i < pos.length; i++) {
        let id: string;
        if (i === 0 && startNode) id = startNode;
        else if (i === pos.length - 1 && spec.ring) id = nodesAt[g].get(0)!;
        else id = this.node(C.off(pos[i], o));
        nodesAt[g].set(pos[i], id);
      }
      const endNode = spec.ring ? nodesAt[g].get(0) : undefined;
      for (let i = 0; i + 1 < pos.length; i++) {
        const s0 = pos[i], s1 = pos[i + 1];
        const pts: V3[] = [];
        const a = nodesAt[g].get(s0)!, b = nodesAt[g].get(s1)!;
        pts.push(i === 0 && startNode ? this.nodePos(startNode) : C.off(s0, o));
        const i0 = C.idx(s0) + 1, i1 = C.idx(s1);
        for (let k = i0; k <= i1; k++) if (C.cs[k] > s0 + 0.5 && C.cs[k] < s1 - 0.5) pts.push(C.off(C.cs[k], o));
        pts.push(i + 2 === pos.length && endNode ? this.nodePos(endNode) : C.off(s1, o));
        const mid = (s0 + s1) / 2;
        const id = this.track(a, b, pts, {
          vmax: vAt(mid), elec: spec.elec, tunnel: inR(spec.tunnels, s0, s1) || undefined, bridge: inR(spec.bridges, s0, s1) || undefined,
          rack: inR(spec.rack, s0, s1) || undefined, km0: km0 + s0 / 1000, name: `${spec.name} Gl. ${g === 'g1' ? 1 : 2}`,
          single: spec.double ? undefined : (() => { const l = loops.find((x) => mid > x.sA && mid < x.sB); return l ? `${spec.id}:st${l.st}` : `${spec.id}:${stInfo.findIndex((st) => st.s > mid)}`; })(),
          pref: spec.double ? (g === 'g1' ? 1 : -1) : undefined,
        });
        segs[g].push({ id, s0, s1, a, b });
      }
      // Signale anlegen (zweigleisig: Gleiswechselbetrieb – jedes Signal auch für die Gegenrichtung)
      for (const c of list) {
        if (!c.sig) continue;
        const all = spec.double ? [...c.sig, ...c.sig.map((x) => ({ ...x, dir: (x.dir * -1) as 1 | -1, name: x.name + 'g' }))] : c.sig;
        for (const sg of all) {
          // Signal steht am Ende des Abschnitts in Fahrtrichtung
          const seg = sg.dir > 0 ? segs[g].find((x) => Math.abs(x.s1 - c.s) < 9) : segs[g].find((x) => Math.abs(x.s0 - c.s) < 9);
          if (seg) this.signal(seg.id, sg.dir, sg.kind, `${spec.id}.${sg.name}`);
        }
      }
    }
    if (spec.entrySignal && spec.from) this.signal(segs.g1[0].id, -1, 'main', `${spec.id}.${spec.entrySignal}`);
    if (merge) this.sw(merge.m, segs.g1[0].id, [merge.ca, merge.cb], 60);
    const segAt = (g: string, s: number) => segs[g].find((x) => s >= x.s0 - 0.01 && s <= x.s1 + 0.01)!;
    const segEndingAt = (g: string, s: number) => segs[g].find((x) => Math.abs(x.s1 - s) < 9)!;
    const segStartingAt = (g: string, s: number) => segs[g].find((x) => Math.abs(x.s0 - s) < 9)!;
    // Überholgleise (an Endbahnhöfen als Stumpfgleis)
    const nodeNear = (g: string, s: number) => nodesAt[g].get([...nodesAt[g].keys()].find((x) => Math.abs(x - s) < 9)!)!;
    for (const l of loops) {
      const side = l.side === 'R' ? 1 : -1;
      const o0 = l.base === 'g1' ? OFF : -OFF, o1 = side * LOOP;
      const pts: V3[] = [];
      for (let s = l.sA; s <= l.sB + 0.1; s += 10) {
        const f1 = l.stubA ? 1 : smoothstep(clamp((s - l.sA) / sw, 0, 1)), f2 = l.stubB ? 1 : smoothstep(clamp((l.sB - s) / sw, 0, 1));
        pts.push(C.off(Math.min(s, l.sB), o0 + (o1 - o0) * Math.min(f1, f2)));
      }
      const nA = l.stubA ? this.node(pts[0]) : nodeNear(l.base, l.sA);
      const nB = l.stubB ? this.node(pts[pts.length - 1]) : nodeNear(l.base, l.sB);
      pts[0] = this.nodePos(nA); pts[pts.length - 1] = this.nodePos(nB);
      const st = stInfo[l.st];
      const lid = this.track(nA, nB, pts, { vmax: 80, elec: spec.elec, km0: km0 + l.sA / 1000, name: `${st.spec.name} Gl. ${l.side === 'R' ? 3 : 4}`,
        rack: inR(spec.rack, l.sA, l.sB) || undefined, single: spec.double ? undefined : `${spec.id}:st${l.st}` });
      if (!l.stubA) this.sw(nA, segEndingAt(l.base, l.sA).id, [segStartingAt(l.base, l.sA).id, lid], 60);
      if (!l.stubB) this.sw(nB, segStartingAt(l.base, l.sB).id, [segEndingAt(l.base, l.sB).id, lid], 60);
      const a = abbr(st.spec.name), nr = spec.double ? (l.side === 'R' ? 3 : 4) : 2;
      const goes = [1, -1];
      for (const d of goes as (1 | -1)[]) {
        if ((d > 0 && l.stubB) || (d < 0 && l.stubA)) continue;
        this.signal(lid, d, 'main', `${spec.id}.${a}-${d > 0 ? 'N' : 'P'}${nr}`, (d > 0 ? l.stubB : l.stubA) ? 12 : sw + 15);
      }
      (l as Loop & { id?: string }).id = lid;
    }
    // Gleiswechsel
    for (const x of xovers) {
      const to = x.from === 'g1' ? 'g2' : 'g1';
      const nA = nodesAt[x.from].get([...nodesAt[x.from].keys()].find((s) => Math.abs(s - x.s) < 9)!)!;
      const nB = nodesAt[to].get([...nodesAt[to].keys()].find((s) => Math.abs(s - (x.s + sw)) < 9)!)!;
      const oA = x.from === 'g1' ? OFF : -OFF, oB = -oA;
      const pts: V3[] = [];
      for (let s = x.s; s <= x.s + sw + 0.1; s += 10) pts.push(C.off(s, oA + (oB - oA) * smoothstep((s - x.s) / sw)));
      pts[0] = this.nodePos(nA); pts[pts.length - 1] = this.nodePos(nB);
      const did = this.track(nA, nB, pts, { vmax: 60, elec: spec.elec, km0: km0 + x.s / 1000 });
      this.sw(nA, segEndingAt(x.from, x.s).id, [segStartingAt(x.from, x.s).id, did], 60);
      this.sw(nB, segStartingAt(to, x.s + sw).id, [segEndingAt(to, x.s + sw).id, did], 60);
    }
    // Abzweige: eingleisige Verbindung mit freiem Ende (Anschluss für Zweigstrecke)
    for (const j of juncs) {
      const side = j.side === 'R' ? 1 : -1;
      const st = stInfo[j.st];
      const exit = st.spec.junction!.at === 'exit';
      const nA = nodesAt.g1.get([...nodesAt.g1.keys()].find((s) => Math.abs(s - j.s) < 9)!)!;
      const L = 200, sEnd = exit ? j.s + L : j.s - L;
      const p = C.at(sEnd);
      const pts: V3[] = [];
      for (let k = 0; k <= L / 10; k++) { const s = exit ? j.s + k * 10 : j.s - k * 10; pts.push(C.off(s, OFF + side * 22 * smoothstep((k * 10) / L))); }
      pts[0] = this.nodePos(nA);
      const endP = pts[pts.length - 1];
      const endNode = this.node(endP);
      const jid = this.track(nA, endNode, pts, { vmax: 60, elec: spec.elec, name: `Abzweig ${st.spec.junction!.name}` });
      if (exit) this.sw(nA, segEndingAt('g1', j.s).id, [segStartingAt('g1', j.s).id, jid], 60);
      else this.sw(nA, segStartingAt('g1', j.s).id, [segEndingAt('g1', j.s).id, jid], 60);
      const dir: [number, number] = exit ? [p.tx, p.tz] : [-p.tx, -p.tz];
      const pp = C.at(sEnd);
      dir[0] += -pp.tz * side * 0.25 * (exit ? 1 : -1); dir[1] += pp.tx * side * 0.25 * (exit ? 1 : -1);
      const nl = Math.hypot(dir[0], dir[1]); dir[0] /= nl; dir[1] /= nl;
      result.stations[j.st] = { name: st.spec.name, id: st.id, s: st.s, junction: { g1: endNode, pos: endP, dir } };
    }
    // Rangier-/Abstellgleise: Fächer hinter der Ausfahrt (Gleis 1, bzw. Gleis 2 bei Seite L)
    stInfo.forEach((st, k) => {
      const y = st.spec.yard; if (!y) return;
      if (st.term) throw new Error(`${spec.name}: Rangiergleise nicht an Endbahnhöfen`);
      const base: 'g1' | 'g2' = y.side === 'R' || !spec.double ? 'g1' : 'g2';
      const side = y.side === 'R' ? 1 : -1;
      const baseOff = base === 'g1' ? OFF : -OFF;
      const ext = (st.spec.pt ?? 2) === 4 ? 140 : 0;
      // g1: hinter der Ausfahrt (Fahrtrichtung +1), g2: vor der Einfahrt in Gegenrichtung (Fahrtrichtung -1)
      const sj = base === 'g1' ? st.s1 + ext + sw + 60 + 90 + (juncs.some((j) => j.st === k) ? 240 : 0) : st.s0 - ext - sw - 60 - 90 - (spec.double ? 160 : 0);
      const fwd = base === 'g1' ? 1 : -1;
      const seg = segAt(base, sj);
      const host = this.def.tracks.find((t) => t.id === seg.id)!;
      const nPos = C.off(sj, baseOff);
      const nJ = this.node(nPos);
      const parts = this.splitTrack(host, nJ, nPos);
      segs[base].splice(segs[base].indexOf(seg), 1, { id: parts[0], s0: seg.s0, s1: sj, a: seg.a, b: nJ }, { id: parts[1], s0: sj, s1: seg.s1, a: nJ, b: seg.b });
      const fanOff = baseOff + side * 9;
      const lead: V3[] = [];
      for (let k2 = 0; k2 <= 8; k2++) lead.push(C.off(sj + fwd * k2 * 10, baseOff + (fanOff - baseOff) * smoothstep(k2 / 8)));
      lead[0] = nPos;
      const nF = this.node(lead[lead.length - 1]);
      const leadId = this.track(nJ, nF, lead, { vmax: 40, yard: true, elec: spec.elec, name: `${y.name} Zufahrt` });
      if (fwd > 0) this.sw(nJ, parts[0], [parts[1], leadId], 40); else this.sw(nJ, parts[1], [parts[0], leadId], 40);
      let prevNode = nF, prevTrunk = leadId;
      const yardIds: string[] = [];
      const fanStart = sj + fwd * 80;
      for (let i = 0; i < y.n; i++) {
        const isLast = i === y.n - 1;
        const sStart = fanStart + fwd * i * 25;
        const o1 = fanOff + side * 5 * (i + 1);
        const pts: V3[] = [this.nodePos(prevNode)];
        const steps = Math.ceil((40 + y.len) / 10);
        for (let k2 = 1; k2 <= steps; k2++) { const d = k2 * 10; pts.push(C.off(sStart + fwd * d, isLast ? o1 : fanOff + (o1 - fanOff) * smoothstep(clamp(d / 40, 0, 1)))); }
        const endNode = this.node(pts[pts.length - 1]);
        const tid = this.track(prevNode, endNode, pts, { vmax: 25, yard: true, elec: spec.elec, name: `${y.name} Gl. ${i + 1}` });
        yardIds.push(tid);
        if (!isLast) {
          const nextP = C.off(sStart + fwd * 25, fanOff);
          const nNext = this.node(nextP);
          const contId = this.track(prevNode, nNext, [this.nodePos(prevNode), nextP], { vmax: 25, yard: true, elec: spec.elec });
          this.sw(prevNode, prevTrunk, [contId, tid], 25);
          prevNode = nNext; prevTrunk = contId;
        }
      }
      this.signal(leadId, -1, 'shunt', `${spec.id}.${abbr(st.spec.name)}-Ra`, 15);
      for (const ind of y.industries ?? []) {
        const tid = yardIds[Math.min(ind.track, yardIds.length - 1)];
        this.def.industries.push({ id: this.uid('I'), name: ind.name, track: tid, s0: 45, s1: 30 + y.len, cargo: ind.cargo, action: ind.action });
      }
      this.def.stations.push({ id: `${st.id}_y`, name: `${st.spec.name} ${y.name}`, kind: 'yard', platforms: [] });
    });
    // Bahnsteige + Stationen
    stInfo.forEach((st, k) => {
      const plats: StationDef['platforms'] = [];
      const pt = st.spec.pt ?? 2;
      const add = (g: 'g1' | 'g2', side: 'L' | 'R', nr: string) => {
        const seg = segAt(g, st.s);
        const t = this.def.tracks.find((x) => x.id === seg.id)!;
        const s0 = Math.max(0, st.s0 - seg.s0), s1 = Math.min(seg.s1 - seg.s0, st.s1 - seg.s0);
        plats.push({ track: t.id, s0, s1, side, nr });
      };
      if (spec.double) {
        if (pt === 4) {
          for (const l of loops.filter((x) => x.st === k) as (Loop & { id: string })[]) {
            const t = this.def.tracks.find((x) => x.id === l.id)!; const tr = l.base;
            const base = segAt(tr, st.s); const bt = this.def.tracks.find((x) => x.id === base.id)!;
            const sOff = (s: number) => s - l.sA;
            plats.push({ track: t.id, s0: sOff(st.s0), s1: sOff(st.s1), side: l.side === 'R' ? 'L' : 'R', nr: l.side === 'R' ? '3' : '4' });
            plats.push({ track: bt.id, s0: st.s0 - base.s0, s1: st.s1 - base.s0, side: l.side === 'R' ? 'R' : 'L', nr: l.side === 'R' ? '1' : '2' });
          }
        } else { add('g1', 'R', '1'); add('g2', 'L', '2'); }
      } else {
        add('g1', 'R', '1');
        const l = loops.find((x) => x.st === k) as (Loop & { id: string }) | undefined;
        if (l) plats.push({ track: l.id, s0: st.s0 - l.sA, s1: st.s1 - l.sA, side: 'L', nr: '2' });
      }
      this.def.stations.push({ id: st.id, name: st.spec.name, kind: st.spec.kind ?? (st.spec.halt ? 'halt' : 'station'), platforms: plats, pax: st.spec.pax ?? 300, km: Math.round((km0 + st.s / 1000) * 10) / 10 });
      result.stations[k] = { ...(result.stations[k] ?? {}), name: st.spec.name, id: st.id, s: st.s };
    });
    // Bahnübergänge und Langsamfahrstellen
    for (const s of spec.crossings ?? []) for (const g of tracksSpec) { const seg = segAt(g, s); this.def.crossings.push({ id: this.uid('B'), track: seg.id, s: s - seg.s0 }); }
    for (const [a, b, v] of spec.slow ?? []) for (const g of tracksSpec) { const seg = segAt(g, a); this.def.speeds.push({ id: this.uid('L'), track: seg.id, s0: a - seg.s0, s1: Math.min(b, seg.s1) - seg.s0, vmax: v, kind: 'slow' }); }
    result.start = { g1: segs.g1[0].a, g2: spec.double ? segs.g2[0].a : undefined };
    result.end = { g1: segs.g1[segs.g1.length - 1].b, g2: spec.double ? segs.g2[segs.g2.length - 1].b : undefined };
    return result;
  }

  /** Teilt ein Gleis an einem neuen Knoten (Punkt liegt auf dem Gleis) */
  splitTrack(t: TrackDef, node: string, p: V3): [string, string] {
    const n = t.pts.length / 3; let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) { const d = Math.hypot(t.pts[i * 3] - p[0], t.pts[i * 3 + 2] - p[2]); if (d < bd) { bd = d; best = i; } }
    best = clamp(best, 1, n - 2);
    const A = t.pts.slice(0, best * 3), B = t.pts.slice((best + 1) * 3);
    const P = [p[0], p[1], p[2]];
    const id1 = t.id, id2 = this.uid('t');
    const oldB = t.b;
    t.pts = [...A, ...P]; t.b = node;
    const t2: TrackDef = { ...t, id: id2, a: node, b: oldB, pts: [...P, ...B] };
    if (t.km0 !== undefined) { let l = 0; for (let i = 1; i < t.pts.length / 3; i++) l += Math.hypot(t.pts[i * 3] - t.pts[i * 3 - 3], t.pts[i * 3 + 2] - t.pts[i * 3 - 1]); t2.km0 = t.km0 + l / 1000; }
    this.def.tracks.splice(this.def.tracks.indexOf(t) + 1, 0, t2);
    // Signale mit Richtung +1 stehen am Ende → auf zweiten Teil
    for (const sg of this.def.signals) if (sg.track === id1 && sg.dir === 1) sg.track = id2;
    for (const s of this.def.switches) {
      if (s.node === oldB) { if (s.trunk === id1) s.trunk = id2; s.legs = s.legs.map((l) => (l === id1 ? id2 : l)); }
    }
    for (const c of this.def.crossings) if (c.track === id1) { /* bleibt vorne */ }
    return [id1, id2];
  }

  /** Prellböcke an freien Enden ergänzen ist implizit: ein Gleisende ohne Anschluss ist ein Prellbock. */
  done(): NetworkDef { return this.def; }
}

/** Geografische Koordinaten → lokale Meter (äquidistante Projektion um Bezugspunkt) */
export function geo(lat: number, lon: number, lat0: number, lon0: number): [number, number] {
  const R = 6371000;
  const x = ((lon - lon0) * Math.PI / 180) * R * Math.cos(lat0 * Math.PI / 180);
  const z = -((lat - lat0) * Math.PI / 180) * R;
  return [x, z];
}
