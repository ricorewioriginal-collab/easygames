import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Zielschuss: Schießbude. Spielfeld-Koordinaten: X in [-1.6, 1.6] (rechts positiv), Y in [-1, 1] (oben positiv),
 * das Fadenkreuz wird entweder mit dem Zeiger (px*1.6, py) oder per Tasten/Stick bewegt. Schuss: A oder Klick (Flanke).
 * Treffer in Folge steigern den Multiplikator (bis ×3), Fehlschüsse und Bomben setzen ihn zurück.
 * Drei Phasen: Aufwärmen → Wackelziele → Finale (alle Punkte doppelt).
 */
export type TargetKind = 'duck' | 'fast' | 'big' | 'bonus' | 'decoy' | 'pop';
export interface Target {
  id: number;
  kind: TargetKind;
  x: number;
  y0: number;
  y: number;
  vx: number;
  r: number;
  age: number;
  life: number; // Ticks bis zum Verschwinden (nur pop), sonst 0
  amp: number;
  freq: number;
  pts: number;
}
export interface ZielState {
  hz: Rng;
  tick: number;
  cx: number;
  cy: number;
  usePtr: boolean;
  ppx: number;
  ppy: number;
  prevA: boolean;
  prevPd: boolean;
  /** Ticks, die eine Richtungstaste schon gehalten wird (Fadenkreuz beschleunigt) */
  keyHold: number;
  ammo: number;
  reload: number; // > 0: lädt nach (Ticks)
  cooldown: number;
  targets: Target[];
  nextId: number;
  nextSpawn: number;
  points: number;
  hits: number;
  shots: number;
  decoys: number;
  /** Treffer in Folge (Fehlschuss/Bombe = 0) */
  combo: number;
  bestCombo: number;
  /** letzter Schuss für die Ansicht */
  shotSeq: number;
  lastShot: { x: number; y: number; id: number; pts: number; kind: TargetKind | ''; mult: number };
  over: boolean;
}

export const X_MAX = 1.6;
export const MAG = 6;
export const RELOAD_TICKS = 60;
export const MAX_TICKS = 25 * 60;
/** Ab hier wackeln die Ziele (Phase 2) */
export const PHASE2_TICK = 8 * 60;
/** Ab hier zählt alles doppelt (Finale) */
export const FINALE_TICK = 19 * 60;
export const ROW_Y = [0.55, 0.05, -0.45];
const KEY_MIN = 1.3 / 60;
const KEY_MAX = 4.2 / 60;

export const pointsOf = (k: TargetKind): number =>
  ({ duck: 10, fast: 25, big: 10, bonus: 50, decoy: -30, pop: 20 })[k];

/** Aktuelle Phase: 0 Aufwärmen, 1 Wackelziele, 2 Finale */
export const phaseOf = (tick: number): 0 | 1 | 2 => (tick >= FINALE_TICK ? 2 : tick >= PHASE2_TICK ? 1 : 0);
/** Multiplikator für den nächsten Treffer bei `combo` Treffern in Folge */
export const multOf = (combo: number): number => Math.min(3, 1 + Math.floor(combo / 4));

function spawn(s: ZielState): void {
  const h = s.hz;
  const d = clamp(s.tick / MAX_TICKS, 0, 1);
  const ph = phaseOf(s.tick);
  const roll = h.next();
  let kind: TargetKind = 'duck';
  if (roll < 0.18 + d * 0.06) kind = 'decoy';
  else if (roll < 0.27 + d * 0.04 + (ph === 2 ? 0.06 : 0)) kind = 'bonus';
  else if (roll < 0.5) kind = 'fast';
  else if (roll < 0.6) kind = 'big';
  else if (roll < 0.78) kind = 'pop';
  const id = s.nextId++;
  const shrink = lerp(1, 0.78, d);
  if (kind === 'pop') {
    const y = h.float(-0.7, 0.8);
    const x = h.float(-1.35, 1.35);
    s.targets.push({
      id,
      kind,
      x,
      y0: y,
      y,
      // ab Phase 2 rutschen Pop-ups seitlich
      vx: ph >= 1 ? h.float(-0.35, 0.35) / 60 : 0,
      r: 0.17 * shrink,
      age: 0,
      life: Math.round(lerp(90, 55, d)),
      amp: 0,
      freq: 0,
      pts: pointsOf('pop'),
    });
  } else {
    const row = h.int(3);
    const dir = row % 2 === 0 ? 1 : -1;
    const base = { duck: 0.62, fast: 1.15, big: 0.42, bonus: 1.1, decoy: 0.7 }[kind];
    const spd = base * lerp(1, 1.55, d) * h.float(0.9, 1.15);
    const r = { duck: 0.16, fast: 0.115, big: 0.22, bonus: 0.115, decoy: 0.15 }[kind] * shrink;
    const y0 = (ROW_Y[row] as number) + h.float(-0.04, 0.04);
    const wob = kind === 'bonus' || kind === 'fast' || (ph >= 1 && kind !== 'big');
    s.targets.push({
      id,
      kind,
      x: -dir * (X_MAX + 0.25),
      y0,
      y: y0,
      vx: (dir * spd) / 60,
      r,
      age: 0,
      life: 0,
      amp: wob ? h.float(0.06, ph >= 1 ? 0.2 : 0.14) : 0,
      freq: h.float(0.05, 0.09),
      pts: pointsOf(kind),
    });
  }
  s.nextSpawn = s.tick + Math.round(lerp(30, 15, d) * h.float(0.7, 1.3));
}

/** Position eines Ziels `dt` Ticks später (für Vorhalt und Bot) */
export function targetAt(t: Target, dt: number): { x: number; y: number } {
  return { x: t.x + t.vx * dt, y: t.amp ? t.y0 + t.amp * Math.sin((t.age + dt) * t.freq) : t.y };
}

export const score = (s: ZielState): number => Math.max(0, s.points);

/** Bot lässt sich von einer Bombe täuschen? (fest je Ziel, damit er nicht jedes Bild neu würfelt) */
const fooledBy = (id: number, skill: number): boolean =>
  ((Math.imul(id + 7, 0x9e3779b1) >>> 8) % 1000) / 1000 < (1 - skill) * 0.4;

export const game: MiniGame<ZielState> = {
  id: 'zielschuss',
  name: 'Zielschuss',
  tagline: 'Treffer in Serie – aber Finger weg von den Bomben!',
  instructions: [
    'Zielen und schießen: Maus/Finger tippt direkt aufs Ziel, oder Pfeile/Stick bewegen das Fadenkreuz und A schießt.',
    'Treffer in Folge steigern den Multiplikator bis ×3 – ein Fehlschuss oder eine Bombe setzt ihn zurück.',
    'Goldene Sterne bringen am meisten. In den letzten 6 Sekunden zählt alles doppelt!',
    'Sechs Schuss pro Magazin; B lädt früher nach.',
  ],
  controls: {
    desktop: 'Maus zielen + Klick, oder Pfeile/WASD + Leertaste; B/Shift lädt nach',
    touch: 'Ziel antippen schießt',
  },
  category: 'aim',
  duration: 25,
  usesPointer: true,
  touch: { stick: false, a: false, b: false },
  init(seed) {
    return {
      hz: new Rng(seed).fork(7),
      tick: 0,
      cx: 0,
      cy: 0,
      usePtr: false,
      ppx: 0,
      ppy: 0,
      prevA: false,
      prevPd: false,
      keyHold: 0,
      ammo: MAG,
      reload: 0,
      cooldown: 0,
      targets: [],
      nextId: 1,
      nextSpawn: 20,
      points: 0,
      hits: 0,
      shots: 0,
      decoys: 0,
      combo: 0,
      bestCombo: 0,
      shotSeq: 0,
      lastShot: { x: 0, y: 0, id: 0, pts: 0, kind: '', mult: 1 },
      over: false,
    };
  },
  step(s, input) {
    if (s.over) return;
    s.tick++;
    // Fadenkreuz
    const ptrMoved = input.px !== s.ppx || input.py !== s.ppy;
    const ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    const iy = clamp(Number.isFinite(input.y) ? input.y : 0, -1, 1);
    const keys = Math.abs(ix) > 0.05 || Math.abs(iy) > 0.05;
    if (ptrMoved || (input.pd && !s.prevPd)) s.usePtr = true;
    else if (keys) s.usePtr = false;
    s.ppx = input.px;
    s.ppy = input.py;
    if (s.usePtr) {
      s.cx = clamp(input.px, -1, 1) * X_MAX;
      s.cy = clamp(input.py, -1, 1);
      s.keyHold = 0;
    } else {
      s.keyHold = keys ? s.keyHold + 1 : 0;
      // Tasten/Stick: beschleunigt beim Halten, über einem Ziel bremst das Fadenkreuz (leichte Zielhilfe)
      let sp = lerp(KEY_MIN, KEY_MAX, clamp(s.keyHold / 22, 0, 1));
      if (s.targets.some((t) => t.kind !== 'decoy' && Math.hypot(t.x - s.cx, t.y - s.cy) < t.r)) sp *= 0.55;
      const len = Math.max(1, Math.hypot(ix, iy));
      s.cx = clamp(s.cx + (ix / len) * sp, -X_MAX, X_MAX);
      s.cy = clamp(s.cy + (iy / len) * sp, -1, 1);
    }
    // Ziele
    if (s.tick >= s.nextSpawn) spawn(s);
    for (const t of s.targets) {
      t.age++;
      t.x += t.vx;
      t.y = t.amp ? t.y0 + t.amp * Math.sin(t.age * t.freq) : t.y0;
    }
    s.targets = s.targets.filter((t) => (t.kind === 'pop' ? t.age < t.life : Math.abs(t.x) < X_MAX + 0.35));
    // Nachladen
    if (s.reload > 0) {
      s.reload--;
      if (s.reload === 0) s.ammo = MAG;
    } else if (s.ammo === 0 || (input.b && s.ammo < MAG)) {
      s.reload = RELOAD_TICKS;
      s.ammo = 0;
    }
    if (s.cooldown > 0) s.cooldown--;
    // Schuss
    const fire = (input.a && !s.prevA) || (input.pd && !s.prevPd);
    s.prevA = input.a;
    s.prevPd = input.pd;
    if (fire && s.reload === 0 && s.ammo > 0 && s.cooldown === 0) {
      s.ammo--;
      s.shots++;
      s.cooldown = 8;
      let best: Target | null = null;
      let bd = Infinity;
      for (const t of s.targets) {
        if (t.kind === 'pop' && t.age < 6) continue; // noch nicht aufgeklappt
        const d = Math.hypot(t.x - s.cx, t.y - s.cy);
        if (d <= t.r + 0.03 && d < bd) {
          bd = d;
          best = t;
        }
      }
      s.shotSeq++;
      const fin = phaseOf(s.tick) === 2 ? 2 : 1;
      if (best) {
        s.hits++;
        if (best.pts < 0) {
          s.decoys++;
          s.combo = 0;
          s.points = Math.max(0, s.points + best.pts * fin);
          s.lastShot = { x: best.x, y: best.y, id: best.id, pts: best.pts * fin, kind: best.kind, mult: 1 };
        } else {
          const perfect = bd < best.r * 0.3 ? 5 : 0;
          const mult = multOf(s.combo) * fin;
          const pts = (best.pts + perfect) * mult;
          s.combo++;
          s.bestCombo = Math.max(s.bestCombo, s.combo);
          s.points += pts;
          s.lastShot = { x: best.x, y: best.y, id: best.id, pts, kind: best.kind, mult };
        }
        s.targets = s.targets.filter((t) => t !== best);
      } else {
        s.combo = 0;
        s.lastShot = { x: s.cx, y: s.cy, id: 0, pts: 0, kind: '', mult: 1 };
      }
    }
    if (s.tick >= MAX_TICKS) s.over = true;
  },
  done: (s) => s.over,
  score,
  bot(s, skill, rng): InputFrame {
    const react = Math.round(lerp(40, 9, skill));
    const botSpeed = lerp(2.0, 4.2, skill) / 60; // Fadenkreuz-Bewegung je Tick (Bruchteil einer Handbewegung)
    const noise = lerp(0.11, 0.012, skill);
    let best: Target | null = null;
    let bv = -Infinity;
    for (const t of s.targets) {
      if (t.age < react) continue;
      if (t.kind === 'pop' && t.life - t.age < 14) continue;
      const val = t.kind === 'decoy' ? (fooledBy(t.id, skill) ? 30 : -999) : t.pts;
      const d = Math.hypot(t.x - s.cx, t.y - s.cy);
      const v = val - d * 14;
      if (v > bv) {
        bv = v;
        best = t;
      }
    }
    let nx = s.cx;
    let ny = s.cy;
    let fire = false;
    if (best && bv > -200) {
      const d0 = Math.hypot(best.x - s.cx, best.y - s.cy);
      const lag = d0 / botSpeed + 3;
      const p = targetAt(best, Math.min(lag, 50));
      const dx = p.x - s.cx;
      const dy = p.y - s.cy;
      const dd = Math.hypot(dx, dy);
      const step = Math.min(dd, botSpeed * 1.4);
      if (dd > 1e-6) {
        nx = s.cx + (dx / dd) * step;
        ny = s.cy + (dy / dd) * step;
      }
      const tol = best.r * lerp(0.95, 0.55, skill);
      const settled = Math.hypot(p.x - nx, p.y - ny) < tol * 0.8 && step < botSpeed * 0.9 + 0.02;
      fire =
        settled &&
        s.reload === 0 &&
        s.ammo > 0 &&
        !s.prevPd &&
        Math.hypot(best.x + best.vx * 2 - nx, best.y - ny) < best.r * 1.1;
      if (fire) {
        nx += rng.gaussian() * noise;
        ny += rng.gaussian() * noise;
      }
    }
    const lowAmmo = s.ammo > 0 && s.ammo < 3 && s.targets.length === 0 && s.reload === 0;
    return { ...NEUTRAL_INPUT, px: clamp(nx / X_MAX, -1, 1), py: clamp(ny, -1, 1), pd: fire, b: lowAmmo };
  },
  hud: (s) => {
    const fin = phaseOf(s.tick) === 2;
    const m = multOf(s.combo) * (fin ? 2 : 1);
    return {
      left: s.reload > 0 ? 'Lädt nach …' : `Munition ${'●'.repeat(s.ammo)}${'○'.repeat(MAG - s.ammo)}`,
      right: `${score(s)} Pkt`,
      hint: fin
        ? `FINALE ×${m}!`
        : m > 1
          ? `Serie ${s.combo} · ×${m}`
          : s.tick < 150
            ? 'Triff in Serie!'
            : undefined,
    };
  },
};
