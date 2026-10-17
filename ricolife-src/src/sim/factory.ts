// Erzeugung von Figuren und Haustieren mit vollständigen Standardwerten.
import { hash } from '../core/rng';
import type { AgeStage, AspirationId, NeedId, SkillId, TraitId } from '../data/types';
import { NEED_IDS } from '../data/types';
import type { Game } from './game';
import { randomLook } from './look';
import type { Pet, Sim, SimRuntime } from './types';

export function newRuntime(): SimRuntime {
  return { anim: 'idle', animT: 0, path: null, pathI: 0, bubble: null, spawned: false, y: 0, holding: null, socialWith: null, idle: 0, faceYaw: null, reserved: null, stuck: 0, lastX: 0, lastZ: 0 };
}

export function fullNeeds(v = 80): Record<NeedId, number> {
  const n = {} as Record<NeedId, number>;
  for (const k of NEED_IDS) n[k] = v;
  return n;
}

export interface NewSimOpts {
  id?: string;
  first: string;
  last: string;
  pronoun?: Sim['pronoun'];
  age: AgeStage;
  traits?: TraitId[];
  aspiration?: AspirationId;
  hh?: string | null;
  home?: string;
  npc?: boolean;
  parents?: string[];
  look?: Sim['look'];
  bio?: string;
  favFood?: string;
  hobbies?: SkillId[];
  hangouts?: string[];
  x?: number;
  z?: number;
}

export function newSim(g: Game, o: NewSimOpts): Sim {
  const id = o.id ?? `s${Date.now().toString(36)}${g.rng.int(0, 1e6).toString(36)}`;
  const s: Sim = {
    id,
    first: o.first,
    last: o.last,
    pronoun: o.pronoun ?? 'they',
    age: o.age,
    ageDays: 0,
    traits: o.traits ?? [],
    aspiration: o.aspiration ?? 'friends',
    aspStep: 0,
    favFood: o.favFood ?? '',
    hobbies: o.hobbies ?? [],
    bio: o.bio ?? '',
    look: o.look ?? randomLook(hash(id), o.age),
    outfit: 'everyday',
    needs: fullNeeds(o.age === 'baby' ? 70 : 80),
    skills: {},
    moods: [],
    emo: 'fine',
    emoPower: 0,
    career: null,
    school: o.age === 'child' || o.age === 'teen' ? { perf: 50, hw: 0, attended: -1, in: false } : null,
    hh: o.hh ?? null,
    npc: o.npc ?? !o.hh,
    home: o.home ?? '',
    hangouts: o.hangouts ?? [],
    parents: o.parents ?? [],
    x: o.x ?? 0,
    z: o.z ?? 0,
    l: 0,
    rot: 0,
    loc: o.home ?? '',
    away: null,
    inv: {},
    mem: [],
    flags: {},
    queue: [],
    rt: newRuntime(),
  };
  g.sims.set(id, s);
  return s;
}

export function newPet(g: Game, o: { id?: string; name: string; kind: 'dog' | 'cat'; fur: number; traits?: string[]; hh: string; x?: number; z?: number }): Pet {
  const p: Pet = {
    id: o.id ?? `p${Date.now().toString(36)}${g.rng.int(0, 1e5).toString(36)}`,
    name: o.name,
    kind: o.kind,
    fur: o.fur,
    traits: o.traits ?? [],
    hh: o.hh,
    needs: { hunger: 80, fun: 70, energy: 80, social: 70 },
    x: o.x ?? 0,
    z: o.z ?? 0,
    l: 0,
    rot: 0,
    ageDays: 0,
    act: { kind: 'idle', t: 2 },
    rt: { anim: 'idle', animT: 0, path: null, pathI: 0, spawned: false, bubble: null },
  };
  g.pets.set(p.id, p);
  const h = g.hhs.get(o.hh);
  if (h && !h.pets.includes(p.id)) h.pets.push(p.id);
  return p;
}
