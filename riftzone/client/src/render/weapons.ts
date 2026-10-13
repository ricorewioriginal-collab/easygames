// Waffen- und Gegenstandsmodelle (in der Hand und am Boden).
import * as THREE from 'three';
import { CONSUMABLES, GRENADE_ID, RARITY_COLORS, WEAPONS } from '../../../shared/src/items';
import { PICKAXES } from '../../../shared/src/cosmetics';
import { merge, tint } from './models';

const cache = new Map<string, THREE.BufferGeometry>();
const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: number): THREE.BufferGeometry => tint(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c);
const cyl = (r: number, l: number, x: number, y: number, z: number, c: number, seg = 8): THREE.BufferGeometry => tint(new THREE.CylinderGeometry(r, r, l, seg).rotateX(Math.PI / 2).translate(x, y, z), c);

/** Waffengeometrie; Lauf zeigt nach -z, Griff bei Ursprung. */
export function weaponGeometry(id: number, rarity: number): THREE.BufferGeometry {
  const key = `${id}:${rarity}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rc = RARITY_COLORS[rarity] ?? 0xaaaaaa;
  const dark = 0x2a2f3a,
    mid = 0x4a5263,
    light = 0x8a94a8;
  let parts: THREE.BufferGeometry[] = [];
  const model: string = id === 100 ? 'pickaxe' : WEAPONS[id]?.model ?? (CONSUMABLES.some((c) => c.id === id) ? 'cons' : 'none');
  switch (model) {
    case 'pistol':
      parts = [box(0.07, 0.11, 0.26, 0, 0.06, -0.08, dark), box(0.06, 0.14, 0.08, 0, -0.04, 0.02, mid), box(0.075, 0.03, 0.2, 0, 0.12, -0.08, rc)];
      break;
    case 'smg':
      parts = [box(0.08, 0.12, 0.42, 0, 0.06, -0.14, dark), box(0.06, 0.14, 0.07, 0, -0.05, 0.0, mid), box(0.05, 0.18, 0.06, 0, -0.04, -0.18, mid), cyl(0.025, 0.14, 0, 0.07, -0.42, dark), box(0.085, 0.03, 0.3, 0, 0.135, -0.12, rc), box(0.06, 0.08, 0.16, 0, 0.04, 0.16, light)];
      break;
    case 'rifle':
    case 'burst':
      parts = [box(0.08, 0.12, 0.66, 0, 0.06, -0.22, dark), box(0.06, 0.15, 0.07, 0, -0.05, 0.02, mid), box(0.05, 0.16, 0.08, 0, -0.04, -0.2, mid), cyl(0.022, 0.26, 0, 0.07, -0.66, dark), box(0.07, 0.14, 0.24, 0, 0.04, 0.26, model === 'burst' ? rc : light), box(0.085, 0.03, 0.4, 0, 0.135, -0.2, rc), box(0.03, 0.05, 0.12, 0, 0.16, -0.06, dark)];
      break;
    case 'shotgun':
      parts = [box(0.09, 0.11, 0.6, 0, 0.06, -0.2, mid), cyl(0.035, 0.42, 0, 0.09, -0.56, dark), cyl(0.03, 0.3, 0, 0.02, -0.46, 0x6a4a35), box(0.07, 0.15, 0.3, 0, 0.0, 0.2, 0x6a4a35), box(0.095, 0.03, 0.22, 0, 0.13, -0.15, rc)];
      break;
    case 'sniper':
      parts = [box(0.08, 0.11, 0.82, 0, 0.06, -0.28, dark), cyl(0.022, 0.44, 0, 0.07, -0.88, dark), cyl(0.04, 0.3, 0, 0.17, -0.2, 0x1a1d24), box(0.07, 0.15, 0.3, 0, 0.02, 0.28, mid), box(0.085, 0.03, 0.5, 0, 0.125, -0.3, rc), box(0.05, 0.14, 0.06, 0, -0.05, 0.03, mid)];
      break;
    case 'launcher':
      parts = [cyl(0.09, 1.0, 0, 0.1, -0.2, 0x3a4a3a, 10), cyl(0.1, 0.12, 0, 0.1, -0.7, rc, 10), box(0.06, 0.15, 0.07, 0, -0.05, -0.05, mid), box(0.05, 0.06, 0.18, -0.09, 0.2, -0.25, dark)];
      break;
    case 'grenade':
      parts = [tint(new THREE.SphereGeometry(0.075, 8, 6).translate(0, 0.02, 0), 0x3a4a5a), box(0.04, 0.05, 0.04, 0, 0.1, 0, rc), tint(new THREE.TorusGeometry(0.03, 0.008, 4, 8).translate(0.03, 0.13, 0), 0xcccccc)];
      break;
    case 'pickaxe': {
      const pc = PICKAXES[rarity]?.color ?? 0xa8b3bf;
      parts = [tint(new THREE.CylinderGeometry(0.025, 0.03, 0.75, 6).translate(0, 0.2, 0), 0x6b4a2f), box(0.05, 0.08, 0.5, 0, 0.55, -0.05, pc), box(0.045, 0.05, 0.12, 0, 0.55, -0.34, pc), box(0.045, 0.05, 0.12, 0, 0.55, 0.24, pc)];
      break;
    }
    case 'cons': {
      const c = CONSUMABLES.find((x) => x.id === id)!;
      if (c.id === 20) parts = [tint(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10).translate(0, 0.05, 0), 0xf2e6d8), tint(new THREE.TorusGeometry(0.06, 0.012, 4, 10).rotateX(Math.PI / 2).translate(0, 0.08, 0), 0xff6b6b)];
      else if (c.id === 21) parts = [box(0.24, 0.16, 0.12, 0, 0.08, 0, 0xf2f2f2), box(0.04, 0.12, 0.13, 0, 0.08, 0, 0xff4a4a), box(0.12, 0.04, 0.13, 0, 0.08, 0, 0xff4a4a)];
      else if (c.id === 22) parts = [tint(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8).translate(0, 0.07, 0), 0x3f8cff), tint(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6).translate(0, 0.155, 0), 0xffffff)];
      else if (c.id === 23) parts = [tint(new THREE.CylinderGeometry(0.06, 0.07, 0.22, 10).translate(0, 0.11, 0), 0x3f8cff), tint(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6).translate(0, 0.245, 0), 0xffffff)];
      else parts = [tint(new THREE.SphereGeometry(0.08, 8, 6).translate(0, 0.08, 0), 0xb64bff), tint(new THREE.CylinderGeometry(0.02, 0.03, 0.06, 6).translate(0, 0.17, 0), 0xffd23f)];
      break;
    }
    default:
      parts = [box(0.1, 0.1, 0.1, 0, 0, 0, 0xffffff)];
  }
  const g = merge(parts);
  cache.set(key, g);
  return g;
}

export const weaponMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });

/** Länge bis zur Mündung (für Mündungsfeuer) */
export function muzzleOffset(id: number): number {
  const m = WEAPONS[id]?.model;
  switch (m) {
    case 'pistol':
      return 0.22;
    case 'smg':
      return 0.5;
    case 'rifle':
    case 'burst':
      return 0.8;
    case 'shotgun':
      return 0.78;
    case 'sniper':
      return 1.1;
    case 'launcher':
      return 0.75;
    default:
      return 0.3;
  }
}

export const isGrenade = (id: number): boolean => id === GRENADE_ID;
