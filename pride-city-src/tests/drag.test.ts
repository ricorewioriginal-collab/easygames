import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { lookOf, lookKey, match, dragStyle, playerDrag, PARTS } from '../src/game/dragLook';
import { STYLES } from '../src/game/queer';

describe('Drag-Look', () => {
  it('liest und speichert den Look, unbekannte Teile fallen auf den Standard zurück', () => {
    const s = defaults();
    expect(lookOf(s.flags)).toEqual({ kleid: 'pink', schnitt: 'lang', beine: 'pink', peruecke: 'pink' });
    s.flags.dragLook = lookKey({ kleid: 'gold', schnitt: 'crop', beine: 'gold', peruecke: 'gibtsnicht' });
    expect(lookOf(s.flags)).toEqual({ kleid: 'gold', schnitt: 'crop', beine: 'gold', peruecke: 'pink' });
  });
  it('zählt passende Teile je Kategorie', () => {
    const royal = { kleid: 'gold', schnitt: 'lang', beine: 'gold', peruecke: 'rot' };
    expect(match(royal, 'royal')).toBe(PARTS.length);
    expect(match(royal, 'neon')).toBe(0);
  });
  it('wird als Szene-Look registriert und nur im Drag getragen', () => {
    const s = defaults();
    expect(playerDrag(s.flags)).toBeUndefined();
    s.flags.dragOn = true;
    const id = playerDrag(s.flags)!;
    expect(STYLES[id]?.top).toEqual({ glitter: 0xff2fd2, crop: false });
    expect(dragStyle({ kleid: 'regenbogen', schnitt: 'crop', beine: 'netz', peruecke: 'lila' })).toBe('drag_regenbogen_crop_netz_lila');
    expect(STYLES.drag_regenbogen_crop_netz_lila.top).toEqual({ flag: 'rainbow', crop: true });
  });
});
