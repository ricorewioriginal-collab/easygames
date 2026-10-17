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

/**
 * KI-Spieler Takt für Takt. Dieselbe Rechnung wie runBot – so kann der Client die Bots live mitlaufen lassen
 * und kommt genau auf deren offizielles Ergebnis.
 */
export class BotRunner {
  tick = 0;
  readonly state: unknown;
  private readonly rng: Rng;
  private readonly rec = new InputRecorder();
  private readonly limit: number;

  constructor(
    private readonly g: MiniGame,
    seed: number,
    opts: MiniGameInitOptions,
    private readonly skill: number,
    botSeed: number,
  ) {
    this.rng = new Rng(botSeed);
    this.state = g.init(seed, opts);
    this.limit = maxTicks(g);
  }
  get done(): boolean {
    return this.tick >= this.limit || this.g.done(this.state);
  }
  step(): void {
    if (this.done) return;
    this.g.step(this.state, this.rec.push(this.tick, quantize(this.g.bot(this.state, this.skill, this.rng))));
    this.tick++;
  }
  score(): number {
    const sc = this.g.score(this.state);
    return Number.isFinite(sc) && sc > 0 ? sc : 0;
  }
  get log(): InputLog {
    return this.rec.log;
  }
}

/** Lässt die KI ein Minispiel spielen und liefert Ergebnis und Protokoll. */
export function runBot(
  g: MiniGame,
  seed: number,
  opts: MiniGameInitOptions,
  skill: number,
  botSeed: number,
): SimResult & { log: InputLog } {
  const b = new BotRunner(g, seed, opts, skill, botSeed);
  while (!b.done) b.step();
  return { score: b.score(), ticks: b.tick, finished: g.done(b.state), log: b.log };
}
