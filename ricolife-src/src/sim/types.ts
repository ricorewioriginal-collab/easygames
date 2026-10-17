import type { AgeStage, Appearance, AspirationId, EmotionId, NeedId, OutfitKind, SkillId, TraitId } from '../data/types';
import type { PathPoint } from '../world/nav';

export type AnimId =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'eat' | 'eatStand' | 'drink' | 'cook' | 'fridge' | 'wash' | 'shower' | 'bath'
  | 'toilet' | 'talk' | 'listen' | 'laugh' | 'hug' | 'kiss' | 'wave' | 'highfive' | 'angry' | 'cry' | 'dance' | 'tv' | 'type'
  | 'read' | 'treadmill' | 'lift' | 'yoga' | 'punch' | 'paint' | 'piano' | 'guitar' | 'chess' | 'telescope' | 'garden' | 'fish'
  | 'photo' | 'repair' | 'clean' | 'phone' | 'swim' | 'grill' | 'play' | 'swing' | 'carry' | 'cuddle' | 'think' | 'cheer'
  | 'mirror' | 'serve' | 'examine' | 'mic' | 'register' | 'pet' | 'sitfloor' | 'flirt' | 'embarrassed' | 'stretch' | 'baby' | 'crawl' | 'pushups';

export interface Moodlet {
  id: string;
  until: number;
  /** abweichende Stärke (sonst aus MoodletDef) */
  power?: number;
  /** Ursache (Name einer Person o. Ä.) */
  src?: string;
}

export interface Memory {
  d: number; // Spieltag
  t: string;
  i: string; // Emoji
  big?: boolean; // Lebenschronik
}

export interface CareerState {
  id: string;
  level: number;
  perf: number; // 0..100
  shifts: number;
  missed: number;
  vac: number; // Urlaubstage
  sick: number; // Krankentage in dieser Jahreszeit
  /** Schicht läuft (Startminute) */
  shift: number | null;
  /** aktive Schicht vor Ort (sichtbar am Arbeitsplatz) */
  onSite: boolean;
  tasks: number; // erledigte Aufgaben in dieser Schicht
  paidKey: string; // letzte bezahlte Schicht (gegen Doppelbuchung)
  offDay: number; // Urlaubstag (Spieltag) oder -1
}

export interface SchoolState {
  perf: number;
  hw: number; // Hausaufgaben-Fortschritt heute 0..1
  attended: number; // letzter Schultag
  in: boolean;
}

export interface Action {
  uid: number;
  def: string;
  obj?: string;
  target?: string;
  slot?: number;
  phase: 'queued' | 'route' | 'perform' | 'done';
  t: number;
  dur: number;
  user: boolean;
  data?: Record<string, string | number | boolean>;
  /** Ziel nicht erreichbar → Zähler gegen Endlosversuche */
  fails?: number;
  /** Umleitungen, weil das soziale Ziel weitergegangen ist */
  rr?: number;
  /** wartet auf Partner (soziale Interaktion) */
  waitT?: number;
  label?: string;
}

export interface SimRuntime {
  anim: AnimId;
  animT: number;
  path: PathPoint[] | null;
  pathI: number;
  bubble: { icon: string; until: number } | null;
  /** Darstellung aktiv (sichtbar in der Nähe) */
  spawned: boolean;
  y: number; // Sitzhöhe/Treppe
  holding: string | null;
  socialWith: string | null;
  idle: number;
  /** Ziel-Blickrichtung */
  faceYaw: number | null;
  reserved: string | null;
  stuck: number;
  lastX: number;
  lastZ: number;
  /** Mehrspieler: Interpolation */
  nx?: number;
  nz?: number;
  nRot?: number;
  speech?: string;
}

export interface Sim {
  id: string;
  first: string;
  last: string;
  pronoun: 'sie' | 'er' | 'they';
  age: AgeStage;
  ageDays: number;
  traits: TraitId[];
  aspiration: AspirationId;
  aspStep: number;
  favFood: string;
  hobbies: SkillId[];
  bio: string;
  look: Appearance;
  outfit: OutfitKind;
  needs: Record<NeedId, number>;
  skills: Partial<Record<SkillId, number>>;
  moods: Moodlet[];
  emo: EmotionId;
  emoPower: number;
  career: CareerState | null;
  school: SchoolState | null;
  hh: string | null;
  npc: boolean;
  home: string;
  hangouts: string[];
  parents: string[];
  x: number;
  z: number;
  l: number;
  rot: number;
  /** Lot/Wohnung, in der sich die Figur aufhält ('' = unterwegs auf der Straße) */
  loc: string;
  /** abwesend (nicht dargestellt): Arbeit, Schule, zu Hause in Wohnung … */
  away: { kind: 'work' | 'school' | 'home' | 'out' | 'travel'; until: number; lot?: string } | null;
  inv: Record<string, number>;
  mem: Memory[];
  flags: Record<string, number>;
  preg?: { due: number; partner: string | null };
  /** Besuch auf einem fremden Lot bis zu dieser Minute */
  visit?: { lot: string; until: number };
  /** Fahrt mit dem Auto (Polylinie, Fortschritt in Kacheln) */
  trip?: { pts: [number, number][]; t: number; len: number; to: string; tx: number; tz: number; then?: string };
  /** Gast eines Mehrspielers (wird nicht gespeichert) */
  guest?: string;
  queue: Action[];
  rt: SimRuntime;
}

export interface Pet {
  id: string;
  name: string;
  kind: 'dog' | 'cat';
  fur: number;
  traits: string[];
  hh: string;
  needs: { hunger: number; fun: number; energy: number; social: number };
  x: number;
  z: number;
  l: number;
  rot: number;
  ageDays: number;
  /** Aktion: Ziel, Restdauer */
  act: { kind: 'idle' | 'walk' | 'eat' | 'sleep' | 'play' | 'follow' | 'beg' | 'pet'; t: number; obj?: string; follow?: string } ;
  rt: { anim: string; animT: number; path: PathPoint[] | null; pathI: number; spawned: boolean; bubble: { icon: string; until: number } | null };
}

export interface Tx {
  id: string;
  m: number; // Spielminute
  a: number; // Betrag
  t: string; // Text
}

export interface Household {
  id: string;
  name: string;
  funds: number;
  lot: string | null;
  members: string[];
  pets: string[];
  bills: { amount: number; due: number; issued: number } | null;
  powerOff: boolean;
  ledger: Tx[];
  booked: string[];
  /** freigeschaltete Gegenstände im Lager (nicht platzierte Objekte) */
  storage: string[];
  story?: string;
  /** Familienname für die Anzeige */
  premade?: string;
}

export interface Rel {
  f: number; // Freundschaft -100..100
  r: number; // Romantik 0..100
  t: number; // Vertrauen 0..100
  met: boolean;
  k?: 'partner' | 'engaged' | 'married' | 'ex';
  h: string[]; // Erinnerungen (neueste zuerst)
  last: number; // letzte Begegnung (Minute)
  dates?: number;
}

export interface Settings {
  autonomy: 0 | 1 | 2; // aus/niedrig/normal
  aging: boolean;
  lifespan: 0 | 1 | 2; // kurz/normal/lang
  hardEvents: boolean; // schwierige Ereignisse (Abschied) erlaubt
  quality: 'auto' | 'low' | 'mid' | 'high';
  shadows: boolean;
  maxNpcs: number;
  resScale: number;
  fps: boolean;
  volume: number;
  music: number;
  seasonDays: number;
  fixedSeason: '' | 'spring' | 'summer' | 'autumn' | 'winter';
  fixedTime: boolean;
  needsDecay: number; // 0.5..1.5
  creative: boolean; // freies Bauen ohne Kosten
  events: boolean;
  bigText: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  tutorialDone: boolean;
  keys: Record<string, string>;
  padDeadzone: number;
  edgeScroll: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autonomy: 2,
  aging: true,
  lifespan: 1,
  hardEvents: true,
  quality: 'auto',
  shadows: true,
  maxNpcs: 14,
  resScale: 1,
  fps: false,
  volume: 0.7,
  music: 0.4,
  seasonDays: 7,
  fixedSeason: '',
  fixedTime: false,
  needsDecay: 1,
  creative: false,
  events: true,
  bigText: false,
  reduceMotion: false,
  highContrast: false,
  tutorialDone: false,
  keys: {},
  padDeadzone: 0.2,
  edgeScroll: false,
};
