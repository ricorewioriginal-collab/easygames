import { describe, expect, it } from 'vitest';
import { DIFFICULTIES } from '../src/game/difficulty';
import { LEVELS } from '../src/game/levels';
import { MODES, endlessTrack, levelTrack } from '../src/game/modes';
import { GameSession, type SessionEvent } from '../src/game/session';
import { singleSongTrack, type Track } from '../src/game/track';
import { generateSong } from '../src/audio/music';

const FRAME = 1 / 60;

/** Spielt mit einem perfekten Bot in 60-FPS-Schritten bis zum Ende. */
function playPerfect(session: GameSession, track: Track, maxSeconds = 400): SessionEvent[] {
  const events: SessionEvent[] = [];
  session.on((e) => events.push(e));
  for (let t = 0; t < maxSeconds && session.status === 'playing'; t += FRAME) {
    let n = session.nextNote();
    while (n && n.time <= t + FRAME) {
      session.pressLane(n.lane, n.time);
      n = session.nextNote();
    }
    session.lane = session.safeLaneAt(t + FRAME, session.lane);
    session.update(t);
  }
  void track;
  return events;
}

function manualTrack(
  evs: { step: number; kind: 'note' | 'orb' | 'wall'; lane: number; lanes: number[] }[],
): Track {
  const song = generateSong({ seed: 1, bpm: 120, bars: 8, style: 'synthwave' });
  return singleSongTrack({ song, params: null, events: evs });
}

describe('Spielsitzung', () => {
  it('perfektes Spiel schließt das Level mit nur perfekten Treffern ab', () => {
    const track = levelTrack(LEVELS[3], 'hard');
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.hard);
    const events = playPerfect(s, track);
    expect(s.status).toBe('complete');
    const notes = track.events.filter((e) => e.kind === 'note').length;
    expect(s.score.counts.perfect).toBe(notes);
    expect(s.score.counts.miss).toBe(0);
    expect(s.score.wallHits).toBe(0);
    expect(s.score.maxCombo).toBe(notes);
    expect(s.score.accuracy()).toBe(1);
    expect(events.filter((e) => e.type === 'complete')).toHaveLength(1);
  });

  it('ohne Eingaben werden Noten verfehlt und der Lauf scheitert', () => {
    const track = levelTrack(LEVELS[20], 'extreme');
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.extreme);
    let failed = false;
    s.on((e) => {
      if (e.type === 'fail') failed = true;
    });
    for (let t = 0; t < track.duration + 1 && s.status === 'playing'; t += FRAME) s.update(t);
    expect(failed).toBe(true);
    expect(s.status).toBe('failed');
    expect(s.score.counts.miss).toBeGreaterThan(0);
  });

  it('Zen-Modus scheitert nie', () => {
    const track = levelTrack(LEVELS[20], 'extreme');
    const s = new GameSession(track, MODES.zen, DIFFICULTIES.extreme);
    for (let t = 0; t < track.duration + 1 && s.status === 'playing'; t += FRAME) s.update(t);
    expect(s.status).toBe('complete');
  });

  it('Präzisionsmodus endet beim ersten Fehler', () => {
    const track = manualTrack([
      { step: 16, kind: 'note', lane: 1, lanes: [1] },
      { step: 32, kind: 'note', lane: 1, lanes: [1] },
    ]);
    const s = new GameSession(track, MODES.hardcore, DIFFICULTIES.normal);
    for (let t = 0; t < 3 && s.status === 'playing'; t += FRAME) s.update(t);
    expect(s.status).toBe('failed');
    expect(s.score.counts.miss).toBe(1);
  });

  it('Treffer werden nach Zeitabstand bewertet', () => {
    const track = manualTrack([
      { step: 16, kind: 'note', lane: 0, lanes: [0] },
      { step: 32, kind: 'note', lane: 2, lanes: [2] },
      { step: 48, kind: 'note', lane: 1, lanes: [1] },
    ]);
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.hard);
    const t0 = track.events[0].time;
    s.update(t0 - 0.5);
    expect(s.pressLane(0, t0 - 0.5)).toBeNull(); // zu früh: keine Strafe
    expect(s.pressLane(0, t0 + 0.02)).toBe('perfect');
    const t1 = track.events[1].time;
    s.update(t1);
    expect(s.pressLane(2, t1 + 0.08)).toBe('great');
    const t2 = track.events[2].time;
    s.update(t2);
    expect(s.pressLane(0, t2)).toBeNull(); // falsche Spur
    expect(s.hit(t2 + 0.13)).toBeNull(); // aktuelle Spur ist 0
    s.shift(1);
    expect(s.lane).toBe(1);
    expect(s.hit(t2 + 0.13)).toBe('good');
    expect(s.score.combo).toBe(3);
  });

  it('Wände verursachen Schaden und brechen die Combo', () => {
    const track = manualTrack([
      { step: 16, kind: 'note', lane: 1, lanes: [1] },
      { step: 24, kind: 'wall', lane: 1, lanes: [1] },
      { step: 40, kind: 'wall', lane: 0, lanes: [0, 2] },
    ]);
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.normal);
    const walls: boolean[] = [];
    s.on((e) => e.type === 'wall' && walls.push(e.damaged));
    s.update(track.events[0].time);
    s.pressLane(1, track.events[0].time);
    expect(s.score.combo).toBe(1);
    s.update(track.events[1].time + 0.01);
    expect(walls).toEqual([true]);
    expect(s.score.combo).toBe(0);
    expect(s.health).toBeLessThan(1);
    s.update(track.events[2].time + 0.01);
    expect(walls).toEqual([true, false]);
  });

  it('Orbs werden nur in der richtigen Spur eingesammelt', () => {
    const track = manualTrack([
      { step: 16, kind: 'orb', lane: 1, lanes: [1] },
      { step: 20, kind: 'orb', lane: 2, lanes: [2] },
    ]);
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.normal);
    s.update(track.events[1].time + 0.01);
    expect(s.score.orbs).toBe(1);
    expect(s.score.orbsTotal).toBe(2);
    expect(s.isGone(track.events[0].id)).toBe(true);
    expect(s.isGone(track.events[1].id)).toBe(false);
  });

  it('Overdrive verdoppelt Punkte und läuft ab', () => {
    const evs = Array.from({ length: 40 }, (_, i) => ({
      step: 16 + i * 4,
      kind: 'note' as const,
      lane: 1,
      lanes: [1],
    }));
    const track = manualTrack(evs);
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.normal);
    expect(s.activateOverdrive()).toBe(false);
    s.energy = 1;
    s.update(track.events[0].time);
    expect(s.activateOverdrive()).toBe(true);
    expect(s.overdriveActive).toBe(true);
    expect(s.multiplier).toBe(2);
    s.pressLane(1, track.events[0].time);
    const scored = s.score.score;
    expect(scored).toBe(300 * 1.25 * 2);
    s.update(track.events[0].time + 60);
    expect(s.overdriveActive).toBe(false);
  });

  it('Neustart erzeugt eine frische, identische Strecke', () => {
    const a = levelTrack(LEVELS[0], 'normal');
    const b = levelTrack(LEVELS[0], 'normal');
    expect(a.events).toEqual(b.events);
    const s = new GameSession(b, MODES.campaign, DIFFICULTIES.normal);
    expect(s.score.score).toBe(0);
    expect(s.health).toBe(1);
  });

  it('Endlos-Modus läuft über mehrere Abschnitte', () => {
    const track = endlessTrack(77, 'normal');
    const s = new GameSession(track, MODES.endless, DIFFICULTIES.normal);
    playPerfect(s, track, 100);
    expect(s.status).toBe('playing');
    expect(s.score.counts.perfect).toBeGreaterThan(50);
    expect(s.score.counts.miss).toBe(0);
  });

  it('skipTo überspringt ohne Wertung', () => {
    const track = levelTrack(LEVELS[1], 'normal');
    const s = new GameSession(track, MODES.campaign, DIFFICULTIES.normal);
    s.skipTo(track.duration - 2);
    s.update(track.duration - 2);
    expect(s.score.counts.miss).toBe(0);
    playPerfect(s, track);
    expect(s.status).toBe('complete');
  });
});
