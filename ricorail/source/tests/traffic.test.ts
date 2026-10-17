import { describe, it, expect } from 'vitest';
import { ROUTES, routeNet } from '../src/data/routes';
import { World } from '../src/operations/world';
import { timetable } from '../src/data/services';

describe('Fahrplanbetrieb aller Strecken (KI)', () => {
  for (const r of ROUTES) it(r.id + ': 2 h Betrieb ohne Unfall und Verklemmung', async () => {
    const w = new World(routeNet(r.id), 6 * 3600);
    w.pending.push(...timetable(w.net, r.id, 6 * 3600, 7 * 3600));
    const total = w.pending.length;
    const t0 = performance.now();
    let maxTrains = 0, deadlocks = 0;
    const done: Record<string, { n: number; stops: number; late: number }> = {};
    const seen = new Map<string, any>();
    for (let i = 0; i < 50 * 7200; i++) {
      // Ereignisschleife des Test-Workers regelmäßig freigeben (sonst RPC-Zeitüberschreitung bei langen Läufen)
      if (i % 30000 === 0) await new Promise((res) => setTimeout(res, 0));
      w.tick();
      maxTrains = Math.max(maxTrains, w.trains.size);
      if (w.deadlock.length) deadlocks++;
      for (const [id, p] of w.plans) seen.set(id, p);
    }
    for (const p of seen.values()) {
      const k = p.svc?.id.replace(/[ab]\d+$/, '') ?? '?';
      const d = done[k] ??= { n: 0, stops: 0, late: 0 };
      d.n++; d.stops += p.arrived.length; d.late = Math.max(d.late, Math.round(p.delay / 60));
    }
    const ms = Math.round(performance.now() - t0);
    const errs = w.events.filter((e) => e.sev === 'error').map((e) => e.msg);
    const stuck = [...w.trains.values()].map((t) => { const p = w.plans.get(t.id)!; return `${t.name}@${t.head.t} ${Math.round(t.kmh)} ${p.state} ${p.svc?.stops[p.stopIdx]?.st}`; });
    console.log(r.id, 'svc', total, 'pending', w.pending.length, 'max', maxTrains, 'ms', ms, JSON.stringify(done), 'dl', deadlocks, 'errs', errs.slice(0, 5), 'left', stuck);
    expect(w.score.spad).toBe(0);
    expect(w.score.collisions).toBe(0);
    expect(deadlocks).toBe(0);
    expect(errs).toEqual([]);
  }, 300000);
});
