// Ereignisse (zufällige Alltagsereignisse mit Entscheidungen), Geschichten mit Aufgaben und Verzweigungen, Lebensziele.
import { EVENTS } from '../data/events';
import { STORIES } from '../data/stories';
import { ASPIRATIONS, SKILLS } from '../data/traits';
import { getDef } from '../world/defs';
import type { Condition, Effect, EventDef, QuestDef, QuestGoal, SkillId, StoryDef } from '../data/types';
import { promote } from './career';
import { startVisit, isTownie } from './npcs';
import type { Game } from './game';
import type { Sim } from './types';

const CREATIVE: SkillId[] = ['painting', 'music', 'writing', 'photography'];

// ---------- Zähler ----------
export function bump(g: Game, key: string, n = 1): void {
  g.stats[key] = (g.stats[key] ?? 0) + n;
}

function inActive(g: Game, simId: string): boolean {
  const s = g.sim(simId);
  return !!s && g.isControllable(s);
}

export function installStats(g: Game): void {
  g.bus.on('interaction', (e) => {
    if (e.sim && !inActive(g, e.sim)) return;
    bump(g, `int:${e.id}`);
  });
  g.bus.on('social', (e) => {
    if (!inActive(g, e.sim) || !e.ok) return;
    bump(g, `soc:${e.id}`);
    bump(g, 'soc:*');
    if (e.id === 'askOut') bump(g, 'dates');
  });
  g.bus.on('buy', (e) => {
    if (e.hh !== g.activeHh) return;
    bump(g, `buy:${e.def}`);
    bump(g, `buycat:${e.cat}`);
    bump(g, 'buy:*');
  });
  g.bus.on('build', (e) => {
    if (e.hh !== g.activeHh) return;
    bump(g, `build:${e.kind}`, e.n);
  });
  g.bus.on('visit', (e) => {
    if (inActive(g, e.sim)) bump(g, `visit:${e.lot}`);
  });
  g.bus.on('work', (e) => {
    if (!inActive(g, e.sim)) return;
    bump(g, 'work');
    bump(g, `work:${e.career}`);
  });
  g.bus.on('money', (e) => {
    if (e.hh === g.activeHh && e.amount > 0) bump(g, 'earned', e.amount);
  });
  g.bus.on('moveIn', (e) => {
    if (e.hh === g.activeHh) {
      bump(g, 'moveIn');
      bump(g, `moveIn:${e.lot}`);
    }
  });
  g.bus.on('event', (e) => bump(g, `event:${e.id}`));
  g.bus.on('flag', (e) => {
    g.flags[e.id] = 1;
  });
  g.bus.on('life', (e) => {
    if (!inActive(g, e.sim)) return;
    bump(g, `life:${e.kind}`);
  });
}

// ---------- Effekte ----------
function fill(text: string, g: Game, npc: Sim | undefined): string {
  return text.replaceAll('{name}', g.active?.first ?? 'Du').replaceAll('{npc}', npc ? `${npc.first} ${npc.last}` : 'jemand');
}

export function applyEffect(g: Game, e: Effect, npc: Sim | undefined, key: string): void {
  const s = g.active;
  if (!s) return;
  if (e.money && s.hh) g.money(s.hh, e.money, e.money > 0 ? 'Ereignis: Einnahme' : 'Ereignis: Ausgabe', `${key}:m`) || (e.money < 0 && s.hh && g.money(s.hh, -Math.min(-e.money, g.hhs.get(s.hh)!.funds), 'Ereignis: Ausgabe (Rest)', `${key}:m2`));
  if (e.needs) for (const [k, v] of Object.entries(e.needs)) g.addNeed(s, k as never, v);
  if (e.moodlet) g.addMood(s, e.moodlet, { src: npc?.first });
  if (e.skill) for (const [k, v] of Object.entries(e.skill)) g.addSkill(s, k as SkillId, v);
  if (e.rel) {
    const other = npc ?? g.rng.pick(g.known(s).length ? g.known(s) : [...g.sims.values()].filter((x) => x !== s));
    if (other) {
      const r = g.rel(s.id, other.id);
      r.met = true;
      if (e.rel.f) r.f = Math.max(-100, Math.min(100, r.f + e.rel.f));
      if (e.rel.r) r.r = Math.max(0, Math.min(100, r.r + e.rel.r));
      if (e.rel.trust) r.t = Math.max(0, Math.min(100, r.t + e.rel.trust));
    }
  }
  if (e.careerPerf && s.career) s.career.perf = Math.max(-50, Math.min(120, s.career.perf + e.careerPerf));
  if (e.memory) g.memory(s, fill(e.memory, g, npc), '📖');
  if (e.item) g.giveItem(s, e.item);
  if (e.unlockObject && s.hh) {
    const h = g.hhs.get(s.hh)!;
    h.storage.push(e.unlockObject);
    g.notify(`${getDef(e.unlockObject).name} liegt jetzt im Lager (Kaufmodus).`, '📦', s.id, 'good');
  }
  if (e.visitor && npc && g.hh?.lot) startVisit(g, npc, g.hh.lot, 150, false);
  if (e.flag) {
    g.flags[e.flag] = 1;
    g.bus.emit('flag', { id: e.flag });
  }
  if (e.breakObject && g.hh?.lot) {
    const opts = [...g.world.objs.values()].filter((o) => o.lot === g.hh!.lot && getDef(o.def).breaks && !o.st?.broken);
    const o = opts.length ? g.rng.pick(opts) : undefined;
    if (o) {
      o.st = { ...(o.st ?? {}), broken: true };
      g.world.touch(o.lot);
    }
  }
  if (e.promote) promote(g, s);
}

// ---------- Ereignisse ----------
export function checkCond(g: Game, c: Condition | undefined): boolean {
  if (!c) return true;
  const s = g.active;
  if (!s) return false;
  const h = g.hh;
  const hr = g.clock.hour;
  if (c.minDay !== undefined && g.clock.day < c.minDay) return false;
  if (c.hourFrom !== undefined && hr < c.hourFrom) return false;
  if (c.hourTo !== undefined && hr >= c.hourTo) return false;
  if (c.weekday && !c.weekday.includes(g.clock.weekday)) return false;
  if (c.season && !c.season.includes(g.clock.season)) return false;
  if (c.weather && !c.weather.includes(g.weather.now)) return false;
  if (c.minMoney !== undefined && (h?.funds ?? 0) < c.minMoney) return false;
  if (c.maxMoney !== undefined && (h?.funds ?? 0) > c.maxMoney) return false;
  if (c.hasCareer !== undefined && !!s.career !== c.hasCareer) return false;
  if (c.age && !c.age.includes(s.age)) return false;
  if (c.trait && !s.traits.includes(c.trait)) return false;
  if (c.minSkill) for (const [k, v] of Object.entries(c.minSkill)) if (g.skillLv(s, k as SkillId) < v) return false;
  if (c.hasPet !== undefined && !!h?.pets.length !== c.hasPet) return false;
  if (c.hasPartner !== undefined && !!g.partnerOf(s) !== c.hasPartner) return false;
  if (c.atHome && (!h?.lot || g.lotOf(s) !== h.lot)) return false;
  if (c.flag && !g.flags[c.flag]) return false;
  if (c.notFlag && g.flags[c.notFlag]) return false;
  if (c.minFriends !== undefined && g.friends(s).length < c.minFriends) return false;
  if (c.householdSize !== undefined && (h?.members.length ?? 0) < c.householdSize) return false;
  return true;
}

export const eventById = (id: string): EventDef | undefined => EVENTS.find((e) => e.id === id);

export function rollEvent(g: Game, force = false): boolean {
  if (g.pendingEvent || g.pendingStory) return false;
  const s = g.active;
  if (!s || s.away || s.trip || s.age === 'baby') return false;
  const now = g.clock.min;
  const ok = EVENTS.filter((e) => checkCond(g, e.cond) && (g.evCool[e.id] ?? -1e9) <= now);
  const ev = g.rng.weighted(ok, (e) => e.weight);
  if (!ev) return false;
  let npc: Sim | undefined;
  if (ev.npc !== 'none') {
    const known = g.known(s).filter((x) => isTownie(g, x) && x.age !== 'baby');
    const pool = ev.npc === 'known' && known.length ? known : [...g.sims.values()].filter((x) => isTownie(g, x) && x.age !== 'baby' && x.age !== 'toddler' && x.id !== s.id);
    if (!pool.length) return false;
    npc = g.rng.pick(pool);
  }
  g.pendingEvent = { id: ev.id, npc: npc?.id ?? null };
  g.evCool[ev.id] = now + ev.cooldownDays * 1440;
  void force;
  return true;
}

export function eventText(g: Game): { ev: EventDef; title: string; text: string; npc?: Sim } | null {
  const p = g.pendingEvent;
  const ev = p ? eventById(p.id) : undefined;
  if (!p || !ev) return null;
  const npc = g.sim(p.npc);
  return { ev, title: ev.title, text: fill(ev.text, g, npc), npc };
}

/** Wahl im Ereignisdialog anwenden; liefert Ergebnistext */
export function resolveEvent(g: Game, choice: number): string {
  const p = g.pendingEvent;
  const ev = p ? eventById(p.id) : undefined;
  g.pendingEvent = null;
  if (!p || !ev) return '';
  const npc = g.sim(p.npc);
  const ch = ev.choices[choice] ?? ev.choices[0]!;
  let ok = true;
  if (ch.chance !== undefined) {
    let pr = ch.chance;
    if (ch.chanceSkill && g.active) pr += g.skillLv(g.active, ch.chanceSkill) * 0.05;
    ok = g.rng.chance(Math.min(0.95, pr));
  }
  const key = `ev:${ev.id}:${g.clock.day}:${choice}`;
  applyEffect(g, ok ? ch.effect : (ch.failEffect ?? {}), npc, key);
  g.bus.emit('event', { id: ev.id, choice });
  return fill(ok ? ch.result : (ch.failResult ?? ch.result), g, npc);
}

// ---------- Geschichten ----------
export const storyById = (id: string | undefined): StoryDef | undefined => STORIES.find((s) => s.id === id);
export function questOf(g: Game): QuestDef | undefined {
  const st = storyById(g.story?.id);
  return st?.quests.find((q) => q.id === g.story?.quest);
}

/** Zählerschlüssel eines Ziels (für zählende Ziele) */
function counterKey(goal: QuestGoal): string | null {
  switch (goal.kind) {
    case 'interaction':
      return `int:${goal.id}`;
    case 'social':
      return goal.id ? `soc:${goal.id}` : 'soc:*';
    case 'buyObject':
      return goal.id ? (goal.id.startsWith('cat:') ? `buycat:${goal.id.slice(4)}` : `buy:${goal.id}`) : 'buy:*';
    case 'buildWalls':
      return 'build:wall';
    case 'visitLot':
      return `visit:${goal.id}`;
    case 'work':
      return 'work';
    case 'earn':
      return 'earned';
    case 'moveIn':
      return goal.id ? `moveIn:${goal.id}` : 'moveIn';
    case 'event':
      return `event:${goal.id}`;
    default:
      return null;
  }
}

/** Zimmer auf dem Grundstück (geschlossene Bereiche mit Boden) */
export function countRooms(g: Game, lot: string): number {
  const seen = new Set<number>();
  let n = 0;
  for (const k of g.world.floors.keys()) {
    if (seen.has(k)) continue;
    const l = Math.floor(k / (160 * 100));
    const rest = k - l * 160 * 100;
    const z = Math.floor(rest / 160),
      x = rest - z * 160;
    if (g.world.lotAt(x, z)?.id !== lot) continue;
    const cells = roomOf(g, l, x, z);
    if (!cells) {
      seen.add(k);
      continue;
    }
    for (const c of cells) seen.add(c);
    if (cells.length >= 3) n++;
  }
  return n;
}
import { roomCells } from './mind';
const roomOf = (g: Game, l: number, x: number, z: number): number[] | null => roomCells(g.world, l, x, z);

export function goalProgress(g: Game, goal: QuestGoal): number {
  const s = g.active;
  const key = counterKey(goal);
  if (key) return (g.stats[key] ?? 0) - (g.story?.base[key] ?? 0);
  if (!s) return 0;
  const mem = g.members();
  switch (goal.kind) {
    case 'skill':
      return Math.max(0, ...mem.map((m) => g.skillLv(m, goal.id as SkillId)));
    case 'friend':
      return Math.max(0, ...mem.map((m) => g.friends(m).filter((f) => f.hh !== m.hh).length));
    case 'friendWith':
      return Math.max(0, ...mem.map((m) => g.peekRel(m.id, goal.id!)?.f ?? 0));
    case 'romance':
      return Math.max(0, ...mem.map((m) => (goal.id ? (g.peekRel(m.id, goal.id)?.r ?? 0) : Math.max(0, ...[...g.rels.entries()].filter(([k]) => k.split('|').includes(m.id)).map(([, r]) => r.r)))));
    case 'money':
      return g.hh?.funds ?? 0;
    case 'career':
      return Math.max(0, ...mem.filter((m) => m.career && (!goal.id || m.career.id === goal.id)).map((m) => m.career!.level + 1));
    case 'homeValue':
      return g.hh?.lot ? g.world.lotValue(g.hh.lot) : 0;
    case 'meet':
      return Math.max(0, ...mem.map((m) => g.known(m).length));
    case 'buildRoom':
      return g.hh?.lot ? countRooms(g, g.hh.lot) : 0;
    case 'flag':
      return g.flags[goal.id!] ? 1 : 0;
    default:
      return 0;
  }
}

export function startQuest(g: Game, id: string): void {
  if (!g.story) return;
  g.story.quest = id;
  const q = questOf(g);
  if (!q) return;
  // Zählerstände merken
  g.story.base = {};
  for (const goal of q.goals) {
    const k = counterKey(goal);
    if (k) g.story.base[k] = g.stats[k] ?? 0;
  }
  g.pendingStory = { kind: 'intro', quest: id };
}

export function startStory(g: Game, id: string): void {
  const st = storyById(id);
  if (!st) return;
  g.story = { id, quest: st.firstQuest, base: {}, done: [], finished: false };
  startQuest(g, st.firstQuest);
}

function checkStory(g: Game): void {
  const st = g.story;
  if (!st || st.finished || g.pendingStory) return;
  const q = questOf(g);
  if (!q) return;
  if (q.goals.every((goal) => goalProgress(g, goal) >= goal.n)) {
    st.done.push(q.id);
    applyEffect(g, q.reward, g.sim(storyById(st.id)?.mentor), `quest:${q.id}`);
    g.notify(`Aufgabe geschafft: ${q.title}`, '🏆', undefined, 'good');
    g.pendingStory = { kind: q.branch ? 'branch' : 'outro', quest: q.id };
  }
}

/** Nach dem Abschlussdialog (bzw. der Wahl bei Verzweigung) weiter */
export function storyContinue(g: Game, branch?: number): void {
  const st = g.story;
  const p = g.pendingStory;
  g.pendingStory = null;
  if (!st || !p) return;
  if (p.kind === 'intro' || p.kind === 'finale') return;
  const q = storyById(st.id)?.quests.find((x) => x.id === p.quest);
  if (!q) return;
  const next = q.branch ? q.branch[branch ?? 0]?.next : q.next;
  if (next) startQuest(g, next);
  else {
    st.finished = true;
    g.pendingStory = { kind: 'finale', quest: q.id };
    for (const m of g.members()) g.memory(m, `Geschichte abgeschlossen: ${storyById(st.id)?.title}`, '🏆', true);
  }
}

// ---------- Lebensziele ----------
export function aspirationProgress(g: Game, s: Sim, goal: { kind: string; id?: string; n: number }): number {
  const kids = [...g.sims.values()].filter((x) => x.parents.includes(s.id)).length;
  switch (goal.kind) {
    case 'partner':
      return g.partnerOf(s) ? 1 : 0;
    case 'children':
      return kids;
    case 'careerLevel':
      return s.career ? s.career.level + 1 : 0;
    case 'money':
      return s.hh ? (g.hhs.get(s.hh)?.funds ?? 0) : 0;
    case 'creativeSkill':
      return Math.max(...CREATIVE.map((k) => g.skillLv(s, k)));
    case 'soldArt':
      return s.flags.soldArt ?? 0;
    case 'dates':
      return s.flags.dates ?? 0;
    case 'engaged': {
      const p = g.partnerOf(s);
      const r = p ? g.peekRel(s.id, p.id) : undefined;
      return r?.k === 'engaged' || r?.k === 'married' ? 1 : 0;
    }
    case 'married': {
      const p = g.partnerOf(s);
      return p && g.peekRel(s.id, p.id)?.k === 'married' ? 1 : 0;
    }
    case 'skillsAt3':
      return (Object.keys(SKILLS) as SkillId[]).filter((k) => g.skillLv(s, k) >= 3).length;
    case 'skillsAt5':
      return (Object.keys(SKILLS) as SkillId[]).filter((k) => g.skillLv(s, k) >= 5).length;
    case 'skill':
      return g.skillLv(s, goal.id as SkillId);
    case 'friends':
      return g.friends(s).length;
    case 'meet':
      return g.known(s).length;
    case 'homeValue':
      return s.hh && g.hhs.get(s.hh)?.lot ? g.world.lotValue(g.hhs.get(s.hh)!.lot!) : 0;
    default:
      return 0;
  }
}

function checkAspirations(g: Game): void {
  for (const s of g.members()) {
    const a = ASPIRATIONS.find((x) => x.id === s.aspiration);
    if (!a || s.aspStep >= a.goals.length) continue;
    const goal = a.goals[s.aspStep]!;
    if (aspirationProgress(g, s, goal) >= goal.n) {
      s.aspStep++;
      g.addMood(s, 'proud', { hours: 8 });
      g.memory(s, `Lebensziel-Meilenstein: ${goal.label}`, a.icon, true);
      if (s.hh) g.money(s.hh, 300 * s.aspStep, `Lebensziel-Bonus: ${a.name}`, `asp:${s.id}:${s.aspStep}`);
      g.notify(`${s.first}: Meilenstein „${goal.label}“ erreicht!${s.aspStep >= a.goals.length ? ` Lebensziel „${a.name}“ erfüllt!` : ''}`, a.icon, s.id, 'good');
    }
  }
}

export function installStories(g: Game): void {
  installStats(g);
  g.bus.on('social', (e) => {
    const s = g.sim(e.sim);
    if (s && e.ok && e.id === 'askOut') s.flags.dates = (s.flags.dates ?? 0) + 1;
  });
  g.systems.push({
    name: 'stories',
    minute: (g2) => {
      if (g2.clock.min % 3 < 1) checkStory(g2);
    },
    hourly: (g2) => {
      checkAspirations(g2);
      if (g2.settings.events && g2.clock.min >= g2.nextEventAt && g2.clock.hour >= 8 && g2.clock.hour < 22) {
        if (g2.rng.chance(0.4) && rollEvent(g2)) g2.nextEventAt = g2.clock.min + g2.rng.int(5 * 60, 12 * 60);
      }
    },
  });
}
