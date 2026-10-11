import { describe, expect, it } from 'vitest';
import { clampInput, type CarInput } from '@shared/sim/types';
import {
  KEY_RAMP_SECONDS,
  KEY_SCHEMES,
  keysToInput,
  rampInput,
  rampToward,
  schemeCodes,
  type KeySchemeId,
} from './keys';
import {
  PAD_BUTTON,
  gamepadButtons,
  gamepadToInput,
  shapeAxis,
  STICK_DEADZONE,
  type PadLike,
} from './gamepad';

const SCHEMES: KeySchemeId[] = ['wasd', 'pfeile'];

/** Tasten, die die Eingabe beeinflussen (ohne Einmal-Ereignisse) */
function inputCodes(id: KeySchemeId): string[] {
  const s = KEY_SCHEMES[id];
  return [...s.up, ...s.down, ...s.left, ...s.right, ...s.jump, ...s.boost, ...s.airRoll, ...s.handbrake];
}

describe('keysToInput', () => {
  it('liefert für alle Tastenkombinationen gültige Eingaben', () => {
    for (const id of SCHEMES) {
      const codes = inputCodes(id);
      for (let mask = 0; mask < 1 << codes.length; mask++) {
        const set = new Set(codes.filter((_, i) => mask & (1 << i)));
        for (const air of [undefined, true, false]) {
          const inp = keysToInput(set, id, air);
          expect(clampInput(inp)).toEqual(inp);
        }
      }
    }
  });

  it('Gegenrichtungen heben sich auf', () => {
    expect(keysToInput(new Set(['KeyW', 'KeyS', 'KeyA', 'KeyD']), 'wasd')).toMatchObject({
      throttle: 0,
      steer: 0,
      pitch: 0,
      yaw: 0,
    });
    expect(keysToInput(new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']), 'pfeile')).toMatchObject(
      { throttle: 0, steer: 0, pitch: 0, yaw: 0 },
    );
  });

  it('Boden: Gas und Lenken; Luft: S = Nase hoch, Air-Roll rollt statt zu gieren', () => {
    const g = keysToInput(new Set(['KeyW', 'KeyD']), 'wasd', false);
    expect(g).toMatchObject({ throttle: 1, steer: 1, pitch: 0, yaw: 0, roll: 0 });
    const a = keysToInput(new Set(['KeyS', 'KeyA']), 'wasd', true);
    expect(a).toMatchObject({ throttle: 0, steer: 0, pitch: 1, yaw: -1, roll: 0 });
    const r = keysToInput(new Set(['KeyS', 'KeyA', 'KeyE']), 'wasd', true);
    expect(r).toMatchObject({ pitch: 1, yaw: 0, roll: -1 });
  });

  it('Knöpfe: Sprung, Boost, Handbremse', () => {
    expect(keysToInput(new Set(['Space', 'ShiftLeft', 'KeyQ']), 'wasd')).toMatchObject({
      jump: true,
      boost: true,
      handbrake: true,
    });
    expect(keysToInput(new Set(['Numpad0', 'ShiftRight', 'Period']), 'pfeile')).toMatchObject({
      jump: true,
      boost: true,
      handbrake: true,
    });
  });

  it('die Schemata der beiden Spieler überschneiden sich in keiner Taste', () => {
    const a = schemeCodes('wasd');
    const b = new Set(schemeCodes('pfeile'));
    expect(a.filter((c) => b.has(c))).toEqual([]);
    for (const id of SCHEMES) {
      const all = schemeCodes(id);
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it('Spieler 1 hat keine Eingabe von Spieler 2 und umgekehrt', () => {
    expect(keysToInput(new Set(schemeCodes('pfeile')), 'wasd')).toMatchObject({
      throttle: 0,
      steer: 0,
      jump: false,
      boost: false,
    });
    expect(keysToInput(new Set(schemeCodes('wasd')), 'pfeile')).toMatchObject({
      throttle: 0,
      steer: 0,
      jump: false,
      boost: false,
    });
  });
});

describe('Rampe', () => {
  it('erreicht den Zielwert nach der Rampenzeit und überschreitet ihn nie', () => {
    let v = 0;
    const dt = 1 / 60;
    let t = 0;
    while (v < 1 && t < 1) {
      v = rampToward(v, 1, dt);
      t += dt;
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(v).toBe(1);
    expect(t).toBeLessThanOrEqual(KEY_RAMP_SECONDS + 2 * dt);
  });

  it('läuft auch zurück bis 0 und durch die Mitte nach −1', () => {
    expect(rampToward(1, 0, 1)).toBe(0);
    expect(rampToward(1, -1, 0.04)).toBeCloseTo(0.5, 6);
    expect(rampToward(0.3, 0.3, 0.01)).toBe(0.3);
    expect(rampToward(0.2, 1, 0)).toBe(0.2);
  });

  it('rampInput behält Knöpfe und bleibt gültig', () => {
    const target = keysToInput(new Set(['KeyW', 'KeyD', 'Space']), 'wasd');
    const start: CarInput = keysToInput(new Set(), 'wasd');
    const mid = rampInput(start, target, 0.02);
    expect(mid.jump).toBe(true);
    expect(mid.throttle).toBeGreaterThan(0);
    expect(mid.throttle).toBeLessThan(1);
    expect(clampInput(mid)).toEqual(mid);
  });
});

function pad(axes: number[], pressed: number[] = [], values: Record<number, number> = {}): PadLike {
  const buttons = Array.from({ length: 17 }, (_, i) => ({
    pressed: pressed.includes(i) || (values[i] ?? 0) > 0.5,
    value: values[i] ?? (pressed.includes(i) ? 1 : 0),
  }));
  return { axes, buttons };
}

describe('Gamepad', () => {
  it('Totzone: kleine Ausschläge ergeben 0, Ende ergibt ±1', () => {
    expect(shapeAxis(STICK_DEADZONE * 0.99)).toBe(0);
    expect(shapeAxis(-STICK_DEADZONE * 0.99)).toBe(0);
    expect(shapeAxis(1)).toBeCloseTo(1, 10);
    expect(shapeAxis(-1)).toBeCloseTo(-1, 10);
    expect(shapeAxis(NaN)).toBe(0);
    expect(shapeAxis(5)).toBeCloseTo(1, 10);
  });

  it('Expo-Kurve ist monoton, symmetrisch und feinfühliger als linear', () => {
    let prev = -Infinity;
    for (let i = -100; i <= 100; i++) {
      const v = shapeAxis(i / 100);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
      expect(shapeAxis(-i / 100)).toBeCloseTo(-v, 10);
    }
    const mid = (0.5 - STICK_DEADZONE) / (1 - STICK_DEADZONE);
    expect(shapeAxis(0.5)).toBeLessThan(mid);
  });

  it('Mapping: Sticks, Trigger, Knöpfe', () => {
    const i = gamepadToInput(
      pad([0.8, -1], [PAD_BUTTON.A, PAD_BUTTON.X, PAD_BUTTON.B], {
        [PAD_BUTTON.RT]: 1,
        [PAD_BUTTON.LT]: 0.25,
      }),
      'gamepad0',
    );
    expect(i.jump && i.boost && i.handbrake).toBe(true);
    expect(i.throttle).toBeCloseTo(0.75, 6);
    expect(i.steer).toBeGreaterThan(0.5);
    expect(i.pitch).toBeCloseTo(-1, 6);
    expect(i.yaw).toBe(i.steer);
    expect(i.roll).toBe(0);
    const r = gamepadToInput(pad([0.8, 0], [PAD_BUTTON.RB]), 'gamepad1');
    expect(r.yaw).toBe(0);
    expect(r.roll).toBeGreaterThan(0.5);
  });

  it('Boden-/Luftmodus trennt die Achsen; kaputte Pads ergeben neutrale Eingabe', () => {
    expect(gamepadToInput(pad([1, 1]), 'gamepad0', false)).toMatchObject({ pitch: 0, yaw: 0, roll: 0 });
    expect(gamepadToInput(pad([1, 1]), 'gamepad0', true)).toMatchObject({ throttle: 0, steer: 0 });
    const broken = gamepadToInput({ axes: [], buttons: [] }, 'gamepad0');
    expect(broken).toEqual(clampInput({}));
  });

  it('alle Achsen-/Knopfkombinationen bleiben gültig', () => {
    for (const ax of [-3, -1, -0.5, 0, 0.1, 0.5, 1, 7, NaN]) {
      for (const ay of [-1, 0, 1]) {
        const inp = gamepadToInput(pad([ax, ay], [0, 1, 2, 5], { 6: 1, 7: 1 }), 'gamepad0');
        expect(clampInput(inp)).toEqual(inp);
      }
    }
  });

  it('Ereignisknöpfe', () => {
    expect(gamepadButtons(pad([], [PAD_BUTTON.Y, PAD_BUTTON.START]))).toEqual({
      ballCam: true,
      reset: false,
      pause: true,
      rearView: false,
    });
    expect(gamepadButtons(pad([], [PAD_BUTTON.LB, PAD_BUTTON.BACK]))).toEqual({
      ballCam: false,
      reset: true,
      pause: false,
      rearView: true,
    });
  });
});
