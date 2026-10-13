// Gemeinsame Typen für Simulation, Netzwerk und Darstellung.

export const enum Mode {
  Bus = 0,
  Freefall = 1,
  Glide = 2,
  Ground = 3,
  Air = 4,
  Swim = 5,
  Slide = 6,
  Climb = 7,
  Downed = 8,
  Vehicle = 9,
  Dead = 10,
}

/** Gedrückt gehaltene Tasten. */
export const enum Btn {
  Jump = 1,
  Crouch = 2,
  Sprint = 4,
  Fire = 8,
  Aim = 16,
  Interact = 32,
  Dive = 64,
}

/** Einmal-Aktionen (Bit 24–31 = Code, 16–23 = Arg A, 8–15 = Arg B). */
export const enum Act {
  None = 0,
  Slot = 1, // a = 0 (Spitzhacke) … 5
  BuildToggle = 2,
  BuildPiece = 3, // a = Stück (0 Wand, 1 Boden, 2 Rampe, 3 Dach)
  Reload = 4,
  Drop = 5, // a = Slot
  Swap = 6, // a, b = Slots
  Emote = 7, // a = Emote-ID
  InteractPress = 8,
  BuildMat = 9, // a = Material
  BuildRotate = 10,
  DropAmmo = 11, // a = Munitionsart
  JumpBus = 12,
}

export const packAct = (code: number, a = 0, b = 0): number => ((code & 255) << 24) | ((a & 255) << 16) | ((b & 255) << 8);
export const actCode = (v: number): number => (v >>> 24) & 255;
export const actA = (v: number): number => (v >>> 16) & 255;
export const actB = (v: number): number => (v >>> 8) & 255;

export interface PlayerInput {
  seq: number;
  /** Bewegung relativ zur Blickrichtung: x = rechts, z = vorwärts, je -1 … 1. */
  mx: number;
  mz: number;
  yaw: number;
  pitch: number;
  buttons: number;
  actions: number[];
  /** Server-Tick (mit Nachkommastellen), den der Client beim Schießen gesehen hat – für Lag-Kompensation. */
  viewTick: number;
}

export const emptyInput = (): PlayerInput => ({ seq: 0, mx: 0, mz: 0, yaw: 0, pitch: 0, buttons: 0, actions: [], viewTick: 0 });

export type TeamSize = 1 | 2 | 4;

export interface MatchConfig {
  /** Zufall dieses Matches (Beute, Zone, Fährenroute). */
  seed: number;
  teamSize: TeamSize;
  build: boolean;
  /** Gesamtzahl Teilnehmer inklusive Bots (2 … 100). */
  maxPlayers: number;
  fillBots: boolean;
  /** 0 = leicht, 1 = normal, 2 = schwer */
  botSkill: number;
  /** Zonen-Tempo: 1 = normal, < 1 = schneller (z. B. 0,6 für kurze Runden). */
  zoneScale: number;
  /** Uhrzeit beim Start (0 … 24) und Wetter (0 klar, 1 Regen, 2 Nebel). */
  timeOfDay: number;
  weather: number;
  label: string;
}

export const defaultConfig = (over: Partial<MatchConfig> = {}): MatchConfig => ({
  seed: (Math.random() * 0xffffffff) >>> 0,
  teamSize: 1,
  build: true,
  maxPlayers: 100,
  fillBots: true,
  botSkill: 1,
  zoneScale: 1,
  timeOfDay: 16,
  weather: 0,
  label: 'Solo',
  ...over,
});

export interface Cosmetics {
  outfit: number;
  hat: number;
  back: number;
  glider: number;
  pickaxe: number;
  skin: number;
  wrap: number;
  victory: number;
}

export const defaultCosmetics = (): Cosmetics => ({ outfit: 0, hat: 0, back: 0, glider: 0, pickaxe: 0, skin: 2, wrap: 0, victory: 0 });

export interface RosterEntry {
  id: number;
  name: string;
  team: number;
  bot: boolean;
  cos: Cosmetics;
}

export interface PlacementResult {
  id: number;
  name: string;
  team: number;
  bot: boolean;
  place: number;
  kills: number;
  damage: number;
  assists: number;
  revives: number;
  survived: number; // Sekunden
  built: number;
  harvested: number;
  headshots: number;
  chests: number;
  distance: number;
  won: boolean;
}

export const enum Phase {
  Bus = 0,
  Play = 1,
  Ended = 2,
}
