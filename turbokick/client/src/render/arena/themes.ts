export type ArenaTheme = 'neon' | 'eis' | 'canyon';

/** Teamfarben: 0 = Funken (orange), 1 = Frost (cyan-blau) */
export const TEAM_COLORS: readonly [number, number] = [0xff7a1a, 0x2ac8ff];

export const ARENA_THEMES: ReadonlyArray<{ id: ArenaTheme; name: string; blurb: string; skyTop: number; skyBottom: number }> = [
  { id: 'neon', name: 'Neon-Metropole', blurb: 'Synthwave-Nacht über der Stadt: Neonlinien, Glasdach und ein Gitter bis zum Horizont.', skyTop: 0x03000d, skyBottom: 0x6a1470 },
  { id: 'eis', name: 'Eis-Dom', blurb: 'Kühle Kuppel aus Kristall und Schnee, Polarlicht über dem Spielfeld.', skyTop: 0x06183a, skyBottom: 0xa9d8f5 },
  { id: 'canyon', name: 'Glutschlucht', blurb: 'Wüsten-Canyon bei Sonnenuntergang: orange Felsen, Staub und Fackeln.', skyTop: 0x1d1442, skyBottom: 0xffa04a },
];

/** Alle themenabhängigen Farben und Einstellungen an einer Stelle */
export interface Palette {
  skyTop: number;
  skyMid: number;
  skyBottom: number;
  ground: number;
  fog: number;
  fogDensity: number;
  /** Himmelssonne: Richtung, Größe (Bogenmaß), Farbe */
  skySunDir: [number, number, number];
  skySunSize: number;
  skySunCol: number;
  /** Licht für Autos/Ball */
  lightDir: [number, number, number];
  lightCol: number;
  lightIntensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  /** Boden */
  floorA: number;
  floorB: number;
  floorLine: number;
  floorGrid: number;
  /** Wandlinien */
  lineA: number;
  lineB: number;
  glass: number;
  glassAlpha: number;
  /** Boost-Pads */
  padBig: number;
  padSmall: number;
  padOff: number;
  /** Tribüne */
  stand: number;
  standTop: number;
  shirts: number[];
  /** Masten / Lampen */
  mast: number;
  lamp: number;
  beam: number;
  beamAlpha: number;
}

export function palette(theme: ArenaTheme): Palette {
  switch (theme) {
    case 'eis':
      return {
        skyTop: 0x06183a,
        skyMid: 0x1f5a95,
        skyBottom: 0xa9d8f5,
        ground: 0xcfe4f4,
        fog: 0x9cc6e2,
        fogDensity: 0.0031,
        skySunDir: [0.55, 0.32, -0.78],
        skySunSize: 0.045,
        skySunCol: 0xeaf8ff,
        lightDir: [0.35, 1, 0.3],
        lightCol: 0xe4f3ff,
        lightIntensity: 1.5,
        hemiSky: 0xbfe3ff,
        hemiGround: 0x3a5a7c,
        hemiIntensity: 1.25,
        floorA: 0x1b3552,
        floorB: 0x234463,
        floorLine: 0xe8f8ff,
        floorGrid: 0x6fb8e6,
        lineA: 0x6fd8ff,
        lineB: 0xcdf1ff,
        glass: 0x0b2a4a,
        glassAlpha: 0.1,
        padBig: 0xffd83a,
        padSmall: 0xc4ff52,
        padOff: 0x0d1c30,
        stand: 0x2c4f73,
        standTop: 0x6fa6d2,
        shirts: [0x8fb8dc, 0x39618a, 0xdcecf8, 0x1d3555, 0x5fa3d8],
        mast: 0x2a4766,
        lamp: 0xe8f8ff,
        beam: 0xbfe8ff,
        beamAlpha: 0.06,
      };
    case 'canyon':
      return {
        skyTop: 0x1d1442,
        skyMid: 0xb04a3a,
        skyBottom: 0xffa04a,
        ground: 0xc9783a,
        fog: 0xe08c46,
        fogDensity: 0.0021,
        skySunDir: [-0.45, 0.1, -0.88],
        skySunSize: 0.075,
        skySunCol: 0xffd68a,
        lightDir: [-0.55, 0.85, -0.45],
        lightCol: 0xffb36b,
        lightIntensity: 1.7,
        hemiSky: 0xffb48a,
        hemiGround: 0x5a2a1a,
        hemiIntensity: 1.0,
        floorA: 0x3a2217,
        floorB: 0x45281b,
        floorLine: 0xffe6b8,
        floorGrid: 0xa8602c,
        lineA: 0xff9a2e,
        lineB: 0xffd36a,
        glass: 0x3a1608,
        glassAlpha: 0.12,
        padBig: 0xffe23d,
        padSmall: 0xb6ff4a,
        padOff: 0x1c0f0a,
        stand: 0x7a3a22,
        standTop: 0xc4733b,
        shirts: [0xd9a066, 0x8a4a2c, 0xf1dcb4, 0x4a2418, 0xb86a3a],
        mast: 0x4a2a1c,
        lamp: 0xffd9a0,
        beam: 0xffc27a,
        beamAlpha: 0.05,
      };
    default:
      return {
        skyTop: 0x03000d,
        skyMid: 0x1c0a45,
        skyBottom: 0x6a1470,
        ground: 0x0b0420,
        fog: 0x5a1366,
        fogDensity: 0.0034,
        skySunDir: [-0.35, 0.16, -0.92],
        skySunSize: 0.1,
        skySunCol: 0xffc23d,
        lightDir: [0.3, 1, 0.2],
        lightCol: 0xd8c4ff,
        lightIntensity: 1.35,
        hemiSky: 0xa88cff,
        hemiGround: 0x2a1040,
        hemiIntensity: 1.25,
        floorA: 0x0f1228,
        floorB: 0x151a38,
        floorLine: 0xffffff,
        floorGrid: 0x4a40a8,
        lineA: 0xff3da8,
        lineB: 0x32e6ff,
        glass: 0x140a36,
        glassAlpha: 0.09,
        padBig: 0xffe33a,
        padSmall: 0xb8ff4a,
        padOff: 0x0b0d1c,
        stand: 0x1a1738,
        standTop: 0x3a2e78,
        shirts: [0x2a2a58, 0x4a2a6a, 0x1c1c3a, 0x6a3a8a, 0x2e4a7a],
        mast: 0x201c48,
        lamp: 0xf2ecff,
        beam: 0xb48cff,
        beamAlpha: 0.055,
      };
  }
}
