/* Typisierter Ereignisbus: Gameplay-Systeme melden Ereignisse, Quests/Erfolge/UI hören zu – keine Querverweise nötig. */
export interface GameEvents {
  talk: { npc: string };
  reach: { poi: string; world: string };
  enterWorld: { world: string };
  interact: { id: string; kind: string };
  item: { id: string; count: number; total: number };
  itemUsed: { id: string };
  deliver: { npc: string; item: string };
  defeat: { enemy: string; boss: boolean };
  minigame: { id: string; score: number; win: boolean };
  vehicle: { type: string };
  flag: { id: string };
  ability: { id: string };
  questStage: { quest: string; stage: number };
  questDone: { quest: string };
  levelUp: { level: number };
  stars: { delta: number; total: number };
  collect: { kind: string; id: string };
  photo: { subject: string };
  emote: { id: string };
  discover: { id: string };
  achievement: { id: string };
  friendship: { npc: string; level: number };
  sleep: Record<string, never>;
  fish: { id: string; size: number };
  dayChange: { day: number };
}
type Handler<K extends keyof GameEvents> = (e: GameEvents[K]) => void;
export class EventBus {
  private map = new Map<keyof GameEvents, Set<Handler<any>>>();
  on<K extends keyof GameEvents>(k: K, fn: Handler<K>): () => void {
    let s = this.map.get(k);
    if (!s) { s = new Set(); this.map.set(k, s); }
    s.add(fn);
    return () => s!.delete(fn);
  }
  emit<K extends keyof GameEvents>(k: K, e: GameEvents[K]): void {
    const s = this.map.get(k);
    if (!s) return;
    for (const fn of [...s]) {
      try { fn(e); } catch (err) { console.error('[Ereignis ' + String(k) + ']', err); }
    }
  }
  clear(): void { this.map.clear(); }
}
