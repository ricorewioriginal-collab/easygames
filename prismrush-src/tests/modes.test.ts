import { describe, expect, it } from 'vitest';
import { DIFFICULTIES } from '../src/game/difficulty';
import { LEVELS } from '../src/game/levels';
import {
  MODES,
  SELECTABLE_MODES,
  SPRINT_LEVEL,
  buildTrack,
  levelTrack,
  mirrorEvent,
  remixLevel,
  speedFactor,
} from '../src/game/modes';
import { GameSession } from '../src/game/session';
import { singleSongTrack, type Track } from '../src/game/track';
import { generateSong } from '../src/audio/music';

const FRAME = 1 / 60;

function manualTrack(
  evs: { step: number; kind: 'note' | 'orb' | 'wall'; lane: number; lanes: number[] }[],
): Track {
  const song = generateSong({ seed: 1, bpm: 120, bars: 8, style: 'synthwave' });
  return singleSongTrack({ song, params: null, events: evs });
}

describe('Spielmodi', () => {
  it('bietet mindestens zwölf wählbare Modi mit gültiger Strecke', () => {
    expect(SELECTABLE_MODES.length).toBeGreaterThanOrEqual(12);
    for (const id of SELECTABLE_MODES) {
      const level = id === 'sprint' ? SPRINT_LEVEL : id === 'remix' ? remixLevel(7) : LEVELS[2];
      const track = buildTrack(id, level, 'normal', 42);
      expect(track.events.length, id).toBeGreaterThan(0);
      const ids = new Set(track.events.map((e) => e.id));
      expect(ids.size, id).toBe(track.events.length);
      for (const e of track.events) {
        expect(e.lane).toBeGreaterThanOrEqual(0);
        expect(e.lane).toBeLessThan(3);
      }
    }
  });

  it('Spiegelwelt vertauscht links und rechts', () => {
    const normal = levelTrack(LEVELS[5], 'hard');
    const mirrored = levelTrack(LEVELS[5], 'hard', MODES.mirror);
    expect(mirrored.events.length).toBe(normal.events.length);
    normal.events.forEach((e, i) => {
      const m = mirrored.events[i];
      expect(m.id).toBe(i);
      expect(m.lanes).toEqual(e.lanes.map((l) => 2 - l).sort((a, b) => a - b));
      if (e.kind !== 'wall') expect(m.lane).toBe(2 - e.lane);
    });
    expect(mirrorEvent(mirrorEvent(normal.events[0]))).toEqual(normal.events[0]);
  });

  it('Turbo beschleunigt das Tempo, Wandlauf erzeugt mehr Wände', () => {
    const lvl = LEVELS[10];
    expect(levelTrack(lvl, 'normal', MODES.turbo).bpm).toBeGreaterThan(
      levelTrack(lvl, 'normal').bpm,
    );
    const walls = (t: Track) => t.events.filter((e) => e.kind === 'wall').length;
    expect(walls(levelTrack(lvl, 'normal', MODES.gauntlet))).toBeGreaterThan(
      walls(levelTrack(lvl, 'normal')),
    );
  });

  it('Remix ist pro Seed stabil und behält die Highscore-ID', () => {
    expect(remixLevel(123)).toEqual(remixLevel(123));
    expect(remixLevel(123).id).toBe('remix');
    expect(remixLevel(124).seed).not.toBe(remixLevel(123).seed);
  });

  it('Geschwindigkeitsfaktor je Modus', () => {
    expect(speedFactor('campaign', 100)).toBe(1);
    expect(speedFactor('turbo', 0)).toBe(1.3);
    expect(speedFactor('endless', 0)).toBe(1);
    expect(speedFactor('endless', 9999)).toBeCloseTo(1.6);
    expect(speedFactor('sprint', 9999)).toBeCloseTo(1.4);
  });
});

describe('Modusregeln in der Sitzung', () => {
  it('Spurwechsel trifft den Kristall in der neuen Spur', () => {
    const track = manualTrack([{ step: 16, kind: 'note', lane: 2, lanes: [2] }]);
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.normal);
    const t = track.events[0].time;
    s.update(t - 0.01);
    expect(s.shift(1, t)).toBe('perfect'); // Start in Spur 1, Wechsel nach rechts trifft
    expect(s.lane).toBe(2);
    expect(s.shift(1, t)).toBeNull(); // schon ganz rechts, Kristall bereits getroffen
    expect(s.lane).toBe(2);
    expect(s.shift(-1, t)).toBeNull();
    expect(s.lane).toBe(1);
  });

  it('Gleitflug sammelt Kristalle in der eigenen Spur automatisch', () => {
    const track = manualTrack([
      { step: 16, kind: 'note', lane: 1, lanes: [1] },
      { step: 24, kind: 'note', lane: 0, lanes: [0] },
    ]);
    const s = new GameSession(track, MODES.glide, DIFFICULTIES.normal);
    for (let t = 0; t < track.duration + 1 && s.status === 'playing'; t += FRAME) s.update(t);
    expect(s.score.counts.perfect + s.score.counts.great).toBe(1);
    expect(s.score.counts.miss).toBe(1);
  });

  it('Sprint endet nach dem Zeitlimit erfolgreich', () => {
    const track = buildTrack('sprint', SPRINT_LEVEL, 'easy', 1);
    const s = new GameSession(track, { ...MODES.sprint, canFail: false }, DIFFICULTIES.easy);
    for (let t = 0; t < 100 && s.status === 'playing'; t += 0.25) s.update(t);
    expect(s.status).toBe('complete');
    expect(s.time).toBeGreaterThanOrEqual(90);
    expect(s.time).toBeLessThan(91);
  });

  it('Wandlauf belohnt ausgewichene Wände', () => {
    const track = manualTrack([{ step: 16, kind: 'wall', lane: 0, lanes: [0] }]);
    const s = new GameSession(track, MODES.gauntlet, DIFFICULTIES.normal);
    for (let t = 0; t < track.duration + 1 && s.status === 'playing'; t += FRAME) s.update(t);
    expect(s.score.wallHits).toBe(0);
    expect(s.score.score).toBeGreaterThanOrEqual(40);
  });
});
