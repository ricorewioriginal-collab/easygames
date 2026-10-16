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
  M('sandschleier', 'Sandschleier', 'erde', 0, 1, 20, 'debuff', { stat: 'atk', stages: -1, target: 'foe' }),
  // expansion: a fuller progression per type (early, mid, late, finisher, utility)
  M('kratzer', 'Kratzer', 'normal', 40, 1, 35, 'slash', { desc: 'Schnelle Krallen.' }),
  M('kopfnuss', 'Kopfnuss', 'normal', 80, 0.95, 15, 'impact', { desc: 'Ein harter Kopfstoß.' }),
  M('gaehnen', 'Gähnen', 'normal', 0, 0.6, 10, 'debuff', { status: 'schlaf', chance: 1, target: 'foe', desc: 'Ansteckendes Gähnen, das einschläfern kann.' }),
  M('gigastoss', 'Gigastoß', 'normal', 120, 0.85, 5, 'impact', { recoil: 0.25, desc: 'Alles auf eine Karte. Trifft auch den Anwender.' }),
  M('flammenbiss', 'Flammenbiss', 'feuer', 60, 1, 20, 'flame', { status: 'brand', chance: 0.1, crit: 0.1 }),
  M('lavawoge', 'Lavawoge', 'feuer', 105, 0.88, 6, 'flame', { status: 'brand', chance: 0.3, desc: 'Eine Welle aus glühendem Gestein.' }),
  M('blubberstrahl', 'Blubberstrahl', 'wasser', 55, 1, 25, 'water'),
  M('aquaschweif', 'Aquaschweif', 'wasser', 80, 0.95, 12, 'water'),
  M('springflut', 'Springflut', 'wasser', 110, 0.85, 5, 'water', { desc: 'Eine gewaltige Flutwelle.' }),
  M('rasierblatt', 'Rasierblatt', 'pflanze', 55, 0.95, 25, 'leaf', { crit: 0.2 }),
  M('lichtsammler', 'Lichtsammler', 'pflanze', 0, 1, 10, 'heal', { heal: 0.5, target: 'self', desc: 'Sammelt Sonnenlicht und heilt die Hälfte der KP.' }),
  M('sonnenspross', 'Sonnenspross', 'pflanze', 110, 0.9, 5, 'leaf', { desc: 'Ein gebündelter Strahl aus Sonnenlicht.' }),
  M('funkenbiss', 'Funkenbiss', 'elektro', 60, 1, 20, 'spark', { status: 'paralyse', chance: 0.15 }),
  M('magnetfeld', 'Magnetfeld', 'elektro', 0, 1, 20, 'buff', { stat: 'speed', stages: 2, target: 'self' }),
  M('kieselhagel', 'Kieselhagel', 'gestein', 55, 0.95, 20, 'rock'),
  M('meteorbrocken', 'Meteorbrocken', 'gestein', 110, 0.85, 5, 'rock', { desc: 'Ein glühender Brocken fällt vom Himmel.' }),
  M('flatterhieb', 'Flatterhieb', 'flug', 55, 1, 25, 'wind'),
  M('luftschnitt', 'Luftschnitt', 'flug', 75, 0.95, 15, 'wind', { crit: 0.15 }),
  M('himmelssturz', 'Himmelssturz', 'flug', 110, 0.85, 5, 'wind', { recoil: 0.2 }),
  M('nachtschatten', 'Nachtschatten', 'geist', 60, 1, 15, 'shadow'),
  M('seelenraub', 'Seelenraub', 'geist', 75, 1, 10, 'shadow', { drain: 0.5, desc: 'Entzieht Lebenskraft und heilt den Anwender.' }),
  M('eiszahn', 'Eiszahn', 'eis', 60, 0.95, 20, 'ice', { status: 'frost', chance: 0.1 }),
  M('gletscherhieb', 'Gletscherhieb', 'eis', 85, 0.9, 12, 'ice'),
  M('eisschild', 'Eisschild', 'eis', 0, 1, 20, 'buff', { stat: 'def', stages: 2, target: 'self' }),
  M('sandwirbel', 'Sandwirbel', 'erde', 55, 1, 25, 'quake'),
  M('erdkralle', 'Erdkralle', 'erde', 75, 0.95, 15, 'quake', { crit: 0.15 }),
  M('tektonik', 'Tektonik', 'erde', 110, 0.85, 5, 'quake', { desc: 'Die Erdplatten selbst geraten in Bewegung.' })
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

// Level-up progression per type: [level, move]. Early, mid and late attacks
// plus the type's support moves. Used by learnset() in species.js.
export const TYPE_LEARN = {
  normal: [[1, 'kratzer'], [6, 'bruellen'], [11, 'hieb'], [17, 'konzentration'], [23, 'kopfnuss'], [31, 'ansturm'], [38, 'gaehnen'], [45, 'gigastoss']],
  feuer: [[1, 'glut'], [6, 'aufheizen'], [10, 'flammenbiss'], [16, 'flammenrad'], [29, 'feuersturm'], [42, 'lavawoge']],
  wasser: [[1, 'spritzer'], [6, 'schaumschild'], [10, 'blubberstrahl'], [16, 'gischtwelle'], [24, 'aquaschweif'], [32, 'flutstrahl'], [44, 'springflut']],
  pflanze: [[1, 'ranke'], [6, 'sporenwolke'], [10, 'rasierblatt'], [16, 'blattwirbel'], [22, 'saugwurzel'], [30, 'bluetensturm'], [36, 'lichtsammler'], [44, 'sonnenspross']],
  elektro: [[1, 'funken'], [6, 'spannungsfeld'], [10, 'funkenbiss'], [17, 'donnerkeil'], [26, 'magnetfeld'], [32, 'gewitterzorn']],
  gestein: [[1, 'stein'], [6, 'steinpanzer'], [10, 'kieselhagel'], [17, 'felssturz'], [29, 'kristallspeer'], [43, 'meteorbrocken']],
  flug: [[1, 'fluegel'], [6, 'rueckenwind'], [10, 'flatterhieb'], [16, 'sturzflug'], [24, 'luftschnitt'], [31, 'orkan'], [44, 'himmelssturz']],
  geist: [[1, 'spuk'], [6, 'schauderblick'], [10, 'nachtschatten'], [17, 'schattenklaue'], [25, 'seelenraub'], [32, 'albtraum']],
  eis: [[1, 'frosthauch'], [6, 'raureif'], [10, 'eiszahn'], [16, 'eissplitter'], [24, 'eisschild'], [28, 'gletscherhieb'], [34, 'blizzard']],
  erde: [[1, 'schlammwurf'], [6, 'sandschleier'], [10, 'sandwirbel'], [17, 'erdstoss'], [24, 'erdkralle'], [32, 'beben'], [44, 'tektonik']]
};

export const STATUS = {
  brand: { name: 'Verbrannt', short: 'BRD', color: '#f07a3e' },
  gift: { name: 'Vergiftet', short: 'GFT', color: '#9b5bd1' },
  schlaf: { name: 'Schläft', short: 'SLF', color: '#8aa0b8' },
  paralyse: { name: 'Paralysiert', short: 'PAR', color: '#e9c43a' },
  frost: { name: 'Eingefroren', short: 'FRS', color: '#7fd6e8' }
};
