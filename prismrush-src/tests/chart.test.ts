import { describe, expect, it } from 'vitest';
import { generateSong, stepToSeconds } from '../src/audio/music';
import { LANES } from '../src/game/chart';
import { DIFFICULTY_ORDER } from '../src/game/difficulty';
import { LEVELS } from '../src/game/levels';
import { dailyLevel, endlessTrack, levelTrack } from '../src/game/modes';
import { tutorialTrack } from '../src/game/tutorial';

describe('Level', () => {
  it('es gibt mindestens 30 eindeutige Level', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
    expect(new Set(LEVELS.map((l) => l.name)).size).toBe(LEVELS.length);
    expect(new Set(LEVELS.map((l) => l.seed)).size).toBe(LEVELS.length);
  });

  it('Level werden schwerer', () => {
    expect(LEVELS[LEVELS.length - 1].density).toBeGreaterThan(LEVELS[0].density);
    expect(LEVELS[LEVELS.length - 1].bpm).toBeGreaterThan(LEVELS[0].bpm);
  });
});

describe('Chart', () => {
  it('ist für jedes Level und jede Schwierigkeit spielbar', () => {
    for (const level of LEVELS) {
      for (const d of DIFFICULTY_ORDER) {
        const track = levelTrack(level, d);
        const evs = track.events;
        expect(evs.length).toBeGreaterThan(20);
        const notes = evs.filter((e) => e.kind === 'note');
        expect(notes.length).toBeGreaterThan(15);
        for (let i = 0; i < evs.length; i++) {
          const e = evs[i];
          expect(e.lane).toBeGreaterThanOrEqual(0);
          expect(e.lane).toBeLessThan(LANES);
          expect(e.time).toBeLessThan(track.duration);
          if (i > 0) expect(e.time).toBeGreaterThanOrEqual(evs[i - 1].time);
          if (e.kind === 'wall') {
            // Mindestens eine Spur bleibt frei.
            expect(e.lanes.length).toBeLessThan(LANES);
            // Keine Note in einer blockierten Spur kurz davor oder danach.
            for (const n of notes) {
              if (Math.abs(n.step - e.step) <= 3) expect(e.lanes).not.toContain(n.lane);
            }
          }
        }
      }
    }
  });

  it('Ereigniszeiten folgen exakt dem Musiktakt', () => {
    const level = LEVELS[5];
    const track = levelTrack(level, 'normal');
    for (const e of track.events) {
      expect(e.time).toBeCloseTo(stepToSeconds(e.step, level.bpm), 10);
    }
    // Jede Note liegt auf einem Schlag, an dem auch Musik erklingt.
    const song = generateSong({
      seed: level.seed,
      bpm: level.bpm,
      bars: level.bars,
      style: level.style,
    });
    const musical = new Set(
      song.notes
        .filter((n) => ['kick', 'snare', 'clap', 'lead', 'hat', 'openhat', 'arp'].includes(n.inst))
        .map((n) => n.step),
    );
    for (const e of track.events.filter((x) => x.kind === 'note'))
      expect(musical.has(e.step)).toBe(true);
  });

  it('höhere Schwierigkeit erzeugt mehr Noten', () => {
    const easy = levelTrack(LEVELS[10], 'easy').events.filter((e) => e.kind === 'note').length;
    const extreme = levelTrack(LEVELS[10], 'extreme').events.filter(
      (e) => e.kind === 'note',
    ).length;
    expect(extreme).toBeGreaterThan(easy);
  });

  it('Endlos-Strecke wächst bei Bedarf', () => {
    const t = endlessTrack(5, 'normal');
    const n0 = t.events.length;
    t.ensureUntil(16 * 16 * 3);
    expect(t.events.length).toBeGreaterThan(n0);
    expect(t.duration).toBe(Infinity);
    const ids = t.events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const notes = t.notesInRange(16 * 16, 16 * 16 + 16);
    expect(notes.length).toBeGreaterThan(0);
    for (const n of notes) {
      expect(n.step).toBeGreaterThanOrEqual(256);
      expect(n.step).toBeLessThan(272);
    }
  });

  it('Tageslevel ist pro Datum stabil', () => {
    const a = dailyLevel(new Date(2026, 9, 12));
    const b = dailyLevel(new Date(2026, 9, 12));
    const c = dailyLevel(new Date(2026, 9, 13));
    expect(a).toEqual(b);
    expect(a.seed).not.toBe(c.seed);
  });

  it('Tutorial enthält alle Lektionen', () => {
    const t = tutorialTrack();
    const kinds = new Set(t.events.map((e) => e.kind));
    expect(kinds).toEqual(new Set(['note', 'orb', 'wall']));
  });
});
