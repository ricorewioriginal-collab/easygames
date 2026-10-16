import type { ObjectDef, Part, Slot } from './types';

// Möbel- und Objektkatalog von RicoLife 3D.
// Teile werden mit kleinen Helfern beschrieben: B/C = Quader/Zylinder mit Unterkante y (Mittelpunkt wird berechnet),
// S = Kugel/Ellipsoid mit Mittelpunkt, RB/RC = gedrehte Quader/Zylinder mit Mittelpunkt.
// Ursprung = Mitte der Grundfläche am Boden, Vorderseite = +z, Maße in Metern.

type Opt = { r?: [number, number, number]; t?: number; e?: number };
const B = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, o: Opt = {}): Part => ({ s: 'box', p: [x, y + h / 2, z], d: [w, h, d], c, ...o });
const C = (x: number, y: number, z: number, dx: number, h: number, dz: number, c: string, o: Opt = {}): Part => ({ s: 'cyl', p: [x, y + h / 2, z], d: [dx, h, dz], c, ...o });
const S = (x: number, y: number, z: number, dx: number, dy: number, dz: number, c: string, o: Opt = {}): Part => ({ s: 'sph', p: [x, y, z], d: [dx, dy, dz], c, ...o });
const RB = (x: number, y: number, z: number, w: number, h: number, d: number, r: [number, number, number], c: string, o: Opt = {}): Part => ({ s: 'box', p: [x, y, z], d: [w, h, d], r, c, ...o });
const RC = (x: number, y: number, z: number, dx: number, h: number, dz: number, r: [number, number, number], c: string, o: Opt = {}): Part => ({ s: 'cyl', p: [x, y, z], d: [dx, h, dz], r, c, ...o });

// ---------- Palette ----------
const OAK = '#b07a4f', WAL = '#8a5a3b', BIR = '#d9b48a', DARKW = '#5a3d2b', PINE = '#e3c393';
const ANT = '#3a3d42', CRE = '#efe6d6', WHT = '#f2f1ec', STL = '#a9adb3', BLK = '#26282c', CHR = '#c9ccd1', BRASS = '#c8a24a';
const SAGE = '#9caf88', PET = '#2f6f73', MUS = '#d4a236', TER = '#c46a4a', ROSE = '#d8a0a0', NAVY = '#2f3e5c', SKY = '#8fb8d8';
const SCR = '#1d3557', CER = '#f5f5f2', WATER = '#5bb8d6', STONE = '#bdb6aa', SOIL = '#5b4030';
const G1 = '#5f8f4e', G2 = '#4a7a3d', G3 = '#7aa85c', G4 = '#3e6b35';
const FAB = [SAGE, PET, MUS, TER, CRE, ANT];
const WOODS = [OAK, WAL, BIR, DARKW, WHT];
const LACK = [WHT, ANT, SAGE, PET, '#e8d9c0'];

// ---------- Slots ----------
const sit = (x: number, z: number, y = 0.45, rot = 0): Slot => ({ x, z, rot, kind: 'sit', y });
const use = (x = 0, z = 0.85, rot = 180): Slot => ({ x, z, rot, kind: 'use' });
const stand = (x: number, z: number, rot = 0): Slot => ({ x, z, rot, kind: 'stand' });
const sleep = (x: number, z: number, y = 0.5): Slot => ({ x, z, rot: 0, kind: 'sleep', y });

// ---------- Bausteine ----------
/** vier Beine; sx/sz = Abstand der Beinmitten von der Mitte */
const legs4 = (sx: number, sz: number, h: number, th: number, c: string, round = false, y0 = 0, cz = 0, o: Opt = {}): Part[] =>
  [-sx, sx].flatMap((x) => [cz - sz, cz + sz].map((z) => (round ? C(x, y0, z, th, h, th, c, o) : B(x, y0, z, th, h, th, c, o))));

function sofa(w: number, n: number, o: { legH?: number; feet?: string; arm?: number; back?: number; pillow?: boolean; taper?: boolean } = {}): Part[] {
  const legH = o.legH ?? 0.08, arm = o.arm ?? 0.14, back = o.back ?? 0.82, feet = o.feet ?? OAK;
  const W = w - 0.08, inner = W - 2 * arm, sw = inner / n;
  const P: Part[] = [
    B(0, legH, 0.02, W, 0.33 - legH, 0.84, 'A'),
    B(0, legH, -0.33, W, back - legH, 0.2, 'A'),
    B(-(W / 2 - arm / 2), legH, 0.02, arm, 0.62 - legH, 0.86, 'A'),
    B(W / 2 - arm / 2, legH, 0.02, arm, 0.62 - legH, 0.86, 'A'),
    ...legs4(W / 2 - 0.06, 0.36, legH, 0.05, feet, true, 0, 0, o.taper ? { t: 1.6 } : {}),
  ];
  for (let i = 0; i < n; i++) {
    const x = -inner / 2 + sw * (i + 0.5);
    P.push(B(x, 0.33, 0.1, sw - 0.03, 0.12, 0.62, 'A'));
    P.push(B(x, 0.45, -0.17, sw - 0.04, back - 0.49, 0.14, 'A'));
  }
  if (o.pillow) P.push(B(-inner / 2 + 0.2, 0.45, -0.06, 0.32, 0.3, 0.1, 'B', { r: [0, 0, 10] }));
  return P;
}
const sofaSlots = (w: number, n: number, arm = 0.14): Slot[] => {
  const inner = w - 0.08 - 2 * arm, sw = inner / n;
  return Array.from({ length: n }, (_, i) => sit(+(-inner / 2 + sw * (i + 0.5)).toFixed(2), 0.12));
};

function bed(w: number, o: { frame?: string; head?: string; headH?: number; legH?: number; posts?: boolean; blanket?: string } = {}): Part[] {
  const fr = o.frame ?? OAK, hd = o.head ?? fr, headH = o.headH ?? 1.0, legH = o.legH ?? 0.12, bl = o.blanket ?? 'A';
  const W = w - 0.06;
  const P: Part[] = [
    B(0, legH, 0.02, W, 0.3 - legH, 1.9, fr),
    B(0, 0, -0.95, W + 0.02, headH, 0.08, hd),
    B(0, 0.3, 0.04, W - 0.08, 0.2, 1.84, CRE),
    B(0, 0.5, 0.28, W - 0.04, 0.05, 1.3, bl),
    B(0, 0.36, 0.95, W - 0.04, 0.17, 0.03, bl),
    B(0, 0.5, -0.42, W - 0.06, 0.07, 0.14, WHT),
    ...legs4(W / 2 - 0.05, 0.9, legH, 0.06, fr, false, 0, 0.02),
  ];
  for (const x of w === 1 ? [0] : [-0.45, 0.45]) P.push(B(x, 0.5, -0.72, w === 1 ? 0.6 : 0.72, 0.12, 0.32, WHT));
  if (o.posts) {
    for (const x of [-W / 2 + 0.03, W / 2 - 0.03]) for (const z of [-0.95, 0.95]) P.push(C(x, 0, z, 0.06, 2.0, 0.06, fr));
    P.push(B(0, 1.96, -0.95, W, 0.05, 0.05, fr), B(0, 1.96, 0.95, W, 0.05, 0.05, fr));
    P.push(B(-W / 2 + 0.03, 1.96, 0, 0.05, 0.05, 1.9, fr), B(W / 2 - 0.03, 1.96, 0, 0.05, 0.05, 1.9, fr));
    P.push(B(0, 1.98, 0, W - 0.1, 0.02, 1.8, 'B'));
  }
  return P;
}

function chair(seat: string, leg: string, o: { round?: boolean; backH?: number; slats?: boolean; arms?: boolean } = {}): Part[] {
  const bh = o.backH ?? 0.45;
  const P: Part[] = [
    B(0, 0.41, 0.05, 0.44, 0.05, 0.42, seat),
    ...legs4(0.19, 0.18, 0.41, 0.04, leg, !!o.round, 0, 0.05),
    B(-0.19, 0.46, -0.145, 0.04, bh, 0.04, leg),
    B(0.19, 0.46, -0.145, 0.04, bh, 0.04, leg),
    B(0, 0.46 + bh - 0.2, -0.15, 0.42, 0.18, 0.03, seat),
  ];
  if (o.slats) P.push(B(-0.08, 0.5, -0.15, 0.04, bh - 0.24, 0.025, leg), B(0.08, 0.5, -0.15, 0.04, bh - 0.24, 0.025, leg));
  if (o.arms) P.push(B(-0.24, 0.62, 0.05, 0.05, 0.04, 0.42, leg), B(0.24, 0.62, 0.05, 0.05, 0.04, 0.42, leg), B(-0.24, 0.46, 0.22, 0.04, 0.16, 0.04, leg), B(0.24, 0.46, 0.22, 0.04, 0.16, 0.04, leg));
  return P;
}

/** Unterschrank an der Rückseite einer Kachel (Tiefe 0.66), Höhe 0.9 */
function cabinet(w: number, top: string, front: string, o: { handle?: string; drawers?: boolean } = {}): Part[] {
  const W = w - 0.02, hc = o.handle ?? STL;
  const P: Part[] = [
    B(0, 0, -0.16, W - 0.04, 0.08, 0.58, BLK),
    B(0, 0.08, -0.18, W, 0.78, 0.62, front),
    B(0, 0.86, -0.17, W, 0.04, 0.66, top),
  ];
  const n = Math.max(1, Math.round(w));
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + (W / n) * (i + 0.5);
    if (o.drawers) {
      P.push(B(x, 0.7, 0.135, W / n - 0.03, 0.005, 0.01, '#8d8478'), B(x, 0.45, 0.135, W / n - 0.03, 0.005, 0.01, '#8d8478'));
      P.push(B(x, 0.77, 0.145, 0.22, 0.02, 0.02, hc), B(x, 0.55, 0.145, 0.22, 0.02, 0.02, hc), B(x, 0.3, 0.145, 0.22, 0.02, 0.02, hc));
    } else {
      P.push(B(x, 0.12, 0.135, W / n - 0.03, 0.005, 0.01, '#8d8478'));
      P.push(B(x, 0.72, 0.145, 0.26, 0.02, 0.02, hc));
    }
  }
  return P;
}

function plant(pot: string, potW: number, potH: number, leaves: Part[]): Part[] {
  return [C(0, 0, 0, potW, potH, potW, pot, { t: 1.2 }), C(0, potH - 0.02, 0, potW * 1.1, 0.03, potW * 1.1, SOIL), ...leaves];
}

function door(o: { frame?: string; panels?: boolean; glass?: 'strip' | 'full' | 'round' | 'lines'; handle?: string; thick?: number } = {}): Part[] {
  const fr = o.frame ?? WHT, hd = o.handle ?? STL, th = o.thick ?? 0.05;
  const P: Part[] = [
    B(-0.48, 0, 0, 0.06, 2.16, 0.16, fr),
    B(0.48, 0, 0, 0.06, 2.16, 0.16, fr),
    B(0, 2.1, 0, 1.0, 0.06, 0.16, fr),
    B(0, 0, 0, 0.88, 2.09, th, 'A'),
    C(0.34, 0.98, th / 2 + 0.025, 0.05, 0.02, 0.05, hd, { r: [90, 0, 0] }),
    B(0.29, 1.0, th / 2 + 0.05, 0.12, 0.02, 0.025, hd),
    C(0.34, 0.98, -th / 2 - 0.025, 0.05, 0.02, 0.05, hd, { r: [90, 0, 0] }),
    B(0.29, 1.0, -th / 2 - 0.05, 0.12, 0.02, 0.025, hd),
  ];
  if (o.panels) for (const y of [0.18, 1.1]) P.push(B(0, y, th / 2 + 0.006, 0.6, 0.78, 0.012, 'B'), B(0, y, -th / 2 - 0.006, 0.6, 0.78, 0.012, 'B'));
  if (o.glass === 'full') P.push(B(0, 0.95, 0, 0.6, 0.95, th + 0.01, 'glass'));
  if (o.glass === 'strip') for (const y of [1.0, 1.35, 1.7]) P.push(B(0, y, 0, 0.5, 0.18, th + 0.01, 'glass'));
  if (o.glass === 'round') P.push(RC(0, 1.55, 0, 0.36, th + 0.01, 0.36, [90, 0, 0], 'glass'), RC(0, 1.55, 0, 0.42, th + 0.006, 0.42, [90, 0, 0], BRASS));
  if (o.glass === 'lines') for (const x of [-0.2, 0, 0.2]) P.push(B(x, 0.4, 0, 0.06, 1.5, th + 0.01, 'glass'));
  return P;
}

function windowParts(w: number, o: { cross?: boolean; mullions?: number; arch?: boolean; round?: boolean; sill?: string; shutters?: boolean } = {}): Part[] {
  const W = w - 0.04, fr = 'A', sill = o.sill ?? STONE;
  if (o.round) {
    return [
      RC(0, 1.5, 0, 0.8, 0.14, 0.8, [90, 0, 0], fr),
      RC(0, 1.5, 0, 0.66, 0.02, 0.66, [90, 0, 0], 'glass'),
      RC(0, 1.5, 0.075, 0.7, 0.01, 0.7, [90, 0, 0], BRASS),
      B(0, 1.06, 0.06, 0.5, 0.04, 0.08, sill),
      B(0, 1.5, 0, 0.66, 0.03, 0.03, fr),
    ];
  }
  const top = o.arch ? 1.85 : 2.1;
  const P: Part[] = [
    B(0, 0.9, 0, W, 0.06, 0.14, fr),
    B(0, top - 0.06, 0, W, 0.06, 0.14, fr),
    B(-(W / 2 - 0.03), 0.9, 0, 0.06, top - 0.9, 0.14, fr),
    B(W / 2 - 0.03, 0.9, 0, 0.06, top - 0.9, 0.14, fr),
    B(0, 0.96, 0, W - 0.12, top - 1.02, 0.02, 'glass'),
    B(0, 0.86, 0.04, W + 0.02, 0.04, 0.12, sill),
  ];
  const m = o.mullions ?? (o.cross ? 1 : 0);
  for (let i = 1; i <= m; i++) P.push(B(-W / 2 + (W / (m + 1)) * i, 0.96, 0, 0.04, top - 1.02, 0.06, fr));
  if (o.cross) for (let i = 0; i <= m; i++) P.push(B(-W / 2 + (W / (m + 1)) * (i + 0.5), 0.9 + (top - 0.9) * 0.55, 0, W / (m + 1) - 0.06, 0.04, 0.06, fr));
  if (o.arch) {
    P.push(RC(0, 1.85, 0, W - 0.04, 0.14, 0.5, [90, 0, 0], fr));
    P.push(RC(0, 1.85, 0, W - 0.16, 0.02, 0.38, [90, 0, 0], 'glass'));
  }
  if (o.shutters) P.push(B(-W / 2 + 0.03, 0.92, 0.09, 0.06, 1.14, 0.02, 'B'), B(W / 2 - 0.03, 0.92, 0.09, 0.06, 1.14, 0.02, 'B'));
  return P;
}

function stairs(w: number, o: { floating?: boolean; spine?: string; posts?: string } = {}): Part[] {
  const W = w - 0.1, P: Part[] = [];
  for (let i = 0; i < 12; i++) {
    const top = (i + 1) * 0.25, zc = +(1.5 - (i + 0.5) * 0.25).toFixed(3);
    P.push(o.floating ? B(0, top - 0.06, zc, W, 0.06, 0.27, 'A') : B(0, 0, zc, W, top, 0.25, 'A'));
  }
  if (o.floating) P.push(RB(0, 1.45, 0, 0.22, 0.18, 3.8, [45, 0, 0], o.spine ?? ANT));
  else P.push(RB(-(w / 2 - 0.03), 1.5, 0, 0.04, 0.3, 4.0, [45, 0, 0], o.spine ?? WHT), RB(w / 2 - 0.03, 1.5, 0, 0.04, 0.3, 4.0, [45, 0, 0], o.spine ?? WHT));
  if (o.posts) P.push(C(-(w / 2 - 0.08), 0, 1.38, 0.08, 1.0, 0.08, o.posts), C(w / 2 - 0.08, 0, 1.38, 0.08, 1.0, 0.08, o.posts));
  return P;
}

/** Bild an der Wand (Rückseite), Mittelpunkt y */
function picture(w: number, h: number, y: number, frame: string, art: Part[]): Part[] {
  return [B(0, y - h / 2, -0.48, w, h, 0.03, frame), B(0, y - h / 2 + 0.04, -0.462, w - 0.08, h - 0.08, 0.005, '#f4efe4'), ...art];
}

export const OBJECTS: ObjectDef[] = [
  // ======================= WOHNEN =======================
  {
    id: 'sofa-wolkenbank', name: 'Sofa Wolkenbank', desc: 'Kuschelige Zweisitzer-Couch mit tiefen Polstern – perfekt für gemütliche Filmabende.',
    cat: 'living', price: 640, w: 2, d: 1, h: 0.85, parts: sofa(2, 2, { pillow: true }),
    colorsA: FAB, colorsB: [MUS, CRE, TER, PET], func: ['seat', 'sofa'], slots: sofaSlots(2, 2), comfort: 6, decor: 3,
  },
  {
    id: 'sofa-fjordruhe', name: 'Sofa Fjordruhe', desc: 'Skandinavischer Dreisitzer auf schlanken Nussbaumbeinen.',
    cat: 'living', price: 980, w: 3, d: 1, h: 0.85, parts: sofa(3, 3, { legH: 0.16, feet: WAL, taper: true, arm: 0.12 }),
    colorsA: [PET, SAGE, '#b9b2a6', MUS, ANT], func: ['seat', 'sofa'], slots: sofaSlots(3, 3, 0.12), comfort: 7, decor: 4,
  },
  {
    id: 'sofa-samtsalon', name: 'Sofa Samtsalon', desc: 'Opulenter Samt-Dreisitzer mit breiten Armlehnen und hoher Lehne.',
    cat: 'living', price: 1450, w: 3, d: 1, h: 0.92, parts: sofa(3, 3, { arm: 0.2, back: 0.9, feet: BRASS, pillow: true }),
    colorsA: ['#2e5e4e', '#6b2d3c', NAVY, MUS, ROSE], colorsB: [MUS, CRE, ROSE], func: ['seat', 'sofa'], slots: sofaSlots(3, 3, 0.2), comfort: 9, decor: 6,
  },
  {
    id: 'sessel-ohrenkuss', name: 'Ohrensessel Ohrenkuss', desc: 'Klassischer Ohrensessel mit hoher Lehne – ideal zum Lesen am Kamin.',
    cat: 'living', price: 520, w: 1, d: 1, h: 1.08,
    parts: [...sofa(1, 1, { back: 1.05, legH: 0.12, feet: WAL }), B(-0.32, 0.62, -0.18, 0.12, 0.38, 0.3, 'A'), B(0.32, 0.62, -0.18, 0.12, 0.38, 0.3, 'A')],
    colorsA: [TER, SAGE, PET, MUS, '#7b6a58'], func: ['seat'], slots: [sit(0, 0.12)], comfort: 7, decor: 4,
  },
  {
    id: 'sessel-korbwiege', name: 'Rattansessel Korbwiege', desc: 'Luftiger Korbsessel mit weichem Sitzkissen – bringt Urlaubsgefühl ins Wohnzimmer.',
    cat: 'living', price: 290, w: 1, d: 1, h: 0.95,
    parts: [
      C(0, 0, 0.02, 0.5, 0.06, 0.5, '#a27a46'),
      C(0, 0.06, 0.02, 0.24, 0.28, 0.24, '#c79a5b', { t: 2.2 }),
      C(0, 0.34, 0.02, 0.86, 0.1, 0.8, '#c79a5b'),
      C(0, 0.42, 0.04, 0.74, 0.08, 0.68, 'A'),
      RB(0, 0.68, -0.3, 0.86, 0.6, 0.08, [-12, 0, 0], '#c79a5b'),
      RB(0, 0.68, -0.24, 0.7, 0.42, 0.08, [-12, 0, 0], 'A'),
      RB(-0.4, 0.55, 0, 0.06, 0.3, 0.6, [0, 0, 8], '#c79a5b'),
      RB(0.4, 0.55, 0, 0.06, 0.3, 0.6, [0, 0, -8], '#c79a5b'),
    ],
    colorsA: [CRE, SAGE, TER, MUS], func: ['seat'], slots: [sit(0, 0.1)], comfort: 6, decor: 4,
  },
  {
    id: 'sitzsack-plumps', name: 'Sitzsack Plumps', desc: 'Formbarer Sitzsack zum Hineinfallenlassen. Jugendzimmer-Liebling.',
    cat: 'living', price: 90, w: 1, d: 1, h: 0.75,
    parts: [S(0, 0.22, 0.05, 0.86, 0.44, 0.82, 'A'), S(0, 0.45, -0.2, 0.72, 0.6, 0.42, 'A'), S(0, 0.38, 0.12, 0.5, 0.12, 0.4, 'A'), C(0, 0, 0.05, 0.6, 0.02, 0.6, '#555555')],
    colorsA: [MUS, TER, PET, ANT, ROSE, SAGE], func: ['seat'], slots: [sit(0, 0.1, 0.32)], comfort: 5, decor: 2,
  },
  {
    id: 'couchtisch-eichenrund', name: 'Couchtisch Eichenrund', desc: 'Runder Couchtisch aus geölter Eiche mit Ablageboden.',
    cat: 'living', price: 190, w: 1, d: 1, h: 0.42,
    parts: [C(0, 0.38, 0, 0.9, 0.04, 0.9, 'A'), C(0, 0.12, 0, 0.7, 0.02, 0.7, 'A'), ...legs4(0.27, 0.27, 0.38, 0.05, 'A', true, 0, 0, { t: 1.3 }), S(0.15, 0.44, 0.1, 0.14, 0.06, 0.14, TER), C(-0.15, 0.42, -0.1, 0.18, 0.03, 0.12, NAVY)],
    colorsA: WOODS, func: ['table'], decor: 3,
  },
  {
    id: 'couchtisch-glasklar', name: 'Couchtisch Glasklar', desc: 'Langer Couchtisch mit Glasplatte und verchromtem Kufengestell.',
    cat: 'living', price: 340, w: 2, d: 1, h: 0.42,
    parts: [B(0, 0.38, 0, 1.3, 0.025, 0.65, 'glass'), B(-0.6, 0, 0, 0.04, 0.38, 0.6, CHR), B(0.6, 0, 0, 0.04, 0.38, 0.6, CHR), B(0, 0.15, 0, 1.16, 0.02, 0.5, 'A'), B(-0.3, 0.17, 0, 0.3, 0.05, 0.22, MUS), B(0.25, 0.4, 0.1, 0.2, 0.03, 0.15, TER)],
    colorsA: [OAK, ANT, WHT, WAL], func: ['table'], decor: 4,
  },
  {
    id: 'sideboard-kiefernlinie', name: 'Sideboard Kiefernlinie', desc: 'Niedriges Sideboard mit drei Türen und Platz für Deko oder Plattenspieler.',
    cat: 'living', price: 420, w: 2, d: 1, h: 0.9,
    parts: [B(0, 0.12, -0.25, 1.8, 0.56, 0.45, 'A'), ...legs4(0.84, 0.18, 0.12, 0.04, WAL, true, 0, -0.25, { t: 1.4 }), B(-0.6, 0.15, -0.02, 0.57, 0.5, 0.01, 'B'), B(0, 0.15, -0.02, 0.57, 0.5, 0.01, 'B'), B(0.6, 0.15, -0.02, 0.57, 0.5, 0.01, 'B'), C(0.5, 0.68, -0.25, 0.14, 0.22, 0.14, SAGE, { t: 0.7 })],
    colorsA: WOODS, colorsB: [OAK, SAGE, TER, ANT, CRE], decor: 4,
  },
  {
    id: 'tv-flimmerkiste', name: 'Fernseher Flimmerkiste 32', desc: 'Kompakter Flachbildfernseher auf einem kleinen Lowboard.',
    cat: 'living', price: 450, w: 1, d: 1, h: 1.05,
    parts: [B(0, 0.08, -0.22, 0.96, 0.36, 0.42, 'A'), ...legs4(0.43, 0.16, 0.08, 0.04, BLK, false, 0, -0.22), B(0, 0.44, -0.3, 0.2, 0.02, 0.14, BLK), B(0, 0.46, -0.3, 0.04, 0.08, 0.03, BLK), B(0, 0.54, -0.3, 0.84, 0.5, 0.04, BLK), B(0, 0.565, -0.278, 0.8, 0.45, 0.005, SCR, { e: 0.6 }), B(0, 0.25, -0.005, 0.9, 0.005, 0.01, '#77706a')],
    colorsA: [WHT, OAK, ANT, WAL], func: ['tv'], breaks: true, decor: 2,
  },
  {
    id: 'tv-kinowand', name: 'Fernseher Kinowand 65', desc: 'Riesiger Flachbildschirm mit Soundbar auf langem Eichen-Lowboard.',
    cat: 'living', price: 1650, w: 2, d: 1, h: 1.45,
    parts: [B(0, 0.1, -0.22, 1.9, 0.4, 0.44, 'A'), ...legs4(0.9, 0.17, 0.1, 0.04, BLK, false, 0, -0.22), B(-0.48, 0.13, 0.002, 0.9, 0.34, 0.01, 'B'), B(0.48, 0.13, 0.002, 0.9, 0.34, 0.01, 'B'), B(0, 0.5, -0.32, 0.36, 0.02, 0.2, BLK), B(0, 0.52, -0.33, 0.06, 0.1, 0.03, BLK), B(0, 0.6, -0.34, 1.5, 0.84, 0.035, BLK), B(0, 0.62, -0.32, 1.46, 0.8, 0.005, SCR, { e: 0.6 }), B(0, 0.5, -0.12, 0.9, 0.07, 0.08, ANT)],
    colorsA: [OAK, WAL, WHT, ANT], colorsB: [OAK, ANT, WHT, SAGE], func: ['tv'], breaks: true, decor: 3,
  },
  {
    id: 'tv-retroglotze', name: 'Fernseher Retroglotze', desc: 'Röhrenfernseher im Holzgehäuse auf Spinnenbeinen. Rauscht charmant.',
    cat: 'living', price: 220, w: 1, d: 1, h: 1.15,
    parts: [B(0, 0.35, -0.12, 0.7, 0.55, 0.55, 'A'), B(-0.06, 0.4, 0.16, 0.48, 0.42, 0.01, BLK), S(-0.06, 0.61, 0.165, 0.44, 0.38, 0.03, SCR, { e: 0.5 }), C(0.25, 0.75, 0.16, 0.05, 0.02, 0.05, BRASS, { r: [90, 0, 0] }), C(0.25, 0.62, 0.16, 0.05, 0.02, 0.05, BRASS, { r: [90, 0, 0] }), B(0.25, 0.42, 0.16, 0.1, 0.12, 0.01, '#3b3227'), ...legs4(0.28, 0.2, 0.35, 0.03, BLK, true, 0, -0.12), RC(-0.1, 1.0, -0.15, 0.01, 0.3, 0.01, [0, 0, 25], CHR), RC(0.1, 1.0, -0.15, 0.01, 0.3, 0.01, [0, 0, -25], CHR)],
    colorsA: [WAL, OAK, '#d3c1a1', TER], func: ['tv'], breaks: true, decor: 3,
  },
  {
    id: 'stereo-klangturm', name: 'Stereoanlage Klangturm', desc: 'Kompaktanlage mit zwei Standlautsprechern. Bringt jede Party in Schwung.',
    cat: 'living', price: 380, w: 1, d: 1, h: 1.0,
    parts: [B(-0.36, 0, -0.25, 0.24, 1.0, 0.3, 'A'), B(0.36, 0, -0.25, 0.24, 1.0, 0.3, 'A'), C(-0.36, 0.68, -0.095, 0.16, 0.01, 0.16, BLK, { r: [90, 0, 0] }), C(0.36, 0.68, -0.095, 0.16, 0.01, 0.16, BLK, { r: [90, 0, 0] }), C(-0.36, 0.3, -0.095, 0.18, 0.01, 0.18, BLK, { r: [90, 0, 0] }), C(0.36, 0.3, -0.095, 0.18, 0.01, 0.18, BLK, { r: [90, 0, 0] }), B(0, 0, -0.25, 0.4, 0.5, 0.36, ANT), B(0, 0.5, -0.25, 0.4, 0.18, 0.34, BLK), B(0, 0.56, -0.078, 0.2, 0.05, 0.005, '#53d18a', { e: 0.7 }), C(0.12, 0.54, -0.075, 0.06, 0.01, 0.06, CHR, { r: [90, 0, 0] })],
    colorsA: [BLK, WAL, WHT, OAK], func: ['stereo'], slots: [use(0, 0.6)], decor: 2,
  },
  {
    id: 'stereo-vinylglueck', name: 'Plattenspieler-Möbel Vinylglück', desc: 'Retro-Konsole mit Plattenspieler, Röhrenverstärker und Plattenfach.',
    cat: 'living', price: 560, w: 1, d: 1, h: 0.9,
    parts: [B(0, 0.18, -0.2, 0.9, 0.52, 0.5, 'A'), ...legs4(0.4, 0.2, 0.18, 0.04, WAL, true, 0, -0.2, { t: 1.4 }), B(0, 0.7, -0.2, 0.5, 0.06, 0.4, '#2b2b2b'), C(-0.06, 0.76, -0.2, 0.3, 0.012, 0.3, BLK), C(-0.06, 0.772, -0.2, 0.08, 0.005, 0.08, TER), RB(0.15, 0.79, -0.18, 0.015, 0.015, 0.22, [0, 20, 0], CHR), B(0.32, 0.7, -0.25, 0.18, 0.12, 0.14, '#3a3530'), B(0, 0.2, 0.06, 0.82, 0.46, 0.01, '#d8c7a6'), ...[-0.3, -0.25, -0.2, -0.15].map((x, i) => B(x, 0.24, -0.15, 0.03, 0.38, 0.32, [TER, MUS, PET, CRE][i]))],
    colorsA: [WAL, OAK, WHT, SAGE], func: ['stereo'], slots: [use(0, 0.65)], decor: 4,
  },
  {
    id: 'regal-buecherwurm', name: 'Bücherregal Bücherwurm', desc: 'Hohes Bücherregal mit fünf Böden, gut gefüllt mit Lesestoff.',
    cat: 'living', price: 260, w: 1, d: 1, h: 1.95,
    parts: [B(-0.46, 0, -0.32, 0.04, 1.95, 0.34, 'A'), B(0.46, 0, -0.32, 0.04, 1.95, 0.34, 'A'), B(0, 0, -0.48, 0.92, 1.95, 0.02, 'A'), ...[0.04, 0.42, 0.8, 1.18, 1.56, 1.91].map((y) => B(0, y, -0.32, 0.88, 0.03, 0.32, 'A')), B(-0.22, 0.07, -0.33, 0.4, 0.3, 0.24, TER), B(0.2, 0.45, -0.33, 0.45, 0.26, 0.22, PET), B(-0.15, 0.83, -0.33, 0.55, 0.28, 0.22, MUS), B(0.25, 1.21, -0.33, 0.3, 0.24, 0.22, SAGE), B(-0.2, 1.21, -0.33, 0.3, 0.3, 0.22, NAVY), B(0, 1.59, -0.33, 0.6, 0.27, 0.22, CRE), S(0.3, 0.92, -0.32, 0.14, 0.18, 0.14, WHT)],
    colorsA: WOODS, func: ['bookshelf'], slots: [use(0, 0.55)], decor: 4,
  },
  {
    id: 'regal-wandleiter', name: 'Leiterregal Wandleiter', desc: 'Breites, angelehntes Leiterregal mit Büchern, Pflanzen und Körben.',
    cat: 'living', price: 340, w: 2, d: 1, h: 1.9,
    parts: [RB(-0.85, 0.95, -0.32, 0.05, 1.9, 0.05, [-6, 0, 0], 'A'), RB(0.85, 0.95, -0.32, 0.05, 1.9, 0.05, [-6, 0, 0], 'A'), RB(-0.85, 0.95, -0.1, 0.05, 1.9, 0.05, [-6, 0, 0], 'A'), RB(0.85, 0.95, -0.1, 0.05, 1.9, 0.05, [-6, 0, 0], 'A'), B(0, 0.3, -0.2, 1.68, 0.03, 0.4, 'A'), B(0, 0.8, -0.24, 1.68, 0.03, 0.34, 'A'), B(0, 1.3, -0.28, 1.68, 0.03, 0.28, 'A'), B(0, 1.75, -0.31, 1.68, 0.03, 0.22, 'A'), B(-0.4, 0.33, -0.2, 0.5, 0.28, 0.25, TER), B(0.4, 0.33, -0.2, 0.36, 0.24, 0.3, '#c9a76b'), B(0.2, 0.83, -0.24, 0.6, 0.25, 0.22, PET), B(-0.5, 1.33, -0.28, 0.4, 0.22, 0.18, MUS), C(0.5, 1.33, -0.28, 0.16, 0.14, 0.16, WHT), S(0.5, 1.53, -0.28, 0.3, 0.26, 0.26, G1), B(0, 1.78, -0.31, 0.7, 0.2, 0.16, SAGE)],
    colorsA: WOODS, func: ['bookshelf'], slots: [use(0, 0.6)], decor: 5,
  },
  {
    id: 'kamin-glutnest', name: 'Kamin Glutnest', desc: 'Gemauerter Kamin mit Holzsims. Prasselndes Feuer für kalte Winterabende.',
    cat: 'living', price: 1250, w: 2, d: 1, h: 1.5,
    parts: [B(0, 0, -0.3, 1.6, 1.15, 0.4, 'A'), B(0, 1.15, -0.28, 1.8, 0.08, 0.44, OAK), B(0, 0.12, -0.1, 0.8, 0.65, 0.01, '#1a1a1a'), B(0, 0, -0.02, 1.4, 0.06, 0.4, STONE), B(0, 0.14, -0.2, 0.6, 0.06, 0.18, DARKW), C(-0.08, 0.2, -0.2, 0.18, 0.32, 0.12, '#ff8a2a', { t: 0, e: 0.95 }), C(0.1, 0.2, -0.2, 0.15, 0.26, 0.1, '#ffbd45', { t: 0, e: 0.95 }), S(0, 0.22, -0.2, 0.4, 0.1, 0.16, '#ff5a1f', { e: 0.9 }), C(-0.6, 1.23, -0.3, 0.12, 0.22, 0.12, CRE), B(0.5, 1.23, -0.35, 0.3, 0.26, 0.04, MUS)],
    colorsA: ['#c9b9a6', WHT, '#9b5a45', ANT], func: ['fireplace'], slots: [use(0, 0.9)], light: { color: '#ff9a4a', intensity: 0.9 }, decor: 8,
  },
  {
    id: 'kaminofen-gusseisen', name: 'Kaminofen Gusseisen', desc: 'Freistehender Schwedenofen mit Sichtscheibe und Ofenrohr.',
    cat: 'living', price: 790, w: 1, d: 1, h: 2.4,
    parts: [B(0, 0, -0.05, 0.7, 0.04, 0.7, STONE), C(0, 0.04, -0.1, 0.5, 0.95, 0.45, 'A'), B(0, 0.25, 0.125, 0.3, 0.38, 0.01, '#1a1a1a'), S(0, 0.32, 0.12, 0.22, 0.18, 0.03, '#ff8a2a', { e: 0.95 }), C(0, 0.99, -0.1, 0.52, 0.04, 0.47, 'A'), C(0, 1.03, -0.12, 0.15, 1.37, 0.15, 'A'), B(0.12, 0.7, 0.13, 0.03, 0.12, 0.03, CHR), C(-0.42, 0.04, 0.0, 0.06, 0.5, 0.06, STL), B(-0.42, 0.04, 0.0, 0.14, 0.02, 0.14, STL)],
    colorsA: [BLK, ANT, '#8b2f2f', '#5b6b5a'], func: ['fireplace'], slots: [use(0, 0.8)], light: { color: '#ff9a4a', intensity: 0.7 }, decor: 6,
  },

  // ======================= SCHLAFEN =======================
  {
    id: 'bett-schlummerkiste', name: 'Einzelbett Schlummerkiste', desc: 'Schlichtes Kiefernbett für kleine Budgets und große Träume.',
    cat: 'sleep', price: 320, w: 1, d: 2, h: 0.85, parts: bed(1, { frame: PINE, headH: 0.8 }),
    colorsA: [SKY, SAGE, TER, MUS, ANT], func: ['bed'], slots: [sleep(0, 0)], comfort: 5, decor: 2,
  },
  {
    id: 'bett-nordlicht', name: 'Einzelbett Nordlicht', desc: 'Gepolstertes Einzelbett mit Kopfteil aus Stoff und hochwertiger Matratze.',
    cat: 'sleep', price: 690, w: 1, d: 2, h: 1.05, parts: bed(1, { frame: 'B', head: 'B', headH: 1.05, legH: 0.1 }),
    colorsA: [CRE, PET, MUS, ROSE], colorsB: ['#b9b2a6', SAGE, NAVY, TER], func: ['bed'], slots: [sleep(0, 0)], comfort: 7, decor: 4,
  },
  {
    id: 'doppelbett-traumhafen', name: 'Doppelbett Traumhafen', desc: 'Massives Eichen-Doppelbett mit zwei Kissen und großer Decke.',
    cat: 'sleep', price: 980, w: 2, d: 2, h: 1.0, parts: bed(2, { frame: OAK, headH: 1.0 }),
    colorsA: [SAGE, CRE, PET, TER, ANT], func: ['bed', 'bedDouble'], slots: [sleep(-0.45, 0), sleep(0.45, 0)], comfort: 7, decor: 4,
  },
  {
    id: 'doppelbett-himmelreich', name: 'Himmelbett Himmelreich', desc: 'Prachtvolles Himmelbett aus Nussbaum mit Stoffbaldachin und Luxusmatratze.',
    cat: 'sleep', price: 1950, w: 2, d: 2, h: 2.05, parts: bed(2, { frame: WAL, headH: 1.2, posts: true }),
    colorsA: ['#6b2d3c', CRE, NAVY, SAGE, MUS], colorsB: [CRE, WHT, ROSE, '#b9b2a6'], func: ['bed', 'bedDouble'], slots: [sleep(-0.45, 0), sleep(0.45, 0)], comfort: 10, decor: 8,
  },
  {
    id: 'doppelbett-futonia', name: 'Futonbett Futonia', desc: 'Flaches Doppelbett im japanischen Stil mit breitem Rahmen.',
    cat: 'sleep', price: 620, w: 2, d: 2, h: 0.6, parts: [...bed(2, { frame: BIR, headH: 0.6, legH: 0.04 }), B(0, 0.04, 0.02, 1.98, 0.04, 1.96, BIR)],
    colorsA: [WHT, '#4e5d6c', TER, SAGE], func: ['bed', 'bedDouble'], slots: [sleep(-0.45, 0), sleep(0.45, 0)], comfort: 6, decor: 4,
  },
  {
    id: 'kleiderschrank-ordnungsliebe', name: 'Kleiderschrank Ordnungsliebe', desc: 'Zweitüriger Kleiderschrank mit Kleiderstange und Fächern.',
    cat: 'sleep', price: 450, w: 1, d: 1, h: 2.0,
    parts: [B(0, 0, -0.2, 0.94, 0.08, 0.56, BLK), B(0, 0.08, -0.21, 0.96, 1.9, 0.58, 'A'), B(0, 1.98, -0.21, 0.98, 0.02, 0.6, 'A'), B(0, 0.1, 0.085, 0.006, 1.86, 0.01, '#8d8478'), B(-0.05, 0.9, 0.095, 0.02, 0.3, 0.02, STL), B(0.05, 0.9, 0.095, 0.02, 0.3, 0.02, STL)],
    colorsA: LACK, func: ['wardrobe'], slots: [use(0, 0.7)], decor: 2,
  },
  {
    id: 'kleiderschrank-raumwunder', name: 'Schwebetürenschrank Raumwunder', desc: 'Breiter Schrank mit Schiebetüren, eine davon verspiegelt.',
    cat: 'sleep', price: 1100, w: 2, d: 1, h: 2.2,
    parts: [B(0, 0, -0.2, 1.9, 2.2, 0.58, 'A'), B(-0.46, 0.05, 0.095, 0.92, 2.08, 0.02, 'A'), B(0.46, 0.05, 0.115, 0.92, 2.08, 0.02, 'A'), B(0.46, 0.15, 0.127, 0.76, 1.88, 0.005, 'glass'), B(0, 2.14, 0.12, 1.9, 0.04, 0.05, STL), B(-0.1, 0.9, 0.11, 0.02, 0.4, 0.015, STL)],
    colorsA: [WHT, OAK, ANT, '#c9bca6'], func: ['wardrobe'], slots: [use(-0.45, 0.7), use(0.45, 0.7)], decor: 3,
  },
  {
    id: 'nachttisch-nachtwache', name: 'Nachttisch Nachtwache', desc: 'Kleiner Nachttisch mit Schublade und offenem Fach.',
    cat: 'sleep', price: 95, w: 1, d: 1, h: 0.55,
    parts: [B(0, 0.12, -0.3, 0.45, 0.43, 0.38, 'A'), ...legs4(0.19, 0.15, 0.12, 0.03, WAL, true, 0, -0.3), B(0, 0.42, -0.105, 0.41, 0.1, 0.01, 'A'), B(0, 0.46, -0.095, 0.1, 0.02, 0.02, BRASS), B(0, 0.15, -0.3, 0.41, 0.005, 0.34, '#d1c4ae'), B(0.08, 0.55, -0.3, 0.16, 0.04, 0.12, TER)],
    colorsA: WOODS, decor: 2,
  },
  {
    id: 'kommode-schubladenwunder', name: 'Kommode Schubladenwunder', desc: 'Breite Kommode mit sechs Schubladen für Wäsche und Kram.',
    cat: 'sleep', price: 360, w: 2, d: 1, h: 1.05,
    parts: [B(0, 0.08, -0.25, 1.4, 0.77, 0.48, 'A'), ...legs4(0.65, 0.2, 0.08, 0.04, WAL, true, 0, -0.25), ...[0.12, 0.37, 0.62].flatMap((y) => [B(-0.35, y, -0.005, 0.66, 0.22, 0.01, 'A'), B(0.35, y, -0.005, 0.66, 0.22, 0.01, 'A'), B(-0.35, y + 0.1, 0.01, 0.14, 0.02, 0.02, BRASS), B(0.35, y + 0.1, 0.01, 0.14, 0.02, 0.02, BRASS)]), S(-0.4, 0.95, -0.3, 0.16, 0.2, 0.16, PET)],
    colorsA: WOODS, decor: 3,
  },

  // ======================= KÜCHE =======================
  {
    id: 'kuechenzeile-schlicht', name: 'Küchenzeile Schlicht', desc: 'Unterschrank mit Arbeitsplatte aus Holzdekor. Der solide Einstieg.',
    cat: 'kitchen', price: 180, w: 1, d: 1, h: 0.9, parts: cabinet(1, OAK, 'A'),
    colorsA: LACK, func: ['counter'], slots: [use()], decor: 1,
  },
  {
    id: 'kuechenzeile-marmor', name: 'Küchenzeile Marmorglanz', desc: 'Schubladenschrank mit edler Marmorplatte und Messinggriffen.',
    cat: 'kitchen', price: 430, w: 1, d: 1, h: 0.9, parts: cabinet(1, '#ebe7e1', 'A', { drawers: true, handle: BRASS }),
    colorsA: ['#2e5e4e', NAVY, WHT, ANT, SAGE], func: ['counter'], slots: [use()], decor: 4,
  },
  {
    id: 'kuecheninsel-treffpunkt', name: 'Kücheninsel Treffpunkt', desc: 'Freistehende Kücheninsel mit Holzplatte und Thekenüberstand.',
    cat: 'kitchen', price: 950, w: 2, d: 1, h: 0.92,
    parts: [B(0, 0, -0.1, 1.76, 0.08, 0.56, BLK), B(0, 0.08, -0.1, 1.8, 0.8, 0.62, 'A'), B(0, 0.88, 0.0, 1.96, 0.04, 0.96, 'B'), B(-0.45, 0.12, 0.215, 0.85, 0.005, 0.01, '#8d8478'), B(0.45, 0.12, 0.215, 0.85, 0.005, 0.01, '#8d8478'), B(-0.45, 0.72, 0.225, 0.3, 0.02, 0.02, STL), B(0.45, 0.72, 0.225, 0.3, 0.02, 0.02, STL)],
    colorsA: LACK, colorsB: [OAK, '#ebe7e1', WAL, ANT], func: ['counter'], slots: [use(-0.5, 0.85), use(0.5, 0.85)], decor: 5,
  },
  {
    id: 'herd-kochfix', name: 'Elektroherd Kochfix', desc: 'Herd mit Glaskeramik-Kochfeld und Backofen. Kocht zuverlässig – meistens.',
    cat: 'kitchen', price: 550, w: 1, d: 1, h: 0.92,
    parts: [B(0, 0, -0.16, 0.94, 0.06, 0.58, BLK), B(0, 0.06, -0.18, 0.96, 0.82, 0.62, 'A'), B(0, 0.88, -0.17, 0.98, 0.03, 0.66, BLK), ...[-0.22, 0.22].flatMap((x) => [-0.32, -0.04].map((z) => C(x, 0.91, z, 0.2, 0.004, 0.2, '#4a4d52'))), B(0, 0.14, 0.135, 0.82, 0.52, 0.02, '#1e2024'), B(0, 0.62, 0.16, 0.6, 0.03, 0.03, STL), B(0, 0.71, 0.135, 0.9, 0.13, 0.015, 'A'), ...[-0.3, -0.15, 0.15, 0.3].map((x) => C(x, 0.775, 0.15, 0.05, 0.02, 0.05, STL, { r: [90, 0, 0] })), B(0, 0.3, 0.13, 0.5, 0.2, 0.005, '#ff7a3a', { e: 0.25 })],
    colorsA: [WHT, ANT, STL], func: ['stove', 'oven', 'counter'], slots: [use()], skill: 'cooking', breaks: true, decor: 1,
  },
  {
    id: 'herd-feuerwerk', name: 'Profi-Gasherd Feuerwerk', desc: 'Edelstahl-Gasherd mit fünf Brennern, Rückwand und großem Backofen.',
    cat: 'kitchen', price: 1450, w: 1, d: 1, h: 1.1,
    parts: [B(0, 0, -0.16, 0.94, 0.06, 0.58, BLK), B(0, 0.06, -0.18, 0.98, 0.84, 0.62, STL), B(0, 0.9, -0.17, 0.98, 0.02, 0.66, '#2a2c30'), B(0, 0.92, -0.47, 0.98, 0.18, 0.04, STL), ...[[-0.25, -0.32], [0.25, -0.32], [-0.25, -0.02], [0.25, -0.02], [0, -0.17]].flatMap(([x, z]) => [C(x, 0.92, z, 0.16, 0.025, 0.16, BLK), C(x, 0.945, z, 0.08, 0.01, 0.08, '#4f8cff', { e: 0.5 })]), B(0, 0.16, 0.135, 0.86, 0.5, 0.02, 'A'), B(0, 0.25, 0.146, 0.5, 0.25, 0.005, '#1e2024'), B(0, 0.6, 0.17, 0.7, 0.03, 0.03, CHR), ...[-0.32, -0.16, 0, 0.16, 0.32].map((x) => C(x, 0.78, 0.15, 0.06, 0.025, 0.06, BLK, { r: [90, 0, 0] }))],
    colorsA: [STL, BLK, '#2e5e4e', '#8b2f2f', CRE], func: ['stove', 'oven', 'counter'], slots: [use()], skill: 'cooking', breaks: true, decor: 4,
  },
  {
    id: 'herd-omas-stolz', name: 'Landhausherd Omas Stolz', desc: 'Emaillierter Herd im Landhausstil mit Chromgriffen und Ofenfenster.',
    cat: 'kitchen', price: 820, w: 1, d: 1, h: 0.95,
    parts: [B(0, 0, -0.17, 0.96, 0.9, 0.64, 'A'), B(0, 0.9, -0.17, 0.98, 0.03, 0.66, CER), ...[-0.22, 0.22].flatMap((x) => [-0.32, -0.04].map((z) => C(x, 0.93, z, 0.2, 0.02, 0.2, BLK))), B(0, 0.08, 0.16, 0.8, 0.5, 0.02, 'A'), B(0, 0.22, 0.172, 0.4, 0.22, 0.005, '#1e2024'), RC(0, 0.65, 0.2, 0.025, 0.7, 0.025, [0, 0, 90], CHR), B(0, 0.72, 0.16, 0.9, 0.14, 0.01, CRE), ...[-0.3, -0.1, 0.1, 0.3].map((x) => C(x, 0.79, 0.17, 0.05, 0.02, 0.05, CHR, { r: [90, 0, 0] })), B(0, 0, 0.12, 0.9, 0.06, 0.02, CHR)],
    colorsA: ['#e8d9c0', SKY, '#7b9c7a', '#a63d32', CRE], func: ['stove', 'oven', 'counter'], slots: [use()], skill: 'cooking', breaks: true, decor: 5,
  },
  {
    id: 'spuele-plaetscher', name: 'Spülenschrank Plätscher', desc: 'Unterschrank mit Edelstahlbecken und schwenkbarer Armatur.',
    cat: 'kitchen', price: 320, w: 1, d: 1, h: 1.2,
    parts: [...cabinet(1, ANT, 'A'), B(0, 0.83, -0.17, 0.62, 0.075, 0.44, '#8f949a'), B(0, 0.8, -0.17, 0.56, 0.02, 0.38, '#6b7076'), C(0, 0.9, -0.43, 0.05, 0.3, 0.05, CHR), RC(0, 1.2, -0.33, 0.035, 0.22, 0.035, [90, 0, 0], CHR), C(0.12, 0.9, -0.43, 0.04, 0.06, 0.04, CHR)],
    colorsA: LACK, func: ['sink', 'counter'], slots: [use()], decor: 1,
  },
  {
    id: 'spuele-bauernglueck', name: 'Keramikspüle Bauernglück', desc: 'Breite Landhausspüle aus Keramik mit Messingarmatur.',
    cat: 'kitchen', price: 690, w: 1, d: 1, h: 1.25,
    parts: [...cabinet(1, OAK, 'A', { handle: BRASS }), B(0, 0.62, 0.0, 0.8, 0.3, 0.3, CER), B(0, 0.84, -0.18, 0.7, 0.08, 0.5, '#d9dadb'), C(0, 0.9, -0.44, 0.05, 0.32, 0.05, BRASS), RC(0, 1.21, -0.34, 0.035, 0.2, 0.035, [90, 0, 0], BRASS), C(-0.12, 0.9, -0.44, 0.06, 0.08, 0.06, BRASS), C(0.12, 0.9, -0.44, 0.06, 0.08, 0.06, BRASS)],
    colorsA: ['#7b9c7a', CRE, NAVY, WHT], func: ['sink', 'counter'], slots: [use()], decor: 5,
  },
  {
    id: 'esstisch-bistro', name: 'Bistrotisch Kaffeeklatsch', desc: 'Runder Bistrotisch für zwei mit gusseisernem Fuß.',
    cat: 'kitchen', price: 150, w: 1, d: 1, h: 0.75,
    parts: [C(0, 0.72, 0, 0.72, 0.03, 0.72, 'A'), C(0, 0.04, 0, 0.06, 0.68, 0.06, BLK), C(0, 0, 0, 0.45, 0.04, 0.45, BLK, { t: 0.7 }), C(0, 0.68, 0, 0.2, 0.04, 0.2, BLK)],
    colorsA: [WHT, OAK, '#ebe7e1', SAGE], func: ['table'], decor: 2,
  },
  {
    id: 'esstisch-tafelrunde', name: 'Esstisch Tafelrunde', desc: 'Rechteckiger Esstisch für vier aus massivem Holz.',
    cat: 'kitchen', price: 290, w: 2, d: 1, h: 0.75,
    parts: [B(0, 0.71, 0, 1.7, 0.04, 0.86, 'A'), ...legs4(0.78, 0.36, 0.71, 0.07, 'A'), B(0, 0.62, 0.37, 1.48, 0.09, 0.03, 'A'), B(0, 0.62, -0.37, 1.48, 0.09, 0.03, 'A')],
    colorsA: WOODS, func: ['table'], decor: 3,
  },
  {
    id: 'esstisch-familienrund', name: 'Esstisch Familienrund', desc: 'Großer runder Esstisch mit Säulenfuß – Platz für die ganze Familie.',
    cat: 'kitchen', price: 690, w: 2, d: 2, h: 0.75,
    parts: [C(0, 0.71, 0, 1.55, 0.04, 1.55, 'A'), C(0, 0.06, 0, 0.3, 0.65, 0.3, 'A', { t: 0.7 }), B(0, 0, 0, 0.9, 0.06, 0.14, 'A'), B(0, 0, 0, 0.14, 0.06, 0.9, 'A')],
    colorsA: WOODS, func: ['table'], decor: 5,
  },
  {
    id: 'stuhl-kantholz', name: 'Stuhl Kantholz', desc: 'Stabiler Holzstuhl mit Sprossenlehne. Passt an jeden Esstisch.',
    cat: 'kitchen', price: 80, w: 1, d: 1, h: 0.92, parts: chair('A', 'A', { slats: true }),
    colorsA: WOODS, func: ['seat'], slots: [sit(0, 0.05)], comfort: 3, decor: 2,
  },
  {
    id: 'stuhl-muschel', name: 'Schalenstuhl Muschel', desc: 'Moderner Schalenstuhl aus Kunststoff auf Eichenbeinen.',
    cat: 'kitchen', price: 140, w: 1, d: 1, h: 0.85,
    parts: [RB(0, 0.44, 0.06, 0.46, 0.05, 0.44, [-4, 0, 0], 'A'), RB(0, 0.66, -0.17, 0.46, 0.38, 0.05, [-12, 0, 0], 'A'), RB(-0.21, 0.5, 0.05, 0.04, 0.14, 0.4, [0, 0, -15], 'A'), RB(0.21, 0.5, 0.05, 0.04, 0.14, 0.4, [0, 0, 15], 'A'), ...legs4(0.17, 0.17, 0.42, 0.03, OAK, true, 0, 0.05), B(0, 0.25, 0.05, 0.34, 0.02, 0.02, CHR)],
    colorsA: [WHT, MUS, SAGE, TER, ANT, SKY], func: ['seat'], slots: [sit(0, 0.05)], comfort: 4, decor: 3,
  },
  {
    id: 'stuhl-gutsherr', name: 'Polsterstuhl Gutsherr', desc: 'Gepolsterter Esszimmerstuhl mit Armlehnen und Nussbaumgestell.',
    cat: 'kitchen', price: 230, w: 1, d: 1, h: 0.98, parts: [...chair('A', WAL, { backH: 0.52, arms: true }), B(0, 0.5, -0.155, 0.36, 0.26, 0.03, 'A')],
    colorsA: [SAGE, CRE, '#6b2d3c', NAVY, MUS], func: ['seat'], slots: [sit(0, 0.05)], comfort: 5, decor: 4,
  },
  {
    id: 'barhocker-tresenhuepfer', name: 'Barhocker Tresenhüpfer', desc: 'Hoher Hocker mit Fußring – ideal für Kücheninsel und Theke.',
    cat: 'kitchen', price: 120, w: 1, d: 1, h: 0.95,
    parts: [C(0, 0.72, 0, 0.4, 0.06, 0.4, 'A'), ...legs4(0.14, 0.14, 0.72, 0.03, BLK, true), C(0, 0.28, 0, 0.36, 0.02, 0.36, BLK), RB(0, 0.85, -0.17, 0.34, 0.14, 0.03, [-8, 0, 0], 'A'), B(-0.14, 0.78, -0.16, 0.025, 0.06, 0.025, BLK), B(0.14, 0.78, -0.16, 0.025, 0.06, 0.025, BLK)],
    colorsA: [OAK, ANT, MUS, PET, TER], func: ['seat'], slots: [sit(0, 0.02, 0.78)], comfort: 3, decor: 2,
  },

  // ======================= GERÄTE =======================
  {
    id: 'kuehlschrank-frostbeule', name: 'Kühlschrank Frostbeule', desc: 'Kühl-Gefrierkombination mit viel Platz. Brummt leise vor sich hin.',
    cat: 'appliance', price: 650, w: 1, d: 1, h: 1.8,
    parts: [B(0, 0, -0.14, 0.68, 0.04, 0.62, BLK), B(0, 0.04, -0.14, 0.72, 1.76, 0.68, 'A'), B(0, 1.17, 0.205, 0.72, 0.015, 0.01, '#8d9196'), B(-0.3, 1.3, 0.225, 0.03, 0.4, 0.03, STL), B(-0.3, 0.55, 0.225, 0.03, 0.45, 0.03, STL), B(0.2, 1.62, 0.206, 0.12, 0.025, 0.005, STL)],
    colorsA: [WHT, STL, ANT, CRE], func: ['fridge'], slots: [use()], decor: 1,
  },
  {
    id: 'kuehlschrank-polarstern', name: 'Retro-Kühlschrank Polarstern', desc: 'Kühlschrank im Stil der 50er mit runder Oberkante und Hebelgriff.',
    cat: 'appliance', price: 990, w: 1, d: 1, h: 1.72,
    parts: [B(0, 0.1, -0.12, 0.7, 1.47, 0.66, 'A'), RC(0, 1.57, -0.12, 0.3, 0.7, 0.66, [0, 0, 90], 'A'), B(0, 1.2, 0.215, 0.7, 0.012, 0.01, '#9a958c'), B(0.27, 0.95, 0.24, 0.05, 0.28, 0.05, CHR), B(0.27, 1.32, 0.24, 0.05, 0.14, 0.05, CHR), ...legs4(0.3, 0.28, 0.1, 0.05, CHR, true, 0, -0.12), B(0, 1.48, 0.222, 0.2, 0.05, 0.005, CHR)],
    colorsA: ['#9fd3c7', '#f2c4c4', CRE, '#a63d32', SKY, WHT], func: ['fridge'], slots: [use()], decor: 5,
  },
  {
    id: 'kuehlschrank-vorratskammer', name: 'Side-by-Side Vorratskammer', desc: 'Großer Doppeltür-Kühlschrank mit Eis- und Wasserspender.',
    cat: 'appliance', price: 1790, w: 1, d: 1, h: 1.85,
    parts: [B(0, 0, -0.13, 0.92, 1.85, 0.7, 'A'), B(0, 0.05, 0.225, 0.006, 1.76, 0.01, '#6b7076'), B(-0.05, 0.6, 0.24, 0.03, 0.8, 0.03, CHR), B(0.05, 0.6, 0.24, 0.03, 0.8, 0.03, CHR), B(-0.25, 1.05, 0.225, 0.22, 0.3, 0.01, '#2a2c30'), B(-0.25, 1.28, 0.232, 0.12, 0.05, 0.005, '#6ec6ff', { e: 0.6 })],
    colorsA: [STL, BLK, WHT], func: ['fridge'], slots: [use()], decor: 3,
  },
  {
    id: 'mikrowelle-turbowaermer', name: 'Mikrowelle Turbowärmer', desc: 'Einfache Mikrowelle für Aufwärmen in Rekordzeit.',
    cat: 'appliance', price: 120, w: 1, d: 1, h: 0.3, mount: 'surface',
    parts: [B(0, 0, -0.1, 0.5, 0.29, 0.36, 'A'), B(-0.06, 0.04, 0.083, 0.34, 0.21, 0.01, '#1e2024'), B(0.18, 0.05, 0.083, 0.1, 0.2, 0.01, ANT), C(0.18, 0.18, 0.09, 0.05, 0.02, 0.05, STL, { r: [90, 0, 0] }), B(0.18, 0.08, 0.09, 0.06, 0.04, 0.005, '#53d18a', { e: 0.6 })],
    colorsA: [WHT, ANT, STL], func: ['microwave'], slots: [use()], decor: 0,
  },
  {
    id: 'mikrowelle-ofenfix', name: 'Kombi-Mikrowelle Ofenfix', desc: 'Mikrowelle mit Grill- und Heißluftfunktion im Edelstahlgehäuse.',
    cat: 'appliance', price: 270, w: 1, d: 1, h: 0.34, mount: 'surface',
    parts: [B(0, 0, -0.1, 0.56, 0.33, 0.4, STL), B(-0.07, 0.04, 0.103, 0.38, 0.25, 0.01, '#1e2024'), B(-0.07, 0.29, 0.11, 0.3, 0.02, 0.02, CHR), B(0.2, 0.05, 0.103, 0.1, 0.24, 0.01, BLK), B(0.2, 0.22, 0.11, 0.07, 0.04, 0.005, '#6ec6ff', { e: 0.6 }), C(0.2, 0.12, 0.11, 0.05, 0.02, 0.05, CHR, { r: [90, 0, 0] })],
    func: ['microwave'], slots: [use()], decor: 1,
  },
  {
    id: 'kaffee-morgenmuffel', name: 'Filterkaffeemaschine Morgenmuffel', desc: 'Klassische Filtermaschine mit Glaskanne. Ohne sie geht morgens nichts.',
    cat: 'appliance', price: 80, w: 1, d: 1, h: 0.36, mount: 'surface',
    parts: [B(0, 0, -0.12, 0.24, 0.03, 0.26, 'A'), B(0, 0, -0.2, 0.22, 0.36, 0.1, 'A'), B(0, 0.24, -0.08, 0.22, 0.1, 0.2, 'A'), C(0, 0.03, -0.05, 0.14, 0.14, 0.14, 'glass'), C(0, 0.03, -0.05, 0.13, 0.08, 0.13, '#3b2416'), B(0.09, 0.08, 0.03, 0.03, 0.08, 0.03, BLK), B(0.07, 0.04, -0.15, 0.03, 0.02, 0.01, '#ff5a3a', { e: 0.8 })],
    colorsA: [BLK, WHT, TER, SAGE], func: ['coffee'], slots: [use()], decor: 1,
  },
  {
    id: 'kaffee-bohnenglueck', name: 'Kaffeevollautomat Bohnenglück', desc: 'Mahlt, brüht und schäumt – Cappuccino auf Knopfdruck.',
    cat: 'appliance', price: 430, w: 1, d: 1, h: 0.38, mount: 'surface',
    parts: [B(0, 0, -0.12, 0.3, 0.38, 0.36, 'A'), B(0, 0.14, 0.065, 0.16, 0.05, 0.03, 'A'), B(0, 0, 0.04, 0.2, 0.03, 0.08, '#555a60'), C(0, 0.03, 0.03, 0.07, 0.08, 0.07, WHT), C(0, 0.38, -0.2, 0.16, 0.05, 0.16, '#3b2416'), B(0, 0.25, 0.063, 0.2, 0.08, 0.005, '#6ec6ff', { e: 0.5 }), C(0.1, 0.33, 0.065, 0.03, 0.01, 0.03, CHR, { r: [90, 0, 0] })],
    colorsA: [BLK, STL, WHT, '#a63d32'], func: ['coffee'], slots: [use()], decor: 2,
  },
  {
    id: 'spuelmaschine-blitzblank', name: 'Spülmaschine Blitzblank', desc: 'Einbau-Geschirrspüler mit Arbeitsplatte. Spült, während du entspannst.',
    cat: 'appliance', price: 490, w: 1, d: 1, h: 0.9,
    parts: [B(0, 0, -0.16, 0.94, 0.08, 0.58, BLK), B(0, 0.08, -0.18, 0.96, 0.78, 0.62, ANT), B(0, 0.86, -0.17, 0.98, 0.04, 0.66, OAK), B(0, 0.1, 0.135, 0.92, 0.74, 0.015, 'A'), B(0, 0.74, 0.155, 0.5, 0.03, 0.03, STL), B(0.32, 0.8, 0.144, 0.12, 0.03, 0.005, '#53d18a', { e: 0.5 })],
    colorsA: [WHT, STL, ANT], func: ['dishwasher', 'counter'], slots: [use()], breaks: true, decor: 0,
  },
  {
    id: 'spuelmaschine-glanzleistung', name: 'Spülmaschine Glanzleistung', desc: 'Flüsterleiser Premium-Geschirrspüler mit Bodenlicht und Edelstahlfront.',
    cat: 'appliance', price: 890, w: 1, d: 1, h: 0.9,
    parts: [B(0, 0, -0.16, 0.94, 0.08, 0.58, BLK), B(0, 0.08, -0.18, 0.96, 0.78, 0.62, ANT), B(0, 0.86, -0.17, 0.98, 0.04, 0.66, '#ebe7e1'), B(0, 0.1, 0.135, 0.92, 0.74, 0.015, STL), B(0, 0.8, 0.15, 0.86, 0.05, 0.01, BLK), B(0.25, 0.81, 0.157, 0.2, 0.03, 0.005, '#6ec6ff', { e: 0.6 }), B(0, 0.005, 0.25, 0.4, 0.002, 0.15, '#6ec6ff', { e: 0.4 })],
    func: ['dishwasher', 'counter'], slots: [use()], breaks: true, decor: 2,
  },
  {
    id: 'muelleimer-schlucker', name: 'Treteimer Schlucker', desc: 'Mülleimer mit Fußpedal und Deckel. Bitte regelmäßig leeren!',
    cat: 'appliance', price: 40, w: 1, d: 1, h: 0.62,
    parts: [C(0, 0.02, 0, 0.32, 0.56, 0.32, 'A'), C(0, 0.58, 0, 0.34, 0.03, 0.34, STL), S(0, 0.61, 0, 0.32, 0.04, 0.32, STL), B(0, 0, 0.18, 0.12, 0.03, 0.08, BLK), C(0, 0, 0, 0.3, 0.02, 0.3, BLK)],
    colorsA: [STL, WHT, ANT, TER, SAGE], func: ['trash'], slots: [use(0, 0.6)], decor: 0,
  },
  {
    id: 'muelltonne-trennkuenstler', name: 'Mülltonnen Trennkünstler', desc: 'Zwei große Außentonnen mit Rollen für Rest- und Biomüll.',
    cat: 'appliance', price: 120, w: 1, d: 1, h: 1.05, outdoor: true,
    parts: [B(-0.24, 0.06, -0.05, 0.44, 0.92, 0.56, ANT), B(0.24, 0.06, -0.05, 0.44, 0.92, 0.56, '#5a8a4a'), RB(-0.24, 1.0, -0.03, 0.46, 0.04, 0.62, [-4, 0, 0], ANT), RB(0.24, 1.0, -0.03, 0.46, 0.04, 0.62, [-4, 0, 0], '#4a7a3d'), RC(-0.24, 0.06, -0.3, 0.12, 0.42, 0.12, [0, 0, 90], BLK), RC(0.24, 0.06, -0.3, 0.12, 0.42, 0.12, [0, 0, 90], BLK), B(-0.24, 0.9, 0.24, 0.3, 0.04, 0.03, BLK), B(0.24, 0.9, 0.24, 0.3, 0.04, 0.03, BLK)],
    func: ['trash'], slots: [use(0, 0.65)], decor: 0,
  },

  // ======================= BAD =======================
  {
    id: 'toilette-thron', name: 'Toilette Thron Classic', desc: 'Stand-WC mit Spülkasten. Unverzichtbar, wenn es eilt.',
    cat: 'bath', price: 260, w: 1, d: 1, h: 0.82,
    parts: [C(0, 0, -0.08, 0.26, 0.3, 0.32, CER, { t: 1.3 }), S(0, 0.32, -0.02, 0.4, 0.2, 0.5, CER), C(0, 0.39, -0.02, 0.4, 0.03, 0.48, 'A'), RB(0, 0.6, -0.27, 0.38, 0.03, 0.42, [-78, 0, 0], 'A'), B(0, 0.4, -0.39, 0.44, 0.4, 0.18, CER), B(0, 0.8, -0.39, 0.46, 0.02, 0.2, CER), B(0.12, 0.76, -0.31, 0.06, 0.02, 0.03, CHR)],
    colorsA: [WHT, OAK, BLK, SKY], func: ['toilet'], slots: [sit(0, 0.05, 0.42)], breaks: true, comfort: 3, decor: 0,
  },
  {
    id: 'toilette-schwebend', name: 'Wand-WC Schwebeleicht', desc: 'Spülrandloses Hänge-WC mit Unterputz-Spülkasten und Softclose-Deckel.',
    cat: 'bath', price: 620, w: 1, d: 1, h: 1.2,
    parts: [B(0, 0, -0.42, 0.6, 1.2, 0.16, 'A'), B(0, 0.95, -0.335, 0.22, 0.15, 0.01, CHR), RB(0, 0.36, -0.06, 0.38, 0.22, 0.56, [0, 0, 0], CER), S(0, 0.43, 0.05, 0.38, 0.14, 0.4, CER), B(0, 0.47, -0.06, 0.38, 0.025, 0.54, WHT), RB(0, 0.68, -0.3, 0.36, 0.025, 0.4, [-80, 0, 0], WHT)],
    colorsA: ['#c9c3b8', ANT, WHT, SAGE], func: ['toilet'], slots: [sit(0, 0.05, 0.45)], breaks: true, comfort: 5, decor: 3,
  },
  {
    id: 'dusche-regentropfen', name: 'Dusche Regentropfen', desc: 'Kompakte Eckdusche mit Glaswand und Handbrause.',
    cat: 'bath', price: 520, w: 1, d: 1, h: 2.1,
    parts: [B(0, 0, 0, 0.96, 0.08, 0.96, CER), B(0, 0.08, 0, 0.84, 0.005, 0.84, '#c9d3d8'), B(0.47, 0.08, 0, 0.02, 1.95, 0.96, 'glass'), B(0.12, 0.08, 0.47, 0.7, 1.95, 0.02, 'glass'), B(0.47, 0.08, 0.47, 0.03, 1.95, 0.03, CHR), C(-0.4, 1.0, -0.43, 0.03, 1.0, 0.03, CHR), RC(-0.4, 1.9, -0.36, 0.14, 0.03, 0.14, [70, 0, 0], CHR), C(-0.4, 0.95, -0.44, 0.08, 0.12, 0.06, CHR), B(-0.47, 0.08, 0, 0.02, 1.95, 0.96, 'A'), B(0, 0.08, -0.47, 0.96, 1.95, 0.02, 'A')],
    colorsA: [WHT, '#cfe3e8', '#e8ddd0', SAGE], func: ['shower'], slots: [use(0, 0, 0)], breaks: true, decor: 2,
  },
  {
    id: 'dusche-wasserfall', name: 'Regendusche Wasserfall', desc: 'Begehbare Luxusdusche mit Natursteinboden und großer Regenbrause.',
    cat: 'bath', price: 1350, w: 1, d: 1, h: 2.2,
    parts: [B(0, 0, 0, 0.98, 0.04, 0.98, STONE), B(0, 0.04, 0, 0.9, 0.005, 0.9, '#8f8a82'), B(0, 0, -0.46, 0.98, 2.2, 0.06, 'A'), B(-0.46, 0, 0, 0.06, 2.2, 0.98, 'A'), B(0.47, 0.04, -0.1, 0.02, 2.0, 0.76, 'glass'), C(0, 2.0, -0.4, 0.03, 0.15, 0.03, CHR), RC(0, 2.1, -0.2, 0.03, 0.4, 0.03, [90, 0, 0], CHR), C(0, 2.05, 0, 0.35, 0.02, 0.35, CHR), C(-0.2, 1.0, -0.42, 0.1, 0.02, 0.1, CHR, { r: [90, 0, 0] }), B(0.2, 0.9, -0.42, 0.25, 0.08, 0.04, CHR), S(0.15, 0.97, -0.41, 0.06, 0.05, 0.04, SAGE)],
    colorsA: ['#4f5458', '#d8d0c4', WHT, '#6f8a7e'], func: ['shower'], slots: [use(0, 0, 0)], breaks: true, decor: 6,
  },
  {
    id: 'badewanne-badeschaum', name: 'Badewanne Badeschaum', desc: 'Eingebaute Acrylwanne mit Verkleidung. Zum Abschalten nach langen Tagen.',
    cat: 'bath', price: 650, w: 1, d: 2, h: 0.6,
    parts: [B(0, 0, 0, 0.82, 0.55, 1.75, 'A'), B(0, 0.55, 0, 0.84, 0.04, 1.78, CER), B(0, 0.45, 0.05, 0.64, 0.11, 1.5, '#e8eef0'), B(0, 0.44, 0.05, 0.62, 0.12, 1.46, WATER, { e: 0.15 }), C(0, 0.59, -0.8, 0.04, 0.1, 0.04, CHR), RC(0, 0.68, -0.75, 0.03, 0.12, 0.03, [90, 0, 0], CHR), S(-0.15, 0.58, 0.2, 0.3, 0.06, 0.4, WHT), S(0.12, 0.58, 0.45, 0.25, 0.05, 0.3, WHT)],
    colorsA: [WHT, '#cfe3e8', '#e8ddd0', '#a7b5a0'], func: ['bathtub'], slots: [sit(0, 0, 0.3)], comfort: 7, decor: 3,
  },
  {
    id: 'badewanne-muschel', name: 'Freistehende Wanne Perlmutt', desc: 'Freistehende Badewanne auf Löwentatzen mit Messing-Standarmatur.',
    cat: 'bath', price: 1650, w: 1, d: 2, h: 1.0,
    parts: [C(0, 0.12, 0.02, 0.8, 0.5, 1.7, 'A', { t: 1.08 }), C(0, 0.6, 0.02, 0.86, 0.04, 1.78, CER), C(0, 0.5, 0.02, 0.66, 0.08, 1.52, WATER, { e: 0.15 }), ...legs4(0.28, 0.65, 0.14, 0.09, BRASS, true, 0, 0.02, { t: 0.6 }), C(0, 0, -0.93, 0.04, 1.0, 0.04, BRASS), RC(0, 0.98, -0.85, 0.03, 0.18, 0.03, [90, 0, 0], BRASS), C(-0.06, 0.8, -0.93, 0.05, 0.05, 0.05, BRASS), C(0.06, 0.8, -0.93, 0.05, 0.05, 0.05, BRASS)],
    colorsA: [WHT, ANT, '#2e5e4e', '#c4a39a', NAVY], func: ['bathtub'], slots: [sit(0, 0.05, 0.35)], comfort: 9, decor: 8,
  },
  {
    id: 'waschbecken-klarspueler', name: 'Säulenwaschbecken Klarspüler', desc: 'Klassisches Keramikwaschbecken auf Standsäule.',
    cat: 'bath', price: 180, w: 1, d: 1, h: 1.0,
    parts: [C(0, 0, -0.3, 0.2, 0.72, 0.18, CER, { t: 1.3 }), B(0, 0.72, -0.27, 0.56, 0.14, 0.42, CER), B(0, 0.8, -0.26, 0.46, 0.065, 0.3, '#dfe6e8'), C(0, 0.86, -0.44, 0.04, 0.14, 0.04, 'A'), RC(0, 0.98, -0.38, 0.025, 0.12, 0.025, [90, 0, 0], 'A'), C(0.12, 0.86, -0.44, 0.04, 0.04, 0.04, 'A')],
    colorsA: [CHR, BRASS, BLK], func: ['sink'], slots: [use(0, 0.6)], decor: 1,
  },
  {
    id: 'waschtisch-doppelglanz', name: 'Doppelwaschtisch Doppelglanz', desc: 'Breiter Waschtisch mit zwei Aufsatzbecken auf Unterschrank.',
    cat: 'bath', price: 740, w: 2, d: 1, h: 1.05,
    parts: [B(0, 0.25, -0.25, 1.8, 0.58, 0.48, 'A'), B(0, 0.83, -0.25, 1.84, 0.04, 0.5, '#ebe7e1'), B(-0.45, 0.3, -0.005, 0.86, 0.48, 0.01, 'A'), B(0.45, 0.3, -0.005, 0.86, 0.48, 0.01, 'A'), C(-0.45, 0.87, -0.22, 0.42, 0.12, 0.34, CER), C(0.45, 0.87, -0.22, 0.42, 0.12, 0.34, CER), C(-0.45, 0.87, -0.45, 0.04, 0.2, 0.04, CHR), C(0.45, 0.87, -0.45, 0.04, 0.2, 0.04, CHR), RC(-0.45, 1.05, -0.39, 0.025, 0.12, 0.025, [90, 0, 0], CHR), RC(0.45, 1.05, -0.39, 0.025, 0.12, 0.025, [90, 0, 0], CHR), C(0, 0.87, -0.3, 0.08, 0.14, 0.08, SAGE)],
    colorsA: [OAK, WHT, ANT, '#5d7f74'], func: ['sink'], slots: [use(-0.45, 0.7), use(0.45, 0.7)], decor: 5,
  },
  {
    id: 'spiegel-rundblick', name: 'Wandspiegel Rundblick', desc: 'Runder Spiegel mit Messingrahmen. Wer ist die/der Schönste?',
    cat: 'bath', price: 120, w: 1, d: 1, h: 1.8, mount: 'wall',
    parts: [RC(0, 1.5, -0.485, 0.66, 0.03, 0.66, [90, 0, 0], 'A'), RC(0, 1.5, -0.468, 0.6, 0.005, 0.6, [90, 0, 0], 'glass'), B(0, 1.83, -0.49, 0.02, 0.05, 0.02, 'A'), B(0, 1.08, -0.45, 0.4, 0.02, 0.1, 'A')],
    colorsA: [BRASS, BLK, OAK, WHT], func: ['mirror'], slots: [use(0, 0.3)], skill: 'charisma', decor: 3,
  },
  {
    id: 'spiegel-ankleide', name: 'Ankleidespiegel Glanzstück', desc: 'Großer rechteckiger Wandspiegel mit breitem Holzrahmen und Ablage.',
    cat: 'bath', price: 290, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: [B(0, 0.55, -0.48, 0.66, 1.3, 0.04, 'A'), B(0, 0.62, -0.457, 0.56, 1.16, 0.005, 'glass'), B(0, 0.45, -0.43, 0.6, 0.03, 0.14, 'A'), C(-0.15, 0.48, -0.42, 0.06, 0.1, 0.06, ROSE), C(0.1, 0.48, -0.42, 0.04, 0.14, 0.04, WHT)],
    colorsA: [OAK, BRASS, WHT, BLK], func: ['mirror'], slots: [use(0, 0.3)], skill: 'charisma', decor: 4,
  },

  // ======================= KINDER =======================
  {
    id: 'babybett-sternschnuppe', name: 'Babybett Sternschnuppe', desc: 'Gitterbett aus Buche mit weicher Matratze für die Kleinsten.',
    cat: 'kids', price: 280, w: 1, d: 2, h: 0.95,
    parts: [B(0, 0.3, 0, 0.74, 0.08, 1.3, BIR), B(0, 0.38, 0, 0.7, 0.08, 1.26, CRE), B(0, 0.46, 0.1, 0.66, 0.03, 0.8, 'A'), ...legs4(0.35, 0.63, 0.9, 0.05, BIR), B(-0.35, 0.86, 0, 0.04, 0.04, 1.26, BIR), B(0.35, 0.86, 0, 0.04, 0.04, 1.26, BIR), B(0, 0.86, -0.63, 0.7, 0.04, 0.04, BIR), B(0, 0.86, 0.63, 0.7, 0.04, 0.04, BIR), ...[-0.35, 0.35].flatMap((x) => [-0.4, -0.1, 0.2, 0.5].map((z) => B(x, 0.38, z, 0.02, 0.48, 0.02, BIR))), S(0.15, 0.53, -0.4, 0.15, 0.12, 0.12, '#d9a066')],
    colorsA: [SKY, ROSE, '#f3e3a3', SAGE, CRE], func: ['crib'], slots: [sleep(0, 0, 0.45)], comfort: 6, decor: 3,
  },
  {
    id: 'babybett-wolkenwiege', name: 'Babybett Wolkenwiege', desc: 'Weißes Babybett mit Himmel, Mobile und Wolkenmotiv.',
    cat: 'kids', price: 540, w: 1, d: 2, h: 1.55,
    parts: [B(0, 0.25, 0, 0.76, 0.1, 1.3, WHT), B(0, 0.35, 0, 0.7, 0.08, 1.26, CRE), B(0, 0.43, 0.1, 0.66, 0.03, 0.8, 'A'), ...legs4(0.36, 0.63, 0.9, 0.06, WHT), B(-0.36, 0.43, 0, 0.03, 0.45, 1.2, 'glass'), B(0.36, 0.43, 0, 0.03, 0.45, 1.2, 'glass'), B(0, 0.4, -0.63, 0.7, 0.5, 0.04, WHT), S(0, 0.95, -0.63, 0.5, 0.3, 0.05, WHT), C(0.3, 0.9, -0.6, 0.03, 0.6, 0.03, WHT), RC(0.15, 1.5, -0.45, 0.02, 0.4, 0.02, [0, 0, 90], WHT), S(0.05, 1.3, -0.45, 0.1, 0.07, 0.07, '#f3e3a3'), S(0.2, 1.33, -0.45, 0.08, 0.08, 0.08, ROSE), S(-0.05, 1.35, -0.45, 0.08, 0.08, 0.08, SKY)],
    colorsA: [ROSE, SKY, '#f3e3a3', SAGE], func: ['crib'], slots: [sleep(0, 0, 0.42)], comfort: 8, decor: 6,
  },
  {
    id: 'hochstuhl-mampfturm', name: 'Hochstuhl Mampfturm', desc: 'Mitwachsender Hochstuhl mit Esstablett für kleine Feinschmecker.',
    cat: 'kids', price: 140, w: 1, d: 1, h: 1.05,
    parts: [RB(-0.2, 0.33, 0.12, 0.04, 0.68, 0.04, [-10, 0, 8], 'A'), RB(0.2, 0.33, 0.12, 0.04, 0.68, 0.04, [-10, 0, -8], 'A'), RB(-0.2, 0.33, -0.16, 0.04, 0.68, 0.04, [10, 0, 8], 'A'), RB(0.2, 0.33, -0.16, 0.04, 0.68, 0.04, [10, 0, -8], 'A'), B(0, 0.62, -0.02, 0.36, 0.04, 0.34, 'A'), B(0, 0.66, -0.17, 0.36, 0.38, 0.04, 'A'), B(-0.17, 0.66, -0.02, 0.03, 0.18, 0.3, 'A'), B(0.17, 0.66, -0.02, 0.03, 0.18, 0.3, 'A'), B(0, 0.82, 0.17, 0.42, 0.03, 0.2, WHT), B(0, 0.66, 0.0, 0.3, 0.03, 0.26, 'B'), B(0, 0.2, 0.15, 0.36, 0.03, 0.1, 'A')],
    colorsA: [BIR, WHT, OAK, SAGE], colorsB: [MUS, SKY, ROSE, SAGE], func: ['highchair', 'seat'], slots: [sit(0, 0.0, 0.66)], comfort: 4, decor: 2,
  },
  {
    id: 'spielkiste-schatzkiste', name: 'Spielzeugkiste Schatzkiste', desc: 'Holztruhe voller Bauklötze, Bälle und Kuscheltiere.',
    cat: 'kids', price: 90, w: 1, d: 1, h: 0.75,
    parts: [B(0, 0, -0.1, 0.7, 0.42, 0.45, 'A'), RB(0, 0.62, -0.37, 0.72, 0.04, 0.4, [-70, 0, 0], 'A'), B(0, 0.08, 0.126, 0.6, 0.2, 0.005, 'B'), S(-0.15, 0.42, -0.1, 0.16, 0.16, 0.16, '#e05a4a'), B(0.12, 0.38, -0.05, 0.12, 0.12, 0.12, '#4a8ae0'), S(0.05, 0.45, -0.18, 0.18, 0.14, 0.14, '#c9a06a'), B(-0.25, 0.4, 0.05, 0.1, 0.1, 0.1, MUS)],
    colorsA: [BIR, WHT, SKY, ROSE], colorsB: [MUS, TER, SAGE, SKY], func: ['toybox'], slots: [use(0, 0.65)], decor: 2,
  },
  {
    id: 'spielkiste-baerenbox', name: 'Spielzeugkiste Brummbär', desc: 'Gepolsterte Spielkiste in Bärenform mit Öhrchen und Sitzdeckel.',
    cat: 'kids', price: 160, w: 1, d: 1, h: 0.62,
    parts: [B(0, 0, -0.05, 0.6, 0.42, 0.5, 'A'), B(0, 0.42, -0.05, 0.62, 0.06, 0.52, 'A'), S(-0.2, 0.52, -0.25, 0.16, 0.16, 0.06, 'A'), S(0.2, 0.52, -0.25, 0.16, 0.16, 0.06, 'A'), S(0, 0.22, 0.205, 0.2, 0.14, 0.03, CRE), S(-0.12, 0.33, 0.205, 0.05, 0.05, 0.02, BLK), S(0.12, 0.33, 0.205, 0.05, 0.05, 0.02, BLK), S(0, 0.24, 0.225, 0.06, 0.04, 0.02, BLK)],
    colorsA: ['#b58a5e', ROSE, SKY, '#f3e3a3', WHT], func: ['toybox'], slots: [use(0, 0.65)], decor: 3,
  },
  {
    id: 'puppenhaus-lindenhof', name: 'Puppenvilla Lindenhof', desc: 'Dreistöckiges Puppenhaus mit Spitzdach, Fensterchen und Möbelchen.',
    cat: 'kids', price: 240, w: 1, d: 1, h: 1.15,
    parts: [B(0, 0, -0.15, 0.8, 0.04, 0.5, BIR), B(0, 0.04, -0.2, 0.7, 0.7, 0.36, 'A'), RB(-0.19, 0.87, -0.2, 0.46, 0.04, 0.4, [0, 0, 40], 'B'), RB(0.19, 0.87, -0.2, 0.46, 0.04, 0.4, [0, 0, -40], 'B'), B(0, 0.38, -0.2, 0.7, 0.02, 0.36, BIR), B(0, 0.06, -0.015, 0.12, 0.2, 0.01, WAL), B(-0.2, 0.45, -0.015, 0.14, 0.14, 0.01, '#bfe0f0'), B(0.2, 0.45, -0.015, 0.14, 0.14, 0.01, '#bfe0f0'), B(-0.2, 0.12, -0.015, 0.14, 0.14, 0.01, '#bfe0f0'), B(0.2, 0.12, -0.015, 0.14, 0.14, 0.01, '#bfe0f0'), RC(0, 0.86, -0.015, 0.12, 0.01, 0.12, [90, 0, 0], '#bfe0f0'), B(0.25, 0.74, -0.32, 0.08, 0.3, 0.08, TER)],
    colorsA: [ROSE, '#f3e3a3', SKY, WHT, SAGE], colorsB: [TER, NAVY, '#7b5a8a', SAGE], func: ['dollhouse'], slots: [use(0, 0.6)], decor: 4,
  },
  {
    id: 'spielmatte-strassenteppich', name: 'Spielmatte Straßenteppich', desc: 'Weiche Spielmatte mit Straßen, Häuschen und Spielzeugautos.',
    cat: 'kids', price: 70, w: 2, d: 2, h: 0.12,
    parts: [B(0, 0, 0, 1.8, 0.02, 1.8, 'A'), B(0, 0.02, 0, 1.6, 0.003, 0.22, '#6b6b6b'), B(0, 0.02, 0, 0.22, 0.003, 1.6, '#6b6b6b'), B(0, 0.024, 0, 1.5, 0.002, 0.03, WHT), B(0.5, 0.02, 0.5, 0.3, 0.1, 0.3, TER), B(-0.5, 0.02, -0.5, 0.25, 0.12, 0.25, MUS), B(0.4, 0.02, -0.03, 0.16, 0.06, 0.09, '#e05a4a'), B(-0.03, 0.02, 0.45, 0.09, 0.06, 0.16, '#4a8ae0'), S(-0.5, 0.1, 0.5, 0.25, 0.2, 0.25, G3)],
    colorsA: [G3, SKY, '#e8d9a0', ROSE], func: ['playmat'], slots: [sit(-0.4, 0.2, 0.02), sit(0.4, -0.4, 0.02)], comfort: 3, decor: 2,
  },
  {
    id: 'kinderbett-raketenstart', name: 'Kinderbett Raketenstart', desc: 'Einzelbett mit Raketen-Kopfteil – für kleine Astronautinnen und Astronauten.',
    cat: 'kids', price: 460, w: 1, d: 2, h: 1.6,
    parts: [...bed(1, { frame: WHT, headH: 0.7, blanket: 'A' }), C(0, 0, -0.9, 0.36, 1.1, 0.16, WHT), C(0, 1.1, -0.9, 0.36, 0.45, 0.16, '#e05a4a', { t: 0 }), RC(0, 0.85, -0.81, 0.16, 0.02, 0.16, [90, 0, 0], SKY, { e: 0.3 }), RB(-0.22, 0.25, -0.9, 0.14, 0.3, 0.08, [0, 0, 20], '#e05a4a'), RB(0.22, 0.25, -0.9, 0.14, 0.3, 0.08, [0, 0, -20], '#e05a4a')],
    colorsA: [NAVY, SKY, '#7b5a8a', SAGE], func: ['bed'], slots: [sleep(0, 0)], comfort: 6, decor: 5,
  },

  // ======================= HOBBY =======================
  {
    id: 'staffelei-pinselstrich', name: 'Staffelei Pinselstrich', desc: 'Einfache Holzstaffelei mit Leinwand und Farbpalette. Für erste Meisterwerke.',
    cat: 'hobby', price: 180, w: 1, d: 1, h: 1.75,
    parts: [RB(-0.25, 0.8, 0.02, 0.04, 1.62, 0.04, [8, 0, 10], BIR), RB(0.25, 0.8, 0.02, 0.04, 1.62, 0.04, [8, 0, -10], BIR), RB(0, 0.8, -0.25, 0.04, 1.62, 0.04, [-12, 0, 0], BIR), B(0, 0.7, 0.1, 0.6, 0.04, 0.08, BIR), RB(0, 1.12, 0.07, 0.56, 0.72, 0.03, [8, 0, 0], WHT), RB(0, 1.12, 0.09, 0.4, 0.4, 0.005, [8, 0, 0], SKY), RB(0, 1.0, 0.1, 0.3, 0.12, 0.005, [8, 0, 0], G1), S(-0.15, 0.75, 0.12, 0.18, 0.02, 0.12, '#c9a06a')],
    func: ['easel'], slots: [use(0, 0.65)], skill: 'painting', decor: 3,
  },
  {
    id: 'staffelei-atelier', name: 'Atelierstaffelei Meisterhand', desc: 'Schwere Studiostaffelei mit Kurbel, großer Leinwand und Farbwagen.',
    cat: 'hobby', price: 540, w: 1, d: 1, h: 2.0,
    parts: [B(0, 0, -0.1, 0.7, 0.08, 0.5, WAL), C(-0.3, 0, -0.3, 0.06, 0.04, 0.06, BLK), C(0.3, 0, -0.3, 0.06, 0.04, 0.06, BLK), B(0, 0.08, -0.15, 0.08, 1.9, 0.06, WAL), B(-0.28, 0.08, -0.15, 0.05, 1.5, 0.05, WAL), B(0.28, 0.08, -0.15, 0.05, 1.5, 0.05, WAL), B(0, 0.62, -0.08, 0.8, 0.05, 0.12, WAL), B(0, 0.67, -0.1, 0.8, 0.9, 0.04, WHT), B(-0.12, 0.8, -0.078, 0.4, 0.5, 0.005, TER), B(0.15, 0.95, -0.077, 0.3, 0.4, 0.005, PET), B(0.4, 0.7, -0.1, 0.06, 0.06, 0.06, CHR), B(-0.3, 0, 0.3, 0.3, 0.5, 0.3, ANT), C(-0.35, 0.5, 0.3, 0.06, 0.12, 0.06, MUS), C(-0.25, 0.5, 0.3, 0.06, 0.14, 0.06, '#e05a4a')],
    func: ['easel'], slots: [use(0, 0.6)], skill: 'painting', decor: 5,
  },
  {
    id: 'klavier-tastenzauber', name: 'Klavier Tastenzauber', desc: 'Aufrechtes Klavier mit Klavierbank. Klingt warm – mit Übung sogar schön.',
    cat: 'hobby', price: 1250, w: 2, d: 1, h: 1.25,
    parts: [B(0, 0, -0.35, 1.5, 1.25, 0.28, 'A'), B(0, 0.62, -0.13, 1.5, 0.12, 0.2, 'A'), B(0, 0.7, -0.08, 1.36, 0.03, 0.14, WHT), ...Array.from({ length: 9 }, (_, i) => B(-0.6 + i * 0.15, 0.73, -0.11, 0.05, 0.02, 0.08, BLK)), B(-0.73, 0, -0.17, 0.05, 0.74, 0.16, 'A'), B(0.73, 0, -0.17, 0.05, 0.74, 0.16, 'A'), B(0, 0.9, -0.2, 0.4, 0.3, 0.02, 'A', { r: [-15, 0, 0] }), B(0, 0.42, 0.32, 0.8, 0.06, 0.34, 'A'), ...legs4(0.36, 0.13, 0.42, 0.04, 'A', false, 0, 0.32)],
    colorsA: [BLK, WAL, WHT, '#5b2e2e'], func: ['piano'], slots: [sit(0, 0.32, 0.48, 180)], skill: 'music', decor: 6,
  },
  {
    id: 'fluegel-mondschein', name: 'Konzertflügel Mondschein', desc: 'Glänzender Stutzflügel mit geöffnetem Deckel. Der Traum jeder Pianistin.',
    cat: 'hobby', price: 3900, w: 2, d: 2, h: 1.6,
    parts: [C(0.0, 0.6, -0.25, 1.5, 0.32, 1.3, 'A'), B(0, 0.6, 0.48, 1.4, 0.32, 0.3, 'A'), RB(-0.1, 1.15, -0.45, 1.4, 0.03, 1.2, [0, 0, 28], 'A'), RC(0.55, 0.85, -0.45, 0.03, 0.75, 0.03, [0, 0, 20], BRASS), B(0, 0.86, 0.6, 1.3, 0.03, 0.14, WHT), ...Array.from({ length: 8 }, (_, i) => B(-0.56 + i * 0.16, 0.89, 0.58, 0.05, 0.02, 0.08, BLK)), C(-0.6, 0, -0.6, 0.1, 0.6, 0.1, 'A'), C(0.6, 0, -0.5, 0.1, 0.6, 0.1, 'A'), C(0, 0, 0.45, 0.1, 0.6, 0.1, 'A'), B(0, 0.42, 0.88, 0.8, 0.06, 0.22, 'A'), B(-0.35, 0, 0.88, 0.04, 0.42, 0.16, 'A'), B(0.35, 0, 0.88, 0.04, 0.42, 0.16, 'A')],
    colorsA: [BLK, WHT, WAL], func: ['piano'], slots: [sit(0, 0.88, 0.48, 180)], skill: 'music', decor: 9,
  },
  {
    id: 'gitarre-lagerfeuer', name: 'Akustikgitarre Lagerfeuer', desc: 'Westerngitarre auf Ständer. Drei Akkorde reichen für jedes Lagerfeuer.',
    cat: 'hobby', price: 240, w: 1, d: 1, h: 1.05,
    parts: [RB(-0.12, 0.15, 0, 0.03, 0.03, 0.3, [0, 30, 0], BLK), RB(0.12, 0.15, 0, 0.03, 0.03, 0.3, [0, -30, 0], BLK), RB(0, 0.4, -0.1, 0.03, 0.8, 0.03, [-12, 0, 0], BLK), S(0, 0.32, 0.02, 0.38, 0.4, 0.1, 'A'), S(0, 0.58, 0.0, 0.3, 0.28, 0.1, 'A'), RC(0, 0.45, 0.07, 0.09, 0.01, 0.09, [80, 0, 0], BLK), RB(0, 0.86, -0.06, 0.06, 0.42, 0.03, [-12, 0, 0], WAL), RB(0, 1.04, -0.1, 0.08, 0.12, 0.03, [-12, 0, 0], DARKW)],
    colorsA: ['#d9a35f', '#8a4b2b', BLK, '#3f6e8c'], func: ['guitar'], slots: [use(0, 0.6)], skill: 'music', decor: 3,
  },
  {
    id: 'egitarre-donnerhall', name: 'E-Gitarre Donnerhall', desc: 'E-Gitarre mit Röhrenverstärker. Laut, lauter, Donnerhall.',
    cat: 'hobby', price: 690, w: 1, d: 1, h: 1.05,
    parts: [B(0.22, 0, -0.2, 0.5, 0.48, 0.28, BLK), B(0.22, 0.06, -0.058, 0.44, 0.3, 0.005, '#3a3a3a'), B(0.22, 0.4, -0.058, 0.44, 0.06, 0.005, BRASS), RB(-0.25, 0.4, 0, 0.03, 0.8, 0.03, [-12, 0, 0], BLK), RB(-0.25, 0.15, 0.1, 0.24, 0.03, 0.03, [0, 0, 0], BLK), RB(-0.25, 0.35, 0.02, 0.34, 0.38, 0.06, [-12, 0, 0], 'A'), RB(-0.25, 0.33, 0.06, 0.2, 0.18, 0.01, [-12, 0, 0], WHT), RB(-0.25, 0.75, -0.06, 0.05, 0.5, 0.03, [-12, 0, 0], WAL), RB(-0.25, 1.0, -0.12, 0.07, 0.1, 0.03, [-12, 0, 0], BLK)],
    colorsA: ['#a63d32', BLK, SKY, '#f0e6c8', MUS], func: ['guitar'], slots: [use(0, 0.6)], skill: 'music', decor: 3,
  },
  {
    id: 'schachtisch-denkpause', name: 'Schachtisch Denkpause', desc: 'Kleiner Spieltisch mit eingelegtem Schachbrett und zwei Hockern.',
    cat: 'hobby', price: 220, w: 2, d: 1, h: 0.75,
    parts: [B(0, 0.68, 0, 0.6, 0.04, 0.6, 'A'), B(0, 0.72, 0, 0.44, 0.005, 0.44, CRE), ...[-0.165, -0.055, 0.055, 0.165].flatMap((x, i) => [-0.165, -0.055, 0.055, 0.165].filter((_, j) => (i + j) % 2 === 0).map((z) => B(x, 0.722, z, 0.11, 0.004, 0.11, DARKW))), C(0, 0, 0, 0.12, 0.68, 0.12, 'A'), C(0, 0, 0, 0.4, 0.04, 0.4, 'A'), C(-0.1, 0.725, -0.15, 0.04, 0.08, 0.04, WHT), C(0.1, 0.725, 0.15, 0.04, 0.08, 0.04, BLK), C(-0.7, 0, 0, 0.36, 0.45, 0.36, 'A', { t: 0.85 }), C(0.7, 0, 0, 0.36, 0.45, 0.36, 'A', { t: 0.85 })],
    colorsA: [WAL, OAK, BIR, BLK], func: ['chess', 'table'], slots: [sit(-0.7, 0, 0.45, 90), sit(0.7, 0, 0.45, 270)], skill: 'logic', comfort: 3, decor: 4,
  },
  {
    id: 'teleskop-sternengucker', name: 'Teleskop Sternengucker', desc: 'Linsenteleskop auf Dreibein. Auf der Suche nach fernen Galaxien.',
    cat: 'hobby', price: 450, w: 1, d: 1, h: 1.6,
    parts: [RB(0, 0.55, 0.12, 0.03, 1.1, 0.03, [12, 0, 0], ANT), RB(-0.1, 0.55, -0.06, 0.03, 1.1, 0.03, [-6, 0, 10], ANT), RB(0.1, 0.55, -0.06, 0.03, 1.1, 0.03, [-6, 0, -10], ANT), C(0, 0.4, 0, 0.18, 0.02, 0.18, ANT), B(0, 1.05, 0, 0.1, 0.12, 0.1, BLK), RC(0, 1.28, 0.05, 0.12, 0.85, 0.12, [-55, 0, 0], 'A'), RC(0, 1.52, 0.4, 0.15, 0.12, 0.15, [-55, 0, 0], BLK), RC(0, 1.12, -0.18, 0.05, 0.12, 0.05, [-55, 0, 0], BLK), RC(0.07, 1.25, 0.0, 0.03, 0.2, 0.03, [-55, 0, 0], CHR)],
    colorsA: [WHT, NAVY, '#a63d32', BLK], func: ['telescope'], slots: [use(0, -0.35, 0)], skill: 'logic', outdoor: true, decor: 3,
  },
  {
    id: 'werkbank-tueftelecke', name: 'Werkbank Tüftelecke', desc: 'Massive Werkbank mit Lochwand, Schraubstock und Werkzeug.',
    cat: 'hobby', price: 600, w: 2, d: 1, h: 1.8,
    parts: [B(0, 0.82, -0.15, 1.8, 0.06, 0.66, BIR), ...legs4(0.84, 0.28, 0.82, 0.08, 'A', false, 0, -0.15), B(0, 0.2, -0.15, 1.7, 0.03, 0.56, 'A'), B(0, 0.88, -0.47, 1.8, 0.9, 0.03, '#c9a879'), B(-0.75, 0.88, 0.05, 0.14, 0.12, 0.2, '#3c5a8a'), B(-0.75, 0.96, 0.15, 0.2, 0.04, 0.04, CHR), RB(-0.3, 1.4, -0.44, 0.03, 0.3, 0.02, [0, 0, 20], '#a63d32'), RB(-0.1, 1.4, -0.44, 0.03, 0.28, 0.02, [0, 0, -15], ANT), B(0.2, 1.3, -0.44, 0.25, 0.04, 0.03, MUS), B(0.5, 1.45, -0.44, 0.06, 0.24, 0.03, CHR), B(0.5, 0.88, -0.2, 0.4, 0.15, 0.2, '#a63d32'), B(0.1, 0.22, -0.15, 0.4, 0.2, 0.3, ANT)],
    colorsA: [ANT, '#3c5a8a', '#5a8a4a', OAK], func: ['workbench'], slots: [use(0, 0.85)], skill: 'handiness', decor: 2,
  },
  {
    id: 'kamera-augenblick', name: 'Stativkamera Augenblick', desc: 'Spiegelreflexkamera auf Profistativ für Porträts und Selbstauslöser.',
    cat: 'hobby', price: 380, w: 1, d: 1, h: 1.6,
    parts: [RB(0, 0.65, 0.12, 0.025, 1.3, 0.025, [12, 0, 0], BLK), RB(-0.1, 0.65, -0.06, 0.025, 1.3, 0.025, [-6, 0, 10], BLK), RB(0.1, 0.65, -0.06, 0.025, 1.3, 0.025, [-6, 0, -10], BLK), C(0, 1.25, 0, 0.06, 0.15, 0.06, BLK), B(0, 1.4, 0, 0.2, 0.13, 0.08, 'A'), RC(0, 1.46, 0.08, 0.08, 0.1, 0.08, [90, 0, 0], BLK), RC(0, 1.46, 0.135, 0.06, 0.01, 0.06, [90, 0, 0], '#3a6ea8', { e: 0.3 }), B(0, 1.53, 0, 0.08, 0.04, 0.06, 'A'), RB(-0.06, 1.3, -0.12, 0.02, 0.02, 0.2, [20, 0, 0], BLK)],
    colorsA: [BLK, '#c9c3b8', '#5b6b5a'], func: ['camera'], slots: [use(0, -0.35, 0)], skill: 'photography', decor: 2,
  },
  {
    id: 'jukebox-groschengrab', name: 'Jukebox Groschengrab', desc: 'Leuchtende Musikbox im Stil der 50er mit Bogen und Chromleisten.',
    cat: 'hobby', price: 1100, w: 1, d: 1, h: 1.6,
    parts: [B(0, 0, -0.15, 0.8, 1.2, 0.5, 'A'), RC(0, 1.2, -0.15, 0.8, 0.5, 0.8, [90, 0, 0], 'A'), RC(0, 1.2, 0.1, 0.66, 0.02, 0.66, [90, 0, 0], '#ffcf6a', { e: 0.7 }), B(0, 0.75, 0.105, 0.6, 0.35, 0.01, 'glass'), B(0, 0.78, 0.09, 0.5, 0.28, 0.01, '#3b2a1e'), B(0, 0.1, 0.105, 0.6, 0.45, 0.01, '#3a3a3a'), B(-0.36, 0.1, 0.11, 0.04, 1.1, 0.02, '#ff6aa8', { e: 0.6 }), B(0.36, 0.1, 0.11, 0.04, 1.1, 0.02, '#6ac8ff', { e: 0.6 }), B(0, 0.6, 0.11, 0.66, 0.04, 0.02, CHR)],
    colorsA: ['#a63d32', '#2e5e4e', CRE, NAVY], func: ['jukebox'], slots: [use(0, 0.7)], light: { color: '#ffb46a', intensity: 0.4 }, decor: 7,
  },

  // ======================= BÜRO =======================
  {
    id: 'schreibtisch-fleissbiene', name: 'Schreibtisch Fleißbiene', desc: 'Praktischer Schreibtisch mit Rollcontainer für Hausaufgaben und Bürokram.',
    cat: 'office', price: 220, w: 2, d: 1, h: 0.76,
    parts: [B(0, 0.72, -0.12, 1.5, 0.03, 0.7, 'A'), ...legs4(0.71, 0.31, 0.72, 0.05, STL, false, 0, -0.12), B(0.5, 0.04, -0.12, 0.4, 0.58, 0.55, 'A'), C(0.36, 0, 0.1, 0.04, 0.04, 0.04, BLK), C(0.64, 0, 0.1, 0.04, 0.04, 0.04, BLK), B(0.5, 0.45, 0.156, 0.36, 0.005, 0.01, '#8d8478'), B(-0.4, 0.75, -0.2, 0.3, 0.04, 0.22, WHT), C(-0.1, 0.75, -0.3, 0.08, 0.1, 0.08, MUS)],
    colorsA: [WHT, OAK, BIR, ANT], func: ['desk', 'table'], decor: 2,
  },
  {
    id: 'schreibtisch-hochkant', name: 'Steh-Sitz-Schreibtisch Hochkant', desc: 'Elektrisch höhenverstellbarer Schreibtisch mit Massivholzplatte.',
    cat: 'office', price: 650, w: 2, d: 1, h: 0.76,
    parts: [B(0, 0.72, -0.12, 1.6, 0.035, 0.72, 'A'), B(-0.68, 0.0, -0.12, 0.08, 0.04, 0.66, ANT), B(0.68, 0.0, -0.12, 0.08, 0.04, 0.66, ANT), B(-0.68, 0.04, -0.12, 0.08, 0.66, 0.08, ANT), B(0.68, 0.04, -0.12, 0.08, 0.66, 0.08, ANT), B(0, 0.66, -0.12, 1.3, 0.06, 0.1, ANT), B(0.6, 0.7, 0.2, 0.08, 0.02, 0.04, '#53d18a', { e: 0.5 })],
    colorsA: [OAK, WAL, WHT, BLK], func: ['desk', 'table'], decor: 4,
  },
  {
    id: 'sekretaer-nussbaum', name: 'Sekretär Nussknacker', desc: 'Klassischer Schreibsekretär aus Nussbaum mit Aufsatz und Fächern.',
    cat: 'office', price: 480, w: 1, d: 1, h: 1.35,
    parts: [B(0, 0.74, -0.2, 0.92, 0.03, 0.58, 'A'), ...legs4(0.42, 0.25, 0.74, 0.05, 'A', true, 0, -0.2, { t: 1.3 }), B(0, 0.62, -0.2, 0.88, 0.12, 0.5, 'A'), B(0, 0.77, -0.4, 0.92, 0.58, 0.2, 'A'), B(-0.2, 0.8, -0.3, 0.02, 0.5, 0.01, DARKW), B(0.2, 0.8, -0.3, 0.02, 0.5, 0.01, DARKW), B(0, 1.05, -0.3, 0.38, 0.02, 0.01, DARKW), B(0, 0.66, 0.06, 0.12, 0.02, 0.02, BRASS), B(0, 0.77, -0.15, 0.25, 0.01, 0.18, CRE)],
    colorsA: [WAL, DARKW, OAK, '#2e5e4e'], func: ['desk', 'table'], decor: 5,
  },
  {
    id: 'computer-rechenknecht', name: 'Computer Rechenknecht', desc: 'Desktop-PC mit Bildschirm, Tastatur und Maus. Zum Arbeiten, Spielen und Programmieren.',
    cat: 'office', price: 650, w: 1, d: 1, h: 0.5, mount: 'surface',
    parts: [B(0, 0, -0.25, 0.22, 0.015, 0.16, BLK), B(0, 0.015, -0.27, 0.05, 0.14, 0.03, BLK), B(0, 0.12, -0.26, 0.58, 0.36, 0.03, BLK), B(0, 0.135, -0.243, 0.55, 0.32, 0.005, SCR, { e: 0.6 }), B(0, 0, 0.0, 0.44, 0.02, 0.15, 'A'), B(0.3, 0, 0.0, 0.06, 0.02, 0.1, 'A'), B(-0.36, 0, -0.18, 0.18, 0.42, 0.4, 'A'), B(-0.36, 0.35, 0.025, 0.02, 0.02, 0.005, '#6ec6ff', { e: 0.8 })],
    colorsA: [BLK, WHT, STL], func: ['computer'], slots: [sit(0, 0.75, 0.45, 180)], skill: 'programming', breaks: true, decor: 1,
  },
  {
    id: 'laptop-klappflink', name: 'Laptop Klappflink', desc: 'Leichtes Notebook für unterwegs. Passt auf jeden Tisch.',
    cat: 'office', price: 900, w: 1, d: 1, h: 0.25, mount: 'surface',
    parts: [B(0, 0, 0, 0.34, 0.018, 0.24, 'A'), B(0, 0.018, 0.02, 0.28, 0.003, 0.1, ANT), RB(0, 0.125, -0.15, 0.34, 0.23, 0.012, [-12, 0, 0], 'A'), RB(0, 0.125, -0.142, 0.31, 0.2, 0.002, [-12, 0, 0], SCR, { e: 0.6 }), B(0, 0.018, 0.09, 0.09, 0.002, 0.05, '#8d9196'), C(0.25, 0, 0.05, 0.08, 0.1, 0.08, TER)],
    colorsA: [STL, ANT, '#e3c6b8', SKY], func: ['computer'], slots: [sit(0, 0.75, 0.45, 180)], skill: 'writing', breaks: true, decor: 1,
  },
  {
    id: 'arbeitsplatz-homeoffice', name: 'Arbeitsplatz Homeoffice Kompakt', desc: 'Komplettset: Schreibtisch, Bürostuhl und Computer – sofort einsatzbereit.',
    cat: 'office', price: 1050, w: 2, d: 1, h: 1.15,
    parts: [B(0, 0.72, -0.2, 1.4, 0.03, 0.6, 'A'), ...legs4(0.66, 0.26, 0.72, 0.05, ANT, false, 0, -0.2), B(0, 0.75, -0.38, 0.2, 0.015, 0.14, BLK), B(0, 0.765, -0.39, 0.04, 0.12, 0.03, BLK), B(0, 0.86, -0.39, 0.6, 0.34, 0.03, BLK), B(0, 0.875, -0.373, 0.56, 0.3, 0.005, SCR, { e: 0.6 }), B(0, 0.75, -0.12, 0.42, 0.02, 0.14, WHT), C(0, 0, 0.3, 0.42, 0.04, 0.42, BLK), C(0, 0.04, 0.3, 0.05, 0.36, 0.05, CHR), B(0, 0.4, 0.3, 0.46, 0.07, 0.4, 'B'), B(0, 0.47, 0.47, 0.44, 0.5, 0.05, 'B')],
    colorsA: [WHT, OAK, ANT], colorsB: [ANT, PET, TER, SAGE], func: ['desk', 'computer', 'table'], slots: [sit(0, 0.3, 0.45, 180)], skill: 'programming', breaks: true, comfort: 4, decor: 2,
  },
  {
    id: 'gaming-pixelpalast', name: 'Gaming-Station Pixelpalast', desc: 'Zwei Monitore, leuchtender Rechner und Rennsitz – für lange Nächte im Spiel.',
    cat: 'office', price: 2200, w: 2, d: 1, h: 1.3,
    parts: [B(0, 0.72, -0.2, 1.6, 0.03, 0.6, BLK), B(-0.76, 0, -0.2, 0.06, 0.72, 0.56, BLK), B(0.76, 0, -0.2, 0.06, 0.72, 0.56, BLK), B(0, 0.7, 0.095, 1.5, 0.015, 0.01, 'A', { e: 0.8 }), RB(-0.3, 1.0, -0.38, 0.6, 0.34, 0.03, [0, 12, 0], BLK), RB(-0.3, 1.0, -0.36, 0.56, 0.3, 0.005, [0, 12, 0], SCR, { e: 0.6 }), RB(0.3, 1.0, -0.38, 0.6, 0.34, 0.03, [0, -12, 0], BLK), RB(0.3, 1.0, -0.36, 0.56, 0.3, 0.005, [0, -12, 0], SCR, { e: 0.6 }), B(0, 0.75, -0.42, 0.04, 0.1, 0.04, BLK), B(0.55, 0.75, -0.3, 0.2, 0.42, 0.4, BLK), B(0.55, 0.8, -0.098, 0.16, 0.3, 0.005, 'A', { e: 0.7 }), B(-0.1, 0.75, -0.08, 0.5, 0.02, 0.16, BLK), C(0, 0, 0.3, 0.4, 0.04, 0.4, BLK), C(0, 0.04, 0.3, 0.06, 0.36, 0.06, CHR), B(0, 0.4, 0.28, 0.5, 0.08, 0.42, BLK), RB(0, 0.83, 0.45, 0.5, 0.8, 0.08, [8, 0, 0], BLK), RB(0, 0.83, 0.405, 0.2, 0.7, 0.01, [8, 0, 0], 'A')],
    colorsA: ['#ff3b6b', '#3bd1ff', '#7bff5a', '#b06aff'], func: ['desk', 'computer', 'table'], slots: [sit(0, 0.3, 0.45, 180)], skill: 'programming', breaks: true, comfort: 5, decor: 4,
  },
  {
    id: 'buerostuhl-drehwurm', name: 'Bürostuhl Drehwurm', desc: 'Drehstuhl mit Rollen und Netzrücken. Einmal im Kreis drehen ist Pflicht.',
    cat: 'office', price: 190, w: 1, d: 1, h: 1.05,
    parts: [...[0, 72, 144, 216, 288].map((a) => RB(Math.sin((a * Math.PI) / 180) * 0.15, 0.04, Math.cos((a * Math.PI) / 180) * 0.15, 0.04, 0.03, 0.3, [0, a, 0], BLK)), ...[0, 72, 144, 216, 288].map((a) => S(+(Math.sin((a * Math.PI) / 180) * 0.28).toFixed(3), 0.025, +(Math.cos((a * Math.PI) / 180) * 0.28).toFixed(3), 0.05, 0.05, 0.05, BLK)), C(0, 0.05, 0, 0.05, 0.35, 0.05, CHR), B(0, 0.4, 0.02, 0.48, 0.07, 0.46, 'A'), B(0, 0.5, -0.22, 0.44, 0.5, 0.04, 'A'), B(0, 0.45, -0.22, 0.06, 0.1, 0.04, BLK)],
    colorsA: [ANT, PET, TER, SAGE, BLK], func: ['seat'], slots: [sit(0, 0.02)], comfort: 5, decor: 1,
  },
  {
    id: 'chefsessel-ledermeister', name: 'Chefsessel Ledermeister', desc: 'Hochlehner aus Leder mit gepolsterten Armlehnen und Wippmechanik.',
    cat: 'office', price: 520, w: 1, d: 1, h: 1.25,
    parts: [...[0, 72, 144, 216, 288].map((a) => RB(Math.sin((a * Math.PI) / 180) * 0.16, 0.04, Math.cos((a * Math.PI) / 180) * 0.16, 0.05, 0.03, 0.32, [0, a, 0], CHR)), C(0, 0.05, 0, 0.06, 0.33, 0.06, CHR), B(0, 0.38, 0.02, 0.54, 0.1, 0.5, 'A'), B(0, 0.48, -0.24, 0.52, 0.75, 0.1, 'A'), B(0, 0.7, -0.19, 0.42, 0.45, 0.04, 'A'), B(-0.27, 0.6, 0.02, 0.06, 0.05, 0.4, 'A'), B(0.27, 0.6, 0.02, 0.06, 0.05, 0.4, 'A'), B(-0.27, 0.48, 0.02, 0.03, 0.12, 0.03, CHR), B(0.27, 0.48, 0.02, 0.03, 0.12, 0.03, CHR)],
    colorsA: ['#5a3a28', BLK, '#8b2f2f', CRE], func: ['seat'], slots: [sit(0, 0.02, 0.48)], comfort: 7, decor: 4,
  },

  // ======================= GARTEN =======================
  {
    id: 'gemuesebeet-gruenzeug', name: 'Gemüsebeet Grünzeug', desc: 'Bodenbeet mit Holzeinfassung für Salat, Möhren und Tomaten.',
    cat: 'garden', price: 150, w: 2, d: 1, h: 0.45, outdoor: true,
    parts: [B(0, 0, -0.42, 1.9, 0.18, 0.06, PINE), B(0, 0, 0.42, 1.9, 0.18, 0.06, PINE), B(-0.92, 0, 0, 0.06, 0.18, 0.9, PINE), B(0.92, 0, 0, 0.06, 0.18, 0.9, PINE), B(0, 0, 0, 1.78, 0.15, 0.78, SOIL), ...[-0.6, -0.2, 0.2, 0.6].flatMap((x, i) => [S(x, 0.22, -0.18, 0.22, 0.16, 0.22, i % 2 ? G3 : G1), S(x + 0.1, 0.22, 0.2, 0.2, 0.14, 0.2, i % 2 ? G1 : G2)]), S(0.6, 0.3, -0.18, 0.06, 0.06, 0.06, '#d9412b')],
    func: ['gardenbed'], slots: [use(0, 0.85)], skill: 'gardening', decor: 3,
  },
  {
    id: 'hochbeet-kraeuterburg', name: 'Hochbeet Kräuterburg', desc: 'Rückenschonendes Hochbeet aus Lärchenholz mit Kräutern und Gemüse.',
    cat: 'garden', price: 340, w: 2, d: 1, h: 1.0, outdoor: true,
    parts: [B(0, 0, -0.33, 1.84, 0.75, 0.06, 'A'), B(0, 0, 0.33, 1.84, 0.75, 0.06, 'A'), B(-0.89, 0, 0, 0.06, 0.75, 0.72, 'A'), B(0.89, 0, 0, 0.06, 0.75, 0.72, 'A'), B(0, 0.75, -0.33, 1.9, 0.03, 0.1, 'A'), B(0, 0.75, 0.33, 1.9, 0.03, 0.1, 'A'), B(0, 0.6, 0, 1.72, 0.12, 0.6, SOIL), ...[-0.6, 0, 0.6].map((x) => S(x, 0.82, -0.1, 0.3, 0.22, 0.28, G2)), S(-0.3, 0.8, 0.12, 0.25, 0.18, 0.22, G3), S(0.3, 0.8, 0.12, 0.25, 0.2, 0.22, G1), C(0.6, 0.9, 0.12, 0.02, 0.1, 0.02, '#d9412b'), B(0, 0.25, 0.362, 1.7, 0.005, 0.005, DARKW)],
    colorsA: ['#b88a5a', '#8a6a4a', '#7b8a6a', ANT], func: ['gardenbed'], slots: [use(0, 0.85)], skill: 'gardening', decor: 4,
  },
  {
    id: 'grill-glutkugel', name: 'Kugelgrill Glutkugel', desc: 'Klassischer Holzkohle-Kugelgrill auf drei Beinen.',
    cat: 'garden', price: 160, w: 1, d: 1, h: 1.0, outdoor: true,
    parts: [S(0, 0.7, 0, 0.56, 0.36, 0.56, 'A'), S(0, 0.78, 0, 0.57, 0.32, 0.57, 'A'), C(0, 0.94, 0, 0.08, 0.04, 0.08, BLK), RB(0, 0.31, 0.17, 0.03, 0.62, 0.03, [-15, 0, 0], STL), RB(-0.15, 0.31, -0.09, 0.03, 0.62, 0.03, [8, 0, 13], STL), RB(0.15, 0.31, -0.09, 0.03, 0.62, 0.03, [8, 0, -13], STL), C(0, 0.25, 0, 0.32, 0.01, 0.32, STL), RC(-0.25, 0.04, -0.15, 0.08, 0.03, 0.08, [0, 0, 90], BLK), B(0, 0.8, 0.29, 0.14, 0.03, 0.04, BLK)],
    colorsA: [BLK, '#a63d32', '#2e5e4e', NAVY], func: ['grill'], slots: [use(0, 0.75)], skill: 'cooking', decor: 2,
  },
  {
    id: 'grill-grillmeister', name: 'Gasgrill Grillmeister Pro', desc: 'Großer Gasgrill mit vier Brennern, Seitenablagen und Unterschrank.',
    cat: 'garden', price: 890, w: 2, d: 1, h: 1.3, outdoor: true,
    parts: [B(0, 0.1, -0.1, 0.9, 0.72, 0.55, 'A'), B(0, 0.12, 0.18, 0.86, 0.6, 0.01, STL), B(0, 0.82, -0.1, 0.92, 0.18, 0.58, STL), RC(0, 1.0, -0.1, 0.42, 0.9, 0.56, [0, 0, 90], STL), B(0, 1.12, 0.17, 0.5, 0.03, 0.03, CHR), B(-0.7, 0.88, -0.1, 0.48, 0.03, 0.5, STL), B(0.7, 0.88, -0.1, 0.48, 0.03, 0.5, STL), ...[-0.3, -0.1, 0.1, 0.3].map((x) => C(x, 0.88, 0.2, 0.05, 0.03, 0.05, BLK, { r: [90, 0, 0] })), ...legs4(0.42, 0.24, 0.1, 0.07, BLK, true, 0, -0.1), C(0.75, 0.91, -0.1, 0.12, 0.2, 0.12, '#a63d32')],
    colorsA: [BLK, ANT, '#a63d32', '#2e5e4e'], func: ['grill'], slots: [use(0, 0.8)], skill: 'cooking', decor: 3,
  },
  {
    id: 'gartenbank-parkruh', name: 'Gartenbank Parkruh', desc: 'Robuste Holzbank mit Gusseisenbeinen für den Garten.',
    cat: 'garden', price: 220, w: 2, d: 1, h: 0.85, outdoor: true,
    parts: [B(0, 0.42, -0.05, 1.6, 0.03, 0.12, 'A'), B(0, 0.42, 0.08, 1.6, 0.03, 0.12, 'A'), B(0, 0.42, 0.21, 1.6, 0.03, 0.12, 'A'), RB(0, 0.62, -0.17, 1.6, 0.1, 0.03, [-12, 0, 0], 'A'), RB(0, 0.76, -0.2, 1.6, 0.1, 0.03, [-12, 0, 0], 'A'), B(-0.72, 0, 0.08, 0.05, 0.42, 0.42, BLK), B(0.72, 0, 0.08, 0.05, 0.42, 0.42, BLK), RB(-0.72, 0.62, -0.17, 0.05, 0.42, 0.05, [-12, 0, 0], BLK), RB(0.72, 0.62, -0.17, 0.05, 0.42, 0.05, [-12, 0, 0], BLK), B(-0.72, 0.6, 0.08, 0.06, 0.04, 0.42, BLK), B(0.72, 0.6, 0.08, 0.06, 0.04, 0.42, BLK)],
    colorsA: [OAK, '#7a5a3a', '#3e6b35', WHT], func: ['bench', 'seat'], slots: [sit(-0.4, 0.1), sit(0.4, 0.1)], comfort: 4, decor: 3,
  },
  {
    id: 'gartenbank-rosenbogen', name: 'Rosenbogen-Bank Rosengarten', desc: 'Weiße Bank unter einem berankten Rosenbogen. Romantik pur.',
    cat: 'garden', price: 560, w: 2, d: 1, h: 2.4, outdoor: true,
    parts: [B(0, 0.42, 0.05, 1.4, 0.04, 0.4, 'A'), B(0, 0.46, -0.13, 1.4, 0.4, 0.03, 'A'), ...legs4(0.66, 0.17, 0.42, 0.05, 'A', false, 0, 0.05), B(-0.88, 0, -0.1, 0.06, 2.1, 0.06, 'A'), B(0.88, 0, -0.1, 0.06, 2.1, 0.06, 'A'), RC(0, 2.1, -0.1, 1.82, 0.06, 0.3, [90, 0, 0], 'A'), ...[[-0.88, 0.6], [-0.88, 1.3], [0.88, 0.9], [0.88, 1.6], [-0.6, 2.15], [0.5, 2.18], [0, 2.25]].map(([x, y]) => S(x, y, -0.1, 0.26, 0.24, 0.2, G2)), ...[[-0.85, 1.0], [0.85, 1.3], [-0.4, 2.2], [0.3, 2.22]].map(([x, y]) => S(x, y, -0.02, 0.08, 0.08, 0.08, '#d9415e'))],
    colorsA: [WHT, '#3e6b35', ANT, '#b88a5a'], func: ['bench', 'seat'], slots: [sit(-0.35, 0.1), sit(0.35, 0.1)], comfort: 4, decor: 7,
  },
  {
    id: 'schaukel-himmelsstuermer', name: 'Doppelschaukel Himmelsstürmer', desc: 'Holzgestell mit zwei Schaukelsitzen – höher, immer höher!',
    cat: 'garden', price: 380, w: 2, d: 2, h: 2.1, outdoor: true,
    parts: [RB(-0.9, 1.0, 0.35, 0.08, 2.1, 0.08, [-18, 0, 0], 'A'), RB(-0.9, 1.0, -0.35, 0.08, 2.1, 0.08, [18, 0, 0], 'A'), RB(0.9, 1.0, 0.35, 0.08, 2.1, 0.08, [-18, 0, 0], 'A'), RB(0.9, 1.0, -0.35, 0.08, 2.1, 0.08, [18, 0, 0], 'A'), B(0, 1.98, 0, 1.9, 0.1, 0.1, 'A'), ...[-0.45, 0.45].flatMap((x) => [C(x - 0.18, 0.45, 0, 0.015, 1.53, 0.015, '#d9c7a0'), C(x + 0.18, 0.45, 0, 0.015, 1.53, 0.015, '#d9c7a0'), B(x, 0.42, 0, 0.42, 0.04, 0.18, 'B')])],
    colorsA: [OAK, '#7a5a3a', WHT], colorsB: ['#e05a4a', MUS, SKY, G3], func: ['swing'], slots: [sit(-0.45, 0, 0.45), sit(0.45, 0, 0.45)], comfort: 3, decor: 3,
  },
  {
    id: 'rutsche-juchhu', name: 'Rutsche Juchhu', desc: 'Kinderrutsche mit Leiter und Plattform. Unten wartet der Jubel.',
    cat: 'garden', price: 420, w: 1, d: 3, h: 1.6, outdoor: true,
    parts: [B(-0.3, 0, -1.2, 0.05, 1.6, 0.05, 'A'), B(0.3, 0, -1.2, 0.05, 1.6, 0.05, 'A'), B(-0.3, 0, -0.75, 0.05, 1.3, 0.05, 'A'), B(0.3, 0, -0.75, 0.05, 1.3, 0.05, 'A'), B(0, 1.2, -0.97, 0.66, 0.05, 0.5, 'A'), ...[0.3, 0.6, 0.9].map((y) => B(0, y, -1.2, 0.6, 0.04, 0.05, 'A')), RB(0, 0.66, 0.2, 0.5, 0.04, 2.0, [33, 0, 0], 'B'), RB(-0.26, 0.72, 0.2, 0.04, 0.14, 2.0, [33, 0, 0], 'B'), RB(0.26, 0.72, 0.2, 0.04, 0.14, 2.0, [33, 0, 0], 'B'), B(0, 0, 1.25, 0.5, 0.12, 0.3, 'B'), B(-0.3, 1.25, -0.97, 0.04, 0.35, 0.5, 'A'), B(0.3, 1.25, -0.97, 0.04, 0.35, 0.5, 'A')],
    colorsA: [OAK, '#3c5a8a', WHT], colorsB: ['#e05a4a', MUS, '#4a8ae0', G3], func: ['slide'], slots: [use(0, -1.35, 0)], decor: 3,
  },
  {
    id: 'pool-lagune', name: 'Swimmingpool Lagune', desc: 'Eingelassener Pool mit Natursteinrand, Leiter und Treppe. Sprung ins kühle Nass!',
    cat: 'garden', price: 4500, w: 3, d: 5, h: 0.95, outdoor: true,
    parts: [B(0, 0, -2.38, 3.0, 0.15, 0.24, STONE), B(0, 0, 2.38, 3.0, 0.15, 0.24, STONE), B(-1.38, 0, 0, 0.24, 0.15, 4.52, STONE), B(1.38, 0, 0, 0.24, 0.15, 4.52, STONE), B(0, 0, 0, 2.52, 0.04, 4.52, '#2b7fa8'), B(0, 0.04, 0, 2.52, 0.06, 4.52, WATER, { e: 0.2 }), B(0, 0.1, 0, 0.12, 0.003, 3.8, '#3c8fb0'), B(0.85, 0.04, 1.95, 0.8, 0.08, 0.5, '#e8eef0'), B(0.85, 0.04, 1.55, 0.8, 0.04, 0.3, '#e8eef0'), C(-0.75, 0, -2.3, 0.05, 0.95, 0.05, CHR), C(-0.35, 0, -2.3, 0.05, 0.95, 0.05, CHR), RC(-0.55, 0.95, -2.3, 0.05, 0.42, 0.05, [0, 0, 90], CHR), B(-0.55, 0.1, -2.15, 0.36, 0.03, 0.06, CHR), B(-0.55, 0.4, -2.15, 0.36, 0.03, 0.06, CHR), S(0.6, 0.12, -0.5, 0.5, 0.12, 0.5, '#f7c948'), C(0.6, 0.06, -0.5, 0.25, 0.14, 0.25, WATER)],
    func: ['pool'], slots: [use(-0.5, -1.0, 0), use(0.5, 0.0, 0), use(-0.5, 1.0, 180)], decor: 7,
  },
  {
    id: 'liegestuhl-sonnenanbeter', name: 'Sonnenliege Sonnenanbeter', desc: 'Verstellbare Gartenliege mit dickem Auflagepolster.',
    cat: 'garden', price: 180, w: 1, d: 2, h: 0.8, outdoor: true,
    parts: [B(0, 0.22, 0.25, 0.62, 0.05, 1.3, 'B'), RB(0, 0.48, -0.6, 0.62, 0.05, 0.7, [-40, 0, 0], 'B'), B(0, 0.27, 0.25, 0.56, 0.06, 1.25, 'A'), RB(0, 0.52, -0.56, 0.56, 0.06, 0.66, [-40, 0, 0], 'A'), ...legs4(0.28, 0.75, 0.22, 0.04, 'B', false, 0, 0), RC(-0.25, 0.08, -0.85, 0.12, 0.04, 0.12, [0, 0, 90], BLK), RC(0.25, 0.08, -0.85, 0.12, 0.04, 0.12, [0, 0, 90], BLK)],
    colorsA: [CRE, TER, PET, MUS, '#b9d0e0'], colorsB: [WHT, OAK, ANT], func: ['seat'], slots: [sit(0, 0.2, 0.33)], comfort: 6, decor: 3,
  },
  {
    id: 'briefkasten-postfuchs', name: 'Briefkasten Postfuchs', desc: 'Briefkasten auf Pfosten mit Fähnchen. Hier landen Rechnungen und Liebesbriefe.',
    cat: 'garden', price: 60, w: 1, d: 1, h: 1.25, outdoor: true,
    parts: [B(0, 0, 0, 0.08, 1.0, 0.08, '#7a5a3a'), B(0, 1.0, 0, 0.26, 0.15, 0.42, 'A'), RC(0, 1.15, 0, 0.26, 0.42, 0.26, [90, 0, 0], 'A'), B(0, 1.02, 0.212, 0.22, 0.2, 0.005, '#555555'), B(0.135, 1.05, -0.05, 0.01, 0.2, 0.02, '#e05a4a'), B(0.135, 1.2, 0.0, 0.01, 0.07, 0.1, '#e05a4a'), B(0, 0, 0, 0.3, 0.03, 0.3, STONE)],
    colorsA: [NAVY, '#a63d32', '#3e6b35', BLK, WHT], func: ['mailbox'], slots: [use(0, 0.6)], decor: 1,
  },
  {
    id: 'briefkasten-landhaus', name: 'Briefkastensäule Landhaus', desc: 'Gemauerte Briefkastensäule mit Hausnummer und Laterne obendrauf.',
    cat: 'garden', price: 150, w: 1, d: 1, h: 1.55, outdoor: true,
    parts: [B(0, 0, 0, 0.4, 1.1, 0.4, 'A'), B(0, 1.1, 0, 0.46, 0.04, 0.46, STONE), B(0, 0.7, 0.202, 0.3, 0.3, 0.005, BRASS), B(0, 0.95, 0.206, 0.2, 0.02, 0.005, BLK), B(0, 0.4, 0.202, 0.12, 0.12, 0.005, '#f2f1ec'), B(0, 1.14, 0, 0.16, 0.22, 0.16, 'glass'), S(0, 1.25, 0, 0.1, 0.1, 0.1, '#ffd98a', { e: 0.9 }), C(0, 1.36, 0, 0.22, 0.1, 0.22, BLK, { t: 0 })],
    colorsA: ['#c9b9a6', '#9b5a45', WHT, ANT], func: ['mailbox'], slots: [use(0, 0.6)], decor: 3,
  },
  {
    id: 'gartentisch-terrassenrunde', name: 'Gartentisch Terrassenrunde', desc: 'Wetterfester runder Gartentisch mit Sonnenschirm.',
    cat: 'garden', price: 240, w: 1, d: 1, h: 2.3, outdoor: true,
    parts: [C(0, 0.71, 0, 0.9, 0.04, 0.9, 'A'), ...legs4(0.28, 0.28, 0.71, 0.04, 'A', true), C(0, 0, 0, 0.03, 2.1, 0.03, WHT), C(0, 1.9, 0, 1.0, 0.35, 1.0, 'B', { t: 0 }), C(0, 2.24, 0, 0.05, 0.06, 0.05, WHT)],
    colorsA: [WHT, OAK, ANT, '#3e6b35'], colorsB: [CRE, TER, PET, MUS], func: ['table'], decor: 3,
  },

  // ======================= FITNESS =======================
  {
    id: 'laufband-kilometerfresser', name: 'Laufband Kilometerfresser', desc: 'Klappbares Laufband mit einfacher Anzeige. Jeder Schritt zählt.',
    cat: 'fitness', price: 900, w: 1, d: 2, h: 1.35,
    parts: [B(0, 0, 0.1, 0.72, 0.16, 1.7, ANT), B(0, 0.16, 0.12, 0.5, 0.02, 1.55, BLK), B(-0.31, 0.16, 0.12, 0.08, 0.03, 1.55, 'A'), B(0.31, 0.16, 0.12, 0.08, 0.03, 1.55, 'A'), RB(-0.32, 0.7, -0.7, 0.05, 1.1, 0.05, [-10, 0, 0], ANT), RB(0.32, 0.7, -0.7, 0.05, 1.1, 0.05, [-10, 0, 0], ANT), B(0, 1.2, -0.78, 0.7, 0.14, 0.2, 'A'), B(0, 1.25, -0.67, 0.36, 0.08, 0.005, SCR, { e: 0.5 }), B(-0.32, 1.05, -0.6, 0.04, 0.04, 0.3, BLK), B(0.32, 1.05, -0.6, 0.04, 0.04, 0.3, BLK)],
    colorsA: [ANT, '#3c5a8a', '#a63d32', WHT], func: ['treadmill'], slots: [stand(0, 0.15, 180)], skill: 'fitness', decor: 1,
  },
  {
    id: 'laufband-marathon', name: 'Laufband Marathonmaschine', desc: 'Profi-Laufband mit Steigung, Touchscreen und Pulsmessung.',
    cat: 'fitness', price: 1900, w: 1, d: 2, h: 1.5,
    parts: [B(0, 0, 0.1, 0.86, 0.22, 1.8, BLK), B(0, 0.22, 0.14, 0.56, 0.02, 1.6, '#1a1a1a'), B(-0.36, 0.22, 0.14, 0.12, 0.03, 1.6, 'A'), B(0.36, 0.22, 0.14, 0.12, 0.03, 1.6, 'A'), B(-0.36, 0.22, -0.72, 0.1, 1.05, 0.12, BLK), B(0.36, 0.22, -0.72, 0.1, 1.05, 0.12, BLK), RB(0, 1.32, -0.75, 0.8, 0.28, 0.08, [-25, 0, 0], BLK), RB(0, 1.33, -0.71, 0.5, 0.2, 0.005, [-25, 0, 0], SCR, { e: 0.7 }), B(-0.4, 1.1, -0.45, 0.04, 0.04, 0.45, CHR), B(0.4, 1.1, -0.45, 0.04, 0.04, 0.45, CHR), B(0, 0.11, 0.996, 0.6, 0.02, 0.005, 'A', { e: 0.6 })],
    colorsA: ['#ff6a3b', '#3bd1ff', '#7bff5a', WHT], func: ['treadmill'], slots: [stand(0, 0.2, 180)], skill: 'fitness', decor: 2,
  },
  {
    id: 'hantelbank-eisenwille', name: 'Hantelbank Eisenwille', desc: 'Flachbank mit Ablage und Langhantel. Für ehrliche Muskeln.',
    cat: 'fitness', price: 450, w: 1, d: 2, h: 1.2,
    parts: [B(0, 0.36, 0.25, 0.3, 0.1, 1.2, 'A'), B(0, 0, -0.25, 0.06, 0.36, 0.06, BLK), B(0, 0, 0.75, 0.06, 0.36, 0.06, BLK), B(0, 0, -0.25, 0.5, 0.04, 0.08, BLK), B(0, 0, 0.75, 0.5, 0.04, 0.08, BLK), B(-0.3, 0, -0.55, 0.06, 1.1, 0.06, BLK), B(0.3, 0, -0.55, 0.06, 1.1, 0.06, BLK), B(0, 0, -0.55, 0.7, 0.04, 0.1, BLK), RC(0, 1.05, -0.5, 0.03, 0.96, 0.03, [0, 0, 90], CHR), RC(-0.4, 1.05, -0.5, 0.3, 0.04, 0.3, [0, 0, 90], ANT), RC(0.4, 1.05, -0.5, 0.3, 0.04, 0.3, [0, 0, 90], ANT), RC(-0.44, 1.05, -0.5, 0.24, 0.03, 0.24, [0, 0, 90], ANT), RC(0.44, 1.05, -0.5, 0.24, 0.03, 0.24, [0, 0, 90], ANT)],
    colorsA: [BLK, '#a63d32', '#3c5a8a'], func: ['weights'], slots: [sit(0, 0.4, 0.46, 0)], skill: 'fitness', decor: 1,
  },
  {
    id: 'hantelturm-kurzhantel', name: 'Kurzhantel-Turm Muskelkater', desc: 'Ständer mit fünf Paar Kurzhanteln von leicht bis „aua“.',
    cat: 'fitness', price: 220, w: 1, d: 1, h: 1.0,
    parts: [B(-0.3, 0, -0.2, 0.05, 0.95, 0.4, BLK), B(0.3, 0, -0.2, 0.05, 0.95, 0.4, BLK), RB(0, 0.4, -0.12, 0.6, 0.03, 0.2, [-20, 0, 0], BLK), RB(0, 0.75, -0.25, 0.6, 0.03, 0.2, [-20, 0, 0], BLK), ...[-0.18, 0, 0.18].flatMap((x) => [RC(x, 0.47, -0.12, 0.1, 0.16, 0.1, [0, 0, 90], 'A'), RC(x, 0.82, -0.25, 0.08, 0.14, 0.08, [0, 0, 90], 'A')]), B(0, 0, -0.2, 0.65, 0.04, 0.45, BLK)],
    colorsA: [ANT, '#a63d32', '#3c5a8a', MUS], func: ['weights'], slots: [use(0, 0.65)], skill: 'fitness', decor: 1,
  },
  {
    id: 'yogamatte-sonnengruss', name: 'Yogamatte Sonnengruß', desc: 'Rutschfeste Yogamatte mit Block und Gurt. Einatmen, ausatmen.',
    cat: 'fitness', price: 60, w: 1, d: 2, h: 0.12,
    parts: [B(0, 0, 0.05, 0.62, 0.008, 1.8, 'A'), RC(0, 0.05, -0.86, 0.1, 0.62, 0.1, [0, 0, 90], 'A'), B(0.38, 0, 0.6, 0.15, 0.1, 0.23, '#c9a06a'), RB(0.38, 0.006, 0.2, 0.04, 0.005, 0.4, [0, 15, 0], ANT)],
    colorsA: ['#7b5a8a', SAGE, TER, SKY, ROSE], func: ['yogamat'], slots: [stand(0, 0.1, 0)], skill: 'fitness', decor: 1,
  },
  {
    id: 'yogamatte-lotusinsel', name: 'Yoga-Ecke Lotusinsel', desc: 'Korkmatte mit Meditationskissen, Bolster und Duftkerze.',
    cat: 'fitness', price: 140, w: 1, d: 2, h: 0.25,
    parts: [B(0, 0, 0.05, 0.66, 0.01, 1.85, '#c9a06a'), C(0.32, 0, -0.75, 0.32, 0.14, 0.32, 'A'), RC(-0.32, 0.1, -0.75, 0.2, 0.5, 0.2, [0, 90, 90], 'A'), C(0.35, 0, 0.75, 0.08, 0.08, 0.08, CRE), C(0.35, 0.08, 0.75, 0.02, 0.03, 0.02, '#ffcf6a', { e: 0.9, t: 0 }), S(-0.35, 0.05, 0.75, 0.16, 0.1, 0.16, G1)],
    colorsA: [SAGE, TER, '#7b5a8a', MUS], func: ['yogamat'], slots: [stand(0, 0.1, 0)], skill: 'fitness', decor: 3,
  },
  {
    id: 'boxsack-prellbock', name: 'Standboxsack Prellbock', desc: 'Freistehender Boxsack mit befüllbarem Fuß. Gut gegen Frust.',
    cat: 'fitness', price: 260, w: 1, d: 1, h: 1.7,
    parts: [C(0, 0, 0, 0.56, 0.3, 0.56, BLK, { t: 0.85 }), C(0, 0.3, 0, 0.14, 0.2, 0.14, ANT), C(0, 0.5, 0, 0.36, 1.1, 0.36, 'A'), S(0, 1.6, 0, 0.36, 0.2, 0.36, 'A'), B(0, 0.9, 0.18, 0.2, 0.08, 0.01, WHT), B(0, 0.5, 0, 0.38, 0.04, 0.38, BLK)],
    colorsA: ['#a63d32', BLK, '#3c5a8a', MUS], func: ['punchbag'], slots: [use(0, 0.7)], skill: 'fitness', decor: 1,
  },
  {
    id: 'boxsack-galgen', name: 'Boxstation Schwergewicht', desc: 'Schwerer Lederboxsack an stabilem Stahlgestell mit Boxhandschuhen.',
    cat: 'fitness', price: 490, w: 1, d: 1, h: 2.2,
    parts: [B(0, 0, -0.38, 0.9, 0.05, 0.2, BLK), B(-0.3, 0, -0.42, 0.06, 2.2, 0.06, BLK), B(0.3, 0, -0.42, 0.06, 2.2, 0.06, BLK), B(0, 2.1, -0.2, 0.06, 0.06, 0.5, BLK), B(0, 2.1, -0.42, 0.66, 0.06, 0.06, BLK), C(0, 1.65, 0.05, 0.015, 0.45, 0.015, CHR), C(0, 0.6, 0.05, 0.4, 1.05, 0.4, 'A'), S(0, 1.65, 0.05, 0.4, 0.1, 0.4, 'A'), S(-0.33, 1.2, -0.37, 0.12, 0.14, 0.12, '#a63d32'), S(-0.33, 1.05, -0.37, 0.12, 0.14, 0.12, '#a63d32')],
    colorsA: ['#5a3a28', BLK, '#a63d32'], func: ['punchbag'], slots: [use(0, 0.75)], skill: 'fitness', decor: 2,
  },

  // ======================= LICHT =======================
  {
    id: 'stehlampe-lichtsaeule', name: 'Stehlampe Lichtsäule', desc: 'Schlanke Stehlampe mit Stoffschirm und warmem Licht.',
    cat: 'light', price: 120, w: 1, d: 1, h: 1.6,
    parts: [C(0, 0, 0, 0.3, 0.03, 0.3, ANT), C(0, 0.03, 0, 0.03, 1.27, 0.03, ANT), C(0, 1.25, 0, 0.42, 0.32, 0.42, 'A', { t: 0.75, e: 0.5 }), S(0, 1.3, 0, 0.1, 0.1, 0.1, '#fff1cf', { e: 1 })],
    colorsA: [CRE, SAGE, MUS, TER, WHT], func: ['light'], light: { color: '#ffd9a0', intensity: 1.0 }, decor: 3,
  },
  {
    id: 'stehlampe-bogenlicht', name: 'Bogenleuchte Bogenlicht', desc: 'Große Bogenleuchte mit Marmorfuß, die sich elegant über das Sofa neigt.',
    cat: 'light', price: 340, w: 1, d: 1, h: 2.0,
    parts: [B(0, 0, -0.3, 0.3, 0.12, 0.3, '#ebe7e1'), C(0, 0.12, -0.3, 0.035, 1.3, 0.035, 'A'), RC(0, 1.6, -0.2, 0.035, 0.45, 0.035, [30, 0, 0], 'A'), RC(0, 1.82, 0.05, 0.035, 0.4, 0.035, [70, 0, 0], 'A'), RC(0, 1.85, 0.25, 0.035, 0.2, 0.035, [110, 0, 0], 'A'), S(0, 1.68, 0.3, 0.38, 0.28, 0.38, 'A', { e: 0.3 }), S(0, 1.58, 0.3, 0.12, 0.08, 0.12, '#fff1cf', { e: 1 })],
    colorsA: [CHR, BRASS, BLK, WHT], func: ['light'], light: { color: '#ffe3b8', intensity: 1.2 }, decor: 5,
  },
  {
    id: 'deckenfluter-sonnenschale', name: 'Deckenfluter Sonnenschale', desc: 'Fluter mit nach oben gerichteter Schale – taucht die Decke in weiches Licht.',
    cat: 'light', price: 180, w: 1, d: 1, h: 1.85,
    parts: [C(0, 0, 0, 0.34, 0.04, 0.34, 'A'), C(0, 0.04, 0, 0.035, 1.6, 0.035, 'A'), C(0, 1.62, 0, 0.42, 0.18, 0.42, 'A', { t: 1.6 }), C(0, 1.78, 0, 0.5, 0.02, 0.5, '#fff1cf', { e: 1 }), C(0, 1.0, 0, 0.06, 0.08, 0.06, BLK)],
    colorsA: [BLK, WHT, BRASS, STL], func: ['light'], light: { color: '#fff0d8', intensity: 1.3 }, decor: 3,
  },
  {
    id: 'tischlampe-leselicht', name: 'Tischleuchte Leselicht', desc: 'Klassische Schreibtischlampe mit Gelenkarm.',
    cat: 'light', price: 60, w: 1, d: 1, h: 0.5, mount: 'surface',
    parts: [C(0, 0, -0.05, 0.16, 0.025, 0.16, 'A'), RC(0, 0.17, -0.08, 0.02, 0.32, 0.02, [-12, 0, 0], 'A'), RC(0, 0.38, 0.0, 0.02, 0.26, 0.02, [55, 0, 0], 'A'), C(0, 0.36, 0.12, 0.14, 0.12, 0.14, 'A', { t: 0.45 }), C(0, 0.35, 0.12, 0.11, 0.01, 0.11, '#fff1cf', { e: 1 })],
    colorsA: [BLK, WHT, '#a63d32', SAGE, MUS], func: ['light'], light: { color: '#fff0d8', intensity: 0.6 }, decor: 2,
  },
  {
    id: 'tischlampe-pilzglueck', name: 'Tischleuchte Pilzglück', desc: 'Verspielte Pilzlampe aus Opalglas – leuchtet wie ein kleiner Mond.',
    cat: 'light', price: 110, w: 1, d: 1, h: 0.36, mount: 'surface',
    parts: [C(0, 0, 0, 0.16, 0.02, 0.16, 'A'), C(0, 0.02, 0, 0.06, 0.2, 0.06, 'A', { t: 0.8 }), S(0, 0.24, 0, 0.32, 0.22, 0.32, 'A', { e: 0.5 }), S(0, 0.2, 0, 0.12, 0.06, 0.12, '#fff1cf', { e: 1 })],
    colorsA: [CRE, ROSE, MUS, SAGE, '#ff8a5a'], func: ['light'], light: { color: '#ffd6a8', intensity: 0.5 }, decor: 3,
  },
  {
    id: 'wandleuchte-kerzenschein', name: 'Wandleuchte Kerzenschein', desc: 'Messing-Wandleuchte mit zwei Kerzenarmen.',
    cat: 'light', price: 90, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: [B(0, 1.45, -0.49, 0.1, 0.2, 0.02, 'A'), RC(-0.1, 1.55, -0.42, 0.02, 0.24, 0.02, [0, 0, 60], 'A'), RC(0.1, 1.55, -0.42, 0.02, 0.24, 0.02, [0, 0, -60], 'A'), C(-0.2, 1.6, -0.42, 0.05, 0.03, 0.05, 'A'), C(0.2, 1.6, -0.42, 0.05, 0.03, 0.05, 'A'), C(-0.2, 1.63, -0.42, 0.03, 0.1, 0.03, CRE), C(0.2, 1.63, -0.42, 0.03, 0.1, 0.03, CRE), S(-0.2, 1.76, -0.42, 0.04, 0.06, 0.04, '#ffcf6a', { e: 1 }), S(0.2, 1.76, -0.42, 0.04, 0.06, 0.04, '#ffcf6a', { e: 1 })],
    colorsA: [BRASS, BLK, CHR], func: ['light'], light: { color: '#ffcf8a', intensity: 0.6 }, decor: 4,
  },
  {
    id: 'wandleuchte-lichtband', name: 'Wandleuchte Lichtband', desc: 'Moderne Wandleuchte mit Licht nach oben und unten.',
    cat: 'light', price: 160, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: [B(0, 1.5, -0.47, 0.5, 0.12, 0.06, 'A'), B(0, 1.62, -0.47, 0.46, 0.005, 0.04, '#fff1cf', { e: 1 }), B(0, 1.495, -0.47, 0.46, 0.005, 0.04, '#fff1cf', { e: 1 }), B(0, 1.53, -0.438, 0.4, 0.06, 0.004, 'B')],
    colorsA: [ANT, WHT, BRASS], colorsB: [OAK, ANT, WHT], func: ['light'], light: { color: '#fff0d8', intensity: 0.7 }, decor: 3,
  },
  {
    id: 'gartenlaterne-gluehwuermchen', name: 'Gartenlaterne Glühwürmchen', desc: 'Wetterfeste Laterne auf Mast für Wege und Terrassen.',
    cat: 'light', price: 140, w: 1, d: 1, h: 1.3, outdoor: true,
    parts: [C(0, 0, 0, 0.2, 0.05, 0.2, 'A'), C(0, 0.05, 0, 0.06, 0.95, 0.06, 'A'), B(0, 1.0, 0, 0.2, 0.03, 0.2, 'A'), B(0, 1.03, 0, 0.17, 0.2, 0.17, 'glass'), S(0, 1.12, 0, 0.09, 0.12, 0.09, '#ffd98a', { e: 1 }), C(0, 1.23, 0, 0.26, 0.07, 0.26, 'A', { t: 0.2 })],
    colorsA: [BLK, ANT, '#3e6b35', BRASS], func: ['light'], light: { color: '#ffd28a', intensity: 0.8 }, decor: 3,
  },

  // ======================= DEKO =======================
  {
    id: 'pflanze-gummibaum-gustav', name: 'Gummibaum Gustav', desc: 'Pflegeleichter Gummibaum mit glänzenden, dunklen Blättern.',
    cat: 'deco', price: 110, w: 1, d: 1, h: 1.5,
    parts: plant('A', 0.38, 0.38, [C(0, 0.38, 0, 0.04, 0.85, 0.04, DARKW), S(0, 1.3, 0, 0.42, 0.36, 0.42, G4), S(-0.15, 1.05, 0.05, 0.3, 0.28, 0.3, G2), S(0.15, 0.9, -0.05, 0.3, 0.26, 0.3, G4), S(0.05, 0.7, 0.12, 0.24, 0.2, 0.24, G2)]),
    colorsA: [TER, WHT, ANT, SAGE, CRE], func: ['plant'], decor: 4,
  },
  {
    id: 'pflanze-monstera-mia', name: 'Monstera Mia', desc: 'Ausladende Monstera mit großen gelochten Blättern im Korbtopf.',
    cat: 'deco', price: 160, w: 1, d: 1, h: 1.2,
    parts: plant('A', 0.42, 0.36, [RB(-0.2, 0.75, 0.05, 0.36, 0.02, 0.28, [0, 20, 35], G1), RB(0.2, 0.8, -0.05, 0.36, 0.02, 0.3, [0, -20, -35], G2), RB(0.05, 0.95, 0.2, 0.3, 0.02, 0.36, [35, 0, 0], G1), RB(-0.05, 1.0, -0.2, 0.3, 0.02, 0.34, [-35, 0, 0], G3), RB(0.0, 1.1, 0, 0.3, 0.02, 0.3, [0, 45, 10], G2), C(0, 0.36, 0, 0.03, 0.6, 0.03, G4)]),
    colorsA: ['#c79a5b', WHT, ANT, TER], func: ['plant'], decor: 5,
  },
  {
    id: 'pflanze-kaktus-kuno', name: 'Kaktus Kuno', desc: 'Kleiner Säulenkaktus im Tontopf. Gießen? Nur selten.',
    cat: 'deco', price: 30, w: 1, d: 1, h: 0.35, mount: 'surface',
    parts: plant('A', 0.12, 0.1, [C(0, 0.1, 0, 0.07, 0.18, 0.07, G2), S(0, 0.28, 0, 0.07, 0.05, 0.07, G2), RC(0.05, 0.18, 0, 0.04, 0.08, 0.04, [0, 0, -50], G2), S(0, 0.31, 0, 0.03, 0.03, 0.03, '#ff6aa8')]),
    colorsA: [TER, WHT, '#7b9c7a', MUS], func: ['plant'], decor: 2,
  },
  {
    id: 'pflanze-zitronenbaum', name: 'Zitronenbäumchen Sonnig', desc: 'Kleines Zitronenbäumchen im Terrakottakübel – mit echten Früchten.',
    cat: 'deco', price: 260, w: 1, d: 1, h: 1.6, outdoor: true,
    parts: plant('A', 0.46, 0.42, [C(0, 0.42, 0, 0.05, 0.6, 0.05, DARKW), S(0, 1.25, 0, 0.7, 0.6, 0.7, G1), S(0.15, 1.4, 0.1, 0.4, 0.35, 0.4, G3), S(0.2, 1.15, 0.28, 0.08, 0.1, 0.08, '#f3d23a'), S(-0.25, 1.25, 0.15, 0.08, 0.1, 0.08, '#f3d23a'), S(0.05, 1.05, -0.3, 0.08, 0.1, 0.08, '#f3d23a'), S(-0.1, 1.5, 0.2, 0.08, 0.1, 0.08, '#f3d23a')]),
    colorsA: [TER, WHT, ANT, '#c9b9a6'], func: ['plant'], decor: 6,
  },
  {
    id: 'pflanze-farnwedel', name: 'Farn Wedelwald', desc: 'Üppiger Farn auf schlankem Pflanzenständer.',
    cat: 'deco', price: 75, w: 1, d: 1, h: 1.1,
    parts: [...legs4(0.1, 0.1, 0.55, 0.025, 'A', true), C(0, 0.55, 0, 0.32, 0.25, 0.32, 'A', { t: 1.2 }), RB(-0.18, 0.88, 0, 0.4, 0.02, 0.12, [0, 0, 30], G3), RB(0.18, 0.88, 0, 0.4, 0.02, 0.12, [0, 0, -30], G3), RB(0, 0.88, 0.18, 0.12, 0.02, 0.4, [-30, 0, 0], G1), RB(0, 0.88, -0.18, 0.12, 0.02, 0.4, [30, 0, 0], G1), S(0, 0.92, 0, 0.3, 0.2, 0.3, G2)],
    colorsA: [WHT, BRASS, BLK, OAK], func: ['plant'], decor: 4,
  },
  {
    id: 'bild-abendrot', name: 'Gemälde Abendrot am See', desc: 'Stimmungsvolles Landschaftsbild in breitem Holzrahmen.',
    cat: 'deco', price: 180, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: picture(0.9, 0.62, 1.5, 'A', [B(0, 1.5, -0.458, 0.8, 0.26, 0.004, '#f0a060'), B(0, 1.24, -0.458, 0.8, 0.26, 0.004, '#3e6f8c'), S(0.15, 1.52, -0.456, 0.14, 0.14, 0.004, '#ffd36a'), B(-0.2, 1.42, -0.455, 0.3, 0.12, 0.004, '#3b4a3a')]),
    colorsA: [OAK, BLK, BRASS, WHT], decor: 5,
  },
  {
    id: 'bild-geometrie-senf', name: 'Kunstdruck Geometrie in Senf', desc: 'Moderner Kunstdruck mit Kreisen und Bögen in warmen Tönen.',
    cat: 'deco', price: 120, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: picture(0.6, 0.8, 1.45, 'A', [RC(-0.06, 1.55, -0.456, 0.3, 0.004, 0.3, [90, 0, 0], MUS), RC(0.1, 1.3, -0.455, 0.22, 0.004, 0.22, [90, 0, 0], TER), B(0, 1.2, -0.456, 0.46, 0.04, 0.004, PET), RC(-0.12, 1.25, -0.454, 0.1, 0.004, 0.1, [90, 0, 0], SAGE)]),
    colorsA: [BLK, OAK, WHT, BRASS], decor: 4,
  },
  {
    id: 'bild-familiencollage', name: 'Bildercollage Erinnerungen', desc: 'Fünf Bilderrahmen mit liebsten Momenten als Wandgalerie.',
    cat: 'deco', price: 90, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: [[-0.28, 1.6, 0.3, 0.36], [0.05, 1.65, 0.28, 0.24], [0.32, 1.55, 0.2, 0.28], [-0.1, 1.3, 0.34, 0.24], [0.27, 1.28, 0.24, 0.2]].flatMap(([x, y, w, h], i) => [B(x, y - h / 2, -0.485, w, h, 0.025, 'A'), B(x, y - h / 2 + 0.03, -0.471, w - 0.06, h - 0.06, 0.004, [SKY, ROSE, SAGE, MUS, TER][i])]),
    colorsA: [WHT, BLK, OAK, BRASS], decor: 4,
  },
  {
    id: 'wanduhr-tickende-taube', name: 'Wanduhr Zeitgeist', desc: 'Runde Wanduhr mit großen Ziffern, damit niemand die Arbeit verpasst.',
    cat: 'deco', price: 70, w: 1, d: 1, h: 1.9, mount: 'wall',
    parts: [RC(0, 1.6, -0.48, 0.42, 0.04, 0.42, [90, 0, 0], 'A'), RC(0, 1.6, -0.458, 0.36, 0.005, 0.36, [90, 0, 0], CRE), RB(0, 1.65, -0.452, 0.015, 0.1, 0.004, [0, 0, 0], BLK), RB(0.04, 1.6, -0.451, 0.015, 0.14, 0.004, [0, 0, -60], BLK), ...[0, 90, 180, 270].map((a) => B(+(Math.sin((a * Math.PI) / 180) * 0.15).toFixed(3), 1.6 + +(Math.cos((a * Math.PI) / 180) * 0.15).toFixed(3) - 0.015, -0.453, 0.02, 0.03, 0.004, BLK))],
    colorsA: [BLK, OAK, '#a63d32', SAGE, WHT], decor: 3,
  },
  {
    id: 'teppich-wolkenweich', name: 'Teppich Wolkenweich', desc: 'Flauschiger Hochflor-Teppich, auf dem man am liebsten barfuß läuft.',
    cat: 'deco', price: 160, w: 2, d: 2, h: 0.03,
    parts: [B(0, 0, 0, 1.9, 0.02, 1.9, 'A'), B(0, 0.02, 0, 1.6, 0.005, 1.6, 'A'), B(0, 0.0, 0.94, 1.9, 0.015, 0.02, CRE), B(0, 0.0, -0.94, 1.9, 0.015, 0.02, CRE)],
    colorsA: [CRE, SAGE, '#b9b2a6', ROSE, ANT], decor: 4,
  },
  {
    id: 'teppich-berber-raute', name: 'Teppich Berberraute', desc: 'Großer Wollteppich mit Rautenmuster im Berberstil.',
    cat: 'deco', price: 290, w: 2, d: 3, h: 0.03,
    parts: [B(0, 0, 0, 1.9, 0.015, 2.85, 'A'), ...[-0.9, -0.3, 0.3, 0.9].flatMap((z) => [RB(-0.45, 0.017, z, 0.3, 0.004, 0.3, [0, 45, 0], 'B'), RB(0.45, 0.017, z, 0.3, 0.004, 0.3, [0, 45, 0], 'B')]), B(0, 0.017, 0, 0.04, 0.004, 2.6, 'B'), B(0, 0.002, 1.43, 1.9, 0.01, 0.04, CRE), B(0, 0.002, -1.43, 1.9, 0.01, 0.04, CRE)],
    colorsA: [CRE, '#d9c7a6', TER, '#5d6b7a'], colorsB: [BLK, TER, PET, MUS], decor: 5,
  },
  {
    id: 'vase-tulpentraum', name: 'Blumenvase Tulpentraum', desc: 'Keramikvase mit einem frischen Strauß Tulpen.',
    cat: 'deco', price: 45, w: 1, d: 1, h: 0.5, mount: 'surface',
    parts: [C(0, 0, 0, 0.14, 0.22, 0.14, 'A', { t: 0.7 }), C(0, 0.22, 0, 0.1, 0.04, 0.1, 'A', { t: 1.3 }), ...[[-0.05, 0], [0.05, 0.02], [0, -0.05], [0.02, 0.05], [-0.03, -0.02]].flatMap(([x, z], i) => [RC(x * 0.6, 0.33, z * 0.6, 0.01, 0.2, 0.01, [z * 200, 0, -x * 200], G1), S(x, 0.45, z, 0.05, 0.07, 0.05, ['#e05a7a', '#f3d23a', '#e05a4a', '#ff9ab5', '#ffffff'][i])])],
    colorsA: [WHT, SAGE, TER, NAVY, MUS], decor: 4,
  },
  {
    id: 'skulptur-gedankenknoten', name: 'Skulptur Gedankenknoten', desc: 'Abstrakte Skulptur aus verschlungenen Formen auf Sockel.',
    cat: 'deco', price: 380, w: 1, d: 1, h: 1.55,
    parts: [B(0, 0, 0, 0.4, 0.9, 0.4, WHT), B(0, 0.9, 0, 0.44, 0.03, 0.44, WHT), S(0, 1.12, 0, 0.28, 0.4, 0.14, 'A', { r: [0, 0, 25] }), S(0.06, 1.3, 0.02, 0.22, 0.3, 0.12, 'A', { r: [0, 30, -30] }), S(-0.06, 1.42, -0.02, 0.18, 0.22, 0.1, 'A', { r: [20, 0, 40] }), C(0, 0.93, 0, 0.12, 0.04, 0.12, BLK)],
    colorsA: [BRASS, '#c46a4a', BLK, '#9fd3c7'], decor: 7,
  },
  {
    id: 'kerzen-abendstimmung', name: 'Kerzenset Abendstimmung', desc: 'Drei Stumpenkerzen auf einem Holztablett.',
    cat: 'deco', price: 25, w: 1, d: 1, h: 0.25, mount: 'surface',
    parts: [B(0, 0, 0, 0.36, 0.02, 0.16, OAK), C(-0.1, 0.02, 0, 0.08, 0.16, 0.08, 'A'), C(0, 0.02, 0, 0.08, 0.11, 0.08, 'A'), C(0.1, 0.02, 0, 0.08, 0.07, 0.08, 'A'), S(-0.1, 0.2, 0, 0.02, 0.04, 0.02, '#ffcf6a', { e: 1 }), S(0, 0.15, 0, 0.02, 0.04, 0.02, '#ffcf6a', { e: 1 }), S(0.1, 0.11, 0, 0.02, 0.04, 0.02, '#ffcf6a', { e: 1 })],
    colorsA: [CRE, WHT, TER, SAGE], decor: 3,
  },
  {
    id: 'globus-weltenbummler', name: 'Standglobus Weltenbummler', desc: 'Alter Standglobus auf Holzfuß. Wohin geht die nächste Reise?',
    cat: 'deco', price: 210, w: 1, d: 1, h: 1.1,
    parts: [...legs4(0.16, 0.16, 0.55, 0.04, 'A', true, 0, 0, { t: 0.8 }), C(0, 0.55, 0, 0.5, 0.04, 0.5, 'A'), S(0, 0.86, 0, 0.44, 0.44, 0.44, '#c9b88a'), S(0.08, 0.92, 0.12, 0.2, 0.18, 0.22, '#7b8a5a'), S(-0.12, 0.8, -0.05, 0.16, 0.2, 0.3, '#7b8a5a'), RC(0, 0.86, 0, 0.52, 0.02, 0.52, [90, 0, 23], BRASS)],
    colorsA: [WAL, OAK, DARKW], decor: 5,
  },
  {
    id: 'wandregal-schwebebalken', name: 'Wandregal Schwebebalken', desc: 'Schwebendes Wandbord mit Büchern, Vase und Fotorahmen.',
    cat: 'deco', price: 75, w: 1, d: 1, h: 1.8, mount: 'wall',
    parts: [B(0, 1.4, -0.4, 0.9, 0.04, 0.2, 'A'), B(-0.3, 1.44, -0.4, 0.04, 0.2, 0.15, TER), B(-0.25, 1.44, -0.4, 0.04, 0.18, 0.15, PET), B(-0.2, 1.44, -0.4, 0.04, 0.22, 0.15, MUS), C(0.05, 1.44, -0.4, 0.08, 0.14, 0.08, WHT, { t: 0.6 }), RB(0.28, 1.53, -0.44, 0.16, 0.18, 0.02, [-10, 0, 0], BLK), S(0.05, 1.62, -0.4, 0.12, 0.1, 0.12, G1)],
    colorsA: [OAK, WHT, ANT, WAL], decor: 3,
  },
  {
    id: 'standuhr-grossvater', name: 'Standuhr Großvaters Ruhm', desc: 'Hohe Pendeluhr aus Nussbaum mit tiefem Glockenschlag zur vollen Stunde.',
    cat: 'deco', price: 390, w: 1, d: 1, h: 2.05,
    parts: [B(0, 0, -0.3, 0.5, 0.25, 0.36, 'A'), B(0, 0.25, -0.3, 0.42, 1.25, 0.3, 'A'), B(0, 1.5, -0.3, 0.5, 0.45, 0.36, 'A'), RB(0, 2.0, -0.3, 0.52, 0.1, 0.38, [0, 0, 0], 'A'), B(0, 0.4, -0.148, 0.3, 1.0, 0.005, 'glass'), C(0, 0.55, -0.2, 0.14, 0.02, 0.14, BRASS, { r: [90, 0, 0] }), B(0, 0.62, -0.2, 0.015, 0.75, 0.01, BRASS), RC(0, 1.72, -0.115, 0.32, 0.01, 0.32, [90, 0, 0], CRE), B(0, 1.72, -0.108, 0.01, 0.12, 0.005, BLK)],
    colorsA: [WAL, DARKW, OAK, BLK], decor: 7,
  },

  // ======================= TÜREN =======================
  {
    id: 'tuer-schlicht', name: 'Innentür Schlicht', desc: 'Glatte Innentür mit Edelstahldrücker. Unauffällig und zuverlässig.',
    cat: 'door', price: 180, w: 1, d: 1, h: 2.2, mount: 'opening', parts: door(),
    colorsA: [WHT, '#e8e2d6', OAK, ANT], func: ['door'], decor: 0,
  },
  {
    id: 'tuer-landhaus-kassette', name: 'Kassettentür Landhaus', desc: 'Tür mit zwei Kassetten im Landhausstil und Messingdrücker.',
    cat: 'door', price: 320, w: 1, d: 1, h: 2.2, mount: 'opening', parts: door({ panels: true, handle: BRASS }),
    colorsA: [WHT, '#7b9c7a', '#e8d9c0', NAVY], colorsB: [WHT, '#e8d9c0', '#6f8a6e', '#25344f'], func: ['door'], decor: 2,
  },
  {
    id: 'tuer-glaslicht', name: 'Glastür Glaslicht', desc: 'Holztür mit großem Glaseinsatz – lässt Licht in den Flur.',
    cat: 'door', price: 450, w: 1, d: 1, h: 2.2, mount: 'opening', parts: door({ glass: 'full', frame: OAK, handle: BLK }),
    colorsA: [OAK, WAL, WHT, BLK], func: ['door'], decor: 3,
  },
  {
    id: 'tuer-haustuer-eiche', name: 'Haustür Eichenportal', desc: 'Massive Haustür aus Eiche mit drei Glasstreifen und Stangengriff.',
    cat: 'door', price: 690, w: 1, d: 1, h: 2.2, mount: 'opening',
    parts: [...door({ glass: 'strip', frame: ANT, thick: 0.08 }), B(0.36, 0.6, 0.075, 0.03, 0.9, 0.03, CHR), B(0, 0, 0.04, 0.9, 0.03, 0.12, STONE)],
    colorsA: [OAK, WAL, ANT, '#2e5e4e', '#8b2f2f'], func: ['door'], decor: 4,
  },
  {
    id: 'tuer-bullauge', name: 'Retrotür Bullauge', desc: 'Lackierte Tür mit rundem Fenster und Messingring – ein Hauch von Seefahrt.',
    cat: 'door', price: 380, w: 1, d: 1, h: 2.2, mount: 'opening', parts: door({ glass: 'round', handle: BRASS }),
    colorsA: [PET, MUS, TER, WHT, NAVY], func: ['door'], decor: 3,
  },

  // ======================= FENSTER =======================
  {
    id: 'fenster-klarblick', name: 'Fenster Klarblick', desc: 'Einfaches Kunststofffenster mit Fensterbank.',
    cat: 'window', price: 140, w: 1, d: 1, h: 2.2, mount: 'opening', parts: windowParts(1),
    colorsA: [WHT, ANT, OAK], func: ['window'], decor: 1,
  },
  {
    id: 'fenster-sprosse', name: 'Sprossenfenster Altbau', desc: 'Holzfenster mit Sprossenkreuz im Altbaustil.',
    cat: 'window', price: 220, w: 1, d: 1, h: 2.2, mount: 'opening', parts: windowParts(1, { cross: true }),
    colorsA: [WHT, '#7b9c7a', OAK, NAVY], func: ['window'], decor: 2,
  },
  {
    id: 'fenster-rundbogen', name: 'Rundbogenfenster Kapelle', desc: 'Elegantes Fenster mit halbrundem Oberlicht.',
    cat: 'window', price: 360, w: 1, d: 1, h: 2.2, mount: 'opening', parts: windowParts(1, { arch: true }),
    colorsA: [WHT, ANT, WAL], func: ['window'], decor: 4,
  },
  {
    id: 'fenster-bullauge', name: 'Rundfenster Bullauge', desc: 'Kreisrundes Fenster mit Messingring für Bad oder Flur.',
    cat: 'window', price: 190, w: 1, d: 1, h: 2.2, mount: 'opening', parts: windowParts(1, { round: true }),
    colorsA: [WHT, NAVY, ANT, PET], func: ['window'], decor: 3,
  },
  {
    id: 'fenster-panorama', name: 'Panoramafenster Weitblick', desc: 'Zwei Kacheln breites Fenster mit schmalem Rahmen für viel Licht.',
    cat: 'window', price: 480, w: 2, d: 1, h: 2.2, mount: 'opening', parts: windowParts(2, { mullions: 1 }),
    colorsA: [ANT, WHT, BLK, OAK], func: ['window'], decor: 3,
  },
  {
    id: 'fenster-landhaus-doppel', name: 'Doppelfenster Landhaus', desc: 'Breites Sprossenfenster mit Fensterläden im Landhausstil.',
    cat: 'window', price: 560, w: 2, d: 1, h: 2.2, mount: 'opening', parts: windowParts(2, { mullions: 1, cross: true, shutters: true }),
    colorsA: [WHT, CRE, '#7b9c7a'], colorsB: ['#5d7f74', '#8b2f2f', NAVY, ANT], func: ['window'], decor: 5,
  },

  // ======================= TREPPEN =======================
  {
    id: 'treppe-stufenweise', name: 'Treppe Stufenweise', desc: 'Gerade Holztreppe mit geschlossenen Wangen ins nächste Stockwerk.',
    cat: 'stairs', price: 900, w: 1, d: 3, h: 3.0, parts: stairs(1),
    colorsA: [OAK, WAL, WHT, ANT], func: ['stairs'], decor: 1,
  },
  {
    id: 'treppe-schwebend', name: 'Treppe Schwebestufe', desc: 'Moderne Mittelholmtreppe mit frei schwebenden Stufen.',
    cat: 'stairs', price: 1450, w: 1, d: 3, h: 3.0, parts: stairs(1, { floating: true, spine: ANT }),
    colorsA: [OAK, WAL, WHT, BLK], func: ['stairs'], decor: 4,
  },
  {
    id: 'treppe-freitreppe', name: 'Freitreppe Großer Auftritt', desc: 'Breite, gerade Treppe mit Antrittspfosten – für große Auftritte.',
    cat: 'stairs', price: 1650, w: 2, d: 3, h: 3.0, parts: stairs(2, { spine: WHT, posts: WAL }),
    colorsA: [OAK, WAL, STONE, WHT], func: ['stairs'], decor: 4,
  },

  // ======================= HAUSTIERE =======================
  {
    id: 'napf-schlabberschale', name: 'Futternapf Schlabberschale', desc: 'Zwei Edelstahlnäpfe auf rutschfester Matte – Futter und Wasser.',
    cat: 'pet', price: 30, w: 1, d: 1, h: 0.1,
    parts: [B(0, 0, 0, 0.5, 0.01, 0.3, 'A'), C(-0.12, 0.01, 0, 0.18, 0.06, 0.18, STL, { t: 0.8 }), C(0.12, 0.01, 0, 0.18, 0.06, 0.18, STL, { t: 0.8 }), S(-0.12, 0.065, 0, 0.13, 0.04, 0.13, '#8a5a3b'), C(0.12, 0.05, 0, 0.13, 0.015, 0.13, WATER, { e: 0.15 })],
    colorsA: [TER, SKY, SAGE, ANT], func: ['petbowl'], slots: [use(0, 0.4)], decor: 0,
  },
  {
    id: 'napf-futterbar', name: 'Futterbar Gourmetpfote', desc: 'Erhöhte Futterstation aus Holz mit zwei Keramiknäpfen.',
    cat: 'pet', price: 90, w: 1, d: 1, h: 0.3,
    parts: [B(0, 0.18, 0, 0.56, 0.05, 0.3, 'A'), ...legs4(0.24, 0.11, 0.18, 0.04, 'A'), C(-0.13, 0.23, 0, 0.2, 0.06, 0.2, 'B'), C(0.13, 0.23, 0, 0.2, 0.06, 0.2, 'B'), S(-0.13, 0.285, 0, 0.14, 0.04, 0.14, '#8a5a3b'), C(0.13, 0.27, 0, 0.15, 0.015, 0.15, WATER)],
    colorsA: [OAK, WHT, WAL], colorsB: [WHT, TER, SKY, ANT], func: ['petbowl'], slots: [use(0, 0.45)], decor: 2,
  },
  {
    id: 'hundekorb-schnarchnase', name: 'Hundekorb Schnarchnase', desc: 'Ovales Hundebett mit hohem Rand und kuscheligem Kissen.',
    cat: 'pet', price: 120, w: 1, d: 1, h: 0.28,
    parts: [C(0, 0, 0, 0.9, 0.08, 0.72, 'A'), C(0, 0.08, -0.06, 0.9, 0.18, 0.62, 'A', { t: 1.05 }), C(0, 0.08, 0.04, 0.72, 0.1, 0.52, 'B'), S(0, 0.2, 0.06, 0.6, 0.1, 0.4, 'B')],
    colorsA: ['#7b6a58', ANT, TER, PET, '#5d7f74'], colorsB: [CRE, '#e3d2b8', WHT], func: ['petbed'], slots: [sleep(0, 0.05, 0.12)], comfort: 7, decor: 1,
  },
  {
    id: 'katzenhoehle-kuschel', name: 'Katzenhöhle Kuschelnest', desc: 'Filzhöhle in Kugelform – Katzen lieben den Rückzugsort.',
    cat: 'pet', price: 160, w: 1, d: 1, h: 0.45,
    parts: [S(0, 0.22, 0, 0.52, 0.44, 0.5, 'A'), RC(0, 0.2, 0.235, 0.24, 0.02, 0.22, [90, 0, 0], '#2b2420'), RC(0, 0.2, 0.24, 0.28, 0.01, 0.26, [90, 0, 0], 'B'), C(0, 0, 0, 0.4, 0.03, 0.4, 'B')],
    colorsA: ['#b9b2a6', ROSE, SAGE, MUS, ANT], colorsB: [CRE, WHT, ANT], func: ['petbed'], slots: [sleep(0, 0, 0.1)], comfort: 8, decor: 3,
  },
  {
    id: 'kratzbaum-krallenturm', name: 'Kratzbaum Krallenturm', desc: 'Dreistöckiger Kratzbaum mit Sisalstämmen, Liegeplatz und Spielball.',
    cat: 'pet', price: 220, w: 1, d: 1, h: 1.45,
    parts: [B(0, 0, 0, 0.6, 0.05, 0.6, 'A'), C(-0.18, 0.05, -0.15, 0.12, 0.6, 0.12, '#d9c7a0'), C(0.18, 0.05, 0.15, 0.12, 0.95, 0.12, '#d9c7a0'), B(-0.12, 0.65, -0.12, 0.4, 0.04, 0.34, 'A'), B(0.12, 1.0, 0.12, 0.4, 0.04, 0.34, 'A'), C(0.12, 1.04, 0.12, 0.36, 0.06, 0.3, 'B'), C(0.18, 1.04, 0.15, 0.1, 0.35, 0.1, '#d9c7a0'), C(0.18, 1.39, 0.15, 0.3, 0.04, 0.3, 'A'), C(-0.25, 0.4, -0.12, 0.005, 0.25, 0.005, '#e8e0d0'), S(-0.25, 0.38, -0.12, 0.07, 0.07, 0.07, '#e05a4a')],
    colorsA: ['#b9b2a6', ANT, CRE, '#7b6a58'], colorsB: [CRE, ROSE, SAGE], func: ['pettoy'], slots: [use(0, 0.6)], decor: 1,
  },
  {
    id: 'spielkorb-baellebande', name: 'Spielzeugkorb Bällebande', desc: 'Korb mit Bällen, Kauknochen und Quietschtieren für Hund und Katze.',
    cat: 'pet', price: 45, w: 1, d: 1, h: 0.3,
    parts: [C(0, 0, 0, 0.36, 0.2, 0.36, '#c79a5b', { t: 1.15 }), S(-0.06, 0.22, 0.03, 0.1, 0.1, 0.1, '#e05a4a'), S(0.07, 0.23, -0.04, 0.12, 0.12, 0.12, '#cde24a'), RB(0.0, 0.25, 0.08, 0.2, 0.04, 0.05, [0, 30, 20], CRE), S(0.25, 0.05, 0.2, 0.1, 0.1, 0.1, '#4a8ae0'), RB(-0.25, 0.02, 0.22, 0.16, 0.03, 0.04, [0, 40, 0], CRE)],
    func: ['pettoy'], slots: [use(0, 0.5)], decor: 1,
  },
  {
    id: 'aquarium-korallengarten', name: 'Aquarium Korallengarten', desc: 'Großes Süßwasseraquarium auf Unterschrank mit bunten Fischen und Beleuchtung.',
    cat: 'pet', price: 690, w: 2, d: 1, h: 1.4,
    parts: [B(0, 0, -0.2, 1.4, 0.75, 0.5, 'A'), B(0, 0.75, -0.2, 1.36, 0.55, 0.46, 'glass'), B(0, 0.77, -0.2, 1.3, 0.5, 0.4, WATER, { e: 0.35 }), B(0, 0.76, -0.2, 1.3, 0.05, 0.4, '#d9c7a0'), B(0, 1.3, -0.2, 1.4, 0.06, 0.5, 'A'), S(-0.3, 1.05, -0.15, 0.08, 0.05, 0.03, '#ff8a2a', { e: 0.2 }), S(0.2, 0.95, -0.25, 0.07, 0.04, 0.03, '#ffd23a', { e: 0.2 }), S(0.4, 1.12, -0.1, 0.06, 0.04, 0.02, '#4ad1ff', { e: 0.2 }), C(-0.5, 0.81, -0.28, 0.06, 0.3, 0.06, G1, { t: 0.3 }), C(0.5, 0.81, -0.3, 0.08, 0.36, 0.08, G3, { t: 0.3 }), S(0.05, 0.84, -0.3, 0.2, 0.12, 0.12, '#e07a8a'), B(-0.35, 0.05, 0.052, 0.66, 0.65, 0.01, 'A'), B(0.35, 0.05, 0.052, 0.66, 0.65, 0.01, 'A')],
    colorsA: [BLK, WHT, OAK, WAL], func: ['aquarium'], slots: [use(0, 0.75)], light: { color: '#8fd8ff', intensity: 0.4 }, decor: 8,
  },
  {
    id: 'aquarium-goldfischglas', name: 'Goldfischglas Blubber', desc: 'Rundes Goldfischglas mit Kies und Wasserpflanze für Tisch oder Kommode.',
    cat: 'pet', price: 60, w: 1, d: 1, h: 0.3, mount: 'surface',
    parts: [S(0, 0.14, 0, 0.28, 0.28, 0.28, 'glass'), S(0, 0.12, 0, 0.25, 0.2, 0.25, WATER, { e: 0.2 }), C(0, 0.01, 0, 0.16, 0.03, 0.16, '#d9c7a0'), S(0.04, 0.13, 0.03, 0.06, 0.04, 0.025, '#ff8a2a'), C(-0.05, 0.03, -0.03, 0.03, 0.12, 0.03, G1, { t: 0.3 })],
    func: ['aquarium'], slots: [use(0, 0.85)], decor: 3,
  },

  // ======================= ARBEITSPLÄTZE & STADT (hidden) =======================
  {
    id: 'work-kassentresen', name: 'Kassentresen', desc: 'Ladentheke mit Kasse, Kartenterminal und Scanner.',
    cat: 'work', price: 1200, w: 2, d: 1, h: 1.3, hidden: true,
    parts: [B(0, 0, 0, 1.9, 0.95, 0.7, 'A'), B(0, 0.95, 0, 1.96, 0.04, 0.76, OAK), B(0.4, 0.99, -0.05, 0.4, 0.12, 0.35, BLK), RB(0.4, 1.17, -0.15, 0.34, 0.22, 0.03, [-15, 0, 0], BLK), RB(0.4, 1.17, -0.13, 0.3, 0.18, 0.005, [-15, 0, 0], SCR, { e: 0.6 }), B(-0.2, 0.99, 0.15, 0.1, 0.04, 0.16, ANT), B(-0.6, 0.99, 0.1, 0.3, 0.03, 0.3, '#2a2a2a'), B(-0.6, 1.02, 0.1, 0.06, 0.06, 0.06, '#ff3a3a', { e: 0.8 }), B(0, 0.1, 0.355, 1.8, 0.75, 0.01, 'B')],
    colorsA: [WHT, ANT], colorsB: [MUS, '#3c5a8a', '#a63d32'], func: ['register', 'counter'], slots: [use(0.4, -0.85, 0), stand(0, 0.85, 180)], breaks: true, decor: 1,
  },
  {
    id: 'work-siebtraeger', name: 'Siebträgermaschine Café', desc: 'Zweikreisige Siebträgermaschine mit Milchlanze und Mühle.',
    cat: 'work', price: 2400, w: 1, d: 1, h: 0.55, mount: 'surface', hidden: true,
    parts: [B(0, 0, -0.15, 0.62, 0.4, 0.42, STL), B(0, 0.4, -0.15, 0.62, 0.04, 0.42, CHR), ...[-0.15, 0.15].flatMap((x) => [C(x, 0.22, 0.08, 0.08, 0.06, 0.08, CHR), RB(x, 0.22, 0.17, 0.03, 0.03, 0.14, [0, 0, 0], BLK), C(x, 0.02, 0.1, 0.07, 0.08, 0.07, WHT)]), RC(0.3, 0.25, 0.1, 0.015, 0.2, 0.015, [-30, 0, 0], CHR), B(0, 0, 0.12, 0.6, 0.02, 0.14, '#3a3a3a'), C(-0.4, 0, -0.15, 0.16, 0.3, 0.16, BLK), C(-0.4, 0.3, -0.15, 0.14, 0.2, 0.14, 'glass', { t: 1.3 }), C(-0.4, 0.3, -0.15, 0.12, 0.12, 0.12, '#3b2416'), RC(0, 0.32, 0.065, 0.08, 0.01, 0.08, [90, 0, 0], WHT)],
    func: ['espresso', 'coffee'], slots: [use(0, 0.85)], skill: 'cooking', breaks: true, decor: 3,
  },
  {
    id: 'work-untersuchungsliege', name: 'Untersuchungsliege', desc: 'Gepolsterte Arztliege mit verstellbarem Kopfteil und Papierrolle.',
    cat: 'work', price: 1800, w: 1, d: 2, h: 0.95, hidden: true,
    parts: [B(0, 0.6, 0.15, 0.66, 0.1, 1.5, 'A'), RB(0, 0.78, -0.72, 0.66, 0.08, 0.5, [-25, 0, 0], 'A'), B(0, 0, 0.15, 0.5, 0.05, 1.3, CHR), B(0, 0.05, -0.4, 0.1, 0.55, 0.1, CHR), B(0, 0.05, 0.6, 0.1, 0.55, 0.1, CHR), B(0, 0.7, 0.15, 0.5, 0.005, 1.4, WHT), RC(0, 0.65, 0.92, 0.1, 0.56, 0.1, [0, 0, 90], WHT), B(0.42, 0, 0.6, 0.15, 0.25, 0.4, CHR)],
    colorsA: ['#5d7f74', '#3c5a8a', ANT], func: ['examtable'], slots: [sit(0, 0.15, 0.7)], comfort: 3, decor: 0,
  },
  {
    id: 'work-medikamentenschrank', name: 'Medikamentenschrank', desc: 'Abschließbarer Schrank mit Glastüren und Arzneimitteln.',
    cat: 'work', price: 900, w: 1, d: 1, h: 1.9, hidden: true,
    parts: [B(0, 0, -0.27, 0.9, 1.9, 0.45, WHT), B(0, 0.9, -0.03, 0.84, 0.9, 0.02, 'glass'), ...[1.05, 1.35, 1.62].map((y) => B(0, y, -0.27, 0.84, 0.02, 0.4, '#d8dde0')), ...[[-0.25, 1.07, '#e05a4a'], [0, 1.07, '#4a8ae0'], [0.25, 1.07, WHT], [-0.2, 1.37, MUS], [0.15, 1.37, '#5a8a4a'], [0, 1.64, '#e05a4a']].map(([x, y, c]) => B(x as number, y as number, -0.27, 0.16, 0.18, 0.15, c as string)), B(0, 0.05, -0.03, 0.84, 0.8, 0.02, WHT), B(0, 0.42, 0.004, 0.18, 0.05, 0.005, '#e05a4a'), B(0, 0.355, 0.004, 0.05, 0.18, 0.005, '#e05a4a'), B(0.35, 0.95, 0.0, 0.02, 0.15, 0.02, CHR)],
    func: ['medcabinet'], slots: [use(0, 0.65)], decor: 0,
  },
  {
    id: 'work-moderationspult', name: 'Moderationspult', desc: 'Radiopult mit Mikrofonarm, Kopfhörern und „On Air“-Lampe.',
    cat: 'work', price: 3200, w: 2, d: 1, h: 1.4, hidden: true,
    parts: [B(0, 0, -0.15, 1.8, 0.72, 0.6, ANT), B(0, 0.72, -0.15, 1.9, 0.04, 0.66, BLK), RB(0, 0.82, -0.25, 0.8, 0.1, 0.35, [-10, 0, 0], '#2a2a2a'), ...[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((x) => B(x, 0.86, -0.22, 0.02, 0.03, 0.12, WHT)), C(0.55, 0.76, -0.35, 0.04, 0.3, 0.04, BLK), RC(0.4, 1.12, -0.2, 0.03, 0.45, 0.03, [50, 0, 50], BLK), C(0.22, 1.08, 0.0, 0.07, 0.15, 0.07, CHR), S(0.22, 1.24, 0.0, 0.09, 0.09, 0.09, '#555555'), RC(-0.4, 0.82, 0.0, 0.18, 0.04, 0.18, [0, 0, 0], BLK), B(-0.75, 0.76, -0.4, 0.3, 0.12, 0.08, BLK), B(-0.75, 0.78, -0.355, 0.26, 0.08, 0.005, '#ff2a2a', { e: 0.9 }), B(0.3, 0.76, -0.4, 0.4, 0.3, 0.03, BLK), B(0.3, 0.78, -0.383, 0.36, 0.26, 0.005, SCR, { e: 0.6 })],
    func: ['radiodesk', 'desk'], slots: [sit(0, 0.6, 0.45, 180)], skill: 'charisma', breaks: true, decor: 2,
  },
  {
    id: 'work-mischpult', name: 'DJ-Mischpult', desc: 'DJ-Station mit zwei Plattentellern, Mixer und Lichteffekten.',
    cat: 'work', price: 2800, w: 2, d: 1, h: 1.1, hidden: true,
    parts: [B(0, 0, -0.1, 1.8, 0.95, 0.6, BLK), B(0, 0.3, 0.205, 1.7, 0.4, 0.01, 'A', { e: 0.8 }), B(0, 0.95, -0.1, 1.85, 0.03, 0.62, '#2a2a2a'), C(-0.55, 0.98, -0.1, 0.4, 0.03, 0.4, '#1a1a1a'), C(0.55, 0.98, -0.1, 0.4, 0.03, 0.4, '#1a1a1a'), C(-0.55, 1.01, -0.1, 0.12, 0.004, 0.12, '#e05a4a'), C(0.55, 1.01, -0.1, 0.12, 0.004, 0.12, '#4a8ae0'), B(0, 0.98, -0.1, 0.4, 0.05, 0.45, ANT), ...[-0.12, -0.04, 0.04, 0.12].map((x) => B(x, 1.03, 0.0, 0.02, 0.02, 0.08, WHT)), ...[-0.1, 0.1].map((x) => C(x, 1.03, -0.2, 0.04, 0.02, 0.04, '#53d18a', { e: 0.8 })), RB(-0.4, 1.02, -0.3, 0.18, 0.06, 0.06, [0, 0, 0], BLK)],
    colorsA: ['#b06aff', '#3bd1ff', '#ff3b6b'], func: ['mixer', 'stereo'], slots: [use(0, -0.75, 0)], skill: 'music', breaks: true, light: { color: '#b06aff', intensity: 0.5 }, decor: 4,
  },
  {
    id: 'work-ladenregal', name: 'Ladenregal mit Waren', desc: 'Doppelseitiges Verkaufsregal voller Lebensmittel und Haushaltswaren.',
    cat: 'work', price: 800, w: 2, d: 1, h: 1.8, hidden: true,
    parts: [B(0, 0, -0.35, 1.9, 1.8, 0.04, WHT), B(-0.93, 0, -0.1, 0.04, 1.8, 0.55, WHT), B(0.93, 0, -0.1, 0.04, 1.8, 0.55, WHT), ...[0.08, 0.5, 0.92, 1.34].map((y) => B(0, y, -0.1, 1.82, 0.03, 0.5, '#d8dde0')), ...[0.11, 0.53, 0.95, 1.37].flatMap((y, r) => [-0.6, -0.15, 0.3, 0.7].map((x, i) => B(x, y, -0.1, 0.36, 0.22 + ((r + i) % 3) * 0.04, 0.38, [TER, MUS, '#4a8ae0', '#5a8a4a', '#e05a4a', CRE][(r * 2 + i) % 6]))), B(0, 1.7, 0.05, 1.8, 0.1, 0.02, '#e05a4a')],
    func: ['shelfshop'], slots: [use(0, 0.75)], decor: 2,
  },
  {
    id: 'work-bartheke', name: 'Bartheke', desc: 'Lange Bartheke mit Messing-Fußleiste, Zapfhahn und Flaschenreihe.',
    cat: 'work', price: 3500, w: 3, d: 1, h: 1.6, hidden: true,
    parts: [B(0, 0, 0.0, 2.9, 1.05, 0.55, 'A'), B(0, 1.05, 0.02, 2.96, 0.05, 0.62, DARKW), RC(0, 0.15, 0.32, 0.04, 2.8, 0.04, [0, 0, 90], BRASS), B(0, 0, -0.4, 2.9, 0.9, 0.2, DARKW), B(0, 0.9, -0.4, 2.9, 0.03, 0.2, '#ebe7e1'), ...[-1.2, -1.0, -0.8, -0.6, 0.6, 0.8, 1.0, 1.2].map((x, i) => C(x, 0.93, -0.42, 0.07, 0.28, 0.07, ['#3a6a3a', '#7a3a2a', '#d9c7a0', '#2a4a6a'][i % 4], { t: 0.6 })), C(0, 1.1, -0.1, 0.06, 0.35, 0.06, CHR), RC(0, 1.38, -0.04, 0.04, 0.14, 0.04, [90, 0, 0], CHR), B(-0.5, 1.1, -0.1, 0.3, 0.02, 0.15, '#2a2a2a'), C(0.6, 1.1, 0.05, 0.08, 0.14, 0.08, 'glass')],
    colorsA: ['#5a3a28', BLK, '#2e5e4e', '#8b2f2f'], func: ['bar', 'counter'], slots: [stand(-1, 0.85, 180), stand(0, 0.85, 180), stand(1, 0.85, 180), use(0, -0.8, 0)], decor: 6,
  },
  {
    id: 'work-tanzflaeche', name: 'Leuchttanzfläche', desc: 'Tanzfläche aus 3×3 farbig leuchtenden Bodenplatten.',
    cat: 'work', price: 2500, w: 3, d: 3, h: 0.1, hidden: true,
    parts: [B(0, 0, 0, 3.0, 0.05, 3.0, '#1a1a1a'), ...[-1, 0, 1].flatMap((x, i) => [-1, 0, 1].map((z, j) => B(x, 0.05, z, 0.94, 0.04, 0.94, ['#ff3b6b', '#3bd1ff', '#ffd23a', '#7bff5a', '#b06aff'][(i * 3 + j) % 5], { e: 0.8 })))],
    func: ['dancefloor'], slots: [stand(-0.8, -0.8), stand(0.8, -0.8), stand(0, 0), stand(-0.8, 0.8), stand(0.8, 0.8)], light: { color: '#ff6ad8', intensity: 0.8 }, decor: 6,
  },
  {
    id: 'work-angelsteg', name: 'Angelstelle am Steg', desc: 'Stegstück mit Poller, Eimer und Angelhalterung am Wasser.',
    cat: 'work', price: 400, w: 1, d: 1, h: 0.9, outdoor: true, hidden: true,
    parts: [...[-0.36, -0.12, 0.12, 0.36].map((x) => B(x, 0.15, 0, 0.22, 0.05, 0.98, '#8a6a4a')), C(-0.38, 0, 0.4, 0.12, 0.6, 0.12, '#5a4030'), C(0.38, 0, 0.4, 0.12, 0.2, 0.12, '#5a4030'), S(-0.38, 0.6, 0.4, 0.13, 0.06, 0.13, '#5a4030'), C(0.25, 0.2, -0.25, 0.22, 0.25, 0.22, '#4a8ae0', { t: 1.15 }), RC(0.0, 0.5, 0.05, 0.02, 0.8, 0.02, [55, 0, 0], '#3a2a20'), C(0.0, 0.2, -0.15, 0.06, 0.15, 0.06, ANT)],
    func: ['fishingspot'], slots: [stand(0, 0.1, 0)], skill: 'fishing', decor: 2,
  },
  {
    id: 'work-schultafel', name: 'Schultafel', desc: 'Grüne Kreidetafel mit Ablage und Schwamm.',
    cat: 'work', price: 450, w: 2, d: 1, h: 2.0, mount: 'wall', hidden: true,
    parts: [B(0, 0.9, -0.48, 1.8, 1.0, 0.04, OAK), B(0, 0.94, -0.457, 1.72, 0.92, 0.005, '#2f4a3a'), B(0, 0.88, -0.43, 1.6, 0.03, 0.1, OAK), B(-0.5, 0.91, -0.42, 0.12, 0.04, 0.06, MUS), B(0.3, 0.91, -0.42, 0.08, 0.015, 0.015, WHT), B(-0.3, 1.5, -0.454, 0.6, 0.01, 0.004, '#e8e8e0'), B(-0.4, 1.35, -0.454, 0.4, 0.01, 0.004, '#e8e8e0'), RC(0.4, 1.45, -0.454, 0.25, 0.004, 0.25, [90, 0, 0], '#d8d8d0')],
    func: ['blackboard'], slots: [use(0, 0.35), use(-0.5, 0.35)], skill: 'logic', decor: 1,
  },
  {
    id: 'work-schulbank', name: 'Schulbank', desc: 'Kombinierte Schulbank mit Tischplatte und Sitz.',
    cat: 'work', price: 180, w: 1, d: 1, h: 0.8, hidden: true,
    parts: [B(0, 0.72, -0.22, 0.7, 0.03, 0.45, BIR), B(0, 0.6, -0.22, 0.66, 0.12, 0.4, '#3c5a8a'), B(0, 0.42, 0.25, 0.42, 0.03, 0.38, BIR), B(0, 0.45, 0.43, 0.42, 0.3, 0.025, BIR), B(-0.32, 0, 0.0, 0.04, 0.04, 0.9, '#3c5a8a'), B(0.32, 0, 0.0, 0.04, 0.04, 0.9, '#3c5a8a'), B(-0.32, 0, -0.25, 0.04, 0.72, 0.04, '#3c5a8a'), B(0.32, 0, -0.25, 0.04, 0.72, 0.04, '#3c5a8a'), B(-0.2, 0, 0.25, 0.04, 0.42, 0.04, '#3c5a8a'), B(0.2, 0, 0.25, 0.04, 0.42, 0.04, '#3c5a8a')],
    func: ['desk', 'seat'], slots: [sit(0, 0.22, 0.45, 180)], skill: 'logic', comfort: 2, decor: 0,
  },
  {
    id: 'work-parkbank-stadt', name: 'Parkbank Stadtgrün', desc: 'Städtische Parkbank mit Stahlgestell und Holzlatten.',
    cat: 'garden', price: 300, w: 2, d: 1, h: 0.85, outdoor: true, hidden: true,
    parts: [...[-0.05, 0.08, 0.21].map((z) => B(0, 0.42, z, 1.8, 0.03, 0.1, '#8a5a3b')), ...[0.6, 0.73].map((y) => RB(0, y, -0.17, 1.8, 0.09, 0.03, [-10, 0, 0], '#8a5a3b')), ...[-0.8, 0, 0.8].flatMap((x) => [B(x, 0, 0.08, 0.05, 0.42, 0.05, '#3e6b35'), B(x, 0, -0.15, 0.05, 0.8, 0.05, '#3e6b35'), B(x, 0.38, 0.0, 0.05, 0.04, 0.4, '#3e6b35')])],
    func: ['bench', 'seat'], slots: [sit(-0.5, 0.1), sit(0.5, 0.1)], comfort: 3, decor: 2,
  },
  {
    id: 'work-marktbrunnen', name: 'Marktbrunnen', desc: 'Steinerner Brunnen mit zwei Schalen und plätscherndem Wasser.',
    cat: 'garden', price: 6000, w: 2, d: 2, h: 1.8, outdoor: true, hidden: true,
    parts: [C(0, 0, 0, 1.9, 0.45, 1.9, STONE), C(0, 0.3, 0, 1.7, 0.12, 1.7, WATER, { e: 0.25 }), C(0, 0.45, 0, 0.25, 0.8, 0.25, STONE), C(0, 1.1, 0, 0.8, 0.15, 0.8, STONE, { t: 1.3 }), C(0, 1.2, 0, 0.7, 0.04, 0.7, WATER, { e: 0.25 }), C(0, 1.25, 0, 0.12, 0.4, 0.12, STONE), S(0, 1.7, 0, 0.2, 0.2, 0.2, STONE), C(0, 1.24, 0, 0.9, 0.06, 0.9, '#bfe8f5', { e: 0.3, t: 0.8 })],
    decor: 8,
  },
  {
    id: 'work-strassenlaterne', name: 'Straßenlaterne', desc: 'Klassische Straßenlaterne aus Gusseisen mit warmem Licht.',
    cat: 'light', price: 900, w: 1, d: 1, h: 3.6, outdoor: true, hidden: true,
    parts: [C(0, 0, 0, 0.3, 0.3, 0.3, BLK, { t: 0.6 }), C(0, 0.3, 0, 0.1, 2.8, 0.1, BLK, { t: 0.7 }), C(0, 3.1, 0, 0.2, 0.05, 0.2, BLK), C(0, 3.15, 0, 0.32, 0.3, 0.32, 'glass', { t: 1.3 }), S(0, 3.3, 0, 0.16, 0.2, 0.16, '#ffd98a', { e: 1 }), C(0, 3.45, 0, 0.46, 0.12, 0.46, BLK, { t: 0.3 }), S(0, 3.58, 0, 0.06, 0.06, 0.06, BLK)],
    func: ['light'], light: { color: '#ffd28a', intensity: 1.5 }, decor: 2,
  },
];
