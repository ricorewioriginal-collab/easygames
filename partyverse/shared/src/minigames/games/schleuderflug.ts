import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Schleuderflug: Seitenansicht. Spielfeld-Koordinaten: X in [-1.6, 1.6] (rechts), Y in [-1, 1] (oben).
 * Die Schleuder steht links bei (ANCHOR_X, ANCHOR_Y). Zeiger: bei gedrückter Taste ziehen (Gegenrichtung = Abschussrichtung), loslassen = Schuss.
 * Tastatur: y stellt den Winkel, x die Stärke; A gedrückt halten (spannen) und loslassen (schießen).
 */
export interface Island {
  x: number;
  y0: number;
  y: number;
  r: number;
  bobA: number;
  bobF: number;
  ph: number;
  pts: number;
  hit: boolean;
}
export interface ShotProj {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
export interface SlingState {
  tick: number;
  phase: 'aim' | 'fly' | 'wait' | 'over';
  timer: number;
  shot: number; // 0-basierter Index des aktuellen Schusses
  shots: number;
  ang: number;
  pow: number;
  prevHold: boolean;
  drawn: boolean;
  holdT: number;
  aimT: number;
  proj: ShotProj | null;
  winds: number[];
  wind: number;
  islands: Island[];
  points: number;
  hits: number;
  bulls: number;
  /** Ergebnis des letzten Schusses (für die Ansicht) */
  seq: number;
  last: { hit: boolean; island: number; pts: number; bull: boolean; x: number; y: number };
  launchSeq: number;
  /** Berührung läuft: Insel-Index und bisher kleinster Abstand (Treffer zählt am nächsten Punkt der Flugbahn) */
  cIdx: number;
  cMin: number;
}

export const X_MAX = 1.6;
export const ANCHOR_X = -0.95;
export const ANCHOR_Y = -0.28;
export const PULL_MAX = 0.62;
export const GRAVITY = 1.6;
export const V_MAX = 2.45;
export const SHOTS = 6;
export const PROJ_R = 0.035;
const MAX_TICKS = 35 * 60;
const MIN_POW = 0.12;
const DT = 1 / 60;

export const speedOf = (pow: number): number => V_MAX * (0.25 + 0.75 * pow);
export const islandY = (i: Island, tick: number): number =>
  i.bobA ? i.y0 + i.bobA * Math.sin(tick * i.bobF + i.ph) : i.y0;

function startAim(s: SlingState): void {
  s.phase = 'aim';
  s.aimT = 0;
  s.holdT = 0;
  s.drawn = false;
  s.cIdx = -1;
  s.wind = s.winds[s.shot] ?? 0;
}

export const score = (s: SlingState): number => Math.max(0, s.points);

export const game: MiniGame<SlingState> = {
  id: 'schleuderflug',
  name: 'Schleuderflug',
  tagline: 'Zieh, ziel und triff die fernen Inseln!',
  instructions: [
    'Zeiger gedrückt halten und von der Schleuder wegziehen: Richtung und Stärke einstellen, loslassen schießt. Tastatur: Pfeile stellen Winkel/Stärke ein, Leertaste halten und loslassen.',
    'Der Wind schiebt dein Geschoss – schau auf die Fahne und die Windanzeige.',
    'Ferne Inseln bringen mehr Punkte, ein Treffer in die Mitte der Scheibe gibt Bonus.',
    'Du hast sechs Schüsse.',
  ],
  controls: {
    desktop: 'Maus ziehen und loslassen, oder Pfeile + Leertaste halten/loslassen',
    touch: 'Finger ziehen und loslassen',
  },
  category: 'aim',
  duration: 35,
  usesPointer: true,
  touch: { stick: false, a: false, b: false },
  init(seed) {
    const r = new Rng(seed).fork(5);
    const winds: number[] = [];
    for (let i = 0; i < SHOTS; i++) winds.push(Math.round(r.float(-0.42, 0.42) * 100) / 100);
    // Inseln: gestaffelt von nah bis fern, gemischte Höhen
    const islands: Island[] = [];
    const slots = r.shuffle([0, 1, 2, 3, 4, 5]);
    for (let k = 0; k < SHOTS; k++) {
      const slot = slots[k] as number;
      const x = lerp(0.15, 1.42, slot / (SHOTS - 1)) + r.float(-0.04, 0.04);
      let y = r.float(-0.42, 0.5);
      for (let tries = 0; tries < 40 && islands.some((o) => Math.hypot(o.x - x, o.y0 - y) < 0.5); tries++)
        y = r.float(-0.42, 0.5);
      const d = Math.hypot(x - ANCHOR_X, y - ANCHOR_Y);
      const pts = clamp(Math.round(2 + (4 * (d - 1.05)) / 1.3), 2, 6) * 10;
      islands.push({
        x,
        y0: y,
        y,
        r: 0.13,
        bobA: r.chance(0.35) ? r.float(0.03, 0.07) : 0,
        bobF: r.float(0.03, 0.05),
        ph: r.float(0, 6.28),
        pts,
        hit: false,
      });
    }
    const s: SlingState = {
      tick: 0,
      phase: 'aim',
      timer: 0,
      shot: 0,
      shots: SHOTS,
      ang: 0.8,
      pow: 0.6,
      prevHold: false,
      drawn: false,
      holdT: 0,
      aimT: 0,
      proj: null,
      winds,
      wind: 0,
      islands,
      points: 0,
      hits: 0,
      bulls: 0,
      seq: 0,
      last: { hit: false, island: -1, pts: 0, bull: false, x: 0, y: 0 },
      launchSeq: 0,
      cIdx: -1,
      cMin: 0,
    };
    startAim(s);
    return s;
  },
  step(s, input) {
    if (s.phase === 'over') return;
    s.tick++;
    const hold = input.a || input.pd;
    for (const i of s.islands) i.y = islandY(i, s.tick);
    if (s.phase === 'aim') {
      s.aimT++;
      // Zielen
      if (input.pd) {
        const vx = ANCHOR_X - clamp(input.px, -1, 1) * X_MAX;
        const vy = ANCHOR_Y - clamp(input.py, -1, 1);
        s.ang = clamp(Math.atan2(vy, Math.max(vx, 1e-4)), 0.1, 1.45);
        s.pow = clamp(Math.hypot(vx, vy) / PULL_MAX, 0, 1);
      } else {
        s.ang = clamp(s.ang + clamp(input.y, -1, 1) * 0.9 * DT, 0.1, 1.45);
        s.pow = clamp(s.pow + clamp(input.x, -1, 1) * 0.55 * DT, 0, 1);
      }
      if (hold && !s.prevHold) {
        s.drawn = true;
        s.holdT = 0;
      }
      if (hold && s.drawn) s.holdT++;
      if (!hold && s.drawn) {
        s.drawn = false;
        if (s.pow >= MIN_POW && s.aimT > 6) {
          const v = speedOf(s.pow);
          s.proj = { x: ANCHOR_X, y: ANCHOR_Y, vx: Math.cos(s.ang) * v, vy: Math.sin(s.ang) * v };
          s.phase = 'fly';
          s.timer = 0;
          s.launchSeq++;
        }
      }
    } else if (s.phase === 'fly' && s.proj) {
      const p = s.proj;
      s.timer++;
      p.vy -= GRAVITY * DT;
      p.vx += s.wind * DT;
      p.x += p.vx * DT;
      p.y += p.vy * DT;
      let hitIdx = -1;
      let bd = Infinity;
      if (s.cIdx < 0) {
        for (let i = 0; i < s.islands.length; i++) {
          const isl = s.islands[i] as Island;
          if (isl.hit) continue;
          const d = Math.hypot(isl.x - p.x, isl.y - p.y);
          if (d < isl.r + PROJ_R && d < bd) {
            bd = d;
            s.cIdx = i;
            s.cMin = d;
          }
        }
      } else {
        const isl = s.islands[s.cIdx] as Island;
        const d = Math.hypot(isl.x - p.x, isl.y - p.y);
        if (d < s.cMin) s.cMin = d;
        else {
          hitIdx = s.cIdx;
          bd = s.cMin;
        }
      }
      if (hitIdx >= 0) {
        const isl = s.islands[hitIdx] as Island;
        isl.hit = true;
        const bull = bd < isl.r * 0.38;
        const pts = isl.pts + (bull ? 25 : 0);
        s.points += pts;
        s.hits++;
        if (bull) s.bulls++;
        s.seq++;
        s.last = { hit: true, island: hitIdx, pts, bull, x: isl.x, y: isl.y };
        s.proj = null;
        s.cIdx = -1;
        s.phase = 'wait';
        s.timer = 0;
      } else if (p.y < -1.08 || p.x > X_MAX + 0.3 || p.x < -X_MAX - 0.3 || s.timer > 600) {
        s.seq++;
        s.last = {
          hit: false,
          island: -1,
          pts: 0,
          bull: false,
          x: clamp(p.x, -X_MAX, X_MAX),
          y: clamp(p.y, -1.05, 1),
        };
        s.proj = null;
        s.phase = 'wait';
        s.timer = 0;
      }
    } else if (s.phase === 'wait') {
      s.timer++;
      if (s.timer >= 55) {
        s.shot++;
        if (s.shot >= s.shots) s.phase = 'over';
        else startAim(s);
      }
    }
    s.prevHold = hold;
    if (s.tick >= MAX_TICKS) s.phase = 'over';
  },
  done: (s) => s.phase === 'over',
  score,
  bot(s, skill, rng): InputFrame {
    if (s.phase !== 'aim') return { ...NEUTRAL_INPUT };
    const react = Math.round(lerp(75, 34, skill));
    if (s.aimT < react) return { ...NEUTRAL_INPUT };
    const draw = Math.round(lerp(26, 14, skill));
    // Ziel wählen: wertvoll, aber bei geringem Können lieber nah
    let best = -1;
    let bv = -Infinity;
    for (let i = 0; i < s.islands.length; i++) {
      const isl = s.islands[i] as Island;
      if (isl.hit) continue;
      const d = Math.hypot(isl.x - ANCHOR_X, isl.y - ANCHOR_Y);
      const v = isl.pts * (1 - (1 - skill) * 0.55 * d) + (i === 0 ? 0.01 : 0);
      if (v > bv) {
        bv = v;
        best = i;
      }
    }
    const isl = s.islands[best] as Island;
    // Ballistik lösen: Flugzeit n (Ticks) so, dass der Treffpunkt bei n erreicht wird
    let bestN = -1;
    let bestErr = Infinity;
    let sol = { ang: 0.8, pow: 0.7 };
    for (let n = 14; n <= 330; n++) {
      const t = n * DT;
      const A = DT * DT * ((n * (n + 1)) / 2);
      const tx = isl.x;
      const ty = isl.bobA ? isl.y0 + isl.bobA * Math.sin((s.tick + n) * isl.bobF + isl.ph) : isl.y0;
      const vx0 = (tx - ANCHOR_X - s.wind * A) / t;
      const vy0 = (ty - ANCHOR_Y + GRAVITY * A) / t;
      const v = Math.hypot(vx0, vy0);
      const a = Math.atan2(vy0, vx0);
      if (vx0 <= 0 || a < 0.12 || a > 1.4) continue;
      const p = (v / V_MAX - 0.25) / 0.75;
      if (p < 0.15 || p > 1) continue;
      // bevorzuge flache, kräftige Flugbahn (weniger windanfällig): Leistung nahe 0.85
      const err = Math.abs(p - 0.85);
      if (err < bestErr) {
        bestErr = err;
        bestN = n;
        sol = { ang: a, pow: p };
      }
    }
    if (bestN < 0) sol = { ang: 0.8, pow: 0.8 };
    const sigA = lerp(0.075, 0.006, skill);
    const sigP = lerp(0.1, 0.008, skill);
    const ang = clamp(sol.ang + rng.gaussian() * sigA, 0.1, 1.45);
    const pow = clamp(sol.pow + rng.gaussian() * sigP, 0.15, 1);
    const pull = pow * PULL_MAX;
    const px = (ANCHOR_X - Math.cos(ang) * pull) / X_MAX;
    const py = ANCHOR_Y - Math.sin(ang) * pull;
    const hold = s.holdT < draw;
    return { ...NEUTRAL_INPUT, px: clamp(px, -1, 1), py: clamp(py, -1, 1), pd: hold };
  },
  hud: (s) => {
    const w = s.wind;
    const mag = Math.round((Math.abs(w) / 0.42) * 4);
    const wind =
      mag === 0
        ? 'Windstill'
        : `Wind ${w > 0 ? '→'.repeat(Math.min(3, Math.ceil(mag / 1.4))) : '←'.repeat(Math.min(3, Math.ceil(mag / 1.4)))} ${mag}`;
    return {
      left: `Schuss ${Math.min(s.shot + 1, s.shots)}/${s.shots}`,
      right: `${score(s)} Pkt`,
      hint: wind,
    };
  },
};
