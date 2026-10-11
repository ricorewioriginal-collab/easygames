// Spielwerte – unverändert aus der ersten Version übernommen (Balancing bleibt gleich).
export const GW = 14, GH = 10, MAXW = 25, STEP = 1 / 30;
export const NAMES = ['RicoReWi Music & Media', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!', 'RockRadio 24', 'ChristmasRadio 24', 'KultRadio 24', 'Zocker-FM', 'Special-Radio'];

// th: [Boden, Raster, Weg, Akzent]
export const MAPS = [
  { name: 'Funkhafen',        pts: [[0, 1], [11, 1], [11, 4], [2, 4], [2, 7], [13, 7]],            th: ['#0d1a3a', '#27428c', '#21408a', '#00E5FF'] },
  { name: 'Frequenz-Spirale', pts: [[0, 8], [12, 8], [12, 1], [2, 1], [2, 6], [9, 6], [9, 4]],     th: ['#1a0e38', '#5a3aba', '#3d2a82', '#FF2D95'] },
  { name: 'Zickzack-Studio',  pts: [[0, 5], [3, 5], [3, 1], [6, 1], [6, 8], [9, 8], [9, 1], [13, 1]], th: ['#0c2a22', '#1f8a6a', '#1d6a54', '#FFD24A'] }
];
export const DIFFS = [
  { name: 'Leicht', money: 230, life: 25, hp: 0.85, sc: 0.8 },
  { name: 'Normal', money: 180, life: 20, hp: 1, sc: 1 },
  { name: 'Schwer', money: 160, life: 14, hp: 1.35, sc: 1.3 }
];

// Turm-Arten: li = Index des Sender-Logos (0-basiert)
export const TY = [
  { id: 'arrow',  li: 1, name: 'Allrounder',      cost: 50,  dmg: 9,  range: 3.2, rate: 2.2,  col: '#00E5FF', kind: 'proj', spd: 15, desc: 'Schnell und günstig – gut für den Anfang.' },
  { id: 'bass',   li: 2, name: 'Bass-Bombe',      cost: 90,  dmg: 22, range: 3.3, rate: 0.8,  col: '#FF9A1F', kind: 'proj', spd: 9, splash: [1.2, 1.5, 1.8], desc: 'Flächenschaden gegen Gruppen.' },
  { id: 'frost',  li: 3, name: 'Frost-Pop',       cost: 70,  dmg: 4,  range: 2.9, rate: 1.4,  col: '#9fe8ff', kind: 'proj', spd: 12, slow: [0.55, 0.42, 0.3], desc: 'Verlangsamt Rauschen.' },
  { id: 'chain',  li: 4, name: 'Hit-Blitz',       cost: 110, dmg: 15, range: 3.0, rate: 1.1,  col: '#FFD24A', kind: 'chain', n: [2, 3, 4], desc: 'Kettenblitz springt auf mehrere Gegner.' },
  { id: 'laser',  li: 5, name: 'Club-Laser',      cost: 150, dmg: 18, range: 3.6, rate: 1.4,  col: '#FF2D95', kind: 'laser', n: [2, 3, 5], desc: 'Durchschlägt Gegner in einer Linie.' },
  { id: 'sniper', li: 8, name: 'Rock-Sniper',     cost: 130, dmg: 70, range: 6.5, rate: 0.42, col: '#FF5A3A', kind: 'proj', spd: 26, desc: 'Riesige Reichweite, harter Treffer.' },
  { id: 'cash',   li: 6, name: 'Werbe-Einnahmen', cost: 100, col: '#7CFF6A', kind: 'cash', inc: [20, 38, 65], desc: 'Bringt zu Beginn jeder Welle Geld.' },
  { id: 'boost',  li: 0, name: 'Verstärker',      cost: 120, col: '#C9B8FF', kind: 'boost', bon: [0.25, 0.4, 0.6], desc: 'Mehr Schaden für Türme in der Nähe.' }
];
export const ET = {
  static: { name: 'Rauschen',      hp: 30,  sp: 1.0,  rw: 4,   dm: 1, col: '#d0d8e8', sc: 0.5 },
  zip:    { name: 'Zipper',        hp: 20,  sp: 1.9,  rw: 4,   dm: 1, col: '#FFD24A', sc: 0.4 },
  block:  { name: 'Brummer',       hp: 130, sp: 0.7,  rw: 10,  dm: 2, col: '#9a6bff', sc: 0.72 },
  swarm:  { name: 'Knister',       hp: 9,   sp: 1.35, rw: 2,   dm: 1, col: '#ff7ac8', sc: 0.3 },
  boss:   { name: 'Boss-Rauschen', hp: 900, sp: 0.55, rw: 120, dm: 6, col: '#ff3a3a', sc: 1.0 }
};
export const TARGETS = ['Erster', 'Stärkster', 'Nächster'];
export const BOOST_RANGE = 1.9;
