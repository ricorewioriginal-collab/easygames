// Interaktionsmenü: welche Handlungen bietet ein angeklicktes Ziel der aktiven Figur an?
import { getDef } from '../world/defs';
import type { ObjInst } from '../world/world';
import { availability, labelOf } from './actions';
import { REG, type IDef, type QCtx } from './interact';
import { recipesFor } from './interactions';
import { TV_CHANNELS } from './interactions';
import type { Game } from './game';
import type { Pet, Sim } from './types';

export interface MenuItem {
  def: string;
  label: string;
  icon: string;
  group: string;
  avail: true | string;
  data?: Record<string, string | number | boolean>;
}
export type Target = { kind: 'obj'; o: ObjInst } | { kind: 'sim'; t: Sim } | { kind: 'pet'; p: Pet } | { kind: 'ground'; x: number; z: number; l: number } | { kind: 'self' };

function push(out: MenuItem[], g: Game, d: IDef, c: QCtx, data?: MenuItem['data']): void {
  const av = availability(g, d, c);
  if (av === false) return;
  out.push({ def: d.id, label: labelOf(d, { ...c, a: data ? ({ data } as never) : undefined }), icon: d.icon, group: d.group ?? '', avail: av, data });
}

export function menuFor(g: Game, s: Sim, tg: Target): MenuItem[] {
  const out: MenuItem[] = [];
  for (const d of REG.values()) {
    if (d.id === 'socReact' || d.id === 'babyHeld' || d.id === 'passOut' || d.id === 'leaveLot' || d.id === 'npcWork' || d.id === 'eatSeat' || d.id === 'readSeat' || d.id === 'cookStove' || d.id === 'washAtSink' || d.id === 'goTo') continue;
    if (tg.kind === 'obj' && d.on === 'obj') {
      const c: QCtx = { g, s, o: tg.o };
      if (d.id === 'cook') {
        // ein Eintrag je bekanntem Rezept
        if (availability(g, d, c) === false) continue;
        for (const r of recipesFor(g, s)) push(out, g, d, c, { recipe: r.id });
        continue;
      }
      if (d.id === 'watchTV') {
        if (availability(g, d, c) === false) continue;
        for (const ch of Object.keys(TV_CHANNELS)) push(out, g, d, c, { ch });
        continue;
      }
      if (d.hidden && !d.func) continue;
      push(out, g, d, c);
    } else if (tg.kind === 'sim' && d.on === 'sim' && tg.t.id !== s.id) push(out, g, d, { g, s, t: tg.t });
    else if (tg.kind === 'pet' && d.on === 'pet') push(out, g, d, { g, s, p: tg.p });
    else if (tg.kind === 'ground' && d.on === 'ground') push(out, g, d, { g, s }, { x: tg.x, z: tg.z, l: tg.l });
    else if (tg.kind === 'self' && d.on === 'self' && !d.hidden) push(out, g, d, { g, s });
  }
  // verfügbare zuerst, dann nach Gruppe
  return out.sort((a, b) => (a.avail === true ? 0 : 1) - (b.avail === true ? 0 : 1));
}

export function targetName(g: Game, tg: Target): string {
  switch (tg.kind) {
    case 'obj':
      return getDef(tg.o.def).name;
    case 'sim':
      return `${tg.t.first} ${tg.t.last}`;
    case 'pet':
      return tg.p.name;
    case 'ground':
      return 'Hier';
    default:
      return g.active?.first ?? 'Ich';
  }
}

/** Menüeintrag ausführen (Spielerbefehl) */
export function runItem(g: Game, s: Sim, tg: Target, it: MenuItem): boolean {
  if (it.avail !== true) return false;
  const a = g.queueAction(s, it.def, {
    user: true,
    obj: tg.kind === 'obj' ? tg.o.id : undefined,
    target: tg.kind === 'sim' ? tg.t.id : tg.kind === 'pet' ? tg.p.id : undefined,
    data: it.data,
  });
  return !!a;
}
