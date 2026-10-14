/* Bedingungen und Aktionen – gemeinsame Sprache für Dialoge, Quests und Welt-Interaktionen. Rein datengetrieben. */
import type { SaveData } from '../persistence/save.ts';

export interface Cond {
  flag?: string; noflag?: string; flagMin?: [string, number];
  quest?: string; stage?: number; stageMin?: number; stageMax?: number;
  done?: string; notDone?: string; active?: string; notStarted?: string;
  has?: string; n?: number; hasNot?: string;
  mode?: 'story' | 'free';
  chapterMin?: number; chapterMax?: number;
  friendMin?: [string, number];
  ability?: string; noAbility?: string;
  stars?: number;
  night?: boolean;
  all?: Cond[]; any?: Cond[]; not?: Cond;
}
export interface Action {
  give?: [string, number?]; take?: [string, number?];
  stars?: number; xp?: number; spend?: number;
  flag?: string; unflag?: string; setFlag?: [string, number];
  start?: string;                  // Quest starten
  obj?: [string, string];          // Quest-Ziel abhaken [questId, objId]
  ability?: string; cosmetic?: string;
  friend?: number;                 // Freundschaft mit der aktuellen Figur
  panel?: string; panelArg?: unknown;
  shop?: string;
  minigame?: string;
  achieve?: string;
  companion?: string;
  chapter?: number;                // Story-Kapitel setzen
  choice?: [string, string];       // Story-Entscheidung merken
  sfx?: string;
  burst?: boolean;
  night?: boolean; day?: boolean;
  teleport?: [number, number, number?];
  toast?: string;
}

export interface ScriptCtx {
  save: SaveData;
  npc?: string;
  isNight(): boolean;
}
export function check(c: Cond | undefined, x: ScriptCtx): boolean {
  if (!c) return true;
  if (!x.save) return false;
  const s = x.save, q = (id: string) => s.quests[id];
  if (c.flag && !(s.flags[c.flag] > 0)) return false;
  if (c.noflag && s.flags[c.noflag] > 0) return false;
  if (c.flagMin && (s.flags[c.flagMin[0]] ?? 0) < c.flagMin[1]) return false;
  if (c.quest) {
    const st = q(c.quest);
    const stage = st ? (st.done ? 999 : st.stage) : -1;
    if (c.stage !== undefined && stage !== c.stage) return false;
    if (c.stageMin !== undefined && stage < c.stageMin) return false;
    if (c.stageMax !== undefined && stage > c.stageMax) return false;
  }
  if (c.done && !q(c.done)?.done) return false;
  if (c.notDone && q(c.notDone)?.done) return false;
  if (c.active) { const st = q(c.active); if (!st || st.done) return false; }
  if (c.notStarted && q(c.notStarted)) return false;
  if (c.has && (s.inventory[c.has] ?? 0) < (c.n ?? 1)) return false;
  if (c.hasNot && (s.inventory[c.hasNot] ?? 0) > 0) return false;
  if (c.mode && s.mode !== c.mode) return false;
  if (c.chapterMin !== undefined && (s.mode !== 'story' || s.story.chapter < c.chapterMin)) return false;
  if (c.chapterMax !== undefined && s.mode === 'story' && s.story.chapter > c.chapterMax) return false;
  if (c.friendMin && (s.npcs[c.friendMin[0]]?.friend ?? 0) < c.friendMin[1]) return false;
  if (c.ability && !s.abilities.includes(c.ability)) return false;
  if (c.noAbility && s.abilities.includes(c.noAbility)) return false;
  if (c.stars !== undefined && s.stars < c.stars) return false;
  if (c.night !== undefined && x.isNight() !== c.night) return false;
  if (c.all && !c.all.every(k => check(k, x))) return false;
  if (c.any && !c.any.some(k => check(k, x))) return false;
  if (c.not && check(c.not, x)) return false;
  return true;
}
