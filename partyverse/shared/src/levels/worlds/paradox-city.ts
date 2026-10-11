import type { Layout } from '../types';
import type { Styles } from '../builders';
import {
  buildBraid,
  buildCrossBridges,
  buildLadder,
  buildLattice,
  buildOrbits,
  buildRibbon,
  buildTerraces,
  buildTowerSpiral,
  buildTrefoil,
  buildZigzag,
  makeLayout,
} from '../builders';

/** Treppenstadt: Treppen als Verbindungen, Brücken als Abkürzungen */
const STAIRS: Styles = { main: 'path', link: 'stairs', climb: 'stairs', short: 'bridge' };
/** Treppen überall */
const ALLSTAIRS: Styles = { main: 'stairs', link: 'stairs', climb: 'stairs', short: 'bridge' };

/** Rotierende Plattformen: jede dritte Insel starr, die anderen drehen abwechselnd */
const spin = (i: number): number | undefined => (i % 3 === 1 ? undefined : i % 2 === 0 ? 0.2 : -0.3);

/** PARADOX CITY – unmögliche Architektur: Treppen, Raumfaltungen mit vielen faltbaren Wegen, Schleifen und drehende Plattformen. */
export const LAYOUTS_PARADOX_CITY: Layout[] = [
  makeLayout({
    world: 'paradox-city',
    index: 1,
    name: 'Treppenhaus ohne Ende',
    template: 'terraces',
    blurb:
      'Zwei ineinander geschachtelte Treppenterrassen: Wer hinaufsteigt, landet scheinbar wieder unten. Sechs faltbare Brücken verschieben sich mit jeder Runde.',
    styles: STAIRS,
    build: (c) => buildTerraces(c, { sides: [3, 5], yStep: 3.6, stairs: 2 }),
    folds: { phases: 2, count: 6, shift: true },
    spin,
    mix: { portals: 1, shops: 3, items: 3, events: 3, thorn: 0.13 },
    features: ['Endlose Treppen', 'Verschobene Brücken'],
    difficulty: 1,
    rounds: 12,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 2,
    name: 'Flurschleife',
    template: 'ladder',
    blurb:
      'Zwei parallele Flure laufen gegeneinander und werden von Querstiegen verbunden. Sechs Raumfaltungen schalten zusätzliche Durchgänge im Wechsel frei.',
    styles: STAIRS,
    build: (c) => buildLadder(c, { m: 12, w: 3.6, rungs: 3, wave: 1.8, chunk: 4 }),
    folds: { phases: 2, count: 6 },
    spin,
    mix: { portals: 1, shops: 3, items: 3, events: 3, thorn: 0.12 },
    features: ['Parallele Flure', 'Raumfaltung'],
    difficulty: 1,
    rounds: 12,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 3,
    name: 'Möbius-Boulevard',
    template: 'ribbon',
    blurb:
      'Ein Boulevard, der sich beim Entlanggehen auf die Rückseite dreht. Acht Faltungen in drei Phasen lassen Nebenstraßen auftauchen und verschwinden.',
    styles: ALLSTAIRS,
    build: (c) => buildRibbon(c, { n: 15, twist: 1, switches: 3, wave: 1.6, chunk: 5 }),
    folds: { phases: 3, count: 8 },
    spin,
    mix: { portals: 2, shops: 3, items: 3, events: 4, thorn: 0.15, chaos: 1 },
    features: ['Verdrehte Straße', 'Dreifach-Faltung'],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 4,
    name: 'Wendelwahn',
    template: 'tower-spiral',
    blurb:
      'Ein Wendeltreppenturm, dessen Abstieg am Fuß wieder in den Aufstieg mündet. Sieben Faltungen kürzen quer durch das Treppenhaus ab – aber nur in einer Phase.',
    styles: STAIRS,
    build: (c) => buildTowerSpiral(c, { perTurn: 8, turns: 3, rise: 5.5 }),
    folds: { phases: 2, count: 7, shift: true },
    spin,
    mix: { portals: 2, shops: 3, items: 3, events: 3, thorn: 0.15 },
    features: ['Wendeltreppe', 'Querfaltungen'],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 5,
    name: 'Stadtraster Null',
    template: 'lattice',
    blurb:
      'Ein Einbahnstraßen-Raster auf einem Hügel, mit zehn Faltungen in drei Phasen. Die Stadt faltet sich um die Spieler herum – kaum ein Weg bleibt, wie er war.',
    styles: STAIRS,
    build: (c) => buildLattice(c, { cols: 6, rows: 6, streets: 'both', hill: 2.4, wave: 0.9 }),
    folds: { phases: 3, count: 10 },
    spin,
    mix: { portals: 2, shops: 3, chaos: 2, gates: 1, items: 4, events: 4, thorn: 0.16 },
    features: ['Einbahn-Raster', 'Dreifach-Faltung'],
    difficulty: 3,
    rounds: 16,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 6,
    name: 'Überführungs-Irrsinn',
    template: 'cross-bridges',
    blurb:
      'Ein Ring mit drei Überführungen, die sich in der Mitte stapeln, ohne sich zu berühren. Acht Faltungen verschieben die Auffahrten von Runde zu Runde.',
    styles: STAIRS,
    build: (c) => buildCrossBridges(c, { n: 28, chords: 3, wave: 1.4, levelGap: 4.8 }),
    folds: { phases: 2, count: 8 },
    spin,
    mix: { portals: 2, shops: 4, items: 4, events: 3, thorn: 0.15 },
    features: ['Gestapelte Brücken', 'Verschobene Auffahrten'],
    difficulty: 2,
    rounds: 15,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 7,
    name: 'Zickzack-Paradox',
    template: 'zigzag',
    blurb:
      'Eine riesige Treppen-Serpentine, die sich selbst durchkreuzt. Zwölf Faltungen in drei Phasen machen aus jedem Flur potentiell eine Abkürzung.',
    styles: STAIRS,
    build: (c) => buildZigzag(c, { rows: 6, cols: 7, rungs: 5, terrace: 1.6, wave: 0.8 }),
    folds: { phases: 3, count: 12 },
    spin,
    mix: { portals: 3, shops: 5, chaos: 2, gates: 2, items: 4, events: 4, thorn: 0.17 },
    features: ['Gefaltete Serpentine', 'Zwölf Faltungen'],
    difficulty: 3,
    rounds: 18,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 8,
    name: 'Kleeblatt-Knoten',
    template: 'trefoil-knot',
    blurb:
      'Ein Treppenweg zum Kleeblattknoten verschlungen: Die Stränge kreuzen sich auf drei Etagen. Zwölf Faltungen in drei Phasen verbinden die Etagen nur zeitweise.',
    styles: ALLSTAIRS,
    build: (c) => buildTrefoil(c, { n: 44 }),
    folds: { phases: 3, count: 12 },
    spin,
    mix: { portals: 3, shops: 4, chaos: 1, gates: 2, items: 4, events: 4, thorn: 0.16 },
    features: ['Knotenstraße', 'Etagenwechsel'],
    difficulty: 3,
    rounds: 17,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 9,
    name: 'Uhrwerk-Bahnen',
    template: 'orbits',
    blurb:
      'Drei ineinandergreifende Zahnrad-Plattformen, die gegenläufig rotieren. Zehn Faltungen springen zwischen den Rädern, als würde das Uhrwerk die Zeit verschieben.',
    styles: STAIRS,
    build: (c) => buildOrbits(c, { rings: [10, 16, 22], links: [3, 3], yStep: 2.4, startRing: 2 }),
    folds: { phases: 2, count: 10 },
    spin: (i) => (i % 2 === 0 ? 0.28 : -0.28),
    mix: { portals: 2, shops: 5, items: 4, events: 4, thorn: 0.15, chaos: 1 },
    features: ['Zahnradplattformen', 'Zeitversatz'],
    difficulty: 2,
    rounds: 16,
  }),
  makeLayout({
    world: 'paradox-city',
    index: 10,
    name: 'Das unmögliche Haus',
    template: 'braid',
    blurb:
      'Ein Haus aus Rauten-Fluren mit zwei Wegen pro Raum und einem Rückweg unter dem Fundament. Vierzehn Faltungen, teils verschoben, machen das Haus zum Rätsel.',
    styles: ALLSTAIRS,
    build: (c) =>
      buildBraid(c, {
        cells: [
          [2, 3],
          [3, 2],
          [1, 3],
          [2, 2],
        ],
        lift: 1.6,
        depth: 11,
      }),
    folds: { phases: 3, count: 14, shift: true },
    spin,
    mix: { portals: 3, shops: 4, chaos: 2, gates: 2, items: 5, events: 4, thorn: 0.17 },
    features: ['Raumrauten', 'Verschobene Brücken'],
    difficulty: 3,
    rounds: 19,
  }),
];
