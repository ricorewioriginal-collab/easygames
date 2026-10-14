/* Quest-System: Abenteuer mit Anlass, Ziel, Herausforderung, Lösungsweg, Konsequenz und Belohnung.
   Ziele werden über Ereignisse erfüllt (reden, erreichen, sammeln, benutzen, Minispiel, Kampf im Wald, Flags).
   Reine Logik (ohne Three.js) – testbar. */
import type { Action, Cond } from './script.ts';
import type { QuestState, SaveData } from '../persistence/save.ts';

export type ObjType = 'talk' | 'reach' | 'collect' | 'interact' | 'defeat' | 'minigame' | 'flag' | 'enter' | 'vehicle' | 'manual' | 'have' | 'fish' | 'discover' | 'photo' | 'emote';
export interface Objective {
  id: string;
  type: ObjType;
  target: string;          // NPC-ID, POI-ID ("welt:poi"), Gegenstand, Interaktions-ID, Gegnerart ('*' = jede), Minispiel, Flag, Welt
  n?: number;              // Anzahl (sammeln, besiegen)
  label: string;
  at?: { x: number; z: number; r?: number };
  /** Interaktions-ID (oder Anfang davon), auf die die Zielmarkierung zeigt. */
  via?: string;
  optional?: boolean;
}
export interface DialogTree { [node: string]: DNode }
export interface DNode {
  t?: string | string[];
  who?: string;            // anderer Sprecher (NPC-ID oder 'player')
  next?: string;
  choices?: DChoice[];
  do?: Action[];
  branch?: { if: Cond; to: string }[];
  emote?: string;
  end?: boolean;
}
export interface DChoice { t: string; to?: string; if?: Cond; do?: Action[]; note?: string }
export interface Stage {
  text: string;
  hints: [string, string, string];
  objectives: Objective[];
  /** Gespräche, die in dieser Phase Vorrang haben (NPC-ID → Dialogbaum mit 'start'). */
  dialog?: Record<string, DialogTree>;
  onStart?: Action[];
  onDone?: Action[];
  /** Nach dieser Phase: ‚Konsequenz‘-Text im Tagebuch */
  outcome?: string;
}
export interface QuestDef {
  id: string;
  title: string;
  icon: string;
  world: string;
  kind: 'main' | 'world' | 'side';
  giver?: string;
  chapter?: number;           // Story-Kapitel (nur main)
  modes?: ('story' | 'free')[];
  requires?: Cond;
  summary: string;
  /** Angebot beim Auftraggeber (Dialog, endet mit start). */
  offer?: DialogTree;
  stages: Stage[];
  rewards: { stars?: number; xp?: number; items?: [string, number][]; ability?: string; cosmetic?: string; flag?: string; text?: string };
}

export interface QuestHost {
  save: SaveData;
  now(): number;
  reward(q: QuestDef): void;
  run(actions: Action[] | undefined, npc?: string): void;
  notify(kind: 'start' | 'stage' | 'obj' | 'done', q: QuestDef, extra?: string): void;
  check(c: Cond | undefined): boolean;
  pos(): { x: number; z: number };
  world(): string;
}

export class QuestEngine {
  readonly defs = new Map<string, QuestDef>();
  constructor(private host: QuestHost) { }
  register(list: QuestDef[]): void { for (const q of list) this.defs.set(q.id, q); }
  get save(): SaveData { return this.host.save; }
  state(id: string): QuestState | undefined { return this.save.quests[id]; }
  isActive(id: string): boolean { const s = this.state(id); return !!s && !s.done; }
  isDone(id: string): boolean { return !!this.state(id)?.done; }
  available(q: QuestDef): boolean {
    if (this.state(q.id)) return false;
    if (q.modes && !q.modes.includes(this.save.mode)) return false;
    if (q.kind === 'main' && this.save.mode !== 'story') return false;
    return this.host.check(q.requires);
  }
  start(id: string): boolean {
    const q = this.defs.get(id);
    if (!q || this.state(id)) return false;
    this.save.quests[id] = { stage: 0, progress: {}, done: false, started: this.host.now(), hints: 0 };
    if (!this.save.tracked || q.kind === 'main') this.save.tracked = id;
    this.host.notify('start', q);
    this.enterStage(q, 0);
    return true;
  }
  private enterStage(q: QuestDef, i: number): void {
    const st = q.stages[i];
    this.host.run(st.onStart);
    // Ziele, die schon erfüllt sind (z. B. Gegenstand schon im Rucksack), sofort abhaken
    this.recheck(q);
  }
  stageOf(id: string): Stage | null {
    const q = this.defs.get(id), s = this.state(id);
    if (!q || !s || s.done) return null;
    return q.stages[s.stage] ?? null;
  }
  objDone(qid: string, o: Objective): boolean {
    const s = this.state(qid);
    if (!s) return false;
    return (s.progress[o.id] ?? 0) >= (o.n ?? 1);
  }
  /** Fortschritt eines Ziels erhöhen. */
  progress(qid: string, objId: string, amount = 1, absolute = false): void {
    const q = this.defs.get(qid), s = this.state(qid);
    if (!q || !s || s.done) return;
    const st = q.stages[s.stage];
    const o = st.objectives.find(x => x.id === objId);
    if (!o) return;
    const need = o.n ?? 1, before = s.progress[o.id] ?? 0;
    if (before >= need) return;
    s.progress[o.id] = Math.min(need, absolute ? amount : before + amount);
    if (s.progress[o.id] >= need) this.host.notify('obj', q, o.label);
    else if (need > 1) this.host.notify('obj', q, o.label + ' (' + s.progress[o.id] + '/' + need + ')');
    this.tryAdvance(q);
  }
  private tryAdvance(q: QuestDef): void {
    const s = this.state(q.id)!;
    const st = q.stages[s.stage];
    if (!st.objectives.every(o => o.optional || this.objDone(q.id, o))) return;
    this.host.run(st.onDone);
    if (s.stage + 1 >= q.stages.length) {
      s.done = true;
      if (this.save.tracked === q.id) this.save.tracked = this.nextTracked();
      this.host.reward(q);
      this.host.notify('done', q);
      return;
    }
    s.stage++;
    s.progress = {};
    this.host.notify('stage', q);
    this.enterStage(q, s.stage);
  }
  private nextTracked(): string | null {
    let best: string | null = null;
    for (const [id, st] of Object.entries(this.save.quests)) {
      if (st.done) continue;
      const q = this.defs.get(id);
      if (!q) continue;
      if (q.kind === 'main') return id;
      best ??= id;
    }
    return best;
  }
  /** Ereignis an alle aktiven Ziele verteilen. */
  event(type: ObjType, target: string, amount = 1): void {
    for (const [id, s] of Object.entries(this.save.quests)) {
      if (s.done) continue;
      const q = this.defs.get(id);
      if (!q) continue;
      const st = q.stages[s.stage];
      for (const o of st.objectives) {
        if (o.type !== type) continue;
        if (o.target !== target && o.target !== '*') continue;
        this.progress(id, o.id, amount);
      }
    }
  }
  /** Zustandsziele (Gegenstand besitzen, Flag gesetzt, Ort erreicht) erneut prüfen. */
  recheck(only?: QuestDef): void {
    const list = only ? [only] : [...this.defs.values()];
    const p = this.host.pos();
    for (const q of list) {
      const s = this.state(q.id);
      if (!s || s.done) continue;
      const st = q.stages[s.stage];
      for (const o of st.objectives) {
        if (this.objDone(q.id, o)) continue;
        if (o.type === 'have' || o.type === 'collect') {
          if (o.type === 'have' || o.target.startsWith('item:')) {
            const item = o.target.replace(/^item:/, '');
            const have = this.save.inventory[item] ?? 0;
            if (have > (s.progress[o.id] ?? 0)) this.progress(q.id, o.id, have, true);
          }
        } else if (o.type === 'flag') {
          if ((this.save.flags[o.target] ?? 0) > 0) this.progress(q.id, o.id, o.n ?? 1, true);
        } else if (o.type === 'reach' && o.at) {
          if (Math.hypot(p.x - o.at.x, p.z - o.at.z) < (o.at.r ?? 6)) this.progress(q.id, o.id, 1, true);
        } else if (o.type === 'enter') {
          if (this.host.world() === o.target || this.save.visited.includes(o.target) && o.n === 0) this.progress(q.id, o.id, 1, true);
        } else if (o.type === 'discover') {
          if (this.save.discovered.includes(o.target)) this.progress(q.id, o.id, 1, true);
        }
        if (!this.state(q.id) || this.state(q.id)!.done) break;
        if (this.state(q.id)!.stage !== s.stage) break;
      }
    }
  }
  /** Nächstes offenes Ziel der verfolgten Quest (für Anzeige und Pfeil). */
  trackedObjective(): { q: QuestDef; st: Stage; o: Objective | null } | null {
    const id = this.save.tracked;
    if (!id) return null;
    const q = this.defs.get(id), s = this.state(id);
    if (!q || !s || s.done) return null;
    const st = q.stages[s.stage];
    const o = st.objectives.find(x => !x.optional && !this.objDone(id, x)) ?? null;
    return { q, st, o };
  }
  useHint(id: string): number {
    const s = this.state(id);
    if (!s) return 0;
    s.hints = Math.min(3, (s.hints ?? 0) + 1);
    return s.hints;
  }
  /** Dialog-Überschreibungen aktiver Quests für eine Figur. */
  dialogFor(npc: string): { q: QuestDef; tree: DialogTree } | null {
    for (const [id, s] of Object.entries(this.save.quests)) {
      if (s.done) continue;
      const q = this.defs.get(id);
      const tree = q?.stages[s.stage]?.dialog?.[npc];
      if (q && tree) return { q, tree };
    }
    return null;
  }
  /** Quests, die diese Figur gerade anbieten kann. */
  offersFrom(npc: string): QuestDef[] {
    return [...this.defs.values()].filter(q => q.giver === npc && this.available(q));
  }
  list(filter: 'active' | 'done' | 'all' = 'all'): QuestDef[] {
    return [...this.defs.values()].filter(q => {
      const s = this.state(q.id);
      if (!s) return false;
      return filter === 'all' || (filter === 'active' ? !s.done : s.done);
    });
  }
}
