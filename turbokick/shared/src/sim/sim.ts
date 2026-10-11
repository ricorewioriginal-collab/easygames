import { Rng } from '../rng';
import { BOOST_PADS } from './arena';
import { collideCars, createCarState, sanitizeInto, stepCar, CAR_TUNING } from './car';
import { stepBall, type BallStepInfo, BALL_TUNING } from './ball';
import { arenaSdf } from './arena';
import { quatNormalize } from './math';
import {
  DEFAULT_MATCH_SECONDS,
  detectGoal,
  placeKickoff,
  registerTouch,
  respawnCar,
  scoreGoal,
  stepClock,
  stepCountdown,
  stepGoalPause,
} from './rules';
import {
  BALL_RADIUS,
  BIG_PAD_BOOST,
  BIG_PAD_RESPAWN,
  MAX_BOOST,
  SMALL_PAD_BOOST,
  SMALL_PAD_RESPAWN,
  TICK_DT,
  type CarInput,
  type CarState,
  type Quat,
  type SimConfig,
  type SimEvent,
  type SimState,
  type Vec3,
} from './types';

const PAD_RADIUS_BIG = 1.8;
const PAD_RADIUS_SMALL = 1.2;
const PAD_HEIGHT = 1.5;

const PHASES = ['countdown', 'playing', 'goal', 'ended'] as const;
export const PHASE_INDEX: Readonly<Record<string, number>> = { countdown: 0, playing: 1, goal: 2, ended: 3 };
export { PHASES };

/** Erzeugt den Startzustand (Anstoß-Aufstellung, Countdown 3 s). Gleicher seed → gleicher Zustand. */
export function createSimState(config: SimConfig): SimState {
  const training = config.training === true;
  const state: SimState = {
    tick: 0,
    phase: 'countdown',
    phaseTimer: 3,
    clock: training ? 0 : (config.matchSeconds ?? DEFAULT_MATCH_SECONDS),
    overtime: false,
    score: [0, 0],
    cars: config.cars.map((c, i) => createCarState(i, c.team)),
    ball: { pos: [0, BALL_RADIUS, 0], vel: [0, 0, 0], angVel: [0, 0, 0] },
    pads:
      config.pads === false
        ? []
        : BOOST_PADS.map((p) => ({ pos: [p.pos[0], p.pos[1], p.pos[2]] as Vec3, big: p.big, active: true, timer: 0 })),
    lastTouch: -1,
    prevTouch: -1,
    winner: -1,
    rngState: config.seed >>> 0,
  };
  const rng = new Rng(config.seed);
  placeKickoff(state, rng);
  return state;
}

function cloneVec<T extends number[]>(v: T): T {
  return v.slice() as T;
}

/** Tiefe Kopie eines Zustands */
export function cloneState(s: SimState): SimState {
  return {
    tick: s.tick,
    phase: s.phase,
    phaseTimer: s.phaseTimer,
    clock: s.clock,
    overtime: s.overtime,
    score: [s.score[0], s.score[1]],
    cars: s.cars.map((c) => ({
      ...c,
      pos: cloneVec(c.pos),
      quat: cloneVec(c.quat),
      vel: cloneVec(c.vel),
      angVel: cloneVec(c.angVel),
      input: { ...c.input },
    })),
    ball: { pos: cloneVec(s.ball.pos), vel: cloneVec(s.ball.vel), angVel: cloneVec(s.ball.angVel) },
    pads: s.pads.map((p) => ({ ...p, pos: cloneVec(p.pos) })),
    lastTouch: s.lastTouch,
    prevTouch: s.prevTouch,
    winner: s.winner,
    rngState: s.rngState,
  };
}

function copyArr(src: ArrayLike<number>, dst: number[]): void {
  for (let i = 0; i < dst.length; i++) dst[i] = src[i] as number;
}

/** Kopiert src in die vorhandenen Puffer von dst (Struktur wird bei abweichender Anzahl angepasst) */
export function copyStateInto(src: SimState, dst: SimState): void {
  dst.tick = src.tick;
  dst.phase = src.phase;
  dst.phaseTimer = src.phaseTimer;
  dst.clock = src.clock;
  dst.overtime = src.overtime;
  dst.score[0] = src.score[0];
  dst.score[1] = src.score[1];
  dst.lastTouch = src.lastTouch;
  dst.prevTouch = src.prevTouch;
  dst.winner = src.winner;
  dst.rngState = src.rngState;
  if (dst.cars.length !== src.cars.length) dst.cars = src.cars.map((c) => cloneState({ ...src, cars: [c], pads: [] }).cars[0] as CarState);
  else {
    for (let i = 0; i < src.cars.length; i++) {
      const a = src.cars[i] as CarState;
      const b = dst.cars[i] as CarState;
      b.id = a.id;
      b.team = a.team;
      copyArr(a.pos, b.pos);
      copyArr(a.quat, b.quat);
      copyArr(a.vel, b.vel);
      copyArr(a.angVel, b.angVel);
      b.boost = a.boost;
      b.wheelsOnSurface = a.wheelsOnSurface;
      b.jumpUsed = a.jumpUsed;
      b.canDodge = a.canDodge;
      b.demolished = a.demolished;
      b.dodgeTimer = a.dodgeTimer;
      b.jumpTimer = a.jumpTimer;
      b.boosting = a.boosting;
      b.supersonic = a.supersonic;
      b.input.throttle = a.input.throttle;
      b.input.steer = a.input.steer;
      b.input.pitch = a.input.pitch;
      b.input.yaw = a.input.yaw;
      b.input.roll = a.input.roll;
      b.input.jump = a.input.jump;
      b.input.boost = a.input.boost;
      b.input.handbrake = a.input.handbrake;
    }
  }
  copyArr(src.ball.pos, dst.ball.pos);
  copyArr(src.ball.vel, dst.ball.vel);
  copyArr(src.ball.angVel, dst.ball.angVel);
  if (dst.pads.length !== src.pads.length) dst.pads = src.pads.map((p) => ({ ...p, pos: cloneVec(p.pos) }));
  else {
    for (let i = 0; i < src.pads.length; i++) {
      const a = src.pads[i]!;
      const b = dst.pads[i]!;
      copyArr(a.pos, b.pos);
      b.big = a.big;
      b.active = a.active;
      b.timer = a.timer;
    }
  }
}

// ---- Hash ----------------------------------------------------------------------------------
const F64 = new Float64Array(1);
const U32 = new Uint32Array(F64.buffer);

function mix(h: number, v: number): number {
  F64[0] = v;
  h = Math.imul(h ^ (U32[0] as number), 16777619);
  return Math.imul(h ^ (U32[1] as number), 16777619);
}

function mixArr(h: number, a: ArrayLike<number>): number {
  for (let i = 0; i < a.length; i++) h = mix(h, a[i] as number);
  return h;
}

export function hashState(s: SimState): number {
  let h = 2166136261;
  h = mix(h, s.tick);
  h = mix(h, PHASE_INDEX[s.phase] as number);
  h = mix(h, s.phaseTimer);
  h = mix(h, s.clock);
  h = mix(h, s.overtime ? 1 : 0);
  h = mixArr(h, s.score);
  h = mix(h, s.lastTouch);
  h = mix(h, s.prevTouch);
  h = mix(h, s.winner);
  h = mix(h, s.rngState);
  for (const c of s.cars) {
    h = mix(h, c.id);
    h = mix(h, c.team);
    h = mixArr(h, c.pos);
    h = mixArr(h, c.quat);
    h = mixArr(h, c.vel);
    h = mixArr(h, c.angVel);
    h = mix(h, c.boost);
    h = mix(h, c.wheelsOnSurface);
    h = mix(h, (c.jumpUsed ? 1 : 0) | (c.canDodge ? 2 : 0) | (c.boosting ? 4 : 0) | (c.supersonic ? 8 : 0));
    h = mix(h, c.demolished);
    h = mix(h, c.dodgeTimer);
    h = mix(h, c.jumpTimer);
    const i = c.input;
    h = mix(h, i.throttle);
    h = mix(h, i.steer);
    h = mix(h, i.pitch);
    h = mix(h, i.yaw);
    h = mix(h, i.roll);
    h = mix(h, (i.jump ? 1 : 0) | (i.boost ? 2 : 0) | (i.handbrake ? 4 : 0));
  }
  h = mixArr(h, s.ball.pos);
  h = mixArr(h, s.ball.vel);
  h = mixArr(h, s.ball.angVel);
  for (const p of s.pads) {
    h = mix(h, p.active ? 1 : 0);
    h = mix(h, p.timer);
  }
  return h >>> 0;
}

function carFinite(c: CarState): boolean {
  const p = c.pos;
  const v = c.vel;
  const w = c.angVel;
  const q = c.quat;
  return (
    Number.isFinite(p[0] + p[1] + p[2] + v[0] + v[1] + v[2] + w[0] + w[1] + w[2] + q[0] + q[1] + q[2] + q[3] + c.boost)
  );
}

const SDF = new Float64Array(4);

export class Sim {
  readonly config: SimConfig;
  state: SimState;
  private rng: Rng;
  private prevPos: Float64Array;
  private info: BallStepInfo = { wallSpeed: 0 };
  private readonly training: boolean;
  private readonly onTouch: (id: number) => void;

  constructor(config: SimConfig) {
    this.config = config;
    this.training = config.training === true;
    this.state = createSimState(config);
    this.rng = new Rng(this.state.rngState);
    this.prevPos = new Float64Array(Math.max(1, config.cars.length) * 3);
    this.onTouch = (id: number): void => registerTouch(this.state, id);
    this.syncPrev();
  }

  private syncPrev(): void {
    const cars = this.state.cars;
    if (this.prevPos.length < cars.length * 3) this.prevPos = new Float64Array(cars.length * 3);
    for (let i = 0; i < cars.length; i++) {
      const p = (cars[i] as CarState).pos;
      this.prevPos[i * 3] = p[0];
      this.prevPos[i * 3 + 1] = p[1];
      this.prevPos[i * 3 + 2] = p[2];
    }
  }

  /** Anstoß-Aufstellung herstellen (Autos in Teamaufstellung, Ball in der Mitte, Boost 33, Pads aktiv); Countdown 3 s */
  resetKickoff(): void {
    this.rng.state = this.state.rngState;
    placeKickoff(this.state, this.rng);
    this.state.rngState = this.rng.state;
    this.syncPrev();
  }

  /** Zustand laden (tiefe Kopie in die eigenen Puffer); interne Caches werden zurückgesetzt. Danach geht es deterministisch weiter. */
  loadState(s: SimState): void {
    copyStateInto(s, this.state);
    this.rng.state = this.state.rngState;
    this.syncPrev();
  }

  setBall(pos: Vec3, vel?: Vec3, angVel?: Vec3): void {
    const b = this.state.ball;
    copyArr(pos, b.pos);
    copyArr(vel ?? [0, 0, 0], b.vel);
    copyArr(angVel ?? [0, 0, 0], b.angVel);
  }

  setCar(id: number, p: { pos?: Vec3; quat?: Quat; vel?: Vec3; angVel?: Vec3; boost?: number }): void {
    const c = this.state.cars[id];
    if (!c) return;
    if (p.pos) copyArr(p.pos, c.pos);
    if (p.quat) {
      copyArr(p.quat, c.quat);
      quatNormalize(c.quat);
    }
    if (p.vel) copyArr(p.vel, c.vel);
    if (p.angVel) copyArr(p.angVel, c.angVel);
    if (p.boost !== undefined && Number.isFinite(p.boost)) c.boost = Math.min(MAX_BOOST, Math.max(0, p.boost));
    this.syncPrev();
  }

  hash(): number {
    return hashState(this.state);
  }

  /** Ein Schritt (1/60 s). inputs[i] gehört zu Fahrzeug i; fehlende/ungültige → neutral. Gibt die Ereignisse dieses Ticks zurück. */
  step(inputs: ReadonlyArray<Partial<CarInput> | undefined>): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    const dt = TICK_DT;
    s.tick++;
    const cars = s.cars;
    const n = cars.length;

    if (s.phase === 'ended' || s.phase === 'countdown') {
      for (let i = 0; i < n; i++) sanitizeInto((cars[i] as CarState).input, inputs[i]);
      if (s.phase === 'countdown') stepCountdown(s, dt, ev);
      return ev;
    }

    this.syncPrev();
    // Fahrzeuge
    for (let i = 0; i < n; i++) {
      const car = cars[i] as CarState;
      if (car.demolished > 0) {
        sanitizeInto(car.input, inputs[i]);
        car.demolished -= dt;
        if (car.demolished <= 1e-9) {
          respawnCar(s, i);
          ev.push({ t: 'respawn', car: i });
        }
        continue;
      }
      stepCar(car, inputs[i], dt, ev);
    }
    collideCars(cars, ev);

    // Ball
    const side = s.phase === 'goal' ? (s.ball.pos[2] > 0 ? 1 : -1) : 0;
    stepBall(s.ball, cars, this.prevPos, dt, ev, side, this.onTouch, this.info);
    if (this.info.wallSpeed >= BALL_TUNING.wallEventSpeed) ev.push({ t: 'wall', speed: this.info.wallSpeed });

    // Pads
    if (s.pads.length > 0) this.updatePads(dt, ev);

    // Regeln
    if (s.phase === 'playing') {
      const g = detectGoal(s);
      if (g !== -1) scoreGoal(s, g, this.training, ev);
      else if (!this.training && stepClock(s, dt, ev)) this.restart();
    } else if (s.phase === 'goal') {
      const r = stepGoalPause(s, dt, ev);
      if (r === 'restart') this.restart();
    }

    this.guard(ev);
    return ev;
  }

  private restart(): void {
    this.resetKickoff();
  }

  private updatePads(dt: number, ev: SimEvent[]): void {
    const s = this.state;
    const playing = s.phase === 'playing';
    for (let i = 0; i < s.pads.length; i++) {
      const pad = s.pads[i]!;
      if (!pad.active) {
        pad.timer -= dt;
        if (pad.timer <= 1e-9) {
          pad.timer = 0;
          pad.active = true;
        }
        continue;
      }
      if (!playing) continue;
      const r = pad.big ? PAD_RADIUS_BIG : PAD_RADIUS_SMALL;
      for (const car of s.cars) {
        if (car.demolished > 0 || car.boost >= MAX_BOOST) continue;
        const dx = car.pos[0] - pad.pos[0];
        const dz = car.pos[2] - pad.pos[2];
        const dy = car.pos[1] - pad.pos[1];
        if (dx * dx + dz * dz < r * r && dy < PAD_HEIGHT && dy > -PAD_HEIGHT) {
          car.boost = Math.min(MAX_BOOST, car.boost + (pad.big ? BIG_PAD_BOOST : SMALL_PAD_BOOST));
          pad.active = false;
          pad.timer = pad.big ? BIG_PAD_RESPAWN : SMALL_PAD_RESPAWN;
          ev.push({ t: 'pad', car: car.id, pad: i, big: pad.big });
          break;
        }
      }
    }
  }

  /** Robustheit: ungültige Zustände zurücksetzen */
  private guard(ev: SimEvent[]): void {
    const s = this.state;
    for (const car of s.cars) {
      let bad = !carFinite(car);
      if (!bad) {
        arenaSdf(car.pos[0], car.pos[1], car.pos[2], SDF);
        bad = (SDF[0] as number) < -1.5;
      }
      if (bad) {
        respawnCar(s, car.id);
        ev.push({ t: 'respawn', car: car.id });
      }
    }
    const b = s.ball;
    let bad = !Number.isFinite(b.pos[0] + b.pos[1] + b.pos[2] + b.vel[0] + b.vel[1] + b.vel[2] + b.angVel[0] + b.angVel[1] + b.angVel[2]);
    if (!bad && s.phase !== 'goal') {
      arenaSdf(b.pos[0], b.pos[1], b.pos[2], SDF);
      bad = (SDF[0] as number) < -BALL_RADIUS - 1;
    }
    if (bad) {
      b.pos[0] = 0;
      b.pos[1] = BALL_RADIUS;
      b.pos[2] = 0;
      b.vel[0] = b.vel[1] = b.vel[2] = 0;
      b.angVel[0] = b.angVel[1] = b.angVel[2] = 0;
    }
  }
}

export { CAR_TUNING };
