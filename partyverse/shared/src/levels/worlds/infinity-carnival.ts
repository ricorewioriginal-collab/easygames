import type { Layout } from '../types';
import type { Styles } from '../builders';
import {
  buildBraid,
  buildChainLoops,
  buildComb,
  buildLadder,
  buildLattice,
  buildOrbits,
  buildStarHub,
  buildTrefoil,
  buildTwinLoops,
  buildZigzag,
  makeLayout,
} from '../builders';

/** Achterbahnschienen */
const RAILS: Styles = { main: 'rail', link: 'rail', climb: 'rail', short: 'beam' };
/** Schienen auf Jahrmarktwegen */
const MIXED: Styles = { main: 'path', link: 'rail', climb: 'rail', short: 'bridge' };

const spin = (i: number): number | undefined => (i % 2 === 0 ? 0.3 : undefined);

/** INFINITY CARNIVAL – kosmische Vergnügungswelt: Schienen, dynamische Pfade, alle Mechaniken gemischt; 07–10 sind die Finale-Bretter. */
export const LAYOUTS_INFINITY_CARNIVAL: Layout[] = [
  makeLayout({
    world: 'infinity-carnival',
    index: 1,
    name: 'Zirkuszelt-Zickzack',
    template: 'zigzag',
    blurb:
      'Der Weg schlängelt sich in Kehren durch das Zirkuszelt, mit einem Schienenrückweg am Rand. Zwei Querschienen sparen Schritte – ein freundlicher Einstieg ins Karneval.',
    styles: MIXED,
    build: (c) => buildZigzag(c, { rows: 4, cols: 6, rungs: 2, terrace: 0.6 }),
    mix: { portals: 1, shops: 3, gates: 1, chaos: 1, items: 3, events: 3, thorn: 0.12 },
    features: ['Zeltkehren', 'Alle Mechaniken'],
    difficulty: 1,
    rounds: 11,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 2,
    name: 'Karussell-Blüte',
    template: 'star-hub',
    blurb:
      'Vier Schienenschleifen drehen sich wie Karussellarme um die Mitte. Wer am Start vorbeifährt, darf die Bahn wechseln; die Blätter liegen auf wechselnder Höhe.',
    styles: RAILS,
    build: (c) => buildStarHub(c, { petals: [3, 3, 3, 3], lift: [1.5, -1, 1.5, -1] }),
    spin,
    mix: { portals: 1, shops: 3, chaos: 1, items: 3, events: 3, thorn: 0.13 },
    features: ['Karussellarme', 'Rundläufe um den Start'],
    difficulty: 1,
    rounds: 12,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 3,
    name: 'Doppelrad',
    template: 'twin-loops',
    blurb:
      'Zwei Riesenräder auf verschiedener Höhe, durch zwei Schienenbrücken verbunden. Drei Faltungen lassen zusätzliche Gondelwege kommen und gehen.',
    styles: RAILS,
    build: (c) => buildTwinLoops(c, { na: 14, nb: 14, bridges: [1, 1], dy: 3, wave: 0.8 }),
    folds: { phases: 2, count: 3 },
    spin,
    mix: { portals: 2, shops: 3, chaos: 2, gates: 1, items: 3, events: 3, thorn: 0.14 },
    features: ['Zwei Riesenräder', 'Gondelwege'],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 4,
    name: 'Jahrmarkt-Kamm',
    template: 'comb',
    blurb:
      'Eine Budenreihe mit Zinken: Jede Bude ist ein kleiner Schienen-Umweg mit Items. Zwei Abkürzungen und ein Portal-Paar erlauben Sprünge über die Reihen.',
    styles: MIXED,
    build: (c) => buildComb(c, { m: 8, top: [2, 3, 2], bottom: [0, 2, 0], lift: 1.4 }),
    shortcuts: { count: 2 },
    mix: { portals: 1, shops: 4, chaos: 1, items: 4, events: 3, thorn: 0.13 },
    features: ['Budenreihe', 'Kurzer Rundkurs'],
    difficulty: 1,
    rounds: 14,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 5,
    name: 'Achterbahn-Leiter',
    template: 'ladder',
    blurb:
      'Eine lange Achterbahn: Auf der Oberspur hin, auf der Unterspur zurück, mit drei Schienen-Sprossen als Weichen. Die Gleise heben und senken sich wellenförmig.',
    styles: RAILS,
    build: (c) => buildLadder(c, { m: 14, w: 4.2, rungs: 3, wave: 2.4, slope: 0.6, chunk: 4 }),
    folds: { phases: 2, count: 2 },
    spin,
    mix: { portals: 2, shops: 3, chaos: 2, gates: 1, items: 3, events: 3, thorn: 0.15 },
    features: ['Wellenbahn', 'Weichen'],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 6,
    name: 'Spiegelkabinett-Stadt',
    template: 'lattice',
    blurb:
      'Ein Raster aus Schienen-Einbahnstraßen, das sich im Spiegelkabinett vervielfacht. Vier Faltungen lassen Seitengassen im Wechsel auftauchen.',
    styles: RAILS,
    build: (c) => buildLattice(c, { cols: 6, rows: 5, streets: 'rows', hill: 1.5, wave: 0.5 }),
    folds: { phases: 2, count: 4, shift: true },
    mix: { portals: 2, shops: 4, chaos: 2, gates: 1, items: 4, events: 3, thorn: 0.15 },
    features: ['Spiegelgassen', 'Dynamische Pfade'],
    difficulty: 2,
    rounds: 15,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 7,
    name: 'Feuerwerks-Flechte',
    template: 'braid',
    blurb:
      'FINALE: Vier große Rauten-Weichen reihen sich zur Feuerwerksbahn, darunter schlingt sich der Rückweg. Faltung in drei Phasen, Portale, Mautbrücken und Chaos – alles auf einmal.',
    styles: RAILS,
    build: (c) =>
      buildBraid(c, {
        cells: [
          [3, 3],
          [3, 2],
          [2, 3],
          [3, 3],
        ],
        lift: 1.4,
        depth: 13,
      }),
    folds: { phases: 3, count: 8, shift: true },
    spin,
    shortcuts: { count: 2 },
    mix: { portals: 3, shops: 6, chaos: 3, gates: 2, items: 5, events: 4, thorn: 0.17 },
    features: ['Finale-Brett', 'Feuerwerksbahn'],
    difficulty: 3,
    rounds: 18,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 8,
    name: 'Kosmischer Knoten',
    template: 'trefoil-knot',
    blurb:
      'FINALE: Eine Schienenbahn, die sich zum kosmischen Knoten verschlingt und sich selbst auf drei Ebenen überkreuzt. Faltung, Portale und viele Weichen sorgen für Chaos.',
    styles: RAILS,
    build: (c) => buildTrefoil(c, { n: 52 }),
    folds: { phases: 3, count: 9 },
    spin,
    shortcuts: { count: 3 },
    mix: { portals: 4, shops: 6, chaos: 3, gates: 2, items: 5, events: 5, thorn: 0.17 },
    features: ['Finale-Brett', 'Dreiebenen-Knoten'],
    difficulty: 3,
    rounds: 19,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 9,
    name: 'Sternen-Karussell',
    template: 'orbits',
    blurb:
      'FINALE: Drei drehende Karussellbahnen, ineinander geschachtelt und durch Schienen-Weichen verbunden. Dazu Faltung, Portale, Mautbrücken und Chaos-Felder.',
    styles: RAILS,
    build: (c) => buildOrbits(c, { rings: [10, 18, 26], links: [3, 4], yStep: 2, startRing: 1, wave: 0.5 }),
    folds: { phases: 2, count: 8, shift: true },
    spin: (i) => (i % 2 === 0 ? 0.35 : -0.25),
    mix: { portals: 4, shops: 6, chaos: 3, gates: 2, items: 5, events: 5, thorn: 0.17 },
    features: ['Finale-Brett', 'Drehende Karussells'],
    difficulty: 3,
    rounds: 20,
  }),
  makeLayout({
    world: 'infinity-carnival',
    index: 10,
    name: 'Das große Finale',
    template: 'chain-loops',
    blurb:
      'FINALE: Fünf Schienenringe hängen wie Kettenglieder aneinander, jeder auf eigener Höhe. Dreifache Faltung, Portale, Mautbrücken, Chaos-Felder und Läden – das größte Brett des Karnevals.',
    styles: RAILS,
    build: (c) =>
      buildChainLoops(c, {
        rings: [10, 12, 12, 12, 10],
        arrangement: 'line',
        dy: [0, 2.5, -1.5, 2, -2],
        wave: 0.7,
        startRing: 2,
      }),
    folds: { phases: 3, count: 12, shift: true },
    spin,
    shortcuts: { count: 3 },
    mix: { portals: 4, shops: 7, chaos: 4, gates: 3, items: 5, events: 5, thorn: 0.17 },
    features: ['Finale-Brett', 'Fünf Kettenringe'],
    difficulty: 3,
    rounds: 20,
  }),
];
