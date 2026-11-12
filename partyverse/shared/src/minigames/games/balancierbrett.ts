import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { approach, clamp, lerp } from '../util';

/**
 * Balancier-Brett: Eine Kugel rollt auf einem kippbaren, runden Brett (Koordinaten: x nach rechts, y nach OBEN auf dem Bildschirm).
 * Neigung = Eingabe (mit Verzögerung), Beschleunigung = Neigung × G plus eine leichte „Wellen“-Störung. Löcher und Rand lassen die Kugel fallen.
 * Steigerung: mehr Löcher, Windböen (mit Warnpfeil) und ein bröckelnder Brettrand. Schnelle Ziele geben Tempo-Bonus.
 */
export interface BoardHole {
  x: number;
  y: number;
}
/** Windböe: Start-Tick (Warnung beginnt), Richtung, Stärke */
export interface Gust {
  at: number;
  a: number;
  str: number;
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
  gusts: Gust[];
  bonus: number;
  lastBonus: number;
  /** Tick, an dem das aktuelle Ziel erschien */
  cpTick: number;
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
export const GUST_WARN = 54;
export const GUST_DUR = 42;
/** Tempo-Bonus: bis zu 60 Punkte, wenn das Ziel schnell erreicht wird (innerhalb von 4 s) */
export const speedBonus = (ticks: number): number => Math.max(0, Math.round(60 * (1 - ticks / 240)));

export const activeHoles = (cp: number): number => Math.min(MAX_HOLES, 3 + Math.floor(cp / 2));
/** Brettrand bröckelt ab Sekunde 10 von 6 auf 5,25 (Löcher bleiben ganz auf dem Brett) */
export const edgeR = (tick: number): number => lerp(BOARD_R, 5.25, clamp((tick / 60 - 10) / 16, 0, 1));

/** Aktuelle Böenbeschleunigung (0 außerhalb der aktiven Zeit) und ob gerade eine Böe angekündigt wird */
export function gustAt(
  s: BoardState,
  tick: number,
): { x: number; y: number; warn: Gust | null; active: Gust | null } {
  for (const g of s.gusts) {
    if (tick < g.at || tick >= g.at + GUST_WARN + GUST_DUR) continue;
    if (tick < g.at + GUST_WARN) return { x: 0, y: 0, warn: g, active: null };
    const k = (tick - g.at - GUST_WARN) / GUST_DUR;
    const env = Math.sin(k * Math.PI);
    return { x: Math.cos(g.a) * g.str * env, y: Math.sin(g.a) * g.str * env, warn: null, active: g };
  }
  return { x: 0, y: 0, warn: null, active: null };
}

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
  Math.max(0, s.cp * 100 + s.bonus + Math.floor((s.onTicks * 10) / 60) - s.falls * PENALTY);

export const game: MiniGame<BoardState> = {
  id: 'balancierbrett',
  name: 'Balancier-Brett',
  tagline: 'Balancier auf der Kugel – trotz Wind, Löchern und bröckelndem Rand!',
  instructions: [
    'Neige das Brett: Deine Kugel rollt mit echter Trägheit. Fahr über das leuchtende Ziel (100 Punkte).',
    'Schnell zum Ziel = Tempo-Bonus. Mit jedem Ziel kommen neue Löcher dazu.',
    'Windböen: Der Pfeil warnt – dagegenhalten! Später bröckelt auch der Brettrand.',
    'Absturz kostet 40 Punkte und Zeit.',
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
      const d = r.float(1.9, BOARD_R - 1.6);
      const h = { x: Math.cos(a) * d, y: Math.sin(a) * d };
      if (holes.every((o) => Math.hypot(o.x - h.x, o.y - h.y) > 2.6)) holes.push(h);
    }
    // Ziele: immer genug (früher konnten 7 Löcher alle Plätze sperren → gar kein Ziel). Bevorzugt weit vom
    // letzten Ziel und mit Abstand zu den Löchern; notfalls der beste Kandidat, aber nie im Loch.
    const targets: BoardHole[] = [];
    let last = { x: 0, y: 0 };
    while (targets.length < 40) {
      let best = { x: 0, y: 0 };
      let bestScore = -Infinity;
      for (let tries = 0; tries < 80; tries++) {
        const a = r.float(0, Math.PI * 2);
        const d = r.float(1.0, BOARD_R - 1.8);
        const t = { x: Math.cos(a) * d, y: Math.sin(a) * d };
        let hd = Infinity;
        for (const h of holes) hd = Math.min(hd, Math.hypot(h.x - t.x, h.y - t.y) - HOLE_R - TARGET_R);
        const ld = Math.hypot(t.x - last.x, t.y - last.y);
        const sc = hd < 0.1 ? hd - 100 : Math.min(hd, 0.5) + Math.min(ld, 3.2) / 3.2;
        if (sc > bestScore) {
          bestScore = sc;
          best = t;
        }
        if (hd >= 0.5 && ld >= 3.2) break;
      }
      targets.push(best);
      last = best;
    }
    // Windböen ab Sekunde 6, später häufiger und stärker
    const gusts: Gust[] = [];
    let at = 6 * 60;
    while (at < MAX_TICKS - 60) {
      const k = clamp(at / MAX_TICKS, 0, 1);
      gusts.push({ at, a: r.float(0, Math.PI * 2), str: lerp(8, 13, k) });
      at += GUST_WARN + GUST_DUR + Math.round(lerp(170, 70, k) * r.float(0.8, 1.2));
    }
    return {
      gusts,
      bonus: 0,
      lastBonus: 0,
      cpTick: 0,
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
        s.cpTick = s.tick; // Tempo-Bonus zählt ab dem Wiedereinstieg
      }
    } else {
      const d = disturbance(s, s.tick);
      const gu = gustAt(s, s.tick);
      let ax = s.tx * G + d.x + gu.x;
      let ay = s.ty * G + d.y + gu.y;
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
      if (t && Math.hypot(t.x - s.px, t.y - s.py) < TARGET_R) {
        s.cp++;
        s.lastBonus = speedBonus(s.tick - s.cpTick);
        s.bonus += s.lastBonus;
        s.cpTick = s.tick;
      }
      // Absturz
      for (let i = 0; i < nh; i++) {
        const h = s.holes[i] as BoardHole;
        if (Math.hypot(h.x - s.px, h.y - s.py) < HOLE_R - 0.12) {
          s.fallKind = 'hole';
          s.fallX = h.x;
          s.fallY = h.y;
        }
      }
      if (!s.fallKind && Math.hypot(s.px, s.py) > edgeR(s.tick) - 0.05) {
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
    // Nach einem neuen Ziel kurz orientieren (Ungeübte länger) – das Ziel liegt dann noch nicht im Blick
    const look = s.tick - s.cpTick < Math.round(lerp(55, 14, skill));
    const t = look ? { x: s.px - s.vx * 0.4, y: s.py - s.vy * 0.4 } : (s.targets[s.cp] ?? { x: 0, y: 0 });
    // Wunschgeschwindigkeit zum Ziel, dann Wunschbeschleunigung, dann Neigung
    const kp = lerp(1.2, 1.7, skill);
    const vmax = lerp(2.6, 4.4, skill);
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
    // Rand meiden (der Rand bröckelt mit der Zeit)
    const pr = Math.hypot(s.px, s.py);
    const er = edgeR(s.tick);
    if (pr > er - 1.6) {
      const push = (pr - (er - 1.6)) * 2.2;
      wx -= (s.px / pr) * push;
      wy -= (s.py / pr) * push;
    }
    const d0 = disturbance(s, s.tick);
    // Böen: Geübte halten voll dagegen, Ungeübte nur teilweise und verspätet
    const gu = gustAt(s, s.tick - Math.round(lerp(14, 2, skill)));
    const gk = lerp(0.35, 1, skill);
    const d = { x: d0.x + gu.x * gk, y: d0.y + gu.y * gk };
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
    hint:
      s.fallT > 0
        ? 'Abgestürzt! −40'
        : gustAt(s, s.tick).warn
          ? 'Windböe kommt!'
          : s.falls
            ? `${s.falls} Abstürze`
            : undefined,
  }),
};
