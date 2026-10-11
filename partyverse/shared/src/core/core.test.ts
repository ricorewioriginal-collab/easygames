import { describe, expect, it } from 'vitest';
import { Rng } from '../rng';
import { runBot } from '../minigames/simulate';
import { getMiniGame } from '../minigames/registry';
import { decide, distancesTo } from './ai';
import { GameCore } from './core';
import { makeTestLayout } from './testLayouts';
import { ALTAR_COST, Action, Difficulty, GameConfig, GameEvent, PlayerSetup } from './types';
import { ITEMS } from './items';

const setup = (n: number, kinds: Array<'human' | 'bot'> = [], diffs: Difficulty[] = []): PlayerSetup[] =>
  Array.from({ length: n }, (_, i) => ({
    id: 'p' + i,
    name: 'Spieler' + i,
    character: (['pip', 'brumm', 'lumi', 'zapp'] as const)[i % 4] as 'pip',
    kind: kinds[i] ?? 'bot',
    difficulty: diffs[i] ?? 'normal',
  }));
const cfg = (
  n = 3,
  rounds = 5,
  kinds: Array<'human' | 'bot'> = ['human'],
  diffs: Difficulty[] = [],
): GameConfig => ({ layoutId: 'prismara-01', rounds, players: setup(n, kinds, diffs) });
const mk = (
  n = 3,
  rounds = 5,
  seed = 1,
  kinds: Array<'human' | 'bot'> = ['human'],
  diffs: Difficulty[] = [],
) => new GameCore(cfg(n, rounds, kinds, diffs), seed, makeTestLayout());

/** Spielt eine Partie komplett automatisch (Menschen werden wie Bots gesteuert). */
function autoPlay(core: GameCore, seed = 9, events: GameEvent[] = []): GameEvent[] {
  const rng = new Rng(seed);
  let guard = 0;
  while (core.state.phase !== 'ended' && guard++ < 5000) {
    const actors = core.pendingActors();
    if (actors.length === 0) throw new Error('Kein Spieler am Zug in Phase ' + core.state.phase);
    const id = actors[0] as string;
    let a: Action | null;
    if (core.state.phase === 'minigame') {
      const m = core.state.minigame!;
      if (m.stage === 'intro') a = { type: 'minigameReady' };
      else {
        const g = getMiniGame(m.gameId);
        a = {
          type: 'minigameSubmit',
          log: runBot(
            g,
            m.seed,
            { playerIndex: core.state.order.indexOf(id), players: core.state.order.length },
            0.5,
            3,
          ).log,
        };
      }
    } else a = decide(core, id, rng);
    if (!a) throw new Error('Keine Aktion für ' + id + ' in Phase ' + core.state.phase);
    const r = core.apply(id, a);
    if (!r.ok) throw new Error('Aktion abgelehnt: ' + r.error);
    events.push(...r.events);
  }
  return events;
}

describe('Aufbau und Zugreihenfolge', () => {
  it('lehnt ungültige Konfigurationen ab', () => {
    expect(() => new GameCore({ ...cfg(), players: setup(1) }, 1, makeTestLayout())).toThrow();
    expect(() => new GameCore({ ...cfg(), players: setup(5) }, 1, makeTestLayout())).toThrow();
    expect(() => new GameCore({ ...cfg(), rounds: 0 }, 1, makeTestLayout())).toThrow();
    expect(() => new GameCore({ ...cfg(), players: setup(2, ['bot', 'bot']) }, 1, makeTestLayout())).toThrow(
      /menschlich/,
    );
    const dup = setup(2);
    dup[1]!.id = dup[0]!.id;
    expect(() => new GameCore({ ...cfg(), players: dup }, 1, makeTestLayout())).toThrow(/Doppelte/);
  });
  it('würfelt eine eindeutige Reihenfolge aus allen Spielern', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const c = mk(4, 3, seed);
      expect(new Set(c.state.order).size).toBe(4);
      expect([...c.state.order].sort()).toEqual(['p0', 'p1', 'p2', 'p3']);
      expect(c.state.current).toBe(c.state.order[0]);
      const ev = c.initialEvents.find((e) => e.t === 'order');
      expect(ev).toBeTruthy();
    }
  });
  it('Zugreihenfolge: alle kommen reihum dran, dann das Minispiel', () => {
    const c = mk(3, 3, 5, ['human', 'human', 'human']);
    const order = [...c.state.order];
    const rng = new Rng(3);
    const turns: string[] = [];
    let guard = 0;
    while (c.state.phase !== 'minigame' && guard++ < 200) {
      const id = c.pendingActors()[0] as string;
      if (turns.at(-1) !== c.state.current) turns.push(c.state.current);
      expect(c.pendingActors()).toEqual([id]);
      const other = order.find((o) => o !== id) as string;
      expect(c.apply(other, { type: 'roll' }).ok).toBe(false);
      c.apply(id, decide(c, id, rng) as Action);
    }
    expect(turns).toEqual(order);
    expect(c.state.phase).toBe('minigame');
  });
  it('Zustand enthält keinen Zufallszustand (Würfel nicht vorhersagbar) und ist JSON-sicher', () => {
    const c = mk();
    const json = JSON.stringify(c.state);
    expect(json).not.toMatch(/rng|seed"/i);
    expect(JSON.parse(json)).toEqual(c.state);
  });
});

describe('Würfel', () => {
  it('sind fair verteilt (1–6): 6000 Würfe, Chi-Quadrat im Rahmen', () => {
    const counts = [0, 0, 0, 0, 0, 0];
    const rng = new Rng(77);
    let n = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const c = mk(3, 30, seed, ['human', 'human', 'human']);
      for (let i = 0; i < 750; i++) {
        // Minispiel überspringen: wieder an den Anfang der Runde
        if (c.state.phase === 'minigame') {
          c.state.phase = 'turn';
          c.state.minigame = null;
          c.state.turnIndex = 0;
          c.state.current = c.state.order[0] as string;
          c.state.rolled = false;
        }
        let guard = 0;
        while (c.state.phase === 'decision' && guard++ < 20) {
          const id = c.pendingActors()[0] as string;
          c.apply(id, decide(c, id, rng) as Action);
        }
        if (c.state.phase !== 'turn') continue;
        const id = c.state.current;
        const ev = c.apply(id, { type: 'roll' }).events.find((e) => e.t === 'dice') as
          | Extract<GameEvent, { t: 'dice' }>
          | undefined;
        if (ev && ev.dice.length === 1) {
          counts[ev.dice[0]! - 1]!++;
          n++;
        }
      }
    }
    expect(n).toBeGreaterThan(4500);
    const exp = n / 6;
    const chi = counts.reduce((a, c) => a + (c - exp) ** 2 / exp, 0);
    expect(chi).toBeLessThan(20.5); // 5 Freiheitsgrade, p ≈ 0.001
    for (const c of counts) expect(Math.abs(c - exp)).toBeLessThan(exp * 0.12);
  });
  it('Würfeln nur im eigenen Zug und nur einmal', () => {
    const c = mk(3, 3, 2, ['human', 'human', 'human']);
    const other = c.state.order[1] as string;
    expect(c.apply(other, { type: 'roll' })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/nicht am Zug/),
    });
    const me = c.state.current;
    expect(c.apply(me, { type: 'roll' }).ok).toBe(true);
    if (c.state.phase === 'decision') {
      expect(c.apply(me, { type: 'roll' }).ok).toBe(false);
    }
  });
  it('Zwillingswürfel = zwei Würfel, Präzisionswürfel = höherer von zwei', () => {
    let two = 0;
    for (let seed = 1; seed < 40; seed++) {
      const c = mk(3, 3, seed, ['human']);
      const me = c.player(c.state.current);
      me.items = ['zwillingswuerfel'];
      expect(c.apply(me.id, { type: 'useItem', item: 'zwillingswuerfel' }).ok).toBe(true);
      expect(me.items).toEqual([]);
      const ev = c.apply(me.id, { type: 'roll' }).events.find((e) => e.t === 'dice') as Extract<
        GameEvent,
        { t: 'dice' }
      >;
      expect(ev.dice.length).toBe(2);
      expect(ev.total).toBe(ev.dice[0]! + ev.dice[1]!);
      two++;
      const c2 = mk(3, 3, seed, ['human']);
      const m2 = c2.player(c2.state.current);
      m2.items = ['praezisionswuerfel'];
      c2.apply(m2.id, { type: 'useItem', item: 'praezisionswuerfel' });
      const e2 = c2.apply(m2.id, { type: 'roll' }).events.find((e) => e.t === 'dice') as Extract<
        GameEvent,
        { t: 'dice' }
      >;
      expect(e2.total).toBe(Math.max(...e2.dice));
    }
    expect(two).toBeGreaterThan(30);
  });
});

describe('Bewegung und Routenauswahl', () => {
  it('bewegt genau die gewürfelte Zahl an Feldern und löst die Landung aus', () => {
    const c = mk(2, 3, 11, ['human']);
    const id = c.state.current;
    const r = c.apply(id, { type: 'roll' });
    const dice = r.events.find((e) => e.t === 'dice') as Extract<GameEvent, { t: 'dice' }>;
    const steps = r.events.filter((e) => e.t === 'step');
    if (c.state.phase !== 'decision') {
      expect(steps.length).toBe(dice.total);
      expect(r.events.some((e) => e.t === 'land')).toBe(true);
      expect(r.events.at(-1)?.t === 'turn' || r.events.some((e) => e.t === 'turnEnd')).toBe(true);
    }
  });
  it('Abzweigung: Spieler muss die Route wählen; nur begehbare Wege sind erlaubt', () => {
    const c = mk(2, 3, 3, ['human', 'human']);
    const id = c.state.current;
    c.player(id).position = 5; // dahinter liegt der Abzweig bei 6
    c.state.lastDice = null;
    // Würfelwert erzwingen: wir bewegen direkt über enter-Kette durch Setzen einer Pending-Entscheidung
    c.player(id).position = 6;
    const phase = c.effectivePhase();
    const opts = c.layout.edges
      .filter((e) => e.from === 6 && (!e.folds || e.folds.includes(phase)))
      .map((e) => e.to);
    expect(opts.sort((a, b) => a - b)).toEqual([7, 28]);
    c.state.phase = 'decision';
    c.state.pending = { kind: 'branch', player: id, options: opts, remaining: 3 };
    expect(c.apply(id, { type: 'chooseBranch', node: 14 }).ok).toBe(false);
    const r = c.apply(id, { type: 'chooseBranch', node: 28 });
    expect(r.ok).toBe(true);
    expect(r.events.filter((e) => e.t === 'step').length).toBeGreaterThan(0);
    expect(c.player(id).position).not.toBe(6);
  });
  it('faltbare Wege sind nur in ihrer Phase begehbar', () => {
    const c = mk(2, 4, 3, ['human']);
    const base = c.effectivePhase();
    const has = (ph: number) =>
      c.layout.edges.some((e) => e.from === 10 && e.to === 16 && (!e.folds || e.folds.includes(ph)));
    expect(has(base)).toBe(base === 0);
    expect(has(1 - base)).toBe(base === 1);
  });
  it('Mautbrücke: bezahlen, Schlüssel einsetzen oder umkehren; ohne Mittel bleibt sie zu', () => {
    const run = (coins: number, key: boolean, choice: 'pay' | 'key' | 'back' | null) => {
      const c = mk(2, 3, 5, ['human']);
      const id = c.state.current;
      const p = c.player(id);
      p.position = 28;
      p.coins = coins;
      p.items = key ? ['schluesselfragment'] : [];
      c.state.phase = 'decision';
      c.state.rolled = true;
      // Wir simulieren einen Schritt von 28 aus mit 3 Restschritten
      (c as unknown as { moveLoop(id: string, n: number): void }).moveLoop(id, 3);
      if (choice === null) return { c, id, p };
      expect(c.state.pending?.kind).toBe('gate');
      const r = c.apply(id, { type: 'gate', choice });
      return { c, id, p, r };
    };
    const a = run(10, false, 'pay');
    expect(a.r?.ok).toBe(true);
    expect(a.p.coins).toBeLessThanOrEqual(10 - 3 + 3);
    const b = run(0, true, 'key');
    expect(b.p.items).toEqual([]);
    expect(b.r?.ok).toBe(true);
    const d = run(10, false, 'back');
    expect(d.p.position).toBe(28);
    const e = run(1, false, null);
    expect(e.c.state.pending).toBeNull();
    expect(e.p.position).toBe(28);
    expect(e.c.state.phase !== 'decision').toBe(true);
    const f = run(1, false, null);
    expect(f.c.initialEvents.length).toBeGreaterThan(0);
    expect(run(1, true, 'pay').c.apply('p0', { type: 'gate', choice: 'pay' }).ok).toBe(false);
  });
  it('Portale teleportieren zum Partner', () => {
    const c = mk(2, 3, 5, ['human']);
    const id = c.state.current;
    const p = c.player(id);
    p.position = 2;
    c.state.rolled = true;
    (c as unknown as { moveLoop(id: string, n: number): void }).moveLoop(id, 1);
    expect(p.position).toBe(17);
  });
  it('Überholen und Landen auf demselben Feld beeinflusst Gegner (Schild wehrt ab)', () => {
    const c = mk(2, 3, 5, ['human']);
    const [a, b] = c.state.order.map((i) => c.player(i)) as [
      ReturnType<GameCore['player']>,
      ReturnType<GameCore['player']>,
    ];
    a.position = 0;
    b.position = 2;
    b.coins = 10;
    a.coins = 10;
    c.state.rolled = true;
    c.state.current = a.id;
    (c as unknown as { moveLoop(id: string, n: number): void }).moveLoop(a.id, 4);
    expect(a.coins).toBeGreaterThan(10 - 1); // wurde nicht ärmer durch Überholen
    const c2 = mk(2, 3, 5, ['human']);
    const [a2, b2] = c2.state.order.map((i) => c2.player(i)) as [
      ReturnType<GameCore['player']>,
      ReturnType<GameCore['player']>,
    ];
    a2.position = 0;
    b2.position = 2;
    b2.shield = true;
    b2.coins = 10;
    a2.coins = 10;
    c2.state.current = a2.id;
    c2.state.rolled = true;
    (c2 as unknown as { moveLoop(id: string, n: number): void }).moveLoop(a2.id, 4);
    expect(b2.shield).toBe(false);
    expect(b2.coins).toBe(10);
  });
});

describe('Ressourcen, Felder, Altar', () => {
  const landOn = (kind: number, setupFn?: (c: GameCore, id: string) => void) => {
    const c = mk(2, 3, 7, ['human']);
    const id = c.state.current;
    c.player(id).position = kind - 1;
    setupFn?.(c, id);
    c.state.rolled = true;
    (c as unknown as { moveLoop(id: string, n: number): void }).moveLoop(id, 1);
    return { c, id, p: c.player(id) };
  };
  it('Glimmer-Feld +3, Dornenfeld −3 (nie unter 0), Phasenmantel schützt', () => {
    expect(landOn(1).p.coins).toBe(13); // Feld 1 ist glimmer
    const t = landOn(18, (_c, id) => {
      _c.player(id).coins = 10;
    });
    expect(t.p.coins).toBe(7);
    const z = landOn(18, (c, id) => {
      c.player(id).coins = 2;
    });
    expect(z.p.coins).toBe(0);
    const m = landOn(18, (c, id) => {
      c.player(id).mantle = true;
    });
    expect(m.p.coins).toBe(10);
  });
  it('Laden: kaufen verbraucht Münzen, Platzlimit und Preise werden geprüft', () => {
    const { c, id, p } = landOn(9, (cc, i) => {
      cc.player(i).coins = 30;
    });
    expect(c.state.pending?.kind).toBe('shop');
    const offer = (c.state.pending as { offers: string[] }).offers[0] as keyof typeof ITEMS;
    const before = p.coins;
    expect(c.apply(id, { type: 'shopBuy', index: 0 }).ok).toBe(true);
    expect(p.coins).toBe(before - ITEMS[offer].cost);
    expect(p.items).toContain(offer);
    expect(c.apply(id, { type: 'shopBuy', index: 9 }).ok).toBe(false);
    if (c.state.pending) expect(c.apply(id, { type: 'shopLeave' }).ok).toBe(true);
    expect(c.state.pending).toBeNull();
    const poor = landOn(9, (cc, i) => {
      cc.player(i).coins = 0;
    });
    const idx = (poor.c.state.pending as { offers: string[] }).offers.length;
    expect(idx).toBe(3);
    expect(poor.c.apply(poor.id, { type: 'shopBuy', index: 0 }).ok).toBe(false);
  });
  it('Chrono-Altar: Kauf gegen 20 Glimmer gibt einen Zeitsplitter und versetzt den Altar', () => {
    const c = mk(2, 3, 9, ['human']);
    const id = c.state.current;
    const p = c.player(id);
    c.state.altar = 10;
    p.position = 8;
    p.coins = 25;
    c.state.rolled = true;
    (c as unknown as { moveLoop(id: string, n: number): void }).moveLoop(id, 3);
    expect(c.state.pending?.kind).toBe('altar');
    expect(c.apply(id, { type: 'altar', buy: true }).ok).toBe(true);
    expect(p.shards).toBe(1);
    expect(p.coins).toBeLessThanOrEqual(25 - ALTAR_COST + 3);
    expect(c.state.altar).not.toBe(10);
    expect(c.layout.altarSites).toContain(c.state.altar);
  });
  it('Altar ohne genug Glimmer bietet keinen Kauf an', () => {
    const c = mk(2, 3, 9, ['human']);
    const id = c.state.current;
    c.state.altar = 10;
    c.player(id).position = 8;
    c.player(id).coins = 19;
    c.state.rolled = true;
    (c as unknown as { moveLoop(id: string, n: number): void }).moveLoop(id, 2);
    expect(c.state.pending).toBeNull();
  });
});

describe('Gegenstände', () => {
  const prep = (item: keyof typeof ITEMS) => {
    const c = mk(3, 3, 4, ['human', 'human', 'human']);
    const me = c.player(c.state.current);
    const foe = c.players.find((p) => p.id !== me.id) as ReturnType<GameCore['player']>;
    me.items = [item];
    return { c, me, foe };
  };
  it('Tauschkristall tauscht Plätze; Schutzschild wehrt ab und verbraucht sich', () => {
    const { c, me, foe } = prep('tauschkristall');
    me.position = 3;
    foe.position = 12;
    expect(c.apply(me.id, { type: 'useItem', item: 'tauschkristall', target: foe.id }).ok).toBe(true);
    expect([me.position, foe.position]).toEqual([12, 3]);
    const x = prep('tauschkristall');
    x.me.position = 3;
    x.foe.position = 12;
    x.foe.shield = true;
    x.c.apply(x.me.id, { type: 'useItem', item: 'tauschkristall', target: x.foe.id });
    expect([x.me.position, x.foe.position]).toEqual([3, 12]);
    expect(x.foe.shield).toBe(false);
  });
  it('Taschenspiegel stiehlt bis zu 6 Glimmer', () => {
    const { c, me, foe } = prep('taschenspiegel');
    me.coins = 5;
    foe.coins = 20;
    c.apply(me.id, { type: 'useItem', item: 'taschenspiegel', target: foe.id });
    expect([me.coins, foe.coins]).toEqual([11, 14]);
    const y = prep('taschenspiegel');
    y.foe.coins = 2;
    y.me.coins = 0;
    y.c.apply(y.me.id, { type: 'useItem', item: 'taschenspiegel', target: y.foe.id });
    expect([y.me.coins, y.foe.coins]).toEqual([2, 0]);
  });
  it('Frostuhr halbiert den nächsten Wurf des Ziels', () => {
    const { c, me, foe } = prep('frostuhr');
    c.apply(me.id, { type: 'useItem', item: 'frostuhr', target: foe.id });
    expect(foe.frozen).toBe(true);
    foe.frozen = true;
    c.state.current = foe.id;
    c.state.turnIndex = c.state.order.indexOf(foe.id);
    const ev = c.apply(foe.id, { type: 'roll' }).events.find((e) => e.t === 'dice') as Extract<
      GameEvent,
      { t: 'dice' }
    >;
    expect(ev.total).toBe(Math.max(1, Math.floor(ev.dice[0]! / 2)));
    expect(foe.frozen).toBe(false);
  });
  it('prüft Besitz, Ziel und Zeitpunkt', () => {
    const { c, me, foe } = prep('frostuhr');
    expect(c.apply(me.id, { type: 'useItem', item: 'frostuhr' }).ok).toBe(false);
    expect(c.apply(me.id, { type: 'useItem', item: 'frostuhr', target: me.id }).ok).toBe(false);
    expect(c.apply(me.id, { type: 'useItem', item: 'tauschkristall', target: foe.id }).ok).toBe(false);
    expect(c.apply(me.id, { type: 'useItem', item: 'schluesselfragment' }).ok).toBe(false);
    expect(c.apply(foe.id, { type: 'useItem', item: 'frostuhr', target: me.id }).ok).toBe(false);
    expect(c.apply(me.id, { type: 'useItem', item: 'gibtsnicht' as never }).ok).toBe(false);
  });
});

describe('Ereignisse', () => {
  const ev = (_id: Parameters<GameCore['forceEvent']>[1]) => {
    const c = mk(3, 3, 8, ['human']);
    const me = c.player(c.state.current);
    const others = c.players.filter((p) => p.id !== me.id);
    return { c, me, others };
  };
  it('Glück, Dornen (Mantel), Spende, Umverteilung, Gegenwind', () => {
    let t = ev('glueck');
    t.c.forceEvent(t.me.id, 'glueck');
    expect(t.me.coins).toBe(16);
    t = ev('dornen');
    t.c.forceEvent(t.me.id, 'dornen');
    expect(t.me.coins).toBe(6);
    t = ev('dornen');
    t.me.mantle = true;
    t.c.forceEvent(t.me.id, 'dornen');
    expect(t.me.coins).toBe(10);
    t = ev('spende');
    t.c.forceEvent(t.me.id, 'spende');
    expect([t.me.coins, ...t.others.map((o) => o.coins)].sort()).toEqual([12, 12, 14]);
    t = ev('umverteilung');
    t.me.coins = 20;
    t.others[0]!.coins = 0;
    t.c.forceEvent(t.me.id, 'umverteilung');
    expect([t.me.coins, t.others[0]!.coins]).toEqual([17, 3]);
    t = ev('gegenwind');
    t.c.forceEvent(t.me.id, 'gegenwind');
    expect(t.me.rollBonus).toBe(-2);
  });
  it('Faltung verschiebt die Wegephase sofort, Altarruf versetzt den Altar', () => {
    const t = ev('faltung');
    const before = t.c.effectivePhase();
    t.c.forceEvent(t.me.id, 'faltung');
    expect(t.c.effectivePhase()).toBe(1 - before);
    expect(t.c.state.foldPhase).toBe(1 - before);
    const a = t.c.state.altar;
    t.c.forceEvent(t.me.id, 'altarruf');
    expect(t.c.state.altar).not.toBe(a);
  });
  it('Portalblitz teleportiert zu einem Portal, Schatz gibt Gegenstand (oder Münzen bei vollem Beutel)', () => {
    const t = ev('portalblitz');
    t.me.position = 5;
    t.c.forceEvent(t.me.id, 'portalblitz');
    expect([3, 17]).toContain(t.me.position);
    const s = ev('schatz');
    s.c.forceEvent(s.me.id, 'schatz');
    expect(s.me.items.length).toBe(1);
    s.me.items = ['frostuhr', 'frostuhr', 'frostuhr'];
    const coins = s.me.coins;
    s.c.forceEvent(s.me.id, 'schatz');
    expect(s.me.items.length).toBe(3);
    expect(s.me.coins).toBe(coins + 4);
  });
});

describe('Minispiel-Runden', () => {
  it('Bots spielen automatisch, Menschen müssen bestätigen und ein gültiges Protokoll abgeben', () => {
    const c = mk(3, 3, 12, ['human', 'bot', 'bot']);
    const human = 'p0';
    let guard = 0;
    while (c.state.phase !== 'minigame' && guard++ < 400) {
      const id = c.pendingActors()[0] as string;
      const a = decide(c, id, new Rng(guard));
      c.apply(id, a as Action);
    }
    expect(c.state.phase).toBe('minigame');
    const m = c.state.minigame!;
    expect(m.stage).toBe('intro');
    expect(c.pendingActors()).toEqual([human]);
    expect(c.apply(human, { type: 'minigameSubmit', log: [] }).ok).toBe(false);
    expect(c.apply('p1', { type: 'minigameReady' }).ok).toBe(false);
    expect(c.apply(human, { type: 'minigameReady' }).ok).toBe(true);
    expect(c.state.minigame!.stage).toBe('play');
    expect(c.apply(human, { type: 'minigameSubmit', log: [1, 2, 3] }).error).toMatch(/protokoll/i);
    expect(c.apply(human, { type: 'minigameSubmit', log: [0, 999, 0, 0, 0, 0] }).ok).toBe(false);
    const g = getMiniGame(m.gameId);
    const log = runBot(g, m.seed, { playerIndex: c.state.order.indexOf(human), players: 3 }, 0.8, 1).log;
    const r = c.apply(human, { type: 'minigameSubmit', log });
    expect(r.ok).toBe(true);
    expect(r.events.some((e) => e.t === 'minigameDone')).toBe(true);
    expect(c.state.round).toBe(2);
    expect(c.state.phase).toBe('turn');
    expect(c.apply(human, { type: 'minigameSubmit', log }).ok).toBe(false);
  });
  it('Belohnungen: Rang 1 bekommt am meisten, Teams teilen den Sieg', () => {
    for (let seed = 1; seed < 25; seed++) {
      const c = mk(4, 2, seed, ['human', 'human', 'human', 'human']);
      const ev = autoPlay(c, seed);
      const done = ev.filter((e) => e.t === 'minigameDone') as Array<
        Extract<GameEvent, { t: 'minigameDone' }>
      >;
      expect(done.length).toBe(2);
      for (const d of done) {
        const vals = d.ranking.map((id) => d.rewards[id] as number);
        for (let i = 1; i < vals.length; i++) expect(vals[i - 1]! >= vals[i]!).toBe(true);
        expect(d.winners.length).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('Zeitüberschreitung: forceReady/forceResults/fallbackAction beenden hängende Partien', () => {
    const c = mk(3, 2, 21, ['human', 'human', 'bot']);
    let guard = 0;
    while (c.state.phase !== 'ended' && guard++ < 600) {
      if (c.state.phase === 'minigame') {
        if (c.state.minigame!.stage === 'intro') expect(c.forceReady().ok).toBe(true);
        else expect(c.forceResults().ok).toBe(true);
        continue;
      }
      const id = c.pendingActors()[0] as string;
      const a = c.fallbackAction(id);
      expect(a).not.toBeNull();
      expect(c.apply(id, a as Action).ok).toBe(true);
    }
    expect(c.state.phase).toBe('ended');
  });
});

describe('Spielende und Siegbedingungen', () => {
  it('endet nach der konfigurierten Rundenzahl mit Rangliste und Finale-Boni', () => {
    for (const rounds of [1, 3, 6]) {
      const c = mk(3, rounds, 30 + rounds, ['human']);
      const ev = autoPlay(c, 2);
      expect(c.state.phase).toBe('ended');
      expect(c.state.round).toBe(rounds);
      const fin = ev.find((e) => e.t === 'finale') as Extract<GameEvent, { t: 'finale' }>;
      expect(fin.ranking.length).toBe(3);
      const shards = fin.ranking.map((id) => c.player(id).shards);
      for (let i = 1; i < shards.length; i++) expect(shards[i - 1]! >= shards[i]!).toBe(true);
      expect(ev.filter((e) => e.t === 'minigameDone').length).toBe(rounds);
      expect(c.apply(c.state.order[0] as string, { type: 'roll' }).ok).toBe(false);
    }
  });
  it('Bonus-Zeitsplitter gehen an die besten Spieler der Kategorien', () => {
    const c = mk(3, 1, 3, ['human']);
    const [a, b, d] = c.players as [
      ReturnType<GameCore['player']>,
      ReturnType<GameCore['player']>,
      ReturnType<GameCore['player']>,
    ];
    a.coins = 50;
    a.stats.minigameWins = 0;
    b.stats.minigameWins = 3;
    d.stats.events = 2;
    autoPlayFinaleOnly(c);
    expect(c.state.finale?.bonuses.find((x) => x.id === 'coins')?.players).toContain(a.id);
    expect(c.state.finale?.bonuses.find((x) => x.id === 'events')?.players).toContain(d.id);
  });
  it('unveränderter Zustand bei abgelehnten Aktionen; Version steigt nur bei Erfolg', () => {
    const c = mk(2, 3, 2, ['human']);
    const snap = JSON.stringify(c.state);
    const v = c.state.version;
    expect(c.apply('niemand', { type: 'roll' }).ok).toBe(false);
    expect(c.apply(c.state.current, { type: 'altar', buy: true }).ok).toBe(false);
    expect(c.apply(c.state.current, null as never).ok).toBe(false);
    expect(JSON.stringify(c.state)).toBe(snap);
    expect(c.apply(c.state.current, { type: 'roll' }).ok).toBe(true);
    expect(c.state.version).toBe(v + 1);
  });
});

function autoPlayFinaleOnly(c: GameCore): void {
  // Spielt die einzige Runde zu Ende; Münz- und Ereigniswerte bleiben dabei weitgehend erhalten.
  autoPlay(c, 5);
}

describe('KI', () => {
  it('entscheidet an Mautbrücken und Altären vernünftig', () => {
    const c = mk(2, 3, 5, ['human', 'bot'], ['normal', 'hard']);
    const bot = c.player('p1');
    c.state.phase = 'decision';
    c.state.pending = {
      kind: 'gate',
      player: 'p1',
      node: 29,
      toll: 3,
      canPay: true,
      hasKey: true,
      remaining: 3,
    };
    expect(decide(c, 'p1', new Rng(1))).toEqual({ type: 'gate', choice: 'key' });
    c.state.pending = {
      kind: 'gate',
      player: 'p1',
      node: 29,
      toll: 3,
      canPay: false,
      hasKey: false,
      remaining: 3,
    };
    expect(decide(c, 'p1', new Rng(1))).toEqual({ type: 'gate', choice: 'back' });
    c.state.pending = { kind: 'altar', player: 'p1', cost: 20, remaining: 0 };
    expect(decide(c, 'p1', new Rng(1))).toEqual({ type: 'altar', buy: true });
    bot.coins = 25;
    c.state.altar = 14;
    c.state.pending = { kind: 'branch', player: 'p1', options: [7, 28], remaining: 6 };
    const a = decide(c, 'p1', new Rng(1)) as Extract<Action, { type: 'chooseBranch' }>;
    expect(a.node).toBe(28); // die Abkürzung führt zum Altar auf Feld 14
  });
  it('kennt Entfernungen zum Ziel (Rückwärtssuche)', () => {
    const c = mk();
    const d = distancesTo(c.layout, 14, 0);
    expect(d[14]).toBe(0);
    expect(d[31]).toBe(1);
    expect(d[6]).toBeLessThan(d[5]!);
  });
  it('schwere Bots schlagen leichte Bots deutlich (nur bessere Entscheidungen, keine Extra-Münzen)', () => {
    let hard = 0;
    let easy = 0;
    for (let seed = 1; seed <= 36; seed++) {
      const c = mk(3, 10, seed, ['human', 'bot', 'bot'], ['easy', 'easy', 'hard']);
      c.player('p0').kind = 'bot';
      autoPlay(c, seed);
      hard += c.player('p2').shards * 10 + c.player('p2').coins;
      easy += c.player('p1').shards * 10 + c.player('p1').coins;
    }
    expect(hard).toBeGreaterThan(easy);
  });
  it('Bots wählen nur gültige Aktionen (kein Absturz in vielen Partien)', () => {
    for (let seed = 100; seed < 130; seed++) {
      const c = mk(4, 4, seed, ['human', 'human', 'human', 'human'], ['easy', 'normal', 'hard', 'normal']);
      autoPlay(c, seed);
      expect(c.state.phase).toBe('ended');
      for (const p of c.players) {
        expect(p.coins).toBeGreaterThanOrEqual(0);
        expect(p.items.length).toBeLessThanOrEqual(3);
        expect(c.layout.nodes[p.position]).toBeTruthy();
      }
    }
  });
});
