// Die drei Parks von CONCRETE PULSE – alles eigene Entwürfe.
// Koordinaten in Metern, y = Höhe. rot: Drehung um die Hochachse (0 = Rampe steigt nach +z).
const PI = Math.PI;
const wallRing = (x0, z0, x1, z1, h, mat) => [
  { t: 'wall', x: (x0 + x1) / 2, z: z1 + 0.5, w: x1 - x0 + 2, d: 1, h, mat, top: 'wallTop' },
  { t: 'wall', x: (x0 + x1) / 2, z: z0 - 0.5, w: x1 - x0 + 2, d: 1, h, mat, top: 'wallTop' },
  { t: 'wall', x: x1 + 0.5, z: (z0 + z1) / 2, w: 1, d: z1 - z0, h, mat, top: 'wallTop' },
  { t: 'wall', x: x0 - 0.5, z: (z0 + z1) / 2, w: 1, d: z1 - z0, h, mat, top: 'wallTop' }
];
// Kicker vor einer Kiste: Rampe, die zur Kiste hin steigt
const kicker = (x, z, rot, w, d, h, y0 = 0) => ({ t: 'ramp', x, z, rot, w, d, h, y0 });
// Pyramide/Funbox: Kiste mit vier Rampen
function funbox(x, z, w, d, h, rd, grind = true) {
  return [
    { t: 'box', x, z, w, d, h, grind, mat: 'deck' },
    kicker(x, z - d / 2 - rd / 2, 0, w, rd, h), kicker(x, z + d / 2 + rd / 2, PI, w, rd, h),
    kicker(x - w / 2 - rd / 2, z, PI / 2, d, rd, h), kicker(x + w / 2 + rd / 2, z, -PI / 2, d, rd, h)
  ];
}
// Halfpipe: zwei QPs gegenüber, flach dazwischen; Achse entlang z
function halfpipe(x, z, w, flat, r, h, deck = 2.2, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), off = flat / 2;
  // QP1 steigt nach +z (lokal), QP2 nach −z
  return [
    { t: 'qp', x: x + s * off, z: z + c * off, rot, w, r, h, deck },
    { t: 'qp', x: x - s * off, z: z - c * off, rot: rot + PI, w, r, h, deck }
  ];
}

export const PARKS = [
  {
    id: 'hafen', name: 'Hafenkante', sub: 'Betonplaza am alten Hafen · Tag',
    hdr: 'tag', envRot: 1.2, fog: '#b8cde0', fogD: 0.0045, sun: [-0.45, -1, -0.35], sunI: 3.4, sunC: '#fff2dc', hemiI: 0.25, exposure: 0.88,
    ground: 'concrete', groundC: '#8c8981', palette: { ramp: '#b9b2a4', deck: '#8a6a48', wall: '#6e7a86', accent: '#ff5a3c', accent2: '#2ec4ff' },
    bounds: [-36, -36, 36, 36], spawn: [0, -12, 0], music: 0,
    elements: [
      ...wallRing(-36, -36, 36, 36, 3.2, 'graffiti'),
      // Nord- und Süd-Quarterpipes
      { t: 'qp', x: 0, z: 26.5, rot: 0, w: 26, r: 3.4, h: 2.8, deck: 2.4 },
      { t: 'qp', x: 0, z: -27, rot: PI, w: 22, r: 3.0, h: 2.4, deck: 2.4 },
      // Mittlere Funbox mit Kickern + Ledges
      { t: 'box', x: 0, z: 0, w: 6, d: 4, h: 0.9, grind: ['e', 'w'], mat: 'deck' },
      kicker(0, -3.6, 0, 6, 3.2, 0.9), kicker(0, 3.6, PI, 6, 3.2, 0.9),
      { t: 'rail', a: [-1.5, 1.45, -1.4], b: [-1.5, 1.45, 1.4] }, { t: 'rail', a: [1.5, 1.45, -1.4], b: [1.5, 1.45, 1.4] },
      // Flachrail West
      { t: 'rail', a: [-13, 0.55, -14], b: [-13, 0.55, 6] },
      // Bank-Ledge Ost
      { t: 'box', x: 14, z: -4, w: 1.2, d: 12, h: 0.5, grind: true, mat: 'ledge' },
      { t: 'box', x: 9, z: 10, w: 8, d: 1.0, h: 0.42, grind: true, mat: 'ledge' },
      // Plattform mit Treppe und Handlauf (Nordwest)
      { t: 'box', x: -24, z: 17, w: 12, d: 8, h: 1.4, grind: ['s', 'e'], mat: 'concrete' },
      { t: 'stairs', x: -24, z: 11.5, rot: PI, w: 5, d: 3, n: 5, h: 1.4 },
      { t: 'rail', a: [-21.25, 2.25, 13.3], b: [-21.25, 0.85, 9.6] },
      { t: 'ramp', x: -16.3, z: 17, rot: -PI / 2, w: 6, d: 3.4, h: 1.4 },
      // Container (Ost-Nord) mit Kicker
      { t: 'box', x: 23, z: 17, w: 2.6, d: 7, h: 2.6, grind: ['e', 'w'], mat: 'container', side: 'container' },
      kicker(23, 10.2, 0, 2.6, 3.0, 1.3),
      { t: 'box', x: 28.5, z: 17, w: 2.6, d: 7, h: 2.6, mat: 'container2', side: 'container2' },
      // Mini-Pool (Südost)
      { t: 'bowl', x: 19, z: -19, R: 6.2, depth: 2.2, rt: 2.6 },
      // Pyramide Südwest
      ...funbox(-17, -18, 4, 4, 1.0, 2.6),
      // Manual-Pad
      { t: 'box', x: 0, z: -14.5, w: 7, d: 2, h: 0.24, grind: ['n', 's'], mat: 'ledge' },
      // Poller/Pflanzkübel als Hindernisse
      { t: 'cyl', x: -6, z: 20, r: 0.9, h: 0.6, mat: 'planter' }, { t: 'cyl', x: 6, z: 20, r: 0.9, h: 0.6, mat: 'planter' },
      { t: 'cyl', x: 30, z: -4, r: 1.2, h: 0.7, mat: 'planter' }
    ],
    deco: [
      { t: 'crane', x: -52, z: 30 }, { t: 'crane', x: 50, z: 40 }, { t: 'ship', x: 0, z: 70 },
      { t: 'lamp', x: -30, z: -30 }, { t: 'lamp', x: 30, z: -30 }, { t: 'lamp', x: -30, z: 30 }, { t: 'lamp', x: 30, z: 30 }, { t: 'lamp', x: -30, z: 0 }, { t: 'lamp', x: 30, z: 4 },
      { t: 'tree', x: -33, z: -10 }, { t: 'tree', x: -33, z: 6 }, { t: 'tree', x: 33, z: 24 },
      { t: 'city', seed: 4, r: 85, n: 26, hMin: 10, hMax: 40 }
    ],
    letters: [[0, 2.6, 0], [-13, 1.6, -4], [-24, 2.6, 20], [23, 4.2, 17], [19, -1.4, -19]],
    tape: [28.5, 3.4, 15],
    gaps: [
      { name: 'Funbox-Sprung', pts: 250, from: [-3, -6, 3, -2], to: [-4, 2, 4, 8] },
      { name: 'Funbox-Sprung', pts: 250, from: [-3, 2, 3, 6], to: [-4, -8, 4, -2] },
      { name: 'Treppen-Satz', pts: 300, from: [-27, 9, -21, 21], to: [-30, -2, -18, 8.8] },
      { name: 'Auf den Container', pts: 400, from: [21, 8, 25, 12], to: [21.7, 13.5, 24.3, 20.5], minY: 2.4 },
      { name: 'Container-Hüpfer', pts: 500, from: [21.7, 13.5, 24.3, 20.5], to: [27.2, 13.5, 29.8, 20.5], minY: 2.4 },
      { name: 'Pool-Kante raus', pts: 200, from: [12, -26, 26, -12], to: [-40, -40, 40, 40], outBowl: true },
      { name: 'Pyramiden-Flug', pts: 250, from: [-21, -22, -13, -14], to: [-26, -27, -8, -9], over: true }
    ],
    goals: [
      { type: 'score', n: 15000, text: 'Erreiche 15.000 Punkte' },
      { type: 'score', n: 40000, text: 'Erreiche 40.000 Punkte' },
      { type: 'score', n: 90000, text: 'Erreiche 90.000 Punkte' },
      { type: 'letters', text: 'Sammle P-U-L-S-E' },
      { type: 'tape', text: 'Finde die versteckte Kassette' },
      { type: 'combo', n: 6000, text: 'Lande eine 6.000er-Combo' },
      { type: 'gap', gap: 'Container-Hüpfer', text: 'Spring von Container zu Container' },
      { type: 'trickgap', gap: 'Funbox-Sprung', trick: 'Kickflip', text: 'Kickflip über die Funbox' },
      { type: 'grindTime', n: 3, text: 'Grinde 3 Sekunden am Stück' },
      { type: 'manualTime', n: 4, text: 'Halte einen Manual 4 Sekunden' }
    ]
  },
  {
    id: 'dach', name: 'Dachgarten', sub: 'Halfpipe über den Dächern · Abendrot',
    hdr: 'abend', envRot: 2.4, fog: '#e0a07a', fogD: 0.004, sun: [0.75, -0.42, -0.3], sunI: 3.0, sunC: '#ffb27a', hemiI: 0.28, hemiC: '#ffb0a0', exposure: 1.05, skyTint: '#ffffff',
    ground: 'roof', groundC: '#7d7f86', palette: { ramp: '#e8e3da', deck: '#5b4a3c', wall: '#a35a44', accent: '#ffcf3a', accent2: '#ff4f8b' },
    bounds: [-34, -40, 34, 40], spawn: [-14, -6, Math.PI], music: 1,
    elements: [
      ...wallRing(-34, -40, 34, 40, 1.15, 'parapet'),
      // Große Halfpipe in der Mitte (fast senkrecht)
      ...halfpipe(0, 14, 12, 7, 3.3, 3.15, 2.4),
      // Erhöhte Dachflächen mit Banks
      { t: 'box', x: -14.75, z: -24, w: 22.5, d: 16, h: 2.4, grind: ['n', 'e'], mat: 'roofHigh' },
      { t: 'ramp', x: -14.75, z: -13.9, rot: PI, w: 10, d: 4.2, h: 2.4 },
      { t: 'ramp', x: -28.1, z: -24, rot: PI / 2, w: 8, d: 4.2, h: 2.4 },
      { t: 'box', x: 14.75, z: -24, w: 22.5, d: 16, h: 2.4, grind: ['n', 'w'], mat: 'roofHigh' },
      { t: 'ramp', x: 14.75, z: -13.9, rot: PI, w: 10, d: 4.2, h: 2.4 },
      // Lücke zwischen den Dächern (Sprung über den Lichtschacht)
      { t: 'box', x: 0, z: -24, w: 7, d: 16, h: 0.5, mat: 'glass', side: 'metalDark' },
      // Langes Dach-Rail
      { t: 'rail', a: [-28, 0.7, -6], b: [-28, 0.7, 26] },
      { t: 'rail', a: [28, 0.7, 26], b: [28, 0.7, -2] },
      // Abwärts-Rail von hohem Dach
      { t: 'rail', a: [-22, 3.2, -16.6], b: [-22, 0.9, -8] },
      // Lüftungsboxen als Ledges
      { t: 'box', x: -14, z: 2, w: 5, d: 2, h: 0.6, grind: true, mat: 'metalBox', side: 'metalBox' },
      { t: 'box', x: 14, z: 2, w: 5, d: 2, h: 0.6, grind: true, mat: 'metalBox', side: 'metalBox' },
      { t: 'box', x: 0, z: -7, w: 2, d: 1.2, h: 0.45, grind: ['e', 'w'], mat: 'ledge' },
      // Wassertank & Schornstein
      { t: 'cyl', x: 24, z: 32, r: 2.2, h: 3.4, mat: 'tank' }, { t: 'cyl', x: -24, z: 33, r: 1.0, h: 2.6, mat: 'brick' },
      // Kicker zum hohen Dach
      kicker(-9, -2, PI, 3, 3, 1.1)
    ],
    deco: [
      { t: 'city', seed: 9, r: 70, n: 34, hMin: 6, hMax: 55, lit: true }, { t: 'antenna', x: 30, z: 36 }, { t: 'billboard', x: 0, z: 46 },
      { t: 'lamp', x: -32, z: 0 }, { t: 'lamp', x: 32, z: 10 }, { t: 'lamp', x: -32, z: 30 }, { t: 'lamp', x: 32, z: -38 }
    ],
    letters: [[3, 5.0, 20.6], [-14, 3.6, -24], [14, 3.8, -20], [-28, 1.7, 10], [0, 1.3, -24]],
    tape: [-25, 2.9, -31],
    gaps: [
      { name: 'Lichtschacht-Sprung', pts: 600, from: [-26, -32, -3.5, -16], to: [3.5, -32, 26, -16], minY: 2.2 },
      { name: 'Lichtschacht-Sprung', pts: 600, from: [3.5, -32, 26, -16], to: [-26, -32, -3.5, -16], minY: 2.2 },
      { name: 'Halfpipe-Höhenflug', pts: 350, from: [-6, 4, 6, 24], to: [-6, 4, 6, 24], minAir: 1.2 },
      { name: 'Dachkanten-Drop', pts: 300, from: [-26, -32, 26, -16], to: [-34, -12, 34, 6] },
      { name: 'Über die Lüftung', pts: 200, from: [-17, -1, -11, 1], to: [-17, 3, -11, 6], over: true }
    ],
    goals: [
      { type: 'score', n: 30000, text: 'Erreiche 30.000 Punkte' },
      { type: 'score', n: 80000, text: 'Erreiche 80.000 Punkte' },
      { type: 'score', n: 160000, text: 'Erreiche 160.000 Punkte' },
      { type: 'letters', text: 'Sammle P-U-L-S-E' },
      { type: 'tape', text: 'Finde die versteckte Kassette' },
      { type: 'combo', n: 15000, text: 'Lande eine 15.000er-Combo' },
      { type: 'gap', gap: 'Lichtschacht-Sprung', text: 'Spring über den Lichtschacht' },
      { type: 'spin', n: 540, text: 'Lande eine 540er-Drehung' },
      { type: 'special', text: 'Lande einen Spezialtrick' },
      { type: 'grindTime', n: 5, text: 'Grinde 5 Sekunden am Stück' }
    ]
  },
  {
    id: 'neon', name: 'Neonbucht', sub: 'Pools und Neon an der Promenade · Nacht',
    hdr: 'nacht', envRot: 0.4, fog: '#1a1636', fogD: 0.0075, sun: [-0.3, -1, 0.5], sunI: 0.9, sunC: '#a8b8ff', hemiI: 0.22, hemiC: '#6a5cff', exposure: 1.25, envI: 0.6, bloomT: 0.6, bloomW: 0.55, neon: true,
    ground: 'tiles', groundC: '#3a3d4a', palette: { ramp: '#4a4f66', deck: '#2a2c38', wall: '#22243a', accent: '#ff3cf0', accent2: '#3cf0ff' },
    bounds: [-40, -40, 40, 40], spawn: [-10, -20, 0.5], music: 2,
    elements: [
      ...wallRing(-40, -40, 40, 40, 2.6, 'neonWall'),
      // Großer Pool
      { t: 'bowl', x: 8, z: 8, R: 9.5, depth: 3.1, rt: 3.4 },
      // Kleiner, tiefer Pool
      { t: 'bowl', x: -20, z: 18, R: 6, depth: 2.6, rt: 2.7 },
      // Vert-Rampe (Westseite)
      { t: 'qp', x: -30, z: -10, rot: -PI / 2, w: 14, r: 3.8, h: 3.75, deck: 2.4 },
      // Gegenüber: Bank zur Ostwand
      { t: 'qp', x: 31, z: -20, rot: PI / 2, w: 14, r: 4.2, h: 2.4, deck: 2.4 },
      // Neon-Rails
      { t: 'rail', a: [-6, 0.6, -30], b: [18, 0.6, -30], mat: 'neonRail' },
      { t: 'rail', a: [-14, 0.8, -6], b: [-14, 0.8, -24], mat: 'neonRail' },
      // Hügel mit Abwärts-Rail
      { t: 'box', x: 26, z: 30, w: 14, d: 10, h: 2.0, grind: ['s', 'w'], mat: 'tilesHigh' },
      { t: 'ramp', x: 26, z: 22.5, rot: 0, w: 8, d: 5, h: 2.0 },
      { t: 'rail', a: [19.6, 2.8, 32], b: [11, 0.7, 32], mat: 'neonRail' },
      { t: 'ramp', x: 17, z: 27.5, rot: PI / 2, w: 4, d: 4, h: 2.0 },
      // Kicker-Strecke Süd
      kicker(4, -18, 0, 3, 2.6, 1.0), { t: 'box', x: 4, z: -15.6, w: 3, d: 2.2, h: 1.0, grind: ['e', 'w'], mat: 'deck' },
      kicker(-4, -12, PI, 3, 2.6, 1.1),
      // Bänke (Ledges)
      { t: 'box', x: -26, z: -32, w: 8, d: 1.2, h: 0.45, grind: true, mat: 'ledge' },
      { t: 'box', x: 30, z: 4, w: 1.2, d: 8, h: 0.45, grind: true, mat: 'ledge' },
      { t: 'cyl', x: -30, z: 30, r: 1.6, h: 0.7, mat: 'planter' }, { t: 'cyl', x: 2, z: 30, r: 1.4, h: 0.6, mat: 'planter' }
    ],
    deco: [
      { t: 'city', seed: 17, r: 80, n: 30, hMin: 8, hMax: 46, lit: true, neon: true }, { t: 'palm', x: -36, z: -36 }, { t: 'palm', x: 36, z: -36 }, { t: 'palm', x: -36, z: 36 }, { t: 'palm', x: 36, z: 36 }, { t: 'palm', x: -36, z: 2 },
      { t: 'neonLamp', x: -38, z: -20 }, { t: 'neonLamp', x: 38, z: 0 }, { t: 'neonLamp', x: 0, z: 38 }, { t: 'neonLamp', x: 0, z: -38 }, { t: 'billboard', x: 0, z: 50 }
    ],
    letters: [[8, -2.2, 8], [-20, -1.8, 18], [-33.6, 5.2, -10], [14, 3.2, 31], [5, 1.7, -30]],
    tape: [26, 3.0, 33],
    gaps: [
      { name: 'Pool-Ausflug', pts: 400, from: [-1.5, -1.5, 17.5, 17.5], to: [-40, -40, 40, 40], outBowl: true },
      { name: 'Kicker-Kette', pts: 350, from: [2, -20, 6, -16.7], to: [2.5, -16.7, 5.5, -14.5], minY: 0.9 },
      { name: 'Hügel-Abflug', pts: 300, from: [19, 25, 33, 35], to: [-5, 10, 19, 24] },
      { name: 'Vert-Höhenflug', pts: 500, from: [-40, -17, -28, -3], to: [-40, -17, -28, -3], minAir: 1.4 }
    ],
    goals: [
      { type: 'score', n: 50000, text: 'Erreiche 50.000 Punkte' },
      { type: 'score', n: 120000, text: 'Erreiche 120.000 Punkte' },
      { type: 'score', n: 250000, text: 'Erreiche 250.000 Punkte' },
      { type: 'letters', text: 'Sammle P-U-L-S-E' },
      { type: 'tape', text: 'Finde die versteckte Kassette' },
      { type: 'combo', n: 30000, text: 'Lande eine 30.000er-Combo' },
      { type: 'gap', gap: 'Vert-Höhenflug', text: 'Flieg 1,4 Sekunden an der Vert-Rampe' },
      { type: 'spin', n: 720, text: 'Lande eine 720er-Drehung' },
      { type: 'special', text: 'Lande einen Spezialtrick' },
      { type: 'gap', gap: 'Pool-Ausflug', text: 'Flieg aus dem großen Pool' }
    ]
  }
];

// Eigene Figuren – keine realen Personen
export const SKATERS = [
  { id: 'mika', name: 'Mika Sturm', style: 'Street', body: 'm', skin: '#c9926a', top: '#ff6a2a', bottom: '#26324d', shoes: '#f2f2f2', topStyle: 'tee', bottomStyle: 'pants', hair: '#2b1b12', hairStyle: 'short', hat: { type: 'cap', color: '#1fb6ff', back: true },
    stats: { speed: 6, ollie: 5, spin: 5, balance: 6, air: 5 }, board: 0,
    specials: [{ name: 'Pulsar-Flip', pts: 1500, dur: 0.85, roll: 3, yaw: 1 }, { name: 'Kometen-Grab', pts: 1400, dur: 0.9, yaw: 1, pitch: 0.5 }, { name: 'Funkenstrich', pts: 1200, pps: 450 }] },
  { id: 'juna', name: 'Juna Kade', style: 'Vert', body: 'f', skin: '#8d5a3b', top: '#7c4dff', bottom: '#1d1f29', shoes: '#ffd43a', topStyle: 'tank', bottomStyle: 'pants', hair: '#120c08', hairStyle: 'pony', hat: { type: 'helmet', color: '#ff3c7a' },
    stats: { speed: 5, ollie: 7, spin: 7, balance: 4, air: 7 }, board: 1,
    specials: [{ name: 'Sternenwirbel 900', pts: 1800, dur: 1.0, yaw: 2.5 }, { name: 'Himmelsleiter', pts: 1500, dur: 0.95, pitch: 1, roll: 1 }, { name: 'Neonfaden', pts: 1300, pps: 480 }] },
  { id: 'ole', name: 'Ole Brandt', style: 'Technik', body: 'm', skin: '#f0c7a3', top: '#2ecc71', bottom: '#5a4636', shoes: '#222222', topStyle: 'long', bottomStyle: 'shorts', hair: '#d9a441', hairStyle: 'short', hat: { type: 'beanie', color: '#e8e4d8' },
    stats: { speed: 5, ollie: 5, spin: 6, balance: 8, air: 4 }, board: 2,
    specials: [{ name: 'Dreifach-Kick', pts: 1600, dur: 0.95, roll: 3 }, { name: 'Wolkenkratzer', pts: 1300, dur: 0.85, pitch: 1 }, { name: 'Endlos-Smith', pts: 1400, pps: 520, yawOff: -0.4, pitch: 0.25 }] },
  { id: 'zara', name: 'Zara Nox', style: 'Allround', body: 'f', skin: '#e6b48f', top: '#111318', bottom: '#3b5bdb', shoes: '#ff4f8b', topStyle: 'long', bottomStyle: 'pants', hair: '#ff4f8b', hairStyle: 'long', hat: null,
    stats: { speed: 7, ollie: 6, spin: 5, balance: 5, air: 6 }, board: 3, unlock: 6,
    specials: [{ name: 'Nachtfalter-Flip', pts: 1600, dur: 0.9, roll: 2, yaw: 1 }, { name: 'Rückenwind', pts: 1500, dur: 0.95, yaw: 1.5, pitch: 0.5 }, { name: 'Glutspur', pts: 1350, pps: 500 }] },
  { id: 'timo', name: 'Timo Flink', style: 'Tempo', body: 'm', skin: '#5c3a26', top: '#ffd43a', bottom: '#1c1c1c', shoes: '#3cf0ff', topStyle: 'tank', bottomStyle: 'shorts', hair: '#0e0a08', hairStyle: 'afro', hat: null,
    stats: { speed: 9, ollie: 6, spin: 4, balance: 5, air: 5 }, board: 4, unlock: 12,
    specials: [{ name: 'Turbo-Kick', pts: 1500, dur: 0.8, roll: 2, pitch: 0.5 }, { name: 'Raketenstart', pts: 1600, dur: 1.0, yaw: 2 }, { name: 'Blitzleiter', pts: 1400, pps: 560 }] },
  { id: 'lia', name: 'Lia Wirbel', style: 'Show', body: 'f', skin: '#c58c63', top: '#3cf0ff', bottom: '#ff3cf0', shoes: '#ffffff', topStyle: 'tee', bottomStyle: 'shorts', hair: '#6a3dff', hairStyle: 'bob', hat: { type: 'cap', color: '#111111' },
    stats: { speed: 6, ollie: 7, spin: 8, balance: 6, air: 7 }, board: 5, unlock: 20,
    specials: [{ name: 'Wirbelsturm 1080', pts: 2200, dur: 1.15, yaw: 3 }, { name: 'Schmetterling', pts: 1700, dur: 0.95, roll: 1, pitch: 1 }, { name: 'Regenbogenbahn', pts: 1500, pps: 600 }] }
];

export const BOARDS = [
  { name: 'Pulse Klassik', c1: '#ff2d6f', c2: '#3a1cff', c3: '#ffd43a', pattern: 'bolt', label: 'PULSE' },
  { name: 'Lila Welle', c1: '#7c4dff', c2: '#1b0f3a', c3: '#3cf0ff', pattern: 'wave', label: 'WAVE' },
  { name: 'Grünstreifen', c1: '#2ecc71', c2: '#0b3d2a', c3: '#e8e4d8', pattern: 'stripes', label: 'LINE' },
  { name: 'Nachtpunkte', c1: '#111318', c2: '#2a2d3a', c3: '#ff4f8b', pattern: 'dots', label: 'NOX' },
  { name: 'Gelbblitz', c1: '#ffd43a', c2: '#ff7a1a', c3: '#111111', pattern: 'bolt', label: 'FAST' },
  { name: 'Raster', c1: '#3cf0ff', c2: '#ff3cf0', c3: '#ffffff', pattern: 'grid', label: 'SHOW' },
  { name: 'Beton', c1: '#9a9a96', c2: '#5c5c58', c3: '#ff5a3c', pattern: 'stripes', label: 'BETON', unlock: 9 },
  { name: 'Goldkante', c1: '#ffcf3a', c2: '#8a5a00', c3: '#fff3c4', pattern: 'grid', label: 'GOLD', unlock: 25 }
];
