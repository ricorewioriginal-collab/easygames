import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';

/**
 * Seilspringen: Das Seil schwingt in Umläufen unterschiedlicher Dauer (Tempo/Rhythmus aus dem Seed).
 * Zur Wende unten (Mitte eines Umlaufs) muss die Figur in der Luft sein. Serie -> Multiplikator.
 */
export interface RopeState {
  /** Dauer jedes Umlaufs in Ticks */
  turns: number[];
  turn: number;
  /** Tick innerhalb des aktuellen Umlaufs, 0 = Seil ganz oben */
  u: number;
  t: number;
  y: number;
  vy: number;
  jumpBuf: number;
  prevA: boolean;
  /** 0 = offen, 1 = Treffer, 2 = geschafft (für den aktuellen Umlauf) */
  passState: 0 | 1 | 2;
  stumble: number;
  invuln: number;
  hits: number;
  streak: number;
  bestStreak: number;
  clears: number;
  points: number;
  jumps: number;
  over: boolean;
}

const TOTAL_TICKS = 30 * 60;
const DT = 1 / 60;
const JUMP_V = 6.8;
const GRAV = 32;
export const CLEAR_H = 0.32;
const WINDOW = 3;
const STUMBLE_TICKS = 42;

export const multiplier = (streak: number): number => 1 + Math.min(4, Math.floor(Math.max(0, streak - 1) / 3));
export const crossTick = (period: number): number => Math.floor(period / 2);

function genTurns(seed: number): number[] {
  const r = new Rng((seed ^ 0x7f4a7c15) >>> 0);
  const turns: number[] = [96, 96, 96, 96];
  let total = 96 * 4;
  const steady = [96, 88, 80, 72, 66, 60, 56, 52, 48];
  while (total < TOTAL_TICKS + 240) {
    const diff = Math.min(1, total / TOTAL_TICKS);
    const style = r.next();
    if (style < 0.5) {
      const n = r.range(3, 5);
      const lo = Math.floor(diff * 5);
      const hi = Math.min(steady.length - 1, 2 + Math.floor(diff * 6));
      const p = steady[r.range(Math.min(lo, hi), hi)] as number;
      for (let k = 0; k < n; k++) {
        turns.push(p);
        total += p;
      }
    } else if (style < 0.8) {
      const longP = r.pick([92, 84, 78]);
      const shortP = r.pick([52, 48, 46]);
      for (let k = 0; k < r.range(2, 3); k++) {
        turns.push(longP, shortP);
        total += longP + shortP;
      }
    } else {
      const fast = 48 - (diff > 0.5 ? 2 : 0);
      const n = r.range(2, 4);
      for (let k = 0; k < n; k++) turns.push(fast);
      turns.push(90);
      total += fast * n + 90;
    }
  }
  return turns;
}

const hash01 = (i: number): number => ((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 5, 0x85ebca6b)) >>> 8 & 0xffff) / 65536;

export const game: MiniGame<RopeState> = {
  id: 'seilsprung',
  name: 'Seilsprung',
  tagline: 'Spring im Takt – wer stolpert, fängt wieder von vorn an!',
  instructions: [
    'Zwei Freunde schwingen das Seil, du springst in der Mitte.',
    'Drücke A genau dann, wenn das Seil von oben herunterkommt – nicht zu früh, nicht zu spät.',
    'Tempo und Rhythmus wechseln. Schau auf das Seil, nicht auf die Uhr!',
    'Jeder Sprung in Serie bringt mehr Punkte. Nach drei Stolperern ist Schluss.',
  ],
  controls: { desktop: 'Leertaste oder Enter = springen', touch: 'Knopf A antippen' },
  category: 'platform',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const turns = genTurns(seed);
    return {
      turns,
      turn: 0,
      u: 0,
      t: 0,
      y: 0,
      vy: 0,
      jumpBuf: 0,
      prevA: false,
      passState: 0,
      stumble: 0,
      invuln: 0,
      hits: 0,
      streak: 0,
      bestStreak: 0,
      clears: 0,
      points: 0,
      jumps: 0,
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.t++;
    const press = !!input.a && !s.prevA;
    s.prevA = !!input.a;
    if (press) s.jumpBuf = 6;
    else if (s.jumpBuf > 0) s.jumpBuf--;
    if (s.stumble > 0) s.stumble--;
    if (s.invuln > 0) s.invuln--;
    // Springen
    if (s.y <= 0 && s.vy <= 0 && s.jumpBuf > 0 && s.stumble <= 0) {
      s.vy = JUMP_V;
      s.y = 0.0001;
      s.jumpBuf = 0;
      s.jumps++;
    }
    if (s.y > 0 || s.vy > 0) {
      s.vy -= GRAV * DT;
      s.y += s.vy * DT;
      if (s.y <= 0) {
        s.y = 0;
        s.vy = 0;
      }
    }
    // Seil
    s.u++;
    const period = s.turns[s.turn] as number;
    if (s.u >= period) {
      s.turn++;
      s.u = 0;
      s.passState = 0;
    }
    const per = s.turns[s.turn] ?? 96;
    const c = crossTick(per);
    if (s.passState === 0) {
      if (s.u >= c - WINDOW && s.u <= c + WINDOW) {
        if (s.invuln <= 0 && s.y < CLEAR_H) {
          s.passState = 1;
          s.hits++;
          s.streak = 0;
          s.stumble = STUMBLE_TICKS;
          s.invuln = STUMBLE_TICKS + 6;
          s.vy = 0;
          if (s.hits >= 3) s.over = true;
        } else if (s.u === c + WINDOW) {
          if (s.invuln <= 0) {
            s.passState = 2;
            s.streak++;
            s.bestStreak = Math.max(s.bestStreak, s.streak);
            s.clears++;
            s.points += 10 * multiplier(s.streak);
          } else s.passState = 2;
        }
      }
    }
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => s.points,
  bot(s, skill): InputFrame {
    if (s.over || s.stumble > 0 || s.y > 0 || s.prevA) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    // nächster noch offener Umlauf-Zeitpunkt
    let tc: number;
    let turnIdx = s.turn;
    const c0 = crossTick(s.turns[s.turn] as number);
    if (s.passState === 0 && s.u <= c0 + 1) tc = c0 - s.u;
    else {
      turnIdx = s.turn + 1;
      tc = (s.turns[s.turn] as number) - s.u + crossTick(s.turns[turnIdx] ?? 96);
    }
    const apex = (JUMP_V / GRAV) * 60;
    const sig = (s.turns[9] ?? 0) * 7 + (s.turns[13] ?? 0) * 13 + (s.turns[21] ?? 0) * 31 + (s.turns[30] ?? 0) * 3;
    const jit = (hash01(turnIdx * 17 + sig) - 0.5) * 2 * err * 14 - err * 3;
    const lead = apex + jit;
    return { ...NEUTRAL_INPUT, a: tc <= lead && tc > 0 };
  },
  hud: (s) => ({
    left: `${s.points} Pkt · ×${multiplier(s.streak)}`,
    right: `Stolperer ${s.hits}/3`,
    hint: s.stumble > 0 ? 'Hoppla!' : s.streak >= 4 ? `Serie ${s.streak}` : undefined,
  }),
};

// kleine Hilfsfunktion für die Ansicht: Seilphase 0..1 (0 = oben, 0.5 = unten)
export const ropePhase = (s: RopeState): number => s.u / (s.turns[s.turn] ?? 96);
