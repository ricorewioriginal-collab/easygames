import type * as THREE from 'three';
import type { QualitySettings } from '../render/quality';

/** Alles, was eine Minispiel-Ansicht zum Zeichnen braucht. Die Ansicht liest NUR den Simulationszustand und ändert ihn nie. */
export interface ViewContext {
  scene: THREE.Scene;
  /** Kamera: die Ansicht setzt Position/Blickrichtung selbst (und darf sie in update() weiter bewegen) */
  camera: THREE.PerspectiveCamera;
  /** Alle Objekte der Ansicht gehören in diese Gruppe (wird beim Beenden komplett entfernt) */
  root: THREE.Group;
  quality: QualitySettings;
  /** Spielt einen Soundeffekt ab: 'tick' | 'good' | 'bad' | 'jump' | 'coin' | 'hit' | 'whoosh' | 'beep' | 'win' */
  sfx(name: string): void;
  /** Kleiner Partikel-Schauer an einer Weltposition */
  burst(pos: THREE.Vector3, color: number, count?: number): void;
}

export interface MiniGameView<S = any> {
  /** Wird jedes gerenderte Bild mit dem aktuellen Zustand aufgerufen (dt in Sekunden, höchstens 0.05) */
  update(s: S, dt: number): void;
  /** Gibt alle selbst erzeugten Ressourcen frei */
  dispose(): void;
}

export type MiniGameViewFactory<S = any> = (ctx: ViewContext, initial: S) => MiniGameView<S>;
