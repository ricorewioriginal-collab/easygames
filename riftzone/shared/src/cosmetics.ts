// Eigene RIFTZONE-Kosmetik: Outfits, Kopfbedeckungen, Rückenteile, Gleiter, Spitzhacken, Emotes, Siegerposen.
// Freischaltung über Spielerstufe oder Herausforderungen.

export interface OutfitDef {
  id: number;
  name: string;
  /** Hauptfarbe, Zweitfarbe, Akzent (leuchtend), Hose, Schuhe */
  colors: [number, number, number, number, number];
  pattern: 'plain' | 'stripes' | 'split' | 'chevron' | 'dots' | 'panel';
  level: number;
  rarity: number;
}

export const OUTFITS: readonly OutfitDef[] = [
  { id: 0, name: 'Rekrut Kobalt', colors: [0x2f6bff, 0x1b2a4a, 0x3ff2ff, 0x30384f, 0x1a1d29], pattern: 'panel', level: 1, rarity: 0 },
  { id: 1, name: 'Rekrutin Koralle', colors: [0xff6b5b, 0x4a2330, 0xffd166, 0x3a2e3f, 0x241a22], pattern: 'panel', level: 1, rarity: 0 },
  { id: 2, name: 'Moosläufer', colors: [0x4f8a3c, 0x2d3f22, 0xc6ff4a, 0x5a4a32, 0x2a2219], pattern: 'stripes', level: 2, rarity: 1 },
  { id: 3, name: 'Sandsturm', colors: [0xd9a86c, 0x8a5a33, 0xff8a3d, 0x6d4a2c, 0x3a281a], pattern: 'split', level: 4, rarity: 1 },
  { id: 4, name: 'Frostwache', colors: [0xe8f4ff, 0x7aa8d8, 0x8ff7ff, 0x5a6f8a, 0x2d3b52], pattern: 'chevron', level: 6, rarity: 1 },
  { id: 5, name: 'Neonfalter', colors: [0x1d1235, 0xff2fd0, 0x3ff2ff, 0x2a1b48, 0x120a20], pattern: 'stripes', level: 8, rarity: 2 },
  { id: 6, name: 'Hafenkapitänin', colors: [0x1f3d5c, 0xf2f2f2, 0xffb02e, 0x223047, 0x111821], pattern: 'split', level: 10, rarity: 2 },
  { id: 7, name: 'Glutschmied', colors: [0x3a2420, 0xff5a1f, 0xffd23f, 0x2a1c1a, 0x140d0c], pattern: 'chevron', level: 13, rarity: 2 },
  { id: 8, name: 'Kristallwandler', colors: [0x6a3cff, 0xb64bff, 0x9ffcff, 0x2e1f5c, 0x1a1033], pattern: 'dots', level: 16, rarity: 3 },
  { id: 9, name: 'Solarwächter', colors: [0xfff1c2, 0xffb02e, 0xff5a1f, 0xc79a4a, 0x6a4a1a], pattern: 'panel', level: 20, rarity: 3 },
  { id: 10, name: 'Leerenläufer', colors: [0x0b0b12, 0x2a2a3a, 0xb64bff, 0x14141e, 0x07070b], pattern: 'stripes', level: 25, rarity: 4 },
  { id: 11, name: 'Riftkönigin', colors: [0xf2e9ff, 0xb64bff, 0xffd23f, 0x6a3cff, 0x2e1f5c], pattern: 'chevron', level: 30, rarity: 4 },
];

export interface SimpleCos {
  id: number;
  name: string;
  level: number;
  color: number;
}

export const HATS: readonly SimpleCos[] = [
  { id: 0, name: 'Keine', level: 1, color: 0 },
  { id: 1, name: 'Strickmütze', level: 1, color: 0xff6b5b },
  { id: 2, name: 'Funk-Kopfhörer', level: 3, color: 0x3ff2ff },
  { id: 3, name: 'Schirmkappe', level: 5, color: 0xffd23f },
  { id: 4, name: 'Pilotenhelm', level: 9, color: 0xa8b3bf },
  { id: 5, name: 'Kristallkrone', level: 15, color: 0xb64bff },
  { id: 6, name: 'Antennenhaube', level: 19, color: 0x4fff8a },
  { id: 7, name: 'Visierhelm', level: 24, color: 0xff2fd0 },
];

export const BACKS: readonly SimpleCos[] = [
  { id: 0, name: 'Keins', level: 1, color: 0 },
  { id: 1, name: 'Wanderrucksack', level: 2, color: 0x8a5a33 },
  { id: 2, name: 'Energiezelle', level: 7, color: 0x3ff2ff },
  { id: 3, name: 'Riftflügel', level: 14, color: 0xb64bff },
  { id: 4, name: 'Funkantenne', level: 18, color: 0xff5a1f },
  { id: 5, name: 'Kristallköcher', level: 27, color: 0xffd23f },
];

export const GLIDERS: readonly SimpleCos[] = [
  { id: 0, name: 'Segler Standard', level: 1, color: 0x3f8cff },
  { id: 1, name: 'Sonnensegel', level: 4, color: 0xffb02e },
  { id: 2, name: 'Nachtfalter', level: 11, color: 0x6a3cff },
  { id: 3, name: 'Korallenschirm', level: 17, color: 0xff6b5b },
  { id: 4, name: 'Polarlicht', level: 22, color: 0x4fff8a },
  { id: 5, name: 'Riftschwinge', level: 29, color: 0xff2fd0 },
];

export const PICKAXES: readonly SimpleCos[] = [
  { id: 0, name: 'Werkhacke', level: 1, color: 0xa8b3bf },
  { id: 1, name: 'Funkenpickel', level: 6, color: 0xffd23f },
  { id: 2, name: 'Kristallsplitter', level: 12, color: 0x9ffcff },
  { id: 3, name: 'Glutzinke', level: 21, color: 0xff5a1f },
];

export const SKINS: readonly number[] = [0xffd7b5, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x5c3a21];

export interface EmoteDef {
  id: number;
  name: string;
  level: number;
  /** Animationstyp im Client */
  anim: 'wave' | 'dance1' | 'dance2' | 'dance3' | 'salute' | 'laugh' | 'flex' | 'spin' | 'sit' | 'cheer';
}

export const EMOTES: readonly EmoteDef[] = [
  { id: 0, name: 'Winken', level: 1, anim: 'wave' },
  { id: 1, name: 'Wellenschritt', level: 1, anim: 'dance1' },
  { id: 2, name: 'Salut', level: 3, anim: 'salute' },
  { id: 3, name: 'Lachanfall', level: 5, anim: 'laugh' },
  { id: 4, name: 'Pendeltanz', level: 8, anim: 'dance2' },
  { id: 5, name: 'Muskelspiel', level: 12, anim: 'flex' },
  { id: 6, name: 'Kreiseltanz', level: 16, anim: 'spin' },
  { id: 7, name: 'Pause machen', level: 20, anim: 'sit' },
  { id: 8, name: 'Riftbeben', level: 26, anim: 'dance3' },
  { id: 9, name: 'Jubelsprung', level: 1, anim: 'cheer' },
];

export const VICTORY_POSES: readonly { id: number; name: string; level: number; anim: EmoteDef['anim'] }[] = [
  { id: 0, name: 'Jubelsprung', level: 1, anim: 'cheer' },
  { id: 1, name: 'Kraftpose', level: 9, anim: 'flex' },
  { id: 2, name: 'Siegestanz', level: 18, anim: 'dance2' },
  { id: 3, name: 'Riftbeben', level: 28, anim: 'dance3' },
];

export const RARITY_LABEL = ['Gewöhnlich', 'Selten', 'Episch', 'Legendär', 'Mythisch'] as const;
