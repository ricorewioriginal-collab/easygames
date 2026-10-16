// Zentrale Datentypen von RicoLife 3D. Kataloge (src/data/*) sind reine Daten, die Logik liegt in core/gameplay.

export type NeedId = 'hunger' | 'energy' | 'hygiene' | 'bladder' | 'social' | 'fun' | 'comfort';
export const NEED_IDS: NeedId[] = ['hunger', 'energy', 'hygiene', 'bladder', 'social', 'fun', 'comfort'];

export type SkillId =
  | 'cooking' | 'fitness' | 'painting' | 'music' | 'charisma' | 'handiness'
  | 'gardening' | 'writing' | 'programming' | 'fishing' | 'photography' | 'logic';
export const SKILL_IDS: SkillId[] = ['cooking', 'fitness', 'painting', 'music', 'charisma', 'handiness', 'gardening', 'writing', 'programming', 'fishing', 'photography', 'logic'];

export type EmotionId =
  | 'fine' | 'happy' | 'sad' | 'love' | 'tense' | 'focused' | 'inspired'
  | 'angry' | 'embarrassed' | 'tired' | 'playful' | 'confident';

export type AgeStage = 'baby' | 'toddler' | 'child' | 'teen' | 'youngadult' | 'adult' | 'senior';
export const AGE_STAGES: AgeStage[] = ['baby', 'toddler', 'child', 'teen', 'youngadult', 'adult', 'senior'];

export type TraitId =
  | 'social' | 'loner' | 'creative' | 'ambitious' | 'neat' | 'messy' | 'animallover' | 'active'
  | 'lazy' | 'romantic' | 'shy' | 'funny' | 'foodie' | 'bookworm' | 'cheerful' | 'grumpy'
  | 'genius' | 'musical' | 'outdoorsy' | 'familyoriented' | 'hothead' | 'kind' | 'geek' | 'perfectionist';

export type AspirationId =
  | 'family' | 'career' | 'wealth' | 'creative' | 'romance' | 'knowledge' | 'friends' | 'fitness' | 'home' | 'nature';

export type DistrictId = 'sonnenhain' | 'hafen' | 'altstadt';

export type Category =
  | 'living' | 'sleep' | 'kitchen' | 'bath' | 'kids' | 'hobby' | 'office' | 'garden'
  | 'fitness' | 'light' | 'deco' | 'appliance' | 'door' | 'window' | 'stairs' | 'pet' | 'work';

/** Funktionen, an denen die Interaktionen der Spiellogik hängen. Objekte ohne func sind reine Deko. */
export type FuncTag =
  | 'bed' | 'bedDouble' | 'crib' | 'seat' | 'sofa' | 'table' | 'desk' | 'counter' | 'fridge' | 'stove' | 'oven'
  | 'microwave' | 'coffee' | 'sink' | 'dishwasher' | 'toilet' | 'shower' | 'bathtub' | 'tv' | 'computer' | 'stereo'
  | 'bookshelf' | 'treadmill' | 'weights' | 'yogamat' | 'punchbag' | 'easel' | 'piano' | 'guitar' | 'chess' | 'telescope'
  | 'gardenbed' | 'toybox' | 'dollhouse' | 'workbench' | 'camera' | 'mirror' | 'wardrobe' | 'mailbox' | 'trash'
  | 'light' | 'door' | 'window' | 'stairs' | 'petbowl' | 'petbed' | 'pettoy' | 'pool' | 'grill' | 'bench' | 'fishingspot'
  | 'register' | 'espresso' | 'examtable' | 'medcabinet' | 'radiodesk' | 'mixer' | 'shelfshop' | 'bar' | 'dancefloor'
  | 'swing' | 'slide' | 'playmat' | 'highchair' | 'fireplace' | 'jukebox' | 'blackboard' | 'aquarium' | 'plant';

/** Grundkörper für das prozedurale Modell. Koordinaten in Metern, Ursprung = Mitte der Grundfläche am Boden, Vorderseite = +z.
 *  box: d=[Breite,Höhe,Tiefe]; cyl: d=[Durchmesser x, Höhe, Durchmesser z], t = oberer Radius-Faktor (0 = Kegel);
 *  sph: d=[Durchmesser x,y,z] (Ellipsoid); p = Mittelpunkt; r = Drehung in Grad (x,y,z).
 *  c: Hex-Farbe ('#rrggbb'), 'A' (wählbare Hauptfarbe), 'B' (wählbare Zweitfarbe) oder 'glass' (durchscheinend). e = leuchtend (0..1, Bildschirme/Lampen). */
export interface Part {
  s: 'box' | 'cyl' | 'sph';
  p: [number, number, number];
  d: [number, number, number];
  r?: [number, number, number];
  c: string;
  t?: number;
  e?: number;
}

/** Interaktionsplatz relativ zur Objektmitte (Meter, ungedreht; Vorderseite +z).
 *  rot: Blickrichtung der Figur in Grad im Objektsystem: 0 = schaut nach +z (aus der Vorderseite heraus, z. B. auf einem Stuhl sitzend),
 *  180 = schaut nach -z (zum Objekt hin, z. B. vor dem Kühlschrank stehend). y = Sitz-/Liegehöhe in Metern. */
export interface Slot { x: number; z: number; rot: number; kind: 'sit' | 'sleep' | 'use' | 'stand'; y?: number }

export interface ObjectDef {
  id: string;
  name: string;
  desc: string;
  cat: Category;
  price: number;
  /** Grundfläche in Kacheln (Breite entlang x, Tiefe entlang z vor Drehung) */
  w: number;
  d: number;
  /** Höhe in Metern (für Kollision mit Decken/Regalen und Schnittansicht) */
  h: number;
  parts: Part[];
  /** Farbvarianten für 'A' (erste = Standard) und optional 'B' */
  colorsA?: string[];
  colorsB?: string[];
  func?: FuncTag[];
  slots?: Slot[];
  /** Komfort beim Benutzen 0..10, Raumwirkung (Deko) 0..10 */
  comfort?: number;
  decor?: number;
  /** floor = auf dem Boden, wall = an der Wand (Bild, Regal), surface = auf Tisch/Theke, opening = Tür/Fenster in Wandkante */
  mount?: 'floor' | 'wall' | 'surface' | 'opening';
  /** Leuchte: Farbe, Stärke */
  light?: { color: string; intensity: number };
  skill?: SkillId;
  /** darf draußen stehen (Garten, Grill, Bank); Möbel ohne outdoor sind trotzdem draußen platzierbar */
  outdoor?: boolean;
  /** nur auf Gemeinschaftsgrundstücken / Arbeitsplätzen verfügbar (nicht im Kaufkatalog) */
  hidden?: boolean;
  /** kann kaputtgehen (Reparatur mit Handwerk) */
  breaks?: boolean;
}

// ---------- Personen ----------
export type OutfitKind = 'everyday' | 'work' | 'sport' | 'party' | 'sleep' | 'swim';
export const OUTFIT_KINDS: OutfitKind[] = ['everyday', 'work', 'sport', 'party', 'sleep', 'swim'];

export interface Outfit {
  top: number;        // Stil-Index (siehe characters/catalog)
  topColor: string;
  bottom: number;
  bottomColor: string;
  shoes: number;
  shoeColor: string;
}

export interface Appearance {
  frame: 0 | 1;       // Körperbau-Grundform (0 = schmaler, 1 = breiter Schulterbau) – unabhängig von Geschlecht/Pronomen
  height: number;     // -1..1
  weight: number;     // -1..1
  muscle: number;     // -1..1
  skin: string;
  headShape: number;  // 0..3
  jaw: number;        // -1..1
  nose: number;       // 0..3
  noseSize: number;   // -1..1
  eyes: number;       // 0..3
  eyeColor: string;
  brows: number;      // 0..2
  hair: number;       // Frisur-Index
  hairColor: string;
  beard: number;      // 0 = keiner
  glasses: number;    // 0 = keine
  accessory: number;  // 0 = keins (Ohrringe, Kette, Mütze …)
  accessoryColor: string;
  outfits: Record<OutfitKind, Outfit>;
}

export interface NpcSeed {
  id: string;
  first: string;
  last: string;
  pronoun?: 'sie' | 'er' | 'they';
  age: AgeStage;
  traits: TraitId[];
  aspiration: AspirationId;
  career?: string;       // CareerDef.id
  careerLevel?: number;  // 0-basiert
  district: DistrictId;
  home: string;          // Lot-ID (Wohnung/Haus) – NPC-Wohnungen dürfen auch 'apt-*' heißen (siehe world/districts)
  /** Lieblingsorte (Lot-IDs) für Freizeit */
  hangouts: string[];
  bio: string;
  favFood?: string;
  hobbies?: SkillId[];
  /** grobe Optik; fehlende Werte werden aus einem Seed erzeugt */
  look?: Partial<Pick<Appearance, 'frame' | 'skin' | 'hair' | 'hairColor' | 'beard' | 'glasses'>> & { topColor?: string };
  /** Beziehungen zu anderen NPCs/Haushaltsmitgliedern: friend/partner/family/rival + Startwert */
  rel?: { id: string; kind: 'friend' | 'partner' | 'spouse' | 'family' | 'rival' | 'colleague'; f?: number }[];
}

export interface HouseholdSeed {
  id: string;
  name: string;
  story: string;
  funds: number;
  lot: string;
  members: NpcSeed[];
  pets?: PetSeed[];
}

export interface PetSeed { id: string; name: string; kind: 'dog' | 'cat'; fur: number; traits?: ('playful' | 'lazy' | 'friendly' | 'curious')[] }

// ---------- Effekte & Bedingungen (für Ereignisse und Geschichten) ----------
export interface Effect {
  money?: number;
  needs?: Partial<Record<NeedId, number>>;
  moodlet?: string;            // MoodletDef.id
  skill?: Partial<Record<SkillId, number>>; // XP
  /** Beziehung zum Ereignis-NPC (event.npc) bzw. zu zufälliger bekannter Person */
  rel?: { f?: number; r?: number; trust?: number };
  careerPerf?: number;
  memory?: string;             // Text für das Tagebuch
  item?: string;               // Inventar-Gegenstand (ItemDef.id)
  unlockObject?: string;       // ObjectDef.id wird kostenlos ins Inventar gelegt
  visitor?: boolean;           // Ereignis-NPC kommt zu Besuch auf das Grundstück
  flag?: string;               // setzt ein Spielflag
  breakObject?: boolean;       // ein zufälliges kaputtbares Objekt geht kaputt
  promote?: boolean;
}

export interface Condition {
  minDay?: number;
  hourFrom?: number; hourTo?: number;
  weekday?: number[];          // 0 = Montag
  season?: ('spring' | 'summer' | 'autumn' | 'winter')[];
  weather?: WeatherId[];
  minMoney?: number; maxMoney?: number;
  hasCareer?: boolean;
  age?: AgeStage[];            // Alter der aktiven Figur
  trait?: TraitId;
  minSkill?: Partial<Record<SkillId, number>>; // Stufe
  hasPet?: boolean;
  hasPartner?: boolean;
  atHome?: boolean;
  flag?: string; notFlag?: string;
  minFriends?: number;         // Anzahl Freundschaften (f >= 40)
  householdSize?: number;      // Mindestgröße
}

export interface EventChoice { label: string; effect: Effect; /** Erfolgschance 0..1 (Rest = failEffect) */ chance?: number; chanceSkill?: SkillId; failEffect?: Effect; result: string; failResult?: string }

export interface EventDef {
  id: string;
  title: string;
  text: string;                // {name} = aktive Figur, {npc} = Ereignis-NPC
  icon: string;                // Emoji
  weight: number;              // relative Häufigkeit
  cooldownDays: number;
  cond?: Condition;
  /** ein zufälliger bekannter NPC wird zum {npc} (sonst ein beliebiger Stadtbewohner) */
  npc?: 'known' | 'any' | 'none';
  choices: EventChoice[];
}

// ---------- Geschichten ----------
/** Ziele zählen Ereignisse aus dem Spiel-Ereignisbus (core/bus). */
export type GoalKind =
  | 'interaction'   // id = Interaktions-ID (z. B. 'cook', 'repair', 'paint'), n = Anzahl
  | 'skill'         // id = SkillId, n = Stufe
  | 'friend'        // n = Anzahl Freundschaften (f >= 40)
  | 'friendWith'    // id = NPC-ID, n = Freundschaftswert
  | 'romance'       // id optional NPC, n = Romantikwert
  | 'money'         // n = Kontostand
  | 'earn'          // n = verdient seit Aufgabenstart
  | 'buyObject'     // id optional ObjectDef.id oder Kategorie 'cat:kitchen', n = Anzahl
  | 'buildWalls'    // n = gebaute Wandsegmente
  | 'buildRoom'     // n = geschlossene Räume auf dem Grundstück
  | 'visitLot'      // id = Lot-ID
  | 'career'        // id optional CareerDef.id, n = Stufe (1-basiert)
  | 'work'          // n = gearbeitete Schichten
  | 'social'        // id optional Social-ID, n = Anzahl
  | 'moveIn'        // id optional Lot-ID
  | 'event'         // id = Ereignis-ID abgeschlossen
  | 'homeValue'     // n = Hauswert
  | 'meet'          // n = Anzahl kennengelernter Personen
  | 'flag';         // id = Flag gesetzt

export interface QuestGoal { kind: GoalKind; id?: string; n: number; label: string }

export interface QuestDef {
  id: string;
  title: string;
  intro: string;               // Dialog des Begleit-NPCs
  goals: QuestGoal[];
  reward: Effect;
  outro: string;
  /** Verzweigung: optionale Wahl am Ende, beeinflusst nächste Aufgabe */
  branch?: { label: string; next: string }[];
  next?: string;               // nächste Quest-ID (wenn keine Verzweigung)
}

export interface StoryDef {
  id: string;
  title: string;
  summary: string;
  icon: string;
  mentor: string;              // NPC-ID
  start: string;               // Lot-ID für den Einzug (oder '' = beliebig)
  startFunds: number;
  household?: string;          // HouseholdSeed.id (vorgegebener Haushalt) oder leer = eigener
  quests: QuestDef[];
  firstQuest: string;
}

// ---------- Berufe ----------
export interface CareerLevel { title: string; pay: number; days: number[]; start: number; hours: number; req?: Partial<Record<SkillId, number>> }
export interface CareerDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  lot: string;                 // Arbeitsort (Lot-ID)
  active: boolean;             // spielbare Schicht vor Ort
  skills: SkillId[];
  levels: CareerLevel[];
  minAge: AgeStage;            // 'teen' für Nebenjobs
  /** Ereignisse während einer Schicht (nicht aktive Berufe) */
  shiftEvents: { text: string; choices: { label: string; perf: number; skill?: SkillId; result: string }[] }[];
}

export type WeatherId = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'windy';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface MoodletDef { id: string; emo: EmotionId; power: number; hours: number; text: string }

export interface ItemDef { id: string; name: string; icon: string; price: number; kind: 'food' | 'gift' | 'fish' | 'harvest' | 'book' | 'painting' | 'photo' | 'misc'; value?: number; hunger?: number }

export interface RecipeDef { id: string; name: string; icon: string; skill: number; minutes: number; hunger: number; cost: number; servings: number; moodlet?: string }
