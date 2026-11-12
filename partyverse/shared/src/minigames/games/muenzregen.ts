import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { approach, clamp, lerp } from '../util';

/**
 * Mit dem Korb auf dem Kopf hin und her laufen, Münzen und Sterne fangen, Steinen und Bomben ausweichen. A = Magnet-Stoß.
 * Gute Fänge in Folge steigern den Multiplikator (bis ×3), Steine und Bomben setzen ihn zurück.
 * Phasen: ab 8 s weht Wind (Münzen treiben seitlich), ab 16 s Goldrausch (Riesenmünzen, mehr Bomben, schneller).
 * Bomben, die neben dir aufschlagen, explodieren und lassen dich kurz taumeln.
 */
export type DropKind = 'coin' | 'star' | 'big' | 'stone' | 'bomb';

export interface Drop {
  id: number;
  kind: DropKind;
  x: number;
  /** Startzeitpunkt (Tick) */
  t0: number;
  /** aktuelle Höhe (Korb liegt bei y = 0) */
  y: number;
  /** Fallgeschwindigkeits-Faktor */
  speed: number;
  /** seitliches Treiben (Wind) je Tick */
  vx: number;
  /** 0 = fällt, 1 = gefangen, 2 = verfehlt/weg */
  state: 0 | 1 | 2;
}

export interface MuenzState {
  tick: number;
  bx: number;
  bvx: number;
  stun: number;
  magnet: number; // Restdauer des Stoßes (Ticks)
  cooldown: number; // Ticks bis zum nächsten Stoß
  prevA: boolean;
  points: number;
  caught: number;
  hits: number; // Steine/Bomben im Korb
  /** gute Fänge in Folge */
  combo: number;
  bestCombo: number;
  /** Bomben-Explosionen am Boden (für die Ansicht) */
  blasts: number;
  lastBlast: { x: number; near: boolean };
  lastCatch: { x: number; value: number; mult: number };
  lastHit: { x: number; kind: DropKind };
  drops: Drop[];
}

export const HALF_W = 6.2;
export const BASKET_HW = 0.95;
export const TOP_Y = 9;
export const DURATION_TICKS = 1500;
export const MAGNET_TICKS = 80;
export const MAGNET_COOLDOWN = 360;
export const MAGNET_RADIUS = 4.2;
const VALUES: Record<DropKind, number> = { coin: 1, star: 5, big: 10, stone: -3, bomb: -6 };
export const WIND_TICK = 8 * 60;
export const RUSH_TICK = 16 * 60;
export const BLAST_R = 1.5;
/** Multiplikator bei `combo` guten Fängen in Folge */
export const multOf = (combo: number): number => Math.min(3, 1 + Math.floor(combo / 6));
export const dropValue = (k: DropKind): number => VALUES[k];
export const rampFor = (tick: number): number =>
  1 + (0.8 * tick) / DURATION_TICKS + (tick >= RUSH_TICK ? 0.15 : 0);

/** Fallmuster der Welt (nur vom Seed abhängig) */
export function makeDrops(seed: number): Drop[] {
  const r = new Rng(seed ^ 0xc01);
  const drops: Drop[] = [];
  let id = 0;
  let t = 25;
  while (t < DURATION_TICKS - 70) {
    const rush = t >= RUSH_TICK;
    const windy = t >= WIND_TICK;
    const roll = r.next();
    const kind: DropKind = rush
      ? roll < 0.45
        ? 'coin'
        : roll < 0.58
          ? 'star'
          : roll < 0.66
            ? 'big'
            : roll < 0.82
              ? 'stone'
              : 'bomb'
      : roll < 0.56
        ? 'coin'
        : roll < 0.67
          ? 'star'
          : roll < 0.87
            ? 'stone'
            : 'bomb';
    drops.push({
      id: id++,
      kind,
      x: r.float(-HALF_W + 0.5, HALF_W - 0.5),
      t0: t,
      y: TOP_Y,
      speed: kind === 'big' ? 1.35 : r.float(0.9, 1.15),
      vx: windy ? (r.chance(0.5) ? 1 : -1) * r.float(0.012, rush ? 0.04 : 0.03) : 0,
      state: 0,
    });
    // Die Abstände werden mit der Zeit kürzer
    const k = t / DURATION_TICKS;
    t += Math.max(8, Math.round(r.float(lerp(17, 9, k), lerp(27, 14, k))));
    if (r.chance(0.12)) {
      // kleine Gruppe (Doppel-Fall)
      drops.push({
        id: id++,
        kind: 'coin',
        x: clamp(drops[drops.length - 1]!.x + r.float(-1.4, 1.4), -HALF_W + 0.5, HALF_W - 0.5),
        t0: t,
        y: TOP_Y,
        speed: 1,
        vx: 0,
        state: 0,
      });
      t += 10;
    }
  }
  return drops;
}

export const BASE_SPEED = 4.6;

export const game: MiniGame<MuenzState> = {
  id: 'muenzregen',
  name: 'Münzregen',
  tagline: 'Fang den goldenen Regen – in Serie!',
  instructions: [
    'Lauf mit dem Korb nach links und rechts: Münzen 1, Sterne 5, Riesenmünzen 10 Punkte.',
    'Fänge in Folge steigern den Multiplikator bis ×3 – Steine und Bomben setzen ihn zurück. Bomben explodieren auch am Boden!',
    'A = Magnet-Stoß: zieht nahe Münzen heran (6 s Aufladen).',
    'Ab 8 s weht Wind, ab 16 s Goldrausch – alles wird schneller.',
  ],
  controls: {
    desktop: 'A/D oder Pfeile links/rechts = bewegen, Leertaste = Magnet',
    touch: 'Stick links/rechts = bewegen, Knopf A = Magnet',
  },
  category: 'collect',
  duration: 25,
  touch: { stick: true, a: true, b: false },
  init(seed) {
    return {
      tick: 0,
      bx: 0,
      bvx: 0,
      stun: 0,
      magnet: 0,
      cooldown: 0,
      prevA: false,
      points: 0,
      caught: 0,
      hits: 0,
      combo: 0,
      bestCombo: 0,
      blasts: 0,
      lastBlast: { x: 0, near: false },
      lastCatch: { x: 0, value: 0, mult: 1 },
      lastHit: { x: 0, kind: 'stone' },
      drops: makeDrops(seed),
    };
  },
  step(s, input) {
    if (s.tick >= DURATION_TICKS) return;
    s.tick++;
    const ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    const press = input.a && !s.prevA;
    s.prevA = input.a;
    if (s.stun > 0) s.stun--;
    if (s.cooldown > 0) s.cooldown--;
    if (s.magnet > 0) s.magnet--;
    if (press && s.cooldown === 0 && s.stun === 0) {
      s.magnet = MAGNET_TICKS;
      s.cooldown = MAGNET_COOLDOWN;
    }
    const speed = s.stun > 0 ? 3 : 10.5;
    s.bvx = approach(s.bvx, ix * speed, 70 / 60);
    s.bx = clamp(s.bx + s.bvx / 60, -HALF_W + BASKET_HW * 0.6, HALF_W - BASKET_HW * 0.6);
    const ramp = rampFor(s.tick);
    for (const d of s.drops) {
      if (d.t0 > s.tick) break;
      if (d.state !== 0) continue;
      d.y -= (BASE_SPEED * ramp * d.speed) / 60;
      if (d.vx) {
        d.x += d.vx;
        if (Math.abs(d.x) > HALF_W - 0.4) {
          d.x = clamp(d.x, -HALF_W + 0.4, HALF_W - 0.4);
          d.vx = -d.vx;
        }
      }
      // Magnet zieht gute Dinge heran
      if (
        s.magnet > 0 &&
        VALUES[d.kind] > 0 &&
        d.y > 0.2 &&
        d.y < 7.5 &&
        Math.abs(d.x - s.bx) < MAGNET_RADIUS
      ) {
        d.x += clamp(s.bx - d.x, -0.14, 0.14) * 1.15;
      }
      if (d.y < 0.55 && d.y > -0.55 && Math.abs(d.x - s.bx) < BASKET_HW + 0.18) {
        d.state = 1;
        const v = VALUES[d.kind];
        if (v > 0) {
          const mult = multOf(s.combo);
          s.combo++;
          s.bestCombo = Math.max(s.bestCombo, s.combo);
          s.points += v * mult;
          s.caught++;
          s.lastCatch = { x: d.x, value: v * mult, mult };
        } else {
          s.points = Math.max(0, s.points + v);
          s.hits++;
          s.combo = 0;
          s.lastHit = { x: d.x, kind: d.kind };
          if (d.kind === 'bomb') s.stun = 50;
        }
      } else if (d.y < -0.9) {
        d.state = 2;
        if (d.kind === 'bomb') {
          // Explosion am Boden: wer zu nah steht, taumelt
          const near = Math.abs(d.x - s.bx) < BLAST_R;
          s.blasts++;
          s.lastBlast = { x: d.x, near };
          if (near && s.stun === 0) {
            s.stun = 35;
            s.combo = 0;
            s.points = Math.max(0, s.points - 2);
          }
        }
      }
    }
  },
  done: (s) => s.tick >= DURATION_TICKS,
  score: (s) => Math.max(0, s.points),
  bot(s, skill, rng): InputFrame {
    const reaction = lerp(34, 4, skill); // Ticks seit Erscheinen, bis der Bot ein Objekt "sieht"
    const ramp = rampFor(s.tick);
    const vmax = 10.5 * lerp(0.55, 1, skill ** 1.5);
    // Menschliche Fehler: manches schlechte Objekt wird übersehen (bei schwächeren Bots öfter)
    const blind = (d: Drop) => VALUES[d.kind] < 0 && ((d.id * 2654435761) >>> 0) % 1000 < 550 * (1 - skill);
    const seen = s.drops.filter(
      (d) => d.t0 <= s.tick && d.state === 0 && s.tick - d.t0 >= reaction && !blind(d),
    );
    const tti = (d: Drop) => Math.max(0, d.y) / (BASE_SPEED * ramp * d.speed);
    // Bewertung der guten Objekte nach Wert, Dringlichkeit und Erreichbarkeit
    // Landestelle mit Wind vorhersagen (gute Bots rechnen ihn ein)
    const px = (d: Drop) =>
      clamp(d.x + d.vx * 60 * tti(d) * clamp((skill - 0.25) / 0.6, 0, 1), -HALF_W + 0.4, HALF_W - 0.4);
    let target: Drop | null = null;
    let best = -Infinity;
    const err = (d: Drop) => (((d.id * 7919) % 101) / 100 - 0.5) * 2 * (1 - skill) * 2.4;
    const careful = skill > 0.2;
    // Wer eine lange Serie hat, geht weniger Risiko ein
    const risk = careful ? lerp(0.6, 6, skill) * (1 + multOf(s.combo) * 0.5) : 0;
    for (const d of seen) {
      if (VALUES[d.kind] <= 0) continue;
      const t = tti(d);
      const dxl = px(d);
      const reach = Math.abs(dxl - s.bx) - BASKET_HW * 0.7;
      if (reach > vmax * t * 0.92) continue; // nicht mehr zu schaffen
      // Konflikt mit schlechtem Objekt, das zur selben Zeit im Korb landen würde
      let conflict = false;
      if (careful) {
        for (const b of seen) {
          if (VALUES[b.kind] >= 0) continue;
          const zone = b.kind === 'bomb' ? BLAST_R + 0.4 : BASKET_HW * 1.7;
          if (Math.abs(tti(b) - t) < lerp(0.2, 0.4, skill) && Math.abs(px(b) - dxl) < zone) conflict = true;
        }
      }
      const val =
        VALUES[d.kind] / (t + 0.35 + (conflict ? risk : 0) + (skill < 0.4 ? Math.abs(dxl - s.bx) * 0.15 : 0));
      if (val > best) {
        best = val;
        target = d;
      }
    }
    // Bremsweg einrechnen (gute Bots), sonst schießt der Korb übers Ziel hinaus
    const stopAt = s.bx + ((s.bvx * Math.abs(s.bvx)) / 140) * clamp((skill - 0.3) / 0.5, 0, 1);
    let tx = target ? px(target) + err(target) : 0;
    // Schlechten Objekten (und Bomben-Explosionen) auf dem Weg ausweichen
    if (careful) {
      const look = lerp(0.4, 0.8, skill);
      for (const b of seen) {
        if (VALUES[b.kind] >= 0 || tti(b) > look) continue;
        const bx = px(b);
        const zone = (b.kind === 'bomb' ? BLAST_R : BASKET_HW + 0.3) + lerp(0.05, 0.35, skill);
        if (Math.abs(bx - stopAt) < zone || Math.abs(bx - s.bx) < zone)
          tx = bx + (stopAt >= bx ? 1 : -1) * (zone + 0.3);
      }
    }
    const dx = tx - stopAt;
    const lim = lerp(0.55, 1, skill ** 1.5);
    const x = clamp(dx * 2.2 + rng.gaussian() * (1 - skill) * 0.12, -lim, lim);
    // Magnet: wenn mehrere gute Objekte in der Nähe herabfallen
    let near = 0;
    let bad = 0;
    for (const d of s.drops) {
      if (d.t0 > s.tick) break;
      if (d.state !== 0 || d.y > 6 || d.y < 1.5 || Math.abs(d.x - s.bx) > MAGNET_RADIUS) continue;
      if (VALUES[d.kind] > 0) near += VALUES[d.kind] > 1 ? 3 : 1;
      else bad++;
    }
    const mag = skill > 0.45 && s.cooldown === 0 && near >= 3 && bad === 0;
    return { ...NEUTRAL_INPUT, x, a: mag };
  },
  hud: (s) => ({
    left: `${s.points} Punkte`,
    right: `${Math.max(0, Math.ceil((DURATION_TICKS - s.tick) / 60))} s`,
    hint:
      s.stun > 0
        ? 'Bombe! Du wackelst'
        : s.cooldown === 0
          ? 'Magnet bereit (A)'
          : `Magnet ${Math.ceil(s.cooldown / 60)} s`,
  }),
};
