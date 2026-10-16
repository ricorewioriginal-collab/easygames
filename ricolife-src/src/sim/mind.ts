// Bedürfnisse, Stimmungsauslöser aus Bedürfnissen/Umgebung/Wetter, Emotionen und Notfälle.
import { traitById } from '../data/traits';
import type { NeedId } from '../data/types';
import { NEED_IDS } from '../data/types';
import { getDef } from '../world/defs';
import { cellKey, edgeKey, type World } from '../world/world';
import { nextActionUid, type Game } from './game';
import type { Sim } from './types';
import { def } from './interact';

const BASE: Record<NeedId, number> = { hunger: 0.075, energy: 0.055, hygiene: 0.05, bladder: 0.14, social: 0.045, fun: 0.065, comfort: 0.05 };

export function decayFactor(g: Game, s: Sim, n: NeedId): number {
  let f = s.traits.reduce((m, t) => m * (traitById(t).decay?.[n] ?? 1), 1);
  if (s.age === 'baby') f *= n === 'hunger' ? 1.6 : n === 'social' ? 1.4 : n === 'fun' ? 0.5 : 1;
  if (s.age === 'toddler' && n === 'energy') f *= 1.2;
  if (s.age === 'senior' && n === 'energy') f *= 1.15;
  if (n === 'energy' && g.skillLv(s, 'fitness') >= 3) f *= 0.9;
  return f * g.settings.needsDecay;
}

const NEED_MOODS: [NeedId, number, string][] = [
  ['hunger', 10, 'starving'],
  ['hunger', 25, 'hungry'],
  ['energy', 10, 'exhausted'],
  ['energy', 25, 'sleepy'],
  ['hygiene', 20, 'stinky'],
  ['bladder', 20, 'bladder'],
  ['social', 20, 'lonely'],
  ['fun', 20, 'bored'],
  ['comfort', 20, 'uncomfortable'],
];

/** Raum der Zelle (Flutfüllung innerhalb von Wänden, max. 250 Zellen); null = draußen */
export function roomCells(w: World, l: number, x: number, z: number): number[] | null {
  const start = cellKey(l, x, z);
  if (!w.floors.has(start)) return null;
  const seen = new Set<number>([start]);
  const stack: [number, number][] = [[x, z]];
  while (stack.length) {
    const [cx, cz] = stack.pop()!;
    for (const [dx, dz, ex, ez, dir] of [
      [1, 0, cx + 1, cz, 1],
      [-1, 0, cx, cz, 1],
      [0, 1, cx, cz + 1, 0],
      [0, -1, cx, cz, 0],
    ] as [number, number, number, number, 0 | 1][]) {
      const nx = cx + dx,
        nz = cz + dz;
      const k = cellKey(l, nx, nz);
      if (seen.has(k)) continue;
      if (w.walls.has(edgeKey(l, ex, ez, dir))) continue;
      if (!w.floors.has(k)) return null; // offen nach draußen
      seen.add(k);
      if (seen.size > 250) return null;
      stack.push([nx, nz]);
    }
  }
  return [...seen];
}

export function roomScore(w: World, cells: number[]): { decor: number; dirty: number } {
  const set = new Set(cells);
  let decor = 0,
    dirty = 0;
  for (const o of w.objs.values()) {
    const k = cellKey(o.l, o.x, o.z);
    if (!set.has(k)) continue;
    const d = getDef(o.def);
    if (o.def === 'prop-dirty' || o.def === 'prop-puddle' || o.def === 'prop-trash') dirty++;
    decor += (d.decor ?? 0) + (d.comfort ?? 0) * 0.25 + (d.light ? 1 : 0);
  }
  // Wandobjekte (Bilder) zählen über ihre Kante
  for (const [k, id] of w.wallObj) {
    const o = w.objs.get(id);
    if (!o) continue;
    void k;
    if (set.has(cellKey(o.l, o.x, o.z))) decor += getDef(o.def).decor ?? 1;
  }
  return { decor: decor / Math.max(1, Math.sqrt(cells.length)), dirty };
}

export function isOutside(g: Game, s: Sim): boolean {
  return s.l === 0 && !g.world.floors.has(cellKey(0, Math.floor(s.x), Math.floor(s.z)));
}

export function installMind(g: Game): void {
  g.systems.push({
    name: 'mind',
    tick: (g2, dt) => {
      for (const s of g2.sims.values()) {
        if (s.npc && !s.rt.spawned && !s.visit) continue; // ferne Stadtbewohner: abstrakt
        const cur = s.queue[0];
        const sleeping = cur?.def === 'sleep' || cur?.def === 'nap' || cur?.def === 'passOut';
        const seated = s.rt.y > 0.1;
        for (const n of NEED_IDS) {
          let r = BASE[n] * decayFactor(g2, s, n);
          if (n === 'energy' && sleeping) continue;
          if (n === 'comfort') {
            if (seated || sleeping) continue;
            if (s.rt.anim === 'walk') r *= 1.2;
          }
          if (s.away?.kind === 'work' || s.away?.kind === 'school') r *= n === 'fun' ? 1.3 : n === 'social' ? 0.2 : n === 'bladder' || n === 'hygiene' ? 0.4 : 0.8;
          if (s.away?.kind === 'home') r *= 0.3;
          s.needs[n] = Math.max(0, s.needs[n] - r * dt);
        }
        if (seated && !sleeping) s.needs.comfort = Math.min(100, s.needs.comfort + 0.4 * dt);
        if (!s.away && !s.trip && s.rt.spawned !== false) emergencies(g2, s);
      }
    },
    minute: (g2) => {
      const now = g2.clock.min;
      for (const s of g2.sims.values()) {
        if (s.npc && !s.rt.spawned && !s.visit) {
          // abstrakte Bewohner: langsam Richtung Mittelwert
          for (const n of NEED_IDS) s.needs[n] += (70 - s.needs[n]) * 0.002;
          s.moods = s.moods.filter((m) => m.until > now);
          continue;
        }
        s.moods = s.moods.filter((m) => m.until > now);
        for (const [n, th, id] of NEED_MOODS) {
          const has = s.moods.some((m) => m.id === id);
          if (s.needs[n] < th && !has) {
            if (id === 'hungry' && s.moods.some((m) => m.id === 'starving')) continue;
            if (id === 'sleepy' && s.moods.some((m) => m.id === 'exhausted')) continue;
            g2.addMood(s, id, { hours: 0.6 });
          } else if (s.needs[n] >= th + 3 && has) g2.removeMood(s, id);
          else if (has) {
            const m = s.moods.find((x) => x.id === id)!;
            m.until = now + 30;
          }
        }
        const [e, p] = g2.dominantEmotion(s);
        s.emo = e;
        s.emoPower = p;
      }
    },
    hourly: (g2) => {
      // Umgebung und Wetter
      for (const s of g2.sims.values()) {
        if (s.away || s.trip || (s.npc && !s.rt.spawned)) continue;
        if (isOutside(g2, s)) {
          const w = g2.weather.now;
          if (w === 'rain' || w === 'storm') g2.addMood(s, 'rainy');
          else if (w === 'snow') g2.addMood(s, s.age === 'child' || g2.hasTrait(s, 'cheerful') ? 'snowfun' : 'cold');
          else if (w === 'sunny' && g2.clock.hour > 8 && g2.clock.hour < 19) g2.addMood(s, 'sunshine');
          if (g2.weather.temp < 2 && w !== 'snow') g2.addMood(s, 'cold');
        } else {
          const cells = roomCells(g2.world, s.l, Math.floor(s.x), Math.floor(s.z));
          if (!cells) continue;
          const sc = roomScore(g2.world, cells);
          if (sc.dirty > 0 && !g2.hasTrait(s, 'messy')) g2.addMood(s, sc.dirty > 2 ? 'messyroom' : 'dirtydishes', { hours: 1.5 });
          if (sc.decor > 9) g2.addMood(s, 'beautifulroom', { hours: 1.5 });
          else if (sc.decor > 4.5) g2.addMood(s, 'niceroom', { hours: 1.5 });
        }
      }
    },
  });
}

function emergencies(g: Game, s: Sim): void {
  const cur = s.queue[0];
  if (s.needs.bladder <= 0 && s.age !== 'baby') {
    // Missgeschick
    s.needs.bladder = 100;
    s.needs.hygiene = Math.max(0, s.needs.hygiene - 45);
    g.addMood(s, 'accident');
    g.bubble(s, '💦', 6);
    const lot = g.lotOf(s);
    if (lot && s.age !== 'toddler') g.spawnProp('prop-puddle', lot, s.l, { x: s.x, z: s.z });
    if (g.isControllable(s)) g.notify(`Oh nein! ${s.first} hat es nicht mehr zur Toilette geschafft.`, '💦', s.id, 'bad');
    if (cur && cur.def !== 'toilet') cur.phase = 'done';
  }
  if (s.needs.energy <= 0 && cur?.def !== 'sleep' && cur?.def !== 'passOut' && s.age !== 'baby') {
    for (const q of s.queue) if (q.phase !== 'done') q.phase = 'done';
    s.queue.unshift({ uid: nextActionUid(), def: 'passOut', phase: 'queued', t: 0, dur: 0, user: false });
    if (g.isControllable(s)) g.notify(`${s.first} ist vor Erschöpfung eingeschlafen.`, '💤', s.id, 'bad');
  }
  if (s.needs.hunger <= 0 && s.age !== 'baby') {
    s.needs.hunger = 25;
    s.needs.energy = Math.max(5, s.needs.energy - 20);
    g.addMood(s, 'starving', { hours: 3 });
    if (g.isControllable(s)) g.notify(`${s.first} war so hungrig, dass ein Nachbar etwas zu essen vorbeigebracht hat. Bitte rechtzeitig essen!`, '🥪', s.id, 'bad');
  }
}

def({
  id: 'passOut', label: 'Eingeschlafen', icon: '💤', on: 'self', hidden: true, auto: false, busy: true,
  route: () => null, dur: 150, anim: 'sleep', rate: { energy: 0.25, comfort: -0.05 },
  start: (c) => {
    c.s.rt.y = 0;
  },
});
