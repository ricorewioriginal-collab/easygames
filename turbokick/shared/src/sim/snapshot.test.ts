import { describe, expect, it } from 'vitest';
import { Rng } from '../rng';
import { Sim, cloneState, createSimState } from './sim';
import { decodeSnapshot, encodeSnapshot, interpolateStates } from './snapshot';
import { skipCountdown } from './testkit';
import type { CarInput, SimConfig, SimState } from './types';

const config: SimConfig = { cars: [0, 0, 0, 1, 1, 1].map((team) => ({ team: team as 0 | 1 })), seed: 21 };

function rnd(rng: Rng): Partial<CarInput> {
  return {
    throttle: rng.float(-1, 1),
    steer: rng.float(-1, 1),
    pitch: rng.float(-1, 1),
    yaw: rng.float(-1, 1),
    jump: rng.chance(0.06),
    boost: rng.chance(0.5),
    handbrake: rng.chance(0.05),
  };
}

function midGame(ticks = 700): Sim {
  const sim = new Sim(config);
  skipCountdown(sim);
  const rng = new Rng(5);
  for (let i = 0; i < ticks; i++) sim.step(config.cars.map(() => rnd(rng)));
  return sim;
}

describe('Schnappschuss', () => {
  it('Roundtrip: Position < 2 cm, Quaternion normiert, diskrete Werte exakt, < 600 Byte', () => {
    const sim = midGame();
    const bytes = encodeSnapshot(sim.state);
    expect(bytes.length).toBeLessThan(600);
    const into = createSimState(config);
    expect(decodeSnapshot(bytes, into)).toBe(true);
    const a = sim.state;
    for (let i = 0; i < a.cars.length; i++) {
      const c = a.cars[i]!;
      const d = into.cars[i]!;
      for (let k = 0; k < 3; k++) {
        expect(Math.abs(c.pos[k]! - d.pos[k]!)).toBeLessThan(0.02);
        expect(Math.abs(c.vel[k]! - d.vel[k]!)).toBeLessThan(0.01);
      }
      const ql = Math.hypot(...d.quat);
      expect(Math.abs(ql - 1)).toBeLessThan(1e-9);
      const dot = Math.abs(c.quat[0] * d.quat[0] + c.quat[1] * d.quat[1] + c.quat[2] * d.quat[2] + c.quat[3] * d.quat[3]);
      expect(dot).toBeGreaterThan(0.99999);
      expect(d.jumpUsed).toBe(c.jumpUsed);
      expect(d.canDodge).toBe(c.canDodge);
      expect(d.boosting).toBe(c.boosting);
      expect(d.supersonic).toBe(c.supersonic);
      expect(d.team).toBe(c.team);
      expect(d.wheelsOnSurface).toBe(c.wheelsOnSurface);
      expect(d.input.jump).toBe(c.input.jump);
    }
    for (let k = 0; k < 3; k++) expect(Math.abs(a.ball.pos[k]! - into.ball.pos[k]!)).toBeLessThan(0.02);
    expect(into.tick).toBe(a.tick);
    expect(into.phase).toBe(a.phase);
    expect(into.score).toEqual(a.score);
    expect(into.rngState).toBe(a.rngState);
    expect(into.pads.map((p) => p.active)).toEqual(a.pads.map((p) => p.active));
  });

  it('lehnt ungültige Daten ab und wirft nie', () => {
    const sim = midGame(50);
    const into = createSimState(config);
    const before = JSON.stringify(into);
    const good = encodeSnapshot(sim.state);
    expect(decodeSnapshot(new Uint8Array(0), into)).toBe(false);
    expect(decodeSnapshot(good.slice(0, good.length - 1), into)).toBe(false);
    expect(decodeSnapshot(good.slice(0, 10), into)).toBe(false);
    expect(decodeSnapshot(null as unknown as Uint8Array, into)).toBe(false);
    expect(decodeSnapshot('abc' as unknown as Uint8Array, into)).toBe(false);
    const rng = new Rng(3);
    for (let n = 0; n < 500; n++) {
      const b = new Uint8Array(rng.range(0, 700));
      for (let i = 0; i < b.length; i++) b[i] = rng.int(256);
      expect(decodeSnapshot(b, into)).toBe(false);
    }
    // beschädigt (Bit gekippt): Prüfsumme schlägt an
    for (let n = 0; n < 200; n++) {
      const b = good.slice();
      b[rng.int(b.length)]! ^= 1 << rng.int(8);
      expect(decodeSnapshot(b, into)).toBe(false);
    }
    // falsche Struktur
    expect(decodeSnapshot(good, createSimState({ cars: [{ team: 0 }], seed: 1 }))).toBe(false);
    expect(JSON.stringify(into)).toBe(before);
    // NaN im Zustand beim Kodieren führt nicht zum Werfen und nicht zu NaN beim Dekodieren
    const nanState = cloneState(sim.state);
    nanState.phaseTimer = NaN;
    nanState.cars[0]!.pos[0] = NaN;
    const enc = encodeSnapshot(nanState);
    expect(decodeSnapshot(enc, into)).toBe(false);
  });

  it('interpolateStates: Mitte zwischen zwei Zuständen', () => {
    const a = createSimState(config);
    const b = cloneState(a);
    a.cars[0]!.pos = [0, 1, 0];
    b.cars[0]!.pos = [10, 1, 20];
    b.cars[0]!.quat = [0, Math.SQRT1_2, 0, Math.SQRT1_2];
    a.ball.pos = [0, 1, 0];
    b.ball.pos = [4, 1, 0];
    const out = cloneState(a);
    interpolateStates(a, b, 0.5, out);
    expect(out.cars[0]!.pos).toEqual([5, 1, 10]);
    expect(out.ball.pos[0]).toBeCloseTo(2, 9);
    // 45° um y
    expect(out.cars[0]!.quat[1]).toBeCloseTo(Math.sin(Math.PI / 8), 6);
    expect(Math.hypot(...out.cars[0]!.quat)).toBeCloseTo(1, 9);
    interpolateStates(a, b, 0, out);
    expect(out.cars[0]!.pos).toEqual([0, 1, 0]);
  });
});

describe('Rollback-Vorhersage', () => {
  it('encode → decode → loadState → 120 Ticks mit denselben Eingaben bleibt nahe am Original', () => {
    for (const warm of [400, 900, 1500]) {
      const host = midGame(warm);
      const bytes = encodeSnapshot(host.state);
      const tmp = createSimState(config);
      expect(decodeSnapshot(bytes, tmp)).toBe(true);
      const client = new Sim(config);
      client.loadState(tmp);
      const rng = new Rng(warm);
      let worst = 0;
      for (let i = 0; i < 120; i++) {
        const inputs = config.cars.map(() => rnd(rng));
        host.step(inputs);
        client.step(inputs);
        const a: SimState = host.state;
        const b: SimState = client.state;
        for (let k = 0; k < a.cars.length; k++) {
          for (let j = 0; j < 3; j++) worst = Math.max(worst, Math.abs(a.cars[k]!.pos[j]! - b.cars[k]!.pos[j]!));
        }
        for (let j = 0; j < 3; j++) worst = Math.max(worst, Math.abs(a.ball.pos[j]! - b.ball.pos[j]!));
      }
      expect(worst).toBeLessThan(0.1);
    }
  });

  it('loadState stellt exakt wieder her: cloneState → loadState → gleicher Hash und gleiche Zukunft', () => {
    const host = midGame(600);
    const copy = new Sim(config);
    copy.loadState(cloneState(host.state));
    expect(copy.hash()).toBe(host.hash());
    const rng = new Rng(1);
    for (let i = 0; i < 300; i++) {
      const inputs = config.cars.map(() => rnd(rng));
      host.step(inputs);
      copy.step(inputs);
    }
    expect(copy.hash()).toBe(host.hash());
  });
});
