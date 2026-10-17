// Handy-Funktionen der Simulation: Anrufen, Einkaufen mit Lieferung, Jobsuche (Logik ohne Oberfläche).
import { ITEMS } from '../data/moodlets';
import { def } from './interact';
import { nextActionUid, type Game } from './game';
import type { Sim } from './types';

export const SHOP_ITEMS = ITEMS.filter((i) => i.price > 0);

def({
  id: 'phoneCall', label: (c) => `Anrufen: ${c.g.name(String(c.a?.data?.who ?? ''))}`, icon: '📞', on: 'self', hidden: true, auto: false,
  ages: ['child', 'teen', 'youngadult', 'adult', 'senior'],
  route: () => null, dur: 20, anim: 'phone', prop: 'phone', rate: { social: 1.1, fun: 0.3 },
  start: (c) => {
    const o = c.g.sim(String(c.a.data?.who ?? ''));
    if (!o) return 'Niemand erreichbar';
    if (o.away?.kind === 'work' || o.queue[0]?.def === 'sleep') return `${o.first} geht gerade nicht ran`;
  },
  done: (c) => {
    const o = c.g.sim(String(c.a.data?.who ?? ''));
    if (!o) return;
    const r = c.g.rel(c.s.id, o.id);
    r.met = true;
    r.f = Math.min(100, r.f + 3);
    r.last = c.g.clock.min;
    o.needs.social = Math.min(100, o.needs.social + 15);
    c.g.relHistory(c.s.id, o.id, 'haben telefoniert');
    c.g.bus.emit('social', { sim: c.s.id, target: o.id, id: 'chat', ok: true });
  },
});

export function call(_g: Game, s: Sim, whoId: string): void {
  s.queue.push({ uid: nextActionUid(), def: 'phoneCall', phase: 'queued', t: 0, dur: 0, user: true, data: { who: whoId } });
}

/** Lieferung ins Inventar (Geschenke, Snacks, Ring) */
export function buyItem(g: Game, s: Sim, id: string, n = 1): string | true {
  const it = SHOP_ITEMS.find((x) => x.id === id);
  if (!it || !s.hh) return 'Nicht verfügbar';
  if (!g.money(s.hh, -it.price * n, `Einkauf: ${n}× ${it.name}`)) return 'Nicht genug RicoTaler';
  g.giveItem(s, id, n);
  g.bus.emit('interaction', { sim: s.id, id: 'shopItem' });
  return true;
}
