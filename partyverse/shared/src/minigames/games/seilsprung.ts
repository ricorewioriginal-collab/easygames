import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';

/**
 * Seilspringen: Das Seil schwingt in Umläufen unterschiedlicher Dauer (Tempo/Rhythmus aus dem Seed).
 * Jeder Umlauf: erst `hold` Ticks Stillstand oben (Täuschung!), dann n Umdrehungen zu je p Ticks.
 * Bei jedem Durchgang unten muss die Figur in der Luft sein. Goldene Doppel-Umläufe (n = 2) schafft nur
 * ein hoher Sprung (A gedrückt halten). Serie -> Multiplikator, drei Stolperer -> raus.
 */
export interface Turn {
  /** Ticks für eine Umdrehung */
  p: number;
  /** Umdrehungen in diesem Umlauf (2 = goldener Doppelschwung) */
  n: 1 | 2;
  /** Ticks Stillstand oben vor dem Schwung */
  hold: number;
}

export interface RopeState {
  turns: Turn[];
  turn: number;
  /** Tick innerhalb des aktuellen Umlaufs */
  u: number;
  /** Index des nächsten noch offenen Durchgangs im aktuellen Umlauf */
  cross: number;
  t: number;
  y: number;
  vy: number;
  /** Ticks, die der laufende Sprung schon mit gehaltenem A verlängert wurde */
  boost: number;
  /** Laufender Sprung ist ein hoher Sprung */
  high: boolean;
  jumpBuf: number;
  prevA: boolean;
  stumble: number;
  invuln: number;
  hits: number;
  streak: number;
  bestStreak: number;
  clears: number;
  /** geschaffte goldene Durchgänge */
  golds: number;
  points: number;
  /** zuletzt vergebene Punkte (für die Ansicht) */
  lastGain: number;
  jumps: number;
  over: boolean;
}

const TOTAL_TICKS = 30 * 60;
const DT = 1 / 60;
const JUMP_V = 6.8;
const GRAV = 32;
/** Schwerkraft beim Steigen mit gehaltenem A */
const GRAV_HOLD = 14;
const BOOST_MAX = 30;
export const CLEAR_H = 0.32;
const WINDOW = 3;
const STUMBLE_TICKS = 42;
export const MAX_HITS = 3;

export const multiplier = (streak: number): number =>
  1 + Math.min(4, Math.floor(Math.max(0, streak - 1) / 3));
export const turnLen = (tr: Turn): number => tr.hold + tr.p * tr.n;
/** Tick des k-ten Durchgangs (unten) im Umlauf */
export const crossTick = (tr: Turn, k: number): number => tr.hold + Math.floor(tr.p / 2) + k * tr.p;
const DEFAULT_TURN: Turn = { p: 96, n: 1, hold: 0 };
export const currentTurn = (s: RopeState): Turn => s.turns[s.turn] ?? DEFAULT_TURN;

function genTurns(seed: number): Turn[] {
  const r = new Rng((seed ^ 0x7f4a7c15) >>> 0);
  const turns: Turn[] = [];
  let total = 0;
  const add = (p: number, n: 1 | 2 = 1, hold = 0) => {
    turns.push({ p, n, hold });
    total += hold + p * n;
  };
  for (let i = 0; i < 4; i++) add(96);
  const steady = [92, 84, 78, 72, 66, 60, 56, 52, 48];
  let golds = 0;
  let fakes = 0;
  while (total < TOTAL_TICKS + 240) {
    const diff = Math.min(1, total / TOTAL_TICKS);
    let style = r.next();
    // Jede Runde bekommt mindestens eine Täuschung und einen goldenen Schwung
    if (diff > 0.6 && golds === 0) style = 0;
    else if (diff > 0.4 && fakes === 0) style = 0.3;
    if (diff > 0.28 && style < 0.12 + diff * 0.14) {
      golds++;
      // Goldener Doppelschwung: kurz anhalten (Ankündigung), dann zweimal schnell durch
      add(Math.max(56, 76 - Math.floor(diff * 16)));
      add(28 - Math.floor(diff * 4), 2, 14);
      add(r.pick([84, 78, 72]));
    } else if (diff > 0.12 && style < 0.36) {
      // Täuschung: das Seil bleibt oben stehen, dann geht es weiter
      fakes++;
      add(r.pick([72, 66, 60]));
      add(r.pick([60, 56, 52]), 1, r.range(16, 30 + Math.floor(diff * 14)));
    } else if (style < 0.66) {
      const n = r.range(3, 5);
      const lo = Math.floor(diff * 5);
      const hi = Math.min(steady.length - 1, 2 + Math.floor(diff * 6));
      const p = steady[r.range(Math.min(lo, hi), hi)] as number;
      for (let k = 0; k < n; k++) add(p);
    } else if (style < 0.86) {
      const longP = r.pick([92, 84, 78]);
      const shortP = r.pick([52, 48, 46]);
      for (let k = 0; k < r.range(2, 3); k++) {
        add(longP);
        add(shortP);
      }
    } else {
      const fast = 48 - (diff > 0.5 ? 2 : 0);
      const n = r.range(2, 4);
      for (let k = 0; k < n; k++) add(fast);
      add(90);
    }
  }
  return turns;
}

const hash01 = (i: number): number =>
  (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 5, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;

/** Nächster offener Durchgang: Ticks bis dahin, Umlauf-Index und ob er golden ist */
export function nextCrossing(s: RopeState): { tc: number; turn: number; k: number; gold: boolean } {
  const tr = currentTurn(s);
  if (s.cross < tr.n) return { tc: crossTick(tr, s.cross) - s.u, turn: s.turn, k: s.cross, gold: tr.n === 2 };
  const nx = s.turns[s.turn + 1] ?? DEFAULT_TURN;
  return { tc: turnLen(tr) - s.u + crossTick(nx, 0), turn: s.turn + 1, k: 0, gold: nx.n === 2 };
}

export const game: MiniGame<RopeState> = {
  id: 'seilsprung',
  name: 'Seilsprung',
  tagline: 'Spring im Takt – und lass dich nicht austricksen!',
  instructions: [
    'Drücke A, wenn das Seil unten durchkommt. Schau aufs Seil, nicht auf den Takt!',
    'Bleibt das Seil oben stehen, ist das eine Täuschung – warte, bis es wirklich kommt.',
    'Leuchtet es golden, schwingt es zweimal: A gedrückt HALTEN für einen hohen Sprung.',
    'Serien bringen bis ×5 Punkte. Nach drei Stolperern bist du raus.',
  ],
  controls: {
    desktop: 'Leertaste/Enter = springen, gedrückt halten = hoher Sprung',
    touch: 'Knopf A antippen = springen, halten = hoher Sprung',
  },
  category: 'platform',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    return {
      turns: genTurns(seed),
      turn: 0,
      u: 0,
      cross: 0,
      t: 0,
      y: 0,
      vy: 0,
      boost: 0,
      high: false,
      jumpBuf: 0,
      prevA: false,
      stumble: 0,
      invuln: 0,
      hits: 0,
      streak: 0,
      bestStreak: 0,
      clears: 0,
      golds: 0,
      points: 0,
      lastGain: 0,
      jumps: 0,
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.t++;
    const held = !!input.a;
    const press = held && !s.prevA;
    s.prevA = held;
    if (press) s.jumpBuf = 6;
    else if (s.jumpBuf > 0) s.jumpBuf--;
    if (s.stumble > 0) s.stumble--;
    if (s.invuln > 0) s.invuln--;
    // Springen
    if (s.y <= 0 && s.vy <= 0 && s.jumpBuf > 0 && s.stumble <= 0) {
      s.vy = JUMP_V;
      s.y = 0.0001;
      s.jumpBuf = 0;
      s.boost = 0;
      s.high = false;
      s.jumps++;
    }
    if (s.y > 0 || s.vy > 0) {
      // Gehaltenes A beim Steigen: geringere Schwerkraft -> hoher, langer Sprung
      const boosting = held && s.vy > 0 && s.boost < BOOST_MAX;
      if (boosting) {
        s.boost++;
        if (s.boost > 8) s.high = true;
      }
      s.vy -= (boosting ? GRAV_HOLD : GRAV) * DT;
      s.y += s.vy * DT;
      if (s.y <= 0) {
        s.y = 0;
        s.vy = 0;
      }
    }
    // Seil
    s.u++;
    if (s.u >= turnLen(currentTurn(s))) {
      s.turn++;
      s.u = 0;
      s.cross = 0;
    }
    const tr = currentTurn(s);
    if (s.cross < tr.n) {
      const c = crossTick(tr, s.cross);
      if (s.u >= c - WINDOW && s.u <= c + WINDOW) {
        if (s.invuln <= 0 && s.y < CLEAR_H) {
          s.cross++;
          s.hits++;
          s.streak = 0;
          s.stumble = STUMBLE_TICKS;
          s.invuln = STUMBLE_TICKS + 6;
          s.vy = Math.min(0, s.vy);
          if (s.hits >= MAX_HITS) s.over = true;
        } else if (s.u === c + WINDOW) {
          s.cross++;
          if (s.invuln <= 0) {
            s.streak++;
            s.bestStreak = Math.max(s.bestStreak, s.streak);
            s.clears++;
            const gold = tr.n === 2;
            if (gold) s.golds++;
            s.lastGain = (gold ? 25 : 10) * multiplier(s.streak);
            s.points += s.lastGain;
          }
        }
      }
    }
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => s.points,
  bot(s, skill): InputFrame {
    if (s.over || s.stumble > 0) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    const nc = nextCrossing(s);
    const sig = (s.turns[9]?.p ?? 0) * 7 + (s.turns[13]?.p ?? 0) * 13 + (s.turns[21]?.p ?? 0) * 31;
    const h = hash01(nc.turn * 17 + nc.k * 5 + sig);
    // In der Luft: beim goldenen Schwung A halten (schwache Bots vergessen es manchmal)
    if (s.y > 0) {
      const wantHigh = nc.gold && hash01(nc.turn * 29 + sig) < 0.35 + skill * 0.65;
      return { ...NEUTRAL_INPUT, a: s.prevA && wantHigh && s.vy > 0 };
    }
    if (s.prevA) return { ...NEUTRAL_INPUT };
    // Für den zweiten goldenen Durchgang nicht neu springen (der hohe Sprung muss beide abdecken)
    if (nc.gold && nc.k === 1) return { ...NEUTRAL_INPUT };
    const apex = (JUMP_V / GRAV) * 60;
    const lead = nc.gold ? 11 : apex;
    const jit = (h - 0.5) * 2 * err * 13 - err * 3;
    return { ...NEUTRAL_INPUT, a: nc.tc <= lead + jit && nc.tc > 0 };
  },
  hud: (s) => ({
    left: `${s.points} Pkt · ×${multiplier(s.streak)}`,
    right: `${'♥'.repeat(Math.max(0, MAX_HITS - s.hits))}${'♡'.repeat(Math.min(MAX_HITS, s.hits))}`,
    hint: s.over
      ? s.hits >= MAX_HITS
        ? 'Raus!'
        : 'Geschafft!'
      : s.stumble > 0
        ? 'Hoppla!'
        : currentTurn(s).n === 2 || nextCrossing(s).gold
          ? 'GOLD – A halten!'
          : s.u < currentTurn(s).hold
            ? 'Täuschung – warten!'
            : s.streak >= 4
              ? `Serie ${s.streak}`
              : undefined,
  }),
};

/** Seilwinkel 0..2π je Umdrehung (0 = oben, π = unten) für die Ansicht */
export function ropeAngle(s: RopeState): number {
  const tr = currentTurn(s);
  if (s.u < tr.hold) return 0;
  return (((s.u - tr.hold) % tr.p) / tr.p) * Math.PI * 2;
}
