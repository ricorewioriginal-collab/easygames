// Gegenstände: Waffen, Verbrauchsgüter, Munition, Material. Alle Namen und Werte sind RIFTZONE-eigen.
import type { Rng } from './math';

export const enum Ammo {
  Light = 0,
  Medium = 1,
  Heavy = 2,
  Shells = 3,
  Rockets = 4,
}
export const AMMO_NAMES = ['Leichte Munition', 'Mittlere Munition', 'Schwere Munition', 'Schrot', 'Raketen'] as const;
export const AMMO_MAX = [360, 300, 60, 60, 12] as const;
export const AMMO_COLORS = [0xf0e6a0, 0x7fd0ff, 0x9fe870, 0xff8a5c, 0xff4a7a] as const;

export const RARITY_NAMES = ['Grundform', 'Verstärkt', 'Präzise', 'Meisterwerk', 'Rift'] as const;
export const RARITY_COLORS = [0xa8b3bf, 0x3ad6a8, 0x3f8cff, 0xd24bff, 0xffb02e] as const;
const RARITY_DMG = [1, 1.06, 1.12, 1.18, 1.25];
const RARITY_RELOAD = [1, 0.96, 0.92, 0.88, 0.82];

export const enum ItemType {
  Weapon = 0,
  Consumable = 1,
  Throwable = 2,
}

export interface WeaponDef {
  id: number;
  name: string;
  short: string;
  type: ItemType.Weapon | ItemType.Throwable;
  ammo: Ammo;
  damage: number;
  headMul: number;
  /** Schüsse pro Sekunde */
  rate: number;
  mag: number;
  reload: number;
  /** Streuung in Radiant (Hüfte / Zielen / Bewegung zusätzlich) */
  spreadHip: number;
  spreadAim: number;
  spreadMove: number;
  /** Rückstoß (Grad Pitch pro Schuss) */
  recoil: number;
  pellets: number;
  range: number;
  /** Ab dieser Entfernung fällt der Schaden linear auf falloffMin ab. */
  falloffStart: number;
  falloffMin: number;
  auto: boolean;
  /** Bauteil-Schadensfaktor */
  structMul: number;
  /** Zoom-Faktor beim Zielen */
  zoom: number;
  projectile: boolean;
  /** Grafikmodell-Typ */
  model: 'pistol' | 'smg' | 'rifle' | 'shotgun' | 'sniper' | 'launcher' | 'grenade' | 'burst';
  rarities: readonly number[];
  burst?: number;
}

export const WEAPONS: readonly WeaponDef[] = [
  {
    id: 0,
    name: 'Funkpistole',
    short: 'Pistole',
    type: ItemType.Weapon,
    ammo: Ammo.Light,
    damage: 24,
    headMul: 1.75,
    rate: 6.5,
    mag: 16,
    reload: 1.4,
    spreadHip: 0.03,
    spreadAim: 0.008,
    spreadMove: 0.02,
    recoil: 1.1,
    pellets: 1,
    range: 140,
    falloffStart: 30,
    falloffMin: 0.65,
    auto: false,
    structMul: 1,
    zoom: 1.25,
    projectile: false,
    model: 'pistol',
    rarities: [0, 1, 2, 3],
  },
  {
    id: 1,
    name: 'Hornisse MP',
    short: 'MP',
    type: ItemType.Weapon,
    ammo: Ammo.Light,
    damage: 17,
    headMul: 1.5,
    rate: 12,
    mag: 30,
    reload: 2.0,
    spreadHip: 0.045,
    spreadAim: 0.018,
    spreadMove: 0.02,
    recoil: 0.55,
    pellets: 1,
    range: 120,
    falloffStart: 22,
    falloffMin: 0.55,
    auto: true,
    structMul: 1,
    zoom: 1.3,
    projectile: false,
    model: 'smg',
    rarities: [0, 1, 2, 3, 4],
  },
  {
    id: 2,
    name: 'Pulsar Sturmgewehr',
    short: 'Sturmgewehr',
    type: ItemType.Weapon,
    ammo: Ammo.Medium,
    damage: 30,
    headMul: 1.5,
    rate: 5.6,
    mag: 30,
    reload: 2.3,
    spreadHip: 0.04,
    spreadAim: 0.006,
    spreadMove: 0.025,
    recoil: 0.85,
    pellets: 1,
    range: 260,
    falloffStart: 60,
    falloffMin: 0.7,
    auto: true,
    structMul: 1,
    zoom: 1.6,
    projectile: false,
    model: 'rifle',
    rarities: [0, 1, 2, 3, 4],
  },
  {
    id: 3,
    name: 'Triade Salvengewehr',
    short: 'Salve',
    type: ItemType.Weapon,
    ammo: Ammo.Medium,
    damage: 27,
    headMul: 1.6,
    rate: 2.2,
    mag: 24,
    reload: 2.5,
    spreadHip: 0.035,
    spreadAim: 0.004,
    spreadMove: 0.02,
    recoil: 0.6,
    pellets: 1,
    range: 260,
    falloffStart: 70,
    falloffMin: 0.7,
    auto: false,
    structMul: 1,
    zoom: 1.7,
    projectile: false,
    model: 'burst',
    rarities: [1, 2, 3],
    burst: 3,
  },
  {
    id: 4,
    name: 'Brecher Schrotflinte',
    short: 'Schrotflinte',
    type: ItemType.Weapon,
    ammo: Ammo.Shells,
    damage: 10.5,
    headMul: 1.6,
    rate: 1.1,
    mag: 5,
    reload: 4.4,
    spreadHip: 0.085,
    spreadAim: 0.06,
    spreadMove: 0.01,
    recoil: 4,
    pellets: 10,
    range: 45,
    falloffStart: 8,
    falloffMin: 0.25,
    auto: false,
    structMul: 1.4,
    zoom: 1.15,
    projectile: false,
    model: 'shotgun',
    rarities: [0, 1, 2, 3, 4],
  },
  {
    id: 5,
    name: 'Weitblick Präzisionsgewehr',
    short: 'Präzision',
    type: ItemType.Weapon,
    ammo: Ammo.Heavy,
    damage: 98,
    headMul: 2.4,
    rate: 0.42,
    mag: 1,
    reload: 2.6,
    spreadHip: 0.09,
    spreadAim: 0.0,
    spreadMove: 0.04,
    recoil: 7,
    pellets: 1,
    range: 600,
    falloffStart: 600,
    falloffMin: 1,
    auto: false,
    structMul: 1.2,
    zoom: 4,
    projectile: false,
    model: 'sniper',
    rarities: [2, 3, 4],
  },
  {
    id: 6,
    name: 'Donnerrohr Raketenwerfer',
    short: 'Raketenwerfer',
    type: ItemType.Weapon,
    ammo: Ammo.Rockets,
    damage: 85,
    headMul: 1,
    rate: 0.8,
    mag: 1,
    reload: 3.0,
    spreadHip: 0.01,
    spreadAim: 0.0,
    spreadMove: 0.0,
    recoil: 4,
    pellets: 1,
    range: 400,
    falloffStart: 400,
    falloffMin: 1,
    auto: false,
    structMul: 5,
    zoom: 1.3,
    projectile: true,
    model: 'launcher',
    rarities: [3, 4],
  },
  {
    id: 7,
    name: 'Riftgranate',
    short: 'Granate',
    type: ItemType.Throwable,
    ammo: Ammo.Light,
    damage: 85,
    headMul: 1,
    rate: 1,
    mag: 1,
    reload: 0,
    spreadHip: 0,
    spreadAim: 0,
    spreadMove: 0,
    recoil: 0,
    pellets: 1,
    range: 60,
    falloffStart: 0,
    falloffMin: 1,
    auto: false,
    structMul: 4,
    zoom: 1,
    projectile: true,
    model: 'grenade',
    rarities: [1],
  },
];

export const GRENADE_ID = 7;
export const GRENADE_MAX = 6;

export interface ConsumableDef {
  id: number;
  name: string;
  /** Benutzungsdauer in Sekunden */
  time: number;
  hp: number;
  hpCap: number;
  shield: number;
  shieldCap: number;
  stack: number;
  rarity: number;
}

// IDs ab 20, damit sie sich nicht mit Waffen überschneiden
export const CONSUMABLES: readonly ConsumableDef[] = [
  { id: 20, name: 'Pflaster', time: 3.2, hp: 15, hpCap: 75, shield: 0, shieldCap: 0, stack: 15, rarity: 0 },
  { id: 21, name: 'Medipack', time: 8, hp: 100, hpCap: 100, shield: 0, shieldCap: 0, stack: 3, rarity: 1 },
  { id: 22, name: 'Schildkapsel', time: 2, hp: 0, hpCap: 0, shield: 25, shieldCap: 50, stack: 6, rarity: 1 },
  { id: 23, name: 'Schildtank', time: 4.5, hp: 0, hpCap: 0, shield: 50, shieldCap: 100, stack: 3, rarity: 2 },
  { id: 24, name: 'Riftnektar', time: 2.2, hp: 25, hpCap: 100, shield: 25, shieldCap: 100, stack: 2, rarity: 3 },
];

export const consumable = (id: number): ConsumableDef | undefined => CONSUMABLES.find((c) => c.id === id);
export const weapon = (id: number): WeaponDef | undefined => (id >= 0 && id < WEAPONS.length ? WEAPONS[id] : undefined);
export const isWeaponId = (id: number): boolean => id >= 0 && id < WEAPONS.length && id !== GRENADE_ID;

export function itemName(id: number): string {
  return weapon(id)?.name ?? consumable(id)?.name ?? '';
}

export function stackSize(id: number): number {
  if (id === GRENADE_ID) return GRENADE_MAX;
  return consumable(id)?.stack ?? 1;
}

export function damageFor(w: WeaponDef, rarity: number): number {
  return w.damage * (RARITY_DMG[rarity] ?? 1);
}
export function reloadFor(w: WeaponDef, rarity: number): number {
  return w.reload * (RARITY_RELOAD[rarity] ?? 1);
}

/** Bodenbeute-Arten */
export const enum DropKind {
  Item = 0,
  Ammo = 1,
  Material = 2,
}

export interface DropSpec {
  kind: DropKind;
  /** Item-ID, Munitionsart oder Material */
  id: number;
  rarity: number;
  qty: number;
}

export function ammoPack(a: Ammo): number {
  return [30, 20, 6, 8, 2][a]!;
}

const WEAPON_WEIGHTS = [16, 18, 22, 8, 18, 5, 2];

function rollRarity(rng: Rng, tier: number, allowed: readonly number[]): number {
  const base = [44, 30, 17, 7, 2];
  const w = base.map((v, i) => (allowed.includes(i) ? v * (1 + tier * 0.6 * i) : 0));
  return rng.weighted([0, 1, 2, 3, 4], w);
}

export function rollWeapon(rng: Rng, tier: number): DropSpec {
  const wi = rng.weighted([0, 1, 2, 3, 4, 5, 6], WEAPON_WEIGHTS.map((v, i) => (i >= 5 ? v * (1 + tier) : v)));
  const w = WEAPONS[wi]!;
  return { kind: DropKind.Item, id: wi, rarity: rollRarity(rng, tier, w.rarities), qty: w.mag };
}

export function rollConsumable(rng: Rng): DropSpec {
  const c = rng.weighted([...CONSUMABLES, null], [30, 8, 26, 10, 3, 12]);
  if (!c) return { kind: DropKind.Item, id: GRENADE_ID, rarity: 1, qty: rng.int(1, 3) };
  return { kind: DropKind.Item, id: c.id, rarity: c.rarity, qty: c.id === 20 ? 5 : c.id === 22 ? 3 : 1 };
}

/** Bodenbeute an einem Punkt: Waffe mit passender Munition oder ein Verbrauchsgut. */
export function rollFloor(rng: Rng, tier: number): DropSpec[] {
  const r = rng.next();
  if (r < 0.5) {
    const w = rollWeapon(rng, tier);
    const def = WEAPONS[w.id]!;
    return [w, { kind: DropKind.Ammo, id: def.ammo, rarity: 0, qty: ammoPack(def.ammo) }];
  }
  if (r < 0.82) return [rollConsumable(rng)];
  const a = rng.weighted([0, 1, 2, 3, 4], [30, 30, 10, 20, 3]) as Ammo;
  return [{ kind: DropKind.Ammo, id: a, rarity: 0, qty: ammoPack(a) }];
}

/** Inhalt einer Riftkiste (immer Waffe + Verbrauchsgut + Munition + Material). */
export function rollChest(rng: Rng, tier: number): DropSpec[] {
  const w = rollWeapon(rng, tier + 1);
  const def = WEAPONS[w.id]!;
  const out: DropSpec[] = [w, rollConsumable(rng), { kind: DropKind.Ammo, id: def.ammo, rarity: 0, qty: ammoPack(def.ammo) * 2 }];
  out.push({ kind: DropKind.Material, id: rng.int(0, 2), rarity: 0, qty: 30 });
  if (rng.chance(0.3)) out.push(rollConsumable(rng));
  return out;
}

export function rollAmmoBox(rng: Rng): DropSpec[] {
  const out: DropSpec[] = [];
  const n = rng.int(2, 3);
  for (let i = 0; i < n; i++) {
    const a = rng.weighted([0, 1, 2, 3, 4], [30, 30, 12, 22, 4]) as Ammo;
    out.push({ kind: DropKind.Ammo, id: a, rarity: 0, qty: ammoPack(a) });
  }
  if (rng.chance(0.4)) out.push({ kind: DropKind.Item, id: GRENADE_ID, rarity: 1, qty: 2 });
  return out;
}
