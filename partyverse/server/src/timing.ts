/** Zeitverhalten des Raums (Millisekunden bzw. Sekunden) – für Tests verkürzbar. */
export interface Timing {
  botDelayMin: number;
  botDelayMax: number;
  /** Zeit für eine Entscheidung eines Menschen */
  turnTimeout: number;
  /** Wartezeit bis ein getrennter Spieler automatisch zieht */
  afkTimeout: number;
  /** Zeit zum Lesen der Minispiel-Anleitung */
  introTimeout: number;
  /** Zusatzzeit nach Minispiel-Dauer, bis Ergebnisse automatisch ergänzt werden */
  playGrace: number;
  /** Sekunden, in denen ein getrennter Spieler zurückkehren darf */
  reconnectSeconds: number;
  /** So lange bleibt der Raum nach dem Spielende offen */
  endedLinger: number;
}

export const DEFAULT_TIMING: Timing = {
  botDelayMin: 700,
  botDelayMax: 1600,
  turnTimeout: 45000,
  afkTimeout: 2500,
  introTimeout: 30000,
  playGrace: 15000,
  reconnectSeconds: 60,
  endedLinger: 120000,
};

export const FAST_TIMING: Timing = { botDelayMin: 0, botDelayMax: 10, turnTimeout: 3000, afkTimeout: 20, introTimeout: 3000, playGrace: 1000, reconnectSeconds: 2, endedLinger: 500 };
