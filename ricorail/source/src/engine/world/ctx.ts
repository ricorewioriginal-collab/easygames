// Einmalige Vorberechnung: Gleisläufe je Chunk, Signale, Bahnübergänge, Portale, Bahnsteige, Gebäudeplätze.
import type { Network } from '../../railway/network';
import type { IndustryDef, PlatformDef, SceneryDef, StationDef } from '../../railway/schema';
import { F_TUN, TrackIndex, Terrain, type Near } from './field';
import { Materials } from './materials';
import { strHash } from './noise';

/** Chunkgröße (m) */
export const CH = 500;
export const ckey = (cx: number, cz: number) => (cx + 32768) * 65536 + (cz + 32768);
const keyOf = (x: number, z: number) => ckey(Math.floor(x / CH), Math.floor(z / CH));

export interface Run { t: number; i0: number; i1: number }
export interface SigInfo { id: string; kind: 0 | 1 | 2; x: number; y: number; z: number; fx: number; fz: number; sx: number; sz: number }
export interface CrossGroup { ids: string[]; x: number; y: number; z: number; rdx: number; rdz: number; tdx: number; tdz: number; uMin: number; uMax: number }
export interface Portal { x: number; y: number; z: number; dx: number; dz: number; nx: number; nz: number; L: number; R: number }
export interface PlatInfo { p: PlatformDef; st: StationDef; w: number }
export interface Bld { st: StationDef; x: number; y: number; z: number; dx: number; dz: number; fx: number; fz: number; big: boolean }
export interface StPoint { x: number; z: number; pax: number }

export class WorldCtx {
  readonly idx: TrackIndex;
  readonly terrain: Terrain;
  readonly mats = new Materials();
  readonly seed: number;
  /** Rechts-Normale je Stützpunkt */
  readonly nx: Float64Array[] = []; readonly nz: Float64Array[] = [];
  /** seitlicher Abstand zum Nachbargleis (links/rechts in a→b), Infinity = frei */
  readonly gapL: Float64Array; readonly gapR: Float64Array;
  readonly runs = new Map<number, Run[]>();
  readonly sigs = new Map<number, SigInfo[]>();
  readonly xings = new Map<number, CrossGroup[]>();
  readonly portals: Portal[] = [];
  readonly plats = new Map<number, PlatInfo[]>();
  readonly inds = new Map<number, IndustryDef[]>();
  readonly blds = new Map<number, Bld[]>();
  readonly scen = new Map<number, SceneryDef[]>();
  readonly stPts: StPoint[] = [];
  private readonly near: Near = { seg: -1, d: 0, y: 0, t: 0 };

  constructor(readonly net: Network) {
    this.seed = strHash(net.def.id) & 0xffff;
    this.idx = new TrackIndex(net);
    this.terrain = new Terrain(net, this.idx, this.seed);
    const T = this.idx.tracks, nt = T.length;
    this.gapL = new Float64Array(nt); this.gapR = new Float64Array(nt);
    T.forEach((t, ti) => {
      const n = t.px.length, nx = new Float64Array(n), nz = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let tx = 0, tz = 0;
        if (i > 0) { const dx = t.px[i] - t.px[i - 1], dz = t.pz[i] - t.pz[i - 1], l = Math.hypot(dx, dz) || 1; tx += dx / l; tz += dz / l; }
        if (i < n - 1) { const dx = t.px[i + 1] - t.px[i], dz = t.pz[i + 1] - t.pz[i], l = Math.hypot(dx, dz) || 1; tx += dx / l; tz += dz / l; }
        const l = Math.hypot(tx, tz) || 1; nx[i] = -tz / l; nz[i] = tx / l;
      }
      this.nx.push(nx); this.nz.push(nz);
      // Nachbargleise an drei Stellen prüfen (Minimum)
      let L = Infinity, R = Infinity;
      for (const f of [0.25, 0.5, 0.75]) {
        const p = t.point(t.len * f), [l, r] = this.idx.sideGaps(p.x, p.z, -p.dz, p.dx, ti, 12);
        L = Math.min(L, l); R = Math.min(R, r);
      }
      this.gapL[ti] = L; this.gapR[ti] = R;
      // Gleisläufe je Chunk (Segment gehört zum Chunk seiner Mitte)
      let cur: Run | null = null, curKey = -1;
      for (let i = 0; i + 1 < n; i++) {
        const k = keyOf((t.px[i] + t.px[i + 1]) / 2, (t.pz[i] + t.pz[i + 1]) / 2);
        if (cur && k === curKey && cur.i1 === i - 1) { cur.i1 = i; continue; }
        cur = { t: ti, i0: i, i1: i }; curKey = k; push(this.runs, k, cur);
      }
    });
    this.prepSignals(); this.prepCrossings(); this.prepPortals(); this.prepStations();
    for (const ind of net.def.industries) { const ti = this.idx.tIndex.get(ind.track); if (ti !== undefined) push(this.inds, ti, ind); }
    for (const s of net.def.scenery ?? []) push(this.scen, keyOf(s.x, s.z), s);
  }

  private prepSignals() {
    for (const s of this.net.signals.values()) {
      const ti = this.idx.tIndex.get(s.track); if (ti === undefined) continue;
      const t = this.idx.tracks[ti], p = t.point(s.s);
      const tx = p.dx * s.dir, tz = p.dz * s.dir; // Fahrtrichtung
      let sx = -tz, sz = tx, lat = 3.0; // rechts in Fahrtrichtung
      const kind = s.def.kind === 'main' ? 0 : s.def.kind === 'block' ? 1 : 2;
      if (kind === 2) lat = 1.75;
      else { const gap = s.dir > 0 ? this.gapR[ti] : this.gapL[ti]; if (gap < 7) { sx = -sx; sz = -sz; } }
      push(this.sigs, keyOf(p.x, p.z), { id: s.id, kind, x: p.x + sx * lat, y: p.y, z: p.z + sz * lat, fx: -tx, fz: -tz, sx, sz });
    }
  }

  private prepCrossings() {
    const groups: CrossGroup[] = [];
    for (const c of this.net.def.crossings) {
      const t = this.net.tracks.get(c.track); if (!t) continue;
      const p = t.point(Math.min(t.len, Math.max(0, c.s)));
      const g = groups.find((q) => Math.hypot(q.x - p.x, q.z - p.z) < 16);
      if (g) {
        g.ids.push(c.id);
        const u = (p.x - g.x) * g.rdx + (p.z - g.z) * g.rdz;
        g.uMin = Math.min(g.uMin, u); g.uMax = Math.max(g.uMax, u);
        continue;
      }
      // angle: Abweichung vom rechten Winkel in Grad (0 = senkrecht)
      const a = Math.PI / 2 + ((c.angle ?? 0) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      groups.push({ ids: [c.id], x: p.x, y: p.y, z: p.z, rdx: p.dx * ca - p.dz * sa, rdz: p.dx * sa + p.dz * ca, tdx: p.dx, tdz: p.dz, uMin: 0, uMax: 0 });
    }
    for (const g of groups) push(this.xings, keyOf(g.x, g.z), g);
  }

  /** Portale dort, wo die Tunnelkennung entlang des Gleises wechselt (nur das linke Gleis eines Paars baut die Röhre) */
  private prepPortals() {
    const I = this.idx, o: Near = { seg: -1, d: 0, y: 0, t: 0 };
    I.tracks.forEach((t, ti) => {
      if (this.gapL[ti] < 7) return;
      const b = I.base[ti], ns = t.px.length - 1, tun = (i: number) => (I.flag[b + i] & F_TUN) !== 0;
      const R = this.gapR[ti] < 7 ? this.gapR[ti] + 4.4 : 4.4;
      const add = (i: number, out: number) => {
        const k = Math.min(i, ns - 1), dx = t.px[k + 1] - t.px[k], dz = t.pz[k + 1] - t.pz[k], l = Math.hypot(dx, dz) || 1;
        this.portals.push({ x: t.px[i], y: t.py[i], z: t.pz[i], dx: (dx / l) * out, dz: (dz / l) * out, nx: -dz / l, nz: dx / l, L: 4.4, R });
      };
      // außerhalb des Gleisendes noch Tunnel?
      const outside = (i: number, sg: number) => {
        const k = sg < 0 ? 0 : ns - 1, dx = t.px[k + 1] - t.px[k], dz = t.pz[k + 1] - t.pz[k], l = Math.hypot(dx, dz) || 1;
        return I.nearest(t.px[i] + (dx / l) * sg * 6, t.pz[i] + (dz / l) * sg * 6, 2.5, null, o, F_TUN);
      };
      if (tun(0) && !outside(0, -1)) add(0, -1);
      for (let i = 1; i < ns; i++) if (tun(i) !== tun(i - 1)) add(i, tun(i) ? -1 : 1);
      if (tun(ns - 1) && !outside(ns, 1)) add(ns, 1);
    });
  }

  private prepStations() {
    for (const st of this.net.def.stations) {
      if (st.kind === 'yard' || !st.platforms.length) continue;
      let sx = 0, sz = 0;
      const infos: PlatInfo[] = [];
      for (const p of st.platforms) {
        const ti = this.idx.tIndex.get(p.track); if (ti === undefined) continue;
        const t = this.idx.tracks[ti], m = t.point((p.s0 + p.s1) / 2);
        sx += m.x; sz += m.z;
        const [gl, gr] = this.idx.sideGaps(m.x, m.z, -m.dz, m.dx, ti, 12);
        const gap = p.side === 'R' ? gr : gl;
        const info: PlatInfo = { p, st, w: gap < 10 ? Math.max(1.2, gap / 2 - 1.65) : 3.35 };
        infos.push(info); push(this.plats, ti, info);
      }
      if (!infos.length) continue;
      this.stPts.push({ x: sx / infos.length, z: sz / infos.length, pax: st.pax ?? 300 });
      // Empfangsgebäude: erster Bahnsteig mit freiem Platz dahinter
      const big = st.kind === 'station' && (st.pax ?? 0) >= 500;
      const order = [...infos].sort((a, b) => (a.p.nr === '1' ? -1 : 0) - (b.p.nr === '1' ? -1 : 0));
      for (const inf of order) {
        const t = this.net.tracks.get(inf.p.track)!, m = t.point((inf.p.s0 + inf.p.s1) / 2);
        const sg = inf.p.side === 'R' ? 1 : -1, nx = -m.dz * sg, nz = m.dx * sg;
        const off = 1.65 + inf.w + (big ? 11 : 8);
        const x = m.x + nx * off, z = m.z + nz * off;
        if (this.idx.nearest(x, z, big ? 10 : 7.5, null, this.near)) continue;
        push(this.blds, keyOf(x, z), { st, x, y: m.y, z, dx: m.dx, dz: m.dz, fx: -nx, fz: -nz, big });
        break;
      }
    }
  }

  dispose() { this.mats.dispose(); }
}

function push<K, V>(m: Map<K, V[]>, k: K, v: V) { const a = m.get(k); if (a) a.push(v); else m.set(k, [v]); }
