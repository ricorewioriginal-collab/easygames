import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Brückenbauer: A halten = der Brückenstab wächst, loslassen = er kippt um. Er muss genau bis auf den nächsten Turm reichen.
 * Perfekte Mitte gibt Bonus (in Serie mehr). Ein Absturz kostet Zeit und 5 Punkte, danach geht es vom Turm weiter.
 * Mit jedem Turm wächst der Stab schneller und die Türme werden schmaler; ab Turm 6 wandern Türme hin und her,
 * jeder fünfte Turm ist golden (schmal, 25 Punkte). 30 Sekunden Gesamtzeit.
 */
export interface Tower {
  l: number;
  r: number;
  /** Wandern: Amplitude (0 = steht still), Kreisfrequenz (rad/s), Phase */
  m: number;
  w: number;
  ph: number;
  gold: boolean;
}
export type BridgePhase = 'idle' | 'grow' | 'fall' | 'walk' | 'drop';
export interface BridgeState {
  towers: Tower[];
  t: number;
  phase: BridgePhase;
  /** Ticks in der aktuellen Phase */
  timer: number;
  idx: number;
  len: number;
  heroX: number;
  heroY: number;
  target: number;
  ok: boolean;
  built: number;
  perfects: number;
  pstreak: number;
  bonus: number;
  /** Punkte für gebaute Türme (golden zählt mehr) */
  towerPts: number;
  falls: number;
  /** Punkte der letzten Brücke (für die Ansicht) */
  lastPts: number;
  /** Ergebnis der letzten Brücke: 0 keins, 1 gut, 2 perfekt, 3 Fehler (für die Ansicht) */
  last: 0 | 1 | 2 | 3;
  /** Zähler für Ansicht-Ereignisse */
  results: number;
  over: boolean;
}

export const GROW = 0.11;
export const FALL_TICKS = 14;
export const WALK = 0.2;
export const PERFECT_TOL = 0.4;
export const STAND = 0.45;
export const DROP_TICKS = 50;
export const FALL_PENALTY = 5;
export const TOWER_PTS = 10;
export const GOLD_PTS = 25;
/** Ab diesem Turm wandern Türme */
export const MOVE_FROM = 6;
const MAX_LEN = 16;
export const TOTAL_TICKS = 30 * 60;

/** Wachstum des Stabs je Tick vor dem Turm mit Index idx */
export const growRate = (idx: number): number => GROW * (1 + Math.min(0.6, idx * 0.045));
/** Verschiebung eines wandernden Turms zum Zeitpunkt t (Ticks) */
export const towerOff = (tw: Tower, t: number): number =>
  tw.m ? tw.m * Math.sin(tw.w * (t / 60) + tw.ph) : 0;
/** Linke/rechte Kante eines Turms zum Zeitpunkt t */
export const towerAt = (tw: Tower, t: number): { l: number; r: number } => {
  const o = towerOff(tw, t);
  return { l: tw.l + o, r: tw.r + o };
};

function genTowers(seed: number): Tower[] {
  const r = new Rng((seed ^ 0x4cf5ad43) >>> 0);
  const towers: Tower[] = [{ l: -3, r: 0, m: 0, w: 0, ph: 0, gold: false }];
  let x = 0;
  let lastAmp = 0;
  for (let i = 1; i < 40; i++) {
    const gap = r.float(2.0, 4.2 + Math.min(3.8, i * 0.4));
    const gold = i % 5 === 0;
    const w = Math.max(1.2, r.float(2.4, 3.4) - i * 0.12) * (gold ? 0.72 : 1);
    const moving = i >= MOVE_FROM && r.chance(Math.min(0.85, 0.45 + (i - MOVE_FROM) * 0.06));
    // so weit wandern, dass sich die Türme nie berühren
    const amp = moving
      ? Math.min(lerp(0.5, 1.3, Math.min(1, (i - MOVE_FROM) / 10)), (gap - 0.9 - lastAmp) * 0.8)
      : 0;
    const l = x + gap;
    towers.push({
      l,
      r: l + w,
      m: Math.max(0, amp),
      w: moving ? r.float(1.2, 2.1) : 0,
      ph: r.float(0, Math.PI * 2),
      gold,
    });
    lastAmp = Math.max(0, amp);
    x = l + w;
  }
  return towers;
}

const hash01 = (i: number): number =>
  (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 9, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;

/** Wandernden Turm an der aktuellen Stelle festhalten (sobald man ihn erreicht hat) */
function freeze(tw: Tower, t: number): void {
  const o = towerOff(tw, t);
  tw.l += o;
  tw.r += o;
  tw.m = 0;
}

export const game: MiniGame<BridgeState> = {
  id: 'bruecke',
  name: 'Brückenbauer',
  tagline: 'Halten, loslassen, rüber – so viele Türme wie möglich!',
  instructions: [
    'Halte A: Ein Brückenstab wächst aus dem Turm. Loslassen – er kippt um und muss auf dem nächsten Turm landen.',
    'Roter Punkt in der Mitte = Perfekt-Bonus, in Serie immer mehr. Goldene Türme bringen 25 statt 10 Punkte.',
    'Der Stab wächst mit jedem Turm schneller, ab Turm 6 wandern Türme. Absturz: −5 Punkte und Zeitverlust.',
  ],
  controls: { desktop: 'Leertaste oder Maustaste gedrückt halten', touch: 'Knopf A gedrückt halten' },
  category: 'platform',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const towers = genTowers(seed);
    return {
      towers,
      t: 0,
      phase: 'idle',
      timer: 0,
      idx: 0,
      len: 0,
      heroX: (towers[0] as Tower).r - STAND,
      heroY: 0,
      target: 0,
      ok: false,
      built: 0,
      perfects: 0,
      pstreak: 0,
      bonus: 0,
      towerPts: 0,
      falls: 0,
      lastPts: 0,
      last: 0,
      results: 0,
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.t++;
    s.timer++;
    const held = !!(input.a || input.pd);
    const cur = s.towers[s.idx] as Tower;
    if (s.phase === 'idle') {
      s.heroX = cur.r - STAND;
      if (held && s.timer >= 6) {
        s.phase = 'grow';
        s.timer = 0;
        s.len = 0;
      }
    } else if (s.phase === 'grow') {
      s.len = Math.min(MAX_LEN, s.len + growRate(s.idx));
      if (!held || s.len >= MAX_LEN) {
        s.phase = 'fall';
        s.timer = 0;
      }
    } else if (s.phase === 'fall') {
      if (s.timer >= FALL_TICKS) {
        const next = s.towers[s.idx + 1] as Tower;
        const nx = towerAt(next, s.t);
        const reach = cur.r + s.len;
        s.ok = reach >= nx.l && reach <= nx.r;
        s.results++;
        if (s.ok) {
          freeze(next, s.t);
          s.built++;
          const base = next.gold ? GOLD_PTS : TOWER_PTS;
          s.towerPts += base;
          s.lastPts = base;
          if (Math.abs(reach - (next.l + next.r) / 2) <= PERFECT_TOL) {
            s.perfects++;
            s.pstreak++;
            const b = 10 + 5 * Math.min(s.pstreak - 1, 4);
            s.bonus += b;
            s.lastPts += b;
            s.last = 2;
          } else {
            s.pstreak = 0;
            s.last = 1;
          }
          s.target = next.r - STAND;
        } else {
          s.pstreak = 0;
          s.last = 3;
          s.lastPts = 0;
          s.target = reach;
        }
        s.phase = 'walk';
        s.timer = 0;
      }
    } else if (s.phase === 'walk') {
      s.heroX = Math.min(s.target, s.heroX + WALK);
      if (s.heroX >= s.target) {
        if (s.ok) {
          s.idx++;
          s.phase = 'idle';
          s.timer = 0;
          s.len = 0;
          if (s.idx >= s.towers.length - 1) s.over = true;
        } else {
          s.phase = 'drop';
          s.timer = 0;
        }
      }
    } else {
      // Absturz: fallen, dann auf dem letzten Turm neu anfangen
      s.heroY -= 0.04 + s.timer * 0.012;
      if (s.timer >= DROP_TICKS) {
        s.falls++;
        s.phase = 'idle';
        s.timer = 0;
        s.len = 0;
        s.heroY = 0;
        s.heroX = cur.r - STAND;
      }
    }
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => Math.max(0, s.towerPts + s.bonus - FALL_PENALTY * s.falls),
  bot(s, skill): InputFrame {
    if (s.over) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    const cur = s.towers[s.idx] as Tower;
    const next = s.towers[s.idx + 1] as Tower;
    if (s.phase === 'idle') {
      const delay = lerp(26, 6, skill) + hash01(s.idx + 40) * err * 20;
      return { ...NEUTRAL_INPUT, a: s.timer >= delay };
    }
    if (s.phase === 'grow') {
      const noise = (hash01(s.idx * 5 + Math.floor(next.l * 10) + s.falls * 7) - 0.5) * 2 * err * 1.5;
      // Wandernde Türme: Stelle vorhersagen, an der der Stab aufschlägt (schwache Bots nur teilweise)
      const g = growRate(s.idx);
      const predict = clamp((skill - 0.25) / 0.6, 0, 1);
      let want = clamp((next.l + next.r) / 2 - cur.r, 0.3, MAX_LEN);
      for (let it = 0; it < 3; it++) {
        const tEnd = s.t + Math.max(0, (want - s.len) / g) + FALL_TICKS;
        const live = towerOff(next, s.t);
        const mid = (next.l + next.r) / 2 + live + (towerOff(next, tEnd) - live) * predict;
        want = clamp(mid - cur.r + noise, 0.3, MAX_LEN);
      }
      return { ...NEUTRAL_INPUT, a: s.len < want };
    }
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => {
    const next = s.towers[s.idx + 1];
    return {
      left: `${s.built} Türme`,
      right: `${game.score(s)} Pkt`,
      hint:
        s.last === 2 && s.phase === 'walk'
          ? s.pstreak > 1
            ? `Perfekt! Serie ${s.pstreak}`
            : 'Perfekt!'
          : s.last === 3 && (s.phase === 'walk' || s.phase === 'drop')
            ? `Absturz! −${FALL_PENALTY}`
            : s.phase === 'idle' && next?.gold
              ? 'Goldener Turm: 25 Punkte!'
              : s.phase === 'idle' && next?.m
                ? 'Der Turm wandert!'
                : undefined,
    };
  },
};
