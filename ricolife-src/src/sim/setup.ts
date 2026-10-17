// Neues Spiel aufsetzen: Stadt bauen, Haushalte und Stadtbewohner anlegen, Geschichte starten. Systeme registrieren.
import { HOUSEHOLDS, TOWNSFOLK } from '../data/people';
import { LOTS, lotById } from '../data/lots';
import { CAREERS } from '../data/careers';
import type { AgeStage, Appearance, AspirationId, NpcSeed, SkillId, TraitId } from '../data/types';
import { hash, Rng } from '../core/rng';
import { buildTerrain } from '../world/map';
import { buildAllLots } from '../world/templates';
import { getDef } from '../world/defs';
import { Game } from './game';
import { newPet, newSim } from './factory';
import { randomLook } from './look';
import { installMind } from './mind';
import { installAutonomy, resetAutonomyIndex } from './autonomy';
import { installCareer, ensureSchool } from './career';
import { installLife } from './life';
import { installPets } from './pets';
import { installNpcs } from './npcs';
import { installStories, startStory, storyById } from './stories';
import { installWorldSys, rollWeather } from './world-sys';
import './interactions';
import './socials';
import type { Household, Sim } from './types';

export function installSystems(g: Game): void {
  resetAutonomyIndex();
  installMind(g);
  installAutonomy(g);
  installCareer(g);
  installLife(g);
  installPets(g);
  installNpcs(g);
  installStories(g);
  installWorldSys(g);
}

export interface CustomMember {
  first: string;
  last: string;
  pronoun: Sim['pronoun'];
  age: AgeStage;
  traits: TraitId[];
  aspiration: AspirationId;
  look: Appearance;
  favFood?: string;
  hobbies?: SkillId[];
  career?: string;
}
export interface NewGameOpts {
  /** vorgefertigter Haushalt (HouseholdSeed.id) oder eigener */
  household?: string;
  custom?: { name: string; members: CustomMember[]; pets?: { name: string; kind: 'dog' | 'cat'; fur: number }[] };
  lot?: string;
  story?: string;
  slot?: number;
  name?: string;
  seed?: number;
  /** Testmodus: keine Gebäude bauen (schneller) */
  noBuild?: boolean;
}

/** Grundstücke, auf die ein eigener Haushalt ziehen kann */
export function freeHomeLots(g: Game): string[] {
  const taken = new Set([...g.hhs.values()].map((h) => h.lot));
  const npcHomes = new Set(TOWNSFOLK.map((t) => t.home));
  return LOTS.filter((l) => l.kind === 'home' && !taken.has(l.id) && !npcHomes.has(l.id)).map((l) => l.id);
}
export function lotPrice(g: Game, lot: string): number {
  return g.world.lotValue(lot);
}

function seedSim(g: Game, seed: NpcSeed, hh: string | null): Sim {
  const s = newSim(g, {
    id: seed.id,
    first: seed.first,
    last: seed.last,
    pronoun: seed.pronoun ?? 'they',
    age: seed.age,
    traits: seed.traits,
    aspiration: seed.aspiration,
    hh,
    npc: true,
    home: seed.home,
    look: randomLook(hash(seed.id), seed.age, seed.look ?? {}),
    bio: seed.bio,
    favFood: seed.favFood,
    hobbies: seed.hobbies,
    hangouts: seed.hangouts,
  });
  if (seed.career && CAREERS.some((c) => c.id === seed.career)) {
    const c = CAREERS.find((x) => x.id === seed.career)!;
    s.career = { id: c.id, level: Math.min(seed.careerLevel ?? 0, c.levels.length - 1), perf: 50, shifts: 10, missed: 0, vac: 3, sick: 0, shift: null, onSite: false, tasks: 0, paidKey: '', offDay: -1 };
  }
  // ein paar Startfähigkeiten passend zu Hobbys und Beruf
  for (const k of seed.hobbies ?? []) s.skills[k] = 260 + (hash(s.id + k) % 300);
  if (s.career) for (const k of CAREERS.find((c) => c.id === s.career!.id)!.skills) s.skills[k] = Math.max(s.skills[k] ?? 0, 120 + s.career.level * 260);
  s.ageDays = hash(s.id) % 4;
  return s;
}

function applySeedRels(g: Game, seeds: NpcSeed[]): void {
  for (const seed of seeds) {
    const a = g.sims.get(seed.id);
    if (!a) continue;
    for (const r of seed.rel ?? []) {
      const b = g.sims.get(r.id);
      if (!b) continue;
      const rel = g.rel(a.id, b.id);
      rel.met = true;
      rel.f = Math.max(rel.f, r.f ?? (r.kind === 'rival' ? -30 : 30));
      if (r.kind === 'rival') rel.f = Math.min(rel.f, r.f ?? -30);
      if (r.kind === 'partner') {
        rel.k = 'partner';
        rel.r = Math.max(rel.r, 60);
      }
      if (r.kind === 'spouse') {
        rel.k = 'married';
        rel.r = Math.max(rel.r, 75);
      }
      if (r.kind === 'family') {
        const grown = (s: Sim) => s.age === 'youngadult' || s.age === 'adult';
        const young = (s: Sim) => s.age === 'teen' || s.age === 'child' || s.age === 'toddler' || s.age === 'baby';
        if (grown(a) && young(b) && !b.parents.includes(a.id) && b.parents.length < 2) b.parents.push(a.id);
        else if (grown(b) && young(a) && !a.parents.includes(b.id) && a.parents.length < 2) a.parents.push(b.id);
        a.flags[`fam:${b.id}`] = 1;
        b.flags[`fam:${a.id}`] = 1;
        rel.t = Math.max(rel.t, 60);
      }
    }
  }
}

function newHousehold(g: Game, id: string, name: string, funds: number, lot: string | null): Household {
  const h: Household = { id, name, funds, lot, members: [], pets: [], bills: null, powerOff: false, ledger: [], booked: [], storage: [] };
  g.hhs.set(id, h);
  if (lot) g.world.privateLots.add(lot);
  return h;
}

/** Figuren eines Haushalts auf ihr Grundstück stellen */
export function placeOnLot(g: Game, h: Household): void {
  const L = lotById(h.lot ?? '');
  if (!L) return;
  const cx = L.x + L.w / 2,
    cz = L.z + L.d / 2;
  const cells: [number, number][] = [];
  for (let z = L.z + 1; z < L.z + L.d - 1; z++) for (let x = L.x + 1; x < L.x + L.w - 1; x++) if (g.world.cellWalkable(0, x, z)) cells.push([x, z]);
  cells.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
  const all: { x: number; z: number; l: number; rot: number }[] = [...g.members(h.id), ...h.pets.map((p) => g.pets.get(p)!).filter(Boolean)];
  all.forEach((s, i) => {
    const c = cells[Math.min(cells.length - 1, i * 3)] ?? [cx, cz];
    s.x = c[0] + 0.5;
    s.z = c[1] + 0.5;
    s.l = 0;
    s.rot = 0;
  });
  for (const s of g.members(h.id)) s.loc = h.lot!;
}

/** Haushalt auf ein Grundstück ziehen (Kauf). Liefert Fehlertext oder true. */
export function moveHousehold(g: Game, hhId: string, lot: string, pay = true): string | true {
  const h = g.hhs.get(hhId);
  const L = lotById(lot);
  if (!h || !L || L.kind !== 'home') return 'Ungültiges Grundstück';
  if ([...g.hhs.values()].some((x) => x.lot === lot && x.id !== hhId)) return 'Dort wohnt schon jemand';
  const price = lotPrice(g, lot);
  const sale = h.lot ? Math.round(lotPrice(g, h.lot) * 0.85) : 0;
  if (pay && h.funds + sale < price && !g.settings.creative) return `Zu teuer: ${price} RT (verfügbar mit Verkauf: ${h.funds + sale} RT)`;
  if (h.lot) {
    if (pay && sale) g.money(h.id, sale, `Verkauf: ${g.lotName(h.lot)}`);
    g.world.privateLots.delete(h.lot);
  }
  if (pay) g.money(h.id, -price, `Kauf: ${L.name}`);
  h.lot = lot;
  h.bills = null;
  h.powerOff = false;
  g.world.privateLots.add(lot);
  for (const m of g.members(h.id)) m.home = lot;
  g.world.rebuildFlags();
  placeOnLot(g, h);
  g.bus.emit('moveIn', { hh: h.id, lot });
  return true;
}

/** Aktiven Haushalt wechseln (Stadtbewohner ↔ spielbare Familie) */
export function setActiveHousehold(g: Game, hhId: string): void {
  const prev = g.activeHh;
  if (prev) for (const m of g.members(prev)) m.npc = true;
  g.activeHh = hhId;
  const mem = g.members(hhId);
  for (const m of mem) {
    m.npc = false;
    m.rt.spawned = true;
    m.visit = undefined;
    ensureSchool(m);
  }
  g.activeSim = (mem.find((m) => m.age !== 'baby') ?? mem[0])?.id ?? null;
  if (g.active) {
    g.focus.x = g.active.x;
    g.focus.z = g.active.z;
  }
}

export function createGame(o: NewGameOpts = {}): Game {
  const g = new Game();
  if (o.seed !== undefined) g.rng = new Rng(o.seed);
  g.slot = o.slot ?? 1;
  installSystems(g);
  buildTerrain(g.world);
  if (!o.noBuild) buildAllLots(g.world);
  g.world.rebuildFlags();
  g.world.rebuildLinks();

  // Stadtbewohner
  for (const t of TOWNSFOLK) seedSim(g, t, null);
  // vorgefertigte Haushalte
  for (const hs of HOUSEHOLDS) {
    const h = newHousehold(g, hs.id, hs.name, hs.funds, hs.lot);
    h.story = hs.story;
    h.premade = hs.name;
    for (const m of hs.members) {
      const s = seedSim(g, m, h.id);
      h.members.push(s.id);
      s.home = hs.lot;
    }
    for (const p of hs.pets ?? []) newPet(g, { id: p.id, name: p.name, kind: p.kind, fur: p.fur, traits: p.traits, hh: h.id });
    placeOnLot(g, h);
  }
  applySeedRels(g, [...TOWNSFOLK, ...HOUSEHOLDS.flatMap((h) => h.members)]);
  for (const t of TOWNSFOLK) if (lotById(t.home)?.kind === 'home') g.world.privateLots.add(t.home);

  const st = storyById(o.story);
  let active: string | null = o.household ?? st?.household ?? null;
  if (o.custom) {
    const lot = o.lot ?? st?.start ?? freeHomeLots(g)[0] ?? 'sh-6';
    const funds = st?.startFunds ?? 20000;
    const h = newHousehold(g, `hh-${Date.now().toString(36)}`, o.custom.name || 'Familie', funds, null);
    for (const m of o.custom.members.slice(0, 8)) {
      const s = newSim(g, { first: m.first, last: m.last, pronoun: m.pronoun, age: m.age, traits: m.traits, aspiration: m.aspiration, hh: h.id, npc: false, look: m.look, favFood: m.favFood, hobbies: m.hobbies });
      h.members.push(s.id);
    }
    // Familienbande im eigenen Haushalt
    const mem = g.members(h.id);
    for (const a of mem)
      for (const b of mem) {
        if (a === b) continue;
        const r = g.rel(a.id, b.id);
        r.met = true;
        r.f = Math.max(r.f, 50);
        r.t = Math.max(r.t, 60);
        a.flags[`fam:${b.id}`] = 1;
        const grown = (s: Sim) => s.age === 'youngadult' || s.age === 'adult' || s.age === 'senior';
        if (grown(a) && !grown(b) && b.parents.length < 2 && !b.parents.includes(a.id)) b.parents.push(a.id);
      }
    // zwei Erwachsene im eigenen Haushalt gelten als Paar, wenn sie es so wollen – hier: neutral (Freundschaft)
    for (const p of o.custom.pets ?? []) newPet(g, { name: p.name, kind: p.kind, fur: p.fur, hh: h.id });
    // Das Startzuhause ist inklusive (wie bei den Geschichten-Familien); das Startkapital bleibt frei verfügbar.
    if (moveHousehold(g, h.id, lot, false) !== true) moveHousehold(g, h.id, freeHomeLots(g)[0] ?? 'sh-6', false);
    if (st) h.funds = st.startFunds;
    h.ledger = [];
    h.booked = [];
    active = h.id;
    for (const m of o.custom.members) if (m.career) {
      const s = mem.find((x) => x.first === m.first);
      if (s) s.career = { id: m.career, level: 0, perf: 30, shifts: 0, missed: 0, vac: 3, sick: 0, shift: null, onSite: false, tasks: 0, paidKey: '', offDay: -1 };
    }
  }
  if (!active || !g.hhs.has(active)) active = HOUSEHOLDS[0]!.id;
  if (st && st.household && st.start && g.hhs.get(active)?.lot !== st.start) moveHousehold(g, active, st.start, false);
  setActiveHousehold(g, active);
  g.saveName = o.name || g.hhs.get(active)!.name;
  if (st) {
    g.hhs.get(active)!.story = st.id;
    if (st.id === 'story-traumhaus') prepareFixerUpper(g, st.start);
    startStory(g, st.id);
  }
  rollWeather(g);
  g.nextEventAt = g.clock.min + 6 * 60;
  g.resetTimeMarks();
  return g;
}

/** Traumhaus-Geschichte: ein paar Dinge sind kaputt und es liegt Müll herum */
function prepareFixerUpper(g: Game, lot: string): void {
  const breakable = [...g.world.objs.values()].filter((o) => o.lot === lot && getDef(o.def).breaks);
  for (const o of breakable.slice(0, 3)) o.st = { ...(o.st ?? {}), broken: true };
  const L = lotById(lot)!;
  for (let i = 0; i < 3; i++) g.spawnProp('prop-trash', lot, 0, { x: L.x + 3 + i * 4, z: L.z + L.d / 2 });
  g.world.touch(lot);
}
