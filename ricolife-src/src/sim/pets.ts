// Haustiere (Hund, Katze): eigene kleine KI mit Bedürfnissen, Napf, Körbchen, Spielzeug, Betteln und Folgen.
import { findPath } from '../world/nav';
import { cellKey, type ObjInst } from '../world/world';
import { def, type QCtx } from './interact';
import type { Game } from './game';
import type { Pet, Sim } from './types';

const PET_SPEED = 1.9;
const ADULTS = ['child', 'teen', 'youngadult', 'adult', 'senior'] as const;

export const PET_FUR_NAMES = ['Creme', 'Karamell', 'Schoko', 'Schwarz', 'Grau getigert', 'Rot getigert', 'Weiß gefleckt', 'Dreifarbig'];

function petLot(g: Game, p: Pet): string | null {
  return g.hhs.get(p.hh)?.lot ?? null;
}

function walkTo(g: Game, p: Pet, x: number, z: number, l: number): boolean {
  const path = findPath(g.world, p.x, p.z, p.l, [{ x, z, l }], { allowLot: petLot(g, p) ?? undefined, maxNodes: 3000 });
  if (!path) return false;
  p.rt.path = path;
  p.rt.pathI = path.length > 1 ? 1 : 0;
  return true;
}
function nearCell(g: Game, o: ObjInst): [number, number] | null {
  for (const [cx, cz] of g.world.cellsOf(o))
    for (const [dx, dz] of [[0, 1], [1, 0], [-1, 0], [0, -1]] as const)
      if (g.world.cellWalkable(o.l, cx + dx, cz + dz)) return [cx + dx + 0.5, cz + dz + 0.5];
  return null;
}
function moveAlong(p: Pet, dt: number, speed: number): boolean {
  const path = p.rt.path;
  if (!path || p.rt.pathI >= path.length) return true;
  let remain = speed * dt;
  while (remain > 0 && p.rt.pathI < path.length) {
    const t = path[p.rt.pathI]!;
    const dx = t.x - p.x,
      dz = t.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d <= remain) {
      p.x = t.x;
      p.z = t.z;
      p.l = t.l;
      remain -= d;
      p.rt.pathI++;
    } else {
      p.x += (dx / d) * remain;
      p.z += (dz / d) * remain;
      p.rot = Math.atan2(dx, dz);
      remain = 0;
    }
  }
  return p.rt.pathI >= path.length;
}

function owners(g: Game, p: Pet): Sim[] {
  return g.members(p.hh).filter((s) => !s.away && !s.trip && s.age !== 'baby');
}

function choose(g: Game, p: Pet): void {
  const lot = petLot(g, p);
  if (!lot) return;
  const n = p.needs;
  const lazy = p.traits.includes('lazy');
  if (n.hunger < 35) {
    const bowl = g.objsWith(lot, 'petbowl').find((o) => (o.st?.filled ?? 0) > 0);
    if (bowl) {
      const c = nearCell(g, bowl);
      if (c && walkTo(g, p, c[0], c[1], bowl.l)) {
        p.act = { kind: 'eat', t: 6, obj: bowl.id };
        return;
      }
    }
    // betteln bei einer Person
    const o = owners(g, p)[0];
    if (o && walkTo(g, p, o.x + 0.6, o.z + 0.6, o.l)) {
      p.act = { kind: 'beg', t: 4, follow: o.id };
      p.rt.bubble = { icon: '🍖', until: g.clock.min + 6 };
      return;
    }
  }
  if (n.energy < (lazy ? 45 : 30)) {
    const bed = g.objsWith(lot, 'petbed')[0];
    const c = bed ? nearCell(g, bed) : null;
    if (bed && c) {
      const [bx, bz] = g.world.centerOf(bed);
      if (walkTo(g, p, c[0], c[1], bed.l)) {
        p.act = { kind: 'sleep', t: 90, obj: bed.id };
        p.rt.path!.push({ x: bx, z: bz, l: bed.l });
        return;
      }
    }
    p.act = { kind: 'sleep', t: 60 };
    p.rt.path = null;
    return;
  }
  if (n.fun < 45 || g.rng.chance(0.25)) {
    const toy = g.objsWith(lot, 'pettoy')[0];
    const c = toy ? nearCell(g, toy) : null;
    if (toy && c && g.rng.chance(0.6) && walkTo(g, p, c[0], c[1], toy.l)) {
      p.act = { kind: 'play', t: 10, obj: toy.id };
      return;
    }
  }
  if (n.social < 45 || (p.kind === 'dog' && g.rng.chance(0.3))) {
    const o = g.rng.pick(owners(g, p).length ? owners(g, p) : [null]);
    if (o) {
      p.act = { kind: 'follow', t: 12, follow: o.id };
      return;
    }
  }
  // umherstreifen
  const lt = g.world.lotAt(p.x, p.z);
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(p.x + g.rng.range(-6, 6)),
      z = Math.floor(p.z + g.rng.range(-6, 6));
    if (lt && (x < lt.x || z < lt.z || x >= lt.x + lt.w || z >= lt.z + lt.d)) continue;
    if (!g.world.cellWalkable(p.l, x, z)) continue;
    if (walkTo(g, p, x + 0.5, z + 0.5, p.l)) {
      p.act = { kind: 'walk', t: 2 };
      return;
    }
  }
  p.act = { kind: 'idle', t: g.rng.range(3, 8) };
}

export function tickPet(g: Game, p: Pet, dt: number): void {
  const n = p.needs;
  const sleeping = p.act.kind === 'sleep' && (!p.rt.path || p.rt.pathI >= p.rt.path.length);
  n.hunger = Math.max(0, n.hunger - 0.05 * dt);
  n.fun = Math.max(0, n.fun - 0.05 * dt);
  n.social = Math.max(0, n.social - 0.04 * dt);
  n.energy = sleeping ? Math.min(100, n.energy + 0.25 * dt) : Math.max(0, n.energy - 0.04 * dt);
  const walking = !!p.rt.path && p.rt.pathI < p.rt.path.length;
  if (walking) {
    const fast = p.act.kind === 'follow' || p.act.kind === 'beg' || p.act.kind === 'play';
    moveAlong(p, dt, PET_SPEED * (fast ? 1.4 : 1));
    p.rt.anim = fast ? 'run' : 'walk';
    return;
  }
  p.rt.path = null;
  p.act.t -= dt;
  switch (p.act.kind) {
    case 'eat': {
      p.rt.anim = 'eat';
      const bowl = p.act.obj ? g.world.objs.get(p.act.obj) : undefined;
      if (bowl && (bowl.st?.filled ?? 0) > 0) {
        n.hunger = Math.min(100, n.hunger + 8 * dt);
        if (n.hunger >= 98 || p.act.t <= 0) {
          bowl.st = { ...(bowl.st ?? {}), filled: Math.max(0, (bowl.st?.filled ?? 1) - 1) };
          g.world.touch(bowl.lot);
          p.act.t = 0;
        }
      } else p.act.t = 0;
      break;
    }
    case 'sleep':
      p.rt.anim = 'sleep';
      if (n.energy >= 99) p.act.t = 0;
      break;
    case 'play':
      p.rt.anim = 'play';
      n.fun = Math.min(100, n.fun + 3 * dt);
      break;
    case 'follow': {
      const o = g.sim(p.act.follow);
      if (!o || o.away || o.trip || o.l !== p.l) {
        p.act.t = 0;
        break;
      }
      const d = Math.hypot(o.x - p.x, o.z - p.z);
      if (d > 2.2) walkTo(g, p, o.x + Math.sin(o.rot + 2) * 0.9, o.z + Math.cos(o.rot + 2) * 0.9, o.l);
      else {
        p.rt.anim = p.kind === 'dog' ? 'sit' : 'idle';
        p.rot = Math.atan2(o.x - p.x, o.z - p.z);
        n.social = Math.min(100, n.social + 0.6 * dt);
      }
      break;
    }
    case 'beg':
      p.rt.anim = p.kind === 'dog' ? 'beg' : 'idle';
      break;
    case 'pet':
      p.rt.anim = 'pet';
      break;
    default:
      p.rt.anim = 'idle';
  }
  if (p.act.t <= 0) choose(g, p);
}

/** Haustier auf seinem Grundstück? (sonst abstrakt) */
export function petLive(g: Game, p: Pet): boolean {
  const lot = petLot(g, p);
  return !!lot && g.hhs.get(p.hh)?.id === g.activeHh && g.world.lotAt(p.x, p.z)?.id === lot;
}

// ---------- Interaktionen mit Haustieren ----------
function stopPet(p: Pet, kind: Pet['act']['kind'], t: number, follow?: string): void {
  p.rt.path = null;
  p.act = { kind, t, follow };
}
def({
  id: 'petPet', label: (c) => (c.p?.kind === 'cat' ? 'Kraulen' : 'Streicheln'), icon: '🤚', on: 'pet', ages: ['toddler', ...ADULTS], group: 'Haustier',
  adv: { social: 18, fun: 10 }, advFn: (c: QCtx) => (c.p && c.p.needs.social < 50 ? 15 : 0), avail: (c) => (c.p ? true : false),
  dur: 6, anim: 'pet',
  start: (c) => {
    if (c.p) stopPet(c.p, 'pet', 6);
  },
  done: (c) => {
    const p = c.p!;
    p.needs.social = Math.min(100, p.needs.social + 30);
    p.rt.bubble = { icon: '💗', until: c.g.clock.min + 4 };
    c.g.addMood(c.s, 'petlove');
    c.g.addNeed(c.s, 'social', 8);
  },
  goal: 'petPet',
});
def({
  id: 'petPlay', label: (c) => (c.p?.kind === 'cat' ? 'Mit der Federangel spielen' : 'Stöckchen werfen'), icon: '🎾', on: 'pet', ages: ADULTS.slice(), group: 'Haustier',
  adv: { fun: 35 }, advFn: (c: QCtx) => (c.p && c.p.needs.fun < 50 ? 18 : 0), avail: (c) => (c.p ? (c.p.needs.energy < 15 ? `${c.p.name} ist zu müde` : true) : false),
  dur: 15, anim: 'play', rate: { fun: 1.4, energy: -0.2 },
  start: (c) => {
    if (c.p) stopPet(c.p, 'play', 15);
  },
  done: (c) => {
    const p = c.p!;
    p.needs.fun = Math.min(100, p.needs.fun + 50);
    p.needs.energy = Math.max(0, p.needs.energy - 10);
    c.g.addMood(c.s, 'petlove');
    c.g.addSkill(c.s, 'fitness', 8);
  },
  goal: 'petPlay',
});
def({
  id: 'petWalk', label: 'Gassi gehen', icon: '🦮', on: 'pet', ages: ['teen', 'youngadult', 'adult', 'senior'], group: 'Haustier',
  adv: { fun: 25, social: 5 }, advFn: (c: QCtx) => (c.p?.kind === 'dog' ? 10 : -100), avail: (c) => (c.p?.kind === 'dog' ? true : false),
  route: (c) => {
    // eine Runde vor dem Haus
    const lot = c.g.world.lotAt(c.s.x, c.s.z);
    if (!lot) return null;
    const any: { x: number; z: number; l: number }[] = [];
    for (let i = 0; i < 10 && any.length < 4; i++) {
      const x = lot.x + c.g.rng.int(1, lot.w - 2),
        z = lot.z + c.g.rng.int(1, lot.d - 2);
      if (c.g.world.cellWalkable(0, x, z) && !c.g.world.floors.has(cellKey(0, x, z))) any.push({ x: x + 0.5, z: z + 0.5, l: 0 });
    }
    return any.length ? { x: any[0]!.x, z: any[0]!.z, l: 0, any } : null;
  },
  dur: 25, anim: 'walk',
  start: (c) => {
    if (c.p) stopPet(c.p, 'follow', 30, c.s.id);
  },
  tick: (c, dt) => {
    // langsam im Kreis spazieren
    const a = c.a.t * 0.5;
    const nx = c.s.x + Math.sin(a) * dt * 0.8,
      nz = c.s.z + Math.cos(a) * dt * 0.8;
    if (c.g.world.cellWalkable(c.s.l, Math.floor(nx), Math.floor(nz))) {
      c.s.x = nx;
      c.s.z = nz;
      c.s.rot = a;
    }
  },
  rate: { fun: 1, comfort: -0.1 },
  done: (c) => {
    const p = c.p!;
    p.needs.fun = Math.min(100, p.needs.fun + 40);
    p.needs.social = Math.min(100, p.needs.social + 30);
    c.g.addSkill(c.s, 'fitness', 15);
    c.g.addMood(c.s, 'inspiredwalk');
  },
  goal: 'petWalk',
});
def({
  id: 'petTreat', label: 'Leckerli geben', icon: '🦴', on: 'pet', ages: ADULTS.slice(), group: 'Haustier', auto: false,
  avail: (c) => (c.p ? true : false), dur: 3, anim: 'pet',
  start: (c) => {
    if (c.s.hh && !c.g.money(c.s.hh, -2, 'Leckerli')) return 'Nicht genug Geld';
    if (c.p) stopPet(c.p, 'pet', 3);
  },
  done: (c) => {
    c.p!.needs.hunger = Math.min(100, c.p!.needs.hunger + 15);
    c.p!.needs.social = Math.min(100, c.p!.needs.social + 10);
  },
  goal: 'petFeed',
});

export function installPets(g: Game): void {
  g.systems.push({
    name: 'pets',
    tick: (g2, dt) => {
      for (const p of g2.pets.values()) {
        if (!petLive(g2, p)) {
          // abstrakt: Bedürfnisse pendeln sich ein
          p.rt.spawned = false;
          continue;
        }
        p.rt.spawned = true;
        tickPet(g2, p, dt);
      }
    },
    hourly: (g2) => {
      for (const p of g2.pets.values()) {
        if (p.hh !== g2.activeHh) continue;
        if (p.needs.hunger < 15) {
          p.needs.hunger = 30; // Nachbarn helfen aus – Tiere leiden nie dauerhaft
          g2.notify(`${p.name} hat großen Hunger! Bitte den Napf füllen.`, p.kind === 'dog' ? '🐶' : '🐱', undefined, 'warn');
        }
      }
    },
  });
}
