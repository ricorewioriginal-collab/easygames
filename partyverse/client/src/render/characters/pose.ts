import type { Style } from './kit';

export type CharacterAnim = 'idle' | 'walk' | 'run' | 'jump' | 'celebrate' | 'lose' | 'roll' | 'cheer' | 'shock' | 'dance' | 'teleportOut' | 'teleportIn' | 'win' | 'point';

/**
 * Pose = Satz von Zahlen, aus dem die Gelenkgruppen gesetzt werden.
 * Konvention (Figur blickt nach +z, Figur-Links = +x):
 *  rx > 0 = nach vorn lehnen, hx > 0 = Kopf nach unten, alx/arx > 0 = Arm nach vorn, alz/arz > 0 = Arm nach außen/oben,
 *  llx/lrx > 0 = Bein nach vorn, lly/lry = Fuß anheben.
 */
export const POSE_KEYS = [
  'x', 'y', 'z', 'rx', 'ry', 'rz', 'sx', 'sy', 'sz', 's',
  'hx', 'hy', 'hz', 'alx', 'alz', 'arx', 'arz', 'llx', 'lrx', 'lly', 'lry',
  'move', 'mouth', 'eyes', 'lid', 'glow',
] as const;
export type PoseKey = (typeof POSE_KEYS)[number];
export type Pose = Record<PoseKey, number>;

export function neutralPose(): Pose {
  const p = {} as Pose;
  for (const k of POSE_KEYS) p[k] = 0;
  p.sx = p.sy = p.sz = p.s = 1;
  p.eyes = 1;
  return p;
}

export function copyPose(to: Pose, from: Pose): Pose {
  for (const k of POSE_KEYS) to[k] = from[k];
  return to;
}

const TAU = Math.PI * 2;
export const wrapAngle = (a: number): number => {
  const r = (((a + Math.PI) % TAU) + TAU) % TAU;
  return r - Math.PI;
};

export function lerpPose(out: Pose, a: Pose, b: Pose, k: number): Pose {
  for (const key of POSE_KEYS) out[key] = a[key] + (b[key] - a[key]) * k;
  out.ry = a.ry + wrapAngle(b.ry - a.ry) * k;
  return out;
}

/** Dauer einmaliger Animationen in Sekunden (nicht aufgeführt = Schleife) */
export const ANIM_DURATION: Partial<Record<CharacterAnim, number>> = {
  jump: 0.9,
  celebrate: 1.6,
  lose: 1.9,
  roll: 1.3,
  cheer: 1.5,
  shock: 1.0,
  teleportOut: 0.85,
  teleportIn: 0.85,
  win: 2.6,
  point: 1.4,
};
export const LOOPING: ReadonlySet<CharacterAnim> = new Set<CharacterAnim>(['idle', 'walk', 'run', 'dance']);

/** Keyframes mit weicher Zwischenstufe */
export function kf(u: number, pts: ReadonlyArray<readonly [number, number]>): number {
  if (u <= pts[0][0]) return pts[0][1];
  const last = pts[pts.length - 1];
  if (u >= last[0]) return last[1];
  for (let i = 1; i < pts.length; i++) {
    if (u <= pts[i][0]) {
      const a = pts[i - 1];
      const b = pts[i];
      const t = (u - a[0]) / (b[0] - a[0]);
      const s = t * t * (3 - 2 * t);
      return a[1] + (b[1] - a[1]) * s;
    }
  }
  return last[1];
}

const sin = Math.sin;
const cos = Math.cos;
const abs = Math.abs;
const PI = Math.PI;

/** Squash & Stretch: y-Streckung s, Volumen bleibt (x/z gegenläufig) */
function squashY(p: Pose, sy: number): void {
  p.sy *= sy;
  const k = 1 / Math.sqrt(Math.max(0.2, sy));
  p.sx *= k;
  p.sz *= k;
}

function idle(p: Pose, t: number, st: Style): void {
  const b = sin((t * TAU) / 2.6);
  const br = st.squash;
  switch (st.idle) {
    case 'bounce': {
      const h = abs(sin(t * 3.4));
      p.y = h * 0.07;
      squashY(p, 1 + 0.07 * cos(t * 3.4) * br);
      p.alz = 0.35 + 0.3 * h;
      p.arz = 0.35 + 0.3 * h;
      p.hz = 0.08 * sin(t * 1.7);
      break;
    }
    case 'heavy':
      squashY(p, 1 + 0.03 * b);
      p.alz = 0.1 + 0.03 * b;
      p.arz = 0.1 + 0.03 * b;
      p.hx = 0.06 + 0.03 * b;
      p.hy = 0.18 * sin(t * 0.45) * (sin(t * 0.21) > 0 ? 1 : 0.3);
      break;
    case 'float':
      p.y = 0.07 * sin(t * 1.8);
      p.alz = 0.25 + 0.12 * sin(t * 1.8 + 1);
      p.arz = 0.25 + 0.12 * sin(t * 1.8 + 2);
      p.alx = 0.15 * sin(t * 1.3);
      p.arx = 0.15 * sin(t * 1.3 + 1.5);
      p.hz = 0.06 * sin(t * 1.1);
      p.rz = 0.03 * sin(t * 0.9);
      squashY(p, 1 + 0.025 * b);
      break;
    case 'hover':
      p.y = 0.08 * sin(t * 1.9);
      p.rz = 0.045 * sin(t * 1.15);
      p.hy = 0.25 * sin(t * 0.6) * (sin(t * 0.33) > 0.2 ? 1 : 0);
      p.alz = 0.18;
      p.arz = 0.18;
      p.alx = 0.1 * sin(t * 1.9 + 1);
      p.arx = 0.1 * sin(t * 1.9 + 2.5);
      p.hx = 0.05 * sin(t * 0.8);
      break;
    case 'jitter': {
      const tap = max0(sin(t * 5.5));
      p.rx = 0.07 + 0.02 * sin(t * 7);
      p.y = abs(sin(t * 5.5)) * 0.02;
      p.llx = tap * 0.28;
      p.lly = tap * 0.06;
      p.alx = 0.25;
      p.arx = 0.25;
      p.alz = 0.3;
      p.arz = 0.3;
      p.hz = 0.1 * sin(t * 2.3);
      p.hy = 0.35 * sin(t * 0.8) * (sin(t * 0.4) > 0 ? 1 : 0.4);
      squashY(p, 1 + 0.025 * b);
      break;
    }
    case 'sniff': {
      const act = sin(t * 0.7) > 0.45 ? 1 : 0;
      p.hx = 0.1 + 0.12 * abs(sin(t * 8.5)) * act;
      p.hy = 0.3 * sin(t * 0.7) * act;
      p.alz = 0.2;
      p.arz = 0.2;
      p.alx = 0.25 + 0.1 * sin(t * 1.3);
      p.arx = 0.25 + 0.1 * sin(t * 1.3 + 1);
      p.rx = 0.05;
      squashY(p, 1 + 0.025 * b);
      break;
    }
    case 'sway':
      p.rz = 0.07 * sin(t * 1.35);
      p.hz = -0.1 * sin(t * 1.35);
      p.alz = 0.25 + 0.1 * sin(t * 1.35);
      p.arz = 0.25 - 0.1 * sin(t * 1.35);
      p.y = 0.015 * sin(t * 2.7);
      squashY(p, 1 + 0.025 * b);
      break;
  }
  p.mouth = 0.0;
}
const max0 = (v: number): number => (v > 0 ? v : 0);

function gait(p: Pose, t: number, st: Style, run: boolean): void {
  const e = run ? 1.55 : 1;
  const f = st.walkF * (run ? st.runMul : 1);
  const ph = t * f * TAU;
  const sw = sin(ph);
  const c = cos(ph);
  const a = st.arms;
  p.move = run ? 1.8 : 1;
  switch (st.gait) {
    case 'hop': {
      const u = sin(ph);
      p.y = u > 0 ? 0.55 * e * u : 0;
      squashY(p, 1 + (0.1 * c - (u < 0 ? 0.15 * -u : 0)) * st.squash * 1.3);
      p.rx = 0.16 * e;
      p.alz = 0.7 + 0.5 * u;
      p.arz = 0.7 + 0.5 * u;
      p.alx = 0.2;
      p.arx = 0.2;
      p.hx = -0.1 * c;
      p.llx = 0.4 * c;
      p.lrx = 0.4 * c;
      p.mouth = u > 0.4 ? 0.5 : 0.1;
      break;
    }
    case 'stomp':
      p.y = -0.05 * abs(sw) * e;
      p.rz = 0.07 * sw * e;
      p.ry = 0.06 * sw;
      p.rx = 0.05 * e;
      p.llx = 0.55 * sw * e;
      p.lrx = -0.55 * sw * e;
      p.lly = max0(c) * 0.16 * e;
      p.lry = max0(-c) * 0.16 * e;
      p.alx = -0.5 * sw * a * e;
      p.arx = 0.5 * sw * a * e;
      p.alz = 0.18;
      p.arz = 0.18;
      p.hx = 0.08 + 0.05 * abs(sw);
      squashY(p, 1 - 0.03 * abs(c) * st.squash);
      break;
    case 'glide':
      p.y = 0.07 * sin(ph * 2) + 0.05 * e;
      p.rx = 0.2 * e;
      p.rz = 0.05 * sw;
      p.alx = 0.55 + 0.2 * sin(ph * 2);
      p.arx = 0.55 + 0.2 * sin(ph * 2 + 1);
      p.alz = 0.35;
      p.arz = 0.35;
      p.hx = -0.12;
      p.hz = 0.07 * sw;
      squashY(p, 1 + 0.04 * sin(ph * 2));
      break;
    case 'sprint':
      p.y = abs(c) * 0.1 * e;
      p.rx = 0.2 * e;
      p.llx = 0.95 * sw * e;
      p.lrx = -0.95 * sw * e;
      p.lly = max0(c) * 0.28 * e;
      p.lry = max0(-c) * 0.28 * e;
      p.alx = -0.9 * sw * a * e;
      p.arx = 0.9 * sw * a * e;
      p.alz = 0.25;
      p.arz = 0.25;
      p.ry = 0.1 * sw;
      p.hx = -0.1;
      squashY(p, 1 + 0.03 * cos(ph * 2) * st.squash);
      p.mouth = run ? 0.4 : 0.1;
      break;
    case 'waddle':
      p.rz = 0.17 * sw * e;
      p.y = 0.04 * abs(sw);
      p.llx = 0.5 * sw * e;
      p.lrx = -0.5 * sw * e;
      p.lly = max0(c) * 0.1;
      p.lry = max0(-c) * 0.1;
      p.alx = 0.3 - 0.35 * sw * a;
      p.arx = 0.3 + 0.35 * sw * a;
      p.alz = 0.25;
      p.arz = 0.25;
      p.hz = -0.1 * sw;
      p.rx = 0.07 * e;
      squashY(p, 1 + 0.03 * cos(ph * 2) * st.squash);
      break;
    case 'slither':
      p.sz *= 1 + 0.12 * sin(ph);
      p.sy *= 1 - 0.05 * sin(ph);
      p.rx = 0.12 * e + 0.1 * sin(ph);
      p.rz = 0.06 * sin(ph * 0.5);
      p.y = 0.03 * abs(sin(ph));
      p.alx = 0.2 + 0.3 * sin(ph);
      p.arx = 0.2 + 0.3 * sin(ph + PI);
      p.alz = 0.3;
      p.arz = 0.3;
      p.hz = 0.08 * sin(ph);
      p.hx = -0.05;
      break;
    case 'skip': {
      const h = abs(sw);
      p.y = 0.2 * h * e;
      p.rz = 0.1 * sw;
      p.alx = 0.7 * sw * a * e;
      p.arx = -0.7 * sw * a * e;
      p.alz = 0.5 + 0.25 * h;
      p.arz = 0.5 + 0.25 * h;
      p.llx = 0.7 * sw * e;
      p.lrx = -0.7 * sw * e;
      p.lly = max0(c) * 0.2;
      p.lry = max0(-c) * 0.2;
      p.hz = 0.12 * c;
      p.rx = 0.08 * e;
      squashY(p, 1 + 0.05 * c * st.squash);
      p.mouth = 0.3;
      break;
    }
    case 'float':
      p.y = 0.07 * sin(ph * 2) + 0.04;
      p.rx = 0.26 * e;
      p.rz = 0.1 * sw;
      p.alx = 0.7 + 0.2 * sin(ph);
      p.arx = 0.7 + 0.2 * sin(ph + 1.8);
      p.alz = 0.45;
      p.arz = 0.45;
      p.hx = -0.15;
      p.hz = -0.08 * sw;
      break;
  }
}

function jump(p: Pose, u: number, st: Style): void {
  const H = st.jumpH;
  const a = Math.min(1, Math.max(0, (u - 0.22) / 0.58));
  p.y = H * 4 * a * (1 - a);
  const sq = kf(u, [[0, 1], [0.16, 0.7], [0.26, 1.22], [0.55, 1.05], [0.78, 0.95], [0.85, 0.68], [0.96, 1.06], [1, 1]]);
  squashY(p, 1 + (sq - 1) * st.squash * 1.2);
  const air = kf(u, [[0, 0], [0.2, 0], [0.3, 1], [0.74, 1], [0.84, 0], [1, 0]]);
  const crouch = kf(u, [[0, 0], [0.16, 1], [0.26, 0], [0.82, 0], [0.86, 1], [1, 0]]);
  p.alz = 0.2 + 2.2 * air - 0.15 * crouch;
  p.arz = p.alz;
  p.alx = -0.5 * crouch + 0.2 * air;
  p.arx = p.alx;
  p.llx = 0.6 * air + 0.4 * crouch;
  p.lrx = 0.6 * air - 0.3 * air + 0.4 * crouch;
  p.lly = 0.2 * air;
  p.lry = 0.2 * air;
  p.rx = 0.15 * crouch - 0.05 * air;
  p.hx = 0.2 * crouch - 0.2 * air;
  p.mouth = 0.7 * air;
  p.move = 0.8;
}

function celebrate(p: Pose, u: number, st: Style): void {
  const s = abs(sin(u * TAU));
  const sg = sin(u * TAU);
  p.y = st.jumpH * 0.6 * s;
  squashY(p, 1 + (0.1 * cos(u * TAU * 2) - 0.1 * (1 - s)) * st.squash);
  const env = kf(u, [[0, 0], [0.08, 1], [0.9, 1], [1, 0]]);
  p.alz = 2.5 * env + 0.3 * sin(u * 50) * env;
  p.arz = 2.5 * env + 0.3 * sin(u * 50 + 1) * env;
  p.hz = 0.15 * sg;
  p.rz = 0.08 * sg;
  p.hx = -0.2 * env;
  p.mouth = 0.9 * env;
  p.llx = 0.35 * s;
  p.lrx = 0.35 * s;
  p.move = 1;
}

function cheer(p: Pose, u: number, st: Style): void {
  const env = kf(u, [[0, 0], [0.1, 1], [0.88, 1], [1, 0]]);
  const ph = u * TAU * 3;
  p.y = abs(sin(ph)) * 0.1 * st.jumpH * 2 * env;
  squashY(p, 1 + 0.05 * cos(ph * 2) * st.squash);
  p.alz = (1.6 + 0.8 * sin(ph)) * env;
  p.arz = (1.6 + 0.8 * sin(ph + PI)) * env;
  p.alx = 0.2 * env;
  p.arx = 0.2 * env;
  p.hx = -0.25 * env;
  p.hz = 0.1 * sin(ph) * env;
  p.mouth = 1 * env;
  p.rx = -0.06 * env;
  p.move = 1;
}

function win(p: Pose, u: number, st: Style): void {
  const a = Math.min(1, Math.max(0, (u - 0.1) / 0.4));
  p.y = st.jumpH * 1.15 * 4 * a * (1 - a);
  p.ry = TAU * kf(u, [[0.12, 0], [0.5, 1]]);
  const crouch = kf(u, [[0, 0], [0.08, 1], [0.14, 0]]);
  const land = kf(u, [[0.5, 0], [0.55, 1], [0.64, 0]]);
  squashY(p, 1 - 0.25 * crouch * st.squash - 0.2 * land * st.squash + 0.14 * kf(u, [[0.14, 0], [0.22, 1], [0.4, 0]]) * st.squash);
  const env = kf(u, [[0.06, 0], [0.18, 1], [0.9, 1], [1, 0]]);
  const pump = sin(u * TAU * 5) * kf(u, [[0.55, 0], [0.65, 1], [0.9, 1], [1, 0]]);
  p.alz = (2.3 + 0.2 * pump) * env;
  p.arz = (2.3 - 0.2 * pump) * env;
  p.alx = 0.3 * env;
  p.arx = 0.3 * env;
  p.hx = -0.3 * env;
  p.rx = -0.1 * kf(u, [[0.5, 0], [0.7, 1], [0.9, 1], [1, 0]]);
  p.y += abs(pump) * 0.06;
  p.mouth = env;
  p.move = 1;
}

function lose(p: Pose, u: number, st: Style): void {
  const env = kf(u, [[0, 0], [0.25, 1], [0.8, 1], [1, 0]]);
  squashY(p, 1 - 0.16 * env * st.squash - 0.04 * sin(u * 14) * env);
  p.hx = 0.6 * env;
  p.rx = 0.22 * env;
  p.rz = 0.05 * sin(u * 9) * env;
  p.alz = 0.05;
  p.arz = 0.05;
  p.alx = -0.2 * env;
  p.arx = -0.2 * env;
  p.lid = 0.45 * env;
  p.mouth = 0.25 * env;
  p.y = -0.03 * env;
  p.hy = 0.35 * sin(u * 6) * env;
  p.move = 0.3;
}

function shock(p: Pose, u: number, st: Style): void {
  const env = kf(u, [[0, 0], [0.08, 1], [0.7, 1], [1, 0]]);
  const jump = kf(u, [[0, 0], [0.1, 1], [0.3, 0.4], [0.42, 0]]);
  p.y = 0.45 * st.jumpH * jump;
  p.z = -0.25 * env;
  p.x = 0.02 * sin(u * 90) * env;
  squashY(p, 1 + (0.25 * kf(u, [[0, 0], [0.08, 1], [0.3, 0.3], [0.42, -0.5], [0.5, 0]])) * st.squash);
  p.rx = -0.22 * env;
  p.alz = 1.1 * env;
  p.arz = 1.1 * env;
  p.alx = 0.8 * env;
  p.arx = 0.8 * env;
  p.hx = -0.1 * env;
  p.eyes = 1 + 0.55 * env;
  p.mouth = 1.1 * env;
  p.move = 1;
}

function roll(p: Pose, u: number, st: Style): void {
  const wind = kf(u, [[0, 0], [0.34, 1], [0.4, 1], [0.48, 0]]);
  const throwK = kf(u, [[0.34, 0], [0.42, 1], [0.6, 1], [0.85, 0]]);
  p.arx = -1.5 * wind + 1.9 * throwK;
  p.arz = 0.6 * wind + 0.2 * throwK;
  p.alz = 0.9 * (wind + throwK * 0.6);
  p.alx = 0.2 * wind;
  p.rx = -0.22 * wind + 0.35 * throwK;
  p.ry = -0.45 * wind + 0.3 * throwK;
  p.hx = -0.1 * wind + 0.12 * throwK;
  squashY(p, 1 - 0.14 * wind * st.squash + 0.1 * throwK * st.squash);
  p.y = 0.12 * st.jumpH * kf(u, [[0.38, 0], [0.5, 1], [0.66, 0]]);
  p.llx = 0.3 * throwK;
  p.lrx = -0.3 * throwK;
  p.mouth = 0.5 * throwK;
  p.move = 1;
}

function point(p: Pose, u: number, st: Style): void {
  const env = kf(u, [[0, 0], [0.2, 1], [0.82, 1], [1, 0]]);
  p.arx = (1.5 + 0.06 * sin(u * 26)) * env;
  p.arz = 0.12 * env;
  p.alz = 0.7 * env;
  p.alx = -0.2 * env;
  p.rx = 0.1 * env;
  p.hx = 0.05 * env;
  p.hy = -0.15 * env;
  p.y = 0.03 * sin(u * 26) * env * st.jumpH;
  p.mouth = 0.2 * env;
  p.move = 0.5;
}

function dance(p: Pose, t: number, st: Style): void {
  const d = st.dance;
  const b = t * 2.1 * d.speed;
  const s = sin(PI * b);
  p.y = 0.11 * d.bounce * abs(s);
  squashY(p, 1 + 0.07 * cos(PI * b * 2) * st.squash * d.bounce);
  p.rz = 0.2 * d.sway * s;
  p.ry = 0.55 * d.spin * sin(PI * b * 0.5) + (d.spin > 1.5 ? t * 1.6 : 0);
  p.alz = 1.7 + 0.8 * sin(PI * b);
  p.arz = 1.7 + 0.8 * sin(PI * b + PI);
  p.alx = 0.4 * sin(PI * b * 0.5);
  p.arx = 0.4 * sin(PI * b * 0.5 + PI);
  p.llx = 0.45 * s;
  p.lrx = -0.45 * s;
  p.lly = max0(cos(PI * b)) * 0.12;
  p.lry = max0(-cos(PI * b)) * 0.12;
  p.hz = -0.25 * d.sway * s;
  p.hx = 0.1 * abs(s);
  p.mouth = 0.5;
  p.move = 1;
}

function teleportOut(p: Pose, u: number): void {
  const k = Math.min(1, Math.max(0, u));
  const e = k * k;
  p.s = Math.max(0.0001, Math.pow(1 - k, 1.4));
  p.ry = TAU * 2.5 * e;
  p.y = 0.9 * e;
  squashY(p, 1 + 1.2 * k * k);
  p.alz = 2.2 * k;
  p.arz = 2.2 * k;
  p.eyes = 1 + 0.5 * k;
  p.mouth = k;
  p.move = 1;
}

function teleportIn(p: Pose, u: number): void {
  const k = Math.min(1, Math.max(0, u));
  const e = (1 - k) * (1 - k);
  // Überschwingen beim Erscheinen
  const grow = kf(k, [[0, 0], [0.55, 1.18], [0.78, 0.94], [1, 1]]);
  p.s = Math.max(0.0001, grow);
  p.ry = -TAU * 2 * e;
  p.y = 0.9 * e;
  squashY(p, 1 + 0.9 * e - 0.2 * kf(k, [[0.6, 0], [0.7, 1], [0.85, 0]]));
  p.alz = 2.2 * (1 - k);
  p.arz = 2.2 * (1 - k);
  p.mouth = 0.6 * (1 - k);
  p.move = 1;
}

/** Berechnet die Zielpose einer Animation zur Zeit t (Sekunden seit Start, bereits mit Tempo multipliziert). */
export function samplePose(out: Pose, anim: CharacterAnim, t: number, st: Style): Pose {
  const p = out;
  for (const k of POSE_KEYS) p[k] = 0;
  p.sx = p.sy = p.sz = p.s = 1;
  p.eyes = 1;
  const dur = ANIM_DURATION[anim];
  const u = dur ? Math.min(1, Math.max(0, t / dur)) : 0;
  switch (anim) {
    case 'idle':
      idle(p, t, st);
      break;
    case 'walk':
      gait(p, t, st, false);
      break;
    case 'run':
      gait(p, t, st, true);
      break;
    case 'jump':
      jump(p, u, st);
      break;
    case 'celebrate':
      celebrate(p, u, st);
      break;
    case 'lose':
      lose(p, u, st);
      break;
    case 'roll':
      roll(p, u, st);
      break;
    case 'cheer':
      cheer(p, u, st);
      break;
    case 'shock':
      shock(p, u, st);
      break;
    case 'dance':
      dance(p, t, st);
      break;
    case 'teleportOut':
      teleportOut(p, u);
      break;
    case 'teleportIn':
      teleportIn(p, u);
      break;
    case 'win':
      win(p, u, st);
      break;
    case 'point':
      point(p, u, st);
      break;
  }
  return p;
}
