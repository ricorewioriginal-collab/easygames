import { Rng, hashString } from '../../rng';
import type { EdgeStyle, Layout, LayoutEdge, LayoutNode, WorldId } from '../types';
import { BuildCtx, Draft, Styles, dist3, round1 } from './common';
import { addExtraEdges } from './extras';
import { Mix, assignKinds } from './kinds';

/** Bauplan eines Layouts: Topologie-Bauer + Regeln für Verteilung, Abkürzungen und Faltung */
export interface LayoutSpec {
  world: WorldId;
  index: number;
  name: string;
  blurb: string;
  /** Name des Topologie-Bauers (Bauplan) */
  template: string;
  /** Eigener Seed (Standard: aus der ID abgeleitet) */
  seed?: number;
  styles: Styles;
  build: (ctx: BuildCtx) => Draft;
  /** Dauerhafte Abkürzungen */
  shortcuts?: { count: number; style?: EdgeStyle; minHop?: number };
  /** 4D-Faltung: Phasen, Zahl faltbarer Wege */
  folds?: { phases: 2 | 3; count: number; style?: EdgeStyle; shift?: boolean; minHop?: number };
  mix: Partial<Mix>;
  /** Drehgeschwindigkeit je Insel (undefined = starr) */
  spin?: (islandIndex: number, total: number) => number | undefined;
  /** Zusätzliche Stichworte (werden um aus den Daten abgeleitete ergänzt) */
  features: string[];
  difficulty: 1 | 2 | 3;
  rounds: number;
}

const STYLE_FEATURE: Partial<Record<EdgeStyle, string>> = {
  light: 'Lichtbrücken',
  rainbow: 'Regenbogenwege',
  beam: 'Strahlenwege',
  vine: 'Rankenbrücken',
  stairs: 'Treppen',
  rail: 'Schienen',
};

const ARC_FACTOR: Partial<Record<EdgeStyle, number>> = { rainbow: 0.2, vine: 0.14, light: 0.1, bridge: 0.08 };

const uniq = <T>(a: T[]): T[] => [...new Set(a)];

/** Baut aus einer Beschreibung ein vollständiges, deterministisches Layout. */
export function makeLayout(spec: LayoutSpec): Layout {
  const id = `${spec.world}-${String(spec.index).padStart(2, '0')}`;
  const rng = new Rng(spec.seed ?? hashString(id));
  const d = spec.build({ rng: rng.fork(1), st: spec.styles });
  if (spec.shortcuts && spec.shortcuts.count > 0)
    addExtraEdges(d, rng.fork(2), {
      count: spec.shortcuts.count,
      style: spec.shortcuts.style ?? spec.styles.short,
      minHop: spec.shortcuts.minHop,
    });
  const foldPhases = spec.folds ? spec.folds.phases : 1;
  if (spec.folds && spec.folds.count > 0)
    addExtraEdges(d, rng.fork(3), {
      count: spec.folds.count,
      style: spec.folds.style ?? spec.styles.short,
      phases: spec.folds.phases,
      shift: spec.folds.shift,
      minHop: spec.folds.minHop,
    });
  if (d.islands.length === 0)
    d.groupIsland(
      d.nodes.map((_, i) => i),
      3,
    );
  if (spec.spin)
    d.islands.forEach((isl, i) => {
      const s = spec.spin?.(i, d.islands.length);
      if (s !== undefined) isl.spin = s;
    });

  const mix: Mix = {
    portals: 0,
    gates: 0,
    shops: 2,
    chaos: 0,
    items: 2,
    events: 2,
    thorn: 0.16,
    ...spec.mix,
  };
  mix.shops = Math.min(mix.shops, Math.ceil(d.nodes.length / 8));
  const kr = assignKinds(d, rng.fork(4), mix);
  const nodes: LayoutNode[] = d.nodes.map((nd, i) => {
    const ln: LayoutNode = {
      id: i,
      kind: kr.kinds[i] as LayoutNode['kind'],
      pos: [round1(nd.pos[0]), round1(nd.pos[1]), round1(nd.pos[2])],
    };
    const p = kr.portal[i];
    if (p !== undefined) ln.portal = p;
    if (nd.island !== undefined) ln.island = nd.island;
    return ln;
  });
  const edges: LayoutEdge[] = d.edges.map((e) => {
    const len = dist3(d.nodes[e.from]!.pos, d.nodes[e.to]!.pos);
    const arc = e.arc ?? round1(len * (ARC_FACTOR[e.style] ?? 0));
    const le: LayoutEdge = { from: e.from, to: e.to, style: e.style };
    if (arc > 0) le.arc = arc;
    if (e.folds) le.folds = e.folds;
    return le;
  });

  const count = (k: string) => nodes.filter((x) => x.kind === k).length;
  const feats: string[] = [...spec.features];
  if (count('portal') > 0) feats.push('Portale');
  if (count('gate') > 0) feats.push(spec.world === 'wurzelwild' ? 'Dornentore' : 'Mautbrücken');
  if (count('chaos') > 0) feats.push('Chaos-Felder');
  if (count('shop') >= 3) feats.push('Viele Läden');
  if (foldPhases > 1) feats.push(foldPhases === 2 ? 'Raumfaltung' : 'Dreifach-Faltung');
  if (spec.shortcuts && spec.shortcuts.count > 0) feats.push('Abkürzungen');
  for (const s of uniq(edges.map((e) => e.style))) {
    const f = STYLE_FEATURE[s];
    if (f) feats.push(f);
  }
  if (d.islands.some((i) => i.spin)) feats.push('Rotierende Inseln');

  return {
    id,
    world: spec.world,
    index: spec.index,
    name: spec.name,
    blurb: spec.blurb,
    template: spec.template,
    foldPhases,
    nodes,
    edges,
    start: d.start,
    altarSites: kr.altar,
    features: uniq(feats),
    difficulty: spec.difficulty,
    recommendedRounds: spec.rounds,
    islands: d.islands,
  };
}
