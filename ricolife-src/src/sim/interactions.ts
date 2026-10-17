// Objekt- und Alltagsinteraktionen. Jede Interaktion läuft real ab: hinlaufen, Platz einnehmen, Animation, Wirkung.
import { RECIPES } from '../data/moodlets';
import type { AgeStage, RecipeDef, SkillId } from '../data/types';
import { getDef } from '../world/defs';
import { cellKey, type ObjInst } from '../world/world';
import { lotEntrance } from '../world/map';
import { lotById } from '../data/lots';
import { def, type Ctx, type RouteTarget } from './interact';
import { objFront } from './actions';
import { nextActionUid, type Game } from './game';
import type { Sim } from './types';

/** wirksame Jahreszeit (feste Jahreszeit aus den Einstellungen hat Vorrang) */
const seasonOf = (g: Game) => g.settings.fixedSeason || g.clock.season;

const ADULTS: AgeStage[] = ['teen', 'youngadult', 'adult', 'senior'];
const GROWN: AgeStage[] = ['youngadult', 'adult', 'senior'];
const WALKERS: AgeStage[] = ['child', 'teen', 'youngadult', 'adult', 'senior'];
const KIDS: AgeStage[] = ['toddler', 'child'];

export const recipeById = (id: string | undefined): RecipeDef => RECIPES.find((r) => r.id === id) ?? RECIPES[0]!;
export function recipesFor(g: Game, s: Sim): RecipeDef[] {
  const lv = g.skillLv(s, 'cooking');
  return RECIPES.filter((r) => r.skill <= lv);
}

function lotHh(g: Game, lot: string) {
  for (const h of g.hhs.values()) if (h.lot === lot) return h;
  return undefined;
}
/** Besitzt der Haushalt der Figur dieses Lot (oder ist es öffentlich / ein Besuch)? */
export function mayUse(g: Game, s: Sim, o: ObjInst): boolean {
  const lot = lotById(o.lot);
  if (!lot) return true;
  if (lot.kind !== 'home') {
    const staff = !!(s.career && s.career.onSite);
    if (lot.open && !isOpen(g, lot.open) && !staff) return false;
    // Küchen in Lokalen gehören dem Personal (sonst gäbe es Gratis-Essen)
    if (!staff && getDef(o.def).func?.includes('fridge')) return false;
    return true;
  }
  const h = lotHh(g, o.lot);
  if (!h) return s.visit?.lot === o.lot || !s.npc;
  return s.hh === h.id || s.visit?.lot === o.lot;
}
export function isOpen(g: Game, open: [number, number]): boolean {
  const h = g.clock.hour;
  const [a, b] = open;
  return b > 24 ? h >= a || h < b - 24 : h >= a && h < b;
}
function payPublic(g: Game, s: Sim, o: ObjInst | undefined, amount: number, label: string): string | void {
  if (!o) return;
  const lot = lotById(o.lot);
  if (!lot || lot.kind === 'home' || !s.hh) return;
  if (!g.money(s.hh, -amount, label)) return 'Nicht genug RicoTaler';
}
function maybeBreak(g: Game, o: ObjInst | undefined, p: number): void {
  if (!o || !getDef(o.def).breaks) return;
  if (g.rng.chance(p)) {
    o.st = { ...(o.st ?? {}), broken: true };
    g.world.touch(o.lot);
    const owner = lotHh(g, o.lot);
    if (owner && owner.id === g.activeHh) g.notify(`${getDef(o.def).name} ist kaputtgegangen!`, '🔧', undefined, 'warn');
  }
}
const isOutdoor = (g: Game, s: Sim): boolean => s.l === 0 && !g.world.floors.has(cellKey(0, Math.floor(s.x), Math.floor(s.z)));

/** Sitzplatz in der Nähe finden (für Essen, Lesen, Fernsehen) */
export function findSeat(g: Game, s: Sim, near: { x: number; z: number; l: number }, maxDist: number, prefer?: (o: ObjInst, slot: number) => number): RouteTarget | null {
  let best: { t: RouteTarget; sc: number } | null = null;
  const lot = g.world.lotAt(near.x, near.z)?.id;
  for (const o of g.world.objs.values()) {
    if (o.l !== near.l || (lot && o.lot !== lot)) continue;
    const d = getDef(o.def);
    if (!d.func?.some((f) => f === 'seat' || f === 'sofa' || f === 'bench') || !d.slots) continue;
    if (!mayUse(g, s, o) || o.st?.broken) continue;
    const [cx, cz] = g.world.centerOf(o);
    const dist = Math.hypot(cx - near.x, cz - near.z);
    if (dist > maxDist) continue;
    for (let i = 0; i < d.slots.length; i++) {
      if (d.slots[i]!.kind !== 'sit' || g.isReserved(o, i, s.id) || !g.world.slotFree(o, i)) continue;
      const occupied = [...g.sims.values()].some((x) => x !== s && x.queue[0]?.obj === o.id && x.queue[0]?.slot === i && x.queue[0]?.phase !== 'queued');
      if (occupied) continue;
      const w = g.world.slotWorld(o, i)!;
      const sc = -dist + (prefer ? prefer(o, i) : 0) + (d.comfort ?? 3) * 0.3;
      if (!best || sc > best.sc) {
        const [fx, fz] = [Math.sin(w.yaw), Math.cos(w.yaw)];
        let ax = w.x + fx * 0.9,
          az = w.z + fz * 0.9;
        if (!g.world.cellWalkable(o.l, Math.floor(ax), Math.floor(az))) {
          const f = g.world.seatAccess(o) ?? objFront(g, o);
          ax = f[0];
          az = f[1];
          if (!g.world.cellWalkable(o.l, Math.floor(ax), Math.floor(az))) continue;
        }
        best = { t: { x: ax, z: az, l: o.l, yaw: w.yaw, y: w.y, obj: o, slot: i }, sc };
      }
    }
  }
  return best?.t ?? null;
}
/** Bonus für Sitze direkt an einem Tisch */
function atTable(g: Game, o: ObjInst, slot: number): number {
  const w = g.world.slotWorld(o, slot)!;
  const fx = Math.floor(w.x + Math.sin(w.yaw) * 0.8),
    fz = Math.floor(w.z + Math.cos(w.yaw) * 0.8);
  const t = g.world.occ.get(cellKey(o.l, fx, fz));
  return t && getDef(g.world.objs.get(t)!.def).func?.some((f) => f === 'table' || f === 'desk') ? 6 : 0;
}

function insertNext(_g: Game, s: Sim, id: string, c: Ctx, extra: Partial<import('./types').Action> = {}): void {
  const a = { uid: nextActionUid(), def: id, phase: 'queued' as const, t: 0, dur: 0, user: c.a.user, ...extra };
  const i = s.queue.indexOf(c.a);
  s.queue.splice(i + 1, 0, a);
}

// ======================= Küche & Essen =======================
def({
  id: 'cook', label: (c) => `Kochen: ${recipeById(String(c.a?.data?.recipe ?? '')).name}`, icon: '🍳', on: 'obj', func: ['fridge'], ages: ADULTS, slot: 'use', group: 'Küche',
  adv: { hunger: 70 }, advFn: (c) => (c.g.hasTrait(c.s, 'foodie') ? 15 : 0),
  avail: (c) => {
    if (c.o && !mayUse(c.g, c.s, c.o)) return false;
    const stove = c.g.objsWith(c.o?.lot ?? null, 'stove').concat(c.g.objsWith(c.o?.lot ?? null, 'oven')).filter((x) => !x.st?.broken);
    if (!stove.length) return 'Kein funktionierender Herd';
    return true;
  },
  dur: 2, anim: 'fridge', goal: 'cookStart',
  start: (c) => {
    const rs = recipesFor(c.g, c.s);
    let r = recipeById(String(c.a.data?.recipe ?? ''));
    if (!c.a.data?.recipe || !rs.includes(r)) {
      // Autonomie: bestes erreichbares Gericht
      r = rs.filter((x) => x.hunger >= 40).sort((a, b) => b.skill - a.skill)[0] ?? rs[0]!;
      c.a.data = { ...(c.a.data ?? {}), recipe: r.id };
    }
    const own = c.o && lotHh(c.g, c.o.lot)?.id === c.s.hh;
    if (own && c.s.hh && !c.g.money(c.s.hh, -r.cost, `Zutaten: ${r.name}`)) return 'Nicht genug Geld für Zutaten';
  },
  done: (c) => {
    const stoves = c.g.objsWith(c.o!.lot, 'stove').concat(c.g.objsWith(c.o!.lot, 'oven')).filter((x) => !x.st?.broken && x.l === c.o!.l);
    const st = stoves.sort((a, b) => Math.hypot(...sub(c.g.world.centerOf(a), [c.s.x, c.s.z])) - Math.hypot(...sub(c.g.world.centerOf(b), [c.s.x, c.s.z])))[0];
    if (st) insertNext(c.g, c.s, 'cookStove', c, { obj: st.id, data: { recipe: String(c.a.data?.recipe ?? 'toast') } });
  },
});
const sub = (a: [number, number], b: [number, number]): [number, number] => [a[0] - b[0], a[1] - b[1]];

def({
  id: 'cookStove', label: 'Am Herd kochen', icon: '🍲', on: 'obj', func: ['stove', 'oven'], ages: ADULTS, slot: 'use', hidden: true, power: true,
  dur: (c) => Math.max(6, recipeById(String(c.a.data?.recipe)).minutes * (1 - c.g.skillLv(c.s, 'cooking') * 0.04)),
  anim: 'cook', skill: 'cooking', xp: 1.4, rate: { fun: 0.15 }, goal: 'cook',
  done: (c) => {
    const r = recipeById(String(c.a.data?.recipe));
    const lv = c.g.skillLv(c.s, 'cooking');
    const burn = Math.max(0, 0.22 - lv * 0.05 - (c.s.emo === 'focused' ? 0.05 : 0));
    const burnt = c.g.rng.chance(burn);
    const quality = burnt ? 0 : Math.min(5, 1 + Math.floor(lv / 2) + (c.g.hasTrait(c.s, 'perfectionist') ? 1 : 0) + (c.s.emo === 'inspired' ? 1 : 0));
    const meal = c.g.spawnProp('prop-meal', c.o!.lot, c.o!.l, { x: c.s.x, z: c.s.z }, { servings: r.servings, recipe: r.id, quality, until: c.g.clock.min + 60 * 30 });
    if (burnt) {
      c.g.addMood(c.s, 'burntfood');
      c.g.bubble(c.s, '💨');
    }
    maybeBreak(c.g, c.o, 0.015);
    if (meal) insertNext(c.g, c.s, 'eat', c, { obj: meal.id });
    else c.g.notify(`${c.s.first} findet keine freie Ablage für das Essen.`, '🍽️', c.s.id, 'warn');
  },
});

def({
  id: 'snack', label: 'Snack nehmen', icon: '🥪', on: 'obj', func: ['fridge'], ages: WALKERS, slot: 'use', group: 'Küche',
  adv: { hunger: 28 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 7, anim: 'eatStand', rate: { hunger: 3.6 },
  start: (c) => {
    const own = c.o && lotHh(c.g, c.o.lot)?.id === c.s.hh;
    if (own && c.s.hh && !c.g.money(c.s.hh, -3, 'Snack')) return 'Kein Geld für einen Snack';
  },
  goal: 'eat',
});

def({
  id: 'microwave', label: 'Fertiggericht aufwärmen', icon: '🍱', on: 'obj', func: ['microwave'], ages: WALKERS, slot: 'near', group: 'Küche', power: true,
  adv: { hunger: 45 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 4, anim: 'cook',
  start: (c) => {
    if (c.s.hh && lotHh(c.g, c.o!.lot)?.id === c.s.hh && !c.g.money(c.s.hh, -6, 'Fertiggericht')) return 'Nicht genug Geld';
  },
  done: (c) => {
    const meal = c.g.spawnProp('prop-meal', c.o!.lot, c.o!.l, { x: c.s.x, z: c.s.z }, { servings: 1, recipe: 'toast', quality: 1, until: c.g.clock.min + 600 });
    if (meal) insertNext(c.g, c.s, 'eat', c, { obj: meal.id });
  },
});

def({
  id: 'eat', label: (c) => `Essen: ${recipeById(c.o?.st?.recipe).name}`, icon: '🍽️', on: 'obj', func: undefined, ages: ['toddler', ...WALKERS], slot: 'near', group: 'Küche',
  adv: { hunger: 85 }, avail: (c) => (c.o?.def === 'prop-meal' && (c.o.st?.servings ?? 0) > 0 ? (mayUse(c.g, c.s, c.o) ? true : false) : false),
  dur: 0.6, anim: 'carry',
  start: (c) => {
    const o = c.o;
    if (!o || (o.st?.servings ?? 0) <= 0) return 'Schon aufgegessen';
    o.st!.servings!--;
    const r = recipeById(o.st?.recipe),
      q = o.st?.quality ?? 1;
    if (o.st!.servings! <= 0) c.g.removeObject(o.id);
    c.s.rt.holding = 'plate';
    c.a.data = { ...(c.a.data ?? {}), recipe: r.id, quality: q };
  },
  done: (c) => insertNext(c.g, c.s, 'eatSeat', c, { data: { recipe: String(c.a.data?.recipe), quality: Number(c.a.data?.quality ?? 1) } }),
});

def({
  id: 'eatSeat', label: 'Essen', icon: '🍽️', on: 'self', hidden: true, ages: ['toddler', ...WALKERS],
  route: (c) => {
    const seat = findSeat(c.g, c.s, { x: c.s.x, z: c.s.z, l: c.s.l }, 10, (o, i) => atTable(c.g, o, i) + (getDef(o.def).func?.includes('sofa') ? 1 : 0));
    return seat ?? null;
  },
  dur: 16, anim: (c) => (c.s.rt.y > 0.1 ? 'eat' : 'eatStand'), prop: 'plate',
  tick: (c, dt) => c.g.addNeed(c.s, 'hunger', (recipeById(String(c.a.data?.recipe)).hunger / 16) * dt),
  rate: { comfort: 0.5 },
  done: (c) => {
    const r = recipeById(String(c.a.data?.recipe));
    const q = Number(c.a.data?.quality ?? 1);
    if (q >= 4) c.g.addMood(c.s, 'bestmeal');
    else if (q >= 2) c.g.addMood(c.s, 'fullbelly');
    if (r.moodlet && q > 0) c.g.addMood(c.s, r.moodlet);
    if (c.s.favFood && r.name.toLowerCase().includes(c.s.favFood.toLowerCase().split(' ')[0] ?? '~')) c.g.addMood(c.s, 'bestmeal', { src: 'Lieblingsessen' });
    // Geschirr abstellen
    const lot = c.g.lotOf(c.s);
    if (lot) {
      const fx = c.s.x + Math.sin(c.s.rot) * 0.8,
        fz = c.s.z + Math.cos(c.s.rot) * 0.8;
      c.g.spawnProp('prop-dirty', lot, c.s.l, { x: fx, z: fz }, {});
    }
  },
  end: (c) => {
    c.s.rt.holding = null;
  },
  goal: 'eat',
});

def({
  id: 'washDishes', label: 'Geschirr spülen', icon: '🧽', on: 'obj', ages: ADULTS, slot: 'near', group: 'Haushalt',
  adv: { fun: 4 }, advFn: (c) => (c.g.hasTrait(c.s, 'neat') ? 45 : c.g.hasTrait(c.s, 'messy') ? -10 : 14),
  avail: (c) => (c.o?.def === 'prop-dirty' && mayUse(c.g, c.s, c.o) ? true : false),
  dur: 0.6, anim: 'carry',
  start: (c) => {
    c.g.removeObject(c.o!.id);
    c.s.rt.holding = 'dirty';
  },
  done: (c) => {
    const lot = c.g.lotOf(c.s);
    const sinks = c.g.objsWith(lot, 'dishwasher').concat(c.g.objsWith(lot, 'sink')).filter((o) => !o.st?.broken && o.l === c.s.l);
    const sk = sinks.sort((a, b) => Math.hypot(...sub(c.g.world.centerOf(a), [c.s.x, c.s.z])) - Math.hypot(...sub(c.g.world.centerOf(b), [c.s.x, c.s.z])))[0];
    if (sk) insertNext(c.g, c.s, 'washAtSink', c, { obj: sk.id });
    else c.s.rt.holding = null;
  },
});
def({
  id: 'washAtSink', label: 'Abwaschen', icon: '🧽', on: 'obj', func: ['sink', 'dishwasher'], ages: ADULTS, slot: 'use', hidden: true,
  dur: (c) => (getDef(c.o!.def).func?.includes('dishwasher') ? 2 : 6), anim: 'wash', rate: { hygiene: -0.3 }, prop: 'dirty', goal: 'washDishes',
  done: (c) => {
    if (c.g.hasTrait(c.s, 'neat')) c.g.addMood(c.s, 'proud', { hours: 2 });
    maybeBreak(c.g, c.o, 0.01);
  },
  end: (c) => {
    c.s.rt.holding = null;
  },
});

def({
  id: 'drinkCoffee', label: 'Kaffee trinken', icon: '☕', on: 'obj', func: ['coffee', 'espresso'], ages: ['teen', ...GROWN], slot: 'near', group: 'Küche', power: true,
  adv: { energy: 22, fun: 6 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : c.s.career?.onSite && c.o && getDef(c.o.def).func?.includes('espresso') ? false : true),
  dur: 7, anim: 'drink', rate: { energy: 1.8, fun: 0.5, bladder: -1 }, prop: 'cup',
  start: (c) => payPublic(c.g, c.s, c.o, 4, 'Kaffee im Café'),
  goal: 'drinkCoffee',
});

// ======================= Bad =======================
def({
  id: 'toilet', label: 'Toilette benutzen', icon: '🚽', on: 'obj', func: ['toilet'], ages: WALKERS, slot: 'sit', group: 'Bad', busy: true,
  adv: { bladder: 100 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 6, until: 'bladder', anim: 'toilet', rate: { bladder: 22, hygiene: -0.4 },
  done: (c) => {
    maybeBreak(c.g, c.o, 0.012);
    if (c.g.hasTrait(c.s, 'neat') || c.g.rng.chance(0.6)) {
      const sink = c.g.objsWith(c.o!.lot, 'sink').find((x) => x.l === c.o!.l && !x.st?.broken && Math.hypot(...sub(c.g.world.centerOf(x), c.g.world.centerOf(c.o!))) < 6);
      if (sink) insertNext(c.g, c.s, 'washHands', c, { obj: sink.id });
    }
  },
});
def({
  id: 'washHands', label: 'Hände waschen', icon: '🫧', on: 'obj', func: ['sink'], ages: WALKERS, slot: 'use', group: 'Bad',
  adv: { hygiene: 10 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 2, anim: 'wash', rate: { hygiene: 4 },
});
def({
  id: 'brushTeeth', label: 'Zähne putzen', icon: '🪥', on: 'obj', func: ['sink'], ages: WALKERS, slot: 'use', group: 'Bad',
  adv: { hygiene: 14 }, advFn: (c) => (c.g.clock.hour >= 20 || c.g.clock.hour < 9 ? 10 : 0),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 3, anim: 'wash', rate: { hygiene: 5 },
});
def({
  id: 'shower', label: 'Duschen', icon: '🚿', on: 'obj', func: ['shower'], ages: WALKERS, slot: 'use', group: 'Bad', busy: true, outfit: 'swim',
  adv: { hygiene: 90 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 14, until: 'hygiene', anim: 'shower', rate: { hygiene: 8, comfort: 0.5, energy: 0.1 },
  done: (c) => {
    c.g.addMood(c.s, 'refreshed');
    c.g.removeMood(c.s, 'stinky');
    maybeBreak(c.g, c.o, 0.012);
  },
  goal: 'shower',
});
def({
  id: 'bath', label: 'Ein Bad nehmen', icon: '🛁', on: 'obj', func: ['bathtub'], ages: WALKERS, slot: 'sit', group: 'Bad', busy: true, outfit: 'swim',
  adv: { hygiene: 80, comfort: 35, fun: 15 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 30, anim: 'bath', rate: { hygiene: 3.5, comfort: 2, fun: 0.6 },
  done: (c) => {
    c.g.addMood(c.s, 'refreshed');
    c.g.addMood(c.s, 'calm');
  },
  goal: 'shower',
});

// ======================= Schlafen & Ausruhen =======================
function alarmMinute(g: Game, s: Sim): number | null {
  // Wecker: vor Schicht oder Schule (60–90 min vorher)
  const day = g.clock.day + (g.clock.hour > 12 ? 1 : 0);
  const wd = day % 7;
  if (s.career) {
    const lv = careerLevel(s);
    if (lv && lv.days.includes(wd) && s.career.offDay !== day) return day * 1440 + lv.start * 60 - 80;
  }
  if (s.school && wd < 5) return day * 1440 + 8 * 60 - 70;
  return null;
}
import { CAREERS } from '../data/careers';
export function careerLevel(s: Sim) {
  const c = s.career ? CAREERS.find((x) => x.id === s.career!.id) : undefined;
  return c?.levels[Math.min(s.career!.level, c.levels.length - 1)];
}

def({
  id: 'sleep', label: 'Schlafen', icon: '😴', on: 'obj', func: ['bed', 'crib'], slot: 'sleep', group: 'Ruhen', busy: true, outfit: 'sleep',
  ages: ['baby', 'toddler', ...WALKERS],
  adv: { energy: 100 },
  avail: (c) => {
    if (c.o && !mayUse(c.g, c.s, c.o)) return false;
    const isCrib = getDef(c.o!.def).func?.includes('crib');
    if (isCrib !== (c.s.age === 'baby' || c.s.age === 'toddler')) return false;
    if (c.s.needs.energy > 92) return 'Nicht müde';
    return true;
  },
  dur: 14 * 60, until: 'energy', anim: 'sleep', rate: { energy: 0.21, comfort: 0.3, hunger: 0.03, hygiene: 0.02 },
  tick: (c) => {
    const al = alarmMinute(c.g, c.s);
    if (al !== null && c.g.clock.min >= al && c.g.clock.min < al + 30 && c.s.needs.energy > 45) {
      c.a.phase = 'perform';
      c.a.t = c.a.dur;
      c.g.bubble(c.s, '⏰');
    }
  },
  done: (c) => {
    if (c.s.needs.energy > 90) c.g.addMood(c.s, 'wellrested');
    c.g.removeMood(c.s, 'sleepy');
    c.g.removeMood(c.s, 'exhausted');
  },
  goal: 'sleep',
});
def({
  id: 'nap', label: 'Nickerchen', icon: '💤', on: 'obj', func: ['bed', 'sofa'], ages: WALKERS, slot: 'any', group: 'Ruhen', busy: true,
  adv: { energy: 40, comfort: 20 }, advFn: (c) => (c.g.hasTrait(c.s, 'lazy') ? 10 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : c.s.needs.energy > 85 ? 'Nicht müde' : true),
  dur: 90, anim: (c) => (c.s.rt.y > 0.3 ? 'sleep' : 'sleep'), rate: { energy: 0.2, comfort: 0.6 },
});
def({
  id: 'sit', label: 'Hinsetzen', icon: '🪑', on: 'obj', func: ['seat', 'sofa', 'bench'], ages: ['toddler', ...WALKERS], slot: 'sit', group: 'Ruhen',
  adv: { comfort: 30 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 30, anim: 'sit', rate: { comfort: 2, energy: 0.05 },
});
def({
  id: 'relax', label: 'Entspannen', icon: '🛋️', on: 'obj', func: ['sofa'], ages: WALKERS, slot: 'sit', group: 'Ruhen',
  adv: { comfort: 40, fun: 15, energy: 8 }, advFn: (c) => (c.g.hasTrait(c.s, 'lazy') ? 15 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 45, anim: 'sit', rate: { comfort: 2.2, fun: 0.5, energy: 0.12 },
});
def({
  id: 'sitBench', label: 'Auf der Bank sitzen', icon: '🌳', on: 'obj', func: ['bench'], ages: WALKERS, slot: 'sit', group: 'Ruhen',
  adv: { comfort: 25, fun: 10 }, advFn: (c) => (c.g.hasTrait(c.s, 'outdoorsy') ? 12 : 0),
  dur: 35, anim: 'sit', rate: { comfort: 1.5, fun: 0.6 },
  done: (c) => {
    if (isOutdoor(c.g, c.s) && c.g.weather.now === 'sunny') c.g.addMood(c.s, 'sunshine');
  },
});

// ======================= Unterhaltung =======================
const TV_CH: Record<string, { name: string; skill?: SkillId; fun: number }> = {
  comedy: { name: 'Komödie', fun: 2.2 },
  cooking: { name: 'Kochshow', skill: 'cooking', fun: 1.3 },
  sports: { name: 'Sportkanal', skill: 'fitness', fun: 1.4 },
  news: { name: 'Nachrichten', skill: 'logic', fun: 0.9 },
  kids: { name: 'Kinderprogramm', fun: 2 },
  nature: { name: 'Naturdoku', skill: 'gardening', fun: 1.3 },
};
export const TV_CHANNELS = TV_CH;
def({
  id: 'watchTV', label: (c) => `Fernsehen: ${TV_CH[String(c.a?.data?.ch ?? 'comedy')]?.name ?? 'Komödie'}`, icon: '📺', on: 'obj', func: ['tv'], ages: ['toddler', ...WALKERS], group: 'Unterhaltung', power: true,
  adv: { fun: 55, comfort: 12 }, advFn: (c) => (c.g.hasTrait(c.s, 'lazy') ? 18 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  route: (c) => {
    const [tx, tz] = c.g.world.centerOf(c.o!);
    const tyaw = c.o!.r * (Math.PI / 2);
    const seat = findSeat(c.g, c.s, { x: tx, z: tz, l: c.o!.l }, 7, (o, i) => {
      const w = c.g.world.slotWorld(o, i)!;
      const dx = tx - w.x,
        dz = tz - w.z;
      const len = Math.hypot(dx, dz) || 1;
      const dot = (Math.sin(w.yaw) * dx + Math.cos(w.yaw) * dz) / len;
      return dot > 0.6 ? 10 : -50;
    });
    if (seat && seat.obj) {
      const w = c.g.world.slotWorld(seat.obj, seat.slot!)!;
      const dot = (Math.sin(w.yaw) * (tx - w.x) + Math.cos(w.yaw) * (tz - w.z)) / (Math.hypot(tx - w.x, tz - w.z) || 1);
      if (dot > 0.6) return seat;
    }
    const fx = tx + Math.sin(tyaw) * 2.2,
      fz = tz + Math.cos(tyaw) * 2.2;
    return { x: fx, z: fz, l: c.o!.l, yaw: tyaw + Math.PI };
  },
  start: (c) => {
    if (!c.a.data?.ch) {
      const ch = c.s.age === 'child' || c.s.age === 'toddler' ? 'kids' : c.g.rng.pick(['comedy', 'cooking', 'sports', 'news', 'nature']);
      c.a.data = { ...(c.a.data ?? {}), ch };
    }
  },
  dur: 60, anim: (c) => (c.s.rt.y > 0.1 ? 'tv' : 'idle'),
  tick: (c, dt) => {
    const ch = TV_CH[String(c.a.data?.ch)] ?? TV_CH.comedy!;
    c.g.addNeed(c.s, 'fun', ch.fun * dt);
    if (c.s.rt.y > 0.1) c.g.addNeed(c.s, 'comfort', 1.2 * dt);
    if (ch.skill) c.g.addSkill(c.s, ch.skill, 0.35 * dt);
  },
  done: (c) => {
    c.g.addMood(c.s, 'tvfun');
    maybeBreak(c.g, c.o, 0.008);
  },
  goal: 'watchTV',
});

def({
  id: 'playGames', label: 'Computerspiele spielen', icon: '🎮', on: 'obj', func: ['computer'], ages: ['child', ...ADULTS], slot: 'sit', group: 'Computer', power: true,
  adv: { fun: 60 }, advFn: (c) => (c.g.hasTrait(c.s, 'geek') ? 25 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 60, anim: 'type', rate: { fun: 2, comfort: 0.6, energy: -0.05 }, skill: 'programming', xp: 0.15,
  done: (c) => {
    if (c.g.rng.chance(0.4)) c.g.addMood(c.s, 'gamewin');
    maybeBreak(c.g, c.o, 0.008);
  },
});
def({
  id: 'browse', label: 'Im Netz chatten', icon: '💬', on: 'obj', func: ['computer'], ages: ['child', ...ADULTS], slot: 'sit', group: 'Computer', power: true,
  adv: { social: 28, fun: 18 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 40, anim: 'type', rate: { social: 1, fun: 0.8 },
});
def({
  id: 'program', label: 'Programmieren üben', icon: '💻', on: 'obj', func: ['computer'], ages: ADULTS, slot: 'sit', group: 'Computer', power: true,
  adv: { fun: 10 }, advFn: (c) => (c.s.hobbies.includes('programming') || c.g.hasTrait(c.s, 'geek') ? 30 : 4), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 60, anim: 'type', skill: 'programming', xp: 1.5, rate: { fun: 0.2, energy: -0.08 }, goal: 'program',
});
def({
  id: 'freelance', label: 'Freiberuflicher Programmierauftrag', icon: '🧾', on: 'obj', func: ['computer'], ages: ADULTS, slot: 'sit', group: 'Computer', power: true,
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : c.g.skillLv(c.s, 'programming') < 2 ? 'Programmieren Stufe 2 nötig' : true),
  dur: 120, anim: 'type', skill: 'programming', xp: 1.2, rate: { fun: -0.2, energy: -0.12 },
  done: (c) => {
    const lv = c.g.skillLv(c.s, 'programming');
    const pay = Math.round(60 * lv * (0.8 + c.g.rng.next() * 0.4));
    c.g.money(c.s.hh, pay, 'Programmierauftrag', `fl:${c.a.uid}:${c.g.clock.day}`);
    c.g.notify(`${c.s.first} hat einen Auftrag abgeschlossen: +${pay} RT`, '💻', c.s.id, 'good');
  },
  goal: 'program',
});
def({
  id: 'writeBook', label: 'An einem Buch schreiben', icon: '✍️', on: 'obj', func: ['computer'], ages: ADULTS, slot: 'sit', group: 'Computer', power: true,
  adv: { fun: 8 }, advFn: (c) => (c.s.hobbies.includes('writing') || c.g.hasTrait(c.s, 'bookworm') ? 28 : 4), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 60, anim: 'type', skill: 'writing', xp: 1.5, rate: { fun: 0.4 },
  tick: (c, dt) => {
    c.s.flags.book = (c.s.flags.book ?? 0) + dt / (300 - c.g.skillLv(c.s, 'writing') * 15);
  },
  done: (c) => {
    if ((c.s.flags.book ?? 0) >= 1) {
      c.s.flags.book = 0;
      c.g.giveItem(c.s, 'manuscript');
      c.g.memory(c.s, 'Ein Manuskript fertig geschrieben', '📜', true);
      c.g.notify(`${c.s.first} hat ein Manuskript fertig! Im Inventar verkaufen.`, '📜', c.s.id, 'good');
    }
  },
  goal: 'writeBook',
});
def({
  id: 'homework', label: 'Hausaufgaben machen', icon: '📓', on: 'obj', func: ['desk', 'computer', 'table'], ages: ['child', 'teen'], slot: 'any', group: 'Lernen',
  adv: { fun: 6 }, advFn: (c) => ((c.s.school?.hw ?? 1) < 1 && c.g.clock.hour > 14 ? 40 : -50),
  avail: (c) => {
    if (c.o && !mayUse(c.g, c.s, c.o)) return false;
    if (!c.s.school) return false;
    if (c.s.school.hw >= 1) return 'Heute schon erledigt';
    return true;
  },
  route: (c) => {
    const d = getDef(c.o!.def);
    if (d.slots?.some((x) => x.kind === 'sit')) return undefined as never;
    const seat = findSeat(c.g, c.s, { x: c.g.world.centerOf(c.o!)[0], z: c.g.world.centerOf(c.o!)[1], l: c.o!.l }, 3, (o, i) => atTable(c.g, o, i));
    return seat ?? { x: objFront(c.g, c.o!)[0], z: objFront(c.g, c.o!)[1], l: c.o!.l };
  },
  dur: 45, anim: (c) => (c.s.rt.y > 0.1 ? 'read' : 'read'), skill: 'logic', xp: 0.9, rate: { fun: -0.3 },
  tick: (c, dt) => {
    if (c.s.school) c.s.school.hw = Math.min(1, c.s.school.hw + dt / 45);
  },
  goal: 'homework',
});

def({
  id: 'listenMusic', label: 'Musik hören', icon: '🎶', on: 'obj', func: ['stereo', 'jukebox'], ages: WALKERS, slot: 'near', group: 'Unterhaltung', power: true,
  adv: { fun: 35 }, advFn: (c) => (c.g.hasTrait(c.s, 'musical') ? 20 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 40, anim: 'listen', rate: { fun: 1.5, comfort: 0.2 }, done: (c) => c.g.addMood(c.s, 'musicjoy'),
});
def({
  id: 'dance', label: 'Tanzen', icon: '💃', on: 'obj', func: ['stereo', 'jukebox', 'dancefloor'], ages: WALKERS, slot: 'near', group: 'Unterhaltung',
  adv: { fun: 50, social: 8 }, advFn: (c) => (c.g.hasTrait(c.s, 'social') ? 10 : 0) + (c.g.hasTrait(c.s, 'shy') ? -20 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  route: (c) => {
    if (getDef(c.o!.def).func?.includes('dancefloor')) {
      const cells = c.g.world.cellsOf(c.o!);
      return { x: 0, z: 0, l: c.o!.l, any: cells.map(([x, z]) => ({ x: x + 0.5, z: z + 0.5, l: c.o!.l })) };
    }
    return undefined as never;
  },
  dur: 35, anim: 'dance', rate: { fun: 2.2, energy: -0.25, hygiene: -0.2, social: 0.4 }, skill: 'fitness', xp: 0.3, goal: 'dance',
  done: (c) => c.g.addMood(c.s, 'partyfun', { hours: 3 }),
});
def({
  id: 'read', label: 'Ein Buch lesen', icon: '📖', on: 'obj', func: ['bookshelf'], ages: WALKERS, slot: 'near', group: 'Lernen',
  adv: { fun: 40 }, advFn: (c) => (c.g.hasTrait(c.s, 'bookworm') ? 30 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 3, anim: 'idle',
  start: (c) => {
    if (!c.a.data?.book) {
      const opts: SkillId[] = ['writing', 'logic', 'cooking', 'gardening', 'charisma', 'handiness', 'fishing', 'painting'];
      c.a.data = { ...(c.a.data ?? {}), book: c.s.hobbies.find((h) => opts.includes(h)) ?? c.g.rng.pick(opts) };
    }
  },
  done: (c) => insertNext(c.g, c.s, 'readSeat', c, { data: { book: String(c.a.data?.book ?? 'writing') } }),
  goal: 'read',
});
def({
  id: 'readSeat', label: 'Lesen', icon: '📖', on: 'self', hidden: true, ages: WALKERS,
  route: (c) => findSeat(c.g, c.s, { x: c.s.x, z: c.s.z, l: c.s.l }, 9) ?? null,
  dur: 50, anim: 'read', prop: 'book', rate: { fun: 1.3 },
  tick: (c, dt) => {
    c.g.addSkill(c.s, String(c.a.data?.book ?? 'writing') as SkillId, 0.6 * dt);
    if (c.s.rt.y > 0.1) c.g.addNeed(c.s, 'comfort', 1 * dt);
  },
  done: (c) => c.g.addMood(c.s, 'readgood'),
});

// ======================= Fitness =======================
def({
  id: 'workout', label: 'Trainieren', icon: '🏋️', on: 'obj', func: ['treadmill', 'weights'], ages: ADULTS, slot: 'any', group: 'Fitness', outfit: 'sport',
  adv: { fun: 10 }, advFn: (c) => (c.g.hasTrait(c.s, 'active') ? 40 : c.g.hasTrait(c.s, 'lazy') ? -30 : c.s.hobbies.includes('fitness') ? 22 : 5),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : c.s.needs.energy < 15 ? 'Zu erschöpft' : true),
  dur: 45, anim: (c) => (getDef(c.o!.def).func?.includes('treadmill') ? 'treadmill' : 'lift'), skill: 'fitness', xp: 1.7,
  tick: (c, dt) => {
    c.g.addNeed(c.s, 'energy', -0.5 * dt);
    c.g.addNeed(c.s, 'hygiene', -0.6 * dt);
    c.g.addNeed(c.s, 'fun', (c.g.hasTrait(c.s, 'active') ? 1 : -0.2) * dt);
  },
  done: (c) => c.g.addMood(c.s, 'workout'),
  goal: 'workout',
});
def({
  id: 'yoga', label: 'Yoga', icon: '🧘', on: 'obj', func: ['yogamat'], ages: ADULTS, slot: 'any', group: 'Fitness', outfit: 'sport',
  adv: { fun: 18, comfort: 10 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  route: (c) => ({ x: c.g.world.centerOf(c.o!)[0], z: c.g.world.centerOf(c.o!)[1], l: c.o!.l, yaw: c.o!.r * (Math.PI / 2) }),
  dur: 30, anim: 'yoga', skill: 'fitness', xp: 0.9, rate: { fun: 0.6, energy: -0.1 },
  done: (c) => {
    c.g.addMood(c.s, 'calm');
    c.s.moods = c.s.moods.filter((m) => !['argument', 'annoyed', 'worried', 'badday'].includes(m.id));
  },
  goal: 'workout',
});
def({
  id: 'punch', label: 'Boxsack bearbeiten', icon: '🥊', on: 'obj', func: ['punchbag'], ages: ADULTS, slot: 'near', group: 'Fitness', outfit: 'sport',
  adv: { fun: 12 }, advFn: (c) => (c.s.emo === 'angry' ? 60 : c.g.hasTrait(c.s, 'hothead') ? 15 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 25, anim: 'punch', skill: 'fitness', xp: 1.3, rate: { energy: -0.4, hygiene: -0.4, fun: 0.6 },
  done: (c) => {
    c.s.moods = c.s.moods.filter((m) => !['argument', 'annoyed', 'insulted'].includes(m.id));
    c.g.addMood(c.s, 'workout');
  },
  goal: 'workout',
});
def({
  id: 'swim', label: 'Schwimmen', icon: '🏊', on: 'obj', func: ['pool'], ages: WALKERS, slot: 'near', group: 'Fitness', outfit: 'swim',
  adv: { fun: 45, hygiene: 10 }, advFn: (c) => (c.g.hasTrait(c.s, 'active') ? 15 : 0) + (seasonOf(c.g) === 'winter' ? -40 : 0),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  route: (c) => {
    const cells = c.g.world.cellsOf(c.o!);
    const mid = cells[Math.floor(cells.length / 2)]!;
    return { x: mid[0] + 0.5, z: mid[1] + 0.5, l: c.o!.l, any: undefined } as RouteTarget;
  },
  dur: 40, anim: 'swim', skill: 'fitness', xp: 1, rate: { fun: 2, hygiene: 0.8, energy: -0.35 }, goal: 'swim',
});
def({
  id: 'pushups', label: 'Liegestütze', icon: '💪', on: 'self', ages: ADULTS, group: 'Ich',
  advFn: (c) => (c.g.hasTrait(c.s, 'active') ? 18 : 0) - 5, dur: 15, anim: 'pushups', skill: 'fitness', xp: 1.1, rate: { energy: -0.4, hygiene: -0.4 },
  goal: 'workout',
});

// ======================= Hobbys & Kreatives =======================
def({
  id: 'paint', label: 'Malen', icon: '🎨', on: 'obj', func: ['easel'], ages: ['child', ...ADULTS], slot: 'any', group: 'Kreativ',
  adv: { fun: 25 }, advFn: (c) => (c.g.hasTrait(c.s, 'creative') ? 30 : 0) + (c.s.hobbies.includes('painting') ? 20 : 0) + (c.s.emo === 'inspired' ? 15 : 0),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 90, anim: 'paint', skill: 'painting', xp: 1.5, rate: { fun: 1 },
  done: (c) => {
    const lv = c.g.skillLv(c.s, 'painting');
    const master = lv >= 5 && (c.s.emo === 'inspired' ? c.g.rng.chance(0.35) : c.g.rng.chance(0.1));
    const value = Math.round((15 + lv * lv * 9) * (master ? 3 : 1) * (0.8 + c.g.rng.next() * 0.4));
    c.g.giveItem(c.s, 'painting');
    c.s.flags.artValue = (c.s.flags.artValue ?? 0) + value;
    if (master) {
      c.g.addMood(c.s, 'masterpiece');
      c.g.memory(c.s, 'Ein Meisterwerk gemalt', '🖼️', true);
    }
    c.g.notify(`${c.s.first} hat ein Bild fertig (Wert ca. ${value} RT).`, '🖼️', c.s.id, 'good');
  },
  goal: 'paint',
});
for (const [id, func, label, icon, anim] of [
  ['playPiano', 'piano', 'Klavier spielen', '🎹', 'piano'],
  ['playGuitar', 'guitar', 'Gitarre spielen', '🎸', 'guitar'],
] as const) {
  def({
    id, label, icon, on: 'obj', func: [func], ages: ['child', ...ADULTS], slot: 'any', group: 'Kreativ',
    adv: { fun: 35 }, advFn: (c) => (c.g.hasTrait(c.s, 'musical') ? 30 : 0) + (c.s.hobbies.includes('music') ? 20 : 0),
    avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
    dur: 45, anim, skill: 'music', xp: 1.5, rate: { fun: 1.6 },
    done: (c) => {
      c.g.addMood(c.s, 'musicjoy');
      const lot = lotById(c.o!.lot);
      const lv = c.g.skillLv(c.s, 'music');
      if (lot && lot.kind !== 'home' && lv >= 3 && c.s.hh) {
        const tips = Math.round(lv * 6 * (0.6 + c.g.rng.next()));
        c.g.money(c.s.hh, tips, 'Trinkgeld fürs Musizieren', `tip:${c.a.uid}`);
        c.g.notify(`${c.s.first} bekommt ${tips} RT Trinkgeld!`, '🎵', c.s.id, 'good');
      }
    },
  });
}
def({
  id: 'chess', label: 'Schach üben', icon: '♟️', on: 'obj', func: ['chess'], ages: ['child', ...ADULTS], slot: 'sit', group: 'Lernen',
  adv: { fun: 25 }, advFn: (c) => (c.g.hasTrait(c.s, 'genius') ? 35 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 45, anim: 'chess', skill: 'logic', xp: 1.3, rate: { fun: 1 },
  done: (c) => {
    if (c.g.rng.chance(0.3 + c.g.skillLv(c.s, 'logic') * 0.05)) c.g.addMood(c.s, 'chesswin');
  },
  goal: 'chess',
});
def({
  id: 'stargaze', label: 'Sterne beobachten', icon: '🔭', on: 'obj', func: ['telescope'], ages: ['child', ...ADULTS], slot: 'any', group: 'Lernen',
  adv: { fun: 30 }, advFn: (c) => (c.g.hasTrait(c.s, 'genius') ? 20 : 0),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : c.g.clock.hour >= 6 && c.g.clock.hour < 20 ? 'Nur nachts' : c.g.weather.now === 'rain' || c.g.weather.now === 'storm' ? 'Zu bewölkt' : true),
  dur: 40, anim: 'telescope', skill: 'logic', xp: 1.1, rate: { fun: 1.4 }, done: (c) => c.g.addMood(c.s, 'stargazing'), goal: 'stargaze',
});
def({
  id: 'photo', label: 'Fotografieren', icon: '📷', on: 'obj', func: ['camera'], ages: ['teen', ...GROWN], slot: 'any', group: 'Kreativ',
  adv: { fun: 20 }, advFn: (c) => (c.s.hobbies.includes('photography') ? 25 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 30, anim: 'photo', skill: 'photography', xp: 1.4, rate: { fun: 1 },
  done: (c) => {
    c.g.giveItem(c.s, 'photo');
    c.s.flags.artValue = (c.s.flags.artValue ?? 0) + 10 + c.g.skillLv(c.s, 'photography') * 12;
  },
  goal: 'photo',
});
def({
  id: 'tinker', label: 'Basteln', icon: '🪚', on: 'obj', func: ['workbench'], ages: ADULTS, slot: 'any', group: 'Kreativ',
  adv: { fun: 20 }, advFn: (c) => (c.s.hobbies.includes('handiness') ? 25 : 0) + (c.g.hasTrait(c.s, 'geek') ? 10 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 60, anim: 'repair', skill: 'handiness', xp: 1.5, rate: { fun: 0.8, hygiene: -0.2 },
  done: (c) => {
    c.g.giveItem(c.s, 'toy');
    c.g.notify(`${c.s.first} hat ein Holzspielzeug gebastelt.`, '🪚', c.s.id, 'good');
  },
  goal: 'tinker',
});
def({
  id: 'mirrorPractice', label: 'Reden üben', icon: '🪞', on: 'obj', func: ['mirror'], ages: ['teen', ...GROWN], slot: 'near', group: 'Ich',
  adv: { fun: 8 }, advFn: (c) => (c.g.hasTrait(c.s, 'ambitious') ? 18 : 0) + (c.s.career?.id === 'medien' ? 15 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 30, anim: 'mirror', skill: 'charisma', xp: 1.4, rate: { fun: 0.3 }, done: (c) => c.g.addMood(c.s, 'proud', { hours: 2 }), goal: 'mirrorPractice',
});
def({
  id: 'changeOutfit', label: 'Outfit wechseln', icon: '👕', on: 'obj', func: ['wardrobe'], ages: ['child', ...ADULTS], slot: 'near', group: 'Ich', auto: false,
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 2, anim: 'stretch', done: (c) => {
    const o = String(c.a.data?.outfit ?? 'everyday');
    c.s.outfit = o as Sim['outfit'];
  },
});
def({
  id: 'editLook', label: 'Aussehen ändern', icon: '✨', on: 'obj', func: ['wardrobe', 'mirror'], ages: ['child', ...ADULTS], slot: 'near', group: 'Ich', auto: false,
  avail: (c) => (c.g.isControllable(c.s) && c.o && mayUse(c.g, c.s, c.o) ? true : false),
  dur: 1, anim: 'mirror',
});

// ======================= Garten =======================
const CROPS: { id: string; item: string; name: string; lv: number; seasons: string[] }[] = [
  { id: 'tomato', item: 'tomato', name: 'Tomaten', lv: 0, seasons: ['spring', 'summer'] },
  { id: 'carrot', item: 'carrot', name: 'Möhren', lv: 0, seasons: ['spring', 'summer', 'autumn'] },
  { id: 'herbs', item: 'herbs', name: 'Kräuter', lv: 1, seasons: ['spring', 'summer', 'autumn'] },
  { id: 'pumpkin', item: 'pumpkin', name: 'Kürbis', lv: 2, seasons: ['summer', 'autumn'] },
];
export const cropOf = (id?: string) => CROPS.find((c) => c.id === id);
def({
  id: 'garden', label: (c) => (c.o?.st?.crop ? 'Beet pflegen' : 'Beet bepflanzen'), icon: '🌱', on: 'obj', func: ['gardenbed'], ages: ['child', ...ADULTS], slot: 'near', group: 'Garten',
  adv: { fun: 14 }, advFn: (c) => (c.g.hasTrait(c.s, 'outdoorsy') ? 25 : 0) + (c.s.hobbies.includes('gardening') ? 20 : 0) + (c.o?.st?.crop && (c.o.st.water ?? 0) < 0.4 ? 20 : 0),
  avail: (c) => {
    if (c.o && !mayUse(c.g, c.s, c.o)) return false;
    if (seasonOf(c.g) === 'winter' && !c.o?.st?.crop) return 'Im Winter wächst nichts';
    if (c.o?.st?.crop && (c.o.st.growth ?? 0) >= 1) return 'Reif – jetzt ernten';
    if (c.o?.st?.crop && (c.o.st.water ?? 0) > 0.85) return 'Ist gut versorgt';
    return true;
  },
  dur: 25, anim: 'garden', skill: 'gardening', xp: 1.3, rate: { fun: 0.6, hygiene: -0.3 },
  done: (c) => {
    const o = c.o!;
    o.st = o.st ?? {};
    if (!o.st.crop) {
      const lv = c.g.skillLv(c.s, 'gardening');
      const opts = CROPS.filter((x) => x.lv <= lv && x.seasons.includes(seasonOf(c.g)));
      const crop = (c.a.data?.crop && opts.find((x) => x.id === c.a.data!.crop)) || c.g.rng.pick(opts.length ? opts : CROPS);
      o.st.crop = crop.id;
      o.st.growth = 0;
    }
    o.st.water = 1;
    c.g.world.touch(o.lot);
    if (isOutdoor(c.g, c.s) && c.g.weather.now === 'sunny') c.g.addMood(c.s, 'sunshine');
  },
  goal: 'garden',
});
def({
  id: 'gardenHarvest', label: 'Ernten', icon: '🧺', on: 'obj', func: ['gardenbed'], ages: ['child', ...ADULTS], slot: 'near', group: 'Garten',
  adv: { fun: 30 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : c.o?.st?.crop && (c.o.st.growth ?? 0) >= 1 ? true : false),
  dur: 12, anim: 'garden', skill: 'gardening', xp: 1.2,
  done: (c) => {
    const o = c.o!;
    const crop = cropOf(o.st?.crop);
    const lv = c.g.skillLv(c.s, 'gardening');
    const n = (2 + Math.floor(lv / 3)) * (lv >= 5 ? 2 : 1);
    if (crop) c.g.giveItem(c.s, crop.item, n);
    o.st = { ...(o.st ?? {}), crop: undefined, growth: 0, water: 0 };
    c.g.addMood(c.s, 'harvest');
    c.g.world.touch(o.lot);
    c.g.notify(`${c.s.first} erntet ${n}× ${crop?.name ?? 'Gemüse'}.`, '🧺', c.s.id, 'good');
  },
  goal: 'gardenHarvest',
});
def({
  id: 'waterPlant', label: 'Pflanze gießen', icon: '🪴', on: 'obj', func: ['plant'], ages: ['child', ...ADULTS], slot: 'near', group: 'Garten',
  adv: { fun: 4 }, advFn: (c) => (c.g.hasTrait(c.s, 'neat') || c.g.hasTrait(c.s, 'outdoorsy') ? 10 : 0), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 3, anim: 'garden', skill: 'gardening', xp: 0.6,
});
def({
  id: 'fish', label: 'Angeln', icon: '🎣', on: 'obj', func: ['fishingspot'], ages: ['child', ...ADULTS], slot: 'any', group: 'Garten',
  adv: { fun: 30 }, advFn: (c) => (c.g.hasTrait(c.s, 'outdoorsy') ? 25 : 0) + (c.s.hobbies.includes('fishing') ? 20 : 0),
  dur: 60, anim: 'fish', skill: 'fishing', xp: 1.5, rate: { fun: 1, comfort: -0.2 }, prop: 'rod',
  done: (c) => {
    const lv = c.g.skillLv(c.s, 'fishing');
    const roll = c.g.rng.next() + lv * 0.06;
    const item = lv >= 6 && roll > 1.05 ? 'fish_big' : lv >= 3 && roll > 0.7 ? 'fish_mid' : roll > 0.25 ? 'fish_small' : null;
    if (item) {
      c.g.giveItem(c.s, item);
      if (item === 'fish_big') c.g.addMood(c.s, 'bigcatch');
      c.g.notify(`${c.s.first} hat einen ${item === 'fish_big' ? 'Hafenhecht' : item === 'fish_mid' ? 'Zander' : 'Hering'} gefangen!`, '🎣', c.s.id, 'good');
    } else c.g.bubble(c.s, '🥾');
  },
  goal: 'fish',
});
def({
  id: 'grill', label: 'Grillen', icon: '🍖', on: 'obj', func: ['grill'], ages: ADULTS, slot: 'any', group: 'Küche',
  adv: { hunger: 55, fun: 15 }, advFn: (c) => (c.g.hasTrait(c.s, 'outdoorsy') ? 15 : 0) + (c.g.weather.now === 'rain' || c.g.weather.now === 'snow' ? -60 : 0),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  start: (c) => {
    if (c.s.hh && lotHh(c.g, c.o!.lot)?.id === c.s.hh && !c.g.money(c.s.hh, -12, 'Grillgut')) return 'Nicht genug Geld';
  },
  dur: 30, anim: 'grill', skill: 'cooking', xp: 1.2, rate: { fun: 0.8 },
  done: (c) => {
    const meal = c.g.spawnProp('prop-meal', c.o!.lot, c.o!.l, { x: c.s.x, z: c.s.z }, { servings: 4, recipe: 'fishplate', quality: 2 + Math.floor(c.g.skillLv(c.s, 'cooking') / 3), until: c.g.clock.min + 900 });
    if (meal) insertNext(c.g, c.s, 'eat', c, { obj: meal.id });
  },
  goal: 'grill',
});

// ======================= Haushalt =======================
def({
  id: 'repair', label: 'Reparieren', icon: '🔧', on: 'obj', ages: ['teen', ...GROWN], slot: 'near', group: 'Haushalt',
  adv: { fun: 5 }, advFn: (c) => 35 + (c.s.hobbies.includes('handiness') ? 15 : 0),
  avail: (c) => (c.o?.st?.broken && mayUse(c.g, c.s, c.o) ? true : false),
  dur: (c) => Math.max(15, 45 - c.g.skillLv(c.s, 'handiness') * 3), anim: 'repair', skill: 'handiness', xp: 1.8, rate: { hygiene: -0.3 },
  done: (c) => {
    const ok = c.g.rng.chance(0.62 + c.g.skillLv(c.s, 'handiness') * 0.08);
    if (ok) {
      c.o!.st = { ...(c.o!.st ?? {}), broken: false };
      c.g.world.touch(c.o!.lot);
      c.g.addMood(c.s, 'proud', { hours: 3 });
      c.g.notify(`${c.s.first} hat ${getDef(c.o!.def).name} repariert.`, '🔧', c.s.id, 'good');
    } else {
      c.g.bubble(c.s, '😖');
      c.g.notify(`${c.s.first}: Die Reparatur hat nicht geklappt – nochmal versuchen.`, '🔧', c.s.id, 'warn');
      c.a.data = { ...(c.a.data ?? {}), failed: 1 };
    }
  },
  goal: 'repair',
});
def({
  id: 'clean', label: 'Aufräumen', icon: '🧹', on: 'obj', ages: ['child', ...ADULTS], slot: 'near', group: 'Haushalt',
  adv: { fun: 2 }, advFn: (c) => (c.g.hasTrait(c.s, 'neat') ? 45 : c.g.hasTrait(c.s, 'messy') ? -15 : 15),
  avail: (c) => ((c.o?.def === 'prop-puddle' || c.o?.def === 'prop-trash') && mayUse(c.g, c.s, c.o) ? true : false),
  dur: 6, anim: 'clean', rate: { hygiene: -0.5 },
  done: (c) => {
    c.g.removeObject(c.o!.id);
    if (c.g.hasTrait(c.s, 'neat')) c.g.addMood(c.s, 'proud', { hours: 2 });
  },
  goal: 'clean',
});
def({
  id: 'takeOutTrash', label: 'Müll rausbringen', icon: '🗑️', on: 'obj', func: ['trash'], ages: ['child', ...ADULTS], slot: 'use', group: 'Haushalt',
  adv: { fun: 2 }, advFn: (c) => (c.g.hasTrait(c.s, 'neat') ? 40 : c.g.hasTrait(c.s, 'messy') ? -15 : 12),
  avail: (c) => {
    if (!c.o || !mayUse(c.g, c.s, c.o)) return false;
    for (const o of c.g.world.objs.values()) if (o.lot === c.o.lot && o.def === 'prop-trash') return true;
    return 'Kein Müll herum';
  },
  dur: 8, anim: 'carry', rate: { hygiene: -0.3 },
  done: (c) => {
    const ids: string[] = [];
    for (const o of c.g.world.objs.values()) if (o.lot === c.o!.lot && o.def === 'prop-trash') ids.push(o.id);
    for (const id of ids) c.g.removeObject(id);
    if (ids.length) c.g.notify(`${c.s.first} hat den Müll rausgebracht.`, '🗑️', c.s.id, 'good');
    if (c.g.hasTrait(c.s, 'neat')) c.g.addMood(c.s, 'proud', { hours: 2 });
  },
  goal: 'clean',
});
def({
  id: 'payBills', label: 'Rechnungen bezahlen', icon: '✉️', on: 'obj', func: ['mailbox'], ages: GROWN, slot: 'near', group: 'Haushalt',
  advFn: (c) => (c.s.hh && c.g.hhs.get(c.s.hh)?.bills && c.g.hasTrait(c.s, 'neat') ? 30 : c.s.hh && c.g.hhs.get(c.s.hh)?.bills ? 10 : -100),
  avail: (c) => {
    const h = c.s.hh ? c.g.hhs.get(c.s.hh) : undefined;
    if (!h || h.lot !== c.o?.lot) return false;
    if (!h.bills) return 'Keine offenen Rechnungen';
    if (!c.g.canAfford(h.id, h.bills.amount)) return 'Nicht genug Geld';
    return true;
  },
  dur: 2, anim: 'phone',
  done: (c) => payBills(c.g, c.s.hh!),
  goal: 'payBills',
});
export function payBills(g: Game, hhId: string): boolean {
  const h = g.hhs.get(hhId);
  if (!h?.bills) return false;
  if (!g.money(h.id, -h.bills.amount, 'Rechnungen (Strom, Wasser, Grundsteuer)', `bill:${h.bills.issued}`)) return false;
  h.bills = null;
  const wasOff = h.powerOff;
  h.powerOff = false;
  g.notify(wasOff ? 'Rechnungen bezahlt – der Strom ist wieder da.' : 'Rechnungen bezahlt.', '✉️', undefined, 'good');
  g.bus.emit('interaction', { sim: '', id: 'payBills' });
  return true;
}

// ======================= Kinder & Spielplatz =======================
def({
  id: 'playToys', label: 'Spielen', icon: '🧸', on: 'obj', func: ['toybox', 'dollhouse', 'playmat'], ages: KIDS, slot: 'near', group: 'Spielen',
  adv: { fun: 60, social: 5 }, avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 40, anim: (c) => (c.s.age === 'toddler' ? 'sitfloor' : 'play'), rate: { fun: 2.4 }, skill: 'painting', xp: 0.2,
});
def({
  id: 'swing', label: 'Schaukeln', icon: '🪀', on: 'obj', func: ['swing'], ages: ['child', 'teen', 'youngadult', 'adult'], slot: 'any', group: 'Spielen',
  adv: { fun: 40 }, advFn: (c) => (c.s.age === 'child' ? 25 : -10), dur: 25, anim: 'swing', rate: { fun: 2.6, comfort: 0.3 },
});
def({
  id: 'slide', label: 'Rutschen', icon: '🛝', on: 'obj', func: ['slide'], ages: ['child'], slot: 'near', group: 'Spielen',
  adv: { fun: 55 }, dur: 20, anim: 'play', rate: { fun: 3, energy: -0.2 },
});
def({
  id: 'warmUp', label: 'Am Kamin aufwärmen', icon: '🔥', on: 'obj', func: ['fireplace'], ages: WALKERS, slot: 'near', group: 'Ruhen',
  adv: { comfort: 30, fun: 8 }, advFn: (c) => (seasonOf(c.g) === 'winter' ? 25 : -10), avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : true),
  dur: 30, anim: 'idle', rate: { comfort: 2, fun: 0.4 }, done: (c) => c.g.removeMood(c.s, 'cold'),
});
def({
  id: 'watchFish', label: 'Fische beobachten', icon: '🐠', on: 'obj', func: ['aquarium'], ages: ['toddler', ...WALKERS], slot: 'near', group: 'Ruhen',
  adv: { fun: 15, comfort: 5 }, dur: 15, anim: 'idle', rate: { fun: 1, comfort: 0.3 }, done: (c) => c.g.addMood(c.s, 'calm'),
});
def({
  id: 'fillBowl', label: 'Napf füllen', icon: '🦴', on: 'obj', func: ['petbowl'], ages: ['child', ...ADULTS], slot: 'near', group: 'Haustier',
  advFn: (c) => (c.g.pets.size && (c.o?.st?.filled ?? 0) <= 0 && c.s.hh && [...c.g.pets.values()].some((p) => p.hh === c.s.hh && p.needs.hunger < 60) ? 45 + (c.g.hasTrait(c.s, 'animallover') ? 20 : 0) : -100),
  avail: (c) => (c.o && !mayUse(c.g, c.s, c.o) ? false : (c.o?.st?.filled ?? 0) >= 3 ? 'Napf ist voll' : true),
  dur: 2, anim: 'garden',
  start: (c) => {
    if (c.s.hh && !c.g.money(c.s.hh, -4, 'Tierfutter')) return 'Nicht genug Geld';
  },
  done: (c) => {
    c.o!.st = { ...(c.o!.st ?? {}), filled: 3 };
    c.g.world.touch(c.o!.lot);
  },
  goal: 'petFeed',
});

// ======================= Öffentliche Orte =======================
def({
  id: 'shop', label: 'Einkaufen', icon: '🛍️', on: 'obj', func: ['register', 'shelfshop'], ages: ['child', ...ADULTS], slot: 'near', group: 'Einkaufen', auto: false,
  avail: (c) => {
    const lot = lotById(c.o?.lot ?? '');
    if (!lot || (lot.venue !== 'market' && lot.venue !== 'shop')) return false;
    if (lot.open && !isOpen(c.g, lot.open)) return 'Geschlossen';
    return true;
  },
  dur: 2, anim: 'register', goal: 'shop',
});
def({
  id: 'orderFood', label: 'Essen bestellen (25 RT)', icon: '🍝', on: 'obj', func: ['register', 'bar'], ages: WALKERS, slot: 'near', group: 'Essen gehen',
  adv: { hunger: 70, fun: 10 }, advFn: (c) => (c.s.npc ? 0 : -20) + (c.g.hasTrait(c.s, 'foodie') ? 15 : 0),
  avail: (c) => {
    const lot = lotById(c.o?.lot ?? '');
    if (!lot || !(lot.venue === 'restaurant' || lot.venue === 'cafe' || lot.venue === 'bar')) return false;
    if (lot.open && !isOpen(c.g, lot.open)) return 'Geschlossen';
    if (c.s.career?.onSite) return false;
    return true;
  },
  dur: 4, anim: 'register',
  start: (c) => {
    if (c.s.hh && !c.g.money(c.s.hh, -25, 'Essen bestellt')) return 'Nicht genug Geld';
  },
  done: (c) => {
    const meal = c.g.spawnProp('prop-meal', c.o!.lot, c.o!.l, { x: c.s.x, z: c.s.z }, { servings: 1, recipe: c.g.rng.pick(['pasta', 'lasagne', 'curry', 'fishplate', 'salad']), quality: 4, until: c.g.clock.min + 240 });
    if (meal) insertNext(c.g, c.s, 'eat', c, { obj: meal.id });
  },
  goal: 'orderFood',
});
def({
  id: 'orderDrink', label: 'Cocktail ohne Alkohol (6 RT)', icon: '🍹', on: 'obj', func: ['bar'], ages: ['teen', ...GROWN], slot: 'near', group: 'Essen gehen',
  adv: { fun: 30, social: 10 }, avail: (c) => (c.s.career?.onSite ? false : true),
  start: (c) => (c.s.hh ? (c.g.money(c.s.hh, -6, 'Getränk') ? undefined : 'Nicht genug Geld') : undefined),
  dur: 15, anim: 'drink', prop: 'cup', rate: { fun: 1.5, social: 0.5, bladder: -0.8, hunger: 0.4 },
});

// ======================= Eigene Figur & Wege =======================
def({
  id: 'walkHere', label: 'Hierhin gehen', icon: '🚶', on: 'ground', ages: ['toddler', ...WALKERS], auto: false, dur: 0.1, anim: 'idle',
});
def({
  id: 'goTo', label: (c) => `Gehen nach: ${c.g.lotName(String(c.a?.data?.lot ?? ''))}`, icon: '🗺️', on: 'self', ages: WALKERS, auto: false,
  route: (c) => {
    const lot = lotById(String(c.a.data?.lot ?? ''));
    if (!lot) return 'Unbekannter Ort';
    // erstes begehbares Feld hinter dem Eingang
    const [ex, ez] = lotEntrance(lot.id);
    const inX = lot.front === 1 ? -1 : lot.front === 3 ? 1 : 0,
      inZ = lot.front === 0 ? 1 : lot.front === 2 ? -1 : 0;
    const any: { x: number; z: number; l: number }[] = [];
    for (let i = 1; i < 8 && any.length < 6; i++)
      for (let j = -3; j <= 3; j++) {
        const x = Math.floor(ex + inX * i + (inZ ? j : 0)),
          z = Math.floor(ez + inZ * i + (inX ? j : 0));
        if (c.g.world.cellWalkable(0, x, z)) any.push({ x: x + 0.5, z: z + 0.5, l: 0 });
      }
    if (!any.length) any.push({ x: ex, z: ez, l: 0 });
    return { x: any[0]!.x, z: any[0]!.z, l: 0, any };
  },
  dur: 0.5, anim: 'idle',
  done: (c) => {
    const lot = String(c.a.data?.lot ?? '');
    c.s.loc = lot;
    c.g.bus.emit('visit', { sim: c.s.id, lot });
  },
});
def({
  id: 'goHome', label: 'Nach Hause gehen', icon: '🏠', on: 'self', ages: WALKERS, auto: false,
  avail: (c) => {
    const h = c.g.homeLotOf(c.s);
    if (!h) return false;
    return c.g.lotOf(c.s) === h ? 'Schon zu Hause' : true;
  },
  route: (c) => {
    const h = c.g.homeLotOf(c.s)!;
    c.a.data = { ...(c.a.data ?? {}), lot: h };
    const d = idefGoTo();
    return d.route!(c);
  },
  dur: 0.5, anim: 'idle',
  done: (c) => {
    c.s.loc = c.g.homeLotOf(c.s) ?? c.s.loc;
  },
});
import { idef } from './interact';
const idefGoTo = () => idef('goTo')!;
def({
  id: 'meditate', label: 'Meditieren', icon: '🧘', on: 'self', ages: ['teen', ...GROWN], group: 'Ich',
  advFn: (c) => (c.s.emo === 'tense' || c.s.emo === 'angry' ? 22 : -10), dur: 30, anim: 'sitfloor', rate: { comfort: 0.5, fun: 0.3 },
  done: (c) => {
    c.g.addMood(c.s, 'calm');
    c.s.moods = c.s.moods.filter((m) => !['annoyed', 'worried', 'argument', 'badday'].includes(m.id));
  },
});
def({
  id: 'phoneSelf', label: 'Am Handy daddeln', icon: '📱', on: 'self', ages: ['child', ...ADULTS], group: 'Ich',
  adv: { fun: 12, social: 8 }, dur: 20, anim: 'phone', prop: 'phone', rate: { fun: 0.8, social: 0.5 },
});
def({
  id: 'idleThink', label: 'Nachdenken', icon: '💭', on: 'self', ages: ['child', ...ADULTS], group: 'Ich', auto: false,
  dur: 10, anim: 'think', skill: 'logic', xp: 0.3,
});
