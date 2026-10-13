import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, JUMP_VELOCITY, GRAVITY, WALK_SPEED, SPRINT_SPEED } from '../shared/src/constants';
import { copyBody, newBody, stepBody } from '../shared/src/movement';
import { Kind, makePiece } from '../shared/src/pieces';
import { Btn, Mode, emptyInput } from '../shared/src/types';
import { World } from '../shared/src/world';
import { flatTerrain } from './helpers';

const opts = { aiming: false, canSprint: true, speedMul: 1 };
const run = (w: World, b: ReturnType<typeof newBody>, n: number, mz = 1, buttons = 0, yaw = 0): void => {
  for (let i = 0; i < n; i++) {
    const inp = { ...emptyInput(), mz, yaw, buttons };
    stepBody(b, inp, DT, w, opts);
  }
};

test('Gehen und Sprinten erreichen die Zielgeschwindigkeit', () => {
  const w = new World(flatTerrain(10));
  const b = newBody(500, 10, 500);
  run(w, b, 30);
  assert.ok(Math.abs(Math.hypot(b.vx, b.vz) - WALK_SPEED) < 0.01);
  assert.ok(b.z < 500 - 4, 'yaw 0 läuft nach -z');
  run(w, b, 30, 1, Btn.Sprint);
  assert.ok(Math.abs(Math.hypot(b.vx, b.vz) - SPRINT_SPEED) < 0.01);
  assert.equal(b.mode, Mode.Ground);
});

test('Sprunghöhe entspricht der Physik', () => {
  const w = new World(flatTerrain(10));
  const b = newBody(500, 10, 500);
  run(w, b, 2, 0);
  let maxY = 10;
  stepBody(b, { ...emptyInput(), buttons: Btn.Jump }, DT, w, opts);
  for (let i = 0; i < 40; i++) {
    stepBody(b, emptyInput(), DT, w, opts);
    maxY = Math.max(maxY, b.y);
  }
  const ideal = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY);
  assert.ok(Math.abs(maxY - 10 - ideal) < 0.2, `Sprunghöhe ${maxY - 10} statt ${ideal}`);
  assert.equal(b.y, 10);
  assert.equal(b.mode, Mode.Ground);
});

test('Wand blockiert, niedrige Stufe wird erstiegen, Kante wird erklettert', () => {
  const w = new World(flatTerrain(10));
  w.add(makePiece(Kind.Block, 500, 12, 495, 3, 2, 0.15)); // Wand quer vor dem Spieler
  const b = newBody(500, 10, 500);
  run(w, b, 60);
  assert.ok(b.z > 495.15 + 0.4 - 0.01, 'durch die Wand gelaufen');
  // Stufe 0,4 m
  const w2 = new World(flatTerrain(10));
  w2.add(makePiece(Kind.Block, 500, 10.2, 490, 3, 0.2, 3));
  const b2 = newBody(500, 10, 500);
  run(w2, b2, 60);
  assert.ok(Math.abs(b2.y - 10.4) < 1e-6, 'Stufe nicht erstiegen');
  // Mauer 1,8 m: Klettern
  const w3 = new World(flatTerrain(10));
  w3.add(makePiece(Kind.Block, 500, 10.9, 490, 3, 0.9, 3));
  const b3 = newBody(500, 10, 500);
  run(w3, b3, 40);
  run(w3, b3, 1, 1, Btn.Jump);
  run(w3, b3, 30);
  assert.ok(b3.y > 11.7, `nicht hochgeklettert (y=${b3.y})`);
});

test('Rutschen beschleunigt und endet', () => {
  const w = new World(flatTerrain(10));
  const b = newBody(500, 10, 500);
  run(w, b, 30, 1, Btn.Sprint);
  run(w, b, 1, 1, Btn.Sprint | Btn.Crouch);
  assert.equal(b.mode, Mode.Slide);
  assert.ok(Math.hypot(b.vx, b.vz) > SPRINT_SPEED);
  run(w, b, 120, 1, Btn.Crouch);
  assert.notEqual(b.mode, Mode.Slide);
});

test('Freier Fall öffnet den Gleiter automatisch und landet weich', () => {
  const w = new World(flatTerrain(10));
  const b = newBody(500, 200, 500);
  b.mode = Mode.Freefall as Mode;
  let glided = false;
  for (let i = 0; i < 30 * 40 && b.mode !== Mode.Ground; i++) {
    stepBody(b, { ...emptyInput(), mz: 1 }, DT, w, opts);
    if (b.mode === Mode.Glide) glided = true;
  }
  assert.ok(glided);
  assert.equal(b.mode, Mode.Ground);
  assert.equal(b.y, 10);
});

test('Vorhersage ist deterministisch (gleiche Eingaben → gleicher Zustand)', () => {
  const w = new World(flatTerrain(10));
  w.add(makePiece(Kind.Ramp, 500, 12, 480, 2, 2, 2, { dir: 3 }));
  const a = newBody(500, 10, 500),
    b = copyBody(a, newBody());
  for (let i = 0; i < 120; i++) {
    const inp = { ...emptyInput(), mz: 1, mx: Math.sin(i / 9) * 0.5, yaw: Math.sin(i / 30) * 0.2, buttons: i % 37 === 0 ? Btn.Jump : 0 };
    stepBody(a, inp, DT, w, opts);
    stepBody(b, { ...inp }, DT, w, opts);
  }
  assert.deepEqual(a, b);
});
