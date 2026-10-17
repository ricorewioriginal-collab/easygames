// Schnittstelle zwischen App und Bau-/Kaufmodus (die App stellt sie bereit).
import type * as THREE from 'three';
import type { LotDef } from '../data/lots';
import type { Game } from '../sim/game';

export interface BuildHost {
  readonly g: Game;
  /** Szene für Vorschau-Meshes (grün/rot) */
  readonly scene: THREE.Scene;
  /** Element für Werkzeugleiste/Katalog (unten über dem Spielfeld) */
  readonly uiRoot: HTMLElement;
  /** Bodenpunkt (Welt, Kommazahlen) unter Bildschirmkoordinaten auf der aktuellen Etage */
  groundAt(x: number, y: number): { x: number; z: number } | null;
  /** Objekt-ID unter Bildschirmkoordinaten */
  pickObject(x: number, y: number): string | null;
  /** angezeigte Etage 0/1 */
  level(): number;
  setLevel(l: number): void;
  /** Grundstück des aktiven Haushalts (nur dort darf gebaut werden) */
  lot(): LotDef | null;
  /** Kamera auf das Grundstück richten */
  focusLot(): void;
  /** Objekt im Renderer hervorheben (null = keins) */
  highlight(id: string | null): void;
  /** Rasterlinien des Grundstücks anzeigen */
  grid(on: boolean): void;
  sfx(name: string): void;
  toast(text: string, icon?: string, kind?: 'info' | 'good' | 'bad' | 'warn'): void;
  /** Bau-/Kaufmodus wurde geschlossen */
  closed(): void;
}
