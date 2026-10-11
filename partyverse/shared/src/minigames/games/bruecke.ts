import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Brückenbauer: A halten = der Brückenstab wächst, loslassen = er kippt um. Er muss genau bis auf den nächsten Turm reichen.
 * Perfekte Mitte gibt Bonus. Zu kurz oder zu lang = Absturz = Ende. 30 Sekunden Gesamtzeit.
 */
export interface Tower {
  l: number;
  r: number;
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
const MAX_LEN = 16;
const TOTAL_TICKS = 30 * 60;

function genTowers(seed: number): Tower[] {
  const r = new Rng((seed ^ 0x4cf5ad43) >>> 0);
  const towers: Tower[] = [{ l: -3, r: 0 }];
  let x = 0;
  for (let i = 1; i < 40; i++) {
    const gap = r.float(2.0, 4.2 + Math.min(3.8, i * 0.4));
    const w = Math.max(1.3, r.float(2.4, 3.4) - i * 0.12);
    const l = x + gap;
    towers.push({ l, r: l + w });
    x = l + w;
  }
  return towers;
}

const hash01 = (i: number): number => ((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 9, 0x85ebca6b)) >>> 8 & 0xffff) / 65536;

export const game: MiniGame<BridgeState> = {
  id: 'bruecke',
  name: 'Brückenbauer',
  tagline: 'Wie lang muss die Brücke sein?',
  instructions: [
    'Halte A: Ein Brückenstab wächst aus dem Turm. Loslassen – und er kippt um.',
    'Er muss genau bis auf den nächsten Turm reichen: nicht zu kurz, nicht zu lang!',
    'Triffst du den roten Punkt in der Mitte, gibt es einen Perfekt-Bonus.',
    'Ein Fehltritt bedeutet Absturz und Ende. Du hast 30 Sekunden.',
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
      s.len = Math.min(MAX_LEN, s.len + GROW);
      if (!held || s.len >= MAX_LEN) {
        s.phase = 'fall';
        s.timer = 0;
      }
    } else if (s.phase === 'fall') {
      if (s.timer >= FALL_TICKS) {
        const next = s.towers[s.idx + 1] as Tower;
        const reach = cur.r + s.len;
        s.ok = reach >= next.l && reach <= next.r;
        s.results++;
        if (s.ok) {
          s.built++;
          if (Math.abs(reach - (next.l + next.r) / 2) <= PERFECT_TOL) {
            s.perfects++;
            s.pstreak++;
            s.bonus += 10 + 5 * Math.min(s.pstreak - 1, 4);
            s.last = 2;
          } else {
            s.pstreak = 0;
            s.last = 1;
          }
          s.target = next.r - STAND;
        } else {
          s.pstreak = 0;
          s.last = 3;
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
      s.heroY -= 0.04 + s.timer * 0.012;
      if (s.timer >= 40) s.over = true;
    }
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => s.built * 10 + s.bonus,
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
      const noise = (hash01(s.idx * 5 + Math.floor(next.l * 10)) - 0.5) * 2 * err * 1.5;
      const want = clamp((next.l + next.r) / 2 - cur.r + noise, 0.3, MAX_LEN);
      return { ...NEUTRAL_INPUT, a: s.len < want };
    }
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => ({
    left: `${s.built} Türme`,
    right: `${s.built * 10 + s.bonus} Pkt`,
    hint: s.last === 2 && s.phase === 'walk' ? 'Perfekt!' : s.last === 3 && s.phase !== 'idle' ? 'Zu kurz oder zu lang!' : undefined,
  }),
};
