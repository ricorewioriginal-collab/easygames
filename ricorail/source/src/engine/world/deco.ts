// Ausstattung je Chunk: Empfangsgebäude, Ladestellen, Szenerie aus dem Netz und prozedurale Bäume/Häuser.
import type { CargoType, SceneryDef } from '../../railway/schema';
import { C, type CB } from './chunk';
import { CH } from './ctx';
import { mix, rgb, type RGB } from './geo';
import { hash2, rng } from './noise';

type Style = 'village' | 'town' | 'city' | 'neon' | 'alpine' | 'harbour';
const P = {
  walls: { village: [0xe6dcc6, 0xd9c7a5, 0xc98f6a, 0xf0e8d8], town: [0xd0c8bc, 0xb8a58a, 0xe2d6c2, 0xc4a68a], city: [0x9aa3ad, 0x7f8890, 0xc4c8cc, 0xa89f94],
    neon: [0x22242e, 0x2b2440, 0x1d2a33, 0x302a3a], alpine: [0xf0ece2, 0xe8e0d0, 0x8a5a34], harbour: [0x9a3a2e, 0x3d6f8f, 0xc9b98f, 0xb05a3a] } as Record<Style, number[]>,
  roofs: { village: [0x9b3b2a, 0x5a4038, 0x8a3324], town: [0x7a3326, 0x555a60, 0x6a3a2a], city: [0x555a60, 0x44484c], neon: [0x18181f], alpine: [0x4b3a2e, 0x5a4636], harbour: [0x4a4f57, 0x6a3a2a] } as Record<Style, number[]>,
};
const NEON = [rgb(0x19f0ff), rgb(0xff3df2), rgb(0xffe23d), rgb(0x7cff4f)];
const WIN = rgb(0xffd890), WIN_CITY = rgb(0xbfe0ff);
const T = {
  trunk: rgb(0x5a4030), con: rgb(0x2f5a35), conW: rgb(0x3f6048), dec: { spring: [rgb(0x7cbf4a), rgb(0x8fcf5a)], summer: [rgb(0x3f7a2e), rgb(0x4d8a34)], autumn: [rgb(0xc8742a), rgb(0xd8a02c), rgb(0x9a3a1e), rgb(0x6f8a2e)], winter: [rgb(0x6d6259)] },
  skin: [rgb(0xe8c4a0), rgb(0xb07a50), rgb(0x6a4630)], cloth: [rgb(0x2a4a8a), rgb(0x8a2a2a), rgb(0x2a6a3a), rgb(0x444444), rgb(0xc8a030), rgb(0x6a3a8a), rgb(0xdddddd)],
  steel: rgb(0xb8bcc0), cont: [rgb(0xc0392b), rgb(0x2e6fa8), rgb(0x2e8a4a), rgb(0xd88a1a), rgb(0x7a7a7a)], wood: rgb(0x8a6040), stone: rgb(0x9a9690), crane: rgb(0xe0b020),
};
const pick = <X>(a: X[], r: () => number) => a[Math.floor(r() * a.length) % a.length];

/** Ausschmückung in kleinen Schritten (yield = Rest im nächsten Bild), damit es auf Handys nicht ruckelt */
export function* decorate(b: CB): Generator<void, void, void> {
  const ctx = b.ctx, key = b.chunk.key;
  for (const bl of ctx.blds.get(key) ?? []) stationBuilding(b, bl);
  yield;
  for (const r of ctx.runs.get(key) ?? []) {
    const inds = ctx.inds.get(r.t); if (!inds) continue;
    const t = ctx.idx.tracks[r.t], sA = t.cs[r.i0], sB = t.cs[r.i1 + 1];
    for (const ind of inds) { const m = (ind.s0 + ind.s1) / 2; if (m >= sA && m < sB) industry(b, r.t, ind.s0, ind.s1, ind.cargo); }
  }
  for (const s of ctx.scen.get(key) ?? []) scenery(b, s);
  yield;
  yield* procedural(b);
}

// ------------------------------------------------------------------ Gebäude
function style(b: CB): Style { return (b.ctx.net.def.theme.buildings ?? 'town') as Style; }

/** Fensterband auf einer Fassade (selbstleuchtend) */
function windows(b: CB, x: number, z: number, dx: number, dz: number, fx: number, fz: number, half: number, off: number, y0: number, H: number, floorH: number, col: RGB) {
  const cx = x + fx * (off + 0.05), cz = z + fz * (off + 0.05);
  for (let y = y0 + floorH * 0.35; y + floorH * 0.35 < y0 + H; y += floorH) {
    b.glow.quad([cx - dx * half, y, cz - dz * half], [cx + dx * half, y, cz + dz * half], [cx + dx * half, y + floorH * 0.35, cz + dz * half], [cx - dx * half, y + floorH * 0.35, cz - dz * half], col, fx, 0, fz);
  }
}

/** Haus/Block mit Grundriss L×W (Längsrichtung dx,dz) */
export function house(b: CB, x: number, z: number, dx: number, dz: number, st: Style, r: () => number, L?: number, W?: number, H?: number) {
  const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  const snow = b.winter;
  let wall = rgb(pick(P.walls[st], r)), roof = rgb(pick(P.roofs[st], r));
  if (snow && st !== 'city' && st !== 'neon') roof = mix(roof, C.snow, 0.75);
  let rh = 0, flat = false, fh = 3;
  switch (st) {
    case 'village': L ??= 9 + r() * 4; W ??= 7 + r() * 2; H ??= 5 + r() * 1.5; rh = 4; break;
    case 'alpine': L ??= 11 + r() * 4; W ??= 9 + r() * 2; H ??= 5.5 + r() * 2; rh = 2.6; break;
    case 'town': L ??= 12 + r() * 8; W ??= 9 + r() * 3; H ??= 8 + r() * 5; rh = 3.5; break;
    case 'harbour': L ??= 20 + r() * 20; W ??= 12 + r() * 6; H ??= 7 + r() * 4; rh = 2; break;
    case 'city': L ??= 18 + r() * 14; W ??= 14 + r() * 8; H ??= 15 + r() * 35; flat = true; fh = 3.5; break;
    case 'neon': L ??= 16 + r() * 14; W ??= 14 + r() * 10; H ??= 20 + r() * 70; flat = true; fh = 3.5; break;
  }
  const rad = Math.hypot(L, W) / 2;
  if (!b.free(x, z, rad)) return;
  b.take(x, z, rad);
  const gy = Math.min(b.H(x - dx * L / 2, z - dz * L / 2), b.H(x + dx * L / 2, z + dz * L / 2), b.H(x, z)) - 1.5;
  const top = b.H(x, z) + H;
  b.st.box(x, gy, z, dx, dz, L, W, top - gy, wall, flat ? roof : wall);
  if (!flat) {
    const ov = st === 'alpine' ? 1.2 : 0.4;
    b.st.roof(x, top, z, dx, dz, L + ov * 2, W + ov * 2, rh, roof, wall);
  }
  const nx = -dz, nz = dx;
  if (st === 'neon') {
    // Leuchtbänder auf allen vier Seiten
    const c = pick(NEON, r), step = 6 + Math.floor(r() * 3) * 3;
    const faces = [[nx, nz, L / 2, W / 2, dx, dz], [-nx, -nz, L / 2, W / 2, dx, dz], [dx, dz, W / 2, L / 2, nx, nz], [-dx, -dz, W / 2, L / 2, nx, nz]];
    for (let y = gy + 6; y < top - 1; y += step) for (const [fx, fz, half, off, ax, az] of faces) {
      const cx = x + fx * (off + 0.06), cz = z + fz * (off + 0.06);
      b.glow.quad([cx - ax * half, y, cz - az * half], [cx + ax * half, y, cz + az * half], [cx + ax * half, y + 0.5, cz + az * half], [cx - ax * half, y + 0.5, cz - az * half], c, fx, 0, fz);
    }
    b.glow.box(x, top, z, dx, dz, Math.min(6, L * 0.3), Math.min(6, W * 0.3), 1.2, pick(NEON, r));
    return;
  }
  const wc = st === 'city' ? WIN_CITY : WIN;
  const half = L / 2 - 1.2;
  if (half > 0.5) {
    windows(b, x, z, dx, dz, nx, nz, half, W / 2, b.H(x, z), H, fh, wc);
    windows(b, x, z, dx, dz, -nx, -nz, half, W / 2, b.H(x, z), H, fh, wc);
  }
}

function stationBuilding(b: CB, bl: { st: { id: string; name: string }; x: number; y: number; z: number; dx: number; dz: number; fx: number; fz: number; big: boolean }) {
  const st = style(b), r = rng(hash2(bl.x | 0, bl.z | 0, 5) * 4294967296);
  const L = bl.big ? 32 : 16, W = bl.big ? 12 : 9, H = bl.big ? 9 : 6;
  b.take(bl.x, bl.z, Math.hypot(L, W) / 2 + 2);
  const gy = Math.min(bl.y - 1.0, b.H(bl.x, bl.z)) - 0.5, floor = bl.y + 0.76;
  const wall = rgb(st === 'neon' ? 0x2a2c3a : st === 'city' ? 0xb0b4b8 : 0xd8c8a8), roof = b.winter && st !== 'neon' ? C.snow : rgb(st === 'neon' ? 0x18181f : 0x7a3326);
  b.st.box(bl.x, gy, bl.z, bl.dx, bl.dz, L, W, floor + H - gy, wall, roof);
  if (st !== 'neon' && st !== 'city') b.st.roof(bl.x, floor + H, bl.z, bl.dx, bl.dz, L + 1, W + 1, bl.big ? 4 : 3, roof, wall);
  else b.glow.box(bl.x, floor + H, bl.z, bl.dx, bl.dz, L * 0.9, 0.3, 0.4, NEON[0]);
  windows(b, bl.x, bl.z, bl.dx, bl.dz, bl.fx, bl.fz, L / 2 - 1.5, W / 2, floor, H, 3.2, WIN);
  windows(b, bl.x, bl.z, bl.dx, bl.dz, -bl.fx, -bl.fz, L / 2 - 1.5, W / 2, floor, H, 3.2, WIN);
  // Vordach + Namensschild zur Gleisseite
  const sw = Math.min(L * 0.7, 14), cx = bl.x + bl.fx * (W / 2 + 0.07), cz = bl.z + bl.fz * (W / 2 + 0.07), y0 = floor + H - 2.4;
  const g = b.sign(bl.st.id, bl.st.name);
  g.quad([cx - bl.dx * sw / 2, y0, cz - bl.dz * sw / 2], [cx + bl.dx * sw / 2, y0, cz + bl.dz * sw / 2], [cx + bl.dx * sw / 2, y0 + sw / 4 * 0.5, cz + bl.dz * sw / 2], [cx - bl.dx * sw / 2, y0 + sw / 4 * 0.5, cz - bl.dz * sw / 2], C.white, bl.fx, 0, bl.fz, isRight(bl) ? [1, 0, 0, 0, 0, 1, 1, 1] : [0, 0, 1, 0, 1, 1, 0, 1]);
  b.st.box(bl.x + bl.fx * (W / 2 + 1.5), floor + 3.2, bl.z + bl.fz * (W / 2 + 1.5), bl.dx, bl.dz, L * 0.6, 3, 0.25, C.roof, b.winter ? C.snow : C.roof);
}
/** Schild-UV so wählen, dass der Text von vorn lesbar ist (Blick entgegen f) */
function isRight(bl: { dx: number; dz: number; fx: number; fz: number }) {
  // Betrachter schaut in Richtung −f, „rechts“ ist dann (fz, −fx)
  return bl.dx * bl.fz - bl.dz * bl.fx < 0;
}

export function person(b: CB, x: number, y: number, z: number, dx: number, dz: number, r: () => number) {
  const cl = pick(T.cloth, r), sk = pick(T.skin, r), s = 0.9 + r() * 0.2;
  b.st.box(x, y, z, dx, dz, 0.25, 0.38, 0.85 * s, C.dark);
  b.st.box(x, y + 0.85 * s, z, dx, dz, 0.28, 0.48, 0.62 * s, cl);
  b.st.box(x, y + 1.47 * s, z, dx, dz, 0.22, 0.2, 0.24 * s, sk);
}

// ------------------------------------------------------------------ Ladestellen
function industry(b: CB, ti: number, s0: number, s1: number, cargo: CargoType[]) {
  const t = b.ctx.idx.tracks[ti], m = (s0 + s1) / 2, Pt = t.point(m);
  const [gl, gr] = b.ctx.idx.sideGaps(Pt.x, Pt.z, -Pt.dz, Pt.dx, ti, 30);
  const sg = gr >= gl ? 1 : -1, nx = -Pt.dz * sg, nz = Pt.dx * sg, dx = Pt.dx, dz = Pt.dz;
  const len = Math.min(80, Math.max(30, s1 - s0)), r = rng(hash2(ti, m | 0, 3) * 4294967296);
  b.take(Pt.x + nx * 15, Pt.z + nz * 15, len * 0.6);
  const at = (lat: number, along: number): [number, number] => [Pt.x + nx * lat + dx * along, Pt.z + nz * lat + dz * along];
  const g = b.st;
  cargo.slice(0, 2).forEach((c, k) => {
    const a0 = k === 0 ? -len * 0.25 : len * 0.3;
    switch (c) {
      case 'container': {
        for (const al of [-10, 10]) for (const lat of [-3.5, 17]) { const [x, z] = at(lat, a0 + al); g.box(x, b.H(x, z) - 0.5, z, dx, dz, 1.2, 1.2, 15, T.crane); }
        const [bx, bz] = at(6.75, a0 - 10), [cx2, cz2] = at(6.75, a0 + 10);
        g.box(bx, Pt.y + 14.5, bz, nx, nz, 22, 1.4, 1.6, T.crane); g.box(cx2, Pt.y + 14.5, cz2, nx, nz, 22, 1.4, 1.6, T.crane);
        for (let i = 0; i < 10; i++) { const [x, z] = at(8 + (i % 3) * 3, a0 - 18 + Math.floor(i / 3) * 13); const n = 1 + Math.floor(r() * 3); for (let h = 0; h < n; h++) g.box(x, b.H(x, z) + h * 2.6 - (h ? 0 : 0.3), z, dx, dz, 12, 2.45, h ? 2.6 : 2.9, pick(T.cont, r)); }
        break;
      }
      case 'bulk': case 'stone': {
        for (let i = 0; i < 3; i++) { const [x, z] = at(9, a0 + (i - 1) * 8); const gy = b.H(x, z); g.prism(x, gy - 0.5, z, 3, 3, 14, 8, T.steel, null); g.prism(x, gy + 13.5, z, 3, 0, 2.5, 8, T.steel); }
        const [x, z] = at(18, a0 + 14); g.prism(x, b.H(x, z) - 0.5, z, 7, 0, 5, 7, c === 'stone' ? T.stone : rgb(0x6a5a4a));
        break;
      }
      case 'oil': for (let i = 0; i < 3; i++) { const [x, z] = at(12, a0 + (i - 1) * 13); const gy = b.H(x, z); g.prism(x, gy - 0.5, z, 5, 5, 9, 10, C.white, rgb(0xb0b0b0)); } break;
      case 'cars': {
        const [x, z] = at(14, a0); g.box(x, b.H(x, z) - 1, z, dx, dz, 50, 14, 8, rgb(0xc8ccd0), rgb(0x6a7078));
        for (let i = 0; i < 12; i++) { const [cx, cz] = at(25 + (i % 3) * 3, a0 - 20 + Math.floor(i / 3) * 6); g.box(cx, b.H(cx, cz), cz, dx, dz, 4.2, 1.8, 1.4, pick(T.cont, r)); }
        break;
      }
      case 'wood': for (let i = 0; i < 6; i++) { const [x, z] = at(8 + (i % 2) * 4, a0 + (Math.floor(i / 2) - 1) * 10); g.box(x, b.H(x, z) - 0.3, z, dx, dz, 8, 3, 1.5 + r() * 1.5, T.wood); } break;
      default: { const [x, z] = at(16, a0); g.box(x, b.H(x, z) - 1, z, dx, dz, 45, 18, 10, rgb(0xa8a090), rgb(0x5a5f66)); g.box(x - nx * 9.6, Pt.y - 0.8, z - nz * 9.6, dx, dz, 45, 1.2, 2, C.plat); }
    }
  });
}

// ------------------------------------------------------------------ Szenerie aus dem Netz
function scenery(b: CB, s: SceneryDef) {
  const r = rng(hash2(s.x | 0, s.z | 0, 11) * 4294967296), rot = s.rot ?? r() * Math.PI;
  const dx = Math.cos(rot), dz = Math.sin(rot), g = b.st, gy = b.H(s.x, s.z), st = style(b);
  if (s.kind === 'church' || s.kind === 'factory' || s.kind === 'castle' || s.kind === 'harbour') b.take(s.x, s.z, s.kind === 'castle' ? 40 : s.kind === 'harbour' ? 70 : 30);
  switch (s.kind) {
    case 'house': house(b, s.x, s.z, dx, dz, st, r, undefined, undefined, s.h); break;
    case 'trees': for (let i = 0; i < (s.n ?? 12); i++) { const a = r() * 6.283, d = Math.sqrt(r()) * (s.r ?? 60); tree(b, s.x + Math.cos(a) * d, s.z + Math.sin(a) * d, r); } break;
    case 'factory': {
      g.box(s.x, gy - 1, s.z, dx, dz, 45, 25, 13, rgb(0xa0968a), rgb(0x5a5f66));
      g.prism(s.x + dx * 30, gy - 1, s.z + dz * 30, 1.8, 1.3, s.h ?? 35, 8, rgb(0x8a4a3a));
      windows(b, s.x, s.z, dx, dz, -dz, dx, 20, 12.5, gy, 12, 4, WIN); break;
    }
    case 'tower': {
      const h = s.h ?? 28, light = b.ctx.terrain.seaLevel !== null || st === 'harbour';
      g.prism(s.x, gy - 1, s.z, 3.2, 2.2, h, 10, light ? C.white : T.stone, null);
      if (light) g.prism(s.x, gy + h * 0.45, s.z, 3.0, 2.75, h * 0.15, 10, rgb(0xc0392b), null);
      b.glow.prism(s.x, gy + h - 1, s.z, 2.0, 2.0, 2.5, 8, rgb(0xfff0b0));
      g.prism(s.x, gy + h + 1.5, s.z, 2.4, 0, 2.5, 8, rgb(0x404448)); break;
    }
    case 'church': {
      const h = s.h ?? 40;
      g.box(s.x, gy - 1, s.z, dx, dz, 26, 13, 12, rgb(0xd8ccb8)); g.roof(s.x, gy + 11, s.z, dx, dz, 27, 14, 7, rgb(0x6a6f76), rgb(0xd8ccb8));
      const tx = s.x - dx * 15, tz = s.z - dz * 15;
      g.box(tx, gy - 1, tz, dx, dz, 7, 7, h * 0.62, rgb(0xcfc2ac)); g.prism(tx, gy - 1 + h * 0.62, tz, 4.9, 0, h * 0.38, 4, rgb(0x4a6a5a), null, Math.PI / 4 + rot); break;
    }
    case 'farm': farm(b, s.x, s.z, dx, dz, r); break;
    case 'skyscraper': house(b, s.x, s.z, dx, dz, st === 'neon' ? 'neon' : 'city', r, 28, 28, s.h ?? 120); break;
    case 'castle': {
      const h = s.h ?? 40, c = rgb(0xa89c88);
      g.box(s.x, gy - 2, s.z, dx, dz, 18, 18, h * 0.6, c); g.prism(s.x, gy - 2 + h * 0.6, s.z, 12.7, 0, 8, 4, rgb(0x5a4a40), null, Math.PI / 4 + rot);
      for (const [a, bb] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const x = s.x + dx * a * 30 - dz * bb * 30, z = s.z + dz * a * 30 + dx * bb * 30;
        g.prism(x, b.H(x, z) - 2, z, 4.5, 4.5, h * 0.45, 10, c, null); g.prism(x, b.H(x, z) - 2 + h * 0.45, z, 5.2, 0, 6, 10, rgb(0x7a3326));
      }
      for (const [a, bb] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const x = s.x + dx * a * 30 - dz * bb * 30, z = s.z + dz * a * 30 + dx * bb * 30;
        g.box(x, b.H(x, z) - 2, z, a ? -dz : dx, a ? dx : dz, 58, 2.5, h * 0.28, c);
      }
      break;
    }
    case 'harbour': {
      const qx = s.x, qz = s.z, y = Math.max(gy, (b.ctx.terrain.seaLevel ?? gy) + 1.5);
      g.box(qx, y - 6, qz, dx, dz, 140, 30, 6, rgb(0x8a8680));
      for (const k of [-40, 0, 40]) { const x = qx + dx * k - dz * 10, z = qz + dz * k + dx * 10; g.box(x, y, z, dx, dz, 2, 2, 22, T.crane); g.box(x + dz * 8, y + 21, z - dx * 8, -dz, dx, 30, 1.6, 1.6, T.crane); }
      for (let i = 0; i < 8; i++) { const x = qx + dx * (i * 13 - 50) + dz * 6, z = qz + dz * (i * 13 - 50) - dx * 6; g.box(x, y, z, dx, dz, 12, 2.45, 2.6 * (1 + (i % 2)), pick(T.cont, r)); }
      house(b, qx + dz * 30, qz - dx * 30, dx, dz, 'harbour', r);
      break;
    }
    default: break; // lake/hill: im Gelände
  }
}

function farm(b: CB, x: number, z: number, dx: number, dz: number, r: () => number) {
  const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  if (b.ctx.idx.nearest(x, z, 30, null, NEAR) || !b.free(x, z, 35)) return;
  house(b, x, z, dx, dz, style(b) === 'alpine' ? 'alpine' : 'village', r, 12, 9, 6);
  const bx = x - dz * 22, bz = z + dx * 22, gy = b.H(bx, bz);
  b.take(bx, bz, 14); b.take(x + dx * 16 - dz * 20, z + dz * 16 + dx * 20, 4);
  b.st.box(bx, gy - 1, bz, dx, dz, 24, 12, 7, rgb(0x8a3a2a)); b.st.roof(bx, gy + 6, bz, dx, dz, 25, 13, 4, b.winter ? C.snow : rgb(0x5a4038), rgb(0x8a3a2a));
  const sx = x + dx * 16 - dz * 20, sz = z + dz * 16 + dx * 20; b.st.prism(sx, b.H(sx, sz) - 1, sz, 2.6, 2.6, 12, 8, rgb(0xc8ccd0), null); b.st.prism(sx, b.H(sx, sz) + 11, sz, 2.6, 0, 2.2, 8, rgb(0x6a7078));
}
const NEAR = { seg: -1, d: 0, y: 0, t: 0 };

// ------------------------------------------------------------------ Bäume
function tree(b: CB, x: number, z: number, r: () => number, conifer?: boolean) {
  const ctx = b.ctx, theme = ctx.net.def.theme, season = theme.season ?? 'summer';
  if (!b.inside(x, z)) return;
  if (ctx.idx.nearest(x, z, 16, null, NEAR)) return;
  if (!b.free(x, z, 1.5)) return;
  const y = b.H(x, z), sea = ctx.terrain.seaLevel;
  if (sea !== null && y < sea + 1.2) return;
  const con = conifer ?? (theme.buildings === 'alpine' || theme.terrain === 'mountain' || r() < 0.3);
  const s = 0.7 + r() * 0.7;
  b.st.prism(x, y - 0.3, z, 0.28 * s, 0.2 * s, 2.2 * s, 4, T.trunk, null);
  if (con) {
    const c = season === 'winter' ? T.conW : T.con;
    b.st.prism(x, y + 1.4 * s, z, 2.3 * s, 0, 5.5 * s, 6, c, null, r());
    b.st.prism(x, y + 4.2 * s, z, 1.5 * s, 0, 3.6 * s, 6, season === 'winter' ? C.snow : c, null, r());
  } else {
    const c = pick(T.dec[season], r), k = season === 'winter' ? 0.55 : 1;
    b.st.prism(x, y + 2.0 * s, z, 1.4 * s * k, 2.6 * s * k, 1.6 * s, 6, c, null, r());
    b.st.prism(x, y + 3.6 * s, z, 2.6 * s * k, 0, 3.2 * s, 6, c, null);
  }
}

// ------------------------------------------------------------------ prozedural
function* procedural(b: CB): Generator<void, void, void> {
  const ctx = b.ctx, q = b.q, theme = ctx.net.def.theme, st = style(b), r = b.rnd;
  const ox = b.ox, oz = b.oz, cxm = ox + CH / 2, czm = oz + CH / 2;
  const city = theme.terrain === 'city';
  // Stadtblöcke
  if (city) {
    const lot = 60, pr = q.level === 'low' ? 0.2 : q.level === 'mid' ? 0.4 : 0.65;
    for (let gz = Math.ceil(oz / lot); gz * lot < oz + CH; gz++) for (let gx = Math.ceil(ox / lot); gx * lot < ox + CH; gx++) {
      if (hash2(gx, gz, ctx.seed + 1) > pr) continue;
      const x = gx * lot + 30 + 7, z = gz * lot + 30 + 7;
      if (ctx.idx.nearest(x, z, 26, null, NEAR)) continue;
      const rr = rng(hash2(gx, gz, ctx.seed + 2) * 4294967296);
      const dist = Math.hypot(x, z), tall = Math.max(0.3, 1 - dist / 6000);
      house(b, x, z, 1, 0, st === 'neon' ? 'neon' : 'city', rr, 24 + rr() * 16, 24 + rr() * 16, (14 + rr() * 50) * tall + 8);
    }
  }
  if (city) yield;
  // Häuser um Bahnhöfe
  for (const sp of ctx.stPts) {
    const d = Math.hypot(sp.x - cxm, sp.z - czm); if (d > 800) continue;
    const n = Math.round(q.houses * Math.min(2.5, 0.6 + sp.pax / 800));
    const rr = rng(hash2(sp.x | 0, sp.z | 0, b.chunk.key & 0xffff) * 4294967296);
    for (let i = 0; i < n * 3; i++) {
      const a = rr() * Math.PI * 2, rad = 40 + Math.pow(rr(), 0.9) * 360; // dichter um den Bahnhof: Ortskern
      const x = sp.x + Math.cos(a) * rad, z = sp.z + Math.sin(a) * rad;
      if (!b.inside(x, z)) continue;
      if (ctx.idx.nearest(x, z, 24, null, NEAR)) continue;
      if (ctx.terrain.seaLevel !== null && b.H(x, z) < ctx.terrain.seaLevel + 1.5) continue;
      const ang = Math.floor(rr() * 4) * Math.PI / 2 + a;
      house(b, x, z, Math.cos(ang), Math.sin(ang), city ? (st === 'neon' ? 'neon' : 'city') : st === 'city' ? 'town' : st, rr);
    }
  }
  yield;
  // Bauernhöfe
  if ((theme.terrain === 'plain' || theme.terrain === 'hills' || theme.terrain === 'river') && r() < (q.level === 'low' ? 0.12 : 0.28)) {
    farm(b, ox + 80 + r() * 340, oz + 80 + r() * 340, r() - 0.5, r() - 0.5, r);
  }
  // Baumgruppen
  const nt = Math.round(q.trees * (city ? 0.25 : theme.terrain === 'mountain' ? 1.2 : 1));
  if (nt > 0) {
    const nc = 2 + Math.floor(r() * 4), cl: [number, number][] = [];
    for (let k = 0; k < nc; k++) cl.push([ox + r() * CH, oz + r() * CH]);
    for (let i = 0; i < nt; i++) {
      const c = cl[i % nc], rad = (r() + r() - 1) * 90, a = r() * Math.PI * 2;
      tree(b, c[0] + Math.cos(a) * rad, c[1] + Math.sin(a) * rad, r);
    }
  }
}
