/* Tiere und Wesen: Hunde (Blitz), Drache Zündel, Bauernhoftiere, Taschis, digitale Begleiter, Wald-Monster, Ballon Pappnase …
   Alle aus einfachen runden Formen, je 1–3 Meshes, mit kleiner Animation (Hüpfen, Wackeln, Laufen, Flattern). */
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';

export interface Creature { root: THREE.Group; height: number; update(dt: number, speed: number): void; kind: string; dispose(): void; setTint?(on: boolean): void; mood?(m: 'happy' | 'sleep' | 'idle' | 'hit'): void }

const shade = (c: number, f: number): number => {
  const r = Math.min(255, Math.round(((c >> 16) & 255) * f)), g = Math.min(255, Math.round(((c >> 8) & 255) * f)), b = Math.min(255, Math.round((c & 255) * f));
  return (r << 16) | (g << 8) | b;
};
const eyes = (b: GeoBuilder, x: number, y: number, z: number, s: number, white = true) => {
  for (const k of [-1, 1]) {
    if (white) b.sph(k * x, y, z, s, 0xffffff, { sz: 0.6 });
    b.sph(k * x, y, z + s * 0.45, s * 0.6, 0x1a1a22, { sz: 0.5 });
    b.sph(k * x + s * 0.2, y + s * 0.25, z + s * 0.75, s * 0.2, 0xffffff, { detail: 0 });
  }
};

export interface CreatureOpts { color?: number; color2?: number; scale?: number; hat?: number; variant?: number }

/** Baut ein Wesen nach Art. Bewegliche Teile: legs (Beine), wing (Flügel), tail (Schwanz). */
export function makeCreature(kind: string, o: CreatureOpts = {}): Creature {
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  const b = new GeoBuilder(), legsB = new GeoBuilder(), tailB = new GeoBuilder(), wingB = new GeoBuilder();
  const c = o.color ?? 0xc98a4a, c2 = o.color2 ?? 0xffffff;
  let height = 1, legsPivotY = 0, tailPivot: [number, number, number] = [0, 0, 0], wingPivot: [number, number, number] = [0, 0, 0], hop = 0, waddle = 0, fly = 0;
  switch (kind) {
    case 'hund': case 'welpe': {
      const s = kind === 'welpe' ? 0.65 : 1;
      b.sph(0, 0.55 * s, 0, 0.42 * s, c, { sx: 0.8, sz: 1.35 });
      b.sph(0, 0.9 * s, 0.48 * s, 0.32 * s, c);
      b.sph(0, 0.83 * s, 0.76 * s, 0.17 * s, c2, { sz: 1.2 });
      b.sph(0, 0.88 * s, 0.93 * s, 0.06 * s, 0x222222);
      eyes(b, 0.13 * s, 1.0 * s, 0.72 * s, 0.07 * s);
      for (const k of [-1, 1]) b.sph(k * 0.25 * s, 1.02 * s, 0.4 * s, 0.13 * s, shade(c, 0.75), { sy: 1.8, sz: 0.5, rz: k * 0.5 });
      if (o.hat !== undefined) { b.cyl(0, 1.12 * s, 0.45 * s, 0.24 * s, 0.24 * s, 0.1 * s, o.hat, 10); b.box(0, 1.17 * s, 0.68 * s, 0.3 * s, 0.03 * s, 0.18 * s, o.hat); b.sph(0, 1.25 * s, 0.6 * s, 0.05 * s, 0xffd23f); }
      for (const [x, z] of [[-0.18, 0.3], [0.18, 0.3], [-0.18, -0.32], [0.18, -0.32]]) legsB.cyl(x * s, 0, z * s, 0.08 * s, 0.09 * s, 0.4 * s, shade(c, 0.9), 6);
      tailB.cyl(0, 0, 0, 0.05 * s, 0.07 * s, 0.38 * s, c, 6, { rx: -0.9 });
      tailPivot = [0, 0.65 * s, -0.5 * s]; height = 1.2 * s; break;
    }
    case 'drache': case 'babydrache': case 'reitdrache': {
      const s = kind === 'babydrache' ? 0.6 : kind === 'reitdrache' ? 2.4 : 1;
      b.sph(0, 0.6 * s, 0, 0.5 * s, c, { sy: 0.95, sz: 1.2 });
      b.sph(0, 0.55 * s, 0.25 * s, 0.33 * s, c2, { sy: 0.9, sz: 0.6 });
      b.sph(0, 1.15 * s, 0.35 * s, 0.38 * s, c);
      b.sph(0, 1.05 * s, 0.68 * s, 0.2 * s, shade(c, 1.1), { sz: 1.1 });
      for (const k of [-1, 1]) { b.sph(k * 0.07 * s, 1.1 * s, 0.86 * s, 0.03 * s, 0x222222); b.cone(k * 0.18 * s, 1.42 * s, 0.25 * s, 0.07 * s, 0.25 * s, 0xfff1c0, 5, { rz: -k * 0.3, rx: -0.4 }); }
      eyes(b, 0.15 * s, 1.25 * s, 0.62 * s, 0.09 * s);
      for (let i = 0; i < 4; i++) b.cone(0, (1.0 - i * 0.18) * s, (-0.1 - i * 0.18) * s, 0.06 * s, 0.18 * s, 0xff8a1f, 4, { rx: -0.5 });
      for (const [x, z] of [[-0.22, 0.2], [0.22, 0.2], [-0.22, -0.25], [0.22, -0.25]]) legsB.cyl(x * s, 0, z * s, 0.1 * s, 0.12 * s, 0.32 * s, shade(c, 0.85), 6);
      for (const k of [-1, 1]) wingB.box(k * 0.42 * s, 0, 0, 0.75 * s, 0.05 * s, 0.5 * s, shade(c, 0.8), { rz: k * 0.25 });
      tailB.cone(0, 0, 0, 0.14 * s, 0.75 * s, c, 6, { rx: -2.1 });
      wingPivot = [0, 0.95 * s, -0.05 * s]; tailPivot = [0, 0.5 * s, -0.5 * s]; height = 1.5 * s; break;
    }
    case 'kuh': case 'schaf': case 'schwein': case 'ziege': case 'pferd': case 'esel': {
      const col = kind === 'kuh' ? 0xffffff : kind === 'schaf' ? 0xf4f4f0 : kind === 'schwein' ? 0xffb3c6 : kind === 'ziege' ? 0xe8dcc8 : kind === 'pferd' ? 0x9a5a2a : 0x9aa0a8;
      const L = kind === 'pferd' ? 1.25 : kind === 'esel' ? 1.05 : 0.9, s = kind === 'schwein' ? 0.7 : 1;
      if (kind === 'schaf') { for (let i = 0; i < 7; i++) b.sph((i % 2 - 0.5) * 0.3, 0.75 + (i % 3) * 0.08, -0.35 + i * 0.12, 0.35, col); }
      else b.sph(0, 0.75 * L * s, 0, 0.45 * s, col, { sx: 0.85, sz: 1.5 });
      if (kind === 'kuh') for (const [x, y, z] of [[0.3, 0.85, 0.1], [-0.25, 0.7, -0.3], [0.1, 1.0, -0.2]]) b.sph(x, y, z, 0.18, 0x222222, { sz: 0.6 });
      const hy = kind === 'pferd' ? 1.45 : kind === 'schwein' ? 0.6 : 1.0;
      b.sph(0, hy * L * (kind === 'pferd' ? 0.9 : 1) * s, 0.62 * s, 0.26 * s, kind === 'schaf' ? 0x333333 : col, { sz: 1.4 });
      if (kind === 'schwein') { b.cyl(0, 0.52, 0.95, 0.12, 0.12, 0.08, 0xff8fb0, 10, { rx: Math.PI / 2 }); }
      if (kind === 'kuh' || kind === 'ziege') for (const k of [-1, 1]) b.cone(k * 0.15, hy * L + 0.15, 0.55, 0.05, 0.2, 0xfff1c0, 5);
      if (kind === 'pferd' || kind === 'esel') { b.box(0, hy * L * 0.9 + 0.05, 0.35, 0.08, 0.5, 0.5, kind === 'pferd' ? 0x3a2a1a : 0x555555); for (const k of [-1, 1]) b.cone(k * 0.12, hy * L * 0.9 + 0.2, 0.62, 0.05, kind === 'esel' ? 0.35 : 0.18, col, 5); }
      eyes(b, 0.13, hy * L * (kind === 'pferd' ? 0.9 : 1) * s + 0.08, 0.82 * s, 0.06);
      for (const [x, z] of [[-0.22, 0.4], [0.22, 0.4], [-0.22, -0.4], [0.22, -0.4]]) legsB.cyl(x, 0, z, 0.08, 0.09, 0.55 * L * s, kind === 'kuh' ? 0xffffff : shade(col, 0.85), 6);
      tailB.cyl(0, 0, 0, 0.04, 0.06, 0.45, kind === 'pferd' ? 0x3a2a1a : shade(col, 0.8), 5, { rx: -2.6 });
      tailPivot = [0, 0.95 * L * s, -0.65 * s]; height = 1.3 * L; break;
    }
    case 'huhn': case 'ente': case 'moewe': case 'eule': case 'vogel': {
      const col = kind === 'huhn' ? 0xffffff : kind === 'ente' ? 0xffd23f : kind === 'moewe' ? 0xf4f4f8 : kind === 'eule' ? 0x9a7a5a : c;
      b.sph(0, 0.3, 0, 0.25, col, { sz: 1.2 }); b.sph(0, 0.55, 0.15, 0.17, col);
      b.cone(0, 0.5, 0.33, 0.06, 0.14, 0xff9a3a, 5, { rx: Math.PI / 2 });
      if (kind === 'huhn') b.sph(0, 0.74, 0.13, 0.07, 0xe8453c, { sy: 1.4 });
      eyes(b, 0.08, 0.6, 0.28, 0.04, false);
      for (const k of [-1, 1]) wingB.sph(k * 0.22, 0, 0, 0.12, shade(col, 0.88), { sy: 0.6, sz: 1.5 });
      for (const k of [-1, 1]) legsB.cyl(k * 0.08, 0, 0, 0.02, 0.02, 0.12, 0xff9a3a, 4);
      wingPivot = [0, 0.32, -0.02]; height = 0.75; waddle = 1; break;
    }
    case 'katze': case 'hase': case 'eichhoernchen': case 'fuchs': case 'baer': case 'loewe': case 'erdmaennchen': case 'igel': case 'reh': {
      const col = o.color ?? ({ katze: 0x8a8a8a, hase: 0xffffff, eichhoernchen: 0xc0602a, fuchs: 0xff8a1f, baer: 0x8a5a2a, loewe: 0xe8b04a, erdmaennchen: 0xd9b07a, igel: 0x6b4a2a, reh: 0xb07a45 } as Record<string, number>)[kind];
      const s = kind === 'baer' ? 1.6 : kind === 'loewe' ? 1.5 : kind === 'reh' ? 1.4 : kind === 'erdmaennchen' ? 0.7 : kind === 'igel' ? 0.6 : 0.8;
      const upright = kind === 'erdmaennchen' || kind === 'eichhoernchen';
      b.sph(0, 0.4 * s, 0, 0.32 * s, col, { sz: upright ? 0.9 : 1.3, sy: upright ? 1.4 : 1 });
      b.sph(0, (upright ? 0.95 : 0.65) * s, (upright ? 0.05 : 0.35) * s, 0.24 * s, col);
      if (kind === 'loewe') b.sph(0, 0.66 * s, 0.32 * s, 0.36 * s, 0xb06a2a, { sz: 0.7 });
      if (kind === 'igel') for (let i = 0; i < 14; i++) { const a = i * 0.9; b.cone(Math.sin(a) * 0.2 * s, 0.5 * s, Math.cos(a) * 0.25 * s - 0.05, 0.05 * s, 0.25 * s, 0x3a2a1a, 4, { rx: -0.6 + Math.cos(a) * 0.4, rz: Math.sin(a) * 0.6 }); }
      const ey = (upright ? 1.0 : 0.72) * s, ez = (upright ? 0.25 : 0.55) * s;
      eyes(b, 0.09 * s, ey, ez, 0.06 * s);
      b.sph(0, ey - 0.08 * s, ez + 0.04 * s, 0.04 * s, 0x222222);
      const earH = kind === 'hase' ? 0.42 : 0.16;
      for (const k of [-1, 1]) b.sph(k * 0.12 * s, ey + 0.2 * s, ez - 0.2 * s, 0.07 * s, col, { sy: earH / 0.07 / 1.6 });
      if (kind === 'reh') for (const k of [-1, 1]) b.cyl(k * 0.1 * s, ey + 0.2 * s, ez - 0.25 * s, 0.03, 0.03, 0.3 * s, 0x6b4a2a, 4, { rz: k * 0.4 });
      for (const [x, z] of [[-0.14, 0.18], [0.14, 0.18], [-0.14, -0.2], [0.14, -0.2]]) legsB.cyl(x * s, 0, z * s, 0.06 * s, 0.07 * s, (kind === 'reh' ? 0.5 : 0.22) * s, shade(col, 0.9), 5);
      if (kind === 'eichhoernchen' || kind === 'fuchs') tailB.sph(0, 0.25 * s, -0.1 * s, 0.2 * s, kind === 'fuchs' ? col : 0xd9702a, { sy: 1.8, sz: 0.8 });
      else tailB.cyl(0, 0, 0, 0.03 * s, 0.05 * s, 0.3 * s, col, 5, { rx: -2.3 });
      tailPivot = [0, 0.4 * s, -0.35 * s]; height = (upright ? 1.25 : 0.95) * s; hop = kind === 'hase' ? 1 : 0; break;
    }
    case 'pappnase': {
      b.sph(0, 0, 0, 0.42, 0xff8a1f, { sy: 1.15 });
      b.sph(-0.13, 0.08, 0.36, 0.08, 0xffffff); b.sph(0.13, 0.08, 0.36, 0.08, 0xffffff);
      b.sph(-0.13, 0.08, 0.42, 0.045, 0x222222); b.sph(0.13, 0.08, 0.42, 0.045, 0x222222);
      b.sph(0, -0.04, 0.42, 0.09, 0xe8453c);
      for (let i = -2; i <= 2; i++) b.sph(i * 0.05, -0.18 + Math.abs(i) * 0.02, 0.38, 0.025, 0x7a2a2a, { detail: 0 });
      b.cone(0, -0.53, 0, 0.06, 0.08, 0xff8a1f, 5);
      height = 1; fly = 1; break;
    }
    case 'taschi': {
      // freundliches Taschenwesen: Variante bestimmt Form
      const v = o.variant ?? 0, s = o.scale ?? 1;
      b.sph(0, 0.42 * s, 0, 0.38 * s, c, { sy: 0.95 });
      b.sph(0, 0.35 * s, 0.22 * s, 0.24 * s, c2, { sz: 0.5 });
      eyes(b, 0.13 * s, 0.55 * s, 0.32 * s, 0.08 * s);
      if (v % 4 === 0) for (const k of [-1, 1]) b.cone(k * 0.2 * s, 0.75 * s, 0, 0.09 * s, 0.32 * s, shade(c, 0.8), 4, { rz: -k * 0.3 });
      if (v % 4 === 1) b.sph(0, 0.85 * s, 0, 0.12 * s, 0xff6b5b);
      if (v % 4 === 2) for (const k of [-1, 1]) wingB.sph(k * 0.36 * s, 0, 0, 0.2 * s, shade(c, 0.85), { sy: 0.4, sz: 1.2 });
      if (v % 4 === 3) b.cone(0, 0.75 * s, 0.05 * s, 0.14 * s, 0.4 * s, 0x6fdc6a, 5);
      for (const k of [-1, 1]) legsB.sph(k * 0.16 * s, 0.06 * s, 0.05 * s, 0.1 * s, shade(c, 0.85), { sy: 0.7, sz: 1.3 });
      tailB.cone(0, 0, 0, 0.07 * s, 0.32 * s, shade(c, 0.9), 5, { rx: -2.0 });
      wingPivot = [0, 0.55 * s, 0]; tailPivot = [0, 0.3 * s, -0.32 * s]; height = 0.95 * s; hop = 1; break;
    }
    case 'datenwesen': {
      const s = o.scale ?? 1;
      b.box(-0.3 * s, 0.1 * s, -0.3 * s, 0.6 * s, 0.6 * s, 0.6 * s, c);
      b.box(-0.22 * s, 0.75 * s, -0.2 * s, 0.44 * s, 0.1 * s, 0.4 * s, c2);
      for (const k of [-1, 1]) { b.box(k * 0.13 * s - 0.05 * s, 0.4 * s, 0.31 * s, 0.1 * s, 0.14 * s, 0.02 * s, 0x111133); b.box(k * 0.13 * s - 0.02 * s, 0.46 * s, 0.33 * s, 0.03 * s, 0.03 * s, 0.01 * s, 0xffffff); }
      b.cyl(0, 0.85 * s, 0, 0.02 * s, 0.02 * s, 0.25 * s, 0xcccccc, 4); b.sph(0, 1.12 * s, 0, 0.07 * s, c2);
      for (const k of [-1, 1]) wingB.box(k * 0.42 * s, 0, 0, 0.25 * s, 0.03 * s, 0.35 * s, shade(c, 1.2), { rz: k * 0.2 });
      wingPivot = [0, 0.55 * s, 0]; height = 1.1 * s; fly = (o.variant ?? 0) % 2; hop = 1 - fly; break;
    }
    case 'glibbi': case 'stachli': case 'pilzling': case 'wichtel': case 'dornenwolf': case 'frostgeist': case 'tintenklecks': case 'kaeferbot': case 'schatten': case 'moosling': case 'lavadrache': {
      const s = o.scale ?? 1;
      const col = ({ glibbi: 0x6bd66b, stachli: 0xff9a3a, pilzling: 0xe0382b, wichtel: 0x3a2a5a, dornenwolf: 0x5a6a4a, frostgeist: 0xbfe9ff, tintenklecks: 0x2a2a3a, kaeferbot: 0x6a7a8a, schatten: 0x4a3a7a, moosling: 0x7fbf5a, lavadrache: 0xd94a2a } as Record<string, number>)[kind];
      if (kind === 'pilzling') { b.cyl(0, 0, 0, 0.3 * s, 0.36 * s, 0.55 * s, 0xf4e6c8, 8); b.sph(0, 0.72 * s, 0, 0.62 * s, col, { sy: 0.62 }); for (const [x, z] of [[-0.3, 0.2], [0.28, 0.3], [0, -0.3]]) b.sph(x * s, 0.95 * s, z * s, 0.12 * s, 0xffffff); eyes(b, 0.13 * s, 0.35 * s, 0.3 * s, 0.09 * s); }
      else if (kind === 'dornenwolf' || kind === 'lavadrache') {
        b.sph(0, 0.6 * s, 0, 0.45 * s, col, { sz: 1.4, sx: 0.85 }); b.sph(0, 0.95 * s, 0.55 * s, 0.3 * s, col);
        for (let i = 0; i < 5; i++) b.cone(0, (0.95 - i * 0.02) * s, (0.2 - i * 0.22) * s, 0.08 * s, 0.28 * s, kind === 'lavadrache' ? 0xffc83d : 0x2f4a2a, 4, { rx: -0.3 });
        eyes(b, 0.12 * s, 1.05 * s, 0.78 * s, 0.07 * s);
        for (const [x, z] of [[-0.2, 0.35], [0.2, 0.35], [-0.2, -0.35], [0.2, -0.35]]) legsB.cyl(x * s, 0, z * s, 0.08 * s, 0.1 * s, 0.4 * s, shade(col, 0.8), 6);
        tailB.cone(0, 0, 0, 0.1 * s, 0.6 * s, col, 5, { rx: -2.2 }); tailPivot = [0, 0.6 * s, -0.6 * s];
      } else if (kind === 'frostgeist' || kind === 'schatten') {
        b.sph(0, 0.75 * s, 0, 0.45 * s, col, { sy: 1.2 }); b.cone(0, 0.0, 0, 0.42 * s, 0.6 * s, col, 8, { rx: Math.PI });
        eyes(b, 0.14 * s, 0.85 * s, 0.38 * s, 0.09 * s); fly = 1;
      } else if (kind === 'kaeferbot') {
        b.sph(0, 0.45 * s, 0, 0.42 * s, col, { sy: 0.7, sz: 1.2 }); b.box(0, 0.6 * s, 0, 0.04 * s, 0.05 * s, 0.9 * s, 0x222222);
        eyes(b, 0.15 * s, 0.55 * s, 0.45 * s, 0.09 * s);
        for (let i = 0; i < 3; i++) for (const k of [-1, 1]) legsB.cyl(k * 0.38 * s, 0, (i - 1) * 0.28 * s, 0.03 * s, 0.03 * s, 0.35 * s, 0x333333, 4, { rz: k * 0.6 });
      } else {
        // Glibbi, Stachli, Wichtel, Tintenklecks, Moosling: Kugelwesen
        b.sph(0, 0.5 * s, 0, 0.55 * s, col, { sy: 0.85 });
        if (kind === 'stachli') for (let i = 0; i < 10; i++) { const a = i * 0.63; b.cone(Math.sin(a) * 0.38 * s, 0.75 * s + (i % 3) * 0.05, Math.cos(a) * 0.38 * s - 0.1 * s, 0.1 * s, 0.38 * s, 0xc0541a, 5, { rx: Math.cos(a) * 0.5, rz: -Math.sin(a) * 0.5 }); }
        if (kind === 'wichtel') for (const k of [-1, 1]) b.cone(k * 0.2 * s, 0.95 * s, 0, 0.12 * s, 0.45 * s, col, 4);
        if (kind === 'moosling') for (let i = 0; i < 6; i++) b.sph(Math.sin(i) * 0.3 * s, 0.92 * s, Math.cos(i) * 0.25 * s, 0.14 * s, 0x4f9a3a);
        if (kind === 'tintenklecks') for (let i = 0; i < 6; i++) b.sph(Math.sin(i) * 0.5 * s, 0.1 * s, Math.cos(i) * 0.5 * s, 0.16 * s, col, { sy: 0.5 });
        eyes(b, 0.18 * s, 0.62 * s, 0.42 * s, 0.11 * s, kind !== 'wichtel');
        if (kind === 'wichtel') for (const k of [-1, 1]) b.sph(k * 0.18 * s, 0.62 * s, 0.45 * s, 0.09 * s, 0xffe14a);
        hop = 1;
      }
      height = 1.1 * s; break;
    }
    case 'boss': {
      const s = o.scale ?? 3;
      b.sph(0, 1.0 * s, 0, 0.8 * s, c, { sy: 1.1 });
      b.sph(0, 1.9 * s, 0.1 * s, 0.5 * s, shade(c, 1.15));
      eyes(b, 0.2 * s, 2.0 * s, 0.5 * s, 0.13 * s);
      b.sph(0, 1.7 * s, 0.52 * s, 0.12 * s, 0x2a1a3a, { sx: 2.2, sy: 0.6 });
      for (const k of [-1, 1]) { b.sph(k * 0.95 * s, 1.2 * s, 0, 0.35 * s, shade(c, 0.85)); b.sph(k * 1.05 * s, 0.75 * s, 0.1 * s, 0.25 * s, shade(c, 0.75)); }
      for (let i = 0; i < 5; i++) b.cone((i - 2) * 0.2 * s, 2.3 * s, 0, 0.1 * s, 0.4 * s, c2, 5);
      for (const k of [-1, 1]) legsB.cyl(k * 0.4 * s, 0, 0, 0.25 * s, 0.3 * s, 0.6 * s, shade(c, 0.7), 8);
      height = 2.6 * s; break;
    }
    case 'roboter': {
      const s = o.scale ?? 1;
      b.rbox(-0.32 * s + 0.32 * s, 0.5 * s, 0, 0.62 * s, 0.6 * s, 0.45 * s, c);
      b.rbox(0, 1.12 * s, 0, 0.5 * s, 0.4 * s, 0.42 * s, shade(c, 1.15));
      for (const k of [-1, 1]) b.sph(k * 0.12 * s, 1.3 * s, 0.22 * s, 0.07 * s, 0x7fd8ff);
      b.cyl(0, 1.52 * s, 0, 0.02 * s, 0.02 * s, 0.2 * s, 0x999999, 4); b.sph(0, 1.74 * s, 0, 0.06 * s, 0xff6b5b);
      for (const k of [-1, 1]) legsB.cyl(k * 0.15 * s, 0, 0, 0.08 * s, 0.1 * s, 0.5 * s, 0x777777, 6);
      height = 1.8 * s; break;
    }
    case 'qualle': {
      b.sph(0, 0.6, 0, 0.4, c, { sy: 0.7 });
      for (let i = 0; i < 6; i++) { const a = i; tailB.cyl(Math.sin(a) * 0.2, -0.6, Math.cos(a) * 0.2, 0.03, 0.03, 0.6, c, 4); }
      tailPivot = [0, 0.5, 0]; fly = 1; height = 1; break;
    }
    case 'fisch': {
      b.sph(0, 0, 0, 0.3, c, { sz: 1.6, sx: 0.6 }); b.cone(0, 0, -0.5, 0.22, 0.3, shade(c, 0.85), 4, { rx: -Math.PI / 2 }); eyes(b, 0.12, 0.05, 0.3, 0.05);
      fly = 1; height = 0.6; break;
    }
    default: b.sph(0, 0.5, 0, 0.5, c); height = 1;
  }
  const mat = mats().vc;
  const m = b.mesh(mat, true); body.add(m);
  const meshes: THREE.Mesh[] = [m];
  const legs = legsB.empty ? null : legsB.mesh(mat, true);
  if (legs) { body.add(legs); legs.position.y = legsPivotY; meshes.push(legs); }
  const tail = tailB.empty ? null : tailB.mesh(mat, true);
  if (tail) { tail.position.set(...tailPivot); body.add(tail); meshes.push(tail); }
  const wing = wingB.empty ? null : wingB.mesh(mat, true);
  if (wing) { wing.position.set(...wingPivot); body.add(wing); meshes.push(wing); }
  if (o.scale && kind !== 'taschi' && kind !== 'datenwesen' && kind !== 'boss' && kind !== 'roboter' && !['glibbi', 'stachli', 'pilzling', 'wichtel', 'dornenwolf', 'frostgeist', 'tintenklecks', 'kaeferbot', 'schatten', 'moosling', 'lavadrache'].includes(kind)) { root.scale.setScalar(o.scale); height *= o.scale; }
  let t = Math.random() * 10, phase = 0, state: 'happy' | 'sleep' | 'idle' | 'hit' = 'idle', hitT = 0;
  return {
    root, height, kind,
    update(dt, speed) {
      t += dt; phase += dt * (2 + speed * 3);
      const moving = speed > 0.2;
      body.position.y = fly ? 0.15 + Math.sin(t * 2.2) * 0.12 : hop && moving ? Math.abs(Math.sin(phase * 1.4)) * 0.25 : state === 'happy' ? Math.abs(Math.sin(t * 9)) * 0.15 : 0;
      if (waddle && moving) body.rotation.z = Math.sin(phase * 2) * 0.12; else body.rotation.z = 0;
      if (legs) { const sw = moving ? Math.sin(phase * 2) * 0.12 : 0; legs.position.y = legsPivotY + Math.abs(sw) * 0.3; legs.rotation.x = sw; }
      if (tail) tail.rotation.y = Math.sin(t * (state === 'happy' ? 18 : 5)) * (state === 'happy' ? 0.7 : 0.3);
      if (wing) { const f = fly || kind.includes('drache') ? Math.sin(t * (moving ? 12 : 4)) * 0.35 : Math.sin(t * 3) * 0.08; wing.rotation.z = f; }
      if (state === 'sleep') { body.rotation.x = 0; body.scale.y = 0.92 + Math.sin(t * 1.5) * 0.03; } else body.scale.y = 1;
      if (state === 'hit') { hitT -= dt; body.rotation.x = -0.4 * Math.max(0, hitT * 3); if (hitT <= 0) state = 'idle'; }
    },
    mood(mm) { state = mm; if (mm === 'hit') hitT = 0.3; },
    dispose() { for (const x of meshes) x.geometry.dispose(); root.parent?.remove(root); }
  };
}
