/* Wohin muss ich? Findet für jedes Quest-Ziel einen Ort in der Welt – für Lichtsäule, Minikarte, Karte und Kompass-Pfeil.
   Reihenfolge: feste Position → ausdrücklicher Verweis (via) → passende Interaktion in der Nähe (Gegenstand, Minispiel, Flag, Ereignis)
   → Gesprächspartner der Phase → Insel der Quest (wenn man woanders ist) → Auftraggeber. */
import type { Game } from '../game.ts';
import type { NpcSystem } from './npc.ts';
import type { Objective, QuestDef, Stage } from './quests.ts';
import type { Interactable } from './interact.ts';

export interface Target { x: number; z: number; y?: number; precise: boolean }

export function interactFor(g: Game, o: Objective): Interactable | null {
  const t = o.target, item = t.replace(/^item:/, '');
  const match = (i: Interactable): boolean => {
    if (o.via && (i.id === o.via || i.id.startsWith(o.via))) return true;
    if (o.via) return false;
    const m = i.meta;
    if (i.id === t) return true;
    switch (o.type) {
      case 'have': case 'collect': return m?.item === item;
      case 'minigame': return m?.game === t;
      case 'flag': return m?.flag === t;
      case 'photo': return m?.photo === t || i.id === 'foto:' + t;
      case 'interact': return i.id.startsWith(t) || m?.ev === t;
      case 'defeat': return m?.defeat === t;
      default: return i.id === t;
    }
  };
  const p = g.player.pos;
  let best: Interactable | null = null, bd = Infinity, bestOff: Interactable | null = null, bo = Infinity;
  for (const i of g.interact.all) {
    if (!match(i)) continue;
    const d = Math.hypot(i.x - p.x, i.z - p.z);
    if (!i.when || i.when()) { if (d < bd) { bd = d; best = i; } } else if (d < bo) { bo = d; bestOff = i; }
  }
  return best ?? bestOff;
}

export function resolveObjective(g: Game, npcs: NpcSystem, q: QuestDef, st: Stage, o: Objective | null): Target | null {
  const npcPos = (id: string): Target | null => { const live = npcs.live.get(id); if (live) return { x: live.pos.x, z: live.pos.z, precise: true }; const d = npcs.defs.get(id); return d ? { x: d.x, z: d.z, precise: true } : null; };
  if (o) {
    if (o.at) return { x: o.at.x, z: o.at.z, precise: true };
    if (o.type === 'talk') { const n = npcPos(o.target); if (n) return n; }
    if (o.type === 'enter') { const w = g.worlds.byId(o.target); if (w) return { x: w.spawn.x, z: w.spawn.z, precise: true }; }
    if (o.type === 'discover') { const [w, k] = o.target.split(':'); const poi = g.worlds.byId(w)?.pois[k]; if (poi) return { x: poi.x, z: poi.z, precise: true }; }
    const i = interactFor(g, o);
    if (i) return { x: i.x, z: i.z, y: i.y, precise: true };
  }
  const dlgNpc = st.dialog ? Object.keys(st.dialog)[0] : null;
  // Auf der falschen Insel → erst zur richtigen Insel
  const w = g.worlds.byId(q.world);
  if (w && g.currentWorld?.id !== q.world && !(dlgNpc && npcs.defs.get(dlgNpc)?.world !== q.world)) return { x: w.spawn.x, z: w.spawn.z, precise: false };
  // Gesprächspartner dieser Phase
  if (dlgNpc) { const n = npcPos(dlgNpc); if (n) return n; }
  if (q.giver) { const n = npcPos(q.giver); if (n) return { ...n, precise: false }; }
  return null;
}
