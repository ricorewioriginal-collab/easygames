import { Sim } from './sim';
import type { CarInput, SimConfig } from './types';

/** Hilfen für die Headless-Tests (kein Teil der öffentlichen API) */
export function makeSim(cars: Array<0 | 1> = [0], extra: Partial<SimConfig> = {}): Sim {
  const sim = new Sim({ cars: cars.map((team) => ({ team })), seed: 1, training: true, pads: false, ...extra });
  skipCountdown(sim);
  return sim;
}

/** Countdown überspringen (181 Ticks leere Eingabe) */
export function skipCountdown(sim: Sim): void {
  for (let i = 0; i < 181 && sim.state.phase === 'countdown'; i++) sim.step([]);
}

export function run(sim: Sim, ticks: number, input: Partial<CarInput> | ((i: number) => Partial<CarInput>)): void {
  for (let i = 0; i < ticks; i++) sim.step([typeof input === 'function' ? input(i) : input]);
}

/** Drehung um die Hochachse für Blick nach +x */
export const FACE_X: [number, number, number, number] = [0, Math.SQRT1_2, 0, Math.SQRT1_2];

export function speed(v: ArrayLike<number>): number {
  return Math.sqrt((v[0] as number) ** 2 + (v[1] as number) ** 2 + (v[2] as number) ** 2);
}
