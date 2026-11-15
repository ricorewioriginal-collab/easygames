// Blockregister: eine zentrale Liste aller Blöcke mit ihren Eigenschaften.
// Ids sind dauerhaft (stehen in Spielständen) – bestehende Ids nie ändern, neue nur hinten anhängen.
//
// Felder: id, key, name, cat (Kategorie), tiles [oben, Seite, unten] im Block-Atlas,
// solid (blockiert Bewegung), opaque (verdeckt Nachbarflächen), trans (durchsichtig, eigenes Mesh),
// self (gleiche Nachbarn zeigen Innenflächen, z. B. Blätter), emit (Eigenleuchten, 2 = Regenbogen),
// hard (Härte, Sekunden Grundabbauzeit), tool (passendes Werkzeug), color (Bruchstücke), map (Kartenfarbe),
// icon (Atlas-Kachel für Hotbar/Inventar), inv (im Inventar wählbar),
// shape ('cross' = Pflanze, 'flat' = Bodenplatte), tier (Mindeststufe der Spitzhacke, damit der Block im Überlebensmodus etwas abwirft), station (Werkbank/Ofen),
// drop (abgebauter Block gibt diese Id statt der eigenen, z. B. eingeschaltete Signalblöcke).
// Formblöcke (Etappe 9): shape 'slab' (Stufe, full = Block aus zwei Stufen), 'stair' (dir 0–3 = steigt nach −z, +x, +z, −x; eigene Id je Richtung),
// 'fence', 'wall', 'pane' (verbinden sich mit Nachbarn), 'door' (eigene Id für offen), 'ladder' (klebt an der Wand, man klettert). Geometrie: shapes.js

export const LOGO0 = 11, LOGO_COUNT = 16, SPECIAL0 = 27, SPECIAL_COUNT = 11;
export const LOGO_NAMES = ['RicoReWi', 'YourTime-FM', 'RapRadio 24', 'SchlagerPop 24', 'ChartRadio 24', 'ClubRadio 24', 'AnMaCha 24', 'RadioFloh!',
  'RockRadio 24', 'ChristmasRadio', 'KultRadio 24', 'Zocker-FM', 'Special-Radio', 'AnMaChaCast', 'SenderWelt', 'RadioPortal'];

export const CATS = [
  { id: 'natur', name: 'Natur' }, { id: 'erz', name: 'Erze & Steine' }, { id: 'bau', name: 'Bauen' },
  { id: 'form', name: 'Formen' }, { id: 'licht', name: 'Licht' }, { id: 'spezial', name: 'Spezial' }, { id: 'technik', name: 'Funktechnik' }, { id: 'funk', name: 'Funk-Logos' }
];

const DEF = [
  // id, key, name, cat, tiles, Eigenschaften
  [0, 'AIR', 'Luft', '', null, { solid: 0, opaque: 0, inv: 0 }],
  [1, 'GRASS', 'Gras', 'natur', [0, 1, 2], { hard: 0.6, tool: 'schaufel', color: 0x58a03c, map: [88, 160, 60], icon: 1 }],
  [2, 'DIRT', 'Erde', 'natur', [2, 2, 2], { hard: 0.5, tool: 'schaufel', color: 0x86603f, map: [134, 96, 63], icon: 2 }],
  [3, 'STONE', 'Stein', 'erz', [3, 3, 3], { hard: 1.5, tool: 'spitzhacke', color: 0x7c7c80, map: [124, 124, 128], icon: 3 }],
  [4, 'SAND', 'Sand', 'natur', [4, 4, 4], { hard: 0.5, tool: 'schaufel', color: 0xdbcb8e, map: [219, 203, 142], icon: 4 }],
  [5, 'WOOD', 'Holz', 'natur', [6, 5, 6], { hard: 1.0, tool: 'axt', color: 0x68502e, map: [104, 80, 46], icon: 5 }],
  [6, 'LEAVES', 'Blätter', 'natur', [7, 7, 7], { opaque: 0, self: 1, hard: 0.2, color: 0x3a8030, map: [46, 120, 44], icon: 7 }],
  [7, 'PLANKS', 'Bretter', 'bau', [8, 8, 8], { hard: 1.0, tool: 'axt', color: 0xac8652, map: [172, 134, 82], icon: 8 }],
  [8, 'GLASS', 'Glas', 'bau', [9, 9, 9], { opaque: 0, trans: 1, hard: 0.3, color: 0xcfe8f0, map: [200, 230, 240], icon: 9 }],
  [9, 'LAMP', 'Leuchtblock', 'licht', [10, 10, 10], { emit: 1, hard: 0.3, color: 0xffd87a, map: [255, 214, 120], icon: 10 }],
  [10, 'WATER', 'Wasser', '', [11, 11, 11], { solid: 0, opaque: 0, trans: 1, inv: 0, map: [44, 100, 200] }],
  // 11..26: Funk-Logos (siehe unten)
  [27, 'FEDER', 'Federblock', 'spezial', [12, 13, 13], { hard: 0.5, color: 0xff6aa0, map: [255, 100, 160], icon: 12 }],
  [28, 'TURBO', 'Turbo-Block', 'spezial', [14, 15, 15], { hard: 0.8, color: 0xffd628, map: [255, 214, 40], icon: 14 }],
  [29, 'WIND', 'Aufwind-Block', 'spezial', [16, 17, 17], { hard: 0.5, color: 0x50c8ee, map: [80, 200, 235], icon: 16 }],
  [30, 'RADIO', 'Radio-Block', 'spezial', [19, 18, 19], { hard: 0.5, color: 0x3a3e4a, map: [60, 64, 76], icon: 18 }],
  [31, 'RAINBOW', 'Regenbogen-Block', 'licht', [20, 20, 20], { emit: 2, hard: 0.5, color: 0xdd66ff, map: [220, 100, 255], icon: 20 }],
  [32, 'NEON_R', 'Neonrot', 'licht', [21, 21, 21], { emit: 1, hard: 0.3, color: 0xff2846, map: [255, 40, 70], icon: 21 }],
  [33, 'NEON_B', 'Neonblau', 'licht', [22, 22, 22], { emit: 1, hard: 0.3, color: 0x288cff, map: [40, 140, 255], icon: 22 }],
  [34, 'NEON_G', 'Neongrün', 'licht', [23, 23, 23], { emit: 1, hard: 0.3, color: 0x32ff78, map: [50, 255, 120], icon: 23 }],
  [35, 'NEON_P', 'Neonlila', 'licht', [24, 24, 24], { emit: 1, hard: 0.3, color: 0xbe46ff, map: [190, 70, 255], icon: 24 }],
  [36, 'BRICK', 'Ziegel', 'bau', [25, 25, 25], { hard: 1.5, tool: 'spitzhacke', color: 0x9a4a38, map: [154, 74, 56], icon: 25 }],
  [37, 'MARBLE', 'Marmor', 'bau', [26, 26, 26], { hard: 1.5, tool: 'spitzhacke', color: 0xe6e6ee, map: [232, 232, 240], icon: 26 }],
  // ab 38: Biome, Höhlen, Erze (Welt-Generator 2)
  [38, 'SNOW', 'Schnee', 'natur', [27, 28, 2], { hard: 0.4, tool: 'schaufel', color: 0xf2f6fa, map: [240, 246, 250], icon: 27 }],
  [39, 'ICE', 'Eis', 'natur', [29, 29, 29], { hard: 0.6, tool: 'spitzhacke', color: 0xa8d4f0, map: [168, 212, 240], icon: 29 }],
  [40, 'GRAVEL', 'Kies', 'erz', [30, 30, 30], { hard: 0.6, tool: 'schaufel', color: 0x8a8682, map: [138, 134, 130], icon: 30 }],
  [41, 'CLAY', 'Ton', 'natur', [31, 31, 31], { hard: 0.6, tool: 'schaufel', color: 0x9aa4b4, map: [154, 164, 180], icon: 31 }],
  [42, 'SPRUCE', 'Fichtenholz', 'natur', [33, 32, 33], { hard: 1.0, tool: 'axt', color: 0x4a3420, map: [74, 52, 32], icon: 32 }],
  [43, 'NEEDLES', 'Fichtennadeln', 'natur', [34, 34, 34], { opaque: 0, self: 1, hard: 0.2, color: 0x2a5a36, map: [36, 84, 50], icon: 34 }],
  [44, 'CACTUS', 'Kaktus', 'natur', [36, 35, 36], { hard: 0.4, color: 0x3c8a3a, map: [60, 138, 58], icon: 35 }],
  [45, 'COAL', 'Kohleerz', 'erz', [37, 37, 37], { hard: 2.0, tool: 'spitzhacke', color: 0x3a3a40, map: [70, 70, 78], icon: 37, tier: 1 }],
  [46, 'COPPER', 'Kupfererz', 'erz', [38, 38, 38], { hard: 2.2, tool: 'spitzhacke', color: 0xc8743c, map: [200, 116, 60], icon: 38, tier: 1 }],
  [47, 'IRON', 'Eisenerz', 'erz', [39, 39, 39], { hard: 2.6, tool: 'spitzhacke', color: 0xc8a888, map: [200, 168, 136], icon: 39, tier: 2 }],
  [48, 'CRYSTAL', 'Funkkristall', 'erz', [40, 40, 40], { emit: 1, hard: 2.4, tool: 'spitzhacke', color: 0x6ae8ff, map: [106, 232, 255], icon: 40, tier: 2 }],
  [49, 'MUD', 'Schlamm', 'natur', [41, 41, 41], { hard: 0.5, tool: 'schaufel', color: 0x4e4234, map: [78, 66, 52], icon: 41 }],
  [50, 'FLOWERS', 'Blütenwiese', 'natur', [42, 1, 2], { hard: 0.6, tool: 'schaufel', color: 0x6ab04a, map: [150, 170, 90], icon: 42 }],
  [51, 'BASALT', 'Basalt', 'erz', [43, 43, 43], { hard: 1.8, tool: 'spitzhacke', color: 0x34343a, map: [52, 52, 58], icon: 43 }],
  [52, 'MAGMA', 'Magma', 'erz', [44, 44, 44], { emit: 1, hard: 1.2, tool: 'spitzhacke', color: 0xff6a1a, map: [255, 106, 26], icon: 44 }],
  [53, 'SHROOM', 'Pilzhut', 'natur', [45, 45, 45], { hard: 0.3, color: 0xc83a3a, map: [200, 58, 58], icon: 45 }],
  [54, 'MYCEL', 'Pilzboden', 'natur', [46, 47, 2], { hard: 0.6, tool: 'schaufel', color: 0x7a6a80, map: [122, 106, 128], icon: 46 }],
  [55, 'SANDSTONE', 'Sandstein', 'bau', [48, 48, 48], { hard: 1.2, tool: 'spitzhacke', color: 0xd8c08a, map: [216, 192, 138], icon: 48 }],
  [56, 'STEM', 'Pilzstiel', 'natur', [49, 49, 49], { hard: 0.6, tool: 'axt', color: 0xe8e0d0, map: [232, 224, 208], icon: 49 }],
  [57, 'JLEAVES', 'Dschungelblätter', 'natur', [50, 50, 50], { opaque: 0, self: 1, hard: 0.2, color: 0x2e8a24, map: [40, 130, 34], icon: 50 }],
  // ab 58: Überleben (Stationen, Tierprodukte)
  [58, 'WORKBENCH', 'Werkbank', 'bau', [51, 52, 8], { hard: 1.2, tool: 'axt', color: 0x9a7444, map: [150, 112, 66], icon: 51, station: 'werkbank' }],
  [59, 'FURNACE', 'Schmelzofen', 'bau', [54, 53, 54], { hard: 2.0, tool: 'spitzhacke', color: 0x6a6a70, map: [110, 110, 116], icon: 53, station: 'ofen' }],
  [60, 'WOOL', 'Wolle', 'bau', [55, 55, 55], { hard: 0.4, color: 0xeeeae2, map: [236, 232, 224], icon: 55 }],
  // ab 61: Landwirtschaft (Pflanzen sind Kreuz-Modelle, nicht fest, nicht im Inventar)
  [61, 'FARMLAND', 'Ackerboden', 'natur', [56, 2, 2], { hard: 0.5, tool: 'schaufel', color: 0x5a3e26, map: [96, 66, 40], icon: 56 }],
  [62, 'WHEAT0', 'Weizen (Keim)', '', [57, 57, 57], { shape: 'cross', solid: 0, opaque: 0, inv: 0, hard: 0, color: 0x6ab040, map: [100, 150, 60] }],
  [63, 'WHEAT1', 'Weizen (jung)', '', [58, 58, 58], { shape: 'cross', solid: 0, opaque: 0, inv: 0, hard: 0, color: 0x7ab440, map: [110, 160, 60] }],
  [64, 'WHEAT2', 'Weizen (grün)', '', [59, 59, 59], { shape: 'cross', solid: 0, opaque: 0, inv: 0, hard: 0, color: 0xa0b040, map: [150, 170, 60] }],
  [65, 'WHEAT3', 'Weizen (reif)', '', [60, 60, 60], { shape: 'cross', solid: 0, opaque: 0, inv: 0, hard: 0, color: 0xd8b850, map: [216, 184, 80] }],
  // ab 66: Dörfer und Minen (Generator 3)
  [66, 'PATH', 'Dorfweg', 'bau', [61, 2, 2], { hard: 0.5, tool: 'schaufel', color: 0x9a8662, map: [150, 132, 100], icon: 61 }],
  [67, 'COBBLE', 'Bruchstein', 'bau', [62, 62, 62], { hard: 1.6, tool: 'spitzhacke', color: 0x808086, map: [120, 120, 126], icon: 62 }],
  // ab 68: Funktechnik und Signale (Zustand „an“ ist eine eigene Id, wirft aber den Grundblock ab)
  [68, 'SWITCH', 'Schalter', 'technik', [63, 63, 63], { hard: 0.5, color: 0x8a8a90, map: [140, 140, 146], icon: 63 }],
  [69, 'SWITCH_ON', 'Schalter (an)', '', [64, 64, 64], { hard: 0.5, color: 0x8a8a90, map: [140, 160, 146], inv: 0, drop: 68 }],
  [70, 'WIRE', 'Signalleitung', 'technik', [65, 65, 65], { hard: 0.5, color: 0xd8803c, map: [200, 120, 60], icon: 65 }],
  [71, 'SENDER', 'Funksender', 'technik', [66, 67, 62], { hard: 0.8, color: 0x3a3e4a, map: [80, 200, 240], icon: 67 }],
  [72, 'RELAY', 'Funkrelais', 'technik', [68, 68, 68], { hard: 0.8, color: 0x4a4e5a, map: [110, 200, 230], icon: 68 }],
  [73, 'RECEIVER', 'Empfänger', 'technik', [69, 69, 69], { hard: 0.8, color: 0x30343e, map: [70, 74, 86], icon: 69 }],
  [74, 'RECEIVER_ON', 'Empfänger (an)', '', [70, 70, 70], { hard: 0.8, color: 0x30343e, map: [90, 230, 140], inv: 0, drop: 73, emit: 1 }],
  [75, 'SIGLAMP', 'Signallampe', 'technik', [71, 71, 71], { hard: 0.3, color: 0x6a5a40, map: [110, 92, 66], icon: 71 }],
  [76, 'SIGLAMP_ON', 'Signallampe (an)', '', [72, 72, 72], { hard: 0.3, color: 0xffd87a, map: [255, 220, 120], inv: 0, drop: 75, emit: 1 }],
  [77, 'GATE', 'Funktor', 'technik', [73, 73, 73], { hard: 2.0, tool: 'spitzhacke', color: 0xb4b6be, map: [170, 172, 180], icon: 73 }],
  [78, 'GATE_OPEN', 'Funktor (offen)', '', [74, 74, 74], { solid: 0, opaque: 0, hard: 2.0, tool: 'spitzhacke', color: 0xb4b6be, map: [130, 132, 140], inv: 0, drop: 77 }],
  // ab 79: Fahrzeuge (Schiene ist eine flache Platte auf dem Block darunter)
  [79, 'RAIL', 'Schiene', 'technik', [75, 75, 75], { shape: 'flat', solid: 0, opaque: 0, hard: 0.4, color: 0x8a7a6a, map: [140, 120, 100], icon: 75 }]
];
// ab 80: Modernisierung (Etappe 9) – neue Baustoffe, Licht, Beton, Buntglas
DEF.push(
  [80, 'STONEBRICK', 'Steinziegel', 'bau', [76, 76, 76], { hard: 1.5, tool: 'spitzhacke', color: 0x8a8c92, map: [138, 140, 146], icon: 76 }],
  [81, 'SMOOTH', 'Glattstein', 'bau', [77, 77, 77], { hard: 1.5, tool: 'spitzhacke', color: 0xa4a6ac, map: [164, 166, 172], icon: 77 }],
  [82, 'DARKPLANKS', 'Dunkle Bretter', 'bau', [78, 78, 78], { hard: 1.0, tool: 'axt', color: 0x563a24, map: [86, 58, 36], icon: 78 }],
  [83, 'BIRCH', 'Birkenbretter', 'bau', [79, 79, 79], { hard: 1.0, tool: 'axt', color: 0xd8c08e, map: [216, 192, 142], icon: 79 }],
  [84, 'ROOF', 'Dachziegel', 'bau', [80, 80, 80], { hard: 1.2, tool: 'spitzhacke', color: 0xa84a36, map: [168, 74, 54], icon: 80 }],
  [85, 'BOOKS', 'Bücherregal', 'bau', [8, 81, 8], { hard: 1.0, tool: 'axt', color: 0x8a5a34, map: [138, 90, 52], icon: 81 }],
  [86, 'LANTERN', 'Laterne', 'licht', [82, 82, 82], { emit: 1, hard: 0.5, color: 0xffcc66, map: [255, 204, 102], icon: 82 }],
  [87, 'COPPERBLOCK', 'Kupferblock', 'bau', [83, 83, 83], { hard: 2.0, tool: 'spitzhacke', color: 0xc8743c, map: [210, 124, 72], icon: 83 }],
  [88, 'IRONBLOCK', 'Eisenblock', 'bau', [84, 84, 84], { hard: 2.4, tool: 'spitzhacke', color: 0xc8cad2, map: [200, 202, 210], icon: 84 }],
  [89, 'HAY', 'Strohballen', 'natur', [86, 85, 86], { hard: 0.4, color: 0xd8b450, map: [216, 180, 80], icon: 85 }]
);
['weiß', 'schwarz', 'rot', 'orange', 'gelb', 'grün', 'blau', 'lila'].forEach((n, k) => {
  const c = [[236, 238, 240], [36, 38, 44], [190, 44, 44], [232, 120, 30], [240, 200, 40], [70, 160, 60], [40, 90, 190], [130, 60, 180]][k];
  DEF.push([90 + k, 'CONCRETE' + k, 'Beton ' + n, 'bau', [87 + k, 87 + k, 87 + k], { hard: 1.4, tool: 'spitzhacke', color: (c[0] << 16) | (c[1] << 8) | c[2], map: c, icon: 87 + k }]);
});
['rot', 'blau', 'grün'].forEach((n, k) => {
  const c = [[220, 60, 70], [70, 120, 230], [70, 200, 110]][k];
  DEF.push([98 + k, 'STAINED' + k, 'Buntglas ' + n, 'bau', [95 + k, 95 + k, 95 + k], { trans: 1, hard: 0.3, color: (c[0] << 16) | (c[1] << 8) | c[2], map: c, icon: 95 + k }]);
});
// Stufen (101–108) und Treppen (109–140, je Material 4 Richtungen) aus diesen Baustoffen
export const FORM_MATS = [['PLANKS', 'Bretter', 7, 8], ['COBBLE', 'Bruchstein', 67, 62], ['BRICK', 'Ziegel', 36, 25], ['STONEBRICK', 'Steinziegel', 80, 76],
  ['SANDSTONE', 'Sandstein', 55, 48], ['MARBLE', 'Marmor', 37, 26], ['DARKPLANKS', 'Dunkle Bretter', 82, 78], ['SMOOTH', 'Glattstein', 81, 77]];
const matOf = id => DEF.find(d => d[0] === id)[5];
FORM_MATS.forEach(([k, n, full, tile], i) => {
  const m = matOf(full), base = { hard: m.hard, tool: m.tool, color: m.color, map: m.map, opaque: 0, icon: tile };
  DEF.push([101 + i, k + '_SLAB', n + '-Stufe', 'form', [tile, tile, tile], { ...base, shape: 'slab', full }]);
  for (let d = 0; d < 4; d++) DEF.push([109 + i * 4 + d, k + '_STAIRS' + (d ? d : ''), n + '-Treppe', d ? '' : 'form', [tile, tile, tile],
    { ...base, shape: 'stair', dir: d, inv: d ? 0 : 1, drop: d ? 109 + i * 4 : 0 }]);
});
DEF.push(
  [141, 'FENCE', 'Holzzaun', 'form', [8, 8, 8], { shape: 'fence', opaque: 0, hard: 1.0, tool: 'axt', color: 0xac8652, map: [172, 134, 82], icon: 8 }],
  [142, 'WALL', 'Steinmauer', 'form', [62, 62, 62], { shape: 'wall', opaque: 0, hard: 1.6, tool: 'spitzhacke', color: 0x808086, map: [120, 120, 126], icon: 62 }],
  [143, 'PANE', 'Glasscheibe', 'form', [9, 9, 9], { shape: 'pane', trans: 1, hard: 0.3, color: 0xcfe8f0, map: [200, 230, 240], icon: 9 }],
  [144, 'DOOR', 'Holztür', 'form', [8, 98, 8], { shape: 'door', opaque: 0, hard: 1.0, tool: 'axt', color: 0x9a6a3c, map: [154, 106, 60], icon: 98 }],
  [145, 'DOOR_OPEN', 'Holztür (offen)', '', [8, 98, 8], { shape: 'door', opaque: 0, solid: 0, hard: 1.0, tool: 'axt', color: 0x9a6a3c, map: [154, 106, 60], inv: 0, drop: 144 }],
  [146, 'LADDER', 'Leiter', 'form', [99, 99, 99], { shape: 'ladder', opaque: 0, solid: 0, hard: 0.4, tool: 'axt', color: 0x8a6034, map: [138, 96, 52], icon: 99 }]
);
for (let i = 0; i < LOGO_COUNT; i++) DEF.push([LOGO0 + i, 'LOGO' + (i + 1), LOGO_NAMES[i], 'funk', null, { logo: 1, hard: 0.5, color: 0x1a2040, map: [60, 70, 110] }]);
DEF.sort((a, b) => a[0] - b[0]);

export const MAX_ID = 256;
export const BLOCKS = [];          // Block-Objekte nach Id (Lücken = undefined)
export const B = {};               // Name -> Id
export const NAMES = [];
export const SOLID = new Uint8Array(MAX_ID);
export const OPAQUE = new Uint8Array(MAX_ID);
export const SKYBLOCK = new Uint8Array(MAX_ID); // wirft Schatten (Himmelslicht)
export const EMIT = new Float32Array(MAX_ID);
export const TRANS = new Uint8Array(MAX_ID);
export const SELF = new Uint8Array(MAX_ID);
export const CROSS = new Uint8Array(MAX_ID); // Pflanzen: zwei gekreuzte Flächen statt Würfel
export const FLAT = new Uint8Array(MAX_ID);  // flache Platte am Boden (Schiene)
export const SHAPE_KINDS = ['', 'slab', 'stair', 'fence', 'wall', 'pane', 'door', 'ladder'];
export const SHAPE = new Uint8Array(MAX_ID); // Formblock-Art (Index in SHAPE_KINDS), 0 = Würfel/Pflanze/Platte
export const TILES = {};

for (const [id, key, name, cat, tiles, p] of DEF) {
  if (BLOCKS[id]) throw new Error('Block-Id doppelt: ' + id);
  const b = { id, key, name, cat, tiles, solid: 1, opaque: 1, trans: 0, self: 0, emit: 0, hard: 1, tool: null, color: 0xdddddd, map: [200, 200, 210], icon: 0, inv: 1, logo: 0, station: null, tier: 0, shape: null, drop: 0, dir: 0, full: 0, ...p };
  if (b.trans) b.opaque = 0;
  BLOCKS[id] = b; B[key] = id; NAMES[id] = name;
  SOLID[id] = b.solid; OPAQUE[id] = b.opaque; TRANS[id] = b.trans; SELF[id] = b.self; EMIT[id] = b.emit; CROSS[id] = b.shape === 'cross' ? 1 : 0; FLAT[id] = b.shape === 'flat' ? 1 : 0;
  SHAPE[id] = Math.max(0, SHAPE_KINDS.indexOf(b.shape || ''));
  SKYBLOCK[id] = b.opaque || b.self ? 1 : 0;
  if (tiles) TILES[id] = tiles;
}
export const isLogo = t => t >= LOGO0 && t < LOGO0 + LOGO_COUNT;
export const SPECIAL_NAMES = NAMES.slice(SPECIAL0, SPECIAL0 + SPECIAL_COUNT);
// alle wählbaren Blöcke in Anzeige-Reihenfolge
export const INV_BLOCKS = BLOCKS.filter(b => b && b.inv).map(b => b.id);
// Treppe in Blickrichtung: Grund-Id (Richtung 0) + Richtung aus dem Blickwinkel (steigt vom Spieler weg)
export function stairFor(base, yaw) {
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw), d = Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 1 : 3) : (fz > 0 ? 2 : 0);
  return base + d;
}
export const CROPS = [B.WHEAT0, B.WHEAT1, B.WHEAT2, B.WHEAT3]; // Wachstumsstufen
