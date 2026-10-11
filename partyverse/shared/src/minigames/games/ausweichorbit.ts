import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Ausweich-Orbit: Auf einem Ring weichen Kometen, rotierenden Balken und Druckwellen aus und sammle Münzen.
 * Welt: Ebene (x, z). Spieler in Polarkoordinaten (ang, rad). x > 0 bewegt nach rechts (Winkel sinkt),
 * y > 0 bewegt Richtung Mitte (Radius sinkt). Die Ansicht dreht die Kamera hinter den Spieler.
 */
export interface Comet { a: number; r: number; v: number; warn: number }
export interface Beam { a: number; w: number; arms: number; t: number; warn: number; dur: number }
export interface Wave { r: number; v: number; t: number; warn: number; gap: number; gapH: number }
export interface Coin { a: number; r: number; wait: number; life: number }

export interface OrbitState {
  hz: Rng; // Muster (unabhängig von Eingaben, für alle gleich)
  cn: Rng; // Münzen
  tick: number;
  ang: number;
  rad: number;
  mx: number; // letzte Bewegung (für die Ansicht)
  my: number;
  lives: number;
  inv: number;
  coins: number;
  comets: Comet[];
  beams: Beam[];
  waves: Wave[];
  field: Coin[];
  nextSpawn: number;
  hitCount: number;
  over: boolean;
}

export const R_MIN = 2.6;
export const R_MAX = 8.6;
export const SPEED = 7 / 60;
const PLAYER_R = 0.35;
const MAX_TICKS = 30 * 60;
export const COMET_START = R_MAX + 2.6;
export const WAVE_START = 1.6;

const TAU = Math.PI * 2;
export const wrapPi = (a: number): number => {
  let v = (a + Math.PI) % TAU;
  if (v < 0) v += TAU;
  return v - Math.PI;
};

function spawnCoin(s: OrbitState, wait: number): Coin {
  return { a: s.cn.float(0, TAU), r: s.cn.float(3.4, 8.0), wait, life: 330 };
}

function spawnPattern(s: OrbitState): void {
  const h = s.hz;
  const sec = s.tick / 60;
  const d = clamp(sec / 34, 0, 1);
  const roll = h.next();
  let extra = 0;
  if (sec > 4 && s.beams.length === 0 && roll < 0.24) {
    const dir = h.chance(0.5) ? 1 : -1;
    s.beams.push({ a: h.float(0, TAU), w: (dir * lerp(0.6, 1.3, d)) / 60, arms: d > 0.45 && h.chance(0.5) ? 2 : 1, t: 0, warn: 70, dur: Math.round(lerp(320, 250, d)) });
    extra = 35;
  } else if (sec > 2 && s.waves.length === 0 && roll < 0.5) {
    s.waves.push({ r: WAVE_START, v: lerp(3.3, 5.6, d) / 60, t: 0, warn: 80, gap: h.float(0, TAU), gapH: lerp(0.58, 0.46, d) });
    extra = 45;
  } else {
    let n = 1;
    if (d > 0.3 && h.chance(0.5)) n++;
    if (d > 0.65 && h.chance(0.55)) n++;
    for (let i = 0; i < n; i++) s.comets.push({ a: h.float(0, TAU), r: COMET_START, v: (lerp(5.5, 10, d) + h.float(-0.5, 1.2)) / 60, warn: 40 + i * 12 });
  }
  s.nextSpawn = s.tick + Math.round(lerp(64, 30, d) * h.float(0.85, 1.15)) + extra;
}

/** Trifft ein Spieler an (ang, rad) in `dt` Ticks (ab dem aktuellen Zustand) ein Hindernis? Liest nur. */
export function hitAt(s: OrbitState, ang: number, rad: number, dt: number): boolean {
  const px = rad * Math.cos(ang);
  const pz = rad * Math.sin(ang);
  for (const c of s.comets) {
    const r = c.r - c.v * Math.max(0, dt - c.warn);
    if (r > R_MAX + 1.2) continue;
    const dx = px - r * Math.cos(c.a);
    const dz = pz - r * Math.sin(c.a);
    if (dx * dx + dz * dz < (0.45 + PLAYER_R) ** 2) return true;
  }
  for (const b of s.beams) {
    const t = b.t + dt;
    if (t < b.warn || t >= b.warn + b.dur) continue;
    for (let k = 0; k < b.arms; k++) {
      const d = Math.abs(wrapPi(ang - (b.a + b.w * dt + (k * TAU) / b.arms)));
      if (d < Math.PI / 2 && rad * Math.sin(d) < 0.32 + PLAYER_R) return true;
    }
  }
  for (const w of s.waves) {
    const t = w.t + dt;
    if (t < w.warn) continue;
    const r = w.r + w.v * (t - w.warn);
    if (Math.abs(rad - r) > 0.3 + PLAYER_R) continue;
    const g1 = Math.abs(wrapPi(ang - w.gap));
    const g2 = Math.abs(wrapPi(ang - w.gap - Math.PI));
    if (g1 > w.gapH && g2 > w.gapH) return true;
  }
  return false;
}

export function movePlayer(ang: number, rad: number, x: number, y: number): { ang: number; rad: number } {
  let mx = clamp(x, -1, 1);
  let my = clamp(y, -1, 1);
  const len = Math.hypot(mx, my);
  if (len > 1) {
    mx /= len;
    my /= len;
  }
  const nr = clamp(rad - my * SPEED, R_MIN, R_MAX);
  return { ang: ang - (mx * SPEED) / nr, rad: nr };
}

export const score = (s: OrbitState): number => Math.floor((s.tick * 10) / 60) + s.coins * 25;

export const game: MiniGame<OrbitState> = {
  id: 'ausweichorbit',
  name: 'Ausweich-Orbit',
  tagline: 'Kreise um die Sonne und weiche aus!',
  instructions: [
    'Du läufst auf einem Ring um eine leuchtende Sonne.',
    'Weiche Kometen, rotierenden Balken und Druckwellen aus – Warnmarken zeigen, wo es gleich knallt.',
    'Sammle Münzen für Extrapunkte. Nach drei Treffern ist Schluss.',
    'Pro Sekunde gibt es 10 Punkte, pro Münze 25.',
  ],
  controls: { desktop: 'Pfeiltasten/WASD: um den Ring laufen, nach innen und außen', touch: 'Stick bewegen' },
  category: 'survival',
  duration: 30,
  touch: { stick: true, a: false, b: false },
  init(seed) {
    const base = new Rng(seed);
    const s: OrbitState = {
      hz: base.fork(1),
      cn: base.fork(2),
      tick: 0,
      ang: Math.PI / 2,
      rad: 5.6,
      mx: 0,
      my: 0,
      lives: 3,
      inv: 0,
      coins: 0,
      comets: [],
      beams: [],
      waves: [],
      field: [],
      nextSpawn: 70,
      hitCount: 0,
      over: false,
    };
    s.field.push(spawnCoin(s, 40), spawnCoin(s, 150));
    return s;
  },
  step(s, input) {
    if (s.over) return;
    s.tick++;
    const m = movePlayer(s.ang, s.rad, input.x, input.y);
    s.mx = clamp(input.x, -1, 1);
    s.my = clamp(input.y, -1, 1);
    s.ang = wrapPi(m.ang);
    s.rad = m.rad;
    if (s.tick >= s.nextSpawn) spawnPattern(s);
    for (const c of s.comets) {
      if (c.warn > 0) c.warn--;
      else c.r -= c.v;
    }
    s.comets = s.comets.filter((c) => c.r > 1.0);
    for (const b of s.beams) {
      b.a += b.w;
      b.t++;
    }
    s.beams = s.beams.filter((b) => b.t < b.warn + b.dur);
    for (const w of s.waves) {
      w.t++;
      if (w.t > w.warn) w.r += w.v;
    }
    s.waves = s.waves.filter((w) => w.r < R_MAX + 1.5);
    if (s.inv > 0) s.inv--;
    else if (hitAt(s, s.ang, s.rad, 0)) {
      s.lives--;
      s.hitCount++;
      s.inv = 100;
    }
    const px = s.rad * Math.cos(s.ang);
    const pz = s.rad * Math.sin(s.ang);
    for (let i = 0; i < s.field.length; i++) {
      const c = s.field[i] as Coin;
      if (c.wait > 0) {
        c.wait--;
        continue;
      }
      if (--c.life <= 0) {
        s.field[i] = spawnCoin(s, 70);
        continue;
      }
      const dx = px - c.r * Math.cos(c.a);
      const dz = pz - c.r * Math.sin(c.a);
      if (dx * dx + dz * dz < 1.0) {
        s.coins++;
        s.field[i] = spawnCoin(s, 80);
      }
    }
    if (s.lives <= 0 || s.tick >= MAX_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score,
  bot(s, skill, rng): InputFrame {
    if (rng.next() < (1 - skill) * 0.3) {
      return { ...NEUTRAL_INPUT, x: rng.range(-1, 1), y: rng.range(-1, 1) };
    }
    const H = Math.round(lerp(7, 32, skill));
    const px = s.rad * Math.cos(s.ang);
    const pz = s.rad * Math.sin(s.ang);
    let coin: Coin | null = null;
    let best = Infinity;
    if (skill > 0.25) {
      for (const c of s.field) {
        if (c.wait > 0) continue;
        const d = Math.hypot(px - c.r * Math.cos(c.a), pz - c.r * Math.sin(c.a));
        if (d < best) {
          best = d;
          coin = c;
        }
      }
    }
    let bestCost = Infinity;
    let bx = 0;
    let by = 0;
    const T1 = Math.min(8, H);
    for (let mx = -1; mx <= 1; mx++) {
      for (let my = -1; my <= 1; my++) {
        // Plan: erst (mx,my) für T1 Ticks, danach die beste Fortsetzung
        let a0 = s.ang;
        let r0 = s.rad;
        let c0 = 0;
        let md0 = Infinity;
        for (let k = 1; k <= T1; k++) {
          const m = movePlayer(a0, r0, mx, my);
          a0 = m.ang;
          r0 = m.rad;
          if (coin) md0 = Math.min(md0, Math.hypot(r0 * Math.cos(a0) - coin.r * Math.cos(coin.a), r0 * Math.sin(a0) - coin.r * Math.sin(coin.a)));
          if (k > s.inv && (k & 1) === 0 && hitAt(s, a0, r0, k)) {
            c0 = 1000 + ((H - k) / H) * 1000;
            break;
          }
        }
        const md0end = coin ? Math.hypot(r0 * Math.cos(a0) - coin.r * Math.cos(coin.a), r0 * Math.sin(a0) - coin.r * Math.sin(coin.a)) : 0;
        let sub = Infinity;
        for (let nx = -1; nx <= 1; nx++) {
          for (let ny = -1; ny <= 1; ny++) {
            if (nx !== 0 && ny !== 0) continue; // Fortsetzung nur geradeaus/seitwärts/stehen (spart Rechenzeit)
            let a = a0;
            let r = r0;
            let cost = c0;
            let md = md0;
            if (cost === 0) {
              for (let k = T1 + 1; k <= H; k++) {
                const m = movePlayer(a, r, nx, ny);
                a = m.ang;
                r = m.rad;
                if (coin) md = Math.min(md, Math.hypot(r * Math.cos(a) - coin.r * Math.cos(coin.a), r * Math.sin(a) - coin.r * Math.sin(coin.a)));
                if (k > s.inv && ((k & 1) === 0 || k === H) && hitAt(s, a, r, k)) {
                  cost += 1000 + ((H - k) / H) * 1000;
                  break;
                }
              }
            }
            if (coin) cost += 0.5 * md0end + 0.9 * md + 0.15 * Math.hypot(r * Math.cos(a) - coin.r * Math.cos(coin.a), r * Math.sin(a) - coin.r * Math.sin(coin.a));
            cost += Math.abs(r - 5.6) * 0.12;
            if (cost < sub) sub = cost;
          }
        }
        sub += (mx !== 0 || my !== 0 ? 0.05 : 0) + rng.float(0, (1 - skill) * 2);
        if (sub < bestCost) {
          bestCost = sub;
          bx = mx;
          by = my;
        }
      }
    }
    return { ...NEUTRAL_INPUT, x: bx, y: by };
  },
  hud: (s) => ({ left: `Leben ${Math.max(0, s.lives)}/3`, right: `${score(s)} Pkt`, hint: s.inv > 0 && s.lives > 0 ? 'Autsch!' : `${s.coins} Münzen` }),
};
