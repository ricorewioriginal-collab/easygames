import { describe, expect, it } from 'vitest';
import { parseToGuest, parseToHost } from './p2p';

describe('P2P-Nachrichten', () => {
  it('Gastnachrichten werden streng geprüft', () => {
    expect(parseToHost({ t: 'hello', v: 1, name: '  <b>Eva</b> ', look: { body: 'pfeil', decal: 'blitz', accent: '#ff00aa' } })).toEqual({ t: 'hello', v: 1, name: 'bEva/b', look: { body: 'pfeil', decal: 'blitz', accent: '#ff00aa' } });
    expect(parseToHost({ t: 'hello', v: 2, name: 'Eva' })).toBeNull();
    expect(parseToHost({ t: 'hello', v: 1, name: '' })).toBeNull();
    expect(parseToHost({ t: 'hello', v: 1, name: 'Eva', look: { body: '<script>', accent: 'rot' } })).toEqual({ t: 'hello', v: 1, name: 'Eva', look: { body: 'flitzer', decal: 'keins', accent: '' } });
    expect(parseToHost({ t: 'team', team: 2 })).toBeNull();
    expect(parseToHost({ t: 'team', team: 1 })).toEqual({ t: 'team', team: 1 });
    expect(parseToHost({ t: 'ready', ready: 'ja' })).toBeNull();
    expect(parseToHost({ t: 'ping', n: NaN })).toBeNull();
    expect(parseToHost(null)).toBeNull();
    expect(parseToHost('x')).toBeNull();
  });
  it('Eingaben werden geklemmt', () => {
    const m = parseToHost({ t: 'input', seq: 5, i: { throttle: 99, steer: -99, pitch: 'x', jump: 1, boost: true } });
    expect(m).toEqual({ t: 'input', seq: 5, i: { throttle: 1, steer: -1, pitch: 0, yaw: 0, roll: 0, jump: false, boost: true, handbrake: false } });
    expect(parseToHost({ t: 'input', seq: 'a', i: {} })).toBeNull();
  });
  it('Gastgeber-Nachrichten: Lobby wird bereinigt, Müll abgelehnt', () => {
    const ok = parseToGuest({ t: 'lobby', lobby: { teamSize: 7, minutes: 99, arena: 'neon', slots: [{ id: 'p1', name: 'Eva', team: 0, kind: 'human', difficulty: 'normal', look: {}, ready: true, connected: true, host: true }] } });
    expect(ok?.t).toBe('lobby');
    if (ok?.t === 'lobby') {
      expect(ok.lobby.teamSize).toBe(2);
      expect(ok.lobby.minutes).toBe(10);
    }
    expect(parseToGuest({ t: 'lobby', lobby: { slots: new Array(9).fill({}) } })).toBeNull();
    expect(parseToGuest({ t: 'start', msg: { players: [], you: 0, seed: 1 } })).toBeNull();
    expect(parseToGuest({ t: 'events', tick: 1, events: [{ t: 'goal', team: 0 }, { t: 'boese' }, 5] })).toEqual({ t: 'events', tick: 1, events: [{ t: 'goal', team: 0 }] });
    expect(parseToGuest({ t: 'nix' })).toBeNull();
  });
  it('Start: Spieler und Zeit werden geprüft', () => {
    const p = { carId: 0, name: 'A', team: 0, kind: 'human', difficulty: 'normal', look: {} };
    const m = parseToGuest({ t: 'start', msg: { seed: 5, matchSeconds: 99999, arena: 'eis', you: 1, players: [p, { ...p, carId: 1, team: 1 }] } });
    expect(m?.t).toBe('start');
    if (m?.t === 'start') {
      expect(m.msg.matchSeconds).toBe(900);
      expect(m.msg.players).toHaveLength(2);
    }
    expect(parseToGuest({ t: 'start', msg: { seed: 5, you: 1, players: [{ ...p, team: 5 }, p] } })).toBeNull();
  });
});
