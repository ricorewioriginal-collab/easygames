import { describe, expect, it } from 'vitest';
import { mapKey } from '../src/input/actions';
import { SwipeTracker, classifyGesture, laneFromX } from '../src/input/gestures';

describe('Tastatur', () => {
  it('bildet Tasten auf Aktionen ab', () => {
    expect(mapKey('KeyA')).toEqual({ type: 'lane', lane: 0 });
    expect(mapKey('KeyS')).toEqual({ type: 'lane', lane: 1 });
    expect(mapKey('ArrowLeft')).toEqual({ type: 'shift', dir: -1 });
    expect(mapKey('ArrowRight')).toEqual({ type: 'shift', dir: 1 });
    expect(mapKey('ArrowDown')).toEqual({ type: 'hit' });
    expect(mapKey('KeyL')).toEqual({ type: 'lane', lane: 2 });
    expect(mapKey('Space')).toEqual({ type: 'hit' });
    expect(mapKey('KeyE')).toEqual({ type: 'overdrive' });
    expect(mapKey('Escape')).toEqual({ type: 'pause' });
    expect(mapKey('KeyZ')).toBeNull();
  });
});

describe('Gesten', () => {
  it('erkennt Tippen und Wischen', () => {
    expect(classifyGesture(2, 3, 100)).toBe('tap');
    expect(classifyGesture(2, 3, 900)).toBeNull();
    expect(classifyGesture(-60, 5, 120)).toBe('swipe-left');
    expect(classifyGesture(60, -10, 120)).toBe('swipe-right');
    expect(classifyGesture(5, -80, 120)).toBe('swipe-up');
    expect(classifyGesture(5, 80, 120)).toBe('swipe-down');
    expect(classifyGesture(20, 0, 100)).toBeNull();
  });
  it('bestimmt die Spur aus der X-Position', () => {
    expect(laneFromX(10, 300)).toBe(0);
    expect(laneFromX(150, 300)).toBe(1);
    expect(laneFromX(299, 300)).toBe(2);
    expect(laneFromX(-5, 300)).toBe(0);
    expect(laneFromX(500, 300)).toBe(2);
    expect(laneFromX(10, 0)).toBe(1);
  });
  it('meldet Wischer sofort und erlaubt Ketten', () => {
    const t = new SwipeTracker();
    t.down(1, 100, 100, 0);
    expect(t.move(1, 110, 100, 10)).toBeNull();
    expect(t.move(1, 140, 100, 20)).toBe('swipe-right');
    expect(t.move(1, 150, 100, 30)).toBeNull();
    expect(t.move(1, 185, 100, 40)).toBe('swipe-right');
    t.up(1);
    expect(t.active).toBe(0);
    expect(t.move(1, 0, 0, 50)).toBeNull();
  });
});
