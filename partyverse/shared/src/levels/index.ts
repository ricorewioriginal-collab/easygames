import type { Layout, WorldId } from './types';
import { LAYOUTS_PRISMARA } from './worlds/prismara';
import { LAYOUTS_NOVA_NEXUS } from './worlds/nova-nexus';
import { LAYOUTS_WURZELWILD } from './worlds/wurzelwild';
import { LAYOUTS_PARADOX_CITY } from './worlds/paradox-city';
import { LAYOUTS_INFINITY_CARNIVAL } from './worlds/infinity-carnival';

export * from './types';
export * from './graph';
export * from './validate';

/** Alle 50 Layouts (5 Welten × 10) */
export const LAYOUTS: readonly Layout[] = [
  ...LAYOUTS_PRISMARA,
  ...LAYOUTS_NOVA_NEXUS,
  ...LAYOUTS_WURZELWILD,
  ...LAYOUTS_PARADOX_CITY,
  ...LAYOUTS_INFINITY_CARNIVAL,
];
export function getLayout(id: string): Layout {
  const l = LAYOUTS.find((x) => x.id === id);
  if (!l) throw new Error('Unbekanntes Layout: ' + id);
  return l;
}
export const layoutsOfWorld = (w: WorldId): Layout[] => LAYOUTS.filter((l) => l.world === w);
