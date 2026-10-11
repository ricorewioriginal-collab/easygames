import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ARENA, NEUTRAL_CAR_INPUT, type BallState, type CarState } from '@shared/sim/types';
import { ChaseCamera, clampInsideArena } from './camera';

const car = (over: Partial<CarState> = {}): CarState => ({
  id: 0,
  team: 0,
  pos: [0, 0.4, -20],
  quat: [0, 0, 0, 1],
  vel: [0, 0, 10],
  angVel: [0, 0, 0],
  boost: 50,
  jumpTimer: 0,
  wheelsOnSurface: 4,
  jumpUsed: false,
  canDodge: false,
  demolished: 0,
  dodgeTimer: 0,
  boosting: false,
  input: { ...NEUTRAL_CAR_INPUT },
  supersonic: false,
  ...over,
});
const ball: BallState = { pos: [0, 1, 0], vel: [0, 0, 0], angVel: [0, 0, 0] };

describe('Kamera', () => {
  it('Auto-Kamera steht hinter dem Auto und schaut nach vorn', () => {
    const cam = new ChaseCamera({ fov: 80, distance: 1, shake: false });
    for (let i = 0; i < 120; i++) cam.update(1 / 60, car(), ball, false, 10);
    expect(cam.position.z).toBeLessThan(-20);
    expect(cam.target.z).toBeGreaterThan(-21);
  });
  it('Ball-Kamera blickt zum Ball, bleibt aber hinter dem Auto', () => {
    const cam = new ChaseCamera({ fov: 80, distance: 1, shake: false });
    for (let i = 0; i < 180; i++) cam.update(1 / 60, car({ pos: [10, 0.4, -20] }), ball, true, 10);
    expect(cam.position.x).toBeGreaterThan(10);
    expect(cam.position.z).toBeLessThan(-20);
    expect(cam.target.z).toBeGreaterThan(-20);
  });
  it('liegt der Ball hinter dem Auto, gibt es keine Kamera vor dem Auto', () => {
    const cam = new ChaseCamera({ fov: 80, distance: 1, shake: false });
    for (let i = 0; i < 180; i++)
      cam.update(1 / 60, car({ pos: [0, 0.4, 10] }), { ...ball, pos: [0, 1, -30] }, true, 10);
    expect(cam.position.z).toBeLessThan(10);
  });
  it('bleibt immer in der Arena und endlich (auch bei Müll-Zuständen)', () => {
    const cam = new ChaseCamera({ fov: 80, distance: 1.4, shake: true });
    cam.shake();
    for (let i = 0; i < 300; i++) {
      cam.update(1 / 60, car({ pos: [39.9, 19.9, 49.9], vel: [50, 50, 50] }), ball, i % 2 === 0, 60);
      expect(Math.abs(cam.position.x)).toBeLessThan(ARENA.halfWidth + 0.5);
      expect(cam.position.y).toBeLessThan(ARENA.height + 0.5);
      expect(Number.isFinite(cam.position.x + cam.position.y + cam.position.z + cam.fov)).toBe(true);
    }
  });
  it('zerstörtes Auto: Überblick auf den Ball', () => {
    const cam = new ChaseCamera({ fov: 80, distance: 1, shake: false });
    for (let i = 0; i < 120; i++) cam.update(1 / 60, car({ demolished: 2 }), ball, true, 0);
    expect(cam.position.y).toBeGreaterThan(4);
  });
  it('clampInsideArena', () => {
    const p = clampInsideArena(new THREE.Vector3(100, -5, 100));
    expect(p.x).toBeLessThan(ARENA.halfWidth);
    expect(p.y).toBeGreaterThan(0);
    expect(p.z).toBeLessThan(ARENA.halfLength);
  });
});
