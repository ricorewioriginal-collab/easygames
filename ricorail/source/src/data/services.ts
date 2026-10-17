// Linienfahrpläne je Strecke: Taktlinien beider Richtungen, Fahrzeiten aus einer vereinfachten Fahrdynamik-Rechnung.
import type { Network } from '../railway/network';
import type { Service, ServiceStop } from '../operations/world';
import { FORM, vehicle } from '../trains/stock';
import { trackLimit } from '../operations/lookahead';

export interface LineDef {
  id: string; kind: Service['kind']; name: string; form: string;
  /** Halte (Stations-IDs) in Hinrichtung */
  stops: string[];
  /** Takt in s */
  every: number;
  /** Abfahrtsminute ab Stundenbeginn (Hinrichtung), s */
  offset: number;
  /** Versatz der Gegenrichtung, s */
  offsetBack?: number;
  dwell?: number; prio: number;
  /** nur Hinrichtung (z. B. Ring) */
  oneWay?: boolean;
  /** zusätzliche Wartezeit (s) an einem Halt für eine planmäßige Zugkreuzung (Hin-/Gegenrichtung) */
  wait?: Record<string, number>;
  waitBack?: Record<string, number>;
}

const all = (pre: string, n: number, skip: number[] = []) => Array.from({ length: n }, (_, i) => `${pre}_${i}`).filter((_, i) => !skip.includes(i));

export const LINES: Record<string, LineDef[]> = {
  d1: [
    { id: 'd1-hgz', kind: 'HGZ', name: 'HGZ Hannover – Hamburg', form: 'aero8', stops: ['D1_0', 'D1_1', 'D1_4', 'D1_6', 'D1_8', 'D1_9'], every: 3600, offset: 1260, offsetBack: 300, dwell: 60, prio: 9 },
    { id: 'd1-ic', kind: 'IC', name: 'IC Hannover – Hamburg', form: 'ic', stops: ['D1_0', 'D1_1', 'D1_4', 'D1_6', 'D1_8', 'D1_9'], every: 7200, offset: 3000, offsetBack: 2400, dwell: 60, prio: 8 },
    { id: 'd1-re', kind: 'RE', name: 'RE Hannover – Hamburg', form: 'dosto_re', stops: all('D1', 10), every: 3600, offset: 600, offsetBack: 1500, dwell: 40, prio: 5 },
    { id: 'd1-gz', kind: 'GZ', name: 'Containerzug Hamburg-Harburg – Hannover', form: 'cont_e', stops: ['D1_8', 'D1_0'], every: 7200, offset: 2100, offsetBack: 5400, dwell: 0, prio: 2 },
  ],
  d2: [
    { id: 'd2-ic', kind: 'IC', name: 'IC Hannover – Bremen', form: 'ic', stops: ['D2_0', 'D2_4', 'D2_6', 'D2_8'], every: 7200, offset: 1800, offsetBack: 900, dwell: 60, prio: 8 },
    { id: 'd2-re', kind: 'RE', name: 'RE Hannover – Bremen', form: 'dosto_re', stops: ['D2_0', 'D2_2', 'D2_4', 'D2_5', 'D2_6', 'D2_7', 'D2_8'], every: 3600, offset: 300, offsetBack: 2100, dwell: 40, prio: 5 },
    { id: 'd2-s', kind: 'S', name: 'S-Bahn Hannover – Nienburg', form: 'sbahn3', stops: ['D2_0', 'D2_1', 'D2_2', 'D2_3', 'D2_4'], every: 3600, offset: 2700, offsetBack: 1200, dwell: 30, prio: 4 },
    { id: 'd2-gz', kind: 'GZ', name: 'Güterzug Seelze – Bremen', form: 'cont_e', stops: ['D2_1', 'D2_8'], every: 7200, offset: 4200, offsetBack: 600, dwell: 0, prio: 2 },
  ],
  d3: [
    { id: 'd3-ic', kind: 'IC', name: 'IC Köln – Koblenz', form: 'ic', stops: ['D3_0', 'D3_4', 'D3_7', 'D3_11', 'D3_13'], every: 7200, offset: 1500, offsetBack: 3300, dwell: 60, prio: 8 },
    { id: 'd3-re', kind: 'RE', name: 'RE Köln – Koblenz', form: 'dosto_re', stops: ['D3_0', 'D3_1', 'D3_3', 'D3_4', 'D3_5', 'D3_7', 'D3_8', 'D3_9', 'D3_11', 'D3_13'], every: 3600, offset: 900, offsetBack: 600, dwell: 40, prio: 5 },
    { id: 'd3-rb', kind: 'RB', name: 'RB Köln – Remagen', form: 'sbahn3', stops: all('D3', 8), every: 3600, offset: 2700, offsetBack: 2400, dwell: 30, prio: 4 },
    { id: 'd3-gz', kind: 'GZ', name: 'Kesselwagenzug Hürth – Koblenz', form: 'tank_e', stops: ['D3_2', 'D3_13'], every: 7200, offset: 3600, offsetBack: 300, dwell: 0, prio: 2 },
  ],
  d4: [
    // eingleisig ab Tutzing: RE kreuzen sich in Murnau, die RB wartet in Oberau auf den Gegen-RE (und kreuzt dort die Gegen-RB)
    { id: 'd4-re', kind: 'RE', name: 'RE München – Garmisch', form: 'dosto_re', stops: ['D4N_0', 'D4N_1', 'D4N_3', 'D4N_5', 'D4S_0', 'D4S_2', 'D4S_3', 'D4S_5', 'D4S_7'], every: 3600, offset: 1920, offsetBack: 180, dwell: 40, prio: 6 },
    { id: 'd4-rb', kind: 'RB', name: 'RB Weilheim – Garmisch', form: 'sbahn3', stops: ['D4S_0', 'D4S_1', 'D4S_2', 'D4S_3', 'D4S_4', 'D4S_5', 'D4S_6', 'D4S_7'], every: 7200, offset: 960, offsetBack: 1680, dwell: 30, prio: 4, wait: { D4S_2: 60, D4S_5: 960 }, waitBack: { D4S_5: 900 } },
    { id: 'd4-s', kind: 'S', name: 'S-Bahn München – Tutzing', form: 'sbahn3', stops: all('D4N', 6), every: 2400, offset: 300, offsetBack: 1500, dwell: 30, prio: 4 },
    { id: 'd4-gz', kind: 'GZ', name: 'Schotterzug Weilheim – München', form: 'bulk_d', stops: ['D4S_0', 'D4N_0'], every: 14400, offset: 5400, oneWay: true, dwell: 0, prio: 2 },
  ],
  f1: [
    { id: 'f1-ic', kind: 'IC', name: 'Sonnenland-Express', form: 'ic', stops: ['F1_0', 'F1_2', 'F1_4', 'F1_8'], every: 3600, offset: 0, offsetBack: 1800, dwell: 45, prio: 8 },
    { id: 'f1-rb', kind: 'RB', name: 'RB Sonnenstadt – Seeblick', form: 'dmu1', stops: all('F1', 9), every: 3600, offset: 900, offsetBack: 2700, dwell: 30, prio: 4 },
    { id: 'f1-mb', kind: 'DPF', name: 'Museumsbahn zur Burg', form: 'steam_hist', stops: ['F1_4', 'F1M_1', 'F1M_2', 'F1M_3'], every: 7200, offset: 1200, offsetBack: 4800, dwell: 60, prio: 3 },
    { id: 'f1-gz', kind: 'GZ', name: 'Güterzug Kornfeld – Seeblick', form: 'mixed_d', stops: ['F1_2', 'F1_8'], every: 7200, offset: 2400, offsetBack: 6000, dwell: 0, prio: 2 },
  ],
  f2: [
    { id: 'f2-rb', kind: 'RB', name: 'RB Nebeltal – Passhöhe', form: 'dmu1', stops: all('F2', 6), every: 3600, offset: 600, offsetBack: 2400, dwell: 30, prio: 5 },
    { id: 'f2-re', kind: 'RE', name: 'Gebirgs-Express', form: 'dosto_re', stops: ['F2_0', 'F2_2', 'F2_4', 'F2_5'], every: 7200, offset: 2400, offsetBack: 5400, dwell: 40, prio: 6 },
    { id: 'f2-z', kind: 'BB', name: 'Zahnradbahn zum Gipfel', form: 'rack1', stops: ['F2Z_0', 'F2Z_1', 'F2Z_2', 'F2Z_3'], every: 1800, offset: 300, offsetBack: 1200, dwell: 30, prio: 5 },
  ],
  f3: [
    { id: 'f3-ring', kind: 'NC', name: 'Ring im Uhrzeigersinn', form: 'neon4', stops: [...all('F3', 10), 'F3_0'], every: 900, offset: 0, dwell: 25, prio: 6, oneWay: true },
    { id: 'f3-ringb', kind: 'NC', name: 'Ring gegen den Uhrzeigersinn', form: 'neon4', stops: ['F3_5', 'F3_4', 'F3_3', 'F3_2', 'F3_1', 'F3_0', 'F3_9', 'F3_8', 'F3_7', 'F3_6', 'F3_5'], every: 900, offset: 450, dwell: 25, prio: 6, oneWay: true },
    { id: 'f3-str', kind: 'STR', name: 'Stadtbahn Hafenviertel', form: 'tram1', stops: ['F3_2', 'F3T_1', 'F3T_2', 'F3T_3'], every: 1200, offset: 120, offsetBack: 720, dwell: 20, prio: 4 },
  ],
  f4: [
    { id: 'f4-rb', kind: 'RB', name: 'Küstenbahn', form: 'dmu2', stops: all('F4', 7, [5]), every: 3600, offset: 300, offsetBack: 2100, dwell: 30, prio: 5 },
    { id: 'f4-gz', kind: 'GZ', name: 'Hafengüterzug Möwenkap – Nordstrand', form: 'mixed_d', stops: ['F4_1', 'F4_6'], every: 7200, offset: 3000, offsetBack: 6300, dwell: 0, prio: 2 },
    { id: 'f4-dpf', kind: 'DPF', name: 'Dampfsonderzug', form: 'steam_hist', stops: ['F4_0', 'F4_3', 'F4_6'], every: 14400, offset: 4200, offsetBack: 11400, dwell: 120, prio: 3 },
  ],
};

/** Grobe Fahrzeit zwischen zwei Bahnsteiggleisen nach Fahrdynamik (Beschleunigen, Streckenhöchstgeschwindigkeit, Bremsen) */
export function runTime(net: Network, fromTrack: string, fromS: number, toTrack: string, form: string): number {
  const f = FORM.get(form);
  if (!f) return 600;
  const types = f.vehicles.map(vehicle);
  const mass = types.reduce((a, v) => a + v.mass + (v.payload ?? 0) * 0.8, 0);
  const tract = types.reduce((a, v) => a + (v.tractive ?? 0), 0) * 1000, power = types.reduce((a, v) => a + (v.power ?? 0), 0) * 1000;
  const vmaxT = Math.min(...types.map((v) => v.vmax)) / 3.6;
  const freight = f.cls === 12 || f.cls === 6;
  // Bremsverzögerung wie der KI-Fahrer (Planverzögerung abzüglich Ansprechzeit)
  const ep = types.every((v) => v.ep);
  const dec = freight ? 0.28 : ep ? 0.68 : 0.48;
  const trainLen = types.reduce((a, v) => a + v.len, 0);
  let best: { path: { t: string; d: 1 | -1 }[]; len: number } | null = null;
  for (const d of [1, -1] as const) {
    const p = net.route({ t: fromTrack, s: fromS, d }, toTrack);
    if (!p) continue;
    const len = p.reduce((a, s, i) => a + (i === 0 ? (d > 0 ? net.track(s.t).len - fromS : fromS) : net.track(s.t).len), 0);
    if (!best || len < best.len) best = { path: p, len };
  }
  if (!best) return 900;
  // Geschwindigkeitsprofil in 25-m-Schritten
  const lim: number[] = [];
  for (const [i, st] of best.path.entries()) {
    const L = i === 0 ? (st.d > 0 ? net.track(st.t).len - fromS : fromS) : net.track(st.t).len;
    const v = Math.min(vmaxT, trackLimit(net, st.t) / 3.6) * 0.97;
    for (let x = 0; x < L; x += 25) lim.push(v);
  }
  // höhere Geschwindigkeit erst, wenn der Zugschluss den langsamen Abschnitt verlassen hat
  const k = Math.ceil(trainLen / 25);
  for (let i = lim.length - 1; i > 0; i--) for (let j = Math.max(0, i - k); j < i; j++) lim[i] = Math.min(lim[i], lim[j]);
  const n = lim.length; if (!n) return 60;
  const vb = new Float64Array(n + 1); vb[n] = 0;
  for (let i = n - 1; i >= 0; i--) vb[i] = Math.min(lim[i], Math.sqrt(vb[i + 1] * vb[i + 1] + 2 * dec * 25));
  let v = 0, t = 0;
  for (let i = 0; i < n; i++) {
    const F = Math.min(tract, power / Math.max(v, 1)) - (mass * 9.81 * 1.5 + 0.3 * v * v * 8);
    const a = Math.max(0.05, F / (mass * 1000 * 1.06));
    const v2 = Math.min(vb[i + 1], lim[i], Math.sqrt(v * v + 2 * a * 25));
    const vm = Math.max(0.5, (v + v2) / 2);
    t += 25 / vm; v = v2;
  }
  return t * 1.07 + 30; // Fahrzeitreserve (Anfahren, Fahrstraßen, Vorsignale)
}

const runCache = new WeakMap<Network, Map<string, number>>();

/** Fahrplan einer Linie für eine Abfahrt ab der ersten Station */
export function lineService(net: Network, line: LineDef, back: boolean, dep: number, idx: number): Service {
  const stops = back ? [...line.stops].reverse() : line.stops;
  let cache = runCache.get(net); if (!cache) { cache = new Map(); runCache.set(net, cache); }
  const stMap = new Map(net.def.stations.map((s) => [s.id, s]));
  const out: ServiceStop[] = [];
  let t = dep;
  for (let i = 0; i < stops.length; i++) {
    const st = stMap.get(stops[i]); if (!st) continue;
    if (i > 0) {
      const prev = stMap.get(stops[i - 1])!;
      const key = `${line.form}|${prev.id}|${st.id}`;
      let rt = cache.get(key);
      if (rt === undefined) {
        const p = prev.platforms[0], q = st.platforms[0];
        rt = p && q ? runTime(net, p.track, (p.s0 + p.s1) / 2, q.track, line.form) : 600;
        cache.set(key, rt);
      }
      t += rt;
    }
    const dwell = i === 0 || i === stops.length - 1 ? 0 : line.dwell ?? 30;
    const arr = Math.round(t / 60) * 60;
    const stay = Math.max(60, Math.ceil(dwell / 60) * 60) + ((back ? line.waitBack : line.wait)?.[st.id] ?? 0);
    out.push({ st: st.id, arr: i === 0 ? undefined : arr, dep: i === stops.length - 1 ? undefined : (i === 0 ? dep : arr + stay), dwell });
    if (i > 0 && i < stops.length - 1) t = arr + stay;
  }
  const nr = String((parseInt(line.id.replace(/\D/g, '') || '1', 10) * 100 + idx * 2 + (back ? 1 : 0)) % 100000);
  const base = line.kind === 'HGZ' ? 500 : line.kind === 'IC' ? 2000 : line.kind === 'GZ' ? 44000 : line.kind === 'S' ? 3100 : 81000;
  return { id: `${line.id}${back ? 'b' : 'a'}${idx}`, nr: String(base + Number(nr)), kind: line.kind, form: line.form, prio: line.prio, stops: out, spawn: dep - 90 };
}

/** Alle Fahrten aller Linien, die zwischen t0 und t1 an ihrer ersten Station abfahren */
export function timetable(net: Network, routeId: string, t0: number, t1: number, density = 1): Service[] {
  const lines = LINES[routeId] ?? [];
  const out: Service[] = [];
  for (const l of lines) {
    // weniger Verkehr: Takt bleibt (Kreuzungen auf eingleisigen Strecken passen weiter), einzelne Fahrten entfallen
    const every = density >= 1 ? l.every / density : l.every;
    const thin = Math.max(0.25, Math.min(1, density));
    for (const back of l.oneWay ? [false] : [false, true]) {
      const off = back ? l.offsetBack ?? l.offset : l.offset;
      const k0 = Math.floor((t0 - off) / every), k1 = Math.ceil((t1 - off) / every);
      for (let k = k0; k <= k1; k++) {
        const dep = off + k * every;
        if (dep < t0 || dep > t1) continue;
        if (thin < 1 && Math.floor((k + 1) * thin) === Math.floor(k * thin)) continue;
        out.push(lineService(net, l, back, dep, ((k % 50) + 50) % 50));
      }
    }
  }
  return out.sort((a, b) => a.spawn - b.spawn);
}

/** Erste Fahrt einer Linie ab Uhrzeit t */
export function nextDeparture(net: Network, line: LineDef, back: boolean, t: number): Service {
  const off = back ? line.offsetBack ?? line.offset : line.offset;
  const k = Math.ceil((t - off) / line.every);
  return lineService(net, line, back, off + k * line.every, ((k % 50) + 50) % 50);
}
