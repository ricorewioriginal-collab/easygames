// Ereignisbus: Spielereignisse für Geschichten, Lebensziele, Tagebuch und Mehrspieler.
export interface BusEvents {
  interaction: { sim: string; id: string; obj?: string; target?: string };
  social: { sim: string; target: string; id: string; ok: boolean };
  skill: { sim: string; skill: string; level: number };
  money: { hh: string; amount: number; label: string };
  buy: { hh: string; def: string; cat: string; price: number };
  build: { hh: string; kind: 'wall' | 'floor' | 'door' | 'window' | 'stairs' | 'delete' | 'paint'; n: number };
  visit: { sim: string; lot: string };
  career: { sim: string; career: string; level: number; kind: 'join' | 'promote' | 'demote' | 'fired' | 'quit' };
  work: { sim: string; career: string; pay: number };
  moveIn: { hh: string; lot: string };
  event: { id: string; choice: number };
  meet: { sim: string; target: string };
  flag: { id: string };
  life: { sim: string; kind: 'birthday' | 'baby' | 'adopt' | 'wedding' | 'engaged' | 'farewell' | 'partner' | 'breakup'; other?: string };
  notify: { text: string; icon?: string; sim?: string; kind?: 'info' | 'good' | 'bad' | 'warn' };
  worldChanged: { lot: string };
}

type Handler<T> = (p: T) => void;

export class Bus {
  private h = new Map<string, Set<Handler<never>>>();
  on<K extends keyof BusEvents>(k: K, fn: Handler<BusEvents[K]>): () => void {
    let s = this.h.get(k);
    if (!s) this.h.set(k, (s = new Set()));
    s.add(fn as Handler<never>);
    return () => s!.delete(fn as Handler<never>);
  }
  emit<K extends keyof BusEvents>(k: K, p: BusEvents[K]): void {
    const s = this.h.get(k);
    if (!s) return;
    for (const fn of [...s]) {
      try {
        (fn as Handler<BusEvents[K]>)(p);
      } catch (e) {
        console.error('[bus]', k, e);
      }
    }
  }
}
