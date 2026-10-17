import type { Season } from '../core/season';
import type { BuildingDef, Category, ModelSpec } from '../core/types';

const MIN = 60;

type Base = Omit<BuildingDef, 'cat' | 'needsRoad' | 'model'> & { model?: ModelSpec; needsRoad?: boolean };

function mk(cat: Category, needsRoad: boolean, b: Base & { model: ModelSpec }): BuildingDef {
  return { ...b, cat, needsRoad: b.needsRoad ?? needsRoad };
}

// ---------------------------------------------------------------- Wohnen (30)
type HouseRow = [string, string, number, number, number, number, number, number, number, ModelSpec];
// id, Name, Größe, Kosten, Level, Einwohner, Miete, Mietzeit (min), Bauzeit (min), Modell
const HOUSES: HouseRow[] = [
  ['gartenhaus', 'Gartenhäuschen', 2, 120, 1, 3, 18, 3, 0.5, { kind: 'house', color: '#f6e6c8', roof: 'gable', roofColor: '#d9573b', floors: 1, variant: 0 }],
  ['haus_rot', 'Häuschen Kirschrot', 2, 180, 1, 5, 25, 5, 1, { kind: 'house', color: '#f3d1c4', roof: 'gable', roofColor: '#c8322d', floors: 1, variant: 1 }],
  ['haus_blau', 'Häuschen Seeblau', 2, 180, 1, 5, 25, 5, 1, { kind: 'house', color: '#d5e5f3', roof: 'gable', roofColor: '#2f5f9e', floors: 1, variant: 1 }],
  ['haus_gelb', 'Häuschen Sonnengelb', 2, 200, 2, 5, 28, 5, 1, { kind: 'house', color: '#fbe8a6', roof: 'hip', roofColor: '#7a4f2e', floors: 1, variant: 2 }],
  ['bungalow', 'Bungalow Wiesengrund', 2, 260, 2, 6, 34, 8, 2, { kind: 'house', color: '#e9efe1', roof: 'flat', roofColor: '#7d8b6a', floors: 1, variant: 3 }],
  ['holzhaus', 'Holzhaus Tannenduft', 2, 300, 3, 6, 38, 10, 2, { kind: 'house', color: '#b77c4e', roof: 'gable', roofColor: '#5b3a24', floors: 1, variant: 4 }],
  ['fachwerk', 'Fachwerkhaus', 2, 380, 4, 8, 48, 12, 3, { kind: 'house', color: '#f7f0e2', roof: 'gable', roofColor: '#8e3b26', floors: 2, accent: '#6b4226', variant: 5 }],
  ['reihenhaus', 'Reihenhaus Lindenreihe', 2, 420, 4, 9, 52, 15, 3, { kind: 'house', color: '#e9c9a8', roof: 'gable', roofColor: '#4d4d57', floors: 2, variant: 6 }],
  ['doppelhaus', 'Doppelhaus Zwillinge', 2, 480, 5, 10, 60, 15, 4, { kind: 'house', color: '#dce8d0', roof: 'hip', roofColor: '#a3472e', floors: 2, variant: 7 }],
  ['landhaus', 'Landhaus Kornblume', 2, 560, 6, 11, 70, 20, 4, { kind: 'house', color: '#f2ead3', roof: 'hip', roofColor: '#3f6f8f', floors: 2, variant: 2 }],
  ['backstein', 'Backsteinhaus', 2, 640, 7, 12, 80, 25, 5, { kind: 'house', color: '#b5523b', roof: 'gable', roofColor: '#3b3b44', floors: 2, variant: 8 }],
  ['stadthaus', 'Stadthaus am Markt', 2, 760, 8, 14, 95, 30, 6, { kind: 'house', color: '#c9dff0', roof: 'flat', roofColor: '#56616e', floors: 3, variant: 9 }],
  ['strandhaus', 'Strandhaus Möwenblick', 2, 820, 9, 13, 105, 30, 6, { kind: 'house', color: '#ffffff', roof: 'shed', roofColor: '#2aa4c6', floors: 2, variant: 10 }],
  ['altbau', 'Altbau Rosengasse', 2, 900, 10, 16, 115, 40, 8, { kind: 'house', color: '#f1d8d8', roof: 'hip', roofColor: '#5d4037', floors: 3, variant: 11 }],
  ['mehrfamilien', 'Mehrfamilienhaus', 2, 1100, 11, 20, 140, 45, 10, { kind: 'tower', color: '#efe3cf', roof: 'gable', roofColor: '#9c3d2c', floors: 3, variant: 0 }],
  ['oekohaus', 'Ökohaus Grünes Dach', 2, 1200, 12, 18, 150, 45, 10, { kind: 'house', color: '#e8f1de', roof: 'flat', roofColor: '#5fa043', floors: 2, variant: 12 }],
  ['loft', 'Lofthaus Hafenkante', 2, 1400, 13, 22, 175, 60, 12, { kind: 'tower', color: '#9d6b56', roof: 'flat', roofColor: '#3b3b3b', floors: 3, variant: 1 }],
  ['studenten', 'Studentenwohnheim', 2, 1600, 14, 28, 190, 60, 15, { kind: 'tower', color: '#f3c66a', roof: 'flat', roofColor: '#6c5a3c', floors: 4, variant: 2 }],
  ['apartment', 'Apartmenthaus Sonnenhof', 2, 1900, 15, 30, 230, 75, 15, { kind: 'tower', color: '#dfe7ef', roof: 'flat', roofColor: '#4c5a6b', floors: 4, variant: 3 }],
  ['gruenderzeit', 'Gründerzeitvilla', 3, 2400, 16, 20, 300, 90, 20, { kind: 'villa', color: '#f4ecd8', roof: 'hip', roofColor: '#4c3f61', floors: 2, variant: 0 }],
  ['senioren', 'Seniorenresidenz Abendrot', 3, 2800, 17, 36, 320, 90, 20, { kind: 'tower', color: '#f6dcc3', roof: 'hip', roofColor: '#8b4a3a', floors: 3, variant: 4 }],
  ['wohnturm', 'Wohnturm Lichtblick', 2, 3200, 18, 42, 360, 120, 25, { kind: 'tower', color: '#bcd5e6', roof: 'flat', roofColor: '#2f4858', floors: 7, variant: 5 }],
  ['villa', 'Villa Seerose', 3, 3800, 20, 24, 460, 120, 30, { kind: 'villa', color: '#ffffff', roof: 'flat', roofColor: '#c9b28a', floors: 2, variant: 1 }],
  ['terrassen', 'Terrassenhaus', 3, 4300, 22, 48, 480, 150, 30, { kind: 'tower', color: '#e6d7c3', roof: 'flat', roofColor: '#6f8b5a', floors: 4, variant: 6 }],
  ['hochhaus', 'Hochhaus Stadtkrone', 3, 5200, 24, 70, 620, 180, 40, { kind: 'tower', color: '#d6dde4', roof: 'flat', roofColor: '#33414f', floors: 10, variant: 7 }],
  ['penthouse', 'Penthouse-Turm', 2, 6000, 26, 50, 700, 180, 45, { kind: 'tower', color: '#2c3e50', roof: 'flat', roofColor: '#c9a227', floors: 9, variant: 8 }],
  ['landvilla', 'Landvilla Weinberg', 3, 6500, 28, 30, 780, 240, 45, { kind: 'villa', color: '#f0e0c0', roof: 'hip', roofColor: '#a0442c', floors: 2, variant: 2 }],
  ['glasturm', 'Glasturm Horizont', 3, 8000, 30, 95, 900, 240, 60, { kind: 'tower', color: '#8fc3e3', roof: 'flat', roofColor: '#e9f2f7', floors: 14, variant: 9 }],
  ['schlossvilla', 'Schlossvilla Rosenhain', 4, 12000, 34, 60, 1400, 360, 90, { kind: 'villa', color: '#f7efe1', roof: 'dome', roofColor: '#3e6b8a', floors: 3, variant: 3 }],
  ['wolkenkratzer', 'Wolkenkratzer Rico-Tower', 4, 18000, 40, 160, 2000, 480, 120, { kind: 'tower', color: '#9fb4c7', roof: 'flat', roofColor: '#ffcf4a', floors: 20, variant: 10 }],
];

const residential = HOUSES.map(([id, name, s, cost, level, pop, rent, rentMin, buildMin, model]) =>
  mk('residential', true, {
    id, name, w: s, h: s, cost, level, pop, rent, rentTime: rentMin * MIN, buildTime: buildMin * MIN,
    xp: Math.round(cost / 40) + 2, model, desc: `${pop} Einwohner, ${rent} Münzen Miete alle ${rentMin} Min.`,
  }),
);

// ---------------------------------------------------------------- Gewerbe (18)
type ShopRow = [string, string, string, number, number, number, string[], number, number, number, number, string, string];
// id, Name, Schild, Größe, Kosten, Level, Waren, Waren je Lieferung, Verkaufszeit(min), Erlös, Mindest-Einwohner, Farbe, Markise
const SHOPS: ShopRow[] = [
  ['baeckerei', 'Bäckerei Goldkruste', '🥐', 2, 300, 1, ['mehl', 'kuchen'], 4, 3, 90, 0, '#f3d9b1', '#e56b2f'],
  ['minimarkt', 'Mini-Markt Ecke', '🛒', 2, 260, 1, ['gemuesekiste', 'salat', 'karotte', 'erdbeere', 'weizen'], 4, 2, 70, 0, '#e3f0f7', '#2e9d5b'],
  ['saftbar', 'Saftbar Frischkick', '🧃', 2, 420, 3, ['saft'], 4, 5, 150, 15, '#fff1c9', '#f39c12'],
  ['blumenladen', 'Blumenladen Blütezeit', '💐', 2, 520, 4, ['strauss'], 3, 6, 170, 25, '#fbe3ec', '#d94c8a'],
  ['pizzeria', 'Pizzeria Bella Rico', '🍕', 2, 700, 5, ['sosse', 'mehl'], 5, 10, 260, 35, '#fbe7d6', '#c0392b'],
  ['popcorn', 'Popcorn-Kiosk', '🍿', 2, 640, 6, ['popcorn'], 4, 8, 220, 40, '#fdf3d0', '#e74c3c'],
  ['pommes', 'Pommesbude Knusper', '🍟', 2, 760, 7, ['pommes'], 5, 10, 280, 50, '#fff4c4', '#d35400'],
  ['spielzeug', 'Spielzeugladen Kreisel', '🧸', 2, 980, 8, ['spielzeug'], 4, 20, 420, 60, '#e8e1fb', '#8e44ad'],
  ['buchladen', 'Buchhandlung Seitenwind', '📚', 2, 1100, 10, ['buecher'], 4, 25, 480, 80, '#efe6d5', '#2c3e50'],
  ['eisdiele', 'Eisdiele Kugelglück', '🍦', 2, 1250, 11, ['zucker', 'erdbeere'], 5, 15, 430, 90, '#e8f8f5', '#16a085'],
  ['boutique', 'Boutique Faden & Form', '👗', 2, 1500, 12, ['stoff'], 4, 30, 620, 110, '#f6e2f0', '#9b2f6f'],
  ['cafe', 'Café Bohnenglück', '☕', 2, 1700, 13, ['roestkaffee', 'kuchen'], 5, 30, 680, 130, '#efe0d0', '#6f4e37'],
  ['fischrest', 'Fischrestaurant Kombüse', '🐟', 3, 2200, 14, ['fisch', 'gewuerze'], 6, 45, 980, 160, '#dff1f7', '#1f6f9f'],
  ['chocolaterie', 'Chocolaterie Zartbitter', '🍫', 2, 2600, 17, ['schokolade'], 4, 40, 1050, 200, '#f1e1d3', '#5a2e1b'],
  ['feinkost', 'Feinkost Gaumenfreude', '🧀', 2, 3000, 18, ['gewuerze', 'sosse', 'gemuesekiste'], 6, 60, 1250, 240, '#f7f1dc', '#7f8c2d'],
  ['elektronik', 'Elektronik Funkwerk', '📱', 3, 4200, 20, ['elektronik'], 5, 90, 1900, 300, '#e1e9f2', '#2d6cdf'],
  ['moebelhaus', 'Möbelhaus Gemütlich', '🛋️', 3, 5000, 22, ['moebel'], 3, 120, 2400, 360, '#efe7da', '#a0522d'],
  ['kaufhaus', 'Kaufhaus Rico-Galerie', '🏬', 4, 9000, 26, ['spielzeug', 'buecher', 'elektronik', 'stoff', 'moebel', 'schokolade'], 8, 180, 4200, 500, '#f2efe9', '#c9a227'],
];

const business = SHOPS.map(([id, name, sign, s, cost, level, accepts, stockPer, saleMin, revenue, minPop, color, accent]) =>
  mk('business', true, {
    id, name, w: s, h: s, cost, level, accepts, stockPer, saleTime: saleMin * MIN, revenue, minPop,
    buildTime: Math.max(1, Math.round(cost / 200)) * MIN, xp: Math.round(cost / 30) + 3,
    model: { kind: 'shop', color, accent, sign, floors: s >= 3 ? 2 : 1, roof: s >= 4 ? 'flat' : 'gable', roofColor: accent },
    desc: `Verkauft ${stockPer} Waren in ${saleMin} Min. für ${revenue} Münzen. Ab ${minPop} Einwohnern.`,
  }),
);

// ---------------------------------------------------------------- Gemeinschaft (18) und Wahrzeichen (3)
type CivicRow = [string, string, number, number, number, number, number, number, Record<string, number> | undefined, ModelSpec];
// id, Name, Größe, Kosten, Level, Einwohnergrenze +, Zufriedenheit, Bauzeit(min), Material, Modell
const CIVIC: CivicRow[] = [
  ['schule', 'Grundschule Pusteblume', 3, 900, 3, 80, 4, 5, undefined, { kind: 'civic', color: '#f4d58d', roof: 'gable', roofColor: '#b5442a', floors: 2, sign: '🏫' }],
  ['polizei', 'Polizeiwache', 3, 1100, 4, 70, 3, 6, undefined, { kind: 'civic', color: '#d6e4f0', roof: 'flat', roofColor: '#1f4e89', floors: 2, sign: '🚓' }],
  ['feuerwehr', 'Feuerwache Florian', 3, 1200, 5, 70, 3, 6, undefined, { kind: 'civic', color: '#e8b4a8', roof: 'flat', roofColor: '#b3261e', floors: 2, sign: '🚒' }],
  ['post', 'Postamt Brieftaube', 2, 800, 6, 50, 2, 4, undefined, { kind: 'civic', color: '#fdf0b3', roof: 'hip', roofColor: '#e0a400', floors: 2, sign: '📮' }],
  ['parkamt', 'Parkverwaltung', 2, 700, 7, 40, 5, 4, undefined, { kind: 'civic', color: '#dcefd2', roof: 'gable', roofColor: '#3f7f3a', floors: 1, sign: '🌳' }],
  ['bibliothek', 'Stadtbibliothek', 3, 1600, 8, 90, 4, 10, { bretter: 4 }, { kind: 'civic', color: '#efe3d0', roof: 'hip', roofColor: '#5b4a3a', floors: 2, sign: '📖' }],
  ['marktplatz', 'Marktplatz', 3, 1400, 9, 70, 6, 8, undefined, { kind: 'plaza', color: '#d9c7a7', accent: '#e85d3f' }],
  ['sporthalle', 'Sporthalle Sprungfeder', 3, 2200, 11, 110, 4, 15, { bretter: 6, ziegel: 4 }, { kind: 'civic', color: '#cfe3f6', roof: 'dome', roofColor: '#3a7bd5', floors: 2, sign: '🏀' }],
  ['krankenhaus', 'Krankenhaus Lindenblick', 4, 3800, 13, 180, 6, 25, { ziegel: 10, glas: 6 }, { kind: 'civic', color: '#f7f9fb', roof: 'flat', roofColor: '#d23b3b', floors: 4, sign: '🏥' }],
  ['museum', 'Stadtmuseum', 4, 4200, 15, 160, 7, 30, { ziegel: 8, glas: 6, stahl: 4 }, { kind: 'civic', color: '#efe9dd', roof: 'dome', roofColor: '#8aa0a8', floors: 2, sign: '🏛️' }],
  ['theater', 'Theater am Brunnen', 4, 5000, 17, 170, 8, 30, { bretter: 10, stahl: 4 }, { kind: 'civic', color: '#e8c7c7', roof: 'dome', roofColor: '#8e2d3c', floors: 3, sign: '🎭' }],
  ['buehne', 'Konzertbühne Sternklang', 3, 3600, 18, 120, 8, 20, { bretter: 8, stahl: 4 }, { kind: 'stage', color: '#3b3b58', accent: '#ffcf4a' }],
  ['botanik', 'Botanischer Garten', 4, 5600, 20, 200, 10, 40, { glas: 12, bretter: 6 }, { kind: 'greenhouse', color: '#bfe8d8', accent: '#3c8d5a' }],
  ['zoo', 'Tierpark Wildwiese', 4, 7200, 23, 240, 10, 50, { bretter: 12, stahl: 6 }, { kind: 'zoo', color: '#cdbb8e', accent: '#6d8f3a' }],
  ['festhalle', 'Große Festhalle', 4, 8200, 25, 230, 9, 60, { ziegel: 14, glas: 8, stahl: 8 }, { kind: 'civic', color: '#f6e7c1', roof: 'dome', roofColor: '#c9a227', floors: 3, sign: '🎉' }],
  ['stadion', 'Stadion Ricoarena', 4, 12000, 28, 320, 10, 90, { stahl: 16, ziegel: 12, glas: 6 }, { kind: 'stadium', color: '#d9dde2', accent: '#2e86de' }],
  ['freizeitpark', 'Freizeitpark Wirbelwind', 4, 15000, 32, 300, 14, 120, { stahl: 18, bretter: 12 }, { kind: 'funpark', color: '#9fd27a', accent: '#ff5a7a' }],
  ['quartierzentrum', 'Quartierszentrum', 3, 2600, 12, 100, 6, 12, { bretter: 4, ziegel: 4 }, { kind: 'civic', color: '#e3e8d6', roof: 'gable', roofColor: '#6c7a3a', floors: 2, sign: '🏘️' }],
];

const community: BuildingDef[] = [
  mk('community', true, {
    id: 'rathaus', name: 'Rathaus', w: 3, h: 3, cost: 0, level: 99, buildTime: 0, xp: 0, popCap: 60, happiness: 5, max: 1,
    desc: 'Herz der Stadt. Erlaubt die ersten 60 Einwohner.',
    model: { kind: 'civic', color: '#f2eadb', roof: 'dome', roofColor: '#4f86b5', floors: 2, sign: '⭐' },
  }),
  ...CIVIC.map(([id, name, s, cost, level, popCap, happiness, buildMin, materials, model]) =>
    mk('community', true, {
      id, name, w: s, h: s, cost, level, popCap, happiness, materials, buildTime: buildMin * MIN,
      xp: Math.round(cost / 25) + 5, model,
      desc: `Erhöht die Einwohnergrenze um ${popCap}${materials ? ' – Großbau mit Materiallieferung' : ''}.`,
    }),
  ),
];

const special: BuildingDef[] = [
  mk('special', false, {
    id: 'leuchtturm', name: 'Leuchtturm Rico-Licht', w: 2, h: 2, cost: 3500, level: 14, buildTime: 20 * MIN, xp: 160,
    materials: { ziegel: 8, glas: 4 }, bonus: { rent: 0.1 }, max: 1, nearWater: true,
    desc: 'Wahrzeichen am Wasser: +10 % auf alle Mieten.', model: { kind: 'lighthouse', color: '#ffffff', accent: '#d63b3b' },
  }),
  mk('special', false, {
    id: 'riesenrad', name: 'Riesenrad Himmelsblick', w: 3, h: 3, cost: 6000, level: 19, buildTime: 40 * MIN, xp: 260,
    materials: { stahl: 12 }, bonus: { revenue: 0.1 }, max: 1,
    desc: 'Wahrzeichen: +10 % auf alle Geschäftserlöse.', model: { kind: 'wheel', color: '#f0f0f0', accent: '#ff6b9d' },
  }),
  mk('special', false, {
    id: 'uhrturm', name: 'Uhrturm am Ring', w: 2, h: 2, cost: 4500, level: 16, buildTime: 30 * MIN, xp: 200,
    materials: { ziegel: 10, stahl: 4 }, bonus: { xp: 0.1 }, max: 1,
    desc: 'Wahrzeichen: +10 % Erfahrung für alle Aktionen.', model: { kind: 'clocktower', color: '#e6d3b3', accent: '#2f4f6f' },
  }),
];

// ---------------------------------------------------------------- Farm, Produktion, Lager, Transport
const farm: BuildingDef[] = [
  mk('farm', false, {
    id: 'acker', name: 'Acker', w: 2, h: 2, cost: 40, level: 1, buildTime: 0, xp: 1,
    desc: 'Hier wachsen Feldfrüchte. Säen, warten, ernten.', model: { kind: 'plot' },
  }),
  mk('farm', false, {
    id: 'gewaechshaus', name: 'Gewächshaus-Beet', w: 2, h: 2, cost: 600, level: 15, buildTime: 2 * MIN, xp: 15, growFactor: 0.7,
    desc: 'Pflanzen wachsen hier 30 % schneller.', model: { kind: 'plot', variant: 1 },
  }),
];

type ProdRow = [string, string, string, number, number, number, string[], string, string];
const PROD: ProdRow[] = [
  ['muehle', 'Windmühle Mahlwerk', '🌾', 2, 250, 1, ['r_mehl'], '#f1e3c6', '#8e5b3a'],
  ['saftpresse', 'Saftpresse', '🧃', 2, 400, 3, ['r_saft_e', 'r_saft_t'], '#fff0c4', '#e67e22'],
  ['feinkueche', 'Feinkostküche', '🥫', 2, 520, 4, ['r_sosse', 'r_kiste'], '#f6e0d0', '#c0392b'],
  ['snackfabrik', 'Snackfabrik', '🍿', 2, 700, 5, ['r_popcorn', 'r_pommes'], '#fdf2c8', '#d35400'],
  ['gaertnerei', 'Gärtnerei Blütenwerk', '💐', 2, 650, 6, ['r_strauss'], '#e3f4dc', '#d94c8a'],
  ['saegewerk', 'Sägewerk Spanplatte', '🪚', 3, 900, 7, ['r_bretter'], '#d9b48a', '#6b4226'],
  ['zuckerfabrik', 'Zuckerfabrik', '🧂', 3, 1300, 10, ['r_zucker'], '#ecebf3', '#8e7cc3'],
  ['weberei', 'Weberei Spindel', '🧵', 3, 1500, 11, ['r_stoff'], '#f3e5f5', '#8e44ad'],
  ['backstube', 'Konditorei-Backstube', '🥧', 2, 1400, 12, ['r_kuchen'], '#fbe5cf', '#e67e22'],
  ['roesterei', 'Kaffeerösterei', '☕', 2, 1800, 16, ['r_kaffee'], '#e6d5c3', '#6f4e37'],
  ['suesswaren', 'Süßwarenfabrik', '🍫', 3, 2400, 19, ['r_schoko'], '#f3dfd2', '#5a2e1b'],
  ['moebelwerk', 'Möbelwerkstatt', '🪑', 3, 2800, 21, ['r_moebel'], '#ead8c0', '#a0522d'],
];
const production = PROD.map(([id, name, sign, s, cost, level, recipes, color, accent]) =>
  mk('production', false, {
    id, name, w: s, h: s, cost, level, recipes, buildTime: Math.max(1, Math.round(cost / 250)) * MIN, xp: Math.round(cost / 30) + 3,
    model: { kind: id === 'muehle' ? 'mill' : 'factory', color, accent, sign },
    desc: 'Verarbeitet Ernte zu Waren für Geschäfte.',
  }),
);

const storage: BuildingDef[] = [
  mk('storage', false, { id: 'scheune', name: 'Scheune', w: 2, h: 2, cost: 300, level: 2, buildTime: 2 * MIN, xp: 10, storage: 40, desc: '+40 Lagerplätze.', model: { kind: 'barn', color: '#b8322a', accent: '#ffffff' } }),
  mk('storage', false, { id: 'silo', name: 'Getreidesilo', w: 2, h: 2, cost: 900, level: 8, buildTime: 5 * MIN, xp: 30, storage: 80, desc: '+80 Lagerplätze.', model: { kind: 'silo', color: '#d6dbe0', accent: '#7f8c8d' } }),
  mk('storage', false, { id: 'lagerhaus', name: 'Lagerhaus Kontor', w: 3, h: 3, cost: 2600, level: 14, buildTime: 15 * MIN, xp: 80, storage: 180, desc: '+180 Lagerplätze.', model: { kind: 'factory', color: '#c7b299', accent: '#5d4037', sign: '📦' } }),
];

const transport: BuildingDef[] = [
  mk('transport', true, { id: 'bahnhof', name: 'Bahnhof Rico-Mitte', w: 4, h: 3, cost: 2500, level: 8, buildTime: 10 * MIN, xp: 100, station: 'rail', max: 1, materials: { bretter: 6 }, desc: 'Lieferaufträge per Zug: Holz, Ziegel, Spielzeug, Bücher, Stahl – oder Export.', model: { kind: 'station', color: '#e8d6b8', accent: '#8b3a2f' } }),
  mk('transport', false, { id: 'hafen', name: 'Hafen Möwenkai', w: 4, h: 3, cost: 6000, level: 15, buildTime: 20 * MIN, xp: 220, station: 'sea', max: 1, nearWater: true, materials: { bretter: 10, stahl: 4 }, desc: 'Frachter bringen Fisch, Gewürze, Glas und Holz. Muss am Wasser stehen.', model: { kind: 'harbor', color: '#c9b79c', accent: '#1f6f9f' } }),
  mk('transport', true, { id: 'flughafen', name: 'Flughafen Wolkenfeld', w: 6, h: 4, cost: 15000, level: 25, buildTime: 45 * MIN, xp: 500, station: 'air', max: 1, materials: { stahl: 14, glas: 10 }, desc: 'Luftfracht für Elektronik, Stahl und Spielzeug sowie lukrative Exporte.', model: { kind: 'airport', color: '#e4e8ec', accent: '#2e86de' } }),
];

// ---------------------------------------------------------------- Dekoration (60)
type DecoRow = [string, string, number, number, number, number, ModelSpec];
// id, Name, Größe, Kosten, Level, Attraktivität, Modell
const DECOS: DecoRow[] = [
  ['eiche', 'Eiche', 1, 30, 1, 2, { kind: 'tree', variant: 0, color: '#4f9a3a' }],
  ['birke', 'Birke', 1, 30, 1, 2, { kind: 'tree', variant: 1, color: '#8cc65a' }],
  ['tanne', 'Tanne', 1, 35, 1, 2, { kind: 'tree', variant: 2, color: '#2f6b3a' }],
  ['kirschbaum', 'Kirschblütenbaum', 1, 80, 3, 4, { kind: 'tree', variant: 3, color: '#f4a6c6' }],
  ['apfelbaum', 'Apfelbaum', 1, 70, 2, 3, { kind: 'tree', variant: 4, color: '#5aa83f' }],
  ['palme', 'Palme', 1, 120, 9, 4, { kind: 'tree', variant: 5, color: '#3c9c4a' }],
  ['ahorn', 'Ahorn im Herbst', 1, 90, 6, 3, { kind: 'tree', variant: 6, color: '#e0662c' }],
  ['zypresse', 'Zypresse', 1, 60, 4, 2, { kind: 'tree', variant: 7, color: '#3d7a45' }],
  ['tulpen_rot', 'Tulpenbeet Rot', 1, 25, 1, 2, { kind: 'flowers', color: '#e23d4b' }],
  ['tulpen_gelb', 'Tulpenbeet Gelb', 1, 25, 1, 2, { kind: 'flowers', color: '#ffd23f' }],
  ['rosen', 'Rosenbeet', 1, 45, 2, 3, { kind: 'flowers', color: '#c2185b' }],
  ['lavendel', 'Lavendelbeet', 1, 45, 3, 3, { kind: 'flowers', color: '#8e7cc3' }],
  ['margeriten', 'Margeritenwiese', 1, 35, 2, 2, { kind: 'flowers', color: '#ffffff' }],
  ['blumenkuebel', 'Blumenkübel', 1, 50, 4, 3, { kind: 'planter', color: '#ff8a5c' }],
  ['hecke', 'Hecke', 1, 20, 1, 1, { kind: 'hedge', color: '#3f8a3a' }],
  ['buchskugel', 'Buchsbaumkugel', 1, 40, 3, 2, { kind: 'topiary', color: '#3a7f35' }],
  ['bank', 'Parkbank', 1, 30, 1, 2, { kind: 'bench', color: '#8b5a2b' }],
  ['bank_weiss', 'Gartenbank Weiß', 1, 45, 4, 2, { kind: 'bench', color: '#f4f4f4' }],
  ['laterne', 'Straßenlaterne', 1, 35, 1, 2, { kind: 'lamp', color: '#2d3436' }],
  ['laterne_alt', 'Altstadtlaterne', 1, 60, 6, 3, { kind: 'lamp', color: '#1e5631', variant: 1 }],
  ['zaun_holz', 'Holzzaun', 1, 10, 1, 1, { kind: 'fence', color: '#a87444' }],
  ['zaun_weiss', 'Lattenzaun Weiß', 1, 15, 2, 1, { kind: 'fence', color: '#fafafa' }],
  ['brunnen', 'Zierbrunnen', 1, 180, 5, 6, { kind: 'fountain', color: '#cfd8dc' }],
  ['brunnen_gross', 'Großer Stadtbrunnen', 2, 650, 12, 14, { kind: 'fountain', color: '#e0d6c4', variant: 1 }],
  ['statue', 'Bronzestatue Gründerin', 1, 400, 10, 8, { kind: 'statue', color: '#b07d3e' }],
  ['skulptur', 'Moderne Skulptur', 1, 350, 13, 7, { kind: 'sculpture', color: '#ff6b6b' }],
  ['obelisk', 'Obelisk', 1, 500, 15, 9, { kind: 'obelisk', color: '#d7ccc8' }],
  ['spielplatz', 'Spielplatz Klettergerüst', 2, 400, 5, 10, { kind: 'playground', color: '#ff9f43' }],
  ['schaukel', 'Schaukel', 1, 120, 3, 4, { kind: 'swing', color: '#54a0ff' }],
  ['sandkasten', 'Sandkasten', 1, 90, 2, 3, { kind: 'sandbox', color: '#f6d58e' }],
  ['pavillon', 'Gartenpavillon', 2, 550, 8, 12, { kind: 'pavilion', color: '#ffffff', accent: '#4c8c4a' }],
  ['teich', 'Seerosenteich', 2, 480, 7, 11, { kind: 'pond', color: '#4fb3d9' }],
  ['fahnenmast', 'Fahnenmast', 1, 80, 3, 3, { kind: 'flag', color: '#ffcf4a' }],
  ['marktstand_rot', 'Marktstand Rot', 1, 110, 4, 4, { kind: 'stall', color: '#e74c3c' }],
  ['marktstand_blau', 'Marktstand Blau', 1, 110, 4, 4, { kind: 'stall', color: '#3498db' }],
  ['bushaltestelle', 'Bushaltestelle', 1, 90, 5, 3, { kind: 'busstop', color: '#2e86de' }],
  ['briefkasten', 'Briefkasten', 1, 25, 2, 1, { kind: 'mailbox', color: '#f1c40f' }],
  ['fahrradstaender', 'Fahrradständer', 1, 40, 4, 2, { kind: 'bikerack', color: '#7f8c8d' }],
  ['picknick', 'Picknicktisch', 1, 70, 3, 3, { kind: 'picnic', color: '#a0703c' }],
  ['eiswagen', 'Eiswagen', 1, 160, 8, 5, { kind: 'cart', color: '#ff9ff3' }],
  ['wuerstchen', 'Würstchenwagen', 1, 150, 7, 5, { kind: 'cart', color: '#feca57', variant: 1 }],
  ['sonnenschirm', 'Sonnenschirm', 1, 50, 5, 2, { kind: 'umbrella', color: '#ff6b6b' }],
  ['liegestuhl', 'Liegestuhl', 1, 45, 6, 2, { kind: 'deckchair', color: '#48dbfb' }],
  ['rosenbogen', 'Rosenbogen', 1, 140, 9, 5, { kind: 'arch', color: '#e84393' }],
  ['vogelbad', 'Vogeltränke', 1, 70, 4, 3, { kind: 'birdbath', color: '#dfe6e9' }],
  ['uhrsaeule', 'Uhrsäule', 1, 220, 11, 6, { kind: 'clockpost', color: '#2d3436' }],
  ['pflaster', 'Pflasterplatz', 1, 15, 1, 1, { kind: 'path', color: '#c9bfae' }],
  ['gartenweg', 'Gartenweg', 1, 10, 1, 1, { kind: 'path', color: '#d8c39a', variant: 1 }],
  ['kiesweg', 'Kiesweg', 1, 10, 2, 1, { kind: 'path', color: '#bdb6a8', variant: 2 }],
  ['schneemann', 'Schneemann (Winter)', 1, 90, 3, 4, { kind: 'snowman', color: '#ffffff' }],
  ['tannenbaum', 'Festtagsbaum (Winter)', 1, 160, 5, 6, { kind: 'xmastree', color: '#2f6b3a' }],
  ['kuerbisse', 'Kürbisstapel (Herbst)', 1, 70, 4, 3, { kind: 'pumpkins', color: '#f57b1f' }],
  ['laubhaufen', 'Laubhaufen (Herbst)', 1, 30, 2, 1, { kind: 'leaves', color: '#d35400' }],
  ['ostereier', 'Ostereier-Nest (Frühling)', 1, 80, 3, 3, { kind: 'eggs', color: '#a29bfe' }],
  ['blumenkarren', 'Blumenkarren (Frühling)', 1, 130, 6, 5, { kind: 'cart', color: '#55efc4', variant: 2 }],
  ['strandkorb', 'Strandkorb (Sommer)', 1, 140, 9, 5, { kind: 'beachchair', color: '#0abde3' }],
  ['ladesaeule', 'E-Ladesäule', 1, 150, 6, 4, { kind: 'charger', color: '#eceff1' }],
  ['rollerstation', 'E-Roller-Station', 1, 130, 7, 4, { kind: 'scooter', color: '#26a69a' }],
  ['windrad', 'Windrad', 1, 450, 10, 7, { kind: 'windturbine', color: '#f5f5f5' }],
  ['solarfeld', 'Solarfeld', 2, 700, 12, 12, { kind: 'solar', color: '#1e3a5f' }],
];
const decoration = DECOS.map(([id, name, s, cost, level, appeal, model]) =>
  mk('decoration', false, {
    id, name, w: s, h: s, cost, level, appeal, radius: s >= 2 ? 4 : 3, buildTime: 0, xp: Math.max(1, Math.round(cost / 30)), model,
    desc: `Attraktivität +${appeal} für Häuser und Geschäfte im Umkreis von ${s >= 2 ? 4 : 3} Feldern.`,
  }),
);
// Belohnungs-Deko der Saison-Events: erst nach dem Freischalten baubar, danach dauerhaft.
const EVENT_DECOS: [string, string, number, number, number, ModelSpec, Season][] = [
  ['maibaum', 'Maibaum', 1, 200, 9, { kind: 'maypole', color: '#ffffff' }, 'spring'],
  ['karussell', 'Sommerkarussell', 2, 600, 16, { kind: 'carousel', color: '#ff6b9d', accent: '#ffd54f' }, 'summer'],
  ['laternenbogen', 'Laternenbogen', 1, 250, 10, { kind: 'lanterns', color: '#5d4037' }, 'autumn'],
  ['eisbahn', 'Eisbahn', 2, 600, 16, { kind: 'rink', color: '#d6eef8' }, 'winter'],
];
const eventDecoration = EVENT_DECOS.map(([id, name, s, cost, appeal, model, event]) =>
  mk('decoration', false, {
    id, name, w: s, h: s, cost, level: 1, appeal, radius: s >= 2 ? 4 : 3, buildTime: 0, xp: Math.max(1, Math.round(cost / 30)), model, event,
    desc: `Event-Belohnung. Attraktivität +${appeal} im Umkreis von ${s >= 2 ? 4 : 3} Feldern.`,
  }),
);

export const BUILDINGS: BuildingDef[] = [
  ...residential,
  ...business,
  ...community,
  ...special,
  ...farm,
  ...production,
  ...storage,
  ...transport,
  ...decoration,
  ...eventDecoration,
];

export const BUILDING = new Map(BUILDINGS.map((b) => [b.id, b]));

export const CATEGORY_LABEL: Record<Category, string> = {
  residential: 'Wohnen',
  business: 'Gewerbe',
  farm: 'Bauernhof',
  community: 'Gemeinschaft',
  production: 'Produktion',
  storage: 'Lager',
  transport: 'Transport',
  decoration: 'Deko',
  special: 'Spezial',
};

export const ROAD_COST = 10;
