/** Öffentliche Typen und Listen der Fahrzeug-/Ball-Darstellung. */
export type CarBody =
  | 'flitzer'
  | 'brocken'
  | 'libelle'
  | 'pfeil'
  | 'kaefer'
  | 'volta'
  | 'kodiak'
  | 'sprint'
  | 'prisma'
  | 'sandfloh'
  | 'nimbus';
export type CarDecal = 'keins' | 'streifen' | 'blitz' | 'punkte' | 'waben' | 'split' | 'nummer' | 'pfeile';

export const CAR_BODIES: ReadonlyArray<{ id: CarBody; name: string; blurb: string }> = [
  { id: 'flitzer', name: 'Flitzer', blurb: 'Flacher Keil: tief, schnell und wendig.' },
  { id: 'brocken', name: 'Brocken', blurb: 'Kantiger Block-Bolide mit Rammbügel.' },
  { id: 'libelle', name: 'Libelle', blurb: 'Schmal und leicht, mit Flügeln und Heckspoiler.' },
  { id: 'pfeil', name: 'Pfeil', blurb: 'Spitzer Pfeil-Racer für lange Sprints.' },
  { id: 'kaefer', name: 'Käfer', blurb: 'Rund und kompakt: klein, aber frech.' },
  { id: 'volta', name: 'Volta', blurb: 'Elektro-Hyper-GT mit durchgehenden Lichtbändern.' },
  { id: 'kodiak', name: 'Kodiak', blurb: 'Elektro-Gelände-SUV mit Dachträger und Unterfahrschutz.' },
  { id: 'sprint', name: 'Sprint', blurb: 'Rallye-Hatch mit Riesenflügel und Dachhutze.' },
  { id: 'prisma', name: 'Prisma', blurb: 'Facetten-Hypercar mit Haifischflosse.' },
  { id: 'sandfloh', name: 'Sandfloh', blurb: 'E-Buggy mit Überrollkäfig und Stollenreifen.' },
  { id: 'nimbus', name: 'Nimbus', blurb: 'Schwebe-Concept in Tropfenform mit verkleideten Rädern.' },
];

export const CAR_DECALS: ReadonlyArray<{ id: CarDecal; name: string }> = [
  { id: 'keins', name: 'Keins' },
  { id: 'streifen', name: 'Streifen' },
  { id: 'blitz', name: 'Blitz' },
  { id: 'punkte', name: 'Punkte' },
  { id: 'waben', name: 'Waben' },
  { id: 'split', name: 'Zweifarbig' },
  { id: 'nummer', name: 'Startnummer' },
  { id: 'pfeile', name: 'Chevrons' },
];

export interface ActorLook {
  body: CarBody;
  decal: CarDecal;
  /** optionaler Akzentfarbe-Override (0xRRGGBB) */
  accent?: number;
}
