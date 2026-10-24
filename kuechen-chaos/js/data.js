/* Küchen-Chaos – Daten: Zutaten, Gerichte, Küchen (Rasterpläne), Köche.
 * Plan-Zeichen: . Boden  # Theke  T/L/O/M/B/K/F Kisten (Tomate, Salat, Zwiebel, Fleisch, Brötchen, Käse, Fisch)
 * X Schneidebrett  S Herd mit Topf  P Herd mit Pfanne  A Ausgabe  Q Tellerstapel  R Rückgabe (schmutzige Teller)
 * W Spüle  Z Mülleimer  E Theke mit Feuerlöscher  > < ^ v Förderband  1 2 Startplätze */
'use strict';
const ING = {
  tomato: { n: 'Tomate', icon: '🍅', chop: true, pot: true, col: '#e8402a', crate: 'T' },
  lettuce: { n: 'Salat', icon: '🥬', chop: true, col: '#5cc23a', crate: 'L' },
  onion: { n: 'Zwiebel', icon: '🧅', chop: true, pot: true, col: '#e8c08a', crate: 'O' },
  meat: { n: 'Fleisch', icon: '🥩', chop: true, pan: true, col: '#c0485a', crate: 'M' },
  bun: { n: 'Brötchen', icon: '🍞', chop: false, col: '#e0a050', crate: 'B' },
  cheese: { n: 'Käse', icon: '🧀', chop: true, col: '#ffd040', crate: 'K' },
  fish: { n: 'Fisch', icon: '🐟', chop: true, pan: true, col: '#7ab0d8', crate: 'F' }
};
const CRATE = {}; for (const k in ING) CRATE[ING[k].crate] = k;
// Teile auf dem Teller: 'x:c' geschnitten, 'x:k' gebraten, 'soup:x' Suppe, 'bun' Brötchen
const RECIPES = {
  salat: { n: 'Grüner Salat', icon: '🥗', parts: ['lettuce:c'], pts: 20 },
  salat2: { n: 'Gemischter Salat', icon: '🥗', parts: ['lettuce:c', 'tomato:c'], pts: 30 },
  tomsoup: { n: 'Tomatensuppe', icon: '🍅', parts: ['soup:tomato'], pts: 30, soup: true },
  onsoup: { n: 'Zwiebelsuppe', icon: '🧅', parts: ['soup:onion'], pts: 30, soup: true },
  burger: { n: 'Burger', icon: '🍔', parts: ['bun', 'meat:k'], pts: 30 },
  cheese: { n: 'Cheeseburger', icon: '🍔', parts: ['bun', 'meat:k', 'cheese:c'], pts: 40 },
  fisch: { n: 'Fischfilet', icon: '🐟', parts: ['fish:k'], pts: 30 },
  fischsalat: { n: 'Fisch mit Salat', icon: '🐟', parts: ['fish:k', 'lettuce:c'], pts: 40 }
};
const LEVELS = [
  { id: 'imbiss', n: 'Imbiss-Ecke', d: 'Salate schnippeln – zum Warmwerden', theme: 0, menu: ['salat', 'salat2'], stars: [140, 280, 420], time: 150, every: 20, otime: 85,
    map: ['##X#AA#Q##X#', '#..........#', 'L.1......2.T', '#...####...#', '#..........#', '#E#X#Z##X###'] },
  { id: 'burger', n: 'Burger-Bude', d: 'Fleisch braten, bevor es brennt!', theme: 1, menu: ['burger', 'cheese'], stars: [140, 250, 360], time: 160, every: 19, otime: 75,
    map: ['##P#P#AA#Q##', '#..........#', 'M.1..#X..2.B', '#....#X....#', '#..........#', '##K#XZ#E#P##'] },
  { id: 'suppe', n: 'Suppenküche', d: 'Drei Zutaten pro Topf – und Teller spülen', theme: 2, menu: ['tomsoup', 'onsoup', 'salat'], sink: true, stars: [100, 180, 260], time: 170, every: 20, otime: 80,
    map: ['##S#S#AA#S##', '#..........#', 'T.1..##..2.O', 'L....##....#', '#..........#', '#XX#W#R#QZE#'] },
  { id: 'band', n: 'Fließband-Kantine', d: 'Das Band rollt – alles, was draufliegt, wandert mit', theme: 3, menu: ['burger', 'cheese', 'salat2'], sink: true, stars: [130, 250, 350], time: 170, every: 18, otime: 80,
    map: ['##X#M#B#P#P#AA#', '#.............#', 'L.1.>>>>>#..2.T', '#.............#', '#X#Q#R#W#Z#E#K#'] },
  { id: 'eis', n: 'Eis-Bistro', d: 'Spiegelglatter Boden – Bremsen will gelernt sein', theme: 4, menu: ['fisch', 'fischsalat', 'tomsoup', 'onsoup'], ice: true, stars: [100, 180, 260], time: 170, every: 19, otime: 80,
    map: ['##S#S#AA#P#P##', '#............#', 'F.1...##...2.T', '#.....##.....#', 'O............#', '#XX#Q#ZL#E#XX#'] },
  { id: 'geteilt', n: 'Geteilte Küche', d: 'Zwei Hälften – reicht euch alles über die Theke', theme: 5, menu: ['burger', 'cheese', 'salat2', 'tomsoup'], sink: true, stars: [120, 220, 310], time: 180, every: 20, otime: 85,
    map: ['#T#L#XX#S#P#AA#', '#......#......#', 'M.1....X..2...Q', 'B......#......Z', '#......#......#', '#X#K#OZ#W#R#PE#'] }
];
const THEMES = [
  { floor: ['#f8dcb0', '#ecc48e'], counter: '#c0622e', top: '#e8b47a', wall: '#7a4a3a', bg: '#3a2418', sky: '#ffcf9a' },
  { floor: ['#2e3440', '#3b4252'], counter: '#b8323a', top: '#c8ccd4', wall: '#1a1d24', bg: '#14161c', sky: '#ff5a4a' },
  { floor: ['#d8e8f0', '#c4d8e4'], counter: '#4a7aa8', top: '#b8d0e0', wall: '#2a4a6a', bg: '#1a2a3a', sky: '#8ad0ff' },
  { floor: ['#c8ccc0', '#b0b6a8'], counter: '#7a8a6a', top: '#c8d0b8', wall: '#4a5a3a', bg: '#22281e', sky: '#c8e88a' },
  { floor: ['#cfefff', '#b4e2fa'], counter: '#3a8ab8', top: '#8ac8e4', wall: '#2a6a8a', bg: '#0e2a3a', sky: '#bff4ff' },
  { floor: ['#e8c8e0', '#d6b0cc'], counter: '#9a5ab0', top: '#d8b4e4', wall: '#5a2a6a', bg: '#24122a', sky: '#ff9ad8' }
];
const CHEFS = [
  { n: 'Rico', col: '#ff4a6a', skin: '#f2c8a8' }, { n: 'Mia', col: '#3ab0ff', skin: '#e0b090' },
  { n: 'Tom', col: '#ffc020', skin: '#c88a60' }, { n: 'Lea', col: '#5ad06a', skin: '#f6d0b8' }
];
const KC_DATA = { ING, CRATE, RECIPES, LEVELS, THEMES, CHEFS };
if (typeof module !== 'undefined') module.exports = KC_DATA;
