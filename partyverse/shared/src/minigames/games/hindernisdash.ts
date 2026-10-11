import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Hindernis-Dash: Dreispur-Läufer. Links/rechts (Flanke) = Spur wechseln, hoch = springen, runter = rutschen.
 * Niedrige Hürden überspringt man, hohe Balken unterrutscht man, Mauern umläuft man. Kollision = Betäubung.
 */
export const LOW = 0;
export const HIGH = 1;
export const WALL = 2;
export const LANE_W = 2.2;
export interface DashRow {
  z: number;
  /** je Spur (links, Mitte, rechts): -1 frei, 0 Hürde, 1 Balken, 2 Mauer */
  c: [number, number, number];
}
export interface DashCoin {
  z: number;
  lane: number;
  y: number;
  got: boolean;
}
export interface DashState {
  rows: DashRow[];
  coins: DashCoin[];
  t: number;
  z: number;
  lane: number;
  px: number;
  py: number;
  vy: number;
  slideT: number;
  slideBuf: number;
  jumpBuf: number;
  stun: number;
  invuln: number;
  pace: number;
  prevX: number;
  prevY: number;
  prevA: boolean;
  prevB: boolean;
  curRow: number;
  curCoin: number;
  coinCount: number;
  crashes: number;
  jumps: number;
  slides: number;
  lands: number;
  over: boolean;
}

const DT = 1 / 60;
const TOTAL_TICKS = 30 * 60;
const JUMP_V = 9.5;
const GRAV = 32;
const SLIDE_TICKS = 34;
const STUN_TICKS = 70;
const ROW_DEPTH = 1.2;
const HURDLE_H = 0.95;
const COIN_SCORE = 3;
const ROW_END = 560;

export const speedOf = (pace: number): number => 9 + 5 * pace;

function genRows(seed: number): { rows: DashRow[]; coins: DashCoin[] } {
  const r = new Rng((seed ^ 0x2545f491) >>> 0);
  const rows: DashRow[] = [];
  const coins: DashCoin[] = [];
  let z = 42;
  let safe = 0;
  let prevZ = 0;
  let prevSafe = 0;
  while (z < ROW_END) {
    const prog = clamp(z / 420, 0, 1);
    const roll = r.next();
    const next = clamp(safe + (roll < 0.28 ? -1 : roll < 0.56 ? 1 : 0), -1, 1);
    const c: [number, number, number] = [-1, -1, -1];
    for (let l = -1; l <= 1; l++) {
      const q = r.next();
      let v: number;
      if (l === next) v = q < 0.38 ? -1 : q < 0.69 ? LOW : HIGH;
      else {
        const wallP = 0.2 + 0.2 * prog;
        v = q < 0.18 ? -1 : q < 0.18 + (1 - wallP - 0.18) / 2 ? LOW : q < 1 - wallP ? HIGH : WALL;
      }
      c[l + 1] = v;
    }
    rows.push({ z, c });
    // Münzlinie zwischen der letzten Reihe und dieser
    if (prevZ > 0) {
      const a = prevZ + ROW_DEPTH + 3.2;
      const b = z - 3.2;
      const n = Math.min(5, Math.floor((b - a) / 2.2));
      for (let k = 0; k < n; k++) {
        const zz = a + (k * (b - a)) / Math.max(1, n - 1);
        coins.push({ z: zz, lane: k < n / 2 ? prevSafe : next, y: 0.8, got: false });
      }
    }
    // Bogenmünzen über einer Hürde in der sicheren Spur
    if (c[next + 1] === LOW) for (let k = 0; k < 3; k++) coins.push({ z: z - 0.3 + k * 0.85, lane: next, y: k === 1 ? 2.25 : 2.0, got: false });
    prevZ = z;
    prevSafe = next;
    safe = next;
    z += lerp(16, 12, prog) + r.float(0, 3);
  }
  coins.sort((a, b) => a.z - b.z);
  return { rows, coins };
}

const hash01 = (i: number): number => ((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 11, 0x85ebca6b)) >>> 8 & 0xffff) / 65536;

export const game: MiniGame<DashState> = {
  id: 'hindernisdash',
  name: 'Hindernis-Dash',
  tagline: 'Spur wechseln, springen, rutschen – und nie bremsen!',
  instructions: [
    'Du rennst auf einer Bahn mit drei Spuren immer schneller nach vorn.',
    'Links/rechts wechselt die Spur, hoch springt über Hürden, runter rutscht unter Balken durch.',
    'Mauern musst du umlaufen. Wer anstößt, wird kurz betäubt und verliert Tempo.',
    'Sammle Münzen – Strecke und Münzen zählen.',
  ],
  controls: { desktop: 'Pfeile/WASD: Spur, springen, rutschen (Leertaste = Sprung, Shift = Rutschen)', touch: 'Stick: Spur/hoch/runter, A = Sprung, B = Rutschen' },
  category: 'race',
  duration: 30,
  touch: { stick: true, a: true, b: true },
  init(seed) {
    const { rows, coins } = genRows(seed);
    return {
      rows,
      coins,
      t: 0,
      z: 0,
      lane: 0,
      px: 0,
      py: 0,
      vy: 0,
      slideT: 0,
      slideBuf: 0,
      jumpBuf: 0,
      stun: 0,
      invuln: 0,
      pace: 0,
      prevX: 0,
      prevY: 0,
      prevA: false,
      prevB: false,
      curRow: 0,
      curCoin: 0,
      coinCount: 0,
      crashes: 0,
      jumps: 0,
      slides: 0,
      lands: 0,
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.t++;
    const up = (input.y > 0.5 && s.prevY <= 0.5) || (input.a && !s.prevA);
    const down = (input.y < -0.5 && s.prevY >= -0.5) || (input.b && !s.prevB);
    const left = input.x < -0.5 && s.prevX >= -0.5;
    const right = input.x > 0.5 && s.prevX <= 0.5;
    s.prevX = input.x;
    s.prevY = input.y;
    s.prevA = input.a;
    s.prevB = input.b;
    const stunned = s.stun > 0;
    if (!stunned) {
      if (left) s.lane = Math.max(-1, s.lane - 1);
      if (right) s.lane = Math.min(1, s.lane + 1);
      if (up) s.jumpBuf = 6;
      if (down) {
        if (s.py <= 0.001) {
          s.slideT = SLIDE_TICKS;
          s.slides++;
        } else {
          s.vy = Math.min(s.vy, -15);
          s.slideBuf = 10;
        }
      }
    }
    if (s.jumpBuf > 0) {
      if (!stunned && s.py <= 0.001 && s.vy <= 0) {
        s.vy = JUMP_V;
        s.py = 0.0001;
        s.slideT = 0;
        s.jumpBuf = 0;
        s.jumps++;
      } else s.jumpBuf--;
    }
    if (s.slideBuf > 0) s.slideBuf--;
    // Höhe
    if (s.py > 0 || s.vy > 0) {
      s.vy -= GRAV * DT;
      s.py += s.vy * DT;
      if (s.py <= 0) {
        s.py = 0;
        s.vy = 0;
        s.lands++;
        if (s.slideBuf > 0 && !stunned) {
          s.slideT = SLIDE_TICKS;
          s.slides++;
          s.slideBuf = 0;
        }
      }
    }
    if (s.slideT > 0) s.slideT--;
    // Seitliche Bewegung zur Spur
    const tx = s.lane * LANE_W;
    s.px += clamp(tx - s.px, -0.33, 0.33);
    // Vorwärts
    if (s.stun > 0) s.stun--;
    if (s.invuln > 0) s.invuln--;
    const v = speedOf(s.pace) * (s.stun > 0 ? 0.2 : 1);
    s.z += v * DT;
    if (s.stun <= 0) s.pace = Math.min(1, s.pace + 1 / 1500);
    while (s.curRow < s.rows.length && (s.rows[s.curRow] as DashRow).z + ROW_DEPTH < s.z - 0.6) s.curRow++;
    // Kollision
    if (s.invuln <= 0) {
      for (let i = s.curRow; i < s.rows.length; i++) {
        const r = s.rows[i] as DashRow;
        if (r.z > s.z + 0.4) break;
        let hit = false;
        for (let l = -1; l <= 1; l++) {
          const cell = r.c[l + 1] as number;
          if (cell < 0 || Math.abs(s.px - l * LANE_W) >= 0.95) continue;
          if (cell === WALL || (cell === LOW && s.py < HURDLE_H) || (cell === HIGH && s.slideT <= 0)) hit = true;
        }
        if (hit) {
          s.stun = STUN_TICKS;
          s.invuln = STUN_TICKS + 40;
          s.pace = Math.max(0, s.pace - 0.25);
          s.crashes++;
          s.slideT = 0;
          s.jumpBuf = 0;
          break;
        }
      }
    }
    // Münzen
    while (s.curCoin < s.coins.length && (s.coins[s.curCoin] as DashCoin).z < s.z - 1.2) s.curCoin++;
    const cy = s.py + (s.slideT > 0 ? 0.45 : 0.85);
    for (let i = s.curCoin; i < s.coins.length; i++) {
      const c = s.coins[i] as DashCoin;
      if (c.z > s.z + 0.9) break;
      if (c.got || Math.abs(c.z - s.z) > 0.9) continue;
      if (Math.abs(s.px - c.lane * LANE_W) < 1.0 && Math.abs(c.y - cy) < 0.95) {
        c.got = true;
        s.coinCount++;
      }
    }
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => Math.floor(s.z) + COIN_SCORE * s.coinCount,
  bot(s, skill): InputFrame {
    if (s.over || s.stun > 0) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    const v = speedOf(s.pace);
    const look = lerp(9, 34, skill);
    const ahead: { r: DashRow; i: number }[] = [];
    for (let i = s.curRow; i < s.rows.length && ahead.length < 3; i++) {
      const r = s.rows[i] as DashRow;
      if (r.z + ROW_DEPTH < s.z - 0.2) continue;
      if (r.z - s.z > look) break;
      ahead.push({ r, i });
    }
    const out: InputFrame = { ...NEUTRAL_INPUT };
    // Spurplanung: kleine dynamische Programmierung über die nächsten Reihen
    const first = ahead[0];
    if (first) {
      // Ausgangslage: aktuelle Spur
      let cost: number[] = [0, 1, 2].map((k) => (k - 1 === s.lane ? 0 : 1e6));
      let fs = [-1, 0, 1];
      ahead.forEach(({ r }, n) => {
        const nc = [0, 0, 0];
        const nf = [0, 0, 0];
        for (let l = 0; l < 3; l++) {
          let bestV = 1e9;
          let bestF = 0;
          for (let p = 0; p < 3; p++) {
            const val = (cost[p] as number) + 0.7 * Math.abs(l - p);
            if (val < bestV) {
              bestV = val;
              bestF = n === 0 ? l - 1 : (fs[p] as number);
            }
          }
          const cell = r.c[l] as number;
          nc[l] = bestV + (cell === WALL ? 50 : cell < 0 ? 0 : 1.5);
          nf[l] = bestF;
        }
        cost = nc;
        fs = nf;
      });
      let bl = 1;
      for (let l = 0; l < 3; l++) if ((cost[l] as number) < (cost[bl] as number) - 1e-9) bl = l;
      const want = fs[bl] as number;
      const dz0 = first.r.z - s.z;
      if (want !== s.lane && dz0 > 1.2) {
        if (want > s.lane && s.prevX <= 0.5) out.x = 1;
        else if (want < s.lane && s.prevX >= -0.5) out.x = -1;
      }
    }
    // Aktion für die nächste Reihe in der eigenen Spur
    const cur = ahead[0];
    if (cur) {
      const cell = cur.r.c[s.lane + 1] as number;
      const jit = (hash01(cur.i) - 0.5) * 2 * err * 0.2;
      if (cell === LOW && s.py <= 0.001 && s.prevY <= 0.5) {
        const tc = (cur.r.z + 0.6 - s.z) / v;
        if (tc <= 0.3 + jit && tc > 0.05) out.y = 1;
      } else if (cell === HIGH && s.slideT <= 0 && s.prevY >= -0.5) {
        const te = (cur.r.z - 0.4 - s.z) / v;
        if (te <= 0.13 + jit && te > -0.05) out.y = -1;
      }
    }
    return out;
  },
  hud: (s) => ({
    left: `${Math.floor(s.z)} m`,
    right: `${s.coinCount} Münzen`,
    hint: s.stun > 0 ? 'Autsch!' : undefined,
  }),
};
