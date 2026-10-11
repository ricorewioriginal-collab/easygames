import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { approach, clamp, lerp } from '../util';

/**
 * Balancier-Brett: Eine Kugel rollt auf einem kippbaren, runden Brett (Koordinaten: x nach rechts, y nach OBEN auf dem Bildschirm).
 * Neigung = Eingabe (mit Verzögerung), Beschleunigung = Neigung × G plus eine leichte „Wellen“-Störung. Löcher und Rand lassen die Kugel fallen.
 */
export interface BoardHole {
  x: number;
  y: number;
}
export interface BoardState {
  tick: number;
  tx: number; // Brettneigung in [-1, 1]
  ty: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  cp: number; // eingesammelte Ziele
  falls: number;
  onTicks: number;
  fallT: number; // > 0: Kugel fällt gerade (Ticks)
  fallKind: 'hole' | 'edge' | '';
  fallX: number;
  fallY: number;
  holes: BoardHole[];
  targets: BoardHole[];
  dist: { a1: number; p1: number; w1: number; a2: number; p2: number; w2: number };
  over: boolean;
}

export const BOARD_R = 6;
export const BALL_R = 0.4;
export const HOLE_R = 0.78;
export const TARGET_R = 0.9;
export const MAX_HOLES = 7;
const G = 15;
const FALL_TICKS = 55;
const PENALTY = 40;
const MAX_TICKS = 30 * 60;

export const activeHoles = (cp: number): number => Math.min(MAX_HOLES, 3 + Math.floor(cp / 2));

/** Störbeschleunigung (Wellengang) zum Zeitpunkt tick */
export function disturbance(s: BoardState, tick: number): { x: number; y: number } {
  const t = tick / 60;
  const grow = lerp(0.7, 1.6, Math.min(1, t / 30));
  return {
    x: s.dist.a1 * grow * Math.sin(s.dist.w1 * t + s.dist.p1),
    y: s.dist.a2 * grow * Math.sin(s.dist.w2 * t + s.dist.p2),
  };
}

export const score = (s: BoardState): number =>
  Math.max(0, s.cp * 100 + Math.floor((s.onTicks * 10) / 60) - s.falls * PENALTY);

export const game: MiniGame<BoardState> = {
  id: 'balancierbrett',
  name: 'Balancier-Brett',
  tagline: 'Halt die Kugel auf dem Brett!',
  instructions: [
    'Neige das Brett, damit die Kugel in die gewünschte Richtung rollt – sie hat echte Trägheit.',
    'Rolle über das leuchtende Ziel. Danach erscheint das nächste.',
    'Meide die Löcher und den Rand: Wer abstürzt, startet in der Mitte neu und verliert Punkte.',
    'Pro Ziel gibt es 100 Punkte, dazu zählt die Zeit auf dem Brett.',
  ],
  controls: { desktop: 'Pfeiltasten/WASD: Brett neigen', touch: 'Stick: Brett neigen' },
  category: 'physics',
  duration: 30,
  touch: { stick: true, a: false, b: false },
  init(seed) {
    const r = new Rng(seed);
    const holes: BoardHole[] = [];
    let guard = 0;
    while (holes.length < MAX_HOLES && guard++ < 500) {
      const a = r.float(0, Math.PI * 2);
      const d = r.float(1.9, BOARD_R - 1.3);
      const h = { x: Math.cos(a) * d, y: Math.sin(a) * d };
      if (holes.every((o) => Math.hypot(o.x - h.x, o.y - h.y) > 2.6)) holes.push(h);
    }
    const targets: BoardHole[] = [];
    let last = { x: 0, y: 0 };
    guard = 0;
    while (targets.length < 40 && guard++ < 5000) {
      const a = r.float(0, Math.PI * 2);
      const d = r.float(1.0, BOARD_R - 1.5);
      const t = { x: Math.cos(a) * d, y: Math.sin(a) * d };
      if (Math.hypot(t.x - last.x, t.y - last.y) < 3.2) continue;
      if (holes.some((h) => Math.hypot(h.x - t.x, h.y - t.y) < HOLE_R + TARGET_R + 0.9)) continue;
      targets.push(t);
      last = t;
    }
    return {
      tick: 0,
      tx: 0,
      ty: 0,
      px: 0,
      py: 0,
      vx: 0,
      vy: 0,
      cp: 0,
      falls: 0,
      onTicks: 0,
      fallT: 0,
      fallKind: '',
      fallX: 0,
      fallY: 0,
      holes,
      targets,
      dist: {
        a1: r.float(1.6, 2.4),
        p1: r.float(0, 6.28),
        w1: r.float(0.7, 1.2),
        a2: r.float(1.6, 2.4),
        p2: r.float(0, 6.28),
        w2: r.float(0.8, 1.4),
      },
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.tick++;
    const dt = 1 / 60;
    // Brett neigt sich nur mit Verzögerung (ca. 0,45 s bis zum Vollausschlag)
    s.tx = approach(s.tx, clamp(input.x, -1, 1), 0.045);
    s.ty = approach(s.ty, clamp(input.y, -1, 1), 0.045);
    if (s.fallT > 0) {
      s.fallT--;
      if (s.fallT === 0) {
        s.px = 0;
        s.py = 0;
        s.vx = 0;
        s.vy = 0;
        s.fallKind = '';
      }
    } else {
      const d = disturbance(s, s.tick);
      let ax = s.tx * G + d.x;
      let ay = s.ty * G + d.y;
      const nh = Math.min(activeHoles(s.cp), s.holes.length);
      for (let i = 0; i < nh; i++) {
        const h = s.holes[i] as BoardHole;
        const dx = h.x - s.px;
        const dy = h.y - s.py;
        const dd = Math.hypot(dx, dy);
        if (dd < 1.5 && dd > 0.001) {
          const pull = 6 * (1 - dd / 1.5);
          ax += (dx / dd) * pull;
          ay += (dy / dd) * pull;
        }
      }
      s.vx += ax * dt;
      s.vy += ay * dt;
      const damp = 1 - 0.55 * dt;
      s.vx *= damp;
      s.vy *= damp;
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > 11) {
        s.vx *= 11 / sp;
        s.vy *= 11 / sp;
      }
      s.px += s.vx * dt;
      s.py += s.vy * dt;
      s.onTicks++;
      // Ziel
      const t = s.targets[s.cp];
      if (t && Math.hypot(t.x - s.px, t.y - s.py) < TARGET_R) s.cp++;
      // Absturz
      for (let i = 0; i < nh; i++) {
        const h = s.holes[i] as BoardHole;
        if (Math.hypot(h.x - s.px, h.y - s.py) < HOLE_R - 0.12) {
          s.fallKind = 'hole';
          s.fallX = h.x;
          s.fallY = h.y;
        }
      }
      if (!s.fallKind && Math.hypot(s.px, s.py) > BOARD_R - 0.05) {
        s.fallKind = 'edge';
        s.fallX = s.px;
        s.fallY = s.py;
      }
      if (s.fallKind) {
        s.fallT = FALL_TICKS;
        s.falls++;
      }
    }
    if (s.tick >= MAX_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score,
  bot(s, skill, rng): InputFrame {
    if (s.fallT > 0) return { ...NEUTRAL_INPUT };
    const t = s.targets[s.cp] ?? { x: 0, y: 0 };
    // Wunschgeschwindigkeit zum Ziel, dann Wunschbeschleunigung, dann Neigung
    const kp = lerp(1.6, 1.7, skill);
    const vmax = lerp(5.5, 4.8, skill);
    let wx = (t.x - s.px) * kp;
    let wy = (t.y - s.py) * kp;
    const wl = Math.hypot(wx, wy);
    if (wl > vmax) {
      wx *= vmax / wl;
      wy *= vmax / wl;
    }
    // Löcher meiden (nur geübte Spieler schauen genau hin)
    const nh = Math.min(activeHoles(s.cp), s.holes.length);
    const care = lerp(0.05, 1, skill);
    for (let i = 0; i < nh; i++) {
      const h = s.holes[i] as BoardHole;
      const dx = s.px - h.x;
      const dy = s.py - h.y;
      const dd = Math.hypot(dx, dy);
      const range = 2.5;
      if (dd < range && dd > 0.001) {
        const push = ((range - dd) / range) * 5.5 * care;
        wx += (dx / dd) * push;
        wy += (dy / dd) * push;
      }
    }
    // Rand meiden
    const pr = Math.hypot(s.px, s.py);
    if (pr > BOARD_R - 1.6) {
      const push = (pr - (BOARD_R - 1.6)) * 2.2;
      wx -= (s.px / pr) * push;
      wy -= (s.py / pr) * push;
    }
    const d = disturbance(s, s.tick);
    const gain = lerp(0.9, 3.4, skill);
    const ax = (wx - s.vx) * gain - d.x;
    const ay = (wy - s.vy) * gain - d.y;
    const noise = (1 - skill) * 0.9;
    return {
      ...NEUTRAL_INPUT,
      x: clamp(ax / G + rng.float(-noise, noise), -1, 1),
      y: clamp(ay / G + rng.float(-noise, noise), -1, 1),
    };
  },
  hud: (s) => ({
    left: `Ziele ${s.cp}`,
    right: `${score(s)} Pkt`,
    hint: s.fallT > 0 ? 'Abgestürzt!' : s.falls ? `${s.falls} Abstürze` : undefined,
  }),
};
