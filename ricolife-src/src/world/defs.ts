import type { ObjectDef } from '../data/types';
import { OBJECTS } from '../data/objects';
import { PROPS } from '../data/props';

const MAP = new Map<string, ObjectDef>();
for (const d of [...OBJECTS, ...PROPS]) MAP.set(d.id, d);

const FALLBACK: ObjectDef = { id: 'missing', name: 'Unbekanntes Objekt', desc: '', cat: 'deco', price: 0, w: 1, d: 1, h: 0.5, parts: [{ s: 'box', p: [0, 0.25, 0], d: [0.5, 0.5, 0.5], c: '#ff00ff' }] };

export const getDef = (id: string): ObjectDef => MAP.get(id) ?? FALLBACK;
export const hasDef = (id: string): boolean => MAP.has(id);
export const allDefs = (): ObjectDef[] => [...MAP.values()];
export const buyable = (): ObjectDef[] => OBJECTS.filter((d) => !d.hidden);
/** erstes Objekt mit dieser Funktion (für Vorlagen, falls eine ID fehlt) */
export const defWithFunc = (f: string, prefer?: string): string => {
  if (prefer && MAP.has(prefer)) return prefer;
  const d = OBJECTS.find((o) => o.func?.includes(f as never) && !o.hidden) ?? OBJECTS.find((o) => o.func?.includes(f as never));
  return d?.id ?? 'missing';
};
