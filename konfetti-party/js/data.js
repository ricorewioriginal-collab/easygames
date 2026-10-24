/* Konfetti-Party – Daten: Arenen (Raster: # Säule/Wand, . Platz für Geschenkkartons, Leerzeichen bleibt frei, 1–4 Start),
 * Extras aus den Kartons, Partygäste und Computer-Gegner. */
'use strict';
const ARENAS = [
  { id: 'party', n: 'Geburtstagsparty', d: 'Torte, Luftballons und jede Menge Geschenke', crates: .72, theme: { floor: ['#ffe9f2', '#ffd6e6'], pillar: '#ff6aa8', top: '#ffffff', crate: ['#ff4a6a', '#3ab0ff', '#ffc02a', '#5ad06a'], wall: '#b03a7a', bg: '#3a1030' },
    map: ['###############', '#1 ......... 3#', '# #.#.#.#.#.# #', '#.............#', '#.#.#.#.#.#.#.#', '#.............#', '#.#.#.#.#.#.#.#', '#.............#', '#.#.#.#.#.#.#.#', '#.............#', '# #.#.#.#.#.# #', '#4 ......... 2#', '###############'] },
  { id: 'zirkus', n: 'Zirkuszelt', d: 'Kleine Manege – hier knallt es schnell', crates: .7, theme: { floor: ['#ffe6c8', '#ffd2a0'], pillar: '#e8302a', top: '#ffd02a', crate: ['#e8302a', '#ffffff', '#2a6ae8', '#ffd02a'], wall: '#8a1a1a', bg: '#2a0a0a' },
    map: ['#############', '#1 ....... 3#', '# #.#.#.#.# #', '#...........#', '#.#.......#.#', '#....   ....#', '#.#.......#.#', '#...........#', '# #.#.#.#.# #', '#4 ....... 2#', '#############'] },
  { id: 'eis', n: 'Eisdiele', d: 'Waffeln, Kugeln und schräge Säulenreihen', crates: .7, theme: { floor: ['#e8f8ff', '#d0eefc'], pillar: '#a86a3a', top: '#ffb8d8', crate: ['#ffb8d8', '#b8f0c8', '#fff0a0', '#c8d8ff'], wall: '#3a7aa8', bg: '#0e2a3a' },
    map: ['###############', '#1 ......... 3#', '# #...#...#.. #', '#.............#', '#...#...#...#.#', '#.............#', '#.#...#...#...#', '#.............#', '#...#...#...#.#', '#.............#', '# #...#...#.. #', '#4 ......... 2#', '###############'] },
  { id: 'disco', n: 'Disco-Fieber', d: 'Freie Tanzfläche in der Mitte – nirgends verstecken', crates: .75, theme: { floor: ['#2a1a4a', '#3a2a6a'], pillar: '#00e5ff', top: '#ff2d95', crate: ['#ff2d95', '#00e5ff', '#ffe02a', '#7cff6a'], wall: '#120a24', bg: '#06030f' },
    map: ['###############', '#1 ......... 3#', '# #.#.#.#.#.# #', '#.............#', '#.#.# # # #.#.#', '#...       ...#', '#.#.# . . #.#.#', '#...       ...#', '#.#.# # # #.#.#', '#.............#', '# #.#.#.#.#.# #', '#4 ......... 2#', '###############'] },
  { id: 'weltall', n: 'Weltraum-Rave', d: 'Riesige Arena mit offenem Kreuz', crates: .74, theme: { floor: ['#1a2a4a', '#22345a'], pillar: '#8a6aff', top: '#d8c8ff', crate: ['#8a6aff', '#ff6ad8', '#6affd8', '#ffd86a'], wall: '#0a1020', bg: '#02040c' },
    map: ['#################', '#1 ........... 3#', '# #.#.#...#.#.# #', '#...............#', '#.#.#.#...#.#.#.#', '#...............#', '#...............#', '#...............#', '#.#.#.#...#.#.#.#', '#...............#', '# #.#.#...#.#.# #', '#4 ........... 2#', '#################'] }
];
// Extras: w = Gewichtung beim Ziehen
const POWERS = {
  bomb: { n: 'Extra-Bonbon', icon: '🍬', d: 'Ein Knallbonbon mehr gleichzeitig', w: 30 },
  fire: { n: 'Mehr Konfetti', icon: '🎉', d: 'Der Konfetti-Strahl reicht ein Feld weiter', w: 30 },
  speed: { n: 'Rollschuhe', icon: '🛼', d: 'Schneller laufen', w: 16 },
  kick: { n: 'Kick-Schuh', icon: '🦶', d: 'Bonbons wegkicken, indem du dagegen läufst', w: 9 },
  shield: { n: 'Luftballon-Schild', icon: '🎈', d: 'Fängt einen Treffer ab', w: 7 },
  remote: { n: 'Fernzünder', icon: '📡', d: 'Deine Bonbons knallen erst, wenn du ZÜNDEN drückst', w: 4 },
  wirr: { n: 'Wirrwarr', icon: '🌀', d: 'Huch! 10 Sekunden lang sind die Richtungen vertauscht', w: 4 }
};
const GUESTS = [
  { n: 'Rico', col: '#ff4a6a', skin: '#f2c8a8', hat: '#ffd02a' }, { n: 'Mia', col: '#3ab0ff', skin: '#e0b090', hat: '#ff6ad8' },
  { n: 'Tom', col: '#ffc020', skin: '#c88a60', hat: '#5ad06a' }, { n: 'Lea', col: '#5ad06a', skin: '#f6d0b8', hat: '#8a6aff' }
];
const BOTS = ['Konfetti-Kalle', 'Luftschlangen-Lisa', 'Wunderkerzen-Willi', 'Tröten-Trudi'];
const LEVELS = [{ n: 'Leicht', d: 'Gemütliche Partygäste' }, { n: 'Normal', d: 'Die wissen, was sie tun' }, { n: 'Schwer', d: 'Konfetti-Profis – keine Gnade!' }];
// Turnier: Arena + Stärke der drei Gegner
const TOUR = [{ a: 0, s: [0, 0, 0] }, { a: 1, s: [0, 1, 0] }, { a: 2, s: [1, 1, 0] }, { a: 3, s: [1, 1, 2] }, { a: 4, s: [2, 2, 1] }];
const KP_DATA = { ARENAS, POWERS, GUESTS, BOTS, LEVELS, TOUR };
if (typeof module !== 'undefined') module.exports = KP_DATA;
