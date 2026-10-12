/** Freischaltbare visuelle Effekte. */
export type EffectSlot = 'ship' | 'trail' | 'palette' | 'burst';

export type Requirement =
  | { type: 'none' }
  | { type: 'stars'; count: number }
  | { type: 'level'; index: number }
  | { type: 'endless'; seconds: number }
  | { type: 'combo'; count: number }
  | { type: 'tutorial' }
  | { type: 'daily'; plays: number }
  | { type: 'hardcore'; clears: number };

export interface EffectItem {
  id: string;
  slot: EffectSlot;
  name: string;
  description: string;
  requirement: Requirement;
}

export interface Progress {
  totalStars: number;
  clearedLevels: number;
  highestCleared: number;
  bestCombo: number;
  endlessBest: number;
  tutorialDone: boolean;
  dailyPlays: number;
  hardcoreClears: number;
}

export const SLOT_LABELS: Record<EffectSlot, string> = {
  ship: 'Gleiter',
  trail: 'Lichtspur',
  palette: 'Farbwelt',
  burst: 'Trefferexplosion',
};

export const EFFECTS: EffectItem[] = [
  {
    id: 'prism',
    slot: 'ship',
    name: 'Prisma',
    description: 'Der klassische Kristallgleiter.',
    requirement: { type: 'none' },
  },
  {
    id: 'octa',
    slot: 'ship',
    name: 'Oktaeder',
    description: 'Doppelpyramide mit rotierendem Kern.',
    requirement: { type: 'stars', count: 6 },
  },
  {
    id: 'dart',
    slot: 'ship',
    name: 'Pfeil',
    description: 'Schlanker Pfeil für hohe Tempi.',
    requirement: { type: 'level', index: 7 },
  },
  {
    id: 'crystal',
    slot: 'ship',
    name: 'Ikosaeder',
    description: 'Facettenreicher Edelstein.',
    requirement: { type: 'stars', count: 30 },
  },
  {
    id: 'halo',
    slot: 'ship',
    name: 'Halo',
    description: 'Ein schwebender Lichtring.',
    requirement: { type: 'endless', seconds: 120 },
  },
  {
    id: 'ribbon',
    slot: 'trail',
    name: 'Lichtband',
    description: 'Ein schimmerndes Band.',
    requirement: { type: 'none' },
  },
  {
    id: 'sparks',
    slot: 'trail',
    name: 'Funkenregen',
    description: 'Glühende Funken hinter dir.',
    requirement: { type: 'stars', count: 12 },
  },
  {
    id: 'helix',
    slot: 'trail',
    name: 'Doppelhelix',
    description: 'Zwei verschlungene Lichtstränge.',
    requirement: { type: 'combo', count: 150 },
  },
  {
    id: 'comet',
    slot: 'trail',
    name: 'Komet',
    description: 'Breiter, pulsierender Kometenschweif.',
    requirement: { type: 'stars', count: 45 },
  },
  {
    id: 'level',
    slot: 'palette',
    name: 'Levelfarben',
    description: 'Jede Welt in ihren eigenen Farben.',
    requirement: { type: 'none' },
  },
  {
    id: 'mono',
    slot: 'palette',
    name: 'Mondlicht',
    description: 'Kühles Weiß und Silber.',
    requirement: { type: 'tutorial' },
  },
  {
    id: 'infrared',
    slot: 'palette',
    name: 'Infrarot',
    description: 'Glühendes Rot und Magenta.',
    requirement: { type: 'stars', count: 9 },
  },
  {
    id: 'aurora',
    slot: 'palette',
    name: 'Aurora',
    description: 'Grün und Türkis wie Polarlicht.',
    requirement: { type: 'level', index: 15 },
  },
  {
    id: 'gold',
    slot: 'palette',
    name: 'Sonnengold',
    description: 'Warmes Gold und Bernstein.',
    requirement: { type: 'daily', plays: 1 },
  },
  {
    id: 'rainbow',
    slot: 'palette',
    name: 'Spektrum',
    description: 'Alle Farben im Takt.',
    requirement: { type: 'stars', count: 72 },
  },
  {
    id: 'shards',
    slot: 'burst',
    name: 'Splitter',
    description: 'Kristallsplitter bei jedem Treffer.',
    requirement: { type: 'none' },
  },
  {
    id: 'rings',
    slot: 'burst',
    name: 'Schockwelle',
    description: 'Ringförmige Lichtwellen.',
    requirement: { type: 'stars', count: 18 },
  },
  {
    id: 'nova',
    slot: 'burst',
    name: 'Nova',
    description: 'Gewaltige Sternexplosionen.',
    requirement: { type: 'level', index: 23 },
  },
  {
    id: 'pixels',
    slot: 'burst',
    name: 'Pixelsturm',
    description: 'Retro-Pixel fliegen umher.',
    requirement: { type: 'hardcore', clears: 1 },
  },
];

export const DEFAULT_EQUIPPED: Record<EffectSlot, string> = {
  ship: 'prism',
  trail: 'ribbon',
  palette: 'level',
  burst: 'shards',
};

export function isUnlocked(item: EffectItem, p: Progress): boolean {
  const r = item.requirement;
  switch (r.type) {
    case 'none':
      return true;
    case 'stars':
      return p.totalStars >= r.count;
    case 'level':
      return p.highestCleared >= r.index;
    case 'endless':
      return p.endlessBest >= r.seconds;
    case 'combo':
      return p.bestCombo >= r.count;
    case 'tutorial':
      return p.tutorialDone;
    case 'daily':
      return p.dailyPlays >= r.plays;
    case 'hardcore':
      return p.hardcoreClears >= r.clears;
  }
}

export function requirementText(r: Requirement): string {
  switch (r.type) {
    case 'none':
      return 'Von Anfang an verfügbar';
    case 'stars':
      return `${r.count} Sterne sammeln`;
    case 'level':
      return `Level ${r.index + 1} abschließen`;
    case 'endless':
      return `${r.seconds} s im Endlos-Modus überleben`;
    case 'combo':
      return `Combo von ${r.count} erreichen`;
    case 'tutorial':
      return 'Tutorial abschließen';
    case 'daily':
      return 'Einen Tagesrhythmus spielen';
    case 'hardcore':
      return 'Ein Level im Präzisionsmodus schaffen';
  }
}

export function newlyUnlocked(before: Progress, after: Progress): EffectItem[] {
  return EFFECTS.filter((e) => !isUnlocked(e, before) && isUnlocked(e, after));
}

export function effectById(id: string): EffectItem | undefined {
  return EFFECTS.find((e) => e.id === id);
}
