// Räumlicher Index der Gleissegmente und Geländehöhenfunktion (Rauschen + Dämme/Einschnitte an Gleisen).
import type { Network, Track } from '../../railway/network';
import type { ThemeDef } from '../../railway/schema';
import { fbm, ridged, smooth01 } from './noise';

export const F_TUN = 1, F_BR = 2, F_YARD = 4;

export interface Near { seg: number; d: number; y: number; t: number }

const HC = 200; // Zellgröße Gleis-Hash (m)
const hkey = (ix: number, iz: number) => (ix + 32768) * 65536 + (iz + 32768);

export class TrackIndex {
  readonly tracks: Track[] = [];
  readonly tIndex = new Map<string, number>();
  readonly x0: Float64Array; readonly z0: Float64Array; readonly y0: Float64Array;
  readonly x1: Float64Array; readonly z1: Float64Array; readonly y1: Float64Array;
  /** Flags je Segment (Tunnel/Brücke auf Parallelgleise übertragen) */
  readonly flag: Uint8Array; readonly tr: Int32Array; readonly si: Int32Array;
  /** erster Segmentindex je Gleis */
  readonly base: Int32Array;
  readonly n: number;
  private map = new Map<number, Int32Array>();
  private stamp: Int32Array; private stampN = 0;

  constructor(net: Network) {
    let n = 0;
    for (const t of net.tracks.values()) { this.tIndex.set(t.id, this.tracks.length); this.tracks.push(t); n += t.px.length - 1; }
    this.n = n;
    this.x0 = new Float64Array(n); this.z0 = new Float64Array(n); this.y0 = new Float64Array(n);
    this.x1 = new Float64Array(n); this.z1 = new Float64Array(n); this.y1 = new Float64Array(n);
    this.flag = new Uint8Array(n); this.tr = new Int32Array(n); this.si = new Int32Array(n); this.stamp = new Int32Array(n);
    const tmp = new Map<number, number[]>();
    let k = 0;
    this.base = new Int32Array(this.tracks.length);
    this.tracks.forEach((t, ti) => {
      this.base[ti] = k;
      const f = (t.def.tunnel ? F_TUN : 0) | (t.def.bridge ? F_BR : 0) | (t.def.yard ? F_YARD : 0);
      for (let i = 0; i + 1 < t.px.length; i++, k++) {
        this.x0[k] = t.px[i]; this.z0[k] = t.pz[i]; this.y0[k] = t.py[i];
        this.x1[k] = t.px[i + 1]; this.z1[k] = t.pz[i + 1]; this.y1[k] = t.py[i + 1];
        this.flag[k] = f; this.tr[k] = ti; this.si[k] = i;
        const ax = Math.floor(Math.min(t.px[i], t.px[i + 1]) / HC), bx = Math.floor(Math.max(t.px[i], t.px[i + 1]) / HC);
        const az = Math.floor(Math.min(t.pz[i], t.pz[i + 1]) / HC), bz = Math.floor(Math.max(t.pz[i], t.pz[i + 1]) / HC);
        for (let ix = ax; ix <= bx; ix++) for (let iz = az; iz <= bz; iz++) {
          const key = hkey(ix, iz); let a = tmp.get(key); if (!a) { a = []; tmp.set(key, a); } a.push(k);
        }
      }
    });
    for (const [key, a] of tmp) this.map.set(key, Int32Array.from(a));
    // Tunnel/Brücke: Gleisabschnitte sind je Gleis unterschiedlich geschnitten – parallele Nachbarn (< 6 m) übernehmen die Kennung
    const orig = this.flag.slice(), o: Near = { seg: -1, d: 0, y: 0, t: 0 };
    for (let s = 0; s < n; s++) {
      const mx = (this.x0[s] + this.x1[s]) / 2, mz = (this.z0[s] + this.z1[s]) / 2, my = (this.y0[s] + this.y1[s]) / 2;
      const ax = this.x1[s] - this.x0[s], az = this.z1[s] - this.z0[s], al = Math.hypot(ax, az) || 1;
      for (let ix = Math.floor((mx - 6) / HC); ix <= Math.floor((mx + 6) / HC); ix++) for (let iz = Math.floor((mz - 6) / HC); iz <= Math.floor((mz + 6) / HC); iz++) {
        const a = this.map.get(hkey(ix, iz)); if (!a) continue;
        for (let j = 0; j < a.length; j++) {
          const q = a[j], f = orig[q] & (F_TUN | F_BR);
          if (!f || this.tr[q] === this.tr[s] || (this.flag[s] & f) === f) continue;
          if (this.test(q, mx, mz, 36, o) >= 36) continue;
          const y = this.y0[q] + (this.y1[q] - this.y0[q]) * o.t;
          const bx = this.x1[q] - this.x0[q], bz = this.z1[q] - this.z0[q], bl = Math.hypot(bx, bz) || 1;
          if (Math.abs(y - my) < 3 && Math.abs(ax * bx + az * bz) / (al * bl) > 0.9) this.flag[s] |= f;
        }
      }
    }
  }

  /** Alle Segmente, deren Zellen das Rechteck berühren (ohne Duplikate) */
  collect(x0: number, z0: number, x1: number, z1: number, out: number[]): number[] {
    out.length = 0;
    const st = ++this.stampN;
    for (let ix = Math.floor(x0 / HC); ix <= Math.floor(x1 / HC); ix++) for (let iz = Math.floor(z0 / HC); iz <= Math.floor(z1 / HC); iz++) {
      const a = this.map.get(hkey(ix, iz)); if (!a) continue;
      for (let j = 0; j < a.length; j++) { const s = a[j]; if (this.stamp[s] !== st) { this.stamp[s] = st; out.push(s); } }
    }
    return out;
  }

  private test(s: number, x: number, z: number, best: number, o: Near): number {
    const ax = this.x0[s], az = this.z0[s], bx = this.x1[s] - ax, bz = this.z1[s] - az;
    const l2 = bx * bx + bz * bz;
    let t = l2 > 0 ? ((x - ax) * bx + (z - az) * bz) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - ax - bx * t, dz = z - az - bz * t, d2 = dx * dx + dz * dz;
    if (d2 < best) { o.seg = s; o.t = t; best = d2; }
    return best;
  }

  /** Nächstes Segment innerhalb maxD; cand = vorgefilterte Liste (oder Hash-Abfrage) */
  nearest(x: number, z: number, maxD: number, cand: ArrayLike<number> | null, o: Near, mask = 0xff): boolean {
    let best = maxD * maxD; o.seg = -1;
    if (cand) { for (let j = 0; j < cand.length; j++) if (this.flag[cand[j]] & mask || mask === 0xff) best = this.test(cand[j], x, z, best, o); }
    else {
      for (let ix = Math.floor((x - maxD) / HC); ix <= Math.floor((x + maxD) / HC); ix++) for (let iz = Math.floor((z - maxD) / HC); iz <= Math.floor((z + maxD) / HC); iz++) {
        const a = this.map.get(hkey(ix, iz)); if (!a) continue;
        for (let j = 0; j < a.length; j++) if (mask === 0xff || this.flag[a[j]] & mask) best = this.test(a[j], x, z, best, o);
      }
    }
    if (o.seg < 0) return false;
    o.d = Math.sqrt(best); o.y = this.y0[o.seg] + (this.y1[o.seg] - this.y0[o.seg]) * o.t;
    return true;
  }

  /** Seitlicher Abstand zum nächsten anderen Gleis links (−) bzw. rechts (+) von Punkt p mit Rechts-Normale (nx,nz) */
  sideGaps(x: number, z: number, nx: number, nz: number, self: number, maxD: number): [number, number] {
    let L = Infinity, R = Infinity;
    const tx = nz, tz = -nx; // Tangente
    for (let ix = Math.floor((x - maxD) / HC); ix <= Math.floor((x + maxD) / HC); ix++) for (let iz = Math.floor((z - maxD) / HC); iz <= Math.floor((z + maxD) / HC); iz++) {
      const a = this.map.get(hkey(ix, iz)); if (!a) continue;
      for (let j = 0; j < a.length; j++) {
        const s = a[j]; if (this.tr[s] === self) continue;
        const ax = this.x0[s], az = this.z0[s], bx = this.x1[s] - ax, bz = this.z1[s] - az, l2 = bx * bx + bz * bz;
        let t = l2 > 0 ? ((x - ax) * bx + (z - az) * bz) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = ax + bx * t - x, qz = az + bz * t - z;
        if (Math.abs(qx * tx + qz * tz) > 3) continue;
        const lat = qx * nx + qz * nz;
        if (lat > 0.5 && lat < R) R = lat; else if (lat < -0.5 && -lat < L) L = -lat;
      }
    }
    return [L > maxD ? Infinity : L, R > maxD ? Infinity : R];
  }
}

interface Bump { x: number; z: number; r: number; h: number; lake: boolean; level: number }

const RC = 1000, DC = 250, MARGIN = 7000, CB = 200;

export class Terrain {
  readonly theme: ThemeDef;
  readonly seed: number;
  flat = 20; fall = 90;
  /** Wasserspiegel (Meer/Fluss) oder null */
  readonly seaLevel: number | null;
  readonly bumps: Bump[] = [];
  private gx0: number; private gz0: number;
  private rw: number; private rh: number; private rg: Float32Array;
  private dw: number; private dh: number; private dg: Float32Array;
  private cb: Float64Array | null = null; private cbOrigin = 0; private cbAxisX = true; private cbSign = 1;
  private readonly near: Near = { seg: -1, d: 0, y: 0, t: 0 };
  /** Abstand/Flags des nächsten Gleises der letzten height()-Abfrage (Färbung) */
  lastD = Infinity; lastF = 0; lastY = 0;
  private readonly amp: number; private readonly ramp: number;

  constructor(net: Network, readonly idx: TrackIndex, seed: number) {
    this.theme = net.def.theme; this.seed = seed;
    const b = net.bounds();
    this.gx0 = b.x0 - MARGIN; this.gz0 = b.z0 - MARGIN;
    const W = b.x1 - b.x0 + 2 * MARGIN, H = b.z1 - b.z0 + 2 * MARGIN;
    // Regionale Grundhöhe aus offenen Gleisen
    this.rw = Math.ceil(W / RC) + 1; this.rh = Math.ceil(H / RC) + 1;
    const sum = new Float64Array(this.rw * this.rh), cnt = new Float64Array(this.rw * this.rh);
    this.dw = Math.ceil(W / DC) + 1; this.dh = Math.ceil(H / DC) + 1;
    this.dg = new Float32Array(this.dw * this.dh).fill(1e9);
    for (const t of idx.tracks) {
      const open = !t.def.tunnel && !t.def.bridge;
      for (let i = 0; i < t.px.length; i++) {
        if (open) { const k = this.ri(t.px[i], t.pz[i]); sum[k] += t.py[i]; cnt[k]++; }
        const dx = Math.round((t.px[i] - this.gx0) / DC), dz = Math.round((t.pz[i] - this.gz0) / DC);
        if (dx >= 0 && dz >= 0 && dx < this.dw && dz < this.dh) this.dg[dz * this.dw + dx] = 0;
      }
    }
    this.rg = fillGrid(sum, cnt, this.rw, this.rh);
    chamfer(this.dg, this.dw, this.dh, DC);
    const th = this.theme.terrain;
    this.amp = th === 'mountain' ? 420 : th === 'hills' ? 50 : th === 'river' ? 30 : th === 'coast' ? 10 : th === 'city' ? 3 : 6;
    this.ramp = th === 'mountain' ? 1800 : th === 'hills' ? 1100 : 1400;
    this.seaLevel = this.theme.sea ? this.theme.sea.level : null;
    if (this.theme.sea) this.buildCoast(this.theme.sea.side);
    for (const s of net.def.scenery ?? []) {
      if (s.kind === 'hill') this.bumps.push({ x: s.x, z: s.z, r: s.r ?? 400, h: s.h ?? 60, lake: false, level: 0 });
      else if (s.kind === 'castle') this.bumps.push({ x: s.x, z: s.z, r: (s.r ?? 60) * 3, h: 25, lake: false, level: 0 });
      else if (s.kind === 'lake') { const r = s.r ?? 300; this.bumps.push({ x: s.x, z: s.z, r, h: 0, lake: true, level: this.regional(s.x, s.z) - 1.5 }); }
    }
  }

  /** Auflösung des Geländegitters → Breite der ebenen Zone neben dem Gleis */
  setCell(cell: number) {
    this.flat = Math.max(22, cell * 1.15 + 4);
    const th = this.theme.terrain;
    this.fall = th === 'mountain' ? 120 : th === 'hills' ? 95 : 70;
  }
  get reach() { return this.flat + 8 + this.fall; }

  private ri(x: number, z: number) {
    const ix = Math.min(this.rw - 1, Math.max(0, Math.floor((x - this.gx0) / RC))), iz = Math.min(this.rh - 1, Math.max(0, Math.floor((z - this.gz0) / RC)));
    return iz * this.rw + ix;
  }
  regional(x: number, z: number): number { return bilerp(this.rg, this.rw, this.rh, (x - this.gx0) / RC - 0.5, (z - this.gz0) / RC - 0.5); }
  /** grober Abstand zum nächsten Gleis (m) */
  trackDist(x: number, z: number): number { return bilerp(this.dg, this.dw, this.dh, (x - this.gx0) / DC, (z - this.gz0) / DC); }

  private buildCoast(side: 'N' | 'S' | 'E' | 'W') {
    const axisX = side === 'N' || side === 'S';
    let lo = Infinity, hi = -Infinity;
    for (const t of this.idx.tracks) for (let i = 0; i < t.px.length; i++) { const a = axisX ? t.px[i] : t.pz[i]; lo = Math.min(lo, a); hi = Math.max(hi, a); }
    lo -= MARGIN; hi += MARGIN;
    const n = Math.ceil((hi - lo) / CB) + 1;
    const sgn = side === 'N' || side === 'W' ? -1 : 1; // Meer liegt bei kleineren (N/W) bzw. größeren (S/E) Koordinaten
    const v = new Float64Array(n).fill(NaN);
    for (const t of this.idx.tracks) for (let i = 0; i < t.px.length; i++) {
      const a = axisX ? t.px[i] : t.pz[i], c = axisX ? t.pz[i] : t.px[i];
      const k = Math.round((a - lo) / CB);
      if (Number.isNaN(v[k]) || c * sgn > v[k] * sgn) v[k] = c;
    }
    // Lücken mit Nachbarwerten füllen
    let last = NaN; for (let k = 0; k < n; k++) { if (!Number.isNaN(v[k])) last = v[k]; else v[k] = last; }
    last = NaN; for (let k = n - 1; k >= 0; k--) { if (!Number.isNaN(v[k])) last = v[k]; else if (Number.isNaN(v[k])) v[k] = last; }
    // glätten
    const w = new Float64Array(n);
    for (let pass = 0; pass < 3; pass++) { for (let k = 0; k < n; k++) w[k] = (v[Math.max(0, k - 1)] + v[k] * 2 + v[Math.min(n - 1, k + 1)]) / 4; v.set(w); }
    this.cb = v; this.cbOrigin = lo; this.cbAxisX = axisX; this.cbSign = sgn;
  }
  /** Abstand jenseits der Küstenlinie (positiv = Richtung Meer/Fluss) */
  coastDist(x: number, z: number): number {
    const cb = this.cb; if (!cb) return -1e9;
    const a = this.cbAxisX ? x : z, c = this.cbAxisX ? z : x;
    const f = Math.min(cb.length - 1.001, Math.max(0, (a - this.cbOrigin) / CB)), k = Math.floor(f);
    const edge = cb[k] + (cb[k + 1] - cb[k]) * (f - k);
    return (c - edge) * this.cbSign - 140;
  }

  /** Naturhöhe ohne Gleiseinfluss */
  natural(x: number, z: number): number {
    const th = this.theme.terrain, sd = this.seed;
    let h = this.regional(x, z);
    const v = smooth01((this.trackDist(x, z) - 120) / this.ramp);
    switch (th) {
      case 'mountain': h += -4 + ridged(x / 2600, z / 2600, sd, 5) * this.amp * v + fbm(x / 350, z / 350, sd + 5, 3) * 10 * (0.3 + v); break;
      case 'hills': h += fbm(x / 1400, z / 1400, sd, 4) * this.amp * (0.25 + 0.75 * v) + fbm(x / 300, z / 300, sd + 9, 2) * 3; break;
      case 'city': h += fbm(x / 1500, z / 1500, sd, 3) * this.amp; break;
      default: h += fbm(x / 1100, z / 1100, sd, 4) * this.amp * (0.3 + 0.7 * v);
    }
    for (let i = 0; i < this.bumps.length; i++) {
      const b = this.bumps[i], dx = x - b.x, dz = z - b.z;
      if (Math.abs(dx) > b.r || Math.abs(dz) > b.r) continue;
      const d = Math.hypot(dx, dz); if (d >= b.r) continue;
      if (b.lake) { const t = 1 - smooth01((d - b.r * 0.85) / (b.r * 0.3)); h += (b.level - 4 - h) * t; }
      else h += b.h * (0.5 + 0.5 * Math.cos(Math.PI * d / b.r));
    }
    if (this.seaLevel !== null) {
      const L = this.seaLevel, s = this.coastDist(x, z);
      if (th === 'river') {
        const dr = Math.abs(s - 330);
        if (dr < 450) { const t = 1 - smooth01((dr - 190) / 250); if (h > L - 4) h += (L - 4 - h) * t; }
      } else if (s > -220) {
        const t = smooth01((s + 220) / 220); h += (L + 1.2 - h) * t;
        if (s > 0) h += (L - 12 - h) * smooth01(s / 260);
      }
    }
    return h;
  }

  /** Geländehöhe inkl. Bahndamm/Einschnitt, Tunnelberg, Brückental */
  height(x: number, z: number, cand: ArrayLike<number> | null): number {
    const nat = this.natural(x, z);
    const o = this.near;
    this.lastD = Infinity; this.lastF = 0;
    if (!this.idx.nearest(x, z, this.reach, cand, o)) return nat;
    const d = o.d, f = this.idx.flag[o.seg], ty = o.y;
    this.lastD = d; this.lastF = f; this.lastY = ty;
    if (f & F_TUN) {
      const wt = d <= this.flat + 8 ? 1 : 1 - smooth01((d - this.flat - 8) / this.fall);
      return Math.max(nat, nat + (ty + 15 - nat) * wt);
    }
    const w = d <= this.flat ? 1 : 1 - smooth01((d - this.flat) / this.fall);
    if (w <= 0) return nat;
    if (f & F_BR) { const tg = Math.min(nat, ty - 9); return nat + (tg - nat) * w; }
    return nat + (ty - 0.8 - nat) * w;
  }
}

function bilerp(g: Float32Array, w: number, h: number, fx: number, fz: number): number {
  fx = Math.min(w - 1.0001, Math.max(0, fx)); fz = Math.min(h - 1.0001, Math.max(0, fz));
  const ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz, k = iz * w + ix;
  const a = g[k], b = g[k + 1], c = g[k + w], d = g[k + w + 1];
  return a + (b - a) * tx + (c - a) * tz + (a - b - c + d) * tx * tz;
}

/** Mittelwerte je Zelle, leere Zellen per Ausbreitung füllen, danach glätten */
function fillGrid(sum: Float64Array, cnt: Float64Array, w: number, h: number): Float32Array {
  const g = new Float32Array(w * h), done = new Uint8Array(w * h);
  const q: number[] = [];
  for (let k = 0; k < g.length; k++) if (cnt[k] > 0) { g[k] = sum[k] / cnt[k]; done[k] = 1; q.push(k); }
  if (!q.length) return g;
  for (let qi = 0; qi < q.length; qi++) {
    const k = q[qi], x = k % w, z = (k - x) / w;
    const nb = [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, z > 0 ? k - w : -1, z < h - 1 ? k + w : -1];
    for (const m of nb) if (m >= 0 && !done[m]) { done[m] = 1; g[m] = g[k]; q.push(m); }
  }
  const t = new Float32Array(g.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let z = 0; z < h; z++) for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, zz = z + dz; if (xx < 0 || zz < 0 || xx >= w || zz >= h) continue; s += g[zz * w + xx]; n++; }
      t[z * w + x] = s / n;
    }
    g.set(t);
  }
  return g;
}

/** Zweipass-Abstandstransformation */
function chamfer(g: Float32Array, w: number, h: number, c: number) {
  const d1 = c, d2 = c * Math.SQRT2;
  for (let z = 0; z < h; z++) for (let x = 0; x < w; x++) {
    const k = z * w + x; let v = g[k];
    if (x > 0) v = Math.min(v, g[k - 1] + d1);
    if (z > 0) { v = Math.min(v, g[k - w] + d1); if (x > 0) v = Math.min(v, g[k - w - 1] + d2); if (x < w - 1) v = Math.min(v, g[k - w + 1] + d2); }
    g[k] = v;
  }
  for (let z = h - 1; z >= 0; z--) for (let x = w - 1; x >= 0; x--) {
    const k = z * w + x; let v = g[k];
    if (x < w - 1) v = Math.min(v, g[k + 1] + d1);
    if (z < h - 1) { v = Math.min(v, g[k + w] + d1); if (x < w - 1) v = Math.min(v, g[k + w + 1] + d2); if (x > 0) v = Math.min(v, g[k + w - 1] + d2); }
    g[k] = v;
  }
}
