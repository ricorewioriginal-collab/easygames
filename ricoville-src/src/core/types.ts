// Gemeinsame Datentypen für Katalog, Spielstand und Regeln. Keine Logik, kein Rendering.

export type Category =
  | 'residential'
  | 'business'
  | 'farm'
  | 'community'
  | 'production'
  | 'storage'
  | 'transport'
  | 'decoration'
  | 'special';

import type { Season } from './season';

export type Rot = 0 | 1 | 2 | 3;
export type Mode = 'nostalgic' | 'relaxed' | 'creative';
export type Station = 'rail' | 'sea' | 'air';

/** Beschreibung des prozeduralen 3D-Modells. Die Werte lesen nur die Renderer. */
export interface ModelSpec {
  kind: string;
  color?: string;
  roof?: 'gable' | 'hip' | 'flat' | 'dome' | 'shed' | 'none';
  roofColor?: string;
  floors?: number;
  accent?: string;
  sign?: string;
  variant?: number;
}

export interface BuildingDef {
  id: string;
  name: string;
  cat: Category;
  w: number;
  h: number;
  cost: number;
  level: number;
  /** Bauzeit in Sekunden (Nostalgisch). */
  buildTime: number;
  xp: number;
  needsRoad: boolean;
  desc: string;
  model: ModelSpec;
  // Wohnen
  pop?: number;
  rent?: number;
  rentTime?: number;
  // Gewerbe
  accepts?: string[];
  stockPer?: number;
  saleTime?: number;
  revenue?: number;
  minPop?: number;
  // Gemeinschaft / Wahrzeichen
  popCap?: number;
  happiness?: number;
  materials?: Record<string, number>;
  bonus?: { rent?: number; revenue?: number; xp?: number };
  // Produktion
  recipes?: string[];
  // Lager
  storage?: number;
  // Farm
  growFactor?: number;
  // Deko
  appeal?: number;
  radius?: number;
  // Transport
  station?: Station;
  nearWater?: boolean;
  /** Höchstzahl pro Stadt (z. B. Rathaus = 1). */
  max?: number;
  /** Belohnungs-Deko eines Saison-Events: baubar erst nach dem Freischalten (CityState.unlocks). */
  event?: Season;
}

export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  kind: 'crop' | 'good' | 'import' | 'material';
}

export interface CropDef {
  id: string;
  name: string;
  icon: string;
  seed: number;
  time: number;
  yield: number;
  xp: number;
  level: number;
  color: string;
}

export interface RecipeDef {
  id: string;
  inputs: Record<string, number>;
  output: string;
  amount: number;
  time: number;
  xp: number;
}

export interface OrderDef {
  id: string;
  station: Station;
  name: string;
  cost: number;
  time: number;
  xp: number;
  level: number;
  give?: Record<string, number>;
  get?: Record<string, number>;
  coins?: number;
}

export type GoalSpec =
  | { ev: string; id?: string; n: number }
  | { own: string; n: number }
  | { ownCat: Category; n: number }
  | { pop: number }
  | { level: number }
  | { sectors: number };

export interface QuestDef {
  id: string;
  title: string;
  giver: string;
  text: string;
  /** Vorgängerquest(s) – erst nach deren Abschluss sichtbar. */
  after?: string[];
  level?: number;
  goals: GoalSpec[];
  reward: { coins?: number; xp?: number; energy?: number; items?: Record<string, number>; unlock?: string };
  /** Saison-Event: nur in dieser Jahreszeit sichtbar, jedes Jahr neu spielbar. */
  season?: Season;
  /** Tutorial-Hinweis: welcher Knopf hervorgehoben wird. */
  hint?: string;
}

export interface Building {
  uid: number;
  def: string;
  x: number;
  y: number;
  rot: Rot;
  /** 'site' = Baustelle wartet auf Material, 'building' = Bauzeit läuft, 'done' = fertig. */
  state: 'site' | 'building' | 'done';
  readyAt: number;
  delivered?: Record<string, number>;
  /** Zeitpunkt, ab dem die nächste Aktion fällig ist (Miete, Verkauf, Ernte, Produktion, Auftrag). */
  t?: number;
  /** Laufender Vorgang: Pflanze, Rezept, Auftrag oder 'sale'. */
  job?: string;
  lvl?: number;
}

export interface QuestProgress {
  /** Fortschritt der Ereignisziele (Index wie goals). */
  c: number[];
  done?: boolean;
  claimed?: boolean;
  /** Saison-Events: Saison, zu der der Fortschritt gehört (seasonKey). */
  yr?: number;
}

export interface TaskState {
  key: string;
  tasks: { tpl: string; n: number; c: number; claimed?: boolean }[];
}

export interface CityState {
  v: number;
  rev: number;
  name: string;
  slogan: string;
  crest: string;
  mode: Mode;
  createdAt: number;
  savedAt: number;
  /** Höchster je gesehener Zeitpunkt – schützt vor zurückgestellten Uhren. */
  seen: number;
  coins: number;
  xp: number;
  level: number;
  energy: number;
  energyAt: number;
  inv: Record<string, number>;
  buildings: Building[];
  /** Straßen als "x,y"-Schlüssel. */
  roads: string[];
  sectors: string[];
  nextUid: number;
  quests: Record<string, QuestProgress>;
  daily?: TaskState;
  weekly?: TaskState;
  achievements: string[];
  stats: Record<string, number>;
  tutorial: 'on' | 'skipped' | 'done';
  /** Nachbarn: was heute (UTC-Tag JJJJMMTT) schon geholfen und verschenkt wurde. Nur lokal, schützt keine fremden Daten. */
  social?: SocialState;
  /** Freigeschaltete Belohnungs-Deko aus Saison-Events (Gebäude-IDs). */
  unlocks?: string[];
}

export interface SocialState {
  day: number;
  /** Nachbar-ID → heute geholfene Gebäude (uids in seiner Stadt) */
  helped: Record<string, number[]>;
  /** Nachbar-IDs, denen heute schon ein Geschenk geschickt wurde */
  gifted: string[];
}

export interface Result {
  ok: boolean;
  msg?: string;
}

export interface GameEvent {
  type: string;
  id?: string;
  n?: number;
  uid?: number;
  coins?: number;
  xp?: number;
  x?: number;
  y?: number;
}
