/* Schnittstelle, über die Welten, Quests und Dialoge mit dem Spiel sprechen (verhindert Kreuz-Abhängigkeiten). */
import type { EventBus } from './events.ts';
import type { SaveData, Settings } from '../persistence/save.ts';

export interface Vec3 { x: number; y: number; z: number }

export interface GameApi {
  readonly events: EventBus;
  readonly save: SaveData;
  readonly settings: Settings;
  readonly mode: 'story' | 'free';
  readonly time: number;
  /** Spielerposition (Füße). */
  playerPos(): Vec3;
  toast(text: string, icon?: string, ms?: number): void;
  /** Kurzer Satz einer Figur in der Sprechblase (ohne Dialogfenster). */
  bark(name: string, text: string, icon?: string): void;
  talk(npcId: string): void;
  give(item: string, n?: number, silent?: boolean): void;
  take(item: string, n?: number): boolean;
  has(item: string, n?: number): boolean;
  count(item: string): number;
  addStars(n: number, why?: string): void;
  spendStars(n: number): boolean;
  addXp(n: number): void;
  flag(id: string): number;
  setFlag(id: string, v?: number): void;
  hasAbility(id: string): boolean;
  unlockAbility(id: string): void;
  unlockCosmetic(id: string): void;
  sfx(name: string, vol?: number): void;
  burst(x: number, y: number, z: number, colors: number[], n?: number): void;
  teleport(x: number, z: number, yaw?: number): void;
  startMinigame(id: string, opts?: Record<string, unknown>): void;
  collectOnce(id: string): boolean;
  isCollected(id: string): boolean;
  achieve(id: string): void;
  questStage(id: string): number;
  questDone(id: string): boolean;
  startQuest(id: string): void;
  /** Kamera-Fahrt zu einem Punkt (kurze Zwischensequenz). */
  focusCamera(x: number, y: number, z: number, sec: number): void;
  setNight(night: boolean): void;
  isNight(): boolean;
  openShop(id: string): void;
  openPanel(id: string, arg?: unknown): void;
  enterVehicle(id: string): void;
  discover(id: string, name: string): void;
}
