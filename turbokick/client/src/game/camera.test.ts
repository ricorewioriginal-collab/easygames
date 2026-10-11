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
    const cam = new ChaseCamera({ fov: 100, distance: 1, shake: false });
    for (let i = 0; i < 120; i++) cam.update(1 / 60, car(), ball, false, 10);
    expect(cam.position.z).toBeLessThan(-20);
    expect(cam.target.z).toBeGreaterThan(-21);
  });
  it('Ball-Kamera blickt zum Ball, bleibt aber hinter dem Auto', () => {
    const cam = new ChaseCamera({ fov: 100, distance: 1, shake: false });
    for (let i = 0; i < 180; i++) cam.update(1 / 60, car({ pos: [10, 0.4, -20] }), ball, true, 10);
    expect(cam.position.x).toBeGreaterThan(10);
    expect(cam.position.z).toBeLessThan(-20);
    expect(cam.target.z).toBeGreaterThan(-20);
  });
  it('liegt der Ball hinter dem Auto, schwenkt die Ball-Kamera weich herum und blickt über das Auto auf den Ball', () => {
    const cam = new ChaseCamera({ fov: 100, distance: 1, shake: false });
    const c = car({ pos: [0, 0.4, 10] });
    cam.update(1 / 60, c, { ...ball, pos: [0, 1, 40] }, true, 10);
    let lastAng = Math.atan2(cam.position.x - 0, cam.position.z - 10);
    let maxJump = 0;
    for (let i = 0; i < 240; i++) {
      // Ball liegt jetzt hinter dem Auto (Kamera muss auf die andere Seite)
      cam.update(1 / 60, c, { ...ball, pos: [0.5, 1, -30] }, true, 10);
      const ang = Math.atan2(cam.position.x - 0, cam.position.z - 10);
      let d = Math.abs(ang - lastAng);
      if (d > Math.PI) d = Math.PI * 2 - d;
      maxJump = Math.max(maxJump, d);
      lastAng = ang;
    }
    expect(cam.position.z).toBeGreaterThan(10);
    expect(cam.target.z).toBeLessThan(10);
    // keine Sprünge: pro Bild höchstens etwas mehr als 6 rad/s · dt
    expect(maxJump).toBeLessThan(0.2);
  });
  it('Hochformat: weiter weg und größeres vertikales Sichtfeld, damit Ball und Auto sichtbar bleiben', () => {
    const wide = new ChaseCamera({ fov: 100, distance: 1, shake: false });
    const tall = new ChaseCamera({ fov: 100, distance: 1, shake: false });
    const cw = new THREE.PerspectiveCamera(60, 16 / 9);
    const ct = new THREE.PerspectiveCamera(60, 9 / 19.5);
    for (let i = 0; i < 60; i++) {
      wide.apply(cw);
      tall.apply(ct);
      wide.update(1 / 60, car(), ball, true, 0);
      tall.update(1 / 60, car(), ball, true, 0);
    }
    const dw = Math.hypot(wide.position.x, wide.position.z - -20);
    const dt = Math.hypot(tall.position.x, tall.position.z - -20);
    expect(dt).toBeGreaterThan(dw);
    expect(ct.fov).toBeGreaterThan(cw.fov);
  });
  it('bleibt immer in der Arena und endlich (auch bei Müll-Zuständen)', () => {
    const cam = new ChaseCamera({ fov: 100, distance: 1.4, shake: true });
    cam.shake();
    for (let i = 0; i < 300; i++) {
      cam.update(1 / 60, car({ pos: [39.9, 19.9, 49.9], vel: [50, 50, 50] }), ball, i % 2 === 0, 60);
      expect(Math.abs(cam.position.x)).toBeLessThan(ARENA.halfWidth + 0.5);
      expect(cam.position.y).toBeLessThan(ARENA.height + 0.5);
      expect(Number.isFinite(cam.position.x + cam.position.y + cam.position.z + cam.fov)).toBe(true);
    }
  });
  it('zerstörtes Auto: Überblick auf den Ball', () => {
    const cam = new ChaseCamera({ fov: 100, distance: 1, shake: false });
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
