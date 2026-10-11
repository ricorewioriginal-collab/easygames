import { Rng } from '../rng';
import { InputLog, MiniGame, MiniGameInitOptions, TICK_RATE } from './types';
import { InputRecorder, LogPlayer, quantize, validateLog } from './input';

export interface SimResult {
  score: number;
  ticks: number;
  finished: boolean;
}

export const maxTicks = (g: MiniGame): number => Math.ceil(g.duration * TICK_RATE) + 2;

/** Rechnet ein Minispiel nach (Server und Tests). Ungültige Protokolle werfen. */
export function simulate(g: MiniGame, seed: number, opts: MiniGameInitOptions, log: InputLog): SimResult {
  const limit = maxTicks(g);
  if (!validateLog(log, limit)) throw new Error('Ungültiges Eingabeprotokoll');
  const s = g.init(seed, opts);
  const player = new LogPlayer(log);
  let tick = 0;
  while (tick < limit && !g.done(s)) {
    g.step(s, player.at(tick));
    tick++;
  }
  const score = g.score(s);
  return { score: Number.isFinite(score) && score > 0 ? score : 0, ticks: tick, finished: g.done(s) };
}

/** Lässt die KI ein Minispiel spielen und liefert Ergebnis und Protokoll. */
export function runBot(g: MiniGame, seed: number, opts: MiniGameInitOptions, skill: number, botSeed: number): SimResult & { log: InputLog } {
  const rng = new Rng(botSeed);
  const s = g.init(seed, opts);
  const rec = new InputRecorder();
  const limit = maxTicks(g);
  let tick = 0;
  while (tick < limit && !g.done(s)) {
    const input = rec.push(tick, quantize(g.bot(s, skill, rng)));
    g.step(s, input);
    tick++;
  }
  const score = g.score(s);
  return { score: Number.isFinite(score) && score > 0 ? score : 0, ticks: tick, finished: g.done(s), log: rec.log };
}
