/** Leveldaten: Ein Layout ist ein gerichteter Graph aus Feldern (Knoten) und Wegen (Kanten) mit 3D-Position. */
export type WorldId = 'prismara' | 'nova-nexus' | 'wurzelwild' | 'paradox-city' | 'infinity-carnival';
export const WORLD_IDS: readonly WorldId[] = ['prismara', 'nova-nexus', 'wurzelwild', 'paradox-city', 'infinity-carnival'];

export type NodeKind =
  | 'start' // Startfeld (kein Effekt, Runden-Bonus beim Überqueren)
  | 'glimmer' // +3 Glimmer
  | 'thorn' // -3 Glimmer
  | 'event' // Zufallsereignis
  | 'item' // Gratis-Gegenstand
  | 'shop' // Laden (Halt nötig)
  | 'portal' // Teleporter zum Partner-Portal (Feld `portal` verweist auf die Partner-ID)
  | 'gate' // Mautbrücke: 3 Glimmer oder Schlüsselfragment
  | 'chaos'; // Tauscht die Position mit einem zufälligen anderen Spieler

export const NODE_KINDS: readonly NodeKind[] = ['start', 'glimmer', 'thorn', 'event', 'item', 'shop', 'portal', 'gate', 'chaos'];

export type EdgeStyle = 'path' | 'bridge' | 'light' | 'vine' | 'stairs' | 'rail' | 'rainbow' | 'beam';
export const EDGE_STYLES: readonly EdgeStyle[] = ['path', 'bridge', 'light', 'vine', 'stairs', 'rail', 'rainbow', 'beam'];

export interface LayoutNode {
  id: number;
  kind: NodeKind;
  /** 3D-Position in Welteinheiten (Feldabstand ca. 3–4); y ist die Höhe */
  pos: [number, number, number];
  /** Nur bei kind === 'portal': ID des Partner-Portals */
  portal?: number;
  /** Zu welcher Insel/Plattform das Feld gehört (Index in Layout.islands) */
  island?: number;
}

export interface LayoutEdge {
  from: number;
  to: number;
  /**
   * 4D-Faltung: Nur in diesen Faltungsphasen (0 … foldPhases-1) ist der Weg begehbar. undefined = immer.
   * Phase der Runde r (ab 1) = (r - 1) % foldPhases.
   */
  folds?: number[];
  style: EdgeStyle;
  /** Bogenhöhe für die Darstellung (0 = gerade) */
  arc?: number;
}

export interface LayoutIsland {
  center: [number, number, number];
  radius: number;
  /** Drehgeschwindigkeit in rad/s für rotierende Plattformen (nur Darstellung) */
  spin?: number;
}

export interface Layout {
  /** z. B. 'prismara-03' */
  id: string;
  world: WorldId;
  /** 1 … 10 innerhalb der Welt */
  index: number;
  name: string;
  blurb: string;
  /** Name des Bauplans (Topologie), z. B. 'twin-loops' */
  template: string;
  /** Anzahl Faltungsphasen (1 = keine Faltung) */
  foldPhases: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  start: number;
  /** Mögliche Orte des Chrono-Altars (mindestens 4, nie das Startfeld) */
  altarSites: number[];
  /** Menschenlesbare Besonderheiten, z. B. 'Portale', 'Faltung', 'Mautbrücken' */
  features: string[];
  /** 1 (leicht) … 3 (anspruchsvoll) */
  difficulty: 1 | 2 | 3;
  /** Empfohlene Rundenzahl */
  recommendedRounds: number;
  islands: LayoutIsland[];
}
