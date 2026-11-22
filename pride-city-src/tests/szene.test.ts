import { describe, it, expect } from 'vitest';
import { SZENE, SZENE_IDS, szeneFor, STREET_SZENE, szeneOutfit } from '../src/game/szene';
import { guestCast } from '../src/game/flirt';
import { STYLES } from '../src/game/queer';

describe('Szene-Figuren', () => {
  it('alle Arten vollständig, Looks existieren', () => {
    expect(SZENE_IDS.length).toBeGreaterThanOrEqual(10);
    for (const t of Object.values(SZENE)) {
      expect(t.hello.length && t.tease.length && t.act.lines.length).toBeTruthy();
      if (t.style) expect(STYLES[t.style]).toBeTruthy();
    }
    for (const [id] of STREET_SZENE) expect(SZENE[id]).toBeTruthy();
  });
  it('ohne 18+ keine kinky Arten und kein Harness', () => {
    for (const t of szeneFor('club', false)) { expect(t.adult).toBeFalsy(); expect(szeneOutfit(t, false)).not.toBe('harness'); }
    expect(szeneFor('dark', true).some((t) => t.id === 'pup')).toBe(true);
  });
  it('Clubs bekommen Szene-Gäste', () => {
    const g = guestCast('prisma|x', 6, { adult: true, party: true });
    expect(g.some((x) => x.typ)).toBe(true);
  });
});
