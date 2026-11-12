import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Farbwechsel-Arena: 6×6 Fliesen. Eine Zielfarbe wird genannt, nach der Warnzeit brechen alle anderen Fliesen weg.
 * Wer dann auf einer weggebrochenen Fliese steht, fällt und verliert ein Leben (2 Leben). A = Sprung-Dash
 * (in der Luft kann man nicht fallen). Ab Runde 3 kann die Zielfarbe mitten in der Warnzeit WECHSELN.
 * Münzen auf fremden Fliesen geben Extrapunkte – wer sie holt, muss rechtzeitig zurück.
 * Koordinaten: Welt (x nach rechts, y nach OBEN auf dem Bildschirm), Fliesen 2×2, Arena von -6 bis 6.
 */
export interface FarbCoin {
  x: number;
  y: number;
  taken: boolean;
}
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
  lives: number;
  /** Restliche Warnticks, bei denen die Zielfarbe wechselt (-1 = kein Wechsel in dieser Runde) */
  switchAt: number;
  /** Zielfarbe hat in dieser Runde schon gewechselt; Ticks seit dem Wechsel */
  switched: boolean;
  sinceSwitch: number;
  coins: FarbCoin[];
  coinCount: number;
  /** Zähler für die Ansicht */
  falls: number;
}

const MAX_TICKS = 30 * 60;
const SPEED = 5.4 / 60;
const DASH_SPEED = 16 / 60;
const DASH_TICKS = 11;
const DASH_CD = 45;
const DROP_TICKS = 72;
const BACK_TICKS = 34;
export const LIVES = 2;
export const COIN_POINTS = 25;
const FALL_TICKS = 50;

export const tileIndex = (x: number, y: number): number => {
  const cx = clamp(Math.floor((x + HALF) / TILE), 0, GRID - 1);
  const cy = clamp(Math.floor((y + HALF) / TILE), 0, GRID - 1);
  return cy * GRID + cx;
};
export const tileCenter = (i: number): { x: number; y: number } => ({
  x: (i % GRID) * TILE - HALF + TILE / 2,
  y: Math.floor(i / GRID) * TILE - HALF + TILE / 2,
});

/** Warnzeit: anfangs gut 3 s, ab Runde 7 nur noch gut 1 s */
export const warnLength = (round: number): number => Math.round(lerp(190, 72, clamp(round / 7, 0, 1)));

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
  // Farbwechsel-Finte ab Runde 3: zur Hälfte der Warnzeit, danach bleibt noch genug Zeit zum Umsteigen
  const roll = s.rnd.next();
  const roll2 = s.rnd.next();
  s.switched = false;
  s.sinceSwitch = 0;
  s.switchAt = s.round >= 2 && roll < lerp(0.45, 0.7, clamp((s.round - 2) / 5, 0, 1)) ? 0 : -1;
  if (s.switchAt === 0) s.switchAt = Math.round(lerp(0.4, 0.55, roll2) * s.warnLen) + 40;
  if (s.switchAt > 0) s.timer += 40; // etwas mehr Zeit, damit der Wechsel fair bleibt
  if (s.switchAt > 0) s.warnLen += 40;
  // Münzen auf fremden Fliesen (immer gleich viele Zufallszahlen ziehen)
  s.coins = [];
  for (let k = 0; k < 2; k++) {
    const pick = s.rnd.int(GRID * GRID);
    let idx = pick;
    for (let j = 0; j < GRID * GRID; j++) {
      const c = (pick + j * 7) % (GRID * GRID);
      if (s.colors[c] !== s.target && !s.coins.some((o) => tileIndex(o.x, o.y) === c)) {
        idx = c;
        break;
      }
    }
    const c = tileCenter(idx);
    s.coins.push({ x: c.x, y: c.y, taken: false });
  }
}

/** Andere Zielfarbe für den Wechsel (deterministisch aus dem Zustand) */
function switchTarget(s: FarbState): void {
  s.target = (s.target + 1 + s.rnd.int(s.ncolors - 1)) % s.ncolors;
  s.switched = true;
  s.sinceSwitch = 0;
  s.safeSince = -1;
}

export const score = (s: FarbState): number => s.rounds * 100 + s.bonus + s.coinCount * COIN_POINTS;

export const game: MiniGame<FarbState> = {
  id: 'farbwechsel',
  name: 'Farbwechsel-Arena',
  tagline: 'Richtige Farbe – sonst geht’s abwärts! Achtung, Farbwechsel!',
  instructions: [
    'Renn auf eine Fliese in der Zielfarbe – alle anderen brechen gleich weg.',
    'Achtung: Ab Runde 3 kann die Zielfarbe plötzlich WECHSELN!',
    'A = Sprung-Dash: in der Luft fällst du nicht. Du hast 2 Leben.',
    'Pro Runde 100 Punkte, Münzen auf fremden Fliesen +25 – aber rechtzeitig zurück!',
  ],
  controls: {
    desktop: 'Pfeiltasten/WASD laufen, Leertaste = Sprung-Dash',
    touch: 'Stick laufen, A = Sprung-Dash',
  },
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
      lives: LIVES,
      switchAt: -1,
      switched: false,
      sinceSwitch: 0,
      coins: [],
      coinCount: 0,
      falls: 0,
    };
    newLayout(s);
    return s;
  },
  step(s, input) {
    if (s.over) return;
    s.tick++;
    const press = input.a && !s.prevA;
    s.prevA = input.a;
    // Phasen laufen für alle gleich weiter – auch während man fällt (gleiche Welt für alle)
    const phaseEvent = advancePhase(s);
    if (s.tick >= MAX_TICKS) s.over = true;
    if (s.dead) {
      s.fallT++;
      if (s.fallT >= FALL_TICKS) {
        if (s.lives <= 0) s.over = true;
        else {
          // Wiedereinstieg auf der nächsten stehenden Fliese (bevorzugt Zielfarbe)
          s.dead = false;
          s.fallT = 0;
          let best = 0;
          let bd = Infinity;
          for (let i = 0; i < GRID * GRID; i++) {
            if (!s.present[i]) continue;
            const c = tileCenter(i);
            const d = Math.hypot(c.x - s.px, c.y - s.py) - (s.colors[i] === s.target ? 3 : 0);
            if (d < bd) {
              bd = d;
              best = i;
            }
          }
          const c = tileCenter(best);
          s.px = c.x;
          s.py = c.y;
          s.dash = 0;
          s.dashCd = 30;
        }
      }
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
    for (const c of s.coins) {
      if (!c.taken && s.phase === 'warn' && Math.hypot(c.x - s.px, c.y - s.py) < 0.85) {
        c.taken = true;
        s.coinCount++;
      }
    }
    if (s.phase === 'warn') {
      const safe = s.colors[ti] === s.target;
      if (safe && s.safeSince < 0) s.safeSince = s.timer;
      else if (!safe) s.safeSince = -1;
    }
    if (phaseEvent === 'drop' && s.present[ti]) {
      s.bonus += Math.floor((Math.max(0, s.safeSince) / 60) * 10);
      s.rounds++;
    }
    if ((s.phase === 'drop' || phaseEvent === 'drop') && !s.present[ti] && !airborne) {
      s.dead = true;
      s.lives--;
      s.falls++;
    } else if (phaseEvent === 'drop' && airborne && !s.present[ti]) s.rounds++;
  },
  done: (s) => s.over,
  score,
  bot(s, skill, rng): InputFrame {
    if (s.dead || s.phase !== 'warn') return { ...NEUTRAL_INPUT };
    const elapsed = s.switched ? s.sinceSwitch : s.warnLen - s.timer;
    const react = Math.round(lerp(60, 12, skill)) + (s.switched ? Math.round(lerp(25, 0, skill)) : 0);
    if (elapsed < react) return { ...NEUTRAL_INPUT };
    const u = (Math.imul(s.rnd.state ^ 0x9e3779b9, 2654435761) >>> 0) / 4294967296; // je Runde fest, aber unabhängig vom Spielerverhalten
    const wrong = u < (1 - skill) * 0.4;
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
    let c = tileCenter(best);
    // Geübte holen eine Münze, wenn die Zeit sicher reicht
    if (skill > 0.45 && s.timer > 50) {
      for (const coin of s.coins) {
        if (coin.taken) continue;
        const d1 = Math.hypot(coin.x - s.px, coin.y - s.py);
        let back = Infinity;
        for (let i = 0; i < s.colors.length; i++)
          if (s.colors[i] === want) {
            const tc = tileCenter(i);
            back = Math.min(back, Math.hypot(tc.x - coin.x, tc.y - coin.y));
          }
        const need = ((d1 + back) / SPEED) * lerp(1.9, 1.25, skill) + 20;
        if (need < s.timer) {
          if (d1 < 5) c = { x: coin.x, y: coin.y };
          break;
        }
      }
    }
    const dx = c.x - s.px;
    const dy = c.y - s.py;
    const d = Math.hypot(dx, dy);
    if (d < lerp(0.9, 0.35, skill)) return { ...NEUTRAL_INPUT };
    const needTicks = (d / SPEED) * 1.05 + 5;
    const dash =
      skill > 0.3 &&
      d > 2.8 &&
      needTicks > s.timer &&
      s.dashCd === 0 &&
      s.dash === 0 &&
      !s.prevA &&
      Math.abs(dx / d - s.fx) + Math.abs(dy / d - s.fy) < 0.6;
    const jitter = (1 - skill) * 0.25;
    return {
      ...NEUTRAL_INPUT,
      x: clamp(dx / d + rng.float(-jitter, jitter), -1, 1),
      y: clamp(dy / d + rng.float(-jitter, jitter), -1, 1),
      a: dash,
    };
  },
  hud: (s) => ({
    left: `Runde ${s.round + 1} · ${'♥'.repeat(Math.max(0, s.lives))}${'♡'.repeat(Math.max(0, LIVES - s.lives))}`,
    right: `${score(s)} Pkt`,
    hint: s.dead
      ? s.lives > 0
        ? 'Abgestürzt! −1 Leben'
        : 'Raus!'
      : s.phase === 'warn'
        ? `${s.switched && s.sinceSwitch < 60 ? 'WECHSEL! ' : ''}Ziel: ${COLOR_NAMES[s.target]}`
        : s.phase === 'drop'
          ? 'Geschafft!'
          : undefined,
  }),
};

/** Phasenuhr (unabhängig vom Spieler). Liefert 'drop', wenn genau jetzt die Fliesen wegbrechen. */
function advancePhase(s: FarbState): 'drop' | '' {
  s.timer--;
  if (s.phase === 'warn') {
    if (s.switched) s.sinceSwitch++;
    if (s.switchAt > 0 && !s.switched && s.timer <= s.switchAt) switchTarget(s);
    if (s.timer <= 0) {
      s.phase = 'drop';
      s.timer = DROP_TICKS;
      for (let i = 0; i < s.present.length; i++) s.present[i] = s.colors[i] === s.target;
      return 'drop';
    }
  } else if (s.phase === 'drop') {
    if (s.timer <= 0) {
      s.phase = 'back';
      s.timer = BACK_TICKS;
    }
  } else if (s.timer <= 0) {
    s.round++;
    newLayout(s);
  }
  return '';
}
