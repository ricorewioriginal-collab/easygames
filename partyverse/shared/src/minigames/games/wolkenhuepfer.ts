import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Wolkenhüpfer: Auto-Lauf über schwebende Wolken. A = springen (länger halten = höher).
 * Alle Wolken werden aus dem Seed erzeugt; Bewegung läuft über reine Rechenwellen (kein sin/cos), damit Server
 * und Browser bitgleich rechnen.
 */
export interface Cloud {
  x0: number;
  x1: number;
  y: number;
  /** 0 = fest, 1 = fährt auf und ab, 2 = gleitet hin und her, 3 = Federwolke */
  kind: 0 | 1 | 2 | 3;
  amp: number;
  /** Zyklen pro Tick */
  w: number;
  ph: number;
}
export interface WStar {
  x: number;
  y: number;
  got: boolean;
}
export interface WolkenState {
  clouds: Cloud[];
  stars: WStar[];
  t: number;
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  on: number;
  coyote: number;
  jumpBuf: number;
  jumping: boolean;
  springing: boolean;
  prevA: boolean;
  held: boolean;
  lives: number;
  respawn: number;
  lastPlat: number;
  maxX: number;
  starCount: number;
  /** Zähler für die Ansicht (Klänge/Partikel) */
  jumps: number;
  lands: number;
  falls: number;
  springs: number;
  over: boolean;
}

const DT = 1 / 60;
const TOTAL_TICKS = 30 * 60;
const JUMP_V = 11.5;
const SPRING_V = 15;
const G_HOLD = 28;
const G_UP = 62;
const G_SPRING = 30;
const G_DOWN = 46;
const EDGE = 0.25;
const KILL_Y = -4.5;
const COYOTE = 6;
const BUFFER = 7;
const RESPAWN_TICKS = 75;
const STAR_R2 = 0.85 * 0.85;

/** Dreieckswelle, geglättet, Ergebnis in [-1, 1]; u in Zyklen */
export function wave(u: number): number {
  const f = u - Math.floor(u);
  const tri = f < 0.5 ? f * 2 : 2 - f * 2;
  return tri * tri * (3 - 2 * tri) * 2 - 1;
}
export const speedAt = (t: number): number => 6.4 + Math.min(1.6, (t / TOTAL_TICKS) * 1.6);
export const cloudOffX = (c: Cloud, t: number): number => (c.kind === 2 ? c.amp * wave(c.ph + t * c.w) : 0);
export const cloudTop = (c: Cloud, t: number): number =>
  c.y + (c.kind === 1 ? c.amp * wave(c.ph + t * c.w) : 0);

interface Body {
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  on: number;
  jumping: boolean;
  springing: boolean;
}

/** 0 = nichts, 1 = gelandet, 2 = Feder, 3 = Boden verlassen. t = Zeit NACH diesem Schritt. */
function advance(cl: Cloud[], t: number, b: Body, held: boolean, from: number): number {
  const vx = speedAt(t);
  if (b.grounded) {
    const c = cl[b.on] as Cloud;
    const ox = cloudOffX(c, t);
    b.x += vx * DT + (ox - cloudOffX(c, t - 1));
    b.y = cloudTop(c, t);
    b.vy = 0;
    if (b.x > c.x1 + ox + EDGE || b.x < c.x0 + ox - EDGE) {
      b.grounded = false;
      b.jumping = false;
      b.springing = false;
      return 3;
    }
    return 0;
  }
  const prevY = b.y;
  const g = b.vy > 0 ? (b.springing ? G_SPRING : b.jumping && held ? G_HOLD : G_UP) : G_DOWN;
  b.vy -= g * DT;
  b.y += b.vy * DT;
  b.x += vx * DT;
  if (b.vy <= 0) {
    for (let i = from; i < cl.length; i++) {
      const c = cl[i] as Cloud;
      if (c.x0 - 2 > b.x) break;
      if (c.x1 + 2 < b.x) continue;
      const ox = cloudOffX(c, t);
      if (b.x < c.x0 + ox - EDGE || b.x > c.x1 + ox + EDGE) continue;
      const tp = cloudTop(c, t);
      if (prevY >= tp - 0.12 && b.y <= tp) {
        b.y = tp;
        b.jumping = false;
        b.on = i;
        if (c.kind === 3) {
          b.vy = SPRING_V;
          b.springing = true;
          return 2;
        }
        b.vy = 0;
        b.grounded = true;
        b.springing = false;
        return 1;
      }
    }
  }
  return 0;
}

function genLevel(seed: number): { clouds: Cloud[]; stars: WStar[] } {
  const r = new Rng((seed ^ 0x5f3759df) >>> 0);
  const clouds: Cloud[] = [{ x0: -4, x1: 10, y: 0, kind: 0, amp: 0, w: 0, ph: 0 }];
  const stars: WStar[] = [];
  let x = 10;
  let y = 0;
  let i = 0;
  let springNext = false;
  while (x < 380) {
    const diff = clamp(x / 240, 0, 1);
    let kind: 0 | 1 | 2 | 3 = 0;
    let gap: number;
    let len: number;
    let ny: number;
    let amp = 0;
    if (springNext) {
      gap = r.float(3.4, 4.2);
      len = r.float(6.5, 8);
      ny = clamp(y + r.float(0.4, 2.0), -1.5, 2.4);
      springNext = false;
    } else {
      const roll = r.next();
      if (i >= 3 && roll < 0.13) {
        kind = 3;
        len = 2.4;
        gap = r.float(1.6, 2.4);
        ny = clamp(y + r.float(-0.4, 0.4), -1.5, 2.0);
        springNext = true;
      } else {
        gap = r.float(1.3, 2.1 + 2.3 * diff);
        len = r.float(3.2 - 1.0 * diff, 5.8 - 2.2 * diff);
        ny = clamp(y + r.float(-1.1, 0.9), -1.8, 2.2);
        if (gap > 3.0) ny = Math.min(ny, y + 0.5);
        if (i >= 2 && roll < 0.27) {
          kind = 1;
          amp = r.float(0.5, 0.8);
          gap = Math.min(gap, 2.6);
          ny = clamp(y + r.float(-0.5, 0.4), -1.5, 1.6);
          len = Math.max(len, 3.6);
        } else if (i >= 2 && roll < 0.4) {
          kind = 2;
          amp = r.float(0.8, 1.1);
          gap = Math.min(gap, 2.0);
          len = Math.max(len, 4.4);
          ny = clamp(y + r.float(-0.6, 0.5), -1.5, 1.8);
        }
      }
    }
    const x0 = x + gap + (kind === 2 ? amp : 0);
    const period = r.float(2.6, 3.8) * 60;
    const c: Cloud = {
      x0,
      x1: x0 + len,
      y: ny,
      kind,
      amp,
      w: kind === 1 || kind === 2 ? 1 / period : 0,
      ph: r.float(0, 1),
    };
    // Sterne im Sprungbogen über der Lücke und manchmal auf der Wolke
    if (kind !== 3 && r.chance(0.6)) {
      const top = Math.max(y, ny + (kind === 1 ? amp : 0));
      for (let k = 0; k < 3; k++)
        stars.push({
          x: x + gap * (0.25 + 0.25 * k) + (kind === 2 ? amp : 0),
          y: top + 1.2 + (k === 1 ? 0.45 : 0),
          got: false,
        });
    } else if (springNext) {
      for (let k = 0; k < 4; k++)
        stars.push({
          x: x + gap + len * 0.5 + 1.4 * (k + 1),
          y: ny + 3.2 + (k === 1 || k === 2 ? 0.4 : 0),
          got: false,
        });
    } else if (r.chance(0.3)) {
      stars.push({ x: x0 + len * 0.5, y: ny + 1.0 + (kind === 1 ? amp : 0), got: false });
    }
    clouds.push(c);
    x = c.x1;
    y = ny;
    i++;
  }
  clouds.sort((a, b) => a.x0 - b.x0);
  return { clouds, stars };
}

const hash01 = (i: number): number =>
  (((Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(i + 7, 0x85ebca6b)) >>> 8) & 0xffff) / 65536;

interface Plan {
  k: number;
  margin: number;
}

/** Probiert Haltedauern durch und liefert die beste (Rand in Metern innerhalb der Landewolke, -9 = Absturz). */
function planHold(s: WolkenState, fromGround: boolean, aim: number, step: number): Plan {
  let best: Plan = { k: 0, margin: -99 };
  const from = Math.max(0, s.on - 2, s.lastPlat - 2);
  for (let k = 0; k <= 48; k += step) {
    const b: Body = {
      x: s.x,
      y: s.y,
      vy: s.vy,
      grounded: s.grounded,
      on: s.on,
      jumping: s.jumping,
      springing: s.springing,
    };
    if (fromGround) {
      b.grounded = false;
      b.jumping = true;
      b.vy = JUMP_V;
    }
    let margin = -9;
    for (let n = 0; n < 150; n++) {
      const t = s.t + 1 + n;
      const ev = advance(s.clouds, t, b, n < k, from);
      if (ev === 1 || ev === 2) {
        const c = s.clouds[b.on] as Cloud;
        const ox = cloudOffX(c, t);
        const xl = b.x + aim;
        margin = Math.min(xl - (c.x0 + ox), c.x1 + ox - xl);
        break;
      }
      if (b.y < KILL_Y) break;
    }
    if (margin <= -9) continue;
    const score = Math.min(margin, 1.0) + 0.012 * k;
    if (score > best.margin) best = { k, margin: score };
  }
  if (best.margin <= -99) return { k: 48, margin: -9 };
  return best;
}

export const game: MiniGame<WolkenState> = {
  id: 'wolkenhuepfer',
  name: 'Wolkenhüpfer',
  tagline: 'Hüpf von Wolke zu Wolke und sammle Sterne!',
  instructions: [
    'Dein Wölkchen-Läufer rennt von allein über die schwebenden Wolken.',
    'Springe mit A über die Lücken – je länger du hältst, desto höher fliegst du.',
    'Federwolken schleudern dich hoch, bewegliche Wolken wandern hin und her.',
    'Drei Leben: Wer abstürzt, landet auf der letzten Wolke und verliert Zeit.',
  ],
  controls: { desktop: 'Leertaste gedrückt halten = höher springen', touch: 'Knopf A tippen oder halten' },
  category: 'platform',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const { clouds, stars } = genLevel(seed);
    return {
      clouds,
      stars,
      t: 0,
      x: 1,
      y: 0,
      vy: 0,
      grounded: true,
      on: 0,
      coyote: COYOTE,
      jumpBuf: 0,
      jumping: false,
      springing: false,
      prevA: false,
      held: false,
      lives: 3,
      respawn: 0,
      lastPlat: 0,
      maxX: 1,
      starCount: 0,
      jumps: 0,
      lands: 0,
      falls: 0,
      springs: 0,
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.t++;
    const held = !!input.a;
    const press = held && !s.prevA;
    s.prevA = held;
    s.held = held;
    if (s.respawn > 0) {
      s.respawn--;
      const c = s.clouds[s.on] as Cloud;
      s.x += cloudOffX(c, s.t) - cloudOffX(c, s.t - 1);
      s.y = cloudTop(c, s.t);
      if (s.t >= TOTAL_TICKS) s.over = true;
      return;
    }
    if (press) s.jumpBuf = BUFFER;
    else if (s.jumpBuf > 0) s.jumpBuf--;
    if (s.grounded) s.coyote = COYOTE;
    else if (s.coyote > 0) s.coyote--;
    if (s.jumpBuf > 0 && s.coyote > 0) {
      s.grounded = false;
      s.jumping = true;
      s.springing = false;
      s.vy = JUMP_V;
      s.jumpBuf = 0;
      s.coyote = 0;
      s.jumps++;
    }
    const ev = advance(s.clouds, s.t, s, held, Math.max(0, s.on - 2, s.lastPlat - 2));
    if (ev === 1) {
      s.lands++;
      s.lastPlat = s.on;
    } else if (ev === 2) s.springs++;
    if (s.y < KILL_Y) {
      s.lives--;
      s.falls++;
      s.jumpBuf = 0;
      if (s.lives <= 0) {
        s.over = true;
        return;
      }
      const c = s.clouds[s.lastPlat] as Cloud;
      s.on = s.lastPlat;
      s.grounded = true;
      s.jumping = false;
      s.springing = false;
      s.vy = 0;
      s.x = c.x0 + cloudOffX(c, s.t) + 0.4;
      s.y = cloudTop(c, s.t);
      s.respawn = RESPAWN_TICKS;
      s.coyote = COYOTE;
    }
    for (const st of s.stars) {
      if (st.got || Math.abs(st.x - s.x) > 1) continue;
      const dx = st.x - s.x;
      const dy = st.y - (s.y + 0.6);
      if (dx * dx + dy * dy < STAR_R2) {
        st.got = true;
        s.starCount++;
      }
    }
    if (s.x > s.maxX) s.maxX = s.x;
    if (s.t >= TOTAL_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score: (s) => Math.max(0, Math.floor(s.maxX - 1)) + 3 * s.starCount,
  bot(s, skill, rng): InputFrame {
    if (s.over || s.respawn > 0) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    const aim = (hash01(s.lastPlat * 3 + 1) - 0.5) * 2 * err * 3.2;
    if (s.grounded) {
      const c = s.clouds[s.on] as Cloud;
      const edge = c.x1 + cloudOffX(c, s.t) + EDGE;
      const ticks = (edge - s.x) / (speedAt(s.t) * DT);
      const lead = lerp(10, 1.2, skill) + hash01(s.on) * 2.5 * err;
      if (ticks > lead) return { ...NEUTRAL_INPUT };
      if (ticks <= 1.5) return { ...NEUTRAL_INPUT, a: true };
      const plan = planHold(s, true, aim, 4);
      return { ...NEUTRAL_INPUT, a: plan.margin >= lerp(-0.1, 0.3, skill) };
    }
    if (!s.jumping && !s.springing && s.coyote > 0 && s.vy <= 0) return { ...NEUTRAL_INPUT, a: true };
    if (s.jumping && s.vy > 0) {
      const plan = planHold(s, false, aim, 3);
      const hold = plan.k > 0;
      return { ...NEUTRAL_INPUT, a: rng.chance(err * 0.03) ? !hold : hold };
    }
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => ({
    left: `${Math.max(0, Math.floor(s.maxX - 1))} m · ${s.starCount} Sterne`,
    right: `Leben ${'♥'.repeat(Math.max(0, s.lives))}`,
    hint: s.respawn > 0 ? 'Abgestürzt!' : undefined,
  }),
};
