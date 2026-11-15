import { describe, it, expect } from 'vitest';
import { pick } from '../src/ui/padnav';

const R = (x: number, y: number, w = 100, h = 40) => ({ left: x, top: y, right: x + w, bottom: y + h, width: w, height: h, x, y }) as DOMRect;
const el = (n: string) => ({ n }) as unknown as HTMLElement;

describe('Konsolen-Menüsteuerung', () => {
  // 2×2-Kacheln: a b / c d
  const a = el('a'), b = el('b'), c = el('c'), d = el('d');
  const cands = [{ el: b, r: R(120, 0) }, { el: c, r: R(0, 60) }, { el: d, r: R(120, 60) }];
  it('wählt in Richtung das nächste Feld derselben Zeile/Spalte', () => {
    expect(pick(R(0, 0), cands, 'right')).toBe(b);
    expect(pick(R(0, 0), cands, 'down')).toBe(c);
    expect(pick(R(0, 0), cands, 'up')).toBeNull();
    expect(pick(R(120, 60), [{ el: a, r: R(0, 0) }, { el: b, r: R(120, 0) }, { el: c, r: R(0, 60) }], 'up')).toBe(b);
  });
});
