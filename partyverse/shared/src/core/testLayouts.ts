import type { Layout, LayoutEdge, LayoutNode, NodeKind } from '../levels/types';

/** Kleines, gültiges Brett für Tests: 28er-Ring, Abkürzung mit Mautbrücke, Portale, Läden, Faltung (2 Phasen). */
export function makeTestLayout(): Layout {
  const nodes: LayoutNode[] = [];
  const kinds: Record<number, NodeKind> = {
    0: 'start',
    3: 'portal',
    17: 'portal',
    5: 'event',
    15: 'event',
    20: 'event',
    9: 'shop',
    22: 'shop',
    12: 'item',
    25: 'item',
    26: 'chaos',
    7: 'thorn',
    11: 'thorn',
    18: 'thorn',
    24: 'thorn',
    29: 'gate',
  };
  const R = 12;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    nodes.push({
      id: i,
      kind: kinds[i] ?? 'glimmer',
      pos: [Math.cos(a) * R, (i % 5) * 0.2, Math.sin(a) * R],
      island: 0,
      ...(i === 3 ? { portal: 17 } : i === 17 ? { portal: 3 } : {}),
    });
  }
  const extra: Array<[number, number, number]> = [
    [5.5, 0.5, 2],
    [3, 1, 0],
    [0.5, 1.5, -2],
    [-3.5, 1, -1],
  ];
  extra.forEach((p, k) =>
    nodes.push({ id: 28 + k, kind: 28 + k === 29 ? 'gate' : 'glimmer', pos: p, island: 1 }),
  );
  const edges: LayoutEdge[] = [];
  for (let i = 0; i < 28; i++) edges.push({ from: i, to: (i + 1) % 28, style: 'path' });
  edges.push(
    { from: 6, to: 28, style: 'bridge', arc: 1 },
    { from: 28, to: 29, style: 'bridge' },
    { from: 29, to: 30, style: 'bridge' },
    { from: 30, to: 31, style: 'bridge' },
    { from: 31, to: 14, style: 'bridge', arc: 1 },
  );
  edges.push(
    { from: 10, to: 16, style: 'light', folds: [0], arc: 2 },
    { from: 13, to: 19, style: 'light', folds: [1], arc: 2 },
    { from: 20, to: 26, style: 'light', folds: [0, 1], arc: 2 },
  );
  return {
    id: 'prismara-01',
    world: 'prismara',
    index: 1,
    name: 'Testring',
    blurb: 'Ein kleiner Ring zum Testen der Regeln und Wege.',
    template: 'test-ring',
    foldPhases: 2,
    nodes,
    edges,
    start: 0,
    altarSites: [10, 13, 19, 23],
    features: ['Test'],
    difficulty: 1,
    recommendedRounds: 10,
    islands: [
      { center: [0, 0, 0], radius: 13 },
      { center: [0, 1, 0], radius: 6 },
    ],
  };
}
