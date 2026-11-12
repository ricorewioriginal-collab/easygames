import type * as THREE from 'three';
import type { CharacterId } from '@shared/characters';
import type { CharacterRig } from '../render/characters';
import type { QualitySettings } from '../render/quality';

/** Ein Spieler im Minispiel: gewählte Figur, Spielerfarbe, Name */
export interface Avatar {
  character: CharacterId;
  color: number;
  name: string;
}

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
  /** Die eigene Figur (gewählter Charakter und Spielerfarbe) */
  me: Avatar;
  /** Mitspieler – gleiche Reihenfolge wie die Zustände in MiniGameView.ghosts() */
  rivals: Avatar[];
  /**
   * Erzeugt eine der Brettfiguren (Füße bei y = 0, Höhe ca. 1.6–2 Einheiten, Blick nach +z) mit Animationen
   * (idle, walk, run, jump, celebrate …). Die Ansicht hängt rig.root ein und ruft rig.update(dt) in update() auf;
   * freigegeben wird sie von der Bühne.
   */
  character(id: CharacterId, scale?: number): CharacterRig;
}

export interface MiniGameView<S = any> {
  /** Wird jedes gerenderte Bild mit dem aktuellen Zustand aufgerufen (dt in Sekunden, höchstens 0.05) */
  update(s: S, dt: number): void;
  /**
   * Optional: Mitspieler live zeigen (wie bei einer Party: alle spielen gleichzeitig). states[i] ist der aktuelle
   * Simulationszustand von ctx.rivals[i] (KI läuft Takt für Takt mit) oder null, wenn er unbekannt ist (Mensch an
   * einem anderen Gerät). Nur lesen, nie ändern. Wird jedes Bild nach update() aufgerufen.
   */
  ghosts?(states: ReadonlyArray<S | null>, dt: number): void;
  /** Gibt alle selbst erzeugten Ressourcen frei */
  dispose(): void;
}

export type MiniGameViewFactory<S = any> = (ctx: ViewContext, initial: S) => MiniGameView<S>;
