// Lebenslauf: Altern und Geburtstage, Schwangerschaft, Geburt, Adoption, Babypflege und (optional) sanfter Abschied.
import { AGE_STAGES, type AgeStage } from '../data/types';
import { def, type Ctx, type QCtx } from './interact';
import { mayUse } from './interactions';
import { newSim } from './factory';
import { ensureSchool } from './career';
import { randomLook } from './look';
import { hash } from '../core/rng';
import { nextActionUid, type Game } from './game';
import type { Sim } from './types';
import { AGE_NAMES } from './look';

/** Tage je Lebensabschnitt für kurz/normal/lang */
const STAGE_DAYS: Record<AgeStage, [number, number, number]> = {
  baby: [2, 3, 5],
  toddler: [3, 5, 8],
  child: [5, 8, 12],
  teen: [5, 8, 12],
  youngadult: [8, 12, 20],
  adult: [10, 15, 25],
  senior: [8, 12, 20],
};
export const stageDays = (g: Game, a: AgeStage): number => STAGE_DAYS[a][g.settings.lifespan];
const PREG_DAYS = [1, 2, 3];
export const MAX_HH = 8;

const BABY_NAMES = ['Mila', 'Ben', 'Lio', 'Emma', 'Noah', 'Ida', 'Finn', 'Lotta', 'Jonte', 'Maja', 'Elias', 'Nele', 'Theo', 'Frieda', 'Juri', 'Smilla', 'Anouk', 'Kian', 'Rosa', 'Levi', 'Ylvi', 'Malik', 'Juna', 'Oskar'];

const grownUp = (s: Sim): boolean => s.age === 'youngadult' || s.age === 'adult' || s.age === 'senior';

/** Altert die Figur um eine Stufe (Geburtstag) */
export function ageUp(g: Game, s: Sim): void {
  const i = AGE_STAGES.indexOf(s.age);
  if (i >= AGE_STAGES.length - 1) return;
  const from = s.age;
  s.age = AGE_STAGES[i + 1]!;
  s.ageDays = 0;
  ensureSchool(s);
  if (s.age === 'toddler') s.outfit = 'everyday';
  if (from === 'teen' && s.career?.id === 'nebenjob') s.career = null;
  g.addMood(s, 'birthday');
  g.memory(s, `Geburtstag: jetzt ${AGE_NAMES[s.age]}`, '🎂', true);
  g.bus.emit('life', { sim: s.id, kind: 'birthday' });
  if (g.isControllable(s)) {
    const extra = s.age === 'teen' ? ' Zeit für ein neues Merkmal!' : s.age === 'youngadult' ? ' Jetzt kann ein Beruf gewählt werden.' : '';
    g.notify(`Alles Gute! ${s.first} ist jetzt ${AGE_NAMES[s.age]}.${extra}`, '🎂', s.id, 'good');
    if ((s.age === 'child' || s.age === 'teen' || s.age === 'youngadult') && s.traits.length < 3) s.flags.pickTrait = 1;
  }
}

/** Sanfter Abschied (nur wenn in den Einstellungen erlaubt) */
export function farewell(g: Game, s: Sim): void {
  const h = s.hh ? g.hhs.get(s.hh) : undefined;
  g.notify(`${s.first} ${s.last} hat ein erfülltes Leben gelebt und ist friedlich eingeschlafen. Die Erinnerungen bleiben.`, '🕊️', undefined, 'info');
  for (const o of g.sims.values()) {
    if (o === s) continue;
    const r = g.peekRel(o.id, s.id);
    if ((r && r.f >= 30) || o.hh === s.hh || g.isFamily(o, s)) {
      g.addMood(o, 'farewell', { src: s.first });
      g.memory(o, `Abschied von ${s.first}`, '🕊️', true);
    }
  }
  g.bus.emit('life', { sim: s.id, kind: 'farewell' });
  if (h) h.members = h.members.filter((m) => m !== s.id);
  g.release(s.id);
  g.sims.delete(s.id);
  for (const k of [...g.rels.keys()]) if (k.split('|').includes(s.id)) g.rels.delete(k);
  if (g.activeSim === s.id) g.activeSim = h?.members[0] ?? null;
}

/** Neues Kind im Haushalt (Geburt oder Adoption) */
export function addChild(g: Game, hhId: string, parents: Sim[], age: AgeStage, adopted: boolean): Sim | null {
  const h = g.hhs.get(hhId);
  if (!h || h.members.length >= MAX_HH) return null;
  const used = new Set([...g.sims.values()].map((x) => x.first));
  const first = BABY_NAMES.find((n) => !used.has(n)) ?? g.rng.pick(BABY_NAMES);
  const p0 = parents[0];
  const seed = hash(first + g.clock.min);
  const look = randomLook(seed, age, adopted || !p0 ? {} : { skin: g.rng.pick(parents).look.skin, hairColor: g.rng.pick(parents).look.hairColor });
  const lot = h.lot;
  const kid = newSim(g, {
    first,
    last: p0?.last ?? h.name.replace(/^Familie\s+/, ''),
    age,
    hh: hhId,
    npc: false,
    home: lot ?? '',
    parents: adopted ? parents.map((p) => p.id) : parents.map((p) => p.id),
    look,
    traits: [g.rng.pick(['cheerful', 'creative', 'active', 'funny', 'social', 'bookworm', 'musical', 'kind'] as const)],
    aspiration: 'friends',
    x: p0?.x ?? 0,
    z: p0?.z ?? 0,
  });
  kid.l = p0?.l ?? 0;
  kid.loc = lot ?? '';
  h.members.push(kid.id);
  for (const p of parents) {
    const r = g.rel(p.id, kid.id);
    r.met = true;
    r.f = 50;
    r.t = 70;
    p.flags[`fam:${kid.id}`] = 1;
    g.addMood(p, 'newbaby');
    g.memory(p, adopted ? `${first} adoptiert` : `${first} ist geboren`, adopted ? '🧸' : '👶', true);
  }
  // Geschwister kennen sich
  for (const m of g.members(hhId)) if (m !== kid && !parents.includes(m)) g.rel(m.id, kid.id).met = true;
  g.bus.emit('life', { sim: kid.id, kind: adopted ? 'adopt' : 'baby', other: p0?.id });
  if (age === 'baby' && lot && !g.objsWith(lot, 'crib').length && hhId === g.activeHh)
    g.notify('Tipp: Kauft im Kaufmodus ein Babybett, damit das Baby gut schlafen kann.', '🛏️', kid.id, 'warn');
  return kid;
}

export function adopt(g: Game, hhId: string, age: AgeStage): string | true {
  const h = g.hhs.get(hhId);
  if (!h) return 'Kein Haushalt';
  if (h.members.length >= MAX_HH) return 'Der Haushalt ist voll (8)';
  const adults = g.members(hhId).filter(grownUp);
  if (!adults.length) return 'Nur Erwachsene können adoptieren';
  if (!g.money(hhId, -1000, 'Adoptionsgebühr', `adopt:${hhId}:${g.clock.day}`)) return 'Adoption kostet 1.000 RT (nur eine pro Tag)';
  const kid = addChild(g, hhId, adults.slice(0, 2), age, true);
  if (!kid) return 'Adoption nicht möglich';
  g.notify(`Willkommen in der Familie, ${kid.first}!`, '🧸', kid.id, 'good');
  return true;
}

function deliver(g: Game, s: Sim): void {
  const partner = g.sim(s.preg?.partner ?? null);
  s.preg = undefined;
  g.removeMood(s, 'worried');
  if (!s.hh) return;
  const twins = g.rng.chance(0.08);
  const parents = partner ? [s, partner] : [s];
  const a = addChild(g, s.hh, parents, 'baby', false);
  const b = twins ? addChild(g, s.hh, parents, 'baby', false) : null;
  if (a && g.isControllable(s)) g.notify(b ? `Zwillinge! ${a.first} und ${b.first} sind da.` : `${a.first} ist da! Herzlichen Glückwunsch.`, '👶', a.id, 'good');
}

// ---------- Interaktionen ----------
def({
  id: 'tryForBaby', label: 'Sich ein Baby wünschen', icon: '👶', on: 'sim', ages: ['youngadult', 'adult'], group: 'Romantisch', auto: false,
  avail: (c: QCtx) => {
    const t = c.t;
    if (!t || !c.g.settings.aging) return c.g.settings.aging ? false : 'Familienzuwachs ist in den Einstellungen aus';
    if (t.age !== 'youngadult' && t.age !== 'adult') return false;
    const r = c.g.peekRel(c.s.id, t.id);
    if (!r?.k || r.k === 'ex') return false;
    if (r.r < 50) return 'Mehr Romantik nötig';
    if (c.s.preg || t.preg) return 'Es ist schon ein Baby unterwegs';
    if (!c.s.hh || c.s.hh !== t.hh) return 'Erst zusammenziehen';
    if ((c.g.hhs.get(c.s.hh)?.members.length ?? 8) >= MAX_HH) return 'Haushalt ist voll (8)';
    const lot = c.g.homeLotOf(c.s);
    if (!lot || c.g.lotOf(c.s) !== lot) return 'Nur zu Hause';
    if (!c.g.objsWith(lot, 'bedDouble').length) return 'Ein Doppelbett wird gebraucht';
    return true;
  },
  route: (c: Ctx) => {
    const lot = c.g.homeLotOf(c.s)!;
    const bed = c.g.objsWith(lot, 'bedDouble').find((o) => mayUse(c.g, c.s, o) && !o.st?.broken);
    if (!bed) return 'Kein Doppelbett';
    const [x, z] = c.g.world.centerOf(bed);
    const any: { x: number; z: number; l: number }[] = [];
    for (const [cx, cz] of c.g.world.cellsOf(bed))
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
        if (c.g.world.cellWalkable(bed.l, cx + dx, cz + dz) && !c.g.world.wallBetween(bed.l, cx, cz, cx + dx, cz + dz)) any.push({ x: cx + dx + 0.5, z: cz + dz + 0.5, l: bed.l });
    if (!any.length) return 'Das Bett ist zugestellt';
    return { x, z, l: bed.l, any };
  },
  dur: 20, anim: 'cuddle',
  start: (c: Ctx) => {
    const t = c.t!;
    const lot = c.g.homeLotOf(c.s)!;
    const bed = c.g.objsWith(lot, 'bedDouble')[0]!;
    const [x, z] = c.g.world.centerOf(bed);
    c.s.x = x - 0.3;
    c.s.z = z;
    c.s.l = bed.l;
    c.s.rt.y = 0.5;
    t.queue.unshift({ uid: nextActionUid(), def: 'socReact', target: c.s.id, phase: 'queued', t: 0, dur: 20, user: false, data: { anim: 'cuddle' } });
    t.x = x + 0.3;
    t.z = z;
    t.l = bed.l;
    t.rt.y = 0.5;
    c.g.bubble(c.s, '💕', 20);
    c.g.bubble(t, '💕', 20);
  },
  done: (c: Ctx) => {
    const t = c.t!;
    c.g.addMood(c.s, 'inlove');
    c.g.addMood(t, 'inlove');
    c.g.addNeed(c.s, 'social', 30);
    c.g.addNeed(t, 'social', 30);
    const r = c.g.rel(c.s.id, t.id);
    r.r = Math.min(100, r.r + 5);
    if (c.g.rng.chance(0.55)) {
      const who = c.g.rng.chance(0.5) ? c.s : t;
      const other = who === c.s ? t : c.s;
      who.preg = { due: c.g.clock.min + PREG_DAYS[c.g.settings.lifespan]! * 1440, partner: other.id };
      if (c.g.isControllable(who)) c.g.notify(`${who.first} und ${other.first} erwarten ein Baby!`, '🍼', who.id, 'good');
      c.g.memory(who, `Baby unterwegs mit ${other.first}`, '🍼', true);
    } else if (c.g.isControllable(c.s)) c.g.notify('Diesmal hat es noch nicht geklappt – vielleicht ein andermal.', '💭', c.s.id, 'info');
  },
  end: (c: Ctx) => {
    c.s.rt.y = 0;
    if (c.t) c.t.rt.y = 0;
  },
});

const careAvail = (kinds: AgeStage[]) => (c: QCtx) => {
  const t = c.t;
  if (!t || !kinds.includes(t.age)) return false;
  if (t.away || t.trip) return false;
  if (!grownUp(c.s) && c.s.age !== 'teen') return false;
  return true;
};
const careAdv = (need: 'hunger' | 'hygiene' | 'social' | 'energy', kinds: AgeStage[]) => (c: QCtx) => {
  const t = c.t;
  if (!t || !kinds.includes(t.age) || t.hh !== c.s.hh) return -100;
  const v = t.needs[need];
  return v < 55 ? (60 - v) * 1.4 + (c.g.hasTrait(c.s, 'familyoriented') ? 20 : 0) : -100;
};
const SMALL: AgeStage[] = ['baby', 'toddler'];

def({
  id: 'feedBaby', label: (c) => (c.t?.age === 'baby' ? 'Fläschchen geben' : 'Füttern'), icon: '🍼', on: 'sim', group: 'Familie',
  avail: careAvail(SMALL), advFn: careAdv('hunger', SMALL), dur: 10, anim: 'baby', prop: 'bottle',
  start: (c) => {
    if (c.s.hh && !c.g.money(c.s.hh, -3, 'Babynahrung')) return 'Nicht genug Geld';
    c.t!.queue.unshift({ uid: nextActionUid(), def: 'babyHeld', target: c.s.id, phase: 'queued', t: 0, dur: 10, user: false });
  },
  done: (c) => {
    c.g.addNeed(c.t!, 'hunger', 60);
    c.g.addNeed(c.s, 'social', 6);
  },
});
def({
  id: 'changeBaby', label: 'Wickeln', icon: '🧷', on: 'sim', group: 'Familie',
  avail: careAvail(SMALL), advFn: careAdv('hygiene', SMALL), dur: 8, anim: 'baby',
  start: (c) => {
    c.t!.queue.unshift({ uid: nextActionUid(), def: 'babyHeld', target: c.s.id, phase: 'queued', t: 0, dur: 8, user: false });
  },
  done: (c) => {
    c.g.addNeed(c.t!, 'hygiene', 80);
    c.g.addNeed(c.t!, 'bladder', 100);
    c.g.addNeed(c.s, 'hygiene', -4);
  },
});
def({
  id: 'cuddleBaby', label: 'Knuddeln', icon: '🤱', on: 'sim', group: 'Familie',
  avail: careAvail(SMALL), advFn: careAdv('social', SMALL), dur: 12, anim: 'baby',
  start: (c) => {
    c.t!.queue.unshift({ uid: nextActionUid(), def: 'babyHeld', target: c.s.id, phase: 'queued', t: 0, dur: 12, user: false });
  },
  done: (c) => {
    c.g.addNeed(c.t!, 'social', 50);
    c.g.addNeed(c.t!, 'fun', 40);
    c.g.addNeed(c.s, 'social', 15);
    c.g.addNeed(c.s, 'fun', 8);
    const r = c.g.rel(c.s.id, c.t!.id);
    r.f = Math.min(100, r.f + 4);
    r.met = true;
  },
});
def({
  id: 'putToBed', label: 'Ins Bettchen legen', icon: '🌙', on: 'sim', group: 'Familie',
  avail: (c) => {
    const ok = careAvail(SMALL)(c);
    if (ok !== true) return ok;
    if (c.t!.needs.energy > 80) return 'Ist noch nicht müde';
    const lot = c.g.lotOf(c.t!);
    return lot && c.g.objsWith(lot, 'crib').some((o) => !o.st?.broken) ? true : 'Kein Babybett';
  },
  advFn: careAdv('energy', SMALL), dur: 3, anim: 'carry',
  done: (c) => {
    tuckIn(c.g, c.t!);
  },
});
def({
  id: 'babyHeld', label: 'Wird umsorgt', icon: '👶', on: 'sim', hidden: true, auto: false,
  route: () => null, dur: 15, anim: 'baby',
  tick: (c) => {
    if (!c.t || !c.t.queue.some((q) => q.target === c.s.id && q.phase === 'perform')) {
      if (c.a.t > 1) c.a.phase = 'done';
    }
  },
});

/** Baby/Kleinkind ins nächste freie Babybett legen und schlafen lassen */
export function tuckIn(g: Game, s: Sim): boolean {
  const lot = g.lotOf(s) || g.homeLotOf(s);
  if (!lot) return false;
  const crib = g.objsWith(lot, 'crib').find((o) => !o.st?.broken && g.world.slotFree(o, 0) && !g.isReserved(o, 0, s.id));
  if (!crib) return false;
  const w = g.world.slotWorld(crib, 0);
  if (!w) return false;
  for (const q of s.queue) q.phase = 'done';
  s.queue = [];
  s.x = w.x;
  s.z = w.z;
  s.l = crib.l;
  s.rot = w.yaw;
  s.rt.y = w.y;
  s.queue.push({ uid: nextActionUid(), def: 'sleep', obj: crib.id, slot: 0, phase: 'queued', t: 0, dur: 0, user: false });
  return true;
}

// ---------- System ----------
export function installLife(g: Game): void {
  g.systems.push({
    name: 'life',
    minute: (g2) => {
      const now = g2.clock.min;
      for (const s of g2.sims.values()) {
        if (s.preg && now >= s.preg.due) deliver(g2, s);
        if (s.age === 'baby' || s.age === 'toddler') babyMinute(g2, s);
      }
    },
    hourly: (g2) => {
      for (const s of g2.sims.values()) {
        if (s.preg && g2.rng.chance(0.15)) g2.addMood(s, g2.rng.chance(0.5) ? 'grateful' : 'worried', { hours: 2 });
      }
    },
    daily: (g2) => {
      if (!g2.settings.aging) return;
      for (const s of [...g2.sims.values()]) {
        if (!s.hh || s.guest) continue; // Stadtbewohner altern nicht (Stadt bleibt stabil)
        s.ageDays++;
        if (s.ageDays >= stageDays(g2, s.age)) {
          if (s.age === 'senior') {
            if (g2.settings.hardEvents && s.ageDays >= stageDays(g2, 'senior') + 2) farewell(g2, s);
          } else ageUp(g2, s);
        }
      }
      for (const p of g2.pets.values()) p.ageDays++;
    },
  });
}

function babyMinute(g: Game, s: Sim): void {
  if (s.away || s.trip) return;
  const cur = s.queue[0];
  // müde → ins Bett
  if (s.needs.energy < 25 && !cur && !tuckIn(g, s)) {
    // ohne Babybett: auf dem Boden dösen
    s.needs.energy = Math.min(100, s.needs.energy + 0.15);
  }
  // Nachbarschaftshilfe statt Schaden: nie verhungern
  if (s.needs.hunger <= 1) {
    s.needs.hunger = 45;
    const parent = g.members(s.hh).find(grownUp);
    if (parent) g.addMood(parent, 'worried', { hours: 4 });
    if (s.hh === g.activeHh) g.notify(`${s.first} hatte großen Hunger – die Nachbarin hat ausgeholfen. Bitte rechtzeitig füttern!`, '🍼', s.id, 'warn');
  }
  if (s.age === 'baby' && s.needs.bladder <= 1) {
    s.needs.bladder = 60;
    s.needs.hygiene = Math.max(0, s.needs.hygiene - 30);
  }
  if (!cur && s.age === 'baby') {
    s.rt.anim = 'baby';
    // Babys meckern sichtbar, wenn etwas fehlt
    const low = s.needs.hunger < 35 ? '🍼' : s.needs.hygiene < 30 ? '🧷' : s.needs.social < 30 ? '🤱' : null;
    if (low && (!s.rt.bubble || s.rt.bubble.until < g.clock.min)) g.bubble(s, low, 5);
  }
}
