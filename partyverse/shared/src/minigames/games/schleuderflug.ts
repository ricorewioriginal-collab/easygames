import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Schleuderflug: Seitenansicht. Spielfeld-Koordinaten: X in [-1.6, 1.6] (rechts), Y in [-1, 1] (oben).
 * Die Schleuder steht links bei (ANCHOR_X, ANCHOR_Y). 30 Sekunden Zeit: so viele Inseln treffen wie möglich.
 * Zeiger: gedrückt halten und von der Schleuder wegziehen (Gegenrichtung = Abschussrichtung), loslassen = Schuss.
 * Tasten/Stick: hoch/runter = Winkel, links/rechts = Stärke, A drücken = Schuss.
 * Immer vier Inseln; getroffene tauchen woanders neu auf. Treffer in Serie geben Bonus, goldene Inseln zählen doppelt.
 * Der Wind dreht alle 6 Sekunden und wird stärker, später schweben die Inseln auch seitlich.
 */
export interface Island {
  id: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  r: number;
  /** Schwebebewegung (Amplitude x/y, Frequenz je Tick, Phase) */
  ax: number;
  ay: number;
  f: number;
  ph: number;
  pts: number;
  /** > 0: golden (doppelte Punkte), Rest-Ticks */
  gold: number;
  /** > 0: getroffen, taucht nach so vielen Ticks neu auf */
  respawn: number;
  /** Alter in Ticks (zum Einblenden) */
  age: number;
}
export interface ShotProj {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
export interface SlingState {
  rnd: Rng;
  tick: number;
  phase: 'aim' | 'fly' | 'wait' | 'over';
  timer: number;
  /** Anzahl abgefeuerter Schüsse */
  shot: number;
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
  nextIsland: number;
  nextGold: number;
  points: number;
  hits: number;
  bulls: number;
  streak: number;
  bestStreak: number;
  /** Ergebnis des letzten Schusses (für die Ansicht) */
  seq: number;
  last: {
    hit: boolean;
    island: number;
    pts: number;
    bull: boolean;
    gold: boolean;
    streak: number;
    x: number;
    y: number;
  };
  launchSeq: number;
  /** Berührung läuft: Insel-ID und bisher kleinster Abstand (Treffer zählt am nächsten Punkt der Flugbahn) */
  cId: number;
  cMin: number;
}

export const X_MAX = 1.6;
export const ANCHOR_X = -0.98;
export const ANCHOR_Y = -0.42;
export const PULL_MAX = 0.6;
export const GRAVITY = 2.5;
export const V_MAX = 3.15;
export const PROJ_R = 0.04;
export const ISLANDS = 4;
export const DURATION = 30;
export const MAX_TICKS = DURATION * 60;
/** Wind wechselt alle so viele Ticks */
export const WIND_PERIOD = 6 * 60;
export const WIND_MAX = 0.75;
const MIN_POW = 0.12;
const DT = 1 / 60;

export const speedOf = (pow: number): number => V_MAX * (0.25 + 0.75 * pow);
/** Position einer Insel zum Zeitpunkt `tick` */
export const islandPos = (i: Island, tick: number): { x: number; y: number } => ({
  x: i.x0 + i.ax * Math.sin(tick * i.f * 0.7 + i.ph * 1.3),
  y: i.y0 + i.ay * Math.sin(tick * i.f + i.ph),
});
/** Serienbonus für den n-ten Treffer in Folge */
export const streakBonus = (n: number): number => 10 * clamp(n - 1, 0, 5);

function spawnIsland(s: SlingState, idx: number): void {
  const r = s.rnd;
  const d = clamp(s.tick / MAX_TICKS, 0, 1);
  let x = 0;
  let y = 0;
  for (let tries = 0; tries < 40; tries++) {
    x = r.float(-0.25, 1.42);
    y = r.float(-0.62, 0.72);
    if (Math.hypot(x - ANCHOR_X, y - ANCHOR_Y) < 0.95) continue;
    if (s.islands.every((o, k) => k === idx || o.respawn > 0 || Math.hypot(o.x0 - x, o.y0 - y) > 0.52)) break;
  }
  const dist = Math.hypot(x - ANCHOR_X, y - ANCHOR_Y);
  const pts = clamp(Math.round(2 + (4 * (dist - 1.0)) / 1.5), 2, 6) * 10;
  const moving = r.chance(lerp(0.25, 0.85, d));
  const isl: Island = {
    id: s.nextIsland++,
    x0: x,
    y0: y,
    x,
    y,
    r: lerp(0.14, 0.1, d) * r.float(0.95, 1.05),
    ax: moving && d > 0.3 ? r.float(0.05, lerp(0.08, 0.22, d)) : 0,
    ay: moving ? r.float(0.03, lerp(0.06, 0.14, d)) : 0,
    f: r.float(0.03, 0.05),
    ph: r.float(0, 6.28),
    pts,
    gold: 0,
    respawn: 0,
    age: 0,
  };
  const p = islandPos(isl, s.tick);
  isl.x = p.x;
  isl.y = p.y;
  s.islands[idx] = isl;
}

function startAim(s: SlingState): void {
  s.phase = 'aim';
  s.aimT = 0;
  s.holdT = 0;
  s.drawn = false;
  s.cId = -1;
}

export const score = (s: SlingState): number => Math.max(0, s.points);

export const game: MiniGame<SlingState> = {
  id: 'schleuderflug',
  name: 'Schleuderflug',
  tagline: 'Schleuder dich auf die Inseln – so oft du kannst!',
  instructions: [
    'Ziehen und loslassen: Finger/Maus von der Schleuder wegziehen. Tasten/Stick: hoch/runter = Winkel, links/rechts = Stärke, A schießt.',
    '30 Sekunden: Jede getroffene Insel taucht woanders neu auf. Ferne Inseln und die Mitte bringen mehr.',
    'Treffer in Serie geben Bonus, goldene Inseln zählen doppelt.',
    'Achte auf den Wind – er dreht alle 6 Sekunden und wird stärker.',
  ],
  controls: {
    desktop: 'Maus ziehen + loslassen, oder Pfeile (Winkel/Stärke) + Leertaste',
    touch: 'Finger von der Schleuder wegziehen und loslassen',
  },
  category: 'aim',
  duration: DURATION,
  usesPointer: true,
  touch: { stick: false, a: false, b: false },
  init(seed) {
    const rnd = new Rng(seed).fork(5);
    const winds: number[] = [];
    for (let i = 0; i <= MAX_TICKS / WIND_PERIOD; i++) {
      const mag = lerp(0.12, WIND_MAX, i / (MAX_TICKS / WIND_PERIOD)) * rnd.float(0.7, 1);
      winds.push(Math.round((rnd.chance(0.5) ? mag : -mag) * 100) / 100);
    }
    const s: SlingState = {
      rnd,
      tick: 0,
      phase: 'aim',
      timer: 0,
      shot: 0,
      ang: 0.75,
      pow: 0.65,
      prevHold: false,
      drawn: false,
      holdT: 0,
      aimT: 0,
      proj: null,
      winds,
      wind: winds[0] as number,
      islands: [],
      nextIsland: 0,
      nextGold: 6 * 60,
      points: 0,
      hits: 0,
      bulls: 0,
      streak: 0,
      bestStreak: 0,
      seq: 0,
      last: { hit: false, island: -1, pts: 0, bull: false, gold: false, streak: 0, x: 0, y: 0 },
      launchSeq: 0,
      cId: -1,
      cMin: 0,
    };
    for (let i = 0; i < ISLANDS; i++) spawnIsland(s, i);
    startAim(s);
    return s;
  },
  step(s, input) {
    if (s.phase === 'over') return;
    s.tick++;
    s.wind = s.winds[Math.floor(s.tick / WIND_PERIOD)] ?? 0;
    const hold = input.a || input.pd;
    // Inseln bewegen, neu erscheinen lassen, Goldinsel
    for (let k = 0; k < s.islands.length; k++) {
      const i = s.islands[k] as Island;
      if (i.respawn > 0) {
        i.respawn--;
        if (i.respawn === 0) spawnIsland(s, k);
        continue;
      }
      i.age++;
      if (i.gold > 0) i.gold--;
      const p = islandPos(i, s.tick);
      i.x = p.x;
      i.y = p.y;
    }
    if (s.tick >= s.nextGold) {
      const cand = s.islands.filter((i) => i.respawn === 0 && i.gold === 0);
      if (cand.length) s.rnd.pick(cand).gold = 4 * 60;
      s.nextGold = s.tick + s.rnd.range(6 * 60, 8 * 60);
    }
    if (s.phase === 'aim') {
      s.aimT++;
      if (input.pd) {
        const vx = ANCHOR_X - clamp(input.px, -1, 1) * X_MAX;
        const vy = ANCHOR_Y - clamp(input.py, -1, 1);
        s.ang = clamp(Math.atan2(vy, Math.max(vx, 1e-4)), 0.05, 1.45);
        s.pow = clamp(Math.hypot(vx, vy) / PULL_MAX, 0, 1);
      } else {
        s.ang = clamp(s.ang + clamp(input.y, -1, 1) * 1.2 * DT, 0.05, 1.45);
        s.pow = clamp(s.pow + clamp(input.x, -1, 1) * 0.8 * DT, 0, 1);
      }
      if (hold && !s.prevHold) {
        s.drawn = true;
        s.holdT = 0;
      }
      if (hold && s.drawn) s.holdT++;
      if (!hold && s.drawn) {
        s.drawn = false;
        if (s.pow >= MIN_POW && s.aimT > 4) {
          const v = speedOf(s.pow);
          s.proj = { x: ANCHOR_X, y: ANCHOR_Y, vx: Math.cos(s.ang) * v, vy: Math.sin(s.ang) * v };
          s.phase = 'fly';
          s.timer = 0;
          s.shot++;
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
      let hit: Island | null = null;
      let bd = Infinity;
      if (s.cId < 0) {
        for (const isl of s.islands) {
          if (isl.respawn > 0 || isl.age < 10) continue;
          const d = Math.hypot(isl.x - p.x, isl.y - p.y);
          if (d < isl.r + PROJ_R && d < bd) {
            bd = d;
            s.cId = isl.id;
            s.cMin = d;
          }
        }
      } else {
        const isl = s.islands.find((i) => i.id === s.cId && i.respawn === 0);
        if (!isl) s.cId = -1;
        else {
          const d = Math.hypot(isl.x - p.x, isl.y - p.y);
          if (d < s.cMin) s.cMin = d;
          else {
            hit = isl;
            bd = s.cMin;
          }
        }
      }
      if (hit) {
        const bull = bd < hit.r * 0.4;
        s.streak++;
        s.bestStreak = Math.max(s.bestStreak, s.streak);
        const gold = hit.gold > 0;
        const pts = (hit.pts + (bull ? 25 : 0)) * (gold ? 2 : 1) + streakBonus(s.streak);
        s.points += pts;
        s.hits++;
        if (bull) s.bulls++;
        s.seq++;
        s.last = { hit: true, island: hit.id, pts, bull, gold, streak: s.streak, x: hit.x, y: hit.y };
        hit.respawn = 40;
        hit.gold = 0;
        s.proj = null;
        s.cId = -1;
        s.phase = 'wait';
        s.timer = 0;
      } else if (p.y < -1.08 || p.x > X_MAX + 0.3 || p.x < -X_MAX - 0.3 || s.timer > 400) {
        s.streak = 0;
        s.seq++;
        s.last = {
          hit: false,
          island: -1,
          pts: 0,
          bull: false,
          gold: false,
          streak: 0,
          x: clamp(p.x, -X_MAX, X_MAX),
          y: clamp(p.y, -1.05, 1),
        };
        s.proj = null;
        s.cId = -1;
        s.phase = 'wait';
        s.timer = 0;
      }
    } else if (s.phase === 'wait') {
      s.timer++;
      if (s.timer >= 14) startAim(s);
    }
    s.prevHold = hold;
    if (s.tick >= MAX_TICKS) s.phase = 'over';
  },
  done: (s) => s.phase === 'over',
  score,
  bot(s, skill, rng): InputFrame {
    if (s.phase !== 'aim') return { ...NEUTRAL_INPUT };
    const react = Math.round(lerp(75, 14, skill));
    if (s.aimT < react) return { ...NEUTRAL_INPUT };
    const draw = Math.round(lerp(22, 9, skill));
    // Ziel wählen: wertvoll (Gold!), aber bei geringem Können lieber nah
    let best: Island | null = null;
    let bv = -Infinity;
    for (const isl of s.islands) {
      if (isl.respawn > 0 || isl.age < 12) continue;
      const d = Math.hypot(isl.x - ANCHOR_X, isl.y - ANCHOR_Y);
      const val = isl.pts * (isl.gold > 40 ? 2 : 1);
      const v = val * (1 - (1 - skill) * 0.45 * d) - (isl.ax + isl.ay) * 60 * (1 - skill);
      if (v > bv) {
        bv = v;
        best = isl;
      }
    }
    if (!best) return { ...NEUTRAL_INPUT };
    const isl = best;
    // Ballistik lösen: Flugzeit n (Ticks) so, dass der Treffpunkt bei n erreicht wird (Wind wird geschätzt)
    const windEst = s.wind * lerp(0.3, 1, skill);
    let bestErr = Infinity;
    let sol = { ang: 0.8, pow: 0.8 };
    const t0 = s.tick + (s.holdT < draw ? draw - s.holdT : 0) + 1;
    for (let n = 10; n <= 240; n++) {
      const t = n * DT;
      const A = DT * DT * ((n * (n + 1)) / 2);
      const tp = islandPos(isl, t0 + n);
      const vx0 = (tp.x - ANCHOR_X - windEst * A) / t;
      const vy0 = (tp.y - ANCHOR_Y + GRAVITY * A) / t;
      const v = Math.hypot(vx0, vy0);
      const a = Math.atan2(vy0, vx0);
      if (vx0 <= 0 || a < 0.06 || a > 1.4) continue;
      const p = (v / V_MAX - 0.25) / 0.75;
      if (p < 0.15 || p > 1) continue;
      const err = Math.abs(p - 0.85);
      if (err < bestErr) {
        bestErr = err;
        sol = { ang: a, pow: p };
      }
    }
    // fester Zielfehler je Schuss (nicht jedes Bild neu gewürfelt)
    const h1 = ((Math.imul(s.shot + 3, 0x9e3779b1) >>> 9) % 2000) / 1000 - 1;
    const h2 = ((Math.imul(s.shot + 11, 0x85ebca6b) >>> 9) % 2000) / 1000 - 1;
    const sigA = lerp(0.13, 0.006, skill);
    const sigP = lerp(0.15, 0.008, skill);
    const ang = clamp(sol.ang + (h1 * 1.2 + rng.gaussian() * 0.2) * sigA, 0.05, 1.45);
    const pow = clamp(sol.pow + (h2 * 1.2 + rng.gaussian() * 0.2) * sigP, 0.15, 1);
    const pull = pow * PULL_MAX;
    const px = (ANCHOR_X - Math.cos(ang) * pull) / X_MAX;
    const py = ANCHOR_Y - Math.sin(ang) * pull;
    const hold = s.holdT < draw;
    return { ...NEUTRAL_INPUT, px: clamp(px, -1, 1), py: clamp(py, -1, 1), pd: hold };
  },
  hud: (s) => {
    const w = s.wind;
    const mag = Math.round((Math.abs(w) / WIND_MAX) * 5);
    const arrows = (w > 0 ? '→' : '←').repeat(clamp(Math.ceil(mag / 2), 1, 3));
    const wind = mag === 0 ? 'Windstill' : `Wind ${arrows} ${mag}`;
    const left = Math.max(0, Math.ceil((MAX_TICKS - s.tick) / 60));
    return {
      left: `${left} s · ${s.hits} Treffer`,
      right: `${score(s)} Pkt`,
      hint: s.streak >= 2 ? `${wind} · Serie ${s.streak}!` : wind,
    };
  },
};
