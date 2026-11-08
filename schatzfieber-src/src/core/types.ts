/** Gemeinsame Typen für Spiellogik, Daten und Darstellung */
export type Gender = 'm' | 'w' | 'd';
/** Wen die Spielfigur daten möchte */
export type Pref = 'm' | 'w' | 'all';
export type HairStyle = 'kurz' | 'undercut' | 'locken' | 'lang' | 'zopf' | 'dutt' | 'bob' | 'glatze' | 'afro';
export type TopType = 'tshirt' | 'hemd' | 'tank' | 'bluse' | 'kleid' | 'polo' | 'top';
export type BottomType = 'jeans' | 'shorts' | 'rock' | 'chino' | 'kleid';
export type SwimType = 'badehose' | 'bikini' | 'badeanzug' | 'trunks';

export interface Look {
  body: 'm' | 'w';
  height: number; // Meter
  build: number; // 0 schlank … 1 kräftig
  curve: number; // 0 … 1 Hüfte/Brust (dezent)
  skin: string;
  hair: HairStyle;
  hairColor: string;
  beard: 0 | 1 | 2; // keiner, Stoppeln, Vollbart
  eyes: string;
  lips: string;
  top: TopType;
  topColor: string;
  bottom: BottomType;
  bottomColor: string;
  shoes: string;
  swim: SwimType;
  swimColor: string;
  /** im Badeoutfit unterwegs */
  swimming?: boolean;
}

export type ItemKind = 'tool' | 'gift' | 'artifact' | 'quest' | 'find';
export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  kind: ItemKind;
  desc: string;
  price?: number; // Kaufpreis im Laden
  value?: number; // Verkaufswert
}

export type TimeSlot = 'morning' | 'day' | 'evening' | 'night';
export interface Spot { poi: string; dx: number; dz: number }

export type Need =
  | { t: 'talk' }
  | { t: 'item'; id: string; n?: number }
  | { t: 'flag'; id: string; label: string }
  | { t: 'date'; poi: string; from: number; to: number }
  | { t: 'museum'; n: number };

export interface Step {
  need: Need;
  /** Was die Figur sich wünscht (wird im Tagebuch und im Gespräch angezeigt) */
  ask: string;
  /** Kurzform fürs Tagebuch */
  goal: string;
  done: string;
  /** Romantische Fassung (nur bei passender Orientierung und gewählter Romanze) */
  love?: string;
  reward?: { item?: string; money?: number };
}

export interface NpcDef {
  id: string;
  name: string;
  age: number;
  job: string;
  gender: Gender;
  /** zu wem sich die Figur hingezogen fühlt */
  likes: Gender[];
  orientation: string;
  bio: string;
  color: string;
  loves: string[];
  likesItems: string[];
  dislikes: string[];
  schedule: Record<TimeSlot, Spot | null>;
  look: Look;
  greet: [string, string, string];
  talk: string[];
  steps: Step[];
  /** Zeilen für die Szenen: Date, Kuss, gemeinsame Nacht */
  date: string[];
  kiss: string[];
  night: string[];
}

export interface DungeonDef {
  id: string;
  name: string;
  poi: string;
  /** Werkzeug, das man zum Betreten braucht */
  needs?: string;
  grid: string[];
  hints: Record<string, string>;
  leverOrder?: number[];
  leverNames?: string[];
  code?: number[];
  loot: string[];
  amulet: string;
  theme: 'cave' | 'ruin' | 'cellar' | 'temple';
}
