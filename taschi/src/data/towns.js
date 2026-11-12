// Eigenes Gesicht für jede Stadt: Platz-Mittelstück, Pflaster, Laternen,
// Deko rund um den Platz, Hausstil und der Ort, an dem der Champion wartet.
// Reine Daten – gebaut wird in engine/townstyle.js, Kollision in walkgrid.js.
//   centre: Mittelstück des Platzes (Kollisionsradius wie der alte Brunnen)
//   cobble: Grundfarbe von Pflaster und Platz
//   lamp:   iron | lantern | paper | torch | crystal | shell
//   decor:  Requisiten in den Beeten rund um den Platz
//   bunting: Wimpelkette zwischen den Laternen (Farben) oder null
//   house:  Hausstil (siehe engine/buildings.js › house)
//   venue:  Champion-Ort { kind, name, hill } – hill = Hügelhöhe darunter

export const TOWNS = [
  { centre: 'fountain', centreName: 'Brunnen', cobble: 0xbdb4a4, lamp: 'iron', decor: 'flowers', bunting: [0xf47a8a, 0xffd25a, 0x79be88], house: 'timber',
    venue: { kind: 'pavilion', name: 'Champion-Pavillon', hill: 4.5 } },
  { centre: 'anchor', centreName: 'Ankerdenkmal', cobble: 0xe6dcc6, lamp: 'shell', decor: 'harbour', bunting: [0x3d8bc1, 0xffffff, 0xff8f7a], house: 'plaster',
    venue: { kind: 'pier', name: 'Kapitänsdeck', hill: 1.2 } },
  { centre: 'coil', centreName: 'Blitzsäule', cobble: 0xb8b0a0, lamp: 'iron', decor: 'tech', bunting: [0xffe14d, 0x4b5b8f], house: 'timber',
    venue: { kind: 'tesla', name: 'Hochspannungsring', hill: 3 } },
  { centre: 'sakura', centreName: 'Alter Kirschbaum', cobble: 0xe2cfc2, lamp: 'paper', decor: 'blossom', bunting: null, house: 'pagoda',
    venue: { kind: 'torii', name: 'Kirschblütenschrein', hill: 4.5 } },
  { centre: 'stump', centreName: 'Ahnenstumpf', cobble: 0x9a8a72, lamp: 'lantern', decor: 'forest', bunting: [0xb6e05a, 0x7a5a3a], house: 'log',
    venue: { kind: 'totems', name: 'Lichtung der Ahnen', hill: 1.5 } },
  { centre: 'vane', centreName: 'Wetterfahne', cobble: 0xa9adb0, lamp: 'lantern', decor: 'wind', bunting: [0x9fd7ff, 0xffffff, 0x5c7da0], house: 'stone',
    venue: { kind: 'menhirs', name: 'Sturmkreis', hill: 7 } },
  { centre: 'brazier', centreName: 'Glutschale', cobble: 0x6a5a56, lamp: 'torch', decor: 'forge', bunting: null, house: 'basalt',
    venue: { kind: 'forge', name: 'Schmiedering', hill: 3 } },
  { centre: 'globe', centreName: 'Sternglobus', cobble: 0xc8c2d8, lamp: 'crystal', decor: 'stars', bunting: [0xfff0a0, 0x47407a], house: 'plaster',
    venue: { kind: 'orrery', name: 'Sternenplateau', hill: 4.5 } },
  { centre: 'well', centreName: 'Nebelbrunnen', cobble: 0x8a8672, lamp: 'lantern', decor: 'swamp', bunting: null, house: 'stilts',
    venue: { kind: 'stiltdeck', name: 'Laternensteg', hill: 0.6 } },
  { centre: 'icesculpt', centreName: 'Eisskulptur', cobble: 0xd6dde2, lamp: 'crystal', decor: 'snow', bunting: [0xbfe9ff, 0x3f5f80], house: 'snow',
    venue: { kind: 'icethrone', name: 'Eisthron', hill: 5 } },
  { centre: 'roots', centreName: 'Wurzelquelle', cobble: 0xa58e6a, lamp: 'lantern', decor: 'forest', bunting: [0xd6f07a, 0x5b8a3a], house: 'treehouse',
    venue: { kind: 'treetop', name: 'Wipfelbühne', hill: 2 } },
  { centre: 'thunderstone', centreName: 'Donnerstein', cobble: 0xd2b88c, lamp: 'torch', decor: 'market', bunting: [0xa8452f, 0xffd24a], house: 'hut',
    venue: { kind: 'colosseum', name: 'Steppenring', hill: 2 } },
  { centre: 'crystal', centreName: 'Glimmerkristall', cobble: 0xa8a4bc, lamp: 'crystal', decor: 'crystals', bunting: null, house: 'stone',
    venue: { kind: 'crystalcrown', name: 'Kristallkrone', hill: 6 } },
  { centre: 'moonpool', centreName: 'Mondbecken', cobble: 0xd8dae6, lamp: 'shell', decor: 'harbour', bunting: [0xe0e6ff, 0x3c4a7a], house: 'plaster',
    venue: { kind: 'moontemple', name: 'Mondtempel', hill: 3 } },
  { centre: 'sundisc', centreName: 'Sonnenobelisk', cobble: 0xe0b886, lamp: 'torch', decor: 'desert', bunting: [0xd85a2a, 0xffb83a, 0xffffff], house: 'adobe',
    venue: { kind: 'ziggurat', name: 'Sonnenterrasse', hill: 4.5 } },
  { centre: 'wings', centreName: 'Flügelstatue', cobble: 0xf2eef6, lamp: 'crystal', decor: 'sky', bunting: [0x3c5fa8, 0xffd27a, 0xffffff], house: 'dome',
    venue: { kind: 'cloudaltar', name: 'Wolkenaltar', hill: 3 } }
];

export const townOf = (r) => TOWNS[r] || TOWNS[0];
export const venueName = (r) => townOf(r).venue.name;

// Feste Teile der Champion-Orte in lokalen Koordinaten [dx, dz, r] (Vorderseite +z).
// Muss zu den Modellen in engine/townstyle.js passen; die Mitte bleibt frei.
const arc = (n, r, rad, from, to, skip = () => false) => Array.from({ length: n }, (_, k) => from + (n > 1 ? k / (n - 1) : 0) * (to - from)).filter(a => !skip(a)).map(a => [Math.sin(a) * r, Math.cos(a) * r, rad]);
const corners = (r, d = 4.2) => [[-d, -d, r], [d, -d, r], [-d, d, r], [d, d, r]];
const PI = Math.PI;
export const VENUE_SOLIDS = {
  pavilion: corners(0.6),
  pier: [[0, -4.4, 0.5], [-3, -3.4, 0.6], [3.8, -4.1, 0.9], [-5.4, 4.6, 0.3], [5.4, 4.6, 0.3], ...[-4.6, -2.3, 0, 2.3].flatMap(z => [[-5.4, z, 0.3], [5.4, z, 0.3]])],
  tesla: corners(1),
  torii: [[-2.8, 4.6, 0.4], [2.8, 4.6, 0.4], [-2.8, 2.2, 0.4], [2.8, 2.2, 0.4], [0, -4.3, 1.4], [-4.2, -2.6, 0.5], [4.2, -2.6, 0.5], [-4.4, -4.6, 0.5], [4.4, -4.6, 0.5]],
  totems: [...arc(5, 4.6, 0.6, PI - 1.24, PI + 1.24), [3.6, 3.2, 1.1]],
  menhirs: Array.from({ length: 10 }, (_, k) => k / 10 * PI * 2 + PI / 10).filter(a => Math.cos(a) <= 0.75).map(a => [Math.sin(a) * 5.1, Math.cos(a) * 5.1, 0.7]),
  forge: [...corners(0.9), [0, -4.1, 1.2]],
  orrery: corners(0.5),
  stiltdeck: [[-3, 4.6, 0.3], [3, 4.6, 0.3], [-4.2, -4.2, 0.3], [4.2, -4.2, 0.3], [-1, -4.4, 0.8], [1, -4.4, 0.8]],
  icethrone: [...arc(11, 5.1, 0.6, PI / 2, PI * 1.5), [0, -4.2, 1.4]],
  treetop: [[0, -5.4, 2.3], ...arc(10, 5.3, 0.25, PI * 0.2, PI * 1.8)],
  colosseum: [...arc(14, 6, 1.4, PI / 14, PI * 2 - PI / 14, a => Math.cos(a) > 0.8), [-4.2, 4.2, 0.3], [4.2, 4.2, 0.3], [-3, -4.8, 0.3], [3, -4.8, 0.3]],
  crystalcrown: [...arc(9, 5.1, 0.7, PI / 2 + 0.15, PI * 1.5 - 0.15), [0, -4.8, 1.4]],
  moontemple: [...arc(7, 5, 0.45, PI / 2, PI * 1.5), [0, -4.8, 0.4]],
  ziggurat: [[-2.6, -4.4, 0.8], [2.6, -4.4, 0.8], [-4.4, 4.2, 0.2], [4.4, 4.2, 0.2], [-4.4, -1, 0.2], [4.4, -1, 0.2]],
  cloudaltar: [[-3.6, -4.2, 0.9], [3.6, -4.2, 0.9]]
};
