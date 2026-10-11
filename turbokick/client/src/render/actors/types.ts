/** Öffentliche Typen und Listen der Fahrzeug-/Ball-Darstellung. */
export type CarBody = 'flitzer' | 'brocken' | 'libelle' | 'pfeil' | 'kaefer';
export type CarDecal = 'keins' | 'streifen' | 'blitz' | 'punkte';

export const CAR_BODIES: ReadonlyArray<{ id: CarBody; name: string; blurb: string }> = [
  { id: 'flitzer', name: 'Flitzer', blurb: 'Flacher Keil: tief, schnell und wendig.' },
  { id: 'brocken', name: 'Brocken', blurb: 'Kantiger Block-Bolide mit Rammbügel.' },
  { id: 'libelle', name: 'Libelle', blurb: 'Schmal und leicht, mit Flügeln und Heckspoiler.' },
  { id: 'pfeil', name: 'Pfeil', blurb: 'Spitzer Pfeil-Racer für lange Sprints.' },
  { id: 'kaefer', name: 'Käfer', blurb: 'Rund und kompakt: klein, aber frech.' },
];

export const CAR_DECALS: ReadonlyArray<{ id: CarDecal; name: string }> = [
  { id: 'keins', name: 'Keins' },
  { id: 'streifen', name: 'Streifen' },
  { id: 'blitz', name: 'Blitz' },
  { id: 'punkte', name: 'Punkte' },
];

export interface ActorLook {
  body: CarBody;
  decal: CarDecal;
  /** optionaler Akzentfarbe-Override (0xRRGGBB) */
  accent?: number;
}
