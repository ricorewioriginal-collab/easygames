// Die von Hand entworfene Karte der Insel „Aurelia“: Orte, Fluss, See, Straßen und Höhenzüge.
// Koordinaten in Metern, x nach Osten, z nach Süden (Norden = kleines z).

export type PoiKind =
  | 'lighthouse'
  | 'peak'
  | 'mill'
  | 'city'
  | 'forest'
  | 'crater'
  | 'farm'
  | 'dam'
  | 'harbor'
  | 'mine'
  | 'canyon'
  | 'motel'
  | 'radio'
  | 'resort';

export interface Poi {
  id: number;
  name: string;
  kind: PoiKind;
  x: number;
  z: number;
  /** Radius des Ortes (Beschriftung, Bots, Absprungziele). */
  r: number;
  /** Radius, in dem das Gelände eingeebnet wird (0 = gar nicht). */
  flat: number;
  /** Zielhöhe beim Einebnen (null = Höhe des Geländes in der Mitte). */
  level: number | null;
  /** Wie viel Beute der Ort hat (Bots und Kartenlegende). */
  loot: 1 | 2 | 3;
}

export const POIS: readonly Poi[] = [
  { id: 0, name: 'Leuchtturmspitze', kind: 'lighthouse', x: 262, z: 236, r: 55, flat: 46, level: 15, loot: 1 },
  { id: 1, name: 'Frostgipfel', kind: 'peak', x: 520, z: 300, r: 45, flat: 34, level: null, loot: 2 },
  { id: 2, name: 'Nebelmühle', kind: 'mill', x: 840, z: 330, r: 80, flat: 78, level: 8, loot: 2 },
  { id: 3, name: 'Neonviertel', kind: 'city', x: 1150, z: 400, r: 115, flat: 118, level: null, loot: 3 },
  { id: 4, name: 'Glimmerwald', kind: 'forest', x: 340, z: 720, r: 120, flat: 0, level: null, loot: 2 },
  { id: 5, name: 'Riftkrater', kind: 'crater', x: 768, z: 768, r: 100, flat: 0, level: null, loot: 3 },
  { id: 6, name: 'Sonnenhof', kind: 'farm', x: 1190, z: 770, r: 95, flat: 92, level: null, loot: 2 },
  { id: 7, name: 'Flusswerk', kind: 'dam', x: 1030, z: 545, r: 55, flat: 50, level: 7, loot: 2 },
  { id: 8, name: 'Kobalthafen', kind: 'harbor', x: 372, z: 1128, r: 115, flat: 112, level: 5.2, loot: 3 },
  { id: 9, name: 'Kupfermine', kind: 'mine', x: 1120, z: 1140, r: 90, flat: 70, level: null, loot: 2 },
  { id: 10, name: 'Rostschlucht', kind: 'canyon', x: 760, z: 1250, r: 80, flat: 64, level: null, loot: 2 },
  { id: 11, name: 'Rastplatz Neun', kind: 'motel', x: 560, z: 955, r: 45, flat: 44, level: null, loot: 1 },
  { id: 12, name: 'Funkstation Ost', kind: 'radio', x: 1385, z: 1000, r: 35, flat: 30, level: 11, loot: 1 },
  { id: 13, name: 'Kristallbucht', kind: 'resort', x: 175, z: 950, r: 55, flat: 50, level: 5, loot: 1 },
];

export type Line = readonly (readonly [number, number])[];

/** Der Fluss Silberlauf: von den Hängen des Frostgipfels nach Osten ins Meer. */
export const RIVER: Line = [
  [640, 250],
  [720, 300],
  [790, 360],
  [880, 400],
  [960, 470],
  [1030, 530],
  [1110, 580],
  [1220, 600],
  [1330, 590],
  [1460, 575],
];

export const LAKES: readonly { x: number; z: number; r: number }[] = [
  { x: 285, z: 690, r: 48 },
  { x: 930, z: 1010, r: 30 },
];

/** Straßen (für Fahrzeuge, Kartendarstellung und sanftes Gelände). */
export const ROADS: readonly Line[] = [
  // Hafen – Rastplatz – Krater – Neonviertel
  [
    [372, 1110],
    [470, 1030],
    [560, 955],
    [660, 860],
    [768, 790],
    [880, 640],
    [1000, 560],
    [1090, 470],
    [1150, 400],
  ],
  // Glimmerwald – Krater – Sonnenhof
  [
    [340, 720],
    [470, 740],
    [620, 760],
    [768, 768],
    [930, 780],
    [1080, 770],
    [1190, 770],
  ],
  // Sonnenhof – Kupfermine – Rostschlucht – Hafen
  [
    [1190, 770],
    [1190, 900],
    [1140, 1040],
    [1120, 1140],
    [980, 1200],
    [860, 1250],
    [760, 1250],
    [620, 1210],
    [480, 1170],
    [372, 1128],
  ],
  // Nebelmühle – Krater
  [
    [840, 330],
    [820, 450],
    [790, 600],
    [768, 768],
  ],
  // Leuchtturm – Glimmerwald
  [
    [262, 236],
    [300, 380],
    [330, 540],
    [340, 720],
  ],
  // Sonnenhof – Funkstation
  [
    [1190, 900],
    [1300, 960],
    [1385, 1000],
  ],
];

/** Berge und Hügel: Mittelpunkt, Höhe, Radius. */
export const MOUNTAINS: readonly { x: number; z: number; h: number; r: number }[] = [
  { x: 520, z: 300, h: 96, r: 150 },
  { x: 420, z: 230, h: 40, r: 110 },
  { x: 1130, z: 1160, h: 34, r: 170 },
  { x: 1020, z: 1060, h: 18, r: 120 },
  { x: 600, z: 560, h: 16, r: 140 },
];

export const CRATER = { x: 768, z: 768, r: 72, rim: 102, floor: 9, rimH: 12 };

/** Wüstenregion um die Rostschlucht. */
export const DESERT = { x: 760, z: 1240, r: 300 };

export const ISLAND_RADIUS = 690;

export function poiAt(x: number, z: number): Poi | null {
  let best: Poi | null = null,
    bd = Infinity;
  for (const p of POIS) {
    const d = Math.hypot(p.x - x, p.z - z);
    if (d < p.r && d < bd) {
      bd = d;
      best = p;
    }
  }
  return best;
}
