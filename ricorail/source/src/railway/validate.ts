// Gleisgraph-Validator (Editor, Streckenpakete, Tests): Topologie, Signale, Bahnsteige, Steigungen, Radien, Erreichbarkeit.
import { Network } from './network';
import type { NetworkDef } from './schema';
import { Interlocking } from './interlocking';

export interface Issue { sev: 'error' | 'warn'; msg: string; ref?: string }

export function validate(def: NetworkDef): { issues: Issue[]; net?: Network; il?: Interlocking } {
  const issues: Issue[] = [];
  const E = (msg: string, ref?: string) => issues.push({ sev: 'error', msg, ref });
  const W = (msg: string, ref?: string) => issues.push({ sev: 'warn', msg, ref });
  if (!def || typeof def !== 'object') return { issues: [{ sev: 'error', msg: 'Keine Netzdaten' }] };
  if (!Array.isArray(def.nodes) || !Array.isArray(def.tracks)) return { issues: [{ sev: 'error', msg: 'Knoten oder Gleise fehlen' }] };
  const ids = new Set<string>();
  for (const n of def.nodes) { if (ids.has(n.id)) E(`Knoten ${n.id} doppelt`, n.id); ids.add(n.id); if (![n.x, n.y, n.z].every(Number.isFinite)) E(`Knoten ${n.id}: ungültige Koordinaten`, n.id); }
  const tids = new Set<string>();
  for (const t of def.tracks) {
    if (tids.has(t.id)) E(`Gleis ${t.id} doppelt`, t.id); tids.add(t.id);
    if (!ids.has(t.a) || !ids.has(t.b)) E(`Gleis ${t.id}: Knoten fehlt`, t.id);
    if (!Array.isArray(t.pts) || t.pts.length < 6 || t.pts.length % 3 || !t.pts.every(Number.isFinite)) E(`Gleis ${t.id}: Geometrie ungültig`, t.id);
    if (!(t.vmax > 0 && t.vmax <= 400)) E(`Gleis ${t.id}: Höchstgeschwindigkeit ungültig`, t.id);
  }
  for (const sw of def.switches ?? []) {
    if (!ids.has(sw.node)) E(`Weiche ${sw.id}: Knoten fehlt`, sw.id);
    for (const t of [sw.trunk, ...(sw.legs ?? [])]) if (!tids.has(t)) E(`Weiche ${sw.id}: Gleis ${t} fehlt`, sw.id);
  }
  for (const sg of def.signals ?? []) if (!tids.has(sg.track)) E(`Signal ${sg.id}: Gleis fehlt`, sg.id);
  if (issues.some((i) => i.sev === 'error')) return { issues };
  let net: Network;
  try { net = new Network(def); } catch (e) { E(String((e as Error).message)); return { issues }; }
  // Knotengrad
  for (const [node, ends] of net.ends) {
    const sw = net.switchAt.get(node), nd = net.nodeDefs.get(node);
    if (ends.length === 3 && !sw) E(`Knoten ${node}: drei Gleisenden ohne Weiche`, node);
    if (ends.length > 3 && !sw && !nd?.pairs) E(`Knoten ${node}: ${ends.length} Gleisenden ohne Weiche/Kreuzung`, node);
    if (sw) {
      const atNode = ends.map((e) => e.split('|')[0]);
      if (!atNode.includes(sw.trunk)) E(`Weiche ${sw.id}: Stammgleis endet nicht am Weichenknoten`, sw.id);
      for (const l of sw.legs) if (!atNode.includes(l)) E(`Weiche ${sw.id}: Strang ${l} endet nicht am Weichenknoten`, sw.id);
      if (sw.legs.length < 2) E(`Weiche ${sw.id}: braucht mindestens zwei Stränge`, sw.id);
      if (ends.length !== 1 + sw.legs.length) E(`Weiche ${sw.id}: ${ends.length} Gleisenden, erwartet ${1 + sw.legs.length}`, sw.id);
    }
    // Geometrische Stetigkeit
    const p = net.nodeDefs.get(node)!;
    for (const e of ends) {
      const [tid, end] = e.split('|'); const t = net.track(tid);
      const i = end === 'a' ? 0 : t.px.length - 1;
      const d = Math.hypot(t.px[i] - p.x, t.pz[i] - p.z);
      if (d > 1.5) W(`Gleis ${tid}: Ende liegt ${d.toFixed(1)} m neben Knoten ${node}`, tid);
    }
  }
  for (const sd of def.switches) if (!net.ends.has(sd.node)) E(`Weiche ${sd.id}: Knoten fehlt`, sd.id);
  // Steigung & Radius
  for (const t of net.tracks.values()) {
    for (let i = 1; i < t.px.length; i++) {
      const g = Math.abs((t.py[i] - t.py[i - 1]) / (t.cs[i] - t.cs[i - 1]));
      if (g > (t.def.rack ? 0.13 : 0.045)) { W(`Gleis ${t.id}: Steigung ${(g * 1000).toFixed(0)} ‰ – problematisch für Züge`, t.id); break; }
    }
    let minR = Infinity; for (let i = 1; i < t.k.length - 1; i++) if (Math.abs(t.k[i]) > 1e-9) minR = Math.min(minR, 1 / Math.abs(t.k[i]));
    if (minR < 60 && !t.def.yard) W(`Gleis ${t.id}: sehr enger Bogen (R ≈ ${Math.round(minR)} m)`, t.id);
  }
  // Signale/Bahnsteige
  for (const s of def.signals) if (!net.tracks.has(s.track)) E(`Signal ${s.id}: Gleis fehlt`, s.id);
  for (const st of def.stations) for (const p of st.platforms) {
    const t = net.tracks.get(p.track);
    if (!t) { E(`Bahnhof ${st.name}: Bahnsteiggleis ${p.track} fehlt`, st.id); continue; }
    if (p.s0 < -1 || p.s1 > t.len + 1 || p.s1 <= p.s0) E(`Bahnhof ${st.name}: Bahnsteig ${p.nr} außerhalb des Gleises`, st.id);
    if (p.s1 - p.s0 < 40) W(`Bahnhof ${st.name}: Bahnsteig ${p.nr} sehr kurz`, st.id);
  }
  // Erreichbarkeit
  const first = def.tracks[0];
  if (first) {
    const seen = new Set<string>([first.id]); const q = [first.id];
    while (q.length) {
      const t = q.pop()!;
      for (const d of [1, -1] as const) for (const o of net.options(t, d)) if (!seen.has(o.step.t)) { seen.add(o.step.t); q.push(o.step.t); }
      // auch rückwärts erreichbare Stränge (Weichenstränge)
      for (const sw of net.switches.values()) if (sw.trunk === t || sw.legs.includes(t)) for (const x of [sw.trunk, ...sw.legs]) if (!seen.has(x)) { seen.add(x); q.push(x); }
    }
    const unreach = def.tracks.filter((t) => !seen.has(t.id));
    if (unreach.length) W(`${unreach.length} Gleis(e) nicht mit dem Netz verbunden`, unreach[0].id);
  }
  let il: Interlocking | undefined;
  try {
    il = new Interlocking(net);
    for (const s of net.signals.values()) if (!(il.routesFrom.get(s.id)?.length)) W(`Signal ${s.id}: keine Fahrstraße möglich`, s.id);
  } catch (e) { E('Stellwerk: ' + (e as Error).message); }
  if (!def.stations.some((s) => s.platforms.length)) W('Keine Station mit Bahnsteig');
  return { issues, net, il };
}
