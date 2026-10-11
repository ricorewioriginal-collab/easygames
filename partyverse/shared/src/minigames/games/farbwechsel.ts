import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Farbwechsel-Arena: 6×6 Fliesen. Eine Zielfarbe wird genannt, nach der Warnzeit brechen alle anderen Fliesen weg.
 * Wer dann auf einer weggebrochenen Fliese steht, fällt (Ende). A = Sprung-Dash (in der Luft kann man nicht fallen).
 * Koordinaten: Welt (x nach rechts, y nach OBEN auf dem Bildschirm), Fliesen 2×2, Arena von -6 bis 6.
 */
export const GRID = 6;
export const TILE = 2;
export const HALF = (GRID * TILE) / 2;
export const COLOR_NAMES = ['Rot', 'Blau', 'Grün', 'Gelb', 'Lila', 'Orange'] as const;

export interface FarbState {
  rnd: Rng;
  tick: number;
  px: number;
  py: number;
  fx: number; // Blickrichtung
  fy: number;
  dash: number; // Ticks Dash übrig
  dashCd: number;
  dashX: number;
  dashY: number;
  prevA: boolean;
  phase: 'warn' | 'drop' | 'back';
  timer: number;
  warnLen: number;
  round: number; // Nummer der laufenden Runde (0-basiert)
  rounds: number; // überstandene Runden
  bonus: number;
  colors: number[]; // je Fliese Farbindex
  present: boolean[];
  target: number;
  ncolors: number;
  safeSince: number; // verbleibende Warnticks, seit denen der Spieler sicher steht (-1 = nicht sicher)
  dead: boolean;
  fallT: number;
  over: boolean;
}

const MAX_TICKS = 30 * 60;
const SPEED = 5.4 / 60;
const DASH_SPEED = 16 / 60;
const DASH_TICKS = 11;
const DASH_CD = 45;
const DROP_TICKS = 72;
const BACK_TICKS = 34;

export const tileIndex = (x: number, y: number): number => {
  const cx = clamp(Math.floor((x + HALF) / TILE), 0, GRID - 1);
  const cy = clamp(Math.floor((y + HALF) / TILE), 0, GRID - 1);
  return cy * GRID + cx;
};
export const tileCenter = (i: number): { x: number; y: number } => ({ x: (i % GRID) * TILE - HALF + TILE / 2, y: Math.floor(i / GRID) * TILE - HALF + TILE / 2 });

const warnLength = (round: number): number => Math.round(lerp(200, 84, clamp(round / 8, 0, 1)));

function newLayout(s: FarbState): void {
  s.ncolors = Math.min(6, 3 + Math.floor(s.round / 2));
  const list: number[] = [];
  for (let i = 0; i < GRID * GRID; i++) list.push(i % s.ncolors);
  s.colors = s.rnd.shuffle(list);
  s.target = s.rnd.int(s.ncolors);
  s.present = s.colors.map(() => true);
  s.warnLen = warnLength(s.round);
  s.timer = s.warnLen;
  s.phase = 'warn';
  s.safeSince = -1;
}

export const score = (s: FarbState): number => s.rounds * 100 + s.bonus;

export const game: MiniGame<FarbState> = {
  id: 'farbwechsel',
  name: 'Farbwechsel-Arena',
  tagline: 'Steh auf der richtigen Farbe, wenn der Boden bricht!',
  instructions: [
    'Oben steht die Zielfarbe. Renn auf eine fliese in dieser Farbe!'.replace('fliese', 'Fliese'),
    'Nach der Warnzeit brechen alle anderen Fliesen weg – wer darauf steht, fällt.',
    'Mit A springst du ein Stück in Laufrichtung. In der Luft kannst du nicht fallen.',
    'Jede Runde wird kürzer und es kommen mehr Farben. Pro Runde 100 Punkte, schnelles Ankommen gibt Bonus.',
  ],
  controls: { desktop: 'Pfeiltasten/WASD laufen, Leertaste springt', touch: 'Stick laufen, Knopf A springt' },
  category: 'survival',
  duration: 30,
  touch: { stick: true, a: true, b: false },
  init(seed) {
    const s: FarbState = {
      rnd: new Rng(seed).fork(3),
      tick: 0,
      px: 0.5,
      py: -0.5,
      fx: 0,
      fy: 1,
      dash: 0,
      dashCd: 0,
      dashX: 0,
      dashY: 0,
      prevA: false,
      phase: 'warn',
      timer: 0,
      warnLen: 0,
      round: 0,
      rounds: 0,
      bonus: 0,
      colors: [],
      present: [],
      target: 0,
      ncolors: 3,
      safeSince: -1,
      dead: false,
      fallT: 0,
      over: false,
    };
    newLayout(s);
    return s;
  },
  step(s, input) {
    if (s.over) return;
    s.tick++;
    const press = input.a && !s.prevA;
    s.prevA = input.a;
    if (s.dead) {
      s.fallT++;
      if (s.fallT >= 45) s.over = true;
      return;
    }
    // Bewegung
    let mx = clamp(input.x, -1, 1);
    let my = clamp(input.y, -1, 1);
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    if (len > 0.1) {
      s.fx = mx / Math.max(len, 1e-6);
      s.fy = my / Math.max(len, 1e-6);
    }
    if (s.dashCd > 0) s.dashCd--;
    if (press && s.dash === 0 && s.dashCd === 0) {
      s.dash = DASH_TICKS;
      s.dashCd = DASH_CD;
      s.dashX = s.fx;
      s.dashY = s.fy;
    }
    if (s.dash > 0) {
      s.dash--;
      s.px += s.dashX * DASH_SPEED;
      s.py += s.dashY * DASH_SPEED;
    } else {
      s.px += mx * SPEED;
      s.py += my * SPEED;
    }
    s.px = clamp(s.px, -HALF + 0.3, HALF - 0.3);
    s.py = clamp(s.py, -HALF + 0.3, HALF - 0.3);
    const ti = tileIndex(s.px, s.py);
    const airborne = s.dash > 0;
    // Phasen
    s.timer--;
    if (s.phase === 'warn') {
      const safe = s.colors[ti] === s.target;
      if (safe && s.safeSince < 0) s.safeSince = s.timer;
      else if (!safe) s.safeSince = -1;
      if (s.timer <= 0) {
        s.phase = 'drop';
        s.timer = DROP_TICKS;
        for (let i = 0; i < s.present.length; i++) s.present[i] = s.colors[i] === s.target;
        if (!s.present[ti] && !airborne) {
          s.dead = true;
          return;
        }
        if (s.present[ti]) s.bonus += Math.floor((Math.max(0, s.safeSince) / 60) * 10);
        s.rounds++;
      }
    } else if (s.phase === 'drop') {
      if (!s.present[ti] && !airborne) {
        s.dead = true;
        return;
      }
      if (s.timer <= 0) {
        s.phase = 'back';
        s.timer = BACK_TICKS;
      }
    } else if (s.phase === 'back') {
      if (s.timer <= 0) {
        s.round++;
        newLayout(s);
        // Wer beim Zurückkommen der Fliesen gerade in der Luft ist, ist sicher.
      }
    }
    if (s.tick >= MAX_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score,
  bot(s, skill, rng): InputFrame {
    if (s.dead || s.phase !== 'warn') {
      // Während des Falls der Fliesen sicher stehen bleiben
      if (s.phase === 'drop' || s.phase === 'back') return { ...NEUTRAL_INPUT };
      return { ...NEUTRAL_INPUT };
    }
    const elapsed = s.warnLen - s.timer;
    const react = Math.round(lerp(60, 12, skill));
    if (elapsed < react) return { ...NEUTRAL_INPUT };
    const u = Math.abs(Math.sin((s.round + 1) * 12.9898) * 43758.5453) % 1;
    const wrong = u < (1 - skill) * 0.45;
    // Zielfliese: nächste in der (vielleicht verwechselten) Farbe
    const want = wrong ? (s.target + 1) % s.ncolors : s.target;
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i < s.colors.length; i++) {
      if (s.colors[i] !== want) continue;
      const c = tileCenter(i);
      const d = Math.hypot(c.x - s.px, c.y - s.py);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (best < 0) return { ...NEUTRAL_INPUT };
    const c = tileCenter(best);
    const dx = c.x - s.px;
    const dy = c.y - s.py;
    const d = Math.hypot(dx, dy);
    if (d < lerp(0.9, 0.35, skill)) return { ...NEUTRAL_INPUT };
    const needTicks = (d / SPEED) * 1.05 + 5;
    const dash = skill > 0.3 && d > 2.8 && needTicks > s.timer && s.dashCd === 0 && s.dash === 0 && !s.prevA && Math.abs(dx / d - s.fx) + Math.abs(dy / d - s.fy) < 0.6;
    const jitter = (1 - skill) * 0.25;
    return { ...NEUTRAL_INPUT, x: clamp(dx / d + rng.float(-jitter, jitter), -1, 1), y: clamp(dy / d + rng.float(-jitter, jitter), -1, 1), a: dash };
  },
  hud: (s) => ({
    left: `Runde ${s.round + 1}`,
    right: `${score(s)} Pkt`,
    hint: s.dead ? 'Abgestürzt!' : s.phase === 'warn' ? `Ziel: ${COLOR_NAMES[s.target]}` : s.phase === 'drop' ? 'Geschafft!' : undefined,
  }),
};
