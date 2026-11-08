/**
 * Die Insel „Isla Corazón“: Höhenfunktion (Gelände, Kollision und Karte nutzen dieselbe Formel),
 * Orte, Wege und Bodentypen. Koordinaten in Metern, Norden = −z, Meeresspiegel y = 0.
 */
import { fbm, smooth, lerp } from './noise';

export interface Poi { id: string; name: string; x: number; z: number; icon: string }
export const POIS: Poi[] = [
  { id: 'harbor', name: 'Hafen', x: 34, z: 196, icon: '⚓' },
  { id: 'plaza', name: 'Marktplatz', x: 0, z: 150, icon: '⛲' },
  { id: 'bar', name: 'Bar „Gezeitenperle“', x: -34, z: 142, icon: '🍹' },
  { id: 'shop', name: 'Kramladen', x: 32, z: 138, icon: '🛍️' },
  { id: 'museum', name: 'Inselmuseum', x: 0, z: 116, icon: '🏛️' },
  { id: 'house', name: 'Dein Strandhaus', x: -128, z: 168, icon: '🏠' },
  { id: 'sunset', name: 'Sonnenstrand', x: 128, z: 178, icon: '🌅' },
  { id: 'cave', name: 'Höhle der Gezeiten', x: 188, z: 28, icon: '🕳️' },
  { id: 'ruins', name: 'Dschungelruine', x: -104, z: -18, icon: '🗿' },
  { id: 'lagoon', name: 'Smaragdlagune', x: -18, z: -62, icon: '💧' },
  { id: 'lighthouse', name: 'Leuchtturm', x: -150, z: -146, icon: '🗼' },
  { id: 'temple', name: 'Vulkantempel', x: 70, z: -92, icon: '🌋' },
  { id: 'volcano', name: 'Vulkan', x: 104, z: -136, icon: '⛰️' },
];
export const poi = (id: string) => POIS.find((p) => p.id === id)!;

/** Ebene Flächen: Ziel-Höhe h im Radius r, weicher Übergang soft */
const FLATS = [
  { x: 0, z: 140, r: 62, soft: 34, h: 3.2 }, // Städtchen
  { x: 34, z: 192, r: 16, soft: 12, h: 1.6 }, // Hafenkai
  { x: -128, z: 166, r: 15, soft: 14, h: 1.7 }, // Strandhaus
  { x: -104, z: -18, r: 22, soft: 16, h: 9 }, // Ruine
  { x: -18, z: -62, r: 21, soft: 14, h: 4.2 }, // Lagune (Senke)
  { x: -150, z: -146, r: 12, soft: 16, h: 24 }, // Leuchtturm-Kap
  { x: 70, z: -92, r: 14, soft: 14, h: 30 }, // Tempel-Plateau
  { x: 200, z: 30, r: 10, soft: 10, h: 1.1 }, // Strand vor der Höhle
  { x: 128, z: 180, r: 16, soft: 18, h: 1.4 }, // Sonnenstrand
];

/** Wege (Polylinien) – werden eingefärbt und leicht geglättet */
export const ROADS: [number, number][][] = [
  [[34, 230], [34, 196], [20, 168], [0, 150], [0, 118]],
  [[0, 150], [-34, 142], [-70, 150], [-104, 162], [-128, 168]],
  [[0, 150], [32, 138], [70, 150], [104, 168], [128, 178]],
  [[0, 118], [-10, 80], [-14, 30], [-18, -40]],
  [[-14, 30], [-60, 6], [-104, -18]],
  [[-104, -18], [-126, -70], [-140, -116], [-150, -146]],
  [[-14, 30], [30, -20], [56, -62], [70, -92]],
  [[70, 150], [120, 110], [160, 60], [196, 32]],
];

function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax,
    dz = bz - az,
    l = dx * dx + dz * dz,
    t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l));
  const qx = ax + dx * t - px,
    qz = az + dz * t - pz;
  return Math.sqrt(qx * qx + qz * qz);
}
export function roadDist(x: number, z: number): number {
  let m = 1e9;
  for (const r of ROADS) for (let i = 1; i < r.length; i++) m = Math.min(m, segDist(x, z, r[i - 1][0], r[i - 1][1], r[i][0], r[i][1]));
  return m;
}

const g = (x: number, z: number, cx: number, cz: number, r: number) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));

/** Küstenabstand, unbeschränkt: < 0 Meer, 0…1 Übergang, > 1 Landesinneres */
function coastT(x: number, z: number): number {
  const a = Math.atan2(z, x),
    d = Math.hypot(x, z);
  let R = 222 + 18 * Math.sin(2 * a + 0.6) + 12 * Math.sin(5 * a + 2) + 26 * (fbm(Math.cos(a) * 1.7 + 3, Math.sin(a) * 1.7 + 3, 3) - 0.5);
  // Kaps und Buchten
  R += 46 * g(x, z, -165, -160, 60) + 30 * g(x, z, 200, 30, 50) + 20 * g(x, z, -135, 175, 40);
  return (R + 6 - d) / 40;
}
/** Inselmaske 0 (Meer) … 1 (Landesinneres) */
export function landMask(x: number, z: number): number {
  return smooth(0, 1, coastT(x, z));
}

/** Geländehöhe in Metern */
export function height(x: number, z: number): number {
  const ct = coastT(x, z),
    m = smooth(0, 1, ct);
  const n = fbm(x * 0.0065 + 11, z * 0.0065 - 4, 5);
  let land = 1.3 + smooth(0.34, 0.9, m) * (4 + 26 * n * n + 7 * fbm(x * 0.03, z * 0.03, 2));
  // Vulkan mit Krater
  const dv = Math.hypot(x - 104, z + 136);
  land += 86 * Math.exp(-Math.pow(dv / 70, 1.7)) - 30 * Math.exp(-((dv / 15) ** 2));
  // Klippe um die Höhle, Kap-Hügel
  land += 20 * g(x, z, 168, 22, 26) + 14 * g(x, z, -150, -146, 34);
  // flach abfallender Meeresgrund (türkises Flachwasser an den Stränden)
  const sea = -0.8 - 13.2 * smooth(0, -1.3, ct);
  let h = lerp(sea, land, smooth(0, 0.24, m));
  for (const f of FLATS) {
    const d = Math.hypot(x - f.x, z - f.z),
      w = smooth(f.r + f.soft, f.r, d);
    if (w > 0) h = lerp(h, f.h, w);
  }
  // Wege leicht einebnen (nur an Land)
  if (h > 1) {
    const rd = roadDist(x, z);
    if (rd < 6) h = lerp(h, h * 0.97 + 0.1, smooth(6, 2, rd));
  }
  return h;
}

/** Bodentyp für Farbe und Schrittgeräusch */
export type Ground = 'sand' | 'grass' | 'jungle' | 'rock' | 'road' | 'ash';
export function ground(x: number, z: number, h = height(x, z)): Ground {
  if (h > 1 && roadDist(x, z) < 3.2) return 'road';
  const dv = Math.hypot(x - 104, z + 136);
  if (dv < 62 && h > 22) return h > 40 ? 'ash' : 'rock';
  if (h < 2.6 || (h < 4 && landMask(x, z) < 0.42)) return 'sand';
  const j = fbm(x * 0.012 - 7, z * 0.012 + 3, 3);
  if (j > 0.43 + smooth(10, 90, z) * 0.6) return 'jungle';
  return 'grass';
}

/** Geländenormale (für Neigung) */
export function slope(x: number, z: number): number {
  const e = 1,
    hx = height(x + e, z) - height(x - e, z),
    hz = height(x, z + e) - height(x, z - e);
  return Math.hypot(hx, hz) / (2 * e);
}

export const LAGOON = { x: -18, z: -62, r: 19, y: 5.4 };
export const WORLD_HALF = 330;
