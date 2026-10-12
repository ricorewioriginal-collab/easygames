import { describe, expect, it } from 'vitest';
import {
  STEPS_PER_BAR,
  generateSong,
  layoutSections,
  secondsToStep,
  stepToSeconds,
} from '../src/audio/music';
import { degreeToMidi, midiToFreq, SCALES } from '../src/audio/theory';
import { hashString, mulberry32 } from '../src/core/rng';

describe('Zufall', () => {
  it('ist deterministisch', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });
  it('liefert Werte in [0,1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('hasht Texte stabil', () => {
    expect(hashString('prism')).toBe(hashString('prism'));
    expect(hashString('prism')).not.toBe(hashString('rush'));
  });
});

describe('Musiktheorie', () => {
  it('rechnet MIDI in Frequenz um', () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(81)).toBeCloseTo(880);
  });
  it('bildet Skalenstufen über Oktaven ab', () => {
    expect(degreeToMidi(60, SCALES.major, 0)).toBe(60);
    expect(degreeToMidi(60, SCALES.major, 7)).toBe(72);
    expect(degreeToMidi(60, SCALES.major, -1)).toBe(59);
  });
});

describe('Taktzeit', () => {
  it('Schritte und Sekunden sind zueinander invers', () => {
    for (const bpm of [96, 128, 174]) {
      for (const step of [0, 1, 16, 333]) {
        expect(secondsToStep(stepToSeconds(step, bpm), bpm)).toBeCloseTo(step, 9);
      }
    }
  });
  it('ein Takt bei 120 BPM dauert 2 Sekunden', () => {
    expect(stepToSeconds(STEPS_PER_BAR, 120)).toBeCloseTo(2);
  });
});

describe('Songgenerator', () => {
  const spec = { seed: 1234, bpm: 120, bars: 32, style: 'trance' as const };

  it('ist deterministisch', () => {
    expect(generateSong(spec)).toEqual(generateSong(spec));
  });

  it('unterscheidet sich je Seed', () => {
    const a = generateSong(spec)
      .notes.map((n) => n.midi)
      .join();
    const b = generateSong({ ...spec, seed: 99 })
      .notes.map((n) => n.midi)
      .join();
    expect(a).not.toBe(b);
  });

  it('liegt vollständig innerhalb des Songs und ist sortiert', () => {
    for (const style of ['synthwave', 'trance', 'techno', 'dnb', 'breakbeat', 'ambient'] as const) {
      const song = generateSong({ ...spec, style });
      expect(song.notes.length).toBeGreaterThan(100);
      let prev = -1;
      for (const n of song.notes) {
        expect(n.step).toBeGreaterThanOrEqual(prev);
        expect(n.step).toBeLessThan(song.totalSteps);
        expect(n.vel).toBeGreaterThan(0);
        expect(n.vel).toBeLessThanOrEqual(1);
        prev = n.step;
      }
      expect(song.notes.some((n) => n.inst === 'kick')).toBe(true);
      expect(song.notes.some((n) => n.inst === 'lead')).toBe(true);
    }
  });

  it('Abschnitte decken alle Takte lückenlos ab', () => {
    for (const bars of [8, 16, 24, 32, 44]) {
      const secs = layoutSections(bars);
      expect(secs[0].startBar).toBe(0);
      let end = 0;
      for (const s of secs) {
        expect(s.startBar).toBe(end);
        end += s.bars;
      }
      expect(end).toBe(bars);
    }
    expect(layoutSections(16, true).every((s) => s.kind !== 'intro' && s.kind !== 'outro')).toBe(
      true,
    );
  });
});
