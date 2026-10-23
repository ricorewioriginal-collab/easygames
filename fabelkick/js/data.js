/* FABELKICK 3D – Teams, Arenen und Einstellungen */
'use strict';
window.FK = window.FK || {};

FK.TEAMS = [
  { id: 'affen', name: 'Urwald-Affen', short: 'AFF', species: 'ape', icon: '🐒',
    kit: { shirt: '#f4c430', shorts: '#1f6b3a', socks: '#f4c430', trim: '#1f6b3a' },
    stats: { tempo: 90, schuss: 72, pass: 82, abwehr: 64, tw: 70 },
    special: { id: 'sprint', name: 'Lianen-Sprint', desc: 'Das ganze Team rennt 6 Sekunden lang viel schneller.' },
    motto: 'Flink, frech und immer am Ball.',
    names: ['Bobo', 'Kiki', 'Banu', 'Momo', 'Tiko', 'Lumi', 'Pako', 'Chico', 'Mango', 'Bongo', 'Jojo'] },
  { id: 'gorillas', name: 'Silberrücken', short: 'SIL', species: 'gorilla', icon: '🦍',
    kit: { shirt: '#20232b', shorts: '#c9ced8', socks: '#20232b', trim: '#c9ced8' },
    stats: { tempo: 70, schuss: 84, pass: 70, abwehr: 86, tw: 78 },
    special: { id: 'roar', name: 'Brustklopfen', desc: 'Lautes Trommeln: Die Gegner werden 4 Sekunden lang langsamer.' },
    motto: 'Stark wie ein Baum, ruhig wie ein Berg.',
    names: ['Brutus', 'Koba', 'Magnus', 'Grom', 'Bruno', 'Titan', 'Odo', 'Rokko', 'Ural', 'Bastus', 'Gonzo'] },
  { id: 'orks', name: 'Ork-Brecher', short: 'ORK', species: 'orc', icon: '👹',
    kit: { shirt: '#b3201c', shorts: '#151515', socks: '#151515', trim: '#ffb000' },
    stats: { tempo: 74, schuss: 90, pass: 64, abwehr: 80, tw: 68 },
    special: { id: 'thunder', name: 'Donnerschuss', desc: 'Der nächste Schuss ist blitzschnell und kaum zu halten.' },
    motto: 'Erst schießen, dann fragen.',
    names: ['Grushnak', 'Murzog', 'Brakk', 'Zogg', 'Krashna', 'Thrak', 'Dragnok', 'Urzul', 'Skarr', 'Bolgrim', 'Hrumm'] },
  { id: 'elfen', name: 'Elfenhain', short: 'ELF', species: 'elf', icon: '🧝',
    kit: { shirt: '#f2f6f4', shorts: '#16877a', socks: '#16877a', trim: '#d4af37' },
    stats: { tempo: 84, schuss: 76, pass: 92, abwehr: 62, tw: 74 },
    special: { id: 'magic', name: 'Zauberschuss', desc: 'Der nächste Schuss fliegt im Bogen um den Torwart herum.' },
    motto: 'Der Ball gehorcht dem Lied des Waldes.',
    names: ['Aelion', 'Sylvar', 'Miravel', 'Faelith', 'Ilyra', 'Caelum', 'Nimwe', 'Arion', 'Liora', 'Vaelis', 'Thessa'] },
  { id: 'zwerge', name: 'Zwergenhammer', short: 'ZWG', species: 'dwarf', icon: '⛏️',
    kit: { shirt: '#2b4fa8', shorts: '#8a4b20', socks: '#2b4fa8', trim: '#ffd25a' },
    stats: { tempo: 62, schuss: 80, pass: 74, abwehr: 88, tw: 90 },
    special: { id: 'wall', name: 'Steinwall', desc: 'Der Torwart wird 12 Sekunden lang zum Felsen und hält fast alles.' },
    motto: 'Klein, zäh und unverrückbar.',
    names: ['Borin', 'Thrudi', 'Grimbart', 'Dwalor', 'Balgrim', 'Hamrik', 'Brundo', 'Torvi', 'Ognar', 'Fendrik', 'Rurik'] },
  { id: 'trolle', name: 'Trollbrücke', short: 'TRL', species: 'troll', icon: '🪨',
    kit: { shirt: '#6a3fa0', shorts: '#2e2440', socks: '#6a3fa0', trim: '#9be15d' },
    stats: { tempo: 66, schuss: 82, pass: 66, abwehr: 84, tw: 76 },
    special: { id: 'stone', name: 'Steinhaut', desc: '8 Sekunden lang kann dem Team niemand den Ball abnehmen.' },
    motto: 'Wer über die Brücke will, muss an uns vorbei.',
    names: ['Grumpel', 'Moosbart', 'Knorz', 'Brocken', 'Felsgrim', 'Klotz', 'Wurzel', 'Rumpel', 'Granitz', 'Bröselbert', 'Stumpf'] },
  { id: 'drachen', name: 'Drachenbrut', short: 'DRA', species: 'lizard', icon: '🐉',
    kit: { shirt: '#ff7a00', shorts: '#3a1006', socks: '#ff7a00', trim: '#ffe066' },
    stats: { tempo: 82, schuss: 86, pass: 72, abwehr: 70, tw: 72 },
    special: { id: 'fire', name: 'Feuerball', desc: 'Der nächste Schuss brennt: Der Torwart kann ihn nicht festhalten.' },
    motto: 'Heiß auf jeden Ball.',
    names: ['Zyrax', 'Skarlo', 'Vexa', 'Pyros', 'Ignis', 'Rhazz', 'Kyra', 'Draxo', 'Ember', 'Tirak', 'Sazz'] },
  { id: 'yetis', name: 'Frostpranken', short: 'YET', species: 'yeti', icon: '❄️',
    kit: { shirt: '#3fa9f5', shorts: '#ffffff', socks: '#3fa9f5', trim: '#0b3b66' },
    stats: { tempo: 72, schuss: 78, pass: 76, abwehr: 82, tw: 84 },
    special: { id: 'freeze', name: 'Eiszeit', desc: 'Die Gegner frieren 2,5 Sekunden lang fast ein.' },
    motto: 'Cool bleiben, auch im Endspiel.',
    names: ['Yuki', 'Blizz', 'Frosto', 'Nanuk', 'Kalle', 'Sturmi', 'Eisbert', 'Polar', 'Flocke', 'Gletscha', 'Tundro'] }
];

FK.rating = t => Math.round((t.stats.tempo + t.stats.schuss + t.stats.pass + t.stats.abwehr + t.stats.tw) / 5);

// Körperbau der Fantasy-Völker
FK.SPECIES = {
  ape:     { scale: 0.96, w: 1.05, head: 1.12, arm: 1.32, fur: '#5b3a22', face: '#d2a77c', feats: ['muzzle', 'roundEars', 'brow'] },
  gorilla: { scale: 1.06, w: 1.38, head: 1.08, arm: 1.42, fur: '#26262b', face: '#55555e', feats: ['muzzle', 'brow', 'crest'] },
  orc:     { scale: 1.04, w: 1.26, head: 1.04, arm: 1.1, fur: '#5f8f3a', face: '#5f8f3a', feats: ['tusks', 'pointEars', 'brow', 'topknot'] },
  elf:     { scale: 1.08, w: 0.86, head: 0.95, arm: 1.0, fur: '#f0d2b6', face: '#f0d2b6', feats: ['longEars', 'hair'], hair: '#efe6b8' },
  dwarf:   { scale: 0.8, w: 1.32, head: 1.24, arm: 0.95, fur: '#e2ac86', face: '#e2ac86', feats: ['beard', 'helmet'], hair: '#b8562b' },
  troll:   { scale: 1.14, w: 1.3, head: 1.0, arm: 1.3, fur: '#7d8ba1', face: '#7d8ba1', feats: ['bigNose', 'smallEars', 'moss'] },
  lizard:  { scale: 1.0, w: 1.0, head: 1.0, arm: 1.0, fur: '#2f8f4e', face: '#4fbf6e', feats: ['snout', 'horns', 'tail', 'crestSpikes'] },
  yeti:    { scale: 1.12, w: 1.36, head: 1.14, arm: 1.3, fur: '#eef2f8', face: '#8fb2d6', feats: ['muzzle', 'horns', 'furHead'] }
};

FK.ARENAS = [
  { id: 'dschungel', name: 'Dschungel-Arena', desc: 'Sonnige Arena zwischen Riesenbäumen', night: false,
    sky: ['#5fb8ff', '#cfe9ff', '#ffe9c4'], sun: '#fff1d6', sunI: 2.2, hemi: ['#d9efff', '#3a5a2a'], hemiI: 0.75,
    grass: ['#3f9a3a', '#378a33'], outer: '#2d6d2a', fog: '#cfe9ff', decor: 'trees', stand: '#2c3440', glow: '#ffe28a' },
  { id: 'kristall', name: 'Mondkristall-Stadion', desc: 'Flutlicht, zwei Monde und leuchtende Kristalle', night: true,
    sky: ['#05061a', '#151a46', '#2b2f6e'], sun: '#a9c4ff', sunI: 1.6, hemi: ['#5468c4', '#101830'], hemiI: 0.55,
    grass: ['#2f8a49', '#287a40'], outer: '#163a2a', fog: '#151a46', decor: 'crystals', stand: '#1c2036', glow: '#7ef9ff' },
  { id: 'vulkan', name: 'Vulkan-Kessel', desc: 'Abendrot, Lavaflüsse und schwebende Felsen', night: false,
    sky: ['#2a0f2e', '#a8364a', '#ff9a4a'], sun: '#ffb27a', sunI: 1.9, hemi: ['#ffb08a', '#3a1a12'], hemiI: 0.6,
    grass: ['#4a9338', '#41842f'], outer: '#3b2a1c', fog: '#a8364a', decor: 'volcano', stand: '#2a1d22', glow: '#ff6a2a' }
];

FK.DIFFS = [
  { id: 0, name: 'Amateur', ai: 0.72, react: 0.42, acc: 0.6, gk: 0.62, press: 0.55 },
  { id: 1, name: 'Profi', ai: 0.86, react: 0.28, acc: 0.78, gk: 0.78, press: 0.8 },
  { id: 2, name: 'Weltklasse', ai: 0.97, react: 0.18, acc: 0.9, gk: 0.9, press: 1.0 },
  { id: 3, name: 'Legende', ai: 1.05, react: 0.1, acc: 1.0, gk: 1.0, press: 1.2 }
];

FK.TIPS = [
  'Halte die Schuss-Taste länger gedrückt für mehr Kraft, aber nicht zu lange, sonst fliegt der Ball drüber.',
  'Mit dem Steilpass schickst du deinen Stürmer in den freien Raum.',
  'Die Fabel-Kraft füllt sich mit Pässen und Zweikämpfen. Ist sie voll, löst du die Spezialfähigkeit deines Teams aus.',
  'Grätschen von hinten geben Freistoß, im Strafraum sogar Elfmeter.',
  'Sprinten kostet Ausdauer. Der grüne Balken zeigt, wie viel noch übrig ist.',
  'Flanken (Lupfer) aus dem Halbfeld finden den Kopf deiner Stürmer.',
  'Beim Elfmeter bestimmt der Stick die Ecke. Zu viel Kraft heißt: Ball in den Himmel.',
  'Im Training kannst du alles in Ruhe gegen den Torwart üben.'
];

FK.SETTINGS_KEY = 'easygames.fabelkick.v1.settings';
FK.SAVE_KEY = 'easygames.fabelkick.v1';
FK.defaultSettings = () => ({ half: 3, diff: 1, gfx: 'auto', cam: 'tv', sound: true, music: true, vibe: true, arena: 'dschungel', radar: true });

FK.loadJSON = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? Object.assign(d, v) : d; } catch (e) { return d; } };
FK.saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat/voll */ } };
FK.settings = FK.loadJSON(FK.SETTINGS_KEY, FK.defaultSettings());
FK.save = FK.loadJSON(FK.SAVE_KEY, { wins: 0, draws: 0, losses: 0, goals: 0, cups: 0, games: 0, best: 0, cup: null });
FK.persist = () => { FK.saveJSON(FK.SAVE_KEY, FK.save); FK.saveJSON(FK.SETTINGS_KEY, FK.settings); };
FK.teamById = id => FK.TEAMS.find(t => t.id === id) || FK.TEAMS[0];
FK.arenaById = id => FK.ARENAS.find(a => a.id === id) || FK.ARENAS[0];
