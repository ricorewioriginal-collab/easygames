// Attack catalogue. The nine IDs from version 1 (stoss, hieb, funken, glut,
// ranke, spritzer, fluegel, stein, spuk) are kept so stored AP stay valid.
// kind: 'phys' deals damage, 'status' only applies its effect.
// effect fields: status+chance, stat/stages/target, heal, drain, recoil, priority, crit.
const M = (id, name, type, power, acc, pp, fx, extra = {}) => ({ id, name, type, power, acc, pp, fx, kind: power > 0 ? 'phys' : 'status', ...extra });

const LIST = [
  // normal
  M('stoss', 'Kugelstoß', 'normal', 40, 1, 35, 'impact', { desc: 'Ein schneller Rempler.' }),
  M('hieb', 'Wirbelhieb', 'normal', 65, 0.95, 20, 'slash', { desc: 'Ein kreisender Schlag mit voller Kraft.' }),
  M('blitzsprung', 'Blitzsprung', 'normal', 40, 1, 25, 'impact', { priority: 1, desc: 'Greift immer zuerst an.' }),
  M('ansturm', 'Ansturm', 'normal', 90, 0.9, 12, 'impact', { recoil: 0.25, desc: 'Wuchtiger Angriff, der den Anwender selbst trifft.' }),
  M('bruellen', 'Brüllen', 'normal', 0, 1, 25, 'debuff', { stat: 'atk', stages: -1, target: 'foe', desc: 'Senkt den Angriff des Gegners.' }),
  M('konzentration', 'Konzentration', 'normal', 0, 1, 15, 'buff', { stat: 'atk', stages: 2, target: 'self', desc: 'Erhöht den eigenen Angriff stark.' }),
  M('heilgesang', 'Heilgesang', 'normal', 0, 1, 10, 'heal', { heal: 0.5, target: 'self', desc: 'Stellt die Hälfte der KP wieder her.' }),
  M('verzweiflung', 'Verzweiflung', 'normal', 50, 1, 99, 'impact', { recoil: 0.25, hidden: true, desc: 'Letzter Ausweg, wenn keine AP mehr übrig sind.' }),
  M('krallenfinte', 'Krallenfinte', 'normal', 60, 1, 20, 'slash', { crit: 0.25, desc: 'Täuschende Kralle mit hoher Volltrefferquote.' }),
  // feuer
  M('glut', 'Glutfunken', 'feuer', 45, 1, 25, 'flame', { status: 'brand', chance: 0.1, desc: 'Funken, die verbrennen können.' }),
  M('flammenrad', 'Flammenrad', 'feuer', 65, 0.95, 20, 'flame', { status: 'brand', chance: 0.1 }),
  M('feuersturm', 'Feuersturm', 'feuer', 90, 0.85, 10, 'flame', { status: 'brand', chance: 0.2 }),
  M('aufheizen', 'Aufheizen', 'feuer', 0, 1, 20, 'buff', { stat: 'atk', stages: 1, target: 'self' }),
  M('sonnenflamme', 'Sonnenflamme', 'feuer', 110, 0.9, 5, 'beam', { status: 'brand', chance: 0.3, desc: 'Uraltes Licht der Sonnenhöhe.' }),
  // wasser
  M('spritzer', 'Wasserperlen', 'wasser', 45, 1, 25, 'water'),
  M('gischtwelle', 'Gischtwelle', 'wasser', 65, 0.95, 20, 'water'),
  M('flutstrahl', 'Flutstrahl', 'wasser', 90, 0.85, 10, 'water'),
  M('schaumschild', 'Schaumschild', 'wasser', 0, 1, 20, 'buff', { stat: 'def', stages: 2, target: 'self' }),
  M('tiefenruf', 'Tiefenruf', 'wasser', 105, 0.9, 5, 'water', { heal: 0.2, target: 'self', desc: 'Ein Lied aus der Tiefe, das zugleich heilt.' }),
  // pflanze
  M('ranke', 'Rankenhieb', 'pflanze', 45, 1, 25, 'leaf'),
  M('blattwirbel', 'Blattwirbel', 'pflanze', 65, 0.95, 20, 'leaf'),
  M('saugwurzel', 'Saugwurzel', 'pflanze', 60, 1, 15, 'leaf', { drain: 0.5, desc: 'Entzieht KP und heilt den Anwender.' }),
  M('sporenwolke', 'Sporenwolke', 'pflanze', 0, 0.75, 15, 'debuff', { status: 'schlaf', chance: 1, target: 'foe' }),
  M('bluetensturm', 'Blütensturm', 'pflanze', 90, 0.9, 10, 'leaf'),
  // elektro
  M('funken', 'Funkenschlag', 'elektro', 45, 1, 25, 'spark', { status: 'paralyse', chance: 0.1 }),
  M('donnerkeil', 'Donnerkeil', 'elektro', 70, 0.95, 15, 'spark', { status: 'paralyse', chance: 0.1 }),
  M('gewitterzorn', 'Gewitterzorn', 'elektro', 95, 0.8, 10, 'spark', { status: 'paralyse', chance: 0.2 }),
  M('spannungsfeld', 'Spannungsfeld', 'elektro', 0, 0.9, 20, 'debuff', { status: 'paralyse', chance: 1, target: 'foe' }),
  M('sturmkrone', 'Sturmkrone', 'elektro', 110, 0.85, 5, 'spark', { status: 'paralyse', chance: 0.3 }),
  // gestein
  M('stein', 'Steinwurf', 'gestein', 45, 0.95, 25, 'rock'),
  M('felssturz', 'Felssturz', 'gestein', 70, 0.9, 15, 'rock'),
  M('kristallspeer', 'Kristallspeer', 'gestein', 90, 0.85, 10, 'rock', { crit: 0.15 }),
  M('steinpanzer', 'Steinpanzer', 'gestein', 0, 1, 15, 'buff', { stat: 'def', stages: 2, target: 'self' }),
  // flug
  M('fluegel', 'Windstoß', 'flug', 45, 1, 25, 'wind'),
  M('sturzflug', 'Sturzflug', 'flug', 70, 0.95, 15, 'wind'),
  M('orkan', 'Orkan', 'flug', 90, 0.85, 10, 'wind'),
  M('rueckenwind', 'Rückenwind', 'flug', 0, 1, 20, 'buff', { stat: 'speed', stages: 2, target: 'self' }),
  // geist
  M('spuk', 'Spukhauch', 'geist', 45, 1, 25, 'shadow'),
  M('schattenklaue', 'Schattenklaue', 'geist', 70, 0.95, 15, 'shadow', { crit: 0.15 }),
  M('albtraum', 'Albtraum', 'geist', 90, 0.9, 10, 'shadow'),
  M('schauderblick', 'Schauderblick', 'geist', 0, 1, 20, 'debuff', { stat: 'def', stages: -2, target: 'foe' }),
  M('mondschleier', 'Mondschleier', 'geist', 100, 0.9, 5, 'shadow', { stat: 'def', stages: 1, target: 'self', desc: 'Silbriger Schleier, der zugleich schützt.' }),
  // eis
  M('frosthauch', 'Frosthauch', 'eis', 45, 1, 25, 'ice', { status: 'frost', chance: 0.1 }),
  M('eissplitter', 'Eissplitter', 'eis', 65, 0.95, 20, 'ice'),
  M('blizzard', 'Blizzard', 'eis', 90, 0.8, 10, 'ice', { status: 'frost', chance: 0.15 }),
  M('raureif', 'Raureif', 'eis', 0, 1, 20, 'debuff', { stat: 'speed', stages: -2, target: 'foe' }),
  // erde
  M('schlammwurf', 'Schlammwurf', 'erde', 45, 1, 25, 'quake', { status: 'gift', chance: 0.2 }),
  M('erdstoss', 'Erdstoß', 'erde', 70, 0.95, 15, 'quake'),
  M('beben', 'Beben', 'erde', 95, 0.9, 10, 'quake'),
  M('sandschleier', 'Sandschleier', 'erde', 0, 1, 20, 'debuff', { stat: 'atk', stages: -1, target: 'foe' })
];

export const MOVES = Object.fromEntries(LIST.map(m => [m.id, m]));

// Per type: [starter move, mid move, strong move, status move]
export const TYPE_MOVESET = {
  normal: ['stoss', 'hieb', 'ansturm', 'bruellen'],
  feuer: ['glut', 'flammenrad', 'feuersturm', 'aufheizen'],
  wasser: ['spritzer', 'gischtwelle', 'flutstrahl', 'schaumschild'],
  pflanze: ['ranke', 'blattwirbel', 'bluetensturm', 'sporenwolke'],
  elektro: ['funken', 'donnerkeil', 'gewitterzorn', 'spannungsfeld'],
  gestein: ['stein', 'felssturz', 'kristallspeer', 'steinpanzer'],
  flug: ['fluegel', 'sturzflug', 'orkan', 'rueckenwind'],
  geist: ['spuk', 'schattenklaue', 'albtraum', 'schauderblick'],
  eis: ['frosthauch', 'eissplitter', 'blizzard', 'raureif'],
  erde: ['schlammwurf', 'erdstoss', 'beben', 'sandschleier']
};

export const STATUS = {
  brand: { name: 'Verbrannt', short: 'BRD', color: '#f07a3e' },
  gift: { name: 'Vergiftet', short: 'GFT', color: '#9b5bd1' },
  schlaf: { name: 'Schläft', short: 'SLF', color: '#8aa0b8' },
  paralyse: { name: 'Paralysiert', short: 'PAR', color: '#e9c43a' },
  frost: { name: 'Eingefroren', short: 'FRS', color: '#7fd6e8' }
};
