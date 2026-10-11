import { describe, expect, it, vi } from 'vitest';
import { Rng, hashString } from '../rng';
import {
  LAYOUTS,
  WORLD_IDS,
  adjacency,
  canReach,
  distancesFrom,
  edgeActive,
  foldPhaseOfRound,
  getLayout,
  layoutSignature,
  layoutsOfWorld,
  outgoing,
  reachable,
  validateLayout,
} from './index';
import type { Layout, LayoutEdge, WorldId } from './types';
import { topViewCrossings } from './builders';

const worlds: WorldId[] = [...WORLD_IDS];
const count = (l: Layout, k: string) => l.nodes.filter((n) => n.kind === k).length;
const hasStyle = (l: Layout, s: string) => l.edges.some((e) => e.style === s);

/** Ungerichtete Schrittabstände über die dauerhaften Kanten */
function undirectedDistances(l: Layout, from: number): number[] {
  const adj: number[][] = l.nodes.map(() => []);
  for (const e of l.edges) {
    if (e.folds) continue;
    adj[e.from]?.push(e.to);
    adj[e.to]?.push(e.from);
  }
  const d = l.nodes.map(() => Infinity);
  d[from] = 0;
  const q = [from];
  for (let i = 0; i < q.length; i++) {
    const n = q[i] as number;
    for (const m of adj[n] ?? []) {
      if (d[m] !== Infinity) continue;
      d[m] = (d[n] as number) + 1;
      q.push(m);
    }
  }
  return d;
}

/** Zufallslauf: `mode` = feste Phase oder 'cycle' (Phase wechselt wie die Runden) */
function randomWalk(l: Layout, steps: number, seed: number, mode: number | 'cycle') {
  const rng = new Rng(seed);
  let at = l.start;
  const visited = new Set<number>([at]);
  for (let s = 0; s < steps; s++) {
    const phase = mode === 'cycle' ? s % l.foldPhases : mode;
    const outs = outgoing(l, at, phase);
    if (outs.length === 0) return { stuck: true, visited };
    at = rng.pick(outs).to;
    visited.add(at);
  }
  return { stuck: false, visited };
}

describe('50 Brett-Layouts', () => {
  it('es gibt genau 50 Layouts, 10 je Welt', () => {
    expect(LAYOUTS).toHaveLength(50);
    for (const w of worlds) {
      const ls = layoutsOfWorld(w);
      expect(ls, w).toHaveLength(10);
      expect(ls.map((l) => l.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it('IDs sind eindeutig und über getLayout auffindbar', () => {
    expect(new Set(LAYOUTS.map((l) => l.id)).size).toBe(50);
    for (const l of LAYOUTS) expect(getLayout(l.id)).toBe(l);
    expect(() => getLayout('gibt-es-nicht')).toThrow();
  });

  it('alle Layouts bestehen validateLayout', () => {
    for (const l of LAYOUTS) expect(validateLayout(l), l.id).toEqual([]);
  });

  it('Namen sind eindeutig, Beschreibungen aussagekräftig', () => {
    expect(new Set(LAYOUTS.map((l) => l.name)).size).toBe(50);
    for (const l of LAYOUTS) {
      expect(l.blurb.length, l.id).toBeGreaterThanOrEqual(40);
      expect(l.features.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.features.every((f) => f.length >= 3 && f.length <= 40)).toBe(true);
    }
  });

  it('Signaturen sind paarweise verschieden', () => {
    const sigs = LAYOUTS.map(layoutSignature);
    expect(new Set(sigs).size).toBe(50);
  });

  it('Bauplan-Vielfalt: ≥13 verschiedene, je Welt 10 verschiedene, keiner öfter als 4-mal', () => {
    const all = new Map<string, number>();
    for (const l of LAYOUTS) all.set(l.template, (all.get(l.template) ?? 0) + 1);
    expect(all.size).toBeGreaterThanOrEqual(13);
    for (const [t, n] of all) expect(n, t).toBeLessThanOrEqual(4);
    for (const w of worlds) expect(new Set(layoutsOfWorld(w).map((l) => l.template)).size, w).toBe(10);
  });

  it('Größe, Schwierigkeit und Rundenempfehlung liegen im erlaubten Bereich', () => {
    for (const l of LAYOUTS) {
      expect(l.nodes.length, l.id).toBeGreaterThanOrEqual(24);
      expect(l.nodes.length, l.id).toBeLessThanOrEqual(64);
      expect([1, 2, 3]).toContain(l.difficulty);
      expect(l.recommendedRounds, l.id).toBeGreaterThanOrEqual(10);
      expect(l.recommendedRounds, l.id).toBeLessThanOrEqual(20);
    }
    for (const w of worlds) {
      const ds = layoutsOfWorld(w).map((l) => l.difficulty);
      expect(ds, w).toContain(1);
      expect(ds, w).toContain(3);
    }
    // größere Bretter brauchen mehr Runden
    const avg = (xs: Layout[]) => xs.reduce((s, l) => s + l.recommendedRounds, 0) / xs.length;
    expect(avg(LAYOUTS.filter((l) => l.nodes.length >= 45))).toBeGreaterThan(
      avg(LAYOUTS.filter((l) => l.nodes.length < 35)),
    );
  });

  it('Feldmix: Glimmer-Mehrheit, wenige Dornen, Läden gestreut und nicht am Start', () => {
    for (const l of LAYOUTS) {
      const n = l.nodes.length;
      expect(count(l, 'glimmer'), l.id).toBeGreaterThanOrEqual(n * 0.3);
      expect(count(l, 'thorn'), l.id).toBeLessThanOrEqual(n * 0.25);
      expect(count(l, 'shop'), l.id).toBeLessThanOrEqual(Math.ceil(n / 8));
      expect(count(l, 'shop'), l.id).toBeGreaterThanOrEqual(2);
      expect(count(l, 'start'), l.id).toBe(1);
      const shops = l.nodes.filter((x) => x.kind === 'shop').map((x) => x.id);
      const ds = undirectedDistances(l, l.start);
      for (const s of shops) expect(ds[s] as number, `${l.id} Laden ${s} am Start`).toBeGreaterThanOrEqual(3);
      for (const a of shops) {
        const da = undirectedDistances(l, a);
        for (const b of shops)
          if (a < b) expect(da[b] as number, `${l.id} Läden ${a}/${b}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('Altar-Orte: mindestens 4, nie Start, Portal oder Mautbrücke', () => {
    for (const l of LAYOUTS) {
      expect(l.altarSites.length, l.id).toBeGreaterThanOrEqual(4);
      for (const s of l.altarSites) expect(['start', 'portal', 'gate']).not.toContain(l.nodes[s]?.kind);
    }
  });

  it('Portale sind immer gegenseitig und weit voneinander entfernt', () => {
    for (const l of LAYOUTS) {
      for (const n of l.nodes) {
        if (n.kind !== 'portal') continue;
        const p = l.nodes[n.portal as number];
        expect(p?.kind, l.id).toBe('portal');
        expect(p?.portal, l.id).toBe(n.id);
        const q = p?.pos ?? [0, 0, 0];
        const dist = Math.hypot(n.pos[0] - q[0], n.pos[1] - q[1], n.pos[2] - q[2]);
        expect(dist, `${l.id} Portal ${n.id}`).toBeGreaterThan(6);
      }
      expect(count(l, 'portal') % 2).toBe(0);
    }
  });

  it('in jeder Faltungsphase hat jedes Feld einen Weg weiter', () => {
    for (const l of LAYOUTS)
      for (let ph = 0; ph < l.foldPhases; ph++)
        for (const n of l.nodes)
          expect(outgoing(l, n.id, ph).length, `${l.id} Phase ${ph} Feld ${n.id}`).toBeGreaterThan(0);
  });

  it('Faltung: Phase je Runde und faltbare Kanten sind konsistent', () => {
    for (const l of LAYOUTS) {
      for (let r = 1; r <= 7; r++)
        expect(foldPhaseOfRound(l, r)).toBe(l.foldPhases <= 1 ? 0 : (r - 1) % l.foldPhases);
      const fe = l.edges.filter((e) => e.folds);
      if (l.foldPhases === 1) expect(fe, l.id).toHaveLength(0);
      for (const e of fe) expect(e.folds?.every((p) => p >= 0 && p < l.foldPhases)).toBe(true);
    }
  });

  it('der dauerhafte Kern verbindet alle Felder stark', () => {
    for (const l of LAYOUTS) {
      const core = (e: LayoutEdge) => !e.folds;
      expect(reachable(l, l.start, core).size, l.id).toBe(l.nodes.length);
      expect(canReach(l, l.start, core).size, l.id).toBe(l.nodes.length);
    }
  });

  it('Zufallsläufe über 5000 Schritte bleiben nie stecken und erreichen alle Altar-Orte', () => {
    for (const l of LAYOUTS) {
      const modes: (number | 'cycle')[] = ['cycle'];
      for (let ph = 0; ph < l.foldPhases; ph++) modes.push(ph);
      for (const mode of modes) {
        const res = randomWalk(
          l,
          5000,
          hashString(l.id) + (mode === 'cycle' ? 1 : (mode as number) + 7),
          mode,
        );
        expect(res.stuck, `${l.id} (${mode})`).toBe(false);
        for (const s of l.altarSites)
          expect(res.visited.has(s), `${l.id} (${mode}) erreicht Altar-Ort ${s} nicht`).toBe(true);
      }
    }
  });

  it('Geometrie: Felder nicht zu dicht, Kanten kreuzen sich in der Draufsicht nur mit Höhenunterschied', () => {
    for (const l of LAYOUTS) {
      for (let i = 0; i < l.nodes.length; i++)
        for (let j = i + 1; j < l.nodes.length; j++) {
          const a = l.nodes[i]?.pos as number[],
            b = l.nodes[j]?.pos as number[];
          expect(
            Math.hypot(
              (a[0] as number) - (b[0] as number),
              (a[1] as number) - (b[1] as number),
              (a[2] as number) - (b[2] as number),
            ),
          ).toBeGreaterThan(1.6);
        }
      expect(topViewCrossings(l.nodes, l.edges), l.id).toEqual([]);
      const xs = l.nodes.map((n) => n.pos[0]),
        zs = l.nodes.map((n) => n.pos[2]);
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
      expect(span, l.id).toBeGreaterThan(15);
      expect(span, l.id).toBeLessThan(70);
    }
  });

  it('Inseln: jedes Feld gehört (wenn zugeordnet) zu einer vorhandenen Insel mit sinnvollem Radius', () => {
    for (const l of LAYOUTS) {
      expect(l.islands.length).toBeGreaterThan(0);
      for (const i of l.islands) expect(i.radius).toBeGreaterThan(1);
      expect(l.nodes.filter((n) => n.island !== undefined).length, l.id).toBeGreaterThan(
        l.nodes.length * 0.5,
      );
    }
  });

  it('Aufbau ist deterministisch und schnell', async () => {
    const first = JSON.stringify(LAYOUTS);
    vi.resetModules();
    const t0 = performance.now();
    const again = await import('./index');
    const ms = performance.now() - t0;
    expect(JSON.stringify(again.LAYOUTS)).toBe(first);
    // Richtwert aus der Vorgabe: < 200 ms; großzügige Grenze, damit langsame CI-Maschinen nicht flackern
    expect(ms).toBeLessThan(1500);
  });
});

describe('Welt-Identitäten', () => {
  it('Prismara: Lichtbrücken, Regenbogenwege und Portale in jedem Layout', () => {
    for (const l of layoutsOfWorld('prismara')) {
      expect(hasStyle(l, 'light'), l.id).toBe(true);
      expect(hasStyle(l, 'rainbow'), l.id).toBe(true);
      expect(count(l, 'portal'), l.id).toBeGreaterThanOrEqual(2);
    }
    // „viele Portale“: im Schnitt mehr als in den anderen Welten ohne Portal-Schwerpunkt
    const pairs = (w: WorldId) => layoutsOfWorld(w).reduce((s, l) => s + count(l, 'portal') / 2, 0);
    expect(pairs('prismara')).toBeGreaterThan(pairs('wurzelwild'));
  });

  it('Nova Nexus: rotierende Inseln, Strahlenwege, Raumportale und Chaos-Felder', () => {
    for (const l of layoutsOfWorld('nova-nexus')) {
      expect(
        l.islands.some((i) => i.spin !== undefined && i.spin !== 0),
        l.id,
      ).toBe(true);
      expect(hasStyle(l, 'beam'), l.id).toBe(true);
      expect(count(l, 'portal'), l.id).toBeGreaterThanOrEqual(2);
      expect(count(l, 'chaos'), l.id).toBeGreaterThanOrEqual(1);
      expect(l.features.join(' '), l.id).toContain('Schwerkraft');
    }
  });

  it('Wurzelwild: Rankenbrücken, Dornentore (gates), wachsende Wege und viele Läden/Items', () => {
    const ls = layoutsOfWorld('wurzelwild');
    for (const l of ls) {
      expect(hasStyle(l, 'vine'), l.id).toBe(true);
      expect(count(l, 'gate'), l.id).toBeGreaterThanOrEqual(1);
      expect(count(l, 'item'), l.id).toBeGreaterThanOrEqual(3);
      expect(count(l, 'shop'), l.id).toBeGreaterThanOrEqual(3);
    }
    expect(ls.filter((l) => l.foldPhases > 1).length).toBeGreaterThanOrEqual(5);
  });

  it('Paradox City: Faltung (2–3 Phasen) mit vielen faltbaren Kanten, Treppen und rotierende Plattformen', () => {
    for (const l of layoutsOfWorld('paradox-city')) {
      expect(l.foldPhases, l.id).toBeGreaterThanOrEqual(2);
      expect(l.edges.filter((e) => e.folds).length, l.id).toBeGreaterThanOrEqual(6);
      expect(hasStyle(l, 'stairs'), l.id).toBe(true);
      expect(
        l.islands.some((i) => i.spin),
        l.id,
      ).toBe(true);
    }
    expect(layoutsOfWorld('paradox-city').some((l) => l.foldPhases === 3)).toBe(true);
  });

  it('Infinity Carnival: Schienen überall, Finale-Bretter 07–10 sind die größten und schwersten', () => {
    const ls = layoutsOfWorld('infinity-carnival');
    for (const l of ls) expect(hasStyle(l, 'rail'), l.id).toBe(true);
    const finale = ls.filter((l) => l.index >= 7);
    const rest = ls.filter((l) => l.index < 7);
    for (const l of finale) {
      expect(l.difficulty, l.id).toBe(3);
      expect(l.foldPhases, l.id).toBeGreaterThanOrEqual(2);
      expect(count(l, 'portal'), l.id).toBeGreaterThanOrEqual(6);
      expect(l.nodes.length, l.id).toBeGreaterThanOrEqual(44);
    }
    const mean = (xs: Layout[], f: (l: Layout) => number) => xs.reduce((s, l) => s + f(l), 0) / xs.length;
    expect(mean(finale, (l) => l.nodes.length)).toBeGreaterThan(mean(rest, (l) => l.nodes.length));
    // alle Mechaniken kommen im Finale vor
    for (const k of ['portal', 'gate', 'chaos', 'shop'])
      expect(
        finale.every((l) => count(l, k) > 0),
        k,
      ).toBe(true);
  });
});

describe('graph.ts – Hilfsfunktionen', () => {
  // Kleiner Ring 0→1→2→3→0 mit Abkürzung 0→2 (nur Phase 1) und Sackgassen-Nebenast 3→4 (nur Phase 0)
  const mk = (): Layout => ({
    id: 'prismara-01',
    world: 'prismara',
    index: 1,
    name: 'Test',
    blurb: 'Kleines Testlayout für die Graph-Hilfen.',
    template: 'test',
    foldPhases: 2,
    nodes: [0, 1, 2, 3, 4].map((i) => ({
      id: i,
      kind: i === 0 ? 'start' : 'glimmer',
      pos: [i * 3, 0, 0] as [number, number, number],
    })),
    edges: [
      { from: 0, to: 1, style: 'path' },
      { from: 1, to: 2, style: 'path' },
      { from: 2, to: 3, style: 'path' },
      { from: 3, to: 0, style: 'path' },
      { from: 0, to: 2, style: 'bridge', folds: [1] },
      { from: 3, to: 4, style: 'path', folds: [0] },
      { from: 4, to: 0, style: 'path' },
    ],
    start: 0,
    altarSites: [1, 2, 3, 4],
    features: ['Test'],
    difficulty: 1,
    recommendedRounds: 10,
    islands: [{ center: [0, 0, 0], radius: 10 }],
  });

  it('foldPhaseOfRound: (r-1) % foldPhases, 1 Phase = immer 0', () => {
    const l = mk();
    expect([1, 2, 3, 4, 5].map((r) => foldPhaseOfRound(l, r))).toEqual([0, 1, 0, 1, 0]);
    expect(foldPhaseOfRound({ ...l, foldPhases: 1 }, 9)).toBe(0);
    expect(foldPhaseOfRound({ ...l, foldPhases: 3 }, 7)).toBe(0);
    expect(foldPhaseOfRound({ ...l, foldPhases: 3 }, 0)).toBe(2);
  });

  it('edgeActive: ohne folds immer, sonst nur in den genannten Phasen', () => {
    expect(edgeActive({ from: 0, to: 1, style: 'path' }, 5)).toBe(true);
    expect(edgeActive({ from: 0, to: 1, style: 'path', folds: [1] }, 1)).toBe(true);
    expect(edgeActive({ from: 0, to: 1, style: 'path', folds: [1] }, 0)).toBe(false);
  });

  it('outgoing: nur in der Phase begehbare Kanten', () => {
    const l = mk();
    expect(outgoing(l, 0, 0).map((e) => e.to)).toEqual([1]);
    expect(outgoing(l, 0, 1).map((e) => e.to)).toEqual([1, 2]);
    expect(outgoing(l, 3, 0).map((e) => e.to)).toEqual([0, 4]);
    expect(outgoing(l, 3, 1).map((e) => e.to)).toEqual([0]);
  });

  it('adjacency: alle ausgehenden Kanten pro Feld, phasenunabhängig', () => {
    const adj = adjacency(mk());
    expect(adj).toHaveLength(5);
    expect(adj[0]?.map((e) => e.to)).toEqual([1, 2]);
    expect(adj[4]?.map((e) => e.to)).toEqual([0]);
  });

  it('reachable / canReach respektieren das Kantenprädikat', () => {
    const l = mk();
    const core = (e: LayoutEdge) => !e.folds;
    expect([...reachable(l, 0, core)].sort()).toEqual([0, 1, 2, 3]);
    expect([...reachable(l, 0, () => true)].sort()).toEqual([0, 1, 2, 3, 4]);
    expect([...canReach(l, 0, core)].sort()).toEqual([0, 1, 2, 3, 4]);
    expect([...canReach(l, 4, core)]).toEqual([4]);
    expect([...canReach(l, 4, () => true)].sort()).toEqual([0, 1, 2, 3, 4]);
    expect(reachable(l, 2, (e) => e.from !== 3).size).toBe(2);
  });

  it('distancesFrom: kürzeste Schrittzahl je Phase', () => {
    const l = mk();
    expect(distancesFrom(l, 0, 0)).toEqual([0, 1, 2, 3, 4]);
    expect(distancesFrom(l, 0, 1)).toEqual([0, 1, 1, 2, Infinity]);
  });

  it('validateLayout erkennt kaputte Layouts', () => {
    const l = mk();
    expect(validateLayout(l).length).toBeGreaterThan(0);
    const good = getLayout('prismara-01');
    const broken: Layout = { ...good, edges: good.edges.filter((e) => e.from !== good.start) };
    expect(validateLayout(broken).length).toBeGreaterThan(0);
  });
});
