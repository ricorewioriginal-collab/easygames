import type { Rng } from '../rng';
import { goalAt, kickoffSlot } from './arena';
import { placeCar } from './car';
import { BALL_RADIUS, type SimEvent, type SimState, type TeamId } from './types';

/** Spielregeln: Phasen, Anstoß, Tore, Uhr */
export const COUNTDOWN_SECONDS = 3;
export const GOAL_PAUSE_SECONDS = 4;
export const DEFAULT_MATCH_SECONDS = 300;

/** Mannschaften + Ball in Anstoß-Aufstellung, Pads aktiv, Countdown starten. Zufall nur für die Reihenfolge der Plätze. */
export function placeKickoff(state: SimState, rng: Rng): void {
  const cars = state.cars;
  for (const team of [0, 1] as const) {
    const ids: number[] = [];
    for (const c of cars) if (c.team === team) ids.push(c.id);
    const order = rng.shuffle(ids.map((_, i) => i));
    for (let k = 0; k < ids.length; k++) {
      const car = cars[ids[k] as number];
      if (!car) continue;
      const slot = kickoffSlot(team, ids.length, order[k] as number);
      placeCar(car, slot.pos[0], slot.pos[1], slot.pos[2], slot.facing);
    }
  }
  resetBall(state);
  for (const p of state.pads) {
    p.active = true;
    p.timer = 0;
  }
  state.lastTouch = -1;
  state.prevTouch = -1;
  state.phase = 'countdown';
  state.phaseTimer = COUNTDOWN_SECONDS;
  state.rngState = rng.state;
}

export function resetBall(state: SimState): void {
  const b = state.ball;
  b.pos[0] = 0;
  b.pos[1] = BALL_RADIUS;
  b.pos[2] = 0;
  b.vel[0] = b.vel[1] = b.vel[2] = 0;
  b.angVel[0] = b.angVel[1] = b.angVel[2] = 0;
}

/** Fahrzeug an seinen Teamplatz zurück (Respawn / Notfall-Reset) */
export function respawnCar(state: SimState, id: number): void {
  const car = state.cars[id];
  if (!car) return;
  let size = 0;
  let index = 0;
  for (const c of state.cars) {
    if (c.team === car.team) {
      if (c.id === id) index = size;
      size++;
    }
  }
  const slot = kickoffSlot(car.team, size, index);
  placeCar(car, slot.pos[0], slot.pos[1], slot.pos[2], slot.facing);
}

/** Registriert Ballkontakt (letzter / vorletzter Berührer) */
export function registerTouch(state: SimState, carId: number): void {
  if (state.lastTouch !== carId) {
    state.prevTouch = state.lastTouch;
    state.lastTouch = carId;
  }
}

/** Tor-Prüfung: gibt das erzielende Team zurück oder −1 */
export function detectGoal(state: SimState): TeamId | -1 {
  const p = state.ball.pos;
  return goalAt(p[0], p[1], p[2]);
}

/** Tor verbuchen: Punktestand, Ereignis, Phase 'goal' (nur im Spiel; im Training: Ball-Respawn) */
export function scoreGoal(state: SimState, team: TeamId, training: boolean, events: SimEvent[]): void {
  const v = state.ball.vel;
  const speed = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  const last = state.lastTouch >= 0 ? state.cars[state.lastTouch] : undefined;
  let scorer = -1;
  let assist = -1;
  if (last && last.team === team) {
    scorer = last.id;
    const prev = state.prevTouch >= 0 ? state.cars[state.prevTouch] : undefined;
    if (prev && prev.team === team && prev.id !== scorer) assist = prev.id;
  }
  state.score[team]++;
  events.push({ t: 'goal', team, scorer, assist, speed });
  if (training) {
    resetBall(state);
    state.lastTouch = -1;
    state.prevTouch = -1;
    return;
  }
  state.phase = 'goal';
  state.phaseTimer = GOAL_PAUSE_SECONDS;
  if (state.overtime) state.winner = team;
}

/** Countdown fortschalten. Gibt true zurück, wenn der Anstoß erfolgt (Phase wird 'playing'). */
export function stepCountdown(state: SimState, dt: number, events: SimEvent[]): boolean {
  if (state.phaseTimer === COUNTDOWN_SECONDS) events.push({ t: 'countdown', n: 3 });
  const before = Math.ceil(state.phaseTimer - 1e-6);
  state.phaseTimer -= dt;
  if (state.phaseTimer <= 1e-6) {
    state.phaseTimer = 0;
    state.phase = 'playing';
    events.push({ t: 'kickoff' });
    return true;
  }
  const after = Math.ceil(state.phaseTimer - 1e-6);
  if (after !== before && after > 0) events.push({ t: 'countdown', n: after });
  return false;
}

/** Torfeier fortschalten: 'restart' = neuer Anstoß, 'end' = Spielende, sonst 'wait' */
export function stepGoalPause(state: SimState, dt: number, events: SimEvent[]): 'wait' | 'restart' | 'end' {
  state.phaseTimer -= dt;
  if (state.phaseTimer > 1e-6) return 'wait';
  state.phaseTimer = 0;
  if (state.overtime && state.winner !== -1) {
    state.phase = 'ended';
    events.push({ t: 'end', winner: state.winner });
    return 'end';
  }
  return 'restart';
}

/** Uhr fortschalten (nur 'playing', nicht Training, nicht Verlängerung). Gibt true zurück, wenn ein neuer Anstoß nötig ist (Verlängerung). */
export function stepClock(state: SimState, dt: number, events: SimEvent[]): boolean {
  if (state.overtime || state.clock <= 0) return false;
  state.clock -= dt;
  if (state.clock > 1e-9) return false;
  state.clock = 0;
  // Dokumentierte Vereinfachung: Uhr 0 → sofort Ende bzw. Verlängerung; ein Tor im selben Tick wurde vorher gewertet.
  if (state.score[0] === state.score[1]) {
    state.overtime = true;
    events.push({ t: 'overtime' });
    return true;
  }
  const winner: TeamId = (state.score[0] as number) > (state.score[1] as number) ? 0 : 1;
  state.winner = winner;
  state.phase = 'ended';
  events.push({ t: 'end', winner });
  return false;
}
