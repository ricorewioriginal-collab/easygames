// Simulationskern: Kochen→Essen→Abwasch, Warteschlange, Reservierungen, Geld ohne Doppelbuchung, Beziehungen,
// Spielstände (Hin- und Rückweg), Geschichten-Fortschritt und ein langer Lauf ohne Fehler.
import { beforeAll, describe, expect, it } from 'vitest';
import { STORIES } from '../src/data/stories';
import { Game } from '../src/sim/game';
import { deserialize, serialize, validate, applyLot, lotData } from '../src/sim/save';
import { createGame } from '../src/sim/setup';
import type { Sim } from '../src/sim/types';
import { NEED_IDS } from '../src/data/types';
import { sanitizeCard } from '../src/net/mp';
import { throwParty } from '../src/sim/npcs';
import { joinCareer } from '../src/sim/career';
import { offerWish, wishDef, wishAction, MAX_WISHES } from '../src/sim/wishes';
import { idef } from '../src/sim/interact';

let base: Game;
const fresh = (o: Parameters<typeof createGame>[0] = {}): Game => createGame({ household: 'hh-sonnberg', seed: 11, ...o });

/** simuliert n Spielminuten in kleinen Schritten */
function run(g: Game, minutes: number, step = 0.5): void {
  for (let t = 0; t < minutes; t += step) g.step(step);
}
function adult(g: Game): Sim {
  return g.members().find((m) => g.isAdult(m))!;
}

beforeAll(() => {
  base = fresh();
});

describe('Spielstart', () => {
  it('hat Haushalt, Grundstück, aktive Figur und viele Stadtbewohner', () => {
    expect(base.hh?.lot).toBeTruthy();
    expect(base.active).toBeTruthy();
    expect(base.members().length).toBeGreaterThan(0);
    const npcs = [...base.sims.values()].filter((s) => s.npc);
    expect(npcs.length).toBeGreaterThanOrEqual(40);
  });
});

describe('Kochen → Essen → Abwasch', () => {
  it('läuft durch und hinterlässt kein schmutziges Geschirr', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    g.activeSim = s.id;
    for (const n of NEED_IDS) s.needs[n] = 90;
    s.needs.hunger = 20;
    const fridge = g.objsWith(g.hh!.lot, 'fridge')[0]!;
    expect(fridge).toBeTruthy();
    const seen: string[] = [];
    g.bus.on('interaction', (e) => e.sim === s.id && seen.push(e.id));
    expect(g.queueAction(s, 'cook', { user: true, obj: fridge.id, data: { recipe: 'toast' } })).toBeTruthy();
    run(g, 120);
    expect(seen).toContain('cook');
    expect(s.needs.hunger).toBeGreaterThan(40);
    // Abwasch: schmutzige Teller werden gespült
    for (let i = 0; i < 4; i++) {
      const dirty = [...g.world.objs.values()].find((o) => o.def === 'prop-dirty' && o.lot === g.hh!.lot);
      if (!dirty) break;
      g.queueAction(s, 'washDishes', { user: true, obj: dirty.id });
      run(g, 30);
    }
    expect([...g.world.objs.values()].some((o) => o.def === 'prop-dirty' && o.lot === g.hh!.lot)).toBe(false);
  });
});

describe('Warteschlange', () => {
  it('nimmt mindestens vier Befehle an und kann abbrechen', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    const fridge = g.objsWith(g.hh!.lot, 'fridge')[0]!;
    const a = ['toast', 'cereal', 'toast', 'cereal'].map((r) => g.queueAction(s, 'cook', { user: true, obj: fridge.id, data: { recipe: r } }));
    expect(a.every(Boolean)).toBe(true);
    expect(s.queue.length).toBe(4);
    g.cancelAction(s, a[3]!.uid);
    expect(s.queue.length).toBe(3);
    g.cancelAction(s, a[0]!.uid);
    run(g, 2);
    expect(s.queue.find((x) => x.uid === a[0]!.uid && x.phase !== 'done')).toBeUndefined();
  });
});

describe('Reservierungen', () => {
  it('ein Platz gehört nur einer Figur', () => {
    const g = fresh();
    const [a, b] = g.members();
    const bed = g.objsWith(g.hh!.lot, 'bed')[0]!;
    expect(g.reserve(bed, 0, a!.id)).toBe(true);
    a!.queue.push({ uid: 999, def: 'sleep', obj: bed.id, slot: 0, phase: 'route', t: 0, dur: 0, user: true });
    expect(g.reserve(bed, 0, b!.id)).toBe(false);
    expect(g.isReserved(bed, 0, b!.id)).toBe(true);
    g.release(a!.id);
    expect(g.isReserved(bed, 0, b!.id)).toBe(false);
  });
});

describe('Geld', () => {
  it('bucht mit Schlüssel nur einmal und erlaubt kein Minus', () => {
    const g = fresh();
    const h = g.hh!;
    const f0 = h.funds;
    expect(g.money(h.id, 100, 'Test', 'k1')).toBe(true);
    expect(g.money(h.id, 100, 'Test', 'k1')).toBe(false);
    expect(h.funds).toBe(f0 + 100);
    expect(g.money(h.id, -(h.funds + 1), 'Zu teuer')).toBe(false);
    expect(h.funds).toBe(f0 + 100);
  });
  it('Rechnungen kommen wöchentlich', () => {
    const g = fresh();
    run(g, 60 * 24 * 8, 2);
    expect(g.hh!.ledger.some((t) => /Rechnung/i.test(t.t)) || !!g.hh!.bills).toBe(true);
  });
});

describe('Beziehungen', () => {
  it('Gespräche verändern Freundschaft und Bekanntschaft', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    const other = [...g.sims.values()].find((x) => x.npc && g.isAdult(x) && !x.away)!;
    other.x = s.x + 1;
    other.z = s.z;
    other.l = s.l;
    other.loc = g.hh!.lot!;
    other.visit = { lot: g.hh!.lot!, until: g.clock.min + 600 };
    other.rt.spawned = true;
    const before = g.peekRel(s.id, other.id)?.f ?? 0;
    g.queueAction(s, 'soc:introduce', { user: true, target: other.id });
    run(g, 20);
    g.queueAction(s, 'soc:chat', { user: true, target: other.id });
    run(g, 60);
    const r = g.peekRel(s.id, other.id);
    expect(r?.met).toBe(true);
    expect(r!.f).not.toBe(before);
  });
});

describe('Spielstand', () => {
  it('Hin- und Rückweg erhalten den Zustand', () => {
    const g = fresh();
    run(g, 90);
    const d = serialize(g);
    expect(validate(d)).toBeNull();
    const json = JSON.parse(JSON.stringify(d));
    const g2 = deserialize(json);
    expect(g2.clock.min).toBeCloseTo(g.clock.min, 0);
    expect(g2.hh!.funds).toBe(g.hh!.funds);
    expect(g2.members().map((m) => m.id)).toEqual(g.members().map((m) => m.id));
    expect(g2.sims.size).toBe([...g.sims.values()].filter((s) => !s.guest).length);
    // Wände/Objekte des eigenen Grundstücks identisch
    const a = lotData(g, g.hh!.lot!)!,
      b = lotData(g2, g2.hh!.lot!)!;
    expect(b.walls.length).toBe(a.walls.length);
    expect(b.objs.map((o) => o.def).sort()).toEqual(a.objs.map((o) => o.def).sort());
  });
  it('lehnt fremde, kaputte und zu neue Dateien ab', () => {
    expect(validate(null)).toBeTruthy();
    expect(validate({ game: 'andere' })).toBeTruthy();
    const d = serialize(base);
    expect(validate({ ...d, v: 999 })).toMatch(/neueren Version/);
    expect(validate({ ...d, sims: [{}] })).toBeTruthy();
  });
  it('Grundstücksabgleich (Mehrspieler) baut identisch nach', () => {
    const g = fresh();
    const lot = g.hh!.lot!;
    const d = lotData(g, lot)!;
    const g2 = fresh({ seed: 99 });
    applyLot(g2, lot, JSON.parse(JSON.stringify(d)));
    expect(lotData(g2, lot)!.objs.length).toBe(d.objs.length);
  });
});

describe('Geschichten', () => {
  it('jede Geschichte startet mit einer Aufgabe', () => {
    for (const st of STORIES) {
      const g = st.household ? createGame({ story: st.id, seed: 3, slot: 1 }) : createGame({ story: st.id, seed: 3, slot: 1, custom: { name: 'Test', members: [{ first: 'Alex', last: 'Test', pronoun: 'they', age: 'adult', traits: [], aspiration: 'friends', look: base.active!.look }] } });
      expect(g.story?.id).toBe(st.id);
      expect(g.story?.quest).toBeTruthy();
    }
  });
});

describe('Wünsche', () => {
  it('Haushaltsmitglieder bekommen nach ein paar Stunden Wünsche', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    run(g, 60 * 3, 1);
    const s = adult(g);
    expect(s.wishes?.length ?? 0).toBeGreaterThan(0);
    expect(s.wishes!.length).toBeLessThanOrEqual(MAX_WISHES);
    for (const m of g.members()) if (m.age === 'baby' || m.age === 'toddler') expect(m.wishes?.length ?? 0).toBe(0);
  });
  it('bietet nur erfüllbare Wünsche an', () => {
    const g = fresh();
    const s = adult(g);
    const lot = g.hh!.lot!;
    for (let i = 0; i < 40; i++) {
      s.wishes = [];
      const w = offerWish(g, s)!;
      expect(w).toBeTruthy();
      const d = wishDef(w.k)!;
      if (w.k === 'pet') expect(g.hh!.pets.length).toBeGreaterThan(0);
      if (w.k === 'work' || w.k === 'promote') expect(s.career).toBeTruthy();
      const func = d.use ? idef(d.use)?.func : undefined;
      if (func) expect(func.some((f) => g.objsWith(lot, f).length > 0)).toBe(true);
      if (w.t && (w.k === 'chat' || w.k === 'hug' || w.k === 'kiss')) expect(g.sims.has(w.t)).toBe(true);
    }
  });
  it('Erfüllen entfernt den Wunsch, gibt Punkte und Stimmung', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    const other = [...g.sims.values()].find((o) => o.id !== s.id && o.age !== 'baby')!;
    s.wishes = [
      { k: 'cook', until: g.clock.min + 600 },
      { k: 'chat', t: other.id, until: g.clock.min + 600 },
    ];
    s.wishPoints = 0;
    g.bus.emit('interaction', { sim: s.id, id: 'cook' });
    expect(s.wishes.map((w) => w.k)).toEqual(['chat']);
    expect(s.wishPoints).toBe(wishDef('cook')!.pts);
    expect(s.moods.some((m) => m.id === 'wishgranted')).toBe(true);
    expect(s.rt.bubble?.icon).toBe('✨');
    g.bus.emit('social', { sim: s.id, target: other.id, id: 'insult', ok: true });
    expect(s.wishes.length).toBe(1);
    g.bus.emit('social', { sim: s.id, target: other.id, id: 'chat', ok: true });
    expect(s.wishes.length).toBe(0);
    expect(s.wishPoints).toBe(wishDef('cook')!.pts + wishDef('chat')!.pts);
  });
  it('echtes Kochen erfüllt den Kochwunsch; Klick findet die Handlung', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    for (const n of NEED_IDS) s.needs[n] = 90;
    s.wishes = [{ k: 'cook', until: g.clock.min + 600 }];
    const act = wishAction(g, s, s.wishes[0]!);
    expect(act?.it.def).toBe('cook');
    const fridge = g.objsWith(g.hh!.lot, 'fridge')[0]!;
    g.queueAction(s, 'cook', { user: true, obj: fridge.id, data: { recipe: 'toast' } });
    run(g, 90);
    expect(s.wishes.some((w) => w.k === 'cook')).toBe(false);
    expect(s.wishPoints).toBeGreaterThanOrEqual(wishDef('cook')!.pts);
  });
  it('abgelaufene Wünsche verschwinden', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    s.wishes = [{ k: 'tv', until: g.clock.min + 10 }];
    s.flags.wishAt = g.clock.min + 6000;
    run(g, 70, 1);
    expect(s.wishes.some((w) => w.k === 'tv')).toBe(false);
  });
  it('Gedankenblase zeigt das dringendste Bedürfnis', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    for (const n of NEED_IDS) s.needs[n] = 90;
    s.needs.hunger = 12;
    const seen = new Set<string>();
    for (let t = 0; t < 60; t++) {
      g.step(1);
      s.needs.hunger = 12;
      if (s.rt.bubble) seen.add(s.rt.bubble.icon);
    }
    expect(seen.has('🍽️')).toBe(true);
  });
  it('Spielstand behält Wünsche; alte Stände ohne Wünsche laden', () => {
    const g = fresh();
    const s = adult(g);
    s.wishes = [{ k: 'read', until: g.clock.min + 600 }];
    s.wishPoints = 42;
    const json = JSON.parse(JSON.stringify(serialize(g)));
    const g2 = deserialize(json);
    expect(g2.sim(s.id)!.wishes).toEqual(s.wishes);
    expect(g2.sim(s.id)!.wishPoints).toBe(42);
    for (const x of json.sims) {
      delete x.wishes;
      delete x.wishPoints;
    }
    expect(validate(json)).toBeNull();
    const g3 = deserialize(json);
    expect(g3.sim(s.id)!.wishes).toEqual([]);
    expect(g3.sim(s.id)!.wishPoints).toBe(0);
    run(g3, 60 * 3, 1);
    expect(g3.sim(s.id)!.wishes!.length).toBeGreaterThan(0);
  });
});

describe('Langer Lauf', () => {
  it('drei Spieltage mit Autonomie ohne Fehler und mit gültigen Werten', () => {
    const g = fresh();
    const errors: unknown[] = [];
    const orig = console.error;
    console.error = (...a: unknown[]) => errors.push(a);
    try {
      run(g, 60 * 24 * 3, 1);
    } finally {
      console.error = orig;
    }
    expect(errors).toEqual([]);
    for (const s of g.sims.values()) {
      expect(Number.isFinite(s.x) && Number.isFinite(s.z)).toBe(true);
      for (const n of NEED_IDS) expect(s.needs[n]).toBeGreaterThanOrEqual(0);
    }
  }, 120000);
});

describe('Mehrspieler-Steckbrief', () => {
  it('bereinigt fremde Eingaben', () => {
    const c = sanitizeCard({ first: '<script>x</script>'.repeat(5), age: 'baby', traits: ['nope' as never], look: { skin: 'red;', height: 999 } as never }, 'peer1');
    expect(c.first.length).toBeLessThanOrEqual(20);
    expect(c.first).not.toMatch(/[<>]/);
    expect(c.age).toBe('youngadult');
    expect(c.traits).toEqual([]);
    expect(c.look.skin).toMatch(/^#/);
    expect(c.look.height).toBeLessThanOrEqual(40);
  });
});

describe('Korrekturen aus der Code-Prüfung', () => {
  it('fehlgeschlagene Buchung sperrt den Schlüssel nicht', () => {
    const g = fresh();
    const h = g.hh!;
    const f0 = h.funds;
    expect(g.money(h.id, -(f0 + 50), 'Zu teuer', 'bill:1')).toBe(false);
    g.money(h.id, 100, 'Lohn');
    expect(g.money(h.id, -(f0 + 50), 'Jetzt reicht es', 'bill:1')).toBe(true);
    expect(g.money(h.id, -1, 'Doppelt', 'bill:1')).toBe(false);
  });
  it('Feier ohne Gäste kostet nichts und bleibt wiederholbar', () => {
    const g = fresh();
    for (const s of g.sims.values()) if (s.npc) s.away = { kind: 'work', until: g.clock.min + 9999, lot: 'x' };
    const f0 = g.hh!.funds;
    expect(throwParty(g)).not.toBe(true);
    expect(g.hh!.funds).toBe(f0);
    expect(g.hh!.booked.some((k) => k.startsWith('party:'))).toBe(false);
  });
  it('eigene Familie zieht ins gewählte Haus und behält das Startkapital', () => {
    const g = createGame({ seed: 3, slot: 1, lot: 'sh-4', custom: { name: 'Test', members: [{ first: 'Alex', last: 'Test', pronoun: 'they', age: 'adult', traits: [], aspiration: 'friends', look: base.active!.look }] } });
    expect(g.hh!.lot).toBe('sh-4');
    expect(g.hh!.funds).toBe(20000);
  });
  it('Snack am eigenen Kühlschrank braucht Geld', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const s = adult(g);
    g.hh!.funds = 0;
    s.needs.hunger = 30;
    const fridge = g.objsWith(g.hh!.lot, 'fridge')[0]!;
    g.queueAction(s, 'snack', { user: true, obj: fridge.id });
    run(g, 30);
    expect(s.needs.hunger).toBeLessThan(30);
    expect(g.hh!.funds).toBe(0);
  });
  it('laufende Schicht übersteht Speichern und Laden', () => {
    const g = fresh();
    const s = adult(g);
    if (!s.career) expect(joinCareer(g, s, 'gastro')).toBe(true);
    s.career!.shift = g.clock.min;
    s.away = { kind: 'work', until: g.clock.min + 240, lot: 'x' };
    const g2 = deserialize(JSON.parse(JSON.stringify(serialize(g))));
    const s2 = g2.sims.get(s.id)!;
    expect(s2.career!.shift).toBe(s.career!.shift);
    expect(s2.away?.kind).toBe('work');
  });
  it('Schule erst ab 7 Uhr', () => {
    const g = fresh();
    g.settings.autonomy = 0;
    const kid = g.members().find((m) => m.age === 'child')!;
    g.clock.min = Math.floor(g.clock.min / 1440) * 1440 + 3 * 60;
    while (g.clock.weekday >= 5) g.clock.min += 1440;
    g.queueAction(kid, 'goToSchool', { user: true });
    run(g, 2);
    expect(kid.queue.some((q) => q.def === 'goToSchool' && q.phase !== 'done')).toBe(false);
    expect(kid.school?.attended).not.toBe(g.clock.day);
  });
});
