import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, DICE_SKINS, HAT_COSMETICS, TRAILS, isUnlocked, recordGame, type GameSummary } from './achievements';
import { defaultSave, sanitize } from './save';

const game = (o: Partial<GameSummary> = {}): GameSummary => ({
  layoutId: 'prismara-01', world: 'prismara', won: false, online: false, rounds: 10, players: 4,
  coinsEarned: 20, steps: 40, minigameWins: 1, minigamesPlayed: 10, seconds: 600, finalShards: 1, rank: 3, ...o,
});

describe('Erfolge', () => {
  it('hat mindestens 14 Erfolge mit eindeutigen IDs', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(14);
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.goal).toBeGreaterThan(0);
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
    }
  });

  it('addiert die Statistik', () => {
    const s = defaultSave();
    recordGame(s, game({ won: true, online: true }), 1000);
    recordGame(s, game({ world: 'nova-nexus' }), 2000);
    expect(s.stats.games).toBe(2);
    expect(s.stats.wins).toBe(1);
    expect(s.stats.onlineGames).toBe(1);
    expect(s.stats.coinsEarned).toBe(40);
    expect(s.stats.steps).toBe(80);
    expect(s.stats.minigamesPlayed).toBe(20);
    expect(s.stats.minigamesWon).toBe(2);
    expect(s.stats.playSeconds).toBe(1200);
    expect(s.stats.perWorld).toEqual({ prismara: 1, 'nova-nexus': 1 });
  });

  it('vergibt Erfolge nur einmal', () => {
    const s = defaultSave();
    const first = recordGame(s, game({ won: true }), 1234);
    expect(first).toContain('erstes-spiel');
    expect(first).toContain('erster-sieg');
    expect(s.achievements['erstes-spiel']).toBe(1234);
    const second = recordGame(s, game({ won: true }), 9999);
    expect(second).not.toContain('erstes-spiel');
    expect(second).not.toContain('erster-sieg');
    expect(s.achievements['erstes-spiel']).toBe(1234);
  });

  it('prüft Einzelspiel-Erfolge', () => {
    const s = defaultSave();
    const ids = recordGame(s, game({ won: true, players: 4, minigameWins: 3, rounds: 15, finalShards: 4 }));
    for (const id of ['allein-gegen-alle', 'minispiel-serie', 'lange-reise', 'splittersammler']) expect(ids).toContain(id);
    const s2 = defaultSave();
    expect(recordGame(s2, game({ won: false, players: 4 }))).not.toContain('allein-gegen-alle');
  });

  it('schaltet Kosmetik durch Erfolge frei', () => {
    const s = defaultSave();
    expect(isUnlocked(s, 'hat', 'krone')).toBe(false);
    expect(isUnlocked(s, 'hat', 'propeller')).toBe(true);
    expect(isUnlocked(s, 'dice', 'neon')).toBe(false);
    s.stats.wins = 9;
    recordGame(s, game({ won: true }));
    expect(isUnlocked(s, 'hat', 'krone')).toBe(true);
    expect(isUnlocked(s, 'hat', 'unbekannt')).toBe(false);
    expect(isUnlocked(s, 'trail', 'gold')).toBe(false);
  });

  it('mindestens 40 % der Kosmetik ist sofort frei und der Rest ist erreichbar', () => {
    for (const list of [HAT_COSMETICS, TRAILS, DICE_SKINS]) {
      expect(list.filter((c) => c.free).length / list.length).toBeGreaterThanOrEqual(0.4);
    }
    const s = defaultSave();
    s.achievements = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, 1]));
    for (const c of HAT_COSMETICS) expect(isUnlocked(s, 'hat', c.id)).toBe(true);
    for (const c of TRAILS) expect(isUnlocked(s, 'trail', c.id)).toBe(true);
    for (const c of DICE_SKINS) expect(isUnlocked(s, 'dice', c.id)).toBe(true);
  });

  it('übersteht kaputte Eingaben', () => {
    const s = defaultSave();
    const bad = game({ coinsEarned: NaN, steps: -50, seconds: Infinity, minigameWins: -3, minigamesPlayed: NaN, rounds: NaN, players: -1, world: '__proto__' });
    expect(() => recordGame(s, bad, NaN)).not.toThrow();
    expect(s.stats.coinsEarned).toBe(0);
    expect(s.stats.steps).toBe(0);
    expect(s.stats.playSeconds).toBe(0);
    expect(s.stats.minigamesWon).toBe(0);
    expect(Object.keys(s.stats.perWorld)).toHaveLength(0);
    expect(Object.values(s.achievements).every(Number.isFinite)).toBe(true);
    const broken = sanitize({});
    broken.stats.games = NaN;
    broken.stats.wins = -4;
    recordGame(broken, game());
    expect(broken.stats.games).toBe(1);
    expect(broken.stats.wins).toBe(0);
  });
});
