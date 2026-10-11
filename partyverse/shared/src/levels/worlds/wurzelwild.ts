import type { Layout } from '../types';
import type { Styles } from '../builders';
import {
  buildArchipelago,
  buildBraid,
  buildChainLoops,
  buildComb,
  buildLattice,
  buildRibbon,
  buildRing,
  buildSpiral,
  buildTowerSpiral,
  buildZigzag,
  makeLayout,
} from '../builders';

/** Waldpfade mit Rankenbrücken */
const WILD: Styles = { main: 'path', link: 'vine', climb: 'vine', short: 'vine' };

/** WURZELWILD – Naturwelt mit Rankenbrücken, wachsenden Wegen (Faltung), Dornentoren und vielen Läden. */
export const LAYOUTS_WURZELWILD: Layout[] = [
  makeLayout({
    world: 'wurzelwild',
    index: 1,
    name: 'Moosweg',
    template: 'ring',
    blurb:
      'Ein gemütlicher Rundweg über moosige Wurzeln mit zwei Ranken-Umwegen durch das Unterholz. Ein erstes Dornentor lehrt die Maut des Waldes.',
    styles: WILD,
    build: (c) =>
      buildRing(c, { n: 24, wave: 1.4, detours: 2, detourLen: 2, span: 3, islands: 'sectors', sectors: 6 }),
    mix: { gates: 1, shops: 3, items: 4, events: 2, thorn: 0.12 },
    features: ['Moosiger Rundweg', 'Viele Items'],
    difficulty: 1,
    rounds: 10,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 2,
    name: 'Pilzkreis-Archipel',
    template: 'archipelago',
    blurb:
      'Fünf Lichtungen mit Pilzringen, durch Rankenbrücken im Kreis verbunden. Läden und Fundstücke liegen dicht beieinander, ein Dornentor bewacht die Waldmitte.',
    styles: WILD,
    build: (c) => buildArchipelago(c, { sizes: [6, 6, 5, 6, 5], gap: 6, spread: 2, back: 1 }),
    mix: { gates: 1, shops: 3, items: 4, events: 3, thorn: 0.13, portals: 0 },
    features: ['Pilzlichtungen', 'Viele Läden'],
    difficulty: 1,
    rounds: 12,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 3,
    name: 'Wurzelgeflecht',
    template: 'lattice',
    blurb:
      'Ein dichtes Geflecht aus Einbahn-Wurzeln mit vielen Kreuzungen auf einem kleinen Hügel. Vier Wurzelbrücken wachsen und schrumpfen im Takt der Runden.',
    styles: WILD,
    build: (c) => buildLattice(c, { cols: 6, rows: 5, streets: 'both', hill: 1.8, wave: 0.4 }),
    folds: { phases: 2, count: 4, shift: true },
    mix: { gates: 1, shops: 3, items: 4, events: 3, thorn: 0.14 },
    features: ['Wachsende Wurzeln', 'Viele Kreuzungen'],
    difficulty: 2,
    rounds: 13,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 4,
    name: 'Der große Stamm',
    template: 'tower-spiral',
    blurb:
      'Eine Rankentreppe windet sich um einen riesigen Stamm bis in die Krone; außen rankt ein Abstieg zurück. Drei wachsende Äste öffnen zeitweise Abkürzungen.',
    styles: WILD,
    build: (c) => buildTowerSpiral(c, { perTurn: 9, turns: 3, rise: 5 }),
    folds: { phases: 2, count: 3 },
    mix: { gates: 2, shops: 4, items: 4, events: 3, thorn: 0.14 },
    features: ['Baumkrone', 'Wachsende Äste'],
    difficulty: 2,
    rounds: 15,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 5,
    name: 'Rankenzickzack',
    template: 'zigzag',
    blurb:
      'Der Pfad schlängelt sich in Serpentinen durch den Farnwald; ein Randweg führt zurück. Querranken wachsen nur in manchen Runden und öffnen Abkürzungen.',
    styles: WILD,
    build: (c) => buildZigzag(c, { rows: 4, cols: 7, rungs: 3, terrace: 0.8, wave: 0.5 }),
    folds: { phases: 2, count: 3 },
    mix: { gates: 1, shops: 4, items: 4, events: 3, thorn: 0.15 },
    features: ['Serpentinen', 'Farnwald'],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 6,
    name: 'Blattkamm',
    template: 'comb',
    blurb:
      'Ein Blattkamm mit Zinken nach oben und unten: Jeder Zinken ist ein Ranken-Umweg mit Fundstücken. Kurz, übersichtlich und läden-reich.',
    styles: WILD,
    build: (c) => buildComb(c, { m: 8, top: [2, 2, 2], bottom: [0, 2, 0], lift: 1.2 }),
    mix: { gates: 1, shops: 4, items: 5, events: 3, thorn: 0.12 },
    features: ['Blattzinken', 'Viele Items'],
    difficulty: 1,
    rounds: 13,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 7,
    name: 'Dornenspirale',
    template: 'spiral',
    blurb:
      'Eine Dornenranke windet sich nach innen zum Herzbaum, gesichert durch drei Dornentore. Wachsende Ranken zeigen sich nur zeitweise als Abkürzung.',
    styles: WILD,
    build: (c) => buildSpiral(c, { rOut: 17, pitch: 5.8, rise: 3 }),
    folds: { phases: 2, count: 4, shift: true },
    mix: { gates: 3, shops: 4, items: 4, events: 3, thorn: 0.2 },
    features: ['Herzbaum', 'Drei Dornentore'],
    difficulty: 3,
    rounds: 16,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 8,
    name: 'Lianenband',
    template: 'ribbon',
    blurb:
      'Ein verdrehtes Lianenband mit zwei Spuren; die Ranken wachsen in drei Phasen und öffnen wechselnde Querwege. Dornentore sperren die Innenspur.',
    styles: WILD,
    build: (c) => buildRibbon(c, { n: 15, twist: 1, switches: 4, wave: 1.2, chunk: 5 }),
    folds: { phases: 3, count: 5 },
    mix: { gates: 2, shops: 4, items: 4, events: 4, thorn: 0.17 },
    features: ['Möbius-Liane', 'Dreiphasiges Wachstum'],
    difficulty: 3,
    rounds: 15,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 9,
    name: 'Hexenhain',
    template: 'braid',
    blurb:
      'Im Hexenhain teilt sich der Weg immer wieder in zwei Pfade: ein sicherer und ein dorniger. Ein Rückweg im Bogen schließt den Hain; Ranken wachsen als Querverbindung.',
    styles: WILD,
    build: (c) =>
      buildBraid(c, {
        cells: [
          [2, 3],
          [1, 2],
          [3, 2],
          [2, 1],
        ],
      }),
    folds: { phases: 2, count: 3 },
    mix: { gates: 2, shops: 4, items: 4, events: 3, thorn: 0.17 },
    features: ['Wegteilungen', 'Hexenhain'],
    difficulty: 2,
    rounds: 16,
  }),
  makeLayout({
    world: 'wurzelwild',
    index: 10,
    name: 'Urwald-Kleeblatt',
    template: 'chain-loops',
    blurb:
      'Drei große Lichtungen berühren sich im Urwald wie ein Kleeblatt. Hier wächst der Wald in drei Phasen und öffnet ständig neue Pfade; drei Dornentore verlangen Maut.',
    styles: WILD,
    build: (c) =>
      buildChainLoops(c, { rings: [18, 18, 18], arrangement: 'triangle', dy: [0, 1.5, -1.5], wave: 0.5 }),
    folds: { phases: 3, count: 6, shift: false },
    mix: { gates: 3, shops: 6, items: 6, events: 4, thorn: 0.16 },
    features: ['Drei Lichtungen', 'Dreiphasiges Wachstum'],
    difficulty: 3,
    rounds: 19,
  }),
];
