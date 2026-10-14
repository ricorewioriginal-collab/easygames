/* Fahrzeuge aus Bunte Insel – neu gebaut: Autos (Polizei, Feuerwehr mit Wasserstrahl, Krankenwagen, Bus, Eiswagen, Traktor),
   Fahrrad, Roller, Flitzer-Kart, Dino Tupfi (großer Sprung), Segelboot, Floß, Aqua-Gleiter, Wannen-Mobil, Hubschrauber,
   Reit-Drache, Luftschiff Nautilux, Funken-Ballon, Schlüsselschwert-Mobil, Fellnasen-Mobil, Zug und die drei Prisma-Wagen.
   Einsteigen/Aussteigen mit der Aktionstaste, Hupe, Kamera folgt weich, Fahrzeuge kehren von selbst an ihren Platz zurück. */
import type { Game, GameSystem } from '../game.ts';
import type { AudioEngine } from '../audio/music.ts';
import type { Hud } from '../ui/hud.ts';
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { clamp, damp, wrapAngle } from '../core/math.ts';
import { makeCreature, type Creature } from '../characters/creatures.ts';
import type { LoadedWorld } from '../world/registry.ts';
import { RING_R } from '../world/worlds/hub.ts';

export type Domain = 'land' | 'water' | 'air' | 'rail';
export interface VType { name: string; icon: string; domain: Domain; max: number; accel: number; turn: number; seat: number; radius: number; boost?: number; jump?: number; horn: string; special?: string; ride?: 'sit' | 'stand' }
export const VTYPES: Record<string, VType> = {
  auto: { name: 'Auto', icon: '🚗', domain: 'land', max: 20, accel: 9, turn: 1.9, seat: 0.55, radius: 1.3, horn: 'horn' },
  polizei: { name: 'Polizeiauto', icon: '🚓', domain: 'land', max: 23, accel: 11, turn: 2.0, seat: 0.55, radius: 1.3, horn: 'horn', special: 'sirene' },
  feuerwehr: { name: 'Feuerwehr', icon: '🚒', domain: 'land', max: 17, accel: 7, turn: 1.6, seat: 0.95, radius: 1.8, horn: 'horn', special: 'wasser' },
  krankenwagen: { name: 'Krankenwagen', icon: '🚑', domain: 'land', max: 21, accel: 9, turn: 1.8, seat: 0.8, radius: 1.6, horn: 'horn', special: 'sirene' },
  bus: { name: 'Bus', icon: '🚌', domain: 'land', max: 15, accel: 5, turn: 1.3, seat: 1.0, radius: 2.2, horn: 'horn' },
  eiswagen: { name: 'Eiswagen', icon: '🍦', domain: 'land', max: 15, accel: 6, turn: 1.6, seat: 0.8, radius: 1.6, horn: 'horn', special: 'lied' },
  traktor: { name: 'Traktor', icon: '🚜', domain: 'land', max: 11, accel: 5, turn: 1.7, seat: 1.1, radius: 1.5, horn: 'horn' },
  fahrrad: { name: 'Fahrrad', icon: '🚲', domain: 'land', max: 11, accel: 6, turn: 2.4, seat: 0.75, radius: 0.6, horn: 'click', jump: 5, ride: 'sit' },
  roller: { name: 'Tretroller', icon: '🛴', domain: 'land', max: 9, accel: 5, turn: 2.6, seat: 0.18, radius: 0.5, horn: 'click', jump: 5, ride: 'stand' },
  kart: { name: 'Flitzer-Kart', icon: '🏎️', domain: 'land', max: 25, accel: 14, turn: 2.4, seat: 0.3, radius: 1.0, horn: 'horn', boost: 1.4 },
  dino: { name: 'Dino Tupfi', icon: '🦕', domain: 'land', max: 13, accel: 8, turn: 2.2, seat: 1.3, radius: 1.0, horn: 'jump2', jump: 12, ride: 'sit' },
  fellnasenmobil: { name: 'Fellnasen-Mobil', icon: '🐕', domain: 'land', max: 21, accel: 10, turn: 2.0, seat: 0.55, radius: 1.3, horn: 'bark', special: 'sirene' },
  roadster: { name: 'Ki-Blitz-Roadster', icon: '⚡', domain: 'land', max: 27, accel: 15, turn: 2.2, seat: 0.4, radius: 1.3, horn: 'horn', boost: 1.5 },
  coupe: { name: 'Runen-Duell-Coupé', icon: '🃏', domain: 'land', max: 23, accel: 11, turn: 2.0, seat: 0.45, radius: 1.3, horn: 'magic' },
  buggy: { name: 'Datenhain-Buggy', icon: '💠', domain: 'land', max: 21, accel: 12, turn: 2.3, seat: 0.6, radius: 1.2, horn: 'horn', jump: 7 },
  maerchentaxi: { name: 'Märchen-Taxi', icon: '🚕', domain: 'land', max: 18, accel: 8, turn: 1.9, seat: 0.55, radius: 1.3, horn: 'horn' },
  segelboot: { name: 'Segelboot', icon: '⛵', domain: 'water', max: 13, accel: 4, turn: 1.1, seat: 0.4, radius: 1.8, horn: 'horn' },
  floss: { name: 'Floß', icon: '🪵', domain: 'water', max: 8, accel: 3, turn: 1.0, seat: 0.4, radius: 1.6, horn: 'horn' },
  wannenmobil: { name: 'Wannen-Mobil', icon: '🛁', domain: 'water', max: 11, accel: 5, turn: 1.6, seat: 0.3, radius: 1.2, horn: 'click' },
  gleiter: { name: 'Aqua-Gleiter', icon: '🔱', domain: 'air', max: 18, accel: 9, turn: 1.8, seat: 0.4, radius: 1.3, horn: 'magic' },
  heli: { name: 'Hubschrauber', icon: '🚁', domain: 'air', max: 30, accel: 10, turn: 1.6, seat: 0.7, radius: 2.4, horn: 'horn' },
  drache: { name: 'Reit-Drache', icon: '🐉', domain: 'air', max: 32, accel: 11, turn: 1.7, seat: 3.0, radius: 2.2, horn: 'fire', ride: 'sit' },
  nautilux: { name: 'Luftschiff Nautilux', icon: '🎈', domain: 'air', max: 20, accel: 5, turn: 0.9, seat: 1.6, radius: 4, horn: 'horn' },
  ballon: { name: 'Funken-Ballon', icon: '🎈', domain: 'air', max: 12, accel: 3, turn: 0.8, seat: 0.4, radius: 1.8, horn: 'fire', ride: 'stand' },
  schluesselmobil: { name: 'Schlüsselschwert-Mobil', icon: '🗝️', domain: 'air', max: 28, accel: 12, turn: 2.0, seat: 0.5, radius: 1.6, horn: 'magic' },
  zug: { name: 'Insel-Zug', icon: '🚂', domain: 'rail', max: 16, accel: 4, turn: 0, seat: 1.6, radius: 2, horn: 'horn' }
};
export interface VSpawn { type: string; x: number; z: number; yaw?: number; color?: number; id?: string }

interface Veh {
  id: string; type: string; t: VType; group: THREE.Group; body: THREE.Object3D; spin: THREE.Object3D | null; extra: Creature | null;
  pos: THREE.Vector3; yaw: number; speed: number; vy: number; home: VSpawn; idle: number; world: string; pitch: number; roll: number; railT: number;
}

const shade = (c: number, f: number) => { const r = Math.min(255, Math.round(((c >> 16) & 255) * f)), g = Math.min(255, Math.round(((c >> 8) & 255) * f)), b = Math.min(255, Math.round((c & 255) * f)); return (r << 16) | (g << 8) | b; };

function wheels(b: GeoBuilder, w: number, l: number, r: number, y = 0): void {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { b.cyl(sx * w, y + r, sz * l, r, r, 0.3, 0x2a2a2a, 12, { rz: Math.PI / 2 }); b.cyl(sx * (w + 0.02), y + r, sz * l, r * 0.5, r * 0.5, 0.32, 0xcfd6e2, 8, { rz: Math.PI / 2 }); }
}
function carBody(b: GeoBuilder, c: number, len: number, wid: number, h: number, cabin: number): void {
  b.rbox(0, 0.35, 0, wid, h, len, c);
  b.rbox(0, 0.35 + h - 0.05, -len * 0.08, wid * 0.88, cabin, len * 0.55, shade(c, 1.05));
  b.box(0, 0.35 + h + 0.1, -len * 0.08 + len * 0.28, wid * 0.8, cabin * 0.7, 0.05, 0xa8dcff, { rx: -0.35 });
  b.box(0, 0.35 + h + 0.1, -len * 0.08 - len * 0.28, wid * 0.8, cabin * 0.7, 0.05, 0xa8dcff, { rx: 0.35 });
  for (const sx of [-1, 1]) { b.box(sx * wid * 0.445, 0.35 + h + 0.08, -len * 0.08, 0.04, cabin * 0.65, len * 0.42, 0xa8dcff); b.sph(sx * wid * 0.32, 0.35 + h * 0.6, len * 0.5, 0.12, 0xfff6c0, { sz: 0.4 }); b.sph(sx * wid * 0.34, 0.35 + h * 0.6, -len * 0.5, 0.1, 0xff4040, { sz: 0.4 }); }
  wheels(b, wid * 0.48, len * 0.33, 0.36);
}

export function buildVehicleModel(type: string, color?: number): { body: THREE.Group; spin: THREE.Object3D | null; extra: Creature | null } {
  const g = new THREE.Group(), b = new GeoBuilder(), sb = new GeoBuilder();
  let extra: Creature | null = null;
  switch (type) {
    case 'auto': carBody(b, color ?? 0x3f8cff, 4, 2, 0.7, 0.75); break;
    case 'maerchentaxi': carBody(b, 0xffd23f, 4, 2, 0.7, 0.75); b.box(0, 1.95, -0.3, 0.8, 0.3, 0.4, 0x222222); break;
    case 'polizei': carBody(b, 0xffffff, 4.2, 2, 0.7, 0.75); b.box(0, 0.5, 0, 2.02, 0.3, 4.22, 0x2f5fc0); b.box(-0.35, 1.9, -0.3, 0.6, 0.2, 0.3, 0x3f8cff); b.box(0.35, 1.9, -0.3, 0.6, 0.2, 0.3, 0xe8453c); break;
    case 'fellnasenmobil': carBody(b, 0x3f6fd0, 4.2, 2, 0.7, 0.75); b.sph(0, 1.0, 2.25, 0.5, 0xe8c79a, { sz: 0.7 }); b.sph(0, 1.0, 2.6, 0.13, 0x222222); for (const s of [-1, 1]) { b.sph(s * 0.35, 1.3, 2.1, 0.1, 0xffffff); b.sph(s * 0.75, 1.75, 0.6, 0.25, 0x8a5a2a, { sy: 1.6, sz: 0.4 }); } b.box(-0.4, 1.9, -0.3, 0.4, 0.2, 0.3, 0x3f8cff); b.box(0, 1.9, -0.3, 0.4, 0.2, 0.3, 0xffffff); b.box(0.4, 1.9, -0.3, 0.4, 0.2, 0.3, 0xe8453c); b.cyl(0, 1.0, -2.2, 0.08, 0.12, 0.7, 0x8a5a2a, 6, { rx: -1.0 }); break;
    case 'krankenwagen': b.rbox(0, 0.35, 0, 2.2, 1.9, 4.8, 0xffffff); b.box(0, 0.9, 0, 2.22, 0.3, 4.82, 0xe8453c); b.box(0, 1.6, 2.41, 1.8, 0.6, 0.05, 0xa8dcff); b.box(-0.4, 2.3, 1.5, 0.5, 0.18, 0.3, 0x3f8cff); b.box(0.4, 2.3, 1.5, 0.5, 0.18, 0.3, 0xe8453c); b.box(0, 1.6, -2.42, 0.6, 0.15, 0.02, 0xe8453c); b.box(0, 1.6, -2.42, 0.15, 0.6, 0.02, 0xe8453c); wheels(b, 1.05, 1.6, 0.4); break;
    case 'feuerwehr': b.rbox(0, 0.4, 0, 2.4, 1.6, 6, 0xe8453c); b.rbox(0, 0.4, 2.0, 2.3, 2.3, 1.8, 0xd83a32); b.box(0, 1.9, 2.92, 2.0, 0.7, 0.05, 0xa8dcff); b.box(0, 2.1, -0.8, 0.5, 0.3, 4.6, 0xcfd6e2); for (let i = 0; i < 6; i++) b.box(0, 2.25, -2.8 + i * 0.75, 1.0, 0.08, 0.1, 0xcfd6e2); b.box(-0.4, 2.75, 2.0, 0.5, 0.2, 0.3, 0x3f8cff); b.box(0.4, 2.75, 2.0, 0.5, 0.2, 0.3, 0x3f8cff); wheels(b, 1.15, 2.1, 0.5); break;
    case 'bus': b.rbox(0, 0.4, 0, 2.5, 2.6, 8, 0xffc83d); b.box(0, 1.9, 0, 2.52, 0.9, 7.6, 0xa8dcff); b.box(0, 1.2, 0, 2.54, 0.15, 8.02, 0xe8453c); wheels(b, 1.2, 2.8, 0.5); break;
    case 'eiswagen': b.rbox(0, 0.4, 0, 2.2, 1.9, 4.6, 0xfff1f8); b.box(0, 1.5, 0, 2.22, 0.5, 4.62, 0xff6fb5); b.cone(0, 2.3, -0.6, 0.4, 0.8, 0xe8c79a, 8, { rx: Math.PI }); b.sph(0, 2.95, -0.6, 0.45, 0xff9ad0); b.sph(0, 3.35, -0.6, 0.35, 0xfff6c0); wheels(b, 1.05, 1.5, 0.4); break;
    case 'traktor': b.rbox(0, 0.9, 0.6, 1.4, 1.0, 2.2, 0x4cbf55); b.rbox(0, 1.6, -0.6, 1.5, 1.4, 1.4, 0x3fae46); b.box(0, 2.2, -0.6, 1.3, 0.6, 1.3, 0xa8dcff); b.cyl(0.45, 1.9, 1.3, 0.1, 0.1, 0.9, 0x333333, 6); for (const s of [-1, 1]) { b.cyl(s * 0.9, 0.85, -0.7, 0.85, 0.85, 0.5, 0x2a2a2a, 14, { rz: Math.PI / 2 }); b.cyl(s * 0.75, 0.45, 1.2, 0.45, 0.45, 0.35, 0x2a2a2a, 12, { rz: Math.PI / 2 }); } break;
    case 'fahrrad': for (const z of [-0.55, 0.55]) b.torus(0, 0.38, z, 0.36, 0.04, 0x2a2a2a, { ry: Math.PI / 2 }); b.box(0, 0.55, 0, 0.06, 0.06, 1.1, color ?? 0xe8453c, { rx: 0.2 }); b.box(0, 0.8, -0.1, 0.06, 0.6, 0.06, color ?? 0xe8453c, { rx: -0.3 }); b.box(0, 1.1, 0.5, 0.6, 0.05, 0.05, 0x333333); b.box(0, 0.9, -0.25, 0.25, 0.06, 0.35, 0x333333); break;
    case 'roller': b.box(0, 0.15, 0, 0.3, 0.06, 1.0, color ?? 0x2fd17b); for (const z of [-0.45, 0.45]) b.cyl(0, 0.12, z, 0.12, 0.12, 0.08, 0x2a2a2a, 10, { rz: Math.PI / 2 }); b.cyl(0, 0.15, 0.45, 0.03, 0.03, 0.95, 0x9aa0a8, 6); b.box(0, 1.08, 0.45, 0.55, 0.05, 0.05, 0x333333); break;
    case 'kart': b.rbox(0, 0.25, 0, 1.4, 0.4, 2.4, color ?? 0xe8453c); b.box(0, 0.65, -0.2, 0.8, 0.5, 0.15, 0x333333); b.box(0, 0.4, 1.25, 1.4, 0.15, 0.3, 0xffd23f); b.box(0, 0.9, -1.1, 1.3, 0.1, 0.3, 0x333333); wheels(b, 0.72, 0.8, 0.28); break;
    case 'roadster': carBody(b, 0xffd23f, 4.2, 1.9, 0.55, 0.5); b.box(0, 0.65, 0, 1.95, 0.08, 4.25, 0x48c8ff); b.box(0, 1.5, -2.0, 1.6, 0.08, 0.4, 0x222222); break;
    case 'coupe': carBody(b, 0x8a5bff, 4.2, 1.9, 0.6, 0.6); b.box(0, 0.7, 0, 1.95, 0.06, 4.25, 0xffc65c); break;
    case 'buggy': b.rbox(0, 0.7, 0, 1.8, 0.6, 3, 0x2fb9a8); for (let i = 0; i < 4; i++) b.cyl((i % 2 - 0.5) * 1.5, 1.2, (Math.floor(i / 2) - 0.5) * 1.4, 0.05, 0.05, 1.0, 0xff79c9, 6); b.box(0, 2.2, 0, 1.6, 0.06, 1.6, 0xff79c9); for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(sx * 0.95, 0.5, sz * 1.05, 0.5, 0.5, 0.45, 0x2a2a2a, 12, { rz: Math.PI / 2 }); break;
    case 'segelboot': b.rbox(0, 0, 0, 1.8, 0.7, 4.4, 0xffffff); b.box(0, 0.7, 0, 1.6, 0.06, 4.0, 0xb07a45); b.cyl(0, 0.7, 0.4, 0.07, 0.08, 5.0, 0x8a5a33, 6); b.box(0, 1.2, -0.2, 0.04, 3.8, 2.0, 0xfff6e8, { rx: 0.03 }); b.box(0, 5.6, 0.4, 0.05, 0.5, 0.7, 0xe8453c); break;
    case 'floss': for (let i = 0; i < 6; i++) b.cyl(-1.0 + i * 0.4, 0.15, 0, 0.2, 0.2, 3.2, 0xb07a45, 8, { rx: Math.PI / 2 }); b.cyl(0, 0.3, 0.6, 0.06, 0.06, 2.6, 0x8a5a33, 6); b.box(0, 1.3, 0.6, 0.04, 1.6, 1.4, 0xf4e6c8); break;
    case 'wannenmobil': b.rbox(0, 0, 0, 1.4, 0.8, 2.4, 0xffffff); b.box(0, 0.75, 0, 1.2, 0.05, 2.2, 0x7fd8ff); for (let i = 0; i < 5; i++) b.sph((i - 2) * 0.22, 0.85, 0.6 - i * 0.1, 0.12, 0xffffff); b.sph(0, 0.95, 0.9, 0.2, 0xffd23f); break;
    case 'gleiter': b.sph(0, 0.5, 0, 0.9, 0x2fb9a8, { sy: 0.4, sz: 1.6 }); b.sph(0, 0.85, 0.2, 0.5, 0xa8f0ff, { sy: 0.5, sz: 0.8 }); for (const s of [-1, 1]) b.box(s * 1.0, 0.45, -0.2, 1.2, 0.06, 0.8, 0x7fd8ff, { rz: s * 0.15 }); b.cone(0, 0.5, -1.4, 0.3, 0.6, 0x2fb9a8, 6, { rx: -Math.PI / 2 }); break;
    case 'heli': {
      b.sph(0, 1.2, 0.3, 1.2, color ?? 0xe8453c, { sy: 0.85, sz: 1.2 }); b.sph(0, 1.35, 0.95, 0.8, 0xa8dcff, { sy: 0.7, sz: 0.7 });
      b.cyl(0, 1.3, -1.4, 0.18, 0.3, 2.6, color ?? 0xe8453c, 8, { rx: Math.PI / 2 }); b.box(0, 1.6, -2.7, 0.08, 0.9, 0.5, color ?? 0xe8453c);
      for (const s of [-1, 1]) { b.box(s * 0.8, 0.15, 0.2, 0.1, 0.1, 2.4, 0x333333); b.box(s * 0.7, 0.3, 0.6, 0.06, 0.35, 0.06, 0x333333); b.box(s * 0.7, 0.3, -0.3, 0.06, 0.35, 0.06, 0x333333); }
      b.cyl(0, 2.2, 0.2, 0.1, 0.1, 0.35, 0x333333, 6);
      sb.box(0, 0, 0, 7.5, 0.04, 0.35, 0x333333); sb.box(0, 0, 0, 0.35, 0.04, 7.5, 0x333333);
      break;
    }
    case 'nautilux': {
      b.sph(0, 6, 0, 3.6, 0xb48aff, { sx: 0.75, sz: 1.9, sy: 0.75 }); for (let i = -2; i <= 2; i++) b.torus(0, 6, i * 1.9, 2.6 - Math.abs(i) * 0.4, 0.06, 0xffd23f, { ry: 0 });
      b.rbox(0, 1.2, 0, 2.2, 1.4, 5, 0x8a5a33); b.box(0, 2.4, 0, 2.0, 0.08, 4.6, 0xc9a26b);
      for (const s of [-1, 1]) for (const z of [-1.8, 1.8]) b.cyl(s * 0.9, 2.5, z, 0.04, 0.04, 2.4, 0x6b4a2a, 4, { rz: -s * 0.2 });
      b.cone(0, 6, -6.5, 1.0, 1.6, 0x8a5bff, 4, { rx: -Math.PI / 2 }); sb.box(0, 0, 0, 0.1, 1.6, 0.25, 0x6b4a2a);
      break;
    }
    case 'ballon': {
      b.ball(0, 6.5, 0, 3.2, 0xff8a3d, { sy: 1.15 }); for (let i = 0; i < 8; i++) { const a = i * 0.785; b.box(Math.cos(a) * 2.9, 6.2, Math.sin(a) * 2.9, 0.2, 4.5, 0.2, i % 2 ? 0xffd23f : 0xe8453c, { ry: -a }); }
      b.rbox(0, 0, 0, 1.6, 1.0, 1.6, 0xb07a45); for (const s of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) b.cyl(s[0], 1, s[1], 0.03, 0.03, 2.6, 0x6b4a2a, 4);
      b.cyl(0, 2.6, 0, 0.3, 0.2, 0.6, 0x555555, 8);
      break;
    }
    case 'schluesselmobil': {
      b.box(0, 0.4, 0, 0.6, 0.35, 4.2, 0xcfd6e2); b.box(0, 0.4, 2.0, 1.4, 0.3, 0.5, 0xffd23f); b.sph(0, 0.55, -2.2, 0.55, 0xffd23f, { sy: 0.5 });
      for (const s of [-1, 1]) b.box(s * 0.9, 0.42, -0.4, 1.4, 0.08, 1.2, 0x9fe8ff, { rz: s * 0.15 });
      b.rbox(0, 0.75, -0.3, 0.9, 0.5, 1.2, 0x5b4bd6);
      break;
    }
    case 'zug': {
      b.rbox(0, 0.4, 0, 2.4, 2.0, 6, 0xe8453c); b.cyl(0, 1.4, 2.0, 0.9, 0.9, 3, 0x2a2a2a, 14, { rx: Math.PI / 2 }); b.cyl(0, 2.4, 2.8, 0.25, 0.35, 1.2, 0x2a2a2a, 8); b.box(0, 2.4, -1.5, 2.4, 1.6, 2.6, 0xe8453c); b.box(0, 4.0, -1.5, 2.6, 0.2, 2.8, 0x2a2a2a); b.box(0, 2.8, -1.5, 2.42, 0.8, 1.6, 0xa8dcff);
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) b.cyl(s * 1.15, 0.5, -2.4 + i * 1.6, 0.5, 0.5, 0.25, 0x333333, 12, { rz: Math.PI / 2 });
      b.rbox(0, 0.4, -7.2, 2.4, 2.4, 6, 0x3f8cff); b.box(0, 1.6, -7.2, 2.42, 0.8, 5.4, 0xa8dcff); b.box(0, 2.8, -7.2, 2.6, 0.15, 6.2, 0x2f5fc0);
      for (let i = 0; i < 2; i++) for (const s of [-1, 1]) b.cyl(s * 1.15, 0.5, -8.8 + i * 3.2, 0.5, 0.5, 0.25, 0x333333, 12, { rz: Math.PI / 2 });
      break;
    }
    case 'dino': extra = makeCreature('reitdrache', { color: 0xff8a3d, color2: 0x48d1c4 }); extra.root.scale.setScalar(0.62); g.add(extra.root); b.box(0, 1.55, -0.1, 0.9, 0.12, 0.9, 0xb07a45); break;
    case 'drache': extra = makeCreature('reitdrache', { color: 0x4cbf55, color2: 0xfff1c0 }); g.add(extra.root); b.box(0, 2.7, 0.15, 1.2, 0.15, 1.0, 0x8a5a33); break;
  }
  const body = b.mesh(mats().vc, true); g.add(body);
  let spin: THREE.Object3D | null = null;
  if (!sb.empty) { spin = sb.mesh(mats().vc, false); spin.position.set(0, type === 'heli' ? 2.55 : 6, type === 'nautilux' ? -7.4 : 0.2); if (type === 'nautilux') spin.position.y = 6; g.add(spin); }
  return { body: g, spin, extra };
}

export class Vehicles implements GameSystem {
  id = 'vehicles';
  private list = new Map<string, Veh>();
  current: Veh | null = null;
  hud: Hud | null = null;
  private siren = false;
  private sirenT = 0;
  private hornT = 0;
  private spray: THREE.Points | null = null;
  private exitCooldown = 0;
  constructor(private g: Game, private audio: AudioEngine) { }
  get inVehicle(): boolean { return !!this.current; }
  get currentType(): string | null { return this.current?.type ?? null; }
  onWorldLoad(lw: LoadedWorld): void {
    const spawns = lw.def.vehicles ?? [];
    spawns.forEach((s, i) => this.spawn(s, lw.def.id, s.id ?? lw.def.id + ':' + s.type + ':' + i));
  }
  onWorldUnload(id: string): void {
    for (const [k, v] of this.list) if (v.world === id && v !== this.current) this.despawn(k);
  }
  private spawn(s: VSpawn, world: string, id: string): void {
    if (this.list.has(id)) return;
    const t = VTYPES[s.type];
    if (!t) return;
    const m = buildVehicleModel(s.type, s.color);
    const group = new THREE.Group(); group.add(m.body);
    const y = s.type === 'zug' ? this.g.field.height(s.x, s.z) + 0.1 : this.g.physics.ground(s.x, s.z, 100).y;
    const v: Veh = { id, type: s.type, t, group, body: m.body, spin: m.spin, extra: m.extra, pos: new THREE.Vector3(s.x, t.domain === 'water' ? 0.05 : y, s.z), yaw: s.yaw ?? 0, speed: 0, vy: 0, home: s, idle: 0, world, pitch: 0, roll: 0, railT: Math.atan2(s.z, s.x) };
    group.position.copy(v.pos); group.rotation.y = v.yaw;
    this.g.scene.add(group);
    this.list.set(id, v);
    this.g.interact.add({ id: 'veh:' + id, tag: world, x: v.pos.x, y: v.pos.y, z: v.pos.z, r: t.radius + 2.2, icon: t.icon, label: 'Einsteigen: ' + t.name, priority: 0, when: () => !this.current, act: () => this.enter(v) });
  }
  private despawn(id: string): void {
    const v = this.list.get(id);
    if (!v) return;
    v.group.traverse(o => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    v.extra?.dispose();
    this.g.scene.remove(v.group);
    this.g.interact.remove('veh:' + id);
    this.list.delete(id);
  }
  enterById(id: string): void { const v = this.list.get(id); if (v) this.enter(v); }
  private enter(v: Veh): void {
    if (this.current || this.exitCooldown > 0) return;
    this.current = v;
    this.g.player.stop();
    this.g.rig.vehicleMode = true;
    this.g.avatar.pose = v.t.ride === 'stand' ? 'idle' : 'drive';
    this.g.sfx('door');
    const s = this.g.save; s.stats['veh_' + v.type] = (s.stats['veh_' + v.type] ?? 0) + 1;
    this.g.events.emit('vehicle', { type: v.type });
    this.hud?.toast(v.t.icon + ' ' + v.t.name + ' – ' + (v.t.domain === 'air' ? 'Springen = steigen, ⤓ = sinken' : v.t.domain === 'rail' ? 'Vorwärts = fahren, an den Bahnhöfen halten' : 'Losfahren!') + ' · Aktion = Aussteigen', undefined, 3500);
    this.exitCooldown = 0.4;
  }
  exit(force = false): void {
    const v = this.current;
    if (!v) return;
    if (!force && v.t.domain === 'air' && v.pos.y - this.g.physics.ground(v.pos.x, v.pos.z, v.pos.y).y > 4) { this.hud?.toast('Erst landen (⤓ sinken), dann aussteigen!', '🛬'); return; }
    if (!force && v.t.domain === 'water') {
      // nur am Ufer aussteigen
      let ok = false;
      for (let a = 0; a < 8 && !ok; a++) { const x = v.pos.x + Math.cos(a * 0.785) * (v.t.radius + 2), z = v.pos.z + Math.sin(a * 0.785) * (v.t.radius + 2); const gr = this.g.physics.ground(x, z, 5); if (gr.y > gr.water - 0.2) ok = true; }
      if (!ok) { this.hud?.toast('Fahr ans Ufer oder an einen Steg, um auszusteigen.', '⚓'); return; }
    }
    this.current = null;
    this.g.rig.vehicleMode = false;
    const side = v.yaw + Math.PI / 2;
    let x = v.pos.x + Math.sin(side) * (v.t.radius + 1), z = v.pos.z + Math.cos(side) * (v.t.radius + 1);
    const gr = this.g.physics.ground(x, z, v.pos.y + 2);
    if (gr.water > gr.y + 0.5 && v.t.domain === 'water') { for (let a = 0; a < 8; a++) { const xx = v.pos.x + Math.cos(a * 0.785) * (v.t.radius + 2), zz = v.pos.z + Math.sin(a * 0.785) * (v.t.radius + 2); const g2 = this.g.physics.ground(xx, zz, 5); if (g2.y > g2.water - 0.2) { x = xx; z = zz; break; } } }
    this.g.player.teleport(x, z, v.yaw);
    this.g.avatar.pose = 'idle';
    v.idle = 0;
    this.siren = false;
    this.g.sfx('door');
    this.exitCooldown = 0.4;
  }
  nearbyIcons(): { x: number; z: number; icon: string }[] {
    const out: { x: number; z: number; icon: string }[] = [], p = this.g.player.pos;
    for (const v of this.list.values()) if (v !== this.current && Math.hypot(v.pos.x - p.x, v.pos.z - p.z) < 70) out.push({ x: v.pos.x, z: v.pos.z, icon: v.t.icon });
    return out;
  }
  update(dt: number, time: number): void {
    this.exitCooldown = Math.max(0, this.exitCooldown - dt);
    const g = this.g, inp = g.input, v = this.current;
    // Herrenlose Fahrzeuge kehren zurück
    for (const o of this.list.values()) {
      if (o === v) continue;
      if (o.extra) o.extra.update(dt, 0);
      if (o.spin) o.spin.rotation.y += dt * (o.speed > 0 ? 10 : 0);
      const fromHome = Math.hypot(o.pos.x - o.home.x, o.pos.z - o.home.z);
      if (fromHome > 3) {
        o.idle += dt;
        const pd = Math.hypot(o.pos.x - g.player.pos.x, o.pos.z - g.player.pos.z);
        if ((o.idle > 25 && pd > 20) || o.idle > 120) { o.pos.set(o.home.x, o.t.domain === 'water' ? 0.05 : g.physics.ground(o.home.x, o.home.z, 100).y, o.home.z); o.yaw = o.home.yaw ?? 0; o.group.position.copy(o.pos); o.group.rotation.set(0, o.yaw, 0); o.idle = 0; }
      }
      const ia = g.interact.get('veh:' + o.id); if (ia) { ia.x = o.pos.x; ia.y = o.pos.y; ia.z = o.pos.z; }
      if (o.type === 'zug' && o !== v) this.autoTrain(o, dt);
    }
    if (!v) { if (this.spray) this.spray.visible = false; return; }
    const t = v.t;
    if ((inp.pressed('action') && this.exitCooldown <= 0)) { this.exit(); return; }
    if (inp.pressed('horn') || inp.pressed('action2')) this.horn(v);
    const thr = inp.moveY, steer = -inp.moveX;
    const boost = inp.isHeld('sprint') && t.boost ? t.boost : 1;
    const max = t.max * boost;
    if (t.domain === 'rail') { this.driveTrain(v, dt, thr); }
    else {
      const target = thr * (thr < 0 ? max * 0.4 : max);
      v.speed = damp(v.speed, target, thr === 0 ? 1.5 : t.accel / Math.max(4, Math.abs(target) + 1) * 1.6, dt);
      const turnK = t.domain === 'air' ? 1 : clamp(Math.abs(v.speed) / 4, 0, 1) * Math.sign(v.speed || 1);
      v.yaw = wrapAngle(v.yaw + steer * t.turn * turnK * dt);
      const fx = Math.sin(v.yaw), fz = Math.cos(v.yaw);
      if (t.domain === 'land') {
        const res = g.physics.move(v.pos, fx * v.speed * dt, fz * v.speed * dt, t.radius, 1.6, 0.8);
        if (res.hit && Math.abs(v.speed) > 6) { g.sfx('bump', 0.5); g.rig.addShake(0.15); v.speed *= 0.4; }
        else if (res.hit) v.speed *= 0.9;
        const gr = g.physics.ground(v.pos.x, v.pos.z, v.pos.y + 0.8);
        if (t.jump && inp.pressed('jump') && v.pos.y - gr.y < 0.1) v.vy = t.jump;
        v.vy -= 26 * dt;
        v.pos.y += v.vy * dt;
        if (v.pos.y <= gr.y) { v.pos.y = gr.y; v.vy = 0; }
        if (gr.water > gr.y + 1.0 && v.pos.y < gr.water - 0.6) { v.speed *= 0.95; v.pos.y = gr.water - 0.6; if (Math.random() < dt * 4) g.fx.splash(v.pos.x, gr.water, v.pos.z, 4); }
        // Neigung an Hängen
        const ahead = g.physics.ground(v.pos.x + fx * 1.5, v.pos.z + fz * 1.5, v.pos.y + 1).y;
        v.pitch = damp(v.pitch, -Math.atan2(ahead - v.pos.y, 1.5) * 0.8, 6, dt);
        v.roll = damp(v.roll, steer * clamp(v.speed / t.max, -1, 1) * 0.08, 5, dt);
        if (Math.abs(v.speed) > 8 && Math.random() < dt * 6) g.fx.puff(v.pos.x - fx * 2, v.pos.y, v.pos.z - fz * 2, 0xe8dcc0, 1);
      } else if (t.domain === 'water') {
        const nx = v.pos.x + fx * v.speed * dt, nz = v.pos.z + fz * v.speed * dt;
        const gr = g.physics.ground(nx, nz, 5);
        if (gr.water - gr.y > 0.8) { v.pos.x = nx; v.pos.z = nz; } else { v.speed *= -0.3; g.sfx('bump', 0.4); }
        const wl = g.physics.ground(v.pos.x, v.pos.z, 5).water;
        v.pos.y = (Number.isFinite(wl) ? wl : 0) + Math.sin(time * 1.6) * 0.12 - 0.2;
        v.roll = damp(v.roll, steer * 0.12 + Math.sin(time * 1.2) * 0.05, 3, dt);
        if (Math.abs(v.speed) > 3 && Math.random() < dt * 10) g.fx.splash(v.pos.x - fx * 2, v.pos.y + 0.2, v.pos.z - fz * 2, 2);
      } else {
        // Luft
        const up = (inp.isHeld('jump') ? 1 : 0) - (inp.isHeld('down') ? 1 : 0);
        v.vy = damp(v.vy, up * (t.max * 0.45), 2.5, dt);
        v.pos.x += fx * v.speed * dt; v.pos.z += fz * v.speed * dt; v.pos.y += v.vy * dt;
        const gr = g.physics.ground(v.pos.x, v.pos.z, v.pos.y + 1);
        const floor = Math.max(gr.y, Number.isFinite(gr.water) ? gr.water : -10) + 0.1;
        if (v.pos.y < floor) { v.pos.y = floor; v.vy = Math.max(0, v.vy); if (Math.abs(v.speed) > 4) v.speed *= 0.97; }
        // Kollision mit Gebäuden in Bodennähe
        if (v.pos.y - gr.y < 6) g.physics.move(v.pos, 0, 0, t.radius, 2);
        v.pos.y = Math.min(v.pos.y, 160);
        v.pitch = damp(v.pitch, -v.vy * 0.03 + clamp(v.speed / t.max, -1, 1) * 0.08, 3, dt);
        v.roll = damp(v.roll, steer * 0.35 * clamp(Math.abs(v.speed) / 8, 0, 1), 3, dt);
        if (v.spin) v.spin.rotation.y += dt * (14 + Math.abs(v.speed));
        if (v.type === 'ballon' && up > 0 && Math.random() < dt * 8) g.fx.emit(v.pos.x, v.pos.y + 3, v.pos.z, 0, 2, 0, 0xffa21f, 0.6, 0.4, -2);
      }
      if (v.extra) v.extra.update(dt, Math.abs(v.speed) / 3 + (t.domain === 'air' ? 1 : 0));
    }
    v.group.position.copy(v.pos);
    v.group.rotation.set(v.pitch, v.yaw, v.roll, 'YXZ');
    // Fahrer
    const seatY = t.seat * (v.type === 'drache' ? 1 : 1);
    g.avatar.root.position.set(v.pos.x, v.pos.y + seatY, v.pos.z);
    g.avatar.root.rotation.y = v.yaw;
    g.avatar.pose = t.ride === 'stand' ? 'idle' : 'drive';
    g.avatar.speed = 0;
    g.player.pos.set(v.pos.x, v.pos.y, v.pos.z);
    g.player.yaw = v.yaw;
    // Kamera
    g.rig.update(dt, v.pos, v.yaw, Math.abs(v.speed) > 1, inp.lookX, inp.lookY, inp.zoom, seatY + 1.4);
    // Sonderfunktionen
    if (inp.pressed('down') && t.special === 'sirene' || (inp.pressed('action2') && t.special === 'sirene')) this.siren = !this.siren;
    if (this.siren) { this.sirenT += dt; if (this.sirenT > 0.5) { this.sirenT = 0; this.audio.sfx('note' + (Math.floor(time * 2) % 2 ? '4' : '2'), 0.4); } }
    if (t.special === 'wasser') this.water(v, inp.isHeld('down') || inp.isHeld('action2'), dt);
    if (Math.abs(v.speed) > 1 && t.domain === 'land' && Math.random() < dt * 2) this.audio.sfx('engine', 0.25);
    this.hornT -= dt;
  }
  private horn(v: Veh): void {
    if (this.hornT > 0) return;
    this.hornT = 0.5;
    this.g.sfx(v.t.horn, 0.7);
    if (v.type === 'drache' || v.type === 'ballon') { const fx = Math.sin(v.yaw), fz = Math.cos(v.yaw); for (let i = 0; i < 20; i++) this.g.fx.emit(v.pos.x + fx * 3, v.pos.y + v.t.seat + 0.5, v.pos.z + fz * 3, fx * 12 + (Math.random() - 0.5) * 3, Math.random() * 2, fz * 12 + (Math.random() - 0.5) * 3, i % 2 ? 0xffa21f : 0xffd23f, 0.6, 0.6, 0); }
    if (v.type === 'eiswagen') for (let i = 0; i < 8; i++) this.g.sfx('note' + [0, 2, 4, 2, 0, 4, 7, 7][i], 0.4);
    // Bewohner in der Nähe winken
    this.g.events.emit('interact', { id: 'hupe', kind: 'vehicle' });
  }
  /** Feuerwehr: Wasserstrahl löscht Feuer (Interaktions-IDs mit "feuer:"). */
  private water(v: Veh, on: boolean, dt: number): void {
    if (!this.spray) {
      const n = 120, pos = new Float32Array(n * 3);
      const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.spray = new THREE.Points(gm, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.35, transparent: true, opacity: 0.8, depthWrite: false }));
      this.spray.frustumCulled = false; this.g.scene.add(this.spray);
    }
    this.spray.visible = on;
    if (!on) return;
    const fx = Math.sin(v.yaw), fz = Math.cos(v.yaw), arr = this.spray.geometry.attributes.position;
    const t0 = this.g.time;
    for (let i = 0; i < 120; i++) {
      const k = ((i / 120) + t0 * 1.5) % 1, d = k * 16;
      arr.setXYZ(i, v.pos.x + fx * (2.5 + d) + (Math.random() - 0.5) * 0.4, v.pos.y + 2.6 + d * 0.35 - d * d * 0.03, v.pos.z + fz * (2.5 + d) + (Math.random() - 0.5) * 0.4);
    }
    arr.needsUpdate = true;
    // Ziel: Feuer in Spritzrichtung
    const tx = v.pos.x + fx * 12, tz = v.pos.z + fz * 12;
    for (const ia of this.g.interact.all) if (ia.onWater && Math.hypot(ia.x - tx, ia.z - tz) < 7 && (!ia.when || ia.when())) { ia.onWater(); break; }
    void dt;
  }
  /* ---------- Zug auf dem Gleisring der Hauptinsel ---------- */
  private stations = [Math.PI / 2, 0, -Math.PI / 2, Math.PI];
  private driveTrain(v: Veh, dt: number, thr: number): void {
    v.speed = damp(v.speed, Math.max(0, thr) * v.t.max, thr > 0 ? 0.6 : 1.4, dt);
    this.advanceTrain(v, dt);
    const near = this.stations.find(a => Math.abs(wrapAngle(v.railT - a)) < 0.08);
    if (near !== undefined && v.speed < 1.5 && !this.g.save.flags['halt_' + this.stations.indexOf(near)]) { this.g.save.flags['halt_' + this.stations.indexOf(near)] = 1; this.g.addStars(1, 'Pünktlich gehalten'); this.g.events.emit('interact', { id: 'zug_halt', kind: 'zug' }); }
  }
  private autoTrain(v: Veh, dt: number): void {
    const near = this.stations.some(a => Math.abs(wrapAngle(v.railT - a)) < 0.05);
    v.idle = near ? v.idle + dt : 0;
    const want = near && v.idle < 6 ? 0 : 10;
    v.speed = damp(v.speed, want, near ? 2 : 0.5, dt);
    if (v.speed < 0.5 && near && v.idle > 6) v.speed = 1.5;
    this.advanceTrain(v, dt);
    v.group.position.copy(v.pos); v.group.rotation.set(0, v.yaw, 0);
    const ia = this.g.interact.get('veh:' + v.id); if (ia) { ia.x = v.pos.x; ia.z = v.pos.z; ia.y = v.pos.y; }
  }
  private advanceTrain(v: Veh, dt: number): void {
    v.railT = wrapAngle(v.railT + (v.speed * dt) / RING_R);
    v.pos.set(Math.cos(v.railT) * RING_R, this.g.field.height(Math.cos(v.railT) * RING_R, Math.sin(v.railT) * RING_R) + 0.15, Math.sin(v.railT) * RING_R);
    v.yaw = Math.atan2(-Math.sin(v.railT), Math.cos(v.railT));
  }
}
