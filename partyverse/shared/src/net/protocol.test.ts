import { describe, expect, it } from 'vitest';
import { cleanName, isRoomCode, makeRoomCode, parseAction, parseClientMessage } from './protocol';
import { Rng } from '../rng';

describe('Protokoll-Validierung', () => {
  it('akzeptiert gültige Nachrichten und bereinigt Namen', () => {
    expect(parseClientMessage({ type: 'lobby:ready', ready: true })).toEqual({ type: 'lobby:ready', ready: true });
    expect(parseClientMessage({ type: 'lobby:profile', name: '  <b>Rico</b>  ', character: 'pip' })).toEqual({ type: 'lobby:profile', name: 'bRico/b', character: 'pip' });
    expect(parseClientMessage({ type: 'lobby:config', layoutId: 'nova-nexus-03', rounds: 12 })).toEqual({ type: 'lobby:config', layoutId: 'nova-nexus-03', rounds: 12 });
    expect(parseClientMessage({ type: 'game:action', action: { type: 'roll' } })).toEqual({ type: 'game:action', action: { type: 'roll' } });
    expect(parseClientMessage({ type: 'game:action', action: { type: 'useItem', item: 'frostuhr', target: 'p1' } })).toBeTruthy();
  });
  it('lehnt ungültige und böswillige Nachrichten ab', () => {
    for (const bad of [null, 5, 'x', [], {}, { type: 5 }, { type: 'boom' }, { type: 'lobby:ready', ready: 'ja' }, { type: 'lobby:profile', character: 'drache' }, { type: 'lobby:profile', name: '\u0000\u0001' },
      { type: 'lobby:config', rounds: 99 }, { type: 'lobby:config', rounds: 1.5 }, { type: 'lobby:config', layoutId: '../../etc' }, { type: 'lobby:addBot', difficulty: 'god' },
      { type: 'game:action', action: { type: 'chooseBranch', node: -1 } }, { type: 'game:action', action: { type: 'useItem', item: 'bombe' } }, { type: 'game:action', action: { type: 'minigameSubmit', log: ['a'] } },
      { type: 'game:action', action: { type: 'minigameSubmit', log: new Array(40000).fill(0) } }, { type: 'game:action', action: { type: 'shopBuy', index: 1000 } }]) {
      expect(parseClientMessage(bad as never)).toBeNull();
    }
  });
  it('Aktions-Prüfung gibt nur bekannte Felder weiter', () => {
    expect(parseAction({ type: 'altar', buy: true, extra: 'hack' })).toEqual({ type: 'altar', buy: true });
    expect(parseAction({ type: 'gate', choice: 'bribe' })).toBeNull();
  });
  it('Namen und Raumcodes', () => {
    expect(cleanName('A'.repeat(50))).toHaveLength(14);
    expect(cleanName(42)).toBe('');
    const r = new Rng(3);
    for (let i = 0; i < 200; i++) expect(isRoomCode(makeRoomCode(() => r.next()))).toBe(true);
    expect(isRoomCode('ABCD1')).toBe(false);
    expect(isRoomCode('abcd')).toBe(false);
    expect(isRoomCode('AB0O')).toBe(false);
  });
});
