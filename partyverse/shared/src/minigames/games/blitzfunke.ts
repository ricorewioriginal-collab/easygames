import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/** Reaktionsduell: Wenn das Signal grün wird, so schnell wie möglich A drücken. Zu früh = Fehlstart. */
export interface BlitzState {
  rnd: Rng;
  round: number; // 0-basiert
  rounds: number;
  phase: 'wait' | 'go' | 'result' | 'lock' | 'over';
  timer: number; // Ticks in der aktuellen Phase
  delay: number; // Wartezeit bis zum Signal (Ticks)
  points: number[];
  total: number;
  prevA: boolean;
  falseStarts: number;
  lastMs: number; // letzte Reaktionszeit in ms (0 = keine)
}

const ROUNDS = 5;
const TIMEOUT = 100; // Ticks nach dem Signal, danach gibt es 0 Punkte

const newDelay = (r: Rng): number => 55 + r.int(110);

export const game: MiniGame<BlitzState> = {
  id: 'blitzfunke',
  name: 'Blitzfunke',
  tagline: 'Wer zuckt zuerst?',
  instructions: [
    'Die Funkbake leuchtet erst rot. Warte ab!',
    'Sobald sie GRÜN wird, drückst du so schnell wie möglich.',
    'Zu früh gedrückt? Fehlstart – das bringt in dieser Runde keine Punkte.',
    'Fünf Runden – die schnellste Reaktion gewinnt.',
  ],
  controls: { desktop: 'Leertaste, Enter oder Mausklick', touch: 'Großen Knopf antippen' },
  category: 'reaction',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed);
    return { rnd, round: 0, rounds: ROUNDS, phase: 'wait', timer: 0, delay: newDelay(rnd), points: [], total: 0, prevA: false, falseStarts: 0, lastMs: 0 };
  },
  step(s, input) {
    if (s.phase === 'over') return;
    const press = (input.a || input.pd) && !s.prevA;
    s.prevA = input.a || input.pd;
    s.timer++;
    const finishRound = (pts: number) => {
      s.points.push(pts);
      s.total += pts;
      s.phase = 'result';
      s.timer = 0;
    };
    if (s.phase === 'wait') {
      if (press) {
        s.falseStarts++;
        s.lastMs = 0;
        finishRound(0);
        s.phase = 'lock'; // Sperre statt normales Ergebnis
      } else if (s.timer >= s.delay) {
        s.phase = 'go';
        s.timer = 0;
        s.lastMs = 0;
      }
    } else if (s.phase === 'go') {
      if (press) {
        const ms = (s.timer * 1000) / 60;
        s.lastMs = Math.round(ms);
        finishRound(Math.round(clamp(1000 - Math.max(0, ms - 120) * 1.6, 0, 1000)));
      } else if (s.timer >= TIMEOUT) {
        s.lastMs = 0;
        finishRound(0);
      }
    } else if (s.phase === 'result' || s.phase === 'lock') {
      if (s.timer >= (s.phase === 'lock' ? 75 : 45)) {
        s.round++;
        if (s.round >= s.rounds) s.phase = 'over';
        else {
          s.phase = 'wait';
          s.timer = 0;
          s.delay = newDelay(s.rnd);
        }
      }
    }
  },
  done: (s) => s.phase === 'over',
  score: (s) => s.total,
  bot(s, skill, rng): InputFrame {
    // Menschenähnlich: gute Bots reagieren nach ~15 Ticks (250 ms), schwache nach ~34 Ticks. Selten ein Fehlstart.
    if (s.phase === 'wait' && rng.next() < (1 - skill) * 0.0015) return { ...NEUTRAL_INPUT, a: true };
    if (s.phase === 'go') {
      const target = Math.round(lerp(34, 14, skill)) + (s.round % 3);
      return { ...NEUTRAL_INPUT, a: s.timer >= target };
    }
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => ({ left: `Runde ${Math.min(s.round + 1, s.rounds)}/${s.rounds}`, right: `${s.total} Pkt`, hint: s.phase === 'go' ? 'JETZT!' : s.phase === 'lock' ? 'Fehlstart!' : s.lastMs ? `${s.lastMs} ms` : undefined }),
};
