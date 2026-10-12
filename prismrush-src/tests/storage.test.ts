import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  SaveStore,
  memoryKV,
  recordKey,
  sanitize,
  type RunResult,
} from '../src/core/storage';
import { StateMachine } from '../src/core/fsm';
import { LEVELS } from '../src/game/levels';
import { EFFECTS, isUnlocked, newlyUnlocked, requirementText } from '../src/game/unlocks';

const run = (over: Partial<RunResult> = {}): RunResult => ({
  mode: 'campaign',
  levelId: LEVELS[0].id,
  difficulty: 'normal',
  score: 1000,
  accuracy: 0.9,
  stars: 2,
  maxCombo: 50,
  cleared: true,
  seconds: 60,
  notesHit: 80,
  perfects: 60,
  orbs: 10,
  ...over,
});

describe('Spielstand', () => {
  it('speichert und lädt Rekorde persistent', () => {
    const kv = memoryKV();
    const a = new SaveStore(kv);
    expect(a.recordRun(run()).newBestScore).toBe(true);
    expect(a.recordRun(run({ score: 500 })).newBestScore).toBe(false);
    const b = new SaveStore(kv);
    const rec = b.record(recordKey('campaign', LEVELS[0].id, 'normal'));
    expect(rec?.bestScore).toBe(1000);
    expect(rec?.plays).toBe(2);
    expect(rec?.clears).toBe(2);
    expect(b.data.stats.plays).toBe(2);
  });

  it('schaltet Level nacheinander frei', () => {
    const s = new SaveStore(memoryKV());
    expect(s.isLevelUnlocked(0)).toBe(true);
    expect(s.isLevelUnlocked(1)).toBe(false);
    s.recordRun(run({ cleared: false, stars: 0 }));
    expect(s.isLevelUnlocked(1)).toBe(false);
    s.recordRun(run());
    expect(s.isLevelUnlocked(1)).toBe(true);
    expect(s.progress().totalStars).toBe(2);
  });

  it('speichert Bestzeiten im Endlos-Modus', () => {
    const s = new SaveStore(memoryKV());
    expect(
      s.recordRun(run({ mode: 'endless', levelId: 'endless', seconds: 95, cleared: false }))
        .newBestTime,
    ).toBe(true);
    expect(
      s.recordRun(run({ mode: 'endless', levelId: 'endless', seconds: 40, cleared: false }))
        .newBestTime,
    ).toBe(false);
    expect(s.progress().endlessBest).toBe(95);
  });

  it('übersteht kaputte oder manipulierte Daten', () => {
    const kv = memoryKV();
    kv.setItem(STORAGE_KEY, '{kaputt');
    expect(new SaveStore(kv).data.version).toBe(1);
    const d = sanitize({
      settings: { master: 7, quality: 'ultra', difficulty: 'x' },
      records: { a: { bestScore: -5, stars: 9 } },
      equipped: { ship: 'gibtsnicht' },
    });
    expect(d.settings.master).toBe(1);
    expect(d.settings.quality).toBe('auto');
    expect(d.settings.difficulty).toBe('normal');
    expect(d.records.a.bestScore).toBe(0);
    expect(d.records.a.stars).toBe(3);
    expect(d.equipped.ship).toBe('prism');
  });

  it('funktioniert auch wenn Speichern fehlschlägt', () => {
    const s = new SaveStore({
      getItem: () => null,
      setItem: () => {
        throw new Error('voll');
      },
      removeItem: () => undefined,
    });
    expect(() => s.recordRun(run())).not.toThrow();
  });

  it('Effekte nur ausrüsten, wenn freigeschaltet', () => {
    const s = new SaveStore(memoryKV());
    expect(s.equip('ship', 'octa')).toBe(false);
    expect(s.equip('palette', 'mono')).toBe(false);
    s.recordRun(run({ mode: 'tutorial', levelId: 'tutorial' }));
    expect(s.equip('palette', 'mono')).toBe(true);
    expect(s.data.equipped.palette).toBe('mono');
  });

  it('Zurücksetzen behält Einstellungen', () => {
    const s = new SaveStore(memoryKV());
    s.updateSettings({ master: 0.3 });
    s.recordRun(run());
    s.reset();
    expect(s.settings.master).toBe(0.3);
    expect(s.progress().clearedLevels).toBe(0);
  });
});

describe('Freischaltungen', () => {
  const base = {
    totalStars: 0,
    clearedLevels: 0,
    highestCleared: -1,
    bestCombo: 0,
    endlessBest: 0,
    tutorialDone: false,
    dailyPlays: 0,
    hardcoreClears: 0,
  };
  it('Startausrüstung ist verfügbar, alles andere gesperrt', () => {
    const open = EFFECTS.filter((e) => isUnlocked(e, base));
    expect(open.every((e) => e.requirement.type === 'none')).toBe(true);
    expect(open.length).toBe(4);
  });
  it('meldet neu freigeschaltete Effekte', () => {
    const after = { ...base, totalStars: 12, tutorialDone: true };
    const ids = newlyUnlocked(base, after).map((e) => e.id);
    expect(ids).toEqual(expect.arrayContaining(['octa', 'sparks', 'infrared', 'mono']));
  });
  it('jede Bedingung hat einen Text', () => {
    for (const e of EFFECTS) expect(requirementText(e.requirement).length).toBeGreaterThan(5);
  });
});

describe('Zustandsautomat', () => {
  it('erlaubt nur gültige Übergänge', () => {
    const fsm = new StateMachine();
    expect(fsm.go('playing')).toBe(false);
    expect(fsm.go('countdown')).toBe(true);
    expect(fsm.go('playing')).toBe(true);
    expect(fsm.go('paused')).toBe(true);
    expect(fsm.go('results')).toBe(false);
    expect(fsm.go('countdown')).toBe(true);
    expect(fsm.go('playing')).toBe(true);
    expect(fsm.go('results')).toBe(true);
    expect(fsm.go('countdown')).toBe(true);
  });
});
