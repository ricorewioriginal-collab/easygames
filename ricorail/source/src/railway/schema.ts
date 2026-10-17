// Gemeinsames Netzwerkschema für Simulator, Streckenpakete und Editor (1 Einheit = 1 Meter).
// Koordinaten: x = Osten, y = Höhe, z = Süden (Three.js-Konvention, Norden = -z).

export const NETWORK_SCHEMA = 1;

export interface NodeDef { id: string; x: number; y: number; z: number; /** Kreuzung: Paare durchgehender Gleisenden */ pairs?: [string, string][] }

export type Dir = 1 | -1;
export interface TrackDef {
  id: string;
  /** Knoten am Anfang (a) und Ende (b) */
  a: string; b: string;
  /** Stützpunkte x,y,z (inklusive Anfang und Ende), mindestens 2 Punkte */
  pts: number[];
  /** Streckenhöchstgeschwindigkeit km/h */
  vmax: number;
  elec?: boolean; tunnel?: boolean; bridge?: boolean;
  /** Eingleisiger Abschnitt: alle Gleise mit derselben Gruppe dürfen nur in einer Richtung belegt werden */
  single?: string;
  /** Rangierbereich (keine Hauptsignale nötig, max. 25 km/h im Rangierdienst) */
  yard?: boolean;
  /** Zahnstange (Fantasie-Bergbahn): Haftung wird für Zahnradfahrzeuge nicht begrenzt */
  rack?: boolean;
  /** Regelfahrrichtung (zweigleisige Strecke): Gegenrichtung ist Falschfahrbetrieb */
  pref?: Dir;
  /** Kilometrierung am Anfang (km) – nur Anzeige */
  km0?: number;
  /** Kilometrierung läuft gegen die Gleisrichtung (b→a) */
  kmRev?: boolean;
  name?: string;
}

export interface SwitchDef {
  id: string;
  node: string;
  /** Stammgleis (Weichenanfang) */
  trunk: string;
  /** Abzweigende Gleise; Index 0 = gerade, 1 = abzweigend (ggf. mehr bei Mehrwegweichen) */
  legs: string[];
  state?: number;
  /** Geschwindigkeit im abzweigenden Strang km/h */
  vDiv?: number;
}

export type SignalKind = 'main' | 'block' | 'shunt';
export interface SignalDef {
  id: string; name?: string;
  track: string;
  /** +1: gilt für Fahrten a→b (steht vor Knoten b), -1: für b→a (vor Knoten a) */
  dir: 1 | -1;
  /** Abstand zum Gleisende in m (Standard 12) */
  off?: number;
  kind: SignalKind;
}

export interface PlatformDef { track: string; s0: number; s1: number; side: 'L' | 'R'; nr: string; height?: number }
export interface StationDef {
  id: string; name: string;
  kind: 'station' | 'halt' | 'yard' | 'depot' | 'freight';
  platforms: PlatformDef[];
  /** Fahrgäste pro Stunde (Grundaufkommen) */
  pax?: number;
  km?: number;
}

export type CargoType = 'container' | 'bulk' | 'oil' | 'cars' | 'wood' | 'goods' | 'stone';
export interface IndustryDef {
  id: string; name: string; track: string; s0: number; s1: number;
  cargo: CargoType[]; action: 'load' | 'unload' | 'both';
}

export interface CrossingDef { id: string; track: string; s: number; angle?: number }
export interface SpeedDef { id: string; track: string; s0: number; s1: number; vmax: number; kind: 'slow' | 'works' }
export interface SceneryDef { kind: 'house' | 'trees' | 'factory' | 'tower' | 'lake' | 'hill' | 'harbour' | 'church' | 'farm' | 'skyscraper' | 'castle'; x: number; z: number; r?: number; h?: number; rot?: number; n?: number }

export interface ThemeDef {
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  terrain: 'plain' | 'hills' | 'mountain' | 'city' | 'coast' | 'river';
  ground?: string; /** Grundfarbe */
  buildings?: 'village' | 'town' | 'city' | 'neon' | 'alpine' | 'harbour';
  sea?: { side: 'N' | 'S' | 'E' | 'W'; level: number };
}

export interface NetworkDef {
  schema: number;
  id: string; name: string;
  world: 'real' | 'fantasy' | 'custom';
  theme: ThemeDef;
  nodes: NodeDef[];
  tracks: TrackDef[];
  switches: SwitchDef[];
  signals: SignalDef[];
  stations: StationDef[];
  industries: IndustryDef[];
  crossings: CrossingDef[];
  speeds: SpeedDef[];
  scenery?: SceneryDef[];
  /** Herkunft der Daten (sichtbar in Streckenauswahl) */
  source?: string;
  note?: string;
}

/** Topologische Zugposition: Gleis, Bogenlänge ab Knoten a, Fahrtrichtung */
export interface TrackPos { t: string; s: number; d: Dir }
