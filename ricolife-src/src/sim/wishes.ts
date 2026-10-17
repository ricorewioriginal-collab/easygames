// Wünsche: kleine, kurzfristige Ziele je steuerbarer Figur (bis zu 3) und Gedankenblasen (dringendstes Bedürfnis oder ein Wunsch).
import { SKILLS } from '../data/traits';
import type { NeedId, SkillId } from '../data/types';
import { NEED_IDS } from '../data/types';
import { getDef } from '../world/defs';
import type { ObjInst } from '../world/world';
import type { Game } from './game';
import { idef } from './interact';
import { menuFor, type MenuItem, type Target } from './menu';
import type { Sim, Wish } from './types';

export const MAX_WISHES = 3;
const NEED_ICON: Record<NeedId, string> = { hunger: '🍽️', energy: '⚡', hygiene: '🫧', bladder: '🚻', social: '💬', fun: '🎈', comfort: '🛋️' };
const MEAN = new Set(['debate', 'complain', 'brag', 'insult', 'argue', 'prank', 'breakUp']);
/** Fähigkeit → Gegenstände zu Hause, mit denen sie trainiert wird ([] = überall möglich) */
const SKILL_FUNCS: Partial<Record<SkillId, string[]>> = {
  cooking: ['stove', 'oven'], fitness: [], painting: ['easel'], music: ['piano', 'guitar'], charisma: [], handiness: ['workbench'],
  gardening: ['gardenbed'], writing: ['computer'], programming: ['computer'], photography: ['camera'], logic: ['chess', 'telescope'],
};

type Ev =
  | { k: 'int'; id: string; obj?: string; target?: string }
  | { k: 'soc'; id: string; target: string }
  | { k: 'skill'; skill: string }
  | { k: 'meet' }
  | { k: 'buy'; price: number }
  | { k: 'work' }
  | { k: 'promote' };

interface WishDef {
  k: string;
  icon: string;
  label: (g: Game, w: Wish) => string;
  /** Interaktion, die den Wunsch erfüllt (für Alter, Gegenstand und Klick) */
  use?: string;
  pts: number;
  /** Gültigkeit in Spielstunden */
  hours?: number;
  /** Gewicht (0 = nicht möglich) und optional Ziel (Person/Fähigkeit) */
  pick: (g: Game, s: Sim) => { w: number; t?: string } | null;
  done: (ev: Ev, w: Wish, g: Game) => boolean;
}

const home = (g: Game, s: Sim): string | null => g.homeLotOf(s);
const homeHas = (g: Game, s: Sim, funcs: readonly string[]): boolean => {
  const lot = home(g, s);
  return !!lot && funcs.some((f) => g.objsWith(lot, f).some((o) => !o.st?.broken));
};
/** Kann die Figur die Interaktion zu Hause nutzen (Alter + passender Gegenstand)? */
const canUse = (g: Game, s: Sim, id: string): boolean => {
  const d = idef(id);
  if (!d || (d.ages && !d.ages.includes(s.age))) return false;
  return !d.func || homeHas(g, s, d.func);
};
const intIs = (...ids: string[]) => (ev: Ev): boolean => ev.k === 'int' && ids.includes(ev.id);
const tr = (g: Game, s: Sim, t: string, w: number): number => (g.hasTrait(s, t) ? w : 0);
const lowNeed = (s: Sim, n: NeedId, th = 50): number => (s.needs[n] < th ? 2 : 0);

export const WISHES: WishDef[] = [
  {
    k: 'chat', icon: '💬', pts: 15, label: (g, w) => `Mit ${g.name(w.t)} plaudern`,
    pick: (g, s) => {
      const ks = g.known(s).filter((o) => o.id !== s.id && o.age !== 'baby' && !o.guest && (g.peekRel(s.id, o.id)?.f ?? 0) >= 0);
      if (!ks.length) return null;
      const t = g.rng.pick(ks);
      return { w: 2 + tr(g, s, 'social', 3) + lowNeed(s, 'social') - tr(g, s, 'loner', 1.5), t: t.id };
    },
    done: (ev, w) => ev.k === 'soc' && ev.target === w.t && !MEAN.has(ev.id),
  },
  {
    k: 'hug', icon: '🤗', pts: 20, label: (g, w) => `${g.name(w.t)} umarmen`,
    pick: (g, s) => {
      const fs = g.friends(s, 40).filter((o) => o.id !== s.id && o.age !== 'baby' && !o.guest);
      if (!fs.length) return null;
      return { w: 1.5 + tr(g, s, 'kind', 1.5) + tr(g, s, 'familyoriented', 1.5), t: g.rng.pick(fs).id };
    },
    done: (ev, w) => ev.k === 'soc' && ev.target === w.t && ev.id === 'hug',
  },
  {
    k: 'kiss', icon: '💋', pts: 25, label: (g, w) => `${g.name(w.t)} küssen`,
    pick: (g, s) => {
      if (!g.isAdult(s)) return null;
      const p = g.partnerOf(s);
      return p ? { w: 1.5 + tr(g, s, 'romantic', 3), t: p.id } : null;
    },
    done: (ev, w) => ev.k === 'soc' && ev.target === w.t && ev.id === 'kiss',
  },
  {
    k: 'meet', icon: '👋', pts: 20, label: () => 'Jemanden Neues kennenlernen',
    pick: (g, s) => ({ w: 1 + tr(g, s, 'social', 2.5) - tr(g, s, 'shy', 0.8) - tr(g, s, 'loner', 1) }),
    done: (ev) => ev.k === 'meet',
  },
  {
    k: 'cook', icon: '🍳', pts: 15, use: 'cook', label: () => 'Etwas Leckeres kochen',
    pick: (g, s) => (canUse(g, s, 'cook') && homeHas(g, s, ['stove', 'oven']) ? { w: 1.5 + tr(g, s, 'foodie', 3) + lowNeed(s, 'hunger', 60) } : null),
    done: intIs('cook'),
  },
  {
    k: 'skill', icon: '📈', pts: 30, hours: 48, label: (_g, w) => `Fähigkeit ${SKILLS[w.t as SkillId]?.name ?? ''} steigern`,
    pick: (g, s) => {
      if (s.age === 'baby' || s.age === 'toddler') return null;
      const opts = (Object.keys(SKILL_FUNCS) as SkillId[]).filter((k) => {
        const f = SKILL_FUNCS[k]!;
        return (s.hobbies.includes(k) || (s.skills[k] ?? 0) > 0) && (!f.length || homeHas(g, s, f)) && g.skillLv(s, k) < 10;
      });
      if (!opts.length) return null;
      return { w: 1.5 + tr(g, s, 'ambitious', 1.5) + (s.aspiration === 'knowledge' || s.aspiration === 'creative' ? 1.5 : 0), t: g.rng.pick(opts) };
    },
    done: (ev, w) => ev.k === 'skill' && ev.skill === w.t,
  },
  {
    k: 'read', icon: '📖', pts: 10, use: 'read', label: () => 'Ein Buch lesen',
    pick: (g, s) => (canUse(g, s, 'read') ? { w: 1 + tr(g, s, 'bookworm', 3) + tr(g, s, 'genius', 1) + (s.aspiration === 'knowledge' ? 1 : 0) } : null),
    done: intIs('readSeat'),
  },
  {
    k: 'tv', icon: '📺', pts: 10, use: 'watchTV', label: () => 'Fernsehen',
    pick: (g, s) => (canUse(g, s, 'watchTV') ? { w: 1 + tr(g, s, 'lazy', 2.5) + lowNeed(s, 'fun') } : null),
    done: intIs('watchTV'),
  },
  {
    k: 'sport', icon: '🏃', pts: 15, label: () => 'Sport treiben',
    pick: (g, s) => (canUse(g, s, 'pushups') || canUse(g, s, 'workout') ? { w: 1 + tr(g, s, 'active', 3) + (s.aspiration === 'fitness' ? 2 : 0) - tr(g, s, 'lazy', 0.8) } : null),
    done: intIs('workout', 'swim'),
  },
  {
    k: 'paint', icon: '🎨', pts: 20, use: 'paint', label: () => 'Ein Bild malen',
    pick: (g, s) => (canUse(g, s, 'paint') ? { w: 1 + tr(g, s, 'creative', 3) + (s.hobbies.includes('painting') ? 2 : 0) } : null),
    done: intIs('paint'),
  },
  {
    k: 'music', icon: '🎸', pts: 15, label: (_g, w) => (w.t === 'playPiano' ? 'Klavier spielen' : 'Gitarre üben'),
    pick: (g, s) => {
      const opts = ['playGuitar', 'playPiano'].filter((id) => canUse(g, s, id));
      return opts.length ? { w: 1 + tr(g, s, 'musical', 3) + (s.hobbies.includes('music') ? 2 : 0), t: g.rng.pick(opts) } : null;
    },
    done: intIs('playGuitar', 'playPiano'),
  },
  {
    k: 'bath', icon: '🛁', pts: 10, use: 'bath', label: () => 'Ein Bad nehmen',
    pick: (g, s) => (canUse(g, s, 'bath') && s.age !== 'baby' && s.age !== 'toddler' ? { w: 0.8 + lowNeed(s, 'hygiene', 60) + lowNeed(s, 'comfort') } : null),
    done: (ev) => ev.k === 'int' && ev.id === 'shower' && !!ev.obj && !!getDef(ev.obj).func?.includes('bathtub'),
  },
  {
    k: 'sleep', icon: '😴', pts: 10, use: 'sleep', label: () => 'Gut ausschlafen',
    pick: (g, s) => (canUse(g, s, 'sleep') ? { w: (s.needs.energy < 60 ? 2 : 0.4) + tr(g, s, 'lazy', 1.5) } : null),
    done: intIs('sleep'),
  },
  {
    k: 'buy', icon: '🛍️', pts: 25, hours: 48, label: () => 'Etwas Neues kaufen (ab 200 RT)',
    pick: (g, s) => (g.isAdult(s) && s.hh && (g.hhs.get(s.hh)?.funds ?? 0) >= 600 ? { w: 0.8 + (s.aspiration === 'home' || s.aspiration === 'wealth' ? 2 : 0) } : null),
    done: (ev) => ev.k === 'buy' && ev.price >= 200,
  },
  {
    k: 'work', icon: '💼', pts: 20, hours: 36, label: () => 'Eine erfolgreiche Schicht arbeiten',
    pick: (g, s) => (s.career ? { w: 1 + tr(g, s, 'ambitious', 2) + (s.aspiration === 'career' ? 2 : 0) } : null),
    done: (ev) => ev.k === 'work',
  },
  {
    k: 'promote', icon: '📈', pts: 50, hours: 72, label: () => 'Befördert werden',
    pick: (g, s) => (s.career && s.career.perf >= 60 ? { w: 0.6 + tr(g, s, 'ambitious', 1.5) + (s.aspiration === 'career' ? 1.5 : 0) } : null),
    done: (ev) => ev.k === 'promote',
  },
  {
    k: 'garden', icon: '🌱', pts: 15, label: () => 'Den Garten pflegen',
    pick: (g, s) => (canUse(g, s, 'garden') || canUse(g, s, 'waterPlant') ? { w: 1 + tr(g, s, 'outdoorsy', 2.5) + (s.aspiration === 'nature' ? 2 : 0) } : null),
    done: intIs('garden', 'gardenHarvest', 'waterPlant'),
  },
  {
    k: 'pet', icon: '🐾', pts: 15, label: () => 'Mit dem Haustier spielen',
    pick: (g, s) => (s.hh && (g.hhs.get(s.hh)?.pets.length ?? 0) > 0 && canUse(g, s, 'petPlay') ? { w: 1.5 + tr(g, s, 'animallover', 3) } : null),
    done: intIs('petPlay', 'petPet'),
  },
  {
    k: 'homework', icon: '📐', pts: 15, use: 'homework', label: () => 'Hausaufgaben erledigen',
    pick: (g, s) => (s.school && s.school.hw < 1 && canUse(g, s, 'homework') ? { w: 1.5 } : null),
    done: intIs('homework'),
  },
];
const WISH_MAP = new Map(WISHES.map((w) => [w.k, w]));
export const wishDef = (k: string): WishDef | undefined => WISH_MAP.get(k);
export const wishLabel = (g: Game, w: Wish): string => wishDef(w.k)?.label(g, w) ?? w.k;
export const wishIcon = (w: Wish): string => wishDef(w.k)?.icon ?? '✨';

function eligible(g: Game, s: Sim): boolean {
  return g.isControllable(s) && s.age !== 'baby' && s.age !== 'toddler';
}

/** neuen Wunsch anbieten (passend zur Figur); liefert den Wunsch oder null */
export function offerWish(g: Game, s: Sim): Wish | null {
  const ws = (s.wishes ??= []);
  if (ws.length >= MAX_WISHES) return null;
  const cands: { d: WishDef; w: number; t?: string }[] = [];
  for (const d of WISHES) {
    if (ws.some((x) => x.k === d.k)) continue;
    const p = d.pick(g, s);
    if (p && p.w > 0) cands.push({ d, ...p });
  }
  const c = g.rng.weighted(cands, (x) => x.w);
  if (!c) return null;
  const w: Wish = { k: c.d.k, until: Math.round(g.clock.min + (c.d.hours ?? 30) * 60) };
  if (c.t) w.t = c.t;
  ws.push(w);
  return w;
}

export function dismissWish(s: Sim, i: number): void {
  if (s.wishes && i >= 0 && i < s.wishes.length) s.wishes.splice(i, 1);
}

function fulfil(g: Game, s: Sim, ev: Ev): void {
  if (!s.wishes?.length || !eligible(g, s)) return;
  for (let i = s.wishes.length - 1; i >= 0; i--) {
    const w = s.wishes[i]!;
    const d = wishDef(w.k);
    if (!d || !d.done(ev, w, g)) continue;
    s.wishes.splice(i, 1);
    s.wishPoints = (s.wishPoints ?? 0) + d.pts;
    g.addMood(s, 'wishgranted');
    g.bubble(s, '✨', 3);
    g.notify(`${s.first}: Wunsch erfüllt – ${d.label(g, w)} (+${d.pts} Wunschpunkte)`, '✨', s.id, 'good');
  }
}

/** Gedankenblase: dringendstes Bedürfnis unter 30, sonst ein aktiver Wunsch */
export function thoughtIcon(g: Game, s: Sim): string | null {
  let low: NeedId | null = null;
  for (const n of NEED_IDS) if (s.needs[n] < 30 && (!low || s.needs[n] < s.needs[low])) low = n;
  if (low) return NEED_ICON[low];
  return s.wishes?.length ? wishIcon(g.rng.pick(s.wishes)) : null;
}

/** Spielerklick auf einen Wunsch: passende Interaktion (Ziel + Menüeintrag) oder null */
export function wishAction(g: Game, s: Sim, w: Wish): { tg: Target; it: MenuItem } | null {
  const d = wishDef(w.k);
  if (!d) return null;
  const pick = (tg: Target, ids: string[]): { tg: Target; it: MenuItem } | null => {
    const it = menuFor(g, s, tg).find((m) => ids.includes(m.def) && m.avail === true);
    return it ? { tg, it } : null;
  };
  if (w.t && (w.k === 'chat' || w.k === 'hug' || w.k === 'kiss')) {
    const t = g.sim(w.t);
    if (!t) return null;
    if (!t.away && !t.trip && g.lotOf(t) && g.lotOf(t) === g.lotOf(s)) return pick({ kind: 'sim', t }, [w.k === 'chat' ? 'soc:chat' : `soc:${w.k}`]);
    if (w.k === 'chat') return { tg: { kind: 'self' }, it: { def: 'phoneCall', label: `Anrufen: ${t.first}`, icon: '📞', group: '', avail: true, data: { who: t.id } } };
    return null;
  }
  const ids = d.use ? [d.use] : w.k === 'music' && w.t ? [w.t] : w.k === 'sport' ? ['workout', 'pushups'] : w.k === 'garden' ? ['garden', 'gardenHarvest', 'waterPlant'] : w.k === 'pet' ? ['petPlay'] : [];
  if (!ids.length) return null;
  if (w.k === 'pet') {
    const p = [...g.pets.values()].find((x) => x.hh === s.hh);
    return p ? pick({ kind: 'pet', p }, ids) : null;
  }
  if (w.k === 'sport' && !canUse(g, s, 'workout')) return pick({ kind: 'self' }, ['pushups']);
  const lot = home(g, s);
  if (!lot || g.lotOf(s) !== lot) return null;
  const funcs = new Set(ids.flatMap((id) => idef(id)?.func ?? []));
  const objs: ObjInst[] = [];
  for (const f of funcs) objs.push(...g.objsWith(lot, f));
  objs.sort((a, b) => Math.hypot(a.x - s.x, a.z - s.z) - Math.hypot(b.x - s.x, b.z - s.z));
  for (const o of objs) {
    const r = pick({ kind: 'obj', o }, ids);
    if (r) return r;
  }
  return null;
}

export function installWishes(g: Game): void {
  const nextThought = new Map<string, number>();
  const each = (simId: string, ev: Ev): void => {
    const s = g.sim(simId);
    if (s) fulfil(g, s, ev);
  };
  g.bus.on('interaction', (e) => e.sim && each(e.sim, { k: 'int', id: e.id, obj: e.obj, target: e.target }));
  g.bus.on('social', (e) => e.ok && each(e.sim, { k: 'soc', id: e.id, target: e.target }));
  g.bus.on('skill', (e) => each(e.sim, { k: 'skill', skill: e.skill }));
  g.bus.on('meet', (e) => {
    each(e.sim, { k: 'meet' });
    each(e.target, { k: 'meet' });
  });
  g.bus.on('work', (e) => each(e.sim, { k: 'work' }));
  g.bus.on('career', (e) => e.kind === 'promote' && each(e.sim, { k: 'promote' }));
  g.bus.on('buy', (e) => {
    for (const s of g.members(e.hh)) fulfil(g, s, { k: 'buy', price: e.price });
  });
  g.systems.push({
    name: 'wishes',
    hourly: (g2) => {
      const now = g2.clock.min;
      for (const s of g2.members()) {
        if (!eligible(g2, s)) continue;
        if (s.wishes?.length) s.wishes = s.wishes.filter((w) => w.until > now && wishDef(w.k) && (!w.t || w.k === 'skill' || w.k === 'music' || g2.sims.has(w.t)));
        if ((s.wishes?.length ?? 0) >= MAX_WISHES || now < (s.flags.wishAt ?? 0)) continue;
        if (offerWish(g2, s)) s.flags.wishAt = Math.round(now + g2.rng.range(60, 180));
      }
    },
    minute: (g2) => {
      const now = g2.clock.min;
      for (const s of g2.members()) {
        if (!eligible(g2, s) || s.away || s.trip) continue;
        const at = nextThought.get(s.id);
        if (at === undefined) {
          nextThought.set(s.id, now + g2.rng.range(5, 30));
          continue;
        }
        if (now < at) continue;
        const cur = s.queue[0]?.def;
        if ((s.rt.bubble && s.rt.bubble.until > now) || cur === 'sleep' || cur === 'nap' || cur === 'passOut') {
          nextThought.set(s.id, now + 5);
          continue;
        }
        nextThought.set(s.id, now + g2.rng.range(20, 40));
        const icon = thoughtIcon(g2, s);
        if (icon) g2.bubble(s, icon, 3);
      }
    },
  });
}
