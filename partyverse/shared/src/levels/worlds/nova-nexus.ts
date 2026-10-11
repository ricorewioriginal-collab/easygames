import type { Layout } from '../types';
import type { Styles } from '../builders';
import {
  buildArchipelago,
  buildChainLoops,
  buildCrossBridges,
  buildLadder,
  buildOrbits,
  buildRing,
  buildSpiral,
  buildStarHub,
  buildTowerSpiral,
  buildTwinLoops,
  makeLayout,
} from '../builders';

/** Plattformwege mit Strahlenbrücken */
const PLATFORM: Styles = { main: 'path', link: 'beam', climb: 'beam', short: 'beam' };
/** Strahlenwege auch auf den Plattformen */
const BEAMS: Styles = { main: 'beam', link: 'path', climb: 'beam', short: 'beam' };

/** Rotierende Plattformen: jede zweite Insel dreht sich, abwechselnd links und rechts herum */
const spin = (i: number): number | undefined => (i % 2 === 0 ? 0.22 + 0.04 * (i % 3) : -0.17);
/** Nur Darstellung: Die Schwerkraft kippt zwischen den Plattformen */
const GRAV = 'Schwerkraft-Wechsel (Darstellung)';

/** NOVA NEXUS – kosmische Plattformen, Planetensysteme, Raumportale, Strahlenwege und Chaos-Felder. */
export const LAYOUTS_NOVA_NEXUS: Layout[] = [
  makeLayout({
    world: 'nova-nexus',
    index: 1,
    name: 'Erste Umlaufbahn',
    template: 'orbits',
    blurb:
      'Zwei Umlaufbahnen kreisen gegenläufig umeinander und sind durch Strahlenbrücken verbunden. Ein ruhiger Einstieg in die kosmische Welt mit einem einzigen Raumportal.',
    styles: PLATFORM,
    build: (c) => buildOrbits(c, { rings: [10, 16], links: [2], yStep: 1.5, startRing: 1 }),
    spin,
    mix: { portals: 1, shops: 2, chaos: 1, items: 2, events: 2, thorn: 0.12 },
    features: ['Planetensystem', GRAV],
    difficulty: 1,
    rounds: 10,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 2,
    name: 'Doppelstern-Pfad',
    template: 'twin-loops',
    blurb:
      'Zwei Sterne, zwei Rundkurse: Zwei lange Strahlenbrücken führen hin und zurück. Auf jedem Stern lauern Chaos-Felder, die die Plätze vertauschen.',
    styles: PLATFORM,
    build: (c) => buildTwinLoops(c, { na: 12, nb: 14, bridges: [2, 2], dy: 2.2 }),
    spin,
    mix: { portals: 1, shops: 2, chaos: 2, items: 2, events: 3, thorn: 0.13 },
    features: ['Zwei Sterne', GRAV],
    difficulty: 1,
    rounds: 11,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 3,
    name: 'Asteroidengürtel',
    template: 'ring',
    blurb:
      'Ein Ring aus treibenden Asteroidenplatten mit vier Strahlen-Umwegen durch das Innere. Drei Chaos-Felder wirbeln die Rangfolge durcheinander.',
    styles: BEAMS,
    build: (c) =>
      buildRing(c, { n: 30, wave: 2.4, detours: 4, detourLen: 2, span: 3, islands: 'sectors', sectors: 8 }),
    spin,
    shortcuts: { count: 2 },
    mix: { portals: 2, shops: 3, chaos: 3, items: 3, events: 3, thorn: 0.15 },
    features: ['Asteroidenplatten', GRAV],
    difficulty: 2,
    rounds: 13,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 4,
    name: 'Planetenkette',
    template: 'chain-loops',
    blurb:
      'Drei Planetenbahnen berühren sich wie Kettenglieder an zwei Kreuzungsfeldern. Jede Bahn liegt auf anderer Höhe, die mittlere kreist gegenläufig.',
    styles: PLATFORM,
    build: (c) =>
      buildChainLoops(c, { rings: [12, 14, 12], arrangement: 'line', dy: [0, 2.5, -2], wave: 0.6 }),
    spin,
    mix: { portals: 2, shops: 3, chaos: 2, items: 3, events: 3, thorn: 0.14, gates: 1 },
    features: ['Drei Planeten', 'Kreuzungsfelder', GRAV],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 5,
    name: 'Raumportal-Archipel',
    template: 'archipelago',
    blurb:
      'Fünf Raumstationen im Kreis um eine Zentralplattform, verbunden durch Strahlenbrücken und vier Stege zur Mitte. Drei Portal-Paare machen die Lage unberechenbar.',
    styles: PLATFORM,
    build: (c) =>
      buildArchipelago(c, {
        sizes: [5, 6, 5, 6, 5],
        hub: { size: 5, spokes: 4 },
        gap: 6,
        spread: 3.5,
        back: 2,
      }),
    spin,
    mix: { portals: 3, shops: 4, chaos: 2, items: 3, events: 3, thorn: 0.15, gates: 1 },
    features: ['Zentralplattform', 'Raumstationen', GRAV],
    difficulty: 3,
    rounds: 16,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 6,
    name: 'Orbitalaufzug',
    template: 'tower-spiral',
    blurb:
      'Eine Wendeltreppe schraubt sich zur Raumstation empor, außen gleitet ein Strahlenpfad wieder hinab. Oben ändert sich die Schwerkraft, am Fuß lauert ein Chaos-Feld.',
    styles: PLATFORM,
    build: (c) => buildTowerSpiral(c, { perTurn: 9, turns: 3, rise: 5.5 }),
    spin,
    shortcuts: { count: 2 },
    mix: { portals: 2, shops: 4, chaos: 2, items: 3, events: 3, thorn: 0.14 },
    features: ['Weltraumlift', GRAV],
    difficulty: 2,
    rounds: 15,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 7,
    name: 'Kometenbahn',
    template: 'spiral',
    blurb:
      'Ein Komet zieht seinen Weg als Spirale nach innen zum Kern; die hohe Rückbrücke bringt alle wieder an den Rand. Chaos-Felder und Mautbrücken sorgen für Spannung.',
    styles: BEAMS,
    build: (c) => buildSpiral(c, { rOut: 16, pitch: 6, rise: -3, wave: 0.8 }),
    spin,
    shortcuts: { count: 3 },
    mix: { portals: 2, shops: 3, chaos: 3, gates: 2, items: 3, events: 3, thorn: 0.16 },
    features: ['Kometenschweif', 'Mautbrücken', GRAV],
    difficulty: 3,
    rounds: 16,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 8,
    name: 'Mondleiter',
    template: 'ladder',
    blurb:
      'Zwei lange Mondpfade mit Strahlen-Sprossen dazwischen: oben hin, unten zurück. Übersichtlich und kurz, ideal für schnelle Runden.',
    styles: PLATFORM,
    build: (c) => buildLadder(c, { m: 11, w: 3.6, rungs: 2, wave: 1.2, chunk: 4 }),
    spin,
    mix: { portals: 1, shops: 2, chaos: 1, items: 2, events: 2, thorn: 0.1 },
    features: ['Mondpfade', GRAV],
    difficulty: 1,
    rounds: 10,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 9,
    name: 'Gravitationsbrücken',
    template: 'cross-bridges',
    blurb:
      'Ein Plattformring, über dessen Zentrum sich zwei Strahlenbrücken auf verschiedenen Höhen kreuzen. Die Schwerkraft kippt auf den Brücken – zum Glück nur zur Optik.',
    styles: BEAMS,
    build: (c) => buildCrossBridges(c, { n: 26, chords: 2, wave: 1.5, levelGap: 5 }),
    spin,
    mix: { portals: 2, shops: 4, chaos: 2, items: 3, events: 3, thorn: 0.15 },
    features: ['Kreuzende Strahlen', GRAV],
    difficulty: 2,
    rounds: 14,
  }),
  makeLayout({
    world: 'nova-nexus',
    index: 10,
    name: 'Nexus-Zentrum',
    template: 'star-hub',
    blurb:
      'Sechs Strahlenschleifen strahlen von der Nexus-Nabe aus, jede auf eigener Höhe. Wer am Start vorbeikommt, wählt neu – mit Portalen und Chaos-Feldern als Finale.',
    styles: PLATFORM,
    build: (c) => buildStarHub(c, { petals: [3, 4, 3, 4, 3, 4], lift: [3, -2, 3, -2, 3, -2] }),
    spin,
    shortcuts: { count: 3 },
    mix: { portals: 4, shops: 6, chaos: 4, gates: 2, items: 4, events: 4, thorn: 0.15 },
    features: ['Nexus-Nabe', 'Sechs Arme', GRAV],
    difficulty: 3,
    rounds: 19,
  }),
];
