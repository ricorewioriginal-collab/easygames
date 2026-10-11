import { describe, expect, it } from 'vitest';
import { parseToGuest, parseToHost } from './p2p';

describe('P2P-Nachrichten', () => {
  it('Gastnachrichten werden streng geprüft', () => {
    expect(parseToHost({ t: 'hello', v: 1, name: '  <b>Eva</b> ', character: 'pip' })).toEqual({
      t: 'hello',
      v: 1,
      name: 'bEva/b',
      character: 'pip',
    });
    expect(parseToHost({ t: 'hello', v: 2, name: 'Eva', character: 'pip' })).toBeNull();
    expect(parseToHost({ t: 'hello', v: 1, name: '', character: 'pip' })).toBeNull();
    expect(parseToHost({ t: 'hello', v: 1, name: 'Eva', character: 'drache' })).toBeNull();
    expect(parseToHost({ t: 'ready', ready: 'ja' })).toBeNull();
    expect(parseToHost({ t: 'ready', ready: true })).toEqual({ t: 'ready', ready: true });
    expect(parseToHost({ t: 'act', action: { type: 'roll' } })).toEqual({
      t: 'act',
      action: { type: 'roll' },
    });
    expect(parseToHost({ t: 'act', action: { type: 'cheat' } })).toBeNull();
    expect(parseToHost({ t: 'act', action: { type: 'chooseBranch', node: -3 } })).toBeNull();
    expect(parseToHost(null)).toBeNull();
    expect(parseToHost('x')).toBeNull();
    expect(parseToHost({ t: 'ping', n: NaN })).toBeNull();
  });
  it('Gastgeber-Nachrichten: Lobby wird bereinigt, Müll abgelehnt', () => {
    const ok = parseToGuest({
      t: 'lobby',
      lobby: {
        phase: 'lobby',
        layoutId: 'prismara-01',
        rounds: 99,
        slots: [
          {
            id: 'p1',
            name: 'Eva',
            character: 'pip',
            kind: 'human',
            difficulty: 'normal',
            ready: true,
            connected: true,
            host: true,
          },
        ],
      },
    });
    expect(ok?.t).toBe('lobby');
    if (ok?.t === 'lobby') expect(ok.lobby.rounds).toBe(30);
    expect(
      parseToGuest({ t: 'lobby', lobby: { slots: new Array(9).fill({}), layoutId: 'x', rounds: 3 } }),
    ).toBeNull();
    expect(parseToGuest({ t: 'update', msg: { seq: 'x' } })).toBeNull();
    expect(parseToGuest({ t: 'nix' })).toBeNull();
    expect(parseToGuest({ t: 'kick' })).toEqual({ t: 'kick', reason: '' });
  });
});
