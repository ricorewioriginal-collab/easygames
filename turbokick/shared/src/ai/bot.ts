import { Rng } from '../rng';
import { ARENA, BALL_RADIUS, BALL_TUNING, MAX_CARS, TICK_DT, type CarInput, type CarState, type SimState } from '../sim';
import { BallPredictor, Basis, PRED_MAX, PRED_STEP, bestPad, clampN, wrapAngle } from './nav';
import { M_DODGE, M_DOUBLE, M_FLIP, M_JUMP, M_NONE, Maneuver, aimAir, levelAir } from './skills';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'pro';

/** Bot-Rolle der letzten Entscheidung (nur zur Diagnose) */
export type BotMode = 'kickoff' | 'attack' | 'clear' | 'defend' | 'support' | 'boost' | 'idle';

export interface Level {
  /** Reaktionsverzögerung (s): der Bot sieht Ball und Gegner um diese Zeit verspätet */
  delay: number;
  /** Zielrauschen (Grad, ±) */
  noiseDeg: number;
  /** Anteil der Zeit, in der Boost grundsätzlich erlaubt ist */
  boostUse: number;
  /** Mindestentfernung zum Ziel für Boost (m) */
  boostMinDist: number;
  /** Vorhersagehorizont für die Ballbahn (s) */
  horizon: number;
  /** mittlerer Abstand zwischen Patzern (s) */
  mistakeEvery: number;
  /** Entscheidung alle n Ticks */
  period: number;
  /** größte Höhe des Ballmittelpunkts, die der Bot anstrebt (m) */
  maxBallY: number;
  canJump: boolean;
  canDouble: boolean;
  canDodge: boolean;
  canAim: boolean;
  handbrake: boolean;
  demo: boolean;
  /** Schusskraft nach Torentfernung dosieren; hitErrAmp = Streuung der Dosierung */
  powerAware: boolean;
  /** Im 1v1 verteidigen, wenn der Gegner um diese Zeit (s) eher am Ball wäre (kleiner = früher zurückfallen) */
  defendMargin: number;
  /** Umweg (m), den der Angreifer für Boost-Pads in Kauf nimmt (0 = nie) */
  padGreed: number;
  /** Ausrichtungstoleranz beim Anfahren (rad): größer = ungenauer */
  alignTol: number;
  hitErrAmp: number;
}

export const BOT_LEVELS: Record<Difficulty, Level> = {
  easy: {
    delay: 0.35,
    noiseDeg: 12,
    boostUse: 0.2,
    boostMinDist: 30,
    horizon: 0.3,
    mistakeEvery: 2.5,
    period: 4,
    maxBallY: 1.45,
    canJump: false,
    canDouble: false,
    canDodge: false,
    canAim: false,
    handbrake: false,
    demo: false,
    powerAware: false,
    defendMargin: 1,
    padGreed: 0,
    alignTol: 1.9,
    hitErrAmp: 0,
  },
  normal: {
    delay: 0.2,
    noiseDeg: 6,
    boostUse: 0.55,
    boostMinDist: 22,
    horizon: 0.7,
    mistakeEvery: 6,
    period: 3,
    maxBallY: 3.0,
    canJump: true,
    canDouble: false,
    canDodge: false,
    canAim: false,
    handbrake: false,
    demo: false,
    powerAware: true,
    defendMargin: 1,
    padGreed: 6,
    alignTol: 1.25,
    hitErrAmp: 0.25,
  },
  hard: {
    delay: 0.1,
    noiseDeg: 3,
    boostUse: 0.85,
    boostMinDist: 16,
    horizon: 1.1,
    mistakeEvery: 18,
    period: 3,
    maxBallY: 4.6,
    canJump: true,
    canDouble: true,
    canDodge: true,
    canAim: false,
    handbrake: true,
    demo: false,
    powerAware: true,
    defendMargin: 1,
    padGreed: 12,
    alignTol: 1.05,
    hitErrAmp: 0.12,
  },
  pro: {
    delay: 0.04,
    noiseDeg: 1,
    boostUse: 1,
    boostMinDist: 10,
    horizon: 1.5,
    mistakeEvery: 50,
    period: 2,
    maxBallY: 6.0,
    canJump: true,
    canDouble: true,
    canDodge: true,
    canAim: true,
    handbrake: true,
    demo: true,
    powerAware: true,
    defendMargin: 1,
    padGreed: 18,
    alignTol: 0.9,
    hitErrAmp: 0.03,
  },
};

const RING = 32;
const CAR_STRIDE = 7;
const SNAP = 7 + MAX_CARS * CAR_STRIDE;
const HALF_W = ARENA.halfWidth;
const HALF_L = ARENA.halfLength;
const DEG = Math.PI / 180;
/** Höchste Ballhöhe (Mittelpunkt), die ein Bodentreffer noch erreicht */
const GROUND_HIT_Y = 1.45;
const MAX_V = 14;
/** Kleinste Anfahrgeschwindigkeit für dosierte Schüsse (m/s) */
const MIN_SHOT_SPEED = 4.5;

/**
 * Bot-KI. Liest ausschließlich den öffentlichen SimState (keine versteckten Informationen), hat dieselben Fahrzeugwerte
 * wie ein Mensch und unterscheidet sich je Stufe nur in Reaktionszeit, Zielgenauigkeit, Vorhersage und Entscheidungsqualität.
 * Entscheidungen werden alle 2–4 Ticks neu berechnet; dazwischen läuft nur der Regler.
 */
export class Bot {
  readonly difficulty: Difficulty;
  private readonly L: Level;
  private readonly seed: number;
  private rng: Rng;
  private carId = -1;

  // Ringpuffer der letzten Zustände (Ball + alle Autos: Position, Geschwindigkeit, zerstört)
  private readonly ring = new Float64Array(RING * SNAP);
  private head = -1;
  private count = 0;
  private lastTick = -1;
  private readonly delayTicks: number;

  // wahrgenommene (verzögerte) Welt
  private bpx = 0;
  private bpy = 0;
  private bpz = 0;
  private bvx = 0;
  private bvy = 0;
  private bvz = 0;
  private readonly pred = new BallPredictor();
  private readonly b = new Basis();
  private readonly man = new Maneuver();

  // Entscheidung
  private mode: BotMode = 'idle';
  private tx = 0;
  private ty = 0;
  private tz = 0;
  private hold = false;
  private vcap = MAX_V;
  private boostOk = false;
  private boostResample = 0;
  private wantsMove = false;
  private fx = 0;
  private fz = 0;
  private aimX = 0;
  private aimY = 0;
  private aimZ = 0;
  private aimValid = false;
  private wasChaser = false;
  private dodgeSteer = 0;
  private maneuverCool = 0;
  private laneSide = 0;
  private hitErr = 0;
  private appr = true;
  private inBox = false;
  private wantPower = false;
  private reposTick = 0;

  // Fehler / Rauschen
  private noise = 0;
  private noiseTick = 0;
  private mistakeUntil = 0;
  private nextMistake = 0;
  private mistakeBias = 0;

  // Rückwärts, Stecken-bleiben
  private rev = false;
  private stuckX = 1e9;
  private stuckZ = 1e9;
  private stuckTick = 0;
  private stuckCount = 0;
  private unstickUntil = 0;
  private unstickSteer = 0;
  private unstickFlip = false;

  constructor(difficulty: Difficulty, seed: number) {
    this.difficulty = difficulty;
    this.L = { ...BOT_LEVELS[difficulty] };
    this.seed = seed >>> 0;
    this.rng = new Rng(this.seed);
    this.delayTicks = Math.min(RING - 2, Math.round(this.L.delay / TICK_DT));
  }

  /** Nur zur Diagnose/Tests: aktuelle Rolle, ob der Bot sich bewegen will, und das Ziel */
  get debug(): { mode: BotMode; wantsMove: boolean; target: [number, number, number]; vcap: number } {
    return { mode: this.mode, wantsMove: this.wantsMove, target: [this.tx, this.ty, this.tz], vcap: this.vcap };
  }

  private reset(carId: number): void {
    this.carId = carId;
    this.rng = new Rng((this.seed ^ Math.imul(carId + 1, 0x9e3779b1)) >>> 0);
    this.head = -1;
    this.count = 0;
    this.lastTick = -1;
    this.man.stop();
    this.mode = 'idle';
    this.hold = false;
    this.rev = false;
    this.stuckTick = 0;
    this.stuckCount = 0;
    this.unstickUntil = 0;
    this.nextMistake = 0;
    this.mistakeUntil = 0;
    this.noise = 0;
    this.noiseTick = 0;
    this.boostResample = 0;
    this.boostOk = false;
    this.wasChaser = false;
    this.aimValid = false;
    this.maneuverCool = 0;
  }

  /** Eingabe für Fahrzeug carId für diesen Tick, nur aus dem öffentlichen SimState berechnet */
  act(state: SimState, carId: number): CarInput {
    const o: CarInput = {
      throttle: 0,
      steer: 0,
      pitch: 0,
      yaw: 0,
      roll: 0,
      jump: false,
      boost: false,
      handbrake: false,
    };
    const car = state.cars[carId];
    if (!car) return o;
    if (carId !== this.carId || state.tick < this.lastTick) this.reset(carId);
    this.record(state);
    this.b.set(car.quat);

    if (car.demolished > 0 || state.phase === 'ended') {
      this.man.stop();
      this.stuckTick = state.tick;
      this.stuckX = 1e9;
      return o;
    }
    if (state.phase === 'countdown') {
      this.stuckTick = state.tick;
      this.stuckX = 1e9;
      this.unstickUntil = 0;
      this.man.stop();
      this.rev = false;
      return o;
    }
    if (state.phase !== 'playing') {
      // Torfeier: ausrollen lassen
      this.stuckTick = state.tick;
      this.stuckX = 1e9;
      this.man.stop();
      return o;
    }

    if ((state.tick + carId) % this.L.period === 0 || this.mode === 'idle') this.decide(state, car);
    this.control(state, car, o);
    return o;
  }

  // ---------------------------------------------------------------------------------------
  // Wahrnehmung (Ringpuffer)
  // ---------------------------------------------------------------------------------------
  private record(state: SimState): void {
    if (state.tick === this.lastTick) return;
    this.lastTick = state.tick;
    this.head = (this.head + 1) % RING;
    if (this.count < RING) this.count++;
    const r = this.ring;
    const o = this.head * SNAP;
    const bl = state.ball;
    r[o] = bl.pos[0];
    r[o + 1] = bl.pos[1];
    r[o + 2] = bl.pos[2];
    r[o + 3] = bl.vel[0];
    r[o + 4] = bl.vel[1];
    r[o + 5] = bl.vel[2];
    const n = Math.min(MAX_CARS, state.cars.length);
    for (let i = 0; i < n; i++) {
      const c = state.cars[i] as CarState;
      const k = o + 7 + i * CAR_STRIDE;
      r[k] = c.pos[0];
      r[k + 1] = c.pos[1];
      r[k + 2] = c.pos[2];
      r[k + 3] = c.vel[0];
      r[k + 4] = c.vel[1];
      r[k + 5] = c.vel[2];
      r[k + 6] = c.demolished > 0 ? 1 : 0;
    }
  }

  /** Offset des um die Reaktionszeit verzögerten Eintrags */
  private delayedBase(): number {
    const back = Math.min(this.delayTicks, this.count - 1);
    return ((this.head - back + RING) % RING) * SNAP;
  }

  private perceiveBall(): void {
    const o = this.delayedBase();
    const r = this.ring;
    this.bpx = r[o] as number;
    this.bpy = r[o + 1] as number;
    this.bpz = r[o + 2] as number;
    this.bvx = r[o + 3] as number;
    this.bvy = r[o + 4] as number;
    this.bvz = r[o + 5] as number;
  }

  // ---------------------------------------------------------------------------------------
  // Entscheidung
  // ---------------------------------------------------------------------------------------
  /** Geschätzte Zeit, bis ein Auto am Ball sein kann (nur zur Rollenwahl) */
  private tBall(px: number, pz: number, vx: number, vz: number, a: number, bx: number, bz: number): number {
    const dx = bx - px;
    const dz = bz - pz;
    const d = Math.sqrt(dx * dx + dz * dz);
    let t = d / 13;
    if (d > 1) {
      const sp = Math.sqrt(vx * vx + vz * vz);
      if (sp > 1) t += (1 - (vx * dx + vz * dz) / (sp * d)) * 0.45;
    }
    // Auto steht vor dem Ball (näher am Gegnertor): muss erst herum
    if (pz * a > bz * a + 1.5) t += 0.9;
    return t;
  }

  private decide(state: SimState, car: CarState): void {
    const L = this.L;
    const tick = state.tick;
    const px = car.pos[0];
    const pz = car.pos[2];
    const a = car.team === 0 ? 1 : -1;
    this.perceiveBall();
    const bx = this.bpx;
    const bz = this.bpz;

    // Rauschen und Patzer (deterministisch aus dem Rng)
    if (tick >= this.noiseTick) {
      this.noise = this.rng.float(-1, 1) * L.noiseDeg * DEG;
      this.noiseTick = tick + this.rng.range(10, 24);
      this.hitErr = this.rng.float(-1, 1) * L.hitErrAmp;
    }
    if (tick >= this.nextMistake) {
      if (this.nextMistake > 0) {
        this.mistakeUntil = tick + this.rng.range(25, 55);
        this.mistakeBias = (this.rng.chance(0.5) ? 1 : -1) * this.rng.float(2.5, 5);
      }
      this.nextMistake = tick + Math.round(this.rng.float(0.6, 1.4) * L.mistakeEvery * 60);
    }
    const mistake = tick < this.mistakeUntil;
    if (tick >= this.boostResample) {
      this.boostOk = this.rng.chance(L.boostUse) && !mistake;
      this.boostResample = tick + 30;
    }
    if (this.maneuverCool > 0) this.maneuverCool--;

    // --- Teams / Rollen
    let mates = 0;
    let lastMan = -1;
    let lastProg = Infinity;
    let chaser = -1;
    let chaserT = Infinity;
    const cars = state.cars;
    const ballProg = bz * a;
    // Hinterster Mitspieler (kleinste Fortschrittskoordinate)
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i] as CarState;
      if (c.team !== car.team || c.demolished > 0) continue;
      mates++;
      const prog = c.pos[2] * a;
      if (prog < lastProg) {
        lastProg = prog;
        lastMan = i;
      }
    }
    const lastCanChase = mates === 1 || ballProg < -8;
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i] as CarState;
      if (c.team !== car.team || c.demolished > 0) continue;
      if (i === lastMan && !lastCanChase) continue;
      let t = this.tBall(c.pos[0], c.pos[2], c.vel[0], c.vel[2], a, bx, bz);
      if (i === car.id && this.wasChaser) t *= 0.8;
      if (t < chaserT - 1e-9) {
        chaserT = t;
        chaser = i;
      }
    }
    if (chaser < 0) chaser = lastMan;

    this.hold = false;
    this.vcap = MAX_V;
    this.wantsMove = true;
    this.aimValid = false;

    // --- Anstoß
    const ballStill =
      state.lastTouch === -1 &&
      Math.abs(state.ball.vel[0]) + Math.abs(state.ball.vel[2]) < 0.3 &&
      Math.abs(state.ball.pos[0]) < 1 &&
      Math.abs(state.ball.pos[2]) < 1;
    if (ballStill) {
      let nearest = -1;
      let nd = Infinity;
      for (let i = 0; i < cars.length; i++) {
        const c = cars[i] as CarState;
        if (c.team !== car.team || c.demolished > 0) continue;
        const d = Math.hypot(c.pos[0], c.pos[2]);
        if (d < nd - 1e-6) {
          nd = d;
          nearest = i;
        }
      }
      if (nearest === car.id) {
        // Läuft ein Gegner los, wird der Anstoß umkämpft (volle Fahrt); sonst wie ein normaler Angriff mit dosiertem Schuss
        let oppV = 0;
        const base = this.delayedBase();
        for (let i = 0; i < cars.length; i++) {
          const c = cars[i] as CarState;
          if (c.team === car.team || i >= MAX_CARS) continue;
          const o = base + 7 + i * CAR_STRIDE;
          oppV = Math.max(oppV, Math.hypot(this.ring[o + 3] as number, this.ring[o + 5] as number));
        }
        if (oppV > 3.5) {
          this.mode = 'kickoff';
          this.wasChaser = true;
          this.tx = 0;
          this.tz = 0;
          this.ty = 0.9;
          this.boostOk = this.boostOk || L.boostUse >= 0.5;
          this.maybeKickoffDodge(car);
          return;
        }
      } else {
        this.wasChaser = false;
        this.goBoost(state, car, a, 34);
        return;
      }
    }

    // --- Rolle bestimmen
    let attack: boolean;
    if (mates <= 1) {
      // 1v1 (oder allein): angreifen, solange der Gegner nicht deutlich näher am Ball ist
      let tOpp = Infinity;
      for (let i = 0; i < cars.length; i++) {
        const c = cars[i] as CarState;
        if (c.team === car.team || c.demolished > 0) continue;
        const o = this.delayedBase() + 7 + i * CAR_STRIDE;
        const t = this.tBall(
          this.ring[o] as number,
          this.ring[o + 2] as number,
          this.ring[o + 3] as number,
          this.ring[o + 5] as number,
          -a,
          bx,
          bz,
        );
        if (t < tOpp) tOpp = t;
      }
      const tMe = this.tBall(px, pz, car.vel[0], car.vel[2], a, bx, bz);
      attack = !(tOpp + L.defendMargin < tMe && ballProg < 6) || state.ball.pos[2] * a > 0;
    } else {
      attack = chaser === car.id;
    }
    this.wasChaser = attack;

    if (attack) this.attackSolve(state, car, a, mistake);
    else if (lastMan === car.id) this.defendSolve(state, car, a);
    else this.supportSolve(state, car, a);

    // Boost holen (sparsam, nur wenn nötig und nahe)
    if (this.mode !== 'attack' && this.mode !== 'clear') this.maybePad(state, car, a);
    else {
      const dt = Math.hypot(this.tx - px, this.tz - pz);
      if (L.padGreed > 0 && car.boost < 60 && dt > 22) this.maybePad(state, car, a, L.padGreed);
      else if (car.boost < 25 && dt > 42) this.maybePad(state, car, a, 14);
    }

    // Gezielte Demolition nur 'pro'
    if (L.demo && car.supersonic && this.mode !== 'attack' && this.mode !== 'clear') this.maybeDemo(state, car);

    // Stecken-bleiben
    this.stuckCheck(state, car);
  }

  private maybeKickoffDodge(car: CarState): void {
    if (!this.L.canDodge || this.man.kind !== M_NONE || this.maneuverCool > 0) return;
    const b = this.b;
    const d = Math.hypot(car.pos[0], car.pos[2]);
    const vf = car.vel[0] * b.fx + car.vel[2] * b.fz;
    const ang = Math.abs(Math.atan2(-car.pos[0] * b.lx - car.pos[2] * b.lz, -car.pos[0] * b.fx - car.pos[2] * b.fz));
    if (car.wheelsOnSurface >= 3 && d >= 3.2 && d <= 6 && vf >= 10 && ang < 0.25) {
      this.dodgeSteer = 0;
      this.startManeuver(M_DODGE);
    }
  }

  /** Boost-Pad ansteuern (nur aktive Pads) */
  private goBoost(state: SimState, car: CarState, a: number, maxDist: number): void {
    const idx = bestPad(state.pads, car, car.pos[0], car.pos[2], maxDist, 40, -a, true);
    this.mode = 'boost';
    if (idx >= 0) {
      const p = state.pads[idx]!;
      this.tx = p.pos[0];
      this.tz = p.pos[2];
      this.ty = car.pos[1];
      this.vcap = MAX_V;
    } else {
      // kein Pad: Platz in der eigenen Hälfte halten
      this.tx = car.pos[0] * 0.5;
      this.tz = -a * 24;
      this.ty = car.pos[1];
      this.hold = true;
    }
  }

  private maybePad(state: SimState, car: CarState, a: number, detour = 14): void {
    const need = 100 - car.boost;
    if (need < 12 || state.pads.length === 0) return;
    const maxDetour = this.mode === 'defend' ? Math.min(detour, 10) : detour;
    const idx = bestPad(state.pads, car, this.tx, this.tz, 30, maxDetour, -a, this.mode === 'defend');
    if (idx >= 0) {
      const p = state.pads[idx]!;
      // Pad nur, wenn sie ankommt, bevor sie sich wieder füllt (Timer ist öffentlich) – aktive Pads sind sofort da
      this.tx = p.pos[0];
      this.tz = p.pos[2];
      this.ty = car.pos[1];
      this.hold = false;
      this.mode = 'boost';
    }
  }

  private maybeDemo(state: SimState, car: CarState): void {
    const cars = state.cars;
    const fx = this.b.fx;
    const fz = this.b.fz;
    for (let i = 0; i < cars.length; i++) {
      const c = cars[i] as CarState;
      if (c.team === car.team || c.demolished > 0) continue;
      const o = this.delayedBase() + 7 + i * CAR_STRIDE;
      const ex = this.ring[o] as number;
      const ez = this.ring[o + 2] as number;
      const dx = ex - car.pos[0];
      const dz = ez - car.pos[2];
      const d = Math.hypot(dx, dz);
      if (d < 4 || d > 24) continue;
      if ((dx * fx + dz * fz) / d < 0.93) continue;
      const lead = 0.22 * d / 14;
      this.tx = ex + (this.ring[o + 3] as number) * lead;
      this.tz = ez + (this.ring[o + 5] as number) * lead;
      this.ty = car.pos[1];
      this.hold = false;
      this.boostOk = true;
      this.mode = 'attack';
      return;
    }
  }

  /** Angriff / Klären: Treffpunkt aus der Ballbahn, Anfahrpunkt hinter dem Ball auf der Linie Ball→Ziel */
  private attackSolve(state: SimState, car: CarState, a: number, mistake: boolean): void {
    const L = this.L;
    const px = car.pos[0];
    const pz = car.pos[2];
    const bx = this.bpx;
    const bz = this.bpz;
    const pred = this.pred;
    const steps = Math.min(PRED_MAX, Math.max(3, Math.round(L.horizon / PRED_STEP)));
    pred.predict(bx, this.bpy, bz, this.bvx, this.bvy, this.bvz, steps);

    const b = this.b;
    const vf = car.vel[0] * b.fx + car.vel[2] * b.fz;
    const boosting = this.boostOk && car.boost > 5;
    const vTrav = Math.max(11, vf + 3) + (boosting ? 3 : 0);
    // Treffpunkt: erster Punkt, den das Auto rechtzeitig und in erreichbarer Höhe erreicht
    const maxY = L.canJump ? L.maxBallY : GROUND_HIT_Y;
    let pi = -1;
    for (let i = 1; i <= pred.n; i++) {
      const y = pred.y[i] as number;
      if (y > maxY) continue;
      const d = Math.hypot((pred.x[i] as number) - px, (pred.z[i] as number) - pz);
      const dirx = (pred.x[i] as number) - px;
      const dirz = (pred.z[i] as number) - pz;
      const turn = d > 0.5 ? (1 - (dirx * b.fx + dirz * b.fz) / d) * 0.35 : 0;
      if (d / vTrav + turn <= i * PRED_STEP + 0.04) {
        pi = i;
        break;
      }
    }
    if (pi < 0) {
      // nicht rechtzeitig erreichbar: auf den letzten erreichbaren Punkt der Bahn zufahren
      pi = pred.n;
      for (let i = pred.n; i >= 1; i--) {
        if ((pred.y[i] as number) <= maxY) {
          pi = i;
          break;
        }
      }
    }
    // Springt der Ball bald wieder in Bodenhöhe, lieber darauf warten statt springen
    if ((pred.y[pi] as number) > GROUND_HIT_Y) {
      const lim = Math.min(pred.n, pi + 18);
      for (let i = pi + 1; i <= lim; i++) {
        if ((pred.y[i] as number) <= GROUND_HIT_Y) {
          pi = i;
          break;
        }
      }
    }
    let ppx = pred.x[pi] as number;
    const ppy = pred.y[pi] as number;
    let ppz = pred.z[pi] as number;
    const tI = pi * PRED_STEP;

    // Zielpunkt für den Schuss: Tor (Kreuzschuss zur Gegenseite) oder Klären zur Seite/nach vorn
    const prog = ppz * a;
    const clearing = prog < -30;
    this.mode = clearing ? 'clear' : 'attack';
    let gx: number;
    let gz: number;
    if (clearing) {
      gx = (bx >= 0 ? 1 : -1) * 30;
      gz = ppz + a * 35;
    } else {
      gx = ppx > 0 ? -3 : 3;
      gz = a * (HALF_L + 2);
    }
    let ux = gx - ppx;
    let uz = gz - ppz;
    const ul = Math.hypot(ux, uz) || 1;
    ux /= ul;
    uz /= ul;

    if (mistake) {
      // verpasster Treffer: Treffpunkt seitlich verschoben
      ppx += -uz * this.mistakeBias;
      ppz += ux * this.mistakeBias;
    }

    const cx = ppx - px;
    const cz = ppz - pz;
    const d = Math.hypot(cx, cz);
    const cosA = d > 0.01 ? (cx * ux + cz * uz) / d : 1;
    const mis = Math.acos(clampN(cosA, -1, 1));
    const rx = px - ppx;
    const rz = pz - ppz;
    const sAlong = rx * ux + rz * uz;
    const lat = -rx * uz + rz * ux;
    // Anfahren (Zielverfolgung auf der Linie Ball→Ziel) oder Umsetzen (erst weit hinter den Ball), mit Hysterese
    const dgNow = Math.hypot(gx - ppx, gz - ppz);
    const tol = L.alignTol * (dgNow < 25 ? 0.8 : 1);
    let appr = this.appr;
    if (appr) {
      if (mis > tol || sAlong > 1.5) appr = false;
    } else if ((mis <= tol * 0.6 && sAlong <= 0.5) || state.tick - this.reposTick > 240) appr = true;
    if (!appr && this.appr) this.reposTick = state.tick;
    this.appr = appr;
    let off = 0;
    let ax = ppx;
    let az = ppz;
    if (appr) {
      // Linienverfolgung: Zielpunkt auf der Schusslinie ein Stück vor dem Auto, höchstens der Ball selbst
      const b = -sAlong;
      const ld = clampN(1.2 * Math.abs(lat) + 3, 4, 12);
      if (b > ld) {
        off = b - ld;
        ax = ppx - ux * off;
        az = ppz - uz * off;
      }
    } else {
      off = 7;
      if (sAlong > -1.5) {
        // Auto steht auf der Torseite des Balls: seitliche Spur (Seite bleibt stabil)
        if (Math.abs(lat) > 2) this.laneSide = lat > 0 ? 1 : -1;
        else if (this.laneSide === 0) this.laneSide = ppx > 0 ? 1 : -1;
        let side = this.laneSide;
        const wx = ppx - ux * 5 - uz * side * 6;
        if (Math.abs(wx) > HALF_W - 4) {
          side = -side;
          this.laneSide = side;
        }
        ax = ppx - ux * 5 - uz * side * 6;
        az = ppz - uz * 5 + ux * side * 6;
      } else {
        ax = ppx - ux * off;
        az = ppz - uz * off;
      }
    }
    ax = clampN(ax, -(HALF_W - 3), HALF_W - 3);
    az = clampN(az, -(HALF_L - 2), HALF_L - 2);
    const f = appr ? 0 : 1;

    this.tx = ax;
    this.tz = az;
    this.ty = car.pos[1];

    // Schusskraft: der Treffer startet den Ball immer unter ca. 32 Grad, die Weite wächst mit dem Tempo (~0,4 v^2).
    // Darum nahe am Ball nur so schnell, dass der Ball das Tor flach erreicht (Stufen: mehr Fehler bei niedriger Stufe).
    this.vcap = MAX_V + 10;
    this.wantPower = clearing;
    if (!clearing && f < 0.2 && d < 18) {
      const dg = Math.hypot(gx - ppx, gz - ppz);
      const vHit = this.L.powerAware ? clampN(shotSpeed(dg) * (1 + this.hitErr), MIN_SHOT_SPEED, 18) : 14;
      const along = (this.bvx * cx + this.bvz * cz) / (d || 1);
      this.vcap = Math.max(MIN_SHOT_SPEED, vHit + Math.max(along, 0) + 0.3 * Math.max(d - 2, 0));
      this.wantPower = vHit >= 15;
    }

    // Sprung / Luftball / Dodge
    this.aimX = ppx;
    this.aimY = ppy;
    this.aimZ = ppz;
    this.aimValid = true;
    if (this.man.kind === M_NONE && this.maneuverCool === 0 && car.wheelsOnSurface >= 3) {
      this.planManeuver(car, ppx, ppy, ppz, tI, d, vf, off, ux, uz);
    }
  }

  private planManeuver(
    car: CarState,
    ppx: number,
    ppy: number,
    ppz: number,
    tI: number,
    d: number,
    vf: number,
    off: number,
    _ux: number,
    _uz: number,
  ): void {
    const L = this.L;
    const b = this.b;
    if (!L.canJump || off > 2.5 || vf < 4) return;
    const dx = ppx - car.pos[0];
    const dz = ppz - car.pos[2];
    const ang = Math.abs(Math.atan2(dx * b.lx + dz * b.lz, dx * b.fx + dz * b.fz));
    if (ang > 0.3) return;
    // Der Ball darf nicht schneller wegfliegen, als wir aufholen
    const closing = ((car.vel[0] - this.bvx) * dx + (car.vel[2] - this.bvz) * dz) / (Math.hypot(dx, dz) || 1);
    if (closing < 2.5) return;
    if (ppy > GROUND_HIT_Y + 0.05) {
      if (ppy <= 3.0) {
        if (tI <= 0.45 && d <= vf * tI + 3.5) this.startManeuver(M_JUMP);
      } else if (L.canDouble && ppy <= L.maxBallY) {
        if (tI <= 0.7 && d <= vf * tI + 4.5) this.startManeuver(M_DOUBLE);
      }
    } else if (L.canDodge && this.wantPower && d >= 2.6 && d <= 5.2 && vf >= 9 && ppy < GROUND_HIT_Y) {
      this.dodgeSteer = 0;
      this.startManeuver(M_DODGE);
    }
  }

  private startManeuver(kind: number): void {
    this.man.start(kind);
    this.maneuverCool = 40;
  }

  /** Verteidigung: zwischen Ball und eigenem Tor stehen */
  private defendSolve(state: SimState, car: CarState, a: number): void {
    const gz = -a * HALF_L;
    const bx = this.bpx + this.bvx * 0.3;
    const bz = this.bpz + this.bvz * 0.3;
    let dx = bx;
    let dz = bz - gz;
    const dl = Math.hypot(dx, dz) || 1;
    dx /= dl;
    dz /= dl;
    const depth = clampN(dl * 0.28, 5, 17);
    let tx = dx * depth;
    const tz = gz + dz * depth;
    tx = clampN(tx, -(ARENA.goalHalfWidth + 3), ARENA.goalHalfWidth + 3);
    this.mode = 'defend';
    this.tx = tx;
    this.tz = clampN(tz, -(HALF_L - 4), HALF_L - 4);
    this.ty = car.pos[1];
    this.fx = this.bpx;
    this.fz = this.bpz;
    this.hold = true;
    void state;
  }

  /** Unterstützung (3v3): zwischen Ball und Verteidiger, quer versetzt */
  private supportSolve(state: SimState, car: CarState, a: number): void {
    void state;
    const prog = clampN(this.bpz * a - 18, -32, 22);
    this.mode = 'support';
    this.tx = clampN(-this.bpx * 0.6, -26, 26);
    this.tz = prog * a;
    this.ty = car.pos[1];
    this.fx = this.bpx;
    this.fz = this.bpz;
    this.hold = true;
  }

  // ---------------------------------------------------------------------------------------
  // Stecken bleiben
  // ---------------------------------------------------------------------------------------
  private stuckCheck(state: SimState, car: CarState): void {
    const tick = state.tick;
    if (tick - this.stuckTick < 40) return;
    const moved = Math.hypot(car.pos[0] - this.stuckX, car.pos[2] - this.stuckZ);
    const grounded = car.wheelsOnSurface >= 3;
    const slow = Math.hypot(car.vel[0], car.vel[2]) < 3;
    const upright = this.b.uy > 0.5;
    if (this.stuckX < 1e8 && moved < 0.8 && slow && this.wantsMove && !this.inBox) {
      this.stuckCount++;
      this.unstickUntil = tick + 40;
      this.unstickSteer = this.rng.chance(0.5) ? 1 : -1;
      this.unstickFlip = !upright || !grounded || this.stuckCount >= 2;
      if (this.unstickFlip) this.man.start(M_FLIP);
    } else if (moved >= 0.8) this.stuckCount = 0;
    this.stuckX = car.pos[0];
    this.stuckZ = car.pos[2];
    this.stuckTick = tick;
  }

  // ---------------------------------------------------------------------------------------
  // Regler (jeder Tick)
  // ---------------------------------------------------------------------------------------
  private control(state: SimState, car: CarState, o: CarInput): void {
    const b = this.b;
    const L = this.L;
    const grounded = car.wheelsOnSurface >= 3;
    const man = this.man;

    if (state.tick < this.unstickUntil) {
      // Befreiung: rückwärts mit Lenkausschlag, ggf. Sprung
      o.throttle = -1;
      o.steer = this.unstickSteer;
      if (this.unstickFlip) {
        if (!grounded || b.uy < 0.5) levelOrFlip(o, b, grounded);
        man.apply(o, 0);
      }
      return;
    }

    if (!grounded) {
      // Luft: Manöver-Ausrichtung oder Abfangen
      if (man.kind === M_NONE || man.kind === M_FLIP) {
        levelAir(o, b);
      } else if (L.canAim && this.aimValid && (man.kind === M_JUMP || man.kind === M_DOUBLE)) {
        const dx = this.aimX - car.pos[0];
        const dy = this.aimY - car.pos[1];
        const dz = this.aimZ - car.pos[2];
        const err = aimAir(o, b, dx, dy, dz);
        const df = dx * b.fx + dy * b.fy + dz * b.fz;
        if (err < 0.3 && df > 2 && car.boost > 0) o.boost = true;
      } else {
        levelAir(o, b);
      }
    } else {
      this.drive(car, o);
    }

    if (man.kind !== M_NONE) {
      const lockAxes = man.apply(o, this.dodgeSteer);
      void lockAxes;
      if (man.kind !== M_NONE && man.t > 10 && grounded && man.kind !== M_FLIP) man.stop();
    }
  }

  /** Bodenfahrt zum Ziel (tx,tz): Lenken per P/D-Regler auf den Winkelfehler, Gas nach Wunschtempo, Boost sparsam */
  private drive(car: CarState, o: CarInput): void {
    const b = this.b;
    const L = this.L;
    const dx = this.tx - car.pos[0];
    const dy = this.ty - car.pos[1];
    const dz = this.tz - car.pos[2];
    let dist = Math.hypot(dx, dz);
    const vf = car.vel[0] * b.fx + car.vel[1] * b.fy + car.vel[2] * b.fz;
    const wy = car.angVel[0] * b.ux + car.angVel[1] * b.uy + car.angVel[2] * b.uz;

    let tx = dx;
    let tz = dz;
    let hold = false;
    // Wartepunkt: innerhalb von 2,5 m einrasten, erst jenseits von 5 m wieder lösen (Hysterese)
    if (!this.hold) this.inBox = false;
    else if (!this.inBox && dist < 2.5) this.inBox = true;
    else if (this.inBox && dist > 5) this.inBox = false;
    if (this.inBox) {
      // Wartepunkt erreicht: zum Ball schauen
      tx = this.fx - car.pos[0];
      tz = this.fz - car.pos[2];
      hold = true;
      dist = 0;
    }
    const ty = dy;
    const ang0 = Math.atan2(tx * b.lx + ty * b.ly + tz * b.lz, tx * b.fx + ty * b.fy + tz * b.fz);
    const ang = wrapAngle(ang0 + this.noise);

    // Rückwärtsfahren, wenn das Ziel nahe hinter dem Auto liegt
    if (this.rev) {
      if (Math.abs(ang0) < 1.25 || dist > 24 || hold) this.rev = false;
    } else if (!hold && Math.abs(ang0) > 1.85 && dist < 16 && vf < 7) this.rev = true;

    if (hold) {
      this.wantsMove = false;
      const e = Math.abs(ang);
      if (e > 0.7) {
        // langsam rollen und drehen
        o.throttle = vf < 3 ? 0.5 : 0;
        o.steer = -clampN(2.2 * ang - 0.25 * wy, -1, 1);
        this.wantsMove = true;
      } else {
        o.throttle = clampN(-vf * 0.8, -1, 1);
        o.steer = -clampN(2.2 * ang - 0.25 * wy, -1, 1);
      }
      return;
    }
    this.wantsMove = true;

    if (this.rev) {
      const angR = wrapAngle(ang0 - Math.PI);
      o.throttle = -1;
      o.steer = clampN(2.2 * angR - 0.25 * wy, -1, 1);
      return;
    }

    o.steer = -clampN(2.2 * ang - 0.25 * wy, -1, 1);
    const absAng = Math.abs(ang);
    let vT = Math.min(this.vcap, MAX_V * clampN(1.75 - absAng * 0.95, 0.4, 1));
    if (absAng > 0.3 && dist < 40) {
      // Kurvenradius: das Ziel muss auf einem Kreis liegen, den das Auto bei diesem Tempo fahren kann
      const rReq = dist / (2 * Math.sin(Math.min(absAng, 2.6)));
      vT = Math.min(vT, MAX_V * Math.sqrt(clampN((rReq * 0.85 - 2.2) / 9, 0, 4)) + 1.5);
    }
    if (this.hold) vT = Math.min(vT, Math.sqrt(2 * 14 * Math.max(0, dist - 1.5)) + 1.5);
    o.throttle = vT >= MAX_V - 0.5 ? 1 : clampN((vT - vf) * 0.6, -1, 1);

    if (L.handbrake && absAng > 1.0 && vf > 7 && dist > 5) {
      o.handbrake = true;
      o.throttle = 1;
    }
    if (
      this.boostOk &&
      car.boost > 1 &&
      absAng < 0.18 &&
      dist > L.boostMinDist &&
      vf < 21.5 &&
      vf > 3 &&
      vT >= MAX_V - 0.5
    ) {
      o.boost = true;
    }
  }
}

/**
 * Größte Anfahrgeschwindigkeit v, bei der der Ball die Torlinie in Entfernung dg noch flach genug erreicht.
 * Modell des Treffers (gemessen): Ball startet mit ca. 1,5 v vorwärts und 0,95 v hoch, danach Wurfparabel mit
 * Bodenkontakten (Restitution 0,6, Rollen unter ~1,5 m/s Steiggeschwindigkeit). Die Latte liegt bei 6,4 m.
 */
export function shotSpeed(dg: number): number {
  const g = BALL_TUNING.gravity;
  const e = BALL_TUNING.restitution;
  for (let v = 18; v >= MIN_SHOT_SPEED; v -= 0.5) {
    const vx = 1.45 * v;
    const tD = dg / vx;
    let vy = 0.95 * v;
    let t = 0;
    let h = BALL_RADIUS;
    for (let k = 0; k < 8; k++) {
      const flight = (2 * vy) / g;
      if (t + flight >= tD) {
        const dt = tD - t;
        h = BALL_RADIUS + vy * dt - 0.5 * g * dt * dt;
        break;
      }
      t += flight;
      vy *= e;
      if (vy < 1.5) {
        h = BALL_RADIUS;
        break;
      }
    }
    if (h <= 4.4) return v;
  }
  return MIN_SHOT_SPEED;
}

/** Auf dem Kopf liegend: Sprung-Pulse zum Aufrichten; Luft: abfangen */
function levelOrFlip(o: CarInput, b: Basis, grounded: boolean): void {
  if (!grounded) levelAir(o, b);
}
