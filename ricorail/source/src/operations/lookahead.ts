// Vorausschau entlang des Gleisgraphen: Geschwindigkeitsbeschränkungen, Signale, Halte, Prellböcke, Fahrzeuge.
import type { Network, Step } from '../railway/network';
import type { Interlocking, SignalState } from '../railway/interlocking';
import type { Dir, TrackPos } from '../railway/schema';

export interface Target { d: number; v: number; kind: 'signal' | 'limit' | 'buffer' | 'stop' | 'train' | 'end' | 'switch'; ref?: string; sig?: SignalState }

/**
 * Sammelt Ziele vor der Zugspitze bis zur Distanz maxD.
 * v in m/s; d = Abstand von der Spitze. Folgt der aktuellen Weichenlage.
 */
export function lookahead(net: Network, il: Interlocking | null, head: TrackPos, maxD: number, opts: { ignoreSignals?: boolean; occupiedBy?: (t: string) => { train: string; s0: number; s1: number }[]; self?: string; pass?: string } = {}): { targets: Target[]; path: Step[] } {
  const out: Target[] = []; const path: Step[] = [];
  let t = head.t, d: Dir = head.d, s = head.s, acc = 0;
  for (let guard = 0; guard < 200 && acc < maxD; guard++) {
    const tr = net.track(t);
    path.push({ t, d });
    const end = d > 0 ? tr.len : 0;
    const segLen = Math.abs(end - s);
    // Streckengeschwindigkeit gilt ab Gleisanfang
    out.push({ d: Math.max(0, acc), v: trackLimit(net, t) / 3.6, kind: 'limit', ref: t });
    // Langsamfahrstellen
    for (const sp of net.def.speeds) if (sp.track === t) {
      const a = d > 0 ? sp.s0 - s : s - sp.s1;
      if (a + (sp.s1 - sp.s0) > 0) out.push({ d: acc + Math.max(0, a), v: sp.vmax / 3.6, kind: 'limit', ref: sp.id });
    }
    // Andere Fahrzeuge auf dem Gleis
    if (opts.occupiedBy) for (const o of opts.occupiedBy(t)) {
      if (o.train === opts.self) continue;
      const near = d > 0 ? o.s0 - s : s - o.s1;
      if (near > -0.5) out.push({ d: acc + Math.max(0, near), v: 0, kind: 'train', ref: o.train });
    }
    // Signale
    if (il && !opts.ignoreSignals) for (const sig of net.signalsOn.get(t) ?? []) {
      if (sig.dir !== d) continue;
      const dd = d > 0 ? sig.s - s : s - sig.s;
      if (dd < -0.5) continue;
      const st = il.signalState.get(sig.id)!;
      if (sig.id === opts.pass) continue;
      out.push({ d: acc + Math.max(0, dd), v: st.aspect === 'stop' ? 0 : st.speed ? st.speed / 3.6 : 999, kind: 'signal', ref: sig.id, sig: st });
      if (st.aspect === 'stop') return { targets: out, path };
    }
    acc += segLen;
    const n = net.next(t, d, false);
    if (n === null) { out.push({ d: acc, v: 0, kind: 'buffer' }); break; }
    if (n === 'wrong') { out.push({ d: acc, v: 0, kind: 'switch' }); break; }
    t = n.t; d = n.d; s = d > 0 ? 0 : net.track(t).len;
  }
  return { targets: out, path };
}

/** Zulässige Geschwindigkeit an der Zugspitze unter Bremskurven aller Ziele */
export function permitted(targets: Target[], decel: number, margin: number, trainLen: number, curLimitBehind: number): number {
  let v = curLimitBehind;
  // Streckengeschwindigkeit gilt, bis der Zugschluss den Abschnitt verlassen hat → wird von außen über curLimitBehind gegeben
  for (const tg of targets) {
    if (tg.kind === 'limit' && tg.d <= 0.01) continue;
    const dist = Math.max(0, tg.d - (tg.v === 0 ? margin : 0));
    const vt = Math.sqrt(tg.v * tg.v + 2 * decel * dist);
    v = Math.min(v, vt);
  }
  void trainLen;
  return v;
}

const divCache = new WeakMap<Network, Map<string, number>>();
/** Höchstgeschwindigkeit eines Gleises inkl. Weichenabzweig (km/h) */
export function trackLimit(net: Network, t: string): number {
  let m = divCache.get(net);
  if (!m) { m = new Map(); for (const sw of net.switches.values()) sw.legs.forEach((l, i) => { if (i > 0) m!.set(l, Math.min(m!.get(l) ?? 999, sw.vDiv ?? 60)); }); divCache.set(net, m); }
  return Math.min(net.track(t).def.vmax, m.get(t) ?? 999);
}
